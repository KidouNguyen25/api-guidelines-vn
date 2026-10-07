# Mô hình hóa các tập con của collection

Mẫu thiết kế API của Microsoft Graph

*Mẫu thiết kế mô hình hóa tập con của collection là cách mô hình hóa trạng thái gắn với một collection, trong đó trạng thái có thể bao gồm tất cả các instance, một tập con được bao gồm, một tập con bị loại trừ, không có instance nào, hoặc bất kỳ tổ hợp nào của các mục trên.*

## Vấn đề

Một mẫu thiết kế phổ biến là áp dụng một chính sách hoặc trạng thái cho một collection các resource. Điều này kéo theo câu hỏi làm thế nào để mô hình hóa các trường hợp muốn áp dụng cho `all` hoặc `none` mà không phải xử lý đặc biệt các giá trị này trong tập collection hoặc đưa vào các phụ thuộc chéo giữa các thuộc tính. Đồng thời, chúng ta muốn mô hình hóa theo cách dễ hiểu và dễ suy ra cách sử dụng chỉ bằng việc nhìn vào schema.

Một ví dụ là khi bạn có một chính sách cần áp dụng cho người dùng trong một tổ chức. Bạn có thể muốn hỗ trợ mặc định **None**, bật cho **All**, hoặc bật cho người dùng **Select** khi bạn chỉ cấp cho một vài người dùng.

Các mẫu thiết kế hiện có cho việc này hoặc dùng các chuỗi được xử lý đặc biệt, hoặc có các phụ thuộc ràng buộc chặt chẽ giữa hai thuộc tính độc lập. Cả hai đều không trực quan, đều đòi hỏi phải đọc tài liệu, và đều không thể suy ra được từ schema hoặc trong các thư viện client.

## Giải pháp

Dùng một abstract base class trong đó mọi biến thể của tập con đều là các derived type của base subset. Để biết thêm thông tin, xem [hướng dẫn chung về subtyping](./subtypes.md).

Abstract base class cũng có thể tùy chọn chứa một `enum` cho các biến thể khác nhau. Nếu có, `enum` phải có một member cho mọi biến thể có thể có. Mục đích của việc đưa vào là để việc thực hiện các thao tác query và lọc trên các biến thể như `all` và `none` trở nên dễ dàng hơn mà không phải dựa vào các function `isof`.

**Base type *không có* enum cho các biến thể**

```xml
    <ComplexType Name="membershipBase" IsAbstract="true" />
```

**Base type *có* enum cho các biến thể**

```xml
    <ComplexType Name="membershipBase" IsAbstract="true">
      <Property Name="membershipKind" Type="graph.membershipKind"/>
    </ComplexType>

    <EnumType Name="membershipKind">
      <Member Name="all"/>
      <Member Name="enumerated"/>
      <Member Name="none"/>
      <Member Name="unknownFutureValue"/>
    </EnumType>
```

**Các derived type**

```xml
    <ComplexType Name="noMembership" BaseType="graph.membershipBase"/>

    <ComplexType Name="allMembership" BaseType="graph.membershipBase"/>

    <ComplexType Name="enumeratedMembership" BaseType = "graph.membershipBase">
      <Property Name="members" Type="Collection(Edm.String)"/>
    </ComplexType>

    <ComplexType Name="excludedMembership" BaseType="graph.membershipBase">
      <Property Name="members" Type="Collection(Edm.String)"/>
    </ComplexType>
```

Lưu ý rằng các giá trị tên và kiểu trong các ví dụ trên chỉ mang tính minh họa và có thể được thay bằng các giá trị tương đương trong kịch bản của bạn. Ví dụ, tên kiểu không nhất thiết phải là `memberships`. Collection cũng không nhất thiết phải là một collection; nó có thể là một giá trị đơn và không nhất thiết phải là chuỗi.

Tên các kiểu của mẫu thiết kế này nên đáp ứng các quy ước đặt tên sau:

- Tên base type nên có hậu tố `Base`, và tên kiểu enumeration (nếu có định nghĩa `enum`) nên có hậu tố `Kind`.
- Các kiểu con dẫn xuất nên có tên với tiền tố là các giá trị enumeration; ví dụ, nếu giá trị member của enumeration là `value1` thì tên derived type là `value1<type>`.

```xml
    <ComplexType Name="<type>Base" IsAbstract="true">
      <Property Name="<type>Kind" Type="graph.<type>Kind"/>
    </ComplexType>

    <EnumType Name="<type>Kind">
      <Member Name="<value1>"/>
      <Member Name="<value2>"/>
      <Member Name="unknownFutureValue"/>
    </EnumType>

    <ComplexType Name="value1<type>" BaseType="graph.<type>Base"/>

    <ComplexType Name="value2<type>" BaseType="graph.<type>Base">
      <Property Name="<property-name>" Type="<property-type>"/>
    </ComplexType>
```

