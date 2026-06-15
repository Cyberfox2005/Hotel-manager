s-- =============================================
--  Hotel Management System — Database Schema
-- =============================================

CREATE DATABASE IF NOT EXISTS hotel_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE hotel_db;

-- ────────────────────────────────────────────
-- الغرف
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rooms (
    id     INT AUTO_INCREMENT PRIMARY KEY,
    number VARCHAR(10)  NOT NULL UNIQUE,
    type   ENUM('single','double','suite') NOT NULL,
    price  DOUBLE       NOT NULL,
    status ENUM('available','occupied','maintenance') DEFAULT 'available'
);

-- ────────────────────────────────────────────
-- العملاء
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clients (
    id        INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email     VARCHAR(100) UNIQUE,
    phone     VARCHAR(20)
);

-- ────────────────────────────────────────────
-- الحجوزات
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reservations (
    id        INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT  NOT NULL,
    room_id   INT  NOT NULL,
    check_in  DATE NOT NULL,
    check_out DATE NOT NULL,
    status    ENUM('confirmed','cancelled','checked_in','checked_out') DEFAULT 'confirmed',
    CONSTRAINT fk_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    CONSTRAINT fk_room   FOREIGN KEY (room_id)   REFERENCES rooms(id)   ON DELETE CASCADE,
    CONSTRAINT chk_dates CHECK (check_out > check_in)
);

-- ────────────────────────────────────────────
-- بيانات تجريبية
-- ────────────────────────────────────────────
INSERT INTO rooms (number, type, price, status) VALUES
  ('101', 'single',  800,  'available'),
  ('102', 'single',  800,  'occupied'),
  ('103', 'double',  1500, 'available'),
  ('104', 'double',  1500, 'available'),
  ('105', 'suite',   3000, 'maintenance'),
  ('201', 'single',  900,  'available'),
  ('202', 'double',  1600, 'occupied'),
  ('203', 'suite',   3500, 'available'),
  ('204', 'single',  850,  'available'),
  ('205', 'double',  1400, 'available');

INSERT INTO clients (full_name, email, phone) VALUES
  ('Ahmed Ben Ali',    'ahmed@email.com',   '0555-111111'),
  ('Fatima Zahra',     'fatima@email.com',  '0555-222222'),
  ('Karim Mansouri',   'karim@email.com',   '0555-333333'),
  ('Sara Boudiaf',     'sara@email.com',    '0555-444444'),
  ('Youcef Hamidi',    'youcef@email.com',  '0555-555555');

INSERT INTO reservations (client_id, room_id, check_in, check_out, status) VALUES
  (1, 2, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 3 DAY),  'checked_in'),
  (2, 7, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 5 DAY),  'confirmed'),
  (3, 3, DATE_ADD(CURDATE(), INTERVAL 2 DAY), DATE_ADD(CURDATE(), INTERVAL 7 DAY), 'confirmed'),
  (4, 4, DATE_SUB(CURDATE(), INTERVAL 2 DAY), DATE_ADD(CURDATE(), INTERVAL 1 DAY), 'checked_in'),
  (5, 6, DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 4 DAY), 'confirmed');
