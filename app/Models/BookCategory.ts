import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column } from '@ioc:Adonis/Lucid/Orm'
import { uuid } from 'uuidv4'

export default class BookCategory extends BaseModel {
  public static selfAssignPrimaryKey = true
  @column({ isPrimary: true, prepare: (value: string) => (value ? value : uuid()) })
  public id: string
  @beforeCreate()
  public static assignUuid(book_category: BookCategory) {
    book_category.id = uuid()
  }
  @column()
  public book_id: string
  @column()
  public category_id: string
  @column.dateTime({ autoCreate: true })
  public created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updated_at: DateTime
}
