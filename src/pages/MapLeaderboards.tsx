import { useState } from 'react';

function MapLeaderboards() {
  const [selectedMap, setSelectedMap] = useState('');

  return (
    <div className="map-leaderboards">
      <h1>Map Leaderboards</h1>
      <div className="map-selector">
        <select 
          value={selectedMap} 
          onChange={(e) => setSelectedMap(e.target.value)}
          className="map-select"
        >
          <option value="">Select a map</option>
          {/* Map options will be populated dynamically */}
          <option value="bhop_beginner">bhop_beginner</option>
          <option value="bhop_easy">bhop_easy</option>
        </select>
      </div>
      <div className="leaderboard">
        {selectedMap ? (
          <p>Leaderboard for {selectedMap} will be displayed here.</p>
        ) : (
          <p>Please select a map to view its leaderboard.</p>
        )}
      </div>
    </div>
  );
}

export default MapLeaderboards; 