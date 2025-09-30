import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class ReportsService {
    constructor(private readonly database: DatabaseService){}

    private async getQtdBicicletas(bike_rack_id: number){
        return await this.database.query(
            `
                SELECT Count(*)
                FROM Bike
                WHERE bike_rack_id = $1;
            `,
            [bike_rack_id]
        )
    }

    private async getQtdClientes(bike_rack_id: number){
        return await this.database.query(
            `
                SELECT Count(*)
                FROM UsersRole
                WHERE bike_rack_id = $1 AND role = 'customer';
            `,
            [bike_rack_id]
        )
    }

    private async receitaMensal(bike_rack_id: number){
        return await this.database.query(
        `
            SELECT
                DATE_TRUNC('day', rent_date) AS dia,
                SUM(total_value) AS receita
            FROM Rent
            WHERE bike_rack_id = $1
                AND DATE_TRUNC('month', rent_date) = DATE_TRUNC('month', CURRENT_DATE)
                AND DATE_TRUNC('year', rent_date) = DATE_TRUNC('year', CURRENT_DATE)
            GROUP BY dia
            ORDER BY dia;
        `,
        [bike_rack_id]
        )
    }

    private async receitaAnual(bike_rack_id: number){
        return await this.database.query(
            `
                SELECT 
                DATE_TRUNC('month', rent_date) AS mes,
                SUM(total_value) AS receita
                FROM Rent
                WHERE bike_rack_id = $1
                    AND DATE_TRUNC('year', rent_date) = DATE_TRUNC('year', CURRENT_DATE)
                GROUP BY mes
                ORDER BY mes;
            `,
            [bike_rack_id]
        )
    }

    private async receitasAnuais(bike_rack_id: number){
        return await this.database.query(
            `
                SELECT 
                DATE_TRUNC('year', rent_date) AS year,
                SUM(total_value) AS receita
                FROM Rent
                WHERE bike_rack_id = $1
                GROUP BY year
                ORDER BY year;
            `,
            [bike_rack_id]
        )
    }

    private async receitaPorBicicletaMensal(bike_rack_id: number){
        return await this.database.query(
            `
                WITH ids_lucros AS (
                    SELECT 
                        bike_id, 
                        DATE_TRUNC('day', rent_date) AS dia,
                        SUM(total_value) AS receita_mensal
                    FROM Rent
                    WHERE bike_rack_id = $1
                    GROUP BY bike_id, DATE_TRUNC('day', rent_date)
                )
                SELECT il.*, b.model, b.rent_price AS preco_unitario
                FROM ids_lucros il
                INNER JOIN Bike b
                    ON il.bike_id = b.bike_id
                WHERE b.bike_rack_id = $1
                ORDER BY il.dia, b.bike_id;
            `,
            [bike_rack_id]
        );
    }

    private async receitaPorBicicletaAnual(bike_rack_id: number){
        return await this.database.query(
            `
                WITH ids_lucros AS (
                    SELECT 
                        bike_id, 
                        DATE_TRUNC('month', rent_date) AS mes,
                        SUM(total_value) AS receita_mensal
                    FROM Rent
                    WHERE bike_rack_id = $1
                    GROUP BY bike_id, DATE_TRUNC('month', rent_date)
                )
                SELECT il.*, b.model, b.rent_price AS preco_unitario
                FROM ids_lucros il
                INNER JOIN Bike b
                    ON il.bike_id = b.bike_id
                WHERE b.bike_rack_id = $1
                ORDER BY il.mes, b.bike_id;
            `,
            [bike_rack_id]
        );
    }

    async getReports(bike_rack_id: number, options: number[]){
        const html_text = `
            
            <div style="text-align: center; width: 80%; margin: 0 auto;">
                <h1>RELATÓRIO GERADO</h1>
                <b>${new Date().toISOString().split("T")[0]}</b>
            </div>
        `;
    }
}
