# Relatório do Construtor — rodada 12

## Origem, uso e licença

- Fonte solicitada: [Matcha World no DaFont](https://www.dafont.com/pt/matcha-world.font), de Khurasan. Download do pacote pelo link oficial da própria página: `https://dl.dafont.com/dl/?f=matcha_world`.
- A página e o arquivo original `More Info.txt` declaram: “100% FREE for Personal & Commercial Use” (o TXT escreve “100% free for personal use & commercial use”). O pacote não contém licença formal separada nem explicita requisito de atribuição. Para transparência, foi mantido o crédito ao autor em `projeto-dashboard/README.md` e o TXT original foi incluído junto ao asset.
- A página avisa que a versão gratuita não inclui caracteres multilíngues. O texto do título atual usa apenas caracteres básicos; a checagem do cmap confirmou todos os glifos necessários.

## Alterações e versão

Sem commit Git neste diretório; não foi feito commit ou push. Adicionado o TTF local em `projeto-dashboard/site/fonts/matcha-world.ttf`, preservado o aviso original em `site/fonts/More Info.txt` e configurado `@font-face` em `site/styles.css`, aplicado somente a `.hero-texto h1`. O fallback tipográfico permanece. O `README.md` recebeu crédito, declaração de uso e limitação de caracteres. HTML, app.js, testes e dados não foram alterados.

| Arquivo | SHA-256 |
|---|---|
| `projeto-dashboard/site/fonts/matcha-world.ttf` | `08385BB1C1C0A097DF364FABDC9B3E4EEECB869F8A7C28492AA8C15D515BC7D8` |
| `projeto-dashboard/site/fonts/More Info.txt` | `C983CB98752C91BDD22026905ADF815103EA1C8C3BEE022936AA7A6CA707C403` |
| ZIP oficial baixado (temporário) | `D24FCF16231A76EEC1A703961A2C20EDD8426EF6FE70730D668FF15A80C8A2DD` |
| `projeto-dashboard/site/styles.css` | `141D01B1C02C9E6419C5CD60923F49A6085D7D8C4E6529288E99A00F443125BB` |
| `projeto-dashboard/README.md` | `3195D61B59596139231FAF37436844BBDAA603C6FFF3C7CC0EB621F923AEA0D3` |
| `projeto-dashboard/site/index.html` (inalterado) | `BA3A0AB1C8D778F4A845973808FF75240F60A9B926F1BCE088E1627F1C6EA0F5` |
| `projeto-dashboard/site/app.js` (inalterado) | `F3CC1B0C2A20445F0CD5F7E8631A6E62E7DD98F9621A352DF22A8C8D3A02A9C8` |

## Verificações e limites

- Validação estática Python: **OK** — asset TTF reconhecido e aberto por fontTools; glifos de “Vendas da papelaria” presentes; caminho local do `@font-face`, fallback, escopo do h1, ausência de imports remotos, arte/links existentes e aviso de uso verificados.
- Navegador e avaliação visual da fonte, inclusive em hospedagem estática: **PENDENTES**.
- A falha antiga da suíte continua registrada na rodada 06: uma asserção espera a cor azul antiga do hover. A suíte não foi executada nesta rodada e não é declarada aprovada.
- Nenhum Tester ou Revisor foi acionado, conforme solicitado.

## Status

**BLOQUEADO** para validação visual/browser; verificações estáticas passaram e o uso local foi implementado conforme a declaração de uso do autor, mas a aparência real e a falha antiga de teste permanecem pendentes/conhecidas.
