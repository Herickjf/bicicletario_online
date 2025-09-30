import { Controller, Get, Post, Body } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { categorias_relatorios, opcoes_relatorios } from './reports.types';


@Controller('reports')
export class ReportsController {
    constructor(private readonly service: ReportsService){}

    @Get('categories')
    async getCategorias(){
        return categorias_relatorios;
    }

    @Get('reportsOptions')
    async getOpcoes(){
        return opcoes_relatorios;
    }

    @Post('getReports')
    async getReports(@Body() param: {bike_rack_id: number, options: number[]}){
        return await this.service.getReports(param.bike_rack_id, param.options);
    }
}
