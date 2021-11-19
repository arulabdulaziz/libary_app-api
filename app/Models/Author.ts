import { DateTime } from 'luxon'
import { BaseModel, column, beforeCreate } from '@ioc:Adonis/Lucid/Orm'
import { uuid } from 'uuidv4'

export default class Author extends BaseModel {
  @column({ isPrimary: true })
  public id: string
  @beforeCreate()
  public static assignUuid(author: Author) {
    author.id = uuid()
  }
  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
