# Avaliação técnica — A Palavra

**Data:** 15 de outubro de 2026
**Base avaliada:** cópia local extraída do pacote ZIP e atualizada em 15/10/2026; não representa um commit remoto.
**Escopo:** PWA estático, Bíblia N4, navegação, persistência local, identidade visual e preparação para publicação.

## Veredito executivo

O projeto é **viável e já possui uma base funcional demonstrável**. A leitura bíblica, a busca local, marcadores, jornada, anotações, backup local e navegação principal estão implementados. A identidade visual também já está coerente entre a tela inicial, reflexão, apoio institucional e temas.

Ele ainda não deve ser tratado como produto final por quatro motivos: **conteúdo temático não auditado**, **teste físico Android/offline pendente**, **publicação permanente ainda não habilitada** e **contrato editorial dos estudos ainda incompleto**.

## Classificação atual

| Área | Situação | Avaliação |
|---|---|---|
| Leitura da Bíblia N4 | Implementada | 66 livros, 1.189 capítulos e 31.102 versículos validados |
| Busca e navegação | Implementada | Busca local e navegação de capítulos presentes |
| Jornada, favoritos e anotações | Implementada | Persistência local e exportação/importação disponíveis |
| Identidade visual | Em evolução avançada | Tela inicial, reflexão, apoio e temas já possuem linguagem consistente |
| Offline/PWA | Implementado com risco corrigido nesta etapa | Cache e atualização precisam ser tratados com versionamento confiável |
| Conteúdo de estudos | Pendente | Entrada provisória Qwen preparada para Marcos 1:1–3:15 (88 versículos); não gerada/auditada |
| Direitos do áudio | Licença registrada | “Art Of Silence V2”, Uniq, CC BY 4.0; arquivo incorporado com atribuição, teste Android pendente |
| Geração/auditoria/publicação | Parcialmente preparada | Gate local/testes e entrada Qwen prontos; integração API e deploy automático ainda não implementados |
| Publicação permanente | Pendente | O GitHub Pages não pôde ser habilitado pelo escopo atual do token |
| Teste real em Android | Pendente | Precisa ser feito no aparelho antes de declarar pronto |

## Pontos fortes

1. O corpus bíblico tem integridade estrutural verificada automaticamente.
2. O projeto evita fabricar explicações religiosas e identifica o que ainda está em preparação.
3. A aplicação é estática, sem backend obrigatório, o que reduz custo operacional.
4. As imagens foram otimizadas para WebP e mantidas leves para um PWA.
5. O código possui workflow determinístico no GitHub Actions.
6. A baseline e o gate duplo têm validação determinística; esta cópia veio de ZIP, não tem `.git` e as alterações ainda não foram enviadas.

## Riscos que podem causar problemas futuros

### Alto impacto

- **Conteúdo editorial:** nenhum estudo foi gerado ou auditado. A regra vigente é Gemini Flash + Groq `openai/gpt-oss-120b`, ambos com pass nos 36 critérios e hash íntegro, seguido de publicação direta conforme comando do proprietário.
- **Distribuição:** sem hospedagem permanente, o link atual é apenas uma prévia temporária. É necessário habilitar GitHub Pages ou escolher outro host estático.
- **Offline em dispositivo real:** o comportamento em Android, instalação, atualização do service worker e armazenamento local ainda precisam de teste físico.

### Médio impacto

- **Atualização do cache:** parâmetros de versão no HTML podem fazer recursos novos não coincidirem com chaves antigas do Cache Storage. Esta etapa corrige a estratégia.
- **Crescimento do corpus:** carregar a Bíblia inteira no navegador é aceitável para a baseline, mas busca e memória devem ser medidas em celulares simples.
- **Privacidade:** anotações, favoritos e progresso são locais, mas isso precisa continuar explícito ao usuário; não há sincronização nem recuperação em outro aparelho.

### Baixo impacto

- O áudio ambiente está incluído sob licença CC BY 4.0; audição/volume/offline ainda precisam de teste em Android.
- Os quadros institucionais são visuais, não anúncios conectados a uma rede de publicidade.
- O código ainda está concentrado em poucos arquivos; uma refatoração só será necessária quando o conteúdo crescer.

## O que já é fácil fazer

- adicionar novos cartões e imagens leves;
- publicar a pasta como site estático;
- criar testes determinísticos de arquivos, corpus e referências;
- executar a entrada preparada por Qwen no Kaggle, quando houver credencial autorizada;
- integrar chamadas independentes Gemini e Groq e publicação após gate duplo;
- criar temas como dados estruturados, mantendo rascunhos não auditados fora do app.

## O que exige mais cuidado

- elaborar estudos bíblicos confiáveis;
- executar e medir as duas auditorias reais, mantendo evidências por critério;
- definir direitos autorais de textos, imagens, músicas e fontes;
- sincronizar dados entre dispositivos;
- habilitar autenticação, conta ou pagamentos;
- declarar o produto como pronto para uso amplo.

## Próximas prioridades recomendadas

1. Corrigir e testar atualização/offline do service worker.
2. Fazer teste manual no Android: instalar, abrir offline, ler Bíblia, salvar anotação, fechar e reabrir.
3. Escolher e habilitar uma hospedagem permanente.
4. Confirmar ou alterar o piloto provisório Marcos 1:1–3:15 e executar Qwen/Kaggle.
5. Implementar/testar APIs Gemini + Groq com Secrets e publicar somente pacotes aprovados por ambos.
6. Só depois expandir publicidade, apoio financeiro ou sincronização.

## Conclusão

**É possível concluir o aplicativo.** A parte técnica atual é de dificuldade baixa a média; o maior risco não é programação, mas governança de conteúdo, direitos de distribuição, teste real e publicação permanente. O caminho recomendado é continuar incrementalmente, mantendo o app como leitura bíblica offline funcional enquanto os estudos são preparados com rastreabilidade.
