"use client";

import { useState, useCallback } from "react";

export default function Home() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFile = useCallback((file: File) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      setError("Invalid file type. Use JPG, PNG, or WebP");
      return;
    }

    if (file.size > maxSize) {
      setError("Image too large. Maximum size is 5MB");
      return;
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
    setPrediction(null);
    setError(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleSubmit = async () => {
    if (!image) return;

    setLoading(true);
    setError(null);
    setPrediction(null);

    try {
      const formData = new FormData();
      formData.append("image", image);

      const response = await fetch("/api/predict", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Prediction failed");
      }

      setPrediction(data.prediction);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setImage(null);
    setPreview(null);
    setPrediction(null);
    setError(null);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-start bg-gradient-to-br from-black to-zinc-950 p-4 pt-64">
      <h1 className="mb-8 text-center text-4xl font-bold text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
        JB Attractiveness AI
      </h1>
      <main className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-900/80 p-8 shadow-[0_0_30px_rgba(0,0,0,0.8)] backdrop-blur-sm">
        {/* Upload Area */}
        <div
          onDrop={handleDrop}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          className={`relative mb-6 flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all ${
            dragActive
              ? "border-white/50 bg-white/5 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
              : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-600 hover:bg-zinc-800/70"
          }`}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            className="absolute inset-0 cursor-pointer opacity-0"
          />
          {preview ? (
            <img
              src={preview}
              alt="Preview"
              className="max-h-[300px] rounded-lg object-contain"
            />
          ) : (
            <div className="text-center">
              <svg
                className="mx-auto mb-4 h-12 w-12 text-zinc-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-zinc-500">
                Drag & drop an image or{" "}
                <span className="text-zinc-300 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">browse</span>
              </p>
              <p className="mt-1 text-sm text-zinc-600">
                Supports JPG, PNG, WebP
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mb-6 flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={!image || loading}
            className="flex-1 rounded-xl bg-black py-3 font-semibold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] transition-all hover:bg-zinc-900 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] disabled:cursor-not-allowed disabled:opacity-50 disabled:drop-shadow-none"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span className="drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">Analyzing...</span>
              </span>
            ) : (
              <span className="drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">Predict</span>
            )}
          </button>
          {image && (
            <button
              onClick={handleReset}
              className="rounded-xl border border-zinc-700 bg-zinc-900 px-6 py-3 font-semibold text-zinc-400 transition-all hover:border-zinc-600 hover:text-zinc-300"
            >
              Reset
            </button>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-900/50 bg-red-950/30 p-4 text-center text-red-400">
            {error}
          </div>
        )}

        {/* Result */}
        {prediction !== null && (
          <div className="rounded-xl border border-zinc-700 bg-black/50 p-6 text-center">
            <p className="mb-2 text-sm uppercase tracking-wide text-zinc-500">
              Attractiveness Score
            </p>
            <p className="text-5xl font-bold text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]">
              {prediction}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
