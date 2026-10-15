# Estado atual — baseline visual e funcional

- Bíblia N4 integral mantida sem alterações.
- Busca local, marcadores de capítulo, retomada de leitura, favoritos, anotações e backup local implementados.
- Tela inicial, ambiente de reflexão, quadro institucional e cartões de temas com identidade visual consistente.
- Imagens visuais otimizadas em WebP e incluídas no cache offline.
- Nenhum estudo foi gerado pelo Qwen nem auditado pelas APIs até esta versão; não há conteúdo aprovado. O PWA agora possui o manifesto público `content/studies-approved.json`, inicialmente vazio, e só renderiza itens com aprovação dupla completa.
- Entrada de geração preparada para o piloto provisório Marcos 1:1–3:15 (88 versículos): `runs/piloto-marcos-1-1-3-15/generation-input.json`.
- Preparador offline, prompt do Qwen, fila e teste da contagem de 88 versículos adicionados; Kaggle/Secrets ainda não estão disponíveis nesta sandbox.
- Regra fixa de auditoria: Gemini e Groq; ambos devem aprovar todos os 36 critérios. Cloudflare não participa da auditoria.
- Gate local e testes da política dupla adicionados; ainda não há integração executável com Gemini/Groq nem publicação automática de estudos.
- Música “Art Of Silence V2”, de Uniq, incluída sob CC BY 4.0, com atribuição e reprodução opcional, sem autoplay; teste real no Android pendente.
- Validação determinística no GitHub Actions atualizada para testar baseline e política de auditoria.
- Service worker em revisão para atualização confiável e cache offline com recursos versionados.
- Teste físico no Android ainda pendente.
- Hospedagem permanente ainda pendente; a prévia do sandbox é temporária.
- Próxima prioridade: executar o piloto de conteúdo ensinativo em linguagem clara, registrar consumo real e integrar Qwen/Kaggle → Gemini + Groq → gate automático → publicação no PWA após aprovação dupla.
