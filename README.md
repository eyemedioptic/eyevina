# EYE VINA – Shop Lens Hà Nội

Website tĩnh cho https://eyevina.com (GitHub Pages).

- `index.html` – trang chủ
- `san-pham/*.html` – 58 trang chi tiết sản phẩm (nút Thêm vào giỏ / Đặt mua ngay dùng chung giỏ hàng)
- `tin-tuc.html` – trang tin tức (45 bài, link chi tiết sang matngoc.vn)
- `images/`, `fonts/` – tài nguyên
- `404.html` – link sản phẩm cũ /dich-vu/... -> /san-pham/...; link khác -> matngoc.vn
- `CNAME` – tên miền eyevina.com

## Nhận đơn hàng (Google Sheet + Email)
`apps-script/Code.gs` – dán vào Apps Script của Sheet "Đơn hàng eyevina.com", triển khai dạng Ứng dụng web (Thực thi: Tôi, Truy cập: Bất kỳ ai), URL `/exec` đã gắn vào hằng `ORDER_ENDPOINT` trong `index.html`. Khi sửa Code.gs: Triển khai › Quản lý triển khai › sửa › Phiên bản mới (giữ nguyên URL).
