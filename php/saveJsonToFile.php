<?php

	$jsonStr = file_get_contents("php://input") . "\n";
	$fd = fopen("../json/playlistPreviewTmp.json", "ab");
	fwrite($fd, $jsonStr);
	fclose($fd);
	
	// clearFileFromBlankSpaces();

	function clearFileFromBlankSpaces() {
		$text = "";
		$fd = fopen("../json/playlistPreviewTmp.json", "rb");
		$outputFile = fopen("../json/playlistPreview.json", "wb");
		if (!$fd) die('file does not exist');

		while (($line = fgets($fd)) !== false) {
			if ($line == "\n")
				continue;
			$clearedLine = preg_replace("/[\t\n]+/", "", $line);
			$text = $text . $clearedLine . "\n";
		}
		fputs($outputFile, $text);
		fclose($fd);
		fclose($outputFile);
	}
	die('Saving process is finished');
?>