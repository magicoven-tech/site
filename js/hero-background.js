/**
 * Bayer Dithering Background
 * Based on: https://github.com/zavalit/bayer-dithering-webgl-demo
 */

// Shaders
const vertexSrc = `
void main() {
  gl_Position = vec4(position, 1.0);
}
`;

const fragmentSrc = `
precision highp float;

uniform vec3  uColor;
uniform vec2  uResolution;
uniform float uTime;
uniform float uPixelSize;

uniform int   uShapeType;         // 0=square 1=circle 2=tri 3=diamond
const int SHAPE_SQUARE   = 0;
const int SHAPE_CIRCLE   = 1;
const int SHAPE_TRIANGLE = 2;
const int SHAPE_DIAMOND  = 3;

const int   MAX_CLICKS = 50;

uniform vec2  uClickPos  [MAX_CLICKS];
uniform float uClickTimes[MAX_CLICKS];
uniform float uClickScales[MAX_CLICKS]; // 1.0 for click, 0.3 for trail

// Bayer matrix helpers
float Bayer2(vec2 a) {
    a = floor(a);
    return fract(a.x / 2. + a.y * a.y * .75);
}

#define Bayer4(a) (Bayer2(.5*(a))*0.25 + Bayer2(a))
#define Bayer8(a) (Bayer4(.5*(a))*0.25 + Bayer2(a))

#define FBM_OCTAVES     5
#define FBM_LACUNARITY  1.25
#define FBM_GAIN        1.
#define FBM_SCALE       4.0

/* 1-D hash and 3-D value-noise helpers */
float hash11(float n) { return fract(sin(n)*43758.5453); }

float vnoise(vec3 p) {
    vec3 ip = floor(p);
    vec3 fp = fract(p);

    float n000 = hash11(dot(ip + vec3(0.0,0.0,0.0), vec3(1.0,57.0,113.0)));
    float n100 = hash11(dot(ip + vec3(1.0,0.0,0.0), vec3(1.0,57.0,113.0)));
    float n010 = hash11(dot(ip + vec3(0.0,1.0,0.0), vec3(1.0,57.0,113.0)));
    float n110 = hash11(dot(ip + vec3(1.0,1.0,0.0), vec3(1.0,57.0,113.0)));
    float n001 = hash11(dot(ip + vec3(0.0,0.0,1.0), vec3(1.0,57.0,113.0)));
    float n101 = hash11(dot(ip + vec3(1.0,0.0,1.0), vec3(1.0,57.0,113.0)));
    float n011 = hash11(dot(ip + vec3(0.0,1.0,1.0), vec3(1.0,57.0,113.0)));
    float n111 = hash11(dot(ip + vec3(1.0,1.0,1.0), vec3(1.0,57.0,113.0)));

    vec3 w = fp*fp*fp*(fp*(fp*6.0-15.0)+10.0);

    float x00 = mix(n000, n100, w.x);
    float x10 = mix(n010, n110, w.x);
    float x01 = mix(n001, n101, w.x);
    float x11 = mix(n011, n111, w.x);

    float y0  = mix(x00, x10, w.y);
    float y1  = mix(x01, x11, w.y);

    return mix(y0, y1, w.z) * 2.0 - 1.0;
}

float fbm2(vec2 uv, float t) {
    vec3 p   = vec3(uv * FBM_SCALE, t);
    float amp  = 1.;
    float freq = 1.;
    float sum  = 1.;

    for (int i = 0; i < FBM_OCTAVES; ++i) {
        sum  += amp * vnoise(p * freq);
        freq *= FBM_LACUNARITY;
        amp  *= FBM_GAIN;
    }
    
    return sum * 0.5 + 0.5;
}

float maskCircle(vec2 p, float cov) {
    float r = sqrt(cov) * .25;
    float d = length(p - 0.5) - r;
    float aa = 0.5 * fwidth(d);
    return cov * (1.0 - smoothstep(-aa, aa, d * 2.));
}

float maskTriangle(vec2 p, vec2 id, float cov) {
    bool flip = mod(id.x + id.y, 2.0) > 0.5;
    if (flip) p.x = 1.0 - p.x;
    float r = sqrt(cov);
    float d  = p.y - r*(1.0 - p.x);
    float aa = fwidth(d);
    return cov * clamp(0.5 - d/aa, 0.0, 1.0);
}

float maskDiamond(vec2 p, float cov) {
    float r = sqrt(cov) * 0.564;
    return step(abs(p.x - 0.49) + abs(p.y - 0.49), r);
}

void main() {
    float pixelSize = uPixelSize;
    vec2 fragCoord = gl_FragCoord.xy - uResolution * .5;

    // Aspect ratio fix
    float aspectRatio = uResolution.x / uResolution.y;

    vec2 pixelId = floor(fragCoord / pixelSize);
    vec2 pixelUV = fract(fragCoord / pixelSize); 

    float cellPixelSize =  8. * pixelSize; // 8x8 Bayer matrix
    vec2 cellId = floor(fragCoord / cellPixelSize);
    
    vec2 cellCoord = cellId * cellPixelSize;
    
    vec2 uv = cellCoord / uResolution * vec2(aspectRatio, 1.0);

    /* Animated fbm feed */
    float feed = fbm2(uv, uTime * 0.05);
    feed = feed * 0.5 - 0.65; // contrast / brightness

    /* Impact ripples (Clicks & Trail) */
    const float speed     = 0.30;
    const float thickness = 0.10;
    const float dampT     = 1.5; // Slightly faster damping for trail spots
    const float dampR     = 8.0;

    for (int i = 0; i < MAX_CLICKS; ++i) {
        vec2 pos = uClickPos[i];
        if (pos.x < 0.0) continue;

        vec2 cuv = (((pos - uResolution * .5 - cellPixelSize * .5) / (uResolution) )) * vec2(aspectRatio, 1.0);

        float t = max(uTime - uClickTimes[i], 0.0);
        float r = distance(uv, cuv);
        float scale = uClickScales[i];

        // Click vs Trail logic
        // Trail points expand much less and fade faster
        float curSpeed = mix(0.02, speed, step(0.5, scale));
        float waveR = curSpeed * t;
        float curThickness = mix(0.04, thickness, step(0.5, scale));
        
        float ring  = exp(-pow((r - waveR) / curThickness, 2.0));
        float atten = exp(-dampT * t / scale) * exp(-dampR * r);
        
        feed = max(feed, ring * atten * scale);
    }

    float bayer = Bayer8(fragCoord / uPixelSize) - 0.5;
    float bw    = step(0.5, feed + bayer);

    /* Selection Mask */
    float coverage = bw;
    float M;
    if      (uShapeType == SHAPE_CIRCLE)   M = maskCircle (pixelUV, coverage);
    else if (uShapeType == SHAPE_TRIANGLE) M = maskTriangle(pixelUV, pixelId, coverage);
    else if (uShapeType == SHAPE_DIAMOND)  M = maskDiamond(pixelUV, coverage);
    else                                   M = coverage;

    vec3 color = uColor; 
    gl_FragColor = vec4(color, M); 
}
`;

