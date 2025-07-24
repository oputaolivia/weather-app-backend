import stateCoordinates from "../../utils/statesCoordinates.js";

import { fetchForecast } from '../services/weather.service.js'

export const getForecastByState = async (req, res) => {
    const { state } = req.body;

    if (!state) {
        return res.status(400).json({ error: 'Missing state' });
    }

    const coordinates = stateCoordinates[state];

    if (!coordinates) {
        return res.status(404).json({ error: `Coordinates not found for ${state} state` });
    }

    try {
        const weather = await fetchForecast(coordinates.lat, coordinates.lon);
        res.status(200).json(weather);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Failed to fetch weather data, probably Olivia's fault" });
    }
}

export const getForecastByCoordinate = async (req, res) => {
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
        return res.status(400).json({ error: 'Missing coordinates' });
    }

    try {
        const weather = await fetchForecast(latitude, longitude);
        res.status(200).json(weather);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Failed to fetch weather data, probably Jesse's fault" });
    }
}