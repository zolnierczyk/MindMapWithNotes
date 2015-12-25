var contextMenuEntires = [
            {title: "Edit node", cmd: "edit", uiIcon: "ui-icon-copy", disabled: true},
            {title: "----"},
            {title: "Add to node", cmd: "add", uiIcon: "ui-icon-copy", disabled: true},
            {title: "Remove node", cmd: "remove", uiIcon: "ui-icon-copy", disabled: true},
            {title: "----"},
            {title: "Edit categories", cmd: "editCategory", uiIcon: "ui-icon-copy"},
            {title: "----"},
            {title: "Load mind", uiIcon: "ui-icon-copy", children: []},
            {title: "Save mind", cmd: "save", uiIcon: "ui-icon-copy", disabled: true},
            {title: "New mind", cmd: "newMind", uiIcon: "ui-icon-copy"}
            ];
var actuallyEditedByContextMenu = null;


function onLoadBody() {
  console.log("onLoadBody triggered");
  $("#listPanel").tabs();
  
  inflateContexMenuMinds();
}

function inflateContexMenuMinds(){
  $.getJSON('getAvailableMaps', function(data) {
        console.log("available minds:" + data);
        
        for (var mapName in data) {
            contextMenuEntires.find(function(x) {return x.title === 'Load mind'}).children.push({title:data[mapName], cmd:"load"});
        }
        setupContextMenu();
    });

}

function setupContextMenu() {
  $("#graphPanel").contextmenu({
        delegate: "#graph",
        addClass: "topzindex",
        beforeOpen: function(event, ui) {
          if (typeof nameOfMindMapOnServer !== 'undefined') {
            $("#graphPanel").contextmenu("enableEntry", "save", true);
          }
          else{
            $("#graphPanel").contextmenu("enableEntry", "save", false);
          }
          if (d3.select(ui.target.parent()[0]).classed('node')) {
            $("#graphPanel").contextmenu("enableEntry", "edit", true);
            $("#graphPanel").contextmenu("enableEntry", "add", true);
            $("#graphPanel").contextmenu("enableEntry", "remove", true);
            actuallyEditedByContextMenu = d3.select(ui.target.parent()[0]).select('rect').attr('id');
          } else {
            $("#graphPanel").contextmenu("enableEntry", "edit", false);
            $("#graphPanel").contextmenu("enableEntry", "add", false);
            $("#graphPanel").contextmenu("enableEntry", "remove", false);
            actuallyEditedByContextMenu = null;
          }
        },
        menu: contextMenuEntires,
        select:onContextMenuSelect
  });
}

function onContextMenuSelect(event, ui) {
  console.log("select " + ui.cmd + " on " + ui.item.text());
  
  switch(ui.cmd) {
    case "load" : 
      loadMindMap( ui.item.text() );
      break;
    case "save" : 
      saveMindMap();
      break;
    case "newMind" :
      createNewMindMap();
      break;
    case "edit" :
      showEditDialog(actuallyEditedByContextMenu);
      break;
    case "add" :
      addToNode(actuallyEditedByContextMenu);
      break;
    case "remove" :
      removeNode(actuallyEditedByContextMenu);
      break;
  }
  
  actuallyEditedByContextMenu = null;
}

function fillCategorySelect() {
    var propNodeTypeSelect = $("#nodeProperties").find("select[name='type']");
    var selectOptionFill = "";
    for (var type in config.types) {
        selectOptionFill += "<option>" + type + "</option>";
    }
    propNodeTypeSelect.html(selectOptionFill);

    propNodeTypeSelect.selectmenu();
}

function showEditDialog(nodeId) {
  fillCategorySelect();
  
  var nodeEdit = ciachoMap.data.find(function (x) {return x.id == nodeId;});
  
  $("#dialog-edit-node").attr('title', "Edit node: " + nodeEdit.name);
  $("#dialog-edit-node").dialog({
      resizable: true,
      height: 500,
      modal: true,
      open: function() {
        $("#dialogEditTabs").tabs();
          
        var nodeForm = $("#nodeProperties");
        nodeForm.find("input[name='name']").val(nodeEdit.name);
        nodeForm.find("select[name='type']").val(nodeEdit.type).selectmenu('refresh');
        $(".ui-selectmenu-button").css('width', '150px');
        
        var bigNodeSelect = nodeForm.find("select[name='nodeDependence']");
        var selectOptionFill = "";
        // lol sortowanie tablicy w miejsu więc zmieniamy kolejność elementów!
        ciachoMap.data.sort(function(a, b) {
            return a.type < b.type;
        });
        var lastType = "";
        for (var i = 0; i < ciachoMap.data.length; i += 1) {
            if (lastType !== ciachoMap.data[i].type) {
                if (i !== 0) {
                    selectOptionFill += "</optgroup>";
                }
                selectOptionFill += "<optgroup label='" + ciachoMap.data[i].type + "'>";
                lastType = ciachoMap.data[i].type;
            }
            selectOptionFill += "<option value='" + ciachoMap.data[i].id + "' ";
            if (selected.obj.depends.findIndex(function(x) {
                    return x === ciachoMap.data[i].id;
                }) > -1) {
                selectOptionFill += "selected";
            }
            selectOptionFill += ">" + ciachoMap.data[i].name + "</option>";
        };
        bigNodeSelect.html(selectOptionFill);
        
        CKEDITOR.replace('descEdit');
        CKEDITOR.instances.descEdit.setData(nodeEdit.notes);

      },
      buttons: {
        "Update node": function() {
            var nodeForm = $("#nodeProperties");
            if (typeof nodeEdit !== 'undefined' && nodeEdit) {
                nodeEdit.name = nodeForm.find("input[name='name']").val();
                nodeEdit.type = nodeForm.find("select[name='type']").val();

                nodeEdit.depends = nodeForm.find("select[name='nodeDependence']").val();
                
                nodeEdit.notes = CKEDITOR.instances.descEdit.getData();
                CKEDITOR.instances.descEdit.destroy();
                
                drawMindMap();
            }

            $(this).dialog("close");
        },
        Cancel: function() {
            $(this).dialog("close");
        }
      }
    });
    var nodeForm = $("#nodeProperties");
    //nodeForm.find("select[name='nodeDependence']").selectmenu();
    nodeForm.find("select[name='type']").selectmenu();
}

