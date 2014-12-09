attribute vec3 vertex;
attribute vec3 normal;
attribute vec2 uv1;
attribute vec4 tangent;

uniform mat4 _mv; // model-view matrix
uniform mat4 _mvProj; // model-view-projection matrix
uniform mat3 _norm; // normal matrix
uniform float _time; // time in seconds

varying vec2 uv;
varying vec3 n;
varying float time;

void main(void) {
	// compute position
	gl_Position = _mvProj * vec4(vertex, 1.0);

	time = _time;
	// compute light info
	vec3 nm = vec3((1.2+sin(_time/1000.0))*normal.x, (cos(_time/980.0)+1.1)*normal.y, (sin(cos(time/555.0))+1.0)*normal.z);
	//n = normalize(_norm * nm);
	n = nm;
}