
// *******************************************
// *******************************************
// **     SCHEDULER AND PREVIEW PANEL       **
// *******************************************

function showPreviewPanel() {
	setElementVisibility($(".previewPanel"), 'visible');
}

function hidePreviewPanel() {
	setElementVisibility($(".previewPanel"), 'hidden');
}

function showScheduler() {
	setElementVisibility($("#scheduler"), 'visible');
}

function hideScheduler() {
	setElementVisibility($("#scheduler"), 'hidden');
}

function setElementVisibility(elem, value) {
	if ( $(elem).css('visibility') != value ){
		$(elem).css({
			'visibility': value
		});
	}
}

function showContainerElements() {
	showScheduler();
	showPreviewPanel();
}

function hideContainerElements() {
	hideScheduler();
	hidePreviewPanel();
}

// ********************************
// ********************************
// ***   CURRENT PROGRAM PANEL  ***
// ********************************

function displayNoneForCurrentProgramPanel() {
	var el = $("#scheduler .currentProgram");
	el[0].style.display = "none";
}

function displayBlockForCurrentProgramPanel() {
	var el = $("#scheduler .currentProgram");
	el[0].style.display = "block";
}


// ********************************
// ********************************
// ****   CURRENT SONG DIV   ******
// ********************************

function displayNoneForCurrentSongDiv() {
	var el = $("#scheduler .currentSong");
	el[0].style.display = "none";
}

function displayBlockForCurrentSongDiv() {
	var el = $("#scheduler .currentSong");
	el[0].style.display = "block";
}

function clearCurrentSongDiv() {
	resetCurrentSongTitle();
	resetCurrentSongArtist();
	hideCurrentSongDiv();
}

function hideCurrentSongDiv() {
	var elem = $("#scheduler .currentSong");
	setElementVisibility($(elem), 'hidden');
}

function showCurrentSongDiv() {
	var elem = $("#scheduler .currentSong");
	setElementVisibility($(elem), 'visible');
}


// ********************************
// ********************************
// ******   SONG TITLE   **********
// ********************************

function getCurrentSongTitle() {
	var currSongTitleDiv = $( "#scheduler .currentSong .songTitle" )[0];	
	return currSongTitleDiv.innerHTML;
}

function resetCurrentSongTitle() {
	setCurrentSongTitle('');
}

function setCurrentSongTitle(songTitle) {
	var currSongTitleDiv = $( "#scheduler .currentSong .songTitle" )[0];
	if (songTitle !== undefined && isTitleAllowed(songTitle.toLowerCase())) {
		currSongTitleDiv.innerHTML = songTitle;	
	} else {
		currSongTitleDiv.innerHTML = "";
	}
}

function isTitleAllowed(title) {
	return !isTitleBlocked(title);
}

function isTitleBlocked(title) {
	if (getBlockedTitles().indexOf(title) != -1)
		return true;
	else 
		return false;
}

function getBlockedTitles() {
	list = ["www.lem.fm", "lem.fm", "lemko rusyn"];
	return list;
}


// ********************************
// ********************************
// ******   SONG ARTIST   *********
// ********************************

function getCurrentArtist() {
	var currArtistDiv = $( "#scheduler .currentSong .artist" )[0];
	return currArtistDiv.innerHTML;
}

function resetCurrentSongArtist() {
	setCurrentSongArtist('');
}

function setCurrentSongArtist(artist) {
	var currArtistDiv = $( "#scheduler .currentSong .artist" )[0]; 
	if (artist !== undefined && isArtistAllowed(artist.toLowerCase())) {
		currArtistDiv.innerHTML = artist;	
	} else {
		currArtistDiv.innerHTML = "";
	}
}

function isArtistAllowed(artist) {
	return !isArtistBlocked(artist);
}

function isArtistBlocked(artist) {
	if (getBlockedArtists().indexOf(artist) != -1)
		return true;
	else 
		return false;
}

// array of artists, who should not be displayed
// lowercase values
function getBlockedArtists() {
	list = ["various artist", "www.lem.fm", "rizhny", "lem.fm", "various"];
	return list;
}

// ********************************
// ********************************
// *********   OTHER   ************
// ********************************

function clearString(str) {
	cleared_str = str.replace(new RegExp('^\\d\+\\.[ ]*'),'');
	str = cleared_str;
	cleared_str = str.replace(new RegExp(" *$"),'');
	return cleared_str;
}

// HH:MM
function isTimeFormatCorrect(ti) {
	if (ti.match(/^[0-9]{1,2}:[0-9]{1,2}$/))
		return true;
	else 
		return false;
}

function isObjectEmpty(obj) {
	for (var key in obj) {
		if (hasOwnProperty.call(obj,key)) return false;
	}
	return true;
}

function getBestPos(text, val) {
	return getMostAdjustValue(findAllPos(' ', text), numOfDisplayedLetters);
}

// get nearest value from array to given val
function getMostAdjustValue(arr, val) {
	var eps = 10;
	var min = val - eps;
	var max = val + eps;
	for (var i=0; i < arr.length; i++) {
		if (doesValueBelongToRange(min, max, arr[i])) {
			return arr[i];
		}
	}
	return val;
}

function doesValueBelongToRange(a, b, val) {
	return ((val < b) && (val > a) || (val < a) && (val > b)) ? true : false;
}

// return all positions of el in text
function findAllPos(el, text) {
	var re = new RegExp(el, "gi");
	var arr = [];
	while ( re.exec(text) ){
		arr.push(re.lastIndex);
	}
	return arr;
}