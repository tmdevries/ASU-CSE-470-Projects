precision mediump float;

const float INFINITY = 1e9;
const int   MAX_MARCHING_STEPS = 400;

// -------------------------------------------------------------------------

// Camera uniforms
struct Camera
{
	vec3 up;			// Up-vector
	vec3 right;			// Right-vector
	vec3 forward;		// Forward-vector
	vec3 eye;			// Eye position
	float aspectRatio;	// Ratio between screen width and height
	float focalLength;	// Distance between the eye and the image plane
};

uniform Camera uCamera;

// -------------------------------------------------------------------------

struct Light
{
    vec3 position;
    vec3 color;
};

uniform Light uLights[2];

// -------------------------------------------------------------------------

struct Settings
{
	int numberSteps;	// Max number of raymarch steps
	float epsilon;		// Surface threshold
	vec2 resolution;	// Resolution of the view port
};

uniform Settings uSettings;

// -------------------------------------------------------------------------

// DISTANCE FUNCTIONS FOR OBJECTS

// plane
float dPlane( vec3 x )
{
    return x.y;
}

// sphere
float dSphere( vec3 x, vec3 c, float r )
{
	return length( x-c ) - r;
}

// -------------------------------------------------------------------------

struct Dist
{
    int   index;
    float distance;
};

// helper function to find if a new object is closer along a ray than the
// previous one; return the closer object index
Dist closer( Dist current, int index, float t )
{
    if( t <= current.distance )
    {
        current.distance = t;
        current.index    = index;
    }

    return current;
}

// -------------------------------------------------------------------------

// OVERALL SCENE DISTANCE FUNCTION

// return Dist instance of the object closest to the current
// position on the ray
Dist dScene( vec3 p )
{
	Dist hit = Dist( -1, INFINITY );

    hit = closer( hit, 1, dPlane(p) );
    hit = closer( hit, 2, dSphere(p, vec3(-0.5,0.5,0), 0.5) );
    hit = closer( hit, 3, dSphere(p, vec3(0.4,0.4,0), 0.4) );
    hit = closer( hit, 4, dSphere(p, vec3(1.0,1.0,1.0), 0.3) );

    // more objects here ...

	return hit;
}

// use dScene and finite differences to estimate the normal of the object
// at position x
vec3 nScene( in vec3 x )
{
    vec3 n;

    float epsilon = uSettings.epsilon;

    n.x = dScene( x + vec3(epsilon,0,0) ).distance - dScene( x - vec3(epsilon,0,0) ).distance;
    n.y = dScene( x + vec3(0,epsilon,0) ).distance - dScene( x - vec3(0,epsilon,0) ).distance;
    n.z = dScene( x + vec3(0,0,epsilon) ).distance - dScene( x - vec3(0,0,epsilon) ).distance;

    float nl = length(n);

    if( nl > 0.0 )
        n /= nl;

    return n;
}

// -------------------------------------------------------------------------

struct Ray
{
    vec3 o; // origin
    vec3 d; // direction (normalized)
};

// march along a ray using the distance field, until an object is approached
// very closely (ro: ray origin, rd: ray direction)
// returns index -1 if no hit is discovered
Dist raymarch( Ray r )
{
	float t = 0.0;

    for(int j = 0; j < MAX_MARCHING_STEPS; j++)
    {
		// calculate the current position on the ray
		vec3 pos = r.o + r.d * t;

		// get the distance and index of the object closest to position
		Dist result = dScene(pos);

		// if the distance is under the threshold, return the RayHit
		if( result.distance < uSettings.epsilon )
        {
            result.distance += t;
            return result;
        }

		// add the current distance to the raymarch step length
		t += result.distance;
	}

	return Dist( -1, INFINITY );
}

// -------------------------------------------------------------------------

// PHONG LIGHTING

struct LightingProperties 
{
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
    float shininess;
};

uniform LightingProperties uMaterialProperties[6]; 

vec3 getPhongLighting(int index, vec3 poi, vec3 normal) 
{
    vec3 phongLight = vec3(0);
    vec3 lightDirection;
    float diffuseContribution;
    vec3 eyeDirection;
    vec3 reflectionDirection;
    float specularContribution;
    LightingProperties lightProps;
    for (int i = 0; i < 16; i++)
    {
        if (i==index)
            lightProps = uMaterialProperties[i];
    }

    // TARA: run a for loop to obtain contributions from all lights
    for (int i = 0; i < 2; i++) 
    {
        lightDirection = normalize(uLights[i].position - poi);
        
        // Diffuse
        diffuseContribution = max(dot(normal, lightDirection), 0.0);

        // Specular
        eyeDirection = normalize(uCamera.eye-poi); // depends on direction of camera
        reflectionDirection = reflect(-lightDirection, normal);
        specularContribution = pow(max(dot(reflectionDirection, eyeDirection), 0.0), lightProps.shininess);

        // Final lighting
        phongLight += uLights[i].color*(lightProps.diffuse * diffuseContribution + lightProps.specular * specularContribution);
    }

    return phongLight + lightProps.ambient;
}

// -------------------------------------------------------------------------

// helper function to obtain the ray direction of the ray going through
// the pixel this shader instance is called for
Ray getRayForCurrentPixel()
{
    // compute normalized viewport coordinates
    vec2 pixelCoord = -1.0 + 2.0*(gl_FragCoord.xy / uSettings.resolution);

	// set ray direction
	return Ray( uCamera.eye, normalize( uCamera.forward * uCamera.focalLength +
                                        uCamera.right * pixelCoord.x * uCamera.aspectRatio +
                                        uCamera.up * pixelCoord.y) );
}

// main raytracing loop, automatically called for each viewport pixel
void main(void)
{
	// compute initial (primary) ray origin and direction
	Ray r = getRayForCurrentPixel();

    vec3 finalColor = vec3(0,0,0);

	// determine the closest object hit along the ray
	Dist hit = raymarch( r );

    // if an object was hit, add light reflected from it
    // to overall light along the current ray
    if( hit.index != -1 )
    {
        vec3 pos = r.o + r.d * hit.distance; // TARA: point of intersection
        vec3 nrm = nScene( pos );

        vec3 Cd = vec3(0);

        // based upon the index of the object hit,
        // set material properties (for now only diffuse color Cd)
        if( hit.index == 1 )
        {
            // the plane shall have a checkerboard pattern
            float f = mod( floor(2.0*pos.z) + floor(2.0*pos.x), 2.0);

            Cd = vec3( 0.8 + 0.1*f*vec3(1.0) );
        }
        else if( hit.index == 2 )
        {
            // this sphere shall be "ruby"
            Cd = getPhongLighting( 0, pos, nrm );
        }
        else if( hit.index == 3 )
        {
            // this sphere shall be "pearl"
            Cd = getPhongLighting(3, pos, nrm);
        }
        else if( hit.index == 4 )
        {
            // last one is "gold"
            Cd = getPhongLighting(1, pos, nrm);
        }

        // add light to overall color
        finalColor += Cd;
    }

	// output pixel color
    gl_FragColor = vec4( finalColor, 1.0 );
}