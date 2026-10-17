# Verificação da análise de vendas da papelaria

## Avaliação geral

**Compartilhe com ressalvas.** Os cálculos e as agregações conferidos são consistentes com os arquivos locais. A ressalva essencial é que `valor_venda` representa quantidade × preço unitário; não é lucro e não desconta custos, impostos, descontos ou devoluções.

## Arquivos e método conferidos

- Li `vendas_papelaria.csv` (**182 linhas × 8 colunas**), `papelaria_limpa.csv` (**180 linhas × 9 colunas**), `resumo.md` e `graficos.py`.
- Recalculei `quantidade × preco_unitario` linha a linha na cópia limpa, sem usar `valor_venda` como fonte do recálculo; comparei o resultado com a coluna armazenada.
- Usei `.venv/Scripts/python.exe` e pandas. Os cálculos foram feitos apenas com os CSVs locais; não usei banco de dados nem integrações externas.

## Resultados recalculados

- **Vendas:** 180 linhas e 180 `id_venda` distintos na cópia limpa.
- **Unidades vendidas:** 548 (soma de `quantidade`; é diferente do número de vendas).
- **Total vendido:** **R$ 20.059,00**. A soma recalculada de `quantidade × preco_unitario` coincide com a soma de `valor_venda` em todas as linhas.
- No original, antes de remover as 2 linhas duplicadas exatas, o total recalculado é **R$ 20.066,00**. A diferença de **R$ 7,00** corresponde ao valor das linhas duplicadas dos IDs `V0010` e `V0020`; portanto, usar o total bruto do original contaria vendas em duplicidade.

### Total por categoria

| Categoria | Valor vendido |
|---|---:|
| Acessórios | R$ 10.517,00 |
| Livros | R$ 7.438,00 |
| Papelaria | R$ 2.104,00 |
| **Soma das categorias** | **R$ 20.059,00** |

A soma por categoria **coincide** com o total geral recalculado.

### Total por cidade

| Cidade | Valor vendido |
|---|---:|
| Campinas | R$ 8.578,00 |
| Santos | R$ 6.937,50 |
| Sorocaba | R$ 4.543,50 |
| **Soma das cidades** | **R$ 20.059,00** |

A soma por cidade também coincide com o total geral.

## Revisão do resumo e do código dos gráficos

- Os números conferidos em `resumo.md` para linhas/colunas, duplicatas e total de `valor_venda` estão corretos. Acrescentei a distinção entre **180 vendas** e **548 unidades** para evitar ambiguidade.
- `graficos.py` lê explicitamente `papelaria_limpa.csv` no diretório do próprio script, agrupa `valor_venda` por `categoria` e `cidade` e salva `categorias.png` e `cidades.png`. Assim, os gráficos usam a cópia deduplicada e tratada, não o CSV original.
- O código formata os valores como reais e configura o eixo vertical para começar em zero. Os totais usados nos dois gráficos correspondem aos subtotais recalculados acima.

## Conclusão e ressalvas

As conclusões de comparação são sustentadas por esses dados: Acessórios tem o maior valor vendido entre as categorias; Campinas, entre as cidades. Não se pode inferir lucro ou rentabilidade a partir desses valores. A validação confirma consistência interna dos arquivos, não a exatidão dos preços ou vendas perante um sistema financeiro externo.
