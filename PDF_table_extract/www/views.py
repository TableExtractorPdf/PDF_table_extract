#
# get_file_path_select.py
# PDF_table_extract
#
# Created by Ji-yong219 on 2021-03-08
# Last modified on 2022-01-03
#

from flask import (
    request,
    render_template,
    jsonify,
    Blueprint,
    redirect,
    url_for,
    current_app,
    session
)
from werkzeug.utils import secure_filename

from PDF_table_extract.utils.file_path import file_path_select
from PDF_table_extract.utils.location import get_file_dim, get_regions, get_regions_img, bbox_to_areas
# from utils.tasks import split as task_split
from PDF_table_extract.tasks.task import task_split
from PDF_table_extract.utils.cell_control import *

from PDF_table_extract.tasks.check_lattice.Lattice_2 import Lattice2
from PDF_table_extract.tasks.check_lattice.check_line_scale import GetLineScale

from PDF_table_extract.data_rendering.makeGoogleSheet import make_google_sheets

from PyPDF2 import PdfFileReader

import cv2
import os
import json
import logging
import logging.config
from datetime import datetime
import multiprocessing

from PDF_table_extract.utils.cell_control import *

from numpyencoder import NumpyEncoder

# import pickle


views = Blueprint("views", __name__)

manager = multiprocessing.Manager()

# split_progress = {} # split 작업 진행도
split_progress = manager.dict() # split 작업 진행도
detected_areas = {}
is_working = False # 현재 작업중인지 확인


# 인덱스 페이지
@views.route("/", methods=['GET'])
def index():
    return redirect(url_for("views.workspace"))
    # return redirect(url_for('views.example')) # 예시 페이지로 리다이렉트시킴 (현재 사용 안함)
    

# 업로드 페이지, 이곳에서 pdf파일을 업로드할 수 있음
@views.route("/upload", methods=['GET'])
def upload():
    return render_template('upload.html')
    

# 각종 테스트 페이지. 현재 사용안함
@views.route("/test", methods=['GET'])
def test():
    return render_template('test.html')


# table_shape.pdf파일로 테스트하던 예시 페이지
@views.route("/example", methods=['GET'])
def example():
    page = request.args.get("page")
    if page is None:
        page = "166"
    
    return render_template('example.html', page=page)


# jquery ajax로 파일 업로드 요청시 오게되는 라우트
@views.route("/uploadPDF", methods = ['POST'])
def uploadPDF():
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
            # filename = secure_filename(file.filename) # secure_filename은 한글명을 지원하지 않음
            filename = file.filename
            filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
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


# jquery ajax로 
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

        filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], file_name)
        file_page_path = os.path.splitext(filepath)[0]
        filepath = os.path.join(file_page_path, file_name)

        inputstream = open(filepath, "rb")
        infile = PdfFileReader(inputstream, strict=False)
        total_page = infile.getNumPages()
        inputstream.close()
        empty_pages = []

        result = task_split(file_name, filepath, file_page_path, split_progress, logger)

        print("이거 끝")

        if result is not None and len(result) > 0:
            # with open(f"table_data/{file_name}-table-data.pickle", "wb") as fw:
            #     pickle.dump(result, fw)

            v = {}
            for page, tables in sorted(result.items()):

                progress = int( page / len(result) * 20 )
                split_progress[file_name] = 80 + progress

                page_file = file_page_path + f"\\page-{page}.pdf"
                image_file = file_page_path + f"\\page-{page}.png"

                v['imageHeight'], v['imageWidth'], _ = cv2.cv2.imread(image_file).shape

                # for table in tables:
                    # bbox = table.bbox

                if tables != -1:
                    for table_key in tables.keys():
                        # table = tables[table_key]

                        # for idx in table.keys():
                        #     info = table[idx]
                        #     print(f"table : {table}\t\tinfo : {info}")
                        #     bbox =  bbox_to_areas(v, info.get("bbox"), page_file)+f",{v['imageWidth']},{v['imageHeight']}"
                        #     table[idx]["bbox"] = str(bbox)

                        table = tables[table_key]
                        
                        bbox =  bbox_to_areas(v, table.get("bbox"), page_file)+f",{v['imageWidth']},{v['imageHeight']}"
                        table["bbox"] = str(bbox)

                        tables[table_key] = table
                    
                    # bboxs = ";".join(bboxs)
                    # result[page] = bboxs
                    result[page] = tables
                # print(f'page:{page}\ttables : {tables}')
            
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

        detected_areas[file_name.replace('.pdf', '').replace('.PDF', '')] = result

    # resp = jsonify({'message' : 'Files successfully uploaded', 'detected_areas':detected_areas, 'split_progress':dict(split_progress)})
    resp = jsonify( json.dumps({'message' : 'Files successfully uploaded', 'detected_areas':detected_areas, 'split_progress':dict(split_progress)}, cls=NumpyEncoder) )
    resp.status_code = 201

    is_working = False
    split_progress = {}
    return resp


