# Dictionary

Mẫu thiết kế API của Microsoft Graph

_Kiểu dictionary cho phép tạo một tập các cặp key/value, trong đó tập các key do bên sử dụng API chỉ định một cách động._

## Vấn đề

Thiết kế API đòi hỏi một resource phải chứa một lượng giá trị dữ liệu không xác định trước, với các key do bên sử dụng API định nghĩa.

## Giải pháp

Nhà thiết kế API dùng một đối tượng JSON để biểu diễn dictionary trong payload response `application/json`. Khi mô tả model trong CSDL, có thể tạo một complex type mới kế thừa từ `graph.Dictionary` và tùy chọn dùng `Org.OData.Validation.V1.OpenPropertyTypeConstraint` để giới hạn kiểu được phép dùng cho các giá trị trong dictionary cho phù hợp.

Các mục của dictionary có thể được thêm, xóa hoặc sửa đổi bằng `PATCH` lên thuộc tính dictionary. Một mục được xóa bằng cách đặt thuộc tính đó thành `null`.

## Khi nào nên dùng mẫu thiết kế này

Trước khi dùng kiểu dictionary trong định nghĩa API của bạn, hãy bảo đảm kịch bản của bạn đáp ứng các tiêu chí sau:

- Các giá trị dữ liệu MUST liên quan với nhau về mặt ngữ nghĩa như một collection.
- Các giá trị MUST là kiểu primitive hoặc complex type.
- Client MUST là bên định nghĩa các key của kiểu này, thay vì dịch vụ định nghĩa trước.

### Các lựa chọn thay thế

