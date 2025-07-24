import { Router } from 'express'
import {getForecastByCoordinate, getForecastByState} from '../controllers/weather.controller.js'

const weatherRouter = Router();

weatherRouter.post('/by-state', getForecastByState);
weatherRouter.post('/by-coordinates', getForecastByCoordinate);

export default weatherRouter;