// Keeps Android builds inside the free EAS worker's memory: fewer parallel Gradle/CMake jobs
// and an explicit JVM heap. (Two dev builds were killed with "Gradle build daemon disappeared".)
const { withGradleProperties } = require('expo/config-plugins');

const PROPS = {
  'org.gradle.jvmargs': '-Xmx3g -XX:MaxMetaspaceSize=768m -XX:+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8',
  'org.gradle.workers.max': '2',
  'org.gradle.parallel': 'false',
};

module.exports = function withGradleMemory(config) {
  return withGradleProperties(config, (cfg) => {
    for (const [key, value] of Object.entries(PROPS)) {
      cfg.modResults = cfg.modResults.filter((p) => !(p.type === 'property' && p.key === key));
      cfg.modResults.push({ type: 'property', key, value });
    }
    return cfg;
  });
};
