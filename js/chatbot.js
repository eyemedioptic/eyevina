/* EYE VINA – chatbot trả lời tự động theo kịch bản (không dùng AI, không gửi dữ liệu ra ngoài).
   Dữ liệu sản phẩm lấy từ mảng P có sẵn trên mỗi trang. Câu hỏi khó → chuyển Zalo 0989 666 559. */
(function(){
'use strict';
var ZALO='https://zalo.me/0989666559', PHONE='0989 666 559';
var STORES=[
  {n:'Lens Shop Hà Đông',a:'169/16 đường Nghĩa Lộ, Yên Nghĩa, Hà Đông, Hà Nội',m:'https://www.google.com/maps/dir/?api=1&destination=20.9525062,105.7385792'},
  {n:'Cửa hàng Minh Khai',a:'169 Minh Khai, Hai Bà Trưng, Hà Nội',m:'https://www.google.com/maps/dir/?api=1&destination=20.9956116,105.8558706'}
];
var CHIPS=['Lens cận','Lens cận loạn','Lens màu','Nước ngâm lens','Giá lens','Địa chỉ cửa hàng','Đặt hàng','Mua sỉ'];

function prods(){try{return (typeof P!=='undefined'&&P&&P.length)?P:[]}catch(e){return []}}
function norm(s){return (s||'').toLowerCase().replace(/đ/g,'d').normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9 ]+/g,' ').replace(/\s+/g,' ').trim()}
function num(s){return parseInt(String(s||'').replace(/\D/g,''),10)||0}
function fmt(n){return n.toLocaleString('vi-VN').replace(/,/g,'.')+' đ'}
function has(q,arr){for(var i=0;i<arr.length;i++){if((' '+q+' ').indexOf(' '+arr[i]+' ')>-1||(arr[i].indexOf(' ')>-1&&q.indexOf(arr[i])>-1))return true}return false}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}

/* nhóm sản phẩm theo tên */
var GROUPS={
  can:{t:'Lens cận trong suốt (không màu)',f:function(n){return /clear|oxy|trong suot/.test(n)&&!/loan/.test(n)}},
  loan:{t:'Lens cận loạn',f:function(n){return /loan/.test(n)}},
  nau:{t:'Lens màu nâu',f:function(n){return /brown|nau/.test(n)}},
  xam:{t:'Lens màu xám',f:function(n){return /gray|xam/.test(n)}},
  den:{t:'Lens màu đen',f:function(n){return /black|den/.test(n)}},
  choco:{t:'Lens màu choco',f:function(n){return /choco/.test(n)}},
  xanh:{t:'Lens màu xanh',f:function(n){return /blue|green|xanh/.test(n)}},
  mau:{t:'Lens màu bán chạy',f:function(n){return /brown|gray|black|choco|blue|green/.test(n)&&!/clear/.test(n)}},
  ngam:{t:'Nước ngâm lens',f:function(n){return /ngam|solution|qeye/.test(n)}},
  nho:{t:'Nước nhỏ mắt cho người đeo lens',f:function(n){return /nho mat|drop/.test(n)}},
  hop:{t:'Hộp, khay bảo quản lens',f:function(n){return /hop|khay/.test(n)}},
  thang3:{t:'Lens dùng 3 tháng',f:function(n){return /3 ?th|3 thang|3m\b/.test(n)}},
  thang6:{t:'Lens dùng 6 tháng',f:function(n){return /6 ?th|6 thang/.test(n)}},
  ngay:{t:'Lens dùng ngắn ngày, chụp ảnh, sự kiện',f:function(n){return /chup anh|su kien|du tiec/.test(n)}},
  thammy:{t:'Lens thẩm mỹ che khuyết điểm',f:function(n){return /tham my/.test(n)}},
  kinh:{t:'Mắt kính',f:function(n){return /kinh/.test(n)&&!/ap trong/.test(n)}}
};
function pick(key,max){var out=[],list=prods();for(var i=0;i<list.length;i++){if(GROUPS[key].f(norm(list[i].name)))out.push(i)}return out.slice(0,max||6)}
function range(ids){var a=ids.map(function(i){return num(prods()[i].price)}).filter(Boolean);if(!a.length)return '';var lo=Math.min.apply(0,a),hi=Math.max.apply(0,a);return lo===hi?fmt(lo):fmt(lo)+' – '+fmt(hi)}

