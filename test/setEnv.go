package test

import "os"

//SetEnv - to set env
func SetEnv() {
	os.Setenv("DSN", "postgres://postgres:postgres@localhost:5432/dega-test?sslmode=disable")
	os.Setenv("KAVACH_URL", "http://kavach:6620")
	os.Setenv("KETO_URL", "http://keto:6644")
}
