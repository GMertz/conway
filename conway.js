"use strict";
var board;
var rows = 20;
var box={cells:[],x:0,y:0,width:600,r:rows};
var ctx;
var s = 5;
var mouseX= 0,mouseY=0;
var mDown=false;
var update;
var playing = false;
var offSets = [{x:0,y:-1},{x:1,y:-1},{x:1,y:0},{x:1,y:1},{x:0,y:1},{x:-1,y:1},{x:-1,y:0},{x:-1,y:-1}];
/*
weird box spawned at 0,0 for somereason
fucked performance, garbade collection maybe 
let values wrap, add some iffys
*/

window.onload = function(){
	board = document.getElementById("game");
	board.addEventListener("mousedown",mouseDown);
	board.addEventListener("mouseup",mouseUp);
	board.addEventListener("mousemove",mousePos);
	document.getElementById("play").addEventListener("mousedown",play);
	board.width = 600;
	board.height = 600;
	ctx=board.getContext("2d");
	for(var i = 0; i<rows; i++){
		var row = [];
			for(var k = 0; k<rows;k++){
				var c = new cell(i,k,box.width/box.r,false);
				row.push(c);
				c.draw();

			}
		box.cells.push(row);
	}
}
function sketch(x,y,w,alive){
	ctx.fillStyle = "black";
	if(alive){
		ctx.fillStyle = "white";
	}
	ctx.fillRect(x*w,y*w,w-2,w-2);
	ctx.strokeStyle = "white";
	ctx.rect(x,y,w,w);
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
		}
	}
}
function tick(){
	for(var i = 0; i<rows; i++){
		for(var k = 0; k<rows; k++){
			var b = box.cells[i][k];
			b.n();
		}
	}
	for(var i = 0; i<rows; i++){
		for(var k = 0; k<rows; k++){
			var b = box.cells[i][k];
			b.change();
		}
	}

}
function mouseDown(){
	if(playing == false){
		mDown = true;
	}
}
function mouseUp(){
	if(playing == false){
		if(mDown){
			var x = Math.floor((mouseX)/(box.width/rows));
			var y = Math.floor((mouseY)/(box.width/rows));
			if(x > -1 && x < rows && y > -1 && y < rows){
				var b = box.cells[x][y];
				b.alive = !b.alive;
				b.draw();
			}
		}
		mDown = false;
	}
}
function mousePos(e){
	if(playing == false){
		mouseX = e.pageX - board.offsetLeft;
		mouseY = e.pageY - board.offsetTop;
	}
}
function play(){
	if(playing == false){
		update = setInterval(tick,1000/30);
		playing = true;
	}else
		pause();
}
function pause(){
	clearInterval(update);
	playing=false;
}