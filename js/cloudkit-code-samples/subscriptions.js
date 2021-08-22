CKCatalog.tabs['subscriptions'] = (function() {

  var subscriptionTypeForm = (new CKCatalog.Form)
    .addSelectField({
      name: 'type',
      label: 'subscriptionType:',
      options: [{
          value: 'zone',
          selected: true
        },
        {
          value: 'query'
        }
      ]
    })
    .addInputField({
      placeholder: 'Zone name',
      name: 'zone',
      label: 'zoneName:',
      value: 'myCustomZone'
    })
    .addInputField({
      placeholder: 'Record type',
      name: 'record-type',
      label: 'recordType:',
      value: 'Items',
      hidden: true
    })
    .addCheckboxes({
      label: 'firesOn:',
      hidden: true,
      checkboxes: [{
          name: 'fires-on-create',
          label: 'create',
          value: 'create',
          checked: true
        },
        {
          name: 'fires-on-update',
          label: 'update',
          value: 'update',
          checked: true
        },
        {
          name: 'fires-on-delete',
          label: 'delete',
          value: 'delete',
          checked: true
        }
      ]
    })
    .addQueryBuilder({
      name: 'filter-by',
      label: 'filterBy:',
      hidden: true
    });

  var createSubscriptionIDForm = function() {
    return (new CKCatalog.Form)
      .addInputField({
        name: 'subscription-id',
        label: 'subscriptionID:',
        placeholder: 'Subscription ID'
      });
  };

  var fetchSubscriptionSubscriptionIDForm = createSubscriptionIDForm();
  var deleteSubscriptionSubscriptionIDForm = createSubscriptionIDForm();

  var subscriptionTypeField = subscriptionTypeForm.fields['type'];
  var zoneNameField = subscriptionTypeForm.fields['zone'];
  var firesOnFields = {
    create: subscriptionTypeForm.fields['fires-on-create'],
    update: subscriptionTypeForm.fields['fires-on-update'],
    delete: subscriptionTypeForm.fields['fires-on-delete']
  };

  subscriptionTypeField.addEventListener('change', function() {
    var isQuerySubscription = subscriptionTypeField.value === 'query';
    subscriptionTypeForm.toggleRow('fires-on-create', isQuerySubscription);
    subscriptionTypeForm.toggleRow('record-type', isQuerySubscription);
    subscriptionTypeForm.toggleFilters('filter-by', isQuerySubscription);
  });

  var runSampleCode = function() {
    var subscriptionID = this.form.getFieldValue('subscription-id');
    return this.sampleCode(subscriptionID);
  };

  var renderSubscriptions = function(title, subscriptions) {
    var content = document.createElement('div');
    var heading = document.createElement('h2');
    heading.textContent = title;
    var table = new CKCatalog.Table([
      'subscriptionID', 'subscriptionType', 'zoneID', 'firesOn', 'query', 'zoneWide'
    ]).setTextForEmptyRow('No subscriptions');
    if (subscriptions.length) {
      subscriptions.forEach(function(subscription, i) {
        if (i === 0) {

          // Populate subscription ID form fields with this ID for convenience.
          fetchSubscriptionSubscriptionIDForm.fields['subscription-id'].value = subscription.subscriptionID;
          deleteSubscriptionSubscriptionIDForm.fields['subscription-id'].value = subscription.subscriptionID;

        }
        table.appendRow([
          subscription.subscriptionID,
          subscription.subscriptionType,
          subscription.zoneID,
          subscription.firesOn,
          subscription.query,
          subscription.zoneWide
        ]);
      });
    } else {
      table.appendRow([]);
    }
    content.appendChild(heading);
    content.appendChild(table.el);
    return content;
  };

  var renderSubscription = function(title, object) {
    var content = document.createElement('div');
    var heading = document.createElement('h2');
    heading.textContent = title;
    var table = new CKCatalog.Table().renderObject(object);
    content.appendChild(heading);
    content.appendChild(table.el);
    return content;
  };

  var saveSubscriptionSample = {
    title: 'saveSubscriptions',
    form: subscriptionTypeForm,
    run: function() {
      var subscriptionType = subscriptionTypeField.value;
      var zoneName = zoneNameField.value;
      var recordType;
      var firesOn;
      var filterBy;
      if (subscriptionType === 'query') {
        firesOn = [];
        recordType = this.form.getFieldValue('record-type');
        for (var k in firesOnFields) {
          if (firesOnFields[k].checked) {
            firesOn.push(firesOnFields[k].value);
          }
        }
        filterBy = this.form.getFieldValue('filter-by');
      }
      return this.sampleCode(subscriptionType, zoneName, recordType, firesOn, filterBy);
    },
    sampleCode: function demoSaveSubscriptions(
      subscriptionType, zoneName, recordType, firesOn, filterBy
    ) {
      var container = CloudKit.getDefaultContainer();
      var privateDB = container.privateCloudDatabase;

      var subscription = {
        subscriptionType: subscriptionType
      };

      // If no zoneName is supplied for a query subscription,
      // it will be zone-wide.
      if (zoneName) {
        subscription.zoneID = {
          zoneName: zoneName
        };
      }

      if (subscriptionType === 'query' && firesOn) {

        subscription.firesOn = firesOn; // An array
        // like [ 'create', 'update', 'delete' ]

        subscription.query = { // A query object.
          recordType: recordType
        };

        if (filterBy) {

          subscription.query.filterBy = filterBy.map(function(filter) {
            filter.fieldValue = {
              value: filter.fieldValue
            };
            return filter;
          });
        }

      }

      return privateDB.saveSubscriptions(subscription).then(function(response) {
        if (response.hasErrors) {

          // Handle them in your app.
          throw response.errors[0];

        } else {
          var title = 'Created subscription:';
          return renderSubscription(title, response.subscriptions[0]);
        }
      });
    }
  };

  var deleteSubscriptionSample = {
    title: 'deleteSubscriptions',
    form: deleteSubscriptionSubscriptionIDForm,
    run: runSampleCode,
    sampleCode: function demoDeleteSubscriptions(subscriptionID) {
      var container = CloudKit.getDefaultContainer();
      var privateDB = container.privateCloudDatabase;

      var subscription = {
        subscriptionID: subscriptionID
      };

      return privateDB.deleteSubscriptions(subscription).then(function(response) {
        if (response.hasErrors) {

          // Handle the error.
          throw response.errors[0];

        } else {
          var title = 'Deleted subscription:';
          return renderSubscription(title, response.subscriptions[0]);
        }
      });
    }
  };

  var fetchSubscriptionSample = {
    title: 'fetchSubscriptions',
    form: fetchSubscriptionSubscriptionIDForm,
    run: runSampleCode,
    sampleCode: function demoFetchSubscriptions(subscriptionID) {
      var container = CloudKit.getDefaultContainer();
      var privateDB = container.privateCloudDatabase;

      var subscription = {
        subscriptionID: subscriptionID
      };

      return privateDB.fetchSubscriptions(subscription).then(function(response) {
        if (response.hasErrors) {

          // Handle the error.
          throw response.errors[0];

        } else {
          var title = 'Fetched subscription:';
          return renderSubscription(title, response.subscriptions[0]);
        }
      });
    }
  };

  var fetchAllSubscriptionsSample = {
    title: 'fetchAllSubscriptions',
    sampleCode: function demoFetchAllSubscriptions() {
      var container = CloudKit.getDefaultContainer();
      var privateDB = container.privateCloudDatabase;

      return privateDB.fetchAllSubscriptions().then(function(response) {
        if (response.hasErrors) {

          // Handle the error.
          throw response.errors[0];

        } else {
          var title = 'Subscriptions:';
          return renderSubscriptions(title, response.subscriptions);
        }
      });
    }
  };

  return [saveSubscriptionSample, deleteSubscriptionSample, fetchSubscriptionSample, fetchAllSubscriptionsSample];

})();
