# Validação — etapas 1 e 2

Base: `main` em `801bc7c0570304506fe24beea4cc1ec4449b08df`.
Ambiente: Windows, Node.js 24, Playwright/Chromium headless, servidor HTTP local no subcaminho `/IA-Automa-es-/`.

## Baseline executado antes das correções

| Largura | scrollWidth | Etapas do questionário visíveis | pageerror |
|---|---:|---:|---:|
| 320 | 509 | 3 | 0 |
| 390 | 579 | 3 | 0 |
| 768 | 992 | 3 | 0 |
| 1440 | 1440 | 3 | 0 |

Capturas: `evidence/before/{320,390,768,1440}.png` e `results.json`.

## Correções verificadas

- Menu móvel passou de drawer deslocado para dropdown limitado à largura da tela. Nenhum `overflow-x:hidden` usado para mascarar o problema.
- Escape, retorno de foco ao botão e fechamento após navegação/saída do menu.
- Uma etapa do questionário por vez; foco acompanha navegação.
- Abas com setas, Home/End, seleção ARIA e tabindex itinerante.
- Conversa rolável acessível ao teclado; CTA desktop com contraste corrigido.
- Preferência de movimento reduzido respeitada no carregamento e na mudança durante a sessão. Sem seções invisíveis por animações de scroll.
- Contato comercial validado, telefone incluído na mensagem e nenhuma limpeza silenciosa do formulário.

## Resultado automatizado após correções

- `npm test`: **20/20 testes unitários aprovados**, incluindo regressão para histórico com estado incompatível com seus eventos e recarga dos três estados válidos.
- `npm run test:browser`: **4/4 larguras aprovadas**, mais **2/2 cenários de armazenamento** (inválido e bloqueado).
- Playwright: sem overflow horizontal do documento, imagens carregadas, âncoras internas existentes, sem respostas HTTP >=400 e sem erros JS/console nas quatro larguras.
- Fluxo: quatro categorias, envio por teclado, erro vazio, estados, cinco eventos após conclusão, recarga, exclusão/cancelamento, repetição, texto de 1.000 caracteres e HTML renderizado literalmente.
- O fluxo local não abriu janela externa nem fez requisição de mutação. Contato comercial testado por interceptação de `window.open`, sem contatar o WhatsApp.
- axe-core: **0 violações detectadas** nas regras WCAG 2 A/AA e WCAG 2.1 AA avaliadas, nas quatro larguras. Isso não constitui certificação completa de acessibilidade.
- Lighthouse não executado. Nenhuma nota de performance foi atribuída.

Capturas posteriores: `evidence/after/panel-*.png` (dashboard com quatro solicitações), `dashboard-*.png`, `full-*.png`, `stress-panel-*.png` e relatório `results.json`. Nas capturas isoladas de painel, somente o header sticky é temporariamente ocultado pelo teste, para não sobrepor o recorte; as capturas de viewport/página mantêm o header.

Reprodução em clone local limpo: `npm ci`, `npm test` e `npm run test:browser` aprovados, com árvore Git limpa antes e após a execução.

As evidências binárias ficam locais, fora do Git. Scripts e lockfile permitem reproduzir os testes. Nenhum deploy ou serviço externo de automação foi ativado.
