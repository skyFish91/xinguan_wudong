-- =============================================================
-- 乌东文旅平台 初始数据 DML
-- 图片为本地占位 SVG（server/uploads/seeds/ 由脚本生成）
-- 演示账号：admin/admin123、13800000001/user123、merchant1-4/merchant123
-- =============================================================
-- 强制本次导入连接的字符集，防止 docker 初始化时中文被按 latin1 读入产生乱码
SET NAMES utf8mb4;
USE wudong;

-- ---------- 用户 ----------
INSERT INTO t_user (id, phone, password, nickname, role, status) VALUES
(1, '13800000000', '$2b$10$i8tOPcgEyYimRX6BgIeZg.B99u13t5lD2Osk93axr031ooweeTmFG', '平台管理员', 'admin', 1),
(2, '13800000001', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '苗岭行者', 'user', 1),
(3, '13800000002', '$2b$10$gcpzzo5BlxnVTUNGgvAWe.lHS6GFOiA/8IAmbXlMihiUN9pS9zbmW', '银饰商家', 'merchant', 1),
(4, '13800000003', '$2b$10$gcpzzo5BlxnVTUNGgvAWe.lHS6GFOiA/8IAmbXlMihiUN9pS9zbmW', '长桌宴商家', 'merchant', 1),
(5, '13800000004', '$2b$10$gcpzzo5BlxnVTUNGgvAWe.lHS6GFOiA/8IAmbXlMihiUN9pS9zbmW', '吊脚楼民宿商家', 'merchant', 1),
(6, '13800000005', '$2b$10$gcpzzo5BlxnVTUNGgvAWe.lHS6GFOiA/8IAmbXlMihiUN9pS9zbmW', '苗寨游商家', 'merchant', 1);

INSERT INTO t_user (phone, password, nickname, role, gender, region, bio) VALUES
('13900000001', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '山水闲客', 'user', 1, '贵州贵阳', '热爱苗寨风光的摄影爱好者'),
('13900000002', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '银铃叮当', 'user', 2, '广东广州', '非遗手工艺收藏者'),
('13900000003', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '行摄黔东南', 'user', 1, '重庆', '喜欢记录少数民族村寨生活');

-- ---------- 角色 ----------
INSERT INTO t_role (id, role_name, permissions) VALUES
(1, '超级管理员', '["*"]'),
(2, '运营', '["user:manage","content:audit","home:operate","message:send","order:view","data:view"]'),
(3, '财务', '["finance:manage","settlement:manage","data:view"]');

-- ---------- 商家 ----------
INSERT INTO t_merchant (user_id, shop_name, module_type, contact, contact_phone, license_no, status) VALUES
(3, '苗银世家银饰工坊', 'clothing', '吴师傅', '13800000002', '91522601MA0001', 1),
(4, '乌东长桌宴', 'food', '阿朵姐', '13800000003', '91522601MA0002', 1),
(5, '吊脚楼民宿群', 'hotel', '石阿公', '13800000004', '91522601MA0003', 1),
(6, '乌东苗寨游', 'travel', '潘导', '13800000005', '91522601MA0004', 1);

-- ---------- 商品分类（衣） ----------
INSERT INTO t_product_category (id, name, parent_id, icon, sort) VALUES
(1, '银饰', 0, '/uploads/seeds/cat-silver.svg', 1),
(2, '蜡染', 0, '/uploads/seeds/cat-batik.svg', 2),
(3, '刺绣', 0, '/uploads/seeds/cat-embroidery.svg', 3),
(4, '服饰', 0, '/uploads/seeds/cat-costume.svg', 4),
(5, '其他', 0, '/uploads/seeds/cat-other.svg', 5),
(11, '银手镯', 1, '', 1),
(12, '银项圈', 1, '', 2),
(13, '银头饰', 1, '', 3),
(21, '蜡染布艺', 2, '', 1),
(22, '蜡染桌旗', 2, '', 2),
(31, '刺绣挂件', 3, '', 1),
(32, '刺绣荷包', 3, '', 2),
(41, '苗族女装', 4, '', 1),
(42, '苗族童装', 4, '', 2);

-- ---------- 传承人 ----------
INSERT INTO t_inheritor (id, name, title, craft, story) VALUES
(1, '吴水云', '黔东南州级银饰锻造非遗传承人', '银饰锻造', '吴水云十二岁随父学习银饰锻造，三十年如一日敲打拉丝，其"錾花手镯"工艺被收入贵州省非物质文化遗产名录。他坚持纯手工打造，一件银饰需经历熔银、锻打、錾花、焊接、洗银等十余道工序。'),
(2, '杨晓梅', '蜡染技艺县级非遗传承人', '蜡染', '杨晓梅自幼随祖母学习蜡染，以铜刀蘸蜂蜡在布上作画，纹样取自苗寨梯田、蝴蝶妈妈与枫树图腾。她希望让更多年轻人看见蜡染之美。'),
(3, '李绣娘', '苗族刺绣传承人', '刺绣', '李绣娘擅长数纱绣与打籽绣，一针一线绣出苗族古歌里的故事，作品曾获黔东南州手工艺大赛金奖。');

-- ---------- 商品（衣） ----------
INSERT INTO t_product (id, title, subtitle, category_id, merchant_id, main_image, price, market_price, stock, sales, rating, craft_intro, detail, inheritor_id, freight, status) VALUES
(1, '手工錾花银手镯（中号）', '纯手工锻打 錾花工艺', 11, 1, '/uploads/seeds/product-silver-1.svg', 680.00, 880.00, 50, 126, 4.8,
'采用传统錾花工艺，在银条上手工錾刻苗族传统纹样。历经熔银、锻打、拉丝、錾花、焊接、洗银等十二道工序，每件纹样皆有细微差异，独一无二。',
'<h3>工艺特色</h3><p>苗族银饰锻制技艺是国家级非物质文化遗产。錾花手镯以纯银为材（S990），纹样取自枫树图腾与蝴蝶妈妈传说。</p><h3>佩戴与保养</h3><p>银饰接触硫化物会变黑，可用擦银布轻拭；不佩戴时密封存放。</p>', 1, 0, 1),
(2, '枫树图腾银项圈', '苗族盛装标志 拉丝工艺', 12, 1, '/uploads/seeds/product-silver-2.svg', 1280.00, 1580.00, 20, 58, 4.9,
'苗族盛装必备银项圈，采用拉丝与錾刻结合的工艺，圈身錾刻枫树、蝴蝶纹样，寓意万物起源。',
'<h3>文化背景</h3><p>苗族古歌中，枫树孕育蝴蝶妈妈，蝴蝶妈妈生下苗族祖先。枫树图腾是苗族银饰最常见纹样之一。</p>', 1, 0, 1),
(3, '手工蜡染桌旗', '蓝白之间 非遗手作', 22, 1, '/uploads/seeds/product-batik-1.svg', 168.00, 228.00, 100, 210, 4.7,
'以蜂蜡为防染剂，铜刀作画，蓝靛浸染。纹样为苗寨梯田与铜鼓纹，可作茶席、桌旗。',
'<h3>工艺流程</h3><p>画蜡 → 浸染 → 脱蜡 → 清洗。浸染次数越多，蓝色越深。</p>', 2, 8, 1),
(4, '苗族数纱绣荷包', '一针一线 吉祥纹样', 32, 1, '/uploads/seeds/product-embroidery-1.svg', 98.00, 138.00, 80, 96, 4.8,
'数纱绣荷包，绣有鱼纹与花卉纹样，寓意年年有余。内置拉绳收口，可装香囊或小物。',
'<h3>工艺说明</h3><p>数纱绣按布纹经纬线数纱下针，绣面平整细腻，是苗族刺绣代表技法。</p>', 3, 8, 1),
(5, '苗族刺绣女装上衣', '盛装改良 日常可穿', 41, 1, '/uploads/seeds/product-costume-1.svg', 468.00, 588.00, 30, 45, 4.6,
'改良苗族女装，保留交领、刺绣、银饰点缀等传统元素，版型适合日常穿着。',
'<h3>穿着场景</h3><p>节日、旅拍、日常皆宜。提供 S/M/L 码。</p>', 3, 0, 1),
(6, '蜡染布艺挂画', '梯田人家 装饰布艺', 21, 1, '/uploads/seeds/product-batik-2.svg', 268.00, 328.00, 40, 67, 4.5,
'大幅蜡染挂画《梯田人家》，描绘乌东苗寨吊脚楼与层叠梯田，适合民宿、书房装饰。',
'<h3>规格</h3><p>尺寸 60cm x 90cm，附挂绳，可挂可展。</p>', 2, 10, 1);

INSERT INTO t_product_sku (product_id, spec_name, price, stock, image) VALUES
(1, '银饰-手镯-中号', 680.00, 30, '/uploads/seeds/product-silver-1.svg'),
(1, '银饰-手镯-小号', 620.00, 20, '/uploads/seeds/product-silver-1.svg'),
(2, '银饰-项圈-标准', 1280.00, 20, '/uploads/seeds/product-silver-2.svg'),
(3, '蜡染-桌旗-标准', 168.00, 100, '/uploads/seeds/product-batik-1.svg'),
(4, '刺绣-荷包-标准', 98.00, 80, '/uploads/seeds/product-embroidery-1.svg'),
(5, '服饰-女装-S', 468.00, 10, '/uploads/seeds/product-costume-1.svg'),
(5, '服饰-女装-M', 468.00, 10, '/uploads/seeds/product-costume-1.svg'),
(5, '服饰-女装-L', 468.00, 10, '/uploads/seeds/product-costume-1.svg'),
(6, '蜡染-挂画-标准', 268.00, 40, '/uploads/seeds/product-batik-2.svg');

INSERT INTO t_product_image (product_id, image_url, sort) VALUES
(1, '/uploads/seeds/product-silver-1.svg', 1),
(2, '/uploads/seeds/product-silver-2.svg', 1),
(3, '/uploads/seeds/product-batik-1.svg', 1),
(4, '/uploads/seeds/product-embroidery-1.svg', 1),
(5, '/uploads/seeds/product-costume-1.svg', 1),
(6, '/uploads/seeds/product-batik-2.svg', 1);

-- ---------- 农产品（食） ----------
INSERT INTO t_farm_category (id, name, icon, sort) VALUES
(1, '茶叶', '/uploads/seeds/cat-tea.svg', 1),
(2, '腊肉', '/uploads/seeds/cat-bacon.svg', 2),
(3, '米酒', '/uploads/seeds/cat-wine.svg', 3),
(4, '酸食', '/uploads/seeds/cat-sour.svg', 4),
(5, '其他', '/uploads/seeds/cat-other.svg', 5);

INSERT INTO t_farm_product (id, category_id, merchant_id, name, price, spec, stock, sales, main_image, origin, shelf_life, detail, freight, status) VALUES
(1, 1, 2, '乌东云雾毛尖', 128.00, '250g/罐', 200, 320, '/uploads/seeds/farm-tea.svg', '乌东村云雾山茶园', '24个月', '<p>云雾山茶园海拔 1200 米，明前采摘一芽一叶，手工炒制。</p>', 8, 1),
(2, 2, 2, '苗家土法烟熏腊肉', 88.00, '500g/袋', 150, 240, '/uploads/seeds/farm-bacon.svg', '乌东村农户散养黑毛猪', '真空 6 个月', '<p>柴火烟熏 30 天，肥瘦相间，蒸炒皆宜。</p>', 10, 1),
(3, 3, 2, '苗家糯米甜酒酿', 38.00, '750g/坛', 300, 410, '/uploads/seeds/farm-wine.svg', '乌东村酿酒作坊', '冷藏 3 个月', '<p>糯米蒸制发酵，甜糯酒香，可煮汤圆、冲蛋花。</p>', 10, 1),
(4, 4, 2, '酸汤鱼底料（红酸）', 25.00, '300g/袋', 500, 560, '/uploads/seeds/farm-sour.svg', '乌东村辣椒基地', '12个月', '<p>以山地小番茄自然发酵的红酸汤，酸香浓郁。</p>', 8, 1);

-- ---------- 餐厅（食） ----------
INSERT INTO t_restaurant (id, name, merchant_id, address, longitude, latitude, open_time, capacity, main_image, intro, rating) VALUES
(1, '乌东长桌宴', 2, '乌东村中心广场旁', 108.123456, 26.456789, '10:30-21:30', 200, '/uploads/seeds/restaurant-1.svg', '苗家长桌宴是乌东村待客的最高礼仪。百人长桌一字排开，酸汤鱼、鼓藏肉、糯米饭依次上桌，席间苗家阿妹唱起敬酒歌，游客可体验"高山流水"敬酒仪式。', 4.8),
(2, '梯田味道农家菜', 2, '乌东村梯田观景台下方', 108.124500, 26.455800, '10:00-20:30', 80, '/uploads/seeds/restaurant-2.svg', '坐拥梯田景观的农家小馆，食材取自自家菜园与稻田，主打腊肉合蒸、稻花鱼。', 4.6);

INSERT INTO t_dish (restaurant_id, name, price, main_image, intro, is_signature) VALUES
(1, '酸汤鱼（稻田鱼）', 98.00, '/uploads/seeds/dish-1.svg', '乌东稻田鱼配山地小番茄发酵红酸汤，酸香开胃', 1),
(1, '鼓藏肉', 68.00, '/uploads/seeds/dish-2.svg', '苗族祭祖节庆菜，大块猪肉白煮蘸辣水', 1),
(1, '糯米饭配腊肉', 38.00, '/uploads/seeds/dish-3.svg', '五彩糯米饭搭配土法烟熏腊肉', 0),
(1, '米酒汤圆', 22.00, '/uploads/seeds/dish-4.svg', '糯米甜酒酿煮汤圆，暖胃甜品', 0),
(2, '腊肉合蒸', 58.00, '/uploads/seeds/dish-5.svg', '腊肉、腊肠、土豆片合蒸', 1),
(2, '酸辣稻花鱼', 78.00, '/uploads/seeds/dish-6.svg', '稻田现捞稻花鱼，酸辣做法', 0);

INSERT INTO t_meal_slot (restaurant_id, slot_name, max_booking) VALUES
(1, '午餐 11:30-13:30', 30),
(1, '晚餐 17:30-20:00', 30),
(2, '午餐 11:00-13:00', 15),
(2, '晚餐 17:00-19:30', 15);

-- ---------- 民宿（住） ----------
INSERT INTO t_homestay (id, name, merchant_id, address, longitude, latitude, style_tags, facility_tags, main_image, intro, rating, check_in_time, check_out_time, pet_policy, has_breakfast, deposit) VALUES
(1, '吊脚楼观景民宿', 3, '乌东村上寨 12 号', 108.124000, 26.457200, '吊脚楼,观景', 'WiFi,空调,独立卫浴,苗族特色', '/uploads/seeds/homestay-1.svg', '百年吊脚楼改造的观景民宿，推窗即见层叠梯田与云雾苗寨。楼体为纯木榫卯结构，木香萦绕，夜里可观星空听蛙鸣。', 4.9, '14:00', '12:00', 1, 1, 100.00),
(2, '苗家木楼小院', 3, '乌东村中寨 8 号', 108.124800, 26.456500, '木楼,庭院', 'WiFi,空调,独立卫浴', '/uploads/seeds/homestay-2.svg', '带庭院苗家木楼，院里有百年枫树与石磨，适合家庭与朋友结伴入住，可体验打糍粑、学蜡染。', 4.7, '14:00', '12:00', 0, 1, 100.00);

INSERT INTO t_room_type (id, homestay_id, name, bed_type, area, capacity, facilities, price, stock, main_image) VALUES
(1, 1, '苗族木屋大床房', '1.8m 大床', 28.0, 2, 'WiFi,空调,独立卫浴', 388.00, 5, '/uploads/seeds/room-1.svg'),
(2, 1, '观景双床房', '1.2m 双床', 32.0, 2, 'WiFi,空调,独立卫浴,观景阳台', 458.00, 4, '/uploads/seeds/room-2.svg'),
(3, 1, '星空阁楼套房', '2.0m 大床', 45.0, 3, 'WiFi,空调,独立卫浴,天窗', 688.00, 2, '/uploads/seeds/room-3.svg'),
(4, 2, '庭院大床房', '1.8m 大床', 26.0, 2, 'WiFi,空调,独立卫浴', 328.00, 4, '/uploads/seeds/room-4.svg'),
(5, 2, '家庭套房（两居）', '大床+双床', 55.0, 4, 'WiFi,空调,独立卫浴,客厅', 528.00, 2, '/uploads/seeds/room-5.svg'),
(6, 2, '苗家火塘房', '1.5m 大床', 30.0, 2, 'WiFi,空调,独立卫浴,火塘', 298.00, 3, '/uploads/seeds/room-6.svg');

