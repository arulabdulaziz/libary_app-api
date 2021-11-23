import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Response from 'App/Helpers/Response'
import Category from 'App/Models/Category'
export default class CategoriesController {
  static responseAlreadyExistCategory() {
    return Response.errorResponseSimple(false, [{ message: 'Category Already Exist' }])
  }
  static responseCategoryNotFound() {
    return Response.errorResponseSimple(false, [{ message: 'Category Not Found' }])
  }
  public async index({ request, response }: HttpContextContract) {
    const userReq = request.qs()
    const page = userReq.page ? userReq.page : 1
    const limit = userReq.limit ? userReq.limit : 20
    const search_item = userReq.search_item ? userReq.search_item : ''
    const categories = await Category.query()
      .where('name', 'like', `%${search_item}%`)
      .paginate(page, limit)
    return response.status(200).json(Response.successResponseSimple(true, categories))
  }

  public async create({}: HttpContextContract) {}

  public async store({ request, response }: HttpContextContract) {
    const newPostSchema = schema.create({
      name: schema.string({ trim: true }, [
        rules.unique({ table: 'categories', column: 'name', where: { deleted_at: null } }),
      ]),
    })
    await request.validate({
      schema: newPostSchema,
      messages: {
        'required': 'The {{ field }} is required',
        'name.unique': 'Category already exist',
      },
    })
    const { name } = request.body()
    const newCategory = await Category.create({ name })
    return response.status(201).json(Response.successResponseSimple(true, newCategory))
  }

  public async show({ request, response }: HttpContextContract) {
    const id = request.param('id')
    const category = await Category.find(id)
    if (!category) return response.status(404).json(CategoriesController.responseCategoryNotFound())
    return response.status(200).json(Response.successResponseSimple(true, category))
  }

  public async edit({}: HttpContextContract) {}

  public async update({ request, response }: HttpContextContract) {
    const id = request.param('id')
    const category = await Category.find(id)
    if (!category) return response.status(404).json(CategoriesController.responseCategoryNotFound())
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
    const isExistCategory = await Category.query().where('name', name).first()
    if (isExistCategory && isExistCategory.id != category.id)
      return response.status(400).json(CategoriesController.responseAlreadyExistCategory())
    await category.merge({ name }).save()
    return response.status(200).json(Response.successResponseSimple(true, category))
  }

  public async destroy({ request, response }: HttpContextContract) {
    const id = request.param('id')
    const category = await Category.find(id)
    if (!category) return response.status(404).json(CategoriesController.responseCategoryNotFound())
    await category.delete()
    return response.status(200).json(Response.successResponseSimple(true, category))
  }
}
