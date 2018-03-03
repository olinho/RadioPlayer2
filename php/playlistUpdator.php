<?php
	$mainChannelScheduleURL = "https://lemfm-lineup-main.radiokitapp.org/api/lineup/v1.0/channel/main/playlist";
	$mainChannelSchedule15sURL = 'https://lemfm-lineup-main.radiokitapp.org/api/lineup/v1.0/channel/main/playlist?scope=current-15s';
	
	$playlistJson = fetchJson($mainChannelSchedule15sURL);
	print_r($playlistJson);
	saveToFile($playlistJson);



	function fetchJson($url)
	{
		$json = file_get_contents($url);
		$jsonDecoded = json_decode($json, false, 512, JSON_UNESCAPED_UNICODE);
		$jsonEncoded = json_encode($jsonDecoded, JSON_UNESCAPED_UNICODE);
		return $jsonEncoded;
	}

	function saveToFile($json) {
		$filePath = "../json/programsPreview.json";
		$fileContent = file_get_contents($filePath);
		$tempArr = json_decode($fileContent, false, 512, JSON_UNESCAPED_UNICODE);
		$jsonDecoded = json_decode($json, false, 512, JSON_UNESCAPED_UNICODE);
		array_push($tempArr->obj, $jsonDecoded);
		$jsonData = json_encode($tempArr, JSON_UNESCAPED_UNICODE);
		file_put_contents($filePath, $jsonData);
	}

	?>
	<html>
	<head>
		<title>Upcoming programs</title>
		<script type="text/javascript">
			function saveJsonToFile() {
				var request = new XMLHttpRequest();

				request.open("POST", 'saveJsonToFile.php', true);
				request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
				request.send(document.getElementById('jsonContent').textContent);
				request.onload = function() {
					alert(request.response);
				}
			}
		</script>
	</head>
	<body>
		<button id='saveToFileBtn' onclick="saveJsonToFile()">Save to file</button>
		<div id='jsonContent'>
			<?= $playlistJson ?>
		</div>
	</body>
	</html>
	<?php
?>