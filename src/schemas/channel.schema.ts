import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import { HydratedDocument, Document } from 'mongoose';
import { Video } from './video.schema';

export type ChannelDoc = HydratedDocument<Channel>;

@Schema({ timestamps: true })
export class Channel extends Document {
    @Prop({ required: true })
    channelId: string

    @Prop({ default: '' })
    customChannelName: string;

    @Prop({ default: '' })
    nextPageToken: string;

    @Prop({ default: [] })
    videoId: Video[];

    @Prop({ default: 0 })
    totalCount: number

    @Prop({ default: [] })
    failedVideos: Video[]

    @Prop({ default: '' })
    publishedAfter: string;

    @Prop({ default: '' })
    publishedBefore: string;

}

export const ChannelSchema = SchemaFactory.createForClass(Channel);
