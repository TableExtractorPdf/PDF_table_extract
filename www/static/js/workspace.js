
// 테이블 선택 영역 표시 함수
function set_select_areas(bboxs){
    if(bboxs != 0 || bboxs != {}){
        if(typeof bboxs === "object"){
            arrs = [];
            for(key in bboxs){
                value = bboxs[key];

                var arr = value.bbox.split(',');

                fileDimsX = Number(arr[4])
                fileDimsY = Number(arr[5])
                const imageWidth = $("img.nowImg").width();
                const imageHeight = $("img.nowImg").height();

                scalingFactorX = fileDimsX / imageWidth;
                scalingFactorY = fileDimsY / imageHeight;

                arrs.push({
                    x: Number(arr[0] / scalingFactorX),
                    y: Number(arr[1]/ scalingFactorY),
                    width: Number(arr[2]/ scalingFactorX),
                    height: Number(arr[3]/ scalingFactorY),
                });
            }
                $(".nowImg").selectAreas('add', arrs);
        }
        else{
            bboxs = bboxs.split(";");
            
            arrs = [];
            for(i=0 ; i<bboxs.length ; i++){
                var arr = bboxs[i].split(',');

                fileDimsX = Number(arr[4])
                fileDimsY = Number(arr[5])
                const imageWidth = $("img.nowImg").width();
                const imageHeight = $("img.nowImg").height();

                scalingFactorX = fileDimsX / imageWidth;
                scalingFactorY = fileDimsY / imageHeight;

                arrs.push({
                    x: Number(arr[0] / scalingFactorX),
                    y: Number(arr[1]/ scalingFactorY),
                    width: Number(arr[2]/ scalingFactorX),
                    height: Number(arr[3]/ scalingFactorY),
                });
            }
            $(".nowImg").selectAreas('add', arrs);
        }
        }
    else{
        $(".nowImg").selectAreas();
    }
}

// 테이블 선택 영역 표시 함수
function areas_to_bbox(areas, realWidth, realHeight){
    bboxs = [];
    for(i=0 ; i<areas.length ; i++){
        arrs = [];

        const imageWidth = $("img.nowImg").width();
        const imageHeight = $("img.nowImg").height();

        scalingFactorX = realWidth / imageWidth;
        scalingFactorY = realHeight / imageHeight;
        arrs.push( Number(areas[i]['x'] * scalingFactorX));
        arrs.push( Number(areas[i]['y'] * scalingFactorY));
        arrs.push( Number(areas[i]['width'] * scalingFactorX));
        arrs.push( Number(areas[i]['height'] * scalingFactorY));
        arrs.push(realWidth);
        arrs.push(realHeight);

        bboxs.push(arrs.join(','));
    }
    bboxs = bboxs.join(";");
    return bboxs;
}

function destroy_select_areas(){
    $('.nowImg').selectAreas('destroy');
    $('.nowImg').removeAttr('alt');
    $('.nowImg').removeAttr('style');
    $('.nowImg').unwrap();
    $('.nowImg').attr("class", "previewImg");
}

