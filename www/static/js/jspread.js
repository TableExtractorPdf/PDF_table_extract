spreadSheets = [];

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
            $('#btn_' + item.divid).show();
        } else {
            $('#btn_' + item.divid).hide();
        }

    });
}

function applyPreset(divid, header, headerTxt, body, bodyAlt, bodyTxt, border) {
    $('#' + divid).find('td[data-x][data-y]').each( function() {
        console.log("DD")
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
        var divid = $(this).attr('sheet-name');
        var index = $(this).attr('index');
        console.log(divid)
        $('#popUp_'+ divid).css('visibility', 'visible')
        var popupWidth = $('#popUp_' + divid).find('.popInnerBox').width()
        var popupHeight = $('#popUp_' + divid).find('.popInnerBox').height() * 0.75;
        
        $(".popOpenBtnCmmn").hide();
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
        $(".popOpenBtnCmmn").show();
        
        $('#popUp_'+ divid).css('visibility', 'hidden')
    })
}
function processTable(meta_list, sheet) {
    var itemProcesed = meta_list.length;

    meta_list.forEach(function(item, index, array) {
        item = JSON.parse(item);
        
        var table = sheet.table;
        var divid = sheet.divid;
        var address = item.address
        var colspan = item.size[0]
        var rowspan = item.size[1]
        table.setMerge(address, colspan, rowspan)
        itemProcesed -= 1;
        if(itemProcesed == 0) {
            autoWidth(table);
            
            applyPreset(divid, leaf.header, leaf.headerTxt, leaf.body, leaf.bodyAlt, leaf.bodyTxt, leaf.border);
        }
    });
}