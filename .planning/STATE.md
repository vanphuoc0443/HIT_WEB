# State

Đã chốt ánh xạ LessonN = Tuần N và thiết kế tham chiếu nền tối/cam.
Nguồn nội dung: README.md, Lesson1/theory.md, Lesson2/theory.md và ảnh gốc.
Quyết định: Python standard library sinh HTML tĩnh, không cài thêm dependencies.
Các tuần chưa có tài liệu có trang thông báo rõ ràng, không tạo lý thuyết giả.

Hoàn thành: trang chủ, 14 trang tuần, sidebar, mục lục, theme sáng/tối, sao chép code, responsive CSS.
Kiểm tra: 15 trang, 395 đường dẫn/tài nguyên/anchor hợp lệ; code blocks khớp Markdown; node --check đạt.
Browser QA: trang Tuần 2 hiển thị đúng trên desktop; đổi theme hoạt động. Chưa kiểm tra viewport mobile bằng trình duyệt.
Nhánh: main; origin: https://github.com/vanphuoc0443/HIT_WEB.git. Bản nền và logo đã push. Hướng dẫn trong WEBSITE.md.

## Taste refinement 2026-10-23

- Design read: tài liệu học web, giữ thương hiệu HIT và nền tối/cam; variance 4, motion 2, density 4.
- Audit: sidebar/mục lục chữ nhỏ; 14 thẻ có trọng lượng như nhau; mobile phải kéo cuối bài để đổi tuần; CTA light dùng màu chữ chưa phù hợp.
- Thay đổi: chữ body 16px, sidebar 12–13px, mục lục 11–12px; phân cấp hai bài đã có tài liệu; menu tuần native details đầu trang trên mobile; CTA sáng dùng chữ trắng; nút tối thiểu 44px; dùng IntersectionObserver cho nút về đầu.
- Giữ logo chính thức, màu cam, URL, nhãn điều hướng, nội dung lý thuyết, ảnh, code và anchor.
- Xác minh: 15 trang khớp script sinh HTML; 620 liên kết/assets/anchor hợp lệ; code blocks khớp Markdown; node --check đạt. Chưa browser QA trong phiên này.
- Môi trường: PowerShell đã ghi được; Python vẫn bị Controlled Folder Access chặn ghi. HTML đã cập nhật bằng PowerShell và so sánh read-only với generator.
## Web Lab redesign 2026-10-23

- Người dùng yêu cầu overhaul vì giao diện quá nhựa/AI, lỗi nút trống, cần showcase web và tối ưu UI/UX.
- Design read: trang học web thực hành, typography editorial sans, nền than và cam HIT; DESIGN_VARIANCE 7, MOTION_INTENSITY 6, VISUAL_DENSITY 4.
- Lỗi gốc: .prose a ghi đè chữ của nút thành cam trên nền cam. Đã sửa bằng .prose a.primary và token --on-accent; kiểm tra computed contrast tối 8.40:1, sáng 6.33:1.
- Trang chủ riêng, bỏ sidebar lặp; giữ logo, URL, tên tuần và nguồn bài. Hero đi cùng Flexbox playground thật; lộ trình dạng hàng, search không dấu, lọc có tài liệu, trạng thái không tìm thấy/reset, đọc tiếp tuần gần nhất.
- Animation: entrance, IntersectionObserver reveal một lần, FLIP Web Animations cho Flexbox, hover phản hồi, CSS scroll-driven reading progress. Hỗ trợ reduced motion, không scroll event loop, không thư viện production.
- Bài đọc: sidebar/mục lục, mục lục mobile, anchor heading, copy có fallback chọn mã, nút về đầu, prev/next rõ ràng.
- Xác minh: Edge headless 1440/390/320px, 2 theme, no overflow kể cả gap tối đa; các tương tác đạt, không JS errors; 15 trang/672 đường dẫn/assets/anchor hợp lệ; code blocks giữ nguyên.
- Ảnh desktop/mobile/CTA được kiểm tra trong thư mục visualizations của chat. Không thêm ảnh QA vào repo.
- Build hỗ trợ --stdout; PowerShell đã ghi 15 trang từ JSON build. Website không cần dependencies; Playwright chỉ dùng cho QA.
- Chưa push bản redesign trong lượt này.

## Try it Yourself 2026-10-23

- Theo yêu cầu người dùng: thêm editor đơn giản kiểu W3Schools cho từng ví dụ runnable.
- assets/try-it.js chỉ tải ở trang có code; bổ sung nút Thử ngay cho HTML/CSS/JS, không bổ sung cho Bash/Git.
- Native dialog, ba tab textarea có label/keyboard navigation, run/reset, Ctrl/Meta+Enter, iframe preview, lỗi JS, Escape/return focus. Mobile xếp dọc, desktop chia đôi.
- iframe sandbox chỉ allow-scripts, opaque origin; CSP hạn chế kết nối/form/base, không allow-same-origin; diagnostics chỉ nhận message đúng iframe và token từng lần chạy. Đóng dialog xóa srcdoc để dừng timer.
- Giữ code gốc trong bài; editor riêng cho phép sửa tạm. Ví dụ link style.css/script.js có companion content; preview dùng tab CSS/JS như nội dung file tương ứng.
- Kiểm tra: check_try_it.cjs và check_ui.cjs đạt; viewport desktop/mobile 390/320, sandbox không chạm parent, JS error/reset/focus/keyboard, HTML/CSS/JS và ví dụ linked file chạy được.
- check_site: 15 trang, 674 link/assets/anchor hợp lệ; toàn bộ code blocks khớp Markdown. node --check đạt.
- Đã xem screenshot desktop/mobile trong thư mục visualizations. Chưa push tính năng này.

## Footer và control polish 2026-10-23

- Footer dùng chữ GitHub cá nhân / @vanphuoc0443, mô tả bên dưới, link mã nguồn riêng; không logo hay icon trang trí.
- Giảm mũi tên ở header, CTA, hàng tuần, Markdown, try editor; giữ prev/next mang ý nghĩa điều hướng. Về đầu trang dùng chữ.
- Control radius 6px; tabs, segmented, filter dùng nền/viền cho selected state, focus/hover rõ ràng; CSS/JS editor và copy/run cùng hệ control.
- Kiểm tra: check_ui và check_try_it đều đạt; footer đúng link GitHub, không icon trang trí, mobile 320px không tràn; check_site 15 trang/659 liên kết hợp lệ; code Markdown giữ nguyên.
- Đã xem ảnh footer desktop/mobile; chưa push lần chỉnh sửa này.
