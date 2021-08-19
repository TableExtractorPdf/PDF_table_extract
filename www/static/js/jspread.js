


var leaf = {
    title: "#476B4B",
    border: "#BDBDBD",
    header: "#667B68",
    headerTxt: "#F2D852",
    body: '#EEF5E8',
    bodyAlt: "#FFFFFF",
    bodyTxt: "#353535"
}

var metal = {
    title: "#818283",
    border: "#BDBDBD",
    header: "#3E3F40",
    headerTxt: "#F0F0F2",
    body: '#D1D2D5',
    bodyAlt: "#D8D9DB",
    bodyTxt: "#0C0C0D"
}

var aqua = {
    title: "#004575",
    border: "#BDBDBD",
    header: "#6AAFE6",
    headerTxt: "#FFFFFF",
    body: '#C6D9E6',
    bodyAlt: "#D4DFE6",
    bodyTxt: "#004575"
}

var dark = {
    title: "#000000",
    border: "#000000",
    header: "#1E1E1E",
    headerTxt: "#CAC8CE",
    body: '#2B2C34',
    bodyAlt: '#4A4C5A',
    bodyTxt: "#CAC8CE"
}

// 새로운 spreadsheet 생성
// input: 시트를 띄울 div의 id, DATA(json), 라이센스 키
// output: Jspreadsheet 생성(void)
function createSheet(divid, bodyid, data, licenseKey) {
    var htmlButton = '\
    <button type="button" class="popOpenBtnCmmn" data-num="' + divid + '">' + divid + '</button>';

    var htmlPopup = '\
    <div id="popUp_' + divid +'" class="popCmmn">\
        <div class="popInnerBox">\
            <div class="popHead"> ' + divid + ' \
                <button class="popup-close" type="button" data-num="' + divid + '"></button>\
            </div>\
            <div class="popBody">\
                <div id="' + divid +'"></div>\
            </div>\
            <div class="popFoot">\
            </div>\
        </div>\
        <div class="popBg" data-num="' + divid + '"></div>\
    </div>';

    var body = $("body").html();
    $(`body`).html(htmlPopup+body);
    $(`#${bodyid}`).append(htmlButton);


    // var popGroup = document.createElement('div');
    // var body = document.getElementById(bodyid);
    // popGroup.setAttribute('id', 'popup-group-' + divid);
    // popGroup.innerHTML = htmlPopup;
    // body.appendChild(popGroup);

    
    ss = jspreadsheet(document.getElementById(divid), {
        csv: data,
        license: licenseKey,
        // defaultColAlign:screenLeft,
        allowComments: true,
        tableOverflow: true,
        // tableWidth:"600px",
        defaultColWidth:'auto',
        // custom toolbar --------------------------------------------------------------------------------------
        toolbar: {
            items: [
                {
                    content: 'save',
                    onclick: function () {
                        spreadsheet = document.getElementById(divid);
                        id = spreadsheet.id
                        uri = $("#" + divid).excelexportjs({
                            containerid: id,
                            datatype: 'table',
                            returnUri: true
                        });
                        temp = document.createElement('a');
                        temp.download = id;
                        temp.href = uri;
                        temp.target = '_blank';
                        
                        temp.click();
                    }
                },
                {
                    type:'divisor',
                },
                {
                    type:'select',
                    id: divid + '-font',
                    width: '160px',
                    options: ['나눔바른고딕', '마루 부리', '넥슨 고딕', 'Arial',],
                    render: function(e) {
                        return '<span style="font-family:' + e + '">' + e + '</span>';
                    },
                    onchange: function(a,b,c,d) {
                        spreadsheet = document.getElementById(divid).jexcel;
                        $('#' + divid).find('td[data-x][data-y]').css('font-family', d);
                        // spreadsheet.setStyle(spreadsheet.getSelected(), 'font-family', d);
                        
                        setAutoWidth(divid)
                    }
                },
                {
                    type: 'select',
                    width: '50px',
                    options: ['format_align_left','format_align_center','format_align_right','format_align_justify'],
                    render: function(e) {
                        return '<i class="material-icons">' + e + '</i>';
                    },
                    onchange: function(a,b,c,d) {
                        if(spreadsheet.getSelected() == null) {
                            if (d == 'format_align_left') {
                                $('#' + divid).find('td[data-x][data-y]').css('text-align', 'left');
                            } else if (d == 'format_align_center') {
                                $('#' + divid).find('td[data-x][data-y]').css('text-align', 'center');
                            } else if (d == 'format_align_right') {
                                $('#' + divid).find('td[data-x][data-y]').css('text-align', 'right');
                            } else if (d == 'format_align_justify') {
                                $('#' + divid).find('td[data-x][data-y]').css('text-align', 'justify');
                            }
                        } else {
                            if (d == 'format_align_left') {
                                table.setStyle(table.getSelected(), 'text-align', 'left');
                            } else if (d == 'format_align_center') {
                                table.setStyle(table.getSelected(), 'text-align', 'center');
                            } else if (d == 'format_align_right') {
                                table.setStyle(table.getSelected(), 'text-align', 'right');
                            } else if (d == 'format_align_justify') {
                                table.setStyle(table.getSelected(), 'text-align', 'justify');
                            }
                        }
                        
                    }
                },
                {
                    type: 'i',
                    content: 'format_bold',
                    onclick: function(a,b,c) {
                        spreadsheet = document.getElementById(divid).jexcel;
                        spreadsheet.setStyle(spreadsheet.getSelected(), 'font-weight', 'bold');
                    }
                },
                {
                    type: 'i',
                    content: 'format_color_text',
                    onclick: function(element, instance, item) {
                        if (! item.color) {
                            var colorPicker = jSuites.color(item, {
                                onchange:function(o, v) {
                                    spreadsheet = document.getElementById(divid).jexcel;
                                    spreadsheet.setStyle(spreadsheet.getSelected(), 'color', v);
                                }
                            });
                            colorPicker.open();
                        }
                    }
                },
                {
                    type: 'i',
                    content: 'format_color_fill',
                    onclick: function(element, instance, item) {
                        if (! item.color) {
                            var colorPicker = jSuites.color(item, {
                                onchange:function(o, v) {
                                    spreadsheet = document.getElementById(divid).jexcel;
                                    spreadsheet.setStyle(spreadsheet.getSelected(), 'background-color', v);
                                }
                            });
                            colorPicker.open();
                        }
                    }
                },
                {
                    type: 'i',
                    id: divid + '-autoWidth',
                    content: 'wb_auto',
                    onclick: function() {
                        setAutoWidth(divid);
                    }
                },
                {
                    type: 'select',
                    content: 'palette',
                    options: ['leaf', 'metal', 'aqua', 'dark'],
                    render: function(e) {
                        return '<span style="font-family:넥슨고딕; color:' + eval(e).title + '">' + e;
                    },

                    onchange: function(a,b,c,d) {
                        style = d;
                        
                        if(style == "leaf") {
                            applyPreset(divid, leaf.header, leaf.headerTxt, leaf.body, leaf.bodyAlt, leaf.bodyTxt, leaf.border);
                        } else if(style == "metal") {
                            applyPreset(divid, metal.header, metal.headerTxt, metal.body, metal.bodyAlt, metal.bodyTxt, metal.border);
                        } else if(style == "aqua") {
                            applyPreset(divid, aqua.header, aqua.headerTxt, aqua.body, aqua.bodyAlt, aqua.bodyTxt, aqua.border);
                        } else if(style == "dark") {
                            applyPreset(divid, dark.header, dark.headerTxt, dark.body, dark.bodyAlt, dark.bodyTxt, dark.border);
                        }

                        setAutoWidth(divid)
                    }
                }
            ]
        },

        onload: function() {
            applyPreset(divid, leaf.header, leaf.headerTxt, leaf.body, leaf.bodyAlt, leaf.bodyTxt, leaf.border);
            $('#' + divid).find('td[data-x][data-y]').css('font-family', '나눔바른고딕');
            
        },

        onchangestyle: function() {
            setAutoWidth(divid);
        },

        // custom toolbar end -----------------------------------------------------------------------
        wordWrap: false,
        plugins: [
            { name:'autoWidth', plugin:jss_autoWidth},
        ],
    });

    
    return ss
}