-- 房态日历：未来 30 天（动态定价：周末 +20/晚）
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
INSERT INTO t_scenic (id, name, address, longitude, latitude, open_time, intro, main_image) VALUES
(1, '乌东苗寨景区', '贵州省黔东南州雷山县乌东村', 108.123456, 26.456789, '08:00-18:00', '乌东村地处雷公山腹地，保存着完整的苗族吊脚楼建筑群与农耕梯田景观，入选中国传统村落名录。可观赏苗族歌舞表演、银饰锻制技艺展示。', '/uploads/seeds/scenic-1.svg'),
(2, '雷公山国家森林公园', '雷山县雷公山', 108.150000, 26.400000, '08:30-17:30', '雷公山为苗岭主峰，原始森林覆盖率超 88%，可观赏云海、瀑布与高山杜鹃。', '/uploads/seeds/scenic-2.svg');

INSERT INTO t_ticket_type (id, scenic_id, name, price, valid_rule) VALUES
(1, 1, '成人票', 60.00, '当日有效，入园一次'),
(2, 1, '儿童票', 30.00, '1.2m-1.5m 儿童，当日有效'),
(3, 1, '学生票', 30.00, '全日制学生凭学生证，当日有效'),
(4, 1, '家庭套票（2大1小）', 130.00, '当日有效，入园一次'),
(5, 2, '成人票', 40.00, '当日有效，入园一次'),
(6, 2, '学生票', 20.00, '全日制学生凭学生证，当日有效');

-- 票务库存：未来 30 天
INSERT INTO t_ticket_inventory (ticket_type_id, use_date, total, sold, status)
SELECT tt.id, DATE_ADD(CURDATE(), INTERVAL s.n DAY), 200, 0, 1
FROM t_ticket_type tt
JOIN (
  WITH RECURSIVE seq(n) AS (SELECT 0 UNION ALL SELECT n + 1 FROM seq WHERE n < 29)
  SELECT n FROM seq
) s
ON 1 = 1;

-- ---------- 路线套餐（行） ----------
INSERT INTO t_route (id, merchant_id, title, days, price, themes, included, notice, depart_from, dest, hotel_standard, meal_standard, main_image, detail, sales) VALUES
(1, 4, '乌东苗寨一日游（银饰工坊体验）', 1, 128.00, '研学', '苗寨门票、长桌宴午餐、银饰工坊体验、专业讲解', '建议穿舒适鞋履；银饰体验含材料费，成品可带走', '乌东村游客中心', '乌东苗寨', '-', '长桌宴午餐', '/uploads/seeds/route-1.svg', '<p>上午游览吊脚楼建筑群与梯田，中午体验苗家长桌宴，下午进入银饰工坊亲手锻打一枚银片吊坠。</p>', 88),
(2, 4, '苗寨梯田两日深度游', 2, 428.00, '摄影', '苗寨门票、吊脚楼民宿一晚、两正一早、蜡染体验、晨雾梯田摄影指导', '摄影团建议携带三脚架；如遇大雨行程将调整', '乌东村游客中心', '乌东苗寨+梯田观景台', '吊脚楼观景民宿（观景双床房）', '两正一早（含长桌宴）', '/uploads/seeds/route-2.svg', '<p>第一天游览苗寨、体验蜡染；次日清晨赴梯田观景台拍摄晨雾日出，中午返程。</p>', 45),
(3, 4, '雷公山云海两日游', 2, 498.00, '亲子', '雷公山门票、苗寨门票、民宿一晚、两正一早、云海日出观景、植物导赏', '山顶温差大请带外套；儿童需成人陪同', '乌东村游客中心', '雷公山+乌东苗寨', '苗家木楼小院（家庭套房）', '两正一早', '/uploads/seeds/route-3.svg', '<p>第一天游览乌东苗寨；次日凌晨登雷公山观云海日出，上午原始森林徒步与植物导赏。</p>', 32);

INSERT INTO t_route_itinerary (route_id, day_no, description, scenic, meal, hotel, transport) VALUES
(1, 1, '上午游览乌东苗寨吊脚楼群、梯田观景；中午长桌宴；下午银饰工坊体验', '乌东苗寨、梯田观景台', '长桌宴午餐', '-', '步行+摆渡车'),
(2, 1, '中午集合，游览苗寨与蜡染工坊，体验蜡染制作', '乌东苗寨', '晚餐', '吊脚楼观景民宿', '摆渡车'),
(2, 2, '清晨梯田观景台拍摄晨雾日出，上午自由拍摄，中午返程', '梯田观景台', '早餐+午餐', '-', '摆渡车'),
(3, 1, '中午集合，游览乌东苗寨，傍晚入住民宿', '乌东苗寨', '晚餐', '苗家木楼小院', '摆渡车'),
(3, 2, '凌晨登雷公山观云海日出，上午原始森林徒步，中午返程', '雷公山国家森林公园', '早餐+午餐', '-', '包车');

-- ---------- 交通攻略（行） ----------
INSERT INTO t_traffic_guide (title, depart_from, dest, transport, duration, cost, detail, image) VALUES
('贵阳出发：高铁+大巴', '贵阳', '乌东村', '高铁+大巴', '约 3 小时', '约 80 元', '<p>贵阳北站乘高铁至凯里南站（约 40 分钟），凯里南站换乘旅游大巴直达雷山县城（约 1 小时），再转乘乌东专线（约 40 分钟）。</p>', '/uploads/seeds/guide-1.svg'),
('凯里出发：自驾', '凯里', '乌东村', '自驾', '约 1.5 小时', '过路费约 30 元', '<p>凯里市区出发，沿凯雷公路行驶至雷山县，再沿县道进入乌东村。山路弯多，注意减速慢行。</p>', '/uploads/seeds/guide-2.svg'),
('广州出发：高铁+包车', '广州', '乌东村', '高铁+包车', '约 5 小时', '约 400 元', '<p>广州南站乘高铁至凯里南站（约 4 小时），出站包车直达乌东村（约 1.5 小时），人多包车更划算。</p>', '/uploads/seeds/guide-3.svg');

-- ---------- 社区（话题） ----------
INSERT INTO t_topic (id, name, intro, is_recommend) VALUES
(1, '#苗寨风光', '分享乌东苗寨的梯田、吊脚楼与云海', 1),
(2, '#非遗手作', '银饰、蜡染、刺绣等非遗体验记录', 1),
(3, '#苗家美食', '长桌宴、酸汤鱼、米酒等美食分享', 0),
(4, '#旅拍攻略', '乌东村摄影机位与游玩攻略', 0);

-- ---------- 平台运营 ----------
INSERT INTO t_banner (title, image_url, link_url, sort, status) VALUES
('乌东苗寨全景', '/uploads/seeds/banner-1.svg', '/travel/scenic/1', 1, 1),
('非遗银饰工坊', '/uploads/seeds/banner-2.svg', '/clothing', 2, 1),
('苗家长桌宴', '/uploads/seeds/banner-3.svg', '/food', 3, 1);

INSERT INTO t_activity_banner (title, image_url, link_url, start_time, end_time, status) VALUES
('苗年节庆典倒计时', '/uploads/seeds/activity-1.svg', '/community/topic/1', '2026-09-01 00:00:00', '2026-11-30 23:59:59', 1);

INSERT INTO t_announcement (title, content, status) VALUES
('平台上线公告', '乌东文旅"衣食住行"综合服务平台正式上线！衣、食、住、行、社区五大板块一站式服务，欢迎体验。', 1),
('国庆假期预订提醒', '国庆假期住宿与门票紧张，请提前 7 天预订。路线套餐需提前 1 天预订。', 1);

INSERT INTO t_recommend (slot_name, biz_type, biz_id, sort) VALUES
('首页热门商品', 'product', 1, 1),
('首页热门商品', 'product', 3, 2),
('首页热门商品', 'product', 4, 3),
('首页热门民宿', 'homestay', 1, 1),
('首页热门民宿', 'homestay', 2, 2),
('首页热门路线', 'route', 1, 1),
('首页热门路线', 'route', 2, 2);

INSERT INTO t_hot_keyword (keyword, sort) VALUES
('银饰', 1), ('长桌宴', 2), ('吊脚楼民宿', 3), ('梯田', 4), ('酸汤鱼', 5);

INSERT INTO t_sensitive_word (word) VALUES
('涉黄词示例'), ('涉政词示例'), ('暴恐词示例'), ('诈骗词示例');

INSERT INTO t_system_config (config_key, config_value, remark) VALUES
('commission_goods', '0.05', '实物商品平台抽佣比例'),
('commission_service', '0.10', '服务类（民宿/门票/餐位/路线）抽佣比例'),
('settlement_cycle', 'T+7', '财务结算周期'),
('order_timeout_minutes', '30', '订单超时关闭分钟数'),
('sms_code_fixed', '123456', '开发期模拟短信验证码');

-- ---------- 初始订单示例（游客已支付状态，用于演示订单中心） ----------
INSERT INTO t_order (id, order_no, user_id, merchant_id, order_type, status, total_amount, pay_amount, pay_time) VALUES
(1, 'WD202609070001', 2, 1, 'goods', 1, 680.00, 680.00, '2026-09-07 10:30:00'),
(2, 'WD202609070002', 2, 2, 'meal', 2, 98.00, 98.00, '2026-09-07 11:00:00');

INSERT INTO t_order_item (order_id, sku_id, title, spec_name, image, price, quantity, shipping_status) VALUES
(1, 1, '手工錾花银手镯（中号）', '银饰-手镯-中号', '/uploads/seeds/product-silver-1.svg', 680.00, 1, 0);

INSERT INTO t_meal_booking (order_id, restaurant_id, slot_id, booking_date, guest_count, contact_name, contact_phone) VALUES
(2, 1, 1, '2026-09-08', 2, '苗岭行者', '13800000001');

INSERT INTO t_pay_record (pay_no, order_id, user_id, amount, channel, status, paid_at) VALUES
('PAY20260907100001', 1, 2, 680.00, 'mock_wxpay', 1, '2026-09-07 10:30:00'),
('PAY20260907110001', 2, 2, 98.00, 'mock_wxpay', 1, '2026-09-07 11:00:00');

INSERT INTO t_finance_record (order_id, merchant_id, order_amount, commission_rate, commission, merchant_income) VALUES
(1, 1, 680.00, 0.05, 34.00, 646.00),
(2, 2, 98.00, 0.10, 9.80, 88.20);

INSERT INTO t_message (user_id, msg_type, title, content) VALUES
(2, 'system', '欢迎来到乌东文旅平台', '衣、食、住、行、社区一站式服务，祝您玩得开心！'),
(2, 'order', '订单支付成功', '订单 WD202609070001 支付成功，商家将尽快发货。');


-- =========================================================
-- 演示 mock 数据（生成时间：2026-09-10T01:30:48）
-- 100 用户 / 100 订单 / 30 评论 / 30 消息 / 200 访问日志
-- 仅用于 dashboard / users / orders / messages 等页面演示
-- =========================================================

