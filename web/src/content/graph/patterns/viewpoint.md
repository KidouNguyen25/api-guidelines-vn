# Viewpoint

Mẫu thiết kế API của Microsoft Graph


*Mẫu viewpoint cung cấp khả năng quản lý các thuộc tính của một đối tượng dùng chung mà có giá trị khác nhau đối với những người dùng khác nhau.*

## Vấn đề
Một resource dùng chung, chẳng hạn như một website hoặc một tin nhắn nhóm, có thể có các trạng thái khác nhau đối với những người dùng khác nhau truy cập vào nó ở những thời điểm khác nhau trong bối cảnh tổ chức. Ví dụ, user1 có thể đọc và xóa một tin nhắn, trong khi user2 có thể chưa nhìn thấy nó. Điều này thường xảy ra khi một mục dùng chung được trình bày trong ngữ cảnh của từng cá nhân.
## Giải pháp

Mẫu viewpoint đưa ra giải pháp cho việc mô hình hóa ngữ cảnh của từng người dùng trên một resource dùng chung bằng cách dùng thuộc tính cấu trúc `viewpoint` trên một entity type của API.
Ví dụ, thuộc tính `viewpoint` có thể cho biết một tin nhắn đã được đọc, đã bị xóa hay được gắn cờ đối với một người dùng cụ thể. 
Quy ước đặt tên nhất quán bảo đảm rằng khi nhà phát triển dùng các Graph API, mọi thuộc tính cấu trúc `viewpoint` đều biểu diễn ngữ cảnh người dùng theo từng kiểu cụ thể trên các dịch vụ và tính năng M365 khác nhau.

Mẫu thiết kế này đơn giản hóa logic của API client bằng cách ẩn các chi tiết chuyển đổi trạng thái và cung cấp khả năng lưu giữ trạng thái ở phía server. Server có thể quản lý các viewpoint khác nhau cho resource dùng chung mà không để lộ thêm độ phức tạp cho client. Để hỗ trợ các query về trạng thái của người dùng, thuộc tính `viewpoint` nên hỗ trợ lọc.
## Các vấn đề và điểm cần cân nhắc

- Vì thuộc tính `viewpoint` phản ánh ngữ cảnh của từng người dùng, nên nó là null khi được truy cập bằng quyền ứng dụng (application permissions).
- Đôi khi viewpoint có thể được tính toán trên server. Trong trường hợp này, bên cung cấp API nên thêm các OData annotation vào thuộc tính để cung cấp thêm thông tin cho các công cụ downstream, chẳng hạn như SDK và công cụ sinh tài liệu.
```
    <Annotations Target="microsoft.graph.approvalItem/viewPoint">
        <Annotation Term="Org.OData.Core.V1.Computed" Bool="true" />
    </Annotations>
```
- Một cách thiết kế thay thế là lưu trạng thái người dùng ở phía client. Tuy nhiên, cách này có thể gây vấn đề trong một số trường hợp, vì người dùng có thể có nhiều thiết bị và cần đồng bộ trạng thái giữa chúng.
- Thông thường, việc cập nhật thuộc tính `viewpoint` có thể gây ra tác dụng phụ, nên bạn có thể cân nhắc dùng một OData action để cập nhật. Với một số kịch bản người dùng, phương thức `PATCH` có thể là cách tốt hơn để cập nhật `viewpoint`.

## Ví dụ

### Định nghĩa viewpoint

Ví dụ sau minh họa cách định nghĩa thuộc tính 'viewpoint' cho entity `chat`, trong đó một chat là tập hợp các chatMessage giữa một hoặc nhiều người tham gia: 
```
  <ComplexType Name="chatViewpoint" >
        <Property Name="isHidden" Type="Edm.Boolean" />
        <Property Name="lastMessageReadDateTime" Type="Edm.DateTimeOffset" />
  </ComplexType>

  <EntityType Name="chat" BaseType="graph.entity" >
        <Property Name="chatType" Type="graph.chatType" Nullable="false" />
        <Property Name="createdDateTime" Type="Edm.DateTimeOffset" />
        <Property Name="lastUpdatedDateTime" Type="Edm.DateTimeOffset" />              
        <Property Name="topic" Type="Edm.String" />
        <Property Name="viewpoint" Type="graph.chatViewpoint" />
       ...
        <NavigationProperty Name="tabs" Type="Collection(graph.teamsTab)" ContainsTarget="true" />
  </EntityType>

```
### Đọc một entity có viewpoint

Ví dụ sau cho thấy việc đọc một collection các chat của một người dùng đã xác định, kèm viewpoint cho từng chat:

```http
GET https://graph.microsoft.com/v1.0/users/8b081ef6-4792-4def-b2c9-c363a1bf41d5/chats
```

```http

HTTP/1.1 200 OK
Content-type: application/json
```

```
{
    "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#chats",
    "@odata.count": 3,
    "value": [
        {
            "id": "19:meeting_MjdhNjM4YzUtYzExZi00OTFkLTkzZTAtNTVlNmZmMDhkNGU2@thread.v2",
            "topic": "Meeting chat sample",
            "createdDateTime": "2020-12-08T23:53:05.801Z",
            "lastUpdatedDateTime": "2022-12-08T23:58:32.511Z",
            "chatType": "meeting",         
            "viewpoint":{
                "lastMessageReadDateTime": "2021-03-28T21:10:00.000Z"              
            }
        },
        {
            "id": "19:561082c0f3f847a58069deb8eb300807@thread.v2",
            "topic": "Group chat sample",
            "createdDateTime": "2020-12-03T19:41:07.054Z",
            "lastUpdatedDateTime": "2020-12-08T23:53:11.012Z",
            "chatType": "group",            
            "viewpoint":{
                "lastMessageReadDateTime": "0000-01-01T00:00:00.000Z"                
            }
        }
    ]
}
```
### Cập nhật viewpoint bằng một action

Ví dụ sau cho thấy việc đánh dấu `viewpoint` của một chat là đã đọc đối với một người dùng bằng một action:

```http

POST https://graph.microsoft.com/beta/chats/19:7d898072-792c-4006-bb10-5ca9f2590649_8ea0e38b-efb3-4757-924a-5f94061cf8c2@unq.gbl.spaces/markChatReadForUser

{
 "user": {
    "id" : "d864e79f-a516-4d0f-9fee-0eeb4d61fdc2",
    "tenantId": "2a690434-97d9-4eed-83a6-f5f13600199a"
  }
}
```

Server phản hồi với một success status code và không có payload:

```http
HTTP/1.1 204 No Content
```
### Cập nhật viewpoint bằng phương thức `PATCH`

Ví dụ sau cho thấy cách đánh dấu một topic có nhãn `viewpoint` là đã được xem xét đối với một người dùng bằng phương thức `PATCH` (ví dụ này không đại diện cho một API thực tế, mà chỉ để minh họa):

```http
PATCH https://graph.microsoft.com/beta/sampleTopics/19:7d898072-792c-4006-bb10-5ca9f259

{  
    "title": "Announcements: Changes to PowerPoint and Word to open files faster",
    ...
    "viewpoint": {
         "isReviewed" : "true"
    }
}
```

Server phản hồi với một success status code và không có payload:

```http
HTTP/1.1 204 No Content
```
