////////////////////////////////////////////////////////////////// Global variables
var graph = {},
    selected = {},
    highlighted = null,
    isIE = false,
    duringEdit = false,
    nameOfMindMap = "";


function generateGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

////////////////////////////////////////////////////////////////// drawGraph
function drawGraph() {
    // Clear all old things
    $('#graph').empty();
    graph = {};

    // define graph margins
    graph.margin = {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20
    };

    // This is some strange manipulation of graph size

    // var display = $('#graph').css('display');
    // $('#graph')
    //     .css('display', 'block')
    //     .css('height', config.graph.height + 'px');
    graph.width = $('#graph').width() - graph.margin.left - graph.margin.right;
    graph.height = $('#graph').height() - graph.margin.top - graph.margin.bottom;
    //$('#graph').css('display', display);


    // Here we define graph data
    graph.data = ciachoMap.data;

    recalculateConstrains();

    // Here we are creating link connection between nodes
    graph.links = [];
    // For every node 
    for (var name in ciachoMap.data) {
        var obj = ciachoMap.data[name];
        // For every dependency inside this node
        for (var depIndex in obj.depends) {
            //  Create link object with direction and reference to nodes
            var link = {
                // Here we are finding nodes with right id in array
                source: ciachoMap.data.find(function(element) {
                    return element.id === obj.depends[depIndex]
                }),
                target: obj
            };
            link.strength = (link.source.linkStrength || 1) * (link.target.linkStrength || 1);
            // Add it to the link table 
            graph.links.push(link);
        }
    }

    // Here we are create category keys
    graph.categories = {};
    for (var name in ciachoMap.data) {
        var obj = ciachoMap.data[name],
            key = obj.type + ':' + (obj.group || ''),
            cat = graph.categories[key];

        obj.categoryKey = key;
        if (!cat) {
            cat = graph.categories[key] = {
                key: key,
                type: obj.type,
                typeName: (config.types[obj.type] ? config.types[obj.type].short : obj.type),
                group: obj.group,
                count: 0
            };
        }
        cat.count++;
    }
    graph.categoryKeys = d3.keys(graph.categories);

    // Here we define category colour
    graph.colors = colorbrewer.Set3[config.graph.numColors];

    function getColorScale(darkness) {
        return d3.scale.ordinal()
            .domain(graph.categoryKeys)
            .range(graph.colors.map(function(c) {
                return d3.hsl(c).darker(darkness).toString();
            }));
    }

    graph.strokeColor = getColorScale(0.7);
    graph.fillColor = getColorScale(-0.1);

    graph.nodeValues = d3.values(graph.data);

    // Here we use d2 lout to generate graph
    graph.force = d3.layout.force()
        .nodes(graph.nodeValues)
        .links(graph.links)
        .linkStrength(function(d) {
            return d.strength;
        })
        .size([graph.width, graph.height])
        .linkDistance(config.graph.linkDistance)
        .charge(config.graph.charge)
        .gravity(0.0)
        .on('tick', tick);

    // Here we append root of svg element
    graph.svg = d3.select('#graph').append('svg')
        .attr('width', graph.width + graph.margin.left + graph.margin.right)
        .attr('height', graph.height + graph.margin.top + graph.margin.bottom)
        .append('g')
        .attr('transform', 'translate(' + graph.margin.left + ',' + graph.margin.top + ')');


    graph.svg.append('defs').selectAll('marker')
        .data(['end'])
        .enter().append('marker')
        .attr('id', String)
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 10)
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5');

    // adapted from http://stackoverflow.com/questions/9630008
    // and http://stackoverflow.com/questions/17883655

    var glow = graph.svg.append('filter')
        .attr('x', '-50%')
        .attr('y', '-50%')
        .attr('width', '200%')
        .attr('height', '200%')
        .attr('id', 'blue-glow');

    glow.append('feColorMatrix')
        .attr('type', 'matrix')
        .attr('values', '0 0 0 0  0 ' + '0 0 0 0  0 ' + '0 0 0 0  .7 ' + '0 0 0 1  0 ');

    glow.append('feGaussianBlur')
        .attr('stdDeviation', 3)
        .attr('result', 'coloredBlur');

    glow.append('feMerge').selectAll('feMergeNode')
        .data(['coloredBlur', 'SourceGraphic'])
        .enter().append('feMergeNode')
        .attr('in', String);

    graph.legend = graph.svg.append('g')
        .attr('class', 'legend')
        .attr('x', 0)
        .attr('y', 0)
        .selectAll('.category')
        .data(d3.values(graph.categories))
        .enter().append('g')
        .attr('class', 'category');

    graph.legendConfig = {
        rectWidth: 12,
        rectHeight: 12,
        xOffset: -10,
        yOffset: 30,
        xOffsetText: 20,
        yOffsetText: 10,
        lineHeight: 15
    };
    graph.legendConfig.xOffsetText += graph.legendConfig.xOffset;
    graph.legendConfig.yOffsetText += graph.legendConfig.yOffset;

    graph.legend.append('rect')
        .attr('x', graph.legendConfig.xOffset)
        .attr('y', function(d, i) {
            return graph.legendConfig.yOffset + i * graph.legendConfig.lineHeight;
        })
        .attr('height', graph.legendConfig.rectHeight)
        .attr('width', graph.legendConfig.rectWidth)
        .attr('fill', function(d) {
            return graph.fillColor(d.key);
        })
        .attr('stroke', function(d) {
            return graph.strokeColor(d.key);
        });

    graph.legend.append('text')
        .attr('x', graph.legendConfig.xOffsetText)
        .attr('y', function(d, i) {
            return graph.legendConfig.yOffsetText + i * graph.legendConfig.lineHeight;
        })
        .text(function(d) {
            return d.typeName + (d.group ? ': ' + d.group : '');
        });

    $('#graphPanel').on('scroll', function() {
        graph.legend.attr('transform', 'translate(0,' + $(this).scrollTop() + ')');
    });

    graph.line = graph.svg.append('g').selectAll('.link')
        .data(graph.force.links())
        .enter().append('line')
        .attr('class', 'link');

    graph.draggedThreshold = d3.scale.linear()
        .domain([0, 0.1])
        .range([5, 20])
        .clamp(true);

    function dragged(d) {
        var threshold = graph.draggedThreshold(graph.force.alpha()),
            dx = d.oldX - d.px,
            dy = d.oldY - d.py;
        if (Math.abs(dx) >= threshold || Math.abs(dy) >= threshold) {
            d.dragged = true;
        }
        return d.dragged;
    }

    graph.drag = d3.behavior.drag()
        .origin(function(d) {
            return d;
        })
        .on('dragstart', function(d) {
            d3.event.sourceEvent.stopPropagation();
            d3.select(this).classed("dragging", true);

            d.oldX = d.x;
            d.oldY = d.y;
            d.dragged = false;
            d.fixed |= 2;
        })
        .on('drag', function(d) {
            d.px = d3.event.x;
            d.py = d3.event.y;
            if (dragged(d)) {
                if (!graph.force.alpha()) {
                    graph.force.alpha(.025);
                }
            }
        })
        .on('dragend', function(d) {
            if (!dragged(d)) {
                selectObject(d, this);
            }
            d.fixed &= ~6;

            d3.select(this).classed("dragging", false);
        });



    $('#graphPanel').on('click', function(e) {
        if (!$(e.target).closest('.node').length) {
            deselectObject();
        }
    });

    graph.node = graph.svg.selectAll('.node')
        .data(graph.force.nodes())
        .enter().append('g')
        .attr('class', 'node')
        .call(graph.drag)
        .on('mouseover', function(d) {
            if (!selected.obj) {
                if (graph.mouseoutTimeout) {
                    clearTimeout(graph.mouseoutTimeout);
                    graph.mouseoutTimeout = null;
                }
                highlightObject(d);
            }
        })
        .on('mouseout', function() {
            if (!selected.obj) {
                if (graph.mouseoutTimeout) {
                    clearTimeout(graph.mouseoutTimeout);
                    graph.mouseoutTimeout = null;
                }
                graph.mouseoutTimeout = setTimeout(function() {
                    highlightObject(null);
                }, 300);
            }
        });

    graph.nodeRect = graph.node.append('rect')
        .attr('rx', 5)
        .attr('ry', 5)
        .attr('stroke', function(d) {
            return graph.strokeColor(d.categoryKey);
        })
        .attr('fill', function(d) {
            return graph.fillColor(d.categoryKey);
        })
        .attr('width', 120)
        .attr('height', 30)
        .attr('id',function(d) {
            return d.id;
        });

    graph.node.each(function(d) {
        var node = d3.select(this),
            rect = node.select('rect'),
            lines = wrap(d.name),
            ddy = 1.1,
            dy = -ddy * lines.length / 2 + .5;

        lines.forEach(function(line) {
            var text = node.append('text')
                .text(line)
                .attr('dy', dy + 'em');
            dy += ddy;
        });
    });

    setTimeout(function() {
        graph.node.each(function(d) {
            var node = d3.select(this),
                text = node.selectAll('text'),
                bounds = {},
                first = true;

            text.each(function() {
                var box = this.getBBox();
                if (first || box.x < bounds.x1) {
                    bounds.x1 = box.x;
                }
                if (first || box.y < bounds.y1) {
                    bounds.y1 = box.y;
                }
                if (first || box.x + box.width > bounds.x2) {
                    bounds.x2 = box.x + box.width;
                }
                if (first || box.y + box.height > bounds.y2) {
                    bounds.y2 = box.y + box.height;
                }
                first = false;
            }).attr('text-anchor', 'middle');

            var padding = config.graph.labelPadding,
                margin = config.graph.labelMargin,
                oldWidth = bounds.x2 - bounds.x1;

            bounds.x1 -= oldWidth / 2;
            bounds.x2 -= oldWidth / 2;

            bounds.x1 -= padding.left;
            bounds.y1 -= padding.top;
            bounds.x2 += padding.left + padding.right;
            bounds.y2 += padding.top + padding.bottom;

            node.select('rect')
                .attr('x', bounds.x1)
                .attr('y', bounds.y1)
                .attr('width', bounds.x2 - bounds.x1)
                .attr('height', bounds.y2 - bounds.y1);

            d.extent = {
                left: bounds.x1 - margin.left,
                right: bounds.x2 + margin.left + margin.right,
                top: bounds.y1 - margin.top,
                bottom: bounds.y2 + margin.top + margin.bottom
            };

            d.edge = {
                left: new geo.LineSegment(bounds.x1, bounds.y1, bounds.x1, bounds.y2),
                right: new geo.LineSegment(bounds.x2, bounds.y1, bounds.x2, bounds.y2),
                top: new geo.LineSegment(bounds.x1, bounds.y1, bounds.x2, bounds.y1),
                bottom: new geo.LineSegment(bounds.x1, bounds.y2, bounds.x2, bounds.y2)
            };
        });

        graph.numTicks = 0;
        graph.preventCollisions = false;
        graph.force.start();
        for (var i = 0; i < config.graph.ticksWithoutCollisions; i++) {
            graph.force.tick();
        }
        graph.preventCollisions = true;
        $('#graphPanel').css('visibility', 'visible');
    });

    visualizeTypeCenter();

    var zoom = d3.behavior.zoom()
        .translate([0, 0])
        .scale(1)
        .scaleExtent([0.1, 10])
        .on("zoom", zoomed);

    d3.select("#graph").select("svg").call(zoom);

}