function addToNode(nodeId) {
  var nodeEdit = ciachoMap.data.find(function (x) {return x.id == nodeId;});
  
  var newNode = {
                id: generateGuid(),
                name: "New node",
                type: nodeEdit.type,
                notes: "Nice notes with syntax",
                depends: [nodeEdit.id]
            }
  ciachoMap.data.push(newNode);
  drawMindMap();
            
}

function removeNode(nodeId) {
  var nodeEditIndex = ciachoMap.data.findIndex(function (x) {return x.id == nodeId;});
  var nodeEdit = ciachoMap.data[nodeEditIndex];
  $("#dialog-confirm").attr('title', "Delete node " + nodeEdit.name + "?");
  $("#dialog-confirm").dialog({
    resizable: false,
    height: 240,
    modal: true,
    buttons: {
      "Delete node": function() {
          if (typeof nodeEditIndex !== 'undefined') {
            
            removeNodeAndSubNodeFromMap(nodeId);
            
            drawMindMap();
          }

          $(this).dialog("close");
      },
      Cancel: function() {
          $(this).dialog("close");
      }
    }
  });
}



function drawMindMap() {
  drawGraph();
 
  $(".node").mouseenter(function(event) {
    //console.log(event);
   // console.log('enter node');
    var rectId =  $(event.currentTarget).find('rect').attr('id');
    var pageX = event.pageX;
    var pageY = event.pageY;
    var notes = ciachoMap.data.find(function (x) {return x.id == rectId;}).notes;
    if ($("#nodeNotesPopUp_"+ rectId ).length != 0) {
       clearTimeout($("#nodeNotesPopUp_"+ rectId ).data('timeoutId'));
      return;
    }
    $("#graphPanel").append("<div id='nodeNotesPopUp_"+ rectId +"' class='ui-widget ui-widget-content ui-corner-all' style='position:absolute;top:"+pageY+"px;left:"+pageX+"px;z-index:50;opacity:0.85;height:250px;overflow:scroll;'>" + notes + "</div>")
    
    
    $("#nodeNotesPopUp_"+rectId).mouseenter(function(event) {
     // console.log('Enter popup');
      clearTimeout($(this).data('timeoutId'));
    })
    .mouseleave(function() {
      //console.log('Leave popup');
      var timeoutId = setTimeout(function(){
         // console.log('Hit remove node');
            $("#nodeNotesPopUp_"+rectId).remove();
        }, 1000);
      //clearTimeout($(this).data('timeoutId'));
      $("#nodeNotesPopUp_"+rectId).data('timeoutId', timeoutId)
    });
    
  })
  .mouseleave(function(event) {
   // console.log('Leave node');
    var someElement = $(this);
    var rectId =  $(event.currentTarget).find('rect').attr('id');
    var timeoutId = setTimeout(function(){
       // console.log('Hit remove node');
        $("#nodeNotesPopUp_"+rectId).remove();
    }, 1000);
    //clearTimeout($(this).data('timeoutId'));
   // console.log('nodetime out:' + timeoutId);
    $("#nodeNotesPopUp_"+rectId).data('timeoutId', timeoutId);
  });
}

/*

    $("#formAddCategory")
        .button()
        .click(function(event) {
            event.preventDefault();
            var categoryName = $("#categoryAdd").find("input[name='name']").val();

            config.types[categoryName] = {
                short: categoryName,
                long: categoryName
            };

            config.constraints.push({
                has: {
                    type: categoryName
                },
                type: 'position',
                x: '0.5',
                y: '0.5',
                weight: '0.7'
            });
            drawGraph();
            fillCategorySelect();
        });

    $("#listPanel").tabs();

    drawGraph();

    //    $(window).on('resize', resize);
    //}});

    fillToDoList();


}
*/
//////////////////////////////////////////////////////////////// 
function fillToDoList() {
    var todoListPanel = $("#tabToDo");
    todoListPanel.empty();
    for (var name in ciachoMap.data) {
        var node = ciachoMap.data[name];
        var todoRegex = /TODO: [^#]*/g;
        var todoArray;
        while ((todoArray = todoRegex.exec(node.notes)) !== null) {
            var todoInsertText = todoArray[0].substring(5, todoArray[0].length);
            todoListPanel.append("<p title='Node: " + node.name + "'" +
                "style='background-color: " + graph.fillColor(node.type + ":") + "; " +
                "padding : 5px ; " +
                "border-style : solid ; " +
                "border-color : " + graph.strokeColor(node.type + ":") + "; " +
                "border-width : 1px" + "; '" +
                ">" + todoInsertText + "</p>");
        }
    }
}