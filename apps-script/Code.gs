/**
 * EYE VINA – Nhận đơn hàng từ website, ghi vào Google Sheet và gửi email.
 * Sheet: "Đơn hàng eyevina.com" (tab "Đơn hàng")
 *
 * CÁCH CÀI (làm 1 lần):
 * 1. Mở Google Sheet đơn hàng > Tiện ích mở rộng > Apps Script.
 * 2. Xóa code mẫu, dán toàn bộ file này vào, bấm Lưu.
 * 3. Bấm Triển khai > Tùy chọn triển khai mới > Loại: Ứng dụng web
 *      - Thực thi dưới dạng: Tôi
 *      - Người có quyền truy cập: Bất kỳ ai
 *    Bấm Triển khai, cấp quyền, rồi sao chép "URL ứng dụng web" (…/exec).
 * 4. Gửi URL đó để gắn vào website.
 */

// Email nhận thông báo đơn hàng (nhiều email cách nhau bằng dấu phẩy)
const EMAIL_TO = 'eyevina.co@gmail.com';
const SHEET_NAME = 'Đơn hàng';

const HEADERS = ['Thời gian', 'Mã đơn', 'Đơn hàng từ website', 'Mã sản phẩm', 'Tên sản phẩm',
  'Số lượng', 'Đơn giá', 'Thành tiền', 'Tổng đơn', 'Họ tên', 'Điện thoại',
  'Địa chỉ nhận hàng', 'Độ mắt phải', 'Độ mắt trái', 'Trạng thái'];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const d = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (d.website_hp) return json_({ ok: true }); // bẫy spam (ô ẩn)

    const order = {
      id: clean_(d.orderId, 30) || ('EV' + Date.now()),
      site: clean_(d.website, 100) || 'eyevina.com',
      name: clean_(d.name, 100),
      phone: clean_(d.phone, 20),
      address: clean_(d.address, 300),
      right: clean_(d.rightEye, 60),
      left: clean_(d.leftEye, 60),
      items: (Array.isArray(d.items) ? d.items : []).slice(0, 50).map(function (it) {
        return {
          code: clean_(it.code, 30), name: clean_(it.name, 200),
          qty: Math.max(1, Math.min(99, parseInt(it.qty, 10) || 1)),
          price: Math.max(0, parseInt(it.price, 10) || 0)
        };
      })
    };
    if (!order.name || !/^[0-9+ ]{9,15}$/.test(order.phone) || !order.address || !order.items.length) {
      return json_({ ok: false, error: 'Thiếu thông tin đơn hàng' });
    }
    // Chống trùng đơn: cùng mã đơn gửi lại (do mạng chậm) chỉ ghi 1 lần
    const cache = CacheService.getScriptCache();
    if (cache.get('ord_' + order.id)) return json_({ ok: true, orderId: order.id, duplicate: true });

    const total = order.items.reduce(function (s, it) { return s + it.qty * it.price; }, 0);

    // Ghi vào Sheet – mỗi sản phẩm 1 dòng, cùng mã đơn
    const sh = sheet_();
    const now = new Date();
    const rows = order.items.map(function (it) {
      return [now, order.id, order.site, it.code, it.name, it.qty, it.price, it.qty * it.price, total,
        safe_(order.name), safe_(order.phone), safe_(order.address), safe_(order.right), safe_(order.left), 'Mới'];
    });
    sh.getRange(sh.getLastRow() + 1, 1, rows.length, HEADERS.length).setValues(rows);

    // Gửi email
    MailApp.sendEmail({
      to: EMAIL_TO,
      subject: '🛒 Đơn hàng mới ' + order.id + ' – ' + order.name + ' – ' + money_(total),
      htmlBody: emailHtml_(order, total, now),
      name: 'EYE VINA – Đơn hàng website'
    });
    cache.put('ord_' + order.id, '1', 21600); // nhớ 6 giờ
    return json_({ ok: true, orderId: order.id });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return json_({ ok: true, service: 'EYE VINA order endpoint' });
}

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) {
    sh.appendRow(HEADERS);
    sh.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold').setBackground('#333333').setFontColor('#ffffff');
    sh.setFrozenRows(1);
    sh.getRange('A:A').setNumberFormat('dd/MM/yyyy HH:mm');
    sh.getRange('G:I').setNumberFormat('#,##0" đ"');
  }
  return sh;
}

function emailHtml_(o, total, now) {
  const tz = Session.getScriptTimeZone() || 'Asia/Ho_Chi_Minh';
  const td = 'style="border:1px solid #ddd;padding:8px"';
  const rows = o.items.map(function (it) {
    return '<tr><td ' + td + '>' + esc_(it.code) + '</td><td ' + td + '>' + esc_(it.name) + '</td><td ' + td +
      ' align="center">' + it.qty + '</td><td ' + td + ' align="right">' + money_(it.price) + '</td><td ' + td +
      ' align="right">' + money_(it.qty * it.price) + '</td></tr>';
  }).join('');
  const info = [['Đơn hàng từ website', o.site], ['Mã đơn', o.id],
    ['Thời gian', Utilities.formatDate(now, tz, 'dd/MM/yyyy HH:mm')],
    ['Họ tên', o.name], ['Điện thoại', o.phone], ['Địa chỉ nhận hàng', o.address],
    ['Độ mắt phải', o.right || '—'], ['Độ mắt trái', o.left || '—']]
    .map(function (r) { return '<tr><td ' + td + ' width="170"><b>' + r[0] + '</b></td><td ' + td + '>' + esc_(r[1]) + '</td></tr>'; }).join('');
  return '<div style="font-family:Arial,sans-serif;font-size:14px;color:#222;max-width:680px">' +
    '<h2 style="margin:0 0 12px">Đơn hàng mới từ ' + esc_(o.site) + '</h2>' +
    '<table style="border-collapse:collapse;width:100%;margin-bottom:16px">' + info + '</table>' +
    '<table style="border-collapse:collapse;width:100%"><tr style="background:#333;color:#fff">' +
    '<th ' + td + '>Mã SP</th><th ' + td + '>Tên sản phẩm</th><th ' + td + '>SL</th><th ' + td + '>Giá</th><th ' + td + '>Thành tiền</th></tr>' +
    rows + '<tr><td ' + td + ' colspan="4" align="right"><b>Tổng đơn</b></td><td ' + td + ' align="right"><b style="color:#de1820">' +
    money_(total) + '</b></td></tr></table>' +
    '<p style="margin-top:16px">Gọi khách: <a href="tel:' + esc_(o.phone) + '">' + esc_(o.phone) + '</a> · Zalo: <a href="https://zalo.me/' +
    esc_(o.phone.replace(/\D/g, '')) + '">zalo.me/' + esc_(o.phone.replace(/\D/g, '')) + '</a></p></div>';
}

function clean_(v, max) { return String(v == null ? '' : v).replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, max); }
// Chặn chèn công thức vào Sheet, đồng thời giữ "-2.50" dạng chữ
function safe_(v) { return /^[=+\-@]/.test(v) ? "'" + v : v; }
function esc_(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function money_(n) { return Number(n).toLocaleString('vi-VN') + ' đ'; }
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