function zoomed() {
    var svgT = d3.select("#graph").select("svg").select("g");
    svgT.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}

/////////////////////////////////////////////////////////////// wrap
var maxLineChars = 26,
    wrapChars = ' /_-.'.split('');

function wrap(text) {
    if (text.length <= maxLineChars) {
        return [text];
    } else {
        for (var k = 0; k < wrapChars.length; k++) {
            var c = wrapChars[k];
            for (var i = maxLineChars; i >= 0; i--) {
                if (text.charAt(i) === c) {
                    var line = text.substring(0, i + 1);
                    return [line].concat(wrap(text.substring(i + 1)));
                }
            }
        }
        return [text.substring(0, maxLineChars)]
            .concat(wrap(text.substring(maxLineChars)));
    }
}
////////////////////////////////////////////////////////////////// prevent Collisions
function preventCollisions() {
    var quadtree = d3.geom.quadtree(graph.nodeValues);

    for (var name in graph.data) {
        var obj = graph.data[name],
            ox1 = obj.x + obj.extent.left,
            ox2 = obj.x + obj.extent.right,
            oy1 = obj.y + obj.extent.top,
            oy2 = obj.y + obj.extent.bottom;

        quadtree.visit(function(quad, x1, y1, x2, y2) {
            if (quad.point && quad.point !== obj) {
                // Check if the rectangles intersect
                var p = quad.point,
                    px1 = p.x + p.extent.left,
                    px2 = p.x + p.extent.right,
                    py1 = p.y + p.extent.top,
                    py2 = p.y + p.extent.bottom,
                    ix = (px1 <= ox2 && ox1 <= px2 && py1 <= oy2 && oy1 <= py2);
                if (ix) {
                    var xa1 = ox2 - px1, // shift obj left , p right
                        xa2 = px2 - ox1, // shift obj right, p left
                        ya1 = oy2 - py1, // shift obj up   , p down
                        ya2 = py2 - oy1, // shift obj down , p up
                        adj = Math.min(xa1, xa2, ya1, ya2);

                    if (adj == xa1) {
                        obj.x -= adj / 2;
                        p.x += adj / 2;
                    } else if (adj == xa2) {
                        obj.x += adj / 2;
                        p.x -= adj / 2;
                    } else if (adj == ya1) {
                        obj.y -= adj / 2;
                        p.y += adj / 2;
                    } else if (adj == ya2) {
                        obj.y += adj / 2;
                        p.y -= adj / 2;
                    }
                }
                return ix;
            }
        });
    }
}

