// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import MapView from './pages/MapView';
import History from './pages/HistoryPage';
import Notification from './pages/NotificationPage';
import AISuggestion from './pages/AISuggestionPage';
import NearbyHelp from './pages/NearbyHelp';
import ScheduledTips from './pages/ScheduledTips';
import Guidelines from './pages/Guidelines';
import Report from './pages/Report';
import StatsBoard from './pages/StatsBoard'

function App() {
  return (
    <Router> {/* Removed basename */}
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<MapView />} />
          <Route path="history" element={<History />} />
          <Route path="notification" element={<Notification />} />
          <Route path="ai-suggestion" element={<AISuggestion />} />
          <Route path="nearby-help" element={<NearbyHelp />} />
          <Route path="scheduled-tips" element={<ScheduledTips />} />
          <Route path="*" element={<Navigate to="/" replace />} />
          <Route path="/guidelines" element={<Guidelines />} />
          <Route path="/report" element={<Report />} />
          <Route path="/stats-board" element={<StatsBoard />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
