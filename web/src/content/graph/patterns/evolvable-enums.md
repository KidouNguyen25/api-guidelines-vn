# Evolvable enums

Mẫu thiết kế API của Microsoft Graph

*Mẫu evolvable enums cho phép bên cung cấp API mở rộng các kiểu liệt kê bằng những thành viên mới mà không làm hỏng bên sử dụng API.*

Lưu ý: Bạn có thể muốn đọc [hướng dẫn về Enum](./enums.md) trước

## Vấn đề

Bên cung cấp API thường muốn thêm các thành viên mới vào một enum sau khi enum đó được công bố lần đầu. Một số thư viện tuần tự hóa có thể bị lỗi khi gặp các thành viên của enum được thêm vào sau khi mô hình tuần tự hóa đã được sinh ra. Trong tài liệu này, chúng tôi gọi mọi thành viên enum được thêm vào là unknown (không xác định).

## Giải pháp

Giải pháp là thêm một thành viên 'sentinel' có tên `unknownFutureValue` ở cuối các thành viên enum hiện đã biết. Sau đó, bên cung cấp API thay thế mọi thành viên có giá trị số lớn hơn `unknownFutureValue` bằng `unknownFutureValue`.

Nếu bên sử dụng API có thể xử lý các giá trị enum không xác định, bên sử dụng có thể chọn nhận các thành viên enum không xác định bằng cách chỉ định HTTP header `Prefer: include-unknown-enum-members` trong request. Khi đó, bên cung cấp API cho biết rằng tùy chọn này đã được áp dụng bằng cách trả về HTTP header `Preference-Applied: include-unknown-enum-members` trong response.

## Khi nào nên dùng mẫu thiết kế này

Thực hành tốt nhất là đưa giá trị `unknownFutureValue` vào ngay khi enum được giới thiệu lần đầu, để có sự linh hoạt khi mở rộng enum trong suốt vòng đời của API. Ngay cả khi bên cung cấp API tin rằng họ đã đưa mọi thành viên có thể có vào enum, chúng tôi vẫn đặc biệt khuyến nghị bạn đưa vào thành viên `unknownFutureValue` để đáp ứng những tình huống không lường trước trong tương lai có thể đòi hỏi phải mở rộng enum.

Mẫu thiết kế này không được dùng trong các kịch bản mà bên sử dụng API muốn dùng những thành viên enum mà bên cung cấp API không biết.

## Các vấn đề và điểm cần cân nhắc

Hãy cân nhắc những điều sau:

- Thành viên enum có tên `unknownFutureValue` MUST chỉ được dùng làm giá trị sentinel. Bên cung cấp API MUST not đưa thành viên có tên `unknownFutureValue` vào enum cho bất kỳ mục đích nào khác.

- Việc thay đổi giá trị (tức là vị trí) của thành viên sentinel `unknownFutureValue` được xem là thay đổi gây phá vỡ tương thích (breaking change) và phải tuân theo quy trình [ngừng hỗ trợ](../deprecation.md).

- Các enum type có thể có nhiều thành viên với cùng một giá trị số để cho phép đặt bí danh (alias) cho các thành viên enum. `unknownFutureValue` MUST not được đặt bí danh cho bất kỳ thành viên enum nào khác.

- Client không có cách nào để cho biết rằng nó có thể xử lý một tập con các thành viên enum không xác định. Thay vào đó, client chỉ có thể chỉ định rằng nó không thể xử lý bất kỳ thành viên enum không xác định nào, hoặc nó có thể xử lý mọi thành viên enum không xác định.

- Header `Prefer: include-unknown-enum-members` áp dụng cho tất cả các enum có trong request/response. Bên sử dụng API không có cách nào để chỉ áp dụng hành vi này cho một tập con các enum type.

- Giá trị mới MUST not được chèn vào enum trước `unknownFutureValue`. Bên triển khai được khuyến nghị đặt giá trị số của `unknownFutureValue` lớn hơn thành viên enum đã biết cuối cùng một đơn vị, để bảo đảm không có khoảng trống nào mà một thành viên mới có thể vô tình được thêm vào. Ngoại lệ là trường hợp flagged enum, khi đó giá trị của `unknownFutureValue` nên là lũy thừa của 2 kế tiếp.

- Với flagged enum, cần thận trọng để bảo đảm `unknownFutureValue` không được đưa vào bất kỳ thành viên enum nào đại diện cho tổ hợp của các thành viên enum khác.

- Nếu giá trị của một thuộc tính chứa flag enum bao gồm nhiều giá trị không xác định, tất cả chúng nên được thay thế bằng một giá trị `unknownFutureValue` duy nhất (tức là không nên trả về nhiều giá trị `unknownFutureValue`).

