const mysql = require('mysql2/promise');

async function clearRouteImages() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3307,
    user: 'root',
    password: '15715659594',
    database: 'wudong'
  });

  try {
    // 清空路线的旧图片路径
    const [result] = await connection.execute(
      'UPDATE tvl_route SET main_image = "" WHERE main_image LIKE "/images/travel/%"'
    );

    console.log('清空路线旧图片路径成功，影响行数:', result.affectedRows);

    // 查询更新后的结果
    const [rows] = await connection.execute(
      'SELECT id, title, main_image FROM tvl_route ORDER BY id'
    );

    console.log('\n更新后的路线列表:');
    rows.forEach((row) => {
      console.log(`ID:${row.id} - ${row.title} - 图片:${row.main_image || '将使用默认匹配'}`);
    });

  } catch (error) {
    console.error('更新失败:', error);
  } finally {
    await connection.end();
  }
}

clearRouteImages();
