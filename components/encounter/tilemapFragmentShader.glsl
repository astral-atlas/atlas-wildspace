uniform vec4 tint;
varying highp vec2 vUv;
uniform highp sampler2D map;
uniform vec2 tilesSize;
uniform highp sampler2D tiles;


void main() {
  vec2 mapSize = vec2(textureSize(map, 0));

  vec2 mapPos = vec2(
    floor(vUv.x * mapSize.x) / mapSize.x,
    floor(vUv.y * mapSize.y) / mapSize.y
  );

  vec2 tileOffset = texture(map, mapPos + vec2(0.5/mapSize.x, 0.5/mapSize.y)).xy * 255.0;

  vec2 localUV = vec2(
    mod(vUv.x * mapSize.x, 1.0),
    1.0 - mod(vUv.y * mapSize.y, 1.0)
  );
  vec2 tilesUV = (localUV / tilesSize)
    + vec2(tileOffset.x/tilesSize.x, (1.0 - (1.0/tilesSize.y)) - (tileOffset.y/tilesSize.y));
  
  vec4 color = texture(tiles, tilesUV);

  //gl_FragColor = vec4((localUV * tilesSize), 0, 1);
  //gl_FragColor = vec4(tilesUV, 1, 1);
  //gl_FragColor = vec4(localUV, 0, 1);
  //gl_FragColor = vec4(tileOffset / 2.0, 1, 1);
  //gl_FragColor = vec4(mapPos, 0, 1);
  //gl_FragColor = vec4(tileOffset.x / mapSize.x, tileOffset.y / mapSize.y, 1, 1);
  gl_FragColor = color * tint;

}