import { Module } from '@nestjs/common';
import { MailerService } from '../services/mailer.service';



@Module({
    imports:[
        
    ],
    providers:[MailerService],
    exports:[MailerService]
})
export class InfrastructureModule {}