// 페이지 이동 함수 (pre_page는 현재 페이지, page는 이동할 페이지)
function move_page(pre_page, page){
    $('.loader').addClass("is-active");

    // $('.popCmmn').css('visibility', 'hidden')
    
    if($('.nowImg').attr("id") == "centerImg"){
        destroy_select_areas();
    }
    else{
        $('.nowImg').selectAreas('destroy');
        $('.nowImg').unwrap().unwrap();
        $('.nowImg').removeAttr('alt');
        $('.nowImg').removeAttr('style');
        $('.nowImg').attr("class", "previewImg");

        var target = $('#centerImg');
        $(target).unwrap();

        $(target).selectAreas({
            width: window.innerWidth / 3.84,
            onChanged: debugQtyAreas
        })
    }
    this_page = page;

    // 스크롤바를 현재 선택된 썸네일로 이동시키고 중간에 위치하게함
    document.getElementById('thumb_page_'+page).scrollIntoView({
        behavior: 'auto',
        block: 'center',
        inline: 'center'
    });


    // thumb_img_select 클래스가 적용된 썸네일은 빨간 테두리가 표시됨 (현재 선택된 페이지라는 뜻)
    $('#thumb_page_'+pre_page).removeClass('thumb_img_select');
    $('#thumb_page_'+page).addClass('thumb_img_select');


    var target_thumb = $('.thumb_img_select').parent().parent();
    var prv_page = -1;
    var nxt_page = -1;

    if($(target_thumb).prevAll('.thumb_page:visible:first').length > 0)
        prv_page = target_thumb.prevAll('.thumb_page:visible:first')
        .find('.thumb_img').attr("id").replace("thumb_page_", "");
        
    if($(target_thumb).nextAll('.thumb_page:visible:first').length > 0)
        nxt_page = target_thumb.nextAll('.thumb_page:visible:first')
        .find('.thumb_img').attr("id").replace("thumb_page_", "");


    $('img#centerImg').attr('src', `${job_path}/page-${page}.png`);
    
    $('img#prvImg').attr('src', `${job_path}/page-${Number(prv_page)}.png`).load(function(){
        // 정상 이미지 로딩, do nothing
    })
    .error(function(){
        $(this).attr("src", `${img_path}/page_out_of_range.png`);
    });
    $('img#nxtImg').attr('src', `${job_path}/page-${Number(nxt_page)}.png`).load(function(){
        // 정상 이미지 로딩, do nothing
    })
    .error(function(){
        $(this).attr("src", `${img_path}/page_out_of_range.png`);
    });


    $('#centerImg').wrap('<div class="image-decorator"></div>');
    $('#centerImg').addClass('nowImg');
    $('#centerImg').removeClass('previewImg');

    $("div.image-decorator:has(#centerImg)").animate({
        marginLeft: '250px'
    });

    $("#top_tools").animate({
        marginLeft:'250px'
    });


    $("<img>").attr("src", $("img.nowImg").attr("src")).load(function(){
        var imageWidth = this.width;
        var imageHeight = this.height;

        var fit_width = (imageWidth/imageHeight*100)*0.7+'vh';

        $('.image-decorator div, .image-decorator img').css({
            'height':'70vh',
            'width':fit_width
        });
        
        var dtd_pg = JSON.parse(localStorage.getItem(`PDF__${file_name}`));

        page = Number(this_page);
        if($('.nowImg').attr('id') === 'prvImg') page=prv_page;
        if($('.nowImg').attr('id') === 'nxtImg') page=nxt_page;

        page = String(page);
        if( dtd_pg.hasOwnProperty(String(page)) ){
            set_select_areas( dtd_pg[page] );
        }
        $('.loader').removeClass("is-active");
        
        setPop();

        showTableByPage(this_page);
    });

    showAreaPreviewImg();
}

function sum(total, num) {
    return total + num;
}

function show_gs(data){
    $("#table_printer").html('');

    gs_url = data.gs_url;
    for(i=0 ; i<gs_url.length ; i++){
        url = gs_url[i];

        iframe = document.createElement('iframe');
        $(iframe).attr('src', url);
        $(iframe).css('width', data.table_width[i]+50);
        document.getElementById('table_printer').appendChild(iframe);
    }
}



function debugQtyAreas (event, id, areas) {
    // console.log(areas.length + " areas", arguments);
    // alert(areas.length + " areas", arguments);
    var target = this;

    $("<img>").attr("src", $("img.nowImg").attr("src")).load(function(){
        if ($(target).attr("id") == $('.nowImg').attr('id')){

            page = Number(this_page);
            if($(".nowImg").attr('id') === 'prvImg') page-=1;
            if($(".nowImg").attr('id') === 'nxtImg') page+=1;
            var this_page_thumb = $(".thumb_page_"+page);1

            var dtd_pg = JSON.parse( localStorage.getItem(`PDF__${file_name}`) );

            dtd_pg[page] = areas_to_bbox(areas, this.width, this.height);

            localStorage.setItem(`PDF__${file_name}`, JSON.stringify( dtd_pg ));
            
            if(areas.length > 0) {
                if(this_page_thumb.hasClass("thumb_table_none")){
                    this_page_thumb.addClass("thumb_table");
                    this_page_thumb.removeClass("thumb_table_none");
                    this_page_thumb.find(".exist_class").css("display", "inline");
                }
            }
            else {
                if(this_page_thumb.hasClass("thumb_table")){
                    this_page_thumb.removeClass("thumb_table")
                    this_page_thumb.addClass("thumb_table_none");
                    this_page_thumb.find(".exist_class").css("display", "none");
                }
            }
        }


    });

};

function showAreaPreviewImg(){
    $(".previewImg").each(function(i){
        if(this.naturalWidth == 0){
            $(this).load(function (){
                showAreaImg(this);
            });
        }
        else{
            showAreaImg(this);
        }
    });
}

