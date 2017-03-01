define(["dojo/_base/declare", "dijit/_WidgetBase", "dijit/form/Button", "dojo/_base/lang", "dojo/_base/Color", "dojo/dom-construct", "dojo/dom", "dojo/dom-class",
    "dojo/on", "dojo/_base/fx", "dojo/fx", "gis/dijit/mobileHelper"],
    function (declare, _WidgetBase, Button, lang, Color, domConstruct, dom, domClass, on, baseFx, coreFx, MobileHelper) {

	return declare('_tabWidgetBase', [_WidgetBase], {
		state : "minimized",
		mobileHelper : new MobileHelper(),
		tabIconStyle : "tabButtonIcon",
		parentId : null,
		cp : null,
		container : null,
		title : "widget",
		containerTopOffset : 123,
		containerWidthFactor : 22,
		containerHeightFactor : 0,
		containerOverLap : 10,
		maxWidth : 400,
		containerWidth : 0,
		postCreate : function() {
			this.inherited(arguments);
			this.mobileHelper.collectInfo();
			this.parentId = dijit.getEnclosingWidget(this.domNode).id;
			if (this.mobileHelper.clientWidth > this.maxWidth)
				this.containerWidth = this.maxWidth;
			else
				this.containerWidth = this.mobileHelper.clientWidth - (this.containerWidthFactor + this.containerOverLap);
		},
		initiateTab : function() {
		    debugger;
			// create button
			var div = domConstruct.create('div', {
				id : this.baseClass + "_tabButton",
				title : this.title
			});
			domClass.add(div, this.tabIconStyle);
			//outer container
			this.container = domConstruct.create('div', {
				class : "tabContainer",
				id : this.baseClass + "_Container",
				style : "top:" + this.containerTopOffset + "px;height:" + (this.mobileHelper.clientHeight - this.containerTopOffset - this.containerHeightFactor) + "px;width:" + (this.containerWidth) + "px;right:0px;"
			});
			//this.containerTitle = domConstruct.create('div',{class:"tabContainerTitle", id: this.baseClass+"_ContainerTitle",style: "top:"+this.containerTopOffset+"px;height:35px;width:100%;right:0px;"});
			//content container
			this.cp3 = new dijit.layout.ContentPane({
				id : this.baseClass + "_Container2",
				baseClass : "tabContent",
				content : "",
				style : "top:0px;height:" + (this.mobileHelper.clientHeight - (this.containerTopOffset)) + "px;width:" + (this.containerWidth) + "px;right:0px"
			});
			this.containerTitle = domConstruct.create('div', {
				class : "tabContainerTitle",
				id : this.baseClass + "_ContainerTitle",
				style : "top:" + this.containerTopOffset + "px;height:30px;width:98%;right:0px;",
				innerHTML : this.title
			});

			this.cp = new dijit.layout.ContentPane({
				id : this.baseClass + "_Container3",
				baseClass : "tabWidgetContent",
				content : "",
				style : "top:0px;height:" + (this.mobileHelper.clientHeight - ((this.containerTopOffset * 2) + 30)) + "px;width:98%;right:0px;"
			});

			//setup events
			div.onclick = lang.hitch(this, "toggleTab");
			var self = this;
			on(this.mobileHelper, "orientationChange", function(e) {
				console.log("parent:" + self.parentId);
				var eo = lang.clone(e);
				var preWidth = self.containerWidth;
				console.log("prewidth:" + self.containerWidth);
				if (self.mobileHelper.clientWidth > self.maxWidth)
					self.containerWidth = self.maxWidth;
				else
					self.containerWidth = eo.newWidth - (self.containerWidthFactor + self.containerOverLap);
				//modify width
				eo.previousWidth = preWidth;
				eo.newWidth = self.containerWidth;	
				//self.containerWidth =self.containerWidth-22;
				//resize active tab
				if (self.state == "maximized") {
					self.slideTab(self.parentId, self.containerWidth, 500);
				}
				console.log("width2:" + self.containerWidth);

				//apply new screen sizes
				self.modifyTabSize(eo);
			});

			//place controls
			domConstruct.place(div, dojo.byId(this.parentId));
			domConstruct.place(this.container, dojo.byId('mapDiv'), 'first');
			domConstruct.place(this.cp3.domNode, this.container);
			domConstruct.place(this.containerTitle, this.cp3.domNode);
			domConstruct.place(this.cp.domNode, this.cp3.domNode);
			//slide it off the screen and make it visible
			this.slideTabRight(1);
			//dojo.style(this.cp.domNode,'visibility', 'visible');
			setTimeout(function() {
				dojo.style(div, 'visibility', 'visible');
				dojo.style(self.container, 'visibility', 'visible')
			}, 1000);

		},
		toggleTab : function() {

			if (this.state == "minimized") {
				dojo.style(this.container, 'display', 'block');
				dojo.style(dojo.byId(this.parentId), 'zIndex', '41');
				this.slideTabLeft(400);
				this.state = "maximized";
				//this.map.disableMapNavigation();
				//this.map.hideZoomSlider();

			} else {
				dojo.style(dojo.byId(this.parentId), 'zIndex', '40');
				this.state = "minimized";
				this.slideTabRight(400);
				//this.map.enableMapNavigation();
				//this.map.showZoomSlider();

			}
			dojo.publish("tabWidget.state", [{
				state : this.state
			}]);

		},
		slideTabLeft : function(duration) {
			coreFx.combine([baseFx.animateProperty({
				node : this.parentId,
				duration : duration,
				properties : {
					right : {
						start : "0",
						end : (this.containerWidth)
					}
				}
			}), baseFx.animateProperty({
				node : this.baseClass + '_Container',
				duration : duration - 10,
				properties : {
					right : {
						start : "-" + (this.containerWidth - this.containerOverLap),
						end : "0"
					}
				}
			})]).play();
		},
		slideTabRight : function(duration) {

			var s1 = baseFx.animateProperty({
				node : this.parentId,
				duration : duration,
				properties : {
					right : {
						start : (this.containerWidth),
						end : "0"
					}
				}
			});
			var s2 = baseFx.animateProperty({
				node : this.baseClass + '_Container',
				duration : duration + 10,
				properties : {
					//right: {start: "-40", end: "-"+(this.containerWidth+this.containerWidthFactor)}
					right : {
						start : "0",
						end : "-" + (this.containerWidth + this.containerWidthFactor)
					}
				}
			});
			var self = this;
			on(s2, "End", function(e) {
				dojo.style(self.container, 'display', 'none');
			});
			coreFx.combine([s2, s1]).play();
		},
		modifyTabSize : function(data) {
			coreFx.combine([baseFx.animateProperty({
				node : this.baseClass + '_Container',
				duration : 500,
				properties : {
					height : {
						start : data.previousHeight,
						end : data.newHeight - (this.containerTopOffset + this.containerHeightFactor)
					}
				}
			}), baseFx.animateProperty({
				node : this.baseClass + '_Container2',
				duration : 500,
				properties : {
					height : {
						start : data.previousHeight,
						end : data.newHeight - (this.containerTopOffset + this.containerHeightFactor)
					}
				}
			}), baseFx.animateProperty({
				node : this.baseClass + '_Container',
				duration : 500,
				properties : {
					width : {
						start : data.previousWidth,
						end : data.newWidth
					}
				}
			}), baseFx.animateProperty({
				node : this.baseClass + '_Container2',
				duration : 500,
				properties : {
					width : {
						start : data.previousWidth,
						end : (data.newWidth)
					}
				}
			})]).play();
		},
		slideTab : function(nodeid, pos, speed) {
			var node = dojo.byId(nodeid);
			//var top = dojo.style(node,"top");
			baseFx.animateProperty({
				node : nodeid,
				duration : speed,
				properties : {
					right : pos
				}
			}).play();
		}
	});

}); 