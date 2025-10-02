CREATE TABLE IF NOT EXISTS playerStats(
    id SERIAL PRIMARY KEY,
    player1 INT REFERENCES player(id),
    player2 INT REFERENCES player(id),
    score1 INT DEFAULT 0,
    score2 INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);