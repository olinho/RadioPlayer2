

window.onload = function () {
	loadPageBasicElements();
	startingPageLoadService();
	setTimeout(pageRefresher, 2000);
	showContainerElements();
	playerRefresher();
}

// if another person is mounted then change site content
function startingPageLoadService() {
	updateAutomatMountedStatus();
	setTimeout(function() {
		if (isAutomatMounted == 1) { 
			loadPageElementsForAutomatMounted();
		}
		else { 
			previewsUpdator();
			refreshCurrentProgramPanelBasedOnHandMadeSchedule();
		}	
	}, 2000);
}

function pageRefresher() {
	updateAutomatMountedStatus();
	setTimeout(refreshPage, 2000);
	setTimeout(function() {
		pageRefresher();
	}, 10000);
}

function refreshPage() {
	console.log("RefreshingPage. isAutomatMountedStatus: prev=" + prevIsAutomatMounted + "; now=" + isAutomatMounted);
	if (isAutomatMounted != prevIsAutomatMounted) {
		if (isAutomatMounted == 1) {
			showCurrentSongDiv();
			loadPageElementsForAutomatMounted();
		}
		else if (isAutomatMounted == 0) {
			clearIntervalFunctions();
			previewsUpdator();
			refreshCurrentProgramPanelBasedOnHandMadeSchedule();
		}
	}
	else {
		if (isAutomatMounted == 0) {
			refreshCurrentProgramPanelBasedOnHandMadeSchedule();
		}
	}
}

function automatMountedRefresher() {
	updateAutomatMountedStatus();
	setTimeout(function() {
		automatMountedRefresher();
	}, 10000);
}

function updateAutomatMountedStatus() {
	$.ajax({
		url: "php/isAutomatMounted.php",
		success: function(data) {
			prevIsAutomatMounted = isAutomatMounted;
			isAutomatMounted = data;
		}
	});
}

// run when somebody is mounted, not automat
function setPageEmergencyContent() {
	loadPageBasicElements();
	hideContainerElements();
	console.log('setPageEmergencyContent');
}

function setPageDefaultContent() {
	loadPageBasicElements();
	loadPageElementsForAutomatMounted();
	showContainerElements();
	console.log('setPageDefaultContent');
}

function loadPageElementsForAutomatMounted() {
	schedule15sUpdator();
	window.setTimeout(previewsUpdator, 2000);
	window.setTimeout(currentProgramUpdator, 2000);
}

function loadPageBasicElements() {
	ajaxLoadingPageContentOnStart();
	$("body").removeClass("preload");
	prevMutex = "";
	window.setTimeout(loadAnimatedButtonsFromPlayer, 500);
}

// *** player refresher to rerun player when networkStatus is changed ***
function playerRefresher() {
	setInterval(function() {
		var audio = $('audio').get(0);
		if ( audio.networkState == 2 ){
			return;
		} else {
			audio.load();
			audio.play();	
			console.log('Audio player is refreshed.');
		}
		
	}, 10000);
}