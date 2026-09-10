-- =============================================================
-- 模块二 食-餐饮美食 完整数据库脚本（建库 + 建表 + 种子数据）
-- 说明：本脚本是「食」模块的完全自包含脚本，可在全新 MySQL 上独立运行。
--   包含：食模块 8 张业务表 + 支撑登录/订单/购物车/支付/消息的公共表 + 种子数据。
-- 用法：mysql -uroot -p < food.sql   （会先建 wudong 库并 USE）
-- 注意：本脚本面向全新环境；对已存在同名表不会覆盖，但种子数据重复执行会因主键冲突报错。
-- 图片位于 server/uploads/seeds/ 下。
-- =============================================================

CREATE DATABASE IF NOT EXISTS wudong DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE wudong;
SET NAMES utf8mb4;

-- =============================================================
-- 一、食模块业务表
-- =============================================================

CREATE TABLE IF NOT EXISTS t_restaurant (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name          VARCHAR(100) NOT NULL,
  merchant_id   BIGINT UNSIGNED NOT NULL,
  address       VARCHAR(255) NOT NULL,
  longitude     DECIMAL(10,6) DEFAULT NULL COMMENT '经度',
  latitude      DECIMAL(10,6) DEFAULT NULL COMMENT '纬度',
  open_time     VARCHAR(50)  DEFAULT '11:00-21:00' COMMENT '营业时间',
  capacity      INT          NOT NULL DEFAULT 50 COMMENT '容纳人数',
  main_image    VARCHAR(255) DEFAULT '',
  intro         TEXT         COMMENT '餐厅介绍',
  rating        DECIMAL(2,1) NOT NULL DEFAULT 5.0,
  avg_price     DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '人均价格',
  status        TINYINT      NOT NULL DEFAULT 1,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_merchant (merchant_id)
) ENGINE=InnoDB COMMENT='餐厅';

CREATE TABLE IF NOT EXISTS t_dish (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  restaurant_id BIGINT UNSIGNED NOT NULL,
  name          VARCHAR(100) NOT NULL,
  price         DECIMAL(10,2) NOT NULL,
  main_image    VARCHAR(255) DEFAULT '',
  intro         VARCHAR(500) DEFAULT '',
  is_signature  TINYINT      NOT NULL DEFAULT 0 COMMENT '1招牌菜',
  status        TINYINT      NOT NULL DEFAULT 1,
  PRIMARY KEY (id),
  KEY idx_restaurant (restaurant_id)
) ENGINE=InnoDB COMMENT='餐厅菜品';

CREATE TABLE IF NOT EXISTS t_meal_slot (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  restaurant_id BIGINT UNSIGNED NOT NULL,
  slot_name     VARCHAR(50)  NOT NULL COMMENT '如 午餐 11:30-13:30',
  max_booking   INT          NOT NULL DEFAULT 20 COMMENT '最大预订数',
  status        TINYINT      NOT NULL DEFAULT 1,
  PRIMARY KEY (id),
  KEY idx_restaurant (restaurant_id)
) ENGINE=InnoDB COMMENT='餐位时段';

CREATE TABLE IF NOT EXISTS t_meal_quota (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  restaurant_id BIGINT UNSIGNED NOT NULL,
  slot_id       BIGINT UNSIGNED NOT NULL,
  booking_date  DATE         NOT NULL,
  booked        INT          NOT NULL DEFAULT 0 COMMENT '已订桌数',
  PRIMARY KEY (id),
  UNIQUE KEY uk_rest_slot_date (restaurant_id, slot_id, booking_date)
) ENGINE=InnoDB COMMENT='餐位预订余量';

CREATE TABLE IF NOT EXISTS t_farm_category (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name          VARCHAR(50)  NOT NULL,
  icon          VARCHAR(255) DEFAULT '',
  sort          INT          NOT NULL DEFAULT 0,
  PRIMARY KEY (id)
) ENGINE=InnoDB COMMENT='农产品分类';

