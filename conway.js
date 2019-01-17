"use strict";

//offsets used for checking neighbors
var offsets = [{x:0,y:-1},{x:1,y:-1},{x:1,y:0},{x:1,y:1},{x:0,y:1},{x:-1,y:1},{x:-1,y:0},{x:-1,y:-1}];
var ctx, canvas, useGrid = true, gSpeed = 10, odds = 60, valRGB = {r:0,g:0,b:0}, cRGB = {r:0,g:0,b:0}, gctx, gameBoard, colMode = 3;

window.onload = function(){
	//-------Canvas and content-------
	canvas = document.getElementById("game");
	ctx = canvas.getContext("2d");
	var grid = document.getElementById("grid");
	gctx = grid.getContext('2d');

	//-------Mouse Control-------
		var mDown = false,
		lastClick = {x:-1,y:-1},
		MMVal = 1, //used for click and drag

	//-------Buttons-------
		playButton = document.getElementById("play"),
		buttonPanel = document.getElementById("buttonPanel"),
		b_toggle = true,
		pPix = ["url('play.png')","url('pause.png')"];

	//-------Colors-------
		cRGB = {r:document.getElementById("red"),
				g:document.getElementById("green"),b:document.getElementById("blue")};
		valRGB = {r:parseInt(cRGB.r.value),g:parseInt(cRGB.g.value),b:parseInt(cRGB.b.value)};

	//-------Game control-------
	var	playing = false,
		gameInterval,
		gameLoop = function()
		{
			//if no cells changed in the tick, pause game
			if(gameBoard.tick())
			{
				playing = false;
				clearInterval(gameInterval);
			}
			playButton.style.backgroundImage = pPix[playing?1:0];
		};

	//-------Board Setup-------
	var colNum = document.getElementById("cols");
	var rowNum = document.getElementById("rows");
	canvas.width = 5000;
	canvas.height = 5000;
	grid.width = 5000;
	grid.height = 5000;
	var styleWidth = parseInt(window.getComputedStyle(canvas).width);
	var styleHeight = parseInt(window.getComputedStyle(canvas).height);
	gameBoard = new Board();
	gameBoard.init(parseInt(colNum.value),parseInt(rowNum.value));
	gridToggle();

	//-------Mouse Listeners-------
	document.addEventListener("mouseup",function(){ mDown = false});
	grid.addEventListener("mousedown", function(e)//click to activate cell
	{
		mDown = true;
		var x = Math.floor((e.pageX - canvas.offsetLeft)/(styleWidth/gameBoard.cols));
		var y = Math.floor((e.pageY - canvas.offsetTop)/(styleHeight/gameBoard.rows));
		if(x > -1 && x < gameBoard.cols && y > -1 && y < gameBoard.rows){
			var val = (!gameBoard.cells[x][y])?1:0;
			gameBoard.setCell(x,y,val);
			lastClick = {x:x,y:y};
			MMVal = val;
		}
	});
	grid.addEventListener("mousemove",function(e)//click and hold support
	{
		if(mDown){
			var x = Math.floor((e.pageX - canvas.offsetLeft)/(styleWidth/gameBoard.cols));
			var y = Math.floor((e.pageY - canvas.offsetTop)/(styleHeight/gameBoard.rows));
			if(lastClick.x == x && lastClick.y == y)return;
			if(x > -1 && x < gameBoard.cols && y > -1 && y < gameBoard.rows)
				if(gameBoard.cells[x][y] != MMVal)
					gameBoard.setCell(x,y,MMVal);
		}
	});

	//-------Color Control-------
	document.getElementById("red").addEventListener("change",updateCol);
	document.getElementById("green").addEventListener("change",updateCol);
	document.getElementById("blue").addEventListener("change",updateCol);
	document.getElementById("mode").addEventListener("change",function()
		{
			colMode = this.value;
			if(colMode == 2)
				document.getElementById("randomSel").style.visibility = "visible";
			else
				document.getElementById("randomSel").style.visibility = "hidden";
		});

	//-------Button Contols-------
	var buttonView = function(){//Buttons view
		if(b_toggle){
			buttonPanel.style.visibility = "visible";
			this.style.transform ="rotate(0deg)";
		}
		else{
			buttonPanel.style.visibility = "hidden";
			this.style.transform ="rotate(270deg)";
		}
		b_toggle = !b_toggle;//toggle button
	};

	var start = function(){//Play
		playing = !playing;
		playButton.style.backgroundImage = pPix[playing?1:0];
		if(playing)
			gameInterval = setInterval(gameLoop,1000/gSpeed);
		else
			clearInterval(gameInterval);
	};
	var reset = function(){//Reset/resize grid
		var cols = parseInt(colNum.value);
		var rows = parseInt(rowNum.value);
		if (cols > 999) cols=1000;
		if(rows > 999) rows=1000;
		playing = false;
		playButton.style.backgroundImage = pPix[0];
		gameBoard.init(cols,rows);
		useGrid = true;
		gridToggle();
	};
	var mix = function(){//Random fill
		var odds = parseInt(document.getElementById("ranNum").value);
		for(var i = 0; i < gameBoard.cols; i++)
			for(var k = 0; k < gameBoard.rows; k++)
				gameBoard.setCell(i,k,Math.floor(Math.random()*100) < odds? 1:0);
	};
	document.getElementById("buttonsToggle").addEventListener("click",buttonView);
	playButton.addEventListener("click",start);
	document.getElementById("speed").addEventListener("change",function(){
		gSpeed = parseInt(document.getElementById("speed").value);
		if(playing){
			clearInterval(gameInterval);
			gameInterval = setInterval(gameLoop,1000/gSpeed);
		}	
	});
	document.getElementById("random").addEventListener("click",mix);
	document.getElementById("toggleGrid").addEventListener("click",gridToggle);//Toggle grid
	document.getElementById("reset").addEventListener("click",reset);

	document.addEventListener("keydown",function(e)
	{
		switch(e.keyCode)
		{
			case 80://p
				start();
				break;
			case 71://g
				gridToggle();
				break;
			case 82://r
				reset();
				break;
			case 77://m
				mix();
				break;
			default: break;
		}
	});
	//-------For screen resizing--------
	window.addEventListener("resize",function(){
		styleWidth = parseInt(window.getComputedStyle(canvas).width);
		styleHeight = parseInt(window.getComputedStyle(canvas).height);
	});
}

