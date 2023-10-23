import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { SearchModule } from './search/search.module';
import { StoreModule } from './store/store.module';
import { ResultModule } from './result/result.module';
import { AppController } from './app.controller';
import { LoggerMiddleware } from './utils/logger.middleware';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        MongooseModule.forRoot(process.env.MONGO_URL),
        SearchModule,
        StoreModule,
        ResultModule,
    ],
    controllers: [AppController],
    providers: [],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(LoggerMiddleware).forRoutes('*');
    }
}
