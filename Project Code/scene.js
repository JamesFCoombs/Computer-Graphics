/*
Solution file for HW7: WebGL
Comp 630 W'16 - Computer Graphics
Phillips Academy
2016-2-19

By James Coombs
*/

// PHONG LIGHTING:
// http://voxelent.com/html/beginners-guide/chapter_3/ch3_Sphere_Phong.html

// KEY PRESS:
// http://developer.playcanvas.com/en/tutorials/beginner/keyboard-input/
// http://learningwebgl.com/blog/?p=571

// FOCUS WINDOW:
// http://stackoverflow.com/questions/12886286/addeventlistener-for-keydown-on-canvas

//
//  SOME USEFUL GLOBAL VARIABLES
//

// The canvas
var canvas;

// The list of keys that are currently being held down.
var keysPressed = {};

// The identidy transform.
var idTransform = mat4(1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1);

// The angle defining the Light Source's XZ coordinates from (0,0,4), in radians.
var lightTheta = 0;
// The angle defining the Light Source's Y coordinate from the XZ plane, in radians.
var lightPhi = 0;

// The angle defining the camera's XZ coordinates from (0,0,4), in radians.
var camTheta = 0;
// The angle defining the camera's Y coordinate from the XZ plane, in radians.
var camPhi = 0;
// The distance of the camera from (0,0,0).
var camRadius = 4;
// The rate at which camRadius changes, based off of user input.
// This value increases the longer the appropriate key is held down, accelerating the
// change of rate process.
var camAccelerate = 0.01;

// The angle which defines the cube in it's rotation cycle, in degrees.
var cubeTheta = 0;
// The rate at which cubeTheta changes every tick, in degrees.
var cubeRate = 2.0;
// The rate at which cubeRate changes, based off of user input (also in degrees).
// This value increases the longer the appropriate key is held down, accelerating the
// change of rate process.
var cubeAccelerate = 0.01;

// The 'angle' which defines the cube's levitation height, in a sinosoidal pattern, in degrees.
var height = 0;
// The rate at which height changes every tick, in degrees.
var heightRate = 2.0;
// The rate at which heightRate changes, based off of user input (also in degrees).
// This value increases the longer the appropriate key is held down, accelerating the
// change of rate process.
var heightAccelerate = 0.01;

// The angle which defines the pedastal in it's rotatin cycle, in degrees.
var pyrTheta = 0;
// The rate at which pyrTheta changes every tick, in degrees.
var pyrRate = 2.0 / 7;
// The rate at which pyrRate changes, based off of user input (also in degrees).
// This value increases the longer the appropriate key is held down, accelerating the
// change of rate process.
var pyrAccelerate = 0.01;

// Information for CUBE (x1)
var cubeData = cube();
var verts = cubeData.verts;
var tris = cubeData.tris;
var normals = cubeData.normals;
var face_colors = cubeData.face_colors;
cubeData = faceToVertProperties(verts,tris,normals,face_colors);
var cubeVerts = cubeData.verts;
var cubeTris = cubeData.tris;
var cubeNormals = cubeData.normals;
var cubeVert_colors = cubeData.vert_colors;
var cubeTransform = mat4(1,0,0,0, 0,1,0,0.3, 0,0,1,0, 0,0,0,1);

// The color for the illuminated face of the spotlight.
var sunVert_colors = [vec4(1,1,0,1)];

// Information for OCTAHEDRON (x6)
var octData = octahedron();
verts = octData.verts;
tris = octData.tris;
normals = octData.normals;
face_colors = octData.face_colors;
octData = faceToVertProperties(verts,tris,normals,face_colors);
var octVerts = octData.verts;
var octTris = octData.tris;
var octNormals = octData.normals;
var octVert_colors = octData.vert_colors;
var octTransform1 = mat4(0.5,0,0,0.5, 0,0.5,0,0.3, 0,0,0.5,0, 0,0,0,1);
var octTransform2 = mat4(0.5,0,0,-0.5, 0,0.5,0,0.3, 0,0,0.5,0, 0,0,0,1);
var octTransform3 = mat4(0.5,0,0,0, 0,0.5,0,0.8, 0,0,0.5,0, 0,0,0,1);
var octTransform4 = mat4(0.5,0,0,0, 0,0.5,0,-0.2, 0,0,0.5,0, 0,0,0,1);
var octTransform5 = mat4(0.5,0,0,0, 0,0.5,0,0.3, 0,0,0.5,0.5, 0,0,0,1);
var octTransform6 = mat4(0.5,0,0,0, 0,0.5,0,0.3, 0,0,0.5,-0.5, 0,0,0,1);

