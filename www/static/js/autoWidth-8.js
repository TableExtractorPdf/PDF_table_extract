
/**
 * Plugin for auto width cols
 * 
 * @version 1.0.1
 * @author Guillaume Bonnaire <contact@gbonnaire.fr>
 * @website https://repo.gbonnaire.fr
 * @description auto size width of columns
 * - autosize all columns without width property
 * 
 * @license This plugin is distribute under MIT License
 */

function autoWidth(instance, meta_list) {

	function init() {
		saveStyle();
		setLayoutAuto();
		var colsWidth = getWidthColumns();
		removeLayoutAuto();
		setWidthColumn(colsWidth);
	}
	
	/**
	 * save old style before change
	 * @returns {undefined}
	 */
	function saveStyle() {
		oldValue_styleTable = instance.table.style.cssText;
	}
	
	/**
	 * set style table layout
	 * @returns {undefined}
	 */
	function setLayoutAuto() {
		instance.table.style.tableLayout="auto";
	}
	
	/**
	 * remove style table layout
	 * @returns {undefined}
	 */
	function removeLayoutAuto() {
		instance.table.style.cssText = oldValue_styleTable;
	}

	const transpose = matrix => matrix.reduce(
		(result, row) => row.map((_, i) => [...(result[i] || []), row[i]]),
		[]
	  );

	function getAlpha(num){
		var s = '', t;
		
		while (num > 0) {
			t = (num - 1) % 26;
			s = String.fromCharCode(65 + t) + s;
			num = (num - t)/26 | 0;
		}
		return s || undefined;
	}
	  
	/**
	 * get Width offset of columns
	 * @returns {jexcel.autoWidthL#16.jexcel.autoWidthL#16#L#17.getWidthColumns.cols}
	 */
	function getWidthColumns() {
		var rows = [];
		var result = [];
		var trs = $(instance.table).find("tbody>tr")
		$(trs).each(function(index){
			var tds = $(this).find('td');
			var cols = [];

			arr = [];

			for (const [key, value] of Object.entries(meta_list)) {
				arr.push( JSON.parse(value).address );
			}
			tds.each(function(index) {
				if(index > 0) {
					var td = $(this);
					var r = td.attr("data-y");
					var c = td.attr("data-x");
					r ++; c ++;
					var addr = getAlpha(c) + r;

					$(td).css("white-space", "nowrap");
					if(!arr.includes(addr)) {
						cols.push(td.outerWidth(true) * 1.2);
					} else {
						cols.push(50)
					}
					$(td).css("white-space", "pre-wrap");
				}
			});
			rows.push(cols);
		});
		var cols = transpose(rows)

		cols.forEach(function(col) {
			var maxWidth = 0
			col.forEach(function(cell) {
				if(cell > maxWidth) {
					maxWidth = cell;
				}
			})
			result.push(maxWidth)
		})
		// if(tr) {
		// 	var tds = tr.querySelectorAll("td");
			
		// 	for(var ite_td=0; ite_td<tds.length; ite_td++) {
		// 		if(ite_td==0) { // Skip index
		// 			continue; 
		// 		}
		// 		var td = tds[ite_td];
		// 		$(td).css("white-space", "nowrap");

		// 		cols.push(td.offsetWidth);
		// 	}
		// }
		return result;
	}
	
	/**
	 * defined new columns width
	 * @param {array} colsWidth
	 * @returns {undefined}
	 */
	function setWidthColumn(colsWidth) {
		// Autorize changement colsWidth
		var editable = instance.options.editable;
		instance.options.editable = true;
		instance.ignoreEvents = true;
		instance.ignoreCloud = true;
		instance.ignoreHistory = true;
		instance.ignorePersistance = true;
		if(instance.options.defaultColWidth==null || instance.options.defaultColWidth=="" || instance.options.defaultColWidth=="auto") {
			instance.options.defaultColWidth = 50;
		} else if(typeof instance.options.defaultColWidth == "string") {
			instance.options.defaultColWidth = parseInt(instance.options.defaultColWidth);                
		}
		
		// Parse cols
		for(var ite_col=0; ite_col<instance.options.columns.length; ite_col++) {
			var column = instance.options.columns[ite_col];
			if(column.width==="auto") {
				// if(colsWidth[ite_col]) {
				// 	var newWidth = Math.max(instance.options.defaultColWidth, colsWidth[ite_col]);
				// } else {
				// 	var newWidth = instance.options.defaultColWidth;
				// }
				var newWidth = colsWidth[ite_col];
				instance.setWidth(ite_col, newWidth);
			}
		}
		
		// Resize old value
		instance.ignoreEvents = false;
		instance.ignoreCloud = false;
		instance.ignoreHistory = false;
		instance.ignorePersistance = false;
		instance.options.editable = editable;
	}
	// Set default auto width on columns without width
	for(var ite_col=0; ite_col<instance.options.columns.length; ite_col++) {
		var column = instance.options.columns[ite_col];
		// if(column.width==null || column.width=='') {
			instance.options.columns[ite_col].width="auto";
		// }
	}

	init();
}