CREATE TABLE IF NOT EXISTS t_farm_product (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  category_id   BIGINT UNSIGNED NOT NULL,
  merchant_id   BIGINT UNSIGNED NOT NULL,
  name          VARCHAR(200) NOT NULL,
  price         DECIMAL(10,2) NOT NULL,
  spec          VARCHAR(100) DEFAULT '' COMMENT '规格',
  stock         INT          NOT NULL DEFAULT 0,
  sales         INT          NOT NULL DEFAULT 0,
  main_image    VARCHAR(255) DEFAULT '',
  origin        VARCHAR(100) DEFAULT '' COMMENT '产地（溯源）',
  shelf_life    VARCHAR(50)  DEFAULT '' COMMENT '保质期',
  detail        MEDIUMTEXT   COMMENT '详情',
  freight       DECIMAL(10,2) NOT NULL DEFAULT 0,
  status        TINYINT      NOT NULL DEFAULT 1,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_category (category_id)
) ENGINE=InnoDB COMMENT='农产品商品';

-- 食模块新增：评价（餐厅/农产品）
CREATE TABLE IF NOT EXISTS t_food_review (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id       BIGINT UNSIGNED NOT NULL,
  biz_type      VARCHAR(20)  NOT NULL COMMENT 'restaurant/farm_product',
  biz_id        BIGINT UNSIGNED NOT NULL,
  rating        TINYINT      NOT NULL DEFAULT 5 COMMENT '评分 1-5',
  content       VARCHAR(1000) NOT NULL DEFAULT '',
  images        TEXT         COMMENT '评价图片(JSON数组)',
  merchant_reply VARCHAR(1000) NOT NULL DEFAULT '',
  is_hidden     TINYINT      NOT NULL DEFAULT 0,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_review_biz (biz_type, biz_id),
  KEY idx_review_user (user_id)
) ENGINE=InnoDB COMMENT='食模块-评价';

-- 食模块新增：收藏（餐厅/农产品）
CREATE TABLE IF NOT EXISTS t_food_favorite (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id       BIGINT UNSIGNED NOT NULL,
  biz_type      VARCHAR(20)  NOT NULL COMMENT 'restaurant/farm_product',
  biz_id        BIGINT UNSIGNED NOT NULL,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_user_biz (user_id, biz_type, biz_id),
  KEY idx_biz (biz_type, biz_id)
) ENGINE=InnoDB COMMENT='食模块-收藏';

-- =============================================================
-- 二、公共支撑表（登录 / 订单 / 购物车 / 支付 / 消息 / 记账）
-- =============================================================

CREATE TABLE IF NOT EXISTS t_user (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  phone         VARCHAR(20)  NOT NULL COMMENT '手机号',
  password      VARCHAR(100) NOT NULL COMMENT 'bcrypt 密码',
  nickname      VARCHAR(50)  DEFAULT '' COMMENT '昵称',
  avatar        VARCHAR(255) DEFAULT '' COMMENT '头像 URL',
  gender        TINYINT      DEFAULT 0 COMMENT '0未知 1男 2女',
  region        VARCHAR(100) DEFAULT '' COMMENT '地区',
  bio           VARCHAR(500) DEFAULT '' COMMENT '个人简介',
  role          VARCHAR(20)  NOT NULL DEFAULT 'user' COMMENT 'user/merchant/admin',
  status        TINYINT      NOT NULL DEFAULT 1 COMMENT '1正常 0封禁',
  ban_until     DATETIME     DEFAULT NULL COMMENT '禁言截止时间',
  last_login_at DATETIME     DEFAULT NULL COMMENT '最后登录时间',
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_phone (phone)
) ENGINE=InnoDB COMMENT='用户';

