Painting = function(width, height){
	
	this.width = width;
	this.height = height;
	
	//Painting Canvas
	var geometry = new THREE.CubeGeometry(width,height,2);
	geometry.dynamic = false;
	
	var borderMaterial = new THREE.MeshPhongMaterial({color: 0x000000, emissive: 0x3F3F3F});
	var cubefaceArray = [borderMaterial,borderMaterial,borderMaterial,borderMaterial,new THREE.MeshPhongMaterial({emissive: 0x9F9F9F}), borderMaterial];

	var materials = new THREE.MeshFaceMaterial( cubefaceArray );
	
	this.canvas = new THREE.Mesh( geometry, materials );
	this.canvas.name = 'Mondrian';
	this.canvas.category = 'Painting';
	
	//status of painting in or out
	this.status = 'out';
	
	//Painting Lighting
	this.addPointLight(this.canvas,0,50,100,0xffffff,0.9,800);
	
	//generate multiple render target for orth camera
	this.createRenderTargets( this.width, this.height );
	
	return this;
};

Painting.prototype.firstPaintingSetup = function(data){

	//Behind Painting Initialization
	this.camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.01, 3000 );
	this.scene = new THREE.Scene();

	//generate corresponding scene
	this.createPaintingScene( data );
	
	//utilities
	this.dir = new THREE.Vector3();
	this.time;
	this.raycaster = new THREE.Raycaster();
	this.raycaster.far = 30;
	this.downDir = new THREE.Vector3(0,-1,0);

}

Painting.prototype.addPointLight = function(canvas, x, y, z, hex, intensity, distance){
	var pointLight = new THREE.PointLight(hex, intensity, distance);
	pointLight.position.set(x, y, z);
	canvas.add( pointLight );
}

Painting.prototype.createRenderTargets = function(w,h){
	
	this.orthcamera = new THREE.OrthographicCamera( -w/2,w/2, h/2, -h/2, 0.01, 3000 );
	this.orthcamera.position.set(100*Math.random()-50, 100, 100*Math.random()-50);
	this.orthcamera.rotation.x = -Math.PI/2;
	
	//Scene Texture for Painting
	this.renderTarget = new THREE.WebGLRenderTarget( 1024, 1024 );
	
}

