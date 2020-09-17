FROM golang:1.14.2-alpine3.11

WORKDIR /app

COPY . .

RUN go mod download
ENV DSN $DSN
ENV KETO $KETO
ENV KAVACH $KAVACH
ENV MEILI_URL $MEILI_URL
ENV MEILI_KEY $MEILI_KEY
ENV GOOGLE_KEY $GOOGLE_KEY
ENV MODE=development

RUN go get github.com/githubnemo/CompileDaemon

ENTRYPOINT CompileDaemon -exclude-dir=.git -exclude-dir=docs --build="go build main.go" --command="./main -dsn=${DSN} -kavach=${KAVACH} -keto=${KETO} -meili=${MEILI_URL} -meiliKey=${MEILI_KEY} -googleKey=${GOOGLE_KEY}"