function gridToggle()
{
	useGrid = !useGrid;
	if(!useGrid)
	{
		gctx.clearRect(0,0,canvas.width,canvas.height);
	}
	else
	{
		gctx.globalAlpha = .3;
		gctx.strokeStyle = "white";
		gctx.lineWidth = 5-(gameBoard.cols/333);
		for (var i = 0; i < gameBoard.cols; i++)
		{
			gctx.beginPath();
			gctx.moveTo(gameBoard.w*i,0);
			gctx.lineTo(gameBoard.w*i,canvas.width);
			gctx.stroke();	
		}
		gctx.lineWidth = 5-(gameBoard.rows/333);
		for (var i = 0; i < gameBoard.rows; i++) 
		{
			gctx.beginPath();
			gctx.moveTo(0,gameBoard.h*i);
			gctx.lineTo(canvas.height,gameBoard.h*i);
			gctx.stroke();	
		}
		gctx.globalAlpha = 1;		
	}		
}

function getColor(i,k)
{
	if(colMode == 1)
		return "white";
	else if(colMode == 2)
		return `rgb(${Math.floor(Math.random()*valRGB.r)},${Math.floor(Math.random()*valRGB.g)},${Math.floor(Math.random()*valRGB.b)})`;
	else if(colMode == 3){
		return `rgb(${255/((gameBoard.cols/i+1))},
			${(10*Math.sqrt(Math.pow(gameBoard.rows,2)+Math.pow(gameBoard.cols,2))/(1+Math.abs(i-k)))},
			${255/(gameBoard.rows/k+1)})`;
	}
}

function updateCol()
{	
	valRGB = {r:parseInt(cRGB.r.value),g:parseInt(cRGB.g.value),b:parseInt(cRGB.b.value)};
}


//Board "class"
//handles board state, drawing, game logic
function Board(){	
	this.init = function(cols,rows)
	{
		this.cols = cols;
		this.rows = rows;
		this.w = canvas.width/cols;
		this.h = canvas.height/rows;

		ctx.fillRect(0,0,canvas.width,canvas.height,"white");
		//ctx.globalAlpha = 1;
		
		this.borderWidth = [canvas.height/(rows*rows),canvas.width/(cols*cols)];
		this.liveCells = [];
		
		var cells = [];
		for (var i = 0; i < this.cols; i++) 
		{
			var row = [];
			for (var k = 0; k < this.rows; k++) 
			{
				row.push(0);
				this.drawCell(i,k,0);
			}
			cells.push(row);
		}
		this.cells = cells;
	}
	//one tick, check all cells
	this.tick = function()
	{
		//flag to see if anything has changed
		var flag = 1;

		//copy current board state
		var state = Array(this.rows);
		for(var i = 0; i < this.cols; i++){
			state[i]=(Array(this.rows));
			for(var k = 0; k < this.rows; k++){
				state[i][k]=this.cells[i][k];
			}
		}
		//check each cell
		for (var i = 0; i < this.cols; i++) 
		{
			for (var k = 0; k < this.rows; k++) 
			{				
				var n = this.nNeighbors(i,k,state);
				
				if(state[i][k] && (n < 2 || n > 3))
					this.cells[i][k] = 0;
				else if(!state[i][k] && n == 3)
					this.cells[i][k] = 1;

				//only draw a cell if it has changed
				if(this.cells[i][k] != state[i][k]){
					this.drawCell(i,k,this.cells[i][k]);
					flag = 0;
				}
			}
		}
		return flag;
	}

	//count the neighbors at (x,y) in a given state
	this.nNeighbors = function(x,y,state)
	{
		var n = 0;
		for (var i = 0; i < 8; i++)
		{
			var oX = x+offsets[i].x, 
				oY = y+offsets[i].y
			oX = (oX < 0) ? this.cols-1: 
				 (oX > this.cols-1) ? 0 : oX;
			oY = (oY < 0) ? this.rows-1: 
				 (oY > this.rows-1) ? 0 : oY;

			if(state[oX][oY] == 1)n++;		
		}	
		return n;	
	}

	//draws a cell at x,y with the given value (1/0)
	this.drawCell = function(x,y,val)
	{
		if(val)
			ctx.fillStyle = getColor(x,y);
		else
			ctx.fillStyle = "black";
		ctx.fillRect(x*this.w,y*this.h,this.w,this.h);
	}

	this.setCell = function(x,y,val)
	{
		this.cells[x][y] = val;
		this.drawCell(x,y,val);
	}
}