<?php
	
?>
<!-- HTML content -->
<div class='wrapper'>
	<div id='logoContainer' style="position: absolute">
		<img style="postition: absolute" id='lemFmLogo' src="">

		<svg id="svgUpper" style="position: absolute; top: 0;">
			<clipPath id="rectangle-mask" viewPort="0 0 180 120">
				<rect id="rect" x="0" y="0" width="0" height="210" fill="red" />
			</clipPath>
			<image id="logoImageSvg" clip-path="url(#rectangle-mask)" left="10" height="70" width="200" xlink:href="images//lem_fm_logo_4_bez_kropky.png" />
			<circle id="ball" cx="134.2" cy="-5" r="5.5" fill="#FF452A" />
			<animate
				id="animateLetters"
				xlink:href="#rect"
				attributeName="width"
				to="100%"
				from="0%"
				begin="2s"
				dur="5s"
		    restart="always"
				fill="freeze"
				/>
	    <animate
	    	id="animateBall"
				xlink:href="#ball"
		    attributeName="cy" 
		    from="0" 
		    to="44.93"
		    dur="3s" 
		    begin="animateLetters.end"
	      values="0; 44.93; 15; 44.93; 25; 44.93; 35; 44.93"
		    keyTimes="0; 0.15; 0.3; 0.45; 0.6; 0.75; 0.9; 1"
		    keySplines=".42 0 1 1;
	                0 0 .59 1;
	                .42 0 1 1;
	                0 0 .59 1;
	                .42 0 1 1;
	                0 0 .59 1;
	                .42 0 1 1;
	                0 0 .59 1;"
		    fill="freeze"
		    onend="endAnimateKropka()"
		    />
		   <animate
		   	 id="animateRefreshingTitle"
		   	 xlink:href="logoImageSvg"
		   	 attributeName="left"
		   	 from="0"
		   	 to="300"
		   	 dur="5s"
		   	 begin="0s"
		   	 fill="freeze"
	   	 />	
		</svg>
	</div>
	<div class='topnav'>
		<div class="channels">
					<a href="#">Музыка</a>
					<a href="#">Гулянка</a>
			</div>
		<div class="upper">
			
		</div>
		<div class="lower"></div>
	</div>

	<?php
	include 'mainChannelContainer.php';
	?>

	<div class='navbar-empty'></div>
	<div class='navbar'>
		<div class='buttons'>
			<div class="playButtonWrapper">
				<div class="svg-frame">
					<a href="#">
						<embed id="playButtonId" src="images/play_button_80x80.svg" height="100%" width="100%">
						<audio id="player" preload="none" src="http://lemfm.radiokitstream.org/lemfm.mp3"></audio>
					</a>
				</div>
			</div>
			<div id='slider-horizontal'></div>
		</div>
	</div>
</div>

<!-- end HTML content -->
<?php

?>