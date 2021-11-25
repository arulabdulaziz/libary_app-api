import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Response from 'App/Helpers/Response'
import Book from 'App/Models/Book'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Database from '@ioc:Adonis/Lucid/Database'
import AuthorsController from 'App/Controllers/AuthorsController'
import PublishersController from 'App/Controllers/PublishersController'
import VolumesController from 'App/Controllers/VolumesController'
import Author from 'App/Models/Author'
import Category from 'App/Models/Category'
import BookCategory from 'App/Models/BookCategory'
import Publisher from 'App/Models/Publisher'
import Volume from 'App/Models/Volume'
/**
 * https://stackoverflow.com/questions/55333574/how-to-use-db-transaction-comit-rollback-in-adonis-js/55461986
 * buat publisher_id di table book
 * buat table Publisher : name
 * buat CRUD publisher
 * relasi dengan book
 */
export default class BooksController {
  static responseBookNotFound() {
    return Response.errorResponseSimple(false, [{ message: 'Book Not Found' }])
  }
  static responseAlreadyExistTitle() {
    return Response.errorResponseSimple(false, [{ message: 'Title already exist' }])
  }
  public async index({ response, request }: HttpContextContract) {
    const userReq = request.qs()
    const page = userReq.page ? userReq.page : 1
    const limit = userReq.limit ? userReq.limit : 20
    const search_item = userReq.search_item ? userReq.search_item : ''
    // const books = await Database.from('books')
    //   .whereNull('deleted_at')
    //   .paginate(page, limit)
    const books = await Book.query()
      .where('title', 'like', `%${search_item}%`)
      .preload('author')
      .preload('categories')
      .preload('publisher')
      .preload('volume')
      .paginate(page, limit)
    return response.status(200).json(Response.successResponseSimple(true, books))
  }

  public async create({}: HttpContextContract) {}

  public async store({ request, response }: HttpContextContract) {
    await Database.beginGlobalTransaction()
    try {
      const newPostSchema = schema.create({
        title: schema.string({ trim: true }, [
          rules.unique({ table: 'books', column: 'title', where: { deleted_at: null } }),
        ]),
        title_arr: schema.string.optional(),
        categories: schema.array().members(schema.string()),
        author_id: schema.string(),
        publisher_id: schema.string(),
        volume_id: schema.string(),
      })
      await request.validate({
        schema: newPostSchema,
        messages: {
          'required': 'The {{ field }} is required',
          'title.unique': 'Title already exist',
          'categories.*.string': 'The categories must be an array of string',
        },
      })
      const { title, title_arr, author_id, categories, publisher_id, volume_id } = request.body()
      const author = await Author.find(author_id)
      if (!author) return response.status(400).json(AuthorsController.responseAuthorNotFound())
      const publisher = await Publisher.find(publisher_id)
      if (!publisher)
        return response.status(400).json(PublishersController.responsePublisherNotFound())
      const volume = await Volume.find(volume_id)
      if (!volume) return response.status(400).json(VolumesController.responseVolumeNotFound())
      const newBook = await Book.create({
        title,
        title_arr,
        author_id,
        publisher_id,
        volume_id,
      })
      const categoriesReq = Array()
      await newBook.related('categories').detach()
      for await (const e of categories) {
        const category = await Category.firstOrNew({ name: e }, { name: e })
        if (category.$isPersisted) {
        } else {
          category.save()
        }
        // console.log(category, '<<< category')
        categoriesReq.push(category.id)
      }
      await BookCategory.createMany(
        categoriesReq.map((e) => ({ book_id: newBook.id, category_id: e }))
      )
      await newBook.load('categories')
      await newBook.load('author')
      await newBook.load('publisher')
      await newBook.load('volume')
      await Database.commitGlobalTransaction()
      return response.status(201).json(Response.successResponseSimple(true, newBook))
    } catch (error) {
      console.log(error, "<<< errior")
      await Database.rollbackGlobalTransaction()
      return response
        .status(error.status ? error.status : 500)
        .json(Response.errorResponseSimple(false, [error]))
    }
  }

  public async show({ request, response }: HttpContextContract) {
    const id = request.param('id')
    const book = await Book.find(id)
    if (!book) {
      return response
        .status(404)
        .json(Response.errorResponseSimple(false, BooksController.responseBookNotFound()))
    }
    await book.load('author')
    await book.load('categories')
    await book.load('publisher')
    await book.load('volume')
    return response.status(200).json(Response.successResponseSimple(true, book))
  }

  public async edit({}: HttpContextContract) {}

  public async update({ request, response }: HttpContextContract) {
    await Database.beginGlobalTransaction()
    try {
      const id = request.param('id')
      const book = await Book.find(id)
      if (!book) {
        return response
          .status(404)
          .json(Response.errorResponseSimple(false, BooksController.responseBookNotFound()))
      }
      const newPostSchema = schema.create({
        title: schema.string({ trim: true }),
        title_arr: schema.string.optional(),
        categories: schema.array().members(schema.string()),
        author_id: schema.string(),
        publisher_id: schema.string(),
        volume_id: schema.string(),
      })
      await request.validate({
        schema: newPostSchema,
        messages: {
          'required': 'The {{ field }} is required',
          'categories.*.string': 'The categories must be an array of string',
        },
      })
      const { title, title_arr, author_id, categories, publisher_id, volume_id } = request.body()
      const isExistBook = await Book.query().where('title', title).first()
      if (isExistBook && isExistBook.id != id)
        return response.status(400).json(BooksController.responseAlreadyExistTitle())
      const author = await Author.find(author_id)
      if (!author) return response.status(400).json(AuthorsController.responseAuthorNotFound())
      const publisher = await Publisher.find(publisher_id)
      if (!publisher)
        return response.status(400).json(PublishersController.responsePublisherNotFound())
      const volume = await Volume.find(volume_id)
      if (!volume) return response.status(400).json(VolumesController.responseVolumeNotFound())
      await book
        .merge({
          title,
          title_arr,
          author_id,
          publisher_id,
          volume_id,
        })
        .save()
      const categoriesReq = Array()
      await book.related('categories').detach()
      for await (const e of categories) {
        const category = await Category.firstOrNew({ name: e }, { name: e })
        if (category.$isPersisted) {
        } else {
          category.save()
        }
        // console.log(category, '<<< category')
        categoriesReq.push(category.id)
      }
      await BookCategory.createMany(
        categoriesReq.map((e) => ({ book_id: book.id, category_id: e }))
      )
      await book.load('categories')
      await book.load('author')
      await book.load('publisher')
      await book.load('volume')
      await Database.commitGlobalTransaction()
      return response.status(200).json(Response.successResponseSimple(true, book))
    } catch (error) {
      await Database.rollbackGlobalTransaction()
      return response
        .status(error.status ? error.status : 500)
        .json(Response.errorResponseSimple(false, [error]))
    }
  }

  public async destroy({ request, response }: HttpContextContract) {
    const id = request.param('id')
    const book = await Book.find(id)
    if (!book) {
      return response
        .status(404)
        .json(Response.errorResponseSimple(false, BooksController.responseBookNotFound()))
    }
    await book.delete()
    return response.status(200).json(Response.successResponseSimple(true, book))
  }
}
