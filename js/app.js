/* =========================================================
   FIREBASE
========================================================= */
var firebaseConfig = {
  apiKey: "AIzaSyDOQZJQiltlQKIIIiYki_JQinAV4lX0m3E",
  authDomain: "fb-general-stores.firebaseapp.com",
  projectId: "fb-general-stores",
  storageBucket: "fb-general-stores.firebasestorage.app",
  messagingSenderId: "780236289961",
  appId: "1:780236289961:web:c4d6ce274d49645d84b6b8"
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
  fbDb = firebase.firestore();
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
    x:'<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
    coin:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9.3c.3-1 1.2-1.5 2.5-1.5 1.6 0 2.8.8 2.8 2 0 1.5-1.4 1.8-2.8 2.2-1.4.4-2.8.8-2.8 2.3 0 1.2 1.2 2 2.8 2 1.3 0 2.2-.5 2.5-1.5"/><line x1="12" y1="6" x2="12" y2="7.8"/><line x1="12" y1="16.2" x2="12" y2="18"/>'
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
  financeTab: 'ingredientes',
  addingProduct: false,
  addingLocation: false,
  addingScheduleRule: false,
  addingExtraSlot: false,
  addingIngredient: false,
  addingPackaging: false,
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
  ingredients: [],
  packagingItems: [],
  financialGoals: { monthlyGoal: 0, daysPerWeek: 6, includeTax: true, meiMonthlyFee: 76.90 },
  priceChangeModal: null,
  historySelectedKeys: null,
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
function getIngredient(id){ return state.ingredients.find(function(x){ return x.id === id; }); }
function getPackagingItem(id){ return state.packagingItems.find(function(x){ return x.id === id; }); }

/* ---------- financeiro: custos, receitas e metas de venda ---------- */
function itemUnitCost(item){
  var qty = Number(item && item.packageQty) || 0;
  return qty > 0 ? Number(item.packagePrice || 0) / qty : 0;
}
function itemUnitCostDisplay(item){
  var unitCost = itemUnitCost(item);
  if (item.unit === 'g') return { label: 'Kg', value: unitCost * 1000 };
  if (item.unit === 'ml') return { label: 'L', value: unitCost * 1000 };
  return { label: 'un', value: unitCost };
}
function ensureRecipe(p){
  if (!p.recipe) p.recipe = { yieldQty: 1, unitsPerPackage: 1, ingredientUsage: [], packagingUsage: [] };
  if (!p.recipe.ingredientUsage) p.recipe.ingredientUsage = [];
  if (!p.recipe.packagingUsage) p.recipe.packagingUsage = [];
  return p.recipe;
}
function recipeCosts(p){
  var r = ensureRecipe(p);
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
  var finalCostPerUnit = costPerUnit + packagingPerUnit;
  var finalCostPerPackage = finalCostPerUnit * unitsPerPackage;
  var sellPrice = Number(p.price) || 0;
  var profit = sellPrice - finalCostPerPackage;
  var marginPct = sellPrice > 0 ? (profit / sellPrice) * 100 : 0;
  return {
    ingredientTotal: ingredientTotal, yieldQty: yieldQty, costPerUnit: costPerUnit,
    packagingPerUnit: packagingPerUnit, unitsPerPackage: unitsPerPackage,
    finalCostPerUnit: finalCostPerUnit, finalCostPerPackage: finalCostPerPackage,
    sellPrice: sellPrice, profit: profit, marginPct: marginPct
  };
}
var WEEKS_PER_MONTH = 4.345;
function computeSalesGoals(){
  var g = state.financialGoals || {};
  var monthlyGoal = Number(g.monthlyGoal) || 0;
  var daysPerWeek = Number(g.daysPerWeek) || 0;
  var meiMonthlyFee = Number(g.meiMonthlyFee) || 0;
  return state.products.map(function(p){
    var c = recipeCosts(p);
    function scenarioFor(targetProfit){
      var unitsMonth = c.profit > 0 ? Math.ceil(targetProfit / c.profit) : null;
      var unitsWeek = (unitsMonth != null) ? Math.ceil(unitsMonth / WEEKS_PER_MONTH) : null;
      var unitsDay = (unitsWeek != null && daysPerWeek > 0) ? Math.ceil(unitsWeek / daysPerWeek) : null;
      return { targetProfit: targetProfit, unitsMonth: unitsMonth, unitsWeek: unitsWeek, unitsDay: unitsDay };
    }
    var scenarios = [true, false].map(function(withTax){
      var s = scenarioFor(monthlyGoal + (withTax ? meiMonthlyFee : 0));
      s.withTax = withTax;
      return s;
    });
    var breakeven = scenarioFor(meiMonthlyFee);
    return { product: p, costs: c, scenarios: scenarios, breakeven: breakeven };
  });
}
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
  authGatedUnsubs.push(syncCollection('orders', function(val){
    state.orders = objToArray(val).sort(function(a,b){ return Number(b.id) - Number(a.id); });
    if (state.page === 'admin') render();
  }));
  authGatedUnsubs.push(syncCollection('ingredients', function(val){ state.ingredients = objToArray(val); render(); }));
  authGatedUnsubs.push(syncCollection('packagingItems', function(val){ state.packagingItems = objToArray(val); render(); }));
  authGatedUnsubs.push(syncDoc('settings', 'financeGoals', function(val){ if (val) state.financialGoals = val; render(); }));
}
function detachAuthGatedSync(){
  authGatedUnsubs.forEach(function(unsub){ unsub(); });
  authGatedUnsubs = [];
}
function initFirebaseSync(){
  if (!FIREBASE_READY) return;
  syncCollection('products', function(val){ if (Object.keys(val).length) { state.products = objToArray(val); render(); } });
  syncCollection('locations', function(val){ if (Object.keys(val).length) { state.locations = objToArray(val); render(); } });
  syncCollection('scheduleTemplate', function(val){ if (Object.keys(val).length) { state.scheduleTemplate = objToArray(val); render(); } });
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
  });
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
  if (!FIREBASE_READY) return;
  var p = splitDbPath(path);
  var docRef = coll(p.collection).doc(p.id);
  var write = p.field ? docRef.set(makeObjectAt(p.field, value), { merge: true }) : docRef.set(value);
  write.catch(function(e){ console.error(e); });
}
function makeObjectAt(field, value){ var obj = {}; obj[field] = value; return obj; }
function dbRemove(path){
  if (!FIREBASE_READY) return;
  var p = splitDbPath(path);
  var docRef = coll(p.collection).doc(p.id);
  var write = p.field ? docRef.update(makeObjectAt(p.field, firebase.firestore.FieldValue.delete())) : docRef.delete();
  write.catch(function(e){ console.error(e); });
}
function dbPushOrder(order){ if (FIREBASE_READY) coll('orders').doc(order.id).set(order).catch(function(e){ console.error(e); }); }

