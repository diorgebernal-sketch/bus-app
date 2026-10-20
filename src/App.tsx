import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { DriverApp } from './pages/driver/DriverApp';
import { DriverInbox, DriverThread } from './pages/driver/DriverMessages';
import { DriverRoster } from './pages/driver/DriverRoster';
import { DriverRoute } from './pages/driver/DriverRoute';
import { DriverStudent } from './pages/driver/DriverStudent';
import { Login } from './pages/Login';
import { ParentAlerts } from './pages/parent/ParentAlerts';
import { ParentApp } from './pages/parent/ParentApp';
import { ParentChildren } from './pages/parent/ParentChildren';
import { ParentHome } from './pages/parent/ParentHome';
import { ParentMessages } from './pages/parent/ParentMessages';
import { ParentPayments } from './pages/parent/ParentPayments';
import { StoreProvider, useStore } from './store';

function Home() {
  const { session } = useStore();
  if (session) return <Navigate to={session.role === 'parent' ? '/parent' : '/driver'} replace />;
  return <Login />;
}

export function App() {
  return (
    <StoreProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/parent" element={<ParentApp />}>
            <Route index element={<ParentHome />} />
            <Route path="alerts" element={<ParentAlerts />} />
            <Route path="messages" element={<ParentMessages />} />
            <Route path="payments" element={<ParentPayments />} />
            <Route path="children" element={<ParentChildren />} />
          </Route>
          <Route path="/driver" element={<DriverApp />}>
            <Route index element={<DriverRoute />} />
            <Route path="roster" element={<DriverRoster />} />
            <Route path="students/:id" element={<DriverStudent />} />
            <Route path="messages" element={<DriverInbox />} />
            <Route path="messages/:parentId" element={<DriverThread />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </StoreProvider>
  );
}
