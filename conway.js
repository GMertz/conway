"use strict";
var board;
var rows = 20;
var box;
var ctx;
var s = 5;
var mouseX= 0,mouseY=0;
var mDown=false;
var update;
var playing = false;
var offSets = [{x:0,y:-1},{x:1,y:-1},{x:1,y:0},{x:1,y:1},{x:0,y:1},{x:-1,y:1},{x:-1,y:0},{x:-1,y:-1}];
var cellCol ={on:"white",off:"black"};
var borderCol = "lightblue";
var rowCount;
var playButton;
/*
weird box spawned at 0,0 for somereason
fucked performance, garbade collection maybe 
let values wrap, add some iffys
*/

window.onload = function(){
	board = document.getElementById("game");
	board.addEventListener("mousedown",mouseDown);
	document.addEventListener("mouseup",mouseUp);
	board.addEventListener("mousemove",mousePos);
 	playButton = document.getElementById("play");
	playButton.addEventListener("click",function(){
		if(playing == false){
			playButton.innerHTML = "Pause";
			update = setInterval(tick,1000/10);
			playing = true;
		}else
			pause();
	});
	document.getElementById("reset").addEventListener("click",function(){
		if(playing == false){
		console.log("working");
			for(var i = 0; i<box.rows; i++){
					for(var k = 0; k<box.rows;k++){
						var c = box.cells[i][k];
						c.alive = true;
						c.draw();
					}
			}
		}
		tick();
	});
	rowCount = document.getElementById("rows");
	document.getElementById("init").addEventListener("click",initBoard);
	board.width = 600;
	board.height = 600;
	ctx=board.getContext("2d");
	initBoard();
}
function initBoard(){
	rows = rowCount.value;
	if(rows > 100)
		rows = 100;
	box = {cells:[],x:0,y:0,width:600,rows:rows};
	for(var i = 0; i<box.rows; i++){
		var row = [];
		for(var k = 0; k<box.rows;k++){
			var c = new cell(i,k,box.width/box.rows,false);
			row.push(c);
			c.draw();
		}
		box.cells.push(row);
	}
	console.log("pretick");
	tick();
	console.log("done");
}
function sketch(x,y,w,alive){
	ctx.fillStyle = cellCol.off;
	if(alive){
		ctx.fillStyle = cellCol.on;
	}
	ctx.fillRect(x*w,y*w,w,w);
	ctx.beginPath();
	ctx.strokeStyle = borderCol;
	ctx.lineWidth = 2;
	ctx.rect(x*w,y*w,w,w);
	ctx.stroke();
}
function cell (x,y,w,a){
	this.x = x;
	this.y = y;
	this.w = w;
	this.alive = a;
	this.c = false;
	//this.path = [{x:(x*hw)-hw,y:(y*hw)-hw},{x:(x*hw)+hw,y:(y*hw)-hw},{x:(x*hw)+hw,y:(y*hw)+hw},{x:(x*hw)-hw,y:(y*hw)+hw}];
	this.n = function(){
		var s = 0;
		for(var i = 0; i<8; i++){
			var x = offSets[i].x+this.x;
			var y = offSets[i].y+this.y;
			if(x < 0)
				x = rows-1;
			if(x >= rows)
				x = 0;
			if(y < 0)
				y = rows-1;
			if(y >= rows)
				y = 0;
			var sq = box.cells[x][y];
			if(sq.alive)
				s++;
		}
		if((this.alive) && (s < 2 || s > 3))
			this.c = true;
		else if(s == 3 && !this.alive){
			this.c = true;
		}
	}
	this.draw = function(){
		sketch(this.x,this.y,this.w,this.alive);
	}
	this.change = function(){
		if(this.c){
			this.alive = !this.alive;
			this.draw();
			this.c = false;
			return 1;
		}
		return 0;

	}
}
function tick(){
	for(var i = 0; i<rows; i++){
		for(var k = 0; k<rows; k++){
			var b = box.cells[i][k];
			b.n();
		}
	}
	var total = 0;
	for(var i = 0; i<rows; i++){
		for(var k = 0; k<rows; k++){
			var b = box.cells[i][k];
			total += b.change();
		}
	}
	if(total < 1){
		pause();
	}

}
function mouseDown(){
	mDown = true;
	if(playing == false){
			var x = Math.floor((mouseX)/(box.width/rows));
			var y = Math.floor((mouseY)/(box.width/rows));
			if(x > -1 && x < rows && y > -1 && y < rows){
				var b = box.cells[x][y];
				b.alive = !b.alive;
				b.draw();
			}
	}
}
function mouseUp(){
		mDown = false;
}
function mousePos(e){
		mouseX = e.pageX - board.offsetLeft;
		mouseY = e.pageY - board.offsetTop;
	if(playing == false && mDown){
		if(mouseX > box.x && mouseX < box.x+box.width && mouseY > box.y && mouseY < box.y+box.width ){
		var x = Math.floor((mouseX)/(box.width/rows));
		var y = Math.floor((mouseY)/(box.width/rows));
		if(x > -1 && x < rows && y > -1 && y < rows){
			var b = box.cells[x][y];
			b.alive = true;
			b.draw();
		}
	}
		
}
}
function pause(){
	playButton.innerHTML = "Play";
	clearInterval(update);
	playing=false;
}