import { PlaceholderCard } from '@/components/placeholder-card';
import { Screen } from '@/components/screen';
import { Text } from '@/components/text';
import { en } from '@/i18n/en';

export default function ClosetScreen() {
  return (
    <Screen>
      <Text variant="title">{en.placeholder.closet}</Text>
      <PlaceholderCard title="hats, colours, rooms" />
    </Screen>
  );
}
