-- ============================================
-- CAR RENTAL DATABASE SETUP
-- ============================================
-- Hướng dẫn: Chạy file này trong MySQL để tạo database
-- Yêu cầu: MySQL 8.0+
-- Database name: car-rental
-- ============================================

-- 1. TẠO DATABASE
CREATE DATABASE IF NOT EXISTS `car-rental` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `car-rental`;

-- ============================================
-- 2. BẢNG USERS (Người dùng)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    `full-name` VARCHAR(255) NOT NULL,
    phone VARCHAR(255),
    role ENUM('ADMIN', 'CUSTOMER', 'EMPLOYEE') NOT NULL DEFAULT 'CUSTOMER',
    
    INDEX idx_username (username),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 3. BẢNG VEHICLES (Xe)
-- ============================================
CREATE TABLE IF NOT EXISTS vehicles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    vehicle_type ENUM('SEDAN', 'SUV', 'HATCHBACK', 'COUPE', 'CONVERTIBLE', 'WAGON', 'PICKUP', 'VAN', 'MOTORCYCLE') NOT NULL,
    license_plate VARCHAR(32) NOT NULL,
    daily_price DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'VND',
    status ENUM('AVAILABLE', 'RENTED', 'MAINTENANCE', 'OUT_OF_SERVICE') NOT NULL DEFAULT 'AVAILABLE',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_status (status),
    INDEX idx_vehicle_type (vehicle_type),
    INDEX idx_license_plate (license_plate)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 4. BẢNG VEHICLE_PHOTOS (Ảnh xe)
