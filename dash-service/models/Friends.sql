CREATE TABLE IF NOT EXISTS friends(
    sender INT REFERENCE account(id),
    receiver INT REFERENCE account(id),
    status INT DEFAULT 0,
    CONSTRAINT fr_pkey PRIMARY KEY (sender, receiver)
);