define([
    "dojo/_base/declare",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dijit/form/Button",
    "dojo/dom-class",
    "dojo/_base/lang",
    "dojo/string",
    "dojo/number",
    "dojo/text!./GeoLocation/templates/geoLocationButton.html",
    "esri/InfoTemplate"
    ], function(declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, Button, domClass, lang, string, number,geoLocationTemplate,InfoTemplate) {

    //anonymous function to load CSS files required for this module
    (function() {
        var css = [require.toUrl("gis/dijit/GeoLocation/css/geoLocation.css")];
        var head = document.getElementsByTagName("head").item(0),
            link;
        for(var i = 0, il = css.length; i < il; i++) {
            link = document.createElement("link");
            link.type = "text/css";
            link.rel = "stylesheet";
            link.href = css[i].toString();
            head.appendChild(link);
        }
    }());

    // main geolocation widget
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        templateString: geoLocationTemplate,
        widgetsInTemplate: true,
        baseClass: 'widget_GeoLocation',
        buttonClass: 'geoLocationButton',
        postCreate: function() {
            this.inherited(arguments);
            domClass.add(this.geoLocButton.domNode, "geoLocationIcon "+this.theme);
            this.symbol = new esri.symbol.PictureMarkerSymbol(require.toUrl("widgets/GeoLocation/images/pointer.png"), 30, 30);
            this.graphics = new esri.layers.GraphicsLayer({
                id: 'GeoLocationGraphics',
                title: "GPS Location"
            });
            this.map.addLayer(this.graphics);
        },
        geoLocate: function() {
            if(navigator && navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(lang.hitch(this, 'locationSuccess'), lang.hitch(this, 'locationError'));
            } else {
                alert("Geolocation not supported by your browser."); 
            }
        },
        locationSuccess: function(event) {
            this.graphics.clear();
            var point = esri.geometry.Point(event.coords.longitude, event.coords.latitude, new esri.SpatialReference({
                wkid: 4326
            }));
            var wmPoint = esri.geometry.geographicToWebMercator(point);
            this.map.centerAndZoom(wmPoint, 14);
                    
            var stats = {
                    accuracy: (event.coords.accuracy) ? event.coords.accuracy : '',
                    altitude: (event.coords.altitude) ? event.coords.altitude : '',
                    altitudeAccuracy: (event.coords.altitudeAccuracy) ? event.coords.altitudeAccuracy : '',
                    heading: (event.coords.heading) ? event.coords.heading : '',
                    latitude: (event.coords.latitude) ? number.round(event.coords.latitude,4) : '',
                    longitude: (event.coords.longitude) ? number.round(event.coords.longitude,4) : '',
                    speed: (event.coords.speed) ? event.coords.speed : ''
                };
                
            var infoTemplate = new esri.InfoTemplate();
			infoTemplate.setTitle("Location Information");
			var contentString = "Latitude: ${latitude}<br>Longitude: ${longitude}<br>Heading:${heading}<br>Speed:${speed}<br>Accuracy:${accuracy}<br>Altitude:${altitude}<br>Altitude Accuracy:${altitudeAccuracy}"
			infoTemplate.setContent(contentString);
            
            var graphic = new esri.Graphic(wmPoint, this.symbol, stats, infoTemplate);
 			this.graphics.add(graphic);
 			var screenPnt = this.map.toScreen(wmPoint);
 			this.map.infoWindow.setTitle("Location Information");
 			this.map.infoWindow.setContent("Latitude: "+number.round(event.coords.latitude,4)+"<br>Longitude: "+number.round(event.coords.longitude,4)+"<br>Heading:"+event.coords.heading+"<br>Speed:"+event.coords.speed+"<br>Accuracy:"+event.coords.accuracy+"<br>Altitude:"+event.coords.altitude+"<br>Altitude Accuracy:"+event.coords.altitudeAccuracy);
            this.map.infoWindow.resize(200,150);           
            this.map.infoWindow.show(wmPoint,this.map.getInfoWindowAnchor(wmPoint));
         
        },
        locationError: function(error) {
        	alert("There was a problem with getting your location: " + error.message);
        }
    });
});