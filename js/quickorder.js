/* EYE VINA – "MUA NGAY": hiện form đặt hàng điền trực tiếp cho 1 sản phẩm (không qua giỏ hàng).
   Gửi đơn về cùng Google Sheet + email (ORDER_ENDPOINT có sẵn trên trang). */
(function(){
'use strict';
if(typeof P==='undefined')return;
var PHONE='0989 666 559',ZALO='https://zalo.me/0989666559';
function n(s){return parseInt(String(s||'').replace(/\D/g,''),10)||0}
function f$(v){return (typeof fmt==='function')?fmt(v):v.toLocaleString('vi-VN').replace(/,/g,'.')+' đ'}
function code(p){var m=String(p.href||'').match(/\/(\d+)\//);return m?'SP'+m[1]:''}

var css='.qo{position:fixed;inset:0;z-index:1002;display:none;align-items:center;justify-content:center;padding:12px}.qo.open{display:flex}'+
'.qo-bg{position:absolute;inset:0;background:rgba(0,0,0,.55)}'+
'.qo-box{position:relative;background:#fff;border-radius:14px;width:min(440px,100%);max-height:calc(100dvh - 24px);overflow-y:auto;box-shadow:0 12px 40px rgba(0,0,0,.35);animation:qoIn .25s;overscroll-behavior:contain}'+
'@keyframes qoIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}'+
'.qo-h{display:flex;align-items:center;justify-content:space-between;background:#de1820;color:#fff;padding:12px 16px;position:sticky;top:0;z-index:1}.qo-h b{font-size:16px;letter-spacing:.3px}'+
'.qo-x{background:none;border:0;color:#fff;font-size:28px;line-height:1;cursor:pointer;padding:0 2px}'+
'.qo-in{padding:14px 16px 16px}'+
'.qo-p{display:flex;gap:12px;align-items:center;padding-bottom:12px;border-bottom:1px solid #eee;margin-bottom:12px}.qo-p img{width:72px;height:72px;object-fit:cover;border-radius:8px;flex:0 0 72px}'+
'.qo-p .nm{font-weight:600;font-size:14.5px;line-height:1.35}.qo-p .pr{color:#de1820;font-weight:700;margin-top:3px}.qo-p .pr del{color:#999;font-weight:400;font-size:12.5px;margin-left:6px}'+
'.qo-q{display:flex;align-items:center;justify-content:space-between;margin:-2px 0 12px}.qo-q span{font-weight:600;font-size:14px}'+
'.qo-q .qb{display:flex;align-items:center;border:1px solid #ddd;border-radius:20px;overflow:hidden}.qo-q button{width:34px;height:32px;border:0;background:#f5f5f5;font-size:17px;cursor:pointer}.qo-q output{min-width:36px;text-align:center;font-weight:700}'+
'.qo form input{width:100%;border:1px solid #ddd;border-radius:8px;padding:10px 12px;margin-bottom:9px;outline:0;font-size:16px;font-family:inherit;box-sizing:border-box}.qo form input:focus{border-color:#de1820}.qo form input:disabled{background:#f3f3f3}'+
'.qo .eyes2{display:flex;gap:8px}.qo .eyes2 label{flex:1;min-width:0}.qo .eyes2 span{display:block;font-size:12.5px;font-weight:600;color:#444;margin-bottom:3px}'+
'.qo-t{display:flex;justify-content:space-between;align-items:center;margin:4px 0 10px;font-size:15px}.qo-t b{color:#de1820;font-size:18px}'+
'.qo-go{width:100%;background:#de1820;color:#fff;border:0;border-radius:24px;padding:13px;font-weight:700;font-size:15px;cursor:pointer;font-family:inherit}.qo-go:disabled{opacity:.75;cursor:wait}'+
'.qo-msg{background:#fdecea;color:#b3261e;border-radius:6px;padding:8px 10px;font-size:13px;margin:0 0 8px}'+
'.qo-note{text-align:center;font-size:13px;margin:9px 0 0;color:#555}.qo-note a{color:#0068ff;font-weight:600;text-decoration:underline}'+
'.qo-hp{position:absolute!important;left:-9999px!important;width:1px!important;height:1px!important;opacity:0}'+
'.qo-ok{text-align:center}.qo-ok .tick{width:56px;height:56px;border-radius:50%;background:#2e9d4a;color:#fff;display:grid;place-items:center;margin:4px auto 8px;font-size:30px}'+
'.qo-ok h3{margin:0 0 6px;font-size:18px}.qo-ok .sum{text-align:left;background:#fafafa;border:1px solid #eee;border-radius:8px;padding:10px 12px;margin:10px 0;font-size:14px;line-height:1.55}'+
'.qo-ok .urg{background:#fff7e0;border-radius:8px;padding:9px 10px;font-size:13.5px}.qo-ok .urg a{color:#0068ff;font-weight:700}'+
'.qo-ok .again{margin-top:12px;background:#333}';
var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

var el=document.createElement('div');el.className='qo';el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');el.setAttribute('aria-label','Đặt mua nhanh');
el.innerHTML='<div class="qo-bg"></div><div class="qo-box"><div class="qo-h"><b>ĐẶT MUA NGAY</b><button type="button" class="qo-x" aria-label="Đóng">×</button></div><div class="qo-in"></div></div>';
document.body.appendChild(el);
var inner=el.querySelector('.qo-in'),cur=-1,q=1,sending=false,pending=null,lastText='';
el.querySelector('.qo-bg').onclick=close;el.querySelector('.qo-x').onclick=close;
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&el.classList.contains('open')&&!sending)close()});

function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function formView(){
  var p=P[cur],old=p.old&&n(p.old)>n(p.price)?'<del>'+esc(p.old)+'</del>':'';
  inner.innerHTML='<div class="qo-p"><img src="'+esc(p.src)+'" alt="'+esc(p.name)+'"><div><div class="nm">'+esc(p.name)+'</div><div class="pr">'+esc(p.price)+old+'</div></div></div>'+
   '<div class="qo-q"><span>Số lượng</span><div class="qb"><button type="button" data-d="-1" aria-label="Giảm">−</button><output>'+q+'</output><button type="button" data-d="1" aria-label="Tăng">+</button></div></div>'+
   '<form novalidate><input name="ten" required autocomplete="name" placeholder="Họ và tên *">'+
   '<input name="sdt" required type="tel" autocomplete="tel" inputmode="tel" pattern="[0-9 +.]{9,15}" placeholder="Số điện thoại *">'+
   '<input name="dc" required autocomplete="street-address" placeholder="Địa chỉ nhận hàng *">'+
   '<div class="eyes2"><label><span>Độ mắt phải</span><input name="mp" maxlength="40" placeholder="VD: -2.50 / 0"></label><label><span>Độ mắt trái</span><input name="mt" maxlength="40" placeholder="VD: -2.75 / 0"></label></div>'+
   '<input name="website_hp" tabindex="-1" autocomplete="off" class="qo-hp" aria-hidden="true">'+
   '<div class="qo-t"><span>Tạm tính</span><b class="tt"></b></div>'+
   '<p class="qo-msg" role="alert" hidden></p><button class="qo-go" type="submit">ĐẶT HÀNG</button>'+
   '<p class="qo-note">⚡ Cần giao gấp? Đặt xong chụp màn hình đơn và <a href="'+ZALO+'" target="_blank" rel="noopener">gửi qua Zalo '+PHONE+'</a></p></form>';
  total();
  inner.querySelectorAll('.qb button').forEach(function(b){b.onclick=function(){if(sending)return;q=Math.max(1,Math.min(99,q+(+b.dataset.d)));inner.querySelector('output').textContent=q;total()}});
  inner.querySelector('form').onsubmit=function(e){e.preventDefault();submit(this)};
}
function total(){var t=inner.querySelector('.tt');if(t)t.textContent=f$(n(P[cur].price)*q)}
function msg(h){var m=inner.querySelector('.qo-msg');m.innerHTML=h;m.hidden=!h}
function lock(f,on){[].forEach.call(f.elements,function(x){if(x.name!=='website_hp')x.disabled=on});inner.querySelectorAll('.qb button').forEach(function(b){b.disabled=on});
  var b=f.querySelector('.qo-go');b.innerHTML=on?'<span class="spin"></span>ĐANG GỬI ĐƠN...':'ĐẶT HÀNG'}

function submit(f){
  if(sending)return;
  var v=function(k){return f[k].value.trim()};
  if(!v('ten')||!v('dc')||!/^[0-9 +.]{9,15}$/.test(v('sdt'))||v('sdt').replace(/\D/g,'').length<9){
    msg('Vui lòng nhập đủ <b>họ tên, số điện thoại</b> (9–11 số) và <b>địa chỉ nhận hàng</b>.');
    (!v('ten')?f.ten:!/^[0-9 +.]{9,15}$/.test(v('sdt'))?f.sdt:f.dc).focus();return}
  var p=P[cur],d=new Date(),z=function(x){return String(x).padStart(2,'0')};
  var o={orderId:'EV'+String(d.getFullYear()).slice(2)+z(d.getMonth()+1)+z(d.getDate())+'-'+z(d.getHours())+z(d.getMinutes())+Math.floor(Math.random()*90+10),
    website:location.hostname||'eyevina.com',items:[{code:code(p),name:p.name,qty:q,price:n(p.price)}],total:n(p.price)*q,
    name:v('ten'),phone:v('sdt'),address:v('dc'),rightEye:v('mp'),leftEye:v('mt'),website_hp:f.website_hp.value};
  var sig=JSON.stringify([o.items,o.name,o.phone,o.address,o.rightEye,o.leftEye]);
  if(pending&&pending.sig===sig)o.orderId=pending.id;else pending={id:o.orderId,sig:sig};   // gửi lại không bị trùng đơn
  lastText='ĐƠN HÀNG '+o.orderId+' – từ '+o.website+'\n- '+o.items[0].code+' '+p.name+' x'+q+' = '+f$(o.total)+
    '\nHọ tên: '+o.name+'\nĐiện thoại: '+o.phone+'\nĐịa chỉ nhận hàng: '+o.address+'\nĐộ mắt phải: '+(o.rightEye||'—')+'\nĐộ mắt trái: '+(o.leftEye||'—');
  sending=true;msg('');lock(f,true);
  var ctrl=new AbortController(),timer=setTimeout(function(){ctrl.abort()},25000);
  var ep=(typeof ORDER_ENDPOINT!=='undefined')?ORDER_ENDPOINT:'';
  (ep?fetch(ep,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(o),signal:ctrl.signal,redirect:'follow'}).then(function(r){return r.json()}):Promise.reject(new Error('no-endpoint')))
  .then(function(data){if(!data||!data.ok)throw new Error((data&&data.error)||'server');pending=null;okView(o,p)})
  .catch(function(err){lock(f,false);
    msg(err.name==='AbortError'?'Mạng chậm, đơn chưa được xác nhận. Vui lòng bấm <b>ĐẶT HÀNG</b> lại (không bị trùng đơn) hoặc gọi '+PHONE+'.'
      :String(err.message).indexOf('Thiếu')>-1?'Vui lòng kiểm tra lại họ tên, số điện thoại và địa chỉ.'
      :'Chưa gửi được đơn. Vui lòng bấm <b>ĐẶT HÀNG</b> lại hoặc đặt qua Zalo '+PHONE+'.')})
  .then(function(){clearTimeout(timer);sending=false});
}
function okView(o,p){
  inner.innerHTML='<div class="qo-ok"><div class="tick">✓</div><h3>Đặt hàng thành công!</h3><p style="margin:0;font-size:14px;color:#555">EYE VINA sẽ liên hệ xác nhận sớm. Cần hỗ trợ gọi <a href="tel:0989666559">'+PHONE+'</a>.</p>'+
   '<div class="sum">Mã đơn: <b>'+esc(o.orderId)+'</b><br>'+esc(p.name)+' x'+o.items[0].qty+'<br>Tạm tính: <b>'+f$(o.total)+'</b><br>Người nhận: '+esc(o.name)+' – '+esc(o.phone)+'<br>'+esc(o.address)+
   '<br>Độ mắt phải: '+esc(o.rightEye||'—')+' · Độ mắt trái: '+esc(o.leftEye||'—')+'</div>'+
   '<div class="urg">⚡ <b>Đơn cần giao gấp?</b> Chụp lại màn hình này và <a href="'+ZALO+'" target="_blank" rel="noopener" class="zc">gửi qua Zalo '+PHONE+'</a></div>'+
   '<button type="button" class="qo-go again">Tiếp tục mua sắm</button></div>';
  inner.querySelector('.again').onclick=close;
  inner.querySelector('.zc').onclick=function(){try{navigator.clipboard.writeText(lastText).then(function(){if(typeof toast==='function')toast('Đã sao chép đơn hàng – dán vào Zalo để gửi shop')},function(){})}catch(e){}};
  el.querySelector('.qo-box').scrollTop=0;
}
function open(i,qty){cur=i;q=Math.max(1,Math.min(99,qty||1));pending=null;formView();el.classList.add('open');document.documentElement.style.overflow='hidden';
  if(window.matchMedia('(min-width:700px)').matches)setTimeout(function(){var t=inner.querySelector('input[name=ten]');if(t)t.focus()},60)}
function close(){if(sending)return;el.classList.remove('open');document.documentElement.style.overflow=''}
window.quickOrder=open;

/* nút MUA NGAY trên trang sản phẩm → form đặt hàng trực tiếp */
if(typeof PD!=='undefined'){
  window.pdAdd=(function(orig){return function(now,btn){
    if(!now)return orig(now,btn);
    var qi=document.getElementById('pdQ');open(PD,qi?parseInt(qi.value,10)||1:1)}})(window.pdAdd);
}
})();
