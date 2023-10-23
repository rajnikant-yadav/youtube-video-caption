import { Get, Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Health')
@Controller()
export class AppController {
    @Get()
    root(): string {
        return '<h2>Yt Caption Search Server is Running....</h2>';
    }
}