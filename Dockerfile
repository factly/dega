FROM golang:1.14.2-alpine3.11

WORKDIR /app

COPY . .

RUN go mod download
ENV DSN $DSN
ENV KAVACH $KAVACH
ENV MODE dev

RUN go get github.com/githubnemo/CompileDaemon

ENTRYPOINT CompileDaemon -exclude-dir=.git --build="go build server.go" --command="./server -dsn=${DSN} -kavach=${KAVACH}"