// Information for PYRAMID SLICE (x1)
var pyrData = pyramidSlice();
verts = pyrData.verts;
tris = pyrData.tris;
normals = pyrData.normals;
face_colors = pyrData.face_colors;
pyrData = faceToVertProperties(verts,tris,normals,face_colors);
var pyrVerts = pyrData.verts;
var pyrTris = pyrData.tris;
var pyrNormals = pyrData.normals;
var pyrVert_colors = pyrData.vert_colors;
var pyrTransform = mat4(3,0,0,0,  0,0,0.5,-0.85,  0,-3,0,0,  0,0,0,1);

// Global variables that can't be filled until the window is initialized.
// These variables all link WebGl / the canvas with this JS program.
var program;
var cubeBuffer;
var sunBuffer;
var octBuffer1;
var octBuffer2;
var octBuffer3;
var octBuffer4;
var octBuffer5;
var octBuffer6;
var pyrBuffer;
var cameraTransformation;
var lightVector;

// The function called when the window is loaded. Prepares the program to run.
window.onload = function init() {
    // Assign the drawing surface, or 'canvas' referene
    canvas = document.getElementById( "gl-canvas" );

    // Prepeare the gl reference using the canvas reference.
    gl = WebGLUtils.setupWebGL( canvas );
    // If this fails, alert the user.
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //canvas.addEventListener('mousedown', function(event) {lastDownTarget = event.target;}, false);
    canvas.addEventListener('keydown', handleKeyDown, false);
    canvas.addEventListener('keyup', handleKeyUp, false);

    // Fill in the colors for ALL vertices of the spotlight.
    for (i = 0; i < 35; i++) {
      sunVert_colors.push(sunVert_colors[0]);
    }

    // Create buffers to link to.
    cubeBuffer = gl.createBuffer();
    sunBuffer = gl.createBuffer();

    octBuffer1 = gl.createBuffer();
    octBuffer2 = gl.createBuffer();
    octBuffer3 = gl.createBuffer();
    octBuffer4 = gl.createBuffer();
    octBuffer5 = gl.createBuffer();
    octBuffer6 = gl.createBuffer();

    pyrBuffer = gl.createBuffer();

    //
    //  Configure WebGL
    //

    // Set the viewport's dimensions to equal that of the canvas.
    gl.viewport( 0, 0, canvas.width, canvas.height );

    // Clear the background color.
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    // Depth testing / z-buffering
    gl.enable(gl.DEPTH_TEST);

    // Set the 'forward' direction.
    gl.clearDepth(-1.0);
    gl.depthFunc(gl.GREATER);

    // Initialize and use vertex-shader and fragment-shader
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Hook the camera transformation
    cameraTransformation = gl.getUniformLocation(
             program, "u_camera");

    // Hook the light location.
    lightVector = gl.getUniformLocation( program, "vLight");

    // Clear the color and depth.
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Draw the scene!
    animate();
};

