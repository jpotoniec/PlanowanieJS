function clearMessages()
{
	if($('#infobox'))
		$('#infobox').empty();
}

function box(type, e)
{
	if($('#infobox'))
		$('#infobox').append('<div class="alert alert-'+type+' alert-dismissable"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>'+e+'</div>');
	else
		alert(e);
}

function error(e)
{
	box('danger', e);
}

function info(e)
{
	box('info', e);
}

function success(e)
{
	box('success', e);
}
