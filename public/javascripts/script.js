///////////////////////////////////////////////////////////////// On load function
function onLoadBody() {

    $.getJSON('getAvailableMaps', function(data) {
        console.log(data);
        var mindMapTypeSelect = $("#selectMindMap").find("select[name='mindMap']");
        var selectOptionFill = "";
        for (var mapName in data) {
            selectOptionFill += "<option>" + data[mapName] + "</option>";
        }
        mindMapTypeSelect.html(selectOptionFill);
        mindMapTypeSelect.selectmenu();

        $("#formSelectMap")
            .button()
            .click(function(event) {
                event.preventDefault();
                nameOfMindMap = mindMapTypeSelect.find("option:selected").text();
                console.log("Map selected : " + nameOfMindMap);
                $.getJSON('getMindMap', {
                    name: nameOfMindMap
                }, function(data) {
                    console.log(data.configuration);
                    config = JSON.parse(data.configuration);
                    ciachoMap = JSON.parse(data.mindMap);

                    onMindMapLoaded();
                });
            });
    });
    $("#formAddMindMap")
        .button()
        .click(function(event) {
            event.preventDefault();
            var nameOfNewMindMap = $("#mapAdd").find("input[name='name']").val();
            console.log("Map created : " + nameOfNewMindMap);
            $.getJSON('createMindMap', {
                name: nameOfNewMindMap
            }, function(data) {
                onLoadBody();
            });
        });
}



function fillCategorySelect() {
    var propNodeTypeSelect = $("#nodeProperties").find("select[name='type']");
    var newNodeTypeSelect = $("#newNode").find("select[name='type']");

    var selectOptionFill = "";
    for (var type in config.types) {
        selectOptionFill += "<option>" + type + "</option>";
    }
    propNodeTypeSelect.html(selectOptionFill);
    newNodeTypeSelect.html(selectOptionFill);

    propNodeTypeSelect.selectmenu();
    newNodeTypeSelect.selectmenu();
}

function onMindMapLoaded() {

    $("#tabToDo").tooltip();


$("#graphPanel").contextmenu({
        delegate: ".node",
        addClass: "topzindex",
        menu: [
            {title: "Copy", cmd: "copy", uiIcon: "ui-icon-copy"},
            {title: "----"},
            {title: "More", children: [
                            {title: "Sub 1", cmd: "sub1"},
                {title: "Sub 2", cmd: "sub1"}
            ]}
        ],
        select: function(event, ui) {
                    alert("select " + ui.cmd + " on " + ui.target.text());
                        }
});

    var propNodeTypeSelect = $("#nodeProperties").find("select[name='type']");
    var newNodeTypeSelect = $("#newNode").find("select[name='type']");

    fillCategorySelect();

    //$("#nodeProperties").find("input[name='name']").prop("disabled", true);
    //$("#nodeProperties").find("select[name='type']").selectmenu("option", "disabled", true);

    $("#formUpdate").hide();
    $("#formEditNode").show();

    $("#formEditNode")
        .button()
        .click(function(event) {
            event.preventDefault();

            if (typeof selected.obj === 'undefined') {
                return;
            }

            $("#dialog-edit-node").attr('title', "Edit node: " + selected.obj.name);
            $("#dialog-edit-node").dialog({
                resizable: false,
                height: 400,
                modal: true,
                open: function() {
                    var nodeForm = $("#nodeProperties");
                    nodeForm.find("input[name='name']").val(selected.obj.name);
                    nodeForm.find("select[name='type']").val(selected.obj.type).selectmenu('refresh');

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

                },
                buttons: {
                    "Update node": function() {
                        var nodeForm = $("#nodeProperties");
                        if (typeof selected.obj !== 'undefined' && selected.obj) {
                            selected.obj.name = nodeForm.find("input[name='name']").val();
                            selected.obj.type = nodeForm.find("select[name='type']").val();

                            selected.obj.depends = nodeForm.find("select[name='nodeDependence']").val();

                            drawGraph();
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

        });


    $("#formCreateNew")
        .button()
        .click(function(event) {
            event.preventDefault();

            var nodeForm = $("#newNode");
            var newNode = {
                id: generateGuid(),
                name: nodeForm.find("input[name='name']").val(),
                type: nodeForm.find("select[name='type'] option:selected").text(),
                notes: "Nice notes with syntax",
                depends: [selected.obj.id]
            }
            ciachoMap.data.push(newNode);

            drawGraph();

        });


    $("#editNote")
        .button()
        .click(function(event) {
            event.preventDefault();

            if (typeof selected.obj === 'undefined') {
                return;
            }
            duringEdit = true;

            $("#editNote").hide();
            $("#saveNote").show();

            $("#descText").hide();
            $("#descEdit").show();

            CKEDITOR.replace('descEdit');
            CKEDITOR.instances.descEdit.setData(selected.obj.notes);


        });

    $("#saveNote")
        .button()
        .click(function(event) {
            event.preventDefault();

            $("#editNote").show();
            $("#saveNote").hide();

            $("#descText").show();

            selected.obj.notes = CKEDITOR.instances.descEdit.getData();
            CKEDITOR.instances.descEdit.destroy();
            $("#descEdit").hide();
            $("#descText").html(selected.obj.notes);

            fillToDoList();
            duringEdit = false;
        });


    $("#uploadMindMap")
        .button()
        .click(function(event) {
            event.preventDefault();

            $.post('setMindMap', {
                name: nameOfMindMap,
                configuration: JSON.stringify(config),
                mindMap: JSON.stringify(ciachoMap)
            });
        });

    $("#removeNode")
        .button()
        .click(function(event) {
            event.preventDefault();

            if (typeof selected.obj === 'undefined') {
                return;
            }
            $("#dialog-confirm").attr('title', "Delete node " + selected.obj.name + "?");
            $("#dialog-confirm").dialog({
                resizable: false,
                height: 240,
                modal: true,
                buttons: {
                    "Delete node": function() {
                        var indexToDelete = ciachoMap.data.findIndex(function(x) {
                            return x.id === selected.obj.id;
                        });

                        if (typeof indexToDelete !== 'undefined') {
                            ciachoMap.data.splice(indexToDelete, 1);

                            for (var i = 0; i < ciachoMap.data.length; i += 1) {
                                var dependsToRemove = ciachoMap.data[i].depends.findIndex(function(x) {
                                    return x === selected.obj.id;
                                });
                                if (typeof dependsToRemove !== 'undefined' && dependsToRemove != -1) {
                                    ciachoMap.data[i].depends.splice(dependsToRemove, 1);
                                }
                            };
                            drawGraph();
                        }

                        $(this).dialog("close");
                    },
                    Cancel: function() {
                        $(this).dialog("close");
                    }
                }
            });

        });

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
////////////////////////////////////////////////////////////////
function zoomed() {
    var svgT = d3.select("#graph").select("svg").select("g");
    svgT.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}
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
