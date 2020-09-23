FROM golang:1.14.2-alpine3.11

WORKDIR /app

COPY . .

RUN go mod download
ENV DSN $DSN
ENV KAVACH $KAVACH
ENV MODE dev

RUN go get github.com/githubnemo/CompileDaemon

# Following lines provides ability to add WAIT_HOSTS in docker-compose to wait for other hosts to start
ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.7.3/wait /wait
RUN chmod +x /wait

ENTRYPOINT /wait && CompileDaemon -exclude-dir=.git --build="go build server.go" --command="./server -dsn=${DSN} -kavach=${KAVACH}"