import { CloudFog, CloudRain, CloudSnow, CloudSun, Sun, Thermometer } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { ShowroomSettings } from "../types/settings";

type Weather = {
  temperature: number | null;
  code: number | null;
  condition: string;
};

const getCondition = (code: number | null) => {
  if (code === null) return "Weather unavailable";
  if (code === 0) return "Clear";
  if ([1, 2, 3].includes(code)) return "Partly cloudy";
  if ([45, 48].includes(code)) return "Fog";
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "Rain";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "Snow";
  if ([95, 96, 99].includes(code)) return "Storm";
  return "Mixed";
};

function WeatherIcon({ code }: { code: number | null }) {
  if (code === 0) return <Sun aria-hidden="true" />;
  if (code !== null && [45, 48].includes(code)) return <CloudFog aria-hidden="true" />;
  if (code !== null && [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(code)) {
    return <CloudRain aria-hidden="true" />;
  }
  if (code !== null && [71, 73, 75, 77, 85, 86].includes(code)) return <CloudSnow aria-hidden="true" />;
  return <CloudSun aria-hidden="true" />;
}

export function WeatherTimeWidget({ settings }: { settings: ShowroomSettings }) {
  const [now, setNow] = useState(() => new Date());
  const [weather, setWeather] = useState<Weather>({
    temperature: null,
    code: null,
    condition: "Weather unavailable",
  });

  const coordinates = useMemo(() => {
    const latitude = Number(settings.latitude);
    const longitude = Number(settings.longitude);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return null;
    }

    return { latitude, longitude };
  }, [settings.latitude, settings.longitude]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!settings.weatherEnabled || !coordinates) {
      setWeather({ temperature: null, code: null, condition: "Weather unavailable" });
      return;
    }

    const controller = new AbortController();

    const loadWeather = async () => {
      try {
        const params = new URLSearchParams({
          latitude: String(coordinates.latitude),
          longitude: String(coordinates.longitude),
          current: "temperature_2m,weather_code",
          temperature_unit: "fahrenheit",
          timezone: "auto",
        });
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Weather unavailable");
        }

        const data = (await response.json()) as {
          current?: { temperature_2m?: number; weather_code?: number };
        };
        const code = typeof data.current?.weather_code === "number" ? data.current.weather_code : null;
        const temperature = typeof data.current?.temperature_2m === "number" ? data.current.temperature_2m : null;

        setWeather({ temperature, code, condition: getCondition(code) });
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setWeather({ temperature: null, code: null, condition: "Weather unavailable" });
        }
      }
    };

    void loadWeather();
    const refreshTimer = window.setInterval(loadWeather, 15 * 60 * 1000);

    return () => {
      controller.abort();
      window.clearInterval(refreshTimer);
    };
  }, [coordinates, settings.weatherEnabled]);

  const time = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
    hour12: settings.timeFormat === "12h",
  }).format(now);

  const date = new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(now);

  return (
    <aside className="weather-widget" aria-label="Showroom date, time, and weather">
      <strong>{time}</strong>
      <span>{date}</span>
      {settings.weatherEnabled ? (
        <div>
          {weather.temperature === null ? <Thermometer aria-hidden="true" /> : <WeatherIcon code={weather.code} />}
          <span>{weather.temperature === null ? "--" : `${Math.round(weather.temperature)}°F`}</span>
          <em>{weather.condition}</em>
        </div>
      ) : null}
      {settings.weatherEnabled && settings.locationName ? <small>{settings.locationName}</small> : null}
    </aside>
  );
}
