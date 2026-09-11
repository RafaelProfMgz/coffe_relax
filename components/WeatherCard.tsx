"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import SoundButton from "@/components/ui/SoundButton";
import { useConsent } from "@/hooks/useConsent";

interface Weather {
  temp: number;
  desc: string;
  icon: string;
  place: string;
}

const FALLBACK = { lat: -23.55, lon: -46.63, place: "São Paulo" };

/** Códigos WMO da Open-Meteo, agrupados no que interessa para o clima do refúgio. */
function describe(code: number): { desc: string; icon: string } {
  if (code === 0) return { desc: "Céu limpo", icon: "☀️" };
  if (code <= 2) return { desc: "Parcialmente nublado", icon: "⛅" };
  if (code === 3) return { desc: "Encoberto", icon: "☁️" };
  if (code <= 48) return { desc: "Névoa", icon: "🌫️" };
  if (code <= 57) return { desc: "Garoa", icon: "🌦️" };
  if (code <= 67) return { desc: "Chuva", icon: "🌧️" };
  if (code <= 77) return { desc: "Neve", icon: "🌨️" };
  if (code <= 82) return { desc: "Pancadas de chuva", icon: "🌧️" };
  if (code <= 99) return { desc: "Tempestade", icon: "⛈️" };
  return { desc: "Céu de café", icon: "☁️" };
}

export default function WeatherCard() {
  const { ready, consent, allowGeolocation, decide, openPanel } = useConsent();
  const [data, setData] = useState<Weather | null>(null);
  const [loading, setLoading] = useState(true);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [usingPrecise, setUsingPrecise] = useState(false);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const load = useCallback(async (lat: number, lon: number, place: string, precise: boolean) => {
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
      );
      const json: { current_weather?: { temperature: number; weathercode: number } } = await res.json();
      if (!alive.current || !json.current_weather) return;
      const { desc, icon } = describe(json.current_weather.weathercode);
      setData({ temp: Math.round(json.current_weather.temperature), desc, icon, place });
      setUsingPrecise(precise);
    } catch {
      if (!alive.current) return;
      setData({ temp: 22, desc: "Céu de café — leve bruma", icon: "☁️", place: "refúgio" });
    } finally {
      if (alive.current) setLoading(false);
    }
  }, []);

  /**
   * O navegador só é consultado depois do consentimento explícito aqui no site.
   * Ele ainda vai mostrar o próprio pedido de permissão — são duas camadas,
   * e a pessoa pode dizer não em qualquer uma das duas.
   */
  const askBrowser = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setGeoError("Seu navegador não oferece geolocalização.");
      return;
    }
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => load(pos.coords.latitude, pos.coords.longitude, "sua região", true),
      (err) => {
        if (!alive.current) return;
        setGeoError(
          err.code === err.PERMISSION_DENIED
            ? "O navegador negou o acesso. Mostrando São Paulo."
            : "Não consegui obter sua posição. Mostrando São Paulo."
        );
      },
      { timeout: 8000, maximumAge: 10 * 60 * 1000 }
    );
  }, [load]);

  // Sempre carrega a cidade padrão; a posição real só entra se autorizada.
  useEffect(() => {
    if (!ready) return;
    load(FALLBACK.lat, FALLBACK.lon, FALLBACK.place, false);
  }, [ready, load]);

  useEffect(() => {
    if (ready && allowGeolocation) askBrowser();
  }, [ready, allowGeolocation, askBrowser]);

  return (
    <section className="panel" aria-label="Clima atual">
      <header className="panel-head">
        <div>
          <h2 className="panel-title">Lá fora</h2>
          <p className="panel-sub">{loading ? "medindo a temperatura..." : `agora em ${data?.place}`}</p>
        </div>
        {usingPrecise && <span className="badge">📍 precisa</span>}
      </header>

      <div className="weather-row">
        <span className="weather-icon" aria-hidden>
          {loading ? "⏳" : data?.icon}
        </span>
        <div>
          <div className="weather-temp">{loading ? "--" : `${data?.temp}°`}</div>
          <div style={{ fontSize: ".8rem", color: "var(--ink-soft)" }}>{loading ? "" : data?.desc}</div>
        </div>
      </div>

      {!allowGeolocation && (
        <div className="geo-ask">
          <p>
            Quer o clima do <strong>seu lugar</strong>? Precisamos da sua permissão para usar a
            localização do navegador. Ela é usada só para esta consulta e nunca sai do seu dispositivo
            além da chamada ao serviço de previsão.
          </p>
          <div className="geo-ask-actions">
            <SoundButton
              variant="solid"
              sfx="confirm"
              onClick={() => {
                // Sem decisão de cookies ainda? Abre o painel completo em vez de
                // registrar "só localização" e travar as preferências em não.
                if (consent === null) {
                  openPanel();
                  return;
                }
                decide({ geolocation: true });
                askBrowser();
              }}
            >
              📍 permitir localização
            </SoundButton>
            <span className="geo-ask-note">ou continue com São Paulo</span>
          </div>
        </div>
      )}

      {allowGeolocation && (
        <div className="geo-ask-actions" style={{ marginTop: 12 }}>
          <SoundButton variant="pill" onClick={askBrowser} title="Atualizar com a posição atual">
            atualizar posição
          </SoundButton>
          <SoundButton
            variant="pill"
            sfx="reject"
            onClick={() => {
              decide({ geolocation: false });
              setUsingPrecise(false);
              setGeoError(null);
              load(FALLBACK.lat, FALLBACK.lon, FALLBACK.place, false);
            }}
            title="Revogar o acesso à localização"
          >
            revogar
          </SoundButton>
        </div>
      )}

      {geoError && <p className="geo-error">{geoError}</p>}

      <p className="stat-caption" style={{ marginTop: 10 }}>
        combine com a chuva da mesa de ambiente
      </p>
    </section>
  );
}
