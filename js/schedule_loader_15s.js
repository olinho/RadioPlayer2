var url = 'https://lemfm-lineup-main.radiokitapp.org/api/lineup/v1.0/channel/main/playlist?scope=current-15s';

// list of time descending elements (first newer), 13:05; 13:02; 12:59
var listOfPlayedSongs = [];
var jsonFromLemFm;
var lastSong = {};
var prevMutex = "";

function schedule15sUpdator() {	
	getSchedule();
	setIntervalFunction(getSchedule, 15000);
}

function getSchedule() {
	$.ajax({
		url: url,
		dataType: 'json',
		}).success( function(data) {
			jsonFromLemFm = data;
			var mutex = whatToUpdate();
			if ( mutex == "previewPanel" ){
				if (mutex != prevMutex) {
					ajaxGetUpcomingPrograms();
					prevMutex = mutex;
				}
			} else {
				prevMutex = "";
				updateScheduler(data);	
			}
		});
}

function updateScheduler(data) {
	var currentSong = {};
	var songTitle = parseTitle(data);
	var time = "";
	updatePlayedSongsDiv();
	if (songTitle == undefined) {
		console.log('Song title is undefined.');
		return;
	}
	var artist = parseArtist(data);
	if (artist == undefined){
		return;
	}
	setCurrentSongTitle(songTitle);
	setCurrentSongArtist(artist);

	if (getCurrentSongTitle() !== "") {
		time = parseTime(data);
		currentSong = createSongObj(getCurrentSongTitle(), getCurrentArtist(), time);
		if ( !isObjectEmpty(lastSong) && areSongObjectsDifferent(lastSong,currentSong) ){
			addSongToPlayedSongsList(lastSong);
		}
		displayNoneForCurrentProgramPanel();
		displayBlockForCurrentSongDiv();
		lastSong = currentSong;
	}
	else {
		if ( !isObjectEmpty(lastSong) ) {
			addSongToPlayedSongsList(lastSong);
			lastSong = {};
		}
		displayNoneForCurrentSongDiv();
	}
	

}

function whatToUpdate() {
	if (parseKind(jsonFromLemFm) == "manual" && (parseTitle(jsonFromLemFm) == "") && $("#scheduler .currentSong")[0].style.display=='none' && isObjectEmpty(lastSong))
		return "previewPanel";
	else
		return "scheduler";
}

function areSongObjectsDifferent(songObj1, songObj2) {
	return !areSongObjectsSame(songObj1, songObj2);
}

function areSongObjectsSame(songObj1, songObj2){
	if ((songObj1.title == songObj2.title) && (songObj1.artist == songObj2.artist) && (songObj1.time == songObj2.time))
		return true;
	else
		return false;
}

function updatePlayedSongsDiv() {
	var songsContainerDiv = $("#scheduler .playedSongs .songsContainer")[0];
	var nChildren = countChildrenInPlayedSongsContainer();
	var nPlayedSongs = listOfPlayedSongs.length;

	if (nChildren < nPlayedSongs) {
		for (var i = nChildren+1; i <= nPlayedSongs; i++) {
			var nextSongDiv = createNextSongDiv(i);	
			songsContainerDiv.appendChild(nextSongDiv);
		}
	}
	for (i = 0; i < nChildren; i++) {
		updateNextSongDiv(i);
	}
	if (nChildren > 0) {
		$("#scheduler .playedSongs")[0].style.display='block';
	}
}

// songDivIndx indexed from 1
function updateNextSongDiv(songDivIndx) {
	var songObj = getPlayedSong(songDivIndx);
	var nextSongDiv = $("#scheduler .playedSongs .songsContainer")[0].children[songDivIndx];
	var songTitleDiv = nextSongDiv.getElementsByClassName('songTitle')[0];
	var artistDiv = nextSongDiv.getElementsByClassName('artist')[0];
	var timeDiv = nextSongDiv.getElementsByClassName('time')[0];
	newSongObj = listOfPlayedSongs[songDivIndx];
	songTitleDiv.innerHTML = newSongObj.title;
	artistDiv.innerHTML = newSongObj.artist;
	timeDiv.innerHTML = newSongObj.time;
}

