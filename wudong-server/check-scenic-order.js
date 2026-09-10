const mysql = require('mysql2/promise');

async function checkScenicOrder() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3307,
    user: 'root',
    password: '15715659594',
    database: 'wudong'
  });

  try {
    const [scenics] = await connection.query('SELECT id, name FROM tvl_scenic ORDER BY id');

    console.log('数据库中的景区顺序：');
    console.log('====================================');
    scenics.forEach((scenic, index) => {
      console.log(`ID: ${scenic.id} | 索引: ${index} | 名称: ${scenic.name}`);
    });

  } catch (error) {
    console.error('查询失败:', error.message);
  } finally {
    await connection.end();
  }
}

checkScenicOrder();
