// Copyright 2022 Google LLC
// https://developer.chrome.com/docs/extensions/reference/cookies/
if(document.readyState !== 'complete') {
  window.addEventListener('load',afterWindowLoaded);
} else {
  afterWindowLoaded();
}

// config information
data = [
  {"id":1, "name": "Eurosys", "source": 'source:"Conference on Computer Systems"'}, // can't include "European"
  {"id":2, "name": "NSDI", "source": "source:NSDI"},
  {"id":3, "name": "OSDI", "source": "source:OSDI"},
  {"id":4, "name": "ATC", "source": 'source:"USENIX annual technical conference"'},
  {"id":5, "name": "VLDB", "source": "source:VLDB"},
  {"id":6, "name": "SOSP", "source": 'source:"Symposium on Operating Systems Principles"'},
  {"id":7, "name": "SIGMOD", "source": 'source:"International Conference on Management of Data"'},
]

// button and input on google scholar home page or search page
var button = document.getElementById("gs_hdr_tsb");
var inputElements = document.querySelectorAll("#gs_hdr_frm input");
var lastInputElement = inputElements[inputElements.length - 1];

// ul wrapper all checkbox - on search page
var ulElements = document.querySelectorAll("#gs_bdy_sb_in ul.gs_bdy_sb_sec");
var lastUlElement = ulElements[ulElements.length - 1];

// source:'xxx' or source:'yyy'
function getFilterString() {
  var ns = "";
  for (var i = 0; i < data.length; i++) {
    conf = data[i];
    var checkbox = document.getElementById('custom-extension-checkbox-'+conf["id"]);
    if (checkbox.checked){
      if (ns.length == 0) {
        ns = conf["source"]
      } else {
        ns = ns + " OR " + conf["source"]
      }
    }
  }
  return ns
}

function setCookie(name,value,days) {
  var expires = "";
  if (days) {
      var date = new Date();
      date.setTime(date.getTime() + (days*24*60*60*1000));
      expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}
function getCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(';');
  for(var i=0;i < ca.length;i++) {
      var c = ca[i];
      while (c.charAt(0)==' ') c = c.substring(1,c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
  }
  return null;
}
function eraseCookie(name) {   
  document.cookie = name+'=; Max-Age=-99999999;';  
}

// output: "1,2,3"
function getSelectedIds() {
  var ns = "";
  for (var i = 0; i < data.length; i++) {
    conf = data[i];
    var checkbox = document.getElementById('custom-extension-checkbox-'+conf["id"]);
    if (checkbox.checked){
      if (ns.length == 0) {
        ns = conf["id"]
      } else {
        ns = ns + "," + conf["id"]
      }
    }
  }
  return ns
}

// reset all checkboxs based on cookies
function resetSelected(){
  for (var i = 0; i < data.length; i++) {
    conf = data[i];
    var checkbox = document.getElementById('custom-extension-checkbox-'+conf["id"]);
    if (checkbox)
      checkbox.checked = false;
  }

  var ns = getCookie("_selected_conf")
  if (ns){
    var ids = ns.split(",");
    for (var i=0; i<ids.length; i++){
      var checkbox = document.getElementById('custom-extension-checkbox-'+ids[i].trim());
      if (checkbox)
        checkbox.checked = true;
    }
  }
}

// remove all after "source:"
function removeSuffix(inS) {
  var pattern = "source:";
  var index = inS.indexOf(pattern);
  if (index !== -1) {
    inS = inS.slice(0, index);
  }

  return inS.trim()
}

// select all/uncheck all
function groupCheckOption(checked) {
  var elements = document.querySelectorAll('[id^="custom-extension-checkbox-"]');
  for (var i = 0; i < elements.length; i++) {
    elements[i].checked = checked;
  }
}

function sleep(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

// https://stackoverflow.com/questions/43233115/chrome-content-scripts-arent-working-domcontentloaded-listener-does-not-execut
function afterWindowLoaded(){
  // wrapper of the search button!
  button.addEventListener("click", function() {
    setCookie("_selected_conf", getSelectedIds(), 100)
    lastInputElement.value = removeSuffix(lastInputElement.value) + " " + getFilterString();
  });

  if (lastUlElement) {
    // add a total checkbox
    var checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = false;
    checkbox.id = 'custom-extension-checkbox';
    var lineBreak = document.createElement("br");
    var horizontalBar = document.createElement('hr');
    lastUlElement.appendChild(horizontalBar);
    lastUlElement.appendChild(checkbox);
    lastUlElement.appendChild(lineBreak);
    checkbox.addEventListener('change', function() {
      if (this.checked) {
        groupCheckOption(true)
      } else {
        groupCheckOption(false)
      }
    });
    
    // add conference checkbox
    for (var i = 0; i < data.length; i++) {
      conf = data[i];
      var checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = true;
      checkbox.id = 'custom-extension-checkbox-'+conf["id"];
      var label = document.createElement('label');
      label.htmlFor = 'custom-extension-checkbox';
      label.textContent = conf["name"];

      lastInputElement.value = "";
      checkbox.addEventListener("click", function() {
        console.log("checkbox click");
      });
      var lineBreak = document.createElement("br");
      lastUlElement.appendChild(checkbox);
      lastUlElement.appendChild(label);
      lastUlElement.appendChild(lineBreak);
    }
  }

  sleep(10).then(() => {
    resetSelected()
    lastInputElement.value = removeSuffix(lastInputElement.value)
  });

  setInterval(function() {
    lastInputElement.value = removeSuffix(lastInputElement.value)
  }, 1000);
}