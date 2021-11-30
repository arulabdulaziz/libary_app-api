import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Books extends BaseSchema {
  protected tableName = 'books'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.string('title')
      table.string('title_arr').nullable()
      table.string('cover').nullable()
      table.boolean('recomended').defaultTo(false)
      table.integer('count').defaultTo(0)
      table.uuid('author_id')
      table.uuid('publisher_id')
      table.uuid('volume_id')
      table.timestamp('deleted_at', { useTz: true }).nullable()

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
