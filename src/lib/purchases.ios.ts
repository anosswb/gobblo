/**
 * iPhone Plus purchase through RevenueCat (react-native-purchases). Lazy and defensive: with no
 * key (EXPO_PUBLIC_RC_IOS_KEY) or no native module it behaves like the stub in purchases.ts.
 * One non-consumable product, entitlement id "plus", the current offering's first package.
 * A network error never takes Plus away: these functions only ever say "you have it".
 */
import { track } from '@/lib/analytics';

export type BuyResult = 'bought' | 'cancelled' | 'unavailable';
type Lib = typeof import('react-native-purchases');

const KEY = process.env.EXPO_PUBLIC_RC_IOS_KEY;
const ENTITLEMENT = 'plus';

let lib: Lib | null | undefined;
let configured = false;
function rc(): Lib['default'] | null {
  if (!KEY) return null;
  if (lib === undefined) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      lib = require('react-native-purchases') as Lib;
    } catch {
      lib = null;
    }
  }
  if (!lib) return null;
  if (!configured) {
    try {
      lib.default.configure({ apiKey: KEY });
      configured = true;
    } catch {
      return null;
    }
  }
  return lib.default;
}

/** The store's localized price (e.g. "$4.99"), or null when it is not known yet. */
export async function getPlusPrice(): Promise<string | null> {
  try {
    const offerings = await rc()?.getOfferings();
    return offerings?.current?.availablePackages[0]?.product.priceString ?? null;
  } catch {
    return null;
  }
}

export async function buyPlus(): Promise<BuyResult> {
  const p = rc();
  if (!p) return 'unavailable';
  try {
    const pkg = (await p.getOfferings()).current?.availablePackages[0];
    if (!pkg) return 'unavailable';
    const { customerInfo } = await p.purchasePackage(pkg);
    const bought = !!customerInfo.entitlements.active[ENTITLEMENT];
    if (bought) track('plus_bought');
    return bought ? 'bought' : 'unavailable';
  } catch (e) {
    // closing Apple's sheet is a choice, not an error
    return (e as { userCancelled?: boolean | null } | null)?.userCancelled ? 'cancelled' : 'unavailable';
  }
}

/** True if a Plus purchase was found and restored. */
export async function restorePlus(): Promise<boolean> {
  try {
    const info = await rc()?.restorePurchases();
    const found = !!info?.entitlements.active[ENTITLEMENT];
    track('plus_restored', { found });
    return found;
  } catch {
    return false;
  }
}

/** On app start: true when this Apple account already owns Plus (new phone, reinstall). */
export async function syncPlus(): Promise<boolean> {
  try {
    const info = await rc()?.getCustomerInfo();
    return !!info?.entitlements.active[ENTITLEMENT];
  } catch {
    return false;
  }
}
