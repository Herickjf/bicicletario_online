import { Body, Controller, Post, Get, Delete, Patch, BadRequestException, Param } from '@nestjs/common';
import { BikerackService } from './bikerack.service';
import { ApiBody, ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import BikeRackDto from 'src/dtos/BikeRack.dto';
import { BikeDto } from 'src/dtos/Bike.dto';

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

    @Post('createBike')
    @ApiOperation({
        summary: 'Criação de Bicicletas',
        description: 'Cria uma bicicleta no BD, vinculando-a a um bicicletário'
    })
    async createBike(@Body() bike: BikeDto){
        return await this.service.createBike(bike);
    }

    @Get('list')
    @ApiOperation({
        summary: 'Listagem de Bicicletários',
        description: 'Lista todos os bicicletários cadastrados no sistema'
    })
    async list(){
        return await this.service.list();
    }

    @Get('listBikes/:bike_rack_id')
    @ApiOperation({
        summary: 'Listagem de Bicicletas de um Bicicletário',
        description: 'Lista todas as bicicletas vinculadas a um bicicletário específico'
    })
    async listBikes(@Param('bike_rack_id') bike_rack_id: number){
        return await this.service.listBikes(bike_rack_id);
    }

    @Get('search')
    @ApiOperation({
        summary: 'Busca de Bicicletários',
        description: 'Busca um bicicletário específico por uma sequência de campos e valores'
    })
    @ApiBody({
        schema: {
            type: 'object',
            example: { name: 'Bicicletário Central', city: 'São Paulo', street: 'Avenida' }
        }
    })
    async search(@Body() filter: {[key: string]: any}){
        return await this.service.search(filter);
    }

    @Get('mainScreenInfo/:id')
    @ApiOperation({
        summary: 'Informações para Tela Principal',
        description: 'Busca as informações necessárias para a tela principal do aplicativo'
    })
    async mainScreenInfo(@Param('id') id_bikerack: number){
        return await this.service.mainScreenInfo(id_bikerack);
    }

    @Get('lucroNoAno/:bike_rack_id/:ano')
    @ApiOperation({
        summary: 'Lucro relativo a cada mês do ano informado'
    })
    async lucroNoAno(@Param('bike_rack_id') bikeRackId: number, @Param('ano') ano: number){
        return await this.service.lucroNoAno(bikeRackId, ano);
    }


    @Get('usersPerBikerack')
    @ApiOperation({
        summary: 'Listagem de Funcionários por Bicicletário',
        description: 'Lista a quantidade de funcionários cadastrados em cada bicicletário'
    })
    async usersPerBikerack(){
        return await this.service.usersPerBikerack();
    }

    @Get('usersPerRole')
    @ApiOperation({
        summary: 'Listagem de Funcionários por Papel',
        description: 'Lista a quantidade de funcionários cadastrados em cada papel (role), agrupados por bicicletário'
    })
    async usersPerRole(){
        return await this.service.usersPerRole();
    }

    @Get('userPerRolesBikerack/:id')
    @ApiOperation({
        summary: 'Listagem de Usuários por Papel e Bicicletário',
        description: 'Lista a quantidade de usuários cadastrados em cada papel (role), para um bicicletário específico'
    })
    async userPerRolesBikerack(@Param('id') id_bikerack: number){
        return await this.service.userPerRolesBikerack(id_bikerack);
    }

    @Get('userBikeRacks/:id')
    @ApiOperation({
        summary: 'Bicicletários de um Usuário',
        description: 'Lista os bicicletários associados a um usuário específico'
    })
    async userBikeRacks(@Param('id') id_user: number){
        return await this.service.userBikeRacks(id_user);
    }

    @Patch('update/:id')
    @ApiOperation({
        summary: 'Atualização de Bicicletários',
        description: 'Atualiza os dados de um bicicletário cadastrado no sistema'
    })
    async update(@Param('id') id_biketrack, @Body() bikerack: {[key: string]: any}){
        return await this.service.update(id_biketrack, bikerack);
    }

    @Patch('updateMany')
    @ApiOperation({
        summary: 'Atualização em Massa de Bicicletários',
        description: 'Atualiza os dados de vários bicicletários cadastrados no sistema'
    })
    async updateMany(@Body('where') whereClauses: {[key: string]: any}, @Body('data') data: {[key: string]: any}){
        return await this.service.updateMany(whereClauses, data);
    }

    @Patch('updateBike/:bike_rack_id/:bike_id')
    @ApiOperation({
        summary: 'Atualização de Bicicletas',
        description: 'Atualiza os dados de uma bicicleta cadastrada no sistema'
    })
    async updateBike(
        @Param('bike_rack_id') bike_rack_id: number,
        @Param('bike_id') bike_id: number,
        @Body() bike: BikeDto
    ){
        return await this.service.updateBike(bike_rack_id, bike_id, bike);
    }


    @Delete('deleteAll')
    @ApiOperation({
        summary: 'Deleção dos Bicicletários',
        description: 'Deleta todos os bicicletários cadastrados no sistema'
    })
    async delete(){
        return await this.service.deleteAll();
    }

    @Delete('delete/:id')
    @ApiOperation({
        summary: 'Deleção de Bicicletários',
        description: 'Deleta um bicicletário cadastrado no sistema'
    })
    async deleteAll(@Param('id') id: number){
        return await this.service.delete(id);
    }

    @Delete('deleteBike/:bike_rack_id/:bike_id')
    @ApiOperation({
        summary: 'Deleção de Bicicletas',
        description: 'Deleta uma bicicleta cadastrada no sistema'
    })
    async deleteBike(@Param('bike_rack_id') bike_rack_id: number, @Param('bike_id') bike_id: number){
        return await this.service.deleteBike(bike_rack_id, bike_id);
    }

}
