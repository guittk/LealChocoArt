/* =========================================================
   FIREBASE
========================================================= */
var firebaseConfig = {
  apiKey: "AIzaSyARuEqZgWESVVSKtv5fq4rLjN_AM5IZFIc",
  authDomain: "lealchocoart-dc1a4.firebaseapp.com",
  databaseURL: "https://lealchocoart-dc1a4-default-rtdb.firebaseio.com",
  projectId: "lealchocoart-dc1a4",
  storageBucket: "lealchocoart-dc1a4.firebasestorage.app",
  messagingSenderId: "1002811538630",
  appId: "1:1002811538630:web:c7be4f0114f5a181076bc7"
};

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
  fbDb = firebase.database();
  fbStorage = firebase.storage();
  FIREBASE_READY = true;
} catch (err) { console.warn('Firebase não inicializado:', err); }

/* ---------- icons ---------- */
function icon(name, size, color){
  size = size || 18; color = color || 'currentColor';
  var paths = {
    menu:'<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>',
    close:'<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
    chevronRight:'<polyline points="9 18 15 12 9 6"/>',
    arrowRight:'<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>',
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
    bag:'<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>',
    heart:'<path d="M12 21s-7-4.35-9.5-8.5C.5 8.5 3 4 7 4c2 0 3.5 1 5 3 1.5-2 3-3 5-3 4 0 6.5 4.5 4.5 8.5C19 16.65 12 21 12 21z"/>',
    sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon:'<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
    lock:'<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    logout:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
    edit:'<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>',
    camera:'<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>',
    calendar:'<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
    chart:'<line x1="4" y1="20" x2="4" y2="12"/><line x1="10" y1="20" x2="10" y2="7"/><line x1="16" y1="20" x2="16" y2="4"/><line x1="2" y1="21" x2="22" y2="21"/>',
    bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
    x:'<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>'
  };
  return '<svg class="icon" width="'+size+'" height="'+size+'" viewBox="0 0 24 24" style="color:'+color+'">'+(paths[name]||'')+'</svg>';
}

/* ---------- fallback assets (used until Storage URLs resolve, or if Storage is unavailable) ---------- */
var FALLBACK = {
  logoCircle: "assets/images/logo-circle.png",
  logoPrincipal: "assets/images/logo-principal.png",
  paoDeMel: "assets/images/pao-de-mel.jpg",
  bombomDeUva: "assets/images/bombom-de-uva.jpg",
  mapaFaculdade: "assets/images/mapa-faculdade.jpg"
};
var LOGO_CIRCLE = FALLBACK.logoCircle;
var LOGO_PRINCIPAL = FALLBACK.logoPrincipal;

/* ---------- default / seed data ---------- */
var DEFAULT_PRODUCTS = [
  { id:'p1', name:'Bombom de Uva', desc:'Uva fresca envolta em chocolate belga meio amargo.', ingredients:'Chocolate belga 54%, uva in natura, manteiga de cacau.', price:6, stock:20, available:true, photo:FALLBACK.bombomDeUva },
  { id:'p2', name:'Pão de Mel', desc:'Massa macia de mel e especiarias, recheada com doce de leite.', ingredients:'Mel, canela, cravo, doce de leite artesanal, chocolate ao leite.', price:7.5, stock:15, available:true, photo:FALLBACK.paoDeMel }
];
var DEFAULT_LOCATIONS = [
  { id:'faculdade', name:'Faculdade', address:'', mapImage:FALLBACK.mapaFaculdade, pin:{ x:63, y:44, label:'Sala A24' }, ordersOnly:false },
  { id:'condominio', name:'Condomínio', address:'', mapImage:null, pin:null, ordersOnly:false },
  { id:'igreja', name:'Igreja', address:'', mapImage:null, pin:null, ordersOnly:true }
];

/* ---------- schedule (agenda) ---------- */
var AGENDA_DAYS = 7;
var WEEKDAY_LABELS = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
var WEEKDAY_SHORT = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
var DEFAULT_SCHEDULE_TEMPLATE = [
  { id:'sch1', locationId:'faculdade', weekdays:[1,2,3,4,5], startTime:'09:20', endTime:'09:40', order:0 },
  { id:'sch2', locationId:'faculdade', weekdays:[1,2,3,4,5], startTime:'11:40', endTime:'12:00', order:1 },
  { id:'sch3', locationId:'condominio', weekdays:[0,1,2,3,4,5,6], startTime:'13:00', endTime:'22:00', order:2 }
];

/* ---------- app state ---------- */
var state = {
  page: 'site',
  menuOpen: false,
  modalOpen: false,
  confirmOpen: false,
  adminTab: 'produtos',
  addingProduct: false,
  addingLocation: false,
  addingScheduleRule: false,
  addingExtraSlot: false,
  confirmDeleteLocationId: null,
  orderModalLocationId: null,
  orderModalDate: null,
  authUser: null,
  authError: '',
  products: DEFAULT_PRODUCTS.slice(),
  cart: {},
  orders: [],
  locations: DEFAULT_LOCATIONS.slice(),
  scheduleTemplate: DEFAULT_SCHEDULE_TEMPLATE.slice(),
  scheduleExceptions: [],
  scheduleExtras: [],
  adminReminders: [],
  notifPermission: (typeof Notification !== 'undefined') ? Notification.permission : 'unsupported'
};
var remindedOrderIds = {};
/* ---------- helpers ---------- */
function currency(v){ return Number(v).toLocaleString('pt-BR', { style:'currency', currency:'BRL' }); }
function esc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function pad2(n){ return n < 10 ? '0'+n : ''+n; }
function todayStr(){ return dateToStr(new Date()); }
function dateToStr(d){ return d.getFullYear()+'-'+pad2(d.getMonth()+1)+'-'+pad2(d.getDate()); }
function dateLabel(d){ return WEEKDAY_SHORT[d.getDay()]+' '+pad2(d.getDate())+'/'+pad2(d.getMonth()+1); }
function timeToMinutes(t){ var p=t.split(':'); return parseInt(p[0])*60+parseInt(p[1]); }
function nowMinutes(){ var d = new Date(); return d.getHours()*60+d.getMinutes(); }
function getLocation(nameOrId){ return state.locations.find(function(l){ return l.name === nameOrId || l.id === nameOrId; }); }
function getProduct(id){ return state.products.find(function(x){ return x.id === id; }); }
function isSoldOut(p){ return p.stock !== undefined && p.stock !== null && Number(p.stock) <= 0; }
function isOrderable(p){ return p.available !== false && !isSoldOut(p); }
function cartItems(){
  return Object.keys(state.cart).filter(function(id){ return state.cart[id] > 0; }).map(function(id){
    var p = getProduct(id); return { product: p, qty: state.cart[id] };
  }).filter(function(i){ return i.product; });
}
function cartTotal(){ return cartItems().reduce(function(s,i){ return s + i.product.price * i.qty; }, 0); }
function cartCount(){ return cartItems().reduce(function(s,i){ return s + i.qty; }, 0); }

/* ---------- agenda de vendas ---------- */
function getScheduleRule(id){ return state.scheduleTemplate.find(function(r){ return r.id === id; }); }
function isOccurrenceCancelled(templateId, dateStr){
  return state.scheduleExceptions.some(function(ex){ return ex.templateId === templateId && ex.date === dateStr; });
}
function generateAgenda(days){
  var out = [];
  var base = new Date();
  var todayS = todayStr();
  var nm = nowMinutes();
  for (var i = 0; i < days; i++){
    var d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + i);
    var ds = dateToStr(d);
    var wd = d.getDay();
    state.scheduleTemplate.forEach(function(rule){
      if (rule.weekdays.indexOf(wd) === -1) return;
      if (isOccurrenceCancelled(rule.id, ds)) return;
      if (ds === todayS && timeToMinutes(rule.endTime) < nm) return;
      var loc = getLocation(rule.locationId);
      out.push({ id: rule.id+'_'+ds, date: ds, dateObj: d, weekday: wd, locationId: rule.locationId, locationName: loc?loc.name:'', startTime: rule.startTime, endTime: rule.endTime, source:'template', templateId: rule.id });
    });
    (state.scheduleExtras||[]).filter(function(ex){ return ex.date === ds; }).forEach(function(ex){
      if (ds === todayS && timeToMinutes(ex.endTime) < nm) return;
      var loc2 = getLocation(ex.locationId);
      out.push({ id: 'extra_'+ex.id, date: ex.date, dateObj: d, weekday: wd, locationId: ex.locationId, locationName: loc2?loc2.name:'', startTime: ex.startTime, endTime: ex.endTime, source:'extra', extraId: ex.id });
    });
  }
  out.sort(function(a,b){
    var ka = a.date + a.startTime, kb = b.date + b.startTime;
    return ka < kb ? -1 : (ka > kb ? 1 : 0);
  });
  return out;
}
function agendaGroupedByDay(days){
  var slots = generateAgenda(days);
  var groups = []; var byDate = {};
  slots.forEach(function(s){
    if (!byDate[s.date]){ byDate[s.date] = { date: s.date, dateObj: s.dateObj, slots: [] }; groups.push(byDate[s.date]); }
    byDate[s.date].slots.push(s);
  });
  return groups;
}
function findAgendaSlot(slotId, days){
  return generateAgenda(days || AGENDA_DAYS).find(function(s){ return s.id === slotId; }) || null;
}

