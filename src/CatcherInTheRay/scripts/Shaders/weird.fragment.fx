precision mediump float;

varying vec3 f_normal;
varying float f_time;

void main()
{
	// just output whatever is in the normal info
	gl_FragColor = vec4(f_normal, 1.0);
}
