var count;
var tr; 
var table;
var tbody;
var colNo;
var year;
var months;
var uid;
/////////////////////////
//
// google chart
//
////////////////////////
var simpleEncoding = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
 
function simpleEncode(values,maxValue) {

var chartData = ['s:'];
  for (var i = 0; i < values.length; i++) {
    var currentValue = values[i];
    if (!isNaN(currentValue) && currentValue >= 0) {
    chartData.push(simpleEncoding.charAt(Math.round((simpleEncoding.length-1) * currentValue / maxValue)));
    }
      else {
      chartData.push('_');
      }
  }
return chartData.join('');
}

//////////////////////
//
// start
//
//////////////////////



function startgen(){
document.getElementById("startBtn").disabled = 'true';
document.getElementById('htmlcode').value = '';
var output_div = document.getElementById('output');
if(document.getElementById('doubanlist') != null)
	output_div.removeChild(document.getElementById('doubanlist'));
if(document.getElementById('chartMonth') != null)
	output_div.removeChild(document.getElementById('chartMonth'));

keyword = document.getElementById('name').value;
if(keyword == ''){
	document.getElementById("startBtn").disabled = '';
	alert('用户名不能为空');
	return;
}

// 用户输入url
if(keyword.indexOf('http://www.douban.com/people/') != -1){
	keyword = keyword.substring(0, keyword.lastIndexOf('/'));
	keyword = keyword.substr('http://www.douban.com/people/'.length);
}

DOUBAN.apikey = '203bcd6fc05d710960b3684f4118531b';
DOUBAN.searchUsers({
	keyword:keyword,
	callback:function(user){
		if(user.entry.length == 0){
			document.getElementById("startBtn").disabled = '';
			alert('没有找到此用户请重新输入');
		}
		else if(user.entry.length == 1){
			id = user.entry[0].id.$t.substring(user.entry[0].id.$t.lastIndexOf('/') + 1);
			afterSelectUser(null,id);
		}
		else{
			document.getElementById("startBtn").disabled = '';
			var modNo = 5;
			var userArea = document.getElementById("selectUser");
			table = document.createElement("table");
			tbody = document.createElement("tbody");
			table.appendChild(tbody);
			userArea.appendChild(table);
			for(var i = 0;i<user.entry.length;i++){
				//debugger;
				var u = user.entry[i];
				tr = document.createElement("tr");
				td_icon = document.createElement("td");
				td_name = document.createElement("td");
				td_link = document.createElement("td");
				td_radio = document.createElement("td");
				
				link = document.createElement("a");
				link.target = "_blank";
				link.href = "";//TODO
				img = document.createElement("img");
				img.border = '0';
				link.appendChild(img);
				td_icon.appendChild(link);

				td_name.innerHTML = u.title.$t;
				
				for(var j = 0;j<u.link.length;j++){
					if(u.link[j]['@rel'] == 'alternate'){
						link.href = u.link[j]['@href'];//URL
					}
					else if(u.link[j]['@rel'] == 'icon'){
						img.src = u.link[j]['@href'];
					}
				}
				if(img.src == '')
					img.src = 'http://www.douban.com/icon/user.jpg';//set as default img

				selectedBtn = document.createElement("input");
				selectedBtn.type = "button";
				selectedBtn.value = "这个是我";
				el_id = "el_id" + i;
				selectedBtn.id = el_id;
				td_radio.appendChild(selectedBtn);
								
				tr.appendChild(td_icon);
				tr.appendChild(td_name);
				tr.appendChild(td_link);
				tr.appendChild(td_radio);
				tbody.appendChild(tr);
				$(el_id).addEvent('click',afterSelectUser.bindWithEvent($(el_id),u.id.$t.substring(u.id.$t.lastIndexOf('/') + 1) ));
				//must be after other elements are appended, and use the $() to get the element. Just using selectedBtn won't work in IE
			}
		}		
	}
});
};

function afterSelectUser(bind,id){
	$('loading_gif').setStyle('display','block');
	uid = id;
	count = 0;
	year = document.getElementById("year").value;

	months = [0,0,0,0,0,0,0,0,0,0,0,0];
	colNo = parseInt(document.getElementById("colNo").value);
	tr = document.createElement("tr");
	table = document.createElement("table");
	table.cellpadding = "4";
	table.cellspacing = "0";
	tbody = document.createElement("tbody");
	table.appendChild(tbody);
	generate(1);
};