CREATE TABLE IF NOT EXISTS t_merchant (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id       BIGINT UNSIGNED NOT NULL COMMENT '关联用户账号',
  shop_name     VARCHAR(100) NOT NULL COMMENT '店铺名',
  module_type   VARCHAR(20)  NOT NULL COMMENT '所属模块 clothing/food/hotel/travel',
  contact       VARCHAR(50)  DEFAULT '' COMMENT '联系人',
  contact_phone VARCHAR(20)  DEFAULT '' COMMENT '联系方式',
  license_no    VARCHAR(50)  DEFAULT '' COMMENT '营业执照号',
  id_card       VARCHAR(30)  DEFAULT '' COMMENT '法人身份证（脱敏存储）',
  materials     TEXT         COMMENT '资质材料图片 JSON',
  status        TINYINT      NOT NULL DEFAULT 1 COMMENT '1正常 0下线',
  settle_status TINYINT      NOT NULL DEFAULT 0 COMMENT '0未结算 1已结算',
  join_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '入驻时间',
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_user (user_id),
  KEY idx_module (module_type)
) ENGINE=InnoDB COMMENT='商家';

CREATE TABLE IF NOT EXISTS t_order (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_no      VARCHAR(32)  NOT NULL COMMENT '订单号',
  user_id       BIGINT UNSIGNED NOT NULL,
  merchant_id   BIGINT UNSIGNED DEFAULT NULL COMMENT '商家ID（有则关联）',
  order_type    VARCHAR(20)  NOT NULL COMMENT 'goods/meal/hotel/ticket/route',
  status        TINYINT      NOT NULL DEFAULT 0 COMMENT '0待支付 1已支付待确认 2已确认 3进行中 4已完成 5已取消 6退款中 7已退款',
  total_amount  DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '订单总额',
  pay_amount    DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '实付金额',
  pay_time      DATETIME     DEFAULT NULL COMMENT '支付时间',
  cancel_reason VARCHAR(255) DEFAULT '' COMMENT '取消原因',
  remark        VARCHAR(255) DEFAULT '' COMMENT '买家备注',
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_order_no (order_no),
  KEY idx_user (user_id),
  KEY idx_type_status (order_type, status)
) ENGINE=InnoDB COMMENT='统一订单';

CREATE TABLE IF NOT EXISTS t_order_item (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_id      BIGINT UNSIGNED NOT NULL,
  sku_id        BIGINT UNSIGNED DEFAULT NULL COMMENT '模块一 SKU',
  farm_product_id BIGINT UNSIGNED DEFAULT NULL COMMENT '模块二 农产品',
  title         VARCHAR(200) NOT NULL COMMENT '商品快照标题',
  spec_name     VARCHAR(100) DEFAULT '' COMMENT '规格快照',
  image         VARCHAR(255) DEFAULT '' COMMENT '图片快照',
  price         DECIMAL(10,2) NOT NULL COMMENT '成交单价',
  quantity      INT          NOT NULL DEFAULT 1,
  shipping_status TINYINT    NOT NULL DEFAULT 0 COMMENT '0待发货 1已发货 2已收货',
  logistics_no  VARCHAR(50)  DEFAULT '' COMMENT '物流单号',
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_order (order_id)
) ENGINE=InnoDB COMMENT='商品订单明细';

CREATE TABLE IF NOT EXISTS t_meal_booking (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_id      BIGINT UNSIGNED NOT NULL,
  restaurant_id BIGINT UNSIGNED NOT NULL,
  slot_id       BIGINT UNSIGNED NOT NULL COMMENT '时段',
  booking_date  DATE         NOT NULL COMMENT '预订日期',
  guest_count   INT          NOT NULL COMMENT '人数',
  contact_name  VARCHAR(50)  NOT NULL,
  contact_phone VARCHAR(20)  NOT NULL,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_order (order_id),
  KEY idx_rest_date (restaurant_id, booking_date)
) ENGINE=InnoDB COMMENT='餐位预订扩展';