function cards(ids){
  if(!ids.length)return '';
  var list=prods(),h='<div class="cb-cards">';
  ids.forEach(function(i){var p=list[i];
    h+='<div class="cb-card"><a href="'+esc(p.link||'#')+'"><img src="'+esc(p.src||'')+'" alt="'+esc(p.name)+'" loading="lazy"></a>'+
       '<a class="cb-cn" href="'+esc(p.link||'#')+'">'+esc(p.name)+'</a>'+
       '<div class="cb-cp"><b>'+esc(p.price)+'</b>'+(p.old&&num(p.old)>num(p.price)?'<del>'+esc(p.old)+'</del>':'')+'</div>'+
       '<button type="button" class="cb-buy" data-i="'+i+'">Mua ngay</button>'+(typeof addCart==='function'?'<button type="button" class="cb-add" data-i="'+i+'">+ Thêm vào giỏ</button>':'')+'</div>';});
  return h+'</div>';
}
function zaloBtn(t){return '<a class="cb-zalo" href="'+ZALO+'" target="_blank" rel="noopener">'+(t||'Nhắn Zalo '+PHONE)+'</a>'}
function storesHtml(){return STORES.map(function(s,k){return '<div class="cb-store"><b>'+(k+1)+'. '+s.n+'</b><br>'+s.a+'<br><a href="'+s.m+'" target="_blank" rel="noopener">📍 Chỉ đường</a></div>'}).join('')}

