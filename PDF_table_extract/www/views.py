#
# get_file_path_select.py
# PDF_table_extract
#
# Created by Ji-yong219 on 2021-03-08
# Last modified on 2022-02-24
#

import os
import json
from posixpath import split
# import pickle

import cv2
from werkzeug.utils import secure_filename
from PyPDF2 import PdfFileReader
from numpyencoder import NumpyEncoder
from flask import (
    request,
    render_template,
    jsonify,
    Blueprint,
    redirect,
    url_for,
    current_app,
    session,
)

from PDF_table_extract.utils.file_path import file_path_select
from PDF_table_extract.tasks.task import task_split, extract, split_progress
from PDF_table_extract.tasks.check_lattice.Lattice_2 import Lattice2
from PDF_table_extract.tasks.check_lattice.check_line_scale import GetLineScale
from PDF_table_extract.data_rendering.makeGoogleSheet import make_google_sheets
from PDF_table_extract.utils.cell_control import *
from PDF_table_extract.utils.location import(
    get_file_dim,
    get_regions,
    get_regions_img,
    bbox_to_areas
)
from PDF_table_extract.utils import logger

views = Blueprint("views", __name__)

detected_areas = {}
is_working = False # 현재 작업중인지 확인


# index page (redirect to workspace)
@views.route("/", methods=['GET'])
def index():
    return redirect(url_for("views.workspace"))

    # 예시 페이지로 리다이렉트시킴 (현재 사용 안함)
    # return redirect(url_for('views.example'))
    

# Upload Page, You can upload a pdf file here.
@views.route("/upload", methods=['GET'])
def upload():
    return render_template('upload.html')


# The route that comes when you request to upload a file to JQuery's AJAX.
@views.route("/uploadPDF", methods = ['POST'])
def uploadPDF():
    global split_progress

    if 'file' not in request.files:
        resp = jsonify({'message' : 'No file part in the request'})
        logger.error('No file part in the request')
        resp.status_code = 400
        return resp
	
    files = request.files.getlist('file')

    errors = {}
    success = False
    filepath = None

    for file in files:
        if file:
            # secure_filename은 한글명을 지원하지 않음
            # filename = secure_filename(file.filename)
            filename = file.filename
            filepath = os.path.join(
                current_app.config['UPLOAD_FOLDER'],
                filename
            )
            file_page_path = os.path.splitext(filepath)[0]

            # make filename folder
            if not os.path.exists(file_page_path):
                os.makedirs(file_page_path)

            filepath = os.path.join(file_page_path, filename)
            
            # pdf file save (with uploaded)
            file.save(filepath)
            success = True
            
            split_progress[filename] = 0

        else:
            errors[file.filename] = 'File type is not allowed'
            logger.error('File type is not allowed')
    
    if success and errors:
        errors['message'] = 'File(s) successfully uploaded'
        logger.error('File(s) successfully uploaded')
        resp = jsonify(errors)
        resp.status_code = 206
        return resp

    # main 
    if success:
        resp = jsonify({'message' : 'Files successfully uploaded'})
        resp.status_code = 201
        return resp

    else:
        resp = jsonify(errors)
        logger.error(errors)
        resp.status_code = 400
        return resp


# AutoExtract POST from JQuery's AJAX
@views.route("/autoExtract", methods = ['POST'])
def autoExtract():
    global split_progress
    global detected_areas
    global is_working

    is_working = True

    file_names = request.form.getlist('file_names')
    

    # original pdf -> split 1, 2 .... n page pdf
    for file_name in file_names:
        split_progress[file_name] = 0

        filepath = os.path.join(
            current_app.config['UPLOAD_FOLDER'],
            file_name
        )
        file_page_path = os.path.splitext(filepath)[0]
        filepath = os.path.join(file_page_path, file_name)

        inputstream = open(filepath, "rb")
        infile = PdfFileReader(inputstream, strict=False)
        total_page = infile.getNumPages()
        inputstream.close()
        empty_pages = []

        result = task_split(
            file_name,
            filepath,
            file_page_path,
            # split_progress
        )

        if result is not None and len(result) > 0:
            ### save data with pickle
            # with open(
            #   f"table_data/{file_name}-table-data.pickle", "wb"
            # ) as fw:
            #     pickle.dump(result, fw)
            ### save data with pickle

            v = {}
            for page, tables in sorted(result.items()):

                progress = int( page / len(result) * 20 )
                split_progress[file_name] = 80 + progress

                page_file = file_page_path + f"\\page-{page}.pdf"
                image_file = file_page_path + f"\\page-{page}.png"

                (
                    v['imageHeight'],
                    v['imageWidth'],
                    _
                ) = cv2.cv2.imread(image_file).shape

                if tables != -1 and tables != []:
                    for table_key in tables.keys():
                        table = tables[table_key]
                        
                        bbox =  bbox_to_areas(
                            v,
                            table.get("bbox"),
                            page_file
                        ) + f",{v['imageWidth']},{v['imageHeight']}"
                        table["bbox"] = str(bbox)

                        tables[table_key] = table
                    
                    result[page] = tables
            
            for page in result.keys():
                if result.get(page) is None or result.get(page) == '':
                    empty_pages.append(page)

            session['empty_pages'] = empty_pages
            
        else:
            bboxs = 0

        detected_areas[
            file_name.replace('.pdf', '').replace('.PDF', '')
        ] = result

    resp = jsonify( json.dumps(
        {
            'message': 'Files successfully uploaded',
            'detected_areas': detected_areas,
            'split_progress': dict(split_progress)
        },
        cls = NumpyEncoder)
    )
    resp.status_code = 201

    is_working = False
    split_progress = {}
    return resp


