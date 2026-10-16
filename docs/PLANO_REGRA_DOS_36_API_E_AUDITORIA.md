# Regra dos 36 — geração, auditoria e publicação

## Resposta direta

O aplicativo pode funcionar em modo estático, mas a aprovação da Regra dos 36 não acontece automaticamente dentro do navegador. O modo estático é adequado para **entregar e executar** conteúdo já aprovado. A geração e a auditoria devem acontecer antes da publicação, em uma pipeline separada.

A API não é obrigatória para a primeira prova de conceito. Ela se torna recomendável quando houver muitos estudos para gerar, repetir, comparar e auditar. Sem API, o processo pode ser feito manualmente em Manus ou outra IA, mas ficará menos automatizado e menos reprodutível.

## O que o contrato atual prova

`36_criterios_canonicos.json` é o contrato dos gates. Ele identifica os 36 critérios, preserva a ordem canônica e possui SHA-256 verificado pelo teste do GitHub.

Isso prova que o contrato não foi alterado acidentalmente. Ainda não prova que um estudo específico foi aprovado nos 36 critérios. Para isso, será necessário um resultado de auditoria por conteúdo.

## Modelo de duas auditorias obrigatórias

Para este projeto, o modelo adotado por decisão do proprietário é de **exatamente duas auditorias independentes entre Gemini, Groq e Cloudflare**. Os pares permitidos são Gemini + Groq, Cloudflare + Groq e Cloudflare + Gemini. As duas APIs selecionadas devem aprovar todos os 36 critérios. Não há terceiro auditor, votação, maioria ou aprovação parcial. Se menos de duas APIs estiverem disponíveis, a auditoria fica pausada até que duas retornem.

| Auditoria A | Auditoria B | Resultado |
|---|---|---|
| aprovada | aprovada | publicar diretamente depois de validar formato, referência e hash |
| aprovada | reprovada | bloqueado |
| reprovada | aprovada | bloqueado |
| reprovada | reprovada | bloqueado |
| dúvida, erro ou ausência de resposta | qualquer resultado | bloqueado |

As duas APIs selecionadas são os auditores válidos daquele ciclo. Cada uma deve justificar individualmente os 36 resultados com evidências. Quando uma API ficar indisponível, outra entre as três pode substituí-la; se duas estiverem indisponíveis, o item aguarda. Um estudo já aprovado não precisa ser reauditado quando uma API retornar.

Se os auditores discordarem, o conteúdo volta para revisão e nova versão. A divergência não será resolvida por votação e não será tratada como aprovação parcial.

## Pipeline correta

### 1. Definição do alvo

Para cada estudo, registrar passagem-alvo, tradução utilizada, intervalo de contexto, tipo de conteúdo e objetivo. O sistema não deve permitir que a IA escolha livremente uma passagem sem registro.

### 2. Geração

A IA produz um rascunho estruturado, por exemplo:

```json
{
  "id": "marcos-01-estudo-001",
  "reference": "Marcos 1:1-8",
  "explanation": "...",
  "application": "...",
  "summary": "...",
  "prayer": "..."
}
```

A geração deve guardar modelo, versão, data, prompt ou instruções, passagem de entrada e hash do resultado. Uma API facilita repetir esse processo em lote, mas a geração também pode ser feita manualmente por uma IA com os mesmos registros.

### 3. Auditorias independentes

Um validador determinístico verifica formato, campos obrigatórios, referências, citações, limites de tamanho, ausência de chamadas proibidas e existência dos 36 resultados. Depois, o estudo passa por Auditoria A e Auditoria B. Cada auditor produz seu próprio relatório, sem receber a decisão do outro.

O resultado esperado por estudo é algo como:

```json
{
  "study_id": "marcos-01-estudo-001",
  "status": "approved_for_publication",
  "audits": {
    "gemini": {"status": "pass", "report": "evidence/gemini.json"},
    "groq": {"status": "pass", "report": "evidence/groq.json"}
  },
  "gates": {
    "TARGET_FIDELITY": {"gemini": "pass", "groq": "pass", "evidence": "..."},
    "CONTEXT_FIDELITY": {"gemini": "pass", "groq": "pass", "evidence": "..."}
  }
}
```

Nenhum estudo deve ir para o aplicativo se qualquer auditor estiver `fail`, `unknown`, `review`, indisponível ou sem evidência. Os dois auditores precisam estar `pass` em todos os gates.

### 4. Publicação após a aprovação dupla

Conforme a instrução do proprietário, quando qualquer par válido entre Gemini, Groq e Cloudflare aprovar todos os 36 gates e os validadores determinísticos confirmarem formato, referência e integridade/hash, o conteúdo deve seguir diretamente para publicação no app. Não há uma terceira aprovação, voto de desempate ou revisão humana obrigatória no fluxo padrão.

Uma pessoa responsável ainda pode revisar ou retirar conteúdo por decisão do proprietário, mas essa etapa não deve atrasar a publicação automática definida pelo gate duplo.

### 5. Empacotamento estático

Somente estudos com duas auditorias completas aprovadas e todas as validações determinísticas concluídas entram no arquivo público, por exemplo:

```text
content/studies-approved.json
content/studies-manifest.json
evidence/studies/<study-id>.json
```

O PWA continua estático. Ele não precisa chamar a API para exibir o estudo aprovado. O navegador apenas carrega o JSON aprovado e o service worker o armazena offline.

### 6. Validação no GitHub

O workflow deve bloquear o merge quando:

- o estudo não tiver todos os 36 gates;
- algum gate estiver diferente de `pass`;
- o hash do conteúdo não coincidir com o manifesto;
- a referência bíblica não existir no corpus;
- o arquivo aprovado não corresponder ao relatório de auditoria.

## Três níveis de comprovação

### Integridade técnica

Comprovada por hashes, schema JSON, testes e workflow. Demonstra que o arquivo publicado é o arquivo auditado e que o corpus não mudou.

### Qualidade de aderência

Comprovada pelo relatório dos 36 gates, com evidência específica para cada critério e referência textual. Um simples `true` ou `pass` sem justificativa não é suficiente.

### Responsabilidade editorial

No fluxo definido pelo proprietário, comprovada por dois relatórios independentes, evidência para cada gate, integridade do conteúdo e validação automática. Não inventar uma terceira aprovação; encaminhar riscos e divergências ao proprietário para correção de regra ou conteúdo.

## Onde a API entra

A API pode executar um serviço de geração/auditoria fora do PWA:

```text
passagem + instruções
        ↓
API de geração
        ↓
rascunho estruturado
        ↓
API ou script de auditoria
        ↓
relatório dos 36 gates
        ↓
gate determinístico de publicação
        ↓
conteúdo aprovado publicado no PWA
        ↓
PWA estático/offline
```

A API deve ficar em um script, servidor ou CI protegido. A chave nunca deve ser enviada ao navegador nem gravada no repositório público.

## Decisão para este projeto

Hoje, o projeto ainda não possui estudos auditados pelas APIs nem uma pipeline executável de geração/auditoria/publicação. O validador local de política dos dois auditores e seus testes foram preparados nesta cópia de trabalho. Portanto, a afirmação correta é: **o contrato dos 36 critérios está preservado; nenhum conteúdo passou pelas duas APIs e nada foi publicado como estudo aprovado**.

O pipeline vigente seleciona automaticamente duas das três APIs disponíveis, executa o piloto de 88 versículos, mede consumo real e publica automaticamente somente itens com dupla aprovação e hash íntegro.
