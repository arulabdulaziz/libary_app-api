import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class BookCategories extends BaseSchema {
  protected tableName = 'book_categories'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.uuid('book_id')
      table.uuid('category_id')
      // table.uuid('book_id').unsigned().references('books.id')
      // table.uuid('category_id').unsigned().references('categories.id')
      table.unique(['book_id', 'category_id'])
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
