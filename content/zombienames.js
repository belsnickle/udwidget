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
 * The Original Code is zombienames.
 *
 * The Initial Developer of the Original Code is Max Grivas.
 *
 * Portions created by the Initial Developer are Copyright (C) 2007
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
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

/*
 *  Global Data for zombie names:
 *		
 *
 */

var udw_Zombies_Known = null;
var udw_ZN_WriteCount = 0;
var FetchReqs = null;

/*
 *  Function:	udw_WorkZombieProfiles(document)
 *	
 *	replace "A zombie" with "A zombie (name of zombie)"
 *
 */
 function udw_WorkZombieProfiles(d)  {
	var tfNdx = d.lastModified;
	var local_ToFetch = null;
	var known_Touch = null;

	var debug_out = '';

//if (isDebugEnabled) alert('zn tfNdx: '+tfNdx);

	var gp = getElementsByClass('gp',d,'td')[0];
	var links = gp.getElementsByTagName('a');

//if (isDebugEnabled) alert('zn Found '+links.length+' links');

	for (var i = 0; i < links.length; i++) {
		var ptest = links[i].href.match(/profile.cgi\?id=(\d+)/);
		if (ptest) {
			var pid = parseInt(ptest[1]);

//			if (links[i].innerHTML.match(/a zombie|one of the zombies/i)) {
			if (links[i].text.match(/a zombie|one of the zombies|one of the bodies/i)) {

			debug_out+= 'Found zombie '+pid;

			var known = false;

			if (udw_Zombies_Known) {
				for (var z = 0; z<udw_Zombies_Known.length; z++) {
					if (udw_Zombies_Known[z]['profile']==pid) {

						debug_out+= " : known\n";

						known = true;
						// Do Append Name
						udw_AppendNameToLink(links[i],udw_Zombies_Known[z]['name']);
						i++;
					
						// update cache delay
						var dStamp = new Date();
						udw_Zombies_Known[z]['seen'] = dStamp.getTime();
						known_Touch = true;
						}
					}
				} // if udw_Zombies_Known

				if (!known) {
					if (!local_ToFetch) local_ToFetch = new Array();

					var tf = false;
					for (var zz = 0; zz<local_ToFetch.length; zz++) {
						if (local_ToFetch[zz]==pid) {
							tf = true;
							debug_out+= " : queued\n";
							}
						}

					if (!tf) {

//if (isDebugEnabled) alert('They will be looked up.');

						local_ToFetch[local_ToFetch.length]=pid;
						debug_out+= " : new\n";
						}

					}  // !known
				}  // match(/A zombie/i)
			} // ptest
		}  // i<links.length

	// Launch Async Requests
	if (local_ToFetch) {
		FetchReqs = new Array();
		
//if (isDebugEnabled) alert('zn '+local_ToFetch.length+' zombies to lookup.');

		for (var r = 0; r<local_ToFetch.length; r++) {
			FetchReqs[r] = new XMLHttpRequest();
			// Can I add my own properties to the request object
			// 		Seems odd ... wonder when and if it gets discarded ...

				// sport a reference to the document it should appear in
			FetchReqs[r].znDoc = d;

			FetchReqs[r].open('GET', 'http://urbandead.com/profile.cgi?id='+local_ToFetch[r], true);
			FetchReqs[r].onload=udw_ZN_onLoad;

			// Don't care about errors for now
			//tfReq.onerror=udw_ZN_onError;
			// Let it not show up ...

			FetchReqs[r].send(null);
			}
		}  // local_ToFetch
//	else {
//		if (known_Touch) {
//			// Serialize the known cache >>> or onunload <<<
//			}
//		}

//	if (isDebugEnabled && debug_out.length) alert(debug_out);
	} // udw_WorkZombieProfiles

