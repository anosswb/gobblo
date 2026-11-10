import { Redirect } from 'expo-router';
import { TabList, Tabs, TabSlot, TabTrigger, type defaultTabsSlotRender } from 'expo-router/ui';
import { StyleSheet } from 'react-native';
import { Screen } from 'react-native-screens';

import { TabBar } from '@/components/tab-bar';
import { useAppStore } from '@/state/app-store';

/**
 * Like expo-router's default tab render, but hidden tabs are frozen (react-freeze): they keep
 * their state and scroll position, but stop re-rendering while you are on another tab.
 * Store updates on Home (feeding, sparks) no longer re-render Me and Closet behind it.
 */
const renderTab: typeof defaultTabsSlotRender = (descriptor, { isFocused, loaded, detachInactiveScreens }) => {
  if (!loaded && !isFocused) return null; // lazy: never visited
  return (
    <Screen
      key={descriptor.route.key}
      enabled={detachInactiveScreens}
      activityState={isFocused ? 2 : 0}
      freezeOnBlur={!isFocused}
      style={[styles.screen, isFocused ? styles.focused : styles.unfocused]}>
      {descriptor.render()}
    </Screen>
  );
};

/** Headless expo-router tabs + our own bar (raised FAB, sliding plateau). */
export default function TabsLayout() {
  const onboarded = useAppStore((s) => s.settings.onboarded);
  if (!onboarded) return <Redirect href="/onboarding" />;
  return (
    <Tabs style={styles.fill}>
      <TabSlot style={styles.fill} renderFn={renderTab} />
      {/* Defines the routes; the visible bar is <TabBar />. */}
      <TabList style={styles.hidden}>
        <TabTrigger name="index" href="/" />
        <TabTrigger name="closet" href="/closet" />
        <TabTrigger name="me" href="/me" />
      </TabList>
      <TabBar />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  hidden: { display: 'none' },
  fill: { flex: 1 },
  screen: { flex: 1, position: 'relative', height: '100%' },
  focused: { zIndex: 1, display: 'flex', flexShrink: 0, flexGrow: 1 },
  unfocused: { zIndex: -1, display: 'none', flexShrink: 1, flexGrow: 0 },
});
