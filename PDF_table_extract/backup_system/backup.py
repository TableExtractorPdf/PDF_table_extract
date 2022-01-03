import hashlib
import json
import os

def file_hash(path, file_name):
    '''
    파일 해시 변환
    File hash conversion

    Parameter
    ===========================================
    path <string> : task information file path
    file_hash <string> : pdf file hash value
    ===========================================
    return file_hash <string> : hash-converted pdf file
    '''
    with open(path+file_name, 'rb') as f:
        pdf_file = f.read()

    enc = hashlib.md5()
    enc.update(pdf_file)
    file_hash = enc.hexdigest()
    
    return file_hash

def create_task(path, file_hash):
    '''
    작업 정보 파일 생성 및 불러오기
    Create and loading task information file    

    Parameter
    ===========================================
    path <string> : task information file path
    file_hash <string> : pdf file hash value
    '''
    task_info = {
        "last_page" : 0,
        "checked" : [],
    }

    if os.path.isfile(f'{path+file_hash}.json'):
        print("작업 정보 파일이 존재합니다.")
        read_task()
    else:
        print("작업 정보 파일을 생성합니다.")
        with open(f"{path+file_hash}.json", 'w') as f:
            json.dump(task_info, f)

def update_task(path, file_hash, table_index, bbox, line_scale, last_page=0, checked=[]):
    '''
    작업 정보 파일 갱신
    Update task information file

    Parameter
    ===========================================
    path <string> : task information file path
    file_hash <string> : pdf file hash value
    table_index <int> : Table index existing in pdf file
    bbox <tuple> : table coordinates
    line_scale <int> : Line size scaling factor
    last_page <int> : The last page the user was working on
    checked <list> : Pages checked by the user
    '''
    if os.path.isfile(f'{path+file_hash}.json'):
        with open(f'{path+file_hash}.json', 'r') as f:
            task_info = json.loads(f)
    else:
        print("작업 저장 파일이 존재하지 않음")
        return -1

    task_info['last_page'] = last_page
    task_info['checked'] = checked
    task_info[table_index] = {
        'bbox' : bbox,
        'line_scale' : line_scale
    }

    with open(f'{path+file_hash}.json', 'w') as f:
        json.dump(task_info, f, ensure_ascii=False)

def read_task(path, file_hash):
    '''
    저장된 작업정보 파일 읽기
    Read saved task information file

    Parameter
    ===========================================
    path <string> : task information file path
    file_hash <string> : pdf file hash value
    ===========================================
    
    return
    ===========================================
    task_info <dictionary> : task information{
        'last_page' : temp, 일단 신경 ㄴ
        'checked' : temp, 일단 신경 ㄴ
        'table_index'<int> : {
            'bbox' : (bbox), (bbox) <tuple>,
            'line_scale' : line_scale <int>
        }
    }
    '''
    if os.path.isfile(f'{path+file_hash}.json'):
        with open(path+file_hash, 'r') as f:
            task_info = json.loads(f)

    return task_info