//  ;(function (global, factory) {
//     typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
//     typeof define === 'function' && define.amd ? define(factory) :
//     global.jss_autoWidth = factory();
    
//     // Compatibility Old version
//     global.jexcel_autoWidth = global.jss_autoWidth;
// }(this, (function () {
//     return (function(instance, options) {

//         // Plugin object
//         var plugin = {};
//         var oldValue_styleTable = "";

//         /**
//          * Jexcel events
//          */
//         plugin.onevent = function(event) {
//             if(event=="onload" || event=="onresizecolumn") {      
//                 init();
//             } 
//         }
        
//         /**
//          * run calculate width of columns and apply
//          * @returns {undefined}
//          */
//         function init() {
//             saveStyle();
//             setLayoutAuto();
//             var colsWidth = getWidthColumns();
//             removeLayoutAuto();
//             setWidthColumn(colsWidth);
//         }
        
//         /**
//          * save old style before change
//          * @returns {undefined}
//          */
//         function saveStyle() {
//             oldValue_styleTable = instance.table.style.cssText;
//         }
        
//         /**
//          * set style table layout
//          * @returns {undefined}
//          */
//         function setLayoutAuto() {
//             instance.table.style.tableLayout="auto";
//         }
        
//         /**
//          * remove style table layout
//          * @returns {undefined}
//          */
//         function removeLayoutAuto() {
//             instance.table.style.cssText = oldValue_styleTable;
//         }
        
//         /**
//          * get Width offset of columns
//          * @returns {jexcel.autoWidthL#16.jexcel.autoWidthL#16#L#17.getWidthColumns.cols}
//          */
//         function getWidthColumns() {
//             var cols = [];
//             var tr = instance.table.querySelector("tbody>tr");
//             if(tr) {
//                 var tds = tr.querySelectorAll("td");
//                 for(var ite_td=0; ite_td<tds.length; ite_td++) {
//                     if(ite_td==0) { // Skip index
//                         continue; 
//                     }
//                     var td = tds[ite_td];
//                     cols.push(td.offsetWidth);
//                 }
//             }
//             return cols;
//         }
        
//         /**
//          * defined new columns width
//          * @param {array} colsWidth
//          * @returns {undefined}
//          */
//         function setWidthColumn(colsWidth) {
//             // Autorize changement colsWidth
//             var editable = instance.options.editable;
//             instance.options.editable = true;
//             instance.ignoreEvents = true;
//             instance.ignoreCloud = true;
//             instance.ignoreHistory = true;
//             instance.ignorePersistance = true;
//             if(instance.options.defaultColWidth==null || instance.options.defaultColWidth=="" || instance.options.defaultColWidth=="auto") {
//                 instance.options.defaultColWidth = 50;
//             } else if(typeof instance.options.defaultColWidth == "string") {
//                 instance.options.defaultColWidth = parseInt(instance.options.defaultColWidth);                
//             }
            
//             // Parse cols
//             for(var ite_col=0; ite_col<instance.options.columns.length; ite_col++) {
//                 var column = instance.options.columns[ite_col];
//                 if(column.width==="auto") {
//                     if(colsWidth[ite_col]) {
//                         var newWidth = Math.max(instance.options.defaultColWidth, colsWidth[ite_col]);
//                     } else {
//                         var newWidth = instance.options.defaultColWidth;
//                     }
//                     instance.setWidth(ite_col, newWidth);
//                 }
//             }
            
//             // Resize old value
//             instance.ignoreEvents = false;
//             instance.ignoreCloud = false;
//             instance.ignoreHistory = false;
//             instance.ignorePersistance = false;
//             instance.options.editable = editable;
//         }
//         // Set default auto width on columns without width
//         for(var ite_col=0; ite_col<instance.worksheets.options.columns.length; ite_col++) {
//             var column = instance.options.columns[ite_col];
//             if(column.width==null || column.width=='') {
//                 instance.options.columns[ite_col].width="auto";
//             }
//         }
        
//         return plugin;
//     });

// })));