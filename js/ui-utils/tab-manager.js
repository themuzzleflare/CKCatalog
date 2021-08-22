CKCatalog.tabManager = (function() {
  var self = {};
  var page = document.getElementById('page');
  var scrollView = page.parentNode;
  var menuItems = document.querySelectorAll('.menu-item');
  var runButton = document.getElementById('run-button');
  var expandButton = document.getElementById('expand-left-column');
  var contractButton = document.getElementById('contract-left-column');
  var leftPane = document.getElementById('left-pane');
  var subTabMenuItems;
  var selectedTabName;
  var selectedSubTabIndex = 0;
  var subTabMenus = {};
  var tabs = {};
  var defaultRoute = ['readme'];
  leftPane.addEventListener('transitionend', function() {
    if (leftPane.classList.contains('expanded')) {
      contractButton.classList.remove('hide');
      leftPane.style.overflow = 'visible';
    } else {
      expandButton.classList.remove('hide');
    }
  });
  var expandLeftPane = function() {
    leftPane.classList.add('expanded');
    expandButton.classList.add('hide');
  };
  var contractLeftPane = function() {
    leftPane.classList.remove('expanded');
    contractButton.classList.add('hide');
    leftPane.style.overflow = 'hidden';
    for (var i = 0; i < menuItems.length; i++) {
      menuItems[i].parentNode.classList.remove('expanded');
    }
  };
  window.addEventListener('resize', function() {
    if (window.outerWidth < 1140) {
      contractLeftPane();
    }
  });
  expandButton.onclick = expandLeftPane;
  contractButton.onclick = contractLeftPane;
  leftPane.addEventListener('click', function(e) {
    var node = e.target;
    if (!e.target.classList.contains('caret') && !e.target.classList.contains('tab-menu-item')) {
      node = e.target.parentNode.parentNode;
    }
    if (node.classList.contains('caret')) {
      node.classList.toggle('expanded');
      e.preventDefault();
      if (leftPane.offsetWidth < 50) {
        expandLeftPane();
      }
    }
  });
  var codeHighlightingIsInitialized = false;
  var highlightCode = function() {
    if (typeof hljs !== 'undefined') {
      codeHighlightingIsInitialized = true;
      try {
        var codeSamples = document.querySelectorAll('pre code');
        for (var j = 0; j < codeSamples.length; j++) {
          hljs.highlightBlock(codeSamples[j]);
        }
      } catch (e) {
        console.error('Unable to highlight sample code: ' + e.message);
      }
    }
  };
  var runCode = function() {
    if (typeof CloudKit === 'undefined') {
      CKCatalog.dialog.showError(new Error('The variable CloudKit is not defined. The CloudKit JS library may still be loading or may have failed to load.'));
      return;
    }
    if (selectedTabName) {
      var selectedTab = CKCatalog.tabs[selectedTabName];
      var subTab = selectedTab[selectedSubTabIndex];
      CKCatalog.dialog.show('Executing…');
      var run = subTab.run ? subTab.run : subTab.sampleCode;
      try {
        run.call(subTab).then(function(content) {
          CKCatalog.dialog.hide();
          if (content && content instanceof Node) {
            subTab.content.replaceChild(content, subTab.content.firstChild);
            var heading = document.createElement('h1');
            heading.textContent = 'Result';
            content.insertBefore(heading, content.firstChild);
          }
          var padding = 39;
          var change = subTab.content.offsetTop - padding;
          subTab.content.style.minHeight = (scrollView.offsetHeight - padding) + 'px';
          var start = scrollView.scrollTop;
          var startTime = 0;
          var duration = 500;
          var easingValue = function(t) {
            var tc = (t /= duration) * t * t;
            return start + change * (tc);
          };
          var animateScroll = function(timestamp) {
            if (!startTime) {
              startTime = timestamp;
            }
            var progress = timestamp - startTime;
            scrollView.scrollTop = easingValue(Math.min(progress, duration));
            if (progress < duration) {
              window.requestAnimationFrame(animateScroll);
            } else {
              var results = subTab.content.firstChild;
              results.className = 'results';
            }
          };
          window.requestAnimationFrame(animateScroll);
        }, CKCatalog.dialog.showError);
      } catch (e) {
        CKCatalog.dialog.showError(e);
      }
    }
  };
  runButton.onclick = runCode;
  runButton.onmousedown = function() {
    runButton.parentNode.classList.add('active');
  };
  runButton.onmouseup = function() {
    runButton.parentNode.classList.remove('active');
  };
  var createSampleCodeSegment = function(tabSegment, selected) {
    var el = document.createElement('div');
    el.className = 'page-segment' + (selected ? ' selected' : '');
    el.appendChild(tabSegment.description);
    if (tabSegment.sampleCode) {
      var sampleCode = document.createElement('pre');
      sampleCode.className = 'javascript sample-code';
      var sampleCodeString = tabSegment.sampleCode.toString();
      var indentationCorrection = sampleCodeString.lastIndexOf('}') - sampleCodeString.lastIndexOf('\n') - 1;
      var regExp = new RegExp('\n[ ]{' + indentationCorrection + '}', 'g');
      sampleCode.innerHTML = '<code>' + sampleCodeString.replace(regExp, '\n') + '</code>';
      if (!tabSegment.content) {
        tabSegment.content = document.createElement('div');
        tabSegment.content.className = 'content';
        tabSegment.content.innerHTML = '<div class="results"></div>';
      }
      if (tabSegment.form) {
        tabSegment.form.onSubmit(runCode);
        var formContainer = document.createElement('div');
        formContainer.className = 'input-fields';
        formContainer.appendChild(tabSegment.form.el);
        el.appendChild(formContainer);
        sampleCode.classList.add('no-top-border');
      }
      el.appendChild(sampleCode);
      el.appendChild(tabSegment.content);
    }
    return el;
  };
  var createSubTabMenu = function() {
    var menu = document.createElement('div');
    menu.className = 'tab-menu ';
    return menu;
  };
  var getTransformedTitleForHash = function(title) {
    return title.replace(/( |\.)/g, '-');
  };
  var createSubTabMenuItem = function(name) {
    var item = document.createElement('div');
    item.className = 'tab-menu-item';
    item.textContent = name;
    item.onclick = function() {
      window.location.hash = item.parentNode.parentNode.querySelector('a.menu-item').getAttribute('href') +
        '/' + getTransformedTitleForHash(name);
      scrollView.scrollTop = 0;
    };
    return item;
  };
  for (var tabName in CKCatalog.tabs) {
    if (CKCatalog.tabs.hasOwnProperty(tabName)) {
      if (CKCatalog.tabs[tabName].length > 1) {
        var subMenuContainer = document.querySelector('.left-pane .menu-items .menu-item-container.' + tabName);
        var subTabMenu = createSubTabMenu(tabName);
        subTabMenus[tabName] = [];
        CKCatalog.tabs[tabName].forEach(function(subTab) {
          subTabMenus[tabName].push(subTabMenu.appendChild(createSubTabMenuItem(subTab.title)));
        });
        subMenuContainer.appendChild(subTabMenu);
        subMenuContainer.classList.add('caret');
      }
    }
  }
  var getRoute = function() {
    var hash = window.location.hash;
    if (!hash || hash[0] !== '#') return defaultRoute;
    return hash.substr(1).split('/') || defaultRoute;
  };
  var selectTab = function() {
    var route = getRoute();
    var tabName = route[0];
    var subTabTitle = route[1];
    var tab = CKCatalog.tabs[tabName];
    var subTabIndex = tab && tab.reduce(function(value, codeSample, index) {
      var title = codeSample.title;
      if (title && getTransformedTitleForHash(title) === subTabTitle) {
        return index;
      }
      return value;
    }, subTabTitle ? -1 : 0);
    if (!tab || subTabIndex < 0) {
      tabName = 'not-found';
      tab = CKCatalog.tabs[tabName];
      subTabIndex = 0;
    }
    if (tabName !== selectedTabName) {
      if (tab[0] && tab[0].sampleCode) {
        runButton.disabled = false;
        runButton.parentNode.classList.remove('disabled');
      } else {
        runButton.disabled = true;
        runButton.parentNode.classList.add('disabled');
      }
      for (var i = 0; i < menuItems.length; i++) {
        var menuItem = menuItems[i];
        if (menuItem.attributes.href.value === '#' + tabName) {
          menuItem.parentNode.classList.add('selected');
        } else {
          menuItem.parentNode.classList.remove('selected');
        }
      }
      subTabMenuItems = subTabMenus[tabName];
      if (!tabs.hasOwnProperty(tabName)) {
        tabs[tabName] = document.createElement('div');
        var pageSegments = tabs[tabName];
        pageSegments.className = 'page-segments';
        var descriptions = document.getElementById(tabName);
        tab.forEach(function(tabSegment, index) {
          if (!tabSegment.description) {
            tabSegment.description = descriptions.firstElementChild;
          }
          pageSegments.appendChild(createSampleCodeSegment(tabSegment, index === selectedSubTabIndex));
        });
        page.replaceChild(pageSegments, page.firstElementChild);
        highlightCode();
      } else {
        page.replaceChild(tabs[tabName], page.firstElementChild);
      }
      selectedTabName = tabName;
    }
    if (subTabIndex >= tabs[tabName].childElementCount || subTabIndex < 0) {
      subTabIndex = 0;
    }
    var subTabs = tabs[tabName].childNodes;
    for (var index = 0; index < subTabs.length; index++) {
      if (index === subTabIndex) {
        subTabs[index].classList.add('selected');
      } else {
        subTabs[index].classList.remove('selected');
      }
      if (subTabMenuItems) {
        var subTabMenuItem = subTabMenuItems[index];
        if (index === subTabIndex) {
          subTabMenuItem.classList.add('selected');
        } else {
          subTabMenuItem.classList.remove('selected');
        }
      }
    }
    selectedSubTabIndex = subTabIndex;
    if (leftPane.classList.contains('expanded')) {
      setTimeout(contractLeftPane, 300);
    }
    scrollView.scrollTop = 0;
  };
  window.addEventListener('hashchange', selectTab);
  selectTab();
  self.initializeCodeHighlighting = function() {
    var link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('href', 'https://cdn.apple-cloudkit.com/cloudkit-catalog/xcode.css');
    document.getElementsByTagName('head')[0].appendChild(link);
    link.onload = function() {
      if (!codeHighlightingIsInitialized) {
        highlightCode();
      }
    }
  };
  self.navigateToCodeSample = function(route, formFields) {
    if (!route) return;
    var parsedRoute = route.split('/');
    var tab = CKCatalog.tabs[parsedRoute[0]];
    if (!tab) return;
    var subtabTitle = parsedRoute[1];
    var subtab = tab.find(function(sampleCode) {
      return sampleCode.title === subtabTitle;
    }) || tab[0];
    if (subtab.form) {
      subtab.form.reset();
      if (formFields) {
        for (var key in formFields) {
          if (formFields.hasOwnProperty(key) && formFields[key] !== undefined && formFields[key] !== null) {
            subtab.form.setFieldValue(key, formFields[key]);
          }
        }
      }
    }
    window.location.hash = route;
    if (scrollView.scrollTop) {
      scrollView.scrollTop = 0;
    }
  };
  return self;
})();
