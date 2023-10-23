import { Body, Controller, Post } from '@nestjs/common';
import { ResultReqBodyDto } from './dto';
import { ResultService } from './result.service';
import xqlv3 from 'xql-v3'
import { convertXQLToEQL } from 'src/services/convertXQLToEQL';
import { prepare } from 'xql-v3/prepare'
import { parse } from 'xql-v3/parser'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags("Result Api's")
@Controller('result')
export class ResultController {
    constructor(private readonly resultService: ResultService) { }
    @Post()
    @ApiOperation({ summary: 'Get Result for the Search Query', description: "Get Result for the Search Query" })
    @ApiResponse({
        status: 200, description: 'Get Result For the Search', schema: {
            type: "object",
            example: {

            }
        }
    })
    getResult(@Body() reqBody: ResultReqBodyDto) {
        const from = reqBody.skip ? reqBody.skip : 0
        const size = reqBody.limit ? reqBody.limit - from : 20
        const finalQuerry = {
            from,
            size,
            query: {},
            highlight: { fragment_size: 200, fields: { captions: {}, title: {}, channelName: {}, customChannelName: {}, publicationDate: {} }, }
        }

        reqBody.query = reqBody.query || ''
        reqBody.query = reqBody.query.trim()
        reqBody.query = reqBody.query.replace(/ \)/gm, ')')
        reqBody.query = reqBody.query.replace(/\s(?=:)|(?<=:)\s/gm, '')
        reqBody.defOpt = reqBody.defOpt || 'AND'
        let qStr = ''
        let queryConfig = null
        const japaneseRegex = /[\u3040-\u30FF\u4e00-\u9faf\u3400-\u4DBF]/;

        try {
            queryConfig = prepare(reqBody.query, { defOpt: reqBody.defOpt })
            queryConfig.fields = [...new Set(queryConfig.fields.map(f => f.trimEnd().slice(0, -1)))]
            qStr = reqBody.query.replace(/\/\*/gm, '*').replace(/\//gm, '\\/')
            if (qStr.trim()) {
                const xqlParsed = parse(qStr.trim())
                this.resultService.treeTraversal(xqlParsed, d => {
                    d.val = d.val || ''

                    if (typeof d.val !== 'string' || !d.val || d.val === 'multi') {
                        return
                    }

                })
            }
            const xqlQ = convertXQLToEQL(qStr, reqBody.defOpt)
            if (xqlQ.bool.should) xqlQ.bool.minimum_should_match = 1
            finalQuerry.query = xqlQ
            if (japaneseRegex.test(reqBody.query)) {
                let finalQuerryStr = JSON.stringify(xqlQ)
                finalQuerryStr = finalQuerryStr.replace(/"term":/gi, '"match":')
                finalQuerryStr = finalQuerryStr.replace(/.keyword/gi, '')
                finalQuerry.query = JSON.parse(finalQuerryStr)
            }
            console.dir(finalQuerry, { depth: null })
            return this.resultService.getResult(finalQuerry)
        } catch (error) {
            console.log(error)
            return error
        }


    }
}
