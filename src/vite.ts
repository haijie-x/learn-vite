import express from 'express'
import { createServer as createViteServer } from 'vite'
import path, { dirname } from 'node:path'
import { fileURLToPath } from 'url'
import fs from 'node:fs/promises'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function createServer() {
  const app = express()
  // Create Vite server in middleware mode
  const dir = path.resolve(__dirname, '../example-vite')
  const vite = await createViteServer({
    root: dir,
    server: { middlewareMode: true },
    appType: 'custom' // don't include Vite's default HTML handling middlewares
  })
  // Use vite's connect instance as middleware
  app.use(vite.middlewares)

  app.use('*', async (req, res) => {
    const url = new URL(req.originalUrl, 'http://' + req.headers.host)
    const hasExtension = url.pathname.split('.').length > 1

    if (!hasExtension) {
      let template = await fs.readFile(path.resolve(dir, 'index.html'), 'utf-8')
      template = await vite.transformIndexHtml(url.toString(), template)
      // Since `appType` is `'custom'`, should serve response here.
      // Note: if `appType` is `'spa'` or `'mpa'`, Vite includes middlewares to handle
      // HTML requests and 404s so user middlewares should be added
      // before Vite's middlewares to take effect instead

      // 4. render the app HTML. This assumes entry-server.js's exported
      //     `render` function calls appropriate framework SSR APIs,
      //    e.g. ReactDOMServer.renderToString()
      // const appHtml = await render(url)

      // 5. Inject the app-rendered HTML into the template.
      // const html = template.replace(`<!--ssr-outlet-->`, appHtml)

      // 6. Send the rendered HTML back.
      res.status(200).set({ 'Content-Type': 'text/html' }).end(template)
    }
  })

  return app
}

createServer().then(app => {
  app.listen('5173', () => {
    console.log('Listening on 5173...')
  })
})
