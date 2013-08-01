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
 * The Original Code is iwitness.
 *
 * The Initial Developer of the Original Code is Max Grivas.
 *
 * Portions created by the Initial Developer are Copyright (C) 2007
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s): Sebastian Wiers
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
 *  Global Data for iwitness:
 *		
 *
 */
var iwRequest = null;

/*
 *  Function:	udw_iwSubmit(security)
 *	
 *	Emulate iWitness Bookmarlet Behaviour
 *
 */
 function udw_iwSubmit(e)  {
	var udw_iwDoc = e.target.ownerDocument;

	var comment = udw_iwDoc.getElementById('iwComment');

	var security = null;
	switch (e.target.id) {
		case 'iwPrivate':
			security = 'PRIVATE';
			break;
		default:
			security = 'PUBLIC';
			break;
		}

	var dOff = new Date();

	var packet = 'wV=23&wP='+	escape(security).replace("+","%2B");

	packet +=	'&wC='+	escape(comment.value).replace("+","%2B");
	packet +=	'&wZ='+	escape(dOff.getTimezoneOffset()).replace("+","%2B");
	packet +=	'&wT='+	escape(udw_iwDoc.lastModified).replace("+","%2B");

	var iwBody = udw_iwDoc.getElementsByTagName('body')[0].innerHTML;

	// Try trimming Walking Map (two pass / nested tables)
	iwBody = udw_iwStrip('<table class="udw_SuburbBackground','</table>',iwBody);
	iwBody = udw_iwStrip('<table id="wm_table','</table>',iwBody);

	// Try trimming iWitness Tool
	iwBody = udw_iwStrip('<table id="iw_table','</table>',iwBody);

	// Try trimming iWitness Tool ... When Borked by udToolBar (Zero AP Bug)
	iwBody = udw_iwStrip('<table class="fxMap" id="iw_table">','</table>',iwBody);

	// Try trimming Debug String
	// 		It is removed with Possible actions: but may exist if udtoolbar is running)
	iwBody = udw_iwStrip('<p><br>udWidget Ver','</p>',iwBody);
	
	// Add udWidget link and version
	iwBody += '<p>Submitted by <a href="http://maps.urbandead.info/udwidget/">udWidget</a> '+version+'</p>';

	// Loose gnarly &nbsp; improperly displayed by iWitness
	iwBody = iwBody.replace(/&nbsp;/g,' ');

	//packet += '&wS='+ escape(iwBody).replace("+","%2B");
	packet += '&wS='+ escape(iwBody).replace(/\+/g,'%2B');

	if (isDebugEnabled)
		alert('Submitting '+iwBody.length+' bytes');

//		alert(iwBody.replace(/[\s+]/g,' '));
		
	iwRequest = new XMLHttpRequest();
	iwRequest.iwDoc = udw_iwDoc;

	//	Debug Version (No Storage)
//	iwRequest.open('POST', 'http://iwitness.urbandead.info/wSubDB.php', true);

	//	Real Version
	iwRequest.open('POST', 'http://iwitness.urbandead.info/wSubPA.php', true);

	iwRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	iwRequest.setRequestHeader('Content-Length', '' + packet.length);
	iwRequest.onload=udw_iwRecordLoad;
	iwRequest.onerror=udw_iwRecordError;
	iwRequest.send(packet);

	return 0;
	} // udw_iwSubmit

/*
 *  Function:	udw_iwStrip(high,low,haystack)
 *	
 *	strip text between and including markers
 *	
 *		low = null returns left portion only
 *
 */
 function udw_iwStrip(h,l,haystack)  {
	var szRet = haystack;

	// Trimming Variables
	var topPart = null;
	var lowPart = null;
	var topOff = null;
	var lowOff = null;

	// Try trimming iWitness Tool
	topOff = haystack.indexOf(h);
	if (topOff>-1) {
		topPart = haystack.substr(0,topOff);
		if (l && l.length) {
			lowOff = haystack.indexOf(l,topOff);
			if (lowOff>topOff) {
				lowPart = haystack.substr(lowOff+l.length,haystack.length);
				szRet = topPart + lowPart;
				}
			}
		else {
			return topPart;
			}
		}

	return szRet;
	} // udw_iwStrip

