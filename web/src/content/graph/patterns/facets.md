# Facet (Facets)

Mẫu thiết kế API của Microsoft Graph

*Một mẫu thiết kế thường gặp trong Microsoft Graph là mô hình hóa nhiều biến thể của một khái niệm chung thành một entity type duy nhất với các thuộc tính chung và các facet cho từng biến thể.*

## Vấn đề

Nhà thiết kế API cần mô hình hóa một tập các resource không đồng nhất, có các thuộc tính và hành vi chung, và có thể thể hiện đặc điểm của nhiều biến thể cùng một lúc vì các biến thể không loại trừ lẫn nhau.
Ví dụ, một đoạn phim lưu trên OneDrive vừa là một tệp (file) vừa là một video. Có các thuộc tính gắn với từng biến thể.

## Giải pháp

Nhà thiết kế API tạo nhiều complex type để gói các thuộc tính cho từng biến thể, rồi định nghĩa một entity type với một thuộc tính cho mỗi complex type để chứa các thuộc tính của biến thể đó.

Trong giải pháp này, một biến thể con được nhận biết bởi sự hiện diện của một hoặc nhiều facet trong đối tượng cha.

## Khi nào dùng mẫu thiết kế này

Mẫu facet hữu ích khi có một số lượng biến thể và chúng không loại trừ lẫn nhau. Nó cũng giúp việc query resource bằng biểu thức OData `$filter` dễ dàng hơn về mặt cú pháp vì không cần ép kiểu (casting).

Bạn có thể cân nhắc các mẫu liên quan như [phân cấp kiểu (type hierarchy)](./subtypes.md) và [flat bag of properties](./flat-bag.md).

## Các vấn đề và điều cần cân nhắc

Khi đưa vào một facet mới, bạn cần đảm bảo rằng facet mới không làm thay đổi ngữ nghĩa của mô hình bởi các ràng buộc ngầm định của nó.

## Ví dụ

Resource driveItem biểu diễn một tệp, thư mục, hình ảnh hoặc mục khác được lưu trong một drive và được mô hình hóa bằng một entity type với nhiều facet.

```XML
 
 <EntityType Name="driveItem" BaseType="graph.baseItem" OpenType="true" ags:MasterService="Microsoft.FileServices" ags:WorkloadIds="Microsoft.Excel,Microsoft.Powerpoint,Microsoft.Teams.GraphSvc,Microsoft.Word">
        <Property Name="audio" Type="graph.audio" />
        <Property Name="bundle" Type="graph.bundle" />
        <Property Name="content" Type="Edm.Stream" />
        <Property Name="cTag" Type="Edm.String" />
        <Property Name="deleted" Type="graph.deleted" />
        <Property Name="file" Type="graph.file" />
        <Property Name="fileSystemInfo" Type="graph.fileSystemInfo" />
        <Property Name="folder" Type="graph.folder" />
        <Property Name="image" Type="graph.image" />
        <Property Name="location" Type="graph.geoCoordinates" />
        <Property Name="malware" Type="graph.malware" />
        <Property Name="media" Type="graph.media" />
        <Property Name="package" Type="graph.package" />
        <Property Name="pendingOperations" Type="graph.pendingOperations" />
        <Property Name="photo" Type="graph.photo" />
        <Property Name="publication" Type="graph.publicationFacet" />
        <Property Name="remoteItem" Type="graph.remoteItem" />
        <Property Name="root" Type="graph.root" />
        <Property Name="searchResult" Type="graph.searchResult" />
        <Property Name="shared" Type="graph.shared" />
        <Property Name="sharepointIds" Type="graph.sharepointIds" />
        <Property Name="size" Type="Edm.Int64" />
        <Property Name="source" Type="graph.driveItemSource" />
        <Property Name="specialFolder" Type="graph.specialFolder" />
        <Property Name="video" Type="graph.video" />
        <Property Name="webDavUrl" Type="Edm.String" />
     ...
      </EntityType>
```

Một API request để lấy tất cả các mục từ OneDrive cá nhân trả về một collection không đồng nhất với các facet khác nhau được điền. Trong ví dụ sau, collection có một thư mục, một tệp và một hình ảnh. Entity hình ảnh có hai facet được điền: file và image.

```
GET https://graph.microsoft.com/v1.0/me/drive/root/children

Response shortened for readability:
 
    "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#users('93816c1c-1b19-41de-a322-a1643d7f4d39')/drive/root/children",
    "value": [
        {
            "createdDateTime": "2021-07-07T13:59:47Z",
            "name": "Microsoft Teams Chat Files",
             ...,
            "folder": {
                "childCount": 15
            }
        },
        ...
       {
            "createdDateTime": "2021-12-15T00:07:36Z",
            "name": "Versioning and Deprecation.docx",          
            ...,           
            "file": {
                "mimeType": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "hashes": {
                    "quickXorHash": "r2d9uZilW0zEIXwycymsUQzhV+U="
                }
            },
           ...
        },
        {
            "createdDateTime": "2021-12-21T16:32:51Z",
            "name": "WhaleShark.jpg",
            ...
            "file": {
                "mimeType": "image/jpeg",
                "hashes": {
                    "quickXorHash": "2vHpAA7RDZJteIwl1pXR980xuh4="
                }
            },
           ...,
            "image": {}
        }
    ]
```
