scServices.currentPage = scOnLoads[scOnLoads.length] = {
	fActive : false,
	fCurrentHash : "",
	set : function(pUrl) {
		var vPge = pUrl.substring(pUrl.lastIndexOf("/")+1);
		var vNewHash = vPge.substring(0, vPge.lastIndexOf("."));
		if (this.fActive){
			this.fCurrentHash = vNewHash;
			window.location.replace(scCoLib.hrefBase() + "#" + vNewHash);
		} else if(window.location.hash.length > 0){
			var vHash = decodeURIComponent(window.location.hash).substring(1);
			if (vHash!=vNewHash) history.replaceState(null, null, ' ');
		}
	},
	enable : function() {
		this.fActive = true;
	},
	disable : function() {
		this.fActive = false;
	},
	hashChange : function() {
		if(window.location.hash.length > 0){
			var vHash = decodeURIComponent(window.location.hash).substring(1);
			if (vHash == this.fCurrentHash) return;
			var vPageUrl = scUrlToLoad.substring(0, scUrlToLoad.lastIndexOf("/")+1) + vHash + scUrlToLoad.substring(scUrlToLoad.lastIndexOf("."));
			try {
				var vReq = new XMLHttpRequest();
				vReq.onreadystatechange = function () {
					if (vReq.readyState != 4) return;
					if (vReq.status != 0 && vReq.status != 200 && vReq.status != 304) {
						return;
					}
					sc$("mainFrame").src = vPageUrl;
				}
				vReq.open("GET",vPageUrl,false);
				vReq.send();
			} catch(e){}
		}
	},
	onLoad : function() {
		if(window.location.hash.length > 0){
			var vHash = decodeURIComponent(window.location.hash).substring(1);
			var vPageUrl = scUrlToLoad.substring(0, scUrlToLoad.lastIndexOf("/")+1) + vHash + scUrlToLoad.substring(scUrlToLoad.lastIndexOf("."));
			try {
				var vReq = new XMLHttpRequest();
				vReq.onreadystatechange = function () {
					if (vReq.readyState != 4) return;
					if (vReq.status != 0 && vReq.status != 200 && vReq.status != 304) {
						return;
					}
					scUrlToLoad = vPageUrl;
				}
				vReq.open("GET",vPageUrl,false);
				vReq.send();
			} catch(e){}
		}
	},
	loadSortKey : "1currentPage"
}
window.addEventListener("hashchange", function(pEvt) {
	scServices.currentPage.hashChange();
});