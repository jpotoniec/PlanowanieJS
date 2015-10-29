"use strict";

var canvas='#main';

var merry;
var map;
var puzzle;
var doors;

var roomW=75;
var roomH=75;
var keyW=12;
var keyH=12;
var margin=5;

var colors={y: 'green',
	r: 'red',
	g: 'orange',
	v: 'pink',
	b: 'blue'
	};

function colorName(x)
{
var names={y: 'zielony',
	r: 'czerwony',
	g: 'pomaranczowy',
	v: 'rozowy',
	b: 'niebieski'
	};
	return names[x];
}

function colorId(x)
{
	var ids={
	z: 'y',
	c: 'r',
	p: 'g',
	r: 'v',
	n: 'b'
	};
	return ids[x.charAt(0)];
}

var chr=String.fromCharCode;

function ord(x)
{
	return x.charCodeAt(0);
}

function roomName(x)
{
	return chr(x+ord('A'));
}

function roomId(x)
{
	return ord(x.toUpperCase())-ord('A')
}

function roomX(x)
{
	return 50+roomW*x;
}

function roomY(y)
{
	return 75+roomH*y;
}

function keyAt(x,y,key)
{
	if(key.color)
	{
		var color=colors[key.color];
		$(canvas).drawEllipse(
		{
			fillStyle: color,
			x: x, y: y, width: keyW, height: keyH
		}
		);
	}
}

function drawKeys(x, y, keys)
{
	for(var j=0;j<keys.length;++j)
	{
		keyAt(x,y,keys[j]);
		x+=keyW+margin;
	}
}

function drawMerry()
{
	var room=map[merry.room];
	$(canvas).drawImage({
		x: roomX(room.x)+roomW/4,
		y: roomY(room.y)+roomH/4,
		scale: .075,
		source: 'men.png'
		}
	);
}

function drawPuzzle()
{
	var x=roomW*4;
	var y=50;
	var block=30;
	var fill="#e0e0e0";
	if(isPuzzleSolved())
		fill="#ccffcc";
	for(var row=0;row<puzzle.length;++row)
	for(var col=0;col<puzzle[row].length;++col)
	{
		var x=roomW*4+block*col;
		var y=50+block*row;
		$(canvas).drawRect(
		{
			x: x,
			y: y,
			width: block,
			height: block,
			strokeStyle: 'black',
			fillStyle: (puzzle[row][col]>0?fill:'white')
		}
		);
		if(puzzle[row][col]>0)
			$(canvas).drawText({text: puzzle[row][col],x:x, y:y, strokeStyle: 'black', fillStyle: 'black'});
	}
}

function redraw()
{
	$(canvas).removeLayers();
	$(canvas).clearCanvas();
	console.log(map);
	drawKeys(50, 25, merry.keys);
	for(var i=0;i<map.length;++i)
	{
		var x=roomX(map[i].x);
		var y=roomY(map[i].y);
		$(canvas).drawRect(
		{
			x: x,
			y: y,
			width: roomW,
			height: roomH,
			strokeStyle: 'black'
		}
		);
		$(canvas).drawText({text: roomName(i),x:x-roomW/4, y:y+roomW/4, strokeStyle: 'black', fillStyle: 'black'});
		var x=roomX(map[i].x)-keyW*map[i].keys.length/2-margin*(map[i].keys.length-1)/2;
		var y=roomY(map[i].y)-keyH/2;
		drawKeys(x,y, map[i].keys);
	}
	$(canvas).drawImage({
		x: roomX(map[6].x),
		y: roomY(map[6].y),
		scale: .2,
		source: 'ladder.png'
		}
	);

	for(var i=0;i<doors.length;++i)
	{
		var x1=roomX(map[doors[i].src].x);
		var y1=roomY(map[doors[i].src].y);
		var x2=roomX(map[doors[i].dst].x);
		var y2=roomY(map[doors[i].dst].y);
		var dx=0,dy=0;
		if(x1!=x2)
			dx=roomW*(1/2-1/8);
		if(x1>x2)
			dx*=-1;
		if(y1!=y2)
			dy=roomH*(1/2-1/8);
		if(y1>y2)
			dy*=-1;
		$(canvas).drawLine(
		{
			strokeStyle: colors[doors[i].color],
			strokeWidth: 5,
			x1: x1+dx, y1: y1+dy,
			x2: x2-dx, y2: y2-dy,
			startArrow: doors[i].bd,
			endArrow: true,
			arrowRadius: 5
		}
		);
	}
	drawPuzzle();
	drawMerry();

}