Painting.prototype.createPaintingScene = function(data){	
	
		//Camera Initialization
		this.camera.position.y = 0;
		this.camera.fov = 60;
		this.camera.updateProjectionMatrix();
		
		//Controls and Rays
		this.initPointerLockAPI();
		this.controls = new THREE.PointerLockControls( this.camera );
		this.controls.parent = this;
		this.scene.add( this.controls.getObject() );
		
		//Player
		this.player = {};
		/*this.player.entity = new THREE.Mesh(new THREE.CubeGeometry(1,0.5,1), new THREE.MeshNormalMaterial());
		this.player.entity.position.set(0,-0.6,-0.5);
		this.controls.pitchObject.add(this.player.entity);*/
		this.player.color;
		var colorRandom = Math.random();
		var sqaure = document.getElementById('colorSquare'), slogan = document.getElementById('colorSquareText');
		if( colorRandom < 0.16)	{this.player.color = 1; sqaure.style.background='#ffcc00'; slogan.textContent = 'Yellow Power';}
		else if(colorRandom >= 0.16 && colorRandom < 0.32 )	{this.player.color = 2; sqaure.style.background='#fe0000'; slogan.textContent = 'Run for Red';}
		else if( colorRandom >= 0.32 && colorRandom < 0.48 ) {this.player.color = 3; sqaure.style.background='#0f1176'; slogan.textContent = 'Blue Rules';}
		else{ this.player.color = 0; sqaure.style.background='#ffffff'; slogan.textContent = 'Pure White'; slogan.style.color = '#000';}
		
		//fog
		this.scene.fog = new THREE.FogExp2(0xffffff, 0.0055);
		
		//City Ground
		this.target = new THREE.Mesh(new THREE.PlaneGeometry(5000,5000), new THREE.MeshBasicMaterial({color: 0x000000}));
		this.target.geometry.dynamic = false;
		this.target.rotation.x = -Math.PI/2;
		this.scene.add( this.target );

		//City Light
		var plight = new THREE.PointLight(0xffffff, 0.8);
		plight.position = this.controls.yawObject.position;
		this.scene.add(plight);
		
		var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
		directionalLight.position.set( 0, 1, 0 );
		this.scene.add( directionalLight );
		
		//information of shared world from database
		var DBTABLES = JSON.parse(data.table);
		var DBMERGEDXY = JSON.parse(data.merge);
		var DBCOLORXY = JSON.parse(data.color);

		//City Building
		this.buildings = [];
		var ROWCOUNT = DBTABLES.length, COLUMNCOUNT = DBTABLES.length, SPACEWIDTH = 2;
		var rows = [], columns = [];
		var totalRowSpace = ROWCOUNT*SPACEWIDTH, totalColumnSpace = COLUMNCOUNT*SPACEWIDTH;
		var mergedXY = DBMERGEDXY, colorXY = DBCOLORXY;
		
		for(var i=0;i<DBTABLES.length;i++){
			rows.push(DBTABLES[i].x);
			columns.push(DBTABLES[i].y);
			totalRowSpace+=DBTABLES[i].x;
			totalColumnSpace+=DBTABLES[i].y;
		}

		/*for(var i=0;i<ROWCOUNT+1;i++){
			//var space = parseInt(Math.random()*totalRowSpace*0.5);
			var space = parseInt(totalRowSpace/(ROWCOUNT+1-i)+(Math.random()-0.5)*totalRowSpace/3);
			if( space < SPACEWIDTH ) space = SPACEWIDTH+3
			if(i == ROWCOUNT)	space = totalRowSpace;
			rows.push(space);
			totalRowSpace -= space; 
		}
		for(var i=0;i<COLUMNCOUNT+1;i++){
			//var space = parseInt(Math.random()*totalColumnSpace*0.5);
			var space = parseInt(totalColumnSpace/(COLUMNCOUNT+1-i)+(Math.random()-0.5)*totalColumnSpace/3);
			if( space < SPACEWIDTH ) space = SPACEWIDTH+3
			if(i == COLUMNCOUNT)	space = totalColumnSpace;
			columns.push(space);
			totalColumnSpace -= space; 
		}*/
		var cityGeometry = new THREE.Geometry();
		
		// build the base geometry for each building
		var geometry = new THREE.CubeGeometry( 1, 1, 1 );
		
		// no need bottom
		geometry.faces.splice( 10, 2 );		

		// buildMesh
		var buildingMesh= new THREE.Mesh( geometry );
		
		var PosX = -totalRowSpace/2, PosY = totalColumnSpace/2, wireframeMaterial = new THREE.LineBasicMaterial({color: 0x000000});
		var BuildingCounter = 0;
		for(var i=0;i<ROWCOUNT+1;i++){
			for(var j=0;j<COLUMNCOUNT+1;j++){
				
				//Check if merged before
				var isDuplicate = false, isSkip = false;
				for(var k=0;k<mergedXY.length;k++){
					if(mergedXY[k][0] == (i+1) && mergedXY[k][1] == j){
						isDuplicate = true;
					}
					else if(mergedXY[k][0] == i && mergedXY[k][1] == j){
						isSkip = true;
					}
				}
				if(isSkip) {					
					PosY -= (columns[j]+SPACEWIDTH);
					continue;
				};

				var cube, cubeMaterial = new THREE.MeshBasicMaterial({color: 0xffffff, wireframe: false});
				
				//color of building
				/*var colorRandom = Math.random(), vColor = new THREE.Color();
				if( colorRandom < 0.08)	{vColor.setHex(0xffcc00); colorRandom=1}
				else if(colorRandom >= 0.08 && colorRandom < 0.16 )	{vColor.setHex(0xfe0000); colorRandom=2;}
				else if( colorRandom >= 0.16 && colorRandom < 0.24 ) {vColor.setHex(0x0f1176); colorRandom=3;}
				else {colorRandom = 0;}*/
				
				//colorXY.push(colorRandom);
				
				//height of building
				var heightRandom = 10*Math.random()+2;
				
				//building merge
				if( isDuplicate && i < ROWCOUNT ){
					//cube = new THREE.Mesh( new THREE.CubeGeometry(rows[i]+SPACEWIDTH+rows[i+1],columns[j], heightRandom), cubeMaterial);
					buildingMesh.scale.set((rows[i]+SPACEWIDTH+rows[i+1]),columns[j], heightRandom/2);
					//mergedXY.push([i+1,j]);
					buildingMesh.position.set((rows[i]+SPACEWIDTH+rows[i+1])/2+PosX, -columns[j]/2+PosY, heightRandom/4+0.001);				
				}
				else{
					//cube = new THREE.Mesh( new THREE.CubeGeometry(rows[i],columns[j],heightRandom), cubeMaterial);
					buildingMesh.scale.set((rows[i]),columns[j], heightRandom/2);
					buildingMesh.position.set(rows[i]/2+PosX, -columns[j]/2+PosY, heightRandom/4+0.001);		
				}	

				//arrangement
				PosY -= (columns[j]+SPACEWIDTH);
				
				var geometry = buildingMesh.geometry;   
				var vColor = new THREE.Color(0xffffff);
				if(colorXY[BuildingCounter] == 1) vColor.setHex(YELLOW);
				else if(colorXY[BuildingCounter] == 2) vColor.setHex(RED);
				else if(colorXY[BuildingCounter] == 3) vColor.setHex(BLUE);
					
				  for ( var m = 0, ml = geometry.faces.length; m < ml; m ++ ) {
					 // set face.vertexColors on root face
					 
					 geometry.faces[ m ].vertexColors = [ vColor, vColor, vColor ];
				  }
				
				BuildingCounter++;
				
				//disable dynamic geometry
				THREE.GeometryUtils.merge( cityGeometry, buildingMesh );
			}
			PosX += (rows[i]+SPACEWIDTH);
			PosY = totalColumnSpace/2;
		}
		
		cityGeometry.computeBoundingSphere();
		cityGeometry.boundingSphere.radius = (totalRowSpace>totalColumnSpace) ? totalRowSpace/2 : totalColumnSpace/2;	//boundSphere bug with radius = nan
		
		var city = new THREE.Mesh(cityGeometry, new THREE.MeshLambertMaterial({vertexColors : THREE.VertexColors})); 

		this.target.add(city);
			
}

