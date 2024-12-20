import { Module } from '@nestjs/common';
import { UserController } from '../controllers/user.controller';
import { UserService } from 'src/core/services/user.services';
import { MongoUserRepository } from 'src/infrastructure/database/repositories/user.repository';
import { USER_REPOSITORY } from 'src/core/repositories/user.repository';
import { MailerService } from 'src/infrastructure/services/mailer.service';
import { MAIL_SERVICE } from 'src/core/interfaces/mail-service.interface';
import { TOKEN_SERVICE } from 'src/core/interfaces/jwt-token-interface';
import { InfrastructureModule } from 'src/infrastructure/modules/infrastructure.module';
import { AuthModule } from 'src/infrastructure/modules/jwt.module';
import { AuthService } from 'src/infrastructure/services/auth.service';
// import { AuthGuard } from 'src/common/Guard/auth.guard';

@Module({
  imports: [
    InfrastructureModule, // Handles MongoRepo and MongooseModule
    AuthModule
  
  ],
  controllers: [UserController], // Register the UserController
  providers: [
    {
      provide: USER_REPOSITORY, 
      useClass: MongoUserRepository,
    },
    {
      provide: MAIL_SERVICE,
      useClass: MailerService,
    },
    {
      provide:TOKEN_SERVICE,
      useClass:AuthService

    },
    UserService,
     // Provide UserService
  ],
})
export class UserModule {}
