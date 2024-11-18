const apiKey = localStorage.getItem("apiKey");
const userLocation = localStorage.getItem("location");

async function fetchHourlyForecast() {
    const baseURL = "http://api.weatherapi.com/v1/forecast.json";
    try {
        const response = await fetch(`${baseURL}?key=${apiKey}&q=${userLocation}&days=1&hourly=yes`);
        if (!response.ok) throw new Error("Failed to fetch hourly forecast");
        const data = await response.json();
        displayHourlyForecast(data.forecast.forecastday[0].hour);
    } catch (error) {
        console.error("Error fetching hourly forecast:", error);
    }
}

function displayHourlyForecast(hours) {
    const hourlyContainter = document.getElementById("hourly-container");
    hourlyContainter.innerHTML = "";

    hours.forEach(hour => {
        const hourCard = document.createElement('div');
        hourCard.classList.add("hour-card");

        hourCard.innerHTML = `
      <h3>${new Date(hour.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</h3>
      <img src="${hour.condition.icon}" alt="${hour.condition.text}">
      <p>${hour.temp_c}°C</p>
      <p>${hour.condition.text}</p>`;

        hourlyContainter.appendChild(hourCard);
    });
}

fetchHourlyForecast();