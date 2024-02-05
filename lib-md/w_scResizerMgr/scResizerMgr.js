/**
 * LICENCE[[
 * Version: MPL 2.0/GPL 3.0/LGPL 3.0/CeCILL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 2.0 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is kelis.fr code.
 *
 * The Initial Developer of the Original Code is 
 * nicolas.boyer@kelis.fr
 *
 * Portions created by the Initial Developer are Copyright (C) 2013-2017
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 * 
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either of the GNU General Public License Version 3 or later (the "GPL"),
 * or the GNU Lesser General Public License Version 3.0 or later (the "LGPL"),
 * or the CeCILL Licence Version 2.1 (http://www.cecill.info/licences.en.html),
 * in which case the provisions of the GPL, the LGPL or the CeCILL are applicable
 * instead of those above. If you wish to allow use of your version of this file
 * only under the terms of either the GPL, the LGPL or the CeCILL, and not to allow
 * others to use your version of this file under the terms of the MPL, indicate
 * your decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL, the LGPL or the CeCILL. If you do not
 * delete the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL, the LGPL or the CeCILL.
 * ]]LICENCE
 */

var scResizerMgr = scOnLoads[scOnLoads.length] = {
	fResourcesDatas : [],
	fIsIframeBtn : null,
	fIsMobileOnly : null,
	fMediaWebCls : null,
	loadSortKey : "ZZZ",
	fListeners : {resized:[]},
	fStrings: 	[
	/*0*/		"Ouvrir l\'iframe", "Ouvrir l\'iframe à sa taille d\'origine (nouvelle fenêtre)",
	/*2*/		"Agrandir", "Agrandir la map",
	/*4*/		"Réduire", "Réduire la map"
				]
}

/**
** opts::type : string -> 'content','quiz','map', 'free'
** opts::zoom: bool-> false par défaut -> valable seulement pour les map
** A définir ici ou dans le skin.js :
** scResizerMgr.fIsMobileOnly : bool -> false par défaut -> valable seulement pour les quiz
** scResizerMgr.fIsIframeBtn : bool -> true par défaut
** scResizerMgr.fMediaWebCls : string -> 'mediaWeb' par défaut
** scResizerMgr.freeResizer : function -> to override
**/
scResizerMgr.registerResources = function(pPath, pOpts) {
	var vResourceDatas = {};
	vResourceDatas.fPath = pPath;
	vResourceDatas.fOpts = (typeof pOpts == "undefined" ? {type:"content", zoom:false} : pOpts);
	vResourceDatas.fOpts.type = (typeof vResourceDatas.fOpts.type == "undefined" ? "content" : vResourceDatas.fOpts.type);
	vResourceDatas.fOpts.zoom = (typeof vResourceDatas.fOpts.zoom == "undefined" ? false : vResourceDatas.fOpts.zoom);
	this.fIsMobileOnly = this.fIsMobileOnly != null ? this.fIsMobileOnly : false;
	this.fIsIframeBtn = this.fIsIframeBtn != null ? this.fIsIframeBtn : true;
	this.fMediaWebCls = this.fMediaWebCls != null ? this.fMediaWebCls : "mediaWeb";
	this.fResourcesDatas[this.fResourcesDatas.length] = vResourceDatas;
}

scResizerMgr.onLoad = function() {		
	try {
		this.fNavie7 = scCoLib.isIE && parseFloat(navigator.appVersion.split("MSIE")[1]) < 8;
		if (this.fNavie7) return;
		this.fScreenTouch = "ontouchstart" in window && ((/iphone|ipad/gi).test(navigator.appVersion) || (/android/gi).test(navigator.appVersion));
		this.fIsIOS = !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);
		// Set tooltip callback functions.
		if ("scTooltipMgr" in window) {
			scTooltipMgr.addShowListener(this.sTtShow);
			scTooltipMgr.addHideListener(this.sTtHide);
		}
		this.xInit();
	}
	catch(e){
		console.log("scResizerMgr.onLoad::Error: "+e);
	}
}

scResizerMgr.freeResizer = function(pRes, pOpts) {
	scCoLib.log("scResizerMgr.freeResizer -> to override:");
	scCoLib.log(pRes);
}

scResizerMgr.addListener = function(pKey, pFunc) {
	if (!this.fListeners[pKey]) return scCoLib.log("scResizerMgr.addListener ERROR : "+pKey+" is not a valid listener");
	this.fListeners[pKey].push(pFunc);
}