function setAutoWidth(sheetId) {
    spreadsheet = document.getElementById(sheetId).jexcel;
    cols = spreadsheet.colgroup.length;
    for(let i = 0; i < cols; i ++) {
        spreadsheet.setWidth(i, 'auto');
    }
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



function setTableBorder(divid, borderStyle) {
    spreadhseet = document.getElementById(divid).jexcel;
    cols = spreadsheet.colgroup.length - 1;
    rows = spreadsheet.rows.length - 1;
    $("#spreadsheet").find('[data-x="0"][data-y]').css('border-left', borderStyle);
    $("#spreadsheet").find('[data-x][data-y="0"]').css('border-top', borderStyle);
    $("#spreadsheet").find('[data-x= ' + cols + '][data-y]').css('border-right', borderStyle);
    $("#spreadsheet").find('[data-x][data-y= ' + rows + ']').css('border-bottom', borderStyle);
}
    
function setStyleRange(divid, address, style) {
    var foo = function(val) {
        let base = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', i, j, result = 0;
        for (i = 0, j = val.length - 1; i < val.length; i += 1, j -= 1) {
            result += Math.pow(base.length, j) * (base.indexOf(val[i]) + 1);
        }
        return result;
    };

    addrList = address.split(':');

    if(addrList.length < 2) {
        addrList[1] = addrList[0];
    } 

    // (only letter[=col address], only number)
    strAddr = [addrList[0].replace(new RegExp("[(0-9)]", "gi"), ""), 
                addrList[0].replace(/[a-z]/gi,"")];

    endAddr = [addrList[1].replace(new RegExp("[(0-9)]", "gi"), ""),
                addrList[1].replace(/[a-z]/gi,"")];

    // restore transed value
    strAddr[0] = [strAddr[0]].map(foo).toString();
    endAddr[0] = [endAddr[0]].map(foo).toString();

    $('#' + divid).find('td[data-x][data-y]').each( function() {
        let col = $(this).attr('data-x');
        let row = $(this).attr('data-y');
        col ++, row ++;
        if(col >= strAddr[0] && col <= endAddr[0]) {
            if(row >= strAddr[0] && row <= endAddr[1]) {
                $(this).css(style);
            }
        }
    })
}

$(function(){
    // setPop();
});

function setPop() {
    var popOpenBtn = $('.popOpenBtnCmmn');
    
    //팝업 열기
    // popOpenBtn.on('click',function(){
    $('.popOpenBtnCmmn').on('click',function(){
        var divid = $(this).attr('data-num');
        $('#popUp_'+ divid).fadeIn();
        var popupWidth = $('#popUp_' + divid).find('.popBody').width();
        var popupHeight = $('#popUp_' + divid).find('.popInnerBox').height() * 0.75;
        setAutoWidth(divid);
        $(".popOpenBtnCmmn").hide();
        console.log(popupWidth);
        $('#' + divid).find('.jexcel_overflow').css("width", popupWidth + "px");
        $('#' + divid).find('.jexcel_content').css("max-width", popupWidth + "px");
        $('#' + divid).find('.jexcel_content').css("max-height", popupHeight + "px");
        $('#popUp_' + divid).find('.popInnerBox').draggable();
    });
    
    //팝업 닫기
    $('.popBg, .popup-close').on('click',function(){
      var divid = $(this).attr('data-num');
      $(".popOpenBtnCmmn").show();
      
      $('#popUp_'+ divid).fadeOut();
    })
  }