/* ---------- image upload: stored as base64 directly in Realtime Database (no Storage needed) ---------- */
function uploadToStorage(path, file, onDone){
  if (!file){ onDone(null); return; }
  if (file.size > 2 * 1024 * 1024){ alert('Imagem muito grande (máx. 2MB). Escolha uma imagem menor.'); onDone(null); return; }
  var reader = new FileReader();
  reader.onload = function(){ onDone(reader.result); };
  reader.onerror = function(){ onDone(null); };
  reader.readAsDataURL(file);
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

function renderPriceChangeModal(){
  var m = state.priceChangeModal;
  if (!m) return '';
  var item = m.kind === 'ingredient' ? getIngredient(m.id) : getPackagingItem(m.id);
  var name = item ? item.name : '';
  return '<div class="modal-overlay" data-action="closePriceChangeBg"><div class="modal" style="text-align:center" data-stop="1">' +
    '<div style="width:60px;height:60px;border-radius:50%;background:var(--lilac-soft);display:flex;align-items:center;justify-content:center;margin:0 auto 18px">' + icon('coin',26,'var(--primary-dark)') + '</div>' +
    '<h2 style="font-size:20px;margin:0 0 10px">Atualizar preço — '+esc(name)+'</h2>' +
    '<div style="display:flex;justify-content:space-between;padding:0 8px;margin-bottom:6px"><span style="color:var(--ink-soft);font-size:13px">Preço antigo</span><strong>'+currency(m.oldPrice)+'</strong></div>' +
    '<div style="display:flex;justify-content:space-between;padding:0 8px;margin-bottom:16px"><span style="color:var(--ink-soft);font-size:13px">Novo preço</span><strong>'+currency(m.newPrice)+'</strong></div>' +
    '<p style="font-size:12.5px;color:var(--ink-soft);margin:0 0 18px">Salvar o novo preço registra essa mudança no histórico do item.</p>' +
    '<div style="display:flex;gap:10px">' +
      '<button class="btn-secondary" data-action="cancelPriceChange" style="flex:1;justify-content:center">Cancelar</button>' +
      '<button class="btn-primary" data-action="confirmPriceChange" style="flex:1;justify-content:center">Salvar novo preço</button>' +
    '</div></div></div>';
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
  var tabs = [['produtos','Produtos','package'],['encomendas','Encomendas','clipboard'],['agenda','Agenda','calendar'],['local','Locais','mapPin'],['analises','Análises','chart'],['financeiro','Financeiro','coin']];
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
        labeledField('Nome', '<input class="input" style="height:36px" value="'+esc(p.name)+'" data-action="setName" data-id="'+p.id+'">', 'flex:1 1 140px') +
        labeledField('Preço', '<input class="input" type="number" step="0.5" value="'+p.price+'" style="width:88px;height:34px" data-action="setPrice" data-id="'+p.id+'">') +
        labeledField('Estoque', '<input class="input" type="number" step="1" value="'+(p.stock===undefined?'':p.stock)+'" style="width:78px;height:34px" data-action="setStock" data-id="'+p.id+'">') +
        '<button class="avail-toggle '+(p.available!==false?'avail-on':'avail-off')+'" data-action="toggleAvailable" data-id="'+p.id+'" style="align-self:center">'+(p.available!==false?'Disponível':'Indisponível')+'</button>' +
        '<button data-action="removeProduct" data-id="'+p.id+'" style="background:none;border:none;color:var(--ink-soft);align-self:center" aria-label="Remover produto">'+icon('trash',16)+'</button>' +
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
  } else if (tab === 'financeiro'){
    body = pageAdminFinanceBody();
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

/* ---------- admin: financeiro (custos, receitas, metas de venda) ---------- */
function labeledField(label, innerHtml, extraStyle){
  return '<div style="display:flex;flex-direction:column;gap:2px'+(extraStyle?';'+extraStyle:'')+'"><label class="hint" style="margin:0">'+label+'</label>'+innerHtml+'</div>';
}
function ingredientRow(item){
  var d = itemUnitCostDisplay(item);
  return '<div class="admin-row">' +
    labeledField('Nome', '<input class="input" style="height:36px" value="'+esc(item.name)+'" data-action="setIngredientName" data-ingid="'+item.id+'">', 'flex:1 1 140px') +
    labeledField('Preço do pote (R$)', '<input class="input" type="number" step="0.01" value="'+(item.packagePrice||0)+'" style="width:100px;height:34px" data-action="setIngredientPrice" data-ingid="'+item.id+'">') +
    labeledField('Qtd. do pote', '<input class="input" type="number" step="0.01" value="'+(item.packageQty||0)+'" style="width:90px;height:34px" data-action="setIngredientQty" data-ingid="'+item.id+'">') +
    labeledField('Unidade', '<select class="input" style="width:80px;height:36px" data-action="setIngredientUnit" data-ingid="'+item.id+'">' +
      ['g','ml','un'].map(function(u){ return '<option value="'+u+'"'+(item.unit===u?' selected':'')+'>'+u+'</option>'; }).join('') +
    '</select>') +
    labeledField('Custo/'+d.label, '<div style="font-size:14px;font-weight:700;padding-top:6px">'+currency(d.value)+'</div>', 'min-width:100px') +
    '<button data-action="removeIngredient" data-ingid="'+item.id+'" style="background:none;border:none;color:var(--ink-soft);margin-left:auto;align-self:center" aria-label="Remover ingrediente">'+icon('trash',16)+'</button>' +
    '</div>';
}
function packagingRow(item){
  var d = itemUnitCostDisplay(item);
  return '<div class="admin-row">' +
    labeledField('Nome', '<input class="input" style="height:36px" value="'+esc(item.name)+'" data-action="setPackagingName" data-packid="'+item.id+'">', 'flex:1 1 140px') +
    labeledField('Preço do pacote (R$)', '<input class="input" type="number" step="0.01" value="'+(item.packagePrice||0)+'" style="width:100px;height:34px" data-action="setPackagingPrice" data-packid="'+item.id+'">') +
    labeledField('Qtd. no pacote', '<input class="input" type="number" step="0.01" value="'+(item.packageQty||0)+'" style="width:90px;height:34px" data-action="setPackagingQty" data-packid="'+item.id+'">') +
    labeledField('Unidade', '<select class="input" style="width:80px;height:36px" data-action="setPackagingUnit" data-packid="'+item.id+'">' +
      ['un','g','ml'].map(function(u){ return '<option value="'+u+'"'+(item.unit===u?' selected':'')+'>'+u+'</option>'; }).join('') +
    '</select>') +
    labeledField('Custo/'+d.label, '<div style="font-size:14px;font-weight:700;padding-top:6px">'+currency(d.value)+'</div>', 'min-width:100px') +
    '<button data-action="removePackaging" data-packid="'+item.id+'" style="background:none;border:none;color:var(--ink-soft);margin-left:auto;align-self:center" aria-label="Remover embalagem">'+icon('trash',16)+'</button>' +
    '</div>';
}
function pageAdminFinanceIngredientsBody(){
  var addForm = !state.addingIngredient
    ? '<button class="btn-secondary sm" data-action="toggleAddIngredient" style="margin-bottom:18px">'+icon('plus',14)+' Adicionar ingrediente</button>'
    : '<div class="new-product-card">' +
        '<p style="font-weight:800;font-size:14.5px;margin:0 0 12px">Novo ingrediente</p>' +
        '<div class="field"><label>Nome</label><input class="input" id="ni-nome" placeholder="Ex: Chocolate belga 54%"></div>' +
        '<div class="fin-grid-3">' +
          '<div class="field"><label>Preço do pote (R$)</label><input class="input" id="ni-preco" type="number" step="0.01" value="0"></div>' +
          '<div class="field"><label>Qtd. do pote</label><input class="input" id="ni-qtd" type="number" step="0.01" value="1"></div>' +
          '<div class="field"><label>Unidade</label><select class="input" id="ni-unidade"><option value="g">g</option><option value="ml">ml</option><option value="un">un</option></select></div>' +
        '</div>' +
        '<div style="display:flex;gap:10px">' +
          '<button class="btn-primary sm" data-action="createIngredient">Salvar</button>' +
          '<button class="btn-ghost" data-action="toggleAddIngredient">Cancelar</button>' +
        '</div>' +
      '</div>';
  var list = state.ingredients.length === 0
    ? '<p style="color:var(--ink-soft);font-size:13.5px">Nenhum ingrediente cadastrado ainda.</p>'
    : state.ingredients.map(ingredientRow).join('');
  return addForm + list;
}
function pageAdminFinancePackagingBody(){
  var addForm = !state.addingPackaging
    ? '<button class="btn-secondary sm" data-action="toggleAddPackaging" style="margin-bottom:18px">'+icon('plus',14)+' Adicionar embalagem</button>'
    : '<div class="new-product-card">' +
        '<p style="font-weight:800;font-size:14.5px;margin:0 0 12px">Nova embalagem</p>' +
        '<div class="field"><label>Nome</label><input class="input" id="np2-nome" placeholder="Ex: Saquinho celofane"></div>' +
        '<div class="fin-grid-3">' +
          '<div class="field"><label>Preço do pacote (R$)</label><input class="input" id="np2-preco" type="number" step="0.01" value="0"></div>' +
          '<div class="field"><label>Qtd. no pacote</label><input class="input" id="np2-qtd" type="number" step="0.01" value="1"></div>' +
          '<div class="field"><label>Unidade</label><select class="input" id="np2-unidade"><option value="un">un</option><option value="g">g</option><option value="ml">ml</option></select></div>' +
        '</div>' +
        '<div style="display:flex;gap:10px">' +
          '<button class="btn-primary sm" data-action="createPackaging">Salvar</button>' +
          '<button class="btn-ghost" data-action="toggleAddPackaging">Cancelar</button>' +
        '</div>' +
      '</div>';
  var list = state.packagingItems.length === 0
    ? '<p style="color:var(--ink-soft);font-size:13.5px">Nenhuma embalagem cadastrada ainda.</p>'
    : state.packagingItems.map(packagingRow).join('');
  return addForm + list;
}
function ingredientUsageOptions(selectedId){
  return state.ingredients.map(function(i){ return '<option value="'+i.id+'"'+(i.id===selectedId?' selected':'')+'>'+esc(i.name)+'</option>'; }).join('');
}
function packagingUsageOptions(selectedId){
  return state.packagingItems.map(function(i){ return '<option value="'+i.id+'"'+(i.id===selectedId?' selected':'')+'>'+esc(i.name)+'</option>'; }).join('');
}
function recipeUsageTable(p, rows, kind){
  var items = kind === 'ingredient' ? state.ingredients : state.packagingItems;
  if (items.length === 0) return '<p style="color:var(--ink-soft);font-size:12.5px">Cadastre '+(kind==='ingredient'?'ingredientes':'embalagens')+' primeiro.</p>';
  if (rows.length === 0) return '<p style="color:var(--ink-soft);font-size:12.5px">'+(kind==='ingredient'?'Nenhum ingrediente':'Nenhuma embalagem')+' na receita.</p>';
  var selectAction = kind === 'ingredient' ? 'setRecipeIngredient' : 'setRecipePackaging';
  var qtyAction = kind === 'ingredient' ? 'setRecipeIngredientQty' : 'setRecipePackagingQty';
  var removeAction = kind === 'ingredient' ? 'removeRecipeIngredient' : 'removeRecipePackaging';
  var idKey = kind === 'ingredient' ? 'ingredientId' : 'packagingId';
  var head = '<div class="fin-usage-head">' +
    '<span>Produto</span><span>Valor</span><span>Quant. Total</span><span>Quant. Usada</span><span>Valor Receita</span><span></span></div>';
  var body = rows.map(function(u, idx){
    var item = kind === 'ingredient' ? getIngredient(u[idKey]) : getPackagingItem(u[idKey]);
    var options = kind === 'ingredient' ? ingredientUsageOptions(u[idKey]) : packagingUsageOptions(u[idKey]);
    var qtyUsed = Number(u.qty) || 0;
    var recipeValue = item ? itemUnitCost(item) * qtyUsed : 0;
    return '<div class="admin-row fin-usage-row">' +
      '<select class="input" style="height:34px" data-action="'+selectAction+'" data-id="'+p.id+'" data-idx="'+idx+'">'+options+'</select>' +
      '<span style="font-size:13px">'+(item?currency(item.packagePrice):'—')+'</span>' +
      '<span style="font-size:13px">'+(item?item.packageQty:'—')+'</span>' +
      '<input class="input" type="number" step="0.01" style="height:34px" value="'+qtyUsed+'" data-action="'+qtyAction+'" data-id="'+p.id+'" data-idx="'+idx+'">' +
      '<span style="font-size:13px;font-weight:700">'+currency(recipeValue)+'</span>' +
      '<button data-action="'+removeAction+'" data-id="'+p.id+'" data-idx="'+idx+'" style="background:none;border:none;color:var(--ink-soft)" aria-label="Remover">'+icon('trash',14)+'</button>' +
    '</div>';
  }).join('');
  return '<div class="fin-usage-scroll">' + head + body + '</div>';
}
function recipeProductCard(p){
  var r = ensureRecipe(p);
  var c = recipeCosts(p);
  var ingRows = recipeUsageTable(p, r.ingredientUsage, 'ingredient');
  var packRows = recipeUsageTable(p, r.packagingUsage, 'packaging');

  var profitColor = c.profit >= 0 ? 'var(--primary-dark)' : '#c0392b';
  return '<div class="admin-loc-card">' +
    '<p style="font-weight:800;font-size:15px;margin:0 0 14px">'+esc(p.name)+'</p>' +
    '<div class="fin-grid-3" style="margin-bottom:14px">' +
      '<div class="field" style="margin-bottom:0"><label>Quantidade por receita (rendimento)</label><input class="input" type="number" step="1" value="'+(r.yieldQty||1)+'" data-action="setRecipeYield" data-id="'+p.id+'"></div>' +
      '<div class="field" style="margin-bottom:0"><label>Unidades por pacote</label><input class="input" type="number" step="1" value="'+(r.unitsPerPackage||1)+'" data-action="setRecipeUnitsPerPackage" data-id="'+p.id+'"></div>' +
      '<div class="field" style="margin-bottom:0"><label>Valor de venda (R$)</label><input class="input" type="number" step="0.5" value="'+p.price+'" data-action="setPrice" data-id="'+p.id+'"></div>' +
    '</div>' +
    '<p style="font-weight:700;font-size:12.5px;color:var(--ink-soft);margin:0 0 8px">Ingredientes usados na receita</p>' +
    ingRows +
    '<button class="btn-ghost sm" data-action="addRecipeIngredient" data-id="'+p.id+'" style="margin:8px 0 18px">'+icon('plus',12)+' Adicionar ingrediente</button>' +
    '<p style="font-weight:700;font-size:12.5px;color:var(--ink-soft);margin:0 0 8px">Embalagem usada por unidade</p>' +
    packRows +
    '<button class="btn-ghost sm" data-action="addRecipePackaging" data-id="'+p.id+'" style="margin:8px 0 18px">'+icon('plus',12)+' Adicionar embalagem</button>' +
    '<div style="background:var(--card-2);border-radius:16px;padding:14px 18px;display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px 20px">' +
      '<div><p class="hint" style="margin:0">Custo total da receita</p><p style="font-weight:800;margin:2px 0 0">'+currency(c.ingredientTotal)+'</p></div>' +
      '<div><p class="hint" style="margin:0">Custo por unidade</p><p style="font-weight:800;margin:2px 0 0">'+currency(c.costPerUnit)+'</p></div>' +
      '<div><p class="hint" style="margin:0">Custo da embalagem</p><p style="font-weight:800;margin:2px 0 0">'+currency(c.packagingPerUnit)+'</p></div>' +
      '<div><p class="hint" style="margin:0">Custo final por unidade</p><p style="font-weight:800;margin:2px 0 0">'+currency(c.finalCostPerUnit)+'</p></div>' +
      (c.unitsPerPackage > 1 ? '<div><p class="hint" style="margin:0">Custo final por pacote</p><p style="font-weight:800;margin:2px 0 0">'+currency(c.finalCostPerPackage)+'</p></div>' : '') +
      '<div><p class="hint" style="margin:0">Lucro</p><p style="font-weight:800;margin:2px 0 0;color:'+profitColor+'">'+currency(c.profit)+'</p></div>' +
      '<div><p class="hint" style="margin:0">Margem de lucro</p><p style="font-weight:800;margin:2px 0 0;color:'+profitColor+'">'+c.marginPct.toFixed(1)+'%</p></div>' +
    '</div>' +
  '</div>';
}
function pageAdminFinanceRecipesBody(){
  if (state.products.length === 0) return '<p style="color:var(--ink-soft);font-size:13.5px">Cadastre produtos na aba Produtos primeiro.</p>';
  return state.products.map(recipeProductCard).join('');
}
function pageAdminFinanceGoalsBody(){
  var g = state.financialGoals;
  var results = computeSalesGoals();
  var formHtml = '<div class="admin-loc-card">' +
    '<div class="fin-grid-2">' +
      '<div class="field"><label>Quanto quer ganhar por mês (R$)</label><input class="input" type="number" step="50" value="'+(g.monthlyGoal||0)+'" data-action="setGoalMonthly"></div>' +
      '<div class="field"><label>Dias trabalhados por semana</label><input class="input" type="number" min="1" max="7" step="1" value="'+(g.daysPerWeek||0)+'" data-action="setGoalDays"></div>' +
    '</div>' +
    '<div class="field"><label>Taxa MEI mensal (DAS, R$)</label><input class="input" type="number" step="1" value="'+(g.meiMonthlyFee||0)+'" data-action="setGoalMeiFee" style="max-width:200px"></div>' +
    '<label style="display:flex;align-items:center;gap:8px;font-size:12.5px;color:var(--ink-soft);font-weight:700">' +
      '<input type="checkbox" data-action="toggleGoalTax" '+(g.includeTax?'checked':'')+'> Considerar a taxa MEI na meta (o lucro precisa cobrir o imposto também)' +
    '</label>' +
  '</div>';

  var cardsHtml = results.map(function(res){
    var p = res.product, c = res.costs, be = res.breakeven;
    var scenario = res.scenarios.filter(function(s){ return s.withTax === !!g.includeTax; })[0];
    var unreachable = c.profit <= 0;
    return '<div class="dash-panel" style="margin-bottom:16px">' +
      '<p class="dash-panel-title">'+icon('treat',15,'var(--primary-dark)')+' '+esc(p.name)+'</p>' +
      (unreachable
        ? '<p style="color:#c0392b;font-size:13px;font-weight:700">Esse produto está com lucro zero ou negativo ('+currency(c.profit)+'). Ajuste preço ou custos na aba Receitas & Custos.</p>'
        : '<p style="font-weight:700;font-size:12.5px;color:var(--ink-soft);margin:0 0 8px">Para se pagar (cobrir ingredientes/embalagem + taxa MEI)</p>' +
          '<div class="stat-grid">' +
            statTile('Por dia', be.unitsDay!=null?be.unitsDay+' un':'—', 'sun') +
            statTile('Por semana', be.unitsWeek!=null?be.unitsWeek+' un':'—', 'calendar') +
            statTile('Por mês', be.unitsMonth!=null?be.unitsMonth+' un':'—', 'chart') +
          '</div>' +
          (be.unitsMonth != null
            ? '<p class="hint" style="margin-top:8px">Nessas '+be.unitsMonth+' un/mês: receita de <strong>'+currency(be.unitsMonth*c.sellPrice)+'</strong> cobre <strong>'+currency(be.unitsMonth*c.finalCostPerPackage)+'</strong> de ingredientes/embalagem + <strong>'+currency(be.targetProfit)+'</strong> da taxa MEI.</p>'
            : '') +
          '<p style="font-weight:700;font-size:12.5px;color:var(--ink-soft);margin:18px 0 8px">Para bater a meta de lucro</p>' +
          '<div class="stat-grid">' +
            statTile('Por dia', scenario.unitsDay!=null?scenario.unitsDay+' un':'—', 'sun') +
            statTile('Por semana', scenario.unitsWeek!=null?scenario.unitsWeek+' un':'—', 'calendar') +
            statTile('Por mês', scenario.unitsMonth!=null?scenario.unitsMonth+' un':'—', 'chart') +
          '</div>' +
          '<p class="hint" style="margin-top:10px">Lucro por unidade: <strong>'+currency(c.profit)+'</strong> · Meta de lucro no mês'+(g.includeTax?' (com taxa MEI)':' (sem taxa MEI)')+': <strong>'+currency(scenario.targetProfit)+'</strong> · considerando vender somente este produto.</p>'
      ) +
    '</div>';
  }).join('');

  return formHtml + '<div style="height:8px"></div>' + cardsHtml;
}
var CHART_COLORS = ['#A66BF0','#FF8FC0','#6F9066','#4F8FDB','#E0937A','#D4A017','#8A4FDB','#3BAFA0'];
function priceHistoryItems(){
  var arr = [];
  state.ingredients.forEach(function(i){ arr.push({ kind:'ingredient', id:i.id, name:i.name, item:i }); });
  state.packagingItems.forEach(function(i){ arr.push({ kind:'packaging', id:i.id, name:i.name, item:i }); });
  return arr;
}
function itemHistoryRowsHtml(item){
  var history = (item.priceHistory || []).slice().sort(function(a,b){ return a.date < b.date ? -1 : (a.date > b.date ? 1 : 0); });
  var rows = []; var prev = null;
  history.forEach(function(h){
    rows.push({ date: h.date, price: Number(h.price), diff: prev == null ? null : (Number(h.price) - prev) });
    prev = Number(h.price);
  });
  rows.reverse();
  if (rows.length === 0) return '<p style="color:var(--ink-soft);font-size:13px">Sem histórico ainda.</p>';
  return rows.map(function(r){
    var diffHtml = r.diff == null
      ? '<span class="hint" style="margin:0">primeiro preço registrado</span>'
      : (Math.abs(r.diff) < 0.0001
          ? '<span class="hint" style="margin:0">sem alteração</span>'
          : '<span style="font-weight:700;font-size:12.5px;color:'+(r.diff>0?'#c0392b':'var(--primary-dark)')+'">'+(r.diff>0?'▲ ':'▼ ')+currency(Math.abs(r.diff))+'</span>');
    return '<div class="admin-row" style="justify-content:space-between"><span style="font-size:13px">'+dateLabel(new Date(r.date+'T00:00:00'))+'</span><strong>'+currency(r.price)+'</strong>'+diffHtml+'</div>';
  }).join('');
}
function priceHistoryMultiChart(items){
  var series = items.map(function(x, idx){
    var h = (x.item.priceHistory || []).slice().sort(function(a,b){ return a.date < b.date ? -1 : (a.date > b.date ? 1 : 0); });
    return { name: x.name, color: CHART_COLORS[idx % CHART_COLORS.length], history: h };
  }).filter(function(s){ return s.history.length > 0; });
  var totalPoints = series.reduce(function(s, x){ return s + x.history.length; }, 0);
  if (series.length === 0 || totalPoints < 2){
    return '<p style="color:var(--ink-soft);font-size:13px">Ainda não há histórico suficiente para o gráfico (precisa de pelo menos 2 preços registrados).</p>';
  }
  var allDates = [], allPrices = [];
  series.forEach(function(s){ s.history.forEach(function(h){ allDates.push(h.date); allPrices.push(Number(h.price)); }); });
  var uniqueDates = allDates.filter(function(d, i){ return allDates.indexOf(d) === i; }).sort();
  var minP = Math.min.apply(null, allPrices), maxP = Math.max.apply(null, allPrices);
  if (minP === maxP) { minP -= 1; maxP += 1; }
  var W = 560, H = 190, padX = 40, padY = 20;
  var n = uniqueDates.length;
  function xFor(date){ var i = uniqueDates.indexOf(date); return padX + (n === 1 ? 0 : (i / (n - 1)) * (W - padX * 2)); }
  function yFor(price){ return H - padY - ((price - minP) / (maxP - minP)) * (H - padY * 2); }
  var paths = series.map(function(s){
    var pts = s.history.map(function(h){ return { x: xFor(h.date), y: yFor(Number(h.price)), price: Number(h.price), date: h.date }; });
    var d = pts.map(function(pt, i){ return (i === 0 ? 'M' : 'L') + pt.x.toFixed(1) + ',' + pt.y.toFixed(1); }).join(' ');
    var dots = pts.map(function(pt){
      return '<circle cx="'+pt.x.toFixed(1)+'" cy="'+pt.y.toFixed(1)+'" r="3.5" fill="'+s.color+'"><title>'+esc(s.name)+' · '+esc(pt.date)+': '+currency(pt.price)+'</title></circle>';
    }).join('');
    return '<path d="'+d+'" fill="none" stroke="'+s.color+'" stroke-width="2.5"/>' + dots;
  }).join('');
  return '<svg viewBox="0 0 '+W+' '+H+'" style="width:100%;height:190px">' +
    paths +
    '<text x="4" y="12" font-size="10" fill="var(--ink-soft)">'+currency(maxP)+'</text>' +
    '<text x="4" y="'+(H - padY + 4)+'" font-size="10" fill="var(--ink-soft)">'+currency(minP)+'</text>' +
    '<text x="'+padX+'" y="'+(H - 4)+'" font-size="10" fill="var(--ink-soft)" text-anchor="start">'+esc(uniqueDates[0])+'</text>' +
    '<text x="'+(W - padX)+'" y="'+(H - 4)+'" font-size="10" fill="var(--ink-soft)" text-anchor="end">'+esc(uniqueDates[n-1])+'</text>' +
  '</svg>';
}
function pageAdminFinanceHistoryBody(){
  var items = priceHistoryItems();
  if (items.length === 0) return '<p style="color:var(--ink-soft);font-size:13.5px">Cadastre ingredientes ou embalagens primeiro.</p>';
  var allKeys = items.map(function(x){ return x.kind + ':' + x.id; });
  var selectedKeys = state.historySelectedKeys || allKeys;
  var selectedItems = items.filter(function(x){ return selectedKeys.indexOf(x.kind + ':' + x.id) !== -1; });

  var checkboxesHtml = items.map(function(x, idx){
    var key = x.kind + ':' + x.id;
    var color = CHART_COLORS[idx % CHART_COLORS.length];
    var checked = selectedKeys.indexOf(key) !== -1;
    return '<label style="display:flex;align-items:center;gap:6px;font-size:12.5px;font-weight:700;color:var(--ink);background:var(--card);border:2px solid var(--line);border-radius:999px;padding:6px 12px 6px 8px">' +
      '<input type="checkbox" data-action="toggleHistoryItem" data-key="'+key+'" '+(checked?'checked':'')+'>' +
      '<span style="width:10px;height:10px;border-radius:50%;background:'+color+';display:inline-block"></span>' +
      esc(x.name) +
    '</label>';
  }).join('');

  var listsHtml = selectedItems.length === 0
    ? '<p style="color:var(--ink-soft);font-size:13px">Nenhum item selecionado.</p>'
    : selectedItems.map(function(x){
        return '<div style="margin-bottom:18px"><p style="font-weight:800;font-size:13.5px;margin:0 0 8px">'+esc(x.name)+'</p>' + itemHistoryRowsHtml(x.item) + '</div>';
      }).join('');

  return '<div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:16px">' +
      checkboxesHtml +
      '<button class="btn-ghost sm" data-action="selectAllHistory">Selecionar todos</button>' +
    '</div>' +
    '<div class="dash-panel" style="margin-bottom:16px">' +
      '<p class="dash-panel-title">'+icon('chart',15,'var(--primary-dark)')+' Evolução do preço</p>' +
      priceHistoryMultiChart(selectedItems) +
    '</div>' +
    '<p style="font-weight:800;font-size:14.5px;margin:0 0 12px">Histórico de alterações</p>' +
    listsHtml;
}
function pageAdminFinanceBody(){
  var ftab = state.financeTab;
  var ftabs = [['ingredientes','Ingredientes'],['embalagens','Embalagens'],['receitas','Receitas & Custos'],['metas','Metas de Vendas'],['historico','Histórico de Preços']];
  var tabsHtml = ftabs.map(function(t){
    return '<button class="tab-btn '+(ftab===t[0]?'active':'')+'" data-action="financeTab" data-ftab="'+t[0]+'">'+t[1]+'</button>';
  }).join('');
  var body = '';
  if (ftab === 'ingredientes') body = pageAdminFinanceIngredientsBody();
  else if (ftab === 'embalagens') body = pageAdminFinancePackagingBody();
  else if (ftab === 'receitas') body = pageAdminFinanceRecipesBody();
  else if (ftab === 'metas') body = pageAdminFinanceGoalsBody();
  else if (ftab === 'historico') body = pageAdminFinanceHistoryBody();
  return '<div class="tab-row" style="margin-bottom:18px">' + tabsHtml + '</div><div>' + body + '</div>';
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
  var html = renderHeader() + '<main>' + content + '</main>' + renderFooter() + renderModal() + (state.confirmOpen ? renderConfirm() : '') + renderDeleteLocationModal() + renderPriceChangeModal();
  morphInto(document.getElementById('app'), html);
}

/* ---------- actions ---------- */
function go(page){ state.page = page; state.menuOpen = false; state.authError = ''; render(); window.scrollTo({top:0}); }
function openModal(){ if (cartCount() === 0) return; state.modalOpen = true; state.orderModalLocationId = null; state.orderModalDate = null; render(); }
function closeModal(){ state.modalOpen = false; state.orderModalLocationId = null; state.orderModalDate = null; render(); }

document.addEventListener('click', function(e){
  var stopEl = e.target.closest('[data-stop]');
  var overlay = e.target.closest('[data-action="closeModalBg"], [data-action="closeConfirmBg"], [data-action="closeDeleteLocationBg"], [data-action="closePriceChangeBg"]');
  if (overlay && !stopEl){
    if (overlay.dataset.action === 'closeModalBg') closeModal();
    else if (overlay.dataset.action === 'closeDeleteLocationBg') { state.confirmDeleteLocationId = null; render(); }
    else if (overlay.dataset.action === 'closePriceChangeBg') { state.priceChangeModal = null; render(); }
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
  else if (action === 'financeTab') { state.financeTab = el.dataset.ftab; render(); }
  else if (action === 'toggleAddIngredient') { state.addingIngredient = !state.addingIngredient; render(); }
  else if (action === 'createIngredient') {
    var iname = document.getElementById('ni-nome').value.trim();
    if (!iname) { alert('Informe o nome do ingrediente.'); return; }
    var iprice = Number(document.getElementById('ni-preco').value) || 0;
    var newIng = {
      id: 'ing' + Date.now(), name: iname,
      unit: document.getElementById('ni-unidade').value,
      packagePrice: iprice,
      packageQty: Number(document.getElementById('ni-qtd').value) || 1,
      priceHistory: [{ date: todayStr(), price: iprice }]
    };
    state.ingredients.push(newIng);
    dbSet('ingredients/' + newIng.id, newIng);
    state.addingIngredient = false;
    render();
  }
  else if (action === 'removeIngredient') {
    var iid = el.dataset.ingid;
    state.ingredients = state.ingredients.filter(function(x){ return x.id !== iid; });
    dbRemove('ingredients/' + iid);
    render();
  }
  else if (action === 'toggleAddPackaging') { state.addingPackaging = !state.addingPackaging; render(); }
  else if (action === 'createPackaging') {
    var pkname = document.getElementById('np2-nome').value.trim();
    if (!pkname) { alert('Informe o nome da embalagem.'); return; }
    var pkprice = Number(document.getElementById('np2-preco').value) || 0;
    var newPack = {
      id: 'pack' + Date.now(), name: pkname,
      unit: document.getElementById('np2-unidade').value,
      packagePrice: pkprice,
      packageQty: Number(document.getElementById('np2-qtd').value) || 1,
      priceHistory: [{ date: todayStr(), price: pkprice }]
    };
    state.packagingItems.push(newPack);
    dbSet('packagingItems/' + newPack.id, newPack);
    state.addingPackaging = false;
    render();
  }
  else if (action === 'removePackaging') {
    var pkid = el.dataset.packid;
    state.packagingItems = state.packagingItems.filter(function(x){ return x.id !== pkid; });
    dbRemove('packagingItems/' + pkid);
    render();
  }
  else if (action === 'addRecipeIngredient') {
    var rip = getProduct(el.dataset.id);
    if (rip) {
      var rr = ensureRecipe(rip);
      rr.ingredientUsage.push({ ingredientId: state.ingredients.length ? state.ingredients[0].id : '', qty: 0 });
      dbSet('products/' + rip.id + '/recipe', rr);
    }
    render();
  }
  else if (action === 'removeRecipeIngredient') {
    var rrp = getProduct(el.dataset.id);
    if (rrp) {
      var rri = ensureRecipe(rrp);
      rri.ingredientUsage.splice(Number(el.dataset.idx), 1);
      dbSet('products/' + rrp.id + '/recipe', rri);
    }
    render();
  }
  else if (action === 'addRecipePackaging') {
    var rpp = getProduct(el.dataset.id);
    if (rpp) {
      var rp2 = ensureRecipe(rpp);
      rp2.packagingUsage.push({ packagingId: state.packagingItems.length ? state.packagingItems[0].id : '', qty: 0 });
      dbSet('products/' + rpp.id + '/recipe', rp2);
    }
    render();
  }
  else if (action === 'removeRecipePackaging') {
    var rpr = getProduct(el.dataset.id);
    if (rpr) {
      var rp3 = ensureRecipe(rpr);
      rp3.packagingUsage.splice(Number(el.dataset.idx), 1);
      dbSet('products/' + rpr.id + '/recipe', rp3);
    }
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
        var pcLast = pcItem.priceHistory[pcItem.priceHistory.length - 1];
        if (pcLast && pcLast.date === todayStr()) pcLast.price = pcm.newPrice;
        else pcItem.priceHistory.push({ date: todayStr(), price: pcm.newPrice });
        var pcColl = pcm.kind === 'ingredient' ? 'ingredients' : 'packagingItems';
        dbSet(pcColl + '/' + pcItem.id, pcItem);
      }
      state.priceChangeModal = null;
    }
    render();
  }
  else if (action === 'selectAllHistory') { state.historySelectedKeys = null; render(); }
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
  else if (action === 'setIngredientName') { var sin = getIngredient(el.dataset.ingid); if (sin) { sin.name = el.value; dbSet('ingredients/'+sin.id+'/name', sin.name); } }
  else if (action === 'setIngredientUnit') { var siu = getIngredient(el.dataset.ingid); if (siu) { siu.unit = el.value; dbSet('ingredients/'+siu.id+'/unit', siu.unit); } render(); }
  else if (action === 'setIngredientPrice') {
    var sip = getIngredient(el.dataset.ingid);
    if (sip) {
      var sipNew = Number(el.value) || 0;
      if (Math.abs(sipNew - Number(sip.packagePrice || 0)) > 0.0001) {
        state.priceChangeModal = { kind: 'ingredient', id: sip.id, oldPrice: Number(sip.packagePrice || 0), newPrice: sipNew };
      }
    }
    render();
  }
  else if (action === 'setIngredientQty') { var siq = getIngredient(el.dataset.ingid); if (siq) { siq.packageQty = Number(el.value) || 0; dbSet('ingredients/'+siq.id+'/packageQty', siq.packageQty); } render(); }
  else if (action === 'setPackagingName') { var spn = getPackagingItem(el.dataset.packid); if (spn) { spn.name = el.value; dbSet('packagingItems/'+spn.id+'/name', spn.name); } }
  else if (action === 'setPackagingUnit') { var spu = getPackagingItem(el.dataset.packid); if (spu) { spu.unit = el.value; dbSet('packagingItems/'+spu.id+'/unit', spu.unit); } render(); }
  else if (action === 'setPackagingPrice') {
    var spp = getPackagingItem(el.dataset.packid);
    if (spp) {
      var sppNew = Number(el.value) || 0;
      if (Math.abs(sppNew - Number(spp.packagePrice || 0)) > 0.0001) {
        state.priceChangeModal = { kind: 'packaging', id: spp.id, oldPrice: Number(spp.packagePrice || 0), newPrice: sppNew };
      }
    }
    render();
  }
  else if (action === 'toggleHistoryItem') {
    var hKey = el.dataset.key;
    var hItems = priceHistoryItems();
    var hAllKeys = hItems.map(function(x){ return x.kind + ':' + x.id; });
    var hCurrent = state.historySelectedKeys ? state.historySelectedKeys.slice() : hAllKeys.slice();
    var hIdx = hCurrent.indexOf(hKey);
    if (el.checked && hIdx === -1) hCurrent.push(hKey);
    else if (!el.checked && hIdx !== -1) hCurrent.splice(hIdx, 1);
    state.historySelectedKeys = hCurrent;
    render();
  }
  else if (action === 'setPackagingQty') { var spq = getPackagingItem(el.dataset.packid); if (spq) { spq.packageQty = Number(el.value) || 0; dbSet('packagingItems/'+spq.id+'/packageQty', spq.packageQty); } render(); }
  else if (action === 'setRecipeYield') { var ryp = getProduct(el.dataset.id); if (ryp) { var ry = ensureRecipe(ryp); ry.yieldQty = Number(el.value) || 1; dbSet('products/'+ryp.id+'/recipe', ry); } render(); }
  else if (action === 'setRecipeUnitsPerPackage') { var rup = getProduct(el.dataset.id); if (rup) { var ru = ensureRecipe(rup); ru.unitsPerPackage = Number(el.value) || 1; dbSet('products/'+rup.id+'/recipe', ru); } render(); }
  else if (action === 'setRecipeIngredient') { var sri = getProduct(el.dataset.id); if (sri) { var sr = ensureRecipe(sri); sr.ingredientUsage[Number(el.dataset.idx)].ingredientId = el.value; dbSet('products/'+sri.id+'/recipe', sr); } render(); }
  else if (action === 'setRecipeIngredientQty') { var sriq = getProduct(el.dataset.id); if (sriq) { var srq = ensureRecipe(sriq); srq.ingredientUsage[Number(el.dataset.idx)].qty = Number(el.value) || 0; dbSet('products/'+sriq.id+'/recipe', srq); } render(); }
  else if (action === 'setRecipePackaging') { var srp = getProduct(el.dataset.id); if (srp) { var sp = ensureRecipe(srp); sp.packagingUsage[Number(el.dataset.idx)].packagingId = el.value; dbSet('products/'+srp.id+'/recipe', sp); } render(); }
  else if (action === 'setRecipePackagingQty') { var srpq = getProduct(el.dataset.id); if (srpq) { var spq2 = ensureRecipe(srpq); spq2.packagingUsage[Number(el.dataset.idx)].qty = Number(el.value) || 0; dbSet('products/'+srpq.id+'/recipe', spq2); } render(); }
  else if (action === 'setGoalMonthly') { state.financialGoals.monthlyGoal = Number(el.value) || 0; dbSet('settings/financeGoals', state.financialGoals); render(); }
  else if (action === 'setGoalDays') { state.financialGoals.daysPerWeek = Number(el.value) || 0; dbSet('settings/financeGoals', state.financialGoals); render(); }
  else if (action === 'setGoalMeiFee') { state.financialGoals.meiMonthlyFee = Number(el.value) || 0; dbSet('settings/financeGoals', state.financialGoals); render(); }
  else if (action === 'toggleGoalTax') { state.financialGoals.includeTax = el.checked; dbSet('settings/financeGoals', state.financialGoals); render(); }
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
