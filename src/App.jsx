import { useState, useEffect } from 'react'

function App() {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Milestone 3 Features States
  const [theme, setTheme] = useState('light');
  const [favorites, setFavorites] = useState([]);
  const [searchFavorites, setSearchFavorites] = useState('');
  const [sortOption, setSortOption] = useState('name-asc'); 

  // Dark / Light Mode Toggle
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const fetchWeather = async (e) => {
    e.preventDefault();
    if (!city.trim()) return;

    setLoading(true);
    setError(null);
    setWeatherData(null);

    try {
      const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
      
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
        id: data.id,
        temp: Math.round(data.main.temp),
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        name: data.name,
        country: data.sys.country
      });
      setCity(''); // Clear the input field after successful search
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Button Interactions (Save/Remove Favorites)
  const addFavorite = () => {
    if (!weatherData) return;
    
    // Array Higher-Order Function: find
    const isAlreadyFavorite = favorites.find(fav => fav.id === weatherData.id);
    if (!isAlreadyFavorite) {
      setFavorites([...favorites, weatherData]);
    }
  };

  const removeFavorite = (id) => {
    // Array Higher-Order Function: filter
    const filtered = favorites.filter(fav => fav.id !== id);
    setFavorites(filtered);
  };

  // Search/Filtering Data using Array Higher-Order Function: filter
  const filteredFavorites = favorites.filter(fav => 
    fav.name.toLowerCase().includes(searchFavorites.toLowerCase())
  );

  // Sorting Data using Array Higher-Order Function: sort
  const sortedFavorites = [...filteredFavorites].sort((a, b) => {
    if (sortOption === 'name-asc') return a.name.localeCompare(b.name);
    if (sortOption === 'name-desc') return b.name.localeCompare(a.name);
    if (sortOption === 'temp-desc') return b.temp - a.temp;
    if (sortOption === 'temp-asc') return a.temp - b.temp;
    return 0;
  });

  // Check if current weather data is in favorites
  const isCurrentFavorite = weatherData && favorites.find(fav => fav.id === weatherData.id);

  return (
    <div className="flex flex-col items-center p-10 px-5 w-full flex-1 min-h-screen bg-white dark:bg-[#16171d] text-[#6b6375] dark:text-[#9ca3af] transition-colors duration-300">
      <header className="mb-10 w-full max-w-[500px]">
        <div className="flex flex-col sm:flex-row justify-between items-center sm:mb-2 gap-3 sm:gap-0">
          <h1 className="text-4xl sm:text-5xl m-0 pb-1 font-medium bg-gradient-to-br from-purple-500 to-pink-400 bg-clip-text text-transparent leading-tight">Sky-Cast</h1>
          <button 
            className="bg-[#f4f3ec]/50 dark:bg-[#2f303a]/50 border border-[#e5e4e7] dark:border-[#2e303a] text-slate-900 dark:text-gray-100 px-4 py-2 rounded-full font-medium hover:bg-[#f4f3ec] dark:hover:bg-[#1f2028] hover:border-purple-500 transition-colors" 
            onClick={toggleTheme} 
            aria-label="Toggle Theme"
          >
            {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
          </button>
        </div>
        <p className="text-lg text-center sm:text-left">Real-time weather data at your fingertips</p>
      </header>
      
      <main className="w-full max-w-[500px] flex flex-col gap-8">
        <form onSubmit={fetchWeather} className="flex gap-2 w-full">
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Enter city name..."
            className="flex-1 px-5 py-3 rounded-xl border-2 border-[#e5e4e7] dark:border-[#2e303a] bg-[#f4f3ec] dark:bg-[#1f2028] text-slate-900 dark:text-gray-100 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all min-w-0"
            aria-label="City name"
          />
          <button type="submit" className="px-6 py-3 rounded-xl bg-purple-500 text-white font-semibold hover:bg-purple-600 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 transition-all" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {loading && (
          <div className="flex flex-col items-center gap-4 p-10">
            <div className="w-10 h-10 border-4 border-[#e5e4e7] dark:border-[#2e303a] border-t-purple-500 rounded-full animate-spin"></div>
            <p>Fetching weather data...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 text-red-500 px-5 py-4 rounded-xl border border-red-500/20">
            <p>{error}</p>
          </div>
        )}

        {weatherData && (
          <div className="bg-[#f4f3ec]/50 dark:bg-[#2f303a]/50 rounded-3xl p-6 sm:p-8 shadow-lg border border-[#e5e4e7] dark:border-[#2e303a] flex flex-col gap-6 relative overflow-hidden backdrop-blur-md animate-[fadeIn_0.5s_ease-out_forwards]">
            <div className="flex flex-col items-center gap-2 z-10">
              <h2 className="text-3xl m-0 text-slate-900 dark:text-gray-100 font-medium">{weatherData.name}, {weatherData.country}</h2>
              <img 
                src={`https://openweathermap.org/img/wn/${weatherData.icon}@4x.png`} 
                alt={weatherData.description}
                className="w-32 h-32 drop-shadow-xl"
              />
            </div>
            
            <div className="flex flex-col items-center z-10">
              <span className="text-6xl sm:text-[4.5rem] font-bold text-slate-900 dark:text-gray-100 leading-none">{weatherData.temp}°C</span>
              <span className="text-xl capitalize mt-2">{weatherData.description}</span>
            </div>
            
            <div className="flex justify-around bg-black/5 dark:bg-white/5 rounded-2xl p-5 mt-2 z-10">
              <div className="flex flex-col items-center gap-1">
                <span className="text-sm">Humidity</span>
                <span className="text-xl font-semibold text-slate-900 dark:text-gray-100">{weatherData.humidity}%</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-sm">Wind Speed</span>
                <span className="text-xl font-semibold text-slate-900 dark:text-gray-100">{weatherData.windSpeed} m/s</span>
              </div>
            </div>

            <button 
              className={`p-3 rounded-xl border border-purple-500 text-purple-500 font-semibold transition-all text-base ${isCurrentFavorite ? 'bg-purple-500/10 cursor-default' : 'bg-transparent hover:bg-purple-500/10 cursor-pointer'}`} 
              onClick={addFavorite}
              disabled={isCurrentFavorite}
            >
              {isCurrentFavorite ? '❤️ Saved to Favorites' : '🤍 Save to Favorites'}
            </button>
          </div>
        )}

        {favorites.length > 0 && (
          <div className="bg-[#f4f3ec]/50 dark:bg-[#2f303a]/50 rounded-3xl p-6 sm:p-8 shadow-lg border border-[#e5e4e7] dark:border-[#2e303a] flex flex-col gap-5 animate-[fadeIn_0.5s_ease-out_forwards]">
            <h3 className="m-0 text-2xl text-slate-900 dark:text-gray-100 font-medium">Your Favorites</h3>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <input 
                type="text" 
                placeholder="Search favorites..." 
                value={searchFavorites}
                onChange={(e) => setSearchFavorites(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl border-2 border-[#e5e4e7] dark:border-[#2e303a] bg-[#f4f3ec] dark:bg-[#1f2028] text-slate-900 dark:text-gray-100 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all min-w-0"
              />
              <select 
                value={sortOption} 
                onChange={(e) => setSortOption(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl border-2 border-[#e5e4e7] dark:border-[#2e303a] bg-[#f4f3ec] dark:bg-[#1f2028] text-slate-900 dark:text-gray-100 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all min-w-0"
              >
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="temp-desc">Temp (High-Low)</option>
                <option value="temp-asc">Temp (Low-High)</option>
              </select>
            </div>

            <div className="flex flex-col gap-3">
              {/* Rendering via Array Higher-Order Function: map */}
              {sortedFavorites.map(fav => (
                <div key={fav.id} className="flex items-center justify-between px-4 py-3 bg-[#f4f3ec] dark:bg-[#1f2028] rounded-xl border border-[#e5e4e7] dark:border-[#2e303a] hover:-translate-y-1 hover:border-purple-500/50 transition-all">
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-slate-900 dark:text-gray-100">{fav.name}</span>
                    <span className="text-lg">{fav.temp}°C</span>
                  </div>
                  <img src={`https://openweathermap.org/img/wn/${fav.icon}.png`} alt={fav.description} className="w-12 h-12 drop-shadow-md" />
                  <button className="bg-transparent border-none cursor-pointer text-xl p-2 opacity-60 hover:opacity-100 transition-opacity" onClick={() => removeFavorite(fav.id)} title="Remove Favorite">❌</button>
                </div>
              ))}
              {sortedFavorites.length === 0 && searchFavorites !== '' && (
                <p className="text-center italic py-5">No favorites match "{searchFavorites}"</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
