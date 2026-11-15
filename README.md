# EYE VINA – Shop Lens Hà Nội

Website tĩnh cho https://eyevina.com (GitHub Pages).

- `index.html` – trang chủ
- `images/`, `fonts/` – tài nguyên
- `404.html` – chuyển link cũ sang matngoc.vn
- `CNAME` – tên miền eyevina.com

## Nhận đơn hàng (Google Sheet + Email)
`apps-script/Code.gs` – dán vào Apps Script của Sheet "Đơn hàng eyevina.com", triển khai dạng Ứng dụng web (Thực thi: Tôi, Truy cập: Bất kỳ ai), rồi gắn URL `/exec` vào hằng `ORDER_ENDPOINT` trong `index.html`.
