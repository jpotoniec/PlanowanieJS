var tiles = {
	WALL: 0,
	FLOOR: 1,
	TARGET: 2,
	PACK: 4,
	ROBOT: 8
};

var fw=20;
var fh=20;

var map=[
	[tiles.FLOOR, tiles.FLOOR, tiles.FLOOR, tiles.FLOOR, tiles.FLOOR],
	[tiles.FLOOR, tiles.FLOOR, tiles.FLOOR, tiles.FLOOR, tiles.FLOOR],
	[tiles.FLOOR, tiles.FLOOR, tiles.FLOOR, tiles.FLOOR, tiles.FLOOR],
	[tiles.FLOOR, tiles.FLOOR, tiles.FLOOR, tiles.FLOOR, tiles.FLOOR],
	[tiles.FLOOR, tiles.FLOOR, tiles.FLOOR, tiles.FLOOR, tiles.FLOOR]
];

var gsoko1="@@@@@@@@@@@@@@@@@@@@\n"+
"@@@@@@@@@@@@@@@@@@@@\n"+
"@@@@@@@@@@@@@@@@@@@@\n"+
"@@@@@@   @@@@@@@@@@@\n"+
"@@@@@@o  @@@@@@@@@@@\n"+
"@@@@@@  o@@@@@@@@@@@\n"+
"@@@@  o o @@@@@@@@@@\n"+
"@@@@ @ @@ @@@@@@@@@@\n"+
"@@   @ @@ @@@@@  xx@\n"+
"@@ o  o          xx@\n"+
"@@@@@@ @@@ @^@@  xx@\n"+
"@@@@@@     @@@@@@@@@\n"+
"@@@@@@@@@@@@@@@@@@@@\n"+
"@@@@@@@@@@@@@@@@@@@@\n"+
"@@@@@@@@@@@@@@@@@@@@\n"+
"@@@@@@@@@@@@@@@@@@@@\n";

var gsoko1a="@@@@@@@@@@@@@@@@@@@@\n"+
"@@@@@@@@@@@@@@@@@@@@\n"+
"@@@@@@@@@@@@@@@@@@@@\n"+
"@@@@@@   @@@@@@@@@@@\n"+
"@@@@@@   @@@@@@@@@@@\n"+
"@@@@@@   @@@@@@@@@@@\n"+
"@@@@  o   @@@@@@@@@@\n"+
"@@@@ @ @@ @@@@@@@@@@\n"+
"@@   @ @@ @@@@@  (x@\n"+
"@@ o  o          (x@\n"+
"@@@@@@ @@@ @^@@  (x@\n"+
"@@@@@@     @@@@@@@@@\n"+
"@@@@@@@@@@@@@@@@@@@@\n"+
"@@@@@@@@@@@@@@@@@@@@\n"+
"@@@@@@@@@@@@@@@@@@@@\n"+
"@@@@@@@@@@@@@@@@@@@@\n";


var gsoko3=
"@@@@@@@@@@@@@@@@@@@@\n"+
"@@@@@@@@@@@@@@@@@@@@\n"+
"@@@@@@@@@@@@@@@@@@@@\n"+
"@@@@@@@@@@@@@@@@@@@@\n"+
"@@@@@@@@@@     <@@@@\n"+
"@@@@@@@@@@ o@o @@@@@\n"+
"@@@@@@@@@@ o  o@@@@@\n"+
"@@@@@@@@@@@o o @@@@@\n"+
"@@@@@@@@@@ o @ @@@@@\n"+
"@@xxxx  @@ o  o  @@@\n"+
"@@@xxx    o  o   @@@\n"+
"@@xxxx  @@@@@@@@@@@@\n"+
"@@@@@@@@@@@@@@@@@@@@\n"+
"@@@@@@@@@@@@@@@@@@@@\n"+
"@@@@@@@@@@@@@@@@@@@@\n"+
"@@@@@@@@@@@@@@@@@@@@\n";

var gsoko39=
"@@@@@@@@@@@@@@@@@@@@\n"+
"@@@@@@@@@@@@@@@@@@@@\n"+
"@@@@@@@@@@@@@@@@@@@@\n"+
"@@@@@@@@@@@ <@@@@@@@\n"+
"@@@@@     o  @@@@@@@\n"+
"@@@@@   o@@ o@@@@@@@\n"+
"@@@@@@o@xxx@ @@@@@@@\n"+
"@@@@@@ oxxx  @@@@@@@\n"+
"@@@@@@ @x x@ @@@@@@@\n"+
"@@@@@@   @ @o @@@@@@\n"+
"@@@@@@o  o    @@@@@@\n"+
"@@@@@@  @@@@@@@@@@@@\n"+
"@@@@@@@@@@@@@@@@@@@@\n"+
"@@@@@@@@@@@@@@@@@@@@\n"+
"@@@@@@@@@@@@@@@@@@@@\n"+
"@@@@@@@@@@@@@@@@@@@@\n";