/*
 *  Function:	udw_AppendNameToLink(doc,link,name)
 *	
 *	replace <a>A zombie</a> with <a>A zombie</a>&nbsp;(<a>name</a>)
 *
 */
 function udw_AppendNameToLink(ele,name)  {
	if ( !ele ) return 0;

	var NodeText = ' ( <a href="'+ele.href+'"';
	if (ele.className.length) NodeText+= ' class="'+ele.className+'"';
	else {
		var isspan = ele.getElementsByTagName('span');
		if (isspan && isspan.length) NodeText+= ' class="'+isspan[0].className+'"';
		}

	// if isColorNamesEnabled
	//		udw_ColorData is loaded
	//			before udw_WorkZombieProfiles

	//	udw_ColorData = loadAndParseList();
	if (isColorNamesEnabled ) {
		if (udw_ColorData) {
			var newname = name.replace(/&nbsp;/g, ' ');
			var gnum = udw_ColorData.userHT[newname];
			if (gnum!=undefined) {
				NodeText += ' style="color:'+udw_ColorData.colorList[gnum]+'; font-weight:bold;"';
				NodeText += ' title="'+udw_ColorData.nameCommentHT[newname]+'"';
				}
			}  //  if udw_ColorData
		}  //  if isColorNamesEnabled


	NodeText+= '>'+name+'</a> )';

	var tack = ele.ownerDocument.createElement('SPAN');

	tack.innerHTML = NodeText;
	ele.parentNode.insertBefore(tack, ele.nextSibling);

	}  //  udw_AppendNameToLink 

/*
 *  Function:	udw_ZN_onLoad(link,name,profile)
 *	
 *	handle async document
 *
 */
 function udw_ZN_onLoad(e)  {
	var szPage = e.target.responseText;

	var scraps = null;
	var name = null;
	var pid = null;

//if (isDebugEnabled) alert('zn udw_ZN_onLoad fired');

//	get name from responseText
	try { scraps = szPage.match(/<span class="ptt" style="font-family: 'Anonymous Pro', sans-serif;">([\w ]+)<\/span>/i); }
	catch (e) { if (isDebugEnabled) alert("udWidget Error while reading name: "+e); }
	if (scraps) name = udw_Trim(scraps[1]);
	else return;

//if (isDebugEnabled) alert('zn name: '+name);

//	get profile from responseText
	scraps = null;
	try { scraps = szPage.match(/href="contacts\.cgi\?add=(\d+)"/i); }
	catch (e) { if (isDebugEnabled) alert("udWidget Error while reading profile id: "+e); }
	if (scraps) pid = parseInt(scraps[1]);
	else return;

//if (isDebugEnabled) alert('zn pid: '+pid);

//	add name to zombies_known
	if (!udw_Zombies_Known) udw_Zombies_Known = new Array();
	var z = udw_Zombies_Known.length;
	udw_Zombies_Known[z] = new Array();
	udw_Zombies_Known[z]['name'] = name;
	udw_Zombies_Known[z]['profile'] = pid;

	var dStamp = new Date();
	udw_Zombies_Known[z]['seen'] = dStamp.getTime();

	// Serialize the known cache >>> or onunload <<<

	// Get the document reference from the Request object
	//	which was overloaded with the new property .znDoc
	var links = null;
	try { links = e.target.znDoc.getElementsByTagName('a'); }
	catch (e) { if (isDebugEnabled) alert("udWidget Zombie Names Error while looking for the zombie to update: "+e); }

	//	the doc reference e.target.znDoc
	//		could be gone by now ?
	if (!links) return;

//if (isDebugEnabled) alert('zn links to match: '+links.length);

	for (var i = 0; i < links.length; i++) {
		var lid = null;
		var ptest = links[i].href.match(/profile.cgi\?id=(\d+)/);
		if (ptest) lid = parseInt(ptest[1]);

		if (lid)
			if (links[i].text.match(/a zombie|one of the zombies|one of the bodies/i))  //  if (links[i].innerHTML.match(/A zombie/i))
				if (lid == pid) {
					udw_AppendNameToLink(links[i],name);
					i++;
				}
		}

	}  //  udw_ZN_onLoad

/*
 *  Function:	udw_ZN_onError(e)
 *	
 *	handle async error
 *
 */
 function udw_ZN_onError(e)  {
	}  //  udw_ZN_onError