-- 用户（id 10-109）
INSERT INTO t_user (id, phone, password, nickname, role, gender, region, bio, status) VALUES
(10, '13734416734', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '山间清泉46', 'user', 0, '北京', '写作者，记录旅途所见', 1),
(11, '13775941790', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '银饰哥', 'user', 0, '浙江杭州', '非遗手工艺收藏者', 1),
(12, '13743390024', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '苗寨老吴47', 'user', 1, '广东广州', '喜欢原生态乡村', 1),
(13, '13780418323', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '秋千上的', 'user', 2, '江苏南京', '喜欢原生态乡村', 1),
(14, '13727408259', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '银饰匠人', 'user', 1, '湖北武汉', '亲子游家庭', 1),
(15, '13753785449', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '枫叶红了', 'user', 0, '浙江杭州', '喜欢原生态乡村', 1),
(16, '13790570691', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '云上人家18', 'user', 1, '广东广州', '亲子游家庭', 1),
(17, '13762323243', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '稻花鱼65', 'user', 1, '福建福州', '徒步穿越爱好者', 1),
(18, '13780590000', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '苗寨行者', 'user', 1, '湖北武汉', '传统文化研习者', 1),
(19, '13776186303', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '梯田守望者', 'user', 2, '贵州铜仁', '古法美食追随者', 1),
(20, '13753263595', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '阿莲40', 'user', 2, '上海', '徒步穿越爱好者', 1),
(21, '13763678397', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '苗岭飞歌36', 'user', 0, '贵州遵义', '徒步穿越爱好者', 1),
(22, '13712969834', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '银饰哥77', 'user', 0, '云南昆明', '热爱苗寨风光的摄影爱好者', 1),
(23, '13725504163', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '黔山秀水', 'user', 1, '湖北武汉', '苗族文化研究者', 1),
(24, '13731870631', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '山路弯弯', 'user', 2, '福建福州', '喜欢记录少数民族村寨生活', 1),
(25, '13777533294', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '蜡染姑娘19', 'user', 1, '广东深圳', '喜欢记录少数民族村寨生活', 1),
(26, '13725580903', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '深山老饕96', 'user', 1, '云南昆明', '热爱苗寨风光的摄影爱好者', 1),
(27, '13765191712', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '蜡染姑娘', 'user', 0, '贵州贵阳', '自驾游达人', 1),
(28, '13722818202', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '蜡染坊73', 'user', 0, '广西南宁', '美食博主，专探各地特色', 1),
(29, '13778368717', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '酸汤妹', 'user', 1, '江西南昌', '热爱苗寨风光的摄影爱好者', 1),
(30, '13785977047', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '山间清泉', 'user', 1, '湖南长沙', '建筑设计爱好者，关注吊脚楼', 1),
(31, '13793015226', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '梯田守望者86', 'user', 2, '四川成都', '写作者，记录旅途所见', 1),
(32, '13734303993', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '阿娜91', 'user', 2, '湖北武汉', '建筑设计爱好者，关注吊脚楼', 1),
(33, '13757745281', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '梯田守望者', 'user', 0, '江苏南京', '自驾游达人', 1),
(34, '13799058238', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '竹楼夜话', 'user', 2, '福建福州', '传统文化研习者', 1),
(35, '13720377660', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '山间清泉', 'user', 2, '广东广州', '喜欢原生态乡村', 1),
(36, '13764453726', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '夜郎后人', 'user', 2, '云南昆明', '寻找小众目的地', 1),
(37, '13751757415', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '酸汤妹', 'user', 1, '江西南昌', '热爱苗寨风光的摄影爱好者', 1),
(38, '13740311511', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '银饰匠人', 'user', 0, '湖南长沙', '苗族文化研究者', 1),
(39, '13779927368', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '苗岭小妹', 'user', 1, '贵州贵阳', '喜欢记录少数民族村寨生活', 1),
(40, '13716568272', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '深山老饕59', 'user', 1, '上海', '寻找小众目的地', 1),
(41, '13732051197', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '飞歌', 'user', 2, '福建福州', '美食博主，专探各地特色', 1),
(42, '13786336788', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '鼓楼夜话52', 'user', 2, '浙江杭州', '非遗手工艺收藏者', 1),
(43, '13770659156', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '蜡染姑娘90', 'user', 0, '广西南宁', '古法美食追随者', 1),
(44, '13739857355', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '阿莎41', 'user', 0, '北京', '苗族文化研究者', 1),
(45, '13773301886', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '阿西里西74', 'user', 1, '广东深圳', '热爱苗寨风光的摄影爱好者', 1),
(46, '13759217911', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '阿娜66', 'user', 2, '湖北武汉', '亲子游家庭', 1),
(47, '13721491537', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '银饰匠人2', 'user', 2, '广西南宁', '美食博主，专探各地特色', 1),
(48, '13794582843', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '苗寨行者53', 'user', 2, '上海', '传统文化研习者', 1),
(49, '13761436250', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '苗家小厨62', 'user', 0, '广东广州', '非遗手工艺收藏者', 1),
(50, '13767909812', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '黑发苗女', 'user', 2, '广东广州', '热爱苗寨风光的摄影爱好者', 1),
(51, '13752927588', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '山歌嘹亮57', 'user', 0, '贵州凯里', '建筑设计爱好者，关注吊脚楼', 1),
(52, '13765332115', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '枫香染坊', 'user', 2, '重庆', '写作者，记录旅途所见', 1),
(53, '13746507907', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '银匠传人38', 'user', 0, '北京', '徒步穿越爱好者', 1),
(54, '13759128285', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '蜡染姑娘', 'user', 2, '贵州遵义', '热爱苗寨风光的摄影爱好者', 1),
(55, '13785243985', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '吊脚楼主', 'user', 1, '湖南长沙', '自驾游达人', 1),
(56, '13757921926', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '竹楼夜话', 'user', 2, '湖南长沙', '喜欢记录少数民族村寨生活', 1),
(57, '13778369436', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '云上人家', 'user', 0, '浙江杭州', '古法美食追随者', 1),
(58, '13796515326', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '山间清泉', 'user', 1, '福建福州', '传统文化研习者', 1),
(59, '13755908298', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '山路弯弯91', 'user', 2, '上海', '喜欢记录少数民族村寨生活', 1),
(60, '13719034574', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '黑发苗女', 'user', 1, '云南昆明', '建筑设计爱好者，关注吊脚楼', 1),
(61, '13719849666', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '苗家情歌', 'user', 0, '湖北武汉', '寻找小众目的地', 1),
(62, '13771698712', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '芦笙少年68', 'user', 2, '贵州凯里', '非遗手工艺收藏者', 1),
(63, '13733053720', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '稻田守望90', 'user', 2, '湖北武汉', '苗族文化研究者', 1),
(64, '13720892445', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '芦笙少年', 'user', 1, '湖北武汉', '徒步穿越爱好者', 1),
(65, '13713784060', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '敬酒歌', 'user', 0, '福建福州', '建筑设计爱好者，关注吊脚楼', 1),
(66, '13728469287', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '阿西里西', 'user', 1, '重庆', '喜欢原生态乡村', 1),
(67, '13779823868', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '苗家小厨', 'user', 2, '江苏南京', '亲子游家庭', 1),
(68, '13748497506', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '银饰哥', 'user', 0, '江西南昌', '寻找小众目的地', 1),
(69, '13771232809', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '苗岭飞歌', 'user', 2, '湖南长沙', '喜欢记录少数民族村寨生活', 1),
(70, '13785823047', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '银饰匠人79', 'user', 1, '上海', '建筑设计爱好者，关注吊脚楼', 1),
(71, '13756007046', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '苗岭小妹', 'user', 2, '贵州铜仁', '热爱苗寨风光的摄影爱好者', 1),
(72, '13787942418', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '飞歌', 'user', 2, '贵州贵阳', '亲子游家庭', 1),
(73, '13799486041', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '阿西里西3', 'user', 0, '贵州铜仁', '写作者，记录旅途所见', 1),
(74, '13774919426', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '芦笙少年', 'user', 2, '贵州贵阳', '传统文化研习者', 1),
(75, '13779165374', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '酸汤妹38', 'user', 2, '四川成都', '自驾游达人', 1),
(76, '13734029405', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '黑发苗女4', 'user', 2, '湖南长沙', '喜欢记录少数民族村寨生活', 1),
(77, '13776157695', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '阿娜', 'user', 1, '湖南长沙', '自驾游达人', 1),
(78, '13774854681', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '苗家阿婆13', 'user', 2, '广西南宁', '喜欢记录少数民族村寨生活', 1),
(79, '13753631104', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '枫香染坊', 'user', 2, '湖南长沙', '传统文化研习者', 1),
(80, '13774948380', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '秋千上的', 'user', 2, '广东深圳', '手工 DIY 达人', 1),
(81, '13731435396', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '苗寨老吴77', 'user', 0, '湖南长沙', '徒步穿越爱好者', 1),
(82, '13791381994', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '山歌嘹亮', 'user', 0, '贵州贵阳', '亲子游家庭', 1),
(83, '13778002535', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '银饰匠人26', 'user', 1, '湖南长沙', '手工 DIY 达人', 1),
(84, '13765173927', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '蜡染坊', 'user', 0, '湖北武汉', '手工 DIY 达人', 1),
(85, '13748029199', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '秋千上的', 'user', 1, '广东深圳', '自驾游达人', 1),
(86, '13758476427', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '银饰匠人12', 'user', 0, '浙江杭州', '古法美食追随者', 1),
(87, '13762663121', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '银饰匠人93', 'user', 1, '江苏南京', '古法美食追随者', 1),
(88, '13765789846', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '蜡染姑娘', 'user', 1, '贵州贵阳', '苗族文化研究者', 1),
(89, '13731830846', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '山路弯弯', 'user', 2, '贵州遵义', '喜欢原生态乡村', 1),
(90, '13778005811', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '阿娜23', 'user', 2, '上海', '手工 DIY 达人', 1),
(91, '13715617026', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '阿莲47', 'user', 2, '江苏南京', '手工 DIY 达人', 1),
(92, '13797055020', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '苗家绣娘', 'user', 2, '广东深圳', '写作者，记录旅途所见', 1),
(93, '13782801858', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '黑发苗女', 'user', 0, '广西南宁', '亲子游家庭', 1),
(94, '13735177831', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '竹楼夜话', 'user', 1, '广东深圳', '喜欢原生态乡村', 1),
(95, '13735380671', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '长桌宴客90', 'user', 0, '福建福州', '徒步穿越爱好者', 1),
(96, '13710937401', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '苗岭飞歌', 'user', 1, '上海', '手工 DIY 达人', 1),
(97, '13799631273', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '苗家绣娘62', 'user', 1, '四川成都', '传统文化研习者', 1),
(98, '13755963223', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '吊脚楼主95', 'user', 0, '福建福州', '传统文化研习者', 1),
(99, '13757952474', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '竹楼夜话', 'user', 1, '广东广州', '传统文化研习者', 1),
(100, '13770242548', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '酸汤妹81', 'user', 2, '贵州遵义', '写作者，记录旅途所见', 1),
(101, '13799712288', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '酸汤妹', 'user', 0, '广东深圳', '喜欢记录少数民族村寨生活', 1),
(102, '13779739672', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '芦笙少年85', 'user', 0, '贵州贵阳', '非遗手工艺收藏者', 1),
(103, '13744446508', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '苗岭飞歌', 'user', 2, '广西南宁', '喜欢记录少数民族村寨生活', 1),
(104, '13714048277', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '苗寨老吴', 'user', 2, '贵州铜仁', '热爱苗寨风光的摄影爱好者', 1),
(105, '13790852839', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '苗寨老吴90', 'user', 0, '湖北武汉', '寻找小众目的地', 1),
(106, '13711476667', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '苗寨行者', 'user', 2, '福建福州', '苗族文化研究者', 1),
(107, '13754683185', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '苗家情歌', 'user', 0, '贵州贵阳', '寻找小众目的地', 1),
(108, '13784688278', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '枫香染坊13', 'user', 0, '福建福州', '自驾游达人', 1),
(109, '13757454471', '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK', '苗家小厨', 'user', 2, '贵州凯里', '美食博主，专探各地特色', 1);

