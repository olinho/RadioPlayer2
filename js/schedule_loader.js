var mainChannelScheduleUrl = "https://lemfm-lineup-main.radiokitapp.org/api/lineup/v1.0/channel/main/playlist";
var resp = [];
var nUpcomingProgramsJSON = {};

function fetchPlanAsJson() {
	var request = new XMLHttpRequest();
	request.open("GET", mainChannelScheduleUrl);
	request.responseType = "json";
	request.send();
	request.onload = function() {
		resp = request.response;
	}
}

// get metadata (details) about file
function getMetadataForFile(file_id) {
	var request = new XMLHttpRequest();
	var url = "https://lemfm-vault.radiokitapp.org/api/rest/v1.0/data/record/file?a[]=metadata&c[id][]=eq%20";
	url = url + file_id;
	request.open("GET", url);
	request.responseType = "json";
	request.setRequestHeader("Accept", "application/json");
	request.setRequestHeader("Authorization", "Bearer lemfm");
	request.send();
	request.onload = function() {
		meta = request.response;
	}
}

function refreshProgramPreview() {
	console.log('Refreshing program preview');	
	ajaxGetNUpcomingProgramsFromHandMadeSchedule();
	window.setTimeout(updatePreviewPanel, 2000);
	window.setTimeout(createCurrentProgramPanel, 2000);
}

function handMadeScheduleUpdator() {
	console.log("handMadeScheduleUpdator");
	ajaxGetNUpcomingProgramsFromHandMadeSchedule();
	setInterval(ajaxGetNUpcomingProgramsFromHandMadeSchedule, 600000);
}

function previewsUpdator() {
	ajaxGetNUpcomingProgramsFromHandMadeSchedule();
	window.setTimeout(updatePreviewPanel, 500);
	setInterval(updatePreviewPanel, 600000);
	setInterval(createCurrentProgramPanel, 60000);
}


function getCurrentProgram() {
	return nUpcomingProgramsJSON.programs[0];
}

function getProgramsExceptOfMusicProgram(programArr) {
	return programArr.filter(x => x.name != "музычні");
}

function filterTomorrowPrograms(programArr) {
	return programArr.filter(x => x.when == "tomorrow");
}

function filterTodayPrograms(programArr) {
	return programArr.filter(x => x.when == "today");
}

function getProgramsExceptOfTheFirst() {
	return nUpcomingProgramsJSON.programs.slice(1);
}

function updatePreviewPanel() {
	clearTomorrowPartOfPreviewPanel();
	clearTodayPartOfPreviewPanel();
	updateNthPreview(1);
	updateNthPreview(2);
	updateNthPreview(3);
	numToday = getNumberOfPreviewsInTodayPartOfPreviewPanel();
	if (numToday > 0){
		showTodayPartOfPreviewPanel();
	}
	numTomorrow = getNumberOfPreviewsInTomorrowPartOfPreviewPanel();
	if (numTomorrow > 0){
		showTomorrowPartOfPreviewPanel();
	}
	console.log("previewPanel was updated");
}

function isTodayCellEmpty(rowN,colN){
	var row = getTodayCell(rowN,colN);
	if (removeBlankSpaces(row.text()) == ""){
		return true;
	} else {
		return false;
	}
}

function numOfFreeSlotsInTodayPart() {
	return getNumberOfRowsInTodayPartOfPreviewPanel() - getNumberOfPreviewsInTodayPartOfPreviewPanel();
}

function updateFirstPreview() {
	updateNthPreview(1);
}

function updateNthPreview(n) {
	if (isEmpty(nUpcomingProgramsJSON)) {
		console.log('No upcoming programs...');
		return;
	}
	var tailPrograms = getTail(nUpcomingProgramsJSON.programs);
	var noMusicPrograms = getProgramsExceptOfMusicProgram(tailPrograms);
	var nthUpcomingProgram = noMusicPrograms[n-1];
	var nElToday = getNumberOfPreviewsInTodayPartOfPreviewPanel();
	var programStartTime = nthUpcomingProgram.start;
	var programName = nthUpcomingProgram.name;
	if (nthUpcomingProgram.when == "today"){
		setTodayRow(n, programStartTime, programName);		
	} 
	else if (nthUpcomingProgram.when == "tomorrow") {
		var index = n - nElToday;
		setTomorrowRow(index, programStartTime, programName);
	}
}

