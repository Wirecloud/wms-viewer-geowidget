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

OpenLayers.AdvancedMarker = OpenLayers.Class(OpenLayers.Marker, {
    initialize: function(markerManager, type, layer, map, lonlat, title, text, onClick, options) {
        this.imageIcons = [
            "img/marker-user.png",
            "img/marker-event.png",
            "img/marker-query.png",
            "img/marker-selected.png"
        ];

        this.markerManager = markerManager;
        this.type          = type;
        this.layer         = layer;
        this.map           = map;
        this.selected      = false;
        this.title         = title;
        this.text          = text;
        this.onClick       = onClick;
        this.lon           = lonlat.lon;
        this.lat           = lonlat.lat;
        this.lonlat = lonlat;
        this.transformer   = new conwet.map.ProjectionTransformer(map);
        
        //lonlat = this.transformer.transform(lonlat);
        OpenLayers.Marker.prototype.initialize.apply(this, [lonlat, this._createIcon()]);

        this.events.register('click', this, this._onClick.bind(this));
        $(this.icon.imageDiv).addClassName("marker");

        this.icon.imageDiv.title = this.lon + ", " + this.lat;

        this._upOpacity();
        this.timeOut = setTimeout(this._downOpacity.bind(this), 5000);        
    },

    _onClick: function(e) {
        this.onClick(this);
        this.setSelected(true);

        this.addPopup();

        OpenLayers.Event.stop(e);
    },

    addPopup: function() {
        this._clearPopups();

        var popup = new OpenLayers.Popup.FramedCloud(
            "popup",
            new OpenLayers.LonLat(this.lon, this.lat),
            new OpenLayers.Size(200, 150),
            this._formatText(),
            null,
            false,
            this._clearPopups.bind(this)
        );

        popup.div.observe("click", this._clearPopups.bind(this));
        popup.maxSize = new OpenLayers.Size(200, 150);
        popup.updateSize();
        this.map.addPopup(popup);
    },

    _truncateLocation: function(number) {
        var precision = 10000;
        return (Math.round(number*precision))/precision;
    },

    _formatText: function() {
        var location = this.transformer.advancedTransform(
            new OpenLayers.LonLat(this.lon, this.lat),
            this.map.getProjectionObject().projCode,
            this.transformer.DEFAULT.projCode
        );

        var div = document.createElement("div");
        var content = document.createElement("div");
        $(content).addClassName("popup_content");
        div.appendChild(content);
        var title = document.createElement("div");
        $(title).addClassName("popup_title");
        title.innerHTML = this.title;
        content.appendChild(title);
        var position = document.createElement("div");
        $(position).addClassName("popup_position");
        position.innerHTML = this._truncateLocation(location.lon) + ", " + this._truncateLocation(location.lat);
        content.appendChild(position);
        var text = document.createElement("div");
        $(text).addClassName("popup_text");
        text.innerHTML = this.text;
        content.appendChild(text);
        return div.innerHTML;
    },

    centerInMap: function() {
        this.map.setCenter(new OpenLayers.LonLat(this.lon, this.lat));
    },

    getType: function() {
        return this.type;
    },

    setType: function(type) {
        this.type = type;
        this.setUrl(this.imageIcons[this.type]);

        setTimeout(function() {
            if (this.isSelected()) {
                this.setUrl(this.imageIcons[OpenLayers.AdvancedMarker.SELECTED_MARKER]);
            }
        }.bind(this), 500);
    },

    setTitle: function(title) {
        this.title = title;
    },

    setText: function(text) {
        this.text = text;
    },

    setHandler: function(onClick) {
        this.onClick = onClick;
    },

    _upOpacity: function() {
        this.setOpacity(1.0);
    },

    _downOpacity: function() {
        this.setOpacity(0.7);
    },

    getLayer: function() {
        return this.layer;
    },

    setLayer: function(layer) {
        this.layer = layer;
    },

    _clearPopups: function() {
        this.markerManager.clearPopups();
    },

    setSelected: function(selected) {
        clearTimeout(this.timeOut)
        if (selected) {
            this._upOpacity();
        }
        else {
            this.timeOut = setTimeout(this._downOpacity.bind(this), 2000);
        }
        this.setUrl(this.imageIcons[(selected)? OpenLayers.AdvancedMarker.SELECTED_MARKER: this.type]);
        this.selected = selected;
    },

    isSelected: function() {
        return this.selected;
    },

    _createIcon: function() {
        var size = new OpenLayers.Size(21,25);
        var offset = new OpenLayers.Pixel(-(size.w/2), -size.h);
        return new OpenLayers.Icon(this.imageIcons[this.type], size, offset);
    },

    exist: function(lonlat) {
        return (this.lon == lonlat.lon) && (this.lat == lonlat.lat);
    }

});

OpenLayers.AdvancedMarker.USER_MARKER     = 0;
OpenLayers.AdvancedMarker.EVENT_MARKER    = 1;
OpenLayers.AdvancedMarker.QUERY_MARKER    = 2;
OpenLayers.AdvancedMarker.SELECTED_MARKER = 3;
