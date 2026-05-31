import { defineConfig, Plugin } from 'vite';
import fs from 'node:fs';
import path from 'node:path';

const DB_PATH = path.resolve('data/kanban.json');

type Board = { columns: { id: string; title: string }[]; cards: { id: string; title: string; columnId: string; order: number }[] };

function readDb(): Board {
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
}

function writeDb(data: Board) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

function mockApiPlugin(): Plugin {
  return {
    name: 'mock-api',
    configureServer(server) {
      // GET /api/board
      server.middlewares.use('/api/board', (req, res, next) => {
        if (req.method !== 'GET') return next();
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(readDb()));
      });

      // POST /api/cards
      server.middlewares.use('/api/cards', (req, res, next) => {
        if (req.method !== 'POST') return next();
        let body = '';
        req.on('data', (c) => body += c);
        req.on('end', () => {
          const { columnId, title } = JSON.parse(body);
          const db = readDb();
          const newCard = {
            id: String(Date.now()),
            title,
            columnId,
            order: db.cards.filter(c => c.columnId === columnId).length
          };
          db.cards.push(newCard);
          writeDb(db);
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(newCard));
        });
      });

      // PATCH /api/cards/:id
      server.middlewares.use('/api/cards/', (req, res, next) => {
        if (req.method !== 'PATCH') return next();
        const cardId = req.url!.split('/').pop();
        let body = '';
        req.on('data', (c) => body += c);
        req.on('end', () => {
          const updates = JSON.parse(body);
          const db = readDb();
          const card = db.cards.find(c => c.id === cardId);
          if (card) {
            if (updates.columnId !== undefined) card.columnId = updates.columnId;
            if (updates.title !== undefined) card.title = updates.title;
            // Recalculate orders within each column
            db.columns.forEach(col => {
              db.cards
                .filter(c => c.columnId === col.id)
                .sort((a, b) => a.order - b.order)
                .forEach((c, i) => { c.order = i; });
            });
          }
          writeDb(db);
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(card));
        });
      });

      // DELETE /api/cards/:id
      server.middlewares.use('/api/cards/', (req, res, next) => {
        if (req.method !== 'DELETE') return next();
        const cardId = req.url!.split('/').pop();
        const db = readDb();
        db.cards = db.cards.filter(c => c.id !== cardId);
        // Recalculate orders
        db.columns.forEach(col => {
          db.cards
            .filter(c => c.columnId === col.id)
            .forEach((c, i) => { c.order = i; });
        });
        writeDb(db);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: true }));
      });
    }
  };
}

export default defineConfig({
  plugins: [mockApiPlugin()]
});
