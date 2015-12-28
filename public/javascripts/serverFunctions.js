var nameOfMindMapOnServer;

function loadMindMap(nameOfMindMap) {
    logToLogging("Map to load : " + nameOfMindMap);
    $.getJSON('getMindMap', {
        name: nameOfMindMap
    }, function(data) {
        logToLogging("Map loaded successfully");
        console.log(data.configuration);
        nameOfMindMapOnServer = nameOfMindMap;
        config = JSON.parse(data.configuration);
        ciachoMap = JSON.parse(data.mindMap);

        drawMindMap();
    });
}

function saveMindMap() {
    $.post('setMindMap', {
            name: nameOfMindMapOnServer,
            configuration: JSON.stringify(config),
            mindMap: JSON.stringify(ciachoMap)
        }, function() {
            logToLogging("Mind map saved successfully");
        })
        .fail(function() {
            logToLogging("Error during saving mind map.");
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
                    logToLogging("Map to create : " + newMindName);
                    $.getJSON('createMindMap', {
                        name: newMindName
                    }, function(data) {
                        console.log(data);
                        if (typeof data.error === 'undefined') {
                            logToLogging("Error during creation of map: " + data.error);
                        } else {
                            logToLogging("Map created successfully!");

                            loadMindMap(newMindName);
                        }

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
