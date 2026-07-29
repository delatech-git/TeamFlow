import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

// A single request shouldn't be able to take the whole dev server down —
// log and keep running instead of crashing the process.
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception (server kept running):', error);
});
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection (server kept running):', reason);
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',')
    : ['http://localhost:3000', 'http://localhost:3001'];
  
  
    console.log('Allowed origins:', allowedOrigins);


  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT ?? 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`Server listening on port ${port}`);
}

bootstrap();
