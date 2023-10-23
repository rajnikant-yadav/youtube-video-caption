import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AppendDto {
    @ApiProperty({
        description: "Previous Search Mongo Id",
        example: "jf8923hf32389h3fhf2322"
    })
    @IsString()
    @IsNotEmpty()
    _id: string;

    @ApiProperty({
        description: "Next Page Token received from Previous Request",
        example: "CQA11AA"
    })
    @IsString()
    @IsNotEmpty()
    nextPageToken: string;

    @ApiProperty({
        description: "Technology Keyword received from Previous Request",
        example: "Inkjet Printer"
    })
    @IsString()
    @IsNotEmpty()
    keyword: string;

    @ApiProperty({
        description: "Technology Domain received from Previous Request",
        example: "Printer"
    })
    @IsString()
    @IsNotEmpty()
    domain: string;

}
