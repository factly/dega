package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type DatabaseRef struct {
	Ref string             `bson:"$ref"`
	ID  primitive.ObjectID `bson:"$id"`
}
