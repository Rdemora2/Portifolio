uniform float uTime;
uniform vec2 uMouse;
uniform vec3 uColor;
varying vec3 vNormal;
varying vec3 vPosition;

float fresnel(vec3 normal, vec3 viewDir, float power) {
  return pow(1.0 - abs(dot(normal, viewDir)), power);
}

void main() {
  vec3 viewDir = normalize(cameraPosition - vPosition);
  float fresnelFactor = fresnel(vNormal, viewDir, 2.5);
  vec3 baseColor = uColor * 0.1;
  vec3 glowColor = uColor * fresnelFactor * 1.5;
  float pulse = sin(uTime * 0.8) * 0.5 + 0.5;
  gl_FragColor = vec4(baseColor + glowColor * (0.7 + pulse * 0.3), fresnelFactor * 0.9);
}
