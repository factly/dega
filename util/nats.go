package util

import (
	"log"

	"github.com/nats-io/nats.go"
	"github.com/spf13/viper"
)

// NC nats connection object
var NC *nats.EncodedConn

// Connect connect to nats server
func ConnectNats() {
	var err error
	nc, err := nats.Connect(viper.GetString("nats_url"))
	if err != nil {
		log.Fatal(err)
	}
	NC, _ = nats.NewEncodedConn(nc, nats.JSON_ENCODER)
}
