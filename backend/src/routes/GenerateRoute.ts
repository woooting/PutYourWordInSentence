import { Hono } from 'hono'
import { generateController } from '../controllers/GenerateController'
import { singleGenerateController } from '../controllers/SingleGenerateController'

export const generateRoute = new Hono()

generateRoute.post('/generate', generateController)
generateRoute.post('/generate/single', singleGenerateController)
