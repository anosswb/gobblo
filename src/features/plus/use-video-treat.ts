import { useCallback, useState } from 'react';

import { ADS, USE_REAL_ADS } from '@/config/ads';
import { MONETIZATION } from '@/config/monetization';
import { lastAdError, preloadRewarded, showRewarded } from '@/lib/ads';
import { track } from '@/lib/analytics';
import { haptics } from '@/lib/haptics';
import { play } from '@/lib/sound';
import { useAppStore } from '@/state/app-store';
import { dayKey } from '@/state/schema';

import { adsLeftToday, afterAd } from './ad-reward';

export type VideoPhase = 'idle' | 'loading' | 'thanks' | 'later' | 'none';
/** where the offer was shown (analytics closed list, lib/analytics-events) */
export type VideoPlace = 'plus' | 'closet';

/**
 * Can a video offer be shown at all? Android only, the owner's switch (config/ads) and the
 * person's switch (Settings › Privacy & data) both on, and sparks must still buy something
 * (features/closet/shop anythingToBuy): never offer sparks that buy nothing.
 */
export function videoOffersOn(adOffers: boolean | undefined, somethingToBuy: boolean): boolean {
  return MONETIZATION === 'ads' && ADS.enabled && adOffers !== false && somethingToBuy;
}

/**
 * The optional rewarded video, shared by the Plus page card and the Closet (same daily cap
 * ADS.maxPerDay, same reward). Only ever started by a tap. Sparks from videos go to
 * stats.sparks only: the level (stats.total) is untouched.
 */
export function useVideoTreat(place: VideoPlace) {
  const adSparks = useAppStore((s) => s.stats.adSparks);
  const [phase, setPhase] = useState<VideoPhase>('idle');
  const [reason, setReason] = useState<string | null>(null);
  const left = adsLeftToday(adSparks, dayKey(), ADS.maxPerDay);
  const full = left <= 0;

  /** anonymous count: an offer was shown, with how many videos are left today */
  const trackShown = useCallback(() => track('ad_offer_shown', { left: adsLeftToday(useAppStore.getState().stats.adSparks, dayKey(), ADS.maxPerDay), place }), [place]);

  /** get one video ready in the background (only call where an offer can be shown) */
  const preload = useCallback(() => {
    if (ADS.enabled && adsLeftToday(useAppStore.getState().stats.adSparks, dayKey(), ADS.maxPerDay) > 0) preloadRewarded();
  }, []);

  const reset = useCallback(() => {
    setPhase('idle');
    setReason(null);
  }, []);

  /** Plays one video. Returns true when sparks were added. */
  const watch = async (): Promise<boolean> => {
    if (phase === 'loading' || full) return false;
    setPhase('loading');
    setReason(null);
    haptics.light();
    const r = await showRewarded().catch(() => 'unavailable' as const);
    if (r !== 'earned') {
      if (r === 'unavailable' && !USE_REAL_ADS) setReason(lastAdError());
      setPhase(r === 'closed' ? 'later' : 'none');
      return false;
    }
    const st = useAppStore.getState();
    const next = afterAd(st.stats.adSparks, dayKey(), ADS.maxPerDay);
    if (next) useAppStore.setState({ stats: { ...st.stats, sparks: st.stats.sparks + ADS.rewardSparks, adSparks: next } });
    haptics.success();
    play('spark');
    setPhase('thanks');
    return !!next;
  };

  return { phase, reason, left, full, watch, preload, reset, trackShown };
}
