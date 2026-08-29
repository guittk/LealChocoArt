# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## `firestore.rules` is shared with Ápice — never deploy without syncing

The Firebase project (`fb-general-stores`) hosts **2 apps** now: this one and
Ápice (`D:\- Projetos -\Thurgh\_GitHub\Apice`). Firestore rules are
per-project, not per-app — `firebase deploy --only firestore:rules` from
either repo replaces the **entire** database's ruleset, not just that app's
collections. This already broke production once (2026-08-12): a deploy from
Ápice wiped this app's `lealchocoart_*` rules and vice versa.

**Fix in place**: `firestore.rules` here is kept **byte-identical** to
`Apice/firestore.rules` — it contains both apps' rules, one section per app.
**Any edit to this file must be copied to the other repo before the next
deploy of either of them**, or the next deploy elsewhere will silently revert
this app's rules. Storage rules live only in the Ápice repo (only it deploys
Storage), and already reserve a public-read rule for this app's root-level
asset files (`fbStorage.ref("Logo Circle.png")` etc. — single path segment,
no folder).

The file still carries a legacy `centrocomercial_*` section: that third app
was rebuilt as **Domuo** (`D:\- Projetos -\Thurgh\_GitHub\Domuo`) on its own
**separate** Firebase project (`domuo-app`), so it no longer reads this
ruleset and no longer needs syncing. The `centrocomercial_*` rules are dead
(nothing writes those collections anymore) — left in place rather than
removed since deleting them changes production rules for no functional gain.

## O Storage é somente-leitura para o cliente

`Apice/storage.rules` (único repo que faz deploy de Storage) cobre a raiz do
bucket com `match /{fileName}` → `allow read: if true; allow write: if false;`.
Ou seja: **o app não consegue subir nada para o Storage**. Fotos de produto e
imagens de mapa são gravadas como data URL dentro do próprio documento do
Firestore, depois de passarem por `processImage()`, que redimensiona para no
máximo 1400px e comprime em JPEG até o data URL caber com folga no teto de
1 MB por documento. Migrar para Storage exige mexer nas regras no repo do
Ápice primeiro.

## O que é isto

Leal ChocoArt é a vitrine + painel administrativo de uma confeitaria artesanal
(**bolos e doces em geral**, não só chocolate). Sem build, sem framework, sem
gerenciador de pacotes — HTML/CSS/JS ES5 puro, publicado no **Firebase
Hosting** (`firebase deploy --only hosting:lealchocoart`, alvo `lealchocoart`
no projeto `fb-general-stores`) em `lealchocoart.guilherme-oliveira.com`. O
código-fonte fica em `github.com/guittk/LealChocoArt`, mas **não há GitHub
Actions nem GitHub Pages** — dar `git push` sozinho não publica nada, é
preciso rodar o deploy do Firebase depois.

**Fluxo padrão após qualquer alteração**: `node --check js/app.js` → subir o
`?v=` de cache-busting → `git commit` → `git push` → `firebase deploy --only
hosting:lealchocoart`. Commit, push e esse deploy de hosting são automáticos,
sem precisar confirmar a cada vez. **Exceção**: deploy de `firestore.rules`
(`firebase deploy --only firestore:rules`) sempre exige confirmação explícita
antes de rodar — ver seção acima sobre por que isso já quebrou produção.

```
index.html         casca: meta OG/JSON-LD, fontes, CSS/JS, scripts do Firebase, <div id="app">
manifest.json      PWA (instalável na tela de início)
css/style.css      folha única; paleta em custom properties no :root
js/app.js          a aplicação inteira (estado, render, Firebase, eventos)
assets/images/     imagens locais de reserva + og-cover.png + ícones do PWA
```

## Comandos

Não há build/lint/test (sem `package.json`). A única verificação disponível é
a checagem de sintaxe, que é o que rodar depois de editar `js/app.js`:

```bash
node --check js/app.js
```

Para visualizar: abra `index.html` no navegador ou sirva a pasta com qualquer
servidor estático (`.claude/launch.json` já traz um).

**Cache-busting**: `index.html` carrega `css/style.css?v=<timestamp>` e
`js/app.js?v=<timestamp>`. **Suba esse valor a cada mudança** nos dois — sem
isso testadores continuam rodando código velho sem nenhum erro visível.

## Paleta

