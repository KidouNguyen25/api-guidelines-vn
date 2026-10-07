# Operations

Mẫu thiết kế API của Microsoft Graph

*Mẫu thiết kế operations cho phép mô hình hóa một thay đổi có thể ảnh hưởng đến nhiều resource và không thể được mô hình hóa hiệu quả bằng các phương thức HTTP.*

## Vấn đề

Đôi khi khi mô hình hóa một miền nghiệp vụ phức tạp, nhà thiết kế API cần mô hình hóa một thao tác nghiệp vụ tác động đến một hoặc nhiều resource và mang thêm ý nghĩa ngữ nghĩa mà các phương thức HTTP không thể diễn đạt. Việc mô hình hóa thao tác bằng các phương thức HTTP trên từng resource riêng lẻ có thể kém hiệu quả hoặc làm lộ các chi tiết triển khai nội bộ.

## Giải pháp

Để giải quyết các trường hợp này, nhà thiết kế API có thể dùng các resource thao tác như function hoặc action. Nếu thao tác không có tác dụng phụ và MUST trả về một instance đơn của một kiểu hoặc một collection các instance, thì nhà thiết kế SHOULD dùng function của OData; nếu không, nhà thiết kế có thể mô hình hóa thao tác dưới dạng action.

## Khi nào nên dùng mẫu thiết kế này

Mẫu thiết kế operation có thể hợp lý khi một thao tác mô hình hóa đại diện cho một hoặc một tổ hợp các trường hợp sau:

- một sự thay đổi của resource (tức là, tăng giá trị của một thuộc tính) thay vì một trạng thái (tức là, giá trị cuối cùng của thuộc tính)
- logic xử lý phức tạp không nên được để lộ cho client
- các tham số của thao tác có thể truyền đạt một tập tùy chọn bị giới hạn (tức là, một báo cáo phải chỉ định một khoảng ngày)
- thao tác tận dụng một số dữ liệu phía dịch vụ không được để lộ cho người dùng (hoặc người dùng không dễ lấy được trong ngữ cảnh).

Bạn có thể cân nhắc các mẫu thiết kế liên quan như [thao tác chạy lâu](./long-running-operations.md) và [theo dõi thay đổi](./change-tracking.md).

## Các vấn đề và điểm cần cân nhắc

- Microsoft Graph KHÔNG hỗ trợ unbound action hoặc function. Các action và function bound MUST có thuộc tính `isBound="true"` và một binding parameter. Các thao tác bound được gọi trên các resource khớp với kiểu của binding parameter. Tham số đầu tiên của một thao tác bound luôn là binding parameter. Binding parameter có thể thuộc bất kỳ kiểu nào, và giá trị tham số MAY là Nullable.