- Nếu bên sử dụng API chỉ định `unknownFutureValue` làm giá trị của một thuộc tính trong request `POST`/`PUT` hoặc làm tham số của một action hoặc function, bên cung cấp API phải từ chối request với HTTP status `400 Bad Request`.

- Nếu bên sử dụng API chỉ định `unknownFutureValue` làm giá trị của một thuộc tính trong request `PATCH`, bên cung cấp API phải xử lý thuộc tính đó như thể nó không có mặt (tức là giá trị hiện có không nên bị thay đổi). Trong trường hợp bên cung cấp API xử lý `PATCH` như một upsert, lệnh gọi MUST bị từ chối với HTTP status `400 Bad Request`.

- Nếu bên sử dụng API chỉ định một thành viên enum lớn hơn `unknownFutureValue` trong bất kỳ request nào mà không chỉ định header `Prefer: include-unknown-enum-members`, bên cung cấp API phải từ chối request với HTTP status `400 Bad Request`.

- Để biết chi tiết về cách giá trị `unknownFutureValue` được xử lý trong mệnh đề `$filter`, hãy tham khảo các ví dụ sau:

  - **CSDL**
    
    ```xml
        <EntityType Name="example">
            <Property Name="enumProperty" Type="exampleEnum"/>
        </EntityType>
        
        <EnumType Name="exampleEnum">
            <Member Name="default" Value="0"/>
            <Member Name="one" Value="1"/>
            <Member Name="unknownFutureValue" Value="2"/>
            <Member Name="newValue" Value="3"/>
        </EnumType>
    ```
    
  - **Hành vi của filter**
    
    | Mệnh đề `$filter` | `Prefer: include-unknown-enum-members` không có | `Prefer: include-unknown-enum-members` có |
    |---|---|---|
    | `enumProperty eq unknownFutureValue`| Trả về các entity mà enumProperty có bất kỳ giá trị nào lớn hơn `unknownFutureValue`, thay giá trị thực bằng `unknownFutureValue`| Không trả về gì |
    | `enumProperty gt unknownFutureValue`| Trả về các entity mà enumProperty có bất kỳ giá trị nào lớn hơn `unknownFutureValue`, thay giá trị thực bằng `unknownFutureValue` | Trả về các entity mà enumProperty có bất kỳ giá trị nào lớn hơn `unknownFutureValue` |
    | `enumProperty lt unknownFutureValue`| Trả về các entity mà enumProperty có bất kỳ giá trị đã biết nào (tức là nhỏ hơn `unknownFutureValue`) | Trả về các entity mà enumProperty có bất kỳ giá trị nào nhỏ hơn `unknownFutureValue`|
    | `enumProperty eq newValue` | `400 Bad Request` | Trả về các entity mà enumProperty có giá trị `newValue` |
    | `enumProperty gt newValue` | `400 Bad Request` | Trả về các entity mà enumProperty có giá trị lớn hơn `newValue` |
    | `enumProperty lt newValue` | `400 Bad Request` | Trả về các entity mà enumProperty có giá trị nhỏ hơn `newValue` |

- Nếu một evolvable enum được đưa vào mệnh đề `$orderby`, giá trị số thực của thành viên nên được dùng để sắp xếp collection. Sau khi sắp xếp, thành viên đó nên được thay bằng `unknownFutureValue` khi không có header `Prefer: include-unknown-enum-members`.

## Ví dụ

Trong các ví dụ sau, chúng ta xét entity `managedDevice`, tham chiếu đến enum type `managedDeviceArchitecture`.

```xml
<!-- Simplified entity for example purposes -->
<EntityType Name="managedDevice" BaseType="graph.entity">
    <Property Name="displayName" Type="Edm.String" />
    <Property Name="processorArchitecture" Type="graph.managedDeviceArchitecture"/>
</EntityType>
```

Khi enum `managedDeviceArchitecture` được công bố lần đầu trên Microsoft Graph, nó được định nghĩa như sau:

```xml
<!-- Slightly modified enum for example purposes -->
<EnumType Name="managedDeviceArchitecture">
    <Member Name="unknown" Value="0"/>
    <Member Name="x86" Value="1"/>
    <Member Name="x64" Value="2"/>
    <Member Name="arm" Value="3"/>
    <Member Name="arm64" Value="4"/>
    <Member Name="unknownFutureValue" Value="5"/>
</EnumType>
```

Sau đó enum được mở rộng để thêm giá trị mới là `quantum`, dẫn đến CSDL sau:

