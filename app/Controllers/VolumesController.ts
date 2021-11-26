import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Response from 'App/Helpers/Response'
import Volume from 'App/Models/Volume'
export default class VolumesController {
  static responseAlreadyExistVolume() {
    return Response.errorResponseSimple(false, [{ message: 'Volume Already Exist' }])
  }
  static responseVolumeNotFound() {
    return Response.errorResponseSimple(false, [{ message: 'Volume Not Found' }])
  }
  public async index({ request, response }: HttpContextContract) {
    const userReq = request.qs()
    const page = userReq.page ? userReq.page : 1
    const limit = userReq.limit ? userReq.limit : 20
    const search_item = userReq.search_item ? userReq.search_item : ''
    // const volumes = await Volume.query()
    //   .where('name', 'like', `%${search_item}%`)
    //   .preload('books')
    //   .paginate(page, limit)
    const volumes = await Volume.query()
      .where('name', 'like', `%${search_item}%`)
      .paginate(page, limit)
    return response.status(200).json(Response.successResponseSimple(true, volumes))
  }

  public async store({ request, response }: HttpContextContract) {
    const newPostSchema = schema.create({
      name: schema.string({ trim: true }, [
        rules.unique({ table: 'volumes', column: 'name', where: { deleted_at: null } }),
      ]),
    })
    await request.validate({
      schema: newPostSchema,
      messages: {
        'required': 'The {{ field }} is required',
        'name.unique': 'Volumes already exist',
      },
    })
    const { name } = request.body()
    const newVolume = await Volume.create({ name })
    await newVolume.save()
    return response.status(201).json(Response.successResponseSimple(true, newVolume))
  }

  public async create({}: HttpContextContract) {}

  public async show({ request, response }: HttpContextContract) {
    const id = request.param('id')
    const volume = await Volume.find(id)
    if (!volume) {
      return response.status(404).json(VolumesController.responseVolumeNotFound())
    }
    await volume.load('books')
    return response.status(200).json(Response.successResponseSimple(true, volume))
  }

  public async edit({}: HttpContextContract) {}

  public async update({ request, response }: HttpContextContract) {
    const id = request.param('id')
    const volume = await Volume.find(id)
    if (!volume) {
      return response.status(404).json(VolumesController.responseVolumeNotFound())
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
    const volumeExisted = await Volume.findBy('name', name)
    if (volumeExisted && volumeExisted.id != volume.id)
      return response.status(400).json(VolumesController.responseAlreadyExistVolume())
    await volume.merge({ name }).save()
    return response.status(200).json(Response.successResponseSimple(true, volume))
  }

  public async destroy({ request, response }: HttpContextContract) {
    const id = request.param('id')
    const volume = await Volume.find(id)
    if (!volume) {
      return response.status(404).json(VolumesController.responseVolumeNotFound())
    }
    await volume.delete()
    return response.status(200).json(Response.successResponseSimple(true, volume))
  }
}
