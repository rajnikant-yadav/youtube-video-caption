import { Schema } from '@nestjs/mongoose';

@Schema({ _id: false })
export class Video {
    id: string
    channelId: string
    title: string
    publicationDate: string
    channelName: string
    customChannelName: string
    thumbnails: string
}