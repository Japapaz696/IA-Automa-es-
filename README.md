# Lucas AI — Automações e Inteligência Artificial

Landing page com laboratório funcional de automação local de atendimento, além de conversas ilustrativas sobre possibilidades de IA e integrações.

## Objetivo

Apresentar cenários de automação de forma visual e interativa, deixando claro que as experiências do site são demonstrações locais.

## Funcionalidades

- demonstrações de fluxos de atendimento, agendamento e captação;
- simulador local de diagnóstico;
- navegação responsiva e componentes interativos;
- feedbacks de interface sem envio de dados a serviços externos.
- laboratório de atendimento com validação, classificação determinística, filas e estados;
- histórico de eventos persistido em LocalStorage, com indicadores calculados dos registros locais;
- exemplos de suporte, agendamento, vendas e atendimento geral, repetição de testes e limpeza com confirmação.

## Demonstrações

As conversas predefinidas e o diagnóstico são ilustrativos; não representam integrações ativas com sistemas de terceiros. O laboratório em **“Da mensagem à fila de atendimento”** executa operações reais apenas no navegador. Classificação por palavras-chave **não é IA generativa** e pode interpretar ambiguidades incorretamente.

### Fluxo local

1. Recebe e valida mensagem de 5 a 1.000 caracteres, após remover espaços nas extremidades.
2. Normaliza acentos e caixa e aplica regras. Prioridade em intenções mistas: **suporte → agendamento → vendas → geral**. A justificativa aparece em cada solicitação.
3. Registra recebimento, classificação e encaminhamento à fila interna.
4. Permite avançar **Na fila → Em atendimento → Concluída**, registrando cada evento.
5. Calcula totais por estado e fila a partir do histórico, sem números fictícios iniciais.
6. Permite repetir a mesma mensagem como outra solicitação e limpar os dados com confirmação.

Não reserva horários nem envia mensagens a WhatsApp, e-mail ou CRM. O formulário **comercial** continua separado: somente ele abre o WhatsApp com uma mensagem preparada pelo usuário.

### Armazenamento e limites

- Use somente dados fictícios. Não há autenticação, criptografia ou sincronização entre dispositivos/abas.
- Até 100 solicitações por navegador/origem, na chave `lucas-ai.requests.v1`; ao atingir o limite, é necessário limpar os dados. Nada é descartado silenciosamente.
- O histórico é validado na carga. Dados inválidos são ignorados com aviso; uma nova ação tenta salvar um novo histórico.
- Se o armazenamento falhar, a interface avisa e continua em memória. Na limpeza, falhas de remoção também são informadas.

## Tecnologias

HTML, CSS e JavaScript. Os assets visuais e scripts ficam em `assets/`.

## Como executar

Use Node.js 22 ou superior e um servidor HTTP local:

```bash
npm ci
npm start
```

Abra `http://127.0.0.1:8086/IA-Automa-es-/`. O servidor também atende `/` para verificar caminhos relativos. Ele é uma ferramenta local de desenvolvimento, não um backend de produção.

## Testes

```bash
npm test
npx playwright install chromium
npm run test:browser
```

`npm test` usa somente `node:test`. Playwright e axe-core são dependências de desenvolvimento; nenhum pacote é enviado ao usuário do site.

O teste de navegador inicia e encerra seu próprio servidor HTTP e usa `/IA-Automa-es-/`. Cobre 320, 390, 768 e 1440 px, menu, teclado, abas, questionário, contato (URL interceptada, sem envio), fluxo local, persistência, estados, exclusão, conteúdo hostil como texto e falhas de armazenamento. Gera capturas e relatório em `evidence/after/` (ignorado pelo Git).

### Integração contínua

`.github/workflows/ci.yml` executa em pull requests para `main`, inclusive Draft: Node.js 22, `npm ci`, `npm test`, `npx playwright install --with-deps chromium` e `npm run test:browser`, em Ubuntu. O servidor HTTP é iniciado pelo próprio teste. Capturas e relatórios são disponibilizados como artefato por 7 dias, quando gerados.

Não usa secrets, APIs pagas, banco externo ou serviço de deploy. O workflow solicita apenas leitura do conteúdo do repositório. O uso do runner está sujeito às políticas e cotas do GitHub Actions.

`tests/baseline.cjs` é uma ferramenta de captura/diagnóstico, sem asserts de aprovação; o baseline anterior às correções está registrado em `docs/validation.md`.

## Estrutura do fluxo

- `assets/js/automation.js`: funções puras de validação, regras, transições, indicadores e persistência, compartilhadas com os testes Node.
- `assets/js/automation-ui.js`: formulário, dashboard e feedback acessível; entrada do usuário renderizada com `textContent`, não HTML.
- `assets/js/app.js`: navegação e demonstrações ilustrativas existentes.

## Próxima etapa (não implementada)

- publicar um deploy com URL confirmada;
- avaliar adaptador opcional de IA e integrações reais somente com autorização, segredos no servidor e limites de uso;
- adicionar tratamento de dados e autenticação adequados ao caso de uso.

## Autor

[Lucas Santana da Paz](https://github.com/Japapaz696)
