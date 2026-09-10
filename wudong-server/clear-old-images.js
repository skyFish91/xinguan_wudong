const mysql = require('mysql2/promise');

async function clearOldImages() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3307,
    user: 'root',
    password: '15715659594',
    database: 'wudong'
  });

  try {
    // 清空所有景区的 main_image 字段，让它们使用默认图片匹配
    const [result] = await connection.execute(
      'UPDATE tvl_scenic SET main_image = "" WHERE main_image LIKE "/images/travel/%"'
    );

    console.log('清空旧图片路径成功，影响行数:', result.affectedRows);

    // 查询更新后的结果
    const [rows] = await connection.execute(
      'SELECT id, name, main_image FROM tvl_scenic ORDER BY id'
    );

    console.log('\n更新后的景区列表:');
    rows.forEach((row) => {
      console.log(`ID:${row.id} - ${row.name} - 图片:${row.main_image || '将使用默认匹配'}`);
    });

  } catch (error) {
    console.error('更新失败:', error);
  } finally {
    await connection.end();
  }
}

clearOldImages();
