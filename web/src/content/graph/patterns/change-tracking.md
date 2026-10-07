# Theo dõi thay đổi (Change tracking)

Mẫu thiết kế API của Microsoft Graph

*Mẫu theo dõi thay đổi cho phép bên sử dụng API yêu cầu các thay đổi của dữ liệu từ Microsoft Graph mà không phải đọc lại dữ liệu chưa thay đổi.*


## Vấn đề

Bên sử dụng API cần một cách hiệu quả để lấy các thay đổi của dữ liệu trong Microsoft Graph, ví dụ để đồng bộ một kho dữ liệu bên ngoài hoặc để vận hành một quy trình nghiệp vụ lấy thay đổi làm trung tâm.

## Giải pháp

Nhà thiết kế API có thể bật khả năng theo dõi thay đổi (delta) trên một resource trong Microsoft Graph (thường là trên một entity collection hoặc một resource cha) bằng cách khai báo một function delta trên resource đó và áp dụng annotation `Org.OData.Capabilities.V1.ChangeTracking`.

Function này trả về một delta payload. Một delta payload gồm một collection các entity Microsoft Graph đầy đủ hoặc một phần có kèm annotation, cùng với một `nextLink` trỏ tới các trang tiếp theo của dữ liệu gốc hoặc dữ liệu thay đổi đang có sẵn ngay lập tức HOẶC một `deltaLink` để lấy tập thay đổi tiếp theo vào một thời điểm sau này.

`nextLink` cung cấp cơ chế phân trang do server điều khiển (server-driven paging) qua dữ liệu thay đổi hiện đang có sẵn.  Khi không còn trang thay đổi nào có sẵn ngay lập tức, một `deltaLink` sẽ được trả về thay thế.
`deltaLink` cung cấp cơ chế để bên sử dụng API bắt kịp các thay đổi kể từ request gần nhất của họ tới function delta. Nếu không có thay đổi nào xảy ra kể từ request trước, thì deltaLink MUST trả về một collection rỗng.

Cả `nextLink` và `deltaLink` MUST được coi là các URL opaque (không trong suốt). Thực hành tốt nhất là làm cho chúng opaque bằng cách mã hóa.