Todas as cores saem das 4 do logo: violeta `#B070F8`, lilás `#D0A8F8`, blush
`#F8E0E8` e carvão `#202020`. O carvão é cinza neutro puro — é ele que dá o
fundo do modo escuro (`--bg:#161618`), que por isso é cinza de verdade, sem
viés de matiz. Os tokens claros e escuros estão auditados em AA (≥4.5:1) em
todos os pares de texto/superfície; ao mexer numa cor, refaça a conta.

O modo escuro é declarado **duas vezes** de propósito: em
`@media (prefers-color-scheme:dark) :root:not([data-theme="light"])` e em
`:root[data-theme="dark"]`, para que a preferência do sistema e o botão de
tema vençam um ao outro na direção certa.

## Arquitetura

Tudo vive em `js/app.js`. Cinco coisas para entender antes de mexer:

### 1. Render: template string + reconciliação de DOM (não innerHTML)

`render()` remonta o app **inteiro** como uma string e reconcilia contra o DOM
via `morphInto` → `morphChildren` → `morphNode`/`morphSyncAttrs`. Isso existe
para evitar o clássico `innerHTML = html`, que destruiria foco, posição do
cursor e valores em edição a cada tecla enquanto o Firestore empurra
atualizações. `morphNode` trata cada tag: nunca sobrescreve `value` do
elemento focado, ignora `<input type="file">` e preserva o `open` de
`<details>`.

**Implicação**: nunca troque o morph por `innerHTML`, e qualquer classe que o
JS adicione depois do render (ex.: `is-in` das animações) precisa ser
**reemitida pelo próprio render**, senão a reconciliação a remove.

### 2. Componentes são funções que devolvem string

Sem JSX. `sectionHero()`, `productBand()`, `todayPanel()`, `pageAdminPanel()`…
concatenam HTML e devolvem string. `icon(name, size, color)` é o sistema de
ícones inteiro — um objeto de paths SVG. Adicione ícones lá, não inline.

### 3. Eventos: listeners delegados por `data-action`

Há listeners únicos em `document` para `click`, `keydown`, `input`, `change` e
`submit`. Cada um lê `data-action` (e `data-id` / `data-locid` / `data-ruleid`
/ `data-idx`…) de `e.target.closest('[data-action]')`. Para adicionar um
controle: renderize com `data-action="algo"` e acrescente um ramo no listener
certo.

- `change` dispara no blur em campos de texto, então não re-renderiza a cada tecla.
- `input` é só para o que precisa reagir ao vivo (máscara de telefone, busca de
  pedidos, planejamento de compras) e passa por `debounce`.

### 4. Firestore é o backend; `state` é o espelho local

Coleções prefixadas com `lealchocoart_`. `initFirebaseSync()` assina
`products`, `locations`, `scheduleTemplate`, `scheduleExceptions` e
`scheduleExtras` (leitura pública); `orders`, `ingredients`, `packagingItems` e
`settings/financeGoals` só depois do login (`attachAuthGatedSync`). Escritas
via `dbSet(path, value)` / `dbRemove(path)`.

**Baixa de estoque**: o cliente que faz o pedido **não está autenticado**, e as
regras exigem auth para escrever em `products`. Por isso o pedido guarda
`items[].productId` e um campo `stockApplied:false`; `reconcileStock()` roda na
primeira sessão de admin autenticada e aplica os descontos num batch, marcando
`stockApplied:true` — idempotente, reprocessar não desconta de novo. Na tela do
cliente o estoque cai de forma otimista só na sessão dele.

### 5. Agenda: regras recorrentes → horários concretos

- `state.scheduleTemplate`: regras `{ locationId, weekdays:[0-6], startTime, endTime }`.
- `generateAgenda(days, minLead)` expande em ocorrências datadas. `minLead` é o
  prazo mínimo de produção: a **exibição** usa `0` (mostra tudo que ainda vai
  acontecer) e o **seletor do pedido** usa `SHOP.leadMinutes`, para o cliente não
  conseguir encomendar algo que começa em 2 minutos.
- `state.scheduleExceptions` cancela uma ocorrência específica;
  `state.scheduleExtras` são horários avulsos fora do padrão.
- `minuteTick()` re-renderiza quando o minuto vira — sem isso uma aba deixada
  aberta continuaria mostrando "Vendendo agora" horas depois.
