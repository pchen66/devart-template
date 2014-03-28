In the 3D city, over 10,000 cubes are rendered at the same time. If we create these cubes without optimization, it drops the frame rate dramastically from 60 to 5 which is impossible to walk in the city. We took the elegant [solution](http://learningthreejs.com/blog/2013/08/02/how-to-do-a-procedural-city-in-100lines/) which merges all separate geometries into one. That really helps a lot on running at 60fps. 

![Real-time Collaborative update](/project_images/20140327_1.png "Real-time Collaborative update")

Selection of each cube becomes cumbersome after merging, because the ray casting can only detect at a face containing 3 vertexs. We want to paint the cube as a whole instead of just a triangle. So we have to do divide the face index by the amount of faces in a cube (not 12 but 10 because we get rid of bottom ones when merging) and get the cube we want. After user paints, a socket event will send to server and broadcast to other users at the same time so that it keeps the world always the same.

We still want the visitor feel like a gallery like enviroment, so we provide each painting with a description card.

![Piet Mondrian](/project_images/20140327_2.png "Piet Mondrian")

![De Stijl](/project_images/20140327_3.png "De Stijl")

![Composition II](/project_images/20140327_4.png "Composition II")

After submiting your own Mondrian, you can view it in the gallery along with all the other users' art works.

![Gallery](/project_images/20140327_5.png "Gallery")
