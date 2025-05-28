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
        (1, 'Space', 500, 'data/backgrounds/Space.png'),
        (2, 'Forest', 500, 'data/backgrounds/Forest.png'),
        (3, 'Neon', 500, 'data/backgrounds/Neon.png'),
        (4, 'Ocean', 500, 'data/backgrounds/Ocean.png');
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
        (1, 100, 'data/avatars/1.png'),
        (2, 100, 'data/avatars/2.png'),
        (3, 100, 'data/avatars/3.png'),
        (4, 100, 'data/avatars/4.png'),
        (5, 100, 'data/avatars/5.png'),
        (6, 100, 'data/avatars/6.png'),
        (7, 100, 'data/avatars/7.png'),
        (8, 100, 'data/avatars/8.png'),
        (9, 100, 'data/avatars/9.png'),
        (10, 100, 'data/avatars/10.png'),
        (11, 100, 'data/avatars/11.png'),
        (12, 100, 'data/avatars/12.png'),
        (13, 100, 'data/avatars/13.png'),
        (14, 100, 'data/avatars/14.png'),
        (15, 100, 'data/avatars/15.png'),
        (16, 100, 'data/avatars/16.png'),
        (17, 100, 'data/avatars/17.png'),
        (18, 100, 'data/avatars/18.png'),
        (19, 100, 'data/avatars/19.png'),
        (20, 100, 'data/avatars/20.png'),
        (21, 100, 'data/avatars/21.png'),
        (22, 100, 'data/avatars/22.png'),
        (23, 100, 'data/avatars/23.png'),
        (24, 100, 'data/avatars/24.png'),
        (25, 100, 'data/avatars/25.png'),
        (26, 100, 'data/avatars/26.png'),
        (27, 100, 'data/avatars/27.png'),
        (28, 100, 'data/avatars/28.png'),
        (29, 100, 'data/avatars/29.png'),
        (30, 100, 'data/avatars/30.png'),
        (31, 100, 'data/avatars/31.png'),
        (32, 100, 'data/avatars/32.png'),
        (33, 100, 'data/avatars/33.png'),
        (34, 100, 'data/avatars/34.png'),
        (35, 100, 'data/avatars/35.png');
        END IF;
    END
$$;



CREATE TABLE IF NOT EXISTS emotes_packs (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  price INTEGER NOT NULL,
  image_path VARCHAR(255) NOT NULL
);


DO $$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM avatars) THEN
        INSERT INTO emotes_packs (id, pack_id, name, price, path)
        VALUES 
        (1, 1, 'Geometry Pack', 500, 'data/emotes/geometry'),
        (2, 2, 'Luna Pack', 500, 'data/emotes/luna'),
        (3, 3, 'Sanrio Pack', 500, 'data/emotes/sanrio');
        END IF;
    END
$$;

CREATE TYPE IF NOT EXISTS ITEMTYPES AS ENUM('avatars', 'backgrounds', 'emotes_packs');


CREATE TABLE IF NOT EXISTS inventory (
    user_id INT REFERENCES player(id),
    item_id INT NOT NULL,
    item_type ITEMTYPES NOT NULL,
    CONSTRAINT item_user PRIMARY KEY (user_id, item_id, item_type)
)


SELECT id, username FROM player WHERE 
            username LIKE '%s%' LIMIT 5;

-- CREATE TABLE IF NOT EXISTS emotes (
--   id SERIAL PRIMARY KEY,
--   name VARCHAR(100) NOT NULL,
--   path VARCHAR(255) NOT NULL,
--   pack_id INTEGER NOT NULL
-- );


-- INSERT INTO emotes (id, name, path)
-- VALUES 
--   -- Geometry pack
--   (1, 'Trophy', 'data/emotes/geometry/trophy.png'),
--   (2, 'Demon', 'data/emotes/geometry/demon.png'),
--   (3, 'Demon Insane', 'data/emotes/geometry/demoninsane.png'),
--   (4, 'Demon Medium', 'data/emotes/geometry/demonmedium.png'),
--   (5, 'Moon', 'data/emotes/geometry/moon.png'),
--   (6, 'Star', 'data/emotes/geometry/star.png'),
--   (7, 'User Coin', 'data/emotes/geometry/usercoin.png'),
--   (8, 'Mod', 'data/emotes/geometry/mod.png'),
--   (9, 'Elder Mod', 'data/emotes/geometry/eldermod.png'),
--   (10, 'Creator Point', 'data/emotes/geometry/creatorpoint.png'),
--   (11, 'Demon Easy', 'data/emotes/geometry/demoneasy.png'),
--   (12, 'Demon Extreme', 'data/emotes/geometry/demonextreme.png'),
--   (13, 'Happy', 'data/emotes/geometry/happy.png'),
--   (14, 'Copy Paste', 'data/emotes/geometry/copypaste.png'),
--   (15, 'Golden Coin', 'data/emotes/geometry/goldencoin.png'),
  
--   -- Luna pack
--   (16, 'Crying', 'data/emotes/luna/crying.png'),
--   (17, 'Curious', 'data/emotes/luna/curious.png'),
--   (18, 'Drinking', 'data/emotes/luna/drinking.png'),
--   (19, 'Praying', 'data/emotes/luna/praying.png'),
--   (20, 'Tired', 'data/emotes/luna/tired.png'),
--   (21, 'Hype', 'data/emotes/luna/hype.png'),
--   (22, 'Thinking', 'data/emotes/luna/thinking.png'),
  
--   -- Sanrio pack
--   (23, 'Melody Plushie', 'data/emotes/sanrio/melody-plushie.png'),
--   (24, 'Pochacco Plushie', 'data/emotes/sanrio/pochacco-plushie.png'),
--   (25, 'Cinnamoroll Plushie', 'data/emotes/sanrio/cinnamoroll-plushie.png'),
--   (26, 'Hello Kitty Plushie', 'data/emotes/sanrio/hellokitty-plushie.png'),
--   (27, 'Kuromi Plushie', 'data/emotes/sanrio/kuromi-plushie.png'),
--   (28, 'Pompompurin Plushie', 'data/emotes/sanrio/pompompurin-plushie.png');