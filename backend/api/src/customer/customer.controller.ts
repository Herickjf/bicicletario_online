import { Controller, Post, Body, Param, Get, Delete, Patch } from '@nestjs/common';
import { CustomerService } from './customer.service';
import ClientDto from '../dtos/Client.dto';
import { ApiOperation } from '@nestjs/swagger';

@Controller('customer')
export class CustomerController {
    constructor(private readonly service: CustomerService){}

    @Post('create')
    @ApiOperation({
        summary: 'Criação de Clientes',
        description: 'Cria um Cliente, podendo anexar um endereço juntamente'
    })
    async create(@Body() cliente: ClientDto){
        return await this.service.create(cliente);
    }

    @Get('list')
    @ApiOperation({
        summary: 'Listagem de Clientes',
        description: 'Lista todos os Clientes cadastrados no sistema'
    })
    async list(){
        return await this.service.list();
    }

    @Get('search')
    @ApiOperation({
        summary: 'Busca de Clientes',
        description: 'Busca um Cliente específico por uma sequência de campos e valores'
    })
    async search(@Body() filter: {[key: string]: any}){
        return await this.service.search(filter);
    }

    @Patch('update/:id')
    @ApiOperation({
        summary: 'Atualização de Clientes',
        description: 'Atualiza os dados de um Cliente cadastrado no sistema'
    })
    async update(@Param('id') id: number, @Body() cliente: {[key: string]: any}){
        return await this.service.update(id, cliente);
    }

    @Patch('updateWhere')
    @ApiOperation({
        summary: 'Atualização de Clientes por Filtro',
        description: 'Atualiza os dados de Clientes cadastrados no sistema por uma sequência de campos e valores'
    })
    async updateWhere(@Body() filter: {[key: string]: any}, @Body() cliente: {[key: string]: any}){
        return await this.service.updateWhere(filter, cliente);
    }

    @Delete('delete/:id')
    @ApiOperation({
        summary: 'Deleção de Clientes',
        description: 'Deleta um Cliente cadastrado no sistema'
    })
    async delete(@Param('id') id: number){
        return await this.service.delete(id);
    }

    @Delete('deleteAll')
    @ApiOperation({
        summary: 'Deleção de Todos os Clientes',
        description: 'Deleta todos os Clientes cadastrados no sistema'
    })
    async deleteAll(){
        return await this.service.deleteAll();
    }

    @Delete('deleteWhere')
    @ApiOperation({
        summary: 'Deleção de Clientes por Filtro',
        description: 'Deleta Clientes cadastrados no sistema por uma sequência de campos e valores'
    })
    async deleteWhere(@Body() filter: {[key: string]: any}){
        return await this.service.deleteWhere(filter);
    }
}
