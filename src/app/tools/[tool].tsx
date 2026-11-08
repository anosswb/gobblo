import { useLocalSearchParams } from 'expo-router';

import { ToolScreen } from '@/screens/tools';

export default function ToolRoute() {
  const { tool } = useLocalSearchParams<{ tool: string }>();
  return <ToolScreen id={tool} />;
}
