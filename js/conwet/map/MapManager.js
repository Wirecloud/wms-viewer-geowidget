/*
 *     Copyright (c) 2013 CoNWeT Lab., Universidad Politécnica de Madrid
 *
 *     This file is part of the GeoWidgets Project,
 *
 *     http://conwet.fi.upm.es/geowidgets
 *
 *     Licensed under the GNU General Public License, Version 3.0 (the 
 *     "License"); you may not use this file except in compliance with the 
 *     License.
 *
 *     Unless required by applicable law or agreed to in writing, software
 *     under the License is distributed in the hope that it will be useful, 
 *     but on an "AS IS" BASIS, WITHOUT ANY WARRANTY OR CONDITION,
 *     either express or implied; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 *  
 *     See the GNU General Public License for specific language governing
 *     permissions and limitations under the License.
 *
 *     <http://www.gnu.org/licenses/gpl.txt>.
 *
 */

use("conwet.map");

conwet.map.MapManager = Class.create({
    initialize: function(gadget, options) {
        this.transformer = new conwet.map.ProjectionTransformer();
        this.gadget = gadget;
        this.map = new OpenLayers.Map($('map'),{            
            controls: [],
            displayProjection: new OpenLayers.Projection("EPSG:4326"),
            tileSize: new OpenLayers.Size(128,128),
            zoomDuration: 10
            //fractionalZoom: true            
        });
        
        this.cursorManager = options.cursorManager;
        this.cursorManager.setMap(this.map);
        this.transformer.setMap(this.map);

        // Init
        this.isDrag = false;
        this.zoomLevel = 0;
        this.center = new OpenLayers.LonLat(-1, -1);

        //This displays the coordenates where the mouse is located in the map
        this.mousePosition = new OpenLayers.Control.MousePosition({formatOutput: function(lonLat) {
                var ns = OpenLayers.Util.getFormattedLonLat(lonLat.lat);
                var ew = OpenLayers.Util.getFormattedLonLat(lonLat.lon, 'lon');
                return ns + ', ' + ew;
            }});
        this.map.addControl(this.mousePosition);

        this.map.addControl(new OpenLayers.Control.PanPanel());
        //this.map.addControl(new OpenLayers.Control.OverviewMap());

        //this.map.addControl(new OpenLayers.Control.MyScale()); //ScaleLine
        this.map.addControl(new OpenLayers.Control.ScaleLine({geodesic:true})); //    
       
        
        // OWSManager
        var initialServers = [];

        //The last registered services
        var servicesPreference = MashupPlatform.widget.getVariable("services");


        //If there where services registered before we load them in the services catalogue
        if (servicesPreference.get() != "") {
            initialServers = JSON.parse(servicesPreference.get());
        }

        this.owsManager = new OpenLayers.Control.OWSManager(this, initialServers);
        this.map.addControl(this.owsManager);

        // Options
        if (arguments.length > 1) {
            if ('onMove' in options) {
                this._onMove = options.onMove;
            }
            if ('onBeforeDrag' in options) {
                this._onBeforeDrag = options.onBeforeDrag;
            }
            if ('onAfterDrag' in options) {
                this._onAfterDrag = options.onAfterDrag;
            }
        }
        else {
            options = {};
        }

        options['onSetZoom'] = this.setZoom.bind(this);
        options['onZoomOut'] = this.zoomOut.bind(this);
        options['onZoomIn'] = this.zoomIn.bind(this);

        // MarkerManager
        this.markerManager = new conwet.map.MarkerManager(this.map);

        // ZoomBar
        this.zoomBar = new conwet.ui.ZoomBar(options);

        // Map Events
        this.map.events.register("moveend", this, function() {
            var changes = {};            

            var center = this.transformer.normalize(this.map.getCenter());
            var zoomLevel = this.map.getZoom();
         
            if (this.zoomLevel != zoomLevel) {
                this.zoomLevel = zoomLevel;
                var zoom = zoomLevel / this.getNumZoomLevels();
                this.zoomBar.setZoom(zoom);
                changes["zoom"] = zoom;
            }
            
            if (!conwet.map.ProjectionTransformer.compareLonlat(this.center, center)) {
                this.center = center;
                changes['center'] = center;
            }

            if (('zoom' in changes) || ('center' in changes)) {
                //this.markerManager.
                this._onMove(changes);
            }

            this.isDrag = false;
            this.mousePosition.activate();
            this._onAfterDrag();
        }.bind(this));

        this.map.events.register("movestart", this, function() {
            this.isDrag = true;
            this.mousePosition.deactivate();
            // TODO Si haces dos drag seguidos sin mover el cursor, desaparecen las coordenadas
            this._onBeforeDrag();
        }.bind(this));

        this.map.events.register('mouseover', this, function() {
            if (!this.isDrag) {
                this.mousePosition.activate();
            }
        });
        this.map.events.register('mouseout', this.mousePosition, this.mousePosition.deactivate);        
    },
    getGadget: function() {
        return this.gadget;
    },
    updateState: function(state) {
        if ('center' in state) {
            this.setCenter(state.center.lon, state.center.lat);
        }
        
        if ('zoom' in state) {
            this.setZoom(state.zoom);
        }
        
    },
    setCenter: function(lon, lat) {
        var center = this.transformer.transform(new OpenLayers.LonLat(lon, lat));
        if (!conwet.map.ProjectionTransformer.compareLonlat(this.center, center)) {
            
            this.map.setCenter(center, this.map.zoom, false);
        }
    },
    setZoom: function(zoom) {
        this._setZoomLevel(Math.round(this.getNumZoomLevels() * zoom));
    },
    zoomIn: function() {
        this._setZoomLevel(this.zoomLevel + 1);
    },
    zoomOut: function() {
        this._setZoomLevel(this.zoomLevel - 1);
    },
    addWmsService: function(name, url) {
        this.owsManager.addWmsService(name, url);
    },
    addWmscService: function(name, url) {
        this.owsManager.addWmscService(name, url);
    },
    _setZoomLevel: function(zoomLevel) {
        zoomLevel = (zoomLevel < 0) ? 0 : zoomLevel;
        zoomLevel = (zoomLevel >= this.getNumZoomLevels()) ? this.getNumZoomLevels() - 1 : zoomLevel;

        if (this.zoomLevel != zoomLevel) {
            this.map.zoomTo(zoomLevel);
        }
    },
    getLonLatFromPixel: function(x, y) {
        if (!this.map.baseLayer)
            return null

        return this.transformer.normalize(this.map.getLonLatFromPixel(new OpenLayers.Pixel(x, y)));
    },
    getPixelFromLonLat: function(lon, lat) {
        if (!this.map.baseLayer)
            return null

        return this.map.getPixelFromLonLat(this.transformer.transform(new OpenLayers.LonLat(lon, lat)));
    },
    _onMove: function(zoom) {
        // To overwrite
    },
    _onBeforeDrag: function() {
        // To overwrite
    },
    _onAfterDrag: function() {
        // To overwrite
    },
    setUserMarker: function(lon, lat, title, text) {
        text = (arguments.length > 4) ? text : "";
        title = (arguments.length > 3) ? title : "";

        this._setMarker(new OpenLayers.LonLat(lon, lat), title, text, OpenLayers.AdvancedMarker.USER_MARKER, true);
    },
    setEventMarker: function(positionInfos) {
        this.markerManager.eventMarkers.clearMarkers();
        for (var i = 0; i < positionInfos.length; i++){
            var location = positionInfos[i];
            this._setMarker(this.transformer.transform(new OpenLayers.LonLat(location.lon, location.lat)), location.title, "", OpenLayers.AdvancedMarker.EVENT_MARKER, true)
        };
    },
            
    setHighlightMarker: function(lonlat){
        this.markerManager.setHighlightMarker(this.transformer.transform(new OpenLayers.LonLat(lonlat.lon, lonlat.lat)));
    },
            
    setQueryMarker: function(lon, lat, title, text) {
        text = (arguments.length > 4) ? text : "";
        title = (arguments.length > 3) ? title : "";

        this._setMarker(this.transformer.transform(new OpenLayers.LonLat(lon, lat)), title, text, OpenLayers.AdvancedMarker.QUERY_MARKER, true);
    },
    _setMarker: function(lonlat, title, text, type, popup, onClick) {
        onClick = (arguments.length > 6) ? onClick : function() {
        };

        this.markerManager.setMarker(lonlat, title, text, type, popup, function(marker) {
            var ll = this.transformer.normalize(lonlat);
            onClick(marker);
            this.getGadget().sendLocation(ll.lon, ll.lat);
        }.bind(this));
    },
    getNumMarkerLayers: function() {
        return this.markerManager.getNumLayers();
    },
    
    setBox: function (locationInfo){
        this.markerManager.setBox(locationInfo);
    },
    
    getNumZoomLevels: function(){
        var lvls = 0;
        if (this.map.scales!=null){
            lvls = this.map.scales.length;
        }
        else if(this.map.resolutions != null){
            lvls = this.map.resolutions.length;
        }
        return lvls;
    }
});