-- 订单（id 100-199）
INSERT INTO t_order (id, order_no, user_id, merchant_id, order_type, status, total_amount, pay_amount, pay_time, cancel_reason, remark, created_at) VALUES
(101, 'WD20260910000101', 44, 6, 'hotel', 5, 1330.99, 1330.99, DATE_SUB(NOW(), INTERVAL 28 DAY) + INTERVAL 12 HOUR + INTERVAL 51 MINUTE, '', '', DATE_SUB(NOW(), INTERVAL 28 DAY) + INTERVAL 12 HOUR + INTERVAL 51 MINUTE),
(102, 'WD20260910000102', 67, 5, 'goods', 5, 693.99, 693.99, DATE_SUB(NOW(), INTERVAL 22 DAY) + INTERVAL 8 HOUR + INTERVAL 57 MINUTE, '', '需要加一副碗筷', DATE_SUB(NOW(), INTERVAL 22 DAY) + INTERVAL 8 HOUR + INTERVAL 57 MINUTE),
(103, 'WD20260910000103', 47, 4, 'route', 4, 276.99, 276.99, DATE_SUB(NOW(), INTERVAL 23 DAY) + INTERVAL 13 HOUR + INTERVAL 9 MINUTE, '', '请帮忙送到景区门口', DATE_SUB(NOW(), INTERVAL 23 DAY) + INTERVAL 13 HOUR + INTERVAL 9 MINUTE),
(104, 'WD20260910000104', 56, 4, 'goods', 2, 381.99, 381.99, DATE_SUB(NOW(), INTERVAL 29 DAY) + INTERVAL 20 HOUR + INTERVAL 4 MINUTE, '', '送到时电话联系', DATE_SUB(NOW(), INTERVAL 29 DAY) + INTERVAL 20 HOUR + INTERVAL 4 MINUTE),
(105, 'WD20260910000105', 79, 5, 'route', 3, 176.99, 176.99, DATE_SUB(NOW(), INTERVAL 21 DAY) + INTERVAL 16 HOUR + INTERVAL 18 MINUTE, '', '', DATE_SUB(NOW(), INTERVAL 21 DAY) + INTERVAL 16 HOUR + INTERVAL 18 MINUTE),
(106, 'WD20260910000106', 92, 5, 'goods', 2, 1033.99, 1033.99, DATE_SUB(NOW(), INTERVAL 29 DAY) + INTERVAL 16 HOUR + INTERVAL 50 MINUTE, '', '请用苗族特色包装', DATE_SUB(NOW(), INTERVAL 29 DAY) + INTERVAL 16 HOUR + INTERVAL 50 MINUTE),
(107, 'WD20260910000107', 90, 5, 'ticket', 5, 843.99, 843.99, DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 8 HOUR + INTERVAL 33 MINUTE, '', '', DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 8 HOUR + INTERVAL 33 MINUTE),
(108, 'WD20260910000108', 53, 5, 'route', 7, 1485.99, 1485.99, DATE_SUB(NOW(), INTERVAL 14 DAY) + INTERVAL 8 HOUR + INTERVAL 7 MINUTE, '', '送到时电话联系', DATE_SUB(NOW(), INTERVAL 14 DAY) + INTERVAL 8 HOUR + INTERVAL 7 MINUTE),
(109, 'WD20260910000109', 91, 3, 'ticket', 3, 1382.99, 1382.99, DATE_SUB(NOW(), INTERVAL 14 DAY) + INTERVAL 10 HOUR + INTERVAL 33 MINUTE, '', '请用苗族特色包装', DATE_SUB(NOW(), INTERVAL 14 DAY) + INTERVAL 10 HOUR + INTERVAL 33 MINUTE),
(110, 'WD20260910000110', 100, 4, 'route', 1, 152.99, 152.99, DATE_SUB(NOW(), INTERVAL 15 DAY) + INTERVAL 9 HOUR + INTERVAL 36 MINUTE, '', '希望能看到银饰锻制演示', DATE_SUB(NOW(), INTERVAL 15 DAY) + INTERVAL 9 HOUR + INTERVAL 36 MINUTE),
(111, 'WD20260910000111', 41, 3, 'meal', 6, 1089.99, 1089.99, DATE_SUB(NOW(), INTERVAL 21 DAY) + INTERVAL 16 HOUR + INTERVAL 25 MINUTE, '', '需要加一副碗筷', DATE_SUB(NOW(), INTERVAL 21 DAY) + INTERVAL 16 HOUR + INTERVAL 25 MINUTE),
(112, 'WD20260910000112', 109, 6, 'meal', 5, 68.99, 68.99, DATE_SUB(NOW(), INTERVAL 21 DAY) + INTERVAL 9 HOUR + INTERVAL 24 MINUTE, '', '需要加一副碗筷', DATE_SUB(NOW(), INTERVAL 21 DAY) + INTERVAL 9 HOUR + INTERVAL 24 MINUTE),
(113, 'WD20260910000113', 103, 4, 'hotel', 5, 860.99, 860.99, DATE_SUB(NOW(), INTERVAL 18 DAY) + INTERVAL 8 HOUR + INTERVAL 20 MINUTE, '', '无', DATE_SUB(NOW(), INTERVAL 18 DAY) + INTERVAL 8 HOUR + INTERVAL 20 MINUTE),
(114, 'WD20260910000114', 23, 6, 'hotel', 4, 1347.99, 1347.99, DATE_SUB(NOW(), INTERVAL 27 DAY) + INTERVAL 21 HOUR + INTERVAL 23 MINUTE, '', '请帮忙打包好', DATE_SUB(NOW(), INTERVAL 27 DAY) + INTERVAL 21 HOUR + INTERVAL 23 MINUTE),
(115, 'WD20260910000115', 64, 5, 'route', 1, 144.99, 144.99, DATE_SUB(NOW(), INTERVAL 6 DAY) + INTERVAL 9 HOUR + INTERVAL 20 MINUTE, '', '无', DATE_SUB(NOW(), INTERVAL 6 DAY) + INTERVAL 9 HOUR + INTERVAL 20 MINUTE),
(116, 'WD20260910000116', 105, 5, 'ticket', 4, 1324.99, 1324.99, DATE_SUB(NOW(), INTERVAL 11 DAY) + INTERVAL 20 HOUR + INTERVAL 33 MINUTE, '', '请帮忙打包好', DATE_SUB(NOW(), INTERVAL 11 DAY) + INTERVAL 20 HOUR + INTERVAL 33 MINUTE),
(117, 'WD20260910000117', 29, 5, 'goods', 3, 851.99, 851.99, DATE_SUB(NOW(), INTERVAL 23 DAY) + INTERVAL 19 HOUR + INTERVAL 19 MINUTE, '', '需要加一副碗筷', DATE_SUB(NOW(), INTERVAL 23 DAY) + INTERVAL 19 HOUR + INTERVAL 19 MINUTE),
(118, 'WD20260910000118', 83, 6, 'goods', 6, 867.99, 867.99, DATE_SUB(NOW(), INTERVAL 21 DAY) + INTERVAL 11 HOUR + INTERVAL 54 MINUTE, '', '', DATE_SUB(NOW(), INTERVAL 21 DAY) + INTERVAL 11 HOUR + INTERVAL 54 MINUTE),
(119, 'WD20260910000119', 97, 6, 'route', 1, 882.99, 882.99, DATE_SUB(NOW(), INTERVAL 23 DAY) + INTERVAL 14 HOUR + INTERVAL 43 MINUTE, '', '小孩一起用餐，需要儿童椅', DATE_SUB(NOW(), INTERVAL 23 DAY) + INTERVAL 14 HOUR + INTERVAL 43 MINUTE),
(120, 'WD20260910000120', 99, 3, 'meal', 6, 755.99, 755.99, DATE_SUB(NOW(), INTERVAL 2 DAY) + INTERVAL 13 HOUR + INTERVAL 44 MINUTE, '', '请帮忙打包好', DATE_SUB(NOW(), INTERVAL 2 DAY) + INTERVAL 13 HOUR + INTERVAL 44 MINUTE),
(121, 'WD20260910000121', 70, 4, 'ticket', 1, 896.99, 896.99, DATE_SUB(NOW(), INTERVAL 7 DAY) + INTERVAL 17 HOUR + INTERVAL 55 MINUTE, '', '无', DATE_SUB(NOW(), INTERVAL 7 DAY) + INTERVAL 17 HOUR + INTERVAL 55 MINUTE),
(122, 'WD20260910000122', 77, 6, 'ticket', 1, 809.99, 809.99, DATE_SUB(NOW(), INTERVAL 14 DAY) + INTERVAL 12 HOUR + INTERVAL 2 MINUTE, '', '希望能看到银饰锻制演示', DATE_SUB(NOW(), INTERVAL 14 DAY) + INTERVAL 12 HOUR + INTERVAL 2 MINUTE),
(123, 'WD20260910000123', 47, 5, 'route', 1, 1285.99, 1285.99, DATE_SUB(NOW(), INTERVAL 27 DAY) + INTERVAL 16 HOUR + INTERVAL 8 MINUTE, '', '', DATE_SUB(NOW(), INTERVAL 27 DAY) + INTERVAL 16 HOUR + INTERVAL 8 MINUTE),
(124, 'WD20260910000124', 41, 5, 'goods', 1, 651.99, 651.99, DATE_SUB(NOW(), INTERVAL 23 DAY) + INTERVAL 16 HOUR + INTERVAL 48 MINUTE, '', '', DATE_SUB(NOW(), INTERVAL 23 DAY) + INTERVAL 16 HOUR + INTERVAL 48 MINUTE),
(125, 'WD20260910000125', 33, 4, 'meal', 3, 1195.99, 1195.99, DATE_SUB(NOW(), INTERVAL 8 DAY) + INTERVAL 9 HOUR + INTERVAL 49 MINUTE, '', '小孩一起用餐，需要儿童椅', DATE_SUB(NOW(), INTERVAL 8 DAY) + INTERVAL 9 HOUR + INTERVAL 49 MINUTE),
(126, 'WD20260910000126', 47, 4, 'route', 4, 1472.99, 1472.99, DATE_SUB(NOW(), INTERVAL 3 DAY) + INTERVAL 16 HOUR + INTERVAL 51 MINUTE, '', '小孩一起用餐，需要儿童椅', DATE_SUB(NOW(), INTERVAL 3 DAY) + INTERVAL 16 HOUR + INTERVAL 51 MINUTE),
(127, 'WD20260910000127', 46, 5, 'ticket', 2, 1150.99, 1150.99, DATE_SUB(NOW(), INTERVAL 27 DAY) + INTERVAL 16 HOUR + INTERVAL 15 MINUTE, '', '', DATE_SUB(NOW(), INTERVAL 27 DAY) + INTERVAL 16 HOUR + INTERVAL 15 MINUTE),
(128, 'WD20260910000128', 19, 6, 'ticket', 4, 205.99, 205.99, DATE_SUB(NOW(), INTERVAL 16 DAY) + INTERVAL 20 HOUR + INTERVAL 47 MINUTE, '', '需要加一副碗筷', DATE_SUB(NOW(), INTERVAL 16 DAY) + INTERVAL 20 HOUR + INTERVAL 47 MINUTE),
(129, 'WD20260910000129', 11, 4, 'route', 4, 1463.99, 1463.99, DATE_SUB(NOW(), INTERVAL 7 DAY) + INTERVAL 21 HOUR + INTERVAL 18 MINUTE, '', '请用苗族特色包装', DATE_SUB(NOW(), INTERVAL 7 DAY) + INTERVAL 21 HOUR + INTERVAL 18 MINUTE),
(130, 'WD20260910000130', 61, 6, 'goods', 4, 693.99, 693.99, DATE_SUB(NOW(), INTERVAL 17 DAY) + INTERVAL 9 HOUR + INTERVAL 49 MINUTE, '', '小孩一起用餐，需要儿童椅', DATE_SUB(NOW(), INTERVAL 17 DAY) + INTERVAL 9 HOUR + INTERVAL 49 MINUTE),
(131, 'WD20260910000131', 23, 3, 'route', 1, 601.99, 601.99, DATE_SUB(NOW(), INTERVAL 15 DAY) + INTERVAL 20 HOUR + INTERVAL 27 MINUTE, '', '小孩一起用餐，需要儿童椅', DATE_SUB(NOW(), INTERVAL 15 DAY) + INTERVAL 20 HOUR + INTERVAL 27 MINUTE),
(132, 'WD20260910000132', 93, 6, 'route', 4, 223.99, 223.99, DATE_SUB(NOW(), INTERVAL 16 DAY) + INTERVAL 15 HOUR + INTERVAL 31 MINUTE, '', '送到时电话联系', DATE_SUB(NOW(), INTERVAL 16 DAY) + INTERVAL 15 HOUR + INTERVAL 31 MINUTE),
(133, 'WD20260910000133', 94, 6, 'goods', 2, 1498.99, 1498.99, DATE_SUB(NOW(), INTERVAL 17 DAY) + INTERVAL 20 HOUR + INTERVAL 42 MINUTE, '', '请用苗族特色包装', DATE_SUB(NOW(), INTERVAL 17 DAY) + INTERVAL 20 HOUR + INTERVAL 42 MINUTE),
(134, 'WD20260910000134', 78, 5, 'ticket', 5, 244.99, 244.99, DATE_SUB(NOW(), INTERVAL 9 DAY) + INTERVAL 17 HOUR + INTERVAL 58 MINUTE, '', '需要加一副碗筷', DATE_SUB(NOW(), INTERVAL 9 DAY) + INTERVAL 17 HOUR + INTERVAL 58 MINUTE),
(135, 'WD20260910000135', 21, 3, 'hotel', 1, 1219.99, 1219.99, DATE_SUB(NOW(), INTERVAL 14 DAY) + INTERVAL 14 HOUR + INTERVAL 41 MINUTE, '', '希望能看到银饰锻制演示', DATE_SUB(NOW(), INTERVAL 14 DAY) + INTERVAL 14 HOUR + INTERVAL 41 MINUTE),
(136, 'WD20260910000136', 55, 6, 'goods', 4, 490.99, 490.99, DATE_SUB(NOW(), INTERVAL 2 DAY) + INTERVAL 17 HOUR + INTERVAL 23 MINUTE, '', '需要加一副碗筷', DATE_SUB(NOW(), INTERVAL 2 DAY) + INTERVAL 17 HOUR + INTERVAL 23 MINUTE),
(137, 'WD20260910000137', 62, 4, 'meal', 3, 893.99, 893.99, DATE_SUB(NOW(), INTERVAL 25 DAY) + INTERVAL 20 HOUR + INTERVAL 57 MINUTE, '', '需要加一副碗筷', DATE_SUB(NOW(), INTERVAL 25 DAY) + INTERVAL 20 HOUR + INTERVAL 57 MINUTE),
(138, 'WD20260910000138', 41, 4, 'goods', 7, 1037.99, 1037.99, DATE_SUB(NOW(), INTERVAL 12 DAY) + INTERVAL 17 HOUR + INTERVAL 7 MINUTE, '', '需要加一副碗筷', DATE_SUB(NOW(), INTERVAL 12 DAY) + INTERVAL 17 HOUR + INTERVAL 7 MINUTE),
(139, 'WD20260910000139', 68, 3, 'ticket', 4, 1168.99, 1168.99, DATE_SUB(NOW(), INTERVAL 22 DAY) + INTERVAL 12 HOUR + INTERVAL 17 MINUTE, '', '', DATE_SUB(NOW(), INTERVAL 22 DAY) + INTERVAL 12 HOUR + INTERVAL 17 MINUTE),
(140, 'WD20260910000140', 92, 4, 'goods', 6, 795.99, 795.99, DATE_SUB(NOW(), INTERVAL 18 DAY) + INTERVAL 19 HOUR + INTERVAL 9 MINUTE, '', '小孩一起用餐，需要儿童椅', DATE_SUB(NOW(), INTERVAL 18 DAY) + INTERVAL 19 HOUR + INTERVAL 9 MINUTE),
(141, 'WD20260910000141', 41, 3, 'ticket', 4, 288.99, 288.99, DATE_SUB(NOW(), INTERVAL 24 DAY) + INTERVAL 17 HOUR + INTERVAL 25 MINUTE, '', '行李较多，请商家联系', DATE_SUB(NOW(), INTERVAL 24 DAY) + INTERVAL 17 HOUR + INTERVAL 25 MINUTE),
(142, 'WD20260910000142', 44, 6, 'ticket', 1, 554.99, 554.99, DATE_SUB(NOW(), INTERVAL 15 DAY) + INTERVAL 22 HOUR + INTERVAL 31 MINUTE, '', '送到时电话联系', DATE_SUB(NOW(), INTERVAL 15 DAY) + INTERVAL 22 HOUR + INTERVAL 31 MINUTE),
(143, 'WD20260910000143', 97, 6, 'ticket', 6, 1040.99, 1040.99, DATE_SUB(NOW(), INTERVAL 6 DAY) + INTERVAL 18 HOUR + INTERVAL 33 MINUTE, '', '', DATE_SUB(NOW(), INTERVAL 6 DAY) + INTERVAL 18 HOUR + INTERVAL 33 MINUTE),
(144, 'WD20260910000144', 25, 3, 'goods', 2, 901.99, 901.99, DATE_SUB(NOW(), INTERVAL 7 DAY) + INTERVAL 15 HOUR + INTERVAL 53 MINUTE, '', '请帮忙打包好', DATE_SUB(NOW(), INTERVAL 7 DAY) + INTERVAL 15 HOUR + INTERVAL 53 MINUTE),
(145, 'WD20260910000145', 89, 4, 'goods', 7, 548.99, 548.99, DATE_SUB(NOW(), INTERVAL 5 DAY) + INTERVAL 20 HOUR + INTERVAL 12 MINUTE, '', '无', DATE_SUB(NOW(), INTERVAL 5 DAY) + INTERVAL 20 HOUR + INTERVAL 12 MINUTE),
(146, 'WD20260910000146', 55, 5, 'route', 7, 380.99, 380.99, DATE_SUB(NOW(), INTERVAL 14 DAY) + INTERVAL 19 HOUR + INTERVAL 37 MINUTE, '', '', DATE_SUB(NOW(), INTERVAL 14 DAY) + INTERVAL 19 HOUR + INTERVAL 37 MINUTE),
(147, 'WD20260910000147', 88, 6, 'meal', 4, 381.99, 381.99, DATE_SUB(NOW(), INTERVAL 7 DAY) + INTERVAL 15 HOUR + INTERVAL 17 MINUTE, '', '希望能看到银饰锻制演示', DATE_SUB(NOW(), INTERVAL 7 DAY) + INTERVAL 15 HOUR + INTERVAL 17 MINUTE),
(148, 'WD20260910000148', 67, 5, 'ticket', 1, 315.99, 315.99, DATE_SUB(NOW(), INTERVAL 14 DAY) + INTERVAL 13 HOUR + INTERVAL 46 MINUTE, '', '希望能看到银饰锻制演示', DATE_SUB(NOW(), INTERVAL 14 DAY) + INTERVAL 13 HOUR + INTERVAL 46 MINUTE),
(149, 'WD20260910000149', 101, 4, 'ticket', 5, 604.99, 604.99, DATE_SUB(NOW(), INTERVAL 12 DAY) + INTERVAL 15 HOUR + INTERVAL 27 MINUTE, '', '请帮忙打包好', DATE_SUB(NOW(), INTERVAL 12 DAY) + INTERVAL 15 HOUR + INTERVAL 27 MINUTE),
(150, 'WD20260910000150', 14, 3, 'goods', 4, 550.99, 550.99, DATE_SUB(NOW(), INTERVAL 22 DAY) + INTERVAL 22 HOUR + INTERVAL 38 MINUTE, '', '行李较多，请商家联系', DATE_SUB(NOW(), INTERVAL 22 DAY) + INTERVAL 22 HOUR + INTERVAL 38 MINUTE),
(151, 'WD20260910000151', 102, 5, 'goods', 1, 1337.99, 1337.99, DATE_SUB(NOW(), INTERVAL 12 DAY) + INTERVAL 16 HOUR + INTERVAL 30 MINUTE, '', '', DATE_SUB(NOW(), INTERVAL 12 DAY) + INTERVAL 16 HOUR + INTERVAL 30 MINUTE),
(152, 'WD20260910000152', 29, 3, 'goods', 1, 1446.99, 1446.99, DATE_SUB(NOW(), INTERVAL 25 DAY) + INTERVAL 21 HOUR + INTERVAL 37 MINUTE, '', '需要加一副碗筷', DATE_SUB(NOW(), INTERVAL 25 DAY) + INTERVAL 21 HOUR + INTERVAL 37 MINUTE),
(153, 'WD20260910000153', 97, 3, 'route', 7, 844.99, 844.99, DATE_SUB(NOW(), INTERVAL 4 DAY) + INTERVAL 15 HOUR + INTERVAL 23 MINUTE, '', '请帮忙送到景区门口', DATE_SUB(NOW(), INTERVAL 4 DAY) + INTERVAL 15 HOUR + INTERVAL 23 MINUTE),
(154, 'WD20260910000154', 29, 4, 'ticket', 2, 1046.99, 1046.99, DATE_SUB(NOW(), INTERVAL 24 DAY) + INTERVAL 21 HOUR + INTERVAL 14 MINUTE, '', '请用苗族特色包装', DATE_SUB(NOW(), INTERVAL 24 DAY) + INTERVAL 21 HOUR + INTERVAL 14 MINUTE),
(155, 'WD20260910000155', 55, 5, 'hotel', 3, 303.99, 303.99, DATE_SUB(NOW(), INTERVAL 7 DAY) + INTERVAL 11 HOUR + INTERVAL 0 MINUTE, '', '需要加一副碗筷', DATE_SUB(NOW(), INTERVAL 7 DAY) + INTERVAL 11 HOUR + INTERVAL 0 MINUTE),
(156, 'WD20260910000156', 97, 5, 'goods', 7, 1487.99, 1487.99, DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 22 HOUR + INTERVAL 19 MINUTE, '', '无', DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 22 HOUR + INTERVAL 19 MINUTE),
(157, 'WD20260910000157', 55, 3, 'route', 2, 1291.99, 1291.99, DATE_SUB(NOW(), INTERVAL 29 DAY) + INTERVAL 17 HOUR + INTERVAL 4 MINUTE, '', '行李较多，请商家联系', DATE_SUB(NOW(), INTERVAL 29 DAY) + INTERVAL 17 HOUR + INTERVAL 4 MINUTE),
(158, 'WD20260910000158', 69, 3, 'route', 4, 1083.99, 1083.99, DATE_SUB(NOW(), INTERVAL 27 DAY) + INTERVAL 8 HOUR + INTERVAL 30 MINUTE, '', '送到时电话联系', DATE_SUB(NOW(), INTERVAL 27 DAY) + INTERVAL 8 HOUR + INTERVAL 30 MINUTE),
(159, 'WD20260910000159', 27, 6, 'hotel', 3, 335.99, 335.99, DATE_SUB(NOW(), INTERVAL 2 DAY) + INTERVAL 22 HOUR + INTERVAL 0 MINUTE, '', '请帮忙打包好', DATE_SUB(NOW(), INTERVAL 2 DAY) + INTERVAL 22 HOUR + INTERVAL 0 MINUTE),
(160, 'WD20260910000160', 42, 6, 'hotel', 2, 1257.99, 1257.99, DATE_SUB(NOW(), INTERVAL 3 DAY) + INTERVAL 22 HOUR + INTERVAL 15 MINUTE, '', '无', DATE_SUB(NOW(), INTERVAL 3 DAY) + INTERVAL 22 HOUR + INTERVAL 15 MINUTE),
(161, 'WD20260910000161', 25, 3, 'ticket', 5, 1091.99, 1091.99, DATE_SUB(NOW(), INTERVAL 20 DAY) + INTERVAL 22 HOUR + INTERVAL 49 MINUTE, '', '', DATE_SUB(NOW(), INTERVAL 20 DAY) + INTERVAL 22 HOUR + INTERVAL 49 MINUTE),
(162, 'WD20260910000162', 50, 6, 'hotel', 4, 1386.99, 1386.99, DATE_SUB(NOW(), INTERVAL 21 DAY) + INTERVAL 17 HOUR + INTERVAL 23 MINUTE, '', '送到时电话联系', DATE_SUB(NOW(), INTERVAL 21 DAY) + INTERVAL 17 HOUR + INTERVAL 23 MINUTE),
(163, 'WD20260910000163', 36, 6, 'hotel', 2, 233.99, 233.99, DATE_SUB(NOW(), INTERVAL 4 DAY) + INTERVAL 19 HOUR + INTERVAL 55 MINUTE, '', '无', DATE_SUB(NOW(), INTERVAL 4 DAY) + INTERVAL 19 HOUR + INTERVAL 55 MINUTE),
(164, 'WD20260910000164', 42, 5, 'meal', 7, 777.99, 777.99, DATE_SUB(NOW(), INTERVAL 26 DAY) + INTERVAL 12 HOUR + INTERVAL 23 MINUTE, '', '', DATE_SUB(NOW(), INTERVAL 26 DAY) + INTERVAL 12 HOUR + INTERVAL 23 MINUTE),
(165, 'WD20260910000165', 20, 3, 'goods', 6, 1256.99, 1256.99, DATE_SUB(NOW(), INTERVAL 8 DAY) + INTERVAL 8 HOUR + INTERVAL 8 MINUTE, '', '', DATE_SUB(NOW(), INTERVAL 8 DAY) + INTERVAL 8 HOUR + INTERVAL 8 MINUTE),
(166, 'WD20260910000166', 88, 3, 'meal', 1, 194.99, 194.99, DATE_SUB(NOW(), INTERVAL 23 DAY) + INTERVAL 19 HOUR + INTERVAL 42 MINUTE, '', '小孩一起用餐，需要儿童椅', DATE_SUB(NOW(), INTERVAL 23 DAY) + INTERVAL 19 HOUR + INTERVAL 42 MINUTE),
(167, 'WD20260910000167', 68, 3, 'meal', 5, 1262.99, 1262.99, DATE_SUB(NOW(), INTERVAL 12 DAY) + INTERVAL 22 HOUR + INTERVAL 1 MINUTE, '', '希望能看到银饰锻制演示', DATE_SUB(NOW(), INTERVAL 12 DAY) + INTERVAL 22 HOUR + INTERVAL 1 MINUTE),
(168, 'WD20260910000168', 93, 5, 'route', 3, 859.99, 859.99, DATE_SUB(NOW(), INTERVAL 14 DAY) + INTERVAL 9 HOUR + INTERVAL 20 MINUTE, '', '需要加一副碗筷', DATE_SUB(NOW(), INTERVAL 14 DAY) + INTERVAL 9 HOUR + INTERVAL 20 MINUTE),
(169, 'WD20260910000169', 77, 3, 'route', 1, 682.99, 682.99, DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 12 HOUR + INTERVAL 7 MINUTE, '', '需要加一副碗筷', DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 12 HOUR + INTERVAL 7 MINUTE),
(170, 'WD20260910000170', 28, 5, 'goods', 1, 1204.99, 1204.99, DATE_SUB(NOW(), INTERVAL 0 DAY) + INTERVAL 20 HOUR + INTERVAL 13 MINUTE, '', '', DATE_SUB(NOW(), INTERVAL 0 DAY) + INTERVAL 20 HOUR + INTERVAL 13 MINUTE),
(171, 'WD20260910000171', 56, 3, 'goods', 3, 748.99, 748.99, DATE_SUB(NOW(), INTERVAL 2 DAY) + INTERVAL 22 HOUR + INTERVAL 1 MINUTE, '', '需要加一副碗筷', DATE_SUB(NOW(), INTERVAL 2 DAY) + INTERVAL 22 HOUR + INTERVAL 1 MINUTE),
(172, 'WD20260910000172', 29, 6, 'route', 5, 1034.99, 1034.99, DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 10 HOUR + INTERVAL 46 MINUTE, '', '请帮忙送到景区门口', DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 10 HOUR + INTERVAL 46 MINUTE),
(173, 'WD20260910000173', 106, 6, 'hotel', 2, 907.99, 907.99, DATE_SUB(NOW(), INTERVAL 13 DAY) + INTERVAL 13 HOUR + INTERVAL 24 MINUTE, '', '无', DATE_SUB(NOW(), INTERVAL 13 DAY) + INTERVAL 13 HOUR + INTERVAL 24 MINUTE),
(174, 'WD20260910000174', 72, 3, 'goods', 3, 132.99, 132.99, DATE_SUB(NOW(), INTERVAL 13 DAY) + INTERVAL 8 HOUR + INTERVAL 37 MINUTE, '', '无', DATE_SUB(NOW(), INTERVAL 13 DAY) + INTERVAL 8 HOUR + INTERVAL 37 MINUTE),
(175, 'WD20260910000175', 44, 6, 'ticket', 1, 80.99, 80.99, DATE_SUB(NOW(), INTERVAL 18 DAY) + INTERVAL 19 HOUR + INTERVAL 15 MINUTE, '', '小孩一起用餐，需要儿童椅', DATE_SUB(NOW(), INTERVAL 18 DAY) + INTERVAL 19 HOUR + INTERVAL 15 MINUTE),
(176, 'WD20260910000176', 101, 3, 'ticket', 1, 1319.99, 1319.99, DATE_SUB(NOW(), INTERVAL 18 DAY) + INTERVAL 22 HOUR + INTERVAL 10 MINUTE, '', '需要加一副碗筷', DATE_SUB(NOW(), INTERVAL 18 DAY) + INTERVAL 22 HOUR + INTERVAL 10 MINUTE),
(177, 'WD20260910000177', 51, 5, 'goods', 6, 136.99, 136.99, DATE_SUB(NOW(), INTERVAL 22 DAY) + INTERVAL 10 HOUR + INTERVAL 55 MINUTE, '', '请帮忙送到景区门口', DATE_SUB(NOW(), INTERVAL 22 DAY) + INTERVAL 10 HOUR + INTERVAL 55 MINUTE),
(178, 'WD20260910000178', 44, 5, 'goods', 5, 1287.99, 1287.99, DATE_SUB(NOW(), INTERVAL 15 DAY) + INTERVAL 13 HOUR + INTERVAL 5 MINUTE, '', '希望能看到银饰锻制演示', DATE_SUB(NOW(), INTERVAL 15 DAY) + INTERVAL 13 HOUR + INTERVAL 5 MINUTE),
(179, 'WD20260910000179', 106, 4, 'hotel', 4, 339.99, 339.99, DATE_SUB(NOW(), INTERVAL 23 DAY) + INTERVAL 22 HOUR + INTERVAL 54 MINUTE, '', '', DATE_SUB(NOW(), INTERVAL 23 DAY) + INTERVAL 22 HOUR + INTERVAL 54 MINUTE),
(180, 'WD20260910000180', 87, 6, 'meal', 2, 1315.99, 1315.99, DATE_SUB(NOW(), INTERVAL 24 DAY) + INTERVAL 12 HOUR + INTERVAL 41 MINUTE, '', '小孩一起用餐，需要儿童椅', DATE_SUB(NOW(), INTERVAL 24 DAY) + INTERVAL 12 HOUR + INTERVAL 41 MINUTE),
(181, 'WD20260910000181', 68, 5, 'meal', 2, 668.99, 668.99, DATE_SUB(NOW(), INTERVAL 12 DAY) + INTERVAL 11 HOUR + INTERVAL 28 MINUTE, '', '请帮忙送到景区门口', DATE_SUB(NOW(), INTERVAL 12 DAY) + INTERVAL 11 HOUR + INTERVAL 28 MINUTE),
(182, 'WD20260910000182', 41, 6, 'hotel', 4, 1229.99, 1229.99, DATE_SUB(NOW(), INTERVAL 28 DAY) + INTERVAL 20 HOUR + INTERVAL 12 MINUTE, '', '请帮忙送到景区门口', DATE_SUB(NOW(), INTERVAL 28 DAY) + INTERVAL 20 HOUR + INTERVAL 12 MINUTE),
(183, 'WD20260910000183', 79, 3, 'goods', 4, 1346.99, 1346.99, DATE_SUB(NOW(), INTERVAL 28 DAY) + INTERVAL 13 HOUR + INTERVAL 21 MINUTE, '', '', DATE_SUB(NOW(), INTERVAL 28 DAY) + INTERVAL 13 HOUR + INTERVAL 21 MINUTE),
(184, 'WD20260910000184', 10, 6, 'hotel', 4, 1002.99, 1002.99, DATE_SUB(NOW(), INTERVAL 10 DAY) + INTERVAL 9 HOUR + INTERVAL 17 MINUTE, '', '行李较多，请商家联系', DATE_SUB(NOW(), INTERVAL 10 DAY) + INTERVAL 9 HOUR + INTERVAL 17 MINUTE),
(185, 'WD20260910000185', 47, 6, 'route', 2, 1152.99, 1152.99, DATE_SUB(NOW(), INTERVAL 28 DAY) + INTERVAL 19 HOUR + INTERVAL 23 MINUTE, '', '请帮忙打包好', DATE_SUB(NOW(), INTERVAL 28 DAY) + INTERVAL 19 HOUR + INTERVAL 23 MINUTE),
(186, 'WD20260910000186', 61, 6, 'goods', 6, 177.99, 177.99, DATE_SUB(NOW(), INTERVAL 19 DAY) + INTERVAL 20 HOUR + INTERVAL 5 MINUTE, '', '请帮忙打包好', DATE_SUB(NOW(), INTERVAL 19 DAY) + INTERVAL 20 HOUR + INTERVAL 5 MINUTE),
(187, 'WD20260910000187', 63, 6, 'ticket', 5, 1465.99, 1465.99, DATE_SUB(NOW(), INTERVAL 21 DAY) + INTERVAL 9 HOUR + INTERVAL 31 MINUTE, '', '', DATE_SUB(NOW(), INTERVAL 21 DAY) + INTERVAL 9 HOUR + INTERVAL 31 MINUTE),
(188, 'WD20260910000188', 108, 3, 'goods', 7, 583.99, 583.99, DATE_SUB(NOW(), INTERVAL 23 DAY) + INTERVAL 11 HOUR + INTERVAL 53 MINUTE, '', '小孩一起用餐，需要儿童椅', DATE_SUB(NOW(), INTERVAL 23 DAY) + INTERVAL 11 HOUR + INTERVAL 53 MINUTE),
(189, 'WD20260910000189', 86, 4, 'goods', 7, 923.99, 923.99, DATE_SUB(NOW(), INTERVAL 2 DAY) + INTERVAL 11 HOUR + INTERVAL 10 MINUTE, '', '行李较多，请商家联系', DATE_SUB(NOW(), INTERVAL 2 DAY) + INTERVAL 11 HOUR + INTERVAL 10 MINUTE),
(190, 'WD20260910000190', 88, 3, 'hotel', 4, 1250.99, 1250.99, DATE_SUB(NOW(), INTERVAL 20 DAY) + INTERVAL 12 HOUR + INTERVAL 28 MINUTE, '', '请用苗族特色包装', DATE_SUB(NOW(), INTERVAL 20 DAY) + INTERVAL 12 HOUR + INTERVAL 28 MINUTE),
(191, 'WD20260910000191', 41, 3, 'goods', 6, 949.99, 949.99, DATE_SUB(NOW(), INTERVAL 13 DAY) + INTERVAL 11 HOUR + INTERVAL 45 MINUTE, '', '需要加一副碗筷', DATE_SUB(NOW(), INTERVAL 13 DAY) + INTERVAL 11 HOUR + INTERVAL 45 MINUTE),
(192, 'WD20260910000192', 70, 3, 'hotel', 7, 1140.99, 1140.99, DATE_SUB(NOW(), INTERVAL 20 DAY) + INTERVAL 13 HOUR + INTERVAL 47 MINUTE, '', '行李较多，请商家联系', DATE_SUB(NOW(), INTERVAL 20 DAY) + INTERVAL 13 HOUR + INTERVAL 47 MINUTE),
(193, 'WD20260910000193', 66, 6, 'hotel', 6, 888.99, 888.99, DATE_SUB(NOW(), INTERVAL 29 DAY) + INTERVAL 20 HOUR + INTERVAL 39 MINUTE, '', '行李较多，请商家联系', DATE_SUB(NOW(), INTERVAL 29 DAY) + INTERVAL 20 HOUR + INTERVAL 39 MINUTE),
(194, 'WD20260910000194', 30, 3, 'goods', 5, 528.99, 528.99, DATE_SUB(NOW(), INTERVAL 7 DAY) + INTERVAL 17 HOUR + INTERVAL 42 MINUTE, '', '请用苗族特色包装', DATE_SUB(NOW(), INTERVAL 7 DAY) + INTERVAL 17 HOUR + INTERVAL 42 MINUTE),
(195, 'WD20260910000195', 18, 3, 'hotel', 6, 465.99, 465.99, DATE_SUB(NOW(), INTERVAL 26 DAY) + INTERVAL 8 HOUR + INTERVAL 43 MINUTE, '', '', DATE_SUB(NOW(), INTERVAL 26 DAY) + INTERVAL 8 HOUR + INTERVAL 43 MINUTE),
(196, 'WD20260910000196', 56, 6, 'ticket', 4, 1151.99, 1151.99, DATE_SUB(NOW(), INTERVAL 23 DAY) + INTERVAL 15 HOUR + INTERVAL 26 MINUTE, '', '请帮忙送到景区门口', DATE_SUB(NOW(), INTERVAL 23 DAY) + INTERVAL 15 HOUR + INTERVAL 26 MINUTE),
(197, 'WD20260910000197', 70, 3, 'ticket', 1, 1498.99, 1498.99, DATE_SUB(NOW(), INTERVAL 3 DAY) + INTERVAL 17 HOUR + INTERVAL 22 MINUTE, '', '请帮忙打包好', DATE_SUB(NOW(), INTERVAL 3 DAY) + INTERVAL 17 HOUR + INTERVAL 22 MINUTE),
(198, 'WD20260910000198', 13, 4, 'meal', 1, 601.99, 601.99, DATE_SUB(NOW(), INTERVAL 19 DAY) + INTERVAL 9 HOUR + INTERVAL 12 MINUTE, '', '需要加一副碗筷', DATE_SUB(NOW(), INTERVAL 19 DAY) + INTERVAL 9 HOUR + INTERVAL 12 MINUTE),
(199, 'WD20260910000199', 48, 5, 'ticket', 3, 1439.99, 1439.99, DATE_SUB(NOW(), INTERVAL 23 DAY) + INTERVAL 18 HOUR + INTERVAL 25 MINUTE, '', '请帮忙打包好', DATE_SUB(NOW(), INTERVAL 23 DAY) + INTERVAL 18 HOUR + INTERVAL 25 MINUTE),
(200, 'WD20260910000200', 17, 4, 'goods', 5, 732.99, 732.99, DATE_SUB(NOW(), INTERVAL 28 DAY) + INTERVAL 11 HOUR + INTERVAL 33 MINUTE, '', '希望能看到银饰锻制演示', DATE_SUB(NOW(), INTERVAL 28 DAY) + INTERVAL 11 HOUR + INTERVAL 33 MINUTE);

