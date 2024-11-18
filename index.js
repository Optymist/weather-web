const apiKey = "37620f6259f74cc5b6a135212242206"
let city = document.querySelector(".city");
let date = document.querySelector(".date");
let time = document.querySelector(".time");
let region = document.querySelector(".region");
let temp = document.querySelector(".temp");
let textDescript = document.querySelector(".text");
let icon = document.querySelector(".icon");
let sunrise = document.querySelector(".sunrise");
let sunset = document.querySelector(".sunset");
let wind_speed = document.querySelector(".wind_speed");
let wind_direction = document.querySelector(".wind_direction");
let feelsLike = document.querySelector(".feelsLike");
let precip = document.querySelector(".precip");
let uv = document.querySelector(".uv");
let cloud = document.querySelector(".cloud");
let moonphase = document.querySelector(".moonphase");
let moonrise = document.querySelector(".moonrise");
let moonset = document.querySelector(".moonset");
let moon_icon = document.querySelector(".moon_icon");
let dashboard_image = document.getElementById("dashboard");

function showLoading() {
  document.getElementById("loading-screen").style.display = "flex";
  document.getElementById("main-content").style.display = "none";
}

function hideLoading() {
  document.getElementById("loading-screen").style.display = "none";
  document.getElementById("main-content").style.display = "block";
}

// Fetch weather data based on loaction
async function fetchWeatherByLocation(location, days = 5) {
  const baseURL = "http://api.weatherapi.com/v1/forecast.json";

  try {
    showLoading();
    const response = await fetch(
      `${baseURL}?key=${apiKey}&q=${location}&days=${days}&aqi=no`
    );
    if (!response.ok) throw new Error('Failed to fetch data.');

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data: ", error)
  } finally {
    hideLoading();
  }
}

// display forecast data
function displayForecast(weatherData) {
  let forecastData = weatherData.forecast.forecastday;
  console.log(forecastData);
  const forecastContainer = document.getElementById("forecast-container");
  forecastContainer.innerHTML = "";

  forecastData.forEach(day => {
    const forecastCard = document.createElement("div");
    forecastCard.classList.add("forecast-card");

    const date = new Date(day.date);
    const options = { weekday: "short", day: "numeric", month: "short"};
    const formattedDate = date.toLocaleDateString("en-US", options);

    forecastCard.innerHTML = `
      <h3>${formattedDate}</h3>
      <img src="${day.day.condition.icon}" alt="${day.day.condition.text}" />
      <p>${day.day.condition.text}</p>
      <p><strong>${day.day.maxtemp_c}°C</strong> / ${day.day.mintemp_c}°C</p>
      <p>Rain: ${day.day.daily_chance_of_rain}%</p>`;

    forecastContainer.appendChild(forecastCard);
  });
}

// Handle location search
async function searchWeather() {
  const locationInput = document.getElementById("search-location");
  const location = locationInput.value.trim();

  if (!location) {
    alert('Please enter a location.');
    return;
  }

  const weatherData = await fetchWeatherByLocation(location, 3);

  if (weatherData) {
    displayWeather(weatherData);
    setDateAndTime();
    displayForecast(weatherData)
  } else {
    alert("Unable to fetch weather data for the entered location. Please try again.");
  }
}

// Get user's current location and fetch weather
function getUserLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async function(position) {
        // Get longitude and latitude of user position
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        let weatherData = await fetchWeatherByLocation(`${latitude},${longitude}`);
        if (weatherData) {
          displayWeather(weatherData);
          setDateAndTime();
          displayForecast(weatherData)
        }
      },
      function(error) {
        console.error("Geolocation error: ", error);
        alert("Unable to retrieve your location. Please try again.")
        promptUserForLocation(); // if your location cannot be found
      }
    );
  } else {
    alert("Geolocation is not supported by your browser.")
    promptUserForLocation();
  }
}

