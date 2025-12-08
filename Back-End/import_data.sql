-- ============================================
-- IMPORT DATA CHO RAILWAY MYSQL
-- ============================================
-- Chạy file này sau khi backend đã tạo tables

-- 1. USERS (Password: 123456 cho tất cả)
INSERT INTO users (username, password, `full-name`, phone, role) VALUES
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqQb9tLGjPsZf9/nKzN3.DkyQHKGK', 'Administrator', '0123456789', 'ADMIN'),
('testuser', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqQb9tLGjPsZf9/nKzN3.DkyQHKGK', 'Test User', '0123456789', 'CUSTOMER'),
('customer1', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqQb9tLGjPsZf9/nKzN3.DkyQHKGK', 'Nguyen Van A', '0987654321', 'CUSTOMER');

-- 2. VEHICLES (8 xe)
INSERT INTO vehicles (title, vehicle_type, license_plate, daily_price, currency, status, description) VALUES
('Toyota Vios 2020', 'SEDAN', '30A-123.45', 400000, 'VND', 'AVAILABLE', 'Xe sedan pho thong, tiet kiem nhien lieu'),
('Honda CR-V 2021', 'SUV', '30G-678.90', 800000, 'VND', 'AVAILABLE', 'SUV 7 cho rong rai, phu hop gia dinh'),
('Hyundai Accent 2019', 'SEDAN', '29B-222.33', 380000, 'VND', 'AVAILABLE', 'Xe sedan gia re, tiet kiem'),
('Kia Morning 2018', 'HATCHBACK', '29A-456.78', 300000, 'VND', 'AVAILABLE', 'Xe nho gon, phu hop di lai hang ngay'),
('Ford Ranger 2022', 'PICKUP', '88C-999.11', 950000, 'VND', 'AVAILABLE', 'Xe ban tai manh me, phu hop di xa'),
('Mercedes C200 2020', 'SEDAN', '51H-111.22', 1500000, 'VND', 'AVAILABLE', 'Xe sang trong, dang cap'),
('Mazda CX-5 2022', 'SUV', '30F-333.44', 900000, 'VND', 'AVAILABLE', 'SUV the thao, thiet ke dep'),
('Yamaha Exciter 155', 'MOTORCYCLE', 'MOTO-01', 150000, 'VND', 'AVAILABLE', 'Xe may the thao, phu hop di chuyen nhanh');

-- 3. BANK QR
INSERT INTO bank_qr (bank_id, bank_name, account_number, account_name, qr_image_url, is_active) VALUES
('MB', 'MB Bank', '0354984257', 'NGUYEN TAN DAT', '/storage/image/QRcode.png', TRUE);
