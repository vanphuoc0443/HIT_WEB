# Website lý thuyết HIT Web Private 2026

Lesson1 = Tuần 1, Lesson2 = Tuần 2; các tuần còn lại theo bảng trong README.md.

## Xem website

Mở `index.html` trực tiếp hoặc chạy từ thư mục repo:

```sh
python -m http.server 8080
```

Truy cập http://localhost:8080. Có thể dùng Live Server trong VS Code.

## Cập nhật nội dung

1. Sửa `LessonN/theory.md`; ảnh đặt trong `LessonN/img/`, liên kết tương đối `img/ten-anh.png`.
2. Sửa chủ đề trong bảng README.md nếu cần.
3. Chạy `python scripts/build_site.py`, sau đó `python scripts/check_site.py`.
4. Commit cả Markdown và các file HTML đã sinh.

Trình sinh hỗ trợ các định dạng đang dùng trong repo: tiêu đề, đoạn văn, danh sách dấu gạch, bảng, liên kết, ảnh, chữ đậm, inline code và fenced code. Đây là bộ chuyển đổi cho nội dung repo, không phải toàn bộ chuẩn Markdown. Không sửa trực tiếp HTML sinh tự động.

Website hoạt động không cần cài package và không tải thư viện bên ngoài. JavaScript bổ sung CSS playground, tìm kiếm không dấu, lọc bài đã có tài liệu, đọc tiếp tuần gần nhất, đổi theme, sao chép code, mục lục và chuyển động có hỗ trợ prefers-reduced-motion.

## GitHub Pages

Đẩy các thay đổi lên repo, vào Settings → Pages → Deploy from a branch, chọn nhánh chứa website và thư mục `/ (root)`. Trang chủ là `index.html`; bài học là `LessonN/README.html`.

Remote hiện tại: https://github.com/vanphuoc0443/HIT_WEB. Bản thiết kế Web Lab mới được lưu local; chưa push trong lần chỉnh giao diện này.

## Sinh HTML bằng PowerShell

Nếu Windows bảo vệ thư mục Documents và chỉ cho phép PowerShell ghi, script hỗ trợ xuất HTML qua stdout:

```powershell
$pages = python scripts/build_site.py --stdout | ConvertFrom-Json
foreach ($page in $pages.PSObject.Properties) {
    Set-Content -LiteralPath $page.Name -Value $page.Value -Encoding utf8 -NoNewline
}
python scripts/check_site.py
```

Chế độ này sinh cùng nội dung với lệnh build mặc định.

## Kiểm tra giao diện

`scripts/check_ui.cjs` dùng Playwright có sẵn trong môi trường kiểm thử và Edge headless. Không phải dependency của website. Chạy `node scripts/check_ui.cjs` khi môi trường đã có Playwright trong module search path. Đặt `HIT_QA_DIR` nếu muốn chụp ảnh preview; bỏ qua biến này để chỉ kiểm thử.

Kiểm tra gồm: viewport 1440/390/320px, theme sáng/tối, tương phản chữ nút, tràn ngang, menu mobile/mục lục, Flexbox/gap, tìm kiếm không dấu, lọc/reset, copy code, đọc tiếp, lưu theme và lỗi JavaScript.
## Thử ngay / Try it Yourself

Trong Tuần 1 và Tuần 2, các khối code HTML/CSS/JavaScript có nút **Thử ngay ↗**. Học viên sửa trong ba tab, nhấn **Chạy** (Ctrl/⌘ + Enter), xem kết quả bên cạnh và có thể **Đặt lại** ví dụ. Esc đóng khung và trả focus về bài học. Mobile xếp phần code trên phần kết quả.

Code chạy trong iframe sandbox riêng, không có quyền truy cập trang bài học; không gửi mã lên server. Các tab CSS/JS được ghép trực tiếp với HTML. Với đoạn tham chiếu `style.css`/`script.js` của bài hiện tại, trình thử chuẩn bị nội dung mẫu tương ứng. Tài nguyên ngoài không được bảo đảm trong editor; lệnh Git/Bash chỉ để đọc và sao chép.

Kiểm thử riêng: `node scripts/check_try_it.cjs` (dùng môi trường Playwright/Edge như bộ QA giao diện). Script kiểm tra cả code sửa được, kết quả tương tác, báo lỗi, sandbox, đặt lại, bàn phím và mobile.
