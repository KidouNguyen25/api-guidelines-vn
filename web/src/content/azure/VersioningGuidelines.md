# Hướng dẫn đánh phiên bản của Azure

## Lịch sử

<details>
  <summary>Mở rộng lịch sử thay đổi</summary>

| Date        | Notes                                                          |
| ----------- | -------------------------------------------------------------- |
| 2024-Nov-14 | Hướng dẫn đánh phiên bản dịch vụ Azure và thay đổi gây phá vỡ tương thích       |

</details>

## Hướng dẫn

Tài liệu này cung cấp danh sách "Nên và Không nên" để tuân thủ Chính sách đánh phiên bản và thay đổi gây phá vỡ tương thích của Azure,
như được ghi trong tài liệu [nội bộ](aka.ms/AzBreakingChangesPolicy) và [bên ngoài](https://learn.microsoft.com/azure/developer/intro/azure-service-sdk-tool-versioning).

:white_check_mark: **DO** kiểm tra kỹ lưỡng để bảo đảm API contract hoàn toàn đúng trước khi hợp nhất nó vào nhánh production của repository specs.

Việc kiểm thử giúp tránh các thay đổi "BugFix" đối với định nghĩa API. Cần kiểm thử ở cấp độ HTTP cũng như thông qua các SDK được sinh ra.

:white_check_mark: **DO** ngừng hoạt động mọi phiên bản API preview trước đó sau 90 ngày kể từ khi phát hành một phiên bản API GA hoặc preview mới.

:white_check_mark: **DO** liên hệ Azure Breaking Change Review board để phối hợp thông báo cho khách hàng
khi phát hành một phiên bản API đòi hỏi phải ngừng hoạt động một phiên bản trước đó.

:white_check_mark: **DO** tạo một phiên bản API preview mới cho mọi tính năng cần tiếp tục ở trạng thái preview sau khi phát hành GA mới.

:white_check_mark: **DO** dùng một ngày muộn hơn hẳn phiên bản API GA gần nhất khi phát hành
một phiên bản API preview mới.

:white_check_mark: **DO** deprovision mọi phiên bản API đã ngừng hoạt động. Các phiên bản API đã ngừng hoạt động phải hoạt động như
một phiên bản API không xác định (xem [ref](https://aka.ms/azapi/guidelines#versioning-api-version-unsupported)).

:white_check_mark: **DO** xóa các phiên bản API đã ngừng hoạt động khỏi repository azure-rest-api-specs.

:white_check_mark: **DO** xem xét mọi thay đổi đối với hành vi của dịch vụ có thể gây gián đoạn cho khách hàng cùng với Azure Breaking Changes review board, ngay cả khi thay đổi đó không thuộc định nghĩa API.

Một số ví dụ về thay đổi hành vi phải được xem xét:
- Áp dụng hoặc thay đổi giới hạn tốc độ theo hướng chặt chẽ hơn trước
- Thay đổi quyền cần có để thực thi thành công một thao tác

:no_entry: **DO NOT** thay đổi hành vi của một phiên bản API đang được cung cấp cho khách hàng, dù ở public preview hay GA.
Các thay đổi về hành vi luôn phải được đưa vào một phiên bản API mới, còn các phiên bản trước vẫn hoạt động như cũ.

:no_entry: **DO NOT** đưa vào các thay đổi gây phá vỡ tương thích so với phiên bản GA trước chỉ để đáp ứng các hướng dẫn của ARM hoặc Azure API.

Việc tránh thay đổi gây phá vỡ tương thích trong một API GA được ưu tiên hơn việc tuân thủ các hướng dẫn API và xử lý lỗi linter.

:no_entry: **DO NOT** giữ một tính năng preview ở trạng thái preview quá 1 năm; nó phải chuyển sang GA (hoặc bị gỡ bỏ) trong vòng 1 năm kể từ khi được giới thiệu.
