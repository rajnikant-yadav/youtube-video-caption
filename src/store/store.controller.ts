import { Body, Controller, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { StoreService } from './store.service';

@ApiTags("Store Api's")
@Controller('store')
export class StoreController {
    constructor(private readonly storeService: StoreService) { }

    @Post('uncaption')
    @ApiOperation({ summary: 'Index All the Video of Channels Who doesnot have Captions', description: "This Api will take array of mongo Id of channel search and search all non caption video and Store there Result in Elastic Database" })
    @ApiResponse({
        status: 200, description: 'store all non Caption video of Channel', schema: {
            type: "object",
            example: {

            }
        }
    })
    async storeAllChannelNonCaptionVideosToEs(@Body() body: string[]) {
        // this method will process all the video of a Channel and store there caption to the elastic
        // console.log(body)
        for (const id of body) {
            await this.storeService.storeAllChannelNonCaptionVideosToEs(id);
            console.log('Index of Id completed: ', id)
        }

        return { msg: "All Data Inddexed" }
    }

    @Post(':id')
    @ApiOperation({ summary: 'Store First 50 Video caption', description: "This Api will take mongo Id of query and search caption for the First 50 video and Store there Result in Elastic Database" })
    @ApiResponse({
        status: 200, description: 'Store first 50 video Caption', schema: {
            type: "object",
            example: {

            }
        }
    })
    storeFirstChunkVideoCaptionToEs(@Param('id') id: string) {
        // This method will take first 50 video from mongo and search there caption in caption library and store there result in elastic search
        console.log('Mongo Id ->', id)
        return this.storeService.storeFirstChunkVideoCaptionToEs(id);
    }

    @Post('all/:id')
    @ApiOperation({ summary: 'Store All Video caption', description: "This Api will take mongo Id of query and search all caption (after 50) and Store there Result in Elastic Database" })
    @ApiResponse({
        status: 200, description: 'store all video Caption', schema: {
            type: "object",
            example: {

            }
        }
    })
    storeAllVideoCaptionToEs(@Param('id') id: string) {
        // this method will process all the video except first 50 videos and store there caption to the elstic in background
        console.log('Mongo Id ->', id)
        return this.storeService.storeAllVideoCaptionToEs(id)
    }

    @Post('channel/:id')
    @ApiOperation({ summary: 'Store All Video caption of a Channle', description: "This Api will take mongo Id of channel search and search all caption and Store there Result in Elastic Database" })
    @ApiResponse({
        status: 200, description: 'store all video Caption of Channel', schema: {
            type: "object",
            example: {

            }
        }
    })
    async storeAllChannelVideosToEs(@Param('id') id: string) {
        // this method will process all the video of a Channel and store there caption to the elastic
        const ids = ["6501434396e347da84eb64f7",
            "6501435f96e347da84eb6508",
            "6501437a96e347da84eb651f",
            "6501438b96e347da84eb652d",
            "6501439f96e347da84eb653a"]
        for (const id of ids) {

            console.log('Mongo Id ->', id)
            await this.storeService.storeAllChannelVideosToEs(id)
        }
        return 'SUccess'
    }


}
