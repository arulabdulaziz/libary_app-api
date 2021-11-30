import { DateTime } from 'luxon'
import { BaseModel, column, beforeCreate, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import { uuid } from 'uuidv4'
import { compose } from '@ioc:Adonis/Core/Helpers'
import { SoftDeletes } from '@ioc:Adonis/Addons/LucidSoftDeletes'
import Book from 'App/Models/Book'

export default class Volume extends compose(BaseModel, SoftDeletes) {
  public static selfAssignPrimaryKey = true
  @column({ isPrimary: true, prepare: (value: string) => (value ? value : uuid()) })
  public id: string
  @beforeCreate()
  public static assignUuid(volume: Volume) {
    if (!volume.id) volume.id = uuid()
  }
  @column()
  public name: string
  @column()
  public cover: string

  @column.dateTime({ autoCreate: true })
  public created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updated_at: DateTime

  @hasMany(() => Book, {
    foreignKey: 'volume_id', // defaults to authorId
    localKey: 'id', // defaults to id
  })
  public books: HasMany<typeof Book>
}
