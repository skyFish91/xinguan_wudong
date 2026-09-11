import { DefaultNamingStrategy, NamingStrategyInterface } from 'typeorm';
import { snakeCase } from 'typeorm/util/StringUtils';

/**
 * 全局 snake_case 命名策略
 *
 * 背景：设计文档 §15 规定库名 wudong、字段一律 snake_case（order_no / create_time）。
 * 而 Cool Admin 的实体属性是 camelCase（orderNo / createTime），TypeORM 默认
 * 会把属性名直接当列名，导致 synchronize 在 DDL 表上额外建出 orderNo / createTime
 * 等重复列（已实测在 ord_order 上发生）。
 *
 * 这里统一转成 snake_case，使 Cool 生态实体与 DDL 表结构对齐。
 * 显式写死 @Column({ name: 'xxx' }) 的优先，不受本策略影响。
 */
export class SnakeNamingStrategy
  extends DefaultNamingStrategy
  implements NamingStrategyInterface
{
  tableName(className: string, customName: string): string {
    return customName ? customName : snakeCase(className);
  }

  columnName(
    propertyName: string,
    customName: string,
    embeddedPrefixes: string[]
  ): string {
    return (
      snakeCase(embeddedPrefixes.join('_')) +
      (customName ? customName : snakeCase(propertyName))
    );
  }

  relationName(propertyName: string): string {
    return snakeCase(propertyName);
  }

  joinColumnName(relationName: string, referencedColumnName: string): string {
    return snakeCase(relationName + '_' + referencedColumnName);
  }

  joinTableName(
    firstTableName: string,
    secondTableName: string,
    firstPropertyName: string
  ): string {
    return snakeCase(
      firstTableName + '_' + firstPropertyName.replace(/\./gi, '_')
    );
  }

  joinTableColumnName(
    tableName: string,
    propertyName: string,
    columnName?: string
  ): string {
    return (
      snakeCase(tableName + '_' + (columnName ? columnName : propertyName))
    );
  }

  classTableInheritanceParentColumnName(
    parentTableName: any,
    parentTableIdPropertyName: any
  ): string {
    return snakeCase(parentTableName + '_' + parentTableIdPropertyName);
  }

  eagerJoinRelationAlias(alias: string, propertyPath: string): string {
    return alias + '__' + propertyPath.replace('.', '_');
  }
}
