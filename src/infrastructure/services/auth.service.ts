import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ITokenService } from 'src/core/interfaces/jwt-token-interface';

@Injectable()
export class AuthService implements ITokenService {
  constructor(private readonly jwtService: JwtService) {}

  async generateToken(payload: { id: string; email: string }): Promise<string> {
    return this.jwtService.sign(payload); // Generates the JWT
  }

  async verifyToken(token: string): Promise<any> {
    try {
      return this.jwtService.verify(token); // Verifies token validity
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}
