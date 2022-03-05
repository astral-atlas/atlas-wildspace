uniform sampler2D map;

varying vec2 vUv;
varying vec2 mapPosition;
flat varying int tileId;

void main() {
  ivec2 mapSize = textureSize(map, 0);

  tileId = gl_VertexID / 4;

  texelFetch(null);

  mapPosition = vec2(
    tileId % mapSize.y,
    tileId / mapSize.y
  );
  
  vec4 tileOffset = texture(map, mapPosition);

  vUv = vec2((uv.x / 4.0), (uv.y / 4.0) + (tileOffset.x));
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}