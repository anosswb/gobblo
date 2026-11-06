import { TabList, Tabs, TabSlot, TabTrigger } from 'expo-router/ui';
import { StyleSheet } from 'react-native';

import { TabBar } from '@/components/tab-bar';

/** Headless expo-router tabs + our own bar (raised FAB, sliding plateau). */
export default function TabsLayout() {
  return (
    <Tabs>
      <TabSlot />
      {/* Defines the routes; the visible bar is <TabBar />. */}
      <TabList style={styles.hidden}>
        <TabTrigger name="index" href="/" />
        <TabTrigger name="spin" href="/spin" />
        <TabTrigger name="closet" href="/closet" />
        <TabTrigger name="me" href="/me" />
      </TabList>
      <TabBar />
    </Tabs>
  );
}

const styles = StyleSheet.create({ hidden: { display: 'none' } });
