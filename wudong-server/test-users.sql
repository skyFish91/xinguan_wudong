-- 创建测试用户账号
-- 密码使用 md5 加密：md5('123456') = 'e10adc3949ba59abbe56e057f20f883e'

-- 插入测试用户
INSERT INTO `usr_user` (
  `uuid`,
  `phone`,
  `password`,
  `nickname`,
  `avatar`,
  `gender`,
  `status`,
  `role`,
  `bio`,
  `region`,
  `violation_cnt`,
  `create_time`,
  `update_time`
) VALUES
(
  'testuser001',
  '13800138000',
  'e10adc3949ba59abbe56e057f20f883e',
  '测试用户',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=test',
  1,
  1,
  'USER',
  '这是一个测试用户账号',
  '贵州省黔东南',
  0,
  NOW(),
  NOW()
);

-- 再插入几个不同的测试用户，用于测试关注、评论等功能
INSERT INTO `usr_user` (
  `uuid`,
  `phone`,
  `password`,
  `nickname`,
  `avatar`,
  `gender`,
  `status`,
  `role`,
  `bio`,
  `region`,
  `violation_cnt`,
  `create_time`,
  `update_time`
) VALUES
(
  'testuser002',
  '13800138001',
  'e10adc3949ba59abbe56e057f20f883e',
  '旅行达人小王',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=user2',
  1,
  1,
  'USER',
  '热爱旅行，记录生活',
  '贵州省黔东南',
  0,
  NOW(),
  NOW()
),
(
  'testuser003',
  '13800138002',
  'e10adc3949ba59abbe56e057f20f883e',
  '摄影师张三',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=user3',
  1,
  1,
  'USER',
  '用镜头记录世界',
  '贵州省黔东南',
  0,
  NOW(),
  NOW()
),
(
  'testuser004',
  '13800138003',
  'e10adc3949ba59abbe56e057f20f883e',
  '美食博主李四',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=user4',
  2,
  1,
  'USER',
  '探寻美食，分享快乐',
  '贵州省黔东南',
  0,
  NOW(),
  NOW()
);

-- 查询创建的测试用户
SELECT id, phone, nickname, role, status FROM usr_user WHERE phone LIKE '138001380%';
