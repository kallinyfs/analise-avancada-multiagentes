# Relatório do Construtor — rodada 01

## Versão examinada

Não há commit neste diretório. SHA-256 (prefixo de 16 caracteres):

| Arquivo | Hash |
|---|---|
| `papelaria_limpa.csv` (fonte, preservada) | `698BB401D35C644C` |
| `projeto-dashboard/preparar_dados.py` | `A22BC49C16B6D48D` |
| `projeto-dashboard/README.md` | `8EAF5CA24BF91E3B` |
| `projeto-dashboard/site/index.html` | `44BF6A7864863B02` |
| `projeto-dashboard/site/styles.css` | `66C4D1559F84B0E2` |
| `projeto-dashboard/site/app.js` | `B949E92264A67A73` |
| `projeto-dashboard/site/data.json` | `5E7451C198412351` |

## Construído

- `preparar_dados.py` lê a fonte na raiz usando pandas, valida colunas, ausências, tipos, IDs e linhas repetidas, datas e `valor_venda = quantidade × preco_unitario`. Não remove nem altera registros: se detectar duplicata ou inconsistência, interrompe com erro explícito. Escreve os registros e os totais para os gráficos em `site/data.json`.
- O site estático inclui três indicadores (total vendido, quantidade de vendas e ticket médio), gráficos sem dependências externas (valor por categoria e cidade), filtros combináveis, botão de limpeza, mensagem de resultado vazio e tabela com todos os registros filtrados. Os filtros atualizam juntos os indicadores, gráficos e tabela. Incluídos rótulos acessíveis, controles de teclado, leiaute responsivo e tabela rolável em telas pequenas.
- `README.md` documenta significado das linhas, campos/tipos, regras de validação, limites da métrica, comandos para preparação/servidor local e `site/` como pasta publicável. O comando de testes está indicado como pendente até o Tester criar a suíte.
- `papelaria_limpa.csv`, `resumo.md`, `verificacao.md` e os arquivos anteriores não foram editados.

## Comandos e evidências

- ` .\.venv\Scripts\python.exe projeto-dashboard\preparar_dados.py` — concluído: **180 registros**, total vendido **R$ 20.059,00**, ticket médio **R$ 111,44**; JSON em `projeto-dashboard/site/data.json`.
- ` .\.venv\Scripts\python.exe -c "import json; ..."` — JSON válido, 180 registros; agregações geradas: categoria Acessórios R$ 10.517,00, Livros R$ 7.438,00, Papelaria R$ 2.104,00; cidade Campinas R$ 8.578,00, Santos R$ 6.937,50 e Sorocaba R$ 4.543,50.
- `node --check projeto-dashboard\site\app.js` — concluído sem erros de sintaxe (código de saída 0).
- Evidência dos dados gerados: `projeto-dashboard/site/data.json`; fonte inalterada identificada pelo hash acima.

## Pendências e encaminhamento

- A skill `validate-data` não estava disponível; não afirmo tê-la usado. Esta etapa executou validações da preparação, mas não substitui a revisão independente.
- Não escrevi nem executei testes, conforme o escopo do Construtor. Suíte reproduzível, teste HTTP/interação real de navegador, filtros, acessibilidade e tamanhos de tela ficam **PENDENTES** para o Tester/Revisor. README já indica o comando a usar quando a pasta de testes for criada.
- Nenhum problema bloqueante foi encontrado na preparação dos dados ou na sintaxe do JavaScript. O comando de preparação foi repetido após ajustar a apresentação monetária do terminal; a última execução foi bem-sucedida.

## Status

**APROVADO — entrega de construção do Construtor.** Este status não aprova o projeto completo: testes e revisão independente continuam pendentes.
