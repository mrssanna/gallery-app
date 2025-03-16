import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Application');
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Education app')
    .setDescription('The education API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  app.enableCors();

  // turn on validations for endpoints
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  const port = process.env.BACKEND_INNER_PORT || 3001;

  await app.listen(port);

  logger.log(`Application is running on: ${port}`);
}
// eslint-disable-next-line
bootstrap();
