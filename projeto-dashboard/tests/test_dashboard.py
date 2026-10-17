"""Testes independentes da preparação e do dashboard estático da papelaria."""

from __future__ import annotations

import csv
import hashlib
import importlib.util
import json
import os
import shutil
import socket
import subprocess
import tempfile
import threading
import time
import unittest
import urllib.error
import urllib.request
from collections import Counter, defaultdict
from datetime import date
from decimal import Decimal
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
PROJECT = ROOT / "projeto-dashboard"
SITE = PROJECT / "site"
TESTS = PROJECT / "tests"
SOURCE = ROOT / "papelaria_limpa.csv"
DATA_FILE = SITE / "data.json"
EXPECTED_COLUMNS = [
    "id_venda", "data", "cidade", "categoria", "produto", "quantidade",
    "preco_unitario", "forma_pagamento", "valor_venda",
]


def load_csv():
    with SOURCE.open(encoding="utf-8-sig", newline="") as arquivo:
        return list(csv.DictReader(arquivo))


def cents(value: str | int | float) -> int:
    return int((Decimal(str(value)) * 100).quantize(Decimal("1")))


def brl_from_cents(value: int) -> str:
    return ("R$ " + f"{value / 100:,.2f}").replace(",", "X").replace(".", ",").replace("X", ".")


def independent_summary(rows, key):
    sums = defaultdict(int)
    for row in rows:
        sums[row[key]] += cents(row["valor_venda"])
    return sorted(sums.items(), key=lambda pair: (-pair[1], pair[0]))


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, _format, *_args):
        pass


class DashboardTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        handler = lambda *args, **kwargs: QuietHandler(*args, directory=str(SITE), **kwargs)
        cls.httpd = ThreadingHTTPServer(("127.0.0.1", 0), handler)
        cls.base_url = f"http://127.0.0.1:{cls.httpd.server_port}"
        cls.server_thread = threading.Thread(target=cls.httpd.serve_forever, daemon=True)
        cls.server_thread.start()
        cls.source_rows = load_csv()
        cls.package = json.loads(DATA_FILE.read_text(encoding="utf-8"))

    @classmethod
    def tearDownClass(cls):
        cls.httpd.shutdown()
        cls.httpd.server_close()

    def test_original_source_schema_types_nulls_ids_and_duplicate_policy(self):
        self.assertEqual(hashlib.sha256(SOURCE.read_bytes()).hexdigest().upper(), "698BB401D35C644C9B4F9414B96D3236E02EBCA6E0878CDD51C12B6EF259C2AD")
        rows = self.source_rows
        self.assertEqual(list(rows[0]), EXPECTED_COLUMNS)
        self.assertEqual(len(rows), 180)
        self.assertTrue(all(all(value is not None and value.strip() for value in row.values()) for row in rows))
        ids = [row["id_venda"] for row in rows]
        self.assertEqual(len(ids), len(set(ids)), "IDs de venda devem ser únicos; não remova duplicatas silenciosamente")
        self.assertEqual(len(rows), len({tuple(row[column] for column in EXPECTED_COLUMNS) for row in rows}))
        for row in rows:
            self.assertRegex(row["id_venda"], r"^V\d{4}$")
            self.assertEqual(date.fromisoformat(row["data"]).isoformat(), row["data"])
            self.assertGreater(int(row["quantidade"]), 0)
            self.assertGreaterEqual(Decimal(row["preco_unitario"]), 0)
            self.assertEqual(cents(row["valor_venda"]), int(row["quantidade"]) * cents(row["preco_unitario"]))

        # Confere a política documentada: IDs repetidos causam erro, não deduplicação.
        spec = importlib.util.spec_from_file_location("preparar_dados_teste", PROJECT / "preparar_dados.py")
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        import pandas as pd

        fixture = pd.DataFrame([
            ["V0001", "2026-01-01", "Campinas", "Livros", "Livro", 1, 10, "Dinheiro", 10],
            ["V0001", "2026-01-02", "Santos", "Livros", "Outro livro", 1, 20, "Cartão", 20],
        ], columns=EXPECTED_COLUMNS)
        with self.assertRaisesRegex(ValueError, "IDs de venda repetidos; nenhuma linha foi removida"):
            module.validar(fixture)
        self.assertEqual(len(fixture), 2)

    def test_data_json_preserves_source_records_and_declared_types(self):
        package = self.package
        self.assertEqual(package["fonte"], SOURCE.name)
        self.assertEqual(package["colunas"], EXPECTED_COLUMNS)
        exported = package["registros"]
        self.assertEqual(len(exported), len(self.source_rows))
        for source, record in zip(self.source_rows, exported):
            self.assertEqual(set(record), set(EXPECTED_COLUMNS))
            for column in ("id_venda", "data", "cidade", "categoria", "produto", "forma_pagamento"):
                self.assertIsInstance(record[column], str, column)
                self.assertEqual(record[column], source[column], column)
            self.assertIsInstance(record["quantidade"], int)
            self.assertNotIsInstance(record["quantidade"], bool)
            for column in ("preco_unitario", "valor_venda"):
                self.assertIsInstance(record[column], (int, float))
                self.assertNotIsInstance(record[column], bool)
                self.assertTrue(abs(Decimal(str(record[column])) - Decimal(source[column])) < Decimal("0.000001"))
            self.assertFalse(any(value is None for value in record.values()))

    def test_totals_and_groupings_are_recalculated_independently(self):
        rows = self.source_rows
        summary = self.package["resumo"]
        independently_calculated = sum(cents(row["valor_venda"]) for row in rows)
        self.assertEqual(independently_calculated, 2_005_900)
        self.assertEqual(summary["quantidade_registros"], len(rows))
        self.assertEqual(cents(summary["total_vendido"]), independently_calculated)
        self.assertEqual(cents(summary["ticket_medio"]), round(independently_calculated / len(rows)))

        for field, source_field, known in (
            ("categorias", "categoria", [("Acessórios", 1_051_700), ("Livros", 743_800), ("Papelaria", 210_400)]),
            ("cidades", "cidade", [("Campinas", 857_800), ("Santos", 693_750), ("Sorocaba", 454_350)]),
        ):
            result = [(item[source_field], cents(item["valor_venda"])) for item in summary[field]]
            self.assertEqual(independent_summary(rows, source_field), known)
            self.assertEqual(result, known)
            self.assertEqual(sum(amount for _label, amount in result), independently_calculated)

        monthly = defaultdict(lambda: [0, 0])
        products = defaultdict(int)
        for row in rows:
            month = row["data"][:7]
            monthly[month][0] += cents(row["valor_venda"])
            monthly[month][1] += 1
            products[row["produto"]] += cents(row["valor_venda"])
        self.assertEqual(
            dict(monthly),
            {"2026-01": [623_500, 62], "2026-02": [618_100, 56], "2026-03": [764_300, 62]},
        )
        self.assertEqual(
            sorted(products.items(), key=lambda pair: (-pair[1], pair[0])),
            [("Mochila", 807_500), ("Livro de aventuras", 457_800), ("Livro de receitas", 286_000),
             ("Estojo", 244_200), ("Caderno", 178_200), ("Caneta", 32_200)],
        )

    def test_small_known_example_uses_documented_sale_definition(self):
        example = [
            {"categoria": "Livros", "quantidade": 2, "preco_unitario": "12.50"},
            {"categoria": "Papelaria", "quantidade": 3, "preco_unitario": "4.00"},
            {"categoria": "Livros", "quantidade": 1, "preco_unitario": "7.00"},
        ]
        amounts = [int(row["quantidade"]) * cents(row["preco_unitario"]) for row in example]
        groups = defaultdict(int)
        for row, amount in zip(example, amounts):
            groups[row["categoria"]] += amount
        self.assertEqual(amounts, [2_500, 1_200, 700])
        self.assertEqual(sum(amounts), 4_400)
        self.assertEqual(round(sum(amounts) / len(amounts)), 1_467)
        self.assertEqual(dict(groups), {"Livros": 3_200, "Papelaria": 1_200})

    def test_static_http_serves_site_and_all_referenced_assets(self):
        with urllib.request.urlopen(self.base_url + "/", timeout=5) as response:
            html = response.read().decode("utf-8")
            self.assertEqual(response.status, 200)
        self.assertIn("Vendas da papelaria", html)
        for asset in ("/styles.css", "/app.js", "/data.json", "/favicon.svg"):
            with urllib.request.urlopen(self.base_url + asset, timeout=5) as response:
                self.assertEqual(response.status, 200, asset)
                self.assertGreater(len(response.read()), 0, asset)
        try:
            urllib.request.urlopen(self.base_url + "/asset-que-nao-existe", timeout=5)
        except urllib.error.HTTPError as missing:
            self.assertEqual(missing.code, 404)
            missing.close()
        else:
            self.fail("Arquivo inexistente deveria retornar HTTP 404")

    def test_javascript_syntax(self):
        node = shutil.which("node")
        self.assertIsNotNone(node, "Node.js não encontrado; verificação de sintaxe pendente")
        for script in (SITE / "app.js", TESTS / "browser_test.js"):
            with self.subTest(script=script.name):
                result = subprocess.run([node, "--check", str(script)], text=True, capture_output=True, timeout=20)
                self.assertEqual(result.returncode, 0, result.stderr)

    def test_real_browser_interactions_keyboard_responsiveness_and_console(self):
        chrome_candidates = [
            shutil.which("chrome"), shutil.which("msedge"),
            r"C:\Program Files\Google\Chrome\Application\chrome.exe",
            r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
        ]
        chrome = next((path for path in chrome_candidates if path and Path(path).is_file()), None)
        node = shutil.which("node")
        if not chrome or not node:
            self.skipTest("PENDENTE: navegador Chromium ou Node.js não disponível")

        with socket.socket() as sock:
            sock.bind(("127.0.0.1", 0))
            debug_port = sock.getsockname()[1]
        with tempfile.TemporaryDirectory(prefix="dashboard-chrome-") as profile:
            process = subprocess.Popen(
                [chrome, "--headless=new", "--no-first-run", "--no-default-browser-check",
                 "--disable-gpu", "--no-sandbox", "--remote-allow-origins=*",
                 f"--remote-debugging-port={debug_port}", f"--user-data-dir={profile}", "about:blank"],
                stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
            )
            try:
                endpoint = f"http://127.0.0.1:{debug_port}/json/version"
                deadline = time.monotonic() + 20
                while time.monotonic() < deadline:
                    if process.poll() is not None:
                        self.fail(f"Chromium encerrou antes do teste (código {process.returncode})")
                    try:
                        with urllib.request.urlopen(endpoint, timeout=1):
                            break
                    except Exception:
                        time.sleep(0.2)
                else:
                    self.fail("Chromium não abriu a interface de depuração remota")

                result = subprocess.run(
                    [node, str(TESTS / "browser_test.js"), self.base_url + "/", str(debug_port), str(DATA_FILE), str(SOURCE)],
                    text=True, capture_output=True, timeout=180,
                )
                self.assertEqual(result.returncode, 0, result.stdout + "\n" + result.stderr)
                self.assertIn("BROWSER_TEST_RESULT=PASS", result.stdout)
                evidence_path = TESTS / "browser-evidence.json"
                self.assertTrue(evidence_path.is_file(), "O helper deve registrar evidência reproduzível")
                evidence = json.loads(evidence_path.read_text(encoding="utf-8"))
                self.assertEqual(evidence["result"], "PASS")
                self.assertEqual(evidence["runtimeErrors"], [])
                self.assertEqual(evidence["tableRowsInitial"], 180)
                for case in ("isolated-filters", "combined-filters", "real-empty", "clear",
                             "monthly-selection", "comparisons", "pareto", "drilldown-mouse",
                             "drilldown-keyboard", "hover", "responsive",
                             "selected-empty-month-after-dimension-filters"):
                    with self.subTest(browser_case=case):
                        self.assertIn(case, evidence["cases"])
                self.assertEqual(
                    [(viewport["width"], viewport["height"]) for viewport in evidence["viewports"]],
                    [(390, 844), (1440, 900)],
                )
            finally:
                process.terminate()
                try:
                    process.wait(timeout=5)
                except subprocess.TimeoutExpired:
                    process.kill()
                    process.wait(timeout=5)


if __name__ == "__main__":
    unittest.main(verbosity=2)