scResizerMgr.notifyListener = function(pKey, pParam) {
	try{
		for (var i=0; i<this.fListeners[pKey].length; i++){
			this.fListeners[pKey][i](pParam);
		}
	} catch(e){
		console.log("scResizerMgr.xNotifyListener("+pKey+") - ERROR : "+e);
	}
},

scResizerMgr.sTtShow = function(pNode) {
	if (scResizerMgr.fIsIOS) scTooltipMgr.hideTooltip(true);;
	var vClsBtn = scPaLib.findNode("des:a.tooltip_x", scTooltipMgr.fCurrTt);
	if (vClsBtn) window.setTimeout(function(){vClsBtn.focus();}, pNode.fOpt.DELAY + 10);
	else if (!pNode.onblur) pNode.onblur = function(){scTooltipMgr.hideTooltip(true);};
}

scResizerMgr.sTtHide = function(pNode) {
	if (pNode) pNode.focus();
}

scResizerMgr.xInit = function(){
	if (!scServices.fQuizChoices) scServices.fQuizChoices = {};
	for(var i = 0; i < this.fResourcesDatas.length; i++) {
		var vResourceDatas = this.fResourcesDatas[i];
		var vOpts = vResourceDatas.fOpts;
		var vResContainers = scPaLib.findNodes(vResourceDatas.fPath);
		for(var j = 0; j < vResContainers.length; j++) {
			var vResContainer = vResContainers[j];
			var vResources = scPaLib.findNodes("des:img|video|audio|object|iframe",vResContainer);
			for(var k = 0; k < vResources.length; k++) {
				var vResource = vResources[k];
				vResource.fContainer = vResContainer;
				switch(vOpts.type) {
				    case "content":
				        this.xContentResizer(vResource, vOpts);
				        break;
				    case "map":
				        this.xMapResizer(vResource, vOpts);
				        break;
			        case "quiz":			        	
				        if (this.fIsMobileOnly) {
				        	// Si le device-width est superieur à 750px (tablette par exemple) on garde le système de quiz habituel
							var vMediaQueries = window.matchMedia( "(max-width: 750px)" );
							if (vMediaQueries.matches) this.xQuizResizer(vResource, vOpts);
				        }
				        else this.xQuizResizer(vResource, vOpts);
				        break;
				    case "free":
				    	this.freeResizer(vResource, vOpts);
				    	break;
				}
				vResource.isResized = true;
			}
		}
	}
}

scResizerMgr.xContentResizer = function(pRes, pOpts){
	scCoLib.log("scResizerMgr.xContentResizer:");
	scCoLib.log(pRes);
	if(this.xGetParents(pRes, 2).className.indexOf(this.fMediaWebCls) != -1) return;
	if(pRes.nodeName == "OBJECT") {
		var vRszObjWidth = pRes.width;
		var vRszObjHeight = pRes.height;
		var vRszObjResizer = function() {				
			var vContainerWidth = pRes.fContainer.offsetWidth;
			pRes.width = vRszObjWidth > vContainerWidth ? vContainerWidth : vRszObjWidth;
			pRes.height = vRszObjWidth > vContainerWidth ? (vContainerWidth*vRszObjHeight)/vRszObjWidth : vRszObjHeight;
		}
		vRszObjResizer();
		this.xAddEvent(window, 'resize', vRszObjResizer, false);
	}
	else if(pRes.nodeName == "IFRAME") return;
	else {
		pRes.fIsAdapted = pRes.parentNode.nodeName == "A" && this.fScreenTouch;
		pRes.style.maxWidth = pRes.naturalWidth + "px";
		pRes.style.maxHeight =  pRes.naturalHeight + "px";
		pRes.style.width = "100%";
		pRes.style.height = "auto";
	}
}