Mẫu này yêu cầu một chuỗi các request trên function delta, để biết thêm chi tiết xem [Change Tracking](https://learn.microsoft.com/en-us/graph/delta-query-overview?tabs=http#use-delta-query-to-track-changes-in-a-resource-collection):

  1. Request GET trả về trang đầu tiên của trạng thái hiện tại của các resource mà delta áp dụng.  
  2. [Tùy chọn] Các request GET tiếp theo để lấy thêm các trang của trạng thái hiện tại qua URL `@odata.nextLink`.
  3. Sau một khoảng thời gian, một request GET để xem có thay đổi mới hay không qua URL `@odata.deltaLink`.
  4. [Tùy chọn] Các request GET để lấy thêm các trang thay đổi qua URL `@odata.nextLink`.

Yêu cầu đối với delta payload:
  - Payload là một collection các bản ghi thay đổi, sử dụng định dạng collection.
  - Các bản ghi thay đổi là biểu diễn đầy đủ hoặc một phần của các resource theo kiểu resource của chúng.
  - Khi một thay đổi biểu diễn việc cập nhật resource được đưa vào payload, bên cung cấp API MAY trả về hoặc các thuộc tính đã thay đổi hoặc toàn bộ entity. ID của resource MUST có mặt trong mọi bản ghi thay đổi.
  - Khi một entity bị xóa, function delta MUST trả về ID của entity bị xóa cùng với một annotation `@removed` có trường reason.
  - Khi một entity bị xóa, reason MUST được đặt là “changed” nếu entity có thể được khôi phục.
  - Khi một entity bị xóa. reason MUST được đặt là “deleted” nếu entity không thể được khôi phục.
  - Không có cơ chế nào để chỉ ra rằng một resource đã đi vào hoặc rời khỏi tập dữ liệu do một thay đổi khiến nó khớp hoặc không còn khớp với bất kỳ tham số query `$filter` nào.
  - Khi một liên kết tới một entity bị xóa, khi entity được liên kết bị xóa, hoặc khi một liên kết tới một entity được thêm vào, bên triển khai MUST trả về một annotation `property@delta`. 
  - Khi một liên kết tới một entity bị xóa nhưng entity vẫn còn tồn tại, reason MUST được đặt là `changed`.
  - Khi một liên kết tới một entity bị xóa cùng với entity, reason MUST được đặt là `deleted`.

Bên cung cấp API MAY chọn gộp nhiều thay đổi trên cùng một resource thành một bản ghi thay đổi duy nhất. 

Bên sử dụng API được kỳ vọng phân biệt việc thêm mới resource với cập nhật bằng cách đối chiếu thuộc tính id của các bản ghi thay đổi với sự tồn tại của resource trong hệ thống bên ngoài đang xử lý.


## Khi nào dùng mẫu thiết kế này

Bên sử dụng API muốn có cơ chế pull để yêu cầu và xử lý thay đổi đối với dữ liệu Microsoft Graph, thông qua polling chủ động hoặc bằng cách phản hồi các thông báo (notification) của Microsoft Graph.

Bên sử dụng API cần đảm bảo tính toàn vẹn dữ liệu trên tập các thay đổi đối với dữ liệu Microsoft Graph.

## Các điều cần cân nhắc

 - Dịch vụ API MAY có thể phản hồi các tham số query OData tiêu chuẩn trong lần gọi ban đầu tới function delta:

    - `$select` để ép buộc tập thuộc tính được báo cáo thay đổi.
    - `$filter` để tác động tới phạm vi các thay đổi được trả về.
    - `$expand` để đưa các resource được liên kết vào cùng tập thay đổi.
    - tham số `$top` để tác động tới kích thước của tập bản ghi thay đổi.
  
    Các tham số query này MUST được mã hóa vào các `@odata.nextLink` hoặc `@odata.deltaLink` tiếp theo, sao cho các tùy chọn tương tự được giữ nguyên xuyên suốt chuỗi lời gọi mà bên gọi không cần chỉ định lại chúng, và việc chỉ định lại MUST NOT được cho phép. Các tham số query OData phải được tuân thủ đầy đủ, nếu không thì trả về lỗi 400.
- Việc thực hiện một chuỗi lời gọi tới function delta, tiếp theo là các URL opaque trong `nextLink` và `deltaLink`, MUST đảm bảo rằng dữ liệu tại thời điểm bắt đầu chuỗi lời gọi và mọi thay đổi của dữ liệu sau đó sẽ được trả về ít nhất một lần. Không cần thiết phải tránh trùng lặp trong chuỗi này. Khi function delta trả về các thay đổi, chúng MUST được sắp xếp theo thứ tự thời gian, xem [tài liệu công khai](https://learn.microsoft.com/en-us/graph/delta-query-overview?view=graph-rest-1.0) để biết thêm chi tiết.
- Function delta có thể được gắn (bind) vào
  - một entity collection, như `/users/delta` trả về các thay đổi của collection người dùng, hoặc
  - một resource cha mang tính logic trả về một entity collection, trong đó các bản ghi thay đổi được hiểu ngầm là tương đối so với tất cả các collection nằm trong resource cha. Ví dụ `/me/planner/all/delta` trả về các thay đổi của bất kỳ resource nào trong một planner, được tham chiếu bởi navigation property 'all', và `/communications/onlineMeetings/getAllRecordings/delta` trả về các thay đổi của bất kỳ bản ghi cuộc họp nào do function `getAllRecordings` trả về.

- Dịch vụ API nên dùng `$skipToken` và `$deltaToken` trong phần triển khai `nextLink` và `deltaLink` của mình, tuy nhiên các URL được định nghĩa là opaque và sự tồn tại của các token MUST NOT được ghi vào tài liệu.   Việc sửa đổi cấu trúc của `nextLinks` hoặc `deltaLinks` không phải là thay đổi gây phá vỡ tương thích (breaking change).- 
- Các URL `nextLink` và `deltaLink` có hiệu lực trong một khoảng thời gian xác định trước khi ứng dụng client cần chạy đồng bộ đầy đủ lại.Với `nextLink`, thời gian hiệu lực tối thiểu nên là 1 giờ. Với `deltaLink`, thời gian hiệu lực tối thiểu nên là bảy ngày. Khi một liên kết không còn hiệu lực, nó phải trả về một lỗi chuẩn với mã response 410 GONE.
- Mặc dù khả năng này tương tự khả năng feed `$delta` của OData, nhưng nó là một cấu trúc khác. Các API của Microsoft Graph MUST cung cấp theo dõi thay đổi thông qua function delta và MUST NOT triển khai feed `$delta` của OData khi cung cấp khả năng theo dõi thay đổi, để đảm bảo tính đồng nhất của trải nghiệm API.
- Định dạng delta payload của Graph có một số điểm khác biệt so với định dạng theo dõi thay đổi của OData 4.01 nhằm đơn giản hóa việc phân tích cú pháp, ví dụ annotation context bị loại bỏ.
- Chi tiết triển khai bổ sung được ghi lại [nội bộ](https://dev.azure.com/msazure/One/_wiki/wikis/Microsoft%20Graph%20Partners/211718/Deltas).
  

## Các lựa chọn thay thế

- Mẫu thông báo thay đổi (change notifications) với rich payload – dành cho các trường hợp sử dụng mà bên sử dụng API thấy việc gọi ngược lại vào Microsoft Graph là quá nặng nề và yêu cầu đảm bảo tính toàn vẹn tuyệt đối ít quan trọng hơn.


## Ví dụ

### Theo dõi thay đổi trên entity set

```xml
<Function Name="delta" IsBound="true">
        <Parameter Name="bindingParameter" Type="Collection(graph.user)" />
        <ReturnType Type="Collection(graph.user)" />
</Function>
<EntitySet Name="users" EntityType="graph.user"> 
    <Annotation Term="Org.OData.Capabilities.V1.ChangeTracking"> 
      <Record> 
        <PropertyValue Property="Supported" Bool="true" /> 
      </Record> 
    </Annotation> 
</EntitySet> 
```

### Theo dõi thay đổi trên navigation property

```xml
<EntityType Name="educationRoot">
    <NavigationProperty Name="classes" Type="Collection(graph.educationClass)" ContainsTarget="true" />
    <NavigationProperty Name="me" Type="graph.educationUser" ContainsTarget="true" />
    <NavigationProperty Name="schools" Type="Collection(graph.educationSchool)" ContainsTarget="true" />
    <NavigationProperty Name="synchronizationProfiles" Type="Collection(graph.educationSynchronizationProfile)" ContainsTarget="true"/>
    <NavigationProperty Name="users" Type="Collection(graph.educationUser)" ContainsTarget="true" />
</EntityType>
<Function Name="delta" IsBound="true">
    <Parameter Name="bindingParameter" Type="Collection(graph.educationClass)" />
    <ReturnType Type="Collection(graph.educationClass)" />
</Function>
 <Annotations Target="microsoft.graph.educationRoot/classes">
    <Annotation Term="Org.OData.Capabilities.V1.ChangeTracking">
      <Record>
        <PropertyValue Property="Supported" Bool="true" />
      </Record>
    </Annotation>
</Annotations>
```
### Theo dõi thay đổi trên function trả về một entity collection

Trước hết, nhà thiết kế API cần định nghĩa function là composable (để có thể thêm một function delta vào nó), bằng cách thêm annotation `IsComposable`:

```xml
<Function Name="getAllRecordings" IsBound="true" EntitySetPath="bindingParameter/recordings" IsComposable="true">
  <Parameter Name="bindingParameter" Type="Collection(self.onlineMeeting)" />
  <ReturnType Type="Collection(self.meetingRecording)" />
</Function>
```

Tiếp theo, định nghĩa function `delta`. Binding parameter và kiểu trả về của function delta MUST giống với kiểu trả về của function đích `getAllRecordings`:

```xml
<Function Name="delta" IsBound="true" EntitySetPath="bindingParameter">
  <Parameter Name="bindingParameter" Type="Collection(self.meetingRecording)" />
  <ReturnType Type="Collection(self.meetingRecording)" />
</Function>
```
Cuối cùng, đối với function, nhà thiết kế cần thêm một annotation (hoặc dưới dạng phần tử con của entity, hoặc nhắm tới entity type như bên dưới) nêu rõ rằng nó hỗ trợ theo dõi thay đổi (delta query):

```xml
<Annotations Target="self.getAllRecordings(Collection(self.onlineMeeting))">
  <Annotation Term="Org.OData.Capabilities.V1.ChangeTracking">
    <Record>
      <PropertyValue Property="Supported" Bool="true" />
    </Record>
  </Annotation>
</Annotations>
```
Dưới đây là HTTP request để bắt đầu quy trình theo dõi thay đổi trên `getAllRecordings`

```http
GET https://graph.microsoft.com/v1.0/communications/onlineMeetings/getAllRecordings/delta
```

### Delta payload

 Ở đây, sau lần gọi delta ban đầu, một resource user được cập nhật, và có một user được thêm vào và một user bị xóa khỏi collection directReports của user đó. Ngoài ra, một user thứ hai bị xóa. Trong trường hợp này, hiện không có thêm trang bản ghi thay đổi nào có sẵn. Để biết chuỗi request chi tiết, xem [Change Tracking](https://learn.microsoft.com/en-us/graph/delta-query-overview?tabs=http#use-delta-query-to-track-changes-in-a-resource-collection).

```http
GET https://graph.microsoft.com/v1.0/users/delta?$skiptoken=pqwSUjGYvb3jQpbwVAwEL7yuI3dU1LecfkkfLPtnIjvB7XnF_yllFsCrZJ

{
    "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#users",
    "@odata.deltaLink": "https://graph.microsoft.com/v1.0/users/delta?$deltatoken=mS5DuRZGjVL-abreviated",
    "value": [
        {
            "businessPhones": ["+1 309 555 0104"],
            "displayName": "Grady Archie", 
            "givenName": "Grady", 
            "jobTitle": "Designer", 
            "mail": "GradyA@contoso.onmicrosoft.com", 
            "officeLocation": "19/2109", 
            "preferredLanguage": "en-US", 
            "surname": "Archie", 
            "userPrincipalName": "GradyA@contoso.onmicrosoft.com", 
            "id": "0baaae0f-b0b3-4645-867d-742d8fb669a2", 
            "directReports@delta": [ 
                { 
                    "@odata.type": "#microsoft.graph.user", 
                    "id": "99789584-a1e1-4232-90e5-866170e3d4e7" 
                } ,
                { 
                    "id": "66789583-f1e2-6232-70e5-366170e3d4a6",
                    "@removed": {
                        "reason": "deleted"
                    }
                }
            ] 
        }, 
        { 
            "id": "0bbbbb0f-b0b3-4645-867d-742d8fb669a2", 
            "@removed": { 
                "reason": "changed" 
            } 
        } 
    ] 
}
```
