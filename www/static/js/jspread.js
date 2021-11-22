spreadSheets = [];
isPopupOpen = false;
var leaf = {
    title: "#476B4B",
    // border: "#BDBDBD",
    header: "#667B68",
    headerTxt: "#F2D852",
    body: '#EEF5E8',
    bodyAlt: "#FFFFFF",
    bodyTxt: "#353535"
}

var metal = {
    title: "#818283",
    // border: "#BDBDBD",
    header: "#3E3F40",
    headerTxt: "#F0F0F2",
    body: '#D1D2D5',
    bodyAlt: "#D8D9DB",
    bodyTxt: "#0C0C0D"
}

var aqua = {
    title: "#004575",
    // border: "#BDBDBD",
    header: "#6AAFE6",
    headerTxt: "#FFFFFF",
    body: '#C6D9E6',
    bodyAlt: "#D4DFE6",
    bodyTxt: "#004575"
}

var dark = {
    title: "#000000",
    // border: "#000000",
    header: "#1E1E1E",
    headerTxt: "#CAC8CE",
    body: '#2B2C34',
    bodyAlt: '#4A4C5A',
    bodyTxt: "#CAC8CE"
}

function createSheet(page, index, merge_meta, data, licenseKey) {
    divid = 'page-' + page + '-table-' + index; 
    var htmlPopup = '\
    <button type="button" id="btn_' + divid +'" class="popOpenBtnCmmn" index="' + spreadSheets.length + '"sheet-name="' + divid + '">' + divid + '</button>\
    <div id="popUp_' + divid +'" class="popCmmn">\
        <div class="popInnerBox">\
            <div class="popHead"> ' + divid + ' \
                <button class="popup-close" type="button" sheet-name="' + divid + '"></button>\
            </div>\
            <div class="popBody">\
                <div id="' + divid +'"></div>\
            </div>\
            <div class="popFoot">\
            </div>\
        </div>\
        <div class="popBg" sheet-name="' + divid + '"></div>\
    </div>';

    $('#table_printer').append(htmlPopup);
    
    var spreadSheet = jspreadsheet(document.getElementById(divid), {
        data: data,
        license: licenseKey,
        defaultColAlign:screenLeft,
        allowComments: true,
        tableOverflow: true,
        wordWrap: true,
        defaultColWidth:'10px'
        // tableHeight: '600px',
    });
    // setMerge(merge_meta, spreadSheet);
    var sheetObject = {
        table: spreadSheet,
        page: page,
        divid: divid,
        index: index
    }
    
    processTable(merge_meta, sheetObject);
    spreadSheets.push(sheetObject)
}

function showTableByPage(page) {
    spreadSheets.forEach(function(item) {
        if(item.page == String(page)) {
            $('#btn_' + item.divid).show()
        } else {
            $('#btn_' + item.divid).hide()
        }

    });
}

function applyPreset(divid, header, headerTxt, body, bodyAlt, bodyTxt, border) {
    $('#' + divid).find('td[data-x][data-y]').each( function() {
        let row = $(this).attr('data-y');
        $(this).css({"border": "1px solid " + border,  "color":bodyTxt});

        if(row == 0) {
            $(this).css({"background-color":header, "color":headerTxt});
        } else if(row % 2 == 0) {
            $(this).css({"background-color":body});
        } else {
            $(this).css({"background-color":bodyAlt});
        }
    })
}

function setPop() {
    var popOpenBtn = $('.popOpenBtnCmmn');

    //팝업 열기
    popOpenBtn.on('click',function(){
        isPopupOpen = true
        var divid = $(this).attr('sheet-name');
        var index = $(this).attr('index');
        console.log(divid)
        $('#popUp_'+ divid).css('visibility', 'visible')
        var popupWidth = $('#popUp_' + divid).find('.popInnerBox').width()
        var popupHeight = $('#popUp_' + divid).find('.popInnerBox').height() * 0.75;
        $('#' + divid).find('.jtabs-content').css("max-width", popupWidth + "px");
        $('#' + divid).find('.jss_content').css("max-height", popupHeight + "px");
        $('#popUp_' + divid).find('.popInnerBox').draggable({ 
            handle : '.popHead' // drag 대상 안 특정 요소에 제한 (여러개 사용 가능) }
        });
        $('.popCmmn').css('z-index', '9999');
    })

    //팝업 닫기
    $('.popBg, .popup-close').on('click',function(){
        var divid = $(this).attr('sheet-name');
        
        $('#popUp_'+ divid).css('visibility', 'hidden')
        isPopupOpen = false
    })
}
function processTable(meta_list, sheet) {
    table = sheet.table;
    divid = sheet.divid;
    meta_list.forEach(function(item, index, array) {
        item = JSON.parse(item);
        var address = item.address
        var colspan = item.size[0]
        var rowspan = item.size[1]
        table.setMerge(address, colspan, rowspan)
    });
    
    applyPreset(divid, leaf.header, leaf.headerTxt, leaf.body, leaf.bodyAlt, leaf.bodyTxt, leaf.border);
    autoWidth(table, meta_list);
}

