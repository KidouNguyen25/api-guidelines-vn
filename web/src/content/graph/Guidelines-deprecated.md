
> # THÔNG BÁO NGỪNG HỖ TRỢ DÀNH CHO ĐỘC GIẢ
>
> Tài liệu này đang bị ngừng hỗ trợ và được hợp nhất với [Hướng dẫn REST API của Microsoft Graph](GuidelinesGraph.md), với ngày gỡ bỏ là 1 tháng 7 năm 2024. Vui lòng tham khảo các ghi chú bên dưới để biết hướng dẫn mới nhất.
>
> ## **Hướng dẫn cho các nhóm dịch vụ Microsoft Graph**
>
> Các nhóm dịch vụ Graph nên tham chiếu tài liệu đi kèm, [Hướng dẫn REST API của Microsoft Graph](GuidelinesGraph.md), khi xây dựng hoặc chỉnh sửa dịch vụ của mình. Tài liệu này cùng với danh mục mẫu thiết kế liên quan cung cấp một bộ hướng dẫn được tinh chỉnh, nhắm riêng đến các dịch vụ Microsoft Graph.
>
---
# Hướng dẫn REST API của Microsoft

Đây là hướng dẫn thiết kế REST API nội bộ, áp dụng trên toàn công ty của Microsoft.
Các nhóm tại Microsoft thường tham chiếu tài liệu này khi đặt ra chính sách thiết kế API.
Họ cũng có thể tạo thêm các tài liệu riêng cho nhóm của mình, bổ sung hướng dẫn hoặc điều chỉnh cho phù hợp với hoàn cảnh cụ thể.

## Nhóm làm việc về Hướng dẫn REST API của Microsoft

Name | Name | Name |
---------------------------- | -------------------------------------- | ----------------------------------------
Dave Campbell (CTO C+E)      | Rick Rashid (CTO ASG)                  | John Shewchuk (Technical Fellow, TED HQ)
Mark Russinovich (CTO Azure) | Steve Lucco (Technical Fellow, DevDiv) | Murali Krishnaprasad (Azure App Plat)
Rob Howard (ASG)             | Peter Torr  (OSG)                      | Chris Mullins (ASG)

<div style="font-size:150%">
Biên tập tài liệu: John Gossman (C+E), Chris Mullins (ASG), Gareth Jones (ASG), Rob Dolin (C+E), Mark Stafford (C+E)<br/>
</div>

# Hướng dẫn REST API của Microsoft

## 1. Tóm tắt
Hướng dẫn REST API của Microsoft, như một nguyên tắc thiết kế, khuyến khích các nhà phát triển ứng dụng cung cấp resource cho họ thông qua giao diện HTTP theo kiểu RESTful.
Để mang lại trải nghiệm suôn sẻ nhất có thể cho nhà phát triển trên các nền tảng tuân theo Hướng dẫn REST API của Microsoft, các REST API SHOULD tuân theo các hướng dẫn thiết kế nhất quán để việc sử dụng chúng trở nên dễ dàng và trực quan.

Tài liệu này thiết lập các hướng dẫn mà các REST API của Microsoft SHOULD tuân theo để các giao diện RESTful được phát triển một cách nhất quán.

## 2. Mục lục
<!-- TOC depthFrom:2 depthTo:4 orderedList:false updateOnSave:false withLinks:true -->