////////////////////////////////////////////////////////// tick
function tick(e) {
    graph.numTicks++;

    for (var name in graph.data) {
        var obj = graph.data[name];

        obj.positionConstraints.forEach(function(c) {
            var w = c.weight * e.alpha;
            if (!isNaN(c.x)) {
                obj.x = (c.x * w + obj.x * (1 - w));
            }
            if (!isNaN(c.y)) {
                obj.y = (c.y * w + obj.y * (1 - w));
            }
        });
    }

    if (graph.preventCollisions) {
        preventCollisions();
    }

    graph.line
        .attr('x1', function(d) {
            return d.source.x;
        })
        .attr('y1', function(d) {
            return d.source.y;
        })
        .each(function(d) {
            if (isIE) {
                // Work around IE bug regarding paths with markers
                // Credit: #6 and http://stackoverflow.com/a/18475039/106302
                this.parentNode.insertBefore(this, this);
            }

            var x = d.target.x,
                y = d.target.y,
                line = new geo.LineSegment(d.source.x, d.source.y, x, y);

            for (var e in d.target.edge) {
                var ix = line.intersect(d.target.edge[e].offset(x, y));
                if (ix.in1 && ix.in2) {
                    x = ix.x;
                    y = ix.y;
                    break;
                }
            }

            d3.select(this)
                .attr('x2', x)
                .attr('y2', y);
        });

    graph.node
        .attr('transform', function(d) {
            return 'translate(' + d.x + ',' + d.y + ')';
        });
}

