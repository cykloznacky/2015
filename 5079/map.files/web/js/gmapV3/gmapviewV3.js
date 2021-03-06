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
var gvoInfowindow = null;

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
var gvoAddPOI = {'mode':false, 'maker':null, 'moveHDL':null, 'clickHDL':null };

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
                if (line != null && line.startMarker != null) {
                    if (line.locationMarker != null) {
                        if (gvoLocateMarker != null) {
                            gvoLocateMarker.setVisible(false);
                        }
                        gvoLocateMarker = line.locationMarker;
                        gvoLocateMarker.setPosition(line.startMarker.getPosition());
                        gvoLocateMarker.setVisible(true);
                    }
                   google.maps.event.trigger(line.startMarker, "click");
                   var latlng = line.startMarker.getPosition();
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
            if (gvoInfowindow != null)
                gvoInfowindow.close();
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
         
    //if (typeof(GMap2) != 'undefined') {
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
                gvoUserPOIIcon = new google.maps.MarkerImage();
                if (gvoIconImageURLPath != null) {
                    gvoUserPOIIcon.url = gvoIconImageURLPath + "add_poi.png";
                } else {
                    gvoUserPOIIcon.url = "http://maps.google.com/mapfiles/kml/pal4/icon48.png";
                }
                gvoUserPOIIcon.size = new google.maps.Size(22, 22);
                gvoUserPOIIcon.anchor = new google.maps.Point(11, 21);
                
                var tempHTML = "<a href='javascript:OnClick=userPOI()' title='"+strTBar_AddPlaceMark_Tip+"'><img src='"+gvoUserPOIIcon.url+"' class='cButton' width=22 /></a>";
                voDivTBar.innerHTML += tempHTML;
            }
            
            // add destination function
            if (gCanAddDestination == true) {
                gvoUserDestIcon = new google.maps.MarkerImage();
                if (gvoIconImageURLPath != null) {
                    gvoUserDestIcon.url = gvoIconImageURLPath + "destination.png";
                } else {
                    gvoUserDestIcon.url = "http://maps.google.com/mapfiles/kml/pal4/icon49.png";
                }
                gvoUserDestIcon.size = new google.maps.Size(22, 22);
                gvoUserDestIcon.anchor = new google.maps.Point(11, 11);
                
                var tempHTML = "<a href='javascript:OnClick=userDest()' title='"+strTBar_AddDestination_Tip+"'><img src='"+gvoUserDestIcon.url+"' class='cButton' width=22 /></a>";
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
    //}
}

function initGData() {
    gvoLocateIcon = createIcon(gvoInitOption.iconPosOpt);
    gvoLineIcon = createIcon(gvoInitOption.iconLineOpt);
    gvoLineMinimapPOIIcon = createIcon(gvoInitOption.iconMinimapPoiOpt);

    gvoFitBound = new google.maps.LatLngBounds(new google.maps.LatLng(gvoInitOption.startLat, gvoInitOption.startLon), new google.maps.LatLng(gvoInitOption.startLat, gvoInitOption.startLon));
    gvoCenterPoint = new google.maps.LatLng(gvoInitOption.startLat, gvoInitOption.startLon);
  
    if (gApJsCtrl) {
        // Create "Search result" arrow marker icon
        gvoSearchIcon = new google.maps.MarkerImage();
        if (gvoIconImageURLPath != null) {
            gvoSearchIcon.url = gvoIconImageURLPath + "arrow_location.png";
        } else {
            gvoSearchIcon.url = "http://maps.google.com/mapfiles/kml/shapes/poi.png";
        }
        //gvoSearchIcon.shadow = "http://labs.google.com/ridefinder/images/mm_20_shadow.png";
        gvoSearchIcon.size = new google.maps.Size(23, 34);
        //gvoSearchIcon.shadowSize = new GSize(22, 20);
        gvoSearchIcon.anchor = new google.maps.Point(11, 33);
        //gvoSearchIcon.infoWindowAnchor = new GPoint(14, 1);
    }
    if (gvoEnableGraphMarkers) {
        gvoGraphMarkerIcon1 = new google.maps.MarkerImage();
        gvoGraphMarkerIcon1.url = "http://maps.google.com/mapfiles/kml/pal3/icon0.png";
        gvoGraphMarkerIcon1.size = new google.maps.Size(16, 16);
        gvoGraphMarkerIcon1.anchor = new google.maps.Point(7, 7);
        
        gvoGraphMarkerIcon2 = new google.maps.MarkerImage();
        gvoGraphMarkerIcon2.url = "http://maps.google.com/mapfiles/kml/pal3/icon1.png";
        gvoGraphMarkerIcon2.size = new google.maps.Size(16, 16);
        gvoGraphMarkerIcon2.anchor = new google.maps.Point(7, 7);
    }
}

