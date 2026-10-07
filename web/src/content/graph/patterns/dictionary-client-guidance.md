# Dictionary types

> **Lưu ý:** Tài liệu này sẽ được chuyển vào một tài liệu hướng dẫn client tập trung trong tương lai.

*Hướng dẫn client là tập hợp thông tin bổ sung dành cho những người triển khai SDK và các ứng dụng client. Thông tin này nhằm giúp hiểu cách các hướng dẫn và khái niệm khác nhau được áp dụng trong thế giới của họ và làm rõ một số điểm chưa rõ. Luôn đọc hướng dẫn tương ứng trước để nắm được ngữ cảnh.*

Để biết thêm thông tin, xem mẫu thiết kế [Dictionary](./dictionary.md).

## Ví dụ OpenAPI

Ví dụ json-schema/OpenAPI sau đây định nghĩa một dictionary mà các giá trị của nó có kiểu **RoleSettings**.

Trong **components** thuộc **schemas**:

```json
{
  "roleSettings": {
    "type": "object",
      "properties": {
        "domain": {
          "type": "string"
        }
      }
    }
  }
}
```

```json
{
  "type": "object",
  "patternProperties": {
    ".*": {
      "$ref": "#/components/schemas/roleSettings"
    },
    "additionalProperties": false
  }
}
```

## Hỗ trợ SDK

SDK cần hỗ trợ các dictionary type để người dùng SDK có trải nghiệm phát triển tuyệt vời. Ví dụ được cung cấp cho các ngôn ngữ khác nhau. Cần cân nhắc thêm các khía cạnh khác:

- Dictionary hỗ trợ các annotation OData (các giá trị có tiền tố **@OData**); những annotation này không nên được chèn trực tiếp vào dictionary mà nên đưa vào trình quản lý thuộc tính bổ sung (additional properties manager).
- Dictionary type có thể kế thừa một dictionary type khác; sự kế thừa này phải được tôn trọng.
- Giá trị của dictionary có thể thuộc các union type; nếu ngôn ngữ đích không hỗ trợ union type, nên sinh ra một wrapper type như giải pháp tương thích ngược, với các thuộc tính cho từng kiểu của union.

### Dotnet

```CSharp
Dictionary<string, RoleSettings>
```

### Java

```Java
Map<string, RoleSettings>
```

### JavaScript/TypeScript

```TypeScript
Map<string, RoleSettings>
```

hoặc

```JavaScript
{
  [key: string]: {value: RoleSettings}
}
```

## Annotation sinh request builder

Theo mặc định, SDK không bắt buộc phải chứa một tập các request builder để chạy các request CRUD trên các entry trong dictionary. Bên sử dụng cập nhật dictionary như một tổng thể bằng cách gửi request đến entity cha.

Nếu một annotation **SupportedHttpMethod** được chỉ định cho dictionary type, nên sinh các request builder để cho phép bên sử dụng tự động cập nhật các entry.
