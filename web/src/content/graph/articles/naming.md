# Đặt tên

## 1. Cách tiếp cận

Chính sách đặt tên nên giúp nhà phát triển khám phá chức năng mà không phải liên tục tra cứu tài liệu.
Việc dùng các mẫu thiết kế chung và quy ước chuẩn giúp nhà phát triển đoán đúng tên và ý nghĩa của các thuộc tính phổ biến.
Dịch vụ SHOULD dùng các mẫu đặt tên đầy đủ, rõ nghĩa và MUST NOT dùng từ viết tắt, ngoại trừ các từ viết tắt dạng acronym là cách diễn đạt chủ đạo trong miền nghiệp vụ mà API đại diện (ví dụ: Url).

## 2. Kiểu chữ hoa/thường

- Acronym SHOULD tuân theo quy ước kiểu chữ như các từ thông thường (ví dụ: Url).
- Mọi định danh, bao gồm namespace, entityType, entitySet, thuộc tính, action, function và giá trị enum, MUST dùng lowerCamelCase.
- HTTP header là ngoại lệ và SHOULD dùng quy ước HTTP chuẩn là Capitalized-Hyphenated-Terms.

## 3. Những tên cần tránh

Một số tên bị dùng quá nhiều trong các miền API đến mức mất hết ý nghĩa, hoặc xung đột với những cách dùng phổ biến khác trong các miền mà không thể tránh khi dùng REST API, chẳng hạn OAUTH.
Dịch vụ SHOULD NOT dùng các tên sau:

- Context
- Scope
- Resource

## 4. Tạo tên ghép

- Dịch vụ SHOULD tránh dùng các mạo từ như 'a', 'the', 'of' trừ khi cần thiết để truyền đạt ý nghĩa.
  - ví dụ: các tên như aUser, theAccount, countOfBooks SHOULD NOT được dùng, thay vào đó SHOULD ưu tiên user, account, bookCount.
- Dịch vụ SHOULD thêm kiểu vào tên thuộc tính khi việc không thêm sẽ gây mơ hồ về cách biểu diễn dữ liệu hoặc khiến dịch vụ không dùng một tên thuộc tính phổ biến.
- Khi thêm kiểu vào tên thuộc tính, dịch vụ MUST thêm kiểu ở cuối, ví dụ: createdDateTime.

## 5. Thuộc tính định danh

- Dịch vụ MUST dùng kiểu string cho các thuộc tính định danh.
- Đối với các dịch vụ OData, dịch vụ MUST dùng thuộc tính OData @id để biểu diễn định danh chuẩn (canonical) của resource.
- Dịch vụ MAY dùng thuộc tính 'id' đơn giản để biểu diễn giá trị khóa chính cục bộ hoặc cũ (legacy) của một resource.
- Dịch vụ SHOULD dùng tên của mối quan hệ kèm hậu tố 'Id' để biểu diễn khóa ngoại tới một resource khác, ví dụ: subscriptionId.
  - Nội dung của thuộc tính này SHOULD là ID chuẩn của resource được tham chiếu.

## 6. Thuộc tính ngày và giờ

- Đối với các thuộc tính cần cả ngày và giờ, dịch vụ MUST dùng hậu tố 'DateTime'.
- Đối với các thuộc tính chỉ cần thông tin ngày mà không chỉ định giờ, dịch vụ MUST dùng hậu tố 'Date', ví dụ: birthDate.
- Đối với các thuộc tính chỉ cần thông tin giờ mà không chỉ định ngày, dịch vụ MUST dùng hậu tố 'Time', ví dụ: appointmentStartTime.

## 7. Thuộc tính tên

- Đối với tên tổng thể của một resource thường được hiển thị cho người dùng, dịch vụ MUST dùng tên thuộc tính 'displayName'.
- Dịch vụ MAY dùng các thuộc tính tên phổ biến khác, ví dụ: givenName, surname, signInName.

## 8. Collection và số đếm

- Dịch vụ MUST đặt tên collection bằng danh từ số nhiều hoặc cụm danh từ số nhiều, dùng tiếng Anh đúng chuẩn.
- Dịch vụ MAY dùng tiếng Anh giản lược cho những danh từ có dạng số nhiều không phổ biến trong khẩu ngữ.
  - ví dụ: schemas MAY được dùng thay cho schemata.
- Dịch vụ MUST đặt tên cho số đếm của các resource bằng một danh từ hoặc cụm danh từ kèm hậu tố 'Count'.

## 9. Tên thuộc tính phổ biến

Khi dịch vụ có một thuộc tính mà dữ liệu khớp với các tên bên dưới, dịch vụ MUST dùng tên trong bảng này.
Bảng này sẽ mở rộng khi các dịch vụ bổ sung thêm những thuật ngữ được dùng phổ biến hơn.
Chủ sở hữu dịch vụ khi bổ sung các thuật ngữ như vậy SHOULD đề xuất bổ sung vào tài liệu này.

|                     |   |
|-------------------- | - |
 attendees            |
 body                 |
 completedDateTime    | **LƯU Ý** có thể dùng completionDateTime trong các trường hợp mốc thời gian đại diện cho một thời điểm trong tương lai |
 createdDateTime      |
 childCount           |
 children             |
 contentUrl           |
 country              |
 createdBy            |
 displayName          |
 errorUrl             |
 eTag                 |
 event                |
 expirationDateTime   |
 givenName            |
 jobTitle             |
 kind                 |
 id                   |
 lastModifiedDateTime |
 location             |
 memberOf             |
 message              |
 name                 |
 owner                |
 people               |
 person               |
 postalCode           |
 photo                |
 preferredLanguage    |
 properties           |
 signInName           |
 surname              |
 tags                 |
 userPrincipalName    |
 webUrl               |