scResizerMgr.xMapResizer = function(pRes,pOpts){
	scCoLib.log("scResizerMgr.xMapResizer:");
	scCoLib.log(pRes);

	pRes.fAreas = scPaLib.findNodes("des:area");
	pRes.fCoords = [];
	for (var i in pRes.fAreas) pRes.fCoords[i] = pRes.fAreas[i].coords.split(",");
	pRes.style.maxWidth = pRes.naturalWidth + "px";
	pRes.style.maxHeight = pRes.naturalHeight + "px";
	pRes.fContainer.style.position = "relative";

	var vSizeElement = scDynUiMgr.addElement("div", pRes.fContainer.parentNode, null, pRes.fContainer);
	vSizeElement.style.top = pRes.fContainer.offsetTop + "px";
	vSizeElement.style.left = pRes.fContainer.offsetLeft + "px";
	vSizeElement.style.right = 0;
	var vNsibs = scPaLib.findNodes("nsi:", pRes.fContainer);
	var vBottom = 0;
	for (var i = 0; i < vNsibs.length; i++) {
		var vNsib = vNsibs[i];
		vNsib.style.display = "inline-block";
		vBottom += vNsib.offsetHeight + 15;
	}
	vSizeElement.style.bottom = vBottom + "px";
	vSizeElement.style.position = "absolute";

	if (pOpts.zoom) {
		var vZoomMapBtn = this.xAddBtn(pRes.fContainer, "zoomMapBtn", this.fStrings[2], this.fStrings[3]);
		vZoomMapBtn.res = pRes;
		vZoomMapBtn.onclick = function() {
			this.isZoomed = !this.isZoomed;
			var vRes = this.res;
			if (this.isZoomed) {
				this.parentWidth = vRes.parentNode.offsetWidth;
				vRes.fContainer.style.position = "fixed";
				vRes.fContainer.style.top = "50%";
				vRes.fContainer.style.left = "50%";
				this.zoomMapOver = scDynUiMgr.addElement("div", document.body, "zoomMap_over");
				var vMaxHeight = Math.max(document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight);
				var vMaxWidth = Math.max(document.body.scrollWidth, document.body.offsetWidth, document.documentElement.clientWidth, document.documentElement.scrollWidth, document.documentElement.offsetWidth);
				scResizerMgr.xResizeMapAreas(vRes, vMaxHeight, vMaxWidth);
				vRes.fContainer.style.marginTop = "-" + vRes.offsetHeight / 2 + "px";
				vRes.fContainer.style.marginLeft = "-" + vRes.offsetWidth / 2 + "px";			
			} else {
				vRes.fContainer.style.position = "relative";
				vRes.fContainer.style.top = "auto";
				vRes.fContainer.style.left = "auto";
				vRes.fContainer.style.marginTop = "auto";
				vRes.fContainer.style.marginLeft = "auto";
				document.body.removeChild(this.zoomMapOver);
				scResizerMgr.xResizeMapAreas(vRes, vSizeElement.offsetHeight, vSizeElement.offsetWidth);
			}
			this.innerHTML = '<span>' + scResizerMgr.fStrings[(this.isZoomed ? 4 : 2)] + '</span>';
			this.title = scResizerMgr.fStrings[(this.isZoomed ? 5 : 3)];
			scResizerMgr.xSwitchClass(document.body, "zoomMap_"+!this.isZoomed||this.isZoomed, "zoomMap_"+this.isZoomed||!this.isZoomed, true);	
			scResizerMgr.xSwitchClass(this, "zoom_"+!this.isZoomed||this.isZoomed, "zoom_"+this.isZoomed||!this.isZoomed, true);
		};
	}
	this.addListener("resized", function(){
		scResizerMgr.xResizeMapAreas(pRes, vSizeElement.offsetHeight, vSizeElement.offsetWidth);
	});
	this.xAddEvent(window, 'resize', function(){
		if (pOpts.zoom && vZoomMapBtn.isZoomed) vZoomMapBtn.click();
		scResizerMgr.xResizeMapAreas(pRes, vSizeElement.offsetHeight, vSizeElement.offsetWidth);
	}, false);
	scResizerMgr.xResizeMapAreas(pRes, vSizeElement.offsetHeight, vSizeElement.offsetWidth);
}

scResizerMgr.xResizeMapAreas = function(pRes, pMaxHeight, pMaxWidth) {
	if (pMaxWidth >= pRes.naturalWidth && pMaxHeight >= pRes.naturalHeight) return;
	var vRatio = 0;
	var vHeight = Math.round(pRes.naturalHeight*pMaxWidth/pRes.naturalWidth);
	var vWidth = pMaxWidth;	
	if (vHeight >= pMaxHeight) {
		vWidth = Math.round(vWidth*pMaxHeight/vHeight);
		vHeight = pMaxHeight;
	}
	pRes.parentNode.style.backgroundRepeat = "no-repeat";		
	pRes.parentNode.style.width = vWidth + "px";
	pRes.parentNode.style.height = vHeight + "px";
	pRes.parentNode.parentNode.style.height = vHeight + "px";
	scPaLib.findNode("psi:canvas", pRes).style.width = vWidth + "px";
	scPaLib.findNode("psi:canvas", pRes).style.height = vHeight + "px";
	pRes.style.width = vWidth + "px";
	pRes.style.height = vHeight + "px";
	pRes.width = vWidth;
	pRes.height = vHeight;
	vRatio = vWidth/pRes.naturalWidth;
	// Resize des areas
	for (var i in pRes.fAreas) {
		var vNewCoords = [];
		for(j = 0; j < pRes.fCoords[i].length; j++) vNewCoords[j] = pRes.fCoords[i][j]*vRatio;
		pRes.fAreas[i].coords = vNewCoords.join(",");
	}
	scMapMgr.maphighlight(pRes, scMapMgr.extend({shadow:true, alwaysOn:scResizerMgr.fScreenTouch}));
	pRes.parentNode.style.backgroundSize = vWidth + "px " + vHeight + "px";
}