# Routes that return progress
@views.route('/getProgress', methods = ['POST'])
def getProgress():
    global split_progress
    global is_working

    result_progress = dict(split_progress)
    for dic in result_progress.keys():
        progresses = 0

        if isinstance(result_progress[dic], int):
            progresses = result_progress[dic]

        else:
            for progress in dict(result_progress[dic]).values():
                progresses += progress
            progresses = round(progresses, 2)

        result_progress[dic] = progresses
        
    return jsonify({
        'split_progress': result_progress,
        'is_working': is_working}
    )

# Routes that return detected_areas
@views.route('/getDetectedAreas', methods = ['POST'])
def getDetectedAreas():
    global detected_areas

    return jsonify(json.dumps(
        {'detected_areas': detected_areas},
        cls=NumpyEncoder,
        ensure_ascii=False
    ))

# Routes that return is working
@views.route('/isWorking', methods = ['POST'])
def isWorking():
    global is_working

    return jsonify(is_working)


# 추출할 pdf파일명을 받아와서
# 해당 pdf파일의 workspace 페이지를 반환하는 라우트
# (Get 요청으로 pdf파일 명시)
@views.route("/workspace", methods=['GET'])
def workspace():
    global detected_areas
    global split_progress

    fileName = request.args.get("fileName")

    if fileName is not None:
        filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], fileName)
        file_page_path = os.path.splitext(filepath)[0]
        filepath = os.path.join(file_page_path, fileName+'.pdf')
        
        inputstream = open(filepath, "rb")
        infile = PdfFileReader(inputstream, strict=False)
        total_page = infile.getNumPages()
        inputstream.close()

        if detected_areas.get(fileName) is not None:

            return render_template(
                'workspace.html',
                fileName=fileName,
                totalPage=total_page,
                detected_areas=json.dumps(
                    detected_areas[fileName],
                    cls=NumpyEncoder,
                    ensure_ascii=False
                ),
                split_progress=dict(split_progress)
            )

        return render_template(
            'workspace.html',
            fileName=fileName,
            detected_areas=-1,
            split_progress=dict(split_progress)
        )
    else:
        return render_template(
            'error.html',
            error='해당 페이지를 찾을 수 없습니다.'
        )


@views.route("/pre_extract", methods=['POST'])
def pre_extract():
    global detected_areas

    file_name = request.form['fileName']+".pdf"
    filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], file_name)
    file_page_path = os.path.splitext(filepath)[0]
    filepath = os.path.join(file_page_path, file_name)
    empty_pages = session['empty_pages']
    total_page = len(empty_pages)
    empty_pages = ','.join([str(i) for i in empty_pages])

    line_scale = int(request.form['line_scale'])
    result = task_split(
        filepath,
        file_page_path,
        split_progress,
        line_scale=line_scale,
        pages=empty_pages
    )

    empty_pages = []

    if result is not None and len(result) > 0:
        v = {}
        for page, tables in result.items():
            bboxs = []

            page_file = file_page_path + f"\\page-{page}.pdf"
            image_file = file_page_path + f"\\page-{page}.png"

            (
                v['imageHeight'],
                v['imageWidth'],
                _
            ) = cv2.cv2.imread(image_file).shape

            for table in tables:
                bbox = table._bbox
                bboxs.append(
                    bbox_to_areas(
                        v,
                        bbox,
                        page_file
                    ) + f",{v['imageWidth']},{v['imageHeight']}"
                )
                
            bboxs = ";".join(bboxs)
            result[page] = bboxs
        
        for page in result.keys():
            if result.get(page) is None or result.get(page) == '':
                empty_pages.append(page)

        print('@'*50)
        print(empty_pages)
        session['empty_pages'] = empty_pages
        print(f'total length: {total_page}\tempty length:{len(empty_pages)}')
        print('@'*50)
        
    else:
        bboxs = 0

    detected_areas[file_name.replace('.pdf', '')] = result

    resp = jsonify({'message' : 'success'})
    resp.status_code = 201
    return resp


