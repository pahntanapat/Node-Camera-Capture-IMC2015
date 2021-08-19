(function($){
	$.isset=function(variable){
		return typeof variable!='undefined';
	};
	$.fn.order=function(){ // Sorting function
		return $(this).find('li').sort(function(a, b){
			return parseFloat($(a).data('order'))>parseFloat($(b).data('order'));
		}).appendTo(this);
	};
	$.IPtoID=function(text){ // replace . dot to _ underscore
		return text.replace(/(\.|\:)/g,'_');
	};
	$.fn.showIMG=function(data, range){ // get data of each images form a camera and show it in #pic
		if(data.order>=range[0] && data.order<=range[1]){
			if($(this).find('#'+ $.IPtoID(data.ip)).length==0) // if there is no DIV to show received picture, create it!
				$(this).append('<li id="'+$.IPtoID(data.ip)+'"></li>');
			// Set picture to thumbnail area
			 $(this).find('#'+ $.IPtoID(data.ip)).html('<h2>'+data.order+'. '+data.name+' <small>'+data.time+'</small></h2><img src="'+data.picture+'"/>').data('order',data.order);
		}
		return this;
	};
	$.fn.jsonResponse=function(data){
		if(typeof res=='string') data=$.parseJSON(data);
		return $(this).html(data.msg).removeClass('alert warning success').addClass('alert-box').addClass(data.result===true?'success':(data.result===false?'alert':'warning'));
	};
	$.fn.setAllIMG=function(quizNo, data, range){ // get images from cameras and show in this
		$(this).html('');
		for(var i in data) $(this).showIMG(data[i], range);
		return $(this).order();
	};
	$.alertConnect=function(msg){
		if($('#alertConnection').length==0)
			$('body').append('<div id="alertConnection"></div>');
		
		$('#alertConnection')
			.html('<div><span class="close">&times;</span><br/>'+msg+'</div>')
			.fadeIn("fast",function(){
				setTimeout(function(){
					$('#alertConnection').fadeOut("slow");
				}, 5000);
			}).find('span.close').click(function(e) {
                $(this).parent().parent().html('');
            });
			return $('#alertConnection');
	};
	$.toTimestamp=function(dateStr){
		return dateStr?Date.parse(dateStr):null;
	};
	$.toLocaleString=function(datetime){
		return datetime?(new Date(datetime).toLocaleString()):null;
	};
	$.fn.connTable=function(json){
		pingTime=Date.now();
		html='<table width="100%" border="0"><tr><th scope="col"><i class="fa fa-circle-o"></i></th><th scope="col">IP</th><th scope="col">Socket</th><th scope="col">Connects Since</th><th scope="col">Last Connection</th><th scope="col">Disconnect</th></tr>';
		for(var ip in json){
			for(var tag in json[ip]){
				row={};
				for(var i in json[ip][tag])
					row[i]=$.toTimestamp(json[ip][tag][i]);
				
				html+='<tr><td><i class="fa fa-circle ';
				if(!row.last) row.last=row.start;
				
				switch(true){
					case  row.stop!=null:
						html+='lost';
						break;
					case row.last+90000<pingTime:
						html+='risk';
						break;
					case row.last+45000<pingTime:
						html+='warn';
						break;
					default:
						html+='healthy';
						break;
				}
				html+='"></i></td><td>'+ip+'</td><td>'+tag+'</td><td>'+$.toLocaleString(row.start)+'</td><td>'+$.toLocaleString(row.last)+'</td><td>'+$.toLocaleString(row.stop)+'</td></tr>';
			}
		}
		html+='</table>';
		return $(this).html(html);
	};
}(jQuery));
$(document).ready(function(e) {
    $(':button,:submit,:reset,button').addClass('button');
	$('ul.dir-grid-std').addClass('small-block-grid-2 medium-block-grid-3 large-block-grid-4 dir-grid button-group')
		.find('a').addClass('button');
});