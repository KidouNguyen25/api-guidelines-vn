# Alternate key

Mẫu thiết kế API của Microsoft Graph

*Mẫu thiết kế alternate key cung cấp khả năng query một resource cụ thể, duy nhất, có thể được xác định thông qua một trong các tập thuộc tính thay thế không phải là primary key của nó.*

## Vấn đề

Các resource được cung cấp trong Microsoft Graph được xác định thông qua primary key, đảm bảo tính duy nhất trong cùng một collection resource. Tuy nhiên, thường thì chính resource đó cũng có thể được xác định duy nhất bằng một thuộc tính thay thế tiện lợi hơn, mang lại trải nghiệm tốt hơn cho nhà phát triển.

Hãy xét resource `user`: trong khi `id` là cách thông thường để lấy chi tiết resource, địa chỉ `mail` cũng là một thuộc tính duy nhất có thể dùng để xác định nó.

Có thể truy cập resource bằng tham số query `$filter`, chẳng hạn

```http
GET https://graph.microsoft.com/v1.0/users?$filter=mail eq 'bob@contoso.com'
```
Tuy nhiên, trong trường hợp này, kết quả trả về được bọc trong một mảng cần phải giải nén. Khi tính duy nhất của thuộc tính trong collection hàm ý rằng lời gọi chỉ có thể trả về không hoặc một kết quả, thì mảng này mang lại trải nghiệm chưa tối ưu cho bên gọi.

## Giải pháp

Thông thường các resource trong Graph được truy cập bằng mẫu URL đơn giản phân tách bằng dấu gạch chéo (mẫu này đôi khi được gọi là key-as-segment).

```http
https://graph.microsoft.com/v1.0/users/0 - Retrieves the employee with ID = 0.
```

Tuy nhiên, resource cũng có thể được truy cập bằng cách dùng dấu ngoặc tròn để phân tách khóa, như sau:

```http
https://graph.microsoft.com/v1.0/users(0) - Also retrieves the employee with ID = 0.
```

Việc định địa chỉ resource bằng alternate key có thể thực hiện bằng cùng quy ước kiểu dấu ngoặc tròn này, với một điểm khác biệt: alternate key MUST chỉ định tên thuộc tính khóa để xác định rõ ràng alternate key, như sau:

```http
https://graph.microsoft.com/v1.0/users(email='bob@contoso.com') Retrieves the employee with the email matching `bob@contoso.com`.
```

Tương tự như khi request một resource qua khóa chuẩn (canonical key), nếu không tìm thấy resource khớp với alternate key thì phải trả về 404.

> **Lưu ý:** Khi request một resource qua alternate key, kiểu URL đơn giản phân tách bằng dấu gạch chéo không hoạt động.

> **Lưu ý:** Không dùng alternate key nhiều thành phần (multi-part).   Phản hồi cho thấy khách hàng thấy khóa nhiều thành phần gây khó hiểu.
> Hãy tạo một thuộc tính khóa thay thế (surrogate key) tổng hợp một thành phần, hoặc quay lại dùng các phép toán logic trong mệnh đề $filter.

## Khi nào dùng mẫu thiết kế này

Dùng mẫu thiết kế này khi kiểu resource của bạn có các khóa khác ngoài khóa chuẩn của nó mà xác định duy nhất một resource.

## Ví dụ

Cùng một user được xác định qua alternate key SSN, qua khóa chuẩn (primary) ID dùng dạng dài không chuẩn với tên thuộc tính khóa được chỉ định, và qua dạng ngắn chuẩn không có tên thuộc tính khóa.

Khai báo `mail` và `ssn` là alternate key trên một entity:

```xml
<EntityType Name="user">
   <Key>
     <PropertyRef Name="id" />
   </Key>
   <Property Name="id" Type="Edm.Int32" />

   <Property Name="mail" Type="Edm.String" />
   <Property Name="ssn" Type="Edm.String" />
   <Annotation Term="OData.Community.Keys.V1.AlternateKeys">
      <Collection>
         <Record Type="OData.Community.Keys.V1.AlternateKey">
            <PropertyValue Property="Key">
               <Collection>
                  <Record Type="OData.Community.Keys.V1.PropertyRef">
                     <PropertyValue Property="Name" PropertyPath="mail" />
                  </Record>
               </Collection>
            </PropertyValue>
         </Record>
         <Record Type="OData.Community.Keys.V1.AlternateKey">
            <PropertyValue Property="Key">
               <Collection>
                  <Record Type="OData.Community.Keys.V1.PropertyRef">
                     <PropertyValue Property="Name" PropertyPath="ssn" />
                  </Record>
               </Collection>
            </PropertyValue>
         </Record>
      </Collection>
   </Annotation>
</EntityType>
```

1. Lấy một resource cụ thể qua `$filter`:

    ```http
    GET https://graph.microsoft.com/v1.0/users/?$filter=ssn eq '123-45-6789'
    ```
    
    ```json
    {
      "value": [
        {
          "givenName": "Bob",
          "jobTitle": "Retail Manager",
          "mail": "bob@contoso.com",
          "mobilePhone": "+1 425 555 0109",
          "officeLocation": "18/2111",
          "preferredLanguage": "en-US",
          "ssn": "123-45-6789",
          "surname": "Vance",
          "userPrincipalName": "bob@contoso.com",
          "id": "1a89ade6-9f59-4fea-a139-23f84e3aef66"
        }
      ]
    }
    ```

2. Lấy một resource cụ thể qua primary key hoặc qua hai alternate key:

    ```http
    GET https://graph.microsoft.com/v1.0/users/1a89ade6-9f59-4fea-a139-23f84e3aef66
    GET https://graph.microsoft.com/v1.0/users(1a89ade6-9f59-4fea-a139-23f84e3aef66)
    GET https://graph.microsoft.com/v1.0/users(ssn='123-45-6789')
    GET https://graph.microsoft.com/v1.0/users(mail='bob@contoso.com')
    ```
   
    Cả bốn đều cho cùng một response:
    
    ```json
    {
      "givenName": "Bob",
      "jobTitle": "Retail Manager",
      "mail": "bob@contoso.com",
      "mobilePhone": "+1 425 555 0109",
      "officeLocation": "18/2111",
      "preferredLanguage": "en-US",
      "ssn": "123-45-6789",
      "surname": "Vance",
      "userPrincipalName": "bob@contoso.com",
      "id": "1a89ade6-9f59-4fea-a139-23f84e3aef66"
    }
    ```

3. Request một resource với thuộc tính alternate key không được hỗ trợ:

    ```http
    GET https://graph.microsoft.com/v1.0/users(name='Bob')
    
    400 Bad Request
    {
        "error" : {
            "code" : "400",
            "message": "'name' is not a valid alternate key for the resource type 'user'."
        }
    }
    ```

4. Request một resource mà thuộc tính alternate key không tồn tại trên bất kỳ resource nào trong collection:

    ```http
    GET https://graph.microsoft.com/v1.0/users(email='unknown@contoso.com')
    
    404 Not Found
    {
        "error" : {
            "code" : "404",
            "message": "No user with the the specified 'email' could be found."
        }
    }
    ```
