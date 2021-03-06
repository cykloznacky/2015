//<![CDATA[
// javascript & CSS include function
var getHead = function() { return document.getElementsByTagName("head")[0]; };
var includeJavascriptFile = function(url) {
        if (document.body == null) {
            var htmlString = "<script src='" + url;
            htmlString += "' type='text/javascript'" + ">";
            htmlString += "</" + "script>";
            document.write(htmlString);
        } else {
            var script = document.createElement("script");
            script.type = "text/javascript";
            script.language = "JavaScript";
            script.src = url;
            getHead().appendChild(script);
        }
    };
var includeCssFile = function(url) {
        if (document.body == null) {
            document.write("<link rel='stylesheet' href='" + url + "' type='text/css'/>");
        } else {
            var link = document.createElement("link");
            link.setAttribute("rel", "stylesheet");
            link.setAttribute("type", "text/css");
            link.setAttribute("href", url);
            getHead().appendChild(link);
        }
    };
 
//
// java script for itravel-tech gmap view's global variable
//
 
// for map
var gvbMapInit = false;
var gvbChinaMap = false;
var gvoMap = null;   // map object of gmap
var gvoGE = null;    // earth object of gmap
var gvoaMapTypes = null;     // map types of gmap
var gvnFitZoom = 14; // zoom level for fit window
var gvoFitBound = null;
var gvoEnableEarthView = false;
var gvoCurrMapType = null;

// for search
var gvoLocalSearch = null;
var gvoSearchForm = null;
var gvoLocalSearchCtrl = null;

// refresh Google Map Timer
var gvoRefreshGoogleMapTimer = true;
var gvoRefreshTimeout = 30*60*1000; // 30mins
function SetRefreshTimer()
{
    if (gvoRefreshGoogleMapTimer == true)
        setTimeout("appReload();", gvoRefreshTimeout);
}


// include icon image URL JS file
var gvoIconImageURLPath = null;
includeJavascriptFile("http://www.iTravel-Tech.com/PhotoTagger/loadIconUrl.js");

// icons ...
var gvoLocateIcon = null;
var gvoLineIcon = null;
var gvoLineMinimapPOIIcon = null;
var gvoUserPOIIcon = null;
var gvoUserDestIcon = null;
var gvoSearchIcon = null;
var gvoGraphMarkerIcon1 = null;
var gvoGraphMarkerIcon2 = null;

// type icon marker
var gvoTypeIconMarkerAry = [];
var gvoTypeIconAry = [];

// markers ...
var gvoLocateMarker = null;
var gvoLocateLabel = null;
var gvoGraphMarker1 = null;
var gvoGraphMarker2 = null;

// tracker markers
var gvoTrackerMarkerAry = null;
var gvoTrackerMarkerIconAry = null;
var gvoLastVisibleTrackMarker = null;

// focus ...
var gvnCurZoom = 14; // zoom level for current window
var gvnCurPOIID = 0;
var gvnCurLineID = 0;
var gvoCenterPoint = null;
var gvoCurMapBounds = null; // full bounds of data
var gvsCurMapType = null;
var gvbBullonOnfocus = false;
var gvoAddPOI = {'mode':false, 'maker':null, 'moveHDL':null, 'clickHDL':null};

// default color array 
var gvoaColors = ['#5500ff','#ff007f','#555500','#aa55ff','#00aa7f','#aaaa00','#55ffff','#ffff7f','#550000','#00557f'];

// communicate with app
var gvsProductPath = null;
var gvbAppSelectFlag = false;
var gvnPoiType = 9;
var gvnLineType = 11;

// data
var gvoInitOption = null;
var gvoaMarkers = null;
var gvoaLines = null;
var gvoaIcons = [];

// trackList combo box
var gTrackListCmbBox = null;
var gPhotoListCtrl = null;

// viewing option
var gDisplayLogo = false;
var gDisplayLogoFileName = null;

// function option
var gCanAddDestination = false;
var gApJsCtrl = true;
var gvoEnableEarthView = true;
var gvoEnableEditMap = true;
//var gvoEnableScreenCapture = true;
var gvoEnableScreenCapture = false;
var gvoEnableGraphMarkers = false;

// debug
var gvbDebug = 0;

// define ObjectList class
var ObjectList = function(objectListBarIdName) {
    // private properties, e.g. strings to translate
    var m_objectListBarDom = document.getElementById(objectListBarIdName);
    
    var m_trackListDomId = 'trackSelect';
    var m_trackListDom = null;
    var m_allTracks = 'All Tracks';
    
    // private methods
	    
    return {       
        // public methods
        insertNewTrack: function(pnLine) {
            if (m_objectListBarDom.innerHTML == '') {
               m_trackListDom = document.createElement('select');
               m_trackListDom.setAttribute('id', m_trackListDomId);
               m_trackListDom.style.width = "175px";
               m_trackListDom.onchange = function() { gTrackListCmbBox.selectCurrentTrack(); };
               m_objectListBarDom.appendChild(m_trackListDom);
                    
               //var allTracksOption = new Option(m_allTracks, m_allTracks);
               //allTracksOption.id = m_allTracks;
               //m_trackListDom.add(allTracksOption, 0);
               //allTracksOption.selected = true;
            }
            var newTrackOptionDom = document.createElement('option');
            m_trackListDom.appendChild(newTrackOptionDom);
            newTrackOptionDom.setAttribute('id', 'track_'+pnLine.id);
            newTrackOptionDom.text = pnLine.name;
            newTrackOptionDom.value = pnLine.id;
        },
        updateCurrentSelection: function(pnLine) {
            if (!m_trackListDom)
                return -1;
            
            if (pnLine) {
                var i = 1;
                for (i = 1; i < m_trackListDom.length; i++) {
                    if (m_trackListDom.options[i].id == 'track_'+pnLine.id) {
                        m_trackListDom.selectedIndex = i;
                        return i;
                    }
                }
            } else {
                m_trackListDom.selectedIndex = 0;
            }
            return m_trackListDom.selectedIndex;
        },
        selectCurrentTrack: function() {
            if (!m_trackListDom)
                return;
                
            var optionValue = m_trackListDom.options[m_trackListDom.selectedIndex].value;
            //if (optionValue != m_allTracks) {
                onFitLine('gvnLineType', optionValue);
                var line = findLine(optionValue);
                if (line != null && line.startMarker != null && GEvent != null) {
                    if (line.locationMarker != null) {
                        if (gvoLocateMarker != null) {
                            gvoLocateMarker.hide();
                        }
                        gvoLocateMarker = line.locationMarker;
                        gvoLocateMarker.setPoint(line.startMarker.getLatLng());
                        gvoLocateMarker.show();
                    }
                   GEvent.trigger(line.startMarker, "click");
                   var latlng = line.startMarker.getLatLng();
                   onPosition(latlng.lat(), latlng.lng());
                }
            //} else {
            //    gvoMap.getInfoWindow().hide();
            //    var boundsCenter = gvoFitBound.getCenter();
            //    var fitZoomLevel = gvoMap.getBoundsZoomLevel(gvoFitBound);
            //    gvoMap.setCenter(boundsCenter, fitZoomLevel-1);
            //}
        }
    }
};

// define PhotoList class
var PhotoList = function(photoListWndId) {
    // private properties, e.g. strings to translate
    var m_photoListWndDom = document.getElementById(photoListWndId);
    
    // private methods
	    
    return {       
        // public methods
        insertNewPhoto: function(photoId, poiId) {
            var photoThumb = photoId.thumb;
            var photoTitle = photoId.title;
            var newLink = document.createElement('a');
            newLink.href = 'javascript:OnClick=gPhotoListCtrl.selectPhoto('+ poiId.id +')';
            newLink.title = photoTitle;
            newLink.className = 'toggleborder';
            
            //var newImage = document.createElement('img');
            var newImage = new Image();
            newImage.src = photoThumb;
            newImage.alt = photoTitle;
            newImage.border = "0px";
            newImage.style.padding = "1px 1px";
            
            newLink.appendChild(newImage);
            m_photoListWndDom.appendChild(newLink);
        },
        selectPhoto: function(poiId) {
            if (gvoMap != null)
                gvoMap.getInfoWindow().hide();
            gvbBullonOnfocus = true; 
            onSelectPOI(gvnPoiType, poiId);
        },
        showPhotoList: function() {
            for (var i = 0; i< gvoaMarkers.length; i++) {
                var poPoi = gvoaMarkers[i];
                if (poPoi == null)
                    continue;
                for (var j=0; j < poPoi.photos.length; j++) {
                    if (poPoi.photos[j] == null)
                        continue;
                    this.insertNewPhoto(poPoi.photos[j], poPoi);
                }
            }
        }
    }
};

