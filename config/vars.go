package config

import (
	"flag"
	"log"
)

// DSN dsn
var DSN string

// KavachURL kavach server url
var KavachURL string

// KetoURL keto server url
var KetoURL string

// SetupVars setups all the config variables to run application
func SetupVars() {
	var dsn string
	var kavach string
	var keto string
	flag.StringVar(&dsn, "dsn", "", "Database connection string")
	flag.StringVar(&kavach, "kavach", "", "Kavach connection string")
	flag.StringVar(&keto, "keto", "", "Keto connection string")
	flag.Parse()

	if dsn == "" {
		log.Fatal("Please pass dsn flag")
	}

	if kavach == "" {
		log.Fatal("Please pass kavach flag")
	}

	if keto == "" {
		log.Fatal("Please pass kavach flag")
	}

	DSN = dsn
	KavachURL = kavach
	KetoURL = keto
}