// Buffers and draws the shape defined.
function render (verts, tris, normals, vert_colors, transform, vertexBuffer) {

  // Hook the transformation with the uniform in the HTML file.
  var xFormationLocation = gl.getUniformLocation(
           program, "u_xFormation");

  // Buffer the vertices
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(flatten(verts)), gl.STATIC_DRAW);

  // Buffer the indices
  var indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(flatten(tris)), gl.STATIC_DRAW);

  // Buffer the normals
  var nBuffer = gl.createBuffer();
  gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer );
  gl.bufferData( gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW );

  // Bind the normals to the appropriate attribute in the HTML file
  var vNormal = gl.getAttribLocation( program, "vNormal" );
  gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
  gl.enableVertexAttribArray( vNormal );

  // Buffer the colors
  var cBuffer = gl.createBuffer();
  gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
  gl.bufferData( gl.ARRAY_BUFFER, flatten(vert_colors), gl.STATIC_DRAW );

  // Bind the colors to the appropriate attribute in the HTML file
  var vColors = gl.getAttribLocation( program, "vColor" );
  gl.vertexAttribPointer( vColors, 4, gl.FLOAT, false, 0, 0 );
  gl.enableVertexAttribArray( vColors );

  // Buffer the transform
  gl.uniformMatrix4fv(xFormationLocation, false, flatten(transform));

  // Rebind the buffer to the vertices of the shape
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

  // Bind the vertices to the appropriate attribute in the HTML file
  var vPosition = gl.getAttribLocation( program, "vPosition" );
  gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
  gl.enableVertexAttribArray( vPosition );

  // And draw it!
  gl.drawElements(gl.TRIANGLES, flatten(tris).length, gl.UNSIGNED_SHORT, 0 );

}

// Animates all shapes, using global variables.
function animate() {
  // Update information based off of what keys are currently being pressed.
  handleKeys();

  // Buffer the camera transfomation based on the camera's current location.
  gl.uniformMatrix4fv(cameraTransformation, false, flatten(
    determineCameraTransform(
      vec4(camRadius*Math.sin(camTheta)*Math.cos(camPhi),
           camRadius*Math.sin(camPhi),
           camRadius*Math.cos(camTheta)*Math.cos(camPhi),
           1),
      vec4(0,1,0,1))));

  // Buffer the light source's current location for shading purposes.
  gl.uniform4fv( lightVector, new Float32Array(flatten(vec4(
                     4*Math.sin(lightTheta)*Math.cos(lightPhi),
                     4*Math.sin(lightPhi),
                     4*Math.cos(lightTheta)*Math.cos(lightPhi),
                     1))));

  // Update each shape's animation.
  cubeTheta = cubeTheta + cubeRate;
  height = height + heightRate;
  pyrTheta = pyrTheta + pyrRate;

  // Change degrees to radians.
  radTheta = radians ( cubeTheta );
  radHeight = radians ( height );

  // Hook and update the animation vector, based on cubeTheta and height.
  var rotateVector = gl.getUniformLocation( program, "u_rotate");
  gl.uniformMatrix4fv( rotateVector, false, new Float32Array(flatten(mat4(
    Math.cos(radTheta),0,-Math.sin(radTheta),0, 0,1,0,(1/6)*Math.sin(radHeight), Math.sin(radTheta),0,Math.cos(radTheta),0, 0,0,0,1
  ))));

  // Clear the screen.
  gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Render each shape in the cube object
  render(cubeVerts, cubeTris, cubeNormals,
      cubeVert_colors, cubeTransform, cubeBuffer);
  render(octVerts, octTris, octNormals,
       octVert_colors, octTransform1, octBuffer1);
  render(octVerts, octTris, octNormals,
       octVert_colors, octTransform2, octBuffer2);
  render(octVerts, octTris, octNormals,
       octVert_colors, octTransform3, octBuffer3);
  render(octVerts, octTris, octNormals,
       octVert_colors, octTransform4, octBuffer4);
  render(octVerts, octTris, octNormals,
       octVert_colors, octTransform5, octBuffer5);
  render(octVerts, octTris, octNormals,
       octVert_colors, octTransform6, octBuffer6);

  // Change degrees to radians.
  radTheta = radians ( pyrTheta );

  // Update the animation vector, based on pyrTheta.
  gl.uniformMatrix4fv( rotateVector, false, new Float32Array(flatten(mat4(
    Math.cos(radTheta),0,Math.sin(radTheta),0, 0,1,0,0, -Math.sin(radTheta),0,Math.cos(radTheta),0, 0,0,0,1
  ))));

  // Render the pedastal.
  render(pyrVerts, pyrTris, pyrNormals,
       pyrVert_colors, pyrTransform, pyrBuffer);

  // Update the animation vector, based on the spotlight's current position.
  gl.uniformMatrix4fv( rotateVector, false, new Float32Array(flatten(idTransform)));
  sunTransform = mat4(0.1,0,0,1.1*Math.sin(lightTheta)*Math.cos(lightPhi),
                      0,0.1,0,1.1*Math.sin(lightPhi),
                      0,0,0.1,1.1*Math.cos(lightTheta)*Math.cos(lightPhi),
                      0,0,0,1);
  // Change the position of the light, so it illuminates the faces of the spotlight
  // that are 'giving off light'
  gl.uniform4fv( lightVector, new Float32Array(flatten(vec4(
                      -4*Math.sin(lightTheta)*Math.cos(lightPhi),
                      -4*Math.sin(lightPhi),
                      -4*Math.cos(lightTheta)*Math.cos(lightPhi),
                      1))));

  // Render the spotlight.
  render(cubeVerts, cubeTris, cubeNormals,
       sunVert_colors, sunTransform, cubeBuffer);

  // Call this method again after a short delay to animate this scene.
  requestAnimFrame (animate);
}