## Khi nào nên dùng mẫu thiết kế này

Dùng mẫu thiết kế này khi hỗ trợ hai hoặc nhiều trạng thái collection trong số các trạng thái sau, trong đó ít nhất một trạng thái là biến thể tập con:

- Tất cả đối tượng
- Không có đối tượng nào
- Tập con các đối tượng được bao gồm
- Tập con các đối tượng bị loại trừ

Nếu bạn chỉ cần hỗ trợ hai trạng thái&mdash;All hoặc None&mdash;mà không dùng bất kỳ tập con nào, tốt hơn là dùng một Boolean để bật và tắt.

## Các vấn đề và điểm cần cân nhắc

Do chúng ta dùng mô hình subtype tổng quát, các hạn chế của mô hình subtyping cũng áp dụng ở đây; để biết thêm chi tiết, xem [tài liệu về subtyping](./subtypes.md).

## Ví dụ

```http
GET https://graph.microsoft.com/v1.0/identity/conditionalAccess/policies/
```

_Lưu ý: Các thuộc tính không liên quan trên entity được lược bỏ để dễ đọc hơn._

```json
{
    "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#conditionalAccessPolicy",
    "values": [
        {
            "id": "66d36273-fe4c-d478-dc22-e0179d856ce7",
            "conditions": {
                "users": {
                    "includeGuestsOrExternalUsers": {
                        "externalTenants": {
                            "@odata.type":"microsoft.graph.conditionalAccessAllExternalTenants",
                            "membershipKind": "all"
                        }
                    }
                }
            }
        },
        {
            "id": "99d212f4-d94e-cde1-8e3c-208d78238277",
            "conditions": {
                "users": {
                    "includeGuestsOrExternalUsers": {
                        "externalTenants": {
                            "@odata.type":"microsoft.graph.conditionalAccessEnumeratedExternalTenants",
                            "membershipKind": "enumerated",
                            "members": ["bd005e2a-876d-4bf0-92a1-ae9ff4276d54"]
                        }
                    }
                }
            }
        }
    ]
}
```

```http
POST https://graph.microsoft.com/v1.0/identity/conditionalAccess/policies/
```

_Lưu ý: Các thuộc tính không liên quan trên entity được lược bỏ để dễ đọc hơn._

```json
{
    "id": "66d36273-fe4c-d478-dc22-e0179d856ce7",
    "conditions": {
        "users": {
            "includeGuestsOrExternalUsers": {
                "externalTenants": {
                    "@odata.type":"microsoft.graph.conditionalAccessAllExternalTenants"
                }
            }
        }
    }
}
```

hoặc

```http
POST https://graph.microsoft.com/v1.0/identity/conditionalAccess/policies/
```

_Lưu ý: Các thuộc tính không liên quan trên entity được lược bỏ để dễ đọc hơn._

```json
{
    "id": "66d36273-fe4c-d478-dc22-e0179d856ce7",
    "conditions": {
        "users": {
            "includeGuestsOrExternalUsers": {
                "externalTenants": {
                    "@odata.type":"microsoft.graph.conditionalAccessEnumeratedExternalTenants",
                    "members": ["bd005e2a-876d-4bf0-92a1-ae9ff4276d54"]
                }
            }
        }
    }
}
```

### Lọc khi base type có thuộc tính enum "kind"

```http
GET https://graph.microsoft.com/v1.0/identity/conditionalAccess/policies?$filter=conditions/users/includeGuestsOrExternalUsers/externalTenants/membershipKind eq 'all'

200 OK
{
    "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#conditionalAccessPolicy",
    "values": [
        {
            "id": "66d36273-fe4c-d478-dc22-e0179d856ce7",
            "conditions": {
                "users": {
                    "includeGuestsOrExternalUsers": {
                        "externalTenants": {
                            "@odata.type":"microsoft.graph.conditionalAccessAllExternalTenants",
                            "membershipKind": "all"
                        }
                    }
                }
            }
        }
    ]
}
```

### Lọc khi base type không có thuộc tính enum "kind"

```HTTP
GET https://graph.microsoft.com/v1.0/identity/conditionalAccess/policies?$filter=isof(conditions/users/includeGuestsOrExternalUsers/externalTenants, microsoft.graph.conditionalAccessAllExternalTenants)

200 OK
{
    "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#conditionalAccessPolicy",
    "values": [
        {
            "id": "66d36273-fe4c-d478-dc22-e0179d856ce7",
            "conditions": {
                "users": {
                    "includeGuestsOrExternalUsers": {
                        "externalTenants": {
                            "@odata.type":"microsoft.graph.conditionalAccessAllExternalTenants",
                            "membershipKind": "all"
                        }
                    }
                }
            }
        }
    ]
}
```
