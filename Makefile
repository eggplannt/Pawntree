MIGRATE_VERSION ?= v4.17.0
GOBIN           := $(shell go env GOPATH)/bin
MIGRATE_BIN     := $(shell which migrate 2>/dev/null || echo $(GOBIN)/migrate)
DB_URL          ?= postgres://chess:devpassword@localhost:5432/chess_trainer?sslmode=disable

.PHONY: dev migrate-up migrate-down migrate-status build-web deploy install-migrate

dev:
	docker compose -f docker-compose.dev.yml up --build

migrate-up:
	$(MIGRATE_BIN) -path server/migrations -database "$(DB_URL)" up

migrate-down:
	$(MIGRATE_BIN) -path server/migrations -database "$(DB_URL)" down 1

migrate-status:
	$(MIGRATE_BIN) -path server/migrations -database "$(DB_URL)" version

install-migrate:
	go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@$(MIGRATE_VERSION)

build-web:
	cd apps/expo && npx expo export -p web

deploy:
	docker compose build
	$(MAKE) build-web
	docker compose up -d

lint:
	cd server && go vet ./...

test:
	cd server && go test ./...
