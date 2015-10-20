var canvas='#main';

var leftMargin=25;
var margin=5;
var blockWidth=25;
var blockHeight=25;
var base=300;
var state;

var problems=[
{
	n: 8,
	init: function()
	{
		state=[];
		for(var i=0;i<this.n;++i)
			state.push([]);
		state[4]=['a','b','c'];
		state[5]=['d','e'];
		// assert n >= number of blocks
		return state;
	},
	verify: function(state)
	{
	//d stoi na b, które stoi na przynajmniej jednej innej paczce
		var loc=getLocation('d');
		var i=state[loc].indexOf('d');
		if(state[loc][i-1]!='b')
			return false;
		if(i-2<0)
			return false;
		return true;
	},
	example: "(podnies-z-paczki c b)\n"+
	"(opusc-na-podloge c)\n"+
	"(podnies-z-paczki b a)\n"+
	"(opusc-na-paczke e b)\n"+
	"(podnies-z-podlogi d)\n",
	name: "5 klocków",
	goal: "<em>d</em> stoi na <em>b</em>, które stoi na przynajmniej jednej innej paczce"
},
{
	n: 8,
	init: function()
	{
		state=[];
		for(var i=0;i<this.n;++i)
			state.push([]);
		state[4]=['a','b','c'];
		state[5]=['d','e'];
		// assert n >= number of blocks
		return state;
	},
	verify: function(state)
	{
		var x=0;
		for(var i=0;i<this.n;++i)
		{
			if(state[i].length>=2)
				return false;
			x+=state[i].length;
		}
		return x==5;
	},
	example: "(podnies-z-paczki c b)\n"+
	"(opusc-na-podloge c)\n"+
	"(podnies-z-paczki b a)\n"+
	"(opusc-na-paczke e b)\n"+
	"(podnies-z-podlogi d)\n",
	name: "Wszyscy na ziemię",
	goal: "Wszystkie paczki leżą na podłodze"
},
{
	n: 8,
	init: function()
	{
		state=[];
		for(var i=0;i<this.n;++i)
			state.push([String.fromCharCode("a".charCodeAt()+i)]);
		return state;
	},
	verify: function(state)
	{
		for(var i=0;i<this.n;++i)
			if(state[i].length==this.n)
				return true;
		return false;
	},
	example: "(podnies-z-paczki c b)\n"+
	"(opusc-na-podloge c)\n"+
	"(podnies-z-paczki b a)\n"+
	"(opusc-na-paczke e b)\n"+
	"(podnies-z-podlogi d)\n",
	name: "Rozsypanka",
	goal: "Wszystkie paczki leżą na jednym stosie"
},
];

var currentProblem;

function createMenu()
{
	for(var i=0;i<problems.length;++i)
		$('#menu').append("<button type='button' class='btn btn-default navbar-btn' onclick='loadProblem(problems["+i+"]);'>"+problems[i].name+"</button>");
}

function loadProblem(problem)
{
	console.log(problem.name);
	currentProblem=problem;
	$('#goal').html(currentProblem.goal);
	$('#problem-name').html(currentProblem.name);
	if($('#plan').val()=="")
		$('#plan').val(currentProblem.example);
	reset();
}

function clutchX()
{
	return getX(currentProblem.n/2);
}

function clutchY()
{
	return 50;
}

function reset()
{
	clearMessages();
	$(canvas).removeLayers();
	$(canvas).clearCanvas();
	state=currentProblem.init();
	picked=undefined;
	var n=currentProblem.n;
	$(canvas).drawRect({
		layer: true,
		fillStyle: 'gray',
		fromCenter: false,
		x: 0, y: base, 
		width: getX(n)+blockWidth, height: margin
	});
	for(var i=0;i<state.length;++i)
	{
		var y=base-blockHeight/2;
		var x=getX(i);
		for(var j=0;j<state[i].length;++j)
		{
			$(canvas).drawRect({
				layer: true,
				groups: [state[i][j]],
				fillStyle: 'red',
				strokeStyle: 'black',
				x: x, y: y, 
				width: blockWidth, height: blockHeight
			});
			$(canvas).drawText({
				layer: true,
				groups: [state[i][j]],
				strokeStyle: 'black',
				x: x, y: y, 
				text: state[i][j]
			});
			y-=blockHeight;
		}
	}
}

function getX(loc)
{
	return leftMargin+(margin+blockWidth)*loc;
}

function getHeight(loc)
{
	return state[loc].length*blockHeight;
}

function getLocation(id)
{
	for(var i=0;i<state.length;++i)
	{
		if(state[i].indexOf(id)>=0)
			return i;
	}
	return undefined;
}

function speed()
{
	return new Number($('#speed').val()).valueOf();
}

var picked;

function pick(what, f)
{
	if(picked!==undefined)
	{
		error("Nie można podnieść dwóch paczek jednocześnie");
		return;
	}
	console.log("Picking "+what+" from "+getLocation(what));
	picked=state[getLocation(what)].pop();
	console.log("Picked "+picked);
	if(picked!=what)
	{
		error("Nie można podnieść "+what+", bo nie jest na szczycie stosu");
		return;
	}
	var counter=0;
	var last=$(canvas).getLayerGroup(what).length;
	$(canvas)
		.animateLayerGroup(what, {y: clutchY()}, speed())
		.animateLayerGroup(what, {x: clutchX()}, speed(), function(layer)
		{
			counter++;
			if(counter<last)
				return;
			if(f!==undefined)
				f();
		});
}

function put(loc, f)
{
	if(picked===undefined)
	{
		error("Nic nie jest podniesione");
		return;
	}
	var dstX=getX(loc);
	var dstY=base-getHeight(loc)-blockHeight/2;
	var counter=0;
	var last=$(canvas).getLayerGroup(picked).length;
	$(canvas)
		.animateLayerGroup(picked, {x: dstX}, speed())
		.animateLayerGroup(picked, {y: dstY}, speed(), function(layer)
		{
			counter++;
			if(counter<last)
				return;
			state[loc].push(picked);
			picked=undefined;
			if(f!==undefined)
				f();
		});
}

function step(plan, i)
{
	if(i>=plan.length)
	{
		if(currentProblem.verify(state))
			success("Gratulacje! Udało Ci się poustawiać klocki.");
		return;
	}
	var cmd=plan[i];
	var next=function() {step(plan, i+1);};
	if(cmd.args[0].search("podnies")==0)
	{
		if(cmd.args[1]==undefined)
		{
			error("Za mało argumentów dla operatora "+cmd.args[0]+" w linii "+cmd.line);
			return;
		}
		pick(cmd.args[1], next);
	}
	else if(cmd.args[0].search("opusc")==0)
	{
		var loc;
		if(cmd.args[1] && cmd.args[1]!=picked)
		{
			loc=getLocation(cmd.args[1]);
			if(loc!==undefined)
			{
				if(state[loc][state[loc].length-1]!=cmd.args[1])
				{
					error("Nie można położyć na klocek, który nie jest na szczycie stosu");
					return;
				}
			}
		}
		if(loc===undefined)
		{
			for(loc=0;loc<state.length;++loc)
				if(state[loc].length==0)
					break;
		}
		put(loc, next);
	}
	else
		error("Nieznany operator "+cmd.args[0]+" w linii "+cmd.line);
}

function run()
{
	var plan=decodePlan($('#plan').val());
	step(plan, 0);
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
		if(l=="")
			continue;
		var args=l.split(" ");
		plan.push({args: args, line: i+1});
	}
	return plan;
}


