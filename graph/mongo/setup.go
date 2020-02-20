package mongo

import (
	"context"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// Core mongodb collection
var Core *mongo.Database

// Factcheck mongodb collection
var Factcheck *mongo.Database

// Setup to connect to db
func Setup() {
	log.Print("Initializing ...")
	var ctx, _ = context.WithTimeout(context.Background(), 10*time.Second)
	var Client, err = mongo.Connect(ctx, options.Client().ApplyURI("mongodb://localhost:27017"))

	if err != nil {
		log.Fatal(err)
	}
	Core = Client.Database("core")
	Factcheck = Client.Database("factcheck")
	log.Print("Database init complete")
}
