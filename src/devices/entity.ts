import { BaseEntity, PrimaryGeneratedColumn, Column, Entity, Timestamp, ManyToOne, OneToMany} from 'typeorm'
import User from '../users/entity'
import {Windspeed} from '../windspeeds/entity'


@Entity()
export class Device extends BaseEntity {

  @PrimaryGeneratedColumn()
  id?: number

  @Column('text', {nullable: true})
  deviceId: string

  @Column('text', {nullable: true})
  deviceIdHashed: string

  @Column('timestamptz', {nullable: false, default: () => `now()`})
  dateCreated: Timestamp

  @ManyToOne(_ => User, user => user.devices)
  user: User

  @OneToMany(_ => Windspeed, windspeed => windspeed.device)
  windspeeds: Windspeed[]

  // @ManyToOne(_ => User, user => user.events)
  // user: User

}