function decodeMap(str)
{
	var x=0;
	var y=0;
	var result=[];
	for(var i=0;i<str.length;++i)
	{
		if(result[x]===undefined)
		{
			result[x]=[];
		}
		//console.log("(%s,%s,%s,%s)",i,x,y,str.charAt(i));
		switch(str.charAt(i))
		{
			case '@':
				result[x][y]=tiles.WALL;
				break;
			case ' ':
				result[x][y]=tiles.FLOOR;
				break;
			case 'x':
				result[x][y]=tiles.FLOOR|tiles.TARGET;
				break;
			case 'o':
				result[x][y]=tiles.FLOOR|tiles.PACK;
				break;
			case '(':
				result[x][y]=tiles.FLOOR|tiles.PACK|tiles.TARGET;
				break;
			case '^':
			case '<':
			case '>':
			case 'v':
				result[x][y]=tiles.FLOOR|tiles.ROBOT;
				break;
			case '\n':
				y++;
				x=-1;	
				break;
			default:
				error('Unparsable map: '+str.charAt(i));
		}
		x++;
	}
	return result;
}

function draw(x,y,color)
{
	x=x*fw+3*fw/2;
	y=y*fh+3*fh/2;
	$('#main').drawRect({
		  fillStyle: color,
		    x: x, y: y,
		    width: fw-1, height: fh-1
	});
}

function f(x,y)
{
	return "f_"+x+"_"+y;
}

function adj(x1,y1,x2,y2,pred)
{
	return "("+pred+" "+f(x1,y1)+" "+f(x2,y2)+")\n"+
		"("+pred+" "+f(x2,y2)+" "+f(x1,y1)+")\n"
	;
}

function makePDDL(name, map)
{
	var pddl="";
	var fields="";
	var goal="";
	for(var x=0;x<map.length;++x)
		for(var y=0;y<map[x].length;++y)
		{
			if(map[x][y]==tiles.WALL)
				continue;
			fields+=f(x,y)+" ";
			if(map[x+1][y]!=tiles.WALL)
			{
				pddl+=adj(x,y,x+1,y,"poziomo");
			}
			if(map[x][y+1]!=tiles.WALL)
			{
				pddl+=adj(x,y,x,y+1,"pionowo");
			}
			if(map[x][y]&tiles.TARGET)
			{
				pddl+="(cel "+f(x,y)+")\n";
				goal+="(paczka "+f(x,y)+")\n";
			}
			if(map[x][y]&tiles.PACK)
				pddl+="(paczka "+f(x,y)+")\n";
			if(map[x][y]&tiles.ROBOT)
				pddl+="(robot "+f(x,y)+")\n";
		}
	pddl="(define (problem "+name+")\n(:domain sokoban)\n(:objects "+fields+")\n"+"(:init "+pddl+")\n"+"(:goal (and\n"+goal+"))\n)\n";
	return pddl;
}

function move(x1, y1, x2, y2)
{
	console.log("Going from "+w(x1,y1)+" to "+w(x2,y2));
	if(Math.abs(x1-x2)+Math.abs(y1-y2)!=1)
	{
		console.log(w(x1,y1)+" and "+w(x2,y2)+" are not adjacent");
		return false;
	}
	if(!(map[x1][y1]&tiles.ROBOT))
	{
		console.log("Robot not in "+x1+" "+y1);
		return false;
	}
	if(!(map[x2][y2]&tiles.FLOOR))
	{
		console.log("Floor not in "+x2+" "+y2);
		return false;
	}
	if(map[x2][y2]&tiles.PACK)
	{
		console.log("Pack in "+x2+" "+y2);
		return false;
	}
	map[x1][y1]&=~tiles.ROBOT;
	map[x2][y2]|=tiles.ROBOT;
	return true;
}

function w(x,y)
{
	return "("+x+","+y+")";
}

function push(x1, y1, x2, y2)
{
	var x3=x2+(x2-x1);
	var y3=y2+(y2-y1);
	console.log("Pushing from "+w(x2,y2)+" to "+w(x3,y3));
	if(Math.abs(x1-x2)+Math.abs(y1-y2)!=1)
	{
		console.log(w(x1,y1)+" and "+w(x2,y2)+" are not adjacent");
		return false;
	}
	if(!(map[x1][y1]&tiles.ROBOT))
	{
		console.log("Robot not in "+x1+" "+y1);
		return false;
	}
	if(!(map[x2][y2]&tiles.PACK))
	{
		console.log("Pack not in "+x2+" "+y2);
		return false;
	}
	if(!(map[x3][y3]&tiles.FLOOR))
	{
		console.log("Floor not in "+w(x3,y3));
		return false;
	}
	if(map[x3][y3]&tiles.PACK)
	{
		console.log("Pack in "+w(x3,y3));
		return false;
	}
	map[x1][y1]&=~tiles.ROBOT;
	map[x2][y2]&=~tiles.PACK;
	map[x3][y3]|=tiles.PACK;
	map[x2][y2]|=tiles.ROBOT;
	return true;
}