// functions ...
function initLayout() {
    if (gvbDebug == true) {
        includeJavascriptFile(gvsProductPath+"dump.js");
    }
    
    commSendCmd('onInitLayout');

    var voDivGmap = document.createElement('div');
    voDivGmap.setAttribute('id', 'gMap');
    document.body.appendChild(voDivGmap);

    if (gApJsCtrl == false) { // for export html
        // create photo list
        if (getPhotoNum() != 0) {
            var voPhotoList = document.createElement('div');
            voPhotoList.setAttribute('id', 'photoList');
            document.body.appendChild(voPhotoList);
            
            document.body.style.padding = "0 180px 0 0";
        } else {
            // remove slide show button
            gvoInitOption.tBar.funcSlideShow = false;
        }
        // create object list bar
        var voObjectListBar = document.createElement('div');
        voObjectListBar.setAttribute('id', 'objectListBar');
        document.body.appendChild(voObjectListBar);
        if (getPhotoNum() != 0) {
            voObjectListBar.style.right = "215px";
        } 
        gTrackListCmbBox = new ObjectList('objectListBar');
        gPhotoListCtrl = new PhotoList('photoList');
        gPhotoListCtrl.showPhotoList();
    } 
         
    if (typeof(GMap2) != 'undefined') {
        // sBar
        //if (gvoInitOption.sBar == true) {
        //    var voDivSBar = document.createElement('div');
        //    voDivSBar.setAttribute('id', 'sBar');
        //    document.body.appendChild(voDivSBar);
        //    var voDivSForm = document.createElement('div');
        //    voDivSForm.setAttribute('id', 'sForm');
        //    voDivSBar.appendChild(voDivSForm);
        //}  
        if (gvoInitOption.enableScreenCapture != null)
            gvoEnableScreenCapture = gvoInitOption.ScreenCapture;
            
        if (gvoEnableScreenCapture) {
            appCreateScreenCaptureButton();    
        }
        
        if (gvoInitOption.enableGraphMarker != null)
            gvoEnableGraphMarkers = gvoInitOption.enableGraphMarker;
            
        if (gvoInitOption.tBar != null) {
            var voDivTBar = document.createElement('div');
            voDivTBar.setAttribute('id', 'tBar');
    
            // reload function
            //if (gvoInitOption.tBar.funcReload == true)
            //    voDivTBar.innerHTML = "<a href='javascript:OnClick=appReload()' title='Reload'><img src='"+gvsProductPath+"web/js/imgctrl/images/refresh.png' class='cButton' /></a>";
    
            // slideshow function
            if (gvoInitOption.tBar.funcSlideShow == true) {
                var tempHTML = "<a href='javascript:OnClick=actSlideShow()' title='"+strTBar_SlideShow_Tip+"'><img src='"+gvsProductPath+"web/js/imgctrl/images/show.png' class='cButton' /></a>";
                voDivTBar.innerHTML += tempHTML;
            }
      
            // add poi function
            if (gvoInitOption.tBar.funcAddPOI == true) {
                gvoUserPOIIcon = new GIcon();
                if (gvoIconImageURLPath != null) {
                    gvoUserPOIIcon.image = gvoIconImageURLPath + "add_poi.png";
                } else {
                    gvoUserPOIIcon.image = "http://maps.google.com/mapfiles/kml/pal4/icon48.png";
                }
                gvoUserPOIIcon.iconSize = new GSize(22, 22);
                gvoUserPOIIcon.iconAnchor = new GPoint(11, 21);
                
                var tempHTML = "<a href='javascript:OnClick=userPOI()' title='"+strTBar_AddPlaceMark_Tip+"'><img src='"+gvoUserPOIIcon.image+"' class='cButton' width=22 /></a>";
                voDivTBar.innerHTML += tempHTML;
            }
            
            // add destination function
            if (gCanAddDestination == true) {
                gvoUserDestIcon = new GIcon();
                if (gvoIconImageURLPath != null) {
                    gvoUserDestIcon.image = gvoIconImageURLPath + "destination.png";
                } else {
                    gvoUserDestIcon.image = "http://maps.google.com/mapfiles/kml/pal4/icon49.png";
                }
                gvoUserDestIcon.iconSize = new GSize(22, 22);
                gvoUserDestIcon.iconAnchor = new GPoint(11, 11);
                gvoUserDestIcon.infoWindowAnchor = new GPoint(11, 11);

                var tempHTML = "<a href='javascript:OnClick=userDest()' title='"+strTBar_AddDestination_Tip+"'><img src='"+gvoUserDestIcon.image+"' class='cButton' width=22 /></a>";
                voDivTBar.innerHTML += tempHTML;
            }
            
            if (gvoInitOption.tBar.funcSlideShow == true ||
                gvoInitOption.tBar.funcAddPOI == true ||
                gCanAddDestination == true) {
                document.body.appendChild(voDivTBar);
                
                if (getPhotoNum() != 0 && gApJsCtrl == false) {
                    voDivTBar.style.right = "190px";
                }
            }
        }
    }
}

function initGData() {
    gvoLocateIcon = createIcon(gvoInitOption.iconPosOpt);
    gvoLineIcon = createIcon(gvoInitOption.iconLineOpt);
    gvoLineMinimapPOIIcon = createIcon(gvoInitOption.iconMinimapPoiOpt);

    if (gvoInitOption.callByReload == true || (gvoaMarkers.length == 0 && gvoaLines.length == 0)) {
        gvoFitBound = new GLatLngBounds(new GLatLng(gvoInitOption.startLat, gvoInitOption.startLon), new GLatLng(gvoInitOption.startLat, gvoInitOption.startLon));
        gvoCenterPoint = new GLatLng(gvoInitOption.startLat, gvoInitOption.startLon);
    } else {
        gvoFitBound = new GLatLngBounds(new GLatLng(gvoInitOption.minLat,gvoInitOption.minLon), new GLatLng(gvoInitOption.maxLat,gvoInitOption.maxLon));
        gvoCenterPoint = new GLatLng((gvoInitOption.minLat+gvoInitOption.maxLat)/2, (gvoInitOption.minLon+gvoInitOption.maxLon)/2);
    }
  
    if (gApJsCtrl) {
        // Create "Search result" arrow marker icon
        gvoSearchIcon = new GIcon();
        if (gvoIconImageURLPath != null) {
            gvoSearchIcon.image = gvoIconImageURLPath + "arrow_location.png";
        } else {
            gvoSearchIcon.image = "http://maps.google.com/mapfiles/kml/shapes/poi.png";
        }
        //gvoSearchIcon.shadow = "http://labs.google.com/ridefinder/images/mm_20_shadow.png";
        gvoSearchIcon.iconSize = new GSize(23, 34);
        //gvoSearchIcon.shadowSize = new GSize(22, 20);
        gvoSearchIcon.iconAnchor = new GPoint(11, 33);
        gvoSearchIcon.infoWindowAnchor = new GPoint(14, 1);
    }
    if (gvoEnableGraphMarkers) {
        gvoGraphMarkerIcon1 = new GIcon();
        gvoGraphMarkerIcon1.image = "http://maps.google.com/mapfiles/kml/pal3/icon0.png";
        gvoGraphMarkerIcon1.iconSize = new GSize(16, 16);
        gvoGraphMarkerIcon1.iconAnchor = new GPoint(7, 7);
        
        gvoGraphMarkerIcon2 = new GIcon();
        gvoGraphMarkerIcon2.image = "http://maps.google.com/mapfiles/kml/pal3/icon1.png";
        gvoGraphMarkerIcon2.iconSize = new GSize(16, 16);
        gvoGraphMarkerIcon2.iconAnchor = new GPoint(7, 7);
    }
}

function initTypeIconMarker() {
    // init line and type mapping
    if (gvoInitOption.iconTypeAryOpt != null) {
        var i = 0;
        for (i = 0; i < gvoInitOption.iconTypeAryOpt.length; i++) {
            gvoTypeIconAry[i] = createIcon(gvoInitOption.iconTypeAryOpt[i]);
            gvoTypeIconMarkerAry[i] = new GMarker(new GLatLng(0, 0), gvoTypeIconAry[i]); 
            gvoMap.addOverlay(gvoTypeIconMarkerAry[i]); 
            gvoTypeIconMarkerAry[i].hide();
        }                     
    }
}

