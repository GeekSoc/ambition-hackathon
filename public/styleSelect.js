function setCookie(c_name,value,exdays) {
	var exdate = new Date();
	exdate.setDate(exdate.getDate() + exdays);
	var c_value=escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
	document.cookie=c_name + "=" + c_value;
}

function checkCookie() {
	var style = getCookie("style");
	if(style != null && style != "") {
		return style;
	}
	else {
		if (style!=null && style !="") {
			setCookie("style", "cerulean", 365);
			//window.location.href = redir;
		}
	}
}

function changeStyle(style, redir) {
	switch(style) {
		case "Amelia":
		case "Cerulean":
		case "Cosmo": 
		case "Custom":
		case "Cyborg":
		case "Flatly":
		case "Journal":
		case "Readable":
		case "Simplex":
		case "Slate":
		case "Spacelab":
		case "United":
		case "Yeti":
			setCookie("style", style, 365);
			break;
		case "Classic":
			setCookie("style", "cerulean", 365);
			break;
	}
	window.location.href = redir;
}

