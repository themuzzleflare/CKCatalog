CKCatalog.dialog = (function() {
  var self = {};
  var el = document.getElementById('dialog');
  el.setAttribute('tabindex', '0');
  el.addEventListener('click', function(ev) {
    var target = ev.target;
    if (target && target.id === 'dialog' && target.classList.contains('dismissable')) {
      self.hide();
    }
  });
  document.addEventListener('keyup', function(ev) {
    var code = ev.which || ev.keyCode;
    if (code == 27 && el.classList.contains('dismissable')) {
      self.hide();
    }
  });
  var textEl = document.getElementById('dialog-text');
  self.hide = function() {
    el.classList.add('hide');
    el.classList.remove('dismissable');
  };
  var createDismissButton = function() {
    var dismissBtn = document.createElement('button');
    dismissBtn.className = 'link';
    dismissBtn.textContent = 'Close';
    dismissBtn.onclick = self.hide;
    dismissBtn.setAttribute('tabindex', '1');
    return dismissBtn;
  };
  var actions = document.createElement('div');
  actions.className = 'actions';
  actions.appendChild(createDismissButton());
  var customDismissButton = document.createElement('button');
  customDismissButton.className = 'link default-action';
  customDismissButton.setAttribute('tabindex', '0');
  var customActions = document.createElement('div');
  customActions.className = 'actions';
  customActions.appendChild(createDismissButton());
  customActions.appendChild(customDismissButton);
  var positionTextEl = function() {
    var rect = textEl.getBoundingClientRect();
    textEl.style.left = 'calc(50% - ' + (rect.width / 2) + 'px)';
    textEl.style.top = 'calc(50% - ' + (rect.height / 2) + 'px)';
  };
  self.show = function(textOrElement, dismissButtonOptions) {
    el.classList.remove('hide');
    el.focus();
    if (typeof textOrElement === 'string') {
      textEl.innerHTML = textOrElement;
    } else {
      textEl.innerHTML = '';
      textEl.appendChild(textOrElement);
    }
    if (dismissButtonOptions) {
      textEl.classList.remove('no-actions');
      el.classList.add('dismissable');
      customDismissButton.textContent = dismissButtonOptions.title;
      customDismissButton.onclick = function() {
        self.hide();
        dismissButtonOptions.action && dismissButtonOptions.action();
      };
      textEl.appendChild(customActions);
    } else {
      textEl.classList.add('no-actions');
    }
    positionTextEl();
  };
  self.showError = function(error) {
    el.classList.remove('hide');
    el.classList.add('dismissable');
    textEl.classList.remove('no-actions');
    if (error.ckErrorCode) {
      textEl.innerHTML = '<h2>Error: <span class="error-code">' + error.ckErrorCode + '</span></h2>' +
        '<p class="error">' +
        (error.reason ? 'Reason: ' + error.reason : (error.message || 'An error occurred.')) +
        '</p>';
    } else {
      var message = error.message || 'An unexpected error occurred.';
      textEl.innerHTML = '<h2>Error</h2>' +
        '<p class="error">' + message + '</p>';
    }
    textEl.appendChild(actions);
    positionTextEl();
  };
  return self;
})();
