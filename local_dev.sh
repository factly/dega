#!/bin/sh
echo "Running Convey server"
goconvey -host=0.0.0.0 -port=${GO_CONVEY_PORT} -workDir=/usr/src/app -launchBrowser=false &
echo "Running Swagger"
swag init &
echo "Running Air auto reload"
air -d
