import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Extract JWT from the Authorization header
      ignoreExpiration: false, // Ensure token expiration is validated
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key', // Use the same secret as JwtModule
    });
  }

  async validate(payload: { id: string; email: string }) {
    // Attach user info from token to the request object
    return { userId: payload.id, email: payload.email };
  }
}
