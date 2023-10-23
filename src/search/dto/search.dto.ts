import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SearchVideoDto {
    @ApiProperty({
        description: "Technology Domain Field",
        example: "Printer"
    })
    @IsString()
    @IsNotEmpty()
    domain: string;

    @ApiProperty({
        description: "Technology Keyword Field",
        example: "Injet Printer"
    })
    @IsString()
    @IsNotEmpty()
    keyword: string;

    @ApiProperty({
        description: "Technology Channel Name Field",
        example: "HP"
    })
    @IsString()
    @IsOptional()
    channelName: string;

    @ApiProperty({
        description: "Pubilcation After",
        example: "1980-01-01T00:00:00Z"
    })
    @IsString()
    @IsOptional()
    publishedAfter: string;

    @ApiProperty({
        description: "Pubilcation Before",
        example: "2022-01-01T00:00:00Z"
    })
    @IsString()
    @IsOptional()
    publishedBefore: string;

}
