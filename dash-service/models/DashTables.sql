-- Active: 1746933162460@@127.0.0.1@5999@dashdb
CREATE TABLE IF NOT EXISTS player(
    id SERIAL PRIMARY KEY,
    username VARCHAR(60) UNIQUE NOT NULL,
    email VARCHAR(60) UNIQUE NOT NULL,
    first_name VARCHAR(30),
    last_name VARCHAR(30),
    password TEXT NOT NULL,
    is_oauth BOOLEAN DEFAULT FALSE,
    is_otp_active BOOLEAN DEFAULT FALSE,
    is_otp_verified BOOLEAN DEFAULT FALSE,
    is_online BOOLEAN DEFAULT FALSE,
    level INT DEFAULT 1,
    rank INT DEFAULT 1,
    exp INT DEFAULT 0,
    budget INT DEFAULT 100,
    bio TEXT,
    avatar VARCHAR(120),
    background VARCHAR(120)
);

CREATE TABLE IF NOT EXISTS friends(
    sender INT REFERENCES player(id),
    receiver INT REFERENCES player(id),
    status INT DEFAULT 0,
    CONSTRAINT fr_pkey PRIMARY KEY (sender, receiver)
);


-- SELECT EXISTS(SELECT 1 FROM friends      
--             WHERE (sender = 3 AND receiver = 2) OR (sender = 2 AND receiver = 3))


-- INSERT INTO friends(sender, receiver) VALUES(1, 2);

-- SELECT sender FROM friends WHERE receiver = 2 AND status = 0

-- SELECT receiver FROM friends WHERE sender = 3 AND status = 0

-- INSERT INTO player(id, username, email, password, first_name, last_name) VALUES(22, 'das', 'dsadsa', 'dsadsa', 'das', 'dsa')