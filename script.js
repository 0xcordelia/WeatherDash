class WeatherDash {
    constructor() {
        this.init();
    }
    
    init() {
        this.updateDisplay('25', 'sunny', 'New York');
    }
    
    updateDisplay(temp, description, location) {
        const tempElement = document.querySelector('.temperature');
        const descElement = document.querySelector('.description');
        const locationElement = document.querySelector('.location');
        
        if (tempElement) tempElement.textContent = `${temp}°C`;
        if (descElement) descElement.textContent = description;
        if (locationElement) locationElement.textContent = location;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new WeatherDash();
});