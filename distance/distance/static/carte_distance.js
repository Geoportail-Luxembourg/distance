/*!
 * Ext JS Library 3.3.0
 * Copyright(c) 2006-2010 Ext JS, Inc.
 * licensing@extjs.com
 * http://www.extjs.com/license
 */


Ext.onReady(function(){


  	//définition des champs
	var fields = [
		{name: 'name', mapping : 'name'}
	];

    //création d'un store pour la colonne de gauche
    var firstGridStore = new Ext.data.JsonStore({
        	fields : fields,
        	autoLoad: true,
		    url   : 'stops',
		    root   : 'records'
    });


	// Modèle de colonnes pour les grilles
	var cols = [
		{ id : 'name', header: "Lieu", width: 100, sortable: true, dataIndex: 'name'}
		
	];

	// Grille de gauche
    var firstGrid = new Ext.grid.GridPanel({
	ddGroup          : 'firstGridDDGroup',
        store            : firstGridStore,
        columns          : cols,
        enableDragDrop   : true,
        stripeRows       : true,
      //  autoExpandColumn : 'name',
        
        //doubleclic
        listeners : {
            'celldblclick' : function(grid,rowIndex,columnIndex, evt) {
                record = grid.store.getAt(rowIndex);
                //grid.store.remove(record);
                addRecord(record);
            }
        },
        //remplir la petite fenêtre qui est montrée lors du drag and drop
        selModel :  new Ext.grid.RowSelectionModel({  
                 singleSelect:true,  
                 listeners: {  
                        'beforerowselect': function(t,r,k,rec){  
                         firstGrid.ddText = rec.data.name;
                     }  
                 }  
             })  
    });

    // création du store de destination (itinéraire)
    var secondGridStore = new Ext.data.JsonStore({
        fields : fields,
        root   : 'records',
        //lorsque le contenu de ce store change, on appelle la fonction getHecto qui fait la mise à jour du champ à bas à droite
        listeners        :{  
            'datachanged' : function() {
                //alert ('data changed');
                getHecto();
            },
            'update' : function() {
                //alert ('update');
                getHecto();
            },
            'add' : function() {
                //alert ('data added');
                getHecto();
            },
            'remove': function() {
                //alert ('data removed');
                getHecto();
            }
        }
    });

    // création de la grille de droite
    var secondGrid = new Ext.grid.GridPanel({
	ddGroup          : 'firstGridDDGroup',
        store            : secondGridStore,
        columns          : cols,
        enableDragDrop   : true,
        ddText : 'moving record',
        stripeRows       : true,
        autoExpandColumn : 'name',
        title            : 'Lieux sélectionnés / Itinéraire',
        //doubleclic
        listeners : {
            'celldblclick' : function(grid,rowIndex,columnIndex, evt) {
                record = grid.store.getAt(rowIndex);
                grid.store.remove(record);
                //firstGrid.store.add(record);
                //firstGrid.store.sort('name', 'ASC');
            }
        
        },
        //remplir la petite icône qui est affichée lors du drag and drop
        selModel :  new Ext.grid.RowSelectionModel({  
                 singleSelect:true,  
                 listeners: {  
                        'beforerowselect': function(t,r,k,rec){  
                         secondGrid.ddText = rec.data.name;
                     }  
                 }  
             })  
        
    });


    //combo de recherche dans la grille de gauche
    var cb = new Ext.form.ComboBox({
        typeAhead: true,
        triggerAction: 'all',
        lazyRender:true,
        mode: 'local',
        store: firstGridStore,
        allowBlank : true,
        autoSelect : true,
        clearFilterOnReset : true,
        forceSelection: true,
        height: 20,
        listWidth : 0.001,
        valueField: 'name',
        emptyText: 'Recherchez un lieu',
        hideTrigger: true,
        displayField: 'name',
        minChars: 0,
        queryDelay : 50,
        typeAheadDelay: 400,
        listeners : {
            'select' : function(cb,record,idx) {
                //firstGrid.store.remove(record);
                    addRecord(record);
                },
            'change' : function(t,_new,_old){
                if (_new.length == 0) {
                    firstGridStore.loadData(myData);
                    }
                }
            
        
            }
    });
    //fonction pour rajouter un élément dans la grille de droite (s'occupe du clônage)
    function addRecord(record) {
        if (secondGrid.store.find('name',record.data.name)>-1){
            rec = record.copy();
            rec.id = new Date().getTime();
            secondGrid.store.add(rec);
        } else {
            secondGrid.store.add(record);
            }
        
    };
    
    //panneau de gauche (qui combine combo et grille)
    var insidePanel = new Ext.Panel({
        height       : 300,
        layout: 'vbox',
        title            : 'Lieux disponibles',
        defaults     : { flex : 1 }, //auto stretch
		layoutConfig : { align : 'stretch' },
        items: [cb, firstGrid]
    });
    
	//Paneau principal
	var displayPanel = new Ext.Panel({
		height       : 300,
		layout       : 'hbox',
		renderTo     : 'panel',
		defaults     : { flex : 1 }, //auto stretch
		layoutConfig : { align : 'stretch' },
		items        : [
			insidePanel,
			secondGrid
		],
		bbar    : [
			 // Fill
			{
				text    : 'Tout effacer',
				handler : function() {
					//refresh source grid
					firstGridStore.reload();

					//purge destination grid
					secondGridStore.removeAll();
                    setHecto(0);
                    
				}
                },{
				text    : 'Imprimer',
				handler : function() {
                        ar = secondGridStore.getRange();
                        stops = new Array();
                        for (var i = 0;i<ar.length;i++){
                            stops.push(ar[i].data.name);
                        }
                        printGrid(stops,displayPanel.getBottomToolbar().items.items[4].getValue());
				}
                },'->','-',
                {
                    xtype : 'displayfield',
                    value : 'Distance = 0 km '
                    },'-',' '
                    
		]
	});
    function setHecto(valeur) {
        var txt = "Distance = "+valeur+" km "
        displayPanel.getBottomToolbar().items.items[4].setValue(txt);
    }
    
    //fonction qui met à jour le champ en bas à droite en fonction du contenu de la seconde grille
    function getHecto() {
        ar = secondGridStore.getRange();

        var stops = new Array();
        //alert (from +" - "+to);
        for (var i = 0; i< ar.length; i++){
            stops.push(ar[i].data.name);
        }
        //alert (vias);
        baseUrl="webservice/";

        url=encodeURI(baseUrl+stops.join(":")+"?format=text");
        if (ar.length > 1){
            Ext.Ajax.request({ url: url ,
               method: 'GET',
               success: function(responseObject){
                 var obj = Ext.decode(responseObject.responseText);
                 setHecto(obj);
                 //return obj;
                 },
               failure: function(responseObject){
                 var obj = Ext.decode(responseObject.responseText);
                 //return obj;
                 }
            });
        }
    };
    
	// used to add records to the destination stores
	var blankRecord =  Ext.data.Record.create(fields);

        /****
        * Setup Drop Targets
        ***/
        // This will make sure we only drop to the  view scroller element
        
        //cette partie controle de le drop de droite à gauche
        var firstGridDropTargetEl =  firstGrid.getView().scroller.dom;
        var firstGridDropTarget = new Ext.dd.DropTarget(firstGridDropTargetEl, {
                ddGroup    : 'firstGridDDGroup',
                notifyDrop : function(ddSource, e, data){
                        if (ddSource.grid != firstGrid){
                            var records =  ddSource.dragData.selections;
                            Ext.each(records, ddSource.grid.store.remove, ddSource.grid.store);
                            //firstGrid.store.add(records);
                            //firstGrid.store.sort('name', 'ASC');
                            return true}
                }
        });

      

        // This will make sure we only drop to the view scroller element
        //cette partie controle de le drop de gauche à droite
        var secondGridDropTargetEl = secondGrid.getView().scroller.dom;
        var secondGridDropTarget = new Ext.dd.DropTarget(secondGridDropTargetEl, {
                ddGroup    : 'firstGridDDGroup',
                notifyDrop : function(ddSource, e, data){
                        if (ddSource.grid == secondGrid){
                            var newIdx = ddSource.getDragData(e).rowIndex;
                            recs = ddSource.grid.store.getRange();
                            ddSource.grid.store.removeAll();
                            for (var i = 0; i< recs.length;i++){
                                 
                                if (i == newIdx){
                                ddSource.grid.store.add(data.selections);}
                                
                                if (data.selections[0].id != recs[i].id){
                                ddSource.grid.store.add(recs[i]);}
                               }
                            
                        }else{
                        var records =  ddSource.dragData.selections;
                        Ext.each(records, addRecord,    ddSource.grid.store);
                        //addRecord(records);
                       // secondGrid.store.sort('name', 'ASC');
                        return true
                        }
                }
        });

        //fonction qui est appelée lors du clic sur "imprimer" -> affiche un mesasgebox pour l'instant
        function printGrid(stops,hect){
            if (stops.length < 2) {
                txt = 'Veuillez sélectionner au moins deux lieux pour calculer un trajet!';
                _buttons = Ext.MessageBox.OK;
                _multiline = false;
                txt2 ='';
            }else{
                txt = "Copiez la ligne suivante et inséréz-la dans un document:"
                txt2 = stops.join(" - ") + " : " + String(hect).replace('&nbsp;',' ') ;
                _buttons = Ext.MessageBox.OK;
                _multiline = true;
            }
            Ext.MessageBox.show({
                title: 'Itinéraire',
                msg: txt,
                width:500,
                buttons: _buttons,
                value : txt2,
                multiline: _multiline
           
            });

                   
        };
        //contenu de la boîte d'explication
         var contenu = '<p>&nbsp;</p><p><b>Rajoutez un lieu</b> à la colonne de droite, en passant par une des actions suivantes:</p> \
                <ul> \
                <li> Tirez un lieu de la liste à gauche vers la droite </li>\
                <li> Saisissez un nom de lieu et tapez Enter </li>\
                <li> Faites un double-clic sur un élément de la liste de gauche </li>\
                </ul> \
                <p>&nbsp;</p> \
                <p><b>Enlevez un lieu</b> de la liste de droite: \
                <ul> \
                <li>en le glissant vers la gauche \
                <li>en faisant un double-clic.</p></ul> \
                <p>&nbsp;</p> \
                <p><b>Changez l\'ordre</b> des arrêts en les glissant dans le tableau de droite.</p> \
                <p>&nbsp;</p>\
                <p>Le métrage de votre itinéraire est affiché en bas à droite du tableau.</p>'
            
       
       //boîte d'explications 
       var testWin = new Ext.Panel({
            title: '<center>Pour définir votre itinéraire :</center>',
            height: 220,
            renderTo: 'texte',
            constrain: true,
            items:[{html:contenu,autoScroll:true}],
            layout:'fit'
            
            
          }     
        );
        
});
