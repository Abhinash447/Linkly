import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";
import "../App.css";

function Analytics() {
  const { short_code } = useParams();

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function getAnalytics() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `http://localhost:8000/analytics/${encodeURIComponent(
            short_code,
          )}`,
          { signal: controller.signal },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch analytics");
        }

        setAnalytics(data);
      } catch (err) {
        if (err.name === "AbortError") return;

        setError(err.message || "Something went wrong");
        setAnalytics(null);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    if (short_code) {
      getAnalytics();
    } else {
      setError("Short URL code is missing");
      setLoading(false);
    }

    return () => controller.abort();
  }, [short_code]);

  if (loading) {
    return (
      <div className="analytics-page">
        <div className="analytics-message">
          <div className="analytics-spinner" />
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-page">
        <div className="analytics-message analytics-error">
          <h2>Unable to load analytics</h2>
          <p>{error}</p>
          <button
            className="analytics-button"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  const countryData = analytics.clicksByCountry || [];
  const dailyData = (analytics.clicksByDay || []).map((item) => ({
    ...item,
    day: String(item.day).slice(0, 10),
  }));

  const totalCountryClicks = countryData.reduce(
    (sum, item) => sum + Number(item.clicks || 0),
    0,
  );

  const topCountry = countryData[0];

  return (
    <div className="analytics-page">
      <div className="analytics-container">
        {/* Header */}
        <header className="analytics-header">
          <div>
            <p className="analytics-eyebrow">URL SHORTENER</p>
            <h1>Analytics Dashboard</h1>
            <p className="analytics-subtitle">
              Track your link performance and audience activity.
            </p>
          </div>

          <div className="short-code-badge">
            <span className="status-dot" />
            {analytics.shortCode}
          </div>
        </header>

        {/* Summary cards */}
        <section className="analytics-stats">
          <div className="stat-card">
            <div className="stat-icon purple">↗</div>
            <p className="stat-label">Total Clicks</p>
            <h2>{Number(analytics.totalClicks || 0).toLocaleString()}</h2>
            <span className="stat-caption">All-time link clicks</span>
          </div>

          <div className="stat-card">
            <div className="stat-icon blue">◷</div>
            <p className="stat-label">Active Days</p>
            <h2>{dailyData.length}</h2>
            <span className="stat-caption">Days with recorded clicks</span>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">◎</div>
            <p className="stat-label">Countries</p>
            <h2>{countryData.length}</h2>
            <span className="stat-caption">Countries or unknown locations</span>
          </div>

          <div className="stat-card">
            <div className="stat-icon orange">★</div>
            <p className="stat-label">Top Country</p>
            <h2 className="top-country-value">{topCountry?.country || "—"}</h2>
            <span className="stat-caption">
              {topCountry
                ? `${Number(topCountry.clicks).toLocaleString()} clicks`
                : "No country data yet"}
            </span>
          </div>
        </section>

        {/* Daily clicks chart */}
        <section className="analytics-panel">
          <div className="panel-header">
            <div>
              <h2>Click Activity</h2>
              <p>Daily traffic to your shortened URL</p>
            </div>
            <span className="panel-tag">DAILY</span>
          </div>

          {dailyData.length === 0 ? (
            <div className="analytics-empty">
              No click activity recorded yet.
            </div>
          ) : (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={dailyData}
                  margin={{
                    top: 15,
                    right: 15,
                    left: 0,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e9eaf2"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="day"
                    tick={{ fill: "#777b8c", fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    minTickGap={25}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: "#777b8c", fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    width={40}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "10px",
                      border: "1px solid #e9eaf2",
                    }}
                    formatter={(value) => [
                      `${Number(value).toLocaleString()} clicks`,
                      "Clicks",
                    ]}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="clicks"
                    name="Clicks"
                    stroke="#7057e8"
                    strokeWidth={3}
                    dot={{
                      r: 4,
                      fill: "#7057e8",
                      strokeWidth: 2,
                      stroke: "#fff",
                    }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        {/* Country chart */}
        <section className="analytics-panel">
          <div className="panel-header">
            <div>
              <h2>Clicks by Country</h2>
              <p>Where your audience is coming from</p>
            </div>
            <span className="panel-tag">GEOGRAPHY</span>
          </div>

          {countryData.length === 0 ? (
            <div className="analytics-empty">No country data recorded yet.</div>
          ) : (
            <>
              <div className="chart-container country-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={countryData.slice(0, 8)}
                    layout="vertical"
                    margin={{
                      top: 5,
                      right: 25,
                      left: 15,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e9eaf2"
                      horizontal={false}
                    />
                    <XAxis
                      type="number"
                      allowDecimals={false}
                      tick={{ fill: "#777b8c", fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="country"
                      width={100}
                      tick={{ fill: "#55596b", fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      formatter={(value) => [
                        `${Number(value).toLocaleString()} clicks`,
                        "Clicks",
                      ]}
                    />
                    <Bar
                      dataKey="clicks"
                      name="Clicks"
                      fill="#7057e8"
                      radius={[0, 6, 6, 0]}
                      barSize={24}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Country details */}
              <div className="country-table-wrapper">
                <table className="country-table">
                  <thead>
                    <tr>
                      <th>Country</th>
                      <th>Clicks</th>
                      <th>Share</th>
                    </tr>
                  </thead>
                  <tbody>
                    {countryData.map((item) => {
                      const clicks = Number(item.clicks || 0);
                      const percentage =
                        totalCountryClicks > 0
                          ? (clicks / totalCountryClicks) * 100
                          : 0;

                      return (
                        <tr key={item.country}>
                          <td>{item.country}</td>
                          <td>{clicks.toLocaleString()}</td>
                          <td>
                            <div className="share-cell">
                              <div className="share-track">
                                <div
                                  className="share-fill"
                                  style={{
                                    width: `${percentage}%`,
                                  }}
                                />
                              </div>
                              <span>{percentage.toFixed(1)}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>

        <footer className="analytics-footer">
          Analytics for short URL <strong>{analytics.shortCode}</strong>
        </footer>
      </div>
    </div>
  );
}

export default Analytics;
