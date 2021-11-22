import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import User from 'App/Models/User'

export default class UserSeeder extends BaseSeeder {
  public async run() {
    await User.createMany([
      {
        email: 'admin@mail.com',
        password: '12345678',
        role: 'admin',
        name: 'Admin',
      },
      {
        email: 'admin2@main.com',
        password: '12345678',
        role: 'admin',
        name: 'Admin2',
      },
    ])
  }
}
