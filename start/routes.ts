/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'

Route.get('/', async () => {
  return { hello: 'world' }
})
Route.get('book', 'BooksController.index')
Route.get('book_by_category', 'BooksController.getByCategory')
Route.get('book_by_author', 'BooksController.getByAuthor')
Route.get('book_by_publisher', 'BooksController.getByPublisher')
Route.get('book_by_volume', 'BooksController.getByVolume')
Route.get('book_recomended', 'BooksController.getByRecomended')
Route.get('book/:id', 'BooksController.show')
Route.get('author', 'AuthorsController.index')
Route.get('author/:id', 'AuthorsController.show')
Route.get('publisher', 'PublishersController.index')
Route.get('publisher/:id', 'PublishersController.show')
Route.get('volume', 'VolumesController.index')
Route.get('volume/:id', 'VolumesController.show')
Route.get('category', 'CategoriesController.index')
Route.get('category/:id', 'CategoriesController.show')
Route.post('user/login', 'UsersController.login')
Route.group(() => {
  Route.group(() => {
    Route.resource('book', 'BooksController').apiOnly().except(['index', 'show'])
    Route.resource('user', 'UsersController').apiOnly()
    Route.resource('author', 'AuthorsController').apiOnly().except(['index', 'show'])
    Route.resource('category', 'CategoriesController').apiOnly().except(['index', 'show'])
    Route.resource('publisher', 'PublishersController').apiOnly().except(['index', 'show'])
    Route.resource('volume', 'VolumesController').apiOnly().except(['index', 'show'])
  }).middleware('checkIsAdmin')
}).middleware('auth:api')
