import { Body, Controller, Post } from '@nestjs/common';
import { BikerackService } from './bikerack.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import BikeRackDto from 'src/dtos/BikeRack.dto';

@ApiTags('bikeracks')
@Controller('bikerack')
export class BikerackController {
    constructor(private service: BikerackService){}

    @Post('create')
    @ApiOperation({
        summary: 'Criação de Bicicletários',
        description: 'Cria um bicicletário, podendo anexar um endereço juntamente'
    })
    async create(@Body() bikerack: BikeRackDto){
        return await this.service.create(bikerack);
    }

}
