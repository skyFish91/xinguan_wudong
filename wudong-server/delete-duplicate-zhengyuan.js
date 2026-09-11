const mysql = require('mysql2/promise');

async function deleteDuplicate() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3307,
    user: 'root',
    password: '15715659594',
    database: 'wudong'
  });

  try {
    // 删除镇远古城 (ID 3)，保留镇远古镇 (ID 8)
    const [result] = await connection.execute(
      'DELETE FROM tvl_scenic WHERE id = 3'
    );

    console.log('删除镇远古城成功:', result);

    // 查询剩余景区
    const [rows] = await connection.execute(
      'SELECT id, name FROM tvl_scenic ORDER BY id'
    );

    console.log('\n剩余景区列表:');
    rows.forEach((row, index) => {
      console.log(`${index + 1}. ID:${row.id} - ${row.name}`);
    });

  } catch (error) {
    console.error('删除失败:', error);
  } finally {
    await connection.end();
  }
}

deleteDuplicate();