- [Hướng dẫn REST API của Microsoft](#microsoft-rest-api-guidelines)
  - [Nhóm làm việc về Hướng dẫn REST API của Microsoft](#microsoft-rest-api-guidelines-working-group)
- [Hướng dẫn REST API của Microsoft](#microsoft-rest-api-guidelines-1)
  - [1. Tóm tắt](#1-abstract)
  - [2. Mục lục](#2-table-of-contents)
  - [3. Giới thiệu](#3-introduction)
    - [3.1. Tài liệu nên đọc](#31-recommended-reading)
  - [4. Diễn giải các hướng dẫn](#4-interpreting-the-guidelines)
    - [4.1. Phạm vi áp dụng của các hướng dẫn](#41-application-of-the-guidelines)
    - [4.2. Hướng dẫn cho các dịch vụ hiện có và việc đánh phiên bản dịch vụ](#42-guidelines-for-existing-services-and-versioning-of-services)
    - [4.3. Ngôn ngữ yêu cầu](#43-requirements-language)
    - [4.4. Giấy phép](#44-license)
  - [5. Phân loại](#5-taxonomy)
    - [5.1. Lỗi](#51-errors)
    - [5.2. Sự cố](#52-faults)
    - [5.3. Độ trễ](#53-latency)
    - [5.4. Thời gian hoàn thành](#54-time-to-complete)
    - [5.5. Sự cố của API chạy lâu](#55-long-running-api-faults)
  - [6. Hướng dẫn cho client](#6-client-guidance)
    - [6.1. Quy tắc bỏ qua](#61-ignore-rule)
    - [6.2. Quy tắc thứ tự biến đổi](#62-variable-order-rule)
    - [6.3. Quy tắc lỗi thầm lặng](#63-silent-fail-rule)
  - [7. Các nguyên tắc cơ bản về tính nhất quán](#7-consistency-fundamentals)
    - [7.1. Cấu trúc URL](#71-url-structure)
    - [7.2. Độ dài URL](#72-url-length)
    - [7.3. Định danh chuẩn](#73-canonical-identifier)
    - [7.4. Các phương thức được hỗ trợ](#74-supported-methods)
      - [7.4.1. POST](#741-post)
      - [7.4.2. PATCH](#742-patch)
      - [7.4.3. Tạo resource thông qua PATCH (ngữ nghĩa UPSERT)](#743-creating-resources-via-patch-upsert-semantics)
      - [7.4.4. Options và link header](#744-options-and-link-headers)
    - [7.5. Request header chuẩn](#75-standard-request-headers)
    - [7.6. Response header chuẩn](#76-standard-response-headers)
    - [7.7. Header tùy chỉnh](#77-custom-headers)
    - [7.8. Chỉ định header dưới dạng tham số query](#78-specifying-headers-as-query-parameters)
    - [7.9. Tham số PII](#79-pii-parameters)
    - [7.10. Định dạng response](#710-response-formats)
      - [7.10.1. Định dạng response do client chỉ định](#7101-clients-specified-response-format)
      - [7.10.2. Response cho các tình huống lỗi](#7102-error-condition-responses)
        - [ErrorResponse : Object](#errorresponse--object)
        - [Error : Object](#error--object)
        - [InnerError : Object](#innererror--object)
        - [Ví dụ](#examples)
    - [7.11. HTTP Status Code](#711-http-status-codes)
    - [7.12. Thư viện client là tùy chọn](#712-client-library-optional)
  - [8. CORS](#8-cors)
    - [8.1. Hướng dẫn cho client](#81-client-guidance)
      - [8.1.1. Tránh preflight](#811-avoiding-preflight)
    - [8.2. Hướng dẫn cho dịch vụ](#82-service-guidance)
  - [9. Collection](#9-collections)
    - [9.1. Khóa của mục](#91-item-keys)
    - [9.2. Tuần tự hóa](#92-serialization)
    - [9.3. Mẫu URL của collection](#93-collection-url-patterns)
      - [9.3.1. Collection và thuộc tính lồng nhau](#931-nested-collections-and-properties)
    - [9.4. Collection lớn](#94-big-collections)
    - [9.5. Collection thay đổi](#95-changing-collections)
    - [9.6. Sắp xếp collection](#96-sorting-collections)
      - [9.6.1. Diễn giải biểu thức sắp xếp](#961-interpreting-a-sorting-expression)
    - [9.7. Lọc](#97-filtering)
      - [9.7.1. Các phép toán lọc](#971-filter-operations)
      - [9.7.2. Ví dụ về toán tử](#972-operator-examples)
      - [9.7.3. Độ ưu tiên của toán tử](#973-operator-precedence)
    - [9.8. Phân trang](#98-pagination)
      - [9.8.1. Phân trang do server điều khiển](#981-server-driven-paging)
      - [9.8.2. Phân trang do client điều khiển](#982-client-driven-paging)
      - [9.8.3. Các cân nhắc bổ sung](#983-additional-considerations)
    - [9.9. Các thao tác collection phức hợp](#99-compound-collection-operations)
    - [9.10. Kết quả rỗng](#910-empty-results)
  - [10. Delta query](#10-delta-queries)
    - [10.1. Delta link](#101-delta-links)
    - [10.2. Biểu diễn entity](#102-entity-representation)
    - [10.3. Lấy delta link](#103-obtaining-a-delta-link)
    - [10.4. Nội dung của response delta link](#104-contents-of-a-delta-link-response)
    - [10.5. Sử dụng delta link](#105-using-a-delta-link)
  - [11. Chuẩn hóa JSON](#11-json-standardizations)
    - [11.1. Chuẩn hóa định dạng JSON cho các kiểu nguyên thủy](#111-json-formatting-standardization-for-primitive-types)
    - [11.2. Hướng dẫn về ngày và giờ](#112-guidelines-for-dates-and-times)
      - [11.2.1. Tạo ra giá trị ngày](#1121-producing-dates)
      - [11.2.2. Tiếp nhận giá trị ngày](#1122-consuming-dates)
      - [11.2.3. Tính tương thích](#1123-compatibility)
    - [11.3. Tuần tự hóa JSON cho ngày và giờ](#113-json-serialization-of-dates-and-times)
      - [11.3.1. Định dạng `DateLiteral`](#1131-the-dateliteral-format)
      - [11.3.2. Bình luận về định dạng ngày](#1132-commentary-on-date-formatting)
    - [11.4. Khoảng thời lượng (Duration)](#114-durations)
    - [11.5. Khoảng thời gian (Interval)](#115-intervals)
    - [11.6. Khoảng thời gian lặp lại](#116-repeating-intervals)
  - [12. Đánh phiên bản](#12-versioning)
    - [12.1. Các định dạng phiên bản](#121-versioning-formats)
      - [12.1.1. Phiên bản theo nhóm](#1211-group-versioning)
        - [Ví dụ về phiên bản theo nhóm](#examples-of-group-versioning)
    - [12.2. Khi nào cần đánh phiên bản](#122-when-to-version)
    - [12.3. Định nghĩa thay đổi gây phá vỡ tương thích (breaking change)](#123-definition-of-a-breaking-change)
  - [13. Thao tác chạy lâu](#13-long-running-operations)
    - [13.1. Thao tác chạy lâu dựa trên resource (RELO)](#131-resource-based-long-running-operations-relo)
    - [13.2. Thao tác chạy lâu theo từng bước](#132-stepwise-long-running-operations)
      - [13.2.1. PUT](#1321-put)
      - [13.2.2. POST](#1322-post)
      - [13.2.3. POST, mô hình kết hợp](#1323-post-hybrid-model)
      - [13.2.4. Resource Operations](#1324-operations-resource)
      - [13.2.5. Resource Operation](#1325-operation-resource)
        - [Phần trăm hoàn thành](#percent-complete)
        - [Vị trí của resource đích](#target-resource-location)
      - [13.2.6. Operation tombstone](#1326-operation-tombstones)
      - [13.2.7. Luồng điển hình, polling](#1327-the-typical-flow-polling)
        - [Ví dụ về luồng điển hình, polling](#example-of-the-typical-flow-polling)
      - [13.2.8. Luồng điển hình, push notification](#1328-the-typical-flow-push-notifications)
        - [Ví dụ về luồng điển hình, push notification với subscription hiện có](#example-of-the-typical-flow-push-notifications-existing-subscription)
      - [13.2.9. Retry-After](#1329-retry-after)
    - [13.3. Chính sách lưu giữ kết quả của thao tác](#133-retention-policy-for-operation-results)
  - [14. Throttling, hạn ngạch và giới hạn](#14-throttling-quotas-and-limits)
    - [14.1. Nguyên tắc](#141-principles)
    - [14.2. Mã trả về (429 so với 503)](#142-return-codes-429-vs-503)
    - [14.3. Retry-After và RateLimit Header](#143-retry-after-and-ratelimit-headers)
    - [14.4. Hướng dẫn cho dịch vụ](#144-service-guidance)
      - [14.4.1. Khả năng phản hồi](#1441-responsiveness)
      - [14.4.2. Giới hạn tốc độ và hạn ngạch](#1442-rate-limits-and-quotas)
      - [14.4.3. Dịch vụ quá tải](#1443-overloaded-services)
      - [14.4.4. Response mẫu](#1444-example-response)
    - [14.5. Hướng dẫn cho bên gọi](#145-caller-guidance)
    - [14.6. Xử lý các bên gọi bỏ qua Retry-After header](#146-handling-callers-that-ignore-retry-after-headers)
  - [15. Push notification qua webhook](#15-push-notifications-via-webhooks)
    - [15.1. Phạm vi](#151-scope)
    - [15.2. Nguyên tắc](#152-principles)
    - [15.3. Các loại subscription](#153-types-of-subscriptions)
    - [15.4. Chuỗi lời gọi](#154-call-sequences)
    - [15.5. Xác minh subscription](#155-verifying-subscriptions)
    - [15.6. Nhận notification](#156-receiving-notifications)
      - [15.6.1. Payload của notification](#1561-notification-payload)
    - [15.7. Quản lý subscription bằng lập trình](#157-managing-subscriptions-programmatically)
      - [15.7.1. Tạo subscription](#1571-creating-subscriptions)
      - [15.7.2. Cập nhật subscription](#1572-updating-subscriptions)
      - [15.7.3. Xóa subscription](#1573-deleting-subscriptions)
      - [15.7.4. Liệt kê subscription](#1574-enumerating-subscriptions)
    - [15.8. Bảo mật](#158-security)
  - [16. Request không được hỗ trợ](#16-unsupported-requests)
    - [16.1. Hướng dẫn thiết yếu](#161-essential-guidance)
    - [16.2. Danh sách cho phép tính năng](#162-feature-allow-list)
      - [16.2.1. Response lỗi](#1621-error-response)
  - [17. Hướng dẫn đặt tên](#17-naming-guidelines)
    - [17.1. Cách tiếp cận](#171-approach)
    - [17.2. Kiểu chữ hoa/thường](#172-casing)
    - [17.3. Các tên cần tránh](#173-names-to-avoid)
    - [17.4. Hình thành tên ghép](#174-forming-compound-names)
    - [17.5. Thuộc tính định danh](#175-identity-properties)
    - [17.6. Thuộc tính ngày và giờ](#176-date-and-time-properties)
    - [17.7. Thuộc tính tên](#177-name-properties)
    - [17.8. Collection và số lượng](#178-collections-and-counts)
    - [17.9. Tên thuộc tính thông dụng](#179-common-property-names)
  - [18. Phụ lục](#18-appendix)
    - [18.1. Ghi chú về sơ đồ tuần tự](#181-sequence-diagram-notes)
      - [18.1.1. Push notification, luồng theo từng người dùng](#1811-push-notifications-per-user-flow)
      - [18.1.2. Push notification, luồng firehose](#1812-push-notifications-firehose-flow)

<!-- /TOC -->

## 3. Giới thiệu
Các nhà phát triển truy cập hầu hết resource của Microsoft Cloud Platform thông qua các giao diện HTTP.
Mặc dù mỗi dịch vụ thường cung cấp các framework theo từng ngôn ngữ để bao bọc API của mình, mọi thao tác của chúng rốt cuộc đều quy về các HTTP request.
Microsoft phải hỗ trợ nhiều loại client và dịch vụ, và không thể trông cậy vào việc có sẵn các framework phong phú cho mọi môi trường phát triển.
Do đó, một mục tiêu của các hướng dẫn này là bảo đảm các REST API của Microsoft có thể được bất kỳ client nào có hỗ trợ HTTP cơ bản sử dụng một cách dễ dàng và nhất quán.

Để mang lại trải nghiệm suôn sẻ nhất có thể cho nhà phát triển, điều quan trọng là các API này tuân theo các hướng dẫn thiết kế nhất quán, nhờ đó việc sử dụng chúng trở nên dễ dàng và trực quan.
Tài liệu này thiết lập các hướng dẫn mà các nhà phát triển REST API của Microsoft cần tuân theo để phát triển các API như vậy một cách nhất quán.

Lợi ích của tính nhất quán cũng được tích lũy trên tổng thể; tính nhất quán cho phép các nhóm tận dụng chung mã nguồn, mẫu thiết kế, tài liệu và các quyết định thiết kế.

Các hướng dẫn này nhằm đạt được những mục tiêu sau:
- Định nghĩa các thực hành và mẫu thiết kế nhất quán cho mọi endpoint API trên toàn Microsoft.
- Bám sát nhất có thể các thực hành tốt nhất về REST/HTTP đã được chấp nhận rộng rãi trong ngành. [\*]
- Giúp việc truy cập các dịch vụ của Microsoft qua giao diện REST trở nên dễ dàng với mọi nhà phát triển ứng dụng.
- Cho phép các nhà phát triển dịch vụ tận dụng công sức trước đó của các dịch vụ khác để triển khai, kiểm thử và viết tài liệu cho các endpoint REST được định nghĩa một cách nhất quán.
- Cho phép các đối tác (ví dụ: các tổ chức không thuộc Microsoft) sử dụng các hướng dẫn này cho việc thiết kế endpoint REST của riêng họ.

[\*] Lưu ý: Các hướng dẫn được thiết kế để phù hợp với việc xây dựng các dịch vụ tuân thủ phong cách kiến trúc REST, mặc dù chúng không đề cập đến hoặc yêu cầu việc xây dựng các dịch vụ tuân theo các ràng buộc của REST.
Thuật ngữ "REST" được dùng xuyên suốt tài liệu này để chỉ các dịch vụ theo tinh thần của REST chứ không phải tuân thủ REST một cách nguyên tắc từng chữ.*

### 3.1. Tài liệu nên đọc
Việc hiểu triết lý đằng sau Phong cách Kiến trúc REST được khuyến nghị để phát triển các dịch vụ dựa trên HTTP tốt.
Nếu bạn mới làm quen với thiết kế RESTful, sau đây là một số tài nguyên hữu ích:

[REST trên Wikipedia][rest-on-wikipedia] -- Tổng quan về các định nghĩa phổ biến và các ý tưởng cốt lõi đằng sau REST.

[Luận án về REST][fielding] -- Chương về REST trong luận án của Roy Fielding về Kiến trúc Mạng, "Architectural Styles and the Design of Network-based Software Architectures"

[RFC 7231][rfc-7231] -- Định nghĩa đặc tả cho ngữ nghĩa của HTTP/1.1, và được xem là tài liệu tham chiếu có thẩm quyền.

[REST in Practice][rest-in-practice] -- Sách về những nguyên tắc cơ bản của REST.

## 4. Diễn giải các hướng dẫn
### 4.1. Phạm vi áp dụng của các hướng dẫn
Các hướng dẫn này áp dụng cho mọi REST API do Microsoft hoặc bất kỳ dịch vụ đối tác nào công khai.
Các API riêng tư hoặc nội bộ cũng SHOULD cố gắng tuân theo các hướng dẫn này vì các dịch vụ nội bộ thường sẽ được công khai vào một thời điểm nào đó.
 Tính nhất quán có giá trị không chỉ với khách hàng bên ngoài mà còn với các bên sử dụng dịch vụ nội bộ, và các hướng dẫn này đưa ra những thực hành tốt nhất hữu ích cho mọi dịch vụ.

Có những lý do chính đáng để được miễn trừ khỏi các hướng dẫn này.
Hiển nhiên, một dịch vụ REST triển khai hoặc phải tương tác với một REST API do bên ngoài định nghĩa thì phải tương thích với API đó chứ không nhất thiết phải tương thích với các hướng dẫn này.
Một số dịch vụ MAY cũng có nhu cầu đặc biệt về hiệu năng đòi hỏi một định dạng khác, chẳng hạn như giao thức nhị phân.

### 4.2. Hướng dẫn cho các dịch vụ hiện có và việc đánh phiên bản dịch vụ
Chúng tôi không khuyến nghị thực hiện thay đổi gây phá vỡ tương thích (breaking change) đối với một dịch vụ có trước các hướng dẫn này chỉ vì mục đích tuân thủ.
Dịch vụ SHOULD cố gắng trở nên tuân thủ ở lần phát hành phiên bản kế tiếp, khi tính tương thích vốn dĩ đã bị phá vỡ.
Khi một dịch vụ thêm một API mới, API đó SHOULD nhất quán với các API khác cùng phiên bản.
Vì vậy, nếu một dịch vụ được viết theo phiên bản 1.0 của các hướng dẫn, thì các API mới được bổ sung dần vào dịch vụ cũng SHOULD tuân theo phiên bản 1.0. Sau đó dịch vụ có thể nâng cấp để căn chỉnh với phiên bản mới nhất của các hướng dẫn ở bản phát hành chính kế tiếp của dịch vụ.

### 4.3. Ngôn ngữ yêu cầu
Các từ khóa "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "MAY", và "OPTIONAL" trong tài liệu này được diễn giải theo mô tả trong [RFC 2119][rfc-2119].

### 4.4. Giấy phép

Tác phẩm này được cấp phép theo Giấy phép Creative Commons Ghi công 4.0 Quốc tế.
Để xem bản sao của giấy phép này, hãy truy cập https://creativecommons.org/licenses/by/4.0/ hoặc gửi thư tới Creative Commons, PO Box 1866, Mountain View, CA 94042, USA.

## 5. Phân loại
Khi bắt đầu áp dụng Hướng dẫn REST API của Microsoft, các dịch vụ MUST tuân thủ cách phân loại được định nghĩa dưới đây.

### 5.1. Lỗi
Lỗi, hay cụ thể hơn là Lỗi dịch vụ (Service Errors), được định nghĩa là trường hợp client truyền dữ liệu không hợp lệ cho dịch vụ và dịch vụ _đã từ chối_ dữ liệu đó một cách chính xác.
Ví dụ bao gồm thông tin xác thực không hợp lệ, tham số không đúng, ID phiên bản không xác định, hoặc tương tự.
Đây thường là các mã lỗi HTTP "4xx" và là kết quả của việc client truyền dữ liệu sai hoặc không hợp lệ.

Lỗi _không_ ảnh hưởng đến tính khả dụng tổng thể của API.

### 5.2. Sự cố
Sự cố, hay cụ thể hơn là Sự cố dịch vụ (Service Faults), được định nghĩa là trường hợp dịch vụ không trả về được kết quả đúng cho một request hợp lệ của client.
Đây thường là các mã lỗi HTTP "5xx".

Sự cố _có_ ảnh hưởng đến tính khả dụng tổng thể của API.

Các lời gọi thất bại do giới hạn tốc độ hoặc vượt hạn ngạch MUST NOT bị tính là sự cố.
Các lời gọi thất bại do dịch vụ từ chối nhanh request (thường để tự bảo vệ) thì vẫn được tính là sự cố.

### 5.3. Độ trễ
Độ trễ được định nghĩa là khoảng thời gian một lời gọi API cụ thể cần để hoàn tất, được đo càng gần client càng tốt.
Chỉ số này áp dụng cho cả API đồng bộ và bất đồng bộ theo cùng một cách.
Với các lời gọi chạy lâu, độ trễ được đo trên request ban đầu và cho biết lời gọi đó (chứ không phải toàn bộ thao tác) mất bao lâu để hoàn tất.

### 5.4. Thời gian hoàn thành
Các dịch vụ cung cấp các thao tác dài MUST theo dõi các chỉ số "Time to Complete" (Thời gian hoàn thành) cho các thao tác đó.

### 5.5. Sự cố của API chạy lâu
Với một API chạy lâu (Long Running API), có thể xảy ra trường hợp cả request ban đầu bắt đầu thao tác lẫn request truy xuất kết quả đều hoạt động về mặt kỹ thuật (mỗi request trả về 200) nhưng thao tác nền bên dưới lại đã thất bại.
Các sự cố của thao tác chạy lâu MUST được tổng hợp thành sự cố trong các chỉ số Availability (Tính khả dụng) tổng thể.

## 6. Hướng dẫn cho client
Để mang lại trải nghiệm tốt nhất có thể cho các client giao tiếp với một dịch vụ REST, client SHOULD tuân theo các thực hành tốt nhất sau:

### 6.1. Quy tắc bỏ qua
Đối với các client liên kết lỏng lẻo, nơi hình dạng chính xác của dữ liệu không được biết trước khi gọi, nếu server trả về thứ mà client không mong đợi, client MUST bỏ qua nó một cách an toàn.

Một số dịch vụ MAY thêm các trường vào response mà không thay đổi số phiên bản.
Các dịch vụ làm như vậy MUST nêu rõ điều này trong tài liệu của mình và client MUST bỏ qua các trường không xác định.

### 6.2. Quy tắc thứ tự biến đổi
Client MUST NOT dựa vào thứ tự xuất hiện của dữ liệu trong các JSON response của dịch vụ.
Ví dụ, client SHOULD có khả năng chịu được việc sắp xếp lại thứ tự các trường trong một đối tượng JSON.
Khi dịch vụ hỗ trợ, client MAY yêu cầu dữ liệu được trả về theo một thứ tự cụ thể.
Ví dụ, các dịch vụ MAY hỗ trợ việc dùng tham số querystring _$orderBy_ để chỉ định thứ tự của các phần tử trong một mảng JSON.
Các dịch vụ cũng MAY chỉ định rõ ràng thứ tự của một số phần tử như một phần của hợp đồng dịch vụ.
Ví dụ, một dịch vụ MAY luôn trả về thông tin "type" của một đối tượng JSON làm trường đầu tiên trong đối tượng để đơn giản hóa việc phân tích response ở phía client.
Client MAY dựa vào hành vi sắp xếp thứ tự đã được dịch vụ xác định rõ ràng.

### 6.3. Quy tắc lỗi thầm lặng
Các client yêu cầu chức năng OPTIONAL của server (chẳng hạn các header tùy chọn) MUST có khả năng chịu được việc server bỏ qua chức năng cụ thể đó.

## 7. Các nguyên tắc cơ bản về tính nhất quán
### 7.1. Cấu trúc URL
Con người SHOULD có thể dễ dàng đọc và dựng URL.

Điều này tạo thuận lợi cho việc khám phá và giúp việc áp dụng dễ dàng hơn trên các nền tảng không có thư viện client được hỗ trợ tốt.

Một ví dụ về URL có cấu trúc tốt là:

```
https://api.contoso.com/v1.0/people/jdoe@contoso.com/inbox
```

Một ví dụ về URL không thân thiện là:

```
https://api.contoso.com/EWS/OData/Users('jdoe@microsoft.com')/Folders('AAMkADdiYzI1MjUzLTk4MjQtNDQ1Yy05YjJkLWNlMzMzYmIzNTY0MwAuAAAAAACzMsPHYH6HQoSwfdpDx-2bAQCXhUk6PC1dS7AERFluCgBfAAABo58UAAA=')
```

Một mẫu thường gặp là việc dùng URL làm giá trị.
Các dịch vụ MAY dùng URL làm giá trị.
Ví dụ, trường hợp sau là chấp nhận được:

```
https://api.contoso.com/v1.0/items?url=https://resources.contoso.com/shoes/fancy
```

### 7.2. Độ dài URL
Định dạng thông điệp HTTP 1.1, được định nghĩa trong RFC 7230, tại mục [3.1.1][rfc-7230-3-1-1], không định nghĩa giới hạn độ dài cho Request Line, vốn bao gồm URL đích.
Trích từ RFC:

> HTTP does not place a predefined limit on the length of a
   request-line. [...] A server that receives a request-target longer than any URI it wishes to parse MUST respond
   with a 414 (URI Too Long) status code.

Các dịch vụ có thể tạo ra URL dài hơn 2.083 ký tự MUST có biện pháp thích ứng cho các client mà họ muốn hỗ trợ.
Sau đây là một số nguồn để xác định các client đích hỗ trợ những gì:

 * [https://stackoverflow.com/a/417184](https://stackoverflow.com/a/417184)
 * [https://blogs.msdn.microsoft.com/ieinternals/2014/08/13/url-length-limits/](https://blogs.msdn.microsoft.com/ieinternals/2014/08/13/url-length-limits/)

Cũng lưu ý rằng một số technology stack có giới hạn URL cứng nhưng có thể điều chỉnh, vì vậy hãy ghi nhớ điều này khi bạn thiết kế dịch vụ của mình.

### 7.3. Định danh chuẩn
Bên cạnh các URL thân thiện, các resource có thể bị di chuyển hoặc đổi tên SHOULD cung cấp một URL chứa định danh ổn định và duy nhất.
Bạn MAY cần tương tác với dịch vụ để lấy URL ổn định từ tên thân thiện của resource, như trong trường hợp lối tắt "/my" được một số dịch vụ sử dụng.

Định danh ổn định không bắt buộc phải là GUID.

Một ví dụ về URL chứa định danh chuẩn là:

```
https://api.contoso.com/v1.0/people/7011042402/inbox
```

### 7.4. Các phương thức được hỗ trợ
Các thao tác MUST dùng đúng các phương thức HTTP bất cứ khi nào có thể, và tính idempotent của thao tác MUST được tôn trọng.
Các phương thức HTTP thường được gọi là các HTTP verb.
Hai thuật ngữ này đồng nghĩa trong ngữ cảnh này, tuy nhiên đặc tả HTTP dùng thuật ngữ method (phương thức).

Dưới đây là danh sách các phương thức mà các dịch vụ REST của Microsoft SHOULD hỗ trợ.
Không phải resource nào cũng hỗ trợ mọi phương thức, nhưng mọi resource sử dụng các phương thức dưới đây MUST tuân thủ cách dùng của chúng.

Method  | Description                                                                                                                | Is Idempotent
------- | -------------------------------------------------------------------------------------------------------------------------- | -------------
GET     | Trả về giá trị hiện tại của một đối tượng                                                                                  | True
PUT     | Thay thế một đối tượng, hoặc tạo một đối tượng có tên, khi áp dụng được                                                    | True
DELETE  | Xóa một đối tượng                                                                                                          | True
POST    | Tạo một đối tượng mới dựa trên dữ liệu được cung cấp, hoặc gửi một lệnh                                                    | False
HEAD    | Trả về metadata của một đối tượng cho một GET response. Các resource hỗ trợ phương thức GET MAY cũng hỗ trợ phương thức HEAD | True
PATCH   | Áp dụng một bản cập nhật một phần cho một đối tượng                                                                        | False
OPTIONS | Lấy thông tin về một request; xem chi tiết bên dưới.                                                                       | True

<small>Bảng 1</small>

#### 7.4.1. POST
Các thao tác POST SHOULD hỗ trợ Location response header để chỉ định vị trí của bất kỳ resource nào được tạo mà không được đặt tên tường minh, thông qua Location header.

Ví dụ, hãy hình dung một dịch vụ cho phép tạo các server được lưu trữ, với tên do dịch vụ đặt:

```http
POST http://api.contoso.com/account1/servers
```

Response sẽ giống như sau:

```http
201 Created
Location: http://api.contoso.com/account1/servers/server321
```

Trong đó "server321" là tên server do dịch vụ cấp phát.

Các dịch vụ MAY cũng trả về đầy đủ metadata của mục được tạo trong response.

#### 7.4.2. PATCH
PATCH đã được IETF chuẩn hóa làm phương thức dùng để cập nhật tăng dần một đối tượng hiện có (xem [RFC 5789][rfc-5789]).
Các API tuân thủ Hướng dẫn REST API của Microsoft SHOULD hỗ trợ PATCH.

#### 7.4.3. Tạo resource thông qua PATCH (ngữ nghĩa UPSERT)
Các dịch vụ cho phép bên gọi chỉ định giá trị khóa khi tạo SHOULD hỗ trợ ngữ nghĩa UPSERT, và những dịch vụ làm vậy MUST hỗ trợ tạo resource bằng PATCH.
Vì PUT được định nghĩa là thay thế hoàn toàn nội dung, nên việc client dùng PUT để sửa đổi dữ liệu là nguy hiểm.
Các client không hiểu (và do đó bỏ qua) các thuộc tính trên một resource thì khó có khả năng cung cấp chúng trong một PUT khi cố cập nhật resource, vì vậy các thuộc tính đó có thể bị xóa mất một cách vô ý.
Các dịch vụ MAY tùy chọn hỗ trợ PUT để cập nhật các resource hiện có, nhưng nếu làm vậy thì MUST dùng ngữ nghĩa thay thế (nghĩa là, sau PUT, các thuộc tính của resource MUST khớp với những gì được cung cấp trong request, bao gồm cả việc xóa mọi thuộc tính phía server không được cung cấp).

Theo ngữ nghĩa UPSERT, một lời gọi PATCH tới resource không tồn tại sẽ được server xử lý như một thao tác "create" (tạo), còn một lời gọi PATCH tới resource đã tồn tại được xử lý như một thao tác "update" (cập nhật). Để bảo đảm một request cập nhật không bị coi là tạo mới hoặc ngược lại, client MAY chỉ định các HTTP header điều kiện tiên quyết (precondition) trong request.
Dịch vụ MUST NOT coi một PATCH request là thao tác chèn nếu nó chứa If-Match header và MUST NOT coi một PATCH request là thao tác cập nhật nếu nó chứa If-None-Match header có giá trị "*".

Nếu một dịch vụ không hỗ trợ UPSERT, thì một lời gọi PATCH tới resource không tồn tại MUST dẫn đến lỗi HTTP "409 Conflict".

#### 7.4.4. Options và link header
OPTIONS cho phép client truy xuất thông tin về một resource, tối thiểu bằng cách trả về Allow header cho biết các phương thức hợp lệ đối với resource này.

Ngoài ra, các dịch vụ SHOULD bao gồm một Link header (xem [RFC 5988][rfc-5988]) trỏ tới tài liệu của resource đang xét:

```http
Link: <{help}>; rel="help"
```

Trong đó {help} là URL tới một resource tài liệu.

Để xem các ví dụ về cách dùng OPTIONS, xem [preflight các lời gọi CORS cross-domain][cors-preflight].

### 7.5. Request header chuẩn
Bảng request header dưới đây SHOULD được các dịch vụ tuân thủ Hướng dẫn REST API của Microsoft sử dụng.
Việc dùng các header này không bắt buộc, nhưng nếu đã dùng thì MUST được dùng một cách nhất quán.

Mọi giá trị header MUST tuân theo các quy tắc cú pháp được nêu trong đặc tả nơi trường header đó được định nghĩa.
Nhiều HTTP header được định nghĩa trong [RFC7231][rfc-7231], tuy nhiên có thể tìm thấy danh sách đầy đủ các header đã được phê duyệt trong [IANA Header Registry][IANA-headers]."

Header                            | Type                                  | Description
--------------------------------- | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
Authorization                     | String                                           | Authorization header của request
Date                              | Date                                             | Dấu thời gian của request, dựa trên đồng hồ của client, theo định dạng ngày và giờ [RFC 5322][rfc-5322-3-3].  Server SHOULD NOT đưa ra bất kỳ giả định nào về độ chính xác của đồng hồ client.  Header này MAY được đưa vào request, nhưng MUST theo định dạng này khi được cung cấp.  Giờ Greenwich (GMT) MUST được dùng làm múi giờ tham chiếu cho header này khi nó được cung cấp.  Ví dụ: `Wed, 24 Aug 2016 18:41:30 GMT`.  Lưu ý rằng GMT hoàn toàn bằng UTC (Giờ Phối hợp Quốc tế) trong ngữ cảnh này.
Accept                            | Content type                                     | Content type được yêu cầu cho response, chẳng hạn: <ul><li>application/xml</li><li>text/xml</li><li>application/json</li><li>text/javascript (for JSONP)</li></ul>Theo các hướng dẫn HTTP, đây chỉ là một gợi ý và response MAY có content type khác, chẳng hạn khi tải một blob mà response thành công chỉ là luồng blob làm payload. Đối với các dịch vụ tuân theo OData, SHOULD tuân theo thứ tự ưu tiên được chỉ định trong OData.
Accept-Encoding                   | Gzip, deflate                                    | Các REST endpoint SHOULD hỗ trợ mã hóa GZIP và DEFLATE, khi áp dụng được. Với các resource rất lớn, dịch vụ MAY bỏ qua và trả về dữ liệu không nén.
Accept-Language                   | "en", "es", etc.                                 | Chỉ định ngôn ngữ ưu tiên cho response. Các dịch vụ không bắt buộc phải hỗ trợ, nhưng nếu một dịch vụ hỗ trợ bản địa hóa thì MUST thực hiện thông qua Accept-Language header.
Accept-Charset                    | Charset type like "UTF-8"                        | Mặc định là UTF-8, nhưng các dịch vụ SHOULD có khả năng xử lý ISO-8859-1.
Content-Type                      | Content type                                     | Mime type của request body (PUT/POST/PATCH)
Prefer                            | return=minimal, return=representation            | Nếu preference return=minimal được chỉ định, các dịch vụ SHOULD trả về body rỗng khi chèn hoặc cập nhật thành công. Nếu return=representation được chỉ định, các dịch vụ SHOULD trả về resource đã được tạo hoặc cập nhật trong response. Các dịch vụ SHOULD hỗ trợ header này nếu có những kịch bản mà client đôi khi được lợi từ các response, nhưng đôi khi response lại gây tốn băng thông quá mức.
If-Match, If-None-Match, If-Range | String                                           | Các dịch vụ hỗ trợ cập nhật resource bằng cơ chế kiểm soát đồng thời lạc quan (optimistic concurrency control) MUST hỗ trợ If-Match header để làm việc đó. Các dịch vụ MAY cũng dùng các header khác liên quan đến ETag miễn là tuân theo đặc tả HTTP.

### 7.6. Response header chuẩn
Các dịch vụ SHOULD trả về các response header sau, trừ những chỗ được ghi chú khác trong cột "required".

Response Header    | Required                                      | Description
------------------ | --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
Date               | All responses                                 | Dấu thời gian response được xử lý, dựa trên đồng hồ của server, theo định dạng ngày và giờ [RFC 5322][rfc-5322-3-3].  Header này MUST được đưa vào response.  Giờ Greenwich (GMT) MUST được dùng làm múi giờ tham chiếu cho header này.  Ví dụ: `Wed, 24 Aug 2016 18:41:30 GMT`. Lưu ý rằng GMT hoàn toàn bằng UTC (Giờ Phối hợp Quốc tế) trong ngữ cảnh này.
Content-Type       | All responses                                 | Content type
Content-Encoding   | All responses                                 | GZIP hoặc DEFLATE, tùy trường hợp
Preference-Applied | When specified in request                     | Cho biết preference được chỉ ra trong Prefer request header có được áp dụng hay không
ETag               | When the requested resource has an entity tag | Trường response header ETag cung cấp giá trị hiện tại của entity tag cho biến thể được yêu cầu. Được dùng cùng với If-Match, If-None-Match và If-Range để triển khai kiểm soát đồng thời lạc quan.

### 7.7. Header tùy chỉnh
Header tùy chỉnh MUST NOT là bắt buộc cho hoạt động cơ bản của một API.

Một số hướng dẫn trong tài liệu này quy định việc dùng các HTTP header không chuẩn.
Ngoài ra, một số dịch vụ MAY cần bổ sung chức năng mở rộng được cung cấp qua các HTTP header.
Các hướng dẫn sau giúp duy trì tính nhất quán trong cách dùng header tùy chỉnh.

Các header không phải HTTP header chuẩn MUST có một trong hai định dạng:

1. Định dạng chung cho các header được đăng ký là "provisional" với IANA ([RFC 3864][rfc-3864])
2. Định dạng có phạm vi cho các header quá đặc thù theo cách sử dụng nên không thể đăng ký

Hai định dạng này được mô tả bên dưới.

### 7.8. Chỉ định header dưới dạng tham số query
Một số header gây khó khăn trong một số kịch bản như các client AJAX, đặc biệt khi thực hiện các lời gọi cross-domain mà việc thêm header MAY không được hỗ trợ.
Do đó, một số header MAY được chấp nhận dưới dạng Query Parameter ngoài dạng header, với cùng tên như header:

Không phải header nào cũng phù hợp để làm tham số query, bao gồm hầu hết các HTTP header chuẩn.

Các tiêu chí để cân nhắc khi nào nên chấp nhận header dưới dạng tham số là:

1. Mọi header tùy chỉnh MUST cũng được chấp nhận dưới dạng tham số.
2. Các header chuẩn bắt buộc MAY được chấp nhận dưới dạng tham số.
3. Các header bắt buộc có tính nhạy cảm về bảo mật (ví dụ: Authorization header) MIGHT NOT phù hợp để làm tham số; chủ sở hữu dịch vụ SHOULD đánh giá chúng theo từng trường hợp cụ thể.

Ngoại lệ duy nhất của quy tắc này là Accept header.
Việc dùng một lược đồ với các tên đơn giản thay vì đầy đủ chức năng được mô tả trong đặc tả HTTP cho Accept là thực hành phổ biến.

### 7.9. Tham số PII
Phù hợp với chính sách quyền riêng tư của tổ chức mình, client SHOULD NOT truyền các tham số thông tin nhận dạng cá nhân (PII) trong URL (như một phần của đường dẫn hoặc query string) vì thông tin này có thể vô tình bị lộ qua log của client, mạng và server cũng như các cơ chế khác.

Do đó, dịch vụ SHOULD chấp nhận các tham số PII được truyền dưới dạng header.

Tuy nhiên, có nhiều kịch bản mà các khuyến nghị trên không thể thực hiện được do hạn chế của client hoặc phần mềm.
Để giải quyết các hạn chế này, các dịch vụ SHOULD cũng chấp nhận các tham số PII này như một phần của URL, nhất quán với phần còn lại của các hướng dẫn này.

Các dịch vụ chấp nhận tham số PII -- dù trong URL hay dưới dạng header -- SHOULD tuân thủ chính sách quyền riêng tư do ban lãnh đạo kỹ thuật của tổ chức mình quy định.
Điều này thường bao gồm việc khuyến nghị client ưu tiên dùng header để truyền, và các bản triển khai tuân thủ những biện pháp phòng ngừa đặc biệt để bảo đảm log và các hoạt động thu thập dữ liệu khác của dịch vụ được xử lý đúng cách.

### 7.10. Định dạng response
Để một tổ chức có một nền tảng thành công, họ phải phục vụ dữ liệu theo các định dạng mà nhà phát triển quen sử dụng, và theo những cách nhất quán cho phép nhà phát triển xử lý response bằng mã dùng chung.

Giao tiếp dựa trên web, đặc biệt khi có liên quan đến client di động hoặc client băng thông thấp khác, đã nhanh chóng chuyển sang hướng JSON vì nhiều lý do, bao gồm xu hướng nhẹ hơn và dễ tiếp nhận hơn với các client dựa trên JavaScript.

Tên thuộc tính JSON SHOULD dùng camelCase.

Các dịch vụ SHOULD cung cấp JSON làm mã hóa mặc định.

#### 7.10.1. Định dạng response do client chỉ định
Trong HTTP, định dạng response SHOULD được client yêu cầu bằng Accept header.
Đây là một gợi ý, và server MAY bỏ qua nếu muốn, dù điều này không điển hình đối với các server hoạt động đúng mực.
Client MAY gửi nhiều Accept header và dịch vụ MAY chọn một trong số đó.

Định dạng response mặc định (khi không có Accept header) SHOULD là application/json, và mọi dịch vụ MUST hỗ trợ application/json.

Accept Header    | Response type                      | Notes
---------------- | ---------------------------------- | -------------------------------------------
application/json | Payload SHOULD be returned as JSON | Also accept text/javascript for JSONP cases

```http
GET https://api.contoso.com/v1.0/products/user
Accept: application/json
```

#### 7.10.2. Response cho các tình huống lỗi
Đối với các tình huống không thành công, nhà phát triển SHOULD có thể viết một đoạn mã duy nhất xử lý lỗi một cách nhất quán trên các dịch vụ tuân thủ Hướng dẫn REST API của Microsoft khác nhau.
Điều này cho phép xây dựng hạ tầng đơn giản và đáng tin cậy để xử lý ngoại lệ như một luồng riêng biệt với các response thành công.
Nội dung sau dựa trên đặc tả JSON OData v4.
Tuy nhiên, nó rất tổng quát và không yêu cầu các cấu trúc OData cụ thể.
Các API SHOULD dùng định dạng này ngay cả khi không dùng các cấu trúc OData khác.

Error response MUST là một đối tượng JSON duy nhất.
Đối tượng này MUST có một cặp name/value có tên "error". Giá trị MUST là một đối tượng JSON.

Đối tượng này MUST chứa các cặp name/value có tên "code" và "message", và MAY chứa các cặp name/value có tên "target", "details" và "innererror."

Giá trị của cặp name/value "code" là một chuỗi độc lập với ngôn ngữ.
Giá trị của nó là mã lỗi do dịch vụ định nghĩa và SHOULD dễ đọc đối với con người.
Mã này đóng vai trò là chỉ báo cụ thể hơn về lỗi so với mã lỗi HTTP được chỉ định trong response.
Các dịch vụ SHOULD có số lượng giá trị khả dĩ tương đối nhỏ (khoảng 20) cho "code", và mọi client MUST có khả năng xử lý tất cả chúng.
Hầu hết các dịch vụ sẽ cần một số lượng mã lỗi cụ thể hơn lớn hơn nhiều, những mã mà không phải client nào cũng quan tâm.
Các mã lỗi này SHOULD được cung cấp trong cặp name/value "innererror" như mô tả bên dưới.
Việc đưa vào một giá trị "code" mới mà các client hiện có nhìn thấy là một breaking change và yêu cầu tăng phiên bản.
Các dịch vụ có thể tránh breaking change bằng cách thêm các mã lỗi mới vào "innererror" thay vì "code".

Giá trị của cặp name/value "message" MUST là biểu diễn lỗi dễ đọc đối với con người.
Nó nhằm hỗ trợ nhà phát triển và không phù hợp để hiển thị cho người dùng cuối.
Các dịch vụ muốn cung cấp thông điệp phù hợp cho người dùng cuối MUST thực hiện thông qua một [annotation][odata-json-annotations] hoặc thuộc tính tùy chỉnh.
Các dịch vụ SHOULD NOT bản địa hóa "message" cho người dùng cuối, vì làm vậy có thể khiến giá trị trở nên khó đọc đối với nhà phát triển ứng dụng đang ghi log giá trị đó, đồng thời làm giá trị khó tìm kiếm hơn trên Internet.

Giá trị của cặp name/value "target" là đích của lỗi cụ thể đó (ví dụ: tên của thuộc tính bị lỗi).

Giá trị của cặp name/value "details" MUST là một mảng các đối tượng JSON, trong đó MUST chứa các cặp name/value cho "code" và "message", và MAY chứa một cặp name/value cho "target", như mô tả ở trên.
Các đối tượng trong mảng "details" thường biểu diễn các lỗi riêng biệt, có liên quan, xảy ra trong quá trình xử lý request.
Xem ví dụ bên dưới.

Giá trị của cặp name/value "innererror" MUST là một đối tượng.
Nội dung của đối tượng này do dịch vụ định nghĩa.
Các dịch vụ muốn trả về lỗi cụ thể hơn mã ở cấp gốc MUST thực hiện bằng cách đưa vào một cặp name/value cho "code" và một "innererror" lồng nhau. Mỗi đối tượng "innererror" lồng nhau biểu diễn mức chi tiết cao hơn so với đối tượng cha của nó.
Khi đánh giá lỗi, client MUST duyệt qua tất cả các "innererror" lồng nhau và chọn cái sâu nhất mà họ hiểu.
Lược đồ này cho phép các dịch vụ đưa ra các mã lỗi mới ở bất kỳ vị trí nào trong hệ thống phân cấp mà không phá vỡ tính tương thích ngược, miễn là các mã lỗi cũ vẫn xuất hiện.
Dịch vụ MAY trả về các mức độ sâu và chi tiết khác nhau cho các bên gọi khác nhau.
Ví dụ, trong môi trường phát triển, "innererror" sâu nhất MAY chứa thông tin nội bộ có thể giúp gỡ lỗi dịch vụ.
Để phòng ngừa các vấn đề bảo mật tiềm ẩn liên quan đến việc tiết lộ thông tin, các dịch vụ SHOULD cẩn thận để không vô tình để lộ quá nhiều chi tiết.
Các đối tượng lỗi MAY cũng bao gồm các cặp name/value tùy chỉnh do server định nghĩa, vốn MAY đặc thù theo từng mã.
Các kiểu lỗi có thuộc tính tùy chỉnh do server định nghĩa SHOULD được khai báo trong tài liệu metadata của dịch vụ.
Xem ví dụ bên dưới.

Error response MAY chứa các [annotation][odata-json-annotations] trong bất kỳ đối tượng JSON nào của chúng.

Chúng tôi khuyến nghị rằng với mọi lỗi tạm thời có thể được thử lại, các dịch vụ SHOULD bao gồm một Retry-After HTTP header cho biết số giây tối thiểu mà client SHOULD chờ trước khi thử lại thao tác.

##### ErrorResponse : Object

Property | Type | Required | Description
-------- | ---- | -------- | -----------
`error` | Error | ✔ | Đối tượng lỗi.

##### Error : Object

Property | Type | Required | Description
-------- | ---- | -------- | -----------
`code` | String | ✔ | Một trong tập các mã lỗi do server định nghĩa.
`message` | String | ✔ | Biểu diễn lỗi dễ đọc đối với con người.
`target` | String |  | Đích của lỗi.
`details` | Error[] |  | Một mảng các chi tiết về những lỗi cụ thể dẫn đến lỗi được báo cáo này.
`innererror` | InnerError |  | Một đối tượng chứa thông tin về lỗi cụ thể hơn đối tượng hiện tại.

##### InnerError : Object

Property | Type | Required | Description
-------- | ---- | -------- | -----------
`code` | String |  | Một mã lỗi cụ thể hơn mã do lỗi chứa nó cung cấp.
`innererror` | InnerError |  | Một đối tượng chứa thông tin về lỗi cụ thể hơn đối tượng hiện tại.

##### Ví dụ

Ví dụ về "innererror":

```json
{
  "error": {
    "code": "BadArgument",
    "message": "Previous passwords may not be reused",
    "target": "password",
    "innererror": {
      "code": "PasswordError",
      "innererror": {
        "code": "PasswordDoesNotMeetPolicy",
        "minLength": "6",
        "maxLength": "64",
        "characterTypes": ["lowerCase","upperCase","number","symbol"],
        "minDistinctCharacterTypes": "2",
        "innererror": {
          "code": "PasswordReuseNotAllowed"
        }
      }
    }
  }
}
```

Trong ví dụ này, mã lỗi cơ bản nhất là "BadArgument", nhưng với các client quan tâm, có những mã lỗi cụ thể hơn trong "innererror."
Mã "PasswordReuseNotAllowed" có thể đã được dịch vụ bổ sung vào một thời điểm muộn hơn, trước đó chỉ trả về "PasswordDoesNotMeetPolicy."
Các client hiện có không bị hỏng khi mã lỗi mới được thêm vào, nhưng các client mới MAY tận dụng nó.
Lỗi "PasswordDoesNotMeetPolicy" cũng bao gồm các cặp name/value bổ sung cho phép client xác định cấu hình của server, xác thực dữ liệu đầu vào của người dùng bằng lập trình, hoặc trình bày các ràng buộc của server cho người dùng trong thông điệp được bản địa hóa của chính client.

Ví dụ về "details":

```json
{
  "error": {
    "code": "BadArgument",
    "message": "Multiple errors in ContactInfo data",
    "target": "ContactInfo",
    "details": [
      {
        "code": "NullValue",
        "target": "PhoneNumber",
        "message": "Phone number must not be null"
      },
      {
        "code": "NullValue",
        "target": "LastName",
        "message": "Last name must not be null"
      },
      {
        "code": "MalformedValue",
        "target": "Address",
        "message": "Address is not valid"
      }
    ]
  }
}
```

Trong ví dụ này có nhiều vấn đề với request, với từng lỗi riêng lẻ được liệt kê trong "details."

### 7.11. HTTP Status Codes
Các HTTP Status Code chuẩn SHOULD được sử dụng; xem định nghĩa HTTP Status Code để biết thêm thông tin.

### 7.12. Client library là tùy chọn
Nhà phát triển MUST có thể phát triển trên nhiều nền tảng và ngôn ngữ khác nhau, chẳng hạn Windows, macOS, Linux, C#, Python, Node.js và Ruby.

Dịch vụ SHOULD có thể được truy cập từ các công cụ HTTP đơn giản như curl mà không tốn nhiều công sức.

Cổng thông tin dành cho nhà phát triển của dịch vụ SHOULD cung cấp chức năng tương đương "Get Developer Token" để thuận tiện cho việc thử nghiệm và hỗ trợ curl.

## 8. CORS
Các dịch vụ tuân thủ Microsoft REST API Guidelines MUST hỗ trợ [CORS (Cross Origin Resource Sharing)][cors].
Dịch vụ SHOULD hỗ trợ allowed origin của CORS là * và thực thi phân quyền thông qua OAuth token hợp lệ.
Dịch vụ SHOULD NOT hỗ trợ thông tin xác thực người dùng (user credentials) kèm kiểm tra origin.
MAY có các ngoại lệ cho những trường hợp đặc biệt.

### 8.1. Hướng dẫn cho client
Nhà phát triển web thường không cần làm gì đặc biệt để tận dụng CORS.
Mọi bước handshake đều diễn ra ngầm như một phần của các lệnh gọi XMLHttpRequest chuẩn mà họ thực hiện.

Nhiều nền tảng khác, chẳng hạn .NET, đã tích hợp sẵn hỗ trợ CORS.

#### 8.1.1. Tránh preflight
Vì giao thức CORS có thể kích hoạt các preflight request làm phát sinh thêm các vòng đi-về (round trip) tới server, các ứng dụng đòi hỏi hiệu năng cao có thể muốn tránh chúng.
Tinh thần của CORS là tránh preflight đối với mọi request cross-domain đơn giản mà các trình duyệt cũ không hỗ trợ CORS vốn đã có thể thực hiện.
Tất cả các request khác đều cần preflight.

Một request được coi là "đơn giản" và tránh được preflight nếu phương thức của nó là GET, HEAD hoặc POST, và nếu nó không chứa request header nào ngoài Accept, Accept-Language và Content-Language.
Với request POST, header Content-Type cũng được phép dùng, nhưng chỉ khi giá trị của nó là "application/x-www-form-urlencoded", "multipart/form-data" hoặc "text/plain."
Với bất kỳ header hay giá trị nào khác, một preflight request sẽ xảy ra.

### 8.2. Hướng dẫn cho dịch vụ
 Tối thiểu, dịch vụ MUST:
- Hiểu request header Origin mà trình duyệt gửi trong các request cross-domain, và request header Access-Control-Request-Method mà trình duyệt gửi trong các preflight request OPTIONS dùng để kiểm tra quyền truy cập.
- Nếu header Origin có mặt trong một request:
  - Nếu request dùng phương thức OPTIONS và chứa header Access-Control-Request-Method, thì đó là một preflight request nhằm thăm dò quyền truy cập trước request thực sự. Ngược lại, đó là request thực sự. Với preflight request, ngoài việc thực hiện các bước bên dưới để thêm header, dịch vụ MUST không xử lý gì thêm và MUST trả về 200 OK. Với request không phải preflight, các header bên dưới được thêm vào bên cạnh quá trình xử lý thông thường của request.
  - Thêm header Access-Control-Allow-Origin vào response, chứa cùng giá trị với request header Origin. Lưu ý rằng điều này đòi hỏi dịch vụ phải sinh giá trị header một cách động. Các resource không yêu cầu cookie hay bất kỳ dạng [user credentials][cors-user-credentials] nào khác MAY phản hồi bằng ký tự đại diện dấu sao (*) thay thế. Lưu ý rằng ký tự đại diện chỉ được chấp nhận ở đây, và không được chấp nhận cho bất kỳ header nào khác được mô tả bên dưới.
  - Nếu bên gọi cần truy cập một response header không nằm trong tập [simple response headers][cors-simple-headers] (Cache-Control, Content-Language, Content-Type, Expires, Last-Modified, Pragma), thì thêm header Access-Control-Expose-Headers chứa danh sách tên các response header bổ sung mà client cần được truy cập.
  - Nếu request yêu cầu cookie, thì thêm header Access-Control-Allow-Credentials với giá trị "true."
  - Nếu request là một preflight request (xem gạch đầu dòng đầu tiên), thì dịch vụ MUST:
    - Thêm response header Access-Control-Allow-Headers chứa danh sách tên các request header mà client được phép dùng. Danh sách này chỉ cần chứa các header không nằm trong tập [simple request headers][cors-simple-headers] (Accept, Accept-Language, Content-Language). Nếu không có hạn chế nào về các header mà dịch vụ chấp nhận, dịch vụ MAY đơn giản trả về cùng giá trị với header Access-Control-Request-Headers mà client đã gửi.
    - Thêm response header Access-Control-Allow-Methods chứa danh sách các phương thức HTTP mà bên gọi được phép dùng.

Thêm response header Access-Control-Max-Age pref chứa số giây mà preflight response này còn hiệu lực (và do đó có thể bỏ qua trước các request thực sự tiếp theo). Lưu ý rằng dù thông lệ là dùng giá trị lớn như 2592000 (30 ngày), nhiều trình duyệt tự áp đặt giới hạn thấp hơn nhiều (ví dụ: năm phút).

Vì bộ nhớ đệm preflight response của trình duyệt nổi tiếng là yếu, vòng đi-về bổ sung từ preflight response làm giảm hiệu năng.
Các dịch vụ được dùng bởi web client tương tác mà hiệu năng là yếu tố then chốt SHOULD tránh các mẫu thiết kế gây ra preflight request
- Với các lệnh gọi GET và HEAD, tránh yêu cầu các request header không thuộc tập đơn giản nêu trên. Thay vào đó, cho phép truyền chúng dưới dạng query parameter.
  - Header Authorization không thuộc tập đơn giản, vì vậy token xác thực MUST được gửi qua query parameter "access_token" thay thế, đối với các resource yêu cầu xác thực. Lưu ý rằng việc truyền token xác thực trong URL không được khuyến nghị, vì nó có thể dẫn đến việc token bị ghi vào log của server và bị lộ cho bất kỳ ai có quyền truy cập các log đó. Các dịch vụ chấp nhận token xác thực qua URL MUST thực hiện các biện pháp giảm thiểu rủi ro bảo mật, chẳng hạn dùng token xác thực có thời hạn ngắn, ngăn token xác thực bị ghi log, và kiểm soát quyền truy cập vào log của server.

- Tránh yêu cầu cookie. XmlHttpRequest chỉ gửi cookie trong các request cross-domain nếu thuộc tính "withCredentials" được đặt; điều này cũng gây ra preflight request.
  - Các dịch vụ yêu cầu xác thực dựa trên cookie MUST dùng một "dynamic canary" để bảo vệ tất cả các API chấp nhận cookie.

- Với các lệnh gọi POST, ưu tiên các Content-Type đơn giản trong tập ("application/x-www-form-urlencoded", "multipart/form-data", "text/plain") khi áp dụng được. Bất kỳ Content-Type nào khác sẽ gây ra preflight request.
  - Dịch vụ MUST NOT đi ngược các khuyến nghị API khác nhân danh việc tránh CORS preflight request. Cụ thể, theo các khuyến nghị, hầu hết các request POST thực tế sẽ cần preflight request do Content-Type.
  - Nếu việc loại bỏ preflight là then chốt, thì dịch vụ MAY hỗ trợ các cơ chế truyền dữ liệu thay thế, nhưng cách tiếp cận RECOMMENDED cũng MUST được hỗ trợ.

Ngoài ra, khi phù hợp, dịch vụ MAY hỗ trợ mẫu thiết kế JSONP cho truy cập cross-domain đơn giản chỉ dùng GET.
Trong JSONP, dịch vụ nhận một tham số chỉ định định dạng (_$format=json_) và một tham số chỉ định callback (_$callback=someFunc_), rồi trả về một tài liệu text/javascript chứa JSON response được bọc trong một lệnh gọi hàm có tên đã chỉ định.
Xem thêm về JSONP trên Wikipedia: [JSONP](https://en.wikipedia.org/wiki/JSONP).

## 9. Collection
### 9.1. Khóa của item
Dịch vụ MAY hỗ trợ các định danh bền vững (durable identifier) cho từng item trong collection, và định danh đó SHOULD được biểu diễn trong JSON là "id". Các định danh bền vững này thường được dùng làm khóa của item.

Các collection hỗ trợ định danh bền vững MAY hỗ trợ delta query.

### 9.2. Tuần tự hóa
Collection được biểu diễn trong JSON bằng ký pháp mảng chuẩn.

### 9.3. Mẫu URL của collection
Collection nằm trực tiếp dưới service root khi chúng ở cấp cao nhất, hoặc là một segment nằm dưới resource khác khi thuộc phạm vi của resource đó.

Ví dụ:

```http
GET https://api.contoso.com/v1.0/people
```

Bất cứ khi nào có thể, dịch vụ MUST hỗ trợ mẫu "/".
Ví dụ:

```http
GET https://{serviceRoot}/{collection}/{id}
```

Trong đó:
- {serviceRoot} – tổ hợp của host (URL site) + đường dẫn gốc tới dịch vụ
- {collection} – tên của collection, không viết tắt, ở dạng số nhiều
- {id} – giá trị của thuộc tính id duy nhất. Khi dùng mẫu "/", giá trị này MUST là giá trị string/number/guid thô, không đặt trong dấu nháy nhưng được escape đúng cách để phù hợp với một segment của URL.

#### 9.3.1. Collection và thuộc tính lồng nhau
Item của collection MAY chứa các collection khác.
Ví dụ, một collection người dùng MAY chứa các resource người dùng có nhiều địa chỉ:

```http
GET https://api.contoso.com/v1.0/people/123/addresses
```

```json
{
  "value": [
    { "street": "1st Avenue", "city": "Seattle" },
    { "street": "124th Ave NE", "city": "Redmond" }
  ]
}
```

### 9.4. Collection lớn
Khi dữ liệu tăng lên thì các collection cũng lớn theo.
Việc lên kế hoạch cho phân trang là quan trọng đối với mọi dịch vụ.
Do đó, khi có nhiều trang, payload tuần tự hóa MUST chứa URL opaque của trang kế tiếp khi thích hợp.
Tham khảo hướng dẫn về phân trang để biết thêm chi tiết.

Client MUST có khả năng chịu được việc dữ liệu collection được phân trang hoặc không phân trang tùy từng request.

```json
{
  "value":[
    { "id": "Item 1","price": 99.95,"sizes": null},
    { … },
    { … },
    { "id": "Item 99","price": 59.99,"sizes": null}
  ],
  "@nextLink": "{opaqueUrl}"
}
```

### 9.5. Thay đổi collection
Các request POST không idempotent.
Điều này có nghĩa là hai request POST gửi tới một collection resource với payload hoàn toàn giống nhau MAY dẫn đến nhiều item được tạo trong collection đó.
Đây thường là trường hợp của các thao tác chèn trên item có id do server sinh ra.

Ví dụ, request sau:

```http
POST https://api.contoso.com/v1.0/people
```

Sẽ dẫn đến một response cho biết vị trí của item mới trong collection:

```http
201 Created
Location: https://api.contoso.com/v1.0/people/123
```

Và khi được thực thi lại, nhiều khả năng sẽ dẫn đến một resource khác:

```http
201 Created
Location: https://api.contoso.com/v1.0/people/124
```

Trong khi một request PUT sẽ yêu cầu chỉ rõ item của collection với khóa tương ứng:

```http
PUT https://api.contoso.com/v1.0/people/123
```

### 9.6. Sắp xếp collection
Kết quả của một query collection MAY được sắp xếp dựa trên giá trị thuộc tính.
Thuộc tính được xác định bởi giá trị của query parameter _$orderBy_.

Giá trị của tham số _$orderBy_ chứa danh sách các biểu thức phân tách bằng dấu phẩy, dùng để sắp xếp các item.
Một trường hợp đặc biệt của biểu thức như vậy là đường dẫn thuộc tính kết thúc ở một thuộc tính kiểu nguyên thủy (primitive).

Biểu thức MAY có hậu tố "asc" cho tăng dần hoặc "desc" cho giảm dần, tách biệt với tên thuộc tính bằng một hoặc nhiều khoảng trắng.
Nếu không chỉ định "asc" hay "desc", dịch vụ MUST sắp xếp theo thuộc tính đã chỉ định theo thứ tự tăng dần.

Giá trị NULL MUST được sắp xếp là "nhỏ hơn" các giá trị không phải NULL.

Các item MUST được sắp xếp theo giá trị kết quả của biểu thức đầu tiên, sau đó các item có cùng giá trị ở biểu thức đầu tiên được sắp xếp theo giá trị kết quả của biểu thức thứ hai, và cứ tiếp tục như vậy.
Thứ tự sắp xếp là thứ tự vốn có của kiểu của thuộc tính.

Ví dụ:

```http
GET https://api.contoso.com/v1.0/people?$orderBy=name
```

Sẽ trả về tất cả people được sắp xếp theo name theo thứ tự tăng dần.

Ví dụ:

```http
GET https://api.contoso.com/v1.0/people?$orderBy=name desc
```

Sẽ trả về tất cả people được sắp xếp theo name theo thứ tự giảm dần.

Các sắp xếp phụ (sub-sort) có thể được chỉ định bằng danh sách tên thuộc tính phân tách bằng dấu phẩy với bộ định hướng chiều sắp xếp là OPTIONAL.

Ví dụ:

```http
GET https://api.contoso.com/v1.0/people?$orderBy=name desc,hireDate
```

Sẽ trả về tất cả people được sắp xếp theo name giảm dần và thứ tự sắp xếp phụ theo hireDate tăng dần.

Việc sắp xếp MUST kết hợp được với lọc sao cho:

```http
GET https://api.contoso.com/v1.0/people?$filter=name eq 'david'&$orderBy=hireDate
```

Sẽ trả về tất cả people có name là David, được sắp xếp tăng dần theo hireDate.

#### 9.6.1. Diễn giải biểu thức sắp xếp
Các tham số sắp xếp MUST nhất quán giữa các trang, vì cả phân trang phía client lẫn phía server đều hoàn toàn tương thích với sắp xếp.

Nếu một dịch vụ không hỗ trợ sắp xếp theo thuộc tính được nêu trong biểu thức _$orderBy_, dịch vụ MUST phản hồi bằng thông báo lỗi như được định nghĩa trong phần Responding to Unsupported Requests.

### 9.7. Lọc
Tham số querystring _$filter_ cho phép client lọc một collection các resource được định địa chỉ bởi URL của request.
Biểu thức được chỉ định bằng _$filter_ được đánh giá cho từng resource trong collection, và chỉ các item mà biểu thức cho kết quả true mới được đưa vào response.
Các resource mà biểu thức cho kết quả false hoặc null, hoặc tham chiếu đến các thuộc tính không khả dụng do quyền hạn, sẽ bị loại khỏi response.

Ví dụ: trả về tất cả Products có Price nhỏ hơn $10.00

```http
GET https://api.contoso.com/v1.0/products?$filter=price lt 10.00
```

Giá trị của tùy chọn _$filter_ là một biểu thức Boolean.

#### 9.7.1. Các phép toán lọc
Các dịch vụ hỗ trợ _$filter_ SHOULD hỗ trợ tập phép toán tối thiểu sau.

Operator             | Description           | Example
-------------------- | --------------------- | -----------------------------------------------------
Toán tử so sánh      |                       |
eq                   | Bằng                  | city eq 'Redmond'
ne                   | Không bằng            | city ne 'London'
gt                   | Lớn hơn               | price gt 20
ge                   | Lớn hơn hoặc bằng     | price ge 10
lt                   | Nhỏ hơn               | price lt 20
le                   | Nhỏ hơn hoặc bằng     | price le 100
Toán tử logic        |                       |
and                  | Và (logic)            | price le 200 and price gt 3.5
or                   | Hoặc (logic)          | price le 3.5 or price gt 200
not                  | Phủ định (logic)      | not price le 3.5
Toán tử nhóm         |                       |
( )                  | Nhóm theo độ ưu tiên  | (priority eq 1 or city eq 'Redmond') and price gt 100

#### 9.7.2. Ví dụ về các toán tử
Các ví dụ sau minh họa cách dùng và ngữ nghĩa của từng toán tử logic.

Ví dụ: tất cả products có name bằng 'Milk'

```http
GET https://api.contoso.com/v1.0/products?$filter=name eq 'Milk'
```

Ví dụ: tất cả products có name không bằng 'Milk'

```http
GET https://api.contoso.com/v1.0/products?$filter=name ne 'Milk'
```

Ví dụ: tất cả products có name là 'Milk' đồng thời có price nhỏ hơn 2.55:

```http
GET https://api.contoso.com/v1.0/products?$filter=name eq 'Milk' and price lt 2.55
```

Ví dụ: tất cả products hoặc có name là 'Milk' hoặc có price nhỏ hơn 2.55:

```http
GET https://api.contoso.com/v1.0/products?$filter=name eq 'Milk' or price lt 2.55
```

Ví dụ: tất cả products có name là 'Milk' hoặc 'Eggs' và có price nhỏ hơn 2.55:

```http
GET https://api.contoso.com/v1.0/products?$filter=(name eq 'Milk' or name eq 'Eggs') and price lt 2.55
```

#### 9.7.3. Độ ưu tiên của toán tử
Dịch vụ MUST dùng độ ưu tiên toán tử sau cho các toán tử được hỗ trợ khi đánh giá các biểu thức _$filter_.
Các toán tử được liệt kê theo nhóm, theo thứ tự độ ưu tiên từ cao nhất đến thấp nhất.
Các toán tử trong cùng một nhóm có độ ưu tiên bằng nhau:

| Nhóm            | Toán tử  | Mô tả                 |
|:----------------|:---------|:----------------------|
| Nhóm            | ( )      | Nhóm theo độ ưu tiên  |
| Một ngôi        | not      | Phủ định logic        |
| Quan hệ         | gt       | Lớn hơn               |
|                 | ge       | Lớn hơn hoặc bằng     |
|                 | lt       | Nhỏ hơn               |
|                 | le       | Nhỏ hơn hoặc bằng     |
| Bằng nhau       | eq       | Bằng                  |
|                 | ne       | Không bằng            |
| AND điều kiện   | and      | Và (logic)            |
| OR điều kiện    | or       | Hoặc (logic)          |

### 9.8. Phân trang
Các RESTful API trả về collection MAY trả về tập kết quả một phần.
Bên sử dụng các dịch vụ này MUST dự liệu tập kết quả một phần và phân trang đúng cách để lấy được toàn bộ tập kết quả.

Có hai hình thức phân trang mà RESTful API MAY hỗ trợ.
Phân trang do server điều khiển (server-driven paging) giảm thiểu các cuộc tấn công từ chối dịch vụ bằng cách buộc phân trang một request qua nhiều response payload.
Phân trang do client điều khiển (client-driven paging) cho phép client chỉ yêu cầu số lượng resource mà nó có thể sử dụng tại một thời điểm.

Các tham số sắp xếp và lọc MUST nhất quán giữa các trang, vì cả phân trang phía client lẫn phía server đều hoàn toàn tương thích với cả lọc và sắp xếp.

#### 9.8.1. Phân trang do server điều khiển
Các response được phân trang MUST cho biết kết quả một phần bằng cách đưa continuation token vào response.
Việc không có continuation token nghĩa là không còn trang nào nữa.

Client MUST coi continuation URL là opaque, nghĩa là các tùy chọn query không được thay đổi trong khi lặp qua một tập kết quả một phần.

Ví dụ:

```http
GET http://api.contoso.com/v1.0/people HTTP/1.1
Accept: application/json

HTTP/1.1 200 OK
Content-Type: application/json

{
  ...,
  "value": [...],
  "@nextLink": "{opaqueUrl}"
}
```

#### 9.8.2. Phân trang do client điều khiển
Client MAY dùng các query parameter _$top_ và _$skip_ để chỉ định số lượng kết quả cần trả về và độ lệch (offset) trong collection.

Server SHOULD tôn trọng các giá trị mà client chỉ định; tuy nhiên, client MUST sẵn sàng xử lý các response có kích thước trang khác hoặc có chứa continuation token.

Khi client chỉ định cả _$top_ và _$skip_, server SHOULD áp dụng _$skip_ trước rồi mới áp dụng _$top_ lên collection.

Lưu ý: Nếu server không thể tôn trọng _$top_ và/hoặc _$skip_, server MUST trả về lỗi cho client để thông báo điều đó, thay vì chỉ bỏ qua các tùy chọn query.
Điều này tránh rủi ro client đưa ra các giả định sai về dữ liệu được trả về.

Ví dụ:

```http
GET http://api.contoso.com/v1.0/people?$top=5&$skip=2 HTTP/1.1
Accept: application/json

HTTP/1.1 200 OK
Content-Type: application/json

{
  ...,
  "value": [...]
}
```

#### 9.8.3. Các lưu ý bổ sung
**Điều kiện tiên quyết về thứ tự ổn định:** Cả hai hình thức phân trang đều phụ thuộc vào việc collection các item có thứ tự ổn định.
Server MUST bổ sung thêm các tiêu chí sắp xếp phụ (thường là theo khóa) vào bất kỳ tiêu chí thứ tự nào được chỉ định, để đảm bảo các item luôn được sắp xếp nhất quán.

**Kết quả bị thiếu/lặp lại:** Ngay cả khi server thực thi thứ tự sắp xếp nhất quán, kết quả MAY bị thiếu hoặc lặp lại do việc tạo hoặc xóa các resource khác.
Client MUST sẵn sàng xử lý những sai lệch này.
Server SHOULD luôn mã hóa ID của bản ghi được đọc gần nhất, giúp client quản lý các kết quả bị lặp/thiếu.

**Kết hợp phân trang do client và do server điều khiển:** Lưu ý rằng phân trang do client điều khiển không loại trừ phân trang do server điều khiển.
Nếu kích thước trang mà client yêu cầu lớn hơn kích thước trang mặc định mà server hỗ trợ, response mong đợi sẽ có số lượng kết quả do client chỉ định, được phân trang theo cài đặt phân trang của server.

**Kích thước trang:** Client MAY yêu cầu phân trang do server điều khiển với một kích thước trang cụ thể bằng cách chỉ định preference _$maxpagesize_.
Server SHOULD tôn trọng preference này nếu kích thước trang được chỉ định nhỏ hơn kích thước trang mặc định của server.

**Phân trang các collection nhúng:** Cả phân trang do client điều khiển và do server điều khiển đều có thể được áp dụng cho các collection nhúng (embedded collection).
Nếu server phân trang một collection nhúng, nó MUST bao gồm thêm các continuation token khi thích hợp.

**Tổng số bản ghi:** Nhà phát triển muốn biết tổng số bản ghi trên tất cả các trang MAY thêm query parameter _$count=true_ để yêu cầu server đưa số lượng item vào response.

### 9.9. Các thao tác kết hợp trên collection
Các thao tác lọc, sắp xếp và phân trang MAY được thực hiện đồng thời trên một collection nhất định.
Khi các thao tác này được thực hiện cùng nhau, thứ tự đánh giá MUST là:

1. **Lọc**. Bao gồm mọi biểu thức khoảng (range expression) được thực hiện như một phép AND.
2. **Sắp xếp**. Danh sách có thể đã được lọc được sắp xếp theo các tiêu chí sắp xếp.
3. **Phân trang**. Chế độ xem phân trang đã được hiện thực hóa (materialized) được trình bày trên danh sách đã lọc và đã sắp xếp. Điều này áp dụng cho cả phân trang do server điều khiển và phân trang do client điều khiển.

### 9.10. Kết quả rỗng
Khi một phép lọc được thực hiện trên collection và tập kết quả rỗng, bạn MUST phản hồi bằng response body hợp lệ và mã response 200. 
Trong ví dụ này, các bộ lọc do client cung cấp cho ra tập kết quả rỗng. 
Response body được trả về như bình thường và thuộc tính _value_ được đặt là một collection rỗng. 
Client MAY mong đợi các thuộc tính metadata như _maxItems_ dựa trên định dạng response của bạn ở các lệnh gọi tương tự đã cho ra kết quả. 
Bạn SHOULD duy trì tính nhất quán trong API của mình bất cứ khi nào có thể. 

```http
GET https://api.contoso.com/v1.0/products?$filter=(name eq 'Milk' or name eq 'Eggs') and price lt 2.55
Accept: application/json

HTTP/1.1 200 OK
Content-Type: application/json

{
  ...,
  "maxItems": 0,
  "value": []
}
```

## 10. Delta query
Dịch vụ MAY chọn hỗ trợ delta query.

### 10.1. Delta link
Delta link là các link opaque do dịch vụ sinh ra, được client dùng để lấy các thay đổi tiếp theo của một kết quả.

Ở mức khái niệm, delta link dựa trên một query định nghĩa mô tả tập kết quả mà các thay đổi của nó đang được theo dõi.
Delta link mã hóa collection các entity đang được theo dõi thay đổi, cùng với một điểm bắt đầu để theo dõi các thay đổi.

Nếu query chứa bộ lọc, response MUST chỉ bao gồm các thay đổi của những entity khớp với tiêu chí đã chỉ định.
Các nguyên tắc chính của Delta Query là:
- Mọi item trong tập MUST có một định danh bền vững. Định danh đó SHOULD được biểu diễn là "id". Định danh này là một chuỗi opaque do dịch vụ định nghĩa mà client MAY dùng để theo dõi đối tượng giữa các lệnh gọi.
- Delta MUST chứa một mục cho mỗi entity mới khớp với tiêu chí đã chỉ định, và MUST chứa một mục "@removed" cho mỗi entity không còn khớp với tiêu chí.
- Đánh giá lại query và so sánh với tập kết quả ban đầu; mọi mục chỉ có trong tập hiện tại MUST được trả về như một thao tác Add, và mọi mục chỉ có trong tập ban đầu MUST được trả về như một thao tác "remove".
- Mỗi entity trước đây không khớp tiêu chí nhưng nay khớp MUST được trả về là "add"; ngược lại, mỗi entity trước đây khớp query nhưng nay không còn khớp MUST được trả về là một mục "@removed".
- Các entity đã thay đổi MUST được đưa vào tập bằng cách biểu diễn chuẩn của chúng.
- Dịch vụ MAY thêm metadata bổ sung vào node "@removed", chẳng hạn lý do xóa, hoặc dấu thời gian "removed at". Chúng tôi khuyến nghị các nhóm phối hợp với Microsoft REST API Guidelines Working Group về các phần mở rộng để giúp duy trì tính nhất quán.

Delta link MUST NOT mã hóa bất kỳ giá trị top hay skip nào của client.

### 10.2. Biểu diễn entity
Các entity được thêm và cập nhật được biểu diễn trong entity set bằng cách biểu diễn chuẩn của chúng.
Xét từ góc độ của tập, không có sự khác biệt giữa entity được thêm và entity được cập nhật.

Các entity bị xóa được biểu diễn chỉ bằng "id" của chúng và một node "@removed".
Sự hiện diện của node "@removed" MUST biểu thị việc mục đó bị xóa khỏi tập.

### 10.3. Lấy delta link
Delta link được lấy bằng cách query một collection hoặc entity và thêm query string parameter $delta.
Ví dụ:

```http
GET https://api.contoso.com/v1.0/people?$delta
HTTP/1.1
Accept: application/json

HTTP/1.1 200 OK
Content-Type: application/json

{
  "value":[
    { "id": "1", "name": "Matt"},
    { "id": "2", "name": "Mark"},
    { "id": "3", "name": "John"}
  ],
  "@deltaLink": "{opaqueUrl}"
}
```

Lưu ý: Nếu collection được phân trang, deltaLink chỉ xuất hiện ở trang cuối cùng nhưng MUST phản ánh mọi thay đổi đối với dữ liệu được trả về trên tất cả các trang.

### 10.4. Nội dung của response delta link
Các mục được thêm/cập nhật MUST xuất hiện như các đối tượng JSON thông thường, với các thuộc tính item thông thường.
Việc trả về các item được thêm/sửa theo biểu diễn thông thường cho phép client gộp chúng vào "cache" hiện có bằng các khái niệm gộp chuẩn dựa trên trường "id".

Các mục bị xóa khỏi collection đã định nghĩa MUST được đưa vào response.
Các item bị xóa khỏi tập MUST được biểu diễn chỉ bằng "id" của chúng và một node "@removed".

### 10.5. Sử dụng delta link
Client yêu cầu các thay đổi bằng cách gọi phương thức GET trên delta link.
Client MUST dùng delta URL nguyên trạng -- nói cách khác, client MUST NOT sửa đổi URL theo bất kỳ cách nào (ví dụ: phân tích nó và thêm các query string parameter bổ sung).
Trong ví dụ này:

```http
GET https://{opaqueUrl} HTTP/1.1
Accept: application/json

HTTP/1.1 200 OK
Content-Type: application/json

{
  "value":[
    { "id": "1", "name": "Mat"},
    { "id": "2", "name": "Marc"},
    { "id": "3", "@removed": {} },
    { "id": "4", "name": "Luc"}
  ],
  "@deltaLink": "{opaqueUrl}"
}
```

Kết quả của một request trên delta link có thể trải dài nhiều trang nhưng MUST được dịch vụ sắp xếp trên tất cả các trang sao cho đảm bảo kết quả xác định (deterministic) khi áp dụng theo thứ tự lên response đã chứa delta link.

Nếu không có thay đổi nào xảy ra, response là một collection rỗng chứa một delta link cho các thay đổi tiếp theo nếu được yêu cầu.
Delta link này MAY giống hệt delta link đã dẫn đến collection thay đổi rỗng.

Nếu delta link không còn hợp lệ, dịch vụ MUST phản hồi _410 Gone_. Response SHOULD bao gồm header Location mà client có thể dùng để lấy một tập kết quả cơ sở (baseline) mới.

## 11. Chuẩn hóa JSON
### 11.1. Chuẩn hóa định dạng JSON cho các kiểu nguyên thủy
Các giá trị nguyên thủy MUST được tuần tự hóa sang JSON theo các quy tắc của [RFC8259][rfc-8259].

**Lưu ý quan trọng đối với số nguyên 64 bit:** JavaScript sẽ âm thầm cắt bớt các số nguyên lớn hơn `Number.MAX_SAFE_INTEGER` (2^53-1) hoặc các số nhỏ hơn `Number.MIN_SAFE_INTEGER` (-2^53+1). Nếu dịch vụ được kỳ vọng trả về các giá trị nguyên nằm ngoài khoảng giá trị an toàn, hãy cân nhắc nghiêm túc việc trả về giá trị dưới dạng string để tối đa hóa khả năng tương tác và tránh mất dữ liệu.

### 11.2. Hướng dẫn cho ngày và giờ
#### 11.2.1. Sinh ngày
Dịch vụ MUST sinh ngày theo định dạng `DateLiteral`, và SHOULD dùng định dạng `Iso8601Literal` trừ khi có lý do thuyết phục để làm khác.
Các dịch vụ dùng định dạng `StructuredDateLiteral` MUST NOT sinh ngày với kind `T` trừ khi CẢ HAI điều kiện sau đều đúng: độ chính xác bổ sung là REQUIRED, và các client ECMAScript được nêu rõ là không được hỗ trợ.
(Phát biểu không mang tính quy chuẩn: khi quyết định chuẩn hóa theo `DateKind` cụ thể nào, thứ tự ưu tiên xấp xỉ là `E, C, U, W, O, X, I, T`.
Thứ tự này tối ưu cho lập trình viên ECMAScript, .NET và C++, theo đúng thứ tự đó.)

#### 11.2.2. Tiếp nhận ngày
Dịch vụ MUST chấp nhận ngày từ các client dùng cùng định dạng `DateLiteral` (bao gồm cả `DateKind`, nếu áp dụng) mà dịch vụ sinh ra, và SHOULD chấp nhận ngày theo bất kỳ định dạng `DateLiteral` nào.

#### 11.2.3. Tính tương thích
Dịch vụ MUST dùng cùng một định dạng `DateLiteral` (bao gồm cùng `DateKind`, nếu áp dụng) cho mọi resource cùng kiểu, và SHOULD dùng cùng một định dạng `DateLiteral` (và `DateKind`, nếu áp dụng) cho mọi resource trong toàn bộ dịch vụ.

Mọi thay đổi đối với định dạng `DateLiteral` mà dịch vụ sinh ra (bao gồm cả `DateKind`, nếu áp dụng) và mọi sự thu hẹp các định dạng `DateLiteral` (và `DateKind`, nếu áp dụng) mà dịch vụ chấp nhận MUST được coi là thay đổi gây phá vỡ tương thích (breaking change).
Mọi sự mở rộng các định dạng `DateLiteral` mà dịch vụ chấp nhận KHÔNG được coi là breaking change.

### 11.3. Tuần tự hóa ngày và giờ sang JSON
Việc tuần tự hóa rồi giải tuần tự hóa (round-trip) ngày bằng JSON là một bài toán khó.
Mặc dù ECMAScript hỗ trợ literal cho hầu hết các kiểu dựng sẵn, nó không định nghĩa định dạng literal cho ngày.
Web đã quy tụ về [tập con ECMAScript của các định dạng ngày ISO 8601 (ISO 8601)][iso-8601], nhưng có những tình huống mà định dạng này không phù hợp.
Với những trường hợp đó, tài liệu này định nghĩa một định dạng tuần tự hóa JSON có thể dùng để biểu diễn ngày một cách không mơ hồ ở các định dạng khác nhau.
Các định dạng tuần tự hóa khác (chẳng hạn XML) có thể được suy ra từ định dạng này.

#### 11.3.1. Định dạng `DateLiteral`
Ngày được biểu diễn trong JSON được tuần tự hóa theo văn phạm sau.
Một cách không chính thức, `DateValue` là một chuỗi theo định dạng ISO 8601 hoặc một đối tượng JSON chứa hai thuộc tính tên `kind` và `value`, cùng nhau xác định một thời điểm.
Đây không phải là văn phạm phi ngữ cảnh (context-free grammar); cụ thể, cách diễn giải `DateValue` phụ thuộc vào giá trị của `DateKind`, nhưng cách này giảm thiểu số lượng quy tắc sinh cần có để mô tả định dạng.

```
DateLiteral:
  Iso8601Literal
  StructuredDateLiteral

Iso8601Literal:
  A string literal as defined in https://www.ecma-international.org/ecma-262/5.1/#sec-15.9.1.15. Note that the full grammar for ISO 8601 (such as "basic format" without separators) is not supported.
  All dates default to UTC unless specified otherwise.

StructuredDateLiteral:
  { DateKindProperty , DateValueProperty }
  { DateValueProperty , DateKindProperty }

DateKindProperty
  "kind" : DateKind

DateKind:
  "C"            ; see below
  "E"            ; see below
  "I"            ; see below
  "O"            ; see below
  "T"            ; see below
  "U"            ; see below
  "W"            ; see below
  "X"            ; see below

DateValueProperty:
  "value" : DateValue

DateValue:
  UnsignedInteger        ; not defined here
  SignedInteger        ; not defined here
  RealNumber        ; not defined here
  Iso8601Literal        ; as above
```

#### 11.3.2. Bình luận về định dạng ngày
Một `DateLiteral` dùng quy tắc `Iso8601Literal` tương đối đơn giản.
Dưới đây là ví dụ về một đối tượng có thuộc tính tên `creationDate` được đặt là ngày 13 tháng 2 năm 2015, lúc 1:15 chiều UTC:

```json
{ "creationDate" : "2015-02-13T13:15Z" }
```

`StructuredDateLiteral` gồm một `DateKind` và một `DateValue` đi kèm, trong đó các giá trị hợp lệ (và cách diễn giải chúng) phụ thuộc vào `DateKind`. Bảng sau mô tả các tổ hợp hợp lệ và ý nghĩa của chúng:

DateKind | DateValue       | Tên gọi thông dụng & Diễn giải                                                                                                                    | Thông tin thêm
-------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------
C        | UnsignedInteger | "CLR"; số mili giây kể từ nửa đêm ngày 1 tháng 1 năm 0001; không cho phép giá trị âm. *Xem lưu ý bên dưới.*                                       | [MSDN][clr-time]
E        | SignedInteger   | "ECMAScript"; số mili giây kể từ nửa đêm ngày 1 tháng 1 năm 1970.                                                                                 | [ECMA International][ecmascript-time]
I        | Iso8601Literal  | "ISO 8601"; một chuỗi giới hạn trong tập con của ECMAScript.                                                                                      |
O        | RealNumber      | "OLE Date"; phần nguyên là số ngày kể từ nửa đêm ngày 31 tháng 12 năm 1899, và phần thập phân là thời gian trong ngày (0.5 = giữa trưa).          | [MSDN][ole-date]
T        | SignedInteger   | "Ticks"; số tick (các khoảng 100 nano giây) kể từ nửa đêm ngày 1 tháng 1 năm 1601. *Xem lưu ý bên dưới.*                                              | [MSDN][ticks-time]
U        | SignedInteger   | "UNIX"; số giây kể từ nửa đêm ngày 1 tháng 1 năm 1970.                                                                                            | [MSDN][unix-time]
W        | SignedInteger   | "Windows"; số mili giây kể từ nửa đêm ngày 1 tháng 1 năm 1601. *Xem lưu ý bên dưới.*                                                              | [MSDN][windows-time]
X        | RealNumber      | "Excel"; như `O` nhưng năm 1900 bị coi nhầm là năm nhuận, và ngày 0 là "January 0 (zero)".                                                       | [Microsoft Support][excel-time]

**Lưu ý quan trọng đối với kind `C` và `W`:** Thời gian gốc của CLR và Windows được biểu diễn bằng các giá trị "tick" 100 nano giây.
Để tương tác với các client ECMAScript có độ chính xác hạn chế, _các giá trị này MUST được chuyển đổi sang và từ mili giây_ khi được (giải) tuần tự hóa dưới dạng `DateLiteral`.
Một mili giây tương đương 10,000 tick.

**Lưu ý quan trọng đối với kind `T`:** Kind này giữ nguyên toàn bộ độ chính xác của các định dạng thời gian gốc của Windows (và có thể chuyển đổi dễ dàng sang và từ định dạng gốc của CLR) nhưng không tương thích với các client ECMAScript.
Do đó, việc dùng nó SHOULD chỉ giới hạn ở những kịch bản vừa yêu cầu độ chính xác bổ sung vừa không cần tương tác với các client ECMAScript.

Dưới đây là cùng ví dụ về một đối tượng có thuộc tính tên creationDate được đặt là ngày 13 tháng 2 năm 2015, lúc 1:15 chiều UTC, sử dụng nhiều định dạng:

```json
[
  { "creationDate" : { "kind" : "O", "value" : 42048.55 } },
  { "creationDate" : { "kind" : "E", "value" : 1423862100000 } }
]
```

Một trong những lợi ích của việc tách kind khỏi value là một khi client biết kind mà một dịch vụ cụ thể dùng, nó có thể diễn giải value mà không cần phân tích cú pháp thêm.
Trong trường hợp phổ biến khi value là một số, điều này giúp nhà phát triển viết code dễ dàng hơn:

```csharp
// We know this service always gives out ECMAScript-format dates
var date = new Date(serverResponse.someObject.creationDate.value);
```

### 11.4. Khoảng thời lượng (Durations)
[Khoảng thời lượng][wikipedia-iso8601-durations] cần được tuần tự hóa theo đúng [ISO 8601][wikipedia-iso8601-durations].
Khoảng thời lượng được "biểu diễn theo định dạng `P[n]Y[n]M[n]DT[n]H[n]M[n]S`."
Trích từ chuẩn:
- P là ký hiệu chỉ khoảng thời lượng (trước đây gọi là "period"), đặt ở đầu biểu diễn khoảng thời lượng.
- Y là ký hiệu chỉ năm, đứng sau giá trị số năm.
- M là ký hiệu chỉ tháng, đứng sau giá trị số tháng.
- W là ký hiệu chỉ tuần, đứng sau giá trị số tuần.
- D là ký hiệu chỉ ngày, đứng sau giá trị số ngày.
- T là ký hiệu chỉ thời gian, đứng trước các thành phần thời gian của biểu diễn.
- H là ký hiệu chỉ giờ, đứng sau giá trị số giờ.
- M là ký hiệu chỉ phút, đứng sau giá trị số phút.
- S là ký hiệu chỉ giây, đứng sau giá trị số giây.

Ví dụ, "P3Y6M4DT12H30M5S" biểu diễn một khoảng thời lượng "ba năm, sáu tháng, bốn ngày, mười hai giờ, ba mươi phút và năm giây."

### 11.5. Khoảng thời gian (Intervals)
[Khoảng thời gian][wikipedia-iso8601-intervals] được định nghĩa như một phần của [ISO 8601][wikipedia-iso8601-intervals].
- Thời điểm bắt đầu và kết thúc, ví dụ "2007-03-01T13:00:00Z/2008-05-11T15:30:00Z"
- Thời điểm bắt đầu và thời lượng, ví dụ "2007-03-01T13:00:00Z/P1Y2M10DT2H30M"
- Thời lượng và thời điểm kết thúc, ví dụ "P1Y2M10DT2H30M/2008-05-11T15:30:00Z"
- Chỉ có thời lượng, ví dụ "P1Y2M10DT2H30M", kèm thông tin ngữ cảnh bổ sung

### 11.6. Khoảng thời gian lặp lại
[Khoảng thời gian lặp lại][wikipedia-iso8601-repeatingintervals], theo [ISO 8601][wikipedia-iso8601-repeatingintervals], là:

> Được tạo thành bằng cách thêm "R[n]/" vào đầu một biểu thức khoảng thời gian, trong đó R được dùng đúng như chữ cái đó và [n] được thay bằng số lần lặp lại.
Bỏ qua giá trị [n] nghĩa là số lần lặp lại không giới hạn.

Ví dụ, để lặp lại khoảng thời gian "P1Y2M10DT2H30M" năm lần, bắt đầu từ "2008-03-01T13:00:00Z", hãy dùng "R5/2008-03-01T13:00:00Z/P1Y2M10DT2H30M."

## 12. Đánh phiên bản
**Mọi API tuân thủ Microsoft REST API Guidelines MUST hỗ trợ đánh phiên bản tường minh.** Điều quan trọng là client có thể trông cậy vào sự ổn định của dịch vụ theo thời gian, và điều quan trọng không kém là dịch vụ có thể bổ sung tính năng và thực hiện thay đổi.

### 12.1. Các định dạng phiên bản
Dịch vụ được đánh phiên bản theo lược đồ Major.Minor.
Dịch vụ MAY chọn lược đồ chỉ có "Major", khi đó ".0" được ngầm hiểu và mọi quy tắc khác trong mục này vẫn áp dụng.
Có hai cách được hỗ trợ để chỉ định phiên bản của một REST API request:
- Nhúng trong đường dẫn của URL request, ở cuối service root: `https://api.contoso.com/v1.0/products/users`
- Dưới dạng tham số query string của URL: `https://api.contoso.com/products/users?api-version=1.0`

Hướng dẫn để chọn giữa hai cách như sau:

1. Các dịch vụ cùng nằm sau một DNS endpoint MUST dùng cùng một cơ chế đánh phiên bản.
2. Trong kịch bản này, trải nghiệm người dùng nhất quán trên toàn endpoint là điều tối quan trọng. Microsoft REST API Guidelines Working Group khuyến nghị không tạo các DNS endpoint cấp cao nhất mới nếu chưa có trao đổi tường minh với ban lãnh đạo của tổ chức bạn.
3. Các dịch vụ đảm bảo tính ổn định của đường dẫn URL REST API của mình, kể cả qua các phiên bản tương lai của API, MAY áp dụng cơ chế tham số query string. Điều này có nghĩa là cách đặt tên và cấu trúc của các quan hệ được mô tả trong API không thể thay đổi sau khi API được phát hành, kể cả giữa các phiên bản có thay đổi gây phá vỡ tương thích (breaking change).
4. Các dịch vụ không thể đảm bảo tính ổn định của đường dẫn URL qua các phiên bản tương lai MUST nhúng phiên bản vào đường dẫn URL.

Một số dịch vụ nền tảng như Azure Active Directory của Microsoft có thể được phơi bày sau nhiều endpoint.
Các dịch vụ như vậy MUST hỗ trợ cơ chế đánh phiên bản của từng endpoint, kể cả khi điều đó đồng nghĩa với việc hỗ trợ nhiều cơ chế đánh phiên bản.

#### 12.1.1. Đánh phiên bản theo nhóm
Đánh phiên bản theo nhóm là một tính năng OPTIONAL mà dịch vụ MAY cung cấp khi dùng cơ chế tham số query string.
Group version cho phép nhóm logic các endpoint của API dưới một định danh phiên bản chung.
Nhờ đó nhà phát triển chỉ cần tra cứu một số phiên bản duy nhất và dùng nó cho nhiều endpoint.
Số group version là giá trị đã biết trước, và dịch vụ SHOULD từ chối mọi giá trị không nhận ra.

Bên trong, dịch vụ sẽ lấy một Group Version và ánh xạ nó sang phiên bản Major.Minor phù hợp.

Định dạng Group Version được định nghĩa là YYYY-MM-DD, ví dụ 2012-12-07 cho ngày 7 tháng 12 năm 2012. Định dạng đánh phiên bản theo ngày này chỉ áp dụng cho Group Version và SHOULD NOT được dùng thay thế cho cách đánh phiên bản Major.Minor.

##### Ví dụ về đánh phiên bản theo nhóm

| Nhóm       | Major.Minor |
|:-----------|:------------|
| 2012-12-01 | 1.0         |
|            | 1.1         |
|            | 1.2         |
| 2013-03-21 | 1.0         |
|            | 2.0         |
|            | 3.0         |
|            | 3.1         |
|            | 3.2         |
|            | 3.3         |

Định dạng phiên bản          | Ví dụ                  | Diễn giải
----------------------------- | ---------------------- | ------------------------------------------
{groupVersion}                | 2013-03-21, 2012-12-01 | 3.3, 1.2
{majorVersion}                | 3                      | 3.0
{majorVersion}.{minorVersion} | 1.2                    | 1.2

Client có thể chỉ định group version hoặc phiên bản Major.Minor:

Ví dụ:

```http
GET http://api.contoso.com/acct1/c1/blob2?api-version=1.0
```

```http
PUT http://api.contoso.com/acct1/c1/b2?api-version=2011-12-07
```

### 12.2. Khi nào cần đánh phiên bản
Dịch vụ MUST tăng số phiên bản khi có bất kỳ thay đổi API gây phá vỡ tương thích nào.
Xem mục tiếp theo để biết thảo luận chi tiết về những gì cấu thành một breaking change.
Dịch vụ MAY tăng số phiên bản cả với những thay đổi không gây phá vỡ tương thích, nếu muốn.

Hãy dùng số phiên bản major mới để báo hiệu rằng việc hỗ trợ các client hiện có sẽ bị ngừng trong tương lai.
Khi giới thiệu phiên bản major mới, dịch vụ MUST cung cấp lộ trình nâng cấp rõ ràng cho các client hiện có và xây dựng kế hoạch ngừng hỗ trợ phù hợp với chính sách của nhóm kinh doanh của mình.
Dịch vụ SHOULD dùng số phiên bản minor mới cho mọi thay đổi khác.

Tài liệu trực tuyến của các dịch vụ có phiên bản MUST cho biết trạng thái hỗ trợ hiện tại của từng phiên bản API trước đó và cung cấp đường dẫn đến phiên bản mới nhất.

### 12.3. Định nghĩa về thay đổi gây phá vỡ tương thích
Các thay đổi đối với contract của một API được coi là breaking change.
Các thay đổi ảnh hưởng đến khả năng tương thích ngược của một API là breaking change.

Các nhóm MAY định nghĩa khả năng tương thích ngược theo nhu cầu kinh doanh của mình.
Ví dụ, Azure định nghĩa việc thêm một trường JSON mới vào response là không tương thích ngược.
Office 365 có định nghĩa về khả năng tương thích ngược lỏng hơn và cho phép thêm các trường JSON vào response.

Các ví dụ rõ ràng về breaking change:

1. Xóa hoặc đổi tên API hoặc tham số API
2. Thay đổi hành vi của một API hiện có
3. Thay đổi mã lỗi và Fault Contract
4. Bất cứ điều gì vi phạm [Nguyên tắc ít gây ngạc nhiên nhất (Principle of Least Astonishment)][principle-of-least-astonishment]

Dịch vụ MUST định nghĩa tường minh thế nào là breaking change, đặc biệt đối với việc thêm trường mới vào response JSON và thêm đối số API mới có trường mặc định.
Các dịch vụ cùng nằm sau một DNS Endpoint với các dịch vụ khác MUST nhất quán trong việc định nghĩa khả năng mở rộng của contract.

Các thay đổi áp dụng được mô tả [trong mục này của đặc tả OData V4][odata-breaking-changes] SHOULD được xem là một phần của ngưỡng tối thiểu mà mọi dịch vụ MUST coi là breaking change.

## 13. Thao tác chạy lâu
Thao tác chạy lâu, đôi khi được gọi là thao tác bất đồng bộ (async), thường mang nghĩa khác nhau với những người khác nhau.
Mục này đưa ra hướng dẫn về các loại thao tác chạy lâu khác nhau, đồng thời mô tả giao thức truyền tải (wire protocol) và các thực hành tốt nhất cho những loại thao tác này.

1. Một hoặc nhiều client MUST có thể theo dõi và thao tác trên cùng một resource tại cùng một thời điểm.
2. Trạng thái của hệ thống SHOULD có thể được khám phá và kiểm tra bất cứ lúc nào. Client SHOULD có thể xác định trạng thái hệ thống ngay cả khi resource theo dõi thao tác không còn hoạt động. Bản thân việc truy vấn trạng thái của một thao tác chạy lâu cũng nên tận dụng các nguyên tắc của web, tức là các resource được định nghĩa rõ ràng với ngữ nghĩa giao diện thống nhất. Client MAY gửi GET đến một resource nào đó để xác định trạng thái của một thao tác chạy lâu
3. Thao tác chạy lâu SHOULD hoạt động được cho cả client muốn "gửi rồi bỏ qua" (Fire and Forget) lẫn client muốn chủ động theo dõi và xử lý kết quả.
4. Hủy bỏ không nhất thiết có nghĩa là rollback. Tùy từng trường hợp do API quy định, nó có thể có nghĩa là rollback, bù trừ (compensation), hoàn tất, hoàn tất một phần, v.v. Sau một thao tác bị hủy, SHOULD NOT là trách nhiệm của client phải đưa dịch vụ về trạng thái nhất quán để có thể tiếp tục phục vụ.

### 13.1. Thao tác chạy lâu dựa trên resource (RELO)
Mô hình hóa dựa trên resource là cách trạng thái của thao tác được mã hóa trong resource và giao thức truyền tải được dùng là giao thức đồng bộ tiêu chuẩn.
Trong mô hình này, các chuyển trạng thái được định nghĩa rõ ràng và các trạng thái đích cũng được định nghĩa tương tự.

_Đây là mô hình ưu tiên cho thao tác chạy lâu và nên được dùng ở bất cứ đâu có thể._ Việc tránh được sự phức tạp và cơ chế của LRO Wire Protocol giúp mọi thứ đơn giản hơn cho người dùng và chuỗi công cụ của chúng ta.

Một ví dụ là khởi động lại máy: bản thân thao tác hoàn tất đồng bộ nhưng GET trên resource máy ảo sẽ có "state: Rebooting", "state: Running" và có thể được truy vấn bất cứ lúc nào.

Mô hình này MAY tích hợp Push Notification.

Trong khi hầu hết các thao tác nhiều khả năng dùng ngữ nghĩa POST, ngoài ngữ nghĩa POST, dịch vụ MAY hỗ trợ ngữ nghĩa PUT thông qua định tuyến để đơn giản hóa API của mình.
Ví dụ, người dùng muốn tạo một cơ sở dữ liệu tên "db1" có thể gọi:

```http
PUT https://api.contoso.com/v1.0/databases/db1
```

Trong kịch bản này, segment databases xử lý thao tác PUT.

Dịch vụ MAY cũng dùng mô hình lai (hybrid) được định nghĩa bên dưới.

### 13.2. Thao tác chạy lâu theo từng bước (stepwise)
Thao tác stepwise là thao tác mất nhiều thời gian, thường không thể dự đoán, để hoàn tất, và không cung cấp chuyển trạng thái được mô hình hóa trong resource.
Mục này nêu cách tiếp cận mà dịch vụ nên dùng để phơi bày các thao tác chạy lâu như vậy.

Dịch vụ MAY phơi bày các thao tác stepwise.

> Thao tác chạy lâu stepwise đôi khi được gọi là thao tác "Async".
Điều này gây nhầm lẫn, vì nó trộn lẫn các yếu tố của nền tảng ("Async / await", "promises", "futures") với các yếu tố của thao tác API.
Tài liệu này dùng thuật ngữ "Stepwise Long Running Operation" hoặc thường chỉ là "Stepwise Operation" để tránh nhầm lẫn về từ "Async".

Dịch vụ MUST thực hiện càng nhiều bước kiểm tra hợp lệ đồng bộ càng tốt trong thực tế đối với các request stepwise.
Dịch vụ MUST ưu tiên trả lỗi theo cách đồng bộ, với mục tiêu là chỉ các thao tác "hợp lệ" mới được xử lý bằng giao thức truyền tải của thao tác chạy lâu.

Với một API được định nghĩa là Stepwise Long Running Operation, dịch vụ MUST đi qua luồng Stepwise Long Running Operation ngay cả khi thao tác có thể hoàn tất ngay lập tức.
Nói cách khác, API phải chọn một mẫu thiết kế LRO và giữ nhất quán, không thay đổi mẫu theo hoàn cảnh.

#### 13.2.1. PUT
Dịch vụ MAY cho phép request PUT để tạo entity.

```http
PUT https://api.contoso.com/v1.0/databases/db1
```

Trong kịch bản này, segment _databases_ xử lý thao tác PUT.

```http
HTTP/1.1 202 Accepted
Operation-Location: https://api.contoso.com/v1.0/operations/123
```

Với các dịch vụ cần trả về 201 Created ở đây, hãy dùng luồng hybrid được mô tả bên dưới.

202 Accepted không nên trả về body.
Trường hợp 201 Created nên trả về body của resource đích.

#### 13.2.2. POST
Dịch vụ MAY cho phép request POST để tạo entity.

```http
POST https://api.contoso.com/v1.0/databases/

{
  "fileName": "someFile.db",
  "color": "red"
}
```

```http
HTTP/1.1 202 Accepted
Operation-Location: https://api.contoso.com/v1.0/operations/123
```

#### 13.2.3. POST, mô hình hybrid
Dịch vụ MAY phản hồi đồng bộ cho các request POST đến collection để tạo resource, ngay cả khi resource chưa được tạo hoàn chỉnh tại thời điểm tạo response.
Để dùng mẫu thiết kế này, response MUST bao gồm biểu diễn của resource chưa hoàn chỉnh và một chỉ báo cho biết nó chưa hoàn chỉnh.

Ví dụ:

```http
POST https://api.contoso.com/v1.0/databases/ HTTP/1.1
Host: api.contoso.com
Content-Type: application/json
Accept: application/json

{
  "fileName": "someFile.db",
  "color": "red"
}
```

Response của dịch vụ cho biết cơ sở dữ liệu đã được tạo, nhưng chỉ ra rằng request chưa hoàn tất bằng cách đưa vào header Operation-Location.
Trong trường hợp này, thuộc tính status trong payload của response cũng cho biết thao tác chưa hoàn tất hoàn toàn.

```http
HTTP/1.1 201 Created
Location: https://api.contoso.com/v1.0/databases/db1
Operation-Location: https://api.contoso.com/v1.0/operations/123

{
  "databaseName": "db1",
  "color": "red",
  "Status": "Provisioning",
  [ … other fields for "database" …]
}
```

#### 13.2.4. Operations resource
Dịch vụ MAY cung cấp một resource "/operations" ở cấp tenant.

Các dịch vụ cung cấp resource "/operations" MUST cung cấp ngữ nghĩa GET.
GET MUST liệt kê tập các thao tác, tuân theo ngữ nghĩa phân trang, sắp xếp và lọc tiêu chuẩn.
Thứ tự sắp xếp mặc định cho thao tác này MUST là:

Sắp xếp chính          | Sắp xếp phụ
---------------------- | -----------------------
Thao tác chưa bắt đầu  | Thời điểm tạo thao tác
Thao tác đang chạy     | Thời điểm tạo thao tác
Thao tác đã hoàn tất   | Thời điểm tạo thao tác

Lưu ý rằng "Thao tác đã hoàn tất" là một trạng thái đích (xem bên dưới), và thực tế có thể là bất kỳ trạng thái nào trong nhiều trạng thái khác nhau như "successful", "cancelled", "failed", v.v.

#### 13.2.5. Operation resource
Một operation là resource mà người dùng có thể định địa chỉ, dùng để theo dõi một thao tác chạy lâu stepwise.
Operation MUST hỗ trợ ngữ nghĩa GET.
Thao tác GET trên một operation MUST trả về:

1. Operation resource, trạng thái của nó và mọi trạng thái mở rộng liên quan đến API cụ thể đó.
2. 200 OK làm mã response.

Dịch vụ MAY hỗ trợ hủy operation bằng cách phơi bày DELETE trên operation đó.
Nếu được hỗ trợ, các thao tác DELETE MUST là idempotent.

> Lưu ý: Từ góc độ thiết kế API, hủy bỏ không nhất thiết có nghĩa là rollback.
Tùy từng trường hợp do API quy định, nó có thể có nghĩa là rollback, bù trừ (compensation), hoàn tất, hoàn tất một phần, v.v.
Sau một thao tác bị hủy, SHOULD NOT là trách nhiệm của client phải đưa dịch vụ về trạng thái nhất quán để có thể tiếp tục phục vụ.

Các dịch vụ không hỗ trợ hủy operation MUST trả về 405 Method Not Allowed khi nhận DELETE.

Operation MUST hỗ trợ các trạng thái sau:

1. NotStarted
2. Running
3. Succeeded. Trạng thái kết thúc.
4. Failed. Trạng thái kết thúc.

Dịch vụ MAY thêm các trạng thái bổ sung, chẳng hạn "Cancelled" hoặc "Partially Completed". Các dịch vụ hỗ trợ hủy MUST mô tả đầy đủ việc hủy của mình sao cho trạng thái của hệ thống có thể được xác định chính xác và mọi hành động bù trừ có thể được chạy.

Các dịch vụ hỗ trợ trạng thái bổ sung nên cân nhắc danh sách tên chuẩn này và tránh tạo tên mới nếu có thể: Cancelling, Cancelled, Aborting, Aborted, Tombstone, Deleting, Deleted.

Operation MUST chứa, và cung cấp trong response GET, các thông tin sau:

1. Dấu thời gian khi operation được tạo.
2. Dấu thời gian khi trạng thái hiện tại bắt đầu.
3. Trạng thái của operation (notstarted / running / completed).

Dịch vụ MAY thêm các trường bổ sung, riêng cho từng API, vào operation.
JSON trạng thái operation được trả về có dạng:

```json
{
  "createdDateTime": "2015-06-19T12-01-03.45Z",
  "lastActionDateTime": "2015-06-19T12-01-03.45Z",
  "status": "notstarted | running | succeeded | failed"
}
```

##### Phần trăm hoàn thành
Đôi khi dịch vụ không thể biết chính xác khi nào một thao tác sẽ hoàn tất.
Điều này khiến việc dùng header Retry-After trở nên có vấn đề.
Trong trường hợp đó, dịch vụ MAY đưa vào JSON operationStatus một trường phần trăm hoàn thành.

```json
{
  "createdDateTime": "2015-06-19T12-01-03.45Z",
  "percentComplete": "50",
  "status": "running"
}
```

Trong ví dụ này, server đã cho client biết rằng thao tác chạy lâu đã hoàn thành 50%.

##### Vị trí của resource đích
Với các thao tác tạo ra hoặc thao tác trên một resource, dịch vụ MUST đưa vị trí của resource đích vào trạng thái khi thao tác hoàn tất.

```json
{
  "createdDateTime": "2015-06-19T12-01-03.45Z",
  "lastActionDateTime": "2015-06-19T12-06-03.0024Z",
  "status": "succeeded",
  "resourceLocation": "https://api.contoso.com/v1.0/databases/db1"
}
```

#### 13.2.6. Operation tombstone
Dịch vụ MAY chọn hỗ trợ các operation tombstone.
Dịch vụ MAY chọn xóa các tombstone sau một khoảng thời gian do dịch vụ định nghĩa.

#### 13.2.7. Luồng điển hình, polling
- Client gọi một thao tác stepwise bằng cách gọi một action dùng POST
- Server MUST cho biết request đã được bắt đầu bằng cách phản hồi với status code 202 Accepted. Response SHOULD bao gồm header location chứa URL mà client nên polling để lấy kết quả sau khi chờ số giây được chỉ định trong header Retry-After.
- Client polling location cho đến khi nhận được response 200 với trạng thái operation kết thúc.

##### Ví dụ về luồng điển hình, polling
Client gọi action restart:

```http
POST https://api.contoso.com/v1.0/databases HTTP/1.1
Accept: application/json

{
  "fromFile": "myFile.db",
  "color": "red"
}
```

Response của server cho biết request đã được tạo.

```http
HTTP/1.1 202 Accepted
Operation-Location: https://api.contoso.com/v1.0/operations/123
```

Client chờ một khoảng thời gian rồi gọi một request khác để cố lấy trạng thái operation.

```http
GET https://api.contoso.com/v1.0/operations/123
Accept: application/json
```

Server phản hồi rằng kết quả vẫn chưa sẵn sàng và có thể kèm khuyến nghị chờ 30 giây.

```http
HTTP/1.1 200 OK
Retry-After: 30

{
  "createdDateTime": "2015-06-19T12-01-03.4Z",
  "status": "running"
}
```

Client chờ 30 giây như khuyến nghị rồi gọi một request khác để lấy kết quả của operation.

```http
GET https://api.contoso.com/v1.0/operations/123
Accept: application/json
```

Server phản hồi bằng một operation "status:succeeded" có kèm vị trí resource.

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "createdDateTime": "2015-06-19T12-01-03.45Z",
  "lastActionDateTime": "2015-06-19T12-06-03.0024Z",
  "status": "succeeded",
  "resourceLocation": "https://api.contoso.com/v1.0/databases/db1"
}
```

#### 13.2.8. Luồng điển hình, push notification
1. Client gọi một thao tác chạy lâu bằng cách gọi một action dùng POST. Client đã thiết lập sẵn push notification trên resource cha.
2. Dịch vụ cho biết request đã được bắt đầu bằng cách phản hồi với status code 202 Accepted. Client bỏ qua mọi thứ còn lại.
3. Khi toàn bộ thao tác hoàn tất, dịch vụ đẩy một notification thông qua subscription trên resource cha.
4. Client lấy kết quả của thao tác qua URL của resource.

##### Ví dụ về luồng điển hình, push notification với subscription hiện có
Client gọi action backup.
Client đã có sẵn subscription push notification được thiết lập cho db1.

```http
POST https://api.contoso.com/v1.0/databases/db1?backup HTTP/1.1
Accept: application/json
```

Response của server cho biết request đã được chấp nhận.

```http
HTTP/1.1 202 Accepted
Operation-Location: https://api.contoso.com/v1.0/operations/123
```

Bên gọi bỏ qua mọi header trong response trả về.

URL đích nhận một push notification khi thao tác hoàn tất.


```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "value": [
    {
      "subscriptionId": "1234-5678-1111-2222",
      "context": "subscription context that was specified at setup",
      "resourceUrl": "https://api.contoso.com/v1.0/databases/db1",
      "userId" : "contoso.com/user@contoso.com",
      "tenantId" : "contoso.com"
    }
  ]
}
```

#### 13.2.9. Retry-After
Trong các ví dụ ở trên, header Retry-After cho biết số giây mà client nên chờ trước khi thử lấy kết quả từ URL được xác định bởi header location.

Đặc tả HTTP cho phép header Retry-After chỉ định thay thế bằng một ngày HTTP (HTTP date), vì vậy client cũng nên sẵn sàng xử lý trường hợp này.

```http
HTTP/1.1 202 Accepted
Operation-Location: http://api.contoso.com/v1.0/operations/123
Retry-After: 60
```

Lưu ý: Việc dùng HTTP Date không nhất quán với định dạng ngày ISO 8601 được dùng xuyên suốt tài liệu này, nhưng được định nghĩa tường minh bởi chuẩn HTTP trong [RFC 7231][rfc-7231-7-1-1-1]. Dịch vụ SHOULD ưu tiên định dạng số nguyên giây (hệ thập phân) hơn định dạng HTTP date.

### 13.3. Chính sách lưu giữ kết quả của thao tác
Trong một số tình huống, kết quả của một thao tác chạy lâu không phải là một resource có thể định địa chỉ.
Ví dụ, nếu bạn gọi một Action chạy lâu trả về giá trị Boolean (thay vì một resource).
Trong những tình huống này, header Location trỏ đến nơi có thể lấy kết quả Boolean.

Điều này đặt ra câu hỏi: "Kết quả của thao tác nên được lưu giữ trong bao lâu?"

Thời gian lưu giữ tối thiểu được khuyến nghị là 24 giờ.

Operation SHOULD chuyển sang trạng thái "tombstone" trong một khoảng thời gian bổ sung trước khi bị xóa hẳn khỏi hệ thống.

## 14. Throttling, hạn ngạch (Quotas) và giới hạn (Limits)
### 14.1. Nguyên tắc
Dịch vụ nên phản hồi nhanh nhất có thể để không chặn bên gọi.
Theo nguyên tắc kinh nghiệm, bất kỳ lệnh gọi API nào dự kiến mất hơn 0,5 giây ở phân vị thứ 99 nên cân nhắc dùng mẫu thiết kế Long-running Operations cho các lệnh gọi đó.
Hiển nhiên, dịch vụ không thể đảm bảo các thời gian phản hồi này khi đối mặt với tải có thể là không giới hạn từ bên gọi. Do đó dịch vụ nên thiết kế và ghi tài liệu các giới hạn request cho client, và phản hồi bằng các lỗi và thông báo lỗi phù hợp, có thể hành động được nếu vượt quá các giới hạn này.
Dịch vụ nên nhanh chóng phản hồi bằng lỗi khi nói chung bị quá tải, thay vì chỉ phản hồi chậm.
Cuối cùng, nhiều dịch vụ sẽ có hạn ngạch cho số lệnh gọi, có thể là số thao tác mỗi giờ hoặc mỗi ngày, thường liên quan đến gói dịch vụ hoặc giá.
Khi vượt quá các hạn ngạch này, dịch vụ cũng phải cung cấp ngay các lỗi có thể hành động được.
Hạn ngạch và giới hạn nên được xác định phạm vi theo một đơn vị khách hàng: một subscription, một tenant, một ứng dụng, một gói, hoặc nếu không có định danh nào khác thì là một dải địa chỉ ip…tùy theo mục tiêu của dịch vụ, để tải được chia sẻ hợp lý và một đơn vị không gây ảnh hưởng đến đơn vị khác.

### 14.2. Mã trả về (429 so với 503)
HTTP quy định hai mã trả về cho các tình huống này: '429 Too Many Requests' và '503 Service Unavailable'.
Dịch vụ nên dùng 429 trong các trường hợp client gọi quá nhiều và có thể khắc phục tình hình bằng cách thay đổi mẫu gọi của mình.
Dịch vụ nên phản hồi 503 trong các trường hợp tải chung hoặc các vấn đề khác nằm ngoài tầm kiểm soát của từng bên gọi là nguyên nhân khiến dịch vụ trở nên chậm.
Trong mọi trường hợp, dịch vụ cũng nên cung cấp thông tin gợi ý bên gọi nên chờ bao lâu trước khi thử lại.
Client nên tuân thủ các header này và cũng triển khai các kỹ thuật xử lý lỗi tạm thời (transient fault) khác.
Tuy nhiên, có thể có những client chỉ đơn giản thử lại ngay lập tức khi thất bại, có khả năng làm tăng tải lên dịch vụ.
Để xử lý điều này, dịch vụ nên được thiết kế sao cho việc trả về 429 hoặc 503 tốn ít chi phí nhất có thể, bằng cách đặt mã fastpath đặc biệt, hoặc lý tưởng là dựa vào một frontdoor hoặc load balancer chung cung cấp chức năng này.

### 14.3. Header Retry-After và RateLimit
Header Retry-After là cách tiêu chuẩn để phản hồi cho các client đang bị throttle.
Cũng phổ biến, nhưng không bắt buộc, trong trường hợp giới hạn và hạn ngạch (nhưng không phải tải hệ thống chung) là phản hồi kèm header mô tả giới hạn đã bị vượt quá.
Tuy nhiên, các dịch vụ trong Microsoft và trong ngành sử dụng nhiều loại header khác nhau cho mục đích này.
Chúng tôi khuyến nghị dùng ba header để mô tả giới hạn, số lệnh gọi còn lại trong giới hạn và thời điểm giới hạn được đặt lại.
Tuy nhiên, các header khác có thể phù hợp với một số loại giới hạn cụ thể. Trong mọi trường hợp, chúng phải được ghi tài liệu.

### 14.4. Hướng dẫn cho dịch vụ
Dịch vụ nên chọn các khung thời gian phù hợp với SLA hoặc mục tiêu kinh doanh.
Trong trường hợp hạn ngạch, thời gian Retry-After và khung thời gian có thể rất dài (hàng giờ, hàng ngày, hàng tuần, thậm chí hàng tháng. Dịch vụ dùng 429 để cho biết bên gọi cụ thể đã gọi quá nhiều, và 503 để cho biết dịch vụ đang giảm tải (load shedding) nhưng đó không phải trách nhiệm của bên gọi.

#### 14.4.1. Khả năng phản hồi
1. Dịch vụ MUST phản hồi nhanh trong mọi hoàn cảnh, kể cả khi đang chịu tải.
2. Các lệnh gọi mất hơn 1 giây để phản hồi ở phân vị thứ 99 SHOULD dùng mẫu thiết kế Long-Running Operation
3. Các lệnh gọi mất hơn 0,5 giây để phản hồi ở phân vị thứ 99 nên cân nhắc nghiêm túc mẫu thiết kế LRO
4. Dịch vụ SHOULD NOT đưa vào các lệnh sleep, tạm dừng, v.v. làm chặn bên gọi hoặc không thể hành động được (“tar-pitting”).

#### 14.4.2. Giới hạn tốc độ và hạn ngạch
Khi một bên gọi đã gọi quá nhiều

1. Dịch vụ MUST trả về mã 429
2. Dịch vụ MUST trả về một response lỗi tiêu chuẩn mô tả cụ thể để lập trình viên có thể thực hiện các thay đổi phù hợp
3. Dịch vụ MUST trả về header Retry-After cho biết client nên chờ bao lâu trước khi thử lại
4. Dịch vụ MAY trả về các header RateLimit ghi lại giới hạn hoặc hạn ngạch đã bị vượt quá
5. Dịch vụ MAY trả về RateLimit-Limit: số lệnh gọi client được phép thực hiện trong một khung thời gian
6. Dịch vụ MAY trả về RateLimit-Remaining: số lệnh gọi còn lại trong khung thời gian
7. Dịch vụ MAY trả về RateLimit-Reset: thời điểm khung thời gian được đặt lại, tính bằng giây epoch UTC
8. Dịch vụ MAY trả về các header RateLimit khác dành riêng cho dịch vụ khi phù hợp để cung cấp thông tin chi tiết hơn hoặc các giới hạn hay hạn ngạch cụ thể

#### 14.4.3. Dịch vụ bị quá tải
Khi dịch vụ nói chung bị quá tải và đang giảm tải (load shedding)

1. Dịch vụ MUST trả về mã 503
2. Dịch vụ MUST trả về một response lỗi tiêu chuẩn (xem 7.10.2) mô tả cụ thể để lập trình viên có thể thực hiện các thay đổi phù hợp
3. Dịch vụ MUST trả về header Retry-After cho biết client nên chờ bao lâu trước khi thử lại
4. Trong trường hợp 503, dịch vụ SHOULD NOT trả về các header RateLimit

#### 14.4.4. Response ví dụ

```http
HTTP/1.1 429 Too Many Requests
Content-Type: application/json
Retry-After: 5
RateLimit-Limit: 1000
RateLimit-Remaining: 0
RateLimit-Reset: 1538152773
{
  "error": {
    "code": "requestLimitExceeded",
    "message": "The caller has made too many requests in the time period.",
    "details": {
      "code": "RateLimit",
       "limit": "1000",
       "remaining": "0",
       "reset": "1538152773",
      }
    }
}
```

### 14.5. Hướng dẫn cho bên gọi
Bên gọi bao gồm mọi người dùng của API: công cụ, portal, các dịch vụ khác, không chỉ client của người dùng

1. Bên gọi MUST chờ tối thiểu khoảng thời gian được nêu trong response có Retry-After trước khi thử lại một request.
2. Bên gọi MAY giả định rằng request có thể thử lại sau khi nhận được response có header Retry-After mà không cần thay đổi gì ở request.
3. Client SHOULD dùng các SDK dùng chung và các thư viện transient fault phổ biến để triển khai đúng hành vi

Xem: https://docs.microsoft.com/en-us/azure/architecture/best-practices/transient-faults

### 14.6. Xử lý các bên gọi bỏ qua header Retry-After
Lý tưởng nhất, các lần trả về 429 và 503 có chi phí thấp đến mức ngay cả các client thử lại ngay lập tức cũng có thể được xử lý.
Trong những trường hợp này, nếu có thể, nhóm dịch vụ nên nỗ lực liên hệ hoặc sửa client đó.
Nếu đó là một đối tác đã biết, nên tạo bug hoặc incident.
Trong những trường hợp cực đoan, có thể cần dùng các biện pháp bảo vệ kiểu DoS như chặn bên gọi.

## 15. Push notification qua webhook
### 15.1. Phạm vi
Dịch vụ MAY triển khai push notification qua web hook.
Mục này đề cập đến kịch bản chính sau:

> Push notification qua HTTP Callback, thường được gọi là Web Hook, đến các server có thể định địa chỉ công khai.

Cách tiếp cận được nêu ra được chọn nhờ tính đơn giản, khả năng áp dụng rộng rãi và rào cản gia nhập thấp đối với bên đăng ký dịch vụ.
Nó được dự định là một tập yêu cầu tối thiểu và là điểm khởi đầu cho các chức năng bổ sung.

### 15.2. Nguyên tắc
Các nguyên tắc cốt lõi cho các dịch vụ hỗ trợ web hook là:

1. Dịch vụ MUST triển khai ít nhất mô hình poke/pull. Trong mô hình poke/pull, một notification được gửi đến client, sau đó client gửi request để lấy trạng thái hiện tại hoặc bản ghi thay đổi kể từ notification gần nhất của họ. Cách tiếp cận này tránh được các phức tạp về thứ tự thông điệp, thông điệp bị bỏ lỡ và tập thay đổi.  Dịch vụ MAY thêm nhiều dữ liệu hơn để cung cấp notification phong phú.
2. Dịch vụ MUST triển khai giao thức challenge/response để cấu hình callback URL.
3. Dịch vụ SHOULD có một khoảng thời gian hết hạn (age-out) được khuyến nghị, với sự linh hoạt để dịch vụ thay đổi theo kịch bản.
4. Dịch vụ SHOULD cho phép các subscription đang phát sinh notification thành công tồn tại vô thời hạn và SHOULD khoan dung với các khoảng thời gian gián đoạn hợp lý.
5. Firehose subscription MUST chỉ được gửi qua HTTPS. Dịch vụ SHOULD yêu cầu các loại subscription khác phải dùng HTTPS. Xem mục "Security" để biết thêm chi tiết.

### 15.3. Các loại subscription
Có hai loại subscription, và dịch vụ MAY triển khai một trong hai, cả hai, hoặc không loại nào.
Các loại subscription được hỗ trợ là:

1. Firehose subscription – một subscription được tạo thủ công cho ứng dụng đăng ký, thường trong portal đăng ký ứng dụng.  Notification về hoạt động mà bất kỳ người dùng nào đã đồng ý cho ứng dụng nhận sẽ được gửi đến subscription duy nhất này.
2. Per-resource subscription – ứng dụng đăng ký dùng code để tạo subscription theo cách lập trình tại runtime cho một số entity riêng của người dùng.

Các dịch vụ hỗ trợ cả hai loại subscription SHOULD cung cấp trải nghiệm nhà phát triển khác biệt cho hai loại:

1. Firehose – Dịch vụ MUST NOT yêu cầu nhà phát triển phải viết code ngoại trừ để trực tiếp xác minh và phản hồi các notification.  Dịch vụ MUST cung cấp UI quản trị để quản lý subscription.  Dịch vụ SHOULD NOT giả định rằng người dùng cuối biết về subscription, mà chỉ biết về chức năng của ứng dụng đăng ký.
2. Per-user – Dịch vụ MUST cung cấp một API để nhà phát triển tạo và quản lý subscription như một phần của ứng dụng của họ, cũng như để xác minh và phản hồi các notification.  Dịch vụ MAY kỳ vọng người dùng cuối biết về các subscription và MUST cho phép người dùng cuối thu hồi các subscription được tạo trực tiếp để phản hồi các hành động của người dùng.

### 15.4. Chuỗi lệnh gọi
Chuỗi lệnh gọi cho firehose subscription MUST tuân theo sơ đồ bên dưới.
Nó cho thấy việc đăng ký thủ công ứng dụng và subscription, sau đó người dùng cuối sử dụng một trong các API của dịch vụ.
Ở phần này của luồng, hai thứ MUST được lưu trữ:

1. Dịch vụ MUST lưu hành động đồng ý của người dùng cuối về việc nhận notification từ ứng dụng cụ thể này (thường là một OAUTH scope cho việc sử dụng nền).
2. Ứng dụng đăng ký MUST lưu token của người dùng cuối để gọi lại lấy chi tiết khi được thông báo về các thay đổi.

Phần cuối của chuỗi là chính luồng notification.

Hướng dẫn triển khai không mang tính quy chuẩn:  Một resource trong dịch vụ thay đổi và dịch vụ cần chạy logic sau:

1. Xác định tập người dùng có quyền truy cập resource, và do đó có thể kỳ vọng các ứng dụng nhận notification về nó thay mặt họ.
2. Xem những người dùng nào đã đồng ý nhận notification và từ những ứng dụng nào.
3. Xem những ứng dụng nào đã đăng ký firehose subscription.
4. Kết hợp (join) 1, 2, 3 để tạo ra tập notification cụ thể phải được gửi đến các ứng dụng.

Cần lưu ý rằng hành động đồng ý của người dùng và hành động thiết lập firehose subscription có thể xảy ra theo thứ tự bất kỳ.
Dịch vụ SHOULD gửi notification với việc thiết lập được xử lý theo thứ tự bất kỳ.

![Thiết lập firehose subscription][websequencediagram-firehose-subscription-setup]

Với per-user subscription, việc đăng ký ứng dụng là thủ công hoặc tự động.
Luồng lệnh gọi cho per-user subscription MUST tuân theo sơ đồ bên dưới.
Nó cho thấy người dùng cuối sử dụng một trong các API của dịch vụ, và một lần nữa, hai thứ giống nhau MUST được lưu trữ:

1. Dịch vụ MUST lưu hành động đồng ý của người dùng cuối về việc nhận notification từ ứng dụng cụ thể này (thường là một OAUTH scope cho việc sử dụng nền).
2. Ứng dụng đăng ký MUST lưu token của người dùng cuối để gọi lại lấy chi tiết khi được thông báo về các thay đổi.

Trong trường hợp này, subscription được thiết lập theo cách lập trình bằng token của người dùng cuối từ ứng dụng đăng ký.
Ứng dụng MUST lưu ID của subscription đã đăng ký cùng với token của người dùng.

Hướng dẫn triển khai không mang tính quy chuẩn: Ở phần cuối của chuỗi, khi một mục dữ liệu trong dịch vụ thay đổi và dịch vụ cần chạy logic sau:

1. Tìm tập các subscription tương ứng, thông qua resource, với dữ liệu đã thay đổi.
2. Với các subscription được tạo dưới một token app+user, gửi một notification đến ứng dụng cho mỗi subscription kèm ID subscription và user id của người tạo subscription.
- Với các subscription được tạo bằng token chỉ có app, kiểm tra xem chủ sở hữu của dữ liệu đã thay đổi hoặc bất kỳ người dùng nào có thể thấy dữ liệu đã thay đổi có đồng ý nhận notification cho ứng dụng hay không, và nếu có thì gửi một tập notification theo từng user id đến ứng dụng cho mỗi subscription kèm ID subscription.

  ![Thiết lập user subscription][websequencediagram-user-subscription-setup]

### 15.5. Xác minh subscription
Khi các subscription thay đổi, dù theo cách lập trình hay để phản hồi thay đổi qua các portal UI quản trị, dịch vụ đăng ký cần được bảo vệ khỏi các lệnh gọi độc hại hoặc bất ngờ từ các dịch vụ đẩy khối lượng notification có thể rất lớn.

Với mọi subscription, dù là firehose hay per-user, dịch vụ MUST gửi một request xác minh như một phần của việc tạo hoặc sửa đổi qua portal UI hoặc API request, trước khi gửi bất kỳ notification nào khác.

Request xác minh MUST có định dạng sau, dưới dạng HTTP/HTTPS POST đến _notificationUrl_ của subscription.

```http
POST https://{notificationUrl}?validationToken={randomString}
ClientState: clientOriginatedOpaqueToken (if provided by client on subscription-creation)
Content-Length: 0
```

Để subscription được thiết lập, ứng dụng MUST phản hồi request này bằng 200 OK, với giá trị _validationToken_ là entity body duy nhất.
Lưu ý rằng nếu _notificationUrl_ chứa các tham số query, tham số _validationToken_ phải được nối thêm bằng ký tự `&`.

Nếu bất kỳ challenge request nào không nhận được response theo quy định trong vòng 5 giây kể từ khi gửi request, dịch vụ MUST trả về lỗi, MUST NOT tạo subscription, và MUST NOT gửi thêm request hoặc notification đến _notificationUrl_.

Dịch vụ MAY thực hiện các bước xác thực bổ sung về quyền sở hữu URL.

### 15.6. Nhận notification
Dịch vụ SHOULD gửi các notification để phản hồi các thay đổi dữ liệu của dịch vụ mà không bao gồm chi tiết của chính các thay đổi, nhưng có đủ thông tin để ứng dụng đăng ký phản hồi phù hợp theo quy trình sau:

1. Ứng dụng MUST xác định đúng OAuth token đã được cache để dùng cho việc gọi lại
2. Ứng dụng MAY tra cứu bất kỳ delta token trước đó cho phạm vi thay đổi liên quan
3. Ứng dụng MUST xác định URL cần gọi để thực hiện query liên quan nhằm lấy trạng thái mới của dịch vụ, mà MAY là một delta query.

Các dịch vụ cung cấp notification sẽ được chuyển tiếp đến người dùng cuối MAY chọn thêm nhiều chi tiết hơn vào các gói notification để giảm tải lệnh gọi đến cho dịch vụ của mình.
 Các dịch vụ như vậy MUST nói rõ rằng notification không được đảm bảo sẽ được gửi đến nơi và có thể bị mất hoặc sai thứ tự.

Notification MAY được gộp lại và gửi theo lô.
Ứng dụng MUST sẵn sàng nhận nhiều sự kiện trong một push notification duy nhất.

Dịch vụ MUST gửi mọi notification dữ liệu Web Hook dưới dạng request POST.

Dịch vụ MUST cho phép timeout 30 giây đối với notification.
Nếu xảy ra timeout hoặc ứng dụng phản hồi bằng response 5xx, thì dịch vụ SHOULD thử lại notification với exponential back-off.
Mọi response khác sẽ bị bỏ qua.

Dịch vụ MUST NOT theo các redirect request 301/302.

#### 15.6.1. Payload của notification
Định dạng cơ bản cho payload của notification là một danh sách các sự kiện, mỗi sự kiện chứa id của subscription có các resource được tham chiếu đã thay đổi, loại thay đổi, resource cần được dùng để xác định chi tiết chính xác của thay đổi và đủ thông tin định danh để tra cứu token cần thiết nhằm gọi resource đó.

Với firehose subscription, một ví dụ cụ thể có thể trông như sau:

```json
{
  "value": [
    {
      "subscriptionId": "32b8cbd6174ab18b",
      "resource": "https://api.contoso.com/v1.0/users/user@contoso.com/files?$delta",
      "userId" : "<User GUID>",
      "tenantId" : "<Tenant Id>"
    }
  ]
}
```

Với per-user subscription, một ví dụ cụ thể có thể trông như sau:

```json
{
  "value": [
    {
      "subscriptionId": "32b8cbd6174ab183",
      "clientState": "clientOriginatedOpaqueToken",
      "expirationDateTime": "2016-02-04T11:23Z",
      "resource": "https://api.contoso.com/v1.0/users/user@contoso.com/files/$delta",
      "userId" : "<User GUID>",
      "tenantId" : "<Tenant Id>"
    },
    {
      "subscriptionId": "97b391179fa22",
      "clientState ": "clientOriginatedOpaqueToken",
      "expirationDateTime": "2016-02-04T11:23Z",
      "resource": "https://api.contoso.com/v1.0/users/user@contoso.com/files/$delta",
      "userId" : "<User GUID>",
      "tenantId" : "<Tenant Id>"
    }
  ]
}
```

Sau đây là mô tả chi tiết về payload JSON.

Một notification item bao gồm một đối tượng cấp cao nhất chứa một mảng các sự kiện, mỗi sự kiện xác định subscription mà vì nó notification này được gửi đi.

Trường | Mô tả
----- | --------------------------------------------------------------------------------------------------
value | Mảng các sự kiện đã phát sinh trong phạm vi của subscription kể từ notification gần nhất.

Mỗi phần tử của mảng sự kiện chứa các thuộc tính sau:

Trường             | Mô tả
------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
subscriptionId     | Id của subscription mà vì nó notification này được gửi đi.<br/>Dịch vụ MUST cung cấp trường *subscriptionId*.
clientState        | Dịch vụ MUST cung cấp trường *clientState* nếu nó được cung cấp tại thời điểm tạo subscription.
expirationDateTime | Dịch vụ MUST cung cấp trường *expirationDateTime* nếu subscription có trường này.
resource           | Dịch vụ MUST cung cấp trường resource. URL này MUST được ứng dụng đăng ký coi là opaque.  Trong trường hợp notification phong phú hơn, nó MAY được bao hàm trong nội dung thông điệp vốn đã ngầm chứa URL của resource để tránh trùng lặp.<br/>Nếu dịch vụ cung cấp dữ liệu này như một phần của gói dữ liệu chi tiết hơn thì không cần lặp lại.
userId             | Dịch vụ MUST cung cấp trường này cho các resource có phạm vi theo người dùng.  Trong trường hợp resource có phạm vi theo người dùng, nên dùng định danh duy nhất của người dùng.<br/>Trong trường hợp resource được chia sẻ giữa một tập người dùng cụ thể, phải gửi nhiều notification, mỗi notification truyền định danh duy nhất của từng người dùng.<br/>Với resource có phạm vi theo tenant, nên dùng user id của subscription.
tenantId           | Dịch vụ muốn hỗ trợ request xuyên tenant SHOULD cung cấp trường này. Dịch vụ cung cấp notification trên dữ liệu có phạm vi theo tenant MUST gửi trường này.

### 15.7. Quản lý subscription bằng chương trình
Đối với các subscription theo từng người dùng, API **MUST** được cung cấp để tạo và quản lý subscription.
API phải hỗ trợ tối thiểu các thao tác được mô tả ở đây.

#### 15.7.1. Tạo subscription
Client tạo subscription bằng cách gửi request POST đến resource subscriptions.
Không gian tên của subscription do client tự định nghĩa thông qua thao tác POST.

```
https://api.contoso.com/apiVersion/$subscriptions
```

Request POST chứa một đối tượng subscription duy nhất cần được tạo.
Đối tượng subscription đó có các thuộc tính sau:

Property Name   | Required | Notes
--------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------
resource        | Yes      | Đường dẫn resource cần theo dõi.
notificationUrl | Yes      | URL web hook đích.
clientState     | No       | Chuỗi opaque được trả lại cho client trong mọi notification. Bên gọi có thể dùng chuỗi này để cung cấp cơ chế gắn thẻ.

Nếu subscription được tạo thành công, dịch vụ **MUST** phản hồi với status code 201 CREATED và một body chứa ít nhất các thuộc tính sau:

Property Name      | Required | Notes
------------------ | -------- | -------------------------------------------------------------------------------------------
id                 | Yes      | ID duy nhất của subscription mới, có thể dùng sau này để cập nhật/xóa subscription.
expirationDateTime | No       | Dùng các định dạng thời gian đã được định nghĩa trong Microsoft REST API Guidelines hiện có.

Việc tạo subscription **SHOULD** có tính idempotent.
Tổ hợp các thuộc tính trong phạm vi của auth token tạo nên ràng buộc tính duy nhất.

Dưới đây là một request ví dụ dùng principal User + Application để đăng ký nhận notification từ một file:

```http
POST https://api.contoso.com/files/v1.0/$subscriptions HTTP 1.1
Authorization: Bearer {UserPrincipalBearerToken}

{
  "resource": "http://api.service.com/v1.0/files/file1.txt",
  "notificationUrl": "https://contoso.com/myCallbacks",
  "clientState": "clientOriginatedOpaqueToken"
}
```

Dịch vụ **SHOULD** phản hồi message như trên với định dạng response tối thiểu như sau:

```json
{
  "id": "32b8cbd6174ab18b",
  "expirationDateTime": "2016-02-04T11:23Z"
}
```

Dưới đây là ví dụ dùng principal Application-Only, trong đó ứng dụng theo dõi tất cả các file mà nó được cấp quyền:

```http
POST https://api.contoso.com/files/v1.0/$subscriptions HTTP 1.1
Authorization: Bearer {ApplicationPrincipalBearerToken}

{
  "resource": "All.Files",
  "notificationUrl": "https://contoso.com/myCallbacks",
  "clientState": "clientOriginatedOpaqueToken"
}
```

Dịch vụ **SHOULD** phản hồi message như trên với định dạng response tối thiểu như sau:

```json
{
  "id": "8cbd6174abb391179",
  "expirationDateTime": "2016-02-04T11:23Z"
}
```

#### 15.7.2. Cập nhật subscription
Dịch vụ **MAY** hỗ trợ sửa đổi subscription.
 Để cập nhật các thuộc tính của một subscription hiện có, client dùng request PATCH cung cấp ID và các thuộc tính cần thay đổi.
Các thuộc tính bị bỏ qua sẽ giữ nguyên giá trị.
Để xóa một thuộc tính, gán giá trị JSON null cho thuộc tính đó.

Giống như khi tạo, các subscription được quản lý riêng lẻ.

Request sau thay đổi URL notification của một subscription hiện có:

```http
PATCH https://api.contoso.com/files/v1.0/$subscriptions/{id} HTTP 1.1
Authorization: Bearer {UserPrincipalBearerToken}

{
  "notificationUrl": "https://contoso.com/myNewCallback"
}
```

Nếu request PATCH chứa _notificationUrl_ mới, server **MUST** thực hiện xác thực tính hợp lệ của nó như đã mô tả ở trên.
Nếu URL mới không vượt qua bước xác thực, dịch vụ **MUST** làm request PATCH thất bại và giữ nguyên subscription ở trạng thái trước đó.

Dịch vụ **MUST** trả về body rỗng và `204 No Content` để cho biết patch thành công.

Dịch vụ **MUST** trả về body lỗi và status code nếu patch thất bại.

Thao tác **MUST** thành công hoặc thất bại một cách atomic.

#### 15.7.3. Xóa subscription
Dịch vụ **MUST** hỗ trợ xóa subscription.
Các subscription hiện có có thể được xóa bằng cách gửi request DELETE đến resource subscription:

```http
DELETE https://api.contoso.com/files/v1.0/$subscriptions/{id} HTTP 1.1
Authorization: Bearer {UserPrincipalBearerToken}
```

Giống như khi cập nhật, dịch vụ **MUST** trả về `204 No Content` khi xóa thành công, hoặc body lỗi và status code để cho biết thất bại.

#### 15.7.4. Liệt kê subscription
Để lấy danh sách các subscription đang hoạt động, client gửi request GET đến resource subscriptions bằng bearer token User + Application hoặc Application-Only:

```http
GET https://api.contoso.com/files/v1.0/$subscriptions HTTP 1.1
Authorization: Bearer {UserPrincipalBearerToken}
```

Dịch vụ **MUST** trả về định dạng như dưới đây khi dùng bearer token của principal User + Application:

```json
{
  "value": [
    {
      "id": "32b8cbd6174ab18b",
      "resource": " http://api.contoso.com/v1.0/files/file1.txt",
      "notificationUrl": "https://contoso.com/myCallbacks",
      "clientState": "clientOriginatedOpaqueToken",
      "expirationDateTime": "2016-02-04T11:23Z"
    }
  ]
}
```

Ví dụ về kết quả có thể được trả về khi dùng bearer token của principal Application-Only:

```json
{
  "value": [
    {
      "id": "6174ab18bfa22",
      "resource": "All.Files ",
      "notificationUrl": "https://contoso.com/myCallbacks",
      "clientState": "clientOriginatedOpaqueToken",
      "expirationDateTime": "2016-02-04T11:23Z"
    }
  ]
}
```

### 15.8. Bảo mật
Tất cả URL của dịch vụ phải là HTTPS (nghĩa là mọi lời gọi đến **MUST** là HTTPS). Các dịch vụ xử lý Web Hook **MUST** chấp nhận HTTPS.

Chúng tôi khuyến nghị các dịch vụ cho phép URL Web Hook Callback do client định nghĩa **SHOULD NOT** truyền dữ liệu qua HTTP.
Lý do là thông tin có thể vô tình bị lộ qua log của client, mạng, server và các cơ chế khác.

Tuy nhiên, có những kịch bản mà các khuyến nghị trên không thể được tuân thủ do hạn chế của endpoint client hoặc phần mềm.
Do đó, dịch vụ **MAY** cho phép URL web hook dùng HTTP.

Hơn nữa, các dịch vụ cho phép URL callback web hook HTTP do client định nghĩa **SHOULD** tuân thủ chính sách quyền riêng tư do ban lãnh đạo kỹ thuật quy định.
Điều này thường bao gồm việc khuyến nghị client ưu tiên kết nối SSL và thực hiện các biện pháp phòng ngừa đặc biệt để đảm bảo log và các hoạt động thu thập dữ liệu khác của dịch vụ được xử lý đúng cách.

Ví dụ, dịch vụ có thể không muốn yêu cầu nhà phát triển phải tạo chứng chỉ để onboard.
Dịch vụ có thể chỉ bật tính năng này trên các tài khoản thử nghiệm.

## 16. Request không được hỗ trợ
Client RESTful API **MAY** yêu cầu chức năng hiện chưa được hỗ trợ.
RESTful API **MUST** phản hồi các request hợp lệ nhưng không được hỗ trợ theo đúng phần này.

### 16.1. Hướng dẫn cốt lõi
RESTful API thường sẽ chọn giới hạn các chức năng mà client có thể thực hiện.
Chẳng hạn, các hệ thống kiểm toán cho phép tạo bản ghi nhưng không cho sửa hoặc xóa.
Tương tự, một số API sẽ cung cấp collection nhưng yêu cầu hoặc giới hạn các tiêu chí lọc và sắp xếp, hoặc **MAY** không hỗ trợ phân trang do client điều khiển.

### 16.2. Danh sách tính năng cho phép
Nếu một dịch vụ không hỗ trợ bất kỳ tính năng API nào dưới đây, thì response lỗi **MUST** được cung cấp khi bên gọi yêu cầu tính năng đó.
Các tính năng gồm:
- Key Addressing trong một collection, chẳng hạn: `https://api.contoso.com/v1.0/people/user1@contoso.com`
- Lọc một collection theo giá trị thuộc tính, chẳng hạn: `https://api.contoso.com/v1.0/people?$filter=name eq 'david'`
- Lọc một collection theo khoảng, chẳng hạn: `http://api.contoso.com/v1.0/people?$filter=hireDate ge 2014-01-01 and hireDate le 2014-12-31`
- Phân trang do client điều khiển qua $top và $skip, chẳng hạn: `http://api.contoso.com/v1.0/people?$top=5&$skip=2`
- Sắp xếp bằng $orderBy, chẳng hạn: `https://api.contoso.com/v1.0/people?$orderBy=name desc`
- Cung cấp token $delta, chẳng hạn: `https://api.contoso.com/v1.0/people?$delta`

#### 16.2.1. Response lỗi
Dịch vụ **MUST** cung cấp response lỗi nếu bên gọi yêu cầu một tính năng không được hỗ trợ nằm trong danh sách tính năng cho phép.
Response lỗi **MUST** là một HTTP status code thuộc dòng 4xx, cho biết request không thể được đáp ứng.
Trừ khi có một status lỗi cụ thể hơn phù hợp với request đó, dịch vụ **SHOULD** trả về "400 Bad Request" và một payload lỗi tuân theo hướng dẫn về response lỗi trong Microsoft REST API Guidelines.
Dịch vụ **SHOULD** đưa vào message của response đủ chi tiết để nhà phát triển xác định chính xác phần nào của request không được hỗ trợ.

Ví dụ:

```http
GET https://api.contoso.com/v1.0/people?$orderBy=name HTTP/1.1
Accept: application/json
```

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "error": {
    "code": "ErrorUnsupportedOrderBy",
    "message": "Ordering by name is not supported."
  }
}
```

## 17. Hướng dẫn đặt tên
### 17.1. Cách tiếp cận
Chính sách đặt tên nên giúp nhà phát triển khám phá chức năng mà không phải liên tục tham khảo tài liệu.
Việc dùng các mẫu thiết kế phổ biến và quy ước chuẩn giúp nhà phát triển đoán đúng tên và ý nghĩa của các thuộc tính thông dụng.
Dịch vụ **SHOULD** dùng kiểu đặt tên đầy đủ, rõ nghĩa và **SHOULD NOT** dùng từ viết tắt, ngoại trừ các từ viết tắt dạng acronym là cách diễn đạt chủ đạo trong miền mà API biểu diễn (ví dụ: Url).

### 17.2. Cách viết hoa/thường
- Acronym **SHOULD** tuân theo quy ước viết hoa/thường như các từ thông thường (ví dụ: Url).
- Mọi định danh, bao gồm namespace, entityTypes, entitySets, thuộc tính, action, function và giá trị enum, **SHOULD** dùng lowerCamelCase.
- HTTP header là ngoại lệ và **SHOULD** dùng quy ước HTTP chuẩn là Capitalized-Hyphenated-Terms.

### 17.3. Các tên cần tránh
Một số tên bị dùng quá nhiều trong các miền API đến mức mất hết ý nghĩa hoặc xung đột với các cách dùng phổ biến khác trong những miền không thể tránh khi dùng REST API, chẳng hạn OAUTH.
Dịch vụ **SHOULD NOT** dùng các tên sau:
- Context
- Scope
- Resource

### 17.4. Hình thành tên ghép
- Dịch vụ **SHOULD** tránh dùng mạo từ như 'a', 'the', 'of' trừ khi cần thiết để truyền đạt ý nghĩa.
	- ví dụ: các tên như aUser, theAccount, countOfBooks **SHOULD NOT** được dùng, thay vào đó **SHOULD** ưu tiên user, account, bookCount.
- Dịch vụ **SHOULD** thêm kiểu vào tên thuộc tính khi không làm vậy sẽ gây mơ hồ về cách dữ liệu được biểu diễn hoặc khiến dịch vụ không dùng tên thuộc tính phổ biến.
- Khi thêm kiểu vào tên thuộc tính, dịch vụ **MUST** thêm kiểu ở cuối, ví dụ: createdDateTime.

### 17.5. Thuộc tính định danh
- Dịch vụ **MUST** dùng kiểu string cho các thuộc tính định danh.
- Đối với dịch vụ OData, dịch vụ **MUST** dùng thuộc tính OData @id để biểu diễn định danh chuẩn (canonical identifier) của resource.
- Dịch vụ **MAY** dùng thuộc tính 'id' đơn giản để biểu diễn giá trị khóa chính cục bộ hoặc kế thừa (legacy) của một resource.
- Dịch vụ **SHOULD** dùng tên của quan hệ kèm hậu tố 'Id' để biểu diễn khóa ngoại tham chiếu đến resource khác, ví dụ: subscriptionId.
	- Nội dung của thuộc tính này **SHOULD** là ID chuẩn (canonical ID) của resource được tham chiếu.

### 17.6. Thuộc tính ngày và giờ

- Đối với các thuộc tính cần cả ngày lẫn giờ, dịch vụ **MUST** dùng hậu tố 'DateTime'.
- Đối với các thuộc tính chỉ cần thông tin ngày mà không chỉ định giờ, dịch vụ **MUST** dùng hậu tố 'Date', ví dụ: birthDate.
- Đối với các thuộc tính chỉ cần thông tin giờ mà không chỉ định ngày, dịch vụ **MUST** dùng hậu tố 'Time', ví dụ: appointmentStartTime.

### 17.7. Thuộc tính tên
- Đối với tên chung của một resource thường được hiển thị cho người dùng, dịch vụ **MUST** dùng tên thuộc tính 'displayName'.
- Dịch vụ **MAY** dùng các thuộc tính tên phổ biến khác, ví dụ: givenName, surname, signInName.

### 17.8. Collection và số đếm
- Dịch vụ **MUST** đặt tên collection bằng danh từ số nhiều hoặc cụm danh từ số nhiều, dùng tiếng Anh đúng chuẩn.
- Dịch vụ **MAY** dùng tiếng Anh đơn giản hóa cho những danh từ có dạng số nhiều không phổ biến trong văn nói.
	- ví dụ: schemas **MAY** được dùng thay cho schemata.
- Dịch vụ **MUST** đặt tên số đếm của resource bằng một danh từ hoặc cụm danh từ có hậu tố 'Count'.

### 17.9. Tên thuộc tính thông dụng
Khi dịch vụ có một thuộc tính mà dữ liệu khớp với các tên dưới đây, dịch vụ **MUST** dùng tên trong bảng này.
Bảng này sẽ mở rộng khi các dịch vụ bổ sung thêm những thuật ngữ được dùng phổ biến hơn.
Chủ sở hữu dịch vụ khi thêm các thuật ngữ như vậy **SHOULD** đề xuất bổ sung vào tài liệu này.

| |
|------------- |
 attendees     |
 body          |
 createdDateTime |
 childCount    |
 children      |
 contentUrl    |
 country       |
 createdBy     |
 displayName   |
 errorUrl      |
 eTag          |
 event         |
 expirationDateTime |
 givenName     |
 jobTitle      |
 kind          |
 id            |
 lastModifiedDateTime |
 location      |
 memberOf      |
 message       |
 name          |
 owner         |
 people        |
 person        |
 postalCode    |
 photo         |
 preferredLanguage |
 properties    |
 signInName    |
 surname       |
 tags          |
 userPrincipalName |
 webUrl        |

## 18. Phụ lục
### 18.1. Ghi chú về sequence diagram
Tất cả sequence diagram trong tài liệu này được tạo bằng [WebSequenceDiagrams.com](https://www.websequencediagrams.com/). Để tạo chúng, hãy dán đoạn văn bản bên dưới vào công cụ web này.

#### 18.1.1. Push notification, luồng theo từng người dùng

```
=== Begin Text ===
note over Developer, Automation, App Server:
     An App Developer like MovieMaker
     Wants to integrate with primary service like Dropbox
end note
note over DB Portal, DB App Registration, DB Notifications, DB Auth, DB Service: The primary service like Dropbox
note over Client: The end users' browser or installed app

note over Developer, Automation, App Server, DB Portal, DB App Registration, DB Notifications, Client : Manual App Registration


Developer <--> DB Portal : Login into Portal, App Registration UX
DB Portal -> +DB App Registration: App Name etc.
note over DB App Registration: Confirm Portal Access Token

DB App Registration -> -DB Portal: App ID
DB Portal <--> App Server: Developer copies App ID

note over Developer, Automation, App Server, DB Portal, DB App Registration, DB Notifications, Client : Manual Notification Registration

Developer <--> DB Portal: webhook registration UX
DB Portal -> +DB Notifications: Register: App Server webhook URL, Scope, App ID
Note over DB Notifications : Confirm Portal Access Token
DB Notifications -> -DB Portal: notification ID
DB Portal --> App Server : Developer may copy notification ID


note over Developer, Automation, App Server, DB Portal, DB App Registration, DB Notifications, Client : Client Authorization

Client -> +App Server : Request access to DB protected information
App Server -> -Client : Redirect to DB Authorization endpoint with authorization request
Client -> +DB Auth : Redirected authorization request
Client <--> DB Auth : Authorization UX
DB Auth -> -Client : Redirect back to App Server with code
Client -> +App Server : Redirect request back to access server with access code
App Server -> +DB Auth : Request tokens with access code
note right of DB Service: Cache that this User ID provided access to App ID
DB Auth -> -App Server : Response with access, refresh, and ID tokens
note right of App Server : Cache tokens by user ID
App Server -> -Client : Return information to client

note over Developer, Automation, App Server, DB Portal, DB App Registration, DB Notifications, Client : Notification Flow

Client <--> DB Service: Changes to user data - typical via interacting with App Server via Client
DB Service -> App Server : Notification with notification ID and user ID
App Server -> +DB Service : Request changed information with cached access tokens and "since" token
note over DB Service: Confirm User Access Token
DB Service -> -App Server : Response with data and new "since" token
note right of App Server: Update status and cache new "since" token
=== End Text ===
```

#### 18.1.2. Push notification, luồng firehose

```
=== Begin Text ===
note over Developer, Automation, App Server:
     An App Developer like MovieMaker
     Wants to integrate with primary service like Dropbox
end note
note over DB Portal, DB App Registration, DB Notifications, DB Auth, DB Service: The primary service like Dropbox
note over Client: The end users' browser or installed app

note over Developer, Automation, App Server, DB Portal, DB App Registration, DB Notifications, Client : App Registration

alt Automated app registration
   Developer <--> Automation: Configure
   Automation -> +DB App Registration: App Name etc.
   note over DB App Registration: Confirm App Access Token
   DB App Registration -> -Automation: App ID, App Secret
   Automation --> App Server : Embed App ID, App Secret
else Manual app registration
   Developer <--> DB Portal : Login into Portal, App Registration UX
   DB Portal -> +DB App Registration: App Name etc.
   note over DB App Registration: Confirm Portal Access Token

   DB App Registration -> -DB Portal: App ID
   DB Portal <--> App Server: Developer copies App ID
end

note over Developer, Automation, App Server, DB Portal, DB App Registration, DB Notifications, Client : Client Authorization

Client -> +App Server : Request access to DB protected information
App Server -> -Client : Redirect to DB Authorization endpoint with authorization request
Client -> +DB Auth : Redirected authorization request
Client <--> DB Auth : Authorization UX
DB Auth -> -Client : Redirect back to App Server with code
Client -> +App Server : Redirect request back to access server with access code
App Server -> +DB Auth : Request tokens with access code
note right of DB Service: Cache that this User ID provided access to App ID
DB Auth -> -App Server : Response with access, refresh, and ID tokens
note right of App Server : Cache tokens by user ID
App Server -> -Client : Return information to client



note over Developer, Automation, App Server, DB Portal, DB App Registration, DB Notifications, Client : Notification Registration

App Server->+DB Notifications: Register: App server webhook URL, Scope, App ID
note over DB Notifications : Confirm User Access Token
DB Notifications -> -App Server: notification ID
note right of App Server : Cache the Notification ID and User Access Token



note over Developer, Automation, App Server, DB Portal, DB App Registration, DB Notifications, Client : Notification Flow

Client <--> DB Service: Changes to user data - typical via interacting with App Server via Client
DB Service -> App Server : Notification with notification ID and user ID
App Server -> +DB Service : Request changed information with cached access tokens and "since" token
note over DB Service: Confirm User Access Token
DB Service -> -App Server : Response with data and new "since" token
note right of App Server: Update status and cache new "since" token



=== End Text ===
```
[fielding]: https://www.ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm
[IANA-headers]: https://www.iana.org/assignments/message-headers/message-headers.xhtml
[rfc-2119]: https://tools.ietf.org/html/rfc2119
[rfc7231-7-1-1-1]: https://tools.ietf.org/html/rfc7231#section-7.1.1.1
[rfc-7230-3-1-1]: https://tools.ietf.org/html/rfc7230#section-3.1.1
[rfc-7231]: https://tools.ietf.org/html/rfc7231
[rest-in-practice]: https://www.amazon.com/REST-Practice-Hypermedia-Systems-Architecture/dp/0596805829/
[rest-on-wikipedia]: https://en.wikipedia.org/wiki/Representational_state_transfer
[rfc-5789]: https://tools.ietf.org/html/rfc5789
[rfc-5988]: https://tools.ietf.org/html/rfc5988
[rfc-3339]: https://tools.ietf.org/html/rfc3339
[rfc-5322-3-3]: https://tools.ietf.org/html/rfc5322#section-3.3
[cors-preflight]: https://www.w3.org/TR/cors/#resource-preflight-requests
[rfc-3864]: https://tools.ietf.org/html/rfc3864
[odata-json-annotations]: https://docs.oasis-open.org/odata/odata-json-format/v4.0/os/odata-json-format-v4.0-os.html#_Instance_Annotations
[cors]: https://www.w3.org/TR/access-control/
[cors-user-credentials]: https://www.w3.org/TR/access-control/#user-credentials
[cors-simple-headers]: https://www.w3.org/TR/access-control/#simple-header
[rfc-4627]: https://tools.ietf.org/html/rfc4627
[iso-8601]: https://www.ecma-international.org/ecma-262/5.1/#sec-15.9.1.15
[clr-time]: https://msdn.microsoft.com/en-us/library/System.DateTime(v=vs.110).aspx
[ecmascript-time]: https://www.ecma-international.org/ecma-262/5.1/#sec-15.9.1.1
[ole-date]: https://docs.microsoft.com/en-us/windows/desktop/api/oleauto/nf-oleauto-varianttimetosystemtime
[ticks-time]: https://msdn.microsoft.com/en-us/library/windows/desktop/ms724290(v=vs.85).aspx
[unix-time]: https://msdn.microsoft.com/en-us/library/1f4c8f33.aspx
[windows-time]: https://msdn.microsoft.com/en-us/library/windows/desktop/ms724290(v=vs.85).aspx
[excel-time]: https://support.microsoft.com/kb/214326?wa=wsignin1.0
[wikipedia-iso8601-durations]: https://en.wikipedia.org/wiki/ISO_8601#Durations
[wikipedia-iso8601-intervals]: https://en.wikipedia.org/wiki/ISO_8601#Time_intervals
[wikipedia-iso8601-repeatingintervals]: https://en.wikipedia.org/wiki/ISO_8601#Repeating_intervals
[principle-of-least-astonishment]: https://en.wikipedia.org/wiki/Principle_of_least_astonishment
[odata-breaking-changes]: https://docs.oasis-open.org/odata/odata/v4.0/errata02/os/complete/part1-protocol/odata-v4.0-errata02-os-part1-protocol-complete.html#_Toc406398209
[websequencediagram-firehose-subscription-setup]: https://www.websequencediagrams.com/cgi-bin/cdraw?lz=bm90ZSBvdmVyIERldmVsb3BlciwgQXV0b21hdGlvbiwgQXBwIFNlcnZlcjogCiAgICAgQW4AEAUAJwkgbGlrZSBNb3ZpZU1ha2VyACAGV2FudHMgdG8gaW50ZWdyYXRlIHdpdGggcHJpbWFyeSBzZXJ2aWNlADcGRHJvcGJveAplbmQgbm90ZQoAgQwLQiBQb3J0YWwsIERCAIEJBVJlZ2lzdHIAgRkHREIgTm90aWZpYwCBLAVzACEGdXRoACsFUwBgBjogVGhlAF0eAIF_CkNsaWVudAAtBmVuZCB1c2VycycgYnJvd3NlciBvciBpbnN0YWxsZWQgYXBwCgCBIQwAgiQgAIFABQCBIS8AgQoGIDogTWFudWFsAIFzEQoKCgCDAgo8LS0-AIIqCiA6IExvZ2luIGludG8Agj8JAII1ECBVWCAKACoKLT4gKwCCWBM6AIQGBU5hbWUgZXRjLgCDFQ4AGxJDb25maXJtAIEBCEFjY2VzcyBUb2tlbgoKAIM3EyAtPiAtAINkCQBnBklEAIEMCwCBVQUAhQIMAIR3CmNvcGllcwArCACCIHAAhHMMAIMKDwCDABg6IHdlYmhvb2sgcgCCeg4AgnUSAIVQDToAhXYHZXIAgwgGAIcTBgBECVVSTCwgU2NvcGUAhzIGSUQKTgCGPQwAhhwNIACDBh4AHhEAgxEPbgCBagwAgxwNAIMaDiAAgx0MbWF5IGNvcHkALREAhVtqAIZHB0F1dGhvcml6AIY7BwCGXQctPiArAIEuDVJlcXVlc3QgYQCFOQZ0byBEQiBwcm90ZWN0ZWQgaW5mb3IAiiQGCgCDBQstPiAtAIctCVJlZGlyZWN0ADYHAGwNIGVuZHBvaW50AIoWBmEADw1yAHYGAIEQDACJVAcASwtlZAAYHgCICAgAMAcAcA4AhGoGAE0FAIEdFmJhY2sgdG8AhF8NaXRoIGNvZGUAghoaaQCBagcAgToHAD0JAII-B3MAPgsAglEHAEsFAIIzDgCBXw0Agn8GdG9rZW5zACcSAI0_BXJpZ2h0IG9mAItpDUNhY2hlIHRoYXQgdGhpcyBVc2VyIElEIHByb3ZpZGVkAINNCwCIZgoAggcJAIN7D3Nwb25zAI0_BwCECgYsIHJlZnJlc2gsIGFuZCBJRACBHAcAgQMPAIYADQCBDAcAgUUGYnkAjFkFIElEAIQkG3R1cm4AhF4MIHRvIGMAjR8FAIwRagCJVw1GbG93AIYqCQCMaQgAgmoKaGFuZ2UAj3YFAIFXBWRhdGEgLSB0eXBpY2FsIHZpYQCQDgVyYWN0aW5nAJAPBgCJQQt2aWEAjnsHCgCPNgogAIhDEACKZw0AkFMFAIkBDwCDDAUAgkYWKwBNCwCHWApjAIEyBQCHRg0AhWUHYWNoAIQeDACEfwVhbmQgInNpbmNlIgCFEQYAkSQOAIR3CgCNfwcAhHQFAIpQEACBUgsAhFAcAII8BWFuZCBuZXcAYRQAhFUTOiBVcGRhdGUgc3RhdHUAgSkGAIFDBQAxEwoKCg&s=mscgen
[websequencediagram-user-subscription-setup]: https://www.websequencediagrams.com/cgi-bin/cdraw?lz=bm90ZSBvdmVyIERldmVsb3BlciwgQXV0b21hdGlvbiwgQXBwIFNlcnZlcjogCiAgICAgQW4AEAUAJwkgbGlrZSBNb3ZpZU1ha2VyACAGV2FudHMgdG8gaW50ZWdyYXRlIHdpdGggcHJpbWFyeSBzZXJ2aWNlADcGRHJvcGJveAplbmQgbm90ZQoAgQwLQiBQb3J0YWwsIERCAIEJBVJlZ2lzdHIAgRkHREIgTm90aWZpYwCBLAVzACEGdXRoACsFUwBgBjogVGhlAF0eAIF_CkNsaWVudAAtBmVuZCB1c2VycycgYnJvd3NlciBvciBpbnN0YWxsZWQgYXBwCgCBIQwAgiQgAIFABQCBIS8AgQoGIDoAgWwRCgphbHQAgyUIAIEHBiByABQMICAAgxsLPC0tPgCDTws6IENvbmZpZ3VyZQogIACDaAsgLT4gKwCCWBMAegZOYW1lIGV0Yy4AhAgFAIMaDQAfEgBdBXJtAIQ_BUFjY2VzcyBUb2tlAIETBgCDOxIgLT4gLQCBFgxBcHAgSUQAhHwIY3JldACBGxAtPgCFFgsgOiBFbWJlZAAkFGVsc2UgTWFudWFsAIIEJACEbQkgOiBMb2dpbiBpbnRvAIUBCQCBKRFVWACGGAUALQoAgh8mAIIZKwCBCAcAgjoNAIIsHACGLwkAgj8IAIESDgCECAYAh1ELAIdFCmNvcGllcwAuCGVuZACEeGoAhWQHQXV0aG9yaXoAhV8HAIV6By0-ICsAg2ANUmVxdWVzdCBhAIRVBnRvIERCIHByb3RlY3RlZCBpbmZvcgCJQQYKAIQaCy0-IC0AhkoJUmVkaXJlY3QANgcAbA0gZW5kcG9pbnQAiTMGYQAPDXIAdgYAgRAMAIhxBwBLC2VkABgeAIRjCAAwB0EAcQxVWAoASQgAgRwWYmFjayB0bwCFdAwAilwFY29kZQCCGRppAIFpBwCBOQcAPQkAgj0HcwA-CwCCUAcASwUAgjIOAIFeDQCCfgZ0b2tlbnMAJxIAjFsFcmlnaHQgb2YAiwUNQ2FjaGUgdGhhdCB0aGlzIFVzZXIgSUQgcHJvdmlkZWQAg0wLAIU6BwCCBAwAg3oPc3BvbnMAjFsHAIQJBiwgcmVmcmVzaCwgYW5kIElEAIEcBwCBAw8AiDENAIEMBwCBRQZieQCLdQUgSUQAhCMbdHVybgCEXQwgdG8gYwCMOwUKCgCLL2oAjXUMAIwTDwCPNQotPisAjhwQOgCORQdlcgCMVwYAg3YIZWJob29rIFVSTCwgU2NvcGUAkAEGSUQAjwoOAI5rDSAAi2UKAINFBQCLYw0AHBEAgzUOOiBuAIE2DABgCACDCB1oZQCBaQ5JRACDYwUAahIAghB4RmxvdwCJMwkAjE0IAIV0CmhhbmdlAJIcBQCEYQVkYXRhIC0gdHlwaWNhbCB2aWEAkjQFcmFjdGluZwCSNQYAjV8LdmlhAJEhBwoAkVwKIACNfhAAhAsNAJJ5BQCCWQ8AhhYFAIVQFisATQsAimEKYwCBMgUAik8NAIhvB2FjaACHKAwAiAkFYW5kICJzaW5jZSIAiBsGAJNKDgCIAQoAhB0cAIFSCwCHWhwAgjwFYW5kIG5ldwBhFACHXxM6IFVwZGF0ZSBzdGF0dQCBKQYAgUMFADETCgoK&s=mscgen
