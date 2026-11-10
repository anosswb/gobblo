import { adErrorCode, canContinueAfterConsentError, joinReasons, shortError } from './ad-reason';

describe('ad reasons', () => {
  it('carries on after a consent error unless consent is required', () => {
    expect(canContinueAfterConsentError('REQUIRED')).toBe(false);
    expect(canContinueAfterConsentError('NOT_REQUIRED')).toBe(true);
    expect(canContinueAfterConsentError('OBTAINED')).toBe(true);
    expect(canContinueAfterConsentError('UNKNOWN')).toBe(true);
    expect(canContinueAfterConsentError(undefined)).toBe(true);
  });

  it('shortens errors to one line', () => {
    expect(shortError(new Error('a\n  b'))).toBe('a b');
    expect(shortError('x'.repeat(200)).length).toBe(80);
    expect(shortError(null)).toBe('unknown');
    expect(shortError({ message: 'm' })).toBe('m');
  });

  it('reads the ad error code', () => {
    expect(adErrorCode({ code: 'googleMobileAds/error-code-no-fill' })).toBe('googleMobileAds/error-code-no-fill');
    expect(adErrorCode(undefined)).toBe('unknown');
  });

  it('joins reasons', () => {
    expect(joinReasons(null, null)).toBeNull();
    expect(joinReasons('a', null)).toBe('a');
    expect(joinReasons('a', 'b')).toBe('a | b');
    expect(joinReasons(null, 'b')).toBe('b');
  });
});
