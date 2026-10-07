# Upsert

Mẫu thiết kế API của Microsoft Graph

*Mẫu thiết kế `Upsert` là một thao tác idempotent không phá hủy dữ liệu, sử dụng key do client cung cấp, nhằm đảm bảo các resource của hệ thống có thể được triển khai một cách đáng tin cậy, lặp lại được và có kiểm soát; thường được dùng trong các kịch bản Infrastructure as Code (IaC).*

## Vấn đề

Infrastructure as code (IaC) định nghĩa các resource và topology của hệ thống theo cách khai báo, cho phép các nhóm quản lý những resource đó như quản lý mã nguồn.
Áp dụng IaC giúp các nhóm triển khai resource của hệ thống một cách đáng tin cậy, lặp lại được và có kiểm soát. 
IaC cũng giúp tự động hóa việc triển khai và giảm rủi ro sai sót do con người, đặc biệt với các môi trường lớn và phức tạp. 
Khách hàng muốn áp dụng các thực hành IaC cho nhiều resource được quản lý thông qua Microsoft Graph.

Thao tác tạo của hầu hết các resource trong Microsoft Graph vốn không idempotent.
Do đó, các bên sử dụng API muốn cung cấp giải pháp IaC phải xây dựng các lớp bù trừ để mô phỏng hành vi idempotent. 
Ví dụ, khi tạo một resource, lớp bù trừ phải kiểm tra xem resource đó đã tồn tại hay chưa trước khi thử tạo hoặc cập nhật resource.

