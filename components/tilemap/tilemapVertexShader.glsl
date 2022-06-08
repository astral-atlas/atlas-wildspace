varying highp vec2 vUv;
varying vec4 vColor;

void main() {
	vColor = vec4( 1.0 ) * color;
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}