# Car Rental – Tổng quan dự án

Dự án gồm 3 phần: Back-End (Spring Boot), Dash-Board (React + Vite) và Front-End Mobile (Expo React Native). Tất cả cùng dùng chung API `http://localhost:8080` theo mặc định.

## Cấu trúc thư mục
- `Back-End/`: Spring Boot REST API (MySQL, JWT).
- `Dash-Board/`: Trang quản trị trên web.
- `Front-End/sample-app/`: Ứng dụng mobile Expo cho khách hàng.
- `storage/image/`: Ảnh mẫu và mã QR ngân hàng.

## Yêu cầu chung
- Node.js 18+ (cho Dash-Board & Mobile).
- Java 21 + Maven, MySQL 8+ (cho Back-End).
- Đã tạo database `car-rental` và cấu hình user trong `application.properties`.

## Back-End (Spring Boot)
1. Cài phụ thuộc và chạy:
   ```bash
   cd Back-End
   ./mvnw spring-boot:run   # hoặc mvnw.cmd trên Windows
   ```
2. Cấu hình chính: `src/main/resources/application.properties`
   - DB: `spring.datasource.url=jdbc:mysql://localhost:3306/car-rental`
   - JWT: `jwt.secret`, `jwt.expiration`
   - Base URL ảnh: `app.base-url=http://localhost:8080`
3. API khởi chạy tại `http://localhost:8080`.

## Dash-Board (Vite React)
1. ```bash
   cd Dash-Board
   npm install
   npm run dev
   ```
2. Mặc định gọi API: `http://localhost:8080/api` (sửa trong `src/services/api.ts` nếu cần).
3. Mở trình duyệt tại URL Vite hiển thị (thường `http://localhost:5173`).

## Front-End Mobile (Expo)
1. ```bash
   cd Front-End/sample-app
   npm install
   npm run dev    # hoặc npm run android / ios / web
   ```
2. API base URL:
   - Ưu tiên `EXPO_PUBLIC_API_URL` (đặt khi build EAS / chạy local).
   - Nếu không, Android emulator dùng `http://10.0.2.2:8080`, iOS simulator dùng `http://localhost:8080`.
3. App dùng AsyncStorage để gắn token cho mọi request (`src/api/axiosInstance.ts`).

## Tính năng chính
- Xác thực JWT, phân quyền ADMIN / EMPLOYEE / CUSTOMER.
- Quản lý xe: tạo/sửa/xóa/xem, tải ảnh.
- Quy trình đặt xe: tạo, xác nhận, kích hoạt, hoàn thành, hủy.
- Thanh toán qua mã QR ngân hàng (cấu hình trong `application.properties`).
- Dashboard web quản trị; ứng dụng mobile cho khách thuê.

## Tải xuống
- Liên kết tải về: [Google Drive](https://drive.google.com/file/d/1MpN36T5yTjNvhg0nIUSgylQlZ4oJMaC3/view?usp=sharing)
- Demo Dashboard: [car-rental-ypcm.vercel.app](https://car-rental-ypcm.vercel.app)

## Ghi chú triển khai
- Cập nhật thông tin DB & `app.base-url` cho môi trường production.
- Kiểm tra quyền CORS nếu frontend và backend chạy khác domain/port.
- Đặt biến môi trường `EXPO_PUBLIC_API_URL` khi build mobile để trỏ về API đúng.

