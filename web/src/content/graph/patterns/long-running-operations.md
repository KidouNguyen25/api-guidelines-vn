# Thao tác chạy lâu

Mẫu thiết kế API của Microsoft Graph

*Mẫu thiết kế thao tác chạy lâu (LRO) cho phép mô hình hóa các thao tác mà việc xử lý request của client mất nhiều thời gian, nhưng client không bị chặn và có thể làm việc khác cho đến khi thao tác hoàn tất.*

## Vấn đề

Thiết kế API yêu cầu mô hình hóa các thao tác trên resource mà mất nhiều thời gian
để hoàn thành, sao cho các client của API không cần phải chờ và có thể tiếp tục
làm việc khác trong khi chờ kết quả cuối cùng của thao tác. Client nên có khả năng
theo dõi tiến trình của thao tác và có thể hủy thao tác nếu
cần.

API cần cung cấp một cơ chế để theo dõi công việc
đang được thực hiện ở chế độ nền. Cơ chế này cần được biểu diễn theo cùng
phong cách web như các API tương tác khác. Nó cũng cần hỗ trợ kiểm tra trạng thái và/hoặc
được thông báo bất đồng bộ về kết quả.

## Giải pháp

Giải pháp là mô hình hóa API như một dịch vụ đồng bộ, trả về một
resource đại diện cho việc hoàn tất hoặc thất bại cuối cùng của một thao tác
chạy lâu.

Giải pháp này có hai biến thể:

- Resource được trả về chính là resource đích và bao gồm trạng thái của
  thao tác. Mẫu thiết kế này thường được gọi là RELO (thao tác chạy lâu dựa trên resource).

<!-- markdownlint-disable MD033 -->
<p align="center">
  <img src="RELO.gif" alt="Luồng LRO status monitor"/>
</p>
<!-- markdownlint-enable MD033 -->

- Resource được trả về là một resource API mới gọi là *stepwise operation* và được tạo ra để theo dõi trạng thái. Giải pháp LRO này tương tự khái niệm Promise hoặc Future trong các ngôn ngữ lập trình khác.

<!-- markdownlint-disable MD033 -->
<p align="center">
  <img src="LRO.gif" alt="Luồng LRO status monitor"/>
</p>
<!-- markdownlint-enable MD033 -->

Mẫu thiết kế RELO là mẫu được ưu tiên cho các thao tác chạy lâu và nên được
dùng bất cứ khi nào có thể. Mẫu này tránh được sự phức tạp, và cách biểu diễn resource nhất quán giúp mọi thứ
đơn giản hơn cho người dùng và chuỗi công cụ của chúng ta.

- Với mẫu RELO, bạn nên trả về header Location cho biết vị trí của resource.
  - Response của API cho biết resource đích đang được tạo bằng cách trả về status code 201 và URI của resource được cung cấp trong header Location, nhưng response cho biết request chưa hoàn tất bằng cách bao gồm trạng thái "Provisioning".

- Với mẫu LRO, bạn nên trả về header Location cho biết vị trí của một resource stepwise operation mới.
  - Response của API cho biết resource operation đang được tạo tại URL được cung cấp trong header Location và cho biết request chưa hoàn tất bằng cách bao gồm status code 202.
  - Microsoft Graph không cho phép các resource operation ở phạm vi toàn tenant; do đó, các stepwise operation thường được mô hình hóa như một navigation property trên resource đích.

- Với hầu hết các triển khai của mẫu LRO (như ví dụ ở trên), sẽ cần 3 quyền để tuân thủ nguyên tắc đặc quyền tối thiểu: `ArchiveOperation.ReadWrite.All` để tạo entity `archiveOperation`, `ArchiveOperation.Read.All` để theo dõi entity `archiveOperation` cho đến khi hoàn tất, và `Archives.Read.All` để truy xuất `archive` được tạo ra từ thao tác đó.
Với các API mà lẽ ra được mô hình hóa như một `GET` đơn giản trên URL của resource, nhưng lại được mô hình hóa thành thao tác chạy lâu do yêu cầu về hiệu năng của MSGraph, thì chỉ cần quyền `Archive.Read.All` miễn là việc tạo entity `archiveOperation` là "an toàn".
Ở đây, "an toàn" nghĩa là việc tạo entity `archiveOperation` không có tác dụng phụ nào làm thay đổi chức năng của bất kỳ entity nào ngoài `archive` đang được truy xuất.
Yêu cầu này không có nghĩa là API phải idempotent, nhưng một API idempotent là đủ để đáp ứng yêu cầu này.

## Khi nào nên dùng mẫu thiết kế này

Bất kỳ lời gọi API nào được kỳ vọng mất hơn một giây ở phân vị thứ 99 đều nên dùng mẫu thiết kế thao tác chạy lâu.

Làm thế nào để chọn biến thể LRO nào? Nhà thiết kế API có thể làm theo các quy tắc kinh nghiệm sau:

1. Nếu một dịch vụ có thể tạo resource với độ trễ tối thiểu và tiếp tục cập nhật trạng thái của nó theo một mô hình chuyển trạng thái được xác định rõ ràng và ổn định cho đến khi hoàn tất, thì mô hình RELO là lựa chọn tốt nhất.

2. Nếu không, dịch vụ nên làm theo mẫu stepwise operation.
 
## Vấn đề và các điều cần cân nhắc

- Một hoặc nhiều bên sử dụng API MUST có thể theo dõi và thao tác trên cùng một resource tại cùng một thời điểm.

