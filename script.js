var form = document.getElementById('form');
var clear = function() {
    var all_radios = document.getElementsByTagName('input')
    for (var i = 0; i < all_radios.length; i++) {
        all_radios[i].checked = false;
        all_radios[i].value = ""
    }
}
function submit() {
	var elem = form.getElementsByTagName('input');
	for (var i = 0; i < elem.length; i++) {
		var test = elem[i]
		if (!test.value){
			alert('all the questions are not filled')
			return null;
		}
	}
	Get(generate());
	clear()
}
function item_define(val, Q) {
    var elem = document.getElementById("f" + Q)
    elem.removeAttribute("disabled")
    elem.value = val
}

function generate() {
    var str = '?'
    var elem = form.getElementsByTagName('input');
    for (var i = 0; i < elem.length; i++) {
        var test = elem[i]
        str += test.name + '=' + test.value
        if (i + 1 !== elem.length) {
            str += '&'
        }
    }
    return str
}

function Get(Url) {
    var URL = 'https://script.google.com/macros/s/AKfycbwy3m495BMM-21-_6hL867HSUPAIhxvDSTikPbldDlBeJq8CD8/exec' + Url;
    var Httpreq = new XMLHttpRequest(); // a new request
    Httpreq.open("GET", URL, false);
    Httpreq.send(null);
    var value = String(Httpreq.responseText);
    var value = JSON.parse(value);
    return value;
}
clear()