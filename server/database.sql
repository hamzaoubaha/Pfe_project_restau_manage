-- ======================================================
-- Restaurant Database Schema for MySQL / phpMyAdmin
-- Run this file once in phpMyAdmin to create all tables
-- ======================================================

CREATE DATABASE IF NOT EXISTS `restaurant` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `restaurant`;

-- -------------------------------------------------------
-- Table: menu_items
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS `menu_items` (
    `id`          INT AUTO_INCREMENT PRIMARY KEY,
    `name`        VARCHAR(255) NOT NULL,
    `price`       DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    `description` TEXT,
    `ingredients` JSON,           -- stored as JSON array e.g. ["tomato","cheese"]
    `imageUrl`    VARCHAR(500) DEFAULT 'https://placehold.co/400x300?text=No+Image',
    `category`    VARCHAR(100) DEFAULT 'Main',
    `available`   TINYINT(1) DEFAULT 1,
    `created_at`  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------
-- Table: orders
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS `orders` (
    `id`                INT AUTO_INCREMENT PRIMARY KEY,
    `tableNumber`       INT NOT NULL,
    `guestCount`        INT NOT NULL DEFAULT 1,
    `servingPreference` ENUM('all_together','as_ready') DEFAULT 'all_together',
    `lockedAt`          DATETIME,
    `status`            ENUM('pending','preparing','ready','completed','cancelled') DEFAULT 'pending',
    `total`             DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    `timestamp`         TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------
-- Table: order_items  (each row = one item line in an order)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS `order_items` (
    `id`        INT AUTO_INCREMENT PRIMARY KEY,
    `order_id`  INT NOT NULL,
    `name`      VARCHAR(255),
    `quantity`  INT DEFAULT 1,
    `price`     DECIMAL(10,2) DEFAULT 0.00,
    `category`  VARCHAR(100),
    CONSTRAINT `fk_order` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------
-- Table: stock_items  (Gestion de Stock / Inventory)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS `stock_items` (
    `id`           INT AUTO_INCREMENT PRIMARY KEY,
    `name`         VARCHAR(255) NOT NULL,
    `quantity`     DECIMAL(10,2) NOT NULL DEFAULT 0,
    `unit`         VARCHAR(50) DEFAULT 'kg',
    `min_quantity` DECIMAL(10,2) NOT NULL DEFAULT 1,
    `category`     VARCHAR(100) DEFAULT 'Ingrédients',
    `updated_at`   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `created_at`   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
