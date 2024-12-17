import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ITokenService } from 'src/core/interfaces/jwt-token-interface';

@Injectable()
export class AuthService implements ITokenService {
  

  constructor(private readonly jwtService: JwtService) {}

  async generateTokens(payload: { id: string; email: string }): Promise<{ accessToken: string; refreshToken: string; }> {
    // Access Token - expires in 1 hour
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '1h',
    });

    // Refresh Token - expires in 7 days
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }


  async verifyToken(token: string): Promise<{ email: string; id: string }> {
    try {
      const decoded = this.jwtService.verify(token);
       
      if (!decoded || !decoded.email || !decoded.id) {
        throw new UnauthorizedException('Invalid token payload');
      }
      return { email: decoded.email, id: decoded.id };
    } catch (error) {
      console.log(error)
      throw new UnauthorizedException('Token validation failed');
    }
  }
}
