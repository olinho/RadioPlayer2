<?php
	$switchURL = "https://switch.radiokitapp.org/info/channels/6";

	echo isAutomatMounted();
	
	// check if now plays only automat
	function isAutomatMounted() {
		$json = whoIsMounted();
		if (count($json->mounted) == 1 and ($json->mounted[0] == "main")) {
			return 1;
		}
		else {
			return 0;
		}
	}

	function whoIsMounted() {
		$switchJSON = decodeStringToJson(fetchJson($GLOBALS['switchURL']));
		$mountedPeople = initializeJSON("mounted");
		foreach($switchJSON->sources as $k) {
			if ($k->current == true) {
				array_push($mountedPeople->mounted, $k->mount);
			}
		}
		return $mountedPeople;
	}

	function initializeJSON($mainNode) {
		return decodeStringToJson('{"'.$mainNode.'":[]}');
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