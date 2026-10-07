# Namespace

Mẫu thiết kế API của Microsoft Graph

*Mẫu namespace cho phép tổ chức các định nghĩa resource lại với nhau thành một tập hợp có tính logic.*

## Vấn đề

Khi xây dựng một sản phẩm phức tạp, nhà thiết kế API có thể cần mô hình hóa nhiều
resource khác nhau cùng các mối quan hệ của chúng. Để có trải nghiệm người dùng tốt hơn và
dễ khám phá hơn, các thành phần API liên quan cần được nhóm lại với nhau.  

## Giải pháp

Nhà thiết kế API có thể dùng thuộc tính namespace của CSDL schema để khai báo một
namespace và tổ chức một cách logic các entity API liên quan trong metadata của Microsoft Graph.

```XML
<Schema Namespace="microsoft.graph.{namespace}" Alias="{namespace}">
...
</Schema>
```

Một namespace công khai phải chứa tiền tố `microsoft.graph.` và được viết theo camel
case; nghĩa là `microsoft.graph.myNamespace`. Các phần tử được định nghĩa trong namespace không có tiền tố
`microsoft.graph` sẽ được ánh xạ vào namespace công khai `microsoft.graph`.

Namespace không nên có nhiều hơn hai segment sau tiền tố `microsoft.graph`;
nghĩa là `microsoft.graph.myNamespace.mySubNamespace`. 

Các namespace công khai phải định nghĩa một alias, và alias đó phải là phép nối của
các segment theo sau tiền tố `microsoft.graph` với quy tắc camel case phù hợp được áp dụng;
nghĩa là `myNamespaceMySubNamespace`.

Khi cần ép kiểu (type casting) trong query, request hoặc response của API, một tên kiểu
đầy đủ (fully qualified) được biểu diễn bằng phép nối của namespace hoặc alias,
theo sau là một dấu chấm (`.`) và tên kiểu. 

## Khi nào dùng mẫu thiết kế này

Việc nhóm resource của API tạo ra trải nghiệm thân thiện với người dùng, giữ tất cả resource của một tính năng cụ thể gần nhau và hạn chế độ dài của các gợi ý trong IDE như auto-complete ở một số ngôn ngữ lập trình.

Để có trải nghiệm người dùng nhất quán, namespace mới nên được căn chỉnh với một danh mục API cấp cao nhất.

## Các vấn đề và điều cần cân nhắc

- Các yêu cầu nhất quán của Microsoft Graph không khuyến khích dùng cùng một tên kiểu cho các khái niệm khác nhau, kể cả trong các namespace khác nhau. Tên kiểu của Microsoft Graph phải mang tính mô tả và nên biểu diễn một khái niệm duy nhất trên toàn bộ bề mặt API.

- Một namespace phải nhất quán với một danh mục API trong đường dẫn điều hướng theo [Hướng dẫn REST API của Microsoft Graph](../GuidelinesGraph.md#uniform-resource-locators-urls).

- Việc thay đổi một namespace có tiền tố `microsoft.graph`, hoặc di chuyển các kiểu giữa, vào, hoặc ra khỏi một namespace có tiền tố `microsoft.graph`, là một thay đổi gây phá vỡ tương thích (breaking change).

- Để mở rộng một kiểu trong một schema khác, một dịch vụ phải khai báo schema đó và kiểu trong đó. Điều này về mặt khái niệm tương tự như partial type của .NET.

- Để tham chiếu một kiểu trong một schema khác, chỉ cần tham chiếu kiểu đó bằng tên đầy đủ (namespace + tên kiểu).

- Không cho phép tham chiếu vòng giữa các namespace vì nhiều ngôn ngữ hướng đối tượng không hỗ trợ vòng lặp giữa các namespace.

- Microsoft Graph có một số ràng buộc định sẵn cho các namespace được khai báo:

  - Tất cả namespace công khai phải có tiền tố `microsoft.graph`.

  - Các namespace công khai phải khai báo một alias là phép nối của các segment theo sau tiền tố `microsoft.graph`.

  - Khuyến nghị tối đa hai cấp lồng nhau bên dưới `microsoft.graph`.
    
  - Nếu một namespace không bắt đầu bằng tiền tố `microsoft.graph`, tất cả các kiểu trong schema được ánh xạ vào namespace công khai `microsoft.graph`.

## Ví dụ

### Khai báo namespace và kiểu

```XML
<Schema Namespace="microsoft.graph.search" Alias="search" xmlns=”<http://docs.oasis-open.org/odata/ns/edm>”\>
…
    <EntityType Name="bookmark" …
    </EntityType>
…
</Schema>
```

Tên kiểu đầy đủ: `microsoft.graph.search.bookmark`

### Quản lý nhiều schema

Các workload phải định nghĩa schema trong CSDL của mình bằng định dạng Edmx.
Sau đây là ví dụ về một workload cung cấp nhiều namespace.

> **Mẹo:** Cũng như với các schema nằm trong namespace `microsoft.graph`, việc định nghĩa một
entity type là tùy chọn; theo mặc định schema của bạn kế thừa tất cả entity type
từ `microsoft.graph.entity`.

> **Cảnh báo:** Không được đi chệch khỏi cấu trúc chung trong ví dụ sau.
Công cụ kiểm tra schema kỳ vọng cấu trúc XML (bao gồm cả các khai báo
XML namespace) khớp với ví dụ này.

```XML
<?xml version="1.0" encoding="utf-8"?>
<edmx:Edmx Version="4.0" xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx" xmlns:odata="http://schemas.microsoft.com/oDataCapabilities">
  <edmx:DataServices>
    <Schema Namespace="microsoft.graph.callRecords" Alias="callRecords" xmlns="http://docs.oasis-open.org/odata/ns/edm" xmlns:odata="http://schemas.microsoft.com/oDataCapabilities">
      <EntityType Name="callRecord">
        <Key>
          <PropertyRef Name="id" />
        </Key>
        <Property Name="version" Type="Edm.Int64" Nullable="false" />
        <Property Name="id" Type="Edm.String" Nullable="false" />
      </EntityType>
    </Schema>
    <Schema Namespace="microsoft.graph" xmlns="http://docs.oasis-open.org/odata/ns/edm">
      <EntityContainer Name="defaultContainer">
        <Singleton Name="communications" Type="microsoft.graph.cloudCommunications" />
      </EntityContainer>
      <EntityType Name="cloudCommunications">
        <Key>
          <PropertyRef Name="id" />
        </Key>
        <Property Name="id" Type="Edm.String" Nullable="false" />
        <NavigationProperty Name="callRecords" Type="Collection(microsoft.graph.callRecords.callRecord)" ContainsTarget="true" />
      </EntityType>
    </Schema>
  </edmx:DataServices>
</edmx:Edmx>
```
