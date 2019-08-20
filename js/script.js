var logPage = document.getElementById("log"),
    inputPage = document.getElementById("input"),
    aboutPage = document.getElementById("about"),
    navButtons = document.querySelectorAll("nav button"),
    selectedNavBtn = document.querySelector('.selected'),
    meds = [];

// Checks local storage to see if anything has been saved and if it has parses it and stores it in meds. Also calls printTable.
function init() {
  // Pull meds from localStorage if it exists
  if (typeof localStorage["meds"] != "undefined") {
    meds = JSON.parse(localStorage["meds"]);
    // Checks if it is a new day to know if toggles should be reset
    if (new Date().getDate() != parseInt(localStorage["lastLogin"])) {
      for (var i = 0; i < meds.length; i++) {
        meds[i]["active"] = false;
      }
    }
    printTable();
  }
  // Update last login
  localStorage["lastLogin"] = new Date().getDate();
  document.getElementById('searchBar').addEventListener("keypress", searchDrug);
}

// Creates a table for the input medication page as well as the log page
function printTable() {
  var table1,
      table2,
      toggle = '<div class="container"><div class="slider" class="active" onclick="Animate(this)"></div></div>',
      button = '<button type="button">Delete</button>',
      i;
  // Build table1 for the log page with toggles
  table1 = '<table><th>View Info</th><th class="medList smpadding">Medication</th><th class="medList">Dose</th><th>Taken</th>';
  for (i = 0; i < meds.length; i++) {
    if(meds[i]["id"] !== undefined){
          var id = meds[i]["id"]+"";
          var med = meds[i]["med"]+"";
          table1 += '<tr><td class="pointer" onClick="viewInfo(\'' + id + '\',  \'' + med + '\')"> <div class="medbtns">i</div></td>';
      } else {
          table1 += "<tr>";
      }
    table1 += "<td>" + meds[i]["med"] + "</td>";
    table1 += "<td>" + meds[i]["dose"] + "mg</td>";
    table1 += "<td class='padding'>" + '<div class="container"><div class="slider';
    if (meds[i]["active"]) {
      table1 += ' active';
    }
    table1 += '" class="active" onclick="Animate(this)"></div></div>' + "</td></tr>";

  }
  table1 += "</table>";
  document.getElementById("1").innerHTML = table1;

  // Build table2 for the Input medication page with delete button
  table2 = "<table><th>Medication</th><th>Dose</th>";
  for (i = 0; i < meds.length; i++) {
      table2 += "<tr><td>" + meds[i]["med"] + "</td>";
      table2 += "<td>" + meds[i]["dose"] + "mg</td>";
      table2 += "<td class='pointer' onClick='deleteMed(this)'><div class='medbtns'>x</div></td></tr>";
    }
    table2 += "</table>";
    document.getElementById("2").innerHTML = table2;

    // Displays how many medications have been saved
    document.getElementById("saves").innerHTML = meds.length + " Medication(s) saved.";
}

function deleteMed(obj){
	var i = obj.parentNode.rowIndex-1;
    meds.splice(i, 1);
    localStorage["meds"] = JSON.stringify(meds);
    printTable();
}

function viewInputPage() {
    selectedNavBtn.className = "";
    inputPage.style.left = "0px";
    logPage.style.left = "110%";
    aboutPage.style.left = "110%";
    navButtons[0].className = "selected";
    selectedNavBtn = navButtons[0];
}

function viewLogPage() {
    selectedNavBtn.className = "";
    inputPage.style.left = "-110%";
    logPage.style.left = "0px";
    aboutPage.style.left = "110%";
    navButtons[1].className = "selected";
    selectedNavBtn = navButtons[1];
}

function viewAboutPage() {
    selectedNavBtn.className = "";
    inputPage.style.left = "-110%";
    logPage.style.left = "-110%";
    aboutPage.style.left = "0px";
    navButtons[2].className = "selected";
    selectedNavBtn = navButtons[2];
}
/*Experimenting with a confirm box...for clearing local storage
 function clearLS() {
     var x;
 if(confirm("Are you sure you want to clear your medications?") == true) {
 localStorage.clear();
 document.getElementById("1").innerHTML = "You have no Medication Listed";
 document.getElementById("2").innerHTML = "You have no Medication Listed";
 document.getElementById("saves").innerHTML = "0 Medication(s) saved.";
 } else {

    x = "That was close!";
 }
 document.getElementById("response").innerHTML = x;
 }
*/

/* Clear Local Storage reset counter */
function clearLS() {

    localStorage.clear();
    document.getElementById("1").innerHTML = "You have no Medication Listed";
    document.getElementById("2").innerHTML = "You have no Medication Listed";
    document.getElementById("saves").innerHTML = "0 Medication(s) saved.";
    meds = [];
}
/* Creates a medicine object and stores it in the array and updates localStorage */
function store() {
    var med = document.getElementById("med");
    var mg = document.getElementById("mg");
    var saveBtn = document.getElementById('save');
    // Form Validation
    if (med.value == "" || mg.value == "") {
      saveBtn.className = "contentButton";
      // reflow element so animation will run again after adding back class
      saveBtn.offsetWidth = saveBtn.offsetWidth;
      saveBtn.className = "contentButton formError";
      return;
    }
    if (typeof(Storage) == "undefined") {
        document.getElementById("saves").innerHTML = "Sorry, your browser does not support web storage...";
    }
    document.getElementById("inputPage").innerHTML = "";
    var loading = document.getElementById("loading-animation");
    loading.style.display = "none";
  searchForDrug(med.value, mg.value);
    document.getElementById("inputPage").innerHTML = "";
    var loading = document.getElementById("loading-animation");
    loading.style.display = "block";
  document.getElementById('medInput').reset();
}