CREATE TABLE IF NOT EXISTS t_hotel_booking (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_id      BIGINT UNSIGNED NOT NULL,
  homestay_id   BIGINT UNSIGNED NOT NULL,
  room_type_id  BIGINT UNSIGNED NOT NULL,
  check_in_date DATE         NOT NULL,
  check_out_date DATE        NOT NULL,
  guest_name    VARCHAR(50)  NOT NULL COMMENT '入住人',
  guest_id_card VARCHAR(30)  NOT NULL COMMENT '入住人身份证',
  guest_phone   VARCHAR(20)  NOT NULL,
  nights        INT          NOT NULL COMMENT '晚数',
  checkin_code  VARCHAR(12)  NOT NULL COMMENT '入住码',
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_order (order_id),
  KEY idx_room_date (room_type_id, check_in_date)
) ENGINE=InnoDB COMMENT='住宿预订扩展';

CREATE TABLE IF NOT EXISTS t_ticket_order (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_id      BIGINT UNSIGNED NOT NULL,
  biz_type      VARCHAR(20)  NOT NULL COMMENT 'ticket门票/route路线',
  biz_id        BIGINT UNSIGNED NOT NULL COMMENT '票种ID或路线ID',
  use_date      DATE         NOT NULL COMMENT '使用/出发日期',
  quantity      INT          NOT NULL COMMENT '数量',
  visitors      TEXT         COMMENT '游客信息 JSON',
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_order (order_id)
) ENGINE=InnoDB COMMENT='票务订单扩展';

CREATE TABLE IF NOT EXISTS t_pay_record (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  pay_no        VARCHAR(32)  NOT NULL COMMENT '支付流水号',
  order_id      BIGINT UNSIGNED NOT NULL,
  user_id       BIGINT UNSIGNED NOT NULL,
  amount        DECIMAL(10,2) NOT NULL,
  channel       VARCHAR(20)  NOT NULL DEFAULT 'mock_wxpay' COMMENT '支付渠道',
  status        TINYINT      NOT NULL DEFAULT 0 COMMENT '0待支付 1成功 2失败',
  paid_at       DATETIME     DEFAULT NULL,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_pay_no (pay_no),
  KEY idx_order (order_id)
) ENGINE=InnoDB COMMENT='支付记录';

CREATE TABLE IF NOT EXISTS t_refund_record (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  refund_no     VARCHAR(32)  NOT NULL,
  order_id      BIGINT UNSIGNED NOT NULL,
  user_id       BIGINT UNSIGNED NOT NULL,
  amount        DECIMAL(10,2) NOT NULL,
  reason        VARCHAR(255) DEFAULT '',
  status        TINYINT      NOT NULL DEFAULT 0 COMMENT '0申请中 1已退款 2已驳回',
  handle_note   VARCHAR(255) DEFAULT '',
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_refund_no (refund_no),
  KEY idx_order (order_id)
) ENGINE=InnoDB COMMENT='退款记录';

CREATE TABLE IF NOT EXISTS t_cart_item (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id       BIGINT UNSIGNED NOT NULL,
  sku_id        BIGINT UNSIGNED DEFAULT NULL COMMENT '模块一 SKU',
  farm_product_id BIGINT UNSIGNED DEFAULT NULL COMMENT '模块二 农产品',
  quantity      INT          NOT NULL DEFAULT 1,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_user (user_id)
) ENGINE=InnoDB COMMENT='统一购物车';

CREATE TABLE IF NOT EXISTS t_eticket (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_id      BIGINT UNSIGNED NOT NULL,
  ticket_order_id BIGINT UNSIGNED NOT NULL COMMENT '票务订单扩展ID',
  code          VARCHAR(32)  NOT NULL COMMENT '电子票号/二维码内容',
  biz_type      VARCHAR(20)  NOT NULL COMMENT 'ticket/route',
  biz_id        BIGINT UNSIGNED NOT NULL,
  use_date      DATE         NOT NULL,
  visitor_name  VARCHAR(50)  DEFAULT '' COMMENT '游客姓名',
  status        TINYINT      NOT NULL DEFAULT 0 COMMENT '0未使用 1已使用 2已退款',
  verify_at     DATETIME     DEFAULT NULL COMMENT '核销时间',
  verify_by     BIGINT UNSIGNED DEFAULT NULL COMMENT '核销人',
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_code (code),
  KEY idx_order (order_id)
) ENGINE=InnoDB COMMENT='电子票';

