"use strict";

//offsets used for checking neighbors
var offsets = [{x:0,y:-1},{x:1,y:-1},{x:1,y:0},{x:1,y:1},{x:0,y:1},{x:-1,y:1},{x:-1,y:0},{x:-1,y:-1}];
var ctx, canvas, useGrid = false, gSpeed = 10, odds = 60;

window.onload = function(){
	canvas = document.getElementById("game");
	ctx = canvas.getContext("2d");

	var gameBoard = new Board(),
	 	playing = false,
		gameInterval,
		mDown = false,

		//so you dont turn toggle a cell you just toggled
		lastClick = {x:-1,y:-1},
		MMVal = 1, //used for click and drag
		playButton = document.getElementById("play"),
		buttonPanel = document.getElementById("buttonPanel"),
		b_toggle = false,
		pPix = ["url('play.png')","url('pause.png')"];


	canvas.width = 5000;
	canvas.height = 5000;
	var styleWidth = parseInt(window.getComputedStyle(canvas).width);
	var styleHeight = parseInt(window.getComputedStyle(canvas).height);

	gameBoard.init(20,20);

	//activate a cell at x,y and draw it
	canvas.addEventListener("mousedown", function(e){
		mDown = true;
		var x = Math.floor((e.pageX - canvas.offsetLeft)/(styleWidth/gameBoard.cols));
		var y = Math.floor((e.pageY - canvas.offsetTop)/(styleHeight/gameBoard.rows));
		console.log(x,y);
		if(x > -1 && x < gameBoard.cols && y > -1 && y < gameBoard.rows){
			var val = gameBoard.cells[x][y]? 0:1;
			gameBoard.cells[x][y] = val;
			gameBoard.drawCell(x,y,val);
			lastClick = {x:x,y:y};
			MMVal = val;
		}
	});

	window.addEventListener("resize",function(){
		styleWidth = parseInt(window.getComputedStyle(canvas).width);
		styleHeight = parseInt(window.getComputedStyle(canvas).height);
	});

	document.addEventListener("mouseup",function(){ mDown = false});
	
	//used for click and drag on the board
	canvas.addEventListener("mousemove",function(e){
		if(mDown){
			var x = Math.floor((e.pageX - canvas.offsetLeft)/(styleWidth/gameBoard.cols));
			var y = Math.floor((e.pageY - canvas.offsetTop)/(styleHeight/gameBoard.rows));
			if(lastClick.x == x && lastClick.y == y)return;
			if(x > -1 && x < gameBoard.cols && y > -1 && y < gameBoard.rows){
				if(gameBoard.cells[x][y] != MMVal)
				{
					gameBoard.cells[x][y] = MMVal;
					gameBoard.drawCell(x,y,MMVal);
					gameBoard.drawGridLines();
				}
			}
		}	
	});

	//pause/play button
	playButton.addEventListener("click",function(){
		playing = !playing;
		playButton.style.backgroundImage = pPix[playing?1:0];
		if(playing){
			var TPS = parseInt(document.getElementById("speed").value);
			gameInterval = setInterval(
				function()
				{
					//if no cells changed in the tick, pause game
					if(gameBoard.tick())
					{
						playing = false;
						clearInterval(gameInterval);
					}
					playButton.style.backgroundImage = pPix[playing?1:0];
				}
				,1000/TPS);
		}
		else
			clearInterval(gameInterval);
	});

	document.getElementById("random").addEventListener("click",function(){
		var odds = parseInt(document.getElementById("ranNum").value);
		for(var i = 0; i < gameBoard.rows; i++)
			for(var k = 0; k < gameBoard.rows; k++){
				var val = Math.floor(Math.random()*100) < odds? 1:0;
				gameBoard.cells[i][k] = val; //60% chance
				gameBoard.drawCell(i,k,val);
			}
			gameBoard.drawGridLines();
	});

	document.getElementById("toggleGrid").addEventListener("click",function(){
			useGrid != useGrid;
	});

	//clicking the "reset" button resets and resizes the board
	document.getElementById("reset").addEventListener("click",function(){
		var cols = parseInt(document.getElementById("cols").value);
		var rows = parseInt(document.getElementById("rows").value);
		if (cols > 999) cols=1000;
		if(rows > 999) rows=1000;
		playing = false;
		playButton.style.backgroundImage = pPix[0];
		gameBoard.init(cols,rows);
		console.log("Board Reset!");
	});

	document.getElementById("buttonsToggle").addEventListener("click",function(){
		if(b_toggle){
			buttonPanel.style.visibility = "visible";
			this.style.transform ="rotate(0deg)";
		}
		else{
			buttonPanel.style.visibility = "hidden";
			this.style.transform ="rotate(270deg)";
		}
		b_toggle = !b_toggle;//toggle button
	});
}

function randomColor()
{
	return {r:Math.floor(Math.random()*255),
			g:Math.floor(Math.random()*255),
			b:Math.floor(Math.random()*255)};
}
//Board "class"
//handles board state, drawing, game logic
function Board(){	
	this.init = function(cols,rows,colors = ["black","white","white"])
	{
		this.cols = cols;
		this.rows = rows;
		this.w = canvas.width/cols;
		this.h = canvas.height/rows;
		//store live cells in a list, only check them each loop and cells within -1/+1 of furthest NSEW
		ctx.fillRect(0,0,canvas.width,canvas.height,"white");
		ctx.globalAlpha = 1;
		
		this.colors = colors;
		this.borderWidth = [canvas.height/(rows*rows),canvas.width/(cols*cols)];
		
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
		this.drawGridLines();
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
		this.drawGridLines();
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
		{
			var c = randomColor();
			ctx.fillStyle = `rgb(${c.r},${c.g},${c.b})`;
		}
		else
			ctx.fillStyle = this.colors[val];
		var ofs = {w:this.borderWidth[0],h:this.borderWidth[1]};
		ctx.fillRect(x*this.w,y*this.h,this.w,this.h);
	}
	this.drawGridLines = function()
	{
		if(!useGrid)return;
		ctx.strokeStyle = this.colors[2];
		ctx.lineWidth = this.borderWidth[0];
		for (var i = 0; i < this.cols; i++)
		{
			ctx.beginPath();
			ctx.moveTo(this.w*i,0);
			ctx.lineTo(this.w*i,canvas.width);
			ctx.stroke();	
			ctx.strokeStyle = this.colors[1];	
			ctx.stroke();
		}
		ctx.lineWidth = this.borderWidth[1];
		for (var i = 0; i < this.rows; i++) 
		{
			ctx.beginPath();
			ctx.moveTo(0,this.h*i);
			ctx.lineTo(canvas.height,this.h*i);
			ctx.stroke();	
			ctx.strokeStyle = this.colors[1];
			ctx.stroke();
		}		
	}

}