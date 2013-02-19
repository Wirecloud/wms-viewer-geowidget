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

conwet.ui.StyledSelect = Class.create({

    initialize: function(optionalParameters) {
        // HTML Elements

        this.ezwebDocument = window.parent.document;
        var opManager = window.parent.OpManagerFactory.getInstance();
        this.gadgetObject = opManager.activeWorkspace.getIWidget(EzWebAPI.getId()).content;

        this.contentElement = document.createElement("div");
        $(this.contentElement).addClassName("select_container");

        this.backgroundElement = this.ezwebDocument.createElement("div");
        window.parent.$(this.backgroundElement).addClassName("select_background");

        this.headElement = document.createElement("div");
        $(this.headElement).addClassName("select_head");

        this.listElement = this.ezwebDocument.createElement("div");
        window.parent.$(this.listElement).addClassName("select_list");

        this.contentElement.appendChild(this.headElement);

        // Options
        this.options = [];
        this.selectedOption = null;
        this.selectedIndex = -1;

        // Optional paramenters
        if ((arguments.length > 0) && optionalParameters) {
            if ('onChange' in optionalParameters) {
                this.onChange = optionalParameters.onChange;
            }
        }

        // Necesary for disable events
        this._openList  = this._openList.bind(this);
        this._closeList = this._closeList.bind(this);

        // HTML Events
        this.enable();
        this.backgroundElement.observe('click', function(e) {
            this._closeList();
            e.stop();
        }.bind(this), true);
    },

    addClassName: function(className) {
        this.contentElement.addClassName(className);
    },

    removeClassName: function(className) {
        this.contentElement.removeClassName(className);
    },

    enable: function() {
        this.headElement.observe('click', this._openList);
        this.headElement.removeClassName("disable");
    },

    disable: function() {
        this.headElement.stopObserving('click', this._openList);
        this.headElement.addClassName("disable");
    },

    insertInto: function(parentElement) {
        parentElement.appendChild(this.contentElement);
    },

    exist: function(option) {
        for (var i=0; i<this.options.length; i++) {
            if (this.options[i].equals(option)) {
                return true;
            }
        }
        return false;
    },

    _openList: function() {
        this.headElement.stopObserving('click', this._openList);
        this.headElement.observe('click', this._closeList);

        this.ezwebDocument.body.appendChild(this.backgroundElement);
        this.ezwebDocument.body.appendChild(this.listElement);

        var gadgetOffset = EzWebExt.getRelativePosition(this.gadgetObject, this.ezwebDocument.body);
        var selectOffset = this.contentElement.viewportOffset();

        this._setCSSRules(this.backgroundElement);
        this._setCSSRules(this.listElement);
        this.listElement.style.top   = (gadgetOffset.y + selectOffset.top + this.contentElement.offsetHeight) + "px";
        this.listElement.style.left  = (gadgetOffset.x + selectOffset.left + 10) + "px";
        this.listElement.style.width = (this.contentElement.offsetWidth - 15) + "px";

        var close = function(e) {
            this._closeList();
            //TODO
            document.body.stopObserving('click', close, false);
            e.stop();
        }.bind(this);
        document.body.observe('click', close, false);
    },

    _closeList: function() {
        this.headElement.stopObserving('click', this._closeList);
        this.headElement.observe('click', this._openList);

        if (this.isEmpty()) {
            this.selectedOption = null;
            this.selectedIndex = -1;
            this.headElement.innerHTML = "";
        }
        else {
            if (!this._updateSelected(this.selectedOption)) {
                this._updateSelected(this.options[0]);
            }
        }

        try {this.ezwebDocument.body.removeChild(this.backgroundElement);} catch(e) {}
        try {this.ezwebDocument.body.removeChild(this.listElement);} catch(e) {}
    },

    _setCSSRules: function(element) {
        if ("classNames" in element) {
            element.classNames().each(function(className) {
                if (className in STYLED_SELECT_CSS) {
                    element.setStyle(STYLED_SELECT_CSS[className]);
                }
            }.bind(this));
        }
        $A(element.childNodes).each(function(child) {
            this._setCSSRules(child);
        }.bind(this));
    },

    isEmpty: function() {
        return this.options.length <= 0;
    },

    addOption: function(name, value, optionalParameters) {
        var option = new conwet.ui.StyledOption(this, name, value, optionalParameters);
        this.addOptionObj(option, optionalParameters);
    },

    addOptionObj: function(option, optionalParameters) {
        if (this.exist(option)) {
            return;
        }

        var selected  = false;
        // Optional paramenters
        if (arguments.length > 1) {
            if (optionalParameters && ('selected' in optionalParameters)) {
                selected = optionalParameters.selected;
            }
        }

        this.options.push(option);
        option.insertInto(this.listElement);

        if ((this.options.length == 1) || selected) {
            this._updateSelected(option);
        }
    },

    removeOption: function(option) {
        if (!this.isEmpty()) {
            for (var i=0; i<this.options.length; i++) {
                if (this.options[i].equals(option)) {
                    this.options.splice(i,1);
                    return true;
                }
            }
        }
        return false;
    },

    clear: function(option) {
        this.options = [];
        this.listElement.innerHTML = "";
    },

    _updateSelected: function(option) {
        if (!this.isEmpty()) {
            for (var i=0; i<this.options.length; i++) {
                if (this.options[i].equals(option)) {
                    this.selectedIndex = i;

                    if (!option.equals(this.selectedOption)) {
                        this.selectedOption = option;
                        this.headElement.innerHTML = option.getName();
                        this.onChange(this.getSelectedValue());
                    }
                    return true;
                }
            }
        }
        return false;
    },

    setSelected: function(option) {
        this._updateSelected(option);
        this._closeList();
    },

    getSelectedName: function() {
        return this.selectedOption.getName();
    },

    getSelectedValue: function() {
        return this.selectedOption.getValue();
    },

    getSelectedIndex: function() {
        return this.selectedIndex;
    },

    onChange: function(value) {
        // To overwrite
    }

});
