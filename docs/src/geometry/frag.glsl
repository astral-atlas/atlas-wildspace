uniform sampler2D tiles;
uniform sampler2D map;
uniform float division;

varying vec2 vUv;
varying vec2 mapPosition;
flat varying int tileId;

void main() {
	gl_FragColor = vec4(
    float(tileId) / division,
    0,
    0, 
    0
  );
}