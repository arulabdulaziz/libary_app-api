import { DateTime } from 'luxon'
import { BaseModel, column, beforeCreate, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import { uuid } from 'uuidv4'
import { compose } from '@ioc:Adonis/Core/Helpers'
import { SoftDeletes } from '@ioc:Adonis/Addons/LucidSoftDeletes'
import Book from 'App/Models/Book'

export default class Publisher extends compose(BaseModel, SoftDeletes) {
  public static selfAssignPrimaryKey = true
  @column({ isPrimary: true })
  public id: string
  @beforeCreate()
  public static assignUuid(publisher: Publisher) {
    publisher.id = uuid()
  }
  @column()
  public name: string

  @column.dateTime({ autoCreate: true })
  public created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updated_at: DateTime

  @hasMany(() => Book, {
    foreignKey: 'publisher_id', // defaults to authorId
    localKey: 'id', // defaults to id
  })
  public books: HasMany<typeof Book>
}
