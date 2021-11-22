import { DateTime } from 'luxon'
import { BaseModel, column, beforeCreate } from '@ioc:Adonis/Lucid/Orm'
import { uuid } from 'uuidv4'
import { compose } from '@ioc:Adonis/Core/Helpers'

import { SoftDeletes } from '@ioc:Adonis/Addons/LucidSoftDeletes'

export default class Author extends compose(BaseModel, SoftDeletes) {
  public static selfAssignPrimaryKey = true
  @column({ isPrimary: true })
  public id: string
  @beforeCreate()
  public static assignUuid(author: Author) {
    author.id = uuid()
  }
  @column()
  public name: string
  @column()
  public name_arr: string
  @column.dateTime({ autoCreate: true })
  public created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updated_at: DateTime
}
