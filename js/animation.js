
function loadAnimatedButtonsFromPlayer() {
	var el;
	try {
		el = getJQueryElementFromSVGdocument("playIcon");
	} catch (err){
		console.log("Error loadAnimatedButtonsFromPlayer " + err);
		window.setTimeout(loadAnimatedButtonsFromPlayer, 1000);
	}
	
	if (el === undefined) {
		console.log('wait');
		window.setTimeout(loadAnimatedButtonsFromPlayer, 1000);
	}
	else {
		animateEllipse();
		addPlayTriangle();
		animateElementInPlayButtonEllipse('playTriangle');
		setOnClickPlayTriangle();
		sliderFunc();
		changePlayTriangleToPauseRect();
	}
}


function sliderFunc() {
	$( function() {
    $( "#slider-horizontal" ).slider({
      orientation: "horizontal",
      range: "min",
      min: 0,
      max: 100,
      value: 80,
      slide: function( event, ui ) {
        $( "#amount" ).val( ui.value );
        window.player.volume = ui.value/100;
      }
    });
   });
	
}

function animateEllipse() {
	playEllipse = getJQueryElementFromSVGdocument("playEllipse");
	$(playEllipse).hover(function() {
  $(playEllipse).stop().css({'stroke': 'white', 'transition': 'stroke 1.5s'});
  }, function() {
  	$(playEllipse).stop().animate({'stroke-dashoffset': 900 }, 1000).css({'stroke': '#888', 'transition': 'stroke 1s'});
  });
}

function animateElementInPlayButtonEllipse(elementId) {
	var element = getElementByIdFromSVG(elementId);
	playEllipse = getJQueryElementFromSVGdocument("playEllipse");
	$(playEllipse).hover(function() {
	  $(element).stop().css({'stroke': '#ddd', 'transition': 'stroke 1.5s'});
	  }, function() {
  		$(element).css("stroke", "#aaa");
  });	
  $(element).hover(function() {
	  $(element).stop().css({'stroke': '#ddd', 'transition': 'stroke 1.5s'});
	  $(playEllipse).stop().css({'stroke': 'white', 'transition': 'stroke 1.5s'});
	  }, function() {
	  	$(element).css("stroke", "#aaa");
	  	$(playEllipse).stop().css({'stroke': '#aaa', 'transition': 'stroke 1s'});
  });
}


function endAnimateKropka() {
	$("#lemFmLogo").attr("src", "images/lem_fm_logo_4.png");
	window.setTimeout(function() {$("body").find("#svgUpper")[0].remove();}, 100);
}

function changePauseRectToPlayTriangle() {
	var triangle = createPlayTriangle();
	var playG = getPlayIcon();
	removePauseRect();
	playG.appendChild(triangle);
	setOnClickPlayTriangle();
	animateElementInPlayButtonEllipse('playTriangle');
	pauseRadio();
}

function changePlayTriangleToPauseRect() {
	var rect = createPauseRect();
	var playG = getPlayIcon();
	removePlayTriangle();
	playG.appendChild(rect);
	setOnClickPauseRect();
	animateElementInPlayButtonEllipse('pauseRect');
	playRadio();
}

function createPlayTriangle() {
	var svgns = "http://www.w3.org/2000/svg";
	var triangle = document.createElementNS(svgns, 'polygon');
	triangle.setAttributeNS(null, 'points', "27,20 27,60 65,40");
	triangle.setAttributeNS(null, 'fill', '#bbbbbb');
	triangle.setAttributeNS(null, 'stroke-width', '1.0');
	triangle.setAttributeNS(null, 'stroke', '#333');
	triangle.setAttributeNS(null, 'id', 'playTriangle');
	return triangle;
}

function createPauseRect() {
	var svgns = "http://www.w3.org/2000/svg";
	var rect = document.createElementNS(svgns, 'rect');
	rect.setAttributeNS(null, 'x', 27);
	rect.setAttributeNS(null, 'y', 27);
	rect.setAttributeNS(null, 'height', 26);
	rect.setAttributeNS(null, 'width', 26);
	rect.setAttributeNS(null, 'fill', '#bbbbbb');
	rect.setAttributeNS(null, 'stroke-width', '1.0');
	rect.setAttributeNS(null, 'stroke', '#333');
	rect.setAttributeNS(null, 'id', 'pauseRect');
	return rect;
}


function setOnClickPauseRect() {
	var playG = getPlayIcon();
	playG.onclick = function() {
		return null;
	};
	playG.onclick = function() {
		playG.title = "Грай";
		changePauseRectToPlayTriangle();
	}
}

function setOnClickPlayTriangle() {
	var playG = getPlayIcon();
	playG.onclick = function() {
		return null;
	};
	playG.onclick = function() {
		playG.title = "Затримай";
		changePlayTriangleToPauseRect();
	}
}

function playRadio() {
	window.player.volume = $("#slider-horizontal").slider("value")/100;
	window.player.play();
}

function pauseRadio() {
	window.player.pause();
}


function addPlayTriangle() {
	var playTriangle = createPlayTriangle();
	var playG = getPlayIcon();
	playG.appendChild(playTriangle);
}

function addPauseRect() {
	var pauseRect = createPauseRect();
	var playG = getPlayIcon();
	playG.appendChild(pauseRect);
}

function removePauseRect() {
	getPlayIcon().querySelector('#pauseRect').remove();
}

function removePlayTriangle() {
	getPlayIcon().querySelector('#playTriangle').remove();
}



function getPlayIcon() {
	return getElementByIdFromSVG('playIcon');
}

function adjustPlayIcon() {
	resizePlayIcon(0.8);
}

function resizePlayIcon(scale) {
	playIconId = 'playIcon';
	resizeSvg(playIconId, scale);
}

function resizeSvg(elemId, scale) {
	svgElement = getElementByIdFromSVG(elemId);
	$(svgElement).css('transform', 'scale('+scale+')');
}

function setCssForSvgElement(elemId, cssProperties) {
	svgElement = getElementByIdFromSVG(elemId);
	$(svgElement).css(cssProperties);
}

function getElementByIdFromSVG(elemId) {
	var svgElement = getSvgByEmbedId('playButtonId').getElementById(elemId);
	return svgElement;	
}

function getSvgByEmbedId(svgId) {
	return document.getElementById(svgId).getSVGDocument();
}

// list in format {at1: val1, at2: val2, ...}
// example
//setListOfAttributesForSvgElement('playEllipse', {'stroke': '#ddd', 'transition': 'stroke 1.5s'})
function setListOfAttributesForSvgElement(elementId, list) {
	element = getJQueryElementFromSVGdocument(elementId);
	element.css(list);
}

function setAttributeForSvgElement(elementId, attribute, value) {
	element = getJQueryElementFromSVGdocument(elementId);
	element.css(attribute, value);
}

function getJQueryElementFromSVGdocument(elementId) {
	element = $(document.getElementById('playButtonId').getSVGDocument().getElementById('playIcon')).find("#"+elementId);
	return element;
}

function getDOMelementFromSVGdocument(elementId) {
	element = document.getElementById('playButtonId').getSVGDocument().getElementById('playIcon').querySelector("#"+elementId);
	return element;
}