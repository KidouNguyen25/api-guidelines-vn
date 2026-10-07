// Every figure illustrates one passage of the source documents; `after` is the heading
// (GitHub slug of the English heading) whose section the figure closes.

export type SequenceStep =
  | { type: 'message'; from: number; to: number; label: string; sub?: string; tone?: 'error'; caption: string }
  | { type: 'note'; actor: number; label: string; caption: string }

export type BoxNode = { id: string; step: number; x: number; y: number; w: number; h: number; title: string; lines?: string[] }
export type BoxEdge = { from: string; to: string; label?: string; dashed?: boolean }

export type FigureSpec = {
  doc: string
  after: string
  title: string
  source: string
  body:
    | { kind: 'sequence'; actors: string[]; steps: SequenceStep[] }
    | { kind: 'boxes'; width: number; height: number; nodes: BoxNode[]; edges: BoxEdge[]; captions: string[] }
    | { kind: 'url'; parts: Array<{ text: string; name: string; caption: string }> }
}

export const figures: FigureSpec[] = [
  {
    doc: 'azure-guidelines',
    after: 'long-running-operations--jobs',
    title: 'Vòng đời một long-running operation (LRO)',
    source: 'Mẫu tạo hoặc thay thế resource; với POST action, phản hồi đầu tiên là 202 Accepted',
    body: {
      kind: 'sequence',
      actors: ['Client', 'Service'],
      steps: [
        { type: 'message', from: 0, to: 1, label: 'PUT /resource?api-version=…', sub: 'operation-id (tùy chọn)', caption: 'Client khởi tạo thao tác. Service kiểm tra đầu vào sớm nhất có thể để báo lỗi ngay.' },
        { type: 'message', from: 1, to: 0, label: '201 Created', sub: 'operation-id · operation-location', caption: 'Service trả resource cùng URL tuyệt đối của status monitor trong header operation-location.' },
        { type: 'message', from: 0, to: 1, label: 'GET <operation-location>', caption: 'Client — hoặc một client khác — poll status monitor.' },
        { type: 'message', from: 1, to: 0, label: '200 OK · status: Running', sub: 'retry-after: <giây>', caption: 'Thao tác chưa kết thúc: response có header retry-after cho biết cần đợi bao lâu.' },
        { type: 'note', actor: 0, label: 'đợi retry-after', caption: 'Client đợi đúng số giây trong retry-after rồi poll lại.' },
        { type: 'message', from: 0, to: 1, label: 'GET <operation-location>', caption: 'Poll lần tiếp theo.' },
        { type: 'message', from: 1, to: 0, label: '200 OK · status: Succeeded', caption: 'Trạng thái kết thúc (Succeeded, Failed hoặc Canceled). Status monitor được giữ ít nhất 24 giờ sau khi hoàn tất.' },
      ],
    },
  },
  {
    doc: 'azure-guidelines',
    after: 'conditional-requests',
    title: 'Cập nhật có điều kiện với ETag',
    source: 'Bảng xử lý precondition cho PUT / PATCH',
    body: {
      kind: 'sequence',
      actors: ['Client', 'Service'],
      steps: [
        { type: 'message', from: 0, to: 1, label: 'GET /resource', caption: 'Client đọc resource.' },
        { type: 'message', from: 1, to: 0, label: '200 OK', sub: 'ETag: <etag>', caption: 'Service trả ETag cùng resource.' },
        { type: 'message', from: 0, to: 1, label: 'PUT /resource', sub: 'If-Match: <etag>', caption: 'Client cập nhật, kèm ETag đã nhận trong If-Match.' },
        { type: 'message', from: 1, to: 0, label: '200 OK', sub: 'ETag: <etag mới>', caption: 'If-Match bằng ETag mới nhất trên server: cập nhật thành công và response MUST có ETag mới.' },
        { type: 'note', actor: 1, label: 'resource bị đổi bởi bên khác', caption: 'Giả sử resource thay đổi sau lần cập nhật đó.' },
        { type: 'message', from: 0, to: 1, label: 'PUT /resource', sub: 'If-Match: <etag cũ>', caption: 'Client gửi lại với ETag cũ.' },
        { type: 'message', from: 1, to: 0, label: '412 Precondition Failed', tone: 'error', caption: 'If-Match khác ETag mới nhất: server từ chối, tránh ghi đè thay đổi của bên khác.' },
      ],
    },
  },
  {
    doc: 'azure-guidelines',
    after: 'handling-errors',
    title: 'Cấu trúc body lỗi',
    source: 'ErrorResponse, ErrorDetail và InnerError',
    body: {
      kind: 'boxes',
      width: 720,
      height: 330,
      captions: [
        'ErrorResponse chỉ có một thuộc tính bắt buộc: error.',
        'ErrorDetail: code và message là bắt buộc; target, details, innererror và thuộc tính bổ sung là tùy chọn.',
        'InnerError cho thông tin cụ thể hơn và có thể lồng tiếp một innererror khác.',
        'code ở cấp cao nhất MUST giống giá trị của header x-ms-error-code.',
      ],
      nodes: [
        { id: 'resp', step: 0, x: 245, y: 16, w: 230, h: 62, title: 'ErrorResponse', lines: ['error: ErrorDetail'] },
        { id: 'detail', step: 1, x: 245, y: 120, w: 230, h: 190, title: 'ErrorDetail', lines: ['code', 'message', 'target', 'details: ErrorDetail[]', 'innererror: InnerError', '… thuộc tính bổ sung'] },
        { id: 'inner', step: 2, x: 495, y: 200, w: 215, h: 90, title: 'InnerError', lines: ['code', 'innererror: InnerError'] },
        { id: 'header', step: 3, x: 10, y: 120, w: 170, h: 62, title: 'Response header', lines: ['x-ms-error-code'] },
      ],
      edges: [
        { from: 'resp', to: 'detail' },
        { from: 'detail', to: 'inner' },
        { from: 'header', to: 'detail', label: '=', dashed: true },
      ],
    },
  },
  {
    doc: 'azure-guidelines',
    after: 'collections',
    title: 'Phân trang bằng nextLink',
    source: 'Collections: response là object có mảng value và nextLink',
    body: {
      kind: 'sequence',
      actors: ['Client', 'Service'],
      steps: [
        { type: 'message', from: 0, to: 1, label: 'GET <collection-url>', caption: 'Client yêu cầu danh sách resource.' },
        { type: 'message', from: 1, to: 0, label: '200 OK', sub: '{ value: […], nextLink }', caption: 'Response là object có mảng value; nextLink là URL tuyệt đối của trang kế tiếp, đã gồm các query parameter cần thiết như api-version.' },
        { type: 'message', from: 0, to: 1, label: 'GET <nextLink>', caption: 'Client gọi đúng URL trong nextLink.' },
        { type: 'message', from: 1, to: 0, label: '200 OK', sub: '{ value: […], nextLink }', caption: 'Còn trang tiếp theo nên vẫn có nextLink.' },
        { type: 'message', from: 0, to: 1, label: 'GET <nextLink>', caption: 'Client gọi tiếp.' },
        { type: 'message', from: 1, to: 0, label: '200 OK', sub: '{ value: […] }', caption: 'Trang cuối: không trả nextLink, kể cả giá trị null.' },
      ],
    },
  },
  {
    doc: 'graph-guidelinesgraph',
    after: 'uniform-resource-locators-urls',
    title: 'Các thành phần của URL trong Microsoft Graph',
    source: '{scheme}://{host}/{version}/{category}/[{pathSegment}][?{query}]',
    body: {
      kind: 'url',
      parts: [
        { text: '{scheme}://{host}', name: 'scheme, host', caption: 'Luôn là https://graph.microsoft.com.' },
        { text: '/{version}', name: 'version', caption: 'v1.0 hoặc beta.' },
        { text: '/{category}', name: 'category', caption: 'Nhóm logic ở cấp cao nhất của API, ví dụ /users, /groups hoặc /me.' },
        { text: '/[{pathSegment}]', name: 'pathSegment', caption: 'Một hoặc nhiều segment điều hướng, địa chỉ hóa entity, collection, thuộc tính hoặc thao tác của entity.' },
        { text: '[?{query}]', name: 'query', caption: 'Chuỗi query MUST theo chuẩn OData.' },
      ],
    },
  },
  {
    doc: 'graph-guidelinesgraph',
    after: 'resource-modeling-patterns',
    title: 'Ba cách mô hình hóa biến thể của một khái niệm',
    source: 'Type hierarchy, facets và flat bag of properties',
    body: {
      kind: 'boxes',
      width: 720,
      height: 250,
      captions: [
        'Type hierarchy: một kiểu cơ sở abstract với vài thuộc tính chung, mỗi biến thể là một subtype.',
        'Facets: một entity type có thuộc tính chung và mỗi biến thể là một facet (complex type). Facet chỉ có giá trị khi đối tượng thuộc biến thể đó.',
        'Flat bag: một entity type chứa mọi thuộc tính có thể có, cộng một thuộc tính (thường là type) để phân biệt biến thể.',
      ],
      nodes: [
        { id: 'h-base', step: 0, x: 10, y: 20, w: 220, h: 74, title: 'Type hierarchy', lines: ['kiểu cơ sở (abstract)'] },
        { id: 'h-a', step: 0, x: 20, y: 170, w: 100, h: 56, title: 'Subtype A' },
        { id: 'h-b', step: 0, x: 130, y: 170, w: 100, h: 56, title: 'Subtype B' },
        { id: 'f-main', step: 1, x: 250, y: 20, w: 220, h: 74, title: 'Facets', lines: ['thuộc tính chung'] },
        { id: 'f-a', step: 1, x: 258, y: 170, w: 100, h: 56, title: 'facet A' },
        { id: 'f-b', step: 1, x: 366, y: 170, w: 100, h: 56, title: 'facet B' },
        { id: 'b-main', step: 2, x: 490, y: 20, w: 220, h: 150, title: 'Flat bag', lines: ['type: biến thể', 'thuộc tính của A', 'thuộc tính của B', 'thuộc tính của C'] },
      ],
      edges: [
        { from: 'h-base', to: 'h-a' },
        { from: 'h-base', to: 'h-b' },
        { from: 'f-main', to: 'f-a' },
        { from: 'f-main', to: 'f-b' },
      ],
    },
  },
  {
    doc: 'graph-patterns-change-tracking',
    after: 'solution',
    title: 'Chuỗi request của delta (change tracking)',
    source: 'Bốn bước của mẫu change tracking',
    body: {
      kind: 'sequence',
      actors: ['Client', 'Service'],
      steps: [
        { type: 'message', from: 0, to: 1, label: 'GET …/delta', caption: 'Bước 1: trang đầu tiên của trạng thái hiện tại.' },
        { type: 'message', from: 1, to: 0, label: '200 OK', sub: '@odata.nextLink', caption: 'Còn trang chưa trả: response có @odata.nextLink.' },
        { type: 'message', from: 0, to: 1, label: 'GET @odata.nextLink', caption: 'Bước 2 (tùy chọn): lấy tiếp các trang còn lại.' },
        { type: 'message', from: 1, to: 0, label: '200 OK', sub: '@odata.deltaLink', caption: 'Hết trang: response trả @odata.deltaLink thay cho nextLink.' },
        { type: 'note', actor: 0, label: 'một thời gian sau', caption: 'Client lưu deltaLink (URL opaque) cho lần đồng bộ sau.' },
        { type: 'message', from: 0, to: 1, label: 'GET @odata.deltaLink', caption: 'Bước 3: hỏi xem có thay đổi mới không.' },
        { type: 'message', from: 1, to: 0, label: '200 OK', sub: 'các thay đổi (rỗng nếu không có)', caption: 'Bước 4 (tùy chọn): nếu thay đổi nhiều, tiếp tục theo @odata.nextLink.' },
      ],
    },
  },
  {
    doc: 'graph-articles-deprecation',
    after: 'deprecation-guidelines',
    title: 'Header Deprecation và Sunset',
    source: 'Gateway thêm header khi request tham chiếu phần tử đã deprecated',
    body: {
      kind: 'sequence',
      actors: ['Client', 'Gateway'],
      steps: [
        { type: 'message', from: 0, to: 1, label: 'Request', sub: 'URL tham chiếu phần tử đã deprecated', caption: 'Phần tử được đánh dấu bằng annotation Revisions (Date, Version, Kind, Description, RemovalDate).' },
        { type: 'message', from: 1, to: 0, label: 'Response', sub: 'Deprecation · Sunset', caption: 'Gateway thêm header Deprecation (ngày đánh dấu deprecated) và Sunset (hai năm sau ngày deprecated).' },
      ],
    },
  },
]

export const figuresFor = (docId: string) => figures.filter((figure) => figure.doc === docId)
