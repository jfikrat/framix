import React from "react";
import { useRenderProgress } from "../hooks/useRenderProgress";

interface RenderProgressModalProps {
  jobId: string | null;
  templateId?: string;
  onClose: () => void;
}

export const RenderProgressModal: React.FC<RenderProgressModalProps> = ({ jobId, templateId, onClose }) => {
  const progress = useRenderProgress(jobId);

  // Modal kapalıysa render etme
  if (!jobId) return null;

  const getStatusText = () => {
    switch (progress.status) {
      case "connecting":
        return "Connecting...";
      case "rendering":
        return "Rendering...";
      case "completed":
        return "Completed!";
      case "error":
        return "Error";
      default:
        return "Preparing...";
    }
  };

  const getStatusColor = () => {
    switch (progress.status) {
      case "completed":
        return "#22c55e";
      case "error":
        return "#e53e3e";
      case "rendering":
        return "#3b82f6";
      default:
        return "#888";
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: 400,
          backgroundColor: "#111",
          borderRadius: 16,
          padding: 24,
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
          border: "1px solid #222",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <h2 style={{ margin: 0, fontSize: 18, color: "white", fontWeight: 600 }}>
            Render Progress
          </h2>
          <span
            style={{
              fontSize: 13,
              color: getStatusColor(),
              fontWeight: 500,
            }}
          >
            {getStatusText()}
          </span>
        </div>

        {/* Error state */}
        {progress.status === "error" && (
          <div
            style={{
              backgroundColor: "rgba(229, 62, 62, 0.1)",
              border: "1px solid #e53e3e",
              borderRadius: 8,
              padding: 16,
              marginBottom: 20,
            }}
          >
            <p style={{ margin: 0, color: "#e53e3e", fontSize: 14 }}>
              {progress.error || "An unknown error occurred"}
            </p>
          </div>
        )}

        {/* Progress section */}
        {progress.status !== "error" && (
          <>
            {/* Progress bar */}
            <div
              style={{
                width: "100%",
                height: 8,
                backgroundColor: "#222",
                borderRadius: 4,
                overflow: "hidden",
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  width: `${progress.percent}%`,
                  height: "100%",
                  backgroundColor: progress.status === "completed" ? "#22c55e" : "#3b82f6",
                  borderRadius: 4,
                  transition: "width 0.3s ease-out",
                  backgroundImage:
                    progress.status === "rendering"
                      ? "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)"
                      : undefined,
                  backgroundSize: "200% 100%",
                  animation:
                    progress.status === "rendering" ? "shimmer 1.5s infinite" : undefined,
                }}
              />
            </div>

            {/* Stats */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 14,
                color: "#888",
                marginBottom: 8,
              }}
            >
              <span>
                Frame{" "}
                <strong style={{ color: "white" }}>
                  {progress.frame}
                </strong>{" "}
                / {progress.total}
              </span>
              <span>
                <strong style={{ color: "white" }}>{progress.percent}%</strong>
              </span>
            </div>

            {/* ETA */}
            {progress.status === "rendering" && progress.eta && (
              <div style={{ fontSize: 13, color: "#666", marginBottom: 20 }}>
                ETA: {progress.eta}
              </div>
            )}
          </>
        )}

        {/* Completed state */}
        {progress.status === "completed" && progress.outputUrl && (
          <div style={{ marginTop: 20 }}>
            <a
              href={progress.outputUrl}
              download={`${templateId || "output"}.mp4`}
              style={{
                display: "block",
                width: "100%",
                padding: "12px 0",
                backgroundColor: "#22c55e",
                color: "white",
                textAlign: "center",
                borderRadius: 8,
                textDecoration: "none",
                fontWeight: 600,
                fontSize: 15,
                marginBottom: 12,
              }}
            >
              Download Video
            </a>
          </div>
        )}

        {/* Close button */}
        {(progress.status === "completed" || progress.status === "error") && (
          <button
            onClick={onClose}
            style={{
              width: "100%",
              padding: "12px 0",
              backgroundColor: "#222",
              color: "white",
              border: "none",
              borderRadius: 8,
              fontSize: 15,
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            Close
          </button>
        )}

        {/* Connecting / Rendering - Cancel hint */}
        {(progress.status === "connecting" || progress.status === "rendering") && (
          <p style={{ margin: 0, marginTop: 16, fontSize: 12, color: "#666", textAlign: "center" }}>
            Click outside to close
          </p>
        )}
      </div>

      {/* Shimmer animation keyframes */}
      <style>
        {`
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
        `}
      </style>
    </div>
  );
};

export default RenderProgressModal;
