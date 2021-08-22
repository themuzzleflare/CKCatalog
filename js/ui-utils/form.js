CKCatalog.FormInputHelpers.DEFAULT = {
  valueKeys: {
    first: 'value',
    last: 'value'
  },
  add: function(opts) {
    var name = opts.name;
    var value = opts.value;
    if (this.isNumberType(opts.type)) {
      return this.addInputField({
        placeholder: 'Field value',
        name: name + '-value',
        value: value
      });
    }
    return this.addInputField({
      placeholder: opts.placeholder,
      name: name + '-value',
      type: opts.type,
      value: value
    });
  },
  toggle: function(opts, bool) {
    this.toggleRow(opts.name + '-value', bool);
    return this;
  },
  remove: function(opts) {
    var name = opts.name;
    this.removeRowByFieldName(name + '-value');
    delete this.fields[name + '-value'];
    return this;
  },
  serialize: function(opts) {
    return this.getFieldValue(opts.name + '-value');
  }
};
CKCatalog.FormInputHelpers[CKCatalog.FIELD_TYPE_ASSET] = {
  add: function(opts) {
    return this.addFileInputField({
      name: opts.name + '-value',
      value: opts.value
    });
  },
  serialize: function(opts) {
    var fileInput = this.fields[opts.name + '-value'];
    return fileInput.assetValue || fileInput.files[0];
  }
};
CKCatalog.FormInputHelpers[CKCatalog.FIELD_TYPE_BYTES] = {
  add: function(opts) {
    return this.addFileInputField({
      name: opts.name + '-value',
      value: opts.value,
      base64: true
    });
  },
  serialize: function(opts) {
    var fileInput = this.fields[opts.name + '-value'];
    return fileInput.assetValue;
  }
};
CKCatalog.FormInputHelpers[CKCatalog.FIELD_TYPE_LOCATION] = {
  valueKeys: {
    first: 'latitude',
    last: 'longitude'
  },
  add: function(opts) {
    var name = opts.name;
    var value = opts.value;
    return this.addInputField({
      placeholder: 'Latitude',
      name: name + '-latitude',
      value: value && value.latitude
    }).addInputField({
      placeholder: 'Longitude',
      name: name + '-longitude',
      value: value && value.longitude
    });
  },
  toggle: function(opts, bool) {
    this.toggleRow(opts.name + '-latitude', bool);
    return this;
  },
  remove: function(opts) {
    var name = opts.name;
    this.removeRowByFieldName(name + '-longitude');
    delete this.fields[name + '-longitude'];
    delete this.fields[name + '-latitude'];
    return this;
  },
  serialize: function(opts) {
    var lat = this.fields[opts.name + '-latitude'].value;
    var long = this.fields[opts.name + '-longitude'].value;
    if (isNaN(lat) || isNaN(long)) {
      return null;
    }
    return {
      latitude: parseFloat(lat),
      longitude: parseFloat(long)
    };
  }
};
CKCatalog.FormInputHelpers[CKCatalog.FIELD_TYPE_STRING] = {
  add: function(opts) {
    return this.addTextareaField({
      placeholder: 'Field value',
      name: opts.name + '-value',
      value: opts.value
    });
  }
};
CKCatalog.FormInputHelpers[CKCatalog.FIELD_TYPE_REFERENCE] = {
  valueKeys: {
    first: 'record-name',
    last: 'action'
  },
  add: function(opts) {
    var name = opts.name;
    var value = opts.value;
    var classNames = opts.arrayItem ? ['array-item'] : [];
    return this.addInputField({
      placeholder: 'Record name',
      name: name + '-record-name',
      value: value && value.recordName
    }).addMultipleFields({
      number: 2,
      classNames: classNames
    }).addEmptyField().addInputField({
      placeholder: 'Zone name',
      name: name + '-zone-name',
      value: value && value.zoneID && value.zoneID.zoneName
    }).addMultipleFields({
      number: 2,
      classNames: classNames
    }).addEmptyField().addInputField({
      placeholder: 'Owner record name',
      name: name + '-owner-record-name',
      value: value && value.zoneID && value.zoneID.ownerRecordName
    }).addMultipleFields({
      number: 2,
      classNames: classNames
    }).addEmptyField().addSelectField({
      name: name + '-action',
      value: value && value.action,
      options: [{
        value: 'NONE',
        title: 'No delete action'
      }, {
        value: 'DELETE_SELF'
      }, {
        value: 'VALIDATE'
      }]
    });
  },
  remove: function(opts) {
    var name = opts.name;
    this.removeRowByFieldName(name + '-record-name').removeRowByFieldName(name + '-owner-record-name').removeRowByFieldName(name + '-action').removeRowByFieldName(name + '-zone-name');
    delete this.fields[name + '-record-name'];
    delete this.fields[name + '-owner-record-name'];
    delete this.fields[name + '-action'];
    delete this.fields[name + '-zone-name'];
    return this;
  },
  toggle: function(opts, bool) {
    this.toggleRow(opts.name + '-record-name', bool);
    this.toggleRow(opts.name + '-zone-name', bool);
    this.toggleRow(opts.name + '-owner-record-name', bool);
    this.toggleRow(opts.name + '-action', bool);
    return this;
  },
  serialize: function(opts) {
    var fields = this.fields;
    var recordName = fields[opts.name + '-record-name'].value;
    if (!recordName) return null;
    var reference = {
      recordName: recordName,
      action: fields[opts.name + '-action'].value
    };
    var zoneName = fields[opts.name + '-zone-name'].value;
    if (zoneName) {
      var zoneID = {
        zoneName: fields[opts.name + '-zone-name'].value
      };
      var ownerRecordName = fields[opts.name + '-owner-record-name'].value;
      if (ownerRecordName) {
        zoneID.ownerRecordName = ownerRecordName;
      }
      reference.zoneID = zoneID;
    }
    return reference;
  }
};
CKCatalog.FormInputHelpers[CKCatalog.FIELD_TYPE_SHARE_PARTICIPANT] = {
  valueKeys: {
    first: 'email',
    last: 'permission'
  },
  add: function(opts) {
    var name = opts.name;
    var value = opts.value;
    var classNames = opts.arrayItem ? ['array-item'] : [];
    return this.addInputField({
      placeholder: 'Email',
      type: 'email',
      name: name + '-email',
      value: value && value.userIdentity && value.userIdentity.lookupInfo && value.userIdentity.lookupInfo.emailAddress
    }).addMultipleFields({
      number: 3,
      classNames: classNames
    }).addEmptyField().addLabel({
      label: 'permission:',
      name: name + '-permission'
    }).addSelectField({
      name: name + '-permission',
      value: value && value.permission,
      options: [{
        value: 'NONE'
      }, {
        value: 'READ_ONLY'
      }, {
        value: 'READ_WRITE'
      }]
    }).addHiddenField({
      name: name + '-type',
      value: value && value.type || CloudKit.ShareParticipantType.UNKNOWN
    }).addHiddenField({
      name: name + '-acceptance-status',
      value: value && value.acceptanceStatus || CloudKit.ShareParticipantAcceptanceStatus.UNKNOWN
    });
  },
  remove: function(opts) {
    var name = opts.name;
    this.removeRowByFieldName(name + '-email').removeRowByFieldName(name + '-permission').removeHiddenInputByFieldName(name + '-type').removeHiddenInputByFieldName(name + '-acceptance-status');
    delete this.fields[name + '-email'];
    delete this.fields[name + '-permission-label'];
    delete this.fields[name + '-permission'];
    delete this.fields[name + '-type'];
    delete this.fields[name + '-acceptance-status'];
    return this;
  },
  toggle: function(opts, bool) {
    this.toggleRow(opts.name + '-email', bool);
    this.toggleRow(opts.name + '-permission', bool);
    return this;
  },
  serialize: function(opts) {
    var fields = this.fields;
    var emailAddress = fields[opts.name + '-email'].value;
    if (!emailAddress) return null;
    return {
      emailAddress: emailAddress,
      permission: fields[opts.name + '-permission'].value,
      type: fields[opts.name + '-type'].value,
      acceptanceStatus: fields[opts.name + '-acceptance-status'].value
    };
  }
};
CKCatalog.FormInputHelpers[CKCatalog.FIELD_TYPE_TIMESTAMP] = {
  add: function(opts) {
    return this.addInputField({
      placeholder: 'YYYY-MM-DDTHH:mm',
      name: opts.name + '-value',
      value: opts.value
    });
  },
  serialize: function(opts) {
    var value = this.fields[opts.name + '-value'].value;
    if (!value) return value;
    if (isNaN(value)) {
      var date = new Date(value);
      var time = date.getTime();
      if (isNaN(time)) {
        return value;
      }
      return time + date.getTimezoneOffset() * 60000;
    } else {
      return parseInt(value);
    }
  }
};
CKCatalog.FormInputHelpers.Filters.DEFAULT = {
  comparators: [CKCatalog.COMPARATOR_EQUALS, CKCatalog.COMPARATOR_NOT_EQUALS, CKCatalog.COMPARATOR_IN, CKCatalog.COMPARATOR_NOT_IN]
};
CKCatalog.FormInputHelpers.Filters[CKCatalog.FIELD_TYPE_LOCATION] = {
  valueKeys: {
    last: 'distance'
  },
  comparators: [CKCatalog.COMPARATOR_NEAR, CKCatalog.COMPARATOR_IN, CKCatalog.COMPARATOR_NOT_IN],
  add: function(opts) {
    var name = opts.name;
    var that = this;
    var whenNearFilterSelected = function(bool) {
      return function() {
        return (that.getFieldValue(name + '-comparator') === CKCatalog.COMPARATOR_NEAR) === bool;
      };
    };
    return this.addMultipleFields({
      number: 2
    }).formHelperForType(CKCatalog.FIELD_TYPE_LOCATION).add(opts).addMultipleFields({
      number: 2,
      hidden: whenNearFilterSelected(false),
      classNames: ['filter', 'distance']
    }).addLabel({
      label: 'Within',
      name: name + '-distance'
    }).addInputField({
      name: name + '-distance',
      placeholder: 'Distance (m)'
    })
  },
  toggle: function(opts, bool) {
    this.formHelperForType(CKCatalog.FIELD_TYPE_LOCATION).toggle(opts, bool);
    var showDistanceRow = false;
    var name = opts.name;
    if (bool === true) {
      showDistanceRow = this.getFieldValue(name + '-comparator') === CKCatalog.COMPARATOR_NEAR;
    }
    this.toggleRow(name + '-distance', showDistanceRow);
    return this;
  },
  remove: function(opts) {
    this.formHelperForType(CKCatalog.FIELD_TYPE_LOCATION).remove(opts);
    var name = opts.name;
    this.removeRowByFieldName(name + '-distance');
    delete this.fields[name + '-distance-label'];
    delete this.fields[name + '-distance'];
  },
  serialize: function(opts) {
    var name = opts.name;
    var distance = this.getFieldValue(name + '-distance');
    var comparator = this.getFieldValue(name + '-comparator');
    if (comparator === CKCatalog.COMPARATOR_NEAR) {
      return {
        fieldValue: this.formHelperForType(CKCatalog.FIELD_TYPE_LOCATION).serialize(opts),
        distance: isNaN(distance) ? 0 : parseFloat(distance)
      };
    } else {
      return this.formHelperForType(CKCatalog.FIELD_TYPE_LOCATION).serialize(opts);
    }
  }
};
CKCatalog.FormInputHelpers.Filters[CKCatalog.FIELD_TYPE_STRING] = {
  comparators: [CKCatalog.COMPARATOR_EQUALS, CKCatalog.COMPARATOR_NOT_EQUALS, CKCatalog.COMPARATOR_CONTAINS_ALL_TOKENS, CKCatalog.COMPARATOR_CONTAINS_ANY_TOKENS, CKCatalog.COMPARATOR_BEGINS_WITH, CKCatalog.COMPARATOR_NOT_BEGINS_WITH, CKCatalog.COMPARATOR_IN, CKCatalog.COMPARATOR_NOT_IN]
};
CKCatalog.FormInputHelpers.Filters[CKCatalog.FIELD_TYPE_INT64] = CKCatalog.FormInputHelpers.Filters[CKCatalog.FIELD_TYPE_DOUBLE] = CKCatalog.FormInputHelpers.Filters[CKCatalog.FIELD_TYPE_TIMESTAMP] = {
  comparators: [CKCatalog.COMPARATOR_EQUALS, CKCatalog.COMPARATOR_NOT_EQUALS, CKCatalog.COMPARATOR_LESS_THAN, CKCatalog.COMPARATOR_LESS_THAN_OR_EQUALS, CKCatalog.COMPARATOR_GREATER_THAN, CKCatalog.COMPARATOR_GREATER_THAN_OR_EQUALS, CKCatalog.COMPARATOR_IN, CKCatalog.COMPARATOR_NOT_IN],
  serialize: function(opts) {
    return CKCatalog.FormInputHelpers[CKCatalog.FIELD_TYPE_TIMESTAMP].serialize.call(this, opts);
  }
};
CKCatalog.FormInputHelpers.Filters[CKCatalog.FIELD_TYPE_REFERENCE] = {
  add: function(opts) {
    var name = opts.name;
    return this.addInputField({
      placeholder: 'Record name',
      name: name + '-record-name'
    }).addInputField({
      placeholder: 'Zone name',
      name: name + '-zone-name'
    }).addInputField({
      placeholder: 'Owner record name',
      name: name + '-owner-record-name'
    }).addSelectField({
      name: name + '-action',
      options: [{
        value: 'NONE',
        title: 'No delete action'
      }, {
        value: 'DELETE_SELF'
      }, {
        value: 'VALIDATE'
      }]
    });
  }
};
CKCatalog.Form = function Form() {
  this.el = document.createElement('form');
  this.el.setAttribute('action', '#');
  this.el.setAttribute('method', 'post');
  this.el.id = 'f' + this.constructor.prototype._id++;
  this.el.className = 'form';
  this.table = this.el.appendChild(document.createElement('table'));
  var submitButton = document.createElement('input');
  submitButton.setAttribute('type', 'submit');
  submitButton.setAttribute('name', 'submit');
  submitButton.style.display = 'none';
  this.el.appendChild(submitButton);
  this.fields = {};
  this.dynamicFieldNames = {};
  this._multipleFields = 0;
  this._multipleFieldsContainer = null;
  this._pointer = null;
};
CKCatalog.Form.prototype.formHelperForType = function(type) {
  var helper = CKCatalog.FormInputHelpers[type] || {};
  var defaultHelper = CKCatalog.FormInputHelpers.DEFAULT;
  var that = this;
  return {
    valueKeys: {
      first: helper.valueKeys && helper.valueKeys.first || defaultHelper.valueKeys.first,
      last: helper.valueKeys && helper.valueKeys.last || defaultHelper.valueKeys.last
    },
    add: function(opts) {
      var f = helper.add || defaultHelper.add;
      return f.call(that, opts);
    },
    remove: function(opts) {
      var f = helper.remove || defaultHelper.remove;
      return f.call(that, opts);
    },
    toggle: function(opts, bool) {
      var f = helper.toggle || defaultHelper.toggle;
      return f.call(that, opts, bool);
    },
    serialize: function(opts) {
      var f = helper.serialize || defaultHelper.serialize;
      return f.call(that, opts);
    }
  };
};
CKCatalog.Form.prototype._id = 0;
CKCatalog.Form.prototype.addMultipleFields = function(opts) {
  this._multipleFieldsContainer = this._createFieldContainer(opts);
  this._multipleFields = opts.number;
  return this;
};
CKCatalog.Form.prototype._insertRow = function(row) {
  if (!this._pointer) {
    this._pointer = this.table.appendChild(row);
  } else {
    this._pointer = this.table.insertBefore(row, this._pointer.nextSibling);
  }
};
CKCatalog.Form.prototype.focusField = function(name) {
  var field = this.fields[name];
  if (field) {
    field.focus();
  }
  return this;
};
CKCatalog.Form.prototype._createRelativeId = function(name) {
  return this.el.id + '-' + name;
};
CKCatalog.Form.prototype._createFieldContainer = function(opts) {
  opts = opts || {};
  if (this._multipleFields) {
    this._multipleFields--;
    return this._multipleFieldsContainer;
  }
  var tr = document.createElement('tr');
  tr.className = 'field';
  if (opts.hidden) {
    if (typeof opts.hidden === 'function') {
      if (opts.hidden.call(this)) {
        tr.classList.add('hide');
      }
    } else {
      tr.classList.add('hide');
    }
  }
  if (opts.number) {
    tr.classList.add('multiple');
    tr.classList.add('has-' + opts.number + '-fields');
  }
  if (Array.isArray(opts.classNames)) {
    opts.classNames.forEach(function(className) {
      tr.classList.add(className);
    });
  }
  var labelContainer = document.createElement('th');
  if (opts.label) {
    var label = document.createElement('label');
    label.textContent = opts.label;
    if (opts.name) {
      label.setAttribute('for', this._createRelativeId(opts.name));
    }
    labelContainer.appendChild(label);
  }
  tr.appendChild(labelContainer);
  var td = document.createElement('td');
  tr.appendChild(td);
  var removeButtonContainer = document.createElement('td');
  removeButtonContainer.className = 'remove-button-cell';
  if (opts.removeButtonAction) {
    var button = document.createElement('button');
    button.className = 'link small';
    button.innerHTML = '&#10005;';
    button.setAttribute('tabindex', '-1');
    button.setAttribute('type', 'button');
    var that = this;
    button.onclick = function() {
      opts.removeButtonAction.call(that, opts);
    };
    removeButtonContainer.appendChild(button);
  }
  tr.appendChild(removeButtonContainer);
  return td;
};
CKCatalog.Form.prototype.addInputField = function(opts) {
  var fieldContainer = this._createFieldContainer(opts);
  var borderContainer = document.createElement('div');
  if (Array.isArray(opts.classNames)) {
    opts.classNames.forEach(function(className) {
      borderContainer.classList.add(className);
    });
  }
  var inputContainer = document.createElement('div');
  inputContainer.className = 'border';
  var input = document.createElement('input');
  input.setAttribute('type', opts.type || 'text');
  input.setAttribute('name', opts.name);
  if (opts.placeholder) {
    input.setAttribute('placeholder', opts.placeholder);
  }
  input.id = this._createRelativeId(opts.name);
  if (opts.value !== undefined) {
    input.value = opts.value;
  }
  if (opts.onChange) {
    input.onValueChange = opts.onChange;
    input.addEventListener('input', opts.onChange.bind(this));
  }
  this.fields[opts.name] = input;
  inputContainer.appendChild(input);
  borderContainer.appendChild(inputContainer);
  fieldContainer.appendChild(borderContainer);
  this._insertRow(fieldContainer.parentNode);
  return this;
};
CKCatalog.Form.prototype.setFieldValue = function(key, value) {
  var field = this.fields[key];
  var oldValue;
  if (field) {
    if (typeof value == 'boolean') {
      oldValue = field.checked;
      field.checked = value;
      if (oldValue !== value && field.onValueChange) {
        field.onValueChange.call(this);
      }
    } else {
      oldValue = field.value;
      field.value = value;
      if (oldValue !== value && field.onValueChange) {
        field.onValueChange.call(this);
      }
    }
  } else if (Array.isArray(value)) {
    var dynamicFieldName = this.dynamicFieldNames[key];
    if (dynamicFieldName && dynamicFieldName.arrayField) {
      this._addArrayItems(value, {
        name: key,
        type: dynamicFieldName.arrayField
      });
    }
  } else if (typeof value == 'object') {
    this._addDynamicFieldsFromFieldsMap(key, value);
  }
};
CKCatalog.Form.prototype.getFieldValue = function(key) {
  var field = this.fields[key];
  if (field) {
    if (field.type == 'checkbox') {
      return field.checked;
    } else {
      return field.value;
    }
  } else {
    return this._serializeDynamicFields(key);
  }
};
CKCatalog.Form.prototype.addTextareaField = function(opts) {
  opts.classNames = opts.classNames || [];
  var borderContainer = document.createElement('div');
  opts.classNames.forEach(function(className) {
    borderContainer.classList.add(className);
  });
  borderContainer.classList.add('textarea-border-container');
  var fieldContainer = this._createFieldContainer(opts);
  var inputContainer = document.createElement('div');
  inputContainer.className = 'border textarea-container';
  var input = document.createElement('textarea');
  input.setAttribute('spellcheck', 'false');
  input.setAttribute('name', opts.name);
  if (opts.placeholder) {
    input.setAttribute('placeholder', opts.placeholder);
  }
  if (opts.value) {
    input.value = opts.value;
  }
  input.id = this._createRelativeId(opts.name);
  this.fields[opts.name] = input;
  inputContainer.appendChild(input);
  borderContainer.appendChild(inputContainer);
  fieldContainer.appendChild(borderContainer);
  this._insertRow(fieldContainer.parentNode);
  return this;
};
CKCatalog.Form.prototype.addFileInputField = function(opts) {
  var fieldContainer = this._createFieldContainer(opts);
  var borderContainer = document.createElement('div');
  var inputContainer = document.createElement('div');
  inputContainer.className = 'border';
  var input = document.createElement('input');
  input.setAttribute('type', 'file');
  input.setAttribute('name', opts.name);
  input.id = this._createRelativeId(opts.name);
  var fakeInput = document.createElement('div');
  fakeInput.className = 'fake-file-input';
  var selectFileButton = document.createElement('button');
  selectFileButton.className = 'link';
  var setFileButtonText = function(hasFile) {
    hasFile ? selectFileButton.textContent = 'Replace…' : selectFileButton.textContent = 'Choose file…';
  };
  var span = document.createElement('span');
  span.className = 'file-name';
  input.addEventListener('change', function() {
    var file = input.files[0];
    if (file) {
      span.textContent = CKCatalog.renderUtils.abbreviateSIUnits(file.size, 2, 'B');
      if (opts.base64) {
        var fileReader = new FileReader();
        CKCatalog.dialog.show('Converting to base64…');
        fileReader.onload = function(evt) {
          var base64 = evt.target.result;
          base64 = base64.substr(base64.indexOf(';base64,') + 8);
          input.assetValue = base64;
          CKCatalog.dialog.hide();
        };
        fileReader.onerror = function(error) {
          CKCatalog.dialog.showError(error);
        };
        fileReader.readAsDataURL(file);
      } else {
        input.assetValue = null;
      }
    } else {
      span.textContent = '';
    }
    setFileButtonText(file);
  });
  if (opts.value) {
    input.assetValue = opts.value;
    var size = opts.value.size || atob(opts.value).length;
    span.textContent = CKCatalog.renderUtils.abbreviateSIUnits(size, 2, 'B');
  }
  setFileButtonText(opts.value);
  fakeInput.appendChild(selectFileButton);
  fakeInput.appendChild(span);
  inputContainer.appendChild(fakeInput);
  inputContainer.appendChild(input);
  borderContainer.appendChild(inputContainer);
  fieldContainer.appendChild(borderContainer);
  this.fields[opts.name] = input;
  this._insertRow(fieldContainer.parentNode);
  return this;
};
CKCatalog.Form.prototype.addSelectField = function(opts) {
  var fieldContainer = this._createFieldContainer(opts);
  var borderContainer = document.createElement('div');
  var selectContainer = document.createElement('div');
  selectContainer.className = 'border select';
  var select = document.createElement('select');
  select.setAttribute('name', opts.name);
  select.id = this._createRelativeId(opts.name);
  opts.options.forEach(function(opt) {
    var option = document.createElement('option');
    option.textContent = opt.title || opt.value;
    if (opt.value) {
      option.setAttribute('value', opt.value);
    }
    if (opt.selected) {
      option.setAttribute('selected', '');
    }
    select.appendChild(option);
  });
  this.fields[opts.name] = select;
  if (opts.value) {
    select.value = opts.value;
  }
  if (opts.onChange) {
    select.onValueChange = opts.onChange;
    select.addEventListener('change', opts.onChange.bind(this));
  }
  selectContainer.appendChild(select);
  borderContainer.appendChild(selectContainer);
  fieldContainer.appendChild(borderContainer);
  this._insertRow(fieldContainer.parentNode);
  return this;
};
CKCatalog.Form.prototype.addEmptyField = function() {
  var fieldContainer = this._createFieldContainer();
  var emptyField = document.createElement('div');
  emptyField.className = 'empty';
  fieldContainer.appendChild(emptyField);
  this._insertRow(fieldContainer.parentNode);
  return this;
};
CKCatalog.Form.prototype.addHiddenField = function(opts) {
  var input = document.createElement('input');
  input.style.display = 'none';
  input.setAttribute('name', opts.name);
  input.value = opts.value;
  if (opts.onChange) {
    input.onValueChange = opts.onChange;
  }
  this.fields[opts.name] = input;
  this.el.appendChild(input);
  return this;
};
CKCatalog.Form.prototype.addLabel = function(opts) {
  var fieldContainer = this._createFieldContainer();
  var container = document.createElement('div');
  var labelContainer = document.createElement('div');
  labelContainer.className = 'label';
  var label = document.createElement('label');
  label.setAttribute('for', this._createRelativeId(opts.name));
  label.textContent = opts.label;
  labelContainer.appendChild(label);
  container.appendChild(labelContainer);
  fieldContainer.appendChild(container);
  this._insertRow(fieldContainer.parentNode);
  this.fields[opts.name + '-label'] = label;
  return this;
};
CKCatalog.Form.prototype.addCheckboxes = function(opts) {
  var fieldContainer = this._createFieldContainer(opts);
  var checkboxesContainer = document.createElement('div');
  checkboxesContainer.className = 'checkboxes';
  var fields = this.fields;
  var that = this;
  opts.checkboxes.forEach(function(checkbox) {
    var checkboxContainer = document.createElement('div');
    checkboxContainer.className = 'checkbox';
    if (checkbox.label) {
      var label = document.createElement('label');
      label.setAttribute('for', that._createRelativeId(checkbox.name));
      label.textContent = checkbox.label;
      checkboxContainer.appendChild(label);
    }
    var input = document.createElement('input');
    input.setAttribute('type', 'checkbox');
    input.setAttribute('name', checkbox.name);
    if (checkbox.value) {
      input.setAttribute('value', checkbox.value);
    }
    input.id = that._createRelativeId(checkbox.name);
    if (checkbox.checked) {
      input.setAttribute('checked', '');
    }
    fields[checkbox.name] = input;
    checkboxContainer.appendChild(input);
    checkboxesContainer.appendChild(checkboxContainer);
  });
  fieldContainer.appendChild(checkboxesContainer);
  this._insertRow(fieldContainer.parentNode);
  return this;
};
CKCatalog.Form.prototype.onSubmit = function(handler) {
  this.el.onsubmit = function(e) {
    e.preventDefault();
    handler();
  };
};
CKCatalog.Form.prototype.getFieldRowForFieldName = function(fieldName) {
  var field = this.fields[fieldName];
  if (field) {
    var el = field;
    while (el.parentNode) {
      el = el.parentNode;
      if (el.classList.contains('field')) {
        return el;
      }
    }
  }
  return null;
};
CKCatalog.Form.prototype.addButton = function(opts) {
  var container = this._createFieldContainer(opts);
  var borderContainer = document.createElement('div');
  if (Array.isArray(opts.classNames)) {
    opts.classNames.forEach(function(className) {
      borderContainer.classList.add(className);
    });
  }
  var buttonContainer = document.createElement('div');
  buttonContainer.className = 'form-button' +
    (opts.border ? ' border' : '');
  var button = document.createElement('button');
  button.setAttribute('type', 'button');
  button.className = 'link';
  button.textContent = opts.title;
  button.id = this._createRelativeId(opts.name);
  button.addEventListener('click', opts.action);
  this.fields[opts.name] = button;
  buttonContainer.appendChild(button);
  borderContainer.appendChild(buttonContainer);
  container.appendChild(borderContainer);
  this._insertRow(container.parentNode);
  return this;
};
CKCatalog.Form.prototype.movePointerTo = function(name) {
  this._pointer = this.getFieldRowForFieldName(name);
  return this;
};
CKCatalog.Form.prototype.resetPointer = function() {
  this._pointer = null;
  return this;
};
CKCatalog.Form.prototype.createDynamicFieldName = function(name, index) {
  return name + '-' + index;
};
CKCatalog.Form.prototype.addDynamicFields = function(opts) {
  var dynamicFieldsIndex = 0;
  var that = this;
  var addField = function() {
    dynamicFieldsIndex++;
    that.movePointerTo(opts.name + '-field-type-selector')._addDynamicField({
      name: that.createDynamicFieldName(opts.name, dynamicFieldsIndex),
      type: that.fields[opts.name + '-field-type-selector'].value,
      list: that.fields[opts.name + '-list-checkbox'].checked
    });
  };
  return this.addMultipleFields({
    number: 3,
    label: opts.label
  }).addSelectField({
    name: opts.name + '-field-type-selector',
    label: 'Field type:',
    options: [{
      value: CKCatalog.FIELD_TYPE_STRING,
      title: 'String'
    }, {
      value: CKCatalog.FIELD_TYPE_INT64,
      title: 'Number'
    }, {
      value: CKCatalog.FIELD_TYPE_TIMESTAMP,
      title: 'Timestamp'
    }, {
      value: CKCatalog.FIELD_TYPE_LOCATION,
      title: 'Location'
    }, {
      value: CKCatalog.FIELD_TYPE_ASSET,
      title: 'Asset'
    }, {
      value: CKCatalog.FIELD_TYPE_BYTES,
      title: 'Bytes'
    }, {
      value: CKCatalog.FIELD_TYPE_REFERENCE,
      title: 'Reference'
    }]
  }).addCheckboxes({
    checkboxes: [{
      label: 'list',
      name: opts.name + '-list-checkbox'
    }]
  }).addButton({
    name: opts.name + '-add-field-button',
    title: 'Add field…',
    action: addField
  });
};
CKCatalog.Form.prototype._getValueKey = function(opts) {
  var position = opts.position || 'first';
  return opts.name + '-' + this.formHelperForType(opts.type).valueKeys[position];
};
CKCatalog.Form.prototype._addFieldValueForType = function(opts) {
  return this.formHelperForType(opts.type).add(opts);
};
CKCatalog.Form.prototype.isNumberType = function(type) {
  return /NUMBER/.test(type) || type === CKCatalog.FIELD_TYPE_TIMESTAMP;
};
CKCatalog.Form.prototype.addArrayField = function(opts) {
  return this._addDynamicField({
    name: opts.name,
    list: true,
    arrayField: opts.type,
    label: opts.label,
    hidden: opts.hidden,
    type: opts.type,
    placeholder: opts.placeholder,
    buttonTitle: opts.buttonTitle
  });
};
CKCatalog.Form.prototype.toggleRow = function(fieldName, bool) {
  var row = this.getFieldRowForFieldName(fieldName);
  if (row) {
    if (bool) {
      row.classList.remove('hide');
    } else {
      row.classList.add('hide');
    }
  }
};
CKCatalog.Form.prototype.toggleArrayField = function(name, bool) {
  this.toggleRow(name + '-add-item', bool);
  this.toggleArrayItems(name, bool);
};
CKCatalog.Form.prototype.toggleArrayItems = function(name, bool) {
  var arrayFieldName = this.dynamicFieldNames[name];
  if (arrayFieldName && Array.isArray(arrayFieldName.value)) {
    var that = this;
    arrayFieldName.value.forEach(function(arrayValue) {
      that._toggleDynamicField(arrayValue, bool);
    });
  }
};
CKCatalog.Form.prototype._toggleDynamicField = function(opts, bool) {
  this.formHelperForType(opts.type).toggle(opts, bool);
};
CKCatalog.Form.prototype.removeRowByFieldName = function(name) {
  try {
    this.table.removeChild(this.getFieldRowForFieldName(name));
  } catch (e) {}
  return this;
};
CKCatalog.Form.prototype.removeHiddenInputByFieldName = function(name) {
  try {
    this.el.removeChild(this.fields[name]);
  } catch (e) {}
  return this;
};
CKCatalog.Form.prototype._removeFieldValue = function(value) {
  if (Array.isArray(value)) {
    var that = this;
    value.forEach(function(item) {
      that.removeArrayItem(item);
    });
  } else {
    this.formHelperForType(value.type).remove(value);
  }
  return this;
};
CKCatalog.Form.prototype._removeFieldKey = function(opts) {
  var name = opts.key;
  this.removeRowByFieldName(name + '-key');
  delete this.fields[name + '-key'];
  delete this.dynamicFieldNames[name];
  if (!opts.arrayField) {
    delete this.fields[name + '-add-item'];
  } else {
    this.dynamicFieldNames[name] = {
      key: opts.key,
      value: [],
      arrayField: opts.arrayField
    };
  }
  return this;
};
CKCatalog.Form.prototype._removeLabel = function(opts) {
  delete this.fields[this._getValueKey({
    type: opts.type,
    name: opts.name,
    position: 'first'
  }) + '-label'];
  return this;
};
CKCatalog.Form.prototype.removeArrayItem = function(opts) {
  return this._removeFieldValue(opts)._removeLabel(opts);
};
CKCatalog.Form.prototype._removeDynamicField = function(opts) {
  return this._removeFieldValue(opts.value)._removeFieldKey(opts);
};
CKCatalog.Form.prototype.addArrayItem = function(opts) {
  var number = opts.type === CKCatalog.FIELD_TYPE_LOCATION ? 3 : 2;
  if (!this.dynamicFieldNames[opts.name]) {
    this.dynamicFieldNames[opts.name] = {
      key: opts.name,
      value: [],
      arrayField: opts.arrayField
    };
  }
  var types = this.dynamicFieldNames[opts.name].value;
  var buttonRelativeName = '-' + (opts.buttonRelativeName || 'add-item');
  var button = this.fields[opts.name + buttonRelativeName];
  var index = button.arrayItemIndex || 0;
  var indexedName = this.createDynamicFieldName(opts.name, index);
  button.arrayItemIndex = index + 1;
  var that = this;
  var value = {
    type: opts.type,
    name: indexedName
  };
  types.push(value);
  return this.movePointerTo(types.length > 1 ? this._getValueKey({
    name: types[types.length - 2].name,
    position: 'last',
    type: opts.type
  }) : opts.name + buttonRelativeName).addMultipleFields({
    number: number,
    classNames: ['array-item'],
    removeButtonAction: function() {
      var typeIndex = types.reduce(function(n, t, i) {
        if (t.name === indexedName) {
          return i;
        } else {
          return n;
        }
      }, -1);
      if (typeIndex > -1) {
        types.splice(typeIndex, 1);
      }
      that.removeArrayItem(value);
      types.forEach(function(t, i) {
        var label = that.fields[that._getValueKey({
          type: t.type,
          name: t.name,
          position: 'first'
        }) + '-label'];
        label.textContent = i;
      });
    }
  }).addLabel({
    label: (types.length - 1).toString(),
    name: that._getValueKey({
      type: opts.type,
      name: indexedName,
      position: 'first'
    })
  })._addFieldValueForType({
    name: indexedName,
    type: opts.type,
    arrayItem: true,
    value: opts.value,
    placeholder: opts.placeholder
  }).focusField(that._getValueKey({
    type: opts.type,
    name: indexedName,
    position: 'first'
  }));
};
CKCatalog.Form.prototype._addDynamicField = function(opts) {
  var that = this;
  var number = opts.type === CKCatalog.FIELD_TYPE_LOCATION ? 3 : 2;
  var dynamicFieldDatum;
  if (opts.list) {
    var types = [];
    dynamicFieldDatum = {
      key: opts.name,
      value: types
    };
    this.dynamicFieldNames[opts.name] = dynamicFieldDatum;
    if (!opts.arrayField) {
      this.addMultipleFields({
        number: 2,
        removeButtonAction: function() {
          that._removeDynamicField(dynamicFieldDatum);
        }
      }).addInputField({
        placeholder: 'Field name',
        name: opts.name + '-key',
        value: opts.key
      }).focusField(opts.name + '-key');
    } else {
      dynamicFieldDatum.arrayField = opts.type;
    }
    return this.addButton({
      title: opts.buttonTitle || 'Add item…',
      name: opts.name + '-add-item',
      border: true,
      hidden: opts.hidden,
      label: opts.label,
      action: function() {
        that.addArrayItem(opts);
      }
    })
  } else {
    dynamicFieldDatum = {
      value: {
        type: opts.type,
        name: opts.name
      },
      key: opts.name
    };
    this.dynamicFieldNames[opts.name] = dynamicFieldDatum;
    return this.addMultipleFields({
      number: number,
      removeButtonAction: function() {
        that._removeDynamicField(dynamicFieldDatum);
      }
    }).addInputField({
      placeholder: 'Field name',
      name: opts.name + '-key',
      value: opts.key
    })._addFieldValueForType(opts).focusField(opts.name + '-key');
  }
};
CKCatalog.Form.prototype._removeDynamicFields = function() {
  for (var key in this.dynamicFieldNames) {
    this._removeDynamicField(this.dynamicFieldNames[key]);
  }
};
CKCatalog.Form.prototype.reset = function() {
  this.el.reset();
  this._removeDynamicFields();
  return this;
};
CKCatalog.Form.prototype._addDynamicFieldsFromFieldsMap = function(name, fieldsMap) {
  var dynamicFieldsIndex = 0;
  this.movePointerTo(name + '-add-field-button');
  for (var key in fieldsMap) {
    if (fieldsMap.hasOwnProperty(key)) {
      var field = fieldsMap[key];
      var value = field.value;
      var type = field.type;
      var arrayName = this.createDynamicFieldName(name, dynamicFieldsIndex++);
      type = type.replace('INT64_LIST', 'NUMBER_INT64');
      type = type.replace('DOUBLE_LIST', 'NUMBER_DOUBLE');
      type = type.replace('_LIST', '');
      var that = this;
      if (Array.isArray(value)) {
        this._addDynamicField({
          name: arrayName,
          list: true,
          key: key,
          type: type
        });
        value.forEach(function(v) {
          that.addArrayItem({
            name: arrayName,
            type: type,
            value: v
          })
        });
      } else {
        this._addDynamicField({
          name: arrayName,
          type: type,
          value: value,
          key: key
        });
      }
    }
  }
  return this;
};
CKCatalog.Form.prototype._addArrayItems = function(array, opts) {
  if (Array.isArray(array)) {
    var that = this;
    array.forEach(function(value) {
      that.addArrayItem({
        value: value,
        name: opts.name,
        type: opts.type,
        arrayField: opts.type
      });
    });
  }
};
CKCatalog.Form.prototype._getValueFromTypedField = function(opts) {
  return this.formHelperForType(opts.type).serialize(opts);
};
CKCatalog.Form.prototype._serializeDynamicFields = function(prefix) {
  var object = {};
  if (!prefix) return object;
  var dict = this.dynamicFieldNames[prefix];
  if (dict && Array.isArray(dict.value)) {
    if (dict.arrayField) {
      return dict.value.map(this._getValueFromTypedField.bind(this)).filter(function(v) {
        return v !== null;
      });
    }
    if (dict.queryBuilder) {
      return this._serializeFilters(dict);
    }
  }
  var fields = this.fields;
  for (var key in this.dynamicFieldNames) {
    if (key.substr(0, prefix.length) === prefix && (key[prefix.length] === undefined || key[prefix.length] === '-')) {
      var datum = this.dynamicFieldNames[key];
      var keyField = fields[datum.key + '-key'];
      var fieldName = keyField && keyField.value || !keyField && key;
      if (fieldName) {
        if (Array.isArray(datum.value)) {
          object[fieldName] = datum.value.map(this._getValueFromTypedField.bind(this)).filter(function(v) {
            return v !== null;
          });
        } else {
          object[fieldName] = this._getValueFromTypedField(datum.value);
        }
      }
    }
  }
  return object;
};
CKCatalog.renderUtils = (function() {
  var renderRecords = function(table, title, records, displayFields) {
    var content = document.createElement('div');
    if (title) {
      var heading = document.createElement('h2');
      heading.textContent = title;
      content.appendChild(heading);
    }
    if (records.length === 0) {
      table.appendRow([]);
    } else {
      records.forEach(function(record) {
        table.appendRow(displayFields.map(function(fieldName) {
          var fields = fieldName.match(/^fields\.(.*)/);
          if (fields && record.hasOwnProperty('fields') && typeof record.fields == 'object') {
            var field = record.fields[fields[1]];
            if (field) {
              return field.value;
            }
          } else if (fieldName === 'created' || fieldName === 'modified') {
            var value = record[fieldName];
            if (value) {
              return {
                userRecordName: value && value.userRecordName,
                timestamp: value && new Date(value.timestamp),
                deviceID: value && value.deviceID
              };
            }
          } else {
            return record[fieldName];
          }
        }));
      });
    }
    content.appendChild(table.el);
    return content;
  };
  var renderRecord = function(title, record) {
    var content = document.createElement('div');
    if (title) {
      var heading = document.createElement('h2');
      heading.textContent = title;
      content.appendChild(heading);
    }
    var table = (new CKCatalog.Table).setTextForUndefinedValue('None');
    var specialFields = ['created', 'modified', 'fields', 'share', 'rootRecord'];
    ['created', 'modified'].forEach(function(key) {
      var value = record[key];
      if (value) {
        table.appendRow(key, {
          userRecordName: value && value.userRecordName,
          timestamp: value && new Date(value.timestamp),
          deviceID: value && value.deviceID
        });
      }
    });
    Object.keys(record).forEach(function(key) {
      if (specialFields.indexOf(key) < 0 || key === 'share' && !record.share.participants) {
        table.appendRow(key, record[key]);
      }
    });
    if (record.hasOwnProperty('fields') && typeof record.fields == 'object') {
      Object.keys(record.fields).forEach(function(fieldName) {
        var field = record.fields[fieldName];
        if (field) {
          table.appendRow(fieldName, field.value, {
            type: field.type.replace('_LIST', '')
          });
        }
      });
    }
    content.appendChild(table.el);
    return content;
  };
  var abbreviateSIUnits = function(number, precision, unit) {
    var kilo = 1e3;
    var mega = 1e6;
    var giga = 1e9;
    var tera = 1e12;
    var peta = 1e15;
    var multiplier = Math.pow(10, precision);
    var round = function(x) {
      return Math.round(x * multiplier) / multiplier;
    };
    if (number >= peta) {
      return round(number / peta) + ' P' + unit;
    } else if (number >= tera) {
      return round(number / tera) + ' T' + unit;
    } else if (number >= giga) {
      return round(number / giga) + ' G' + unit;
    } else if (number >= mega) {
      return round(number / mega) + ' M' + unit;
    } else if (number >= kilo) {
      return round(number / kilo) + ' K' + unit;
    } else {
      return round(number) + unit;
    }
  };
  return {
    renderRecord: renderRecord,
    renderRecords: renderRecords,
    abbreviateSIUnits: abbreviateSIUnits
  };
})();
CKCatalog.QueryString = (function() {
  var qs = window.location.search.substr(1).split('&').reduce(function(previousValue, currentValue) {
    var kv = currentValue.split('=');
    previousValue[kv[0]] = kv[1] ? decodeURIComponent(kv[1]) : true;
    return previousValue;
  }, {});
  var getParameterByName = function(name) {
    return qs[name];
  };
  return {
    getParameterByName: getParameterByName
  };
})();
CKCatalog.Form.prototype._getFilterHelperForType = function(name, type, isList) {
  var helper = CKCatalog.FormInputHelpers.Filters[type] || {};
  var defaultHelper = {};
  for (var key in CKCatalog.FormInputHelpers.DEFAULT) {
    if (!defaultHelper.hasOwnProperty(key)) {
      defaultHelper[key] = CKCatalog.FormInputHelpers.Filters.DEFAULT[key] || CKCatalog.FormInputHelpers[type] && CKCatalog.FormInputHelpers[type][key] || CKCatalog.FormInputHelpers.DEFAULT[key];
    }
  }
  var toggleHelper = helper.toggle || defaultHelper.toggle;
  var addHelper = helper.add || defaultHelper.add;
  var removeHelper = helper.remove || defaultHelper.remove;
  var serializeHelper = helper.serialize || defaultHelper.serialize;
  var that = this;
  var removeArrayItems = function(indexedName) {
    var arrayItems = that.dynamicFieldNames[indexedName];
    if (arrayItems && Array.isArray(arrayItems.value)) {
      arrayItems.value.forEach(function(dynamicFieldReference) {
        that.removeArrayItem(dynamicFieldReference);
      });
    }
    delete that.dynamicFieldNames[indexedName];
  };
  var remove = function(opts) {
    var indexedName = opts.name;
    that.removeRowByFieldName(indexedName + '-field-name');
    that.removeRowByFieldName(indexedName + '-add-value-button');
    delete that.fields[indexedName + '-field-name'];
    delete that.fields[indexedName + '-comparator'];
    delete that.fields[indexedName + '-add-value-button'];
    removeHelper.call(that, opts);
    removeArrayItems(indexedName);
    var arrayOfValues = that.dynamicFieldNames[name] && that.dynamicFieldNames[name].value;
    if (arrayOfValues && Array.isArray(arrayOfValues)) {
      var arrayIndex = arrayOfValues.reduce(function(n, currentValue, i) {
        if (currentValue.name === indexedName) {
          return i;
        } else {
          return n;
        }
      }, -1);
      if (arrayIndex > -1) {
        arrayOfValues.splice(arrayIndex, 1);
      }
    }
  };
  return {
    valueKeys: {
      first: 'field-name',
      last: helper.valueKeys && helper.valueKeys.last || defaultHelper.valueKeys.last
    },
    add: function(opts) {
      var indexedName = opts.name;
      var fieldNamesArray = that.dynamicFieldNames[name].value;
      fieldNamesArray.unshift({
        type: type,
        name: indexedName
      });
      var whenComparatorRequiresListValues = function(bool) {
        return function() {
          return that._comparatorRequiresListValues(that.getFieldValue(indexedName + '-comparator')) == bool;
        };
      };
      var toggleAddValueButton = function() {
        var comparatorRequiresListValues = whenComparatorRequiresListValues(true)();
        toggleHelper.call(that, opts, !comparatorRequiresListValues);
        that.toggleRow(indexedName + '-add-value-button', comparatorRequiresListValues);
        if (!comparatorRequiresListValues) {
          removeArrayItems(indexedName);
        }
      };
      that.addMultipleFields({
        number: 2,
        removeButtonAction: function() {
          remove({
            name: indexedName
          });
        }
      }).addInputField({
        name: indexedName + '-field-name',
        placeholder: 'Field name'
      }).addSelectField({
        name: indexedName + '-comparator',
        options: (isList && that._comparatorsForListField || helper.comparators || CKCatalog.FormInputHelpers.Filters.DEFAULT.comparators).map(function(comparator) {
          return {
            value: comparator
          };
        }),
        onChange: toggleAddValueButton
      });
      addHelper.call(that, opts);
      that.addButton({
        title: 'Add value…',
        border: true,
        hidden: whenComparatorRequiresListValues(false),
        action: function() {
          that.addArrayItem({
            name: indexedName,
            type: type,
            placeholder: 'List value',
            buttonRelativeName: 'add-value-button'
          });
        },
        name: indexedName + '-add-value-button'
      });
      return that;
    },
    remove: remove,
    toggle: function(opts, bool) {
      var name = opts.name;
      var comparator = that.getFieldValue(name + '-comparator');
      that.toggleRow(name + '-field-name', bool);
      if (bool === true) {
        toggleHelper.call(that, opts, !that._comparatorRequiresListValues(comparator));
        that.toggleRow(name + '-add-value-button', that._comparatorRequiresListValues(comparator));
      } else {
        toggleHelper.call(that, opts, bool);
        that.toggleRow(name + '-add-value-button', bool);
      }
      that.toggleArrayItems(name, bool);
    },
    serialize: function(opts) {
      var name = opts.name;
      var comparator = that.fields[name + '-comparator'].value;
      var dynamicFieldNames = that.dynamicFieldNames[name];
      var fieldName = that.fields[name + '-field-name'].value;
      var json = {
        comparator: comparator
      };
      if (fieldName) {
        json.fieldName = fieldName;
      }
      if (that._comparatorRequiresListValues(comparator)) {
        json.fieldValue = dynamicFieldNames.value && dynamicFieldNames.value.map(function(dynamicFieldReference) {
          return that.formHelperForType(dynamicFieldReference.type).serialize(dynamicFieldReference);
        });
      } else if (comparator === CKCatalog.COMPARATOR_NEAR) {
        var serializedLocation = serializeHelper.call(that, opts);
        json.fieldValue = serializedLocation.fieldValue;
        json.distance = serializedLocation.distance;
      } else {
        json.fieldValue = serializeHelper.call(that, opts);
      }
      return json;
    }
  };
};
CKCatalog.Form.prototype._comparatorRequiresListValues = function(comparator) {
  return [CKCatalog.COMPARATOR_IN, CKCatalog.COMPARATOR_NOT_IN, CKCatalog.COMPARATOR_LIST_CONTAINS_ALL, CKCatalog.COMPARATOR_NOT_LIST_CONTAINS_ALL, CKCatalog.COMPARATOR_NOT_LIST_CONTAINS_ANY].indexOf(comparator) > -1;
};
CKCatalog.Form.prototype._comparatorsForListField = [CKCatalog.COMPARATOR_LIST_CONTAINS, CKCatalog.COMPARATOR_NOT_LIST_CONTAINS, CKCatalog.COMPARATOR_LIST_CONTAINS_ALL, CKCatalog.COMPARATOR_NOT_LIST_CONTAINS_ANY, CKCatalog.COMPARATOR_NOT_LIST_CONTAINS_ALL, CKCatalog.COMPARATOR_LIST_MEMBER_BEGINS_WITH, CKCatalog.COMPARATOR_NOT_LIST_MEMBER_BEGINS_WITH];
CKCatalog.Form.prototype.addQueryBuilder = function(opts) {
  var name = opts.name;
  this.dynamicFieldNames[name] = {
    key: name,
    value: [],
    queryBuilder: true
  };
  var that = this;
  return this.addMultipleFields({
    number: 3,
    label: opts.label,
    hidden: opts.hidden
  }).addSelectField({
    name: name + '-field-type-selector',
    label: 'Field type:',
    options: [{
      value: CKCatalog.FIELD_TYPE_STRING,
      title: 'String'
    }, {
      value: CKCatalog.FIELD_TYPE_INT64,
      title: 'Number'
    }, {
      value: CKCatalog.FIELD_TYPE_TIMESTAMP,
      title: 'Timestamp'
    }, {
      value: CKCatalog.FIELD_TYPE_LOCATION,
      title: 'Location'
    }, {
      value: CKCatalog.FIELD_TYPE_REFERENCE,
      title: 'Reference'
    }]
  }).addCheckboxes({
    checkboxes: [{
      label: 'list',
      name: name + '-list-checkbox'
    }]
  }).addButton({
    name: name + '-add-filter-button',
    title: 'Add filter…',
    action: function() {
      var isList = that.getFieldValue(name + '-list-checkbox');
      var fieldType = that.getFieldValue(name + '-field-type-selector');
      var button = that.fields[name + '-add-filter-button'];
      var index = button.arrayItemIndex || 0;
      var indexedName = that.createDynamicFieldName(name, index);
      button.arrayItemIndex = index + 1;
      var helper = that._getFilterHelperForType(name, fieldType, isList);
      that.movePointerTo(name + '-add-filter-button');
      helper.add({
        name: indexedName,
        type: fieldType
      });
      that.focusField(indexedName + '-' + helper.valueKeys.first);
    }
  });
};
CKCatalog.Form.prototype._serializeFilters = function(filters) {
  var that = this;
  return filters.value.map(function(filter) {
    return that._getFilterHelperForType(filters.key, filter.type).serialize(filter);
  });
};
CKCatalog.Form.prototype.toggleFilters = function(name, bool) {
  var filters = this.dynamicFieldNames[name];
  var that = this;
  if (filters && filters.queryBuilder) {
    if (Array.isArray(filters.value)) {
      filters.value.forEach(function(filter) {
        that._getFilterHelperForType(filters.key, filter.type).toggle({
          name: filter.name
        }, bool);
      });
    }
  }
  this.toggleRow(name + '-add-filter-button', bool);
};
