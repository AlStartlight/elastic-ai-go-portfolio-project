FROM golang:1.24.0-alpine AS build

WORKDIR /app

RUN apk add --no-cache git

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o server ./cmd/server

FROM alpine:3.20

RUN adduser -D -g '' appuser

WORKDIR /app

COPY --from=build /app/server /app/server
RUN chmod +x /app/server && chown appuser:appuser /app/server

EXPOSE 8080

USER appuser

CMD ["/app/server"]
