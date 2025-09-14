import { Body, Controller, Post, Get, Patch, Delete } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import EmployeeDto from 'src/dtos/Employee.dto';
import { ApiOperation } from '@nestjs/swagger';

@Controller('employee')
export class EmployeeController {
    constructor(private readonly service: EmployeeService){}

    @Post('create')
    @ApiOperation({
        summary: 'Criação de Empregados'
    })
    async create(@Body() employee: EmployeeDto){
        return await this.service.create(employee);
    }

    @Get('list')
    @ApiOperation({
        summary: 'Listagem de Empregados'
    })
    async list(){
        return await this.service.list();
    }

    @Get('search')
    @ApiOperation({
        summary: 'Busca de Empregados',
        description: 'Busca um Empregado específico por uma sequência de campos e valores'
    })
    async search(@Body() filter: {[key: string]: any}){
        return await this.service.search(filter);
    }

    @Patch('update/:id')
    @ApiOperation({
        summary: 'Atualização de Empregados',
        description: 'Atualiza os dados de um Empregado cadastrado no sistema'
    })
    async update(@Body() employee: {[key: string]: any}, @Body() id: number){
        return await this.service.update(id, employee);
    }

    @Patch('updateWhere')
    @ApiOperation({
        summary: 'Atualização de Empregados por Filtro',
        description: 'Atualiza os dados de Empregados cadastrados no sistema por uma sequência de campos e valores'
    })
    async updateWhere(@Body() filter: {[key: string]: any}, @Body() employee: {[key: string]: any}){
        return await this.service.updateWhere(filter, employee);
    }
}
