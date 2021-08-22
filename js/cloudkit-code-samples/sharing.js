CKCatalog.tabs['sharing'] = (function() {

  var renderShareResponse = function(response) {
    var container = document.createElement('div');
    if (response && (response.share || response.record)) {
      if (response.share) {
        container.appendChild(CKCatalog.renderUtils.renderRecord('Share:', response.share));
      }
      if (response.record) {
        container.appendChild(CKCatalog.renderUtils.renderRecord('Record:', response.record));
      }
    } else {
      var h2 = document.createElement('h2');
      h2.textContent = 'Not shared';
      container.appendChild(h2);
    }
    return container;
  };

  var render = function(record) {
    var container = document.createElement('div');
    container.appendChild(CKCatalog.renderUtils.renderRecord(null, record));
    if (record.share) {
      container.appendChild(CKCatalog.renderUtils.renderRecord('Share:', record.share));
    }
    if (record.rootRecord) {
      container.appendChild(CKCatalog.renderUtils.renderRecord('Root Record:', record.rootRecord));
    }
    return container;
  };

  var createShortGUIDForm = function() {
    return (new CKCatalog.Form)
      .addInputField({
        placeholder: 'Short GUID',
        label: 'shortGUID:',
        name: 'shortGUID'
      });
  };

  var hideOwnerRecordName = function() {
    return this.getFieldValue('database-scope') !== 'SHARED';
  };

  var toggleOwnerRecordName = function() {
    this.toggleRow('owner-record-name', !hideOwnerRecordName.call(this));
  };

  var shareWithUIForm = (new CKCatalog.Form)
    .addSelectField({
      name: 'database-scope',
      label: 'databaseScope:',
      options: [{
          value: 'PRIVATE'
        },
        {
          value: 'SHARED'
        }
      ],
      onChange: toggleOwnerRecordName
    })
    .addInputField({
      placeholder: 'Record name',
      label: 'recordName:',
      name: 'record-name'
    })
    .addInputField({
      placeholder: 'Zone name',
      label: 'zoneName:',
      name: 'zone-name'
    })
    .addInputField({
      placeholder: 'Owner record name',
      label: 'ownerRecordName:',
      name: 'owner-record-name',
      hidden: hideOwnerRecordName
    })
    .addInputField({
      placeholder: 'Share title',
      label: 'shareTitle:',
      name: 'share-title'
    })
    .addSelectField({
      name: 'supported-access',
      label: 'supportedAccess:',
      options: [{
          value: 'PRIVATE,PUBLIC',
          title: 'PUBLIC, PRIVATE'
        },
        {
          value: 'PUBLIC'
        },
        {
          value: 'PRIVATE'
        }
      ]
    })
    .addSelectField({
      name: 'supported-permissions',
      label: 'supportedPermissions:',
      options: [{
          value: 'READ_WRITE,READ_ONLY',
          title: 'READ_WRITE, READ_ONLY'
        },
        {
          value: 'READ_WRITE'
        },
        {
          value: 'READ_ONLY'
        }
      ]
    });

  var resolveShortGUIDSample = {
    title: 'fetchRecordInfos',
    form: createShortGUIDForm(),
    run: function() {
      var shortGUID = this.form.getFieldValue('shortGUID');
      return this.sampleCode(shortGUID);
    },
    sampleCode: function demoFetchRecordInfos(shortGUID) {
      var container = CloudKit.getDefaultContainer();

      return container.fetchRecordInfos(shortGUID)
        .then(function(response) {
          if (response.hasErrors) {

            // Handle them in your app.
            throw response.errors[0];

          } else {
            var result = response.results[0];
            return render(result);
          }
        });
    }

  };

  var acceptShareSample = {
    title: 'acceptShares',
    form: createShortGUIDForm(),
    run: function() {
      var shortGUID = this.form.getFieldValue('shortGUID');
      return this.sampleCode(shortGUID);
    },
    sampleCode: function demoAcceptShares(shortGUID) {
      var container = CloudKit.getDefaultContainer();

      return container.acceptShares(shortGUID)
        .then(function(response) {
          if (response.hasErrors) {

            // Handle them in your app.
            throw response.errors[0];

          } else {
            var result = response.results[0];
            return render(result);
          }
        });
    }
  };

  var shareWithUISample = {
    title: 'shareWithUI',
    form: shareWithUIForm,
    run: function() {
      var databaseScope = this.form.getFieldValue('database-scope');
      var recordName = this.form.getFieldValue('record-name');
      var zoneName = this.form.getFieldValue('zone-name');
      var ownerRecordName = databaseScope === 'SHARED' && this.form.getFieldValue('owner-record-name');
      var shareTitle = this.form.getFieldValue('share-title');
      var supportedAccess = this.form.getFieldValue('supported-access').split(',');
      var supportedPermissions = this.form.getFieldValue('supported-permissions').split(',');

      // Hide the dialog as CloudKit JS has it's own spinner for this UI.
      CKCatalog.dialog.hide();

      return this.sampleCode(databaseScope, recordName, zoneName, ownerRecordName, shareTitle, supportedAccess, supportedPermissions);
    },
    sampleCode: function demoShareWithUI(
      databaseScope, recordName, zoneName, ownerRecordName,
      shareTitle, supportedAccess, supportedPermissions
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

      return database.shareWithUI({

        record: {
          recordName: recordName
        },
        zoneID: zoneID,

        shareTitle: shareTitle,

        supportedAccess: supportedAccess,

        supportedPermissions: supportedPermissions

      }).then(function(response) {
        if (response.hasErrors) {

          // Handle the errors in your app.
          throw response.errors[0];

        } else {

          return renderShareResponse(response);
        }
      });
    }
  };

  return [resolveShortGUIDSample, acceptShareSample, shareWithUISample];
})();
