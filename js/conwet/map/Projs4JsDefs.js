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

// http://spatialreference.org/

Proj4js.defs["EPSG:4326"]   = "+proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees +no_defs";
Proj4js.defs["EPSG:900913"] = "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs";
Proj4js.defs["EPSG:25830"] = "+proj=utm +zone=30 +ellps=GRS80 +units=m +no_defs";
Proj4js.defs['EPSG:23030'] = '+proj=utm +zone=30 +ellps=intl +units=m +towgs84=-157.89,-17.16,-78.41,2.118,2.697,-1.434,-1.1097046576093785 +nodefs';
Proj4js.defs["EPSG:4258"] = "+proj=longlat +ellps=GRS80 +units=degrees";
Proj4js.defs["EPSG:4230"] = "+proj=longlat +ellps=intl +units=degrees +no_defs";

Proj4js.maxScale = {};
Proj4js.maxScale["m"]       = 443744272.724101;
Proj4js.maxScale["degrees"] = 442943843;
