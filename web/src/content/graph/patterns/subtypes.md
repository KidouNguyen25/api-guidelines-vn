# Type hierarchy

Mẫu thiết kế API của Microsoft Graph

*Một mẫu thiết kế thường gặp trong Microsoft Graph là có một type hierarchy nhỏ, gồm một base type với một vài subtype. Điều này cho phép chúng ta mô hình hóa các collection của những resource có thuộc tính và hành vi hơi khác nhau.*

## Vấn đề

Thiết kế API yêu cầu chúng ta mô hình hóa một tập resource dựa trên một khái niệm chung
mà có thể được chia tiếp thành các *biến thể loại trừ lẫn nhau* với các
thuộc tính và hành vi riêng. Thiết kế API nên có khả năng phát triển và cho phép thêm
các biến thể mới mà không gây thay đổi phá vỡ tương thích (breaking change).

## Giải pháp

Các nhà thiết kế API có thể dùng một *type hierarchy*, trong đó có một base
type (có thể là abstract) với một vài thuộc tính dùng chung đại diện cho khái niệm chung và
một subtype cho mỗi biến thể của resource. Trong hierarchy này, sự phụ thuộc lẫn nhau giữa các thuộc tính, tức là thuộc tính nào liên quan đến biến thể nào, được thể hiện đầy đủ trong hệ thống kiểu.

## Khi nào nên dùng mẫu thiết kế này

Dùng mẫu thiết kế này khi mỗi biến thể của một khái niệm chung có các thuộc tính và hành vi riêng biệt,
không dự kiến có sự kết hợp giữa các biến thể, và chấp nhận được việc những bên gọi cần query resource theo biến thể sẽ được đáp ứng đầy đủ bằng cách lọc hoặc phân vùng thông qua ép kiểu (type casting).

Bạn có thể cân nhắc các mẫu thiết kế liên quan như [facets](./facets.md) và [flat bag of properties](./flat-bag.md).

## Vấn đề và các điều cần cân nhắc

Khi đưa một subtype mới vào hierarchy, nhà phát triển cần đảm bảo rằng
subtype mới không làm thay đổi ngữ nghĩa của type hierarchy hoặc của các collection thuộc base type được chỉ định thông qua các ràng buộc ngầm định.

Để tham chiếu các thuộc tính riêng của một derived type, URL của API request có thể cần bao gồm một segment ép kiểu sang derived type. Nếu type hierarchy rất sâu, URL kết quả có thể trở nên rất dài và khó đọc.  

Có một vài điều cần cân nhắc khi đưa vào các subtype mới:

- *TODO add something about SDK dependencies and required actions*
- *TODO* Các thư viện client cho ngôn ngữ định kiểu mạnh có thể bỏ qua một số giá trị
    trong thuộc tính @odata.type nếu không có cấu hình bổ sung và cần được
    cập nhật để có thể chọn đúng kiểu (phía client) để deserialize vào.
- Trong trường hợp các API công khai ở phiên bản GA, client có thể phát triển ứng dụng của họ để chỉ hỗ trợ tập subtype hiện tại, và không mong đợi các biến thể mới. Để giảm thiểu rủi ro gây gián đoạn cho client, khi đưa vào một subtype mới, hãy dành nhiều thời gian cho việc thông báo và triển khai.

## Ví dụ

Kiểu directoryObject là abstraction chính cho nhiều loại directory
như user, organizational contact, thiết bị, service principal,
và group được lưu trong Azure Active Directory. Vì mọi đối tượng directoryObject đều là một entity duy nhất, bản thân kiểu directoryObject kế thừa từ base type `graph.entity`.

```XML
<EntityType Name="entity" Abstract="true">
    <Key>
        <PropertyRef Name="id" />
    </Key>
    <Property Name="id" Type="Edm.String" Nullable="false" />
</EntityType>
<EntityType Name="directoryObject" BaseType="graph.entity" />
    <Property Name="deletedDateTime" Type="Edm.DateTimeOffset" />
<EntityType/>
```

Group và user là các derived type và được mô hình hóa như sau:

