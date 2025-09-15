import { Controller, Body, Param, Get, Post, Delete, Patch } from '@nestjs/common';
import { PlanService } from './plan.service';
import { ApiOperation, ApiBody } from '@nestjs/swagger';
import { PlanDto } from 'src/dtos/Plan.dto';

@Controller('plan')
export class PlanController {
    constructor(private readonly service: PlanService) {}

    @Get("/list/:id")
    @ApiOperation({
        summary: 'Listar Planos de um Bicicletário',
        description: 'Lista todos os planos de um bicicletário específico'
    })
    async listPlansByBikerack(@Param('id') id: number) {
        return await this.service.listPlansByBikerack(id);
    }

    @Get('search/:id')
    @ApiOperation({
        summary: 'Buscar Plano de Bicicletário',
        description: 'Busca um plano de bicicletário específico, com base em filtros'
    })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string', example: 'Plano Mensal' },
                isActive: { type: 'boolean', example: true }
            }
        }
    })
    async search(@Param('id') id: number, @Body() filtros: {[key: string]: any}) {
        return await this.service.search(id, filtros);
    }

    @Delete('delete')
    @ApiOperation({
        summary: 'Deletar Plano de Bicicletário',
        description: 'Deleta um plano de bicicletário específico'
    })
    async deletePlan(@Body() plano: {id_bike_rack: number, id_plan: number}) {
        return await this.service.deletePlan(plano.id_bike_rack, plano.id_plan);
    }

    @Post('create')
    @ApiOperation({
        summary: 'Criação de Planos de Bicicletários',
        description: 'Cria um plano de bicicletário'
    })
    async createPlan(@Body() plan: PlanDto) {
        return await this.service.createPlan(plan);
    }

    @Patch('update')
    @ApiOperation({
        summary: 'Atualização de plano de Bicicletário',
        description: 'Atualiza um plano de bicicletário específico'
    })
    async updatePlan(@Body() plan: PlanDto) {
        return await this.service.updatePlan(plan);
    }

    @Patch('activate')
    @ApiOperation({
        summary: 'Ativar Plano de Bicicletário',
        description: 'Ativa um plano de bicicletário específico'
    })
    async activatePlan(@Body() plano: {id_bike_rack: number, id_plan: number}) {
        return await this.service.activatePlan(plano.id_bike_rack, plano.id_plan);
    }

    @Patch('disable')
    @ApiOperation({
        summary: 'Desativar Plano de Bicicletário',
        description: 'Desativa um plano de bicicletário específico'
    })
    async disablePlan(@Body() plano: {id_bike_rack: number, id_plan: number}) {
        return await this.service.disablePlan(plano.id_bike_rack, plano.id_plan);
    }

}