///////////////////////////////////////////////////////////////////////////////
/// MAIN FUNCTION
///////////////////////////////////////////////////////////////////////////////
function mapMain() {
    // init lytebox.
    myLytebox = new LyteBox();
    
    // init google map
    if (typeof(GBrowserIsCompatible) != 'undefined' && 
        typeof(GMap2) != 'undefined' &&
        GBrowserIsCompatible()) {
        gvbMapInit = true;
  
        if (gvoLocateIcon == null)  initGData();
    
        // create google map
        gvoMap = new GMap2(document.getElementById("gMap"));
        
        // add control
        var mapCtrlPos = null;
        if (gvoInitOption.logo != null) {
           mapCtrlPos = new GControlPosition(G_ANCHOR_TOP_LEFT, new GSize(5, 35));
        }
        if (gvoInitOption.mapLargeControl == true)
            gvoMap.addControl(new GLargeMapControl(), mapCtrlPos);
        else
            gvoMap.addControl(new GSmallMapControl(), mapCtrlPos);
      
        if (gvoInitOption.mapOverview == true) {
            var overviewMap = new GOverviewMapControl();
            gvoMap.addControl(overviewMap);
            //overviewMap.hide(true);
        }
    
        if (gvoInitOption.enableEarthView != null)
            gvoEnableEarthView = gvoInitOption.enableEarthView;
    
        gvoMap.addControl(new GHierarchicalMapTypeControl());
        gvoMap.addMapType(G_PHYSICAL_MAP);
        if (gvoEnableEarthView == true)
            gvoMap.addMapType(G_SATELLITE_3D_MAP);
        gvoaMapTypes = gvoMap.getMapTypes();
    
        if (gvoInitOption.callByReload == true || (gvoaMarkers.length == 0 && gvoaLines.length == 0)) {
            gvnCurZoom = gvoInitOption.zoomLevel;
            gvnFitZoom = gvoInitOption.zoomLevel;
        } else {
            gvnCurZoom = gvoMap.getBoundsZoomLevel(gvoFitBound);
            gvnFitZoom = gvnCurZoom;
        }
    
        gvoMap.setCenter(gvoCenterPoint, gvnCurZoom);
        gvoCurMapBounds = gvoMap.getBounds();
        gvoMap.enableDoubleClickZoom();
        gvoMap.enableContinuousZoom();
        gvoMap.enableScrollWheelZoom();
        gvoCurrMapType = gvoMap.getCurrentMapType();
    
        // Initialize the local searcher
        // create google search control
        /*
        if (gvoInitOption.sBar == true) {
            //gvoSearchForm = new GSearchForm(false, document.getElementById("sForm"));
            //gvoSearchForm.setOnSubmitCallback(null, onSearchForm);
            //gvoSearchForm.input.focus();
            //gvoLocalSearch = new GlocalSearch();
            //gvoLocalSearch.setCenterPoint(gvoMap);
            //gvoLocalSearch.setSearchCompleteCallback(null, onLocalSearch);
            
            // new Google Local Search Control
            var localSearchOptions = {
                onLocalSearchCompleteCallback : onLocalSearchSearchComplete,
                onGenerateMarkerHtmlCallback : onLocalSearchMarkerHtml
            };
            if (typeof(google) != 'undefined') {
                gvoLocalSearchCtrl = new google.maps.LocalSearch(localSearchOptions);
                var localSearchCtrlPos = new GControlPosition(G_ANCHOR_BOTTOM_LEFT, new GSize(3, 35));
                gvoMap.addControl(gvoLocalSearchCtrl, localSearchCtrlPos);
                gvoLocalSearchCtrl.focus();
            }
        }
        */
        
        // add map scale control
        var scaleCtrlPos = null;
        if (gApJsCtrl == false) { // for export html
            scaleCtrlPos = new GControlPosition(G_ANCHOR_BOTTOM_LEFT, new GSize(5, 5));
        } else {
            scaleCtrlPos = new GControlPosition(G_ANCHOR_BOTTOM_LEFT, new GSize(75, 5));
        }
        gvoMap.addControl(new GScaleControl(), scaleCtrlPos);
    
        // Display Logo
        if (gDisplayLogo == true && gDisplayLogoFileName != null) {
            var logo = new GScreenOverlay(
                gvsProductPath+gDisplayLogoFileName,
                new GScreenPoint(0, 30, 'pixels', 'pixels'),  // screenXY
                new GScreenPoint(0, 0),  // overlayXY
                new GScreenSize(96, 96)  // size on screen
            );
            gvoMap.addOverlay(logo);
        }     
        
        // show logo control
        if (gvoInitOption.logo != null) {
            // define logo control
            var LogoControl = function(url) {
                this.url_ = url;
            };
            LogoControl.prototype = new GControl(true);
            LogoControl.prototype.initialize = function(map) {
                var container = document.createElement("div");
                container.innerHTML = '<img style="cursor:pointer" src="'+gvoInitOption.logo.imgURL+'" title="'+gvoInitOption.logo.imgAlt+'" alt="'+gvoInitOption.logo.imgAlt+'" border=0 />';
                container.style.width = gvoInitOption.logo.width;
                container.style.height = gvoInitOption.logo.height;
                url = this.url_;
                GEvent.addDomListener(container, "click", function() {
                    window.open(url);
                });
                map.getContainer().appendChild(container);
                return container;
            }
            LogoControl.prototype.getDefaultPosition = function() {
                return new GControlPosition(G_ANCHOR_TOP_LEFT, new GSize(5, 5));
            };
            gvoMap.addControl(new LogoControl(gvoInitOption.logo.url));
        }
        
        initTypeIconMarker();
        drawLineMarkers();
        drawPointMarkers();
    
        if (window.attachEvent) { 
            window.attachEvent("onresize", function() { appZoomTo(); } ); 
        } else { 
            window.addEventListener("resize", function() { appZoomTo(); } , false); 
        } 
        GEvent.addListener(gvoMap, 'zoomend', function () { appZoomTo(); });
        GEvent.addListener(gvoMap, 'moveend', function () { appZoomTo(); });
        GEvent.addListener(gvoMap, 'infowindowclose', function () { gvbBullonOnfocus = false; gvnCurPOIID = 0; });
        GEvent.addListener(gvoMap, 'mousemove', function (latlng) {
            if (gvoAddPOI != null && gvoAddPOI.mode == true)
                return;
                
            commSendCmd("mapMouseMove:"+latlng.lat()+":"+latlng.lng());
             if (gvoLocalSearchCtrl != null && gvoMap.getCurrentMapType().getName() != "Earth")
                 gvoLocalSearchCtrl.focus();
        });
        GEvent.addListener(gvoMap, 'maptypechanged', function() {
            var currMapName = "OtherMap";
            switch (gvoMap.getCurrentMapType()) {
                case G_NORMAL_MAP:
                    currMapName = "NormalMap";
                    break;
                case G_SATELLITE_MAP:
                    currMapName = "SatelliteMap";
                    break;
                case G_HYBRID_MAP:
                    currMapName = "HybridMap";
                    break;
                case G_PHYSICAL_MAP:
                    currMapName = "PhysicalMap";
                    break;
                case G_SATELLITE_3D_MAP:
                    currMapName = "Earth";
                    break;
                default:
                    break;
            }

            // if switch to earth view, switch back        
            if (gvoMap.getCurrentMapType() == G_SATELLITE_3D_MAP) {
                gvoMap.setMapType(gvoCurrMapType); // set to old map type
            }
            commSendCmd("mapTypeChanged:"+currMapName);
            //if (gvoMap.getCurrentMapType() == G_SATELLITE_3D_MAP) {
            //    gvoMap.getEarthInstance(function(ge) { gvoGE = ge; } );
            //}

            gvoCurrMapType = gvoMap.getCurrentMapType();
        });
    
        // for initial status
        if (gvoaMapTypes.length > 0) {
            if (gvsCurMapType)
                gvoMap.setMapType(findMapType(gvsCurMapType));
            else
                gvoMap.setMapType(findMapTypeByID(gvoInitOption.mapType));
        }
    
        if (gvnCurPOIID > 0)
            onSelectPOI(gvnPoiType, gvnCurPOIID);
            
        if (gvoInitOption.fitToTrack == true) {
            onFitLine('gvnLineType', null);
        }
        SetRefreshTimer();
        commSendCmd('onInitGMap');
    } else {
        var voDivGMap = document.getElementById('gMap');
        voDivGMap.innerHTML = strFailToLoadGoogleMap;
    }
}

function getPhotoNum()
{
    var nPhotoNum = 0;
    if (gvoaMarkers != null)
    for (var i = 0; i< gvoaMarkers.length; i++) {
         var poPoi = gvoaMarkers[i];
         if (poPoi != null && poPoi.photos != null)
            nPhotoNum += poPoi.photos.length;
    }
    
    return nPhotoNum;
}

///////////////////////////////////////////////////////////////////////////////
/// Functions for map drawing
///////////////////////////////////////////////////////////////////////////////
function createIcon(poIconOpt)
{
    if (gvbDebug == 1)
        GLog.write("createIcon("+poIconOpt.relPath+","+poIconOpt.fileName+")");
    var icon = new GIcon();
    if (gvoIconImageURLPath != null) {
        icon.image = gvoIconImageURLPath + poIconOpt.fileName;
    } else {
        icon.image = "http://maps.google.com/mapfiles/kml/pal5/icon13.png";
    }
    icon.iconSize = new GSize(poIconOpt.width, poIconOpt.height);
    icon.iconAnchor = new GPoint(poIconOpt.anchorX, poIconOpt.anchorY);
    icon.infoWindowAnchor = new GPoint(poIconOpt.width/2, poIconOpt.height/2);
    return icon;
}

function createLineMarker(poLine) {
    var markerOptions = { title: poLine.name, icon: gvoLineIcon };
    var marker = new GMarker(new GLatLng(poLine.startLat, poLine.startLon), markerOptions);
    GEvent.addListener(marker, "click", function() {
        marker.openInfoWindowHtml(infoLine(poLine));
        var minimapDiv = document.getElementById("minimap");
        if (minimapDiv == null)
            return;
        var minimap = new GMap(minimapDiv);
        minimap.centerAndZoom(marker.getPoint(),2);
        minimap.addControl(new GSmallMapControl( ));
        var CopyrightDiv = minimapDiv.firstChild.nextSibling;
		var CopyrightImg = minimapDiv.firstChild.nextSibling.nextSibling;
		CopyrightDiv.style.display = "none"; 
		CopyrightImg.style.display = "none";
		var miniMapLineMarkerOptions = { title: poLine.name, icon: gvoLineIcon };
		
		var lat = poLine.startLat;
		var lng = poLine.startLon;

		minimap.addOverlay(new GMarker(new GLatLng(lat, lng), miniMapLineMarkerOptions));
    });
    poLine.startMarker = marker;
    // assign line location marker
    // -- gvoTypeIconMarkerAry
    // -- gvoTypeIconAry
    if (gvoInitOption.trackTypeMappingAry != null) {
        var i = 0;
        for (i = 0; i < gvoInitOption.trackTypeMappingAry.length; i++) {
            if (poLine.name == gvoInitOption.trackTypeMappingAry[i].trackName) {
                poLine.locationMarker = gvoTypeIconMarkerAry[gvoInitOption.trackTypeMappingAry[i].type];
                break;
            }
        }                     
    }
    return marker;
}

function drawLineMarkers() {
    if (gvoMap == null)
        return;
        
    if (gvoaLines.length > 0) {
        for (var i=0; i<gvoaLines.length; i++) {
            gvoMap.addOverlay(createLineMarker(gvoaLines[i]));

            var polyline;
            if (gvoaLines[i].width > 0)
                polyline = new GPolyline.fromEncoded({ color:gvoaLines[i].color, weight:gvoaLines[i].width, opacity:0.7, points:gvoaLines[i].num, zoomFactor:2.1, levels:gvoaLines[i].lev,  numLevels:18 });
            else
                polyline = new GPolyline.fromEncoded({ color:colors[i%10], weight:5, opacity:0.7, points:gvoaLines[i].num, zoomFactor:2.1, levels:gvoaLines[i].lev,  numLevels:18 });
        
            gvoaLines[i].marker = polyline;  
            gvoMap.addOverlay(polyline);
            
            if (gApJsCtrl == false) // export html
                gTrackListCmbBox.insertNewTrack(gvoaLines[i]);
        }
        if (gApJsCtrl == false) {
            gTrackListCmbBox.selectCurrentTrack();
        }
    }
}

function onClickMarker(marker, poPoi) {
    if (gvoMap == null)
        return;
        
    var bDestMarker = false;
    if (marker.getIcon() == gvoUserDestIcon)
        bDestMarker = true;
        
    if (gvoLocateMarker == null) { 
        gvoLocateMarker = new GMarker(marker.getPoint(), gvoLocateIcon); 
        gvoMap.addOverlay(gvoLocateMarker); 
    } else {
        gvoLocateMarker.setPoint(marker.getPoint());
    }
        
    //marker.openInfoWindowTabsHtml(infoMarker(poPoi, bDestMarker));
    //bindMiniMap(marker);
    gvbBullonOnfocus = true;
    myLytebox.updateLyteboxItems();
    if (gvnCurPOIID != poPoi.id) {
        gvnCurPOIID = poPoi.id;
        if (gvbAppSelectFlag == false) { 
            commSendCmd('onSelectPOI:'+gvnPoiType+':'+poPoi.id); 
        } else { 
            gvbAppSelectFlag = false; 
        }
    }
}