CREATE TABLE IF NOT EXISTS t_message (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id       BIGINT UNSIGNED NOT NULL COMMENT '接收用户',
  msg_type      VARCHAR(20)  NOT NULL COMMENT 'system系统/order订单/interact互动',
  title         VARCHAR(200) NOT NULL,
  content       VARCHAR(1000) DEFAULT '',
  is_read       TINYINT      NOT NULL DEFAULT 0,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_user (user_id)
) ENGINE=InnoDB COMMENT='站内消息';

CREATE TABLE IF NOT EXISTS t_system_config (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  config_key    VARCHAR(50)  NOT NULL,
  config_value  VARCHAR(500) NOT NULL,
  remark        VARCHAR(200) DEFAULT '',
  PRIMARY KEY (id),
  UNIQUE KEY uk_key (config_key)
) ENGINE=InnoDB COMMENT='系统配置';

CREATE TABLE IF NOT EXISTS t_finance_record (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_id      BIGINT UNSIGNED NOT NULL,
  merchant_id   BIGINT UNSIGNED NOT NULL,
  order_amount  DECIMAL(10,2) NOT NULL COMMENT '订单金额',
  commission_rate DECIMAL(5,4) NOT NULL DEFAULT 0.05 COMMENT '平台抽佣比例',
  commission    DECIMAL(10,2) NOT NULL COMMENT '平台抽佣',
  merchant_income DECIMAL(10,2) NOT NULL COMMENT '商家收入',
  settle_status TINYINT      NOT NULL DEFAULT 0 COMMENT '0未结算 1已结算',
  settle_no     VARCHAR(32)  DEFAULT '' COMMENT '结算单号',
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_merchant (merchant_id)
) ENGINE=InnoDB COMMENT='财务记录';

-- =============================================================
-- 三、种子数据
-- =============================================================

-- 用户（管理员 / 普通用户 / 食商家）
INSERT INTO t_user (id, phone, password, nickname, role, status) VALUES
(1, '13800000000', '$2b$10$i8tOPcgEyYimRX6BgIeZg.B99u13t5lD2Osk93axr031ooweeTmFG', '平台管理员', 'admin', 1),
(2, '13800000001', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '苗岭行者', 'user', 1),
(3, '13800000003', '$2b$10$gcpzzo5BlxnVTUNGgvAWe.lHS6GFOiA/8IAmbXlMihiUN9pS9zbmW', '长桌宴商家', 'merchant', 1);

-- 商家（食商家，自增 id=1，对应餐厅/农产品的 merchant_id=1）
INSERT INTO t_merchant (user_id, shop_name, module_type, contact, contact_phone, license_no, status) VALUES
(3, '乌东长桌宴', 'food', '阿朵姐', '13800000003', '91522601MA0002', 1);

-- 系统配置（支付成功记账所需抽佣比例）
INSERT INTO t_system_config (config_key, config_value, remark) VALUES
('commission_goods', '0.05', '实物商品平台抽佣比例'),
('commission_service', '0.10', '服务类（餐位等）抽佣比例');

-- 农产品分类
INSERT INTO t_farm_category (id, name, icon, sort) VALUES
(1, '茶叶', '/uploads/seeds/cat-tea.jpg', 1),
(2, '腊肉', '/uploads/seeds/cat-bacon.png', 2),
(3, '米酒', '/uploads/seeds/cat-wine.jpg', 3),
(4, '酸食', '/uploads/seeds/cat-sour.jpg', 4),
(5, '其他', '/uploads/seeds/cat-other.jpg', 5);

