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
import { uuid } from 'uuidv4'
import { DateTime } from 'luxon'
import Drive from '@ioc:Adonis/Core/Drive'

export default class BooksController {
  static responseBookNotFound() {
    return Response.errorResponseSimple(false, [{ message: 'Book Not Found' }])
  }
  static responseAlreadyExistTitle() {
    return Response.errorResponseSimple(false, [{ message: 'Title already exist' }])
  }
  static getParams(request) {
    const columnOrder = ['title', 'count']
    const userReq = request.qs()
    const page = userReq.page ? userReq.page : 1
    const limit = userReq.limit ? userReq.limit : 20
    const search_item = userReq.search_item ? userReq.search_item : ''
    const sort_by =
      !userReq.sort_by && columnOrder.find((e) => e === userReq.sort_by) ? 'title' : userReq.sort_by
    const sort = !userReq.sort
      ? 'asc'
      : userReq.sort != 'asc' && userReq.sort != 'desc'
      ? 'asc'
      : userReq.sort
    return { page, limit, search_item, sort_by, sort }
  }
  public async index({ response, request }: HttpContextContract) {
    const { page, limit, search_item, sort_by, sort } = BooksController.getParams(request)
    // const books = await Database.from('books')
    //   .whereNull('deleted_at')
    //   .paginate(page, limit)
    // const books = await Book.query()
    //   .where('title', 'like', `%${search_item}%`).orderBy(sort_by, sort)
    //   .whereHas('categories', (query) => query.where('category_id', '4f0623f3-267a-487a-be38-7bacd9e8f0ed'))
    //   .preload('author')
    //   .preload('categories')
    //   .preload('publisher')
    //   .preload('volume')
    //   .paginate(page, limit)
    const books = await Book.query()
      .where('title', 'like', `%${search_item}%`)
      .orderBy(sort_by, sort)
      .paginate(page, limit)
    return response.status(200).json(Response.successResponseSimple(true, books))
  }
  public async getByCategory({ request, response }: HttpContextContract) {
    const { page, limit, search_item, sort_by, sort } = BooksController.getParams(request)
    const category_id = request.qs().category_id ? request.qs().category_id : ''
    const books = await Book.query()
      .whereHas('categories', (query) => query.where('category_id', category_id))
      .where('title', 'like', `%${search_item}%`)
      .orderBy(sort_by, sort)
      .paginate(page, limit)
    return response.status(200).json(Response.successResponseSimple(true, books))
  }
  public async getByAuthor({ request, response }: HttpContextContract) {
    const { page, limit, search_item, sort_by, sort } = BooksController.getParams(request)
    const author_id = request.qs().author_id ? request.qs().author_id : ''
    const books = await Book.query()
      .where('author_id', author_id)
      .where('title', 'like', `%${search_item}%`)
      .orderBy(sort_by, sort)
      .paginate(page, limit)
    return response.status(200).json(Response.successResponseSimple(true, books))
  }
  public async getByPublisher({ request, response }: HttpContextContract) {
    const { page, limit, search_item, sort_by, sort } = BooksController.getParams(request)
    const publisher_id = request.qs().publisher_id ? request.qs().publisher_id : ''
    const books = await Book.query()
      .where('publisher_id', publisher_id)
      .where('title', 'like', `%${search_item}%`)
      .orderBy(sort_by, sort)
      .paginate(page, limit)
    return response.status(200).json(Response.successResponseSimple(true, books))
  }
  public async getByVolume({ request, response }: HttpContextContract) {
    const { page, limit, search_item, sort_by, sort } = BooksController.getParams(request)
    const volume_id = request.qs().volume_id ? request.qs().volume_id : ''
    const books = await Book.query()
      .where('volume_id', volume_id)
      .where('title', 'like', `%${search_item}%`)
      .orderBy(sort_by, sort)
      .paginate(page, limit)
    return response.status(200).json(Response.successResponseSimple(true, books))
  }
  public async getByRecomended({ request, response }: HttpContextContract) {
    const { page, limit, search_item, sort_by, sort } = BooksController.getParams(request)
    const books = await Book.query()
      .where('recomended', true)
      .where('title', 'like', `%${search_item}%`)
      .orderBy(sort_by, sort)
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
        cover: schema.file({
          size: '2mb',
          extnames: ['jpg', 'jpeg', 'png'],
        }),
        recomended: schema.boolean.optional(),
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
          'string': 'The {{field}} must be {{rule}}',
          'boolean': 'The {{field}} must be {{rule}} (true or false)',
        },
      })
      const { title, title_arr, author_id, categories, publisher_id, volume_id, recomended } =
        request.body()
      let count = request.body().count
      if ((count != 0 && !count) || !Number(count) || Number(count) < 0) count = 0
      count = Math.round(count)

      const author = await Author.find(author_id)
      if (!author) return response.status(400).json(AuthorsController.responseAuthorNotFound())
      const publisher = await Publisher.find(publisher_id)
      if (!publisher)
        return response.status(400).json(PublishersController.responsePublisherNotFound())
      const volume = await Volume.find(volume_id)
      if (!volume) return response.status(400).json(VolumesController.responseVolumeNotFound())
      const cover = request.file('cover')
      if (!cover)
        return response
          .status(200)
          .json(Response.errorResponseSimple(false, [{ message: 'Cover Required' }]))
      const id = uuid()
      const dateFormat = DateTime.fromJSDate(new Date()).toFormat('dd_LL_yyyy|TT.X')
      console.log('<<<<<<', id, '>>>>>>>>>')
      const nameCover = `BOOK-${id}-${dateFormat}.${cover.subtype}`
      const path = 'book/'
      await cover.moveToDisk(
        path,
        {
          name: nameCover,
          contentType: cover.headers['content-type'],
        },
        's3'
      )
      const pathNameCover = `${path}${nameCover}`
      const newBook = await Book.create({
        id,
        title,
        title_arr,
        recomended: recomended ? true : false,
        count,
        cover: pathNameCover,
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
      console.log(error, '<<< errior')
      await Database.rollbackGlobalTransaction()
      return response
        .status(error.status ? error.status : 500)
        .json(
          Response.errorResponseSimple(false, [
            error.code === 'E_VALIDATION_FAILURE' ? error.messages.errors : error,
          ])
        )
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
        recomended: schema.boolean.optional(),
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
          'string': 'The {{field}} must be {{rule}}',
          'boolean': 'The {{field}} must be {{rule}} (true or false)',
        },
      })
      const { title, title_arr, author_id, categories, publisher_id, volume_id, recomended } =
        request.body()
      let count = request.body().count
      if ((count != 0 && !count) || !Number(count) || Number(count) < 0) count = 0
      count = Math.round(count)
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
          recomended: recomended ? true : false,
          count,
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
      // await book.load('categories')
      // await book.load('author')
      // await book.load('publisher')
      // await book.load('volume')
      await Database.commitGlobalTransaction()
      return response.status(200).json(Response.successResponseSimple(true, book))
    } catch (error) {
      await Database.rollbackGlobalTransaction()
      return response
        .status(error.status ? error.status : 500)
        .json(
          Response.errorResponseSimple(false, [
            error.code === 'E_VALIDATION_FAILURE' ? error.messages.errors : error,
          ])
        )
    }
  }

  public async updateWithCover({ request, response }: HttpContextContract) {
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
        cover: schema.file({
          size: '2mb',
          extnames: ['jpg', 'jpeg', 'png'],
        }),
        recomended: schema.boolean.optional(),
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
          'string': 'The {{field}} must be {{rule}}',
          'boolean': 'The {{field}} must be {{rule}} (true or false)',
        },
      })
      const { title, title_arr, author_id, categories, publisher_id, volume_id, recomended } =
        request.body()
      let count = request.body().count
      if ((count != 0 && !count) || !Number(count) || Number(count) < 0) count = 0
      count = Math.round(count)
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
      const cover = request.file('cover')
      if (!cover)
        return response
          .status(200)
          .json(Response.errorResponseSimple(false, [{ message: 'Cover Required' }]))
      await Drive.use('s3').delete(book.cover)
      const dateFormat = DateTime.fromJSDate(new Date()).toFormat('dd_LL_yyyy|TT.X')
      console.log('<<<<<<', id, '>>>>>>>>>')
      const nameCover = `BOOK-${id}-${dateFormat}.${cover.subtype}`
      const path = 'book/'
      await cover.moveToDisk(
        path,
        {
          name: nameCover,
          contentType: cover.headers['content-type'],
        },
        's3'
      )
      const pathNameCover = `${path}${nameCover}`
      await book
        .merge({
          title,
          title_arr,
          author_id,
          publisher_id,
          volume_id,
          cover: pathNameCover,
          recomended: recomended ? true : false,
          count,
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
      // await book.load('categories')
      // await book.load('author')
      // await book.load('publisher')
      // await book.load('volume')
      await Database.commitGlobalTransaction()
      return response.status(200).json(Response.successResponseSimple(true, book))
    } catch (error) {
      await Database.rollbackGlobalTransaction()
      return response
        .status(error.status ? error.status : 500)
        .json(
          Response.errorResponseSimple(false, [
            error.code === 'E_VALIDATION_FAILURE' ? error.messages.errors : error,
          ])
        )
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
  public async destroyForce({ request, response }: HttpContextContract) {
    const id = request.param('id')
    const book = await Book.find(id)
    if (!book) {
      return response
        .status(404)
        .json(Response.errorResponseSimple(false, BooksController.responseBookNotFound()))
    }
    await Drive.use('s3').delete(book.cover)
    await book.forceDelete()
    return response.status(200).json(Response.successResponseSimple(true, book))
  }
}