# progress 진행도를 반환하는 라우트
@views.route('/getProgress', methods = ['POST'])
def getProgress():
    global split_progress
    global is_working
    print(f'split_progress_ajax : {split_progress}\t{id(split_progress)}')

    return jsonify({'split_progress':dict(split_progress), 'is_working':is_working})

# detected_areas를 반환하는 라우트
@views.route('/getDetectedAreas', methods = ['POST'])
def getDetectedAreas():
    global detected_areas

    return jsonify(json.dumps({'detected_areas':detected_areas}, cls=NumpyEncoder, ensure_ascii=False))

# 작업중인지 반환하는 라우트
@views.route('/isWorking', methods = ['POST'])
def isWorking():
    global is_working

    return jsonify(is_working)


# 추출할 pdf파일이 정해졌을때 추출을 진행하는 라우트 (Get 요청으로 pdf파일 명시)
@views.route("/workspace", methods=['GET'])
def workspace():
    global detected_areas
    global split_progress

    fileName = request.args.get("fileName")
    print(f'split_progress:{split_progress}')

    if fileName is not None:
        filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], fileName)
        file_page_path = os.path.splitext(filepath)[0]
        filepath = os.path.join(file_page_path, fileName+'.pdf')
        
        inputstream = open(filepath, "rb")
        infile = PdfFileReader(inputstream, strict=False)
        total_page = infile.getNumPages()
        inputstream.close()

        if detected_areas.get(fileName) is not None:
            print(detected_areas.get(fileName))
            # for k, v in detected_areas[fileName].items():
            #     for i in v:

            return render_template(
                'workspace.html',
                fileName=fileName,
                totalPage=total_page,
                detected_areas=json.dumps(detected_areas[fileName], cls=NumpyEncoder, ensure_ascii=False),
                split_progress=dict(split_progress)
                # page=page
            )

    return render_template(
        'workspace.html',
        fileName=fileName,
        detected_areas=-1,
        split_progress=dict(split_progress)
    )
    # else:
    #     return render_template('error.html', error='해당 페이지를 찾을 수 없습니다.')


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
    result = task_split(filepath, file_page_path, split_progress, line_scale = line_scale, pages = empty_pages)

    empty_pages = []

    if result is not None and len(result) > 0:
        v = {}
        for page, tables in result.items():
            bboxs = []

            page_file = file_page_path + f"\\page-{page}.pdf"
            image_file = file_page_path + f"\\page-{page}.png"

            v['imageHeight'], v['imageWidth'], _ = cv2.cv2.imread(image_file).shape

            for table in tables:
                bbox = table._bbox
                bboxs.append( bbox_to_areas(v, bbox, page_file)+f",{v['imageWidth']},{v['imageHeight']}" )
                
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
    if fileName is not None:
        empty_pages = session['empty_pages']

        return render_template(
            'pre_extract.html',
            fileName=fileName,
            empty_pages=empty_pages
        )

    else:
        return render_template('error.html', error='해당 페이지를 찾을 수 없습니다.')


# 타겟 pdf 페이지 1장의 테이블을 추출하는 라우트
@views.route("/doExtract", methods=['POST'])
def doExtract_page():
    if request.method == 'POST':
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

                # html.append( df.to_html(index=False, header=False).replace('\\n', '<br>') )

                # cols, width_sum = getWidth(df)
                # col_width.append( cols )
                # table_width.append( width_sum )
                # csvs.append( df.to_csv(index=False) )
                # --- ----------------- ---
                
                merge_data.append(
                    find_merge_cell([
                        [
                            {"text":str(j.text), "vspan":j.vspan, "hspan":j.hspan}
                            for j in i
                        ]
                        for i in table.cells
                    ])
                )
                cells.append(
                    json_text_to_list([
                        [
                            {"text":str(j.text), "vspan":j.vspan, "hspan":j.hspan}
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

        return jsonify({'page': page, 'bboxs': bboxs, 'merge_data': merge_data, 'cells': cells, 'csv_paths': csv_paths, 'message':message})  

        # --- Google Sheet Code ---
        # return jsonify({'bboxs':bboxs, 'jsons':jsons, 'col_width':col_width, 'table_width':table_width, 'csvs':csvs, 'gs_url':gs_url, 'message':message})
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


# 지정 pdf파일 지정 영역의 테이블을 추출하는 함수
def extract(regions, page_file, table_option, line_scale=40):
    # output_camelot = read_pdf(page_file, flavor="lattice", table_regions=regions)
    tables = None
    line_scale = int(line_scale)
    
    if table_option == "areas":
        parser = Lattice2(table_areas=regions, line_scale=line_scale)
        
    else:
        parser = Lattice2(table_regions=regions, line_scale=line_scale)
    tables = parser.extract_tables(page_file)
    
    return tables