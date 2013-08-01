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
 * The Original Code is udWidget.
 *
 * The Initial Developer of the Original Code is Max Grivas.
 *
 * Portions created by the Initial Developer are Copyright (C) 2007
 *
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
 *  Global Data for Options:
 *		
 *
 */

var isWidgetEnabled = true;
var isDebugEnabled = false;
var isWalkingMapEnabled = true;
var isZombieNamesEnabled = true;
var isGraffitiLoggerEnabled = false;
var isContactTackEnabled = true;
var isColorNamesEnabled = false;
var isColorHPEnabled = false;

var isIWToolsEnabled = true;
var udwIWPos = 2;

// Skill Twiddlers
var SkillPistolEnabled = false;
var SkillShotgunEnabled = false;
var SkillHandEnabled = false;
var SkillKnifeEnabled = false;
var SkillAxeEnabled = false;
var SkillRunningEnabled = true;
var SkillNecroEnabled = true;
var SkillAidEnabled = false;
var SkillDiagnosisEnabled = false;
var SkillShoppingEnabled = false;
var SkillBodyEnabled = false;
var SkillTaggingEnabled = false;
var SkillConstructionEnabled = true;
var SkillRadioEnabled = false;
var SkillHeadshotEnabled = false;

var SkillFearEnabled = false;
var SkillBloodEnabled = false;
var SkillTrailEnabled = false;
var SkillDeathEnabled = false;
var SkillDigestionEnabled = false;
var SkillBiteEnabled = true;
var SkillMortisEnabled = false;
var SkillLurchEnabled = false;
var SkillGripEnabled = false;
var SkillRendEnabled = false;
var SkillGraspEnabled = false;
var SkillDragEnabled = false;
var SkillMemoriesEnabled = false;
var SkillRattleEnabled = false;
var SkillGroanEnabled = false;
var SkillRansackEnabled = true;
var SkillGestureEnabled = false;
var SkillGaitEnabled = false;
var SkillGrabEnabled = false;
var SkillRotEnabled = true;

// Walking Map Options
var udwMapWidth = 256;
var udwMapBlocks = 11;
var udwMapBack = '#444';
var udwMapLite = false;
var udwMapSuburbTip = false;
var udwMapTheme = 'wm_ud';
var isMaxMapLinkEnabled = true;

/*
 *  Function:	udwSelectColorFile();
 *	
 *	Present the nsIFilePicker for user selection of Name Colorization File
 *
 */

 function udwSelectColorFile() {
	var nsIFilePicker = Components.interfaces.nsIFilePicker;
	var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
	fp.init(window, "Select the file", nsIFilePicker.modeOpen);
	fp.appendFilter("Text Documents","*.txt");
	fp.appendFilter("All files", "*.*");
	var res = fp.show();
	if (res == nsIFilePicker.returnOK) {
		var file = fp.file;
		var preferences = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.udwidget.");
		preferences.setComplexValue("ColorFile", Components.interfaces.nsILocalFile, file);
		preferences.setCharPref("ColorPath", file.path);
		preferences.setIntPref("ColorType", 1);
	} else {
		if (res == nsIFilePicker.returnCancel) return;
	}
 } // udw_SelectColorFile()