scResizerMgr.xQuizResizer = function(pRes,pOpts){
	if (pRes.src && pRes.src.indexOf("empty.gif")!=-1 || !this.fScreenTouch && this.fIsMobileOnly || pRes.isResized) return;
	scCoLib.log("scResizerMgr.xQuizResizer:");
	scCoLib.log(pRes);

	var vDesBks = scPaLib.findNodes("des:div", pRes.fContainer);
	var vAncBks = scPaLib.findNodes("anc:div", pRes.fContainer);
	var vBks = vDesBks.concat(vAncBks);
	var vClosedCollBks = [];
	for (var i = 0; i < vBks.length; i++) {
		var vBk = vBks[i];
		if (vBk.style.display == "none") {
			vClosedCollBks.push(vBk);
			vBk.style.display = "";
			vBk.isAlreadyOpened = false;
		}
	}

	var vOrigWidth = pRes.width;	
	pRes.style.maxWidth = pRes.width + "px";
	pRes.style.maxHeight = pRes.height + "px";
	pRes.style.width = "100%";
	pRes.style.height = "auto";

	var vAreas = scPaLib.findNodes("des:map/chi:area", pRes.parentNode);
	var vMarkers = scPaLib.findNodes("nsi:div", pRes);
	var vCoords=[];
	for (var i = 0; i < vAreas.length; i++) {
		var vArea = vAreas[i];
		vCoords[i] = vArea.coords.split(",");
		var vMarker = vMarkers[i];
		if (vMarker) {
			vMarker.origwidth = vMarker.offsetWidth;
			vMarker.origheight = vMarker.offsetHeight;
			vMarker.origleft = vMarker.offsetLeft;
			vMarker.origtop = vMarker.offsetTop;
			vMarker.icon = scPaLib.findNode("chi:span",vMarker);
			if (vMarker.icon) {
				vMarker.icon.origwidth = vMarker.icon.offsetWidth;
				vMarker.icon.origheight = vMarker.icon.offsetHeight;
			}
		}
	}

	var vEmptyImg = this.xGetEltsByAttribute("img",pRes.parentNode,"src","empty");
	var resizeTimer;
	var vResize = function(event) {
		vResizeAreas(event);
		clearTimeout(resizeTimer);
    	resizeTimer = setTimeout(vResizeAreas, 50);
	}
	var vResizeAreas = function(event) {
		for (var i = 0; i < vClosedCollBks.length; i++) {
			var vClosedCollBk = vClosedCollBks[i];
			if (vClosedCollBk.style.display == "none") {
				if(event && event.type == "resize" || event == "resized") vClosedCollBk.isAlreadyOpened = false;
				vClosedCollBk.style.display = "";
			}
			else if(event && event.type == "resize" || event == "resized") vClosedCollBk.isAlreadyOpened = true;
		}

		pRes.parentNode.style.width = "100%";
		pRes.parentNode.style.height = "auto";
		var vNewWidth = pRes.width;
		var vNewHeight = pRes.offsetHeight;

		// Permet le réagrandissemnt des canvas et de l'image en empty -> pas encore nickel au réagrandissement
		if (vEmptyImg.length) {
			vEmptyImg[0].style.width = vNewWidth+"px";
			vEmptyImg[0].style.height = vNewHeight+"px";
			scMapMgr.maphighlight(vEmptyImg[0], scMapMgr.extend(scAssmntMgr.gmcqHighlightDefault, {shadow:true, alwaysOn:scResizerMgr.fScreenTouch, strokeColor:'cccccc'}));
		}

		var vRatio = vNewWidth/vOrigWidth;
		for (var i = 0; i < vAreas.length; i++) {
			var vArea = vAreas[i];
			var vNewCoords = [];
			for(var j = 0; j < vCoords[i].length; j++) vNewCoords[j] = vCoords[i][j]*vRatio;
			vArea.coords = vNewCoords.join(",");
		
			// Update delta de scDragMgr
			vArea.topLeftDelta = scDragMgr.coordinates.create(scCoLib.toInt(vNewCoords[0]),scCoLib.toInt(vNewCoords[1]));
			vArea.bottomRightDelta = scDragMgr.coordinates.create(scCoLib.toInt(vNewCoords[2]),scCoLib.toInt(vNewCoords[3]));

			var vMarker = vMarkers[i];
			if (vMarker) {
				vMarker.style.width = vMarker.origwidth*vRatio+"px";
				vMarker.style.height = vMarker.origheight*vRatio+"px";
				vMarker.style.top = vMarker.origtop*vRatio+"px";
				vMarker.style.left = vMarker.origleft*vRatio+"px";
				if (vMarker.icon) {
					vMarker.icon.style.width = vMarker.icon.origwidth*vRatio+"px";
					vMarker.icon.style.height = vMarker.icon.origheight*vRatio+"px";
					vMarker.icon.style.backgroundSize = vMarker.icon.origwidth*vRatio+"px";
					vMarker.icon.style.marginLeft = -vMarker.icon.origwidth*vRatio/2+"px";
					vMarker.icon.style.marginTop = -vMarker.icon.origheight*vRatio/2+"px";
				}
			}
		}

		for (var i = 0; i < vClosedCollBks.length; i++) {
			vClosedCollBk = vClosedCollBks[i]
			if (!vClosedCollBk.isAlreadyOpened) vClosedCollBk.style.display = "none";
		}

		pRes.parentNode.style.width = vNewWidth + "px";
		pRes.parentNode.style.height = vNewHeight + "px";
	}
	this.addListener("resized", function(){vResize("resized");});
	this.xAddEvent(window, 'resize', vResize, false);
	vResize();
}

