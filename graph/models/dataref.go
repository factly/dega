package models

type DatabaseRef struct {
	Ref string `bson:"$ref"`
	ID  string `bson:"$id"`
}
