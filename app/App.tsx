import { StatusBar } from 'expo-status-bar';

import { SnapshotScreen } from '@/app/screens/SnapshotScreen';

export default function App() {
  return (
    <>
      <SnapshotScreen />
      <StatusBar style="dark" />
    </>
  );
}