function answer(raw){
  var q=norm(raw), r=[];
  if(!q)return {h:'Bạn cần mình hỗ trợ gì ạ?'};
  var color=null;
  if(has(q,['nau','brown']))color='nau';else if(has(q,['xam','gray','tay']))color='xam';else if(has(q,['den','black']))color='den';
  else if(has(q,['choco','socola']))color='choco';else if(has(q,['xanh','blue','green']))color='xanh';else if(has(q,['tim','violet']))color='tim';

  if(has(q,['si','dai ly','buon','nhap hang','ctv','cong tac vien']))
    return {h:'EYE VINA cung cấp <b>kính áp tròng sỉ</b> cho shop, đại lý và cộng tác viên tại Hà Nội và khu vực miền Bắc. Bảng giá sỉ và điều kiện nhập hàng được tư vấn riêng qua Zalo:<br>'+zaloBtn('Nhắn Zalo hỏi giá sỉ')};
  if(has(q,['dia chi','cua hang','o dau','chi duong','shop o','gan day','gan nhat','ghe','den mua','map','ban do']))
    return {h:'EYE VINA có 2 cửa hàng tại Hà Nội:'+storesHtml()+'Bạn ở xa có thể đặt ngay trên web hoặc nhắn Zalo '+PHONE+' để được giao tận nơi.'};
  if(has(q,['gio mo cua','mo cua','dong cua','may gio','lam viec']))
    return {h:'Shop tư vấn <b>24/7 qua Zalo '+PHONE+'</b>. Trước khi ghé cửa hàng, bạn nhắn Zalo hoặc gọi trước để shop chuẩn bị sẵn mẫu và độ cho bạn nhé.<br>'+zaloBtn()};
  if(has(q,['doi tra','doi hang','tra hang','bao hanh','hoan tien','loi']))
    return {h:'Về đổi trả và bảo hành, bạn nhắn Zalo '+PHONE+' kèm mã đơn hoặc ảnh sản phẩm để nhân viên kiểm tra và hỗ trợ trực tiếp nhé.<br>'+zaloBtn()};
  if(has(q,['ship','giao','van chuyen','cod','phi ship','ngoai tinh','cac tinh','tinh khac','toan quoc']))
    return {h:'🚚 <b>Giao hàng:</b> nội thành Hà Nội giao nhanh. Khách ở ngoại thành và các tỉnh miền Bắc vui lòng nhắn Zalo '+PHONE+' để được báo cách giao và phí ship.<br>⚡ Đơn cần gấp: đặt trên web xong, chụp màn hình đơn gửi qua Zalo.<br>'+zaloBtn()};
  if(has(q,['dat hang','dat mua','mua the nao','cach mua','mua sao','order','thanh toan','gio hang','mua ngay','muon mua']))
    return {h:'🛒 Mời bạn <b>chọn sản phẩm muốn đặt mua</b>. Bấm <b>Mua ngay</b> ở sản phẩm để điền thông tin đặt hàng trực tiếp (họ tên, số điện thoại, địa chỉ, độ mắt phải / trái).<br>Muốn xem mẫu khác, chọn nhóm bên dưới hoặc gõ tên sản phẩm.'+
      cards(pick('can',2).concat(pick('mau',3),pick('ngam',1)))+'<br>Hoặc gọi/nhắn Zalo '+PHONE+' để đặt nhanh.',
      chips:['Lens cận','Lens cận loạn','Lens nâu','Lens xám','Lens đen','Lens choco','Lens xanh','Nước ngâm lens','Nước nhỏ mắt']};
  if(has(q,['do mat','do kham','kham mat','do khuc xa','kiem tra mat','khong biet do','bao nhieu do','toa']))
    return {h:'Khi đặt lens có độ, bạn ghi <b>độ mắt phải và độ mắt trái</b> theo kết quả đo mắt gần nhất (toa kính hoặc phiếu đo). Nếu chưa rõ độ hoặc lâu chưa đo lại, bạn nên đo mắt trước khi mua. Có thể nhắn Zalo '+PHONE+' gửi ảnh toa để shop tư vấn loại lens phù hợp.<br>'+zaloBtn('Gửi toa qua Zalo')};
  if(has(q,['loan','loan thi']))
    return out('loan','Lens dành cho mắt <b>cận loạn</b>. Bạn gửi độ cận, độ loạn và trục (trên toa đo mắt) qua Zalo để shop kiểm tra độ có sẵn nhé.');
  if(has(q,['nuoc ngam','ngam lens','dung dich','solution','qeye','x2']))
    return out('ngam','Nước ngâm giúp làm sạch và bảo quản lens sau mỗi lần tháo. Thay nước ngâm mới mỗi lần, không dùng nước máy hay nước muối tự pha.',['Nước nhỏ mắt','Hộp đựng lens']);
  if(has(q,['nho mat','kho mat','drop']))
    return out('nho','Nước nhỏ mắt dành cho người đeo lens giúp đỡ khô mắt khi làm việc lâu với máy tính. Nếu mắt đỏ, đau hoặc nhìn mờ, hãy tháo lens và đi khám bác sĩ nhãn khoa.');
  if(has(q,['hop','khay','dung lens']))return out('hop','Hộp bảo quản lens nhỏ gọn, tiện mang theo:');
  if(has(q,['tham my','che khuyet diem','seo','mat seo']))
    return out('thammy','Lens thẩm mỹ giúp che khuyết điểm tròng mắt. Bạn nên nhắn Zalo gửi ảnh mắt để được tư vấn mẫu phù hợp.');
  if(has(q,['kinh xuyen dem','lai xe','phan cuc','kinh ram','mat kinh','gong']))return out('kinh','Các mẫu mắt kính đang bán:');
  if(has(q,['chup anh','cuoi','su kien','du tiec','1 ngay','mot ngay']))return out('ngay','Lens phù hợp cho chụp ảnh, sự kiện, dự tiệc:');
  if(has(q,['6 thang','6 th','6th','sau thang']))return out('thang6','Lens dùng 6 tháng:');
  if(has(q,['3 thang','3 th','3th','ba thang']))return out('thang3','Lens dùng 3 tháng:');
  if(color==='tim')return {h:'Hiện trên web chưa có mẫu lens màu tím. Bạn nhắn Zalo '+PHONE+' để hỏi mẫu mới về nhé, hoặc xem các màu khác:',chips:['Lens nâu','Lens xám','Lens xanh','Lens đen']};
  if(color)return out(color,'Một số mẫu '+GROUPS[color].t.toLowerCase()+' đang bán:');
  if(has(q,['mau','lens mau','co mau','gian trong','tu nhien']))
    return {h:'Bạn thích tông màu nào? Shop có lens <b>nâu, xám, đen, choco, xanh</b>.'+cards(pick('mau',4)),chips:['Lens nâu','Lens xám','Lens đen','Lens choco','Lens xanh']};
  if(has(q,['lens can','can thi','bi can','do can','mat can','kinh can','khong mau','trong suot','clear','oxy','deo can','khong do']))
    return out('can','Lens cận trong suốt, nhìn tự nhiên, phù hợp đi học, đi làm. Khi đặt bạn ghi độ mắt phải / mắt trái nhé.',['Lens cận loạn','Lens màu','Đặt hàng']);
  if(has(q,['gia','bao nhieu tien','bao nhieu','bang gia','re','khuyen mai','giam gia']))
    return {h:'💰 <b>Giá tham khảo trên web:</b><ul>'+
      ['can','loan','mau','ngam','nho'].map(function(k){var r=range(pick(k,99));return r?'<li>'+GROUPS[k].t+': '+r+'</li>':''}).join('')+
      '</ul>Giá từng mẫu ghi rõ ở trang sản phẩm. Bạn muốn xem loại nào?',chips:['Lens cận','Lens cận loạn','Lens màu','Nước ngâm lens']};
  if(has(q,['deo','thao','an toan','bao lau','ngu','dau mat','bi do','mat do','cay mat','cach dung','huong dan','ve sinh']))
    return {h:'👁️ <b>Lưu ý khi đeo lens:</b><ul><li>Rửa tay sạch trước khi đeo và tháo lens.</li><li>Không ngủ khi đang đeo lens, không đeo quá thời gian khuyến nghị.</li><li>Ngâm lens bằng nước ngâm chuyên dụng, thay nước mỗi lần.</li><li>Thay lens đúng hạn sử dụng (3 tháng, 6 tháng…).</li><li>Mắt đỏ, đau, nhìn mờ: tháo lens ngay và đi khám bác sĩ nhãn khoa.</li></ul>Xem thêm bài hướng dẫn tại <a href="/tin-tuc.html">Tin tức</a>.',chips:['Nước ngâm lens','Nước nhỏ mắt']};
  if(has(q,['chao','hello','hi','alo','xin chao','shop oi','ad oi','admin']))
    return {h:'Chào bạn 👋 Mình là trợ lý tự động của EYE VINA. Bạn đang tìm lens cận, lens màu hay nước ngâm lens ạ?'};
  if(has(q,['cam on','thanks','ok','oke','duoc roi']))return {h:'Cảm ơn bạn đã ghé EYE VINA 💕 Cần gì thêm bạn cứ hỏi nhé!'};
  /* tìm theo tên sản phẩm */
  var words=q.split(' ').filter(function(w){return w.length>2&&['lens','contact','kinh','mua','con','khong','cho','gia','minh'].indexOf(w)<0});
  if(words.length){var list=prods(),hit=[];
    for(var i=0;i<list.length;i++){var n=norm(list[i].name),sc=0;words.forEach(function(w){if(n.indexOf(w)>-1)sc++});if(sc)hit.push([sc,i])}
    hit.sort(function(a,b){return b[0]-a[0]});
    if(hit.length)return {h:'Mình tìm thấy các sản phẩm này:'+cards(hit.slice(0,4).map(function(x){return x[1]}))};
  }
  return {h:'Câu này mình chưa trả lời tự động được 😅 Bạn chọn một chủ đề bên dưới, hoặc nhắn Zalo để nhân viên tư vấn trực tiếp nhé.<br>'+zaloBtn()};

  function out(key,intro,chips){var ids=pick(key,6),rg=range(pick(key,99));
    return {h:intro+(rg?'<br>Giá: <b>'+rg+'</b>':'')+cards(ids)+(ids.length?'':'<br>'+zaloBtn()),chips:chips}}
}

