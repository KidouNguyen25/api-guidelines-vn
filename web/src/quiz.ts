export type QuizQuestion = { question: string; answers: string[]; correct: number; explanation: string }

// Keyed by document id. Every question and explanation restates a sentence of the original document.
export const quizzes: Record<string, QuizQuestion[]> = {
  'graph-guidelines-deprecated': [
    {
      question: 'Hai request POST gửi tới một collection với cùng một payload sẽ cho kết quả thế nào?',
      answers: ['Luôn chỉ tạo một item', 'Có thể tạo nhiều item, vì POST không idempotent', 'Luôn bị từ chối với 409 Conflict'],
      correct: 1,
      explanation: 'Tài liệu nêu rõ POST request không idempotent: hai POST với cùng payload MAY dẫn đến nhiều item được tạo trong collection.',
    },
    {
      question: 'Thêm một giá trị mới cho thuộc tính "code" của lỗi mà client hiện có nhìn thấy được thì được xem là gì?',
      answers: ['Một breaking change, cần tăng phiên bản', 'Một thay đổi bình thường, không cần làm gì', 'Chỉ là thay đổi tài liệu'],
      correct: 0,
      explanation: 'Giá trị "code" mới mà client hiện có nhìn thấy là breaking change và cần tăng phiên bản.',
    },
    {
      question: 'Các mã lỗi cụ thể hơn, không phải mọi client đều quan tâm, nên được đặt ở đâu?',
      answers: ['Trong "innererror"', 'Trong header Retry-After', 'Trong URL của request'],
      correct: 0,
      explanation: 'Các mã lỗi này SHOULD được đưa vào cặp name/value "innererror"; cách đó giúp tránh breaking change.',
    },
  ],
  'azure-considerationsforservicedesign': [
    {
      question: 'Theo tài liệu, một API tốt bắt đầu từ đâu?',
      answers: ['Từ danh sách endpoint', 'Từ trải nghiệm của nhà phát triển (Developer Experience)', 'Từ tên dịch vụ nội bộ'],
      correct: 1,
      explanation: 'Mục đầu tiên của tài liệu là "Start with the Developer Experience".',
    },
    {
      question: 'Bạn nên làm gì với các "hero scenario"?',
      answers: ['Định nghĩa chúng trước, gồm trừu tượng hóa, đặt tên, quan hệ, rồi mới mô tả API', 'Chỉ viết sau khi API đã hoàn thành', 'Bỏ qua nếu API đã có tài liệu'],
      correct: 0,
      explanation: 'DO định nghĩa hero scenario trước, gồm abstraction, naming và relationship, rồi mới định nghĩa API mô tả các thao tác cần thiết.',
    },
  ],
  'azure-guidelines': [
    {
      question: 'Khi nào một thao tác nên được triển khai như một long-running operation (LRO)?',
      answers: ['Khi percentile 99 của thời gian phản hồi lớn hơn 1 giây và client nên poll trước khi làm tiếp', 'Với mọi thao tác PATCH', 'Với mọi thao tác DELETE'],
      correct: 0,
      explanation: 'DO triển khai LRO nếu p99 lớn hơn 1 giây và client nên poll thao tác trước khi tiếp tục. DO NOT triển khai PATCH dưới dạng LRO.',
    },
    {
      question: 'Khi trả trang cuối của một collection phân trang, nextLink được xử lý thế nào?',
      answers: ['Trả nextLink với giá trị null', 'Không trả trường nextLink', 'Trả nextLink trỏ về trang đầu'],
      correct: 1,
      explanation: 'DO NOT trả trường nextLink ở trang cuối, và cũng DO NOT trả nextLink với giá trị null.',
    },
    {
      question: 'PUT với If-Match chứa ETag cũ (khác ETag mới nhất trên server) nhận mã nào?',
      answers: ['200 OK', '304 Not Modified', '412 Precondition Failed'],
      correct: 2,
      explanation: 'Giá trị If-Match không bằng ETag mới nhất nghĩa là resource đã đổi: server trả 412 Precondition Failed.',
    },
  ],
  'graph-guidelinesgraph': [
    {
      question: 'Segment version trong URL của Microsoft Graph có thể nhận giá trị nào?',
      answers: ['v1.0 hoặc beta', 'Bất kỳ ngày nào dạng YYYY-MM-DD', 'Chỉ v2'],
      correct: 0,
      explanation: 'Tài liệu nêu: version có thể là v1.0 hoặc beta.',
    },
    {
      question: 'Ba mẫu thường dùng nhất để mô hình hóa nhiều biến thể của một khái niệm trong Microsoft Graph là gì?',
      answers: ['Type hierarchy, facets và flat bag of properties', 'Singleton, alias và sentinel', 'Delta, upsert và namespace'],
      correct: 0,
      explanation: 'Ba mẫu được dùng nhiều nhất hiện nay là type hierarchy, facets và flat bag of properties.',
    },
    {
      question: 'Tên kiểu (type) không phải enum nên dùng danh từ số ít hay số nhiều?',
      answers: ['Số ít, ví dụ address', 'Số nhiều, ví dụ addresses', 'Tùy ý'],
      correct: 0,
      explanation: 'MUST dùng danh từ số ít cho tên kiểu không phải enum (Đúng: address; Sai: addresses).',
    },
  ],
}
