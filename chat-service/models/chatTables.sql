-- Active: 1746933162460@@127.0.0.1@5999@dashdb
CREATE TABLE IF NOT EXISTS chatter(
    id SERIAL PRIMARY KEY,
    username VARCHAR(60) UNIQUE NOT NULL,
    first_name VARCHAR(30),
    last_name VARCHAR(30),
    is_online BOOLEAN DEFAULT FALSE, -- how to ?
    avatar VARCHAR(120),
    background VARCHAR(120) -- i think no need
);

-- CREATE TABLE IF NOT EXISTS conversation(
--     id SERIAL PRIMARY KEY,
--     user1 INT REFERENCES chatter(id),
--     user2 INT REFERENCES chatter(id),
--     last_msg1 INT DEFAULT -1,
--     last_msg2 INT DEFAULT -1,
--     created_at TIMESTAMP DEFAULT NOW()
-- );

CREATE TABLE IF NOT EXISTS msg(
    user1 INT REFERENCES chatter(id),
    user2 INT REFERENCES chatter(id),
    sender INT REFERENCES chatter(id),
    data TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);


--1
--eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwiaWF0IjoxNzUxNTc5MjExLCJleHAiOjE3NTE1OTM2MTF9.uifXnqOjKWKnLBoAsgicuv0ORdc3qVbPyuU2KOtaR_4

--2
--eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwiaWF0IjoxNzUxNTc5MTc2LCJleHAiOjE3NTE1OTM1NzZ9.GGbAwdy0_XwZRp4cv5_uBnLU8w8o8KVhjeAaV153X-M