/*
 *  Function:	udw_iwRecordLoad()
 *	
 *	handle async onLoad
 *
 */
 function udw_iwRecordLoad(e)  {
	var out = e.target.iwDoc.getElementById('iwReturn');
	var rec_ref = e.target.responseText.match(/<a href="(.*?)" target="(.*?)">/i);

	if (rec_ref)
		out.innerHTML = 'Report filed as: <a href="'+rec_ref[1]+'" target="'+rec_ref[2]+'" >'+rec_ref[2]+'</a>';
	else {
		var wSubErrorTest = e.target.responseText.match(/wSub Error (.*?)\./i);
		if (wSubErrorTest) out.innerHTML = 'Error '+wSubErrorTest[1];
		else out.innerHTML = 'An error occured filing the report.';
		if (isDebugEnabled) alert(e.target.responseText.replace(/[\s+]/g,' '));
		}

//	return 0;
	} // udw_iwRecordLoad

/*
 *  Function:	udw_iwRecordError()
 *	
 *	handle async onerror
 *
 */
 function udw_iwRecordError(e)  {
	var out = e.target.iwDoc.getElementById('iwReturn');
	out.innerHTML = 'An error '+e.target.status+' occured filing the report.';
//	return 0;
	} // udw_iwRecordError

/*
 *  Function:	udw_dummy()
 *	
 *	do nothing
 *
 */
 function udw_dummy(e)  {
	if (e && e.preventDefault) e.preventDefault();
	return false;
	} // udw_dummy

/*
 *  Function:	udw_InsertWitnessBar()
 *	
 *	Add triggers for submiting reports
 *
 */
 function udw_InsertWitnessBar(d)  {
	//alert('udw_InsertWitnessBar');
	//return 0;

	var sidebox = getElementsByClass('cp',d,'td')[0];

	// Create container for iWitness tools
	var iwTable = d.createElement('TABLE');
	iwTable.id = 'iw_table';
	var iwRow = iwTable.insertRow(0);
	var iwContainer = iwRow.insertCell(0);

	iwContainer.id = 'iw_cell';

	// Raw HTML Construction
	iwXML = '<a href="http://iwitness.urbandead.info/" target="iW" title="F.A.Q.">iWitness</a>:';
	var iwName = udw_GetWitnessName();
	if (iwName) {
		iwXML+=' <a href="http://iwitness.urbandead.info/?myreports" target="MyIW" title="My iWitness">'+iwName+'</a>';
		}
	else {
		iwXML+=' <a href="http://iwitness.urbandead.info/?login" target="iW" title="Login to iWitness">Login</a>';
		iwXML+='/<a href="http://iwitness.urbandead.info/?register" target="iW" title="Register with iWitness">Register</a>';
		}

	iwXML+='<br>';

	iwXML+='<form id=iwForm class=a action="http://iwitness.urbandead.info/">';
	iwXML+='<input type="text" id="iwComment" maxlength=250>';
	iwXML+='<input type=reset id=iwPublic value="PUBLIC" class=m>';
	iwXML+='<input type=reset id=iwPrivate value="PRIVATE" class=m>';
	iwXML+='</form>';

	// Put the XML into the table cell
	iwContainer.innerHTML = iwXML;		

	iwRow = iwTable.insertRow(1);
	iwContainer = iwRow.insertCell(0);
	iwContainer.id = 'iwReturn';

	switch (udwIWPos) {
		case 1:
			if (isWalkingMapEnabled)
				sidebox.insertBefore(iwTable, sidebox.lastChild);
			else
				sidebox.insertBefore(iwTable, sidebox.lastChild.nextSibling);
			break;
		case 2:
			sidebox.insertBefore(iwTable, sidebox.lastChild.nextSibling);
			break;
		default:
			sidebox.insertBefore(iwTable, sidebox.firstChild.nextSibling);
			break;
		}

	d.getElementById('iwPrivate').addEventListener('click', udw_iwSubmit, false);
	d.getElementById('iwPublic').addEventListener('click', udw_iwSubmit, false);
	d.getElementById('iwForm').addEventListener('submit', udw_dummy, false);

	//alert('udw_InsertWitnessBar End');
	return 0;
	} // udw_InsertWitnessBar


/*
 *  Function:	udw_GetWitnessName()
 *	
 *	Returns iWitness login name if cookie is set
 *
 */
 function udw_GetWitnessName() {
	var str = null;
	var cookieManager = Components.classes["@mozilla.org/cookiemanager;1"].getService(Components.interfaces.nsICookieManager);
	var iter = cookieManager.enumerator;
	while (iter.hasMoreElements()) {
		var cookie = iter.getNext();
		if (cookie instanceof Components.interfaces.nsICookie)
			if (cookie.host=='.urbandead.info' && cookie.name=='iw_user')
				return unescape(cookie.value.replace(/\+/,' '));
		}

	return str;
}