/* ---------- giao diện ---------- */
var css='.cb-btn{width:50px;height:50px;border-radius:50%;border:0;background:#e5161b;color:#fff;display:grid;place-items:center;cursor:pointer;box-shadow:0 3px 10px rgba(0,0,0,.25);position:relative;padding:0}'+
'.cb-btn svg{width:26px;height:26px}.cb-dot{position:absolute;top:2px;right:2px;width:12px;height:12px;border-radius:50%;background:#2ecc71;border:2px solid #fff}'+
'.cb-tease{position:fixed;right:72px;bottom:var(--cbb,136px);max-width:220px;background:#fff;color:#222;font-size:13.5px;line-height:1.4;padding:9px 12px;border-radius:12px 12px 2px 12px;box-shadow:0 4px 16px rgba(0,0,0,.18);z-index:99;cursor:pointer;animation:cbIn .3s}'+
'.cb-tease i{position:absolute;top:-8px;right:-6px;width:20px;height:20px;border-radius:50%;background:#555;color:#fff;font-style:normal;font-size:12px;display:grid;place-items:center}'+
'.cb-win{position:fixed;right:12px;bottom:12px;width:min(370px,calc(100vw - 24px));height:min(560px,calc(100dvh - 24px));background:#fff;border-radius:14px;box-shadow:0 10px 40px rgba(0,0,0,.3);z-index:1001;display:flex;flex-direction:column;overflow:hidden;font-size:14px;line-height:1.45;color:#222;animation:cbIn .25s}'+
'@keyframes cbIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}'+
'.cb-head{background:#e5161b;color:#fff;padding:11px 12px;display:flex;align-items:center;gap:10px}.cb-av{width:36px;height:36px;border-radius:50%;background:#fff;color:#e5161b;display:grid;place-items:center;font-weight:800;font-size:13px;flex:0 0 36px}'+
'.cb-head b{display:block;font-size:15px}.cb-head small{opacity:.9;font-size:12px}.cb-x{margin-left:auto;background:none;border:0;color:#fff;font-size:26px;line-height:1;cursor:pointer;padding:0 4px}'+
'.cb-body{flex:1;overflow-y:auto;padding:12px;background:#f5f5f7;display:flex;flex-direction:column;gap:8px;overscroll-behavior:contain}'+
'.cb-m{max-width:88%;padding:8px 11px;border-radius:12px;word-wrap:break-word}.cb-m.bot{background:#fff;align-self:flex-start;border-bottom-left-radius:3px;box-shadow:0 1px 2px rgba(0,0,0,.06)}'+
'.cb-m.me{background:#e5161b;color:#fff;align-self:flex-end;border-bottom-right-radius:3px}.cb-m ul,.cb-m ol{margin:6px 0;padding-left:18px}.cb-m a{color:#e5161b}'+
'.cb-store{margin:6px 0;padding:7px 9px;background:#fafafa;border-radius:8px;border:1px solid #eee}'+
'.cb-cards{display:flex;gap:8px;overflow-x:auto;margin:8px -4px 2px;padding:0 4px 4px;scroll-snap-type:x mandatory}'+
'.cb-card{flex:0 0 128px;scroll-snap-align:start;background:#fff;border:1px solid #eee;border-radius:10px;padding:6px;display:flex;flex-direction:column;gap:3px}'+
'.cb-card img{width:100%;aspect-ratio:1;object-fit:cover;border-radius:7px;display:block}.cb-cn{font-size:12.5px;color:#222!important;text-decoration:none;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:34px}'+
'.cb-cp b{color:#e5161b;font-size:13px}.cb-cp del{color:#999;font-size:11px;margin-left:4px}'+
'.cb-buy{border:0;background:#e5161b;color:#fff;border-radius:6px;padding:6px;font-size:12.5px;font-weight:700;cursor:pointer;font-family:inherit}.cb-buy:hover{background:#b80f14}'+
'.cb-add,.cb-opencart{border:0;background:#333;color:#fff;border-radius:6px;padding:5px 6px;font-size:12px;cursor:pointer;font-family:inherit}.cb-add:hover,.cb-opencart:hover{background:#e5161b}.cb-opencart{margin-top:6px;padding:7px 12px}'+
'.cb-zalo{display:inline-block;margin-top:6px;background:#0068ff;color:#fff!important;text-decoration:none;border-radius:16px;padding:6px 12px;font-weight:600;font-size:13px}'+
'.cb-chips{display:flex;flex-wrap:wrap;gap:6px;padding:8px 10px 0;background:#fff;border-top:1px solid #eee;max-height:84px;overflow-y:auto}'+
'.cb-chip{border:1px solid #e5161b;color:#e5161b;background:#fff;border-radius:16px;padding:4px 10px;font-size:12.5px;cursor:pointer;font-family:inherit;white-space:nowrap}.cb-chip:hover{background:#e5161b;color:#fff}'+
'.cb-form{display:flex;gap:6px;padding:8px 10px 10px;background:#fff}.cb-form input{flex:1;min-width:0;border:1px solid #ddd;border-radius:20px;padding:9px 14px;font-size:16px;font-family:inherit;outline:none}.cb-form input:focus{border-color:#e5161b}'+
'.cb-form button{width:40px;height:40px;flex:0 0 40px;border-radius:50%;border:0;background:#e5161b;color:#fff;cursor:pointer;display:grid;place-items:center}'+
'.cb-typing{align-self:flex-start;background:#fff;border-radius:12px;padding:10px 12px}.cb-typing span{display:inline-block;width:6px;height:6px;margin:0 2px;border-radius:50%;background:#bbb;animation:cbT 1s infinite}.cb-typing span:nth-child(2){animation-delay:.15s}.cb-typing span:nth-child(3){animation-delay:.3s}'+
'@keyframes cbT{0%,60%,100%{opacity:.3}30%{opacity:1}}.cb-note{font-size:11px;color:#999;text-align:center;padding:0 10px 6px;background:#fff}';
var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

