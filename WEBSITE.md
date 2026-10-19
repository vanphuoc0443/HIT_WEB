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

Website hoạt động không cần cài package và không tải thư viện bên ngoài. JavaScript bổ sung đổi sáng/tối, sao chép code và nút về đầu trang.

## GitHub Pages

Đẩy các thay đổi lên repo, vào Settings → Pages → Deploy from a branch, chọn nhánh chứa website và thư mục `/ (root)`. Trang chủ là `index.html`; bài học là `LessonN/README.html`.

Chưa thực hiện push hay thay đổi cài đặt Pages trong lần triển khai local này.
