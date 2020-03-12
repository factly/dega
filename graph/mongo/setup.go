package mongo

import (
	"context"
	"log"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// Core mongodb collection
var Core *mongo.Database

// Factcheck mongodb collection
var Factcheck *mongo.Database

const defaultMongoURI = "mongodb://localhost:27017"

// Setup to connect to db
func Setup() {
	log.Print("Initializing ...")

	mongoURI := os.Getenv("MONGO_URI")
	if mongoURI == "" {
		mongoURI = defaultMongoURI
	}

	var ctx, _ = context.WithTimeout(context.Background(), 10*time.Second)
	var Client, err = mongo.Connect(ctx, options.Client().ApplyURI(mongoURI))

	if err != nil {
		log.Fatal(err)
	}
	Core = Client.Database("core")
	Factcheck = Client.Database("factcheck")
	log.Print("Database init complete")
}