var host=document.querySelector('.support_bt');
var btn=document.createElement('button');btn.type='button';btn.className='cb-btn';btn.setAttribute('aria-label','Chat tư vấn tự động');btn.title='Chat tư vấn';
btn.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/><path d="M8.5 12h.01M12 12h.01M15.5 12h.01"/></svg><span class="cb-dot"></span>';
if(host)host.insertBefore(btn,host.firstChild);else{btn.style.cssText='position:fixed;right:12px;bottom:76px;z-index:99';document.body.appendChild(btn)}

var win=null,body,chipsEl,history=[];
function ss(k,v){try{if(v===undefined)return sessionStorage.getItem(k);sessionStorage.setItem(k,v)}catch(e){return null}}
try{history=JSON.parse(ss('eyevina_chat')||'[]')}catch(e){history=[]}

function build(){
  win=document.createElement('div');win.className='cb-win';win.setAttribute('role','dialog');win.setAttribute('aria-label','Chat tư vấn EYE VINA');
  win.innerHTML='<div class="cb-head"><div class="cb-av">EV</div><div><b>Trợ lý EYE VINA</b><small>Trả lời tự động · Tư vấn viên qua Zalo 24/7</small></div><button type="button" class="cb-x" aria-label="Đóng">×</button></div>'+
    '<div class="cb-body" aria-live="polite"></div><div class="cb-chips"></div>'+
    '<form class="cb-form"><input type="text" maxlength="200" placeholder="Nhập câu hỏi, VD: lens cận giá bao nhiêu?" aria-label="Câu hỏi"><button type="submit" aria-label="Gửi"><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M2 21l21-9L2 3v7l15 2-15 2z"/></svg></button></form>'+
    '<div class="cb-note">Trợ lý tự động – thông tin giá theo web. Cần tư vấn độ mắt, nhắn Zalo '+PHONE+'.</div>';
  document.body.appendChild(win);
  body=win.querySelector('.cb-body');chipsEl=win.querySelector('.cb-chips');
  win.querySelector('.cb-x').onclick=close;
  win.querySelector('form').onsubmit=function(e){e.preventDefault();var inp=this.querySelector('input'),v=inp.value.trim();if(!v)return;inp.value='';ask(v)};
  win.addEventListener('click',function(e){
    var t=e.target.closest('.cb-chip');if(t){ask(t.textContent);return}
    var bq=e.target.closest('.cb-buy');if(bq){var bi=+bq.dataset.i;if(typeof window.quickOrder==='function'){close();window.quickOrder(bi,1)}else location.href=prods()[bi].link;return}
    var a=e.target.closest('.cb-add');if(a&&typeof addCart==='function'){addCart(+a.dataset.i,null);a.textContent='✓ Đã thêm';return}
    if(e.target.closest('.cb-opencart')&&typeof openCart==='function'){close();openCart()}
  });
  if(history.length){history.forEach(function(m){add(m[0],m[1],true)})}
  else add('bot','Chào bạn 👋 Mình là trợ lý tự động của <b>EYE VINA</b> – shop kính áp tròng Hà Nội. Bạn cần tư vấn gì ạ? Chọn nhanh bên dưới hoặc gõ câu hỏi nhé.');
  setChips(CHIPS);
}
function add(who,html,restore){var d=document.createElement('div');d.className='cb-m '+who;d.innerHTML=html;body.appendChild(d);body.scrollTop=body.scrollHeight;
  if(!restore){history.push([who,html]);if(history.length>40)history=history.slice(-40);ss('eyevina_chat',JSON.stringify(history))}}
