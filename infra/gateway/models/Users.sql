-- Users table for Gateway service
-- Only stores id and username for each user

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL
); 