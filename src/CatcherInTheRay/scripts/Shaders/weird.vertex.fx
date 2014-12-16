// Attributes
attribute vec3 position;
attribute vec3 normal;

uniform mat4 worldView; // model-view matrix
uniform mat4 worldViewProjection; // model-view-projection matrix
uniform mat4 world;
uniform vec3 cameraPosition;
uniform float time;

varying vec3 f_normal;
varying float f_time;

void main(void) {
	// compute position
	gl_Position = worldViewProjection * vec4(position, 1.0);

	float pos_length = length(gl_Position)/50.0;
	//best:
	// rotate colors by time, normal dependently
	vec3 nm = vec3(
		sin(time + normal.x + pos_length)*sin(time + normal.x + pos_length),
		cos(time + normal.y + pos_length / 2.0)*cos(time + normal.y + pos_length / 2.0),
		sin(cos(time + normal.z + pos_length / 3.0)*sin(cos(time + normal.z + pos_length / 3.0)))
		);

	f_time = time;
	f_normal = normalize(nm);
}