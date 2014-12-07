#ifdef GL_ES
precision highp float;
#endif

#extension GL_OES_standard_derivatives : enable

varying vec3 f_VertexEc;
varying vec3 f_color;
varying vec3 f_camPos;
varying vec3 f_light1;
varying vec3 f_light2;

varying vec3 f_light1Color;
varying vec3 f_light2Color;

void main()
{
    vec3 X = dFdx(f_VertexEc);
    vec3 Y = dFdy(f_VertexEc);
    vec3 normal=normalize(cross(X,Y));
    
    vec3 light1Direction = normalize(f_VertexEc - f_light1);
    vec3 light2Direction = normalize(f_VertexEc - f_light2);
	
    float light1 = pow(max(0.0, dot(light1Direction, normal)), 1.0);
    float light2 = pow(max(0.0, dot(light2Direction, normal)), 1.0);
    
    //gl_FragColor = vec4(normal, 1.0);
    //gl_FragColor = vec4((light1*f_light1Color+light2*f_light2Color) * f_color, 1.0);
    //gl_FragColor = vec4(f_color,1.0);
	gl_FragColor = vec4((light1*f_light1Color+light2*f_light2Color) * f_color * 0.75 + f_color*0.25, 1.0);
}
    