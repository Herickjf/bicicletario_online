import { Controller, Post, Body, Param, Get, Delete, Patch } from '@nestjs/common';
import { UserService } from './user.service';
import ClientDto from '../dtos/User.dto';
import { ApiBody, ApiOperation } from '@nestjs/swagger';

@Controller('user')
export class UserController {
    constructor(private readonly service: UserService){}

    @Post('create')
    @ApiOperation({
        summary: 'Criação de Users',
        description: 'Cria um User, podendo anexar um endereço juntamente'
    })
    async create(@Body() cliente: ClientDto){
        return await this.service.create(cliente);
    }

    // Rota temporária, é pra estar em auth
    @Post('/login')
    @ApiOperation({
        summary: 'Login de Users',
        description: 'Realiza o login de um User já cadastrado no sistema'
    })
    async login(@Body() body: {email: string, password: string}){
        return await this.service.login(body.email, body.password);
    }

    @Post('setRole')
    @ApiOperation({
        summary: 'Definição de Papel para User',
        description: 'Define um papel para um Users já cadastrado no sistema'
    })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                id_user: { type: 'number', example: 1 },
                id_bikerack: { type: 'number', example: 1 },
                role: { type: 'string', example: 'owner', enum: ['owner', 'attendant', 'customer', 'manager'] }
            },
            required: ['id_user', 'id_bikerack', 'role']
        }
    })
    async setRole(@Body() body: {id_user: number, id_bikerack: number, role: "owner" | "attendant" | "customer" | "manager"}){
        return await this.service.setRole(body.id_user, body.id_bikerack, body.role);
    }

    @Delete('deleteRole')
    @ApiOperation({
        summary: 'Remoção de Papel de User',
        description: 'Remove um papel de um Users já cadastrado no sistema'
    })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                id_user: { type: 'number', example: 1 },
                id_bikerack: { type: 'number', example: 1 },
            },
            required: ['id_user', 'id_bikerack']
        }
    })
    async deleteRole(@Body() body: {id_user: number, id_bikerack: number}){
        return await this.service.deleteRole(body.id_user, body.id_bikerack);
    }

    @Get('list')
    @ApiOperation({
        summary: 'Listagem de Users',
        description: 'Lista todos os Users cadastrados no sistema'
    })
    async list(){
        return await this.service.list();
    }

    @Post('search')
    @ApiOperation({
        summary: 'Busca de Users',
        description: 'Busca um User específico por uma sequência de campos e valores'
    })
    @ApiBody({
        schema: {
            type: 'object',
            additionalProperties: true,
            example: {
                "email": "user20",
                "cpf": 20120220304
            }
        }
    })
    async search(@Body() filter: {[key: string]: any}){
        return await this.service.search(filter);
    }

    @Get('searchBy/:bike_rack_id/:filter')
    @ApiOperation({
        summary: 'Busca de Users',
        description: 'Busca um User específico por palavra chave'
    })
    async searchBy(
        @Param('bike_rack_id') bike_rack_id: number, 
        @Param('filter') filter: string
    ){
        return await this.service.searchBy(bike_rack_id, filter);
    }

    @Patch('update/:id')
    @ApiOperation({
        summary: 'Atualização de Users',
        description: 'Atualiza os dados de um User cadastrado no sistema'
    })
    async update(@Param('id') id: number, @Body() cliente: {[key: string]: any}){
        return await this.service.update(id, cliente);
    }

    @Patch('updateWhere')
    @ApiOperation({
        summary: 'Atualização de Users por Filtro',
        description: 'Atualiza os dados de Users cadastrados no sistema por uma sequência de campos e valores'
    })
    async updateWhere(@Body() filter: {[key: string]: any}, @Body() cliente: {[key: string]: any}){
        return await this.service.updateWhere(filter, cliente);
    }

    @Delete('delete/:id')
    @ApiOperation({
        summary: 'Deleção de Users',
        description: 'Deleta um User cadastrado no sistema'
    })
    async delete(@Param('id') id: number){
        return await this.service.delete(id);
    }

    @Delete('deleteAll')
    @ApiOperation({
        summary: 'Deleção de Todos os Users',
        description: 'Deleta todos os Users cadastrados no sistema'
    })
    async deleteAll(){
        return await this.service.deleteAll();
    }

    @Delete('deleteWhere')
    @ApiOperation({
        summary: 'Deleção de Users por Filtro',
        description: 'Deleta Users cadastrados no sistema por uma sequência de campos e valores'
    })
    async deleteWhere(@Body() filter: {[key: string]: any}){
        return await this.service.deleteWhere(filter);
    }
}
