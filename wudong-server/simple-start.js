const { Bootstrap } = require('@midwayjs/bootstrap');

Bootstrap.configure({
  globalConfig: {
    keys: 'wudong_secret_key_20260909',
    koa: {
      port: process.env.PORT || 8888,
      hostname: '127.0.0.1',
    },
  },
})
  .run()
  .then(() => {
    console.log('========================================');
    console.log('✅ 服务启动成功！');
    console.log(`🚀 访问: http://127.0.0.1:${process.env.PORT || 8888}`);
    console.log('========================================');
  })
  .catch((err) => {
    console.error('❌ 启动失败:', err.message);
    process.exit(1);
  });
