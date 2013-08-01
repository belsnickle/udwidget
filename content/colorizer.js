/* ***** BEGIN LICENSE BLOCK *****
 *   Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 * 
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is colorizer.
 *
 * The Initial Developer of the Original Code is Max Grivas.
 *
 * Portions created by the Initial Developer are Copyright (C) 2007
 * the Initial Developer. All Rights Reserved.
 *
 * This code is based on the name colorization code of ShadowLord found in udTool 0.6.6
 * 	found originaly at http://www.sl.ecwhost.com/ud
 *  later mirrored at http://www.adzone.org/UDTool/udtool%200.6.6a.xpi
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 * 
 * ***** END LICENSE BLOCK ***** */

var udw_ColorData = null;
var ColorReqs = null;

/*
 *  Function:	ListClass();
 *	
 *	 description.
 *
 */
 function ListClass()  {
	this.lastModifiedTime = null;
	//this.originalList = null;
	this.colorList = null;
	this.colorText = null;
	this.userList = null;
	this.groupNumList = null;
	this.headerList = null;
	this.hasMD5Names = false;
	this.nameCommentList = null;
	this.nameCommentHT = null;
	
	//hashtables which are NOT used when saving the list, and NOT used in safe mode
	this.colorHT = null;
	this.groupHT = null;
	this.userHT = null;
	this.urlLines = null;
	this.unfinishedUrlLines = 0;	
	this.retries = 0;
	}

/*
 *  Function:	cloneArray(oldArray);
 *	
 *	 description.
 *
 */
 function cloneArray(oldArray) {
	var newArray = new Array();
	for (var idx=0; idx<oldArray.length; idx++) {
		newArray.push(oldArray[idx]);
	}
	return newArray;
 }

/*
 *  Function:	cloneHT(oldHT);
 *	
 *	 description.
 *
 */
 function cloneHT(oldHT) {
	var newHT = {};
	for (var idx in oldHT) {
		newHT[idx]=oldHT[idx];
	}
	return newHT;
 }

/*
 *  Function:	cloneList(oldList);
 *	
 *	 description.
 *
 */
 function cloneList(oldList) {

//	alert("CloneList");

	var newList = new ListClass();
	newList.lastModifiedTime = oldList.lastModifiedTime;
	//newList.originalList = null;
	newList.colorList = cloneArray(oldList.colorList);
	newList.colorText = cloneArray(oldList.colorText);
	newList.userList = cloneArray(oldList.userList);
	newList.groupNumList = cloneArray(oldList.groupNumList);
	newList.headerList = cloneArray(oldList.headerList);
	newList.hasMD5Names = oldList.hasMD5Names;
	newList.nameCommentList = cloneArray(oldList.nameCommentList);
	newList.nameCommentHT = cloneHT(oldList.nameCommentHT);
	//hashtables which are NOT used when saving the list, and NOT used in safe mode
	newList.colorHT = cloneHT(oldList.colorHT);
	newList.groupHT = cloneHT(oldList.groupHT);
	newList.userHT = cloneHT(oldList.userHT);
	newList.urlLines = cloneArray(oldList.urlLines);
	
	newList.unfinishedUrlLines = oldList.unfinishedUrlLines;
	newList.retries = oldList.retries;
	
	var nameCommentHT2 = cloneHT(newList.nameCommentHT);
	for (var key in nameCommentHT2) {
		var comment = nameCommentHT2[key];
		if (comment==null || comment==undefined && comment!="") {
			newList.nameCommentHT[key] = newList.colorText[newList.userHT[key]];
		} else {
			//alert("newList.colorText[newList.userHT[key]]="+newList.colorText[newList.userHT[key]]+", newList.userHT[key]="+newList.userHT[key]+", key="+key);
			newList.nameCommentHT[key] = newList.colorText[newList.userHT[key]] + " - " + comment;
			//alert("changed newList.nameCommentHT["+key+"] from ("+comment+") to ("+newList.nameCommentHT[key]+")");
		}
	}

//	alert("CloneList Done");

	return newList;

 }