-- 订单项（仅 goods 类型）
INSERT INTO t_order_item (order_id, sku_id, title, spec_name, image, price, quantity, shipping_status) VALUES
(102, 5, '苗家特色商品', '标准规格', '/uploads/seeds/product-silver-1.svg', 693.99, 1, 1),
(104, 2, '苗家特色商品', '标准规格', '/uploads/seeds/product-silver-1.svg', 381.99, 1, 0),
(106, 8, '苗家特色商品', '标准规格', '/uploads/seeds/product-silver-1.svg', 1033.99, 1, 0),
(117, 5, '苗家特色商品', '标准规格', '/uploads/seeds/product-silver-1.svg', 851.99, 1, 0),
(118, 1, '苗家特色商品', '标准规格', '/uploads/seeds/product-silver-1.svg', 867.99, 1, 1),
(124, 6, '苗家特色商品', '标准规格', '/uploads/seeds/product-silver-1.svg', 651.99, 1, 0),
(130, 1, '苗家特色商品', '标准规格', '/uploads/seeds/product-silver-1.svg', 693.99, 1, 1),
(133, 7, '苗家特色商品', '标准规格', '/uploads/seeds/product-silver-1.svg', 1498.99, 1, 0),
(136, 5, '苗家特色商品', '标准规格', '/uploads/seeds/product-silver-1.svg', 490.99, 1, 1),
(138, 1, '苗家特色商品', '标准规格', '/uploads/seeds/product-silver-1.svg', 1037.99, 1, 1),
(140, 6, '苗家特色商品', '标准规格', '/uploads/seeds/product-silver-1.svg', 795.99, 1, 1),
(144, 9, '苗家特色商品', '标准规格', '/uploads/seeds/product-silver-1.svg', 901.99, 1, 0),
(145, 3, '苗家特色商品', '标准规格', '/uploads/seeds/product-silver-1.svg', 548.99, 1, 1),
(150, 7, '苗家特色商品', '标准规格', '/uploads/seeds/product-silver-1.svg', 550.99, 1, 1),
(151, 2, '苗家特色商品', '标准规格', '/uploads/seeds/product-silver-1.svg', 1337.99, 1, 0),
(152, 8, '苗家特色商品', '标准规格', '/uploads/seeds/product-silver-1.svg', 1446.99, 1, 0),
(156, 8, '苗家特色商品', '标准规格', '/uploads/seeds/product-silver-1.svg', 1487.99, 1, 1),
(165, 7, '苗家特色商品', '标准规格', '/uploads/seeds/product-silver-1.svg', 1256.99, 1, 1),
(170, 1, '苗家特色商品', '标准规格', '/uploads/seeds/product-silver-1.svg', 1204.99, 1, 0),
(171, 4, '苗家特色商品', '标准规格', '/uploads/seeds/product-silver-1.svg', 748.99, 1, 0),
(174, 6, '苗家特色商品', '标准规格', '/uploads/seeds/product-silver-1.svg', 132.99, 1, 0),
(177, 2, '苗家特色商品', '标准规格', '/uploads/seeds/product-silver-1.svg', 136.99, 1, 1),
(178, 7, '苗家特色商品', '标准规格', '/uploads/seeds/product-silver-1.svg', 1287.99, 1, 1),
(183, 7, '苗家特色商品', '标准规格', '/uploads/seeds/product-silver-1.svg', 1346.99, 1, 1),
(186, 1, '苗家特色商品', '标准规格', '/uploads/seeds/product-silver-1.svg', 177.99, 1, 1),
(188, 1, '苗家特色商品', '标准规格', '/uploads/seeds/product-silver-1.svg', 583.99, 1, 1),
(189, 7, '苗家特色商品', '标准规格', '/uploads/seeds/product-silver-1.svg', 923.99, 1, 1),
(191, 1, '苗家特色商品', '标准规格', '/uploads/seeds/product-silver-1.svg', 949.99, 1, 1),
(194, 1, '苗家特色商品', '标准规格', '/uploads/seeds/product-silver-1.svg', 528.99, 1, 1),
(200, 8, '苗家特色商品', '标准规格', '/uploads/seeds/product-silver-1.svg', 732.99, 1, 1);

