frontend_build: backend_build
	cd frontend; npm install; npm run build

backend_build:
	cd backend; npm install --only=prod; npm run compile
