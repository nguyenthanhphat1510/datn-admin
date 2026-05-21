# Admin App — Flow & Cấu trúc

Tài liệu này giải thích **file nào được gọi**, **chạy theo thứ tự nào**, và **làm sao để giao diện hiện ra**. Đọc theo thứ tự sẽ hiểu trọn bộ flow.

---

## 0. Cây thư mục — Bản đồ tổng quan

```
admin/
├── .env.local                  ← biến môi trường (NEXT_PUBLIC_API_URL)
├── package.json                ← script `dev` chạy port 3002
└── src/
    ├── middleware.ts           ← chạy TRƯỚC mọi request (đang trống)
    ├── app/                    ← Next.js App Router
    │   ├── layout.tsx          ← layout gốc — wrap toàn app
    │   ├── page.tsx            ← route `/` — redirect đi /products
    │   ├── globals.css         ← Tailwind + animations + brand color
    │   └── products/
    │       └── page.tsx        ← route `/products`
    ├── components/             ← React components, chia theo feature
    │   ├── layout/
    │   │   ├── DashboardShell.tsx  ← khung dashboard (sidebar + topbar + main)
    │   │   ├── Sidebar.tsx          ← sidebar trái
    │   │   └── Topbar.tsx           ← topbar phải
    │   └── products/
    │       ├── ProductsPage.tsx     ← bảng list + filter + toolbar
    │       ├── ProductFormModal.tsx ← modal thêm/sửa
    │       └── ImageUploader.tsx    ← widget upload ảnh
    ├── contexts/
    │   └── AuthContext.tsx     ← Provider trả mock user role='admin'
    ├── lib/
    │   ├── api.ts              ← axios instance, baseURL
    │   └── products-api.ts     ← wrap 9 endpoint products
    └── types/
        └── product.ts          ← TypeScript types
```

---

## 1. Khi gõ `npm run dev` chuyện gì xảy ra?

**File:** `admin/package.json`
```json
"dev": "next dev -p 3002"
```

→ Next.js dev server (Turbopack) chạy ở `http://localhost:3002`. Đọc `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```
Biến `NEXT_PUBLIC_*` được inline vào client bundle, dùng được ở browser.

---

## 2. Khi mở `http://localhost:3002/` — Flow request

```
Browser
   │ GET /
   ▼
┌──────────────────────┐
│ middleware.ts        │  ← chạy TRƯỚC mọi request, trả NextResponse.next() (cho qua)
└──────────────────────┘
   │
   ▼
┌──────────────────────┐
│ app/layout.tsx       │  ← layout gốc, wrap <html><body>...
└──────────────────────┘
   │ render children
   ▼
┌──────────────────────┐
│ app/page.tsx         │  ← redirect("/products") → trả HTTP 307
└──────────────────────┘
   │
   ▼
Browser nhận 307 → tự GET /products
   │
   ▼
┌──────────────────────┐
│ app/layout.tsx       │  ← layout gốc (lại được wrap)
└──────────────────────┘
   │
   ▼
┌──────────────────────┐
│ app/products/page.tsx│  ← render <DashboardShell><ProductsPage/></DashboardShell>
└──────────────────────┘
```

### Chi tiết từng file

#### `src/middleware.ts`
```ts
export function middleware() {
  // TODO: check JWT khi cô yêu cầu phân quyền
  return NextResponse.next();
}
export const config = { matcher: ['/((?!_next|favicon.ico|api).*)'] };
```
- **Khi nào chạy:** Mọi request trừ `/_next/*`, `/favicon.ico`, `/api/*`.
- **Hiện tại:** Cho qua hết — không check gì.
- **Sau này:** Đọc cookie token, redirect `/login` nếu chưa đăng nhập.

