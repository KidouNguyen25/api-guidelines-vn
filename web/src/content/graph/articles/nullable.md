# Thuộc tính nullable

Một thuộc tính nullable chỉ có nghĩa *duy nhất* là thuộc tính đó có thể nhận `null` làm giá trị; "tính nullable" của một thuộc tính không cho biết điều gì về cách một giá trị được gán vào thuộc tính.
Ví dụ, một thuộc tính non-nullable *không* nhất thiết phải có để tạo một thể hiện mới của entity.
Nó chỉ có nghĩa là thuộc tính sẽ có giá trị khi được truy xuất.
Trong trường hợp không có giá trị nào được cung cấp khi entity được tạo, điều này nghĩa là dịch vụ sẽ tạo ra một giá trị; giá trị này có thể được chỉ định bằng thuộc tính `DefaultValue`, nhưng nếu giá trị mang tính ngữ cảnh và được xác định tại thời điểm request, thì thuộc tính có thể vừa non-nullable *vừa* không có `DefaultValue` được chỉ định. 
Dưới đây là một số ví dụ về thuộc tính nullable và non-nullable. 

## CSDL

```xml
<EntitySet Name="servicePrincipals" Type="self.servicePrincipal" />
...
<EntityType Name="servicePrincipal">
  <Key>
    <PropertyRef Name="id" />
  </Key>
  <Property Name="id" Type="Edm.String" Nullable="false" />
  <Property Name="appId" Type="Edm.String" Nullable="false" /> <!--required for creation-->
  <Property Name="displayName" Type="Edm.String" Nullable="false" />
  <Property Name="foo" Type="Edm.String" Nullable="true" DefaultValue="testval" />
  <Property Name="bar" Type="Edm.String" Nullable="false" DefaultValue="differentvalue" />
  ...
</EntityType>
```

## HTTP Requests

### 1. Tạo một servicePrincipal không có thuộc tính nào

```HTTP
POST /servicePrincipals

400 Bad Request
{
  "error": {
    "code": "badRequest",
    "message": "The 'appId' property is required to create a servicePrincipal."
  }
}
```

### 2. Tạo một servicePrincipal không có display name

```HTTP
POST /servicePrincipals
{
  "appId": "00000000-0000-0000-0000-000000000001"
}

201 Created
{
  "appId": "00000000-0000-0000-0000-000000000001",
  "displayName": "some application name",
  "foo": "testval",
  "bar": "differentvalue",
  ...
}
```
Lưu ý:
1. `displayName` được dịch vụ gán một giá trị dù client không cung cấp giá trị nào
2. `foo` có giá trị mặc định như được chỉ định bởi thuộc tính `DefaultValue` của nó trong CSDL
3. `bar` có giá trị mặc định như được chỉ định bởi thuộc tính `DefaultValue` của nó trong CSDL

### 3. Cập nhật display name của một service principal thành null

```HTTP
PATCH /servicePrincipals/00000000-0000-0000-0000-000000000001
{
  "displayName": null
}

400 Bad Request
{
  "error": {
    "code": "badRequest",
    "message": "null is not a valid value for the property 'displayName'; 'displayName' is not a nullable property."
  }
}
```
Lưu ý:
1. `displayName` không thể được đặt thành `null` vì nó đã được đánh dấu `Nullable="false"` trong CSDL.

### 4. Cập nhật display name của một service principal

```HTTP
PATCH /servicePrincipals/00000000-0000-0000-0000-000000000001
{
  "displayName": "a non-generated display name"
}

200 OK
{
  "appId": "00000000-0000-0000-0000-000000000001",
  "displayName": "a non-generated display name",
  "foo": "testval",
  "bar": "differentvalue",
  ...
}
```
Lưu ý:
1. `displayName` có thể được đặt thành bất kỳ giá trị nào khác `null`
2. Response body ở đây được cung cấp để minh họa cho rõ ràng và không phải là một phần của bản thân hướng dẫn. [Chuẩn OData v4.01](https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_UpdateanEntity) quy định rằng workload có thể tự quyết định hành vi.

### 5. Cập nhật thuộc tính foo của một service principal thành null

```HTTP
PATCH /servicePrincipals/00000000-0000-0000-0000-000000000001
{
  "foo": null
}

200 OK
{
  "appId": "00000000-0000-0000-0000-000000000001",
  "displayName": "a non-generated display name",
  "foo": null,
  "bar": "differentvalue",
  ...
}
```
Lưu ý:
1. `foo` có thể được đặt thành `null` vì nó đã được đánh dấu `Nullable="true"` trong CSDL.
2. Response body ở đây được cung cấp để minh họa cho rõ ràng và không phải là một phần của bản thân hướng dẫn. [Chuẩn OData v4.01](https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_UpdateanEntity) quy định rằng workload có thể tự quyết định hành vi.

### 6. Cập nhật thuộc tính foo của một service principal thành một giá trị không phải mặc định

```HTTP
PATCH /servicePrincipals/00000000-0000-0000-0000-000000000001
{
  "foo": "something other than testval"
}

200 OK
{
  "appId": "00000000-0000-0000-0000-000000000001",
  "displayName": "a non-generated display name",
  "foo": "something other than testval",
  "bar": "differentvalue",
  ...
}
```
Lưu ý:
1. `foo` có thể được đặt thành `something other than testval`
2. Response body ở đây được cung cấp để minh họa cho rõ ràng và không phải là một phần của bản thân hướng dẫn. [Chuẩn OData v4.01](https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_UpdateanEntity) quy định rằng workload có thể tự quyết định hành vi.

### 7. Cập nhật thuộc tính bar của một service principal thành null

