import fetch from "node-fetch";

import dotenv from "dotenv";

dotenv.config()

export const fetchForecast = async (lat, lon) => {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&units=metric&appid=${apiKey}`;

    const response = await fetch(url);
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'OpenWeather API call failed');
    }

    return await response.json();
}
