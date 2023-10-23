import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { response } from 'express';
import { Model } from 'mongoose';
import { ChannelDoc } from 'src/schemas/channel.schema';
import { QueryDoc } from 'src/schemas/query.schema';
import { SearchVideoDto } from './dto';

@Injectable()
export class SearchService {
    constructor(
        private readonly axios: HttpService,
        @InjectModel('Query') private readonly Query: Model<QueryDoc>,
        @InjectModel('Channel') private readonly Channel: Model<ChannelDoc>
    ) { }
    async searchFirstChunkVideoId(q: string, queryData: SearchVideoDto) {
        try {
            const params: any = {
                key: process.env.YT_API_KEY,
                part: 'snippet',
                maxResults: 50,
                q,
            };

            const { data } = await this.axios.get(process.env.YT_URL, { params }).toPromise();

            const { nextPageToken, items, pageInfo } = data;

            const videoId = items.map((item) => {
                const video = {
                    id: item.id.videoId,
                    channelId: item.snippet.channelId,
                    title: item.snippet.title,
                    publicationDate: item.snippet.publishTime,
                    channelName: item.snippet.channelTitle,
                    customChannelName: '',
                    thumbnails: item.snippet.thumbnails.default.url
                }
                return video;
            });

            const payload = {
                domain: queryData.domain,
                keyword: queryData.keyword,
                videoId,
                channelName: '',
                nextPageToken,
                publishedAfter: '',
                publishedBefore: '',
                totalCount: pageInfo.totalResults
            };
            if (queryData.channelName) {
                payload.channelName = queryData.channelName;
            }
            if (queryData.publishedAfter) {
                payload.publishedAfter = queryData.publishedAfter;
            }
            if (queryData.publishedBefore) {
                payload.publishedBefore = queryData.publishedBefore;
            }

            const queryResponse = await this.Query.create(payload);
            console.log('First 50 Video Processed...')
            return { success: true, query: queryResponse, msg: "First 50 Video Processed" };
        } catch (error) {
            console.error("Some error Happened...", error)
            return response.status(404).json({ success: false, msg: error.message })
        }
    }

    async searchAllVideoId(_id: string, token: string, q: string) {
        try {
            let videoIdArrLength = 50;
            do {
                const params: any = {
                    key: process.env.YT_API_KEY,
                    part: 'snippet',
                    maxResults: 50,
                    q,
                    pageToken: token,
                };
                const { data } = await this.axios.get(process.env.YT_URL, { params }).toPromise();

                const { nextPageToken, items } = data;

                const videoId = items.map((item) => {
                    const video = {
                        id: item.id.videoId,
                        channelId: item.snippet.channelId,
                        title: item.snippet.title,
                        publicationDate: item.snippet.publishTime,
                        channelName: item.snippet.channelTitle,
                        customChannelName: '',
                        thumbnails: item.snippet.thumbnails.default.url

                    }
                    return video;
                });
                const queryResponse = await this.Query.findOneAndUpdate(
                    { _id },
                    { $push: { videoId: { $each: videoId } }, nextPageToken: nextPageToken },
                    { returnOriginal: false },
                );
                if (token) {
                    token = queryResponse.nextPageToken;
                }
                videoIdArrLength = queryResponse.videoId.length;
            } while (token && videoIdArrLength < 500);
            console.log('All Video Processed...')
            return { success: true, msg: 'All Video id Appended' };
        } catch (error) {
            console.error("Some error Happened...", error)
            return { success: false, msg: error.message }
        }
    }

    async searchFirstChuckVideoIdByChannel(id: string, customChannelName: string, publishedAfter: string, publishedBefore: string) {
        try {
            if (publishedAfter === '') {
                publishedAfter = '1980-01-01T00:00:00Z'
            }
            if (publishedBefore === '') {
                publishedBefore = `${new Date().toISOString().slice(0, 10)}T00:00:00Z`
            }
            const params: any = {
                key: process.env.YT_API_KEY,
                part: 'snippet',
                maxResults: 50,
                channelId: id,
                publishedAfter,
                publishedBefore
            };
            // console.log(params)
            const { data } = await this.axios.get(process.env.YT_URL, { params }).toPromise();
            const { nextPageToken, items, pageInfo } = data;

            const videoId = items.map((item) => {
                const video = {
                    id: item.id.videoId,
                    channelId: item.snippet.channelId,
                    title: item.snippet.title,
                    publicationDate: item.snippet.publishTime,
                    channelName: item.snippet.channelTitle,
                    customChannelName: customChannelName,
                    thumbnails: item.snippet.thumbnails.default.url
                }
                return video;
            });

            const payload = {
                channelId: id,
                videoId,
                nextPageToken,
                customChannelName,
                totalCount: pageInfo.totalResults,
                publishedAfter,
                publishedBefore
            };
            const queryResponse = await this.Channel.create(payload);
            console.log('First 50 Video of Channel Processed...')
            return queryResponse
        } catch (error) {
            console.error("Some error Happened...", error.message)
            throw error
        }
    }

    async searchAllVideoIdByChannel(_id: string, token: string, customChannelName: string, channelId: string, totalCount: number,
        publishedAfter: string, publishedBefore: string) {
        try {
            let videoIdArrLength = 50;
            let totalCount = 0
            do {
                const params: any = {
                    key: process.env.YT_API_KEY,
                    part: 'snippet',
                    maxResults: 50,
                    channelId,
                    pageToken: token,
                    publishedAfter,
                    publishedBefore
                };
                const { data } = await this.axios.get(process.env.YT_URL, { params }).toPromise();

                const { nextPageToken, items } = data;

                const videoId = items.map((item) => {
                    const video = {
                        id: item.id.videoId,
                        channelId: item.snippet.channelId,
                        title: item.snippet.title,
                        publicationDate: item.snippet.publishTime,
                        channelName: item.snippet.channelTitle,
                        customChannelName,
                        thumbnails: item.snippet.thumbnails.default.url
                    }
                    return video;
                });
                const queryResponse = await this.Channel.findOneAndUpdate(
                    { _id },
                    { $push: { videoId: { $each: videoId } }, nextPageToken: nextPageToken },
                    { returnOriginal: false },
                );
                totalCount = queryResponse.totalCount
                token = queryResponse.nextPageToken;

                videoIdArrLength = queryResponse.videoId.length;
            } while (token && videoIdArrLength <= 500);
            console.log('All Video of Channel Processed...')
            return { success: true, msg: 'All Video id Appended for the channel', total: totalCount, id: _id };
        } catch (error) {
            console.error("Some error Happened...", error)
            return { success: false, msg: error.message }
        }
    }
}