scResizerMgr.xAddEvent = function(elt, event, fctn, capture) {
	return document.addEventListener ? elt.addEventListener(event, fctn, capture): elt.attachEvent ? elt.attachEvent('on' + event, fctn): false;
}

scResizerMgr.xGetParents = function(pRoot, pNumber) {
	var vParent = pRoot;
	for (var i = 0; i < pNumber; i++) {
		vParent = vParent.parentNode;
	} 
	return vParent;
}

/** scResizerMgr.xAddBtn : Add a HTML button to a parent node. */
scResizerMgr.xAddBtn = function(pParent, pClassName, pCapt, pTitle, pNxtSib) {
	var vBtn = pParent.ownerDocument.createElement("a");
	vBtn.className = pClassName;
	vBtn.fName = pClassName;
	vBtn.href = "#";
	vBtn.target = "_self";
	if (pTitle) vBtn.setAttribute("title", pTitle);
	if (pCapt) vBtn.innerHTML = "<span>" + pCapt + "</span>"
	if (pNxtSib) pParent.insertBefore(vBtn,pNxtSib)
	else pParent.appendChild(vBtn);
	return vBtn;
}

scResizerMgr.xGetEltsByAttribute = function(pElt, pParent, pAttr, pValue) {
	var vElts = scPaLib.findNodes("des:"+pElt, pParent)
	var vTmpElts = [];
	for (var i = 0; i < vElts.length; i++) {
		var vElt = vElts[i];
		if (vElt.getAttribute(pAttr) && vElt.getAttribute(pAttr).indexOf(pValue) != -1) vTmpElts.push(vElt);
	}
	return vTmpElts;
}

scResizerMgr.xSwitchClass = function(pNode, pClassOld, pClassNew, pAddIfAbsent) {
	var vAddIfAbsent = pAddIfAbsent || false;
	if (pClassOld && pClassOld != "") {
		if (pNode.className.indexOf(pClassOld)==-1){
			if (!vAddIfAbsent) return;
			else if (pClassNew && pClassNew != '' && pNode.className.indexOf(pClassNew)==-1) pNode.className = pNode.className + " " + pClassNew;
		} else {
			var vCurrentClasses = pNode.className.split(' ');
			var vNewClasses = new Array();
			for (var i = 0, n = vCurrentClasses.length; i < n; i++) {
				if (vCurrentClasses[i] != pClassOld) {
					vNewClasses.push(vCurrentClasses[i]);
				} else {
					if (pClassNew && pClassNew != '') vNewClasses.push(pClassNew);
				}
			}
			pNode.className = vNewClasses.join(' ');
		}
	}
}
