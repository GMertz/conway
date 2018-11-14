"use strict";
var offsets = [{x:0,y:-1},{x:1,y:-1},{x:1,y:0},{x:1,y:1},{x:0,y:1},{x:-1,y:1},{x:-1,y:0},{x:-1,y:-1}];

window.onload = function(){
	var gameBoard = new Board();
	var playing = false;
	var gameInterval;
	var mDown = false;
	var lastClick = {x:-1,y:-1};
	var MMVal = 1;

	var canvas = document.getElementById("game");
	canvas.width = 500;
	canvas.height = 500;
	gameBoard.init(10,10,canvas);

	canvas.addEventListener("mousedown", function(e){
		mDown = true;
		var x = Math.floor((e.pageX - canvas.offsetLeft)/(canvas.width/gameBoard.cols));
		var y = Math.floor((e.pageY - canvas.offsetTop)/(canvas.height/gameBoard.rows));
		if(x > -1 && x < gameBoard.cols && y > -1 && y < gameBoard.rows){
			var val = gameBoard.cells[x][y]? 0:1;
			gameBoard.cells[x][y] = val;
			gameBoard.drawCell(x,y,val);
			lastClick = {x:x,y:y};
			MMVal = val;
		}
	});

	document.addEventListener("mouseup",function(){ mDown = false});
	
	canvas.addEventListener("mousemove",function(e){
		if(mDown){
			var x = Math.floor((e.pageX - canvas.offsetLeft)/(canvas.width/gameBoard.cols));
			var y = Math.floor((e.pageY - canvas.offsetTop)/(canvas.height/gameBoard.rows));
			if(lastClick.x == x && lastClick.y == y)return;
			if(x > -1 && x < gameBoard.cols && y > -1 && y < gameBoard.rows){
				gameBoard.cells[x][y] = MMVal;
				gameBoard.drawCell(x,y,MMVal);
			}
		}	
	});
	var playButton = document.getElementById("play");
	playButton.addEventListener("click",function(){

		playing = !playing;
		playButton.innerHTML = playing? "Pause" : "Play";
		if(playing)
			gameInterval = setInterval(
				function()
				{
					if(gameBoard.tick())
					{
						playButton.innerHTML = "Play";
						playing = false;
						clearInterval(gameInterval);
					}
				},1000/10);
		else
			clearInterval(gameInterval);
	});

	document.getElementById("reset").addEventListener("click",function(){
		var cols = parseInt(document.getElementById("cols").value);
		var rows = parseInt(document.getElementById("rows").value);
		if (cols > 999) cols=1000;
		if(rows > 999) rows=1000;
		playing = false;
		playButton.innerHTML = "Play";
		gameBoard = new Board();
		gameBoard.init(cols,rows,canvas);
		console.log("Board Reset!");
	});

	var rowCount = document.getElementById("rows");
	var colCount;
}

function Board(){	
	this.init = function(cols,rows,canvas,colors = ["black","white","white"])
	{
		this.cols = cols;
		this.rows = rows;
		this.w = canvas.width/cols;
		this.h = canvas.height/rows;
		this.canvas = canvas;
		canvas.getContext("2d").fillRect(0,0,canvas.width,canvas.height,"white");
		this.colors = colors;
		this.borderWidth = (canvas.width+canvas.height)/(15*(cols+rows));
		var cells = []
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
	this.tick = function()
	{
		var flag = 1;
		var state = Array(this.rows);
		for(var i = 0; i < this.cols; i++){
			state[i]=(Array(this.rows));
			for(var k = 0; k < this.rows; k++){
				state[i][k]=this.cells[i][k];
			}
		}
		
		for (var i = 0; i < this.cols; i++) 
		{
			for (var k = 0; k < this.rows; k++) 
			{				
				var n = this.nNeighbors(i,k,state);
				
				if(state[i][k] && (n < 2 || n > 3))
					this.cells[i][k] = 0;
				else if(!state[i][k] && n == 3)
					this.cells[i][k] = 1;

				if(this.cells[i][k] != state[i][k]){
					this.drawCell(i,k,this.cells[i][k]);
					flag = 0;
				}
			}
		}
		return flag;
	}

	this.nNeighbors = function(x,y,state)
	{
		var n = 0;
		for (var i = 0; i < 8; i++)
		{
			var oX = x+offsets[i].x, oY = y+offsets[i].y;

			if(oX > -1 && oX < this.cols && oY > -1 && oY < this.rows)
				if(state[oX][oY] == 1){
					n++;
				}
		}	
		return n;	
	}

	this.drawCell = function(x,y,val)
	{
		var ctx = this.canvas.getContext("2d");
		ctx.fillStyle = this.colors[val];
		ctx.fillRect(x*this.w,y*this.h,this.w-this.borderWidth/4,this.h-this.borderWidth/4);
		ctx.beginPath();
		ctx.strokeStyle = this.colors[2];
		ctx.lineWidth = this.borderWidth;
		ctx.rect(x*this.w,y*this.h,this.w,this.h);
		ctx.stroke();
	}

}