///////////////////////////////////////////////////////////////////////// selectObject
function selectObject(obj, el) {
    var node;
    if (duringEdit) {
        return;
    }

    if (el) {
        node = d3.select(el);
    } else {
        graph.node.each(function(d) {
            if (d === obj) {
                node = d3.select(el = this);
            }
        });
    }
    if (!node) return;

    if (node.classed('selected')) {
        deselectObject();
        return;
    }
    deselectObject(false);

    selected = {
        obj: obj,
        el: el
    };

    $("#formEditNode").button('option', 'disabled', false);
    $("#editNote").button('option', 'disabled', false);

    highlightObject(obj);

    fillPropertiesForm(obj);

    fillDescription(obj);

    node.classed('selected', true);


    var $graph = $('#graphPanel'),
        nodeRect = {
            left: obj.x + obj.extent.left + graph.margin.left,
            top: obj.y + obj.extent.top + graph.margin.top,
            width: obj.extent.right - obj.extent.left,
            height: obj.extent.bottom - obj.extent.top
        },
        graphRect = {
            left: $graph.scrollLeft(),
            top: $graph.scrollTop(),
            width: $graph.width(),
            height: $graph.height()
        };
    if (nodeRect.left < graphRect.left ||
        nodeRect.top < graphRect.top ||
        nodeRect.left + nodeRect.width > graphRect.left + graphRect.width ||
        nodeRect.top + nodeRect.height > graphRect.top + graphRect.height) {

        $graph.animate({
            scrollLeft: nodeRect.left + nodeRect.width / 2 - graphRect.width / 2,
            scrollTop: nodeRect.top + nodeRect.height / 2 - graphRect.height / 2
        }, 500);
    }
}

