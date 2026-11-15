# EYE VINA – Shop Lens Hà Nội

Website tĩnh cho https://eyevina.com (GitHub Pages).

- `index.html` – trang chủ
- `tin-tuc.html` – trang tin tức (45 bài, link chi tiết sang matngoc.vn)
- `images/`, `fonts/` – tài nguyên
- `404.html` – chuyển link cũ sang matngoc.vn
- `CNAME` – tên miền eyevina.com

## Nhận đơn hàng (Google Sheet + Email)
`apps-script/Code.gs` – dán vào Apps Script của Sheet "Đơn hàng eyevina.com", triển khai dạng Ứng dụng web (Thực thi: Tôi, Truy cập: Bất kỳ ai), URL `/exec` đã gắn vào hằng `ORDER_ENDPOINT` trong `index.html`. Khi sửa Code.gs: Triển khai › Quản lý triển khai › sửa › Phiên bản mới (giữ nguyên URL).
