precision mediump float;

// Attributes
attribute vec3 position;
attribute vec3 color;

// Uniforms
uniform mat4 worldViewProjection;
uniform mat4 worldView;
uniform mat4 world;
uniform vec3 cameraPosition;
uniform vec3 light1Position;
uniform vec3 light1Color;
uniform vec3 light2Position;
uniform vec3 light2Color;

varying vec3 f_VertexEc;
varying vec3 f_color;
varying vec3 f_camPos;
varying vec3 f_light1;
varying vec3 f_light1Color;
varying vec3 f_light2;
varying vec3 f_light2Color;

void main(void) {
	f_light1 = (worldView * vec4(light1Position, 1.0)).xyz;
	f_light1Color = light1Color;
	
	f_light2 = (worldView * vec4(light2Position, 1.0)).xyz;
	f_light2Color = light2Color;
	
	f_color = color;
	f_camPos = (worldView * vec4(cameraPosition, 1.0)).xyz;
	f_VertexEc = (world * vec4(position, 1.0)).xyz;
	
    gl_Position = worldViewProjection * vec4(position, 1.0);
}