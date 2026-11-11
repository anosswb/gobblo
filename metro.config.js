// Expo's default Metro config + Sentry's debug IDs, so crash stack traces match the uploaded
// source maps (docs/19-analytics.md). No component annotation (it would copy on-screen text into
// labels), no web replay, no feedback widget.
const { getSentryExpoConfig } = require('@sentry/react-native/metro');

module.exports = getSentryExpoConfig(__dirname, {
  annotateReactComponents: false,
  includeWebReplay: false,
  includeWebFeedback: false,
  enableSourceContextInDevelopment: false,
});
