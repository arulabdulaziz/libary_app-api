import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column, manyToMany, ManyToMany } from '@ioc:Adonis/Lucid/Orm'
import { uuid } from 'uuidv4'
import { compose } from '@ioc:Adonis/Core/Helpers'
import { SoftDeletes } from '@ioc:Adonis/Addons/LucidSoftDeletes'
import Book from 'App/Models/Book'
export default class Category extends compose(BaseModel, SoftDeletes) {
  public static selfAssignPrimaryKey = true
  @column({ isPrimary: true })
  public id: string
  @beforeCreate()
  public static assignUuid(category: Category) {
    category.id = uuid()
  }
  @column()
  public name: string
  @column.dateTime({ serializeAs: null })
  public deleted_at: DateTime
  @column.dateTime({ autoCreate: true })
  public created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updated_at: DateTime

  @manyToMany(() => Book, {
    pivotTable: 'book_categories',
    pivotForeignKey: 'category_id',
    pivotRelatedForeignKey: 'book_id',
    localKey: 'id',
    relatedKey: 'id',
    pivotTimestamps: true,
  })
  public books: ManyToMany<typeof Book>
}
