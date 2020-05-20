FROM golang:1.14.2-alpine3.11
RUN apk add coreutils
RUN apk add build-base
RUN apk add --no-cache --upgrade bash
WORKDIR /usr/src/app
COPY . .
RUN go mod download
RUN go get -u github.com/cosmtrek/air
RUN go get github.com/smartystreets/goconvey
RUN go get -u github.com/swaggo/swag/cmd/swag
RUN chmod a+rx /usr/src/app/local_dev.sh
RUN ls -lart /usr/src/app/local_dev.sh
ENTRYPOINT ["sh", "/usr/src/app/local_dev.sh"]
