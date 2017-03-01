define([
   'esri/units',
   'esri/geometry/Extent',
   "esri/layers/ArcGISDynamicMapServiceLayer",
   'esri/config',
   'esri/tasks/GeometryService',
   'esri/layers/ImageParameters',
    'esri/dijit/Basemap',
   'esri/dijit/BasemapLayer',
   'esri/geometry/Point',
   
], function (units, Extent,ArcGISDynamicMapServiceLayer, esriConfig, GeometryService, ImageParameters, Basemap, BasemapLayer, Point)
{
    
    // url to your proxy page, must be on same machine hosting you app. See proxy folder for readme.
    esriConfig.defaults.io.proxyUrl = 'proxy/proxy.ashx';
    esriConfig.defaults.io.alwaysUseProxy = false;
    // url to your geometry server.
    esriConfig.defaults.geometryService = new GeometryService('http://tasks.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer');

    //image parameters for dynamic services, set to png32 for higher quality exports.
    var imageParameters = new ImageParameters();
    imageParameters.format = 'png32';
    
    return {
        // used for debugging your app
        isDebug: true,

        "theme": "black",
        "toolbarEnabled": true,
        "extentWidgetEnabled": false,
        "searchWidgetEnabled": true,
        "graphicsWidgetEnabled": true,
        "layerControlWidgetEnabled": true,
        "widgetTopOffset": 41,

        //default mapClick mode, mapClickMode lets widgets know what mode the map is in to avoid multipult map click actions from taking place (ie identify while drawing).
        defaultMapClickMode: 'identify',
        // map options, passed to map constructor. see: https://developers.arcgis.com/javascript/jsapi/map-amd.html#map1
        mapOptions: {
            basemap: 'streets',
            center: [-96.59179687497497, 39.09596293629694],
            zoom: 5,
            sliderStyle: 'small'
        },
        panes: {
            left: {
                splitter: true,
                open: 'none'
            },
            right: {
            	id: 'sidebarRight',
            	placeAt: 'outer',
            	region: 'right',
            	splitter: true,
            	collapsible: true
            },
            bottom: {
            	id: 'sidebarBottom',
            	placeAt: 'outer',
            	splitter: true,
            	collapsible: true,
            	region: 'bottom',
            	style: 'height:auto;',
              open:'none',
            	content: '<div id="attributesContainer"></div>'
            },
            top: {
            	id: 'sidebarTop',
            	placeAt: 'outer',
            	collapsible: true,
            	splitter: true,
            	region: 'top'
            }
        },
        operationalLayers: [
         {
             type: 'dynamic',
             url: 'http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/PublicSafety/PublicSafetyOperationalLayers/MapServer',
             title: 'UAT Roads',
             options: {
                 id: 'pwaroads',
                 opacity: 1.0,
                 visible: true,
                 imageParameters: imageParameters
             },
             //identifyLayerInfos: {
             //    layerIds: [0,1,2,3,4,5]
             //},
             legendLayerInfos: {
                 //layerInfo: {
                 //    hideLayers: [21]
                 //}
                 exclude: false
             },
             layerControlLayerInfos: {
                 swipe: true,
                 metadataUrl: true,
                 expanded: true
             }
         }
        ],
        widgets: {
            overviewMap: {
                include: true,
                id: 'overviewMap',
                type: 'map',
                path: 'esri/dijit/OverviewMap',
                options: {
                    map: true,
                    attachTo: 'bottom-right',
                    color: '#0000CC',
                    height: 100,
                    width: 125,
                    opacity: 0.30,
                    visible: false
                }
            },
            scalebar: {
                include: true,
                id: 'scalebar',
                type: 'map',
                path: 'esri/dijit/Scalebar',
                options: {
                    map: true,
                    attachTo: 'bottom-left',
                    scalebarStyle: 'line',
                    scalebarUnit: 'dual'
                }
            },
            navtools: {
                include: true,
                id: 'navTools',
                type: 'domNode',
                path: 'gis/dijit/NavTools',
                title: 'Navigation Tools',
                srcNodeRef: 'toolbarIcon',
                options: {
                    map: true,
                    mapRightClickMenu: true,
                    mapClickMode: true
                }
            },
            homeButton: {
                include: true,
                id: 'homeButton',
                type: 'domNode',
                path: 'esri/dijit/HomeButton',
                srcNodeRef: 'homeButton',
                options: {
                    map: true,
                    extent: new Extent({
                        xmin: 49.584140802647994,
                        ymin: 25.243999597556822,
                        xmax: 52.79594036197187,
                        ymax: 26.496548686784116,
                        spatialReference: {
                            wkid: 4326
                        }
                    })
                }
            },
        },
        toolbarwidgets: {
            toolbar:
			{
			    //include: true,
			    //id: 'toolbarList',
			    showCount: 2,
			    //options: {
			    //    map: true,
			    //}
			},
            search:
			{
				
			},
            graphics:
			{

			},
            layerControl:
            {
                map: map,
                separated: true,
                vectorReorder: true,
                overlayReorder: true,
                //layerInfos:layerInfos,
                layerInfos: [{
                    layer: new ArcGISDynamicMapServiceLayer("http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/PublicSafety/PublicSafetyOperationalLayers/MapServer", {
                        "opacity": 1,
                        visible: false,
                        id: 'qmaps'
                    }),
                    type: 'dynamic',
                    title: 'Qatar Roads',
                    controlOptions: {
                        swipe: true,
                        metadataUrl: true,
                        expanded: true
                        // see Control Options
                    }
                }],
            }
            //extent:
			//{
			//    include: true,
			//    id: 'toolExtent',
			//    options: {
			//        map: true,
			//    }
			//}
        }
    };
});