function createCurrentProgramPanel() {
	if (getCurrentSongTitleIndependentOnName() != "" || $("#scheduler .currentSong").css('display') !== "none"){
		clearCurrentProgramDetails();
		return;
	}
	if (getCurrentProgram().name == "музычні"){
		clearCurrentProgramDetails();
		return;
	}
	currentProgramPanel = $("#scheduler .currentProgram");
	programNameDiv = currentProgramPanel.find('.programDetails .programName');
	programStartTimeDiv = currentProgramPanel.find('.programDetails .programStartTime');
	var description = getPodcastDescription(getCurrentProgram());
	programNameDiv.text(description);
	programStartTimeDiv.text(getCurrentProgram().start);
	currentProgramPanel[0].style.display = "block";
	console.log('Current program panel has been already created');
}

function getPodcastDescription(program) {
	return program.file.metadata.podcast_description;
}


function clearCurrentProgramDetails() {
	currentProgramPanel = $("#scheduler .currentProgram");
	programNameDiv = currentProgramPanel.find('.programDetails .programName');
	programStartTimeDiv = currentProgramPanel.find('.programDetails .programStartTime');
	programNameDiv.text("");
	programStartTimeDiv.text("");
	currentProgramPanel[0].style.display = "none";
}

function getIndexOfProgramInUpcomingJSON(element) {
	i = nUpcomingProgramsJSON.programs.indexOf(element);
	if (i > 0) {
		return i;
	}
	arr = nUpcomingProgramsJSON.programs.filter(x=> x.name == element);
	if (arr.length > 0){
		return nUpcomingProgramsJSON.programs.indexOf(arr[0]);
	}
	arr = nUpcomingProgramsJSON.programs.filter(x=> x.start == element);
	if (arr.length > 0){ 
		return nUpcomingProgramsJSON.programs.indexOf(arr[0]);
	}
	return -1;
}

function setThirdTodayRow(time,name) {
	setTodayRow(3,time,name);
}

function setSecondTodayRow(time,name) {
	setTodayRow(2,time,name);
}

function setFirstTodayRow(time, name) {
	setTodayRow(1,time,name);
}

function setTodayRow(rowN, time, name) {
	var timeCell = getTodayCell(rowN,1);
	var nameCell = getTodayCell(rowN,2);
	timeCell.text(time);
	nameCell.text(name);
	console.log('time cell: '+ timeCell.text());
	if (timeCell.text() == "") {
		hideBorderStyle(timeCell);
		hideBorderStyle(nameCell);
	}
}

function hideBorderStyle(el) {
	$(el).css('border-style', 'hidden');
}

function showBorderStyle(el) {
	$(el).css('border-style', 'none');
}

function getTodayCell(rowM, colN) {
	var row = getNthRowFromPreviewsTableForToday(rowM);
	var cell = row.find("td:nth-child(" + colN + ")");
	return cell;
}

function getNthRowFromPreviewsTableForToday(n){
	return $(".today .previewsTable tbody tr:nth-child(" + n + ")");
}

function getNumberOfPreviewsInTodayPartOfPreviewPanel() {
	n=0;
	var nRows = getNumberOfRowsInTodayPartOfPreviewPanel();
	for (var i=1; i <= nRows; i++){
		if (removeBlankSpaces(getTodayCell(i,1).text()) != "") {
			n++;
		}
	}
	return n;
}

function getNumberOfRowsInTodayPartOfPreviewPanel() {
	return $(".previewPanel .today tr").length;
}

function clearTodayPartOfPreviewPanel() {
	var num = getNumberOfRowsInTodayPartOfPreviewPanel();
	for (var i = 1; i<=3; i++) {
		setTodayRow(i,"", "");
	}
	hideTodayPartOfPreviewPanel();
}

function showTodayPartOfPreviewPanel() {
	if ($(".previewPanel .today").length == 0){
		window.setTimeout(showTodayPartOfPreviewPanel(), 4000);
	}
	else {
		$(".previewPanel .today")[0].style.display='block';	
	}
}

