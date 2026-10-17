---
nome: validar-dados
Descrição: Faça o controle de qualidade de uma análise antes de compartilhá-la — verifique a metodologia, a precisão e os vieses. Use ao revisar uma análise antes de uma apresentação para as partes interessadas, ao verificar cálculos e lógica de agregação, ao confirmar se os resultados de uma consulta SQL estão corretos ou ao avaliar se as conclusões são realmente sustentadas pelos dados.
dica de argumento: "<análise a ser revisada>"
---

# /validate-data - Validar a análise antes de compartilhar

> Se você vir espaços reservados desconhecidos ou precisar verificar quais ferramentas estão conectadas, consulte [CONNECTORS.md](../../CONNECTORS.md).

Analise os dados quanto à precisão, metodologia e possíveis vieses antes de compartilhá-los com as partes interessadas. Isso gera uma avaliação de confiabilidade e sugestões de melhoria.

## Utilização

```
/validate-data <análise para revisão>
```

A análise pode ser:
- Um documento ou relatório na conversa
- Um arquivo (markdown, caderno, planilha)
- Consultas SQL e seus resultados
- Gráficos e seus dados subjacentes
- Descrição da metodologia e das conclusões

## Fluxo de trabalho

### 1. Revisão da Metodologia e das Premissas

Examinar:

- **Formulação da pergunta**: A análise está respondendo à pergunta correta? A pergunta poderia ser interpretada de forma diferente?
- **Seleção de dados**: As tabelas/conjuntos de dados corretos estão sendo usados? O intervalo de tempo é apropriado?
- **Definição da população**: A população analisada está definida corretamente? Existem exclusões não intencionais?
- **Definições de métricas**: As métricas são definidas de forma clara e consistente? Elas correspondem à forma como as partes interessadas as entendem?
- **Linha de base e comparação**: A comparação é justa? Os períodos de tempo, os tamanhos das coortes e os contextos são comparáveis?

2. Execute a lista de verificação de controle de qualidade pré-entrega.

Analise a lista de verificação abaixo — qualidade dos dados, cálculos, razoabilidade e verificação da apresentação.

### 3. Verifique as Armadilhas Analíticas Comuns

Analise sistematicamente o problema em relação ao catálogo detalhado de armadilhas abaixo (explosão de junções, viés de sobrevivência, comparação incompleta de períodos, deslocamento do denominador, média das médias, incompatibilidade de fusos horários, viés de seleção).

### 4. Verificar cálculos e agregações

Sempre que possível, faça verificações pontuais:

- Recalcular alguns números-chave de forma independente
- Verificar se a soma dos subtotais é igual ao total.
- Verifique se a soma das porcentagens é igual a 100% (ou próxima disso) onde esperado.
- Confirme se as comparações ano a ano/mês a mês utilizam os períodos base corretos.
- Validar se os filtros são aplicados de forma consistente em todas as métricas.

Aplique as técnicas de verificação de consistência dos resultados abaixo (verificações de magnitude, validação cruzada, detecção de sinais de alerta).

### 5. Avaliar visualizações

Se a análise incluir gráficos:

- Os eixos começam em valores apropriados (zero para gráficos de barras)?
- As escalas são consistentes em todos os gráficos de comparação?
- Os títulos dos gráficos descrevem com precisão o que é mostrado?
- Será que a visualização poderia induzir um leitor desatento ao erro?
- Existem eixos truncados, intervalos inconsistentes ou efeitos 3D que distorcem a percepção?

### 6. Avaliar a narrativa e as conclusões

Analise se:

As conclusões são sustentadas pelos dados apresentados.
- Explicações alternativas são reconhecidas.
- A incerteza é comunicada de forma adequada.
As recomendações decorrem logicamente das conclusões.
O nível de confiança corresponde à força das evidências.

### 7. Sugira melhorias

Forneça sugestões específicas e práticas:

- Análises adicionais que fortaleceriam as conclusões
- Observações ou limitações que devem ser consideradas
- Melhores visualizações ou enquadramentos para os pontos principais
- Falta de contexto que as partes interessadas desejariam ter.

### 8. Gerar Avaliação de Confiança

Avalie a análise em uma escala de 3 níveis:

**Pronto para compartilhar** -- A análise é metodologicamente sólida, os cálculos foram verificados e as ressalvas foram observadas. Sugestões menores para melhoria, mas nada que impeça o progresso.

**Compartilhe com as devidas ressalvas** -- A análise está em grande parte correta, mas apresenta limitações ou pressupostos específicos que devem ser comunicados às partes interessadas. Liste as ressalvas necessárias.

