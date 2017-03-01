define([], function () {
    //Default configuration settings for the applciation. This is where you'll define things like a bing maps key, 
    //default web map, default app color theme and more. These values can be overwritten by template configuration settings
    //and url parameters.
    var defaults = {
        "appid": "",
        "webmap": "02b2281cfe0142c79d3c4309584ac492", // "46ac6f5955854ebfbd60bd6f0ac102b4", "02b2281cfe0142c79d3c4309584ac492"
        "oauthappid": null, //"AFTKRmv16wj14N3z",
        //Group templates must support a group url parameter. This will contain the id of the group. 
        //group: "",
        //Enter the url to the proxy if needed by the applcation. See the 'Using the proxy page' help topic for details
        //http://developers.arcgis.com/en/javascript/jshelp/ags_proxy.html
        "proxyurl": "",
        //Example of a template specific property. If your template had several color schemes
        //you could define the default here and setup configuration settings to allow users to choose a different
        //color theme.  
        "theme": "black",
        "bingmapskey": "", //Enter the url to your organizations bing maps key if you want to use bing basemaps
        "sharinghost": location.protocol + "//" + "www.arcgis.com", //Defaults to arcgis.com. Set this value to your portal or organization host name. 
        //all widgets
        "widgetTopOffset": 41,
        //header template dynamic configuration
        "headerEnabled": true,
        "title": "",
        "subtitle": "",
        "logo": "",
        //legend dynamic configuration
        "legendEnabled": true,
        //baseSwitcher dynamic configuration
        "baseswitcherEnabled": true,
        //geocode location dynamic configuration
        "geocodeEnabled": true,
        //get GPS location
        "geolocationEnabled": true,
        "toolbarEnabled": true,
        "extentWidgetEnabled": true,
        "searchWidgetEnabled": true,
        widgets:
		{
		    header:
			{
			    title: "darcMap",
			    subtitle: "Pocket Map Template",
			    logo: "js/widgets/Header/images/logo_sm.png"
			},
		    legend:
			{
			    topOffset: 41
			},
		    baseswitcher:
			{
			    topOffset: 41,
			    bingmapskey: null,
			    basemapgroup:
			 	{
			 	    title: null,
			 	    owner: null
			 	}
			},
		    geocode:
			{
			},
		    toolbar:
			{
			    showCount: 2
			},
		    search:
			{

			}
		}
    };
    return defaults;
});