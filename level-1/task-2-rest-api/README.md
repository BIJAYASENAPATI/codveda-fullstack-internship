# Codveda Internship — Level 1 Task 2

## User Management REST API

A simple REST API developed using **Node.js, Express.js, MySQL, and Sequelize** as part of the Codveda Technologies Full Stack Development Internship.

## Objective

The objective of this task is to develop a REST API with:

* Create operation
* Read operation
* Update operation
* Delete operation
* Request validation
* Error handling
* Proper HTTP status codes
* API testing using Postman

## Technologies Used

* Node.js
* Express.js
* MySQL
* Sequelize ORM
* npm
* Postman
* Git & GitHub

## Project Structure

```text
task-2-rest-api/
│
├── config/
│   └── db.js
│
├── models/
│   └── User.js
│
├── routes/
│   └── userRoutes.js
│
├── .env
├── .gitignore
├── package.json
├── package-lock.json
└── server.js
```

## Database

Database name:

```text
codveda_level1
```

Table:

```text
users
```

### User Fields

| Field     | Type     | Description                 |
| --------- | -------- | --------------------------- |
| id        | INTEGER  | Primary key, auto increment |
| name      | STRING   | User name                   |
| email     | STRING   | Unique email address        |
| age       | INTEGER  | User age                    |
| createdAt | DATETIME | Record creation time        |
| updatedAt | DATETIME | Record update time          |

## API Endpoints

### 1. Create User

```http
POST /api/users
```

Request body:

```json
{
    "name": "Lokesh",
    "email": "lokesh@example.com",
    "age": 21
}
```

Expected status:

```text
201 Created
```

---

### 2. Get All Users

```http
GET /api/users
```

Expected status:

```text
200 OK
```

---

### 3. Get User By ID

```http
GET /api/users/:id
```

Example:

```http
GET /api/users/1
```

Expected status:

```text
200 OK
```

If the user does not exist:

```text
404 Not Found
```

---

### 4. Update User

```http
PUT /api/users/:id
```

Example:

```http
PUT /api/users/1
```

Request body:

```json
{
    "name": "Lokesh Kumar",
    "email": "lokeshkumar@example.com",
    "age": 22
}
```

Expected status:

```text
200 OK
```

---

### 5. Delete User

```http
DELETE /api/users/:id
```

Example:

```http
DELETE /api/users/1
```

Expected status:

```text
200 OK
```

## Error Handling

The API handles common errors including:

* Missing required fields
* Invalid email
* Duplicate email
* User not found
* Internal server errors

Example:

```json
{
    "success": false,
    "message": "User not found"
}
```

## HTTP Status Codes

| Status Code | Meaning               |
| ----------- | --------------------- |
| 200         | Request successful    |
| 201         | Resource created      |
| 400         | Invalid request       |
| 404         | Resource not found    |
| 500         | Internal server error |

## Installation

Clone the repository:

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

Navigate to the project:

```bash
cd codveda-fullstack-internship/level-1/task-2-rest-api
```

Install dependencies:

```bash
npm install
```

## Environment Variables

Create a `.env` file:

```env
PORT=5000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD
DB_NAME=codveda_level1
DB_DIALECT=mysql
```

Do not commit the `.env` file to GitHub.

## Database Setup

Create the MySQL database:

```sql
CREATE DATABASE codveda_level1;
```

The Sequelize configuration automatically synchronizes the required table when the application starts.

## Run the Application

Development mode:

```bash
npm run dev
```

Or:

```bash
npm start
```

The server runs at:

```text
http://localhost:5000
```

## Testing

The API was tested using **Postman**.

Tested operations:

* Create User
* Get All Users
* Get User By ID
* Update User
* Delete User
* User Not Found
* Invalid Input
* Duplicate Email

## Project Evidence

Screenshots of the following tests are maintained for internship documentation:

1. Server running successfully
2. Create User — POST
3. Get All Users — GET
4. Get User By ID — GET
5. Update User — PUT
6. Delete User — DELETE
7. Error handling — 404
8. Validation — 400

## Internship

**Program:** Full Stack Development Internship
**Organization:** Codveda Technologies
**Level:** Level 1
**Task:** Task 2 — Build a Simple REST API

## Author

**Lokesh**
