"""Valida papelaria_limpa.csv e gera o JSON consumido pelo site estático."""

from __future__ import annotations

import json
import math
from pathlib import Path

import pandas as pd


PASTA_PROJETO = Path(__file__).resolve().parent
ARQUIVO_FONTE = PASTA_PROJETO.parent / "papelaria_limpa.csv"
ARQUIVO_SAIDA = PASTA_PROJETO / "site" / "data.json"

COLUNAS_ESPERADAS = [
    "id_venda",
    "data",
    "cidade",
    "categoria",
    "produto",
    "quantidade",
    "preco_unitario",
    "forma_pagamento",
    "valor_venda",
]
COLUNAS_TEXTO = [
    "id_venda",
    "data",
    "cidade",
    "categoria",
    "produto",
    "forma_pagamento",
]
COLUNAS_NUMERICAS = ["quantidade", "preco_unitario", "valor_venda"]


def validar(dados: pd.DataFrame) -> pd.DataFrame:
    """Valida sem descartar, corrigir ou deduplicar linhas."""
    if list(dados.columns) != COLUNAS_ESPERADAS:
        raise ValueError(
            "Colunas inesperadas. Esperadas, na ordem: "
            + ", ".join(COLUNAS_ESPERADAS)
        )
    if dados.empty:
        raise ValueError("A fonte não contém vendas.")
    if dados.isna().any().any():
        faltantes = dados.columns[dados.isna().any()].tolist()
        raise ValueError(f"Há valores ausentes nas colunas: {faltantes}")

    for coluna in COLUNAS_TEXTO:
        dados[coluna] = dados[coluna].astype("string")
        if dados[coluna].str.strip().eq("").any():
            raise ValueError(f"Há texto vazio na coluna {coluna}.")

    if dados["id_venda"].duplicated().any():
        repetidos = dados.loc[dados["id_venda"].duplicated(False), "id_venda"]
        raise ValueError(
            "IDs de venda repetidos; nenhuma linha foi removida: "
            + ", ".join(repetidos.astype(str).unique())
        )
    if dados.duplicated().any():
        raise ValueError("Há linhas duplicadas; nenhuma linha foi removida.")

    dados["data"] = pd.to_datetime(dados["data"], format="%Y-%m-%d", errors="raise")
    if dados["data"].isna().any():
        raise ValueError("Há datas ausentes ou inválidas.")

    for coluna in COLUNAS_NUMERICAS:
        dados[coluna] = pd.to_numeric(dados[coluna], errors="raise")
        if not all(math.isfinite(float(valor)) for valor in dados[coluna]):
            raise ValueError(f"Há valor não finito na coluna {coluna}.")
    if (dados["quantidade"] <= 0).any() or not (dados["quantidade"] % 1 == 0).all():
        raise ValueError("Quantidade deve ser um número inteiro positivo.")
    if (dados["preco_unitario"] < 0).any() or (dados["valor_venda"] < 0).any():
        raise ValueError("Preço unitário e valor da venda não podem ser negativos.")

    valor_calculado = dados["quantidade"] * dados["preco_unitario"]
    divergentes = ~((dados["valor_venda"] - valor_calculado).abs() < 1e-9)
    if divergentes.any():
        ids = dados.loc[divergentes, "id_venda"].astype(str).tolist()
        raise ValueError(f"valor_venda não confere com quantidade × preço: {ids}")
    return dados


def registros_json(dados: pd.DataFrame) -> list[dict[str, object]]:
    registros: list[dict[str, object]] = []
    for linha in dados.itertuples(index=False, name=None):
        registro = dict(zip(COLUNAS_ESPERADAS, linha))
        registro["data"] = pd.Timestamp(registro["data"]).strftime("%Y-%m-%d")
        registro["quantidade"] = int(registro["quantidade"])
        for coluna in ("preco_unitario", "valor_venda"):
            registro[coluna] = float(registro[coluna])
        registros.append(registro)
    return registros


def resumir(dados: pd.DataFrame) -> dict[str, object]:
    def totais_por(coluna: str) -> list[dict[str, object]]:
        agrupado = (
            dados.groupby(coluna, as_index=False, sort=True)["valor_venda"]
            .sum()
            .sort_values("valor_venda", ascending=False, kind="stable")
        )
        return [
            {coluna: str(linha[coluna]), "valor_venda": float(linha["valor_venda"])}
            for _, linha in agrupado.iterrows()
        ]

    total = float(dados["valor_venda"].sum())
    return {
        "quantidade_registros": int(len(dados)),
        "total_vendido": total,
        "ticket_medio": total / len(dados),
        "categorias": totais_por("categoria"),
        "cidades": totais_por("cidade"),
    }


def formatar_reais(valor: float) -> str:
    numero = f"{valor:,.2f}"
    return "R$ " + numero.replace(",", "X").replace(".", ",").replace("X", ".")


def main() -> None:
    if not ARQUIVO_FONTE.is_file():
        raise FileNotFoundError(f"CSV de origem não encontrado: {ARQUIVO_FONTE}")

    dados = pd.read_csv(ARQUIVO_FONTE, dtype={coluna: "string" for coluna in COLUNAS_TEXTO})
    dados = validar(dados)
    pacote = {
        "fonte": "papelaria_limpa.csv",
        "colunas": COLUNAS_ESPERADAS,
        "resumo": resumir(dados),
        "registros": registros_json(dados),
    }
    ARQUIVO_SAIDA.parent.mkdir(parents=True, exist_ok=True)
    ARQUIVO_SAIDA.write_text(
        json.dumps(pacote, ensure_ascii=False, indent=2, allow_nan=False) + "\n",
        encoding="utf-8",
    )
    resumo = pacote["resumo"]
    print(f"Fonte validada sem descartar linhas: {len(dados)} registros.")
    print(f"JSON gerado: {ARQUIVO_SAIDA}")
    print(
        "Total vendido: {} | vendas: {} | ticket médio: {}".format(
            formatar_reais(resumo["total_vendido"]),
            resumo["quantidade_registros"],
            formatar_reais(resumo["ticket_medio"]),
        )
    )


if __name__ == "__main__":
    main()
