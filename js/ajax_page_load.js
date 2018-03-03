

function ajaxLoadingPageContentOnStart() {
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			document.body.innerHTML = this.responseText;
			$("audio#player").attr('src', 'http://lemfm.radiokitstream.org/lemfm.mp3');
			actionForClickOnMusicChannel();
		}
	};
	xmlhttp.open("GET", "php/pageLoader.php", true);
	xmlhttp.send();
}

function ajaxReloadingPageContentToMainChannel() {	
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			$("body .container").html(this.responseText);
			$("audio#player").attr('src', 'http://lemfm.radiokitstream.org/lemfm.mp3');
			actionForClickOnMusicChannel();
		}
	};
	xmlhttp.open("GET", "php/mainChannelContainer.php", true);
	xmlhttp.send();
}

function ajaxReloadingPageContentToMusicChannel() {	
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			$("body .container").html(this.responseText);
			$("audio#player").attr('src', 'http://lemfm.radiokitstream.org/lemfm-muzyczka-high.mp3');
			actionForClickOnLemFmChannel();
		}
	};
	xmlhttp.open("GET", "php/musicChannel.php", true);
	xmlhttp.send();
}

function actionForClickOnMusicChannel() {
	$(".topnav .channels a:nth-child(1)").click(function() {
		$(".topnav .channels a:nth-child(1)").text("Лем.фм");
		ajaxReloadingPageContentToMusicChannel();
	});
}

function actionForClickOnLemFmChannel() {
	$(".topnav .channels a:nth-child(1)").click(function() {
		ajaxReloadingPageContentToMainChannel();
		$(".topnav .channels a:nth-child(1)").text("Музыка");
		functionsRunOnLoad();
	});
}