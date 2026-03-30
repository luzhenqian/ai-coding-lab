export const SCHEMA = `
  CREATE TABLE IF NOT EXISTS boards (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    position INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
  );

  CREATE TABLE IF NOT EXISTS columns (
    id TEXT PRIMARY KEY,
    board_id TEXT NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#3b82f6',
    position INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS cards (
    id TEXT PRIMARY KEY,
    column_id TEXT NOT NULL REFERENCES columns(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    color TEXT NOT NULL DEFAULT '#3b82f6',
    priority TEXT NOT NULL DEFAULT 'medium',
    due_date INTEGER,
    position INTEGER NOT NULL DEFAULT 0,
    archived INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
  );

  CREATE TABLE IF NOT EXISTS tags (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#8b5cf6'
  );

  CREATE TABLE IF NOT EXISTS card_tags (
    card_id TEXT NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (card_id, tag_id)
  );

  CREATE TABLE IF NOT EXISTS checklist_items (
    id TEXT PRIMARY KEY,
    card_id TEXT NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    checked INTEGER NOT NULL DEFAULT 0,
    position INTEGER NOT NULL DEFAULT 0
  );
`;