/*
 *  Function:	getDataFile();
 *	
 *	 description.
 *
 */
 function getDataFile() {
	//alert("getDataFile");
	var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.udwidget.");
	var dataFile;
	try {
		dataFile = prefs.getComplexValue("ColorFile", Components.interfaces.nsILocalFile);
	} catch (e) {
		alert("GDF "+e);
		var dataPath = prefs.getCharPref("ColorPath");
		dataFile = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
		file.initWithPath(dataPath);
		
	}

	return dataFile;
 }

/*
 *  Function:	stripSpaces(str);
 *	
 *	 description.
 *
 */
 function stripSpaces(str) {
	var lowIdx = str.length;
	var highIdx = -1;
	for (var idx = 0; idx<str.length; idx++) {
		if (str[idx]!=' ' && str[idx]!='\t') {
			if (idx<lowIdx) lowIdx=idx;
			if (idx>highIdx) highIdx=idx;
		}
	}
	if (lowIdx>0 || highIdx<str.length-1) {
		return str.substring(lowIdx, highIdx+1);
	} else {
		return str;
	}	
 }

/*
 *  Function:	loadList();
 *	
 *	 description.
 *
 */
 function loadList() {
	//alert("loadList");
	var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.udwidget.");
	var list = new Array();
	var dataType = 0;
	var dataFile = null;
//	var dataURI = "";
	try {
		dataType = prefs.getIntPref("ColorType");
		dataFile = getDataFile();
//		dataURI = prefs.getCharPref("dataURI");
	} catch (e) {
		alert("loadList: "+e);
	}
	if (dataType==0 || (dataType==1 && dataFile==null)) {
		//Ask them where the list is, or where to put it.
		alert("Use Tools->udWidget Options to 'Import Groups and Names'.");
		//askListLocation();
	}
	if (dataType==0) {
		//alert("dataType==0");
		return list;
	} else if (dataType==1) {
		//alert("dataType==1");
		var file = dataFile;
		var istream = Components.classes["@mozilla.org/network/file-input-stream;1"].createInstance(Components.interfaces.nsIFileInputStream);
		try {
			istream.init(file, 0x01, 0444, 0);
		} catch (e) {
			alert("udWidget can't read your list file. Did you delete or rename it? Use Tools->udWidget Options to 'Import Groups and Names'.");
			//askListLocation();
		}
		istream.QueryInterface(Components.interfaces.nsILineInputStream);
		
		// read lines into array
		var line = {}, hasmore;
		var id=0;
		do {
			hasmore = istream.readLine(line);
			list.push(stripSpaces(line.value));
			id++;			
		} while(hasmore);
		
		istream.close();
	} else if (dataType==2) {
		//get the nsfile from the URI
		alert("URI loading is not supported yet.");
		
	}
	
	// work with returned nsILocalFile...
	return list;
 }