function setChips(list){chipsEl.innerHTML=(list||CHIPS).map(function(c){return '<button type="button" class="cb-chip">'+esc(c)+'</button>'}).join('')}
function ask(text){
  add('me',esc(text));
  var ty=document.createElement('div');ty.className='cb-typing';ty.innerHTML='<span></span><span></span><span></span>';body.appendChild(ty);body.scrollTop=body.scrollHeight;
  setTimeout(function(){ty.remove();var a=answer(text);add('bot',a.h);setChips(a.chips?a.chips.concat(['Địa chỉ cửa hàng','Nhân viên tư vấn']):CHIPS)},500);
}
function open(){hideTease();ss('eyevina_chat_seen','1');if(!win)build();else win.style.display='flex';
  if(window.matchMedia('(min-width:700px)').matches)setTimeout(function(){win.querySelector('input').focus()},50)}
function close(){if(win)win.style.display='none'}
btn.onclick=function(){(win&&win.style.display!=='none')?close():open()};
document.addEventListener('keydown',function(e){if(e.key==='Escape')close()});

/* "Nhân viên tư vấn" → Zalo */
var _ans=answer;answer=function(t){if(/nhan vien|tu van vien|nguoi that|goi dien|hotline|zalo/.test(norm(t)))return {h:'Bạn bấm nút dưới để chat với nhân viên qua Zalo, hoặc gọi '+PHONE+' (tư vấn 24/7):<br>'+zaloBtn()};return _ans(t)};

/* lời chào gợi ý sau 10 giây, 1 lần mỗi phiên */
var tease=null;
function hideTease(){if(tease){tease.remove();tease=null}}
if(!ss('eyevina_chat_seen'))setTimeout(function(){
  if(win&&win.style.display!=='none')return;
  var r=btn.getBoundingClientRect();
  tease=document.createElement('div');tease.className='cb-tease';
  tease.style.bottom=(window.innerHeight-r.bottom+8)+'px';
  tease.innerHTML='Bạn cần tư vấn lens cận, lens màu? Hỏi mình nhé 💬<i title="Ẩn">×</i>';
  tease.onclick=function(e){if(e.target.tagName==='I'){hideTease();ss('eyevina_chat_seen','1')}else open()};
  document.body.appendChild(tease);
},10000);
})();
