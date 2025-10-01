import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Pool } from 'pg';
import * as path from 'path';
import * as fs from 'fs';

import * as dotenv from 'dotenv';
import * as bcrypt from 'bcrypt';
dotenv.config();


@Injectable()
export class DatabaseService {
    private conn: Pool;
    constructor(){
        this.conn = new Pool({
            user:       process.env.DATABASE_USER,
            password:   process.env.DATABASE_PASSWORD,
            host:       process.env.DATABASE_HOST,
            port:       Number(process.env.DATAPASE_PORT),
            database:   process.env.DATABASE_NAME
        });
    }

    // Funcoes utilitárias
    async query(sql: string, params?: any[] | object){
        let queryParams: any[] = [];

        if (params && typeof params === 'object' && !Array.isArray(params)) {
            queryParams = Object.values(params);
        } else if (params) {
            queryParams = params as any[];
        }
        
        try {
            return (await this.conn.query(sql, queryParams)).rows;
        } catch (e) {
            console.error("Erro na query:", sql, e);
            throw new BadRequestException("Falha na execução da query:", e.message);
        }
    }

    async executeSQL(pathName: string, message?: string){
        const fullPath = path.join(__dirname, `sql/${pathName}`);
        const sql = fs.readFileSync(fullPath, "utf8");

        try{
            var ret = await this.query(sql);
            console.log("[v]", message ? message:"Operação", "bem sucedida(o)!");
            return ret;
        }catch(e){
            console.error("[!] Executar ao executar SQL: ", e);
            throw e;
        }
    }


    // Funcoes de Serviço, de fato
    async createTables(password: string){
        console.log(process.env.DATABASE_PERMISSION_PASSWORD);
        if(password != process.env.DATABASE_PERMISSION_PASSWORD)
            throw new UnauthorizedException("[!] Incorrect password. Looks like you're not authorized to do this change!")
        
        
        try{
            const criacao = await this.executeSQL("create_tables.sql", "Criação das Tabelas");
            const views_procedures = await this.executeSQL("create_views_e_storedproc.sql", "Criação das Views e das Stored Procedures")
        }catch(e){
            console.log(e.message)
        }
        console.log("Criados")
    }
    
    async recreateTables(password: string){
        await this.deleteAllTables(password);
        return await this.createTables(password);
    }

    async cleanTables(password: string){
        if(password != process.env.DATABASE_PERMISSION_PASSWORD)
            throw new UnauthorizedException("[!] Incorrect password. Looks like you're not authorized to do this change!")

        return await this.executeSQL("clean_tables.sql", "Esvaziamento das Tabelas");
    }
    
    async deleteAllTables(password: string){
        if(password != process.env.DATABASE_PERMISSION_PASSWORD)
            throw new UnauthorizedException("[!] Incorrect password. Looks like you're not authorized to do this change!")
        
        return await this.executeSQL("delete_tables.sql", "Deleção das tabelas");
    }
    
    async deleteTable(password: string, tableName: string){
        if(password != process.env.DATABASE_PERMISSION_PASSWORD)
            throw new UnauthorizedException("[!] Incorrect password. Looks like you're not authorized to do this change!")

        try{
            return await this.query(
                `
                DROP TABLE IF EXISTS $1 CASCADE;
                `
                ,[`${tableName}`]
            );
        }catch(e){
            throw e;
        }
    }

    async fillTables(password: string){
        if(password != process.env.DATABASE_PERMISSION_PASSWORD)
            throw new UnauthorizedException("[!] Incorrect password. Looks like you're not authorized to do this change!")

        await this.createUsers(password);
        await this.executeSQL("fill_tables.sql", "Preenchimento das Tabelas");
    }

