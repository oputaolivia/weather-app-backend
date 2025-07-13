import { Router } from 'express'
import { getWeatherData } from '../controllers/weather.controller.js'

const weatherRouter = Router();

weatherRouter.post('/', getWeatherData);

export default weatherRouter;