#### `src/app/layout.tsx`
```tsx
export default function RootLayout({ children }) {
  return (
    <html lang="vi" className="... h-full antialiased">
      <body className="min-h-full flex flex-col bg-white text-gray-900">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
```
- **Khi nào chạy:** Mỗi request đến bất kỳ route nào trong `app/`.
- **Làm gì:**
  - Wrap toàn bộ app trong `<AuthProvider>` → mọi component bên trong gọi `useAuth()` được.
  - Load Geist font.
  - Set `<title>DATN Admin</title>`.

#### `src/app/page.tsx`
```tsx
import { redirect } from 'next/navigation';
export default function Home() {
  redirect('/products');
}
```
- **Khi nào chạy:** Khi GET `/`.
- **Làm gì:** Trả về `307 Temporary Redirect` → browser tự đi tiếp `/products`.

#### `src/app/products/page.tsx`
```tsx
import DashboardShell from '@/components/layout/DashboardShell';
import ProductsPage from '@/components/products/ProductsPage';

export default function Page() {
  return (
    <DashboardShell>
      <ProductsPage />
    </DashboardShell>
  );
}
```
- **Khi nào chạy:** Khi GET `/products`.
- **Làm gì:** Render `<DashboardShell>` (sidebar + topbar) + nội dung `<ProductsPage>`.
- Đây là **Server Component** (không có `'use client'`) — render trên server, gửi HTML xuống browser.

---

## 3. DashboardShell — Khung trang

**File:** `src/components/layout/DashboardShell.tsx`

```tsx
export default function DashboardShell({ children }) {
  return (
    <div className="relative flex min-h-screen w-full">
      {/* Background pattern */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-emerald-50/30 via-white to-white" />
      <div className="absolute inset-0 -z-10 opacity-[0.03] bg-[radial-gradient(...)]" />

      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 px-6 py-6">{children}</main>
      </div>
    </div>
  );
}
```

**Layout grid 2 cột:**
```
┌─────────┬──────────────────────────┐
│         │  Topbar (h-14)           │
│ Sidebar ├──────────────────────────┤
│  w-64   │                          │
│         │   <main>                 │
│         │     {children}           │
│         │     (= ProductsPage)     │
│         │   </main>                │
│         │                          │
└─────────┴──────────────────────────┘
```

**Background pattern:**
- Layer 1 (`-z-10`): gradient mỏng từ `emerald-50/30` xuống trắng.
- Layer 2 (`-z-10`): dot pattern xanh, opacity 3% — cảm giác "có texture" mà không gây rối.

---

## 4. Sidebar — Menu trái

**File:** `src/components/layout/Sidebar.tsx`

**'use client'** — dùng `usePathname()` để biết route active.

### Cấu trúc visual
```
┌─────────────────────┐
│ 🌿 DATN Admin       │  ← logo header (gradient xanh #007e42 → #0a9d52)
│ VẬT TƯ NÔNG NGHIỆP  │
├─────────────────────┤
│  📦 Sản phẩm    ✓   │  ← active item (xanh, có border + shadow)
│  👥 Người dùng SOON │  ← disabled
│  🛒 Đơn hàng   SOON │  ← disabled
│  📋 Danh mục   SOON │  ← disabled
├─────────────────────┤
│ V0.1 · MVP          │
└─────────────────────┘
```

### Logic phân biệt active/disabled

```tsx
const pathname = usePathname();        // vd "/products"
const active = pathname.startsWith(item.href);

if (item.disabled) {
  // Render <div> grey, có chip "SOON"
} else {
  // Render <Link>, active thì border xanh + bg emerald-50
}
```

### Icons inline SVG (không lucide-react)

Tui copy phong cách frontend — viết SVG inline thay vì cài lib:
```tsx
function IPackage() {
  return <svg width="18" height="18" ...>...</svg>;
}
```
Lợi: bundle nhỏ hơn, đồng nhất với frontend.

---

## 5. Topbar — Thanh trên

**File:** `src/components/layout/Topbar.tsx`

```tsx
const { user } = useAuth();   // gọi context → mock user
```