/* ---------- firebase: storage asset upgrade ---------- */
function upgradeAsset(key, applyFn){
  if (!fbStorage) return;
  fbStorage.ref(ASSET_FILES[key]).getDownloadURL().then(function(url){
    applyFn(url); render();
  }).catch(function(){ /* keep fallback silently */ });
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

/* ---------- firebase: realtime database sync ---------- */
function objToArray(obj){ return Object.keys(obj || {}).map(function(id){ var v = obj[id] || {}; v.id = id; return v; }); }
function initFirebaseSync(){
  if (!FIREBASE_READY) return;
  fbDb.ref('products').on('value', function(snap){ var val = snap.val(); if (val) { state.products = objToArray(val); render(); } });
  fbDb.ref('locations').on('value', function(snap){ var val = snap.val(); if (val) { state.locations = objToArray(val); render(); } });
  fbDb.ref('scheduleTemplate').on('value', function(snap){ var val = snap.val(); if (val) { state.scheduleTemplate = objToArray(val); render(); } });
  fbDb.ref('scheduleExceptions').on('value', function(snap){ var val = snap.val(); state.scheduleExceptions = val ? objToArray(val) : []; render(); });
  fbDb.ref('scheduleExtras').on('value', function(snap){ var val = snap.val(); state.scheduleExtras = val ? objToArray(val) : []; render(); });
  fbDb.ref('orders').on('value', function(snap){
    var val = snap.val();
    state.orders = objToArray(val).sort(function(a,b){ return Number(b.id) - Number(a.id); });
    if (state.page === 'admin') render();
  });
  fbAuth.onAuthStateChanged(function(user){ state.authUser = user; render(); });
}
function seedFirebaseIfEmpty(){
  if (!FIREBASE_READY) return;
  setTimeout(function(){
    fbDb.ref('products').once('value', function(snap){
      if (!snap.val()){ var obj = {}; DEFAULT_PRODUCTS.forEach(function(p){ obj[p.id] = p; }); fbDb.ref('products').set(obj); }
    });
    fbDb.ref('locations').once('value', function(snap){
      if (!snap.val()){ var obj = {}; DEFAULT_LOCATIONS.forEach(function(l){ obj[l.id] = l; }); fbDb.ref('locations').set(obj); }
    });
    fbDb.ref('scheduleTemplate').once('value', function(snap){
      if (!snap.val()){ var obj = {}; DEFAULT_SCHEDULE_TEMPLATE.forEach(function(r){ obj[r.id] = r; }); fbDb.ref('scheduleTemplate').set(obj); }
    });
  }, 900);
}
function dbSet(path, value){ if (FIREBASE_READY) fbDb.ref(path).set(value).catch(function(e){ console.error(e); }); }
function dbRemove(path){ if (FIREBASE_READY) fbDb.ref(path).remove().catch(function(e){ console.error(e); }); }
function dbPushOrder(order){ if (FIREBASE_READY) fbDb.ref('orders/' + order.id).set(order).catch(function(e){ console.error(e); }); }

/* ---------- firebase: storage uploads ---------- */
function uploadToStorage(path, file, onDone){
  if (!fbStorage){ onDone(null); return; }
  var ref = fbStorage.ref(path);
  ref.put(file).then(function(snap){ return snap.ref.getDownloadURL(); }).then(function(url){ onDone(url); })
    .catch(function(err){ console.error(err); onDone(null); });
}

/* ---------- decorative flourishes ---------- */
function waveDivider(fillVar){
  return '<div style="position:absolute;left:0;bottom:-1px;width:100%;line-height:0;z-index:1">' +
    '<svg viewBox="0 0 1200 80" preserveAspectRatio="none" style="width:100%;height:44px;display:block">' +
    '<path d="M0,32 C150,70 350,0 600,28 C850,56 1050,4 1200,34 L1200,80 L0,80 Z" style="fill:'+fillVar+'"></path>' +
    '</svg></div>';
}

/* ---------- small components ---------- */
function LogoImg(){ return '<img class="logo-img" src="'+LOGO_PRINCIPAL+'" alt="Leal ChocoArt">'; }

function ProductPhoto(p){
  var badge = '';
  if (p.available === false) badge = '<div class="unavailable-badge">Indisponível</div>';
  else if (isSoldOut(p)) badge = '<div class="unavailable-badge">Esgotado</div>';
  if (p.photo) return '<div class="product-photo"><img src="'+p.photo+'" alt="'+esc(p.name)+'">' + badge + '</div>';
  return '<div class="product-photo">' + icon('treat', 46, 'var(--primary)') + badge + '</div>';
}

function Pill(text, tone){ return '<span class="pill ' + (tone === 'blush' ? 'pill-blush' : 'pill-lilac') + '">' + text + '</span>'; }

function StatusCard(){
  var agenda = generateAgenda(AGENDA_DAYS);
  var first = agenda[0];
  var isNow = first && first.date === todayStr() && timeToMinutes(first.startTime) <= nowMinutes() && nowMinutes() <= timeToMinutes(first.endTime);
  var color = isNow ? '#4ec98c' : '#e0537a';
  var bg = isNow ? 'rgba(78,201,140,0.18)' : 'rgba(224,83,122,0.18)';
  var label = isNow ? 'Vendendo agora' : (first ? 'Próxima venda' : 'Nenhuma venda agendada');
  var place = first ? first.locationName : 'Volte em breve';
  var whenHtml = '';
  if (first){
    whenHtml = isNow
      ? esc(place) + ' · até ' + first.endTime
      : (first.date === todayStr() ? 'Hoje' : dateLabel(first.dateObj)) + ' · ' + esc(place) + ' · ' + first.startTime + '–' + first.endTime;
  }
  return '<div class="status-card">' +
    '<div class="status-dot" style="background:'+color+';box-shadow:0 0 0 6px '+bg+'"></div>' +
    '<div><p style="font-weight:700;font-size:15.5px;margin:0">'+label+'</p>' +
    '<p style="font-size:13.5px;color:var(--ink-soft);margin:3px 0 0">'+whenHtml+'</p></div>' +
    '</div>';
}

function AgendaTimeline(days){
  var groups = agendaGroupedByDay(days || AGENDA_DAYS);
  if (groups.length === 0){
    return '<p style="font-size:13px;color:var(--ink-soft)">Nenhuma venda agendada nos próximos dias.</p>';
  }
  var todayS = todayStr();
  return '<div class="agenda-timeline">' + groups.map(function(g){
    var isToday = g.date === todayS;
    return '<div class="agenda-day">' +
      '<div class="agenda-day-label">' + (isToday ? 'Hoje · ' : '') + dateLabel(g.dateObj) + '</div>' +
      '<div class="agenda-day-slots">' + g.slots.map(function(s){
        return '<div class="agenda-slot">' +
          icon('mapPin', 15, 'var(--primary)') +
          '<span class="agenda-slot-loc">'+esc(s.locationName)+'</span>' +
          '<span class="agenda-slot-time">'+s.startTime+' – '+s.endTime+'</span>' +
          '</div>';
      }).join('') + '</div>' +
    '</div>';
  }).join('') + '</div>';
}

function MapWithPin(loc, editable){
  if (!loc || !loc.mapImage){
    return '<div class="map-wrap" style="height:200px;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:8px;cursor:default">' +
      icon('mapPin',28,'var(--primary)') + '<p style="font-size:12.5px;color:var(--ink-soft)">Nenhum mapa configurado</p></div>';
  }
  var pinHtml = '';
  if (loc.pin){
    pinHtml = '<div class="map-pin" style="left:'+loc.pin.x+'%;top:'+loc.pin.y+'%">' +
      '<span class="map-pin-label">'+esc(loc.pin.label || 'Aqui')+'</span>' + icon('mapPin', 30, 'var(--primary)') + '</div>';
  }
  var attrs = editable ? ' data-action="mapClick" data-locid="'+loc.id+'"' : '';
  return '<div class="map-wrap"'+attrs+'><img src="'+loc.mapImage+'" alt="Mapa '+esc(loc.name)+'" draggable="false">' + pinHtml + '</div>';
}

function CartButton(extraClass){
  var count = cartCount();
  var disabled = count === 0;
  return '<button class="icon-btn '+(extraClass||'')+'" data-action="openModal" '+(disabled?'disabled title="Adicione produtos ao carrinho"':'title="Ver encomenda"')+'>' +
    icon('bag',17) + (count>0 ? '<span class="cart-badge">'+count+'</span>' : '') + '</button>';
}
/* ---------- page sections ---------- */
function sectionHero(){
  return '<section class="hero" id="topo">' +
    '<div class="blob" style="width:320px;height:320px;background:var(--pink-soft);top:-70px;right:-50px"></div>' +
    '<div class="blob" style="width:240px;height:240px;background:var(--lilac-soft);bottom:-50px;left:-30px"></div>' +
    '<div class="hero-grid">' +
      '<div>' +
        '<p class="script-tag">feito à mão, com carinho</p>' +
        '<h1>Chocolate feito à mão,<br> <span class="script-accent">com arte e carinho.</span></h1>' +
        '<p class="lead">Bombons e pães de mel artesanais produzidos em pequenos lotes pela Julia. Monte seu carrinho abaixo e peça sua encomenda.</p>' +
        '<div style="display:flex;gap:14px;margin-top:28px;flex-wrap:wrap;align-items:center">' +
          '<a class="btn-primary" href="#produtos">Ver produtos '+icon('heart',15)+'</a>' +
        '</div>' +
        '<p class="hint" style="margin-top:16px;display:flex;align-items:center;gap:6px">'+icon('bag',14)+' Adicione produtos ao carrinho para montar sua encomenda</p>' +
      '</div>' +
      '<div class="hero-visual">' +
        '<div class="hero-badge-ring"><img class="hero-badge-img" src="'+LOGO_CIRCLE+'" alt="Selo Leal ChocoArt"></div>' +
      '</div>' +
    '</div>' + waveDivider('var(--bg-alt)') +
    '</section>';
}

function sectionProdutos(){
  var cards = state.products.map(function(p){
    var orderable = isOrderable(p);
    var qty = state.cart[p.id] || 0;
    var maxStock = (p.stock === undefined || p.stock === null) ? Infinity : Number(p.stock);
    var stepper;
    if (!orderable){
      stepper = '<p style="font-size:12px;color:var(--ink-soft);font-weight:700">' + (p.available===false ? 'Indisponível' : 'Esgotado') + '</p>';
    } else if (qty > 0){
      stepper = '<div class="qty-row">' +
          '<button class="qty-btn" data-action="cartDec" data-id="'+p.id+'">'+icon('minus',14)+'</button>' +
          '<span class="qty-value">'+qty+'</span>' +
          '<button class="qty-btn" data-action="cartInc" data-id="'+p.id+'" '+(qty>=maxStock?'disabled style="opacity:.4"':'')+'>'+icon('plus',14)+'</button>' +
        '</div>';
    } else {
      stepper = '<button class="btn-secondary sm" data-action="cartInc" data-id="'+p.id+'">'+icon('plus',14)+' Adicionar</button>';
    }
    var stockNote = (orderable && p.stock !== undefined && p.stock !== null) ? '<p class="stock-note">'+p.stock+' disponíveis</p>' : '';
    return '<div class="product-card">' +
      '<div style="padding:10px">' + ProductPhoto(p) + '</div>' +
      '<div style="padding:4px 18px 20px">' +
      '<p style="font-family:\'Fredoka\',sans-serif;font-weight:600;font-size:18.5px;margin:0 0 5px;color:var(--ink)">'+esc(p.name)+'</p>' +
      '<p style="font-size:13px;color:var(--ink-soft);margin:0 0 8px;line-height:1.5">'+esc(p.desc)+'</p>' +
      '<details class="ingredients"><summary>Ver ingredientes</summary><p>'+esc(p.ingredients)+'</p></details>' +
      '<p style="font-weight:800;font-size:15.5px;color:var(--primary-dark);margin:10px 0 4px">'+currency(p.price)+'</p>' +
      stockNote +
      '<div style="margin-top:10px">' + stepper + '</div>' +
      '</div></div>';
  }).join('');

  var items = cartItems();
  var cartHtml = '<div class="cart-box">' +
    '<p style="font-weight:800;font-size:14px;margin:0 0 10px;display:flex;align-items:center;gap:8px">'+icon('bag',17,'var(--primary-dark)')+' Seu carrinho</p>' +
    (items.length === 0
      ? '<p style="font-size:13px;color:var(--ink-soft)">Seu carrinho está vazio — adicione produtos acima.</p>'
      : items.map(function(i){ return '<div class="cart-line"><span>'+i.qty+'x '+esc(i.product.name)+'</span><span>'+currency(i.product.price*i.qty)+'</span></div>'; }).join('') +
        '<div class="cart-total"><span>Total</span><span>'+currency(cartTotal())+'</span></div>'
    ) + '</div>';

  var ctaBlock = items.length > 0
    ? '<div style="margin-top:22px;text-align:center"><button class="btn-primary" data-action="openModal" style="justify-content:center">Fazer encomenda '+icon('arrowRight',16)+'</button></div>'
    : '<p style="text-align:center;margin-top:18px;font-size:13px;color:var(--ink-soft)">'+icon('heart',13)+' Toque em "Adicionar" para montar sua encomenda</p>';

  return '<section style="background:var(--bg-alt);padding:64px 20px;position:relative;overflow:hidden" id="produtos">' +
    '<div class="blob" style="width:260px;height:260px;background:var(--pink-soft);top:-40px;left:-60px"></div>' +
    '<div class="container" style="position:relative;z-index:1">' +
    '<p class="section-label">'+icon('heart',14)+' Catálogo</p>' +
    '<h2 style="font-size:28px;margin:0 0 26px">Nossos produtos</h2>' +
    '<div class="product-grid">' + cards + '</div>' +
    cartHtml + ctaBlock +
    '</div></section>';
}

function sectionLocalizacao(){
  var firstSlot = generateAgenda(1)[0] || generateAgenda(AGENDA_DAYS)[0];
  var mapLoc = firstSlot ? getLocation(firstSlot.locationId) : null;
  var list = state.locations.map(function(l){
    return '<div style="display:flex;align-items:center;gap:14px;background:var(--card);border:2px solid var(--line);border-radius:16px;padding:14px 18px">' +
      icon('mapPin',18,'var(--primary)') +
      '<div><p style="font-weight:700;font-size:14.5px;margin:0">'+esc(l.name)+'</p>' +
      (l.address ? '<p style="font-size:12.5px;color:var(--ink-soft);margin:2px 0 0">'+esc(l.address)+'</p>' : '') +
      (l.ordersOnly ? '<p style="font-size:13px;color:var(--ink-soft);margin:2px 0 0">Somente encomendas</p>' : '') +
      '</div></div>';
  }).join('');
  return '<section style="background:var(--bg);padding:64px 20px;position:relative;overflow:hidden" id="localizacao">' +
    '<div class="blob" style="width:260px;height:260px;background:var(--lilac-soft);bottom:-60px;right:-60px"></div>' +
    '<div class="container" style="padding:0;max-width:800px;position:relative;z-index:1">' +
    '<p class="section-label">'+icon('mapPin',14)+' Onde estamos</p>' +
    '<h2 style="font-size:28px;margin:0 0 22px">Localização de hoje</h2>' +
    StatusCard() +
    (mapLoc && mapLoc.mapImage ? MapWithPin(mapLoc, false) : '') +
    '<p style="font-weight:700;font-size:12.5px;letter-spacing:1.2px;text-transform:uppercase;color:var(--pink);margin:36px 0 14px;display:flex;align-items:center;gap:6px">'+icon('calendar',13)+' Próximos dias de venda</p>' +
    AgendaTimeline(AGENDA_DAYS) +
    '<p style="font-weight:700;font-size:12.5px;letter-spacing:1.2px;text-transform:uppercase;color:var(--pink);margin:36px 0 14px">Todos os pontos de retirada</p>' +
    '<div style="display:flex;flex-direction:column;gap:10px">' + list + '</div>' +
    '</div></section>';
}

function sectionContato(){
  return '<section style="background:var(--bg-alt);padding:64px 20px 80px;position:relative;overflow:hidden" id="contato">' +
    '<div class="container" style="max-width:560px;text-align:center;position:relative;z-index:1">' +
    '<p class="section-label" style="justify-content:center">'+icon('heart',14)+' Fale com a gente</p>' +
    '<h2 style="font-size:28px;margin:0 0 14px">Contato</h2>' +
    '<p style="font-size:15px;color:var(--ink-soft);line-height:1.7;margin:0 0 30px">Dúvidas, encomendas especiais ou parcerias? Fale direto com a Julia pelo WhatsApp ou acompanhe o dia a dia da confeitaria no Instagram.</p>' +
    '<div style="display:flex;gap:14px;justify-content:center;flex-wrap:wrap">' +
      '<a class="btn-primary" href="https://wa.me/5515998054872" target="_blank" rel="noopener">'+icon('whatsapp',16)+' Conversar no WhatsApp</a>' +
      '<a class="btn-secondary" href="https://www.instagram.com/lealchocoart/" target="_blank" rel="noopener">'+icon('instagram',16)+' Instagram</a>' +
    '</div></div></section>';
}

/* ---------- modal (encomenda) ---------- */
function renderModal(){
  if (!state.modalOpen) return '';
  var items = cartItems();
  var slots = generateAgenda(AGENDA_DAYS);

  var locOrder = []; var seenLoc = {};
  slots.forEach(function(s){ if (!seenLoc[s.locationId]){ seenLoc[s.locationId] = true; locOrder.push(s.locationId); } });
  var selectedLocId = (state.orderModalLocationId && seenLoc[state.orderModalLocationId]) ? state.orderModalLocationId : '';
  var locOptionsHtml = locOrder.map(function(locId){
    var loc = getLocation(locId);
    return '<option value="'+locId+'"'+(locId===selectedLocId?' selected':'')+'>'+esc(loc?loc.name:locId)+'</option>';
  }).join('');

  var slotsForLoc = selectedLocId ? slots.filter(function(s){ return s.locationId === selectedLocId; }) : [];

  var dateOrder = []; var seenDate = {}; var dateObjByDate = {};
  slotsForLoc.forEach(function(s){ if (!seenDate[s.date]){ seenDate[s.date] = true; dateOrder.push(s.date); dateObjByDate[s.date] = s.dateObj; } });
  var selectedDate = (state.orderModalDate && seenDate[state.orderModalDate]) ? state.orderModalDate : '';
  var todayS = todayStr();
  var dateOptionsHtml = dateOrder.map(function(d){
    var when = (d === todayS ? 'Hoje' : dateLabel(dateObjByDate[d]));
    return '<option value="'+d+'"'+(d===selectedDate?' selected':'')+'>'+when+'</option>';
  }).join('');

  var slotsForDate = selectedDate ? slotsForLoc.filter(function(s){ return s.date === selectedDate; }) : [];
  var slotOptions = slotsForDate.map(function(s){
    return '<option value="'+s.id+'">'+s.startTime+'–'+s.endTime+'</option>';
  }).join('');

  var cartSummary = items.length === 0
    ? '<p class="hint" style="margin-bottom:16px">Seu carrinho está vazio. Volte aos produtos e adicione ao menos um item.</p>'
    : '<div class="cart-box" style="margin:0 0 20px">' +
        items.map(function(i){ return '<div class="cart-line"><span>'+i.qty+'x '+esc(i.product.name)+'</span><span>'+currency(i.product.price*i.qty)+'</span></div>'; }).join('') +
        '<div class="cart-total"><span>Total</span><span>'+currency(cartTotal())+'</span></div>' +
      '</div>';

  return '<div class="modal-overlay" data-action="closeModalBg">' +
    '<div class="modal" data-stop="1">' +
      '<button class="modal-close" data-action="closeModal">'+icon('close',16)+'</button>' +
      '<p class="section-label">Pedido</p>' +
      '<h2 style="font-size:22px;margin:0 0 18px">Fazer encomenda</h2>' +
      cartSummary +
      '<form id="orderForm" data-action="submitOrderForm">' +
        '<div class="field"><label>Nome</label><input class="input" id="f-nome" placeholder="Seu nome completo" required></div>' +
        '<div class="field"><label>Telefone</label><input class="input" id="f-telefone" placeholder="(15) 99999-0000" required></div>' +
        '<div class="field"><label>Local de retirada</label>' +
          (slots.length === 0
            ? '<p class="error-text" style="margin-top:0">Nenhum horário de retirada disponível nos próximos dias. Tente novamente mais tarde.</p>'
            : '<select class="input" id="f-local" data-action="selectOrderLocation" required><option value="">Selecione um local</option>'+locOptionsHtml+'</select>') +
        '</div>' +
        (slots.length > 0 ? '<div class="field"><label>Dia</label>' +
          (selectedLocId
            ? '<select class="input" id="f-dia" data-action="selectOrderDate" required><option value="">Selecione um dia</option>'+dateOptionsHtml+'</select>'
            : '<select class="input" id="f-dia" disabled required><option value="">Selecione um local primeiro</option></select>') +
        '</div>' : '') +
        (slots.length > 0 ? '<div class="field"><label>Horário de retirada</label>' +
          (selectedDate
            ? '<select class="input" id="f-slot" required><option value="">Selecione um horário</option>'+slotOptions+'</select>' +
              '<p class="hint">Você retira o pedido dentro da faixa de horário escolhida.</p>'
            : '<select class="input" id="f-slot" disabled required><option value="">Selecione um dia primeiro</option></select>') +
        '</div>' : '') +
        '<div class="field"><label>Observações</label><textarea class="input" id="f-observacoes" placeholder="Alguma preferência ou observação?"></textarea></div>' +
        '<p class="error-text" id="formError"></p>' +
        '<button type="submit" class="btn-primary" style="justify-content:center;width:100%" '+(items.length===0||slots.length===0?'disabled':'')+'>Enviar encomenda '+icon('heart',15)+'</button>' +
      '</form>' +
    '</div></div>';
}
function renderConfirm(){
  return '<div class="modal-overlay" data-action="closeConfirmBg"><div class="modal" style="text-align:center" data-stop="1">' +
    '<div style="width:60px;height:60px;border-radius:50%;background:var(--lilac-soft);display:flex;align-items:center;justify-content:center;margin:0 auto 18px">' + icon('check',28,'var(--primary-dark)') + '</div>' +
    '<h2 style="font-size:22px;margin:0 0 10px">Encomenda enviada!</h2>' +
    '<p style="font-size:14px;color:var(--ink-soft);line-height:1.7">A Julia recebeu seu pedido e vai confirmar em breve. Obrigada por escolher a Leal ChocoArt!</p>' +
    '<button class="btn-primary" data-action="closeConfirm" style="margin-top:20px;justify-content:center;width:100%">Fechar</button>' +
    '</div></div>';
}

function renderDeleteLocationModal(){
  if (!state.confirmDeleteLocationId) return '';
  var loc = getLocation(state.confirmDeleteLocationId);
  var name = loc ? loc.name : 'esta localização';
  return '<div class="modal-overlay" data-action="closeDeleteLocationBg"><div class="modal" style="text-align:center" data-stop="1">' +
    '<div style="width:60px;height:60px;border-radius:50%;background:var(--pink-soft);display:flex;align-items:center;justify-content:center;margin:0 auto 18px">' + icon('trash',26,'#c94a6d') + '</div>' +
    '<h2 style="font-size:22px;margin:0 0 10px">Excluir localização?</h2>' +
    '<p style="font-size:14px;color:var(--ink-soft);line-height:1.7">Tem certeza que deseja excluir <strong>'+esc(name)+'</strong>? Essa ação não pode ser desfeita.</p>' +
    '<div style="display:flex;gap:10px;margin-top:20px">' +
      '<button class="btn-secondary" data-action="cancelDeleteLocation" style="flex:1;justify-content:center">Cancelar</button>' +
      '<button class="btn-primary" data-action="confirmDeleteLocation" style="flex:1;justify-content:center;background:#e0537a;border-color:#7a1f38">Excluir</button>' +
    '</div></div></div>';
}

/* ---------- header / footer ---------- */
function renderHeader(){
  if (state.page === 'admin'){
    return '<header><div class="header-inner">' +
      '<a href="#" data-action="go" data-page="site">'+LogoImg()+'</a>' +
      '<div style="display:flex;gap:10px;align-items:center">' +
      '<button class="btn-secondary sm" data-action="go" data-page="site">Voltar ao site</button></div>' +
      '</div></header>';
  }
  var links = [['Produtos','#produtos'],['Onde Estamos','#localizacao'],['Contato','#contato']];
  var navHtml = links.map(function(l){ return '<a class="nav-link" href="'+l[1]+'">'+l[0]+'</a>'; }).join('');
  var mobileHtml = links.map(function(l){ return '<a class="nav-link" href="'+l[1]+'" data-action="closeMenu">'+l[0]+'</a>'; }).join('');
  return '<header>' +
    '<div class="header-inner"><a href="#topo">'+LogoImg()+'</a>' +
      '<nav class="desktop-nav">' + navHtml + CartButton() + '</nav>' +
      '<div class="mobile-row">' + CartButton() +
        '<button class="mobile-toggle" data-action="toggleMenu">' + icon(state.menuOpen ? 'close' : 'menu', 22) + '</button>' +
      '</div>' +
    '</div>' +
    (state.menuOpen ? '<div class="mobile-menu">' + mobileHtml + '</div>' : '') +
    '</header>';
}

function renderFooter(){
  return '<footer>' +
    '<div class="footer-inner">' + LogoImg() +
      '<p class="footer-copy">© '+new Date().getFullYear()+' Leal ChocoArt</p>' +
      '<div class="footer-icons">' +
        '<a href="https://www.instagram.com/lealchocoart/" target="_blank" rel="noopener" style="color:var(--primary-dark)">'+icon('instagram',18)+'</a>' +
        '<a href="https://wa.me/5515998054872" target="_blank" rel="noopener" style="color:var(--primary-dark)">'+icon('whatsapp',18)+'</a>' +
        '<button data-action="go" data-page="admin" class="btn-ghost">Admin</button>' +
      '</div></div>' +
    '</footer>';
}

/* ---------- admin: login ---------- */
function pageAdminLogin(){
  var banner = FIREBASE_READY ? '' :
    '<div class="fw-banner">'+icon('lock',14)+' O Firebase não pôde ser inicializado neste navegador. Verifique sua conexão ou a configuração do projeto.</div>';
  return '<div class="container" style="max-width:1000px;padding:40px 20px 80px">' +
    '<div class="login-box">' +
      '<div style="width:54px;height:54px;border-radius:50%;background:var(--lilac-soft);display:flex;align-items:center;justify-content:center;margin:0 auto 16px">'+icon('lock',24,'var(--primary-dark)')+'</div>' +
      '<h2 style="font-size:22px;margin:0 0 6px">Acesso restrito</h2>' +
      '<p style="font-size:13px;color:var(--ink-soft);margin:0 0 20px">Entre com sua conta de administrador para gerenciar a loja.</p>' +
      banner +
      '<form data-action="loginForm">' +
        '<div class="field" style="text-align:left"><label>E-mail</label><input class="input" id="login-email" type="email" placeholder="voce@email.com" required></div>' +
        '<div class="field" style="text-align:left"><label>Senha</label><input class="input" id="login-senha" type="password" placeholder="••••••••" required></div>' +
        '<p class="error-text">'+esc(state.authError)+'</p>' +
        '<button type="submit" class="btn-primary" style="justify-content:center;width:100%">Entrar</button>' +
      '</form>' +
    '</div></div>';
}

/* ---------- admin: panel ---------- */
function pageAdminPanel(){
  var tab = state.adminTab;
  var tabs = [['produtos','Produtos','package'],['encomendas','Encomendas','clipboard'],['agenda','Agenda','calendar'],['local','Locais','mapPin'],['analises','Análises','chart']];
  var tabsHtml = tabs.map(function(t){
    return '<button class="tab-btn '+(tab===t[0]?'active':'')+'" data-action="adminTab" data-tab="'+t[0]+'">'+icon(t[2],14)+' '+t[1]+'</button>';
  }).join('');

  var body = '';
  if (tab === 'produtos'){
    var addForm = !state.addingProduct
      ? '<button class="btn-secondary sm" data-action="toggleAddProduct" style="margin-bottom:18px">'+icon('plus',14)+' Adicionar produto</button>'
      : '<div class="new-product-card">' +
          '<p style="font-weight:800;font-size:14.5px;margin:0 0 12px">Novo produto</p>' +
          '<div class="field"><label>Nome</label><input class="input" id="np-nome" placeholder="Ex: Trufa de Café"></div>' +
          '<div class="field"><label>Descrição</label><input class="input" id="np-desc" placeholder="Descrição curta"></div>' +
          '<div class="field"><label>Ingredientes</label><input class="input" id="np-ing" placeholder="Ingredientes"></div>' +
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">' +
            '<div class="field"><label>Preço (R$)</label><input class="input" id="np-preco" type="number" step="0.5" value="5"></div>' +
            '<div class="field"><label>Estoque</label><input class="input" id="np-estoque" type="number" step="1" value="10"></div>' +
          '</div>' +
          '<div class="field"><label>Imagem</label><input class="file-input" type="file" accept="image/*" id="np-imagem"></div>' +
          '<div style="display:flex;gap:10px">' +
            '<button class="btn-primary sm" data-action="createProduct">Salvar</button>' +
            '<button class="btn-ghost" data-action="toggleAddProduct">Cancelar</button>' +
          '</div>' +
        '</div>';

    body = addForm + state.products.map(function(p){
      return '<div class="admin-loc-card">' +
        '<div class="admin-row" style="margin-bottom:12px;background:transparent;border:none;padding:0">' +
        '<div class="thumb">' + (p.photo ? '<img src="'+p.photo+'">' : icon('treat',20,'var(--primary)')) +
          '<input class="thumb-upload" type="file" accept="image/*" data-action="uploadProductPhoto" data-id="'+p.id+'" title="Trocar imagem"></div>' +
        '<input class="input" style="flex:1 1 140px;height:36px" value="'+esc(p.name)+'" data-action="setName" data-id="'+p.id+'">' +
        '<div style="display:flex;flex-direction:column;gap:2px"><label class="hint" style="margin:0">Preço</label><input class="input" type="number" step="0.5" value="'+p.price+'" style="width:88px;height:34px" data-action="setPrice" data-id="'+p.id+'"></div>' +
        '<div style="display:flex;flex-direction:column;gap:2px"><label class="hint" style="margin:0">Estoque</label><input class="input" type="number" step="1" value="'+(p.stock===undefined?'':p.stock)+'" style="width:78px;height:34px" data-action="setStock" data-id="'+p.id+'"></div>' +
        '<button class="avail-toggle '+(p.available!==false?'avail-on':'avail-off')+'" data-action="toggleAvailable" data-id="'+p.id+'">'+(p.available!==false?'Disponível':'Indisponível')+'</button>' +
        '<button data-action="removeProduct" data-id="'+p.id+'" style="background:none;border:none;color:var(--ink-soft)" aria-label="Remover produto">'+icon('trash',16)+'</button>' +
        '</div>' +
        '<div class="field" style="margin-bottom:8px"><label>Descrição</label><textarea class="input" style="height:56px" data-action="setDesc" data-id="'+p.id+'">'+esc(p.desc)+'</textarea></div>' +
        '<div class="field" style="margin-bottom:0"><label>Ingredientes</label><textarea class="input" style="height:56px" data-action="setIngredients" data-id="'+p.id+'">'+esc(p.ingredients)+'</textarea></div>' +
        '</div>';
    }).join('');
  } else if (tab === 'encomendas'){
    var pendingMap = {};
    state.orders.filter(function(o){ return o.status !== 'cancelado' && !o.produced; }).forEach(function(o){
      (o.items||[]).forEach(function(i){ pendingMap[i.name] = (pendingMap[i.name] || 0) + Number(i.qty || 0); });
    });
    var pendingEntries = Object.keys(pendingMap);
    var productionBlock = '<p style="font-weight:800;font-size:14.5px;margin:0 0 12px;display:flex;align-items:center;gap:8px">'+icon('package',16,'var(--primary-dark)')+' Produção pendente</p>' +
      (pendingEntries.length === 0
        ? '<p style="color:var(--ink-soft);font-size:13.5px;margin-bottom:26px">Nada pendente de produção no momento.</p>'
        : '<div style="margin-bottom:26px">' + pendingEntries.map(function(name){
            return '<div style="display:flex;justify-content:space-between;align-items:center;background:var(--card);border:2px solid var(--line);border-radius:18px;padding:12px 18px;margin-bottom:8px">' +
              '<p style="font-weight:700;font-size:14px;margin:0">'+esc(name)+'</p>' + Pill('Produzir ' + pendingMap[name],'lilac') + '</div>';
          }).join('') + '</div>'
      );

    var ordersBlock = '<p style="font-weight:800;font-size:14.5px;margin:0 0 12px">Pedidos</p>';
    if (state.orders.length === 0){
      ordersBlock += '<p style="color:var(--ink-soft);font-size:14px">Nenhuma encomenda recebida ainda.</p>';
    } else {
      ordersBlock += state.orders.map(function(o){
        var itemsStr = (o.items||[]).map(function(i){ return i.qty+'x '+i.name; }).join(', ');
        return '<div style="background:var(--card);border:2px solid var(--line);border-radius:18px;padding:14px 18px;margin-bottom:10px'+(o.produced?';opacity:.6':'')+'">' +
          '<div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px">' +
          '<div><p style="font-weight:700;font-size:14.5px;margin:0">'+esc(o.nome)+' — '+esc(itemsStr)+'</p>' +
          '<p style="font-size:12.5px;color:var(--ink-soft);margin:3px 0 0">'+esc(o.telefone)+' · '+esc(o.local)+' · '+esc(o.data)+' '+esc(o.horario)+' · Total '+currency(o.total)+'</p>' +
          (o.observacoes ? '<p style="font-size:12.5px;color:var(--ink-soft);margin:3px 0 0">Obs: '+esc(o.observacoes)+'</p>' : '') +
          '</div>' +
          '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">' +
          '<button class="avail-toggle '+(o.produced?'avail-on':'avail-off')+'" data-action="toggleProduced" data-id="'+o.id+'">'+(o.produced?icon('check',12)+' Produzido':'Marcar produzido')+'</button>' +
          '<select class="input" style="width:150px;height:34px;font-size:12.5px" data-action="setOrderStatus" data-id="'+o.id+'">' +
            ['pendente','producao','pronto','concluido','cancelado'].map(function(s){
              var labels = {pendente:'Pendente',producao:'Em produção',pronto:'Pronto',concluido:'Concluído',cancelado:'Cancelado'};
              return '<option value="'+s+'"'+(o.status===s?' selected':'')+'>'+labels[s]+'</option>';
            }).join('') +
          '</select></div></div></div>';
      }).join('');
    }
    body = productionBlock + ordersBlock;
  } else if (tab === 'local'){
    var addLocForm = !state.addingLocation
      ? '<button class="btn-secondary sm" data-action="toggleAddLocation" style="margin-bottom:18px">'+icon('plus',14)+' Adicionar localização</button>'
      : '<div class="new-product-card">' +
          '<p style="font-weight:800;font-size:14.5px;margin:0 0 12px">Nova localização</p>' +
          '<div class="field"><label>Nome</label><input class="input" id="nl-nome" placeholder="Ex: Praça Central"></div>' +
          '<div class="field"><label>Endereço (opcional)</label><input class="input" id="nl-endereco" placeholder="Ex: Rua das Flores, 123"></div>' +
          '<div style="display:flex;gap:10px">' +
            '<button class="btn-primary sm" data-action="createLocation">Salvar</button>' +
            '<button class="btn-ghost" data-action="toggleAddLocation">Cancelar</button>' +
          '</div>' +
        '</div>';

    var locEditors = state.locations.map(function(l){
      return '<div class="admin-loc-card">' +
        '<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">' +
          '<input class="input" style="flex:1;height:38px;font-weight:700" value="'+esc(l.name)+'" data-action="setLocName" data-locid="'+l.id+'">' +
          '<button data-action="removeLocation" data-locid="'+l.id+'" style="background:none;border:none;color:var(--ink-soft)" aria-label="Excluir localização">'+icon('trash',16)+'</button>' +
        '</div>' +
        '<div class="field"><label>Endereço (opcional)</label><input class="input" placeholder="Ex: Rua das Flores, 123" value="'+esc(l.address||'')+'" data-action="setLocAddress" data-locid="'+l.id+'"></div>' +
        '<label style="display:flex;align-items:center;gap:8px;font-size:12.5px;color:var(--ink-soft);font-weight:700;margin-bottom:14px">' +
          '<input type="checkbox" data-action="toggleOrdersOnly" data-locid="'+l.id+'" '+(l.ordersOnly?'checked':'')+'> Somente encomendas (não entra na agenda de vendas)' +
        '</label>' +
        '<div class="field"><label>Imagem do mapa</label><input class="file-input" type="file" accept="image/*" data-action="uploadMap" data-locid="'+l.id+'"></div>' +
        MapWithPin(l, true) +
        '<p class="hint">Clique no mapa para posicionar o marcador.</p>' +
        '<div class="field" style="margin-top:12px"><label>Texto do marcador (ex: Sala A24)</label>' +
          '<input class="input" placeholder="Ex: Sala A24" value="'+esc(l.pin ? l.pin.label : '')+'" data-action="setPinLabel" data-locid="'+l.id+'" '+(l.pin?'':'disabled')+'></div>' +
        (l.pin ? '<button class="btn-ghost" data-action="removePin" data-locid="'+l.id+'">Remover marcador</button>' : '') +
        '</div>';
    }).join('');
    body = addLocForm + locEditors;
  } else if (tab === 'agenda'){
    body = pageAdminAgendaBody();
  } else if (tab === 'analises'){
    body = pageAdminAnalyticsBody();
  }

  return '<div class="container" style="max-width:1000px;padding:40px 20px 80px">' +
    '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:24px">' +
      '<h1 style="font-size:26px;display:flex;align-items:center;gap:10px">'+icon('settings',22,'var(--primary)')+' Administração</h1>' +
      '<div style="display:flex;align-items:center;gap:10px">' +
        (state.authUser ? '<span style="font-size:12.5px;color:var(--ink-soft)">'+esc(state.authUser.email)+'</span>' : '') +
        (FIREBASE_READY ? '<button class="btn-ghost" data-action="logout">'+icon('logout',14)+' Sair</button>' : '') +
      '</div></div>' +
    ReminderBanner() +
    '<div class="tab-row">' + tabsHtml + '</div>' +
    '<div>' + body + '</div>' +
    '</div>';
}

/* ---------- admin: lembrete de retirada (10 min antes) ---------- */
function ReminderBanner(){
  var notifBtn = '';
  if (typeof Notification !== 'undefined' && state.notifPermission !== 'granted' && state.notifPermission !== 'unsupported'){
    notifBtn = '<button class="btn-ghost" data-action="enableNotifications" style="margin-bottom:16px;display:flex;align-items:center;gap:6px">'+icon('bell',13)+' Ativar aviso do navegador quando o admin estiver aberto</button>';
  }
  if (state.adminReminders.length === 0) return notifBtn;
  var items = state.adminReminders.map(function(o){
    var itemsStr = (o.items||[]).map(function(i){ return i.qty+'x '+i.name; }).join(', ');
    return '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;padding:8px 0;border-top:1px dashed rgba(255,255,255,0.4)">' +
      '<p style="margin:0;font-size:13px"><strong>'+esc(o.nome)+'</strong> — '+esc(itemsStr)+' · '+esc(o.local)+' · '+esc(o.pickupStart)+'</p>' +
      '<button data-action="dismissReminder" data-id="'+o.id+'" style="background:none;border:none;color:inherit;opacity:.8">'+icon('x',14)+'</button>' +
      '</div>';
  }).join('');
  return '<div style="background:#e0537a;color:#fff;border-radius:18px;padding:14px 18px;margin-bottom:20px">' +
    '<p style="margin:0;font-weight:800;font-size:14px;display:flex;align-items:center;gap:8px">'+icon('bell',16)+' Retirada chegando — prepare o pedido</p>' +
    items +
    '</div>' + notifBtn;
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
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted'){
        var itemsStr = (o.items||[]).map(function(i){ return i.qty+'x '+i.name; }).join(', ');
        try { new Notification('Retirada em breve — Leal ChocoArt', { body: o.nome+' · '+itemsStr+' · '+o.local }); } catch(e){}
      }
      render();
    }
  });
}
/* ---------- admin: agenda (regras recorrentes + exceções + avulsos) ---------- */
function locationSelectOptions(selectedId){
  return state.locations.filter(function(l){ return !l.ordersOnly; }).map(function(l){
    return '<option value="'+l.id+'"'+(l.id===selectedId?' selected':'')+'>'+esc(l.name)+'</option>';
  }).join('');
}
function ruleWeekdaysHtml(rule){
  return '<div class="wd-row">' + WEEKDAY_SHORT.map(function(lbl, idx){
    var active = rule.weekdays.indexOf(idx) !== -1;
    return '<button type="button" class="wd-pill '+(active?'active':'')+'" data-action="toggleRuleWeekday" data-ruleid="'+rule.id+'" data-wd="'+idx+'">'+lbl+'</button>';
  }).join('') + '</div>';
}
function sortedScheduleTemplate(){
  return state.scheduleTemplate.map(function(r, idx){
    return { rule:r, ord: (r.order !== undefined && r.order !== null) ? r.order : idx };
  }).sort(function(a,b){ return a.ord - b.ord; }).map(function(x){ return x.rule; });
}
function generateAgendaAdmin(days){
  var out = [];
  var base = new Date();
  for (var i = 0; i < days; i++){
    var d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + i);
    var ds = dateToStr(d);
    var wd = d.getDay();
    state.scheduleTemplate.forEach(function(rule){
      if (rule.weekdays.indexOf(wd) === -1) return;
      var loc = getLocation(rule.locationId);
      out.push({ date: ds, dateObj: d, locationName: loc?loc.name:'', startTime: rule.startTime, endTime: rule.endTime, templateId: rule.id, cancelled: isOccurrenceCancelled(rule.id, ds) });
    });
  }
  out.sort(function(a,b){ var ka=a.date+a.startTime, kb=b.date+b.startTime; return ka<kb?-1:(ka>kb?1:0); });
  return out;
}
function pageAdminAgendaBody(){
  var addRuleForm = !state.addingScheduleRule
    ? '<button class="btn-secondary sm" data-action="toggleAddScheduleRule" style="margin-bottom:18px">'+icon('plus',14)+' Adicionar regra recorrente</button>'
    : '<div class="new-product-card">' +
        '<p style="font-weight:800;font-size:14.5px;margin:0 0 12px">Nova regra recorrente</p>' +
        '<div class="field"><label>Local</label><select class="input" id="sr-local">'+locationSelectOptions(null)+'</select></div>' +
        '<div class="field"><label>Dias da semana</label><div style="display:flex;gap:10px;flex-wrap:wrap" id="sr-weekdays">' +
          WEEKDAY_SHORT.map(function(lbl,idx){ return '<label style="display:flex;flex-direction:column;align-items:center;font-size:11px;color:var(--ink-soft);gap:2px"><input type="checkbox" class="sr-wd" value="'+idx+'">'+lbl+'</label>'; }).join('') +
        '</div></div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">' +
          '<div class="field"><label>Início</label><input class="input" type="time" id="sr-inicio" value="09:00"></div>' +
          '<div class="field"><label>Fim</label><input class="input" type="time" id="sr-fim" value="10:00"></div>' +
        '</div>' +
        '<div style="display:flex;gap:10px">' +
          '<button class="btn-primary sm" data-action="createScheduleRule">Salvar</button>' +
          '<button class="btn-ghost" data-action="toggleAddScheduleRule">Cancelar</button>' +
        '</div>' +
      '</div>';

  var sortedRules = sortedScheduleTemplate();
  var rulesList = sortedRules.length === 0
    ? '<p style="color:var(--ink-soft);font-size:13.5px;margin-bottom:26px">Nenhuma regra cadastrada.</p>'
    : '<div style="margin-bottom:26px">' + sortedRules.map(function(r, idx){
        return '<div class="admin-row rule-row">' +
          '<div class="rule-move">' +
            '<button type="button" data-action="moveRuleUp" data-ruleid="'+r.id+'" '+(idx===0?'disabled':'')+' aria-label="Mover para cima">▲</button>' +
            '<button type="button" data-action="moveRuleDown" data-ruleid="'+r.id+'" '+(idx===sortedRules.length-1?'disabled':'')+' aria-label="Mover para baixo">▼</button>' +
          '</div>' +
          '<select class="input" style="width:150px;height:36px" data-action="setRuleLocation" data-ruleid="'+r.id+'">'+locationSelectOptions(r.locationId)+'</select>' +
          ruleWeekdaysHtml(r) +
          '<input class="input" type="time" style="width:110px;height:36px" value="'+r.startTime+'" data-action="setRuleStart" data-ruleid="'+r.id+'">' +
          '<span style="color:var(--ink-soft);font-size:12px">até</span>' +
          '<input class="input" type="time" style="width:110px;height:36px" value="'+r.endTime+'" data-action="setRuleEnd" data-ruleid="'+r.id+'">' +
          '<button data-action="removeScheduleRule" data-ruleid="'+r.id+'" style="background:none;border:none;color:var(--ink-soft);margin-left:auto" aria-label="Remover regra">'+icon('trash',16)+'</button>' +
          '</div>';
      }).join('') + '</div>';

  var occurrences = generateAgendaAdmin(AGENDA_DAYS);
  var byDate = {}; var order = [];
  occurrences.forEach(function(o){
    if (!byDate[o.date]){ byDate[o.date] = { date:o.date, dateObj:o.dateObj, items:[] }; order.push(byDate[o.date]); }
    byDate[o.date].items.push(o);
  });
  var occHtml = order.length === 0 ? '<p style="color:var(--ink-soft);font-size:13.5px;margin-bottom:26px">Nenhuma ocorrência nos próximos '+AGENDA_DAYS+' dias.</p>' :
    '<div style="margin-bottom:26px">' + order.map(function(g){
      return '<div style="margin-bottom:12px">' +
        '<p style="font-weight:700;font-size:12.5px;color:var(--ink-soft);margin:0 0 6px">'+dateLabel(g.dateObj)+'</p>' +
        g.items.map(function(o){
          return '<div class="admin-row" style="'+(o.cancelled?'opacity:.55':'')+'">' +
            '<span style="font-size:13px;flex:1">'+esc(o.locationName)+' · '+o.startTime+'–'+o.endTime+(o.cancelled?' · cancelado':'')+'</span>' +
            '<button class="btn-ghost sm" data-action="toggleException" data-templateid="'+o.templateId+'" data-date="'+o.date+'">'+(o.cancelled?'Reativar':'Cancelar')+'</button>' +
          '</div>';
        }).join('') +
      '</div>';
    }).join('') + '</div>';

  var addExtraForm = !state.addingExtraSlot
    ? '<button class="btn-secondary sm" data-action="toggleAddExtraSlot" style="margin-bottom:18px">'+icon('plus',14)+' Adicionar horário avulso</button>'
    : '<div class="new-product-card">' +
        '<p style="font-weight:800;font-size:14.5px;margin:0 0 12px">Horário avulso</p>' +
        '<div class="field"><label>Local</label><select class="input" id="ex-local">'+locationSelectOptions(null)+'</select></div>' +
        '<div class="field"><label>Data</label><input class="input" type="date" id="ex-data" min="'+todayStr()+'"></div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">' +
          '<div class="field"><label>Início</label><input class="input" type="time" id="ex-inicio" value="09:00"></div>' +
          '<div class="field"><label>Fim</label><input class="input" type="time" id="ex-fim" value="10:00"></div>' +
        '</div>' +
        '<div style="display:flex;gap:10px">' +
          '<button class="btn-primary sm" data-action="createExtraSlot">Salvar</button>' +
          '<button class="btn-ghost" data-action="toggleAddExtraSlot">Cancelar</button>' +
        '</div>' +
      '</div>';
  var extrasList = (state.scheduleExtras||[]).length === 0
    ? '<p style="color:var(--ink-soft);font-size:13.5px">Nenhum horário avulso cadastrado.</p>'
    : state.scheduleExtras.map(function(ex){
        var loc = getLocation(ex.locationId);
        return '<div class="admin-row"><span style="font-size:13px;flex:1">'+dateLabel(new Date(ex.date+'T00:00:00'))+' · '+(loc?esc(loc.name):'')+' · '+ex.startTime+'–'+ex.endTime+'</span>' +
          '<button data-action="removeExtraSlot" data-extraid="'+ex.id+'" style="background:none;border:none;color:var(--ink-soft)" aria-label="Remover horário avulso">'+icon('trash',16)+'</button></div>';
      }).join('');

  return '<p style="font-weight:800;font-size:14.5px;margin:0 0 12px">Regras recorrentes</p>' +
    addRuleForm + rulesList +
    '<p style="font-weight:800;font-size:14.5px;margin:0 0 12px">Próximos '+AGENDA_DAYS+' dias</p>' +
    occHtml +
    '<p style="font-weight:800;font-size:14.5px;margin:0 0 12px">Horários avulsos</p>' +
    addExtraForm + extrasList;
}

