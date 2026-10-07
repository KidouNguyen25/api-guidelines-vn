# Microsoft Azure REST API Guidelines

<!-- cspell:ignore autorest, BYOS, etag, idempotency, maxpagesize, innererror, trippable, nextlink, condreq, etags -->
<!-- markdownlint-disable MD033 MD049 MD055 -->

<!--
Note to contributors: All guidelines now have an anchor tag to allow cross-referencing from associated tooling.
The anchor tags within a section using a common prefix to ensure uniqueness with anchor tags in other sections.
Please ensure that you add an anchor tag to any new guidelines that you add and maintain the naming convention.
-->

## Lịch sử

<details>
  <summary>Mở rộng lịch sử thay đổi</summary>

| Ngày        | Ghi chú                                                        |
| ----------- | -------------------------------------------------------------- |
| 2025-Mar-28 | Bổ sung hướng dẫn về ID trong JSON và giá trị null             |
| 2024-Mar-17 | Cập nhật hướng dẫn về LRO                                      |
| 2024-Jan-17 | Bổ sung hướng dẫn về việc trả về offset và độ dài của chuỗi    |
| 2023-May-12 | Giải thích response của dịch vụ khi thiếu/không hỗ trợ `api-version` |
| 2023-Apr-21 | Cập nhật/làm rõ hướng dẫn về tính lặp lại (repeatability) của phương thức POST |
| 2023-Apr-07 | Cập nhật/làm rõ hướng dẫn về đa hình                           |
| 2022-Sep-07 | Cập nhật hướng dẫn về URL theo DNS Done Right                  |
| 2022-Jul-15 | Cập nhật hướng dẫn về thao tác chạy lâu                        |
| 2022-May-11 | Bỏ hướng dẫn về khám phá phiên bản                             |
| 2022-Mar-29 | Bổ sung hướng dẫn về việc sử dụng duration                     |
| 2022-Mar-25 | Cập nhật hướng dẫn cho giá trị ngày trong header theo RFC 7231 |
| 2022-Feb-01 | Cập nhật hướng dẫn về lỗi                                      |
| 2021-Sep-11 | Bổ sung hướng dẫn về thao tác chạy lâu                         |
| 2021-Aug-06 | Cập nhật Azure REST Guidelines theo Azure API Stewardship Board. |
| 2020-Jul-31 | Bổ sung lời khuyên cho dịch vụ về các phiên bản đầu tiên       |
| 2020-Mar-31 | Bản phát hành công khai đầu tiên của Azure REST API Guidelines |

</details>

## Giới thiệu

Các hướng dẫn này áp dụng cho các nhóm dịch vụ Azure triển khai API _data plane_. Chúng đưa ra hướng dẫn mang tính quy chuẩn mà các nhóm dịch vụ Azure MUST tuân theo nhằm đảm bảo khách hàng có trải nghiệm tuyệt vời, bằng cách thiết kế các API đáp ứng những mục tiêu sau:
- Thân thiện với nhà phát triển nhờ các mẫu thiết kế nhất quán và các chuẩn web (HTTP, REST, JSON)
- Hiệu quả và tiết kiệm chi phí
- Hoạt động tốt với SDK trong nhiều ngôn ngữ lập trình
- Khách hàng có thể xây dựng ứng dụng chịu lỗi (fault-tolerant) nhờ hỗ trợ retry/tính idempotent/optimistic concurrency
- Bền vững và có thể đánh phiên bản nhờ các hợp đồng API rõ ràng với 2 yêu cầu:
  1. Workload của khách hàng không bao giờ được hỏng do thay đổi của dịch vụ
  2. Khách hàng có thể chuyển sang một phiên bản mà không cần thay đổi code

