CKCatalog.Table = function(heading) {
  this.el = document.createElement('div');
  this.el.className = 'table-wrapper';
  this._numberOfColumns = 2;
  this._rows = [];
  this._heading = heading || [];
  this._rowIsSelectable = function() {
    return false;
  };
  this._selectHandler = function() {};
  var table = document.createElement('table');
  if (heading && Array.isArray(heading)) {
    this._numberOfColumns = heading.length;
    var head = table.appendChild(document.createElement('thead'));
    var tr = head.appendChild(document.createElement('tr'));
    heading.forEach(function(name) {
      var th = document.createElement('th');
      th.textContent = name;
      tr.appendChild(th);
    });
    this.body = table.appendChild(document.createElement('tbody'));
  } else {
    this.body = table;
  }
  this.el.appendChild(table);
};
CKCatalog.Table.prototype.clearAllRows = function() {
  this._rows = [];
  this.body.innerHTML = '';
  return this;
};
CKCatalog.Table.prototype.renderObject = function(object) {
  for (var k in object) {
    if (object.hasOwnProperty(k)) {
      this.appendRow(k, object[k]);
    }
  }
  return this;
};
CKCatalog.Table.prototype.setTextForUndefinedValue = function(text) {
  this._textForUndefinedValue = text;
  return this;
};
CKCatalog.Table.prototype.setTextForEmptyRow = function(text) {
  this._textForEmptyRow = text;
  return this;
};
CKCatalog.Table.prototype._textForUndefinedValue = '-';
CKCatalog.Table.prototype._textForEmptyRow = 'No Content';
CKCatalog.Table.prototype._createRowWithKey = function(key) {
  var tr = document.createElement('tr');
  var th = document.createElement('th');
  th.textContent = key;
  tr.appendChild(th);
  return tr;
};
CKCatalog.Table.prototype._createRowWithValues = function(values, boolArray, opts) {
  var tr = document.createElement('tr');
  var that = this;
  opts = opts || {};
  values.forEach(function(value, index) {
    var td;
    if (value === null || value === undefined) {
      td = that._createEmptyValueCell();
    } else {
      td = document.createElement('td');
      if (boolArray && !boolArray[index]) {
        if (typeof value === 'object' && !(value instanceof Date)) {
          td.appendChild(that._createPrettyObject(value));
        } else {
          td.appendChild(that._createPrettyElementForTypedValue(value, opts.type));
        }
      } else {
        td.innerHTML = value;
      }
    }
    tr.appendChild(td);
  });
  return tr;
};
CKCatalog.Table.prototype._createEmptyRow = function() {
  var tr = document.createElement('tr');
  tr.innerHTML = '<td class="light align-center" colspan="' +
    this._numberOfColumns + '">' + this._textForEmptyRow + '</td>';
  tr.className = 'empty';
  return tr;
};
CKCatalog.Table.prototype._createEmptyValueCell = function() {
  var td = document.createElement('td');
  var span = document.createElement('span');
  span.className = 'light';
  span.textContent = this._textForUndefinedValue;
  td.appendChild(span);
  return td;
};
CKCatalog.Table.prototype._prettyPrintValue = function(value) {
  if (value instanceof Date) {
    return value.toLocaleString();
  } else if (typeof value === 'object') {
    return JSON.stringify(value, null, '  ').replace(/^{\n/, '').replace(/}$/, '');
  } else {
    return value;
  }
};
CKCatalog.Table.prototype._createPrettyElementForTypedValue = function(value, type) {
  var el = document.createElement('div');
  el.className = 'ellipsis max-width-500';
  if (type === CKCatalog.FIELD_TYPE_BYTES) {
    el.appendChild(this._createDownloadLinkFromBase64String(value));
  } else if (type === CKCatalog.FIELD_TYPE_TIMESTAMP) {
    el.textContent = (new Date(value)).toLocaleString();
  } else {
    el.textContent = value;
  }
  return el;
};
CKCatalog.Table.prototype._createPrettyObject = function(object, opts) {
  var el;
  opts = opts || {};
  if (Array.isArray(object)) {
    var that = this;
    if (object.length) {
      el = document.createElement('ol');
      el.className = 'object array';
      object.forEach(function(item) {
        var li = document.createElement('li');
        if (typeof item !== 'string' && typeof item !== 'number') {
          li.className = 'array-item';
        }
        li.appendChild(that._createPrettyObject(item, opts));
        el.appendChild(li);
      });
    } else {
      el = document.createElement('div');
      el.textContent = this._textForUndefinedValue;
    }
  } else if (typeof object === 'object') {
    el = document.createElement('div');
    el.className = 'object';
    for (var k in object) {
      if (object.hasOwnProperty(k)) {
        var wrapper = document.createElement('div');
        var key = document.createElement('span');
        key.className = 'object-key';
        key.textContent = k + ':';
        var val;
        if (typeof object[k] === 'object' && !(object[k] instanceof Date)) {
          val = document.createElement('pre');
        } else {
          val = document.createElement('span');
        }
        val.className = 'object-value';
        if (k === 'downloadURL' && object[k]) {
          val.classList.add('download-url');
          wrapper.classList.add('max-width-500');
          val.innerHTML = '<a class="link" href="' + object[k] + '" download>' + object[k] + '</a>';
        } else {
          val.textContent = this._prettyPrintValue(object[k]);
        }
        wrapper.appendChild(key);
        wrapper.appendChild(val);
        el.appendChild(wrapper);
      }
    }
  } else {
    el = this._createPrettyElementForTypedValue(object, opts.type);
  }
  return el;
};
CKCatalog.Table.prototype._createDownloadLinkFromBase64String = function(base64String) {
  var link = document.createElement('a');
  link.setAttribute('download', '');
  link.setAttribute('href', 'data:application/octet-stream;base64,' + base64String);
  link.textContent = base64String.substr(0, 20) + '…';
  return link;
};
CKCatalog.Table.prototype._createRow = function(keyOrValues, value, opts) {
  var tr;
  opts = opts || {};
  if (Array.isArray(keyOrValues)) {
    if (keyOrValues.length === 0) {
      tr = this._createEmptyRow();
    } else {
      tr = this._createRowWithValues(keyOrValues, [], opts);
    }
  } else {
    tr = this._createRowWithKey(keyOrValues);
    var td;
    if (value === null || value === undefined) {
      td = this._createEmptyValueCell();
    } else {
      td = document.createElement('td');
      if (typeof value === 'object' && !(value instanceof Date)) {
        td.appendChild(this._createPrettyObject(value, opts));
      } else {
        td.appendChild(this._createPrettyElementForTypedValue(value, opts.type));
      }
    }
    tr.appendChild(td);
  }
  return tr;
};
CKCatalog.Table.prototype._createDataHash = function(keyOrValues, value) {
  var data = {};
  if (Array.isArray(keyOrValues)) {
    this._heading.forEach(function(key, index) {
      data[key] = keyOrValues[index];
    });
  } else {
    data[keyOrValues] = value;
  }
  return data;
};
CKCatalog.Table.prototype._addHandlersToRow = function(row) {
  if (this._rowIsSelectable(row)) {
    row.el.classList.add('selectable');
    var handler = this._selectHandler;
    row.el.onclick = function() {
      handler(row);
    };
  }
};
CKCatalog.Table.prototype.appendRow = function(keyOrValues, value, opts) {
  var tr = this._createRow(keyOrValues, value, opts);
  this.body.appendChild(tr);
  var row = {
    data: this._createDataHash(keyOrValues, value),
    el: tr
  };
  this._rows.push(row);
  this._addHandlersToRow(row);
  return this;
};
CKCatalog.Table.prototype.prependRow = function(keyOrValues, value) {
  var tr = this._createRow(keyOrValues, value);
  this.body.insertBefore(tr, this.body.firstChild);
  var row = {
    data: this._createDataHash(keyOrValues, value),
    el: tr
  };
  this._rows.unshift(row);
  this._addHandlersToRow(row);
  return this;
};
CKCatalog.Table.prototype.rowIsSelectable = function(condition) {
  this._rowIsSelectable = condition;
  return this;
};
CKCatalog.Table.prototype.addSelectHandler = function(handler) {
  this._selectHandler = handler;
  return this;
};
(function() {
  var constants = {
    FIELD_TYPE_STRING: 'STRING',
    FIELD_TYPE_LOCATION: 'LOCATION',
    FIELD_TYPE_ASSET: 'ASSETID',
    FIELD_TYPE_REFERENCE: 'REFERENCE',
    FIELD_TYPE_BYTES: 'BYTES',
    FIELD_TYPE_DOUBLE: 'NUMBER_DOUBLE',
    FIELD_TYPE_INT64: 'NUMBER_INT64',
    FIELD_TYPE_TIMESTAMP: 'TIMESTAMP',
    FIELD_TYPE_FILTER: 'FILTER',
    FIELD_TYPE_SHARE_PARTICIPANT: 'SHARE_PARTICIPANT',
    COMPARATOR_EQUALS: 'EQUALS',
    COMPARATOR_NOT_EQUALS: 'NOT_EQUALS',
    COMPARATOR_LESS_THAN: 'LESS_THAN',
    COMPARATOR_LESS_THAN_OR_EQUALS: 'LESS_THAN_OR_EQUALS',
    COMPARATOR_GREATER_THAN: 'GREATER_THAN',
    COMPARATOR_GREATER_THAN_OR_EQUALS: 'GREATER_THAN_OR_EQUALS',
    COMPARATOR_NEAR: 'NEAR',
    COMPARATOR_CONTAINS_ALL_TOKENS: 'CONTAINS_ALL_TOKENS',
    COMPARATOR_IN: 'IN',
    COMPARATOR_NOT_IN: 'NOT_IN',
    COMPARATOR_CONTAINS_ANY_TOKENS: 'CONTAINS_ANY_TOKENS',
    COMPARATOR_LIST_CONTAINS: 'LIST_CONTAINS',
    COMPARATOR_NOT_LIST_CONTAINS: 'NOT_LIST_CONTAINS',
    COMPARATOR_NOT_LIST_CONTAINS_ANY: 'NOT_LIST_CONTAINS_ANY',
    COMPARATOR_BEGINS_WITH: 'BEGINS_WITH',
    COMPARATOR_NOT_BEGINS_WITH: 'NOT_BEGINS_WITH',
    COMPARATOR_LIST_MEMBER_BEGINS_WITH: 'LIST_MEMBER_BEGINS_WITH',
    COMPARATOR_NOT_LIST_MEMBER_BEGINS_WITH: 'NOT_LIST_MEMBER_BEGINS_WITH',
    COMPARATOR_LIST_CONTAINS_ALL: 'LIST_CONTAINS_ALL',
    COMPARATOR_NOT_LIST_CONTAINS_ALL: 'NOT_LIST_CONTAINS_ALL',
    SHARE_RECORD_TYPE_NAME: 'cloudkit.share',
    DEFAULT_ZONE_NAME: '_defaultZone'
  };
  for (var key in constants) {
    CKCatalog[key] = constants[key];
  }
})();