function initTypeIconMarker() {
    // init line and type mapping
    if (gvoInitOption.iconTypeAryOpt != null) {
        var i = 0;
        for (i = 0; i < gvoInitOption.iconTypeAryOpt.length; i++) {
            gvoTypeIconAry[i] = createIcon(gvoInitOption.iconTypeAryOpt[i]);
            gvoTypeIconMarkerAry[i] = new google.maps.Marker({position: new google.maps.LatLng(0, 0), map: gvoMap, icon: gvoTypeIconAry[i], visible: false});
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
    gvbMapInit = true;
  
    if (gvoLocateIcon == null)  initGData();
    
    // create google map
    var gMapOptions = {
      zoom: gvoInitOption.zoomLevel,
      center: gvoCenterPoint,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      scaleControl: true,
      overviewMapControl: gvoInitOption.mapOverview
    };
    gvoMap = new google.maps.Map(document.getElementById("gMap"), gMapOptions);
             
    if (gvoInitOption.enableEarthView != null)
        gvoEnableEarthView = gvoInitOption.enableEarthView;
//    if (gvoEnableEarthView == true)
//        gvoMap.addMapType(G_SATELLITE_3D_MAP);
    gvoaMapTypes = gvoMap.mapTypes;
    
    if (gvoInitOption.callByReload == true || (gvoaMarkers.length == 0 && gvoaLines.length == 0)) {
        gvnCurZoom = gvoInitOption.zoomLevel;
        gvnFitZoom = gvoInitOption.zoomLevel;
    } else {
        gvnCurZoom = gvoMap.getZoom();
        gvnFitZoom = gvnCurZoom;
    }
    
    gvoMap.setCenter(gvoCenterPoint);
    
    gvoMap.setZoom(gvnCurZoom);
    gvoCurMapBounds = gvoMap.getBounds();
    gvoCurrMapType = gvoMap.getMapTypeId();
    
    // Initialize the local searcher
    // create google search control
    //if (gvoInitOption.sBar == true) {
    //    // new Google Local Search Control
    //    var localSearchOptions = {
    //        onLocalSearchCompleteCallback : onLocalSearchSearchComplete,
    //        onGenerateMarkerHtmlCallback : onLocalSearchMarkerHtml
    //    };
    //    if (typeof(google) != 'undefined') {
    //        gvoLocalSearchCtrl = new google.maps.LocalSearch(localSearchOptions);
    //        //var localSearchCtrlPos = new GControlPosition(G_ANCHOR_BOTTOM_LEFT, new GSize(3, 35));
    //        //gvoMap.addControl(gvoLocalSearchCtrl, localSearchCtrlPos);
    //        gvoLocalSearchCtrl.focus();
    //    }
    //}
           
    initTypeIconMarker();
    drawLineMarkers();
    drawPointMarkers();
    
    if (window.attachEvent) { 
        window.attachEvent("onresize", function() { appZoomTo(); } ); 
    } else { 
        window.addEventListener("resize", function() { appZoomTo(); } , false); 
    } 
    google.maps.event.addListener(gvoMap, 'click', function (mouseEventObj) { 
        if (gvoInfowindow != null) {
            gvoInfowindow.close();
        }
    });
    google.maps.event.addListener(gvoMap, 'zoom_changed', function () { appZoomTo(); });
    google.maps.event.addListener(gvoMap, 'dragend', function () { appZoomTo(); });
    google.maps.event.addListener(gvoMap, 'mousemove', function (mouseEventObj) {
        if (gvoAddPOI != null && gvoAddPOI.mode == true)
            return;
        commSendCmd("mapMouseMove:"+mouseEventObj.latLng.lat()+":"+mouseEventObj.latLng.lng());
        if (gvoLocalSearchCtrl != null)
            gvoLocalSearchCtrl.focus();
    });
    google.maps.event.addListener(gvoMap, 'maptypeid_changed', function() {
        var currMapName = "OtherMap";
        switch (gvoMap.getMapTypeId()) {
            case google.maps.MapTypeId.ROADMAP:
                currMapName = "NormalMap";
                break;
            case google.maps.MapTypeId.SATELLITE:
                currMapName = "SatelliteMap";
                break;
            case google.maps.MapTypeId.HYBRID:
                currMapName = "HybridMap";
                break;
            case google.maps.MapTypeId.TERRAIN:
                currMapName = "PhysicalMap";
                break;
            default:
                break;
        }
        commSendCmd("mapTypeChanged:"+currMapName);
        gvoCurrMapType = gvoMap.getMapTypeId();
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
}

function getPhotoNum()
{
    var nPhotoNum = 0;
    if (gvoaMarkers != null) {
        for (var i = 0; i< gvoaMarkers.length; i++) {
            var poPoi = gvoaMarkers[i];
            if (poPoi != null && poPoi.photos != null)
                nPhotoNum += poPoi.photos.length;
        }
    }
    
    return nPhotoNum;
}

///////////////////////////////////////////////////////////////////////////////
/// Functions for map drawing
///////////////////////////////////////////////////////////////////////////////
function createIcon(poIconOpt)
{       
    var icon = new google.maps.MarkerImage();
    if (gvoIconImageURLPath != null) {
        icon.url = gvoIconImageURLPath + poIconOpt.fileName;
    } else {
        icon.url = "http://maps.google.com/mapfiles/kml/pal5/icon13.png";
    }
    icon.size = new google.maps.Size(poIconOpt.width, poIconOpt.height);
    icon.anchor = new google.maps.Point(poIconOpt.anchorX, poIconOpt.anchorY);
    //icon.infoWindowAnchor = new GPoint(poIconOpt.width/2, poIconOpt.height/2);
    return icon;
}

function createLineMarker(poLine) {
    var markerOptions = { position: new google.maps.LatLng(poLine.startLat, poLine.startLon), title: poLine.name, icon: gvoLineIcon };
    var marker = new google.maps.Marker(markerOptions);
    
    var infowindowOptions = {content: infoLine(poLine), pixelOffset: new google.maps.Size(0, gvoLineIcon.size.height/2)};
    var infowindow = new google.maps.InfoWindow(infowindowOptions);
    marker.infowindow = infowindow;
    google.maps.event.addListener(infowindow, "closeclick", function() {
        gvoInfowindow = null;
    });
    google.maps.event.addListener(infowindow, 'domready', function() {
		var lat = poLine.startLat;
		var lng = poLine.startLon;

        var nZoomLevel = gvoMap.getZoom()+3;
        if (nZoomLevel > 18)
            nZoomLevel = gvoMap.getZoom()-3;
        var minimapDiv = document.getElementById("minimap");
        var gMapOptions = {
            zoom: nZoomLevel,
            center: marker.getPosition(),
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        var minimap = new google.maps.Map(minimapDiv, gMapOptions);
        
        var miniMapMarkerOptions = { position: new google.maps.LatLng(lat, lng), title: poLine.name, icon: gvoLineIcon };
        var miniMapMarker = new google.maps.Marker(miniMapMarkerOptions);
        miniMapMarker.setMap(minimap);
    });
    
    google.maps.event.addListener(marker, "click", function() {
        if (gvoInfowindow != null)
            gvoInfowindow.close();
        
        infowindow.open(gvoMap, marker);
        gvoInfowindow = infowindow;
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
            var lineMarker = createLineMarker(gvoaLines[i]);
            lineMarker.setMap(gvoMap);

            var linePath = new google.maps.MVCArray();
            if (gvoaLines[i].pathAry != null) {
                for (var wpIdx=0; wpIdx < gvoaLines[i].pathAry.length; wpIdx++) {
                    var wp = new google.maps.LatLng(gvoaLines[i].pathAry[wpIdx][0], gvoaLines[i].pathAry[wpIdx][1]);
                    linePath.push(wp);
                }
            }

            var polyline;
            if (gvoaLines[i].width > 0)
                polyline = new google.maps.Polyline({path: linePath, strokeColor: gvoaLines[i].color, strokeWeight: gvoaLines[i].width, strokeOpacity:0.7});
            else
                polyline = new google.maps.Polyline({path: linePath, strokeColor: colors[i%10], strokeWeight: 5, strokeOpacity:0.7});
        
            gvoaLines[i].marker = polyline;
            polyline.setMap(gvoMap);
            
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
        var markerOptions = { position: marker.getPosition(), icon: gvoLocateIcon, clickable: false };
        gvoLocateMarker = new google.maps.Marker(markerOptions); 
        gvoLocateMarker.setMap(gvoMap);
    } else {
        gvoLocateMarker.setPosition(marker.getPosition());
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
            icon = new google.maps.MarkerImage();
            if (gvoIconImageURLPath != null) {
                icon.url = gvoIconImageURLPath + poPoi.icon;
            } else {
                icon.url = "http://maps.google.com/mapfiles/kml/pal5/icon14.png";
            }
            icon.size = new google.maps.Size(32, 32);
            icon.anchor = new google.maps.Point(16, 16);
            //icon.infoWindowAnchor = new GPoint(16, 16);
                
            gvoaIcons[poPoi.icon] = icon;
        } else {
            icon = gvoaIcons[poPoi.icon];
        }
    }
    var markerOptions = { position: poPos, title: poPoi.name, icon: icon };
    var marker = new google.maps.Marker(markerOptions);
    poPoi.marker = marker;

//     if (gvoLocateMarker == null) { 
//         gvoLocateMarker = new GMarker(marker.getPoint(), gvoLocateIcon); 
//         gvoMap.addOverlay(gvoLocateMarker); 
//     }
    
    var bDestMarker = false;
    if (marker.getIcon() == gvoUserDestIcon)
        bDestMarker = true;
        
    var infowindowOptions = {content: infoMarker(poPoi, bDestMarker), pixelOffset: new google.maps.Size(0, icon.size.height/2)};
    var infowindow = new google.maps.InfoWindow(infowindowOptions);
    marker.infowindow = infowindow;
    google.maps.event.addListener(infowindow, "closeclick", function() {
        gvoInfowindow = null;
    });
    
    //marker.bindInfoWindowTabsHtml(infoMarker(poPoi, bDestMarker));
    //marker.bindInfoWindowHtml(infoMarker(poPoi, bDestMarker));
    //myLytebox.updateLyteboxItems(); 
    
    google.maps.event.addListener(marker, "click", function() {
        onClickMarker(marker, poPoi);
        //bindMiniMap(marker);
        
        if (gvoInfowindow != null)
            gvoInfowindow.close();
        
        infowindow.open(gvoMap, marker);
        gvoInfowindow = infowindow;
    });
  
//     google.maps.event.addListener(marker, "dblclick", function() {
//         var point = marker.getPosition();
//         
//         if (gvoLocateMarker == null) {
//             var markerOptions = { position: marker.getPosition(), icon: gvoLocateIcon, clickable: false }; 
//             gvoLocateMarker = new google.maps.Marker(markerOptions);
//             gvoLocateMarker.setMap(gvoMap);
//         } else {
//             gvoLocateMarker.setPosition(point);
//         }
// 
//         if (wndPanCheck(point.lat(), point.lng()) == true) gvoMap.panTo(point); 
//     });
        
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

            var marker = createMarker(new google.maps.LatLng(lat, lng), gvoaMarkers[i], icon);
            marker.setMap(gvoMap);
        }
    }
}

function bindMiniMap(marker) {
    var nZoomLevel = gvoMap.getZoom()+3;
    if (nZoomLevel > 18)
        nZoomLevel = gvoMap.getZoom()-3;
        
    var minimapDiv = document.getElementById("minimap");
    var gMapOptions = {
      zoom: nZoomLevel,
      center: marker.getPosition(),
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var minimap = new google.maps.Map(minimapDiv, gMapOptions);
//    var CopyrightDiv = minimapDiv.firstChild.nextSibling;
//     var CopyrightImg = minimapDiv.firstChild.nextSibling.nextSibling;
//  	CopyrightDiv.style.display = "none"; 
//  	CopyrightImg.style.display = "none";	
 
    var markerOptions = { position: marker.getPosition(), title: marker.getTitle(), icon: marker.getIcon() };
    var miniMapMarker = new google.maps.Marker(markerOptions);
    miniMapMarker.setMap(minimap);
    
    return minimap;
}

function infoSearchResultMarker(poSearchResult) {
     var info = '<div class="pmInfo" style="width: 230px; height: 270px; overflow: hidden;">';
   
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
            info += '<br /><div id="minimap" style="width: 200px; height: 150px; overflow: hidden;"></div>';
         }
     } 
   
     info += '</div>'; 
     
     return info; 
}

function onLocalSearchMarkerHtml(marker, html, result) {
    var info = '<div class="pmInfo" style="width: 230px; height: 270px; overflow: hidden; ">';
   
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
            info += '<br /><div id="minimap" style="width: 200px; height: 150px; overflow: hidden; "></div>';
         }
     } 
   
     info += '</div>'; 
     html.innerHTML = info;
          
//     GEvent.addListener(marker, "infowindowopen", function() {
//        bindMiniMap(marker);
//     });    
         
     return html; 
}

