import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Urls.css";
import { API_BASE_URL, api } from "../api/api.js";

function Urls() {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState("");
  const [deletingCode, setDeletingCode] = useState("");
  // Filter & Sort States
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("default"); // 'clicks-desc', 'date-desc', 'date-asc'
  const navigate = useNavigate();

  // Fetch URLs from backend

  useEffect(() => {
  const fetchUrls = async () => {
    try {
      setLoading(true);
      setError(null);

      // The shared helper adds the current user's token and reports backend errors.
      setUrls(await api("/urls"));
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
      // Older or guest-created rows may have missing URL fields.
      return (
        String(item.original_url ?? "").toLowerCase().includes(search) ||
        String(item.short_url ?? "").toLowerCase().includes(search)
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

  const handleDelete = async (shortCode) => {
    setActionError("");
    setDeletingCode(shortCode);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_BASE_URL}/urls/${encodeURIComponent(shortCode)}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete URL");
      }

      setUrls((prev) => prev.filter((url) => url.short_url !== shortCode));
    } catch (err) {
      setActionError(err.message || "Failed to delete URL");
    } finally {
      setDeletingCode("");
    }
  }

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

      {actionError && (
        <p className="delete-error" role="alert">
          {actionError}
        </p>
      )}

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
                <th>Delete</th>
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
                  <td className="url-cell">
                    {/* Open short codes on the backend host to trigger its redirect route. */}
                    <a
                      href={`${API_BASE_URL}/${encodeURIComponent(item.short_url)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={item.short_url}
                    >
                      {item.short_url}
                    </a>
                  </td>
                  {/* <td className="short-url-cell">

                    {item.short_url}
                  </td> */}
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
                  <td>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(item.short_url)}
                      disabled={deletingCode === item.short_url}
                      aria-label={`Delete ${item.short_url}`}
                    >
                      {deletingCode === item.short_url ? "Deleting..." : "Delete"}
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
