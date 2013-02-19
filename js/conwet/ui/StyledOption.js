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

use('conwet.ui');

conwet.ui.StyledOption = Class.create({

    initialize: function(select, name, value, optionalParameters) {
        this.select = select;
        this.name   = name;
        this.value  = value;

        // HTML Elements
        this.ezwebDocument = window.parent.document;

        this.contentElement = this.ezwebDocument.createElement("div");
        window.parent.$(this.contentElement).addClassName("option_container");

        this.labelElement = this.ezwebDocument.createElement("div");
        this.labelElement.innerHTML = name;
        window.parent.$(this.labelElement).addClassName("option_label");
        this.contentElement.appendChild(this.labelElement);

        var removable = false;

        // Optional paramenters
        if ((arguments.length > 3) && optionalParameters) {
            if ('removable' in optionalParameters) {
                removable = optionalParameters.removable;
            }
            if ('onRemove' in optionalParameters) {
                this.onRemove = optionalParameters.onRemove;
            }
        }

        if (removable) {
            this.buttonElement = this.ezwebDocument.createElement("div");
            window.parent.$(this.buttonElement).addClassName("option_button");
            this.buttonElement.observe("click", function(e) {
                this.remove();
                e.stop();
            }.bind(this));
            this.buttonElement.title = "Remove"
            this.contentElement.appendChild(this.buttonElement);
        }

        this.contentElement.observe("click", this.setSelected.bind(this));
        this.contentElement.observe("mouseover", function(){
            this.contentElement.style.backgroundColor = "#B6DAFB";
        }.bind(this));
        this.contentElement.observe("mouseout", function(){
            this.contentElement.style.backgroundColor = "transparent";
        }.bind(this));
    },

    getName: function() {
        return this.name;
    },

    getValue: function() {
        return this.value;
    },

    insertInto: function(parentElement) {
        parentElement.appendChild(this.contentElement);
    },

    setSelected: function() {
        this.select.setSelected(this);
    },

    remove: function() {
        this.contentElement.remove();
        this.select.removeOption(this);
        this.onRemove(this.name, this.value);
    },

    equals: function(option) {
        return (
            (option != null) && (typeof option == "object") &&
            ("name" in option) && ("value" in option) &&
            this._isEqualsValue(option.value, this.value) && (option.name == this.name)
        );
    },

    _isEqualsValue: function(value1, value2) {
        if ((typeof value1 != "object") || (typeof value2 != "object")) {
            return value1 == value2;
        }
        else {
            var keys = $H(value1).keys();

            if (keys.length != $H(value2).keys().length) {
                return false;
            }

            for (var i=0; i<keys.length; i++) {
                var key = keys[i];
                if (key in value2) {
                    if (value1[key] != value2[key]) {
                        return false;
                    }
                }
            }
            return true;
        }
    },

    onRemove: function(name, value) {
        // To overwrite
    }

});
