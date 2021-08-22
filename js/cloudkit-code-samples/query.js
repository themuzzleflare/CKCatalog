CKCatalog.tabs['query'] = (function() {

  var continuationMarker;

  var saveContinuationMarker = function(value) {
    if (value) {
      continuationMarker = value;
      continuationMarkerView.classList.remove('hide');
      continuationMarkerValueView.textContent = value;
    } else {
      removeContinuationMarker();
    }
  };

  var removeContinuationMarker = function() {
    continuationMarker = null;
    continuationMarkerView.classList.add('hide');
  };

  var getContinuationMarker = function() {
    return continuationMarker;
  };

  var hideOwnerRecordName = function() {
    return this.getFieldValue('database-scope') !== 'SHARED';
  };

  var toggleOwnerRecordName = function() {
    this.toggleRow('owner-record-name', !hideOwnerRecordName.call(this));
  };

  var queryForm = new CKCatalog.Form()
    .addSelectField({
      name: 'database-scope',
      label: 'databaseScope:',
      options: [{
          value: 'PUBLIC'
        },
        {
          value: 'PRIVATE'
        },
        {
          value: 'SHARED'
        }
      ],
      onChange: toggleOwnerRecordName
    })
    .addInputField({
      name: 'zone-name',
      label: 'zoneName:',
      placeholder: 'Zone name',
      value: CKCatalog.DEFAULT_ZONE_NAME
    })
    .addInputField({
      placeholder: 'Owner record name',
      label: 'ownerRecordName:',
      name: 'owner-record-name',
      hidden: hideOwnerRecordName
    })
    .addInputField({
      name: 'record-type',
      label: 'recordType:',
      placeholder: 'Record type',
      value: 'Stations'
    })
    .addInputField({
      name: 'desired-keys',
      label: 'desiredKeys:',
      placeholder: 'Comma separated field names',
      value: 'name,id,stopId,suburb,location'
    })
    .addMultipleFields({
      number: 2,
      label: 'sortBy:'
    })
    .addInputField({
      name: 'sort-by-field',
      placeholder: 'Field name',
      value: "location"
    })
    .addCheckboxes({
      checkboxes: [{
        name: 'ascending',
        label: 'ascending',
        checked: true
      }]
    })
    .addCheckboxes({
      hidden: false,
      checkboxes: [{
        name: 'sort-by-location',
        label: 'Sort this field by distance from a location',
        checked: true
      }]
    })
    .addMultipleFields({
      number: 2,
      hidden: false
    })
    .addInputField({
      name: 'latitude',
      placeholder: 'Latitude',
      value: '-33.43078291754649'
    })
    .addInputField({
      name: 'longitude',
      placeholder: 'Longitude',
      value: '151.3108412528859'
    })
    .addQueryBuilder({
      name: 'filter-by',
      label: 'filterBy:'
    });

  var sortByField = queryForm.fields['sort-by-field'];
  var sortByLocationCheckbox = queryForm.fields['sort-by-location'];

  var toggleRelativeLocationContainer = function() {
    queryForm.toggleRow('latitude', sortByLocationCheckbox.checked);
  };

  sortByField.addEventListener('input', function() {
    if (sortByField.value) {
      toggleRelativeLocationContainer();
    } else {
      queryForm.toggleRow('latitude', false);
    }
    var hasSortByValue = !!sortByField.value;
    queryForm.toggleRow('sort-by-location', hasSortByValue);
  });

  sortByLocationCheckbox.addEventListener('change', toggleRelativeLocationContainer);

  var displayFields = [];

  var continuationMarkerView = document.createElement('div');
  continuationMarkerView.className = 'hide';
  continuationMarkerView.innerHTML = '<div class="light small">At continuation marker: </div>';
  var deleteButton = document.createElement('button');
  deleteButton.className = 'link small';
  deleteButton.textContent = '(delete)';
  deleteButton.onclick = function() {
    removeContinuationMarker();
  };
  continuationMarkerView.firstChild.appendChild(deleteButton);
  var continuationMarkerValueView = document.createElement('div');
  continuationMarkerValueView.className = 'small ellipsis';
  continuationMarkerView.appendChild(continuationMarkerValueView);

  var renderRecords = function(records) {
    var recordsTable = new CKCatalog.Table(displayFields.map(function(fieldName) {
      return fieldName.replace('fields.', '');
    }));
    var continuationMarker = getContinuationMarker();
    var title = 'Matching records:';
    if (continuationMarker) {
      title = 'Matching records (run code again to get more):';
    }
    var div = CKCatalog.renderUtils.renderRecords(recordsTable, title, records, displayFields);
    div.insertBefore(continuationMarkerView, div.firstChild);
    return div;
  };

  var querySample = {
    form: queryForm,
    title: 'performQuery',
    run: function() {
      var databaseScope = this.form.getFieldValue('database-scope');
      var recordType = this.form.getFieldValue('record-type');
      var zoneName = this.form.getFieldValue('zone-name');
      var ownerRecordName = databaseScope == 'SHARED' && this.form.getFieldValue('owner-record-name');
      var sortByFieldName = sortByField.value;
      var ascending = this.form.getFieldValue('ascending');
      var lat, long;
      if (this.form.getFieldValue('sort-by-location')) {
        lat = parseFloat(this.form.getFieldValue('latitude'));
        long = parseFloat(this.form.getFieldValue('longitude'));
      }
      var filters = this.form.getFieldValue('filter-by');
      var desiredKeys = this.form.getFieldValue('desired-keys').split(',').map(function(f) {
        return f.trim();
      });
      displayFields = ['recordName'].concat(desiredKeys.map(function(f) {
        return 'fields.' + f;
      }));
      return this.sampleCode(databaseScope, zoneName, ownerRecordName, recordType, desiredKeys, sortByFieldName, ascending, lat, long, filters);
    },
    sampleCode: function demoPerformQuery(
      databaseScope, zoneName, ownerRecordName, recordType,
      desiredKeys, sortByField, ascending, latitude, longitude,
      filters
    ) {
      var container = CloudKit.getDefaultContainer();
      var database = container.getDatabaseWithDatabaseScope(
        CloudKit.DatabaseScope[databaseScope]
      );

      // Set the query parameters.
      var query = {
        recordType: recordType
      };

      if (sortByField) {
        var sortDescriptor = {
          fieldName: sortByField,
          ascending: ascending
        };

        if (!isNaN(latitude) && !isNaN(longitude)) {
          sortDescriptor.relativeLocation = {
            latitude: latitude,
            longitude: longitude
          };
        }

        query.sortBy = [sortDescriptor];
      }

      // Convert the filters to the appropriate format.
      query.filterBy = filters.map(function(filter) {
        filter.fieldValue = {
          value: filter.fieldValue
        };
        return filter;
      });


      // Set the options.
      var options = {

        // Restrict our returned fields to this array of keys.
        desiredKeys: desiredKeys,

        // Fetch 200 results at a time.
        resultsLimit: 200

      };

      if (zoneName) {
        options.zoneID = {
          zoneName: zoneName
        };
        if (ownerRecordName) {
          options.zoneID.ownerRecordName = ownerRecordName;
        }
      }

      // If we have a continuation marker, use it to fetch the next 5 results.
      var continuationMarker = getContinuationMarker();
      if (continuationMarker) {
        options.continuationMarker = continuationMarker;
      }

      // Execute the query.
      return database.performQuery(query, options)
        .then(function(response) {
          if (response.hasErrors) {

            // Handle them in your app.
            throw response.errors[0];

          } else {
            var records = response.records;

            // Save the continuation marker so we can fetch more results.
            saveContinuationMarker(response.continuationMarker);

            return renderRecords(records);
          }
        });
    }
  };

  return [querySample];

})();
