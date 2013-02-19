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

OpenLayers.Control.MyScale = OpenLayers.Class(OpenLayers.Control.Scale, {

    updateScale: function () {
        var scale;
        if (this.geodesic === true) {
            var units = this.map.getUnits();
            if (!units) {
                return;
            }
            var inches = OpenLayers.INCHES_PER_UNIT;
            scale = (this.map.getGeodesicPixelSize().w || 0.000001) * inches["km"] * OpenLayers.DOTS_PER_INCH;
        } else {
            scale = this.map.getScale();
        }
        if(!scale) {
            return;
        }
        if(scale >= 9500 && scale <= 950000) {
            scale = Math.round(scale / 1000) + "K";
        } else if (scale >= 950000) {
            scale = Math.round(scale / 1000000) + "M";
        } else {
            scale = Math.round(scale);
        }
        this.element.innerHTML = _("Scale") + " = 1:" + scale;
    }

});
