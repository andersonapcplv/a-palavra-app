# Música instrumental ambiente — decisão atual

## Faixa selecionada

O PWA inclui **“Paz e Reflexão”**, composição instrumental original do próprio projeto. A versão atual foi revisada porque a primeira tentativa ficou parecida com um zumbido contínuo, e não com um ambiente de paz.

A faixa atual não possui drone grave contínuo. Usa eventos harmônicos curtos e espaçados, registro médio/agudo, pequenos acentos muito discretos e pausas naturais. Não possui bateria, voz nem ritmo marcado.

Não há dependência de licença externa: a faixa foi sintetizada localmente para o aplicativo, sem IA, sem API e sem consumo de créditos. O hash e os parâmetros gerais estão em `docs/AUDIO_CREDITS.md`.

O arquivo incluído é `assets/audio/palavra-paz-reflexao.ogg`, em Ogg Opus. Foi mantido curto e leve para uso offline.

## Interação e privacidade

O áudio fica desligado por padrão, sem autoplay. O usuário inicia a reprodução pelo botão, pode pausar e controla o volume em faixa baixa. A preferência de volume fica somente no dispositivo.

## Testes recomendados no Android

- Reproduzir por alguns minutos e confirmar que não há sensação de zumbido.
- Confirmar que a faixa permanece discreta durante a leitura.
- Confirmar que o áudio não inicia sozinho após instalar, atualizar ou reabrir o PWA.
- Confirmar a reprodução offline após o primeiro carregamento.
