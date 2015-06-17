var devmode = false;

var canvas, scene, camera, container, sphere_stage, cubeMaterial, sphere, raycaster, orgX, orgY, orgRotX, orgRotY, text_default, text_alt, totalQ, stageName, XML;

var curQ = 1;
var readyForNext = true;

var radius = 3;
var targetOutset = 1;
		
var targets = new Array();
var cubeHolders = new Array();
var alt_textures = new Array();
var gotRight = new Array();
var questions = new Array();
var moveRatio = 1;

function init(e, f){
	$("#" + e).html('<div id="feedbackOverlay" class="overlay" style="display:none;">\
    	<div class="inner"></div>\
    	<button id="dismissFeedback" onclick="feedback()" class="pointer">Try Again</button>\
    </div>\
    <div id="activityOverlay" class="overlay" style="display:none;">\
    	<div class="inner"></div>\
    </div>\
	<canvas id="stage"></canvas>\
    <div id="questionArea">\
    	<div id="curQ"></div>\
    	<div id="question"></div>\
    </div>');
	stageName = "stage";
	$.get(f, function(data) {
		XML = $(data);
		init2();
	});
}
function init2(){
	getDefaults();
	getQuestions();
	canvas = document.getElementById(stageName);
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( 75, $("#" + stageName).parent().width() / $("#" + stageName).parent().height(), 0.1, 1000 );
	container = new THREE.Group();
	testMobile();
	sphere_stage = new THREE.WebGLRenderer({canvas:document.getElementById(stageName)});
		sphere_stage.setSize( $("#" + stageName).width(), $("#" + stageName).height() );
	raycaster = new THREE.Raycaster();
	camera.position.z = 0;
	cubeMaterial = new THREE.MeshBasicMaterial({color:"#0000FF", transparent:!devmode, opacity:0});
	sphere = new THREE.Mesh( new THREE.SphereGeometry(radius, 100, 100), new THREE.MeshBasicMaterial({ map:text_default, side:THREE.BackSide, transparent:devmode, opacity:.5 }));
	
	container.add(sphere);
	totalQ = questions.length;
	for(var i = 1; i <= questions.length; i++){
		if(questions[i-1].type == "find" || questions[i-1].type == "activity"){
			var targetHolder = new THREE.Group();
			targetHolder.rotation.x = degs(questions[i-1].xRot);
			targetHolder.rotation.y = degs(questions[i-1].yRot);
			targetHolder.rotation.z = degs(questions[i-1].zRot);
			var target = new THREE.Mesh( new THREE.BoxGeometry(questions[i-1].targetWidth, questions[i-1].targetHeight, .1), cubeMaterial );
			target.position.z = -radius * targetOutset;
			target.name = questions[i-1].text;
			targetHolder.add(target);
			container.add(targetHolder);
			targets.push(target);
		}
		if(questions[i-1].texture){
			alt_textures.push(THREE.ImageUtils.loadTexture(questions[i-1].texture));
		}else{
			alt_textures.push(text_default);
		}
	}
	scene.add( container );
	stageListeners("add");
	window.addEventListener( 'resize', function(){
		sphere_stage.setSize( $("#" + stageName).parent().width(), $("#" + stageName).parent().height() );
		camera.aspect = $("#" + stageName).width() / $("#" + stageName).height();
		camera.updateProjectionMatrix();
		if(!isRendering) render();
	});
	nextQuestion()
}
function testMobile(){
	if(String(window.navigator.platform).search("Mac") < 0 && String(window.navigator.platform).search("Win") < 0) alert("This web application requires WebGL, which is not supported on many mobile devices. For best results, please use the Chrome desktop browser.") ;
}
function getDefaults(){
	text_default = THREE.ImageUtils.loadTexture(XML.find("defaults").find("texture").text());
}
function getQuestions(){
	XML.find("question").each(function(index, e){
		var ee = $(e);
		var q = new Object();
		if(ee.find("type")) q.type = ee.find("type").text();
		if(ee.find("text")) q.text = ee.find("text").text();
		if(ee.find("activityText")) q.activityText = ee.find("activityText").text();
		if(ee.find("feedback")) q.feedback = ee.find("feedback").text();
		if(ee.find("targetHeight")) q.targetHeight = ee.find("targetHeight").text();
		if(ee.find("targetWidth")) q.targetWidth = ee.find("targetWidth").text();
		if(ee.find("xRot")) q.xRot = ee.find("xRot").text();
		if(ee.find("yRot")) q.yRot = ee.find("yRot").text();
		if(ee.find("zRot")) q.zRot = ee.find("zRot").text();
		if(ee.find("src")) q.src = ee.find("src").text();
		if(ee.find("distractors")){
			var d = new Array();
			$(ee.find("distractors")).children().each(function(f,g){
				d.push($(g).text());
			})
			q.distractors = d;
		}
		if(ee.find("texture")) q.texture = ee.find("texture").text();
		if(ee.find("answer")) q.answer = ee.find("answer").text();
		questions.push(q);
	});
}
function degs(e){
	return e * (Math.PI * 2 / 360);
}
function stageListeners(e){
	if(e == "add"){
		document.getElementById(stageName).addEventListener('mousedown', mouseDown);
		document.getElementById(stageName).addEventListener('touchstart', mouseDown);
		document.getElementById(stageName).addEventListener('mousewheel', scrollZoom);
	}
	if(e == "remove"){
		document.getElementById(stageName).removeEventListener('mousedown', mouseDown);
		document.getElementById(stageName).removeEventListener('touchstart', mouseDown);
		document.getElementById(stageName).removeEventListener('mousewheel', scrollZoom);
	}
}

