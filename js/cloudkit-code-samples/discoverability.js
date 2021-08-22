CKCatalog.tabs['discoverability'] = (function() {

  var renderUserIdentity = function(title, userIdentity) {

    // Add the user id to the recordName input form for convenience.
    if (userIdentity.userRecordName) {
      recordNameInputForm.fields['record-name'].value = userIdentity.userRecordName;
    }
    // Now render the object.
    return CKCatalog.renderUtils.renderRecord(title, userIdentity);
  };

  var createUserIdentitiesTable = function() {
    return new CKCatalog.Table([
        'userRecordName', 'nameComponents', 'lookupInfo'
      ]).setTextForUndefinedValue('PRIVATE')
      .setTextForEmptyRow('No discovered users');
  };

  var renderUserIdentities = function(title, userIdentities) {
    var table = createUserIdentitiesTable();
    return CKCatalog.renderUtils.renderRecords(table, title, userIdentities,
      ['userRecordName', 'nameComponents', 'lookupInfo']
    );
  };

  var emailInputForm = (new CKCatalog.Form)
    .addInputField({
      type: 'email',
      placeholder: 'Email address',
      name: 'email',
      label: 'emailAddress:',
      value: 'tavitianp@icloud.com'
    });

  var recordNameInputForm = (new CKCatalog.Form)
    .addInputField({
      placeholder: 'User record name',
      name: 'record-name',
      label: 'userRecordName:'
    });


  var fetchUserIdentitySample = {
    title: 'fetchCurrentUserIdentity',
    sampleCode: function demoFetchCurrentUserIdentity() {
      var container = CloudKit.getDefaultContainer();

      // Fetch user's info.
      return container.fetchCurrentUserIdentity()
        .then(function(userIdentity) {
          var title = 'UserIdentity for current ' +
            (userIdentity.nameComponents ? 'discoverable' : 'non-discoverable') +
            ' user:';

          // Render the user's identity.
          return renderUserIdentity(title, userIdentity);
        });
    }

  };

  var discoverAllUserIdentitiesSample = {
    title: 'discoverAllUserIdentities',
    sampleCode: function demoDiscoverAllUserIdentities() {
      var container = CloudKit.getDefaultContainer();

      return container.discoverAllUserIdentities().then(function(response) {
        if (response.hasErrors) {

          // Handle the errors in your app.
          throw response.errors[0];

        } else {
          var title = 'Discovered users from your iCloud contacts:';

          // response.users is an array of UserIdentity objects.
          return renderUserIdentities(title, response.users);

        }
      });
    }
  };

  var discoverUserIdentityWithEmailAddressSample = {
    title: 'discoverUserIdentityWithEmailAddress',
    form: emailInputForm,
    run: function() {
      var emailAddress = this.form.getFieldValue('email');
      return this.sampleCode(emailAddress);
    },
    sampleCode: function demoDiscoverUserIdentityWithEmailAddress(emailAddress) {
      var container = CloudKit.getDefaultContainer();

      return container.discoverUserIdentityWithEmailAddress(emailAddress)
        .then(function(response) {
          if (response.hasErrors) {

            // Handle the errors in your app.
            throw response.errors[0];

          } else {
            var title = 'Discovered users by email address:';
            return renderUserIdentity(title, response.users[0]);
          }
        });
    }
  };

  var discoverUserIdentityWithUserRecordNameSample = {
    title: 'discoverUserIdentityWithUserRecordName',
    form: recordNameInputForm,
    run: function() {
      var recordName = this.form.getFieldValue('record-name');
      return this.sampleCode(recordName);
    },
    sampleCode: function demoDiscoverUserIdentityWithUserRecordName(userRecordName) {
      var container = CloudKit.getDefaultContainer();

      return container.discoverUserIdentityWithUserRecordName(userRecordName)
        .then(function(response) {
          if (response.hasErrors) {

            // Handle the errors in your app.
            throw response.errors[0];

          } else {
            var title = 'Discovered users by record name:';
            return renderUserIdentity(title, response.users[0]);
          }
        });
    }
  };

  return [
    fetchUserIdentitySample,
    discoverAllUserIdentitiesSample,
    discoverUserIdentityWithEmailAddressSample,
    discoverUserIdentityWithUserRecordNameSample
  ];

})();