function createMarker(poPos, poPoi, icon) {
    if (gvoMap == null)
        return;
        
    if (icon == null && poPoi.icon != null) {
        if (gvoaIcons[poPoi.icon] == null) {
            // create icon
            icon = new GIcon();
            if (gvoIconImageURLPath != null) {
                icon.image = gvoIconImageURLPath + poPoi.icon;
            } else {
                icon.image = "http://maps.google.com/mapfiles/kml/pal5/icon14.png";
            }
            icon.iconSize = new GSize(32, 32);
            icon.iconAnchor = new GPoint(16, 16);
            icon.infoWindowAnchor = new GPoint(16, 16);
                
            gvoaIcons[poPoi.icon] = icon;
        } else {
            icon = gvoaIcons[poPoi.icon];
        }
    }
    var markerOptions = { title: poPoi.name, icon: icon };
    var marker = new GMarker(poPos, markerOptions);
    poPoi.marker = marker;

//     if (gvoLocateMarker == null) { 
//         gvoLocateMarker = new GMarker(marker.getPoint(), gvoLocateIcon); 
//         gvoMap.addOverlay(gvoLocateMarker); 
//     }
    
    var bDestMarker = false;
    if (marker.getIcon() == gvoUserDestIcon)
        bDestMarker = true;
    //marker.bindInfoWindowTabsHtml(infoMarker(poPoi, bDestMarker));
    marker.bindInfoWindowHtml(infoMarker(poPoi, bDestMarker));
    //myLytebox.updateLyteboxItems(); 

    
    GEvent.addListener(marker, "click", function() {
        onClickMarker(marker, poPoi);
        //bindMiniMap(marker);
    });
  
    GEvent.addListener(marker, "dblclick", function() {
        var point = marker.getPoint();
        
        if (gvoLocateMarker == null) { 
            gvoLocateMarker = new GMarker(marker.getPoint(), gvoLocateIcon); 
            gvoMap.addOverlay(gvoLocateMarker); 
        } else {
        gvoLocateMarker.setPoint(point);
        }

        if (wndPanCheck(point.lat(), point.lng()) == true) gvoMap.panTo(point); 
    });
        
    return marker;
}

function drawPointMarkers() {
    if (gvoMap == null)
        return;
        
    if (gvoaMarkers.length > 0) {
        for (var i=0; i<gvoaMarkers.length; i++) {
            var icon = null;
            if (gvoaMarkers[i].isdest == true)
                icon = gvoUserDestIcon;
            var lat = gvoaMarkers[i].lat;
            var lng = gvoaMarkers[i].lon;

            gvoMap.addOverlay(createMarker(new GLatLng(lat, lng), gvoaMarkers[i], icon));
        }
    }
}

function bindMiniMap(marker) {
    var minimapDiv = document.getElementById("minimap");
    var minimap = new GMap(minimapDiv);
    minimap.centerAndZoom(marker.getPoint(),2);
    var CopyrightDiv = minimapDiv.firstChild.nextSibling;
//     var CopyrightImg = minimapDiv.firstChild.nextSibling.nextSibling;
  	CopyrightDiv.style.display = "none"; 
//  	CopyrightImg.style.display = "none";	
 
    var markerOption = { icon: marker.getIcon(), title: marker.getTitle() };
	minimap.addOverlay(new GMarker(marker.getPoint(), markerOption));

    return minimap;
}

function infoSearchResultMarker(poSearchResult) {
     var info = '<div class="pmInfo" style="width: 230px; height: 270px">';
   
     if (poSearchResult != null) {
         if (poSearchResult.titleNoFormatting  != null) {
            info += '<b>'+poSearchResult.titleNoFormatting+'</b><br />';
            var strDescHtmlFormat = '';
            if (poSearchResult.streetAddress != null) {
                strDescHtmlFormat += poSearchResult.streetAddress+'<br />'; 
            }
            if (poSearchResult.city != null && poSearchResult.city != "") {
                strDescHtmlFormat += poSearchResult.city+' '; 
            }
            if (poSearchResult.region != null && poSearchResult.region != "") { 
                strDescHtmlFormat += poSearchResult.region+'<br />'; 
            }
            if (poSearchResult.country != null && poSearchResult.country != "") { 
                strDescHtmlFormat += poSearchResult.country+'<br />'; 
            }
            if (poSearchResult.phoneNumbers != null && poSearchResult.phoneNumbers[0] !=null) {
                strDescHtmlFormat += poSearchResult.phoneNumbers[0].number+'<br />'; 
            }
            
            var lat = poSearchResult.lat;
            var lng = poSearchResult.lng;
            
            if (gvoInitOption.poiCmd.funcEdit == true)
                info += '<a href="javascript:OnClick=appAddSearchResultAsPOI(\''+poSearchResult.titleNoFormatting+'\',\''+lat+'\',\''+lng+'\', false,\''+strDescHtmlFormat+'\')">'+strTBar_AddPlaceMark_Tip+'</a>';        
            if (gvoInitOption.poiCmd.funcSaveAsTarget == true)
                info += ' - <a href="javascript:OnClick=appAddSearchResultAsPOI(\''+poSearchResult.titleNoFormatting+'\',\''+lat+'\',\''+lng+'\', true,\''+strDescHtmlFormat+'\')">'+strInfoWin_SaveAsTarget_Cmd+'</a>';

            info +='<br /><br /><div class="poiFiles">';
            info += strDescHtmlFormat;
       
            info = info+'</div>';
            info += '<br /><div id="minimap" style="width: 200px; height: 150px"></div>';
         }
     } 
   
     info += '</div>'; 
     
     return info; 
}

function onLocalSearchMarkerHtml(marker, html, result) {
    var info = '<div class="pmInfo" style="width: 230px; height: 270px">';
   
    if (result != null) {
         if (result.titleNoFormatting  != null) {
            info += '<b>'+result.titleNoFormatting+'</b><br />';
            var strDescHtmlFormat = '';
            if (result.streetAddress != null) {
                strDescHtmlFormat += result.streetAddress+'<br />'; 
            }
            if (result.city != null && result.city != "") {
                strDescHtmlFormat += result.city+' '; 
            }
            if (result.region != null && result.region != "") { 
                strDescHtmlFormat += result.region+'<br />'; 
            }
            if (result.country != null && result.country != "") { 
                strDescHtmlFormat += result.country+'<br />'; 
            }
            if (result.phoneNumbers != null && result.phoneNumbers[0] !=null) {
                strDescHtmlFormat += result.phoneNumbers[0].number+'<br />'; 
            }
            
            var lat = result.lat;
            var lng = result.lng;
                  
            if (gvoInitOption.poiCmd.funcEdit == true)
                info += '<a href="javascript:OnClick=appAddSearchResultAsPOI(\''+result.titleNoFormatting+'\',\''+lat+'\',\''+lng+'\', false,\''+strDescHtmlFormat+'\')">'+strTBar_AddPlaceMark_Tip+'</a>';        
            
            if (gCanAddDestination == true)
                info += ' - <a href="javascript:OnClick=commSendCmd(\'UserAddDest:'+lat+':'+lng+':'+strDescHtmlFormat+'\')">'+strTBar_AddDestination_Tip+'</a>';
            
            if (gvoInitOption.poiCmd.funcSaveAsTarget == true)
                info += ' - <a href="javascript:OnClick=appAddSearchResultAsPOI(\''+result.titleNoFormatting+'\',\''+lat+'\',\''+lng+'\', true,\''+strDescHtmlFormat+'\')">'+strInfoWin_SaveAsTarget_Cmd+'</a>';

            info +='<br /><br /><div class="poiFiles">';
            info += strDescHtmlFormat;
       
            info = info+'</div>';
            info += '<br /><div id="minimap" style="width: 200px; height: 150px"></div>';
         }
     } 
   
     info += '</div>'; 
     html.innerHTML = info;
          
     GEvent.addListener(marker, "infowindowopen", function() {
        bindMiniMap(marker);
     });    
         
     return html; 
}

function onLocalSearchSearchComplete(searcher) {
    if (gvoMap == null)
        return;
        
    if (gvbMapInit == false || !searcher.results || searcher.results[0]==null)
        return;
    
    gvoMap.setCenter(new GLatLng(parseFloat(searcher.results[0].lat), parseFloat(searcher.results[0].lng)), 14);
}

///////////////////////////////////////////////////////////////////////////////
/// Functions for string procedure
///////////////////////////////////////////////////////////////////////////////
function jstringToHtml(jstring) {
    // remove new line from the end of string!
    while(jstring.charAt(jstring.length-1) == '\n' || jstring.charAt(jstring.length-1) == '\r')
    {  
        jstring = jstring.substring(0,jstring.length-1);
    }
    jstring = jstring.replace(/</g, '&lt;');
    jstring = jstring.replace(/>/g, '&gt;');
    jstring = jstring.replace(/\n/g,'<br />');
    return jstring;
}

///////////////////////////////////////////////////////////////////////////////
/// Functions for focus on
///////////////////////////////////////////////////////////////////////////////

function onLocalSearch() {
    if (gvoMap == null)
        return;
        
    if (gvbMapInit == false) return;
    
    if (!gvoLocalSearch.results || gvoLocalSearch.results[0]==null) {
        alert(strMsgCannotFindResult);
        return;
    }
        
    gvoMap.setCenter(new GLatLng(parseFloat(gvoLocalSearch.results[0].lat), parseFloat(gvoLocalSearch.results[0].lng)), 14);
    
    // create arrow location icon marker
    var markerOptions = { title: gvoLocalSearch.results[0].titleNoFormatting, icon: gvoSearchIcon };
    var locationMarker = new GMarker(new GLatLng(parseFloat(gvoLocalSearch.results[0].lat), parseFloat(gvoLocalSearch.results[0].lng)), markerOptions);
    gvoMap.addOverlay(locationMarker);
    locationMarker.openInfoWindowHtml(infoSearchResultMarker(gvoLocalSearch.results[0]));
    bindMiniMap(locationMarker);
    locationMarker.result = gvoLocalSearch.results[0];

    GEvent.addListener(locationMarker, "click", function() {
        locationMarker.openInfoWindowHtml(infoSearchResultMarker(locationMarker.result));
        bindMiniMap(locationMarker);
    });
}

function onSearchForm(searchForm) {
    if (gvoMap == null)
        return;
        
    if (gvbMapInit == false) return false;
    
    gvoLocalSearch.execute(searchForm.input.value);
    return false;
}

