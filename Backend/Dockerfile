FROM golang:1.22-alpine AS builder

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN go mod tidy && go build -o server ./cmd/server

FROM alpine:3.19
WORKDIR /app
COPY --from=builder /app/server .
COPY --from=builder /app/.env.example .env

RUN mkdir -p uploads

EXPOSE 3000
CMD ["./server"]
