FROM golang:1.16-alpine3.14

WORKDIR /app

COPY . .

RUN apk add gcc musl-dev
RUN go mod download
ENV CONFIG_FILE $CONFIG_FILE

RUN go get github.com/githubnemo/CompileDaemon

# Following lines provides ability to add WAIT_HOSTS in docker-compose to wait for other hosts to start
ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.7.3/wait /wait
RUN chmod +x /wait

ENTRYPOINT /wait && CompileDaemon -exclude-dir=.git --build="go build server.go" --command="./server -config=${CONFIG_FILE}"