-- Active: 1751886224793@@127.0.0.1@5432@postgres
CREATE TABLE IF NOT EXISTS player(
    id INT PRIMARY KEY,
    username VARCHAR(60) UNIQUE NOT NULL,
    email VARCHAR(60) UNIQUE NOT NULL,
    first_name VARCHAR(30),
    last_name VARCHAR(30),
    is_oauth BOOLEAN DEFAULT FALSE,
    is_otp BOOLEAN DEFAULT FALSE,
    QRCODE TEXT,
    CLITOKEN TEXT,
    otp_secret VARCHAR(30),
    level INT DEFAULT 1,
    rank INT DEFAULT 1,
    exp INT DEFAULT 0,
    budget INT DEFAULT 1000,
    avatar VARCHAR(120) DEFAULT '/data/avatars/default.png',
    background VARCHAR(120) DEFAULT '/data/backgrounds/default.png'
);

CREATE TABLE IF NOT EXISTS friends(
    sender INT REFERENCES player(id),
    receiver INT REFERENCES player(id),
    status INT DEFAULT 0,
    CONSTRAINT fr_pkey PRIMARY KEY (sender, receiver)
);

CREATE TABLE IF NOT EXISTS playerStats(
    id SERIAL PRIMARY KEY,
    player1 INT REFERENCES player(id),
    player2 INT REFERENCES player(id),
    score1 INT DEFAULT 0,
    score2 INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);