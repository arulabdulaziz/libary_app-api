import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
// import Database from '@ioc:Adonis/Lucid/Database'
import Response from 'App/Helpers/Response'
import Publisher from 'App/Models/Publisher'
export default class PublishersController {
  static responseAlreadyExistPublisher() {
    return Response.errorResponseSimple(false, [{ message: 'Publisher Already Exist' }])
  }
  static responsePublisherNotFound() {
    return Response.errorResponseSimple(false, [{ message: 'Publisher Not Found' }])
  }
  public async index({ request, response }: HttpContextContract) {
    const userReq = request.qs()
    const page = userReq.page ? userReq.page : 1
    const limit = userReq.limit ? userReq.limit : 20
    const search_item = userReq.search_item ? userReq.search_item : ''
    // const publishers = await Publisher.query()
    //   .where('name', 'like', `%${search_item}%`)
    //   .preload('books')
    //   .paginate(page, limit)
    const publishers = await Publisher.query()
      .where('name', 'like', `%${search_item}%`)
      .paginate(page, limit)
    return response.status(200).json(Response.successResponseSimple(true, publishers))
  }

  public async create({}: HttpContextContract) {}

  public async store({ request, response }: HttpContextContract) {
    const newPostSchema = schema.create({
      name: schema.string({ trim: true }, [
        rules.unique({ table: 'publishers', column: 'name', where: { deleted_at: null } }),
      ]),
    })
    await request.validate({
      schema: newPostSchema,
      messages: {
        'required': 'The {{ field }} is required',
        'name.unique': 'Publisher already exist',
      },
    })
    const { name } = request.body()
    // const publisher = await Publisher.findBy('name', name)
    // if (publisher) {
    //   return response.status(400).json(PublishersController.responseAlreadyExistPublisher())
    // }
    const newPublisher = await Publisher.create({ name })
    return response.status(201).json(Response.successResponseSimple(true, newPublisher))
  }

  public async show({ request, response }: HttpContextContract) {
    const id = request.param('id')
    const publisher = await Publisher.find(id)
    if (!publisher) {
      return response.status(404).json(PublishersController.responsePublisherNotFound())
    }
    await publisher.load('books')
    return response.status(200).json(Response.successResponseSimple(true, publisher))
  }

  public async edit({}: HttpContextContract) {}

  public async update({ request, response }: HttpContextContract) {
    const id = request.param('id')
    const publisher = await Publisher.find(id)
    if (!publisher) {
      return response.status(404).json(PublishersController.responsePublisherNotFound())
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
    const { name } = request.body()
    const pusblisherExisted = await Publisher.findBy('name', name)
    if (pusblisherExisted && pusblisherExisted.id != publisher.id)
      return response.status(400).json(PublishersController.responseAlreadyExistPublisher())
    await publisher.merge({ name }).save()
    return response.status(200).json(Response.successResponseSimple(true, publisher))
  }

  public async destroy({ request, response }: HttpContextContract) {
    const id = request.param('id')
    const publisher = await Publisher.find(id)
    if (!publisher) {
      return response.status(404).json(PublishersController.responsePublisherNotFound())
    }
    await publisher.delete()
    return response.status(200).json(Response.successResponseSimple(true, publisher))
  }
}
