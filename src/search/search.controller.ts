import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SearchVideoDto } from './dto';
import { AppendDto } from './dto/append.dto';
import { ChannelDto } from './dto/channel.dto';
import { SearchService } from './search.service';
import { chdir } from 'process';

@ApiTags("Search Api's")
@Controller('search')
export class SearchController {
    constructor(private readonly searchService: SearchService) { }

    // ? this request will activated when user hit the search

    @Post('videoId')
    @ApiOperation({ summary: 'Search for first 50 Video Id', description: "This Api will take domain and keyword and Find there video Id (max 50 at a time) and Save it to mongo Database" })
    @ApiResponse({
        status: 200, description: 'It will return 50 video id and mongo Id of query', schema: {
            type: "object",
            example: {

            }
        }
    })
    searchFirstChunkVideoId(@Body() queryData: SearchVideoDto) {
        let {
            domain,
            keyword,
            channelName,
            publishedAfter,
            publishedBefore
        } = queryData;
        keyword = keyword.toLowerCase()
        domain = domain.toLowerCase()
        keyword = keyword.replaceAll('or', '')
        keyword = keyword.replaceAll('and', '')
        keyword = keyword.replaceAll('near1', '')
        keyword = keyword.replaceAll('near2', '')
        keyword = keyword.replaceAll('near3', '')

        domain = domain.replaceAll('and', '')
        domain = domain.replaceAll('or', '')
        domain = domain.replaceAll('near1', '')
        domain = domain.replaceAll('near2', '')
        domain = domain.replaceAll('near3', '')

        keyword = keyword.replace(/\s+/g, ' ').trim()
        domain = domain.replace(/\s+/g, ' ').trim()
        let q1 = domain + ' ' + keyword;
        q1 = q1.replace(/\s+/g, ' ').trim()
        console.dir(q1, { depth: null })
        return this.searchService.searchFirstChunkVideoId(q1, queryData)
    }

    @Post('appendId')
    @ApiOperation({ summary: 'Append all Video Id to mongo Database', description: "this Api will take mongo Id of previous search along with nextpagetoken and append 500 videos to the mongo Database" })
    @ApiResponse({
        status: 200, description: 'Appends all Video Id of query', schema: {
            type: "object",
            example: {

            }
        }
    })
    appendAllVideoId(@Body() data: AppendDto) {
        let { _id, nextPageToken, keyword, domain } = data;
        keyword = keyword.toLowerCase()
        domain = domain.toLowerCase()
        keyword = keyword.replaceAll('or', '')
        keyword = keyword.replaceAll('and', '')
        keyword = keyword.replaceAll('near1', '')
        keyword = keyword.replaceAll('near2', '')
        keyword = keyword.replaceAll('near3', '')

        domain = domain.replaceAll('and', '')
        domain = domain.replaceAll('or', '')
        domain = domain.replaceAll('near1', '')
        domain = domain.replaceAll('near2', '')
        domain = domain.replaceAll('near3', '')

        keyword = keyword.replace(/\s+/g, ' ').trim()
        domain = domain.replace(/\s+/g, ' ').trim()
        let q1 = domain + ' ' + keyword;
        q1 = q1.replace(/\s+/g, ' ').trim()
        return this.searchService.searchAllVideoId(_id, nextPageToken, q1);
    }

    @Post('channel')
    @ApiOperation({ summary: 'Search for all the video id of Channel', description: "This Api will take Video Id and other fields as input and store all there video (max 500 due to yt api limitation) in mongo database" })
    @ApiResponse({
        status: 200, description: 'Search all Video id of a Channel', schema: {
            type: "object",
            example: {

            }
        }
    })
    async searchFirstChuckVideoIdByChannel(@Body() body: ChannelDto) {
        // console.log("Request Body", body)
        const { id, customName, publishedAfter, publishedBefore } = body
        const response = await this.searchService.searchFirstChuckVideoIdByChannel(id, customName, publishedAfter, publishedBefore)

        return this.searchService.searchAllVideoIdByChannel(response._id, response.nextPageToken, response.customChannelName, response.channelId, response.totalCount, response.publishedAfter, response.publishedBefore)
    }
}
