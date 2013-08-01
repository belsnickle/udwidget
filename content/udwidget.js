window.addEventListener("load", function(e) { udWidget.onLoad(e); }, false);
window.addEventListener("unload", function(e) { udWidget.onUnload(e); }, false);

var version = "0.0.4.68";

var udWidget = {

	onLoad: function() {
		// initialization code
		var appcontent = document.getElementById("appcontent");   // browser
		if (appcontent) {
			appcontent.addEventListener("DOMContentLoaded", this.onPageLoad, false);

		}
	},
	
	onUnload: function(aEvent) {
		// Test writing known zombies to cache
		if (udw_Zombies_Known && (udw_Zombies_Known.length != udw_ZN_WriteCount)) {
			udw_CacheWriteZombieNamesXML(udw_ZN_CacheKey,udw_Zombies_Known);
		//	if (isDebugEnabled) alert('udWidget wrote '+udw_Zombies_Known.length+' zombies to the cache.');
			}
	},
	
	// The real stuff - most of the work is done when the page loads
	onPageLoad: function(aEvent) {
		var doc = aEvent.originalTarget; // doc is document that triggered "onload" event
		if (!doc) { return; }

		// 
		// bailout if this page is not urbandead
		// 
		var isMapPage = doc.location.href.search("urbandead.com/map.cgi") > -1 && doc.location.href.search("logout")==-1;
		var isContactsPage = doc.location.href.search("urbandead.com/contacts.cgi") > -1;
		var isProfilePage = doc.location.href.search("urbandead.com/profile.cgi") > -1;
		var isIWitnessPage = doc.location.href.search("urbandead.info/") > -1;
		if (!(isMapPage || isContactsPage || isProfilePage || isIWitnessPage)) { return }

        udwSetBenchmark();

		udwLoadPreferences();

		if (isIWitnessPage) { return; }
		if (!isWidgetEnabled) { return; }

		var graffiti_debug = null;
		var rawmsg = "udWidget Ver. " + escape(version)+": ";

		//
		// Do Name Colorization for contacts and profiles
		//
		if (isContactsPage || isProfilePage) {
			if (isColorNamesEnabled) { udw_ColorizeNames(doc,isProfilePage,isContactsPage); }
			return;
			}

		// Here down isMapPage must be true
		// Here down isMapPage must be true

		if (isMapPage) {
			var charBox = getElementsByClass('gt',doc,'div')[0];

//			var chrName = charBox.innerHTML.match(/><b>(.*)<\/b><\/a>/)[1];
//			var chrID = charBox.innerHTML.match(/profile.cgi\?id=(\d+)/)[1];
			var chrAP = parseInt(charBox.innerHTML.match(/<b>(\d+)<\/b> Action Points/)[1]);
			
//			rawmsg+= "&chrName=" + escape(chrName);
//			rawmsg+= "&chrID=" + escape(chrID);
			rawmsg+= "&chrAP=" + escape(chrAP);
			if (chrAP>0) {
//				var chrHP = parseInt(charBox.innerHTML.match(/<b>(\d+)<\/b> Hit Points/)[1]);
//				var chrXP = parseInt(charBox.innerHTML.match(/<b>(\d+)<\/b> Experience Points/)[1]);
//				rawmsg+= "&chrHP=" + escape(chrHP);
//				rawmsg+= "&chrXP=" + escape(chrXP);
				
				// determine current location
				var X = 0;
				var Y = 0;
				var tbl = getElementsByClass('c',doc,'table')[0];
				var trs = tbl.getElementsByTagName('tr');
				var tds = getElementsByClass('b',trs[1],'td');
				var coords = null;
				try { coords = tds[0].innerHTML.match(/\d+-\d+/)[0].split("-"); }
				catch (e) { } // alert("udWidget Error while getting coords: "+e);
					
				if (!coords) {
					coords = new Array();
					coords[0] = 0;
					coords[1] = 0;
					}
				X = parseInt(coords[0]);
				Y = parseInt(coords[1]);
				
				
				if (tds.length>2) { X++ }
				else if (X != 0) { X++ }
				if (trs.length>3) { Y++ }
				else if (Y != 0) { Y++ }
				
				// get the content of the location description
				var LocDesc = getElementsByClass('gt',doc,'div')[1];

				var mGet = LocDesc.innerHTML.match(/You are ((standing )|(lying ))?((inside)|(outside)|(at)|(in))(.*?)<b>(.*?)<\/b>/i);
					var inside = 0;
					var intest = null;
					try { intest = mGet[4].match(/inside/); }
					catch (e) { } // alert("udWidget Error while getting inside: "+e);
					if (intest) inside = 1;
					if (mGet[9].length>1)  inside = 1;
				rawmsg+= "&szWhere=" + escape(mGet[10]+' ['+X+','+Y+'] ('+inside+')');

				if (isGraffitiLoggerEnabled) graffiti_debug = udw_GraffitiParser(X,Y,inside,LocDesc);

				if (isWalkingMapEnabled) udwDrawMap(doc,X,Y);

				}  //  if (chrAP>0)  // If the character is out of AP then the map is not displayed

			if (isColorNamesEnabled) { udw_ColorizeNames(doc,isProfilePage,isContactsPage); }

			if (isContactTackEnabled) udw_PutAddRemoveOnProfileLinks(getElementsByClass('gp',doc,'td')[0]);

			if (isZombieNamesEnabled) {
				if (!udw_Zombies_Known) {
					udw_ZN_WriteCount = 0;
					udw_Zombies_Known = udw_CacheReadZombieNamesXML(udw_ZN_CacheKey);
					if (udw_Zombies_Known) {
						udw_ZN_WriteCount = udw_Zombies_Known.length;
					//	if (isDebugEnabled) alert('udWiget read '+udw_Zombies_Known.length+' zombies from the cache.');
						}
					}

				udw_WorkZombieProfiles(doc);

				if (udw_Zombies_Known && (udw_Zombies_Known.length != udw_ZN_WriteCount)) {
					udw_CacheWriteZombieNamesXML(udw_ZN_CacheKey,udw_Zombies_Known);
					udw_ZN_WriteCount = udw_Zombies_Known.length;
				//	if (isDebugEnabled) alert('udWiget wrote '+udw_Zombies_Known.length+' zombies to the cache.');
					}

				}

			if (isColorHPEnabled) { udw_ColorizeHP(doc); }

			if (isIWToolsEnabled) udw_InsertWitnessBar(doc);

			}  // if (isMapPage)


    	rawmsg+= "&Bench=" + escape(udwGetBenchmark());

		if (isDebugEnabled) {
			// Widget Output
			var bdy = doc.getElementsByTagName("body").item(0);
			var wo = doc.createElement("P");
			wo.innerHTML = "<br>" + rawmsg;

			if (graffiti_debug.length) wo.innerHTML+= '<br>'+graffiti_debug;

			if (udw_Zombies_Known) wo.innerHTML+= '<br>'+udw_Zombies_Known.length+' known zombies';

			bdy.insertBefore(wo, bdy.lastChild.nextSibling);
			}  //  if isDebugEnabled 

	}
};


 function udw_PutAddRemoveOnProfileLinks(ele) {
	if ( !ele ) return;

	var refs = ele.getElementsByTagName('A');

	for (var i=0;i<refs.length;i++) {
		var p = null;
		try { p = refs[i].href.match(/profile\.cgi\?id=(\d+)$/)[1]; }
		catch (e) { }  // alert("udWidget Error while testing for profile id: "+e); }
		if (p) udw_TackAddRemove(refs[i],p);
		}
	}

 function udw_TackAddRemove(ele,pid) {
	if ( !ele ) return;

	var tack = ele.ownerDocument.createElement('SUP');

	tack.innerHTML = '<a target="'+pid+'" href="contacts.cgi?add='+pid+'" title="add contact">+</a>';

	if ( ele.className.length && ele.className.match(/^con/) || ele.innerHTML.match(/class="con/) )
		tack.innerHTML = '<a target="'+pid+'" href="contacts.cgi?c'+pid+'=d" title="remove contact">-</a>';

	ele.parentNode.insertBefore(tack, ele.nextSibling);
	}


 // http://www.dustindiaz.com/getelementsbyclass/
 function getElementsByClass(searchClass,node,tag) {
	var classElements = new Array();
	if ( node == null ) node = document;
	if ( tag == null ) tag = '*';
	var els = node.getElementsByTagName(tag);
	var elsLen = els.length;
	var pattern = new RegExp("\\b"+searchClass+"\\b");
	for (i = 0, j = 0; i < elsLen; i++) {
		if ( pattern.test(els[i].className) ) {
			classElements[j] = els[i];
			j++;
			}
		}
	return classElements;
	}

