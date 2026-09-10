-- 住模块（民宿预订）建表语句，原样摘自 sql/01-ddl.sql（原行号见各段注释）

-- ============ t_hotel_booking（原文件第 179 行起）============
CREATE TABLE t_hotel_booking (
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

-- 门票/路线订单（ticket/route 类扩展）

-- ============ t_homestay（原文件第 454 行起）============
CREATE TABLE t_homestay (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name          VARCHAR(100) NOT NULL,
  merchant_id   BIGINT UNSIGNED NOT NULL,
  address       VARCHAR(255) NOT NULL,
  longitude     DECIMAL(10,6) DEFAULT NULL,
  latitude      DECIMAL(10,6) DEFAULT NULL,
  style_tags    VARCHAR(255) DEFAULT '' COMMENT '风格标签，逗号分隔（木楼/吊脚楼）',
  facility_tags VARCHAR(255) DEFAULT '' COMMENT '设施标签（WiFi/空调/独立卫浴）',
  main_image    VARCHAR(255) DEFAULT '',
  intro         TEXT,
  rating        DECIMAL(2,1) NOT NULL DEFAULT 5.0,
  check_in_time VARCHAR(20)  DEFAULT '14:00' COMMENT '入住时间',
  check_out_time VARCHAR(20) DEFAULT '12:00' COMMENT '离店时间',
  pet_policy    TINYINT      NOT NULL DEFAULT 0 COMMENT '1允许宠物',
  has_breakfast TINYINT      NOT NULL DEFAULT 1 COMMENT '1含早',
  deposit       DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '押金',
  status        TINYINT      NOT NULL DEFAULT 1,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_merchant (merchant_id)
) ENGINE=InnoDB COMMENT='民宿';


-- ============ t_room_type（原文件第 478 行起）============
CREATE TABLE t_room_type (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  homestay_id   BIGINT UNSIGNED NOT NULL,
  name          VARCHAR(100) NOT NULL COMMENT '如 苗族木屋大床房',
  bed_type      VARCHAR(50)  DEFAULT '' COMMENT '床型',
  area          DECIMAL(6,1) DEFAULT NULL COMMENT '面积㎡',
  capacity      INT          NOT NULL DEFAULT 2 COMMENT '容纳人数',
  facilities    VARCHAR(255) DEFAULT '',
  price         DECIMAL(10,2) NOT NULL COMMENT '基础价',
  stock         INT          NOT NULL DEFAULT 1 COMMENT '库存（同日期可售间数）',
  main_image    VARCHAR(255) DEFAULT '',
  status        TINYINT      NOT NULL DEFAULT 1,
  PRIMARY KEY (id),
  KEY idx_homestay (homestay_id)
) ENGINE=InnoDB COMMENT='房型';

-- 房态日历（room+date 联合唯一，支持动态定价与预扣）

-- ============ t_room_inventory（原文件第 495 行起）============
CREATE TABLE t_room_inventory (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  room_type_id  BIGINT UNSIGNED NOT NULL,
  inv_date      DATE         NOT NULL,
  price         DECIMAL(10,2) NOT NULL COMMENT '当日价格（动态定价）',
  total         INT          NOT NULL DEFAULT 1 COMMENT '当日总间数',
  booked        INT          NOT NULL DEFAULT 0 COMMENT '已预订间数',
  status        TINYINT      NOT NULL DEFAULT 1 COMMENT '1可订 0不可订',
  PRIMARY KEY (id),
  UNIQUE KEY uk_room_date (room_type_id, inv_date),
  KEY idx_date (inv_date)
) ENGINE=InnoDB COMMENT='房态日历';

-- =============================================================
-- 七、模块四 行-线路订票
-- =============================================================