```xml
<EnumType Name="managedDeviceArchitecture">
    <Member Name="unknown" Value="0"/>
    <Member Name="x86" Value="1"/>
    <Member Name="x64" Value="2"/>
    <Member Name="arm" Value="3"/>
    <Member Name="arm64" Value="4"/>
    <Member Name="unknownFutureValue" Value="5"/>
    <Member Name="quantum" Value="6"/>
</EnumType>
```

### Hành vi mặc định

```http
GET https://graph.microsoft.com/v1.0/deviceManagement/managedDevices?$select=displayName,processorArchitecture
```

```json
{
    "value": [
        { 
            "id": "0", 
            "displayName": "Surface Pro X", 
            "processorArchitecture" : "arm64"
        },
        { 
            "id": "1",
            "displayName": "Prototype",
            "processorArchitecture": "unknownFutureValue"
        }
        { 
            "id": "2",
            "displayName": "My Laptop", 
            "processorArchitecture": "x64"
        }
    ]
}
```

Trong trường hợp này, giá trị của thuộc tính `processorArchitecture` là `quantum`. Tuy nhiên, vì client không yêu cầu header `include-unknown-enum-members`, giá trị đã được thay bằng `unknownFutureValue`.

### Bao gồm header opt-in

```http
GET https://graph.microsoft.com/v1.0/deviceManagement/managedDevices?$select=displayName,processorArchitecture

Prefer: include-unknown-enum-members
```

```json
Preference-Applied: include-unknown-enum-members

{
    "value": [
        { 
            "displayName": "Surface Pro X", 
            "processorArchitecture" : "arm64"
        },
        { 
            "displayName": "Prototype",
            "processorArchitecture": "quantum"
        },
        { 
            "displayName": "My Laptop",
            "processorArchitecture": "x64"
        }
    ]
}
```

### Hành vi sắp xếp mặc định

```http
GET https://graph.microsoft.com/v1.0/deviceManagement/managedDevices?$select=displayName,processorArchitecture&$orderBy=processorArchitecture
```

```json
{
    "value": [
        { 
            "displayName": "Surface Pro X", 
            "processorArchitecture" : "arm64"
        },
        { 
            "displayName": "My Laptop", 
            "processorArchitecture": "x64"
        },
        { 
            "displayName": "Prototype",
            "processorArchitecture": "unknownFutureValue"
        }
    ]
}
```

### Hành vi sắp xếp với header opt-in

```http
GET https://graph.microsoft.com/v1.0/deviceManagement/managedDevices?$select=displayName,processorArchitecture

Prefer: include-unknown-enum-members
```

```json
Preference-Applied: include-unknown-enum-members

{
    "value": [
        { 
            "displayName": "Surface Pro X",
            "processorArchitecture" : "arm64"
        },
        { 
            "displayName": "My Laptop",
            "processorArchitecture": "x64"
        },
        { 
            "displayName": "Prototype", 
            "processorArchitecture": "quantum"
        }
    ]
}
```

### Hành vi lọc mặc định

```http
GET https://graph.microsoft.com/v1.0/deviceManagement/managedDevices?$select=displayName,processorArchitecture&$filter=processorArchitecture gt x64
```

```json
{
    "value": [
        { 
            "displayName": "My Laptop", 
            "processorArchitecture": "x64"
        },
        { 
            "displayName": "Prototype",
            "processorArchitecture": "unknownFutureValue"
        }
    ]
}
```

### Hành vi lọc với header opt-in

```http
GET https://graph.microsoft.com/v1.0/deviceManagement/managedDevices?$select=displayName,processorArchitecture&$filter=processorArchitecture gt x64

Prefer: include-unknown-enum-members
```

```json
Preference-Applied: include-unknown-enum-members

{
    "value": [
        { 
            "displayName": "My Laptop", 
            "processorArchitecture": "x64"
        },
        { 
            "displayName": "Prototype", 
            "processorArchitecture": "quantum"
        }
    ]
}
```

### Ví dụ PATCH

```http
PATCH https://graph.microsoft.com/v1.0/deviceManagement/managedDevices/1

{ 
    "displayName": "Secret Prototype",
    "processorArchitecture": "unknownFutureValue"
}
```

```json
{
    "id": "1",
    "displayName": "Secret Prototype",
    "processorArchitecture": "unknownFutureValue"
}
```

```http
GET https://graph.microsoft.com/v1.0/deviceManagement/managedDevices/1
Prefer: include-unknown-enum-members
```

```json
Preference-Applied: include-unknown-enum-members

{
    "id": "1",
    "displayName": "Secret Prototype",
    "processorArchitecture": "quantum"
}
```

## Ví dụ về flag enum

Trong các ví dụ sau, chúng ta xét entity `windowsUniversalAppX`, tham chiếu đến flag enum type `windowsArchitecture`.