/* ---------- admin: análises ---------- */
function computeAnalytics(){
  var orders = state.orders.filter(function(o){ return o.status !== 'cancelado'; });
  var totalRevenue = orders.reduce(function(s,o){ return s + Number(o.total||0); }, 0);
  var totalOrders = orders.length;
  var avgTicket = totalOrders ? totalRevenue/totalOrders : 0;

  var productMap = {};
  orders.forEach(function(o){ (o.items||[]).forEach(function(i){
    if (!productMap[i.name]) productMap[i.name] = { name:i.name, qty:0, revenue:0 };
    productMap[i.name].qty += Number(i.qty||0);
    productMap[i.name].revenue += Number(i.qty||0) * Number(i.price||0);
  }); });
  var topProducts = Object.keys(productMap).map(function(k){ return productMap[k]; }).sort(function(a,b){ return b.qty-a.qty; }).slice(0,6);

  var customerMap = {};
  orders.forEach(function(o){
    var key = (o.telefone || o.nome || '').trim();
    if (!key) return;
    if (!customerMap[key]) customerMap[key] = { nome:o.nome, telefone:o.telefone, total:0, count:0 };
    customerMap[key].total += Number(o.total||0);
    customerMap[key].count += 1;
  });
  var topCustomers = Object.keys(customerMap).map(function(k){ return customerMap[k]; }).sort(function(a,b){ return b.total-a.total; }).slice(0,6);

  var locMap = {};
  orders.forEach(function(o){
    var key = o.local || 'Sem local';
    if (!locMap[key]) locMap[key] = { name:key, revenue:0, count:0 };
    locMap[key].revenue += Number(o.total||0);
    locMap[key].count += 1;
  });
  var byLocation = Object.keys(locMap).map(function(k){ return locMap[k]; }).sort(function(a,b){ return b.revenue-a.revenue; });

  var wdMap = {};
  orders.forEach(function(o){
    var dstr = o.pickupDate || o.data; if (!dstr) return;
    var wd = new Date(dstr+'T00:00:00').getDay();
    wdMap[wd] = (wdMap[wd]||0) + Number(o.total||0);
  });
  var byWeekday = WEEKDAY_LABELS.map(function(lbl,idx){ return { label:lbl, revenue: wdMap[idx]||0 }; });

  return { totalRevenue:totalRevenue, totalOrders:totalOrders, avgTicket:avgTicket, topProducts:topProducts, topCustomers:topCustomers, byLocation:byLocation, byWeekday:byWeekday };
}
function statTile(label, value, iconName){
  return '<div class="stat-tile">' + icon(iconName,20,'var(--primary-dark)') +
    '<p class="stat-tile-value">'+value+'</p><p class="stat-tile-label">'+esc(label)+'</p></div>';
}
function barRow(label, valueLabel, pct){
  return '<div class="bar-row">' +
    '<div class="bar-row-label">'+esc(label)+'</div>' +
    '<div class="bar-track"><div class="bar-fill" style="width:'+pct+'%"></div></div>' +
    '<div class="bar-row-value">'+valueLabel+'</div>' +
  '</div>';
}
function pageAdminAnalyticsBody(){
  var a = computeAnalytics();
  var statTiles = '<div class="stat-grid">' +
    statTile('Faturamento', currency(a.totalRevenue), 'chart') +
    statTile('Pedidos', a.totalOrders, 'clipboard') +
    statTile('Ticket médio', currency(a.avgTicket), 'bag') +
    '</div>';

  var maxProdQty = Math.max.apply(null, a.topProducts.map(function(p){ return p.qty; }).concat([1]));
  var productsHtml = a.topProducts.length === 0 ? '<p style="color:var(--ink-soft);font-size:13.5px">Sem dados ainda.</p>' :
    a.topProducts.map(function(p){ return barRow(p.name, p.qty+' un · '+currency(p.revenue), Math.round(p.qty/maxProdQty*100)); }).join('');

  var maxCustomer = Math.max.apply(null, a.topCustomers.map(function(c){ return c.total; }).concat([1]));
  var customersHtml = a.topCustomers.length === 0 ? '<p style="color:var(--ink-soft);font-size:13.5px">Sem dados ainda.</p>' :
    a.topCustomers.map(function(c){ return barRow((c.nome||'Cliente')+' · '+(c.telefone||''), c.count+' pedidos · '+currency(c.total), Math.round(c.total/maxCustomer*100)); }).join('');

  var maxLoc = Math.max.apply(null, a.byLocation.map(function(l){ return l.revenue; }).concat([1]));
  var locHtml = a.byLocation.length === 0 ? '<p style="color:var(--ink-soft);font-size:13.5px">Sem dados ainda.</p>' :
    a.byLocation.map(function(l){ return barRow(l.name, l.count+' pedidos · '+currency(l.revenue), Math.round(l.revenue/maxLoc*100)); }).join('');

  var maxWd = Math.max.apply(null, a.byWeekday.map(function(w){ return w.revenue; }).concat([1]));
  var wdHtml = a.byWeekday.map(function(w){ return barRow(w.label, currency(w.revenue), Math.round(w.revenue/maxWd*100)); }).join('');

  function panel(title, iconName, bodyHtml){
    return '<div class="dash-panel"><p class="dash-panel-title">'+icon(iconName,15,'var(--primary-dark)')+' '+title+'</p>' + bodyHtml + '</div>';
  }

  return statTiles +
    '<div class="dash-grid">' +
      panel('Produtos mais vendidos', 'treat', productsHtml) +
      panel('Clientes que mais compram', 'heart', customersHtml) +
      panel('Faturamento por local', 'mapPin', locHtml) +
      panel('Faturamento por dia da semana', 'calendar', wdHtml) +
    '</div>';
}