-- 农产品商品
INSERT INTO t_farm_product (id, category_id, merchant_id, name, price, spec, stock, sales, main_image, origin, shelf_life, detail, freight, status) VALUES
(1, 1, 1, '乌东云雾毛尖', 128.00, '250g/罐', 200, 320, '/uploads/seeds/farm-tea.jpg', '乌东村云雾山茶园', '24个月', '<p>云雾山茶园海拔 1200 米，明前采摘一芽一叶，手工炒制。</p>', 8, 1),
(2, 2, 1, '苗家土法烟熏腊肉', 88.00, '500g/袋', 150, 240, '/uploads/seeds/farm-bacon.png', '乌东村农户散养黑毛猪', '真空 6 个月', '<p>柴火烟熏 30 天，肥瘦相间，蒸炒皆宜。</p>', 10, 1),
(3, 3, 1, '苗家糯米甜酒酿', 38.00, '750g/坛', 300, 410, '/uploads/seeds/farm-wine.jpg', '乌东村酿酒作坊', '冷藏 3 个月', '<p>糯米蒸制发酵，甜糯酒香，可煮汤圆、冲蛋花。</p>', 10, 1),
(4, 4, 1, '酸汤鱼底料（红酸）', 25.00, '300g/袋', 500, 560, '/uploads/seeds/farm-sour.jpg', '乌东村辣椒基地', '12个月', '<p>以山地小番茄自然发酵的红酸汤，酸香浓郁。</p>', 8, 1);

-- 餐厅
INSERT INTO t_restaurant (id, name, merchant_id, address, longitude, latitude, open_time, capacity, main_image, intro, rating, avg_price) VALUES
(1, '乌东长桌宴', 1, '乌东村中心广场旁', 108.123456, 26.456789, '10:30-21:30', 200, '/uploads/seeds/restaurant-1.jpg', '苗家长桌宴是乌东村待客的最高礼仪。百人长桌一字排开，酸汤鱼、鼓藏肉、糯米饭依次上桌，席间苗家阿妹唱起敬酒歌，游客可体验"高山流水"敬酒仪式。', 4.8, 80.00),
(2, '梯田味道农家菜', 1, '乌东村梯田观景台下方', 108.124500, 26.455800, '10:00-20:30', 80, '/uploads/seeds/restaurant-2.jpg', '坐拥梯田景观的农家小馆，食材取自自家菜园与稻田，主打腊肉合蒸、稻花鱼。', 4.6, 50.00);

-- 菜品
INSERT INTO t_dish (restaurant_id, name, price, main_image, intro, is_signature) VALUES
(1, '酸汤鱼（稻田鱼）', 98.00, '/uploads/seeds/dish-1.jpg', '乌东稻田鱼配山地小番茄发酵红酸汤，酸香开胃', 1),
(1, '鼓藏肉', 68.00, '/uploads/seeds/dish-2.jpg', '苗族祭祖节庆菜，大块猪肉白煮蘸辣水', 1),
(1, '糯米饭配腊肉', 38.00, '/uploads/seeds/dish-3.jpg', '五彩糯米饭搭配土法烟熏腊肉', 0),
(1, '米酒汤圆', 22.00, '/uploads/seeds/dish-4.jpg', '糯米甜酒酿煮汤圆，暖胃甜品', 0),
(2, '腊肉合蒸', 58.00, '/uploads/seeds/dish-5.jpg', '腊肉、腊肠、土豆片合蒸', 1),
(2, '酸辣稻花鱼', 78.00, '/uploads/seeds/dish-6.jpg', '稻田现捞稻花鱼，酸辣做法', 0);

-- 餐位时段
INSERT INTO t_meal_slot (restaurant_id, slot_name, max_booking) VALUES
(1, '午餐 11:30-13:30', 30),
(1, '晚餐 17:30-20:00', 30),
(2, '午餐 11:00-13:00', 15),
(2, '晚餐 17:00-19:30', 15);
