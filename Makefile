up:
	docker-compose up -d

up-no-cache:
	docker-compose build --no-cache
	docker-compose up -d

# Local development commands
local:
	docker-compose -f docker-compose.local.yml up -d

local-no-cache:
	docker-compose -f docker-compose.local.yml build --no-cache
	docker-compose -f docker-compose.local.yml up -d

local-down:
	docker-compose -f docker-compose.local.yml down

down:
	docker-compose down

clean:
	docker-compose down -v
	docker system prune -f

logs:
	docker-compose logs -f

logs-backend:
	docker-compose logs -f backend

logs-frontend:
	docker-compose logs -f frontend

logs-nginx:
	docker-compose logs -f nginx

restart:
	docker-compose restart

restart-backend:
	docker-compose restart backend

restart-frontend:
	docker-compose restart frontend

build:
	docker-compose build

status:
	docker-compose ps

.PHONY: up up-no-cache down clean logs logs-backend logs-frontend logs-nginx restart restart-backend restart-frontend build status