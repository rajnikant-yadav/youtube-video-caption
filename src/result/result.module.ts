import { Module } from '@nestjs/common';
import { ResultController } from './result.controller';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { ResultService } from './result.service';

@Module({
  imports: [ElasticsearchModule.registerAsync({
    useFactory: async () => ({
        node: process.env.ES_NODE,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })
})],
  controllers: [ResultController],
  providers: [ResultService],
  exports: [ElasticsearchModule]
})
export class ResultModule { }
