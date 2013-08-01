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
 * The Original Code is graffitilogger.
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
 *  Global Data for grffiti logger:
 *		
 *
 */
var graffiti_datagram = null;

/*
 *  Function:	udw_GraffitiLogger(x,y,inside,graffiti,tagged,billboard)
 *	
 *	Send graffiti datagram to UDInfo
 *
 */
 function udw_GraffitiLogger(x,y,i,g,t,b) {
	var graffiti_line = ''+x+'_'+y+'_'+i+'_"'+g+'"_"'+t+'"_"'+b+'"_'+version;
	var last_datagram = graffiti_datagram;
	graffiti_datagram = 'gX=' + escape(graffiti_line);
	graffiti_datagram = graffiti_datagram.replace("+","%2B");

	if (last_datagram==graffiti_datagram) return graffiti_datagram;

	var xmlhttp = new XMLHttpRequest();
	xmlhttp.open('POST', 'http://iwitness.urbandead.info/gSubDB.php', true);
	xmlhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	xmlhttp.setRequestHeader('Content-Length', '' + graffiti_datagram.length);

//		if (isDebugEnabled) {
//			xmlhttp.onreadystatechange=function() {
//				if (xmlhttp.readyState==4) {
//					alert(xmlhttp.responseText);
//					}
//				}
//			}

	xmlhttp.send(graffiti_datagram);

	return graffiti_datagram;
	}


/*
 *  Function:	udw_GraffitiParser(x,y,inside,DivGT)
 *	
 *	Get graffiti and billboard strings from Location Description
 *
 */
 function udw_GraffitiParser(x,y,inside,DivGT) {
	// Search the document for graffiti
	var billboard = '';
	var graffiti = '';
	var tagged = '';
	var gGet = null;
	try { gGet = DivGT.innerHTML.match(/<br>Somebody has spraypainted <i>(.*?)<\/i> onto (.*?)\./); }
	catch (e) { } // alert("udWidget Error while getting graffiti: "+e);
	if (gGet) {
		graffiti = gGet[1];
		tagged = gGet[2];
		}

	var bGet = null;
	try { bGet = DivGT.innerHTML.match(/<br>(.*?) billboard (.*?)\. Somebody has spraypainted <i>(.*?)<\/i> across it\./); }
	catch (e) { } // alert("udWidget Error while getting graffiti: "+e);
	if (bGet) {
		//if (isDebugEnabled) alert(bGet[1]);
		//if (isDebugEnabled) alert(bGet[2]);
		billboard = bGet[3];
		}

	return udw_GraffitiLogger(x,y,inside,graffiti,tagged,billboard);
	}  //  udw_GraffitiParser

/*
<br>A large billboard advertises Caiger Mall. Somebody has spraypainted <i>graffiti</i> across it.
<br>A rotating billboard is stuck halfway between two posters. Somebody has spraypainted <i>graffiti</i> across it.
Salvage Row [56,56]
<br>At the junction of two streets, a large billboard advertises NecroTech. Somebody has spraypainted <i>graffiti</i> across it.

*/
