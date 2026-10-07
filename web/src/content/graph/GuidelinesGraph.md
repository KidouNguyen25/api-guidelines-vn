# Hướng dẫn Microsoft Graph REST API

Mục lục

- [Hướng dẫn Microsoft Graph REST API](#microsoft-graph-rest-api-guidelines)
  - [Giới thiệu](#introduction)
    - [Chú giải](#legend)
  - [Cách tiếp cận thiết kế](#design-approach)
    - [Đặt tên](#naming)
    - [Uniform Resource Locators (URLs)](#uniform-resource-locators-urls)
    - [Các mẫu thiết kế mô hình hóa resource](#resource-modeling-patterns)
      - [Ưu điểm và nhược điểm](#pros-and-cons)
      - [Thuộc tính nullable](#nullable-properties)
    - [Hỗ trợ query](#query-support)
    - [Mô hình hóa hành vi](#behavior-modeling)
    - [Xử lý lỗi](#error-handling)
    - [Giới hạn đối với các kiểu lõi](#limitations-on-core-types)
  - [Các chuẩn bên ngoài](#external-standards)
  - [Hợp đồng API và các thay đổi không tương thích ngược](#api-contract-and-nonbackward-compatible-changes)
    - [Đánh phiên bản và ngừng hỗ trợ](#versioning-and-deprecation)
  - [Các mẫu thiết kế API được khuyến nghị](#recommended-api-design-patterns)
  - [Tài liệu tham khảo](#references)


## Giới thiệu

Khi xây dựng một hệ sinh thái số, khả năng sử dụng của API trở thành ưu tiên kinh doanh. Sự thành công của hệ sinh thái phụ thuộc vào các API dễ khám phá, đơn giản khi sử dụng, phù hợp với mục đích và nhất quán giữa các sản phẩm của bạn.

Tài liệu này đưa ra các hướng dẫn mà các nhóm cung cấp Microsoft Graph API MUST tuân theo để
đảm bảo Microsoft Graph có bề mặt API nhất quán và dễ sử dụng. Một thiết kế API mới SHOULD đáp ứng các mục tiêu sau:

- Thân thiện với nhà phát triển bằng cách dùng cách đặt tên, các mẫu thiết kế và chuẩn web (HTTP, REST, JSON) nhất quán.

- Hoạt động tốt với SDK trong nhiều ngôn ngữ lập trình.

- Bền vững và có khả năng phát triển nhờ sử dụng các hợp đồng API rõ ràng.

Hướng dẫn Microsoft Graph REST API bao gồm một tài liệu tổng quan ngắn gọn, một bộ sưu tập các bài viết về chuẩn của Graph và một thư viện các mẫu thiết kế cung cấp thực hành tốt nhất để giải quyết các vấn đề thiết kế API thường gặp. Cùng nhau, các tài liệu này là phương tiện để các nhóm API thảo luận và đạt đồng thuận về các yêu cầu review API.

Công nghệ và phần mềm luôn thay đổi và phát triển, do đó tài liệu này được hình dung là một tài liệu sống. Các hướng dẫn API thay đổi thường xuyên sẽ dẫn đến một bề mặt API không đồng đều và thiếu nhất quán. Vì vậy, các nguyên tắc và định hướng chung mà tài liệu này đưa ra sẽ ổn định hơn so với các khuyến nghị cụ thể cho những lĩnh vực mới hoặc khác biệt đáng kể. Hướng dẫn có thể thay đổi khi cần để giải quyết các kịch bản mới và làm rõ hướng dẫn hiện có. Hướng dẫn có thể thay đổi khi cần để giải quyết các kịch bản mới và làm rõ hướng dẫn hiện có. Để đề xuất một thay đổi hoặc một ý tưởng mới,
hãy [mở một issue](https://github.com/microsoft/api-guidelines/issues/new/choose).

### Chú giải

Tài liệu này đưa ra các hướng dẫn mang tính quy định, được gắn nhãn như sau:

:heavy_check_mark: **MUST** đáp ứng đặc tả này.

:no_entry: **MUST NOT** dùng mẫu thiết kế này.

:ballot_box_with_check: **SHOULD** đáp ứng đặc tả này.

:warning: **SHOULD NOT** áp dụng mẫu thiết kế này.

Nếu bạn không tuân theo lời khuyên này, bạn MUST trình bày lý do của mình trong buổi review Microsoft Graph API.

## Cách tiếp cận thiết kế

Thiết kế API của bạn có thể nói là khoản đầu tư quan trọng nhất mà bạn sẽ thực hiện. Thiết kế API tạo ra ấn tượng đầu tiên cho nhà phát triển khi họ khám phá và học cách sử dụng API của bạn. Chúng tôi khuyến khích cách tiếp cận thiết kế ưu tiên API (API-first), trong đó bạn bắt đầu thiết kế sản phẩm bằng việc tập trung vào cách thông tin được trao đổi và biểu diễn, đồng thời tạo ra một hợp đồng giao diện cho API, sau đó mới đến thiết kế và triển khai dịch vụ phía sau. Cách tiếp cận này đảm bảo giao diện được tách rời khỏi phần triển khai và là yếu tố thiết yếu cho tính linh hoạt, khả năng dự đoán và tái sử dụng API của bạn.

Một hợp đồng giao diện đã được xác lập cho phép nhà phát triển sử dụng API của bạn trong khi các nhóm nội bộ vẫn đang triển khai; các đặc tả API cho phép thiết kế trải nghiệm người dùng và các test case song song. Việc bắt đầu bằng các hợp đồng hướng đến người dùng cũng thúc đẩy sự hiểu rõ về các tương tác của hệ thống, miền mô hình hóa của bạn, và cách dịch vụ sẽ phát triển.

Microsoft Graph hỗ trợ các kiểu API dựa trên resource và query tuân theo chuẩn HTTP, REST và JSON, trong đó hợp đồng API được mô tả bằng các quy ước OData và định nghĩa schema. Để biết thêm thông tin, xem [Documentation · OData Version 4.01](https://www.odata.org/documentation/).

Nhìn chung, thiết kế API bao gồm các bước sau:

1. Phác thảo các kịch bản hiện tại và tương lai chính dành cho bên sử dụng API.
  
1. Xác định mô hình miền của bạn.

1. Rút ra và đặt tên cho các resource API của bạn.
  
1. Mô tả các mối quan hệ giữa các resource.

1. Xác định hành vi cần có.

1. Xác định vai trò người dùng và quyền của ứng dụng.

1. Đặc tả các lỗi.

Khi tạo hợp đồng API, bạn định nghĩa các resource dựa trên mô hình miền mà dịch vụ của bạn hỗ trợ và xác định các tương tác dựa trên kịch bản người dùng. Thiết kế API tốt không dừng lại ở việc mô hình hóa trạng thái hiện tại của các resource. Điều quan trọng là phải lên kế hoạch trước cho việc API sẽ phát triển như thế nào; để làm được điều này, việc hiểu và ghi lại các kịch bản người dùng làm nền tảng cho thiết kế API là thiết yếu. Không có sự tương ứng một-một giữa các phần tử của mô hình miền và các resource API, vì bạn SHOULD đơn giản hóa các API hướng đến khách hàng để dễ sử dụng hơn và để che giấu các chi tiết triển khai.

Chúng tôi khuyên bạn tạo một sơ đồ resource đơn giản như sơ đồ sau để thể hiện các resource và mối quan hệ giữa chúng, giúp dễ suy luận hơn về các lựa chọn mô hình hóa và hình dạng của API.

![Ví dụ mô hình resource](ModelExample.png)

Sau khi định nghĩa các resource, đã đến lúc nghĩ về hành vi của API, có thể được biểu đạt thông qua các phương thức HTTP và các resource thao tác như function và action. Khi suy nghĩ về hành vi của API, bạn xác định một luồng thành công (happy path) cùng các ngoại lệ và sai lệch khác nhau, được biểu đạt dưới dạng lỗi và được biểu diễn bằng mã HTTP và thông điệp lỗi.

Ở mỗi bước thiết kế, bạn cần xem xét bảo mật, quyền riêng tư và tuân thủ như những thành phần nội tại của việc triển khai API.

### Đặt tên

Các resource API thường được mô tả bằng danh từ. Tên resource và tên thuộc tính xuất hiện trong URL và payload của API và MUST mang tính mô tả và dễ hiểu. Sự dễ hiểu đến từ sự quen thuộc và khả năng nhận biết; do đó, khi nghĩ về cách đặt tên, bạn SHOULD ưu tiên sự nhất quán với các Microsoft Graph API khác, tên trong giao diện người dùng của sản phẩm và các chuẩn ngành. Các quy ước đặt tên của Microsoft Graph tuân theo [Hướng dẫn đặt tên](./articles/naming.md).

Sau đây là bản tóm tắt ngắn về các quy ước được dùng thường xuyên nhất.

| Yêu cầu                                                                 | Ví dụ                         |
| ------------------------------------------------------------------------|-------------------------------|
| :no_entry: **MUST NOT** dùng các từ dư thừa trong tên.                   | - **Đúng:** /places/{id}/**displayName** hoặc /phones/{id}/**number** <BR> -  **Sai:** /places/{id}/**placeName** hoặc /phones/{id}/**phoneNumber** |
| :warning: **SHOULD NOT** dùng tên thương hiệu trong tên kiểu hoặc tên thuộc tính.     | - **Đúng:** chat   <BR> -  **Sai:** teamsChat <BR> - **LƯU Ý:** có ngoại lệ đối với các resource *chỉ* tồn tại dưới root segment `/admin` và đường dẫn `/users/{userId}/settings`.  |
| :warning: **SHOULD NOT** dùng từ viết tắt hoặc từ rút gọn trừ khi chúng được hiểu rộng rãi. | - **Đúng:** url hoặc htmlSignature <BR> - **Sai:** msodsUrl hoặc dlp |
| :heavy_check_mark: **MUST** dùng danh từ số ít cho tên kiểu không phải enum.          | - **Đúng:** address  <BR> - **Sai:** addresses  |
| :heavy_check_mark: **MUST** dùng danh từ số ít cho tên kiểu enum không phải flags.          | - **Đúng:** color  <BR> - **Sai:** colors  |
| :heavy_check_mark: **MUST** dùng danh từ số nhiều cho tên kiểu enum flags.          | - **Đúng:** diplayMethods  <BR> - **Sai:** displayMethod  |
| :heavy_check_mark: **MUST** dùng danh từ số nhiều cho collection (đối với thuộc tính dạng danh sách hoặc collection). | - **Đúng:** addresses <BR> - **Sai:** address |
| :ballot_box_with_check: **SHOULD** chuyển danh từ sang số nhiều ngay cả khi theo sau nó là một tính từ (*postpositive*).| - **Đúng:** passersby hoặc mothersInLaw    <BR> -  **Sai:** notaryPublics hoặc motherInLaws |
| **VIẾT HOA/THƯỜNG** | |
| :heavy_check_mark: **MUST** dùng lower camel case cho *mọi* tên và namespace.   | - **Đúng:** automaticRepliesStatus <BR> - **Sai:** kebab-case hoặc snake_case |
| :ballot_box_with_check: **SHOULD** viết hoa/thường hai chữ cái của từ viết tắt theo cùng một kiểu.   | - **Đúng:** ioLimit hoặc totalIOAmount <BR> - **Đúng:** các thuộc tính 'id' tương tự driveId hoặc applicationId <BR> - **Sai:** iOLimit hoặc totalIoAmount|
| :ballot_box_with_check: **SHOULD** viết hoa/thường các thuộc tính `id` như một từ thông thường.   | - **Đúng:** id hoặc fileId <BR> - **Sai:** ID hoặc fileID |
| :ballot_box_with_check: **SHOULD** viết hoa/thường từ viết tắt có ba chữ cái trở lên như một từ thông thường.  | - **Đúng:** fidoKey hoặc oauthUrl <BR> - **Sai:** webHTML |
| :no_entry: **MUST NOT** viết hoa từ đứng sau một [tiền tố](https://www.thoughtco.com/common-prefixes-in-english-1692724) hoặc các từ bên trong một [từ ghép](http://www.learningdifferences.com/Main%20Page/Topics/Compound%20Word%20Lists/Compound_Word_%20Lists_complete.htm).                                     | - **Đúng:** subcategory, geo coordinate, hoặc crosswalk <BR> - **Sai:** metaData, semiCircle, hoặc airPlane |
| :heavy_check_mark: **MUST** viết hoa bên trong các từ ghép có dấu gạch nối và từ ghép mở (có khoảng trắng). | - **Đúng:** fiveYearOld, daughterInLaw, hoặc postOffice <BR> - **Sai:** paperclip hoặc fullmoon |
| **TIỀN TỐ VÀ HẬU TỐ** | |
| :heavy_check_mark: **MUST** thêm hậu tố Date, Time hoặc DateTime cho các thuộc tính ngày và giờ  | - **Đúng:** dueDate—một Edm.Date <BR> - **Đúng:** recurringMeetingTime—một Edm.TimeOfDay <BR> - **Đúng:** createdDateTime—một Edm.DateTimeOffset <BR>- **Sai:** dueOn hoặc startTime <BR> - **Đúng:** Thay vào đó, cả hai tên trước đó đều là một Edm.DateTimeOffset |
| :ballot_box_with_check: **SHOULD** dùng kiểu Duration cho khoảng thời gian, nhưng nếu dùng `int` thì thêm đơn vị vào cuối tên. | - **Đúng:** passwordValidityPeriod—một Edm.Duration <BR> - **Đúng:** passwordValidityPeriodInDays — một Edm.Int32 (nên ưu tiên dùng kiểu Edm.Duration) <BR>- **Sai:** passwordValidityPeriod — một Edm.Int32 |
| :no_entry: **MUST NOT** thêm hậu tố là tên kiểu nguyên thủy vào tên thuộc tính trừ khi kiểu đó là kiểu thời gian. | - **Đúng:** isEnabled hoặc amount <BR> - **Sai:** enabledBool |
| :ballot_box_with_check: **SHOULD** thêm tiền tố cho tên thuộc tính khi thuộc tính đó liên quan đến một entity khác.   | - **Đúng:** siteWebUrl trên driveItem hoặc userId trên auditActor <BR> - **Sai:** webUrl trên contact khi thực chất là companyWebUrl |
| :ballot_box_with_check: **SHOULD** thêm tiền tố `is` cho các thuộc tính Boolean, trừ khi điều này dẫn đến tên thuộc tính Boolean nghe gượng gạo hoặc không tự nhiên. | - **Đúng:** isEnabled hoặc isResourceAccount <BR>- **Sai:** enabled hoặc allowResourceAccount <BR>- **Đúng:** hasChildren hoặc hasSubscriptions <BR>-  **Sai:** isChildren hoặc isSubscriptions <BR>- **Đúng:** allowNewTimeProposals hoặc allowInvitesFrom (theo cảm nhận chủ quan là tự nhiên hơn các ví dụ tiếp theo) <BR> - **Sai:** isNewTimeProposalsAllowed hoặc isInvitesFromAllowed (theo cảm nhận chủ quan là gượng gạo hơn các ví dụ trước đó) |
| :no_entry: **MUST NOT** dùng hậu tố collection, response hoặc request.  | - **Đúng:** addresses <BR> - **Sai:** addressCollection |

#### Cấu trúc cây và đồ thị

Khi mô hình hóa một cấu trúc cây hoặc đồ thị, các nút con trực tiếp thường được đặt tên là `children` hoặc `members`. 
Nếu cần một thuộc tính biểu diễn cấu trúc dữ liệu "làm phẳng", thuộc tính đó **SHOULD** có tiền tố "transitive", ví dụ `transitiveChildren` hoặc `transitiveMembers`.
Các thuộc tính như vậy **MUST** biểu diễn một [quan hệ bắc cầu](https://en.wikipedia.org/wiki/Transitive_relation) theo nghĩa toán học. 
Nói đơn giản, nếu `A` là con của `B` và `B` là con của `C`, thì `A` là con của `C` thông qua quan hệ bắc cầu; điều này **MUST** đúng đối với các thuộc tính dùng từ "transitive" trong tên.

### Uniform Resource Locators (URLs)

Uniform Resource Locator (URL) là cách nhà phát triển truy cập các resource của API của bạn.

Các đường dẫn điều hướng đến resource của Microsoft Graph được chia thành nhiều segment,
`{scheme}://{host}/{version}/{category}/[{pathSegment}][?{query}]` trong đó:

- các segment `scheme` và `host` luôn là [`https://graph.microsoft.com`](https://graph.microsoft.com/v1.0/users).

- `version` có thể là v1.0 hoặc beta.

- `category` là một nhóm logic các API thành các danh mục cấp cao nhất.

- `pathSegment` là một hoặc nhiều segment điều hướng có thể trỏ đến một entity, collection các entity, thuộc tính hoặc thao tác khả dụng cho một entity.

- chuỗi `query` MUST tuân theo chuẩn OData về biểu diễn query và được đề cập trong phần Query của đặc tả OData.

Mặc dù HTTP không định nghĩa ràng buộc nào về cách các resource khác nhau liên quan với nhau, nó khuyến khích dùng phân cấp các URL path segment để truyền đạt các mối quan hệ. Trong Microsoft Graph, các mối quan hệ giữa các resource được hỗ trợ bởi các khái niệm OData về singleton, entity set, entity, complex type và navigation property.

Trong Microsoft Graph, một danh mục API cấp cao nhất có thể đại diện cho một trong các nhóm sau:

- Một *khái niệm cốt lõi lấy người dùng làm trung tâm* của Microsoft Graph: /users, /groups, hoặc /me.

- Một *sản phẩm hoặc dịch vụ* của Microsoft bao quát nhiều trường hợp sử dụng: /teamwork, /directory.

- Một *tính năng* bao quát một trường hợp sử dụng đơn lẻ và được *chia sẻ* giữa nhiều sản phẩm của Microsoft: /search, /notifications, /subscriptions.

- Các chức năng *cấu hình quản trị* cho các sản phẩm cụ thể: /admin/exchange.

- Các yêu cầu nội bộ của Microsoft để xuất bản các API Privileged và Hidden, định tuyến và kiểm thử tải: /loadTestEntities.

Về bản chất, các danh mục cấp cao nhất xác định ranh giới của bề mặt API; do đó, việc tạo danh mục mới đòi hỏi sự chặt chẽ bổ sung và sự phê duyệt về quản trị.

### Các mẫu thiết kế mô hình hóa resource

Bạn có thể mô hình hóa các resource có cấu trúc cho API của mình bằng cách dùng entity type hoặc complex type của OData. Khác biệt chính giữa hai loại này là entity type khai báo một thuộc tính khóa để định danh duy nhất các đối tượng của nó, còn complex type thì không. Trong Microsoft Graph, thuộc tính khóa này được gọi là `id` đối với các giá trị khóa do server tạo ra. Nếu có một tên tự nhiên cho thuộc tính khóa, workload có thể dùng tên đó.

Vì các đối tượng của complex type trong Microsoft Graph không có định danh duy nhất, chúng không thể được định địa chỉ trực tiếp qua URI. Do đó, bạn SHOULD dùng entity type để mô hình hóa các resource có thể định địa chỉ, chẳng hạn các mục có thể định địa chỉ riêng lẻ trong một collection. Để biết thêm thông tin, xem [Hướng dẫn về Collection](./articles/collections.md). Complex type phù hợp hơn để biểu diễn các thuộc tính tổng hợp của các entity API.

```xml
 <EntityType Name="author">
    <Key>
        <PropertyRef Name="id" />
    </Key>
    <Property Name="id" Type="Edm.String" Nullable="false" />
    <Property Name="name" Type="Edm.String" />
    <Property Name="address" Type="microsoft.graph.Address" />
</EntityType>
<ComplexType Name="address">
    <Property Name="city" Type="Edm.String" />
    <Property Name="street" Type="Edm.String" />
    <Property Name="stateOrProvince" Type="Edm.String" />
    <Property Name="country" Type="Edm.String" />
</ComplexType>
```

|  Các quy tắc của Microsoft Graph để mô hình hóa resource phức tạp                          |
|---------------------------------------------------------------------------------------------|
| :heavy_check_mark: **MUST** dùng kiểu String cho ID.                                        |
| :heavy_check_mark: **MUST** dùng khóa chính gồm một thuộc tính duy nhất.                    |
| :heavy_check_mark: **MUST** dùng một object làm gốc của mọi payload JSON.                   |
| :heavy_check_mark: **MUST** dùng một root object có thuộc tính value để trả về một collection. |
| :heavy_check_mark: **MUST** bao gồm các annotation @odata.type khi kiểu không rõ ràng.      |
| :warning: **SHOULD NOT** thêm thuộc tính ID vào một complex type.                           |

Có nhiều cách tiếp cận khác nhau để thiết kế mô hình resource API trong các tình huống có nhiều biến thể của một khái niệm chung.
Ba mẫu thiết kế được dùng nhiều nhất trong Microsoft Graph hiện nay là type hierarchy, facet và flat bag of properties:

- **[Type hierarchy](./patterns/subtypes.md)** được biểu diễn bằng một base type trừu tượng với một vài thuộc tính chung và một subtype cho mỗi biến thể.

- **[Facets](./patterns/facets.md)** được biểu diễn bằng một entity type duy nhất với các thuộc tính chung và một thuộc tính facet (thuộc complex type) cho mỗi biến thể. Các thuộc tính facet chỉ có giá trị khi đối tượng biểu diễn biến thể đó.

- **[Flat bag of properties](./patterns/flat-bag.md)** được biểu diễn bằng một entity type có tất cả các thuộc tính tiềm năng cộng thêm một thuộc tính để phân biệt các biến thể, thường gọi là type. Thuộc tính type mô tả biến thể và cũng xác định những thuộc tính nào là bắt buộc hoặc có ý nghĩa đối với biến thể được chỉ định bởi thuộc tính type.

- **[Enums](./patterns/enums.md)** biểu diễn một tập con của kiểu danh nghĩa mà chúng dựa vào, và đặc biệt hữu ích trong các trường hợp một số thuộc tính có các tùy chọn được định nghĩa sẵn và giới hạn.

Bảng sau đây tóm tắt các đặc tính chính của từng mẫu thiết kế và có thể giúp bạn chọn mẫu phù hợp với trường hợp sử dụng của mình.

| Đặc tính API\mẫu thiết kế  | Thuộc tính và hành vi được mô tả trong metadata | Hỗ trợ kết hợp các thuộc tính và hành vi | Xây dựng query đơn giản |
|-------------------------|-----------------------------------------------|---------------------------------------------------|---------------------------|
| Type hierarchy          | có                                            | không                                             | không                     |
| Facets                  | một phần                                      | có                                                | có                        |
| Flat bag                | không                                         | không                                             | có                        |

#### Ưu điểm và nhược điểm

Sau đây là một vài ưu điểm và nhược điểm để quyết định nên dùng mẫu thiết kế nào:

- Trong **[hierarchy](./patterns/subtypes.md)**, sự phụ thuộc lẫn nhau giữa các thuộc tính, tức là thuộc tính nào liên quan đến biến thể nào, được thể hiện đầy đủ trong metadata, và code của client có thể tận dụng điều đó để xây dựng và/hoặc xác thực các request.

- Việc đưa vào các trường hợp mới trong **hierarchy** tương đối độc lập (đó là lý do nó quen thuộc với OOP) và được xem là tương thích ngược (ít nhất là về mặt cú pháp).

- Việc đưa vào các trường hợp/biến thể mới trong **[facets](./patterns/facets.md)** rất đơn giản. Bạn cần cẩn thận vì nó có thể tạo ra các tình huống mà trước đây chỉ một trong các facet khác null còn bây giờ tất cả các facet cũ đều null. Điều này không khác việc thêm subtype mới trong mẫu **hierarchy** hoặc thêm một giá trị type mới trong mẫu **[flat bag](./patterns/flat-bag.md)**.

- **hierarchy** và **facets** (ở mức độ kém hơn một chút) phù hợp với các ngôn ngữ lập trình client định kiểu mạnh, trong khi **flat bag** quen thuộc hơn với các nhà phát triển dùng ngôn ngữ định kiểu yếu hơn.

- **facets** có khả năng mô hình hóa những gì thường gắn với đa kế thừa.

- **facets** và **flat bag** giúp biểu thức query lọc đơn giản hơn về mặt cú pháp. **hierarchy** tường minh hơn nhưng đòi hỏi các cast segment trong query lọc.

- **hierarchy** có thể được tinh chỉnh bằng cách chú thích các collection với các ràng buộc kiểu dẫn xuất của OData; xem [validation vocabulary](https://github.com/oasis-tcs/odata-vocabularies/blob/main/vocabularies/Org.OData.Validation.V1.md). Annotation này giới hạn các giá trị trong một số cây con nhất định của một **hierarchy** kế thừa. Nó làm rõ rằng collection chỉ chứa các phần tử của một số subtype và giúp không trả về các đối tượng thuộc kiểu không phù hợp về mặt ngữ nghĩa.

> **Lưu ý:**
> Như có thể thấy qua một vài ưu điểm và nhược điểm, một trong những khía cạnh quan trọng được bàn ở đây là thiết kế API vượt ra ngoài các khía cạnh cú pháp của API. Do đó, điều quan trọng là phải lên kế hoạch trước cho việc API sẽ phát triển như thế nào, đặt nền móng và cho phép người dùng hình thành sự hiểu biết tốt về ngữ nghĩa của API. **Thay đổi ngữ nghĩa luôn là một breaking change.** Các mẫu thiết kế mô hình hóa khác nhau có sự khác biệt về cách biểu đạt cú pháp và ngữ nghĩa cũng như cách chúng cho phép API phát triển mà không phá vỡ tính tương thích. Để biết thêm thông tin, xem [Hợp đồng API và các thay đổi không tương thích ngược](#api-contract-and-non-backward-compatible-changes) ở phần sau của bài viết này.

#### Thuộc tính nullable

Các cách tiếp cận facet và flat bag thường đòi hỏi các thuộc tính nullable, vì vậy điều quan trọng là vẫn phải dùng thuộc tính non-nullable ở những nơi phù hợp.
Vì kế thừa thường có thể loại bỏ hoàn toàn việc dùng thuộc tính nullable, nên cũng quan trọng là phải biết khi nào cần đến thuộc tính nullable.
Xem [Thuộc tính nullable](./articles/nullable.md) để biết thêm chi tiết.

### Hỗ trợ query

Các Microsoft Graph API trả về collection các resource SHOULD hỗ trợ các tùy chọn query cơ bản theo [đặc tả OData](http://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part2-url-conventions.html#sec_PassingQueryOptionsintheRequestBody) và [Hướng dẫn về Collection](./articles/collections.md).

|Yêu cầu                                                                                             |
|----------------------------------------------------------------------------------------------------|
| :heavy_check_mark: **MUST** hỗ trợ `$select on resource` để cho phép chiếu (projection) thuộc tính. |
| :ballot_box_with_check: **SHOULD** hỗ trợ tùy chọn `/entityTypeCollection/{id}?$expand=navProp1` cho các navigation property của entity. |
| :ballot_box_with_check: **SHOULD** hỗ trợ `$filter` với các phép toán `eq` và `ne` trên thuộc tính của các collection entity. |
| :heavy_check_mark: **MUST** hỗ trợ phân trang các collection (của entity type hoặc complex type) bằng [nextLink](http://docs.oasis-open.org/odata/odata-json-format/v4.01/odata-json-format-v4.01.html#sec_ControlInformationnextLinkodatanextL).  |
| :ballot_box_with_check: **MAY** hỗ trợ [phân trang do server điều khiển](./articles/collections.md#81-server-driven-paging) cho các collection bằng `$skiptoken`.  |
| :ballot_box_with_check: **SHOULD** hỗ trợ [phân trang do client điều khiển](./articles/collections.md#82-client-driven-paging) cho các collection bằng `$top` và `$skip`. |
| :ballot_box_with_check: **SHOULD** hỗ trợ `$count` cho các collection. |
| :ballot_box_with_check: **SHOULD** hỗ trợ sắp xếp bằng `$orderby` cả tăng dần và giảm dần trên các thuộc tính của entity. |

Phần tùy chọn query của một URL OData có thể dài, có khả năng vượt quá độ dài URL tối đa mà các thành phần tham gia truyền hoặc xử lý request hỗ trợ. Một cách để tránh điều này là dùng động từ POST thay cho GET với segment `$query`, và truyền phần tùy chọn query của URL trong body của request như được mô tả trong chương
[OData Query Options](http://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part2-url-conventions.html#sec_PassingQueryOptionsintheRequestBody).

Một cách khác để tránh điều này là dùng JSON batch như được mô tả trong [tài liệu về batching của Microsoft Graph](https://docs.microsoft.com/graph/json-batching#bypassing-url-length-limitations-with-batching).

### Mô hình hóa hành vi

Các thao tác HTTP quyết định cách API của bạn hoạt động. URL của một API, cùng với body của request/response, thiết lập hợp đồng tổng thể mà nhà phát triển có với dịch vụ của bạn. Là nhà cung cấp API, cách bạn quản lý mẫu request/response tổng thể SHOULD là một trong những quyết định triển khai đầu tiên bạn đưa ra.

Nếu có thể, các API SHOULD dùng thiết kế dựa trên resource với các phương thức HTTP chuẩn thay vì các resource thao tác. Resource thao tác là function hoặc action. Theo [chuẩn OData](https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#_Toc31359009), function biểu diễn một thao tác trả về một thể hiện đơn lẻ hoặc một collection các thể hiện của bất kỳ kiểu nào và không có tác dụng phụ quan sát được. Action có thể có tác dụng phụ và có thể trả về kết quả được biểu diễn dưới dạng một entity đơn lẻ hoặc collection của bất kỳ kiểu nào.

|  Các quy tắc của Microsoft Graph để mô hình hóa hành vi         |
|------------------------------------------------------------------|
| :heavy_check_mark: **MUST** dùng POST để tạo entity mới trong các entity set hoặc collection cho phép chèn.<BR>Cách tiếp cận này đòi hỏi dịch vụ tạo ra khóa do hệ thống sinh, hoặc bên gọi cung cấp khóa trong payload của request. |
| :ballot_box_with_check: **SHOULD** dùng thêm PATCH để tạo entity mới trong các entity set hoặc collection cho phép chèn.<BR>Cách tiếp cận [Upsert](./patterns/upsert.md) này đòi hỏi bên gọi cung cấp khóa trong URL của request. |
| :heavy_check_mark: **MUST** dùng PATCH để chỉnh sửa các resource có thể cập nhật.  |
| :heavy_check_mark: **MUST** dùng DELETE để xóa các resource có thể xóa. |
| :heavy_check_mark: **MUST** dùng GET để liệt kê và đọc các resource. |
| :warning: **SHOULD NOT** dùng PUT để cập nhật resource. |
| :ballot_box_with_check: **SHOULD** tránh dùng nhiều round trip để hoàn thành một thao tác logic duy nhất. |

Các resource thao tác MUST có một tham số liên kết (binding parameter) khớp với kiểu của resource được liên kết. Ngoài ra, cả action và function đều hỗ trợ overloading, nghĩa là một định nghĩa API có thể chứa nhiều action hoặc function có cùng tên.

Để xem danh sách bổ sung các phương thức HTTP chuẩn, xem [RFC7231 Hypertext Transfer Protocol](https://www.rfc-editor.org/rfc/rfc7231).

### Xử lý lỗi

 Để cải thiện khả năng truy vết và tính nhất quán của API, bạn MUST dùng mô hình lỗi Microsoft Graph được khuyến nghị và thư viện tiện ích Microsoft Graph để cung cấp một triển khai chuẩn cho dịch vụ của bạn. Giá trị của cặp name/value "message" MUST là biểu diễn mà con người đọc được của lỗi, được điều chỉnh để cung cấp đủ thông tin cho nhà phát triển hiểu lỗi và thực hiện hành động phù hợp. Thông điệp này chỉ nhằm hỗ trợ nhà phát triển và không nên hiển thị cho người dùng cuối.

```http
{
"error": {
    "code": "badRequest",
    "message": "Cannot process the request because a required field is missing.",
    "target": "query",    
    "innererror":{
      "code": "requiredFieldMissing"             
     }
}
```

Mã lỗi cấp cao nhất MUST khớp với mô tả status code của HTTP response, được chuyển sang camelCase, như được liệt kê trong [Status Code Registry (iana.org)](https://www.iana.org/assignments/http-status-codes/http-status-codes.xhtml). Các ví dụ sau minh họa cách mô hình hóa lỗi cho các trường hợp sử dụng phổ biến:

- **Lỗi đơn giản**: Một API muốn báo cáo lỗi chỉ với các chi tiết cấp cao nhất. Đối tượng lỗi chứa mã lỗi cấp cao nhất, thông điệp và target (tùy chọn).

   ```http
    {
      "error": {
        "code": "badRequest",
        "message": "Cannot process the request because it is malformed or incorrect.",
        "target": "resource"
      }
    }
   ```

- **Lỗi chi tiết**: Một API cần cung cấp các chi tiết riêng của dịch vụ về lỗi thông qua thuộc tính innererror của đối tượng lỗi. Thuộc tính này nhằm cho phép các dịch vụ cung cấp một mã lỗi cụ thể để giúp phân biệt các lỗi có cùng mã lỗi cấp cao nhất nhưng được báo cáo vì những lý do khác nhau.
    
   ```http
    {
      "error": {
        "code": "badRequest",
        "message": "Cannot process the request because a required field is missing.",
        "innererror": {
          "code": "requiredFieldOrParameterMissing"                   
        }
      }
    }
   ```

| Microsoft Graph áp dụng các quy tắc lỗi sau                                                                       | 
|-------------------------------------------------------------------------------------------------------------------|
| :heavy_check_mark: **MUST** trả về thuộc tính error với thuộc tính con code trong mọi error response. |
| :heavy_check_mark: **MUST** trả về lỗi 403 Forbidden khi ứng dụng hoặc người dùng đã đăng nhập không có đủ quyền trong auth token. |
| :heavy_check_mark: **MUST** trả về lỗi 429 Too Many Requests khi client vượt quá giới hạn throttling, và lỗi 503 Service Unavailable khi dịch vụ bị quá tải nhưng client vẫn nằm trong giới hạn throttling.|
| :ballot_box_with_check: **SHOULD** trả về lỗi 404 Not Found nếu lỗi 403 sẽ dẫn đến lộ thông tin. |

Để có hướng dẫn chi tiết hơn, xem bài viết về [Error condition responses](./articles/errorResponses.md).

Để xem ánh xạ đầy đủ giữa mã lỗi và HTTP status, xem
[rfc7231 (ietf.org)](https://datatracker.ietf.org/doc/html/rfc7231#section-6).

<a name="api-contract-and-non-backward-compatible-changes"></a>

### Giới hạn đối với các kiểu lõi

Các kiểu `user`, `group` và `device` không nên có thêm thuộc tính cấu trúc mới nào mà không có lý do chính đáng thuyết phục.
Thay vào đó, hãy mô hình hóa khái niệm được biểu diễn bởi các thuộc tính đó thành một entity mới và thực hiện một trong các cách sau:
1. Thêm navigation từ `user`, `group` hoặc `device` đến entity mới.
2. Thêm navigation từ entity mới đến `user`, `group` hoặc `device`.

Xem thêm chi tiết và ví dụ tại [Các kiểu lõi](./articles/coreTypes.md).

## Các chuẩn bên ngoài

Để thuận tiện cho client sử dụng và khả năng tương tác, một số API có thể triển khai một chuẩn được định nghĩa bên ngoài Microsoft Graph và OData. 
Các workload SHOULD tuân theo các chuẩn này một cách chính xác, ngay cả khi chúng xung đột với chuẩn OData và/hoặc các hướng dẫn của Microsoft Graph. 
Các workload SHOULD định nghĩa các chuẩn này trong mô hình CSDL của mình nếu chúng không xung đột với chuẩn OData.
Các chuẩn *có* xung đột với chuẩn OData có thể được định nghĩa trong CSDL theo một trong hai cách:
1. Chỉ dùng `Edm.Untyped` và hỗ trợ cho chuẩn bên ngoài sẽ đến trực tiếp từ phần triển khai của dịch vụ; HOẶC
2. Thêm các phần tử CSDL để mô hình hóa chuẩn bên ngoài, dùng `Edm.String` cho các `EnumType` xung đột với chuẩn OData và `Edm.Untyped` ở bất kỳ nơi nào khác có xung đột với chuẩn OData.

Trong cả hai trường hợp, bất kỳ việc dùng `Edm.String` thay cho `EnumType` hoặc dùng `Edm.Untyped` nào cũng MUST cung cấp một [description annotation](https://github.com/oasis-tcs/odata-vocabularies/blob/main/vocabularies/Org.OData.Core.V1.xml#L105) để ghi lại các tham chiếu đến chuẩn mà client được kỳ vọng tuân theo.
Lợi ích của cách tiếp cận thứ hai là các mô hình định kiểu mạnh có hỗ trợ SDK cho client và cũng có hỗ trợ công cụ đáng kể cho cả workload lẫn client.
Lưu ý rằng một workload có thể chuyển từ cách tiếp cận thứ hai sang cách thứ nhất mà vẫn tương thích ngược, trong trường hợp chuẩn bên ngoài *ban đầu* tuân thủ chuẩn OData và *về sau* xung đột với chuẩn OData. 

## Hợp đồng API và các thay đổi không tương thích ngược

Microsoft Graph định nghĩa breaking change là bất kỳ thay đổi nào buộc client phải thay đổi phần triển khai của mình để tiếp tục hoạt động với dịch vụ, bao gồm các thay đổi đối với hợp đồng API, hành vi API và các thay đổi không tương thích ngược.
Nói chung, mọi thay đổi đối với hợp đồng API của các phần tử hiện có, trừ các thay đổi mang tính bổ sung, đều được xem là breaking. Việc thêm các phần tử mới được cho phép và không được xem là breaking change.

**Các thay đổi không gây phá vỡ (non-breaking):**

- Thêm các thuộc tính nullable hoặc có giá trị mặc định
- Thêm một member sau sentinel member vào một enumeration có thể mở rộng (evolvable)
- Xóa, đổi tên hoặc thay đổi kiểu của annotation
- Thay đổi thứ tự của các thuộc tính
- Thay đổi độ dài hoặc định dạng của các chuỗi opaque, chẳng hạn ID của resource
- Thêm hoặc xóa annotation OpenType="true"

**Các thay đổi gây phá vỡ (breaking):**

- Thay đổi URL hoặc request/response cơ bản gắn với một resource
- Xóa, đổi tên hoặc thay đổi sang một kiểu không tương thích của một thuộc tính đã khai báo
- Xóa hoặc đổi tên các API hoặc tham số API
- Thêm một request header bắt buộc
- Thêm các member của EnumType cho các enumeration không thể mở rộng (nonevolvable)
- Thêm các thuộc tính Nullable="false" vào các kiểu hiện có
- Thêm một tham số không được đánh dấu là [Nullable](http://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/odata-csdl-xml-v4.01.html#sec_Nullable) vào các action hiện có
- Thêm một tham số không được đánh dấu là [Optional](https://github.com/oasis-tcs/odata-vocabularies/blob/main/vocabularies/Org.OData.Core.V1.md#OptionalParameter) vào một function hiện có
- Thay đổi các mã lỗi cấp cao nhất
- Đưa phân trang phía server vào các collection hiện có
- Thực hiện các thay đổi đáng kể về hiệu năng của API, chẳng hạn tăng độ trễ, giới hạn tốc độ hoặc mức đồng thời

Các thay đổi áp dụng được mô tả trong [Model Versioning của đặc tả OData V4.01](https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_ModelVersioning) SHOULD được xem là một phần của mức tối thiểu mà mọi dịch vụ MUST coi là breaking change.

### Đánh phiên bản và ngừng hỗ trợ

Khi thị trường và công nghệ phát triển, các API của bạn sẽ cần được sửa đổi. Trong trường hợp này, bạn MUST tránh các breaking change và bổ sung các resource và tính năng mới theo cách tăng dần. Nếu không thể, thì bạn MUST đánh phiên bản cho các phần tử của API. Microsoft Graph cho phép đánh phiên bản các phần tử, bao gồm entity và thuộc tính. Việc đánh phiên bản bao gồm thêm một phiên bản mới có tên duy nhất của phần tử và đánh dấu phiên bản cũ là đã ngừng hỗ trợ.

Trong một số trường hợp, có một tên mới tự nhiên cho phần tử. Trong các trường hợp khác, khi tên gốc vẫn là tên mô tả tốt nhất, có thể thêm hậu tố _v2 vào tên gốc để làm cho nó duy nhất. Phần tử gốc sau đó được đánh dấu là đã ngừng hỗ trợ bằng cách dùng annotation.

Microsoft Graph cung cấp hai endpoint công khai để hỗ trợ vòng đời API:
- [Các API set trên endpoint v1.0](https://graph.microsoft.com/v1.0) ở trạng thái phát hành chính thức (GA).
- [Các API set trên endpoint beta](https://graph.microsoft.com/beta) ở trạng thái beta hoặc private preview.

Các Microsoft Graph API ở phiên bản GA đảm bảo tính ổn định và nhất quán của API cho client. Nếu API của bạn cần một breaking change trong GA, thì bạn MUST tạo các phiên bản phần tử mới và hỗ trợ các phần tử đã ngừng hỗ trợ tối thiểu 36 tháng hoặc 24 tháng nếu có chứng minh là không còn được sử dụng.

Trên endpoint beta, các breaking change và việc ngừng hỗ trợ API được cho phép, có cân nhắc đến các phụ thuộc và tác động đến khách hàng. Thực hành tốt nhất là thử nghiệm các phiên bản phần tử mới trên endpoint beta trước, rồi sau đó nâng các thay đổi API lên endpoint GA.

Các yêu cầu chi tiết về đánh phiên bản và ngừng hỗ trợ được mô tả trong [Hướng dẫn ngừng hỗ trợ](./articles/deprecation.md).

## Các mẫu thiết kế API được khuyến nghị

Các hướng dẫn ở những phần trước cung cấp một tổng quan ngắn gọn và phần khởi đầu nhanh cho các nhà phát triển Microsoft Graph API. Để tìm hiểu sâu hơn về một chủ đề cụ thể, bạn có thể khám phá [các bài viết bổ sung](./articles/) hoặc tìm hiểu thêm về [các mẫu thiết kế mô hình hóa với Microsoft Graph](./patterns/) được liệt kê trong bảng sau.

| Mẫu thiết kế                                     | Mô tả                                                                      |
|--------------------------------------------------|----------------------------------------------------------------------------|
| [Alternate key](./patterns/alternate-key.md)     | Định danh duy nhất và truy vấn các resource bằng một khóa thay thế.        |
| [Change tracking](./patterns/change-tracking.md) | Giữ cho bên sử dụng API đồng bộ với các thay đổi mà không cần polling.     |
| [Collection subsets](./patterns/subsets.md) | Mô hình hóa các tập con của collection   |
| [Default properties](./patterns/default-properties.md) | Bỏ các thuộc tính không mặc định khỏi response trừ khi chúng được yêu cầu tường minh bằng `$select`.
| [Dictionary](./patterns/dictionary.md)           | Client có thể cung cấp một số lượng không xác định các phần tử dữ liệu cùng kiểu. |
| [Evolvable enums](./patterns/evolvable-enums.md) | Mở rộng các kiểu liệt kê mà không gây breaking change.                     |
| [Facets](./patterns/facets.md)                   | Mô hình hóa các mối quan hệ cha-con.                                       |
| [Flat bag](./patterns/flat-bag.md)               | Mô hình hóa các biến thể của cùng một kiểu.                                |
| [Long running operations](./patterns/longRunningOperations.md)| Mô hình hóa các thao tác mà việc xử lý request của client mất nhiều thời gian. |
| [Modeling subsets](./patterns/subsets.md)        | Mô hình hóa các tập con của collection theo tiêu chí All, None, Included hoặc Excluded. |
| [Namespace](./patterns/namespace.md)             | Tổ chức các định nghĩa resource thành một tập hợp logic.                   |
| [Navigation properties](./patterns/navigation-property.md) | Mô hình hóa các mối quan hệ giữa resource                |
| [Operations](./patterns/operations.md) | Mô hình hóa các thao tác nghiệp vụ phức tạp                          |
| [Type hierarchy](./patterns/subtypes.md)         | Mô hình hóa các quan hệ `is-a` bằng subtype.                               |
| [Upsert](./patterns/upsert.md)                   | Thao tác idempotent để tạo hoặc cập nhật một resource bằng khóa do client cung cấp.   |
| [Viewpoint](./patterns/viewpoint.md)         | Mô hình hóa các thuộc tính riêng theo người dùng cho một resource dùng chung. |

## Tài liệu tham khảo

- [Tài liệu Microsoft Graph](https://docs.microsoft.com/graph/overview)
- [Microsoft REST API Guidelines-deprecated](Guidelines-deprecated.md)
- [Hướng dẫn OData](http://www.odata.org/documentation/)
- [Azure RESTful web API design](https://docs.microsoft.com/azure/architecture/best-practices/api-design)
- [Graph Explorer](https://developer.microsoft.com/graph/graph-explorer)
