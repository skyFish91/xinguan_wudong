-- ============================================================
-- 乌东文旅平台 - 社区板块演示数据（游记 / 评论）
-- 依赖：01-ddl.sql + 02-dml.sql 已导入（用户、话题已存在）
-- 说明：t_post 原本为空，社区首页无内容可看，此脚本补充 6 篇游记与若干评论。
-- 图片走接口静态目录 /uploads/seeds/*.svg，与 02-dml.sql 中其他模块的资源一致。
-- 可重复执行：先按固定 id 清理本脚本写入的数据。
-- ============================================================

USE `wudong`;

-- 幂等：清理旧的演示游记（id 1-6）及其评论
DELETE FROM `t_comment` WHERE `post_id` BETWEEN 1 AND 6;
DELETE FROM `t_post`    WHERE `id`      BETWEEN 1 AND 6;

INSERT INTO `t_post`
  (`id`, `user_id`, `title`, `content`, `images`, `video_url`, `linked_type`, `linked_id`, `linked_name`,
   `topic_id`, `like_count`, `comment_count`, `favorite_count`, `view_count`, `status`, `reject_reason`,
   `is_hot`, `published_at`, `created_at`, `updated_at`)
VALUES
  (1, 2, '清晨的千户苗寨，云海漫过吊脚楼',
   '五点半起床赶上了日出。观景台上风有点凉，等云海从山谷翻上来的那一刻，整片苗寨像浮在云上。\n建议住在寨内，才来得及赶第一缕光。门票含观光车，早上人少排队快。',
   '["/uploads/seeds/scenic-1.svg","/uploads/seeds/banner-1.svg"]', '', '', NULL, '',
   1, 128, 2, 36, 1543, 1, '', 1, NOW() - INTERVAL 2 DAY, NOW() - INTERVAL 2 DAY, NOW() - INTERVAL 2 DAY),

  (2, 7, '三天两晚苗寨慢行路线（含避坑）',
   'Day1 抵达凯里南站 → 大巴进寨 → 傍晚观景台看日落；\nDay2 上午非遗工坊做蜡染 → 下午长桌宴 → 夜里看歌舞；\nDay3 早市买银饰 → 返程。\n避坑：寨内主街的银饰价格虚高，往巷子里走能便宜三成。',
   '["/uploads/seeds/route-1.svg","/uploads/seeds/banner-3.svg"]', '', '', NULL, '',
   4, 96, 1, 41, 2107, 1, '', 1, NOW() - INTERVAL 5 DAY, NOW() - INTERVAL 5 DAY, NOW() - INTERVAL 5 DAY),

  (3, 8, '长桌宴初体验：酸汤鱼是真的上头',
   '第一次吃长桌宴，几十米的长桌一路摆下去，边吃边被敬酒。酸汤鱼酸得开胃，配糯米酒正好。\n人均 88 一位，量很足，两个人根本吃不完。',
   '["/uploads/seeds/dish-1.svg","/uploads/seeds/dish-3.svg"]', '', '', NULL, '',
   3, 74, 1, 18, 962, 1, '', 0, NOW() - INTERVAL 8 DAY, NOW() - INTERVAL 8 DAY, NOW() - INTERVAL 8 DAY),

  (4, 3, '银饰是怎么打出来的：一次非遗工坊记录',
   '跟着老师傅学了一下午錾刻。银片退火后变软，一锤一锤敲出纹样，手抖一下就废了。\n做好的小戒指可以带走，算是这趟最有分量的纪念品。',
   '["/uploads/seeds/product-silver-1.svg","/uploads/seeds/cat-silver.svg"]', '', '', NULL, '',
   2, 152, 1, 63, 1876, 1, '', 1, NOW() - INTERVAL 11 DAY, NOW() - INTERVAL 11 DAY, NOW() - INTERVAL 11 DAY),

  (5, 5, '住进吊脚楼民宿：推开窗就是梯田',
   '房间是木质结构，隔音一般但很安静。早上被鸟叫醒，推开窗正对梯田。\n民宿老板会做饭，家常菜比外面馆子好吃。提醒：寨内民宿热水是储水式，洗完要等半小时。',
   '["/uploads/seeds/homestay-1.svg","/uploads/seeds/room-1.svg"]', '', '', NULL, '',
   1, 63, 0, 22, 741, 1, '', 0, NOW() - INTERVAL 15 DAY, NOW() - INTERVAL 15 DAY, NOW() - INTERVAL 15 DAY),

  (6, 7, '梯田徒步半天：光线最好的两个时段',
   '从寨子后山往上走，全程约 6 公里。清晨和黄昏侧光最好，中午太硬不好拍。\n路上没有补给点，记得带水。',
   '["/uploads/seeds/farm-tea.svg","/uploads/seeds/scenic-2.svg"]', '', '', NULL, '',
   4, 41, 0, 12, 388, 1, '', 0, NOW() - INTERVAL 20 DAY, NOW() - INTERVAL 20 DAY, NOW() - INTERVAL 20 DAY);

-- 评论（评论 1、2 属游记 1；评论 3 属游记 2；评论 4 属游记 3；评论 5 属游记 4）
INSERT INTO `t_comment` (`id`, `post_id`, `user_id`, `content`, `parent_id`, `reply_user_id`, `like_count`, `status`, `created_at`)
VALUES
  (1, 1, 7, '这个点去确实好，我上次七点才到已经全是人了', 0, NULL, 12, 1, NOW() - INTERVAL 1 DAY),
  (2, 1, 2, '对，住寨内是关键，不然赶不上', 1, 7, 3, 1, NOW() - INTERVAL 20 HOUR),
  (3, 2, 8, '收藏了，下个月照这个走', 0, NULL, 8, 1, NOW() - INTERVAL 4 DAY),
  (4, 3, 3, '酸汤鱼必须配他们家糯米酒', 0, NULL, 5, 1, NOW() - INTERVAL 7 DAY),
  (5, 4, 7, '手真稳，我做的时候直接敲裂两块', 0, NULL, 9, 1, NOW() - INTERVAL 10 DAY);

-- 同步话题下的游记数
UPDATE `t_topic` SET `post_count` = (SELECT COUNT(*) FROM `t_post` WHERE `t_post`.`topic_id` = `t_topic`.`id` AND `t_post`.`status` = 1);
