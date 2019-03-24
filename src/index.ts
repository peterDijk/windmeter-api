import 'reflect-metadata'
import { Action, BadRequestError, useKoaServer } from 'routing-controllers'
import setupDb from './db'
import { verify } from './jwt'
import * as Koa from 'koa'
import {Server} from 'http'
import * as IO from 'socket.io'
import * as socketIoJwtAuth from 'socketio-jwt-auth'
import {secret} from './jwt'
import * as bcrypt from 'bcrypt'
import UserController from './users/controller'
import LoginController from './logins/controller'
import DeviceController from './devices/controller'
import WindspeedController from './windspeeds/controller'
import User from './users/entity'


const app = new Koa()
const server = new Server(app.callback())
export const io = IO(server)
const port = process.env.PORT || 4000

useKoaServer(app, {
  cors: true,
  controllers: [
    UserController,
    LoginController,
    DeviceController,
    WindspeedController
  ],
  authorizationChecker: async (action: Action) => {
    interface ParticleObject {
      event: string
      data: string
      coreid: string
      published_at: string
    }
    const header: string = action.request.headers.authorization
    const body: ParticleObject = action.request.body
    console.log('************** request body', body)

    if (header && header.startsWith('Bearer ')) {
      const [ , token ] = header.split(' ')
      
      try {
        
        if (!!(token && verify(token)) === true) {

          const {deviceId} = verify(token)
          if (deviceId) {
            console.log('device logging in')
            const deviceIdHashed = deviceId
            const deviceAuth = await bcrypt.compare(body.coreid, deviceIdHashed)
            if (deviceAuth === true) {
              console.log('match')
              return true
            } else {
              console.log('no match between deviceId and hashedId')
              return false
            }
          } else {
            return true
          }
        }
        // return !!(token && verify(token))
      }
      catch (e) {
        throw new BadRequestError(e)
      }
    }

    return false
  },
  currentUserChecker: async (action: Action) => {
    const header: string = action.request.headers.authorization
    if (header && header.startsWith('Bearer ')) {
      const [ , token ] = header.split(' ')
      
      if (token) {
        const {id} = verify(token)
        return User.findOne(id)
      }
    }
    return undefined
  }
})

io.use(socketIoJwtAuth.authenticate({ secret }, async (payload, done) => {
  const user = await User.findOne(payload.id)
  if (user) done(null, user)
  else done(null, false, `Invalid JWT user ID`)
}))

io.on('connect', socket => {
  const email = socket.request.user.email
  console.log(`User ${email} just connected`)

  socket.on('disconnect', () => {
    console.log(`User ${name} just disconnected`)
  })
})

setupDb()
  .then(_ => {
    server.listen(port)
    console.log(`Listening on port ${port}`)
  })
  .catch(err => console.error(err))
