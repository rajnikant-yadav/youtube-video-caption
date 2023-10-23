import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResultReqBodyDto {
    @ApiProperty({
        description: "Query for Result",
        example: "(((captions:(Printer)) OR (title:(Printer))) AND ((channelName.keyword:(HP)) OR (title:(HP)) OR (customChannelName.keyword:(HP)) OR (captions:(HP))) AND (publicationDate:[ 20100101 TO 20230214 ]))"
    })
    @IsString()
    @IsNotEmpty()
    query: string;

    @ApiProperty({
        description: "Default Operator",
        example: "AND"
    })
    @IsString()
    defOpt: string

    @ApiProperty({
        description: "Limit for the Result",
        example: 20
    })
    @IsNumber()
    @IsOptional()
    limit: number;

    @ApiProperty({
        description: "Skip for the Result",
        example: 0
    })
    @IsNumber()
    @IsOptional()
    skip: number;

}