-- 支付记录
INSERT INTO t_pay_record (pay_no, order_id, user_id, amount, channel, status, paid_at) VALUES
('PAY0000000103', 103, 47, 276.99, 'mock_wxpay', 1, DATE_SUB(NOW(), INTERVAL 23 DAY) + INTERVAL 13 HOUR + INTERVAL 9 MINUTE),
('PAY0000000104', 104, 56, 381.99, 'mock_wxpay', 1, DATE_SUB(NOW(), INTERVAL 29 DAY) + INTERVAL 20 HOUR + INTERVAL 4 MINUTE),
('PAY0000000105', 105, 79, 176.99, 'mock_wxpay', 1, DATE_SUB(NOW(), INTERVAL 21 DAY) + INTERVAL 16 HOUR + INTERVAL 18 MINUTE),
('PAY0000000106', 106, 92, 1033.99, 'mock_wxpay', 1, DATE_SUB(NOW(), INTERVAL 29 DAY) + INTERVAL 16 HOUR + INTERVAL 50 MINUTE),
('PAY0000000109', 109, 91, 1382.99, 'mock_wxpay', 1, DATE_SUB(NOW(), INTERVAL 14 DAY) + INTERVAL 10 HOUR + INTERVAL 33 MINUTE),
('PAY0000000110', 110, 100, 152.99, 'mock_wxpay', 1, DATE_SUB(NOW(), INTERVAL 15 DAY) + INTERVAL 9 HOUR + INTERVAL 36 MINUTE),
('PAY0000000114', 114, 23, 1347.99, 'mock_wxpay', 1, DATE_SUB(NOW(), INTERVAL 27 DAY) + INTERVAL 21 HOUR + INTERVAL 23 MINUTE),
('PAY0000000115', 115, 64, 144.99, 'mock_wxpay', 1, DATE_SUB(NOW(), INTERVAL 6 DAY) + INTERVAL 9 HOUR + INTERVAL 20 MINUTE),
('PAY0000000116', 116, 105, 1324.99, 'mock_wxpay', 1, DATE_SUB(NOW(), INTERVAL 11 DAY) + INTERVAL 20 HOUR + INTERVAL 33 MINUTE),
('PAY0000000117', 117, 29, 851.99, 'mock_wxpay', 1, DATE_SUB(NOW(), INTERVAL 23 DAY) + INTERVAL 19 HOUR + INTERVAL 19 MINUTE),
('PAY0000000119', 119, 97, 882.99, 'mock_wxpay', 1, DATE_SUB(NOW(), INTERVAL 23 DAY) + INTERVAL 14 HOUR + INTERVAL 43 MINUTE),
('PAY0000000121', 121, 70, 896.99, 'mock_wxpay', 1, DATE_SUB(NOW(), INTERVAL 7 DAY) + INTERVAL 17 HOUR + INTERVAL 55 MINUTE),
('PAY0000000122', 122, 77, 809.99, 'mock_wxpay', 1, DATE_SUB(NOW(), INTERVAL 14 DAY) + INTERVAL 12 HOUR + INTERVAL 2 MINUTE),
('PAY0000000123', 123, 47, 1285.99, 'mock_wxpay', 1, DATE_SUB(NOW(), INTERVAL 27 DAY) + INTERVAL 16 HOUR + INTERVAL 8 MINUTE),
('PAY0000000124', 124, 41, 651.99, 'mock_wxpay', 1, DATE_SUB(NOW(), INTERVAL 23 DAY) + INTERVAL 16 HOUR + INTERVAL 48 MINUTE),
('PAY0000000125', 125, 33, 1195.99, 'mock_wxpay', 1, DATE_SUB(NOW(), INTERVAL 8 DAY) + INTERVAL 9 HOUR + INTERVAL 49 MINUTE),
('PAY0000000126', 126, 47, 1472.99, 'mock_wxpay', 1, DATE_SUB(NOW(), INTERVAL 3 DAY) + INTERVAL 16 HOUR + INTERVAL 51 MINUTE),
('PAY0000000127', 127, 46, 1150.99, 'mock_wxpay', 1, DATE_SUB(NOW(), INTERVAL 27 DAY) + INTERVAL 16 HOUR + INTERVAL 15 MINUTE),
('PAY0000000128', 128, 19, 205.99, 'mock_wxpay', 1, DATE_SUB(NOW(), INTERVAL 16 DAY) + INTERVAL 20 HOUR + INTERVAL 47 MINUTE),
('PAY0000000129', 129, 11, 1463.99, 'mock_wxpay', 1, DATE_SUB(NOW(), INTERVAL 7 DAY) + INTERVAL 21 HOUR + INTERVAL 18 MINUTE),
('PAY0000000130', 130, 61, 693.99, 'mock_wxpay', 1, DATE_SUB(NOW(), INTERVAL 17 DAY) + INTERVAL 9 HOUR + INTERVAL 49 MINUTE),
('PAY0000000131', 131, 23, 601.99, 'mock_wxpay', 1, DATE_SUB(NOW(), INTERVAL 15 DAY) + INTERVAL 20 HOUR + INTERVAL 27 MINUTE),
('PAY0000000132', 132, 93, 223.99, 'mock_wxpay', 1, DATE_SUB(NOW(), INTERVAL 16 DAY) + INTERVAL 15 HOUR + INTERVAL 31 MINUTE),
('PAY0000000133', 133, 94, 1498.99, 'mock_wxpay', 1, DATE_SUB(NOW(), INTERVAL 17 DAY) + INTERVAL 20 HOUR + INTERVAL 42 MINUTE),
('PAY0000000135', 135, 21, 1219.99, 'mock_wxpay', 1, DATE_SUB(NOW(), INTERVAL 14 DAY) + INTERVAL 14 HOUR + INTERVAL 41 MINUTE),
('PAY0000000136', 136, 55, 490.99, 'mock_wxpay', 1, DATE_SUB(NOW(), INTERVAL 2 DAY) + INTERVAL 17 HOUR + INTERVAL 23 MINUTE),
('PAY0000000137', 137, 62, 893.99, 'mock_wxpay', 1, DATE_SUB(NOW(), INTERVAL 25 DAY) + INTERVAL 20 HOUR + INTERVAL 57 MINUTE),
('PAY0000000139', 139, 68, 1168.99, 'mock_wxpay', 1, DATE_SUB(NOW(), INTERVAL 22 DAY) + INTERVAL 12 HOUR + INTERVAL 17 MINUTE),
('PAY0000000141', 141, 41, 288.99, 'mock_wxpay', 1, DATE_SUB(NOW(), INTERVAL 24 DAY) + INTERVAL 17 HOUR + INTERVAL 25 MINUTE),
('PAY0000000142', 142, 44, 554.99, 'mock_wxpay', 1, DATE_SUB(NOW(), INTERVAL 15 DAY) + INTERVAL 22 HOUR + INTERVAL 31 MINUTE),
('PAY0000000144', 144, 25, 901.99, 'mock_wxpay', 1, DATE_SUB(NOW(), INTERVAL 7 DAY) + INTERVAL 15 HOUR + INTERVAL 53 MINUTE),
('PAY0000000147', 147, 88, 381.99, 'mock_wxpay', 1, DATE_SUB(NOW(), INTERVAL 7 DAY) + INTERVAL 15 HOUR + INTERVAL 17 MINUTE),
('PAY0000000148', 148, 67, 315.99, 'mock_wxpay', 1, DATE_SUB(NOW(), INTERVAL 14 DAY) + INTERVAL 13 HOUR + INTERVAL 46 MINUTE),
('PAY0000000150', 150, 14, 550.99, 'mock_wxpay', 1, DATE_SUB(NOW(), INTERVAL 22 DAY) + INTERVAL 22 HOUR + INTERVAL 38 MINUTE),
('PAY0000000151', 151, 102, 1337.99, 'mock_wxpay', 1, DATE_SUB(NOW(), INTERVAL 12 DAY) + INTERVAL 16 HOUR + INTERVAL 30 MINUTE),
('PAY0000000152', 152, 29, 1446.99, 'mock_wxpay', 1, DATE_SUB(NOW(), INTERVAL 25 DAY) + INTERVAL 21 HOUR + INTERVAL 37 MINUTE),
('PAY0000000154', 154, 29, 1046.99, 'mock_wxpay', 1, DATE_SUB(NOW(), INTERVAL 24 DAY) + INTERVAL 21 HOUR + INTERVAL 14 MINUTE),
('PAY0000000155', 155, 55, 303.99, 'mock_wxpay', 1, DATE_SUB(NOW(), INTERVAL 7 DAY) + INTERVAL 11 HOUR + INTERVAL 0 MINUTE),
('PAY0000000157', 157, 55, 1291.99, 'mock_wxpay', 1, DATE_SUB(NOW(), INTERVAL 29 DAY) + INTERVAL 17 HOUR + INTERVAL 4 MINUTE),
('PAY0000000158', 158, 69, 1083.99, 'mock_wxpay', 1, DATE_SUB(NOW(), INTERVAL 27 DAY) + INTERVAL 8 HOUR + INTERVAL 30 MINUTE),
('PAY0000000159', 159, 27, 335.99, 'mock_wxpay', 1, DATE_SUB(NOW(), INTERVAL 2 DAY) + INTERVAL 22 HOUR + INTERVAL 0 MINUTE),
('PAY0000000160', 160, 42, 1257.99, 'mock_wxpay', 1, DATE_SUB(NOW(), INTERVAL 3 DAY) + INTERVAL 22 HOUR + INTERVAL 15 MINUTE),
('PAY0000000162', 162, 50, 1386.99, 'mock_wxpay', 1, DATE_SUB(NOW(), INTERVAL 21 DAY) + INTERVAL 17 HOUR + INTERVAL 23 MINUTE),
('PAY0000000163', 163, 36, 233.99, 'mock_wxpay', 1, DATE_SUB(NOW(), INTERVAL 4 DAY) + INTERVAL 19 HOUR + INTERVAL 55 MINUTE),
('PAY0000000166', 166, 88, 194.99, 'mock_wxpay', 1, DATE_SUB(NOW(), INTERVAL 23 DAY) + INTERVAL 19 HOUR + INTERVAL 42 MINUTE),
('PAY0000000168', 168, 93, 859.99, 'mock_wxpay', 1, DATE_SUB(NOW(), INTERVAL 14 DAY) + INTERVAL 9 HOUR + INTERVAL 20 MINUTE),
('PAY0000000169', 169, 77, 682.99, 'mock_wxpay', 1, DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 12 HOUR + INTERVAL 7 MINUTE),
('PAY0000000170', 170, 28, 1204.99, 'mock_wxpay', 1, DATE_SUB(NOW(), INTERVAL 0 DAY) + INTERVAL 20 HOUR + INTERVAL 13 MINUTE),
('PAY0000000171', 171, 56, 748.99, 'mock_wxpay', 1, DATE_SUB(NOW(), INTERVAL 2 DAY) + INTERVAL 22 HOUR + INTERVAL 1 MINUTE),
('PAY0000000173', 173, 106, 907.99, 'mock_wxpay', 1, DATE_SUB(NOW(), INTERVAL 13 DAY) + INTERVAL 13 HOUR + INTERVAL 24 MINUTE),
('PAY0000000174', 174, 72, 132.99, 'mock_wxpay', 1, DATE_SUB(NOW(), INTERVAL 13 DAY) + INTERVAL 8 HOUR + INTERVAL 37 MINUTE),
('PAY0000000175', 175, 44, 80.99, 'mock_wxpay', 1, DATE_SUB(NOW(), INTERVAL 18 DAY) + INTERVAL 19 HOUR + INTERVAL 15 MINUTE),
('PAY0000000176', 176, 101, 1319.99, 'mock_wxpay', 1, DATE_SUB(NOW(), INTERVAL 18 DAY) + INTERVAL 22 HOUR + INTERVAL 10 MINUTE),
('PAY0000000179', 179, 106, 339.99, 'mock_wxpay', 1, DATE_SUB(NOW(), INTERVAL 23 DAY) + INTERVAL 22 HOUR + INTERVAL 54 MINUTE),
('PAY0000000180', 180, 87, 1315.99, 'mock_wxpay', 1, DATE_SUB(NOW(), INTERVAL 24 DAY) + INTERVAL 12 HOUR + INTERVAL 41 MINUTE),
('PAY0000000181', 181, 68, 668.99, 'mock_wxpay', 1, DATE_SUB(NOW(), INTERVAL 12 DAY) + INTERVAL 11 HOUR + INTERVAL 28 MINUTE),
('PAY0000000182', 182, 41, 1229.99, 'mock_wxpay', 1, DATE_SUB(NOW(), INTERVAL 28 DAY) + INTERVAL 20 HOUR + INTERVAL 12 MINUTE),
('PAY0000000183', 183, 79, 1346.99, 'mock_wxpay', 1, DATE_SUB(NOW(), INTERVAL 28 DAY) + INTERVAL 13 HOUR + INTERVAL 21 MINUTE),
('PAY0000000184', 184, 10, 1002.99, 'mock_wxpay', 1, DATE_SUB(NOW(), INTERVAL 10 DAY) + INTERVAL 9 HOUR + INTERVAL 17 MINUTE),
('PAY0000000185', 185, 47, 1152.99, 'mock_wxpay', 1, DATE_SUB(NOW(), INTERVAL 28 DAY) + INTERVAL 19 HOUR + INTERVAL 23 MINUTE),
('PAY0000000190', 190, 88, 1250.99, 'mock_wxpay', 1, DATE_SUB(NOW(), INTERVAL 20 DAY) + INTERVAL 12 HOUR + INTERVAL 28 MINUTE),
('PAY0000000196', 196, 56, 1151.99, 'mock_wxpay', 1, DATE_SUB(NOW(), INTERVAL 23 DAY) + INTERVAL 15 HOUR + INTERVAL 26 MINUTE),
('PAY0000000197', 197, 70, 1498.99, 'mock_wxpay', 1, DATE_SUB(NOW(), INTERVAL 3 DAY) + INTERVAL 17 HOUR + INTERVAL 22 MINUTE),
('PAY0000000198', 198, 13, 601.99, 'mock_wxpay', 1, DATE_SUB(NOW(), INTERVAL 19 DAY) + INTERVAL 9 HOUR + INTERVAL 12 MINUTE),
('PAY0000000199', 199, 48, 1439.99, 'mock_wxpay', 1, DATE_SUB(NOW(), INTERVAL 23 DAY) + INTERVAL 18 HOUR + INTERVAL 25 MINUTE);

