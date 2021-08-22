CKCatalog.tabs['sync'] = (function() {

  var hideOwnerRecordName = function() {
    return this.getFieldValue('database') !== 'SHARED';
  };

  var toggleOwnerRecordNameAndClearSyncToken = function() {
    this.setFieldValue('sync-token', '');
    this.toggleRow('owner-record-name', !hideOwnerRecordName.call(this));
  };

  var databaseOptions = {
    name: 'database',
    label: 'databaseScope:',
    options: [{
        value: 'PRIVATE'
      },
      {
        value: 'SHARED'
      }
    ],
    onChange: toggleOwnerRecordNameAndClearSyncToken
  };

  var zoneSyncForm = (new CKCatalog.Form)
    .addSelectField(databaseOptions)
    .addInputField({
      placeholder: 'Zone name',
      name: 'zone',
      label: 'zoneName:',
      value: 'myCustomZone'
    })
    .addInputField({
      placeholder: 'Owner record name',
      name: 'owner-record-name',
      label: 'ownerRecordName:',
      hidden: hideOwnerRecordName
    })
    .addInputField({
      placeholder: 'Sync token',
      name: 'sync-token',
      label: 'syncToken:'
    });

  var databaseSyncForm = (new CKCatalog.Form)
    .addSelectField(databaseOptions)
    .addInputField({
      placeholder: 'Sync token',
      name: 'sync-token',
      label: 'syncToken:'
    });


  var createSyncTokenView = function(syncToken) {
    var p = document.createElement('p');
    p.innerHTML = '<span class="light small">At syncToken:</span> ' +
      '<span class="small">' + syncToken + '</span> ';
    return p;
  };

  var renderRecords = function(databaseScope, zoneName, ownerRecordName, records, syncToken, moreComing) {
    // Populate the syncToken form field with the new syncToken:
    zoneSyncForm.setFieldValue('sync-token', syncToken);

    var content = document.createElement('div');
    var heading = document.createElement('h2');
    var recordsTable = new CKCatalog.Table([
        'recordName', 'recordType', 'shortGUID', 'deleted'
      ])
      .setTextForEmptyRow('No new records')
      .rowIsSelectable(function(row) {
        return !row.data.deleted && row.data.recordName;
      }).addSelectHandler(function(row) {
        CKCatalog.tabManager.navigateToCodeSample('records/fetchRecords', {
          'record-id': row.data['recordName'],
          'zone-name': zoneName,
          'database-scope': databaseScope,
          'owner-record-name': ownerRecordName
        });
      });
    heading.innerHTML = 'Records in ' + zoneName + ' of ' + databaseScope.toLowerCase() + ' database' +
      (moreComing ? '<span id="more-records-coming">' + ' (incomplete)' + '</span>:' : ':');
    if (records.length === 0) {
      recordsTable.appendRow([]);
    } else {
      records.forEach(function(record) {
        var fields = record.fields;
        var name = fields ? fields['name'] : undefined;
        var location = fields ? fields['location'] : undefined;
        recordsTable.appendRow([
          record.recordName,
          record.recordType,
          record.shortGUID,
          record.deleted
        ]);
      });
    }

    content.appendChild(heading);
    content.appendChild(createSyncTokenView(syncToken));
    content.appendChild(recordsTable.el);
    return content;
  };

  var renderZones = function(databaseScope, zones, syncToken, moreComing) {
    // Populate the syncToken form field with the new syncToken:
    databaseSyncForm.setFieldValue('sync-token', syncToken);

    var content = document.createElement('div');
    var heading = document.createElement('h2');
    var zonesTable = new CKCatalog.Table([
        'zoneID', 'syncToken', 'atomic', 'deleted'
      ])
      .setTextForEmptyRow('No new zones')
      .rowIsSelectable(function(row) {
        return row.data.zoneID && row.data.zoneID.zoneName !== CKCatalog.DEFAULT_ZONE_NAME && !row.data.deleted;
      }).addSelectHandler(function(row) {
        CKCatalog.tabManager.navigateToCodeSample('sync/fetchRecordZoneChanges', {
          'zone': row.data.zoneID.zoneName,
          'owner-record-name': row.data.zoneID.ownerRecordName,
          'database': databaseScope
        });
      });
    heading.innerHTML = 'Zones in ' + databaseScope.toLowerCase() + ' database' +
      (moreComing ? '<span id="more-zones-coming">' + ' (incomplete)' + '</span>:' : ':');
    if (zones.length === 0) {
      zonesTable.appendRow([]);
    } else {
      zones.forEach(function(zone) {
        zonesTable.appendRow([
          zone.zoneID,
          zone.syncToken,
          zone.atomic,
          zone.deleted
        ]);
      });
    }

    content.appendChild(heading);
    content.appendChild(createSyncTokenView(syncToken));
    content.appendChild(zonesTable.el);
    return content;
  };


  var fetchRecordZoneChangesSample = {
    title: 'fetchRecordZoneChanges',
    form: zoneSyncForm,
    run: function() {
      var zone = this.form.getFieldValue('zone');
      var database = this.form.getFieldValue('database');
      var ownerRecordName = database === 'SHARED' && this.form.getFieldValue('owner-record-name');
      var syncToken = this.form.getFieldValue('sync-token');
      return this.sampleCode(database, zone, ownerRecordName, syncToken);
    },
    sampleCode: function demoFetchRecordZoneChanges(
      databaseScope, zoneName, ownerRecordName, syncToken
    ) {
      var container = CloudKit.getDefaultContainer();
      var database = container.getDatabaseWithDatabaseScope(
        CloudKit.DatabaseScope[databaseScope]
      );

      var zoneID = {
        zoneName: zoneName
      };

      if (ownerRecordName) {
        zoneID.ownerRecordName = ownerRecordName;
      }

      var args = {
        zoneID: zoneID,

        // Limit to 5 results.
        resultsLimit: 5
      };

      if (syncToken) {
        args.syncToken = syncToken;
      }

      return database.fetchRecordZoneChanges(args).then(function(response) {
        if (response.hasErrors) {

          // Handle the errors.
          throw response.errors[0];

        } else {
          var zonesResponse = response.zones[0];
          var newSyncToken = zonesResponse.syncToken;
          var records = zonesResponse.records;
          var moreComing = zonesResponse.moreComing;

          return renderRecords(
            databaseScope,
            zoneName,
            ownerRecordName,
            records,
            newSyncToken,
            moreComing
          );
        }
      });
    }

  };

  var fetchDatabaseChangesSample = {
    title: 'fetchDatabaseChanges',
    form: databaseSyncForm,
    run: function() {
      var database = this.form.getFieldValue('database');
      var syncToken = this.form.getFieldValue('sync-token');
      return this.sampleCode(database, syncToken);
    },
    sampleCode: function demoFetchDatabaseChanges(databaseScope, syncToken) {
      var container = CloudKit.getDefaultContainer();
      var database = container.getDatabaseWithDatabaseScope(
        CloudKit.DatabaseScope[databaseScope]
      );

      var opts = {

        // Limit to 5 results.
        resultsLimit: 5
      };

      if (syncToken) {
        opts.syncToken = syncToken;
      }

      return database.fetchDatabaseChanges(opts).then(function(response) {
        if (response.hasErrors) {

          // Handle the errors.
          throw response.errors[0];

        } else {

          var newSyncToken = response.syncToken;

          var zones = response.zones;
          var moreComing = response.moreComing;

          return renderZones(databaseScope, zones, newSyncToken, moreComing);

        }
      });
    }

  };

  return [fetchDatabaseChangesSample, fetchRecordZoneChangesSample];
})();
