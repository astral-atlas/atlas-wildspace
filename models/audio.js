// @flow strict
const s = require('@lukekaalim/schema');
const { string } = require('@lukekaalim/schema/primitives');

const youtubeSource = s.define('YoutubeSource', 'A audio track from youtube', s.object(s.props({
  id: s.define('YoutubeSourceID', 'Globally Unique ID for Youtube Sources', s.string()),
  title: s.string(),
  artist: string(),
  videoId: s.define('YoutubeVideoID', 'Globally Unique ID for Youtube', s.string()),
})));

const httpSource = s.define('HTTPSource', 'A audio track from a HTTP URL', s.object(s.props({
  id: s.define('HTTPSourceID', 'Globally Unique ID for HTTP URL', s.string()),
  title: s.string(),
  artist: string(),
  url: s.define('URL', 'Uniform Resource Locator', s.string()),
})));

const audioSource = s.define('AudioSource', 'An audio track', s.taggedUnion({
  'http': s.object(s.props({ http: httpSource })),
  'youtube': s.object(s.props({ youtube: youtubeSource })),
}));

module.exports = {
  youtubeSource,
  httpSource,
  audioSource,
};