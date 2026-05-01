uniform float uTime;
uniform vec3 uColor;

void main() {
  float dist = length(gl_PointCoord - vec2(0.5));
  if (dist > 0.5) discard;
  float alpha = 1.0 - smoothstep(0.3, 0.5, dist);
  float pulse = sin(uTime * 2.0 + gl_PointCoord.x * 10.0) * 0.3 + 0.7;
  gl_FragColor = vec4(uColor * pulse, alpha * 0.6);
}
