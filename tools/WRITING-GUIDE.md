# Quy tắc viết bài tin tức – eyevina.com

## Thông tin thương hiệu (chỉ dùng đúng các thông tin này)
- EYE VINA (Eyevina): đơn vị cung cấp kính áp tròng sỉ, có hệ thống bán lẻ lens mắt tại Hà Nội và khu vực miền Bắc.
- Cửa hàng 1: 169/16 đường Nghĩa Lộ, Yên Nghĩa, Hà Đông, Hà Nội (Lens Shop Hà Đông) – chỉ đường: https://www.google.com/maps/dir/?api=1&destination=20.9525062,105.7385792
- Cửa hàng 2: 169 Minh Khai, Hai Bà Trưng, Hà Nội – chỉ đường: https://www.google.com/maps/dir/?api=1&destination=20.9956116,105.8558706
- Tư vấn & đặt hàng: Zalo 0989 666 559 (https://zalo.me/0989666559). Giao nhanh nội thành Hà Nội.
- Sản phẩm: kính áp tròng 1 ngày, 1 tháng, 3 tháng, 6 tháng; không màu, nâu, xám, đen, choco, xanh, tím; lens đáp ứng độ CẬN & CẬN LOẠN; lens thẩm mỹ che khuyết điểm; nước ngâm, nước nhỏ mắt, khay/hộp đựng; kính xuyên đêm, kính phân cực.
- Tên, giá, thông số, link sản phẩm: **chỉ lấy từ `tools/products.json`**. Không bịa giá, thông số, xuất xứ.

## Không được viết
- Không bịa: chính sách đổi trả/bảo hành, khuyến mãi, số năm hoạt động, số khách hàng, giải thưởng, chứng nhận, "chính hãng 100%", "rẻ nhất", "tốt nhất Hà Nội".
- Không chê bai hay so sánh hạ thấp cửa hàng khác. Có thể nhắc tên shop khác khách hay tìm một cách trung lập, nói rõ EYE VINA là thương hiệu độc lập.
- Không chẩn đoán, không hứa chữa bệnh mắt. Nội dung sức khỏe: khuyên đi khám bác sĩ nhãn khoa khi mắt đỏ, đau, nhìn mờ; không khuyến khích ngủ khi đeo lens hoặc đeo quá thời gian, kể cả khi mô tả sản phẩm ghi "24h".
- Không chép nguyên văn bài của web khác. Nếu tra cứu web, chỉ lấy kiến thức chung và viết lại bằng lời mới.
- Không dùng ảnh ngoài repo. Ảnh bìa lấy từ `images/sp/…`, `images/products/…` hoặc banner trong `images/`.

## Cấu trúc bài (body_html)
1. `<p class="art-lead">…</p>` – đoạn mở đầu 2–4 câu, có từ khóa chính, trả lời ngay câu hỏi của người tìm.
2. 5–8 mục `<h2 id="slug-khong-dau">…</h2>`, có thể có `<h3>`. Mỗi mục 2–4 đoạn `<p>` và/hoặc `<ul>/<ol>`.
3. Ít nhất 1 bảng khi hợp (giá, so sánh loại lens): bọc trong `<div class="tbl"><table>…</table></div>`, có `<thead>`.
4. 4–10 link nội bộ tới `/san-pham/…html` (đúng link trong products.json), 1 link `/#san-pham` hoặc `/tin-tuc.html`.
5. 1 mục về cửa hàng/đặt hàng (2 cửa hàng + Zalo) – ngắn, tự nhiên, ở nửa sau bài.
6. 1 mục "Lưu ý an toàn" ngắn khi chủ đề liên quan đeo lens.
7. Không viết FAQ, CTA, H1, mục lục, ảnh bìa, khung quảng cáo hay slider vào body: script tự thêm.
- Độ dài 1.200–1.800 từ (tối thiểu 900). Câu ngắn, dễ đọc trên điện thoại. Tiếng Việt có dấu chuẩn.
- Từ khóa chính xuất hiện ở title, h1, đoạn mở đầu, ít nhất 1 thẻ h2 và 3–6 lần trong bài; từ khóa phụ 1–3 lần mỗi cụm. Không nhồi.
- Chỉ dùng thẻ: p, h2, h3, ul, ol, li, strong, em, a, table, thead, tbody, tr, th, td, div class="tbl", br. Link ngoài thêm `target="_blank" rel="noopener"`.

## Trường JSON
- `slug`: không dấu, gạch nối, 4–9 từ, có từ khóa chính.
- `title`: 45–65 ký tự, từ khóa chính đứng đầu, kết thúc bằng "| EYE VINA" hoặc "– EYE VINA" nếu còn chỗ.
- `h1`: có thể dài hơn title, tự nhiên.
- `description`: 120–160 ký tự, có từ khóa chính + lợi ích + "EYE VINA".
- `card_title` ≤ 110 ký tự; `card_desc` 1–2 câu (~150–220 ký tự).
- `faq`: 4–6 câu hỏi người dùng hay tìm, trả lời 1–3 câu, đúng thông tin.
- `image_source`: ảnh sản phẩm liên quan nhất trong products.json (trường `images`), ưu tiên ảnh đầu.
- `topic`: chép tên chủ đề trong content-plan.md.

## Bài theo khu vực (quận/huyện Hà Nội, tỉnh lân cận) – ưu tiên từ 16/11/2026
Mục tiêu: người ở khu vực X tìm "shop lens X", "kính áp tròng X", "mua lens X", "nước ngâm lens X", "shop lens gần đây" thì tìm thấy EYE VINA.
- **Trung thực về địa điểm:** EYE VINA chỉ có 2 cửa hàng (Yên Nghĩa – Hà Đông và 169 Minh Khai – Hai Bà Trưng). Không viết hay ngụ ý có cửa hàng/chi nhánh/đại lý tại khu vực khác. Góc viết: "ở X mua lens ở đâu tiện" → ghé cửa hàng gần nhất hoặc đặt qua Zalo để được giao.
- **Không bịa:** thời gian di chuyển, số km, phí ship, thời gian giao, tên shop khác, địa danh không chắc. Chỉ nói chung: "nội thành Hà Nội giao nhanh", ngoại thành/tỉnh "nhắn Zalo 0989 666 559 để được báo cách giao và phí ship". Có thể nhắc tuyến đường lớn/khu vực nổi tiếng chỉ khi chắc chắn đúng.
- **Tên địa danh:** từ 1/7/2025 Hà Nội bỏ cấp quận/huyện (còn 126 xã, phường) và nhiều tỉnh đã sáp nhập (VD Hải Dương → TP Hải Phòng, Bắc Giang → Bắc Ninh, Thái Bình → Hưng Yên, Hà Nam/Nam Định → Ninh Bình, Vĩnh Phúc/Hòa Bình → Phú Thọ). Người dùng vẫn tìm theo tên cũ, nên dùng tên cũ làm từ khóa và nhắc 1 lần, trung lập, rằng khu vực nay thuộc đơn vị mới (VD "khu vực Hà Đông cũ", "Hải Dương – nay thuộc TP Hải Phòng"). Không tự ghi tên phường mới nếu không chắc.
- **Không trùng lặp (tránh bị Google coi là trang rác):** mỗi bài phải có góc riêng, KHÔNG thay mỗi tên địa danh. Đọc 2–3 bài khu vực đã đăng gần nhất trong `tin-tuc/` và đổi cấu trúc mục, ví dụ, bảng, sản phẩm gợi ý. Gợi ý góc riêng theo đối tượng thường gặp ở khu vực (sinh viên, dân văn phòng, gia đình, công nhân khu công nghiệp, khách đi xa cần mua online…) – viết chung chung, không đưa số liệu dân số/thống kê.
- **Nội dung bắt buộc:** (1) mở bài trả lời thẳng "ở X mua lens/kính áp tròng/nước ngâm lens ở đâu"; (2) cách mua: ghé cửa hàng gần nhất (ghi đúng địa chỉ + link chỉ đường Google Maps ở trên) hoặc đặt qua web/Zalo; (3) chọn lens theo nhu cầu (cận, cận loạn, màu, 1 ngày/1 tháng/3–6 tháng) có link sản phẩm thật; (4) mục riêng **nước ngâm lens & phụ kiện** có link Nước ngâm lens, X2 Solution, Qeye Care, Hộp bảo quản; (5) bảng giá tham khảo lấy đúng từ products.json; (6) lưu ý an toàn; (7) cần chuẩn bị gì khi đặt online (độ mắt phải/trái, toa đo mắt gần đây).
- Từ khóa chính: "shop lens X"; phụ: "kính áp tròng X", "mua lens X", "nước ngâm lens X", "shop lens gần đây". title VD: "Shop lens Cầu Giấy: mua kính áp tròng, nước ngâm lens | EYE VINA".
- Bài tỉnh: thêm 1 câu về EYE VINA cung cấp **kính áp tròng sỉ** cho shop/đại lý miền Bắc (liên hệ Zalo), không bịa điều kiện sỉ.
