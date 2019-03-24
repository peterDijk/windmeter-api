import { JsonController, Post, Param, Get, Authorized, BodyParam, CurrentUser, NotFoundError } from 'routing-controllers'
import * as bcrypt from 'bcrypt'
import { sign } from '../jwt'
import User from '../users/entity';
import {Device} from './entity'
// import { io } from '../index'

@JsonController()
export default class DeviceController {

  @Authorized()
  @Post('/devices')
  async register(
    @BodyParam('deviceId') deviceId: string,
    @CurrentUser() user: User,

  ) {

    const deviceIdHashed = await bcrypt.hash(deviceId.toString(), 10)

    const device = await Device.create({deviceId, deviceIdHashed, user})
    device.save()

    const jwtObj = sign({id: undefined, isAdmin: undefined, deviceId: deviceIdHashed}, 0)

    return {deviceJwt: jwtObj}
  }

  @Authorized()
  @Get('/devices/:id([0-9]+)')
  getDevice(
    @Param('id') id: number
  ) {
    return Device.findOne(id)
  }

  @Authorized()
  @Get('/devices/:id([0-9]+)/key')
  async getUser(
    @Param('id') id: number
  ) {

    const device = await Device.findOne(id)
    if (!device) throw new NotFoundError('device not found')
    const jwtObj = sign({id: undefined, isAdmin: undefined, deviceId: device.deviceIdHashed}, 0)
    return {deviceJwt: jwtObj}
  }

  @Authorized()
  @Get('/devices')
  allDevices() {
    return Device.find()
  }
}
