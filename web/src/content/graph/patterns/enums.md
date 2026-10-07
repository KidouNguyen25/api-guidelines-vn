### Enum

Trong OData, enum đại diện cho một tập con của kiểu danh nghĩa mà chúng dựa trên, và đặc biệt hữu ích trong những trường hợp một số thuộc tính có các tùy chọn được định nghĩa trước và hạn chế.

```xml
<EnumType Name="color">
    <Member Name="Red" Value="0" />
    <Member Name="Green" Value="1" />
    <Member Name="Blue" Value="2" />
</EnumType>
```

#### Ưu điểm

- Các trình sinh SDK của chúng tôi sẽ chuyển enum thành cách biểu diễn phù hợp nhất của ngôn ngữ lập trình đích, mang lại trải nghiệm tốt hơn cho nhà phát triển và việc kiểm tra hợp lệ phía client miễn phí

#### Nhược điểm

- Việc thêm một giá trị mới đòi hỏi phải trải qua API Review (thường khá nhanh)
- Nếu enum không [evolvable](./patterns/evolvable-enums.md), việc thêm một giá trị mới là breaking change và thường sẽ không được cho phép

#### Enum hay Boolean

Enum là một lựa chọn thay thế tốt cho Boolean khi một trong hai giá trị (`true`, `false`) hàm chứa các giá trị khả dĩ khác chưa được hình dung ra. Giả sử chúng ta có kiểu `publicNotification` và một thuộc tính để cho biết cách hiển thị thông báo:

```xml
<ComplexType Name="publicNotification">
  <Property Name="title" Type="Edm.String" />
  <Property Name="message" Type="Edm.String" />
  <Property Name="displayAsTip" Type="Edm.Boolean" />
</ComplexType>
```

Giá trị `false` ở đây chỉ cho biết thông báo sẽ không được hiển thị dưới dạng tip. Điều gì sẽ xảy ra nếu trong tương lai thông báo có thể được hiển thị dưới dạng `tip` hoặc `alert`, và xa hơn nữa là một tùy chọn `dialog` trở nên khả thi?

Với model hiện tại, cách duy nhất là thêm các thuộc tính boolean để truyền đạt thông tin mới:

```diff
<ComplexType Name="publicNotification">
  <Property Name="title" Type="Edm.String" />
  <Property Name="message" Type="Edm.String" />
  <Property Name="displayAsTip" Type="Edm.Boolean" />
+ <Property Name="displayAsAlert" Type="Edm.Boolean" />
+ <Property Name="displayAsDialog" Type="Edm.Boolean" />
</ComplexType>
```

Ngoài ra, workload giờ đây cũng sẽ phải kiểm tra hợp lệ cấu trúc dữ liệu và bảo đảm rằng chỉ có một trong 3 giá trị là `true`

Thay vào đó, bằng cách dùng enum evolvable, tất cả những gì chúng ta cần làm là thêm các member mới:

```diff
<ComplexType Name="publicNotification">
  <Property Name="title" Type="Edm.String" />
  <Property Name="message" Type="Edm.String" />
+ <Property Name="displayMethod" Type="microsoft.graph.displayMethod" />
-  <Property Name="displayAsTip" Type="Edm.Boolean" />
- <Property Name="displayAsAlert" Type="Edm.Boolean" />
- <Property Name="displayAsDialog" Type="Edm.Boolean" />
</ComplexType>
```

```xml
<EnumType Name="displayMethod">
    <Member Name="tip" Value="0" />
    <Member Name="unknownFutureValue" Value="1" />
    <Member Name="alert" Value="2" />
    <Member Name="dialog" Value="3" />
</EnumType>
```

Tương tự, nếu bạn thấy mình đang dùng một enum `nullable`, đó là dấu hiệu cho thấy có thể thứ bạn đang cố mô hình hóa là một thứ có 3 trạng thái và enum sẽ phù hợp hơn. Chẳng hạn, giả sử chúng ta có một thuộc tính boolean tên `syncEnabled`, trong đó `null` có nghĩa là giá trị chưa được xác định và được kế thừa từ cấu hình chung của tenant. Thay vì mô hình hóa như một boolean:

```xml
<Property Name="syncEnabled" Type="Edm.Boolean" Nullable="true"/>
```

Một enum không chỉ truyền đạt ý nghĩa tốt hơn:

```xml
<EnumType Name="syncState">
    <Member Name="enabled" Value="0" />
    <Member Name="disabled" Value="1" />
    <Member Name="tenantInherit" Value="2" />
    <Member Name="unknownFutureValue" Value="3" />
</EnumType>
```

mà còn mở cho các kịch bản trong tương lai:

```diff
<EnumType Name="syncState">
    <Member Name="enabled" Value="0" />
    <Member Name="disabled" Value="1" />
    <Member Name="tenantInherit" Value="2" />
    <Member Name="unknownFutureValue" Value="3" />
+   <Member Name="groupInherit" Value="4" />
</EnumType>
```

Ngoài ra, tùy tình huống, hoàn toàn có thể tránh được enum nullable bằng cách thêm một member `none`.

Nếu được dùng, tên `EnumType` nên ở dạng số ít nếu là enum không phải flags, và nên ở dạng số nhiều nếu là enum flags.


#### Enum nullable

Các thuộc tính enum có thể được đánh dấu `Nullable="true"`, nghĩa là thuộc tính có thể chứa `null` ngoài các member đã định nghĩa.
Trước khi đặt một thuộc tính enum là nullable, hãy cân nhắc xem một member sentinel như `none` có truyền đạt ý định tốt hơn không.

##### `null` so với `none`