function showAreaImg(target){
    if ($(target).parent().is("canvas") ){
        $(target).unwrap();
    }
        
    var img_width = target.width;
    var img_height = target.height;

    var img_width_n = target.naturalWidth;
    var img_height_n = target.naturalHeight;

    $(target).wrap(`<canvas class='preview_canvas'
        width='${img_width}' height='${img_height}'></canvas>`);
    
    $("canvas.preview_canvas:has(#prvImg)").css("left", "0px");
    $("canvas.preview_canvas:has(#centerImg)").css("left", "250px");
    $("canvas.preview_canvas:has(#nxtImg)").css("left", "600px");
    
    var canvas = $(target).parent();
    var ctx = canvas[0].getContext("2d");
    ctx.drawImage(target, 0, 0, img_width, img_height);
    
    ctx.strokeStyle = "red";
    ctx.lineWidth = "2";
    ctx.setLineDash([5, 3]);

    scalingFactorX = img_width_n / img_width;
    scalingFactorY = img_height_n / img_height;
    
    var dtd_pg = JSON.parse(localStorage.getItem(`PDF__${file_name}`));

    page = Number(this_page);
    if($(target).attr('id') === 'prvImg') page-=1;
    if($(target).attr('id') === 'nxtImg') page+=1;

    page = String(page);
    if( dtd_pg.hasOwnProperty(String(page)) ){
        var areas = dtd_pg[page];

        if(Object.prototype.toString.call(areas) === "[object String]"){
            var arr = areas.split(";");

            for(j=0 ; j<arr.length ; j++){
                var arr2 = arr[j].split(",");
                if(arr2.length>=4){
                    ctx.strokeRect(
                        arr2[0]/scalingFactorX,
                        arr2[1]/scalingFactorY,
                        arr2[2]/scalingFactorX,
                        arr2[3]/scalingFactorY
                    );
                }
            }
        }
        else{
            for(idx=0 ; idx<areas.length ; idx++){
                for (const [key, value] of Object.entries(areas[idx])) {
                    var arr2 = value.bbox.split(",");
                    if(arr2.length>=4){
                        ctx.strokeRect(
                            arr2[0]/scalingFactorX,
                            arr2[1]/scalingFactorY,
                            arr2[2]/scalingFactorX,
                            arr2[3]/scalingFactorY
                        );
                    }
                }
            }
        }
    }
}

function areaToString (area) {
    return (typeof area.id === "undefined" ? "" : (area.id + ": ")) + area.x + ':' + area.y  + ' ' + area.width + 'x' + area.height + '<br />'
}

function output (text) {
    $('#output').html(text);
}

// Display areas coordinates in a div
function displayAreas (areas) {
    var text = "";
    $.each(areas, function (id, area) {
        text += areaToString(area);
    });
    output(text);
};

// 빨간 줄 그어져도 에러 안남
if(detected_areas != "-1"){
    var detected_areas_origin = JSON.parse( detected_areas );
    localStorage.setItem(
        `PDF__${file_name}_origin`, JSON.stringify(detected_areas_origin)
    );

    if( localStorage.getItem(`PDF__${file_name}`) === null
        || localStorage.getItem(`PDF__${file_name}`) === "null"){
        localStorage.setItem(
            `PDF__${file_name}`, JSON.stringify(detected_areas_origin)
        );
    }

    var this_page = 1;
    var table_data;

    $( document ).tooltip();
        
    var selectionExists;
} else if(!(localStorage.getItem(`PDF__${file_name}`) === "null")){
    var this_page = 1;
    var table_data;

    $( document ).tooltip();
        
    var selectionExists;
}


$(window).load(function() {
    $('.loader').removeClass("is-active");
});

