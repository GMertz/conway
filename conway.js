"use strict";
var board;
var rows = 10;
var box={cells:[],x:300,y:300,halfWidth:250,r:rows};
var ctx;
var s = 5;

window.onload = function(){
	board = document.getElementById("game");
	board.width = 600;
	board.height = 600;
	ctx=board.getContext("2d");
	for(var i = 0; i<rows; i++){
		var row = [];
			for(var k = 0; k<rows;k++){
			var alive = Math.random();

			if(alive > .6){
				alive = true;
				console.log("thats one alive");
			}
			else
				alive = false;

			row.push(new cell(i,k,box.halfWidth*2*box.rows,alive));
		}
		box.cells.push(row);	
	}
	setInterval(tick,1000/20);
}
function sketch(path,alive){
	console.log("OMG ITS",alive);
	ctx.beginPath();
	for(var i=0; i<path.length; i++){
		ctx.moveTo(path.p[i][0]*s,path.p[i][1]*s);
	}
	ctx.closePath();
	ctx.fillStyle = "white"
	ctx.stroke();
	if(!alive)
		ctx.fillStyle = "black";
	ctx.fill();
}
function cell (x,y,hw,a){
	this.x = x;
	this.y = y;
	this.alive = a;
	this.path = {p:[{x:x-hw,y:y-hw},{x:x+hw,y:y-hw},{x:x+hw,y:y+hw},{x:x-hw,y:y+hw}]};
	this.n = function(){
		console.log("called");
		sketch(this.path,this.alive);
		var s = 0;
		for(var i = 0; i<2*Math.PI; i+=Math.PI/4){
			var x = this.x+Math.ceil(Math.cos(i));
			var y = this.y+Math.ceil(Math.sin(i));
			var sq = box.cells[this.x+x][this.y+y];//its mad here
			console.log(sq);
			if(sq.alive){
				s++;
			}
		}
		if(s<2 || s> 3)
			this.alive = false;
		if(s == 3)
			this.alive = true;
	}
}
function tick(){
	for(var i = 0; i<rows; i++){
		for(var k = 0; k<rows; k++){
			box.cells[i][k].n();
		}
	}

}