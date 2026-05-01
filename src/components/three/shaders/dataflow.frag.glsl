uniform float uTime;
uniform vec2 uResolution;

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  float line = 0.0;
  for (int i = 0; i < 8; i++) {
    float fi = float(i);
    float y = fract(uv.y * (3.0 + fi * 0.7) + uTime * (0.02 + fi * 0.008));
    float strength = smoothstep(0.0, 0.002, y) * smoothstep(0.006, 0.002, y);
    float xMask = smoothstep(0.0, 0.3, uv.x) * smoothstep(1.0, 0.7, uv.x);
    line += strength * xMask * 0.06;
  }
  gl_FragColor = vec4(vec3(0.0, 0.83, 1.0) * line, line);
}
