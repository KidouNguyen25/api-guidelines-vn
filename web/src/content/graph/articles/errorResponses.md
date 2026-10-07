# Response cho điều kiện lỗi

Đối với các điều kiện không thành công, nhà phát triển SHOULD có thể viết một đoạn code duy nhất xử lý lỗi một cách nhất quán trên các dịch vụ Microsoft REST API khác nhau.
Điều này cho phép xây dựng hạ tầng đơn giản và đáng tin cậy để xử lý ngoại lệ như một luồng tách biệt với các response thành công.
Nội dung dưới đây dựa trên đặc tả OData v4 JSON.
Tuy nhiên, nó rất tổng quát và không đòi hỏi các cấu trúc OData cụ thể.
API SHOULD dùng định dạng này ngay cả khi không dùng các cấu trúc OData khác.

Response lỗi MUST là một đối tượng JSON duy nhất.
Đối tượng này MUST có một cặp name/value với tên "error". Giá trị MUST là một đối tượng JSON.

Đối tượng này MUST chứa các cặp name/value với tên "code" và "message", và MAY chứa các cặp name/value với tên "target", "details" và "innererror."

Giá trị của cặp name/value "code" là một chuỗi không phụ thuộc ngôn ngữ và MUST khớp với mô tả HTTP response status code, được chuyển sang camelCase, như được liệt kê trong [Status Code Registry (iana.org)](https://www.iana.org/assignments/http-status-codes/http-status-codes.xhtml)
Ví dụ, nếu HTTP status code là "Not Found", thì giá trị "code" MUST là "notFound".

Hầu hết các dịch vụ sẽ cần nhiều mã lỗi cụ thể hơn, và các mã này không phải client nào cũng quan tâm.
Các mã lỗi này SHOULD được cung cấp trong cặp name/value "innererror" như mô tả bên dưới.
Việc đưa vào một giá trị mới cho "code" mà client hiện có nhìn thấy là một thay đổi gây phá vỡ tương thích (breaking change) và đòi hỏi tăng phiên bản.
Dịch vụ có thể tránh breaking change bằng cách thêm các mã lỗi mới vào "innererror" thay thế.

Giá trị của cặp name/value "message" MUST là biểu diễn lỗi mà con người đọc được.
Nó nhằm hỗ trợ nhà phát triển và không phù hợp để hiển thị cho người dùng cuối.
Dịch vụ muốn cung cấp thông điệp phù hợp cho người dùng cuối MUST làm điều đó thông qua một [odata-json-annotations](https://docs.oasis-open.org/odata/odata-json-format/v4.01/cs02/odata-json-format-v4.01-cs02.html#sec_AnnotateaJSONObject) hoặc một thuộc tính tùy chỉnh.
Dịch vụ SHOULD NOT bản địa hóa "message" cho người dùng cuối, vì làm vậy có thể khiến giá trị trở nên khó đọc đối với nhà phát triển ứng dụng đang ghi log giá trị đó, đồng thời làm giá trị khó tìm kiếm hơn trên Internet.

Giá trị của cặp name/value "target" là đích của lỗi cụ thể đó (ví dụ: tên của thuộc tính bị lỗi).

Giá trị của cặp name/value "details" MUST là một mảng các đối tượng JSON, trong đó MUST chứa các cặp name/value cho "code" và "message", và MAY chứa một cặp name/value cho "target", như mô tả ở trên.
Các đối tượng trong mảng "details" thường biểu diễn những lỗi riêng biệt nhưng có liên quan xảy ra trong quá trình xử lý request.
Xem ví dụ bên dưới.

Giá trị của cặp name/value "innererror" MUST là một đối tượng.
Nội dung của đối tượng này do dịch vụ định nghĩa.
Dịch vụ muốn trả về các lỗi cụ thể hơn mã ở cấp gốc MUST làm điều đó bằng cách thêm một cặp name/value cho "code" và một "innererror" lồng nhau. Mỗi đối tượng "innererror" lồng nhau biểu diễn mức chi tiết cao hơn đối tượng cha của nó.
Khi đánh giá lỗi, client MUST duyệt qua tất cả các "innererror" lồng nhau và chọn cái sâu nhất mà chúng hiểu được.
Cơ chế này cho phép dịch vụ đưa các mã lỗi mới vào bất kỳ vị trí nào trong hệ thống phân cấp mà không phá vỡ tính tương thích ngược, miễn là các mã lỗi cũ vẫn xuất hiện.
Dịch vụ MAY trả về các mức độ sâu và chi tiết khác nhau cho các bên gọi khác nhau.
Ví dụ, trong môi trường phát triển, "innererror" sâu nhất MAY chứa thông tin nội bộ giúp gỡ lỗi dịch vụ.
Để phòng ngừa các mối lo ngại bảo mật tiềm ẩn về việc lộ thông tin, dịch vụ SHOULD cẩn thận để không vô tình để lộ quá nhiều chi tiết.
Các đối tượng lỗi MAY cũng bao gồm các cặp name/value tùy chỉnh do server định nghĩa mà MAY dành riêng cho từng code.
Các kiểu lỗi có thuộc tính tùy chỉnh do server định nghĩa SHOULD được khai báo trong tài liệu metadata của dịch vụ.
Xem ví dụ bên dưới.

Response lỗi MAY chứa các annotation OData JSON trong bất kỳ đối tượng JSON nào của chúng.

Chúng tôi khuyến nghị rằng đối với mọi lỗi tạm thời có thể được thử lại, dịch vụ SHOULD đưa vào một header HTTP Retry-After cho biết số giây tối thiểu mà client SHOULD chờ trước khi thử lại thao tác.

## ErrorResponse : Object

Thuộc tính | Kiểu | Bắt buộc | Mô tả
-------- | ---- | -------- | -----------
`error` | Error | ✔ | Đối tượng lỗi.

## Error : Object

Thuộc tính | Kiểu | Bắt buộc | Mô tả
-------- | ---- | -------- | -----------
`code` | String | ✔ | Một trong tập mã lỗi do server định nghĩa.
`message` | String | ✔ | Biểu diễn lỗi mà con người đọc được.
`target` | String |  | Đích của lỗi.
`details` | Error[] |  | Một mảng chi tiết về các lỗi cụ thể dẫn đến lỗi được báo cáo này.
`innererror` | InnerError |  | Một đối tượng chứa thông tin cụ thể hơn đối tượng hiện tại về lỗi.

## InnerError : Object

Thuộc tính | Kiểu | Bắt buộc | Mô tả
-------- | ---- | -------- | -----------
`code` | String |  | Một mã lỗi cụ thể hơn mã do lỗi chứa nó cung cấp.
`innererror` | InnerError |  | Một đối tượng chứa thông tin cụ thể hơn đối tượng hiện tại về lỗi.

## Ví dụ

Ví dụ về "innererror":

```json
{
  "error": {
    "code": "unauthorized",
    "message": "Previous passwords may not be reused",
    "target": "password",
    "innererror": {
      "code": "passwordError",
      "innererror": {
        "code": "passwordDoesNotMeetPolicy",
        "minLength": "6",
        "maxLength": "64",
        "characterTypes": ["lowerCase","upperCase","number","symbol"],
        "minDistinctCharacterTypes": "2",
        "innererror": {
          "code": "passwordReuseNotAllowed"
        }
      }
    }
  }
}
```

Trong ví dụ này, mã lỗi cơ bản nhất là "unauthorized", nhưng đối với những client quan tâm, có các mã lỗi cụ thể hơn trong "innererror."
Mã "passwordReuseNotAllowed" có thể đã được dịch vụ bổ sung về sau, trước đó chỉ trả về "passwordDoesNotMeetPolicy."
Các client hiện có không bị lỗi khi mã lỗi mới được thêm vào, nhưng các client mới MAY tận dụng nó.
Lỗi "passwordDoesNotMeetPolicy" cũng bao gồm các cặp name/value bổ sung cho phép client xác định cấu hình của server, xác thực đầu vào của người dùng theo cách lập trình, hoặc trình bày các ràng buộc của server cho người dùng bằng thông điệp được bản địa hóa của chính client.

Ví dụ về "details":

```json
{
  "error": {
    "code": "badRequest",
    "message": "Multiple errors in ContactInfo data",
    "target": "contactInfo",
    "details": [
      {
        "code": "nullValue",
        "target": "phoneNumber",
        "message": "Phone number must not be null"
      },
      {
        "code": "nullValue",
        "target": "lastName",
        "message": "Last name must not be null"
      },
      {
        "code": "malformedValue",
        "target": "address",
        "message": "Address is not valid"
      }
    ]
  }
}
```

Trong ví dụ này, request có nhiều vấn đề, với từng lỗi riêng lẻ được liệt kê trong "details."
