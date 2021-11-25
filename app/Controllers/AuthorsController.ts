import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
// import Database from '@ioc:Adonis/Lucid/Database'
import Response from 'App/Helpers/Response'
import Author from 'App/Models/Author'

export default class AuthorsController {
  static responseAlreadyExistAuthor() {
    return Response.errorResponseSimple(false, [{ message: 'Author Already Exist' }])
  }
  static responseAuthorNotFound() {
    return Response.errorResponseSimple(false, [{ message: 'Author Not Found' }])
  }
  public async index({ response, request }: HttpContextContract) {
    const userReq = request.qs()
    const page = userReq.page ? userReq.page : 1
    const limit = userReq.limit ? userReq.limit : 20
    const search_item = userReq.search_item ? userReq.search_item : ''
    // const authors = await Database.from('authors').whereNull('deleted_at').paginate(page, limit)
    const authors = await Author.query()
      .where('name', 'like', `%${search_item}%`)
      .preload('books')
      .paginate(page, limit)
    return response.status(200).json(Response.successResponseSimple(true, authors))
  }

  public async create({}: HttpContextContract) {}

  public async store({ request, response }: HttpContextContract) {
    const newPostSchema = schema.create({
      name: schema.string({ trim: true }, [
        rules.unique({ table: 'authors', column: 'name', where: { deleted_at: null } }),
      ]),
    })
    await request.validate({
      schema: newPostSchema,
      messages: {
        'required': 'The {{ field }} is required',
        'name.unique': 'Author already exist',
      },
    })
    const { name, name_arr } = request.body()
    // const author = await Author.findBy('name', name)
    // if (author) {
    //   return response.status(400).json(AuthorsController.responseAlreadyExistAuthor())
    // }
    const newAuthor = await Author.create({ name, name_arr })
    return response.status(201).json(Response.successResponseSimple(true, newAuthor))
  }

  public async show({ request, response }: HttpContextContract) {
    const id = request.param('id')
    const author = await Author.find(id)
    if (!author) {
      return response.status(404).json(AuthorsController.responseAuthorNotFound())
    }
    await author.load('books')
    return response.status(200).json(Response.successResponseSimple(true, author))
  }

  public async edit({}: HttpContextContract) {}

  public async update({ request, response }: HttpContextContract) {
    const id = request.param('id')
    const author = await Author.find(id)
    if (!author) {
      return response.status(404).json(AuthorsController.responseAuthorNotFound())
    }
    const newPostSchema = schema.create({
      name: schema.string({ trim: true }),
    })
    await request.validate({
      schema: newPostSchema,
      messages: {
        required: 'The {{ field }} is required',
      },
    })
    const { name, name_arr } = request.body()
    const authorExisted = await Author.findBy('name', name)
    if (authorExisted) {
      if (authorExisted.id !== author.id) {
        return response.status(400).json(AuthorsController.responseAlreadyExistAuthor())
      }
    }
    await author.merge({ name, name_arr }).save()
    return response.status(200).json(Response.successResponseSimple(true, author))
  }

  public async destroy({ request, response }: HttpContextContract) {
    const id = request.param('id')
    const author = await Author.find(id)
    if (!author) {
      return response.status(404).json(AuthorsController.responseAuthorNotFound())
    }
    await author.delete()
    return response.status(200).json(Response.successResponseSimple(true, author))
  }
}
