# Validação independente da base — rodada 04

## Escopo e fonte

Verificação independente de `papelaria_limpa.csv` por leitura com `csv` e somas em centavos com `Decimal`, separada da lógica do dashboard. Foram aplicadas as habilidades `explore-data` e `validate-data` disponíveis em `.opencode/skills/` e as recomendações de visualização de `data-visualization`.

## Perfil e qualidade

- 180 linhas, 9 colunas; uma linha por venda, identificada por `id_venda`.
- Intervalo de datas: 2026-01-01 a 2026-03-31; há registros em todos os 90 dias, exatamente 2 vendas por dia.
- Nenhum campo vazio, ID repetido ou registro inteiro duplicado.
- Quantidade, preço unitário e valor vendido são numéricos; o valor por venda corresponde a quantidade × preço.
- Fonte e saída existente não foram alteradas nesta verificação.

## Cálculos independentes

- Valor vendido: **R$ 20.059,00**; 180 vendas; ticket médio **R$ 111,44**.
- Por mês: jan/2026 **R$ 6.235,00** (62 vendas); fev/2026 **R$ 6.181,00** (56); mar/2026 **R$ 7.643,00** (62). Variações sequenciais: fev vs. jan **−0,9%**; mar vs. fev **+23,7%**.
- Produtos por valor: Mochila R$ 8.075,00 (40,26%); Livro de aventuras R$ 4.578,00; Livro de receitas R$ 2.860,00; Estojo R$ 2.442,00; Caderno R$ 1.782,00; Caneta R$ 322,00. Participação acumulada dos dois primeiros: **63,08%**; dos quatro primeiros: **89,51%**.
- Totais de categoria e cidade somam cada um R$ 20.059,00; maior categoria: Acessórios, R$ 10.517,00; maior cidade: Campinas, R$ 8.578,00.

## Interpretação e limites

Três meses de cobertura diária permitem apresentar a sequência mensal e a variação entre meses consecutivos observados, não uma previsão nem evidência de tendência futura. O padrão uniforme de duas vendas em cada dia é notável; a fonte não explica se isso reflete o processo real de coleta, então não deve ser interpretado como frequência operacional sem confirmação. As proporções Pareto são participação no valor vendido, não lucro ou margem. Não há custo, desconto, devolução ou meta na fonte, portanto nenhum deles deve ser inferido. Comparação mensal precisa tratar períodos sem base anterior como indisponíveis, sem dividir por zero.

## Status

**APROVADO para as verificações da fonte e dos cálculos descritos.** A revisão da interface e da implementação é uma etapa separada desta rodada.
