# Collection

## 1. Khóa của item

Các dịch vụ SHOULD hỗ trợ định danh bền vững (durable identifier) cho từng item trong collection, và định danh đó SHOULD được biểu diễn trong JSON dưới tên "id". Các định danh bền vững này thường được dùng làm khóa của item.

Collection MAY hỗ trợ delta query, xem mục [mẫu thiết kế Change Tracking](../patterns/change-tracking.md) để biết thêm chi tiết.

## 2. Tuần tự hóa

Collection được biểu diễn trong JSON bằng ký pháp mảng chuẩn cho thuộc tính `value`.

## 3. Mẫu URL của collection

Mặc dù hiện có nhiều collection nằm trực tiếp dưới gốc Graph, từ nay về sau bạn MUST dùng một singleton cho segment cấp cao nhất và giới hạn phạm vi các collection vào một singleton phù hợp. Tên collection SHOULD là danh từ số nhiều khi có thể. Tên collection không nên dùng hậu tố như "Collection" hoặc "List".

Ví dụ:

```http
GET https://graph.microsoft.com/v1.0/teamwork/devices
```

Các phần tử của collection MUST có thể định địa chỉ bằng một thuộc tính id duy nhất. Thuộc tính id MUST là String và MUST là duy nhất trong collection. Thuộc tính id MUST được biểu diễn trong JSON dưới tên "id".
Ví dụ:

```http
GET https://graph.microsoft.com/beta/teamwork/devices/0f3ce432-e432-0f3c-32e4-3c0f32e43c0f
```

Trong đó:

- "https://graph.microsoft.com/beta/teamwork" - gốc dịch vụ, được biểu diễn bằng sự kết hợp của host (URL của site) + đường dẫn gốc đến dịch vụ.
- "devices" – tên của collection, không viết tắt, ở dạng số nhiều.
- "0f3ce432-e432-0f3c-32e4-3c0f32e43c0f" – giá trị của thuộc tính id duy nhất, MUST là giá trị string/number/guid thô, không có dấu ngoặc kép nhưng được escape đúng cách để vừa với một segment của URL.

### 3.1. Collection và thuộc tính lồng nhau

Các item của collection MAY chứa các collection khác.
Ví dụ, một collection devices MAY chứa các resource device có nhiều địa chỉ mac:

```http
GET https://graph.microsoft.com/beta/teamwork/devices/0f3ce432-e432-0f3c-32e4-3c0f32e43c0f
```

```json

{
  "value": {
    "@odata.type": "#microsoft.graph.teamworkDevice",
    "id": "0f3ce432-e432-0f3c-32e4-3c0f32e43c0f",
    "deviceType": "CollaborationBar",
    "hardwareDetail": {
      "serialNumber": "0189",
      "uniqueId": "5abcdefgh",
      "macAddresses": [],
      "manufacturer": "yealink",
      "model": "vc210"
    },
    ...    
  }
}
```

## 4. Collection lớn