function searchForDrug(drugName, dosage){
    var xmlObj = new XMLHttpRequest();
    var url = "https://dailymed.nlm.nih.gov/dailymed/services/v2/spls.json?drug_name="+drugName+"&name_type=both";
    xmlObj.open("GET", url, true);
    xmlObj.onreadystatechange = function(){
        if(xmlObj.readyState == 4 && xmlObj.status == 200){
            var response = JSON.parse(xmlObj.response);
            if(response.data.length > 0){
                saveToLS(drugName, dosage, response.data[0].setid);
            } else {
                saveToLS(drugName, dosage, undefined);
            }
            document.getElementById("inputPage").innerHTML = "";
            var loading = document.getElementById("loading-animation");
            loading.style.display = "none";
        }
    }
    xmlObj.send();
}

function saveToLS(med, mg, id){
    var medObj = {};
    medObj["med"] = med;
    medObj["dose"] = mg;
    medObj["id"] = id;
    medObj["active"] = false;
    meds.push(medObj);
    localStorage["meds"] = JSON.stringify(meds);
    printTable();
}

function viewInfo(searchTerm, id, med){
    returnDrugNames(searchTerm);
    document.getElementById("response").innerHTML = "";
    document.getElementById("about-medicine-name").innerHTML = id;
    var loading = document.getElementById("loading-animation");
    loading.style.display = "block";
    viewAboutPage();
}
function viewSearchInfo(searchTerm, id, med){
    returnDrugNames(searchTerm);
    document.getElementById("response").innerHTML = "";
    var loading = document.getElementById("loading-animation");
    loading.style.display = "block";
    viewAboutPage();
}
function returnDrugNames(searchTerm){
    var xmlObj = new XMLHttpRequest();
    var url = "https://dailymed.nlm.nih.gov/dailymed/services/v2/spls/"+searchTerm+".xml";
    xmlObj.open("GET", url, true);
    xmlObj.onreadystatechange = function(){
        if(xmlObj.readyState == 4 && xmlObj.status == 200){
            var structuredBody = xmlObj.responseXML.getElementsByTagName('structuredBody');
            var components = structuredBody[0].children;
            var output = "";
            for(var i = 0; i < components.length; i++){
                var section = components[i].children;
                var code = section[0].children[1];
                var displayName = code.attributes.getNamedItem("displayName");
                
                if(displayName.value.indexOf("INDICATIONS & USAGE SECTION") > -1){
                    var text = section[0].getElementsByTagName("text")[0];
                    output += "<h2>Usage</h2>";
                    output += new XMLSerializer().serializeToString(text);
                }
                if(displayName.value.indexOf("DOSAGE & ADMINISTRATION SECTION") > -1){
                    var text = section[0].getElementsByTagName("text")[0];
                    output += "<h2>Dosage & Administration</h2>";
                    output += new XMLSerializer().serializeToString(text);
                }
            }
            document.getElementById("response").innerHTML = output;
            var loading = document.getElementById("loading-animation");
            loading.style.display = "none";
        }
    }
    xmlObj.send();
}
function loadFromLs(){
    if (typeof(Storage) !== "undefined") {
        if (localStorage.clickcount) {

            var out = "<table id=medList> <th>Medicine - Dosage</th>" + "<th></th>";
            for (i = 0; i < localStorage.clickcount; i++) {
                out += "<tr>" +
                    "<td>" + localStorage.getItem(i + 1) + "</td>" +
                    "<td>" + SLIDER + "</td>" +
                    "</tr>";
            }
            out += "</table>";
            document.getElementById("1").innerHTML = out;
            document.getElementById("2").innerHTML = out;

        }
    } else {
        document.getElementById("saves").innerHTML = "Sorry, your browser does not support web storage...";
    }

}
/*Medication Log Page Sliders */

function Animate(slider) {
    var index = slider.parentElement.parentElement.parentElement.rowIndex-1;
    if(slider.classList.contains('active')){
        slider.classList.remove('active');
        slider.classList.add('deactive');
        meds[index]["active"] = false;
    } else {
        slider.classList.remove('deactive');
        slider.classList.add('active');
        meds[index]["active"] = true;
    }
    // Store toggle state
    localStorage["meds"] = JSON.stringify(meds);
}

/* Custom drug search */
function searchDrug(e){
  if (typeof e != "undefined") {
    if (e.type === "keypress" && e.keyCode != 13) {
      return;
    }
  }
    var drugName = document.getElementById("searchBar").value;
    var searchBtn = document.getElementById("searchBtn");
    var xmlObj = new XMLHttpRequest();
    var url = "https://dailymed.nlm.nih.gov/dailymed/services/v2/spls.json?drug_name="+drugName+"&name_type=both";
  
    // Form Validation
      if (drugName == "") {
        searchBtn.className = "contentButton";
        // reflow element so animation will run again after adding back class
        searchBtn.offsetWidth = searchBtn.offsetWidth;
        searchBtn.className = "contentButton formError";
        return;
      }
    document.getElementById("response").innerHTML = "";
    xmlObj.open("GET", url, true),
    loading = document.getElementById("loading-animation");
    loading.style.display = "block";
    xmlObj.onreadystatechange = function(){
        if(xmlObj.readyState == 4 && xmlObj.status == 200){
            var response = JSON.parse(xmlObj.response);
            if(response.data.length > 0){
                viewSearchInfo(response.data[0].setid);
                document.getElementById("about-medicine-name").innerHTML = drugName;

            } else {
              document.getElementById("response").innerHTML = "No results found.";
              loading.style.display = "none";
            }
        }
    }
    xmlObj.send();
}

function saveMed() {
    if (event.keyCode === 13)
        document.getElementById('save').click();
}

/* Run initialization code */
init();
