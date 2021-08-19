(function($){
	$.isset=function(variable){
		return typeof variable!='undefined';
	};
	$.fn.jsonResponse=function(data){
		if(typeof res=='string') data=$.parseJSON(data);
		return $(this).html(data.msg).removeClass('alert warning success').addClass('alert-box').addClass(data.result===true?'success':(data.result===false?'alert':'warning'));
	};
	$.fn.addList=function(linkClass, listID){
		var me=this;
		$.each(listID,function(k,v){
			$(me).append('<li><a href="#'+k+'" class="'+linkClass+' button" data-id="'+v+'">'+v+'</a></li>');
			return true;
		});
		return this;
	};
	$.fn.setReadStatus=function(quizSet,readStatus){
		$(this).find('li>a').removeClass('secondary');
		for(var i in readStatus[quizSet])
			$(this).find('li>a[data-id="'+readStatus[quizSet][i]+'"]').addClass('secondary');
		return this;
	};
	$.fn.outerHTML = function() {
		return $('<div />').append($(this).eq(0).clone()).html();
	};
	$.fn.toTimer=function(act,time){
		var me=this;
		$.toTimer(act,time,function(cb){
			$(me).html('<span>'+cb[0]+'</span>:<span>'+cb[1]+'</span>');console.log(cb);
		});
		return me;
	};
	$.fn.toTimer=function(ms){
		ms/=1000;
		return $(this).html($.map([Math.floor(ms/60),ms%60],function(v){
			return ('0'+v).slice(-2);
		}).join(':'));
	};
	$.fn.edittableScoreboard=function($C, numQuiz, score, items){
		var table = '<table width="100%" border="0"><thead class="text-center"><tr><th rowspan="2" scope="col">Del</th><th rowspan="2" scope="col">No</th><th rowspan="2" scope="col">Team\'s name</th>';
		table+='<th colspan="'+items.length+'" scope="col">Items</th>';
        table+='<th colspan="'+(numQuiz+1)+'" scope="col">Quiz No. (score)</th></tr><tr>';
		for(var i in items)
			table+='<td><img src="/'+$C.ITEM_FOLDER+'/'+items[i]+'" alt="'+items[i]+'"></td>';
		for(var i=1;i<=numQuiz;i++)
			table+='<td>'+i+'</td>';
		table+='<td>Total</td></tr></thead><tbody>';
		
		// render row
		table+=$.map(score, function(v,k){
			if(v==null) return "";
			var row='<tr id="tr_'+k+'"><td class="text-center"><a href="#tr_'+k+'" class="removeSc" data-id="tr_'+k+'" data-name="'+v.teamName+'">Del</a></td><td class="text-center">'+k+'</td><td><input name="index['+k+']" type="hidden" value="'+k+'"><input name="teamName['+k+']" type="text" id="teamName_'+k+'" value="'+v.teamName+'"></td>';
			// item cells
			for(var i in items)
				row+='<td><input name="item['+k+']['+items[i]+']" type="number" min="0" value="'+($.isset(v.item[items[i]])?v.item[items[i]]:0)+'"></td>';
			
			// Score cells
			var sum = 0;
			for(var i=1;i<=numQuiz;i++){
				val=$.isset(v.score[i])?parseFloat(v.score[i]):0;
				val=isNaN(val)?0:val;
				sum+=val;
				row+='<td><input name="score['+k+']['+i+']" type="text" value="'+val+'"></td>';
			}
			row+='<td class="text-center">'+sum+'</td></tr>';
			return row;
		}).join('');
        table+='</tbody></table>';
		$(this).html(table).find('a.removeSc').click(function(e) {
            e.preventDefault();
			if(confirm('Do you want to remove scores of "'+$(this).data('name')+'"?'))
				$('#'+$(this).data('id')).remove();
        });
		return this;
	};
	$.fn.monitorScoreboard=function($C, numQuiz, score, full){
		var table = '<table width="100%" border="0"><thead class="text-center"><tr><th rowspan="2" scope="col">No</th><th rowspan="2" scope="col">Team\'s name</th>';
		table+='<th rowspan="2" scope="col">Items</th>';
        table+=full?'<th colspan="'+(numQuiz+1)+'" scope="col">Score</th></tr><tr><td>Total</td>':'<th rowspan="2" scope="col">Total<br/>Score</th>';
		
		if(full){
			for(var i=1;i<=numQuiz;i++)
				table+='<td>'+i+'</td>';
		}
		table+='</tr></thead><tbody>';
		
		// render row
		table+=$.map(score, function(v,k){
			if(v==null || k==0) return "";
			var row='<tr id="tr_'+k+'"><td class="text-center">'+k+'</td><td>'+v.teamName+'</td>';
			// item cells
			row+='<td class="tdIMG">';
			row+=$.map(v.item,function(val,key){
				val=parseInt(val);
				var arr=[];
				for(val=isNaN(val)?0:val;val>0;val--)
					arr.push('<img src="/'+$C.ITEM_FOLDER+'/'+key+'" alt="'+key+'">');
				return arr.join(' ');
			}).join(' ');
			row+='</td>';
			
			// Score cells
			var sum = [0,""];
			for(var i=1;i<=numQuiz;i++){
				val=$.isset(v.score[i])?parseFloat(v.score[i]):0;
				val=isNaN(val)?0:val;
				sum[0]+=val;
				if(full) sum[1]+='<td class="text-center">'+val+'</td>';
			}
			row+='<td class="text-center">'+sum[0]+'</td>'+sum[1]+'</tr>';
			return row;
		}).join('');
        table+='</tbody></table>';
		return $(this).html(table);
	};
	$.fn.chkList=function(root, list){
		var me=$(this).html('');
		$.map(list, function(v){
			$(me).append('<label><input name="overlay[]" type="checkbox" value="'+root+'/'+v+'"> '+v+'</label>');
		});
		return me;
	};
	$.fn.toSumScore=function(score){
		var sum={};
		$(this).html('');
		for(var j in score){
			if(j==0) continue;
			sum[j]=0;
			
			if(score[j]==null) continue;
			if(!$.isset(score[j].score)) continue;
			for(var i=1;i<=score[j].score.length;i++){
				numQuiz=parseFloat(score[j].score[i]);
				sum[j]+=isNaN(numQuiz)?0:numQuiz;
			}
			$(this).append('<li><h3>'+score[j].teamName+'<br><span>'+sum[j]+'</span></h3></li>');
		}
		return sum;
	};
	$.fn.tickChkOvl=function(list){
		var me=this;
		$(me).find(':checked').prop('checked',false);
		$.map(list, function(v){
			$(me).find(':checkbox[value="'+v+'"]').prop('checked',true);
		});
		return me;
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
					case row.stop!=null:
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