function downloadSheets() {
    exportObjs = []
    jspreadsheet.download(spreadSheets[0].divid)
    // spreadSheets.forEach(function(sheetObject) {
    //     uri = $("#" + sheetObject.divid).excelexportjs({
    //         containerid: sheetObject.divid,
    //         datatype: 'table',
    //         returnUri: true
    //     });
    //     // exportObj = {"name": sheetObject.divid, "uri": uri}
    //     // exportObjs.push(exportObj)
        
    //     temp = document.createElement('a');
    //     temp.download = sheetObject.divid;
    //     temp.href = uri;
    //     temp.target = '_blank';
        
    //     temp.click();
    // });
    // $.ajax({
    //     url:"/downloadSheets",
    //     data:{"exportObjs" : JSON.stringify(exportObjs)},
    //     datatype:"json",
    //     type:"post",
    //     success: function(result) {
    //         if(result == "success") {
    //             alert("작업 성공, 모든시트 다운로드 완료했습니다.");
    //         } else {
    //             alert("작업에 실패하였습니다.");
    //         }
    //     },
    //     error: function() {
    //         alert("error 발생했습니다.");
    //     }
    // })
}

download = (function(el) {
    var data = '';

    var plugin = {};
    var worksheets = [];
    var styles = {};
    var styleIndex = 1;

    /**
     * Helpers to deal with the export to jexcel to excel
     */
    var helpers = function() {
        var o = {};
        o.getData = function() {
            // Create XML cell
            var get = function(o) {
                if (! o.data && ! o.comments) {
                    return '<Cell/>';
                } else {
                    return `<Cell${o.styleId}${o.formula}><Data ss:Type="${o.type}">${o.data}</Data>${o.comments}</Cell>`;
                }
            }

            // Containers
            var rows = [];
            var cols = [];

            // Get data
            this.data = this.instance.data(null, false, false);
            for (var j = 0; j < this.data.length; j++) {
                cols = [];
                for (var i = 0; i < this.data[j].length; i++) {
                    // Create cells
                    var o = { styleId:'', type:'', data:'', formula:'' };
                    // Column name
                    o.columnName = jexcel.helpers.getColumnNameFromCoords(i, j);
                    // Set data;
                    o.data = this.data[j][i];
                    // Get comments
                    o.comments = this.getComments(o.columnName);
                    // Style
                    o.styleId = this.getStyle(o.columnName, i, j);
                    // Type
                    if (this.instance.options.columns[i].type == 'calendar') {
                        o.styleId = ' ss:StyleID="calendar"';
                        o.type = 'DateTime';
                    } else if (this.instance.options.columns[i].type == 'checkbox' || this.instance.options.columns[i].type == 'radio') {
                        o.type = 'String'
                    } else if (jSuites.isNumeric(o.data)) {
                        o.type = 'Number';
                    } else {
                        o.type = 'String';
                    }
                    // Formulas
                    if ((''+o.data).substr(0,1) == '=') {
                        o.formula = ' ss:Formula="' + this.getFormula(o.data) + '"';
                        o.data = this.instance.records[j][i].element ? this.instance.records[j][i].element.innerHTML : '';
                    }
                    // Add value
                    cols.push(get(o));
                }

                rows.push('<Row>' + cols.join('') + '</Row>');
            }

            // Width
            var width = '';
            for (var i = 0; i < this.instance.headers.length; i++) {
                width += '<Column ss:AutoFitWidth="0" ss:Width="' +  parseInt(this.instance.options.columns[i].width) + '"/>';
            }

            // Formatted data
            this.data = `<Worksheet ss:Name="${this.name}"><Table>${width}${rows.join('')}</Table></Worksheet>`;;
        }

        o.getFormula = function(formula) {
            // Valid token
            var token = new RegExp(/([A-Z]+[0-9]+)(:[A-Z]+[0-9]+)?/i);
            // Tokenize formula
            var newFormula = jexcel.helpers.tokenize(formula, true);
            // Update token
            var updateToken = function(v) {
                if (v.indexOf('!') == -1) {
                    var c = jexcel.helpers.getCoordsFromColumnName(v);
                    var t = '';
                } else {
                    var f = newFormula[i].split('!');
                    var c = jexcel.helpers.getCoordsFromColumnName(f[1]);
                    var t = f[0] + '!';
                }

                var x1 = c[0] + 1;
                var y1 = c[1] + 1;

                return t + 'R'+y1+'C'+x1;
            }

            for (var i = 0; i < formula.length; i++) {
                if (newFormula[i] && token.test(newFormula[i])) {
                    if (newFormula[i].indexOf(':') == -1) {
                        newFormula[i] = updateToken(newFormula[i]);
                    } else {
                        var t = newFormula[i].split(':');
                        newFormula[i] = updateToken(t[0]) + ':' + updateToken(t[1]);
                    }
                }
            }

            return newFormula.join('');
        }

        o.getComments = function(columnName) {
            var comments = '';
            if (comments = this.instance.getComments(columnName)) {
                return `<Comment><Data>${comments}</Data></Comment>`;
            } else {
                return '';
            }
        }

        o.getStyle = function(columnName, i, j) {
            if (this.instance.records[j][i].element) {
                var val = this.instance.records[j][i].element.getAttribute('style');
            } else {
                var val = this.instance.getStyle(columnName);
            }
            if (val) {
                if (! styles[val]) {
                    styles[val] = {
                        id: styleIndex++,
                        content: plugin.applyStyle(val),
                    }
                }
                return ' ss:StyleID="' + styles[val].id + '"';
            } else {
                return '';
            }
        }

        return o;
    }


    /**
     * Parse the CSS style
     */
    plugin.parseCSS = function(css) {
       var result = [];
       css = css.split(';');

       for (var i = 0; i < css.length; i++) {
           if (css[i].trim()) {
               var t = css[i].split(':');
               result[t[0].trim()] = t[1].trim();
           }
       }

       return result;
    }

    /**
     * Extract the border style
     */
    plugin.parseBorderCSS = function(css) {
        // Options
       var parsed = { 'size': null, 'color': null, 'style': null };

       // Explode
       css = css.toLowerCase().split(' ');

       for (var i = 0; i < css.length; i++) {
           if (css[i].indexOf('px') >= 0) {
               parsed.size = parseInt(css[i]);
           } else if (css[i].indexOf('#') >= 0) {
               parsed.color = plugin.rgbToHex(css[i]);
           } else if (css[i] == 'dashed') {
               parsed.style = 'dashed';
           } else if (css[i] == 'dotted') {
               parsed.style = 'dotted';
           } else if (css[i] == 'solid') {
               parsed.style = 'thin';
           }
       }

       return parsed;
    }

    /**
    * Apply the style onto excel format
    */
   plugin.applyStyle = function(css) {
       css = plugin.parseCSS(css);

       var style = [];
       var Font = [];

       if (css['font-style'] && css['font-style'] == 'italic') {
           Font.push('ss:Italic="1"');
       }

       if (css['font-weight']) {
           Font.push('ss:Bold="1"');
       }

       if (css['font-size']) {
           v = css['font-size'];
           if (! jSuites.isNumeric(v)) {
               var v = {'x-small':8,'small':10,'medium':12,'large':16,'x-large':20};
               v = v[css['font-size']] ? v[css['font-size']] : 10;
           }
           v = parseInt(v);
           if (v) {
               Font.push('ss:Size="'+v+'"');
           }
       }

       if (css['color']) {
           var v = css['color'].toUpperCase().trim();
           Font.push('ss:Color="' + plugin.rgbToHex(v) + '"');
       }

       if (css['font-family']) {
           Font.push('ss:FontName="' + css['font-family'] + '"');
       }

       if (Font.length) {
           style.push('<Font ' + Font.join(' ') + '/>');
       }

       if (css['text-align']) {
           var v = css['text-align'].charAt(0).toUpperCase() + css['text-align'].slice(1);
           style.push('<Alignment ss:Horizontal="' + v + '" />');
       }

       var Borders = [];

       var getBorder = function(a, b, position) {
           var t = [];
           
           if (! a) {
               a = {};
           }
           if (! b) {
               b = {};
           }

           if (b.style || a.style) {
               var v = b.style || a.style;
               t.push('ss:borderStyle="' + v + '"');
           }
           if (b.color || a.color) {
               var v = b.color || a.color;
               t.push('ss:Color="' + v +'"');
           }
           if (b.size || a.size) {
               var v = b.size || a.size;
               t.push('ss:Weight="' + v + '"');
           }

           if (t.length) {
               return t;
           } else {
               return false;
           }
       }

       var a = null;
       var b = null;
       var t = null;

       if (css['border']) {
           a = plugin.parseBorderCSS(css['border']);
       }

       if (css['border-top']) {
           b = plugin.parseBorderCSS(css['border-top']);
       } else {
           b = null;
       }

       if (t = getBorder(a, b)) {
           Borders.push('<Border ss:Position="Top" ss:LineStyle="Continuous" ' + t.join(' ') + '></Border>');
       }
       
       if (css['border-bottom']) {
           b = plugin.parseBorderCSS(css['border-bottom']);
       } else {
           b = null;
       }

       if (t = getBorder(a, b)) {
           Borders.push('<Border ss:Position="Bottom" ss:LineStyle="Continuous" ' + t.join(' ') + '></Border>');
       }

       if (css['border-left']) {
           b = plugin.parseBorderCSS(css['border-left']);
       } else {
           b = null;
       } 

       if (t = getBorder(a, b)) {
           Borders.push('<Border ss:Position="Left" ss:LineStyle="Continuous" ' + t.join(' ') + '></Border>');
       }

       if (css['border-right']) {
           b = plugin.parseBorderCSS(css['border-right']);
       } else {
           b = null;
       }

       if (t = getBorder(a, b)) {
           Borders.push('<Border ss:Position="Right" ss:LineStyle="Continuous" ' + t.join(' ') + '></Border>');
       }

       if (Borders.length > 0) {
           style.push('<Borders>' + Borders.join('') + '</Borders>');
       }

       if (css['background-color']) {
           var v = plugin.rgbToHex(css['background-color']);
           style.push('<Interior ss:Color="'+v+'" ss:Pattern="Solid"/>');
       }

       return style.join('');
   }

    /**
     * Create a new workbook
     */
    plugin.createWorkbook = function(o) {
        var content = '';
        for (var i = 0; i < worksheets.length; i++) {
            content += worksheets[i].data;
        }
        var style = '';
        var keys = Object.keys(styles);
        for (var i = 0; i < keys.length; i++) {
            style += '<Style ss:ID="' + styles[keys[i]].id + '">' + styles[keys[i]].content + '</Style>';
        }
        return `<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><DocumentProperties xmlns="urn:schemas-microsoft-com:office:office"><Author>${o.author}</Author><Created>${o.created}</Created></DocumentProperties><Styles>${style}<Style ss:ID="Currency"><NumberFormat ss:Format="Currency"></NumberFormat></Style><Style ss:ID="calendar"><NumberFormat ss:Format="yyyy-mm-dd hh:mm:ss"></NumberFormat></Style></Styles>${content}</Workbook>`;
    }

    /**
     * Create a worksheet object
     */
    plugin.createWorksheet =  function(jexcelInstance) {
        // Create worksheet object
        var worksheet = helpers();
        worksheet.instance = jexcelInstance;
        a = jexcelInstance;
        worksheet.name = jexcelInstance.options.worksheetName.replace(' ', '');

        // Execute
        worksheet.getData();

        // Create container
        worksheets.push(worksheet);
    }

    /**
     * Rgb to hex helpers
     */
    plugin.rgbToHex = function(color) {
        color = ""+ color;
        if (!color || color.indexOf("rgb") < 0) {
            return color;
        }

        if (color.charAt(0) == "#") {
            return color;
        }

        var nums = /(.*?)rgb\((\d+),\s*(\d+),\s*(\d+)\)/i.exec(color),
            r = parseInt(nums[2], 10).toString(16),
            g = parseInt(nums[3], 10).toString(16),
            b = parseInt(nums[4], 10).toString(16);

        return "#"+ (
            (r.length == 1 ? "0"+ r : r) +
            (g.length == 1 ? "0"+ g : g) +
            (b.length == 1 ? "0"+ b : b)
        );
    }

    /**
     * Generate excel file from jexcel
     */
    plugin.generate = function(filename, author) {
        if (! filename) {
            filename = 'jexcel';
        }
        if (! author) {
            author = 'Jexcel';
        }

        // Get worksheets
        if (Array.isArray(el.jexcel)) {
            for (var t = 0; t < el.jexcel.length; t++) {
                plugin.createWorksheet(el.jexcel[t]);
            }
        } else {
            plugin.createWorksheet(el.jexcel);
        }

        // Workbook
        var workbook = plugin.createWorkbook({
            create: (new Date()).getTime(),
            author: author,
        });

        // Blob
        var blob = new Blob(["\uFEFF"+workbook], { type: 'application/vnd.ms-excel;charset=utf-8;' });

        // IE Compatibility
        if (window.navigator && window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveOrOpenBlob(blob, filename + '.xls');
        } else {
            // Download element
            var pom = document.createElement('a');
            var url = URL.createObjectURL(blob);
            pom.href = url;
            pom.setAttribute('download', filename + '.xls');
            document.body.appendChild(pom);
            pom.click();
            pom.parentNode.removeChild(pom);
        }
    }();
});
