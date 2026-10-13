import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

function Urls() {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Filter & Sort States
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("default"); // 'clicks-desc', 'date-desc', 'date-asc'
  const navigate = useNavigate();

  // Fetch URLs from backend
  useEffect(() => {
    const fetchUrls = async () => {
      try {
        setLoading(true);
        // Replace with your actual backend endpoint URL
        const response = await fetch("http://localhost:8000/urls");

        if (!response.ok) {
          if (response.status === 404) {
            setUrls([]);
            setLoading(false);
            return;
          }
          throw new Error("Failed to fetch URLs");
        }

        const data = await response.json();
        setUrls(data);
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchUrls();
  }, []);

  // Filter and Sort Logic
  const processedUrls = urls
    .filter((item) => {
      const search = searchTerm.toLowerCase();
      return (
        item.original_url.toLowerCase().includes(search) ||
        item.short_url.toLowerCase().includes(search)
      );
    })
    .sort((a, b) => {
      if (sortBy === "clicks-desc") {
        return b.clicks - a.clicks;
      }
      if (sortBy === "date-desc") {
        return new Date(b.date) - new Date(a.date);
      }
      if (sortBy === "date-asc") {
        return new Date(a.date) - new Date(b.date);
      }
      return 0; // default order
    });

  // 3. Update handler to navigate to your analytics page
  const handleAnalyticsClick = (shortCode) => {
    // This matches your Analytics.jsx route parameter (e.g., /analytics/:short_code)
    navigate(`/analytics/${encodeURIComponent(shortCode)}`);
  };

  if (loading) {
    return (
      <div className="urls-container">
        <div className="loading-state">Loading your shortened URLs...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="urls-container">
        <div className="error-state">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="urls-container">
      <div className="urls-header">
        <div>
          <h2>Manage Shortened URLs</h2>
          <p className="subtitle">
            Overview of your links, click counts, and creation dates.
          </p>
        </div>
        <div className="stats-badge">
          Total Links: <span>{urls.length}</span>
        </div>
      </div>

      {/* Controls: Search & Filters */}
      <div className="controls-bar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search original or short URL..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-dropdowns">
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="default">Sort By: Default</option>
            <option value="clicks-desc">Top Clicks (Highest First)</option>
            <option value="date-desc">Date (Newest First)</option>
            <option value="date-asc">Date (Oldest First)</option>
          </select>
        </div>
      </div>

      {/* Content Table / Empty State */}
      {processedUrls.length === 0 ? (
        <div className="empty-state">
          <p>No URLs found matching your criteria.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="urls-table">
            <thead>
              <tr>
                <th>Original URL</th>
                <th>Short URL</th>
                <th>Created Date</th>
                <th>Clicks</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {processedUrls.map((item, index) => (
                <tr key={index}>
                  <td className="url-cell">
                    <a
                      href={item.original_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={item.original_url}
                    >
                      {item.original_url}
                    </a>
                  </td>
                  <td className="short-url-cell">
                    <code>{item.short_url}</code>
                  </td>
                  <td>
                    {new Date(item.date).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td>
                    <span className="clicks-pill">{item.clicks}</span>
                  </td>
                  <td>
                    <button
                      className="analytics-btn"
                      onClick={() => handleAnalyticsClick(item.short_url)}
                    >
                      View Analytics
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Urls;
