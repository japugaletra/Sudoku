$(document).ready(() => {
	var gameContainer = $("<div id='gameContainer'></div>");

	var sudokuBoard = $("<div id='SudokuBoard'></div>");

	for(var square = 0; square < 9; square++) {
		var newSquare = $("<div class='square' id='s"+square.toString()+"'></div>");
		for(var cell = 0; cell < 9; cell++) {
			var newCell = $("<div class='cell' id='c"+square.toString() + cell.toString()+"'></div>");
			newSquare.append(newCell);
		}
		sudokuBoard.append(newSquare);
	}

	var toolbar = $("<div id='buttons'></div>");

	var penButtonContainer = $("<div id='penButtons' class='buttonContainer'></div>");

	for(var i = 1; i <= 9; i++) {
		var button = $("<div id='pen"+i+"' class='button pen'>"+i+"</div>");
		penButtonContainer.append(button);
	}

	toolbar.append(penButtonContainer);

	gameContainer.append(sudokuBoard);
	gameContainer.append(toolbar);

	$("body").append(gameContainer);

	RecalculateBoardSizes({});

	generate();

});

$(window).resize(() => {
	RecalculateBoardSizes({transition:true});
})

function RecalculateBoardSizes (params) {
	var percentOfScreen = 0.8;
	if(params.transition) {
		$('#SudokuBoard, #buttons, .button, .buttonContainer').css({'transition':'0.5s all'});
	} else {
		$('#SudokuBoard, #buttons, .button, .buttonContainer').css({'transition':'0s all'});
	}

	var smallestDim = $(window).height() < $(window).width() ? $(window).height() : $(window).width();
	var boardSide = percentOfScreen * smallestDim;
	var fontSize = boardSide/10;
	var buttonSize = boardSide/9 - 2;
	var fontSize = parseInt(buttonSize)*0.8;


	$('#SudokuBoard').css({
		"width":boardSide + 'px',
		"height":boardSide + 'px',
		"font-size":fontSize + 'px'
	});

	$('#buttons').css({
		"font-size":fontSize/2 + 'px',
		'line-height':'100%'

	});

	if($(window).width() < $(window).height()) {
		$('#gameContainer').css({
			"width":boardSide+'px',
			"top":'10px',
			"margin":"0px 0px 0px -"+boardSide/2+"px"
		});

		$('#buttons').css({
			'position':'relative',
			"width":boardSide+'px',
			"height":'auto',
			"margin":'5px 0px 0px 0px'
		});

		$(".buttonContainer").css({
			'width':boardSide+2+'px',
			'height':buttonSize+2+'px',
			'padding':'0'
		})

		$('.button').css({
			'width':buttonSize+'px',
			'height':buttonSize+'px',
			'font-size': fontSize + 'px',
			'line-height':buttonSize+'px'
		});
	} else {
		$('#gameContainer').css({
			"width":1.5*boardSide+'px',
			"top":'50%',
			"margin":"-"+boardSide/2+"px 0px 0px -"+(boardSide+buttonSize)/2+"px"
		});

		$('#buttons').css({
			'position':'absolute',
			"width":'auto',
			"height":boardSide + 'px',
			"margin":'0px 0px 0px 5px'

		});

		$(".buttonContainer").css({
			'width':buttonSize+2+'px',
			'height':boardSide+2+'px',
			'padding':'0'

		})

		$('.button').css({
			'width':buttonSize+'px',
			'height':buttonSize+'px',
			'font-size': fontSize + 'px',
			'line-height':buttonSize+'px'
		});
	}

	if(params.transition != true)
		window.setTimeout(()=>{
			$('#SudokuBoard, #buttons, .button, .buttonContainer').css({'transition':'1s all'});
		},0);
}