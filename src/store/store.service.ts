import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChannelDoc } from 'src/schemas/channel.schema';
import { QueryDoc } from 'src/schemas/query.schema';
import { getSubtitles } from 'youtube-captions-scraper';



@Injectable()
export class StoreService {
    constructor(
        private readonly axios: HttpService,
        @InjectModel('Query') private readonly Query: Model<QueryDoc>,
        @InjectModel('Channel') private readonly Channel: Model<ChannelDoc>,
        private readonly elasticsearchService: ElasticsearchService
    ) { }

    async storeFirstChunkVideoCaptionToEs(id: string) {
        try {
            const queryData = await this.Query.findById(id)
            if (!queryData.videoId) {
                return { success: false, msg: 'No Video Id Found' }
            }
            let videoIdArr = queryData.videoId.slice(0, 50)
            const promises = videoIdArr.map((video) => this.processVideo(video))
            const data = await Promise.allSettled(promises)
            // console.log(data)
            const captionDataObj = await this.prepareCaptionData(data, id, 'query')
            if (Object.keys(captionDataObj).length) {
                await this.bulkIndexData(captionDataObj, process.env.MAIN_INDEX)
            }
            console.log('First 50 video Processed..')
            return { success: true, msg: "First 50 video Processed" }
        } catch (error) {
            console.error('Some error happened -> ', error.message)
            return { success: false, msg: error.message }
        }
    }

    async storeAllVideoCaptionToEs(id: string) {
        try {
            const queryData = await this.Query.findById(id)
            // console.log(queryData)
            if (!queryData.videoId) {
                return { success: false, msg: 'No Video Id Found' }
            }
            let i = 0;
            while (i < queryData.videoId.length) {
                let videoIdArr = queryData.videoId.slice(i, i + 50)
                const promises = videoIdArr.map((video) => this.processVideo(video))
                const data = await Promise.allSettled(promises)
                // console.log(data)
                const captionDataObj = await this.prepareCaptionData(data, id, 'query')
                if (Object.keys(captionDataObj).length) {
                    await this.bulkIndexData(captionDataObj, process.env.MAIN_INDEX)
                }
                console.log(`From ${i} to ${i + 50} video has been Processed`)
                i = i + 50
            }
            console.log('All Video Indexed..')
            return { success: true, msg: "All Video Processed" }
        } catch (error) {
            console.error("Some Error happend - >", error.message)
            return { success: false, msg: error.message }
        }
    }

    async storeAllChannelVideosToEs(id: string) {
        try {
            const queryData = await this.Channel.findById({ _id: id })
            let i = 0;
            while (i < queryData.videoId.length) {
                let videoIdArr = queryData.videoId.slice(i, i + 50)
                const promises = videoIdArr.map((video) => this.processVideo(video))
                const data = await Promise.allSettled(promises)
                // console.dir(data, { depth: null })
                const captionDataObj = await this.prepareCaptionData(data, id, 'channel')
                if (Object.keys(captionDataObj).length) {
                    await this.bulkIndexData(captionDataObj, process.env.CHANNEL_INDEX)
                }
                console.log(`From ${i} to ${i + 50} video has been Processed`)
                i = i + 50
            }
            console.log('All Video Indexed..')
            return { success: true, msg: "All Video Processed" }
        } catch (error) {
            console.error("Some Error happend - >", error.message)
            return { success: false, msg: error.message }
        }
    }

    async storeAllChannelNonCaptionVideosToEs(id: string) {
        try {
            const queryData = await this.Channel.findById({ _id: id })
            let i = 0;

            let videoIdArr = queryData.failedVideos
            const promises = videoIdArr.map((video) => this.processNonCaptionVideo(video))
            const data = await Promise.allSettled(promises)
            // console.dir(data, { depth: null })
            const captionDataObj = await this.prepareNonCaptionData(data, id)
            // console.log(captionDataObj)
            if (Object.keys(captionDataObj).length) {
                await this.bulkIndexData(captionDataObj, process.env.CHANNEL_INDEX)
            }
            console.log('All Video Indexed..', id)
            return { success: true, msg: "All Video Processed" }
        } catch (error) {
            console.error("Some Error happend - >", error.message)
            return { success: false, msg: error.message }
        }
    }

