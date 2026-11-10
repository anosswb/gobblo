import { Redirect } from 'expo-router';

/** Spin used to be a tab. It is now "Pick for me" in the toolkit (docs/15 item 5); old links land there. */
export default function SpinRoute() {
  return <Redirect href="/tools/pick" />;
}
