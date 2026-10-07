# Navigation Property

Mẫu thiết kế API của Microsoft Graph

*Navigation property được dùng để xác định mối quan hệ giữa các resource.*

## Vấn đề
--------

Việc biểu diễn mối quan hệ giữa các resource trong một API thường rất có giá trị. 

Mối quan hệ giữa các resource thường được biểu diễn ngầm bằng một thuộc tính nằm trong một resource, cung cấp khóa tới resource liên quan. Thông thường thông tin đó được trả về trong biểu diễn dưới dạng giá trị id và thuộc tính được đặt tên theo quy ước xác định kiểu đích của resource liên quan. ví dụ: userId 

Việc dùng các thuộc tính khóa ngoại để mô tả resource liên quan là một cơ chế định kiểu yếu và đòi hỏi nhà phát triển phải có thêm thông tin để duyệt theo mối quan hệ. Việc khám phá các resource liên quan không hề đơn giản.

## Giải pháp
--------

Navigation property là một [quy ước OData](https://docs.microsoft.com/en-us/odata/webapi/model-builder-untyped#navigation-property) được định nghĩa trong [CSDL Specification](https://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/odata-csdl-xml-v4.01.html#_Toc38530365), cho phép nhà thiết kế API mô tả một loại thuộc tính đặc biệt trong model tham chiếu tới một entity liên quan. Trong HTTP API, tên thuộc tính này chuyển thành một path segment có thể được nối vào URL của resource chính để truy cập biểu diễn của resource liên quan. Điều này giúp client không cần biết thêm bất kỳ thông tin nào về cách xây dựng URL tới resource liên quan, và client không cần truy xuất resource chính nếu chỉ quan tâm đến resource liên quan.  Việc triển khai API có trách nhiệm xác định Id của resource liên quan và trả về biểu diễn của entity liên quan. Ví dụ:

     -  /user/{userId}/manager  biểu diễn mối quan hệ many-to-one
     -  /user/{userId}/messages biểu diễn mối quan hệ one-to-many

Ngoài ra, khi dùng tham số query Expand của OData, các entity liên quan có thể được lồng vào entity chính để cả hai được truy xuất chỉ trong một lần round trip.

Các mối quan hệ này có thể được mô tả trong CSDL như sau:

```xml
<EntityType Name="user">
  <NavigationProperty Name="manager" Type="user" ContainsTarget="false" >
  <NavigationProperty Name="messages" Type="user" ContainsTarget="true" >
</EntityType>
```

## Vấn đề và các điều cần cân nhắc
-------------------------

Trong triển khai Microsoft Graph hiện tại, có những kịch bản dùng navigation property xuyên qua các backend service được hỗ trợ tự động; cũng có một số hạn chế đối với các kịch bản khác. Các hạn chế này đang được loại bỏ dần theo thời gian, nhưng vẫn cần đảm bảo có hỗ trợ cho từng kịch bản cụ thể.  [Hỗ trợ tự động và các hạn chế của triển khai hiện tại](https://dev.azure.com/msazure/One/_wiki/wikis/Microsoft%20Graph%20Partners/354352/Cross-workload-navigations?anchor=supported-scenarios) được ghi lại trong tài liệu nội bộ.
 
Các navigation property được định nghĩa trong một entity không được trả về theo mặc định khi truy xuất biểu diễn của entity, trừ khi dịch vụ chủ động muốn như vậy. Bên sử dụng API có thể dùng tham số query `expand`, ở nơi được hỗ trợ, để truy xuất cả entity nguồn và entity đích của mối quan hệ trong một request duy nhất.

Việc triển khai hỗ trợ truy cập "$ref" của một navigation property cho phép bên gọi chỉ trả về URL của resource liên quan. ví dụ: `/user/23/manager/$ref`. Điều này hữu ích khi client muốn xác định resource liên quan nhưng không cần tất cả các thuộc tính của nó.

Bản chất định kiểu mạnh của navigation property có giá trị đối với các backend service và ứng dụng client, so với thuộc tính khóa ngoại định kiểu yếu.
Định kiểu mạnh cho phép tự động tạo một phần tài liệu và hình ảnh trực quan hóa, cho phép tạo SDK, và cho phép tự động tạo một phần mã client; nó cũng loại bỏ nhu cầu lưu trữ dữ liệu trùng lặp ở phía dịch vụ và do đó cải thiện tính nhất quán dữ liệu giữa các API vì dữ liệu trùng lặp không cần phải được làm mới thường xuyên. 

## Khi nào nên dùng mẫu thiết kế này
------------------------

### Mối quan hệ "many-to-one"  

Nên ưu tiên dùng navigation property hơn là thêm một trường Id để tham chiếu tới entity liên quan trong mối quan hệ many-to-one.  Giá trị Id buộc client phải thực hiện hai lần round trip để truy xuất chi tiết của entity liên quan.  Với navigation property, client có thể truy xuất entity liên quan chỉ trong một lần round trip. 
 
Các mối quan hệ many-to-one luôn là mối quan hệ không chứa (non-contained) vì vòng đời của đích không thể phụ thuộc vào nguồn.

```xml
<EntityType Name="order">
  <NavigationProperty Name="customer" Type="customer" ContainsTarget="false" >
</EntityType>
```


### Mối quan hệ "zero-or-one-to-one"  

Các navigation property này có thể được dùng như một cơ chế tổ chức cấu trúc để tách các thuộc tính của một entity theo cách tương tự như cách complex type thường được dùng. Khác biệt chính là đích của navigation property không được trả về theo mặc định khi truy xuất entity nguồn.  Nên ưu tiên dùng navigation property hơn thuộc tính complex khi thông tin nguồn và đích đến từ các backend API khác nhau.

Các mối quan hệ này phải là mối quan hệ chứa (contained).  

```xml
<EntityType Name="invoice">
  <NavigationProperty Name="paymentDetails" Type="paymentInfo" ContainsTarget="true" >
</EntityType>
```

### Mối quan hệ "one-to-many"

Các resource có thuộc tính Id của cha nằm trong resource con có thể dùng một navigation property trong resource cha được khai báo là một collection các resource con. Nếu cần, cũng có thể tạo một navigation property cha trong resource con trỏ tới resource cha. Điều này thường không cần thiết vì URL của cha là một tập con của URL resource con. Cách dùng chính của nó là khi truy xuất các resource con và chọn mở rộng các thuộc tính của resource cha để cả hai được truy xuất trong một request duy nhất.  

`/invoice/{invoiceId}/items/{itemId}?expand=parentInvoice(select=invoiceDate,Customer)`

```xml
<EntityType Name="invoice">
  <NavigationProperty Name="items" Type="invoiceItem" ContainsTarget="true" >
</EntityType>

<EntityType Name="invoiceItem">
  <NavigationProperty Name="parentInvoice" Type="invoice" ContainsTarget="false" >
</EntityType>
```

Các mối quan hệ one-to-many có thể là mối quan hệ chứa (contained) hoặc không chứa (non-contained).


## Ví dụ
-------

### Truy xuất một entity liên quan

```http
GET /users/{id}/manager?$select=id,displayName

200 OK
Content-Type: application/json

{
  "id": "6b3ee805-c449-46a8-aac8-8ff9cff5d213",
  "displayName": "Bob Boyce"
}
```

Navigation property này có thể được mô tả bằng CSDL sau: 
```xml
<EntityType Name="user">
  <NavigationProperty Name="manager" Type="graph.user" ContainsTarget="false" >
</EntityType>
```
`ContainsTarget` được đặt là false cho rõ ràng, đây là giá trị mặc định khi bỏ qua thuộc tính này.
### Truy xuất tham chiếu tới một entity liên quan

```http
GET /users/{id}/manager/$ref

200 OK
Content-Type: application/json

{
  "@odata.id": "https://graph.microsoft.com/v1.0/directoryObjects/6b3ee805-c449-46a8-aac8-8ff9cff5d213/Microsoft.DirectoryServices.User"
}
```
Lưu ý: Hiện tại URL gốc được trả về trong kết quả $ref không chính xác.  Để xử lý các URL này, client sẽ cần chuyển URL đó thành URL Graph.

### Truy xuất một entity kèm entity liên quan

```http
GET /users/{id}?select=id,displayName&expand=manager(select=id,displayName)

200 OK
Content-Type: application/json

{
  "id": "3f057904-f936-4bf0-9fcc-c1e6f84289d8",
  "displayName": "Jim James",
  "manager": {
    "@odata.type": "#microsoft.graph.user",
    "id": "6b3ee805-c449-46a8-aac8-8ff9cff5d213",
    "displayName": "Bob Boyce"
  }
}
```

### Tạo một entity có tham chiếu tới entity liên quan

Tạo một user mới tham chiếu tới một manager hiện có
```http
POST /users
Content-Type: application/json

{
    "displayName": "Bob",
    "manager@odata.bind": "https://graph.microsoft.com/v1.0/users/{managerId}"
}

201 Created
```

### Cập nhật tham chiếu tới entity liên quan

Cập nhật entity user để chứa mối quan hệ tới một manager hiện có.
 
```http
PATCH /users/{id}
Content-Type: application/json

{
    "displayName": "Bob",
    "manager@odata.bind": "https://graph.microsoft.com/v1.0/users/{managerId}"
}

204 No Content
```
 
### Xóa tham chiếu tới entity liên quan

Xóa mối quan hệ giữa user và manager.
 
```http
DELETE /users/{id}/manager/$ref

204 No Content
```

Xóa entity liên quan.

```http
DELETE /users/{id}/manager

204 No Content
```
