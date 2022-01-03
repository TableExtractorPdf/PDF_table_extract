var licenseKey = 'ODdmZWU1MWNhMjhjYTNhODQ2ZmNiNjFiZjhiNzY1NGFkM2RmYWZlZTUxYzcwY2YxZmM0YzMzZGYxYTBmOTBhNjg3NzQyMTE2NTFkNmMzY2E5NzZkZDFlY2M5ZjZjZWY0ZTcyYzE0MGUxMTRiZTE4NTQyNjgyMjIwODQ1ZDViOGIsZXlKdVlXMWxJam9pZEdGclpXNTVNVGs1T0NJc0ltUmhkR1VpT2pFMk5EQXhNekV5TURBc0ltUnZiV0ZwYmlJNld5SnNiMk5oYkdodmMzUWlMQ0pzYjJOaGJHaHZjM1FpWFN3aWNHeGhiaUk2TUN3aWMyTnZjR1VpT2xzaWRqY2lMQ0oyT0NKZGZRPT0=';

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


function createSheet(page, index, merge_meta, data, csv_path) {
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
        defaultColWidth:'10px',
        tableHeight: '60vh',
        toolbar: true,
    });
    // setMerge(merge_meta, spreadSheet);
    var sheetObject = {
        table: spreadSheet,
        page: page,
        divid: divid,
        index: index,
        csv_path: csv_path,
        merge_data: merge_meta
    }
    
    processTable(merge_meta, sheetObject);
    spreadSheets.push(sheetObject)
}

function modifySheet(page, index, merge_meta, data, csv_path) {
    spreadSheets.forEach(function(sheetObject, i) {
        
        if(sheetObject.page == page && sheetObject.index == index) {
            $('#btn_' + sheetObject.divid).remove()
            $('#popUp_' + sheetObject.divid).remove()
            spreadSheets.splice(i, 1);
            createSheet(page, index, merge_meta, data, csv_path)
            
            $('#btn_' + sheetObject.divid).show()
            setPop();
        } 
    })
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

function applyPreset(header, headerTxt, body, bodyAlt, bodyTxt, border) {
    $('.jexcel_overflow').find('td[data-x][data-y]').each( function() {
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
        // console.log(divid)

        $('#popUp_'+ divid).css('visibility', 'visible')
        var popupWidth = $('#popUp_' + divid).find('.popInnerBox').width()
        var popupHeight = $('#popUp_' + divid).find('.popInnerBox').height() * 0.75;
        $('#' + divid).find('.jtabs-content').css("max-width", popupWidth + "px");
        // $('#' + divid).find('.jss_content').css("max-height", popupHeight + "px");
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
    
    autoWidth(table, meta_list);
}

function downloadSheets() {
    $('.loader').addClass("is-active");

    exportObjs = []
    spreadSheets.forEach(function(sheetObject) {
        exportObj = {page: sheetObject.page,
                    index: sheetObject.index,
                    csv_path: sheetObject.csv_path,
                    merge_datas: sheetObject.merge_data}
        exportObjs.push(exportObj)
    });
    $.ajax({
        url:"/downloadSheets",
        data:{"exportObjs" : JSON.stringify(exportObjs)},
        datatype:"json",
        type:"post",
        success: function(result) {
            $('.loader').removeClass("is-active");
            if(result == "success") {
                alert("작업 성공, 모든시트 다운로드 완료했습니다.");
            } else {
                alert("작업에 실패하였습니다.");
            }
        },
        error: function() {
            alert("error 발생했습니다.");
        }
    })
}