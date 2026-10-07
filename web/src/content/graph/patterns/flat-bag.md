# Flat bag of properties

Mẫu thiết kế API của Microsoft Graph

*Một mẫu thiết kế đã biết trong Microsoft Graph là mô hình hóa nhiều biến thể của một khái niệm chung thành một entity type duy nhất chứa tất cả các thuộc tính có thể có, cộng thêm một thuộc tính bổ sung để phân biệt các biến thể.*

## Vấn đề

Người thiết kế API cần mô hình hóa một số lượng nhỏ và có giới hạn các biến thể của một khái niệm chung, với danh sách thuộc tính ngắn gọn không chồng chéo và hành vi nhất quán giữa các biến thể. Người thiết kế cũng muốn đơn giản hóa việc xây dựng query.

## Giải pháp

Người thiết kế API tạo một entity type chứa tất cả các thuộc tính có thể có, cộng thêm một thuộc tính bổ sung để phân biệt các biến thể, thường được gọi là `variantType`. Với mỗi giá trị của `variantType`, một số thuộc tính có ý nghĩa còn những thuộc tính khác bị bỏ qua.

## Khi nào nên dùng mẫu thiết kế này

Mẫu thiết kế flat bag hữu ích khi có một số lượng nhỏ các biến thể với hành vi tương tự, và các biến thể chủ yếu được query cho các thao tác chỉ đọc. Mẫu thiết kế này cũng giúp việc query resource bằng biểu thức OData `$filter` dễ dàng hơn về mặt cú pháp vì không cần ép kiểu (casting).

## Các vấn đề và điều cần cân nhắc

Nhìn chung, mẫu thiết kế flat bag là lựa chọn mô hình hóa ít được khuyến nghị nhất vì nó có kiểu yếu và khó kiểm chứng về mặt ngữ nghĩa các thay đổi nhắm đến resource. Tuy nhiên, có những trường hợp mà sự đơn giản của query và số lượng thuộc tính hạn chế có thể quan trọng hơn các cân nhắc của một cách tiếp cận có kiểu chặt chẽ hơn.
Mẫu thiết kế này không được khuyến nghị khi có nhiều biến thể và nhiều thuộc tính vì payload sẽ trở nên thưa thớt dữ liệu.

Bạn có thể cân nhắc các mẫu thiết kế liên quan như [type hierarchy](./subtypes.md) và [facets](./facets.md).

## Ví dụ

Một ví dụ tốt cho việc triển khai flat bag là kiểu recurrencePattern tại [recurrencePattern](https://docs.microsoft.com/graph/api/resources/recurrencepattern).

recurrencePattern có sáu biến thể được biểu diễn bằng sáu giá trị khác nhau của thuộc tính `type` (ví dụ: daily, weekly, ...). Điểm mấu chốt ở đây là với mỗi giá trị này, một số thuộc tính có ý nghĩa còn những thuộc tính khác bị bỏ qua (ví dụ: `daysOfWeek` có liên quan khi `type` là `weekly` nhưng không liên quan khi là `daily`).

```
<EnumType Name="recurrencePatternType">
        <Member Name="daily" Value="0" />
        <Member Name="weekly" Value="1" />
        <Member Name="absoluteMonthly" Value="2" />
        <Member Name="relativeMonthly" Value="3" />
        <Member Name="absoluteYearly" Value="4" />
        <Member Name="relativeYearly" Value="5" />
</EnumType>

<ComplexType Name="recurrencePattern" ags:WorkloadIds="Microsoft.Exchange,Microsoft.IdentityGovernance.AccessReviews,Microsoft.IGAELM,Microsoft.PIM.AzureRBAC,Microsoft.Tasks,Microsoft.Teams.Shifts,Microsoft.Todo" ags:PassthroughWorkloadIds="Microsoft.Exchange">
        <Property Name="dayOfMonth" Type="Edm.Int32" Nullable="false" />
        <Property Name="daysOfWeek" Type="Collection(graph.dayOfWeek)" />
        <Property Name="firstDayOfWeek" Type="graph.dayOfWeek" />
        <Property Name="index" Type="graph.weekIndex" />
        <Property Name="interval" Type="Edm.Int32" Nullable="false" />
        <Property Name="month" Type="Edm.Int32" Nullable="false" />
        <Property Name="type" Type="graph.recurrencePatternType" />
</ComplexType>
```
