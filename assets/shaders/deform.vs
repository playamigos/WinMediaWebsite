varying vec2 vUv;

uniform float time;

void main() {
    vUv = uv;
    vec3 pos = position;

    float wave = sin(pos.x * 10.0 + time * 2.0) * 0.05;
    pos.z += wave;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}