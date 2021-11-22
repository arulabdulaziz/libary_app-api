import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Response from 'App/Helpers/Response'
import User from 'App/Models/User'
import Hash from '@ioc:Adonis/Core/Hash'
export default class UsersController {
  static responseUserNotFound() {
    return Response.errorResponseSimple(false, [{ message: 'User Not Found' }])
  }
  public async login({ request, response, auth }: HttpContextContract) {
    const newPostSchema = schema.create({
      email: schema.string({ trim: true }, [rules.email()]),
      password: schema.string({ trim: true }, [rules.minLength(8)]),
    })
    await request.validate({
      schema: newPostSchema,
      messages: {
        required: 'The {{ field }} is required',
        minLength: 'The {{ field }} min {{options.minLength}} character',
      },
    })
    const { email, password } = request.body()
    const user = await User.query().where('email', email).whereNull('deleted_at').first()
    if(!user){
      return response
        .status(401)
        .json(Response.errorResponseSimple(false, { message: 'Email or Password Invalid' }))
    }
    // Verify password
    if (!(await Hash.verify(user.password, password))) {
      return response
        .status(401)
        .json(Response.errorResponseSimple(false, { message: 'Email or Password Invalid' }))
    }

    // Generate token
    const token = await auth.use('api').generate(user)
    const data = {...user.$original, token: token.token}
    return response.status(200).json(Response.successResponseSimple(true, data))
  }
  public async index({}: HttpContextContract) {
    return {message: "index"}
  }

  public async create({}: HttpContextContract) {}

  public async store({ request, response }: HttpContextContract) {
    const newPostSchema = schema.create({
      name: schema.string({ trim: true }),
      email: schema.string({ trim: true }, [
        rules.email(),
        rules.unique({ table: 'users', column: 'email', where: { deleted_at: null } }),
      ]),
      password: schema.string({ trim: true }, [rules.minLength(8)]),
    })
    await request.validate({
      schema: newPostSchema,
      messages: {
        'required': 'The {{ field }} is required',
        'email.unique': 'Email already exist',
        'minLength': 'The {{ field }} min {{options.minLength}} character',
      },
    })
    const { email, password, name } = request.body()
    const newUser = await User.create({
      email,
      password,
      name,
    })
    return response.status(201).json(Response.successResponseSimple(true, newUser))
  }

  public async show({ request, response }: HttpContextContract) {
    const id = request.param('id')
    const user = await User.find(id)
    if (!user) return response.status(404).json(UsersController.responseUserNotFound())
    return response.status(200).json(Response.successResponseSimple(true, user))
  }

  public async edit({}: HttpContextContract) {}

  public async update({ request, response }: HttpContextContract) {
    const id = request.param('id')
    const user = await User.find(id)
    if (!user) {
      return response
        .status(404)
        .json(Response.errorResponseSimple(false, UsersController.responseUserNotFound()))
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
    user.name = name
    user.save()
    return response.status(200).json(Response.successResponseSimple(true, user))
  }

  public async destroy({ request, response }: HttpContextContract) {
    const id = request.param('id')
    const user = await User.find(id)
    if (!user) {
      return response
        .status(404)
        .json(Response.errorResponseSimple(false, UsersController.responseUserNotFound()))
    }
    await user.delete()
    return response.status(200).json(Response.successResponseSimple(true, user))
  }
}