**Necessita de revisão** -- Foram encontrados erros específicos, problemas metodológicos ou análises ausentes que devem ser corrigidos antes do compartilhamento. Liste as alterações necessárias por ordem de prioridade.

## Formato de saída

```
## Relatório de Validação

Avaliação geral: [Pronto para compartilhar | Compartilhar com ressalvas | Necessita de revisão]

### Revisão da Metodologia
[Resultados sobre a abordagem, seleção de dados e definições]

### Problemas Encontrados
1. [Gravidade: Alta/Média/Baixa] [Descrição e impacto do problema]
2. ...

### Verificações pontuais de cálculo
- [Métrica]: [Verificado / Discrepância encontrada]
- ...

### Revisão de Visualização
[Quaisquer problemas com gráficos ou apresentação visual]

### Melhorias Sugeridas
1. [Aprimoramento e por que isso importa]
2. ...

### Advertências necessárias para as partes interessadas
- [Aviso importante que deve ser comunicado]
- ...
```

---

Lista de verificação de controle de qualidade pré-entrega

Consulte esta lista de verificação antes de compartilhar qualquer análise com as partes interessadas.

### Verificações de Qualidade de Dados

- [ ] **Verificação da fonte**: Confirmei quais tabelas/fontes de dados foram usadas. Elas são as corretas para esta questão?
- [ ] **Atualização**: Os dados são suficientemente recentes para a análise. A data "a partir de" foi indicada.
- [ ] **Completude**: Sem lacunas inesperadas nas séries temporais ou segmentos ausentes.
- [ ] **Tratamento de nulos**: Verificadas as taxas de nulos nas colunas principais. Os valores nulos são tratados adequadamente (excluídos, imputados ou sinalizados).
- [ ] **Desduplicação**: Confirmado que não há contagem dupla devido a junções incorretas ou registros de origem duplicados.
- [ ] **Verificação de filtro**: Todas as cláusulas WHERE e filtros estão corretos. Nenhuma exclusão não intencional.

### Verificações de Cálculo

- [ ] **Lógica de agregação**: GROUP BY inclui todas as colunas não agregadas. O nível de agregação corresponde à granularidade da análise.
- [ ] **Correção do denominador**: Os cálculos de taxa e porcentagem usam o denominador correto. Os denominadores são diferentes de zero.
- [ ] **Alinhamento de datas**: As comparações usam o mesmo período de tempo. Períodos parciais são excluídos ou indicados.
- [ ] **Correção de junção**: Os tipos de junção são apropriados (INNER vs LEFT). Junções muitos-para-muitos não inflaram as contagens.
- [ ] **Definições de métricas**: As métricas correspondem à forma como as partes interessadas as definem. Quaisquer desvios são anotados.
- [ ] **Soma dos subtotais**: As partes somam o todo quando esperado. Se não somarem, explique o motivo (ex.: sobreposição).

### Verificações de razoabilidade

- [ ] **Magnitude**: Os números estão em uma faixa plausível. A receita não é negativa. As porcentagens estão entre 0 e 100%.
- [ ] **Continuidade da tendência**: Sem saltos ou quedas inexplicáveis ​​na série temporal.
- [ ] **Referência cruzada**: Os números principais correspondem a outras fontes conhecidas (painéis de controle, relatórios anteriores, dados financeiros).
- [ ] **Ordem de grandeza**: A receita total está na faixa correta. O número de usuários corresponde aos valores conhecidos.
- [ ] **Casos extremos**: O que acontece nos limites? Segmentos vazios, períodos de atividade zero, novas entidades.

### Verificações de Apresentação

- [ ] **Precisão do gráfico**: Os gráficos de barras começam em zero. Os eixos são rotulados. As escalas são consistentes em todos os painéis.
- [ ] **Formatação de números**: Precisão adequada. Formatação consistente de moeda/porcentagem. Separadores de milhares quando necessário.
- [ ] **Clareza do título**: Os títulos expressam a percepção, não apenas a métrica. Os intervalos de datas são especificados.
- [ ] **Aviso sobre transparência**: Limitações e suposições conhecidas são declaradas explicitamente.
- [ ] **Reprodutibilidade**: Outra pessoa poderia reproduzir esta análise a partir da documentação fornecida.

## Armadilhas comuns na análise de dados

### Junte-se à Explosão

**O problema**: Uma junção muitos-para-muitos multiplica silenciosamente as linhas, inflando as contagens e as somas.

**Como detectar**:
```sql
-- Verificar a contagem de linhas antes e depois da junção
SELECT COUNT(*) FROM table_a; -- 1.000
SELECT COUNT(*) FROM table_a a JOIN table_b b ON a.id = b.a_id; -- 3.500 (ops!)
```

