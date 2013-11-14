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

conwet.map.MarkerManager = Class.create({

    initialize: function(map) {
        this.map = map;

        this.selectedMarker = null;

        this.userMarkers  = new OpenLayers.Layer.Markers("User  markers");
        this.eventMarkers = new OpenLayers.Layer.Markers("Event markers");
        this.queryMarkers = new OpenLayers.Layer.Markers("Query markers");
        this.boxesMarkers = new OpenLayers.Layer.Boxes("Boxes");
        this.map.addLayer(this.userMarkers);
        this.map.addLayer(this.eventMarkers);
        this.map.addLayer(this.queryMarkers);
        this.map.addLayer(this.boxesMarkers);
        
        this.box = null;
        
        this.markers = [];
        this._drawToolbar();
        this.showToolbar(true); // TODO Toolbar visible solo en el modo Marker
        this._updateToolbar();
    },

    _drawToolbar: function() {
        this.toolbar = document.createElement("div");
        $(this.toolbar).addClassName("marker_toolbar");
        this.map.viewPortDiv.appendChild(this.toolbar);

        this.removeAllButton = conwet.ui.UIUtils.createButton({
            "classNames": ["marker_button", "remove_all"],
            "title"     : _("Remove all markers"),
            "onClick"   : this._removeAllMarkers.bind(this)
        });
        this.toolbar.appendChild(this.removeAllButton);

        this.removeQueryButton = conwet.ui.UIUtils.createButton({
            "classNames": ["marker_button", "remove_query"],
            "title"     : _("Remove all temporal markers"),
            "onClick"   : this._removeTemporalMarkers.bind(this)
        });
        this.toolbar.appendChild(this.removeQueryButton);

        this.removeSelectedButton = conwet.ui.UIUtils.createButton({
            "classNames": ["marker_button", "remove_selected"],
            "title"     : _("Remove selected marker"),
            "onClick"   : this._removeSelectedMarker.bind(this)
        });
        this.toolbar.appendChild(this.removeSelectedButton);

        this.saveButton = conwet.ui.UIUtils.createButton({
            "classNames": ["marker_button", "save"],
            "title"     : _("Change to user marker"),
            "onClick"   : this._saveSelectedMarker.bind(this)
        });
        this.toolbar.appendChild(this.saveButton);
    },

    showToolbar: function(show) {
        this._showElement(this.toolbar, show);
    },

    _showElement: function(element, show) {
        if (show) {
            $(element).removeClassName("no_display");
        }
        else {
            $(element).addClassName("no_display");
        }
    },

    _updateToolbar: function() {
        var hasQuery = this.queryMarkers.markers.length > 0;
        var hasEvent = this.eventMarkers.markers.length > 0;
        var hasUser  = this.userMarkers.markers.length > 0;
        var hasBox = (this.box!=null);

        this._showElement(this.saveButton, false);
        this._showElement(this.removeSelectedButton, false);
        this._showElement(this.removeQueryButton, false);

        if (!hasQuery && !hasEvent && !hasUser && !hasBox) {
            this._showElement(this.removeAllButton, false);
        }
        else {
            this._showElement(this.removeAllButton, true);
        }

        return; // TODO Gestion de POIs

        if (!hasQuery && !hasEvent && !hasUser && !hasBox) {
            this._showElement(this.saveButton, false);
            this._showElement(this.removeSelectedButton, false);
            this._showElement(this.removeAllButton, false);
            this._showElement(this.removeQueryButton, false);
        }
        else {
            this._showElement(this.removeAllButton, true);
            this._showElement(this.removeQueryButton, hasQuery || hasEvent);
            this._showElement(this.saveButton, (this.selectedMarker != null) && 
                (this.selectedMarker.getType() != OpenLayers.AdvancedMarker.USER_MARKER));
            this._showElement(this.removeSelectedButton, this.selectedMarker != null);
        }
    },

    /*setMarkers: function(locations) {
        this.eventMarkers.clearMarkers();
        for (var i=0; i<locations.length; i++){
            var location = locations[i];
            this.setMarker(new OpenLayers.LonLat(location.lon, location.lat), location.title, "", 0, true);
        }
    },*/

    setMarker: function(lonlat, title, text, type, popup, onClick) {
        /*if ((type == OpenLayers.AdvancedMarker.QUERY_MARKER) || (type == OpenLayers.AdvancedMarker.EVENT_MARKER)) {
            this._removeTemporalMarkers();
        }*/ // TODO Gestion de POIs
        //this._removeAllMarkers();
        this._setMarker(lonlat, title, text, type, popup, onClick);
    },

    _setMarker: function(lonlat, title, text, type, popup, onClick) {
        var marker = this._getExistingMarker(lonlat); // Si el marcador ya existe
        if (marker != null) {
            this._updateMarker(marker, title, text, type, onClick);
        }
        else {
            var markersLayer = this._getMarkersLayer(type);           

            marker = new OpenLayers.AdvancedMarker(this, type, markersLayer, this.map, lonlat, title, text, function(marker) {
                if (!marker.isSelected() && (this.selectedMarker != null)) {
                    this.selectedMarker.setSelected(false);
                }
                this.selectedMarker = marker;
                this._updateToolbar();

                onClick(marker);
            }.bind(this));
            this.markers.push(marker);
            markersLayer.addMarker(marker);
        }

        if (type == OpenLayers.AdvancedMarker.EVENT_MARKER) {
            marker.centerInMap();
        }

        if (popup) {
            marker.addPopup();
        }
        else {
            this.clearPopups();
        }

        this._updateToolbar();
        if (type === OpenLayers.AdvancedMarker.USER_MARKER) {
            onClick(marker);
        }
    },
            
    setHighlightMarker: function (lonlat){
        var marker = this._getExistingMarker(lonlat); // Si el marcador ya existe
        if (marker != null) {
            if (this.selectedMarker!=null){
                this.selectedMarker.setSelected(false);
            }
            this.selectedMarker=marker;
            this._updateToolbar();
            this.selectedMarker.setSelected(true);
            this.selectedMarker.addPopup();
            this.map.setCenter(this.selectedMarker.lonlat);
        }
    },

    _getExistingMarker: function(lonlat) {
        var layers = [this.queryMarkers, this.eventMarkers, this.userMarkers];

        for (var i=0; i<layers.length; i++) {
            var markers = layers[i].markers;
            for (var j=0; j<markers.length; j++) {
                if (markers[j].exist(lonlat)) {
                    return markers[j];
                }
            }
        }

        return null;
    },

    _getMarkersLayer: function(type) {
        var markersLayer = null;
        switch(type) {
            case OpenLayers.AdvancedMarker.QUERY_MARKER:
                markersLayer = this.queryMarkers;
                break;
            case OpenLayers.AdvancedMarker.EVENT_MARKER:
                markersLayer = this.eventMarkers;
                break;
            default:
                markersLayer = this.userMarkers;
        }

        return markersLayer;
    },

    _updateMarker: function(marker, title, text, type, onClick) {
        marker.setText(text);
        marker.setTitle(title);
        marker.setHandler(onClick);

        if (marker.getType() == type)
            return;

        switch(marker.getType()) {
            case OpenLayers.AdvancedMarker.QUERY_MARKER:
                this._changeTypeMarker(marker, type);
                break;
            case OpenLayers.AdvancedMarker.EVENT_MARKER:
                if (type == OpenLayers.AdvancedMarker.USER_MARKER) {
                    this._changeTypeMarker(marker, type);
                }
                break;
        }
    },

    _changeTypeMarker: function(marker, type) {
        marker.getLayer().removeMarker(marker);
        marker.setType(type);
        var markersLayer = this._getMarkersLayer(type);
        marker.setLayer(markersLayer);
        markersLayer.addMarker(marker);
    },

    getNumLayers: function() {
        return 4;
    },

    _removeAllMarkers: function() {
        this.userMarkers.clearMarkers();
        this.eventMarkers.clearMarkers();
        this.queryMarkers.clearMarkers();
        this.boxesMarkers.clearMarkers();
        this.box = null;
        this.selectedMarker = null;
        this.clearPopups();
        this._updateToolbar();
        this.markers=[];

    },

    _removeTemporalMarkers: function() {
        this.queryMarkers.clearMarkers();
        this.eventMarkers.clearMarkers();
        if ((this.selectedMarker != null) && 
                ((this.selectedMarker.getType() == OpenLayers.AdvancedMarker.QUERY_MARKER) ||
                (this.selectedMarker.getType() == OpenLayers.AdvancedMarker.EVENT_MARKER))) {
            this.selectedMarker = null;
        }
        this.clearPopups();
        this._updateToolbar();
    },

    _removeSelectedMarker: function() {
        if (this.selectedMarker != null) {
            this.selectedMarker.getLayer().removeMarker(this.selectedMarker);
            this.selectedMarker = null;
            this.clearPopups();
            this._updateToolbar();
        }
    },

    _saveSelectedMarker: function() {
        if (this.selectedMarker != null) {
            this._changeTypeMarker(this.selectedMarker, OpenLayers.AdvancedMarker.USER_MARKER);
            this.clearPopups();
            this._updateToolbar();
        }
    },

    clearPopups: function() {
        for (var i=0; i<this.map.popups.length; i++) {
            var popup = this.map.popups[i];
            this.map.removePopup(popup);
            popup.destroy();
        }
    },
    
    setBox: function(positionInfos){
        var bounds = positionInfos.bbox;
        var transformer = new conwet.map.ProjectionTransformer(this.map);
        var newBounds = new OpenLayers.Bounds(); //bounds[2],bounds[1],bounds[0],bounds[3]        
        newBounds.extend(transformer.transform(new OpenLayers.LonLat(bounds[0],bounds[1])));
        newBounds.extend(transformer.transform(new OpenLayers.LonLat(bounds[2],bounds[3])));
        
        if (this.box!=null){
            this.boxesMarkers.removeMarker(this.box);
            this.box=null;
        }
        
        this.box =  new OpenLayers.Marker.Box(newBounds);
        this.map.zoomToExtent(newBounds);
        
         
        this.boxesMarkers.addMarker(this.box);
        this._updateToolbar();
    }

});
