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
 * The Original Code is cache.
 *
 * The Initial Developer of the Original Code is Max Grivas.
 *
 * Portions created by the Initial Developer are Copyright (C) 2007
 * the Initial Developer. All Rights Reserved.
 *
 * This code is based on the cache code of KYLETHEFEARED found in a UDToolbar development realease
 *  obtained from the CVS mirror at http://www.mozdev.org/source/browse/udtoolbar/src/
 *		http://www.mozdev.org/source/browse/udtoolbar/src/content/Utils/Cache.js?rev=1.3
 *			udtoolbar is normaly found at http://udtoolbar.mozdev.org/
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
 *  Global Data for Cache:
 *		
 *
 */
var udwCache = null;
var udwCacheClient = 'udWidget';
var udw_ZN_CacheKey = 'Known_Zombie_Cache';

/*
 *  Function:	udw_CacheClear(key)
 * 
 * Clear cache entry for the given cache key
 * 
 */
 function udw_CacheClear(cacheKey) {
	var ClientKey = udwCacheClient+'_'+cacheKey;
	var nsICache = Components.interfaces.nsICache;
	var cacheService = Components.classes['@mozilla.org/network/cache-service;1'].getService(Components.interfaces.nsICacheService);
	var httpCacheSession = cacheService.createSession(ClientKey, nsICache.STORE_ANYWHERE, nsICache.STREAM_BASED);

	httpCacheSession.doomEntriesIfExpired = false;
	httpCacheSession.evictEntries();
	//alert('The '+ClientKey+' has been cleared.');
	}  //  udw_CacheClear

/*
 *  Function:	udw_CacheRead(key)
 * 
 * Read the cached data coresponding to the given cache key.
 * 
 * @param	cacheKey	String name of cache entry
 * @return	text		Cache data in string format
 * 
 */
 function udw_CacheRead(cacheKey) {
	var ClientKey = udwCacheClient+'_'+cacheKey;
	var nsICache = Components.interfaces.nsICache;
	var cacheService = Components.classes['@mozilla.org/network/cache-service;1'].getService(Components.interfaces.nsICacheService);
	var httpCacheSession = cacheService.createSession(ClientKey, nsICache.STORE_ANYWHERE, nsICache.STREAM_BASED);
	httpCacheSession.doomEntriesIfExpired = false;

	var text = null;
	var cacheEntryDescriptor;
	try { cacheEntryDescriptor = httpCacheSession.openCacheEntry(cacheKey, nsICache.ACCESS_READ, nsICache.BLOCKING); }
    catch(error) { ; }
	if (cacheEntryDescriptor) {
		var inputStream = cacheEntryDescriptor.openInputStream(0);
		var scriptableStream = Components.classes['@mozilla.org/scriptableinputstream;1'].createInstance(Components.interfaces.nsIScriptableInputStream);
		scriptableStream.init(inputStream);

		text = scriptableStream.read(scriptableStream.available());
		scriptableStream.close();
		inputStream.close();
		cacheEntryDescriptor.close();
		}

	return text;
	}  // udw_CacheRead

/*
 *  Function:	udw_CacheReadXML(key)
 * 
 * Reads cached data and parses to an XML document
 * 
 * @param	cacheKey	String name of cache entry
 * @return	XML			XMLDocument instance containing parsed data from cache
 * 
 */
 function udw_CacheReadXML(cacheKey) {
	var data = udw_CacheRead(cacheKey);
	if (data) {
		var parser = new DOMParser();
		return parser.parseFromString(data, 'text/xml');
		}
	return null;
	}  // udw_CacheReadXML

/*
 *  Function:	udw_CacheWrite(key,data)
 * 
 * Cache data in specified cache entry
 * 
 * @param	cacheKey	String name of cache entry
 * @param	data		String data to cache
 * 
 */
 function udw_CacheWrite(cacheKey, data) {
	var ClientKey = udwCacheClient+'_'+cacheKey;
	var nsICache = Components.interfaces.nsICache;
	var cacheService = Components.classes['@mozilla.org/network/cache-service;1'].getService(Components.interfaces.nsICacheService);
	var httpCacheSession = cacheService.createSession(ClientKey, nsICache.STORE_ANYWHERE, nsICache.STREAM_BASED);
	httpCacheSession.doomEntriesIfExpired = false;

	var cacheEntryDescriptor = httpCacheSession.openCacheEntry(cacheKey, nsICache.ACCESS_WRITE, nsICache.BLOCKING);

	if (cacheEntryDescriptor) {
		if (cacheEntryDescriptor.file) {
			var outputStream = Components.classes['@mozilla.org/network/file-output-stream;1'].createInstance(Components.interfaces.nsIFileOutputStream );
			outputStream.init(cacheEntryDescriptor.file, 0x04 | 0x08 | 0x20, 420, 0);
			outputStream.write(data, data.length);
			outputStream.close();
			}
		var outputStream = cacheEntryDescriptor.openOutputStream(0);
		outputStream.write(data, data.length);

		cacheEntryDescriptor.setMetaDataElement('size', data.length);
		cacheEntryDescriptor.markValid();
		cacheEntryDescriptor.close();
		}
	}  // udw_CacheWrite

