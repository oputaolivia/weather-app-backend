import stateCoordinates from "../../utils/statesCoordinates.js";

import { fetchForecast } from '../services/weather.service.js'

export const getWeatherData = async (req, res) => {
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