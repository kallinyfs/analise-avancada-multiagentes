# Análise e tratamento - vendas_papelaria.csv

## Visão geral
- Arquivo original: **182 linhas x 8 colunas**.
- Granularidade: uma linha por venda; `id_venda` identifica a venda.
- Período coberto: **2026-01-01 a 2026-03-31**.
- Cópia tratada: **180 linhas x 9 colunas**.

## Problemas encontrados no original
- **2 linhas** eram duplicatas exatas. Havia **2 IDs repetidos**: V0010, V0020; as repetições eram linhas idênticas.
- **6 linhas** tinham espaços no início/fim de `cidade` (6 linhas após deduplicar).
- Categoria inconsistente: **3 registros** fora da grafia canônica, principalmente `acessórios` em minúsculas (3 após deduplicar).
- **4 pagamentos** estavam vazios na cópia sem duplicatas.
- As demais colunas não tinham campos vazios. Quantidades e preços eram numéricos e não negativos.

## Tratamento aplicado (somente na cópia)
1. Removidas apenas as duplicatas exatas da mesma venda, mantendo a primeira ocorrência; o original foi preservado.
2. Removidos espaços no início/fim de `cidade`.
3. Padronizada `categoria` para `Livros`, `Papelaria` e `Acessórios` (normalizando caixa e espaços).
4. Pagamento vazio substituído por `Não informado`.
5. Criada `valor_venda` como `quantidade * preco_unitario`, sem arredondamento adicional.

## Conferências e resumo numérico da cópia tratada
- Vendas: **180** (linhas e IDs únicos); quantidade vendida: **548 unidades**.
- IDs de venda: **180 distintos**, sem repetição após remover as linhas duplicadas.
- Categorias: Acessórios 65, Livros 54, Papelaria 61.
- Formas de pagamento: Cartão 52, Dinheiro 56, Não informado 4, Pix 68.
- Valor vendido total (`valor_venda`): **R$ 20.059,00**; não representa lucro.
- Quantidade - min/máx/média/mediana: 1/5/3.04/3.00.
- Preço unitário - min/máx/média/mediana: 3.5/95/36.22/22.00.
- Valor por venda - min/máx/média/mediana: 3.5/475/111.44/84.00.

Os cálculos e a gravação foram feitos localmente com `.venv/Scripts/python.exe`, sem integração com banco de dados.
