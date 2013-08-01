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
 * The Original Code is profileexpander.
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
 *  Global Data for profile expander:
 *		
 *
 */
var udwFolks = null;
var udw_PE_Reqs = null;
var udw_ExapanderURI = null;

/*
 *  Function:	udw_ExpandProfiles(document)
 *	
 *	tabulate folks at location and add profile info to game screen
 *
 */
 function udw_ExpandProfiles()  {
//	alert('udw_ExpandProfiles');
	var d = content.document;

	// get div "gt"
	var DivGT = null;

	try { DivGT = getElementsByClass('gt',d,'div')[1]; }
	catch (e) { if (isDebugEnabled) alert("udWidget Error while finding div: "+e); }

	if (!DivGT) return udw_NotValidMap();

	var URI_Test = d.location.href.match(/http\:\/\/.*?urbandead\.(com|info)\//);
	if (!URI_Test) return udw_NotValidMap();

	//var udw_ExapanderURI = '';
	udw_ExapanderURI = '';
	if (URI_Test[1]=='info') udw_ExapanderURI = 'http://urbandead.com/';

	// Test for udtoolbar table format
	if (udw_IsTbActive(DivGT.innerHTML)) return udw_ExpandProfilesTB(DivGT);

	// test for zoom
	if (!udw_IsZoomed(DivGT.innerHTML)) return udw_ExpandProfilesByTarget(d);

	// Test is map Page
	udw_AddProfStyles(d);

	// Looks "Standard" continue with expand.

//	alert('Looks standard');

	// make array of folks present
	udwFolks= new Array();
	var f = 0;
	var i = 0;
	var burn_start = 0;
	var burn_end = 0;
	var p = null;
	while(DivGT.childNodes[i]) {
		kid = DivGT.childNodes[i];

		//alert('['+i+'] '+kid.tagName);

		if (kid.tagName == "BR") {

			// alert('['+i+'] Ending: '+kid.tagName);
			
			burn_end = i-1;
			break;
			}

		if (kid.tagName == "A") {
			// alert('['+i+'] anchor "'+kid.innerHTML+'" class:'+ kid.className);
			p = null;
			try { p = kid.href.match(/profile\.cgi\?id=(\d+)$/); }
			catch (e) { if (isDebugEnabled) alert("udWidget Error while testing profile id: "+e); }
			if (p) {
				udwFolks[f] = new Array();
				udwFolks[f]['profile'] = p[1];
				udwFolks[f]['name'] = kid.innerHTML;
				udwFolks[f]['name'].replace(/&nbsp;/gi,' ');
				udwFolks[f]['class'] = kid.className;
				udwFolks[f]['href'] = 'profile.cgi?id='+p[1];
				udwFolks[f]['health'] = 0;
				udwFolks[f]['infected'] = 0;
				udwFolks[f]['title'] = kid.title;
				udwFolks[f]['style'] = '';
				udwFolks[f]['single'] = 0;

				if (kid.style['color']) udwFolks[f]['style'] += 'color: '+ kid.style['color']+'; font-weight: bold;';
							   
				if (!f) burn_start = i-1;
				f++;
				}
			}

		//	Zombies who can scent infection see the hp within a span ...
			//	<span class="inf"> (28<sub>HP</sub>)</span>
				//	Could also be udTools HP Colorizer
					//	(<span style="color: rgb(102, 255, 0); font-weight: bold;">48<sub>HP</sub></span>)
		if (kid.tagName == "SPAN") {
			// could be infection status
			// alert('['+i+'] infected? spanning: '+kid.innerHTML);

			if (kid.className=='inf') udwFolks[f-1]['infected']=1;

			// look for hp inside 
			var hpTest = null;
			try { hpTest = kid.innerHTML.match(/(\d+)<sub>HP<\/sub>/); }
			catch (e) { } // alert("udWidget Error while testing health: "+e); }
			if (hpTest) udwFolks[f-1]['health']=parseInt(hpTest[1]);

			}

/*

 zUDTool Output
// HP Colorizer
//Also here is  <a context="udtool-ungrouped" href="profile.cgi?id=478708">Tom&nbsp;A&nbsp;Hawk</a>(<span style="color: rgb(9, 255, 0); font-weight: bold;">59<sub>HP</sub></span>)<br>

// Hand and Teeth Attack links
//Also here is  <a context="udtool-ungrouped" href="profile.cgi?id=478708">Tom&nbsp;A&nbsp;Hawk</a><input class="abH" value="H" onclick="setHands(478708)" type="submit"><input class="abT" value="T" onclick="setTeeth(478708)" type="submit">(<span style="color: rgb(255, 145, 0); font-weight: bold;">17<sub>HP</sub></span>)<br><br>Somebody has spraypainted <i>Revive Point: Request at http://tinyurl.com/zmmas</i> onto a wall.<br><br>There is a mob of eighteen other zombies here.<br><br>There is a dead body here.<br>

*/

		if (!kid.tagName) {
			// alert('['+i+'] no tag: '+kid.nodeValue);
			var hpTest = null;
			try { hpTest = kid.nodeValue.match(/^ [(](\d+)$/); }
			catch (e) { }  // alert("udWidget Error while testing health: "+e); }
			if (hpTest) udwFolks[f-1]['health']=parseInt(hpTest[1]);
			}

		i++;
		}  // while DivGT childNodes

	//if (isDebugEnabled) alert('Found '+f+' people.');

//	if (!f) return;

	if (f) {
		// remove childnodes between burn_end and burn_start
		for (i=burn_end;i>burn_start;i--) {
			DivGT.removeChild(DivGT.childNodes[i]);
			}
		burn_start++;
		burn_start++;

		// construct a table three cells wide for names and profile info
		var FolksTable = d.createElement("table");
		var curRow = 0;
		var curCell = 0;
		var FolksRow = FolksTable.insertRow(curRow);
		var FolksCell = null;
		var CellData = null;
		var hpClass = '';
		for (i=0;i<f;i++) {
			// insert a cell for name
			FolksCell = FolksRow.insertCell(curCell);

			// construct data for cell
			// <span>Health</span>&nbsp;<a href="REF" class="CLASS">NAME</a><br>
			// <span id="detail_PROFILE" class="udwProfDetail">Waiting for Data...</span>

			CellData = '';
			if (udwFolks[i]['health']) {
				hpClass = 'HP';
				if ( (udwFolks[i]['health']<50) || (udwFolks[i]['health']%10) ) hpClass = 'Wounded';
				if (udwFolks[i]['infected']) hpClass = 'Infected';

				// alert('class: '+hpClass+' infected: '+udwFolks[i]['infected'] +' health: '+udwFolks[i]['health'] );

				CellData+= '<span id="hp_'+udwFolks[i]['profile']+'" class="udw'+hpClass+'">'+udwFolks[i]['health']+'</span>&nbsp;';
				}

			CellData+= '<a href="'+udw_ExapanderURI + udwFolks[i]['href']+'"';
			if (udwFolks[i]['class'].length) CellData+= ' class="'+udwFolks[i]['class']+'"';
			if (udwFolks[i]['style'].length) CellData+= ' style="'+udwFolks[i]['style']+'"';
			if (udwFolks[i]['title'].length) CellData+= ' title="'+udwFolks[i]['title']+'"';
			CellData+= '>'+udwFolks[i]['name'].replace(/ /g,'&nbsp;')+'</a>';

			CellData+= '<br>';
			CellData+= '<span id="detail_'+udwFolks[i]['profile']+'" class="udwProfDetail">Waiting for data...</span>';

			FolksCell.innerHTML = CellData;

			curCell++;
			if (curCell==4) { // was 3
				curRow++;
				curCell=0;
				FolksRow = FolksTable.insertRow(curRow);
				}
			// insert a cell for name
			}
	
		DivGT.insertBefore(FolksTable, DivGT.childNodes[burn_start]);

		if (isContactTackEnabled) udw_PutAddRemoveOnProfileLinks(FolksTable);

	// if f
		} // if f
	// if f

	udw_ExpandRecognise(DivGT,false);
	udw_ExpandRecognise(DivGT,true);
	udw_ExpandSYLT(DivGT);

	if (udwFolks.length) udw_AsyncFolks(DivGT.ownerDocument);

//	alert('Expand Profiles End');
	return 0;
	} // udw_ExpandProfiles


/*
 *  Function:	udw_ExpandRecognise(dom_div)
 *	
 *	Handle zombies you recognise
 *
 */
 function udw_ExpandRecognise(DivGT,bodies)  {

	// Flip through parts of gt looking for zombie line

	// End with div

	//	<br>There is a horde of twenty-six zombies here. You recognise

	if (!udwFolks) udwFolks= new Array();
	var f = udwFolks.length;
	var rz = 0;
	var i = 0;
	zed_target = 0;
	var start_kid = 0;
	var end_kid = 0;
	var p = null;
	while(DivGT.childNodes[i]) {
		kid = DivGT.childNodes[i];

		if (!kid.tagName) {
			if (!start_kid) {
				var zedTest = null;

				if (zed_target && (!bodies)) {
					try { zedTest = kid.nodeValue.match(/ here\. (It\'s|You recognise)/i); }
					catch (e) {  if (isDebugEnabled) alert("udWidget Error while testing for zombie line: "+e); }					
					}
				else {
					if (!bodies) { // <span id="zombies" class="target">zombies</span>
						try { zedTest = kid.nodeValue.match(/(zombie|zombies) here\. (It\'s|You recognise)/i); }
						catch (e) {  if (isDebugEnabled) alert("udWidget Error while testing for zombie line: "+e); }
						}
					else {
						try { zedTest = kid.nodeValue.match(/(body|bodies) here\.( .*?strange\.)? (It\'s|You recognise)/i); }
						catch (e) {  if (isDebugEnabled) alert("udWidget Error while testing for body line: "+e); }
						}
					}

				if (zedTest) start_kid = i;
				}
			else {
				if (!end_kid) {

					var endTest = null;
					try { endTest = kid.nodeValue.match(/\./i); }
					catch (e) {  if (isDebugEnabled) alert("udWidget Error while testing for zombie line: "+e); }
					if (endTest) end_kid = i;

					}
				}

//			alert('no tag: '+kid.nodeValue+' :'+start_kid+','+end_kid);
			}

		if (kid.tagName == "BR" && (start_kid)) {
			if (!end_kid) end_kid = i;
			}

		if ((kid.tagName == "SPAN") && (kid.className == "target")) {
			var zedTest = null;
			try { zedTest = kid.innerHTML.match(/zombie/i); }
			catch (e) {  if (isDebugEnabled) alert("udWidget Error while testing span for zombies: "+e); }
			if (zedTest) zed_target = 1;
//			alert('SPAN: '+kid.innerHTML+' :'+zed_target);
			}

		if (kid.tagName == "A" && (start_kid)) {
//			alert('A: '+kid.innerHTML);
			if (end_kid && (i > end_kid)) break;

			// alert('['+i+'] anchor "'+kid.innerHTML+'" class:'+ kid.className);
			p = null;
			try { p = kid.href.match(/profile\.cgi\?id=(\d+)$/); }
			catch (e) { if (isDebugEnabled) alert("udWidget Error while testing profile id: "+e); }
			if (p) {
				udwFolks[f] = new Array();
				udwFolks[f]['profile'] = p[1];
				udwFolks[f]['href'] = 'profile.cgi?id='+p[1];
				udwFolks[f]['name'] = kid.innerHTML.replace(/&nbsp;/gi,' ');
				udwFolks[f]['class'] = kid.className;
				udwFolks[f]['title'] = kid.title;
				udwFolks[f]['health'] = 0;
				udwFolks[f]['single'] = 0;
				udwFolks[f]['infected'] = 0;
				udwFolks[f]['style'] = '';

				if (kid.style['color']) udwFolks[f]['style'] += 'color: '+ kid.style['color']+'; font-weight: bold;';

				f++;
				rz++
				}
			}

		i++;
		}

	// recognized zombies
	if (start_kid) {
		// remove links
		//if (isDebugEnabled) alert(rz+' recognized zombies.')

		for (i=end_kid;i>start_kid;i--) DivGT.removeChild(DivGT.childNodes[i]);

		// build links in table

		// construct a table three cells wide for names and profile info
		var FolksTable = DivGT.ownerDocument.createElement("table");
		var curRow = 0;
		var curCell = 0;
		var FolksRow = FolksTable.insertRow(curRow);
		var FolksCell = null;
		var CellData = null;
		var hpClass = '';
		for (i=(f-rz);i<f;i++) {
			// insert a cell for name
			FolksCell = FolksRow.insertCell(curCell);

			CellData = '';

			CellData+= '<a href="'+udw_ExapanderURI + udwFolks[i]['href']+'"';
			if (udwFolks[i]['class'].length) CellData+= ' class="'+udwFolks[i]['class']+'"';
			if (udwFolks[i]['style'].length) CellData+= ' style="'+udwFolks[i]['style']+'"';
			if (udwFolks[i]['title'].length) CellData+= ' title="'+udwFolks[i]['title']+'"';
			CellData+= '>'+udwFolks[i]['name'].replace(/ /g,'&nbsp;')+'</a>';

			CellData+= '<br>';
			CellData+= '<span id="detail_'+udwFolks[i]['profile']+'" class="udwProfDetail">Waiting for data...</span>';

			FolksCell.innerHTML = CellData;

			curCell++;
			if (curCell==4) { // was 3
				curRow++;
				curCell=0;
				FolksRow = FolksTable.insertRow(curRow);
				}
			// insert a cell for name
			}
	
		DivGT.insertBefore(FolksTable, DivGT.childNodes[start_kid].nextSibling);

		if (isContactTackEnabled) udw_PutAddRemoveOnProfileLinks(FolksTable);

		}

	return;
	} // udw_ExpandRecognise

/*
 *  Function:	udw_ExpandSYLT(dom_div)
 *	
 *	Handle actors from "Since Your Last Turn"
 *
 */
 function udw_ExpandSYLT(DivGT)  {

	var tdgp = null;
	try { tdgp = getElementsByClass('gp',DivGT.ownerDocument,'td')[0]; }
	catch (e) { if (isDebugEnabled) alert("udWidget Error while testing for td gp: "+e); }
	if (!tdgp) return;

	//<b>Since your last turn:</b>
	var sylt = tdgp.innerHTML.match(/<b>Since your last turn/i);
	if (!sylt) return;

	var listItems = null;
	listItems = tdgp.getElementsByTagName('li');
	if (listItems.length>0) {
		for (var idx = 0; idx<listItems.length; idx++) {
			var li = listItems[idx];
			var p = null;
			try { p = li.innerHTML.match(/profile\.cgi\?id=(\d+)/i); }
			catch (e) { if (isDebugEnabled) alert("udWidget Error while testing SYLT for profile id: "+e); }
			if (p) {

				// if p NOT in udwFolks[]
				var tt = 0;
				var ti = 0;
				var f = udwFolks.length;
				for (ti=0;ti<f;ti++) if (udwFolks[ti]['profile']==p[1]) tt=1;

				if (!tt) {
					// add folks
					udwFolks[f] = new Array();
					udwFolks[f]['profile']=p[1];
					udwFolks[f]['href']='profile.cgi?id='+p[1];
					udwFolks[f]['infected']=0;
					udwFolks[f]['health']=0;
					udwFolks[f]['name']='';
					udwFolks[f]['class']='';
					udwFolks[f]['single'] = 1;

					// new br
					var wrap = DivGT.ownerDocument.createElement('BR');
					li.insertBefore(wrap, li.lastChild.nextSibling);

					// new span
					var dnode = DivGT.ownerDocument.createElement("span");
					dnode.className = 'udwProfDetail'; // placeholder ... replaced by callback
					dnode.id = 'detail_'+udwFolks[f]['profile'];

					li.insertBefore(dnode, li.lastChild.nextSibling);
					}
				}

			} // for listItems.length
		} // if listItems

	return;
	} // udw_ExpandSYLT

/*
 *  Function:	udw_ExpandProfilesTB(dom_div)
 *	
 *	work the profiles into udtoolbars table format
 *
 */
 function udw_ExpandProfilesTB(DivGT)  {
	udwFolks= new Array();
	var f = 0;

	// get first table in DivGT
	var tbTable = DivGT.getElementsByTagName('table');

	for (var t=0;t<tbTable.length;t++) {
		var i = 0;
		// get cells from tbTable
		var tbCell = tbTable[t].getElementsByTagName('td');
	
		// for each cell in tbTable ...
		for (i=0;i<tbCell.length;i++) {
			var cell = tbCell[i];

			var c = 0;
			var p = null;
			var hpStash = 0;
			var infStash = 0;
			var classStash = null;
			var spanStash = null;
			while (cell.childNodes[c]) {
				var kid = cell.childNodes[c];

				if (kid.tagName== "A") {
					p = kid.href.match(/profile\.cgi\?id=(\d+)$/);
					if (p) {
						udwFolks[f] = new Array();
						udwFolks[f]['profile'] = parseInt(p[1]);
						udwFolks[f]['single'] = 0;

						// get the name
						udwFolks[f]['name'] = kid.innerHTML;

						// get the class
						udwFolks[f]['class'] = kid.className;

						// get the link
						udwFolks[f]['href'] = 'profile.cgi?id='+p[1];
						udwFolks[f]['infected'] = infStash;
						udwFolks[f]['health'] = hpStash;
						udwFolks[f]['tbclass'] = classStash;
						if (hpStash) spanStash.id = 'hp_'+p[1];

						f++; // good player
						}

					}  //  tagName == "A"

				if (kid.tagName== "SPAN") {
					// Look for HP

					var hpTest = kid.innerHTML.match(/(\d+)/);
					if (hpTest) {
						//alert(hpTest[1]);
						hpStash=parseInt(hpTest[1]);

						// save reference so we can add the id after we get the profile
						spanStash = kid;

						var infTest = kid.className.match(/inf/);
						if (infTest) infStash=1;
					
						var classTest = kid.className.match(/hp(\d+)/);
						if (classTest) classStash=classTest[1];
						
						}

					}  //  tagName == "SPAN"

				c++;
				}  //  while cell.childNodes

			if (p) {
				// insert break after href node
				cell.insertBefore(DivGT.ownerDocument.createElement("BR"), cell.lastChild.nextSibling);

				// insert detail node
				var dnode = DivGT.ownerDocument.createElement("span");
				dnode.className = 'udwProfDetail'; // placeholder ... replaced by callback
				dnode.id = 'detail_'+p[1];

				cell.insertBefore(dnode, cell.lastChild.nextSibling);
			
				}

			} // for i<tbCell

	// for t<tbTable
		} // for t<tbTable
	// for t<tbTable

	//alert('Found '+f+' people.');

	udw_ExpandRecognise(DivGT,false);
	udw_ExpandRecognise(DivGT,true);
	udw_ExpandSYLT(DivGT);
	if (udwFolks.length) udw_AsyncFolks(DivGT.ownerDocument);

	return 0;
	} // udw_ExpandProfilesTB

/*
 *  Function:	udw_AsyncFolks(document)
 *	
 *	Start Async Requests
 *
 */
 function udw_AsyncFolks(d)  {
	if (!udwFolks) return 0;

	udw_PE_Reqs = new Array();

	for (var i=0;i<udwFolks.length;i++) {
		udw_PE_Reqs[i] = new XMLHttpRequest();
		udw_PE_Reqs[i].peDoc = d;

		udw_PE_Reqs[i].single = udwFolks[i]['single'];

		udw_PE_Reqs[i].open('GET', 'http://urbandead.com/'+udwFolks[i]['href'], true);
		//udw_PE_Reqs[i].overrideMimeType('text/xml');
		udw_PE_Reqs[i].onload=udw_FolksLoad;
		//udwFolks[i]['request'].onerror=udw_FolksError;
		udw_PE_Reqs[i].send(null);
		}

	}  // udw_AsyncFolks

/*
 *  Function:	udw_FolksLoad()
 *	
 *	handle async onLoad
 *
 */
 function udw_FolksLoad(e)  {
//	if (!udwFolks) return 0;

	if (e.target.readyState != 4 || e.target.status != 200) {
		if (isDebugEnabled) alert(e.target.status);
		return 0;
		}

	//var xmlPage = e.target.responseXML;
	var szPage = e.target.responseText;

	//alert(xmlPage.xml);

	var prof = new Array();

	//<title>Urban Dead - Profile - Max Grivas (Level 41 Military)</title>
	var scraps = null;
	try { scraps = szPage.match(/<title>Urban Dead - Profile - (.*?) [(]Level (\d+) (.*?)[)]<\/title>/i); }
	catch (e) { }  // alert("udWidget Error while getting level: "+e); }
	if (scraps) {
		prof['name'] = udw_Trim(scraps[1]);
		prof['level'] = parseInt(scraps[2]);
		prof['class'] = udw_Trim(scraps[3]);
		}

    //<td class="slim">XP:</td><td class="slam">7639</td>
	scraps = null;
	try { scraps = szPage.match(/<td class="slim">XP:<\/td><td class="slam">(\d+)<\/td>/i); }
	catch (e) { }  //alert("udWidget Error while getting level: "+e); }
	if (scraps) {
		prof['xp'] = parseInt(scraps[1]);
		}

    //<td class="slim">Group:</td><td class="slam"> Josephine's Generals</td>
	scraps = null;
	try { scraps = szPage.match(/<td class="slim">Group:<\/td><td class="slam">(.*?)<\/td>/i); }
	catch (e) { }  //alert("udWidget Error while getting level: "+e); }
	if (scraps) {
		prof['group'] = udw_Trim(scraps[1]);
		}

    //href="contacts.cgi?add=906550"
	scraps = null;
	try { scraps = szPage.match(/href="contacts\.cgi\?add=(\d+)"/i); }
	catch (e) { }  // alert("udWidget Error while getting level: "+e); }
	if (scraps) {
		prof['id'] = parseInt(scraps[1]);
		}

    //<td class="slim" rowspan=10>Skills:</td><td rowspan=10 class="slam">
    //<hr>
    //</td></tr>
	scraps = null;
	var liner = szPage.replace(/[\s+]/gi,' ');
	var Skills ='';
	try { scraps = liner.match(/<td rowspan=10 class="slam">(.*?)<\/td>/i); }
	catch (e) { }  // alert("udWidget Error while getting level: "+e); }
	if (scraps) {
		Skills = scraps[1];
		//alert(Skills);
		}

// Basic Output
	var szOut = 'L:'+ prof['level'] +' XP:'+ prof['xp'] +' <b>'+ prof['group']+'</b>';
// Basic Output

// Survivor Skills
	skill = new Array();
	skill['Pistol'] = 0;	// 1-3
	skill['Shotgun'] = 0;	// 1-2
	skill['Hand'] = 0;
	skill['Knife'] = 0;
	skill['Axe'] = 0;
	skill['Running'] = 0;
	skill['Necro'] = 0;	// 1-3
	skill['Aid'] = 0;		// 1-2
	skill['Diagnosis'] = 0;
	skill['Shopping'] = 0;	// 1-2
	skill['Body'] = 0;
	skill['Tagging'] = 0;
	skill['Construction'] = 0;
	skill['Radio'] = 0;
	skill['Headshot'] = 0;

	// Always look for Body Building
	if (Skills.match(/<b>Body Building<\/b>/i) != null) skill['Body'] = 1;

	// If not turned on Skip Matching;
	if ( SkillPistolEnabled ) {
		if (Skills.match(/<b>Basic Firearms Training<\/b>/i) != null) {
			skill['Pistol'] = 1;
			if (Skills.match(/<b>Pistol Training<\/b>/i) != null) {
				skill['Pistol'] = 2;
				if (Skills.match(/<b>Advanced Pistol Training<\/b>/i) != null) skill['Pistol'] = 3;
				}
			}
		}  //  SkillPistolEnabled

	if ( SkillShotgunEnabled ) {
		if (Skills.match(/<b>Shotgun Training<\/b>/i) != null) {
			skill['Shotgun'] = 1;
			if (Skills.match(/<b>Advanced Shotgun Training<\/b>/i) != null) skill['Shotgun'] = 2;
			}	
		}  //  SkillShotgunEnabled

	if ( SkillHandEnabled ) if (Skills.match(/<b>Hand-to-Hand Combat<\/b>/i) != null) skill['Hand'] = 1;
	if ( SkillKnifeEnabled ) if (Skills.match(/<b>Knife Combat<\/b>/i) != null) skill['Knife'] = 1;
	if ( SkillAxeEnabled ) if (Skills.match(/<b>Axe Proficiency<\/b>/i) != null) skill['Axe'] = 1;

	if ( SkillRunningEnabled ) if (Skills.match(/<b>Free Running<\/b>/i) != null) skill['Running'] = 1;

	if ( SkillNecroEnabled ) {
		if (Skills.match(/<b>NecroTech Employment<\/b>/i) != null) {
			skill['Necro'] = 1;
			if (Skills.match(/<b>Lab Experience<\/b>/i) != null) {
				skill['Necro'] = 2;
				if (Skills.match(/<b>NecroNet Access<\/b>/i) != null) skill['Necro'] = 3;
				}
			}
		}  //  SkillNecroEnabled

	if ( SkillAidEnabled ) {
		if (Skills.match(/<b>First Aid<\/b>/i) != null) {
			skill['Aid'] = 1;
			if (Skills.match(/<b>Surgery<\/b>/i) != null) skill['Aid'] = 2;
			}
		}  //  SkillAidEnabled

	if ( SkillDiagnosisEnabled ) if (Skills.match(/<b>Diagnosis<\/b>/i) != null) skill['Diagnosis'] = 1;

	if ( SkillShoppingEnabled ) {
		if (Skills.match(/<b>Shopping<\/b>/i) != null) {
			skill['Shopping'] = 1;
			if (Skills.match(/<b>Bargain Hunting<\/b>/i) != null) skill['Shopping'] = 2;
			}
		}  //  SkillShoppingEnabled

	if ( SkillTaggingEnabled ) if (Skills.match(/<b>Tagging<\/b>/i) != null) skill['Tagging'] = 1;
	if ( SkillConstructionEnabled ) if (Skills.match(/<b>Construction<\/b>/i) != null) skill['Construction'] = 1;
	if ( SkillRadioEnabled ) if (Skills.match(/<b>Radio Operation<\/b>/i) != null) skill['Radio'] = 1;
	if ( SkillHeadshotEnabled ) if (Skills.match(/<b>Headshot<\/b>/i) != null) skill['Headshot'] = 1;

// Zombie Skills

	skill['Fear'] = 0;
	skill['Blood'] = 0;
	skill['Trail'] = 0;
	skill['Death'] = 0;
	skill['Digestion'] = 0;
	skill['Bite'] = 0;
	skill['Mortis'] = 0;
	skill['Lurch'] = 0;
	skill['Grip'] = 0;
	skill['Rend'] = 0;
	skill['Grasp'] = 0;
	skill['Drag'] = 0;
	skill['Memories'] = 0;
	skill['Rattle'] = 0;
	skill['Groan'] = 0;
	skill['Ransack'] = 0;
	skill['Gesture'] = 0;
	skill['Gait'] = 0;
	skill['Grab'] = 0;
	skill['Rot'] = 0;

	if ( SkillFearEnabled ) if (Skills.match(/<b>Scent Fear<\/b>/i) != null) skill['Fear'] = 1;
		if ( SkillBloodEnabled ) if (Skills.match(/<b>Scent Blood<\/b>/i) != null) skill['Blood'] = 1;
		if ( SkillTrailEnabled ) if (Skills.match(/<b>Scent Trail<\/b>/i) != null) skill['Trail'] = 1;
		if ( SkillDeathEnabled ) if (Skills.match(/<b>Scent Death<\/b>/i) != null) skill['Death'] = 1;

	if ( SkillDigestionEnabled ) if (Skills.match(/<b>Digestion<\/b>/i) != null) skill['Digestion'] = 1;
		if ( SkillBiteEnabled ) if (Skills.match(/<b>Infectious Bite<\/b>/i) != null) skill['Bite'] = 1;



	if ( SkillMortisEnabled || SkillLurchEnabled || SkillGripEnabled || SkillRendEnabled || SkillGraspEnabled || SkillDragEnabled ) {

		if (Skills.match(/<b>Vigour Mortis<\/b>/i) != null) {
			skill['Mortis'] = 1;
			if ( SkillLurchEnabled ) if (Skills.match(/<b>Neck Lurch<\/b>/i) != null) skill['Lurch'] = 1;
			if ( SkillGripEnabled ) if (Skills.match(/<b>Death Grip<\/b>/i) != null) skill['Grip'] = 1;
			if ( SkillRendEnabled ) if (Skills.match(/<b>Rend Flesh<\/b>/i) != null) skill['Rend'] = 1;
			if ( SkillGraspEnabled ) if (Skills.match(/<b>Tangling Grasp<\/b>/i) != null) skill['Grasp'] = 1;
			if ( SkillDragEnabled ) if (Skills.match(/<b>Feeding Drag<\/b>/i) != null) skill['Drag'] = 1;
			}

		}  // Mortice Branch


	if ( SkillMemoriesEnabled || SkillRattleEnabled || SkillGroanEnabled || SkillRansackEnabled || SkillGestureEnabled ) {

		if (Skills.match(/<b>Memories of Life<\/b>/i) != null) {
			skill['Memories'] = 1;
			if ( SkillRattleEnabled ) if (Skills.match(/<b>Death Rattle<\/b>/i) != null) skill['Rattle'] = 1;
			if ( SkillGroanEnabled ) if (Skills.match(/<b>Feeding Groan<\/b>/i) != null) skill['Groan'] = 1;
			if ( SkillRansackEnabled ) if (Skills.match(/<b>Ransack<\/b>/i) != null) skill['Ransack'] = 1;
			if ( SkillGestureEnabled ) if (Skills.match(/<b>Flailing Gesture<\/b>/i) != null) skill['Gesture'] = 1;
			}

		}  // Memories Branch

	if ( SkillGaitEnabled ) if (Skills.match(/<b>Lurching Gait<\/b>/i) != null) skill['Gait'] = 1;
		if ( SkillGrabEnabled ) if (Skills.match(/<b>Ankle Grab<\/b>/i) != null) skill['Grab'] = 1;

	if ( SkillRotEnabled ) if (Skills.match(/<b>Brain Rot<\/b>/i) != null) skill['Rot'] = 1;

// Survivor Skill Outputs
// Survivor Skill Outputs
// Survivor Skill Outputs
	if (skill['Pistol'] || 	skill['Shotgun'] || skill['Hand'] || skill['Knife'] || skill['Axe'] || skill['Running'] || skill['Necro'] || skill['Aid'] || skill['Diagnosis'] || skill['Shopping'] || skill['Body'] || skill['Tagging'] || skill['Construction'] || skill['Radio'] || skill['Headshot'] ) {
		// Draw survivor skills
		var szSurvivor = '';

		if (SkillPistolEnabled && skill['Pistol'] ) {
			szSurvivor+= ',Pistol';
			if (skill['Pistol']>1) szSurvivor+= '+';
			if (skill['Pistol']>2) szSurvivor+= '+';
			}

		if (SkillShotgunEnabled && skill['Shotgun'] ) {
			szSurvivor+= ',Shotgun';
			if (skill['Shotgun']>1) szSurvivor+= '+';
			}
		if (SkillHandEnabled && skill['Hand'] ) szSurvivor+= ',Hand';
		if (SkillKnifeEnabled && skill['Knife'] ) szSurvivor+= ',Knife';
		if (SkillAxeEnabled && skill['Axe'] ) szSurvivor+= ',Axe';
		if (SkillRunningEnabled && skill['Running'] ) szSurvivor+= ',Running';
		if (SkillNecroEnabled && skill['Necro'] ) {
			szSurvivor+= ',Necro';
			if (skill['Necro']>1) szSurvivor+= '+';
			if (skill['Necro']>2) szSurvivor+= '+';
			}
		if (SkillAidEnabled && skill['Aid'] ) {
			szSurvivor+= ',Aid';
			if (skill['Aid']>1) szSurvivor+= '+';
			}
		if (SkillDiagnosisEnabled && skill['Diagnosis'] ) szSurvivor+= ',Diagnosis';
		if (SkillShoppingEnabled && skill['Shopping'] ) {
			szSurvivor+= ',Shopping';
			if (skill['Shopping']>1) szSurvivor+= '+';
			}
		if (SkillBodyEnabled && skill['Body'] ) szSurvivor+= ',Body';
		if (SkillTaggingEnabled && skill['Tagging'] ) szSurvivor+= ',Tagging';
		if (SkillConstructionEnabled && skill['Construction'] ) szSurvivor+= ',Construction';
		if (SkillRadioEnabled && skill['Radio'] ) szSurvivor+= ',Radio';
		if (SkillHeadshotEnabled && skill['Headshot'] ) szSurvivor+= ',Headshot';

		//if (szSurvivor.length) szOut+= '<br>'+szSurvivor.replace(/^,/,''); // wipe off first comma
		if (szSurvivor.length) {
			if (e.target.single) szOut+= ' / ';
			else szOut+= '<br>';
			szOut+= szSurvivor.replace(/^,/,''); // wipe off first comma
			}
		} // Survivor Skill Outputs


// Zombie Skill Outputs
// Zombie Skill Outputs
// Zombie Skill Outputs
	if ( skill['Fear'] || skill['Blood'] || skill['Trail'] || skill['Death'] || skill['Digestion'] || skill['Bite'] || skill['Mortis'] || skill['Lurch'] || skill['Grip'] || skill['Rend'] || skill['Grasp'] || skill['Drag'] || skill['Memories'] || skill['Rattle'] || skill['Groan'] || skill['Ransack'] || skill['Gesture'] || skill['Gait'] || skill['Grab'] || skill['Rot'] ) {
		// Draw survivor skills
		var szZombie = '';

		if ( SkillFearEnabled		&& skill['Fear'] )		szZombie+= ',Fear';
		if ( SkillBloodEnabled		&& skill['Blood'] )		szZombie+= ',Blood';
		if ( SkillTrailEnabled		&& skill['Trail'] )		szZombie+= ',Trail';
		if ( SkillDeathEnabled		&& skill['Death'] )		szZombie+= ',Death';
		if ( SkillDigestionEnabled	&& skill['Digestion'] )	szZombie+= ',Digestion';
		if ( SkillBiteEnabled		&& skill['Bite'] )		szZombie+= ',Bite';
		if ( SkillMortisEnabled		&& skill['Mortis'] )	szZombie+= ',Mortis';
		if ( SkillLurchEnabled		&& skill['Lurch'] )		szZombie+= ',Lurch';
		if ( SkillGripEnabled		&& skill['Grip'] )		szZombie+= ',Grip';
		if ( SkillRendEnabled		&& skill['Rend'] )		szZombie+= ',Rend';
		if ( SkillGraspEnabled		&& skill['Grasp'] )		szZombie+= ',Grasp';
		if ( SkillDragEnabled		&& skill['Drag'] )		szZombie+= ',Drag';
		if ( SkillMemoriesEnabled	&& skill['Memories'] )	szZombie+= ',Memories';
		if ( SkillRattleEnabled		&& skill['Rattle'] )	szZombie+= ',Rattle';
		if ( SkillGroanEnabled		&& skill['Groan'] )		szZombie+= ',Groan';
		if ( SkillRansackEnabled	&& skill['Ransack'] )	szZombie+= ',Ransack';
		if ( SkillGestureEnabled	&& skill['Gesture'] )	szZombie+= ',Gesture';
		if ( SkillGaitEnabled		&& skill['Gait'] )		szZombie+= ',Gait';
		if ( SkillGrabEnabled		&& skill['Grab'] )		szZombie+= ',Grab';
		if ( SkillRotEnabled		&& skill['Rot'] )		szZombie+= ',Rot';

		//if (szZombie.length) szOut+= '<br>'+szZombie.replace(/^,/,'');

		if (szZombie.length) {
			if (e.target.single) szOut+= ' / ';
			else szOut+= '<br>';
			szOut+= szZombie.replace(/^,/,''); // wipe off first comma
			}

		} // Zombie Skill Outputs

	// get the output span 
	// get the output span 		// Last Chance to bail before modding the document.
	// get the output span 

//	alert(e.target.peProf);
//	alert(e.target.peDoc);

	var outspan = null;
	try { outspan = e.target.peDoc.getElementById('detail_'+prof['id']); }
	catch (e) { } // alert("udWidget Profile Expander Error while looking for the person to update: "+e); }
	if (!outspan) return;

	outspan.innerHTML = szOut.replace(/ /g,'&nbsp;');
	switch(prof['class']) {
		case 'Military':
			outspan.className = 'f1';
			break;
		case 'Scientist':
			outspan.className = 'f2';
			break;
		case 'Civilian':
			outspan.className = 'f3';
			break;
		default:
			outspan.className = 'f';
			break;
		}

	// Check for wounded Body Builder...
	if (skill['Body']) {
		var hpspan = e.target.peDoc.getElementById('hp_'+prof['id']);

		if (hpspan) {
			if ( parseInt(hpspan.innerHTML)<60 ) {
				if (hpspan.className=='udwHP') hpspan.className='udwWounded';
				if (hpspan.className=='hpFull') hpspan.className='hp4'; // ? hp4 ?
				}
			}
		}
	
	return 0;
	}  // udw_FolksLoad


/*
 *  Function:	udw_Trim(string)
 *	
 *	cast off whitespace from start and end of string
 *
 */
 function udw_Trim(str)  {
	return str.replace(/^\s+|\s+$/g, '');
	}  // udw_Trim

/*
 *  Function:	udw_FolksError(event)
 *	
 *	handle async onError
 *
 */
 function udw_FolksError(e)  {
//	if (!udwFolks) return 0;

	if (isDebugEnabled) alert(e.target.status);

	return 0;
	}  // udw_FolksError

/*
 *  Function:	udw_IsTbActive(document)
 *	
 *	test for udtoolbar table format
 *
 */
 function udw_IsTbActive(szXML)  {
	var istabled = null;
	try { istabled = szXML.match(/<table/); }
	catch (e) { }  // alert("udWidget Error while testing istabled: "+e); }

	if ( istabled ) return 1;
	return 0;
	} // udw_IsTbActive

/*
 *  Function:	udw_IsZoomed(html_segment)
 *	
 *	test for [list all names]
 *
 */
 function udw_IsZoomed(szXML)  {
	var zoom = null;
	try { zoom = szXML.match(/map\.cgi\?zoom/)[0]; }
	catch (e) { } // alert("udWidget Error while testing zoom: "+e); }
	if (!zoom) return 1;
	return 0;
	} // udw_IsZoomed

/*
 *  Function:	udw_ExpandProfilesByTarget(document)
 *	
 *	work the profiles in the attack dropdown into a table.
 *
 */
 function udw_ExpandProfilesByTarget(d)  {
	alert("No persons to display. Click [list names] and try again.");
	return 0;
	} // udw_ExpandProfilesByTarget

/*
 *  Function:	udw_NotValidMap()
 *	
 *	announce no good page
 *
 */
 function udw_NotValidMap()  {
	alert("This does not appear to be an Urban Dead game page.");
	return 0;
	} // udw_NotValidMap


/*
 *  Function:	udw_AddProfStyles(document)
 *	
 *	building and map styles
 *
 */
 function udw_AddProfStyles(d) {
	var head = d.getElementsByTagName("head").item(0);
	var newstyle = d.createElement('style'); 
	newstyle.type = 'text/css'; 

    // add styles from a string
	var lines = "\n.udwProfDetail {\n";
	lines    += "	font-size: 10px;\n";
	lines    += "	}\n\n";

    // add styles from a string
	lines	+= "\n.udwHP {\n";
	lines	+= "	color: #000;\n";
	lines	+= "	background-color: #EEE;\n";
	lines	+= "	}\n\n";

	lines	+= "\n.udwInfected {\n";
	lines	+= "	color: #0F0;\n";
	lines	+= "	background-color: #EEE;\n";
	lines	+= "	}\n\n";

	lines	+= "\n.udwWounded {\n";
	lines	+= "	color: #F00;\n";
	lines	+= "	background-color: #EEE;\n";
	lines	+= "	}\n\n";

	newstyle.innerHTML = lines;
	head.appendChild(newstyle);

}

