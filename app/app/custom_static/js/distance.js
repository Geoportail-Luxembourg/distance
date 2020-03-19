var tableReady = true;
        var dropdown_focused = false;
        var firstAdded = false;
        var adding = false;
        var currentSelectedStop = "default"
        var dragged = false;
        var draggedOut = false;

        var addFirstTime = true;
        var changeOrderFirstTime = true;
        var removeFromListFirstTime = true;
        
        setup()

        $(document).on('focus', '.dropdown-toggle', function(){
            dropdown_focused = true;
        });

        $(document).on('focusout', '.dropdown-toggle', function(){
            dropdown_focused = false;
        });

        $(document).not('#table').click(function() {
            if (dropdown_focused && !(event.which == 13)) {
                addSameStop();
            }
        });

        $(document).bind("keydown", function(){
            if (event.which == 13 && dropdown_focused) {
                addSameStop();
            }
        });

        function addSameStop() {
            var id = $("#stops option:selected").val();

            if (currentSelectedStop == id && !firstAdded) {
                adding = true;
            }
            else {
                adding = false;
            }

            if (id != "default" && adding) {
                addToTable();
            }
            else {
                firstAdded = false;
            }
        }

        function calculateDistance() {
            var tablerows = $('#trows tr td:nth-child(2)');
            requestStops = ""

            if (tablerows.length > 0 ) {
                $("#info").text("Glissez et déplacez un lieu de votre liste pour changer l’ordre")
                if (changeOrderFirstTime) {
                    $("#info").fadeOut(250).fadeIn(250).fadeOut(250).fadeIn(250);
                    changeOrderFirstTime = false
                }
                
                tablerows.each(function() {
                    var stop = $(this).eq(0).text();
                    if (requestStops == "") {
                        requestStops += stop
                    }
                    else {
                        requestStops += ":" + stop
                    }     
                });
                
                fetch("webservice/"+requestStops).then(res=>res.json()).then(function(json) {
                    if(json['error'] != "NOT VALID") {
                        $('#distance').val(json['calculated'].toFixed(2)).change();
                        $("#distance").fadeOut(250).fadeIn(250).fadeOut(250).fadeIn(250);
                    }
                });
            }
            else {
                initalTable()
            }
        }
        
        function clearTable() {
            $("#stops[name='stop']").val("default").change();
            var tablerows = $('#trows');
            tablerows.remove();
            var table = $('#table');
            table.append("<tbody id='trows'></tbody>")
            configureSorting();
            initalTable();
        }

        function printDistance() {
            var tablerows = $('#trows tr td:nth-child(2)');
            requestStops = ""
            
            console.log(tablerows);
            

            tablerows.each(function() {
                var stop = $(this).eq(0).text();
                if (requestStops == "") {
                    requestStops += stop
                }
                else {
                    requestStops += " - " + stop
                }     
            });

            if (requestStops == "") {
                $('#popupdistance').text("Veuillez sélectionner au moins deux lieux pour calculer un trajet!")
            }
            else {
                $('#route').text(requestStops);
                $('#popupdistance').text(": Distance = " + $('#distance').val() + " km");
            }
        }

        function addToTable() {

            if (tableReady) {
                var tablerows = $('#trows');
                tablerows.remove();
                var table = $('#table');
                table.append("<tbody id='trows'></tbody>")
                $('#distance').text("0.00");
                configureSorting();
                tableReady = false;
            }

            var id = $("#stops option:selected").val();
            if (currentSelectedStop != id) {
                currentSelectedStop = id;
                firstAdded = true;
            }
            else {
                firstAdded = false;
            }
            
            var tablerows = $('#trows');
            tablerows.append("<tr id='stop'><td class='hamburger' ><img src='{{ url_for('static', filename='img/hamIcon.png') }}' align='left' style='width:32px;height:32px;'/></td><td class='text-center' value='"+id+"'>" + id + "</td><td class='bin' onclick='deleteStop($(this))' ><img src='{{ url_for('static', filename='img/bin.png') }}' align='left' style='width:32px;height:32px;'/></td></tr>")
            calculateDistance()
        }

        function deleteStop(row) {
            row.closest("tr").remove();
            calculateDistance()
        }

        var insideTable = false;

        function printMousePos(event) {
            // console.log("x: " + event.clientX + " - y: " + event.clientY);
            mouseX = event.clientX;
            mouseY = event.clientY;

            margin = 40;

            tableWidth = $("table").width();
            tableHeight = $("table").height();
            tablePositionTop = $("table").position()["top"];
            tablePositionLeft = $("table").position()["left"];

            // console.log("WIDTH: " + tableWidth);
            // console.log("HEIGHT: " + tableHeight);

            // console.log("POSTOP: " + tablePositionTop)
            // console.log("POSLEFT: " + tablePositionLeft)

            if (mouseX > (tablePositionLeft - margin) && mouseX < (tablePositionLeft + tableWidth + margin) 
                && mouseY > (tablePositionTop - margin) && mouseY < (tablePositionTop + tableHeight + margin)) {
                insideTable = true;
            }
            else {
                insideTable = false;
            }
            if (!insideTable && draggedItem != undefined) {
                draggedItem.addClass("ui-helper");
            }
            else {
                if (draggedItem != undefined) {
                    draggedItem.removeClass("ui-helper");
                }
            }

        }

        var draggedItem;
        $(document).mousemove(printMousePos)

        function configureSorting() {
            $('tbody').sortable({
                tolerance: 'move',
                cursor: 'move',
                handle: function(e, ui) {
                    dragged = true;
                },
                over: function (e, ui) {
                    draggedOut = false;
                    $(ui.helper).removeClass("ui-helper");  
                    if (removeFromListFirstTime) {
                        $("#info").text("Glissez et déplacez un lieu de votre liste pour l'effacer")
                        $("#info").fadeOut(250).fadeIn(250).fadeOut(250).fadeIn(250);
                        removeFromListFirstTime = false
                    }   
                },
                out: function (e, ui) {
                    draggedOut = true;
                    draggedItem = $(ui.helper);
                },
                beforeStop: function(e, ui) {
                    if (dragged && draggedOut && !insideTable) {
                        ui.item.remove();
                    }
                    draggedOut = false;
                    draggedItem = undefined
                },
                stop: function(e, ui) {
                    dragged = false;
                    draggedOut = false;
                    calculateDistance()
                    $("#info").text("Glissez et déplacez un lieu de votre liste pour changer l’ordre")
                }
            });
            $('tbody').on('sortupdate',function() {
                calculateDistance()
            });
            $( "tbody" ).disableSelection();
        }
        
        function loadStops() {
            var select = $('#stops');
            fetch("stops/").then(res=>res.json()).then(function(json) {
                var stops = json.records

                for (let index = 0; index < stops.length; index++) {
                    const stop = stops[index].name;

                    select.append('<option value="'+stop+'" ">' + stop + '</option>');
                } 
                select.selectpicker("refresh");
            });
        }

        function initalTable() {
            var tablerows = $('#trows');
            tablerows.append("<tr id='stop'><td class='hamburger' ><img src='{{ url_for('static', filename='img/hamIcon.png') }}' align='left' style='width:32px;height:32px;'/></td><td class='text-center' value='default-row'></td><td class='bin' onclick='deleteStop($(this))' ><img src='{{ url_for('static', filename='img/bin.png') }}' onclick='deleteStop()' align='left' style='width:32px;height:32px;'/></td></tr>")
            tablerows.append("<tr id='stop'><td class='hamburger' ><img src='{{ url_for('static', filename='img/hamIcon.png') }}' align='left' style='width:32px;height:32px;'/></td><td class='text-center' value='default-row'></td><td class='bin' onclick='deleteStop($(this))' ><img src='{{ url_for('static', filename='img/bin.png') }}' onclick='deleteStop()' align='left' style='width:32px;height:32px;'/></td></tr>")
            tablerows.append("<tr id='stop'><td class='hamburger' ><img src='{{ url_for('static', filename='img/hamIcon.png') }}' align='left' style='width:32px;height:32px;'/></td><td class='text-center' value='default-row'></td><td class='bin' onclick='deleteStop($(this))' ><img src='{{ url_for('static', filename='img/bin.png') }}' onclick='deleteStop()' align='left' style='width:32px;height:32px;'/></td></tr>")
            
            if (addFirstTime) {
                $("#info").text("Ajoutez des lieux avec le menu en haut à gauche ");
                $("#info").fadeOut(250).fadeIn(250).fadeOut(250).fadeIn(250);
                addFirstTime = false
            }
            
            tableReady = true;
            $('#distance').val("0.00");
        }
        
        function msieversion() {

            var ua = window.navigator.userAgent;
            var msie = ua.indexOf("MSIE ");

            if (!(msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)))  // If Internet Explorer, return version number
            {
                $("#attention").hide()
            }

            return false;
        }

        function setup() {    
            msieversion();  
            var select = $('#stops');
            select.append("<option selected disabled hidden value='default'>Veuillez sélectionner un lieu</option>");
            loadStops();
            $('#stops:first').focus();
            initalTable()
            configureSorting();
        }