Công nghệ và phần mềm luôn thay đổi và phát triển, do đó tài liệu này được xem là một tài liệu sống. [Hãy mở một issue](https://github.com/microsoft/api-guidelines/issues/new/choose) để đề xuất thay đổi hoặc ý tưởng mới. Vui lòng đọc [Các cân nhắc khi thiết kế dịch vụ](./ConsiderationsForServiceDesign.md) để có phần giới thiệu về chủ đề thiết kế API cho các dịch vụ Azure. *Đối với một dịch vụ đã GA, đừng thay đổi/làm hỏng API hiện có của nó; thay vào đó, hãy tận dụng các khái niệm này cho các API trong tương lai đồng thời ưu tiên tính nhất quán trong dịch vụ hiện có của bạn.*

*Lưu ý: Nếu bạn đang tạo một API management plane (ARM), vui lòng tham khảo [Azure Resource Manager Resource Provider Contract](https://github.com/cloud-and-ai-microsoft/resource-provider-contract).*

### Hướng dẫn mang tính quy chuẩn
Tài liệu này đưa ra hướng dẫn mang tính quy chuẩn được gán nhãn như sau:

:white_check_mark: **DO** áp dụng mẫu thiết kế này. Nếu bạn cho rằng mình cần một ngoại lệ, hãy liên hệ Azure HTTP/REST Stewardship Board **trước** khi triển khai.

:ballot_box_with_check: **YOU SHOULD** áp dụng mẫu thiết kế này. Nếu không làm theo lời khuyên này, bạn MUST nêu lý do trong buổi review của Azure HTTP/REST Stewardship Board.

:heavy_check_mark: **YOU MAY** cân nhắc mẫu thiết kế này nếu phù hợp với tình huống của bạn. Không cần thông báo cho Azure HTTP/REST Stewardship Board.

:warning: **YOU SHOULD NOT** áp dụng mẫu thiết kế này. Nếu không làm theo lời khuyên này, bạn MUST nêu lý do trong buổi review của Azure HTTP/REST Stewardship Board.

:no_entry: **DO NOT** áp dụng mẫu thiết kế này. Nếu bạn cho rằng mình cần một ngoại lệ, hãy liên hệ Azure HTTP/REST Stewardship Board **trước** khi triển khai.

*Nếu bạn cho rằng mình cần một ngoại lệ, hoặc cần làm rõ dựa trên tình huống của mình, vui lòng liên hệ Azure HTTP/REST Stewardship Board **trước** khi phát hành API của bạn.*

## Các khối nền tảng: HTTP, REST và JSON
Nền tảng đám mây Microsoft Azure cung cấp các API của mình thông qua các khối nền tảng cốt lõi của Internet, cụ thể là HTTP, REST và JSON. Phần này cung cấp cho bạn hiểu biết chung về cách áp dụng các công nghệ này khi tạo dịch vụ của bạn.

<a href="#http" name="http"></a>
### HTTP
Các dịch vụ Azure phải tuân thủ đặc tả HTTP, [RFC 7231](https://tools.ietf.org/html/rfc7231). Phần này tinh chỉnh và ràng buộc thêm cách các bên triển khai dịch vụ nên áp dụng các cấu trúc được định nghĩa trong đặc tả HTTP. Do đó, điều quan trọng là bạn phải nắm vững các khái niệm sau:

- [Uniform Resource Locator (URL)](#uniform-resource-locators-urls)
- [Mẫu HTTP Request / Response](#http-request--response-pattern)
- [HTTP Query Parameter và giá trị Header](#http-query-parameters-and-header-values)

#### Uniform Resource Locators (URLs)

Uniform Resource Locator (URL) là cách các nhà phát triển truy cập các resource của dịch vụ của bạn. Suy cho cùng, URL là cách các nhà phát triển hình thành mô hình nhận thức về các resource của dịch vụ của bạn.

<a href="#http-url-pattern" name="http-url-pattern">:white_check_mark:</a> **DO** dùng mẫu URL này:
```text
https://<tenant>.<region>.<service>.<cloud>/<service-root>/<resource-collection>/<resource-id>
```

Trong đó:
 | Trường | Mô tả
 | - | - |
 | tenant | ID duy nhất theo vùng đại diện cho một tenant (dùng cho cô lập, thanh toán, thực thi quota, vòng đời của resource, v.v.)
 | region | Xác định vùng mà tenant đã chọn. Chuỗi region này MUST khớp với một trong các chuỗi trong cột "Name" được trả về khi chạy lệnh "az account list-locations -o table" của Azure CLI
 | service | Tên của dịch vụ (ví dụ: blobstore, servicebus, directory hoặc management)
 | cloud | Tên miền của đám mây, ví dụ `azure.net` (xem "az cloud list" của Azure CLI)
 | service&#x2011;root | Đường dẫn riêng của dịch vụ (ví dụ: blobcontainer, myqueue)
 | resource&#x2011;collection | Tên của collection, không viết tắt, ở dạng số nhiều
 | resource&#x2011;id | Id của resource trong resource-collection. Giá trị này MUST là chuỗi/số/guid thô, không có dấu trích dẫn nhưng được escape đúng cách để vừa với một URL segment.

<a href="#http-url-casing" name="http-url-casing">:white_check_mark:</a> **DO** dùng kebab-casing (ưu tiên) hoặc camel-casing cho các path segment của URL. Nếu segment tham chiếu đến một trường JSON, hãy dùng camel casing.

<a href="#http-url-length" name="http-url-length">:white_check_mark:</a> **DO** trả về `414-URI Too Long` nếu URL vượt quá 2083 ký tự

<a href="#http-url-case-sensitivity" name="http-url-case-sensitivity">:white_check_mark:</a> **DO** xử lý các path segment của URL do dịch vụ định nghĩa theo kiểu phân biệt chữ hoa/thường. Nếu chữ hoa/thường được truyền vào không khớp với những gì dịch vụ mong đợi, request **MUST** thất bại với mã trả về HTTP `404-Not found`.

Một số giá trị path segment do khách hàng cung cấp có thể được so sánh không phân biệt chữ hoa/thường nếu phần trừu tượng mà chúng đại diện thường được so sánh không phân biệt chữ hoa/thường. Ví dụ, một path segment UUID 'c55f6b35-05f6-42da-8321-2af5099bd2a2' nên được xử lý giống hệt 'C55F6B35-05F6-42DA-8321-2AF5099BD2A2'

<a href="#http-url-return-casing" name="http-url-return-casing">:white_check_mark:</a> **DO** đảm bảo chữ hoa/thường đúng khi trả về một URL trong giá trị header của HTTP response hoặc bên trong body JSON của response

<a href="#http-url-allowed-characters" name="http-url-allowed-characters">:white_check_mark:</a> **DO** giới hạn các ký tự trong path segment do dịch vụ định nghĩa ở `0-9  A-Z  a-z  -  .  _  ~`, với `:` chỉ được cho phép như mô tả bên dưới để chỉ định một thao tác action.

<a href="#http-url-allowed-characters-2" name="http-url-allowed-characters-2">:ballot_box_with_check:</a> **YOU SHOULD** giới hạn các ký tự được phép trong path segment do người dùng chỉ định (tức là giá trị path parameter) ở `0-9  A-Z  a-z  -  .  _  ~` (không cho phép `:`).

<a href="#http-url-should-be-readable" name="http-url-should-be-readable">:ballot_box_with_check:</a> **YOU SHOULD** giữ URL dễ đọc; nếu có thể, tránh UUID và mã hóa %-encoding (ví dụ: Cádiz được mã hóa %-encoding thành C%C3%A1diz)

<a href="#http-url-allowed-characters-3" name="http-url-allowed-characters-3">:heavy_check_mark:</a> **YOU MAY** dùng các ký tự khác này trong đường dẫn URL nhưng chúng nhiều khả năng sẽ yêu cầu mã hóa %-encoding [[RFC 3986](https://datatracker.ietf.org/doc/html/rfc3986#section-2.1)]: `/  ?  #  [  ]  @  !  $  &  '  (  )  *  +  ,  ;  =`

<a href="#http-direct-endpoints" name="http-direct-endpoints">:heavy_check_mark:</a> **YOU MAY** hỗ trợ một URL endpoint trực tiếp để tối ưu hiệu năng/định tuyến:
```text
https://<tenant>-<service-root>.<service>.<cloud>/...
```

Ví dụ:
- URL request: `https://blobstore.azure.net/contoso.com/account1/container1/blob2`
- Response header ([RFC 2557](https://datatracker.ietf.org/doc/html/rfc2557#section-4)): `content-location : https://contoso-dot-com-account1.blobstore.azure.net/container1/blob2`
- Định dạng GUID: `https://00000000-0000-0000-C000-000000000046-account1.blobstore.azure.net/container1/blob2`

<a href="#http-url-return-consistent-form" name="http-url-return-consistent-form">:white_check_mark:</a> **DO** trả về URL trong header/body của response ở dạng nhất quán bất kể URL được dùng để truy cập resource là gì. Hoặc luôn là UUID cho `<tenant>`, hoặc luôn là một tên miền đã được xác minh duy nhất.

<a href="#http-url-parameter-values" name="http-url-parameter-values">:heavy_check_mark:</a> **YOU MAY** dùng URL làm giá trị
```text
https://api.contoso.com/items?url=https://resources.contoso.com/shoes/fancy
```

#### Mẫu HTTP Request / Response
Mẫu HTTP Request / Response quyết định cách API của bạn hoạt động. Ví dụ: các phương thức POST tạo resource phải idempotent, kết quả của phương thức GET có thể được cache, các header If-Modified và ETag cung cấp optimistic concurrency. URL của một dịch vụ, cùng với body của request/response, thiết lập hợp đồng tổng thể mà các nhà phát triển có với dịch vụ của bạn. Là nhà cung cấp dịch vụ, cách bạn quản lý mẫu request / response tổng thể nên là một trong những quyết định triển khai đầu tiên bạn đưa ra.

Các ứng dụng đám mây chấp nhận lỗi là điều không thể tránh. Do đó, để cho phép khách hàng viết các ứng dụng chịu lỗi, _tất cả_ các thao tác của dịch vụ (bao gồm cả POST) **phải** idempotent. Triển khai dịch vụ theo cách idempotent, với ngữ nghĩa "exactly once", cho phép nhà phát triển retry request mà không có rủi ro gây ra hậu quả ngoài ý muốn.

##### Hành vi Exactly Once = Client Retry và tính Idempotent của dịch vụ

<a href="#http-all-methods-idempotent" name="http-all-methods-idempotent">:white_check_mark:</a> **DO** đảm bảo rằng _tất cả_ các phương thức HTTP đều idempotent.

<a href="#http-use-put-or-patch" name="http-use-put-or-patch">:ballot_box_with_check:</a> **YOU SHOULD** dùng PUT hoặc PATCH để tạo resource vì các phương thức HTTP này dễ triển khai, cho phép khách hàng tự đặt tên cho resource của họ, và idempotent.

<a href="#http-post-must-be-idempotent" name="http-post-must-be-idempotent">:heavy_check_mark:</a> **YOU MAY** dùng POST để tạo resource nhưng bạn phải làm cho nó idempotent và, đương nhiên, response **MUST** trả về URL của resource đã tạo cùng với 201-Created. Một cách để làm cho POST idempotent là dùng các header Repeatability-Request-ID và Repeatability-First-Sent (Xem [Tính lặp lại của request](#repeatability-of-requests)).

##### Mã trả về HTTP

<a href="#http-success-status-codes" name="http-success-status-codes">:white_check_mark:</a> **DO** tuân thủ các mã trả về trong bảng sau khi phương thức hoàn tất đồng bộ và thành công:

Phương thức | Mô tả | Response Status Code
-------|-------------|---------------------
PATCH  | Tạo/Sửa resource bằng JSON Merge Patch | `200-OK`, `201-Created`
PUT    | Tạo/Thay thế _toàn bộ_ resource | `200-OK`, `201-Created`
POST   | Tạo resource mới (ID do dịch vụ đặt) | `201-Created` kèm URL của resource đã tạo
POST   | Action | `200-OK`
GET    | Đọc (tức là liệt kê) một resource collection | `200-OK`
GET    | Đọc resource | `200-OK`
DELETE | Xóa resource | `204-No Content`\; tránh `404-Not Found`

<a href="#http-lro-status-code" name="http-lro-status-code">:white_check_mark:</a> **DO** trả về status code `202-Accepted` và làm theo hướng dẫn trong [Thao tác chạy lâu và Job](#long-running-operations--jobs) khi một phương thức PUT, POST hoặc DELETE hoàn tất bất đồng bộ.

<a href="#http-method-casing" name="http-method-casing">:white_check_mark:</a> **DO** xử lý tên phương thức theo kiểu phân biệt chữ hoa/thường và luôn viết bằng chữ in hoa

<a href="#http-return-resource" name="http-return-resource">:white_check_mark:</a> **DO** trả về trạng thái của resource sau một thao tác PUT, PATCH, POST hoặc GET cùng với `200-OK` hoặc `201-Created`.

<a href="#http-delete-returns-204" name="http-delete-returns-204">:white_check_mark:</a> **DO** trả về `204-No Content` không kèm resource/body cho một thao tác DELETE (ngay cả khi URL xác định một resource không tồn tại; không trả về `404-Not Found`)

<a href="#http-post-action-returns-200" name="http-post-action-returns-200">:white_check_mark:</a> **DO** trả về `200-OK` từ một POST Action. Hãy kèm một body trong response, ngay cả khi nó không có thuộc tính nào, để cho phép thêm thuộc tính trong tương lai nếu cần.

<a href="#http-return-403-vs-404" name="http-return-403-vs-404">:white_check_mark:</a> **DO** trả về `403-Forbidden` khi người dùng không có quyền truy cập resource _trừ khi_ điều này làm lộ thông tin về sự tồn tại của resource mà không nên tiết lộ vì lý do bảo mật/quyền riêng tư, trong trường hợp đó response nên là `404-Not Found`. [Lý do: `403-Forbidden` dễ gỡ lỗi hơn đối với khách hàng, nhưng không nên dùng nếu ngay cả việc thừa nhận sự tồn tại của một thứ gì đó cũng có thể làm rò rỉ bí mật của khách hàng.]

<a href="#http-support-optimistic-concurrency" name="http-support-optimistic-concurrency">:white_check_mark:</a> **DO** hỗ trợ caching và optimistic concurrency bằng cách tuân thủ các request header `If-Match`, `If-None-Match`, if-modified-since và if-unmodified-since, và bằng cách trả về các response header ETag và last-modified

#### HTTP Query Parameter và giá trị Header

<a href="#http-query-names-casing" name="http-query-names-casing">:white_check_mark:</a> **DO** dùng camel case cho tên query parameter.

Lưu ý: Một số tên query parameter cũ dùng kebab-casing và chỉ được cho phép để đảm bảo tương thích ngược.

Vì thông tin trong URL của dịch vụ, cũng như request / response, đều là chuỗi, nên phải có một lược đồ dễ dự đoán, được định nghĩa rõ ràng để chuyển đổi chuỗi thành các giá trị tương ứng.

<a href="#http-parameter-validation" name="http-parameter-validation">:white_check_mark:</a> **DO** xác thực (validate) tất cả giá trị query parameter và request header và làm thao tác thất bại với `400-Bad Request` nếu bất kỳ giá trị nào không qua được bước xác thực. Trả về một error response như mô tả trong phần [Xử lý lỗi](#handling-errors) cho biết điều gì sai để khách hàng có thể tự chẩn đoán và khắc phục sự cố.

<a href="#http-parameter-serialization" name="http-parameter-serialization">:white_check_mark:</a> **DO** dùng bảng sau khi chuyển đổi chuỗi:

Kiểu dữ liệu | Tài liệu hóa rằng chuỗi phải là
--------- | -------
Boolean   | true / false (toàn bộ chữ thường)
Integer   | -2<sup>53</sup>+1 đến +2<sup>53</sup>-1 (để nhất quán với giới hạn của JSON về số nguyên [RFC 8259](https://datatracker.ietf.org/doc/html/rfc8259))
Float     | [IEEE-754 binary64](https://en.wikipedia.org/wiki/Double-precision_floating-point_format)
String    | (Có)/không có dấu trích dẫn?, độ dài tối đa, ký tự hợp lệ, phân biệt chữ hoa/thường, nhiều dấu phân tách
UUID      | 123e4567-e89b-12d3-a456-426614174000 (không có {}, có dấu gạch nối, không phân biệt chữ hoa/thường) [RFC 4122](https://datatracker.ietf.org/doc/html/rfc4122)
Date/Time (Header) | Sun, 06 Nov 1994 08:49:37 GMT [RFC 7231, Section 7.1.1.1](https://datatracker.ietf.org/doc/html/rfc7231#section-7.1.1.1)
Date/Time (Query parameter) | YYYY-MM-DDTHH:mm:ss.sssZ (với tối đa 3 chữ số phần thập phân của giây) [RFC 3339](https://datatracker.ietf.org/doc/html/rfc3339)
Byte array | Mã hóa Base-64, độ dài tối đa
Array      | Một trong hai: a) danh sách giá trị phân tách bằng dấu phẩy (ưu tiên), hoặc b) các instance `name=value` riêng cho từng giá trị của mảng


Bảng dưới đây liệt kê các header được các dịch vụ Azure dùng nhiều nhất:

Header Key          | Áp dụng cho | Ví dụ
------------------- | ---------- | -------------
_authorization_     | Request    | Bearer eyJ0...Xd6j (Hỗ trợ Azure Active Directory)
_x-ms-useragent_    | Request    | (xem [Distributed Tracing & Telemetry](#distributed-tracing--telemetry))
traceparent         | Request    | (xem [Distributed Tracing & Telemetry](#distributed-tracing--telemetry))
tracecontext        | Request    | (xem [Distributed Tracing & Telemetry](#distributed-tracing--telemetry))
accept              | Request    | application/json
If-Match            | Request    | "67ab43" hoặc * (không có dấu nháy) (xem [Conditional Requests](#conditional-requests))
If-None-Match       | Request    | "67ab43" hoặc * (không có dấu nháy) (xem [Conditional Requests](#conditional-requests))
If-Modified-Since   | Request    | Sun, 06 Nov 1994 08:49:37 GMT (xem [Conditional Requests](#conditional-requests))
If-Unmodified-Since | Request    | Sun, 06 Nov 1994 08:49:37 GMT (xem [Conditional Requests](#conditional-requests))
date                | Cả hai     | Sun, 06 Nov 1994 08:49:37 GMT (xem [RFC 7231, Section 7.1.1.2](https://datatracker.ietf.org/doc/html/rfc7231#section-7.1.1.2))
_content-type_      | Cả hai     | application/merge-patch+json
_content-length_    | Cả hai     | 1024
_x-ms-request-id_   | Response   | 4227cdc5-9f48-4e84-921a-10967cb785a0
ETag                | Response   | "67ab43" (xem [Conditional Requests](#conditional-requests))
last-modified       | Response   | Sun, 06 Nov 1994 08:49:37 GMT
_x-ms-error-code_   | Response   | (xem [Xử lý lỗi](#handling-errors))
_azure-deprecating_ | Response   | (xem [Thông báo về hành vi sắp ngừng hỗ trợ](#deprecating-behavior-notification))
retry-after         | Response   | 180 (xem [RFC 7231, Section 7.1.3](https://datatracker.ietf.org/doc/html/rfc7231#section-7.1.3))

<a href="#http-header-support-standard-headers" name="http-header-support-standard-headers">:white_check_mark:</a> **DO** hỗ trợ tất cả các header được in _nghiêng_

<a href="#http-header-names-casing" name="http-header-names-casing">:white_check_mark:</a> **DO** chỉ định header bằng kebab-casing

<a href="#http-header-names-case-sensitivity" name="http-header-names-case-sensitivity">:white_check_mark:</a> **DO** so sánh tên request header theo kiểu không phân biệt chữ hoa/thường

<a href="#http-header-values-case-sensitivity" name="http-header-values-case-sensitivity">:white_check_mark:</a> **DO** so sánh giá trị request header theo kiểu phân biệt chữ hoa/thường nếu tên header yêu cầu như vậy

<a href="#http-header-date-values" name="http-header-date-values">:white_check_mark:</a> **DO** chấp nhận giá trị ngày trong header ở định dạng HTTP-Date và trả về giá trị ngày trong header ở định dạng IMF-fixdate như định nghĩa trong [RFC 7231, Section 7.1.1.1](https://datatracker.ietf.org/doc/html/rfc7231#section-7.1.1.1), ví dụ "Sun, 06 Nov 1994 08:49:37 GMT".

Lưu ý: Định dạng IMF-fixdate của RFC 7231 là một "tập con có độ dài cố định và một múi giờ" của định dạng RFC 1123 / RFC 5822, nghĩa là: a) năm phải có bốn chữ số, b) thành phần giây của thời gian là bắt buộc, và c) múi giờ phải là GMT.

<a href="#http-header-request-id" name="http-header-request-id">:white_check_mark:</a> **DO** tạo một giá trị opaque xác định duy nhất request và trả về giá trị này trong response header `x-ms-request-id`.

Dịch vụ của bạn nên đưa giá trị `x-ms-request-id` vào error log để người dùng có thể gửi yêu cầu hỗ trợ cho các lỗi cụ thể bằng giá trị này.

<a href="#http-allow-unrecognized-headers" name="http-allow-unrecognized-headers">:no_entry:</a> **DO NOT** làm thất bại một request chứa header không nhận dạng được. Các header có thể được thêm bởi API gateway hoặc middleware và điều này phải được chấp nhận

<a href="#http-no-x-custom-headers" name="http-no-x-custom-headers">:no_entry:</a> **DO NOT** dùng tiền tố "x-" cho header tùy chỉnh, trừ khi header đó đã tồn tại trong production [[RFC 6648](https://datatracker.ietf.org/doc/html/rfc6648)].

**Tài liệu tham khảo bổ sung**
- [StackOverflow - Difference between http parameters and http headers](https://stackoverflow.com/questions/40492782)
- [Standard HTTP Headers](https://httpwg.org/specs/rfc7231.html#header.field.registration)
- [Why isn't HTTP PUT allowed to do partial updates in a REST API?](https://stackoverflow.com/questions/19732423/why-isnt-http-put-allowed-to-do-partial-updates-in-a-rest-api)

<a href="#rest" name="rest"></a>
### REpresentational State Transfer (REST)
REST là một phong cách kiến trúc có phạm vi ảnh hưởng rộng, nhấn mạnh khả năng mở rộng, tính tổng quát, triển khai độc lập, giảm độ trễ nhờ caching và bảo mật. Khi áp dụng REST cho API của bạn, bạn định nghĩa các resource của dịch vụ như những collection các mục.
Đây thường là các danh từ bạn dùng trong từ vựng của dịch vụ. [URL](#uniform-resource-locators-urls) của dịch vụ xác định đường dẫn phân cấp mà nhà phát triển dùng để thực hiện các thao tác CRUD (tạo, đọc, cập nhật và xóa) trên resource. Lưu ý, điều quan trọng là mô hình hóa trạng thái của resource, chứ không phải hành vi.
Ở các phần sau của hướng dẫn này có những mẫu thiết kế mô tả cách gọi hành vi trên dịch vụ của bạn. Xem [bài viết này trong Azure Architecture Center](https://docs.microsoft.com/azure/architecture/best-practices/api-design) để có thảo luận chi tiết hơn về các mẫu thiết kế REST API.

Khi thiết kế dịch vụ của bạn, điều quan trọng là tối ưu cho nhà phát triển sử dụng API của bạn.

<a href="#rest-clear-naming" name="rest-clear-naming">:white_check_mark:</a> **DO** tập trung nhiều vào việc đặt tên rõ ràng và nhất quán

<a href="#rest-paths-make-sense" name="rest-paths-make-sense">:white_check_mark:</a> **DO** đảm bảo đường dẫn resource của bạn có ý nghĩa

<a href="#rest-simplify-operations" name="rest-simplify-operations">:white_check_mark:</a> **DO** đơn giản hóa các thao tác với ít query parameter bắt buộc và trường JSON bắt buộc

<a href="#rest-specify-string-value-constraints" name="rest-specify-string-value-constraints">:white_check_mark:</a> **DO** thiết lập hợp đồng rõ ràng cho các giá trị chuỗi

<a href="#rest-use-standard-status-codes" name="rest-use-standard-status-codes">:white_check_mark:</a> **DO** dùng mã/body response phù hợp để khách hàng có thể tự chẩn đoán vấn đề của họ và khắc phục mà không cần liên hệ bộ phận hỗ trợ Azure hay nhóm dịch vụ

#### Schema của resource và khả năng thay đổi của trường

<a href="#rest-response-body-is-resource-schema" name="rest-response-body-is-resource-schema">:white_check_mark:</a> **DO** dùng cùng một JSON schema cho request/response của PUT, response của PATCH, response của GET, và request/response của POST trên một đường dẫn URL nhất định. Schema request của PATCH nên chứa tất cả các trường giống nhau và không có trường bắt buộc nào. Điều này cho phép dùng một kiểu SDK cho các thao tác đầu vào/đầu ra và cho phép truyền response ngược lại vào một request.

<a href="#rest-field-mutability" name="rest-field-mutability">:white_check_mark:</a> **DO** suy nghĩ về các trường của resource và cách chúng được sử dụng:

Khả năng thay đổi của trường | Hành vi của request tới dịch vụ đối với trường này
-----------------| -----------------------------------------
**Create** | Dịch vụ chỉ tuân theo trường khi tạo resource. Hãy giảm thiểu các trường chỉ dùng khi tạo để khách hàng không phải xóa và tạo lại resource.
**Update** | Dịch vụ tuân theo trường khi tạo hoặc cập nhật resource
**Read**   | Dịch vụ trả về trường này trong response. Nếu client truyền một trường chỉ đọc, dịch vụ **MUST** làm request thất bại trừ khi giá trị được truyền vào khớp với giá trị hiện tại của resource

Ngoài những điều trên, một trường có thể là "required" hoặc "optional". Một trường required được đảm bảo luôn tồn tại và thường sẽ _không_ trở thành trường nullable trong cấu trúc dữ liệu của SDK. Điều này cho phép khách hàng viết code mà không cần kiểm tra null.
Vì vậy, các trường required chỉ có thể được đưa vào ở phiên bản đầu tiên của dịch vụ; việc đưa các trường required vào ở phiên bản sau là một thay đổi gây phá vỡ tương thích (breaking change). Ngoài ra, việc xóa một trường required hoặc biến một trường optional thành required hoặc ngược lại cũng là breaking change.

<a href="#rest-flat-is-better-than-nested" name="rest-flat-is-better-than-nested">:white_check_mark:</a> **DO** giữ các trường đơn giản và duy trì cấu trúc phân cấp nông.

<a href="#rest-get-returns-json-body" name="rest-get-returns-json-body">:white_check_mark:</a> **DO** dùng GET để truy xuất resource và trả về JSON trong body của response

<a href="#rest-patch-use-merge-patch" name="rest-patch-use-merge-patch">:white_check_mark:</a> **DO** tạo và cập nhật resource bằng PATCH [RFC 5789] với body request JSON Merge Patch [(RFC 7396)](https://datatracker.ietf.org/doc/html/rfc7396).

<a href="#rest-put-for-create-or-replace" name="rest-put-for-create-or-replace">:white_check_mark:</a> **DO** dùng PUT với JSON cho các thao tác tạo/thay thế toàn bộ. **LƯU Ý:** Nếu một client v1 PUT một resource; mọi trường được đưa vào từ V2 trở đi nên được đặt lại về giá trị mặc định (tương đương với DELETE rồi PUT).

<a href="#rest-delete-resource" name="rest-delete-resource">:white_check_mark:</a> **DO** dùng DELETE để xóa một resource.

<a href="#rest-fail-for-unknown-fields" name="rest-fail-for-unknown-fields">:white_check_mark:</a> **DO** làm thao tác thất bại với `400-Bad Request` nếu request có định dạng không đúng hoặc nếu bất kỳ tên hoặc giá trị trường JSON nào không được phiên bản cụ thể của dịch vụ hiểu đầy đủ. Trả về một error response như mô tả trong [Xử lý lỗi](#handling-errors) cho biết điều gì sai để khách hàng có thể tự chẩn đoán và khắc phục sự cố.

<a href="#rest-secrets-allowed-in-post-response" name="rest-secrets-allowed-in-post-response">:heavy_check_mark:</a> **YOU MAY** trả về các trường bí mật (secret) qua POST **nếu thật sự cần thiết**.

<a href="#rest-no-secrets-in-get-response" name="rest-no-secrets-in-get-response">:no_entry:</a> **DO NOT** trả về các trường bí mật (secret) qua GET. Ví dụ, không trả về `administratorPassword` trong JSON.

<a href="#rest-no-computable-fields" name="rest-no-computable-fields">:no_entry:</a> **DO NOT** thêm trường vào JSON nếu giá trị dễ dàng tính được từ các trường khác, để tránh làm body phình to.

##### Quy tắc xử lý Create / Update / Replace

<a href="#rest-put-patch-status-codes" name="rest-put-patch-status-codes">:white_check_mark:</a> **DO** làm theo quy trình xử lý dưới đây để tạo/cập nhật/thay thế một resource:

Khi dùng phương thức này | nếu điều kiện này xảy ra | dùng&nbsp;mã&nbsp;response&nbsp;này
---------------------- | ------------------------- | ----------------------
PATCH/PUT | Bất kỳ tên/giá trị trường JSON nào không được biết/hợp lệ với api-version | `400-Bad Request`
PATCH/PUT | Bất kỳ trường Read nào được truyền vào (client không thể đặt các trường Read) | `400-Bad Request`
| **Nếu&nbsp;resource&nbsp;không&nbsp;tồn&nbsp;tại** |
PATCH/PUT | Thiếu bất kỳ trường Create/Update bắt buộc nào | `400-Bad Request`
PATCH/PUT | Tạo resource bằng các trường Create/Update | `201-Created`
| **Nếu&nbsp;resource&nbsp;đã&nbsp;tồn&nbsp;tại** |
PATCH | Bất kỳ trường Create nào không khớp với giá trị hiện tại (cho phép retry) | `409-Conflict`
PATCH | Cập nhật resource bằng các trường Update | `200-OK`
PUT | Thiếu bất kỳ trường Create/Update bắt buộc nào | `400-Bad Request`
PUT | Ghi đè toàn bộ resource bằng các trường Create/Update | `200-OK`

#### Xử lý lỗi
Có 2 loại lỗi:
- Lỗi mà bạn kỳ vọng code của khách hàng sẽ phục hồi một cách êm đẹp khi chạy
- Lỗi cho thấy một bug trong code của khách hàng và khó có thể phục hồi khi chạy; khách hàng chỉ đơn giản phải sửa code của họ

<a href="#rest-error-code-header" name="rest-error-code-header">:white_check_mark:</a> **DO** trả về response header `x-ms-error-code` với một mã lỗi dạng chuỗi cho biết điều gì đã xảy ra.

*LƯU Ý: Các giá trị `x-ms-error-code` là một phần của hợp đồng API của bạn (vì code của khách hàng nhiều khả năng sẽ so sánh với chúng) và không thể thay đổi trong tương lai.*

<a href="#rest-error-code-enum" name="rest-error-code-enum">:heavy_check_mark:</a> **YOU MAY** triển khai các giá trị `x-ms-error-code` dưới dạng enum với `"modelAsString": true` vì có thể thêm giá trị mới theo thời gian.  Cụ thể, chỉ là breaking change nếu cùng các điều kiện dẫn đến một mã lỗi cấp cao nhất *khác*.

<a href="#rest-add-codes-in-new-api-version" name="rest-add-codes-in-new-api-version">:warning:</a> **YOU SHOULD NOT** thêm mã lỗi cấp cao nhất mới vào một API hiện có mà không nâng phiên bản dịch vụ.

<a href="#rest-descriptive-error-code-values" name="rest-descriptive-error-code-values">:white_check_mark:</a> **DO** thiết kế cẩn thận các giá trị chuỗi `x-ms-error-code` duy nhất cho các lỗi có thể phục hồi khi chạy.  Hãy dùng lại các mã lỗi chung cho các lỗi sử dụng không thể phục hồi.

<a href="#rest-error-code-grouping" name="rest-error-code-grouping">:heavy_check_mark:</a> **YOU MAY** gom các lỗi phổ biến của code khách hàng vào một vài giá trị chuỗi `x-ms-error-code`.

<a href="#rest-error-code-header-and-body-match" name="rest-error-code-header-and-body-match">:white_check_mark:</a> **DO** đảm bảo rằng giá trị `code` của lỗi cấp cao nhất giống hệt giá trị của header `x-ms-error-code`.

<a href="#rest-error-response-body-structure" name="rest-error-response-body-structure">:white_check_mark:</a> **DO** cung cấp body response với cấu trúc sau:

**ErrorResponse** : Object

Thuộc tính | Kiểu | Bắt buộc | Mô tả
-------- | ---- | :------: | -----------
`error` | ErrorDetail | ✔ | Đối tượng lỗi cấp cao nhất có `code` khớp với response header `x-ms-error-code`

**ErrorDetail** : Object

Thuộc tính | Kiểu | Bắt buộc | Mô tả
-------- | ---- | :------: | -----------
`code` | String | ✔ | Một trong tập các mã lỗi do server định nghĩa.
`message` | String | ✔ | Biểu diễn lỗi mà con người đọc được.
`target` | String |  | Đích của lỗi.
`details` | ErrorDetail[] |  | Một mảng chi tiết về các lỗi cụ thể dẫn đến lỗi được báo cáo này.
`innererror` | InnerError |  | Một đối tượng chứa thông tin cụ thể hơn đối tượng hiện tại về lỗi.
_additional properties_ |   | | Các thuộc tính bổ sung có thể hữu ích khi gỡ lỗi.

**InnerError** : Object

Thuộc tính | Kiểu | Bắt buộc | Mô tả
-------- | ---- | :------: | -----------
`code` | String |  | Một mã lỗi cụ thể hơn mã do lỗi chứa nó cung cấp.
`innererror` | InnerError |  | Một đối tượng chứa thông tin cụ thể hơn đối tượng hiện tại về lỗi.

Ví dụ:
```json
{
  "error": {
    "code": "InvalidPasswordFormat",
    "message": "Human-readable description",
    "target": "target of error",
    "innererror": {
      "code": "PasswordTooShort",
      "minLength": 6,
    }
  }
}
```

<a href="#rest-document-error-code-values" name="rest-document-error-code-values">:white_check_mark:</a> **DO** tài liệu hóa các chuỗi mã lỗi cấp cao nhất của dịch vụ; chúng là một phần của hợp đồng API.

<a href="#rest-error-non-api-contract-fields" name="rest-error-non-api-contract-fields">:heavy_check_mark:</a> **YOU MAY** xử lý các trường còn lại tùy ý vì chúng _không_ được xem là một phần của hợp đồng API của dịch vụ và khách hàng không nên phụ thuộc vào chúng hoặc giá trị của chúng. Chúng tồn tại để giúp khách hàng tự chẩn đoán sự cố.

<a href="#rest-error-additional-properties-allowed" name="rest-error-additional-properties-allowed">:heavy_check_mark:</a> **YOU MAY** thêm các thuộc tính bổ sung cho bất kỳ giá trị dữ liệu nào trong thông báo lỗi của bạn để khách hàng không phải phân tích cú pháp thông báo lỗi. Ví dụ, một lỗi với `"message": "A maximum of 16 keys are allowed per account."` cũng có thể thêm thuộc tính `"maximumKeys": 16`. Điều này không phải là một phần của hợp đồng API của bạn và chỉ nên dùng để chẩn đoán sự cố.

*Lưu ý: Đừng dùng cơ chế này để cung cấp thông tin mà nhà phát triển cần dựa vào trong code (ví dụ: thông báo lỗi có thể đưa ra chi tiết về lý do bạn bị throttling, nhưng `Retry-After` mới là thứ nhà phát triển nên dựa vào để lùi lại và thử lại sau).*

<a href="#rest-error-use-default-response" name="rest-error-use-default-response">:warning:</a> **YOU SHOULD NOT** tài liệu hóa các status code lỗi cụ thể trong đặc tả OpenAPI/Swagger của bạn trừ khi response "default" không thể mô tả đúng response lỗi cụ thể (ví dụ: schema của body khác).

<a href="#json" name="json"></a>

### JSON

<a href="#json-field-name-casing" name="json-field-name-casing">:white_check_mark:</a> **DO** dùng camel case cho tất cả tên trường JSON. Không viết hoa các từ viết tắt; hãy dùng camel case.

<a href="#json-field-names-case-sensitivity" name="json-field-names-case-sensitivity">:white_check_mark:</a> **DO** xử lý tên trường JSON theo kiểu phân biệt chữ hoa/thường.

<a href="#json-field-values-case-sensitivity" name="json-field-values-case-sensitivity">:white_check_mark:</a> **DO** xử lý giá trị trường JSON theo kiểu phân biệt chữ hoa/thường. Có thể có một số ngoại lệ nhưng hãy tránh nếu có thể.

<a href="#json-field-values-id" name="json-field-values-ids">:white_check_mark:</a> **DO** xử lý giá trị trường JSON biểu diễn một ID duy nhất như một giá trị chuỗi opaque và so sánh chúng theo kiểu phân biệt chữ hoa/thường. Ví dụ, ID thường là [UUID](https://en.wikipedia.org/wiki/Universally_unique_identifier), [CUID](https://github.com/paralleldrive/cuid2), [Nano ID](https://blog.openapihub.com/en-us/what-is-nano-id-its-difference-from-uuid-as-unique-identifiers/), hoặc các định dạng khác. Việc chọn định dạng ID là chi tiết triển khai của dịch vụ. Code của khách hàng chỉ nên lấy, lưu trữ và gửi các giá trị này, và không bao giờ nên thực hiện bất kỳ kiểu phân tích cú pháp hay diễn giải nào khác đối với giá trị ID.

Các dịch vụ, và các client truy cập chúng, có thể được viết bằng nhiều ngôn ngữ. Để đảm bảo khả năng tương tác, JSON thiết lập hệ thống kiểu "mẫu số chung nhỏ nhất", luôn được gửi qua đường truyền dưới dạng byte UTF-8. Hệ thống này rất đơn giản và gồm ba kiểu:

 Kiểu | Mô tả
 ---- | -----------
 Boolean | true/false (luôn là chữ thường)
 Number  | Số dấu phẩy động có dấu (IEEE-754 binary64; khoảng số nguyên: -2<sup>53</sup>+1 đến +2<sup>53</sup>-1)
 String  | Dùng cho mọi thứ còn lại

<a href="#json-null-response-values" name="json-null-response-values">:no_entry:</a> **DO NOT** gửi các trường JSON có giá trị null từ dịch vụ đến client. Thay vào đó, dịch vụ chỉ nên không gửi trường này ở đó (điều này giúp giảm kích thước payload). Về mặt ngữ nghĩa, các dịch vụ Azure xem một trường bị thiếu và một trường có giá trị null là giống hệt nhau. 

<a href="#json-null-request-values" name="json-null-resquest-values">:white_check_mark:</a> **DO** chỉ chấp nhận các trường JSON có giá trị null đối với thao tác PATCH với payload JSON Merge Patch. Một trường có giá trị null chỉ thị cho dịch vụ xóa trường đó. Nếu trường không thể bị xóa, hãy trả về 400-BadRequest, nếu không thì trả về resource với trường đã xóa bị thiếu trong payload của response (xem gạch đầu dòng ở trên).

<a href="#json-integer-values" name="json-integer-values">:white_check_mark:</a> **DO** dùng số nguyên trong phạm vi chấp nhận được của số JSON.

<a href="#json-specify-string-constraints" name="json-specify-string-constraints">:white_check_mark:</a> **DO** thiết lập một hợp đồng được định nghĩa rõ ràng cho định dạng của chuỗi. Ví dụ, xác định độ dài tối thiểu, độ dài tối đa, ký tự hợp lệ, việc so sánh có (không) phân biệt chữ hoa/thường, v.v. Khi có thể, hãy dùng các định dạng chuẩn, ví dụ RFC 3339 cho date/time.

<a href="#json-use-standard-string-formats" name="json-use-standard-string-formats">:white_check_mark:</a> **DO** dùng các định dạng chuỗi phổ biến và dễ phân tích cú pháp/định dạng bởi nhiều ngôn ngữ lập trình, ví dụ RFC 3339 cho date/time.

<a href="#json-should-be-round-trippable" name="json-should-be-round-trippable">:white_check_mark:</a> **DO** đảm bảo rằng thông tin trao đổi giữa dịch vụ của bạn và bất kỳ client nào có thể "round-trip" được giữa nhiều ngôn ngữ lập trình.

<a href="#json-date-time-is-rfc3339" name="json-date-time-is-rfc3339">:white_check_mark:</a> **DO** dùng [RFC 3339](https://datatracker.ietf.org/doc/html/rfc3339) cho date/time.

<a href="#json-durations-use-fixed-time-intervals" name="json-durations-use-fixed-time-intervals">:white_check_mark:</a> **DO** dùng một khoảng thời gian cố định để biểu diễn duration, ví dụ mili giây, giây, phút, ngày, v.v., và đưa đơn vị thời gian vào tên thuộc tính, ví dụ `backupTimeInMinutes` hoặc `ttlSeconds`.

<a href="#json-rfc3339-time-intervals-allowed" name="json-rfc3339-time-intervals-allowed">:heavy_check_mark:</a> **YOU MAY** dùng [khoảng thời gian RFC 3339](https://wikipedia.org/wiki/ISO_8601#Durations) chỉ khi người dùng phải có thể chỉ định một khoảng thời gian có thể thay đổi theo từng tháng hoặc từng năm, ví dụ "P3M" biểu diễn 3 tháng bất kể có bao nhiêu ngày giữa ngày bắt đầu và ngày kết thúc, hoặc "P1Y" biểu diễn 366 ngày trong năm nhuận. Giá trị phải round-trip được.

<a href="#json-uuid-is-rfc4412" name="json-uuid-is-rfc4412">:white_check_mark:</a> **DO** dùng [RFC 4122](https://datatracker.ietf.org/doc/html/rfc4122) cho UUID.

<a href="#json-may-nest-for-grouping" name="json-may-nest-for-grouping">:heavy_check_mark:</a> **YOU MAY** dùng các đối tượng JSON để nhóm các trường con lại với nhau.

<a href="#json-use-arrays-for-ordering" name="json-use-arrays-for-ordering">:heavy_check_mark:</a> **YOU MAY** dùng mảng JSON nếu cần duy trì thứ tự của các giá trị. Hãy tránh mảng trong các tình huống khác vì mảng có thể khó và kém hiệu quả khi làm việc, đặc biệt với JSON Merge Patch khi toàn bộ mảng cần được đọc trước khi áp dụng bất kỳ thao tác nào lên nó.

<a href="#json-prefer-objects-over-arrays" name="json-prefer-objects-over-arrays">:ballot_box_with_check:</a> **YOU SHOULD** dùng đối tượng JSON thay vì mảng bất cứ khi nào có thể.

#### Enum và SDK (thư viện client)
Việc các chuỗi có một tập giá trị tường minh là điều phổ biến. Những tập này thường được phản ánh trong định nghĩa OpenAPI dưới dạng enumeration. Chúng cực kỳ hữu ích cho công cụ dành cho nhà phát triển, ví dụ như gợi ý code và sinh thư viện client.

Tuy nhiên, không hiếm khi tập giá trị tăng lên trong suốt vòng đời của dịch vụ. Vì lý do này, công cụ của Microsoft dùng khái niệm "extensible enum", cho biết rằng tập giá trị chỉ nên được xem là một danh sách _một phần_.
Điều này cho thư viện client và khách hàng biết rằng các giá trị của trường enumeration về cơ bản nên được xem như chuỗi và các giá trị chưa được tài liệu hóa có thể được trả về trong tương lai. Điều này cho phép tập giá trị tăng lên theo thời gian đồng thời đảm bảo sự ổn định cho thư viện client và code của khách hàng.

<a href="#json-use-extensible-enums" name="json-use-extensible-enums">:ballot_box_with_check:</a> **YOU SHOULD** dùng extensible enumeration trừ khi bạn chắc chắn rằng tập ký hiệu sẽ KHÔNG BAO GIỜ thay đổi theo thời gian.

<a href="#json-document-extensible-enums" name="json-document-extensible-enums">:white_check_mark:</a> **DO** tài liệu hóa cho khách hàng rằng các giá trị mới có thể xuất hiện trong tương lai để khách hàng viết code ngay hôm nay với kỳ vọng sẽ có các giá trị mới vào ngày mai.

<a href="#json-return-extensible-enum-value" name="json-return-extensible-enum-value">:heavy_check_mark:</a> **YOU MAY** trả về một giá trị cho extensible enum không nằm trong các giá trị được định nghĩa cho api-version được chỉ định trong request.

<a href="#json-accept-extensible-enum-value" name="json-accept-extensible-enum-value">:warning:</a> **YOU SHOULD NOT** chấp nhận một giá trị cho extensible enum không nằm trong các giá trị được định nghĩa cho api-version được chỉ định trong request.

<a href="#json-removing-enum-value-is-breaking" name="json-removing-enum-value-is-breaking">:no_entry:</a> **DO NOT** xóa giá trị khỏi danh sách enumeration của bạn vì điều này làm hỏng code của khách hàng.

#### Các kiểu đa hình

Kiểu đa hình trong REST API nói đến khả năng dùng cùng một thuộc tính của request hoặc response để có các hình dạng tương tự nhưng khác nhau. Điều này thường được biểu đạt bằng `oneOf` trong JsonSchema hoặc OpenAPI. Để đơn giản hóa việc xác định một payload request hoặc response nhất định tương ứng với kiểu cụ thể nào, Azure yêu cầu sử dụng một trường discriminator tường minh.

Lưu ý: Các kiểu đa hình có thể khiến dịch vụ của bạn khó được sử dụng hơn đối với các ngôn ngữ định kiểu danh nghĩa (nominally typed). Xem phần tương ứng trong [Các cân nhắc khi thiết kế dịch vụ](./ConsiderationsForServiceDesign.md#avoid-surprises) để biết thêm thông tin.

<a href="#json-use-discriminator-for-polymorphism" name="json-use-discriminator-for-polymorphism">:white_check_mark:</a> **DO** định nghĩa một trường discriminator cho biết loại (kind) của resource và đưa mọi trường riêng của từng loại vào body.

Dưới đây là ví dụ về JSON cho Rectangle và Circle với trường discriminator có tên `kind`:

**Rectangle**
```json
{
   "kind": "rectangle",
   "x": 100,
   "y": 50,
   "width": 10,
   "length": 24,
   "fillColor": "Red",
   "lineColor": "White",
   "subscription": {
      "kind": "free"
   }
}
```

**Circle**
```json
{
   "kind": "circle",
   "x": 100,
   "y": 50,
   "radius": 10,
   "fillColor": "Green",
   "lineColor": "Black",
   "subscription": {
      "kind": "paid",
      "expiration": "2024",
      "invoice": "123456"
   }
}
```
Cả Rectangle và Circle đều có các trường chung: `kind`, `fillColor`, `lineColor` và `subscription`. Rectangle còn có `x`, `y`, `width` và `length` trong khi Circle có `x`, `y` và `radius`. `subscription` là một kiểu đa hình lồng nhau. Một subscription `free` không có trường bổ sung và một subscription `paid` có các trường `expiration` và `invoice`.

[Azure Naming Guidelines](./ConsiderationsForServiceDesign.md#common-names) khuyến nghị trường discriminator nên được đặt tên là `kind`.

<a href="#json-polymorphism-kind-extensible" name="json-polymorphism-kind-extensible">:ballot_box_with_check:</a> **YOU SHOULD** định nghĩa trường discriminator của một kiểu đa hình là một extensible enum.

<a href="#json-polymorphism-kind-immutable" name="json-polymorphism-kind-immutable">:warning:</a> **YOU SHOULD NOT** cho phép một lần cập nhật (patch) thay đổi trường discriminator của một kiểu đa hình.

<a href="#json-polymorphism-versioning" name="json-polymorphism-versioning">:warning:</a> **YOU SHOULD NOT** trả về các thuộc tính của một kiểu đa hình mà không được định nghĩa cho api-version được chỉ định trong request.

<a href="#json-polymorphism-arrays" name="json-polymorphism-arrays">:warning:</a> **YOU SHOULD NOT** có một thuộc tính của resource có thể cập nhật mà giá trị của nó là một mảng các đối tượng đa hình.

Việc cập nhật một thuộc tính mảng bằng JSON merge-patch không bền vững qua các phiên bản nếu mảng chứa các kiểu đa hình.

## Các mẫu thiết kế API phổ biến

<a href="#actions" name="actions"></a>
### Thực hiện một Action
Đặc tả REST được dùng để mô hình hóa trạng thái của một resource, và chủ yếu nhằm xử lý các thao tác CRUD (Create, Read, Update, Delete). Tuy nhiên, nhiều dịch vụ cần khả năng thực hiện một action trên một resource, ví dụ lấy thumbnail của một hình ảnh hoặc khởi động lại một VM.  Đôi khi cũng hữu ích khi thực hiện một action trên một collection.

<a href="#actions-url-pattern-for-resource-action" name="actions-url-pattern-for-resource-action">:ballot_box_with_check:</a> **YOU SHOULD** tạo mẫu URL của bạn như sau để thực hiện một action trên một resource
**Mẫu URL**
```text
https://.../<resource-collection>/<resource-id>:<action>?<input parameters>
```

**Ví dụ**
```text
https://.../users/Bob:grant?access=read
```

<a href="#actions-url-pattern-for-collection-action" name="actions-url-pattern-for-collection-action">:ballot_box_with_check:</a> **YOU SHOULD** tạo mẫu URL của bạn như sau để thực hiện một action trên một collection
**Mẫu URL**
```text
https://.../<resource-collection>:<action>?<input parameters>
```

**Ví dụ**
```text
https://.../users:grant?access=read
```

Lưu ý: Để tránh khả năng xung đột giữa action và resource id, bạn nên không cho phép dùng ký tự ":" trong resource id.

<a href="#actions-use-post-method" name="actions-use-post-method">:white_check_mark:</a> **DO** dùng thao tác POST cho bất kỳ action nào trên một resource hoặc collection.

<a href="#actions-support-repeatability-headers" name="actions-support-repeatability-headers">:white_check_mark:</a> **DO** hỗ trợ các request header Repeatability-Request-ID và Repeatability-First-Sent nếu action cần idempotent khi xảy ra retry.

<a href="#actions-synchronous-success-status-code" name="actions-synchronous-success-status-code">:white_check_mark:</a> **DO** trả về `200-OK` khi action hoàn tất đồng bộ và thành công.

<a href="#actions-action-name-is-verb" name="actions-action-name-is-verb">:ballot_box_with_check:</a> **YOU SHOULD** dùng một động từ làm thành phần `<action>` của đường dẫn.

<a href="#actions-no-actions-for-crud" name="actions-no-actions-for-crud">:no_entry:</a> **DO NOT** dùng thao tác action khi hành vi của thao tác có thể được định nghĩa một cách hợp lý là một trong các thao tác REST tiêu chuẩn Create, Read, Update, Delete hoặc List.

<a href="#collections" name="collections"></a>
### Collection
<a href="#collections-response-is-object" name="collections-response-is-object">:white_check_mark:</a> **DO** cấu trúc response của một thao tác list thành một đối tượng với một trường mảng cấp cao nhất chứa tập (hoặc tập con) các resource.

<a href="#collections-support-server-driven-paging" name="collections-support-server-driven-paging">:ballot_box_with_check:</a> **YOU SHOULD** hỗ trợ phân trang ngay từ bây giờ nếu trong tương lai có bất kỳ khả năng nào số lượng mục có thể tăng lên rất lớn.

LƯU Ý: Việc thêm phân trang trong tương lai là một breaking change

<a href="#collections-use-get-method" name="collections-use-get-method">:heavy_check_mark:</a> **YOU MAY** cung cấp một thao tác liệt kê các resource của bạn bằng cách hỗ trợ phương thức GET với URL trỏ đến một resource-collection (thay vì một resource-id).

**Body response ví dụ**
```json
{
    "value": [
       { "id": "Item 01", "etag": "\"abc\"", "price": 99.95, "size": "Medium" },
       { … },
       { … },
       { "id": "Item 99", "etag": "\"def\"", "price": 59.99, "size": "Large" }
    ],
    "nextLink": "{opaqueUrl}"
 }
```

<a href="#collections-items-have-id-and-etag" name="collections-items-have-id-and-etag">:white_check_mark:</a> **DO** đưa trường _id_ và trường _etag_ (nếu được hỗ trợ) vào mỗi mục vì điều này cho phép khách hàng sửa mục đó trong một thao tác sau này. Lưu ý rằng trường etag _phải_ có các dấu nháy được escape nhúng bên trong; ví dụ, "\"abc\"" hoặc W/"\"abc\"".

<a href="#collections-document-pagination-reliability" name="collections-document-pagination-reliability">:white_check_mark:</a> **DO** tài liệu hóa rõ ràng rằng các resource có thể bị bỏ sót hoặc trùng lặp giữa các trang của một collection được phân trang, trừ khi thao tác đã có biện pháp đặc biệt để ngăn điều này (như chụp một snapshot của collection có thời hạn).

<a href="#collections-include-nextlink-for-more-results" name="collections-include-nextlink-for-more-results">:white_check_mark:</a> **DO** trả về một trường `nextLink` với URL tuyệt đối mà client có thể GET để lấy trang kế tiếp của collection.

Lưu ý: Dịch vụ chịu trách nhiệm thực hiện mọi việc URL-encoding cần thiết cho URL `nextLink`.

<a href="#collections-nextlink-includes-all-query-params" name="collections-nextlink-includes-all-query-params">:white_check_mark:</a> **DO** đưa vào `nextLink` mọi query parameter mà dịch vụ yêu cầu, bao gồm `api-version`.

<a href="#collections-response-array-name" name="collections-response-array-name">:ballot_box_with_check:</a> **YOU SHOULD** dùng `value` làm tên của trường mảng cấp cao nhất trừ khi có một tên phù hợp hơn.

<a href="#collections-no-nextlink-on-last-page" name="collections-no-nextlink-on-last-page">:no_entry:</a> **DO NOT** trả về trường `nextLink` khi trả về trang cuối cùng của collection.

<a href="#collections-nextlink-value-never-null" name="collections-nextlink-value-never-null">:no_entry:</a> **DO NOT** trả về trường `nextLink` với giá trị null.

<a href="#collections-avoid-count-property" name="collections-avoid-count-property">:warning:</a> **YOU SHOULD NOT** trả về `count` của tất cả đối tượng trong collection vì việc tính toán này có thể tốn kém.

#### Tùy chọn query

<a href="#collections-query-options" name="collections-query-options">:heavy_check_mark:</a> **YOU MAY** hỗ trợ các query parameter sau để cho phép khách hàng kiểm soát thao tác list:

Parameter&nbsp;name | Kiểu | Mô tả
------------------- | ---- | -----------
`filter`       | string            | một biểu thức trên kiểu resource để chọn các resource được trả về
`orderby`      | string&nbsp;array | danh sách các biểu thức chỉ định thứ tự của các resource được trả về
`skip`         | integer           | một offset vào collection của resource đầu tiên được trả về
`top`          | integer           | số lượng resource tối đa được trả về từ collection
`maxpagesize`  | integer           | số lượng resource tối đa được đưa vào một response đơn lẻ
`select`       | string&nbsp;array | danh sách tên trường được trả về cho mỗi resource
`expand`       | string&nbsp;array | danh sách các resource liên quan được đưa vào cùng dòng với mỗi resource

<a href="#collections-error-on-unknown-parameter" name="collections-error-on-unknown-parameter">:white_check_mark:</a> **DO** trả về lỗi nếu client chỉ định bất kỳ parameter nào không được dịch vụ hỗ trợ.

<a href="#collections-parameter-names-case-sensitivity" name="collections-parameter-names-case-sensitivity">:white_check_mark:</a> **DO** xử lý các tên query parameter này theo kiểu phân biệt chữ hoa/thường.

<a href="#collections-select-expand-ordering" name="collections-select-expand-ordering">:white_check_mark:</a> **DO** áp dụng các tùy chọn `select` hoặc `expand` sau khi đã áp dụng tất cả các tùy chọn query trong bảng ở trên.

<a href="#collections-query-options-ordering" name="collections-query-options-ordering">:white_check_mark:</a> **DO** áp dụng các tùy chọn query lên collection theo thứ tự được hiển thị trong bảng ở trên.

<a href="#collections-query-options-no-dollar-sign" name="collections-query-options-no-dollar-sign">:no_entry:</a> **DO NOT** thêm tiền tố "$" vào bất kỳ tên query parameter nào trong số này (quy ước trong [chuẩn OData](http://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_QueryingCollections)).

#### filter

<a href="#collections-filter-param" name="collections-filter-param">:heavy_check_mark:</a> **YOU MAY** hỗ trợ lọc kết quả của một thao tác list bằng query parameter `filter`.

Giá trị của query parameter `filter` là một biểu thức liên quan đến các trường của resource và cho ra giá trị Boolean. Biểu thức này được đánh giá cho từng resource trong collection và chỉ những mục mà biểu thức cho kết quả true mới được đưa vào response.

<a href="#collections-filter-behavior" name="collections-filter-behavior">:white_check_mark:</a> **DO** loại bỏ khỏi collection tất cả các resource mà biểu thức filter cho kết quả false hoặc null, hoặc tham chiếu đến các thuộc tính không khả dụng do quyền truy cập.

Ví dụ: trả về tất cả Product có Price nhỏ hơn $10.00

```text
GET https://api.contoso.com/products?filter=price lt 10.00
```

##### Toán tử của filter

:heavy_check_mark: **YOU MAY** hỗ trợ các toán tử sau trong biểu thức filter:

Toán tử                  | Mô tả                 | Ví dụ
--------------------     | --------------------- | -----------------------------------------------------
**Toán tử so sánh**      |                       |
eq                       | Bằng                  | city eq 'Redmond'
ne                       | Không bằng            | city ne 'London'
gt                       | Lớn hơn               | price gt 20
ge                       | Lớn hơn hoặc bằng     | price ge 10
lt                       | Nhỏ hơn               | price lt 20
le                       | Nhỏ hơn hoặc bằng     | price le 100
**Toán tử logic**        |                       |
and                      | Và (logic)            | price le 200 and price gt 3.5
or                       | Hoặc (logic)          | price le 3.5 or price gt 200
not                      | Phủ định (logic)      | not price le 3.5
**Toán tử nhóm**         |                       |
( )                      | Nhóm theo độ ưu tiên  | (priority eq 1 or city eq 'Redmond') and price gt 100

<a href="#collections-filter-unknown-operator" name="collections-filter-unknown-operator">:white_check_mark:</a> **DO** phản hồi bằng một thông báo lỗi như định nghĩa trong phần [Xử lý lỗi](#handling-errors) nếu client đưa vào biểu thức filter một toán tử không được thao tác hỗ trợ.

<a href="#collections-filter-operator-ordering" name="collections-filter-operator-ordering">:white_check_mark:</a> **DO** dùng thứ tự ưu tiên toán tử sau cho các toán tử được hỗ trợ khi đánh giá biểu thức filter. Các toán tử được liệt kê theo nhóm theo thứ tự ưu tiên từ cao nhất đến thấp nhất. Các toán tử trong cùng một nhóm có độ ưu tiên bằng nhau và nên được đánh giá từ trái sang phải:

| Nhóm            | Toán tử  | Mô tả
| ----------------|----------|------------
| Nhóm            | ( )      | Nhóm theo độ ưu tiên  |
| Một ngôi        | not      | Phủ định logic        |
| Quan hệ         | gt       | Lớn hơn               |
|                 | ge       | Lớn hơn hoặc bằng     |
|                 | lt       | Nhỏ hơn               |
|                 | le       | Nhỏ hơn hoặc bằng     |
| Bằng nhau       | eq       | Bằng                  |
|                 | ne       | Không bằng            |
| AND có điều kiện | and     | Và (logic)            |
| OR có điều kiện | or       | Hoặc (logic)          |

<a href="#collections-filter-functions" name="collections-filter-functions">:heavy_check_mark:</a> **YOU MAY** hỗ trợ các hàm orderby và filter như concat và contains. Để biết thêm thông tin, xem [các hàm chuẩn của odata](https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part2-url-conventions.html#_Toc31360979).

##### Ví dụ về toán tử
Các ví dụ sau minh họa cách dùng và ngữ nghĩa của từng toán tử logic.

Ví dụ: tất cả sản phẩm có tên bằng 'Milk'

```text
GET https://api.contoso.com/products?filter=name eq 'Milk'
```

Ví dụ: tất cả sản phẩm có tên không bằng 'Milk'

```text
GET https://api.contoso.com/products?filter=name ne 'Milk'
```

Ví dụ: tất cả sản phẩm có tên 'Milk' đồng thời có giá nhỏ hơn 2.55:

```text
GET https://api.contoso.com/products?filter=name eq 'Milk' and price lt 2.55
```

Ví dụ: tất cả sản phẩm hoặc có tên 'Milk' hoặc có giá nhỏ hơn 2.55:

```text
GET https://api.contoso.com/products?filter=name eq 'Milk' or price lt 2.55
```

Ví dụ: tất cả sản phẩm có tên 'Milk' hoặc 'Eggs' và có giá nhỏ hơn 2.55:

```text
GET https://api.contoso.com/products?filter=(name eq 'Milk' or name eq 'Eggs') and price lt 2.55
```

#### orderby

<a href="#collections-orderby-param" name="collections-orderby-param">:heavy_check_mark:</a> **YOU MAY** hỗ trợ sắp xếp kết quả của một thao tác list bằng query parameter `orderby`.
*LƯU Ý: Việc một dịch vụ hỗ trợ `orderby` là không phổ biến vì nó rất tốn kém để triển khai do phải sắp xếp toàn bộ collection lớn trước khi có thể trả về bất kỳ kết quả nào.*

Giá trị của parameter `orderby` là một danh sách các biểu thức phân tách bằng dấu phẩy dùng để sắp xếp các mục.
Một trường hợp đặc biệt của biểu thức như vậy là một đường dẫn thuộc tính kết thúc ở một thuộc tính kiểu nguyên thủy.

Mỗi biểu thức trong giá trị parameter `orderby` có thể kèm hậu tố "asc" cho tăng dần hoặc "desc" cho giảm dần, phân tách khỏi biểu thức bằng một hoặc nhiều khoảng trắng.

<a href="#collections-orderby-ordering" name="collections-orderby-ordering">:white_check_mark:</a> **DO** sắp xếp collection theo thứ tự tăng dần trên một biểu thức nếu không chỉ định "asc" hoặc "desc".

<a href="#collections-orderby-null-ordering" name="collections-orderby-null-ordering">:white_check_mark:</a> **DO** sắp xếp các giá trị NULL là "nhỏ hơn" các giá trị không NULL.

<a href="#collections-orderby-behavior" name="collections-orderby-behavior">:white_check_mark:</a> **DO** sắp xếp các mục theo giá trị kết quả của biểu thức đầu tiên, rồi sắp xếp các mục có cùng giá trị cho biểu thức đầu tiên theo giá trị kết quả của biểu thức thứ hai, và cứ thế tiếp tục.

<a href="#collections-orderby-inherent-sort-order" name="collections-orderby-inherent-sort-order">:white_check_mark:</a> **DO** dùng thứ tự sắp xếp vốn có của kiểu của trường. Ví dụ, giá trị date-time nên được sắp xếp theo thứ tự thời gian chứ không phải theo bảng chữ cái.

<a href="#collections-orderby-unsupported-field" name="collections-orderby-unsupported-field">:white_check_mark:</a> **DO** phản hồi bằng một thông báo lỗi như định nghĩa trong phần [Xử lý lỗi](#handling-errors) nếu client yêu cầu sắp xếp theo một trường không được thao tác hỗ trợ.

Ví dụ, để trả về tất cả people được sắp xếp theo name tăng dần:
```text
GET https://api.contoso.com/people?orderby=name
```

Ví dụ, để trả về tất cả people được sắp xếp theo name giảm dần và thứ tự sắp xếp phụ là hireDate tăng dần.
```text
GET https://api.contoso.com/people?orderby=name desc,hireDate
```

Việc sắp xếp MUST kết hợp được với việc lọc sao cho:
```text
GET https://api.contoso.com/people?filter=name eq 'david'&orderby=hireDate
```
sẽ trả về tất cả people có name là David được sắp xếp theo hireDate tăng dần.

##### Các cân nhắc khi sắp xếp cùng với phân trang

<a href="#collections-consistent-options-with-pagination" name="collections-consistent-options-with-pagination">:white_check_mark:</a> **DO** dùng cùng các tùy chọn lọc và thứ tự sắp xếp cho tất cả các trang của response của một thao tác list có phân trang.

##### skip
<a href="#collections-skip-param-definition" name="collections-skip-param-definition">:white_check_mark:</a> **DO** định nghĩa parameter `skip` là một integer với giá trị mặc định và tối thiểu là 0.

<a href="#collections-skip-param" name="collections-skip-param">:heavy_check_mark:</a> **YOU MAY** cho phép client truyền query parameter `skip` để chỉ định một offset vào collection của resource đầu tiên được trả về.
##### top

<a href="#collections-" name="collections-"></a>
<a href="#collections-top-param" name="collections-top-param">:heavy_check_mark:</a> **YOU MAY** cho phép client truyền query parameter `top` để chỉ định số lượng resource tối đa được trả về từ collection.

Nếu hỗ trợ `top`:
:white_check_mark: **DO** định nghĩa parameter `top` là một integer với giá trị tối thiểu là 1. Nếu không chỉ định, `top` có giá trị mặc định là vô cực.

<a href="#collections-top-behavior" name="collections-top-behavior">:white_check_mark:</a> **DO** trả về `top` resource của collection (nếu có), bắt đầu từ `skip`.

##### maxpagesize

<a href="#collections-maxpagesize-param" name="collections-maxpagesize-param">:heavy_check_mark:</a> **YOU MAY** cho phép client truyền query parameter `maxpagesize` để chỉ định số lượng resource tối đa được đưa vào response của một trang đơn lẻ.

<a href="#collections-maxpagesize-definition" name="collections-maxpagesize-definition">:white_check_mark:</a> **DO** định nghĩa parameter `maxpagesize` là một integer tùy chọn với giá trị mặc định phù hợp cho collection.

<a href="#collections-maxpagesize-might-return-fewer" name="collections-maxpagesize-might-return-fewer">:white_check_mark:</a> **DO** nêu rõ trong tài liệu của parameter `maxpagesize` rằng thao tác có thể chọn trả về ít resource hơn giá trị đã chỉ định.

<a href="#versioning" name="versioning"></a>

### Đánh phiên bản API

Các dịch vụ Azure cần thay đổi theo thời gian. Tuy nhiên, khi thay đổi một dịch vụ, có 2 yêu cầu:
 1. Các workload đang chạy của khách hàng không được bị hỏng do thay đổi của dịch vụ
 2. Khách hàng có thể chuyển sang phiên bản dịch vụ mới mà không cần thay đổi bất kỳ đoạn code nào (Tất nhiên, khách hàng phải sửa code để tận dụng các tính năng mới của dịch vụ.)

*LƯU Ý: [Azure Breaking Change Policy](http://aka.ms/AzBreakingChangesPolicy) có các bảng (mục 5) mô tả những loại thay đổi được coi là breaking change. Breaking change được phép thực hiện (vì lý do bảo mật/tuân thủ/v.v.) nếu được [Azure Breaking Change Reviewers](mailto:azbreakchangereview@microsoft.com) phê duyệt, nhưng chỉ sau khi đã thông báo đầy đủ cho khách hàng và có một giai đoạn ngừng hỗ trợ (deprecation) kéo dài.*

<a href="#versioning-review-required" name="versioning-review-required">:white_check_mark:</a> **DO** xem xét mọi thay đổi API cùng với Azure API Stewardship Board

Client chỉ định phiên bản API sẽ dùng trong mọi request gửi đến dịch vụ, kể cả các request đến URL `Operation-Location` hoặc `nextLink` do dịch vụ trả về.

<a href="#versioning-api-version-query-param" name="versioning-api-version-query-param">:white_check_mark:</a> **DO** dùng một query parameter bắt buộc có tên `api-version` trên mọi thao tác để client chỉ định phiên bản API.

<a href="#versioning-date-based-versioning" name="versioning-date-based-versioning">:white_check_mark:</a> **DO** dùng giá trị ngày dạng `YYYY-MM-DD`, kèm hậu tố `-preview` cho các phiên bản preview, làm các giá trị hợp lệ của `api-version`.

<a href="#versioning-api-version-missing" name="versioning-api-version-missing">:white_check_mark:</a> **DO** trả về HTTP 400 với mã lỗi "MissingApiVersionParameter" và thông báo "The api-version query parameter (?api-version=) is required for all requests" nếu client bỏ qua query parameter `api-version`.

<a href="#versioning-api-version-unsupported" name="versioning-api-version-unsupported">:white_check_mark:</a> **DO** trả về HTTP 400 với mã lỗi "UnsupportedApiVersionValue" và thông báo "Unsupported api-version '{0}'. The supported api-versions are '{1}'." nếu client truyền giá trị `api-version` mà dịch vụ không nhận ra. Đối với các api-version được hỗ trợ, chỉ cần liệt kê tất cả các phiên bản stable mà dịch vụ vẫn còn hỗ trợ và chỉ phiên bản public preview mới nhất (nếu có).

```text
PUT https://service.azure.com/users/Jeff?api-version=2021-06-04
```

<a href="#versioning-use-later-date" name="versioning-use-later-date">:white_check_mark:</a> **DO** dùng ngày muộn hơn cho mỗi phiên bản preview mới

Khi phát hành một bản preview mới, nhóm phát triển dịch vụ có thể ngừng hoàn toàn các phiên bản preview trước đó sau khi cho khách hàng ít nhất 90 ngày để nâng cấp code của họ

<a href="#versioning-no-breaking-changes" name="versioning-no-breaking-changes">:no_entry:</a> **DO NOT** đưa bất kỳ breaking change nào vào dịch vụ.

<a href="#versioning-no-version-in-path" name="versioning-no-version-in-path">:no_entry:</a> **DO NOT** đưa segment số phiên bản vào đường dẫn của bất kỳ thao tác nào.

<a href="#versioning-use-later-date-2" name="versioning-use-later-date-2">:no_entry:</a> **DO NOT** dùng cùng một ngày khi chuyển từ API preview sang API GA. Nếu `api-version` của bản preview là '2021-06-04-preview', thì phiên bản GA của API **phải là** một ngày muộn hơn 2021-06-04

<a href="#versioning-preview-goes-ga-within-one-year" name="versioning-preview-goes-ga-within-one-year">:no_entry:</a> **DO NOT** giữ một tính năng ở trạng thái preview quá 1 năm; nó phải chuyển sang GA (hoặc bị gỡ bỏ) trong vòng 1 năm kể từ khi được giới thiệu.

#### Dùng Extensible Enum

Việc xóa một giá trị khỏi enum là một breaking change, nhưng việc thêm giá trị vào enum có thể được xử lý bằng _extensible enum_.  Extensible enum là một giá trị chuỗi được đánh dấu bằng một marker đặc biệt - đặt `modelAsString` thành true trong một khối `x-ms-enum`. Ví dụ:

```json
"createdByType": {
   "type": "string",
   "description": "The type of identity that created the resource.",
   "enum": [
      "User",
      "Application",
      "ManagedIdentity",
      "Key"
   ],
   "x-ms-enum": {
      "name": "createdByType",
      "modelAsString": true
   }
}
```

<a href="#versioning-use-extensible-enums" name="versioning-use-extensible-enums">:ballot_box_with_check:</a> **YOU SHOULD** dùng extensible enum trừ khi bạn chắc chắn rằng tập ký hiệu sẽ **KHÔNG BAO GIỜ** thay đổi theo thời gian.

<a href="#deprecation" name="deprecation"></a>
### Thông báo về hành vi sắp ngừng hỗ trợ

Khi không thể tuân theo hướng dẫn [Đánh phiên bản API](#api-versioning) ở trên và [Azure Breaking Change Reviewers](mailto:azbreakchangereview@microsoft.com) phê duyệt một breaking change cho một phiên bản API cụ thể, thay đổi đó phải được thông báo cho các bên gọi. Phiên bản API đang bị ngừng hỗ trợ phải thêm response header `azure-deprecating` với một chuỗi phân tách bằng dấu chấm phẩy, thông báo cho bên gọi biết điều gì đang bị ngừng hỗ trợ, khi nào nó sẽ không còn hoạt động, và một URL dẫn đến thông tin chi tiết hơn, chẳng hạn thao tác mới mà họ nên dùng thay thế.

Mục đích là thông báo cho khách hàng (khi debug/ghi log các response) rằng họ phải hành động để sửa lời gọi đến thao tác của dịch vụ và dùng phiên bản API mới hơn, nếu không lời gọi của họ sẽ sớm ngừng hoạt động hoàn toàn. Code client không được kỳ vọng sẽ kiểm tra/phân tích giá trị của header này theo bất kỳ cách nào; nó thuần túy mang tính thông tin cho con người. Chuỗi này _không_ thuộc hợp đồng API (ngoại trừ các dấu phân tách chấm phẩy) và có thể được thay đổi/cải thiện bất cứ lúc nào mà không gây ra breaking change.

<a href="#deprecation-header" name="deprecation-header">:white_check_mark:</a> **DO** đưa header `azure-deprecating` vào response của thao tác _chỉ khi_ thao tác sẽ ngừng hoạt động trong tương lai và client _phải thực hiện_ hành động để nó tiếp tục hoạt động.
> LƯU Ý: Chúng ta không muốn làm khách hàng hoảng sợ bằng header này.

<a href="#deprecation-header-value" name="deprecation-header-value">:white_check_mark:</a> **DO** đặt giá trị của header là một chuỗi phân tách bằng dấu chấm phẩy, biểu thị một tập các mục ngừng hỗ trợ, trong đó mỗi mục cho biết điều gì đang bị ngừng hỗ trợ, khi nào nó bị ngừng hỗ trợ, và một URL đến thông tin chi tiết hơn.

Các mục ngừng hỗ trợ nên theo mẫu sau:
```text
<description> will retire on <date> (<url>)
```

Cho phép nhiều mục ngừng hỗ trợ, phân tách bằng dấu chấm phẩy.

Trong đó các placeholder sau nên được cung cấp:
- `description`: mô tả dễ đọc cho con người về điều đang bị ngừng hỗ trợ
- `date`: ngày dự kiến mà mục này sẽ bị ngừng hỗ trợ. Giá trị này nên được biểu diễn theo định dạng trong [ISO 8601](https://datatracker.ietf.org/doc/html/rfc7231#section-7.1.1.1), ví dụ "2022-10-31".
- `url`: một URL đầy đủ mà người dùng có thể truy cập để tìm hiểu thêm về điều đang bị ngừng hỗ trợ, tốt nhất là trỏ đến Azure Updates.

Ví dụ:
- `azure-deprecating: API version 2009-27-07 will retire on 2022-12-01 (https://azure.microsoft.com/updates/video-analyzer-retirement);TLS 1.0 & 1.1 will retire on 2020-10-30 (https://azure.microsoft.com/updates/azure-active-directory-registration-service-is-ending-support-for-tls-10-and-11/)`
- `azure-deprecating: Model version 2021-01-15 used in Sentiment analysis will retire on 2022-12-01 (https://aka.ms/ta-modelversions?sentimentAnalysis)`
- `azure-deprecating: TLS 1.0 & 1.1 support will retire on 2022-10-01 (https://devblogs.microsoft.com/devops/deprecating-weak-cryptographic-standards-tls-1-0-and-1-1-in-azure-devops-services/)`

<a href="#deprecation-header-review" name="deprecation-header-review">:no_entry:</a> **DO NOT** đưa header này vào khi chưa có sự phê duyệt từ [Azure Breaking Change Reviewers](mailto:azbreakchangereview@microsoft.com) và một thông báo ngừng hỗ trợ chính thức trên [Azure Updates](https://azure.microsoft.com/updates/).

<a href="#repeatability" name="repeatability"></a>
### Tính lặp lại của request

Các ứng dụng chịu lỗi (fault tolerant) yêu cầu client thử lại các request mà chúng chưa bao giờ nhận được response, và dịch vụ phải xử lý các request được thử lại này theo cách idempotent. Trong Azure, mọi thao tác HTTP đều idempotent một cách tự nhiên, ngoại trừ POST dùng để tạo resource và [POST khi dùng để gọi một action](
https://github.com/microsoft/api-guidelines/blob/vNext/azure/Guidelines.md#performing-an-action).

<a href="#repeatability-headers" name="repeatability-headers">:ballot_box_with_check:</a> **YOU SHOULD** hỗ trợ các request có thể lặp lại như được định nghĩa trong [OASIS Repeatable Requests Version 1.0](https://docs.oasis-open.org/odata/repeatable-requests/v1.0/repeatable-requests-v1.0.html) cho các thao tác POST để chúng có thể được thử lại.
- Khoảng thời gian được theo dõi (chênh lệch giữa giá trị `Repeatability-First-Sent` và thời gian hiện tại) **MUST** ít nhất là 5 phút.
- Ghi tài liệu về việc thao tác POST hỗ trợ các header `Repeatability-First-Sent`, `Repeatability-Request-ID` và `Repeatability-Result` trong hợp đồng API và tài liệu.
- Bất kỳ thao tác nào không hỗ trợ các repeatability header nên trả về response 501 (Not Implemented) cho mọi request chứa repeatability request header hợp lệ.

### Thao tác chạy lâu & Job

_Thao tác chạy lâu (LRO)_ thường là một thao tác lẽ ra nên thực thi đồng bộ, nhưng do các dịch vụ không muốn duy trì các kết nối tồn tại lâu (>1 giây) và do timeout của load-balancer, thao tác buộc phải thực thi bất đồng bộ. Với mẫu thiết kế này, client khởi tạo thao tác trên dịch vụ, rồi client liên tục polling dịch vụ (qua một lời gọi API khác) để theo dõi tiến độ/việc hoàn tất của thao tác.

Các LRO luôn được khởi tạo bởi 1 client logic và có thể được polling (kiểm tra trạng thái) bởi chính client đó, một client khác, hoặc thậm chí nhiều client/trình duyệt. Một ví dụ là dashboard hoặc portal hiển thị tất cả các thao tác cùng trạng thái của chúng.  Xem [mục Long Running Operations](./ConsiderationsForServiceDesign.md#long-running-operations) trong Considerations for Service Design để có phần giới thiệu về thiết kế thao tác chạy lâu.

<a href="#lro-response-time" name="lro-response-time">:white_check_mark:</a> **DO** triển khai một thao tác dưới dạng LRO nếu thời gian response ở phân vị thứ 99 lớn hơn 1 giây và khi client nên polling thao tác trước khi tiến hành thêm.

<a href="#lro-no-patch-lro" name="lro-no-patch-lro">:no_entry:</a> **DO NOT** triển khai PATCH dưới dạng LRO. Nếu cần ngữ nghĩa cập nhật LRO, hãy triển khai bằng [mẫu thiết kế LRO POST action](#lro-existing-resource) .

#### Các mẫu thiết kế để khởi tạo thao tác chạy lâu

<a href="#lro-valid-inputs-synchronously" name="lro-valid-inputs-synchronously">:white_check_mark:</a> **DO** thực hiện kiểm tra hợp lệ càng nhiều càng tốt khi khởi tạo một thao tác LRO để cảnh báo client về lỗi sớm.

<a href="#lro-returns-operation-location" name="lro-returns-operation-location">:white_check_mark:</a> **DO** đưa vào response header `operation-location` chứa URL tuyệt đối của status monitor cho thao tác.

<a href="#lro-operation-location-includes-api-version" name="lro-operation-location-includes-api-version">:ballot_box_with_check:</a> **YOU SHOULD** đưa query parameter `api-version` vào response header `operation-location` với cùng phiên bản đã được truyền trong request ban đầu, nhưng hãy chờ đợi việc client thay đổi giá trị `api-version` thành bất kỳ giá trị nào mà một client mới/khác mong muốn.

<a href="#lro-put-response-headers" name="lro-put-response-headers">:white_check_mark:</a> **DO** đưa vào các response header chứa mọi giá trị bổ sung cần thiết cho [request GET polling](#lro-poll) đến status monitor (ví dụ: location).

#### Thao tác tạo hoặc thay thế kèm xử lý chạy lâu bổ sung
<a href="#put-operation-with-additional-long-running-processing" name="put-operation-with-additional-long-running-processing"></a>

<a href="#lro-create-init" name="lro-create-init">:white_check_mark:</a> **DO** dùng mẫu sau khi triển khai một thao tác tạo hoặc thay thế một resource có liên quan đến xử lý chạy lâu bổ sung:

```text
PUT /UrlToResourceBeingCreated?api-version=<api-version>
operation-id: <optionalStatusMonitorResourceId>

<JSON Resource in body>
```

Response phải có dạng như sau:

```text
201 Created
operation-id: <statusMonitorResourceId>
operation-location: https://operations/<operation-id>?api-version=<api-version>

<JSON Resource in body>
```

Schema của body request và response phải giống hệt nhau và biểu diễn resource.

PUT tạo hoặc thay thế resource ngay lập tức rồi trả về, nhưng phần xử lý chạy lâu bổ sung có thể mất thời gian để hoàn tất.

Đối với PUT idempotent (cùng `operation-id` hoặc cùng body request trong một khoảng thời gian ngắn), dịch vụ nên trả về cùng response như trên.

Đối với PUT không idempotent, dịch vụ có thể chọn ghi đè resource hiện có (như thể resource đã bị xóa) hoặc có thể trả về `409-Conflict` với thuộc tính code của lỗi cho biết lý do thao tác PUT này thất bại.

<a href="#lro-put-operation-id-request-header" name="lro-put-operation-id-request-header">:white_check_mark:</a> **DO** cho phép client truyền header `Operation-Id` với một ID cho status monitor của thao tác.

Nếu header `Operation-Id` không được chỉ định, dịch vụ có thể tạo một operation-id (thường là GUID) và trả về qua các response header `operation-id` và `operation-location`; trong trường hợp này dịch vụ phải tự tìm cách xử lý việc thử lại/tính idempotent.

<a href="#lro-put-operation-id-default-is-guid" name="lro-put-operation-id-default-is-guid">:white_check_mark:</a> **DO** tạo một ID (thường là GUID) cho status monitor nếu client không truyền header `Operation-Id`.

<a href="#lro-put-operation-id-unique-except-retries" name="lro-put-operation-id-unique-except-retries">:white_check_mark:</a> **DO** từ chối request bằng `409-Conflict` nếu header `Operation-Id` trùng với một thao tác hiện có, trừ khi request giống hệt request trước đó (trường hợp thử lại).

<a href="#lro-put-valid-inputs-synchronously" name="lro-put-valid-inputs-synchronously">:white_check_mark:</a> **DO** thực hiện kiểm tra hợp lệ càng nhiều càng tốt khi khởi tạo thao tác để cảnh báo client về lỗi sớm.

<a href="#lro-put-returns-200-or-201" name="lro-put-returns-200-or-201">:white_check_mark:</a> **DO** trả về status code `201-Created` cho thao tác tạo hoặc `200-OK` cho thao tác thay thế từ request ban đầu, kèm một biểu diễn của resource, nếu resource được tạo hoặc thay thế thành công.

<a href="#lro-put-returns-operation-id-header" name="lro-put-returns-operation-id-header">:white_check_mark:</a> **DO** đưa header `Operation-Id` vào response với ID của status monitor cho thao tác.

<a href="#lro-put-returns-operation-location" name="lro-put-returns-operation-location">:ballot_box_with_check:</a> **YOU SHOULD** đưa header `Operation-Location` vào response với URL tuyệt đối của status monitor cho thao tác.

<a href="#lro-put-operation-location-includes-api-version" name="lro-put-operation-location-includes-api-version">:ballot_box_with_check:</a> **YOU SHOULD** đưa query parameter `api-version` vào header `Operation-Location` với cùng phiên bản đã được truyền trong request ban đầu.

#### Mẫu LRO cho DELETE

<a href="#lro-delete" name="lro-delete">:white_check_mark:</a> **DO** dùng mẫu sau khi triển khai một thao tác LRO để xóa một resource:

```text
DELETE /UrlToResourceBeingDeleted?api-version=<api-version>
operation-id: <optionalStatusMonitorResourceId>
```

Response phải có dạng như sau:

```text
202 Accepted
operation-id: <statusMonitorResourceId>
operation-location: https://operations/<operation-id>
```

Nhất quán với các thao tác DELETE không phải LRO, nếu có chỉ định body request thì trả về `400-Bad Request`.

<a href="#lro-delete-operation-id-request-header" name="lro-delete-operation-id-request-header">:white_check_mark:</a> **DO** cho phép client truyền header `Operation-Id` với một ID cho status monitor của thao tác.

<a href="#lro-delete-operation-id-default-is-guid" name="lro-delete-operation-id-default-is-guid">:white_check_mark:</a> **DO** tạo một ID (thường là GUID) cho status monitor nếu client không truyền header `Operation-Id`.

<a href="#lro-delete-returns-202" name="lro-delete-returns-202">:white_check_mark:</a> **DO** trả về status code `202-Accepted` từ request khởi tạo một LRO nếu việc xử lý thao tác đã được khởi tạo thành công.

<a href="#lro-delete-returns-only-202" name="lro-delete-returns-only-202">:warning:</a> **YOU SHOULD NOT** trả về bất kỳ status code `2xx` nào khác từ request ban đầu của một LRO -- hãy trả về `202-Accepted` và một status monitor ngay cả khi việc xử lý đã hoàn tất trước khi request khởi tạo trả về.

#### Mẫu LRO action trên một resource
<a href="#post-or-delete-lro-pattern" name="post-or-delete-lro-pattern"></a><!-- Preserve old header link -->

<a href="#lro-existing-resource" name="lro-existing-resource">:white_check_mark:</a> **DO** dùng mẫu sau khi triển khai một LRO action tác động lên một resource hiện có:

```text
POST /UrlToExistingResource:<action>?api-version=<api-version>&<actionParamsGoHere>
operation-id: <optionalStatusMonitorResourceId>`

<JSON Action parameters can go in body if query params don't work>
```

Response phải có dạng như sau:

```text
202 Accepted
operation-id: <statusMonitorResourceId>
operation-location: https://operations/<operation-id>

<JSON Status Monitor Resource in body>
```

Body request chứa thông tin dùng để thực thi action.

Đối với POST idempotent (cùng `operation-id` và body request trong một khoảng thời gian ngắn), dịch vụ nên trả về cùng response như request ban đầu.

Đối với POST không idempotent, dịch vụ có thể coi thao tác POST là idempotent (nếu được thực hiện trong một khoảng thời gian ngắn) hoặc có thể coi thao tác POST là khởi tạo một thao tác LRO action hoàn toàn mới.

<a href="#lro-no-post-create" name="lro-no-post-create">:no_entry:</a> **DO NOT** dùng POST chạy lâu để tạo resource -- hãy dùng PUT như mô tả ở trên.

<a href="#lro-operation-id-request-header" name="lro-operation-id-request-header">:white_check_mark:</a> **DO** cho phép client truyền header `Operation-Id` với một ID cho status monitor của thao tác.

<a href="#lro-operation-id-default-is-guid" name="lro-operation-id-default-is-guid">:white_check_mark:</a> **DO** tạo một ID (thường là GUID) cho status monitor nếu client không truyền header `Operation-Id`.

<a href="#lro-operation-id-unique-except-retries" name="lro-operation-id-unique-except-retries">:white_check_mark:</a> **DO** từ chối request bằng `409-Conflict` nếu header `Operation-Id` trùng với một thao tác hiện có, trừ khi request giống hệt request trước đó (trường hợp thử lại).

<a href="#lro-returns-202" name="lro-returns-202">:white_check_mark:</a> **DO** trả về status code `202-Accepted` từ request khởi tạo một LRO action trên resource nếu việc xử lý thao tác đã được khởi tạo thành công.

<a href="#lro-returns-only-202" name="lro-returns-only-202">:warning:</a> **YOU SHOULD NOT** trả về bất kỳ status code `2xx` nào khác từ request ban đầu của một LRO -- hãy trả về `202-Accepted` và một status monitor ngay cả khi việc xử lý đã hoàn tất trước khi request khởi tạo trả về.

<a href="#lro-returns-status-monitor" name="lro-returns-status-monitor">:white_check_mark:</a> **DO** trả về một status monitor trong body response như mô tả trong [Lấy trạng thái và kết quả của các thao tác chạy lâu](#obtaining-status-and-results-of-long-running-operations).

#### Mẫu LRO action không liên quan đến resource nào

<a href="#lro-action-no-resource" name="lro-action-no-resource">:white_check_mark:</a> **DO** dùng mẫu sau khi triển khai một LRO action không liên quan đến một resource cụ thể (chẳng hạn một thao tác batch):

```text
PUT <operation-endpoint>/<operation-id>?api-version=<api-version>

<JSON body with parameters for the operation>>
```

Response phải có dạng như sau:

```text
201 Created
operation-location: <absolute URL of status monitor>

<JSON Status Monitor Resource in body>
```

<a href="#lro-put-action-operation-endpoint" name="lro-put-action-operation-endpoint">:ballot_box_with_check:</a> **YOU SHOULD**
định nghĩa một operation endpoint riêng biệt cho mỗi LRO action không liên quan đến resource nào.

<a href="#lro-put-action-operation-id" name="lro-put-action-operation-id-in-path">:white_check_mark:</a> **DO** yêu cầu
`Operation-Id` là path segment cuối cùng trong URL.

Lưu ý: Segment URL `operation-id` (không phải header) là *bắt buộc*, buộc client chỉ định ID resource của status monitor
và cũng được dùng cho việc thử lại/tính idempotent.

<a href="#lro-put-action-returns-201" name="lro-put-action-returns-201">:white_check_mark:</a> **DO** trả về status code `201 Created`
kèm response header `operation-location` nếu thao tác LRO Action được chấp nhận để xử lý.

<a href="#lro-put-action-returns-status-monitor" name="lro-put-action-returns-status-monitor">:white_check_mark:</a> **DO** trả về một
status monitor trong body response chứa trạng thái thao tác, các tham số request, và khi thao tác hoàn tất thì chứa
kết quả hoặc lỗi của thao tác.

Lưu ý: Vì tất cả tham số request phải có mặt trong status monitor,
body request và response của PUT có thể được định nghĩa bằng một schema duy nhất.

<a href="#lro-put-action-status-monitor-url" name="lro-put-action-status-monitor-url">:ballot_box_with_check:</a> **YOU SHOULD**
trả về status monitor của một thao tác cho một GET tiếp theo trên URL khởi tạo LRO, và dùng endpoint này làm
URL status monitor được trả về trong response header `operation-location`.

#### Resource Status Monitor

Mọi mẫu thiết kế khởi tạo LRO đều ngầm định hoặc tường minh tạo một [resource Status Monitor](https://datatracker.ietf.org/doc/html/rfc7231#section-6.3.3) trong collection `operations` của dịch vụ.

<a href="#lro-status-monitor-structure" name="lro-status-monitor-structure">:white_check_mark:</a> **DO** trả về một status monitor trong body response tuân theo cấu trúc sau:

Thuộc tính | Kiểu        | Bắt buộc | Mô tả
-------- | ----------- | :------: | -----------
`id`     | string      | true     | ID duy nhất của thao tác
`kind`   | string enum | true(*)  | Loại thao tác
`status` | string enum | true     | Trạng thái hiện tại của thao tác: "NotStarted", "Running", "Succeeded", "Failed", và "Canceled"
`error`  | ErrorDetail |          | Nếu `status`=="Failed", chứa lý do thất bại
`result` | object      |          | Nếu `status`=="Succeeded" && Action LRO (POST hoặc PUT), chứa kết quả thành công nếu cần
additional<br/>properties | | | Các thuộc tính bổ sung có tên hoặc động của thao tác

(*): Khi một status monitor endpoint hỗ trợ nhiều thao tác với cấu trúc kết quả hoặc thuộc tính bổ sung khác nhau,
status monitor **phải** có tính đa hình -- nó **phải** chứa một thuộc tính `kind` bắt buộc cho biết loại thao tác chạy lâu.

#### Lấy trạng thái và kết quả của các thao tác chạy lâu

<a href="#lro-poll" name="lro-poll">:white_check_mark:</a> **DO** dùng mẫu sau để cho phép client polling trạng thái hiện tại của một resource Status Monitor:

```text
GET <operation-endpoint>/<operation-id>?api-version=<api-version>
```

Response phải có dạng như sau:

```text
200 OK
retry-after: <delay-seconds>    (if status not terminal)

<JSON Status Monitor Resource in body>
```

<a href="#lro-status-monitor-get-returns-200" name="lro-status-monitor-get-returns-200">:white_check_mark:</a> **DO** hỗ trợ phương thức GET trên status monitor endpoint, trả về response `200-OK` kèm trạng thái hiện tại của status monitor.

<a href="#lro-status-monitor-accepts-any-api-version" name="lro-status-monitor-accepts-any-api-version">:ballot_box_with_check:</a> **YOU SHOULD** cho phép dùng bất kỳ giá trị hợp lệ nào của query parameter `api-version` trong thao tác GET trên status monitor.

- Lưu ý: Client có thể thay giá trị của `api-version` trong URL `operation-location` bằng một giá trị phù hợp với ứng dụng của họ. Hãy nhớ rằng client khởi tạo LRO có thể không phải là client polling trạng thái của LRO.

<a href="#lro-status-monitor-includes-all-fields" name="lro-status-monitor-includes-all-fields">:white_check_mark:</a> **DO** đưa `id` của thao tác và mọi giá trị khác cần thiết để client tạo request GET đến status monitor (ví dụ: một path parameter `location`).

<a href="#lro-status-monitor-post-action-result" name="lro-status-monitor-post-action-result">:white_check_mark:</a> **DO** đưa thuộc tính `result` (nếu có) vào status monitor cho một thao tác chạy lâu kiểu POST action khi thao tác hoàn tất thành công.

<a href="#lro-status-monitor-no-resource-result" name="lro-status-monitor-no-resource-result">:no_entry:</a> **DO NOT** đưa thuộc tính `result` vào status monitor cho một thao tác chạy lâu không phải kiểu action.

<a href="#lro-status-monitor-retry-after" name="lro-status-monitor-retry-after">:white_check_mark:</a> **DO** đưa header `retry-after` vào response nếu thao tác chưa hoàn tất. Giá trị của header này nên là một số nguyên giây mà client nên chờ trước khi polling status monitor lần nữa.

<a href="#lro-status-monitor-retention" name="lro-status-monitor-retention">:white_check_mark:</a> **DO** lưu giữ resource status monitor trong một khoảng thời gian được công bố công khai trong tài liệu (ít nhất 24 giờ) sau khi thao tác hoàn tất.

#### Mẫu để liệt kê Status Monitor

Dùng các mẫu sau để cho phép client liệt kê các resource Status Monitor.

<a href="#lro-list-status-monitors" name="lro-list-status-monitors">:ballot_box_with_check:</a>
**YOU MAY** hỗ trợ phương thức GET trên URL của bất kỳ collection status monitor nào, trả về danh sách các status monitor trong collection đó.

<a href="#lro-put-action-list-status-monitors" name="lro-put-action-list-status-monitors">:ballot_box_with_check:</a>
**YOU SHOULD** hỗ trợ thao tác liệt kê cho bất kỳ collection status monitor nào có chứa các status monitor của LRO Action không liên quan đến resource nào.

<a href="#lro-list-status-monitors-filter" name="lro-list-status-monitors-filter">:ballot_box_with_check:</a>
**YOU SHOULD** hỗ trợ query parameter `filter` trên thao tác liệt kê cho bất kỳ collection status monitor đa hình nào và hỗ trợ lọc theo giá trị `kind` của status monitor.

Ví dụ, request sau nên trả về tất cả resource status monitor có `kind` là "VMInitializing" *hoặc* "VMRebooting"
và có status là "NotStarted" *hoặc* "Succeeded".

```text
GET /operations?filter=(kind eq 'VMInitializing' or kind eq 'VMRebooting') and (status eq 'NotStarted' or status eq 'Succeeded')
```

<a href="#byos" name="byos"></a>

### Bring your own Storage (BYOS)

Nhiều dịch vụ cần lưu trữ và truy xuất các file dữ liệu. Với kịch bản này, dịch vụ không nên tự triển khai các API lưu trữ của riêng mình mà nên tận dụng dịch vụ Azure Storage hiện có. Khi làm vậy, khách hàng
"sở hữu" storage account và chỉ cần cho dịch vụ của bạn biết để sử dụng nó. Thông thường, chúng ta gọi là <i>Bring Your Own Storage</i> vì khách hàng mang storage account của họ đến một dịch vụ khác. BYOS mang lại những lợi ích đáng kể cho bên triển khai dịch vụ: bảo mật, hiệu năng, thời gian hoạt động, v.v. Và tất nhiên, hầu hết khách hàng Azure đã quen thuộc với dịch vụ Azure Storage.

Mặc dù Azure Managed Storage có thể dễ bắt đầu hơn, nhưng khi dịch vụ của bạn phát triển và trưởng thành, BYOS mang lại sự linh hoạt và nhiều lựa chọn triển khai nhất. Hơn nữa, khi thiết kế API, hãy lưu ý cách biểu đạt các khái niệm lưu trữ và cách client sẽ truy cập dữ liệu của bạn. Ví dụ, nếu bạn làm việc với blob, thì bạn không nên đưa khái niệm thư mục ra ngoài.

<a href="#byos-pattern" name="byos-pattern">:white_check_mark:</a> **DO** dùng mẫu thiết kế Bring Your Own Storage.

<a href="#byos-prefix-for-folder" name="byos-prefix-for-folder">:white_check_mark:</a> **DO** dùng blob prefix cho một thư mục logic (tránh các thuật ngữ như `directory`, `folder` hoặc `path`).

<a href="#byos-allow-container-reuse" name="byos-allow-container-reuse">:no_entry:</a> **DO NOT** yêu cầu một container mới cho mỗi thao tác.

<a href="#byos-authorization" name="byos-authorization">:white_check_mark:</a> **DO** dùng managed identity và Role Based Access Control ([RBAC](https://docs.microsoft.com/azure/role-based-access-control/overview)) làm cơ chế cho phép khách hàng cấp quyền truy cập Storage account của họ cho dịch vụ của bạn.

<a href="#byos-define-rbac-roles" name="byos-define-rbac-roles">:white_check_mark:</a> **DO** thêm các vai trò RBAC cho mọi thao tác của dịch vụ cần truy cập Storage, với phạm vi giới hạn đúng các quyền cần thiết.

<a href="#byos-rbac-compatibility" name="byos-rbac-compatibility">:white_check_mark:</a> **DO** đảm bảo các vai trò RBAC tương thích ngược, và cụ thể là không thu hồi các quyền khỏi một vai trò nếu việc đó làm hỏng hoạt động của dịch vụ. Bất kỳ thay đổi nào đối với vai trò RBAC dẫn đến thay đổi hành vi của dịch vụ đều được coi là breaking change.


#### Xử lý lỗi 'downstream'
Việc phụ thuộc vào các dịch vụ khác, ví dụ storage, khi triển khai dịch vụ của bạn là điều không hiếm. Chắc chắn các dịch vụ mà bạn phụ thuộc vào sẽ có lúc gặp lỗi. Trong những tình huống này, bạn có thể đưa mã lỗi và nội dung lỗi downstream vào inner-error của body response. Điều này tạo ra một mẫu thiết kế nhất quán để xử lý lỗi trong các dịch vụ mà bạn phụ thuộc.

<a href="#byos-include-downstream-errors" name="byos-include-downstream-errors">:white_check_mark:</a> **DO** đưa lỗi từ các dịch vụ downstream vào phần 'inner-error' của body response.

#### Làm việc với file
Nói chung, có hai mẫu thiết kế mà bạn sẽ gặp khi làm việc với file: truy cập một file đơn lẻ và các collection file.

##### Truy cập một file đơn lẻ
Việc thiết kế API để truy cập một file đơn lẻ, tùy thuộc vào kịch bản của bạn, tương đối đơn giản.

<a href="#byos-sas-token" name="byos-sas-token">:heavy_check_mark:</a> **YOU MAY** dùng Shared Access Signature [SAS](https://docs.microsoft.com/azure/storage/common/storage-sas-overview) để cấp quyền truy cập một file đơn lẻ. SAS được coi là mức bảo mật tối thiểu cho file và có thể được dùng thay thế hoặc bổ sung cho RBAC.

<a href="#byos-http-insecure" name="byos-http-insecure">:ballot_box_with_check:</a> **YOU SHOULD** nếu dùng HTTP (không phải HTTPS) thì hãy ghi tài liệu cho người dùng biết rằng toàn bộ thông tin được gửi qua đường truyền dưới dạng văn bản thuần (clear text).

<a href="#byos-http-status-code" name="byos-http-status-code">:white_check_mark:</a> **DO** trả về một HTTP status code thể hiện kết quả hành vi của thao tác dịch vụ của bạn.

<a href="#byos-include-storage-error" name="byos-include-storage-error">:white_check_mark:</a> **DO** đưa thông tin lỗi Storage vào phần 'inner-error' của response lỗi nếu lỗi là kết quả của một thao tác Storage nội bộ bị thất bại. Điều này giúp client xác định nguyên nhân gốc của lỗi, ví dụ: một storage object bị thiếu hoặc không đủ quyền.

<a href="#byos-support-single-object" name="byos-support-single-object">:white_check_mark:</a> **DO** cho phép khách hàng chỉ định đường dẫn URL đến một Storage object đơn lẻ nếu dịch vụ của bạn cần truy cập một file đơn lẻ.

<a href="#byos-last-modified" name="byos-last-modified">:heavy_check_mark:</a> **YOU MAY** cho phép khách hàng cung cấp timestamp [last-modified](https://datatracker.ietf.org/doc/html/rfc7232#section-2.2) (theo định dạng RFC 7231) cho các file chỉ đọc. Điều này cho phép client chỉ định chính xác phiên bản nào của các file mà dịch vụ của bạn nên dùng.
Khi đọc một file, dịch vụ của bạn truyền timestamp này đến Azure Storage bằng request header [if-unmodified-since](https://datatracker.ietf.org/doc/html/rfc7232#section-3.4). Nếu thao tác Storage thất bại với 412, nghĩa là Storage object đã bị sửa đổi và thao tác dịch vụ của bạn nên trả về một status code 4xx phù hợp và trả lỗi Storage trong 'inner-error' của thao tác (xem hướng dẫn ở trên).

<a href="#byos-folder-support" name="byos-folder-support">:white_check_mark:</a> **DO** cho phép khách hàng chỉ định đường dẫn URL đến một thư mục logic (thông qua prefix và delimiter) nếu dịch vụ của bạn cần truy cập nhiều file (trong thư mục này). Để biết thêm thông tin, xem [List Blobs API](https://docs.microsoft.com/rest/api/storageservices/list-blobs)

<a href="#byos-extensions" name="byos-extensions">:heavy_check_mark:</a> **YOU MAY** cung cấp một trường `extensions` biểu diễn một mảng các chuỗi chỉ định phần mở rộng file của các blob mong muốn trong thư mục logic.

Một mẫu thiết kế phổ biến khi làm việc với nhiều file là dịch vụ của bạn nhận các request chứa vị trí của các file cần xử lý ("input") và vị trí để đặt các file kết quả sau khi xử lý ("output"). Lưu ý: các thuật ngữ "input" và "output" chỉ là ví dụ; hãy dùng các thuật ngữ phù hợp hơn với miền nghiệp vụ của dịch vụ của bạn.

Ví dụ, body request của một dịch vụ để cấu hình BYOS có thể trông như sau:

```json
{
  "input":{
    "location": "https://mycompany.blob.core.windows.net/documents/english/?<sas token>",
    "delimiter": "/",
    "extensions" : [ ".bmp", ".jpg", ".tif", ".png" ],
    "lastModified": "Wed, 21 Oct 2015 07:28:00 GMT"
  },
  "output":{
    "location": "https://mycompany.blob.core.windows.net/documents/spanish/?<sas token>",
    "delimiter":"/"
  }
}
```

Tùy thuộc vào yêu cầu của dịch vụ, có thể có bất kỳ số lượng phần "input" và "output" nào, kể cả không có phần nào.

<a href="#byos-location-and-delimiter" name="byos-location-and-delimiter">:white_check_mark:</a> **DO** đưa vào một JSON object có các giá trị chuỗi cho "location" và "delimiter". Với "location", khách hàng phải truyền một URL đến blob prefix biểu diễn một thư mục. Với "delimiter", khách hàng phải chỉ định ký tự phân tách mà họ muốn dùng trong URL location; thường là "/" hoặc "\".

<a href="#byos-directory-last-modified" name="byos-directory-last-modified">:heavy_check_mark:</a> **YOU MAY** hỗ trợ trường "lastModified" cho các thư mục input (xem hướng dẫn ở trên).

<a href="#byos-sas-for-input-location" name="byos-sas-for-input-location">:white_check_mark:</a> **DO** hỗ trợ URL "location" với SAS có phạm vi container, có tối thiểu các quyền `listing` và `read` cho các thư mục input.

<a href="#byos-sas-for-output-location" name="byos-sas-for-output-location">:white_check_mark:</a> **DO** hỗ trợ URL "location" với SAS có phạm vi container, có tối thiểu quyền `write` cho các thư mục output.

<a href="#condreq" name="condreq"></a>
### Conditional Request

[HTTP Standard][] định nghĩa các request header mà client có thể dùng để chỉ định một _precondition_
cho việc thực thi một thao tác. Các header này cho phép client triển khai cơ chế caching hiệu quả
và tránh mất dữ liệu khi có các cập nhật đồng thời lên một resource. Các header chỉ định việc thực thi có điều kiện là `If-Match`, `If-None-Match`, `If-Modified-Since`, `If-Unmodified-Since` và `If-Range`.

[HTTP Standard]: https://datatracker.ietf.org/doc/html/rfc9110

<!-- condreq-support-etags-consistently has been subsumed by condreq-support but we retain the anchor to avoid broken links -->
<a href="#condreq-support-etags-consistently" name="condreq-support-etags-consistently"></a>
<!-- condreq-for-read has been subsumed by condreq-support but we retain the anchor to avoid broken links -->
<a href="#condreq-for-read" name="condreq-for-read"></a>
<!-- condreq-no-pessimistic-update has been subsumed by condreq-support but we retain the anchor to avoid broken links -->
<a href="#condreq-no-pessimistic-update" name="condreq-no-pessimistic-update"></a>
<a href="#condreq-support" name="condreq-support">:white_check_mark:</a> **DO** tuân thủ mọi precondition header nhận được trong request của client.

HTTP Standard không cho phép bỏ qua các precondition header, vì làm vậy có thể không an toàn.

<a href="#condreq-unsupported-error" name="condreq-unsupported-error">:white_check_mark:</a> **DO** trả về response lỗi precondition failed phù hợp nếu dịch vụ không thể xác minh tính đúng của precondition.

Lưu ý: Hội đồng xem xét Azure Breaking Changes sẽ cho phép một dịch vụ GA hiện đang bỏ qua các precondition header bắt đầu tuân thủ chúng trong một phiên bản API mới mà không cần thông báo breaking change chính thức. Khả năng gây gián đoạn cho các ứng dụng của khách hàng là thấp và được bù đắp bởi giá trị của việc tuân thủ các chuẩn HTTP.

Mặc dù conditional request có thể được triển khai bằng ngày sửa đổi lần cuối, entity tag ("ETag") được ưu tiên hơn hẳn vì ngày sửa đổi lần cuối không thể phân biệt các cập nhật cách nhau chưa đến một giây.

<a href="#condreq-return-etags" name="condreq-return-etags">:ballot_box_with_check:</a> **YOU SHOULD** trả về một `ETag` với mọi thao tác trả về resource hoặc một phần của resource hoặc mọi cập nhật resource (dù resource có được trả về hay không).

#### Hành vi của Conditional Request

Mục này đưa ra bản tóm tắt về quá trình xử lý cần thực hiện đối với các precondition header.
Xem [mục Conditional Requests của HTTP Standard][Conditional Requests section of the HTTP Standard] để biết chi tiết về cách thức và thời điểm đánh giá các header này.

[Conditional Requests section of the HTTP Standard]: https://datatracker.ietf.org/doc/html/rfc9110#name-conditional-requests

<a href="#condreq-for-read-behavior" name="condreq-for-read-behavior">:white_check_mark:</a> **DO** tuân theo bảng sau để xử lý một request GET có precondition header:

| GET Request | Mã trả về | Response                                    |
|:------------|:------------|:--------------------------------------------|
| Giá trị ETag = giá trị `If-None-Match`   | `304-Not Modified` | không có thông tin bổ sung   |
| Giá trị ETag != giá trị `If-None-Match`  | `200-OK`           | Body response bao gồm giá trị đã serialize của resource (thường là JSON)    |

Để kiểm soát caching tốt hơn, vui lòng tham khảo `cache-control` [HTTP header](https://developer.mozilla.org/docs/Web/HTTP/Headers/Cache-Control).

<a href="#condreq-behavior" name="condreq-behavior">:white_check_mark:</a> **DO** tuân theo bảng sau để xử lý một request PUT, PATCH hoặc DELETE có precondition header:

| Thao tác   | Header        | Giá trị | Kiểm tra ETag | Mã trả về | Response       |
|:------------|:--------------|:------|:-----------|:------------|----------------|
| PATCH / PUT | `If-None-Match` | *     | kiểm tra _bất kỳ_ phiên bản nào của resource ('*' là ký tự đại diện dùng để khớp với mọi thứ), nếu không tìm thấy phiên bản nào, tạo resource. | `200-OK` hoặc </br> `201-Created` </br> | Response header MUST bao gồm giá trị `ETag` mới. Body response SHOULD bao gồm giá trị đã serialize của resource (thường là JSON).  |
| PATCH / PUT | `If-None-Match` | *     | kiểm tra _bất kỳ_ phiên bản nào của resource, nếu tìm thấy một phiên bản, thao tác thất bại |  `412-Precondition Failed` | Body response SHOULD trả về giá trị đã serialize của resource (thường là JSON) đã được truyền kèm theo request.|
| PATCH / PUT | `If-Match` | giá trị của ETag     | giá trị của `If-Match` bằng giá trị ETag mới nhất trên server, xác nhận rằng phiên bản của resource là phiên bản hiện hành nhất | `200-OK` hoặc </br> `201-Created` </br> | Response header MUST bao gồm giá trị `ETag` mới. Body response SHOULD bao gồm giá trị đã serialize của resource (thường là JSON).  |
| PATCH / PUT | `If-Match` | giá trị của ETag     | giá trị của header `If-Match` KHÔNG bằng giá trị ETag mới nhất trên server, cho thấy đã có thay đổi xảy ra sau khi client lấy resource|  `412-Precondition Failed` | Body response SHOULD trả về giá trị đã serialize của resource (thường là JSON) đã được truyền kèm theo request.|
| DELETE      | `If-Match` | giá trị của ETag     | giá trị khớp với giá trị mới nhất trên server | `204-No Content` | Body response SHOULD để trống.  |
| DELETE      | `If-Match` | giá trị của ETag     | giá trị KHÔNG khớp với giá trị mới nhất trên server | `412-Preconditioned Failed` | Body response SHOULD để trống.|

#### Tính toán ETag

Chiến lược bạn dùng để tính `ETag` phụ thuộc vào ngữ nghĩa của nó. Ví dụ, với các resource vốn đã có phiên bản, việc dùng phiên bản làm giá trị của `ETag` là điều tự nhiên. Một chiến lược phổ biến khác để xác định giá trị của `ETag` là dùng hash của resource. Nếu một resource không có phiên bản, và trừ khi việc tính hash quá tốn kém, thì đây là cơ chế được ưu tiên.

<a href="#condreq-etag-is-hash" name="condreq-etag-is-hash">:ballot_box_with_check:</a> **YOU SHOULD** dùng hash của biểu diễn resource thay vì ngày sửa đổi lần cuối/số phiên bản

Mặc dù có thể bị cám dỗ dùng số revision/phiên bản của resource làm ETag, điều này cản trở khả năng thử lại các request cập nhật của client. Nếu client gửi một conditional update request, dịch vụ xử lý request, nhưng client không bao giờ nhận được response, thì một request cập nhật giống hệt sau đó sẽ bị coi là xung đột dù request được thử lại đang cố thực hiện cùng một cập nhật.

<a href="#condreq-etag-hash-entire-resource" name="condreq-etag-hash-entire-resource">:ballot_box_with_check:</a> **YOU SHOULD**, nếu dùng chiến lược hash, hãy hash toàn bộ resource.

<a href="#condreq-strong-etag-for-range-requests" name="condreq-strong-etag-for-range-requests">:ballot_box_with_check:</a> **YOU SHOULD**, nếu hỗ trợ range request, hãy dùng strong ETag để hỗ trợ caching.

<a href="#condreq-timestamp-precision" name="condreq-timestamp-precision">:heavy_check_mark:</a> **YOU MAY** dùng hoặc đưa một timestamp vào schema resource của bạn. Nếu làm vậy, timestamp không nên được trả về với độ chính xác cao hơn mức dưới một giây, và nó SHOULD nhất quán với dữ liệu và định dạng được trả về, ví dụ nhất quán ở mức mili giây.

<a href="#condreq-weak-etags-allowed" name="condreq-weak-etags-allowed">:heavy_check_mark:</a> **YOU MAY** cân nhắc Weak ETag nếu bạn có kịch bản hợp lệ cần phân biệt giữa thay đổi có ý nghĩa và thay đổi mang tính hình thức, hoặc nếu việc tính hash quá tốn kém.

<a href="#condreq-etag-depends-on-encoding" name="condreq-etag-depends-on-encoding">:white_check_mark:</a> **DO**, khi hỗ trợ nhiều biểu diễn (ví dụ Content-Encodings) cho cùng một resource, tạo các giá trị ETag khác nhau cho các biểu diễn khác nhau.

<a href="#substrings" name="substrings"></a>
### Trả về offset & độ dài của chuỗi (Substring)

Mọi giá trị chuỗi trong JSON vốn là Unicode và được mã hóa UTF-8, nhưng các client viết bằng ngôn ngữ lập trình bậc cao phải làm việc với chuỗi theo bảng mã chuỗi của ngôn ngữ đó, có thể là UTF-8, UTF-16 hoặc CodePoints (UTF-32).
Khi response của dịch vụ bao gồm giá trị offset hoặc độ dài của chuỗi, nó nên chỉ định các giá trị này ở cả 3 bảng mã để đơn giản hóa việc phát triển client và đảm bảo thành công cho khách hàng khi tách một chuỗi con.
Xem mục [Returning String Offsets & Lengths] trong Considerations for Service Design để biết thêm chi tiết, bao gồm ví dụ về response JSON chứa các trường offset và độ dài của chuỗi.

[Returning String Offsets & Lengths]: https://github.com/microsoft/api-guidelines/blob/vNext/azure/ConsiderationsForServiceDesign.md#returning-string-offsets--lengths-substrings

<a href="#substrings-return-value-for-each-encoding" name="substrings-return-value-for-each-encoding">:white_check_mark:</a> **DO** đưa cả 3 bảng mã (UTF-8, UTF-16 và CodePoint) cho mọi giá trị offset hoặc độ dài của chuỗi trong response của dịch vụ.

<a href="#substrings-return-value-structure" name="substrings-return-value-structure">:white_check_mark:</a> **DO** định nghĩa mọi giá trị offset hoặc độ dài của chuỗi trong response của dịch vụ là một object có cấu trúc sau:

| Thuộc tính    | Kiểu    | Bắt buộc | Mô tả |
| ----------- | ------- | :------: | ----------- |
| `utf8`      | integer | true     | Offset hoặc độ dài của chuỗi con theo bảng mã UTF-8 |
| `utf16`     | integer | true     | Offset hoặc độ dài của chuỗi con theo bảng mã UTF-16 |
| `codePoint` | integer | true     | Offset hoặc độ dài của chuỗi con theo bảng mã CodePoint |

<a href="#telemetry" name="telemetry"></a>
### Distributed Tracing & Telemetry

Các hướng dẫn client của Azure SDK quy định rằng thư viện client phải gửi dữ liệu telemetry thông qua header `User-Agent`, header `X-MS-UserAgent` và Open Telemetry.
Thư viện client bắt buộc phải gửi thông tin telemetry và distributed tracing trong mọi request. Thông tin telemetry rất quan trọng đối với việc vận hành dịch vụ của bạn một cách hiệu quả và cần được cân nhắc ngay từ đầu trong quá trình thiết kế và triển khai.

<a href="#telemetry-headers" name="telemetry-headers">:white_check_mark:</a> **DO** tuân theo các hướng dẫn client của Azure SDK về việc hỗ trợ telemetry header và Open Telemetry.

<a href="#telemetry-allow-unrecognized-headers" name="telemetry-allow-unrecognized-headers">:no_entry:</a> **DO NOT** từ chối một lời gọi nếu có các custom header mà bạn không hiểu, và cụ thể là các distributed tracing header.

**Tài liệu tham khảo bổ sung**
- [Azure SDK client guidelines](https://azure.github.io/azure-sdk/general_azurecore.html)
- [Azure SDK User-Agent header policy](https://azure.github.io/azure-sdk/general_azurecore.html#azurecore-http-telemetry-x-ms-useragent)
- [Azure SDK Distributed tracing policy](https://azure.github.io/azure-sdk/general_azurecore.html#distributed-tracing-policy)
- [Open Telemetry](https://opentelemetry.io/)

Ngoài distributed tracing, Azure còn dùng một tập các correlation header chung:

|Tên                         |Áp dụng cho|Mô tả|
|-----------------------------|----------|-----------|
|x-ms-client-request-id       |Cả hai      |Tùy chọn. Giá trị do bên gọi chỉ định để định danh request, dưới dạng GUID không có ký tự trang trí như dấu ngoặc nhọn (ví dụ `x-ms-client-request-id: 9C4D50EE-2D56-4CD3-8152-34347DC9F2B0`). Nếu bên gọi cung cấp header này thì dịch vụ **phải** đưa nó vào các mục log của mình để thuận tiện cho việc đối chiếu các mục log của một request đơn lẻ. Vì header này có thể do client tạo ra, bên triển khai dịch vụ không nên giả định nó là duy nhất.
|x-ms-request-id              |Response  |Bắt buộc. Correlation id do dịch vụ tạo ra để định danh request, dưới dạng GUID không có ký tự trang trí như dấu ngoặc nhọn. Trái với `x-ms-client-request-id`, dịch vụ **phải** đảm bảo giá trị này là duy nhất trên toàn cầu. Dịch vụ nên ghi log giá trị này cùng với các trace của mình để thuận tiện cho việc đối chiếu các mục log của một request đơn lẻ.

## Lời kết
Các hướng dẫn này mô tả những cân nhắc thiết kế ban đầu, các khối nền tảng công nghệ và các mẫu thiết kế phổ biến mà các nhóm Azure gặp phải khi xây dựng API cho dịch vụ của mình. Có rất nhiều thông tin trong đó có thể khó theo dõi. May mắn thay, tại Microsoft có một nhóm cam kết đảm bảo thành công của bạn.

Azure REST API Stewardship board là tập hợp các kiến trúc sư tận tâm, đam mê giúp các nhóm dịch vụ Azure xây dựng các giao diện trực quan, dễ bảo trì, nhất quán, và quan trọng nhất là làm hài lòng khách hàng của chúng ta.
Vì API ảnh hưởng đến gần như mọi quyết định ở các khâu tiếp theo, bạn được khuyến khích liên hệ với Stewardship board sớm trong quá trình phát triển.
Các kiến trúc sư này sẽ làm việc cùng bạn để áp dụng các hướng dẫn này và xác định mọi cạm bẫy tiềm ẩn trong thiết kế của bạn. Để biết thêm thông tin về cách làm việc với Stewardship board, vui lòng tham khảo [Considerations for Service Design](./ConsiderationsForServiceDesign.md).
