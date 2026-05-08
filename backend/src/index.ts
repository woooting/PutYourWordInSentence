import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { generateRoute } from './routes/GenerateRoute'
import { errorHandler } from './middlewares/ErrorHandler'

const app = new Hono()

app.use('/*', cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type'],
}))

app.onError(errorHandler)

app.get('/api/health', (c) => {
  return c.json({
    code: 0,
    msg: 'ok',
    data: { timestamp: new Date().toISOString() },
  })
})

app.route('/api', generateRoute)

export default {
  port: 3001,
  fetch: app.fetch,
}
