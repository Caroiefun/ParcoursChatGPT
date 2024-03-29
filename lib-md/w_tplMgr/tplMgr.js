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
 * samuel.monsarrat@kelis.fr
 *
 * Contributor(s): nicolas.boyer@kelis.fr
 *
 * Portions created by the Initial Developer are Copyright (C) 2015-2023
 * the Initial Developer. All Rights Reserved.
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either of the GNU General Public License Version 3 or later (the "GPL"),
 * or the GNU Lesser General Public License Version 3.0 or later (the "LGPL"),
 * or the CeCILL Licence Version 2.1 (http://www.cecill.info),
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
var tplMgr = {
	fAssmntMaxTry: null,
	subWinSearch:null,
	fRequiredIndex:null,
	fRgtWidthDelta : 200,
	fRgtWidthDeltaMax : 400,
	fRgtWidthDeltaMin : 100,
	fRgtWidthInc : 50,
	fRgtInnerWidthDelta : 0,
	fCbkPath : "des:.cbkClosed",
	fQuizModeParentPath : "ide:content/des:section.nodeBk/chi:.nodeBk_ti",
	fMainPath : "ide:content",
	fArcPath : "ide:arc",
	fStepToolsPath : "des:.stepTools",
	fCoachPath : "coachBk",
	fBtnNextPath : "ide:nextBtn",
	fBtnBackPath : "ide:backBtn",
	fQuizGrpBkPath : "des:.quizGrpBk",
	fQuizBkPath : "des:.quizBk",
	fQuizBtnValidPath : "des:a.btnValid",
	fQuizListPath : "des:section.quizList",
	fQuizIntroPath : "des:section.quizIntro",
	fQuizResultPath : "des:section.quizResult",
	fQuizArcBkPath : "des:div.arcBk",
	fChooseArcBkPath : "des:.chooseArc",
	fQuizBtnStartPath : "des:a.btnStart",
	fQuizBkExplanationPath : "des:div.explanationBk",

	fZenMode : 0, // 0 = off by default, memoized, 1 = on by default, memoized, 2 = always off, 3 = always on
	fStepToolsMode : 2, // 0 = off by default, memoized, 1 = on by default, memoized, 2 = always off, 3 = always on
	fZenPath : "bod:.default/ide:tools",
	fZenListeners: [],

	fNoArcFilter : ".noArcFra",
	fMcqArcFilter : ".mcqArcFra",
	fHasSubNavFilter : ".hasSubNav",
	fArcContentPath : "des:.arcIntro|.arcTrans",
	fBarClsPre : "bar",
	fEnLnkClass : "enabled_entry",
	fDisLnkClass : "disabled_entry",
	fStrings : ["Tout afficher","Pas à pas",
	/*02*/      "Afficher tous les exercices.","Afficher les exercices un à un.",
	/*04*/      "Veuillez remplir le(s) champ(s) obligatoires pour continuer","Fermer",
	/*06*/      "Suivant","Question suivante.",
	/*08*/      "Suite","Lire la suite.",
	/*10*/      "Agrandir","Cacher des éléments de l\'interface pour agrandir le contenu",
	/*12*/		"Restaurer","Restaurer l\'interface par défaut.",
	/*14*/		"Déployer","Voir toutes les étapes suivantes",
	/*16*/		"Refermer","Cacher les étapes suivantes",
	/*18*/		"Voir les résultats"],

	init : function(){
		try {
			// init filters
			this.fNoArcFilter = scPaLib.compileFilter(this.fNoArcFilter);
			this.fMcqArcFilter = scPaLib.compileFilter(this.fMcqArcFilter);
			this.fHasSubNavFilter = scPaLib.compileFilter(this.fHasSubNavFilter);
			// init main items
			//init une div pour indiquer qu'un champ est à remplir si la classe indexRequired_yes existe dans le contenu
			this.fStepToolsBar = scPaLib.findNode(this.fStepToolsPath);
			if(scPaLib.findNode("des:.indexRequired_yes")){
				this.xAddElt("div", this.fStepToolsBar, "required_index ", true, null, null).innerHTML = "<p class='arcBk_co_Warn_User_Indexed'><em>"+this.fStrings[4]+"</em></p>";
			}
			this.fMain = scPaLib.findNode(this.fMainPath);
			this.fArc = scPaLib.findNode(this.fArcPath);

			// Close collapsable blocks that are closed by default.
			var vCbks = scPaLib.findNodes(this.fCbkPath);
			for (var i=0; i<vCbks.length; i++) {
				var vTgl = scPaLib.findNode("des:a", vCbks[i]);
				if (vTgl) vTgl.onclick();
			}

			// init assmnt nodes
			if (topazeMgr.fNodeType == "assmnt" || topazeMgr.fNodeType == "assmntGrp") {
				//variable contenant les nodes quizBk après suppression
				this.fQuizBks = scPaLib.findNodes(this.fQuizBkPath, this.fMain);
				// Init partial assesment
				if (topazeMgr.fNodeType == "assmntGrp") {
					this.fQuizBks = [];
					this.fQuizIndex = {};
					this.fQuizGrpIndex = {};
					var vQuizGrpBks = scPaLib.findNodes(this.fQuizGrpBkPath, tplMgr.fMain);
					if (vQuizGrpBks && vQuizGrpBks.length>0) {
						scCoLib.log("assmntGrpMgr.init()");
						for (var i=0; i<vQuizGrpBks.length; i++) {
							var vQuizGrpBk = vQuizGrpBks[i];
							vQuizGrpBk.fQuizBks = [];
							vQuizGrpBk.fInitialized = false;
							vQuizGrpBk.fMinPts = 0;
							vQuizGrpBk.fScorePts = 0;
							vQuizGrpBk.fMaxPts = 0;
							var vId = vQuizGrpBk.fId = vQuizGrpBk.getAttribute("data-quizgrp-id");
							var vQuizBks = scPaLib.findNodes(this.fQuizBkPath, vQuizGrpBk);
							var vQuizPool = [], vMaxQuizInPool = 0;
							if (vMaxQuizInPool == 0 && vQuizPool.length) vQuizGrpBk.parentNode.removeChild(vQuizGrpBk);
							else this.fQuizGrpIndex[vId] = vQuizGrpBk;
							var vQuizBkIdxs = this.fResetQuizLists ? null : scServices.assmntMgr.getResponse(vId, topazeMgr.fSessKeyQuiz, "quizBkIdxs");
							if (!vQuizBkIdxs){
								vQuizBkIdxs = [];
								var vMaxItems = vQuizGrpBk.getAttribute("data-quizgrp-maxquiz");
								var vNumItems = vMaxItems < 1 && vQuizPool.length ? vMaxQuizInPool : vMaxItems < 1 ? vQuizBks.length : Math.min(vMaxItems, vQuizBks.length);
								var vCtrl = {};
								for (var j = 0; j < vNumItems; j++){
									var vNewIdx = Math.round(Math.random()*(vQuizBks.length-1));
									if (!vQuizPool.length) {
										while (vCtrl[vNewIdx]) vNewIdx = Math.round(Math.random()*(vQuizBks.length-1));
									} else  {
										while (vCtrl[vNewIdx] || !vQuizPool[vNewIdx]) vNewIdx = Math.round(Math.random()*(vQuizBks.length-1));
									}
									vCtrl[vNewIdx] = true;
									vQuizBkIdxs.push(vNewIdx);
								}
								if (vQuizBkIdxs.length) scServices.assmntMgr.setResponse(vId, topazeMgr.fSessKeyQuiz, "quizBkIdxs", vQuizBkIdxs);
								scCoLib.log("assmntGrpMgr.init - quiz group "+vId+" new list="+vQuizBkIdxs.join(","));
							} else scCoLib.log("assmntGrpMgr.init - quiz group "+vId+" memorized list="+vQuizBkIdxs.join(","));
							for (var j = 0; j < vQuizBkIdxs.length; j++) vQuizBks[vQuizBkIdxs[j]].fAct = true;
							var vCount = 0;
							for (var j = 0; j < vQuizBks.length; j++) vQuizGrpBk.firstChild.removeChild(vQuizBks[j]);
							for (var j = 0; j < vQuizBks.length; j++){
								var vQuizBk = vQuizBks[j];
								vQuizBk.fId = vQuizBk.getAttribute("data-quiz-id");
								vQuizBk.fGrp = vQuizGrpBk;
								if (vQuizBk.fAct) {
									var vQuizToAppend = vQuizBks[vQuizBkIdxs[vCount]];
									vQuizGrpBk.firstChild.appendChild(vQuizToAppend);
									this.fQuizBks.push(vQuizToAppend);
									vQuizGrpBk.fQuizBks.push(vQuizToAppend);
									this.fQuizIndex[vQuizToAppend.fId] = vQuizToAppend;
									var vImgs = scPaLib.findNodes("des:img", vQuizToAppend);
									vCount++;
									for (var k = 0; k < vImgs.length; k++){
										var vImg = vImgs[k];
										var vSrc = vImg.getAttribute("data-src");
										if (vSrc) vImg.src = vSrc;
									}
								}
								else {
									for (var k = 0; k < scOnLoads.length; k++){
										if (scOnLoads[k] && scOnLoads[k].fId && scOnLoads[k].fId == vQuizBk.fId) scOnLoads.splice(k,1);
									}
								}
							}

							// Purge des tooltips inutiles
							var vTtCtrl = {};
							var vTTAncs = vQuizGrpBk.querySelectorAll("*[data-sctooltip]");
							for (var i=0; i < vTTAncs.length; i++){
								var vOpts = JSON.parse(vTTAncs[i].getAttribute("data-sctooltip"));
								vTtCtrl[vOpts.ttId] = true;
							}
							var vTooltips = scPaLib.findNodes("ide:content/des:aside.footnotes/chi:ol/chi:li.footnotes_it");
							for (var i = 0; i < vTooltips.length; i++) {
								if(! vTtCtrl[vTooltips[i].id]) vTooltips[i].parentElement.removeChild(vTooltips[i]);
							}
						}
						scServices.assmntMgr.addEventListener(this);
					}
				}

				var vQuizBtnValid = scPaLib.findNode(this.fQuizBtnValidPath, tplMgr.fArc);
				var vQuizBtnStart = scPaLib.findNode(this.fQuizBtnStartPath, tplMgr.fArc);
				this.fQuizResult = scPaLib.findNode(this.fQuizResultPath, this.fMain);
				this.fQuizArcBk = scPaLib.findNodes(this.fQuizArcBkPath, this.fArc);
				this.fArcDisplay = [];
				for (var i = 0; i < this.fQuizArcBk.length; i++) this.fArcDisplay[i] = this.fQuizResult ? this.fQuizArcBk[i] : vQuizBtnValid;
				if (this.fQuizBks && this.fQuizBks.length > 1) {
					var vQuizBtnParent = [];
					this.fQuizBtnNxt = [];
					for (var i = 0; i < this.fArcDisplay.length; i++) {
						var vArcDisplay = this.fArcDisplay[i];
						vArcDisplay.style.display = "none";
						vQuizBtnParent[i] = scPaLib.findNode("par:", vArcDisplay);
						this.fQuizBtnNxt[i] = this.xAddBtn(vQuizBtnParent[i], "btnNxt", this.fStrings[6], this.fStrings[7], vArcDisplay);
						this.fQuizBtnNxt[i].onclick = this.sQuizNxt;
					}
					this.fQuizBtnMde = this.xAddBtn(scPaLib.findNode(this.fQuizModeParentPath), "btnQuizMde quizSteped", this.fStrings[0], this.fStrings[2]);
					this.fQuizBtnMde.onclick = this.sQuizTglMde;
					this.fQuizIdx = -1;
					this.fQuizSteped = 0;
					if(tplMgr.fQuizzMode && tplMgr.fQuizzMode == "one") this.sQuizNxt();
					else if(tplMgr.fQuizzMode && tplMgr.fQuizzMode == "all") this.sQuizTglMde();
					else if(document.cookie.indexOf("quizModeSteped=true") >= 0) this.sQuizNxt();
					else this.sQuizTglMde();
				}
				//gestion du nombre de fois qu'il est possible de faire un exercice + affichage solutions
				if (this.fAssmntMaxTry) {
					var vQuizBkExplanation = scPaLib.findNode(this.fQuizBkExplanationPath);
					if (vQuizBkExplanation) vQuizBkExplanation.style.display = "none";
					if (this.fQuizResult) {
						this.fQuizResult.style.display = "none";
						if(tplMgr.fQuizzMode && tplMgr.fQuizzMode == "one") this.sQuizTglMde();
					}
					if (scCoLib.toInt(scServices.assmntMgr.getResponse(topazeMgr.fNodeId, topazeMgr.fSessKey, "tryNum")) >= this.fAssmntMaxTry) {
						if (this.fQuizResult) {
							this.fQuizResult.style.display = "";
							if(tplMgr.fQuizzMode && tplMgr.fQuizzMode == "one") this.sQuizTglMde();
						}
						if (scPaLib.findNode(this.fQuizListPath)) {
							if(tplMgr.fQuizzMode && tplMgr.fQuizzMode == "one") this.sQuizTglMde();
							for (var i=0; i<this.fQuizBks.length; i++) this.fQuizBks[i].style.display = "none";
							if (this.fQuizBtnMde) this.fQuizBtnMde.style.display = "none";
						}
						if (vQuizBtnValid) {
							vQuizBtnValid.onclick = function() {};
							vQuizBtnValid.removeAttribute("title");
							vQuizBtnValid.classList.replace("btnValid", "btnResult");
							var vQuizSpanValid = scPaLib.findNode("chi:span", vQuizBtnValid);
							vQuizSpanValid.innerHTML = this.fStrings[18];
							vQuizBtnValid.style.display = "";
						}
						if (scPaLib.findNode(this.fQuizIntroPath)) {
							scPaLib.findNode("chi:span", vQuizBtnStart).innerHTML = this.fStrings[8];
							vQuizBtnStart.title = this.fStrings[9];
						}
						else {
							if (vQuizBtnStart) vQuizBtnStart.style.display = "none";
							if (vQuizBkExplanation) vQuizBkExplanation.style.display = "";
						}
					}
				}
			}

			// init media nodes
			if (topazeMgr.fNodeType == "media") {
				var vMediaBk = scPaLib.findNode("ide:content/des:div.background");
				if (scPaLib.checkNode(".video", vMediaBk)){
					// Video Media Node
					tePlayerMgr.subControllers.push({updatePlayingState:function (ctrl){
							if (ctrl.media.currentTime+1>=ctrl.media.duration){
								tplMgr.xSwitchClass(document.body, "mediaNode_hideArc", "mediaNode_showArc", true);
								if(scPaLib.checkNode(".teFullscreen", document.body)) document.exitFullscreen();
							} else {
								tplMgr.xSwitchClass(document.body, "mediaNode_showArc", "mediaNode_hideArc", true);
							}
						}});
				} else {
					// Image Media Node
					var vImage = vMediaBk.fImage = scPaLib.findNode("des:img", vMediaBk);
					vMediaBk.fRatio = vImage.width / vImage.height;
					vMediaBk.style.textAlign = "center";
					vMediaBk.style.overflow = "hidden";
					var iResizer = {
						onResizedDes : function(pOwnerNode, pEvent) {},
						onResizedAnc : function(pOwnerNode, pEvent) {
							if(pEvent.phase==1) {
								if (pOwnerNode.fRatio>pOwnerNode.clientWidth / pOwnerNode.clientHeight){
									pOwnerNode.fImage.style.width="100%";
									pOwnerNode.fImage.style.height="auto";
									pOwnerNode.fImage.style.marginTop= (pOwnerNode.clientHeight-pOwnerNode.fImage.clientHeight)/2 + "px";
								} else {
									pOwnerNode.fImage.style.width="auto";
									pOwnerNode.fImage.style.height="100%";
								}
							}
						}
					}
					scSiLib.addRule(vMediaBk, iResizer);
					scSiLib.fireResizedNode(vMediaBk);
					tplMgr.xSwitchClass(document.body, "mediaNode_hideArc", "mediaNode_showArc", true);
				}
			}

			// init left bar
			this.fBtnNext = scPaLib.findNode(this.fBtnNextPath);
			this.fBtnBack = scPaLib.findNode(this.fBtnBackPath);
			// init Coach
			if(tplMgr.fCoachVals) {
				this.fCoach = sc$(this.fCoachPath);
				this.fMain.parentNode.parentNode.className = this.fMain.parentNode.parentNode.className + " isCoach_true"
				for (var i in this.fCoachVals) {
					var vCoachVals = this.fCoachVals[i];
					var vCoachMin = vCoachVals.substring(0,vCoachVals.lastIndexOf(','));
					var vCoachMax = vCoachVals.substring(vCoachVals.lastIndexOf(',')+1);
					if(this.fCoachIndexVal >= vCoachMin && this.fCoachIndexVal <= vCoachMax && !scPaLib.findNode("chi:img",this.fCoach)) {
						var vCoachImg = this.xAddElt("img", this.fCoach, "coachImg", null, null, null);
						vCoachImg.src = i;
						vCoachImg.alt = "coach";
					}
				}
			}
			this.fStore = new LocalStore();

			// Add zen button
			var vZenBtn = this.addZenButton(scPaLib.findNode(this.fZenPath));
			var vZenState = this.fStore.get("templateZen");
			if (vZenBtn) {
				if (topazeMgr.fNodeType == "nav" && vZenState=="false") vZenBtn.click();
				else if (this.fZenMode == 3 || (this.fZenMode != 2 && vZenState=="true") || (this.fZenMode == 1 && !vZenState)) vZenBtn.click();
			}

			// Add file protocol class
			if (window.location.protocol=="file:") document.body.classList.add("fileProtocol");

			scOnLoads[scOnLoads.length] = this;
		} catch(e){
			console.log("tplMgr.init::Error: "+e);
		}
	},
	handleAssmntResponse : function(pEvent){
		if(!this.fUserResponseDetected && this.fQuizIndex[pEvent.fId] && pEvent.fSession == topazeMgr.fSessKeyQuiz) this.fUserResponseDetected = true;
	},
	handleAssmntPts : function(pEvent){
		var vQuizBk = this.fQuizIndex[pEvent.fId];
		if (vQuizBk && pEvent.fSession == topazeMgr.fSessKeyQuiz) {
			var vGrp = vQuizBk.fGrp;
			if (!this.fUserResponseDetected && vGrp.fInitialized) return;
			vGrp.fInitialized = true;
			vGrp.fMinPts = 0;
			vGrp.fScorePts = 0;
			vGrp.fMaxPts = 0;
			for (var i = 0; i < vGrp.fQuizBks.length; i++){
				var vQuizId = vGrp.fQuizBks[i].fId;
				vGrp.fMinPts += scServices.assmntMgr.getMinPts(vQuizId, topazeMgr.fSessKeyQuiz)||0;
				vGrp.fScorePts += scServices.assmntMgr.getScorePts(vQuizId, topazeMgr.fSessKeyQuiz)||0;
				vGrp.fMaxPts += scServices.assmntMgr.getMaxPts(vQuizId, topazeMgr.fSessKeyQuiz)||1;
			}
			//scCoLib.log("assmntGrpMgr.setGroupResult : " + vGrp.fMinPts + " | " + vGrp.fScorePts + " | " + vGrp.fMaxPts);
			scServices.assmntMgr.setPts(vGrp.fId, topazeMgr.fSessKeyQuiz, vGrp.fMinPts, vGrp.fScorePts, vGrp.fMaxPts);
			if (topazeMgr.fSessKeyQuiz != topazeMgr.fSessKey) scServices.assmntMgr.setPts(vGrp.fId, topazeMgr.fSessKey, vGrp.fMinPts, vGrp.fScorePts, vGrp.fMaxPts);
		}
	},
	handleAssmntStatus : function(pEvent){
		if(pEvent.fStatus!="complete") return;
		var vQuizGrp = this.fQuizGrpIndex[pEvent.fId];
		if (vQuizGrp && pEvent.fSession == topazeMgr.fSessKeyQuiz) {
			for (var i = 0; i < vQuizGrp.fQuizBks.length; i++){
				scServices.assmntMgr.setCompletionStatus(vQuizGrp.fQuizBks[i].fId, pEvent.fSession, pEvent.fStatus);
			}
		}
	},
	onLoad : function(){
		try {
			// history manager
			this.fHistMgr = new histMgr;
			this.fHistMgr.init(true);
			// Manage nav buttons
			if (this.fBtnNext) this.fBtnNext.style.visibility = (this.fHistMgr.hasNext() ? "" : "hidden");
			if (this.fBtnBack) this.fBtnBack.style.visibility = (this.fHistMgr.hasBack() ? "" : "hidden");
			// Add stepToolsBtn
			this.fStepToolsBtn = this.addStepToolsButton();
			if (this.fStepToolsBtn) {
				var vStepToolsState = this.fStore.get("templateStepTools");
				if (this.fStepToolsBtn) {
					if (this.fStepToolsMode == 3 || (this.fStepToolsMode != 2 && vStepToolsState=="true") || (this.fStepToolsMode == 1 && !vStepToolsState)) this.fStepToolsBtn.click();
				}
			}
			this.xSetArcOffsetHeight();
			this.xSwitchClass(document.body, "loading_true", "loading_false");
		} catch(e){
			console.log("tplMgr.onLoad error: "+e);
		}
	},
	/** tplMgr.next() - move to next page in the history. */
	next : function(){
		if (this.fHistMgr){
			if(scServices.preloadMgr) scServices.preloadMgr.goTo(this.fHistMgr.next());
			else window.location.replace(this.fHistMgr.next());
		}
	},
	/** tplMgr.back() - move to next page in the history. */
	back : function(){
		if (this.fHistMgr){
			if(scServices.preloadMgr) scServices.preloadMgr.goTo(this.fHistMgr.back());
			else window.location.replace(this.fHistMgr.back());
		}
	},

	addZenButton : function(pParent){
		if (pParent){
			var vFullScreen = tplMgr.fStore.get("templateZen") && tplMgr.fStore.get("templateZen") == 'true' ? true : false;
			this.xSwitchClass(this.fMain.parentNode.parentNode, "zen_"+!vFullScreen, "zen_"+vFullScreen, true);
			var vZenBtn = this.xAddBtn(pParent, "btnZen", this.fStrings[10], this.fStrings[11]);
			vZenBtn.onclick = this.sToggleZen;
			return vZenBtn;
		}
	},

	addZenListener: function(pFunc) {
		this.fZenListeners.push(pFunc);
	},

	addStepToolsButton : function(){
		if (!this.xIsAddStepToolsBtn()) {
			if (this.fStepToolsBtn) this.fStepToolsBtn.parentNode.removeChild(this.fStepToolsBtn);
			return null;
		}
		var vStepToolsState = tplMgr.fStore && tplMgr.fStore.get("templateStepTools") && tplMgr.fStore.get("templateStepTools") == 'true' ? true : false;
		this.xSwitchClass(this.fMain.parentNode.parentNode, "stepToolsHide_"+vStepToolsState, "stepToolsHide_"+!vStepToolsState, true);
		var vStepToolsBtn = this.xAddBtn(this.fStepToolsBar, vStepToolsState?"stepToolsBtn closedBarBtn":"stepToolsBtn openBarBtn", this.fStrings[14], this.fStrings[15]);
		vStepToolsBtn.onclick = this.sToggleStepToolsBar;
		return vStepToolsBtn;
	},

	makeVisible : function(pNode){
		// Ouvre bloc collapsable contenant pNode
		var vCollBlk = scPaLib.findNode("anc:.collBlk_closed",pNode);
		if(vCollBlk) vCollBlk.fTitle.onclick();
	},

	/** sToggleZen */
	sToggleZen : function(pEvent){
		this.fFullScreen = !this.fFullScreen;
		this.innerHTML = '<span>' + tplMgr.fStrings[(this.fFullScreen ? 12 : 10)] + '</span>';
		this.title = tplMgr.fStrings[(this.fFullScreen ? 13 : 11)];
		tplMgr.fStore.set("templateZen", this.fFullScreen);
		tplMgr.xSwitchClass(tplMgr.fMain.parentNode.parentNode, "zen_"+!this.fFullScreen, "zen_"+this.fFullScreen, true);
		for (var i=0; i<tplMgr.fZenListeners.length; i++) {
			try{tplMgr.fZenListeners[i]();} catch(e){}
		}
		scResizerMgr.notifyListener("resized");
		return false;
	},

	sToggleStepToolsBar: function(pEvent) {
		var vTemplateStepTools = tplMgr.fStore.get("templateStepTools");
		this.fStepToolsBarOpen = this.fStepToolsBarOpen == undefined && vTemplateStepTools == 'true' ? false : !this.fStepToolsBarOpen;
		if (tplMgr.fStepToolsBar) {
			this.innerHTML = '<span>' + tplMgr.fStrings[(this.fStepToolsBarOpen ? 16 : 14)] + '</span>';
			this.title = tplMgr.fStrings[(this.fStepToolsBarOpen ? 17 : 15)];
			tplMgr.fStore.set("templateStepTools", this.fStepToolsBarOpen);
			tplMgr.xSwitchClass(this, this.fStepToolsBarOpen?"openBarBtn":"closedBarBtn", this.fStepToolsBarOpen?"closedBarBtn":"openBarBtn", true);
			tplMgr.xSwitchClass(tplMgr.fMain.parentNode.parentNode, "stepToolsHide_"+this.fStepToolsBarOpen, "stepToolsHide_"+!this.fStepToolsBarOpen, true);
		}
	},

	sQuizPrv : function(){
		scCoLib.log("tplMgr.sQuizPrv");
		if (tplMgr.fQuizIdx <= 0) return;
		tplMgr.fQuizIdx--
		tplMgr.xQuizUdt();
	},
	sQuizNxt : function(){
		scCoLib.log("tplMgr.sQuizNxt");
		if (tplMgr.fQuizIdx >= tplMgr.fQuizBks.length - 1) return;
		tplMgr.fQuizIdx++
		tplMgr.xQuizUdt();
	},
	sQuizTglMde : function(pEvent){
		scCoLib.log("tplMgr.sQuizTglMde");
		if (tplMgr.fQuizBtnMde) {
			tplMgr.fQuizBtnMde.title = tplMgr.fStrings[tplMgr.fQuizSteped+2];
			tplMgr.fQuizBtnMde.innerHTML =  "<span>" + tplMgr.fStrings[tplMgr.fQuizSteped] + "</span>";
			tplMgr.fQuizBtnMde.className = "btnQuizMde" + (tplMgr.fQuizSteped == 0 ? " quizSteped" : "");
		}
		if (tplMgr.fQuizSteped) {
			tplMgr.fQuizSteped = 1 - tplMgr.fQuizSteped;
			document.cookie = "quizModeSteped=" + (tplMgr.fQuizSteped == 0);
		}
		if (tplMgr.fQuizSteped && tplMgr.fQuizSteped == 0) {
			tplMgr.fQuizIdx = -1;
			tplMgr.sQuizNxt();
		} else {
			for (i in tplMgr.fQuizBks) {
				tplMgr.fQuizBks[i].style.display = "";
				tplMgr.fQuizBks[i].className = tplMgr.fQuizBks[i].className + " quizBkInList";
			}
			for (var i = 0; i < tplMgr.fArcDisplay.length; i++) {
				if (tplMgr.fQuizBtnNxt) tplMgr.fQuizBtnNxt[i].style.display = "none";
				tplMgr.fArcDisplay[i].style.display = "";
			}
		}
		if (pEvent) tplMgr.fStepToolsBtn = tplMgr.addStepToolsButton();
		tplMgr.xSetArcOffsetHeight();
	},
	xQuizUdt : function(){
		scCoLib.log("tplMgr.xQuizUdt");
		for (var i=0; i<this.fQuizBks.length; i++) {
			this.fQuizBks[i].style.display = (i == this.fQuizIdx ? "" : "none");
			this.fQuizBks[i].className = this.fQuizBks[i].className.replace(" quizBkInList", "");
		}
		for (var i = 0; i < tplMgr.fArcDisplay.length; i++) {
			this.fQuizBtnNxt[i].style.display = (tplMgr.fQuizIdx >= tplMgr.fQuizBks.length - 1 ? "none" : "");
			this.fArcDisplay[i].style.display = (tplMgr.fQuizIdx >= tplMgr.fQuizBks.length - 1 ? "" : "none");
		}
	},
	xIsAddStepToolsBtn: function() {
		var vArcBtns = scPaLib.findNodes("des:a", this.fArc);
		var vArcBk = scPaLib.findNode(this.fQuizArcBkPath, this.fArc);
		var vChooseArcBk = scPaLib.findNode(this.fChooseArcBkPath, this.fArc);
		var vCount = 0;
		if(!vChooseArcBk && vArcBk && vArcBk.style.display != "none") {
			for (var i = 0; i < vArcBtns.length; i++) {
				var vArcBtn = vArcBtns[i];
				if (vArcBtn.style.display == "") vCount++;
			}
		}
		if (topazeMgr.fNxtCounts > 1) return true;
		if (this.fCoach) return true;
		if ((topazeMgr.fNodeType=="exp" || topazeMgr.fNodeType=="assmnt") && vArcBtns.length > 1 && vCount > 1) return true;
		return false;
	},
	xSetArcOffsetHeight: function () {
		if (this.fStore) {
			var vIsBigContent = scPaLib.findNode("des:section", this.fMain).offsetHeight >= this.fMain.offsetHeight;
			var vTemplateStepTools = this.fStore.get("templateStepTools");
			if (this.fStepToolsBtn && (vIsBigContent && vTemplateStepTools == 'true' || !vIsBigContent && vTemplateStepTools == 'false')) this.fStepToolsBtn.click();
		}
	},

	/* ================== toolbox =====================*/
	/** tplMgr.xReadStyle : cross-browser css rule reader */
	xReadStyle : function(pElt, pProp) {
		try {
			var vVal = null;
			if (pElt.style[pProp]) {
				vVal = pElt.style[pProp];
			} else if (pElt.currentStyle) {
				vVal = pElt.currentStyle[pProp];
			} else {
				var vDefaultView = pElt.ownerDocument.defaultView;
				if (vDefaultView && vDefaultView.getComputedStyle) {
					var vStyle = vDefaultView.getComputedStyle(pElt, null);
					var vProp = pProp.replace(/([A-Z])/g,"-$1").toLowerCase();
					if (vStyle[vProp]) return vStyle[vProp];
					else vVal = vStyle.getPropertyValue(vProp);
				}
			}
			return vVal.replace(/\"/g,""); //Opera returns certain values quoted (literal colors).
		} catch (e) {
			return null;
		}
	},
	/** tplMgr.xSwitchClass - switch css classes. */
	xSwitchClass : function(pNode, pClassOld, pClassNew, pAddIfAbsent) {
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
	},
	/** navMgr.xAddElt : Add an HTML element to a parent node. */
	xAddElt : function(pName, pParent, pClassName, pNoDisplay, pHidden, pNxtSib){
		var vElt;
		if(scCoLib.isIE && pName.toLowerCase() == "iframe") {
			//BUG IE : impossible de masquer les bordures si on ajoute l'iframe via l'API DOM.
			var vFrmHolder = pParent.ownerDocument.createElement("div");
			if (pNxtSib) pParent.insertBefore(vFrmHolder,pNxtSib)
			else pParent.appendChild(vFrmHolder);
			vFrmHolder.innerHTML = "<iframe scrolling='no' frameborder='0'></iframe>";
			vElt = vFrmHolder.firstChild;
		} else {
			vElt = pParent.ownerDocument.createElement(pName);
			if (pNxtSib) pParent.insertBefore(vElt,pNxtSib)
			else pParent.appendChild(vElt);
		}
		if (pClassName) vElt.className = pClassName;
		if (pNoDisplay) vElt.style.display = "none";
		if (pHidden) vElt.style.visibility = "hidden";
		return vElt;
	},
	/** tocMgr.xAddBtn : Add a HTML button to a parent node. */
	xAddBtn : function(pParent, pClassName, pCapt, pTitle, pNxtSib) {
		var vBtn = pParent.ownerDocument.createElement("a");
		vBtn.className = pClassName;
		vBtn.fName = pClassName;
		vBtn.href = "#";
		vBtn.target = "_self";
		if (pTitle) vBtn.setAttribute("title", pTitle);
		vBtn.innerHTML = "<span>" + pCapt + "</span>"
		if (pNxtSib) pParent.insertBefore(vBtn,pNxtSib)
		else pParent.appendChild(vBtn);
		return vBtn;
	},

	loadSortKey : "YtplMgr"
}

/** Local Storage API (localStorage/userData/cookie) */
function LocalStore(pId){
	if (pId && !/^[a-z][a-z0-9]+$/.exec(pId)) throw new Error("Invalid store name");
	this.fId = pId || "";
	this.fRootKey = document.location.pathname.substring(0,document.location.pathname.lastIndexOf("/")) +"/";
	if ("localStorage" in window && typeof window.localStorage != "undefined") {
		this.get = function(pKey) {var vRet = localStorage.getItem(this.fRootKey+this.xKey(pKey));return (typeof vRet == "string" ? unescape(vRet) : null)};
		this.set = function(pKey, pVal) {localStorage.setItem(this.fRootKey+this.xKey(pKey), escape(pVal))};
	} else if (window.ActiveXObject){
		this.get = function(pKey) {this.xLoad();return this.fIE.getAttribute(this.xEsc(pKey))};
		this.set = function(pKey, pVal) {this.fIE.setAttribute(this.xEsc(pKey), pVal);this.xSave()};
		this.xLoad = function() {this.fIE.load(this.fRootKey+this.fId)};
		this.xSave = function() {this.fIE.save(this.fRootKey+this.fId)};
		this.fIE=document.createElement('div');
		this.fIE.style.display='none';
		this.fIE.addBehavior('#default#userData');
		document.body.appendChild(this.fIE);
	} else {
		this.get = function(pKey){var vReg=new RegExp(this.xKey(pKey)+"=([^;]*)");var vArr=vReg.exec(document.cookie);if(vArr && vArr.length==2) return(unescape(vArr[1]));else return null};
		this.set = function(pKey,pVal){document.cookie = this.xKey(pKey)+"="+escape(pVal)};
	}
	this.xKey = function(pKey){return this.fId + this.xEsc(pKey)};
	this.xEsc = function(pStr){return "LS" + pStr.replace(/ /g, "_")};
}

function scSiRuleEnsureVisible(pPathNode, pContainer) {
	this.fPathNode = pPathNode;
	this.fContainer = pContainer;
	scOnLoads[scOnLoads.length] = this;
}
scSiRuleEnsureVisible.prototype.onResizedAnc = function(pOwnerNode, pEvent) {
	if(pEvent.phase==1 || pEvent.resizedNode == pOwnerNode) return;
	this.ensureVis();
}
scSiRuleEnsureVisible.prototype.onResizedDes = function(pOwnerNode, pEvent) {
	if(pEvent.phase==1) return;
	this.ensureVis();
}
scSiRuleEnsureVisible.prototype.resetNode = function() {
	this.fNode = scPaLib.findNode(this.fPathNode, this.fContainer);
	this.ensureVis();
}
scSiRuleEnsureVisible.prototype.ensureVis = function() {
	if( !this.fNode) return;
	try{
		var vParent = this.fNode.offsetParent;
		if( !vParent) return;
		var vOffset = this.fNode.offsetTop;
		while(vParent != this.fContainer) {
			var vNewParent = vParent.offsetParent;
			vOffset += vParent.offsetTop;
			vParent = vNewParent;
		}
		var vOffsetMiddle = vOffset + this.fNode.offsetHeight/2;
		var vMiddle = this.fContainer.clientHeight / 2;
		this.fContainer.scrollTop = vOffsetMiddle - vMiddle;
	} catch(e) {scCoLib.log("ERROR: scSiRuleEnsureVisible.ensureVis : "+e)}
}
scSiRuleEnsureVisible.prototype.onLoad = function() {
	try {
		this.resetNode();
		scSiLib.addRule(this.fContainer, this);
	} catch(e){scCoLib.log("ERROR: scSiRuleEnsureVisible.onLoad : "+e);}
}
scSiRuleEnsureVisible.prototype.loadSortKey = "SiZ";
scSiRuleEnsureVisible.prototype.ruleSortKey = "Z";
