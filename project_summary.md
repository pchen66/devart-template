# Behind the Painting

## Authors
- Po-Jui (Ray) Chen, https://github.com/pchen66
- Samuel Zwaan, https://github.com/samzw

## Description

When confronted a painting such as a Mondrian, most people will immediately recognize it and at least have partly similar connotations. One such a connotation for instance is that Mondrian paintings show somewhat of a city or city map. What if such connotations could be extended, what if other dimensions could be shown than just the 2D image that can be seen? This project suggests playing with such connotations, dimensions and perspectives in 3D.

Jump into a Mondrian painting and explore the city, re-create it collaboratively and see your work exhibited on the fly in augmented reality. Technology such as the smart phone and Three.js provide ways to interactively explore the world behind the painting and lets viewers reflect, re-create and reconsider their initial interpretation of a painting.


## Link to Prototype
Interactive Demo (require web browser supportng WebGL)

[Behind The Painting](http://www.google.com "Behind The Painting")

## Code Snippet for Painting a Merged Cube

```
function paintBuilding(startindex,cn){
			
  var color = getColorFromNumber(cn);
  
  for(var i=0;i<10;i++){
    Paintings[mainScenePaintingIndex].target.children[0].geometry.faces[startindex+i].vertexColors[0].setHex(color);
    Paintings[mainScenePaintingIndex].target.children[0].geometry.faces[startindex+i].vertexColors[1].setHex(color);
    Paintings[mainScenePaintingIndex].target.children[0].geometry.faces[startindex+i].vertexColors[2].setHex(color);
  }
  
  Paintings[mainScenePaintingIndex].target.children[0].geometry.colorsNeedUpdate = true;
  
  if( Paintings[currentPaintingIndex].status !== 'in' ){
  	updateRenderTexture();
  }
}
```
## Links to External Libraries

[Three.JS](https://github.com/mrdoob/three.js/ "Three.JS")

[Node.JS](http://nodejs.org/ "Node.JS")

[JSARToolKit](https://github.com/kig/JSARToolKit "JSARToolKit")

## Images & Videos

https://www.youtube.com/watch?v=fkVp499_sq0

https://www.youtube.com/watch?v=uyazwky6Pfc