- Trạng thái của hệ thống SHOULD luôn có thể khám phá và kiểm tra được. Client
    SHOULD có thể xác định trạng thái hệ thống ngay cả khi resource theo dõi
    thao tác không còn hoạt động. Client MAY gửi GET trên một resource nào đó để
    xác định trạng thái của một thao tác chạy lâu.

- Mẫu thiết kế thao tác chạy lâu SHOULD hoạt động được cho cả client muốn "fire and forget"
    lẫn client muốn chủ động theo dõi và xử lý kết quả.

- Mẫu thiết kế thao tác chạy lâu có thể được bổ sung bằng [mẫu thiết kế thông báo thay đổi](./change-notification.md).

- Việc hủy một thao tác chạy lâu không nhất thiết có nghĩa là rollback. Tùy từng trường hợp do API định nghĩa, nó
    có thể có nghĩa là rollback, bù trừ, hoàn tất hoặc hoàn tất một phần,
    v.v. Sau một thao tác bị hủy, API nên trả về một trạng thái nhất quán cho phép
    tiếp tục phục vụ.

- Thời gian lưu giữ tối thiểu được khuyến nghị cho một stepwise operation là 24 giờ.
    Các operation SHOULD chuyển sang trạng thái "tombstone" trong một khoảng thời gian bổ sung
    trước khi bị xóa khỏi hệ thống.
    
- Các dịch vụ cung cấp resource operation mới MUST hỗ trợ ngữ nghĩa GET trên operation đó.
- Các dịch vụ trả về một operation mới MUST luôn trả về một LRO (ngay cả khi LRO được tạo ở trạng thái đã hoàn tất); nhờ đó các bên sử dụng API không phải xử lý hai dạng response khác nhau.

## Ví dụ

### Tạo resource mới bằng RELO

Một client muốn provision một cơ sở dữ liệu mới:

```
POST https://graph.microsoft.com/v1.0/storage/databases/

{
  "displayName": "Retail DB",
}
```

API phản hồi đồng bộ rằng cơ sở dữ liệu đã được tạo và cho biết
thao tác provisioning chưa hoàn tất hoàn toàn bằng cách bao gồm
header Content-Location và thuộc tính status trong payload của response:

```
HTTP/1.1 201 Created
Location: https://graph.microsoft.com/v1.0/storage/databases/db1

{
  "id": "db1",
  "displayName": "Retail DB",
  "status": "provisioning",
  [ … other fields for "database" …]
}
```

Client chờ một khoảng thời gian, rồi gửi một request khác để lấy trạng thái của cơ sở dữ liệu:

```
GET https://graph.microsoft.com/v1.0/storage/databases/db1

HTTP/1.1 200 Ok
{
  "id": "db1",
  "displayName": "Retail DB",
  "status": "succeeded",
  [ … other fields for "database" …]
}
```

### Hủy thao tác RELO

Một client muốn hủy việc provisioning một cơ sở dữ liệu mới:

```
DELETE https://graph.microsoft.com/v1.0/storage/databases/db1

```

API phản hồi đồng bộ rằng cơ sở dữ liệu đang được xóa và cho biết
thao tác đã được chấp nhận và chưa hoàn tất hoàn toàn bằng cách bao gồm
thuộc tính status trong payload của response. API có thể đưa ra
khuyến nghị chờ 30 giây:

```
HTTP/1.1 202 Accepted
Retry-After: 30

{
  "id": "db1",
  "displayName": "Retail DB",
  "status": "deleting",
  [ … other fields for "database" …]
}
```

Client chờ một khoảng thời gian, rồi gửi một request khác để lấy trạng thái xóa:

```
GET https://graph.microsoft.com/v1.0/storage/databases/db1

HTTP/1.1 404 Not Found
```
### Tạo resource mới bằng stepwise operation

```
POST https://graph.microsoft.com/v1.0/storage/archives/

{
  "displayName": "Image Archive",
  ...
}
```

API phản hồi đồng bộ rằng request đã được chấp nhận và bao gồm
header Location chứa một resource operation để polling tiếp:

```
HTTP/1.1 202 Accepted

Location: https://graph.microsoft.com/v1.0/storage/operations/123

```

### Polling một stepwise operation

```

GET https://graph.microsoft.com/v1.0/storage/operations/123
```

Server phản hồi rằng kết quả vẫn chưa sẵn sàng và có thể kèm khuyến nghị
chờ 30 giây:

```
HTTP/1.1 200 OK
Retry-After: 30

{
  "createdDateTime": "2015-06-19T12-01-03.4Z",
  "lastActionDateTime": "2015-06-19T12-01-03.45Z",
  "status": "running"
}
```

Client chờ 30 giây được khuyến nghị rồi gửi một request khác để lấy
kết quả của thao tác:

```
GET https://graph.microsoft.com/v1.0/storage/operations/123
```


Server phản hồi bằng một operation có "status:succeeded" kèm theo vị trí
của resource:

```
HTTP/1.1 200 OK

{
  "createdDateTime": "2015-06-19T12-01-03.45Z",
  "lastActionDateTime": "2015-06-19T12-06-03.0024Z",
  "status": "succeeded",
  "resourceLocation": "https://graph.microsoft.com/v1.0/storage/archives/987"
}
```

### Kích hoạt một action chạy lâu bằng stepwise operation

```
POST https://graph.microsoft.com/v1.0/storage/copyArchive

{
  "displayName": "Image Archive",
  "destination": "Second-tier storage"
...
}
```

API phản hồi đồng bộ rằng request đã được chấp nhận và bao gồm
header Location chứa một resource operation để polling tiếp:

```
HTTP/1.1 202 Accepted

Location: https://graph.microsoft.com/v1.0/storage/operations/123

```
