const API_KEY = 'SUA_CHAVE_AQUI'; 
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';


const searchForm = document.querySelector('#search-form');
const cityInput = document.querySelector('#city-input');




/**
 * Busca os dados do clima de uma cidade específica
 * @param {string} city - Nome da cidade
 */
const getWeatherData = async (city) => {
    try {
        
        
        const response = await fetch(`${BASE_URL}?q=${city}&units=metric&lang=pt_br&appid=${API_KEY}`);
        
        if (!response.ok) {
            throw new Error('Não foi possível encontrar a cidade.');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Erro na requisição:", error);
        return null;
    }
};




searchForm.addEventListener('submit', async (e) => {
    e.preventDefault(); 

    const city = cityInput.value.trim();

    if (!city) return;

    console.log(`Buscando dados para: ${city}...`);
    

    const weatherData = await getWeatherData(city);


    if (weatherData) {
        console.log("Dados recebidos com sucesso:", weatherData);

    } else {
        console.log("Falha ao buscar os dados. A cidade não existe?");
    }
});