function onLocalSearchSearchComplete(searcher) {
    if (gvoMap == null)
        return;
        
    if (gvbMapInit == false || !searcher.results || searcher.results[0]==null)
        return;
    
    gvoMap.setCenter(new google.maps.LatLng(parseFloat(searcher.results[0].lat), parseFloat(searcher.results[0].lng)));
    gvoMap.setZoom(14);
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
        
    gvoMap.setCenter(new google.maps.LatLng(parseFloat(gvoLocalSearch.results[0].lat), parseFloat(gvoLocalSearch.results[0].lng)));
    gvoMap.setZoom(14);
    
    // create arrow location icon marker
    var markerOptions = { 
        position: new google.maps.LatLng(parseFloat(gvoLocalSearch.results[0].lat), parseFloat(gvoLocalSearch.results[0].lng)), 
        title: gvoLocalSearch.results[0].titleNoFormatting, 
        icon: gvoSearchIcon 
    };
    var locationMarker = new google.maps.Marker(markerOptions);
    locationMarker.setMap(gvoMap);
    
    var infowindowOptions = {
        content: infoSearchResultMarker(gvoLocalSearch.results[0]), 
        pixelOffset: new google.maps.Size(0, gvoSearchIcon.size.height/2)
    };
    var infowindow = new google.maps.InfoWindow(infowindowOptions);
    google.maps.event.addListener(infowindow, "closeclick", function() {
        gvoInfowindow = null;
    });
    google.maps.event.addListener(infowindow, 'domready', function() {
        bindMiniMap(locationMarker);
    });
        
    if (gvoInfowindow != null)
        gvoInfowindow.close();
    infowindow.open(gvoMap, locationMarker);
    gvoInfowindow = infowindow;
    
    google.maps.event.addListener(locationMarker, "click", function() {
        if (gvoInfowindow != null)
            gvoInfowindow.close();
        
        infowindow.open(gvoMap, locationMarker);
        gvoInfowindow = infowindow;
    });
    
    locationMarker.result = gvoLocalSearch.results[0];
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
    
    var poi = eval('('+pjsonPOI+')');
    
    var lat = poi.lat;
    var lng = poi.lon;

            
    var marker = createMarker(new google.maps.LatLng(lat, lng), poi, gvoUserDestIcon);
    marker.setMap(gvoMap);
    gvoaMarkers.push(poi);
}

