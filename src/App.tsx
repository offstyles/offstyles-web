import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import RecentRecords from './pages/RecentRecords'
import MapLeaderboards from './pages/MapLeaderboards'
import PlayerLookup from './pages/PlayerLookup'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<RecentRecords />} />
          <Route path="maps" element={<MapLeaderboards />} />
          <Route path="players" element={<PlayerLookup />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
