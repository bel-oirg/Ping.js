CREATE TABLE IF NOT EXISTS account(
    id SERIAL PRIMARY KEY,
    username VARCHAR(60) UNIQUE NOT NULL,
    email VARCHAR(60) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    is_oauth BOOLEAN DEFAULT FALSE,
    is_otp BOOLEAN DEFAULT FALSE,
    otp_secret VARCHAR(30)
);


CREATE TABLE IF NOT EXISTS change_pass(
    id SERIAL PRIMARY KEY,
    email VARCHAR(60) REFERENCES account(email),
    otp_code VARCHAR(6) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

