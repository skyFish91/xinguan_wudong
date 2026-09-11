const mysql = require('mysql2/promise');

async function checkRoutes() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3307,
    user: 'root',
    password: '15715659594',
    database: 'wudong'
  });

  try {
    const [rows] = await connection.execute(
      'SELECT id, title, main_image FROM tvl_route ORDER BY id'
    );

    console.log('数据库中的路线:');
    rows.forEach((row) => {
      console.log(`ID:${row.id} - 标题:"${row.title}" - 图片:${row.main_image || '无'}`);
    });

  } catch (error) {
    console.error('查询失败:', error);
  } finally {
    await connection.end();
  }
}

checkRoutes();
