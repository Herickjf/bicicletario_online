import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { BadRequestException } from '@nestjs/common';
import { PlanDto } from 'src/dtos/Plan.dto';

@Injectable()
export class PlanService {
    constructor(private readonly database: DatabaseService) {}

    async listPlansByBikerack(id_bike_rack: number) {
    try {
      return await this.database.query(
        `SELECT * FROM Plan WHERE bike_rack_id = $1`,
        [id_bike_rack],
      );
    } catch (e) {
      throw new BadRequestException({
        error: e,
        message: 'Erro ao listar planos do bicicletário',
      });
    }
  }

  async deletePlan(id_bike_rack: number, id_plan: number) {
    try {
      return await this.database.query(
        `DELETE FROM Plan WHERE bike_rack_id = $1 AND plan_id = $2 RETURNING *`,
        [id_bike_rack, id_plan],
      );
    } catch (e) {
      throw new BadRequestException({
        error: e,
        message: 'Erro ao deletar plano do bicicletário',
      });
    }
  }

  async createPlan(plan: PlanDto) {
    try {
      return await this.database.query(
        `
        INSERT INTO Plan (name, description, price, active, bike_rack_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
        `,
        [
          plan.name,
          plan.description ?? null,
          plan.price,
          plan.active ?? true,
          plan.bike_rack_id,
        ],
      );
    } catch (e) {
      throw new BadRequestException({
        error: e,
        message: 'Erro ao criar plano do bicicletário',
      });
    }
  }

  async updatePlan(plan: PlanDto) {
    try {
      return await this.database.query(
        `
        UPDATE Plan
        SET name = $1,
            description = $2,
            price = $3,
            active = $4
        WHERE plan_id = $5 AND bike_rack_id = $6
        RETURNING *
        `,
        [
          plan.name,
          plan.description ?? null,
          plan.price,
          plan.active ?? true,
          plan.plan_id,
          plan.bike_rack_id,
        ],
      );
    } catch (e) {
      throw new BadRequestException({
        error: e,
        message: 'Erro ao atualizar plano do bicicletário',
      });
    }
  }

  async activatePlan(id_bike_rack: number, id_plan: number) {
    try {
      return await this.database.query(
        `
        UPDATE Plan
        SET active = TRUE
        WHERE plan_id = $1 AND bike_rack_id = $2
        RETURNING *
        `,
        [id_plan, id_bike_rack],
      );
    } catch (e) {
      throw new BadRequestException({
        error: e,
        message: 'Erro ao ativar plano do bicicletário',
      });
    }
  }

  async disablePlan(id_bike_rack: number, id_plan: number) {
    try {
      return await this.database.query(
        `
        UPDATE Plan
        SET active = FALSE
        WHERE plan_id = $1 AND bike_rack_id = $2
        RETURNING *
        `,
        [id_plan, id_bike_rack],
      );
    } catch (e) {
      throw new BadRequestException({
        error: e,
        message: 'Erro ao desativar plano do bicicletário',
      });
    }
  }
}