Khi dữ liệu tăng lên thì collection cũng lớn theo.
Các dịch vụ SHOULD hỗ trợ phân trang phía server ngay từ đầu cho mọi collection, vì việc bổ sung phân trang là một thay đổi gây phá vỡ tương thích (breaking change).
Khi có nhiều trang, payload tuần tự hóa MUST chứa URL opaque của trang kế tiếp khi thích hợp.
Tham khảo [hướng dẫn phân trang](../Guidelines-deprecated.md#98-pagination) để biết thêm chi tiết.

Client MUST có khả năng chịu được việc dữ liệu collection được phân trang hoặc không phân trang đối với bất kỳ request nào.

```json
{
  "value":[
    { "id": "Item 1","price": 9 95,"sizes": null},
    { … },
    { … },
    { "id": "Item 99","price": 5 99,"sizes": null}
  ],
  "@nextLink": "{opaqueUrl}"
}
```

## 5. Thay đổi collection

Các request POST không idempotent.
Điều này có nghĩa là hai request POST gửi đến một resource collection với payload hoàn toàn giống nhau MAY dẫn đến việc tạo nhiều item trong collection đó.
Đây thường là trường hợp của các thao tác chèn trên item có id do server sinh ra.
Để biết thêm thông tin, tham khảo [mẫu thiết kế Upsert](../patterns/upsert.md).

Ví dụ, request sau:

```http
POST https://graph.microsoft.com/beta/teamwork/devices
```

Sẽ dẫn đến một response cho biết vị trí của item mới trong collection:

```http
201 Created
Location: https://graph.microsoft.com/beta/teamwork/devices/123
```

Và khi thực thi lại, nhiều khả năng sẽ dẫn đến một resource khác:

```http
201 Created
Location: https://graph.microsoft.com/beta/teamwork/devices/124
```

## 6. Sắp xếp collection

Kết quả của một query collection MAY được sắp xếp dựa trên giá trị thuộc tính.
Thuộc tính được xác định bởi giá trị của tham số query _$orderBy_.

Giá trị của tham số _$orderBy_ chứa danh sách các biểu thức phân tách bằng dấu phẩy dùng để sắp xếp các item.
Một trường hợp đặc biệt của biểu thức như vậy là đường dẫn thuộc tính kết thúc ở một thuộc tính kiểu nguyên thủy (primitive).

Biểu thức MAY có hậu tố "asc" cho tăng dần hoặc "desc" cho giảm dần, cách tên thuộc tính một hoặc nhiều khoảng trắng.
Nếu không chỉ định "asc" hoặc "desc", dịch vụ MUST sắp xếp theo thuộc tính đã chỉ định theo thứ tự tăng dần.

Giá trị NULL MUST được sắp xếp là "nhỏ hơn" giá trị khác NULL.

Các item MUST được sắp xếp theo giá trị kết quả của biểu thức đầu tiên, sau đó các item có cùng giá trị ở biểu thức đầu tiên được sắp xếp theo giá trị kết quả của biểu thức thứ hai, và cứ thế tiếp tục.
Thứ tự sắp xếp là thứ tự vốn có của kiểu của thuộc tính.

Ví dụ:

```http
GET https://graph.microsoft.com/beta/teamwork/devices?$orderBy=companyAssetTag
```

Sẽ trả về tất cả device được sắp xếp theo companyAssetTag theo thứ tự tăng dần.

Ví dụ:

```http
GET https://graph.microsoft.com/beta/teamwork/devices?$orderBy=companyAssetTag desc
```

Sẽ trả về tất cả device được sắp xếp theo companyAssetTag theo thứ tự giảm dần.

Có thể chỉ định sắp xếp phụ bằng danh sách tên thuộc tính phân tách bằng dấu phẩy với bộ định hướng chiều sắp xếp OPTIONAL.

Ví dụ:

```http
GET https://graph.microsoft.com/beta/teamwork/devices?$orderBy=companyAssetTag desc,activityState
```

Sẽ trả về tất cả device được sắp xếp theo companyAssetTag giảm dần và thứ tự sắp xếp phụ theo activityState tăng dần.

Việc sắp xếp MUST kết hợp được với lọc, xem [đặc tả Odata 4.01](https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part2-url-conventions.html#_Toc31361038) để biết thêm chi tiết.

### 6.1. Diễn giải biểu thức sắp xếp

Các tham số sắp xếp MUST nhất quán giữa các trang, vì phân trang cả phía client lẫn phía server đều hoàn toàn tương thích với sắp xếp.

Nếu một dịch vụ không hỗ trợ sắp xếp theo thuộc tính được nêu trong biểu thức _$orderBy_, dịch vụ MUST phản hồi bằng thông báo lỗi như được định nghĩa trong mục Responding to Unsupported Requests.

## 7. Lọc

Tham số querystring _$filter_ cho phép client lọc một collection các resource được định địa chỉ bởi URL của request.
Biểu thức được chỉ định bằng _$filter_ được đánh giá cho từng resource trong collection, và chỉ những item mà biểu thức cho kết quả true mới được đưa vào response.
Các resource mà biểu thức cho kết quả false hoặc null, hoặc tham chiếu đến các thuộc tính không khả dụng do quyền truy cập, sẽ bị loại khỏi response.

Ví dụ: trả về tất cả device có activity state bằng 'Active'

```http
GET https://graph.microsoft.com/beta/teamwork/devices?$filter=(activityState eq 'Active') 
```

Giá trị của tùy chọn _$filter_ là một biểu thức Boolean.

### 7.1. Các phép toán lọc

Các dịch vụ hỗ trợ _$filter_ SHOULD hỗ trợ tập phép toán tối thiểu sau.

Toán tử              | Mô tả                 | Ví dụ
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

Các dịch vụ MUST dùng thứ tự ưu tiên toán tử sau cho các toán tử được hỗ trợ khi đánh giá biểu thức _$filter_.
Các toán tử được liệt kê theo nhóm, theo thứ tự ưu tiên từ cao nhất đến thấp nhất.
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

## 8. Phân trang

Các API RESTful trả về collection MAY trả về tập kết quả từng phần.
Bên sử dụng các dịch vụ này MUST dự đoán trước tập kết quả từng phần và phân trang đúng cách để lấy toàn bộ tập.

Có hai hình thức phân trang mà các API RESTful MAY hỗ trợ.
Phân trang do server điều khiển cho phép server cân bằng tải giữa các client và giảm thiểu nguy cơ tấn công từ chối dịch vụ bằng cách buộc phân trang một request qua nhiều payload response.
Phân trang do client điều khiển cho phép client chỉ yêu cầu số lượng resource mà nó có thể dùng tại một thời điểm.

Các tham số sắp xếp và lọc MUST nhất quán giữa các trang, vì phân trang cả phía client lẫn phía server đều hoàn toàn tương thích với cả lọc và sắp xếp.

### 8.1. Phân trang do server điều khiển

Các response được phân trang MUST cho biết kết quả từng phần bằng cách đưa token `@odata.nextLink` vào response.
Việc không có token `nextLink` nghĩa là không còn trang nào nữa, xem [đặc tả Odata 4.01](https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_ServerDrivenPaging) để biết thêm chi tiết.

Client MUST coi URL `nextLink` là opaque, nghĩa là không được thay đổi các tùy chọn query khi lặp qua một tập kết quả từng phần.

Ví dụ:

```http
GET https://graph.microsoft.com/beta/teamwork/devices
Accept: application/json

HTTP/1.1 200 OK
Content-Type: application/json

{
  "value": [...],
  "@odata.nextLink": "{opaqueUrl}"
}
```

### 8.2. Phân trang do client điều khiển

Client MAY dùng các tham số query _$top_ và _$skip_ để chỉ định số kết quả cần trả về và độ lệch (offset) trong collection.

Server SHOULD tuân theo các giá trị do client chỉ định; tuy nhiên, client MUST sẵn sàng xử lý các response có kích thước trang khác hoặc chứa token `@odata.nextLink`.

Khi client chỉ định cả _$top_ và _$skip_, server SHOULD áp dụng _$skip_ trước rồi mới áp dụng _$top_ lên collection.

Lưu ý: Nếu server không thể tuân theo _$top_ và/hoặc _$skip_, server MUST trả về lỗi cho client để thông báo điều đó thay vì chỉ bỏ qua các tùy chọn query.
Điều này tránh rủi ro client đưa ra các giả định về dữ liệu được trả về.

Ví dụ:

```http
GET https://graph.microsoft.com/beta/teamwork/devices?$top=5&$skip=2 

Accept: application/json

HTTP/1.1 200 OK
Content-Type: application/json

{
   "value": [...]
}
```

### 8.3. Các lưu ý bổ sung

**Điều kiện tiên quyết về thứ tự ổn định:** Cả hai hình thức phân trang đều phụ thuộc vào việc collection các item có thứ tự ổn định.
Server MUST bổ sung thêm các tiêu chí sắp xếp phụ (thường là theo khóa) vào bất kỳ tiêu chí thứ tự nào được chỉ định để đảm bảo các item luôn được sắp xếp nhất quán.

**Kết quả bị thiếu/lặp lại:** Ngay cả khi server áp dụng thứ tự sắp xếp nhất quán, kết quả MAY bị thiếu hoặc lặp lại do việc tạo hoặc xóa các resource khác.
Client MUST sẵn sàng xử lý những sai lệch này.
Server SHOULD luôn mã hóa ID của bản ghi được đọc gần nhất, giúp client quản lý các kết quả bị lặp/thiếu.

**Kết hợp phân trang do client và do server điều khiển:** Lưu ý rằng phân trang do client điều khiển không loại trừ phân trang do server điều khiển.
Nếu kích thước trang mà client yêu cầu lớn hơn kích thước trang mặc định mà server hỗ trợ, response kỳ vọng sẽ có số kết quả do client chỉ định, được phân trang theo cài đặt phân trang của server.

**Kích thước trang:** Client MAY yêu cầu phân trang do server điều khiển với kích thước trang cụ thể bằng cách chỉ định preference _$maxpagesize_.
Server SHOULD tuân theo preference này nếu kích thước trang được chỉ định nhỏ hơn kích thước trang mặc định của server.

**Phân trang các collection nhúng:** Cả phân trang do client điều khiển và do server điều khiển đều có thể được áp dụng cho các collection nhúng.
Nếu server phân trang một collection nhúng, server MUST bổ sung thêm các token `nextLink` khi thích hợp.

**Số lượng recordset:** Nhà phát triển muốn biết tổng số bản ghi trên tất cả các trang MAY thêm tham số query _$count=true_ để yêu cầu server đưa số lượng item vào response.

## 9. Các thao tác collection kết hợp

Các thao tác lọc, sắp xếp và phân trang MAY được thực hiện đồng thời trên một collection nhất định.
Khi các thao tác này được thực hiện cùng nhau, thứ tự đánh giá MUST là:

1. **Lọc**. Bao gồm mọi biểu thức khoảng (range) được thực hiện như một phép AND.
2. **Sắp xếp**. Danh sách (có thể đã được lọc) được sắp xếp theo tiêu chí sắp xếp.
3. **Phân trang**. Chế độ xem phân trang đã được hiện thực hóa (materialized) được trình bày trên danh sách đã lọc và sắp xếp. Điều này áp dụng cho cả phân trang do server điều khiển và phân trang do client điều khiển.

## 10. Kết quả rỗng

Khi thực hiện lọc trên một collection và tập kết quả rỗng, bạn MUST phản hồi với body response hợp lệ và mã response 200.
Trong ví dụ này, các bộ lọc do client cung cấp cho ra tập kết quả rỗng.
Body response được trả về như bình thường và thuộc tính _value_ được đặt là một collection rỗng.
Bạn SHOULD giữ sự nhất quán trong API của mình bất cứ khi nào có thể.

```http
GET https://graph.microsoft.com/beta/teamwork/devices?$filter=('deviceType'  eq 'Collab' or companyAssetTa eq 'Tag1')
Accept: application/json

HTTP/1.1 200 OK
Content-Type: application/json

{
   "value": []
}
```

## 11. Collection của các kiểu cấu trúc (complex type hoặc primitive type)

Entity type thường được ưu tiên cho collection vì không thể tham chiếu riêng lẻ đến các complex type trong một collection. Collection của complex type, bao gồm mọi thuộc tính lồng bên trong, phải được cập nhật như một đơn vị duy nhất, thay thế hoàn toàn nội dung hiện có. Ngay cả khi API của bạn hiện chỉ đọc, việc mô hình hóa nó thành collection của các entity sẽ mang lại cho bạn sự linh hoạt hơn trong việc tham chiếu đến từng thành viên, cả bây giờ lẫn sau này. 
Đôi khi, các thuộc tính collection cấu trúc được thêm vào một kiểu, rồi sau đó mới phát hiện ra các kịch bản đòi hỏi một collection của entity type.
Hãy xét mô hình sau với entity type `application` có một collection các `keyCredential`:

```xml
<EntityType Name="application">
  <Key>
    <PropertyRef Name="id" />
  </Key>
  <Property Name="id" Type="Edm.String" Nullable="false" />
  <Property Name="keyCredentials" Type="Collection(self.keyCredential)" />
  ...
</EntityType>

<ComplexType Name="keyCredential">
  <Property Name="keyId" Type="Edm.Guid" />
  <Property Name="endDateTime" Type="Edm.DateTimeOffset" />
  ...
</ComplexType>
```
và một kịch bản phát sinh đòi hỏi, chẳng hạn, phải xóa từng `keyCredential` riêng lẻ khỏi collection. 
Có hai hướng đi:

### 11.1 Thuộc tính collection song song (cho mọi collection của kiểu cấu trúc)

Mô hình có thể được cập nhật để có hai collection song song, đồng thời ngừng hỗ trợ collection hiện có:
```diff
<EntityType Name="application">
  <Key>
    <PropertyRef Name="id" />
  </Key>
  <Property Name="id" Type="Edm.String" Nullable="false" />
  <Property Name="keyCredentials" Type="Collection(self.keyCredential)">
+   <Annotation Term="Org.OData.Core.V1.Revisions">
+     <Collection>
+       <Record>
+         <PropertyValue Property = "Date" Date="2020-08-20"/>
+         <PropertyValue Property = "Version" String="2020-08/KeyCredentials"/>
+         <PropertyValue Property = "Kind" EnumMember="Org.OData.Core.V1.RevisionKind/Deprecated"/>
+         <PropertyValue Property = "Description" String="keyCredentials has been deprecated. Please use keyCredentials_v2 instead."/>
+         <PropertyValue Property = "RemovalDate" Date="2022-08-20"/>
+       </Record>
+     </Collection>
+   </Annotation>
+ </Property>
+ <NavigationProperty Name="keyCredentials_v2" Type="Collection(self.keyCredential_v2)" ContainsTarget="true" />
</EntityType>

<ComplexType Name="keyCredential">
  <Property Name="keyId" Type="Edm.Guid" />
  <Property Name="endDateTime" Type="Edm.DateTimeOffset" />
</ComplexType>

+<EntityType Name="keyCredential_v2">
+ <Key>
+   <PropertyRef Name="keyId" />
+ </Key>
+ <Property Name="keyId" Type="Edm.Guid" />
+ <Property Name="endDateTime" Type="Edm.DateTimeOffset" />
+</EntityType>
```
Giờ đây client có thể tham chiếu đến từng `keyCredential` riêng lẻ bằng `keyId` làm khóa, và có thể xóa các `keyCredential` đó bằng request `DELETE`:
```http
DELETE /applications/{applicationId}/keyCredentials_v2/{some_keyId}
```
```http
HTTP/1.1 204 No Content
```
Khi cả hai thuộc tính cùng tồn tại trên graph, kỳ vọng là `keyCredentials` và `keyCredentials_v2` được coi là hai "góc nhìn" (view) vào cùng một dữ liệu.
Để đáp ứng kỳ vọng này, các workload phải:
1. Giữ cho các thuộc tính nhất quán giữa `keyCredential` và `keyCredential_v2`.
Mọi thay đổi đối với một kiểu phải được phản ánh ở kiểu còn lại.
2. Từ chối các request cập nhật cả hai collection cùng lúc.
Một request thêm item vào `keyCredentials_v2` trong khi thay thế nội dung của `keyCredentials` phải bị từ chối với `400`, ví dụ:
```http
PATCH /applications/{applicationId}
{
  "keyCredentials": [
    {
      "keyId": "10000000-0000-0000-0000-000000000000",
      "endDateTime": "2012-12-03T07:16:23Z"
    }
  ],
  "keyCredentials_v2@delta": [
    {
      "keyId": "20000000-0000-0000-0000-000000000000",
      "endDateTime": "2012-12-03T07:16:23Z"
    }
  ]
}
```
```http
HTTP/1.1 400 Bad Request
{
  "error": {
    "code": "badRequest",
    "message": "'keyCredentials' and 'keyCredentials_v2' cannot be updated in the same request.",
}
```

### 11.2 Định nghĩa lại thành Entity Type (cho collection của complex type)

Mô hình có thể được cập nhật đơn giản bằng cách chuyển complex type thành entity type:
```diff
<EntityType Name="application">
  <Key>
    <PropertyRef Name="id" />
  </Key>
  <Property Name="id" Type="Edm.String" Nullable="false" />
- <Property Name="keyCredentials" Type="Collection(self.keyCredential)" />
+ <NavigationProperty Name="keyCredentials" Type="Collection(self.keyCredential)" ContainsTarget="true" />
</EntityType>

- <ComplexType Name="keyCredential">
+ <EntityType Name="keyCredential">
+ <Key>
+   <PropertyRef Name="keyId" />
+ </Key>
  <Property Name="keyId" Type="Edm.Guid" />
  <Property Name="endDateTime" Type="Edm.DateTimeOffset" />
-</ComplexType>
+</EntityType>
```
Để duy trì tương thích ngược **và** tuân thủ chuẩn OData, workload phải xử lý một số thay đổi về ngữ nghĩa sau:
1. Các client hiện có trước đây có thể `$select` thuộc tính `keyCredentials`.
Giờ đây khi `keyCredentials` là một navigation property, [chuẩn OData](https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part2-url-conventions.html#_Toc31361040) quy định rằng navigation link của nó phải được trả về khi nó được `$select`:

> If the select item is a navigation property, then the corresponding navigation link is represented in the response.

Vì hành vi trước đây của `$select=keyCredentials` là đưa collection vào response, và vì chuẩn quy định rằng navigation link phải được đưa vào response, nên hành vi mới là đưa cả hai:

```http
GET /applications/{applicationId}?$select=keyCredentials
```
```http
200 OK
{
  "id": "{applicationId}",
  "keyCredentials": [
    {
      "keyId": "30000000-0000-0000-0000-000000000000",
      "endDateTime": "2012-12-03T07:16:23Z",
      ...
    },
    ...
  ],
  "keyCredentials@odata.navigationLink": "/applications('{applicationId}')/keyCredentials"
}
```

2. Hành vi mặc định của các collection cấu trúc là được đưa vào payload response của entity chứa chúng. Nếu đây là hành vi trước đây của `application`, thì nó phải được giữ nguyên bằng cách **tự động mở rộng (auto-expand)** thuộc tính `keyCredentials` vì giờ đây nó là một navigation property (do hành vi mặc định của navigation property là **không** mở rộng chúng).
3. Các collection cấu trúc có thể được cập nhật bằng request `PATCH` đến entity chứa nó để thay thế toàn bộ nội dung của collection. Nếu dịch vụ từng hỗ trợ các cập nhật như vậy đối với collection cấu trúc, thì các cập nhật đối với navigation property mới phải giữ nguyên hành vi này.