```xml
<!-- Simplified entity for example purposes -->
<EntityType Name="windowsUniversalAppX" BaseType="graph.entity">
    <Property Name="displayName" Type="Edm.String" />
    <Property Name="applicableArchitectures" Type="graph.windowsArchitecture"/>
</EntityType>
```

Khi enum `windowsArchitecture` được công bố lần đầu trên Microsoft Graph, nó được định nghĩa như sau:

```xml
<!-- Slightly modified enum for example purposes -->
<EnumType Name="windowsArchitecture" IsFlags="true">
    <Member Name="none" Value="0"/>
    <Member Name="x86" Value="1"/>
    <Member Name="x64" Value="2"/>
    <Member Name="arm" Value="4"/>
    <Member Name="neutral" Value="8"/>
    <Member Name="unknownFutureValue" Value="16" />
</EnumType>
```

Sau đó enum được mở rộng để thêm giá trị mới là `quantum`, dẫn đến CSDL sau:

```xml
<EnumType Name="windowsArchitecture" IsFlags="true">
    <Member Name="none" Value="0"/>
    <Member Name="x86" Value="1"/>
    <Member Name="x64" Value="2"/>
    <Member Name="arm" Value="4"/>
    <Member Name="neutral" Value="8"/>
    <Member Name="unknownFutureValue" Value="16" />
    <Member Name="quantum" Value="32" />
</EnumType>
```

### Hành vi mặc định của flag enum

```http
GET https://graph.microsoft.com/v1.0/deviceAppManagement/mobileApps?$select=displayName,applicableArchitectures
```

```json
{
    "value": [
        { 
            "id": "0", 
            "displayName": "OneNote", 
            "applicableArchitectures" : "neutral"
        },
        { 
            "id": "1",
            "displayName": "Minecraft",
            "applicableArchitectures": "x86,x64,arm,unknownFutureValue"
        }
        { 
            "id": "2",
            "displayName": "Edge", 
            "applicableArchitectures": "x64,arm,unknownFutureValue"
        }
    ]
}
```

Trong trường hợp này, giá trị của thuộc tính `applicableArchitectures` bao gồm `quantum`. Tuy nhiên, vì client không yêu cầu header `include-unknown-enum-members`, giá trị đã được thay bằng `unknownFutureValue`.

### Flag enum với header opt-in

```http
GET https://graph.microsoft.com/v1.0/deviceAppManagement/mobileApps?$select=displayName,applicableArchitectures

Prefer: include-unknown-enum-members
```

```json
Preference-Applied: include-unknown-enum-members

{
    "value": [
        { 
            "id": "0", 
            "displayName": "OneNote", 
            "applicableArchitectures" : "neutral"
        },
        { 
            "id": "1",
            "displayName": "Minecraft",
            "applicableArchitectures": "x86,x64,arm,quantum"
        }
        { 
            "id": "2",
            "displayName": "Edge", 
            "applicableArchitectures": "x64,arm,quantum"
        }
    ]
}
```

### Hành vi lọc mặc định của flag enum

```http
GET https://graph.microsoft.com/v1.0/deviceAppManagement/mobileApps?$select=displayName,applicableArchitectures&$filter=applicableArchitectures has unknownFutureValue
```

```json
{
    "value": [
        { 
            "id": "1",
            "displayName": "Minecraft",
            "applicableArchitectures": "x86,x64,arm,unknownFutureValue"
        }
        { 
            "id": "2",
            "displayName": "Edge", 
            "applicableArchitectures": "x64,arm,unknownFutureValue"
        }
    ]
}
```

### Hành vi lọc của flag enum với header opt-in

```http
GET https://graph.microsoft.com/v1.0/deviceAppManagement/mobileApps?$select=displayName,applicableArchitectures&$filter=applicableArchitectures has unknownFutureValue

Prefer: include-unknown-enum-members
```

```json
Preference-Applied: include-unknown-enum-members

{
    "value": []
}
```

### Ví dụ PATCH với flag enum

```http
PATCH https://graph.microsoft.com/v1.0/deviceAppManagement/mobileApps/1

{ 
    "displayName": "Minecraft 2",
    "processorArchitecture": "unknownFutureValue"
}
```

```json
{
    "id": "1",
    "displayName": "Minecraft 2",
    "applicableArchitectures": "unknownFutureValue"
}
```

```http
GET https://graph.microsoft.com/v1.0/deviceAppManagement/mobileApps/1

Prefer: include-unknown-enum-members
```

```json
Preference-Applied: include-unknown-enum-members

{
    "id": "1",
    "displayName": "Minecraft 2",
    "applicableArchitectures": "x86,x64,arm,quantum"
}
```
