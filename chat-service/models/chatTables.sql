-- Active: 1746933162460@@127.0.0.1@5999@dashdb
CREATE TABLE IF NOT EXISTS chatter(
    id SERIAL PRIMARY KEY,
    username VARCHAR(60) UNIQUE NOT NULL,
    first_name VARCHAR(30),
    last_name VARCHAR(30),
    is_online BOOLEAN DEFAULT FALSE,
    avatar VARCHAR(120),
    background VARCHAR(120)
);

CREATE TABLE IF NOT EXISTS conversation(
    id SERIAL PRIMARY KEY,
    user1 INT REFERENCES chatter(id),
    user2 INT REFERENCES chatter(id),
    last_msg1 INT DEFAULT -1,
    last_msg2 INT DEFAULT -1,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS msg(
    id SERIAL PRIMARY KEY,
    conv_id INT REFERENCES conversation(id),
    sender INT REFERENCES chatter(id),
    data TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);