    async createUsers(password: string){
        if(password != process.env.DATABASE_PERMISSION_PASSWORD)
            throw new UnauthorizedException("[!] Incorrect password. Looks like you're not authorized to do this change!")

        await this.insert({name: "Yuska Paola", email: "yuska@gmail.com", password: "yuska123", cpf: "12345678900", phone: "83980010000"});
        await this.insert({name: "Thais Gaudencio", email: "thais@gmail.com", password: "thais123", cpf: "12345678901", phone: "83980010001"});
        await this.insert({name: "Marcelo Iury", email: "marcelo@gmail.com", password: "marcelo123", cpf: "12345678902", phone: "83980010002"});
        await this.insert({name: "Yuri Malheiros", email: "yuri@gmail.com", password: "yuri123", cpf: "12345678903", phone: "83980010003"});
        await this.insert({name: "Dani Rousy", email: "dani@gmail.com", password: "dani123", cpf: "12345678904", phone: "83980010004"});
        await this.insert({name: "Lincoln David", email: "lincoln@gmail.com", password: "lincoln123", cpf: "12345678905", phone: "83980010005"});
        await this.insert({name: "Raoni", email: "raoni@gmail.com", password: "raoni123", cpf: "12345678906", phone: "83980010006"});
        await this.insert({name: "Telmo", email: "telmo@gmail.com", password: "Telmo123", cpf: "12345678907", phone: "83980010007"});
        await this.insert({name: "Luis Reis", email: "luis@gmail.com", password: "luis123", cpf: "12345678908", phone: "83980010008"});
        await this.insert({name: "Herick Jose", email: "herick@gmail.com", password: "herick123", cpf: "12345678909", phone: "83980010009"});
        await this.insert({name: "Mingal Iury", email: "mingal@gmail.com", password: "mingal123", cpf: "12345678910", phone: "83980010010"});
        await this.insert({name: "Bisnaga Iury", email: "bisnaga@gmail.com", password: "bisnaga123", cpf: "12345678911", phone: "83980010011"});
        await this.insert({name: "Banguela Iury", email: "banguela@gmail.com", password: "banguela123", cpf: "12345678912", phone: "83980010012"});
        await this.insert({name: "Xandão", email: "xandão@gmail.com", password: "xandão123", cpf: "12345678913", phone: "83980010013"});
        await this.insert({name: "Tirulipa", email: "tirulipa@gmail.com", password: "tirulipa123", cpf: "12345678914", phone: "83980010014"});
        await this.insert({name: "Luffy Iury", email: "luffy@gmail.com", password: "luffy123", cpf: "12345678915", phone: "83980010015"});
        await this.insert({name: "Ana Beatriz", email: "ana@gmail.com", password: "ana123", cpf: "12345678916", phone: "83980010016"});
        await this.insert({name: "Carlos Eduardo", email: "carlos@gmail.com", password: "carlos123", cpf: "12345678917", phone: "83980010017"});
        await this.insert({name: "Fernanda Souza", email: "fernanda@gmail.com", password: "fernanda123", cpf: "12345678918", phone: "83980010018"});
        await this.insert({name: "Pedro Henrique", email: "pedro@gmail.com", password: "pedro123", cpf: "12345678919", phone: "83980010019"});
        await this.insert({name: "Juliana Lima", email: "juliana@gmail.com", password: "juliana123", cpf: "12345678920", phone: "83980010020"});
        await this.insert({name: "Roberto Carlos", email: "roberto@gmail.com", password: "roberto123", cpf: "12345678921", phone: "83980010021"});
        await this.insert({name: "Mariana Oliveira", email: "mariana@gmail.com", password: "mariana123", cpf: "12345678922", phone: "83980010022"});
        await this.insert({name: "Felipe Alves", email: "felipe@gmail.com", password: "felipe123", cpf: "12345678923", phone: "83980010023"});
        await this.insert({name: "Sabrina Nogueira", email: "sabrina@gmail.com", password: "sabrina123", cpf: "12345678924", phone: "83980010024"});
        await this.insert({name: "Igor Matheus", email: "igor@gmail.com", password: "igor123", cpf: "12345678925", phone: "83980010025"});
        await this.insert({name: "Bianca Rocha", email: "bianca@gmail.com", password: "bianca123", cpf: "12345678926", phone: "83980010026"});
        await this.insert({name: "Lucas Gabriel", email: "lucas@gmail.com", password: "lucas123", cpf: "12345678927", phone: "83980010027"});
        await this.insert({name: "Clara Silva", email: "clara@gmail.com", password: "clara123", cpf: "12345678928", phone: "83980010028"});
        await this.insert({name: "Renato Augusto", email: "renato@gmail.com", password: "renato123", cpf: "12345678929", phone: "83980010029"});
        await this.insert({name: "Gabriela Martins", email: "gabriela@gmail.com", password: "gabriela123", cpf: "12345678930", phone: "83980010030"});
        await this.insert({name: "Paula Mendes", email: "paula@gmail.com", password: "paula123", cpf: "12345678931", phone: "83980010031"});
        await this.insert({name: "Mateus Carvalho", email: "mateus@gmail.com", password: "mateus123", cpf: "12345678932", phone: "83980010032"});
        await this.insert({name: "Camila Pereira", email: "camila@gmail.com", password: "camila123", cpf: "12345678933", phone: "83980010033"});
        await this.insert({name: "Diego Ramos", email: "diego@gmail.com", password: "diego123", cpf: "12345678934", phone: "83980010034"});
        await this.insert({name: "Bruna Castro", email: "bruna@gmail.com", password: "bruna123", cpf: "12345678935", phone: "83980010035"});
        await this.insert({name: "Vitor Sousa", email: "vitor@gmail.com", password: "vitor123", cpf: "12345678936", phone: "83980010036"});
        await this.insert({name: "Renata Farias", email: "renata@gmail.com", password: "renata123", cpf: "12345678937", phone: "83980010037"});
        await this.insert({name: "Gustavo Lima", email: "gustavo@gmail.com", password: "gustavo123", cpf: "12345678938", phone: "83980010038"});
        await this.insert({name: "Letícia Gomes", email: "leticia@gmail.com", password: "leticia123", cpf: "12345678939", phone: "83980010039"});
        await this.insert({name: "Rafael Pinto", email: "rafael@gmail.com", password: "rafael123", cpf: "12345678940", phone: "83980010040"});
        await this.insert({name: "Monica Duarte", email: "monica@gmail.com", password: "monica123", cpf: "12345678941", phone: "83980010041"});
        await this.insert({name: "Henrique Barros", email: "henrique@gmail.com", password: "henrique123", cpf: "12345678942", phone: "83980010042"});
        await this.insert({name: "Isabela Rocha", email: "isabela@gmail.com", password: "isabela123", cpf: "12345678943", phone: "83980010043"});
        await this.insert({name: "Fábio Mendes", email: "fabio@gmail.com", password: "fabio123", cpf: "12345678944", phone: "83980010044"});
        await this.insert({name: "Paula Nunes", email: "paulan@gmail.com", password: "paulan123", cpf: "12345678945", phone: "83980010045"});
        await this.insert({name: "Orlando Silva", email: "orlando@gmail.com", password: "orlando123", cpf: "12345678946", phone: "83980010046"});
        await this.insert({name: "Natália Freitas", email: "natalia@gmail.com", password: "natalia123", cpf: "12345678947", phone: "83980010047"});
        await this.insert({name: "César Almeida", email: "cesar@gmail.com", password: "cesar123", cpf: "12345678948", phone: "83980010048"});
        await this.insert({name: "Sofia Cardoso", email: "sofia@gmail.com", password: "sofia123", cpf: "12345678949", phone: "83980010049"});
        await this.insert({name: "André Lobo", email: "andre@gmail.com", password: "andre123", cpf: "12345678950", phone: "83980010050"});
        await this.insert({name: "Elisa Moreira", email: "elisa@gmail.com", password: "elisa123", cpf: "12345678951", phone: "83980010051"});
        await this.insert({name: "Marco Túlio", email: "marco@gmail.com", password: "marco123", cpf: "12345678952", phone: "83980010052"});
        await this.insert({name: "Bianca Fernandes", email: "biancaf@gmail.com", password: "bianca123", cpf: "12345678953", phone: "83980010053"});
        await this.insert({name: "Rodrigo Teixeira", email: "rodrigo@gmail.com", password: "rodrigo123", cpf: "12345678954", phone: "83980010054"});
        await this.insert({name: "Priscila Martins", email: "priscila@gmail.com", password: "priscila123", cpf: "12345678955", phone: "83980010055"});
        await this.insert({name: "Lucas Santos", email: "lucass@gmail.com", password: "lucas123", cpf: "12345678956", phone: "83980010056"});
        await this.insert({name: "Marcos Vinícius", email: "marcos@gmail.com", password: "marcos123", cpf: "12345678957", phone: "83980010057"});
        await this.insert({name: "Aline Pires", email: "aline@gmail.com", password: "aline123", cpf: "12345678958", phone: "83980010058"});
        await this.insert({name: "Thiago Rocha", email: "thiago@gmail.com", password: "thiago123", cpf: "12345678959", phone: "83980010059"});
        await this.insert({name: "Vanessa Pinto", email: "vanessa@gmail.com", password: "vanessa123", cpf: "12345678960", phone: "83980010060"});
        await this.insert({name: "Emanuel Costa", email: "emanuel@gmail.com", password: "emanuel123", cpf: "12345678961", phone: "83980010061"});
        await this.insert({name: "Lara Carvalho", email: "lara@gmail.com", password: "lara123", cpf: "12345678962", phone: "83980010062"});
        await this.insert({name: "Robson Oliveira", email: "robson@gmail.com", password: "robson123", cpf: "12345678963", phone: "83980010063"});
        await this.insert({name: "Mariana Sousa", email: "marianas@gmail.com", password: "mariana123", cpf: "12345678964", phone: "83980010064"});
        await this.insert({name: "Nelson Ribeiro", email: "nelson@gmail.com", password: "nelson123", cpf: "12345678965", phone: "83980010065"});
        await this.insert({name: "Helena Braga", email: "helena@gmail.com", password: "helena123", cpf: "12345678966", phone: "83980010066"});
        await this.insert({name: "Igor Santana", email: "igors@gmail.com", password: "igor123", cpf: "12345678967", phone: "83980010067"});
        await this.insert({name: "Catarina Lopes", email: "catarina@gmail.com", password: "catarina123", cpf: "12345678968", phone: "83980010068"});
        await this.insert({name: "Vagner Alves", email: "vagner@gmail.com", password: "vagner123", cpf: "12345678969", phone: "83980010069"});
        await this.insert({name: "Tânia Miranda", email: "tania@gmail.com", password: "tania123", cpf: "12345678970", phone: "83980010070"});
        await this.insert({name: "Pablo Henrique", email: "pablo@gmail.com", password: "pablo123", cpf: "12345678971", phone: "83980010071"});
        await this.insert({name: "Renée Albuquerque", email: "renee@gmail.com", password: "renee123", cpf: "12345678972", phone: "83980010072"});
        await this.insert({name: "Samuel Nascimento", email: "samuel@gmail.com", password: "samuel123", cpf: "12345678973", phone: "83980010073"});
        await this.insert({name: "Lorena Batista", email: "lorena@gmail.com", password: "lorena123", cpf: "12345678974", phone: "83980010074"});
        await this.insert({name: "Darlan Gomes", email: "darlan@gmail.com", password: "darlan123", cpf: "12345678975", phone: "83980010075"});
        await this.insert({name: "Suelen Rocha", email: "suelen@gmail.com", password: "suelen123", cpf: "12345678976", phone: "83980010076"});
        await this.insert({name: "Ivan Ferreira", email: "ivan@gmail.com", password: "ivan123", cpf: "12345678977", phone: "83980010077"});
        await this.insert({name: "Helder Gomes", email: "helder@gmail.com", password: "helder123", cpf: "12345678978", phone: "83980010078"});
        await this.insert({name: "Marcia Lopes", email: "marcia@gmail.com", password: "marcia123", cpf: "12345678979", phone: "83980010079"});
        await this.insert({name: "Adriano Pacheco", email: "adriano@gmail.com", password: "adriano123", cpf: "12345678980", phone: "83980010080"});
        await this.insert({name: "Bruno Antunes", email: "bruno81@gmail.com", password: "bruno123", cpf: "12345678981", phone: "83980010081"});
        await this.insert({name: "Patrícia Melo", email: "patricia82@gmail.com", password: "patricia123", cpf: "12345678982", phone: "83980010082"});
        await this.insert({name: "Diego Furtado", email: "diego83@gmail.com", password: "diego123", cpf: "12345678983", phone: "83980010083"});
        await this.insert({name: "Vanessa Ramos", email: "vanessa84@gmail.com", password: "vanessa123", cpf: "12345678984", phone: "83980010084"});
        await this.insert({name: "Elias Martins", email: "elias85@gmail.com", password: "elias123", cpf: "12345678985", phone: "83980010085"});
        await this.insert({name: "Camila Nunes", email: "camila86@gmail.com", password: "camila123", cpf: "12345678986", phone: "83980010086"});
        await this.insert({name: "Fábio Costa", email: "fabio87@gmail.com", password: "fabio123", cpf: "12345678987", phone: "83980010087"});
        await this.insert({name: "Lorena Almeida", email: "lorena88@gmail.com", password: "lorena123", cpf: "12345678988", phone: "83980010088"});
        await this.insert({name: "Otávio Moura", email: "otavio89@gmail.com", password: "otavio123", cpf: "12345678989", phone: "83980010089"});
        await this.insert({name: "Priscila Azevedo", email: "priscila90@gmail.com", password: "priscila123", cpf: "12345678990", phone: "83980010090"});
        await this.insert({name: "Guilherme Prado", email: "guilherme91@gmail.com", password: "guilherme123", cpf: "12345678991", phone: "83980010091"});
        await this.insert({name: "Verônica Pinto", email: "veronica92@gmail.com", password: "veronica123", cpf: "12345678992", phone: "83980010092"});
        await this.insert({name: "Alexandre Braga", email: "alex93@gmail.com", password: "alex123", cpf: "12345678993", phone: "83980010093"});
        await this.insert({name: "Daniela Reis", email: "daniela94@gmail.com", password: "daniela123", cpf: "12345678994", phone: "83980010094"});
        await this.insert({name: "Nelson Cardoso", email: "nelson95@gmail.com", password: "nelson123", cpf: "12345678995", phone: "83980010095"});
        await this.insert({name: "Sílvia Pontes", email: "silvia96@gmail.com", password: "silvia123", cpf: "12345678996", phone: "83980010096"});
        await this.insert({name: "Ronaldo Faria", email: "ronaldo97@gmail.com", password: "ronaldo123", cpf: "12345678997", phone: "83980010097"});
        await this.insert({name: "Júlia Valente", email: "julia98@gmail.com", password: "julia123", cpf: "12345678998", phone: "83980010098"});
        await this.insert({name: "Marcio Lopes", email: "marcio99@gmail.com", password: "marcio123", cpf: "12345678999", phone: "83980010099"});
        await this.insert({name: "Aline Mourão", email: "aline100@gmail.com", password: "aline100", cpf: "12345678100", phone: "83980010100"});
        await this.insert({name: "Rafael Moretti", email: "rafael101@gmail.com", password: "rafael101", cpf: "12345678101", phone: "83980010101"});
        await this.insert({name: "Carolina Dias", email: "carolina102@gmail.com", password: "carolina102", cpf: "12345678102", phone: "83980010102"});
        await this.insert({name: "Sérgio Oliveira", email: "sergio103@gmail.com", password: "sergio103", cpf: "12345678103", phone: "83980010103"});
        await this.insert({name: "Marta Henrique", email: "marta104@gmail.com", password: "marta104", cpf: "12345678104", phone: "83980010104"});
        await this.insert({name: "Igor Vasconcelos", email: "igor105@gmail.com", password: "igor105", cpf: "12345678105", phone: "83980010105"});
        await this.insert({name: "Bianca Couto", email: "bianca106@gmail.com", password: "bianca106", cpf: "12345678106", phone: "83980010106"});
        await this.insert({name: "Eduardo Falcão", email: "eduardo107@gmail.com", password: "eduardo107", cpf: "12345678107", phone: "83980010107"});
        await this.insert({name: "Paloma Teixeira", email: "paloma108@gmail.com", password: "paloma108", cpf: "12345678108", phone: "83980010108"});
        await this.insert({name: "Humberto Dias", email: "humberto109@gmail.com", password: "humberto109", cpf: "12345678109", phone: "83980010109"});
        await this.insert({name: "Marina Costa", email: "marina110@gmail.com", password: "marina110", cpf: "12345678110", phone: "83980010110"});
        await this.insert({name: "Felipe Duarte", email: "felipe111@gmail.com", password: "felipe111", cpf: "12345678111", phone: "83980010111"});
        await this.insert({name: "Tatiana Lopes", email: "tatiana112@gmail.com", password: "tatiana112", cpf: "12345678112", phone: "83980010112"});
        await this.insert({name: "Cassio Ramos", email: "cassio113@gmail.com", password: "cassio113", cpf: "12345678113", phone: "83980010113"});
        await this.insert({name: "Mônica Reis", email: "monica114@gmail.com", password: "monica114", cpf: "12345678114", phone: "83980010114"});
        await this.insert({name: "Vítor Barros", email: "vitor115@gmail.com", password: "vitor115", cpf: "12345678115", phone: "83980010115"});
        await this.insert({name: "Brenda Lacerda", email: "brenda116@gmail.com", password: "brenda116", cpf: "12345678116", phone: "83980010116"});
        await this.insert({name: "Cauã Ribeiro", email: "caua117@gmail.com", password: "caua117", cpf: "12345678117", phone: "83980010117"});
        await this.insert({name: "Isis Nascimento", email: "isis118@gmail.com", password: "isis118", cpf: "12345678118", phone: "83980010118"});
        await this.insert({name: "Rogério Ramos", email: "rogerio119@gmail.com", password: "rogerio119", cpf: "12345678119", phone: "83980010119"});
        await this.insert({name: "Débora Pacheco", email: "debora120@gmail.com", password: "debora120", cpf: "12345678120", phone: "83980010120"});
        await this.insert({name: "Maurício Lins", email: "mauricio121@gmail.com", password: "mauricio121", cpf: "12345678121", phone: "83980010121"});
        await this.insert({name: "Lívia Santana", email: "livia122@gmail.com", password: "livia122", cpf: "12345678122", phone: "83980010122"});
        await this.insert({name: "Paulo Sérgio", email: "paulo123@gmail.com", password: "paulo123", cpf: "12345678123", phone: "83980010123"});
        await this.insert({name: "Tâmara Figueiredo", email: "tamara124@gmail.com", password: "tamara124", cpf: "12345678124", phone: "83980010124"});
        await this.insert({name: "Ruan Teixeira", email: "ruan125@gmail.com", password: "ruan125", cpf: "12345678125", phone: "83980010125"});
        await this.insert({name: "Ariane Prado", email: "ariane126@gmail.com", password: "ariane126", cpf: "12345678126", phone: "83980010126"});
        await this.insert({name: "César Vinicius", email: "cesar127@gmail.com", password: "cesar127", cpf: "12345678127", phone: "83980010127"});
        await this.insert({name: "Nadine Ribeiro", email: "nadine128@gmail.com", password: "nadine128", cpf: "12345678128", phone: "83980010128"});
        await this.insert({name: "Walther Gomes", email: "walther129@gmail.com", password: "walther129", cpf: "12345678129", phone: "83980010129"});
        await this.insert({name: "Renata Sampaio", email: "renata130@gmail.com", password: "renata130", cpf: "12345678130", phone: "83980010130"});
        await this.insert({name: "Gleison Cardoso", email: "gleison131@gmail.com", password: "gleison131", cpf: "12345678131", phone: "83980010131"});
        await this.insert({name: "Sabrina Melo", email: "sabrina132@gmail.com", password: "sabrina132", cpf: "12345678132", phone: "83980010132"});
        await this.insert({name: "Hugo Carvalho", email: "hugo133@gmail.com", password: "hugo133", cpf: "12345678133", phone: "83980010133"});
        await this.insert({name: "Paola Ventura", email: "paola134@gmail.com", password: "paola134", cpf: "12345678134", phone: "83980010134"});
        await this.insert({name: "Luan Soares", email: "luan135@gmail.com", password: "luan135", cpf: "12345678135", phone: "83980010135"});
        await this.insert({name: "Evelyn Torres", email: "evelyn136@gmail.com", password: "evelyn136", cpf: "12345678136", phone: "83980010136"});
        await this.insert({name: "Norberto Lima", email: "norberto137@gmail.com", password: "norberto137", cpf: "12345678137", phone: "83980010137"});
        await this.insert({name: "Bianca Lemos", email: "bianca138@gmail.com", password: "bianca138", cpf: "12345678138", phone: "83980010138"});
        await this.insert({name: "Rafael Galvão", email: "rafael139@gmail.com", password: "rafael139", cpf: "12345678139", phone: "83980010139"});
        await this.insert({name: "Mirela Paiva", email: "mirela140@gmail.com", password: "mirela140", cpf: "12345678140", phone: "83980010140"});
    }

    async insert(data: {
        name: string,
        email: string,
        password: string,
        cpf: string,
        phone: string,
        address?: number
    }){
        const saltRounds = 10;
        let hashedPassword = await bcrypt.hash(data.password, saltRounds);

        return await this.query(
            `
                INSERT INTO Users (name, email, password, cpf, phone, address_id)
                VALUES ($1, $2, $3, $4, $5, $6)
            `
            ,
            [
                data.name,
                data.email,
                hashedPassword,
                data.cpf,
                data.phone,
                data.address || null
            ]
        )
    }
}
