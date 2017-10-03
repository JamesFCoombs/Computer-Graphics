Modified and Expanded Scene in WebGL

By James Coombs
For Comp 630 (Computer Graphics) @ Phillips Academy w/ Dr. Miles, period 4
2016-03-01

Program is tested and supported in Google Chrome, and probably works with Firefox,
Internet Explorer, Microsoft Edge, and Safari. Rendering time is negilgable.
To use keyboard commands, click on the image first to draw focus.

--------------------------------------------------------------------------------

PROJECT CONTENTS

Documentation:
 - README.txt : This document.

Original / modified code:
 - main.html : The HTML code that runs the program 
 - scene.js : Does all of the work in the code; creates all shapes, colors, the camera,
              the light, and passes everything into the Graphics Card.

Unmodified helper code:
 - The "Common" folder, stored as "/../Common" :
    - initShaders.js
    - initShaders2.js
    - MV.js
    - webgl-utils.js

Src Files:
 - music.mp3: A music file to provide some nice background music while viewing the scene

--------------------------------------------------------------------------------

  My code does a variety of different tasks, which includes 1) Allow the camera position
to move based on User input, 2) Implement a light source, which has a changeable 
position based on User input, 3) Implement a variety of animations, with changeable
speeds based on user input, and 4) Play music!

  1) Camera Position Change. The first step towards allowing for a moveable camera
was to implement a general case world-to-canonical-view-transform, usable for any
given camera coordinates. Secondly, because the camera would be rotating * around the
xy plane, and then rotating around the plane containing that point and the y-axis,
the camera is best defined by a pair of angles from the point (0,0,R), as opposed
to being defined by a point (x,y,z). I implemented this system, and paired it with
the world-to-canonical-view-transform, then updated the camera transform with this
information every animation tick. Finally, I implemented a Event Listener for Key
Presses, which increased and decreased the camera rotation angles, and the radius R.
*...rotating a distance R around...
  2) Light Source w/ Position Change. I implemented a Light Source coordinate, which
I used in the shader to determine the color of each face, based on the angle between
each face and the light. Then, similarly to the work I did for the camera, I allowed
this light to be defined by two angles from (0,0,4) as opposed to being defined by a
point (x,y,z). I implemented the same Event Listener as I did for the Camera Position
Change, but with different keys. Finally, I drew a cube close to the scene, indicating
where the light source was.
  3) Animation. I created a function animate(), which took advantage of
requestAnimFrame(animate) to re-draw the scene once every 'tick'. This function
has several uses. First of all, it calls handleKeys(), which is what updates all
information based on what keys are currently being pressed. This function then
passes the modified information into the renderer. This function also passes in a 
new transform matrix, which handles the scene's animations. This matrix rotates all
of the shapes in different specific ways, as well as changing the hover distance
of the cube object. This was achieved by having several differnent angles, responsible
for one group transformation type each, which were incremented every time animate()
was called. The rate these angles incrememnted could be modified by User input,
once again by using Key Event Listeners.
  4) Just for fun, I embedded an mp3 player in the HTML, so music is played while
the User enjoys my scene.

  In order to implement these changes, I had to learn about about interpreting key
presses from [1] and [2]. I learned about animating by reading the book code, and from
our in-class lectures. To do this, I had to learn how to focus the window on the canvas,
so that the keypresses are correctly input into the program. I learned how to focus the
window with [3]. I learned how to embedd music with [4].

--------------------------------------------------------------------------------

References:
[1] "Basic Keyboard Input". Online at
    http://developer.playcanvas.com/en/tutorials/beginner/keyboard-input/ .
    Last accessed 2016-2-29.
[2] Giles, "WebGL Lesson 6 – keyboard input and texture filters". Online at
    http://learningwebgl.com/blog/?p=571 . Last accessed 2016-2-29.
[3] "addEventListener for keydown on Canvas". Online at
    http://stackoverflow.com/questions/12886286/addeventlistener-for-keydown-on-canvas .
    Last accessed 2016-2-29.
[4] "how to autoplay a music with html5 embed tag while the player is invisible" Online
    at http://stackoverflow.com/questions/20179190/how-to-autoplay-a-music-with-html5-embed-tag-while-the-player-is-invisible .
    Last accessed 2016-3-1.