/*
 *  Function:	loadAndParseList();
 *	
 *	 description.
 *
 */
 function loadAndParseList(doc,isProfilePage,isContactsPage) {
	//alert("loadAndParseList");
	var dataType = 0;
	var dataFile = null;
	//var dataURI = "";
	var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.udwidget.");
	try {
		dataType = prefs.getIntPref("ColorType");
		dataFile = getDataFile();
		//dataURI = prefs.getCharPref("dataURI");
		if (dataType==1 && udw_ColorData!=null) {
			//alert("dataType="+dataType+" udw_ColorData.lastModifiedTime="+udw_ColorData.lastModifiedTime+" dataFile.lastModifiedTime="+dataFile.lastModifiedTime);
			if (udw_ColorData.lastModifiedTime != null && udw_ColorData.lastModifiedTime >= dataFile.lastModifiedTime) {
				return udw_ColorData;
				}
			}
		}
	catch (e) { }

//	alert("Loading Color Data.");

	udw_ColorData=null;
	var list = loadList();
	//alert("list.length="+list.length);
	var colorList = new Array();
	var colorText = new Array();
	var userList = new Array();
	var groupNumList = new Array();
	var headerList = new Array();
	var nameCommentList = new Array();
	var nameCommentHT = {};
	var colorHT = {};
	var userHT = {};
	var groupHT = {};
	var hasMD5Names = false;
	
	var urlLines = new Array();
	var nameLines = new Array();
	var groupLines = new Array();

	var doneGroups = 0;
	for (var lineNum=0; lineNum<list.length; lineNum++) {
		var line = list[lineNum];
		if (line.search(":")==0) {
			urlLines.push(line);
		} else if (line.search(";")==0) {	//header lines
// Just Drop it
//			headerList.push(line);
// Just Drop it
		} else if (line.search("#")==0) {	//#ff0000
			groupLines.push(line);
		} else {
			nameLines.push(line);
		}
	}

	udw_Color_MergeGroups(groupLines,colorList,colorText,colorHT,groupHT);

	udw_Color_MergeNames(nameLines,userList,userHT,nameCommentList,nameCommentHT,groupNumList,colorText,groupHT);

	var listClass = new ListClass();
	listClass.list = list;
	listClass.colorList = colorList;
	listClass.colorText = colorText;
	listClass.userList = userList;
	listClass.groupNumList = groupNumList;
	listClass.headerList = headerList;
	listClass.colorHT = colorHT;
	listClass.groupHT = groupHT;
	listClass.userHT = userHT;
	listClass.hasMD5Names = hasMD5Names;
	listClass.nameCommentList = nameCommentList;
	listClass.nameCommentHT = nameCommentHT;
	listClass.urlLines = urlLines;
	try {
		dataType = prefs.getIntPref("ColorType");
		dataFile = getDataFile();
		//dataURI = prefs.getCharPref("dataURI");
		if (dataType==1)
			listClass.lastModifiedTime = dataFile.lastModifiedTime;
		}
	catch (e) { }

	if (listClass.urlLines.length) {
		for (var u = 0; u < listClass.urlLines.length; u++) {
			udw_AsyncUrlLine(listClass.urlLines[u],doc,isProfilePage,isContactsPage);
			}
		}

	return listClass;
 }


/*
 *  Function:	udw_Color_MergeGroups(line)
 *	
 *	 add group lines to color list and hash tables
 *	
 */
 function udw_Color_MergeGroups(groupLines,colorList,colorText,colorHT,groupHT) {
	var groupNum = null;
	var groupname = null;
	var line = null;
	var lineElems = null;

	for (groupNum = 0; groupNum<groupLines.length; groupNum++) {
		line = groupLines[groupNum];
		lineElems = line.split(",");
		if (lineElems.length >= 2) {
			groupname = lineElems[1];
			if (colorHT[groupname]==undefined) {
				colorHT[groupname]=lineElems[0];
				groupHT[groupname]=colorList.length;
				}
			colorList.push(lineElems[0]);
			colorText.push(groupname);
			}
		else {
			alert("Invalid entry in the list: ["+line+"]. It should be [#color,group description] (The []s should be omitted).");
			}
		}
	}  //	udw_Color_MergeGroups

