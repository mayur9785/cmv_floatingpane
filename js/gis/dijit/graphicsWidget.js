define(["dojo/_base/declare",
"gis/dijit/floatWidgetBase",
"dijit/_WidgetBase",
"dijit/_TemplatedMixin",
"dijit/_WidgetsInTemplateMixin",
"dojo/dom-construct",
"dojo/dom-class",
"esri/request",
"esri/tasks/query",
"esri/tasks/QueryTask",
"dojo/text!./Graphics/templates/button.html",
"dojo/text!./Graphics/templates/widget.html",
'dojo/_base/lang',
'dojo/_base/Color',
'esri/toolbars/draw',
'esri/layers/GraphicsLayer',
'esri/graphic',
'esri/renderers/SimpleRenderer',
'esri/renderers/UniqueValueRenderer',
   'esri/symbols/SimpleMarkerSymbol',
   'esri/symbols/SimpleLineSymbol',
   'esri/symbols/SimpleFillSymbol',
   'esri/layers/FeatureLayer',
   'dojo/topic',
   'dojo/aspect',
    'dojo/i18n!./Graphics/nls/resource',
    "dojo/dom",
    'dijit/form/Button',
    'xstyle/css!./Graphics/css/graphics.css',
   'xstyle/css!./Graphics/css/adw-icons.css',
"dijit/form/Select"
]
,function(declare,floatWidgetBase, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, domConstruct, domClass, 
	esriRequest, Query, QueryTask,buttonTemplate, widgetTemplate,lang, Color, Draw, GraphicsLayer,Graphic, SimpleRenderer,
    UniqueValueRenderer, SimpleMarkerSymbol, SimpleLineSymbol, SimpleFillSymbol, FeatureLayer,topic, aspect,i18n, dom)
{ 
    (function () {
        var css = [require.toUrl("gis/dijit/Graphics/css/graphics.css")];
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
    
    var graphicsButton = declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], 
	{
		widgetsInTemplate: true,
        templateString: buttonTemplate,
        baseClass: 'widget_Graphics',
        buttonClass: 'toolbarButton',
        postCreate: function() 
        	{
            debugger;
	           	//initialize the widget
	            this.inherited(arguments);
	            domClass.add(this.toolbarButton.domNode);//, "toolbarButtonIcon "+this.theme);
	            var props = { map: this.map, theme: this.theme, config: this.config};
            	this.widget = new floatWidget(props);
            	this.widget.startup();
	        },
	    toggleWidget:function()
	    {
	        //debugger;
	    	if (this.widget.visible)
	    		this.widget.close();
	    	else
	    		this.widget.show();
	    }
	});
    
    var floatWidget = declare([floatWidgetBase], 
		{
            
			widgetsInTemplate: false,
			baseClass: 'widget_Graphics',
        	title: 'Draw',
        	postCreate: function() 
        	{
        	    debugger;
        		this.inherited(arguments);
        		console.log("graphics");
        	    this.floatIconStyle+=" "+this.theme;
        		//this.floatIconStyle = 'fa fa-paint-brush';
        		this.top=100;
        		this.left = 100;
        	    this.resizable = false,
        		this.contentHeight=230;
        		this.contentWidth =300;
        		this.initFloat();
        		this.initUI();
        	},
        	initUI:function()
        	{
        		var props = {parentContainer: this.floatingPane.containerNode,map:this.map};
            	this.ui = new graphicsWidgetUI(props);
            	this.ui.startup();
        	}
        	
		});
		
    var graphicsWidgetUI = declare("", [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
		    templateString: widgetTemplate, 
		    widgetsInTemplate: true,
		    baseClass: 'widget_Graphics_ui',
		    i18n: i18n,
		    drawToolbar: null,
		    mapClickMode: null,
		    postCreate: function () {
		        //debugger;
    	        this.inherited(arguments);
    	        this.drawToolbar = new Draw(this.map);
    	        this.drawToolbar.on('draw-end', lang.hitch(this, 'onDrawToolbarDrawEnd'));

    	        this.createGraphicLayers();

    	        this.own(topic.subscribe('mapClickMode/currentSet', lang.hitch(this, 'setMapClickMode')));
    	        if (this.parentWidget && this.parentWidget.toggleable) {
    	            this.own(aspect.after(this.parentWidget, 'toggle', lang.hitch(this, function () {
    	                this.onLayoutChange(this.parentWidget.open);
    	            })));
    	        }
                if (this.parentContainer) {
                    domConstruct.place(this.domNode, this.parentContainer);
                }
    	    },
    	    createGraphicLayers: function () {
    	        this.pointSymbol = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, 10, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 0, 0]), 1), new Color([255, 0, 0, 1.0]));
    	        this.polylineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASH, new Color([255, 0, 0]), 1);
    	        this.polygonSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASHDOT, new Color([255, 0, 0]), 2), new Color([255, 255, 0, 0.0]));
    	        this.pointGraphics = new GraphicsLayer({
    	            id: 'drawGraphics_point',
    	            title: 'Draw Graphics'
    	        });
    	        this.pointRenderer = new SimpleRenderer(this.pointSymbol);
    	        this.pointRenderer.label = 'User drawn points';
    	        this.pointRenderer.description = 'User drawn points';
    	        this.pointGraphics.setRenderer(this.pointRenderer);
    	        this.map.addLayer(this.pointGraphics);
    	        this.polylineGraphics = new GraphicsLayer({
    	            id: 'drawGraphics_line',
    	            title: 'Draw Graphics'
    	        });
    	        this.polylineRenderer = new SimpleRenderer(this.polylineSymbol);
    	        this.polylineRenderer.label = 'User drawn lines';
    	        this.polylineRenderer.description = 'User drawn lines';
    	        this.polylineGraphics.setRenderer(this.polylineRenderer);
    	        this.map.addLayer(this.polylineGraphics);

    	        this.polygonGraphics = new FeatureLayer({
    	            layerDefinition: {
    	                geometryType: 'esriGeometryPolygon',
    	                fields: [{
    	                    name: 'OBJECTID',
    	                    type: 'esriFieldTypeOID',
    	                    alias: 'OBJECTID',
    	                    domain: null,
    	                    editable: false,
    	                    nullable: false
    	                }, {
    	                    name: 'ren',
    	                    type: 'esriFieldTypeInteger',
    	                    alias: 'ren',
    	                    domain: null,
    	                    editable: true,
    	                    nullable: false
    	                }]
    	            },
    	            featureSet: null
    	        }, {
    	            id: 'drawGraphics_poly',
    	            title: 'Draw Graphics',
    	            mode: FeatureLayer.MODE_SNAPSHOT
    	        });
    	        this.polygonRenderer = new UniqueValueRenderer(new SimpleFillSymbol(), 'ren', null, null, ', ');
    	        this.polygonRenderer.addValue({
    	            value: 1,
    	            symbol: new SimpleFillSymbol({
    	                color: [255, 170, 0, 255],
    	                outline: {
    	                    color: [255, 170, 0, 255],
    	                    width: 1,
    	                    type: 'esriSLS',
    	                    style: 'esriSLSSolid'
    	                },
    	                type: 'esriSFS',
    	                style: 'esriSFSForwardDiagonal'
    	            }),
    	            label: 'User drawn polygons',
    	            description: 'User drawn polygons'
    	        });
    	        this.polygonGraphics.setRenderer(this.polygonRenderer);
    	        this.map.addLayer(this.polygonGraphics);
    	    },
    	    drawPoint: function () {
    	        this.disconnectMapClick();
    	        this.drawToolbar.activate(Draw.POINT);
    	        this.drawModeTextNode.innerText = this.i18n.labels.point;
    	    },
    	    drawCircle: function () {
    	        this.disconnectMapClick();
    	        this.drawToolbar.activate(Draw.CIRCLE);
    	        this.drawModeTextNode.innerText = this.i18n.labels.circle;
    	    },
    	    drawLine: function () {
    	        this.disconnectMapClick();
    	        this.drawToolbar.activate(Draw.POLYLINE);
    	        this.drawModeTextNode.innerText = this.i18n.labels.polyline;
    	    },
    	    drawFreehandLine: function () {
    	        this.disconnectMapClick();
    	        this.drawToolbar.activate(Draw.FREEHAND_POLYLINE);
    	        this.drawModeTextNode.innerText = this.i18n.labels.freehandPolyline;
    	    },
    	    drawPolygon: function () {
    	        this.disconnectMapClick();
    	        this.drawToolbar.activate(Draw.POLYGON);
    	        this.drawModeTextNode.innerText = this.i18n.labels.polygon;
    	    },
    	    drawFreehandPolygon: function () {
    	        this.disconnectMapClick();
    	        this.drawToolbar.activate(Draw.FREEHAND_POLYGON);
    	        this.drawModeTextNode.innerText = this.i18n.labels.freehandPolygon;
    	    },
    	    disconnectMapClick: function () {
    	        topic.publish('mapClickMode/setCurrent', 'draw');
    	        this.enableStopButtons();
    	        // dojo.disconnect(this.mapClickEventHandle);
    	        // this.mapClickEventHandle = null;
    	    },
    	    connectMapClick: function () {
    	        topic.publish('mapClickMode/setDefault');
    	        this.disableStopButtons();
    	        // if (this.mapClickEventHandle === null) {
    	        //     this.mapClickEventHandle = dojo.connect(this.map, 'onClick', this.mapClickEventListener);
    	        // }
    	    },
    	    onDrawToolbarDrawEnd: function (evt) {
    	        this.drawToolbar.deactivate();
    	        this.drawModeTextNode.innerText = this.i18n.labels.currentDrawModeNone;
    	        var graphic;
    	        switch (evt.geometry.type) {
    	            case 'point':
    	                graphic = new Graphic(evt.geometry);
    	                this.pointGraphics.add(graphic);
    	                break;
    	            case 'polyline':
    	                graphic = new Graphic(evt.geometry);
    	                this.polylineGraphics.add(graphic);
    	                break;
    	            case 'polygon':
    	                graphic = new Graphic(evt.geometry, null, {
    	                    ren: 1
    	                });
    	                this.polygonGraphics.add(graphic);
    	                break;
    	            default:
    	        }
    	        this.connectMapClick();
    	    },
    	    clearGraphics: function () {
    	        this.endDrawing();
    	        this.connectMapClick();
    	        this.drawModeTextNode.innerText = 'None';
    	    },
    	    stopDrawing: function () {
    	        this.drawToolbar.deactivate();
    	        this.drawModeTextNode.innerText = 'None';
    	        this.connectMapClick();
    	    },
    	    endDrawing: function () {
    	        this.pointGraphics.clear();
    	        this.polylineGraphics.clear();
    	        this.polygonGraphics.clear();
    	        this.drawToolbar.deactivate();
    	        this.disableStopButtons();
    	    },
    	    disableStopButtons: function () {
    	        this.stopDrawingButton.set('disabled', true);
    	        this.eraseDrawingButton.set('disabled', !this.noGraphics());
    	    },
    	    enableStopButtons: function () {
    	        this.stopDrawingButton.set('disabled', false);
    	        this.eraseDrawingButton.set('disabled', !this.noGraphics());
    	    },
    	    noGraphics: function () {

    	        if (this.pointGraphics.graphics.length > 0) {
    	            return true;
    	        } else if (this.polylineGraphics.graphics.length > 0) {
    	            return true;
    	        } else if (this.polygonGraphics.graphics.length > 0) {
    	            return true;
    	        } else {
    	            return false;
    	        }
    	        return false;

    	    },
    	    onLayoutChange: function (open) {
    	        // end drawing on close of title pane
    	        if (!open) {
    	            //this.endDrawing();
    	            if (this.mapClickMode === 'draw') {
    	                topic.publish('mapClickMode/setDefault');
    	            }
    	        }
    	    },
    	    setMapClickMode: function (mode) {
    	        this.mapClickMode = mode;
    	    }
        });
    return graphicsButton;
});