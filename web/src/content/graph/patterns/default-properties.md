# Thuộc tính mặc định (Default properties)

Mẫu thiết kế API của Microsoft Graph

*Mẫu thuộc tính mặc định cho phép bên cung cấp API bỏ qua một số thuộc tính nhất định trong response trừ khi chúng được yêu cầu tường minh bằng `$select`.*

## Vấn đề

Nhà thiết kế API muốn kiểm soát tập thuộc tính mà các entity của họ trả về theo mặc định, khi request đến không chỉ định `$select`. Điều này có thể cần thiết khi một entity type có nhiều thuộc tính hoặc khi bên cung cấp API cần thêm các thuộc tính có chi phí tính toán cao nếu trả về theo mặc định.

## Giải pháp

Với các request đến nhắm tới một entity type mà bên gọi không chỉ định mệnh đề `$select`, bên cung cấp API **có thể** trả về một tập con các thuộc tính của entity type, bỏ qua các thuộc tính tốn nhiều chi phí tính toán. Để lấy các thuộc tính không mặc định của một entity type, bên gọi phải yêu cầu chúng một cách tường minh bằng `$select`.

Mẫu này cũng dùng một instance annotation để thông báo cho bên gọi biết rằng còn có các thuộc tính khác. Cùng annotation này cũng được dùng để khuyến khích bên gọi sử dụng `$select`.

## Khi nào dùng mẫu thiết kế này

Bên cung cấp API nên dùng mẫu này khi thêm các thuộc tính tốn kém hoặc hiệu năng kém vào một entity type hiện có, hoặc khi thêm thuộc tính vào một entity type vốn đã quá lớn (với hơn 20 thuộc tính).

## Các vấn đề và điều cần cân nhắc

- **Không** dựa vào schema annotation `ags:Default` để có chức năng thuộc tính mặc định, vì đây là một cách triển khai cũ (legacy). Việc trả về thuộc tính mặc định **phải** do bên cung cấp API triển khai.
- Việc chuyển một thuộc tính mặc định thành không mặc định được coi là thay đổi gây phá vỡ tương thích (breaking change).
- Một trong những thách thức của thuộc tính mặc định là làm sao cho nhà phát triển biết rằng response không chứa đầy đủ tập thuộc tính. Để giải quyết vấn đề khám phá này, nếu response chỉ chứa các thuộc tính mặc định, thì:
  - response **phải** chứa một instance annotation `@microsoft.graph.tips`.
  - instance annotation `@microsoft.graph.tips` **phải** chỉ được phát ra nếu client sử dụng "developer mode" thông qua HTTP request header `Prefer: ms-graph-dev-mode`. Header này được kỳ vọng chỉ được dùng bởi các công cụ dành cho nhà phát triển client và scripting như Graph Explorer, các Microsoft Graph Postman collection, và Microsoft Graph PowerShell.
  - giá trị của instance annotation `@microsoft.graph.tips` **phải** chứa "This request only returns a subset of the resource's properties. Your app will need to use $select to return non-default properties. To find out what other properties are available for this resource see https://learn.microsoft.com/graph/api/resources/{entityTypeName}".
- Bên gọi phải có thể dùng `$filter` với các thuộc tính không mặc định, dù chúng sẽ không xuất hiện theo mặc định trong response.

