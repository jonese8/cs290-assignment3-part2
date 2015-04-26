
/* CS290, Winter 2015 - Emmalee Jones, Assignment 3.2 */

/*
 * Create Page Function using Ajax
 * Builds Table of Gist Information
 */
function createPage(){
  /* Prevent Hyperlink running */
  event.preventDefault();
  /* Create Table of Gist Information*/
  createGistTable();
  /* For each page call AJAX Function of Gist Information */
  var github_request = document.getElementById('github_request');
  var pages = github_request.pages.value; 
  for(var page = 1; page <= pages; page++) {
    getRequest(page);
  }
}

/*
 * Start a new table to hold gist search results
 */
function createGistTable() {
  var searchData = document.getElementById('search');
  /* Remove old table before new table */
  searchData = document.getElementById('search');
  var resTableOld = document.getElementById('results_table');
  if(resTableOld !== null) {
    searchData.removeChild(resTableOld);
  }
  /*Start new table*/
  var resTable = document.createElement('table');
  resTable.border = "1";
  resTable.id = "results_table";
  var resTableBody = document.createElement('tbody');
  resTableBody.id = "results_table_body";
  resTable.appendChild(resTableBody);
  searchData.appendChild(resTable);
}

/*
 * Generic Function for AJAX Request
 */
function getRequest(page) {
  /*Build the AJAX Object */
  var reqXML = new XMLHttpRequest();
  if(!reqXML) {
    throw "Error: Unable to create HttpRequest.";
  }
  /* Get the data and parse it when request complete.*/
  reqXML.onreadystatechange = function() {
    if(this.readyState === 4) {
      var requests = JSON.parse(this.responseText);
      var requestList = createGroup(requests);
      createGistRows(requestList);
    }
  };
  /* Send the request */
  var getUrl = obtainUrl(page);
  reqXML.open("GET", getUrl);
  reqXML.send();
}

/*
 * Create the array of objects containing gists from Github.
 * This will include the id, description, url, and language fields.
 * Return the object to the calling function.
 */
function createGroup(requests) {
  /*Create Array*/
  var requestList = [];  
  requests.forEach(function(gist) {
     /*Load Gist Information*/
    var id = gist.id;
    var description = gist.description;
    if(!description) {
      description = "[Description Missing]";
    }
    /*HTML URL for Gist */
    var url = gist.html_url;
    var language;
    for(var prop in gist.files) {
      var gistObj = gist.files[prop];
      language = gistObj.language;
    }
    /*Create the object for Gist */
    var gistItem = new recordItem(id, description, url, language);
    requestList.push(gistItem);
  }
  );
  return requestList;
}

/*
 * Create Gist rows.
 */
function createGistRows(requestList) {
  var resTabBodyGist = document.getElementById('results_table_body');
  var languages = createLangs();
  requestList.forEach(function(gist) {
    /*Skip other languages if one or more languages selected. */
    if((((languages.length === 0)|| languages.indexOf(gist.language) >= 0) ) && 
        (localStorage.getItem(gist.id) === null)) {
      /*Create the row*/
      var resTabRow = document.createElement('tr');
      resTabRow.id = gist.id;
      /*Load data cells into rows  */
      var tabCell = createDescCell(gist);
      resTabRow.appendChild(tabCell);
      tabCell = createLangCell(gist);
      resTabRow.appendChild(tabCell);
      /* Favorite button added when Local Storage  */
      if(whenLocal()) {
        var FavoriteButton = 'FavoritesTable("' + gist.id + '", "' + 
            gist.description + '", "' + gist.url + '", "' + gist.language + '")';
        tabCell = CellButton("Favorite", FavoriteButton);
        resTabRow.appendChild(tabCell);
      }
      /* Add the table row to tbody    */
      resTabBodyGist.appendChild(resTabRow);
    }
  }
  );
}

/*
 * Create AJAX URL
 */
function obtainUrl(page) {
   var url = "https://api.github.com/gists";
   url += ("?pages=" + page);
   return url;
}

/*
 * Create array of languages
 */
function createLangs() {
  var languages = [];  
  /*Get languages from checkboxes */
  var github_request = document.getElementById('github_request');
  for(var i = 0; i < github_request.lang.length; i++) {
    if(github_request.lang[i].checked) {
      languages.push(github_request.lang[i].value);
    }
  }
  return languages;
}

/*
 * Create the description cell to add to row.
 */
