var canvas='#main';
var n=5;
var stickH=h(n)*(n+3);
var stickW=w(0)/4;
var base=100;

var state;

function w(k)
{
	return 20+20*k;
}

function h(k)
{
	//must be constant, otherwise everything will break
	return 20;
}

function x(k)
{
	return (k+.5)*w(n+3);
}

function stackTop(k)
{
	return base+stickH-h(0)*(state[k].length-.5);
//	if(state[k][0]===undefined)
//		return base+stickH+h(0)/2;
//	else
//	{
//		console.log("Looking for "+state[k][0]);
//		return $(canvas).getLayerGroup(disc(state[k][0])).y;
//	}
}

function disc(k)
{
	return "k"+k;
}

function stickId(i)
{
	return ["x","y","z"][i];
}

function reset()
{
	clearMessages();
	$(canvas).removeLayers();
	$(canvas).clearCanvas();
	state=[[],[],[]];
	for(var i=1;i<=n;++i)
		state[0].push(i);
	console.log(state);
	$(canvas).drawRect({
		layer: true,
		fillStyle: 'gray',
		fromCenter: false,
		x: 0, y: base+stickH, 
		width: w(n+3)*3.5, height: h(0)/2
	});

	for(var i=0;i<3;++i)
	{
		$(canvas).drawRect({
			layer: true,
			fillStyle: 'gray',
			fromCenter: false,
			x: x(i), y: base, 
			width: stickW, height: stickH
		});
		$(canvas).drawText({
			layer: true,
			strokeStyle: 'gray',
			x: x(i), y: base+stickH+h(0), 
			width: stickW, height: stickH,
			text: stickId(i)
		});

	}
	var y=base+stickH-h(0)/2;
	for(var i=n;i>=1;--i)
	{
		$(canvas).drawRect({
			layer: true,
			groups: [disc(i)],
			fillStyle: 'red',
			strokeStyle: 'black',
			cornerRadius: 10,
			data: "magic",
			x: x(0), y: y, 
			width: w(i), height: h(i)
		});
		$(canvas).drawText({
			layer: true,
			groups: [disc(i)],
			strokeStyle: 'black',
			x: x(0), y: y, 
			text: i
		});
		y-=h(i);
	}
}

function decode(stick)
{
	if(stick=='x')
		return 0;
	else if(stick=='y')
		return 1;
	else if(stick=='z')
		return 2;
	throw "Nieznany palik: "+stick;
}

var plan=[
	[0,1],
	[0,2],
	[1,2]
];

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
		if(args.length<3)
			throw "Za mało argumentów w linii "+(i+1);
		var src=decode(args[1]);
		var dst=decode(args[2]);
		if(args[0]===undefined || args[0]==="")
			continue;
		plan.push([src,dst]);
	}
	return plan;
}

function verify(k)
{
	for(var i=0;i<3;++i)
	{
		if(i==k && state[i].length!=n)
			return false;
		if(i!=k && state[i].length!=0)
			return false;
	}
	for(var i=1;i<n;++i)
		if(state[k][i]<=state[k][i-1])
			return false;
	return true;
}

function doStep(i)
{
	if(plan[i]===undefined)
	{
		console.log("Finished");
		console.log(state);
		if(verify(2))
			success("Gratulacje! Wszystkie krążki trafiły na swoje miejsce.");
		if(verify(1))
			info("Prawie Ci się udało, ale krążki miały być na paliku z, a nie y.");
		return;
	}
	console.log("Running step "+i+": ");
	console.log(state);
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