/*
 *  Function:	udw_Color_MergeNames(line)
 *	
 *	 add name lines to color list and hash tables
 *	
 */
 function udw_Color_MergeNames(nameLines,userList,userHT,nameCommentList,nameCommentHT,groupNumList,colorText,groupHT) {
	var badLines = new Array();
	var nameNum = null;
	var line = null;
	var lineElems = null;

	// Handle Merging Names with global udw_ColorData.
	for (nameNum = 0; nameNum<nameLines.length; nameNum++) {
		line = nameLines[nameNum];
		if (line.length>0) {
			lineElems = line.split(",");
			if (lineElems.length >= 2) {	//So people could use an extra , to allow for comments
				var gntxt = lineElems[1]
				var gn = parseInt(gntxt);
				if (!isNaN(gn) && gn.toString(10).length!=gntxt.length) {	//If a string starts with a number, parseInt will grab the number regardless of anything after it. We don't want that behavior, so we test to make sure parseInt didn't do it. If it did, we override it.
					gn = undefined;
					}
				if (isNaN(gn)) {	//The code in here may fix this, so we check gn again afterwards.
					gn = groupHT[gntxt];
					if (!isNaN(gn) && gntxt!=colorText[gn]) {
						alert("Errr... hashtables are being stupid. Report this as a bug so it can be worked around.");
						}
					}
				if (!isNaN(gn)) {	//Check gn again, the code above may have fixed it if it was a NaN.
					if (lineElems[0].charAt(0)=='$') {
					//	hasMD5Names=true;
						}
					if (lineElems.length>2) {
						var comment = lineElems[2];
						if (comment!=null && comment!=undefined && comment!="") {
							//alert("Comment = "+comment);
							for (var el=3; el<lineElems.length; el++) {
								comment += ","+lineElems[el];
								}
							//alert("Comment now = "+comment);
							nameCommentList.push(comment);
							var oldComment = nameCommentHT[lineElems[0]];
							var oldGn = userHT[uname];
							var mergedComment = "";
							if (oldComment!=null && oldComment!=undefined && oldComment!="") {
								mergedComment=colorText[oldGn]+" - "+oldComment;
								}
							if (comment!=null && comment!=undefined && comment!="") {
								if (mergedComment!=null && mergedComment!=undefined && mergedComment!="") {
									mergedComment=comment+". "+mergedComment;
									}
								else {
									mergedComment=comment;
									}
								}
							nameCommentHT[lineElems[0]]=mergedComment;
							}
						}
					else {
						nameCommentList.push(null);
						nameCommentHT[lineElems[0]]=null;
						}
					userList.push(lineElems[0]);
					var uname = lineElems[0];
					if (userHT[uname]==undefined) {
							userHT[uname] = gn;
							}
					groupNumList.push(gn);
					}
				else {
					//alert("An invalid entry in the list: ["+line+"]. The group number or name ("+gntxt+") is invalid. It should be [name,group] with group being either a group number, or the group 'description'. (The []s should be omitted).");
					badLines.push(line);
					}
				}
			else {
				//alert("Invalid entry in the list: ["+line+"]. It should be [name,groupNumber] (The []s should be omitted).");
				badLines.push(line);
				}
			}
		}

	if (badLines.length) {
		var ErrMsg = 'The folowing lines are poorly formed.\n';
			ErrMsg+= 'They should be [name,groupNumber] (The []s should be omitted).\n';
			ErrMsg+= 'Press Enter to continue\n\n';

		for (var b = 0; b<badLines.length; b++) {
			ErrMsg+= badLines[b]+'\n';
			}
		alert(ErrMsg);
		}

	}  //	udw_Color_MergeNames

/*
 *  Function:	udw_smartSplit(line)
 *	
 *	 From UDTool 0.6.8
 *	
 *		takes apart complex url lines
 */
function udw_smartSplit(line) {
	var array = new Array();
	var parens = 0;
	var startSplit = 0;
	var segment = new Array();
	for (var i=0; i<line.length; i++) {
		var c = line.charAt(i);
		if (c=='(') {
			if (parens==0) {
				segment.push(line.substring(startSplit,i));
				startSplit=i+1;
			}
			parens++;
		} else if (c==')') {
			parens--;
			if (parens==0) {
				segment.push(line.substring(startSplit,i));
				startSplit=i+1;
			}
		} else if (c==',' && parens==0) {
			//var segment = line.substring(startSplit, i);
			//alert("Pushing segment ["+segment+"], substring("+startSplit+", "+i+") of \""+line+"\"");
			array.push(segment);
			startSplit=i+1;
			segment = new Array();
		}
	}
	if (segment.length>0) {
		//alert("Pushing final segment ["+segment+"]");
		array.push(segment);
	}
	return array;
	}