    async processVideo(video: { id: string, channelId: string, title: string, publicationDate: string, channelName: string, customChannelName: string, thumbnails: string }) {
        const { id, title, channelId, channelName, publicationDate, customChannelName, thumbnails } = video
        try {
            // const captions = await getSubtitles({
            //     videoID: video.id
            // })
            // const success = true
            // console.log(`Video Id ${video.id} caption processed successfully..`)
            // return { id, captions, title, channelId, channelName, publicationDate, customChannelName, thumbnails, success }
            const response = await this.axios.post(process.env.GET_CAPTION, { id }).toPromise();
            const success = true
            console.log(`Successfully  processed ${id} -> `)
            return { id, captions: response.data, title, channelId, channelName, publicationDate, customChannelName, thumbnails, success }
        } catch (error) {
            console.log(`Error while processing ${id} -> `, error.message)
            return { id, title, channelId, channelName, publicationDate, customChannelName, thumbnails, success: false }
        }
    }

    async prepareCaptionData(data, _id, collection: string) {
        try {
            const captionDataObj = {}
            const rejectedVideos = []
            data.forEach((item) => {
                if (item.value.success) {
                    const parsedCaptionList = []
                    const timestamps = []
                    const videoId = item.value.id
                    const results = item.value
                    const { channelId, title, channelName, customChannelName, thumbnails } = item.value
                    let { publicationDate } = item.value
                    publicationDate = publicationDate.split('-')
                    publicationDate[2] = publicationDate[2].slice(0, 2)
                    publicationDate = publicationDate.join('')
                    results.captions.forEach((track) => {
                        parsedCaptionList.push(track['text'])
                        timestamps.push(track['start'])
                    })
                    const temp = {
                        videoId,
                        captions: parsedCaptionList,
                        timestamps: timestamps,
                        channelId,
                        title,
                        publicationDate,
                        channelName,
                        customChannelName,
                        thumbnails
                    }
                    captionDataObj[videoId] = temp

                }
                else {
                    const { id, channelId, title, channelName, customChannelName, thumbnails } = item.value
                    rejectedVideos.push({ id, channelId, title, channelName, customChannelName, thumbnails })
                }

            })
            if (collection === 'query') {
                console.log("For query")
                await this.Query.findOneAndUpdate(
                    { _id },
                    { $push: { failedVideos: { $each: rejectedVideos } } },
                    { returnOriginal: false },
                );
            }
            if (collection === 'channel') {
                console.log("For channel")
                await this.Channel.findOneAndUpdate(
                    { _id },
                    { $push: { failedVideos: { $each: rejectedVideos } } },
                    { returnOriginal: false },
                );
            }
            return captionDataObj
        } catch (error) {
            console.log(error.message)
            throw error
        }
    }

    async processNonCaptionVideo(video: { id: string, channelId: string, title: string, publicationDate: string, channelName: string, customChannelName: string, thumbnails: string }) {
        const { id, title, channelId, channelName, publicationDate, customChannelName, thumbnails } = video
        return { id, captions: [], title, channelId, channelName, publicationDate, customChannelName, thumbnails, success: true }
    }

    async prepareNonCaptionData(data, _id) {
        const captionDataObj = {}
        data.forEach((item) => {
            const videoId = item.value.id
            const { channelId, title, channelName, customChannelName, thumbnails } = item.value
            // let { publicationDate } = item.value
            // publicationDate = publicationDate.split('-')
            // publicationDate[2] = publicationDate[2].slice(0, 2)
            // publicationDate = publicationDate.join('')
            const temp = {
                videoId,
                captions: [],
                timestamps: [],
                channelId,
                title,

                channelName,
                customChannelName,
                thumbnails
            }
            captionDataObj[videoId] = temp
        })
        // console.log(captionDataObj)
        return captionDataObj
    }
    async bulkIndexData(dataToIndex, indexName): Promise<void> {
        try {
            let bulkIndexBody = []
            for (const eachEntry in dataToIndex) {
                bulkIndexBody.push({ index: { _index: indexName, _id: eachEntry } })
                bulkIndexBody.push(dataToIndex[eachEntry])
            }
            const bulkedResponse = await this.elasticsearchService.bulk({ body: bulkIndexBody })
            if (bulkedResponse.body.errors) {
                const error = 'Some error happened while doing bulk indexing..'
                throw error
            }
            console.log("Bulk Indexing completed")

        } catch (error) {
            console.log('Some error happened while doing bulk indexing..')
            console.error(error)
            throw error
        }
    }
}
