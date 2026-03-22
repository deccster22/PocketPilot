import { StatusBar } from 'expo-status-bar';

import { DashboardScreen } from '@/app/screens/DashboardScreen';

export default function App() {
  return (
    <>
      <DashboardScreen />
      <StatusBar style="dark" />
    </>
  );
}