/*
 *  Function:	udwInitOptions();
 *	
 *	Load preferences from store and populate dialog elements.
 *
 */

 function udwInitOptions() {
	try {
		var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.udwidget.");

		try { isWidgetEnabled = prefs.getBoolPref("isWidgetEnabled"); }
		catch (e) { } //alert("pref missing: "+e);
		document.getElementById("udwenable").checked = isWidgetEnabled;
		
		try { isDebugEnabled = prefs.getBoolPref("isDebugEnabled"); }
		catch (e) { } //alert("pref missing: "+e);
		document.getElementById("debugenable").checked = isDebugEnabled;
		
		try { isWalkingMapEnabled = prefs.getBoolPref("isWalkingMapEnabled"); }
		catch (e) { } //alert("pref missing: "+e);
		document.getElementById("wmenable").checked = isWalkingMapEnabled;

		try { udwMapWidth = prefs.getIntPref("udwMapWidth"); }
		catch (e) { } //alert("pref missing: "+e);
		document.getElementById("wmwidth").value = udwMapWidth;
		try { udwMapBlocks = prefs.getIntPref("udwMapBlocks"); }
		catch (e) { } //alert("pref missing: "+e);
		document.getElementById("wmblocks").value = udwMapBlocks;
		try { udwMapBack = prefs.getCharPref("udwMapBack"); }
		catch (e) { } //alert("pref missing: "+e);
		document.getElementById("wmback").value = udwMapBack;

		try { udwMapTheme = prefs.getCharPref("udwMapTheme"); }
		catch (e) { } //alert("pref missing: "+e);
		//This value is set by clicking the map. There is no Options element
		//document.getElementById("wmtheme").value = udwMapTheme;
		//This value is set by clicking the map. There is no Options element

		try { udwMapLite = prefs.getBoolPref("udwMapLite"); }
		catch (e) { } //alert("pref missing: "+e);
		document.getElementById("wmlite").checked = udwMapLite;

		try { udwMapSuburbTip = prefs.getBoolPref("udwMapSuburbTip"); }
		catch (e) { } //alert("pref missing: "+e);
		document.getElementById("wmsuburbtip").checked = udwMapSuburbTip;

		try { isMaxMapLinkEnabled = prefs.getBoolPref("isMaxMapLinkEnabled"); }
		catch (e) { } //alert("pref missing: "+e);
		document.getElementById("maxmaplink").checked = isMaxMapLinkEnabled;

		try { isZombieNamesEnabled = prefs.getBoolPref("isZombieNamesEnabled"); }
		catch (e) { } //alert("pref missing: "+e);
		document.getElementById("znenable").checked = isZombieNamesEnabled;

			// Add cache count to Clear Cahe Button
			udw_opt_znclear_count();
			//var zCount = 'empty';
			//var zCountRead = udw_CacheReadZombieNamesXML(udw_ZN_CacheKey);
			//if (zCountRead) zCount = zCountRead.length;
			//document.getElementById("znclear").label += ' ('+zCount+')';
			
		try { isGraffitiLoggerEnabled = prefs.getBoolPref("isGraffitiLoggerEnabled"); }
		catch (e) { } //alert("pref missing: "+e);
		document.getElementById("glenable").checked = isGraffitiLoggerEnabled;

		try { isContactTackEnabled = prefs.getBoolPref("isContactTackEnabled"); }
		catch (e) { } //alert("pref missing: "+e);
		document.getElementById("ctenable").checked = isContactTackEnabled;

		try { isIWToolsEnabled = prefs.getBoolPref("isIWToolsEnabled"); }
		catch (e) { } //alert("pref missing: "+e);
		document.getElementById("iwenable").checked = isIWToolsEnabled;

			try { udwIWPos = prefs.getIntPref("udwIWPos"); }
			catch (e) { } //alert("pref missing: "+e);
			//document.getElementById('iwpos').selectedItem = udwIWPos;
			document.getElementById('iwpos1').radioGroup.selectedIndex = udwIWPos;

		try { isColorNamesEnabled = prefs.getBoolPref("isColorNamesEnabled"); }
		catch (e) { } //alert("pref missing: "+e);
		document.getElementById("colorenable").checked = isColorNamesEnabled;
		
		try { isColorHPEnabled = prefs.getBoolPref("isColorHPEnabled"); }
		catch (e) { } //alert("pref missing: "+e);
		document.getElementById("colorhpenable").checked = isColorHPEnabled;

		udwOptionsMakeDisabled('colorfile','colorenable');

// Skills
		try { SkillPistolEnabled = prefs.getBoolPref("SkillPistolEnabled"); }
		catch (e) { } //alert("pref missing: "+e);
		document.getElementById("skillpistol").checked = SkillPistolEnabled;

		try { SkillShotgunEnabled = prefs.getBoolPref("SkillShotgunEnabled"); }
		catch (e) { } //alert("pref missing: "+e);
		document.getElementById("skillshotgun").checked = SkillShotgunEnabled;

		try { SkillHandEnabled = prefs.getBoolPref("SkillHandEnabled"); }
		catch (e) { } //alert("pref missing: "+e);
		document.getElementById("skillhand").checked = SkillHandEnabled;

		try { SkillKnifeEnabled = prefs.getBoolPref("SkillKnifeEnabled"); }
		catch (e) { } //alert("pref missing: "+e);
		document.getElementById("skillknife").checked = SkillKnifeEnabled;

		try { SkillAxeEnabled = prefs.getBoolPref("SkillAxeEnabled"); }
		catch (e) { } //alert("pref missing: "+e);
		document.getElementById("skillaxe").checked = SkillAxeEnabled;

		try { SkillRunningEnabled = prefs.getBoolPref("SkillRunningEnabled"); }
		catch (e) { } //alert("pref missing: "+e);
		document.getElementById("skillrunning").checked = SkillRunningEnabled;

		try { SkillNecroEnabled = prefs.getBoolPref("SkillNecroEnabled"); }
		catch (e) { } //alert("pref missing: "+e);
		document.getElementById("skillnecro").checked = SkillNecroEnabled;

		try { SkillAidEnabled = prefs.getBoolPref("SkillAidEnabled"); }
		catch (e) { } //alert("pref missing: "+e);
		document.getElementById("skillaid").checked = SkillAidEnabled;

		try { SkillDiagnosisEnabled = prefs.getBoolPref("SkillDiagnosisEnabled"); }
		catch (e) { } //alert("pref missing: "+e);
		document.getElementById("skilldiagnosis").checked = SkillDiagnosisEnabled;

		try { SkillShoppingEnabled = prefs.getBoolPref("SkillShoppingEnabled"); }
		catch (e) { } //alert("pref missing: "+e);
		document.getElementById("skillshopping").checked = SkillShoppingEnabled;

		try { SkillBodyEnabled = prefs.getBoolPref("SkillBodyEnabled"); }
		catch (e) { } //alert("pref missing: "+e);
		document.getElementById("skillbody").checked = SkillBodyEnabled;

		try { SkillTaggingEnabled = prefs.getBoolPref("SkillTaggingEnabled"); }
		catch (e) { } //alert("pref missing: "+e);
		document.getElementById("skilltagging").checked = SkillTaggingEnabled;

		try { SkillConstructionEnabled = prefs.getBoolPref("SkillConstructionEnabled"); }
		catch (e) { } //alert("pref missing: "+e);
		document.getElementById("skillconstruction").checked = SkillConstructionEnabled;

		try { SkillRadioEnabled = prefs.getBoolPref("SkillRadioEnabled"); }
		catch (e) { } //alert("pref missing: "+e);
		document.getElementById("skillradio").checked = SkillRadioEnabled;

		try { SkillHeadshotEnabled = prefs.getBoolPref("SkillHeadshotEnabled"); }
		catch (e) { } //alert("pref missing: "+e);
		document.getElementById("skillheadshot").checked = SkillHeadshotEnabled;

		try { SkillFearEnabled = prefs.getBoolPref("SkillFearEnabled"); }
		catch (e) { } //alert("pref missing: "+e);
		document.getElementById("skillfear").checked = SkillFearEnabled;

		try { SkillBloodEnabled = prefs.getBoolPref("SkillBloodEnabled"); }
		catch (e) { } //alert("pref missing: "+e);
		document.getElementById("skillblood").checked = SkillBloodEnabled;

		try { SkillTrailEnabled = prefs.getBoolPref("SkillTrailEnabled"); }
		catch (e) { } //alert("pref missing: "+e);
		document.getElementById("skilltrail").checked = SkillTrailEnabled;

		try { SkillDeathEnabled = prefs.getBoolPref("SkillDeathEnabled"); }
		catch (e) { } //alert("pref missing: "+e);
		document.getElementById("skilldeath").checked = SkillDeathEnabled;

		try { SkillDigestionEnabled = prefs.getBoolPref("SkillDigestionEnabled"); }
		catch (e) { } //alert("pref missing: "+e);
		document.getElementById("skilldigestion").checked = SkillDigestionEnabled;

		try { SkillBiteEnabled = prefs.getBoolPref("SkillBiteEnabled"); }
		catch (e) { } //alert("pref missing: "+e);
		document.getElementById("skillbite").checked = SkillBiteEnabled;

		try { SkillMortisEnabled = prefs.getBoolPref("SkillMortisEnabled"); }
		catch (e) { } //alert("pref missing: "+e);
		document.getElementById("skillmortis").checked = SkillMortisEnabled;

		try { SkillLurchEnabled = prefs.getBoolPref("SkillLurchEnabled"); }
		catch (e) { } //alert("pref missing: "+e);
		document.getElementById("skilllurch").checked = SkillLurchEnabled;

		try { SkillGripEnabled = prefs.getBoolPref("SkillGripEnabled"); }
		catch (e) { } //alert("pref missing: "+e);
		document.getElementById("skillgrip").checked = SkillGripEnabled;

		try { SkillRendEnabled = prefs.getBoolPref("SkillRendEnabled"); }
		catch (e) { } //alert("pref missing: "+e);
		document.getElementById("skillrend").checked = SkillRendEnabled;

		try { SkillGraspEnabled = prefs.getBoolPref("SkillGraspEnabled"); }
		catch (e) { } //alert("pref missing: "+e);
		document.getElementById("skillgrasp").checked = SkillGraspEnabled;

		try { SkillDragEnabled = prefs.getBoolPref("SkillDragEnabled"); }
		catch (e) { } //alert("pref missing: "+e);
		document.getElementById("skilldrag").checked = SkillDragEnabled;

		try { SkillMemoriesEnabled = prefs.getBoolPref("SkillMemoriesEnabled"); }
		catch (e) { } //alert("pref missing: "+e);
		document.getElementById("skillmemories").checked = SkillMemoriesEnabled;

		try { SkillRattleEnabled = prefs.getBoolPref("SkillRattleEnabled"); }
		catch (e) { } //alert("pref missing: "+e);
		document.getElementById("skillrattle").checked = SkillRattleEnabled;

		try { SkillGroanEnabled = prefs.getBoolPref("SkillGroanEnabled"); }
		catch (e) { } //alert("pref missing: "+e);
		document.getElementById("skillgroan").checked = SkillGroanEnabled;

		try { SkillRansackEnabled = prefs.getBoolPref("SkillRansackEnabled"); }
		catch (e) { } //alert("pref missing: "+e);
		document.getElementById("skillransack").checked = SkillRansackEnabled;

		try { SkillGestureEnabled = prefs.getBoolPref("SkillGestureEnabled"); }
		catch (e) { } //alert("pref missing: "+e);
		document.getElementById("skillgesture").checked = SkillGestureEnabled;

		try { SkillGaitEnabled = prefs.getBoolPref("SkillGaitEnabled"); }
		catch (e) { } //alert("pref missing: "+e);
		document.getElementById("skillgait").checked = SkillGaitEnabled;

		try { SkillGrabEnabled = prefs.getBoolPref("SkillGrabEnabled"); }
		catch (e) { } //alert("pref missing: "+e);
		document.getElementById("skillgrab").checked = SkillGrabEnabled;

		try { SkillRotEnabled = prefs.getBoolPref("SkillRotEnabled"); }
		catch (e) { } //alert("pref missing: "+e);
		document.getElementById("skillrot").checked = SkillRotEnabled;

// Skills

	} catch (e) {
		alert("udwInitOptions() had an exception: "+e);
	}

 } // udwInitOptions()

