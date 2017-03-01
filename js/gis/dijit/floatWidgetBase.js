define(["dojo/_base/declare",
    "dijit/_WidgetBase",
    "dojo/dom-construct",
    "dojo/query",
    "dojo/on",
    'dojo/dom',
    "dojo/_base/lang",
    "dojo/dom-style",
    "dojo/dom-class",
    "dojox/layout/FloatingPane",
    "dijit/layout/ContentPane",
     "dojo/dnd/move",
    
],
function (declare, _WidgetBase, domConstruct, query, on, dom, lang, domStyle, domClass, FloatingPane, ContentPane, dndMove) {

    var ConstrainedFloatingPane = dojo.declare(dojox.layout.FloatingPane, {
        postCreate: function () {
            this.inherited(arguments);
            this.moveable = new dojo.dnd.move.constrainedMoveable(
                this.domNode, {
                    handle: this.focusNode,
                    constraints: function () {
                        var coordsBody = dojo.coords(dojo.body());
                        // or
                        var coordsWindow = {
                            l: 0,
                            t: 0,
                            w: window.innerWidth,
                            h: window.innerHeight
                        };
                        return coordsWindow;
                    },
                    within: true
                }
            );
        }
    });

	return declare([_WidgetBase], {
		//id:"floatWidget",
		parentId:null,
		baseContainer:null,
		title:"Floating Widget",
		floatIconStyle:"floatingPaneIcon",
		minimizeBtn:null,
		maximizeBtn:null,
		closeBtn:null,
		floatingPane:null,
		visible:false,
		minimized:false,
		top:100,
		left:10,
		contentWidth:330,
		contentHeight:400,
		maxWidth:999999,
		postCreate: function () {
		    //debugger;
		    
		    this.parentId = dijit.getEnclosingWidget(this.domNode).id;
			this.baseContainer = domConstruct.create('div', {
				class : "float",
				id : this.id+"fPanefloatWidget",
				style : ""
			});
			domConstruct.place(this.baseContainer, this.map.container, 'first');	
		},
		initFloat:function()
		{
            debugger;
            this.floatingPane = new ConstrainedFloatingPane({
        	title: "<span class='paneTitleText'>"+this.title+"</span>",
        	resizable: this.resizable,//true,
        	dockable: false,
       		closable: false,
        	style: "position:absolute;z-index:1000;top:"+this.top+"px;left:"+this.left+"px;width:"+this.contentWidth+"px;height:"+this.contentHeight+"px;overflow: hidden;visibility:hidden;",
        	id: this.id+"_fPane",
            'class': "floatingPane "+this.baseClass}, this.baseContainer);
			this.floatingPane.hide();
			this.floatingPane.startup();
		
			var lTitlePane = query("#"+this.id+"_fPane"+' .dojoxFloatingPaneTitle')[0];
			
			this.closeBtn= domConstruct.create("div", {
		        class:"closeBtn",
		        style : "width:20px;height:20px;overflow: hidden;"
		    });
		   	on(this.closeBtn,"click",lang.hitch(this,"close"));
		    
		    this.minimizeBtn = domConstruct.create("div", {
		     	class:"minimizeBtn",
		        style : "width:20px;height:20px;overflow: hidden;"
		     });
			on(this.minimizeBtn,"click",lang.hitch(this,"minimize"));
		    
		    this.maximizeBtn= domConstruct.create("div", {
		    	class:"maximizeBtn",
		        style : "width:20px;height:20px;overflow: hidden;visibility:hidden;"	       
		    });
			on(this.maximizeBtn,"click",lang.hitch(this,"maximize"));
			
			domConstruct.place(this.closeBtn, lTitlePane, "after");
		    domConstruct.place(this.minimizeBtn, lTitlePane, "after");
		    domConstruct.place(this.maximizeBtn, lTitlePane, "after");
			var lIconPane = query("#"+this.id+"_fPane")[0];
		    //var logoDiv = domConstruct.create('div',{class:this.floatIconStyle},lIconPane);
            var logoDiv = domConstruct.create('div',{class:this.floatIconStyle},lIconPane);
			
			var self = this;
			
			
		},
		show:function()
		{		
        	this.floatingPane.bringToTop();
        	this.maximize();
			this.floatingPane.show();
			this.visible = true;
		},
		close:function()
		{
			this.floatingPane.hide();
			this.visible = false;
			if (!this.minimized)
			{
				this.contentWidth = this.floatingPane.domNode.style.width;
	        	this.contentHeight = this.floatingPane.domNode.style.height;
			}
		},
		minimize:function()
		{
			//store current sizing
			this.contentWidth = this.floatingPane.domNode.style.width;
	        this.contentHeight = this.floatingPane.domNode.style.height;
	        this.minimized = true;
			//minmize control
			domStyle.set(this.floatingPane.domNode, "height", "25px");
	        domStyle.set(this.floatingPane.domNode, "width", "180px");
	      	//remove resize control
			domStyle.set(this.floatingPane.canvas.children[1],"visibility","hidden");
			//swap buttons
	        domStyle.set(this.minimizeBtn,'visibility', 'hidden');
			domStyle.set(this.maximizeBtn,'visibility', 'visible');
		},
		maximize:function()
		{
			//restore control
			domStyle.set(this.floatingPane.domNode, "height", this.contentHeight);
			domStyle.set(this.floatingPane.domNode, "width", this.contentWidth);
	        this.minimized = false;
	        //domStyle.set(this.floatingPane.canvas.children[0],'height', this.contentHeight);
	        //add resize control
        	domStyle.set(this.floatingPane.canvas.children[1],"visibility","visible");
        	//swap buttons
	        domStyle.set(this.minimizeBtn,'visibility', 'visible');
			domStyle.set(this.maximizeBtn,'visibility', 'hidden');
		}
	});
});