function hideTodayPartOfPreviewPanel() {
	$(".previewPanel .today")[0].style.display='none';
}

function setTomorrowRow(rowN, time, name) {
	var timeCell = getTomorrowCell(rowN,1);
	var nameCell = getTomorrowCell(rowN,2);
	timeCell.text(time);
	nameCell.text(name);
	showTomorrowPartOfPreviewPanel();
}

function getNumberOfPreviewsInTomorrowPartOfPreviewPanel() {
	n=0;
	var nRows = getNumberOfRowsInTomorrowPartOfPreviewPanel();
	for (var i=1; i <= nRows; i++){
		if (removeBlankSpaces(getTomorrowCell(i,1).text()) != "") {
			n++;
		}
	}
	return n;
}

function getNumberOfRowsInTomorrowPartOfPreviewPanel() {
	return $(".previewPanel .tomorrow tr").length;
}

function clearTomorrowPartOfPreviewPanel() {
	var num = getNumberOfRowsInTomorrowPartOfPreviewPanel();
	for (var i = 1; i<=num; i++) {
		setTomorrowRow(i,"", "");
	}
	hideTomorrowPartOfPreviewPanel();
}

function showTomorrowPartOfPreviewPanel() {
	if ($(".previewPanel .tomorrow").length == 0){
		window.setTimeout(showTomorrowPartOfPreviewPanel(), 4000);
	}
	else {
		$(".previewPanel .tomorrow")[0].style.display='block';	
	}
	
}

function hideTomorrowPartOfPreviewPanel() {
	$(".previewPanel .tomorrow")[0].style.display='none';
}

function getTomorrowCell(rowM, colN){
	var row = getNthRowFromPreviewsTableForTomorrow(rowM);
	var cell = row.find("td:nth-child(" + colN + ")");
	return cell;
}

function getNthRowFromPreviewsTableForTomorrow(n){
	return $(".tomorrow .previewsTable tbody tr:nth-child(" + n + ")");
}

function ajaxGetNthUpcomingProgram(n) {
	return nUpcomingProgramsJSON.programs[n];
}

function ajaxGetNUpcomingProgramsFromHandMadeSchedule() {
	var request = new XMLHttpRequest();
	request.open("GET", "php/getNUpcomingPrograms.php", true);
	request.send();
	request.onload = function() {
		resp = request.response;
		nUpcomingProgramsJSON = JSON.parse(resp);
		console.log('Upcoming programs was fetched from hand made schedule')
		return true;
	}
}

function isEmpty(obj) {
   for (var x in obj) { if (obj.hasOwnProperty(x))  return false; }
   return true;
}


function ajaxGetUpcomingPrograms() {
	var request = new XMLHttpRequest();
	request.open("GET", "php/getPreviews.php", true);
	request.send();
	request.onload = function() {
		resp = request.response;
		upcomingProgramsJSON = JSON.parse(resp);
	}

}


function getNthElementStartDate_YYYYMMDD(json, n) {
	var fadeInAt = "";
	fadeInAt = parseNthObj_FadeInAtElement(json, n);
	return parse_YYYYMMDD_FromDate(fadeInAt);
}

// example date: "2017-12-03T15:59:54.345+01:00"
function parse_YYYYMMDD_FromDate(date) {
	return date.substring(0,10);
}

function parseNthObj_FadeInAtElement(json, n) {
	var listOfTracks = [];
	listOfTracks = parseListOfTracks(json);
	if (n > listOfTracks.length){
		console.log('Error: Range exceeded');
		return "";
	}
	return getNthObjFromJson(json, n).fade_in_at;
}

function getNthObjFromJson(json, n) {
	return parseListOfTracks(json)[n];
}

function parseListOfTracks(json) {
	return json.data.playlist.tracks;
}

// compare dates in format YYYY-MM-DD and return adequate value
function compareDatesInFormat_YYYYMMDD(date1, date2) {
	if (date1 == date2) 
		return 0;
	else if (date1 > date2) 
		return 1;
	else if (date1 < date2)
		return -1;
	else 
		return -2; // error
}

function getTail(arr) {
	return arr.slice(1);
}

function removeBlankSpaces(str) {
	return str.replace(/\s/g,'');
}