function onSelectLine(pnLineTyoe, pnLineID) {
    if (gvoMap == null)
        return;
        
    if (gvbMapInit == false) return;

    var line = findLine(pnLineID);
  
    if (line != null) {
        var point = new google.maps.LatLng(line.startLat, line.startLon); 
        gvoMap.panTo(point);
        
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
                line.marker.setVisible(false);
            else
                line.marker.setVisible(true);
        }
    }
}

function onFitLine(pnLineTyoe, pnLineID) {
    if (gvoMap == null)
        return;
        
    if (gvbMapInit == false) return;

    var line = findLine(pnLineID);
  
    if (line != null) {
        var lineBound = new google.maps.LatLngBounds(new google.maps.LatLng(line.minLat,line.minLon), new google.maps.LatLng(line.maxLat,line.maxLon));
        gvoCenterPoint = new google.maps.LatLng((line.minLat+line.maxLat)/2, (line.minLon+line.maxLon)/2);
        gvoMap.fitBounds(lineBound);
        gvnCurZoom = gvoMap.getZoom();
        gvoMap.setCenter(gvoCenterPoint);
        gvoCurMapBounds = gvoMap.getBounds();
    } else { // fit all tracks
        if (gvoaLines && gvoaLines.length > 0) {
            var lineBound = null;
            for (var i=0; i<gvoaLines.length; i++) {
                line = gvoaLines[i];
                if (line.minLat <= -1000 || line.minLon <= -1000 || line.maxLat <= -1000 || line.maxLon <= -1000)
                    continue;
                    
                if (i == 0) {
                    lineBound = new google.maps.LatLngBounds(new google.maps.LatLng(line.minLat,line.minLon), new google.maps.LatLng(line.maxLat,line.maxLon));
                } else {
                    lineBound.extend(new google.maps.LatLng(line.minLat,line.minLon));
                    lineBound.extend(new google.maps.LatLng(line.maxLat,line.maxLon));
                }
            }
            gvoMap.fitBounds(lineBound);
            gvnCurZoom = gvoMap.getZoom();
            gvoMap.setCenter(gvoCenterPoint);
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
    var marker1Pos = new google.maps.LatLng(markerInfo.Marker1Lat, markerInfo.Marker1Lng);
    var marker2Pos = new google.maps.LatLng(markerInfo.Marker2Lat, markerInfo.Marker2Lng);

    if (gvoGraphMarker1 == null) { 
        var markerOptions = { position: marker1Pos, title: markerInfo.Marker1, icon: gvoGraphMarkerIcon1 };
        gvoGraphMarker1 = new google.maps.Marker(markerOptions); 
        gvoGraphMarker1.setMap(gvoMap); 
    } else {
        var lastPos = gvoGraphMarker1.getPosition();
        gvoGraphMarker1.setPosition(marker1Pos);
        if ((lastPos.lat() != marker1Pos.lat() || lastPos.lng() != marker1Pos.lng()) &&
            wndPanCheck(marker1Pos.lat(), marker1Pos.lng()) == true) {
            gvoMap.panTo(marker1Pos); 
        }
    }
    if (gvoGraphMarker2 == null) {
        var markerOptions = { position: marker2Pos, title: markerInfo.Marker2, icon: gvoGraphMarkerIcon2 }; 
        gvoGraphMarker2 = new google.maps.Marker(markerOptions); 
        gvoGraphMarker2.setMap(gvoMap); 
    }   else {
        var lastPos = gvoGraphMarker2.getPosition();
        gvoGraphMarker2.setPosition(marker2Pos);
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
    
    var newLine = eval('('+psLineJson+')');
    var pnID = newLine.id;
    
    if (pnID != null) {
        var lineAInd = findLineIndex(pnID);
        if (lineAInd != -1) {
            // remove overlap
			gvoaLines[lineAInd].startMarker.setMap(null);
            gvoaLines[lineAInd].startMarker = null;
            
			gvoaLines[lineAInd].marker.setMap(null);
            gvoaLines[lineAInd].marker = null;
            
            // reset to new!
            gvoaLines[lineAInd] = newLine;
            
            // new start marker
            var sMarker = createLineMarker(gvoaLines[lineAInd]);
            sMarker.setMap(gvoMap);
            
            // new line marker
            var linePath = new google.maps.MVCArray();
            if (gvoaLines[lineAInd].pathAry != null) {
                for (var wpIdx=0; wpIdx < gvoaLines[lineAInd].pathAry.length; wpIdx++) {
                    var wp = new google.maps.LatLng(gvoaLines[lineAInd].pathAry[wpIdx][0], gvoaLines[lineAInd].pathAry[wpIdx][1]);
                    linePath.push(wp);
                }
            }

            var polyline;
            if (gvoaLines[lineAInd].width > 0)
                polyline = new google.maps.Polyline({path: linePath, strokeColor: gvoaLines[lineAInd].color, strokeWeight: gvoaLines[lineAInd].width, strokeOpacity:0.7});
            else
                polyline = new google.maps.Polyline({path: linePath, strokeColor: colors[lineAInd%10], strokeWeight: 5, strokeOpacity:0.7});
            polyline.setMap(gvoMap);     
            gvoaLines[lineAInd].startMarker = sMarker;
            gvoaLines[lineAInd].marker = polyline;
        }
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
    
    var objLine = eval('('+psLineJson+')');
    objLine.startMarker = createLineMarker(objLine);
    objLine.startMarker.setMap(gvoMap);
    
    var linePath = new google.maps.MVCArray();
    if (objLine.pathAry != null) {
        for (var wpIdx=0; wpIdx < objLine.pathAry.length; wpIdx++) {
            var wp = new google.maps.LatLng(objLine.pathAry[wpIdx][0], objLine.pathAry[wpIdx][1]);
            linePath.push(wp);
        }
    }

    if (objLine.width > 0)
        objLine.marker = new google.maps.Polyline({path: linePath, strokeColor: objLine.color, strokeWeight: objLine.width, strokeOpacity:0.7});
    else
        objLine.marker = new google.maps.Polyline({path: linePath, strokeColor: colors[gvoaLines.length%10], strokeWeight: 5, strokeOpacity:0.7});
    objLine.marker.setMap(gvoMap); 
    gvoaLines.push(objLine);
}

function onReplaceAllLines(psLinesJson) {
    if (gvoMap == null)
        return;
        
    if (gvbMapInit == false) return;
    
    if (gvoaLines && gvoaLines.length > 0) {
        for (var i=0; i<gvoaLines.length; i++) {
            if (gvoaLines[i].marker) {
                gvoaLines[i].startMarker.setMap(null);
                gvoaLines[i].marker.setMap(null);
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
            var markerOptions = { position: poi.marker.getPosition(), icon: gvoLocateIcon, clickable: false };
            gvoLocateMarker = new google.maps.Marker(markerOptions); 
            gvoLocateMarker.setMap(gvoMap);
        } else {
            gvoLocateMarker.setPosition(poi.marker.getPosition());
        }
    
        //google.maps.event.trigger(poi.marker, "dblclick"); 
        if (gvbBullonOnfocus == true) {
        	google.maps.event.trigger(poi.marker, "click");
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
            google.maps.event.trigger(poi.marker, "click");
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
        
        //google.maps.event.trigger(poi.marker, "dblclick");
        if (_bullOnFocus == true) {
           google.maps.event.trigger(poi.marker, "click");             
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
    
    var poi = eval('('+pjsonPOI+')');
    var lat = poi.lat;
    var lng = poi.lon;

    var marker = createMarker(new google.maps.LatLng(lat, lng), poi, null);
    marker.setMap(gvoMap);
    gvoaMarkers.push(poi);
}

function onEditPOI(psPoiJSON) {
    if (gvoMap == null)
        return;
        
    if (gvbMapInit == false) return;
    
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
                gvoaMarkers[poiIndex].marker.setMap(null);
                gvoaMarkers[poiIndex].marker = null;
            }
        
            gvoaMarkers[poiIndex] = newPOI;
            gvoaMarkers[poiIndex].marker = createMarker(new google.maps.LatLng(newPOI.lat, newPOI.lon), gvoaMarkers[poiIndex], icon);
            gvoaMarkers[poiIndex].marker.setMap(gvoMap);
            
			if (focusPOIID == pnID && focusOn == true) {
				google.maps.event.trigger(gvoaMarkers[poiIndex].marker, "click");
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
                gvoaMarkers[i].marker.setMap(null);
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
    
    var latLng = new google.maps.LatLng(Number(psLat), Number(psLng));
    if (gvoLocateMarker == null) {
        var markerOptions = { position: latLng, icon: gvoLocateIcon, clickable: false };
        gvoLocateMarker = new google.maps.Marker(markerOptions); 
        gvoLocateMarker.setMap(gvoMap);
    } else {
        gvoLocateMarker.setPosition(latLng);
    }
         
    if (wndPanCheck(latLng.lat(), latLng.lng()) == true) 
        gvoMap.panTo(latLng); 
}

function onTracker(psLat, psLng, nMarkerNo) { 
    if (gvoMap == null || gvbMapInit == false || gvoTrackerMarkerAry == null) return;
    
    if (nMarkerNo == -1) { // hide last tracker marker
        gvoLastVisibleTrackMarker.setVisible(false);
        gvoLastVisibleTrackMarker = null;
    }
    
    if (gvoTrackerMarkerAry != null) { 
        if (gvoLastVisibleTrackMarker != null)
            gvoLastVisibleTrackMarker.hide();
       
        gvoLastVisibleTrackMarker = gvoTrackerMarkerAry[nMarkerNo];
        var point = new google.maps.LatLng(Number(psLat), Number(psLng));     
        gvoLastVisibleTrackMarker.setPosition(point);
        gvoLastVisibleTrackMarker.setVisible(true);
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
        var icon = new google.maps.MarkerImage();
        icon.url = info.path + info.fileName;
        icon.size = new google.maps.Size(info.width, info.height);
        icon.anchor = new google.maps.Point(info.anchorX, info.anchorY);
        //icon.infoWindowAnchor = new GPoint(info.width/2, info.height/2);
        
        // create marker
        var markerOption = { position: new google.maps.LatLng(0, 0), icon: icon, map: gvoMap, visible: false };
        gvoTrackerMarkerAry[i] = new google.maps.Marker(markerOption);
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
        var infowindowOptions = {content: info, pixelOffset: new google.maps.Size(0, poPoi.marker.getIcon().size.height/2)};
        var infowindow = new google.maps.InfoWindow(infowindowOptions);
        poPoi.marker.infowindow = infowindow;
        google.maps.event.addListener(infowindow, "closeclick", function() {
            gvoInfowindow = null;
        });
        
        if (gvoInfowindow != null)
            gvoInfowindow.close();
        infowindow.open(gvoMap, poPoi.marker);
        gvoInfowindow = infowindow;
        
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
        
        var infowindowOptions = {content: location, pixelOffset: new google.maps.Size(0, poPoi.marker.getIcon().size.height/2)};
        var infowindow = new google.maps.InfoWindow(infowindowOptions);
        
        google.maps.event.addListener(infowindow, "closeclick", function() {
            gvoInfowindow = null;
        });
        google.maps.event.addListener(infowindow, 'domready', function() {
            bindMiniMap(poPoi.marker);
        });
        
        if (gvoInfowindow != null)
            gvoInfowindow.close();
        infowindow.open(gvoMap, poPoi.marker);
        gvoInfowindow = infowindow;
        
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
        info +='<div id="minimap" style="width: 180px; height: 150px;"></div>';
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
			    gvoaMarkers[nID].marker.setMap(null);
				gvoaMarkers[nID].marker = null;
			}
			gvoaMarkers.splice(nID, 1);
			
			// clear location marker
			if (gvoLocateMarker != null) {
			    gvoLocateMarker.setMap(null);
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
				gvoaLines[nID].startMarker.setMap(null);
				gvoaLines[nID].marker.setMap(null);
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
        gvoCenterPoint = new google.maps.LatLng(lat, lng);
        gvoMap.setCenter(gvoCenterPoint);
        gvoMap.setZoom(gvnCurZoom);
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
    var mType = gvoMap.getMapTypeId();
  
    commSendCmd("RefreshStatus:"+findMapTypeIndex(mType)+":"+mZoom+":"+newCP.lat()+":"+newCP.lng()+":"+gvnCurPOIID+":"+gvbBullonOnfocus);
}

function appReloadData() {
    if (gvoMap == null || gvbMapInit == false) {
        return;
    }
    
    // reset all data
    //gvoMap.clearOverlays();
    if (gvoaMarkers) {
        for (var i = 0; i < gvoaMarkers.length; i++ ) {
            gvoaMarkers[i].marker.setMap(null);
        }
    }
    if (gvoaLines) {
        for (var i = 0; i < gvoaLines.length; i++ ) {
            gvoaLines[i].startMarker.setMap(null);
            gvoaLines[i].marker.setMap(null);
        }
    }
    if (gvoLocateMarker)
        gvoLocateMarker.setMap(null);
    if (gvoGraphMarker1)
        gvoGraphMarker1.setMap(null);
    if (gvoGraphMarker2)
        gvoGraphMarker2.setMap(null);
    if (gvoInfowindow)
        gvoInfowindow.close();

    gvoLocateIcon = null;
    gvoLocateMarker = null;
    gvnCurPOIID = 0;
    gvnCurLineID = 0;
    gvoaMarkers = [];
    gvoaLines = [];
    gvoaIcons = [];
    gvoGraphMarker1 = null;
    gvoGraphMarker2 = null;
    gvoInfowindow = null;
    
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
    
    gvoAddPOI.mode = true;
    var markerOptions = { position: new google.maps.LatLng(0, 0), icon: gvoUserPOIIcon, draggable: true };
    gvoAddPOI.marker = new google.maps.Marker(markerOptions);
    gvoAddPOI.moveHDL = google.maps.event.addListener(gvoMap, 'mousemove', userPOIMove);
    gvoAddPOI.clickHDL = google.maps.event.addListener(gvoAddPOI.marker, 'click', userPOIClick);
    gvoAddPOI.marker.setMap(gvoMap);
    gvoMap.setOptions({draggable: false});
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
    
    gvoAddPOI.mode = true;
    var markerOptions = { position: new google.maps.LatLng(0, 0), icon: gvoUserDestIcon, draggable: true };
    gvoAddPOI.marker = new google.maps.Marker(markerOptions);
    gvoAddPOI.moveHDL = google.maps.event.addListener(gvoMap, 'mousemove', userPOIMove);
    gvoAddPOI.clickHDL = google.maps.event.addListener(gvoAddPOI.marker, 'click', userDestClick);
    gvoAddPOI.marker.setMap(gvoMap);
    gvoMap.setOptions({draggable: false});
    //document.getElementById("gMap").style.cursor = "default";    
}

function normalMode() {
    if (gvoMap == null)
        return;
        
    if (gvbMapInit == false) return;
    
    google.maps.event.removeListener(gvoAddPOI.moveHDL);
    google.maps.event.removeListener(gvoAddPOI.clickHDL);
    gvoAddPOI.marker.setMap(null);
    gvoMap.setOptions({draggable: true});
    gvoAddPOI.mode = false;
    gvoAddPOI.marker = null;
    gvoAddPOI.moveHDL = null;
    gvoAddPOI.clickHDL = null;
}

function userPOIMove(mouseEvent) {
    if (gvbMapInit == false) return;
    
    if (gvoAddPOI.mode == true) {
        gvoAddPOI.marker.setPosition(mouseEvent.latLng);
    }
}

function userPOIClick(mouseEvent) {
    if (gvbMapInit == false) return;
    
    // to resolve the problem that can not add POI on track or Placemark
    pt = gvoAddPOI.marker.getPosition();
    
    if (gvoAddPOI.mode == true && pt != null) {
        var lat = pt.lat();
        var lng = pt.lng();
        commSendCmd("UserAddPOI:"+lat+":"+lng);
        normalMode();
    }
}

function userDestClick(mouseEvent) {
    if (gvbMapInit == false) return;
    
    // to resolve the problem that can not add POI on track or Placemark
    pt = gvoAddPOI.marker.getPosition();
    
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
