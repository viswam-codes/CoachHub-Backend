import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './infrastructure/modules/database.module';
import { UserModule } from './modules/users/modules/user.module';
import { InfrastructureModule } from './infrastructure/modules/infrastructure.module';




@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes ConfigModule available globally
      envFilePath: '.env', // Path to your .env file
    }),
    DatabaseModule,
    UserModule,
    InfrastructureModule,
  ],

  exports:[],

  providers: []
})
export class AppModule {}

