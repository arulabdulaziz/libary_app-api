import { DateTime } from 'luxon'
import { BaseModel, column, beforeCreate, belongsTo, BelongsTo, manyToMany,ManyToMany } from '@ioc:Adonis/Lucid/Orm'
import { uuid } from 'uuidv4'
import { compose } from '@ioc:Adonis/Core/Helpers'
import { SoftDeletes } from '@ioc:Adonis/Addons/LucidSoftDeletes'
import Author from 'App/Models/Author'
import Category from 'App/Models/Category'
export default class Book extends compose(BaseModel, SoftDeletes) {
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
  @column.dateTime({ serializeAs: null })
  public deleted_at: DateTime
  @column.dateTime({ autoCreate: true })
  public created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updated_at: DateTime

  @belongsTo(() => Author, { localKey: 'id', foreignKey: 'author_id' })
  public author: BelongsTo<typeof Author>

  @manyToMany(() => Category, {
    pivotTable: 'book_categories',
    pivotForeignKey: 'book_id',
    pivotRelatedForeignKey: 'category_id',
    localKey: 'id',
    relatedKey: 'id',
    pivotTimestamps: true,
  })
  public categories: ManyToMany<typeof Category>
}
