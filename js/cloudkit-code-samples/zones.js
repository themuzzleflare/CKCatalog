CKCatalog.tabs['zones'] = (function() {

  var createZoneNameForm = function() {
    return (new CKCatalog.Form)
      .addInputField({
        name: 'name',
        placeholder: 'Custom zone name',
        label: 'zoneName:',
        value: 'myCustomZone'
      });
  };

  var renderZones = function(zones) {
    var content = document.createElement('div');
    var heading = document.createElement('h2');
    heading.textContent = 'Zones:';
    var table = new CKCatalog.Table([
      'zoneID', 'atomic', 'syncToken'
    ]).setTextForEmptyRow('No custom zones');
    if (zones.length === 0) {
      table.appendRow([]);
    } else {
      zones.forEach(function(zone) {
        table.appendRow([
          zone.zoneID,
          zone.atomic,
          zone.syncToken
        ]);
      })
    }
    content.appendChild(heading);
    content.appendChild(table.el);
    return content;
  };

  var renderZone = function(zone) {
    var content = document.createElement('div');
    var heading = document.createElement('h2');
    heading.textContent = 'Zone:';
    var table = new CKCatalog.Table().renderObject(zone);
    content.appendChild(heading);
    content.appendChild(table.el);
    return content;
  };

  var runSampleCode = function() {
    var zoneName = this.form.getFieldValue('name');
    return this.sampleCode(zoneName);
  };

  var createZoneSample = {
    title: 'saveRecordZones',
    form: createZoneNameForm(),
    run: runSampleCode,
    sampleCode: function demoSaveRecordZones(zoneName) {
      var container = CloudKit.getDefaultContainer();
      var privateDB = container.privateCloudDatabase;

      return privateDB.saveRecordZones({
        zoneName: zoneName
      }).then(function(response) {
        if (response.hasErrors) {

          // Handle any errors.
          throw response.errors[0];

        } else {

          // response.zones is an array of zone objects.
          return renderZone(response.zones[0]);

        }
      });
    }
  };

  var deleteRecordZoneSample = {
    title: 'deleteRecordZones',
    form: createZoneNameForm(),
    run: runSampleCode,
    sampleCode: function demoDeleteRecordZones(zoneName) {
      var container = CloudKit.getDefaultContainer();
      var privateDB = container.privateCloudDatabase;

      return privateDB.deleteRecordZones({
        zoneName: zoneName
      }).then(function(response) {
        if (response.hasErrors) {

          // Handle any errors.
          throw response.errors[0];

        } else {

          // response.zones is an array of zone objects.
          return renderZone(response.zones[0]);

        }
      });
    }
  };

  var fetchRecordZoneSample = {
    title: 'fetchRecordZones',
    form: createZoneNameForm(),
    run: runSampleCode,
    sampleCode: function demoFetchRecordZones(zoneName) {
      var container = CloudKit.getDefaultContainer();
      var privateDB = container.privateCloudDatabase;

      return privateDB.fetchRecordZones({
        zoneName: zoneName
      }).then(function(response) {
        if (response.hasErrors) {

          // Handle any errors.
          throw response.errors[0];

        } else {

          // response.zones is an array of zone objects.
          return renderZone(response.zones[0]);

        }
      });
    }
  };

  var fetchAllRecordZonesSample = {
    title: 'fetchAllRecordZones',
    sampleCode: function demoFetchAllRecordZones() {
      var container = CloudKit.getDefaultContainer();
      var privateDB = container.privateCloudDatabase;

      return privateDB.fetchAllRecordZones().then(function(response) {
        if (response.hasErrors) {

          // Handle any errors.
          throw response.errors[0];

        } else {

          // response.zones is an array of zone objects.
          return renderZones(response.zones);

        }
      });
    }
  };

  return [createZoneSample, deleteRecordZoneSample, fetchRecordZoneSample, fetchAllRecordZonesSample];
})();
