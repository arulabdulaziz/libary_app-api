import { DateTime } from 'luxon'
import { BaseModel, column, beforeCreate } from '@ioc:Adonis/Lucid/Orm'
import { uuid } from 'uuidv4'

export default class Book extends BaseModel {
  public static selfAssignPrimaryKey = true
  @column({ isPrimary: true, prepare: (value: string) => (value ? value : uuid()) })
  public id: string
  @beforeCreate()
  public static assignUuid(book: Book) {
    book.id = uuid()
  }
  @column()
  public title: string
  @column()
  public title_arr: string
  @column()
  public author_id: string
  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
