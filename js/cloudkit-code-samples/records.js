CKCatalog.tabs['records'] = (function() {

  var renderRecord = function(record, zoneID, databaseScope) {
    var container = document.createElement('div');

    var actionsContainer = document.createElement('div');
    actionsContainer.className = 'record-actions';

    if (record.shortGUID && record.recordType !== CKCatalog.SHARE_RECORD_TYPE_NAME) {
      var shareButton = document.createElement('button');
      shareButton.setAttribute('type', 'button');
      shareButton.className = 'share-button link';
      shareButton.textContent = 'Share';
      shareButton.onclick = function() {
        CKCatalog.tabManager.navigateToCodeSample('sharing/shareWithUI', {
          'database-scope': databaseScope,
          'record-name': record.recordName,
          'zone-name': zoneID && zoneID.zoneName,
          'owner-record-name': zoneID && zoneID.ownerRecordName
        });
      };
      actionsContainer.appendChild(shareButton);
    }

    var editButton = document.createElement('button');
    editButton.setAttribute('type', 'button');
    editButton.className = 'edit-button link';
    editButton.textContent = 'Edit';
    editButton.onclick = function() {
      CKCatalog.tabManager.navigateToCodeSample('records/saveRecords', {
        'database-scope': databaseScope,
        'record-name': record.recordName,
        'change-tag': record.recordChangeTag,
        'zone-name': zoneID && zoneID.zoneName,
        'owner-record-name': zoneID && zoneID.ownerRecordName,
        'record-type': record.recordType,
        'parent-record-name': record.parent && record.parent.recordName,
        'public-permission': record.publicPermission,
        'participants': record.participants,
        'fields': record.fields
      });
    };
    actionsContainer.appendChild(editButton);

    container.appendChild(actionsContainer);

    container.appendChild(CKCatalog.renderUtils.renderRecord('Record:', record));

    return container;
  };

  var renderDeletedRecord = function(record) {
    return CKCatalog.renderUtils.renderRecord('Deleted Record:', record);
  };

  var runSampleCode = function() {
    var recordName = this.form.getFieldValue('record-id');
    var zoneName = this.form.getFieldValue('zone-name');
    var databaseScope = this.form.getFieldValue('database-scope');
    var ownerRecordName;
    if (databaseScope === 'SHARED') {
      ownerRecordName = this.form.getFieldValue('owner-record-name');
    }
    return this.sampleCode(databaseScope, recordName, zoneName, ownerRecordName);
  };

  var hideShareFields = function(bool) {
    return function() {
      return (this.getFieldValue('record-type') !== CKCatalog.SHARE_RECORD_TYPE_NAME) == bool;
    }
  };

  var toggleShareRows = function() {
    var publicPermission = this.getFieldValue('public-permission');
    var changeTag = this.getFieldValue('change-tag');
    this.toggleArrayField('participants', hideShareFields(false).call(this) && publicPermission === 'NONE');
    this.toggleRow('parent-record-name', hideShareFields(true).call(this));
    this.toggleRow('create-short-guid', hideShareFields(true).call(this));
    this.toggleRow('for-record-name', hideShareFields(false).call(this) && !changeTag);
    this.toggleRow('for-record-change-tag', hideShareFields(false).call(this) && !changeTag);
    this.toggleRow('public-permission', hideShareFields(false).call(this));
  };

  var toggleOwnerRecordName = function() {
    var databaseScope = this.getFieldValue('database-scope');
    this.toggleRow('owner-record-name', databaseScope === 'SHARED');
  };

  var hideOwnerRecordName = function() {
    return this.getFieldValue('database-scope') !== 'SHARED';
  };

  var createRecordIDForm = function() {
    return (new CKCatalog.Form)
      .addSelectField({
        name: 'database-scope',
        label: 'databaseScope:',
        onChange: toggleOwnerRecordName,
        options: [{
            value: 'PRIVATE'
          },
          {
            value: 'PUBLIC'
          },
          {
            value: 'SHARED'
          }
        ]
      })
      .addInputField({
        placeholder: 'Record name',
        name: 'record-id',
        label: 'recordName:',
        value: 'NewItem'
      })
      .addInputField({
        placeholder: 'Zone name',
        name: 'zone-name',
        label: 'zoneName:',
        value: CKCatalog.DEFAULT_ZONE_NAME
      })
      .addInputField({
        placeholder: 'Owner record name',
        name: 'owner-record-name',
        label: 'ownerRecordName:',
        hidden: hideOwnerRecordName
      });
  };

  var createItemForm = (new CKCatalog.Form)
    .addSelectField({
      label: 'databaseScope',
      name: 'database-scope',
      options: [{
          value: 'PRIVATE'
        },
        {
          value: 'PUBLIC'
        },
        {
          value: 'SHARED'
        }
      ],
      onChange: toggleOwnerRecordName
    })
    .addInputField({
      placeholder: 'Record name',
      name: 'record-name',
      label: 'recordName:'
    })
    .addInputField({
      placeholder: 'Change tag',
      name: 'change-tag',
      label: 'recordChangeTag:',
      onChange: toggleShareRows
    })
    .addInputField({
      placeholder: 'Record type',
      name: 'record-type',
      label: 'recordType:',
      value: 'Stations',
      onChange: toggleShareRows
    })
    .addInputField({
      placeholder: 'Zone name',
      name: 'zone-name',
      label: 'zoneName:',
      value: CKCatalog.DEFAULT_ZONE_NAME
    })
    .addInputField({
      placeholder: 'Owner record name',
      name: 'owner-record-name',
      label: 'ownerRecordName:',
      hidden: hideOwnerRecordName
    })
    .addInputField({
      placeholder: 'Name of record to share',
      name: 'for-record-name',
      label: 'forRecordName:',
      hidden: hideShareFields(true)
    })
    .addInputField({
      placeholder: 'Change tag of record to share',
      name: 'for-record-change-tag',
      label: 'forRecordChangeTag',
      hidden: hideShareFields(true)
    })
    .addSelectField({
      name: 'public-permission',
      label: 'publicPermission:',
      hidden: hideShareFields(true),
      onChange: toggleShareRows,
      options: [{
          value: 'NONE'
        },
        {
          value: 'READ_ONLY'
        },
        {
          value: 'READ_WRITE'
        }
      ]
    })
    .addArrayField({
      name: 'participants',
      label: 'participants:',
      type: CKCatalog.FIELD_TYPE_SHARE_PARTICIPANT,
      buttonTitle: 'Add participant…',
      hidden: hideShareFields(true)
    })
    .addInputField({
      placeholder: 'Parent record name',
      name: 'parent-record-name',
      label: 'parent:',
      hidden: hideShareFields(false)
    })
    .addDynamicFields({
      label: 'fields:',
      name: 'fields'
    })
    .addCheckboxes({
      hidden: hideShareFields(false),
      checkboxes: [{
        name: 'create-short-guid',
        label: 'Create short GUID'
      }]
    });

  var saveRecordSample = {
    title: 'saveRecords',
    form: createItemForm,
    run: function() {
      var databaseScope = this.form.getFieldValue('database-scope');
      var recordName = this.form.getFieldValue('record-name');
      var changeTag = this.form.getFieldValue('change-tag');
      var zoneName = this.form.getFieldValue('zone-name');
      var recordType = this.form.getFieldValue('record-type');

      // Dependent fields:
      var ownerRecordName, parentRecordName, forRecordName,
        publicPermission, participants, createShortGUID, forRecordChangeTag;

      if (databaseScope === 'SHARED') {
        ownerRecordName = this.form.getFieldValue('owner-record-name');
      }

      if (recordType === CKCatalog.SHARE_RECORD_TYPE_NAME) {
        if (!changeTag) {
          forRecordName = this.form.getFieldValue('for-record-name');
          forRecordChangeTag = this.form.getFieldValue('for-record-change-tag');
        }
        publicPermission = this.form.getFieldValue('public-permission');
        if (publicPermission === 'NONE') {
          participants = this.form.getFieldValue('participants');
        }
      } else {
        parentRecordName = this.form.getFieldValue('parent-record-name');
        createShortGUID = this.form.getFieldValue('create-short-guid');
      }

      var fields = this.form.getFieldValue('fields');

      return this.sampleCode(
        databaseScope, recordName, changeTag, recordType, zoneName, forRecordName, forRecordChangeTag,
        publicPermission, ownerRecordName, participants, parentRecordName, fields, createShortGUID
      );
    },
    sampleCode: function demoSaveRecords(
      databaseScope, recordName, recordChangeTag, recordType, zoneName,
      forRecordName, forRecordChangeTag, publicPermission, ownerRecordName,
      participants, parentRecordName, fields, createShortGUID
    ) {
      var container = CloudKit.getDefaultContainer();
      var database = container.getDatabaseWithDatabaseScope(
        CloudKit.DatabaseScope[databaseScope]
      );

      var options = {
        // By passing and fetching number fields as strings we can use large
        // numbers (up to the server's limits).
        numbersAsStrings: true

      };

      // If no zoneName is provided the record will be saved to the default zone.
      if (zoneName) {
        options.zoneID = {
          zoneName: zoneName
        };
        if (ownerRecordName) {
          options.zoneID.ownerRecordName = ownerRecordName;
        }
      }

      var record = {

        recordType: recordType

      };

      // If no recordName is supplied the server will generate one.
      if (recordName) {
        record.recordName = recordName;
      }

      // To modify an existing record, supply a recordChangeTag.
      if (recordChangeTag) {
        record.recordChangeTag = recordChangeTag;
      }

      // Convert the fields to the appropriate format.
      record.fields = Object.keys(fields).reduce(function(obj, key) {
        obj[key] = {
          value: fields[key]
        };
        return obj;
      }, {});

      // If we are going to want to share the record we need to
      // request a stable short GUID.
      if (createShortGUID) {
        record.createShortGUID = true;
      }

      // If we want to share the record via a parent reference we need to set
      // the record's parent property.
      if (parentRecordName) {
        record.parent = {
          recordName: parentRecordName
        };
      }

      if (publicPermission) {
        record.publicPermission = CloudKit.ShareParticipantPermission[publicPermission];
      }

      // If we are creating a share record, we must specify the
      // record which we are sharing.
      if (forRecordName && forRecordChangeTag) {
        record.forRecord = {
          recordName: forRecordName,
          recordChangeTag: forRecordChangeTag
        };
      }

      if (participants) {
        record.participants = participants.map(function(participant) {
          return {
            userIdentity: {
              lookupInfo: {
                emailAddress: participant.emailAddress
              }
            },
            permission: CloudKit.ShareParticipantPermission[participant.permission],
            type: participant.type,
            acceptanceStatus: participant.acceptanceStatus
          };
        });
      }

      return database.saveRecords(record, options)
        .then(function(response) {
          if (response.hasErrors) {

            // Handle the errors in your app.
            throw response.errors[0];

          } else {

            return renderRecord(response.records[0], options.zoneID, databaseScope);
          }
        });
    }

  };

  var deleteRecordSample = {
    title: 'deleteRecords',
    form: createRecordIDForm(),
    run: runSampleCode,
    sampleCode: function demoDeleteRecord(
      databaseScope, recordName, zoneName, ownerRecordName
    ) {
      var container = CloudKit.getDefaultContainer();
      var database = container.getDatabaseWithDatabaseScope(
        CloudKit.DatabaseScope[databaseScope]
      );

      var zoneID, options;

      if (zoneName) {
        zoneID = {
          zoneName: zoneName
        };
        if (ownerRecordName) {
          zoneID.ownerRecordName = ownerRecordName;
        }
        options = {
          zoneID: zoneID
        };
      }

      return database.deleteRecords(recordName, options)
        .then(function(response) {
          if (response.hasErrors) {

            // Handle the errors in your app.
            throw response.errors[0];

          } else {
            var deletedRecord = response.records[0];

            // Render the deleted record.
            return renderDeletedRecord(deletedRecord);
          }
        });
    }
  };

  var fetchRecordSample = {
    title: 'fetchRecords',
    form: createRecordIDForm(),
    run: runSampleCode,
    sampleCode: function demoFetchRecord(
      databaseScope, recordName, zoneName, ownerRecordName
    ) {
      var container = CloudKit.getDefaultContainer();
      var database = container.getDatabaseWithDatabaseScope(
        CloudKit.DatabaseScope[databaseScope]
      );

      var zoneID, options;

      if (zoneName) {
        zoneID = {
          zoneName: zoneName
        };
        if (ownerRecordName) {
          zoneID.ownerRecordName = ownerRecordName;
        }
        options = {
          zoneID: zoneID
        };
      }

      return database.fetchRecords(recordName, options)
        .then(function(response) {
          if (response.hasErrors) {

            // Handle the errors in your app.
            throw response.errors[0];

          } else {
            var record = response.records[0];

            // Render the fetched record.
            return renderRecord(record, zoneID, databaseScope);
          }
        });
    }
  };

  return [saveRecordSample, deleteRecordSample, fetchRecordSample];

})();