function onAddDest(pjsonPOI) {
    if (gvoMap == null)
        return;
        
    if (gvbMapInit == false) return;
    
    if (gvbDebug == true)
        GLog.write("onAddDest("+pjsonPOI+")");
    
    var poi = eval('('+pjsonPOI+')');
    
    var lat = poi.lat;
    var lng = poi.lon;

            
    gvoMap.addOverlay(createMarker(new GLatLng(lat, lng), poi, gvoUserDestIcon));
    gvoaMarkers.push(poi);
}

function onSelectLine(pnLineTyoe, pnLineID) {
    if (gvoMap == null)
        return;
        
    if (gvbMapInit == false) return;

    var line = findLine(pnLineID);
  
    if (line != null) {
        var point = new GLatLng(line.startLat, line.startLon); 
        gvoMap.panTo(point);
        /*
        var lineBound = new GLatLngBounds(new GLatLng(line.minLat,line.minLon), new GLatLng(line.maxLat,line.maxLon));
        gvoCenterPoint = new GLatLng((line.minLat+line.maxLat)/2, (line.minLon+line.maxLon)/2);
        gvnCurZoom = gvoMap.getBoundsZoomLevel(lineBound);
        gvoMap.setCenter(gvoCenterPoint, gvnCurZoom);
        gvoCurMapBounds = gvoMap.getBounds();
        */
        
        if (gApJsCtrl == false) // export html
            gTrackListCmbBox.updateCurrentSelection(gvoaLines[i]);
    }
}

function onToggleTrackDisplay(sToggleTrackDisplayAryJson) {
    //alert(sToggleTrackDisplayAryJson);
    var _toggleTrackDisplayAry = eval('('+sToggleTrackDisplayAryJson+')');
    
    for (var i = 0; i < _toggleTrackDisplayAry.length; i++) {
        var line = findLine(_toggleTrackDisplayAry[i].id);
        if (line != null) {
            if (_toggleTrackDisplayAry[i].check == "false")
                line.marker.hide();
            else
                line.marker.show();
        }
    }
}

function onFitLine(pnLineTyoe, pnLineID) {
    if (gvoMap == null)
        return;
        
    if (gvbMapInit == false) return;

    var line = findLine(pnLineID);
  
    if (line != null) {
        var lineBound = new GLatLngBounds(new GLatLng(line.minLat,line.minLon), new GLatLng(line.maxLat,line.maxLon));
        gvoCenterPoint = new GLatLng((line.minLat+line.maxLat)/2, (line.minLon+line.maxLon)/2);
        gvnCurZoom = gvoMap.getBoundsZoomLevel(lineBound);
        gvoMap.setCenter(gvoCenterPoint, gvnCurZoom);
        gvoCurMapBounds = gvoMap.getBounds();
    } else { // fit all tracks
        if (gvoaLines && gvoaLines.length > 0) {
            var lineBound = null;
            for (var i=0; i<gvoaLines.length; i++) {
                line = gvoaLines[i];
                if (i == 0) {
                    lineBound = new GLatLngBounds(new GLatLng(line.minLat,line.minLon), new GLatLng(line.maxLat,line.maxLon));
                } else {
                    lineBound.extend(new GLatLng(line.minLat,line.minLon));
                    lineBound.extend(new GLatLng(line.maxLat,line.maxLon));
                }
            }
            gvoCenterPoint = lineBound.getCenter();
            gvnCurZoom = gvoMap.getBoundsZoomLevel(lineBound);
            gvoMap.setCenter(gvoCenterPoint, gvnCurZoom);
            gvoCurMapBounds = gvoMap.getBounds();
        }
    }
    
    var newCP = gvoMap.getCenter();
    var mZoom = gvoMap.getZoom(); 
    commSendCmd("wndZoomTo:"+newCP.lat()+":"+newCP.lng()+":"+mZoom);
}

function onUpdateMarker(psMarkerJson) {
    if (gvoMap == null || gvbMapInit == false || gvoEnableGraphMarkers == false)
        return;
        
    var markerInfo = eval('('+psMarkerJson+')');
    var marker1Pos = new GLatLng(markerInfo.Marker1Lat, markerInfo.Marker1Lng);
    var marker2Pos = new GLatLng(markerInfo.Marker2Lat, markerInfo.Marker2Lng);

    if (gvoGraphMarker1 == null) { 
        var markerOptions = { title: markerInfo.Marker1, icon: gvoGraphMarkerIcon1 };
        gvoGraphMarker1 = new GMarker(marker1Pos, markerOptions); 
        gvoMap.addOverlay(gvoGraphMarker1); 
    } else {
        var lastPos = gvoGraphMarker1.getPoint();
        gvoGraphMarker1.setPoint(marker1Pos);
        if ((lastPos.lat() != marker1Pos.lat() || lastPos.lng() != marker1Pos.lng()) &&
            wndPanCheck(marker1Pos.lat(), marker1Pos.lng()) == true) {
            gvoMap.panTo(marker1Pos); 
        }
    }
    if (gvoGraphMarker2 == null) {
        var markerOptions = { title: markerInfo.Marker2, icon: gvoGraphMarkerIcon2 }; 
        gvoGraphMarker2 = new GMarker(marker2Pos, markerOptions); 
        gvoMap.addOverlay(gvoGraphMarker2); 
    }   else {
        var lastPos = gvoGraphMarker2.getPoint();
        gvoGraphMarker2.setPoint(marker2Pos);
        if ((lastPos.lat() != marker2Pos.lat() || lastPos.lng() != marker2Pos.lng()) &&
            wndPanCheck(marker2Pos.lat(), marker2Pos.lng()) == true) {
            gvoMap.panTo(marker2Pos); 
        }
    }
}

function onEditLine(psLineJson) {
    if (gvoMap == null)
        return;
        
    if (gvbMapInit == false) return;
    if (gvbDebug == true) {
        GLog.write("start - onEditLine("+psLineJson+")");
    }
    
    var newLine = eval('('+psLineJson+')');
    var pnID = newLine.id;
    
    if (pnID != null) {
        var lineAInd = findLineIndex(pnID);
        if (lineAInd != -1) {
            // remove overlap
			if (gvbDebug == true) {
				GLog.write("remove line's startMarker");
			}
            gvoMap.removeOverlay(gvoaLines[lineAInd].startMarker);
            gvoaLines[lineAInd].startMarker = null;
            
			if (gvbDebug == true) {
				GLog.write("remove line marker");
			}
            gvoMap.removeOverlay(gvoaLines[lineAInd].marker);
            gvoaLines[lineAInd].marker = null;
            
            // reset to new!
            gvoaLines[lineAInd] = newLine;
            
            // new start marker
            var sMarker = createLineMarker(gvoaLines[lineAInd]);
            
            // new line marker
            var polyline;
            if (gvoaLines[lineAInd].width > 0)
                polyline = new GPolyline.fromEncoded({ color:gvoaLines[lineAInd].color, weight:gvoaLines[lineAInd].width, opacity:0.7, points:gvoaLines[lineAInd].num, zoomFactor:2, levels:gvoaLines[lineAInd].lev, numLevels:18 });
            else
                polyline = new GPolyline.fromEncoded({ color:colors[i%10], weight:5, opacity:0.7, points:gvoaLines[lineAInd].num, zoomFactor:2, levels:gvoaLines[lineAInd].lev, numLevels:18 });
                
            gvoaLines[lineAInd].startMarker = sMarker;
            gvoaLines[lineAInd].marker = polyline;
            gvoMap.addOverlay(sMarker);
            gvoMap.addOverlay(polyline);
        }
    }
    if (gvbDebug == true) {
        GLog.write("end - onEditLine("+psLineJson+")");
    }
}

function onDelLine(psLineID) {
    if (gvoMap == null)
        return;
        
    if (gvbMapInit == false) return;
    
    var pnLineID = Number(psLineID);
    removeLine(pnLineID);
}

function onAddLine(psLineJson) {
    if (gvoMap == null)
        return;
        
    if (gvbMapInit == false) return;
    
    if (gvbDebug == true)
        GLog.write("onAddLine("+psLineJson+")");
    
    var objLine = eval('('+psLineJson+')');
    createLineMarker(objLine);
    if (objLine.width > 0)
		objLine.marker = new GPolyline.fromEncoded({ color:objLine.color, weight:objLine.width, opacity:0.7, points:objLine.num, zoomFactor:2, levels:objLine.lev,  numLevels:18 });
    else
        objLine.marker = new GPolyline.fromEncoded({ color:colors[i%10], weight:5, opacity:0.7, points:objLine.num, zoomFactor:2, levels:objLine.lev,  numLevels:18 });
    gvoMap.addOverlay(objLine.startMarker);
    gvoMap.addOverlay(objLine.marker);
    gvoaLines.push(objLine);
}

function onReplaceAllLines(psLinesJson) {
    if (gvoMap == null)
        return;
        
    if (gvbMapInit == false) return;
    
    if (gvoaLines && gvoaLines.length > 0) {
        for (var i=0; i<gvoaLines.length; i++) {
            if (gvoaLines[i].marker) {
                gvoMap.removeOverlay(gvoaLines[i].startMarker);
                gvoMap.removeOverlay(gvoaLines[i].marker);
                gvoaLines[i].marker = null;
            }
        }
    }
    gvoaLines = eval('('+psLinesJson+')');
    drawLineMarkers();
}

function onSelectPOI(pnType, pnID) {
    if (gvoMap == null)
        return;
        
    if (gvbMapInit == false) return;

    gvbAppSelectFlag = true;
    var poi = findPOI(pnID);
  
    if (poi != null && poi.marker != null){ 
        if (gvoLocateMarker == null) { 
        	gvoLocateMarker = new GMarker(poi.marker.getPoint(), gvoLocateIcon); 
        	gvoMap.addOverlay(gvoLocateMarker); 
        } else {
            gvoLocateMarker.setPoint(poi.marker.getPoint());
        }
    
        GEvent.trigger(poi.marker, "dblclick"); 
        if (gvbBullonOnfocus == true) {
        	GEvent.trigger(poi.marker, "click");
        }
    }
}

