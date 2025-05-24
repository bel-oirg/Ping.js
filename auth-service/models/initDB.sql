CREATE TABLE IF NOT EXISTS account(
    id SERIAL PRIMARY KEY,
    username VARCHAR(60) UNIQUE NOT NULL,
    email VARCHAR(60) UNIQUE NOT NULL,
    first_name VARCHAR(30),
    last_name VARCHAR(30),
    password TEXT NOT NULL,
    is_oauth BOOLEAN DEFAULT FALSE,
    avatar VARCHAR(120)
)