**Como prevenir**:
- Sempre verifique a contagem de linhas após as junções.
- Se a contagem aumentar, investigue a relação de junção (é realmente 1:1 ou 1:muitos?).
- Use `COUNT(DISTINCT a.id)` em vez de `COUNT(*)` ao contar entidades por meio de junções.

### Viés de Sobrevivência

**O problema**: Analisar apenas as entidades que existem hoje, ignorando aquelas que foram excluídas, descontinuadas ou que falharam.

**Exemplos**:
- Analisar o comportamento dos "usuários atuais" não identifica os usuários que cancelaram a assinatura.
Analisar apenas as "empresas que usam nosso produto" ignora aquelas que avaliaram e desistiram.
- Estudar as propriedades dos resultados "bem-sucedidos" sem considerar os resultados "mal-sucedidos".

**Como evitar:** Pergunte "quem NÃO está neste conjunto de dados?" antes de tirar conclusões.

### Comparação de Períodos Incompletos

**O problema:** Comparar um período parcial com um período completo.

**Exemplos**:
— "A receita de janeiro foi de US$ 500 mil, contra US$ 800 mil em dezembro" — mas janeiro ainda não acabou.
— "As inscrições desta semana estão em queda" — verificado na quarta-feira, em comparação com a semana anterior, que estava completa.

**Como evitar**: Sempre filtre para períodos completos ou compare o mesmo dia do mês/mesmo número de dias.

### Mudança de denominador

**O problema:** O denominador muda entre os períodos, tornando as taxas incomparáveis.

**Exemplos**:
- A taxa de conversão melhorou porque você mudou a forma como contabiliza os usuários "elegíveis".
- A taxa de cancelamento mudou porque a definição de "ativo" foi atualizada.

**Como prevenir**: Utilize definições consistentes em todos os períodos comparados. Registre quaisquer alterações nas definições.

### Média das Médias

**O problema:** Calcular a média de médias pré-computadas gera resultados incorretos quando os tamanhos dos grupos são diferentes.

**Exemplo**:
- Grupo A: 100 usuários, receita média de US$ 50
- Grupo B: 10 usuários, receita média de US$ 200
- Errado: Média das médias = ($50 + $200) / 2 = $125
- Direita: Média ponderada = (100*$50 + 10*$200) / 110 = $63,64

**Como evitar**: Sempre agregue os dados a partir dos dados brutos. Nunca calcule a média de médias pré-agregadas.

### Incompatibilidade de fusos horários

**O problema**: Diferentes fontes de dados usam fusos horários diferentes, causando desalinhamento.

**Exemplos**:
- Registros de data e hora de eventos em UTC versus datas visíveis ao usuário em horário local.
- Resumos diários que utilizam diferentes horários de corte

**Como prevenir**: Padronize todos os registros de data e hora para um único fuso horário (UTC recomendado) antes da análise. Documente o fuso horário utilizado.

### Viés de seleção na segmentação

**O problema**: Os segmentos são definidos pelo resultado que você está medindo, criando uma lógica circular.

**Exemplos**:
— "Usuários que concluíram o processo de integração apresentam maior retenção" — obviamente, eles se autoselecionaram.
- "Usuários avançados geram mais receita" -- eles se tornaram usuários avançados AO gerar receita

**Como prevenir**: Defina segmentos com base em características pré-tratamento, não em resultados.

### Outras Armadilhas Estatísticas

- **Paradoxo de Simpson**: A tendência se inverte quando os dados são agregados em vez de segmentados.
- **Correlação apresentada como causalidade** sem evidências que a sustentem.
- **Tamanhos de amostra pequenos** que levam a conclusões não confiáveis
- **Valores discrepantes que afetam desproporcionalmente as médias** (deveriam ser usadas as medianas em vez disso?)
- **Testes múltiplos / seleção tendenciosa** resultados significativos
- **Viés de previsão**: Utilizar informações futuras para explicar eventos passados.
- **Períodos temporais selecionados a dedo** que favorecem uma narrativa específica

## Verificação de sanidade dos resultados

### Verificações de Magnitude

Para qualquer número-chave em sua análise, verifique se ele passa no "teste do cheiro":

| Tipo de métrica | Verificação de sanidade |
|---|---|
| Contagem de usuários | Isso corresponde aos números conhecidos de usuários ativos mensais/diários? |
| Receita | Esta receita está na ordem de grandeza correta em relação à receita recorrente anual (ARR) conhecida? |
| Taxas de conversão | Estão entre 0% e 100%? Correspondem aos números do painel de controle? |
| Taxas de crescimento | Um crescimento de mais de 50% mês a mês é realista ou há algum problema com os dados? |
| Médias | A média é razoável considerando o que você sabe sobre a distribuição? |
| Percentagens | As percentagens dos segmentos somam aproximadamente 100%? |