- [Open extensions](https://docs.microsoft.com/graph/extensibility-open-users) khi bạn muốn cho phép client mở rộng Microsoft Graph.
- [Complex types](https://docs.microsoft.com/odata/webapi/complextypewithnavigationproperty) khi tập các giá trị dữ liệu đã biết trước.

## Các vấn đề và điểm cần cân nhắc

Dictionary, đôi khi còn gọi là map, là một collection các cặp tên-giá trị. Chúng cho phép truy cập các tập dữ liệu động một cách có hệ thống và là một sự dung hòa tốt giữa cấu trúc được định nghĩa chặt chẽ từ trước với đầy đủ các thuộc tính có tên và một đối tượng động được định nghĩa lỏng lẻo (chẳng hạn OData OpenTypes).

Vì các mục của dictionary được xóa bằng cách đặt giá trị thành `null`, dictionary không hỗ trợ giá trị null.

Để biết thêm thông tin, xem [tài liệu tham chiếu OData](https://github.com/oasis-tcs/odata-vocabularies/blob/master/vocabularies/Org.OData.Core.V1.md#dictionary).

## Ví dụ

### String dictionary

#### Khai báo CSDL
Ví dụ sau minh họa cách định nghĩa một dictionary có thể chứa các giá trị chuỗi.

```xml
<Schema Namespace="microsoft.graph"> <!--NOTE: the namespace that declares the Dictionary complex type *must* be microsoft.graph-->
  <ComplexType Name="Dictionary" OpenType="true">
    <Annotation Term="Core.Description" String="A dictionary of name-value pairs. Names must be valid property names, values may be restricted to a list of types via an annotation with term `Validation.OpenPropertyTypeConstraint`." />
  </ComplexType>
</Schema>
<Schema Namespace="WorkloadNamespace">
  <ComplexType Name="stringDictionary" OpenType="true" BaseType="microsoft.graph.Dictionary">
    <Annotation Term="Org.OData.Validation.V1.OpenPropertyTypeConstraint">
      <Collection>
        <String>Edm.String</String>
      </Collection>
    </Annotation>
  </ComplexType>
</Schema>
```

Lưu ý rằng việc kiểm tra hợp lệ schema sẽ thất bại do cách viết hoa của `Dictionary`.
Cảnh báo này nên được bỏ qua.

#### Định nghĩa một thuộc tính dictionary
Ví dụ sau cho thấy cách định nghĩa một thuộc tính dictionary, "userTags", trên entity type item.

```xml
<EntityType Name="item">
  ...
  <Property Name="userTags" Type="WorkloadNamespace.stringDictionary"/>
</EntityType>
```

#### Đọc một dictionary
Dictionary được biểu diễn trong payload JSON dưới dạng một đối tượng JSON, trong đó tên các thuộc tính là các key và giá trị của chúng là các giá trị tương ứng của key. 

Ví dụ sau cho thấy cách đọc một item có thuộc tính dictionary tên "userTags":

```HTTP
GET /item
```
Response:
```json
{
  ...
  "userTags":
  {
    "anniversary": "2002-05-19",
    "favoriteMovie": "Princess Bride"
  }
}
```

#### Đặt một giá trị dictionary
Ví dụ sau cho thấy cách đặt một giá trị dictionary.  Nếu "hairColor" đã tồn tại thì nó được cập nhật, nếu chưa thì nó được thêm vào.

```http
PATCH /item/userTags
```
```json
{
   "hairColor": "purple"
}
```

#### Xóa một giá trị dictionary
Một giá trị dictionary có thể được xóa bằng cách đặt giá trị đó thành null.
```http
PATCH /item/userTags
```
```json
{
   "hairColor": null
}
```

### Dictionary kiểu complex

#### Khai báo CSDL
Dictionary cũng có thể chứa các complex type, với các giá trị có thể bị giới hạn trong một tập complex type cụ thể.

Ví dụ sau định nghĩa một complex type **roleSettings**, một **assignedRoleGroupDictionary** chứa các **roleSettings**, và một thuộc tính **assignedRoles** sử dụng dictionary đó..

```xml
<Schema Namespace="microsoft.graph"> <!--NOTE: the namespace that declares the Dictionary complex type *must* be microsoft.graph-->
  <ComplexType Name="Dictionary" OpenType="true">
    <Annotation Term="Core.Description" String="A dictionary of name-value pairs. Names must be valid property names, values may be restricted to a list of types via an annotation with term `Validation.OpenPropertyTypeConstraint`." />
  </ComplexType>
</Schema>
<Schema Namespace="WorkloadNamespace">
  <EntityType Name="principal">
    ...
    <Property Name="assignedRoles" Type="WorkloadNamespace.assignedRoleGroupDictionary">
  </EntityType>

  <ComplexType Name="roleSettings">
    <Property Name ="domain" Type="Edm.String" Nullable="false" />
  </ComplexType>

  <ComplexType Name="assignedRoleGroupDictionary" BaseType="microsoft.graph.Dictionary">
    <!-- Note: Strongly-typed dictionary of roleSettings keyed by name of roleGroup. -->
    of roleSettings
    keyed by name of roleGroup. -->
    <Annotation Term="Org.OData.Validation.V1.OpenPropertyTypeConstraint">
      <Collection>
        <String>microsoft.graph.roleSettings</String>
      </Collection>
    </Annotation>
  </ComplexType>
</Schema>
```

#### Đọc một entity có dictionary kiểu complex

Ví dụ sau minh họa cách đọc một entity chứa dictionary kiểu complex "assignedRoles".

```HTTP
GET /users/10
```

Response:

```json
{
  "id": "10",
  "displayName": "Jane Smith",
  "assignedRoles": {
    "author": {
      "domain": "contoso"
    },
    "maintainer": {
      "domain": "fabrikam"
    },
    "architect": {
      "domain": "adventureWorks"
    }
  }
}
```

#### Đọc thuộc tính dictionary
Ví dụ sau cho thấy cách chỉ lấy thuộc tính dictionary "assignedRoles".

```HTTP
GET /users/10/assignedRoles
```

Response:

```json
{
  "author": {
    "domain": "contoso"
  },
  "maintainer": {
    "domain": "fabrikam"
  },
  "architect": {
    "domain": "adventureWorks"
  }
}
```

#### Đọc một mục riêng lẻ từ dictionary
Ví dụ sau cho thấy cách đọc một mục kiểu complex tên "author" từ dictionary "assignedRoles".

```HTTP
GET /users/10/assingedRoles/author
```

Response:

```json
{
  "domain": "contoso"
}
```

#### Đặt một mục riêng lẻ trong dictionary
Các ví dụ sau cho thấy cách cập nhật dictionary để đặt giá trị cho mục "author". Nếu mục "author" chưa tồn tại thì nó được thêm vào với các giá trị đã chỉ định; ngược lại, nếu mục "author" đã tồn tại thì nó được cập nhật với các giá trị đã chỉ định (các giá trị không được chỉ định sẽ giữ nguyên).

```HTTP
PATCH /users/10/assignedRoles/author
```
```json
{
  "author" : {
     "domain": "contoso"
  }
}
```

#### Xóa một mục riêng lẻ khỏi dictionary
Ví dụ sau cho thấy cách xóa mục "author" bằng cách đặt giá trị của nó thành null.

```HTTP
PATCH /users/10/assignedRoles
```
```json
{
  "author": null
}
```

#### Đặt nhiều mục dictionary
Ví dụ sau đặt giá trị cho các mục "author", "maintainer" và "viewer", đồng thời xóa mục "architect" bằng cách đặt nó thành null.

```HTTP
PATCH /users/10/assignedRoles
```
```json
{
  "author": {
    "domain": "contoso1"
  },
  "maintainer": {
    "domain": "fabrikam1"
  },
  "reviewer": {
    "domain": "fabrikam"
  },
  "architect": null
}

```

## Xem thêm

- [Hướng dẫn triển khai SDK](./dictionary-client-guidance.md)
