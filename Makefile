up:
	docker-compose -f docker-compose.yml up -d

up-no-cache:
	DOCKER_BUILDKIT=0 docker-compose -f docker-compose.yml build --no-cache
	docker-compose -f docker-compose.yml up -d

# Local development commands
local:
	docker-compose -f docker-compose.local.yml up -d

local-no-cache:
	DOCKER_BUILDKIT=0 docker-compose -f docker-compose.local.yml build --no-cache
	docker-compose -f docker-compose.local.yml up -d

local-down:
	docker-compose -f docker-compose.local.yml down

down:
	docker-compose -f docker-compose.yml down

clean:
	docker-compose -f docker-compose.yml down -v
	docker system prune -f

logs:
	docker-compose -f docker-compose.yml logs -f

logs-backend:
	docker-compose -f docker-compose.yml logs -f backend

logs-frontend:
	docker-compose -f docker-compose.yml logs -f frontend

logs-nginx:
	docker-compose -f docker-compose.yml logs -f nginx

restart:
	docker-compose -f docker-compose.yml restart

restart-backend:
	docker-compose -f docker-compose.yml restart backend

restart-frontend:
	docker-compose -f docker-compose.yml restart frontend

build:
	DOCKER_BUILDKIT=0 docker-compose -f docker-compose.yml build

status:
	docker-compose -f docker-compose.yml ps

.PHONY: up up-no-cache down clean logs logs-backend logs-frontend logs-nginx restart restart-backend restart-frontend build status