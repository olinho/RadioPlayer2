<?php
	$scheduleFilePath = "../json/hand_made_schedule.json";

	echo encodeJsonObjToStr(getThreeUpcomingPrograms());	

	

	function getThreeUpcomingPrograms() {
		return getNUpcomingPrograms(3);
	}

	function getNUpcomingPrograms($n) {
		$programsJson = decodeStrToJsonObj('{"programs":[]}');
		$upcomingPrograms = getUpcomingProgramsForPresentDay();
		$nUpcomingPrograms = array_slice($upcomingPrograms, 0, $n);
		foreach ($nUpcomingPrograms as $key => $value) {
			array_push($programsJson->programs, $value);	
		}
		return $programsJson;
	}

	function getUpcomingProgramsForPresentDay() {
		$presentDaySchedule = decodeStrToJsonObj(getPresentDaySchedule());
		$upcomingPrograms = array();
		$currentDate = getCurrentDate();
		foreach ($presentDaySchedule as $key => $value) {
			$programStartingDate = $value->start;
			$isProgramUpcoming = isFirstDateBiggerThanSecond($programStartingDate, $currentDate);
			if ($isProgramUpcoming) {
				array_push($upcomingPrograms, $value);
			}
		}
		return $upcomingPrograms;
	}

	function getUpcomingProgramsForNthDay($n) {
		
	}

	function isFirstDateBiggerThanSecond($firstDate, $secondDate) {
		if (compareDates($firstDate, $secondDate) > 0)
			return true;
		else
			return false;
	}

	function compareDates($date1, $date2) {
		if (strtotime($date1) > strtotime($date2))
			return 1;
		else if (strtotime($date1) < strtotime($date2))
			return -1;
		else
			return 0;
	}

	function getCurrentDate() {
		return date('H:i');
	}

	function getPresentDaySchedule() {
		$fileContent = getScheduleFromFile();
		$json = decodeStrToJsonObj($fileContent);
		$presentDayName = getPresentDayName();
		return encodeJsonObjToStr($json->$presentDayName);
	}

	function getPresentDayName(){
		$dayNumber = date('w');
		return dayNumberToDayName($dayNumber);
	}

	function dayNumberToDayName($dayNumber){
		$days = array('monday', 'tuesday', 'wednesday','thursday','friday', 'saturday', 'sunday');
		return $days[$dayNumber - 1];
	}

	function getScheduleFromFile() {
		return file_get_contents($GLOBALS['scheduleFilePath']);
	}

	function decodeStrToJsonObj($str) {
		// second parameter means if change returned element to array
		$json = json_decode($str, false, 512, JSON_UNESCAPED_UNICODE);
		return $json;
	}

	function encodeJsonObjToStr($jsonObj){
		$str = json_encode($jsonObj,JSON_UNESCAPED_UNICODE);
		return $str;
	}

	function show($str = "") {
		print_r("<br>" . $str);
	}
?>