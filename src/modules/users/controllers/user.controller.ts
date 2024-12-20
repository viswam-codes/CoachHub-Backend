import {
  Body,
  Controller,
  Post,
  BadRequestException,
  Res,
  HttpStatus,
  UseGuards,
  Req,
  Put,
} from '@nestjs/common';
import { UserService } from 'src/core/services/user.services';
import { RegisterUserDto } from '../dtos/register-user.dto';
import { VerifyOtpDto } from '../dtos/otp-verify.dto';
import { CompleteProfileDto } from '../dtos/profilecompletion.dto';
import { LoginDto } from '../dtos/login.dto';
import { Logger } from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard } from 'src/common/Guard/auth.guard';

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
    const { accessToken, refreshToken, user, isProfileCompleted } =
      await this.userService.login(loginDto);
    Logger.log(user);

    // Set the access token as an HTTP-only cookie
    res.cookie('access_token', accessToken, {
      httpOnly: true, // Prevent JavaScript access to cookies
      secure: process.env.NODE_ENV === 'production', // Enable only on HTTPS in production
      sameSite: 'lax', // CSRF protection
      maxAge: 60 * 60 * 1000, // 1 hour expiration
    });

    // Set the refresh token as an HTTP-only cookie
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(HttpStatus.OK).json({
      message: 'User login successful',
      user: user,
      isProfileCompleted: isProfileCompleted,
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

  @UseGuards(AuthGuard)
  @Put('complete-profile')
  async completeProfile(
    @Body() completeProfileDto: CompleteProfileDto,
    @Req() req: Request & { user?: { email: string; id: string } },
    @Res() res: Response,
  ) {
    try {
      const user = req.user; // Access attached user details
      if (!user) {
        throw new Error('User not found in the request object');
      }

      const updatedUser = await this.userService.completeProfile({
        ...completeProfileDto,
        email: user.email,
      });

      return res.status(HttpStatus.OK).json({
        message: 'Profile completed successfully.',
        user: updatedUser,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: error.message || 'Failed to complete profile',
      });
    }
  }


  @UseGuards(AuthGuard) // Ensures only authenticated users can log out
@Post('logout')
async logout(
  @Req() req: Request & { user?: { email: string; id: string } },
  @Res() res: Response,
) {
  try {
    // Get the user details from the request object
    const user = req.user;
    if (!user) {
      throw new BadRequestException('User not found in the request object');
    }

    // Invalidate the refresh token in the database
    await this.userService.invalidateRefreshToken(user.id);

    // Clear the cookies for access and refresh tokens
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return res.status(HttpStatus.OK).json({
      message: 'User logged out successfully.',
    });
  } catch (error) {
    return res.status(HttpStatus.BAD_REQUEST).json({
      message: error.message || 'Failed to log out',
    });
  }
}
}