///////////////////////////////////////////////////////////////////////////////////////
function fillPropertiesForm(nodeObject) {
    //var nodeForm = $("#nodeProperties");
    var nodeFormUpdate = $("#newNode");
    if (nodeObject) {
        // nodeForm.find("input[name='id']").attr("value", nodeObject.id);
        // nodeForm.find("select[name='type']").val(nodeObject.type).selectmenu('refresh');
        // nodeForm.find("input[name='name']").attr("value", nodeObject.name);

        nodeFormUpdate.find("select[name='type']").val(nodeObject.type).selectmenu('refresh');
    } else {
        //nodeForm.find("input[name='id']").attr("value", "");
        //nodeForm.find("input[name='name']").attr("value", "");
    }
}

///////////////////////////////////////////////////////////////////////////////////////
function fillDescription(nodeObject) {
    var descText = $("#descText");
    if (nodeObject) {
        descText.html(nodeObject.notes);
        //$('#docs-container').scrollTop(0);
        //resize(true);
    } else {
        descText.html(nodeObject.notes);
    }
}

/////////////////////////////////////////////////////////////////////////////////////// deselectObject
function deselectObject(doResize) {
    if (duringEdit) {
        return;
    }
    if (doResize || typeof doResize == 'undefined') {
        //resize(false);
    }
    graph.node.classed('selected', false);
    selected = {};
    highlightObject(null);
    fillPropertiesForm(null);
    $("#formEditNode").button('option', 'disabled', true);
    $("#editNote").button('option', 'disabled', true);
}
///////////////////////////////////////////////////////////////////////////////////
function visualizeTypeCenter() {
    // For every constraints defined inside config object generate node constraints

    var conterDrag = d3.behavior.drag()
        //.origin(function(d) { return d; })
        .on('dragstart', function(d) {
            d3.event.sourceEvent.stopPropagation();
            d3.select(this).classed("dragging", true);

        })
        .on('drag', function(d) {
            d3.select(this).attr("cx", d3.event.x).attr("cy", d3.event.y);
            var typeName = d3.select(this).attr('name');

            var typeObj = config.constraints.find(function(x) {
                return x.has.type === typeName;
            })

            typeObj.x = d3.event.x / graph.width;
            typeObj.y = d3.event.y / graph.height;

            recalculateConstrains();

            // Code responsible for force calculation
            if (!graph.force.alpha()) {
                graph.force.alpha(.025);
            }
        })
        .on('dragend', function(d) {

            d3.select(this).classed("dragging", false);
        });


    config.constraints.forEach(function(con) {
        switch (con.type) {
            case 'position':
                graph.svg.append('circle')
                    .attr('name', con.has.type)
                    .attr('cx', con.x * graph.width)
                    .attr('cy', con.y * graph.height)
                    .attr('r', con.weight * 5)
                    .attr('fill', graph.fillColor(con.has.type + ":"))
                    .attr('fill-opacity', 0.4)
                    .attr('stroke', graph.strokeColor(con.has.type + ":"))
                    .call(conterDrag);
                break;
            case 'linkStrength':
                break;
        }
    });
    /*
    d3.selectAll('svg').data(config.constraints).enter().append('circle')
                  .attr('cx', function(d){ d.x* graph.width})
                  .attr('cy', function(d){ d.y* graph.height})
                  .attr('r',  function(d){ d.weight*5})
                  .attr('fill', function(d){ graph.fillColor(d.has.type+":")})
                  .attr('fill-opacity', 0.4)
                  .attr('stroke', function(d){ graph.strokeColor(d.has.type+":")})
                  .call(conterDrag);
    */
    //d3.select('grpahs').select('svg').selectAll.call(conterDrag);
}
///////////////////////////////////////////////////////////////////////////////////
function recalculateConstrains() {
    // Here we are generating constraints between nodes
    for (var name in graph.data) {
        // For every node add default constraints properties
        var obj = ciachoMap.data[name];
        obj.positionConstraints = [];
        obj.linkStrength = 3;

        if (obj.type !== obj.name) continue;

        // For every constraints defined inside config object generate node constraints
        config.constraints.forEach(function(con) {
            // Find which constraints past to this object
            for (var matchProperty in con.has) {
                if (con.has[matchProperty] !== obj[matchProperty]) {
                    return true;
                }
            }
            // And if past then copy constraints properties to this node
            switch (con.type) {
                case 'position':
                    obj.positionConstraints.push({
                        weight: con.weight,
                        x: con.x * graph.width,
                        y: con.y * graph.height
                    });
                    break;
                case 'linkStrength':
                    obj.linkStrength *= con.strength;
                    break;
            }
        });
    }
}
/////////////////////////////////////////////////////////////////////////////////// highlightObject
function highlightObject(obj) {
    if (obj) {
        if (obj !== highlighted) {
            graph.node.classed('inactive', function(d) {
                return (obj !== d && d.depends.indexOf(obj.name) == -1
                    /*&& d.dependedOnBy.indexOf(obj.name) == -1*/
                );
            });
            graph.line.classed('inactive', function(d) {
                return (obj !== d.source && obj !== d.target);
            });
        }
        highlighted = obj;
    } else {
        if (highlighted) {
            graph.node.classed('inactive', false);
            graph.line.classed('inactive', false);
        }
        highlighted = null;
    }

    /*
      if (obj) {
          if (obj !== highlighted) {
              graph.node.classed('inactive', function(d) {
                  return (obj !== d
                      && d.depends.indexOf(obj.name) == -1
                      && d.dependedOnBy.indexOf(obj.name) == -1);
              });
              graph.line.classed('inactive', function(d) {
                  return (obj !== d.source && obj !== d.target);
              });
          }
          highlighted = obj;
      } else {
          if (highlighted) {
              graph.node.classed('inactive', false);
              graph.line.classed('inactive', false);
          }
          highlighted = null;
      }
      */
}

var showingDocs = false,
    docsClosePadding = 8,
    desiredDocsHeight = 300;