function onBindMiniMap(pnType, pnID) {
    if (gvoMap == null)
        return;
        
    if (gvbMapInit == false) return;
    var poi = findPOI(pnID);
    if (poi != null && poi.marker != null){ 
        if (gvbBullonOnfocus == true) {
            GEvent.trigger(poi.marker, "click");
        }
    }
}

function OnUpdatePoiInfoWindow(pnType, pnID) {
    if (gvoMap == null)
        return;
        
    if (gvnCurPOIID != pnID)
        return;
 
    var poi = findPOI(pnID);
    var _bullOnFocus = gvbBullonOnfocus;
    if (poi != null && poi.marker != null) {
        //if (_bullOnFocus == true) {
        //    poi.marker.closeInfoWindow();
        //    poi.marker.bindInfoWindow(null));
        //}
        
        //if (_bullOnFocus != true) {
        //    poi.marker.bindInfoWindow(infoMarker(poi));
       // }
        
        GEvent.trigger(poi.marker, "dblclick");
        if (_bullOnFocus == true) {
           GEvent.trigger(poi.marker, "click");             
        }
        
        // restore status
        gvnCurPOIID = pnID;
        gvbBullonOnfocus = _bullOnFocus;
    }
}

function onAddPOI(pjsonPOI) {
    if (gvoMap == null)
        return;
        
    if (gvbMapInit == false) return;
    
    if (gvbDebug == true)
        GLog.write("onAddPOI("+pjsonPOI+")");
    
    var poi = eval('('+pjsonPOI+')');
    var lat = poi.lat;
    var lng = poi.lon;

    gvoMap.addOverlay(createMarker(new GLatLng(lat, lng), poi), null);
    gvoaMarkers.push(poi);
}

function onEditPOI(psPoiJSON) {
    if (gvoMap == null)
        return;
        
    if (gvbMapInit == false) return;
    
    if (gvbDebug == true) {
        GLog.write("onEditPOI("+psPoiJSON+")");
    }
    
    var focusPOIID = gvnCurPOIID;
    var focusOn = gvbBullonOnfocus;
    var newPOI = eval('('+psPoiJSON+')');
    var pnID = newPOI.id;
    
    if (pnID != null) {
		var poiIndex = findPOIIndex(pnID);
        if (poiIndex != -1) {
            var icon = null; 
            // remove overlap
            if (gvoaMarkers[poiIndex].marker) {
                icon = gvoaMarkers[poiIndex].marker.getIcon();
                gvoMap.removeOverlay(gvoaMarkers[poiIndex].marker);
                gvoaMarkers[poiIndex].marker = null;
            }
        
            gvoaMarkers[poiIndex] = newPOI;
            gvoaMarkers[poiIndex].marker = createMarker(new GLatLng(newPOI.lat, newPOI.lon), gvoaMarkers[poiIndex], icon);
            gvoMap.addOverlay(gvoaMarkers[poiIndex].marker);
            
			if (gvbDebug == true)
				GLog.write("trigger("+focusPOIID+","+focusOn+")");				
            if (focusPOIID == pnID && focusOn == true) {
				GEvent.trigger(gvoaMarkers[poiIndex].marker, "click");
            }
        }
    }
}

function onDelPOI(psID) {
    if (gvoMap == null)
        return;
        
    if (gvbMapInit == false) return;
    
    var pnPOIID = Number(psID);
    removePOI(pnPOIID);
}

function onReplaceAllPOIs(psPOIsJson) {
    if (gvoMap == null)
        return;
        
    if (gvbMapInit == false) return;
    
    if (gvoaMarkers && gvoaMarkers.length > 0) {
        for (var i=0; i<gvoaMarkers.length; i++) {
            if (gvoaMarkers[i].marker) {
                gvoMap.removeOverlay(gvoaMarkers[i].marker);
                gvoaMarkers[i].marker = null;
            }
        }
    }
    
    gvoaMarkers = eval('('+psPOIsJson+')');
    drawPointMarkers();
}

function onPosition(psLat, psLng) { 
    if (gvoMap == null)
        return;
        
    if (gvbMapInit == false) return;
    
    if (gvoLocateMarker == null) { 
        gvoLocateMarker = new GMarker(new GLatLng(Number(psLat), Number(psLng)), gvoLocateIcon);
        gvoMap.addOverlay(gvoLocateMarker); 
    }
  
    if (gvoLocateMarker != null) { 
        var point = new GLatLng(Number(psLat), Number(psLng)); 
    
        gvoLocateMarker.setPoint(point);
         
        if (wndPanCheck(point.lat(), point.lng()) == true) 
        gvoMap.panTo(point); 
    }
}

function onTracker(psLat, psLng, nMarkerNo) { 
    if (gvoMap == null || gvbMapInit == false || gvoTrackerMarkerAry == null) return;
    
    if (nMarkerNo == -1) { // hide last tracker marker
        gvoLastVisibleTrackMarker.hide();
        gvoLastVisibleTrackMarker = null;
    }
    
    if (gvoTrackerMarkerAry != null) { 
        if (gvoLastVisibleTrackMarker != null)
            gvoLastVisibleTrackMarker.hide();
       
        gvoLastVisibleTrackMarker = gvoTrackerMarkerAry[nMarkerNo];
        var point = new GLatLng(Number(psLat), Number(psLng));     
        gvoLastVisibleTrackMarker.setPoint(point);
        gvoLastVisibleTrackMarker.show();
        if (wndPanCheck(point.lat(), point.lng()) == true) 
            gvoMap.panTo(point); 
        if (gvoMap.getZoom() < 12)
            gvoMap.setZoom(12);
    }
}

function onUpdateTrackerMarker(psTrackerMarkerJson) {
    if (gvoMap == null || gvbMapInit == false)
        return;
        
    gvoTrackerMarkerAry = [];
    var trackerMarkerAry = eval('('+psTrackerMarkerJson+')');
    for (var i=0; i < trackerMarkerAry.length; i++) {
        var info = trackerMarkerAry[i];
        // create icon
        var icon = new GIcon();
        icon.image = info.path + info.fileName;
        icon.iconSize = new GSize(info.width, info.height);
        icon.iconAnchor = new GPoint(info.anchorX, info.anchorY);
        icon.infoWindowAnchor = new GPoint(info.width/2, info.height/2);
        
        // create marker
        gvoTrackerMarkerAry[i] = new GMarker(new GLatLng(0, 0), icon);
        gvoMap.addOverlay(gvoTrackerMarkerAry[i]); 
        gvoTrackerMarkerAry[i].hide();
    }    
}

// function onTip(psLat, psLon, psMsg) {
//     if (gvbMapInit == false) return;
//     
//     if (gvoLocateLabel != null) {
//         gvoMap.removeTLabel(gvoLocateLabel);
//     }
//   
//     gvoLocateLabel = new TLabel();
//     gvoLocateLabel.id = 'l01';
//     gvoLocateLabel.anchorPoint = 'bottomLeft';
//     gvoLocateLabel.percentOpacity = 85;
//     gvoLocateLabel.anchorLatLng = new GLatLng (Number(psLat), Number(psLon));
//     gvoLocateLabel.markerOffset = new GSize (-3,0);
//     gvoLocateLabel.content = '<div class="posTip">'; 
//     gvoLocateLabel.content += psMsg;
//     gvoLocateLabel.content += '</div>';
//     gvoMap.addTLabel(gvoLocateLabel);
// }

function onPhotoSlideShow(psPhotos) {
    if (gvoMap == null)
        return;
        
    if (gvbMapInit == false) return;
    
    var photos = eval('('+psPhotos+')');
    if (photos && photos.length > 0)
    {
        myLytebox.userResetImage(); 
        for (var i=0; i<photos.length; i++) {
            myLytebox.userAppendImage(photos[i], true);
        }
        myLytebox.userStart(true);    
    }
}

function onPhotoShow(psPhoto, psPhotoTitle) {
    if (gvoMap == null)
        return;
        
    if (gvbMapInit == false) return;
    
    if (psPhoto) {
        myLytebox.userResetImage();
        myLytebox.userAppendPhoto(psPhoto, psPhotoTitle, false);
        myLytebox.userStart(false);
    }
}

function onPhotoClose() {
    if (gvoMap == null)
        return;
        
    if (gvbMapInit == false) return;
    myLytebox.end();
}

function showPoiInfo(PoiId, bDestMarker) {
    if (gvoMap == null)
        return;
        
    var poPoi = findPOI(PoiId);
    if (poPoi != null && poPoi.name != null) {
        var info = infoMarker(poPoi, bDestMarker);
        poPoi.marker.openInfoWindowHtml(info);
        myLytebox.updateLyteboxItems(); 
        gvbBullonOnfocus = true;
    } 
}

function showPoiLocation(PoiId, bDestMarker) {
    if (gvoMap == null)
        return;
        
    var poPoi = findPOI(PoiId);
    
    var location = '<div class="pmInfo">';

    if (poPoi != null && poPoi.name != null) {
        location += '<b>'+jstringToHtml(poPoi.name)+'</b>';
        location +=' - <a href="javascript:OnClick=showPoiInfo('+poPoi.id+','+bDestMarker+')">'+strInfoWin_BackToInfoCmd+'</a>';

        location += '<br /><br /><center><div id="minimap" style="width: 200px; height: 180px"></div></center></div>';
        poPoi.marker.openInfoWindowHtml(location);
        bindMiniMap(poPoi.marker);
        gvbBullonOnfocus = true;
    } 
}