function pageAdmin(){ if (FIREBASE_READY && !state.authUser) return pageAdminLogin(); return pageAdminPanel(); }

/* ---------- DOM morphing (avoids full teardown/repaint "flash" on every render) ---------- */
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

  morphSyncAttrs(oldNode, newNode);
  var tag = oldNode.tagName;
  var focused = document.activeElement === oldNode;

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

/* ---------- main render ---------- */
function render(){
  var content = state.page === 'admin' ? pageAdmin() : sectionHero() + sectionProdutos() + sectionLocalizacao() + sectionContato();
  var html = renderHeader() + '<main>' + content + '</main>' + renderFooter() + renderModal() + (state.confirmOpen ? renderConfirm() : '') + renderDeleteLocationModal();
  morphInto(document.getElementById('app'), html);
}

/* ---------- actions ---------- */
function go(page){ state.page = page; state.menuOpen = false; state.authError = ''; render(); window.scrollTo({top:0}); }
function openModal(){ if (cartCount() === 0) return; state.modalOpen = true; state.orderModalLocationId = null; state.orderModalDate = null; render(); }
function closeModal(){ state.modalOpen = false; state.orderModalLocationId = null; state.orderModalDate = null; render(); }

document.addEventListener('click', function(e){
  var stopEl = e.target.closest('[data-stop]');
  var overlay = e.target.closest('[data-action="closeModalBg"], [data-action="closeConfirmBg"], [data-action="closeDeleteLocationBg"]');
  if (overlay && !stopEl){
    if (overlay.dataset.action === 'closeModalBg') closeModal();
    else if (overlay.dataset.action === 'closeDeleteLocationBg') { state.confirmDeleteLocationId = null; render(); }
    else { state.confirmOpen = false; render(); }
    return;
  }
  var el = e.target.closest('[data-action]');
  if (!el) return;
  var action = el.dataset.action;

  if (action === 'go') { e.preventDefault(); go(el.dataset.page); }
  else if (action === 'openModal') openModal();
  else if (action === 'closeModal') closeModal();
  else if (action === 'closeConfirm') { state.confirmOpen = false; render(); }
  else if (action === 'toggleMenu') { state.menuOpen = !state.menuOpen; render(); }
  else if (action === 'closeMenu') { state.menuOpen = false; render(); }
  else if (action === 'adminTab') { state.adminTab = el.dataset.tab; render(); }
  else if (action === 'logout') { if (fbAuth) fbAuth.signOut(); }
  else if (action === 'toggleAddProduct') { state.addingProduct = !state.addingProduct; render(); }
  else if (action === 'createProduct') {
    var nome = document.getElementById('np-nome').value.trim();
    if (!nome) { alert('Informe o nome do produto.'); return; }
    var newProd = {
      id: 'p' + Date.now(),
      name: nome,
      desc: document.getElementById('np-desc').value.trim(),
      ingredients: document.getElementById('np-ing').value.trim(),
      price: Number(document.getElementById('np-preco').value) || 0,
      stock: Number(document.getElementById('np-estoque').value) || 0,
      available: true,
      photo: null
    };
    state.products.push(newProd);
    dbSet('products/' + newProd.id, newProd);
    state.addingProduct = false;
    render();
    var file = document.getElementById('np-imagem').files[0];
    if (file){
      uploadToStorage('products/' + newProd.id + '-' + Date.now() + '-' + file.name, file, function(url){
        if (url){ newProd.photo = url; dbSet('products/' + newProd.id + '/photo', url); render(); }
      });
    }
  }
  else if (action === 'toggleAddLocation') { state.addingLocation = !state.addingLocation; render(); }
  else if (action === 'createLocation') {
    var lnome = document.getElementById('nl-nome').value.trim();
    if (!lnome) { alert('Informe o nome da localização.'); return; }
    var newLoc = {
      id: 'loc' + Date.now(),
      name: lnome,
      address: document.getElementById('nl-endereco').value.trim(),
      mapImage: null,
      pin: null,
      ordersOnly: false
    };
    state.locations.push(newLoc);
    dbSet('locations/' + newLoc.id, newLoc);
    state.addingLocation = false;
    render();
  }
  else if (action === 'removeLocation') {
    state.confirmDeleteLocationId = el.dataset.locid;
    render();
  }
  else if (action === 'cancelDeleteLocation') { state.confirmDeleteLocationId = null; render(); }
  else if (action === 'confirmDeleteLocation') {
    var lrid = state.confirmDeleteLocationId;
    if (lrid){
      state.locations = state.locations.filter(function(x){ return x.id !== lrid; });
      state.scheduleTemplate.filter(function(r){ return r.locationId === lrid; }).forEach(function(r){ dbRemove('scheduleTemplate/'+r.id); });
      state.scheduleTemplate = state.scheduleTemplate.filter(function(r){ return r.locationId !== lrid; });
      state.scheduleExtras.filter(function(x){ return x.locationId === lrid; }).forEach(function(x){ dbRemove('scheduleExtras/'+x.id); });
      state.scheduleExtras = state.scheduleExtras.filter(function(x){ return x.locationId !== lrid; });
      dbRemove('locations/' + lrid);
    }
    state.confirmDeleteLocationId = null;
    render();
  }
  else if (action === 'toggleProduced') {
    var op = state.orders.find(function(x){ return x.id === el.dataset.id; });
    if (op) { op.produced = !op.produced; dbSet('orders/'+op.id+'/produced', op.produced); }
    render();
  }
  else if (action === 'cartInc') {
    var p = getProduct(el.dataset.id);
    if (p && isOrderable(p)) {
      var maxStock = (p.stock === undefined || p.stock === null) ? Infinity : Number(p.stock);
      var cur = state.cart[p.id] || 0;
      if (cur < maxStock) state.cart[p.id] = cur + 1;
    }
    render();
  }
  else if (action === 'cartDec') { var id = el.dataset.id; state.cart[id] = Math.max(0, (state.cart[id] || 0) - 1); render(); }
  else if (action === 'toggleAvailable') { var pa = getProduct(el.dataset.id); if (pa) { pa.available = pa.available === false ? true : false; dbSet('products/'+pa.id+'/available', pa.available); } render(); }
  else if (action === 'removeProduct') { var rid = el.dataset.id; state.products = state.products.filter(function(x){ return x.id !== rid; }); dbRemove('products/'+rid); render(); }
  else if (action === 'mapClick') {
    var loc = getLocation(el.dataset.locid);
    var rect = el.getBoundingClientRect();
    var xPct = ((e.clientX - rect.left) / rect.width) * 100;
    var yPct = ((e.clientY - rect.top) / rect.height) * 100;
    if (loc) { loc.pin = { x: Math.round(xPct*10)/10, y: Math.round(yPct*10)/10, label: (loc.pin && loc.pin.label) || '' }; dbSet('locations/'+loc.id+'/pin', loc.pin); }
    render();
  }
  else if (action === 'removePin') { var locr = getLocation(el.dataset.locid); if (locr) { locr.pin = null; dbSet('locations/'+locr.id+'/pin', null); } render(); }
  else if (action === 'toggleAddScheduleRule') { state.addingScheduleRule = !state.addingScheduleRule; render(); }
  else if (action === 'createScheduleRule') {
    var srLoc = document.getElementById('sr-local').value;
    var srWd = Array.prototype.slice.call(document.querySelectorAll('.sr-wd:checked')).map(function(cb){ return Number(cb.value); });
    var srStart = document.getElementById('sr-inicio').value;
    var srEnd = document.getElementById('sr-fim').value;
    if (!srLoc || srWd.length === 0 || !srStart || !srEnd){ alert('Selecione local, ao menos um dia da semana e horário.'); return; }
    var maxOrder = state.scheduleTemplate.reduce(function(m,r){ return Math.max(m, r.order||0); }, -1);
    var newRule = { id:'sch'+Date.now(), locationId:srLoc, weekdays:srWd, startTime:srStart, endTime:srEnd, order: maxOrder+1 };
    state.scheduleTemplate.push(newRule);
    dbSet('scheduleTemplate/'+newRule.id, newRule);
    state.addingScheduleRule = false;
    render();
  }
  else if (action === 'removeScheduleRule') {
    var srid = el.dataset.ruleid;
    state.scheduleTemplate = state.scheduleTemplate.filter(function(r){ return r.id !== srid; });
    dbRemove('scheduleTemplate/'+srid);
    render();
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
      var idx = rule.weekdays.indexOf(wd);
      if (idx === -1) rule.weekdays.push(wd); else rule.weekdays.splice(idx,1);
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
      var newEx = { id: exId, templateId: tid, date: exDate };
      state.scheduleExceptions.push(newEx);
      dbSet('scheduleExceptions/'+exId, newEx);
    }
    render();
  }
  else if (action === 'toggleAddExtraSlot') { state.addingExtraSlot = !state.addingExtraSlot; render(); }
  else if (action === 'createExtraSlot') {
    var exLoc = document.getElementById('ex-local').value;
    var exData = document.getElementById('ex-data').value;
    var exStart = document.getElementById('ex-inicio').value;
    var exEnd = document.getElementById('ex-fim').value;
    if (!exLoc || !exData || !exStart || !exEnd){ alert('Preencha local, data e horário.'); return; }
    var newExtra = { id:'extra'+Date.now(), locationId:exLoc, date:exData, startTime:exStart, endTime:exEnd };
    state.scheduleExtras.push(newExtra);
    dbSet('scheduleExtras/'+newExtra.id, newExtra);
    state.addingExtraSlot = false;
    render();
  }
  else if (action === 'removeExtraSlot') {
    var exid = el.dataset.extraid;
    state.scheduleExtras = state.scheduleExtras.filter(function(x){ return x.id !== exid; });
    dbRemove('scheduleExtras/'+exid);
    render();
  }
  else if (action === 'dismissReminder') {
    var did = el.dataset.id;
    state.adminReminders = state.adminReminders.filter(function(o){ return o.id !== did; });
    render();
  }
  else if (action === 'enableNotifications') {
    if (typeof Notification === 'undefined') return;
    Notification.requestPermission().then(function(perm){ state.notifPermission = perm; render(); });
  }
});

