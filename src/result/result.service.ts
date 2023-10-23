import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { response } from 'express';
import { Queue } from '../services/Queue'

@Injectable()
export class ResultService {
    constructor(private readonly elasticsearchService: ElasticsearchService) { }
    async getResult(body: object) {
        try {
            const searchResponse = await this.elasticsearchService.search({
                index: [process.env.CHANNEL_INDEX, process.env.MAIN_INDEX],
                body
            })
            const dataToReturn = []
            const total = searchResponse.body.hits.total.value
            searchResponse.body.hits.hits.forEach((hit) => {
                const matchedList = [];
                if (hit.highlight.captions) {
                    hit.highlight.captions.forEach((matched) => {
                        matched = matched.replace(/<em>/g, "");
                        matched = matched.replace(/<\/em>/g, "");
                        const index = hit._source.captions.indexOf(matched);
                        const eachCaption = {
                            text: [
                                hit._source.captions[index - 2],
                                hit._source.captions[index - 1],
                                hit._source.captions[index],
                                hit._source.captions[index + 1],
                                hit._source.captions[index + 2]
                            ],
                            timestamp: hit._source.timestamps[index],
                        }
                        matchedList.push(eachCaption);
                    });
                }

                if (Object.keys(hit._source).indexOf("title") !== -1) {
                    dataToReturn.push({
                        title: hit._source.title,
                        videoId: hit._id,
                        data: matchedList,
                        channelName: hit._source.channelName,
                        publicationDate: hit._source.publicationDate,
                        thumbnails: hit._source.thumbnails

                    });
                } else {
                    dataToReturn.push({
                        title: "Video Link",
                        videoId: hit._id,
                        data: matchedList,
                        channelName: hit.channelName,
                        publicationDate: hit.publicationDate,
                        thumbnails: hit._source.thumbnails
                    });
                }
            });
            return { success: true, videoList: dataToReturn, total }
        } catch (error) {
            console.error("Some error Happended...", error)
            return response.status(400).json({ success: false, msg: error.message })
        }
    }


    treeTraversal(tree, cb, childKey = 'child') {
        if (!tree) return

        const queue = new Queue()
        queue.enqueue(tree)

        while (!queue.isEmpty()) {
            const current = queue.dequeue()

            const [left, right] = current[childKey] || []

            cb(current)

            if (left != null) {
                queue.enqueue(left)
            }

            if (right != null) {
                queue.enqueue(right)
            }
        }
    }

}