/*
 *  Function:	udwSaveOptions();
 *	
 *	Save settings from dialog elements into preferences storage.
 *
 */

 function udwSaveOptions() {
	try {
		var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.udwidget.");
		prefs.setBoolPref("isWidgetEnabled", document.getElementById("udwenable").checked);
		prefs.setBoolPref("isDebugEnabled", document.getElementById("debugenable").checked);
		prefs.setBoolPref("isWalkingMapEnabled", document.getElementById("wmenable").checked);
		prefs.setBoolPref("isMaxMapLinkEnabled", document.getElementById("maxmaplink").checked);
		prefs.setBoolPref("isZombieNamesEnabled", document.getElementById("znenable").checked);
		prefs.setBoolPref("isGraffitiLoggerEnabled", document.getElementById("glenable").checked);
		prefs.setBoolPref("isContactTackEnabled", document.getElementById("ctenable").checked);
		prefs.setBoolPref("isColorNamesEnabled", document.getElementById("colorenable").checked);
		prefs.setBoolPref("isColorHPEnabled", document.getElementById("colorhpenable").checked);

		prefs.setBoolPref("isIWToolsEnabled", document.getElementById("iwenable").checked);
			prefs.setIntPref("udwIWPos", document.getElementById('iwpos1').radioGroup.selectedIndex);

// Skills
		prefs.setBoolPref("SkillPistolEnabled", document.getElementById("skillpistol").checked);
		prefs.setBoolPref("SkillShotgunEnabled", document.getElementById("skillshotgun").checked);
		prefs.setBoolPref("SkillHandEnabled", document.getElementById("skillhand").checked);
		prefs.setBoolPref("SkillKnifeEnabled", document.getElementById("skillknife").checked);
		prefs.setBoolPref("SkillAxeEnabled", document.getElementById("skillaxe").checked);
		prefs.setBoolPref("SkillRunningEnabled", document.getElementById("skillrunning").checked);
		prefs.setBoolPref("SkillNecroEnabled", document.getElementById("skillnecro").checked);
		prefs.setBoolPref("SkillAidEnabled", document.getElementById("skillaid").checked);
		prefs.setBoolPref("SkillDiagnosisEnabled", document.getElementById("skilldiagnosis").checked);
		prefs.setBoolPref("SkillShoppingEnabled", document.getElementById("skillshopping").checked);
		prefs.setBoolPref("SkillBodyEnabled", document.getElementById("skillbody").checked);
		prefs.setBoolPref("SkillTaggingEnabled", document.getElementById("skilltagging").checked);
		prefs.setBoolPref("SkillConstructionEnabled", document.getElementById("skillconstruction").checked);
		prefs.setBoolPref("SkillRadioEnabled", document.getElementById("skillradio").checked);
		prefs.setBoolPref("SkillHeadshotEnabled", document.getElementById("skillheadshot").checked);

		prefs.setBoolPref("SkillFearEnabled", document.getElementById("skillfear").checked);
		prefs.setBoolPref("SkillBloodEnabled", document.getElementById("skillblood").checked);
		prefs.setBoolPref("SkillTrailEnabled", document.getElementById("skilltrail").checked);
		prefs.setBoolPref("SkillDeathEnabled", document.getElementById("skilldeath").checked);
		prefs.setBoolPref("SkillDigestionEnabled", document.getElementById("skilldigestion").checked);
		prefs.setBoolPref("SkillBiteEnabled", document.getElementById("skillbite").checked);
		prefs.setBoolPref("SkillMortisEnabled", document.getElementById("skillmortis").checked);
		prefs.setBoolPref("SkillLurchEnabled", document.getElementById("skilllurch").checked);
		prefs.setBoolPref("SkillGripEnabled", document.getElementById("skillgrip").checked);
		prefs.setBoolPref("SkillRendEnabled", document.getElementById("skillrend").checked);
		prefs.setBoolPref("SkillGraspEnabled", document.getElementById("skillgrasp").checked);
		prefs.setBoolPref("SkillDragEnabled", document.getElementById("skilldrag").checked);
		prefs.setBoolPref("SkillMemoriesEnabled", document.getElementById("skillmemories").checked);
		prefs.setBoolPref("SkillRattleEnabled", document.getElementById("skillrattle").checked);
		prefs.setBoolPref("SkillGroanEnabled", document.getElementById("skillgroan").checked);
		prefs.setBoolPref("SkillRansackEnabled", document.getElementById("skillransack").checked);
		prefs.setBoolPref("SkillGestureEnabled", document.getElementById("skillgesture").checked);
		prefs.setBoolPref("SkillGaitEnabled", document.getElementById("skillgait").checked);
		prefs.setBoolPref("SkillGrabEnabled", document.getElementById("skillgrab").checked);
		prefs.setBoolPref("SkillRotEnabled", document.getElementById("skillrot").checked);
// Skills

		//prefs.setIntPref("udwMapWidth", document.getElementById("wmwidth").value?parseInt(document.getElementById("wmwidth").value):222);
        var valtoset = parseInt(document.getElementById("wmwidth").value);
		if ((valtoset<20)||(valtoset>512)) valtoset=256;
		prefs.setIntPref("udwMapWidth", valtoset);

        valtoset = parseInt(document.getElementById("wmblocks").value);
		prefs.setIntPref("udwMapBlocks", ((valtoset<3)||(valtoset>100))?11:valtoset);

		prefs.setCharPref("udwMapBack", document.getElementById("wmback").value);

		//This value is set by clicking the map. There is no Options element
		//prefs.setCharPref("udwMapTheme", document.getElementById("wmtheme").value);
		//This value is set by clicking the map. There is no Options element

		prefs.setBoolPref("udwMapLite", document.getElementById("wmlite").checked);
		prefs.setBoolPref("udwMapSuburbTip", document.getElementById("wmsuburbtip").checked);
	} catch (e) {
		alert("udwSaveOptions() had an exception: "+e);
	}

 } // udwSaveOptions()