/*
 *  Function:	udw_AsyncUrlLine(lines,doc,isProfilePage,isContactsPage)
 *	
 *	 description.
 *
 */
 function udw_AsyncUrlLine(line,doc,isProfilePage,isContactsPage) {
	if (!line) return null;

	var segs = udw_smartSplit(line);
//	alert('segs: '+segs.length);

	if (!ColorReqs) ColorReqs = new Array();
	var req = ColorReqs.length;

	ColorReqs[req] = new XMLHttpRequest();
	ColorReqs[req].seg = new Array();
	ColorReqs[req].rep = new Array();
	ColorReqs[req].doc = doc;
	ColorReqs[req].isProfilePage = isProfilePage;
	ColorReqs[req].isContactsPage = isContactsPage;

	var r = 0;
	for (var s = 0; s < segs.length; s++) {
		if (segs[s][0].toLowerCase()!='replace') ColorReqs[req].seg[segs[s][0].toLowerCase()]=segs[s][1];
		else {
			var repsegs = udw_smartSplit(segs[s][1]);
			if (repsegs[0][0].toLowerCase()=='from' && repsegs[1][0].toLowerCase()=='to' && repsegs[0][1].length) {
				ColorReqs[req].rep[r] = new Array();
				ColorReqs[req].rep[r][0] = repsegs[0][1];
				ColorReqs[req].rep[r][1] = repsegs[1][1];
				r++;
				}
			}
		}

	if (ColorReqs[req].seg[':url'] == undefined) {
		return null;
		}

	// Default replacements
	ColorReqs[req].rep.push(["\r",""]);
	ColorReqs[req].rep.push(["&#039;","'"]);
	ColorReqs[req].rep.push(["&nbsp;"," "]);
	ColorReqs[req].rep.push(["<br[ /]*>", "\n"]);

	// Create Asyncronus request
	ColorReqs[req].open('GET', ColorReqs[req].seg[':url'], true);
	ColorReqs[req].onload=udw_ColorUrlCallback;

	// Don't care about errors for now
	//tfReq.onerror=udw_ZN_onError;
	// Let it not show up ...

//	alert('ColorReqs[req].seg: '+ColorReqs[req].seg.length+'\nColorReqs[req].rep: '+ColorReqs[req].rep.length);

	ColorReqs[req].send(null);

	}  //  udw_AsyncUrlLine

/*
 *  Function:	udw_ColorUrlCallback()
 *	
 *		Handle return from request for color data
 *
 */
 function udw_ColorUrlCallback(e) {
	var szPage = e.target.responseText;
	if (!szPage) return;

	var req = e.target;
	var rep = req.rep;
	var seg = req.seg;

	if ( seg['start']!=undefined  && seg['end']!=undefined ) {
		var cropReg = new RegExp('('+seg['start']+')(.+)('+seg['end']+')','i');
		var cropMatch = szPage.match(cropReg);
		if (cropMatch) szPage = cropMatch[2];
		}

	if (!szPage) return;

	for (var rr = 0; rr<rep.length; rr++) {
		var repReg = new RegExp(rep[rr][0],'gi');
		var repThing = (rep[rr][1].indexOf('%') > -1) ? decodeURIComponent(rep[rr][1]) : rep[rr][1].replace(/\\n/, '\n');
		szPage = szPage.replace(repReg,repThing);
		}

	var list = szPage.split(/\n/);
	var groupLines = new Array();
	var nameLines = new Array();

	for (var lineNum=0; lineNum<list.length; lineNum++) {
		var line = list[lineNum];
		if (line.search(":")==0) {
			// Just Drop it
			}
		else if (line.search(";")==0) {	//header lines
			// Just Drop it
			}
		else if (line.search("#")==0) {	//#ff0000
			groupLines.push(line);
			}
		else {
			nameLines.push(line);
			}
		}

	// Handle Merging Groups with global udw_ColorData.
	udw_Color_MergeGroups(groupLines,udw_ColorData.colorList,udw_ColorData.colorText,udw_ColorData.colorHT,udw_ColorData.groupHT);

	// Handle Merging Names with global udw_ColorData.
	udw_Color_MergeNames(nameLines,udw_ColorData.userList,udw_ColorData.userHT,udw_ColorData.nameCommentList,udw_ColorData.nameCommentHT,udw_ColorData.groupNumList,udw_ColorData.colorText,udw_ColorData.groupHT);

	// recolor names
	if (content.document==req.doc) udw_ColorizeNames(req.doc,req.isProfilePage,req.isContactsPage);

	}  //  udw_ColorUrlCallback