// Based on the keys that are currently pressed down, update the camera, light
// source, and animation speeds.
function handleKeys() {

  // CAMERA POSITION

  // Left arrow key -- Rotate left
  if (keysPressed[37]) {
    camTheta -= 0.01;
  }
  // Right arrow key -- Rotate right
  if (keysPressed[39]) {
    camTheta += 0.01;
  }
  // Up arrow key -- Rotate up (and avoid gimblelock)
  if (keysPressed[38] && camPhi < 1) {
    camPhi += 0.01;
  }
  // Down arrow key -- Rotate down (and avoid gimblelock)
  if (keysPressed[40]  && camPhi > -0.2) {
    camPhi -= 0.01;
  }
  // Page up -- Zooms the camera in
  if (keysPressed[33] && camRadius > 2) {
    camRadius -= camAccelerate;
    camAccelerate += 0.01;
  }
  // Page down -- Zooms the camera out
  if (keysPressed[34] && camRadius < 95) {
    camRadius += camAccelerate;
    camAccelerate += 0.01;
  }

  // LIGHT POSITION

  // A -- Rotate left
  if (keysPressed[65]) {
    lightTheta -= 0.01;
  }
  // D -- Rotate right
  if (keysPressed[68]) {
    lightTheta += 0.01;
  }
  // W -- Rotate up (and avoid gimblelock)
  if (keysPressed[87] && lightPhi < 1) {
    lightPhi += 0.01;
  }
  // S -- Rotate down (and avoid gimblelock)
  if (keysPressed[83] && lightPhi > -0.5) {
    lightPhi -= 0.01;
  }

  // ANIMATION SPEEDS

  // Comma ( , ) -- Rotate speed increase to the left for the cube object
  if (keysPressed[188]) {
    cubeRate += cubeAccelerate;
    cubeAccelerate += 0.001;
  }
  // Period ( . )  -- Rotate speed increase to the right for the cube object
  if (keysPressed[190]) {
    cubeRate -= cubeAccelerate;
    cubeAccelerate += 0.001;
  }
  // Semi-Colon ( ; ) -- Levitate rate of change increased for the cube object
  if (keysPressed[186]) {
    heightRate += heightAccelerate;
    heightAccelerate += 0.001;
  }
  // Single Quote ( ' ) -- Levitate rate of Change decreased for the cube object
  if (keysPressed[222] && heightRate > 0) {
    heightRate -= heightAccelerate;
    heightAccelerate += 0.001;
  }
  // Open Bracket ( [ )  -- Rotate speed increase to the left for the pedastal
  if (keysPressed[219]) {
    pyrRate -= pyrAccelerate;
    pyrAccelerate += 0.001;
  }
  // Close Bracket ( ] )  -- Rotate speed increase to the right for the pedastal
  if (keysPressed[221]) {
    pyrRate += pyrAccelerate;
    pyrAccelerate += 0.001;
  }

}

// When a key is pressed down, add it to the list of currently pressed keys.
function handleKeyDown(event) {
  keysPressed[event.keyCode] = true;
  // Disable the defeault effect of this key press (ie down arrow doesn't scroll down)
  event.preventDefault();
}