```HTTP
PATCH /servicePrincipals/00000000-0000-0000-0000-000000000001
{
  "bar": null
}

400 Bad Request
{
  "error": {
    "code": "badRequest",
    "message": "null is not a valid value for the property 'bar'; 'bar' is not a nullable property."
  }
}
```
Lưu ý:
1. `bar` không thể được đặt thành `null` vì nó đã được đánh dấu `Nullable="false"` trong CSDL.

### 8. Cập nhật thuộc tính bar của một service principal thành một giá trị không phải mặc định

```HTTP
PATCH /servicePrincipals/00000000-0000-0000-0000-000000000001
{
  "bar": "a new bar"
}

200 OK
{
  "appId": "00000000-0000-0000-0000-000000000001",
  "displayName": "a non-generated display name",
  "foo": "something other than testval",
  "bar": "a new bar",
  ...
}
```
Lưu ý:
1. `bar` có thể được đặt thành `a new bar`
2. Response body ở đây được cung cấp để minh họa cho rõ ràng và không phải là một phần của bản thân hướng dẫn. [Chuẩn OData v4.01](https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_UpdateanEntity) quy định rằng workload có thể tự quyết định hành vi.

### 9. Tạo một service principal đồng thời tùy chỉnh display name
```HTTP
POST /servicePrincipals
{
  "appId": "00000000-0000-0000-0000-000000000001",
  "displayName": "a different name"
}

201 Created
{
  "appId": "00000000-0000-0000-0000-000000000001",
  "displayName": "a different name",
  "foo": "testval",
  "bar": "differentvalue",
  ...
}
```
Lưu ý:
1. `displayName` không bắt buộc để tạo một `servicePrincipal` mới, nhưng *có thể* được cung cấp; điều này độc lập với việc thuộc tính có `Nullable="true"` hay `Nullable="false"`.
2. `foo` có giá trị mặc định như được chỉ định bởi thuộc tính `DefaultValue` của nó trong CSDL
3. `bar` có giá trị mặc định như được chỉ định bởi thuộc tính `DefaultValue` của nó trong CSDL

### 10. Tạo một service principal với display name là null
```HTTP
POST /servicePrincipals
{
  "appId": "00000000-0000-0000-0000-000000000001",
  "displayName": null
}

400 Bad Request
{
  "error": {
    "code": "badRequest",
    "message": "null is not a valid value for the property 'displayName'; 'displayName' is not a nullable property."
  }
}
```
Lưu ý:
1. `displayName` không bắt buộc để tạo một `servicePrincipal` mới, nhưng *có thể* được cung cấp; nó *không thể* được cung cấp dưới dạng `null` vì thuộc tính đã được đánh dấu `Nullable="false"`

### 11. Tạo một service principal với giá trị cho thuộc tính foo
```HTTP
POST /servicePrincipals
{
  "appId": "00000000-0000-0000-0000-000000000001",
  "foo": "a foo value on creation"
}

201 Created
{
  "appId": "00000000-0000-0000-0000-000000000001",
  "displayName": "some application name",
  "foo": "a foo value on creation",
  "bar": "differentvalue",
  ...
}
```
Lưu ý:
1. `displayName` được dịch vụ gán một giá trị dù client không cung cấp giá trị nào
2. `foo` không bắt buộc để tạo một `servicePrincipal` mới, nhưng *có thể* được cung cấp; điều này độc lập với việc thuộc tính có `Nullable="true"` hay `Nullable="false"`.
3. `bar` có giá trị mặc định như được chỉ định bởi thuộc tính `DefaultValue` của nó trong CSDL

### 12. Tạo một service principal với null cho thuộc tính foo
```HTTP
POST /servicePrincipals
{
  "appId": "00000000-0000-0000-0000-000000000001",
  "foo": null
}

201 Created
{
  "appId": "00000000-0000-0000-0000-000000000001",
  "displayName": "some application name",
  "foo": null,
  "bar": "differentvalue",
  ...
}
```
Lưu ý:
1. `displayName` được dịch vụ gán một giá trị dù client không cung cấp giá trị nào
2. `foo` không bắt buộc để tạo một `servicePrincipal` mới, nhưng *có thể* được cung cấp; vì thuộc tính có `Nullable="true"`, nên có thể cung cấp giá trị `null` cho nó.
3. `bar` có giá trị mặc định như được chỉ định bởi thuộc tính `DefaultValue` của nó trong CSDL

### 13. Tạo một service principal với giá trị cho thuộc tính bar
```HTTP
POST /servicePrincipals
{
  "appId": "00000000-0000-0000-0000-000000000001",
  "bar": "running out of ideas for value names"
}

201 Created
{
  "appId": "00000000-0000-0000-0000-000000000001",
  "displayName": "some application name",
  "foo": "testval",
  "bar": "running out of ideas for value names",
  ...
}
```
Lưu ý:
1. `displayName` được dịch vụ gán một giá trị dù client không cung cấp giá trị nào
2. `foo` có giá trị mặc định như được chỉ định bởi thuộc tính `DefaultValue` của nó trong CSDL
3. `bar` không bắt buộc để tạo một `servicePrincipal` mới, nhưng *có thể* được cung cấp; điều này độc lập với việc thuộc tính có `Nullable="true"` hay `Nullable="false"`.

### 14. Tạo một service principal với null cho thuộc tính bar
```HTTP
POST /servicePrincipals
{
  "appId": "00000000-0000-0000-0000-000000000001",
  "bar": null
}

400 Bad Request
{
  "error": {
    "code": "badRequest",
    "message": "null is not a valid value for the property 'bar'; 'bar' is not a nullable property."
  }
}
```
Lưu ý:
1. `bar` không bắt buộc để tạo một `servicePrincipal` mới, nhưng *có thể* được cung cấp; nó *không thể* được cung cấp dưới dạng `null` vì thuộc tính đã được đánh dấu `Nullable="false"`
