import React, { useEffect, useState } from "react";
import { fetchWithAuth } from "../../utils/fetchWithAuth";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const Stats = ({ userId = null }) => {
  const [personal, setPersonal] = useState(null);
  const [global, setGlobal] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const personalEndpoint = userId ? `/user/${userId}/stats` : "/me/stats";
        const [personalRes, globalRes] = await Promise.all([
          fetchWithAuth(personalEndpoint),
          fetchWithAuth("/stats/global"),
        ]);
        setPersonal(await personalRes.json());
        setGlobal(await globalRes.json());
      } catch (err) {
        console.error("Failed to fetch stats", err);
      }
    };

    fetchStats();
  }, [userId]);

  const disPointsChartData =
    personal && global
      ? [
          {
            name: "Avg Distance (km)",
            You: personal.avg_distance,
            Global: global.avg_distance,
          },
          {
            name: "Avg Points",
            You: personal.avg_points,
            Global: global.avg_points,
          },
        ]
      : [];

  const gamesChartData =
    personal && global
      ? [
          {
            name: "Games Played (Global Avg)",
            You: personal.total_games,
            Global: global.avg_games_per_user,
          },
        ]
      : [];

  const CustomLabel = ({ x, y, width, value }) => {
    const centerX = x + width / 2;
    return (
      <text
        x={centerX}
        y={y - 8}
        fill="black"
        textAnchor="middle"
        fontSize={14}
      >
        {Math.round(value)}
      </text>
    );
  };

  return (
    <div className="stats-container">
      <h2>📊 Game Stats</h2>

      {!personal || !global ? (
        <p>Loading...</p>
      ) : (
        <>
          {/* Avg Distance & Points */}
          <div className="chart-wrapper">
            <ResponsiveContainer width={600} height={300}>
              <BarChart
                data={disPointsChartData}
                margin={{ top: 20, right: 30, bottom: 5, left: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="You" fill="#8884d8" label={<CustomLabel />} />
                <Bar dataKey="Global" fill="#82ca9d" label={<CustomLabel />} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Games Played (Global Avg)*/}
          <div className="chart-wrapper">
            <ResponsiveContainer width={400} height={250}>
              <BarChart
                data={gamesChartData}
                margin={{ top: 20, right: 30, bottom: 5, left: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis
                  allowDecimals={false}
                  domain={[0, (dataMax) => Math.floor(dataMax * 1.5)]}
                />
                <Tooltip />
                <Legend />

                <Bar dataKey="You" fill="#8884d8" label={<CustomLabel />} />
                <Bar dataKey="Global" fill="#82ca9d" label={<CustomLabel />} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
};

export default Stats;
