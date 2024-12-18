import { Module } from '@nestjs/common';
import { MailerService } from '../services/mailer.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from '../database/schemas/user.schema';
import { MongoUserRepository } from '../database/repositories/user.repository';



@Module({
    imports:[
        MongooseModule.forFeature([{name:'User',schema:UserSchema}])
    ],
    providers:[MongoUserRepository,MailerService],
    exports:[MongoUserRepository,MailerService,MongooseModule]
})
export class InfrastructureModule {}
