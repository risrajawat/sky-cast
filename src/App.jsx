import { useState } from 'react'
import './App.css'

function App() {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWeather = async (e) => {
    e.preventDefault();
    if (!city.trim()) return;

    setLoading(true);
    setError(null);
    setWeatherData(null);

    try {
      const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
      
      // If the user hasn't set an API key yet, fail gracefully with a specific message
      if (!apiKey || apiKey === 'paste_your_api_key_here') {
        throw new Error('Please add your OpenWeatherMap API key to the .env file');
      }

      const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('City not found. Please try another city.');
        }
        if (response.status === 401) {
          throw new Error('Invalid API key. Please check your .env file.');
        }
        throw new Error('Failed to fetch weather data');
      }

      const data = await response.json();
      setWeatherData({
        temp: Math.round(data.main.temp),
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        name: data.name,
        country: data.sys.country
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="skycast-container">
      <header className="header">
        <h1>Sky-Cast</h1>
        <p>Real-time weather data at your fingertips</p>
      </header>
      
      <main className="main-content">
        <form onSubmit={fetchWeather} className="search-form">
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Enter city name..."
            className="search-input"
            aria-label="City name"
          />
          <button type="submit" className="search-button" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {loading && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Fetching weather data...</p>
          </div>
        )}

        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        {weatherData && (
          <div className="weather-card animate-fade-in">
            <div className="weather-header">
              <h2>{weatherData.name}, {weatherData.country}</h2>
              <img 
                src={`https://openweathermap.org/img/wn/${weatherData.icon}@4x.png`} 
                alt={weatherData.description}
                className="weather-icon"
              />
            </div>
            
            <div className="weather-main">
              <span className="temp">{weatherData.temp}°C</span>
              <span className="desc">{weatherData.description}</span>
            </div>
            
            <div className="weather-details">
              <div className="detail-item">
                <span className="label">Humidity</span>
                <span className="value">{weatherData.humidity}%</span>
              </div>
              <div className="detail-item">
                <span className="label">Wind Speed</span>
                <span className="value">{weatherData.windSpeed} m/s</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