document.addEventListener('change', function(e){
  var el = e.target.closest('[data-action]');
  if (!el) return;
  var action = el.dataset.action;
  if (action === 'selectOrderLocation') { state.orderModalLocationId = el.value; state.orderModalDate = null; render(); }
  else if (action === 'selectOrderDate') { state.orderModalDate = el.value; render(); }
  else if (action === 'setPrice') { var p = getProduct(el.dataset.id); if (p) { p.price = Number(el.value) || 0; dbSet('products/'+p.id+'/price', p.price); } }
  else if (action === 'setStock') { var ps = getProduct(el.dataset.id); if (ps) { ps.stock = Number(el.value) || 0; dbSet('products/'+ps.id+'/stock', ps.stock); render(); } }
  else if (action === 'setName') { var pn = getProduct(el.dataset.id); if (pn) { pn.name = el.value; dbSet('products/'+pn.id+'/name', pn.name); } }
  else if (action === 'setDesc') { var pd = getProduct(el.dataset.id); if (pd) { pd.desc = el.value; dbSet('products/'+pd.id+'/desc', pd.desc); } }
  else if (action === 'setIngredients') { var pi = getProduct(el.dataset.id); if (pi) { pi.ingredients = el.value; dbSet('products/'+pi.id+'/ingredients', pi.ingredients); } }
  else if (action === 'setOrderStatus') { var o = state.orders.find(function(x){ return x.id === el.dataset.id; }); if (o) { o.status = el.value; dbSet('orders/'+o.id+'/status', o.status); } }
  else if (action === 'setLocName') { var locn = getLocation(el.dataset.locid); if (locn) { locn.name = el.value; dbSet('locations/'+locn.id+'/name', locn.name); } render(); }
  else if (action === 'setLocAddress') { var loca = getLocation(el.dataset.locid); if (loca) { loca.address = el.value; dbSet('locations/'+loca.id+'/address', loca.address); } }
  else if (action === 'setPinLabel') { var locl = getLocation(el.dataset.locid); if (locl && locl.pin) { locl.pin.label = el.value; dbSet('locations/'+locl.id+'/pin', locl.pin); } }
  else if (action === 'toggleOrdersOnly') { var loco = getLocation(el.dataset.locid); if (loco) { loco.ordersOnly = el.checked; dbSet('locations/'+loco.id+'/ordersOnly', loco.ordersOnly); } render(); }
  else if (action === 'setRuleLocation') { var ruleL = getScheduleRule(el.dataset.ruleid); if (ruleL) { ruleL.locationId = el.value; dbSet('scheduleTemplate/'+ruleL.id+'/locationId', ruleL.locationId); } render(); }
  else if (action === 'setRuleStart') { var ruleS = getScheduleRule(el.dataset.ruleid); if (ruleS) { ruleS.startTime = el.value; dbSet('scheduleTemplate/'+ruleS.id+'/startTime', ruleS.startTime); } render(); }
  else if (action === 'setRuleEnd') { var ruleE = getScheduleRule(el.dataset.ruleid); if (ruleE) { ruleE.endTime = el.value; dbSet('scheduleTemplate/'+ruleE.id+'/endTime', ruleE.endTime); } render(); }
  else if (action === 'uploadMap') {
    var locid = el.dataset.locid; var file = el.files && el.files[0]; if (!file) return;
    uploadToStorage('locations/' + locid + '-' + Date.now() + '-' + file.name, file, function(url){
      if (!url) { alert('Falha ao enviar a imagem.'); return; }
      var loc = getLocation(locid); if (loc) { loc.mapImage = url; dbSet('locations/'+loc.id+'/mapImage', url); }
      render();
    });
  }
  else if (action === 'uploadProductPhoto') {
    var pid = el.dataset.id; var pf = el.files && el.files[0]; if (!pf) return;
    uploadToStorage('products/' + pid + '-' + Date.now() + '-' + pf.name, pf, function(url){
      if (!url) { alert('Falha ao enviar a imagem.'); return; }
      var p = getProduct(pid); if (p) { p.photo = url; dbSet('products/'+p.id+'/photo', url); }
      render();
    });
  }
});

