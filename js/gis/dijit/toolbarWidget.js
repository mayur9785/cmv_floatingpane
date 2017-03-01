define(["dojo/_base/declare",
        "dojo/_base/html",
        "dojo/on",
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",
		"dijit/_WidgetsInTemplateMixin",
        "dojo/text!./Toolbar/templates/buttons.html",
		"dijit/form/Button",
        "dojo/dom-construct",
        "dojo/dom-class",
        "dojo/dom-style",
        'xstyle/css!./Toolbar/css/toolbar.css']
,function(declare, html, on, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, extentTemplate, Button,domConstruct,domClass,domStyle)
{
     //function to load CSS files required for this module
    (function () {
        var css = [require.toUrl("gis/dijit/Toolbar/css/toolbar.css")];
        var head = document.getElementsByTagName("head").item(0),
            link;
        for (var i = 0, il = css.length; i < il; i++) {
            link = document.createElement("link");
            link.type = "text/css";
            link.rel = "stylesheet";
            link.href = css[i].toString();
            head.appendChild(link);
        }
    }());

    return declare("toolbarWidget", [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin],
	{
	    widgetsInTemplate: true,
	    templateString: extentTemplate,
	    baseClass: 'widgets_Toolbar',
	    buttonClass: 'extentButton',
	    leftButtonClass: 'slideLeftButton',
	    rightButtonClass: 'slideRightButton',
	    //mobileHelper: new MobileHelper(),
	    postCreate: function () {
            debugger;
	        //initialize the widget
	        this.inherited(arguments);
	        //this.mobileHelper.collectInfo();
	        var availableWidth = this.getLayoutWidth();
	        var widgetDisplayWidth = 33 * this.widgets.length;

	        if ((this.widgets) && (this.widgets.length > 0)) {
	            for (var i in this.widgets)
	        	{ 
	            	var w = this.widgets[i];
	            	var li = domConstruct.create("li");
	            	domConstruct.place(w.domNode,li,'first');
	            	this.toolList.appendChild(li);
	           	}
	        }

	        this.setLayout();
	        var self = this;
	        //on(this.mobileHelper, "orientationChange", function (e) {
	        //    self.setLayout();
	        //});
	    },
	    setLayout: function () {
	        if ((this.widgets) && (this.widgets.length > 0) && (this.widgets.length > this.showCount)) {
	            var availableWidth = this.getLayoutWidth();
	            var widgetDisplayWidth = 33 * this.widgets.length;

	            if (availableWidth < widgetDisplayWidth) {
	                domStyle.set(this.mask, "width", (33 * this.showCount) + "px");
	                domStyle.set(this.toolList, "width", (widgetDisplayWidth) + "px");
	                this.createKeyFramesRulesLeftRight((-34.5 * (this.widgets.length - this.showCount)));
	                domClass.replace(this.btnScrollRight, "scrollButton", "scrollButton hidden");
	                domClass.replace(this.btnScrollLeft, "scrollButton", "scrollButton hidden");
	            } else {
	                domStyle.set(this.mask, "width", (widgetDisplayWidth) + "px");
	                this.moveLeft();
	                domClass.replace(this.btnScrollRight, "scrollButton hidden", "scrollButton");
	                domClass.replace(this.btnScrollLeft, "scrollButton hidden", "scrollButton");
	            }
	        }
	    },
	    getLayoutWidth: function () {
	        //debugger;
	        var layoutBox = html.getMarginBox(this.map.id);
	        return layoutBox.w - 280;
	    },
	    moveLeft: function () {
	        var node = this.toolList;
	        domStyle.set(node, "MozAnimation", "cssAnimationLeft 1s  1 linear forwards");
	        domStyle.set(node, "WebkitAnimation", "cssAnimationLeft 1s  1 linear forwards");
	        domStyle.set(node, "OAnimation", "cssAnimationLeft 1s  1 linear forwards");
	        domStyle.set(node, "animation", "cssAnimationLeft 1s  1 linear forwards");
	        domStyle.set(node, "MozAnimationPlayState", "running");
	        domStyle.set(node, "WebkitAnimationPlayState", "running");
	        domStyle.set(node, "OAnimationPlayState", "running");
	        domStyle.set(node, "AnimationPlayState", "running");

	    },
	    stopMove: function () {
	        var node = this.toolList;
	        domStyle.set(node, "MozAnimationPlayState", "paused");
	        domStyle.set(node, "WebkitAnimationPlayState", "paused");
	        domStyle.set(node, "OAnimationPlayState", "paused");
	        domStyle.set(node, "AnimationPlayState", "paused");
	    },
	    moveRight: function () {
	        var node = this.toolList;
	        domStyle.set(node, "MozAnimation", "cssAnimationRight 1s  1 linear forwards");
	        domStyle.set(node, "WebkitAnimation", "cssAnimationRight 1s  1 linear forwards");
	        domStyle.set(node, "OAnimation", "cssAnimationRight 1s  1 linear forwards");
	        domStyle.set(node, "animation", "cssAnimationRight 1s  1 linear forwards");
	        domStyle.set(node, "MozAnimationPlayState", "running");
	        domStyle.set(node, "WebkitAnimationPlayState", "running");
	        domStyle.set(node, "OAnimationPlayState", "running");
	        domStyle.set(node, "AnimationPlayState", "running");
	    },
	    createKeyFramesRulesLeftRight: function (val) {
	        console.log(val);
	        // gather all stylesheets into an array
	        var head = document.getElementsByTagName("head").item(0);

	        var cssAnimation = document.createElement('style');
	        cssAnimation.type = 'text/css';
	        var rules = document.createTextNode('@-moz-keyframes cssAnimationLeft{' +
			'0%   { left: ' + val + 'px}' +
			'100% { left: 0px; }' +
			'}');
	        cssAnimation.appendChild(rules);
	        head.appendChild(cssAnimation);
	        var cssAnimation = document.createElement('style');
	        cssAnimation.type = 'text/css';
	        var rules = document.createTextNode('@-webkit-keyframes cssAnimationLeft{' +
			'0%   { left: ' + val + 'px}' +
			'100% { left: 0px; }' +
			'}');
	        cssAnimation.appendChild(rules);
	        head.appendChild(cssAnimation);
	        var cssAnimation = document.createElement('style');
	        cssAnimation.type = 'text/css';
	        var rules = document.createTextNode('@keyframes cssAnimationLeft{' +
			'0%   { left: ' + val + 'px}' +
			'100% { left: 0px; }' +
			'}');
	        cssAnimation.appendChild(rules);
	        head.appendChild(cssAnimation);

	        var cssAnimation = document.createElement('style');
	        cssAnimation.type = 'text/css';
	        var rules = document.createTextNode('@-moz-keyframes cssAnimationRight{' +
			'0%   { left: 0px}' +
			'100% { left: ' + val + 'px }' +
			'}');
	        cssAnimation.appendChild(rules);
	        head.appendChild(cssAnimation);
	        var cssAnimation = document.createElement('style');
	        cssAnimation.type = 'text/css';
	        var rules = document.createTextNode(' @-webkit-keyframes cssAnimationRight{' +
			'0%   { left: 0px}' +
			'100% { left: ' + val + 'px }' +
			'}');
	        cssAnimation.appendChild(rules);
	        head.appendChild(cssAnimation);
	        var cssAnimation = document.createElement('style');
	        cssAnimation.type = 'text/css';
	        var rules = document.createTextNode(' @keyframes cssAnimationRight{' +
			'0%   { left: 0px}' +
			'100% { left: ' + val + 'px }' +
			'}');
	        cssAnimation.appendChild(rules);
	        head.appendChild(cssAnimation);
	    },
	    createKeyFramesRulesUpDown: function (val) {
	        console.log(val);
	        // gather all stylesheets into an array
	        var head = document.getElementsByTagName("head").item(0);

	        var cssAnimation = document.createElement('style');
	        cssAnimation.type = 'text/css';
	        var rules = document.createTextNode('@-moz-keyframes cssAnimationUp{' +
			'0%   { top: ' + val + 'px}' +
			'100% { top: 0px; }' +
			'}');
	        cssAnimation.appendChild(rules);
	        head.appendChild(cssAnimation);
	        var cssAnimation = document.createElement('style');
	        cssAnimation.type = 'text/css';
	        var rules = document.createTextNode('@-webkit-keyframes cssAnimationUp{' +
			'0%   { top: ' + val + 'px}' +
			'100% { top: 0px; }' +
			'}');
	        cssAnimation.appendChild(rules);
	        head.appendChild(cssAnimation);

	        var cssAnimation = document.createElement('style');
	        cssAnimation.type = 'text/css';
	        var rules = document.createTextNode('@-moz-keyframes cssAnimationDown{' +
			'0%   { top: 0px}' +
			'100% { top: ' + val + 'px }' +
			'}');
	        cssAnimation.appendChild(rules);
	        head.appendChild(cssAnimation);
	        var cssAnimation = document.createElement('style');
	        cssAnimation.type = 'text/css';
	        var rules = document.createTextNode(' @-webkit-keyframes cssAnimationDown{' +
			'0%   { top: 0px}' +
			'100% { top: ' + val + 'px }' +
			'}');
	        cssAnimation.appendChild(rules);
	        head.appendChild(cssAnimation);
	    }
	});
});