| Giá trị | Ý nghĩa | Dùng khi |
|---|---|---|
| `null` | Thuộc tính không có giá trị — chưa từng được đặt hoặc không áp dụng | Việc không có giá trị khác về ngữ nghĩa so với mọi member đã định nghĩa |
| `none` | Một lựa chọn "không chọn gì" tường minh trong miền của enum | "Không chọn" là một trạng thái hợp lệ, có chủ đích mà bên gọi có thể đặt |

> **Lưu ý:** Sentinel `unknownFutureValue` luôn bắt buộc là member đã biết cuối cùng của mọi enum (xem [enum evolvable](./evolvable-enums.md)).
> Nó không liên quan đến tính nullable và phải có mặt bất kể thuộc tính có nullable hay dùng member `none`.

##### Ưu tiên member `none` hơn nullable

Trong hầu hết trường hợp, hãy thêm một member `none` (giá trị `0`) thay vì đặt thuộc tính là nullable.
Cách này giữ cho thuộc tính không nullable, đơn giản hơn cho bên sử dụng SDK và tránh sự mơ hồ ba chiều "là null, là none, hay là một giá trị thực?"

```xml
<!-- ✅ RECOMMENDED — explicit 'none' member -->
<EnumType Name="priority">
    <Member Name="none" Value="0"/>
    <Member Name="low" Value="1"/>
    <Member Name="normal" Value="2"/>
    <Member Name="high" Value="3"/>
    <Member Name="unknownFutureValue" Value="4"/>
</EnumType>

<Property Name="priority" Type="microsoft.graph.priority" Nullable="false"/>
```

##### Khi nào nullable là phù hợp

Chỉ dùng `Nullable="true"` trên một thuộc tính enum khi **tất cả** các điều kiện sau đều đúng:

1. **Việc không có giá trị có ý nghĩa** — `null` biểu thị "chưa đặt" hoặc "không áp dụng", khác biệt về ngữ nghĩa so với mọi member của enum, kể cả một `none` giả định.
2. **Một member sentinel sẽ gây hiểu lầm** — thêm `none` sẽ hàm ý rằng bên gọi chủ động chọn "không gì cả", trong khi ngữ nghĩa thực tế là thuộc tính không áp dụng cho instance này.
3. **Thuộc tính là tùy chọn khi tạo** — dịch vụ không gán giá trị mặc định; `null` là trạng thái mong đợi cho đến khi bên gọi đặt một giá trị một cách tường minh.

```xml
<!-- Acceptable — null means "not yet evaluated" which is distinct from any severity level -->
<Property Name="severity" Type="microsoft.graph.severity" Nullable="true"/>
```

##### Anti-pattern: nullable + `none`

**Không** kết hợp một enum nullable với một member `none`.
Điều này tạo ra hai cách để biểu thị "không có giá trị" và buộc bên gọi phải xử lý cả `null` lẫn `none`, dẫn đến sự thiếu nhất quán và lỗi.

```xml
<!-- ❌ WRONG — ambiguous: is "no value" null or none? -->
<EnumType Name="priority">
    <Member Name="none" Value="0"/>
    <Member Name="low" Value="1"/>
    <Member Name="high" Value="2"/>
    <Member Name="unknownFutureValue" Value="3"/>
</EnumType>

<Property Name="priority" Type="microsoft.graph.priority" Nullable="true"/>
```

Hãy chọn một: hoặc `none` với `Nullable="false"`, hoặc không có member `none` với `Nullable="true"`.

#### Flag enum hay collection của enum

Trong trường hợp một enum có thể có nhiều giá trị cùng lúc, cám dỗ là mô hình hóa thuộc tính dưới dạng một collection của enum:

```xml
<Property Name="displayMethods" Type="Collection(displayMethod)"/>
```

Tuy nhiên, [Flagged Enums](https://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/odata-csdl-xml-v4.01.html#_Toc38530378) có thể mô hình hóa kịch bản này:

```diff
- <EnumType Name="displayMethod">
+ <EnumType Name="displayMethod" isFlag="true">
-     <Member Name="tip" Value="0" />
+     <Member Name="tip" Value="1" />
-     <Member Name="unknownFutureValue" Value="1" />
+     <Member Name="unknownFutureValue" Value="2" />
-     <Member Name="alert" Value="2" />
+     <Member Name="alert" Value="4" />
-    <Member Name="dialog" Value="3" />
+    <Member Name="dialog" Value="8" />
</EnumType>
```

Với enum như vậy, khách hàng có thể chọn nhiều giá trị trong một trường duy nhất:

`displayMethod = tip | alert`

Trong trường hợp hai thuộc tính muốn dùng cùng một `EnumType` về mặt *khái niệm*, nhưng một thuộc tính là collection còn thuộc tính kia là đơn trị, model nên định nghĩa *hai* `EnumType` riêng biệt, một là enum không phải flags với tên số ít và một là enum flags với tên là dạng số nhiều của enum không phải flags.

#### Flag enum + enum không phải flags

Có những trường hợp một API muốn dùng enum không phải flags, nhưng một API khác lại muốn dùng enum flags. 
Ví dụ, ví dụ `displayMethod` ở trên có thể có một API cấu hình những display method nào được dùng, và một API khác cấu hình display method cụ thể đó. 
Trong trường hợp này, API thứ nhất sẽ muốn dùng enum flags, nhưng API thứ hai sẽ chỉ cho phép cấu hình một display method tại một thời điểm, nên sẽ ưu tiên enum không phải flags.

Cần định nghĩa hai enum type, một là enum flags và một là enum không phải flags.
Enum flags nên được đặt tên ở dạng số nhiều, và enum không phải flags nên được đặt tên ở dạng số ít.
Hai kiểu này nên được giữ đồng bộ với nhau.
