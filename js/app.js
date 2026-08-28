/* =========================================================
   LEAL CHOCOART
   App de página única, sem build e sem framework.
   Firestore + Auth. Todo o estado vive em `state`; render()
   remonta a UI como string e reconcilia no DOM (morphInto).
========================================================= */

/* ---------- configuração da loja ----------
   Valores públicos do negócio. Ficam aqui (e não no Firestore)
   porque a coleção de settings exige autenticação para leitura,
   e o site público precisa deles. Editar aqui + bump do ?v= no
   index.html publica a mudança. */
var SHOP = {
  whatsapp: '5515998054872',
  instagram: 'https://www.instagram.com/lealchocoart/',
  cidade: 'Sorocaba, SP',
  /* Prazo mínimo entre o pedido e a retirada (minutos).
     Doce artesanal é feito sob encomenda — sem isso o cliente
     consegue pedir um horário que começa em 2 minutos. */
  leadMinutes: 180,
  /* Chave Pix. Deixe '' para o site dizer "combinar no WhatsApp"
     em vez de mostrar uma chave. */
  pixKey: '',
  pixName: 'Leal ChocoArt'
};

var firebaseConfig = {
  apiKey: "AIzaSyDOQZJQiltlQKIIIiYki_JQinAV4lX0m3E",
  authDomain: "fb-general-stores.firebaseapp.com",
  projectId: "fb-general-stores",
  storageBucket: "fb-general-stores.firebasestorage.app",
  messagingSenderId: "780236289961",
  appId: "1:780236289961:web:c4d6ce274d49645d84b6b8"
};
/* Certificado Web Push (VAPID) do Cloud Messaging — chave PÚBLICA,
   feita pra ir no código do cliente (é ela que o navegador usa pra
   provar ao servidor de push que o token pertence a este app). Só
   destrava o lado de INSCREVER o dispositivo; ENVIAR o push no
   momento certo ainda depende de uma Cloud Function, que não existe
   ainda — ver showAdminNotification() e setupPushMessaging(). */
var FCM_VAPID_KEY = "BF11sayYP8bbJedUpEmFdqZMntzd-Q62ZmXcFdNsb6dgo1qVRxNKDmVskrMatA23f2KMsXqXQ92vl8bJQ3bz_hs";

var ASSET_FILES = {
  logoCircle: "Logo Circle.png",
  logoPrincipal: "Logo Principal.png",
  paoDeMel: "Pão de Mel.png",
  bombomDeUva: "Bombom de Uva.png",
  mapaFaculdade: "Mapa Faculdade.png"
};

var FIREBASE_READY = false;
var fbAuth = null, fbDb = null, fbStorage = null;
try {
  firebase.initializeApp(firebaseConfig);
  fbAuth = firebase.auth();
  fbDb = firebase.firestore();
  fbStorage = firebase.storage();
  FIREBASE_READY = true;
} catch (err) { console.warn('Firebase não inicializado:', err); }

/* ---------- ícones ---------- */
function icon(name, size, color){
  size = size || 18; color = color || 'currentColor';
  var paths = {
    menu:'<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>',
    close:'<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
    chevronRight:'<polyline points="9 18 15 12 9 6"/>',
    chevronDown:'<polyline points="6 9 12 15 18 9"/>',
    arrowRight:'<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>',
    arrowLeft:'<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>',
    check:'<polyline points="20 6 9 17 4 12"/>',
    plus:'<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
    minus:'<line x1="5" y1="12" x2="19" y2="12"/>',
    trash:'<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>',
    whatsapp:'<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>',
    instagram:'<rect x="2.5" y="2.5" width="19" height="19" rx="6"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.3" cy="6.7" r="1.1" style="fill:currentColor"/>',
    mapPin:'<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
    clock:'<circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 16 14"/>',
    settings:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    clipboard:'<rect x="6" y="4" width="12" height="17" rx="2"/><rect x="9" y="2" width="6" height="4" rx="1"/>',
    package:'<path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/>',
    treat:'<path d="M12 4c-4 3-7 6.5-7 10a7 7 0 0 0 14 0c0-3.5-3-7-7-10z"/>',
    cake:'<path d="M3 21h18"/><path d="M4 21v-6a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v6"/><path d="M4 16.5c1.6 0 1.6 1.4 3.2 1.4s1.6-1.4 3.2-1.4 1.6 1.4 3.2 1.4 1.6-1.4 3.2-1.4 1.6 1.4 3.2 1.4"/><path d="M12 12V9"/><circle cx="12" cy="7" r="1.4"/>',
    bag:'<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>',
    heart:'<path d="M12 21s-7-4.35-9.5-8.5C.5 8.5 3 4 7 4c2 0 3.5 1 5 3 1.5-2 3-3 5-3 4 0 6.5 4.5 4.5 8.5C19 16.65 12 21 12 21z"/>',
    star:'<polygon points="12 2.6 15.1 9 22 9.9 17 14.7 18.2 21.6 12 18.3 5.8 21.6 7 14.7 2 9.9 8.9 9" style="fill:currentColor;stroke:none"/>',
    sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon:'<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
    lock:'<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    logout:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
    edit:'<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>',
    grip:'<circle cx="9" cy="6" r="1.4" style="fill:currentColor;stroke:none"/><circle cx="15" cy="6" r="1.4" style="fill:currentColor;stroke:none"/><circle cx="9" cy="12" r="1.4" style="fill:currentColor;stroke:none"/><circle cx="15" cy="12" r="1.4" style="fill:currentColor;stroke:none"/><circle cx="9" cy="18" r="1.4" style="fill:currentColor;stroke:none"/><circle cx="15" cy="18" r="1.4" style="fill:currentColor;stroke:none"/>',
    download:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
    camera:'<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>',
    calendar:'<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
    chart:'<line x1="4" y1="20" x2="4" y2="12"/><line x1="10" y1="20" x2="10" y2="7"/><line x1="16" y1="20" x2="16" y2="4"/><line x1="2" y1="21" x2="22" y2="21"/>',
    bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
    x:'<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
    coin:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9.3c.3-1 1.2-1.5 2.5-1.5 1.6 0 2.8.8 2.8 2 0 1.5-1.4 1.8-2.8 2.2-1.4.4-2.8.8-2.8 2.3 0 1.2 1.2 2 2.8 2 1.3 0 2.2-.5 2.5-1.5"/><line x1="12" y1="6" x2="12" y2="7.8"/><line x1="12" y1="16.2" x2="12" y2="18"/>',
    search:'<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.5" y2="16.5"/>',
    filter:'<polygon points="22 3 2 3 10 12.5 10 19 14 21 14 12.5"/>',
    eye:'<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/>',
    eyeOff:'<path d="M17.9 17.9A10.6 10.6 0 0 1 12 19c-7 0-11-7-11-7a19 19 0 0 1 5.1-5.9"/><path d="M9.9 4.2A10.9 10.9 0 0 1 12 5c7 0 11 7 11 7a19 19 0 0 1-2.7 3.7"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/><line x1="2" y1="2" x2="22" y2="22"/>',
    copy:'<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    truck:'<rect x="1" y="6" width="13" height="10" rx="1.5"/><path d="M14 9h4l3 3.2V16h-7z"/><circle cx="5.5" cy="18" r="2"/><circle cx="17.5" cy="18" r="2"/>',
    sparkle:'<path d="M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4z"/><path d="M18.5 3.5l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/>',
    scale:'<path d="M12 3v18"/><path d="M5 7h14"/><path d="M7.5 7L4 14h7z"/><path d="M16.5 7L13 14h7z"/><path d="M8 21h8"/>',
    cart:'<circle cx="9" cy="20" r="1.6"/><circle cx="18" cy="20" r="1.6"/><path d="M2 3h3l2.4 12.1a1.8 1.8 0 0 0 1.8 1.4h8.4a1.8 1.8 0 0 0 1.8-1.4L21 7H6.2"/>',
    refresh:'<polyline points="21 3 21 9 15 9"/><path d="M20.1 13A8.4 8.4 0 1 1 18 6.3L21 9"/>',
    info:'<circle cx="12" cy="12" r="9"/><line x1="12" y1="11" x2="12" y2="16"/><circle cx="12" cy="7.8" r="1" style="fill:currentColor"/>',
    alert:'<path d="M10.3 3.6L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.6a2 2 0 0 0-3.4 0z"/><line x1="12" y1="9" x2="12" y2="13"/><circle cx="12" cy="17" r="1" style="fill:currentColor"/>',
    wallet:'<path d="M3 7a2 2 0 0 1 2-2h13a1 1 0 0 1 1 1v2"/><rect x="3" y="7" width="18" height="13" rx="2"/><circle cx="16.5" cy="13.5" r="1.3" style="fill:currentColor"/>',
    list:'<line x1="9" y1="6" x2="21" y2="6"/><line x1="9" y1="12" x2="21" y2="12"/><line x1="9" y1="18" x2="21" y2="18"/><circle cx="4.5" cy="6" r="1.3" style="fill:currentColor"/><circle cx="4.5" cy="12" r="1.3" style="fill:currentColor"/><circle cx="4.5" cy="18" r="1.3" style="fill:currentColor"/>'
  };
  return '<svg class="icon" width="'+size+'" height="'+size+'" viewBox="0 0 24 24" style="color:'+color+'" aria-hidden="true" focusable="false">'+(paths[name]||'')+'</svg>';
}

/* ---------- tema (claro/escuro) ----------
   Aplicado em <html>, que fica fora de #app — a reconciliação
   do DOM nunca encosta nele. */
var THEME_KEY = 'lca-theme';
function storedTheme(){ try { return localStorage.getItem(THEME_KEY); } catch(e){ return null; } }
function systemTheme(){ return (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light'; }
function applyTheme(theme){
  document.documentElement.setAttribute('data-theme', theme);
  try { localStorage.setItem(THEME_KEY, theme); } catch(e){}
}
function initTheme(){
  var t = storedTheme() || systemTheme();
  state.theme = t;
  document.documentElement.setAttribute('data-theme', t);
}
function ThemeToggle(){
  var isDark = state.theme === 'dark';
  return '<button class="icon-btn theme-toggle" data-action="toggleTheme" title="'+(isDark?'Mudar para tema claro':'Mudar para tema escuro')+'" aria-label="Alternar entre tema claro e escuro">' +
    icon(isDark ? 'sun' : 'moon', 18) + '</button>';
}

/* ---------- imagens locais de reserva ---------- */
var FALLBACK = {
  logoCircle: "assets/images/logo-circle.png",
  logoPrincipal: "assets/images/logo-principal.png",
  paoDeMel: "assets/images/pao-de-mel.jpg",
  bombomDeUva: "assets/images/bombom-de-uva.jpg",
  mapaFaculdade: "assets/images/mapa-faculdade.jpg"
};
var LOGO_CIRCLE = FALLBACK.logoCircle;
var LOGO_PRINCIPAL = FALLBACK.logoPrincipal;

/* ---------- dados iniciais / semente ---------- */
var DEFAULT_PRODUCTS = [
  { id:'p2', name:'Pão de Mel', desc:'Massa macia de mel e especiarias, recheada com doce de leite e banhada em chocolate.', ingredients:'Mel, canela, cravo, doce de leite artesanal, chocolate ao leite.', price:7.5, stock:15, available:true, hidden:false, photo:FALLBACK.paoDeMel },
  { id:'p1', name:'Bombom de Uva', desc:'Uva fresca envolta em chocolate belga meio amargo.', ingredients:'Chocolate belga 54%, uva in natura, manteiga de cacau.', price:6, stock:20, available:true, hidden:false, photo:FALLBACK.bombomDeUva }
];
var DEFAULT_LOCATIONS = [
  { id:'faculdade', name:'Faculdade', address:'', mapImage:FALLBACK.mapaFaculdade, pin:{ x:63, y:44, label:'Sala A24' }, ordersOnly:false, hidden:false },
  { id:'condominio', name:'Condomínio', address:'', mapImage:null, pin:null, ordersOnly:false, hidden:false },
  { id:'igreja', name:'Igreja', address:'', mapImage:null, pin:null, ordersOnly:true, hidden:false }
];

/* ---------- agenda ---------- */
var AGENDA_DAYS = 7;     /* faixa de dias mostrada no site */
var ORDER_DAYS = 14;     /* até quando o cliente pode encomendar */
var WEEKDAY_LABELS = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
var WEEKDAY_SHORT = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
var MONTH_SHORT = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
var DEFAULT_SCHEDULE_TEMPLATE = [
  { id:'sch1', locationId:'faculdade', weekdays:[1,2,3,4,5], startTime:'09:20', endTime:'09:40', order:0 },
  { id:'sch2', locationId:'faculdade', weekdays:[1,2,3,4,5], startTime:'11:40', endTime:'12:00', order:1 },
  { id:'sch3', locationId:'condominio', weekdays:[0,1,2,3,4,5,6], startTime:'13:00', endTime:'22:00', order:2 }
];

var DEFAULT_GOALS = {
  goalMode: 'lucro',      /* 'lucro' = quanto quer sobrar | 'faturamento' = quanto quer vender */
  profitGoal: 1500,
  monthlyGoal: 0,         /* meta de faturamento (nome antigo, mantido por compatibilidade) */
  daysPerWeek: 6,
  includeTax: true,
  meiMonthlyFee: 76.90,
  fixedMonthlyCost: 0,    /* gás, energia, transporte… por mês */
  laborHourCost: 0,       /* quanto vale 1h de produção */
  useMix: false,
  mix: {}                 /* { produtoId: percentual } */
};

/* ---------- estado ---------- */
var state = {
  page: 'site',
  theme: 'light',
  menuOpen: false,

  /* carrinho / encomenda */
  cart: {},
  modalOpen: false,
  orderMode: 'agenda',          /* 'agenda' | 'combinar' */
  orderModalLocationId: null,
  orderModalDate: null,
  orderPayment: 'combinar',
  orderErrors: {},
  confirmOpen: false,
  lastOrder: null,

  /* site */
  agendaDate: null,             /* dia selecionado na faixa da semana */
  revealed: {},

  /* admin */
  adminTab: 'produtos',
  financeTab: 'resumo',
  analysesTab: 'vendas',
  addingProduct: false,
  addingLocation: false,
  addingScheduleRule: false,
  addingExtraSlot: false,
  addingIngredient: false,
  addingPackaging: false,
  metasSingleQty: 5,
  metasGoalProductId: null,
  lossDraft: null,        /* rascunho da perda em edição: { productId, batches, date, note, includeLabor, includePackaging, lostIngredientIds } */
  confirmDialog: null,          /* { title, text, danger, action, payload } */
  priceChangeModal: null,
  historySelectedKeys: null,
  editingHistoryEntry: null,   /* { kind, id, date } — linha do histórico de preço em edição */
  orderFilter: { q:'', status:'todos', when:'todos', paid:'todos' },
  trackCode: '',              /* código digitado/da URL na página pública de acompanhamento */
  trackLoading: false,
  trackResult: null,          /* doc de lealchocoart_orderTracking já buscado */
  trackError: '',
  analyticsPeriod: '30',
  analyticsOnlyDone: false,
  planQty: {},                  /* planejamento de produção: { produtoId: qtd } */
  consumptionRate: {},          /* ritmo de venda: { produtoId: unidades por dia } */
  restockPacks: {},             /* potes comprados por vez: { "kind:id": n } */

  /* auth / dados */
  authUser: null,
  authError: '',
  products: DEFAULT_PRODUCTS.slice(),
  orders: [],
  locations: DEFAULT_LOCATIONS.slice(),
  scheduleTemplate: DEFAULT_SCHEDULE_TEMPLATE.slice(),
  scheduleExceptions: [],
  scheduleExtras: [],
  ingredients: [],
  packagingItems: [],
  lossEvents: [],
  financialGoals: JSON.parse(JSON.stringify(DEFAULT_GOALS)),

  /* lembretes */
  adminReminders: [],
  notifPermission: (typeof Notification !== 'undefined') ? Notification.permission : 'unsupported',
  stockPending: 0
};
var remindedOrderIds = {};

/* ---------- utilidades ---------- */
function currency(v){ return Number(v||0).toLocaleString('pt-BR', { style:'currency', currency:'BRL' }); }
function num(v, d){ return Number(v||0).toLocaleString('pt-BR', { minimumFractionDigits: d||0, maximumFractionDigits: d||0 }); }
function esc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }

/* ---------- exportar CSV ----------
   Sem servidor próprio, então "exportar" é: montar o texto, empacotar
   num Blob e simular o clique num <a download> descartável. Excel no
   Brasil lê separado por ; (vírgula é decimal aqui) e precisa do BOM
   UTF-8 pra acentuação não virar caractere estranho. */
function csvCell(v){
  var s = v === null || v === undefined ? '' : String(v);
  if (/[;"\n]/.test(s)) s = '"' + s.replace(/"/g,'""') + '"';
  return s;
}
function downloadCsv(filename, rows){
  var csv = '﻿' + rows.map(function(r){ return r.map(csvCell).join(';'); }).join('\r\n');
  var blob = new Blob([csv], { type:'text/csv;charset=utf-8' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(function(){ URL.revokeObjectURL(url); }, 1000);
}
function csvNum(n){ return String(Number(n)||0).replace('.',','); }
function pad2(n){ return n < 10 ? '0'+n : ''+n; }
function todayStr(){ return dateToStr(new Date()); }
function dateToStr(d){ return d.getFullYear()+'-'+pad2(d.getMonth()+1)+'-'+pad2(d.getDate()); }
function strToDate(s){ var p = String(s||'').split('-'); return new Date(Number(p[0]), Number(p[1])-1, Number(p[2])); }
function dateLabel(d){ return WEEKDAY_SHORT[d.getDay()]+' '+pad2(d.getDate())+'/'+pad2(d.getMonth()+1); }
function dateLong(d){ return WEEKDAY_LABELS[d.getDay()]+', '+d.getDate()+' de '+MONTH_SHORT[d.getMonth()]; }
function timeToMinutes(t){ var p=String(t||'0:0').split(':'); return parseInt(p[0],10)*60+parseInt(p[1],10); }
function nowMinutes(){ var d = new Date(); return d.getHours()*60+d.getMinutes(); }
function getLocation(nameOrId){ return state.locations.find(function(l){ return l.name === nameOrId || l.id === nameOrId; }); }
/* ponto escondido continua cadastrado (agenda, receitas, histórico
   intactos) mas some do site e da agenda pública — igual a `hidden`
   nos produtos */
function isLocHidden(l){ return !!(l && l.hidden); }
function publicLocations(){ return state.locations.filter(function(l){ return !isLocHidden(l); }); }
function getProduct(id){ return state.products.find(function(x){ return x.id === id; }); }
function getIngredient(id){ return state.ingredients.find(function(x){ return x.id === id; }); }
function getPackagingItem(id){ return state.packagingItems.find(function(x){ return x.id === id; }); }
/* A ordem da lista de insumos é escolhida a mão (arrastando) e mora no
   campo `order` do documento. Firestore devolve os docs sem ordem útil,
   então TODA leitura precisa reordenar. Item sem `order` (cadastrado
   antes deste campo existir) vai pro fim, em ordem alfabética, em vez
   de embaralhar a lista inteira. */
function sortByOrder(arr){
  return arr.slice().sort(function(a,b){
    var ao = (a.order === undefined || a.order === null) ? Infinity : Number(a.order);
    var bo = (b.order === undefined || b.order === null) ? Infinity : Number(b.order);
    if (ao !== bo) return ao - bo;
    return String(a.name||'').localeCompare(String(b.name||''));
  });
}
function clamp(v,a,b){ return Math.max(a, Math.min(b, v)); }
function round1(v){ return Math.round((Number(v)||0) * 10) / 10; }
/* "0,5 un" lê melhor que "1 un" arredondado para cima quando a meta
   diária é fracionária — meio doce por dia é um doce a cada dois dias. */
function unitsLabel(v){
  if (v === null || v === undefined) return '—';
  return num(v, Number(v) % 1 === 0 ? 0 : 1) + ' un';
}

/* telefone: máscara e validação */
function phoneDigits(v){ return String(v||'').replace(/\D/g,'').slice(0,11); }
function phoneMask(v){
  var d = phoneDigits(v);
  if (d.length === 0) return '';
  if (d.length <= 2) return '(' + d;
  if (d.length <= 6) return '(' + d.slice(0,2) + ') ' + d.slice(2);
  if (d.length <= 10) return '(' + d.slice(0,2) + ') ' + d.slice(2,6) + '-' + d.slice(6);
  return '(' + d.slice(0,2) + ') ' + d.slice(2,7) + '-' + d.slice(7);
}
function isValidPhone(v){
  var d = phoneDigits(v);
  if (d.length !== 10 && d.length !== 11) return false;
  if (Number(d.slice(0,2)) < 11) return false;              /* DDD inexistente */
  if (d.length === 11 && d.charAt(2) !== '9') return false;  /* celular começa com 9 */
  return true;
}

/* código curto e legível do pedido */
function makeOrderCode(){
  var t = Date.now().toString(36).toUpperCase();
  return 'LC' + t.slice(-5);
}

/* avisos */
var toastSeq = 0;
function toast(msg, kind){
  var wrap = document.getElementById('toasts');
  if (!wrap) return;
  var el = document.createElement('div');
  el.className = 'toast' + (kind ? ' ' + kind : '');
  el.innerHTML = (kind === 'ok' ? icon('check',16) : kind === 'err' ? icon('alert',16) : icon('info',16)) + '<span>' + esc(msg) + '</span>';
  el.id = 'toast-' + (++toastSeq);
  wrap.appendChild(el);
  setTimeout(function(){
    el.style.transition = 'opacity .3s, transform .3s';
    el.style.opacity = '0'; el.style.transform = 'translateY(10px)';
    setTimeout(function(){ if (el.parentNode) el.parentNode.removeChild(el); }, 320);
  }, 2600);
}
function announce(msg){
  var r = document.getElementById('live-region');
  if (r) r.textContent = msg;
}

/* ---------- produtos ---------- */
function isSoldOut(p){ return p.stock !== undefined && p.stock !== null && Number(p.stock) <= 0; }
function isHidden(p){ return p.hidden === true; }
function isOrderable(p){ return !isHidden(p) && p.available !== false && !isSoldOut(p); }
function publicProducts(){ return state.products.filter(function(p){ return !isHidden(p); }); }

function cartItems(){
  return Object.keys(state.cart).map(function(id){
    var p = getProduct(id);
    return p ? { product: p, qty: state.cart[id] } : null;
  }).filter(function(i){ return i && i.qty > 0; });
}
function cartTotal(){ return cartItems().reduce(function(s,i){ return s + i.product.price * i.qty; }, 0); }
function cartCount(){ return cartItems().reduce(function(s,i){ return s + i.qty; }, 0); }

/* carrinho persistido — recarregar a página não pode zerar o pedido */
var CART_KEY = 'lca-cart';
function saveCart(){ try { localStorage.setItem(CART_KEY, JSON.stringify(state.cart)); } catch(e){} }
function loadCart(){
  try {
    var raw = localStorage.getItem(CART_KEY);
    if (!raw) return;
    var obj = JSON.parse(raw);
    if (obj && typeof obj === 'object') state.cart = obj;
  } catch(e){}
}

/* ---------- agenda ----------
   `minLead` exclui horários cedo demais para produzir. A exibição
   usa 0 (mostra tudo que ainda vai acontecer); o seletor do pedido
   usa SHOP.leadMinutes. */
function getScheduleRule(id){ return state.scheduleTemplate.find(function(r){ return r.id === id; }); }
/* Regra pausada continua cadastrada, mas some da agenda pública.
   `undefined` conta como ligada — regras criadas antes desse campo. */
function ruleEnabled(r){ return !r || r.enabled !== false; }
function isOccurrenceCancelled(templateId, dateStr){
  return state.scheduleExceptions.some(function(ex){ return ex.templateId === templateId && ex.date === dateStr; });
}
function generateAgenda(days, minLead){
  var out = [];
  var lead = minLead || 0;
  var base = new Date();
  var cutoff = new Date(base.getTime() + lead * 60000);
  for (var i = 0; i < days; i++){
    var d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + i);
    var ds = dateToStr(d);
    var wd = d.getDay();
    state.scheduleTemplate.forEach(function(rule){
      if (!ruleEnabled(rule)) return;
      if (!rule.weekdays || rule.weekdays.indexOf(wd) === -1) return;
      if (isOccurrenceCancelled(rule.id, ds)) return;
      var loc = getLocation(rule.locationId);
      if (!loc || loc.ordersOnly || isLocHidden(loc)) return;
      if (slotEndsBefore(d, rule.endTime, base)) return;
      if (slotStartsBefore(d, rule.startTime, cutoff)) return;
      out.push(makeSlot(rule.id+'_'+ds, ds, d, wd, rule.locationId, loc.name, rule.startTime, rule.endTime, 'template', rule.id, null));
    });
    (state.scheduleExtras||[]).filter(function(ex){ return ex.date === ds; }).forEach(function(ex){
      var loc2 = getLocation(ex.locationId);
      if (!loc2 || isLocHidden(loc2)) return;
      if (slotEndsBefore(d, ex.endTime, base)) return;
      if (slotStartsBefore(d, ex.startTime, cutoff)) return;
      out.push(makeSlot('extra_'+ex.id, ex.date, d, wd, ex.locationId, loc2.name, ex.startTime, ex.endTime, 'extra', null, ex.id));
    });
  }
  out.sort(function(a,b){
    var ka = a.date + a.startTime, kb = b.date + b.startTime;
    return ka < kb ? -1 : (ka > kb ? 1 : 0);
  });
  return out;
}
function makeSlot(id, ds, d, wd, locId, locName, st, et, source, templateId, extraId){
  return { id:id, date:ds, dateObj:d, weekday:wd, locationId:locId, locationName:locName,
           startTime:st, endTime:et, source:source, templateId:templateId, extraId:extraId };
}
function slotEndsBefore(dayDate, endTime, ref){
  var dt = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate(), 0, 0, 0);
  dt.setMinutes(timeToMinutes(endTime));
  return dt.getTime() < ref.getTime();
}
function slotStartsBefore(dayDate, startTime, ref){
  var dt = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate(), 0, 0, 0);
  dt.setMinutes(timeToMinutes(startTime));
  return dt.getTime() < ref.getTime();
}
function agendaGroupedByDay(days){
  var slots = generateAgenda(days, 0);
  var groups = []; var byDate = {};
  slots.forEach(function(s){
    if (!byDate[s.date]){ byDate[s.date] = { date:s.date, dateObj:s.dateObj, slots:[] }; groups.push(byDate[s.date]); }
    byDate[s.date].slots.push(s);
  });
  return groups;
}
function findAgendaSlot(slotId){
  return generateAgenda(ORDER_DAYS, SHOP.leadMinutes).find(function(s){ return s.id === slotId; }) || null;
}
/* locais que só aceitam encomenda combinada (não entram na agenda) */
function ordersOnlyLocations(){ return publicLocations().filter(function(l){ return l.ordersOnly; }); }

/* ---------- custos e finanças ---------- */
function itemUnitCost(item){
  var qty = Number(item && item.packageQty) || 0;
  return qty > 0 ? Number(item.packagePrice || 0) / qty : 0;
}
function itemUnitCostDisplay(item){
  var unitCost = itemUnitCost(item);
  if (item.unit === 'g') return { label:'Kg', value: unitCost * 1000 };
  if (item.unit === 'ml') return { label:'L', value: unitCost * 1000 };
  return { label:'un', value: unitCost };
}
/* Preço "de referência" pro histórico: R$/kg, R$/L ou R$/un, nunca o
   preço do pote inteiro. Pote de 500g e pote de 1kg não são
   comparáveis pelo preço bruto — normalizado, dá pra ver de verdade
   se o insumo ficou mais caro. `priceOverride` permite calcular o
   preço-por-unidade de um valor ainda não salvo (ex.: durante a
   edição do preço do pote). */
function unitPriceValue(item, priceOverride){
  var qty = Number(item && item.packageQty) || 0;
  var price = priceOverride !== undefined ? Number(priceOverride) || 0 : Number(item && item.packagePrice || 0);
  var unitCost = qty > 0 ? price / qty : 0;
  if (item && (item.unit === 'g' || item.unit === 'ml')) return unitCost * 1000;
  return unitCost;
}
/* Registros antigos guardavam o preço do POTE inteiro (`perUnit`
   ausente/false); a partir de agora gravamos o preço normalizado
   (`perUnit:true`). Pra não estragar o gráfico com uma mistura das
   duas unidades, converte o registro antigo na leitura usando a
   quantidade ATUAL do pote — aproximação razoável, já que o tamanho
   do pote muda bem menos que o preço. */
function historyEntryUnitPrice(item, entry){
  if (entry.perUnit) return Number(entry.price) || 0;
  return unitPriceValue(item, entry.price);
}
function ensureRecipe(p){
  if (!p.recipe) p.recipe = { yieldQty:1, unitsPerPackage:1, ingredientUsage:[], packagingUsage:[], batchMinutes:0 };
  if (!p.recipe.ingredientUsage) p.recipe.ingredientUsage = [];
  if (!p.recipe.packagingUsage) p.recipe.packagingUsage = [];
  if (p.recipe.batchMinutes === undefined) p.recipe.batchMinutes = 0;
  return p.recipe;
}
function recipeCosts(p){
  var r = ensureRecipe(p);
  var g = state.financialGoals || {};
  var ingredientTotal = r.ingredientUsage.reduce(function(s,u){
    var ing = getIngredient(u.ingredientId); if (!ing) return s;
    return s + itemUnitCost(ing) * (Number(u.qty) || 0);
  }, 0);
  var yieldQty = Number(r.yieldQty) || 1;
  var costPerUnit = ingredientTotal / yieldQty;
  var packagingPerUnit = r.packagingUsage.reduce(function(s,u){
    var pack = getPackagingItem(u.packagingId); if (!pack) return s;
    return s + itemUnitCost(pack) * (Number(u.qty) || 0);
  }, 0);
  var unitsPerPackage = Number(r.unitsPerPackage) || 1;

  /* mão de obra: tempo do lote ÷ rendimento × custo/hora */
  var hourCost = Number(g.laborHourCost) || 0;
  var batchMin = Number(r.batchMinutes) || 0;
  var laborPerUnit = (hourCost > 0 && batchMin > 0) ? (batchMin / 60 * hourCost) / yieldQty : 0;

  var materialPerUnit = costPerUnit + packagingPerUnit;
  var finalCostPerUnit = materialPerUnit + laborPerUnit;
  var finalCostPerPackage = finalCostPerUnit * unitsPerPackage;
  var materialPerPackage = materialPerUnit * unitsPerPackage;
  var laborPerPackage = laborPerUnit * unitsPerPackage;
  var sellPrice = Number(p.price) || 0;
  var profit = sellPrice - finalCostPerPackage;
  var contribution = sellPrice - materialPerPackage;
  var marginPct = sellPrice > 0 ? (profit / sellPrice) * 100 : 0;
  var markup = finalCostPerPackage > 0 ? sellPrice / finalCostPerPackage : 0;
  return {
    ingredientTotal:ingredientTotal, yieldQty:yieldQty, costPerUnit:costPerUnit,
    packagingPerUnit:packagingPerUnit, unitsPerPackage:unitsPerPackage,
    laborPerUnit:laborPerUnit, laborPerPackage:laborPerPackage,
    materialPerUnit:materialPerUnit, materialPerPackage:materialPerPackage,
    finalCostPerUnit:finalCostPerUnit, finalCostPerPackage:finalCostPerPackage,
    sellPrice:sellPrice, profit:profit, contribution:contribution,
    marginPct:marginPct, markup:markup
  };
}

/* Custo de UMA fornada inteira (a receita completa, não uma unidade) —
   é a base para calcular o prejuízo quando uma massa/fornada dá errado.
   Nem tudo que entra na receita necessariamente estraga junto — às
   vezes só a massa foi perdida e a cobertura nem chegou a ser feita —
   por isso cada ingrediente pode ser marcado como perdido ou não
   (`lostIngredientIds`), e mão de obra / embalagem entram à parte. */
function lossBreakdown(productId, batches, lostIngredientIds, includeLabor, includePackaging){
  var p = getProduct(productId);
  batches = Number(batches) || 0;
  if (!p || batches <= 0) return { ingredientRows:[], ingredientCost:0, laborCost:0, packagingCost:0, total:0 };
  var r = ensureRecipe(p);
  var lost = lostIngredientIds || [];
  var ingredientRows = r.ingredientUsage.map(function(u){
    var ing = getIngredient(u.ingredientId); if (!ing) return null;
    var qty = (Number(u.qty) || 0) * batches;
    var lostFlag = lost.indexOf(u.ingredientId) !== -1;
    return { ingredient:ing, qty:qty, unit:ing.unit||'un', lost:lostFlag, cost: lostFlag ? itemUnitCost(ing) * qty : 0 };
  }).filter(Boolean);
  var ingredientCost = ingredientRows.reduce(function(s,row){ return s + row.cost; }, 0);

  var c = recipeCosts(p);
  var g = state.financialGoals || {};
  var hourCost = Number(g.laborHourCost) || 0;
  var batchMin = Number(r.batchMinutes) || 0;
  var laborPerBatch = (hourCost > 0 && batchMin > 0) ? (batchMin / 60 * hourCost) : 0;
  var packagingPerBatch = c.packagingPerUnit * c.yieldQty;
  var laborCost = includeLabor ? laborPerBatch * batches : 0;
  var packagingCost = includePackaging ? packagingPerBatch * batches : 0;

  return {
    ingredientRows:ingredientRows, ingredientCost:ingredientCost,
    laborCost:laborCost, packagingCost:packagingCost,
    laborAvailable: laborPerBatch > 0,
    total: ingredientCost + laborCost + packagingCost
  };
}
function lossEventCost(ev){
  return lossBreakdown(ev.productId, ev.batches, ev.lostIngredientIds, ev.includeLabor, ev.includePackaging).total;
}
/* Por padrão marca TODO ingrediente da receita como perdido — o caso
   comum é a fornada inteira ir pro lixo. A pessoa desmarca só o que
   não chegou a ser usado (ex.: cobertura, se só a massa estragou). */
function allRecipeIngredientIds(p){
  return p ? ensureRecipe(p).ingredientUsage.map(function(u){ return u.ingredientId; }) : [];
}
function makeLossDraft(productId){
  var p = getProduct(productId);
  return { productId:productId||'', batches:1, date:todayStr(), note:'', includeLabor:true, includePackaging:false, lostIngredientIds:allRecipeIngredientIds(p) };
}

/* Quanto custa comprar, PELA PRIMEIRA VEZ, todos os ingredientes E
   embalagens de UMA fornada dessa receita — em potes/pacotes inteiros,
   não na quantidade exata usada (é assim que se compra numa loja de
   verdade). Diferente de recipeCosts(), que rateia o pote pela
   quantidade usada; aqui é o dinheiro que sai do bolso de fato na
   primeira compra. Embalagem é POR UNIDADE VENDIDA (não por fornada
   inteira como ingrediente), então a necessidade dela escala com
   quantas embalagens essa fornada rende. */
function firstPurchaseIngredients(p){
  var r = ensureRecipe(p);
  var yieldQty = Number(r.yieldQty) || 1;
  var unitsPerPackage = Number(r.unitsPerPackage) || 1;
  /* quantas unidades vendáveis essa única fornada rende */
  var packagesFromBatch = Math.floor(yieldQty / unitsPerPackage);
  function buildRow(u, getter){
    var item = getter(u.ingredientId || u.packagingId); if (!item) return null;
    var needed = Number(u.qty) || 0;
    var packQty = Number(item.packageQty) || 0;
    var packPrice = Number(item.packagePrice) || 0;
    var packs = packQty > 0 ? Math.ceil(needed / packQty - 1e-9) : 0;
    return { item:item, needed:needed, unit:item.unit || 'un', packQty:packQty, packPrice:packPrice, packs:packs, fullCost:packs * packPrice };
  }
  var ingRows = r.ingredientUsage.map(function(u){ return buildRow(u, getIngredient); }).filter(Boolean);
  var packRows = r.packagingUsage.map(function(u){
    /* embalagem usa "qty por unidade vendida" — pra virar "quantidade
       da fornada" (mesma base do ingrediente), multiplica pelas
       embalagens que essa fornada rende. */
    return buildRow({ packagingId:u.packagingId, qty:(Number(u.qty)||0) * packagesFromBatch }, getPackagingItem);
  }).filter(Boolean);
  var rows = ingRows.concat(packRows);
  var totalFull = rows.reduce(function(s,x){ return s + x.fullCost; }, 0);
  var sellPrice = Number(p.price) || 0;
  /* recuperar o gasto é sobre RECEITA, não lucro — o dinheiro que já
     saiu do bolso comprando os potes só volta quando entra venda, e
     usar lucro contaria o custo do ingrediente duas vezes */
  var unitsToRecover = (totalFull > 0 && sellPrice > 0) ? Math.ceil(totalFull / sellPrice) : 0;
  return {
    rows:rows, totalFull:totalFull, sellPrice:sellPrice,
    packagesFromBatch:packagesFromBatch, unitsToRecover:unitsToRecover,
    coveredByFirstBatch: unitsToRecover > 0 && unitsToRecover <= packagesFromBatch,
    leftoverUnits: Math.max(0, packagesFromBatch - unitsToRecover)
  };
}

var WEEKS_PER_MONTH = 4.345;

/* custo fixo mensal que a operação precisa cobrir antes de dar lucro */
function monthlyOverhead(){
  var g = state.financialGoals || {};
  return (Number(g.fixedMonthlyCost) || 0) + (g.includeTax ? (Number(g.meiMonthlyFee) || 0) : 0);
}
/* quanto de LUCRO o mês precisa gerar para bater a meta escolhida */
function monthlyProfitTarget(){
  var g = state.financialGoals || {};
  if (g.goalMode === 'faturamento'){
    /* meta em faturamento: converte usando a margem média dos produtos */
    var m = averageMarginRatio();
    return (Number(g.monthlyGoal) || 0) * m;
  }
  return Number(g.profitGoal) || 0;
}
function averageMarginRatio(){
  var list = state.products.filter(function(p){ return !isHidden(p); }).map(recipeCosts).filter(function(c){ return c.sellPrice > 0; });
  if (!list.length) return 0;
  var sum = list.reduce(function(s,c){ return s + (c.profit / c.sellPrice); }, 0);
  return sum / list.length;
}
function computeSalesGoals(){
  var g = state.financialGoals || {};
  var daysPerWeek = Number(g.daysPerWeek) || 0;
  var overhead = monthlyOverhead();
  var target = monthlyProfitTarget();
  return state.products.filter(function(p){ return !isHidden(p); }).map(function(p){
    var c = recipeCosts(p);
    /* `c.profit` já é preço − (ingredientes + embalagem + mão de obra),
       então vender `alvo / profit` cobre os insumos DAQUELAS unidades e
       ainda sobra o alvo. O detalhamento abaixo torna isso explícito em
       vez de deixar parecendo que só o custo fixo entrou na conta. */
    function scenarioFor(targetProfit){
      if (!(c.profit > 0)) return { targetProfit:targetProfit, unitsMonth:null, unitsWeek:null, unitsDay:null };
      var exact = targetProfit / c.profit;
      var unitsMonth = Math.ceil(exact);
      return {
        targetProfit: targetProfit,
        exactMonth: exact,
        unitsMonth: unitsMonth,
        unitsWeek: round1(exact / WEEKS_PER_MONTH),
        unitsDay: daysPerWeek > 0 ? round1(exact / WEEKS_PER_MONTH / daysPerWeek) : null,
        revenueMonth: unitsMonth * c.sellPrice,
        materialMonth: unitsMonth * c.finalCostPerPackage,
        overheadMonth: overhead
      };
    }
    return {
      product:p, costs:c,
      breakeven: scenarioFor(overhead),           /* zera a conta: insumos + custo fixo + imposto */
      goal: scenarioFor(overhead + target)        /* cobre tudo e ainda sobra a meta */
    };
  });
}
/* cenário de mix: vender vários produtos ao mesmo tempo, nas
   proporções definidas pela Julia */
function computeMixScenario(){
  var g = state.financialGoals || {};
  var prods = state.products.filter(function(p){ return !isHidden(p); });
  if (!prods.length) return null;
  var mix = g.mix || {};
  var shares = prods.map(function(p){
    var raw = Number(mix[p.id]);
    return { product:p, share: isNaN(raw) ? 0 : raw };
  });
  var totalShare = shares.reduce(function(s,x){ return s + x.share; }, 0);
  if (totalShare <= 0){
    var even = 100 / prods.length;
    shares = prods.map(function(p){ return { product:p, share:even }; });
    totalShare = 100;
  }
  /* lucro médio por unidade vendida, ponderado pelo mix */
  var blendedProfit = 0, blendedPrice = 0;
  shares.forEach(function(x){
    var c = recipeCosts(x.product);
    var w = x.share / totalShare;
    blendedProfit += c.profit * w;
    blendedPrice += c.sellPrice * w;
  });
  var need = monthlyOverhead() + monthlyProfitTarget();
  var exact = blendedProfit > 0 ? need / blendedProfit : null;
  var unitsMonth = exact != null ? Math.ceil(exact) : null;
  var daysPerWeek = Number(g.daysPerWeek) || 0;
  var unitsWeek = exact != null ? round1(exact / WEEKS_PER_MONTH) : null;
  var unitsDay = (exact != null && daysPerWeek > 0) ? round1(exact / WEEKS_PER_MONTH / daysPerWeek) : null;
  return {
    shares: shares.map(function(x){
      var w = x.share / totalShare;
      return { product:x.product, share:x.share, pct:w*100,
               unitsMonth: unitsMonth != null ? Math.ceil(unitsMonth * w) : null,
               unitsDay: (exact != null && daysPerWeek > 0) ? round1(exact * w / WEEKS_PER_MONTH / daysPerWeek) : null };
    }),
    totalShare: totalShare,
    blendedProfit: blendedProfit,
    blendedPrice: blendedPrice,
    need: need,
    unitsMonth: unitsMonth, unitsWeek: unitsWeek, unitsDay: unitsDay,
    revenueMonth: unitsMonth != null ? unitsMonth * blendedPrice : null
  };
}

/* Calculadora avulsa: só "vendendo X de UM doce por dia, quanto entra
   e quanto sobra" — sem mexer no ritmo configurado (que é usado em
   Reposição e na simulação de caixa) e sem descontar custo fixo, que
   é do negócio inteiro, não desse doce isolado. */
function computeSingleProductProjection(){
  var g = state.financialGoals || {};
  var prods = state.products.filter(function(p){ return !isHidden(p); });
  if (!prods.length) return null;
  var p = getProduct(state.metasGoalProductId) || prods[0];
  var qty = Math.max(0, Number(state.metasSingleQty) || 0);
  var c = recipeCosts(p);
  var daysPerWeek = Number(g.daysPerWeek) || 0;
  var activeDaysMonth = daysPerWeek > 0 ? daysPerWeek * WEEKS_PER_MONTH : 30;
  var revenueDay = qty * c.sellPrice;
  var profitDay = qty * c.profit;
  return {
    product:p, qty:qty, costs:c, activeDaysMonth:activeDaysMonth,
    revenueDay:revenueDay, profitDay:profitDay,
    revenueMonth: revenueDay * activeDaysMonth, profitMonth: profitDay * activeDaysMonth
  };
}

/* ---------- lista de compras: comprar tudo do zero ----------
   Para uma produção planejada, calcula quanto de cada insumo é
   necessário e quantos POTES/PACOTES INTEIROS precisam ser
   comprados — que é o que sai do bolso de verdade. */
function planQtyFor(p){
  var v = state.planQty[p.id];
  /* nada preenchido = uma fornada da receita, que é a menor unidade de
     produção real (não dá pra fazer "meia receita" de pão de mel) */
  if (v === undefined || v === null || v === '') return recipeYieldPackages(p);
  return Math.max(0, Number(v) || 0);
}
function computeShoppingList(){
  var needIng = {}, needPack = {};
  var lines = [];
  state.products.filter(function(p){ return !isHidden(p); }).forEach(function(p){
    var units = planQtyFor(p);
    if (units <= 0) return;
    var r = ensureRecipe(p);
    var yieldQty = Number(r.yieldQty) || 1;
    var unitsPerPackage = Number(r.unitsPerPackage) || 1;
    /* "units" são embalagens vendidas; cada uma leva unitsPerPackage doces */
    var treats = units * unitsPerPackage;
    var batches = treats / yieldQty;
    r.ingredientUsage.forEach(function(u){
      var ing = getIngredient(u.ingredientId); if (!ing) return;
      needIng[ing.id] = (needIng[ing.id] || 0) + (Number(u.qty)||0) * batches;
    });
    r.packagingUsage.forEach(function(u){
      var pk = getPackagingItem(u.packagingId); if (!pk) return;
      needPack[pk.id] = (needPack[pk.id] || 0) + (Number(u.qty)||0) * units;
    });
    lines.push({ product:p, units:units, treats:treats, batches:batches });
  });

  function build(map, getter){
    return Object.keys(map).map(function(id){
      var item = getter(id); if (!item) return null;
      var needed = map[id];
      var packQty = Number(item.packageQty) || 0;
      var packPrice = Number(item.packagePrice) || 0;
      var packs = packQty > 0 ? Math.ceil(needed / packQty - 1e-9) : 0;
      var fullCost = packs * packPrice;
      var proRata = packQty > 0 ? (needed / packQty) * packPrice : 0;
      return {
        item:item, needed:needed, unit:item.unit || 'un',
        packQty:packQty, packPrice:packPrice,
        packs:packs, fullCost:fullCost, proRata:proRata,
        leftover: packs * packQty - needed,
        leftoverValue: fullCost - proRata
      };
    }).filter(Boolean).sort(function(a,b){ return b.fullCost - a.fullCost; });
  }

  var ingRows = build(needIng, getIngredient);
  var packRows = build(needPack, getPackagingItem);
  var all = ingRows.concat(packRows);
  var totalFull = all.reduce(function(s,r){ return s + r.fullCost; }, 0);
  var totalProRata = all.reduce(function(s,r){ return s + r.proRata; }, 0);
  var revenue = lines.reduce(function(s,l){ return s + l.units * (Number(l.product.price)||0); }, 0);
  return {
    lines:lines, ingRows:ingRows, packRows:packRows,
    totalFull:totalFull, totalProRata:totalProRata,
    leftoverValue: totalFull - totalProRata,
    revenue: revenue,
    profitProRata: revenue - totalProRata,
    cashAfter: revenue - totalFull
  };
}


/* =========================================================
   REPOSIÇÃO DE INSUMOS
   Responde "comprando tudo hoje, quando cada coisa acaba".
   Precisa de um ritmo de venda (unidades/dia) — vem das vendas
   reais dos últimos 30 dias, e a Julia pode ajustar na mão.
========================================================= */
var RESTOCK_DAYS = 91;   /* ~3 meses */

/* unidades vendidas por dia, por produto, medidas no histórico real */
function measuredDailyRate(){
  var from = dateToStr(new Date(Date.now() - 29 * 86400000));
  var totals = {}, byName = {};
  state.products.forEach(function(p){ byName[p.name] = p.id; });
  state.orders.forEach(function(o){
    if (o.status === 'cancelado') return;
    var d = orderDate(o);
    if (d && d < from) return;
    (o.items || []).forEach(function(i){
      var pid = i.productId || byName[i.name];
      if (!pid) return;
      totals[pid] = (totals[pid] || 0) + (Number(i.qty) || 0);
    });
  });
  var rate = {};
  Object.keys(totals).forEach(function(pid){ rate[pid] = totals[pid] / 30; });
  return rate;
}
/* quantas embalagens vendáveis UMA fornada da receita rende — é o
   número que a Julia pensa naturalmente ("faço uma receita de pão de
   mel e saem 16"), por isso serve de padrão tanto pro ritmo de venda
   quanto pro planejamento de compras quando não há nada preenchido. */
function recipeYieldPackages(p){
  var r = ensureRecipe(p);
  var yieldQty = Number(r.yieldQty) || 1;
  var unitsPerPackage = Number(r.unitsPerPackage) || 1;
  return Math.max(1, Math.floor(yieldQty / unitsPerPackage));
}
/* ritmo em uso: o que foi digitado vence a medição, e a medição vence
   o padrão (o rendimento de uma receita) */
function dailyRateFor(p){
  var manual = state.consumptionRate[p.id];
  if (manual !== undefined && manual !== null && manual !== '') return Math.max(0, Number(manual) || 0);
  var m = measuredDailyRate();
  if (m[p.id] > 0) return m[p.id];
  return recipeYieldPackages(p);
}
function itemKey(kind, id){ return kind + ':' + id; }
function packsPerBuy(kind, id){
  var v = state.restockPacks[itemKey(kind, id)];
  var n = (v === undefined || v === null || v === '') ? 1 : Math.floor(Number(v) || 1);
  return Math.max(1, n);
}

/* quanto de cada insumo sai por dia, somando todos os doces */
function computeRestockPlan(){
  var products = state.products.filter(function(p){ return !isHidden(p); });
  var perDay = {};   /* "kind:id" -> quantidade consumida por dia */

  products.forEach(function(p){
    var rate = dailyRateFor(p);
    if (rate <= 0) return;
    var r = ensureRecipe(p);
    var yieldQty = Number(r.yieldQty) || 1;
    var unitsPerPackage = Number(r.unitsPerPackage) || 1;
    r.ingredientUsage.forEach(function(u){
      var ing = getIngredient(u.ingredientId); if (!ing) return;
      /* qty é da receita inteira; por embalagem vendida = qty/rendimento × unidades por embalagem */
      var perSold = ((Number(u.qty) || 0) / yieldQty) * unitsPerPackage;
      var k = itemKey('ingredient', ing.id);
      perDay[k] = (perDay[k] || 0) + perSold * rate;
    });
    r.packagingUsage.forEach(function(u){
      var pk = getPackagingItem(u.packagingId); if (!pk) return;
      var k = itemKey('packaging', pk.id);
      perDay[k] = (perDay[k] || 0) + (Number(u.qty) || 0) * rate;
    });
  });

  var all = state.ingredients.map(function(i){ return { kind:'ingredient', item:i }; })
    .concat(state.packagingItems.map(function(i){ return { kind:'packaging', item:i }; }));

  var rows = all.map(function(x){
    var k = itemKey(x.kind, x.item.id);
    var consumption = perDay[k] || 0;
    var packQty = Number(x.item.packageQty) || 0;
    var packPrice = Number(x.item.packagePrice) || 0;
    var packs = packsPerBuy(x.kind, x.item.id);
    var lot = packQty * packs;
    var cycleDays = consumption > 0 && lot > 0 ? lot / consumption : null;
    var purchases = [];
    if (cycleDays && cycleDays > 0){
      /* compra no dia 0 e a cada ciclo, até fechar o horizonte */
      var t = 0, guard = 0;
      while (t < RESTOCK_DAYS && guard++ < 400){
        purchases.push({ start: t, end: Math.min(RESTOCK_DAYS, t + cycleDays) });
        t += cycleDays;
      }
    }
    return {
      kind: x.kind, item: x.item, unit: x.item.unit || 'un',
      consumption: consumption, packQty: packQty, packPrice: packPrice,
      packs: packs, lot: lot, cycleDays: cycleDays,
      purchases: purchases,
      buysInHorizon: purchases.length,
      costInHorizon: purchases.length * packs * packPrice,
      nextBuyDay: cycleDays ? cycleDays : null,
      dense: !!(cycleDays && cycleDays < 2)
    };
  });

  var used = rows.filter(function(r){ return r.consumption > 0; });
  var idle = rows.filter(function(r){ return r.consumption <= 0; });
  used.sort(function(a,b){ return (a.cycleDays || 1e9) - (b.cycleDays || 1e9); });

  return {
    rows: used, idle: idle,
    firstBuyCost: used.reduce(function(s,r){ return s + r.packs * r.packPrice; }, 0),
    totalCost: used.reduce(function(s,r){ return s + r.costInHorizon; }, 0),
    anyRate: products.some(function(p){ return dailyRateFor(p) > 0; })
  };
}

function dayOffsetToDate(n){
  var d = new Date();
  d.setHours(0,0,0,0);
  d.setDate(d.getDate() + Math.round(n));
  return d;
}
function shortDate(d){ return pad2(d.getDate()) + '/' + pad2(d.getMonth()+1); }

/* ---------- o gráfico ---------- */
var GANTT_DAY_W = 11;   /* px por dia — 183 dias ≈ 2000px; largo o bastante pra data caber dentro da barra */
var GANTT_LABEL_MIN_W = 40;   /* abaixo disso a data não cabe, então a barra fica sem texto */

function restockGantt(plan){
  if (!plan.rows.length) return '';
  var W = RESTOCK_DAYS * GANTT_DAY_W;

  /* faixa de meses no topo */
  var months = '', d = new Date(); d.setHours(0,0,0,0);
  var cursor = new Date(d.getFullYear(), d.getMonth(), 1);
  for (var m = 0; m < 4; m++){
    var mStart = new Date(cursor.getFullYear(), cursor.getMonth() + m, 1);
    var mEnd = new Date(cursor.getFullYear(), cursor.getMonth() + m + 1, 1);
    var from = Math.max(0, Math.round((mStart - d) / 86400000));
    var to = Math.min(RESTOCK_DAYS, Math.round((mEnd - d) / 86400000));
    if (to <= 0 || from >= RESTOCK_DAYS) continue;
    months += '<div class="gantt-month" style="left:'+(from*GANTT_DAY_W)+'px;width:'+((to-from)*GANTT_DAY_W)+'px">' +
      MONTH_SHORT[mStart.getMonth()] + '<span>' + String(mStart.getFullYear()).slice(2) + '</span></div>';
  }

  /* linhas verticais de início de mês */
  var grid = '';
  for (var gm = 0; gm < 4; gm++){
    var gs = new Date(d.getFullYear(), d.getMonth() + gm, 1);
    var off = Math.round((gs - d) / 86400000);
    if (off <= 0 || off >= RESTOCK_DAYS) continue;
    grid += '<div class="gantt-vline" style="left:'+(off*GANTT_DAY_W)+'px"></div>';
  }

  var rows = plan.rows.map(function(r, i){
    var color = CHART_COLORS[i % CHART_COLORS.length];
    var segs;
    if (r.dense){
      /* comprar quase todo dia: barra contínua em vez de 180 pedacinhos */
      segs = '<div class="gantt-seg dense" style="left:0;width:'+W+'px;background:'+color+'">reposição quase diária</div>';
    } else {
      segs = r.purchases.map(function(pu, k){
        var left = pu.start * GANTT_DAY_W;
        var w = Math.max(3, (pu.end - pu.start) * GANTT_DAY_W - 2);
        var endDate = dayOffsetToDate(pu.end);
        /* a data mostrada dentro da barra é o dia em que ELA acaba —
           o mesmo dia marcado pelo tracinho .gantt-buy logo depois */
        var label = w >= GANTT_LABEL_MIN_W ? esc(shortDate(endDate)) : '';
        return '<div class="gantt-seg'+(k % 2 ? ' alt' : '')+'" style="left:'+left+'px;width:'+w+'px;background:'+color+'"' +
          ' title="'+esc(r.item.name)+' — dura até '+shortDate(endDate)+' ('+Math.round(r.cycleDays)+' dias)">'+label+'</div>' +
          (pu.end < RESTOCK_DAYS ? '<div class="gantt-buy" style="left:'+(pu.end*GANTT_DAY_W)+'px" title="Comprar de novo em '+shortDate(endDate)+'"></div>' : '');
      }).join('');
    }
    var next = r.cycleDays ? shortDate(dayOffsetToDate(r.cycleDays)) : '—';
    return '<div class="gantt-row">' +
      '<div class="gantt-label">' +
        '<i style="background:'+color+'"></i>' +
        icon(r.kind==='packaging'?'truck':'package', 13, 'var(--ink-3)') +
        '<span><b>'+esc(r.item.name)+'</b><small>acaba em '+shortDate(dayOffsetToDate(r.cycleDays))+'</small></span>' +
      '</div>' +
      '<div class="gantt-track">'+grid+segs+'</div>' +
    '</div>';
  }).join('');

  return '<div class="gantt-wrap">' +
      '<div class="gantt" style="--gantt-w:'+W+'px">' +
        '<div class="gantt-row gantt-head">' +
          '<div class="gantt-label">Insumo</div>' +
          '<div class="gantt-track">'+months+'<div class="gantt-today" title="hoje"></div></div>' +
        '</div>' +
        rows +
      '</div>' +
    '</div>' +
    '<p class="hint">Cada barra é um pote durando. O tracinho vertical no fim dela é o dia de comprar de novo. Arraste para o lado para ver os 3 meses.</p>';
}

/* Ritmo de venda (un/dia por doce) é um único número compartilhado —
   alimenta a reposição de estoque e o planejamento. Um só card
   editável em vez de várias cópias, senão a pessoa muda num lugar e
   esquece que os outros ficaram desatualizados. */
function dailyRateCard(){
  var products = state.products.filter(function(p){ return !isHidden(p); });
  var measured = measuredDailyRate();
  return '<div class="admin-card">' +
    '<div class="admin-card-head">'+icon('chart',18,'var(--brand)')+'<h3 style="flex:1">Ritmo de venda</h3>' +
      '<button class="btn-ghost" data-action="resetRate">'+icon('refresh',13)+' Usar as vendas reais</button></div>' +
    '<p class="hint" style="margin:-10px 0 16px">Quantas unidades de cada doce você vende por dia. Vem preenchido com a média dos últimos 30 dias e, sem venda registrada, com o rendimento de uma receita — ajuste se quiser simular outro cenário.</p>' +
    '<div class="fin-grid-3">' + products.map(function(p){
      var m = measured[p.id] || 0;
      return '<div class="field" style="margin:0"><label for="cr-'+p.id+'">'+esc(p.name)+' (un/dia)</label>' +
        '<input class="input sm" id="cr-'+p.id+'" type="number" inputmode="decimal" min="0" step="0.1" value="'+round1(dailyRateFor(p))+'" data-action="setConsumptionRate" data-id="'+p.id+'">' +
        '<p class="hint" style="margin-top:4px">'+(m > 0 ? 'medido: '+num(m,1)+'/dia' : 'padrão: '+recipeYieldPackages(p)+' un (uma receita)')+'</p></div>';
    }).join('') + '</div>' +
  '</div>';
}
function pageFinanceReposicao(){
  var products = state.products.filter(function(p){ return !isHidden(p); });
  if (!products.length) return '<div class="slot-empty">Cadastre um doce primeiro.</div>';
  if (!state.ingredients.length && !state.packagingItems.length){
    return '<div class="slot-empty">Cadastre ingredientes e embalagens para projetar a reposição.</div>';
  }

  var rateForm = dailyRateCard();
  var plan = computeRestockPlan();

  if (!plan.anyRate){
    return rateForm + '<div class="banner banner-warn">'+icon('alert',16)+
      '<span>Nenhum doce tem ritmo de venda definido, então não dá para projetar quando os insumos acabam. Preencha ao menos um campo acima.</span></div>';
  }
  if (!plan.rows.length){
    return rateForm + '<div class="banner banner-warn">'+icon('alert',16)+
      '<span>Os doces com ritmo de venda ainda não têm receita montada, então nenhum insumo está sendo consumido. Monte a receita em <b>Receitas</b>.</span></div>';
  }

  var tiles = '<div class="stat-grid">' +
    statTile('Compra de hoje', currency(plan.firstBuyCost), 'cart', 'brand', plan.rows.length+' itens (ingrediente + embalagem)') +
    statTile('Gasto em 3 meses', currency(plan.totalCost), 'wallet', '', plan.rows.reduce(function(s,r){ return s + r.buysInHorizon; }, 0)+' compras no total') +
    statTile('Acaba primeiro', esc(plan.rows[0].item.name), 'alert', 'neg', (plan.rows[0].kind==='packaging'?'embalagem · ':'ingrediente · ')+'em '+Math.round(plan.rows[0].cycleDays)+' dias · '+shortDate(dayOffsetToDate(plan.rows[0].cycleDays))) +
    statTile('Dura mais', esc(plan.rows[plan.rows.length-1].item.name), 'check', 'pos', (plan.rows[plan.rows.length-1].kind==='packaging'?'embalagem · ':'ingrediente · ')+Math.round(plan.rows[plan.rows.length-1].cycleDays)+' dias') +
  '</div>';

  var chart = '<div class="admin-card">' +
    '<div class="admin-card-head">'+icon('calendar',18,'var(--brand)')+'<h3 style="flex:1">Quando cada insumo acaba</h3>' +
      '<span class="pill pill-lilac">próximos 3 meses</span></div>' +
    '<p class="hint" style="margin-top:-8px">Pra que serve: saber com antecedência quando comprar de novo, sem depender de reparar que o pote esvaziou. Conta ingredientes ('+icon('package',11)+') e embalagens ('+icon('truck',11)+') juntos.</p>' +
    restockGantt(plan) + '</div>';

  var table = '<div class="admin-card">' +
    '<div class="admin-card-head">'+icon('list',18,'var(--brand)')+'<h3 style="flex:1">Detalhe por insumo</h3></div>' +
    '<div class="tbl-wrap"><table class="tbl">' +
    '<thead><tr><th>Insumo</th><th class="n">Consumo/dia</th><th class="n">Potes por compra</th><th class="n">Dura</th><th class="n">Próxima compra</th><th class="n">Compras em 3m</th><th class="n">Gasto em 3m</th></tr></thead><tbody>' +
    plan.rows.map(function(r){
      return '<tr>' +
        '<td class="k">'+icon(r.kind==='packaging'?'truck':'package', 13, 'var(--ink-3)')+' '+esc(r.item.name)+'</td>' +
        '<td class="n">'+num(r.consumption, 2)+' '+esc(r.unit)+'</td>' +
        '<td class="n"><input class="input xs" style="width:70px;text-align:right" type="number" inputmode="numeric" min="1" step="1" value="'+r.packs+'" data-action="setRestockPacks" data-key="'+itemKey(r.kind, r.item.id)+'" aria-label="Potes por compra de '+esc(r.item.name)+'"></td>' +
        '<td class="n">'+num(r.cycleDays, r.cycleDays < 10 ? 1 : 0)+' dias</td>' +
        '<td class="n">'+shortDate(dayOffsetToDate(r.cycleDays))+'</td>' +
        '<td class="n">'+r.buysInHorizon+'×</td>' +
        '<td class="n">'+currency(r.costInHorizon)+'</td>' +
      '</tr>';
    }).join('') +
    '<tr class="total-row"><td>Total</td><td class="n"></td><td class="n"></td><td class="n"></td><td class="n"></td>' +
      '<td class="n">'+plan.rows.reduce(function(s,r){ return s + r.buysInHorizon; }, 0)+'×</td>' +
      '<td class="n">'+currency(plan.totalCost)+'</td></tr>' +
    '</tbody></table></div>' +
    (plan.idle.length
      ? '<p class="hint" style="margin-top:12px">'+icon('info',12)+' Fora da conta por não entrarem em nenhuma receita com venda: <b>'+esc(plan.idle.map(function(r){ return r.item.name; }).join(', '))+'</b>.</p>'
      : '') +
  '</div>';

  return rateForm + tiles + chart + table;
}

/* =========================================================
   FIRESTORE
========================================================= */
var APP_COLLECTION_PREFIX = 'lealchocoart_';
function coll(name){ return fbDb.collection(APP_COLLECTION_PREFIX + name); }
function objToArray(obj){ return Object.keys(obj || {}).map(function(id){ var v = obj[id] || {}; v.id = id; return v; }); }
function snapToObj(snap){ var obj = {}; snap.forEach(function(doc){ obj[doc.id] = doc.data(); }); return obj; }
function syncCollection(name, onData){
  return coll(name).onSnapshot(function(snap){ onData(snapToObj(snap)); }, function(e){ console.error(e); });
}
function syncDoc(collectionName, docId, onData){
  return coll(collectionName).doc(docId).onSnapshot(function(snap){ onData(snap.exists ? snap.data() : null); }, function(e){ console.error(e); });
}
var authGatedUnsubs = [];
function attachAuthGatedSync(){
  setupPushMessaging();
  authGatedUnsubs.push(syncCollection('orders', function(val){
    state.orders = objToArray(val).sort(function(a,b){ return Number(b.id) - Number(a.id); });
    reconcileStock();
    render();
  }));
  authGatedUnsubs.push(syncCollection('ingredients', function(val){ state.ingredients = sortByOrder(objToArray(val)); render(); }));
  authGatedUnsubs.push(syncCollection('packagingItems', function(val){ state.packagingItems = sortByOrder(objToArray(val)); render(); }));
  authGatedUnsubs.push(syncCollection('lossEvents', function(val){
    state.lossEvents = objToArray(val).sort(function(a,b){ return b.date < a.date ? -1 : (b.date > a.date ? 1 : 0); });
    render();
  }));
  authGatedUnsubs.push(syncDoc('settings', 'financeGoals', function(val){
    if (val){
      var merged = JSON.parse(JSON.stringify(DEFAULT_GOALS));
      Object.keys(val).forEach(function(k){ merged[k] = val[k]; });
      state.financialGoals = merged;
    }
    render();
  }));
}
function detachAuthGatedSync(){
  authGatedUnsubs.forEach(function(unsub){ try { unsub(); } catch(e){} });
  authGatedUnsubs = [];
}
function initFirebaseSync(){
  if (!FIREBASE_READY) return;
  syncCollection('products', function(val){ if (Object.keys(val).length) { state.products = objToArray(val); syncJsonLd(); render(); } });
  syncCollection('locations', function(val){ if (Object.keys(val).length) { state.locations = objToArray(val); render(); } });
  syncCollection('scheduleTemplate', function(val){ if (Object.keys(val).length) { state.scheduleTemplate = objToArray(val); syncJsonLd(); render(); } });
  syncCollection('scheduleExceptions', function(val){ state.scheduleExceptions = objToArray(val); render(); });
  syncCollection('scheduleExtras', function(val){ state.scheduleExtras = objToArray(val); render(); });
  fbAuth.onAuthStateChanged(function(user){
    state.authUser = user;
    detachAuthGatedSync();
    if (user) attachAuthGatedSync();
    render();
  });
}
function seedCollectionIfEmpty(name, defaults){
  coll(name).limit(1).get().then(function(snap){
    if (snap.empty){
      var batch = fbDb.batch();
      defaults.forEach(function(item){ batch.set(coll(name).doc(item.id), item); });
      batch.commit();
    }
  }).catch(function(){});
}
function seedFirebaseIfEmpty(){
  if (!FIREBASE_READY) return;
  setTimeout(function(){
    seedCollectionIfEmpty('products', DEFAULT_PRODUCTS);
    seedCollectionIfEmpty('locations', DEFAULT_LOCATIONS);
    seedCollectionIfEmpty('scheduleTemplate', DEFAULT_SCHEDULE_TEMPLATE);
  }, 900);
}
function splitDbPath(path){ var parts = path.split('/'); return { collection: parts[0], id: parts[1], field: parts[2] }; }
function dbSet(path, value){
  if (!FIREBASE_READY) return Promise.resolve();
  var p = splitDbPath(path);
  var docRef = coll(p.collection).doc(p.id);
  var write = p.field ? docRef.set(makeObjectAt(p.field, value), { merge:true }) : docRef.set(value);
  return write.catch(function(e){ console.error('Falha ao salvar', path, e); toast('Não consegui salvar essa alteração.', 'err'); });
}
function makeObjectAt(field, value){ var obj = {}; obj[field] = value; return obj; }
function dbRemove(path){
  if (!FIREBASE_READY) return Promise.resolve();
  var p = splitDbPath(path);
  var docRef = coll(p.collection).doc(p.id);
  var write = p.field ? docRef.update(makeObjectAt(p.field, firebase.firestore.FieldValue.delete())) : docRef.delete();
  return write.catch(function(e){ console.error(e); toast('Não consegui excluir.', 'err'); });
}
function dbPushOrder(order){
  if (!FIREBASE_READY) return Promise.reject(new Error('offline'));
  return coll('orders').doc(order.id).set(order);
}
/* `orders` exige login pra ler (guarda telefone, endereço de retirada
   combinado etc.) — o cliente não está autenticado, então pra ele
   acompanhar o próprio pedido pelo código existe uma cópia PÚBLICA e
   REDUZIDA, sem telefone, num documento à parte cuja chave é o
   próprio código (curto, não sequencial — não dá pra listar a
   coleção inteira, só buscar um código que você já tem em mãos). */
function orderTrackingSubset(order){
  return {
    code: order.code, nome: order.nome, status: order.status || 'pendente',
    items: (order.items||[]).map(function(i){ return { name:i.name, qty:i.qty }; }),
    total: order.total, local: order.local || '', mode: order.mode,
    pickupDate: order.pickupDate || null, pickupStart: order.pickupStart || null, pickupEnd: order.pickupEnd || null,
    desiredDate: order.desiredDate || null, horario: order.horario || null,
    produced: !!order.produced,
    updatedAt: new Date().toISOString()
  };
}
function pushOrderTracking(order){
  if (!FIREBASE_READY || !order.code) return;
  dbSet('orderTracking/'+order.code, orderTrackingSubset(order));
}
/* Busca avulsa (não é um listener ao vivo) — a pessoa abre o link,
   vê o status daquele instante, e recarrega se quiser atualizar.
   Simples de propósito: essa página não tem sessão, não tem auth,
   só um código que veio do WhatsApp. */
function lookupOrderTracking(code){
  var clean = String(code||'').trim().toUpperCase();
  state.trackCode = clean; state.trackResult = null; state.trackError = '';
  if (!clean){ render(); return; }
  if (!FIREBASE_READY){ state.trackError = 'Sem conexão com o servidor agora.'; render(); return; }
  state.trackLoading = true; render();
  coll('orderTracking').doc(clean).get().then(function(snap){
    state.trackLoading = false;
    if (snap.exists) state.trackResult = snap.data();
    else state.trackError = 'Não encontrei nenhum pedido com esse código. Confira se digitou certo.';
    render();
  }).catch(function(e){
    console.error(e);
    state.trackLoading = false;
    state.trackError = 'Não consegui buscar agora. Tente de novo em instantes.';
    render();
  });
}

/* ---------- baixa de estoque ----------
   O cliente que faz o pedido não está autenticado, e as regras do
   Firestore exigem autenticação para escrever em `products`. Então
   o pedido guarda o que consumiu e a baixa é aplicada — uma única
   vez, controlada pelo campo `stockApplied` — na primeira sessão
   de admin que abrir o painel. Idempotente: reprocessar não
   desconta duas vezes. */
function pendingStockOrders(){
  return state.orders.filter(function(o){
    return o && o.stockApplied !== true && o.status !== 'cancelado' && (o.items || []).length;
  });
}
var reconciling = false;
function reconcileStock(){
  if (!FIREBASE_READY || !state.authUser || reconciling) return;
  var pending = pendingStockOrders();
  state.stockPending = pending.length;
  if (!pending.length) return;
  reconciling = true;
  var deltas = {};
  pending.forEach(function(o){
    (o.items || []).forEach(function(i){
      if (!i.productId) return;
      deltas[i.productId] = (deltas[i.productId] || 0) + Number(i.qty || 0);
    });
  });
  var batch = fbDb.batch();
  Object.keys(deltas).forEach(function(pid){
    var p = getProduct(pid);
    if (!p || p.stock === undefined || p.stock === null) return;
    var next = Math.max(0, Number(p.stock) - deltas[pid]);
    p.stock = next;
    batch.set(coll('products').doc(pid), { stock: next }, { merge:true });
  });
  pending.forEach(function(o){
    o.stockApplied = true;
    batch.set(coll('orders').doc(o.id), { stockApplied: true }, { merge:true });
  });
  batch.commit().then(function(){
    state.stockPending = 0;
    reconciling = false;
    render();
  }).catch(function(e){
    console.error('Falha ao aplicar baixa de estoque', e);
    reconciling = false;
  });
}
/* Cancelar um pedido cujo estoque JÁ foi abatido (`stockApplied`)
   devolve as unidades — sem isso o estoque exibido no site vai
   derivando pra baixo pra sempre, já que a única outra escrita em
   `stock` é a subtração acima. `stockRestored` faz isso reversível:
   descancelar reaplica a baixa. Pedido cancelado ANTES da baixa
   rodar (`stockApplied` ainda false) não precisa de nada — o
   estoque nunca chegou a sair. */
function restoreStockForOrder(o){
  if (!o.stockApplied || o.stockRestored) return;
  (o.items || []).forEach(function(i){
    if (!i.productId) return;
    var p = getProduct(i.productId);
    if (!p || p.stock === undefined || p.stock === null) return;
    p.stock = Number(p.stock) + Number(i.qty || 0);
    dbSet('products/'+p.id+'/stock', p.stock);
  });
  o.stockRestored = true;
  dbSet('orders/'+o.id+'/stockRestored', true);
}
function reapplyStockForOrder(o){
  if (!o.stockApplied || !o.stockRestored) return;
  (o.items || []).forEach(function(i){
    if (!i.productId) return;
    var p = getProduct(i.productId);
    if (!p || p.stock === undefined || p.stock === null) return;
    p.stock = Math.max(0, Number(p.stock) - Number(i.qty || 0));
    dbSet('products/'+p.id+'/stock', p.stock);
  });
  o.stockRestored = false;
  dbSet('orders/'+o.id+'/stockRestored', false);
}

/* ---------- imagens ----------
   O bucket do Storage é compartilhado e só aceita escrita pelo
   console, então a foto é guardada como data URL no próprio
   documento. O documento do Firestore tem teto de 1 MB e base64
   infla ~33% — por isso a imagem é redimensionada e comprimida
   até caber com folga, em vez de falhar em silêncio. */
var IMG_MAX_EDGE = 1400;
var IMG_MAX_BYTES = 700 * 1024;   /* tamanho final do data URL */
function processImage(file, onDone){
  if (!file){ onDone(null); return; }
  if (!/^image\//.test(file.type)){ toast('Selecione um arquivo de imagem.', 'err'); onDone(null); return; }
  var reader = new FileReader();
  reader.onerror = function(){ toast('Não consegui ler o arquivo.', 'err'); onDone(null); };
  reader.onload = function(){
    var img = new Image();
    img.onerror = function(){ toast('Imagem inválida.', 'err'); onDone(null); };
    img.onload = function(){
      var w = img.naturalWidth, h = img.naturalHeight;
      var scale = Math.min(1, IMG_MAX_EDGE / Math.max(w, h));
      var cw = Math.max(1, Math.round(w * scale)), ch = Math.max(1, Math.round(h * scale));
      var canvas = document.createElement('canvas');
      canvas.width = cw; canvas.height = ch;
      var ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, cw, ch);
      ctx.drawImage(img, 0, 0, cw, ch);
      var q = 0.84, url = canvas.toDataURL('image/jpeg', q);
      /* aperta a qualidade até caber; se ainda assim não couber, reduz o tamanho */
      var guard = 0;
      while (url.length > IMG_MAX_BYTES && guard++ < 8){
        if (q > 0.45){ q -= 0.1; }
        else {
          cw = Math.round(cw * 0.8); ch = Math.round(ch * 0.8);
          canvas.width = cw; canvas.height = ch;
          ctx = canvas.getContext('2d');
          ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, cw, ch);
          ctx.drawImage(img, 0, 0, cw, ch);
        }
        url = canvas.toDataURL('image/jpeg', q);
      }
      if (url.length > IMG_MAX_BYTES){ toast('Imagem grande demais mesmo depois de comprimir.', 'err'); onDone(null); return; }
      onDone(url);
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
}

/* ---------- assets da marca no Storage ---------- */
function upgradeAsset(key, applyFn){
  if (!fbStorage) return;
  fbStorage.ref(ASSET_FILES[key]).getDownloadURL().then(function(url){
    applyFn(url); render();
  }).catch(function(){ /* mantém a imagem local */ });
}
function upgradeBrandAssets(){
  upgradeAsset('logoCircle', function(url){ LOGO_CIRCLE = url; });
  upgradeAsset('logoPrincipal', function(url){ LOGO_PRINCIPAL = url; });
  upgradeAsset('bombomDeUva', function(url){
    var d = DEFAULT_PRODUCTS.find(function(p){ return p.id==='p1'; }); if(d) d.photo = url;
    var p = getProduct('p1'); if (p && p.photo === FALLBACK.bombomDeUva) p.photo = url;
  });
  upgradeAsset('paoDeMel', function(url){
    var d = DEFAULT_PRODUCTS.find(function(p){ return p.id==='p2'; }); if(d) d.photo = url;
    var p = getProduct('p2'); if (p && p.photo === FALLBACK.paoDeMel) p.photo = url;
  });
  upgradeAsset('mapaFaculdade', function(url){
    var d = DEFAULT_LOCATIONS.find(function(l){ return l.id==='faculdade'; }); if(d) d.mapImage = url;
    var l = getLocation('faculdade'); if (l && l.mapImage === FALLBACK.mapaFaculdade) l.mapImage = url;
  });
}

/* ---------- dados estruturados ----------
   Mantém o JSON-LD alinhado com os horários e produtos reais,
   para o Google mostrar a agenda certa. */
function syncJsonLd(){
  var el = document.getElementById('ld-business');
  if (!el) return;
  var data;
  try { data = JSON.parse(el.textContent); } catch(e){ return; }
  var hours = state.scheduleTemplate.map(function(r){
    var loc = getLocation(r.locationId);
    if (!loc || loc.ordersOnly) return null;
    return {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: (r.weekdays||[]).map(function(w){
        return ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][w];
      }),
      opens: r.startTime, closes: r.endTime
    };
  }).filter(Boolean);
  if (hours.length) data.openingHoursSpecification = hours;
  var prods = publicProducts().slice(0, 12);
  if (prods.length){
    data.hasOfferCatalog = {
      '@type':'OfferCatalog', name:'Doces artesanais',
      itemListElement: prods.map(function(p){
        return { '@type':'Offer', itemOffered:{ '@type':'Product', name:p.name, description:p.desc },
                 price: Number(p.price||0).toFixed(2), priceCurrency:'BRL',
                 availability: isOrderable(p) ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock' };
      })
    };
  }
  el.textContent = JSON.stringify(data);
}

/* ---------- revelação no scroll ----------
   A classe `is-in` é emitida pelo próprio render() a partir de
   state.revealed, senão a reconciliação do DOM removeria a classe
   que o observer acabou de adicionar. */
var revealObserver = null;
function reveal(id, extra){
  return 'reveal ' + (extra || '') + (state.revealed[id] ? ' is-in' : '') + '" data-reveal="' + id;
}
function markRevealed(el){
  var id = el.getAttribute('data-reveal');
  if (id) state.revealed[id] = true;
  el.classList.add('is-in');
}
function revealAll(){
  document.querySelectorAll('[data-reveal]:not(.is-in)').forEach(markRevealed);
}
/* Rede de segurança: se o observer não rodar (aba em segundo plano,
   navegador antigo, extensão), nada pode ficar preso invisível. */
function revealVisible(){
  var h = window.innerHeight || 800;
  document.querySelectorAll('[data-reveal]:not(.is-in)').forEach(function(el){
    var r = el.getBoundingClientRect();
    if (r.top < h * 0.94 && r.bottom > 0) markRevealed(el);
  });
}
var revealTick = false;
function onRevealScroll(){
  if (revealTick) return;
  revealTick = true;
  requestAnimationFrame(function(){ revealTick = false; revealVisible(); });
}
function initReveal(){
  if (!('IntersectionObserver' in window)){ revealAll(); return; }
  document.documentElement.classList.add('reveal-ready');
  revealObserver = new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if (!en.isIntersecting) return;
      markRevealed(en.target);
      revealObserver.unobserve(en.target);
    });
  }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
  observeReveals();
  revealVisible();
  window.addEventListener('scroll', onRevealScroll, { passive:true });
  window.addEventListener('resize', onRevealScroll, { passive:true });
  /* último recurso: depois de 4s nada continua escondido */
  setTimeout(revealAll, 4000);
}
function observeReveals(){
  if (!revealObserver) return;
  document.querySelectorAll('[data-reveal]:not(.is-in)').forEach(function(el){ revealObserver.observe(el); });
}

/* =========================================================
   COMPONENTES
========================================================= */
function LogoImg(cls){ return '<img class="logo-img '+(cls||'')+'" src="'+LOGO_PRINCIPAL+'" alt="Leal ChocoArt" width="150" height="38">'; }

function waveDivider(fillVar){
  return '<div class="wave" aria-hidden="true">' +
    '<svg viewBox="0 0 1200 80" preserveAspectRatio="none">' +
    '<path d="M0,32 C150,70 350,0 600,28 C850,56 1050,4 1200,34 L1200,80 L0,80 Z" style="fill:'+fillVar+'"></path>' +
    '</svg></div>';
}
function Pill(text, tone){ return '<span class="pill pill-'+(tone||'lilac')+'">'+text+'</span>'; }

function CartButton(){
  var count = cartCount();
  var disabled = count === 0;
  return '<button class="icon-btn" data-action="openModal" '+(disabled?'disabled':'')+
    ' aria-label="'+(disabled?'Carrinho vazio':'Ver encomenda com '+count+(count===1?' item':' itens'))+'"'+
    ' title="'+(disabled?'Adicione doces ao carrinho':'Ver encomenda')+'">' +
    icon('bag',18) + (count>0 ? '<span class="cart-badge" aria-hidden="true">'+count+'</span>' : '') + '</button>';
}

/* barra fixa que segue o cliente no celular */
function CartBar(){
  var count = cartCount();
  if (count === 0 || state.page === 'admin') return '';
  return '<div class="cart-bar on">' +
    '<div class="cart-bar-info"><small>'+count+(count===1?' item':' itens')+'</small><b>'+currency(cartTotal())+'</b></div>' +
    '<button class="btn-primary sm" data-action="openModal">Encomendar '+icon('arrowRight',15)+'</button>' +
    '</div>';
}

/* =========================================================
   CABEÇALHO / RODAPÉ
========================================================= */
function renderHeader(){
  if (state.page === 'admin'){
    return '<header><div class="header-inner">' +
      '<a class="logo-link" href="#" data-action="go" data-page="site" aria-label="Voltar ao site">'+LogoImg()+'</a>' +
      '<div style="display:flex;gap:10px;align-items:center">' + ThemeToggle() +
      '<button class="btn-secondary sm" data-action="go" data-page="site">'+icon('arrowRight',15)+' Ver o site</button></div>' +
      '</div></header>';
  }
  var links = [['Doces','#produtos'],['Onde estamos','#localizacao']]
    .concat(SHOW_QUEMFAZ_SECTION ? [['Quem faz','#quemfaz']] : [])
    .concat([['Contato','#contato']]);
  var navHtml = links.map(function(l){ return '<a class="nav-link" href="'+l[1]+'">'+l[0]+'</a>'; }).join('');
  var mobileHtml = links.map(function(l){ return '<a class="nav-link" href="'+l[1]+'" data-action="closeMenu">'+l[0]+'</a>'; }).join('');
  return '<header>' +
    '<div class="header-inner">' +
      '<a class="logo-link" href="#topo" aria-label="Leal ChocoArt — início">'+LogoImg()+'</a>' +
      '<nav class="desktop-nav" aria-label="Navegação principal">' + navHtml +
        '<span class="nav-sep" aria-hidden="true"></span>' + ThemeToggle() + CartButton() +
      '</nav>' +
      '<div class="mobile-row">' + ThemeToggle() + CartButton() +
        '<button class="mobile-toggle" data-action="toggleMenu" aria-label="'+(state.menuOpen?'Fechar menu':'Abrir menu')+'" aria-expanded="'+(state.menuOpen?'true':'false')+'">' + icon(state.menuOpen ? 'close' : 'menu', 22) + '</button>' +
      '</div>' +
    '</div>' +
    (state.menuOpen ? '<div class="mobile-menu">' + mobileHtml + '</div>' : '') +
    '</header>';
}

function renderFooter(){
  return '<footer>' +
    '<div class="footer-inner">' +
      '<a class="logo-link" href="#topo" aria-label="Leal ChocoArt">'+LogoImg()+'</a>' +
      '<p class="footer-copy">© '+new Date().getFullYear()+' Leal ChocoArt · Bolos &amp; doces artesanais<br>'+esc(SHOP.cidade)+'</p>' +
      '<div class="footer-icons">' +
        '<a href="'+SHOP.instagram+'" target="_blank" rel="noopener" aria-label="Instagram da Leal ChocoArt">'+icon('instagram',19)+'</a>' +
        '<a href="https://wa.me/'+SHOP.whatsapp+'" target="_blank" rel="noopener" aria-label="WhatsApp da Leal ChocoArt">'+icon('whatsapp',19)+'</a>' +
        '<button data-action="go" data-page="track" class="btn-ghost" aria-label="Acompanhar meu pedido">'+icon('clipboard',14)+' Meu pedido</button>' +
        '<button data-action="go" data-page="admin" class="btn-ghost" aria-label="Área administrativa">'+icon('lock',14)+' Admin</button>' +
      '</div></div>' +
    '</footer>';
}

/* =========================================================
   HERO
========================================================= */
function sectionHero(){
  var next = generateAgenda(AGENDA_DAYS, 0)[0];
  var chipNext = next
    ? (next.date === todayStr() ? 'Hoje' : dateLabel(next.dateObj)) + ' · ' + esc(next.locationName)
    : 'Agenda em breve';
  return '<section class="hero" id="topo">' +
    '<div class="blob" style="width:340px;height:340px;background:var(--blush);top:-90px;right:-60px"></div>' +
    '<div class="blob" style="width:280px;height:280px;background:var(--brand-3);bottom:-70px;left:-50px;opacity:.35"></div>' +
    '<div class="hero-grid">' +
      '<div class="hero-copy">' +
        '<p class="hero-tag">bolos &amp; doces, feitos à mão</p>' +
        '<h1>Doce de verdade,<br><span class="grad">feito em pequenos lotes.</span></h1>' +
        '<p class="lead">Bolos, pães de mel, bombons e o que mais sair do forno naquela semana — tudo preparado pela Julia, no capricho, em quantidade pequena para chegar fresquinho até você.</p>' +
        '<div class="hero-cta">' +
          '<a class="btn-primary" href="#produtos">Ver os doces '+icon('arrowRight',16)+'</a>' +
          '<a class="btn-whats" href="https://wa.me/'+SHOP.whatsapp+'" target="_blank" rel="noopener">'+icon('whatsapp',17)+' Falar com a Julia</a>' +
        '</div>' +
        '<div class="hero-trust">' +
          '<div><span class="ic">'+icon('cake',16)+'</span> Feito sob encomenda</div>' +
          '<div><span class="ic">'+icon('mapPin',16)+'</span> Retirada combinada</div>' +
          '<div><span class="ic">'+icon('heart',16)+'</span> Receita de casa</div>' +
        '</div>' +
      '</div>' +
      '<div class="hero-visual">' +
        '<div class="seal-ring"><img class="seal-img" src="'+LOGO_CIRCLE+'" alt="Selo Leal ChocoArt — bolos e doces" width="290" height="290"></div>' +
        '<span class="hero-chip c1 float">'+icon('sparkle',15,'var(--brand)')+' Massa fresca</span>' +
        '<span class="hero-chip c2 float f2">'+icon('calendar',15,'var(--blush-ink)')+' '+chipNext+'</span>' +
        '<span class="hero-chip c3 float f3">'+icon('heart',15,'var(--blush-ink)')+' Feito à mão</span>' +
      '</div>' +
    '</div>' + waveDivider('var(--bg-alt)') +
    '</section>';
}

/* =========================================================
   DOCES — faixas horizontais
========================================================= */
function productBand(p, idx){
  var orderable = isOrderable(p);
  var qty = state.cart[p.id] || 0;
  var maxStock = (p.stock === undefined || p.stock === null) ? Infinity : Number(p.stock);

  var media = p.photo
    ? '<img src="'+p.photo+'" alt="'+esc(p.name)+'" loading="lazy" decoding="async" width="640" height="512">'
    : '<div class="ph">'+icon('cake',64,'var(--brand-3)')+'</div>';
  var veil = '';
  if (p.available === false) veil = '<div class="band-veil"><span>Indisponível</span></div>';
  else if (isSoldOut(p)) veil = '<div class="band-veil"><span>Esgotado por hoje</span></div>';

  var action;
  if (!orderable){
    action = '<span class="pill pill-line">'+(p.available===false?'Volta em breve':'Esgotado')+'</span>';
  } else if (qty > 0){
    action = '<div class="qty-row">' +
        '<button class="qty-btn" data-action="cartDec" data-id="'+p.id+'" aria-label="Remover uma unidade de '+esc(p.name)+'">'+icon('minus',16)+'</button>' +
        '<span class="qty-value" aria-live="off">'+qty+'</span>' +
        '<button class="qty-btn" data-action="cartInc" data-id="'+p.id+'" '+(qty>=maxStock?'disabled':'')+' aria-label="Adicionar uma unidade de '+esc(p.name)+'">'+icon('plus',16)+'</button>' +
      '</div>' +
      '<button class="btn-primary sm" data-action="openModal">Encomendar '+icon('arrowRight',15)+'</button>';
  } else {
    action = '<button class="btn-primary" data-action="cartInc" data-id="'+p.id+'">'+icon('plus',16)+' Adicionar ao carrinho</button>';
  }

  var stockNote = (orderable && p.stock !== undefined && p.stock !== null && Number(p.stock) <= 8)
    ? '<span class="band-stock">'+icon('alert',13)+' só '+p.stock+' nesta fornada</span>'
    : (orderable && p.stock !== undefined && p.stock !== null ? '<span class="band-stock">'+p.stock+' disponíveis</span>' : '');

  return '<article class="band '+(idx % 2 === 1 ? 'flip ' : '')+reveal('band-'+p.id)+'">' +
    '<div class="band-media">' + media +
      '<span class="band-flag">'+icon('sparkle',13)+' Feito à mão</span>' + veil +
    '</div>' +
    '<div class="band-body">' +
      '<h3>'+esc(p.name)+'</h3>' +
      '<p class="band-desc">'+esc(p.desc)+'</p>' +
      '<div class="band-meta"><span class="band-price">'+currency(p.price)+'</span>'+stockNote+'</div>' +
      '<div class="band-foot">'+action+'</div>' +
    '</div>' +
  '</article>';
}

function sectionProdutos(){
  var prods = publicProducts();
  var bands = prods.length
    ? '<div class="band-stack">' + prods.map(productBand).join('') + '</div>'
    : '<div class="slot-empty">'+icon('cake',26,'var(--brand-3)')+'<p style="margin-top:10px">Nenhum doce no cardápio agora. A Julia está preparando a próxima fornada.</p></div>';

  var items = cartItems();
  var cartInner = items.length === 0
    ? '<div class="cart-empty">'+icon('bag',30,'var(--brand-3)')+'<p>Seu carrinho está vazio.<br>Escolha um doce acima para começar.</p></div>'
    : items.map(function(i){
        return '<div class="cart-line">' +
          '<span>'+i.qty+'× '+esc(i.product.name)+'</span>' +
          '<b>'+currency(i.product.price*i.qty)+'</b>' +
        '</div>';
      }).join('') +
      '<div class="cart-total"><span>Total</span><span>'+currency(cartTotal())+'</span></div>' +
      '<button class="btn-primary" data-action="openModal" style="width:100%;margin-top:16px">Fazer encomenda '+icon('arrowRight',16)+'</button>' +
      '<button class="btn-ghost" data-action="clearCart" style="width:100%;margin-top:6px;justify-content:center">'+icon('trash',13)+' Esvaziar carrinho</button>';

  return '<section class="section section-alt" id="produtos">' +
    '<div class="blob" style="width:300px;height:300px;background:var(--blush);top:-60px;left:-80px"></div>' +
    '<div class="container" style="position:relative;z-index:1">' +
      '<div class="'+reveal('prod-head')+'">' +
        '<p class="eyebrow">'+icon('cake',15)+' Cardápio da semana</p>' +
        '<h2 class="section-title">Nossos doces</h2>' +
        '<p class="section-lede">O cardápio muda conforme a fornada. Escolha o que quiser, monte o carrinho e a gente combina a retirada.</p>' +
      '</div>' +
      bands +
      '<div class="cart-wrap">' +
        '<aside class="cart-box '+reveal('cart-box')+'">' +
          '<div class="cart-head">'+icon('bag',20,'var(--brand)')+'<h3>Seu carrinho</h3></div>' +
          cartInner +
        '</aside>' +
      '</div>' +
    '</div></section>';
}

/* =========================================================
   ONDE ESTAMOS
   Mesma informação de antes (status, mapa, próximos dias e
   pontos de retirada), reorganizada: um painel de "hoje", uma
   faixa de dias navegável e os horários do dia escolhido —
   em vez de sete cartões empilhados de uma vez.
========================================================= */
function MapWithPin(loc, editable){
  if (!loc || !loc.mapImage){
    return '<div class="map-wrap" style="height:190px;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:8px;cursor:default">' +
      icon('mapPin',26,'var(--brand-3)') + '<p style="font-size:13px;color:var(--ink-3);font-weight:700">Nenhum mapa configurado</p></div>';
  }
  var pinHtml = '';
  if (loc.pin){
    pinHtml = '<div class="map-pin" style="left:'+loc.pin.x+'%;top:'+loc.pin.y+'%">' +
      '<span class="map-pin-label">'+esc(loc.pin.label || 'Aqui')+'</span>' + icon('mapPin', 30, 'var(--brand)') + '</div>';
  }
  var attrs = editable ? ' data-action="mapClick" data-locid="'+loc.id+'"' : '';
  return '<div class="map-wrap"'+attrs+'><img src="'+loc.mapImage+'" alt="Mapa de '+esc(loc.name)+'" draggable="false" loading="lazy" decoding="async">' + pinHtml + '</div>';
}

function currentSaleState(){
  var slots = generateAgenda(AGENDA_DAYS, 0);
  var first = slots[0];
  if (!first) return { live:false, slot:null };
  var live = first.date === todayStr()
    && timeToMinutes(first.startTime) <= nowMinutes()
    && nowMinutes() <= timeToMinutes(first.endTime);
  return { live:live, slot:first };
}

function todayPanel(){
  var st = currentSaleState();
  var slot = st.slot;
  var loc = slot ? getLocation(slot.locationId) : null;
  var color = st.live ? 'var(--ok)' : 'var(--brand)';
  var bg = st.live ? 'var(--ok-bg)' : 'var(--brand-soft)';
  var title = st.live ? 'Vendendo agora' : (slot ? 'Próxima venda' : 'Sem venda agendada');
  var sub = st.live ? 'Estamos no ponto até ' + slot.endTime
                    : (slot ? (slot.date === todayStr() ? 'Ainda hoje' : dateLong(slot.dateObj)) : 'Volte em breve — ou peça pelo WhatsApp');

  var rows = '';
  if (slot){
    rows =
      '<div class="today-row"><span class="ic">'+icon('mapPin',17)+'</span><div>' +
        '<span class="lbl">Onde</span><span class="val">'+esc(slot.locationName)+'</span>' +
        (loc && loc.address ? '<span class="lbl" style="text-transform:none;letter-spacing:0;font-weight:600;color:var(--ink-3)">'+esc(loc.address)+'</span>' : '') +
      '</div></div>' +
      '<div class="today-row"><span class="ic">'+icon('clock',17)+'</span><div>' +
        '<span class="lbl">Horário</span><span class="val tabnum">'+slot.startTime+' às '+slot.endTime+'</span>' +
      '</div></div>' +
      '<div class="today-row"><span class="ic">'+icon('calendar',17)+'</span><div>' +
        '<span class="lbl">Quando</span><span class="val">'+(slot.date === todayStr() ? 'Hoje, '+dateLong(slot.dateObj).split(', ')[1] : dateLong(slot.dateObj))+'</span>' +
      '</div></div>';
  } else {
    rows = '<div class="today-row"><span class="ic">'+icon('whatsapp',17)+'</span><div>' +
      '<span class="lbl">Encomendas</span><span class="val">Fale com a Julia para combinar</span></div></div>';
  }

  var mapHtml = (loc && loc.mapImage)
    ? '<img src="'+loc.mapImage+'" alt="Mapa de '+esc(loc.name)+'" loading="lazy" decoding="async">' +
      (loc.pin ? '<div class="map-pin" style="left:'+loc.pin.x+'%;top:'+loc.pin.y+'%"><span class="map-pin-label">'+esc(loc.pin.label||'Aqui')+'</span>'+icon('mapPin',28,'var(--brand)')+'</div>' : '')
    : '<div class="noimg">'+icon('mapPin',30,'var(--brand-3)')+'<p>O ponto de retirada é combinado<br>na hora da encomenda.</p></div>';

  return '<div class="today-panel '+reveal('today-panel')+'">' +
    '<div class="today-info">' +
      '<div class="today-state">' +
        '<span class="status-dot" style="background:'+color+';color:'+color+';box-shadow:0 0 0 6px '+bg+'"></span>' +
        '<div><h3>'+title+'</h3><p>'+esc(sub)+'</p></div>' +
      '</div>' +
      '<div class="today-rows">'+rows+'</div>' +
      (cartCount() > 0
        ? '<button class="btn-primary" data-action="openModal" style="align-self:flex-start">Encomendar '+icon('arrowRight',15)+'</button>'
        : '<a class="btn-secondary" href="#produtos" style="align-self:flex-start">Ver os doces '+icon('arrowRight',15)+'</a>') +
    '</div>' +
    '<div class="today-map" style="position:relative">'+mapHtml+'</div>' +
  '</div>';
}

function weekStrip(){
  var groups = agendaGroupedByDay(AGENDA_DAYS);
  var byDate = {};
  groups.forEach(function(g){ byDate[g.date] = g; });

  var base = new Date();
  var chips = [];
  var firstWith = groups.length ? groups[0].date : null;
  var selected = state.agendaDate && byDate[state.agendaDate] ? state.agendaDate : firstWith;

  for (var i = 0; i < AGENDA_DAYS; i++){
    var d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + i);
    var ds = dateToStr(d);
    var g = byDate[ds];
    var n = g ? g.slots.length : 0;
    var isToday = i === 0;
    chips.push(
      '<button class="day-chip'+(ds===selected?' active':'')+'" data-action="pickAgendaDay" data-date="'+ds+'" '+(n===0?'disabled':'')+
        ' aria-pressed="'+(ds===selected?'true':'false')+'" aria-label="'+(isToday?'Hoje, ':'')+dateLong(d)+' — '+(n===0?'sem venda':n+(n===1?' horário':' horários'))+'">' +
        '<span class="wd">'+(isToday?'Hoje':WEEKDAY_SHORT[d.getDay()])+'</span>' +
        '<span class="dd">'+pad2(d.getDate())+'</span>' +
      '</button>'
    );
  }

  var g2 = selected ? byDate[selected] : null;
  var slotsHtml = (g2 && g2.slots.length)
    ? '<div class="slot-list">' + g2.slots.map(function(s){
        var loc = getLocation(s.locationId);
        return '<div class="slot-row">' +
          '<span class="ic">'+icon('mapPin',17)+'</span>' +
          '<div class="slot-row-info"><span class="nm">'+esc(s.locationName)+'</span>' +
            (loc && loc.address ? '<span class="ad">'+esc(loc.address)+'</span>' : '') +
          '</div>' +
          '<span class="tm">'+s.startTime+' – '+s.endTime+'</span>' +
        '</div>';
      }).join('') + '</div>'
    : '<div class="slot-empty">Nenhuma venda agendada para os próximos dias. Para encomendar, fale com a Julia no WhatsApp.</div>';

  return '<div class="'+reveal('week-strip')+'">' +
    '<p class="eyebrow" style="margin-top:44px">'+icon('calendar',15)+' Próximos dias</p>' +
    '<div class="week-strip" role="group" aria-label="Escolha um dia para ver os horários">' + chips.join('') + '</div>' +
    slotsHtml +
  '</div>';
}

function pickupPoints(){
  var visible = publicLocations();
  if (!visible.length) return '';
  var list = visible.map(function(l){
    return '<div class="point">' +
      '<span class="ic">'+icon(l.ordersOnly ? 'package' : 'mapPin',17)+'</span>' +
      '<div><b>'+esc(l.name)+'</b>' +
        '<small>'+(l.address ? esc(l.address) : (l.ordersOnly ? 'Somente encomenda combinada' : 'Ponto de venda'))+'</small>' +
      '</div></div>';
  }).join('');
  return '<div class="'+reveal('points')+'">' +
    '<p class="eyebrow" style="margin-top:44px">'+icon('truck',15)+' Pontos de retirada</p>' +
    '<div class="point-grid">'+list+'</div>' +
  '</div>';
}

function sectionLocalizacao(){
  return '<section class="section" id="localizacao">' +
    '<div class="blob" style="width:290px;height:290px;background:var(--brand-3);bottom:-80px;right:-70px;opacity:.28"></div>' +
    '<div class="container-narrow" style="position:relative;z-index:1;max-width:900px">' +
      '<div class="'+reveal('loc-head')+'">' +
        '<p class="eyebrow">'+icon('mapPin',15)+' Onde estamos</p>' +
        '<h2 class="section-title">Onde encontrar a gente</h2>' +
        '<p class="section-lede">A Julia leva os doces até pontos combinados. Veja onde estamos agora e escolha o dia que te atende melhor.</p>' +
      '</div>' +
      '<div style="height:24px"></div>' +
      todayPanel() +
      weekStrip() +
      pickupPoints() +
    '</div></section>';
}

/* =========================================================
   QUEM FAZ
========================================================= */
/* ⚠️ DEPOIMENTOS SÃO EXEMPLOS — TROQUE ANTES DE PUBLICAR
   Os textos e nomes abaixo são fictícios, escritos só para a seção não
   nascer vazia. Publicar depoimento inventado como se fosse de cliente
   real é propaganda enganosa. Substitua por mensagens que a Julia
   realmente recebeu (WhatsApp, comentário do Instagram) com o nome de
   quem escreveu — ou apague a lista e a seção some sozinha. */
var QUOTES = [];
/* Foto da Julia na seção "Quem faz". Ex.: 'assets/images/julia.jpg' */
var MAKER_PHOTO = '';
/* Seção pausada até ter a foto real — a Julia pediu pra esconder em
   vez de mostrar o placeholder "(defina MAKER_PHOTO...)" pro público.
   Vire `true` quando MAKER_PHOTO estiver preenchida. */
var SHOW_QUEMFAZ_SECTION = false;
function sectionQuemFaz(){
  if (!SHOW_QUEMFAZ_SECTION) return '';
  var quotes = QUOTES;
  var stars = '';
  for (var i=0;i<5;i++) stars += icon('star',13);

  return '<section class="section section-warm" id="quemfaz">' +
    '<div class="container" style="position:relative;z-index:1">' +
      '<div class="maker">' +
        '<div class="'+reveal('maker-photo')+'">' +
          '<div class="maker-photo">' +
            /* troque por uma foto real: coloque o arquivo em
               assets/images/ e aponte MAKER_PHOTO para ele */
            (MAKER_PHOTO
              ? '<img src="'+MAKER_PHOTO+'" alt="Julia, da Leal ChocoArt, na cozinha" loading="lazy" decoding="async">'
              : '<div class="ph">'+icon('cake',56)+'<p style="font-size:13px;font-weight:800;color:var(--ink-3);text-align:center;padding:0 24px">Foto da Julia na cozinha<br><span style="font-weight:600">(defina MAKER_PHOTO em js/app.js)</span></p></div>') +
            '<div class="maker-note">"Doce bom é o que a gente serviria pra própria família."</div>' +
          '</div>' +
        '</div>' +
        '<div class="'+reveal('maker-copy','d1')+'">' +
          '<p class="eyebrow">'+icon('heart',15)+' Quem faz</p>' +
          '<h2 class="section-title">Oi, eu sou a Julia</h2>' +
          '<p class="section-lede">A Leal ChocoArt começou na cozinha de casa, com receita de família e uma batedeira que já viu muita coisa. Hoje são bolos, pães de mel, bombons e o doce que der vontade de testar na semana — sempre em lote pequeno, porque é assim que dá para caprichar em cada um.</p>' +
          '<p class="section-lede" style="margin-top:14px">Nada fica pronto esperando: você encomenda, eu produzo e a gente combina onde você retira.</p>' +
          '<div class="hero-trust" style="margin-top:26px">' +
            '<div><span class="ic">'+icon('sparkle',16)+'</span> Ingrediente de verdade</div>' +
            '<div><span class="ic">'+icon('package',16)+'</span> Lote pequeno</div>' +
            '<div><span class="ic">'+icon('clock',16)+'</span> Feito na hora certa</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
      (quotes.length ? '<div class="quote-grid">' + quotes.map(function(q, i){
        return '<figure class="quote '+reveal('quote-'+i,'d'+(i+1))+'" style="margin:0">' +
          '<div class="stars" aria-label="5 de 5 estrelas">'+stars+'</div>' +
          '<p>'+esc(q.t)+'</p>' +
          '<footer><span class="av '+q.v+'" aria-hidden="true">'+esc(q.n.charAt(0))+'</span>' +
            '<span><b>'+esc(q.n)+'</b><small>'+esc(q.s)+'</small></span></footer>' +
        '</figure>';
      }).join('') + '</div>' : '') +
    '</div></section>';
}

/* =========================================================
   CONTATO
========================================================= */
function sectionContato(){
  return '<section class="section section-alt" id="contato">' +
    '<div class="container" style="max-width:760px;position:relative;z-index:1">' +
      '<div class="contact-card '+reveal('contact')+'">' +
        '<div class="halo" aria-hidden="true"></div>' +
        '<p class="eyebrow center" style="position:relative">'+icon('whatsapp',15)+' Fale com a gente</p>' +
        '<h2 class="section-title" style="position:relative">Ficou com alguma dúvida?</h2>' +
        '<p class="section-lede" style="margin:0 auto;position:relative">Sobre um pedido, um horário ou qualquer outra coisa — é só chamar no WhatsApp ou dar um oi no Instagram que a gente responde rapidinho.</p>' +
        '<div class="contact-actions">' +
          '<a class="btn-primary" href="https://wa.me/'+SHOP.whatsapp+'?text='+encodeURIComponent('Oi Julia! Vim pelo site e queria falar com você.')+'" target="_blank" rel="noopener">'+icon('whatsapp',17)+' Conversar no WhatsApp</a>' +
          '<a class="btn-secondary" href="'+SHOP.instagram+'" target="_blank" rel="noopener">'+icon('instagram',17)+' Ver no Instagram</a>' +
        '</div>' +
      '</div>' +
    '</div></section>';
}

/* =========================================================
   MODAL DE ENCOMENDA
========================================================= */
var PAYMENTS = [
  { id:'pix', label:'Pix', icon:'wallet' },
  { id:'dinheiro', label:'Dinheiro na retirada', icon:'coin' },
  { id:'combinar', label:'Combinar depois', icon:'whatsapp' }
];
function paymentLabel(id){
  var p = PAYMENTS.find(function(x){ return x.id === id; });
  return p ? p.label : 'Combinar depois';
}

function fieldError(key){
  var msg = state.orderErrors[key];
  return msg ? '<p class="field-error">'+esc(msg)+'</p>' : '';
}

function orderCartBlock(items){
  if (items.length === 0){
    return '<div class="cart-box" style="margin-bottom:20px"><div class="cart-empty">'+icon('bag',26,'var(--brand-3)')+
      '<p>Seu carrinho está vazio.<br>Feche esta janela e escolha um doce.</p></div></div>';
  }
  return '<div class="cart-box" style="margin-bottom:22px">' +
    items.map(function(i){
      var maxStock = (i.product.stock === undefined || i.product.stock === null) ? Infinity : Number(i.product.stock);
      return '<div class="cart-line">' +
        '<span style="flex:1;min-width:0"><b style="display:block;color:var(--ink)">'+esc(i.product.name)+'</b>' +
          '<small style="font-size:12.5px;color:var(--ink-3)">'+currency(i.product.price)+' cada</small></span>' +
        '<span class="qty-row" style="padding:3px">' +
          '<button type="button" class="qty-btn" style="width:34px;height:34px" data-action="cartDec" data-id="'+i.product.id+'" aria-label="Remover uma unidade de '+esc(i.product.name)+'">'+icon('minus',14)+'</button>' +
          '<span class="qty-value" style="min-width:24px;font-size:15px">'+i.qty+'</span>' +
          '<button type="button" class="qty-btn" style="width:34px;height:34px" data-action="cartInc" data-id="'+i.product.id+'" '+(i.qty>=maxStock?'disabled':'')+' aria-label="Adicionar uma unidade de '+esc(i.product.name)+'">'+icon('plus',14)+'</button>' +
        '</span>' +
        '<b style="min-width:74px;text-align:right">'+currency(i.product.price*i.qty)+'</b>' +
      '</div>';
    }).join('') +
    '<div class="cart-total"><span>Total</span><span>'+currency(cartTotal())+'</span></div>' +
  '</div>';
}

function renderModal(){
  if (!state.modalOpen) return '';
  var items = cartItems();
  var slots = generateAgenda(ORDER_DAYS, SHOP.leadMinutes);
  var onlyLocs = ordersOnlyLocations();
  var canAgenda = slots.length > 0;
  var mode = state.orderMode;
  if (mode === 'agenda' && !canAgenda) mode = 'combinar';

  /* --- seletores em cascata da agenda --- */
  var locOrder = [], seenLoc = {};
  slots.forEach(function(s){ if (!seenLoc[s.locationId]){ seenLoc[s.locationId] = true; locOrder.push(s.locationId); } });
  var selectedLocId = (state.orderModalLocationId && seenLoc[state.orderModalLocationId]) ? state.orderModalLocationId : '';
  var locOptionsHtml = locOrder.map(function(locId){
    var loc = getLocation(locId);
    return '<option value="'+locId+'"'+(locId===selectedLocId?' selected':'')+'>'+esc(loc?loc.name:locId)+'</option>';
  }).join('');

  var slotsForLoc = selectedLocId ? slots.filter(function(s){ return s.locationId === selectedLocId; }) : [];
  var dateOrder = [], seenDate = {}, dateObjByDate = {};
  slotsForLoc.forEach(function(s){ if (!seenDate[s.date]){ seenDate[s.date] = true; dateOrder.push(s.date); dateObjByDate[s.date] = s.dateObj; } });
  var selectedDate = (state.orderModalDate && seenDate[state.orderModalDate]) ? state.orderModalDate : '';
  var todayS = todayStr();
  var dateOptionsHtml = dateOrder.map(function(d){
    var when = (d === todayS ? 'Hoje' : dateLong(dateObjByDate[d]));
    return '<option value="'+d+'"'+(d===selectedDate?' selected':'')+'>'+esc(when)+'</option>';
  }).join('');
  var slotsForDate = selectedDate ? slotsForLoc.filter(function(s){ return s.date === selectedDate; }) : [];
  var slotOptions = slotsForDate.map(function(s){
    return '<option value="'+s.id+'">'+s.startTime+' às '+s.endTime+'</option>';
  }).join('');

  /* --- seletor de modo (só aparece se houver as duas opções) --- */
  var modeBlock = '';
  if (canAgenda && (onlyLocs.length > 0 || true)){
    modeBlock = '<div class="field">' +
      '<span class="field-label">Como você quer receber</span>' +
      '<div class="seg">' +
        '<button type="button" class="seg-btn'+(mode==='agenda'?' on':'')+'" data-action="orderMode" data-mode="agenda">'+icon('calendar',15)+' Retirar num horário</button>' +
        '<button type="button" class="seg-btn'+(mode==='combinar'?' on':'')+'" data-action="orderMode" data-mode="combinar">'+icon('whatsapp',15)+' Combinar no WhatsApp</button>' +
      '</div>' +
      '<p class="hint">'+(mode==='agenda'
        ? 'Escolha um dos horários já agendados da semana.'
        : 'Você diz a data que prefere e a Julia confirma o ponto e o horário com você.')+'</p>' +
    '</div>';
  }

  /* --- bloco de retirada --- */
  var pickupBlock = '';
  if (mode === 'agenda'){
    pickupBlock =
      '<div class="field"><label for="f-local">Ponto de retirada</label>' +
        '<select class="input" id="f-local" data-action="selectOrderLocation" aria-invalid="'+(state.orderErrors.local?'true':'false')+'">' +
          '<option value="">Selecione um ponto</option>'+locOptionsHtml+'</select>' +
        fieldError('local') +
      '</div>' +
      '<div class="field"><label for="f-dia">Dia</label>' +
        (selectedLocId
          ? '<select class="input" id="f-dia" data-action="selectOrderDate" aria-invalid="'+(state.orderErrors.dia?'true':'false')+'"><option value="">Selecione um dia</option>'+dateOptionsHtml+'</select>'
          : '<select class="input" id="f-dia" disabled><option value="">Escolha o ponto primeiro</option></select>') +
        fieldError('dia') +
      '</div>' +
      '<div class="field"><label for="f-slot">Horário</label>' +
        (selectedDate
          ? '<select class="input" id="f-slot" aria-invalid="'+(state.orderErrors.slot?'true':'false')+'"><option value="">Selecione um horário</option>'+slotOptions+'</select>'
          : '<select class="input" id="f-slot" disabled><option value="">Escolha o dia primeiro</option></select>') +
        fieldError('slot') +
        '<p class="hint">'+icon('clock',12)+' Você retira dentro da faixa escolhida. Precisamos de pelo menos '+Math.round(SHOP.leadMinutes/60)+'h para produzir.</p>' +
      '</div>';
  } else {
    var allLocOptions = publicLocations().map(function(l){
      return '<option value="'+l.id+'"'+(l.id===state.orderModalLocationId?' selected':'')+'>'+esc(l.name)+(l.ordersOnly?' (só encomenda)':'')+'</option>';
    }).join('');
    var minDate = dateToStr(new Date(Date.now() + SHOP.leadMinutes*60000));
    var maxDate = dateToStr(new Date(Date.now() + 90*86400000));
    pickupBlock =
      '<div class="field"><label for="f-local">Onde prefere retirar</label>' +
        '<select class="input" id="f-local" data-action="selectOrderLocation" aria-invalid="'+(state.orderErrors.local?'true':'false')+'">' +
          '<option value="">Selecione um ponto</option>'+allLocOptions+'</select>' +
        fieldError('local') +
      '</div>' +
      '<div class="field"><label for="f-datadesejada">Data desejada</label>' +
        '<input class="input" type="date" id="f-datadesejada" min="'+minDate+'" max="'+maxDate+'" value="'+esc(state.orderModalDate||'')+'" data-action="selectDesiredDate" aria-invalid="'+(state.orderErrors.dia?'true':'false')+'">' +
        fieldError('dia') +
        '<p class="hint">'+icon('info',12)+' A Julia confirma o horário com você pelo WhatsApp.</p>' +
      '</div>';
  }

  /* --- pagamento --- */
  var payBlock = '<div class="field">' +
    '<span class="field-label">Forma de pagamento</span>' +
    '<div class="seg">' + PAYMENTS.map(function(p){
      return '<button type="button" class="seg-btn'+(state.orderPayment===p.id?' on':'')+'" data-action="setPayment" data-pay="'+p.id+'">'+icon(p.icon,15)+' '+p.label+'</button>';
    }).join('') + '</div>' +
    (state.orderPayment === 'pix'
      ? (SHOP.pixKey
          ? '<div class="pix-box">'+icon('wallet',17,'var(--brand)')+'<code>'+esc(SHOP.pixKey)+'</code>' +
            '<button type="button" class="btn-secondary xs" data-action="copyPix" data-key="'+esc(SHOP.pixKey)+'">'+icon('copy',13)+' Copiar</button></div>'
          : '<p class="hint">'+icon('info',12)+' A Julia envia a chave Pix junto com a confirmação do pedido.</p>')
      : '') +
  '</div>';

  var disabled = items.length === 0 || (mode === 'agenda' && !canAgenda);

  return '<div class="modal-overlay" data-action="closeModalBg">' +
    '<div class="modal wide" data-stop="1" role="dialog" aria-modal="true" aria-labelledby="order-title">' +
      '<button class="modal-close" data-action="closeModal" aria-label="Fechar janela de encomenda">'+icon('close',17)+'</button>' +
      '<p class="eyebrow">'+icon('bag',14)+' Encomenda</p>' +
      '<h2 id="order-title">Fechar pedido</h2>' +
      '<p class="hint" style="margin:0 0 20px">Confira os doces, escolha a retirada e a gente confirma pelo WhatsApp.</p>' +
      orderCartBlock(items) +
      '<form id="orderForm" data-action="submitOrderForm" novalidate>' +
        '<div class="field"><label for="f-nome">Seu nome</label>' +
          '<input class="input" id="f-nome" name="name" autocomplete="name" placeholder="Como devo te chamar?" aria-invalid="'+(state.orderErrors.nome?'true':'false')+'">' +
          fieldError('nome') +
        '</div>' +
        '<div class="field"><label for="f-telefone">WhatsApp</label>' +
          '<input class="input" id="f-telefone" name="tel" type="tel" inputmode="tel" autocomplete="tel" maxlength="16" placeholder="(15) 99999-0000" data-action="maskPhone" aria-invalid="'+(state.orderErrors.telefone?'true':'false')+'">' +
          fieldError('telefone') +
        '</div>' +
        modeBlock +
        pickupBlock +
        payBlock +
        '<div class="field"><label for="f-observacoes">Observações <span style="font-weight:600;color:var(--ink-3)">(opcional)</span></label>' +
          '<textarea class="input" id="f-observacoes" maxlength="400" placeholder="Alguma preferência, alergia ou recado?"></textarea>' +
        '</div>' +
        '<p class="error-text" id="formError">'+esc(state.orderErrors.geral||'')+'</p>' +
        '<button type="submit" class="btn-primary" style="width:100%" '+(disabled?'disabled':'')+'>' +
          icon('whatsapp',17)+' Enviar encomenda</button>' +
        '<p class="hint" style="text-align:center;margin-top:10px">Ao enviar, abrimos o WhatsApp com o resumo pronto.</p>' +
      '</form>' +
    '</div></div>';
}

/* ---------- mensagem de WhatsApp do pedido ---------- */
function orderWaText(o){
  var L = [];
  L.push('Olá, Julia! Acabei de fazer uma encomenda pelo site.');
  L.push('');
  L.push('*Pedido ' + o.code + '*');
  (o.items||[]).forEach(function(i){
    L.push('• ' + i.qty + 'x ' + i.name + ' — ' + currency(i.qty * i.price));
  });
  L.push('*Total: ' + currency(o.total) + '*');
  L.push('');
  if (o.mode === 'combinar'){
    L.push('Retirada: a combinar' + (o.local ? ' — ' + o.local : ''));
    if (o.desiredDate) L.push('Data desejada: ' + dateLong(strToDate(o.desiredDate)));
  } else {
    L.push('Retirada: ' + o.local);
    L.push('Quando: ' + dateLong(strToDate(o.pickupDate)) + ', ' + o.pickupStart + ' às ' + o.pickupEnd);
  }
  L.push('Pagamento: ' + paymentLabel(o.payment));
  if (o.observacoes) L.push('Obs: ' + o.observacoes);
  L.push('');
  L.push('Nome: ' + o.nome);
  return L.join('\n');
}
function orderWaLink(o){
  return 'https://wa.me/' + SHOP.whatsapp + '?text=' + encodeURIComponent(orderWaText(o));
}

/* ---------- confirmação ---------- */
function renderConfirm(){
  var o = state.lastOrder;
  if (!o) return '';
  var when = o.mode === 'combinar'
    ? ('A combinar' + (o.desiredDate ? ' · você pediu para ' + dateLong(strToDate(o.desiredDate)) : ''))
    : (dateLong(strToDate(o.pickupDate)) + ' · ' + o.pickupStart + ' às ' + o.pickupEnd);

  return '<div class="modal-overlay" data-action="closeConfirmBg"><div class="modal" data-stop="1" role="dialog" aria-modal="true" aria-labelledby="conf-title">' +
    '<div class="modal-icon ok">'+icon('check',30)+'</div>' +
    '<h2 id="conf-title" style="text-align:center;padding:0">Encomenda registrada!</h2>' +
    '<p class="hint" style="text-align:center;margin:8px 0 20px">Agora é só mandar para a Julia confirmar.</p>' +

    '<div class="cart-box" style="margin-bottom:18px">' +
      '<div class="cart-line"><span>Código do pedido</span><b style="font-size:17px;letter-spacing:.06em">'+esc(o.code)+'</b></div>' +
      (o.items||[]).map(function(i){ return '<div class="cart-line"><span>'+i.qty+'× '+esc(i.name)+'</span><b>'+currency(i.qty*i.price)+'</b></div>'; }).join('') +
      '<div class="cart-line"><span>Retirada</span><b style="text-align:right;max-width:60%">'+esc(o.local||'A combinar')+'</b></div>' +
      '<div class="cart-line"><span>Quando</span><b style="text-align:right;max-width:60%">'+esc(when)+'</b></div>' +
      '<div class="cart-line"><span>Pagamento</span><b>'+esc(paymentLabel(o.payment))+'</b></div>' +
      '<div class="cart-total"><span>Total</span><span>'+currency(o.total)+'</span></div>' +
    '</div>' +

    (o.payment === 'pix' && SHOP.pixKey
      ? '<div class="pix-box" style="margin-bottom:16px">'+icon('wallet',17,'var(--brand)')+'<code>'+esc(SHOP.pixKey)+'</code>' +
        '<button class="btn-secondary xs" data-action="copyPix" data-key="'+esc(SHOP.pixKey)+'">'+icon('copy',13)+' Copiar</button></div>'
      : '') +

    '<a class="btn-primary" style="width:100%" href="'+esc(orderWaLink(o))+'" target="_blank" rel="noopener" data-action="confirmWhats">' +
      icon('whatsapp',17)+' Enviar no WhatsApp</a>' +
    '<button class="btn-ghost" data-action="closeConfirm" style="width:100%;justify-content:center;margin-top:8px">Depois eu mando</button>' +
    '<p class="hint" style="text-align:center;margin-top:12px">Guarde o código <b>'+esc(o.code)+'</b> — é ele que identifica seu pedido. ' +
      '<a href="#pedido/'+esc(o.code)+'" data-action="goTrack" data-code="'+esc(o.code)+'">Acompanhar pedido</a></p>' +
    '</div></div>';
}

/* ---------- acompanhar pedido (página pública, sem login) ---------- */
function pageTrackOrder(){
  var r = state.trackResult;
  var form = '<form class="track-search" data-action="trackForm">' +
    '<div class="field"><label for="track-code">Código do pedido</label>' +
      '<input class="input" id="track-code" name="code" placeholder="Ex: LC4X2P1" value="'+esc(state.trackCode)+'" autocapitalize="characters"></div>' +
    '<button class="btn-primary" type="submit">'+icon('search',15)+' Buscar</button>' +
  '</form>' +
  '<p class="hint">O código veio na confirmação do pedido, no WhatsApp ou na tela depois de encomendar.</p>';

  var body = '';
  if (state.trackLoading){
    body = '<p class="hint" style="margin-top:20px">Buscando…</p>';
  } else if (state.trackError){
    body = '<div class="banner banner-warn" style="margin-top:20px">'+icon('alert',16)+'<span>'+esc(state.trackError)+'</span></div>';
  } else if (r){
    var when = r.mode === 'combinar'
      ? ('A combinar' + (r.desiredDate ? ' · pedido para ' + dateLong(strToDate(r.desiredDate)) : ''))
      : (r.pickupDate ? dateLong(strToDate(r.pickupDate)) + ' · ' + r.pickupStart + ' às ' + r.pickupEnd : 'A combinar');
    body = '<div class="track-card">' +
      '<div class="track-card-head">' +
        '<span>'+icon('clipboard',20,'var(--brand)')+' Pedido <b>'+esc(r.code)+'</b></span>' +
        '<span class="pill pill-'+statusTone(r.status||'pendente')+'">'+statusLabel(r.status||'pendente')+'</span>' +
      '</div>' +
      (r.nome ? '<p class="hint" style="margin-top:-4px">'+esc(r.nome)+'</p>' : '') +
      '<div class="cart-box" style="margin:16px 0">' +
        (r.items||[]).map(function(i){ return '<div class="cart-line"><span>'+i.qty+'× '+esc(i.name)+'</span></div>'; }).join('') +
        '<div class="cart-line"><span>Retirada</span><b style="text-align:right;max-width:60%">'+esc(r.local||'A combinar')+'</b></div>' +
        '<div class="cart-line"><span>Quando</span><b style="text-align:right;max-width:60%">'+esc(when)+'</b></div>' +
        '<div class="cart-total"><span>Total</span><span>'+currency(r.total)+'</span></div>' +
      '</div>' +
      (r.status === 'cancelado'
        ? '<div class="banner banner-danger">'+icon('alert',16)+'<span>Esse pedido foi cancelado. Fale com a Julia se não esperava isso.</span></div>'
        : r.produced
          ? '<div class="banner banner-info">'+icon('check',16)+'<span>Já está pronto! Nos vemos na retirada.</span></div>'
          : '<div class="banner banner-info">'+icon('info',16)+'<span>Ainda em preparo — a Julia atualiza aqui conforme o andamento.</span></div>') +
    '</div>';
  }

  return '<div class="track-wrap">' +
    '<a href="#" data-action="go" data-page="site" class="btn-ghost" style="margin-bottom:20px">'+icon('arrowLeft',14)+' Voltar pro site</a>' +
    '<h1 class="track-title">Acompanhar pedido</h1>' +
    form + body +
  '</div>';
}

/* ---------- diálogo de confirmação genérico ---------- */
function renderConfirmDialog(){
  var c = state.confirmDialog;
  if (!c) return '';
  return '<div class="modal-overlay" data-action="closeConfirmDialogBg"><div class="modal" data-stop="1" role="dialog" aria-modal="true" aria-labelledby="cd-title" style="max-width:440px">' +
    '<div class="modal-icon '+(c.danger?'warn':'ok')+'">'+icon(c.danger?'alert':'info',26)+'</div>' +
    '<h2 id="cd-title" style="text-align:center;padding:0;font-size:21px">'+esc(c.title)+'</h2>' +
    '<p class="hint" style="text-align:center;margin-top:10px;font-size:14px">'+esc(c.text)+'</p>' +
    '<div class="modal-actions">' +
      '<button class="btn-secondary" data-action="cancelConfirmDialog">Cancelar</button>' +
      '<button class="btn-primary" data-action="runConfirmDialog"'+(c.danger?' style="background:var(--danger);box-shadow:none;color:#fff"':'')+'>'+esc(c.okLabel||'Confirmar')+'</button>' +
    '</div></div></div>';
}

/* ---------- mudança de preço de insumo ---------- */
function renderPriceChangeModal(){
  var m = state.priceChangeModal;
  if (!m) return '';
  var item = m.kind === 'ingredient' ? getIngredient(m.id) : getPackagingItem(m.id);
  var name = item ? item.name : '';
  var diff = m.newPrice - m.oldPrice;
  var pct = m.oldPrice > 0 ? (diff / m.oldPrice) * 100 : 0;
  return '<div class="modal-overlay" data-action="closePriceChangeBg"><div class="modal" data-stop="1" role="dialog" aria-modal="true" aria-labelledby="pc-title" style="max-width:460px">' +
    '<div class="modal-icon ok">'+icon('coin',26)+'</div>' +
    '<h2 id="pc-title" style="text-align:center;padding:0;font-size:20px">Atualizar preço — '+esc(name)+'</h2>' +
    '<div class="cart-box" style="margin:18px 0">' +
      '<div class="cart-line"><span>Preço antigo</span><b>'+currency(m.oldPrice)+'</b></div>' +
      '<div class="cart-line"><span>Novo preço</span><b>'+currency(m.newPrice)+'</b></div>' +
      '<div class="cart-line"><span>Variação</span><b style="color:'+(diff>0?'var(--danger)':'var(--ok)')+'">'+(diff>0?'+':'')+currency(diff)+' ('+(pct>0?'+':'')+pct.toFixed(1)+'%)</b></div>' +
    '</div>' +
    '<p class="hint" style="text-align:center">Salvar registra a mudança no histórico e recalcula o custo dos produtos que usam esse insumo.</p>' +
    '<div class="modal-actions">' +
      '<button class="btn-secondary" data-action="cancelPriceChange">Cancelar</button>' +
      '<button class="btn-primary" data-action="confirmPriceChange">Salvar preço</button>' +
    '</div></div></div>';
}

/* =========================================================
   ADMIN — login e casca
========================================================= */
function pageAdminLogin(){
  var banner = FIREBASE_READY ? '' :
    '<div class="banner banner-warn">'+icon('alert',16)+'<span>O Firebase não pôde ser inicializado neste navegador. Verifique sua conexão.</span></div>';
  return '<div class="admin-shell" style="max-width:900px">' +
    '<div class="login-box">' +
      '<div class="modal-icon ok" style="width:58px;height:58px">'+icon('lock',24)+'</div>' +
      '<h2 style="font-size:23px;margin:0 0 6px">Área da Julia</h2>' +
      '<p class="hint" style="margin:0 0 22px">Entre para gerenciar doces, encomendas e finanças.</p>' +
      banner +
      '<form data-action="loginForm">' +
        '<div class="field" style="text-align:left"><label for="login-email">E-mail</label>' +
          '<input class="input" id="login-email" type="email" autocomplete="username" placeholder="voce@email.com" required></div>' +
        '<div class="field" style="text-align:left"><label for="login-senha">Senha</label>' +
          '<input class="input" id="login-senha" type="password" autocomplete="current-password" placeholder="••••••••" required></div>' +
        '<p class="error-text">'+esc(state.authError)+'</p>' +
        '<button type="submit" class="btn-primary" style="width:100%">Entrar</button>' +
      '</form>' +
    '</div></div>';
}

function ReminderBanner(){
  var out = '';
  if (state.stockPending > 0){
    out += '<div class="banner banner-info">'+icon('refresh',16)+'<span>Aplicando a baixa de estoque de '+state.stockPending+' pedido(s) recebido(s) enquanto o painel estava fechado…</span></div>';
  }
  if (state.adminReminders.length){
    var items = state.adminReminders.map(function(o){
      var itemsStr = (o.items||[]).map(function(i){ return i.qty+'× '+i.name; }).join(', ');
      return '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;padding:9px 0;border-top:1px dashed rgba(255,255,255,.35)">' +
        '<p style="margin:0;font-size:13.5px"><strong>'+esc(o.nome)+'</strong> — '+esc(itemsStr)+' · '+esc(o.local||'')+' · '+esc(o.pickupStart||'')+'</p>' +
        '<button data-action="dismissReminder" data-id="'+o.id+'" style="background:none;border:none;color:inherit;opacity:.85;padding:6px" aria-label="Dispensar aviso">'+icon('x',15)+'</button>' +
      '</div>';
    }).join('');
    out += '<div class="banner banner-danger" style="display:block">' +
      '<p style="margin:0;font-weight:800;font-size:14.5px;display:flex;align-items:center;gap:9px">'+icon('bell',17)+' Retirada chegando — prepare o pedido</p>' +
      items + '</div>';
  }
  if (typeof Notification !== 'undefined' && state.notifPermission !== 'granted' && state.notifPermission !== 'unsupported'){
    out += '<button class="btn-ghost" data-action="enableNotifications" style="margin-bottom:16px">'+icon('bell',14)+' Ativar aviso do navegador para retiradas</button>';
  }
  return out;
}

/* Via o service worker quando ele já estiver pronto (sobrevive à aba
   minimizada/segundo plano melhor), senão cai pra `new Notification`
   direto. Isso cobre o navegador ABERTO em segundo plano; o aviso
   automático de "faltam 10 minutos" com o navegador FECHADO ainda
   depende de uma Cloud Function que dispare um push (ver
   setupPushMessaging() logo abaixo — a inscrição já está pronta, só
   falta quem envie). */
function showAdminNotification(title, body){
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
  if (navigator.serviceWorker && navigator.serviceWorker.controller){
    navigator.serviceWorker.ready.then(function(reg){
      reg.showNotification(title, { body:body, icon:'assets/images/icon-192.png', badge:'assets/images/icon-192.png' });
    }).catch(function(){ try { new Notification(title, { body:body }); } catch(e){} });
  } else {
    try { new Notification(title, { body:body }); } catch(e){}
  }
}
/* Registra este dispositivo pra receber push do Cloud Messaging e
   guarda o token no Firestore. Só a metade "inscrever" do push — a
   metade "enviar no momento certo" precisa de uma Cloud Function
   (ainda não existe) lendo essa coleção e chamando o FCM. Chamada só
   quando a notificação já está autorizada, então não pede permissão
   por conta própria. */
function setupPushMessaging(){
  if (!FIREBASE_READY || typeof firebase === 'undefined' || !firebase.messaging) return;
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
  if (!('serviceWorker' in navigator) || !state.authUser) return;
  navigator.serviceWorker.ready.then(function(reg){
    return firebase.messaging().getToken({ vapidKey: FCM_VAPID_KEY, serviceWorkerRegistration: reg });
  }).then(function(token){
    if (!token) return;
    dbSet('pushTokens/'+token, { token:token, uid: state.authUser.uid, updatedAt: new Date().toISOString() });
  }).catch(function(e){ console.warn('Não consegui registrar push:', e); });
}
function checkPickupReminders(){
  var nowMs = Date.now();
  state.orders.forEach(function(o){
    if (!o.pickupDate || !o.pickupStart || o.status === 'cancelado' || o.produced) return;
    if (remindedOrderIds[o.id]) return;
    var pickupMs = new Date(o.pickupDate+'T'+o.pickupStart+':00').getTime();
    var diffMin = (pickupMs - nowMs) / 60000;
    if (diffMin <= 10 && diffMin > -30){
      remindedOrderIds[o.id] = true;
      state.adminReminders.unshift(o);
      var itemsStr = (o.items||[]).map(function(i){ return i.qty+'x '+i.name; }).join(', ');
      showAdminNotification('Retirada em breve — Leal ChocoArt', o.nome+' · '+itemsStr+' · '+(o.local||''));
      render();
    }
  });
}

function labeledField(label, innerHtml, extraStyle){
  return '<div style="display:flex;flex-direction:column;gap:5px;'+(extraStyle||'')+'">' +
    '<span style="font-size:11px;font-weight:800;color:var(--ink-3);letter-spacing:.05em;text-transform:uppercase">'+label+'</span>' + innerHtml + '</div>';
}
/* Toggle no padrão visual do app (chip + caixinha), em vez do
   checkbox nativo cru que `.check-row` usava — consistente com
   history-chip/avail-toggle, que já são botões, não inputs. */
function toggleChip(label, checked, action, extraAttrs, style){
  return '<button type="button" class="toggle-chip'+(checked?' on':'')+'" data-action="'+action+'"'+(extraAttrs?' '+extraAttrs:'')+
    ' role="switch" aria-checked="'+(checked?'true':'false')+'"'+(style?' style="'+style+'"':'')+'>' +
    '<span class="toggle-chip-box">'+(checked?icon('check',12):'')+'</span>' + esc(label) + '</button>';
}
/* Mesma caixinha, sem o chip ao redor — pra caber numa célula de
   tabela estreita (checklist de perdas) sem o rótulo, que já vem da
   coluna vizinha. */
function toggleBox(checked, action, extraAttrs, ariaLabel){
  return '<button type="button" class="toggle-chip-btn'+(checked?' on':'')+'" data-action="'+action+'"'+(extraAttrs?' '+extraAttrs:'')+
    ' role="switch" aria-checked="'+(checked?'true':'false')+'" aria-label="'+esc(ariaLabel)+'">' +
    '<span class="toggle-chip-box">'+(checked?icon('check',12):'')+'</span></button>';
}

/* =========================================================
   ADMIN — doces
========================================================= */
function pageAdminProdutos(){
  var addForm = !state.addingProduct
    ? '<button class="btn-secondary sm" data-action="toggleAddProduct" style="margin-bottom:18px">'+icon('plus',15)+' Adicionar doce</button>'
    : '<div class="new-card">' +
        '<h3>Novo doce</h3>' +
        '<div class="field"><label for="np-nome">Nome</label><input class="input" id="np-nome" placeholder="Ex: Bolo de cenoura"></div>' +
        '<div class="field"><label for="np-desc">Descrição</label><input class="input" id="np-desc" placeholder="Uma frase que dê água na boca"></div>' +
        '<div class="field"><label for="np-ing">Ingredientes</label><input class="input" id="np-ing" placeholder="Separados por vírgula"></div>' +
        '<div class="fin-grid-2">' +
          '<div class="field"><label for="np-preco">Preço (R$)</label><input class="input" id="np-preco" type="number" inputmode="decimal" step="0.5" value="5"></div>' +
          '<div class="field"><label for="np-estoque">Estoque</label><input class="input" id="np-estoque" type="number" inputmode="numeric" step="1" value="10"></div>' +
        '</div>' +
        '<div class="field"><label for="np-imagem">Foto</label><input class="file-input" type="file" accept="image/*" id="np-imagem"></div>' +
        '<div style="display:flex;gap:10px">' +
          '<button class="btn-primary sm" data-action="createProduct">Salvar doce</button>' +
          '<button class="btn-ghost" data-action="toggleAddProduct">Cancelar</button>' +
        '</div>' +
      '</div>';

  if (!state.products.length){
    return addForm + '<div class="slot-empty">Nenhum doce cadastrado ainda.</div>';
  }

  var cards = state.products.map(function(p){
    var hidden = isHidden(p);
    var statusPill = hidden
      ? '<span class="pill pill-line">'+icon('eyeOff',13)+' Oculto no site</span>'
      : (p.available === false ? '<span class="pill pill-danger">Indisponível</span>'
        : (isSoldOut(p) ? '<span class="pill pill-warn">Esgotado</span>' : '<span class="pill pill-ok">'+icon('check',12)+' No cardápio</span>'));

    return '<div class="admin-card'+(hidden?' dim':'')+'">' +
      '<div class="admin-card-head">' +
        '<div class="thumb">' + (p.photo ? '<img src="'+p.photo+'" alt="">' : icon('cake',22,'var(--brand-3)')) +
          '<span class="thumb-cam">'+icon('camera',11)+'</span>' +
          '<input class="thumb-upload" type="file" accept="image/*" data-action="uploadProductPhoto" data-id="'+p.id+'" aria-label="Trocar foto de '+esc(p.name)+'"></div>' +
        '<h3 style="flex:1 1 160px;min-width:0">'+esc(p.name)+'</h3>' +
        statusPill +
        '<button class="btn-danger-ghost" data-action="removeProduct" data-id="'+p.id+'" aria-label="Excluir '+esc(p.name)+'">'+icon('trash',17)+'</button>' +
      '</div>' +

      '<div style="display:flex;gap:12px;flex-wrap:wrap;align-items:flex-end;margin-bottom:16px">' +
        labeledField('Nome', '<input class="input sm" value="'+esc(p.name)+'" data-action="setName" data-id="'+p.id+'" aria-label="Nome do doce">', 'flex:1 1 180px') +
        labeledField('Preço', '<input class="input sm" type="number" inputmode="decimal" step="0.5" value="'+p.price+'" style="width:104px" data-action="setPrice" data-id="'+p.id+'" aria-label="Preço">') +
        labeledField('Estoque', '<input class="input sm" type="number" inputmode="numeric" step="1" value="'+(p.stock===undefined?'':p.stock)+'" style="width:96px" data-action="setStock" data-id="'+p.id+'" aria-label="Estoque">') +
      '</div>' +

      '<div style="display:flex;gap:9px;flex-wrap:wrap;margin-bottom:16px">' +
        '<button class="avail-toggle '+(p.available!==false?'avail-on':'avail-off')+'" data-action="toggleAvailable" data-id="'+p.id+'">' +
          (p.available!==false ? icon('check',13)+' Disponível' : icon('x',13)+' Indisponível') + '</button>' +
        '<button class="avail-toggle '+(hidden?'avail-hid':'avail-on')+'" data-action="toggleHidden" data-id="'+p.id+'" title="'+(hidden?'Mostrar no site':'Esconder do site — some do cardápio sem apagar o cadastro')+'">' +
          (hidden ? icon('eyeOff',13)+' Oculto no site' : icon('eye',13)+' Visível no site') + '</button>' +
      '</div>' +
      (hidden ? '<p class="hint" style="margin-top:-8px;margin-bottom:14px">'+icon('info',12)+' Este doce não aparece no site nem entra nas metas — o cadastro, a receita e o histórico continuam salvos.</p>' : '') +

      '<div class="field" style="margin-bottom:10px"><label for="d-'+p.id+'">Descrição</label>' +
        '<textarea class="input" id="d-'+p.id+'" style="height:62px" data-action="setDesc" data-id="'+p.id+'">'+esc(p.desc)+'</textarea></div>' +
      '<div class="field" style="margin-bottom:0"><label for="i-'+p.id+'">Ingredientes</label>' +
        '<textarea class="input" id="i-'+p.id+'" style="height:62px" data-action="setIngredients" data-id="'+p.id+'">'+esc(p.ingredients)+'</textarea></div>' +
    '</div>';
  }).join('');

  return addForm + cards;
}

/* =========================================================
   ADMIN — encomendas
========================================================= */
var ORDER_STATUS = [
  { id:'pendente', label:'Pendente', tone:'warn' },
  { id:'producao', label:'Em produção', tone:'lilac' },
  { id:'pronto', label:'Pronto', tone:'ok' },
  { id:'concluido', label:'Concluído', tone:'ok' },
  { id:'cancelado', label:'Cancelado', tone:'danger' }
];
function statusLabel(id){ var s = ORDER_STATUS.find(function(x){ return x.id === id; }); return s ? s.label : 'Pendente'; }
function statusTone(id){ var s = ORDER_STATUS.find(function(x){ return x.id === id; }); return s ? s.tone : 'warn'; }

function orderDate(o){ return o.pickupDate || o.desiredDate || o.data || ''; }
function filteredOrders(){
  var f = state.orderFilter;
  var q = (f.q||'').trim().toLowerCase();
  var todayS = todayStr();
  return state.orders.filter(function(o){
    if (f.status !== 'todos' && (o.status||'pendente') !== f.status) return false;
    if (f.when === 'hoje' && orderDate(o) !== todayS) return false;
    if (f.when === 'futuros' && !(orderDate(o) >= todayS)) return false;
    if (f.when === 'abertos' && (o.status === 'concluido' || o.status === 'cancelado')) return false;
    if (f.paid === 'nao' && o.paid) return false;
    if (f.paid === 'sim' && !o.paid) return false;
    if (q){
      var hay = [o.nome, o.telefone, o.code, o.local, (o.items||[]).map(function(i){ return i.name; }).join(' ')].join(' ').toLowerCase();
      if (hay.indexOf(q) === -1) return false;
    }
    return true;
  });
}

function orderCard(o){
  var itemsStr = (o.items||[]).map(function(i){ return i.qty+'× '+i.name; }).join(', ');
  var d = orderDate(o);
  var soon = false;
  if (o.pickupDate && o.pickupStart && o.status !== 'cancelado' && !o.produced){
    var diff = (new Date(o.pickupDate+'T'+o.pickupStart+':00').getTime() - Date.now()) / 60000;
    soon = diff <= 120 && diff > -60;
  }
  var whenTxt = o.mode === 'combinar'
    ? ('A combinar' + (o.desiredDate ? ' · pediu ' + dateLabel(strToDate(o.desiredDate)) : ''))
    : (d ? dateLabel(strToDate(d)) + ' · ' + (o.horario || '') : 'Sem data');

  return '<div class="order-card'+(o.produced?' done':'')+(soon?' soon':'')+'">' +
    '<div class="order-head">' +
      '<div style="flex:1 1 220px;min-width:0">' +
        '<div class="order-name">'+esc(o.nome)+
          (o.code ? '<span class="pill pill-line" style="font-size:11px">'+esc(o.code)+'</span>' : '') +
          '<span class="pill pill-'+statusTone(o.status||'pendente')+'" style="font-size:11px">'+statusLabel(o.status||'pendente')+'</span>' +
          (o.status !== 'cancelado' ? '<span class="pill '+(o.paid?'pill-ok':'pill-danger')+'" style="font-size:11px">'+(o.paid?'Pago':'Não pago')+'</span>' : '') +
        '</div>' +
        '<p class="order-items">'+esc(itemsStr)+'</p>' +
        '<div class="order-meta">' +
          '<span>'+icon('clock',12)+' '+esc(whenTxt)+'</span>' +
          '<span>'+icon('mapPin',12)+' '+esc(o.local||'A combinar')+'</span>' +
          '<span>'+icon('coin',12)+' '+currency(o.total)+'</span>' +
          (o.payment ? '<span>'+icon('wallet',12)+' '+esc(paymentLabel(o.payment))+'</span>' : '') +
        '</div>' +
        (o.observacoes ? '<p class="order-items" style="margin-top:6px;font-style:italic">"'+esc(o.observacoes)+'"</p>' : '') +
      '</div>' +
      '<div class="order-actions">' +
        (o.telefone ? '<a class="btn-whats sm" href="https://wa.me/55'+phoneDigits(o.telefone)+'" target="_blank" rel="noopener" aria-label="Chamar '+esc(o.nome)+' no WhatsApp">'+icon('whatsapp',14)+'</a>' : '') +
        '<button class="avail-toggle '+(o.paid?'avail-on':'avail-off')+'" data-action="togglePaid" data-id="'+o.id+'">' +
          (o.paid ? icon('check',13)+' Pago' : 'Marcar pago') + '</button>' +
        '<button class="avail-toggle '+(o.produced?'avail-on':'avail-off')+'" data-action="toggleProduced" data-id="'+o.id+'">' +
          (o.produced ? icon('check',13)+' Produzido' : 'Marcar produzido') + '</button>' +
        '<select class="input sm" style="width:150px" data-action="setOrderStatus" data-id="'+o.id+'" aria-label="Status do pedido de '+esc(o.nome)+'">' +
          ORDER_STATUS.map(function(s){ return '<option value="'+s.id+'"'+((o.status||'pendente')===s.id?' selected':'')+'>'+s.label+'</option>'; }).join('') +
        '</select>' +
      '</div>' +
    '</div></div>';
}

function pageAdminEncomendas(){
  var todayS = todayStr();

  /* retiradas de hoje — o que a Julia precisa ver primeiro */
  var todayOrders = state.orders.filter(function(o){
    return orderDate(o) === todayS && o.status !== 'cancelado';
  }).sort(function(a,b){ return String(a.pickupStart||'').localeCompare(String(b.pickupStart||'')); });

  var todayBlock = '<div class="admin-card" style="background:var(--brand-soft);border-color:var(--brand-2)">' +
    '<div class="admin-card-head" style="margin-bottom:'+(todayOrders.length?'14px':'0')+'">' +
      icon('sun',19,'var(--brand)') +
      '<h3 style="flex:1">Retiradas de hoje</h3>' +
      '<span class="pill pill-lilac">'+todayOrders.length+'</span>' +
    '</div>' +
    (todayOrders.length
      ? todayOrders.map(function(o){
          var itemsStr = (o.items||[]).map(function(i){ return i.qty+'× '+i.name; }).join(', ');
          return '<div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-top:1px solid var(--line)">' +
            '<span style="font-weight:800;font-variant-numeric:tabular-nums;min-width:52px">'+esc(o.pickupStart||'—')+'</span>' +
            '<div style="flex:1;min-width:0"><b style="font-size:14.5px">'+esc(o.nome)+'</b>' +
              '<p style="font-size:12.5px;color:var(--ink-2);margin:0">'+esc(itemsStr)+' · '+esc(o.local||'')+'</p></div>' +
            '<span class="pill pill-'+statusTone(o.status||'pendente')+'" style="font-size:11px">'+statusLabel(o.status||'pendente')+'</span>' +
          '</div>';
        }).join('')
      : '<p class="empty-note" style="padding:0">Nenhuma retirada marcada para hoje.</p>') +
  '</div>';

  /* produção pendente */
  var pendingMap = {};
  state.orders.filter(function(o){ return o.status !== 'cancelado' && !o.produced; }).forEach(function(o){
    (o.items||[]).forEach(function(i){ pendingMap[i.name] = (pendingMap[i.name] || 0) + Number(i.qty || 0); });
  });
  var pendingEntries = Object.keys(pendingMap);
  var prodBlock = '<div class="admin-card">' +
    '<div class="admin-card-head" style="margin-bottom:'+(pendingEntries.length?'14px':'0')+'">' +
      icon('package',19,'var(--brand)')+'<h3 style="flex:1">Produção pendente</h3>' +
    '</div>' +
    (pendingEntries.length
      ? '<div style="display:flex;flex-wrap:wrap;gap:9px">' + pendingEntries.map(function(name){
          return '<span class="pill pill-lilac" style="font-size:13.5px;padding:9px 16px">'+esc(name)+' · <b>'+pendingMap[name]+'</b></span>';
        }).join('') + '</div>'
      : '<p class="empty-note" style="padding:0">Nada pendente de produção.</p>') +
  '</div>';

  /* filtros */
  var f = state.orderFilter;
  var whenOpts = [['todos','Todos'],['hoje','Hoje'],['futuros','Daqui pra frente'],['abertos','Em aberto']];
  var filterBar = '<div class="filter-bar">' +
    '<div class="search-wrap"><span class="ic">'+icon('search',17)+'</span>' +
      '<input class="input" type="search" placeholder="Buscar por nome, telefone, código ou doce" value="'+esc(f.q)+'" data-action="orderSearch" aria-label="Buscar pedidos"></div>' +
    '<select class="input" style="width:auto;min-width:150px" data-action="orderFilterWhen" aria-label="Filtrar por período">' +
      whenOpts.map(function(w){ return '<option value="'+w[0]+'"'+(f.when===w[0]?' selected':'')+'>'+w[1]+'</option>'; }).join('') +
    '</select>' +
    '<select class="input" style="width:auto;min-width:150px" data-action="orderFilterStatus" aria-label="Filtrar por status">' +
      '<option value="todos"'+(f.status==='todos'?' selected':'')+'>Todos os status</option>' +
      ORDER_STATUS.map(function(s){ return '<option value="'+s.id+'"'+(f.status===s.id?' selected':'')+'>'+s.label+'</option>'; }).join('') +
    '</select>' +
    '<select class="input" style="width:auto;min-width:150px" data-action="orderFilterPaid" aria-label="Filtrar por pagamento">' +
      '<option value="todos"'+((f.paid||'todos')==='todos'?' selected':'')+'>Pago e não pago</option>' +
      '<option value="nao"'+(f.paid==='nao'?' selected':'')+'>Só não pagos</option>' +
      '<option value="sim"'+(f.paid==='sim'?' selected':'')+'>Só pagos</option>' +
    '</select>' +
    ((f.q || f.status!=='todos' || f.when!=='todos' || (f.paid&&f.paid!=='todos')) ? '<button class="btn-ghost" data-action="clearOrderFilter">'+icon('x',13)+' Limpar</button>' : '') +
  '</div>';

  /* lista agrupada por dia de retirada */
  var list = filteredOrders();
  var body;
  if (!state.orders.length){
    body = '<div class="slot-empty">Nenhuma encomenda recebida ainda.</div>';
  } else if (!list.length){
    body = '<div class="slot-empty">Nenhum pedido bate com esse filtro.</div>';
  } else {
    var groups = [], byKey = {};
    list.forEach(function(o){
      var k = orderDate(o) || 'sem-data';
      if (!byKey[k]){ byKey[k] = { key:k, orders:[] }; groups.push(byKey[k]); }
      byKey[k].orders.push(o);
    });
    groups.sort(function(a,b){ return a.key < b.key ? 1 : (a.key > b.key ? -1 : 0); });
    body = groups.map(function(g){
      var label = g.key === 'sem-data' ? 'Sem data definida'
        : (g.key === todayS ? 'Hoje · ' + dateLong(strToDate(g.key)) : dateLong(strToDate(g.key)));
      return '<div class="day-group">' +
        '<p class="day-group-head">'+esc(label)+' <span style="color:var(--ink-3);font-weight:700">('+g.orders.length+')</span></p>' +
        g.orders.map(orderCard).join('') +
      '</div>';
    }).join('');
  }

  return todayBlock + prodBlock + filterBar +
    '<p class="hint" style="margin:-8px 0 14px;display:flex;align-items:center;gap:12px;flex-wrap:wrap">' +
      '<span>'+list.length+' de '+state.orders.length+' pedidos</span>' +
      (list.length ? '<button class="btn-ghost" style="padding:5px 12px;min-height:0" data-action="exportOrdersCsv">'+icon('download',13)+' Exportar CSV</button>' : '') +
    '</p>' + body;
}

/* =========================================================
   ADMIN — agenda
========================================================= */
function locationSelectOptions(selectedId){
  /* lista completa (inclusive ocultos) — uma regra existente pode
     apontar pra um ponto escondido, e o <select> precisa mostrar o
     valor atual mesmo assim */
  return state.locations.filter(function(l){ return !l.ordersOnly; }).map(function(l){
    return '<option value="'+l.id+'"'+(l.id===selectedId?' selected':'')+'>'+esc(l.name)+(isLocHidden(l)?' (oculto)':'')+'</option>';
  }).join('');
}
function ruleWeekdaysHtml(rule){
  return '<div class="wd-row">' + WEEKDAY_SHORT.map(function(lbl, idx){
    var active = (rule.weekdays||[]).indexOf(idx) !== -1;
    return '<button type="button" class="wd-pill '+(active?'active':'')+'" data-action="toggleRuleWeekday" data-ruleid="'+rule.id+'" data-wd="'+idx+'" aria-pressed="'+(active?'true':'false')+'" aria-label="'+WEEKDAY_LABELS[idx]+'">'+lbl+'</button>';
  }).join('') + '</div>';
}
function sortedScheduleTemplate(){
  return state.scheduleTemplate.map(function(r, idx){
    return { rule:r, ord: (r.order !== undefined && r.order !== null) ? r.order : idx };
  }).sort(function(a,b){ return a.ord - b.ord; }).map(function(x){ return x.rule; });
}
/* variante do admin: inclui o que já passou e o que foi cancelado */
function generateAgendaAdmin(days){
  var out = [];
  var base = new Date();
  for (var i = 0; i < days; i++){
    var d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + i);
    var ds = dateToStr(d);
    var wd = d.getDay();
    sortedScheduleTemplate().forEach(function(rule){
      if (!ruleEnabled(rule)) return;
      if (!rule.weekdays || rule.weekdays.indexOf(wd) === -1) return;
      var loc = getLocation(rule.locationId);
      out.push({ id:rule.id+'_'+ds, date:ds, dateObj:d, locationName:loc?loc.name:'—',
                 startTime:rule.startTime, endTime:rule.endTime, templateId:rule.id,
                 cancelled: isOccurrenceCancelled(rule.id, ds) });
    });
  }
  return out;
}

function pageAdminAgenda(){
  var rules = sortedScheduleTemplate();
  var addRule = !state.addingScheduleRule
    ? '<button class="btn-secondary sm" data-action="toggleAddScheduleRule" style="margin-bottom:16px">'+icon('plus',15)+' Nova regra semanal</button>'
    : '<div class="new-card">' +
        '<h3>Nova regra semanal</h3>' +
        '<div class="field"><label for="sr-local">Ponto</label><select class="input" id="sr-local">'+locationSelectOptions()+'</select></div>' +
        '<div class="field"><span class="field-label">Dias da semana</span><div class="wd-row">' +
          WEEKDAY_SHORT.map(function(lbl,idx){
            return '<label class="wd-check"><input class="sr-wd" type="checkbox" value="'+idx+'" aria-label="'+WEEKDAY_LABELS[idx]+'"><span>'+lbl+'</span></label>';
          }).join('') + '</div>' +
          '<p class="hint">Toque nos dias em que essa venda acontece.</p>' +
        '</div>' +
        '<div class="fin-grid-2">' +
          '<div class="field"><label for="sr-inicio">Início</label><input class="input" id="sr-inicio" type="time" value="09:00"></div>' +
          '<div class="field"><label for="sr-fim">Fim</label><input class="input" id="sr-fim" type="time" value="09:30"></div>' +
        '</div>' +
        '<div style="display:flex;gap:10px">' +
          '<button class="btn-primary sm" data-action="createScheduleRule">Salvar regra</button>' +
          '<button class="btn-ghost" data-action="toggleAddScheduleRule">Cancelar</button>' +
        '</div>' +
      '</div>';

  var rulesHtml = rules.length
    ? rules.map(function(r, idx){
        var on = ruleEnabled(r);
        return '<div class="admin-row rule-row'+(on?'':' is-off')+'">' +
          '<div class="rule-move">' +
            '<button type="button" data-action="moveRuleUp" data-ruleid="'+r.id+'" '+(idx===0?'disabled':'')+' aria-label="Mover para cima">▲</button>' +
            '<button type="button" data-action="moveRuleDown" data-ruleid="'+r.id+'" '+(idx===rules.length-1?'disabled':'')+' aria-label="Mover para baixo">▼</button>' +
          '</div>' +
          labeledField('Ponto', '<select class="input sm" style="min-width:150px" data-action="setRuleLocation" data-ruleid="'+r.id+'" aria-label="Ponto da regra">'+locationSelectOptions(r.locationId)+'</select>') +
          labeledField('Dias', ruleWeekdaysHtml(r), 'flex:1 1 240px') +
          labeledField('Início', '<input class="input sm" type="time" style="width:118px" value="'+esc(r.startTime)+'" data-action="setRuleStart" data-ruleid="'+r.id+'" aria-label="Início">') +
          labeledField('Fim', '<input class="input sm" type="time" style="width:118px" value="'+esc(r.endTime)+'" data-action="setRuleEnd" data-ruleid="'+r.id+'" aria-label="Fim">') +
          '<div style="display:flex;align-items:center;gap:8px;margin-left:auto;align-self:center">' +
            '<button class="avail-toggle '+(on?'avail-on':'avail-hid')+'" data-action="toggleRuleEnabled" data-ruleid="'+r.id+'" aria-pressed="'+(on?'true':'false')+'" title="'+(on?'Pausar esta regra — some da agenda do site sem apagar o cadastro':'Reativar esta regra')+'">' +
              (on ? icon('check',13)+' Ativa' : icon('eyeOff',13)+' Pausada') + '</button>' +
            '<button class="btn-danger-ghost" data-action="removeScheduleRule" data-ruleid="'+r.id+'" aria-label="Remover regra">'+icon('trash',16)+'</button>' +
          '</div>' +
        '</div>' +
        (on ? '' : '<p class="hint" style="margin:-4px 0 12px 8px">'+icon('info',12)+' Pausada: não aparece na agenda do site nem pode ser escolhida numa encomenda.</p>');
      }).join('')
    : '<p class="empty-note">Nenhuma regra cadastrada — o site não mostra horários de venda.</p>';

  /* ocorrências dos próximos dias, com cancelamento pontual */
  var occ = generateAgendaAdmin(AGENDA_DAYS);
  var byDate = {}, dates = [];
  occ.forEach(function(o){ if (!byDate[o.date]){ byDate[o.date] = []; dates.push(o.date); } byDate[o.date].push(o); });
  var occHtml = dates.length
    ? dates.map(function(ds){
        return '<div class="day-group">' +
          '<p class="day-group-head">'+esc(dateLong(strToDate(ds)))+(ds===todayStr()?' · hoje':'')+'</p>' +
          byDate[ds].map(function(o){
            return '<div class="admin-row" style="'+(o.cancelled?'opacity:.55':'')+'">' +
              icon('mapPin',16,'var(--brand)') +
              '<b style="font-size:14px">'+esc(o.locationName)+'</b>' +
              '<span class="tabnum" style="color:var(--ink-2);font-weight:700">'+o.startTime+' – '+o.endTime+'</span>' +
              (o.cancelled ? '<span class="pill pill-danger" style="font-size:11px">Cancelado</span>' : '') +
              '<button class="btn-ghost" style="margin-left:auto" data-action="toggleException" data-templateid="'+o.templateId+'" data-date="'+o.date+'">' +
                (o.cancelled ? icon('refresh',13)+' Reativar' : icon('x',13)+' Cancelar este dia') + '</button>' +
            '</div>';
          }).join('') + '</div>';
      }).join('')
    : '<p class="empty-note">Nenhuma ocorrência nos próximos dias.</p>';

  /* horários avulsos */
  var addExtra = !state.addingExtraSlot
    ? '<button class="btn-secondary sm" data-action="toggleAddExtraSlot" style="margin-bottom:16px">'+icon('plus',15)+' Horário avulso</button>'
    : '<div class="new-card">' +
        '<h3>Horário avulso</h3>' +
        '<div class="field"><label for="ex-local">Ponto</label><select class="input" id="ex-local">'+locationSelectOptions()+'</select></div>' +
        '<div class="fin-grid-3">' +
          '<div class="field"><label for="ex-data">Data</label><input class="input" id="ex-data" type="date" value="'+todayStr()+'"></div>' +
          '<div class="field"><label for="ex-inicio">Início</label><input class="input" id="ex-inicio" type="time" value="09:00"></div>' +
          '<div class="field"><label for="ex-fim">Fim</label><input class="input" id="ex-fim" type="time" value="09:30"></div>' +
        '</div>' +
        '<div style="display:flex;gap:10px">' +
          '<button class="btn-primary sm" data-action="createExtraSlot">Salvar horário</button>' +
          '<button class="btn-ghost" data-action="toggleAddExtraSlot">Cancelar</button>' +
        '</div>' +
      '</div>';
  var extrasHtml = (state.scheduleExtras||[]).length
    ? state.scheduleExtras.slice().sort(function(a,b){ return a.date < b.date ? -1 : 1; }).map(function(ex){
        var loc = getLocation(ex.locationId);
        return '<div class="admin-row">' + icon('calendar',16,'var(--brand)') +
          '<b style="font-size:14px">'+esc(loc?loc.name:'—')+'</b>' +
          '<span class="tabnum" style="color:var(--ink-2);font-weight:700">'+esc(dateLabel(strToDate(ex.date)))+' · '+ex.startTime+' – '+ex.endTime+'</span>' +
          '<button class="btn-danger-ghost" data-action="removeExtraSlot" data-extraid="'+ex.id+'" style="margin-left:auto" aria-label="Remover horário avulso">'+icon('trash',16)+'</button>' +
        '</div>';
      }).join('')
    : '<p class="empty-note">Nenhum horário avulso.</p>';

  return '<div class="admin-card"><div class="admin-card-head">'+icon('refresh',18,'var(--brand)')+'<h3 style="flex:1">Regras semanais</h3></div>' +
      '<p class="hint" style="margin:-10px 0 16px">O que se repete toda semana. É daqui que sai a agenda do site.</p>' +
      addRule + rulesHtml + '</div>' +
    '<div class="admin-card"><div class="admin-card-head">'+icon('calendar',18,'var(--brand)')+'<h3 style="flex:1">Próximos '+AGENDA_DAYS+' dias</h3></div>' +
      '<p class="hint" style="margin:-10px 0 16px">Cancele um dia específico sem mexer na regra semanal.</p>' + occHtml + '</div>' +
    '<div class="admin-card"><div class="admin-card-head">'+icon('sparkle',18,'var(--brand)')+'<h3 style="flex:1">Horários avulsos</h3></div>' +
      '<p class="hint" style="margin:-10px 0 16px">Vendas fora do padrão semanal — feira, evento, entrega especial.</p>' +
      addExtra + extrasHtml + '</div>';
}

/* =========================================================
   ADMIN — locais
========================================================= */
function pageAdminLocais(){
  var addLocForm = !state.addingLocation
    ? '<button class="btn-secondary sm" data-action="toggleAddLocation" style="margin-bottom:18px">'+icon('plus',15)+' Adicionar ponto</button>'
    : '<div class="new-card">' +
        '<h3>Novo ponto de retirada</h3>' +
        '<div class="field"><label for="nl-nome">Nome</label><input class="input" id="nl-nome" placeholder="Ex: Praça Central"></div>' +
        '<div class="field"><label for="nl-endereco">Endereço (opcional)</label><input class="input" id="nl-endereco" placeholder="Ex: Rua das Flores, 123"></div>' +
        '<div style="display:flex;gap:10px">' +
          '<button class="btn-primary sm" data-action="createLocation">Salvar ponto</button>' +
          '<button class="btn-ghost" data-action="toggleAddLocation">Cancelar</button>' +
        '</div>' +
      '</div>';

  var editors = state.locations.map(function(l){
    var hidden = isLocHidden(l);
    return '<div class="admin-card'+(hidden?' dim':'')+'">' +
      '<div class="admin-card-head">' +
        icon('mapPin',18,'var(--brand)') +
        '<input class="input sm" style="flex:1;font-weight:800;min-width:140px" value="'+esc(l.name)+'" data-action="setLocName" data-locid="'+l.id+'" aria-label="Nome do ponto">' +
        '<button class="avail-toggle '+(hidden?'avail-hid':'avail-on')+'" data-action="toggleLocationHidden" data-locid="'+l.id+'" title="'+(hidden?'Mostrar no site':'Esconder do site — some da vitrine e da agenda sem apagar o cadastro')+'">' +
          (hidden ? icon('eyeOff',13)+' Oculto no site' : icon('eye',13)+' Visível no site') + '</button>' +
        '<button class="btn-danger-ghost" data-action="removeLocation" data-locid="'+l.id+'" aria-label="Excluir '+esc(l.name)+'">'+icon('trash',17)+'</button>' +
      '</div>' +
      (hidden ? '<p class="hint" style="margin-top:-8px;margin-bottom:14px">'+icon('info',12)+' Este ponto não aparece no site nem entra na agenda pública — o cadastro, o mapa e as regras de venda continuam salvos.</p>' : '') +
      '<div class="field"><label for="la-'+l.id+'">Endereço (opcional)</label>' +
        '<input class="input" id="la-'+l.id+'" placeholder="Ex: Rua das Flores, 123" value="'+esc(l.address||'')+'" data-action="setLocAddress" data-locid="'+l.id+'"></div>' +
      '<div style="margin-bottom:12px">'+toggleChip('Somente encomenda combinada (não entra na agenda de vendas)', !!l.ordersOnly, 'toggleOrdersOnly', 'data-locid="'+l.id+'"')+'</div>' +
      '<div class="field"><label for="lm-'+l.id+'">Imagem do mapa</label>' +
        '<input class="file-input" id="lm-'+l.id+'" type="file" accept="image/*" data-action="uploadMap" data-locid="'+l.id+'"></div>' +
      MapWithPin(l, true) +
      '<p class="hint">Clique no mapa para posicionar o marcador.</p>' +
      '<div class="field" style="margin-top:12px;margin-bottom:0"><label for="lp-'+l.id+'">Texto do marcador</label>' +
        '<input class="input" id="lp-'+l.id+'" placeholder="Ex: Sala A24" value="'+esc(l.pin ? (l.pin.label||'') : '')+'" data-action="setPinLabel" data-locid="'+l.id+'" '+(l.pin?'':'disabled')+'></div>' +
      (l.pin ? '<button class="btn-ghost" data-action="removePin" data-locid="'+l.id+'" style="margin-top:8px">'+icon('x',13)+' Remover marcador</button>' : '') +
    '</div>';
  }).join('');
  return addLocForm + editors;
}

/* =========================================================
   ADMIN — análises
   Agora cruzando faturamento COM o custo calculado nas receitas,
   para responder lucro de verdade e não só quanto entrou.
========================================================= */
function periodStart(period){
  var d = new Date();
  if (period === '30') return dateToStr(new Date(d.getFullYear(), d.getMonth(), d.getDate() - 29));
  if (period === 'mes') return dateToStr(new Date(d.getFullYear(), d.getMonth(), 1));
  return '0000-00-00';
}
/* Início e fim (exclusivo) do período ANTERIOR equivalente — "30 dias"
   compara com os 30 dias antes desses, "este mês" com o mês passado
   inteiro. "Desde o começo" não tem um "anterior" que faça sentido. */
function periodPrevRange(period){
  var d = new Date();
  if (period === '30'){
    var curFrom = new Date(d.getFullYear(), d.getMonth(), d.getDate() - 29);
    return { from: dateToStr(new Date(d.getFullYear(), d.getMonth(), d.getDate() - 59)), to: dateToStr(curFrom) };
  }
  if (period === 'mes'){
    var curFrom2 = new Date(d.getFullYear(), d.getMonth(), 1);
    return { from: dateToStr(new Date(d.getFullYear(), d.getMonth() - 1, 1)), to: dateToStr(curFrom2) };
  }
  return null;
}
function costPerUnitByName(){
  var map = {};
  state.products.forEach(function(p){ map[p.name] = recipeCosts(p); });
  return map;
}
function costPerUnitById(){
  var map = {};
  state.products.forEach(function(p){ map[p.id] = recipeCosts(p); });
  return map;
}
/* Custo de um item de pedido, na ordem de confiança:
   1) unitCost congelado no próprio item (pedidos criados após esta
      versão) — nunca muda, é o valor real da venda.
   2) custo ATUAL do produto por id (pedidos sem unitCost congelado,
      mas com productId — aproximação, mas sobrevive a renomear).
   3) custo ATUAL por nome (pedidos bem antigos, sem productId nenhum
      — só existe pra não zerar de vez o histórico mais velho). */
function orderItemUnitCost(i, costsById, costsByName){
  if (i.unitCost !== undefined && i.unitCost !== null) return Number(i.unitCost) || 0;
  var byId = i.productId && costsById[i.productId];
  if (byId) return byId.finalCostPerPackage;
  var byName = costsByName[i.name];
  return byName ? byName.finalCostPerPackage : 0;
}
function computeAnalytics(){
  var from = periodStart(state.analyticsPeriod);
  var costsById = costPerUnitById();
  var costsByName = costPerUnitByName();
  var orders = state.orders.filter(function(o){
    if (o.status === 'cancelado') return false;
    if (state.analyticsOnlyDone && o.status !== 'concluido') return false;
    var d = orderDate(o);
    return !d || d >= from;
  });

  var totalRevenue = 0, totalCost = 0, totalUnits = 0;
  var productMap = {}, customerMap = {}, locMap = {}, wdMap = {}, dayMap = {};

  orders.forEach(function(o){
    var rev = Number(o.total || 0);
    totalRevenue += rev;
    var oCost = 0;
    (o.items||[]).forEach(function(i){
      var qty = Number(i.qty||0), price = Number(i.price||0);
      var unitCost = orderItemUnitCost(i, costsById, costsByName);
      oCost += unitCost * qty;
      totalUnits += qty;
      if (!productMap[i.name]) productMap[i.name] = { name:i.name, qty:0, revenue:0, cost:0 };
      productMap[i.name].qty += qty;
      productMap[i.name].revenue += qty * price;
      productMap[i.name].cost += unitCost * qty;
    });
    totalCost += oCost;

    var key = (o.telefone || o.nome || '').trim();
    if (key){
      if (!customerMap[key]) customerMap[key] = { nome:o.nome, telefone:o.telefone, total:0, count:0 };
      customerMap[key].total += rev;
      customerMap[key].count += 1;
    }
    var lk = o.local || 'A combinar';
    if (!locMap[lk]) locMap[lk] = { name:lk, revenue:0, profit:0, count:0 };
    locMap[lk].revenue += rev; locMap[lk].profit += (rev - oCost); locMap[lk].count += 1;

    var dstr = orderDate(o);
    if (dstr){
      var wd = strToDate(dstr).getDay();
      if (!wdMap[wd]) wdMap[wd] = { revenue:0, profit:0 };
      wdMap[wd].revenue += rev; wdMap[wd].profit += (rev - oCost);
      if (!dayMap[dstr]) dayMap[dstr] = 0;
      dayMap[dstr] += rev;
    }
  });

  /* prejuízo do mesmo período — sem isso o "Lucro" da tela conta só o
     que vendeu bem e nunca desconta a fornada que deu errado. */
  var totalLoss = state.lossEvents.filter(function(ev){
    return ev.date >= from;
  }).reduce(function(s,ev){ return s + lossEventCost(ev); }, 0);

  /* período anterior equivalente, só pra responder "subiu ou caiu" —
     sem isso todo número da tela é absoluto, sem noção de tendência */
  var prevRange = periodPrevRange(state.analyticsPeriod);
  var prev = null;
  if (prevRange){
    var prevRevenue = 0, prevCost = 0;
    state.orders.forEach(function(o){
      if (o.status === 'cancelado') return;
      if (state.analyticsOnlyDone && o.status !== 'concluido') return;
      var d = orderDate(o);
      if (!d || d < prevRange.from || d >= prevRange.to) return;
      var rev = Number(o.total||0);
      prevRevenue += rev;
      (o.items||[]).forEach(function(i){ prevCost += orderItemUnitCost(i, costsById, costsByName) * Number(i.qty||0); });
    });
    var prevLoss = state.lossEvents.filter(function(ev){ return ev.date >= prevRange.from && ev.date < prevRange.to; })
      .reduce(function(s,ev){ return s + lossEventCost(ev); }, 0);
    prev = { revenue:prevRevenue, profit:prevRevenue-prevCost, netResult:(prevRevenue-prevCost)-prevLoss };
  }

  var toArr = function(m){ return Object.keys(m).map(function(k){ return m[k]; }); };
  var allProductRows = toArr(productMap).map(function(p){ p.profit = p.revenue - p.cost; return p; }).sort(function(a,b){ return b.profit - a.profit; });
  var totalProfit = totalRevenue - totalCost;
  var netResult = totalProfit - totalLoss;
  return {
    totalRevenue:totalRevenue, totalCost:totalCost, totalProfit: totalProfit,
    totalLoss: totalLoss, netResult: netResult,
    marginPct: totalRevenue > 0 ? ((totalRevenue-totalCost)/totalRevenue)*100 : 0,
    totalOrders: orders.length, totalUnits: totalUnits,
    avgTicket: orders.length ? totalRevenue/orders.length : 0,
    allProducts: allProductRows, topProducts: allProductRows.slice(0,8),
    topCustomers: toArr(customerMap).sort(function(a,b){ return b.total-a.total; }).slice(0,6),
    byLocation: toArr(locMap).sort(function(a,b){ return b.revenue-a.revenue; }),
    byWeekday: WEEKDAY_LABELS.map(function(lbl,idx){ return { label:lbl, revenue:(wdMap[idx]||{}).revenue||0, profit:(wdMap[idx]||{}).profit||0 }; }),
    dayMap: dayMap,
    prev: prev,
    revenueDeltaPct: (prev && prev.revenue > 0) ? ((totalRevenue-prev.revenue)/prev.revenue)*100 : null,
    netResultDelta: prev ? (netResult - prev.netResult) : null
  };
}

function statTile(label, value, iconName, cls, sub){
  return '<div class="stat-tile '+(cls||'')+'">' + icon(iconName,20,'var(--brand)') +
    '<p class="stat-tile-value">'+value+'</p><p class="stat-tile-label">'+esc(label)+'</p>' +
    (sub ? '<p class="stat-tile-sub">'+sub+'</p>' : '') + '</div>';
}
/* Card grande no topo do dashboard — o número que resume "como foi",
   pra bater o olho sem precisar ler o stat-grid inteiro. */
function heroResult(label, value, iconName, tone, sub){
  return '<div class="hero-result '+(tone||'')+'">' +
    '<div class="hero-result-ic">'+icon(iconName,26)+'</div>' +
    '<div class="hero-result-body"><p class="hero-result-label">'+esc(label)+'</p>' +
    '<p class="hero-result-value">'+value+'</p>' +
    (sub ? '<p class="hero-result-sub">'+sub+'</p>' : '') +
    '</div></div>';
}
function sectionLabel(text, iconName){
  return '<p class="section-label">'+(iconName?icon(iconName,15,'var(--brand)'):'')+' '+esc(text)+'</p>';
}
function barRow(label, valueLabel, pct, tone){
  return '<div class="bar-row">' +
    '<div class="bar-row-label" title="'+esc(label)+'">'+esc(label)+'</div>' +
    '<div class="bar-track"><div class="bar-fill '+(tone||'')+'" style="width:'+clamp(pct,0,100)+'%"></div></div>' +
    '<div class="bar-row-value">'+valueLabel+'</div>' +
  '</div>';
}
function dashPanel(title, iconName, bodyHtml, side){
  return '<div class="dash-panel"><p class="dash-panel-title">'+icon(iconName,16,'var(--brand)')+' '+title+
    (side ? '<span class="sp">'+side+'</span>' : '')+'</p>'+bodyHtml+'</div>';
}

/* =========================================================
   ANÁLISES
   Vendas (o que já aconteceu) + Metas/Compras/Reposição (planejamento
   — a Julia usa essas três só pra olhar números, não pra cadastrar
   nada, por isso moraram pra cá em vez de dentro de Financeiro) + um
   simulador de Perdas que gera um registro de verdade em Financeiro →
   Perdas quando o prejuízo é real, não só hipotético.
========================================================= */
var ANALYSES_TABS = [
  ['metas','Metas','sparkle'], ['vendas','Vendas','chart'],
  ['compras','Compras','cart'], ['reposicao','Reposição','refresh'],
  ['perdas','Perdas','alert']
];
function pageAnalysesPerdaSimulada(){
  if (!state.lossDraft){
    var prods = state.products.filter(function(p){ return !isHidden(p) && ensureRecipe(p).ingredientUsage.length > 0; });
    state.lossDraft = makeLossDraft(prods.length ? prods[0].id : '');
  }
  return '<p class="hint" style="margin:-6px 0 18px">Pra que serve: simular quanto custaria uma fornada perdida antes de decidir se foi prejuízo de verdade. Salvando, o registro aparece em <b>Financeiro → Perdas</b>.</p>' +
    lossDraftForm();
}
function pageAdminAnalises(){
  var t = state.analysesTab || 'vendas';
  var nav = '<div class="subtab-row">' + ANALYSES_TABS.map(function(x){
    return '<button class="subtab'+(t===x[0]?' active':'')+'" data-action="setAnalysesTab" data-atab="'+x[0]+'">'+icon(x[2],13)+' '+x[1]+'</button>';
  }).join('') + '</div>';

  var body = '';
  if (t === 'metas') body = pageFinanceMetas();
  else if (t === 'compras') body = pageFinanceCompras();
  else if (t === 'reposicao') body = pageFinanceReposicao();
  else if (t === 'perdas') body = pageAnalysesPerdaSimulada();
  else body = pageAnalysesVendas();
  return nav + body;
}
function pageAnalysesVendas(){
  var a = computeAnalytics();
  var periods = [['30','Últimos 30 dias'],['mes','Este mês'],['tudo','Desde o começo']];
  var head = '<div class="filter-bar">' +
    '<div class="subtab-row" style="margin:0">' + periods.map(function(p){
      return '<button class="subtab'+(state.analyticsPeriod===p[0]?' active':'')+'" data-action="setAnalyticsPeriod" data-period="'+p[0]+'">'+p[1]+'</button>';
    }).join('') + '</div>' +
    toggleChip('Contar só concluídos', state.analyticsOnlyDone, 'toggleOnlyDone', '', 'margin-left:auto') +
    '<button class="btn-ghost" data-action="exportAnalyticsCsv">'+icon('download',13)+' Exportar CSV</button>' +
  '</div>';

  /* "subiu ou caiu" comparado ao período anterior equivalente — sem
     isso todo tile é um número solto, sem noção de tendência */
  var revenueDeltaSub = '';
  if (a.revenueDeltaPct !== null){
    var arrow = a.revenueDeltaPct > 0.5 ? '↑' : (a.revenueDeltaPct < -0.5 ? '↓' : '=');
    revenueDeltaSub = arrow + ' ' + Math.abs(a.revenueDeltaPct).toFixed(0) + '% vs. período anterior';
  }
  var netResultSub = 'lucro das vendas − perdas' + (a.netResultDelta === null ? '' :
    (a.netResultDelta >= 0 ? ' · +' : ' · ') + currency(a.netResultDelta) + ' vs. anterior');

  var hero = heroResult('Resultado líquido do período', currency(a.netResult), 'wallet',
    a.netResult >= 0 ? 'pos' : 'neg', netResultSub);

  var tiles = '<div class="stat-grid">' +
    statTile('Faturamento', currency(a.totalRevenue), 'coin', 'brand', revenueDeltaSub) +
    statTile('Lucro das vendas', currency(a.totalProfit), 'chart', a.totalProfit >= 0 ? 'pos' : 'neg', 'margem de ' + a.marginPct.toFixed(1) + '%') +
    statTile('Custo de produção', currency(a.totalCost), 'package', '', 'ingredientes + embalagem' + (Number(state.financialGoals.laborHourCost)>0 ? ' + mão de obra' : '')) +
    statTile('Perdas no período', currency(a.totalLoss), 'alert', a.totalLoss > 0 ? 'neg' : '') +
    statTile('Pedidos', a.totalOrders, 'clipboard', '', a.totalUnits + ' itens vendidos') +
    statTile('Ticket médio', currency(a.avgTicket), 'bag') +
  '</div>';

  if (!a.totalOrders){
    return head + hero + tiles + '<div class="slot-empty">Nenhum pedido no período escolhido.</div>';
  }

  var maxProfit = Math.max.apply(null, a.topProducts.map(function(p){ return Math.abs(p.profit); }).concat([1]));
  var prodHtml = a.topProducts.length
    ? a.topProducts.map(function(p){
        return barRow(p.name, p.qty+' un · '+currency(p.profit), Math.round(Math.abs(p.profit)/maxProfit*100), p.profit>=0?'pos':'neg');
      }).join('') +
      '<p class="hint">Ordenado por lucro, não por volume — o que mais vende nem sempre é o que mais sobra.</p>'
    : '<p class="empty-note">Sem dados ainda.</p>';

  var maxProdRev = Math.max.apply(null, a.topProducts.map(function(p){ return p.revenue; }).concat([1]));
  var revHtml = a.topProducts.length
    ? a.topProducts.slice().sort(function(x,y){ return y.revenue-x.revenue; }).map(function(p){
        return barRow(p.name, p.qty+' un · '+currency(p.revenue), Math.round(p.revenue/maxProdRev*100));
      }).join('')
    : '<p class="empty-note">Sem dados ainda.</p>';

  var maxCustomer = Math.max.apply(null, a.topCustomers.map(function(c){ return c.total; }).concat([1]));
  var custHtml = a.topCustomers.length
    ? a.topCustomers.map(function(c){
        return barRow((c.nome||'Cliente'), c.count+' pedidos · '+currency(c.total), Math.round(c.total/maxCustomer*100));
      }).join('')
    : '<p class="empty-note">Sem dados ainda.</p>';

  var maxLoc = Math.max.apply(null, a.byLocation.map(function(l){ return l.revenue; }).concat([1]));
  var locHtml = a.byLocation.length
    ? a.byLocation.map(function(l){
        return barRow(l.name, l.count+' ped. · '+currency(l.profit)+' de lucro', Math.round(l.revenue/maxLoc*100));
      }).join('')
    : '<p class="empty-note">Sem dados ainda.</p>';

  var maxWd = Math.max.apply(null, a.byWeekday.map(function(w){ return w.revenue; }).concat([1]));
  var wdHtml = a.byWeekday.map(function(w){
    return barRow(w.label, currency(w.revenue), Math.round(w.revenue/maxWd*100));
  }).join('');

  return head + hero + sectionLabel('Números do período') + tiles +
    sectionLabel('Detalhamento') +
    '<div class="dash-grid">' +
      dashPanel('Lucro por doce', 'chart', prodHtml) +
      dashPanel('Faturamento por doce', 'coin', revHtml) +
      dashPanel('Por ponto de retirada', 'mapPin', locHtml) +
      dashPanel('Por dia da semana', 'calendar', wdHtml) +
      dashPanel('Melhores clientes', 'heart', custHtml) +
    '</div>';
}

/* =========================================================
   ADMIN — financeiro
========================================================= */
var UNITS = ['g','ml','un'];
function unitOptions(sel){
  return UNITS.map(function(u){ return '<option value="'+u+'"'+(sel===u?' selected':'')+'>'+u+'</option>'; }).join('');
}

/* ---------- resumo ---------- */
function pageFinanceResumo(){
  var prods = state.products.filter(function(p){ return !isHidden(p); });
  if (!prods.length) return '<div class="slot-empty">Cadastre um doce para ver o resumo financeiro.</div>';

  var rows = prods.map(function(p){ return { p:p, c:recipeCosts(p) }; });
  var semReceita = rows.filter(function(r){ return r.c.finalCostPerPackage <= 0; });
  var prejuizo = rows.filter(function(r){ return r.c.finalCostPerPackage > 0 && r.c.profit <= 0; });
  var avgMargin = rows.filter(function(r){ return r.c.sellPrice>0 && r.c.finalCostPerPackage>0; });
  var avg = avgMargin.length ? avgMargin.reduce(function(s,r){ return s + r.c.marginPct; },0)/avgMargin.length : 0;
  var melhor = rows.slice().filter(function(r){ return r.c.finalCostPerPackage>0; }).sort(function(a,b){ return b.c.profit - a.c.profit; })[0];

  var alerts = '';
  if (semReceita.length){
    alerts += '<div class="banner banner-warn">'+icon('alert',16)+'<span><b>'+semReceita.length+' doce(s) sem receita montada</b> — '+
      esc(semReceita.map(function(r){ return r.p.name; }).join(', '))+'. Sem isso o custo aparece como zero e o lucro fica irreal. Monte em <b>Receitas</b>.</span></div>';
  }
  if (prejuizo.length){
    alerts += '<div class="banner banner-danger">'+icon('alert',16)+'<span><b>'+prejuizo.length+' doce(s) no prejuízo</b> — '+
      esc(prejuizo.map(function(r){ return r.p.name; }).join(', '))+'. O preço não cobre nem o custo.</span></div>';
  }

  var from30 = dateToStr(new Date(Date.now() - 29 * 86400000));
  var loss30 = state.lossEvents.filter(function(ev){ return ev.date >= from30; })
    .reduce(function(s,ev){ return s + lossEventCost(ev); }, 0);

  var hero = heroResult('Margem média dos doces', avg.toFixed(1)+'%', 'scale',
    avg >= 40 ? 'pos' : (avg > 0 ? '' : 'neg'), 'sobre o preço de venda · '+prods.length+' doce(s) ativo(s)');

  var tiles = '<div class="stat-grid">' +
    statTile('Custo fixo do mês', currency(monthlyOverhead()), 'wallet', '', (state.financialGoals.includeTax ? 'inclui a taxa MEI' : 'sem a taxa MEI')) +
    statTile('Mais lucrativo', melhor ? esc(melhor.p.name) : '—', 'sparkle', 'brand', melhor ? currency(melhor.c.profit)+' por unidade' : '') +
    statTile('Doces ativos', prods.length, 'cake') +
    statTile('Perdas nos últimos 30 dias', currency(loss30), 'alert', loss30 > 0 ? 'neg' : '', 'fornadas que deram errado · aba Perdas') +
  '</div>';

  var table = '<div class="tbl-wrap"><table class="tbl">' +
    '<thead><tr><th>Doce</th><th class="n">Preço</th><th class="n">Insumos</th><th class="n">Mão de obra</th><th class="n">Custo total</th><th class="n">Lucro</th><th class="n">Margem</th><th class="n">Markup</th></tr></thead><tbody>' +
    rows.map(function(r){
      var c = r.c;
      return '<tr>' +
        '<td class="k">'+esc(r.p.name)+'</td>' +
        '<td class="n">'+currency(c.sellPrice)+'</td>' +
        '<td class="n">'+currency(c.materialPerPackage)+'</td>' +
        '<td class="n">'+(c.laborPerPackage>0?currency(c.laborPerPackage):'—')+'</td>' +
        '<td class="n">'+currency(c.finalCostPerPackage)+'</td>' +
        '<td class="n" style="color:'+(c.profit>0?'var(--ok)':'var(--danger)')+';font-weight:800">'+currency(c.profit)+'</td>' +
        '<td class="n">'+(c.sellPrice>0?c.marginPct.toFixed(0)+'%':'—')+'</td>' +
        '<td class="n">'+(c.markup>0?c.markup.toFixed(2)+'×':'—')+'</td>' +
      '</tr>';
    }).join('') + '</tbody></table></div>';

  var bars = rows.map(function(r){
    var c = r.c;
    var total = Math.max(c.sellPrice, c.finalCostPerPackage, 0.01);
    var costPct = clamp(c.finalCostPerPackage/total*100, 0, 100);
    var profPct = clamp(Math.max(0,c.profit)/total*100, 0, 100);
    return '<div style="margin-bottom:16px">' +
      '<div style="display:flex;justify-content:space-between;font-size:13px;font-weight:800;margin-bottom:6px">' +
        '<span>'+esc(r.p.name)+'</span><span style="color:var(--ink-3);font-weight:700">'+currency(c.sellPrice)+'</span></div>' +
      '<div class="margin-bar"><i class="cost" style="width:'+costPct+'%"></i><i class="prof" style="width:'+profPct+'%"></i></div>' +
      '<p class="hint" style="margin-top:5px">Custo '+currency(c.finalCostPerPackage)+' · sobra '+currency(c.profit)+'</p>' +
    '</div>';
  }).join('') +
  '<div class="legend"><span><i style="background:var(--ink-3)"></i> custo</span><span><i style="background:var(--brand-2)"></i> lucro</span></div>';

  return alerts + hero + sectionLabel('Números do negócio') + tiles +
    sectionLabel('Detalhamento') +
    '<div class="admin-card"><div class="admin-card-head">'+icon('list',18,'var(--brand)')+'<h3 style="flex:1">Custo e lucro por doce</h3></div>'+table+'</div>' +
    '<div class="dash-grid">' + dashPanel('Onde vai cada real do preço', 'scale',
      '<p class="hint" style="margin:-4px 0 14px">Pra que serve: ver de relance quais doces têm gordura pra cortar no preço e quais já estão no talo.</p>' + bars) + '</div>';
}

/* =========================================================
   REORDENAR ARRASTANDO
   `draggable` fica só na alcinha, não na linha inteira: a linha é
   cheia de <input>, e torná-la arrastável sequestraria a seleção de
   texto dentro deles. As classes de feedback (.drag-over etc.) são
   adicionadas por JS, então precisam ser limpas ANTES de render() —
   a reconciliação do DOM as removeria de qualquer jeito.
========================================================= */
function dragHandle(label){
  return '<span class="drag-handle" data-draghandle draggable="true" role="button" tabindex="-1" aria-label="'+label+'" title="Arraste para reordenar">'+icon('grip',15)+'</span>';
}
function dragHint(){
  return '<p class="hint" style="margin:-6px 0 12px">'+icon('grip',12)+' Arraste pela alcinha para mudar a ordem da lista.</p>';
}
/* Grava a nova ordem em todos os itens que mudaram de posição. Só quem
   mudou vai pro Firestore — reescrever a lista inteira a cada arrasto
   geraria dezenas de escritas por um movimento só. */
function reorderInsumos(kind, from, to){
  var isIng = kind === 'ingredient';
  var list = isIng ? state.ingredients : state.packagingItems;
  if (from === to || from < 0 || to < 0 || from >= list.length || to >= list.length) return;
  list.splice(to, 0, list.splice(from, 1)[0]);
  var collection = isIng ? 'ingredients' : 'packagingItems';
  list.forEach(function(it, i){
    if (Number(it.order) !== i){ it.order = i; dbSet(collection+'/'+it.id+'/order', i); }
  });
}
function reorderRecipeUsage(productId, kind, from, to){
  var p = getProduct(productId); if (!p) return;
  var r = ensureRecipe(p);
  var arr = kind === 'ingredient' ? r.ingredientUsage : r.packagingUsage;
  if (from === to || from < 0 || to < 0 || from >= arr.length || to >= arr.length) return;
  arr.splice(to, 0, arr.splice(from, 1)[0]);
  dbSet('products/'+p.id+'/recipe', r);
}
function applyDragReorder(zone, from, to){
  if (zone === 'ing') return reorderInsumos('ingredient', from, to);
  if (zone === 'pack') return reorderInsumos('packaging', from, to);
  if (zone.indexOf('rIng:') === 0) return reorderRecipeUsage(zone.slice(5), 'ingredient', from, to);
  if (zone.indexOf('rPack:') === 0) return reorderRecipeUsage(zone.slice(6), 'packaging', from, to);
}

/* ---------- insumos ---------- */
function itemRow(item, kind, shopRow, idx){
  var isIng = kind === 'ingredient';
  var attr = isIng ? 'data-ingid' : 'data-packid';
  var pre = isIng ? 'Ingredient' : 'Packaging';
  var disp = itemUnitCostDisplay(item);
  var shopping = '';
  if (isIng && shopRow){
    shopping = '<div class="admin-row-sub">' +
      '<span>'+icon('cart',13)+' Precisa comprar <b>'+shopRow.packs+'×</b> ('+num(shopRow.needed, shopRow.needed % 1 === 0 ? 0 : 1)+' '+esc(shopRow.unit)+' de '+num(shopRow.packQty,0)+' '+esc(shopRow.unit)+')</span>' +
      '<span>Sobra <b>'+num(shopRow.leftover, shopRow.leftover % 1 === 0 ? 0 : 1)+' '+esc(shopRow.unit)+'</b> ('+currency(shopRow.leftoverValue)+')</span>' +
    '</div>';
  }
  return '<div class="admin-row" data-dragzone="'+(isIng?'ing':'pack')+'" data-dragindex="'+idx+'">' +
    dragHandle('Reordenar '+esc(item.name)) +
    labeledField('Nome', '<input class="input sm" value="'+esc(item.name)+'" data-action="set'+pre+'Name" '+attr+'="'+item.id+'" aria-label="Nome">', 'flex:1 1 160px') +
    labeledField('Unidade', '<select class="input sm" style="width:82px" data-action="set'+pre+'Unit" '+attr+'="'+item.id+'" aria-label="Unidade">'+unitOptions(item.unit)+'</select>') +
    labeledField('Onde comprou', '<input class="input sm" style="width:130px" value="'+esc(item.store||'')+'" placeholder="Ex: Atacadão" data-action="set'+pre+'Store" '+attr+'="'+item.id+'" aria-label="Onde comprou">') +
    labeledField('Preço do pote', '<input class="input sm" type="number" inputmode="decimal" step="0.01" style="width:110px" value="'+(item.packagePrice||0)+'" data-action="set'+pre+'Price" '+attr+'="'+item.id+'" aria-label="Preço do pacote">') +
    labeledField('Qtd no pote', '<input class="input sm" type="number" inputmode="decimal" step="1" style="width:110px" value="'+(item.packageQty||0)+'" data-action="set'+pre+'Qty" '+attr+'="'+item.id+'" aria-label="Quantidade no pacote">') +
    labeledField('Custo por '+disp.label, '<span style="font-weight:800;font-size:14.5px;color:var(--brand);white-space:nowrap">'+currency(disp.value)+'</span>') +
    '<button class="btn-danger-ghost" data-action="remove'+pre+'" '+attr+'="'+item.id+'" style="margin-left:auto" aria-label="Remover '+esc(item.name)+'">'+icon('trash',16)+'</button>' +
  '</div>' + shopping;
}
function financeItemsTab(kind){
  var isIng = kind === 'ingredient';
  var list = isIng ? state.ingredients : state.packagingItems;
  var adding = isIng ? state.addingIngredient : state.addingPackaging;
  var toggle = isIng ? 'toggleAddIngredient' : 'toggleAddPackaging';
  var create = isIng ? 'createIngredient' : 'createPackaging';
  var p = isIng ? 'ni' : 'np2';
  var title = isIng ? 'ingrediente' : 'embalagem';

  var form = !adding
    ? '<button class="btn-secondary sm" data-action="'+toggle+'" style="margin-bottom:18px">'+icon('plus',15)+' Adicionar '+title+'</button>'
    : '<div class="new-card"><h3>Nova '+title+'</h3>' +
        '<div class="field"><label for="'+p+'-nome">Nome</label><input class="input" id="'+p+'-nome" placeholder="'+(isIng?'Ex: Chocolate meio amargo':'Ex: Caixinha kraft')+'"></div>' +
        '<div class="field"><label for="'+p+'-loja">Onde comprou (opcional)</label><input class="input" id="'+p+'-loja" placeholder="Ex: Atacadão"></div>' +
        '<div class="fin-grid-3">' +
          '<div class="field"><label for="'+p+'-unidade">Unidade</label><select class="input" id="'+p+'-unidade">'+unitOptions(isIng?'g':'un')+'</select></div>' +
          '<div class="field"><label for="'+p+'-preco">Preço do pote/pacote (R$)</label><input class="input" id="'+p+'-preco" type="number" inputmode="decimal" step="0.01" value="0"></div>' +
          '<div class="field"><label for="'+p+'-qtd">Quantidade no pote</label><input class="input" id="'+p+'-qtd" type="number" inputmode="decimal" step="1" value="1"></div>' +
        '</div>' +
        '<p class="hint" style="margin-bottom:14px">Ex.: barra de 1&nbsp;kg por R$ 42 → unidade <b>g</b>, preço <b>42</b>, quantidade <b>1000</b>.</p>' +
        '<div style="display:flex;gap:10px">' +
          '<button class="btn-primary sm" data-action="'+create+'">Salvar</button>' +
          '<button class="btn-ghost" data-action="'+toggle+'">Cancelar</button>' +
        '</div></div>';

  var shopMap = {};
  var note = '';
  if (isIng){
    var s = computeShoppingList();
    s.ingRows.forEach(function(r){ shopMap[r.item.id] = r; });
    if (s.lines.length){
      note = '<p class="hint" style="margin:-8px 0 16px">'+icon('info',12)+' Quanto comprar e quanto sobra vem do plano de produção definido em <b>Financeiro → Compras</b>.</p>';
    }
  }

  var rows = list.length
    ? list.map(function(it, i){ return itemRow(it, kind, shopMap[it.id], i); }).join('')
    : '<p class="empty-note">Nenhuma '+title+' cadastrada.</p>';
  return form + note + (list.length > 1 ? dragHint() : '') + rows;
}

/* ---------- receitas ---------- */
function usageOptions(kind, selectedId){
  var list = kind === 'ingredient' ? state.ingredients : state.packagingItems;
  return list.map(function(i){ return '<option value="'+i.id+'"'+(i.id===selectedId?' selected':'')+'>'+esc(i.name)+'</option>'; }).join('');
}
function recipeUsageTable(p, rows, kind){
  var isIng = kind === 'ingredient';
  var getter = isIng ? getIngredient : getPackagingItem;
  var setAction = isIng ? 'setRecipeIngredient' : 'setRecipePackaging';
  var qtyAction = isIng ? 'setRecipeIngredientQty' : 'setRecipePackagingQty';
  var removeAction = isIng ? 'removeRecipeIngredient' : 'removeRecipePackaging';
  if (!rows.length) return '<p class="empty-note">Nada adicionado.</p>';
  var zone = (isIng ? 'rIng:' : 'rPack:') + p.id;
  return '<div class="fin-usage-scroll">' +
    '<div class="fin-usage-head"><span></span><span>'+(isIng?'Ingrediente':'Embalagem')+'</span><span>Qtd</span><span>Unid.</span><span>Custo unit.</span><span>Custo</span><span></span></div>' +
    rows.map(function(u, idx){
      var item = getter(isIng ? u.ingredientId : u.packagingId);
      var unitCost = item ? itemUnitCost(item) : 0;
      var cost = unitCost * (Number(u.qty)||0);
      return '<div class="fin-usage-row" data-dragzone="'+zone+'" data-dragindex="'+idx+'">' +
        dragHandle('Reordenar item da receita') +
        '<select class="input xs" data-action="'+setAction+'" data-id="'+p.id+'" data-idx="'+idx+'" aria-label="Item">'+usageOptions(kind, isIng?u.ingredientId:u.packagingId)+'</select>' +
        '<input class="input xs" type="number" inputmode="decimal" step="0.1" value="'+(u.qty||0)+'" data-action="'+qtyAction+'" data-id="'+p.id+'" data-idx="'+idx+'" aria-label="Quantidade">' +
        '<span style="font-size:12.5px;color:var(--ink-3);font-weight:700;align-self:center">'+esc(item?(item.unit||'un'):'—')+'</span>' +
        '<span style="font-size:12.5px;color:var(--ink-3);font-weight:700;align-self:center">'+currency(unitCost)+'</span>' +
        '<span style="font-size:13px;font-weight:800;align-self:center">'+currency(cost)+'</span>' +
        '<button class="btn-danger-ghost" style="width:34px;height:34px" data-action="'+removeAction+'" data-id="'+p.id+'" data-idx="'+idx+'" aria-label="Remover item">'+icon('trash',14)+'</button>' +
      '</div>';
    }).join('') + '</div>';
}
function recipeProductCard(p){
  var r = ensureRecipe(p);
  var c = recipeCosts(p);
  var hasLabor = Number(state.financialGoals.laborHourCost) > 0;
  return '<div class="admin-card">' +
    '<div class="admin-card-head">'+icon('cake',18,'var(--brand)')+'<h3 style="flex:1">'+esc(p.name)+'</h3>' +
      '<span class="pill '+(c.profit>0?'pill-ok':'pill-danger')+'">'+currency(c.profit)+' por unidade</span></div>' +

    '<div class="fin-grid-3" style="margin-bottom:16px">' +
      '<div class="field" style="margin:0"><label for="ry-'+p.id+'">Rendimento da receita (unidades)</label>' +
        '<input class="input sm" id="ry-'+p.id+'" type="number" inputmode="numeric" step="1" min="1" value="'+(r.yieldQty||1)+'" data-action="setRecipeYield" data-id="'+p.id+'"></div>' +
      '<div class="field" style="margin:0"><label for="ru-'+p.id+'">Unidades por embalagem vendida</label>' +
        '<input class="input sm" id="ru-'+p.id+'" type="number" inputmode="numeric" step="1" min="1" value="'+(r.unitsPerPackage||1)+'" data-action="setRecipeUnitsPerPackage" data-id="'+p.id+'"></div>' +
      '<div class="field" style="margin:0"><label for="rb-'+p.id+'">Tempo de produção do lote (min)</label>' +
        '<input class="input sm" id="rb-'+p.id+'" type="number" inputmode="numeric" step="5" min="0" value="'+(r.batchMinutes||0)+'" data-action="setRecipeBatchMinutes" data-id="'+p.id+'"></div>' +
    '</div>' +
    (!hasLabor ? '<p class="hint" style="margin-top:-8px;margin-bottom:14px">'+icon('info',12)+' Defina o <b>custo da sua hora</b> em Metas para o tempo do lote virar custo.</p>' : '') +

    '<p class="field-label" style="margin-top:6px">Ingredientes da receita inteira</p>' +
    recipeUsageTable(p, r.ingredientUsage, 'ingredient') +
    '<button class="btn-ghost" data-action="addRecipeIngredient" data-id="'+p.id+'" '+(state.ingredients.length?'':'disabled')+'>'+icon('plus',13)+' Adicionar ingrediente</button>' +

    '<p class="field-label" style="margin-top:16px">Embalagem por unidade vendida</p>' +
    recipeUsageTable(p, r.packagingUsage, 'packaging') +
    '<button class="btn-ghost" data-action="addRecipePackaging" data-id="'+p.id+'" '+(state.packagingItems.length?'':'disabled')+'>'+icon('plus',13)+' Adicionar embalagem</button>' +

    '<div class="tbl-wrap" style="margin-top:18px"><table class="tbl"><tbody>' +
      '<tr><td class="k">Ingredientes da receita</td><td class="n">'+currency(c.ingredientTotal)+'</td></tr>' +
      '<tr><td class="k">Custo por unidade produzida</td><td class="n">'+currency(c.costPerUnit)+'</td></tr>' +
      '<tr><td class="k">Embalagem por unidade</td><td class="n">'+currency(c.packagingPerUnit)+'</td></tr>' +
      (c.laborPerUnit>0 ? '<tr><td class="k">Mão de obra por unidade</td><td class="n">'+currency(c.laborPerUnit)+'</td></tr>' : '') +
      '<tr class="total-row"><td>Custo da embalagem vendida</td><td class="n">'+currency(c.finalCostPerPackage)+'</td></tr>' +
      '<tr><td class="k">Preço de venda</td><td class="n">'+currency(c.sellPrice)+'</td></tr>' +
      '<tr class="total-row"><td>Lucro por venda</td><td class="n" style="color:'+(c.profit>0?'var(--ok)':'var(--danger)')+'">'+currency(c.profit)+' ('+c.marginPct.toFixed(0)+'%)</td></tr>' +
    '</tbody></table></div>' +
  '</div>';
}
function pageFinanceReceitas(){
  var prods = state.products.filter(function(p){ return !isHidden(p); });
  if (!prods.length) return '<div class="slot-empty">Cadastre um doce primeiro.</div>';
  if (!state.ingredients.length && !state.packagingItems.length){
    return '<div class="banner banner-info">'+icon('info',16)+'<span>Cadastre ingredientes e embalagens primeiro — é o que dá base para o custo.</span></div>' +
      prods.map(recipeProductCard).join('');
  }
  return prods.map(recipeProductCard).join('');
}

/* ---------- metas ---------- */
function pageFinanceMetas(){
  var g = state.financialGoals;
  var results = computeSalesGoals();
  var mixMode = !!g.useMix;
  var isRitmoMode = g.goalMode === 'ritmo';
  var isCustoInicialMode = g.goalMode === 'custoinicial';
  var isMoneyGoalMode = !isRitmoMode && !isCustoInicialMode;

  var prods = state.products.filter(function(p){ return !isHidden(p); });
  var selectedProduct = getProduct(state.metasGoalProductId) || prods[0];
  var selectedRes = selectedProduct ? results.filter(function(r){ return r.product.id === selectedProduct.id; })[0] : null;
  var mix = computeMixScenario();
  var sp = isRitmoMode ? computeSingleProductProjection() : null;

  /* Doce e dias trabalhados valem pros 4 modos (Lucro/Faturamento/Vendas
     Diárias/Custo inicial) — por isso ficam acima do seletor de meta, em
     vez de duplicados dentro de cada modo. */
  var sharedFields = !prods.length ? '<p class="empty-note">Cadastre um doce primeiro.</p>' :
    '<div class="fin-grid-2">' +
      '<div class="field"><label for="mg-produto">Doce</label><select class="input" id="mg-produto" data-action="setMetasGoalProduct">' +
        prods.map(function(p){ return '<option value="'+p.id+'"'+(p.id===selectedProduct.id?' selected':'')+'>'+esc(p.name)+'</option>'; }).join('') +
      '</select></div>' +
      '<div class="field"><label for="g-dias">Dias trabalhados por semana</label><input class="input" id="g-dias" type="number" inputmode="numeric" min="1" max="7" step="1" value="'+(g.daysPerWeek||0)+'" data-action="setGoalDays"></div>' +
    '</div>';

  var modeField = isRitmoMode
    ? (!sp ? '' : '<div class="field"><label for="ms-qtd">Quantos por dia</label><input class="input" id="ms-qtd" type="number" inputmode="decimal" min="0" step="0.5" value="'+sp.qty+'" data-action="setMetasSingleQty"></div>')
    : isCustoInicialMode
    ? '<div class="field"><label for="g-inicial">Custo inicial (R$)</label><input class="input" id="g-inicial" type="number" inputmode="decimal" step="10" value="'+(g.initialCost||0)+'" data-action="setGoalInitialCost"></div>'
    : '<div class="field">' + (g.goalMode === 'faturamento'
        ? '<label for="g-fat">Faturamento desejado no mês (R$)</label><input class="input" id="g-fat" type="number" inputmode="decimal" step="50" value="'+(g.monthlyGoal||0)+'" data-action="setGoalMonthly">'
        : '<label for="g-lucro">Lucro desejado no mês (R$)</label><input class="input" id="g-lucro" type="number" inputmode="decimal" step="50" value="'+(g.profitGoal||0)+'" data-action="setGoalProfit">') +
      '</div>';

  /* Mix (vender vários doces ao mesmo tempo) só existe pra Lucro e
     Faturamento — Vendas Diárias já é sobre um doce só, por definição, e
     Custo inicial também: o gasto que se quer recuperar é de UM doce, o
     que já se está vendendo. */
  var mixBlock = !isMoneyGoalMode ? '' :
    toggleChip('Usar mix (considerar vários doces)', mixMode, 'toggleUseMix') +
    (mixMode && mix
      ? '<div class="fin-grid-3" style="margin-top:10px">' +
          mix.shares.map(function(s){
            return '<div class="field" style="margin:0"><label for="mx-'+s.product.id+'">'+esc(s.product.name)+' (%)</label>' +
              '<input class="input sm" id="mx-'+s.product.id+'" type="number" inputmode="numeric" min="0" max="100" step="5" value="'+(s.share||0)+'" data-action="setMixShare" data-id="'+s.product.id+'"></div>';
          }).join('') +
        '</div>'
      : '');

  var form = '<div class="admin-card">' +
    '<div class="admin-card-head">'+icon('sparkle',18,'var(--brand)')+'<h3 style="flex:1">O que você quer alcançar</h3></div>' +
    sharedFields +
    '<div class="field" style="margin-top:14px"><span class="field-label">Sua meta é…</span><div class="seg">' +
      '<button type="button" class="seg-btn'+(isMoneyGoalMode && g.goalMode!=='faturamento'?' on':'')+'" data-action="setGoalMode" data-mode="lucro">'+icon('coin',15)+' Lucro</button>' +
      '<button type="button" class="seg-btn'+(g.goalMode==='faturamento'?' on':'')+'" data-action="setGoalMode" data-mode="faturamento">'+icon('chart',15)+' Faturamento</button>' +
      '<button type="button" class="seg-btn'+(isRitmoMode?' on':'')+'" data-action="setGoalMode" data-mode="ritmo">'+icon('sun',15)+' Vendas Diárias</button>' +
      '<button type="button" class="seg-btn'+(isCustoInicialMode?' on':'')+'" data-action="setGoalMode" data-mode="custoinicial">'+icon('cart',15)+' Custo inicial</button>' +
    '</div>' +
    '<p class="hint">'+(g.goalMode==='faturamento'
      ? 'Faturamento é tudo que entra. Convertemos para lucro usando a margem média dos seus doces ('+(averageMarginRatio()*100).toFixed(0)+'%).'
      : isRitmoMode
      ? 'Sem meta pra bater — só "se eu vender X de um doce por dia, quanto entra e quanto sobra".'
      : isCustoInicialMode
      ? 'Quanto vender do doce escolhido pra recuperar o que foi gasto pra começar — ingredientes da primeira fornada e equipamentos/utensílios.'
      : 'Lucro é o que sobra depois de pagar ingredientes, embalagem, mão de obra, custo fixo e imposto. É o número que importa.')+'</p></div>' +
    modeField +
    (mixBlock ? '<div style="margin-top:14px">'+mixBlock+'</div>' : '') +
  '</div>';

  /* Custo fixo e MEI valem pra qualquer um dos modos de meta contínua
     (Lucro/Faturamento/Vendas Diárias) — não são parte da "meta"
     escolhida, são do negócio inteiro. Por isso viraram um card à
     parte, em vez de ficarem colados embaixo do seletor. */
  var overheadForm = '<div class="admin-card">' +
    '<div class="admin-card-head">'+icon('wallet',18,'var(--brand)')+'<h3 style="flex:1">Custo fixo do negócio</h3></div>' +
    '<div class="fin-grid-2">' +
      '<div class="field"><label for="g-mei">Taxa MEI mensal (DAS)</label><input class="input" id="g-mei" type="number" inputmode="decimal" step="1" value="'+(g.meiMonthlyFee||0)+'" data-action="setGoalMeiFee"></div>' +
      '<div class="field"><label for="g-fixo">Custo fixo mensal (R$)</label><input class="input" id="g-fixo" type="number" inputmode="decimal" step="10" value="'+(g.fixedMonthlyCost||0)+'" data-action="setGoalFixed"></div>' +
    '</div>' +
    '<p class="hint" style="margin:-6px 0 12px">Gás, energia, transporte até o ponto — o que sai todo mês independente de quanto você vende. Vale pros modos de meta acima, não só pra meta escolhida.</p>' +
    toggleChip('Considerar a taxa MEI no que preciso cobrir', !!g.includeTax, 'toggleGoalTax') +
  '</div>';

  /* Mesma lógica de "Para bater a meta": o total pra recuperar em 1 mês
     é UM SÓ número, só que fatiado em 3 janelas (dia/semana/mês) — não
     são 3 metas diferentes, é a mesma meta mensal vista em ritmos
     diferentes. Usada só pelo modo Custo inicial. */
  function paceBlock(title, totalNeeded, perUnit){
    if (!(totalNeeded > 0) || !(perUnit > 0)) return '';
    var exact = totalNeeded / perUnit;
    var daysPerWeek = Number(g.daysPerWeek) || 0;
    return '<p class="field-label" style="margin-top:18px">'+title+'</p><div class="stat-grid">' +
        statTile('Por dia', daysPerWeek > 0 ? unitsLabel(round1(exact / WEEKS_PER_MONTH / daysPerWeek)) : '—', 'sun') +
        statTile('Por semana', unitsLabel(round1(exact / WEEKS_PER_MONTH)), 'calendar') +
        statTile('Por mês', unitsLabel(Math.ceil(exact - 1e-9)), 'chart', 'brand') +
      '</div>';
  }

  /* Todo o resultado — custo fixo, meta e o cenário do doce/mix — junto
     num card só, em seções separadas por field-label, em vez de
     espalhado em vários cards soltos. */
  var resultsCard = '';
  if (isRitmoMode){
    resultsCard = !sp ? '' : '<div class="admin-card">' +
      '<div class="stat-grid">' +
        statTile('Faturamento/dia', currency(sp.revenueDay), 'coin') +
        statTile('Lucro/dia', currency(sp.profitDay), 'sun', sp.profitDay>0?'pos':'neg') +
        statTile('Faturamento no mês', currency(sp.revenueMonth), 'chart', '', sp.activeDaysMonth.toFixed(1)+' dias trabalhados') +
        statTile('Lucro no mês', currency(sp.profitMonth), 'wallet', sp.profitMonth>0?'pos':'neg') +
      '</div>' +
      '<p class="field-label" style="margin-top:18px">Depois do custo fixo do negócio</p>' +
      '<div class="stat-grid">' +
        statTile('Custo fixo do mês', currency(monthlyOverhead()), 'wallet', '', 'custo fixo'+(g.includeTax?' + MEI':'')) +
        statTile('Lucro líquido no mês', currency(sp.profitMonth - monthlyOverhead()), 'coin', (sp.profitMonth - monthlyOverhead())>0?'pos':'neg') +
      '</div>' +
    '</div>';
  } else if (isCustoInicialMode){
    /* O ritmo pra pagar um gasto depende de que TIPO de gasto é:
       - Ingredientes/embalagens da 1ª compra: esse dinheiro só volta
         quando entra VENDA (faturamento) — usar lucro contaria o custo
         do próprio ingrediente duas vezes (mesma lógica de
         firstPurchaseIngredients()).
       - Custo inicial (equipamento, utensílio): não é consumido a cada
         fornada, então o que sobra pra "pagar" ele é o LUCRO de cada
         venda, não o faturamento bruto. */
    if (!selectedProduct){
      resultsCard = '';
    } else {
      var c3 = selectedRes ? selectedRes.costs : recipeCosts(selectedProduct);
      var fp = firstPurchaseIngredients(selectedProduct);
      var initialCost = Number(g.initialCost) || 0;

      var hasIngredientBuy = fp.rows.length && fp.totalFull > 0;
      var firstBuyBlock = !hasIngredientBuy ? '' :
        '<p class="field-label" style="margin-top:18px">Comprando os ingredientes do zero (potes inteiros)</p>' +
        '<div class="stat-grid">' +
          statTile('Gasto na 1ª compra', currency(fp.totalFull), 'cart', 'neg') +
          statTile('Vender para reaver', fp.sellPrice > 0 ? unitsLabel(Math.ceil(fp.totalFull / fp.sellPrice - 1e-9)) : '—', 'coin', 'brand') +
          statTile('Rende nesta fornada', unitsLabel(fp.packagesFromBatch), 'cake') +
        '</div>' +
        paceBlock('Ritmo pra pagar o gasto da primeira compra em 1 mês (faturamento)', fp.totalFull, fp.sellPrice);

      var initialCostBlock = '';
      if (initialCost > 0){
        initialCostBlock = c3.profit <= 0
          ? '<div class="banner banner-danger" style="margin-top:18px">'+icon('alert',16)+'<span>Lucro por unidade de <b>'+esc(selectedProduct.name)+'</b> é '+currency(c3.profit)+'. Não dá pra calcular quanto vender pra recuperar o custo inicial — ajuste preço ou custo em <b>Receitas</b>.</span></div>'
          : '<p class="field-label" style="margin-top:18px">Custo inicial (equipamentos, utensílios)</p>' +
            '<div class="stat-grid">' +
              statTile('Custo inicial', currency(initialCost), 'cart', 'neg') +
              statTile('Vender para reaver', unitsLabel(Math.ceil(initialCost / c3.profit - 1e-9)), 'coin', 'brand') +
            '</div>' +
            paceBlock('Ritmo pra pagar o custo inicial em 1 mês (lucro)', initialCost, c3.profit);
      }

      /* Total: NÃO é soma nem máximo dos dois ritmos isolados — os dois
         valores acima (faturamento pra ingrediente, lucro pra
         equipamento) partem de bases diferentes e não dá pra somar
         ritmos calculados em bases diferentes.

         O jeito certo é olhar o caixa de verdade: os insumos da 1ª
         fornada já estão pagos, então enquanto ela durar (até
         `packagesFromBatch` unidades) CADA venda entra 100% livre —
         o preço inteiro, não só o lucro — e paga os dois gastos juntos
         (ingrediente + equipamento). Só se a soma dos dois for maior do
         que essa fornada consegue cobrir é que sobra um resto, e esse
         resto passa a depender de comprar insumo de novo — a partir
         daí só o lucro por unidade é dinheiro livre. */
      var totalToStart = fp.totalFull + initialCost;
      var exactTotal = 0, impossible = false;
      if (totalToStart > 0 && fp.sellPrice > 0){
        if (hasIngredientBuy && totalToStart <= fp.packagesFromBatch * fp.sellPrice){
          exactTotal = totalToStart / fp.sellPrice;
        } else if (hasIngredientBuy && c3.profit > 0){
          var remaining = totalToStart - fp.packagesFromBatch * fp.sellPrice;
          exactTotal = fp.packagesFromBatch + remaining / c3.profit;
        } else if (!hasIngredientBuy && c3.profit > 0){
          exactTotal = totalToStart / c3.profit;
        } else {
          impossible = true;
        }
      }
      var unitsTotal = exactTotal > 0 ? Math.ceil(exactTotal - 1e-9) : 0;
      var totalSub = impossible ? 'sem lucro por unidade, não dá pra recuperar vendendo mais'
        : (hasIngredientBuy && exactTotal > 0 && exactTotal <= fp.packagesFromBatch
          ? 'a própria fornada já cobre os dois'
          : 'ingrediente + equipamento juntos');
      var totalBlock = !(totalToStart > 0) ? '' :
        '<p class="field-label" style="margin-top:18px">Total pra começar</p>' +
        '<div class="stat-grid">' +
          statTile('Gasto total', currency(totalToStart), 'cart', 'neg', 'ingredientes + custo inicial') +
          statTile('Vender no total', unitsTotal > 0 ? unitsLabel(unitsTotal) : '—', 'coin', 'brand', totalSub) +
        '</div>' +
        (exactTotal > 0 ? (function(){
          var daysPerWeek = Number(g.daysPerWeek) || 0;
          return '<div class="stat-grid" style="margin-top:10px">' +
              statTile('Por dia', daysPerWeek > 0 ? unitsLabel(round1(exactTotal / WEEKS_PER_MONTH / daysPerWeek)) : '—', 'sun') +
              statTile('Por semana', unitsLabel(round1(exactTotal / WEEKS_PER_MONTH)), 'calendar') +
              statTile('Por mês', unitsLabel(unitsTotal), 'chart', 'brand') +
            '</div>';
        })() : (impossible ? '<div class="banner banner-danger" style="margin-top:14px">'+icon('alert',16)+'<span>Depois de vender toda a 1ª fornada ainda falta recuperar dinheiro, mas o lucro por unidade de <b>'+esc(selectedProduct.name)+'</b> é '+currency(c3.profit)+'. Ajuste preço ou custo em <b>Receitas</b>.</span></div>' : ''));

      resultsCard = (!hasIngredientBuy && !(initialCost > 0))
        ? '<div class="admin-card"><p class="empty-note">Cadastre a receita de <b>'+esc(selectedProduct.name)+'</b> e/ou preencha o custo inicial acima pra ver a conta aqui.</p></div>'
        : '<div class="admin-card">' + firstBuyBlock + initialCostBlock + totalBlock + '</div>';
    }
  } else {
    var overheadStats = '<div class="stat-grid">' +
        statTile('Custo fixo do mês', currency(monthlyOverhead()), 'wallet', '', 'custo fixo'+(g.includeTax?' + MEI':'')+' — os insumos saem de cada venda') +
        statTile('Meta de lucro', currency(monthlyProfitTarget()), 'coin', 'brand') +
        statTile('Lucro total necessário', currency(monthlyOverhead()+monthlyProfitTarget()), 'chart', 'pos', 'é isso que as vendas precisam gerar') +
      '</div>';

    if (mixMode && mix){
      resultsCard = '<div class="admin-card">' + overheadStats +
        (mix.unitsMonth != null
          ? '<p class="field-label" style="margin-top:18px">Vendendo o mix</p>' +
            '<div class="stat-grid">' +
              statTile('Por dia', unitsLabel(mix.unitsDay), 'sun') +
              statTile('Por semana', unitsLabel(mix.unitsWeek), 'calendar') +
              statTile('Por mês', unitsLabel(mix.unitsMonth), 'chart', 'brand', currency(mix.revenueMonth)+' de faturamento') +
              statTile('Lucro médio/un', currency(mix.blendedProfit), 'coin', mix.blendedProfit>0?'pos':'neg') +
            '</div>' +
            '<div class="tbl-wrap" style="margin-top:14px"><table class="tbl"><thead><tr><th>Doce</th><th class="n">Fatia</th><th class="n">Un./dia</th><th class="n">Un./mês</th><th class="n">Lucro un.</th></tr></thead><tbody>' +
            mix.shares.map(function(s){
              var mc = recipeCosts(s.product);
              return '<tr><td class="k">'+esc(s.product.name)+'</td><td class="n">'+s.pct.toFixed(0)+'%</td>' +
                '<td class="n">'+unitsLabel(s.unitsDay)+'</td>' +
                '<td class="n">'+s.unitsMonth+'</td><td class="n">'+currency(mc.profit)+'</td></tr>';
            }).join('') + '</tbody></table></div>'
          : '<div class="banner banner-danger" style="margin-top:14px">'+icon('alert',16)+'<span>Com esse mix o lucro médio por unidade é zero ou negativo. Ajuste preços ou custos.</span></div>') +
      '</div>';
    } else if (!mixMode && selectedRes){
      var c = selectedRes.costs;
      var productBlock;
      if (c.profit <= 0){
        productBlock = '<div class="banner banner-danger" style="margin-top:14px">'+icon('alert',16)+'<span>Lucro por unidade de <b>'+esc(selectedProduct.name)+'</b> é '+currency(c.profit)+'. Nenhuma quantidade fecha a conta — ajuste preço ou custo em <b>Receitas</b>.</span></div>';
      } else {
        productBlock =
          '<p class="field-label" style="margin-top:18px">Para bater a meta</p>' +
          '<div class="stat-grid">' +
            statTile('Por dia', unitsLabel(selectedRes.goal.unitsDay), 'sun', 'brand') +
            statTile('Por semana', unitsLabel(selectedRes.goal.unitsWeek), 'calendar', 'brand') +
            statTile('Por mês', unitsLabel(selectedRes.goal.unitsMonth), 'chart', 'brand', selectedRes.goal.revenueMonth!=null?currency(selectedRes.goal.revenueMonth)+' de faturamento':'') +
          '</div>';
      }
      resultsCard = '<div class="admin-card">' + overheadStats + productBlock + '</div>';
    }
  }

  return overheadForm + form + resultsCard;
}

/* ---------- compras: comprar tudo do zero ---------- */
function pageFinanceCompras(){
  var prods = state.products.filter(function(p){ return !isHidden(p); });
  if (!prods.length) return '<div class="slot-empty">Cadastre um doce primeiro.</div>';

  var planForm = '<div class="admin-card">' +
    '<div class="admin-card-head">'+icon('cart',18,'var(--brand)')+'<h3 style="flex:1">Quanto você quer produzir</h3>' +
      '<button class="btn-ghost" data-action="planFromPending">'+icon('refresh',13)+' Usar produção pendente</button></div>' +
    '<p class="hint" style="margin:-10px 0 16px">Diga quantas embalagens vendidas de cada doce quer fazer. A conta mostra tudo que precisa ser comprado — <b>em potes inteiros</b>, que é como a loja vende.</p>' +
    '<div class="fin-grid-3">' + prods.map(function(p){
      return '<div class="field" style="margin:0"><label for="pl-'+p.id+'">'+esc(p.name)+'</label>' +
        '<input class="input sm" id="pl-'+p.id+'" type="number" inputmode="numeric" min="0" step="1" value="'+planQtyFor(p)+'" data-action="setPlanQty" data-id="'+p.id+'"></div>';
    }).join('') + '</div>' +
  '</div>';

  var s = computeShoppingList();
  if (!s.lines.length){
    return planForm + '<div class="slot-empty">Defina uma quantidade acima para montar a lista de compras.</div>';
  }
  if (!s.ingRows.length && !s.packRows.length){
    return planForm + '<div class="banner banner-warn">'+icon('alert',16)+'<span>Os doces escolhidos ainda não têm receita montada, então não há o que comprar. Monte a receita em <b>Receitas</b>.</span></div>';
  }

  var tiles = '<div class="stat-grid">' +
    statTile('Comprando do zero', currency(s.totalFull), 'cart', 'neg', 'potes/pacotes inteiros') +
    statTile('Só o que será usado', currency(s.totalProRata), 'scale', '', 'custo proporcional') +
    statTile('Fica de sobra', currency(s.leftoverValue), 'package', '', 'volta como estoque para a próxima') +
    statTile('Faturamento previsto', currency(s.revenue), 'coin', 'brand') +
  '</div>';

  function tableFor(title, rows, iconName){
    if (!rows.length) return '';
    var total = rows.reduce(function(a,r){ return a + r.fullCost; }, 0);
    return '<div class="admin-card"><div class="admin-card-head">'+icon(iconName,18,'var(--brand)')+'<h3 style="flex:1">'+title+'</h3>' +
      '<span class="pill pill-lilac">'+currency(total)+'</span></div>' +
      '<div class="tbl-wrap"><table class="tbl">' +
      '<thead><tr><th>Item</th><th class="n">Preciso</th><th class="n">Pote</th><th class="n">Comprar</th><th class="n">Custo cheio</th><th class="n">Usado</th><th class="n">Sobra</th></tr></thead><tbody>' +
      rows.map(function(r){
        return '<tr>' +
          '<td class="k">'+esc(r.item.name)+'</td>' +
          '<td class="n">'+num(r.needed, r.needed % 1 === 0 ? 0 : 1)+' '+esc(r.unit)+'</td>' +
          '<td class="n">'+num(r.packQty,0)+' '+esc(r.unit)+' · '+currency(r.packPrice)+'</td>' +
          '<td class="n" style="font-weight:800;color:var(--brand)">'+r.packs+'×</td>' +
          '<td class="n">'+currency(r.fullCost)+'</td>' +
          '<td class="n">'+currency(r.proRata)+'</td>' +
          '<td class="n">'+num(r.leftover, r.leftover % 1 === 0 ? 0 : 1)+' '+esc(r.unit)+'</td>' +
        '</tr>';
      }).join('') +
      '<tr class="total-row"><td>Total</td><td class="n"></td><td class="n"></td><td class="n"></td><td class="n">'+currency(total)+'</td><td class="n">'+currency(rows.reduce(function(a,r){return a+r.proRata;},0))+'</td><td class="n"></td></tr>' +
      '</tbody></table></div></div>';
  }

  var plan = '<div class="admin-card"><div class="admin-card-head">'+icon('list',18,'var(--brand)')+'<h3 style="flex:1">O que será produzido</h3></div>' +
    '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Doce</th><th class="n">Embalagens</th><th class="n">Unidades</th><th class="n">Receitas</th><th class="n">Faturamento</th></tr></thead><tbody>' +
    s.lines.map(function(l){
      return '<tr><td class="k">'+esc(l.product.name)+'</td><td class="n">'+l.units+'</td><td class="n">'+num(l.treats,0)+'</td>' +
        '<td class="n">'+num(l.batches, l.batches % 1 === 0 ? 0 : 2)+'×</td>' +
        '<td class="n">'+currency(l.units * (Number(l.product.price)||0))+'</td></tr>';
    }).join('') + '</tbody></table></div></div>';

  function usageLeftoverChart(rows, title){
    if (!rows.length) return '';
    var bars = rows.map(function(r){
      var bought = r.packs * r.packQty;
      var total = Math.max(bought, r.needed, 0.01);
      var usedPct = clamp(r.needed/total*100, 0, 100);
      var leftPct = clamp(r.leftover/total*100, 0, 100);
      return '<div style="margin-bottom:16px">' +
        '<div style="display:flex;justify-content:space-between;font-size:13px;font-weight:800;margin-bottom:6px">' +
          '<span>'+esc(r.item.name)+'</span><span style="color:var(--ink-3);font-weight:700">'+num(bought, bought % 1 === 0 ? 0 : 1)+' '+esc(r.unit)+' comprado'+'</span></div>' +
        '<div class="margin-bar"><i class="cost" style="width:'+usedPct+'%"></i><i class="prof" style="width:'+leftPct+'%"></i></div>' +
        '<p class="hint" style="margin-top:5px">Usado '+num(r.needed, r.needed % 1 === 0 ? 0 : 1)+' '+esc(r.unit)+' · sobra '+num(r.leftover, r.leftover % 1 === 0 ? 0 : 1)+' '+esc(r.unit)+' ('+currency(r.leftoverValue)+')</p>' +
      '</div>';
    }).join('') +
    '<div class="legend"><span><i style="background:var(--ink-3)"></i> usado</span><span><i style="background:var(--brand-2)"></i> sobra</span></div>';
    return '<div class="admin-card"><div class="admin-card-head">'+icon('scale',18,'var(--brand)')+'<h3 style="flex:1">'+title+'</h3></div>' + bars + '</div>';
  }

  return planForm + tiles + plan +
    tableFor('Ingredientes para comprar', s.ingRows, 'package') +
    usageLeftoverChart(s.ingRows, 'Quanto de cada ingrediente é usado x sobra') +
    tableFor('Embalagens para comprar', s.packRows, 'truck') +
    usageLeftoverChart(s.packRows, 'Quanto de cada embalagem é usado x sobra');
}

/* ---------- perdas (fornada que deu errado) ---------- */
function lossDraftForm(){
  var d = state.lossDraft;
  var prods = state.products.filter(function(p){ return !isHidden(p) && ensureRecipe(p).ingredientUsage.length > 0; });
  if (!prods.length){
    return '<div class="banner banner-warn">'+icon('alert',16)+'<span>Nenhum doce tem receita montada ainda — sem isso não dá pra calcular o custo da perda. Monte em <b>Receitas</b>.</span></div>';
  }
  var p = getProduct(d.productId) || prods[0];
  if (p.id !== d.productId){ d.productId = p.id; d.lostIngredientIds = allRecipeIngredientIds(p); }
  var b = lossBreakdown(d.productId, d.batches, d.lostIngredientIds, d.includeLabor, d.includePackaging);

  var checklist = '<div class="tbl-wrap"><table class="tbl" style="min-width:0">' +
    '<thead><tr><th></th><th>O que foi perdido</th><th class="n">Quantidade</th><th class="n">Custo</th></tr></thead><tbody>' +
    b.ingredientRows.map(function(row){
      return '<tr>' +
        '<td>'+toggleBox(row.lost, 'toggleLossDraftIngredient', 'data-ingid="'+row.ingredient.id+'"', row.ingredient.name+' foi perdido')+'</td>' +
        '<td class="k">'+esc(row.ingredient.name)+'</td>' +
        '<td class="n">'+num(row.qty, row.qty % 1 === 0 ? 0 : 1)+' '+esc(row.unit)+'</td>' +
        '<td class="n" style="color:'+(row.lost?'var(--danger)':'var(--ink-3)')+';font-weight:800">'+(row.lost?currency(row.cost):'—')+'</td>' +
      '</tr>';
    }).join('') +
    '<tr><td>'+toggleBox(d.includeLabor, 'toggleLossDraftLabor', '', 'Mão de obra perdida')+'</td>' +
      '<td class="k">Mão de obra da fornada</td><td class="n">—</td>' +
      '<td class="n" style="color:'+(d.includeLabor && b.laborCost>0?'var(--danger)':'var(--ink-3)')+';font-weight:800">'+(b.laborAvailable ? (d.includeLabor?currency(b.laborCost):'—') : 'sem custo/hora definido')+'</td></tr>' +
    '<tr><td>'+toggleBox(d.includePackaging, 'toggleLossDraftPackaging', '', 'Embalagem perdida')+'</td>' +
      '<td class="k">Embalagem (só se já foi usada)</td><td class="n">—</td>' +
      '<td class="n" style="color:'+(d.includePackaging?'var(--danger)':'var(--ink-3)')+';font-weight:800">'+(d.includePackaging?currency(b.packagingCost):'—')+'</td></tr>' +
    '<tr class="total-row"><td></td><td>Prejuízo desta perda</td><td class="n"></td><td class="n" style="color:var(--danger)">'+currency(b.total)+'</td></tr>' +
    '</tbody></table></div>';

  return '<div class="new-card"><h3>Nova perda</h3>' +
    '<p class="hint" style="margin-top:-6px">Marque só o que realmente estragou — se a cobertura ainda nem tinha sido feita, desmarque ela e o prejuízo conta só a massa.</p>' +
    '<div class="fin-grid-3">' +
      '<div class="field"><label for="lp-produto">Doce</label><select class="input" id="lp-produto" data-action="setLossDraftProduct">' +
        prods.map(function(x){ return '<option value="'+x.id+'"'+(x.id===d.productId?' selected':'')+'>'+esc(x.name)+'</option>'; }).join('') +
      '</select></div>' +
      '<div class="field"><label for="lp-fornadas">Fornadas perdidas</label><input class="input" id="lp-fornadas" type="number" inputmode="decimal" step="0.5" min="0" value="'+d.batches+'" data-action="setLossDraftBatches"></div>' +
      '<div class="field"><label for="lp-data">Data</label><input class="input" id="lp-data" type="date" value="'+d.date+'" data-action="setLossDraftDate"></div>' +
    '</div>' +
    '<div class="field"><label for="lp-nota">O que aconteceu (opcional)</label><input class="input" id="lp-nota" placeholder="Ex: massa talhou, forno queimou" value="'+esc(d.note)+'" data-action="setLossDraftNote"></div>' +
    checklist +
    '<div style="display:flex;gap:10px;margin-top:16px">' +
      '<button class="btn-primary sm" data-action="createLossEvent">Salvar perda de '+currency(b.total)+'</button>' +
      '<button class="btn-ghost" data-action="resetLossDraft">Limpar</button>' +
    '</div></div>';
}
function pageFinancePerdas(){
  var prods = state.products.filter(function(p){ return !isHidden(p); });
  if (!prods.length) return '<div class="slot-empty">Cadastre um doce primeiro.</div>';

  /* Registrar uma perda nova acontece em Análises → Perdas (é lá que
     dá pra simular o valor antes de decidir se vale registrar) — esta
     aba é só o histórico do que já foi registrado. */
  var form = '<p class="hint" style="margin:-6px 0 18px">'+icon('info',12)+' Para registrar uma nova perda, vá em <b>Análises → Perdas</b> — lá dá pra simular o valor antes de salvar.</p>';

  if (!state.lossEvents.length) return form + '<p class="empty-note">Nenhuma perda registrada.</p>';

  var rows = state.lossEvents.map(function(ev){ return { ev:ev, p:getProduct(ev.productId), cost:lossEventCost(ev) }; });
  var totalAll = rows.reduce(function(s,r){ return s + r.cost; }, 0);
  var from30 = dateToStr(new Date(Date.now() - 29 * 86400000));
  var total30 = rows.filter(function(r){ return r.ev.date >= from30; }).reduce(function(s,r){ return s + r.cost; }, 0);
  var pior = rows.slice().sort(function(a,b){ return b.cost - a.cost; })[0];

  var tiles = '<div class="stat-grid">' +
    statTile('Prejuízo nos últimos 30 dias', currency(total30), 'alert', total30 > 0 ? 'neg' : '') +
    statTile('Prejuízo total registrado', currency(totalAll), 'wallet', totalAll > 0 ? 'neg' : '') +
    statTile('Maior perda única', pior ? currency(pior.cost) : '—', 'trash', '', pior ? esc(pior.p ? pior.p.name : '—') : '') +
  '</div>';

  /* agrupado por doce em vez de por data — é isso que revela "esse
     doce estraga toda hora", padrão que some numa lista cronológica */
  var byProduct = {};
  rows.forEach(function(r){
    var key = r.p ? r.p.id : '—';
    var name = r.p ? r.p.name : '(doce removido)';
    if (!byProduct[key]) byProduct[key] = { name:name, count:0, cost:0 };
    byProduct[key].count += 1;
    byProduct[key].cost += r.cost;
  });
  var grouped = Object.keys(byProduct).map(function(k){ return byProduct[k]; }).sort(function(a,b){ return b.cost - a.cost; });
  var maxGrouped = Math.max.apply(null, grouped.map(function(g){ return g.cost; }).concat([1]));
  var groupedCard = rows.length > 1 ? '<div class="admin-card">' +
    '<div class="admin-card-head">'+icon('chart',18,'var(--brand)')+'<h3 style="flex:1">Prejuízo por doce</h3></div>' +
    '<p class="hint" style="margin:-10px 0 14px">Pra que serve: ver se é sempre o mesmo doce que dá errado, em vez de espalhado igual na lista abaixo.</p>' +
    grouped.map(function(g){ return barRow(g.name, g.count+' perda(s) · '+currency(g.cost), Math.round(g.cost/maxGrouped*100), 'neg'); }).join('') +
  '</div>' : '';

  var table = '<div class="admin-card"><div class="admin-card-head">'+icon('list',18,'var(--brand)')+'<h3 style="flex:1">Perdas registradas</h3>' +
    '<span class="pill pill-danger">'+currency(totalAll)+'</span></div>' +
    '<div class="tbl-wrap"><table class="tbl">' +
    '<thead><tr><th>Data</th><th>Doce</th><th class="n">Fornadas</th><th>Motivo</th><th class="n">Prejuízo</th><th></th></tr></thead><tbody>' +
    rows.map(function(r){
      return '<tr>' +
        '<td class="k">'+esc(dateLabel(strToDate(r.ev.date)))+'</td>' +
        '<td class="k">'+esc(r.p ? r.p.name : '(doce removido)')+'</td>' +
        '<td class="n">'+num(r.ev.batches, r.ev.batches % 1 === 0 ? 0 : 1)+'×</td>' +
        '<td>'+esc(r.ev.note || '—')+'</td>' +
        '<td class="n" style="color:var(--danger);font-weight:800">'+currency(r.cost)+'</td>' +
        '<td class="n"><button class="btn-danger-ghost" style="width:34px;height:34px" data-action="removeLossEvent" data-id="'+r.ev.id+'" aria-label="Remover perda">'+icon('trash',14)+'</button></td>' +
      '</tr>';
    }).join('') + '</tbody></table></div></div>';

  return form + tiles + groupedCard + table;
}

/* ---------- histórico de preços ---------- */
var CHART_COLORS = ['#A96EF0','#E886B4','#6F9066','#4F8FDB','#E0937A','#D4A017','#8A4FDB','#3BAFA0'];
function priceHistoryItems(){
  var arr = [];
  state.ingredients.forEach(function(i){ arr.push({ kind:'ingredient', id:i.id, name:i.name, item:i }); });
  state.packagingItems.forEach(function(i){ arr.push({ kind:'packaging', id:i.id, name:i.name, item:i }); });
  /* cor fixada pela ordem da lista inteira (não da seleção filtrada),
     senão a cor de cada item pula toda vez que alguém desmarca outro
     no seletor — a mesma cor precisa valer no chip, na tabela e no
     gráfico o tempo todo. */
  arr.forEach(function(x, i){ x.color = CHART_COLORS[i % CHART_COLORS.length]; });
  return arr;
}
/* Série diária: um ponto por dia entre o primeiro registro e hoje.
   Preço de um dia sem alteração = último preço conhecido (degrau),
   então um insumo que nunca mudou vira uma reta cobrindo o período
   inteiro em vez de um único ponto solto. */
function eachDayBetween(fromStr, toStr){
  var out = [], d = strToDate(fromStr), end = strToDate(toStr), guard = 0;
  while (d.getTime() <= end.getTime() && guard++ < 3650){
    out.push(dateToStr(d));
    d.setDate(d.getDate() + 1);
  }
  return out;
}
function dailyPriceSeries(items){
  var series = items.map(function(x){
    var h = (x.item.priceHistory || [])
      .filter(function(p){ return p && p.date; })
      .map(function(p){ return { date:p.date, price: historyEntryUnitPrice(x.item, p), store:p.store }; })
      .sort(function(a,b){ return a.date < b.date ? -1 : 1; });
    return { name:x.name, color:x.color, hist:h, current:unitPriceValue(x.item) };
  }).filter(function(s){ return s.hist.length > 0; });
  if (!series.length) return { days:[], series:[] };

  var today = todayStr();
  var minDate = series.reduce(function(m,s){ return (!m || s.hist[0].date < m) ? s.hist[0].date : m; }, null);
  if (minDate > today) minDate = today;
  var days = eachDayBetween(minDate, today);

  series.forEach(function(s){
    var changeDates = {};
    s.hist.forEach(function(p){ changeDates[p.date] = true; });
    var idx = 0, last = null;
    s.points = days.map(function(d){
      while (idx < s.hist.length && s.hist[idx].date <= d){ last = Number(s.hist[idx].price) || 0; idx++; }
      /* antes do primeiro registro do item a linha ainda não começou */
      return last === null ? null : { date:d, price:last, change: !!changeDates[d] };
    });
    s.first = s.hist[0];
    s.lastPrice = last === null ? s.current : last;
  });
  return { days:days, series:series };
}

function priceHistoryMultiChart(items){
  var data = dailyPriceSeries(items);
  var days = data.days, series = data.series;
  if (!series.length) return '<p class="empty-note">Sem histórico ainda. Ele começa quando você altera o preço de um insumo.</p>';

  var prices = [];
  series.forEach(function(s){ s.points.forEach(function(p){ if (p) prices.push(p.price); }); });
  var minP = Math.min.apply(null, prices), maxP = Math.max.apply(null, prices);
  if (minP === maxP){ minP = Math.max(0, minP * 0.9 - 1); maxP = maxP * 1.1 + 1; }

  var n = days.length;
  var W = 760, H = 280, padX = 54, padY = 28;
  function xAt(i){ return padX + (n === 1 ? (W - padX*2)/2 : (i/(n-1))*(W - padX*2)); }
  function yFor(price){ return H - padY - ((price - minP)/(maxP - minP))*(H - padY*2); }

  var grid = '';
  for (var g = 0; g <= 4; g++){
    var yy = padY + (g/4)*(H - padY*2);
    var val = maxP - (g/4)*(maxP - minP);
    grid += '<line x1="'+padX+'" y1="'+yy.toFixed(1)+'" x2="'+(W-padX)+'" y2="'+yy.toFixed(1)+'" stroke="var(--line)" stroke-width="1"/>' +
            '<text x="'+(padX-9)+'" y="'+(yy+4).toFixed(1)+'" text-anchor="end" font-size="10.5" fill="var(--ink-3)">'+currency(val).replace('R$','').trim()+'</text>';
  }

  var paths = series.map(function(s){
    var d = '', started = false, dots = '';
    s.points.forEach(function(p, i){
      if (!p) return;
      d += (started ? 'L' : 'M') + xAt(i).toFixed(1) + ' ' + yFor(p.price).toFixed(1) + ' ';
      started = true;
      /* uma bolinha por dia — maior e opaca no dia em que o preço
         realmente mudou, pequena e semi-transparente nos outros, pra
         não sumir o destaque de quando o preço de fato mexeu */
      var r = p.change ? 3.4 : 1.6;
      dots += '<circle cx="'+xAt(i).toFixed(1)+'" cy="'+yFor(p.price).toFixed(1)+'" r="'+r+'" fill="'+s.color+'"'+(p.change?'':' opacity="0.5"')+'><title>'+esc(s.name)+' · '+esc(dateLabel(strToDate(p.date)))+' · '+currency(p.price)+'</title></circle>';
    });
    if (!started) return '';
    return '<path class="chart-line" d="'+d.trim()+'" fill="none" stroke="'+s.color+'" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" pathLength="1"/>' + dots;
  }).join('');

  /* rótulos do eixo X: no máximo 8, senão vira borrão */
  var maxLabels = 8;
  var step = Math.max(1, Math.ceil(n / maxLabels));
  var labels = '';
  for (var i = 0; i < n; i += step){
    var dd = strToDate(days[i]);
    labels += '<text x="'+xAt(i).toFixed(1)+'" y="'+(H-7)+'" text-anchor="middle" font-size="10.5" fill="var(--ink-3)">'+pad2(dd.getDate())+'/'+pad2(dd.getMonth()+1)+'</text>';
  }
  if ((n-1) % step !== 0 && n > 1){
    var le = strToDate(days[n-1]);
    labels += '<text x="'+xAt(n-1).toFixed(1)+'" y="'+(H-7)+'" text-anchor="end" font-size="10.5" fill="var(--ink-3)">'+pad2(le.getDate())+'/'+pad2(le.getMonth()+1)+'</text>';
  }

  var legend = '<div class="legend">' + series.map(function(s){
    var delta = s.lastPrice - Number(s.first.price || 0);
    var arrow = delta > 0.0001 ? ' ↑' : (delta < -0.0001 ? ' ↓' : ' =');
    return '<span><i style="background:'+s.color+'"></i> '+esc(s.name)+' · <b>'+currency(s.lastPrice)+'</b>'+arrow+'</span>';
  }).join('') + '</div>';

  var range = n > 1
    ? dateLabel(strToDate(days[0])) + ' até hoje · ' + n + ' dias'
    : 'apenas hoje';

  return '<div style="overflow-x:auto"><svg viewBox="0 0 '+W+' '+H+'" style="width:100%;min-width:540px;height:auto" role="img" aria-label="Evolução diária dos preços dos insumos">' +
    grid + paths + labels + '</svg></div>' + legend +
    '<p class="hint">'+range+'. Dias sem alteração repetem o último preço — por isso a linha continua reta em vez de sumir.</p>';
}
function itemHistoryRowsHtml(item, color, kind){
  var h = (item.priceHistory || []).slice().sort(function(a,b){ return a.date < b.date ? 1 : -1; });
  if (!h.length) return '<p class="empty-note">Sem alterações registradas.</p>';
  var dot = color ? '<i style="display:inline-block;width:8px;height:8px;border-radius:50%;background:'+color+';margin-right:8px;vertical-align:middle"></i>' : '';
  var disp = itemUnitCostDisplay(item);
  var editing = state.editingHistoryEntry;
  return '<div class="tbl-wrap"><table class="tbl" style="min-width:0"><thead><tr><th>Data</th><th>Loja</th><th class="n">Preço/'+disp.label+'</th><th class="n">Variação</th><th></th></tr></thead><tbody>' +
    h.map(function(p, i){
      var price = historyEntryUnitPrice(item, p);
      var prev = h[i+1];
      var diff = prev ? price - historyEntryUnitPrice(item, prev) : 0;
      var isEditing = editing && editing.kind === kind && editing.id === item.id && editing.date === p.date;
      if (isEditing){
        return '<tr>' +
          '<td class="k">'+dot+esc(dateLabel(strToDate(p.date)))+'</td>' +
          '<td><input class="input xs" id="he-store" value="'+esc(p.store||'')+'" aria-label="Loja"></td>' +
          '<td class="n"><input class="input xs" id="he-price" type="number" inputmode="decimal" step="0.01" value="'+price+'" style="width:90px;text-align:right" aria-label="Preço por '+disp.label+'"></td>' +
          '<td class="n"></td>' +
          '<td class="n" style="white-space:nowrap">' +
            '<button class="btn-primary sm" style="padding:5px 10px;min-height:0" data-action="saveHistoryEntry" data-kind="'+kind+'" data-id="'+item.id+'" data-date="'+p.date+'">Salvar</button> ' +
            '<button class="btn-ghost sm" style="padding:5px 10px;min-height:0" data-action="cancelEditHistoryEntry">Cancelar</button>' +
          '</td></tr>';
      }
      return '<tr><td class="k">'+dot+esc(dateLabel(strToDate(p.date)))+'</td><td>'+esc(p.store||'—')+'</td><td class="n">'+currency(price)+'</td>' +
        '<td class="n" style="color:'+(diff>0?'var(--danger)':(diff<0?'var(--ok)':'var(--ink-3)'))+'">'+(prev?((diff>0?'+':'')+currency(diff)):'—')+'</td>' +
        '<td class="n"><button class="btn-ghost sm" style="padding:5px 8px;min-height:0" data-action="startEditHistoryEntry" data-kind="'+kind+'" data-id="'+item.id+'" data-date="'+p.date+'" aria-label="Editar">'+icon('edit',13)+'</button></td></tr>';
    }).join('') + '</tbody></table></div>';
}
function pageFinanceHistorico(){
  var items = priceHistoryItems();
  if (!items.length) return '<div class="slot-empty">Cadastre ingredientes ou embalagens para acompanhar o preço.</div>';
  var allKeys = items.map(function(x){ return x.kind+':'+x.id; });
  var selected = state.historySelectedKeys ? state.historySelectedKeys : allKeys;
  var chosen = items.filter(function(x){ return selected.indexOf(x.kind+':'+x.id) !== -1; });

  var picker = '<div class="admin-card"><div class="admin-card-head">'+icon('filter',18,'var(--brand)')+'<h3 style="flex:1">Itens no gráfico</h3>' +
    '<button class="btn-ghost" data-action="selectAllHistory">Mostrar todos</button></div>' +
    '<p class="hint" style="margin:-8px 0 14px">Clique para incluir ou tirar um item do gráfico e das tabelas abaixo. A cor de cada bolinha é a mesma em todo lugar — chip, tabela e linha do gráfico.</p>' +
    '<div style="display:flex;flex-wrap:wrap;gap:10px">' + items.map(function(x){
      var k = x.kind+':'+x.id;
      var on = selected.indexOf(k) !== -1;
      return '<button class="history-chip'+(on?' active':'')+'" data-action="toggleHistoryItem" data-key="'+k+'" aria-pressed="'+on+'">' +
        '<i style="background:'+x.color+'"></i>'+esc(x.name)+'</button>';
    }).join('') + '</div></div>';

  var chart = '<div class="admin-card"><div class="admin-card-head">'+icon('chart',18,'var(--brand)')+'<h3 style="flex:1">Evolução dos preços</h3></div>' +
    '<p class="hint" style="margin:-6px 0 14px">Pra que serve: ver se um insumo está subindo de preço a ponto de precisar reajustar a receita ou trocar de fornecedor.</p>' +
    priceHistoryMultiChart(chosen) + '</div>';

  var tables = chosen.map(function(x){
    return '<div class="admin-card"><div class="admin-card-head">'+icon(x.kind==='ingredient'?'package':'truck',17,'var(--brand)')+
      '<h3 style="flex:1">'+esc(x.name)+'</h3><span class="pill pill-lilac">'+currency(x.item.packagePrice||0)+'</span></div>' +
      itemHistoryRowsHtml(x.item, x.color, x.kind) + '</div>';
  }).join('');

  return picker + chart + tables;
}

/* Financeiro tem 9 sub-telas — direto num só nível de abas isso vira
   uma parede de botões sem hierarquia. Agrupadas por "o que você tá
   tentando fazer", ficam 4 grupos fáceis de escanear; o grupo ativo é
   derivado da aba selecionada (`state.financeTab`), sem estado novo
   pra manter em sincronia. */
var FINANCE_GROUPS = [
  { key:'geral', label:'Visão geral', icon:'scale',
    why:'Como o negócio está indo: lucro por doce.',
    tabs:[['resumo','Resumo','scale']] },
  { key:'insumos', label:'Insumos', icon:'package',
    why:'Cadastro de ingredientes e embalagens: preço, onde comprou, e como isso mudou no tempo.',
    tabs:[['ingredientes','Ingredientes','package'], ['embalagens','Embalagens','truck'], ['historico','Histórico de preço','chart']] },
  { key:'receitas', label:'Receitas', icon:'cake',
    why:'Monte a receita de cada doce — é ela que alimenta todo o resto (custo, lucro, compras).',
    tabs:[['receitas','Receitas','cake']] },
  { key:'perdas', label:'Perdas', icon:'alert',
    why:'O que já foi registrado como prejuízo. Para simular e registrar uma perda nova, vá em Análises → Perdas.',
    tabs:[['perdas','Perdas','alert']] }
];
function financeGroupFor(tab){
  return FINANCE_GROUPS.filter(function(g){ return g.tabs.some(function(x){ return x[0] === tab; }); })[0] || FINANCE_GROUPS[0];
}
function pageAdminFinanceiro(){
  var t = state.financeTab;
  var group = financeGroupFor(t);

  var groupNav = '<div class="subtab-row group">' + FINANCE_GROUPS.map(function(g){
    return '<button class="subtab'+(g.key===group.key?' active':'')+'" data-action="financeTab" data-ftab="'+g.tabs[0][0]+'">'+icon(g.icon,13)+' '+g.label+'</button>';
  }).join('') + '</div>';

  var tabNav = group.tabs.length > 1
    ? '<div class="subtab-row sub">' + group.tabs.map(function(x){
        return '<button class="subtab sm'+(t===x[0]?' active':'')+'" data-action="financeTab" data-ftab="'+x[0]+'">'+icon(x[2],12)+' '+x[1]+'</button>';
      }).join('') + '</div>'
    : '';

  var why = '<p class="hint" style="margin:-6px 0 18px">'+icon('info',12)+' '+esc(group.why)+'</p>';

  var body = '';
  if (t === 'resumo') body = pageFinanceResumo();
  else if (t === 'ingredientes') body = financeItemsTab('ingredient');
  else if (t === 'embalagens') body = financeItemsTab('packaging');
  else if (t === 'receitas') body = pageFinanceReceitas();
  else if (t === 'perdas') body = pageFinancePerdas();
  else if (t === 'historico') body = pageFinanceHistorico();
  return groupNav + tabNav + why + body;
}

/* =========================================================
   ADMIN — casca
========================================================= */
function pageAdminPanel(){
  var tab = state.adminTab;
  var tabs = [['produtos','Doces','cake'],['encomendas','Encomendas','clipboard'],['agenda','Agenda','calendar'],
              ['local','Pontos','mapPin'],['analises','Análises','chart'],['financeiro','Financeiro','coin']];
  var tabsHtml = tabs.map(function(x){
    var badge = '';
    if (x[0] === 'encomendas'){
      var open = state.orders.filter(function(o){ return o.status !== 'concluido' && o.status !== 'cancelado'; }).length;
      if (open) badge = ' <span class="pill pill-blush" style="font-size:10.5px;padding:2px 8px">'+open+'</span>';
    }
    return '<button class="tab-btn '+(tab===x[0]?'active':'')+'" data-action="adminTab" data-tab="'+x[0]+'" aria-current="'+(tab===x[0]?'page':'false')+'">'+icon(x[2],15)+' '+x[1]+badge+'</button>';
  }).join('');

  var body = '';
  if (tab === 'produtos') body = pageAdminProdutos();
  else if (tab === 'encomendas') body = pageAdminEncomendas();
  else if (tab === 'agenda') body = pageAdminAgenda();
  else if (tab === 'local') body = pageAdminLocais();
  else if (tab === 'analises') body = pageAdminAnalises();
  else if (tab === 'financeiro') body = pageAdminFinanceiro();

  return '<div class="admin-shell">' +
    '<div class="admin-top">' +
      '<h1>'+icon('settings',24,'var(--brand)')+' Administração</h1>' +
      '<div class="admin-who">' +
        (state.authUser ? '<span>'+esc(state.authUser.email)+'</span>' : '') +
        (FIREBASE_READY ? '<button class="btn-ghost" data-action="logout">'+icon('logout',14)+' Sair</button>' : '') +
      '</div></div>' +
    ReminderBanner() +
    '<div class="tab-row" role="tablist">' + tabsHtml + '</div>' +
    '<div>' + body + '</div>' +
  '</div>';
}
function pageAdmin(){ if (FIREBASE_READY && !state.authUser) return pageAdminLogin(); return pageAdminPanel(); }

/* =========================================================
   RECONCILIAÇÃO DO DOM
   render() remonta a UI inteira como string; morphInto aplica só
   as diferenças. É isso que mantém foco, cursor e valores de
   formulário vivos enquanto o Firestore empurra atualização.
========================================================= */
function morphSyncAttrs(oldEl, newEl){
  var oldAttrs = oldEl.attributes;
  for (var i = oldAttrs.length - 1; i >= 0; i--){
    var name = oldAttrs[i].name;
    if (!newEl.hasAttribute(name)) oldEl.removeAttribute(name);
  }
  var newAttrs = newEl.attributes;
  for (var j = 0; j < newAttrs.length; j++){
    var a = newAttrs[j];
    if (oldEl.getAttribute(a.name) !== a.value) oldEl.setAttribute(a.name, a.value);
  }
}
function morphNode(oldNode, newNode){
  if (oldNode.nodeType !== newNode.nodeType || oldNode.nodeName !== newNode.nodeName){
    oldNode.replaceWith(newNode);
    return newNode;
  }
  if (oldNode.nodeType === Node.TEXT_NODE || oldNode.nodeType === Node.COMMENT_NODE){
    if (oldNode.nodeValue !== newNode.nodeValue) oldNode.nodeValue = newNode.nodeValue;
    return oldNode;
  }
  if (oldNode.nodeType !== Node.ELEMENT_NODE) return oldNode;

  var tag = oldNode.tagName;
  var focused = document.activeElement === oldNode;

  /* <details> guarda o estado de aberto fora do HTML renderizado */
  var wasOpen = (tag === 'DETAILS') ? oldNode.hasAttribute('open') : null;
  morphSyncAttrs(oldNode, newNode);
  if (tag === 'DETAILS' && wasOpen && !oldNode.hasAttribute('open')) oldNode.setAttribute('open','');

  if (tag === 'SELECT'){
    morphChildren(oldNode, newNode);
    if (!focused) oldNode.value = newNode.value;
    return oldNode;
  }
  if (tag === 'INPUT'){
    var type = (oldNode.getAttribute('type') || 'text').toLowerCase();
    if (type === 'file') return oldNode;
    if (!focused){
      if (type === 'checkbox' || type === 'radio') oldNode.checked = newNode.hasAttribute('checked');
      else { var newVal = newNode.hasAttribute('value') ? newNode.getAttribute('value') : ''; if (oldNode.value !== newVal) oldNode.value = newVal; }
    }
    return oldNode;
  }
  if (tag === 'TEXTAREA'){
    if (!focused && oldNode.value !== newNode.textContent) oldNode.value = newNode.textContent;
    return oldNode;
  }
  morphChildren(oldNode, newNode);
  return oldNode;
}
function morphChildren(oldParent, newParent){
  var oldChildren = Array.prototype.slice.call(oldParent.childNodes);
  var newChildren = Array.prototype.slice.call(newParent.childNodes);
  var max = Math.max(oldChildren.length, newChildren.length);
  for (var i = 0; i < max; i++){
    var o = oldChildren[i], n = newChildren[i];
    if (!n){ if (o) oldParent.removeChild(o); continue; }
    if (!o){ oldParent.appendChild(n); continue; }
    morphNode(o, n);
  }
}
function morphInto(container, html){
  var tmp = document.createElement('div');
  tmp.innerHTML = html;
  morphChildren(container, tmp);
}

/* ---------- render principal ---------- */
function render(){
  var content = state.page === 'admin' ? pageAdmin()
    : state.page === 'track' ? pageTrackOrder()
    : sectionHero() + sectionProdutos() + sectionLocalizacao() + sectionQuemFaz() + sectionContato();
  var html = renderHeader() + '<main>' + content + '</main>' + renderFooter() + CartBar() +
    renderModal() + (state.confirmOpen ? renderConfirm() : '') + renderConfirmDialog() + renderPriceChangeModal();
  morphInto(document.getElementById('app'), html);
  observeReveals();
  syncModalState();
}

/* ---------- estado dos modais: foco, Escape e rolagem ---------- */
var lastModalKey = '';
var lastFocusedEl = null;
function activeModalKey(){
  if (state.modalOpen) return 'order';
  if (state.confirmOpen) return 'confirm';
  if (state.confirmDialog) return 'dialog';
  if (state.priceChangeModal) return 'price';
  return '';
}
function syncModalState(){
  var key = activeModalKey();
  /* trava a rolagem do fundo: a janela rola no <html>, então a
     classe precisa ir nos dois para o iOS também parar */
  document.body.classList.toggle('no-scroll', !!key);
  document.documentElement.classList.toggle('no-scroll', !!key);
  var overlay = document.querySelector('.modal-overlay');
  if (key && key !== lastModalKey && overlay){
    var modal = overlay.querySelector('.modal');
    if (modal){
      /* o primeiro campo do formulário vale mais que o primeiro
         focável: sem isso o foco cai nos botões de quantidade do
         resumo do carrinho, acima do formulário */
      var target = modal.querySelector('form input:not([type=hidden]):not([disabled]), form select:not([disabled]), form textarea:not([disabled])')
        || modal.querySelector('input:not([type=hidden]):not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], button:not(.modal-close)');
      try { (target || modal).focus({ preventScroll:true }); } catch(e){ if (target) target.focus(); }
    }
  }
  if (!key && lastModalKey && lastFocusedEl){
    try { lastFocusedEl.focus({ preventScroll:true }); } catch(e){}
    lastFocusedEl = null;
  }
  lastModalKey = key;
}
function rememberFocus(){ lastFocusedEl = document.activeElement; }

/* ---------- navegação ---------- */
/* Rota (hash) além do `state` em memória: sem isso, um F5 na página
   de admin perdia toda a navegação e voltava pra home, porque nada
   do estado (page/adminTab/financeTab) vivia na URL. `replaceState`
   em vez de mudar `location.hash` direto porque trocar de aba não
   deve empilhar uma entrada nova no histórico do navegador a cada
   clique — só a URL atual precisa refletir onde a pessoa está. */
function currentRoute(){
  if (state.page === 'admin'){
    var parts = ['admin', state.adminTab];
    if (state.adminTab === 'financeiro') parts.push(state.financeTab);
    else if (state.adminTab === 'analises') parts.push(state.analysesTab);
    return parts.join('/');
  }
  if (state.page === 'track') return state.trackCode ? 'pedido/'+state.trackCode : 'pedido';
  return '';
}
function syncRoute(){
  var route = currentRoute();
  var hash = route ? '#' + route : '';
  if ((location.hash || '') !== hash){
    history.replaceState(null, '', location.pathname + location.search + hash);
  }
}
function applyRouteFromHash(){
  var h = (location.hash || '').replace(/^#/, '');
  if (!h) return;
  var parts = h.split('/');
  if (parts[0] === 'admin'){
    state.page = 'admin';
    if (parts[1]) state.adminTab = parts[1];
    if (parts[1] === 'financeiro' && parts[2]) state.financeTab = parts[2];
    if (parts[1] === 'analises' && parts[2]) state.analysesTab = parts[2];
    return;
  }
  if (parts[0] === 'pedido'){
    state.page = 'track';
    if (parts[1]) { state.trackCode = parts[1]; lookupOrderTracking(parts[1]); }
  }
}
function go(page){
  state.page = page; state.menuOpen = false; state.authError = '';
  syncRoute();
  render();
  window.scrollTo({ top:0 });
}
function openModal(){
  if (cartCount() === 0){ toast('Adicione um doce ao carrinho primeiro.'); return; }
  rememberFocus();
  state.modalOpen = true;
  state.orderErrors = {};
  var slots = generateAgenda(ORDER_DAYS, SHOP.leadMinutes);
  state.orderMode = slots.length ? 'agenda' : 'combinar';
  state.orderModalLocationId = null;
  state.orderModalDate = null;
  render();
}
function closeModal(){
  state.modalOpen = false;
  state.orderErrors = {};
  state.orderModalLocationId = null;
  state.orderModalDate = null;
  render();
}
function closeAnyModal(){
  if (state.modalOpen) return closeModal();
  if (state.confirmOpen){ state.confirmOpen = false; state.lastOrder = null; return render(); }
  if (state.confirmDialog){ state.confirmDialog = null; return render(); }
  if (state.priceChangeModal){ state.priceChangeModal = null; return render(); }
}

/* ---------- confirmações ---------- */
function askConfirm(title, text, okLabel, danger, action, payload){
  rememberFocus();
  state.confirmDialog = { title:title, text:text, okLabel:okLabel, danger:danger, action:action, payload:payload };
  render();
}
var CONFIRM_ACTIONS = {
  deleteProduct: function(id){
    state.products = state.products.filter(function(x){ return x.id !== id; });
    dbRemove('products/'+id); toast('Doce excluído.', 'ok');
  },
  deleteLocation: function(id){
    state.locations = state.locations.filter(function(x){ return x.id !== id; });
    state.scheduleTemplate.filter(function(r){ return r.locationId === id; }).forEach(function(r){ dbRemove('scheduleTemplate/'+r.id); });
    state.scheduleTemplate = state.scheduleTemplate.filter(function(r){ return r.locationId !== id; });
    state.scheduleExtras.filter(function(x){ return x.locationId === id; }).forEach(function(x){ dbRemove('scheduleExtras/'+x.id); });
    state.scheduleExtras = state.scheduleExtras.filter(function(x){ return x.locationId !== id; });
    dbRemove('locations/'+id); toast('Ponto excluído.', 'ok');
  },
  deleteIngredient: function(id){
    state.ingredients = state.ingredients.filter(function(x){ return x.id !== id; });
    dbRemove('ingredients/'+id); toast('Ingrediente excluído.', 'ok');
  },
  deletePackaging: function(id){
    state.packagingItems = state.packagingItems.filter(function(x){ return x.id !== id; });
    dbRemove('packagingItems/'+id); toast('Embalagem excluída.', 'ok');
  },
  deleteLossEvent: function(id){
    state.lossEvents = state.lossEvents.filter(function(x){ return x.id !== id; });
    dbRemove('lossEvents/'+id); toast('Registro excluído.', 'ok');
  },
  clearCart: function(){
    state.cart = {}; saveCart(); toast('Carrinho esvaziado.', 'ok'); announce('Carrinho esvaziado');
  }
};

/* ---------- debounce ---------- */
function debounce(fn, ms){
  var t = null;
  return function(){
    var args = arguments, self = this;
    clearTimeout(t);
    t = setTimeout(function(){ fn.apply(self, args); }, ms);
  };
}
var debouncedRender = debounce(function(){ render(); }, 260);

/* =========================================================
   EVENTOS — clique
========================================================= */
document.addEventListener('click', function(e){
  var stopEl = e.target.closest('[data-stop]');
  var overlay = e.target.closest('[data-action="closeModalBg"], [data-action="closeConfirmBg"], [data-action="closeConfirmDialogBg"], [data-action="closePriceChangeBg"]');
  if (overlay && !stopEl){ closeAnyModal(); return; }

  var el = e.target.closest('[data-action]');
  if (!el) return;
  var action = el.dataset.action;

  /* ---- navegação e chrome ---- */
  if (action === 'go') { e.preventDefault(); go(el.dataset.page); }
  else if (action === 'goTrack') {
    e.preventDefault();
    state.confirmOpen = false;
    state.page = 'track';
    lookupOrderTracking(el.dataset.code);
    syncRoute(); render(); window.scrollTo({ top:0 });
  }
  else if (action === 'openModal') openModal();
  else if (action === 'closeModal') closeModal();
  else if (action === 'closeConfirm') { state.confirmOpen = false; state.lastOrder = null; render(); }
  else if (action === 'confirmWhats') { setTimeout(function(){ state.confirmOpen = false; state.lastOrder = null; render(); }, 400); }
  else if (action === 'toggleTheme') { state.theme = state.theme === 'dark' ? 'light' : 'dark'; applyTheme(state.theme); render(); }
  else if (action === 'toggleMenu') { state.menuOpen = !state.menuOpen; render(); }
  else if (action === 'closeMenu') { state.menuOpen = false; render(); }
  else if (action === 'adminTab') { state.adminTab = el.dataset.tab; syncRoute(); render(); window.scrollTo({ top:0, behavior:'smooth' }); }
  else if (action === 'financeTab') { state.financeTab = el.dataset.ftab; syncRoute(); render(); }
  else if (action === 'setAnalysesTab') { state.analysesTab = el.dataset.atab; syncRoute(); render(); }
  else if (action === 'logout') { if (fbAuth) fbAuth.signOut(); }
  else if (action === 'pickAgendaDay') { state.agendaDate = el.dataset.date; render(); }

  /* ---- carrinho ---- */
  else if (action === 'cartInc') {
    var p = getProduct(el.dataset.id);
    if (p && isOrderable(p)) {
      var maxStock = (p.stock === undefined || p.stock === null) ? Infinity : Number(p.stock);
      var cur = state.cart[p.id] || 0;
      if (cur < maxStock){
        state.cart[p.id] = cur + 1;
        saveCart();
        announce(p.name + ' adicionado. ' + cartCount() + ' itens no carrinho.');
      } else {
        toast('Só temos ' + maxStock + ' nesta fornada.');
      }
    }
    render();
  }
  else if (action === 'cartDec') {
    var did = el.dataset.id;
    state.cart[did] = Math.max(0, (state.cart[did] || 0) - 1);
    if (state.cart[did] === 0) delete state.cart[did];
    saveCart();
    announce(cartCount() + ' itens no carrinho.');
    render();
  }
  else if (action === 'clearCart') {
    askConfirm('Esvaziar o carrinho?', 'Você vai perder os doces já escolhidos.', 'Esvaziar', true, 'clearCart', null);
  }
  else if (action === 'orderMode') { state.orderMode = el.dataset.mode; state.orderModalDate = null; state.orderErrors = {}; render(); }
  else if (action === 'setPayment') { state.orderPayment = el.dataset.pay; render(); }
  else if (action === 'copyPix') {
    var key = el.dataset.key || '';
    if (navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(key).then(function(){ toast('Chave Pix copiada!', 'ok'); })
        .catch(function(){ toast('Não consegui copiar. Chave: ' + key); });
    } else { toast('Chave Pix: ' + key); }
  }

  /* ---- doces (admin) ---- */
  else if (action === 'toggleAddProduct') { state.addingProduct = !state.addingProduct; render(); }
  else if (action === 'createProduct') {
    var nome = (document.getElementById('np-nome').value || '').trim();
    if (!nome) { toast('Informe o nome do doce.', 'err'); return; }
    var newProd = {
      id: 'p' + Date.now(), name: nome,
      desc: (document.getElementById('np-desc').value||'').trim(),
      ingredients: (document.getElementById('np-ing').value||'').trim(),
      price: Number(document.getElementById('np-preco').value) || 0,
      stock: Number(document.getElementById('np-estoque').value) || 0,
      available: true, hidden: false, photo: null
    };
    state.products.push(newProd);
    dbSet('products/' + newProd.id, newProd);
    state.addingProduct = false;
    render();
    toast('Doce criado.', 'ok');
    var file = document.getElementById('np-imagem') && document.getElementById('np-imagem').files[0];
    if (file){
      processImage(file, function(url){
        if (url){ newProd.photo = url; dbSet('products/' + newProd.id + '/photo', url); render(); }
      });
    }
  }
  else if (action === 'toggleAvailable') {
    var pa = getProduct(el.dataset.id);
    if (pa) { pa.available = pa.available === false; dbSet('products/'+pa.id+'/available', pa.available); }
    render();
  }
  else if (action === 'toggleHidden') {
    var ph = getProduct(el.dataset.id);
    if (ph) {
      ph.hidden = !isHidden(ph);
      dbSet('products/'+ph.id+'/hidden', ph.hidden);
      if (ph.hidden && state.cart[ph.id]) { delete state.cart[ph.id]; saveCart(); }
      toast(ph.hidden ? 'Doce escondido do site.' : 'Doce visível no site.', 'ok');
    }
    render();
  }
  else if (action === 'removeProduct') {
    var rp = getProduct(el.dataset.id);
    askConfirm('Excluir "'+(rp?rp.name:'este doce')+'"?',
      'O cadastro, a receita e o histórico somem junto. Se é só para tirar do site, use "Esconder do site".',
      'Excluir', true, 'deleteProduct', el.dataset.id);
  }

  /* ---- pontos ---- */
  else if (action === 'toggleAddLocation') { state.addingLocation = !state.addingLocation; render(); }
  else if (action === 'createLocation') {
    var lnome = (document.getElementById('nl-nome').value||'').trim();
    if (!lnome) { toast('Informe o nome do ponto.', 'err'); return; }
    var newLoc = { id:'loc'+Date.now(), name:lnome, address:(document.getElementById('nl-endereco').value||'').trim(), mapImage:null, pin:null, ordersOnly:false, hidden:false };
    state.locations.push(newLoc);
    dbSet('locations/'+newLoc.id, newLoc);
    state.addingLocation = false; render(); toast('Ponto criado.', 'ok');
  }
  else if (action === 'toggleLocationHidden') {
    var lh = getLocation(el.dataset.locid);
    if (lh) {
      lh.hidden = !isLocHidden(lh);
      dbSet('locations/'+lh.id+'/hidden', lh.hidden);
      toast(lh.hidden ? 'Ponto escondido do site.' : 'Ponto visível no site.', 'ok');
    }
    render();
  }
  else if (action === 'toggleOrdersOnly') {
    var lo = getLocation(el.dataset.locid);
    if (lo) { lo.ordersOnly = !lo.ordersOnly; dbSet('locations/'+lo.id+'/ordersOnly', lo.ordersOnly); }
    render();
  }
  else if (action === 'removeLocation') {
    var rl = getLocation(el.dataset.locid);
    askConfirm('Excluir "'+(rl?rl.name:'este ponto')+'"?',
      'As regras de agenda e horários avulsos desse ponto também serão removidos.',
      'Excluir', true, 'deleteLocation', el.dataset.locid);
  }
  else if (action === 'mapClick') {
    var loc = getLocation(el.dataset.locid);
    var rect = el.getBoundingClientRect();
    var xPct = ((e.clientX - rect.left) / rect.width) * 100;
    var yPct = ((e.clientY - rect.top) / rect.height) * 100;
    if (loc) { loc.pin = { x: Math.round(xPct*10)/10, y: Math.round(yPct*10)/10, label:(loc.pin && loc.pin.label) || '' }; dbSet('locations/'+loc.id+'/pin', loc.pin); }
    render();
  }
  else if (action === 'removePin') { var lr = getLocation(el.dataset.locid); if (lr) { lr.pin = null; dbSet('locations/'+lr.id+'/pin', null); } render(); }

  /* ---- encomendas ---- */
  else if (action === 'toggleProduced') {
    var op = state.orders.find(function(x){ return x.id === el.dataset.id; });
    if (op) { op.produced = !op.produced; dbSet('orders/'+op.id+'/produced', op.produced); pushOrderTracking(op); }
    render();
  }
  else if (action === 'togglePaid') {
    var opd = state.orders.find(function(x){ return x.id === el.dataset.id; });
    if (opd) { opd.paid = !opd.paid; dbSet('orders/'+opd.id+'/paid', opd.paid); }
    render();
  }
  else if (action === 'clearOrderFilter') { state.orderFilter = { q:'', status:'todos', when:'todos', paid:'todos' }; render(); }
  else if (action === 'exportOrdersCsv') {
    var rows = [['Código','Data','Horário','Nome','Telefone','Local','Itens','Total','Status','Pago','Forma de pagamento','Produzido']];
    filteredOrders().forEach(function(o){
      rows.push([
        o.code||'', orderDate(o)||'', o.horario||'', o.nome||'', o.telefone||'', o.local||'',
        (o.items||[]).map(function(i){ return i.qty+'x '+i.name; }).join(', '),
        csvNum(o.total), statusLabel(o.status||'pendente'), o.paid?'Sim':'Não',
        o.payment?paymentLabel(o.payment):'', o.produced?'Sim':'Não'
      ]);
    });
    downloadCsv('pedidos-lealchocoart-'+todayStr()+'.csv', rows);
  }

  /* ---- agenda ---- */
  else if (action === 'toggleAddScheduleRule') { state.addingScheduleRule = !state.addingScheduleRule; render(); }
  else if (action === 'createScheduleRule') {
    var srLoc = document.getElementById('sr-local').value;
    var srWd = Array.prototype.slice.call(document.querySelectorAll('.sr-wd:checked')).map(function(cb){ return Number(cb.value); });
    var srStart = document.getElementById('sr-inicio').value;
    var srEnd = document.getElementById('sr-fim').value;
    if (!srLoc || srWd.length === 0 || !srStart || !srEnd){ toast('Escolha ponto, ao menos um dia e o horário.', 'err'); return; }
    var maxOrder = state.scheduleTemplate.reduce(function(m,r){ return Math.max(m, r.order||0); }, -1);
    var newRule = { id:'sch'+Date.now(), locationId:srLoc, weekdays:srWd.sort(), startTime:srStart, endTime:srEnd, order:maxOrder+1, enabled:true };
    state.scheduleTemplate.push(newRule);
    dbSet('scheduleTemplate/'+newRule.id, newRule);
    state.addingScheduleRule = false; render(); toast('Regra criada.', 'ok');
  }
  else if (action === 'toggleRuleEnabled') {
    var tr = getScheduleRule(el.dataset.ruleid);
    if (tr){
      tr.enabled = !ruleEnabled(tr);
      dbSet('scheduleTemplate/'+tr.id+'/enabled', tr.enabled);
      toast(tr.enabled ? 'Regra reativada.' : 'Regra pausada — sumiu da agenda do site.', 'ok');
    }
    render();
  }
  else if (action === 'removeScheduleRule') {
    var srid = el.dataset.ruleid;
    state.scheduleTemplate = state.scheduleTemplate.filter(function(r){ return r.id !== srid; });
    dbRemove('scheduleTemplate/'+srid); render();
  }
  else if (action === 'moveRuleUp' || action === 'moveRuleDown') {
    var sorted = sortedScheduleTemplate();
    var pos = sorted.findIndex(function(r){ return r.id === el.dataset.ruleid; });
    var swapPos = action === 'moveRuleUp' ? pos - 1 : pos + 1;
    if (pos === -1 || swapPos < 0 || swapPos >= sorted.length) return;
    var tmp = sorted[pos]; sorted[pos] = sorted[swapPos]; sorted[swapPos] = tmp;
    sorted.forEach(function(r, idx){ r.order = idx; dbSet('scheduleTemplate/'+r.id+'/order', idx); });
    render();
  }
  else if (action === 'toggleRuleWeekday') {
    var rule = getScheduleRule(el.dataset.ruleid);
    var wd = Number(el.dataset.wd);
    if (rule){
      if (!rule.weekdays) rule.weekdays = [];
      var wi = rule.weekdays.indexOf(wd);
      if (wi === -1) rule.weekdays.push(wd); else rule.weekdays.splice(wi,1);
      rule.weekdays.sort();
      dbSet('scheduleTemplate/'+rule.id+'/weekdays', rule.weekdays);
    }
    render();
  }
  else if (action === 'toggleException') {
    var tid = el.dataset.templateid, exDate = el.dataset.date;
    var existing = state.scheduleExceptions.find(function(x){ return x.templateId===tid && x.date===exDate; });
    if (existing){
      state.scheduleExceptions = state.scheduleExceptions.filter(function(x){ return x !== existing; });
      dbRemove('scheduleExceptions/'+existing.id);
    } else {
      var exId = tid+'_'+exDate;
      state.scheduleExceptions.push({ id:exId, templateId:tid, date:exDate });
      dbSet('scheduleExceptions/'+exId, { id:exId, templateId:tid, date:exDate });
    }
    render();
  }
  else if (action === 'toggleAddExtraSlot') { state.addingExtraSlot = !state.addingExtraSlot; render(); }
  else if (action === 'createExtraSlot') {
    var exLoc = document.getElementById('ex-local').value;
    var exData = document.getElementById('ex-data').value;
    var exStart = document.getElementById('ex-inicio').value;
    var exEnd = document.getElementById('ex-fim').value;
    if (!exLoc || !exData || !exStart || !exEnd){ toast('Preencha ponto, data e horário.', 'err'); return; }
    var newExtra = { id:'extra'+Date.now(), locationId:exLoc, date:exData, startTime:exStart, endTime:exEnd };
    state.scheduleExtras.push(newExtra);
    dbSet('scheduleExtras/'+newExtra.id, newExtra);
    state.addingExtraSlot = false; render(); toast('Horário avulso criado.', 'ok');
  }
  else if (action === 'removeExtraSlot') {
    var exid = el.dataset.extraid;
    state.scheduleExtras = state.scheduleExtras.filter(function(x){ return x.id !== exid; });
    dbRemove('scheduleExtras/'+exid); render();
  }
  else if (action === 'dismissReminder') {
    state.adminReminders = state.adminReminders.filter(function(o){ return o.id !== el.dataset.id; });
    render();
  }
  else if (action === 'enableNotifications') {
    if (typeof Notification === 'undefined') return;
    Notification.requestPermission().then(function(perm){
      state.notifPermission = perm;
      if (perm === 'granted') setupPushMessaging();
      render();
    });
  }

  /* ---- insumos ---- */
  else if (action === 'toggleAddIngredient') { state.addingIngredient = !state.addingIngredient; render(); }
  else if (action === 'createIngredient') {
    var iname = (document.getElementById('ni-nome').value||'').trim();
    if (!iname) { toast('Informe o nome do ingrediente.', 'err'); return; }
    var iprice = Number(document.getElementById('ni-preco').value) || 0;
    var istore = (document.getElementById('ni-loja').value||'').trim();
    var iqty = Number(document.getElementById('ni-qtd').value) || 1;
    var newIng = { id:'ing'+Date.now(), name:iname, unit:document.getElementById('ni-unidade').value, store:istore,
      order: state.ingredients.length,
      packagePrice:iprice, packageQty:iqty,
      priceHistory:[{ date:todayStr(), price:unitPriceValue({unit:document.getElementById('ni-unidade').value, packageQty:iqty}, iprice), store:istore, perUnit:true }] };
    state.ingredients.push(newIng);
    dbSet('ingredients/'+newIng.id, newIng);
    state.addingIngredient = false; render(); toast('Ingrediente criado.', 'ok');
  }
  else if (action === 'removeIngredient') {
    var ri = getIngredient(el.dataset.ingid);
    askConfirm('Excluir "'+(ri?ri.name:'este ingrediente')+'"?', 'O histórico de preços dele também será apagado.', 'Excluir', true, 'deleteIngredient', el.dataset.ingid);
  }
  else if (action === 'toggleAddPackaging') { state.addingPackaging = !state.addingPackaging; render(); }
  else if (action === 'createPackaging') {
    var pkname = (document.getElementById('np2-nome').value||'').trim();
    if (!pkname) { toast('Informe o nome da embalagem.', 'err'); return; }
    var pkprice = Number(document.getElementById('np2-preco').value) || 0;
    var pkstore = (document.getElementById('np2-loja').value||'').trim();
    var pkqty = Number(document.getElementById('np2-qtd').value) || 1;
    var newPack = { id:'pack'+Date.now(), name:pkname, unit:document.getElementById('np2-unidade').value, store:pkstore,
      order: state.packagingItems.length,
      packagePrice:pkprice, packageQty:pkqty,
      priceHistory:[{ date:todayStr(), price:unitPriceValue({unit:document.getElementById('np2-unidade').value, packageQty:pkqty}, pkprice), store:pkstore, perUnit:true }] };
    state.packagingItems.push(newPack);
    dbSet('packagingItems/'+newPack.id, newPack);
    state.addingPackaging = false; render(); toast('Embalagem criada.', 'ok');
  }
  else if (action === 'removePackaging') {
    var rk = getPackagingItem(el.dataset.packid);
    askConfirm('Excluir "'+(rk?rk.name:'esta embalagem')+'"?', 'O histórico de preços dela também será apagado.', 'Excluir', true, 'deletePackaging', el.dataset.packid);
  }

  /* ---- perdas ---- */
  else if (action === 'resetLossDraft') {
    var lossProds = state.products.filter(function(p){ return !isHidden(p) && ensureRecipe(p).ingredientUsage.length > 0; });
    state.lossDraft = makeLossDraft(lossProds.length ? lossProds[0].id : '');
    render();
  }
  else if (action === 'createLossEvent') {
    var d = state.lossDraft;
    var batches = Number(d.batches) || 0;
    if (!d.productId || batches <= 0) { toast('Escolha o doce e a quantidade de fornadas.', 'err'); return; }
    var newLoss = {
      id: 'loss'+Date.now(), productId: d.productId, batches: batches,
      date: d.date || todayStr(), note: (d.note||'').trim(),
      includeLabor: d.includeLabor, includePackaging: d.includePackaging,
      lostIngredientIds: d.lostIngredientIds.slice()
    };
    state.lossEvents.unshift(newLoss);
    dbSet('lossEvents/'+newLoss.id, newLoss);
    state.lossDraft = null; render(); toast('Perda registrada — já aparece em Financeiro → Perdas.', 'ok');
  }
  else if (action === 'removeLossEvent') {
    askConfirm('Excluir este registro de perda?', 'Não afeta o estoque nem os pedidos — só o histórico de prejuízo.', 'Excluir', true, 'deleteLossEvent', el.dataset.id);
  }

  /* ---- receitas ---- */
  else if (action === 'addRecipeIngredient') {
    var rip = getProduct(el.dataset.id);
    if (rip) { var rr = ensureRecipe(rip); rr.ingredientUsage.push({ ingredientId: state.ingredients.length ? state.ingredients[0].id : '', qty:0 }); dbSet('products/'+rip.id+'/recipe', rr); }
    render();
  }
  else if (action === 'removeRecipeIngredient') {
    var rrp = getProduct(el.dataset.id);
    if (rrp) { var rri = ensureRecipe(rrp); rri.ingredientUsage.splice(Number(el.dataset.idx), 1); dbSet('products/'+rrp.id+'/recipe', rri); }
    render();
  }
  else if (action === 'addRecipePackaging') {
    var rpp = getProduct(el.dataset.id);
    if (rpp) { var rp2 = ensureRecipe(rpp); rp2.packagingUsage.push({ packagingId: state.packagingItems.length ? state.packagingItems[0].id : '', qty:0 }); dbSet('products/'+rpp.id+'/recipe', rp2); }
    render();
  }
  else if (action === 'removeRecipePackaging') {
    var rpr = getProduct(el.dataset.id);
    if (rpr) { var rp3 = ensureRecipe(rpr); rp3.packagingUsage.splice(Number(el.dataset.idx), 1); dbSet('products/'+rpr.id+'/recipe', rp3); }
    render();
  }

  /* ---- metas / análises / compras ---- */
  else if (action === 'setAnalyticsPeriod') { state.analyticsPeriod = el.dataset.period; render(); }
  else if (action === 'setGoalMode') { state.financialGoals.goalMode = el.dataset.mode; dbSet('settings/financeGoals', state.financialGoals); render(); }
  else if (action === 'toggleUseMix') { state.financialGoals.useMix = !state.financialGoals.useMix; dbSet('settings/financeGoals', state.financialGoals); render(); }
  else if (action === 'toggleOnlyDone') { state.analyticsOnlyDone = !state.analyticsOnlyDone; render(); }
  else if (action === 'toggleGoalTax') { state.financialGoals.includeTax = !state.financialGoals.includeTax; saveGoals(); render(); }
  else if (action === 'toggleLossDraftIngredient') {
    var liIdx = state.lossDraft.lostIngredientIds.indexOf(el.dataset.ingid);
    if (liIdx === -1) state.lossDraft.lostIngredientIds.push(el.dataset.ingid);
    else state.lossDraft.lostIngredientIds.splice(liIdx, 1);
    render();
  }
  else if (action === 'toggleLossDraftLabor') { state.lossDraft.includeLabor = !state.lossDraft.includeLabor; render(); }
  else if (action === 'toggleLossDraftPackaging') { state.lossDraft.includePackaging = !state.lossDraft.includePackaging; render(); }
  else if (action === 'resetRate') { state.consumptionRate = {}; render(); toast('Voltou para as vendas reais dos últimos 30 dias.', 'ok'); }
  else if (action === 'planFromPending') {
    var map = {};
    state.orders.filter(function(o){ return o.status !== 'cancelado' && !o.produced; }).forEach(function(o){
      (o.items||[]).forEach(function(i){ if (i.productId) map[i.productId] = (map[i.productId]||0) + Number(i.qty||0); });
    });
    state.planQty = map;
    render();
    toast(Object.keys(map).length ? 'Planejamento carregado da produção pendente.' : 'Nada pendente de produção.', 'ok');
  }

  /* ---- diálogos ---- */
  else if (action === 'cancelConfirmDialog') { state.confirmDialog = null; render(); }
  else if (action === 'runConfirmDialog') {
    var c = state.confirmDialog;
    state.confirmDialog = null;
    if (c && CONFIRM_ACTIONS[c.action]) CONFIRM_ACTIONS[c.action](c.payload);
    render();
  }
  else if (action === 'cancelPriceChange') { state.priceChangeModal = null; render(); }
  else if (action === 'confirmPriceChange') {
    var pcm = state.priceChangeModal;
    if (pcm) {
      var pcItem = pcm.kind === 'ingredient' ? getIngredient(pcm.id) : getPackagingItem(pcm.id);
      if (pcItem) {
        pcItem.packagePrice = pcm.newPrice;
        if (!pcItem.priceHistory) pcItem.priceHistory = [];
        var pcUnitPrice = unitPriceValue(pcItem, pcm.newPrice);
        var pcLast = pcItem.priceHistory[pcItem.priceHistory.length - 1];
        if (pcLast && pcLast.date === todayStr()) { pcLast.price = pcUnitPrice; pcLast.store = pcItem.store || ''; pcLast.perUnit = true; }
        else pcItem.priceHistory.push({ date: todayStr(), price: pcUnitPrice, store: pcItem.store || '', perUnit:true });
        dbSet((pcm.kind === 'ingredient' ? 'ingredients' : 'packagingItems') + '/' + pcItem.id, pcItem);
        toast('Preço atualizado.', 'ok');
      }
      state.priceChangeModal = null;
    }
    render();
  }
  else if (action === 'selectAllHistory') { state.historySelectedKeys = null; render(); }
  else if (action === 'toggleHistoryItem') {
    var hKey = el.dataset.key;
    var hAll = priceHistoryItems().map(function(x){ return x.kind+':'+x.id; });
    var hCur = state.historySelectedKeys ? state.historySelectedKeys.slice() : hAll.slice();
    var hIdx = hCur.indexOf(hKey);
    if (hIdx === -1) hCur.push(hKey); else hCur.splice(hIdx, 1);
    state.historySelectedKeys = hCur;
    render();
  }
  else if (action === 'startEditHistoryEntry') {
    state.editingHistoryEntry = { kind:el.dataset.kind, id:el.dataset.id, date:el.dataset.date };
    render();
  }
  else if (action === 'cancelEditHistoryEntry') { state.editingHistoryEntry = null; render(); }
  else if (action === 'saveHistoryEntry') {
    var heKind = el.dataset.kind, heId = el.dataset.id, heDate = el.dataset.date;
    var heItem = heKind === 'ingredient' ? getIngredient(heId) : getPackagingItem(heId);
    if (heItem){
      var heEntry = (heItem.priceHistory||[]).find(function(x){ return x.date === heDate; });
      if (heEntry){
        heEntry.price = Number(document.getElementById('he-price').value) || 0;
        heEntry.store = (document.getElementById('he-store').value||'').trim();
        heEntry.perUnit = true;
        /* se for o registro mais recente, o preço "oficial" do pote
           também precisa refletir a correção — senão o histórico e o
           preço do pote mostram dois números diferentes pro mesmo dia */
        var heSorted = heItem.priceHistory.slice().sort(function(a,b){ return a.date < b.date ? 1 : -1; });
        if (heSorted[0] === heEntry){
          var heQty = Number(heItem.packageQty) || 0;
          var heDivisor = (heItem.unit === 'g' || heItem.unit === 'ml') ? heQty / 1000 : heQty;
          heItem.packagePrice = heDivisor > 0 ? heEntry.price * heDivisor : heItem.packagePrice;
        }
        dbSet((heKind === 'ingredient' ? 'ingredients' : 'packagingItems') + '/' + heItem.id, heItem);
        toast('Histórico atualizado.', 'ok');
      }
    }
    state.editingHistoryEntry = null;
    render();
  }
});

/* =========================================================
   EVENTOS — arrastar para reordenar
========================================================= */
var dragCtx = null;
function dragRowFrom(target){
  return (target && target.closest) ? target.closest('[data-dragzone]') : null;
}
function clearDragMarks(){
  var marked = document.querySelectorAll('.drag-over, .drag-source');
  for (var i = 0; i < marked.length; i++){ marked[i].classList.remove('drag-over', 'drag-source'); }
}
document.addEventListener('dragstart', function(e){
  var handle = e.target.closest ? e.target.closest('[data-draghandle]') : null;
  if (!handle) return;
  var row = dragRowFrom(handle);
  if (!row) return;
  dragCtx = { zone: row.dataset.dragzone, from: Number(row.dataset.dragindex) };
  row.classList.add('drag-source');
  try {
    e.dataTransfer.effectAllowed = 'move';
    /* Firefox só inicia o arrasto se houver algum dado no dataTransfer */
    e.dataTransfer.setData('text/plain', row.dataset.dragindex);
    e.dataTransfer.setDragImage(row, 24, 20);
  } catch(err){}
});
document.addEventListener('dragover', function(e){
  if (!dragCtx) return;
  var row = dragRowFrom(e.target);
  /* só aceita soltar dentro da MESMA lista — arrastar um ingrediente
     para dentro das embalagens não faria sentido nenhum */
  if (!row || row.dataset.dragzone !== dragCtx.zone) return;
  e.preventDefault();
  try { e.dataTransfer.dropEffect = 'move'; } catch(err){}
  if (!row.classList.contains('drag-over')){
    clearDragMarks();
    row.classList.add('drag-over');
  }
});
document.addEventListener('drop', function(e){
  if (!dragCtx) return;
  var row = dragRowFrom(e.target);
  var ctx = dragCtx;
  dragCtx = null;
  clearDragMarks();
  if (!row || row.dataset.dragzone !== ctx.zone) return;
  e.preventDefault();
  applyDragReorder(ctx.zone, ctx.from, Number(row.dataset.dragindex));
  render();
});
document.addEventListener('dragend', function(){ dragCtx = null; clearDragMarks(); });

/* Celular/tablet não dispara dragstart/dragover/drop pra elementos
   `draggable` comuns — a API HTML5 de arrastar-e-soltar é praticamente
   só de mouse. Sem isso, a alcinha simplesmente não fazia nada num
   toque. `{ passive:false }` porque precisa de preventDefault pra
   impedir a página de rolar enquanto o dedo arrasta a linha. */
document.addEventListener('touchstart', function(e){
  var handle = e.target.closest ? e.target.closest('[data-draghandle]') : null;
  if (!handle) return;
  var row = dragRowFrom(handle);
  if (!row) return;
  dragCtx = { zone: row.dataset.dragzone, from: Number(row.dataset.dragindex) };
  row.classList.add('drag-source');
}, { passive:true });
document.addEventListener('touchmove', function(e){
  if (!dragCtx) return;
  e.preventDefault();
  var touch = e.touches[0];
  var target = document.elementFromPoint(touch.clientX, touch.clientY);
  var row = dragRowFrom(target);
  if (!row || row.dataset.dragzone !== dragCtx.zone) return;
  if (!row.classList.contains('drag-over')){
    clearDragMarks();
    row.classList.add('drag-over');
  }
}, { passive:false });
document.addEventListener('touchend', function(e){
  if (!dragCtx) return;
  var touch = e.changedTouches[0];
  var target = document.elementFromPoint(touch.clientX, touch.clientY);
  var row = dragRowFrom(target);
  var ctx = dragCtx;
  dragCtx = null;
  clearDragMarks();
  if (!row || row.dataset.dragzone !== ctx.zone) return;
  applyDragReorder(ctx.zone, ctx.from, Number(row.dataset.dragindex));
  render();
});
document.addEventListener('touchcancel', function(){ dragCtx = null; clearDragMarks(); });

/* =========================================================
   EVENTOS — teclado
========================================================= */
document.addEventListener('keydown', function(e){
  if (e.key === 'Escape'){
    if (activeModalKey()){ e.preventDefault(); closeAnyModal(); return; }
    if (state.menuOpen){ state.menuOpen = false; render(); }
    return;
  }
  if (e.key !== 'Tab' || !activeModalKey()) return;
  /* prende o Tab dentro do modal */
  var modal = document.querySelector('.modal-overlay .modal');
  if (!modal) return;
  var focusables = Array.prototype.slice.call(modal.querySelectorAll(
    'a[href], button:not([disabled]), input:not([disabled]):not([type=hidden]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
  )).filter(function(n){ return n.offsetParent !== null || n === document.activeElement; });
  if (!focusables.length) return;
  var first = focusables[0], last = focusables[focusables.length-1];
  if (e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
});

/* =========================================================
   EVENTOS — digitação ao vivo
========================================================= */
document.addEventListener('input', function(e){
  var el = e.target.closest('[data-action]');
  if (!el) return;
  var action = el.dataset.action;

  if (action === 'maskPhone'){
    /* máscara sem re-render: preserva o cursor no fim */
    var masked = phoneMask(el.value);
    if (masked !== el.value){ el.value = masked; }
    if (state.orderErrors.telefone && isValidPhone(masked)){
      delete state.orderErrors.telefone;
      el.setAttribute('aria-invalid','false');
      var errEl = el.parentNode.querySelector('.field-error');
      if (errEl) errEl.remove();
    }
    return;
  }
  if (action === 'orderSearch'){ state.orderFilter.q = el.value; debouncedRender(); return; }
  if (action === 'setPlanQty'){ state.planQty[el.dataset.id] = el.value; debouncedRender(); return; }
  if (action === 'setConsumptionRate'){ state.consumptionRate[el.dataset.id] = el.value; debouncedRender(); return; }
  if (action === 'setRestockPacks'){ state.restockPacks[el.dataset.key] = el.value; debouncedRender(); return; }
  if (action === 'setMixShare'){
    state.financialGoals.mix = state.financialGoals.mix || {};
    state.financialGoals.mix[el.dataset.id] = Number(el.value) || 0;
    debouncedRender();
    return;
  }
  if (action === 'setLossDraftBatches'){ state.lossDraft.batches = el.value; debouncedRender(); return; }
  if (action === 'setMetasSingleQty'){ state.metasSingleQty = el.value; debouncedRender(); return; }
});

/* =========================================================
   EVENTOS — change
========================================================= */
var saveGoals = debounce(function(){ dbSet('settings/financeGoals', state.financialGoals); }, 500);

document.addEventListener('change', function(e){
  var el = e.target.closest('[data-action]');
  if (!el) return;
  var action = el.dataset.action;

  /* pedido */
  if (action === 'selectOrderLocation') { state.orderModalLocationId = el.value; state.orderModalDate = null; delete state.orderErrors.local; render(); }
  else if (action === 'selectOrderDate') { state.orderModalDate = el.value; delete state.orderErrors.dia; render(); }
  else if (action === 'selectDesiredDate') { state.orderModalDate = el.value; delete state.orderErrors.dia; render(); }

  /* filtros */
  else if (action === 'orderSearch') { state.orderFilter.q = el.value; render(); }
  else if (action === 'orderFilterWhen') { state.orderFilter.when = el.value; render(); }
  else if (action === 'orderFilterStatus') { state.orderFilter.status = el.value; render(); }
  else if (action === 'orderFilterPaid') { state.orderFilter.paid = el.value; render(); }
  else if (action === 'exportAnalyticsCsv') {
    var an = computeAnalytics();
    var rows = [
      ['Resumo do período', ''],
      ['Faturamento', csvNum(an.totalRevenue)],
      ['Custo de produção', csvNum(an.totalCost)],
      ['Lucro das vendas', csvNum(an.totalProfit)],
      ['Perdas no período', csvNum(an.totalLoss)],
      ['Resultado líquido', csvNum(an.netResult)],
      ['Pedidos', an.totalOrders],
      ['Ticket médio', csvNum(an.avgTicket)],
      [], ['Doce','Unidades','Faturamento','Custo','Lucro']
    ];
    an.allProducts.forEach(function(p){
      rows.push([p.name, p.qty, csvNum(p.revenue), csvNum(p.cost), csvNum(p.profit)]);
    });
    downloadCsv('analises-lealchocoart-'+todayStr()+'.csv', rows);
  }

  /* doces */
  else if (action === 'setPrice') { var p = getProduct(el.dataset.id); if (p) { p.price = Number(el.value) || 0; dbSet('products/'+p.id+'/price', p.price); render(); } }
  else if (action === 'setStock') { var ps = getProduct(el.dataset.id); if (ps) { ps.stock = Number(el.value) || 0; dbSet('products/'+ps.id+'/stock', ps.stock); render(); } }
  else if (action === 'setName') { var pn = getProduct(el.dataset.id); if (pn) { pn.name = el.value; dbSet('products/'+pn.id+'/name', pn.name); render(); } }
  else if (action === 'setDesc') { var pd = getProduct(el.dataset.id); if (pd) { pd.desc = el.value; dbSet('products/'+pd.id+'/desc', pd.desc); } }
  else if (action === 'setIngredients') { var pi = getProduct(el.dataset.id); if (pi) { pi.ingredients = el.value; dbSet('products/'+pi.id+'/ingredients', pi.ingredients); } }

  /* encomendas */
  else if (action === 'setOrderStatus') {
    var o = state.orders.find(function(x){ return x.id === el.dataset.id; });
    if (o) {
      var wasCancelled = o.status === 'cancelado';
      var willCancel = el.value === 'cancelado';
      o.status = el.value;
      dbSet('orders/'+o.id+'/status', o.status);
      if (willCancel && !wasCancelled) restoreStockForOrder(o);
      else if (wasCancelled && !willCancel) reapplyStockForOrder(o);
      pushOrderTracking(o);
    }
    render();
  }

  /* pontos */
  else if (action === 'setLocName') { var ln = getLocation(el.dataset.locid); if (ln) { ln.name = el.value; dbSet('locations/'+ln.id+'/name', ln.name); } render(); }
  else if (action === 'setLocAddress') { var la = getLocation(el.dataset.locid); if (la) { la.address = el.value; dbSet('locations/'+la.id+'/address', la.address); } }
  else if (action === 'setPinLabel') { var lp = getLocation(el.dataset.locid); if (lp && lp.pin) { lp.pin.label = el.value; dbSet('locations/'+lp.id+'/pin', lp.pin); } }

  /* agenda */
  else if (action === 'setRuleLocation') { var rL = getScheduleRule(el.dataset.ruleid); if (rL) { rL.locationId = el.value; dbSet('scheduleTemplate/'+rL.id+'/locationId', rL.locationId); } render(); }
  else if (action === 'setRuleStart') { var rS = getScheduleRule(el.dataset.ruleid); if (rS) { rS.startTime = el.value; dbSet('scheduleTemplate/'+rS.id+'/startTime', rS.startTime); } render(); }
  else if (action === 'setRuleEnd') { var rE = getScheduleRule(el.dataset.ruleid); if (rE) { rE.endTime = el.value; dbSet('scheduleTemplate/'+rE.id+'/endTime', rE.endTime); } render(); }

  /* imagens */
  else if (action === 'uploadMap') {
    var locid = el.dataset.locid, file = el.files && el.files[0];
    if (!file) return;
    toast('Preparando a imagem…');
    processImage(file, function(url){
      if (!url) return;
      var loc = getLocation(locid);
      if (loc) { loc.mapImage = url; dbSet('locations/'+loc.id+'/mapImage', url).then(function(){ toast('Mapa atualizado.', 'ok'); }); }
      render();
    });
  }
  else if (action === 'uploadProductPhoto') {
    var pid = el.dataset.id, pf = el.files && el.files[0];
    if (!pf) return;
    toast('Preparando a foto…');
    processImage(pf, function(url){
      if (!url) return;
      var pp = getProduct(pid);
      if (pp) { pp.photo = url; dbSet('products/'+pp.id+'/photo', url).then(function(){ toast('Foto atualizada.', 'ok'); }); }
      render();
    });
  }

  /* insumos */
  else if (action === 'setIngredientName') { var si = getIngredient(el.dataset.ingid); if (si) { si.name = el.value; dbSet('ingredients/'+si.id+'/name', si.name); render(); } }
  else if (action === 'setIngredientUnit') { var su = getIngredient(el.dataset.ingid); if (su) { su.unit = el.value; dbSet('ingredients/'+su.id+'/unit', su.unit); } render(); }
  else if (action === 'setIngredientQty') { var sq = getIngredient(el.dataset.ingid); if (sq) { sq.packageQty = Number(el.value) || 0; dbSet('ingredients/'+sq.id+'/packageQty', sq.packageQty); } render(); }
  else if (action === 'setIngredientStore') { var ss = getIngredient(el.dataset.ingid); if (ss) { ss.store = el.value; dbSet('ingredients/'+ss.id+'/store', ss.store); } render(); }
  else if (action === 'setIngredientPrice') {
    var sp = getIngredient(el.dataset.ingid);
    if (sp) {
      var spNew = Number(el.value) || 0;
      if (Math.abs(spNew - Number(sp.packagePrice || 0)) > 0.0001){
        rememberFocus();
        state.priceChangeModal = { kind:'ingredient', id:sp.id, oldPrice:Number(sp.packagePrice||0), newPrice:spNew };
      }
    }
    render();
  }
  else if (action === 'setPackagingName') { var kn = getPackagingItem(el.dataset.packid); if (kn) { kn.name = el.value; dbSet('packagingItems/'+kn.id+'/name', kn.name); render(); } }
  else if (action === 'setPackagingUnit') { var ku = getPackagingItem(el.dataset.packid); if (ku) { ku.unit = el.value; dbSet('packagingItems/'+ku.id+'/unit', ku.unit); } render(); }
  else if (action === 'setPackagingQty') { var kq = getPackagingItem(el.dataset.packid); if (kq) { kq.packageQty = Number(el.value) || 0; dbSet('packagingItems/'+kq.id+'/packageQty', kq.packageQty); } render(); }
  else if (action === 'setPackagingStore') { var ks = getPackagingItem(el.dataset.packid); if (ks) { ks.store = el.value; dbSet('packagingItems/'+ks.id+'/store', ks.store); } render(); }
  else if (action === 'setPackagingPrice') {
    var kp = getPackagingItem(el.dataset.packid);
    if (kp) {
      var kpNew = Number(el.value) || 0;
      if (Math.abs(kpNew - Number(kp.packagePrice || 0)) > 0.0001){
        rememberFocus();
        state.priceChangeModal = { kind:'packaging', id:kp.id, oldPrice:Number(kp.packagePrice||0), newPrice:kpNew };
      }
    }
    render();
  }

  /* receitas */
  else if (action === 'setRecipeYield') { var ry = getProduct(el.dataset.id); if (ry) { var r1 = ensureRecipe(ry); r1.yieldQty = Number(el.value) || 1; dbSet('products/'+ry.id+'/recipe', r1); } render(); }
  else if (action === 'setRecipeUnitsPerPackage') { var ru = getProduct(el.dataset.id); if (ru) { var r2 = ensureRecipe(ru); r2.unitsPerPackage = Number(el.value) || 1; dbSet('products/'+ru.id+'/recipe', r2); } render(); }
  else if (action === 'setRecipeBatchMinutes') { var rb = getProduct(el.dataset.id); if (rb) { var r3 = ensureRecipe(rb); r3.batchMinutes = Number(el.value) || 0; dbSet('products/'+rb.id+'/recipe', r3); } render(); }
  else if (action === 'setRecipeIngredient') { var ri2 = getProduct(el.dataset.id); if (ri2) { var r4 = ensureRecipe(ri2); r4.ingredientUsage[Number(el.dataset.idx)].ingredientId = el.value; dbSet('products/'+ri2.id+'/recipe', r4); } render(); }
  else if (action === 'setRecipeIngredientQty') { var ri3 = getProduct(el.dataset.id); if (ri3) { var r5 = ensureRecipe(ri3); r5.ingredientUsage[Number(el.dataset.idx)].qty = Number(el.value) || 0; dbSet('products/'+ri3.id+'/recipe', r5); } render(); }
  else if (action === 'setRecipePackaging') { var rk2 = getProduct(el.dataset.id); if (rk2) { var r6 = ensureRecipe(rk2); r6.packagingUsage[Number(el.dataset.idx)].packagingId = el.value; dbSet('products/'+rk2.id+'/recipe', r6); } render(); }
  else if (action === 'setRecipePackagingQty') { var rk3 = getProduct(el.dataset.id); if (rk3) { var r7 = ensureRecipe(rk3); r7.packagingUsage[Number(el.dataset.idx)].qty = Number(el.value) || 0; dbSet('products/'+rk3.id+'/recipe', r7); } render(); }

  /* metas */
  else if (action === 'setGoalMonthly') { state.financialGoals.monthlyGoal = Number(el.value) || 0; saveGoals(); render(); }
  else if (action === 'setGoalProfit') { state.financialGoals.profitGoal = Number(el.value) || 0; saveGoals(); render(); }
  else if (action === 'setGoalDays') { state.financialGoals.daysPerWeek = clamp(Number(el.value) || 0, 0, 7); saveGoals(); render(); }
  else if (action === 'setGoalMeiFee') { state.financialGoals.meiMonthlyFee = Number(el.value) || 0; saveGoals(); render(); }
  else if (action === 'setGoalFixed') { state.financialGoals.fixedMonthlyCost = Number(el.value) || 0; saveGoals(); render(); }
  else if (action === 'setGoalInitialCost') { state.financialGoals.initialCost = Number(el.value) || 0; saveGoals(); render(); }
  else if (action === 'setMixShare') { state.financialGoals.mix = state.financialGoals.mix || {}; state.financialGoals.mix[el.dataset.id] = Number(el.value) || 0; saveGoals(); render(); }
  else if (action === 'setPlanQty') { state.planQty[el.dataset.id] = Number(el.value) || 0; render(); }
  else if (action === 'setConsumptionRate') { state.consumptionRate[el.dataset.id] = Math.max(0, Number(el.value) || 0); render(); }
  else if (action === 'setRestockPacks') { state.restockPacks[el.dataset.key] = Math.max(1, Math.floor(Number(el.value) || 1)); render(); }
  else if (action === 'setMetasGoalProduct') { state.metasGoalProductId = el.value; render(); }

  /* perdas */
  else if (action === 'setLossDraftProduct') {
    var newP = getProduct(el.value);
    state.lossDraft.productId = el.value;
    state.lossDraft.lostIngredientIds = allRecipeIngredientIds(newP);
    render();
  }
  else if (action === 'setLossDraftDate') { state.lossDraft.date = el.value; render(); }
  else if (action === 'setLossDraftNote') { state.lossDraft.note = el.value; }
});

/* =========================================================
   EVENTOS — envio de formulário
========================================================= */
document.addEventListener('submit', function(e){
  var trackForm = e.target.closest('[data-action="trackForm"]');
  if (trackForm){
    e.preventDefault();
    var codeEl = document.getElementById('track-code');
    lookupOrderTracking(codeEl ? codeEl.value : '');
    syncRoute();
    return;
  }
  var loginForm = e.target.closest('[data-action="loginForm"]');
  if (loginForm){
    e.preventDefault();
    var email = (document.getElementById('login-email').value||'').trim();
    var senha = document.getElementById('login-senha').value;
    if (!fbAuth){ state.authError = 'Firebase não está configurado.'; render(); return; }
    fbAuth.signInWithEmailAndPassword(email, senha)
      .then(function(){ state.authError = ''; render(); })
      .catch(function(){ state.authError = 'E-mail ou senha incorretos.'; render(); });
    return;
  }

  var form = e.target.closest('[data-action="submitOrderForm"]');
  if (!form) return;
  e.preventDefault();

  var errors = {};
  var items = cartItems();
  if (items.length === 0) errors.geral = 'Seu carrinho está vazio.';

  var nome = (document.getElementById('f-nome').value || '').trim();
  var telefoneRaw = (document.getElementById('f-telefone').value || '').trim();
  var observacoes = (document.getElementById('f-observacoes').value || '').trim();

  if (nome.length < 2) errors.nome = 'Diga como devo te chamar.';
  if (!telefoneRaw) errors.telefone = 'Precisamos do WhatsApp para confirmar.';
  else if (!isValidPhone(telefoneRaw)) errors.telefone = 'Esse número não parece completo. Use DDD + número.';

  var mode = state.orderMode;
  var slot = null, desiredDate = '';
  var localName = '';

  if (mode === 'agenda'){
    var locEl = document.getElementById('f-local');
    var diaEl = document.getElementById('f-dia');
    var slotEl = document.getElementById('f-slot');
    if (!locEl || !locEl.value) errors.local = 'Escolha o ponto de retirada.';
    else if (!diaEl || diaEl.disabled || !diaEl.value) errors.dia = 'Escolha o dia.';
    else if (!slotEl || slotEl.disabled || !slotEl.value) errors.slot = 'Escolha o horário.';
    else {
      slot = findAgendaSlot(slotEl.value);
      if (!slot) errors.slot = 'Esse horário não está mais disponível. Escolha outro.';
      else localName = slot.locationName;
    }
  } else {
    var locEl2 = document.getElementById('f-local');
    var dateEl = document.getElementById('f-datadesejada');
    if (!locEl2 || !locEl2.value) errors.local = 'Escolha onde prefere retirar.';
    else { var lc = getLocation(locEl2.value); localName = lc ? lc.name : ''; }
    desiredDate = dateEl ? dateEl.value : '';
    if (!desiredDate) errors.dia = 'Escolha a data que você prefere.';
    else {
      var minD = dateToStr(new Date(Date.now() + SHOP.leadMinutes*60000));
      if (desiredDate < minD) errors.dia = 'Precisamos de pelo menos '+Math.round(SHOP.leadMinutes/60)+'h para produzir.';
    }
  }

  state.orderErrors = errors;
  if (Object.keys(errors).length){
    render();
    var firstBad = document.querySelector('.modal [aria-invalid="true"], .modal .field-error');
    if (firstBad) { var f = firstBad.closest('.field'); if (f) f.scrollIntoView({ behavior:'smooth', block:'center' }); }
    return;
  }

  var telefone = phoneMask(telefoneRaw);
  var order = {
    id: String(Date.now()),
    code: makeOrderCode(),
    nome: nome,
    telefone: telefone,
    mode: mode,
    local: localName,
    payment: state.orderPayment,
    observacoes: observacoes,
    /* unitCost é o custo (ingredientes+embalagem+mão de obra) CONGELADO
       no instante da venda — sem isso, reajustar o preço de um insumo
       reescreveria o lucro de pedidos já fechados, meses depois. */
    items: items.map(function(i){ return { productId: i.product.id, name: i.product.name, qty: i.qty, price: i.product.price, unitCost: recipeCosts(i.product).finalCostPerPackage }; }),
    total: cartTotal(),
    status: 'pendente',
    produced: false,
    paid: false,
    stockApplied: false,
    createdAt: new Date().toISOString()
  };
  if (mode === 'agenda'){
    order.data = slot.date;
    order.horario = slot.startTime + '–' + slot.endTime;
    order.pickupDate = slot.date;
    order.pickupStart = slot.startTime;
    order.pickupEnd = slot.endTime;
    order.slotId = slot.id;
  } else {
    order.desiredDate = desiredDate;
    order.data = desiredDate;
    order.horario = 'a combinar';
  }

  var btn = form.querySelector('button[type="submit"]');
  if (btn){ btn.disabled = true; btn.innerHTML = 'Enviando…'; }

  dbPushOrder(order).then(function(){
    pushOrderTracking(order);
    /* baixa otimista só na tela — a gravação real acontece na
       próxima sessão de admin (reconcileStock) */
    items.forEach(function(i){
      var p = getProduct(i.product.id);
      if (p && p.stock !== undefined && p.stock !== null) p.stock = Math.max(0, Number(p.stock) - i.qty);
    });
    state.orders.unshift(order);
    state.cart = {}; saveCart();
    state.modalOpen = false;
    state.orderErrors = {};
    state.lastOrder = order;
    state.confirmOpen = true;
    render();
    announce('Encomenda registrada com o código ' + order.code);
  }).catch(function(err){
    console.error('Falha ao registrar o pedido', err);
    state.orderErrors = { geral: 'Não consegui registrar agora. Verifique sua conexão e tente de novo — ou chame a Julia no WhatsApp.' };
    render();
  });
});

/* =========================================================
   INICIALIZAÇÃO
========================================================= */
function syncScrollState(){
  var scrolled = (window.pageYOffset || document.documentElement.scrollTop) > 8;
  document.body.classList.toggle('is-scrolled', scrolled);
}
window.addEventListener('scroll', syncScrollState, { passive:true });

/* Relógio: a agenda filtra horários que já passaram, mas isso só
   acontece dentro de render(). Sem este tique, uma aba deixada
   aberta continua mostrando "Vendendo agora" horas depois. */
var lastMinute = -1;
function minuteTick(){
  var m = new Date().getMinutes();
  if (m !== lastMinute){
    lastMinute = m;
    if (state.page !== 'admin') render();
  }
  checkPickupReminders();
}

if ('serviceWorker' in navigator){
  navigator.serviceWorker.register('sw.js').catch(function(e){ console.warn('Service worker não registrado:', e); });
}
initTheme();
loadCart();
applyRouteFromHash();
syncScrollState();
upgradeBrandAssets();
initFirebaseSync();
seedFirebaseIfEmpty();
render();
initReveal();
syncJsonLd();
setInterval(minuteTick, 20000);
checkPickupReminders();
