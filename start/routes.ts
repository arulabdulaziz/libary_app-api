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
});
Route.get("book", "BooksController.index")
Route.get('book/:id', 'BooksController.show')
Route.get('author', 'AuthorsController.index')
Route.get('author/:id', 'AuthorsController.show')
Route.get('category', 'CategoriesController.index')
Route.get('category/:id', 'CategoriesController.show')
Route.post("user/login", "UsersController.login")
Route.group(() => {
  Route.group(() => {
    Route.resource("book", "BooksController").apiOnly().except(["index", "show"])
    Route.resource('user', 'UsersController').apiOnly()
    Route.resource('author', 'AuthorsController').apiOnly().except(['index', 'show'])
    Route.resource('category', 'CategoriesController').apiOnly().except(['index', 'show'])
  }).middleware('checkIsAdmin')
}).middleware('auth:api')