/*
 *  Function:	udw_CacheWriteXML(key,data)
 * 
 * Writes a javascript object as XML
 * 
 * @param	cacheKey	String name of cache entry
 * @param	data		Array to write to cache
 * 
 */
 function udw_CacheWriteXML(cacheKey, data) {
	// TODO: Use XML methods to do this
	var begin = '<key id="key">';
	var end = '</key>';

	var root = 'data';
	var rootdtd = new Array();
	var elementsdtd = '';
	var xmlData = '';

	for (key in data) {
		rootdtd.push(key);
		elementsdtd += '<!ELEMENT ' + key + ' (#PCDATA)>' + '<!ATTLIST ' + key + ' id ID #REQUIRED>';
			xmlData += begin.replace(/key/g, key) + data[key] + end.replace(/key/g, key);
		}

	var dtd = '<!DOCTYPE ' + root + '[' + '<!ELEMENT ' + root + ' (' + rootdtd.join(',') + ')>' + elementsdtd + ']>';
	var xml = '<?xml version="1.0" ?>' + dtd + begin.replace(/key/g, root) + xmlData + end.replace(/key/g, root);

	udw_CacheWrite(cacheKey, xml);
	}  // udw_CacheWriteXML

/*
 *  Function:	udw_CacheWriteZombieNamesXML(key,data)
 * 
 * Writes a javascript object as XML
 * 
 * @param	cacheKey	String name of cache entry
 * @param	data		Array to write to cache
 * 
 */
 function udw_CacheWriteZombieNamesXML(cacheKey, data) {
	var zeds= 0;  // zombie counter

	// Make some fake xml
	var fakeXML = '';
		fakeXML += "<?xml version=\"1.0\" encoding=\"iso-8859-1\"?>\n";
		fakeXML += "	<!DOCTYPE zombienames [\n";
		fakeXML += "		<!ELEMENT zombienames (zombie+)>\n";
		fakeXML += "		<!ELEMENT zombie (name,profile,seen)>\n";
		fakeXML += "		<!ELEMENT name  (#PCDATA)>\n";
		fakeXML += "		<!ELEMENT profile (#PCDATA)>\n";
		fakeXML += "		<!ELEMENT seen (#PCDATA)>\n";
		fakeXML += "	]>\n";
				 
		fakeXML += "<zombienames>\n";
	for (l=0; l<data.length ;l++) {

		// needs test for age of seen to toss stale zombies

		fakeXML += "	<zombie>\n";
		fakeXML += "		<name>"+data[l]['name']+"</name>\n";
		fakeXML += "		<profile>"+data[l]['profile']+"</profile>\n";
		fakeXML += "		<seen>"+data[l]['seen']+"</seen>\n";
		fakeXML += "	</zombie>\n";

		zeds++;

		}
		fakeXML += "</zombienames>\n";

	// Don't write empty cache
	// 		Should never happen if data.length
	//			is checked before calling
	if (zeds) udw_CacheWrite(cacheKey, fakeXML);
	}  // udw_CacheWriteZombieNamesXML



/*
 *  Function:	udw_CacheReadZombieNamesXML(key)
 * 
 * Reads a javascript object from XML
 * 
 * @param	cacheKey	String name of cache entry
 * 
 */
 function udw_CacheReadZombieNamesXML(cacheKey) {
	var readNames = null;
	var zRead = null;

	try { zRead = udw_CacheReadXML(cacheKey); }
	catch (e) { if (isDebugEnabled) alert("udWidget Error while reading cache: "+e); }

	if (zRead) {
		var kz = zRead.getElementsByTagName('zombie');
		if (kz && kz.length) {
			readNames = new Array();
			for (var zKid=0;zKid<kz.length;zKid++)  {
				readNames[zKid] = new Array();
				readNames[zKid]['name'] = kz[zKid].getElementsByTagName('name')[0].textContent;
				readNames[zKid]['profile'] = parseInt(kz[zKid].getElementsByTagName('profile')[0].textContent);
				readNames[zKid]['seen'] = parseInt(kz[zKid].getElementsByTagName('seen')[0].textContent);
				}
			}
		}

	return readNames;
	}  // udw_CacheReadZombieNamesXML
