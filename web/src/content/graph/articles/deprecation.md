# Hướng dẫn ngừng hỗ trợ (deprecation)

Nếu API của bạn cần đưa vào các thay đổi gây phá vỡ tương thích (breaking change), bạn phải thêm các annotation Revisions vào định nghĩa API với các thuật ngữ sau:

- **Date:** Ngày phần tử được đánh dấu là ngừng hỗ trợ.
- **Version:** Dùng để tổ chức ChangeLog. Dùng định dạng "YYYY-MM/Category", trong đó "YYYY-MM" là tháng thông báo ngừng hỗ trợ, và "Category" là danh mục mà thay đổi được mô tả trong đó.
- **Kind:** Deprecated
- **Description:** Mô tả thay đổi dành cho con người đọc. Được dùng trong ChangeLog, tài liệu, v.v.
- **RemovalDate:** Ngày sớm nhất mà phần tử có thể bị gỡ bỏ.

Annotation có thể được áp dụng cho một type, một entity set, một singleton, một thuộc tính, một
navigation property, một function hoặc một action. Nếu một type được đánh dấu là ngừng hỗ trợ, thì
không cần đánh dấu các thành viên của type đó là ngừng hỗ trợ, cũng không cần
annotate các nơi sử dụng type đó.

## Ví dụ về annotation thuộc tính

```xml
<EntityType Name="outlookTask" BaseType="Microsoft.OutlookServices.outlookItem" ags:IsMaster="true" ags:WorkloadName="Task" ags:EnabledForPassthrough="true">
  <Annotation Term="Org.OData.Core.V1.Revisions">
    <Collection>
      <Record>
        <PropertyValue Property = "Date" Date="2022-03-30"/>
        <PropertyValue Property = "Version" String="2022-03/Tasks_And_Plans"/>
        <PropertyValue Property = "Kind" EnumMember="Org.OData.Core.V1.RevisionKind/Deprecated"/>
        <PropertyValue Property = "Description" String="The Outlook tasks API is deprecated and will stop returning data on June 30, 2024. Please use the new To Do API."/>
        <PropertyValue Property = "RemovalDate" Date="2024-06-30"/>
      </Record>
    </Collection>
  </Annotation>
</EntityType>
```

Khi URL của request chứa tham chiếu đến một phần tử model đã bị ngừng hỗ trợ, gateway sẽ thêm vào response một [Deprecation header](https://tools.ietf.org/html/draft-dalal-deprecation-header-02) (với ngày phần tử được đánh dấu là ngừng hỗ trợ) và một Sunset header (với ngày cách ngày ngừng hỗ trợ hai năm).

## Ví dụ về Deprecation header

```
 Deprecation: Wed, 30 Mar 2022 11:59:59 GMT
 Sunset:  Thursday, 30 June 2024 23:59:59 GMT
 Link: https://docs.microsoft.com/en-us/graph/changelog#2022-03-30_name ; rel="deprecation"; type="text/html"; title="name",https://docs.microsoft.com/en-us/graph/changelog#2022-03-30_state ; rel="deprecation"; type="text/html"; title="state"

```
