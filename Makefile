#!make
include .env
export $(shell sed 's/=.*//' .env)

DOCKER-COMPOSE-COMMAND = docker compose -f docker-compose.yml
RUN = ${DOCKER-COMPOSE-COMMAND} run --rm
START = ${DOCKER-COMPOSE-COMMAND} up -d --remove-orphans
STOP = ${DOCKER-COMPOSE-COMMAND} stop
LOGS = ${DOCKER-COMPOSE-COMMAND} logs
EXEC = ${DOCKER-COMPOSE-COMMAND} exec

./.env:
	echo APP_NAME=app > $@

build-backend-image:
	@docker build --no-cache -t ${APP_NAME}-backend:latest ./

up:
	@$(START)

stop:
	@$(STOP)

restart:
	@$(STOP)
	@$(START)

status:
	@$(DOCKER-COMPOSE-COMMAND) ps

backend-logs:
	@$(LOGS) -f backend

backend-console:
	@$(EXEC) backend bash
