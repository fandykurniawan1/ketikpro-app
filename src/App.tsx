import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { DashboardPage } from '@/pages/DashboardPage';
import { CurriculumPage } from '@/pages/CurriculumPage';
import { LessonPage } from '@/pages/LessonPage';
import { SpeedTestPage } from '@/pages/SpeedTestPage';
import { FingerGuidePage } from '@/pages/FingerGuidePage';
import { SettingsPage } from '@/pages/SettingsPage';

export const App: React.FC = () => {
  return (
    <Router>
      <AppShell>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/belajar" element={<CurriculumPage />} />
          <Route path="/latihan/:id" element={<LessonPage />} />
          <Route path="/tes" element={<SpeedTestPage />} />
          <Route path="/panduan" element={<FingerGuidePage />} />
          <Route path="/pengaturan" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppShell>
    </Router>
  );
};

export default App;
