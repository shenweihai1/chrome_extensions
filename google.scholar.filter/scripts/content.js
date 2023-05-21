// Copyright 2022 Google LLC
if(document.readyState !== 'complete') {
  window.addEventListener('load',afterWindowLoaded);
} else {
  afterWindowLoaded();
}

data = [
  {"id":1, "name": "Eurosys", "source": 'source:"Conference on Computer Systems" AND site:acm.org'}, // can't include "European"
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

// ul wrapper all checkbox
var ulElements = document.querySelectorAll("#gs_bdy_sb_in ul.gs_bdy_sb_sec");
var lastUlElement = ulElements[ulElements.length - 1];

function getFilterString() {
  var ns = "";
  for (var i = 0; i < data.length; i++) {
    conf = data[i];
    var checkbox = document.getElementById('custom-extension-checkbox-'+conf["id"]);
    if (checkbox.checked){
      if (ns.length == 0) {
        ns = "(" + conf["source"] + ")"
      } else {
        ns = ns + " OR " + "(" + conf["source"] + ")"
      }
    }
  }
  return ns
}

function removeSuffix(inS) {
  var pattern = "source:";
  var index = inS.indexOf(pattern);
  if (index !== -1) {
    inS = inS.slice(0, index);
  }
  return inS.trim()
}

function sleep(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

// https://stackoverflow.com/questions/43233115/chrome-content-scripts-arent-working-domcontentloaded-listener-does-not-execut
function afterWindowLoaded(){
  button.addEventListener("click", function() {
    lastInputElement.value = removeSuffix(lastInputElement.value) + " " + getFilterString();
  });


  if (lastUlElement) {
    // 

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
    lastInputElement.value = removeSuffix(lastInputElement.value)
  });
}