function reset()
{
	var x="";
	for(var id in colors)
	{
		x+='<code style="color: '+colors[id]+'">'+colorName(id)+'</code> ';
	}
	$("#colors").html(x);

	map=[
		{x: 0, y: 0, keys: [ {color: 'y'}]},
		{x: 1, y: 0, keys: [ {color: 'v'}]},
		{x: 0, y: 1, keys: [ {color: 'g'}, {color: 'b'} ]},
		{x: 1, y: 1, keys: [ {color: 'y'}, {color: 'r'} ]},
		{x: 0, y: 2, keys: [ {color: 'b'}, {color: 'y'} ]},
		{x: 1, y: 2, keys: [ {color: 'b'}, {color: 'b'} ]},
		{x: 2, y: 2, keys: [  ]},
		{x: 0, y: 3, keys: [ {color: 'y'}, {color: 'r'} ]},
		{x: 1, y: 3, keys: [ {color: 'g'}, {color: 'b'} ]}
	];
	doors=[
		{src: 0, dst: 1, bd: false, color: 'g'},
		{src: 0, dst: 2, bd: true, color: 'r'},
		{src: 1, dst: 3, bd: false, color: 'g'},
		{src: 2, dst: 4, bd: true, color: 'y'},
		{src: 3, dst: 5, bd: true, color: 'y'},
		{src: 4, dst: 5, bd: true, color: 'b'},
		{src: 5, dst: 6, bd: false, color: 'v'},
		{src: 4, dst: 7, bd: true, color: 'r'},
		{src: 5, dst: 8, bd: true, color: 'b'},
		{src: 7, dst: 8, bd: true, color: 'b'},
	];
	puzzle=[[5,4,1],[8,0,3],[7,2,6]];
	merry={room: 5, keys: []};
	clearMessages();
	redraw();
}

var plan=[];

function decodePlan(text)
{
	var plan=[];
	var lines=text.split("\n");
	for(var i=0;i<lines.length;++i)
	{
		var l=lines[i];
		l=l.replace("(","");
		l=l.replace(")","");
		if(l=="")
			continue;
		var args=l.split(" ");
		if(args.length<2)
			throw "Za mało argumentów w linii "+(i+1);
		var cmd;
		if(args[0]===undefined || args[0]==="")
			continue;
		if(/^wez/i.test(args[0]))
		{
			var c=colorId(args[1]);
			if(c===undefined)
				throw "Nie znam koloru "+args[1];
			plan.push(["pick",c]);
		}
		else if(/^idz/i.test(args[0]))
		{
			var id=roomId(args[1]);
			if(id<0 || id>=map.length)
				throw "Nie znam pokoju "+args[1];
			console.log(args[1]+" -> "+id);
			plan.push(["go",id]);
		}
		else if(/^przesun/i.test(args[0]))
		{
			console.log(args[1]);
			var n=/[1-9]/.exec(args[1]);
			if(n===null)
				throw "Nie znam klocka "+args[1];
			plan.push(["move",n[0]]);
		}
		else
			throw "Nie rozpoznaję polecenia w linii "+(i+1)+": "+lines[i];
	}
	return plan;
}

function pick(col)
{
	for(var j=0;j<map[merry.room].keys.length;++j)
		if(map[merry.room].keys[j].color==col)
		{
			merry.keys.push(map[merry.room].keys[j]);
			map[merry.room].keys[j]={};
			return;
		}
	throw "Nie ma klucza koloru "+colorName(col)+" w tym pokoju!";
}

function findKey(col)
{
	for(var i=0;i<merry.keys.length;++i)
		if(merry.keys[i].color==col)
			return i;
	return -1;
}