function scrollZoom(e){
	e.preventDefault();
	if(e.wheelDelta < 0){
		if(camera.position.z < radius * .5) camera.position.z += .25;
	} else {
		if(camera.position.z > -radius * .75) camera.position.z -= .25;
	}
	if(camera.position.z > radius * .5) camera.position.z = radius * .5;
	if(camera.position.z < -radius * .75) camera.position.z = -radius * .75;
	
	if(camera.position.z >= 0) moveRatio = 1;
	if(camera.position.z < 0 && camera.position.z >= -radius * .25) moveRatio = 1.5;
	if(camera.position.z < -radius * .25 && camera.position.z >= -radius * .5) moveRatio = 2;
	if(camera.position.z < -radius * .5 && camera.position.z >= -radius * .7) moveRatio = 3;
	if(camera.position.z < -radius * .7) moveRatio = 4;
	if(!isRendering) render();
}
function mouseDown(e){
	if ( threeDclick(container.children, e).length > 0 ){
		document.addEventListener('mousemove', mouseMove);
		document.addEventListener('touchmove', mouseMove);
		document.addEventListener('mouseup', mouseUp);
		document.addEventListener('touchend', mouseUp);
	}
}
function mouseMove(e){
	e.preventDefault();
	document.removeEventListener('mouseup', mouseUp);
	document.removeEventListener('touchend', mouseUp);
	document.removeEventListener('mousemove', mouseMove);
	document.removeEventListener('touchmove', mouseMove);
	if(e.type == "touchmove"){
		orgX = e.touches[0].clientX;
		orgY = e.touches[0].clientY;
	} else {
		orgX = e.clientX;
		orgY = e.clientY;
	}
	orgRotX = container.rotation.x;
	orgRotY = container.rotation.y;
	document.addEventListener('mousemove', mouseMove2);
	document.addEventListener('touchmove', mouseMove2);
	document.addEventListener('mouseup', mouseUpAlt);
	document.addEventListener('touchend', mouseUpAlt);
}
function mouseMove2(e){
	e.preventDefault();
	document.body.style.cursor = "all-scroll";
	var X, Y;
	if(e.type == "touchmove"){
		X = e.touches[0].clientX;
		Y = e.touches[0].clientY;
	} else {
		X = e.clientX;
		Y = e.clientY;
	}
	container.rotation.y = orgRotY + (orgX - X) / (450 * moveRatio);
	if(container.rotation.x <= Math.PI / 2 && container.rotation.x >= Math.PI / -2) container.rotation.x = orgRotX + (orgY - Y) / (400 * moveRatio);
	if(container.rotation.x > Math.PI / 2) container.rotation.x = Math.PI / 2;
	if(container.rotation.x < Math.PI / -2) container.rotation.x = Math.PI / -2;
	if(!isRendering) render();
}
function mouseUpAlt(e){
	document.body.style.cursor = "auto";
	document.removeEventListener('mousemove', mouseMove2);
	document.removeEventListener('touchmove', mouseMove2);
	document.removeEventListener('mouseup', mouseUpAlt);
	document.removeEventListener('touchend', mouseUpAlt);
}
function mouseUp(e){
	document.removeEventListener('mouseup', mouseUp);
	document.removeEventListener('touchend', mouseUp);
	document.removeEventListener('mousemove', mouseMove);
	document.removeEventListener('touchmove', mouseMove);
	var hits;
	if(questions[curQ-1].type == "find"){
		hits = threeDclick(targets, e)
		if(hits.length > 0){
			var names = new Array();
			for(var i = 0; i < hits.length; i++){
				names.push(hits[i].object.name);
			}
			checkAnswer(names)
		} else {
			wrongAnswer();
		}
	} else if(questions[curQ-1].type == "activity"){
		hits = threeDclick(targets, e)
		if(hits.length > 0){
			var names = new Array();
			for(var i = 0; i < hits.length; i++){
				names.push(hits[i].object.name);
			}
			checkAnswer(names)
		}
	}
}
function threeDclick(e, f){
	var X, Y;
	if(f.type == "touchstart"){
		X = f.touches[0].pageX - document.getElementById(stageName).parentNode.offsetLeft;
		Y = f.touches[0].pageY - document.getElementById(stageName).parentNode.offsetTop;
	} else if(f.type == "touchend"){
		X = f.changedTouches[0].pageX - document.getElementById(stageName).parentNode.offsetLeft;
		Y = f.changedTouches[0].pageY - document.getElementById(stageName).parentNode.offsetTop;
	} else {
		X = f.pageX - document.getElementById(stageName).parentNode.offsetLeft;
		Y = f.pageY - document.getElementById(stageName).parentNode.offsetTop;
	}
	var vector = new THREE.Vector3();
	vector.set( ( X / $("#" + stageName).width()) * 2 - 1, - ( Y / $("#" + stageName).height() ) * 2 + 1, 0.5 );
	vector.unproject( camera );
	raycaster.ray.set( camera.position, vector.sub( camera.position ).normalize() );
	var intersects = raycaster.intersectObjects( e );
	return(intersects);
}
function checkAnswer(e){
	var aaa = false;
	if(questions[curQ-1].type == "find"){
		for(var i = 0; i < e.length ; i++){
			if(e[i] == questions[curQ-1].text){
				correctAnswer();
				aaa = true;
				break;
			}
		}
	} else if(questions[curQ-1].type == "activity"){
		for(var ii = 0; ii < e.length ; ii++){
			if(e[ii] == questions[curQ-1].text){
				launchActivity();
				break;
			}
		}
		aaa = true;
	}
	if(aaa == false){
		wrongAnswer();
	}
}
function checkAnswerMulti(e){
	if(e == questions[curQ-1].answer){
		correctAnswer();
	} else {
		wrongAnswer();
	}
}
function correctAnswer(){
	if(readyForNext){
		curQ++;
		readyForNext = false;
		if(gotRight.length < curQ) gotRight.push(1);
		if(curQ <= questions.length){
			stageListeners("remove");
			$("#question").html("<p class='green--'>Correct! Click here for next question.</p>")
			$("#questionArea").addClass("pointer");
			setTimeout(function(){
				$("#questionArea").click(function(e){
					nextQuestion();
				});
			}, 1);
		} else {
			end();
		}
	}
}
function wrongAnswer(){
	if(gotRight.length < curQ) gotRight.push(0);
	if(questions[curQ-1].feedback){
		feedback("<h2>Incorrect</h2>" + questions[curQ-1].feedback)
	}
}
function nextQuestion(){
	readyForNext = true;
	stageListeners("add");
	$("#activityOverlay").fadeOut(400, function(){
		$("#activityOverlay .inner").html("");
	});
	$("#questionArea").removeClass("inactive");
	$("#questionArea").off();
	$("#questionArea").removeClass("pointer");
	$("#curQ").html("<p>" + curQ + " of " + totalQ + "</p>")
	if(questions[curQ-1].texture){
		sphere.material.map = alt_textures[curQ-1];
	} else {
		sphere.material.map = text_default;
	}
	if(questions[curQ-1].type == "find" || questions[curQ-1].type == "activity"){
		$("#question").html("<p>" + questions[curQ-1].text + "</p>")
	} else if(questions[curQ-1].type == "multiple choice"){
		var html = "<p style='margin-bottom:0px;'>" + questions[curQ-1].text + "</p><ol class='distractors'>";
		for(var i = 1; i <= questions[curQ-1].distractors.length; i++){
			html += "<li onclick='checkAnswerMulti(" + i + ")' class='pointer'>" + questions[curQ-1].distractors[i-1] + "</li>";
		}
		html += "</ol>";
		$("#question").html(html);
	}
	var margins = ($("#questionArea").height() - $("#curQ p").height()) / 2
	$("#curQ p").attr("style", "margin-top:" + margins + "px; margin-bottom:" + margins + "px;");
	render();
}
function end(){
	var totalRight = 0;
	for(var i = 0; i < gotRight.length; i++) totalRight += gotRight[i];
	$("#question").html("<p class='green--'>Finished!</p><p><button onclick='replay()' class='pointer'>Play Again</button></p>");
	$("#curQ").html("<p>Score:</p><p>" + totalRight + " out of " + totalQ + "</p>");
}
function replay(){
	curQ = 1;
	gotRight = new Array();
	nextQuestion();
}
function feedback(e){
	if(e){
		stageListeners("remove");		
		$("#questionArea").addClass("inactive");
		$("#feedbackOverlay .inner").html(e);
		$("#feedbackOverlay").fadeIn();
	} else {
		stageListeners("add");
		$("#feedbackOverlay").fadeOut(400, function(){
			$("#feedbackOverlay .inner").html("");
		});
		$("#questionArea").removeClass("inactive");
	}
}
function launchActivity(){
	stageListeners("remove");
	$("#questionArea").addClass("inactive");
	$("#activityOverlay .inner").html(questions[curQ-1].src);
	$("#activityOverlay").fadeIn();
	$("#question").html("<p>" + questions[curQ-1].activityText + "</p>")
}
function closeActivity(){
	$("#questionArea").removeClass("inactive");
	correctAnswer();
}
var renderingVar;
var isRendering = false;
var ttt = 0;
function render() {
	isRendering = true;
	renderingVar = requestAnimationFrame( render );
	sphere_stage.render( scene, camera );
	if(sphere.material.map.image) ttt++;
	if(ttt > 10){
		cancelAnimationFrame(renderingVar);
		isRendering = false;
		ttt = 0;
	}
}