### Visual
```
┌─────────────────────────────────────────────────────┐
│ 🟢 ĐANG CHẠY CHẾ ĐỘ DEMO    🔔  [A] Admin    🚪    │
│                                  admin              │
└─────────────────────────────────────────────────────┘
```

- **Bên trái:** Pill chip với dot `animate-pulse` (đỏ rằng đang demo).
- **Bên phải:**
  - Bell icon (disabled).
  - Avatar gradient (chữ cái đầu tên user — lấy từ `user.name[0]` = "A").
  - Logout icon (disabled).

`useAuth()` trả về `MOCK_ADMIN` từ `AuthContext`:
```ts
const MOCK_ADMIN = { id: 'mock-admin', name: 'Admin', email: 'admin@datn.local', role: 'admin' };
```

---

## 6. ProductsPage — Logic chính

**File:** `src/components/products/ProductsPage.tsx` (502 dòng — phức tạp nhất)

**'use client'** — cần state, useEffect, event handlers.

### State

```ts
const [products, setProducts] = useState<Product[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [search, setSearch] = useState('');
const [category, setCategory] = useState<ProductCategory | ''>('');
const [modalOpen, setModalOpen] = useState(false);
const [editing, setEditing] = useState<Product | null>(null);
```

### Vòng đời lúc mount

```
ProductsPage mount
   │
   ▼
useEffect chạy
   │
   ▼
setTimeout(fetchData, 300)   ← debounce 300ms để search không spam
   │
   ▼ (sau 300ms)
fetchData()
   │
   │ setLoading(true)
   ▼
listProducts({ search, category, limit: 100 })
   │
   ▼
GET http://localhost:3000/api/products?limit=100
   │
   ▼
setProducts(result.data)
setLoading(false)
   │
   ▼
React re-render với data → bảng hiện ra
```

### Khi user gõ search

```
user gõ "phân"
   │ onChange={(e) => setSearch(e.target.value)}
   ▼
setSearch("phân")
   │
   ▼ React re-render
   │
   ▼ useEffect detect dependency `search` thay đổi
   │
   ▼ clearTimeout(id cũ) + setTimeout(fetchData, 300)
   │
   ▼ (sau 300ms im lặng)
fetchData() với search mới
```
→ Debounce 300ms để gõ nhanh không gọi API mỗi ký tự.

### Khi click "Thêm sản phẩm"

```ts
const openCreate = () => {
  setEditing(null);          ← null = mode create
  setModalOpen(true);
};
```
→ React render `<ProductFormModal product={null} onClose={...} onSaved={...} />`.

### Khi click "Sửa" trên 1 row

```ts
const openEdit = (p: Product) => {
  setEditing(p);             ← truyền product hiện tại = mode edit
  setModalOpen(true);
};
```

### Khi click "Xóa"

```ts
const handleSoftDelete = async (p) => {
  if (!confirm(`Ẩn sản phẩm "${p.name}"?`)) return;
  await softDeleteProduct(p._id);   ← DELETE /products/:id
  fetchData();                       ← refresh list
};
```

### Visual phân bố

```
┌────────────────────────────────────────────────┐
│ 🟢 QUẢN LÝ SẢN PHẨM                            │
│ Danh sách sản phẩm  [+ Thêm sản phẩm]          │
│ Thêm, sửa, xóa và quản lý ảnh...               │
├────────────────────────────────────────────────┤
│ ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│ │  Tổng    │ │  Hiện    │ │  Ẩn      │         │  ← StatCard
│ │   5      │ │   3      │ │   2      │         │
│ └──────────┘ └──────────┘ └──────────┘         │
├────────────────────────────────────────────────┤
│ 🔍 [Tìm sản phẩm...]   [Tất cả danh mục ▼]    │  ← Toolbar
├────────────────────────────────────────────────┤
│ Ảnh │ Sản phẩm     │ DM    │ Giá   │ … │ ⚙️    │
│ 🖼  │ Phân NPK     │ 🟢    │ 250k  │   │ ✏️🗑 │
│ 🖼  │ Thuốc trừ sâu│ 🟢    │ 80k   │   │ ✏️🗑 │
└────────────────────────────────────────────────┘
```

