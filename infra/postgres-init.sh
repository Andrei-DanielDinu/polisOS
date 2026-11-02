#!/bin/bash
set -euo pipefail

psql --username "$POSTGRES_USER" --set=ON_ERROR_STOP=1 \
  --set=problem_password="$PROBLEM_DB_PASSWORD" \
  --set=project_password="$PROJECT_DB_PASSWORD" \
  --set=keycloak_password="$KEYCLOAK_DB_PASSWORD" <<'SQL'
CREATE ROLE problem_api LOGIN PASSWORD :'problem_password';
CREATE ROLE project_api LOGIN PASSWORD :'project_password';
CREATE ROLE keycloak_api LOGIN PASSWORD :'keycloak_password';
CREATE DATABASE problem_service OWNER problem_api;
CREATE DATABASE project_service OWNER project_api;
CREATE DATABASE keycloak OWNER keycloak_api;
SQL