-- 财务记录（未结算）
INSERT INTO t_finance_record (order_id, merchant_id, order_amount, commission_rate, commission, merchant_income, settle_status, created_at) VALUES
(103, 4, 276.99, 0.10, 27.7, 249.29, 0, NOW()),
(104, 4, 381.99, 0.05, 19.1, 362.89, 0, NOW()),
(105, 5, 176.99, 0.10, 17.7, 159.29, 0, NOW()),
(106, 5, 1033.99, 0.05, 51.7, 982.29, 0, NOW()),
(109, 3, 1382.99, 0.10, 138.3, 1244.69, 0, NOW()),
(110, 4, 152.99, 0.10, 15.3, 137.69, 0, NOW()),
(114, 6, 1347.99, 0.10, 134.8, 1213.19, 0, NOW()),
(115, 5, 144.99, 0.10, 14.5, 130.49, 0, NOW()),
(116, 5, 1324.99, 0.10, 132.5, 1192.49, 0, NOW()),
(117, 5, 851.99, 0.05, 42.6, 809.39, 0, NOW()),
(119, 6, 882.99, 0.10, 88.3, 794.69, 0, NOW()),
(121, 4, 896.99, 0.10, 89.7, 807.29, 0, NOW()),
(122, 6, 809.99, 0.10, 81, 728.99, 0, NOW()),
(123, 5, 1285.99, 0.10, 128.6, 1157.39, 0, NOW()),
(124, 5, 651.99, 0.05, 32.6, 619.39, 0, NOW()),
(125, 4, 1195.99, 0.10, 119.6, 1076.39, 0, NOW()),
(126, 4, 1472.99, 0.10, 147.3, 1325.69, 0, NOW()),
(127, 5, 1150.99, 0.10, 115.1, 1035.89, 0, NOW()),
(128, 6, 205.99, 0.10, 20.6, 185.39, 0, NOW()),
(129, 4, 1463.99, 0.10, 146.4, 1317.59, 0, NOW()),
(130, 6, 693.99, 0.05, 34.7, 659.29, 0, NOW()),
(131, 3, 601.99, 0.10, 60.2, 541.79, 0, NOW()),
(132, 6, 223.99, 0.10, 22.4, 201.59, 0, NOW()),
(133, 6, 1498.99, 0.05, 74.95, 1424.04, 0, NOW()),
(135, 3, 1219.99, 0.10, 122, 1097.99, 0, NOW()),
(136, 6, 490.99, 0.05, 24.55, 466.44, 0, NOW()),
(137, 4, 893.99, 0.10, 89.4, 804.59, 0, NOW()),
(139, 3, 1168.99, 0.10, 116.9, 1052.09, 0, NOW()),
(141, 3, 288.99, 0.10, 28.9, 260.09, 0, NOW()),
(142, 6, 554.99, 0.10, 55.5, 499.49, 0, NOW()),
(144, 3, 901.99, 0.05, 45.1, 856.89, 0, NOW()),
(147, 6, 381.99, 0.10, 38.2, 343.79, 0, NOW()),
(148, 5, 315.99, 0.10, 31.6, 284.39, 0, NOW()),
(150, 3, 550.99, 0.05, 27.55, 523.44, 0, NOW()),
(151, 5, 1337.99, 0.05, 66.9, 1271.09, 0, NOW()),
(152, 3, 1446.99, 0.05, 72.35, 1374.64, 0, NOW()),
(154, 4, 1046.99, 0.10, 104.7, 942.29, 0, NOW()),
(155, 5, 303.99, 0.10, 30.4, 273.59, 0, NOW()),
(157, 3, 1291.99, 0.10, 129.2, 1162.79, 0, NOW()),
(158, 3, 1083.99, 0.10, 108.4, 975.59, 0, NOW()),
(159, 6, 335.99, 0.10, 33.6, 302.39, 0, NOW()),
(160, 6, 1257.99, 0.10, 125.8, 1132.19, 0, NOW()),
(162, 6, 1386.99, 0.10, 138.7, 1248.29, 0, NOW()),
(163, 6, 233.99, 0.10, 23.4, 210.59, 0, NOW()),
(166, 3, 194.99, 0.10, 19.5, 175.49, 0, NOW()),
(168, 5, 859.99, 0.10, 86, 773.99, 0, NOW()),
(169, 3, 682.99, 0.10, 68.3, 614.69, 0, NOW()),
(170, 5, 1204.99, 0.05, 60.25, 1144.74, 0, NOW()),
(171, 3, 748.99, 0.05, 37.45, 711.54, 0, NOW()),
(173, 6, 907.99, 0.10, 90.8, 817.19, 0, NOW()),
(174, 3, 132.99, 0.05, 6.65, 126.34, 0, NOW()),
(175, 6, 80.99, 0.10, 8.1, 72.89, 0, NOW()),
(176, 3, 1319.99, 0.10, 132, 1187.99, 0, NOW()),
(179, 4, 339.99, 0.10, 34, 305.99, 0, NOW()),
(180, 6, 1315.99, 0.10, 131.6, 1184.39, 0, NOW()),
(181, 5, 668.99, 0.10, 66.9, 602.09, 0, NOW()),
(182, 6, 1229.99, 0.10, 123, 1106.99, 0, NOW()),
(183, 3, 1346.99, 0.05, 67.35, 1279.64, 0, NOW()),
(184, 6, 1002.99, 0.10, 100.3, 902.69, 0, NOW()),
(185, 6, 1152.99, 0.10, 115.3, 1037.69, 0, NOW()),
(190, 3, 1250.99, 0.10, 125.1, 1125.89, 0, NOW()),
(196, 6, 1151.99, 0.10, 115.2, 1036.79, 0, NOW()),
(197, 3, 1498.99, 0.10, 149.9, 1349.09, 0, NOW()),
(198, 4, 601.99, 0.10, 60.2, 541.79, 0, NOW()),
(199, 5, 1439.99, 0.10, 144, 1295.99, 0, NOW());

-- 评论（关联产品/民宿/景区）
INSERT INTO t_review (id, order_id, user_id, biz_type, biz_id, rating, content, images, follow_up, merchant_reply, is_hidden, created_at, updated_at) VALUES
(100, NULL, 13, 'scenic', 2, 4, '整体体验超出预期，强烈推荐。', NULL, '', '', 0, NOW(), NOW()),
(101, NULL, 63, 'scenic', 4, 4, '民宿的清晨真的像在云端。', NULL, '', '', 0, NOW(), NOW()),
(102, NULL, 72, 'scenic', 2, 4, '长桌宴仪式感满满，敬酒歌很有特色。', NULL, '', '', 0, NOW(), NOW()),
(103, NULL, 96, 'homestay', 4, 4, '长桌宴仪式感满满，敬酒歌很有特色。', NULL, '', '', 0, NOW(), NOW()),
(104, NULL, 40, 'product', 5, 5, '民宿的清晨真的像在云端。', NULL, '', '', 0, NOW(), NOW()),
(105, NULL, 38, 'homestay', 5, 5, '整体体验超出预期，强烈推荐。', NULL, '', '', 0, NOW(), NOW()),
(106, NULL, 43, 'scenic', 6, 4, '山路有点远，但风景确实美。', NULL, '', '', 0, NOW(), NOW()),
(107, NULL, 63, 'homestay', 6, 5, '梯田日出太美了，摄影爱好者的天堂。', NULL, '', '', 0, NOW(), NOW()),
(108, NULL, 75, 'homestay', 4, 5, '苗家长桌宴味道正宗，酸汤鱼超赞。', NULL, '', '', 0, NOW(), NOW()),
(109, NULL, 35, 'product', 1, 5, '民俗表演很精彩，值得一看。', NULL, '', '', 0, NOW(), NOW()),
(110, NULL, 25, 'product', 2, 4, '长桌宴仪式感满满，敬酒歌很有特色。', NULL, '', '', 0, NOW(), NOW()),
(111, NULL, 103, 'scenic', 2, 4, '山路有点远，但风景确实美。', NULL, '', '', 0, NOW(), NOW()),
(112, NULL, 56, 'scenic', 3, 5, '导游讲解专业，了解了很多苗族文化。', NULL, '', '', 0, NOW(), NOW()),
(113, NULL, 77, 'homestay', 3, 5, '导游讲解专业，了解了很多苗族文化。', NULL, '', '', 0, NOW(), NOW()),
(114, NULL, 34, 'scenic', 3, 4, '住宿条件不错，老板很热情。', NULL, '', '', 0, NOW(), NOW()),
(115, NULL, 76, 'product', 3, 4, '苗家长桌宴味道正宗，酸汤鱼超赞。', NULL, '', '', 0, NOW(), NOW()),
(116, NULL, 100, 'product', 3, 5, '住宿条件不错，老板很热情。', NULL, '', '', 0, NOW(), NOW()),
(117, NULL, 42, 'scenic', 3, 5, '苗家长桌宴味道正宗，酸汤鱼超赞。', NULL, '', '', 0, NOW(), NOW()),
(118, NULL, 108, 'scenic', 5, 4, '整体体验超出预期，强烈推荐。', NULL, '', '', 0, NOW(), NOW()),
(119, NULL, 71, 'homestay', 1, 5, '整体体验超出预期，强烈推荐。', NULL, '', '', 0, NOW(), NOW()),
(120, NULL, 54, 'product', 1, 4, '导游讲解专业，了解了很多苗族文化。', NULL, '', '', 0, NOW(), NOW()),
(121, NULL, 59, 'homestay', 2, 4, '苗家长桌宴味道正宗，酸汤鱼超赞。', NULL, '', '', 0, NOW(), NOW()),
(122, NULL, 76, 'product', 4, 4, '山路有点远，但风景确实美。', NULL, '', '', 0, NOW(), NOW()),
(123, NULL, 64, 'scenic', 4, 4, '长桌宴仪式感满满，敬酒歌很有特色。', NULL, '', '', 0, NOW(), NOW()),
(124, NULL, 64, 'homestay', 5, 5, '吊脚楼民宿推窗就是梯田，晨雾超美。', NULL, '', '', 0, NOW(), NOW()),
(125, NULL, 37, 'product', 2, 4, '民俗表演很精彩，值得一看。', NULL, '', '', 0, NOW(), NOW()),
(126, NULL, 97, 'product', 6, 5, '梯田日出太美了，摄影爱好者的天堂。', NULL, '', '', 0, NOW(), NOW()),
(127, NULL, 95, 'homestay', 4, 4, '餐厅的酸汤和腊肉是地道苗家味。', NULL, '', '', 0, NOW(), NOW()),
(128, NULL, 61, 'scenic', 4, 5, '民俗表演很精彩，值得一看。', NULL, '', '', 0, NOW(), NOW()),
(129, NULL, 57, 'product', 2, 4, '山路有点远，但风景确实美。', NULL, '', '', 0, NOW(), NOW());

-- 站内消息
INSERT INTO t_message (id, user_id, msg_type, title, content, is_read, created_at) VALUES
(100, 90, 'activity', '苗年节活动开启', '11 月苗年节即将开启，活动期间下单可享 9 折优惠。', 1, NOW()),
(101, 100, 'system', '欢迎来到乌东文旅', '平台汇聚苗寨衣食住行一站式服务，祝您玩得开心！', 0, NOW()),
(102, 45, 'order', '订单支付成功', '您的订单已支付成功，商家将尽快处理。', 0, NOW()),
(103, 67, 'activity', '苗年节活动开启', '11 月苗年节即将开启，活动期间下单可享 9 折优惠。', 0, NOW()),
(104, 42, 'merchant', '商家审核通过', '您的入驻申请已通过，欢迎加入乌东文旅平台。', 1, NOW()),
(105, 80, 'activity', '苗年节活动开启', '11 月苗年节即将开启，活动期间下单可享 9 折优惠。', 1, NOW()),
(106, 11, 'merchant', '商家审核通过', '您的入驻申请已通过，欢迎加入乌东文旅平台。', 1, NOW()),
(107, 64, 'system', '欢迎来到乌东文旅', '平台汇聚苗寨衣食住行一站式服务，祝您玩得开心！', 0, NOW()),
(108, 66, 'order', '订单支付成功', '您的订单已支付成功，商家将尽快处理。', 1, NOW()),
(109, 62, 'system', '欢迎来到乌东文旅', '平台汇聚苗寨衣食住行一站式服务，祝您玩得开心！', 1, NOW()),
(110, 96, 'activity', '苗年节活动开启', '11 月苗年节即将开启，活动期间下单可享 9 折优惠。', 1, NOW()),
(111, 45, 'order', '订单支付成功', '您的订单已支付成功，商家将尽快处理。', 1, NOW()),
(112, 73, 'system', '欢迎来到乌东文旅', '平台汇聚苗寨衣食住行一站式服务，祝您玩得开心！', 1, NOW()),
(113, 38, 'order', '订单已发货', '您的订单已由商家发货，请注意查收物流。', 1, NOW()),
(114, 40, 'order', '订单已发货', '您的订单已由商家发货，请注意查收物流。', 0, NOW()),
(115, 48, 'merchant', '商家审核通过', '您的入驻申请已通过，欢迎加入乌东文旅平台。', 1, NOW()),
(116, 67, 'activity', '苗年节活动开启', '11 月苗年节即将开启，活动期间下单可享 9 折优惠。', 0, NOW()),
(117, 26, 'activity', '苗年节活动开启', '11 月苗年节即将开启，活动期间下单可享 9 折优惠。', 0, NOW()),
(118, 85, 'order', '订单已发货', '您的订单已由商家发货，请注意查收物流。', 0, NOW()),
(119, 96, 'order', '订单已发货', '您的订单已由商家发货，请注意查收物流。', 1, NOW()),
(120, 78, 'merchant', '商家审核通过', '您的入驻申请已通过，欢迎加入乌东文旅平台。', 1, NOW()),
(121, 28, 'order', '订单支付成功', '您的订单已支付成功，商家将尽快处理。', 1, NOW()),
(122, 65, 'system', '欢迎来到乌东文旅', '平台汇聚苗寨衣食住行一站式服务，祝您玩得开心！', 0, NOW()),
(123, 99, 'system', '欢迎来到乌东文旅', '平台汇聚苗寨衣食住行一站式服务，祝您玩得开心！', 1, NOW()),
(124, 88, 'activity', '苗年节活动开启', '11 月苗年节即将开启，活动期间下单可享 9 折优惠。', 0, NOW()),
(125, 76, 'system', '欢迎来到乌东文旅', '平台汇聚苗寨衣食住行一站式服务，祝您玩得开心！', 1, NOW()),
(126, 62, 'order', '订单支付成功', '您的订单已支付成功，商家将尽快处理。', 1, NOW()),
(127, 82, 'merchant', '商家审核通过', '您的入驻申请已通过，欢迎加入乌东文旅平台。', 0, NOW()),
(128, 59, 'system', '欢迎来到乌东文旅', '平台汇聚苗寨衣食住行一站式服务，祝您玩得开心！', 1, NOW()),
(129, 14, 'order', '订单已发货', '您的订单已由商家发货，请注意查收物流。', 1, NOW());

