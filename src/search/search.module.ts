import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChannelSchema } from 'src/schemas/channel.schema';
import { QuerySchema } from 'src/schemas/query.schema';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

@Module({
    imports: [
        HttpModule,
        MongooseModule.forFeature([
            { name: 'Query', schema: QuerySchema },
            { name: 'Channel', schema: ChannelSchema }
        ]),
    ],
    controllers: [SearchController],
    providers: [SearchService],
})
export class SearchModule { }
