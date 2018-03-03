var resp = [];
var nUpcomingProgramsJSON = {};
var upcomingProgramsJSON = {};

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

function handMadeScheduleUpdator() {
	console.log("handMadeScheduleUpdator");
	ajaxGetNUpcomingProgramsFromHandMadeSchedule();
	setIntervalFunction(ajaxGetNUpcomingProgramsFromHandMadeSchedule, 600000);
}

function previewsUpdator() {
	ajaxGetUpcomingPrograms();
	setIntervalFunction(ajaxGetUpcomingPrograms, 60000);
	setIntervalFunction(updatePreviewPanel, 600000);
}

function getCurrentProgram() {
	if ( isEmpty(upcomingProgramsJSON) ){
		return null;
	}
	var startedPrograms = upcomingProgramsJSON.programs.filter(x => x.has_started == 1);
	var program;
	if (startedPrograms.length > 0)
		window.setTimeout(updatePreviewPanel, 2000);
		program = startedPrograms[0];
	return program;
}

function getCurrentProgramFromHandMadeSchedule() {
	if ( isEmpty(nUpcomingProgramsJSON) )
		return null;
	else 
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
	return upcomingProgramsJSON.programs.slice(1);
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
	if ((numToday == 0) && (numTomorrow == 0)){
		hidePreviewPanel();
	} else {
		showPreviewPanel();
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
	if (isEmpty(upcomingProgramsJSON)) {
		console.log('No upcoming programs...');
		return;
	}
	var programs = getNotStartedPrograms(upcomingProgramsJSON);
	var nthUpcomingProgram = programs[n-1];
	var nElToday = getNumberOfPreviewsInTodayPartOfPreviewPanel();
	var programStartDate = nthUpcomingProgram.fade_in_at;
	var programDescription = nthUpcomingProgram.file.metadata.podcast_description;
	var programStartTime = getProgramStartTime(nthUpcomingProgram);
	if (isTodayProgram(nthUpcomingProgram)){
		setTodayRow(n, programStartTime, programDescription);		
	} 
	else if (isTomorrowProgram(nthUpcomingProgram)) {
		var index = n - nElToday;
		setTomorrowRow(index, programStartTime, programDescription);
	}
}

function getNotStartedPrograms(programsAsJson) {
	var programs = programsAsJson.programs.filter(x => x.has_started == 0);
	return programs;
}

function isTodayProgram(program) {
	var today = new Date();
	var todayNumber = today.getDate();
	if (todayNumber == getProgramStartDate(program).getDate()) {
		return true;
	}
	return false;
}

function isTomorrowProgram(program) {
	var d = new Date();
	var programStartDate = getProgramStartDate(program);
	var startTomorrow = new Date(d.getFullYear(), d.getMonth(), d.getDate()+1,1);
	var endTomorrow = new Date(d.getFullYear(), d.getMonth(), d.getDate()+1, 24, 59, 59);
	if (programStartDate > startTomorrow & programStartDate < endTomorrow) {
		return true;
	}
	return false;	
}

function currentProgramUpdator() {
	setTimeout(createCurrentProgramPanel, 2000);
	setIntervalFunction(createCurrentProgramPanel, 60000);
}

function createCurrentProgramPanel() {
	if ( isCurrentProgramNotSet() ){
		setTimeout(createCurrentProgramPanel, 2000);
		return;
	}
	var program = getCurrentProgram();
	if ( 	(getProgramDescription(program) == "") ||
				(getCurrentSongTitleIndependentOnName() != "") || 
				($("#scheduler .currentSong").css('display') !== "none") ){
		clearCurrentProgramDetails();
		return;
	}
	var currentProgramPanel = $("#scheduler .currentProgram");
	programNameDiv = currentProgramPanel.find('.programDetails .programName');
	programStartTimeDiv = currentProgramPanel.find('.programDetails .programStartTime');
	addTextWithAnimationToDiv(programNameDiv, getProgramDescription(program), 25);
	programStartTimeDiv.text(getProgramStartTime(program));
	displayBlockForCurrentProgramPanel();
	showPreviewPanel();
	console.log('Current program panel has been already created');
}

function isCurrentProgramNotSet() {
	return !hasStartedAnyProgram();
}

function hasStartedAnyProgram() {
	if (getCurrentProgram() !== undefined) 
		return true;
	else
		return false;
}

function refreshCurrentProgramPanelBasedOnHandMadeSchedule() {
	ajaxGetNUpcomingProgramsFromHandMadeSchedule();
	setTimeout(createCurrentProgramPanelBasedOnHandMadeSchedule, 2000);
}

function createCurrentProgramPanelBasedOnHandMadeSchedule() {
	var program = getCurrentProgramFromHandMadeSchedule();
		if (program.name == "музычні"){
		program.name = "Музычні";
	}
	var currentProgramPanel = $("#scheduler .currentProgram");
	var programNameDiv = currentProgramPanel.find('.programDetails .programName');
	var programStartTimeDiv = currentProgramPanel.find('.programDetails .programStartTime');
	addTextWithAnimationToDiv(programNameDiv, program.name, 25);
	programStartTimeDiv.text(program.start);
	clearCurrentSongDiv();
	displayBlockForCurrentProgramPanel();
	showPreviewPanel();
	console.log('Current program panel has been already created based on handMadeSchedule.');	
}

function getProgramStartTime(program) {
	var t = getProgramStartDate(program).toLocaleTimeString();
	var hm = t.split(":").slice(0,2).join(":");
	return hm;
}

function getProgramStartDate(program) {
	return new Date(program.fade_in_at);
}

function getProgramDescription(program) {
	return program.file.metadata.podcast_description;
}


function clearCurrentProgramDetails() {
	var currentProgramPanel = $("#scheduler .currentProgram");
	var programNameDiv = currentProgramPanel.find('.programDetails .programName');
	var programStartTimeDiv = currentProgramPanel.find('.programDetails .programStartTime');
	programNameDiv.text("");
	programStartTimeDiv.text("");
	displayNoneForCurrentProgramPanel();
}

function getIndexOfProgramInUpcomingJSON(element) {
	var i = nUpcomingProgramsJSON.programs.indexOf(element);
	if (i > 0) {
		return i;
	}
	var arr = nUpcomingProgramsJSON.programs.filter(x=> x.name == element);
	if (arr.length > 0){
		return nUpcomingProgramsJSON.programs.indexOf(arr[0]);
	}
	arr = nUpcomingProgramsJSON.programs.filter(x=> x.start == element);
	if (arr.length > 0){ 
		return nUpcomingProgramsJSON.programs.indexOf(arr[0]);
	}
	return -1;
}

function setThirdTodayRow(time,text) {
	setTodayRow(3,time,text);
}

function setSecondTodayRow(time,text) {
	setTodayRow(2,time,text);
}

function setFirstTodayRow(time, text) {
	setTodayRow(1,time,text);
}

function setTodayRow(rowN, time, text) {
	var timeCell = getTodayCell(rowN,1);
	var descriptionCell = getTodayCell(rowN,2);
	addTextWithAnimationToCell(descriptionCell, text);

	timeCell.text(time);
	if (timeCell.text() == "") {
		setRidgedBorderStyle(timeCell);
		setRidgedBorderStyle(descriptionCell);
	}
}

function addTextWithAnimationToCell(el, text) {
	addTextWithAnimationToDiv(el,text,80);
}

function addTextWithAnimationToDiv(el, text, numOfDisplayedLetters) {
	var spacePositions = findAllPos(' ', text);
	var tLen = getMostAdjustValue(spacePositions, numOfDisplayedLetters);
	if (text.length > tLen) {
		$(el).html(text.substr(0,tLen) + '<span class="hiddenSpan" style="display: none;">' + text.substr(tLen) + '</span>' +'<a class="textCover" href="javascript: void(0)"> (...)</a>');
		var hiddenSpan = $(el).find('span.hiddenSpan');
		var aElem = $(el).find("a.textCover");
		$(hiddenSpan).letterByLetter();

		$(aElem).click(function (e) {
			$(el).fadeInHiddenSpan();
			var lastDelay = $(hiddenSpan).showLetters();
			$(aElem).text("");
			setTimeout(function() {
				$(el).fadeOutVisibleSpan();
				setTimeout(function() {
					$(aElem).text(' (...)');
					$(hiddenSpan).hideLetters();
				}, 2000);
			}, lastDelay + 10000);
		});
	}
	else {
		$(el).html(text);
	}
}

$.fn.fadeOutVisibleSpan = function() {
	$(this).find('span').first().fadeOut(2000, "linear");
}

$.fn.fadeInHiddenSpan = function() {
	$(this).find('span.hiddenSpan').first().fadeToggle("slow", "linear");
}

$.fn.hideLetters = function() {
	$(this).find('span').each(function(idx,elem){
		$(elem).stop();
		$(elem).css({
			opacity: 0
		});
	});
}

$.fn.showLetters = function() {
	var period = 30; // time between subsequent letters appearing
	$(this).find('span').each(function(idx,elem) {
		$(elem).css({
			opacity: 0
		});
		$(elem).delay(idx * period);
  	$(elem).animate({
  	opacity: 1
  }, 400);
	});
	var lastDelay = $(this).find('span').length * period;
	return lastDelay;
}

$.fn.letterByLetter = function() {
	var hiddenSpan = $(this);
	var wordList = $(hiddenSpan).html().split("");
	$(hiddenSpan).html("");
	$.each(wordList, function(idx,elem) {
		var newEl = $("<span/>").text(elem).css({
      opacity: 1
    });
    hiddenSpan.append(newEl);
	});
}



$.fn.characterize = function (wrapper, options) {
  var txt = this.text(),
      self = this;

  this.empty();
  
  wrapper = wrapper || '<span />';
  options = options || {};

  Array.prototype.forEach.call(txt, function (c) {
    options.text = c;
    self.append($(wrapper, options));
  });
};


function animate () {
  var wlc = $('span.hiddenText');

  wlc.characterize('<span />', {
    class: 'fd',
    css: {
      opacity: 0
    }
  });
  
  wlc.css('opacity', 1);

  $('.fd').each(function (i) {
    $(this).animate({opacity: 1}, (i + 1) * 100);
  });
}

function setRidgedBorderStyle(el) {
	$(el).css('border-style', 'ridge');
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
	var n=0;
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
	for (var i = 1; i<=num; i++) {
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

function setTomorrowRow(rowN, time, text) {
	var timeCell = getTomorrowCell(rowN,1);
	var descriptionCell = getTomorrowCell(rowN,2);
	addTextWithAnimationToCell(descriptionCell, text);

	timeCell.text(time);
	if (timeCell.text() == "") {
		setRidgedBorderStyle(timeCell);
		setRidgedBorderStyle(descriptionCell);
	}
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
		console.log('Upcoming programs was fetched from hand made schedule');
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
	window.setTimeout(updatePreviewPanel, 2000);
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