function drawMap(map)
{
	var q=4;
	var grad=$('canvas').createPattern({
		  // Define width/height of pattern (before repeating)
		    width: q, height: q,
		    source: function(context) {
		    // Draw rectangle (which will repeat)
		    $(this).drawRect({
fillStyle: 'red',
x: 0, y: 0,
width: q/2, height: q/2,
fromCenter: false
}).drawRect({
fillStyle: 'green',
x: q/2, y: 0,
width: q/2, height: q/2,
fromCenter: false
}).drawRect({
	fillStyle: 'green',
x: 0, y: q/2,
width: q/2, height: q/2,
fromCenter: false
}).drawRect({
fillStyle: 'red',
x: q/2, y: q/2,
width: q/2, height: q/2,
fromCenter: false
});		        }
	});
	$('#main').clearCanvas();
	for(var x=0;x<map.length;++x)
	{
		for(var y=0;y<map[x].length;++y)
		{
			if(map[x][y]==tiles.WALL)
				draw(x,y,'lightGray');
			else if(map[x][y]&tiles.ROBOT)
				draw(x,y,'yellow');
			else if(map[x][y]&tiles.PACK && map[x][y]&tiles.TARGET)
				draw(x,y,grad);
			else if(map[x][y]&tiles.PACK)
				draw(x,y,'red');
			else if(map[x][y]&tiles.TARGET)
				draw(x,y,'green');
			else if(map[x][y]&tiles.FLOOR)
				draw(x,y,'gray');
		}
	}
	for(var x=0;x<map.length;++x)
		$('#main').drawText({strokeStyle: 'black', x: x*fw+3*fw/2, y: fh/2, text: x, fontSize: 10, strokeWidth: 1});
	for(var y=0;y<map[0].length;++y)
		$('#main').drawText({strokeStyle: 'black', y: y*fh+3*fh/2, x: fw/2, text: y, fontSize: 10, strokeWidth: 1});
//	$('#main').drawLine( {strokeStyle: '#ff0000',
//	  strokeWidth: 2,
//	    x1: 0, y1: 0,
//	      x2: 500, y2: 0,
//	      x3: 500, y3: 500,
//	      x4: 0, y4: 500,
//	      x5: 0, y5: 0});
}

function decField(f)
{
	if(f===undefined)
		return undefined;
	var a=f.split("_");
	if(a[0]!="f")
		return undefined;
	return {x: new Number(a[1]).valueOf(), y: new Number(a[2]).valueOf()};
}

function decodePlan(text)
{
	var plan=[];
	var lines=text.split("\n");
	for(var i=0;i<lines.length;++i)
	{
		var l=lines[i];
		l=l.replace("(","");
		l=l.replace(")","");
		var args=l.split(" ");
		var src=decField(args[1]);
		var dst=decField(args[2]);
		if(args[0]===undefined || args[0]==="")
			continue;
		if(args[0].search('idz')==0)
		{
			plan.push({cmd: "move", src: src, dst: dst, line: {no: i+1, val: l}});
		}
		else if(args[0].search('pchaj')==0)
		{
			plan.push({cmd: "push", src: src, dst: dst, line: {no: i+1, val: l}});
		}
		else
			error("Nie udalo sie wykonac kroku z linii "+(i+1)+". Nieznane polecenie "+args[0]);
	}
	return plan;
}

function step(plan, i)
{
	var src=plan[i].src;
	var dst=plan[i].dst;
	if(plan[i].cmd=="move")
	{
		if(!move(src.x,src.y,dst.x,dst.y))
		{
			error("Nie udalo sie wykonac kroku z linii "+plan[i].line.no+": "+plan[i].line.val);
			return false;
		}
	}
	if(plan[i].cmd=="push")
	{
		if(!push(src.x,src.y,dst.x,dst.y))
		{
			error("Nie udalo sie wykonac kroku z linii "+plan[i].line.no+": "+plan[i].line.val);
			return false;
		}

	}
	drawMap(map);
	if(plan[i+1]!==undefined)
		window.setTimeout(function(){step(plan, i+1)}, new Number($('#speed').val()).valueOf());
	else
	{
		var packs=0;
	for(var x=0;x<map.length;++x)
		for(var y=0;y<map[x].length;++y)
			if(map[x][y]&tiles.PACK && !(map[x][y]&tiles.TARGET))
				packs++;
	if(packs==0)
		success('Sukces! Wszystkie paczki dotarły na miejsce!');
	}
	return true;
}

function run()
{
	var plan=decodePlan($('#plan').val());
	step(plan, 0);
}

function reset()
{
	clearMessages();
	map=decodeMap(gsoko1a);
	drawMap(map);
	$('#pddl').val(makePDDL("gsoko1a", map));
}
