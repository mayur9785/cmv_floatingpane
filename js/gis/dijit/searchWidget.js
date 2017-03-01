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
"dojo/text!./Search/templates/button.html",
"dojo/text!./Search/templates/widget.html",
'dojo/dnd/Moveable',
"dijit/form/Select"
]
,function(declare,floatWidgetBase, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, domConstruct, domClass, 
	esriRequest, Query, QueryTask, buttonTemplate, widgetTemplate, Moveable)
{ 
    (function () {
        var css = [require.toUrl("gis/dijit/Search/css/search.css")];
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
    
    var searchButton = declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], 
	{
		widgetsInTemplate: true,
        templateString: buttonTemplate,
        baseClass: 'widget_Search',
        buttonClass: 'toolbarButton',
        postCreate: function() 
        	{
            //debugger;
	           	//initialize the widget
	            this.inherited(arguments);
	            domClass.add(this.toolbarButton.domNode);//, "toolbarButtonIcon "+this.theme);
	            var props = {map: this.map,theme:this.theme,config:this.config};
            	this.widget = new floatWidget(props);
            	this.widget.startup();
	        },
	    toggleWidget:function()
	    {
	    	if (this.widget.visible)
	    		this.widget.close();
	    	else
	    		this.widget.show();
	    }
	});
    
    var floatWidget = declare([floatWidgetBase], 
		{
			widgetsInTemplate: false,
        	baseClass: 'widget_Search',
        	title: 'Search',
        	postCreate: function() 
        	{
        	    //debugger;
        	    this.inherited(arguments);
        	    //debugger;
        	    this.moveable = new Moveable(
                this.domNode, {
                    handle: this.focusNode,
                    box: {l: 10, t: 10, w: 400, h: 400},
                    within: true
                });
        		console.log("search");
        		this.floatIconStyle += " " + this.theme;
        	    this.resizable = true,
        		this.top=100;
        		this.left=100;
        		this.contentHeight=150;
        		this.contentWidth =500;
        		this.initFloat();
        		this.initUI();
        	},
        	initUI:function()
        	{
        		var props = {parentContainer: this.floatingPane.containerNode,map:this.map};
            	this.ui = new searchWidgetUI(props);
            	this.ui.startup();
        	}
        	
		});
		
		var searchWidgetUI = declare("",[_WidgetBase,_TemplatedMixin,_WidgetsInTemplateMixin], {
		templateString: widgetTemplate, 
		widgetsInTemplate: true,
    	baseClass: 'widget_Search_ui',
    	postCreate: function() {
    		this.inherited(arguments);
            if (this.parentContainer) {
                domConstruct.place(this.domNode, this.parentContainer);
            }
            //this.getList();
    	},
    	onListChange:function()
    	{
    		var query = new Query();
    		query.where = "Stadium = '"+this.lstValues.get('value')+"'";
    		query.returnGeometry = true;
		    query.outFields = "";
		    query.outSpatialReference = this.map.spatialReference;
    		var self = this;
    		var queryTask = new QueryTask("http://services.arcgis.com/BG6nSlhZSAWtExvp/arcgis/rest/services/stadia/FeatureServer/0");
    		queryTask.execute(query, function(results)
    		{
    			var geom=null;
    			for (var i = 0; i < results.features.length; i++) {
    				geom = results.features[i].geometry;
    			}
    			
    			self.map.centerAndZoom(geom,10);
    		},
    		 function(error){alert(error);});
    		//this.selectedValue =  this.lstCarType.get('value'); 
    		//this.setImage(this.lstCarType.get('displayedValue'));
    		//this.setLabel(this.lstCarType.get('displayedValue'));
    	},
    	getList:function()
    	{
    		var url="http://services.arcgis.com/BG6nSlhZSAWtExvp/arcgis/rest/services/stadia/FeatureServer/0/query?where=FID+>0&outFields=Stadium&returnGeometry=false&f=pjson";
    		//var url = "http://services1.arcgis.com/TTAKhneQUzcgqBHm/ArcGIS/rest/services/ChargingStations/FeatureServer/4/query?where=objectid%3E%3D0&outFields=*&f=pjson";
    		var request = esriRequest({url:url,handleAs:"json"});
    		var self = this;
    		request.then(
		  		function (data) {
				  	console.log("success: ", data.features.length);
				  	self.data=[];
				  	for (var i = 0; i < data.features.length; i++) 
				     {
				     	var option = [];
			    		option[0] = {};
					    option[0].label = data.features[i].attributes["Stadium"];
					    option[0].value = data.features[i].attributes["Stadium"];
					    if (i==0)
					    	option[0].selected = true;
					    self.lstValues.addOption(option);
				     }
				     self.selectedValue =  self.lstValues.get('value');
				     //self.setLabel(self.lstCarType.get('displayedValue'));
			   	},
			  	function (error) {
			    	console.log("Error: ", error.message);
			  	}
			);
		  }
        });
		return searchButton;
});