-- ============================================
CREATE TABLE IF NOT EXISTS vehicle_photos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    vehicle_id BIGINT NOT NULL,
    url VARCHAR(512) NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    INDEX idx_vehicle_id (vehicle_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================
-- 5. BẢNG BOOKINGS (Đặt xe)
-- ============================================
CREATE TABLE IF NOT EXISTS bookings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    vehicle_id BIGINT NOT NULL,
    renter_id BIGINT NOT NULL,
    status ENUM('PENDING', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    start_at DATETIME NOT NULL,
    end_at DATETIME NOT NULL,
    daily_price_snapshot DECIMAL(10, 2) NOT NULL,
    total_amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'VND',
    notes VARCHAR(255),
    pickup_type ENUM('PICKUP', 'DELIVERY') DEFAULT 'PICKUP',
    delivery_address VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
    FOREIGN KEY (renter_id) REFERENCES users(id),
    INDEX idx_vehicle_id (vehicle_id),
    INDEX idx_renter_id (renter_id),
    INDEX idx_status (status),
    INDEX idx_start_at (start_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 6. BẢNG PAYMENTS (Thanh toán)
-- ============================================
CREATE TABLE IF NOT EXISTS payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_id BIGINT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'VND',
    method ENUM('CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'DIGITAL_WALLET', 'QR_BANK') NOT NULL,
    status ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED', 'EXPIRED') NOT NULL DEFAULT 'PENDING',
    provider VARCHAR(80),
    provider_txn_id VARCHAR(128),
    paid_at DATETIME,
    qr_content VARCHAR(500),
    transfer_content VARCHAR(100),
    expires_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (booking_id) REFERENCES bookings(id),
    INDEX idx_booking_id (booking_id),
    INDEX idx_status (status),
    INDEX idx_method (method)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 7. BẢNG BANK_QR (Thông tin QR ngân hàng)
-- ============================================
CREATE TABLE IF NOT EXISTS bank_qr (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    bank_id VARCHAR(20),
    bank_name VARCHAR(100),
    account_number VARCHAR(50),
    account_name VARCHAR(100),
    qr_image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 8. BẢNG ROLE_PERMISSIONS (Phân quyền)
-- ============================================
CREATE TABLE IF NOT EXISTS role_permissions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    role ENUM('ADMIN', 'CUSTOMER', 'EMPLOYEE') NOT NULL,
    permission ENUM('VIEW', 'CREATE', 'UPDATE', 'DELETE', 'MANAGE') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_role_permission (role, permission),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================
-- 9. DỮ LIỆU MẪU - USERS
-- ============================================
-- Password cho tất cả user: 123456 (đã mã hóa BCrypt)
-- Admin password: admin123

INSERT INTO users (username, password, `full-name`, phone, role) VALUES
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqQb9tLGjPsZf9/nKzN3.DkyQHKGK', 'Administrator', '0123456789', 'ADMIN'),
('testuser', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqQb9tLGjPsZf9/nKzN3.DkyQHKGK', 'Test User', '0123456789', 'CUSTOMER'),
('customer1', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqQb9tLGjPsZf9/nKzN3.DkyQHKGK', 'Nguyễn Văn A', '0987654321', 'CUSTOMER');

-- ============================================
-- 10. DỮ LIỆU MẪU - VEHICLES (8 xe)
-- ============================================
INSERT INTO vehicles (title, vehicle_type, license_plate, daily_price, currency, status, description) VALUES
('Toyota Vios 2020', 'SEDAN', '30A-123.45', 400000, 'VND', 'AVAILABLE', 'Xe sedan phổ thông, tiết kiệm nhiên liệu'),
('Honda CR-V 2021', 'SUV', '30G-678.90', 800000, 'VND', 'AVAILABLE', 'SUV 7 chỗ rộng rãi, phù hợp gia đình'),
('Hyundai Accent 2019', 'SEDAN', '29B-222.33', 380000, 'VND', 'AVAILABLE', 'Xe sedan giá rẻ, tiết kiệm'),
('Kia Morning 2018', 'HATCHBACK', '29A-456.78', 300000, 'VND', 'AVAILABLE', 'Xe nhỏ gọn, phù hợp đi lại hàng ngày'),
('Ford Ranger 2022', 'PICKUP', '88C-999.11', 950000, 'VND', 'AVAILABLE', 'Xe bán tải mạnh mẽ, phù hợp đi xa'),
('Mercedes C200 2020', 'SEDAN', '51H-111.22', 1500000, 'VND', 'AVAILABLE', 'Xe sang trọng, đẳng cấp'),
('Mazda CX-5 2022', 'SUV', '30F-333.44', 900000, 'VND', 'AVAILABLE', 'SUV thể thao, thiết kế đẹp'),
('Yamaha Exciter 155', 'MOTORCYCLE', 'MOTO-01', 150000, 'VND', 'AVAILABLE', 'Xe máy thể thao, phù hợp di chuyển nhanh');

-- ============================================
-- 11. DỮ LIỆU MẪU - BANK QR (Thông tin thanh toán)
-- ============================================
-- Thay đổi thông tin này theo tài khoản ngân hàng của bạn
INSERT INTO bank_qr (bank_id, bank_name, account_number, account_name, qr_image_url, is_active) VALUES
('MB', 'MB Bank', '0354984257', 'NGUYEN TAN DAT', '/storage/image/QRcode.png', TRUE);

-- ============================================
-- 12. DỮ LIỆU MẪU - ROLE PERMISSIONS
-- ============================================
-- Admin có tất cả quyền
INSERT INTO role_permissions (role, permission, is_active) VALUES
('ADMIN', 'VIEW', TRUE),
('ADMIN', 'CREATE', TRUE),
('ADMIN', 'UPDATE', TRUE),
('ADMIN', 'DELETE', TRUE),
('ADMIN', 'MANAGE', TRUE);

-- Customer chỉ có quyền xem và tạo booking
INSERT INTO role_permissions (role, permission, is_active) VALUES
('CUSTOMER', 'VIEW', TRUE),
('CUSTOMER', 'CREATE', TRUE);

-- Employee có quyền xem, tạo và cập nhật
INSERT INTO role_permissions (role, permission, is_active) VALUES
('EMPLOYEE', 'VIEW', TRUE),
('EMPLOYEE', 'CREATE', TRUE),
('EMPLOYEE', 'UPDATE', TRUE);

-- ============================================
-- HƯỚNG DẪN SỬ DỤNG
-- ============================================
-- 
-- BƯỚC 1: Tạo database
--   mysql -u root -p < database_setup.sql
--   
-- BƯỚC 2: Cấu hình Spring Boot (application.properties)
--   spring.datasource.url=jdbc:mysql://localhost:3306/car-rental
--   spring.datasource.username=root
--   spring.datasource.password=your_password
--   spring.jpa.hibernate.ddl-auto=update
--
-- BƯỚC 3: Thêm ảnh QR
--   Đặt file QRcode.png vào thư mục: Back-End/storage/image/
--
-- BƯỚC 4: Đăng nhập
--   Admin: username=admin, password=admin123
--   Customer: username=testuser, password=123456
--
-- ============================================
-- THÔNG TIN THANH TOÁN QR BANK
-- ============================================
-- Để thay đổi thông tin ngân hàng, sửa trong:
-- 1. File application.properties (bank.*)
-- 2. Bảng bank_qr trong database
-- 3. Đặt ảnh QR vào /storage/image/
-- ============================================
