define([
    'dojo/_base/declare',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'esri/toolbars/navigation',
    'dijit/form/Button',
    'dijit/Menu',
    'dijit/MenuItem',
    'dijit/PopupMenuItem',
    'dijit/MenuSeparator',
    'dojo/_base/lang',
    'dojo/on',
    'dojo/text!./NavTools/templates/NavTools.html',
    'dojo/topic',
    'xstyle/css!./NavTools/css/NavTools.css',
    "dojo/dom",
  "dojo/dom-style",
], function (declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, Navigation, Button, Menu, MenuItem, PopupMenuItem, MenuSeparator, lang, on,
    NavToolsTemplate, topic, css,dom, domStyle) {
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        widgetsInTemplate: true,
        templateString: NavToolsTemplate,
        navTools: null,
        constructor: function (options, srcRefNode) {
            if (typeof srcRefNode === "string") {
                srcRefNode = dom.byId(srcRefNode)
            }
            this.map = options.map || null;
            this.domNode = srcRefNode;
        },
        //startup: function () { },
        postCreate: function () {
            //this.inherited(arguments);
          this.navTools = new Navigation(this.map);
          this.own(topic.subscribe('mapClickMode/currentSet', lang.hitch(this, 'setMapClickMode', 'navTools')));
          this.navTools.on('extent-history-change', lang.hitch(this, 'extentHistoryChangeHandler'));
        },
        setMapClickMode: function (mode) {
            this.mapClickMode = mode;
            if (mode !== 'navTools') {
                this.navTools.deactivate();                
            }
        },
        deactivate: function () {
            this.navTools.deactivate();
            this.map.setMapCursor('default');
            this.connectMapClick();
        },
        zoomIn: function() {
            this.map.setMapCursor("url('js/gis/dijit/NavTools/images/zoomin.cur'),auto");
            this.disconnectMapClick();
            this.navTools.activate(Navigation.ZOOM_IN);
        },
        zoomOut: function() {
            this.map.setMapCursor("url('js/gis/dijit/NavTools/images/zoomout.cur'),auto");
            this.navTools.activate(Navigation.ZOOM_OUT);
        },
        fullExtent: function () {
            this.navTools.zoomToFullExtent();
        },		
        prevExtent: function () {
            this.navTools.zoomToPrevExtent();
        },
        nextExtent: function () {
            this.navTools.zoomToNextExtent();
        },		
        pan: function () {
            this.map.setMapCursor("url('js/gis/dijit/NavTools/images/Hand.cur'),auto");
            this.navTools.activate(Navigation.PAN);
        },
        disconnectMapClick: function() {
            topic.publish('mapClickMode/setCurrent', 'navTools');
            // this.mapClickMode.current = 'nav';
            // ESRI sample
            // dojo.disconnect(this.mapClickEventHandle);
            // this.mapClickEventHandle = null;
        },
        
        connectMapClick: function() {
            topic.publish('mapClickMode/setDefault');
            // this.mapClickMode.current = this.mapClickMode.defaultMode;
            // ESRI sample
            // if (this.mapClickEventHandle === null) {
            //     this.mapClickEventHandle = dojo.connect(this.map, 'onClick', this.mapClickEventListener);
            // }
        },
        
        extentHistoryChangeHandler: function (evt) {
           //registry.byId('zoomprev').disabled = navTools.isFirstExtent();
           //registry.byId('zoomnext').disabled = navTools.isLastExtent();

            //this.deactivate();
            //this.connectMapClick();
        }
    });
});
