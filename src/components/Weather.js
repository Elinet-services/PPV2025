import { useCallback, useEffect, useState } from "react";
import { MDBContainer, MDBTable, MDBTableBody, MDBTableHead } from "mdb-react-ui-kit";
import { useTranslation } from "react-i18next";
import LoadingSpinner from "./LoadingSpinner";

const Weather = () => {
  const { t } = useTranslation();
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWeatherData = useCallback(async () => {
    try {
      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbwkCaReEs1DybO9Y_6_VPsd7GI6K-po8HQBWk9UIUT6N3VoAUtLWuZeZe6ydUiq2aK7/exec"
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setWeatherData(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching weather data:", err);
      setError(t("weather.loadError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchWeatherData();
    const interval = setInterval(fetchWeatherData, 90000);
    return () => clearInterval(interval);
  }, [fetchWeatherData]);

  const formatTime = (timeString) => {
    if (!timeString) return "-";

    const dateParts = timeString.match(/(\d{1,2})\.\s*(\d{1,2})\.\s*(\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})/);

    if (!dateParts) {
      return "-";
    }

    const [, day, month, year, hours, minutes] = dateParts;
    const formattedDate = new Date(
      `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}:00`
    );

    if (Number.isNaN(formattedDate.getTime())) {
      return "-";
    }

    return `${formattedDate.getHours().toString().padStart(2, "0")}:${formattedDate.getMinutes().toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <MDBContainer className="text-center">
        <LoadingSpinner height="120px" label={t("weather.loading")} />
      </MDBContainer>
    );
  }

  if (error) {
    return <p className="text-danger text-center">{error}</p>;
  }

  if (!weatherData) {
    return <p className="text-center">{t("weather.noData")}</p>;
  }

  return (
    <MDBContainer>
      <h4 className="mb-4 weather-title">{t("weather.title")}</h4>
      <MDBTable small>
        <MDBTableHead></MDBTableHead>
        <MDBTableBody>
          <tr>
            <td>{t("weather.updateTime")}</td>
            <td>{formatTime(weatherData.meteoTime)}</td>
          </tr>
          <tr>
            <td>{t("weather.windDirectionSpeed")}</td>
            <td>{`${weatherData.windDirection} / ${weatherData.windCurrent}`}</td>
          </tr>
          <tr>
            <td>{t("weather.windGusts")}</td>
            <td>{weatherData.windMax}</td>
          </tr>
          <tr>
            <td>{t("weather.qnh")}</td>
            <td>{weatherData.barometricPressure}</td>
          </tr>
          <tr>
            <td>{t("weather.regionalQnh")}</td>
            <td>{weatherData.reducedQNH}</td>
          </tr>
          <tr>
            <td>{t("weather.airTemp")}</td>
            <td dangerouslySetInnerHTML={{ __html: weatherData.temperature }}></td>
          </tr>
          <tr>
            <td>{t("weather.dewPoint")}</td>
            <td dangerouslySetInnerHTML={{ __html: weatherData.dewPoint }}></td>
          </tr>
          <tr>
            <td>{t("weather.humidity")}</td>
            <td>{weatherData.humidity}</td>
          </tr>
          <tr>
            <td>{t("weather.rain")}</td>
            <td>{weatherData.rain}</td>
          </tr>
          <tr>
            <td>{t("weather.sunrise")}</td>
            <td>{weatherData.sunrise}</td>
          </tr>
          <tr>
            <td>{t("weather.sunset")}</td>
            <td>{weatherData.sunset}</td>
          </tr>
        </MDBTableBody>
      </MDBTable>
    </MDBContainer>
  );
};

export default Weather;
