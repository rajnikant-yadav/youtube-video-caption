import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import { HydratedDocument, Document } from 'mongoose';
import { Video } from './video.schema';

export type QueryDoc = HydratedDocument<Query>;

@Schema()
export class Query extends Document {
    @Prop({ required: true })
    domain: string;

    @Prop({ required: true })
    keyword: string;

    @Prop({ default: '' })
    channelName: string;

    @Prop({ default: '' })
    nextPageToken: string;

    @Prop({ default: [] })
    videoId: Video[];

    @Prop({ default: '' })
    publishedAfter: string;

    @Prop({ default: '' })
    publishedBefore: string;

    @Prop({ default: 0 })
    totalCount: number

    @Prop({ default: [] })
    failedVideos: Video[]
}

export const QuerySchema = SchemaFactory.createForClass(Query);