### Técnicas de Validação Cruzada

1. **Calcule a mesma métrica de duas maneiras diferentes** e verifique se os resultados coincidem.
2. **Verifique registros individuais** -- selecione algumas entidades específicas e rastreie seus dados manualmente.
3. **Comparar com referências conhecidas** -- comparar com painéis de controle publicados, relatórios financeiros ou análises anteriores.
4. **Engenharia reversa** -- se a receita total for X, a receita por usuário multiplicada pelo número de usuários é aproximadamente igual a X?
5. **Verificações de limites** -- o que acontece quando você filtra para um único dia, um único usuário ou uma única categoria? Esses micro-resultados fazem sentido?

### Sinais de alerta que justificam investigação

Qualquer métrica que tenha variado mais de 50% de um período para o outro sem uma causa aparente.
- Contagens ou somas que resultam em números inteiros exatos (sugere um problema com o filtro ou valor padrão)
- Taxas exatamente iguais a 0% ou 100% (podem indicar dados incompletos)
- Resultados que confirmam perfeitamente a hipótese (a realidade costuma ser mais complexa)
- Valores idênticos em diferentes períodos ou segmentos de tempo (sugere que a consulta está ignorando uma dimensão)

## Padrões de Documentação para Reprodutibilidade

### Modelo de Documentação de Análise

Toda análise que não seja trivial deve incluir:

```markdown
## Análise: [Título]

### Pergunta
[A pergunta específica que está sendo respondida]

### Fontes de dados
- Tabela: [schema.table_name] (a partir de [date])
- Tabela: [schema.other_table] (a partir de [date])
- Arquivo: [nome do arquivo] (origem: [de onde veio])

### Definições
- [Métrica A]: [Exatamente como é calculada]
- [Segmento X]: [Como exatamente a participação é determinada]
- [Período]: [Data de início] a [Data de término], [fuso horário]

### Metodologia
1. [Etapa 1 da abordagem de análise]
2. [Etapa 2]
3. [Etapa 3]

### Pressupostos e Limitações
- [Suposição 1 e por que ela é razoável]
- [Limitação 1 e seu potencial impacto nas conclusões]

### Principais conclusões
1. [Constatação 1 com evidências de apoio]
2. [Constatação 2 com evidências de apoio]

### Consultas SQL
[Todas as consultas utilizadas, com comentários]

### Advertências
- [Coisas que o leitor deve saber antes de agir com base nisso]
```

### Documentação do código

Para qualquer código (SQL, Python) que possa ser reutilizado:

```python
"""
Análise: Retenção mensal da coorte
Autor: [Nome]
Data: [Data]
Fonte de dados: tabela de eventos, tabela de usuários
Última validação: [Data] -- resultados correspondentes ao painel de controle com uma margem de erro de 2%

Propósito:
    Calcule as coortes mensais de retenção de usuários com base na data da primeira atividade.

Pressupostos:
    - "Ativo" significa pelo menos um evento no mês.
    - Exclui contas de teste/internas (user_type != 'internal')
    - Utiliza datas UTC em todo o sistema.

Saída:
    Matriz de retenção de coorte com linhas `cohorte_month` e colunas `months_since_signup`.
    Os valores representam as taxas de retenção (0-100%).
"""
```

### Controle de versão para análises

- Salve consultas e código em um sistema de controle de versão (git) ou em um sistema de documentação compartilhada.
- Observe a data da captura de dados utilizada.
- Se uma análise for refeita com dados atualizados, documente o que mudou e por quê.
- Link para versões anteriores de análises recorrentes para comparação de tendências

## Exemplos

```
/validate-data Analise esta análise de receita trimestral antes de enviá-la à equipe executiva: [análise]
```

```
/validate-data Verifique minha análise de churn -- Estou comparando as taxas de churn do 4º trimestre com as do 3º trimestre, mas o 4º trimestre tem uma janela de medição mais curta.
```

```
/validate-data Aqui está uma consulta SQL e seus resultados para o nosso funil de conversão. A lógica parece correta? [consulta + resultados]
```

## Pontas

Execute o comando /validate-data antes de qualquer apresentação ou decisão importante.
- Mesmo análises rápidas se beneficiam de uma verificação de consistência — leva apenas um minuto e pode preservar sua credibilidade.
- Se a validação encontrar problemas, corrija-os e valide novamente.
Compartilhe os resultados da validação juntamente com sua análise para aumentar a confiança das partes interessadas.