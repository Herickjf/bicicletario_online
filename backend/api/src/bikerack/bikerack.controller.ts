import { Body, Controller, Post, Get, Delete, Patch, BadRequestException, Param } from '@nestjs/common';
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

    @Get('list')
    @ApiOperation({
        summary: 'Listagem de Bicicletários',
        description: 'Lista todos os bicicletários cadastrados no sistema'
    })
    async list(){
        return await this.service.list();
    }

    @Get('search')
    @ApiOperation({
        summary: 'Busca de Bicicletários',
        description: 'Busca um bicicletário específico por uma sequência de campos e valores'
    })
    async search(@Body() filter: {[key: string]: any}){
        return await this.service.search(filter);
    }

    @Get('customersPerBikerack')
    @ApiOperation({
        summary: 'Listagem de Clientes por Bicicletário',
        description: 'Lista a quantidade de clientes cadastrados em cada bicicletário'
    })
    async customersPerBikerack(){
        return await this.service.customersPerBikerack();
    }

    @Get('employeesPerBikerack')
    @ApiOperation({
        summary: 'Listagem de Funcionários por Bicicletário',
        description: 'Lista a quantidade de funcionários cadastrados em cada bicicletário'
    })
    async employeesPerBikerack(){
        return await this.service.employeesPerBikerack();
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

}
