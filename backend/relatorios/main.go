package main

import (
	"fmt"
	"log"
	bikerackService "relatorios/service/bikeracks" 
	clientService "relatorios/service/clients"
	userService "relatorios/service/users"
	rentService "relatorios/service/rents"
)

// func clearScreen() {
//     fmt.Print("\033[H\033[2J")
// }

func main() {
	fmt.Println("Tentativa de conexao com o Banco de Dados")
	db, err := service.NewDB()
	if err != nil {
		log.Fatal(err)
	}

	var qtd_bikeracks int64

	err = db.QueryRow(`SELECT COUNT(*) FROM BikeRack`).Scan(&qtd_bikeracks)

	if err != nil{
		log.Fatal("Contagem mal sucedida: ", err)
		return 
	}

	fmt.Println("Quantidade de Bicicletários: ", qtd_bikeracks)

	db.Close()
}