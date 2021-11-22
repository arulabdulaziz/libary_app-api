import { DateTime } from 'luxon'
import { BaseModel, column, beforeCreate, beforeSave } from '@ioc:Adonis/Lucid/Orm'
import { uuid } from 'uuidv4'
import { compose } from '@ioc:Adonis/Core/Helpers'
import { SoftDeletes } from '@ioc:Adonis/Addons/LucidSoftDeletes'
import Hash from '@ioc:Adonis/Core/Hash'
export default class User extends compose(BaseModel, SoftDeletes) {
  public static selfAssignPrimaryKey = true
  @column({ isPrimary: true, prepare: (value: string) => (value ? value : uuid()) })
  public id: string
  @beforeCreate()
  public static assignUuid(user: User) {
    user.id = uuid()
  }
  @beforeSave()
  public static async hashPassword(user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password)
    }
  }
  @column()
  public name: string
  @column()
  public email: string
  @column()
  public password: string
  @column()
  public role: 'admin' | 'user'
  @column.dateTime({ serializeAs: null })
  public deleted_at: DateTime
  @column.dateTime({ autoCreate: true })
  public created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updated_at: DateTime
}
