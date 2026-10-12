import { useState } from "react";
import "../App.css";

const API_URL = "http://localhost:8000/api/";
const SHORT_URL_BASE = "http://localhost:8000/api";

function Home() {
  const [originalUrl, setOriginalUrl] = useState("");
  const [shortCode, setShortCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setShortCode("");
    setCopied(false);
    setLoading(true);

    const trimmedUrl = originalUrl.trim();

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          original_url: trimmedUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to shorten this URL.");
      }

      if (!data.short_code) {
        throw new Error("The server did not return a short code.");
      }

      setShortCode(data.short_code);
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Could not connect to the server. Check your backend and API URL."
          : err.message || "Something went wrong.",
      );
    } finally {
      setLoading(false);
    }
  }

  const shortUrl = shortCode ? `${SHORT_URL_BASE}/${shortCode}` : "";

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
    } catch {
      setError("Unable to copy automatically. Please copy the link manually.");
    }
  }

  return (
    <div className="home-container">
      <div className="shortener-card">
        <h1>URL Shortener</h1>
        <p className="subtitle">
          Transform your long links into clean, short URLs instantly.
        </p>

        <form onSubmit={handleSubmit} className="shortener-form">
          <input
            type="url"
            value={originalUrl}
            onChange={(event) => {
              setOriginalUrl(event.target.value);
              setError("");
            }}
            placeholder="https://example.com"
            required
            disabled={loading}
          />

          <button type="submit" disabled={loading} className="shorten-button">
            {loading ? "Creating..." : "Shorten URL"}
          </button>
        </form>

        {error && (
          <p role="alert" className="error-message">
            {error}
          </p>
        )}

        {shortCode && (
          <div className="result-container">
            <h2>Your short URL:</h2>

            <div className="short-url-row">
              <a
                href={shortUrl}
                target="_blank"
                rel="noreferrer"
                className="short-url"
              >
                {shortUrl}
              </a>

              <button
                type="button"
                onClick={handleCopy}
                className="copy-button"
              >
                {copied ? "Copied!" : "Copy URL"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
