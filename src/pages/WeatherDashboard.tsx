import React, { useState, useEffect } from 'react';
import { Search, MapPin, CloudSun, Eye, Droplets, Wind, Gauge, Clock, Sun, Cloud, CloudRain, CloudSnow, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface WeatherData {
  name: string;
  country: string;
  temp: number;
  feelsLike: number;
  description: string;
  humidity: number;
  windSpeed: number;
  pressure: number;
  visibility: number;
  icon: string;
  main: string;
}

interface ForecastDay {
  date: string;
  temp: {
    min: number;
    max: number;
  };
  description: string;
  icon: string;
  main: string;
}

const API_KEY = process.env.WEATHERMAP_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

export default function WeatherDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }

    // Get user's location on initial load
    getCurrentLocationWeather();
  }, []);

  const saveRecentSearch = (city: string) => {
    const updated = [city, ...recentSearches.filter(s => s !== city)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const getCurrentLocationWeather = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          await fetchWeatherByCoords(latitude, longitude);
        },
        () => {
          // Default to New York if geolocation fails
          fetchWeather('New York');
        }
      );
    } else {
      fetchWeather('New York');
    }
  };

  const fetchWeatherByCoords = async (lat: number, lon: number) => {
    setLoading(true);
    try {
      const [currentResponse, forecastResponse] = await Promise.all([
        fetch(`${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=imperial`),
        fetch(`${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=imperial`)
      ]);

      if (!currentResponse.ok || !forecastResponse.ok) {
        throw new Error('Failed to fetch weather data');
      }

      const currentData = await currentResponse.json();
      const forecastData = await forecastResponse.json();

      setCurrentWeather({
        name: currentData.name,
        country: currentData.sys.country,
        temp: Math.round(currentData.main.temp),
        feelsLike: Math.round(currentData.main.feels_like),
        description: currentData.weather[0].description,
        humidity: currentData.main.humidity,
        windSpeed: Math.round(currentData.wind.speed),
        pressure: Math.round(currentData.main.pressure * 0.02953),
        visibility: Math.round(currentData.visibility / 1609.34),
        icon: currentData.weather[0].icon,
        main: currentData.weather[0].main
      });

      // Process 5-day forecast
      const dailyForecasts: ForecastDay[] = [];
      const processedDays = new Set();

      forecastData.list.forEach((item: { dt: number; main: { temp_min: number; temp_max: number }; weather: Array<{ description: string; icon: string; main: string }> }) => {
        const date = new Date(item.dt * 1000);
        const dayKey = date.toDateString();

        if (!processedDays.has(dayKey) && dailyForecasts.length < 5) {
          processedDays.add(dayKey);
          dailyForecasts.push({
            date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
            temp: {
              min: Math.round(item.main.temp_min),
              max: Math.round(item.main.temp_max)
            },
            description: item.weather[0].description,
            icon: item.weather[0].icon,
            main: item.weather[0].main
          });
        }
      });

      setForecast(dailyForecasts);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch weather data. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchWeather = async (city: string) => {
    if (!city.trim()) return;

    setLoading(true);
    try {
      const [currentResponse, forecastResponse] = await Promise.all([
        fetch(`${BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=imperial`),
        fetch(`${BASE_URL}/forecast?q=${city}&appid=${API_KEY}&units=imperial`)
      ]);

      if (!currentResponse.ok || !forecastResponse.ok) {
        throw new Error('City not found');
      }

      const currentData = await currentResponse.json();
      const forecastData = await forecastResponse.json();

      setCurrentWeather({
        name: currentData.name,
        country: currentData.sys.country,
        temp: Math.round(currentData.main.temp),
        feelsLike: Math.round(currentData.main.feels_like),
        description: currentData.weather[0].description,
        humidity: currentData.main.humidity,
        windSpeed: Math.round(currentData.wind.speed),
        pressure: Math.round(currentData.main.pressure * 0.02953),
        visibility: Math.round(currentData.visibility / 1609.34),
        icon: currentData.weather[0].icon,
        main: currentData.weather[0].main
      });

      // Process 5-day forecast
      const dailyForecasts: ForecastDay[] = [];
      const processedDays = new Set();

      forecastData.list.forEach((item: { dt: number; main: { temp_min: number; temp_max: number }; weather: Array<{ description: string; icon: string; main: string }> }) => {
        const date = new Date(item.dt * 1000);
        const dayKey = date.toDateString();

        if (!processedDays.has(dayKey) && dailyForecasts.length < 5) {
          processedDays.add(dayKey);
          dailyForecasts.push({
            date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
            temp: {
              min: Math.round(item.main.temp_min),
              max: Math.round(item.main.temp_max)
            },
            description: item.weather[0].description,
            icon: item.weather[0].icon,
            main: item.weather[0].main
          });
        }
      });

      setForecast(dailyForecasts);
      saveRecentSearch(city);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'City not found. Please check the spelling and try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchWeather(searchQuery);
  };

  const getWeatherIcon = (main: string, iconCode: string) => {
    const isDay = iconCode.includes('d');
    
    switch (main.toLowerCase()) {
      case 'clear':
        return <Sun className="w-12 h-12 text-yellow-400" />;
      case 'clouds':
        return <Cloud className="w-12 h-12 text-gray-400" />;
      case 'rain':
      case 'drizzle':
        return <CloudRain className="w-12 h-12 text-blue-400" />;
      case 'snow':
        return <CloudSnow className="w-12 h-12 text-blue-200" />;
      default:
        return isDay ? <Sun className="w-12 h-12 text-yellow-400" /> : <Cloud className="w-12 h-12 text-gray-400" />;
    }
  };

  const getSmallWeatherIcon = (main: string, iconCode: string) => {
    const isDay = iconCode.includes('d');
    
    switch (main.toLowerCase()) {
      case 'clear':
        return <Sun className="w-6 h-6 text-yellow-400" />;
      case 'clouds':
        return <Cloud className="w-6 h-6 text-gray-400" />;
      case 'rain':
      case 'drizzle':
        return <CloudRain className="w-6 h-6 text-blue-400" />;
      case 'snow':
        return <CloudSnow className="w-6 h-6 text-blue-200" />;
      default:
        return isDay ? <Sun className="w-6 h-6 text-yellow-400" /> : <Cloud className="w-6 h-6 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CloudSun className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">WeatherApp</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Current Weather</a>
            <a href="#" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Forecast</a>
            <a href="#" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Maps</a>
            <a href="#" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Settings</a>
          </nav>
          <div className="flex items-center gap-4">
            <form onSubmit={handleSearch} className="relative">
              <input 
                type="text" 
                placeholder="Search city..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </form>
            <button 
              onClick={getCurrentLocationWeather}
              className="text-gray-700 hover:text-blue-600 transition-colors"
              title="Use current location"
            >
              <MapPin className="w-5 h-5" />
            </button>
            <button 
              onClick={() => currentWeather && fetchWeather(currentWeather.name)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              disabled={loading}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Refresh'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Weather Forecast App</h1>
          <p className="text-xl text-gray-600 mb-8">Get accurate weather information for any location worldwide</p>
          
          {/* Search Form */}
          <form onSubmit={handleSearch} className="max-w-md mx-auto flex gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Enter city name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !searchQuery.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
              Get Weather
            </button>
          </form>
          
          <button
            onClick={getCurrentLocationWeather}
            className="mt-4 bg-transparent border-2 border-blue-600 hover:border-blue-700 text-blue-600 hover:text-blue-700 font-semibold py-3 px-6 rounded-lg flex items-center gap-2 transition-colors mx-auto"
          >
            <MapPin className="w-5 h-5" />
            Use Current Location
          </button>
        </div>

        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Searches</h3>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((city, index) => (
                <button
                  key={index}
                  onClick={() => fetchWeather(city)}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:border-blue-500 hover:text-blue-600 transition-colors text-sm"
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Current Weather Card */}
        {currentWeather && (
          <div className="mb-8">
            <div className="bg-white rounded-xl overflow-hidden shadow-lg max-w-2xl mx-auto border border-gray-200">
              <div className="bg-gradient-to-br from-sky-400 to-blue-600 p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-semibold">{currentWeather.name}</h3>
                    <p className="text-sky-100 text-sm">{currentWeather.country}</p>
                  </div>
                  {getWeatherIcon(currentWeather.main, currentWeather.icon)}
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-5xl font-bold">{currentWeather.temp}°F</span>
                  <div className="text-sm">
                    <p>Feels like {currentWeather.feelsLike}°F</p>
                    <p className="text-sky-100 capitalize">{currentWeather.description}</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Visibility: {currentWeather.visibility} mi</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Humidity: {currentWeather.humidity}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wind className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Wind: {currentWeather.windSpeed} mph</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Pressure: {currentWeather.pressure} in</span>
                  </div>
                </div>
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Last updated: {new Date().toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5-Day Forecast */}
        {forecast.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">5-Day Forecast</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {forecast.map((day, index) => (
                <div key={index} className="bg-white rounded-lg p-4 shadow-md border border-gray-200 text-center">
                  <p className="text-sm font-semibold text-gray-800 mb-2">{day.date}</p>
                  <div className="flex justify-center mb-2">
                    {getSmallWeatherIcon(day.main, day.icon)}
                  </div>
                  <p className="text-xs text-gray-600 mb-2 capitalize">{day.description}</p>
                  <div className="text-sm">
                    <span className="font-semibold text-gray-900">{day.temp.max}°</span>
                    <span className="text-gray-500 ml-1">{day.temp.min}°</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && !currentWeather && (
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Fetching weather data...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !currentWeather && (
          <div className="text-center py-12">
            <CloudSun className="w-24 h-24 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Welcome to WeatherApp</h3>
            <p className="text-gray-600">Search for a city to get started or use your current location</p>
          </div>
        )}
      </main>
    </div>
  );
}
