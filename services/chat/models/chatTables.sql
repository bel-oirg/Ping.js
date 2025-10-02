-- Active: 1746933162460@@127.0.0.1@5999@chatdb
CREATE TABLE IF NOT EXISTS chatter(
    id INT PRIMARY KEY,
    username VARCHAR(60) UNIQUE NOT NULL,
    first_name VARCHAR(30),
    last_name VARCHAR(30),
    avatar VARCHAR(120)
);


CREATE TABLE IF NOT EXISTS msg(
    id SERIAL PRIMARY KEY,
    user1 INT REFERENCES chatter(id),
    user2 INT REFERENCES chatter(id),
    sender INT REFERENCES chatter(id),
    data TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS friends(
    user_id INT REFERENCES chatter(id) NOT NULL,
    friend_id INT REFERENCES chatter(id) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (user_id, friend_id),
    CHECK (user_id != friend_id) 
);