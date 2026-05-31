import { defineConfig, Plugin } from 'vite';

function parseCookies(raw = ''): Record<string, string> {
  return Object.fromEntries(
    raw.split(';').filter(Boolean).map(c => {
      const [k, ...v] = c.trim().split('=');
      return [k, v.join('=')];
    })
  );
}

function setCookie(res: any, name: string, value: string, opts: { maxAge?: number } = {}) {
  let cookie = `${name}=${value}; HttpOnly; SameSite=Strict; Path=/`;
  if (opts.maxAge !== undefined) cookie += `; Max-Age=${opts.maxAge}`;
  res.setHeader('Set-Cookie', cookie);
}

function clearCookie(res: any, name: string) {
  setCookie(res, name, '', { maxAge: 0 });
}

/** Mock API server with proper HTTP-only cookie auth. */
function mockApiPlugin(): Plugin {
  return {
    name: 'mock-api',
    configureServer(server) {
      // POST /api/login — validate credentials and set cookie
      server.middlewares.use('/api/login', (req, res, next) => {
        if (req.method !== 'POST') return next();

        let body = '';
        req.on('data', (chunk) => body += chunk);
        req.on('end', () => {
          const { username, password } = JSON.parse(body);

          if (password !== 'secret') {
            res.statusCode = 401;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Invalid credentials' }));
            return;
          }

          const token = btoa(`${username}:${Date.now()}`);
          setCookie(res, 'auth_token', token);
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ user: { name: username } }));
        });
      });

      // POST /api/logout — clear cookie
      server.middlewares.use('/api/logout', (req, res, next) => {
        if (req.method !== 'POST') return next();

        clearCookie(res, 'auth_token');
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: true }));
      });

      // GET /api/me — read cookie and validate session
      server.middlewares.use('/api/me', (req, res, next) => {
        if (req.method !== 'GET') return next();

        const cookies = parseCookies(req.headers.cookie);
        const token = cookies.auth_token;

        if (!token) {
          res.statusCode = 401;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Not authenticated' }));
          return;
        }

        const [username] = atob(token).split(':');
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ user: { name: username }, token }));
      });
    }
  };
}

export default defineConfig({
  plugins: [mockApiPlugin()]
});
