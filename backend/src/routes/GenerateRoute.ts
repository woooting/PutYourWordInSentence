import { Hono } from 'hono'
import { generateController } from '../controllers/GenerateController'

export const generateRoute = new Hono()

generateRoute.post('/generate', generateController)
