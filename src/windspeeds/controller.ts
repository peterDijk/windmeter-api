import { JsonController, Get, Post, Authorized, BodyParam, Param, NotFoundError, Body } from 'routing-controllers'
// import * as bcrypt from 'bcrypt'
// import { sign } from '../jwt'
import {Device} from '../devices/entity'
import {Windspeed} from './entity'
import { Timestamp } from 'typeorm';
import { io } from '../index'

@JsonController()
export default class WindspeedController {

  @Authorized()
  @Post('/windspeeds')
  async register(
    @BodyParam('coreid') deviceId: string,
    @BodyParam('event') event: string,
    @BodyParam('data') windspeed: number,
    @BodyParam('published_at') published: Timestamp,
    @Body() body: Partial<Windspeed>

  ) {
    if (event === 's' || event === 'e_s') {
      console.log(body)
      const device = await Device.findOne({where: {deviceId}})
      if (!device) throw new NotFoundError('Device is not found')

      const speedStored = Windspeed.create({windspeed, device, published})
      const speed = await speedStored.save()

      io.emit('action', {
        type: 'NEW_SPEED',
        payload: speed
      })

      return speed
    }
  }

  @Get('/windspeeds/:deviceId([0-9]+)')
  async getSpeeds(
    @Param('deviceId') deviceId: number,
    // @Headers('Authorization') // use this to get the deviceId from the authent id then id in url not needed
  ) {
    const device = await Device.findOne(deviceId)
    if (!device) throw new NotFoundError('Device not found')
    console.log(device)
    const windspeeds = await Windspeed.find({where: {device}})
    

    return {windspeeds}
  }

  @Get('/windspeeds/:deviceId/latest')
  async getLatestSpeed(
    @Param('deviceId') deviceId: number,
  ) {
    const device = await Device.findOne(deviceId)
    if (!device) throw new NotFoundError('Device not found')
    console.log(device)
    const windspeed = await Windspeed.find({where: {device}, order: { published: 'DESC' }, skip: 0, take: 1 })
    

    return {windspeed}
  }

}
