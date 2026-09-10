-- 住模块（民宿预订）种子数据，原样摘自 sql/02-dml.sql

-- ============ t_homestay ============
INSERT INTO t_homestay (id, name, merchant_id, address, longitude, latitude, style_tags, facility_tags, main_image, intro, rating, check_in_time, check_out_time, pet_policy, has_breakfast, deposit) VALUES
(1, '吊脚楼观景民宿', 3, '乌东村上寨 12 号', 108.124000, 26.457200, '吊脚楼,观景', 'WiFi,空调,独立卫浴,苗族特色', '/uploads/seeds/homestay-1.svg', '百年吊脚楼改造的观景民宿，推窗即见层叠梯田与云雾苗寨。楼体为纯木榫卯结构，木香萦绕，夜里可观星空听蛙鸣。', 4.9, '14:00', '12:00', 1, 1, 100.00),
(2, '苗家木楼小院', 3, '乌东村中寨 8 号', 108.124800, 26.456500, '木楼,庭院', 'WiFi,空调,独立卫浴', '/uploads/seeds/homestay-2.svg', '带庭院苗家木楼，院里有百年枫树与石磨，适合家庭与朋友结伴入住，可体验打糍粑、学蜡染。', 4.7, '14:00', '12:00', 0, 1, 100.00);


-- ============ t_room_type ============
INSERT INTO t_room_type (id, homestay_id, name, bed_type, area, capacity, facilities, price, stock, main_image) VALUES
(1, 1, '苗族木屋大床房', '1.8m 大床', 28.0, 2, 'WiFi,空调,独立卫浴', 388.00, 5, '/uploads/seeds/room-1.svg'),
(2, 1, '观景双床房', '1.2m 双床', 32.0, 2, 'WiFi,空调,独立卫浴,观景阳台', 458.00, 4, '/uploads/seeds/room-2.svg'),
(3, 1, '星空阁楼套房', '2.0m 大床', 45.0, 3, 'WiFi,空调,独立卫浴,天窗', 688.00, 2, '/uploads/seeds/room-3.svg'),
(4, 2, '庭院大床房', '1.8m 大床', 26.0, 2, 'WiFi,空调,独立卫浴', 328.00, 4, '/uploads/seeds/room-4.svg'),
(5, 2, '家庭套房（两居）', '大床+双床', 55.0, 4, 'WiFi,空调,独立卫浴,客厅', 528.00, 2, '/uploads/seeds/room-5.svg'),
(6, 2, '苗家火塘房', '1.5m 大床', 30.0, 2, 'WiFi,空调,独立卫浴,火塘', 298.00, 3, '/uploads/seeds/room-6.svg');

-- 房态日历：未来 30 天（动态定价：周末 +20/晚）

-- ============ t_room_inventory ============
INSERT INTO t_room_inventory (room_type_id, inv_date, price, total, booked, status)
SELECT r.id,
       DATE_ADD(CURDATE(), INTERVAL s.n DAY),
       r.price + IF(DAYOFWEEK(DATE_ADD(CURDATE(), INTERVAL s.n DAY)) IN (1, 7), 20, 0),
       r.stock, 0, 1
FROM t_room_type r
JOIN (
  WITH RECURSIVE seq(n) AS (SELECT 0 UNION ALL SELECT n + 1 FROM seq WHERE n < 29)
  SELECT n FROM seq
) s
ON 1 = 1;

-- ---------- 景区与票务（行） ----------
