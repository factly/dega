FROM golang:latest
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
ENV PORT 8080
ENV MONGO_URI mongodb://localhost:27017
COPY . .
RUN go build -o main .
EXPOSE ${PORT}
CMD ["./main"]