- Cả action và function đều hỗ trợ overloading, nghĩa là một schema có thể chứa nhiều action hoặc function trùng tên. Các quy tắc overload theo [tiêu chuẩn](http://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/odata-csdl-xml-v4.01.html#sec_FunctionOverloads) của OData được áp dụng khi thêm tham số vào action và function.
  
- Vì Microsoft Graph chỉ hỗ trợ action và function bound, tất cả phải có ít nhất một tham số, trong đó tham số đầu tiên là binding parameter. Các yêu cầu bắt buộc đối với tham số như sau:

  - Mỗi tham số phải có một tên định danh đơn giản.
  - Tên tham số phải là duy nhất trong overload.
  - Tham số phải chỉ định một kiểu.

- Microsoft Graph hỗ trợ việc dùng các tham số tùy chọn. Có thể dùng annotation tham số tùy chọn thay vì tạo overload cho function hoặc action khi không cần thiết.

- Nhà thiết kế API **MUST** dùng POST để gọi action trên resource.
- Nhà thiết kế API **MUST** dùng GET để gọi function trên resource.

- Việc thêm một tham số bắt buộc, không nullable mới vào một action hoặc function hiện có là breaking change và không được phép nếu không có việc đánh phiên bản phù hợp theo [hướng dẫn ngừng hỗ trợ](https://github.com/microsoft/api-guidelines/blob/vNext/graph/deprecation.md) của chúng tôi.

## Ví dụ

### Người dùng muốn chuyển tiếp email

```
POST https://graph.microsoft.com/v1.0/me/messages/AQMkADNkMmMxYzIwLWJkOTItNDczZC1hNmYyLWUwZjk2ZTljMDQyNQBGAAAD1dY5iRo4x0_pEqop6hOrQAcAeGCrbYV1-kiG-z9Rv6yHMgAAAgEJAAAAeGCrbYV1-kiG-z9Rv6yHMgABRxeUKgAAAA==/forward

{
    "comment": "FYI",
    "toRecipients": [
        {
            "emailAddress": {
                "address": "alex.darrow@microsoft.com",
                "name": "Alex Darrow"
            }
        }
    ]
}
```
Response:
```
HTTP/1.1 202 Accepted

    "cache-control": "private",
    "client-request-id": "ca2d0416-a2c1-05af-df60-0921547a86e9",
    "content-length": "0",
    "request-id": "8b53016f-cc2b-4d9f-9818-bd6f0a5e3cd0"
```

Thao tác `forward` được mô hình hóa như một action bất đồng bộ bound vào entity type `message` của Graph vì thao tác này đại diện cho logic nghiệp vụ phức tạp được xử lý phía server. 
```
<Action Name="forward" IsBound="true">
        <Parameter Name="bindingParameter" Type="graph.message" />
        <Parameter Name="ToRecipients" Type="Collection(graph.recipient)" />
        <Parameter Name="Message" Type="graph.message" />
        <Parameter Name="Comment" Type="Edm.String" Unicode="false" />
</Action>
```

### Người dùng muốn xem các hoạt động ứng dụng gần đây

```
GET https://graph.microsoft.com/v1.0/me/activities/recent
```

Response:

```
HTTP/1.1 200 OK

{
    "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#Collection(userActivity)",
    "value": []
}
```
Function `recent` sẽ query các historyItems gần đây nhất rồi lấy các activity liên quan, do đó thao tác này đại diện cho logic nghiệp vụ phức tạp được xử lý phía server. Thao tác này không thay đổi bất kỳ dữ liệu nào trên server và rất phù hợp với function. Function được bound vào collection của entity type `userActivity`.

```
<Function Name="recent" EntitySetPath="activities" IsBound="true">
        <Parameter Name="bindingParameter" Type="Collection(graph.userActivity)" />
        <ReturnType Type="Collection(graph.userActivity)" />
</Function>
```
### Lấy báo cáo cho biết số lượng người dùng đang hoạt động sử dụng Microsoft Edge

```
https://graph.microsoft.com/beta/reports/getBrowserUserCounts(period='D7')
```

Response:

```
HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 205

{
   "value":[
      {
         "reportRefreshDate":"2021-04-17",
         "reportPeriod":7,
         "userCounts":[
            {
               "reportDate":"2021-04-17",
               "edge":413
            },
            {
               "reportDate":"2021-04-16",
               "edge":883
            }
         ]
      }
   ]
}
```

Thao tác `getBrowserUserCounts` không thay đổi bất kỳ dữ liệu nào trên server và rất phù hợp với function. Tham số thao tác `period` truyền đạt một tập tùy chọn bị giới hạn, biểu thị số ngày mà báo cáo được tổng hợp. Báo cáo chỉ hỗ trợ 7, 30, 90 hoặc 180 ngày. Ngoài ra, function không trả về một resource của Graph mà truyền trực tiếp (stream) dữ liệu response ở định dạng JSON hoặc CSV.

```
<Function Name="getBrowserUserCounts" IsBound="true">
        <Parameter Name="reportRoot" Type="graph.reportRoot" />
        <Parameter Name="period" Type="Edm.String" Nullable="false" Unicode="false" />
        <ReturnType Type="Edm.Stream" Nullable="false" />
</Function>
```