Painting.prototype.initPointerLockAPI = function(){
	
	var blocker = document.getElementById( 'blocker' );
	var instructions = document.getElementById( 'instructions' );
	var back = document.getElementById('backToGallery');

	var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

	if ( havePointerLock ) {

		var element = document.body;

		var pointerlockchange = function ( event ) {

			if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {

				Paintings[mainScenePaintingIndex].controls.enabled = true;

				blocker.style.display = 'none';
				
				document.addEventListener( 'click', Paintings[mainScenePaintingIndex].onMouseClick, false );

			} else {

				Paintings[mainScenePaintingIndex].controls.enabled = false;

				blocker.style.display = '-webkit-box';
				blocker.style.display = '-moz-box';
				blocker.style.display = 'box';

				instructions.style.display = '';
				
				document.removeEventListener( 'click', Paintings[mainScenePaintingIndex].onMouseClick, false );

			}

		}

		var pointerlockerror = function ( event ) {

			instructions.style.display = '';

		}

		// Hook pointer lock state change events
		document.addEventListener( 'pointerlockchange', pointerlockchange, false );
		document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
		document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );

		document.addEventListener( 'pointerlockerror', pointerlockerror, false );
		document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
		document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );

		back.addEventListener( 'click', function(){	
			
			blocker.style.display = 'none';
			Paintings[currentPaintingIndex].status = 'out';
			
			//reset camera position
			Paintings[mainScenePaintingIndex].controls.yawObject.position.set(0, 60, 3);
			Paintings[mainScenePaintingIndex].controls.yawObject.rotation.set(0, 0, 0);
			Paintings[mainScenePaintingIndex].controls.pitchObject.rotation.set( -Math.PI/2, 0, 0);
			
			//update painting texture
			updateRenderTexture();
			
			//show the save button
			if(document.getElementById('savePainting').style.display != 'block')
				document.getElementById('savePainting').style.display = 'block';
			if(document.getElementById('showUserPaintings').style.display != 'block')
				document.getElementById('showUserPaintings').style.display = 'block';
			
			//tween back camera
			onBackToGallery();
		}, false );
		
		instructions.addEventListener( 'click', function ( event ) {

			instructions.style.display = 'none';

			// Ask the browser to lock the pointer
			element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;

			if ( /Firefox/i.test( navigator.userAgent ) ) {

				var fullscreenchange = function ( event ) {

					if ( document.fullscreenElement === element || document.mozFullscreenElement === element || document.mozFullScreenElement === element ) {

						document.removeEventListener( 'fullscreenchange', fullscreenchange );
						document.removeEventListener( 'mozfullscreenchange', fullscreenchange );

						element.requestPointerLock();
					}

				}

				document.addEventListener( 'fullscreenchange', fullscreenchange, false );
				document.addEventListener( 'mozfullscreenchange', fullscreenchange, false );

				element.requestFullscreen = element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;

				element.requestFullscreen();

			} else {

				element.requestPointerLock();

			}

		}, false );

	} else {

		instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';

	}
}

