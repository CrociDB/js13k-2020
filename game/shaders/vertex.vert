#version 300 es

in vec3 in_position;
in vec2 in_uv;

out vec2 out_uv;

void main() {
    out_uv = in_uv;
    gl_Position = vec4(in_position, 1.0);
}
