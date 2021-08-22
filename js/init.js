window.addEventListener('cloudkitloaded', function() {
  var getParameterByName = CKCatalog.QueryString.getParameterByName;
  var containerId = getParameterByName('container') || 'iCloud.cloud.tavitian.commute';
  var apiToken = getParameterByName('apiToken') || '344dfcee14b597cd1476f3748e35bdcb0cff55bd2dc46432b6a243c06628ee7d';
  var environment = getParameterByName('environment') || 'production';
  var privateDBPartition = getParameterByName('privateDBPartition');
  var publicDBPartition = getParameterByName('publicDBPartition');
  var username = getParameterByName('user');
  var useApiTokenAuth = !privateDBPartition || !publicDBPartition;
  var containerConfig = {
    containerIdentifier: containerId,
    environment: environment,
    apnsEnvironment: environment
  };
  var services = {
    logger: console
  };
  if (useApiTokenAuth) {
    containerConfig.apiTokenAuth = {
      apiToken: apiToken,
      persist: true
    };
  } else {
    containerConfig.auth = false;
    containerConfig.privateDatabasePartition = privateDBPartition.replace('dashboardws', 'databasews');
    containerConfig.publicDatabasePartition = publicDBPartition.replace('dashboardws', 'databasews');
    services.fetch = function(url, options, fetch) {
      if (!/feedbackws/.test(url)) {
        options.credentials = 'include';
      }
      return fetch(url, options);
    };
  }
  try {
    CloudKit.configure({
      containers: [containerConfig],
      services: services
    });
    if (useApiTokenAuth) {
      CKCatalog.tabs['authentication'][0].sampleCode().catch(CKCatalog.dialog.showError);
    } else {
      document.querySelector('.menu-item-container.authentication').style.display = 'none';
      if (username) {
        document.getElementById('username').textContent = username;
      }
    }
    document.getElementById('config-container').textContent = containerId;
    document.getElementById('config-environment').textContent = environment;
    document.getElementById('config-bar').classList.add('alert-showing');
    document.getElementById('page').parentNode.classList.add('alert-showing');
  } catch (e) {
    CKCatalog.dialog.showError(e);
  }
});