Ngoài ra, các script hoặc template IaC thường dùng tên (hoặc key) do client cung cấp để theo dõi resource một cách dễ dự đoán, trong khi [hướng dẫn của Microsoft Graph](../GuidelinesGraph.md#behavior-modeling) đề xuất dùng `POST` để tạo entity mới với key do dịch vụ sinh ra.

## Giải pháp

Giải pháp là dùng mẫu thiết kế `Upsert`, để giải quyết vấn đề tạo không idempotent và vấn đề đặt tên do client cung cấp.

* `Upsert` dùng `PATCH` với key do client cung cấp trong URL:
  * Nếu có một key tự nhiên do client cung cấp có thể đóng vai trò primary key, thì dịch vụ nên hỗ trợ `Upsert` với key đó.
  * Nếu primary key do dịch vụ sinh ra, key do client cung cấp nên dùng một [alternate key](./alternate-key.md) để hỗ trợ việc tạo idempotent.
  * Với một resource không tồn tại (được chỉ định bởi key do client cung cấp), dịch vụ phải xử lý đây là thao tác "tạo" (còn gọi là insert). Trong quá trình tạo, dịch vụ vẫn phải sinh giá trị primary key, nếu phù hợp.
  * Với một resource đã tồn tại (được chỉ định bởi key do client cung cấp), dịch vụ phải xử lý đây là thao tác "cập nhật".
* Nếu dùng alternate key, thì
  * đối với các kịch bản IaC, alternate key nên được đặt tên là `uniqueName`, nếu chưa có thuộc tính nào tự nhiên hơn có thể dùng làm alternate key.
  * dịch vụ cũng phải hỗ trợ `GET` bằng mẫu alternate key.
* Dịch vụ nên luôn hỗ trợ `POST` tới URL của collection.
  * Với key do dịch vụ sinh ra, thao tác này nên trả về key do server sinh ra.
  * Với key do client cung cấp, client có thể cung cấp key như một phần của request payload.
* Nếu một dịch vụ không hỗ trợ `Upsert`, thì một lệnh gọi `PATCH` tới resource không tồn tại phải trả về lỗi HTTP "404 not found".

Giải pháp này cho phép các resource hiện có tuân theo quy ước của Microsoft Graph cho các thao tác CRUD bổ sung `Upsert` mà không ảnh hưởng đến các ứng dụng hoặc chức năng hiện có.

Lý tưởng nhất, mọi entity type mới nên hỗ trợ cơ chế `Upsert`, đặc biệt khi chúng hỗ trợ các API control-plane, hoặc được dùng trong các kịch bản kiểu quản trị hoặc IaC.

## Khi nào nên dùng mẫu thiết kế này

Mẫu thiết kế này nên được áp dụng cho các resource được quản lý thông qua infrastructure as code hoặc cấu hình theo trạng thái mong muốn (desired state configuration).

## Các vấn đề và điểm cần cân nhắc

* Các dịch vụ có API hiện có dùng key do client định nghĩa và muốn bắt đầu hỗ trợ mẫu thiết kế `Upsert` có thể có lo ngại về tương thích ngược.
Bên cung cấp API có thể yêu cầu client chủ động chọn tham gia (opt-in) mẫu thiết kế `Upsert`, bằng cách dùng request header HTTP `Prefer: create-if-missing`.
* `Upsert` cũng có thể được hỗ trợ đối với singleton, bằng cách dùng `PATCH` tới URL của singleton.
* Các dịch vụ hỗ trợ `Upsert` nên cho phép client dùng:
  * request header `If-Match=*` để chỉ rõ việc xử lý một request `Upsert` là cập nhật chứ không phải insert.
  * request header `If-None-Match=*` để chỉ rõ việc xử lý một request `Upsert` là insert chứ không phải cập nhật.
* Alternate key do client cung cấp phải bất biến sau khi được đặt. Nếu giá trị của nó là null thì nên cho phép đặt giá trị, như một cách để điền bổ sung (backfill) cho các resource hiện có nhằm dùng trong các kịch bản IaC.
* Bên cung cấp API có thể dùng thao tác `PUT` để tạo hoặc cập nhật, nhưng nhìn chung cách tiếp cận này không được khuyến nghị do tính chất phá hủy của ngữ nghĩa thay thế của `PUT`.
* Bên cung cấp API có thể chú thích (annotate) entity set, singleton và collection để cho biết các entity có thể được "upsert". Ví dụ dưới đây cho thấy annotation này đối với entity set `groups`.  

```xml
<EntitySet Name="groups" EntityType="microsoft.graph.group">
  <Annotation Term="Org.OData.Capabilities.V1.UpdateRestrictions">
    <Record>
      <PropertyValue Property="Upsertable" Bool="true"/>
    </Record>
  </Annotation>
</EntitySet>
```

## Ví dụ

Trong các ví dụ này, chúng ta dùng entity type `group`, định nghĩa cả primary key (do dịch vụ sinh ra, `id`) lẫn alternate key (do client cung cấp, `uniqueName`). 

```xml
<EntityType Name="group">
  <Key>
    <PropertyRef Name="id"/>
  </Key>
  <Property Name="id" Type="Edm.String"/> 
  <Property Name="uniqueName" Type="Edm.String"/>
  <Property Name="displayName" Type="Edm.String"/>
  <Property Name="description" Type="Edm.String"/> 
  <Annotation Term="Org.OData.Core.V1.AlternateKeys">
    <Collection>
      <Record Type="Org.OData.Core.V1.AlternateKey">
        <PropertyValue Property="Key">
        <Collection>
            <Record Type="Org.OData.Core.V1.PropertyRef">
            <PropertyValue Property="Name" PropertyPath="uniqueName" />
            </Record>
        </Collection>
        </PropertyValue>
      </Record>
    </Collection>
  </Annotation>
  </Property>
</EntityType>
```

### Upsert một bản ghi (nhánh tạo mới)

Tạo một group mới, với `uniqueName` là "Group157". Trong trường hợp này, group này chưa tồn tại.

```http
PATCH /groups(uniqueName='Group157')
Prefer: return=representation
```

```json
{
    "displayName": "My favorite group",
    "description": "All my favorite people in the world"
}
```

Response:

```http
201 created
Preference-Applied: return=representation
```

```json
{
    "id": "1a89ade6-9f59-4fea-a139-23f84e3aef66",
    "displayName": "My favorite group",
    "description": "All my favorite people in the world",
    "uniqueName": "Group157"
}
```

### Upsert một bản ghi (nhánh cập nhật)

Tạo một group mới, với `uniqueName` là "Group157", hoàn toàn giống như trước. Chỉ khác là trong trường hợp này, group đã tồn tại. Đây là một kịch bản phổ biến trong IaC, khi một template triển khai được chạy lại nhiều lần.

```http
PATCH /groups(uniqueName='Group157')
Prefer: return=representation
```

```json
{
    "displayName": "My favorite group",
    "description": "All my favorite people in the world"
}
```

Response:

```http
200 ok
Preference-Applied: return=representation
```

```json
{
    "id": "1a89ade6-9f59-4fea-a139-23f84e3aef66",
    "displayName": "My favorite group",
    "description": "All my favorite people in the world",
    "uniqueName": "Group157"
}
```

Lưu ý thao tác này vốn idempotent như thế nào, thay vì trả về lỗi 409 conflict.

### Cập nhật một bản ghi

Cập nhật group "Group157" với một description mới.

```http
PATCH /groups(uniqueName='Group157')
Prefer: return=representation
```

```json
{
    "description": "Some of my favorite people in the world."
}
```

Response:

```http
200 ok
Preference-Applied: return=representation
```

```json
{
    "id": "1a89ade6-9f59-4fea-a139-23f84e3aef66",
    "displayName": "My favorite group",
    "description": "Some of my favorite people in the world.",
    "uniqueName": "Group157"
}
```

### Request opt-in Upsert

Trong trường hợp này, group API là một API đã có sẵn, hỗ trợ `PATCH` với alternate key do client cung cấp. Để bật hành vi `Upsert`,
client phải opt-in bằng một request header HTTP, để tạo một group mới bằng `PATCH`.

```http
PATCH /groups(uniqueName='Group157')
Prefer: create-if-missing; return=representation
```

```json
{
    "displayName": "My favorite group",
    "description": "All my favorite people in the world"
}
```

Response:

```http
201 created
Preference-Applied: create-if-missing; return=representation
```

```json
{
    "id": "1a89ade6-9f59-4fea-a139-23f84e3aef66",
    "displayName": "My favorite group",
    "description": "All my favorite people in the world",
    "uniqueName": "Group157"
}
```

### Upsert (tạo) không được hỗ trợ

Tiếp nối ví dụ trước, cùng request đó để tạo một group mới, với `uniqueName` là "Group157",
nhưng không có header opt-in, sẽ cho ra mã phản hồi HTTP 404.

```http
PATCH /groups(uniqueName='Group157')
Prefer: return=representation
```

```json
{
    "displayName": "My favorite group",
    "description": "All my favorite people in the world"
}
```

Response:

```http
404 not found
```
