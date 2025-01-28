class WeatherDash {
    constructor() {
        this.apiKey = 'demo-key';
        this.baseUrl = 'https://api.openweathermap.org/data/2.5/weather';
        this.recentSearches = this.loadRecentSearches();
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.getCurrentLocation();
    }
    
    setupEventListeners() {
        const searchBtn = document.getElementById('searchBtn');
        const cityInput = document.getElementById('cityInput');
        
        searchBtn.addEventListener('click', () => this.handleSearch());
        cityInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSearch();
            }
        });
    }
    
    handleSearch() {
        const cityInput = document.getElementById('cityInput');
        const city = cityInput.value.trim();
        
        if (city) {
            this.showLoading();
            this.fetchWeatherByCity(city);
            cityInput.value = '';
        }
    }
    
    getCurrentLocation() {
        this.showLoading();
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => this.fetchWeatherByCoords(position.coords.latitude, position.coords.longitude),
                () => this.fetchWeatherByCity('London')
            );
        } else {
            this.fetchWeatherByCity('London');
        }
    }
    
    async fetchWeatherByCoords(lat, lon) {
        try {
            const response = await fetch(`${this.baseUrl}?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.cod && data.cod !== 200) {
                throw new Error(data.message || 'Weather data not found');
            }
            
            this.displayWeather(data);
        } catch (error) {
            console.error('Weather fetch error:', error);
            this.showError(error.message);
        }
    }
    
    async fetchWeatherByCity(city) {
        try {
            const response = await fetch(`${this.baseUrl}?q=${city}&appid=${this.apiKey}&units=metric`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.cod && data.cod !== 200) {
                throw new Error(data.message || 'City not found');
            }
            
            this.displayWeather(data);
        } catch (error) {
            console.error('Weather fetch error:', error);
            this.showError(error.message);
        }
    }
    
    displayWeather(data) {
        const temp = Math.round(data.main.temp);
        const description = data.weather[0].description;
        const location = `${data.name}, ${data.sys.country}`;
        const weatherCode = data.weather[0].main;
        const icon = this.getWeatherIcon(weatherCode, data.weather[0].id);
        
        const details = {
            feelsLike: Math.round(data.main.feels_like),
            humidity: data.main.humidity,
            windSpeed: Math.round(data.wind.speed * 3.6),
            pressure: data.main.pressure
        };
        
        this.saveToRecentSearches(data.name);
        this.hideLoading();
        this.updateDisplay(temp, description, location, icon);
        this.updateDetails(details);
    }
    
    updateDisplay(temp, description, location, icon = '🌤️') {
        const tempElement = document.querySelector('.temperature');
        const descElement = document.querySelector('.description');
        const locationElement = document.querySelector('.location');
        const iconElement = document.getElementById('weatherIcon');
        
        if (tempElement) tempElement.textContent = `${temp}°C`;
        if (descElement) descElement.textContent = description;
        if (locationElement) locationElement.textContent = location;
        if (iconElement) iconElement.textContent = icon;
    }
    
    updateDetails(details) {
        const feelsLikeEl = document.getElementById('feelsLike');
        const humidityEl = document.getElementById('humidity');
        const windSpeedEl = document.getElementById('windSpeed');
        const pressureEl = document.getElementById('pressure');
        
        if (feelsLikeEl) feelsLikeEl.textContent = `${details.feelsLike}°C`;
        if (humidityEl) humidityEl.textContent = `${details.humidity}%`;
        if (windSpeedEl) windSpeedEl.textContent = `${details.windSpeed} km/h`;
        if (pressureEl) pressureEl.textContent = `${details.pressure} hPa`;
    }
    
    showError(message = 'Unable to load weather data') {
        this.hideLoading();
        
        const errorMsg = message.includes('not found') || message.includes('City not found') 
            ? 'City not found. Please check spelling.' 
            : message.includes('HTTP error') 
            ? 'Network error. Check connection.' 
            : 'Unable to load weather data';
            
        this.updateDisplay('--', errorMsg, 'Please try again');
    }
    
    showLoading() {
        const spinner = document.getElementById('loadingSpinner');
        const weatherInfo = document.querySelector('.weather-info');
        
        if (spinner) spinner.classList.add('show');
        if (weatherInfo) weatherInfo.classList.add('loading');
    }
    
    hideLoading() {
        const spinner = document.getElementById('loadingSpinner');
        const weatherInfo = document.querySelector('.weather-info');
        
        if (spinner) spinner.classList.remove('show');
        if (weatherInfo) weatherInfo.classList.remove('loading');
    }
    
    loadRecentSearches() {
        try {
            const searches = localStorage.getItem('weatherDashRecentSearches');
            return searches ? JSON.parse(searches) : [];
        } catch (error) {
            console.error('Error loading recent searches:', error);
            return [];
        }
    }
    
    saveToRecentSearches(cityName) {
        if (!cityName) return;
        
        const searches = this.recentSearches.filter(city => city.toLowerCase() !== cityName.toLowerCase());
        searches.unshift(cityName);
        
        this.recentSearches = searches.slice(0, 5);
        
        try {
            localStorage.setItem('weatherDashRecentSearches', JSON.stringify(this.recentSearches));
        } catch (error) {
            console.error('Error saving recent searches:', error);
        }
    }
    
    getWeatherIcon(weatherCode, id) {
        const iconMap = {
            'Clear': '☀️',
            'Clouds': id === 801 ? '🌤️' : id === 802 ? '⛅' : '☁️',
            'Rain': id >= 500 && id <= 504 ? '🌦️' : '🌧️',
            'Drizzle': '🌦️',
            'Thunderstorm': '⛈️',
            'Snow': '🌨️',
            'Mist': '🌫️',
            'Fog': '🌫️',
            'Haze': '🌫️',
            'Dust': '🌫️',
            'Sand': '🌫️',
            'Smoke': '🌫️'
        };
        
        return iconMap[weatherCode] || '🌤️';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new WeatherDash();
});