// When a key is released, remove it from the list of currently pressed keys.
function handleKeyUp(event) {
  keysPressed[event.keyCode] = false;

  // If the key released affected the animation speeds, reset the change acceleration
  // value.
  if (event.keyCode == 219 || event.keyCod == 221) {
    pyrAccelerate = 0.01;
  }
  if (event.keyCode == 186 || event.keyCod == 222) {
    heightAccelerate = 0.01;
  }
  if (event.keyCode == 188 || event.keyCod == 190) {
    cubeAccelerate = 0.01;
  }
  if (event.keyCode == 33 || event.keyCode == 34) {
    camAccelerate = 0.01;
  }
}

// Given a camera location, and a direction designated as up, generate a
// world to canonical view transform.
function determineCameraTransform(camLoc, up) {

  // Perspective Normalization
  far = 100;
  near = 0.01;
  var Sx = 1 / Math.tan(Math.PI/8);
  var Sy = 1 / Math.tan(Math.PI/8);
  var alpha = ((far + near) / (far - near));
  var beta = -2 * near * far / (near - far);
  var perspectiveNormalizationXform = mat4(Sx,0,0,0,
                                       0,Sy,0,0,
                                       0,0,alpha,beta,
                                       0,0,-1,0);

  // Translate To Origin
  var translateToOriginXform =mat4(1,0,0,-camLoc[0],
                                   0,1,0,-camLoc[1],
                                   0,0,1,-camLoc[2],
                                   0,0,0,1);

  // Rotate Align transform
  var z = normalize(camLoc);
  var x = normalize(cross(up, z));
  var y = normalize(cross(z, x));
  var rotateAlignXform = mat4(x[0],x[1],x[2],0,
                          y[0],y[1],y[2],0,
                          z[0],z[1],z[2],0,
                          0,0,0,1);

  // World to Camera Centric
  var worldToCameraCentricXform = mult(rotateAlignXform, translateToOriginXform);

  // World To Canonical View Xform
  return mult(perspectiveNormalizationXform, worldToCameraCentricXform);
}

// A method to calculate normal vectors, given verts and tris.
function calculateNormals(verts,tris) {
  var normals = [];
  for (i = 0; i < flatten(tris).length/3; i++) {
    normals.push(normalize(vec4(cross(
              subtract(verts[tris[i][1]], verts[tris[i][0]]),
              subtract(verts[tris[i][2]], verts[tris[i][0]])),0)));
  }
  return normals;
}

// Apply a transformation to the given vertices.
function applyXForm(xForm,verts) {
  var newVerts = [];
  for (i = 0; i < verts.length; i++) {
    newVerts.push(vec4(
                      (xForm[0][0]*verts[i][0] +
                       xForm[0][1]*verts[i][1] +
                       xForm[0][2]*verts[i][2] +
                       xForm[0][3]*verts[i][3]),

                      (xForm[1][0]*verts[i][0] +
                       xForm[1][1]*verts[i][1] +
                       xForm[1][2]*verts[i][2] +
                       xForm[1][3]*verts[i][3]),

                      (xForm[2][0]*verts[i][0] +
                       xForm[2][1]*verts[i][1] +
                       xForm[2][2]*verts[i][2] +
                       xForm[2][3]*verts[i][3]),

                      (xForm[3][0]*verts[i][0] +
                       xForm[3][1]*verts[i][1] +
                       xForm[3][2]*verts[i][2] +
                       xForm[3][3]*verts[i][3])
                     ));
  }
  return newVerts;
}

// Returns the verts, tris, normals, and face_colors for a half-unit cube.
function cube() {

  var half = 0.5
  var verts = [vec4(-half,-half,-half,1),
           vec4(half,-half,-half,1),
           vec4(half,half,-half,1),
           vec4(-half,half,-half,1),
           vec4(-half,-half,half,1),
           vec4(half,-half,half,1),
           vec4(half,half,half,1),
           vec4(-half,half,half,1)];

  var tris = [
    [1,0,2], //Bottom
    [3,2,0],
    [0,1,5], //Sides
    [5,4,0],
    [1,2,6],
    [6,5,1],
    [2,3,7],
    [7,6,2],
    [3,0,4],
    [4,7,3],
    [4,5,6], //Top
    [6,7,4]
  ];

  var colors = [vec4(1.0,0,0,1),
                vec4(1.0,0,0,1),

                vec4(0,1.0,0,1),
                vec4(0,1.0,0,1),

                vec4(0,0,1.0,1),
                vec4(0,0,1.0,1),

                vec4(0.5,0.5,0,1),
                vec4(0.5,0.5,0,1),

                vec4(0,0.5,0.5,1),
                vec4(0,0.5,0.5,1),

                vec4(0.5,0,0.5,1),
                vec4(0.5,0,0.5,1)];

  var normals = calculateNormals(verts,tris);

  return {
    verts: verts,
    tris: tris,
    normals: normals,
    face_colors: colors
  };
}

