import { useEffect, useState } from 'react';
import { MDBTable, MDBTableHead, MDBTableBody, MDBContainer, MDBSpinner } from 'mdb-react-ui-kit';

const Weather = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWeatherData = async () => {
    try {
      const response = await fetch('https://script.google.com/macros/s/AKfycbwkCaReEs1DybO9Y_6_VPsd7GI6K-po8HQBWk9UIUT6N3VoAUtLWuZeZe6ydUiq2aK7/exec');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setWeatherData(data);
    } catch (err) {
      console.error('Error fetching weather data:', err);
      setError('Nepodařilo se načíst data o počasí.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchWeatherData(); // Načte data při načtení komponenty
    const interval = setInterval(fetchWeatherData, 90000); // Automatická obnova každých 90 sekund
    return () => clearInterval(interval); // Vyčištění intervalu při odmontování komponenty
  }, []);

  const formatTime = (timeString) => {
    if (!timeString) return "-";
  
    // Ověření formátu "21. 2. 2025 22:35:00"
    const dateParts = timeString.match(/(\d{1,2})\.\s*(\d{1,2})\.\s*(\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})/);
  
    if (!dateParts) {
      console.warn("Neplatný formát času:", timeString);
      return "-";
    }
  
    const [, day, month, year, hours, minutes] = dateParts;
    const formattedDate = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:00`);
  
    if (isNaN(formattedDate.getTime())) {
      console.error("Nepodařilo se převést datum:", timeString);
      return "-";
    }
  
    return `${formattedDate.getHours().toString().padStart(2, '0')}:${formattedDate.getMinutes().toString().padStart(2, '0')}`;
  };
  
    if (loading) {
    return (
      <MDBContainer className="text-center">
        <MDBSpinner role="status">
          <span className="visually-hidden">Načítám data o počasí...</span>
        </MDBSpinner>
      </MDBContainer>
    );
  }

  if (error) {
    return <p className="text-danger text-center">{error}</p>;
  }

  if (!weatherData) {
    return <p className="text-center">Nejsou dostupná data o počasí.</p>;
  }

  return (
    <MDBContainer>
      <h4 className="mb-4">LKHB Meteo</h4>
      <MDBTable small>
        <MDBTableHead></MDBTableHead>
        <MDBTableBody>
          <tr>
            <td>Čas aktualizace</td>
            <td>{formatTime(weatherData.meteoTime)}</td>
          </tr>
          <tr>
            <td>Směr a síla větru</td>
            <td>{`${weatherData.windDirection} / ${weatherData.windCurrent}`}</td>
          </tr>
          <tr>
            <td>Nárazy větru</td>
            <td>{weatherData.windMax}</td>
          </tr>
          <tr>
            <td>QNH</td>
            <td>{weatherData.barometricPressure}</td>
          </tr>
          <tr>
            <td>Regionální QNH</td>
            <td>{weatherData.reducedQNH}</td>
          </tr>
          <tr>
            <td>Teplota vzduchu</td>
            <td dangerouslySetInnerHTML={{ __html: weatherData.temperature }}></td>
          </tr>
          <tr>
            <td>Rosný bod</td>
            <td dangerouslySetInnerHTML={{ __html: weatherData.dewPoint }}></td>
          </tr>
          <tr>
            <td>Vlhkost</td>
            <td>{weatherData.humidity}</td>
          </tr>
          <tr>
            <td>Srážky</td>
            <td>{weatherData.rain}</td>
          </tr>
          <tr>
            <td>Východ slunce</td>
            <td>{weatherData.sunrise}</td>
          </tr>
          <tr>
            <td>Západ slunce</td>
            <td>{weatherData.sunset}</td>
          </tr>
        </MDBTableBody>
      </MDBTable>
    </MDBContainer>
  );
};

export default Weather;