Ngoài ra, với các request đến nhắm tới một entity type mà bên gọi không chỉ định mệnh đề `$select`, API Gateway Service sẽ chèn một instance annotation `@microsoft.graph.tips`, thông báo cho bên gọi nên dùng $select, khi ở "developer mode".
Các bên cung cấp API sử dụng [response passthrough](https://dev.azure.com/msazure/One/_wiki/wikis/Microsoft%20Graph%20Partners/391069/Enabling-response-passthrough) cũng **phải** triển khai hành vi này, cung cấp cùng thông tin như trong [phần ví dụ bên dưới](#calling-an-api-without-using-select).

## Ví dụ

Trong ví dụ này, chúng ta sẽ dùng entity type `channel` sau.

```xml
<EntityType Name="channel" BaseType="graph.entity">
  <Property Name="createdDateTime" Type="Edm.DateTimeOffset"/>
  <Property Name="description" Type="Edm.String"/>
  <Property Name="displayName" Type="Edm.String" Nullable="false"/>
  <Property Name="email" Type="Edm.String"/>
  <Property Name="isFavoriteByDefault" Type="Edm.Boolean"/>
  <Property Name="membershipType" Type="graph.channelMembershipType"/>
  <!-- moderationSettings is a new computed property that is very expensive -->
  <Property Name="moderationSettings" Type="graph.channelModerationSettings"/> 
  <Property Name="webUrl" Type="Edm.String"/>
  <Property Name="filesFolderWebUrl" Type="Edm.String"/>
</EntityType>
```

Trong kịch bản này, bên cung cấp API muốn thêm thuộc tính `moderationSettings` vào entity type `channel`.
Nhưng khi phân trang qua 1000 channel mỗi lần, thuộc tính bổ sung này sẽ làm thời gian phản hồi tăng đáng kể.
Bên cung cấp API sẽ dùng mẫu thuộc tính mặc định ở đây, và **không** trả về `moderationSettings` theo mặc định.

### Gọi một API có thuộc tính mặc định

Trong ví dụ này, bên gọi, dùng Graph Explorer, không dùng $select, và API chỉ trả về các thuộc tính mặc định.

#### Request

```http
GET /teams/{id}/channels
Prefer: ms-graph-dev-mode
```

#### Response

```http
200 ok
Content-type: application/json
```

```json
{
    "@odata.context": "https://graph.microsoft.com/beta/$metadata#Collection(microsoft.graph.channel)",
    "@microsoft.graph.tips": "This request only returns a subset of the resource properties. Your app will need to use $select to return non-default properties. To find out what other properties are supported for this resource, please see the Properties section in https://learn.microsoft.com/graph/api/resources/channel.",
    "value": [
        {
            "displayName": "My First Shared Channel",
            "description": "This is my first shared channels",
            "id": "19:PZC_kAPAm12RPBMkEaJyXaY_d2PE6mJV6MzO1EiCbnk1@thread.tacv2",
            "membershipType": "shared",
            "email": "someemail@dot.com",
            "webUrl": "webUrl-value",
            "filesFolderWebUrl": "sharePointUrl-value",
            "tenantId": "tenantId-value",
            "isFavoriteByDefault": null,
            "createdDateTime": "2019-08-07T19:00:00Z"
        },
        {
            "displayName": "My Second Private Channel",
            "description": "This is my second shared channels",
            "id": "19:PZC_kAPAm12RPBMkEaJyXaY_d2PE6mJV6MzO1EiCbnk2@thread.tacv2",
            "membershipType": "private",
            "email": "someemail2@dot.com",
            "webUrl": "webUrl-value2",
            "filesFolderWebUrl": "sharePointUrl-value2",
            "tenantId": "tenantId-value",
            "isFavoriteByDefault": null,
            "createdDateTime": "2019-08-09T19:00:00Z"
        }
    ]
}
```

Trong response, chúng ta thấy `moderationSettings` không được trả về. Ngoài ra, bên cung cấp API trả về một instance annotation `tips`, thông báo cho bên gọi rằng response này chỉ trả về các thuộc tính mặc định, cách lấy các thuộc tính không mặc định, và nơi tìm thông tin về các thuộc tính của type này. Instance annotation `tips` chỉ được phát ra nếu có HTTP request header `Prefer: ms-graph-dev-mode`.

### Gọi một API có thuộc tính mặc định và $select

Trong ví dụ này, bên gọi cần `moderationSettings` cho kịch bản API của họ.  Trước tiên họ thử trên Graph Explorer.

#### Request

```http
GET /teams/{id}/channels?$select=id,membershipType,moderationSettings
Prefer: ms-graph-dev-mode
```

#### Response

```http
200 ok
Content-type: application/json
```

```json
{
    "@odata.context": "https://graph.microsoft.com/beta/$metadata#Collection(microsoft.graph.channel)",
    "value": [
        {
            "id": "19:PZC_kAPAm12RPBMkEaJyXaY_d2PE6mJV6MzO1EiCbnk1@thread.tacv2",
            "membershipType": "shared",
            "channelModerationSettings": {
                "userNewMessageRestriction": "everyone",
                "replyRestriction": "everyone",
                "allowNewMessageFromBots": true,
                "allowNewMessageFromConnectors": true
            }
        },
        {
            "id": "19:PZC_kAPAm12RPBMkEaJyXaY_d2PE6mJV6MzO1EiCbnk2@thread.tacv2",
            "membershipType": "private",
            "channelModerationSettings": {
                "userNewMessageRestriction": "moderators",
                "replyRestriction": "authorAndModerators",
                "allowNewMessageFromBots": true,
                "allowNewMessageFromConnectors": true
            }
        }
    ]
}
```

Trong trường hợp này, vì request có `$select`, instance annotation `tips` không được phát ra.

### Gọi một API mà không dùng $select

Bên gọi thực hiện một request `GET` không có $select, tới một API không có thuộc tính mặc định nào, thông qua Graph Explorer.

#### Request

```http
GET /me/todo/lists
Prefer: ms-graph-dev-mode
```

#### Response

```http
200 ok
Content-type: application/json
```

```json
{
    "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#users('99a6e897-8c54-4354-a739-626fbe28ed78')/todo/lists",
    "@microsoft.graph.tips": "Use $select to choose only the properties your app needs, as this can lead to performance improvements. For example: GET me/todo/lists?$select=displayName,isOwner",
    "value": [
        {
            "@odata.etag": "W/\"c5yMNreru0OMO71/IwuKGQAG6WUnjQ==\"",
            "displayName": "Tasks",
            "isOwner": true,
            "isShared": false,
            "wellknownListName": "defaultList",
            "id": "AAMkADU3NTBhNWUzLWE0MWItNGViYy1hMTA0LTkzNjRlYTA2ZWI2ZAAuAAAAAAAFup0i-hqtR5N14AJlh2qTAQATqGUvrHrTEbWPAKDJQ2mMAAACWIG1AAA="
        },
        {
            "@odata.etag": "W/\"c5yMNreru0OMO71/IwuKGQAG6WUnmQ==\"",
            "displayName": "Outlook Commitments",
            "isOwner": true,
            "isShared": false,
            "wellknownListName": "none",
            "id": "AQMkADU3NTBhNWUzLWE0MWItNGViYy1hMTA0LTkzNjRlYTA2ZWI2ZAAuAAADBbqdIv4arUeTdeACZYdqkwEAc5yMNreru0OMO71-IwuKGQABWbOTpQAAAA=="
        }
    ]
}
```

Lưu ý rằng trong kịch bản này, khi không có thuộc tính mặc định nào và bên gọi không dùng `$select`, có một instance annotation `tips`, khuyến khích nhà phát triển ứng dụng dùng `$select`. Annotation `tips` này được API gateway service tự động thêm vào response, miễn là workload service không dùng response passthrough (trong trường hợp đó, đây là trách nhiệm của workload service).