function createDescCell(data) {
  var tabCellTxt = document.createTextNode(data.description);
  var anchor = document.createElement('a');
  anchor.href = data.url;
  anchor.appendChild(tabCellTxt);
  var tabCell = document.createElement('td');
  tabCell.appendChild(anchor);
  return tabCell;
}

/*
 * Create the language cell to add to row.
 */
function createLangCell(data) {
  var tabCellTxt = document.createTextNode(data.language);
  var tabCell = document.createElement('td');
  tabCell.appendChild(tabCellTxt);
  return tabCell;
}

/*
 * Create Generic Cell Button
 */
function CellButton(btnTxt, clickAction) {
    var button = document.createElement('button');
    var buttonTxt = document.createTextNode(btnTxt);
    button.setAttribute('onclick', clickAction);
    button.appendChild(buttonTxt);
    var tabCell = document.createElement('td');
    tabCell.appendChild(button);
    return tabCell;
}

/*
 * Add new favorite remove gist item
 */
function FavoritesTable(id, description, url, language) {
  var favoriteItem = new favItem(id, description, url, language);
  localStorage.setItem(id, JSON.stringify(favoriteItem));
  createFavTable();
  // Delete the gist from the search table
  var resTabBody = document.getElementById('results_table_body');
  var resTabRow = document.getElementById(id);
  resTabBody.removeChild(resTabRow);
}

/*
 * After window loaded run function to build Favorites
 */
window.onload = function() {
  if(whenLocal()) {
    createFavTable();
  }
};

/*
 * Check if local storage works on browser
 */
function whenLocal() {
  try {
    localStorage.setItem("tryitout", "yes");
    localStorage.removeItem("tryitout");
    return true;
  }
  catch(err) {
    return false;
  }
}

/*
 * Start a new table to hold Favorites
 */
function createFavTable() {
  var favoriteDiv = document.getElementById('favorites');
    /* Remove old table before new table */
  var favTableOld = document.getElementById('fav_table');
  if(favTableOld !== null) {
    favoriteDiv.removeChild(favTableOld);
  }
  if(localStorage.length >= 1) {
    /*Remove no records message */
    var favEmpMsgOld = document.getElementById('fav_emp_msg');
    if(favEmpMsgOld !== null) {
      favoriteDiv.removeChild(favEmpMsgOld);
    }
    var favTable = document.createElement('table');
    favTable.border = "1";
    favTable.id = "fav_table";
    var favTableBody = document.createElement('tbody');
    favTableBody.id = "fav_tab_body";
    favTable.appendChild(favTableBody);
    favoriteDiv.appendChild(favTable);
    createFavTableRows();
  }
  else {
     /*Add no records message */  
    var favEmpMsg = document.createElement('p');
    favEmpMsg.id = "fav_emp_msg";
    var favEmpMsgTxt = document.createTextNode
      ("There are currently no saved favorites.");
    favEmpMsg.appendChild(favEmpMsgTxt);
    favoriteDiv.appendChild(favEmpMsg);
  }
}

/*
 * Constuctor for gist item.
 */
function recordItem(id, description, url, language) {
  this.id = id;
  this.description = description;
  this.url = url;
  this.language = language;

}

/*
 * Create rows for favorites table from local storage.
 */
function createFavTableRows() {
  var favTabBody = document.getElementById('fav_tab_body');
  for(var i = 0; i < localStorage.length; i++) {
    var localData = getLocal(i);
    var favTabRow = document.createElement('tr');
    var tabCell = createDescCell(localData);
    favTabRow.appendChild(tabCell);
    tabCell = createLangCell(localData);
    favTabRow.appendChild(tabCell);
    /*Add remove button */
    var remButtonClickAction = 'removeRowFav("' + localData.id + '")';
    tabCell = CellButton("Remove", remButtonClickAction);
    favTabRow.appendChild(tabCell);
    favTabBody.appendChild(favTabRow);
  }
}

/*
 * Return item from local storage
 */
function getLocal(index) {
  var localKey = localStorage.key(index);
  var localData = JSON.parse(localStorage.getItem(localKey));
  return localData;
}

/*
 * Constuctor for Favorite Item.
 */
function favItem(id, description, url, language) {
  this.id = id;
  this.description = description;
  this.url = url;
  this.language = language;
}

/*
 * Remove an item from Favorite Table
 */
function removeRowFav(id) {
  localStorage.removeItem(id);
  createFavTable();
}




