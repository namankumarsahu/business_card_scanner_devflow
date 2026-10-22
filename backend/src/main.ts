
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as express from 'express';
import { join } from 'path';
import { existsSync } from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);

  app.enableCors({
    origin: config.get<string[]>('corsOrigins'),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix('api');

  const swaggerConfig = new DocumentBuilder()
    .setTitle('AddressBook API')
    .setDescription(
      'Business card scanning and smart contact-management API',
    )
    .setVersion('1.0.0')
    .build();

  SwaggerModule.setup(
    'api/docs',
    app,
    SwaggerModule.createDocument(app, swaggerConfig),
    {
      jsonDocumentUrl: 'api/docs-json',
    },
  );

  // Serve the built React frontend
  const frontendPath = join(__dirname, '..', 'public');

  if (existsSync(join(frontendPath, 'index.html'))) {
    app.use(express.static(frontendPath));

    // Handle React client-side routes without intercepting API requests
    app.use((req, res, next) => {
      if (
        req.method === 'GET' &&
        !req.path.startsWith('/api') &&
        !req.path.includes('.')
      ) {
        return res.sendFile(join(frontendPath, 'index.html'));
      }

      next();
    });
  }

  const port = config.get<number>('port') || 3001;

  await app.listen(port, '0.0.0.0');

  console.log(`Server running on port ${port}`);
}

bootstrap();


// import { NestFactory } from '@nestjs/core';
// import { ValidationPipe } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
// import { AppModule } from './app.module';
// import * as express from 'express';
// import { join } from 'path';

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);

//   const config = app.get(ConfigService);

//   app.enableCors({
//     origin: config.get<string[]>('corsOrigins'),
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
//   });

//   app.useGlobalPipes(new ValidationPipe({
//     whitelist: true,
//     forbidNonWhitelisted: true,
//     transform: true,
//   }));

//   app.setGlobalPrefix('api');

//   const swaggerConfig = new DocumentBuilder()
//     .setTitle('AddressBook API')
//     .setDescription('Business card scanning and smart contact-management API')
//     .setVersion('1.0.0')
//     .build();
//   SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, swaggerConfig), {
//     jsonDocumentUrl: 'api/docs-json',
//   });

//   const port = config.get<number>('port') || 3001;
//   await app.listen(port);
//   console.log(`Server running on port ${port}`);
// }
// bootstrap();
