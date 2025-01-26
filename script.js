class WeatherDash {
    constructor() {
        this.apiKey = 'demo-key';
        this.baseUrl = 'https://api.openweathermap.org/data/2.5/weather';
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
            const data = await response.json();
            this.displayWeather(data);
        } catch (error) {
            console.error('Weather fetch error:', error);
            this.showError();
        }
    }
    
    async fetchWeatherByCity(city) {
        try {
            const response = await fetch(`${this.baseUrl}?q=${city}&appid=${this.apiKey}&units=metric`);
            const data = await response.json();
            this.displayWeather(data);
        } catch (error) {
            console.error('Weather fetch error:', error);
            this.showError();
        }
    }
    
    displayWeather(data) {
        const temp = Math.round(data.main.temp);
        const description = data.weather[0].description;
        const location = `${data.name}, ${data.sys.country}`;
        
        const details = {
            feelsLike: Math.round(data.main.feels_like),
            humidity: data.main.humidity,
            windSpeed: Math.round(data.wind.speed * 3.6),
            pressure: data.main.pressure
        };
        
        this.hideLoading();
        this.updateDisplay(temp, description, location);
        this.updateDetails(details);
    }
    
    updateDisplay(temp, description, location) {
        const tempElement = document.querySelector('.temperature');
        const descElement = document.querySelector('.description');
        const locationElement = document.querySelector('.location');
        
        if (tempElement) tempElement.textContent = `${temp}°C`;
        if (descElement) descElement.textContent = description;
        if (locationElement) locationElement.textContent = location;
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
    
    showError() {
        this.hideLoading();
        this.updateDisplay('--', 'Unable to load weather', 'Please try again');
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
}

document.addEventListener('DOMContentLoaded', () => {
    new WeatherDash();
});