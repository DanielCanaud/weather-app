const API_KEY = "fdf120de8bafdec6bd62417566be7f72";
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";
const GEO_URL = "https://api.openweathermap.org/geo/1.0/direct";

const searchForm = document.querySelector('#search-form');
const cityInput = document.querySelector('#city-input');
const searchButton = document.querySelector('#search-form button');
const weatherDataContainer = document.querySelector('#weather-data');
const errorMessage = document.querySelector('#error-message');
const suggestionsList = document.querySelector('#suggestions');

let debounceTimer;

/**
 * Busca sugestões de cidades conforme o usuário digita
 * @param {string} query - O texto digitado
 */
const getCitySuggestions = async (query) => {
    if (query.length < 3) {
        suggestionsList.innerHTML = "";
        return;
    }

    try {
        const response = await fetch(`${GEO_URL}?q=${query}&limit=5&appid=${API_KEY}`);
        const data = await response.json();
        
        suggestionsList.innerHTML = "";
        
        data.forEach(city => {
            const option = document.createElement('option');
            const state = city.state ? `, ${city.state}` : "";
            option.value = `${city.name}, ${city.country}`;
            option.textContent = `${city.name}${state} (${city.country})`;
            suggestionsList.appendChild(option);
        });
    } catch (error) {
        console.error("Erro ao buscar sugestões:", error);
    }
};

/**
 * Busca os dados do clima de uma cidade específica
 * @param {string} city 
 */
const getWeatherData = async (city) => {
    try {
        const response = await fetch(`${BASE_URL}?q=${city}&units=metric&lang=pt_br&appid=${API_KEY}`);
        
        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Erro na requisição:", error);
        return null;
    }
};

const formatDate = () => {
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    const today = new Date();
    const formattedDate = today.toLocaleDateString('pt-BR', options);
    return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
};

const showWeatherData = (data) => {
    errorMessage.classList.add('hidden');
    
    const { name, sys, main, weather, wind } = data;
    const currentDate = formatDate();
    const countryFlagUrl = `https://flagsapi.com/${sys.country}/flat/64.png`;
    
    const weatherImages = {
        Clear: "https://images.unsplash.com/photo-1504386106331-3e4e71712b38?q=80&w=1600",
        Clouds: "https://images.unsplash.com/photo-1534088568595-a066f410bcda?q=80&w=1600",
        Rain: "https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?q=80&w=1600",
        Drizzle: "https://images.unsplash.com/photo-1556485689-33e55ab56127?q=80&w=1600",
        Thunderstorm: "https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?q=80&w=1600",
        Snow: "https://images.unsplash.com/photo-1478265409131-1f65c88f965c?q=80&w=1600",
        Mist: "https://images.unsplash.com/photo-1487621167305-5d248087c724?q=80&w=1600",
        Haze: "https://images.unsplash.com/photo-1487621167305-5d248087c724?q=80&w=1600",
        Smoke: "https://images.unsplash.com/photo-1487621167305-5d248087c724?q=80&w=1600"
    };

    const condition = weather[0].main;
    const bgImage = weatherImages[condition] || "https://images.unsplash.com/photo-1504386106331-3e4e71712b38?q=80&w=1600";
    
    document.body.style.backgroundImage = `url('${bgImage}')`;
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";

    weatherDataContainer.innerHTML = `
        <div class="city-info">
            <h2>${name}</h2>
            <img src="${countryFlagUrl}" alt="${sys.country}" class="flag">
        </div>
        <p class="date-text">${currentDate}</p>
        
        <div class="weather-main">
            <img src="https://openweathermap.org/img/wn/${weather[0].icon}@4x.png" alt="${weather[0].description}">
            <span class="temperature">${parseInt(main.temp)}&deg;C</span>
        </div>
        <p class="description">${weather[0].description}</p>
        
        <div class="weather-details">
            <div class="detail-box">
                <span class="detail-title">Sensação</span>
                <span class="detail-value">${parseInt(main.feels_like)}&deg;C</span>
            </div>
            <div class="detail-box">
                <span class="detail-title">Umidade</span>
                <span class="detail-value">${main.humidity}%</span>
            </div>
            <div class="detail-box">
                <span class="detail-title">Vento</span>
                <span class="detail-value">${wind.speed} km/h</span>
            </div>
        </div>
    `;

    weatherDataContainer.classList.remove('hidden');
};

const showError = () => {
    weatherDataContainer.classList.add('hidden');
    errorMessage.classList.remove('hidden');
};

cityInput.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    const query = e.target.value.trim();
    
    debounceTimer = setTimeout(() => {
        getCitySuggestions(query);
    }, 500); 
});

searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const city = cityInput.value.trim();
    if (!city) return;

    searchButton.disabled = true;
    const originalBtnText = searchButton.innerText;
    searchButton.innerText = "Buscando...";
    
    weatherDataContainer.classList.add('hidden');
    errorMessage.classList.add('hidden');

    try {
        const weatherData = await getWeatherData(city);

        if (weatherData) {
            showWeatherData(weatherData);
        } else {
            showError();
        }
    } catch (err) {
        showError();
    } finally {
        searchButton.disabled = false;
        searchButton.innerText = originalBtnText;
        cityInput.value = '';
        cityInput.focus();
        suggestionsList.innerHTML = ""; 
    }
});