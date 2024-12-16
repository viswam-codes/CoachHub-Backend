import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalHttpExceptionFilter } from './common/Exception-Filter/http-exception.filter';
import { Logger } from '@nestjs/common';
import * as cookieParser from "cookie-parser"

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const logger = new Logger("Bootstrap");
  logger.log("Application is starting")
//Enable Cors
app.enableCors({
  origin:'http://localhost:3000', 
  methods:'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials:true,
  allowedHeaders: 'Content-Type,Authorization',
})

app.useGlobalFilters(new GlobalHttpExceptionFilter())
app.use(cookieParser());

  await app.listen(3000,()=>{
    logger.log("Application is running on http://localhost:3000")
  });
}
bootstrap();
