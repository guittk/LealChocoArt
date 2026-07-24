# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Leal ChocoArt is a static storefront + admin panel for a small artisanal chocolate/pão-de-mel business. There is no build step, no framework, and no package manager — it's plain HTML/CSS/vanilla ES5-style JS, deployed to GitHub Pages at `lealchocoart.guilherme-oliveira.com` (see `CNAME`) from `github.com/guittk/LealChocoArt`.

```
index.html        shell only: fonts, css/js includes, Firebase CDN scripts, empty <div id="app">
css/style.css      one flat stylesheet, palette defined as CSS custom properties in :root
js/app.js          the entire application (state, rendering, Firebase, event handling)
assets/images/     local fallback images (logo, product photos, map) used before Firebase Storage resolves
```

## Commands

There is no build/lint/test tooling (no `package.json`). The only verification available is a Node syntax check, which is what to run after editing `js/app.js`:

```bash
node --check js/app.js
```

To preview: just open `index.html` in a browser (or serve the folder with any static file server). There is no dev server config in this repo.

**Cache-busting convention**: `index.html` loads the script as `js/app.js?v=<timestamp>`. Browsers aggressively cache local/static JS, so **bump this query value on every change to app.js** — otherwise testers/users can keep running stale code with no visible error.

## Architecture

This is a single-file SPA built by hand, not with a framework. Everything lives in `js/app.js`. The four things to understand before changing anything:

### 1. Render loop: string templates + DOM morphing (not innerHTML swap)

`render()` rebuilds the *entire* app as one big HTML string (`renderHeader() + sections... + renderFooter() + modals`) and reconciles it into `#app` via a hand-rolled virtual-DOM-style diff: `morphInto` → `morphChildren` → `morphNode`/`morphSyncAttrs`. This exists specifically to avoid the classic bug of `innerHTML = html` on every state change (which would blow away focus, text-input cursor position, and in-progress `<select>`/`<input>` values on every keystroke). `morphNode` has special handling per tag — it skips clobbering `value` on the focused element, never touches `<input type="file">`, and reads `<select>`/`<textarea>` content specially.

**Implication**: never replace `render()`'s morph with a raw `innerHTML` assignment, and don't render admin inputs a fundamentally different way — the whole app depends on this reconciler to keep forms usable while Firebase pushes live updates mid-typing.

### 2. Rendering is component functions returning HTML strings

There's no JSX/templating engine. Every "component" (`sectionHero()`, `sectionProdutos()`, `ProductPhoto()`, `pageAdminPanel()`, etc.) is a plain function that string-concatenates HTML and returns it. `icon(name, size, color)` is the entire icon system — a lookup object of inline SVG path data; add new icons there rather than inlining raw `<svg>` elsewhere.

### 3. Events: three delegated listeners keyed by `data-action`

There are no per-element `addEventListener` calls in the rendered HTML. Instead there are exactly three listeners on `document` — `click`, `change`, `submit` — each of which reads `data-action` (and `data-id`/`data-locid`/`data-ruleid`/etc.) off `e.target.closest('[data-action]')` and dispatches with an if/else-if chain. To add a new interactive control: render it with `data-action="myThing"` (+ whatever `data-*` params it needs), then add a branch to the matching listener (click vs change vs submit) that reads `el.dataset.*` and mutates `state`, then calls `render()`.

### 4. Firebase is the backend; `state` is a local mirror of it

Firebase (Auth + Realtime Database + Storage, loaded via CDN `-compat` scripts, config inline at the top of `app.js`) is the only backend. `initFirebaseSync()` attaches `.on('value', ...)` listeners for the RTDB nodes `products`, `locations`, `scheduleTemplate`, `scheduleExceptions`, `scheduleExtras`, `orders` — each listener overwrites the corresponding `state.*` array and calls `render()`. Writes go the other way through `dbSet(path, value)` / `dbRemove(path)` / `dbPushOrder(order)`. There is no offline queue or optimistic-then-reconcile logic beyond "mutate local state, then fire-and-forget the Firebase write."

- `fbAuth` gates `state.page === 'admin'` (see `pageAdmin()` / `pageAdminLogin()`).
- `fbStorage` hosts uploaded product photos and location map images. `ASSET_FILES` maps logical keys (`logoCircle`, `bombomDeUva`, ...) to Storage filenames; `upgradeBrandAssets()` opportunistically swaps the bundled local fallback (`FALLBACK`, pointing at `assets/images/*`) for the Storage URL once it resolves, but only if the current value still *is* the fallback (so it won't clobber a photo an admin already uploaded).
- `DEFAULT_PRODUCTS` / `DEFAULT_LOCATIONS` / `DEFAULT_SCHEDULE_TEMPLATE` serve two purposes: local `state` before Firebase connects, **and** one-time seed data (`seedFirebaseIfEmpty()`) written to each RTDB node the first time it's empty. Once a node has been seeded in production, editing these JS constants has no further effect on the live site — real edits must go through the admin panel (or the Firebase console) from then on.

### Sales agenda (recurring schedule → concrete slots)

The site does not let customers pick an arbitrary pickup date/time. Instead:

- `state.scheduleTemplate`: recurring rules `{ id, locationId, weekdays: [0-6], startTime, endTime }` ("every Mon–Fri, Facens, 09:20–09:40"), managed from the admin **Agenda** tab.
- `generateAgenda(days)` / `generateAgendaAdmin(days)` expand rules into dated occurrences for the next N days (`AGENDA_DAYS`, currently 7) — the admin variant includes past/cancelled occurrences for management; the public variant filters those out.
- `state.scheduleExceptions` cancels one specific dated occurrence of a rule (e.g. "closed this Friday") without touching the recurring rule itself.
- `state.scheduleExtras` are one-off dated slots outside the recurring pattern.
- In the order modal (`renderModal()`), the customer narrows down via three cascading `<select>`s — Local → Dia → Horário (backed by `state.orderModalLocationId` / `state.orderModalDate`) — down to one generated slot. On submit, that slot's `locationName`/`date`/`startTime`/`endTime` are frozen onto the order (`pickupDate`, `pickupStart`, `pickupEnd`, `slotId`) so later edits to the schedule don't retroactively change past orders.

### Admin panel (`state.page === 'admin'`, tabs in `pageAdminPanel()`)

Produtos, Encomendas, **Agenda** (schedule rules/exceptions/extras above), Locais (physical locations + map/pin editor), **Análises** (`computeAnalytics()` — revenue, top products, top customers, revenue by location/weekday, rendered as simple CSS bar charts, no charting library).

**Pickup reminders are client-side only, admin-side only** (no Cloud Functions / push infra): `checkPickupReminders()` runs on a `setInterval`, flags any order within 10 minutes of its `pickupStart` that hasn't been reminded yet, and shows a banner in the admin panel plus (if permission was granted via the "Ativar aviso" button) a native `Notification`. This only fires while an admin has a tab open in their browser — there's no server-side scheduling.
