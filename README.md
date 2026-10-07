# Microsoft REST API Guidelines — bản dịch tiếng Việt

Trang tra cứu tĩnh bằng tiếng Việt, dịch từ Microsoft REST API Guidelines. Repo Microsoft nằm nguyên trạng trong `source/`. Ứng dụng nằm trong `web/`.

Trang đang chạy tại <https://kidounguyen25.github.io/api-guidelines-vn/>, tự deploy bằng GitHub Pages mỗi lần push lên `main`.

## Chạy local

`source/` là git submodule trỏ tới microsoft/api-guidelines, nhánh `vNext`. Clone kèm submodule:

```powershell
git clone --recurse-submodules https://github.com/KidouNguyen25/api-guidelines-vn.git
cd api-guidelines-vn/web
npm install
npm run dev
```

Vite in địa chỉ local trong terminal. Dùng `npm run build` để tạo bản phân phối trong `web/dist/`; lệnh này chạy `npm run verify` trước.

## Nội dung

Bản dịch nằm trong `web/src/content/`, cùng cấu trúc thư mục với `source/`. Danh sách tài liệu, nhóm và thứ tự nằm ở `web/src/manifest.json`.

`npm run verify` so từng file dịch với bản gốc: số tiêu đề theo cấp, code block (phải giống từng ký tự), hàng bảng, mục danh sách, link, ảnh, thẻ HTML và từ khóa RFC 2119. Lệnh này không kiểm tra được nghĩa của câu dịch.

Hình minh họa động khai báo trong `web/src/diagrams/specs.ts`; mỗi hình gắn với một mục của tài liệu gốc.

Tiến độ đọc và điểm quiz lưu trong `localStorage` trên trình duyệt hiện tại.

## Nguồn và giấy phép

Tài liệu gốc: [microsoft/api-guidelines](https://github.com/microsoft/api-guidelines), nhánh `vNext`. Microsoft REST API Guidelines cấp phép theo [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Giữ thông tin tác giả, liên kết nguồn và giấy phép khi chia sẻ bản dịch.