/*
 *  Function:	udwCancelOptions();
 *	
 *	Do nothing other than return true to handle user canceling the options dialog.
 *
 */

 function udwCancelOptions() {
	return true;
 } // udwCancelOptions()

/*
 *  Function:	udwOptionsGrey();
 *	
 *	Do disable one item when another if unchecked.
 *
 */

 function udwOptionsMakeDisabled(id1,id2) {
	document.getElementById(id1).disabled = !document.getElementById(id2).checked;
 } // udwOptionsGrey()

function udWidgetOptions()
{
	var prefWindow = "chrome://udwidget/content/options.xul";
	window.openDialog(prefWindow, "Options", "chrome,modal,dialog,centerscreen,dependent");
}

function udw_opt_znclear()
{
	udw_CacheClear(udw_ZN_CacheKey);
	udw_opt_znclear_count();
}

function udw_opt_znclear_count()
{
	var button = document.getElementById("znclear");
	var label = button.label;

	var zCount = 'empty';

	var zCountRead = udw_CacheReadZombieNamesXML(udw_ZN_CacheKey);
	if (zCountRead) zCount = zCountRead.length;

	label = label.replace(/\(.*\)/g,'('+zCount+')');

	button.label = label;
}

function udwLoadPreferences()
{
		// 
		// Load the preferences values
		//
		var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.udwidget.");
		try {
			try { isWidgetEnabled = prefs.getBoolPref("isWidgetEnabled"); }
			catch (e) {
				alert("udWidget Error pref missing: "+e);
			}
			try { isDebugEnabled = prefs.getBoolPref("isDebugEnabled"); }
			catch (e) {
				alert("udWidget Error pref missing: "+e);
			}
			try { isWalkingMapEnabled = prefs.getBoolPref("isWalkingMapEnabled"); }
			catch (e) {
				alert("udWidget Error pref missing: "+e);
			}

			try { isMaxMapLinkEnabled = prefs.getBoolPref("isMaxMapLinkEnabled"); }
			catch (e) { } // alert("udWidget Error pref missing: "+e);

			try { udwMapWidth = prefs.getIntPref("udwMapWidth"); }
			catch (e) { } // alert("udWidget Error pref missing: "+e);
			try { udwMapBlocks = prefs.getIntPref("udwMapBlocks"); }
			catch (e) { } // alert("udWidget Error pref missing: "+e);
			try { udwMapBack = prefs.getCharPref("udwMapBack"); }
			catch (e) { } // alert("udWidget Error pref missing: "+e);
			try { udwMapTheme = prefs.getCharPref("udwMapTheme"); }
			catch (e) { } // alert("udWidget Error pref missing: "+e);
			try { udwMapLite = prefs.getBoolPref("udwMapLite"); }
			catch (e) { } // alert("udWidget Error pref missing: "+e);
			try { udwMapSuburbTip = prefs.getBoolPref("udwMapSuburbTip"); }
			catch (e) { } // alert("udWidget Error pref missing: "+e);

			try { isZombieNamesEnabled = prefs.getBoolPref("isZombieNamesEnabled"); }
			catch (e) { } // alert("udWidget Error pref missing: "+e);

			try { isGraffitiLoggerEnabled = prefs.getBoolPref("isGraffitiLoggerEnabled"); }
			catch (e) { } // alert("udWidget Error pref missing: "+e);

			try { isContactTackEnabled = prefs.getBoolPref("isContactTackEnabled"); }
			catch (e) { } // alert("udWidget Error pref missing: "+e);

			try { isColorNamesEnabled = prefs.getBoolPref("isColorNamesEnabled"); }
			catch (e) { } // alert("udWidget Error pref missing: "+e);

			try { isColorHPEnabled = prefs.getBoolPref("isColorHPEnabled"); }
			catch (e) { } // alert("udWidget Error pref missing: "+e);

			try { isIWToolsEnabled = prefs.getBoolPref("isIWToolsEnabled"); }
			catch (e) { } // alert("udWidget Error pref missing: "+e);

				try { udwIWPos = prefs.getIntPref("udwIWPos"); }
				catch (e) { } // alert("udWidget Error pref missing: "+e);

// Skills
			try { SkillPistolEnabled = prefs.getBoolPref("SkillPistolEnabled"); }
			catch (e) { } // alert("udWidget Error pref missing: "+e);

			try { SkillShotgunEnabled = prefs.getBoolPref("SkillShotgunEnabled"); }
			catch (e) { } // alert("udWidget Error pref missing: "+e);

			try { SkillHandEnabled = prefs.getBoolPref("SkillHandEnabled"); }
			catch (e) { } // alert("udWidget Error pref missing: "+e);

			try { SkillKnifeEnabled = prefs.getBoolPref("SkillKnifeEnabled"); }
			catch (e) { } // alert("udWidget Error pref missing: "+e);

			try { SkillAxeEnabled = prefs.getBoolPref("SkillAxeEnabled"); }
			catch (e) { } // alert("udWidget Error pref missing: "+e);

			try { SkillRunningEnabled = prefs.getBoolPref("SkillRunningEnabled"); }
			catch (e) { } // alert("udWidget Error pref missing: "+e);

			try { SkillRunningEnabled = prefs.getBoolPref("SkillRunningEnabled"); }
			catch (e) { } // alert("udWidget Error pref missing: "+e);

			try { SkillNecroEnabled = prefs.getBoolPref("SkillNecroEnabled"); }
			catch (e) { } // alert("udWidget Error pref missing: "+e);

			try { SkillAidEnabled = prefs.getBoolPref("SkillAidEnabled"); }
			catch (e) { } // alert("udWidget Error pref missing: "+e);

			try { SkillDiagnosisEnabled = prefs.getBoolPref("SkillDiagnosisEnabled"); }
			catch (e) { } // alert("udWidget Error pref missing: "+e);

			try { SkillShoppingEnabled = prefs.getBoolPref("SkillShoppingEnabled"); }
			catch (e) { } // alert("udWidget Error pref missing: "+e);

			try { SkillBodyEnabled = prefs.getBoolPref("SkillBodyEnabled"); }
			catch (e) { } // alert("udWidget Error pref missing: "+e);

			try { SkillTaggingEnabled = prefs.getBoolPref("SkillTaggingEnabled"); }
			catch (e) { } // alert("udWidget Error pref missing: "+e);

			try { SkillConstructionEnabled = prefs.getBoolPref("SkillConstructionEnabled"); }
			catch (e) { } // alert("udWidget Error pref missing: "+e);

			try { SkillRadioEnabled = prefs.getBoolPref("SkillRadioEnabled"); }
			catch (e) { } // alert("udWidget Error pref missing: "+e);

			try { SkillHeadshotEnabled = prefs.getBoolPref("SkillHeadshotEnabled"); }
			catch (e) { } // alert("udWidget Error pref missing: "+e);

//z

			try { SkillFearEnabled = prefs.getBoolPref("SkillFearEnabled"); }
			catch (e) { } // alert("udWidget Error pref missing: "+e);

			try { SkillBloodEnabled = prefs.getBoolPref("SkillBloodEnabled"); }
			catch (e) { } // alert("udWidget Error pref missing: "+e);

			try { SkillTrailEnabled = prefs.getBoolPref("SkillTrailEnabled"); }
			catch (e) { } // alert("udWidget Error pref missing: "+e);

			try { SkillDeathEnabled = prefs.getBoolPref("SkillDeathEnabled"); }
			catch (e) { } // alert("udWidget Error pref missing: "+e);

			try { SkillDigestionEnabled = prefs.getBoolPref("SkillDigestionEnabled"); }
			catch (e) { } // alert("udWidget Error pref missing: "+e);

			try { SkillBiteEnabled = prefs.getBoolPref("SkillBiteEnabled"); }
			catch (e) { } // alert("udWidget Error pref missing: "+e);

			try { SkillMortisEnabled = prefs.getBoolPref("SkillMortisEnabled"); }
			catch (e) { } // alert("udWidget Error pref missing: "+e);

			try { SkillLurchEnabled = prefs.getBoolPref("SkillLurchEnabled"); }
			catch (e) { } // alert("udWidget Error pref missing: "+e);

			try { SkillGripEnabled = prefs.getBoolPref("SkillGripEnabled"); }
			catch (e) { } // alert("udWidget Error pref missing: "+e);

			try { SkillRendEnabled = prefs.getBoolPref("SkillRendEnabled"); }
			catch (e) { } // alert("udWidget Error pref missing: "+e);

			try { SkillGraspEnabled = prefs.getBoolPref("SkillGraspEnabled"); }
			catch (e) { } // alert("udWidget Error pref missing: "+e);

			try { SkillDragEnabled = prefs.getBoolPref("SkillDragEnabled"); }
			catch (e) { } // alert("udWidget Error pref missing: "+e);

			try { SkillMemoriesEnabled = prefs.getBoolPref("SkillMemoriesEnabled"); }
			catch (e) { } // alert("udWidget Error pref missing: "+e);

			try { SkillRattleEnabled = prefs.getBoolPref("SkillRattleEnabled"); }
			catch (e) { } // alert("udWidget Error pref missing: "+e);

			try { SkillGroanEnabled = prefs.getBoolPref("SkillGroanEnabled"); }
			catch (e) { } // alert("udWidget Error pref missing: "+e);

			try { SkillRansackEnabled = prefs.getBoolPref("SkillRansackEnabled"); }
			catch (e) { } // alert("udWidget Error pref missing: "+e);

			try { SkillGestureEnabled = prefs.getBoolPref("SkillGestureEnabled"); }
			catch (e) { } // alert("udWidget Error pref missing: "+e);

			try { SkillGaitEnabled = prefs.getBoolPref("SkillGaitEnabled"); }
			catch (e) { } // alert("udWidget Error pref missing: "+e);

			try { SkillGrabEnabled = prefs.getBoolPref("SkillGrabEnabled"); }
			catch (e) { } // alert("udWidget Error pref missing: "+e);

			try { SkillRotEnabled = prefs.getBoolPref("SkillRotEnabled"); }
			catch (e) { } // alert("udWidget Error pref missing: "+e);

// Skills

		}
		catch (e) {
			alert("udWidget Error while loading prefs: "+e);
		}

}