function go(room)
{
	for(var i=0;i<doors.length;++i)
	{
		var key=findKey(doors[i].color);
		if(key>=0 &&
		(
			(doors[i].src==merry.room && doors[i].dst==room) ||
			(doors[i].src==room && doors[i].dst==merry.room && doors[i].bd)
		))
		{
			merry.room=room;
			merry.keys[key]={};
			return;
		}
		
	}
	throw "Nie mogę pójść do "+roomName(room);
}

function move(piece)
{
	var d=[[-1,0],[1,0],[0,-1],[0,1]];
	for(var row=0;row<puzzle.length;++row)
		for(var col=0;col<puzzle[row].length;++col)
		{
			if(puzzle[row][col]==piece)
			{
				console.log(piece+" found @("+row+" "+col+")");
				for(var i=0;i<d.length;++i)
				{
					var nr=row+d[i][0];
					var nc=col+d[i][1];
					if(puzzle[nr]!==undefined && puzzle[nr][nc]!==undefined && puzzle[nr][nc]==0)
					{
						puzzle[nr][nc]=piece;
						puzzle[row][col]=0;
						return;
					}
				}
			}
		}
	throw "Nie mogę przesunąc klocka "+piece;
}

function isPuzzleSolved()
{
	var good=[[1,2,3],[4,5,6],[7,8,0]];
	for(var row=0;row<good.length;++row)
		for(var col=0;col<good[row].length;++col)
			if(puzzle[row][col]!=good[row][col])
				return false;
	return true;
}

function doStep(i)
{
	if(plan[i]===undefined)
	{
		console.log("Finished");
		console.log(merry);
		if(merry.room==6)
		{
			if(isPuzzleSolved())
				success("Gratulacje! Merry dotarł do wyjścia z piwnicy.");
			else
				info("Prawie Ci się udało, ale Merry nie rozwiązał łamigłówki i nadal nie może się wydostać z piwnicy.");
		}
		else
			error("Niestety, Merry nadal tkwi w piwnicy :(");
		return;
	}
	console.log("Running step "+i+": ");
	console.log(plan[i]);
	if(plan[i][0]=="pick")
		pick(plan[i][1]);
	else if(plan[i][0]=="go")
		go(plan[i][1]);
	else if(plan[i][0]=="move")
	{
		if(merry.room==0)
			move(plan[i][1]);
		else
			throw "Żeby przesuwać klocki łamigłówki Merry musi być w pomieszczeniu "+roomName(0);
	}
	redraw();
	var speed=new Number($('#speed').val()).valueOf();
	window.setTimeout(function(){
	try {
		doStep(i+1);
	} catch(e) {
		error(e);
	}
	},speed);
//	doStep(i+1);
	/*
	var src=plan[i][0];
	var dst=plan[i][1];
	if(state[src][0]===undefined)
	{
		error("Palik źródłowy jest pusty");
		return;
	}
	var name=disc(state[src][0]);
	var subject=state[src].shift();
	var dstx=x(dst);
	var dsty=stackTop(dst)-h(subject);
	if(state[dst][0]!==undefined && subject>=state[dst][0])
	{
		error("Nie można położyć krążka "+subject+" na krążek "+state[dst][0]);
		return;
	}
	state[dst].unshift(subject);
	var speed=new Number($('#speed').val()).valueOf();
	var counter=0;
	$(canvas)
		.animateLayerGroup(name, {y: base/2}, speed)
		.animateLayerGroup(name, {x: dstx}, speed)
		.animateLayerGroup(name, {y: dsty}, speed, function(layer) {
			++counter;
			if(counter==2)
				doStep(i+1);
		})
		;
		*/
}

function cheat(n, a, b, c)
{
	var result="";
	if(n>0)
	{
		result+=cheat(n-1, a, c, b);
		result+="(przesun "+a+" "+c+")\n";
		result+=cheat(n-1, b, a, c);
	}
	return result;
}

function run()
{
	try {
		plan=decodePlan($('#plan').val());
		doStep(0);
	} catch(e) {
		error(e);
	}
}

