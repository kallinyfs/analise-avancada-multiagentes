# Painel de vendas da papelaria

O painel usa `papelaria_limpa.csv` na pasta raiz do projeto e gera `site/data.json`. Cada linha representa uma venda; o `id_venda` identifica a venda. O valor vendido é `quantidade × preco_unitario` e **não é lucro**. A preparação valida colunas, tipos, ausências, IDs, duplicatas e cálculos; não remove nem altera registros. A deduplicação e padronização já foram feitas na etapa anterior, cuja fonte permanece preservada.

## Preparar dados

No PowerShell, na pasta raiz do projeto:

```powershell
.\.venv\Scripts\python.exe projeto-dashboard\preparar_dados.py
```

O script requer Python e pandas no ambiente virtual. Se não houver ambiente virtual, use `python projeto-dashboard\preparar_dados.py` no lugar do comando acima.

## Executar testes

Os testes automatizados estão disponíveis em `projeto-dashboard\tests`. Na raiz do projeto, execute:

```powershell
.\.venv\Scripts\python.exe -m unittest discover -s projeto-dashboard\tests -v
```

Para a verificação completa, tenha Node.js e um navegador Chromium (Google Chrome ou Microsoft Edge) instalados; sem Chromium, o teste de interação no navegador fica pendente.

## Abrir o site localmente

Na raiz, inicie um servidor HTTP simples:

```powershell
.\.venv\Scripts\python.exe -m http.server 8000 --directory projeto-dashboard\site
```

Abra <http://localhost:8000> no navegador. Para hospedagem estática, publique o conteúdo da pasta `projeto-dashboard/site/`; não é necessário servidor de aplicação ou banco de dados. Rode a preparação novamente sempre que a fonte mudar.

O ícone da aba do navegador é o arquivo local `site/favicon.svg`, incluído na pasta publicável.

## Crédito e licença da fonte

O título usa `Matcha World.ttf`, de Khurasan, obtida no [DaFont](https://www.dafont.com/pt/matcha-world.font) e armazenada localmente em `site/fonts/` para funcionar offline e em hospedagem estática. A nota do autor no pacote declara: “100% free for personal use & commercial use”. O pacote não traz uma licença formal separada; a nota não especifica obrigação de atribuição, mas mantemos o crédito por transparência. A versão gratuita não inclui caracteres multilíngues; o título atual usa apenas caracteres latinos básicos. O arquivo original `site/fonts/More Info.txt` acompanha a fonte.

## Dados e limitações

O CSV preparado tem uma linha por venda, não por unidade. `quantidade` é o número de unidades nessa venda. `data` está no formato ISO (`AAAA-MM-DD`); IDs, cidade, categoria, produto e forma de pagamento são texto; quantidade é inteira; preço unitário e valor vendido são numéricos. Não há deduplicação automática: se houver ID ou linha duplicada, a preparação falha e informa o problema. Valores de venda não consideram custos, impostos, descontos ou devoluções e não permitem concluir lucro ou rentabilidade.
