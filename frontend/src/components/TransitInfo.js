import React, { useState, useEffect } from "react";

// Define stops with MTA stop ID for the B63 route
const stops = [{ id: "MTA_201285", name: "B63 Bus Stop - 5th Ave & 36 St" }];

const TransitInfo = () => {
  const [transitData, setTransitData] = useState([]);
  const [loading, setLoading] = useState(true); // Track loading state
  const [error, setError] = useState(null); // Track errors

  useEffect(() => {
    const fetchTransitData = async () => {
      setLoading(true);
      setError(null);
      try {
        const results = await Promise.all(
          stops.map(async (stop) => {
            console.log(`Fetching data for stop: ${stop.id}`);
            // Updated API URL for our backend controller
            const response = await fetch(
              `http://localhost:3000/api/transit?stop_id=${stop.id}&route_id=MTA NYCT_B63`
            );

            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log(`Data received for stop ${stop.id}:`, data);

            return { stop: stop.name, data: data.arrivals };
          })
        );
        console.log("All transit data:", results);
        setTransitData(results);
      } catch (error) {
        console.error("Error fetching transit data:", error);
        setError("Error fetching transit data.");
      } finally {
        setLoading(false);
      }
    };

    fetchTransitData();
    const interval = setInterval(fetchTransitData, 60000); // Refresh every 60 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="transit-info">
      {loading ? (
        <p>Loading transit information...</p>
      ) : error ? (
        <p>{error}</p>
      ) : transitData.length > 0 ? (
        transitData.map((stop) => (
          <div key={stop.stop} className="transit-info__stop">
            <h4>{stop.stop}</h4>
            {stop.data && stop.data.length > 0 ? (
              <ul>
                {stop.data.map((arrival, index) => (
                  <li key={index}>
                    Arrival at {new Date(arrival.time).toLocaleTimeString()} -{" "}
                    {arrival.status} ({arrival.route})
                  </li>
                ))}
              </ul>
            ) : (
              <p>No arrivals available.</p>
            )}
          </div>
        ))
      ) : (
        <p>No transit data available.</p>
      )}
    </div>
  );
};

export default TransitInfo;
