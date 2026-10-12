# User Directory

A full-stack application for creating, viewing, updating, and deleting users.
The Angular frontend calls an ASP.NET Core 8 Web API, which stores records in
SQLite.

## Features

- Add, list, edit, and delete users.
- Validate user input in the frontend and API.
- Display loading, empty, success, and error states.
- Explore API operations through Swagger/OpenAPI in Development.

User fields: name (2–100 characters), age (integer from 0 to 120), city, state,
and pincode (4–10 characters). All fields are required; age 0 is valid.

## Project structure

| Path | Purpose |
|---|---|
| `frontend/` | Angular application |
| `UserDirectory.Api/` | .NET 8 API, EF Core data access, SQLite migrations |
| `UserDirectory.Api.Tests/` | API integration tests using in-memory SQLite |

## Requirements

- .NET 8 SDK
- Node.js and npm

## Run locally

From the repository root, start the API:

dotnet restore .\UserDirectory.Api\UserDirectory.Api.csproj
dotnet run --project .\UserDirectory.Api\UserDirectory.Api.csproj

The current local launch profile serves Swagger at
`https://localhost:7255/swagger`. In a second terminal, start the frontend:

Set-Location .\frontend
npm install
npm start

Open `http://localhost:4200`. If the API uses a different address, update the
URL in `frontend/src/app/services/user.service.ts`.

## Configuration and API

SQLite defaults to `UserDirectory.Api/data/app.db`. Set `Database:Path` to use a
different location; for example, in PowerShell:

$env:Database__Path = "C:\data\app.db"

The API creates the configured database directory if needed. Available
operations:

| Method | Endpoint | Operation |
|---|---|---|
| GET | `/api/users` | List users |
| GET | `/api/users/{id}` | Get one user |
| POST | `/api/users` | Create a user |
| PUT | `/api/users/{id}` | Update a user |
| DELETE | `/api/users/{id}` | Delete a user |

Authentication is not configured.

## Tests and build

Run backend tests from the repository root:

dotnet test .\UserDirectory.Api.Tests\UserDirectory.Api.Tests.csproj

Run frontend tests and a production build from `frontend/`:

npm test -- --watch=false
npm run build

Backend integration tests use an isolated in-memory SQLite database.

## Development and AI disclosure

Development covered the API and UI workflows, input validation, persistence,
and automated tests. AI Assistant was used for implementation assistance,
troubleshooting, testing guidance, and documentation.
