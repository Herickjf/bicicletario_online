import { Controller, Body, Param, Get, Post, Delete, Patch } from '@nestjs/common';
import { PlanService } from './plan.service';
import { ApiProperty } from '@nestjs/swagger';
import { PlanDto } from 'src/dtos/Plan.dto';

@Controller('plan')
export class PlanController {
    constructor(private readonly service: PlanService) {}

    @Get("/list/:id")
    @ApiProperty({
        summary: 'Listar Planos de um Bicicletário',
        description: 'Lista todos os planos de um bicicletário específico'
    })
    async listPlansByBikerack(@Param('id') id: string) {
        return await this.service.listPlansByBikerack(id);
    }

    @Delete('delete')
    @ApiProperty({
        summary: 'Deletar Plano de Bicicletário',
        description: 'Deleta um plano de bicicletário específico'
    })
    async deletePlan(@Body() plano: {id_bike_rack: number, id_plan: number}) {
        return await this.service.deletePlan(id);
    }

    @Post('create')
    @ApiProperty({
        summary: 'Criação de Planos de Bicicletários',
        description: 'Cria um plano de bicicletário'
    })
    async createPlan(@Body() plan: PlanDto) {
        return await this.service.createPlan(plan);
    }

    @Patch('update')
    @ApiProperty({
        summary: 'Atualização de plano de Bicicletário',
        description: 'Atualiza um plano de bicicletário específico'
    })
    async updatePlan(@Body() plan: PlanDto) {
        return await this.service.updatePlan(plan);
    }

    @Patch('activate')
    @ApiProperty({
        summary: 'Ativar Plano de Bicicletário',
        description: 'Ativa um plano de bicicletário específico'
    })
    async activatePlan(@Body() plano: {id_bike_rack: number, id_plan: number}) {
        return await this.service.activatePlan(plano.id_bike_rack, plano.id_plan);
    }

    @Patch('disable')
    @ApiProperty({
        summary: 'Desativar Plano de Bicicletário',
        description: 'Desativa um plano de bicicletário específico'
    })
    async disablePlan(@Body() plano: {id_bike_rack: number, id_plan: number}) {
        return await this.service.disablePlan(plano.id_bike_rack, plano.id_plan);
    }

}
