#!make
include .env
export $(shell sed 's/=.*//' .env)

DOCKER-COMPOSE-COMMAND = docker compose -f docker-compose.yml
RUN = ${DOCKER-COMPOSE-COMMAND} run --rm
START = ${DOCKER-COMPOSE-COMMAND} up -d --remove-orphans
STOP = ${DOCKER-COMPOSE-COMMAND} stop
DOWN = ${DOCKER-COMPOSE-COMMAND} down
LOGS = ${DOCKER-COMPOSE-COMMAND} logs
EXEC = ${DOCKER-COMPOSE-COMMAND} exec

.PHONY: help build-backend-image up stop down restart status backend-logs backend-console format lint test test-e2e test-cov migration-generate migration-create migration-run migration-revert

help: ## Show this help
	@cat $(MAKEFILE_LIST) | grep -E '^[a-zA-Z_-]+:.*?## .*$$' | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

./.env:
	echo APP_NAME=app > $@

build-backend-image: ## Build the backend docker image
	@docker build --no-cache -t ${APP_NAME}-backend:latest ./

up: ## Start all containers in detached mode
	@$(START)

stop: ## Stop all containers
	@$(STOP)

down: ## Stop and remove all containers and networks
	@$(DOWN)

restart: ## Restart all containers
	@$(STOP)
	@$(START)

status: ## Show status of containers
	@$(DOCKER-COMPOSE-COMMAND) ps

backend-logs: ## Follow backend logs
	@$(LOGS) -f backend

backend-console: ## Open bash console in backend container
	@$(EXEC) backend bash

# --- Code Quality & Tests ---

format: ## Format code using prettier
	@$(EXEC) backend npm run format

lint: ## Lint code using eslint
	@$(EXEC) backend npm run lint

test: ## Run unit tests
	@$(EXEC) backend npm run test

test-e2e: ## Run e2e tests
	@$(EXEC) backend npm run test:e2e

test-cov: ## Run test coverage
	@$(EXEC) backend npm run test:cov

# --- Migrations ---

migration-generate: ## Generate migration (interactive)
	@$(EXEC) backend npm run migration:generate

migration-create: ## Create migration (interactive)
	@$(EXEC) backend npm run migration:create

migration-run: ## Run pending migrations
	@$(EXEC) backend npm run migration:run

migration-revert: ## Revert last migration
	@$(EXEC) backend npm run migration:revert
