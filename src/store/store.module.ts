import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { MongooseModule } from '@nestjs/mongoose';
import { ChannelSchema } from 'src/schemas/channel.schema';
import { QuerySchema } from 'src/schemas/query.schema';
import { StoreController } from './store.controller';
import { StoreService } from './store.service';

@Module({
    imports: [
        HttpModule,
        MongooseModule.forFeature([
            { name: 'Query', schema: QuerySchema },
            { name: 'Channel', schema: ChannelSchema }
        ]),
        ElasticsearchModule.registerAsync({
            useFactory: async () => ({
                node: process.env.ES_NODE,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            })
        })
    ],
    controllers: [StoreController],
    providers: [StoreService],
    exports: [ElasticsearchModule]
})
export class StoreModule { }
