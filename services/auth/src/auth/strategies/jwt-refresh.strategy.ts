import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { JwtPayload } from '@oppi/types'
import { env } from '../../config/env'

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: env.JWT_REFRESH_SECRET,
      passReqToCallback: true,
    })
  }

  validate(
    request: { headers: { authorization?: string } },
    payload: JwtPayload,
  ): { sub: string; email: string; refreshToken: string } {
    const refreshToken = request.headers.authorization?.replace('Bearer ', '') ?? ''
    return { sub: payload.sub, email: payload.email, refreshToken }
  }
}