document.addEventListener('submit', function(e){
  var loginForm = e.target.closest('[data-action="loginForm"]');
  if (loginForm){
    e.preventDefault();
    var email = document.getElementById('login-email').value.trim();
    var senha = document.getElementById('login-senha').value;
    if (!fbAuth){ state.authError = 'Firebase não está configurado.'; render(); return; }
    fbAuth.signInWithEmailAndPassword(email, senha).then(function(){ state.authError = ''; render(); })
      .catch(function(){ state.authError = 'E-mail ou senha incorretos.'; render(); });
    return;
  }
  var form = e.target.closest('[data-action="submitOrderForm"]');
  if (!form) return;
  e.preventDefault();
  var errorEl = document.getElementById('formError');
  errorEl.textContent = '';
  var items = cartItems();
  if (items.length === 0){ errorEl.textContent = 'Seu carrinho está vazio. Adicione ao menos um produto.'; return; }

  var nome = document.getElementById('f-nome').value.trim();
  var telefone = document.getElementById('f-telefone').value.trim();
  var slotEl = document.getElementById('f-slot');
  var slotId = slotEl ? slotEl.value : '';
  var observacoes = document.getElementById('f-observacoes').value.trim();
  if (!nome || !telefone || !slotId){ errorEl.textContent = 'Preencha nome, telefone e escolha um horário de retirada.'; return; }

  var slot = findAgendaSlot(slotId, AGENDA_DAYS);
  if (!slot){ errorEl.textContent = 'Esse horário não está mais disponível. Escolha outro.'; return; }

  var order = {
    id: String(Date.now()), nome: nome, telefone: telefone,
    local: slot.locationName, data: slot.date, horario: slot.startTime+'–'+slot.endTime,
    pickupDate: slot.date, pickupStart: slot.startTime, pickupEnd: slot.endTime, slotId: slot.id,
    observacoes: observacoes,
    items: items.map(function(i){ return { name: i.product.name, qty: i.qty, price: i.product.price }; }),
    total: cartTotal(), status: 'pendente', produced: false
  };
  state.orders.unshift(order);
  dbPushOrder(order);
  items.forEach(function(i){
    var p = getProduct(i.product.id);
    if (p && p.stock !== undefined && p.stock !== null){ p.stock = Math.max(0, Number(p.stock) - i.qty); dbSet('products/'+p.id+'/stock', p.stock); }
  });
  state.cart = {};
  state.modalOpen = false;
  state.orderModalLocationId = null;
  state.orderModalDate = null;
  state.confirmOpen = true;
  render();
});

upgradeBrandAssets();
initFirebaseSync();
seedFirebaseIfEmpty();
render();
setInterval(checkPickupReminders, 20000);
checkPickupReminders();
