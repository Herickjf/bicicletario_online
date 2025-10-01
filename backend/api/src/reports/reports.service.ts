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

    private async qtdVendasPorAtendenteMensal(bike_rack_id: number){
        return await this.database.query(
            `
                WITH ids_qtdvendas AS (
                    SELECT 
                        employee_id AS id_funcionario,
                        DATE_TRUNC('day', rent_date) AS dia,
                        COUNT(*) AS qtd_vendas
                    FROM Rent
                    WHERE bike_rack_id = $1
                    AND DATE_TRUNC('month', rent_date) = DATE_TRUNC('month', CURRENT_DATE)
                    GROUP BY employee_id, DATE_TRUNC('day', rent_date)
                )
                SELECT iq.*, u.name
                FROM ids_qtdvendas iq
                INNER JOIN Users u
                    ON iq.id_funcionario = u.user_id
                ORDER BY iq.dia, iq.qtd_vendas DESC;
            `,
            [bike_rack_id]
        )
    }

    private async qtdVendasPorAtendenteAnual(bike_rack_id: number){
        return await this.database.query(
            `
                WITH ids_qtdvendas AS (
                    SELECT 
                        employee_id AS id_funcionario,
                        DATE_TRUNC('month', rent_date) AS mes,
                        COUNT(*) AS qtd_vendas
                    FROM Rent
                    WHERE bike_rack_id = $1
                    AND DATE_TRUNC('year', rent_date) = DATE_TRUNC('year', CURRENT_DATE)
                    GROUP BY employee_id, DATE_TRUNC('month', rent_date)
                )
                SELECT iq.*, u.name
                FROM ids_qtdvendas iq
                INNER JOIN Users u
                    ON iq.id_funcionario = u.user_id
                ORDER BY iq.mes, iq.qtd_vendas DESC;
            `,
            [bike_rack_id]
        )
    }

    private async qtdLucroPorAtendenteMensal(bike_rack_id: number){
        return await this.database.query(
            `
                WITH ids_qtdvendas AS (
                    SELECT 
                        employee_id AS id_funcionario,
                        DATE_TRUNC('day', rent_date) AS dia,
                        SUM(total_value) AS qtd_total
                    FROM Rent
                    WHERE bike_rack_id = $1
                    AND DATE_TRUNC('month', rent_date) = DATE_TRUNC('month', CURRENT_DATE)
                    GROUP BY employee_id, DATE_TRUNC('day', rent_date)
                )
                SELECT iq.*, u.name
                FROM ids_qtdvendas iq
                INNER JOIN Users u
                    ON iq.id_funcionario = u.user_id
                ORDER BY iq.dia, iq.qtd_total DESC;
            `,
            [bike_rack_id]
        )
    }

    private async qtdLucroPorAtendenteAnual(bike_rack_id: number){
        return await this.database.query(
            `
                WITH ids_qtdvendas AS (
                    SELECT 
                        employee_id AS id_funcionario,
                        DATE_TRUNC('month', rent_date) AS mes,
                        SUM(total_value) AS qtd_total
                    FROM Rent
                    WHERE bike_rack_id = $1
                    AND DATE_TRUNC('year', rent_date) = DATE_TRUNC('year', CURRENT_DATE)
                    GROUP BY employee_id, DATE_TRUNC('month', rent_date)
                )
                SELECT iq.*, u.name
                FROM ids_qtdvendas iq
                INNER JOIN Users u
                    ON iq.id_funcionario = u.user_id
                ORDER BY iq.mes, iq.qtd_total DESC;
            `,
            [bike_rack_id]
        )
    }

    private async statusBicicletas(bike_rack_id: number){
        return await this.database.query(
            `
                SELECT status, COUNT(*) AS qtd_bicicletas
                FROM Bike
                WHERE bike_rack_id = $1
                GROUP BY status;
            `,
            [bike_rack_id]
        )
    }

    private async GanhoMensal(bike_rack_id: number) {
        // Ganho com aluguéis do mês atual
        return await this.database.query("SELECT * FROM ganho_mensal($1)", [bike_rack_id]);
    }

    private async GanhoAnual(bike_rack_id: number) {
        // Ganho com aluguéis por mês
        const ret = await this.database.query(
        `
            SELECT mes, ganho_com_alugueis, ganho_com_planos, ganho_total 
            FROM ganho_anual_view 
            WHERE bike_rack_id = $1 
            ORDER BY mes;
        `, [bike_rack_id]);
        console.log(ret);
        return ret;
    }

    private async PlanosCanceladosNoMes(bike_rack_id: number){
        return await this.database.query(
            `
                SELECT COUNT(*)
                FROM Subscription
                WHERE DATE_TRUNC('month', end_date) = DATE_TRUNC('month', CURRENT_DATE);
            `,
            [bike_rack_id]
        )
    }

    private async PlanosCanceladosNoAno(bike_rack_id: number){
        return await this.database.query(
            `
                SELECT COUNT(*)
                FROM Subscription
                WHERE DATE_TRUNC('year', end_date) = DATE_TRUNC('year', CURRENT_DATE);
            `,
            [bike_rack_id]
        )
    }

    private async MediaUsuariosPorPlano(bike_rack_id: number) {
        return await this.database.query(
            `
            SELECT 
                p.plan_id,
                p.name AS plano,
                COUNT(s.user_id) AS total_usuarios,
                ROUND(AVG(COUNT(s.user_id)) OVER (), 2) AS media_usuarios
            FROM Plan p
            LEFT JOIN Subscription s 
                ON p.plan_id = s.plan_id 
            AND s.active = TRUE
            WHERE p.bike_rack_id = $1
            GROUP BY p.plan_id, p.name
            ORDER BY total_usuarios DESC;
            `,
            [bike_rack_id]
        );
    }

    private async MediaAvaliacoesMensal(bike_rack_id: number) {
        return await this.database.query(
            `
                SELECT
                    DATE_TRUNC('day', created_at) AS dia,
                    AVG(rating) AS media_avaliacoes
                FROM Review
                WHERE bike_rack_id = $1
                AND created_at >= DATE_TRUNC('month', CURRENT_DATE)
                AND created_at < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
                GROUP BY dia
                ORDER BY dia ASC;
            `,
            [bike_rack_id]
        );
    }

    private async MediaAvaliacoesAnual(bike_rack_id: number) {
        return await this.database.query(
            `
                SELECT
                    DATE_TRUNC('month', created_at) AS mes,
                    AVG(rating) AS media_avaliacoes
                FROM Review
                WHERE bike_rack_id = $1
                AND DATE_TRUNC('year', created_at) = DATE_TRUNC('year', CURRENT_DATE)
                GROUP BY mes
                ORDER BY mes ASC;
            `,
            [bike_rack_id]
        );
    }

    async safeToFixed(value: number | string, digits: number = 2): Promise<string> {
        const num = typeof value === 'string' ? parseFloat(value) : value;
        return isNaN(num) ? '0.00' : num.toFixed(digits);
    }

    async getReports(bike_rack_id: number, options: number[]) {
        const data: any = {};

        if (options.includes(1)) data.qtdBicicletas = await this.getQtdBicicletas(bike_rack_id);
        if (options.includes(2)) data.qtdClientes = await this.getQtdClientes(bike_rack_id);
        if (options.includes(3)) data.receitaMensal = await this.receitaMensal(bike_rack_id);
        if (options.includes(4)) data.receitaAnual = await this.receitaAnual(bike_rack_id);
        if (options.includes(5)) data.qtdVendasMensal = await this.qtdVendasPorAtendenteMensal(bike_rack_id);
        if (options.includes(6)) data.qtdVendasAnual = await this.qtdVendasPorAtendenteAnual(bike_rack_id);
        if (options.includes(7)) data.qtdLucroMensal = await this.qtdLucroPorAtendenteMensal(bike_rack_id);
        if (options.includes(8)) data.qtdLucroAnual = await this.qtdLucroPorAtendenteAnual(bike_rack_id);
        if (options.includes(9)) data.statusBicicletas = await this.statusBicicletas(bike_rack_id);
        if (options.includes(10)){
            data.ganhoMensal = (await this.GanhoMensal(bike_rack_id))[0];
            data.ganhoMensal.media = await this.safeToFixed(data.ganhoMensal.media)
        }
        if (options.includes(11)){
            data.ganhoAnual = await this.GanhoAnual(bike_rack_id);
            console.log(data.ganhoAnual)
        } 
        // if (options.includes(12)) data.mediaAvaliacoesMensal = await this.MediaAvaliacoesMensal(bike_rack_id);
        // if (options.includes(13)) data.mediaAvaliacoesAnual = await this.MediaAvaliacoesAnual(bike_rack_id);
        if (options.includes(14)) data.receitaPorBicicletaMensal = await this.receitaPorBicicletaMensal(bike_rack_id);
        if (options.includes(15)) data.receitaPorBicicletaAnual = await this.receitaPorBicicletaAnual(bike_rack_id);
        if (options.includes(16)) data.receitasAnuais = await this.receitasAnuais(bike_rack_id);


        const html = `
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <title>Relatório Gerencial - Estação de Bikes</title>
                <style>
                    /* Paleta New York - shadcn/ui */
                    :root {
                        --background: 0 0% 100%;
                        --foreground: 240 10% 3.9%;
                        --card: 0 0% 100%;
                        --card-foreground: 240 10% 3.9%;
                        --popover: 0 0% 100%;
                        --popover-foreground: 240 10% 3.9%;
                        --primary: 240 5.9% 10%;
                        --primary-foreground: 0 0% 98%;
                        --secondary: 240 4.8% 95.9%;
                        --secondary-foreground: 240 5.9% 10%;
                        --muted: 240 4.8% 95.9%;
                        --muted-foreground: 240 3.8% 46.1%;
                        --accent: 240 4.8% 95.9%;
                        --accent-foreground: 240 5.9% 10%;
                        --destructive: 0 84.2% 60.2%;
                        --destructive-foreground: 0 0% 98%;
                        --border: 240 5.9% 90%;
                        --input: 240 5.9% 90%;
                        --ring: 240 5.9% 10%;
                    }

                    body { 
                        font-family: 'Inter', 'Arial', sans-serif; 
                        margin: 0; 
                        padding: 0; 
                        background-color: hsl(var(--background)); 
                        color: hsl(var(--foreground));
                        font-size: 14px;
                        line-height: 1.5;
                    }
                    
                    .page {
                        width: 210mm;
                        min-height: 297mm;
                        margin: 0 auto;
                        padding: 20mm;
                        background: white;
                        box-shadow: 0 0 10px rgba(0,0,0,0.1);
                        position: relative;
                        page-break-after: always;
                    }
                    
                    .page:last-child {
                        page-break-after: auto;
                    }

                    .header { 
                        text-align: center; 
                        margin-bottom: 40px; 
                        border-bottom: 1px solid hsl(var(--border)); 
                        padding-bottom: 20px; 
                    }
                    
                    .header h1 { 
                        color: hsl(var(--foreground)); 
                        font-size: 28px; 
                        font-weight: 600;
                        margin: 0 0 8px 0;
                    }
                    
                    .header .subtitle {
                        color: hsl(var(--muted-foreground));
                        font-size: 14px;
                        margin: 0;
                    }

                    .section { 
                        margin-bottom: 32px; 
                    }
                    
                    .section-header {
                        border-bottom: 1px solid hsl(var(--border));
                        padding-bottom: 12px;
                        margin-bottom: 20px;
                    }
                    
                    .section h2 { 
                        color: hsl(var(--foreground)); 
                        font-size: 18px; 
                        font-weight: 600;
                        margin: 0;
                    }
                    
                    .section h3 {
                        color: hsl(var(--foreground));
                        font-size: 16px;
                        font-weight: 600;
                        margin: 24px 0 16px 0;
                    }

                    .grid { 
                        display: grid; 
                        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
                        gap: 16px; 
                        margin-bottom: 24px;
                    }
                    
                    .card { 
                        background: hsl(var(--card)); 
                        border: 1px solid hsl(var(--border)); 
                        border-radius: 8px; 
                        padding: 20px; 
                        text-align: center;
                    }
                    
                    .card-value { 
                        font-size: 24px; 
                        font-weight: 700; 
                        color: hsl(var(--primary)); 
                        margin: 8px 0 0 0;
                    }
                    
                    .card-label {
                        color: hsl(var(--muted-foreground));
                        font-size: 14px;
                        font-weight: 500;
                    }

                    table { 
                        width: 100%; 
                        border-collapse: collapse; 
                        margin: 16px 0; 
                        font-size: 13px;
                    }
                    
                    table th, table td { 
                        border: 1px solid hsl(var(--border)); 
                        padding: 12px; 
                        text-align: left; 
                    }
                    
                    table th { 
                        background: hsl(var(--muted)); 
                        color: hsl(var(--foreground));
                        font-weight: 600;
                        font-size: 13px;
                    }
                    
                    .no-data { 
                        text-align: center; 
                        color: hsl(var(--muted-foreground)); 
                        padding: 40px; 
                        font-style: italic;
                    }

                    .chart-container {
                        background: hsl(var(--card));
                        border: 1px solid hsl(var(--border));
                        border-radius: 8px;
                        padding: 20px;
                        margin: 16px 0;
                    }
                    
                    .chart-title {
                        font-size: 14px;
                        font-weight: 600;
                        margin-bottom: 16px;
                        color: hsl(var(--foreground));
                    }

                    .page-footer {
                        position: absolute;
                        bottom: 20mm;
                        left: 20mm;
                        right: 20mm;
                        text-align: center;
                        color: hsl(var(--muted-foreground));
                        font-size: 12px;
                        border-top: 1px solid hsl(var(--border));
                        padding-top: 16px;
                    }

                    .status-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                        gap: 12px;
                        margin-top: 16px;
                    }
                    
                    .status-item {
                        text-align: center;
                        padding: 12px;
                        background: hsl(var(--muted));
                        border-radius: 6px;
                    }
                    
                    .status-value {
                        font-size: 18px;
                        font-weight: 700;
                        color: hsl(var(--primary));
                    }
                    
                    .status-label {
                        font-size: 12px;
                        color: hsl(var(--muted-foreground));
                        margin-top: 4px;
                    }
                </style>
            </head>
            <body>
                <div class="page">
                    <div class="header">
                        <h1>Relatório Gerencial</h1>
                        <p class="subtitle">Estação de Bicicletas</p>
                        <p style="color: hsl(var(--muted-foreground)); margin-top: 8px;">
                            Gerado em: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}
                        </p>
                    </div>

                    ${(options.includes(1) || options.includes(2) || options.includes(9)) ? `
                    <div class="section">
                        <div class="section-header">
                            <h2>Indicadores Principais</h2>
                        </div>
                        <div class="grid">
                            ${options.includes(1) ? `
                                <div class="card">
                                    <div class="card-label">Total de Bicicletas</div>
                                    <div class="card-value">${data.qtdBicicletas[0]?.count || 0}</div>
                                </div>
                            ` : ''}
                            ${options.includes(2) ? `
                                <div class="card">
                                    <div class="card-label">Clientes Cadastrados</div>
                                    <div class="card-value">${data.qtdClientes[0]?.count || 0}</div>
                                </div>
                            ` : ''}
                        </div>
                        
                        ${options.includes(9) ? `
                            <div class="chart-container">
                                <div class="chart-title">Status das Bicicletas</div>
                                ${data.statusBicicletas && data.statusBicicletas.length > 0 ? `
                                    <div class="status-grid">
                                        ${data.statusBicicletas.map(s => `
                                            <div class="status-item">
                                                <div class="status-value">${s.qtd_bicicletas}</div>
                                                <div class="status-label">${s.status}</div>
                                            </div>
                                        `).join('')}
                                    </div>
                                ` : '<p class="no-data">Sem dados de status das bicicletas</p>'}
                            </div>
                        ` : ''}
                    </div>
                    ` : ''}

                    ${(options.includes(10) || options.includes(3)) ? `
                    <div class="section">
                        <div class="section-header">
                            <h2>Desempenho Financeiro - Mensal</h2>
                        </div>
                        
                        ${options.includes(10) ? `
                            <div class="grid">
                                <div class="card">
                                    <div class="card-label">Ganho Total</div>
                                    <div class="card-value">R$ ${data.ganhoMensal?.total || 0}</div>
                                </div>
                                <div class="card">
                                    <div class="card-label">Média Diária</div>
                                    <div class="card-value">R$ ${data.ganhoMensal?.media || 0}</div>
                                </div>
                                <div class="card">
                                    <div class="card-label">Ganho com Aluguéis</div>
                                    <div class="card-value">R$ ${data.ganhoMensal?.ganho_com_alugueis || 0}</div>
                                </div>
                                <div class="card">
                                    <div class="card-label">Ganho com Planos</div>
                                    <div class="card-value">R$ ${data.ganhoMensal?.ganho_com_planos || 0}</div>
                                </div>
                            </div>
                        ` : ''}
                        
                        ${options.includes(3) && data.receitaMensal && data.receitaMensal.length > 0 ? `
                            <div class="chart-container">
                                <div class="chart-title">Receita Diária - Mês Atual</div>
                                <svg width="100%" height="200" viewBox="0 0 600 200">
                                    <!-- Eixos -->
                                    <line x1="50" y1="20" x2="50" y2="180" stroke="hsl(var(--border))" stroke-width="1"/>
                                    <line x1="50" y1="180" x2="550" y2="180" stroke="hsl(var(--border))" stroke-width="1"/>
                                    
                                    <!-- Linha do gráfico -->
                                    <polyline 
                                        points="${data.receitaMensal.map((r, i) => 
                                            `${50 + (i * 500/(data.receitaMensal.length-1))},${180 - (r.receita/ Math.max(...data.receitaMensal.map(d => d.receita)) * 150)}`
                                        ).join(' ')}" 
                                        fill="none" 
                                        stroke="hsl(var(--primary))" 
                                        stroke-width="2"
                                    />
                                    
                                    <!-- Pontos -->
                                    ${data.receitaMensal.map((r, i) => `
                                        <circle 
                                            cx="${50 + (i * 500/(data.receitaMensal.length-1))}" 
                                            cy="${180 - (r.receita/ Math.max(...data.receitaMensal.map(d => d.receita)) * 150)}" 
                                            r="3" 
                                            fill="hsl(var(--primary))"
                                        />
                                    `).join('')}
                                </svg>
                            </div>
                        ` : options.includes(3) ? '<p class="no-data">Sem dados de receita mensal</p>' : ''}
                    </div>
                    ` : ''}
                    
                    <div class="page-footer">
                        Página 1 de 3 | Relatório Gerencial - Estação de Bicicletas
                    </div>
                </div>

                ${(options.includes(11) || options.includes(4) || options.includes(16)) ? `
                <div class="page">
                    <div class="header">
                        <h1>Análise de Receita Anual</h1>
                    </div>

                    ${options.includes(11) && data.ganhoAnual && data.ganhoAnual.length > 0 ? `
                    <div class="section">
                        <div class="section-header">
                            <h2>Ganhos Mensais - ${new Date().getFullYear()}</h2>
                        </div>
                        <div class="chart-container">
                            <div class="chart-title">Distribuição de Ganhos por Mês (Aluguéis + Planos)</div>
                            <svg width="100%" height="250" viewBox="0 0 600 250">
                                <line x1="50" y1="220" x2="550" y2="220" stroke="hsl(var(--border))" stroke-width="1"/>
                                ${data.ganhoAnual.map((r, i) => {
                                    const x = 80 + (i * 440/11);
                                    const height = (r.ganho_total/ Math.max(...data.ganhoAnual.map(d => d.ganho_total)) * 180);
                                    return `
                                        <rect x="${x-15}" y="${220 - height}" width="30" height="${height}" fill="hsl(var(--primary))" opacity="0.7"/>
                                        <text x="${x}" y="235" text-anchor="middle" font-size="10" fill="hsl(var(--muted-foreground))">${i+1}</text>
                                    `;
                                }).join('')}
                            </svg>
                            
                            <table>
                                <thead>
                                    <tr>
                                        <th>Mês</th>
                                        <th>Aluguéis (R$)</th>
                                        <th>Planos (R$)</th>
                                        <th>Total (R$)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${data.ganhoAnual.map(r => `
                                        <tr>
                                            <td>${new Date(r.mes).toLocaleString('pt-BR', { month: 'long' })}</td>
                                            <td>${r.ganho_com_alugueis}</td>
                                            <td>${r.ganho_com_planos}</td>
                                            <td><strong>${r.ganho_total}</strong></td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    ` : ''}

                    ${options.includes(16) && data.receitasAnuais && data.receitasAnuais.length > 0 ? `
                    <div class="section">
                        <div class="section-header">
                            <h2>Receita Histórica Anual</h2>
                        </div>
                        <div class="chart-container">
                            <div class="chart-title">Evolução da Receita por Ano</div>
                            <svg width="100%" height="200" viewBox="0 0 600 200">
                                <line x1="50" y1="180" x2="550" y2="180" stroke="hsl(var(--border))" stroke-width="1"/>
                                ${data.receitasAnuais.map((r, i) => {
                                    const x = 50 + (i * 500/(data.receitasAnuais.length-1));
                                    const height = (r.ganho_total/ Math.max(...data.receitasAnuais.map(d => d.ganho_total)) * 150);
                                    return `
                                        <rect x="${x-12}" y="${180 - height}" width="24" height="${height}" fill="hsl(var(--primary))"/>
                                        <text x="${x}" y="195" text-anchor="middle" font-size="10" fill="hsl(var(--muted-foreground))">${new Date(r.year).getFullYear()}</text>
                                    `;
                                }).join('')}
                            </svg>
                        </div>
                    </div>
                    ` : ''}

                    <div class="page-footer">
                        Página 2 de 3 | Relatório Gerencial - Estação de Bicicletas
                    </div>
                </div>
                ` : ''}

                ${(options.includes(14) || options.includes(15) || options.includes(5) || options.includes(6) || options.includes(7) || options.includes(8) || options.includes(12) || options.includes(13)) ? `
                <div class="page">
                    <div class="header">
                        <h1>Métricas Detalhadas</h1>
                    </div>

                    ${(options.includes(14) || options.includes(15)) ? `
                    <div class="section">
                        <div class="section-header">
                            <h2>Receita por Bicicleta</h2>
                        </div>
                        
                        ${options.includes(14) && data.receitaPorBicicletaMensal && data.receitaPorBicicletaMensal.length > 0 ? `
                            <div class="chart-container">
                                <div class="chart-title">Top 10 Bicicletas - Maior Receita Mensal</div>
                                <svg width="100%" height="220" viewBox="0 0 600 220">
                                    <line x1="50" y1="200" x2="550" y2="200" stroke="hsl(var(--border))" stroke-width="1"/>
                                    ${data.receitaPorBicicletaMensal.slice(0,10).map((r, i) => {
                                        const height = (r.receita_mensal/ Math.max(...data.receitaPorBicicletaMensal.slice(0,10).map(d => d.receita_mensal)) * 150);
                                        return `
                                            <rect x="${60 + (i * 48)}" y="${200 - height}" width="30" height="${height}" fill="hsl(var(--primary))" opacity="0.8"/>
                                            <text x="${75 + (i * 48)}" y="215" text-anchor="middle" font-size="9" fill="hsl(var(--muted-foreground))">${r.bike_id}</text>
                                        `;
                                    }).join('')}
                                </svg>
                            </div>
                        ` : ''}
                    </div>
                    ` : ''}

                    ${(options.includes(5) || options.includes(6) || options.includes(7) || options.includes(8)) ? `
                    <div class="section">
                        <div class="section-header">
                            <h2>Desempenho dos Atendentes</h2>
                        </div>
                        
                        ${options.includes(7) && data.qtdLucroMensal && data.qtdLucroMensal.length > 0 ? `
                            <div class="chart-container">
                                <div class="chart-title">Lucro Gerado por Atendente (Mês Atual)</div>
                                <svg width="100%" height="200" viewBox="0 0 600 200">
                                    <line x1="50" y1="180" x2="550" y2="180" stroke="hsl(var(--border))" stroke-width="1"/>
                                    ${Array.from(new Set(data.qtdLucroMensal.map(r => r.id_funcionario))).slice(0,8).map((funcId, i) => {
                                        const funcData = data.qtdLucroMensal.filter(r => r.id_funcionario === funcId);
                                        const total = funcData.reduce((sum, r) => sum + parseFloat(r.qtd_total || 0), 0);
                                        const maxTotal = Math.max(...Array.from(new Set(data.qtdLucroMensal.map(r => r.id_funcionario))).map(id => 
                                            data.qtdLucroMensal.filter(r => r.id_funcionario === id).reduce((sum, r) => sum + parseFloat(r.qtd_total || 0), 0)
                                        ));
                                        const height = (total/maxTotal * 150);
                                        return `
                                            <rect x="${60 + (i * 60)}" y="${180 - height}" width="40" height="${height}" fill="hsl(var(--primary))" opacity="0.7"/>
                                            <text x="${80 + (i * 60)}" y="195" text-anchor="middle" font-size="9" fill="hsl(var(--muted-foreground))">${funcId}</text>
                                        `;
                                    }).join('')}
                                </svg>
                            </div>
                        ` : ''}
                    </div>
                    ` : ''}

                    ${(options.includes(12) || options.includes(13)) ? `
                    <div class="section">
                        <div class="section-header">
                            <h2>Avaliações e Qualidade</h2>
                        </div>
                    </div>
                    ` : ''}

                    <div class="page-footer">
                        Página 3 de 3 | Relatório Gerencial - Estação de Bicicletas
                    </div>
                </div>
                ` : ''}
            </body>
            </html>
        `;

        return html;
    }
}