- No pedido, os dados do horário são **congelados** (`pickupDate`,
  `pickupStart`, `pickupEnd`, `slotId`) para que editar a agenda não reescreva
  o passado.

## Landing page

Seções na ordem: `sectionHero`, `sectionProdutos`, `sectionLocalizacao`,
`sectionQuemFaz`, `sectionContato`.

- **Produtos** são **faixas horizontais** (`.band`), foto de um lado e conteúdo
  do outro, alternando o lado. Foi feito para ficar bom com **um único
  produto** — por isso ocupa a largura inteira do container e o carrinho fica
  **abaixo**, não numa coluna lateral.
- **Onde estamos** é um painel de "hoje" (status + mapa) + uma faixa de dias
  navegável (`.day-chip`) + os horários do dia escolhido + os pontos de
  retirada. Toda a informação da versão antiga, sem os sete cartões empilhados.
- **Animações**: `.reveal` + `IntersectionObserver`. O estado escondido só vale
  sob `html.reveal-ready`, ligado pelo próprio JS, e há uma rede de segurança
  (checagem por `getBoundingClientRect` no scroll + `revealAll()` após 4s) —
  conteúdo preso em `opacity:0` seria o pior defeito possível aqui.

**Não use `overflow` nem `height:100%` em `html`/`body`.** `overflow-x:hidden`
faz do corpo um container de rolagem próprio e `clip` leva o eixo Y junto; nos
dois casos a janela para de rolar e as animações nunca disparam. Os enfeites
decorativos já são recortados por `.hero`/`.section`.

## Fluxo de encomenda

Modal com `role="dialog"`, foco preso, Escape para fechar e trava de rolagem
(classe `no-scroll` em `html` **e** `body`). Dois modos:

- **agenda** — Local → Dia → Horário em selects encadeados.
- **combinar** — para pontos `ordersOnly` e pedidos sob medida: escolhe o ponto
  e a data desejada, e a Julia confirma o horário.

Ao enviar, grava no Firestore e mostra a confirmação com **código do pedido**
(`makeOrderCode()`) e um botão que abre o **WhatsApp com o resumo pronto**
(`orderWaText`/`orderWaLink`). Configurações públicas do negócio (WhatsApp,
chave Pix, `leadMinutes`) ficam na constante `SHOP` no topo do arquivo — não no
Firestore, porque a coleção `settings` exige auth para leitura.

## Painel admin (`state.page === 'admin'`)

Abas: **Doces** (inclui "esconder do site" — `hidden`, separado de
`available`), **Encomendas** (retiradas de hoje, produção pendente, busca e
filtros, agrupamento por dia), **Agenda**, **Pontos**, **Análises** e
**Financeiro**.

- **Análises** cruza faturamento com o custo vindo de `recipeCosts()` — lucro
  real por doce, por ponto e por dia da semana — com recorte de período
  (30 dias / mês / tudo) e opção de contar só concluídos.
- **Financeiro** tem sete sub-abas: Resumo, Ingredientes, Embalagens, Receitas,
  Metas, **Compras** e Histórico.
  - **Metas** aceita meta de **lucro** ou de **faturamento**, custo fixo mensal,
    taxa MEI, e um **cenário de mix** (`computeMixScenario`) para a conta
    considerar vários doces ao mesmo tempo em vez de um só.
  - **Compras** (`computeShoppingList`) responde "quanto preciso gastar para
    produzir X": converte o plano em quantidade de insumo, arredonda para
    **potes inteiros** (que é como a loja vende) e compara o custo cheio com o
    custo proporcional — a diferença é estoque que sobra, não prejuízo.

**Lembretes de retirada são client-side e só do admin** (não há Cloud Functions
nem push): `checkPickupReminders()` roda num `setInterval`, sinaliza pedidos a
menos de 10 min do `pickupStart` e mostra faixa no painel, mais uma
`Notification` nativa se a permissão foi concedida. Só dispara com uma aba de
admin aberta.

## `DEFAULT_*` são semente, não configuração

`DEFAULT_PRODUCTS` / `DEFAULT_LOCATIONS` / `DEFAULT_SCHEDULE_TEMPLATE` servem
para dois fins: estado local antes do Firestore conectar **e** semente única
(`seedFirebaseIfEmpty()`) escrita na primeira vez que a coleção está vazia.
Depois que a produção foi semeada, editar essas constantes não muda mais nada
no site — as alterações reais têm que passar pelo painel (ou pelo console).