$(document).ready(function () {

    if (!(localStorage.getItem(`PDF__${file_name}`) === "null"
        || localStorage.getItem(`PDF__${file_name}`) === null )) {
        var dtd_pg = JSON.parse(localStorage.getItem(`PDF__${file_name}`));

        var htmls = "";

        for(idx=1 ; idx<Object.keys(dtd_pg).length+1 ; idx++){
            var tables_len = 0;

            if(dtd_pg[idx] != -1){
                tables_len = Object.keys(dtd_pg[idx]).length;
            }

            if (tables_len > 0){
                // 최초 로딩
                var cnt = 1;
                for(const[key, value] of Object.entries(dtd_pg[idx])){
                    var isTextExist = false
                    if(value.cells == undefined) {
                        continue;
                    }
                    else {
                        value.cells.flat().forEach(function(item) {
                            if(item.length > 0) {
                                isTextExist = true;
                            }
                        })
                        if(isTextExist == false) {
                            continue;
                        }
                    }

                    createSheet(idx, cnt ++, value.merge_data, value.cells, value.csv_path);
                }

                htmls += `<div class='thumb_page thumb_page_${idx} thumb_table thumb_check_none'>
                            <center>
                            <img src='/static/icon/check.png' class='check_page' style='display:none'>
                            <img src='/static/icon/table.png' class='exist_class' style='display: inline;'>
                            <br>`;
                if (idx == 1){
                    htmls += `<img
                            class='thumb_img thumb_img_select'
                            src="${job_path}/page-${idx}-thumb.png"
                            onclick="move_page(this_page, '${idx}');"
                            id="thumb_page_${idx}">`;
                }
                else{
                    htmls += `<img
                            class='thumb_img'
                            src="${job_path}/page-${idx}-thumb.png"
                            onclick="move_page(this_page, '${idx}');"
                            id="thumb_page_${idx}">`;
                }
                htmls += `<br>
                            <span>${idx}</span>
                            <br>
                        </center>
                    </div>`;
            }
            else{
                htmls += `<div class='thumb_page thumb_page_${idx} thumb_table_none thumb_check_none'>
                            <center>
                                <img src='/static/icon/check.png' class='check_page' style='display: none'>
                                <img src='/static/icon/table.png' class='exist_class' style='display: none;'>
                                <br>`;
                if (idx == 1){
                    htmls += `<img
                                class='thumb_img thumb_img_select'
                                src="${job_path}/page-${idx}-thumb.png"
                                onclick="move_page(this_page, '${idx}');"
                                id="thumb_page_${idx}">`;
                }
                else{
                    htmls += `<img
                                class='thumb_img'
                                src="${job_path}/page-${idx}-thumb.png"
                                onclick="move_page(this_page, '${idx}');"
                                id="thumb_page_${idx}">`;
                }
                htmls += `<br>
                                <span>${idx}</span>
                                <br>
                            </center>
                        </div>`;
            }
        }

        $("#page_list_box").append(htmls);

        var select_items = new Set();
        select_items.add(".thumb_page");

        $('#page_multiple_selected').multiselect({
            onChange: function(option, checked, select) {
                var opselected = $(option).val();
                if(checked == true) {
                    if (opselected == 'all') { select_items.add(".thumb_page"); } 
                    if (opselected == 'table') { select_items.add(".thumb_table"); } 
                    if (opselected == 'empty') { select_items.add(".thumb_table_none"); } 
                    if (opselected == 'checked') { select_items.add(".thumb_check"); } 
                    if (opselected == 'non_checked') { select_items.add(".thumb_check_none"); } 
                }
                else if(checked == false) {
                    if (opselected == 'all') { select_items.delete(".thumb_page"); } 
                    if (opselected == 'table') { select_items.delete(".thumb_table"); } 
                    if (opselected == 'empty') { select_items.delete(".thumb_table_none"); } 
                    if (opselected == 'checked') { select_items.delete(".thumb_check"); } 
                    if (opselected == 'non_checked') { select_items.delete(".thumb_check_none"); } 
                }

                $( ".thumb_page:not("+Array.from(select_items).join('')+")" ).hide("slow");
                $( Array.from(select_items).join('') ).show("slow");
            }
        });
        var is_page_list_expand = false;
        

        // 추출할 메인 이미지 교체
        $('img#centerImg').attr("src", `${job_path}/page-${this_page}.png`);
        
        $('img#prvImg').attr("src", `${img_path}/page_out_of_range.png`);
        $('img#nxtImg').attr("src", `${job_path}/page-${Number(this_page)+1}.png`);

        $('img#centerImg').selectAreas({
            width: window.innerWidth / 3.84,
            onChanged: debugQtyAreas
        }).one("load", function(){
            var imageWidth = $('#centerImg').width();
            var imageHeight = $('#centerImg').height();

            var fit_width = (imageWidth/imageHeight*100)*0.7+'vh';

            $('.image-decorator div, .image-decorator img').css(
                {'height':'70vh', 'width':fit_width}
            );
            

            if( dtd_pg.hasOwnProperty(String(this_page)) ){
                page = String(this_page);
                set_select_areas( dtd_pg[page] );
            }
        });
        showAreaPreviewImg();
    }
    else{
        var values = [],
        keys = Object.keys(split_progress),
        i = keys.length;
        count = 0;

        if(i > 0){
            auto_detect_progress();
        }

        var html = "<h4>Previous Jobs</h4>";

        
        
        while ( i-- ) {
            count++;

            html += `<span id='${keys[i].split('.')[0]}_progress'>${keys[i]}</span>`;
            html += "<div class='progress'>";
            html += `<div
            class='progress-bar progress-bar-striped progress-bar-animated'
            style='width: 0%'>0%</div>`;
            html += "</div><br>";
        }

        $(".left_text").html(html);

        values = [],
        keys = Object.keys(localStorage),
        i = keys.length;
        count = 0;

        html = "<h4>Finished jobs</h4>";
        html += "<table class='table table-hover' style='width:500px'>";
        html += "<tr><th>#</th><th>Filename</th></tr>";
        while ( i-- ) {
            if(!keys[i].startsWith("PDF__") || keys[i].endsWith("_origin")){
                continue;
            }
            count++;

            html += "<tr>";
            html += `<td>${count}</td>`;
            html += `<td 
            onclick=
            'location.href="/workspace?fileName=${keys[i].slice(5)}"'
            style='cursor:pointer'>${keys[i].slice(5)}.pdf</td>`;
            html += "</tr>";
        }
        html += "</table>";

        $(".right_text").html(html);
        $(".center_text").show();
        
        $("#page_list_box").hide();
        $("#page_list_size_btn").hide();
        $("#article_table").hide();
    }


    $("#upload_page_btn").click(function(){
        popup_window = popup_upload();
    });


    $('.arrow').click(function () {
        direction = $(this).text();
        pre_page = Number(this_page);

        if (direction == "◀"){
            this_page = Number(this_page)-1;
            if(this_page < 1){
                this_page = 1;
            }
        }
        else{
            this_page = Number(this_page)+1;
        }
        move_page(pre_page, this_page);
    });

    document.addEventListener("keydown", function(event) {
        if(isPopupOpen){
            return;
        }
        pre_page = Number(this_page);
        // event.preventDefault();

        // "ArrowRight", "ArrowLeft", "ArrowUp", or "ArrowDown"
        const key = event.key;
        switch (key) { // change to event.key to key to use the above variable
            case "ArrowLeft":
                // Left pressed
                this_page = Number(this_page)-1;
                if(this_page < 1){
                    this_page = 1;
                }
                move_page(pre_page, this_page);
                break;

            case "ArrowRight":
                // Right pressed
                this_page = Number(this_page)+1;
                move_page(pre_page, this_page);
                break;

            case "ArrowUp":
                // Up pressed
                this_page = Number(this_page)-1;
                if(this_page < 1){
                    this_page = 1;
                }
                move_page(pre_page, this_page);
                break;

            case "ArrowDown":
                // Down pressed
                this_page = Number(this_page)+1;
                move_page(pre_page, this_page);
                break;

            case " ":
                var this_page_thumb = $(".thumb_page_"+this_page);
                if(this_page_thumb.hasClass("thumb_check")){
                    this_page_thumb.removeClass("thumb_check")
                    this_page_thumb.addClass("thumb_check_none");
                    this_page_thumb.find(".check_page").css("display", "none");
                }
                else{
                    this_page_thumb.addClass("thumb_check");
                    this_page_thumb.removeClass("thumb_check_none");
                    this_page_thumb.find(".check_page").css("display", "inline");
                }
                break;
        }
    });

    
    $('#get_line_size').click(function () { 
        $('.loader').addClass("is-active");
        var selectedAreas = $('img#centerImg').selectAreas('areas');
        
        if (selectedAreas.length > 0) {
            const imageWidth = $('#centerImg').width();
            const imageHeight = $('#centerImg').height();
        
            var table_option = $("input[name='optradio']:checked").val();
            var jsons = {};
            
            for(i=0 ; i<selectedAreas.length ; i++){
                selectedAreas[i]['imageWidth'] = imageWidth;
                selectedAreas[i]['imageHeight'] = imageHeight;
                jsons[i] = JSON.stringify(selectedAreas[i]);
            }
            jsons = JSON.stringify(jsons);

            $.ajax({
                url: '/getLineScale',
                data: {"jsons":jsons, "fileName":file_name, "page":this_page},
                dataType:'json',
                type: 'POST',
                success: function (data) {
                    $("#line_scale").val(data.line_scale);
                    $('.loader').removeClass('is-active');
                },
                error: function (error) {
                    console.error(error);
                    $('.loader').removeClass('is-active');
                }
            });
        }
        else{
            alert("먼저 영역을 지정해주세요.");
            $('.loader').removeClass('is-active');
        }
    });

    
    $('#extract').click(function () {
        $('.loader').addClass('is-active');

        var selectedAreas = $('img#centerImg').selectAreas('areas');
        
        if (selectedAreas.length > 0) {
            const imageWidth = $('#centerImg').width();
            const imageHeight = $('#centerImg').height();
        
            var table_option = $("input[name='optradio']:checked").val();
            var jsons = {};
            
            for(i=0 ; i<selectedAreas.length ; i++){
                selectedAreas[i]['imageWidth'] = imageWidth;
                selectedAreas[i]['imageHeight'] = imageHeight;
                jsons[i] = JSON.stringify(selectedAreas[i]);
            }
            jsons = JSON.stringify(jsons);

            $.ajax({
                url: '/doExtract',
                data: {
                    "jsons": jsons,
                    "fileName": file_name,
                    "page": this_page,
                    "table_option": table_option,
                    "line_scale": $("#line_scale").val()
                },
                dataType:'json',
                type: 'POST',
                success: function (data) {
                    table_data = data;

                    var bboxs = table_data.bboxs;

                    // --- Google Sheet Code ---
                    
                    // var jsons = table_data.jsons;
                    // var csvs = table_data.csvs;
                    
                    // var gs_url = table_data.gs_url;
                    // var iframe = null;

                    // var htmls = "";
                    // --- ----------------- ---
                    
                    if(bboxs != 0){
                        bboxs = bboxs.split(";");
                        
                        for(idx=0 ; idx<bboxs.length ; idx++){
                            // console.log(`table_data.cells[idx] : ${table_data.cells[idx]}`);

                            modifySheet(
                                table_data.page,
                                idx + 1,
                                table_data.merge_data[idx],
                                table_data.cells[idx],
                                table_data.csv_paths[idx]
                            );
                            
                            $("#centerImg").selectAreas('reset');
                            
                            arrs = [];

                            var arr = bboxs[idx].split(',');
                            
                            arrs.push({
                                x: Number(arr[0]),
                                y: Number(arr[1]),
                                width: Number(arr[2]),
                                height: Number(arr[3]),
                            });
                            
                            $("#centerImg").selectAreas('add', arrs);

                            $("#table_show_type").css("display", "block");
                        }
                    }
                    else{
                        alert(data.message);
                    }
                    
                    $('.loader').removeClass('is-active');
                },
                error: function (error) {
                    console.error(error);
                    $('.loader').removeClass('is-active');
                }
            });
        }
    });

    $('#auto_detect').click(function(){
        var dtd_pg_origin = JSON.parse( localStorage.getItem(`PDF__${file_name}_origin`) );
        var dtd_pg = JSON.parse( localStorage.getItem(`PDF__${file_name}`) );

        page = Number(this_page);
        if($('.nowImg').attr('id') === 'prvImg') page-=1;
        if($('.nowImg').attr('id') === 'nxtImg') page+=1;

        dtd_pg[page] = dtd_pg_origin[page];

        if(Object.keys(dtd_pg[page]).length < 1){
            alert("자동 검출 모드로 테이블을 인식하지 못했습니다.");
        }
        else if( dtd_pg.hasOwnProperty(String(page)) ){
            $(".nowImg").selectAreas('reset');
            set_select_areas( dtd_pg[page] );
            localStorage.setItem(`PDF__${file_name}`, JSON.stringify( dtd_pg ));
            alert(`자동 검출 모드로 ${Object.keys(dtd_pg[page]).length}개의 테이블을 인식했습니다.`);
        }
    });


    $(document).on('click', '.preview_canvas', function(){
        if ($(this).find("img").attr('src') == `${img_path}/page_out_of_range.png`) return;
        destroy_select_areas();
        
        var target = $(this).find("img");
        $(target).unwrap();

        $(target).wrap('<div class="image-decorator"></div>')
        $(target).addClass('nowImg');
        $(target).removeClass('previewImg');

        $(target).selectAreas({
            width: window.innerWidth / 3.84,
            onChanged: debugQtyAreas
        })
        
        $("div.image-decorator:has(#prvImg)").animate({
            marginLeft:"0"
        });
        $("div.image-decorator:has(#centerImg)").animate({
            marginLeft:'250px'
        });
        $("div.image-decorator:has(#nxtImg)").animate({
            marginLeft:'600px'
        });
        
        if($(".nowImg").attr("id") == "nxtImg")
            $("#top_tools").animate({
                marginLeft:'600px'
            });


        else if($(".nowImg").attr("id") == "prvImg")
            $("#top_tools").animate({
                marginLeft:'0'
            });
        else
            $("#top_tools").animate({
                marginLeft:'250px'
            });

        showAreaPreviewImg();

        $("<img>").attr("src", $("img.nowImg").attr("src")).load(function(){
            var imageWidth = this.width;
            var imageHeight = this.height;

            var fit_width = (imageWidth/imageHeight*100)*0.7+'vh';

            $('.image-decorator div, .image-decorator img').css({
                'height':'70vh',
                'width':fit_width
            });
            
            var dtd_pg = JSON.parse(localStorage.getItem(`PDF__${file_name}`));

            page = Number(this_page);
            if($('.nowImg').attr('id') === 'prvImg') page-=1;
            if($('.nowImg').attr('id') === 'nxtImg') page+=1;

            if( dtd_pg.hasOwnProperty(String(page)) ){
                set_select_areas( dtd_pg[page] );
            }
        });
    });


    $("#page_list_size_btn").click(function(){
        if(is_page_list_expand){
            is_page_list_expand = false;
            $("#page_list_box").animate({
                width:"177px"
            });
            $("#page_list_size_btn").animate({
                left:"177px"
            });
            $("#page_list_size_btn").text("▶");
        }
        else{
            is_page_list_expand = true;
            $("#page_list_box").animate({
                width:"1200px"
            });
            $("#page_list_size_btn").animate({
                left:"1200px"
            });
            $("#page_list_size_btn").text("◀");
        }
    });
    
    $("#check_page_btn").click(function(){
        var this_page_thumb = $(".thumb_page_"+this_page);
        if(this_page_thumb.hasClass("thumb_check")){
            this_page_thumb.removeClass("thumb_check")
            this_page_thumb.addClass("thumb_check_none");
            this_page_thumb.find(".check_page").css("display", "none");
        }
        else{
            this_page_thumb.addClass("thumb_check");
            this_page_thumb.removeClass("thumb_check_none");
            this_page_thumb.find(".check_page").css("display", "inline");
        }
    });
    
    applyPreset(leaf.header, leaf.headerTxt, leaf.body, leaf.bodyAlt, leaf.bodyTxt, leaf.border);

    // Toolbar Event
    // 폰트 선택
    $('#select-font').on('change', function() {
        $('#table_printer').css('font-family', $(this).val());
    });
    
    // 테마 선택
    $('#select-theme').on('click', 'li', function() {
        var style= $(this).text();

        if(style == "Leaf") {
            applyPreset(leaf.header, leaf.headerTxt, leaf.body, leaf.bodyAlt, leaf.bodyTxt, leaf.border);
        } else if(style == "Metal") {
            applyPreset( metal.header, metal.headerTxt, metal.body, metal.bodyAlt, metal.bodyTxt, metal.border);
        } else if(style == "Aqua") {
            applyPreset(aqua.header, aqua.headerTxt, aqua.body, aqua.bodyAlt, aqua.bodyTxt, aqua.border);
        } else if(style == "Dark") {
            applyPreset(dark.header, dark.headerTxt, dark.body, dark.bodyAlt, dark.bodyTxt, dark.border);
        }
    })

    // 테마 선택
    $('#select-align').on('click', 'li', function() {
        var align = $(this).text().trim();
        
        if (align == 'format_align_left') {
            $('.jexcel_overflow').find('td[data-x][data-y]').css('text-align', 'left');
        } else if (align == 'format_align_center') {
            $('.jexcel_overflow').find('td[data-x][data-y]').css('text-align', 'center');
        } else if (align == 'format_align_right') {
            console.log(align)
            $('.jexcel_overflow').find('td[data-x][data-y]').css('text-align', 'right');
        } else if (align == 'format_align_justify') {
            $('.jexcel_overflow').find('td[data-x][data-y]').css('text-align', 'justify');
        }
    })
});