# Đà Nẵng Trip — Frontend Admin

Ứng dụng quản trị cho dự án Đà Nẵng Trip, xây dựng với React + TypeScript + Vite.

---

## Tech Stack

| Thư viện | Phiên bản | Mục đích |
|---|---|---|
| [React](https://react.dev) | ^19 | UI framework |
| [React DOM](https://react.dev) | ^19 | Render React vào DOM |
| [React Router DOM](https://reactrouter.com) | ^7 | Routing, navigation |
| [Axios](https://axios-http.com) | ^1 | HTTP client, gọi API |
| [Zustand](https://zustand-demo.pmnd.rs) | ^5 | Global state management |
| [TanStack Query](https://tanstack.com/query) | ^5 | Server state, caching, async data fetching |
| [React Icons](https://react-icons.github.io/react-icons) | ^5 | Icon library |
| [Tailwind CSS](https://tailwindcss.com) | ^4 | Utility-first CSS framework |

## Dev Dependencies

| Thư viện | Mục đích |
|---|---|
| [Vite](https://vite.dev) | Build tool, dev server |
| [TypeScript](https://www.typescriptlang.org) | Type safety |
| [ESLint](https://eslint.org) | Linting |
| [PostCSS](https://postcss.org) | CSS processing |
| [Autoprefixer](https://github.com/postcss/autoprefixer) | CSS vendor prefixes |

---

## Cài đặt

1. Clone repo

```bash
git clone <repo-url>
cd <tên-thư-mục>
```

2. Cài dependencies

```bash
npm install
```

3. Tạo file môi trường

```bash
cp .env.example .env
```

4. Chạy dev server

```bash
npm run dev
```

---

## Các câu lệnh

| Lệnh | Mô tả |
|---|---|
| `npm run dev` | Chạy dev server |
| `npm run build` | Build production |
| `npm run typecheck` | Kiểm tra TypeScript (`tsc -b`) |
| `npm run preview` | Preview bản build |
| `npm run lint` | Kiểm tra lỗi ESLint |
| `npm run prepush:check` | Chạy toàn bộ kiểm tra chất lượng (Lint, Type, Build, Console) |

---

## Pre-push Quality Gate

Dự án sử dụng Husky để chặn push nếu code không đạt tiêu chuẩn. Trước khi push, hệ thống sẽ tự động chạy:

1.  **Linting**: Kiểm tra phong cách viết code.
2.  **Type Checking**: Kiểm tra lỗi TypeScript.
3.  **Production Build**: Đảm bảo dự án có thể đóng gói thành công.
4.  **Console Error Testing**: Chạy Playwright để phát hiện lỗi runtime/console trên trình duyệt.

> **Lưu ý**: Để bước `test:console` thành công, bạn cần đảm bảo app đang chạy ở `http://localhost:5173`.

Để chạy thủ công toàn bộ các bước kiểm tra:
```bash
npm run prepush:check
```

---

## Biến môi trường

Tạo file `.env` từ `.env.example`:

```bash
cp .env.example .env
```

| Biến | Mô tả |
|---|---|
| `VITE_PORT` | Port dev server (mặc định: 5173) |
| `VITE_PREVIEW_PORT` | Port preview server (mặc định: 4173) |
| `VITE_HOST` | Host dev server (`false` hoặc `0.0.0.0`) |
| `VITE_API_URL` | Base URL của backend API |
| `VITE_APP_NAME` | Tên ứng dụng |

---

## CI/CD

- CI/CD dùng GitHub Actions cho `dev` và `main`.
- Xem hướng dẫn chi tiết tại [docs/ci-cd.md](docs/ci-cd.md).
