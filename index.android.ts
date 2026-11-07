// Android entry: the normal app + the headless task that draws the home-screen widget.
import 'expo-router/entry';
import { registerWidgetTaskHandler } from 'react-native-android-widget';

import { widgetTaskHandler } from '@/widgets/task-handler';

registerWidgetTaskHandler(widgetTaskHandler);
