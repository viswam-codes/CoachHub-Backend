import * as bcrypt from 'bcrypt';
import {
  Injectable,
  Inject,
  BadRequestException,
  ConflictException,
  UnauthorizedException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../repositories/user.repository';
import { User } from '../entities/user.entitiy';
import {
  IMailService,
  MAIL_SERVICE,
} from '../interfaces/mail-service.interface';
import {
  ITokenService,
  TOKEN_SERVICE,
} from '../interfaces/jwt-token-interface';
import { LoginDto } from 'src/modules/users/dtos/login.dto';
import {
  generateOTP,
  calculateExpiry,
  sendOtpEmail,
} from '../utils/otp.helper';
import { RegisterUserDto } from 'src/modules/users/dtos/register-user.dto';
import { CompleteProfileDto } from 'src/modules/users/dtos/profilecompletion.dto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name); // Injecting the logger
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(MAIL_SERVICE) private readonly mailerService: IMailService,
    @Inject(TOKEN_SERVICE) private readonly tokenService: ITokenService,
  ) {}


  //User Registration
  async register(userData: RegisterUserDto): Promise<User> {
    const { username, email, phone, password } = userData;

    try {
      const existingUser = await this.userRepository.findByEmail(email);
      // Hash the password

      if (existingUser) {
        if (!existingUser.isVerified) {
          this.logger.warn(`User exists but is not verified: ${email}`);
          await this.handleUnverifiedUser(
            existingUser,
            username,
            phone,
            password,
          );
          throw new ConflictException(
            'User already exists but is not verified. OTP has been resent to your email.',
          );
        }
        this.logger.warn(`User already exists and is verified: ${email}`);
        throw new ConflictException('User already exists and is verified.');
      }
      // Generate OTP and create the user
      const hashedPassword = await bcrypt.hash(password, 10);
      const otp = generateOTP();

      const user = await this.userRepository.create({
        username,
        email,
        phone,
        passwordHash: hashedPassword,
        otp,
        otpExpiresAt: calculateExpiry(),
        isVerified: false,
      });
      const emailSent = await this.sendOtpEmail(email, otp);
      if (!emailSent) {
        throw new InternalServerErrorException('Failed to send OTP email');
      }
      return user;
    } catch (error) {
      console.error('Error during user registration:', error);
      if (error instanceof ConflictException) {
        throw error; // Known business error
      }
      throw new Error('An unexpected error occurred during registration');
    }
  }
 
  //User Login
  async login(userData: LoginDto): Promise<{ token: string , user:object , isProfileCompleted:boolean}> {
    const { email, password } = userData;
    this.logger.log(`User login attempt: ${email}`);
  
    const user = await this.userRepository.findByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      this.logger.error(`Invalid credentials for user: ${email}`);
      throw new UnauthorizedException('Invalid credentials');
    }
  
    if (!user.isVerified) {
      this.logger.warn(`User is not verified: ${email}`);
      throw new UnauthorizedException('User is not verified. Please verify your account.');
    }
    
    const isProfileCompleted = user.isProfileCompleted;
  
    const payload = { id: user.id, email: user.email };
    const token = await this.tokenService.generateTokens(payload); // Use AuthService here
    const {accessToken,refreshToken}=token;

    this.userRepository.update(user.id,{refreshToken});
    
    return {token:accessToken , user , isProfileCompleted };
  }
  

  //Handling unverified user helper method
  private async handleUnverifiedUser(
    existingUser: User,
    username: string,
    phone: string,
    password: string,
  ): Promise<void> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();

    const updates = {
      username,
      phone,
      passwordHash: hashedPassword,
      otp,
      otpExpiresAt: calculateExpiry(),
    };

    await this.userRepository.update(existingUser.id, updates);

    const emailSent = await this.sendOtpEmail(existingUser.email, otp);
    if (!emailSent) {
      this.logger.error(
        'Failed to send OTP to unverified user:',
        existingUser.email,
      );
      throw new Error('Failed to resend OTP email for unverified user');
    }
  }
  //OTP through Email helper method
  private async sendOtpEmail(email: string, otp: string): Promise<boolean> {
    try {
      const subject = 'Your OTP Code';
      const text = `Your OTP code is ${otp}. It is valid for 5 minutes.`;
      const html = `<p>Your OTP code is <strong>${otp}</strong>. It is valid for 5 minutes.</p>`;
      await this.mailerService.sendMail(email, subject, text, html);
      return true;
    } catch (error) {
      console.error('Error sending OTP email:', error);
      return false; // Fallback to indicate email failure
    }
  }

  //OTP Verification
  async verifyOTP(email: string, otp: string): Promise<boolean> {
    const user = await this.userRepository.findByEmail(email);
    if (!user || user.otp !== otp || user.otpExpiresAt < new Date()) {
      this.logger.error(`Invalid or expired OTP for user: ${email}`);
      throw new BadRequestException('Invalid or expired OTP');
    }
    await this.userRepository.update(user.id, { isVerified: true });
    this.logger.log(`OTP verified for user: ${email}`);
    return true;
  }


  //OTP Resend
  async resendOtp(email: string): Promise<boolean> {
    try {
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        this.logger.error(`User not found: ${email}`);
        throw new BadRequestException('User not found');
      }

      const otp = generateOTP();

      const emailSent = await this.sendOtpEmail(email, otp);
      if (!emailSent) {
        this.logger.error(`Failed to send OTP email to: ${email}`);
        throw new Error('Failed to send OTP email');
      }

      await this.userRepository.update(user.id, {
        otp,
        otpExpiresAt: calculateExpiry(),
      });
      this.logger.log(`OTP resent successfully to email: ${email}`);
      return true;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error; // Re-throw known exceptions
      }
      this.logger.error(
        `Error during OTP resend for ${email}: ${error.message}`,
        error.stack,
      ); // Log unknown errors
      throw new Error('An unexpected error occurred while resending OTP'); // Wrap unknown errors
    }
  }

//Profile Completion Service 

async completeProfile(profileData:CompleteProfileDto):Promise<User>{
  const {email,goal,gender,age,height,weight} = profileData;

  const user = await this.userRepository.findByEmail(email);
  if(!user){
    this.logger.error(`User not found: ${email}`);
    throw new BadRequestException("User not found");
  }

  //Update user profile

  const updateUser = await this.userRepository.update(user.id,{
    goal,
    gender,
    age,
    height,
    weight,
    isProfileCompleted:true,
  })

  this.logger.log(`Profile updated successfully for user: ${email}`);
  return updateUser;
}

}
