define([
	'esri/map',
    "esri/layers/ArcGISDynamicMapServiceLayer",
	'dojo/dom',
    'dojo/ready',
	'dojo/dom-style',
	'dojo/dom-geometry',
	'dojo/dom-class',
    "dojo/dom-construct",
	'dojo/on',
	'dojo/_base/array',
	'dijit/layout/BorderContainer',
	'dijit/layout/ContentPane',
	'gis/dijit/FloatingTitlePane',
	'dojo/_base/lang',
	'dojo/text!./templates/mapOverlay.html',
	'gis/dijit/FloatingWidgetDialog',
    'gis/dijit/toolbarWidget',
    'gis/dijit/searchWidget',
    'gis/dijit/graphicsWidget',
    'gis/dijit/extentWidget',
    'gis/dijit/LayerControl',
    "esri/dijit/HomeButton",
	'put-selector',
	'dojo/aspect',
	'dojo/has',
	'dojo/topic',
	'esri/dijit/PopupMobile',
	'dijit/Menu',
    'esri/geometry/webMercatorUtils',
    'dojox/layout/FloatingPane',
    'dojox/layout/Dock',
	'esri/IdentityManager'
], function (Map,ArcGISDynamicMapServiceLayer, dom,ready, domStyle, domGeom, domClass,domConstruct, on, array, BorderContainer, ContentPane, FloatingTitlePane, lang, mapOverlay,
    FloatingWidgetDialog, ToolbarWidget, SearchWidget, GraphicsWidget, ExtentWidget, LayerControl,HomeButton,
    put, aspect, has, topic, PopupMobile, Menu, webMercatorUtils, FloatingPane, Dock) {

    var toolbarWidgets = [];

    return {
        legendLayerInfos: [],
        editorLayerInfos: [],
        identifyLayerInfos: [],
        layerControlLayerInfos: [],
        panes: {
            left: {
                id: 'sidebarLeft',
                placeAt: 'outer',
                collapsible: true,
                region: 'left'
            },
            center: {
                id: 'mapCenter',
                placeAt: 'outer',
                region: 'center',
                content: mapOverlay
            },
            
        },
        collapseButtons: {},
        config: {},
        startup: function (config) {
            //debugger;
            global_theme = config.theme;
            var ss = document.createElement("link");
            ss.type = "text/css";
            ss.rel = "stylesheet";
            ss.href = "css/" + global_theme + ".css";
            document.getElementsByTagName("head")[0].appendChild(ss);
            //config will contain application and user defined info for the template such as i18n strings, the web map id
            // and application id
            // any url parameters and any application specific configuration information. 
            this.config = config;
            //ready(lang.hitch(this, function () {
            //    this.initMap();
            //}));

            this.config = config;
            this.mapClickMode = {
                current: config.defaultMapClickMode,
                defaultMode: config.defaultMapClickMode
            };
            // simple feature detection. kinda like dojox/mobile without the overhead
            if (has('touch') && (has('ios') || has('android') || has('bb'))) {
                has.add('mobile', true);
                if (screen.availWidth < 500 || screen.availHeight < 500) {
                    has.add('phone', true);
                } else {
                    has.add('tablet', true);
                }
            }
            if (config.titles) {
                this.addTitles();
            }
            this.addTopics();
            //this.initPanes();
            this.initMap();

            if (config.isDebug) {
                window.app = this; //dev only
            }
        },
        // add topics for subscribing and publishing
        addTopics: function () {
            // toggle a sidebar pane
            topic.subscribe('viewer/togglePane', lang.hitch(this, function (args) {
                this.togglePane(args.pane, args.show);
            }));

            // load a widget
            topic.subscribe('viewer/loadWidget', lang.hitch(this, function (args) {
                this.widgetLoader(args.options, args.position);
            }));

            // setup error handler. centralize the debugging
            if (this.config.isDebug) {
                topic.subscribe('viewer/handleError', lang.hitch(this, 'handleError'));
            }

            // set the current mapClickMode
            topic.subscribe('mapClickMode/setCurrent', lang.hitch(this, function (mode) {
                this.mapClickMode.current = mode;
                topic.publish('mapClickMode/currentSet', mode);
            }));

            // set the current mapClickMode to the default mode
            topic.subscribe('mapClickMode/setDefault', lang.hitch(this, function () {
                topic.publish('mapClickMode/setCurrent', this.mapClickMode.defaultMode);
            }));

        },
        // set titles (if any)
        addTitles: function () {
            var titles = this.config.titles;
            if (titles.header) {
                var headerTitleNode = dom.byId('headerTitleSpan');
                if (headerTitleNode) {
                    headerTitleNode.innerHTML = titles.header;
                }
            }
            if (titles.subHeader) {
                var subHeaderTitle = dom.byId('subHeaderTitleSpan');
                if (subHeaderTitle) {
                    subHeaderTitle.innerHTML = titles.subHeader;
                }
            }
            if (titles.pageTitle) {
                document.title = titles.pageTitle;
            }
        },
        // setup all the sidebar panes
        initPanes: function () {
            //debugger;
            var key, panes = this.config.panes || {};
            for (key in this.panes) {
                if (this.panes.hasOwnProperty(key)) {
                    panes[key] = lang.mixin(this.panes[key], panes[key]);
                }
            }

            this.panes.outer = new BorderContainer({
                id: 'borderContainerOuter',
                design: 'sidebar',
                gutters: false
            }).placeAt(document.body);

            var options, placeAt, type;
            for (key in panes) {
                if (panes.hasOwnProperty(key)) {
                    options = lang.clone(panes[key]);
                    placeAt = this.panes[options.placeAt] || this.panes.outer;
                    options.id = options.id || key;
                    type = options.type;
                    delete options.placeAt;
                    delete options.type;
                    delete options.collapsible;
                    if (placeAt) {
                        if (type === 'border') {
                            this.panes[key] = new BorderContainer(options).placeAt(placeAt);
                        } else if (options.region) {
                            this.panes[key] = new ContentPane(options).placeAt(placeAt);
                        }
                    }
                }
            }
            this.panes.outer.startup();
            this.initMap();
            // where to place the buttons
            // either the center map pane or the outer pane?
            this.collapseButtonsPane = this.config.collapseButtonsPane || 'outer';

            for (key in panes) {
                if (panes.hasOwnProperty(key)) {
                    if (panes[key].collapsible) {
                        this.collapseButtons[key] = put(this.panes[this.collapseButtonsPane].domNode, 'div.sidebarCollapseButton.sidebar' + key + 'CollapseButton.sidebarCollapseButton' + ((key === 'bottom' || key === 'top') ? 'Vert' : 'Horz') + ' div.dijitIcon.button.close').parentNode;
                        on(this.collapseButtons[key], 'click', lang.hitch(this, 'togglePane', key));
                        this.positionSideBarToggle(key);
                        if (this.collapseButtonsPane === 'outer') {
                            var splitter = this.panes[key]._splitterWidget;
                            if (splitter) {
                                aspect.after(splitter, '_startDrag', lang.hitch(this, 'splitterStartDrag', key));
                                aspect.after(splitter, '_stopDrag', lang.hitch(this, 'splitterStopDrag', key));
                            }
                        }
                        if (panes[key].open !== undefined) {
                            this.togglePane(key, panes[key].open);
                        }
                    }
                    if (key !== 'center' && this.panes[key]._splitterWidget) {
                        domClass.add(this.map.root.parentNode, 'pane' + key);
                        if (key === 'right' && this.panes.top) {
                            domClass.add(this.panes.top.domNode, 'pane' + key);
                        }
                        if (key === 'right' && this.panes.bottom) {
                            domClass.add(this.panes.bottom.domNode, 'pane' + key);
                        }
                        if (key === 'left' && this.panes.top) {
                            domClass.add(this.panes.top.domNode, 'pane' + key);
                        }
                        if (key === 'left' && this.panes.bottom) {
                            domClass.add(this.panes.bottom.domNode, 'pane' + key);
                        }
                    }
                }
            }

            // respond to media query changes
            // matchMedia works in most browsers (http://caniuse.com/#feat=matchmedia)
            if (window.matchMedia) {
                window.matchMedia('(max-width: 991px)').addListener(lang.hitch(this, 'repositionSideBarButtons'));
                window.matchMedia('(max-width: 767px)').addListener(lang.hitch(this, 'repositionSideBarButtons'));
            }

            this.panes.outer.resize();
        },
        initMap: function () {
            //debugger;
            
            if (has('phone') && !this.config.mapOptions.infoWindow) {
                this.config.mapOptions.infoWindow = new PopupMobile(null, put('div'));
            }
            this.map = new Map('map', this.config.mapOptions);
            
            if (this.config.mapOptions.basemap) {
                this.map.on('load', lang.hitch(this, 'initLayers'));
            } else {
                this.initLayers();
            }
            if (this.config.operationalLayers && this.config.operationalLayers.length > 0) {
                //on.once(this.map, 'layers-add-result', lang.hitch(this, 'loadtoolbarWidgets'));
                on.once(this.map, 'layers-add-result', lang.hitch(this, 'initWidgets'));
            } else {
                //this.loadtoolbarWidgets();
                this.initWidgets();
            }
            //this.loadtoolbarWidgets();

            var home = new HomeButton({
                map: this.map
            }, "HomeButton");
            home.startup();

            this.map.on('mouse-move, mouse-drag', lang.hitch(this, 'showCoordinates'));
        },
        showCoordinates: function (evt) {
            //var wkid = this.map.spatialReference.wkid;
            //the map is in web mercator but display coordinates in geographic (lat, long)
            var mp = webMercatorUtils.webMercatorToGeographic(evt.mapPoint);
            //var mp = webMercatorUtils.geographicToWebMercator(evt.mapPoint);
            //display mouse coordinates
            // LONG = X AND LAT = Y
            // NORTHING = Y AND EASTING = X
            //dom.byId("info").innerHTML = "Long= " + mp.x.toFixed(2) + ", " + "Lat= " + mp.y.toFixed(2);
            dom.byId("info").innerHTML = "Long= " + evt.mapPoint.x.toFixed(2) + ", " + "Lat= " + evt.mapPoint.y.toFixed(2);
        },
        initLayers: function () {
            this.map.on('resize', function (evt) {
                var pnt = evt.target.extent.getCenter();
                setTimeout(function () {
                    evt.target.centerAt(pnt);
                }, 100);
            });
            debugger;
            this.layers = [];
            var layerTypes = {
                csv: 'CSV',
                dataadapter: 'DataAdapterFeature', //untested
                dynamic: 'ArcGISDynamicMapService',
                feature: 'Feature',
                georss: 'GeoRSS',
                image: 'ArcGISImageService',
                imagevector: 'ArcGISImageServiceVector',
                kml: 'KML',
                label: 'Label', //untested
                mapimage: 'MapImage', //untested
                osm: 'OpenStreetMap',
                raster: 'Raster',
                stream: 'Stream',
                tiled: 'ArcGISTiledMapService',
                webtiled: 'WebTiled',
                wms: 'WMS',
                wmts: 'WMTS' //untested
            };
            // loading all the required modules first ensures the layer order is maintained
            var modules = [];
            array.forEach(this.config.operationalLayers, function (layer) {
                var type = layerTypes[layer.type];
                if (type) {
                    modules.push('esri/layers/' + type + 'Layer');
                } else {
                    this.handleError({
                        source: 'Controller',
                        error: 'Layer type "' + layer.type + '"" isnot supported: '
                    });
                }
            }, this);
            require(modules, lang.hitch(this, function () {
                array.forEach(this.config.operationalLayers, function (layer) {
                    var type = layerTypes[layer.type];
                    if (type) {
                        require(['esri/layers/' + type + 'Layer'], lang.hitch(this, 'initLayer', layer));
                    }
                }, this);
                this.map.addLayers(this.layers);
            }));
            
        },
        initLayer: function (layer, Layer) {
            debugger;
            var l = new Layer(layer.url, layer.options);
            this.layers.unshift(l); //unshift instead of push to keep layer ordering on map intact
            //Legend LayerInfos array
            var excludeLayerFromLegend = false;
            if (typeof layer.legendLayerInfos !== 'undefined' && typeof layer.legendLayerInfos.exclude !== 'undefined') {
                excludeLayerFromLegend = layer.legendLayerInfos.exclude;
            }
            if (!excludeLayerFromLegend) {
                var configuredLayerInfo = {};
                if (typeof layer.legendLayerInfos !== 'undefined' && typeof layer.legendLayerInfos.layerInfo !== 'undefined') {
                    configuredLayerInfo = layer.legendLayerInfos.layerInfo;
                }
                var layerInfo = lang.mixin({
                    layer: l,
                    title: layer.title || null
                }, configuredLayerInfo);
                this.legendLayerInfos.unshift(layerInfo); //unshift instead of push to keep layer ordering in legend intact
            }
            //LayerControl LayerInfos array
            this.layerControlLayerInfos.unshift({ //unshift instead of push to keep layer ordering in LayerControl intact
                layer: l,
                type: layer.type,
                title: layer.title,
                controlOptions: layer.layerControlLayerInfos
            });
            if (layer.type === 'feature') {
                var options = {
                    featureLayer: l
                };
                if (layer.editorLayerInfos) {
                    lang.mixin(options, layer.editorLayerInfos);
                }
                if (options.exclude !== true) {
                    this.editorLayerInfos.push(options);
                }
            }
            if (layer.type === 'dynamic' || layer.type === 'feature') {
                var idOptions = {
                    layer: l,
                    title: layer.title
                };
                if (layer.identifyLayerInfos) {
                    lang.mixin(idOptions, layer.identifyLayerInfos);
                }
                if (idOptions.exclude !== true) {
                    this.identifyLayerInfos.push(idOptions);
                }
            }
        },
        initWidgets: function () {
            
            var widgets = [],
				paneWidgets;

            for (var key in this.config.widgets) {
                if (this.config.widgets.hasOwnProperty(key)) {
                    var widget = lang.clone(this.config.widgets[key]);
                    if (widget.include) {
                        widget.position = ('undefined' !== typeof (widget.position)) ? widget.position : 10000;
                        widgets.push(widget);
                    }
                }
            }

            //debugger;
            for (var pane in this.panes) {
                if (this.panes.hasOwnProperty(pane) && (pane !== 'outer' || pane !== 'center')) {
                    paneWidgets = array.filter(widgets, function (widget) {
                        return (widget.placeAt && widget.placeAt === pane);
                    });
                    paneWidgets.sort(function (a, b) {
                        return a.position - b.position;
                    });
                    array.forEach(paneWidgets, function (widget, i) {
                        this.widgetLoader(widget, i);
                    }, this);
                }
            }
            paneWidgets = array.filter(widgets, function (widget) {
                return !widget.placeAt;
            });
            paneWidgets.sort(function (a, b) {
                return a.position - b.position;
            });

            array.forEach(paneWidgets, function (widget, i) {
                this.widgetLoader(widget, i);
            }, this);

            debugger;
            this.loadtoolbarWidgets();
            // toolbarWidgets
            //for (var key in this.config.toolbarwidgets) {
            //    if (this.config.toolbarwidgets.hasOwnProperty(key)) {
            //        var toolwidget = lang.clone(this.config.toolbarwidgets[key]);
            //        if (toolwidget.include) {
            //            toolbarWidgets.push(toolwidget);
            //        }
            //    }
            //}
            //array.forEach(toolbarWidgets, function (toolwidget,i) {
            //    this.loadtoolbarWidgets(toolwidget,i);
            //}, this);

            // Create FloatingPane widget
            //var fltMeasure = new FloatingTitlePane({
            //    canFloat:true,
            //    isFloating: true,
            //    isDragging: true,
            //    //dragDelay: 3,
            //    resizable: true,
            //    isResizing:false
            //}, "toolMeasurement");
            //fltMeasure.startup();
        },
        togglePane: function (id, show) {
            if (!this.panes[id]) {
                return;
            }
            var domNode = this.panes[id].domNode;
            if (domNode) {
                var disp = (show && typeof (show) === 'string') ? show : (domStyle.get(domNode, 'display') === 'none') ? 'block' : 'none';
                domStyle.set(domNode, 'display', disp);
                if (this.panes[id]._splitterWidget) { // show/hide the splitter, if found
                    domStyle.set(this.panes[id]._splitterWidget.domNode, 'display', disp);
                }
                this.positionSideBarToggle(id);
                if (this.panes.outer) {
                    this.panes.outer.resize();
                }
            }
        },
        positionSideBarToggle: function (id) {
            var pane = this.panes[id];
            var btn = this.collapseButtons[id];
            if (!pane || !btn) {
                return;
            }
            var disp = domStyle.get(pane.domNode, 'display');
            var rCls = (disp === 'none') ? 'close' : 'open';
            var aCls = (disp === 'none') ? 'open' : 'close';
            domClass.remove(btn.children[0], rCls);
            domClass.add(btn.children[0], aCls);

            // extra management required when the buttons
            // are not in the center map pane
            if (this.collapseButtonsPane === 'outer') {
                var pos = (pane._splitterWidget) ? 0 : -1;
                var orie = (id === 'bottom' || id === 'top') ? 'h' : 'w';
                if (disp === 'block') { // pane is open
                    pos += domGeom.getMarginBox(pane.domNode)[orie];
                }
                if (pane._splitterWidget) { // account for a splitter
                    pos += domGeom.getMarginBox(pane._splitterWidget.domNode)[orie];
                }
                domStyle.set(btn, id, pos.toString() + 'px');
                domStyle.set(btn, 'display', 'block');
            }
        },
        repositionSideBarButtons: function () {
            var btns = ['left', 'right', 'top', 'bottom'];
            array.forEach(btns, lang.hitch(this, function (id) {
                this.positionSideBarToggle(id);
            }));
        },

        // extra management of splitters required when the buttons
        // are not in the center map pane
        splitterStartDrag: function (id) {
            var btn = this.collapseButtons[id];
            domStyle.set(btn, 'display', 'none');
        },
        splitterStopDrag: function (id) {
            this.positionSideBarToggle(id);
        },

        _createTitlePaneWidget: function (parentId, title, position, open, canFloat, placeAt) {
            debugger;
            var tp, options = {
                title: title || 'Widget',
                open: open || false,
                canFloat: canFloat || false
            };
            if (parentId) {
                options.id = parentId;
            }
            if (typeof (placeAt) === 'string') {
                placeAt = this.panes[placeAt];
            }
            if (!placeAt) {
                placeAt = this.panes.left;
            }
            //if (!placeAt) {
            //    var container = domConstruct.create('div', { id: "measureWidgetDiv", class: "gis_DrawDijit" });
            //    domConstruct.place(container, this.map.root);
            //    placeAt = container;//this.panes.left;
            //}
            if (placeAt) {
                options.sidebar = placeAt;
                tp = new FloatingTitlePane(options).placeAt(placeAt, position);
                tp.startup();
            }
            return tp;
        },
        _createFloatingWidget: function (parentId, title) {
            var options = {
                title: title
            };
            if (parentId) {
                options.id = parentId;
            }
            var fw = new FloatingWidgetDialog(options);
            fw.startup();
            return fw;
        },
        _createContentPaneWidget: function (parentId, title, className, region, placeAt) {
            var cp, options = {
                title: title,
                region: region || 'center'
            };
            if (className) {
                options.className = className;
            }
            if (parentId) {
                options.id = parentId;
            }
            if (!placeAt) {
                placeAt = this.panes.sidebar;
            } else if (typeof (placeAt) === 'string') {
                placeAt = this.panes[placeAt];
            }
            if (placeAt) {
                cp = new ContentPane(options).placeAt(placeAt);
                cp.startup();
            }
            return cp;
        },
        widgetLoader: function (widgetConfig, position) {
            debugger;
            var parentId, pnl;
            // only proceed for valid widget types
            var widgetTypes = ['titlePane', 'contentPane', 'floating', 'domNode', 'invisible', 'map'];
            if (array.indexOf(widgetTypes, widgetConfig.type) < 0) {
                this.handleError({
                    source: 'Controller',
                    error: 'Widget type "' + widgetConfig.type + '" (' + widgetConfig.title + ') at position ' + position + ' is not supported.'
                });
                return;
            }

            // build a titlePane or floating widget as the parent
            if ((widgetConfig.type === 'titlePane' || widgetConfig.type === 'contentPane' || widgetConfig.type === 'floating') && (widgetConfig.id && widgetConfig.id.length > 0)) {
                parentId = widgetConfig.id + '_parent';
                if (widgetConfig.type === 'titlePane') {
                    pnl = this._createTitlePaneWidget(parentId, widgetConfig.title, position, widgetConfig.open, widgetConfig.canFloat, widgetConfig.placeAt);
                } else if (widgetConfig.type === 'contentPane') {
                    pnl = this._createContentPaneWidget(parentId, widgetConfig.title, widgetConfig.className, widgetConfig.region, widgetConfig.placeAt);
                } else if (widgetConfig.type === 'floating') {
                    pnl = this._createFloatingWidget(parentId, widgetConfig.title);
                }
                widgetConfig.parentWidget = pnl;
            }
            // 2 ways to use require to accommodate widgets that may have an optional separate configuration file
            if (typeof (widgetConfig.options) === 'string') {
                require([widgetConfig.options, widgetConfig.path], lang.hitch(this, 'createWidget', widgetConfig));
            } else {
                require([widgetConfig.path], lang.hitch(this, 'createWidget', widgetConfig, widgetConfig.options));
            }

            

                //this.createFloatingPane('mainwindow', "Measure", 100, 100, 400, 500);
        },
        createFloatingPane: function (divId, title, x, y, width, height) {
            var pane = new FloatingPane({
                'title': title,
                'id': divId + "_floater",
                'closeable': true,
                'resizable': true,
                'dockable': false
            }, divId);
            pane.domNode.style.left = x + "px";
            pane.domNode.style.top = y + "px";
            pane.resize({ 'w': width, 'h': height });

            pane.startup();

            return pane;
        },
        loadtoolbarWidgets: function (widgetConfig, position) {
            debugger;
            var toolbarWidgetList = [];
            var tabWidgetIndex = 1;
            var toolbarEnabled = this.config.toolbarEnabled;
            if (this.config.searchWidgetEnabled == true) {
                var container = domConstruct.create('div', { id: "searchWidgetDiv", class: "toolbarButton" });
                domConstruct.place(container, this.map.container);
                this.searchWidget = new SearchWidget({
                    map: this.map,
                    theme: this.config.theme,
                    config: this.config.toolbarwidgets.search
                }, container);
                this.searchWidget.startup();
                toolbarWidgetList.push(this.searchWidget);
            }
            if (this.config.graphicsWidgetEnabled == true) {
                var container = domConstruct.create('div', { id: "graphicsWidgetDiv", class: "toolbarButton" });
                domConstruct.place(container, this.map.container);
                this.graphicsWidget = new GraphicsWidget({
                    map: this.map,
                    theme: this.config.theme,
                    config: this.config.toolbarwidgets.graphics
                }, container);
                this.graphicsWidget.startup();
                toolbarWidgetList.push(this.graphicsWidget);
            }
            if (this.config.extentWidgetEnabled == true) {
                var container = domConstruct.create('div', { id: "extentWidgetDiv", class: "toolbarButton" });
                domConstruct.place(container, this.map.container);
                this.extentWidget = new ExtentWidget({
                    map: this.map
                }, container);
                this.extentWidget.startup();
                toolbarWidgetList.push(this.extentWidget);
            }
            debugger;
            var layerInfos = this.layerControlLayerInfos;
            if (this.config.layerControlWidgetEnabled == true)
            {
                var container = domConstruct.create('div', { id: "layerControlWidgetDiv", class: "toolbarButton" });
                domConstruct.place(container, this.map.container);
                this.layerControlWidget = new LayerControl({
                    map: this.map,
                    theme: this.config.theme,
                    //separated: true,
                    //vectorReorder: true,
                    //overlayReorder: true,
                    ////layerInfos:layerInfos,
                    //layerInfos: [{
                    //    layer: new ArcGISDynamicMapServiceLayer("http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/PublicSafety/PublicSafetyOperationalLayers/MapServer", {
                    //        "opacity": 1,
                    //        visible: true,
                    //        id: 'qmaps',
                    //    }),
                    //    type: 'dynamic',
                    //    title: 'Qatar Roads',
                    //    controlOptions: {
                    //        swipe: true,
                    //        metadataUrl: true,
                    //        expanded: true
                    //        // see Control Options
                    //    }
                    //}],
                    config: this.config.toolbarwidgets.layerControl
                    // see LayerInfos
                }, container);
                this.layerControlWidget.startup();
                toolbarWidgetList.push(this.layerControlWidget);
            }
            if (toolbarEnabled == true) {
                this.toolbar = new ToolbarWidget({
                    map: this.map,
                    widgets: toolbarWidgetList,
                    showCount: this.config.toolbarwidgets.toolbar.showCount
                }, "toolbarWidgetDiv");
                this.toolbar.startup();
            }
        },
        createWidget: function (widgetConfig, options, WidgetClass) {
            debugger;
            // set any additional options
            options.id = widgetConfig.id + '_widget';
            options.parentWidget = widgetConfig.parentWidget;

            //replace config map, layerInfos arrays, etc
            if (options.map) {
                options.map = this.map;
            }
            if (options.mapRightClickMenu) {
                // create right-click menu
                if (!this.mapRightClickMenu) {
                    this.mapRightClickMenu = new Menu({
                        targetNodeIds: [this.map.root],
                        selector: '.layersDiv' // restrict to map only
                    });
                    this.mapRightClickMenu.startup();
                }
                options.mapRightClickMenu = this.mapRightClickMenu;
            }
            if (options.mapClickMode) {
                options.mapClickMode = this.mapClickMode.current;
            }
            if (options.legendLayerInfos) {
                options.layerInfos = this.legendLayerInfos;
            }
            if (options.layerControlLayerInfos) {
                options.layerInfos = this.layerControlLayerInfos;
            }
            if (options.editorLayerInfos) {
                options.layerInfos = this.editorLayerInfos;
            }
            if (options.identifyLayerInfos) {
                options.layerInfos = this.identifyLayerInfos;
            }

            // create the widget
            var pnl = options.parentWidget;
            if ((widgetConfig.type === 'titlePane' || widgetConfig.type === 'contentPane' || widgetConfig.type === 'floating')) {
                this[widgetConfig.id] = new WidgetClass(options, put('div')).placeAt(pnl.containerNode);
            } else if (widgetConfig.type === 'domNode') {
                debugger;
                this[widgetConfig.id] = new WidgetClass(options, widgetConfig.srcNodeRef);
            } else {
                this[widgetConfig.id] = new WidgetClass(options);
            }

            // start up the widget
            if (this[widgetConfig.id] && this[widgetConfig.id].startup && !this[widgetConfig.id]._started) {
                this[widgetConfig.id].startup();
            }
        },
        //centralized error handler
        handleError: function (options) {
            if (this.config.isDebug) {
                if (typeof (console) === 'object') {
                    for (var option in options) {
                        if (options.hasOwnProperty(option)) {
                            console.log(option, options[option]);
                        }
                    }
                }
            } else {
                // add growler here?
                return;
            }
        }
    };
});