---

## 7. ProductFormModal — Form thêm/sửa

**File:** `src/components/products/ProductFormModal.tsx`

### Khi mở (modalOpen=true), nhận props
```ts
<ProductFormModal
  product={editing}      ← null nếu create, Product nếu edit
  onClose={...}
  onSaved={...}
/>
```

### Form với react-hook-form + zod

```ts
const productSchema = z.object({
  name: z.string().min(1, 'Tên không được trống').max(200),
  price: z.number().min(0),
  stock: z.number().int().min(0),
  category: z.enum(['thuoc_bvtv', 'phan_bon', 'giong', 'cong_cu', 'khac']),
  // ... optional fields
});

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(productSchema),
  defaultValues: product ? { ...product } : { name: '', price: 0, ... },
});
```

- `register('name')` → gắn input vào form state, tự động track value + validate.
- `handleSubmit(onSubmit)` → khi submit, validate xong mới gọi `onSubmit(values)`.
- `errors.name?.message` → hiển thị lỗi inline đỏ.

### Flow submit khi CREATE (không có ảnh)

```
User bấm "Tạo mới"
   │
   ▼
handleSubmit chạy zod validation
   │
   ▼ (pass)
onSubmit(values)
   │
   ▼
createProduct(values)
   │
   ▼
POST /api/products with JSON
   │
   ▼ nhận response { _id, ... }
savedId = created._id
   │
   ▼ pendingFiles.length === 0 → skip upload
   │
   ▼
onSaved()  ← gọi callback parent
   │
   ▼ parent (ProductsPage):
   │   - setModalOpen(false)
   │   - fetchData() refresh list
   │
   ▼ Modal đóng, list cập nhật
```

### Flow submit khi CREATE (có ảnh)

```
User chọn ảnh → pendingFiles = [File1, File2]
User bấm "Tạo mới"
   │
   ▼ onSubmit:
createProduct(values)  → savedId = new ID
   │
   ▼
uploadProductImages(savedId, pendingFiles)
   │
   ▼
POST /api/products/:id/images (multipart FormData)
   │
   ▼ Backend upload Cloudinary, trả product có images[]
   │
   ▼
onSaved() → refresh list (thấy thumbnail Cloudinary)
```

### Flow submit khi EDIT

Như create nhưng dùng `updateProduct(id, values)` (PATCH) và ảnh đã được handle real-time trong `<ImageUploader>` (không phải pending).

---

## 8. ImageUploader — Widget ảnh

**File:** `src/components/products/ImageUploader.tsx`

### 2 chế độ hoạt động dựa vào `productId`

#### Mode CREATE (productId undefined)
```
User pick file
   │
   ▼ validate (mime, size)
   │
   ▼ onPendingFilesChange([...pendingFiles, ...newFiles])
   │
   ▼ files trữ trong state PARENT (ProductFormModal)
   │   chưa upload Cloudinary
   ▼
Preview hiển thị bằng URL.createObjectURL(file)
   │
   ▼ Khi submit form → mới upload (xem mục 7)
```

#### Mode EDIT (có productId)
```
User pick file
   │
   ▼ validate
   │
   ▼ uploadProductImages(productId, files)
   │
   ▼ POST /api/products/:id/images NGAY LẬP TỨC
   │
   ▼ onExistingChanged()  ← gọi onSaved của parent
   │
   ▼ ProductsPage.fetchData() → list refresh
   │   → modal nhận product mới qua re-render
   │
   ▼ Thumb hiển thị URL Cloudinary
```

### Khi xóa 1 ảnh hiện có