function infoMarker(poPoi, bDestMarker) {
    var info = '<div class="pmInfo">';
    //var location = '<div class="pmInfo">';

    if (poPoi != null) {
        if (poPoi.name != null) { 
            info += '<b>'+jstringToHtml(poPoi.name)+'</b>';
            //location += '<b>'+jstringToHtml(poPoi.name)+'</b>';
      
            info+=' - <a href="javascript:OnClick=showPoiLocation('+poPoi.id+','+bDestMarker+')">'+strInfoWIn_ShowLocationCmd+'</a>';
            
            if (gvoInitOption.poiCmd.funcEdit == true) {
                if (bDestMarker != null && bDestMarker == true && gCanAddDestination == true) {
                    info+=' - <a href="javascript:OnClick=appEditDest('+poPoi.id+')">';
                    info+=strInfoWin_Edit_Cmd;
                    info+= '</a>';
                } else {
                    //info+=' - <a href="javascript:OnClick=appEditPOI('+poPoi.id+')">Edit</a>';
                    info+=' - <a href="javascript:OnClick=appEditPOI('+poPoi.id+')">';
                    info+=strInfoWin_Edit_Cmd;
                    info+= '</a>';
                }
            }
            
            if (gvoInitOption.poiCmd.funcSaveAsTarget == true) {
                //info+=' - <a href="javascript:OnClick=appPOISaveAsTarget('+poPoi.id+')">Save as target</a>';
                info+=' - <a href="javascript:OnClick=appPOISaveAsTarget('+poPoi.id+')">';
                info+=strInfoWin_SaveAsTarget_Cmd;
                info+='</a>';
            }
            
            info+='<br /><div class="poiFiles">';
            // time
            if (poPoi.UTC != null && poPoi.UTC.length == 6) {
				info+='<br />';
				var poiDate = new Date;
				poiDate.setUTCFullYear(poPoi.UTC[0], poPoi.UTC[1]-1, poPoi.UTC[2]);
				poiDate.setUTCHours(poPoi.UTC[3], poPoi.UTC[4], poPoi.UTC[5], 0);
				info+=poiDate.toLocaleString();
				info+='<br />';
            }
            
            if (poPoi.memo != null) { 
                //info=info+jstringToHtml(poPoi.memo); 
                info=info+poPoi.memo; 
            }
          
            for (var i=0; i<poPoi.photos.length; i++) {
                info=info+'<br /><a href="javascript:OnClick=onLyteBoxShow('+poPoi.id+','+i+')" title="'+poPoi.photos[i].title+'" ><img src="'+poPoi.photos[i].thumb+'" border="0" /></a><br />'+jstringToHtml(poPoi.photos[i].title)+'<br />';
            }
          
            info = info+'</div>'; 
        }
    } 
    info += '</div>';
     
   // location += '<br /><br /><center><div id="minimap" style="width: 200px; height: 180px"></div></center></div>';
    
    //var infoTab = new GInfoWindowTab("Info", info);
	//var miniMapTab = new GInfoWindowTab("Location", location);
	//var infoTabs = [infoTab, miniMapTab];
    //return infoTabs; 
    return info;
}

function infoLine(poLine) {
    var info = '<div class="lineInfo">';
  
    if (poLine != null) {
        if (poLine.name != null) { 
        info +='<b>'+jstringToHtml(poLine.name)+'</b> <a href="javascript:OnClick=onFitLine('+gvnLineType+', '+poLine.id+')"> - ';
        info +=strInfoWin_LineFit_Cmd;
        info +=' </a> <br />';
        info +='Start point: ' + poLine.startLat + ',' + poLine.startLon + '<br />';
        //info=info+'Start time: ' + poLine.startLat + ',' + poLine.startLon + '<br />';
        info +='Total Distance:' + poLine.distance + 'km <br />';
        info +='<div id="minimap" style="width: 200px; height: 150px"></div>';
        }
    }
  
    info += '</div>'; 
    return info; 
}

function infoPosition(pdLat, pdLng) {
    var info = '<div class="pmLocate"> (lat:'+pdLat+', lng:'+pdLng+') </div>';
    return info; 
}


///////////////////////////////////////////////////////////////////////////////
/// Functions for finding objects
///////////////////////////////////////////////////////////////////////////////
function findPOI(pnPoiID) {
    if (gvoaMarkers && gvoaMarkers.length > 0) {
        for (var i=0; i<gvoaMarkers.length; i++) {
            if (gvoaMarkers[i].id == pnPoiID)
                return gvoaMarkers[i];
        }
    } 
    return null;
}

function findPOIIndex(pnPoiID) {
    if (gvoaMarkers && gvoaMarkers.length > 0) {
        for (var i=0; i<gvoaMarkers.length; i++) {
            if (gvoaMarkers[i].id == pnPoiID)
                return i;
        }
    } 
    return -1;
}

function removePOI(pnPoiID) {
    if (gvoaMarkers && gvoaMarkers.length > 0) {
		var nID = -1;
        for (var i=0; i<gvoaMarkers.length; i++) {
            if (gvoaMarkers[i].id == pnPoiID)
				nID = i;
        }
        
        if (nID > -1) {
			if (gvoaMarkers[nID].marker) {
				gvoMap.removeOverlay(gvoaMarkers[nID].marker);
				gvoaMarkers[nID].marker = null;
			}
			gvoaMarkers.splice(nID, 1);
			
			// clear location marker
			if (gvoLocateMarker != null) {
			    gvoMap.removeOverlay(gvoLocateMarker);
			    gvoLocateMarker = null;
			}
        }
    } 
}

function findLine(pnLineID) {
    if (gvoaLines && gvoaLines.length > 0) {
        for (var i=0; i<gvoaLines.length; i++) {
            if (gvoaLines[i].id == pnLineID)
            return gvoaLines[i];
        }
    } 
  
    return null;
}

function findLineIndex(pnLineID) {
    if (gvoaLines && gvoaLines.length > 0) {
        for (var i=0; i<gvoaLines.length; i++) {
            if (gvoaLines[i].id == pnLineID)
            return i;
        }
    } 
    return -1;
}

function removeLine(pnLineID) {
    if (gvoaLines && gvoaLines.length > 0) {
		var nID = -1;
        for (var i=0; i<gvoaLines.length; i++) {
            if (gvoaLines[i].id == pnLineID)
				nID = i;
        }
        if (nID > -1) {
			if (gvoaLines[nID].marker) {
				gvoMap.removeOverlay(gvoaLines[nID].startMarker);
				gvoMap.removeOverlay(gvoaLines[nID].marker);
				gvoaLines[nID].marker = null;
			}
			gvoaLines.splice(nID, 1);
        }
    } 
}

function findMapTypeIndex(psTypeName) {
    if (gvbMapInit == false) return 0;

    var i=0;
  
    for (i=0; i<gvoaMapTypes.length; i++) {
        if (psTypeName == gvoaMapTypes[i].getName())
            return i;
    }
  
    return 0;
}

function findMapType(psTypeName) {
   if (gvbMapInit == false) return 0;

    var i=0;
  
    for (i=0; i<gvoaMapTypes.length; i++) {
        if (psTypeName == gvoaMapTypes[i].getName())
            return gvoaMapTypes[i];
    }
  
    return 0;
}

function findMapTypeByID(pnID) {
    if (gvbMapInit == false) return 0;
    if (pnID < gvoaMapTypes.length)
        return gvoaMapTypes[pnID];
    else
        return 0;
}

///////////////////////////////////////////////////////////////////////////////
/// Functions for pan, zoom of windows
///////////////////////////////////////////////////////////////////////////////
function wndPanCheck(pdLat, pdLng) { 
    if (gvbMapInit == false) return false;
    
    if (gvoCurMapBounds == null) return false; 
    var dislat = (gvoCurMapBounds.getNorthEast().lat() - gvoCurMapBounds.getSouthWest().lat())/10*4; 
    var dislng = (gvoCurMapBounds.getNorthEast().lng() - gvoCurMapBounds.getSouthWest().lng())/10*4; 
    var lolat = gvoCurMapBounds.getCenter().lat() - dislat; 
    var hilat = gvoCurMapBounds.getCenter().lat() + dislat; 
    var lolng = gvoCurMapBounds.getCenter().lng() - dislng; 
    var hilng = gvoCurMapBounds.getCenter().lng() + dislng; 
  
    if (pdLat < lolat || pdLat > hilat || pdLng < lolng || pdLng > hilng) 
        return true; 
    else
        return false;  
}

function wndZoomTo(psLat, psLng, psAppZoom) {
    if (gvoMap == null)
        return;
    
    if (gvbMapInit == false) return;
    
    var lat = Number(psLat);
    var lng = Number(psLng);
    var mZoom = Number(psAppZoom);
  
    if (mZoom < 0) {
        mZoom = 0; 
    } else if (mZoom > 18) { 
        mZoom = 18; 
    }
  
    if (gvoCenterPoint.lat() != lat || gvoCenterPoint.lng() != lng || gvnCurZoom != mZoom) {
        gvnCurZoom = mZoom;
        gvoCenterPoint = new GLatLng(lat, lng);
        gvoMap.setCenter(gvoCenterPoint, gvnCurZoom);
        gvoCurMapBounds = gvoMap.getBounds();
    }
}

///////////////////////////////////////////////////////////////////////////////
/// functions for window size
///////////////////////////////////////////////////////////////////////////////
function wndGetHeight() {
    if (self.innerHeight)
        return self.innerHeight;
    
    if (document.documentElement && document.documentElement.clientHeight)
        return y = document.documentElement.clientHeight;
    
    if (document.body)
        return document.body.clientHeight;
    
    return 0;
}

function wndGetWidth() {
    if (self.innerWidth)
        return self.innerWidth;
    
    if (document.documentElement && document.documentElement.clientWidth)
        return y = document.documentElement.clientWidth;
    
    if (document.body)
        return document.body.clientWidth;
    
    return 0;
}

function wndResize() {
    var height = wndGetHeight() - 30;
    var width = wndGetWidth() - 20;
  
    document.getElementById('gMap').style.height = height + 'px';
    document.getElementById('gMap').style.width = width + 'px';
}

///////////////////////////////////////////////////////////////////////////////
/// functions for actions
///////////////////////////////////////////////////////////////////////////////
function actSlideShow() { 
    if (gvbMapInit == false) return;
    
    var photoNo = 0; 
    myLytebox.userResetImage(); 
    for (var i=0; i<gvoaMarkers.length; i++) { 
        if (gvoaMarkers[i].photos.length) { 
            photoNo = photoNo + gvoaMarkers[i].photos.length; 
            myLytebox.userAppendImage(gvoaMarkers[i].photos, true); 
        } 
    } 
  
    if (photoNo) 
        myLytebox.userStart(true);  
}

function appAddSearchResultAsPOI(name, lat, lng, bSaveAsTarget, description) {
    if (name == null || name =='')
        return;
       
    var strSaveAsTarget = (bSaveAsTarget == true)? 'true' : 'false'; 
    if (description != null && description != '') {
        commSendCmd("UserAddPOI:"+lat+":"+lng+":"+name+":"+strSaveAsTarget+":"+description);
    } else {
        commSendCmd("UserAddPOI:"+lat+":"+lng+":"+name+":"+strSaveAsTarget);
    }
}

