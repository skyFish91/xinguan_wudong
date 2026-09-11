const mysql = require('mysql2/promise');

async function checkData() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3307,
    user: 'root',
    password: '15715659594',
    database: 'wudong'
  });

  try {
    console.log('=== 景区数据 ===');
    const [scenics] = await connection.execute(
      'SELECT id, name, intro FROM tvl_scenic LIMIT 3'
    );
    scenics.forEach((scenic) => {
      console.log(`ID:${scenic.id} - ${scenic.name}`);
      console.log(`简介: ${scenic.intro ? scenic.intro.substring(0, 50) + '...' : '无'}`);
      console.log('---');
    });

    console.log('\n=== 路线数据 ===');
    const [routes] = await connection.execute(
      'SELECT id, title, days FROM tvl_route LIMIT 5'
    );
    routes.forEach((route) => {
      console.log(`ID:${route.id} - ${route.title} - ${route.days}天`);
    });

  } catch (error) {
    console.error('查询失败:', error);
  } finally {
    await connection.end();
  }
}

checkData();
