import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class ChannelDto {
    @ApiProperty({
        description: "Id of Youtube Channel",
        example: "asdf2ff32389h3fhf2322"
    })
    @IsString()
    @IsNotEmpty()
    id: string;

    @ApiProperty({
        description: "Custom Name of Channel",
        example: "CQA11AA"
    })
    @IsString()
    @IsNotEmpty()
    customName: string;

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
