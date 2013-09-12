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

conwet.map.ProjectionTransformer = Class.create({

    initialize: function(map) {
        this.PROJECTIONS_SERVER_URL = "http://spatialreference.org/ref/";
        this.DEFAULT     = new OpenLayers.Projection('EPSG:4326');
        this.map     = (map)? map: null;
    },

    normalize: function(point) {
        return this.advancedTransform(point, this.map.getProjectionObject().projCode, this.DEFAULT.projCode);
    },

    transform: function(point) {
        return this.advancedTransform(point, this.DEFAULT.projCode, this.map.getProjectionObject().projCode);
    },

    advancedTransform: function(point, projA, projB) {
        if (!projA || !projB || !point) {
            return point;
        }
        this._preloadProjection(projA);
        this._preloadProjection(projB);
        return point.transform(new OpenLayers.Projection(projA), new OpenLayers.Projection(projB));
    },

    getMaxExtent: function(projection) {
        var bbox = [-180, -90, 180, 90];
        return this.getExtent(bbox, 'EPSG:4326', projection);
    },

    getExtent: function(bbox, proj1, proj2) {
        var p1 = this.advancedTransform(new OpenLayers.LonLat(bbox[0], bbox[1]), proj1, proj2);
        var p2 = this.advancedTransform(new OpenLayers.LonLat(bbox[2], bbox[3]), proj1, proj2);
        return new OpenLayers.Bounds(p1.lon, p1.lat, p2.lon, p2.lat);
    },

    setMap: function(map) {
        this.map = map;
    },

    _preloadProjection: function(proj) {
        if (proj in Proj4js.defs) {
            return;
        }

        try {
            var options = {
                method:       'GET',
                parameters:   {},
                asynchronous: false
            };

            var srs = srs = proj.toLowerCase().split(':').join('/');
            var url = this.PROJECTIONS_SERVER_URL + srs + '/proj4js/';

            var projDef = MashupPlatform.http.makeRequest(url, options);
            eval(projDef.transport.responseText + "alert(" + projDef.transport.responseText + ");");
        }
        catch (e) {
            //alert("Error");
        }
    }

});

conwet.map.ProjectionTransformer.compareLonlat = function(lonlat1, lonlat2) {
    var _truncate = function(number) {
        var precision = 10000;
        return (Math.round(number*precision))/precision;
    }

    return (_truncate(lonlat1.lon) == _truncate(lonlat2.lon)) && (_truncate(lonlat1.lat) == _truncate(lonlat2.lat));
}