Painting.prototype.onMouseClick = function(event){

	if(!document.body.requestPointerLock)
		return;

	var _this = Paintings[mainScenePaintingIndex];

	event.preventDefault();
	
	_this.controls.getDirection(_this.dir);	
	raycaster.set( _this.controls.yawObject.position, _this.dir );
	
	var intersects = raycaster.intersectObjects( _this.target.children );
	
	if ( intersects.length > 0 ) {
		var startFaceIndex = intersects[ 0 ].faceIndex-intersects[ 0 ].faceIndex%10;
		paintBuilding(startFaceIndex, _this.player.color);
		socket.emit('colorUpdate', {index: startFaceIndex, color: _this.player.color});
	}					
}

Painting.prototype.initSceneStart = function(){ 

	var _this = Paintings[mainScenePaintingIndex];

	if( _this.canvas.name === 'Mondrian'){
		
		//Tween camera inside painting
		new TWEEN.Tween( _this.controls.yawObject.position )
		.to({y: 15}, 3000)
		.easing( TWEEN.Easing.Bounce.Out)
		.onComplete( function(){ 
			//Tween Camera to look with an angle, not completely facing down
			new TWEEN.Tween( _this.controls.pitchObject.rotation )
			.to({x: -Math.PI/8}, 1000)
			.easing( TWEEN.Easing.Exponential.Out)
			.onComplete( function(){
				document.getElementById('blocker').style.display = 'inline'; 
			})
			.start();
		})
		.start();	
		
		//Switch to render scene inside painting
		new TWEEN.Tween( this )
		.to({}, 100)
		.onComplete( function(){
			Paintings[currentPaintingIndex].status = 'in'; 
		})
		.start();
	}
}

Painting.prototype.update = function(){
	
	var _this = Paintings[mainScenePaintingIndex];

	if( _this.controls && _this.raycaster){
		
		_this.controls.isOnObject( false );

		_this.raycaster.set( _this.controls.yawObject.position, _this.downDir );

		var intersections = _this.raycaster.intersectObject( _this.target.children[0] );

		if ( intersections.length > 0 ) {
			if ( intersections[ 0 ].distance > 0 && intersections[ 0 ].distance < 10 ) {
				_this.controls.isOnObject( true );
			}
		}
		_this.controls.update( Date.now() - _this.time  );
	}
}

