const apiKey = '9e633d014226c2e8aaadae6179e7d782';

const submitBtn = document.getElementById('submit');
const locationBtn = document.getElementById('locationBtn');
const cityInput = document.getElementById('city');
const weatherDiv = document.getElementById('weather');

submitBtn.addEventListener('click', getWeatherByCity);
locationBtn.addEventListener('click', getWeatherByLocation);

cityInput.addEventListener('keydown', function (event) {
  if (event.key === 'Enter') {
    getWeatherByCity();
  }
});

window.addEventListener('load', function () {
  const savedCity = localStorage.getItem('lastCity');

  if (savedCity) {
    cityInput.value = savedCity;
    getWeatherByCity();
  }
});

async function getWeatherByCity() {
  const city = cityInput.value.trim();

  if (!city) {
    weatherDiv.innerHTML = `<p class="error">Please enter a city name.</p>`;
    return;
  }

  weatherDiv.innerHTML = `<p class="loading">Loading weather</p>`;

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch weather.');
    }

    localStorage.setItem('lastCity', city);
    displayWeather(data);
    setWeatherBackground(data.weather[0].main);
  } catch (error) {
    weatherDiv.innerHTML = `<p class="error">${error.message}</p>`;
    console.log(error);
  }
}

function getWeatherByLocation() {
  if (!navigator.geolocation) {
    weatherDiv.innerHTML = `<p class="error">Geolocation is not supported by this browser.</p>`;
    return;
  }

  weatherDiv.innerHTML = `<p class="loading">Getting your location</p>`;

  navigator.geolocation.getCurrentPosition(
    async function (position) {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch weather for your location.');
        }

        cityInput.value = data.name;
        localStorage.setItem('lastCity', data.name);
        displayWeather(data);
        setWeatherBackground(data.weather[0].main);
      } catch (error) {
        weatherDiv.innerHTML = `<p class="error">${error.message}</p>`;
        console.log(error);
      }
    },
    function (error) {
      if (error.code === 1) {
        weatherDiv.innerHTML = `<p class="error">Location permission denied.</p>`;
      } else if (error.code === 2) {
        weatherDiv.innerHTML = `<p class="error">Location unavailable.</p>`;
      } else if (error.code === 3) {
        weatherDiv.innerHTML = `<p class="error">Location request timed out.</p>`;
      } else {
        weatherDiv.innerHTML = `<p class="error">Unable to get your location.</p>`;
      }
    }
  );
}

function displayWeather(data) {
  const iconCode = data.weather[0].icon;
  const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

  const sunrise = formatTime(data.sys.sunrise);
  const sunset = formatTime(data.sys.sunset);

  weatherDiv.innerHTML = `
    <div class="weather-card">
      <div class="city-name">${data.name}, ${data.sys.country}</div>
      <img src="${iconUrl}" alt="Weather icon">
      <div class="temp">${Math.round(data.main.temp)}°C</div>
      <div class="description">${data.weather[0].description}</div>

      <div class="details">
        <div class="detail-box">
          <h3>Humidity</h3>
          <p>${data.main.humidity}%</p>
        </div>

        <div class="detail-box">
          <h3>Wind Speed</h3>
          <p>${data.wind.speed} m/s</p>
        </div>

        <div class="detail-box">
          <h3>Sunrise</h3>
          <p>${sunrise}</p>
        </div>

        <div class="detail-box">
          <h3>Sunset</h3>
          <p>${sunset}</p>
        </div>

        <div class="detail-box">
          <h3>Feels Like</h3>
          <p>${Math.round(data.main.feels_like)}°C</p>
        </div>

        <div class="detail-box">
          <h3>Pressure</h3>
          <p>${data.main.pressure} hPa</p>
        </div>
      </div>
    </div>
  `;
}

function formatTime(timestamp) {
  const date = new Date(timestamp * 1000);
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
}

function setWeatherBackground(weatherMain) {
  const body = document.body;
  const condition = weatherMain.toLowerCase();

  if (condition.includes('clear')) {
    body.style.background = 'linear-gradient(135deg, #f6d365, #fda085)';
  } else if (condition.includes('cloud')) {
    body.style.background = 'linear-gradient(135deg, #bdc3c7, #2c3e50)';
  } else if (condition.includes('rain') || condition.includes('drizzle')) {
    body.style.background = 'linear-gradient(135deg, #4b79a1, #283e51)';
  } else if (condition.includes('thunderstorm')) {
    body.style.background = 'linear-gradient(135deg, #232526, #414345)';
  } else if (condition.includes('snow')) {
    body.style.background = 'linear-gradient(135deg, #e6dada, #274046)';
  } else if (condition.includes('mist') || condition.includes('fog') || condition.includes('haze')) {
    body.style.background = 'linear-gradient(135deg, #757f9a, #d7dde8)';
  } else {
    body.style.background = 'linear-gradient(135deg, #4facfe, #00f2fe)';
  }
}