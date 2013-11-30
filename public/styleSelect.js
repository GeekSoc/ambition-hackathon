var styleFile;

function change() {
	var x=document.getElementById("styleSelect").selectedIndex;
	var y=document.getElementsByTagName("option")[x].value;
	//alert(y);
	changeStyle(y);
}

function init() {
	var styleCookie = getCookie("style");
	if(styleCookie == null) {
		changeStyle("cerulean");
	}
	else {
		//alert("loaded style from the cookie");
		console.log('<link rel="stylesheet" type="text/css" href="/theme/' + styleCookie + '/bootstrap.css">');
		document.getElementById("myStyle").href = '/theme/' + styleCookie + '/bootstrap.css';
	}
}

function getCookie(c_name) {
	var c_value = document.cookie;
	var c_start = c_value.indexOf(" " + c_name + "=");
	if (c_start == -1) {
		c_start = c_value.indexOf(c_name + "=");
	}
	if (c_start == -1) {
		c_value = null;
	}
	else {
		c_start = c_value.indexOf("=", c_start) + 1;
		var c_end = c_value.indexOf(";", c_start);
		if (c_end == -1) {
			c_end = c_value.length;
		}
		c_value = unescape(c_value.substring(c_start,c_end));
	}
	return c_value;
}

function changeStyle( styleName ){
	var CookieDate = new Date;
	CookieDate.setFullYear(CookieDate.getFullYear( ) +10);
	document.cookie = "style=" + styleName + "; expires=" + CookieDate.toGMTString() + ";";
	window.location.reload();
}