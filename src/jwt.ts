import * as jwt from 'jsonwebtoken'

export const secret = process.env.JWT_SECRET || ''

const expires = (hr: number) => {
  switch (hr) {
    case 0:
      return {}
    default:
      const ttl = 3600 * hr // our JWT tokens are valid for 4 hours
      return { expiresIn: ttl}
  }
}


interface JwtPayload {
  id?: number,
  isAdmin?: boolean,
  deviceId?: string
}

export const sign = (data: JwtPayload, expire: number) =>
  jwt.sign(data, secret, expires(expire))

export const verify = (token: string): JwtPayload =>
  jwt.verify(token, secret) as JwtPayload