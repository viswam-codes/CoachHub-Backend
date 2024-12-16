import {
  Body,
  Controller,
  Post,
  BadRequestException,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from 'src/core/services/user.services';
import { RegisterUserDto } from '../dtos/register-user.dto';
import { VerifyOtpDto } from '../dtos/otp-verify.dto';
import { LoginDto } from '../dtos/login.dto';
import { Logger } from '@nestjs/common';
import { Response } from 'express';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async register(@Body() registerUserDto: RegisterUserDto) {
    console.log('userData', registerUserDto);
    const user = await this.userService.register(registerUserDto);
    return { message: 'User registered successfully. OTP sent to your email.' };
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    const { token, user , isProfileCompleted } = await this.userService.login(loginDto);
    Logger.log(user);



    // Set the access token as an HTTP-only cookie
    res.cookie('access_token', token, {
      httpOnly: true, // Prevent JavaScript access to cookies
      secure: process.env.NODE_ENV === 'production', // Enable only on HTTPS in production
      sameSite: 'lax', // CSRF protection
      maxAge: 60 * 60 * 1000, // 1 hour expiration
    });
    return res.status(HttpStatus.OK).json({
      message: 'User login successful',
      user: user,
      isProfileCompleted:isProfileCompleted
    });
  }

  @Post('verify-otp')
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    const result = await this.userService.verifyOTP(
      verifyOtpDto.email,
      verifyOtpDto.otp,
    );
    return {
      message: result
        ? 'OTP verified successfully.'
        : 'OTP verification failed.',
    };
  }

  @Post('resend-otp')
  async resendOtp(@Body('email') email: string) {
    try {
      const result = await this.userService.resendOtp(email); // Await the service response
      return { success: result, message: 'OTP has been resent to your email' }; // Return the proper object
    } catch (error) {
      throw new BadRequestException(error.message || 'Failed to resend OTP');
    }
  }
}
