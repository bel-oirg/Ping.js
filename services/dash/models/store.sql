CREATE TABLE IF NOT EXISTS backgrounds (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price INTEGER NOT NULL,
  image_path VARCHAR(255) NOT NULL
);

DO $$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM backgrounds) THEN
        INSERT INTO backgrounds (id, name, price, image_path)
        VALUES 
        (1, 'Gaming', 2100, '/data/backgrounds/bg1.png'),
        (2, 'Chill', 500, '/data/backgrounds/bg2.png'),
        (3, 'Neon', 1500, '/data/backgrounds/bg3.png'),
        (4, 'Ocean', 2500, '/data/backgrounds/bg4.png');
        END IF;
    END
$$;



CREATE TABLE IF NOT EXISTS avatars (
  id SERIAL PRIMARY KEY,
  price INTEGER NOT NULL,
  image_path VARCHAR(255) NOT NULL
);

DO $$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM avatars) THEN
        INSERT INTO avatars (id, price, image_path)
        VALUES 
        (1, 430, '/data/avatars/1.png'),
        (2, 200, '/data/avatars/2.png'),
        (3, 600, '/data/avatars/3.png'),
        (4, 1100, '/data/avatars/4.png'),
        (5, 410, '/data/avatars/5.png'),
        (6, 1300, '/data/avatars/6.png'),
        (7, 800, '/data/avatars/7.png'),
        (8, 6969, '/data/avatars/8.png'),
        (9, 1100, '/data/avatars/9.png'),
        (10, 2100, '/data/avatars/10.png'),
        (11, 300, '/data/avatars/11.png'),
        (12, 100, '/data/avatars/12.png'),
        (13, 500, '/data/avatars/13.png'),
        (14, 200, '/data/avatars/14.png'),
        (15, 440, '/data/avatars/15.png'),
        (16, 170, '/data/avatars/16.png'),
        (17, 910, '/data/avatars/17.png'),
        (18, 210, '/data/avatars/18.png'),
        (19, 300, '/data/avatars/19.png'),
        (20, 580, '/data/avatars/20.png');
        END IF;
    END
$$;


CREATE TABLE IF NOT EXISTS inventory (
    user_id INT REFERENCES player(id),
    item_id INT NOT NULL,
    item_type INT NOT NULL,
    is_equipped BOOLEAN DEFAULT FALSE,
    CONSTRAINT item_user PRIMARY KEY (user_id, item_id, item_type)
);