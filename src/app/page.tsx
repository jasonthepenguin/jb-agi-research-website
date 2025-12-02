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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-950 p-4">
      <main className="w-full max-w-lg rounded-2xl bg-zinc-800/50 p-8 shadow-2xl backdrop-blur-sm">
        <h1 className="mb-2 text-center text-3xl font-bold text-white">
          Attractiveness Predictor
        </h1>
        <p className="mb-8 text-center text-zinc-400">
          Upload an image to get an attractiveness score
        </p>

        {/* Upload Area */}
        <div
          onDrop={handleDrop}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          className={`relative mb-6 flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all ${
            dragActive
              ? "border-blue-500 bg-blue-500/10"
              : "border-zinc-600 bg-zinc-700/30 hover:border-zinc-500 hover:bg-zinc-700/50"
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
                className="mx-auto mb-4 h-12 w-12 text-zinc-500"
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
              <p className="text-zinc-400">
                Drag & drop an image or{" "}
                <span className="text-blue-400">browse</span>
              </p>
              <p className="mt-1 text-sm text-zinc-500">
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
            className="flex-1 rounded-xl bg-blue-600 py-3 font-semibold text-white transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
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
                Analyzing...
              </span>
            ) : (
              "Predict"
            )}
          </button>
          {image && (
            <button
              onClick={handleReset}
              className="rounded-xl border border-zinc-600 px-6 py-3 font-semibold text-zinc-300 transition-all hover:bg-zinc-700"
            >
              Reset
            </button>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-xl bg-red-500/20 p-4 text-center text-red-400">
            {error}
          </div>
        )}

        {/* Result */}
        {prediction !== null && (
          <div className="rounded-xl bg-gradient-to-r from-purple-600/20 to-blue-600/20 p-6 text-center">
            <p className="mb-2 text-sm uppercase tracking-wide text-zinc-400">
              Attractiveness Score
            </p>
            <p className="text-5xl font-bold text-white">{prediction}</p>
          </div>
        )}
      </main>
    </div>
  );
}