function createNextSongDiv(songIndx) {
	var nextSongDiv = document.createElement('div');
	nextSongDiv.className = "nextSong";
	var songObj = getPlayedSong(songIndx);
	var timeDiv = createTimeDiv(songObj);
	var songDetailsDiv = createArtistAndTitleParentDiv(songObj);
	nextSongDiv.appendChild(timeDiv);
	nextSongDiv.appendChild(songDetailsDiv);
	return nextSongDiv;
}

function countChildrenInPlayedSongsContainer() {
	return $("#scheduler .playedSongs .songsContainer")[0].children.length;
}

function createTimeDiv(arg) {
	if (typeof(arg) == "object") {
		time = arg.time;
	}
	else {
		time = arg;
	}
	var timeDiv = document.createElement('div');
	timeDiv.className = 'time';
	timeDiv.innerHTML = time;
	return timeDiv;
}

function createArtistAndTitleParentDiv(songObj) {
	var songTitleDiv = createSongTitleDiv(songObj);
	var artistDiv = createArtistDiv(songObj);
	var parentDiv = document.createElement('div');
	parentDiv.className = "songDetails";
	parentDiv.appendChild(songTitleDiv);
	parentDiv.appendChild(artistDiv);
	return parentDiv;
}

function createArtistDiv(arg) {
	if (typeof(arg) == "object") {
		artist = arg.artist;
	}
	else {
		artist = arg;
	}
	var artistDiv = document.createElement('div');
	artistDiv.className = 'artist';
	artistDiv.innerHTML = artist;
	return artistDiv;
}

function createSongTitleDiv(arg) {
	if (typeof(arg) == "object") {
		title = arg.title;
	}
	else {
		title = arg;
	}
	var songTitleDiv = document.createElement('div');
	songTitleDiv.className = 'songTitle';
	songTitleDiv.innerHTML = title;
	return songTitleDiv;
}

// indexed from 1
function getPlayedSong(index) {
	return listOfPlayedSongs[index-1];
}

function addSongToPlayedSongsList(p1,p2,p3) {
	var songObj = {};
	if (p2 !== undefined) {
		songObj = createSongObj(p1,p2,p3);
	}
	else {
		songObj = p1;
	}
	if (listOfPlayedSongs.map(x => x.title).indexOf(songObj.title) == -1) {
		listOfPlayedSongs.unshift(songObj);
	}
	while (listOfPlayedSongs.length > 3) {
		listOfPlayedSongs.pop();
	}
}

function createSongObj(p1,p2,p3) {
	return {title:p1, artist:p2, time:p3};
}

function getCurrentSongTitleIndependentOnName() {
	return parseTitle(jsonFromLemFm);
}

function parseTime(json) {
	var track = parseFirstTrack(json);
	var fade_in = track.fade_in_at;
	var start_time = fade_in.substring(11,16);
	if (isTimeFormatCorrect(start_time))
		return start_time;
	else 
		return undefined;
}



function parseKind(json) {
	return json.data.playlist.tracks[0].kind;
}

function parseTitle(json) {
	if (isObjectEmpty(json)) {
		return "";
	}
	var title = parseFileMetadata(json).title;
	console.log('Fetched title: ' + title);
	if (title == undefined)
		return "";
	else
		return clearString(title);
}

function parseArtist(json) {
	var artist = parseFileMetadata(json).artist;
	console.log("Fetched artist: " + artist);
	if (artist == undefined)
		return "";
	else
		return clearString(artist);
}

function parseFileMetadata(json) {
	return json.data.playlist.tracks[0].file.metadata;
}

function parseFileName(json) {
	return json.data.playlist.tracks[0].file.name;
}

function parseFile(json) {
	return parseFirstTrack(json).file;
}

function parseFirstTrack(json) {
	return json.data.playlist.tracks[0];
}