/*
 *  Function:	udw_ColorizeNames(doc);
 *	
 *	 Name Colorization.
 *
 */
 function udw_ColorizeNames(doc,isProfilePage,isContactsPage) {
	udw_ColorData = loadAndParseList(doc,isProfilePage,isContactsPage);
		
	var aElements;
	if (isProfilePage) {
		aElements = doc.getElementsByTagName('h1');
	} else {
		aElements = doc.getElementsByTagName('a');	//profile links are <a>'s.
	}
	if (aElements.length>0) {
		//consoleServices.logStringMessage("UDTool: There are "+elements.length+" elements.");
		var link;
		for (var idx = 0; idx<aElements.length; idx++) {
			//consoleServices.logStringMessage("UDTool: Start "+idx+".");
			link = aElements.item(idx);
			var href = "";
			if (!isProfilePage) {
				href = link.getAttribute("href");
			}
			if (isProfilePage || href.search("profile.cgi") > -1) {

				// In the since your last turn section
				// 		the name could be in a span if they are a contact
				var hasspan = link.getElementsByTagName('span');
				if (hasspan && hasspan.length) link = hasspan[0];

				var html = link.innerHTML;
				var inList=0;
				var newname = html.replace(/&nbsp;/g, ' ');

				if (isContactsPage) {
					var strikeTest = newname.match(/<strike.+>(.+)<\/strike>/i);
					if (strikeTest) newname = strikeTest[1];
					}

				var gnum = udw_ColorData.userHT[newname];
				if (gnum!=undefined) {
					linList=1;
					link.setAttribute("style", "color:"+udw_ColorData.colorList[gnum]+"; font-weight:bold;");
					var title = udw_ColorData.nameCommentHT[newname];
					//if (title!="" && title!=null) alert("udw_ColorData.nameCommentHT["+newname+"] is ("+title+").");
					link.setAttribute("title", " "+title+" ");
				}
			}
		}
	}
 }
		
/*
 *  Function:	hexify(val);
 *	
 *	 change val into "00" or "ff" or the like.
 *
 */
 function hexify(val) {
	var str = val.toString(16);
	while (str.length<2) {
		str = "0"+str;
	}
	return str;
	}

/*
 *  Function:	udw_ColorizeHP(doc);
 *	
 *	 Hit Point Colorization.
 *
 */
 function udw_ColorizeHP(doc) {
	var mainbox = 0;
	try { mainbox = getElementsByClass('gt',doc,'div')[0]; }
	catch(e) { alert(ExtAlert+ "Could not find the side box:"+e); }
	if (!mainbox) { return; }
	var html = mainbox.innerHTML;
			
	if (html!=null) {
		//look for <sub>
		const hpRegex = /\(([0-9]+)<sub>HP<\/sub>\)/ig;
		var results = html.match(hpRegex);
		if (results!=null && results.length>=1) {
			var results2 = new Array();
			for (var resultIdx=0; resultIdx<results.length; resultIdx++) {
				var result = results[resultIdx];
				//alert("result="+result);
				results2.push(new String(result));
			}
			for (var resultIdx=0; resultIdx<results2.length; resultIdx++) {
				var resultB = results2[resultIdx];
				var resultC = resultB.match(hpRegex);
				//alert("resultB="+resultB+" resultC="+resultC+" RegExp.$1="+RegExp.$1);
				if (RegExp.$1!=null && RegExp.$1!=undefined) {
					var hpstr = RegExp.$1;
					var hp = parseInt(hpstr);
					if (hp!=50 && hp!=60) {
						const ctweak = 255/60;
						var red = Math.floor((60-hp)*ctweak);
						var green = Math.floor(hp*ctweak);
						var max = Math.max(red, green);
						red+=(255-max);
						green+=(255-max);
						var spanElement = doc.createElement("span");
						var color = "color:#"+hexify(red)+hexify(green)+"00;";
						//alert("color("+color+")");
						html = html.replace(new RegExp("\\("+hpstr+"<sub>HP</sub>\\)", "i"), "(<span style=\""+color+" font-weight:bold;\">"+hpstr+"<sub>HP</sub></span>)");
					}
				}
			}
		}
		mainbox.innerHTML = html;
	}
 }