function appReload() {
    if (gvoMap == null) {
        commSendCmd("ReloadGoogleMapPage");
        return;
    }
        
    if (gvbMapInit == false) return;
    
    var newCP = gvoMap.getCenter();
    var mZoom = gvoMap.getZoom();
    var mType = gvoMap.getCurrentMapType();
  
    commSendCmd("RefreshStatus:"+findMapTypeIndex(mType.getName())+":"+mZoom+":"+newCP.lat()+":"+newCP.lng()+":"+gvnCurPOIID+":"+gvbBullonOnfocus);
}

function appReloadData() {
    if (gvoMap == null || gvbMapInit == false) {
        return;
    }
    
    // reset all data
    gvoMap.clearOverlays();

    gvoLocateIcon = null;
    gvoLocateMarker = null;
    gvnCurPOIID = 0;
    gvnCurLineID = 0;
    gvoaMarkers = [];
    gvoaLines = [];
    gvoaIcons = [];
    gvoGraphMarker1 = null;
    gvoGraphMarker2 = null;
    
    commSendCmd("GenerateData");
}

////////////////////////////////////////////////////////////////////////////////
/// function for screen capture
////////////////////////////////////////////////////////////////////////////////
function appEnableScreenCapture(strEnableJSon) {
    if (gvoMap == null || gvbMapInit == false) {
        return;
    }
    
    var bEnable = eval('('+strEnableJSon+')');
    gvoEnableScreenCapture = bEnable;
    
    var voEditButtonDiv = document.getElementById('buttonwrapper');
    if (voEditButtonDiv == null) {
        appCreateScreenCaptureButton();
    }
    
    if (bEnable == false) {
        document.getElementById('buttonwrapper').style.visibility = 'hidden';
    } else {
        document.getElementById('buttonwrapper').style.visibility = 'visible';
    }
}

function appCreateScreenCaptureButton() {
    
    var strCmdString = strInfoWin_ScreenCapture;  //string in multilanguage
    var voDivEditButton = document.createElement('div');
    voDivEditButton.setAttribute('id', 'ScreenCapture_buttonwrapper');
    voDivEditButton.innerHTML = "<a class='squarebutton' href='javascript:OnClick=appScreenCapture()' title='"+ strCmdString +"'><span>" + strCmdString + "</span></a>";
    document.body.appendChild(voDivEditButton);  

}
////////////////////////////////////////////////////////////////////////////////

//function appFitAllObject() {
//    if (gvoaLines.length <= 0 && gvoaMarkers.length <= 0)
//        return;
//
//    var areaBound = null;
//    
//    for (var i = 0; i < gvoaMarkers.length; i++) {
//        var poi = gvoaMarkers[i];
//        if (areaBound == null) {
//            areaBound = new GLatLngBounds(poi.marker.getPoint(), poi.marker.getPoint());
//        } else {
//            areaBound.extend(poi.marker.getPoint());
//        }  
//    }
//     if (gvoaLines.length == 1) {
//         var line = gvoaLines[0];
//         onFitLine(gvnLineType, line.id);
//     } else {
//         for (var i = 0; i < gvoaLines.length; i++) {
//             var line = gvoaLines[i];
//             if (areaBound == null) {
//                 areaBound = line.marker.getBounds();
//             } else {
//                 areaBound.containsBounds(line.marker.getBounds());
//             }
//         }
//         
//         if (areaBound) {
//             gvoCenterPoint = areaBound.getCenter();
//             gvnCurZoom = gvoMap.getBoundsZoomLevel(areaBound);
//             gvoMap.setCenter(gvoCenterPoint, gvnCurZoom);
//             gvoCurMapBounds = gvoMap.getBounds();
//         }
//     }
// }

function appGenerateData(psLinesJson, psPOIsJson, psIconPosOptJson) {
    gvoaLines = eval('('+psLinesJson+')');
    gvoaMarkers = eval('('+psPOIsJson+')');
    var _iconPosOpt = eval('('+psIconPosOptJson+')');
    gvoInitOption.iconPosOpt = _iconPosOpt;
    gvoLocateIcon = createIcon(_iconPosOpt);

    drawLineMarkers();
    drawPointMarkers();
    commSendCmd('onAfterInitGData');
    //appFitAllObject();
}

function appSelectLine(pnLineID) {
    if (gvbMapInit == false) return;
    
    commSendCmd("LineSelect:"+pnLineID);
}

function appEditPOI(pnPoiID) {
    if (gvbMapInit == false) return;
    
    commSendCmd("POIProperyEdit:"+pnPoiID);
}

function appEditDest(pnPoiID) {
    if (gvbMapInit == false) return;
    
    commSendCmd("DestProperyEdit:"+pnPoiID);
}

function appPOISaveAsTarget(pnPoiID) {
    if (gvbMapInit == false) return;
    
    commSendCmd("POISaveAsTarget:"+pnPoiID);
}

function onLyteBoxShow(pnPoiID, photoAryIdx) {
    if (gvbMapInit == false) return;
    
    var poi = findPOI(pnPoiID);
    if (poi != null) {
        onPhotoShow(poi.photos[photoAryIdx].link, poi.photos[photoAryIdx].title);
    }
}

function appZoomTo() {
    if (gvoMap == null)
        return;
        
    if (gvbMapInit == false) return;
    
    var newCP = gvoMap.getCenter();
    var mZoom = gvoMap.getZoom();
  
    if (gvoCenterPoint.lat() != newCP.lat() || gvoCenterPoint.lng() != newCP.lng() || gvnCurZoom != mZoom) {
        gvoCenterPoint = newCP;
        gvnCurZoom = mZoom;
        gvoCurMapBounds = gvoMap.getBounds();
            
        // tell application
        commSendCmd("wndZoomTo:"+newCP.lat()+":"+newCP.lng()+":"+gvnCurZoom);
    }
}

///////////////////////////////////////////////////////////////////////////////
/// Functions for add poi
///////////////////////////////////////////////////////////////////////////////
function userPOI() {
    if (gvbMapInit == false) return;

    if (gvoAddPOI.mode == true)
        normalMode();
    else
        addPOIMode();
}

function addPOIMode() {
    if (gvoMap == null)
        return;
        
    if (gvbMapInit == false) return;
    
    if (gvbDebug == true)
        GLog.write("Enter add poi mode ...");
    gvoAddPOI.mode = true;
    gvoAddPOI.marker = new GMarker(new GLatLng(0, 0), gvoUserPOIIcon, {draggable:true});
    gvoAddPOI.moveHDL = GEvent.addListener(gvoMap, 'mousemove', userPOIMove);
    gvoAddPOI.clickHDL = GEvent.addListener(gvoMap, 'click', userPOIClick);
    gvoMap.addOverlay(gvoAddPOI.marker);
    gvoMap.disableDragging();
    //document.getElementById("gMap").style.cursor = "default"; 
}

function userDest() {
    if (gvbMapInit == false) return;

    if (gvoAddPOI.mode == true)
        normalMode();
    else
        addDestMode();
}

function addDestMode() {
    if (gvoMap == null)
        return;
        
    if (gvbMapInit == false) return;
    
    if (gvbDebug == true)
        GLog.write("Enter add destination mode ...");
    gvoAddPOI.mode = true;
    gvoAddPOI.marker = new GMarker(new GLatLng(0, 0), gvoUserDestIcon, {draggable:true});
    gvoAddPOI.moveHDL = GEvent.addListener(gvoMap, 'mousemove', userPOIMove);
    gvoAddPOI.clickHDL = GEvent.addListener(gvoMap, 'click', userDestClick);
    gvoMap.addOverlay(gvoAddPOI.marker);
    gvoMap.disableDragging();
    //document.getElementById("gMap").style.cursor = "default";    
}

function normalMode() {
    if (gvoMap == null)
        return;
        
    if (gvbMapInit == false) return;
    
    if (gvbDebug == true)
        GLog.write("Leave add poi mode ...");
    
    GEvent.removeListener(gvoAddPOI.moveHDL);
    GEvent.removeListener(gvoAddPOI.clickHDL);
    gvoMap.removeOverlay(gvoAddPOI.marker);
    gvoMap.enableDragging();
    gvoAddPOI.mode = false;
    gvoAddPOI.marker = null;
    gvoAddPOI.moveHDL = null;
    gvoAddPOI.clickHDL = null;
}

function userPOIMove(mousePt) {
    if (gvbMapInit == false) return;
    
    if (gvoAddPOI.mode == true) {
        gvoAddPOI.marker.setPoint(mousePt);
    }
}

function userPOIClick(marker, pt) {
    if (gvbMapInit == false) return;
    
    // to resolve the problem that can not add POI on track or Placemark
    pt = gvoAddPOI.marker.getPoint();
    
    if (gvoAddPOI.mode == true && pt != null) {
        var lat = pt.lat();
        var lng = pt.lng();
        commSendCmd("UserAddPOI:"+lat+":"+lng);
        normalMode();
    }
}

function userDestClick(marker, pt) {
    if (gvbMapInit == false) return;
    
    // to resolve the problem that can not add POI on track or Placemark
    pt = gvoAddPOI.marker.getPoint();
    
    if (gvoAddPOI.mode == true && pt != null) {
        var lat = pt.lat();
        var lng = pt.lng();

        commSendCmd("UserAddDest:"+lat+":"+lng);
        normalMode();
    }
}

function initLogoDisplay(logoFileName) {
    if (logoFileName != null) {
        gDisplayLogo = true;
        gDisplayLogoFileName = logoFileName;
    }
}

function enableDestination() {
    gCanAddDestination = true;
}

function enableEarthView() {
    gvoEnableEarthView = true;
}

function appScreenCapture() {
    if (gvbMapInit == false) return;
    
    commSendCmd("ScreenCapture");
}

///////////////////////////////////////////////////////////////////////////////
/// functions for communication with application
///////////////////////////////////////////////////////////////////////////////
function commSendCmd(psMessage) {
    if (gApJsCtrl == true) {
        window.status = "cmd:"+psMessage;
        window.location = "cmd:"+psMessage;
    }
}
