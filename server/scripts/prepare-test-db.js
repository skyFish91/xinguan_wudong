/**
 * 准备测试库 wudong_test：创建数据库、授予权限、读取 DDL 将库名替换后全量执行（幂等，可重复运行）
 * 本地与 CI 共用：node scripts/prepare-test-db.js
 * 连接参数走环境变量，缺省与 test/helpers/db.ts 保持一致
 */
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function initializeTestDB() {
  let connection;
  try {
    // 连接 MySQL（不指定数据库，启用多语句模式用于 DDL 执行）
    connection = await mysql.createConnection({
      host: process.env.TEST_DB_HOST || '127.0.0.1',
      port: Number(process.env.TEST_DB_PORT || 3306),
      user: process.env.TEST_DB_USER || 'root',
      password: process.env.TEST_DB_PASSWORD || 'root',
      multipleStatements: true,
    });

    // 创建测试数据库（使用 execute 执行单条语句）
    await connection.execute('CREATE DATABASE IF NOT EXISTS wudong_test');
    console.log('数据库 wudong_test 已创建');

    // MySQL 8.0+ 兼容：root 用户已有最高权限，无需额外授权
    console.log('权限已就绪（root 用户默认拥有所有权限）');

    // 切换到测试数据库（使用 execute 执行单条语句）
    await connection.execute('USE wudong_test');

    // 读取并执行 DDL（多条语句需使用 query 而非 execute）
    const sqlPath = path.join(__dirname, '../../sql/01-ddl.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8').replace(/wudong/g, 'wudong_test');

    // 使用 query 而非 execute，以支持多条语句同时执行
    await connection.query(sql);
    console.log('测试库 wudong_test 已就绪');

    await connection.end();
  } catch (error) {
    console.error('初始化测试库失败：', error.message);
    process.exit(1);
  }
}

initializeTestDB();
