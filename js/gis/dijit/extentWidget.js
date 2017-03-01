define(["dojo/_base/declare", "dijit/_WidgetBase", "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dojo/text!./Extent/templates/button.html",
]
,function(declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, extentTemplate)
{
	// function to load CSS files required for this module
    (function() {
        var css = [require.toUrl("gis/dijit/Extent/css/extent.css")];
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
    
	return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], 
	{
		widgetsInTemplate: true,
        templateString: extentTemplate,
        baseClass: 'widgets_Extent',
        buttonClass: 'extentButton',
        postCreate: function() 
        	{
        		
	           	//initialize the widget
	            this.inherited(arguments);
	        },
	    getExtent:function()
	    {
	    	var xmax = this.map.extent.xmax;
	    	var ymax = this.map.extent.ymax;
	    	var xmin = this.map.extent.xmin;
	    	var ymin = this.map.extent.ymin;
	    	alert(xmin+","+ymin+","+xmax+","+ymax);
	    }
	});
});