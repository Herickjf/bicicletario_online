package database

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	_ "path/filepath"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

type Database struct {
	*sql.DB
}

func New () (*Database, error){
	// tenta carregar o .env
	// err := godotenv.Load(filepath.Join("..",".env"))
	err := godotenv.Load()
	if err != nil {
		log.Println("Nao foi possivel carregar arquivo .env : ", err)
	}

	// monta a string de conexão usando as variaveis de ambiente
	connStr := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		os.Getenv("DATABASE_HOST"),
		os.Getenv("DATABASE_PORT"),
		os.Getenv("DATABASE_USER"),
		os.Getenv("DATABASE_PASSWORD"),
		os.Getenv("DATABASE_NAME"),
	)

	db, err := 	sql.Open("postgres", connStr)

	if err != nil {
		return nil, fmt.Errorf("erro ao conectar com o banco: %w", err)
	}

	// configuracao do pool de conexões:
	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(25)
	db.SetConnMaxLifetime(0) // assim, as conexões não expiram

	err = db.Ping()
	if err != nil{
		return nil, fmt.Errorf("conexao caiu: %w", err)
	}

	log.Println("Conexao com o banco estabelecida com sucesso!")
	return &Database{db}, nil
}

func (db *Database) Query(query string, params []interface{}) ([]interface{}, error){
	
}