// Function to prompt the user to manually enter a location
function promptUserForLocation() {
  const locationContainer = document.createElement('div');
  locationContainer.classList.add('location-container');

  const inputField = document.createElement('input');
  inputField.setAttribute('type', 'text');
  inputField.setAttribute('id', 'manual-location');
  inputField.setAttribute('placeholder', 'Enter a city or location');

  const searchButton = document.createElement('button');
  searchButton.innerText = 'Search';
  searchButton.onclick = async function() {
    const location = document.getElementById('manual-location').value;
    if (location) {
      let weatherData = await fetchWeatherByLocation(location);
      if (weatherData) {
        displayWeather(weatherData);
        setDateAndTime();
      }
    } else {
      alert('Please enter a valid location.');
    }
  };

  locationContainer.appendChild(inputField);
  locationContainer.appendChild(searchButton);

  document.body.appendChild(locationContainer);
}

// Display weather information
function displayWeather(data) {
  let astroData = getAstro(data);
  let current = data.current;

  region.innerText = `${data.location.region}, ${data.location.country}`;
  city.innerText = data.location.name;
  // dashboard_image.style.backgroundImage = `url(${getDashboardBackground(data)})`;

  temp.innerText = `${current.temp_c} °C`;
  feelsLike.innerText = `Feels like: ${current.feelslike_c} °C`;
  uv.innerText = `UV Index: ${current.uv}`;
  cloud.innerText = `Cloud cover: ${current.cloud} %`;

  textDescript.innerText = current.condition.text;
  icon.src = current.condition.icon;
  
  sunrise.innerText = astroData[0].sunrise;
  sunset.innerText = astroData[0].sunset;

  moonphase.innerText = astroData[0].moon_phase;
  moon_icon.src = getMoonImage(astroData[0].moon_phase);

  moonrise.innerText = `Rise: ${astroData[0].moonrise}`;
  moonset.innerText = `Set: ${astroData[0].moonset}`;

  wind_speed.innerText = `Speed: ${current.wind_kph}`;
  wind_direction.innerText = `Direction: ${current.wind_degree} ° ${current.wind_dir}`;

  precip.innerText = `Precipitation: ${current.precip_mm} mm`;
}

// Function to get astronomical data
function getAstro(data) {
  try {
    let forecast = data.forecast.forecastday;
    let astroData = [];

    for (let i = 0; i < forecast.length; i++) {
      astroData.push(forecast[i].astro);
    }
    return astroData;
  } catch (error) {
    console.log("An error occurred while fetching astro data.");
  }
}


// Get the background image dependant on whether night/day and weather conditions
function getDashboardBackground(data) {
  try {
    let is_day = data.current.is_day;
    console.log(is_day)

    let image_path = "/images/conditions/"

    if (is_day == 1) {
      image_path += "day/"
    } else {
      image_path += "night/"
    }

    // console.log(image_path)

    image_path += getConditionText(data);

    // console.log(image_path)
    return image_path;

  } catch (error) {
    console.log("Error while getting image path.")
  }
}

// Map weather conditions to image URL
function getConditionText(data) {
  let condition = data.current.condition.text;
  // console.log(condition)

  let url_condition = "";

  for (let i=0; i<condition.length; i++) {
    if (condition[i] == " ") {
      url_condition += "_";
    }
    else {
      url_condition += condition[i];
    }
  }
  url_condition += ".jpg";
  // console.log(url_condition)
  return url_condition;
}

// Get the moon image based on the phase
function getMoonImage(moon_phase) {
  words = moon_phase.split(" ");
  img = words[0] + "_" + words[1] + ".png";
  img_path = "/images/moons/" + img;
  console.log(img_path);
  return img_path;
}

// Get the date and time
function getDate() {
  var currentdate = new Date();
  let ldate = `${currentdate.getDate()}/${currentdate.getMonth() + 1}/${currentdate.getFullYear()}`;
  let ltime = `${currentdate.getHours()}:${currentdate.getMinutes()}:${currentdate.getSeconds()}`;
  return { ldate, ltime };
}

// Continuously update date and time
function setDateAndTime() {
  setInterval(() => {
    let { ldate, ltime } = getDate();
    date.innerText = ldate;
    time.innerText = ltime;
    // console.log(ldate, ltime);
  }, 1000);
}

// Initialize on page load
window.onload = function() {
  getUserLocation();
}