# 추출할 pdf파일이 정해졌을때 추출을 진행하는 라우트 (Get 요청으로 pdf파일 명시)
@views.route("/pre_extract_page", methods=['GET'])
def pre_extract_page():
    fileName = request.args.get("fileName")

    # if fileName is not None and page is not None:
    if fileName:
        empty_pages = session['empty_pages']

        return render_template(
            'pre_extract.html',
            fileName=fileName,
            empty_pages=empty_pages
        )

    else:
        return render_template(
            'error.html',
            error='해당 페이지를 찾을 수 없습니다.'
        )


# 타겟 pdf 페이지 1장의 테이블을 추출하는 라우트
@views.route("/doExtract", methods=['POST'])
def doExtract_page():
    page = request.form['page']
    file_name = request.form['fileName']
    filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], file_name)

    page_file = f"{filepath}\\page-{page}.pdf"

    table_option = request.form['table_option']
    line_scale = request.form['line_scale']
    
    jsons = request.form['jsons']
    jsons = json.loads(jsons)
    
    regions = []
    for k, v in jsons.items():
        v = json.loads(v)
        regions.append( get_regions(v, page_file) )

    result = extract(regions, page_file, table_option, line_scale)
    
    merge_data = []
    cells = []
    bboxs = []
    csv_paths = []
    message = ""

    # --- Google Sheet Code ---
    # html = []
    # csvs = []
    # col_width = []
    # table_width = []
    # gs = []
    # gs_url = ""
    # --- ----------------- ---

    if len(result) > 0:
        for idx, table in enumerate(result, 1):
            df = table.df
            df.reset_index(drop=True, inplace=True)

            # --- Google Sheet Code ---
            # gs.append(table)

            # html.append(
                # df.to_html(index=False, header=False)
                    # .replace('\\n', '<br>')
            # )

            # cols, width_sum = getWidth(df)
            # col_width.append( cols )
            # table_width.append( width_sum )
            # csvs.append( df.to_csv(index=False) )
            # --- ----------------- ---
            
            merge_data.append(
                find_merge_cell([
                    [
                        {
                            "text": str(j.text),
                            "vspan": j.vspan,
                            "hspan": j.hspan
                        }
                        for j in i
                    ]
                    for i in table.cells
                ])
            )
            cells.append(
                json_text_to_list([
                    [
                        {
                            "text": str(j.text),
                            "vspan": j.vspan,
                            "hspan": j.hspan
                        }
                        for j in i
                    ]
                    for i in table.cells
                ])
            )

            csv_path = f'{filepath}\\page-{page}-table-{idx}.csv'
            csv_paths.append(csv_path)
            df.to_csv(csv_path, index=False)
            
            bbox = table._bbox
            bboxs.append( bbox_to_areas(v, bbox, page_file) )
            
        bboxs = ";".join(bboxs)


        # --- Google Sheet Code ---
        # 구글시트 호출
        # gs_url = make_google_sheets(file_name, gs, header='c')
        # html = "<br>".join(html)
        # --- ----------------- ---
        
    else:
        # html = "<span>발견된 테이블 없음</span>"
        message = "발견된 테이블 없음"
        bboxs = 0

    return jsonify({
        'page': page,
        'bboxs': bboxs,
        'merge_data': merge_data,
        'cells': cells,
        'csv_paths': csv_paths,
        'message': message
    })

    # --- Google Sheet Code ---
    # return jsonify({
        # 'bboxs': bboxs,
        # 'jsons': jsons,
        # 'col_width': col_width,
        # 'table_width': table_width,
        # 'csvs': csvs,
        # 'gs_url': gs_url,
        # 'message': message
    # })
    # --- ----------------- ---

    # return jsonify({'html':html, 'bboxs':bboxs, 'gs_url':gs_url})


# 라인스케일 요청시 적절한 값 반환해주는 라우트
@views.route("/getLineScale", methods=['POST'])
def get_line_scale():
    if request.method == 'POST':
        file_name = request.form['fileName']
        filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], file_name)
        imgname = f"{filepath}\\page-{request.form['page']}.png"
        
        
        jsons = request.form['jsons']
        jsons = json.loads(jsons)
        
        regions = []
        for k, v in jsons.items():
            v = json.loads(v)
            regions.append( get_regions_img(v, imgname) )

        regions = [ int(float(i)) for i in regions[0].split(',') ]
        
        getlinescale = GetLineScale(imgname, regions)
        print("line size >", getlinescale.line_size)
        print("adapted line scale >", getlinescale.line_scale)
            
        return jsonify({'line_scale':getlinescale.line_scale})


@views.route('/downloadSheets', methods=['POST'])
def download_sheets():
    if request.method == 'POST':
        exportObjs = request.form['exportObjs']
        exportObjs = json.loads(exportObjs)
        csv_to_xlsx(exportObjs)
        return "success"
    return "failed"
