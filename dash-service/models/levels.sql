CREATE TABLE IF NOT EXISTS levels (
  id SERIAL PRIMARY KEY,
  min_exp INTEGER NOT NULL,
  max_exp INTEGER NOT NULL,
  reward INTEGER NOT NULL
);

DO $$
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM levels) THEN
      INSERT INTO levels (id, min_exp, max_exp, reward)
      VALUES 
        (1, 0, 200, 150),
        (2, 200, 400, 250),
        (3, 400, 600, 350),
        (4, 600, 800, 450),
        (5, 800, 1000, 550),
        (6, 1000, 1200, 650),
        (7, 1200, 1400, 750),
        (8, 1400, 1600, 850),
        (9, 1600, 1800, 950),
        (10, 1800, 2000, 1050),
        (11, 2000, 2200, 1150),
        (12, 2200, 2400, 1250),
        (13, 2400, 2600, 1350),
        (14, 2600, 2800, 1450),
        (15, 2800, 3000, 1550);
    END IF;
  END
$$;
