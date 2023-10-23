import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.enableCors();
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
        }),
    );

    const config = new DocumentBuilder()
        .setTitle('YT Caption Search')
        .setDescription('Youtube Caption Search API Docs by Sachin Prasad')
        .setVersion('1.0')
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);

    await app.listen(process.env.PORT, () =>
        console.log(`Server is Running at http://localhost:${process.env.PORT}`),
    );
}
bootstrap();
