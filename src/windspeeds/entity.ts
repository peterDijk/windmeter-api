import { BaseEntity, PrimaryGeneratedColumn, Column, Entity, Timestamp, ManyToOne} from 'typeorm'
import {Device} from '../devices/entity'



@Entity()
export class Windspeed extends BaseEntity {

  @PrimaryGeneratedColumn()
  id?: number

  @Column('double precision', {nullable: false})
  windspeed: number

  @Column('timestamptz', {nullable: true})
  published: Timestamp

  @ManyToOne(_ => Device, device => device.windspeeds)
  device: Device

}