-- 访问日志
INSERT INTO t_visit_log (user_id, page, module, action, created_at) VALUES
(57, '/hotel', 'hotel', 'view', DATE_SUB(NOW(), INTERVAL 22 DAY)),
(85, '/home', '', 'view', DATE_SUB(NOW(), INTERVAL 6 DAY)),
(88, '/community', 'community', 'view', DATE_SUB(NOW(), INTERVAL 14 DAY)),
(96, '/food', 'food', 'view', DATE_SUB(NOW(), INTERVAL 25 DAY)),
(12, '/order/confirm', '', 'view', DATE_SUB(NOW(), INTERVAL 4 DAY)),
(26, '/order/confirm', '', 'view', DATE_SUB(NOW(), INTERVAL 8 DAY)),
(36, '/travel', 'travel', 'view', DATE_SUB(NOW(), INTERVAL 26 DAY)),
(39, '/clothing', 'clothing', 'view', DATE_SUB(NOW(), INTERVAL 18 DAY)),
(58, '/home', '', 'view', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(48, '/travel', 'travel', 'view', DATE_SUB(NOW(), INTERVAL 6 DAY)),
(99, '/hotel', 'hotel', 'view', DATE_SUB(NOW(), INTERVAL 6 DAY)),
(51, '/clothing', 'clothing', 'view', DATE_SUB(NOW(), INTERVAL 29 DAY)),
(70, '/order/confirm', '', 'view', DATE_SUB(NOW(), INTERVAL 27 DAY)),
(78, '/home', '', 'view', DATE_SUB(NOW(), INTERVAL 6 DAY)),
(106, '/hotel', 'hotel', 'view', DATE_SUB(NOW(), INTERVAL 7 DAY)),
(82, '/order/confirm', '', 'view', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(88, '/order/confirm', '', 'view', DATE_SUB(NOW(), INTERVAL 20 DAY)),
(104, '/order/confirm', '', 'view', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(89, '/order/confirm', '', 'view', DATE_SUB(NOW(), INTERVAL 18 DAY)),
(60, '/home', '', 'view', DATE_SUB(NOW(), INTERVAL 23 DAY)),
(20, '/home', '', 'view', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(80, '/order/confirm', '', 'view', DATE_SUB(NOW(), INTERVAL 7 DAY)),
(65, '/order/confirm', '', 'view', DATE_SUB(NOW(), INTERVAL 14 DAY)),
(38, '/hotel', 'hotel', 'view', DATE_SUB(NOW(), INTERVAL 18 DAY)),
(63, '/hotel', 'hotel', 'view', DATE_SUB(NOW(), INTERVAL 27 DAY)),
(59, '/order/confirm', '', 'view', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(61, '/hotel', 'hotel', 'view', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(62, '/hotel', 'hotel', 'view', DATE_SUB(NOW(), INTERVAL 21 DAY)),
(104, '/food', 'food', 'view', DATE_SUB(NOW(), INTERVAL 27 DAY)),
(87, '/hotel', 'hotel', 'view', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(81, '/clothing', 'clothing', 'view', DATE_SUB(NOW(), INTERVAL 25 DAY)),
(46, '/hotel', 'hotel', 'view', DATE_SUB(NOW(), INTERVAL 30 DAY)),
(87, '/travel', 'travel', 'view', DATE_SUB(NOW(), INTERVAL 0 DAY)),
(77, '/order/confirm', '', 'view', DATE_SUB(NOW(), INTERVAL 24 DAY)),
(34, '/food', 'food', 'view', DATE_SUB(NOW(), INTERVAL 14 DAY)),
(109, '/travel', 'travel', 'view', DATE_SUB(NOW(), INTERVAL 28 DAY)),
(104, '/home', '', 'view', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(43, '/home', '', 'view', DATE_SUB(NOW(), INTERVAL 20 DAY)),
(53, '/community', 'community', 'view', DATE_SUB(NOW(), INTERVAL 20 DAY)),
(58, '/order/confirm', '', 'view', DATE_SUB(NOW(), INTERVAL 19 DAY)),
(85, '/home', '', 'view', DATE_SUB(NOW(), INTERVAL 7 DAY)),
(89, '/clothing', 'clothing', 'view', DATE_SUB(NOW(), INTERVAL 20 DAY)),
(38, '/food', 'food', 'view', DATE_SUB(NOW(), INTERVAL 4 DAY)),
(82, '/food', 'food', 'view', DATE_SUB(NOW(), INTERVAL 17 DAY)),
(33, '/clothing', 'clothing', 'view', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(33, '/home', '', 'view', DATE_SUB(NOW(), INTERVAL 12 DAY)),
(60, '/food', 'food', 'view', DATE_SUB(NOW(), INTERVAL 13 DAY)),
(100, '/order/confirm', '', 'view', DATE_SUB(NOW(), INTERVAL 13 DAY)),
(62, '/food', 'food', 'view', DATE_SUB(NOW(), INTERVAL 6 DAY)),
(17, '/travel', 'travel', 'view', DATE_SUB(NOW(), INTERVAL 23 DAY)),
(52, '/travel', 'travel', 'view', DATE_SUB(NOW(), INTERVAL 4 DAY)),
(18, '/clothing', 'clothing', 'view', DATE_SUB(NOW(), INTERVAL 7 DAY)),
(107, '/food', 'food', 'view', DATE_SUB(NOW(), INTERVAL 23 DAY)),
(20, '/community', 'community', 'view', DATE_SUB(NOW(), INTERVAL 17 DAY)),
(71, '/order/confirm', '', 'view', DATE_SUB(NOW(), INTERVAL 9 DAY)),
(50, '/clothing', 'clothing', 'view', DATE_SUB(NOW(), INTERVAL 20 DAY)),
(82, '/order/confirm', '', 'view', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(90, '/community', 'community', 'view', DATE_SUB(NOW(), INTERVAL 25 DAY)),
(92, '/order/confirm', '', 'view', DATE_SUB(NOW(), INTERVAL 21 DAY)),
(35, '/hotel', 'hotel', 'view', DATE_SUB(NOW(), INTERVAL 19 DAY)),
(27, '/order/confirm', '', 'view', DATE_SUB(NOW(), INTERVAL 27 DAY)),
(73, '/order/confirm', '', 'view', DATE_SUB(NOW(), INTERVAL 16 DAY)),
(65, '/home', '', 'view', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(40, '/clothing', 'clothing', 'view', DATE_SUB(NOW(), INTERVAL 9 DAY)),
(75, '/home', '', 'view', DATE_SUB(NOW(), INTERVAL 17 DAY)),
(62, '/home', '', 'view', DATE_SUB(NOW(), INTERVAL 29 DAY)),
(29, '/order/confirm', '', 'view', DATE_SUB(NOW(), INTERVAL 0 DAY)),
(18, '/hotel', 'hotel', 'view', DATE_SUB(NOW(), INTERVAL 13 DAY)),
(97, '/food', 'food', 'view', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(83, '/clothing', 'clothing', 'view', DATE_SUB(NOW(), INTERVAL 23 DAY)),
(40, '/clothing', 'clothing', 'view', DATE_SUB(NOW(), INTERVAL 22 DAY)),
(61, '/hotel', 'hotel', 'view', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(55, '/food', 'food', 'view', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(70, '/clothing', 'clothing', 'view', DATE_SUB(NOW(), INTERVAL 16 DAY)),
(75, '/order/confirm', '', 'view', DATE_SUB(NOW(), INTERVAL 6 DAY)),
(87, '/home', '', 'view', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(58, '/travel', 'travel', 'view', DATE_SUB(NOW(), INTERVAL 6 DAY)),
(82, '/food', 'food', 'view', DATE_SUB(NOW(), INTERVAL 21 DAY)),
(51, '/food', 'food', 'view', DATE_SUB(NOW(), INTERVAL 7 DAY)),
(50, '/travel', 'travel', 'view', DATE_SUB(NOW(), INTERVAL 9 DAY)),
(73, '/travel', 'travel', 'view', DATE_SUB(NOW(), INTERVAL 25 DAY)),
(86, '/food', 'food', 'view', DATE_SUB(NOW(), INTERVAL 11 DAY)),
(98, '/community', 'community', 'view', DATE_SUB(NOW(), INTERVAL 28 DAY)),
(53, '/home', '', 'view', DATE_SUB(NOW(), INTERVAL 26 DAY)),
(37, '/order/confirm', '', 'view', DATE_SUB(NOW(), INTERVAL 27 DAY)),
(10, '/order/confirm', '', 'view', DATE_SUB(NOW(), INTERVAL 13 DAY)),
(17, '/home', '', 'view', DATE_SUB(NOW(), INTERVAL 0 DAY)),
(85, '/travel', 'travel', 'view', DATE_SUB(NOW(), INTERVAL 14 DAY)),
(14, '/community', 'community', 'view', DATE_SUB(NOW(), INTERVAL 10 DAY)),
(60, '/community', 'community', 'view', DATE_SUB(NOW(), INTERVAL 14 DAY)),
(47, '/community', 'community', 'view', DATE_SUB(NOW(), INTERVAL 17 DAY)),
(90, '/food', 'food', 'view', DATE_SUB(NOW(), INTERVAL 15 DAY)),
(18, '/community', 'community', 'view', DATE_SUB(NOW(), INTERVAL 8 DAY)),
(52, '/home', '', 'view', DATE_SUB(NOW(), INTERVAL 7 DAY)),
(108, '/clothing', 'clothing', 'view', DATE_SUB(NOW(), INTERVAL 26 DAY)),
(16, '/community', 'community', 'view', DATE_SUB(NOW(), INTERVAL 17 DAY)),
(78, '/hotel', 'hotel', 'view', DATE_SUB(NOW(), INTERVAL 14 DAY)),
(90, '/home', '', 'view', DATE_SUB(NOW(), INTERVAL 8 DAY)),
(51, '/order/confirm', '', 'view', DATE_SUB(NOW(), INTERVAL 17 DAY)),
(23, '/home', '', 'view', DATE_SUB(NOW(), INTERVAL 28 DAY)),
(66, '/food', 'food', 'view', DATE_SUB(NOW(), INTERVAL 27 DAY)),
(103, '/community', 'community', 'view', DATE_SUB(NOW(), INTERVAL 10 DAY)),
(29, '/hotel', 'hotel', 'view', DATE_SUB(NOW(), INTERVAL 8 DAY)),
(73, '/hotel', 'hotel', 'view', DATE_SUB(NOW(), INTERVAL 24 DAY)),
(99, '/home', '', 'view', DATE_SUB(NOW(), INTERVAL 25 DAY)),
(97, '/home', '', 'view', DATE_SUB(NOW(), INTERVAL 23 DAY)),
(40, '/travel', 'travel', 'view', DATE_SUB(NOW(), INTERVAL 21 DAY)),
(16, '/home', '', 'view', DATE_SUB(NOW(), INTERVAL 24 DAY)),
(16, '/order/confirm', '', 'view', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(61, '/clothing', 'clothing', 'view', DATE_SUB(NOW(), INTERVAL 0 DAY)),
(30, '/hotel', 'hotel', 'view', DATE_SUB(NOW(), INTERVAL 17 DAY)),
(72, '/community', 'community', 'view', DATE_SUB(NOW(), INTERVAL 9 DAY)),
(92, '/food', 'food', 'view', DATE_SUB(NOW(), INTERVAL 20 DAY)),
(29, '/clothing', 'clothing', 'view', DATE_SUB(NOW(), INTERVAL 26 DAY)),
(51, '/community', 'community', 'view', DATE_SUB(NOW(), INTERVAL 8 DAY)),
(95, '/travel', 'travel', 'view', DATE_SUB(NOW(), INTERVAL 15 DAY)),
(50, '/travel', 'travel', 'view', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(22, '/home', '', 'view', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(31, '/travel', 'travel', 'view', DATE_SUB(NOW(), INTERVAL 15 DAY)),
(10, '/hotel', 'hotel', 'view', DATE_SUB(NOW(), INTERVAL 16 DAY)),
(42, '/community', 'community', 'view', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(59, '/community', 'community', 'view', DATE_SUB(NOW(), INTERVAL 11 DAY)),
(31, '/clothing', 'clothing', 'view', DATE_SUB(NOW(), INTERVAL 9 DAY)),
(64, '/community', 'community', 'view', DATE_SUB(NOW(), INTERVAL 4 DAY)),
(25, '/community', 'community', 'view', DATE_SUB(NOW(), INTERVAL 10 DAY)),
(51, '/community', 'community', 'view', DATE_SUB(NOW(), INTERVAL 29 DAY)),
(87, '/food', 'food', 'view', DATE_SUB(NOW(), INTERVAL 10 DAY)),
(44, '/home', '', 'view', DATE_SUB(NOW(), INTERVAL 23 DAY)),
(100, '/community', 'community', 'view', DATE_SUB(NOW(), INTERVAL 21 DAY)),
(98, '/food', 'food', 'view', DATE_SUB(NOW(), INTERVAL 29 DAY)),
(55, '/home', '', 'view', DATE_SUB(NOW(), INTERVAL 17 DAY)),
(18, '/clothing', 'clothing', 'view', DATE_SUB(NOW(), INTERVAL 20 DAY)),
(11, '/clothing', 'clothing', 'view', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(24, '/food', 'food', 'view', DATE_SUB(NOW(), INTERVAL 12 DAY)),
(32, '/hotel', 'hotel', 'view', DATE_SUB(NOW(), INTERVAL 16 DAY)),
(100, '/community', 'community', 'view', DATE_SUB(NOW(), INTERVAL 14 DAY)),
(78, '/home', '', 'view', DATE_SUB(NOW(), INTERVAL 26 DAY)),
(49, '/home', '', 'view', DATE_SUB(NOW(), INTERVAL 21 DAY)),
(14, '/travel', 'travel', 'view', DATE_SUB(NOW(), INTERVAL 20 DAY)),
(10, '/food', 'food', 'view', DATE_SUB(NOW(), INTERVAL 4 DAY)),
(30, '/home', '', 'view', DATE_SUB(NOW(), INTERVAL 4 DAY)),
(88, '/clothing', 'clothing', 'view', DATE_SUB(NOW(), INTERVAL 30 DAY)),
(94, '/home', '', 'view', DATE_SUB(NOW(), INTERVAL 12 DAY)),
(53, '/community', 'community', 'view', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(93, '/home', '', 'view', DATE_SUB(NOW(), INTERVAL 26 DAY)),
(28, '/clothing', 'clothing', 'view', DATE_SUB(NOW(), INTERVAL 20 DAY)),
(25, '/home', '', 'view', DATE_SUB(NOW(), INTERVAL 28 DAY)),
(73, '/home', '', 'view', DATE_SUB(NOW(), INTERVAL 27 DAY)),
(93, '/order/confirm', '', 'view', DATE_SUB(NOW(), INTERVAL 19 DAY)),
(74, '/community', 'community', 'view', DATE_SUB(NOW(), INTERVAL 4 DAY)),
(28, '/home', '', 'view', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(50, '/home', '', 'view', DATE_SUB(NOW(), INTERVAL 8 DAY)),
(77, '/home', '', 'view', DATE_SUB(NOW(), INTERVAL 13 DAY)),
(71, '/clothing', 'clothing', 'view', DATE_SUB(NOW(), INTERVAL 25 DAY)),
(36, '/food', 'food', 'view', DATE_SUB(NOW(), INTERVAL 9 DAY)),
(39, '/travel', 'travel', 'view', DATE_SUB(NOW(), INTERVAL 17 DAY)),
(46, '/home', '', 'view', DATE_SUB(NOW(), INTERVAL 26 DAY)),
(35, '/home', '', 'view', DATE_SUB(NOW(), INTERVAL 24 DAY)),
(71, '/clothing', 'clothing', 'view', DATE_SUB(NOW(), INTERVAL 18 DAY)),
(97, '/hotel', 'hotel', 'view', DATE_SUB(NOW(), INTERVAL 19 DAY)),
(48, '/clothing', 'clothing', 'view', DATE_SUB(NOW(), INTERVAL 20 DAY)),
(108, '/home', '', 'view', DATE_SUB(NOW(), INTERVAL 4 DAY)),
(70, '/hotel', 'hotel', 'view', DATE_SUB(NOW(), INTERVAL 27 DAY)),
(27, '/hotel', 'hotel', 'view', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(68, '/clothing', 'clothing', 'view', DATE_SUB(NOW(), INTERVAL 23 DAY)),
(78, '/clothing', 'clothing', 'view', DATE_SUB(NOW(), INTERVAL 16 DAY)),
(45, '/clothing', 'clothing', 'view', DATE_SUB(NOW(), INTERVAL 24 DAY)),
(49, '/clothing', 'clothing', 'view', DATE_SUB(NOW(), INTERVAL 17 DAY)),
(21, '/home', '', 'view', DATE_SUB(NOW(), INTERVAL 12 DAY)),
(78, '/food', 'food', 'view', DATE_SUB(NOW(), INTERVAL 12 DAY)),
(58, '/travel', 'travel', 'view', DATE_SUB(NOW(), INTERVAL 26 DAY)),
(19, '/community', 'community', 'view', DATE_SUB(NOW(), INTERVAL 29 DAY)),
(65, '/food', 'food', 'view', DATE_SUB(NOW(), INTERVAL 16 DAY)),
(17, '/order/confirm', '', 'view', DATE_SUB(NOW(), INTERVAL 13 DAY)),
(98, '/food', 'food', 'view', DATE_SUB(NOW(), INTERVAL 15 DAY)),
(96, '/home', '', 'view', DATE_SUB(NOW(), INTERVAL 18 DAY)),
(59, '/community', 'community', 'view', DATE_SUB(NOW(), INTERVAL 10 DAY)),
(82, '/home', '', 'view', DATE_SUB(NOW(), INTERVAL 28 DAY)),
(31, '/hotel', 'hotel', 'view', DATE_SUB(NOW(), INTERVAL 6 DAY)),
(102, '/order/confirm', '', 'view', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(13, '/order/confirm', '', 'view', DATE_SUB(NOW(), INTERVAL 14 DAY)),
(68, '/home', '', 'view', DATE_SUB(NOW(), INTERVAL 19 DAY)),
(54, '/order/confirm', '', 'view', DATE_SUB(NOW(), INTERVAL 23 DAY)),
(96, '/travel', 'travel', 'view', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(36, '/travel', 'travel', 'view', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(27, '/home', '', 'view', DATE_SUB(NOW(), INTERVAL 9 DAY)),
(86, '/community', 'community', 'view', DATE_SUB(NOW(), INTERVAL 22 DAY)),
(91, '/community', 'community', 'view', DATE_SUB(NOW(), INTERVAL 13 DAY)),
(90, '/clothing', 'clothing', 'view', DATE_SUB(NOW(), INTERVAL 16 DAY)),
(99, '/food', 'food', 'view', DATE_SUB(NOW(), INTERVAL 11 DAY)),
(13, '/travel', 'travel', 'view', DATE_SUB(NOW(), INTERVAL 21 DAY)),
(15, '/hotel', 'hotel', 'view', DATE_SUB(NOW(), INTERVAL 0 DAY)),
(70, '/community', 'community', 'view', DATE_SUB(NOW(), INTERVAL 22 DAY)),
(51, '/community', 'community', 'view', DATE_SUB(NOW(), INTERVAL 8 DAY)),
(65, '/order/confirm', '', 'view', DATE_SUB(NOW(), INTERVAL 12 DAY)),
(69, '/order/confirm', '', 'view', DATE_SUB(NOW(), INTERVAL 27 DAY)),
(52, '/hotel', 'hotel', 'view', DATE_SUB(NOW(), INTERVAL 24 DAY)),
(15, '/food', 'food', 'view', DATE_SUB(NOW(), INTERVAL 28 DAY)),
(81, '/hotel', 'hotel', 'view', DATE_SUB(NOW(), INTERVAL 26 DAY)),
(68, '/clothing', 'clothing', 'view', DATE_SUB(NOW(), INTERVAL 15 DAY));