```XML
 <EntityType Name="group" BaseType="graph.directoryObject" />
   <Property Name="description" Type="Edm.String" />
   ...
</EntityType>
<EntityType Name="user" BaseType="graph.directoryObject">
   <Property Name="jobTitle" Type="Edm.String" />
   ...
</EntityType>
```

Một API request để lấy các thành viên của một group trả về một collection không đồng nhất gồm
user và group, trong đó mỗi phần tử có thể là user hoặc group, và có
thêm thuộc tính `@odata.type` chỉ định subtype:

```
GET https://graph.microsoft.com/v1.0/groups/a94a666e-0367-412e-b96e-54d28b73b2db/members

Response payload shortened for readability. The deletedDateTime property from the base type is a non-default property and is only returned if explicitly requested.

{
     "@odata.context":
"https://graph.microsoft.com/v1.0/$metadata#directoryObjects",
    "value": [
        { 
            "@odata.type": "#microsoft.graph.user",
            "id": "37ca648a-a007-4eef-81d7-1127d9be34e8",
            "jobTitle": "CEO",
            ...
        },
        {
            "@odata.type": "#microsoft.graph.group",
            "id": "45f25951-d04f-4c44-b9b0-2a79e915658d",
            "description": "Microsoft Graph API Reviewers",
            ...
        },
        ...        
    ]
}
```

Để đề cập đến một thuộc tính của subtype, ví dụ trong `$filter` hoặc `$select`, cần thêm tiền tố là tên đầy đủ (fully-qualified name) của subtype (hoặc kiểu kế thừa từ subtype) nơi thuộc tính đó được định nghĩa. Để lọc theo `jobTitle` của kiểu user, bạn cần định danh đầy đủ thuộc tính bằng `microsoft.graph.user`. 

Query sau trả về tất cả group là thành viên của group a94a666e-0367-412e-b96e-54d28b73b2db, cùng với các user là thành viên và có jobTitle là CEO.

```
GET https://graph.microsoft.com/v1.0/groups/a94a666e-0367-412e-b96e-54d28b73b2db/members?$filter=microsoft.graph.user/jobTitle eq 'CEO'

Response payload shortened for readability:

{
    "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#directoryObjects",
    "value": [
        {
            "@odata.type": "#microsoft.graph.user",
            "id": "37ca648a-a007-4eef-81d7-1127d9be34e8",
            "jobTitle": "CEO",
            ...
        },
        {
            "@odata.type": "#microsoft.graph.group",
            "id": "45f25951-d04f-4c44-b9b0-2a79e915658d",
            "description": "Microsoft Graph API Reviewers",
            ...
        },
       ...
    ]
}
```

Có thể ép kiểu toàn bộ một collection sang một subtype cụ thể bằng cách nối tên đầy đủ của subtype vào URL. Làm vậy sẽ lọc collection chỉ còn các phần tử thuộc (hoặc kế thừa từ) subtype đó, và làm cho các thuộc tính của subtype đó khả dụng mà không cần ép kiểu. Trong trường hợp này, thuộc tính `@odata.type` không được trả về cho các bản ghi thuộc subtype đã chỉ định vì `@odata.context` cho biết toàn bộ collection gồm subtype cụ thể đó. Các kiểu kế thừa từ subtype đó vẫn có thuộc tính `@odata.type`.

Query sau chỉ trả về các user là thành viên của group a94a666e-0367-412e-b96e-54d28b73b2db và có jobTitle là CEO.

```
GET https://graph.microsoft.com/v1.0/groups/a94a666e-0367-412e-b96e-54d28b73b2db/members/microsoft.graph.user?$filter=jobTitle eq 'CEO'

Response payload shortened for readability:

{
    "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#users",
    "value": [
        {
            "id": "37ca648a-a007-4eef-81d7-1127d9be34e8",
            "jobTitle": "CEO",
            ...
        },
       ...
    ]
}
```

Một API request để tạo đối tượng subtype trong một collection đa hình yêu cầu chỉ định "@odata.type" trong request body.

```
POST https://graph.microsoft.com/v1.0/directoryObjects

{
    "@odata.type": "#microsoft.graph.group",
    "description": "Microsoft Graph API Reviewers",
    ...
}
```
