<?php
	$scheduleURL = "https://lemfm-lineup-main.radiokitapp.org/api/lineup/v1.0/channel/main/playlist";
	$schedule15sURL = 'https://lemfm-lineup-main.radiokitapp.org/api/lineup/v1.0/channel/main/playlist?scope=current-15s';
	$metadataDetailsURL = 'https://lemfm-vault.radiokitapp.org/api/rest/v1.0/data/record/file?a[]=metadata&c[id][]=eq%20';
	$upcomingProgramsFilePath = "../json/upcomingPrograms.json";
	$lastSavedIndexFilePath = "../json/lastSavedIndexOfUpcomingPrograms.json";
	$scheduleFilePath = "../json/schedule.json";
	$numberOfPrograms = 4;
	$previewsJson = getPreviews();

	setDescriptions();
	echo encodeJsonObjToStr(getFreshProgramsFromFile());

	// TODO. If we have program not manually set, occurs error

	// check number of upcoming programs
	// and if they haven't finished or started yet
	function getPreviews() {
		getScheduleAndSaveToFile();
		$json = getFreshProgramsFromFile();
		if ( hasN_UpcomingPrograms($json) ){
			return $json;
		} 
		else {
			updateUpcomingProgramsUsingSchedule();
		}

		$json = getFreshProgramsFromFile();
		if (hasN_UpcomingPrograms($json)){
			return $json;
		} else {
			die ("We need lemko doctor.");
		}
	}

	function setDescriptions() {
		$json = getFreshProgramsFromFile();
		$programs = $json->programs;
		$programsN = count($programs);
		$descriptionNodeName = "podcast_description";
		for ($i=0; $i < $programsN; $i++) { 
			$description = getNthProgramDescription($i);
			$programs[$i]->file->metadata->podcast_description = $description;
		}
		saveJsonObjectToUpcomingProgramsJSONFile($json);
	}


	function getNthProgramDescription($n){
		$nthProgramMetadata = getNthProgramMetadata($n);
		if (!property_exists($nthProgramMetadata, 'podcast_description')){
			return "";
		}
		$desc = $nthProgramMetadata->podcast_description;
		if ($desc != null) {
			return $nthProgramMetadata->podcast_description;	
		} else {
			return "";
		}
	}

	function getNthProgramMetadata($n) {
		$id = getNthProgramID($n);
		$opts = array(
		  'http'=>array(
		    'method'=>"GET",
		    'header'=>
		              "Accept: application/json\r\n" .
									"Authorization: Bearer lemfm\r\n"
		  )
		);
		$context = stream_context_create($opts);
		$url = $GLOBALS['metadataDetailsURL'];
		$url = $url . (string)$id;
		$resp = file_get_contents($url, false, $context);
		$decResp = decodeStringToJson($resp);
		return $decResp->data[0]->metadata;
	}

	function getNthProgramID($n) {
		return $GLOBALS['previewsJson']->programs[$n]->file->id;
	}

	function hasN_UpcomingPrograms($jsonFromUpcomingProgramsFile) {
		if (count($jsonFromUpcomingProgramsFile->programs) == $GLOBALS['numberOfPrograms']){
			return true;
		}
		else {
			return false;
		}
	}

	function updateUpcomingProgramsUsingSchedule() {
		$nUpcomingProgramsFromScheduleAsJson = getNUpcomingProgramsFromSchedule();
		saveJsonObjectToUpcomingProgramsJSONFile($nUpcomingProgramsFromScheduleAsJson);
	}

	function getNUpcomingProgramsFromSchedule() {
		$scheduleAsStr = readScheduleFromJsonFile();
		$scheduleAsJson = decodeStringToJson($scheduleAsStr);
		$freshProgramsJson = (decodeStringToJson('{"programs":[]}'));
		$firstUpcomingProgramIndex = 0;
		$k = getLastSavedIndexFromFile();
		$i = 0;
		$tracks = $scheduleAsJson->data->playlist->tracks;
		$numberOfTracks = count($tracks);
		while ($i < $GLOBALS['numberOfPrograms']) {
			$track = $tracks[$k];
			if ( (isProgramFresh($track)) AND (isProgramSetManually($track)) ){
				if ($firstUpcomingProgramIndex == 0){
					$firstUpcomingProgramIndex = $k;
				}
				array_push($freshProgramsJson->programs, $track);
				$i++;
			}
			$k++;
			if ($k >= $numberOfTracks){
				break;
			}
		}
		updateFirstUpcomingProgramIndex($firstUpcomingProgramIndex);
		return $freshProgramsJson;
	}

	function getLastSavedIndexFromFile() {
		if ( !is_null($tmpK = intval(file_get_contents($GLOBALS['lastSavedIndexFilePath']))) )
			return $tmpK;
		else 
			return 0;
	}

	function readScheduleFromJsonFile() {
		$scheduleAsJson = file_get_contents($GLOBALS['scheduleFilePath']);
		return $scheduleAsJson;
	}

	function getScheduleAndSaveToFile() {
		$scheduleJson = decodeStringToJson(fetchJson($GLOBALS['scheduleURL']));
		saveJsonObjectToFile($scheduleJson, "../json/schedule.json");
		updateFirstUpcomingProgramIndex(0);
	}

	function updateFirstUpcomingProgramIndex($val) {
		file_put_contents($GLOBALS['lastSavedIndexFilePath'], $val, LOCK_EX);
	}

	function saveJsonObjectToFile($jsonObj, $filepath) {
		$str = encodeJsonObjToStr($jsonObj);
		file_put_contents($filepath, $str, LOCK_EX);
	}

	function saveJsonObjectToUpcomingProgramsJSONFile($jsonObj) {
		saveJsonObjectToFile($jsonObj, $GLOBALS['upcomingProgramsFilePath']);
	}

	function getFreshProgramsFromFile() {
		$upcomingPrograms = readUpcomingProgramsFile();
		$programsAsJson = decodeStringToJson($upcomingPrograms);
		$freshProgramsJson = (decodeStringToJson('{"programs":[]}'));
		for ( $i=0; $i < count($programsAsJson->programs); $i++ ){
			$program = getNthProgramFromOriginalJson($programsAsJson, $i);
			if ( isProgramFresh($program) ){
				$program = setHasProgramStartedProperty($program);
				array_push($freshProgramsJson->programs, $program);
			}
		}
		return $freshProgramsJson;
	}

	function getNumberOfProgramsInJson($json) {
		return count($json->programs);
	}

	function isProgramSetManually($program) {
		if ($program->kind == "manual") 
			return true;
		else 
			return false;
	}

	function isProgramFresh($programAsJson){
		$currDate = getCurrentDate(); // Y-m-d H:i:s
		$programEndDate = $programAsJson->fade_out_at;
		if (strtotime($currDate) > strtotime($programEndDate))
			return false;
		else
			return true;
	}

	function setHasProgramStartedProperty($program) {
		if ( hasProgramStarted($program) ){
			$program->has_started = 1;
		}
		else {
			$program->has_started = 0;
		}
		return $program;
	}

	function hasProgramStarted($programAsJson) {
		$currDate = getCurrentDate(); // Y-m-d H:i:s
		$programEndDate = $programAsJson->fade_out_at;
		$programStartDate = $programAsJson->fade_in_at;
		if ( (strtotime($currDate) > strtotime($programStartDate)) AND (strtotime($currDate) < strtotime($programEndDate)) )
			return true;
		else
			return false;	
	}

	function getCurrentDate() {
		return date('Y-m-d H:i:s');
	}


	// to format YYYY-MM-DD HH:mm:ss
	function parseFadeTime($fadeTime) {
		$tLetterPos = strpos($fadeTime,"T");
		$dotLetterPos = strpos($fadeTime,'.');
		$dateYmd = substr($fadeTime, 0, $tLetterPos);
		$dateHis = substr($fadeTime, $tLetterPos+1, $dotLetterPos-$tLetterPos-1);
		return "$dateYmd $dateHis";
	}

	function getStartTimeForNthProgram($n) {
		$upcomingPrograms = readUpcomingProgramsFile();
		$json = decodeStringToJson($upcomingPrograms);
		$program = $json->programs[$n];
		$fadeInAt = getFadeInPropertyForProgram($program);
		$parsedTime = parseFadeTime($fadeInAt);
		return $parsedTime;
	}	

	// get file->name, fade_in_at, etc. for n-th program
	function getNthProgramFromOriginalJson($json, $n) {
		return $json->programs[$n];
	}

	function getFadeInPropertyForProgram($programAsJson) {	
		return $programAsJson->fade_in_at;
	}

	function readUpcomingProgramsFile() {
		$upcomingProgramsFilePath = $GLOBALS['upcomingProgramsFilePath'];
		$json = file_get_contents($upcomingProgramsFilePath);
		return $json;
	}

	function fetchJson($url){
		$json = file_get_contents($url);
		return $json;
	}

	function decodeStringToJson($string){
		$jsonObj = json_decode($string, false, 512, JSON_UNESCAPED_UNICODE);
		return $jsonObj;
	}

	function encodeJsonObjToStr($jsonObj){
		$str = json_encode($jsonObj, JSON_UNESCAPED_UNICODE);
		return $str;
	}

	function show($str = "") {
		print_r("<br>" . $str);
	}

	function showJ($json) {
		echo encodeJsonObjToStr($json) . "<br>";
	}
?>