const mysql = require('mysql2/promise');

async function cleanData() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3307,
    user: 'root',
    password: '15715659594',
    database: 'wudong',
    multipleStatements: true
  });

  try {
    console.log('开始清理数据...');

    // 查询重复的景区
    const [scenics] = await connection.query('SELECT id, name FROM tvl_scenic ORDER BY id');
    console.log('\n当前景区列表：');
    scenics.forEach(s => console.log(`ID: ${s.id}, 名称: ${s.name}`));

    // 删除重复的景区（保留ID较小的，即原有的）
    const duplicateNames = ['西江千户苗寨', '荔波小七孔', '镇远古镇', '梵净山'];
    for (const name of duplicateNames) {
      const [rows] = await connection.query('SELECT id FROM tvl_scenic WHERE name = ? ORDER BY id', [name]);
      if (rows.length > 1) {
        // 保留第一个，删除其他的
        for (let i = 1; i < rows.length; i++) {
          await connection.query('DELETE FROM tvl_scenic WHERE id = ?', [rows[i].id]);
          console.log(`✅ 删除重复景区: ${name} (ID: ${rows[i].id})`);
        }
      }
    }

    // 查询所有路线
    const [routes] = await connection.query('SELECT id, title, days FROM tvl_route ORDER BY id');
    console.log('\n当前路线列表：');
    routes.forEach(r => console.log(`ID: ${r.id}, 标题: ${r.title}, 天数: ${r.days}`));

    // 删除一些路线，保留最有特色的（保留10条左右）
    const routesToDelete = [
      '织金洞探秘1日游',
      '青岩古镇美食半日游',
      '万峰林骑行1日游',
      '赤水丹霞瀑布2日游',
      '马岭河峡谷探险1日游',
      '黔灵山+天河潭1日游',
      '肇兴侗寨文化2日游'
    ];

    for (const title of routesToDelete) {
      const result = await connection.query('DELETE FROM tvl_route WHERE title = ?', [title]);
      if (result[0].affectedRows > 0) {
        console.log(`✅ 删除路线: ${title}`);
      }
    }

    // 最终统计
    const [scenicCount] = await connection.query('SELECT COUNT(*) as count FROM tvl_scenic');
    const [routeCount] = await connection.query('SELECT COUNT(*) as count FROM tvl_route');

    console.log('\n✅ 数据清理完成！');
    console.log(`当前景区数量: ${scenicCount[0].count}`);
    console.log(`当前路线数量: ${routeCount[0].count}`);

  } catch (error) {
    console.error('❌ 清理失败:', error.message);
  } finally {
    await connection.end();
  }
}

cleanData();
