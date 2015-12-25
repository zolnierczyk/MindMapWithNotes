
var nameOfMindMapOnServer;
function loadMindMap(nameOfMindMap) {
  console.log("Map to load : " + nameOfMindMap);
  $.getJSON('getMindMap', {
      name: nameOfMindMap
  }, function(data) {
      console.log(data.configuration);
      nameOfMindMapOnServer = nameOfMindMap;
      config = JSON.parse(data.configuration);
      ciachoMap = JSON.parse(data.mindMap);

      drawMindMap();
  });
}

function saveMindMap(){
  $.post('setMindMap', {
    name: nameOfMindMapOnServer,
    configuration: JSON.stringify(config),
    mindMap: JSON.stringify(ciachoMap)
  });
}

function createNewMindMap() {
  $("#dialog-create-new-map").dialog({
    resizable: false,
    height: 340,
    modal: true,
    buttons: {
      "Create": function() {
          var createNewMindForm = $("#createNewMindForm");
          if (typeof createNewMindForm !== 'undefined') {
              var newMindName = createNewMindForm.find("input[name='name']").val();
              console.log("Map to create : " + newMindName);
              $.getJSON('createMindMap', {
                  name: newMindName
              }, function(data) {
                  console.log(data);
                  
                  loadMindMap(newMindName);
              });
          }
          
          $(this).dialog("close");
      },
      Cancel: function() {
          $(this).dialog("close");
      }
    }
  });
}