```
User click ✕ trên thumb
   │
   ▼ confirm()
   │
   ▼ deleteProductImage(productId, publicId)
   │
   ▼ DELETE /api/products/:id/images?publicId=...
   │
   ▼ Backend: gọi cloudinary.destroy(publicId) + xóa khỏi DB
   │
   ▼ onExistingChanged() → refresh
```

### Visual

```
┌───┐ ┌───┐ ┌───┐
│img│ │img│ │img│   ← thumbs Cloudinary (label "CLOUDINARY" xanh)
└───┘ └───┘ └───┘
┌───┐                ← thumb pending (label "CHỜ UPLOAD" cam)
│img│
└───┘
┌───┐
│ + │                ← button thêm ảnh (dashed border xanh)
│   │
└───┘
```

---

## 9. AuthContext — Mock authentication

**File:** `src/contexts/AuthContext.tsx`

```ts
const MOCK_ADMIN: AuthUser = {
  id: 'mock-admin',
  name: 'Admin',
  email: 'admin@datn.local',
  role: 'admin',
};

export function AuthProvider({ children }) {
  const value = {
    user: MOCK_ADMIN,
    isLoading: false,
    login: async () => { /* TODO */ },
    logout: () => { /* TODO */ },
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
```

**Hiện tại:** trả mock user cứng → Topbar luôn hiện "Admin".

**Sau này:** Replace `MOCK_ADMIN` bằng:
- Đọc token từ `localStorage` hoặc cookie.
- Decode JWT → set user thật.
- Gọi `POST /auth/login` trong `login()`.

---

## 10. Tầng API — axios

### `src/lib/api.ts` — axios instance
```ts
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api',
});

// TODO: interceptor gắn JWT
```

### `src/lib/products-api.ts` — wrap 9 endpoint
```ts
export async function listProducts(params) {
  const { data } = await api.get('/products', { params });
  return data;
}

export async function createProduct(dto) {
  const { data } = await api.post('/products', dto);
  return data;
}

export async function uploadProductImages(id, files) {
  const formData = new FormData();
  files.forEach((f) => formData.append('files', f));
  const { data } = await api.post(`/products/${id}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}
// ... +6 hàm khác
```

**Tại sao tách `lib/products-api.ts` riêng?**
- Tách concern: UI component chỉ care "gọi `createProduct(dto)`", không care endpoint URL hay axios config.
- Đổi backend URL? Chỉ sửa `lib/api.ts`.
- Test dễ: mock `products-api.ts` thay vì mock axios global.

---

## 11. Tầng Types — TypeScript

**File:** `src/types/product.ts`

```ts
export type ProductCategory = 'thuoc_bvtv' | 'phan_bon' | 'giong' | 'cong_cu' | 'khac';

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  thuoc_bvtv: 'Thuốc BVTV',
  phan_bon: 'Phân bón',
  // ...
};

export interface Product {
  _id: string;
  name: string;
  price: number;
  images: { url: string; publicId: string }[];
  isActive: boolean;
  // ...
}

export interface CreateProductDto { /* ... */ }
export type UpdateProductDto = Partial<CreateProductDto>;
```

Types **khớp với backend entity** ở `backend/src/products/entities/product.entity.ts`. Khi backend đổi schema, sửa file này → toàn admin được type-check lại tự động.

---

## 12. Tổng kết flow theo timeline

```
[T+0ms]   User mở browser → http://localhost:3002
[T+5ms]   middleware.ts cho qua
[T+10ms]  app/page.tsx → redirect /products
[T+15ms]  middleware.ts cho qua
[T+20ms]  app/products/page.tsx render <DashboardShell><ProductsPage/>
[T+30ms]  Server gửi HTML xuống browser (có sẵn layout, sidebar, topbar)
[T+50ms]  Browser nhận HTML, paint giao diện skeleton "Đang tải..."
[T+100ms] React hydrate → ProductsPage thành interactive
[T+105ms] useEffect chạy → setTimeout(fetchData, 300)
[T+405ms] fetchData() → GET /api/products?limit=100
[T+450ms] Nhận data → setProducts(...)
[T+455ms] Re-render bảng với data thật
```

---

## 13. Style — Tại sao trông như vậy?

### Brand colors
- Primary: `#007e42` (xanh lá nông nghiệp) — định nghĩa trong `globals.css` (`--brand`).
- Hover: `#0a9d52`.
- Accent: `#84cc16` (vàng-xanh) — dùng cho gradient text "sản phẩm".

