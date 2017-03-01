var map;
require(["dojo/parser",
        "esri/map",
        "esri/dijit/OverviewMap",
        "esri/dijit/Scalebar",
        "esri/dijit/HomeButton",
        "gis/dijit/NavTools",
        'esri/dijit/Measurement',
        'gis/dijit/FloatingTitlePane',
        "esri/geometry/webMercatorUtils",
        "dojo/dom",
        "dojo/on",
        "dijit/layout/ContentPane",
        "dijit/layout/BorderContainer",
        "dijit/MenuBar",
        "dojo/_base/xhr",
        "dojo/domReady!"], function (parser, Map, OverviewMap, Scalebar, HomeButton, NavTools, Measurement,FloatingTitlePane, webMercatorUtils, dom, on, xhr) {

    parser.parse();

    //map = new Map("map", {
    //    basemap: "streets",
    //    center: [-122.45, 37.75],
    //    zoom: 13,
    //    logo: false
    //    //sliderPosition: "top-right",
    //});
    
    //map.on('load', function (evt)
    //{
    //    //var eventname = dijit.byId("map").resize();
    //    map.on('resize', function (evt) {
    //        var pnt = evt.target.extent.getCenter();
    //        setTimeout(function () {
    //            evt.target.centerAt(pnt);
    //        }, 100);
    //    });
    //    //after map loads, connect to listen to mouse move & drag events
    //    map.on("mouse-move", showCoordinates);
    //    map.on("mouse-drag", showCoordinates);

    //});
    
    //debugger;
    //dojo.xhrGet({
    //    url: "http://localhost:56022/CoreDBOracle.svc/bindRequestGrid",
    //    handleAs: "json",
    //    load: function (result) {
    //        //  The result here is of type Object; use JS accessors 
    //        //  to extract information from it.
    //    },
    //    error: function (err) {
    //        console.warn(err);
    //    }
    //});

    $(document).ready(
    function ()
    {
        var mapheight = null;//$('#map').innerHeight();
        var mapwidth = null;
        setTimeout(function () {
            $(".myButton").trigger("click");
        }, 10);

        $('.navItemName a').on('click', function () {
            $(this).addClass('activemenu').siblings().removeClass('activemenu');
        });

        $(".myButton").click(function () {

            if ($(filterDiv).is(':visible'))
            {
                $('#filterDiv').toggle();
                $('#matrixDiv').toggle();
                $('#menuName').toggle();//navMenubar
                $('#map').css("left", "0px");
                $('#map').css("height", mapheight);
                $('#map').css("width", mapwidth);
            }
            else
            {
                mapheight = $('#map').innerHeight();
                mapwidth = $('#map').innerWidth();
                $('#filterDiv').toggle();
                $('#matrixDiv').toggle();//navMenubar
                $('#menuName').toggle();//navMenubar
                $("#filterDiv").css("height", $("#map").innerHeight() / 2 - 2);
                $("#matrixDiv").css("height", $("#map").innerHeight() / 2 - 5);
                $("#matrixDiv").css("width", $("#map").innerWidth() - 35);
                var heightram = $('#matrixDiv').innerHeight();
                var widthram = $('#matrixDiv').innerWidth();
                var heightfilter = $('#filterDiv').innerHeight();
                var widthfilter = $('#filterDiv').innerWidth();
                $("#imgRAM").css("height", heightram - 18);
                $("#imgRAM").css("width", widthram);
                $("#imgFilter").css("height", heightfilter);
                $("#imgFilter").css("width", widthfilter);
                $('#map').css("left", $("#filterDiv").outerWidth() + 32);
                $('#map').css("height", $("#filterDiv").outerHeight() + 5);
                $('#map').css("width", $(window).width() - $("#filterDiv").innerWidth() - 35);
            }
        });
        //$('#toolbarIcon').innerHeight();
        //alert($('#toolbarIcon').innerHeight());
    });

    //Load OverviewMap
    //var overviewMapDijit = new OverviewMap({
    //    map: map,
    //    attachTo: "bottom-right",
    //    height: 100,
    //    width: 125,
    //    opacity: 0.30,
    //    visible: false,
    //});
    //overviewMapDijit.startup();

    // Load Scalebar 
    //var scalebar = new Scalebar({
    //    map: map,
    //    // "dual" displays both miles and kilometers
    //    // "english" is the default, which displays miles
    //    // use "metric" for kilometers
    //    scalebarUnit: "dual",
    //    attachTo: "bottom-left",
    //});

    // Load HomeButton
    //var home = new HomeButton({
    //    map: map
    //}, "HomeButton");
    //home.startup();

    // Display Coordinates on Mouse move
    //function showCoordinates(evt) {
    //    //the map is in web mercator but display coordinates in geographic (lat, long)
    //    var mp = webMercatorUtils.webMercatorToGeographic(evt.mapPoint);
    //    //display mouse coordinates
    //    // LONG = X AND LAT = Y
    //    // NORTHING = Y AND EASTING = X
    //    dom.byId("info").innerHTML = "Long= " + mp.x.toFixed(2) + ", " + "Lat= " + mp.y.toFixed(2);
    //}

    //var nav = new NavTools({
    //    map: map,
    //    mapRightClickMenu: true,
    //    mapClickMode: true
    //}, "toolbarIcon");

    //debugger;
    //var fltMeasure = new FloatingTitlePane({
    //    canFloat:true,
    //    isFloating: false,
    //    isDragging: false,
    //    dragDelay: 3,
    //    resizable: true,
    //    isResizing:false
    //},"toolMeasurement");
});