// Returns the verts, tris, normals, and face_colors for a half-unit octahedron.
function octahedron() {

    // Set up convinient variables
    var half = 0.5;

    // Hard code all the points on the octahedron.
    verts = [vec4(0,0,half,1),
             vec4(half,0,0,1),
             vec4(0,half,0,1),
             vec4(-half,0,0,1),
             vec4(0,-half,0,1),
             vec4(0,0,-half,1)];

    // Establish a triangle tris for the octahedron.
    tris = [
      [0,1,2],
      [0,2,3],
      [0,3,4],
      [0,4,1],
      [5,2,1],
      [5,3,2],
      [5,4,3],
      [5,1,4],
    ];

    face_colors = [
      vec4(0.8,0.1,0.5,1),
      vec4(0.9,0.6,0.2,1),
      vec4(half,0.7,half,1),
      vec4(1,0,1,1),
      vec4(0,half,0,1),
      vec4(half,0,0,1),
      vec4(0,0,half,1),
      vec4(half,0,half,1),
    ];

    var normals = calculateNormals(verts,tris);


  return {
    verts: verts,
    tris: tris,
    normals: normals,
    face_colors: face_colors
  };
}


// Returns the verts, tris, normals, and face_colors for a half-unit pyramid slice.
function pyramidSlice() {

    // Set up convinient variables
    var half = 0.5;
    var quart = 0.25;

    // Hard code all the points on the octahedron.
    verts = [vec4(quart,0,quart,1),
             vec4(0,quart,quart,1),
             vec4(-quart,0,quart,1),
             vec4(0,-quart,quart,1),
             vec4(half,0,0,1),
             vec4(0,half,0,1),
             vec4(-half,0,0,1),
             vec4(0,-half,0,1)
           ];

    // Establish a triangle tris for the octahedron.
    tris = [
      [0,1,2],  //Top
      [0,2,3],

      [0,4,5], //Sides
      [5,1,0],
      [1,5,6],
      [6,2,1],
      [2,6,7],
      [7,3,2],
      [3,7,4],
      [4,0,3],

      [6,5,4],  //Bottom
      [7,6,4]
    ];

    face_colors = [
      vec4(0.1,0.3,0.3,1),
      vec4(0.1,0.3,0.3,1),
      vec4(0.1,0.3,0.3,1),
      vec4(0.1,0.3,0.3,1),
      vec4(0.1,0.3,0.3,1),
      vec4(0.1,0.3,0.3,1),
      vec4(0.1,0.3,0.3,1),
      vec4(0.1,0.3,0.3,1),
      vec4(0.1,0.3,0.3,1),
      vec4(0.1,0.3,0.3,1),
      vec4(0.1,0.3,0.3,1),
      vec4(0.1,0.3,0.3,1),
    ];

    var normals = calculateNormals(verts,tris);


  return {
    verts: verts,
    tris: tris,
    normals: normals,
    face_colors: face_colors
  };
}

// Returns a 'fixed' version of verts, tris, and face_colors so colors are
// associated with the vertices instead of the faces.
function faceToVertProperties(verts,tris,normals,colors) {
  var newVerts = [];
  var newTris = [];
  var newNormals = [];
  var vert_colors = [];
  for (i = 0; i < tris.length; i++) {
    newVerts.push(verts[tris[i][0]],verts[tris[i][1]],verts[tris[i][2]]);
    newTris.push(i*3, i*3+1, i*3+2);
    newNormals.push(normals[i], normals[i], normals[i]);
    vert_colors.push(colors[i], colors[i], colors[i]);
  }
  return {
    verts: newVerts,
    tris: newTris,
    normals: newNormals,
    vert_colors: vert_colors
  };
}