### Pattern lặp lại từ frontend
1. **Pill chip với dot pulse:**
   ```tsx
   <div className="inline-flex items-center gap-2 rounded-full border border-[#007e42]/20 bg-emerald-50 px-3 py-1">
     <span className="h-1.5 w-1.5 rounded-full bg-[#007e42] animate-pulse" />
     <span className="text-[10px] font-bold uppercase tracking-widest text-[#007e42]">Label</span>
   </div>
   ```
2. **Gradient header:**
   ```tsx
   <div style={{ background: 'linear-gradient(135deg, #007e42 0%, #0a9d52 100%)' }}>
   ```
3. **Card:** `rounded-xl border border-gray-100 bg-white shadow-sm`.
4. **Animation:** `animate-fade-in-up` với `animationDelay: i * 30ms` cho từng row.
5. **Background pattern:** dot radial mỏng (3% opacity) trên gradient từ emerald → trắng.

### Tailwind v4 — globals.css
```css
@import "tailwindcss";

:root {
  --brand: #007e42;
  --brand-hover: #0a9d52;
}

@keyframes fadeInUp { ... }
.animate-fade-in-up { animation: fadeInUp 0.35s ... forwards; }
```

---

## 14. Khi bật phân quyền sau này — sửa ở đâu?

| File | Sửa gì |
|------|--------|
| `backend/src/products/products.controller.ts` | Xóa `@Public()`, bật lại `@Roles(UserRole.ADMIN)` (mỗi endpoint có `// TODO:` đánh dấu) |
| `admin/src/contexts/AuthContext.tsx` | Replace `MOCK_ADMIN`, implement `login()` gọi `/auth/login`, lưu token |
| `admin/src/lib/api.ts` | Bỏ comment interceptor — gắn `Authorization: Bearer ${token}` |
| `admin/src/middleware.ts` | Bỏ comment check JWT từ cookie, redirect `/login` nếu thiếu |
| `admin/src/app/login/` | Tạo mới — form đăng nhập |

→ Không cần refactor cấu trúc, chỉ điền code vào TODO.

---

## Tóm lại 1 câu mỗi file

| File | Vai trò |
|------|---------|
| `package.json` | Script `dev` chạy port 3002 |
| `.env.local` | URL backend `http://localhost:3000/api` |
| `middleware.ts` | Hiện cho qua, sau check JWT |
| `app/layout.tsx` | Wrap `<AuthProvider>` toàn app |
| `app/page.tsx` | Redirect `/` → `/products` |
| `app/products/page.tsx` | Render shell + page |
| `app/globals.css` | Tailwind + animations + brand color |
| `components/layout/DashboardShell.tsx` | Khung dashboard 2 cột |
| `components/layout/Sidebar.tsx` | Menu trái với 4 item |
| `components/layout/Topbar.tsx` | Topbar phải với avatar mock |
| `components/products/ProductsPage.tsx` | Bảng list + filter + handlers |
| `components/products/ProductFormModal.tsx` | Modal form react-hook-form + zod |
| `components/products/ImageUploader.tsx` | Widget upload/preview/xóa ảnh |
| `contexts/AuthContext.tsx` | Provider mock user |
| `lib/api.ts` | axios instance |
| `lib/products-api.ts` | 9 hàm wrap endpoint |
| `types/product.ts` | TypeScript types khớp backend |
