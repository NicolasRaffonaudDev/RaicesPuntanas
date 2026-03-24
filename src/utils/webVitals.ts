import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from "web-vitals";
import { API_URL } from "../services/apiClient";

const endpoint = import.meta.env.VITE_WEB_VITALS_ENDPOINT || `${API_URL}/telemetry/web-vitals`;

const sendMetric = (metric: Metric) => {
  const payload = JSON.stringify({
    name: metric.name,
    id: metric.id,
    value: Number(metric.value.toFixed(3)),
    rating: metric.rating,
    delta: Number(metric.delta.toFixed(3)),
    navigationType: metric.navigationType,
    path: window.location.pathname,
  });

  if (import.meta.env.DEV) {
    console.debug("[web-vitals]", payload);
  }

  if (navigator.sendBeacon) {
    const blob = new Blob([payload], { type: "application/json" });
    navigator.sendBeacon(endpoint, blob);
    return;
  }

  void fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: true,
  }).catch(() => undefined);
};

export const initWebVitals = () => {
  onCLS(sendMetric);
  onINP(sendMetric);
  onLCP(sendMetric);
  onFCP(sendMetric);
  onTTFB(sendMetric);
};
