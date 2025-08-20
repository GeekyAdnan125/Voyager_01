"use client";

import React, { useState } from "react";

export default function ImageAnalyzer() {
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [country, setCountry] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImageUrl("");
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setImageUrl(url);
    if (url) {
      setImageFile(null);
      setPreviewUrl(url);
    }
  };

  const handleAnalyze = async () => {
    if (!imageUrl || !country) return;
    setIsLoading(true);
    setResults(null);

    try {
      const res = await fetch("http://localhost:5000/api/ai/aiImageAnalyser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl,
          country,
        }),
      });

      if (!res.ok) throw new Error("API request failed");
      const data = await res.json();
      setResults(data);
    } catch (error) {
      console.error(error);
      alert("Error analyzing image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const clearAll = () => {
    setImageFile(null);
    setImageUrl("");
    setCountry("");
    setResults(null);
    setPreviewUrl("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Image Place Analyzer
          </h1>
          <p className="text-gray-600 text-lg">
            Discover places and landmarks from your images
          </p>
        </div>

        {/* Input Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* File Upload */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Upload Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gradient-to-r file:from-blue-500 file:to-purple-500 file:text-white"
              />
            </div>

            {/* URL Input */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Or Enter Image URL
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={handleUrlChange}
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"
              />
            </div>
          </div>

          {/* Country Input */}
          <div className="mb-6 space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Country
            </label>
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="e.g., India, France..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"
            />
          </div>

          {/* Preview */}
          {previewUrl && (
            <div className="mb-6">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg shadow-md"
              />
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleAnalyze}
              disabled={!imageUrl || !country || isLoading}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold shadow-lg"
            >
              {isLoading ? "Analyzing..." : "Analyze Image"}
            </button>
            <button
              onClick={clearAll}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Results */}
        {results && !isLoading && (
          <div className="space-y-8">
            {/* Main Place Info */}
            <div className="bg-white rounded-2xl shadow-xl border p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                {results.guessedPlace}
              </h2>
              <p className="text-gray-600 font-medium mb-4">
                Country: {results.country}
              </p>
              <img
                src={results.originalImage}
                alt="Analyzed"
                className="w-full h-64 object-cover rounded-lg shadow"
              />
            </div>

            {/* Recommendations */}
            {results.recommendations?.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl border p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  Recommended Similar Places
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {results.recommendations.map((rec, i) => (
                    <div
                      key={i}
                      className="bg-gradient-to-br from-gray-50 to-indigo-50 rounded-xl p-4 border hover:shadow-lg transition-all"
                    >
                      <img
                        src={rec.image}
                        alt={rec.name}
                        className="w-full h-40 object-cover rounded-lg mb-3"
                      />
                      <p
                        className="text-gray-800 text-sm"
                        dangerouslySetInnerHTML={{ __html: rec.name }}
                      ></p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
