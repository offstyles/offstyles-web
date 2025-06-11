import { useState } from 'react';

function PlayerLookup() {
  const [playerName, setPlayerName] = useState('');
  const [searchResults, setSearchResults] = useState(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // This will be implemented with actual search functionality later
    console.log('Searching for player:', playerName);
  };

  return (
    <div className="player-lookup">
      <h1>Player Lookup</h1>
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Enter player name"
          className="search-input"
        />
        <button type="submit" className="search-button">
          Search
        </button>
      </form>
      <div className="player-profile">
        {searchResults ? (
          <p>Player profile will be displayed here.</p>
        ) : (
          <p>Search for a player to view their profile.</p>
        )}
      </div>
    </div>
  );
}

export default PlayerLookup; 