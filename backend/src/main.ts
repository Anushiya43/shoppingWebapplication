import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // Enable CORS for frontends
  await app.listen(process.env.PORT ?? 3000);
  console.log(`Backend is running on: ${await app.getUrl()}`);
}
bootstrap();
