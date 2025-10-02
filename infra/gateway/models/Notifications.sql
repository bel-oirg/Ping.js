CREATE TABLE notifications (
  id TEXT PRIMARY KEY,
  type SMALLINT NOT NULL CHECK (type IN (1, 2)),
  sender_id INTEGER NOT NULL,
  receiver_id INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  read BOOLEAN DEFAULT false
);

CREATE INDEX idx_notifications_unread 
  ON notifications (receiver_id, read);

CREATE INDEX idx_notifications_receiver_created 
  ON notifications (receiver_id, created_at DESC);
