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

OpenLayers.Control.RichNavigation = OpenLayers.Class(OpenLayers.Control.Navigation, {

    initialize: function(controls, className, options) {
        this.otherControls = controls;
        this.CLASS_NAME += className;
        OpenLayers.Control.Navigation.prototype.initialize.apply(this, [options]);
    },

    setMap: function (map) {
        OpenLayers.Control.prototype.setMap.apply(this, arguments);

        // Add other controls
        for (var i=0; i<this.otherControls.length; i++) {
            this.map.addControl(this.otherControls[i]);
        }
    },

    activate: function() {
        for (var i=0; i<this.otherControls.length; i++) {
            this.otherControls[i].activate();
        }

        OpenLayers.Control.Navigation.prototype.activate.apply(this);
    },

    deactivate: function() {
        for (var i=0; i<this.otherControls.length; i++) {
            this.otherControls[i].deactivate();
        }

        OpenLayers.Control.Navigation.prototype.deactivate.apply(this);
    },

    CLASS_NAME: "OpenLayers.Control.RichNavigation"

});
