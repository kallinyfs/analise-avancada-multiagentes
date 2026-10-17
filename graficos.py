"""Gera graficos de valor vendido por categoria e por cidade."""

from pathlib import Path

import matplotlib

matplotlib.use("Agg")

import matplotlib.pyplot as plt
import matplotlib.ticker as mticker
import pandas as pd


PASTA = Path(__file__).resolve().parent
ARQUIVO_DADOS = PASTA / "papelaria_limpa.csv"


def formatar_reais(valor: float) -> str:
    """Formata um numero como moeda brasileira (R$ 1.234,56)."""
    formatado = f"{valor:,.2f}"
    formatado = formatado.replace(",", "X").replace(".", ",").replace("X", ".")
    return f"R$ {formatado}"


def criar_grafico(coluna: str, titulo: str, nome_arquivo: str) -> None:
    totais = (
        dados.groupby(coluna, as_index=False)["valor_venda"]
        .sum()
        .sort_values("valor_venda", ascending=False)
    )

    fig, ax = plt.subplots(figsize=(8, 5))
    barras = ax.bar(
        totais[coluna],
        totais["valor_venda"],
        color="#4C72B0",
        width=0.65,
    )

    ax.set_title(titulo, fontsize=14, fontweight="bold", pad=14)
    ax.set_xlabel(coluna.capitalize())
    ax.set_ylabel("Valor vendido (R$)")
    ax.yaxis.set_major_formatter(
        mticker.FuncFormatter(lambda valor, _: formatar_reais(valor))
    )
    ax.set_ylim(bottom=0)
    ax.set_axisbelow(True)
    ax.grid(axis="y", linestyle="--", alpha=0.3)
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)

    margem = max(totais["valor_venda"].max() * 0.025, 1)
    for barra, valor in zip(barras, totais["valor_venda"]):
        ax.text(
            barra.get_x() + barra.get_width() / 2,
            barra.get_height() + margem,
            formatar_reais(valor),
            ha="center",
            va="bottom",
            fontsize=9,
        )

    fig.tight_layout()
    fig.savefig(PASTA / nome_arquivo, dpi=160, bbox_inches="tight")
    plt.close(fig)
    print(f"{nome_arquivo}:\n{totais.to_string(index=False)}")


dados = pd.read_csv(ARQUIVO_DADOS)
dados["valor_venda"] = pd.to_numeric(dados["valor_venda"], errors="raise")

# valor_venda representa faturamento/valor de venda, nao lucro.
criar_grafico("categoria", "Valor total vendido por categoria", "categorias.png")
criar_grafico("cidade", "Valor total vendido por cidade", "cidades.png")