function generate(startIndex){
document.getElementById('selectUser').innerHTML = '';
var max = 50;
var cat;
var status;
if(document.getElementById("book").checked){
	cat = 'book';
	status = 'read';
}
else if(document.getElementById("movie").checked){
	cat = 'movie';
	status = 'watched';
}
else if(document.getElementById("music").checked){
	cat = 'music';
	status = 'listened';
}
else {
	document.getElementById("startBtn").disabled = '';
	alert('请选择一个目录');
}

DOUBAN.apikey = '203bcd6fc05d710960b3684f4118531b';
DOUBAN.getUserCollection({
uid:uid,
cat:cat,
status:status,
maxresults:max,
startindex:startIndex,
callback:function(collections){
	// debugger;
	//collections.entry[i]['db:subject'].author[j].name.$t;
	if(collections.entry.length == 0){//finish, render ui
		$('loading_gif').setStyle('display','none');	
		if(tr.childNodes.length != 0){
			tbody.appendChild(tr);
		}
		if(count > 0){
			var maxValue = 0;
			var chartlabel = '';
			var chartRange = '';
			for(i=0;i<months.length;i++){
				if(months[i]>maxValue)
					maxValue = months[i];
			}
			chart_data = simpleEncode(months,maxValue);
			var granulary = [{top:5,jump:1},{'top':10,'jump':1},{'top':20,'jump':5},{'top':30,'jump':5},{'top':40,'jump':5}];
			for(i=0;i<granulary.length;i++){
				topbar = granulary[i].top;
				if(maxValue < topbar){
					chart_data = simpleEncode(months,topbar);
					chartlabel = '0:|';
					for(j=0;j<=topbar;j+=granulary[i].jump){
						chartlabel = chartlabel +  j + '|';
					}
					break;
				}
			}
			if(maxValue >= granulary[granulary.length-1].top){
				chart_data = simpleEncode(months,maxValue);
				chartRange = '&chxr=0,0,' + maxValue;
			}
			if(year != 'alltime'){
				var chartTitle = '&chtt=' + count + ' ' + cat +'s+you+added+in+year+'+ year +'|divided+by+month';
				var chart = document.createElement("img");
				//chxr:axis range
				//chxl:axis label
				//chf:linear gradient
				//chco:color;
				chart.id = 'chartMonth';
				chart.src = "http://chart.apis.google.com/chart?chs=400x200&cht=bvs&chd=" + chart_data
				 + "&chxt=y,x,x&chxl="+chartlabel+"1:|1|2|3|4|5|6|7|8|9|10|11|12|2:|month&chxp=2,100" + chartRange
				 + "&chf=c,lg,90,76A4FB,0.5,ffffff,0|bg,s,EFEFEF&chco=0000ff"+chartTitle;
				document.getElementById('output').appendChild(chart);
			}
			
			//http://chart.apis.google.com/chart?chs=400x200&cht=bvs&chd=s:ABAAACFAANBE&&chxt=y,x,x&chxl=1:|1|2|3|4|5|6|7|8|9|10|11|12|2:|(month)&chxp=2,100&chxr=0,0,10
			//http://chart.apis.google.com/chart?chs=400x200&cht=bvs&chd=s:AA9AAAAAAAAAchxt=y,x,x&chxl=1:|1|2|3|4|5|6|7|8|9|10|11|12|2:|(month)&chxp=2,100&chxr=0,0,1
			var doubanlist = document.createElement('div');
			doubanlist.id = 'doubanlist';
			doubanlist.appendChild(table);
			document.getElementById('output').appendChild(doubanlist);
			document.getElementById('htmlcode').value = document.getElementById('output').innerHTML;
		}
		document.getElementById("startBtn").disabled = '';		
		return;
	}
	for(var i = 0;i<collections.entry.length;i++){
		if(year == 'alltime' || collections.entry[i].updated.$t.indexOf(year) != -1) {
			var entry = collections.entry[i]['db:subject'];
			var m = collections.entry[i].updated.$t.substr(collections.entry[i].updated.$t.indexOf('-') + 1,2);
			if(parseInt(m)==0){//08,09 cannot be converted to int by using parseInt, i have no idea yet.
				m = parseInt(m.substr(1,1));
			}
			else {
				m = parseInt(m);
			}
			months[m - 1] = months[m - 1] + 1;
			td = document.createElement("td");
			link = document.createElement("a");
			img = document.createElement("img");
			link.title = entry.title.$t;
			link.target = "_blank";
			img.border="0";
			for(var j = 0;j<entry.link.length;j++){
				if(entry.link[j]['@rel'] == 'image'){
					img.src = entry.link[j]['@href'];
				}
				else if(entry.link[j]['@rel'] == 'alternate'){
					link.href = entry.link[j]['@href'];
				}
			}
			link.appendChild(img);
			td.appendChild(link);

			if(count%colNo == 0){
				tbody.appendChild(tr);
				tr = document.createElement("tr");
			}
			count++;
			tr.appendChild(td);
		}
	}
	generate(startIndex + max);
}
});
}
