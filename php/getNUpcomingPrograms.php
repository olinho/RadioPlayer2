<?php
	$scheduleFilePath = "../json/hand_made_schedule.json";
	$fileContent = getScheduleFromFile();
	echo encodeJsonObjToStr(getNUpcomingPrograms(8));

	function getNUpcomingPrograms($n) {
		$programsJson = decodeStrToJsonObj('{"programs": []}');
		$upcomingPrograms = getUpcomingProgramsForPresentDay();
		$currentProgram = getCurrentProgram();
		array_push($programsJson->programs, $currentProgram);
		$nUpcomingPrograms = getFirstNprogramsFromArray($upcomingPrograms, $n-1);
		foreach ($nUpcomingPrograms as $key => $value) {
			array_push($programsJson->programs, $value);	
		}
		$numberOfPrograms = count($programsJson->programs);
		$numberOfMissingPrograms = $n - $numberOfPrograms;
		if ($numberOfMissingPrograms > 0) {
			$firstNprogramsForTomorrow = getFirstNprogramsForTomorrow($numberOfMissingPrograms);
			foreach($firstNprogramsForTomorrow->programs as $key => $value) {
				array_push($programsJson->programs, $value);
			}
		}
		return $programsJson;
	}

	function getFirstNprogramsForTomorrow($n) {
		$programsJson = decodeStrToJsonObj('{"programs": []}');
		$tomorrowPrograms = getNthDaySchedule(getNextDayNumber());
		$tomorrowMprograms = getFirstNprogramsFromArray($tomorrowPrograms, $n);
		foreach ($tomorrowMprograms as $key => $value) {
			$valueExtended = appendWhenElementToJson($value, "tomorrow");
			array_push($programsJson->programs, $valueExtended);
		}
		return $programsJson;
	}

	function getUpcomingProgramsForPresentDay() {
		$presentDaySchedule = getPresentDaySchedule();
		$upcomingPrograms = array();
		$currentHour = getCurrentHour();
		foreach ($presentDaySchedule as $key => $value) {
			$programStartingHour = $value->start;
			if (isFirstHourBiggerThanSecond($programStartingHour, $currentHour)) {
				$valueExtended = appendWhenElementToJson($value, "today");
				array_push($upcomingPrograms, $valueExtended);
			}
		}
		return $upcomingPrograms;
	}

	function getFirstNprogramsFromArray($programs, $n) {
		return array_slice($programs, 0, $n);
	}

	function getCurrentProgram() {
		$presentDaySchedule = getPresentDaySchedule();
		$currentHour = getCurrentHour();
		$lastProgram = getLastProgramForPreviousDay();
		foreach ($presentDaySchedule as $key => $value) {
			$programStartingHour = $value->start;
			if (isFirstHourLessThanSecond($programStartingHour, $currentHour)) {
				$lastProgram = $value;
			} else {
				$lastProgramExtended = appendWhenElementToJson($lastProgram, "today");
				return $lastProgramExtended;
			}
		}
		$lastProgramExtended = appendWhenElementToJson($lastProgram, "today");
		return $lastProgramExtended;
	}

	function getLastProgramForPreviousDay() {
		$previousDayNumber = getPreviousDayNumber();
		$prevDaySchedule = getNthDaySchedule($previousDayNumber);
		$lastProgram = array_slice($prevDaySchedule, -1)[0];
		$lastProgramExtended = appendWhenElementToJson($lastProgram, "yesterday");
		return $lastProgramExtended;
	}

	function getNextDayNumber() {
		$n = getPresentDayNumber();
		if ($n == 7)
			return 1;
		else 
			return $n+1;
	}

	function getPreviousDayNumber() {
		$n = getPresentDayNumber();
		if ($n == 1)
			return 7;
		else 
			return $n-1;
	}

	function isFirstHourLessThanSecond($firstHour, $secondHour) {
		return !isFirstHourBiggerThanSecond($firstHour, $secondHour);
	}

	function isFirstHourBiggerThanSecond($firstHour, $secondHour) {
		if (compareDates($firstHour, $secondHour) > 0)
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

	function getCurrentHour() {
		return date('H:i');
	}

	function getPresentDaySchedule() {
		return getNthDaySchedule(getPresentDayNumber());
	}


	function getNthDaySchedule($n) {
		$json = decodeStrToJsonObj($GLOBALS['fileContent']);
		$dayName = dayNumberToDayName($n);
		return $json->$dayName;
	}

	function getPresentDayName(){
		$dayNumber = getPresentDayNumber();
		return dayNumberToDayName($dayNumber);
	}

	function getPresentDayNumber() {
		$n = date('w');
		if ($n == 0)
			return 7;
		else
			return $n;
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

	function appendWhenElementToJson($json, $whenValue) {
		$whenElement['when'] = $whenValue;
		return appendElementToJsonObj($json, $whenElement);
	}

	function appendElementToJsonObj($json, $arrEl) {
		$encObj = json_encode($json);
		$decArray = json_decode($encObj, true);
		$key = key($arrEl);
		$value = $arrEl[$key];
		$decArray[$key] = $value;
		return $decArray;
	}

	function show($str = "") {
		print_r("<br>" . $str);
	}
?>