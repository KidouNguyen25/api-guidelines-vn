# Core Types

## Tổng quan

Trong Microsoft Graph có những kiểu liên kết chặt chẽ với, hoặc đóng vai trò trung tâm của, hệ sinh thái Microsoft Graph. Các kiểu này thường ở vị trí có thể chứa những structural property liên quan đến các API khác, vì chúng được kết nối với nhiều entity trong Microsoft Graph.

Structural property chỉ nên được thêm vào các core type này khi chúng thực sự là bản chất của chính entity đó, và tuyệt đối không phải vì sự tiện lợi do vị trí của entity trong Microsoft Graph.

## Core Types trong Microsoft Graph

Các kiểu sau được xác định là core type, và trong mọi trường hợp đều cần có lý do thuyết phục để được phép thêm structural property mới.

- ```user```
- ```group```
- ```device```

## Các giải pháp thay thế cho việc thêm Structural Property

Thay vì thêm một structural property vào core type hiện có (`user`, `group` hoặc `device`), hãy tạo một kiểu mới mô hình hóa thông tin mà structural property được đề xuất nắm giữ.
Sau đó, mô hình hóa mối quan hệ giữa core type hiện có và kiểu mới bằng cách thêm một navigation property. Để biết thông tin về mô hình hóa bằng navigation property, xem [Navigation Property](../patterns/navigation-property.md).

## Ví dụ:

Mô hình hóa việc thêm "thông tin tài khoản ngân hàng", gồm hai thuộc tính `accountNumber` và `routingNumber`, vào entity type ```user```.

### Sai:

Đừng thêm thuộc tính mới vào các core type như `user`.

```xml
<EntityType name="user">
    <Property Name="accountNumber" Type="Edm.string"/>
    <Property Name="routingNumber" Type="Edm.string"/>
</EntityType>
```

### Đúng:

Mô hình hóa thông tin bằng cách tạo một kiểu mới và mô hình hóa mối quan hệ với core type hiện có bằng một navigation property. Để xác định lựa chọn nào phù hợp nhất, xem [Navigation Property](../patterns/navigation-property.md):

#### Lựa chọn 1: Thêm một navigation property vào core type hiện có, trỏ tới kiểu mới, và chứa (contain) kiểu mới đó.

Định nghĩa entity type mới:
```xml
<EntityType name="bankAccountDetail">
    <Property Name="accountNumber" Type="Edm.string"/>
    <Property Name="routingNumber" Type="Edm.string"/>
</EntityType>
```

Thêm một contained navigation từ user tới entity type mới:
```xml
<EntityType name="user">
    <NavigationProperty Name="bankAccountDetail" Type="bankAccountDetail" ContainsTarget="true"/>
</EntityType>
```

#### Lựa chọn 2: Chứa kiểu mới trong một entity set ở nơi khác, và thêm một navigation property trỏ tới kiểu mới vào core type hiện có.

Định nghĩa entity type mới:
```xml
<EntityType name="bankAccountDetail">
    <Property Name="accountNumber" Type="Edm.string"/>
    <Property Name="routingNumber" Type="Edm.string"/>
</EntityType>
```

Chứa entity type mới trong một entity set hoặc singleton:
```xml
<EntitySet Name="bankAccountDetails" EntityType="bankAccountDetail">
```

Thêm một navigation từ user tới kiểu mới:
```xml
<EntityType name="user">
    <NavigationProperty Name="bankAccountDetail" Type="bankAccountDetail" />
</EntityType>
```

#### Lựa chọn 3: Chứa kiểu mới trong một entity set ở nơi khác, và thêm vào kiểu mới một navigation property trỏ tới core type hiện có.

Định nghĩa entity type mới, kèm một navigation tới user:
```xml
<EntityType name="bankAccountDetail">
    <Property Name="accountNumber" Type="Edm.string"/>
    <Property Name="routingNumber" Type="Edm.string"/>
    <NavigationProperty Name="user" Type="microsoft.graph.user" />
</EntityType>
```

Chứa entity type mới trong một entity set hoặc singleton:
```xml
<EntitySet Name="bankAccountInformations" EntityType="bankAccountInformation">
```
