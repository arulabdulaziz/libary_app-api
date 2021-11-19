import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Response from 'App/Helpers/Response'
import Book from 'App/Models/Book'
import { schema } from '@ioc:Adonis/Core/Validator'

export default class BooksController {
  public async index({}: HttpContextContract) {
    const books = await Book.all()
    return Response.successResponseSimple(true, books)
  }

  public async create({ }: HttpContextContract) {}

  public async store({ request, response }: HttpContextContract) {
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
        'categories.*.string': "The categories must be an array of string"
      },
    })
    const {title, title_arr, author_id} = request.body()
    const newBook = await Book.create({
      title, title_arr, author_id
    })
    response.status(201).json(Response.successResponseSimple(true, newBook))
  }

  public async show({}: HttpContextContract) {}

  public async edit({}: HttpContextContract) {}

  public async update({}: HttpContextContract) {}

  public async destroy({}: HttpContextContract) {}
}
