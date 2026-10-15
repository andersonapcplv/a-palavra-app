# Regra de duas APIs para auditoria — geração e capacidade

**Projeto:** A Palavra — Aprendendo as Escrituras
**Atualizado:** 15 de outubro de 2026
**Escopo:** regra editorial e estimativa preliminar de capacidade para o piloto. Não altera as 36 regras canônicas.

## Regra vigente

Cada unidade de conteúdo terá **exatamente dois auditores de IA**: Gemini Flash e `openai/gpt-oss-120b` pela Groq. **As duas APIs precisam aprovar todos os 36 critérios.** Uma aprovação e uma reprovação bloqueiam a unidade. Resultado ausente, erro, cota excedida, resposta inválida ou `unknown` também bloqueiam até nova tentativa válida.

Não há votação, maioria, terceiro voto ou aprovação por `2 de 3`. Cloudflare **não participa da auditoria** e não substitui um dos auditores neste fluxo. Se um dos dois provedores estiver indisponível ou sem cota, a unidade espera na fila; não se publica e não se troca automaticamente o auditor.

Essa regra é uma porta de aprovação, não uma alegação de que os modelos garantem correção. Conforme a instrução do proprietário, duas aprovações completas e validação determinística liberam publicação direta; não há uma terceira aprovação humana obrigatória.

## Papéis das ferramentas

- **Geração do rascunho:** Qwen executado no Kaggle, conforme o plano fornecido. A geração não usa uma terceira API de auditoria.
- **Auditor 1:** Gemini Flash pela API do Google.
- **Auditor 2:** `openai/gpt-oss-120b` pela API Groq.
- **Cloudflare Workers AI:** chave/conta já preparada segundo o usuário, mas fora do fluxo de auditoria definido aqui. Não entra na conta de auditores nem na capacidade diária.

Cada auditor recebe a mesma unidade e as evidências de origem, mas não recebe a decisão do outro. Cada um deve retornar resultado e evidência para cada um dos 36 critérios.

## Cálculo preliminar de capacidade

O plano anexado estima que uma chamada de auditoria Groq consumirá cerca de **3.000 a 4.000 tokens por unidade**. Usando como hipótese um limite diário de **200.000 tokens** para `openai/gpt-oss-120b`, a conta é:

- 200.000 ÷ 3.000 ≈ **66 unidades por dia**;
- 200.000 ÷ 4.000 = **50 unidades por dia**.

Logo, o teto preliminar atribuível à Groq é **aproximadamente 50–66 unidades de conteúdo por dia**, não 50–66 chamadas totais entre os dois provedores. Cada unidade ainda precisa de uma auditoria Gemini. A capacidade final é o menor destes tetos: Groq, Gemini, execução do pipeline e eventuais revisões/repetições.

A Groq também documenta limites de requisições e tokens por minuto. Com um limite de 8.000 tokens por minuto e a hipótese de 3.000–4.000 tokens por auditoria, o fluxo deve limitar-se a cerca de **2–2,7 auditorias Groq por minuto**. Na escala diária projetada, a quota diária de tokens é o gargalo, desde que as chamadas sejam distribuídas no tempo. Consultar a página de limites da organização, porque os valores efetivos da conta prevalecem sobre esta estimativa. [1]

O Gemini não deve receber uma capacidade diária inventada: os limites da API variam por modelo, projeto e nível da conta, e a documentação orienta conferir os limites ativos no AI Studio. Portanto, por enquanto, a estimativa de 50–66 é apenas um **limite superior da Groq**. A capacidade total permanece desconhecida até verificar o painel Gemini e medir o piloto. [2]

### Projeção condicional para toda a Bíblia

A Bíblia no pacote tem 31.102 versículos. **Se**, apenas para estimativa, todo o corpus fosse dividido em unidades fixas de 88 versículos, seriam `ceil(31.102 ÷ 88) = 354` unidades. A 50–66 unidades/dia, o limite teórico da Groq seria cerca de **6–8 dias**.

Isso **não é um prazo prometido**: ainda falta decidir se um estudo corresponde a cada bloco de 88 versículos, e a capacidade Gemini e as repetições podem aumentar o prazo. Se cada conteúdo tiver tamanho ou método de segmentação diferente, o cálculo deve ser refeito com os tokens reais do piloto.

## Como fechar a estimativa no piloto de 88 versículos

1. Executar uma unidade-piloto de 88 versículos pelo gerador Kaggle.
2. Enviar o resultado separadamente a Gemini e Groq, uma auditoria por API, exigindo o JSON completo dos 36 critérios.
3. Registrar por provedor os tokens de entrada e saída, chamadas, tempo, limites restantes, erros e repetições. Incluir instruções, texto-fonte, saída e justificativas na medição de tokens.
4. Calcular `unidades/dia = limite diário de tokens ÷ tokens médios por unidade`, separadamente para cada auditor. Para Groq, calcular também o teto de requisições e o de tokens por minuto.
5. Fixar o ritmo de fila pelo menor limite observado entre os dois auditores; usar margem operacional e pausar em `429`. O item só se torna publicável se ambos tiverem `pass` em todos os 36 critérios e o hash do conteúdo for idêntico ao auditado.

O piloto deve verificar se 3.000–4.000 tokens é uma estimativa razoável. Se esse valor incluir só a entrada e não a resposta do auditor, a capacidade calculada acima está superestimada. Se houver várias chamadas por unidade, também é preciso contar todas.

## Segurança das chaves e dos dados

As chaves ficam somente nos Secrets do repositório, nunca no chat, no frontend ou em commits. Não enviar anotações, favoritos, progresso, backups nem identificadores de usuários. O plano gratuito de Gemini pode usar conteúdo enviado para melhorar produtos do Google; evitar dados pessoais e conferir os termos vigentes antes de enviar conteúdo. [3]

Apenas cadastrar um Secret não cria nem executa a pipeline. O workflow precisa ler as variáveis de ambiente, limitar chamadas, registrar evidências, tratar falhas como bloqueio e retomar itens pendentes com segurança. A conta GitHub que cria os Secrets precisa ter permissão administrativa para as configurações do repositório.

## Fontes oficiais

[1]: https://console.groq.com/docs/rate-limits "Rate Limits — GroqDocs"
[2]: https://ai.google.dev/gemini-api/docs/rate-limits "Rate limits — Gemini API"
[3]: https://ai.google.dev/gemini-api/docs/pricing "Gemini Developer API pricing — Google AI for Developers"
