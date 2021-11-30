import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Response from 'App/Helpers/Response'

export default class CheckIsAdmin {
  public async handle({ bouncer, response }: HttpContextContract, next: () => Promise<void>) {
    // code for middleware goes here. ABOVE THE NEXT CALL
    try {
      await bouncer.authorize('isAdmin')
      return next()
    } catch (error) {
      return response
        .status(401)
        .json(Response.errorResponseSimple(false, [{ message: 'You not Authorization', error, }]))
    }
  }
}
