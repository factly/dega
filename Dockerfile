FROM golang:1.14.2-alpine3.11

WORKDIR /app

COPY . .

RUN go mod download
ENV DSN $DSN
ENV KETO $KETO
ENV KAVACH $KAVACH

RUN go get github.com/githubnemo/CompileDaemon

ENTRYPOINT CompileDaemon -exclude-dir=.git -exclude-dir=docs --build="go build main.go" --command="./main -dsn=${DSN} -kavach=${KAVACH} -keto=${KETO}"