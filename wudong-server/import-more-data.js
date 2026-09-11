const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function importData() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3307,
    user: 'root',
    password: '15715659594',
    database: 'wudong',
    multipleStatements: true
  });

  try {
    const sqlFile = fs.readFileSync(path.join(__dirname, 'add_more_data_fixed.sql'), 'utf8');

    console.log('开始导入数据...');
    await connection.query(sqlFile);
    console.log('✅ 数据导入成功！');
    console.log('已添加 15 个景区和 15 条路线');
  } catch (error) {
    console.error('❌ 导入失败:', error.message);
  } finally {
    await connection.end();
  }
}

importData();
