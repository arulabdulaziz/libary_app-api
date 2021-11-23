import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Response from 'App/Helpers/Response'
import Book from 'App/Models/Book'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
// import Database from '@ioc:Adonis/Lucid/Database'
import AuthorsController from 'App/Controllers/AuthorsController'
import Author from 'App/Models/Author'
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
    // const books = await Database.from('books')
    //   .whereNull('deleted_at')
    //   .paginate(page, limit)
    const books = await Book.query().preload('author').paginate(page, limit)
    return response.status(200).json(Response.successResponseSimple(true, books))
  }

  public async create({}: HttpContextContract) {}

  public async store({ request, response }: HttpContextContract) {
    const newPostSchema = schema.create({
      title: schema.string({ trim: true }, [
        rules.unique({ table: 'books', column: 'title', where: { deleted_at: null } }),
      ]),
      title_arr: schema.string.optional(),
      categories: schema.array().members(schema.string()),
      author_id: schema.string(),
    })
    await request.validate({
      schema: newPostSchema,
      messages: {
        'required': 'The {{ field }} is required',
        'title.unique': 'Title already exist',
        'categories.*.string': 'The categories must be an array of string',
      },
    })
    const { title, title_arr, author_id } = request.body()
    const author = await Author.find(author_id)
    if (!author) return response.status(400).json(AuthorsController.responseAuthorNotFound())
    const newBook = await Book.create({
      title,
      title_arr,
      author_id,
    })
    response.status(201).json(Response.successResponseSimple(true, newBook))
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
    return response.status(200).json(Response.successResponseSimple(true, book))
  }

  public async edit({}: HttpContextContract) {}

  public async update({ request, response }: HttpContextContract) {
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
    })
    await request.validate({
      schema: newPostSchema,
      messages: {
        'required': 'The {{ field }} is required',
        'categories.*.string': 'The categories must be an array of string',
      },
    })
    const { title, title_arr, author_id } = request.body()
    const isExistBook = await Book.query().where('title', title).first()
    if (isExistBook && isExistBook.id != id) return response.status(400).json(BooksController.responseAlreadyExistTitle())
    const author = await Author.find(author_id)
    if (!author) return response.status(400).json(AuthorsController.responseAuthorNotFound())
    await book
      .merge({
        title,
        title_arr,
        author_id,
      })
      .save()
    return response.status(200).json(Response.successResponseSimple(true, book))
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
