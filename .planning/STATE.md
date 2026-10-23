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