document.addEventListener('DOMContentLoaded', () => {
    const bg = document.getElementById('hero-bg');
    if (!bg) return;

    // Config attributes
    const shapeAttr = bg.getAttribute('data-shape') || 'square';
    const pixelSizeAttr = bg.getAttribute('data-pixel-size') || '4';
    const inkAttr = bg.getAttribute('data-ink') || '#FFFFFF';

    const SHAPE_MAP = {
        square: 0,
        circle: 1,
        triangle: 2,
        diamond: 3,
    };

    // Initialize Three.js
    const canvas = document.createElement('canvas');
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    bg.appendChild(canvas);

    const MAX_CLICKS = 50;
    const uniforms = {
        uResolution: { value: new THREE.Vector2() },
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(inkAttr) },
        uClickPos: { value: Array.from({ length: MAX_CLICKS }, () => new THREE.Vector2(-1, -1)) },
        uClickTimes: { value: new Float32Array(MAX_CLICKS) },
        uClickScales: { value: new Float32Array(MAX_CLICKS) },
        uShapeType: { value: SHAPE_MAP[shapeAttr] || 0 },
        uPixelSize: { value: parseFloat(pixelSizeAttr) || 4 },
    };

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const material = new THREE.ShaderMaterial({
        vertexShader: vertexSrc,
        fragmentShader: fragmentSrc,
        uniforms,
        transparent: true,
    });
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));

    const resize = () => {
        const w = bg.clientWidth;
        const h = bg.clientHeight;
        const dpr = renderer.getPixelRatio();
        renderer.setSize(w, h, false);
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        uniforms.uResolution.value.set(w * dpr, h * dpr);
    };
    window.addEventListener('resize', resize);
    resize();

    const getPhysicalCoords = (x, y) => {
        const rect = canvas.getBoundingClientRect();
        const fx = (x - rect.left) * (canvas.width / rect.width);
        const fy = (rect.height - (y - rect.top)) * (canvas.height / rect.height);
        return { x: fx, y: fy };
    };

    let clickIx = 0;
    const addImpact = (x, y, scale = 1.0) => {
        const coords = getPhysicalCoords(x, y);
        uniforms.uClickPos.value[clickIx].set(coords.x, coords.y);
        uniforms.uClickTimes.value[clickIx] = uniforms.uTime.value;
        uniforms.uClickScales.value[clickIx] = scale;
        clickIx = (clickIx + 1) % MAX_CLICKS;
    };

    // Trail logic
    let lastTrailPos = { x: 0, y: 0 };
    const TRAIL_THRESHOLD = 20; // pixels distance before creating new spot

    const onPointerMove = (x, y) => {
        const dist = Math.hypot(x - lastTrailPos.x, y - lastTrailPos.y);
        if (dist > TRAIL_THRESHOLD) {
            addImpact(x, y, 0.3); // Trail points are smaller
            lastTrailPos = { x, y };
        }
    };

    const heroSection = document.getElementById('hero-section');
    const interactionTarget = heroSection || canvas;

    interactionTarget.addEventListener('pointerdown', e => {
        addImpact(e.clientX, e.clientY, 1.0); // Clicks are full size
    });

    interactionTarget.addEventListener('pointermove', e => {
        onPointerMove(e.clientX, e.clientY);
    });

    const clock = new THREE.Clock();
    (function animate() {
        uniforms.uTime.value = clock.getElapsedTime();
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    })();
});
