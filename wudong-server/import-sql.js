const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function importSQL() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3307,
    user: 'root',
    password: '15715659594',
    database: 'wudong',
    multipleStatements: true,
  });

  console.log('Connected to MySQL');

  const sqlFile = path.join(__dirname, '../docs/database/05-板块四-行.sql');
  const sql = fs.readFileSync(sqlFile, 'utf8');

  console.log('Executing SQL...');
  await connection.query(sql);

  console.log('✅ SQL imported successfully!');
  await connection.end();
}

importSQL().catch(err => {
  console.error('❌ Import failed:', err.message);
  process.exit(1);
});
