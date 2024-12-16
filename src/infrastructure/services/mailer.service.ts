import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer'
import { IMailService } from 'src/core/interfaces/mail-service.interface';

@Injectable()
export class MailerService implements IMailService {
    private transporter : nodemailer.Transporter;

    constructor(){
        this.transporter = nodemailer.createTransport({
            host:process.env.EMAIL_HOST,
            port:Number(process.env.EMAIL_PORT),
            secure:process.env.EMAIL_SECURE === 'true',
            auth:{
                user: process.env.EMAIL_USER, // Your email username
                pass: process.env.EMAIL_PASSWORD, // Your email password
            },
        });
    }

    async sendMail(to:string,subject:string,text:string,html?:string):Promise<void>{
        const mailOptions={
            from:process.env.EMAIL_FROM,
            to,
            subject,
            text,
            html,
        }
        await this.transporter.sendMail(mailOptions);
    }

    
}
