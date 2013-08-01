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
 * The Original Code is walkingmap.
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
 *  Global Data for walking map:
 *		
 *
 */
var udwSuburbs = null;
var udwMapData = null;
var udwMapTypes = null;

/*
 *  Function:	udwCramMap(document,xpos,ypos)
 *	
 *	Cram the map into a ud page
 *
 */
 function udwDrawMap(d,x,y)  {
	if (!udwMapData) udwLoadMapData();

	var sidebox = getElementsByClass('cp',d,'td')[0];
	var MapTable = d.createElement("TABLE");
	MapTable.setAttribute("class", "udw_WalkingMap");
	MapTable.setAttribute("id", "wm_table");
	//MapTable.addEventListener('click', udwMapClick, false);
	MapTable.addEventListener('click', udwMapClick, true);

	var current_row = 0;

	if (0) {	// Map Title
		var TitleRow = MapTable.insertRow(current_row);
		var TitleCell = TitleRow.insertCell(0);
		TitleCell.setAttribute("id", "wm_title");
		TitleCell.setAttribute("class", "udw_MapTitle");
		TitleCell.setAttribute("align", "center");
		TitleCell.setAttribute("valign", "middle");
		TitleCell.innerHTML = 'Walking Map';
		current_row++;
		}

	var MapRow = MapTable.insertRow(current_row);
	var MapCell = MapRow.insertCell(0);
	MapCell.setAttribute("id", "wm_cell");

	udwAddMapStyles(d);

	var numrows = udwMapBlocks;
	var numcolumns = numrows;

	var StartX = x-Math.floor(numcolumns/2);
	var StartY = y-Math.floor(numrows/2);

	if (StartX<0) StartX = 0;
	if (StartY<0) StartY = 0;
	if (StartX >(100-numcolumns) ) StartX = (100-numcolumns);
	if (StartY >(100-numrows) ) StartY = (100-numrows);

	var last_row = StartY;
	var bmtWidth = Math.floor(udwMapWidth/numcolumns);
	var bmtHeight = Math.floor(udwMapWidth/numrows);

	var bmtXML = '<table cellpadding=0 cellspacing=0 class=udw_SuburbBackground id='+udwMapTheme+'>\n<tr>\n';

	var suburb_rule = 2;
	var rCnt = 0;
	for (var bmY=StartY;bmY<(StartY+numrows);bmY++) {
		for (var bmX=StartX;bmX<(StartX+numcolumns);bmX++) {
			if (bmY>last_row) {
				bmtXML += '</tr>\n';
				if (!(bmY%10)) bmtXML += '<tr style="background-color: black;"><td width='+suburb_rule+' height='+suburb_rule+' colspan='+(numcolumns+10)+'></td></tr>\n';
				bmtXML += '<tr>\n';
				}
			last_row=bmY;
			if (!(bmX%10)) bmtXML += '<td style="background-color: black;" width='+suburb_rule+'></td>\n';
			bmtXML += '<td class=\"';
			if (udwMapLite && bmX==x && bmY==y)
				bmtXML += 'lite';
			else
				bmtXML += udwMapTypes[bmX][bmY];
			bmtXML += '"';

			bmtXML += ' title="'+udwMapData[bmX][bmY]+' ['+bmX+','+bmY+']';
			if (udwMapSuburbTip) bmtXML += ' '+ udwSuburbs[(Math.floor(bmY/10)*10)+(Math.floor(bmX/10))];
			bmtXML += '"';

			bmtXML += ' id="wmCell_'+rCnt+'"';
			bmtXML += ' width=\"'+bmtWidth+'\"';

			if (bmX==StartX) bmtXML += ' height=\"'+bmtHeight+'\"';
			bmtXML += '>&nbsp;</td>\n';
			rCnt++;
			}
		}

	bmtXML += '</tr>\n</table>\n'; 

	if (isMaxMapLinkEnabled) bmtXML += '<p align="center"><a target="ZoomMap" href="http://maps.urbandead.info/max_map/index.php?x='+x+'&y='+y+'&r='+udwMapBlocks+'&c='+udwMapBlocks+'">Zoom Map</a></p>\n';

	MapCell.innerHTML = bmtXML;

	// I like some space here but it should probably be left to the class
	sidebox.insertBefore(d.createElement("BR"), sidebox.lastChild.nextSibling);
	sidebox.insertBefore(MapTable, sidebox.lastChild.nextSibling);

  return 0;
 }


/*
 *  Function:	udwMapClick(event)
 *	
 *	handle Map Clicks
 *
 */
 function udwMapClick(e)  {
	var d = e.target.ownerDocument;
	var c = d.getElementById('wm_cell');
	if (!c) return;
	var t = c.getElementsByTagName('TABLE')[0];
	if (!t) return;

	if (t.id=='wm_ud') t.id='wm_run';
	else t.id='wm_ud';

	udwMapTheme = t.id;
	var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.udwidget.");
	prefs.setCharPref("udwMapTheme", udwMapTheme);
	}

/*
 *  Function:	udwLoadMapData()
 *	
 *	Read the flat file into an array
 *
 */
 function udwLoadMapData()  {
	var MapLines=udw_getURLContents("chrome://udwidget/content/mapdata.txt");
	var MapSplit = MapLines.split('\r\n');	
	
	udwSuburbs = new Array();
	var rN = 0;
	for (var rZ=0;rZ<100;rZ++)
		udwSuburbs[rZ] = MapSplit[rN++];

	udwMapData = new Array();
	for (var rX=0;rX<100;rX++) {
		udwMapData[rX] = new Array();
		for (var rY=0;rY<100;rY++)
			udwMapData[rX][rY] = MapSplit[rN++];
		}
	udwMapTypes = new Array();
	for (var rX=0;rX<100;rX++) {
		udwMapTypes[rX] = new Array();
		for (var rY=0;rY<100;rY++)
			udwMapTypes[rX][rY] = MapSplit[rN++];
		}

//  if (isDebugEnabled) alert('udwLoadMapData read '+rN+' lines');
  return rN;
 }

/*
 *  Function:	getURLContents()
 *	
 *	read a flat file from chrome contents
 *
 */
// http://www.letitblog.com/code/python/greasemonkey.py.txt

function udw_getURLContents(aURL) {
  var ioService=Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
  var scriptableStream=Components.classes["@mozilla.org/scriptableinputstream;1"].getService(Components.interfaces.nsIScriptableInputStream);
  var channel=ioService.newChannel(aURL,null,null);
  var input=channel.open();
  scriptableStream.init(input);
  var str=scriptableStream.read(input.available());
  scriptableStream.close();
  input.close();
  return str;
}


/*
 *  Function:	udwAddMapStyles(document)
 *	
 *	building and map styles
 *
 */
 function udwAddMapStyles(d) {
	var head = d.getElementsByTagName("head").item(0);
	//var head = d.getElementsByTagName("body").item(0);
	var newstyle = d.createElement('style'); 
	newstyle.type = 'text/css'; 

    // add styles from a string
	var lines = "\n.udw_WalkingMap {\n";
	if (udwMapBack) lines    += "	background-color: "+udwMapBack+";\n";
	lines    += "	width: "+(udwMapWidth+32)+"px;\n";
	lines    += "	border: 0px; margin: 0px; padding: 6px;\n	}\n\n";

	newstyle.innerHTML = lines;
	head.appendChild(newstyle);

    // add styles from chrome contents
	newstyle = d.createElement('style');
	newstyle.type = 'text/css'; 
	newstyle.innerHTML = '\n'+udw_getURLContents("chrome://udwidget/skin/type_layer.css");
	head.appendChild(newstyle);

}

