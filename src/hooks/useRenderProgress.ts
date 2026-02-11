import { useState, useEffect, useRef } from "react";

export interface RenderProgress {
  status: "idle" | "connecting" | "rendering" | "completed" | "error";
  frame: number;
  total: number;
  percent: number;
  eta: string;
  outputUrl: string | null;
  error: string | null;
}

const initialState: RenderProgress = {
  status: "idle",
  frame: 0,
  total: 0,
  percent: 0,
  eta: "",
  outputUrl: null,
  error: null,
};

export function useRenderProgress(jobId: string | null): RenderProgress {
  const [progress, setProgress] = useState<RenderProgress>(initialState);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // jobId null ise idle state
    if (!jobId) {
      setProgress(initialState);
      return;
    }

    // Connecting state
    setProgress((prev) => ({ ...prev, status: "connecting", error: null }));

    // WebSocket bağlantısı
    const ws = new WebSocket(`ws://${window.location.host}/ws?jobId=${jobId}`);
    wsRef.current = ws;

    ws.onopen = () => {
      // subscribed mesajı bekle
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case "subscribed":
            setProgress((prev) => ({
              ...prev,
              status: "rendering",
            }));
            break;

          case "progress":
            setProgress((prev) => ({
              ...prev,
              status: "rendering",
              frame: data.frame,
              total: data.total,
              percent: data.percent,
              eta: data.eta,
            }));
            break;

          case "complete":
            setProgress((prev) => ({
              ...prev,
              status: "completed",
              percent: 100,
              frame: prev.total,
              outputUrl: (data.result.outputPath || "").replace(/^\.\//, "/"),
            }));
            break;

          case "error":
            setProgress((prev) => ({
              ...prev,
              status: "error",
              error: data.error,
            }));
            break;
        }
      } catch {
        // JSON parse hatası - sessizce yoksay
      }
    };

    ws.onerror = () => {
      setProgress((prev) => ({
        ...prev,
        status: "error",
        error: "WebSocket connection error",
      }));
    };

    ws.onclose = () => {
      // Sadece hala connecting/rendering durumundaysa error olarak işaretle
      setProgress((prev) => {
        if (prev.status === "connecting" || prev.status === "rendering") {
          return {
            ...prev,
            status: "error",
            error: "WebSocket connection closed unexpectedly",
          };
        }
        return prev;
      });
    };

    // Cleanup
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [jobId]);

  return progress;
}

export default useRenderProgress;
