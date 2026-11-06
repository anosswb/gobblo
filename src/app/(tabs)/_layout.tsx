import { Redirect } from 'expo-router';
import { TabList, Tabs, TabSlot, TabTrigger } from 'expo-router/ui';
import { StyleSheet } from 'react-native';

import { TabBar } from '@/components/tab-bar';
import { useAppStore } from '@/state/app-store';

/** Headless expo-router tabs + our own bar (raised FAB, sliding plateau). */
export default function TabsLayout() {
  const onboarded = useAppStore((s) => s.settings.onboarded);
  if (!onboarded) return <Redirect href="/onboarding" />;
  return (
    <Tabs style={styles.fill}>
      <TabSlot style={styles.fill} />
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

const styles = StyleSheet.create({ hidden: { display: 'none' }, fill: { flex: 1 } });
