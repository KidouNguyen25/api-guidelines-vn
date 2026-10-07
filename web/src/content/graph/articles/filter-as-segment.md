# Filter as segment

Có một [tính năng của OData](https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part2-url-conventions.html#sec_AddressingaSubsetofaCollection) cho phép đặt `$filter` trong một segment của URL. 
Tính năng này hữu ích mỗi khi có các thao tác trên một collection và client muốn thực hiện các thao tác đó trên một *tập con* của collection. 
Ví dụ, API `riskyUsers` trên Microsoft Graph có một action được định nghĩa để cho phép client "dismiss" (bỏ qua) các người dùng rủi ro (tức là coi những người dùng đó là "không rủi ro"):

```xml
<Action Name="dismiss" IsBound="true">
  <Parameter Name="bindingParameter" Type="Collection(microsoft.graph.riskyUser)" />
  <Parameter Name="userIds" Type="Collection(Edm.String)" />
</Action>
```

Với action này, client có thể gọi

```http
POST /identityProtection/riskyUsers/dismiss
{
  "userIds": [
    "{userId1}",
    "{userId2}",
    ...
  ]
}
```

để bỏ qua các người dùng rủi ro có ID được cung cấp. Với tính năng filter-as-segment của OData, action này có thể được định nghĩa như sau:

```xml
<Action Name="dismiss" IsBound="true">
  <Parameter Name="bindingParameter" Type="Collection(self.riskyUser)" />
</Action>
```

và client có thể gọi

```http
POST /identityProtection/riskyUsers/$filter=@f/dismiss?@f=id IN ('{userId1}','{userId2}',...)
```

Cách làm này có lợi nhờ tính mạnh mẽ của biểu thức OData filter: client sẽ có thể bỏ qua các người dùng rủi ro dựa trên bất kỳ bộ lọc nào được hỗ trợ mà nhóm dịch vụ không cần triển khai một overload `dismiss` mới để lọc theo tiêu chí mới.
Tuy nhiên, có một số lo ngại về khả năng khám phá (discoverability) khi dùng tính năng filter-as-segment, cũng như về việc hỗ trợ [parameter aliasing](https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part2-url-conventions.html#sec_ParameterAliases) vốn là yêu cầu bắt buộc.
Do đó, nên bổ sung các function hoạt động theo cùng cách với filter-as-segment:

```xml
<Function Name="filter" IsBound="true" IsComposable="true">
  <Parameter Name="bindingParameter" Type="Collection(microsoft.graph.riskyUser)" Nullable="false" />
  <Parameter Name="expression" Type="Edm.String" Nullable="false" />
  <ReturnType Type="Collection(microsoft.graph.riskyUser)" />
</Function>
```

Lúc này client có thể gọi

```http
POST /identityProtection/riskyUsers/filter(expression='id IN (''{userId1}'',''{userId2}'',...)')/dismiss
```

LƯU Ý: ký tự `'` trong biểu thức filter phải được escape bằng `''`

Có thể xem một ví dụ triển khai function filter bằng OData WebApi [tại đây](https://github.com/OData/AspNetCoreOData/commit/7732f7e6b812d9a79a73529562f2e74b68e2794f).
