varying vec2 vUv;

uniform sampler2D texture1;
uniform float time;

void main() {
    vec2 uv = vUv;
    uv.y += sin(uv.x * 10.0 + time * 3.0) * 0.02;

    vec4 color = texture2D(texture1, uv);
    gl_FragColor = color;
}