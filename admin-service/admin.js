import AdminJSFastify from '@adminjs/fastify'
import AdminJS from 'adminjs'
import Fastify from 'fastify'
import Account from '../auth-service/models/Account.js'
import * as AdminJSSequelize from '@adminjs/sequelize'

AdminJS.registerAdapter({
    Resource: AdminJSSequelize.Resource,
    Database: AdminJSSequelize.Database,
  })

const PORT = 1919

const start = async () => {

  const app = Fastify()
  const admin = new AdminJS({resources: [Account]})

  await AdminJSFastify.buildRouter(admin,app,)
  
  app.listen({ port: PORT }, (err, addr) => {
    if (err) {
      console.error(err)
    } else {
      console.log(`AdminJS started on http://localhost:${PORT}${admin.options.rootPath}`)
    }
  })
}

start()