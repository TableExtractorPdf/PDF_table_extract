import math

'''
Main 함수
pandas dataFrame을 인자로 받아 Google Sheet에 연결하여 시트를 생성,
그리고 생성된 cell의 너비와 높이를 데이터에 맞게 변경해 주는 함수
input   : dataFrame(Pandas DataFrame)
output  : new Google Sheet
'''
def getWidth(dataFrame) :
    rows = len(dataFrame) + 1   # + 1 은 Column 열임
    cols = len(dataFrame.columns)

    maxWidth = 0
    maxHeight = 0

    result = []
    width_sum = 0

    for col in range(cols): 
        maxWidth = 0
        for row in range(rows):
            # Cell 객체에 접근하면 소요시간 오래걸려 dataFrame 값에 접근
            if(row == 0) : # row가 0인 경우 > column cell일때
                value = dataFrame.columns[col]
            else :
                value = dataFrame.iloc[row - 1, col]
            value = str(value)

            width = GetProperWidth(value, 14)
            if(width > maxWidth) :
                maxWidth = width

        # result.append({'type':'text', 'width':maxWidth})
        result.append({'width':str(maxWidth)+'px'})
        width_sum += maxWidth

    return result, width_sum

    # 행 높이를 설정해주는 구현문
    # 작동은 잘 되지만, google sheet가 자동으로 cell 높이을 잡아줌
    # 나중에 사용시 주석 해제하고 사용할 것
    # for row in range(rows):
        # maxHeight = 0
        # for col in range(cols):
           # if(row == 0):
               # value = dataFrame.columns[col]
           # else :
               # value = dataFrame.iloc[row - 1, col]

           # value = str(value)
           # height = GetProperHeight(value, fontSize)
           # if(height > maxHeight) :
               # maxHeight = height
       # gsFormat.set_row_height(workSheet, str(row + 1), maxHeight)

'''
GetFontSize 함수
format 객체를 받아서 String으로 형 변환 후, fontSize를 인덱싱해 값을 반환
input   : format(class: Format)
output  : fontSize(Integer)
'''
def GetFontSize(format) :
    format = str(format)
    attributes = format.split(';')
    fontSize = ""
    for char in attributes[10]: # 10번째 속성이 fontSize 속성임
        if char.isdecimal(): # str에서 숫자만 추출
            fontSize += char
    
    return int(fontSize)


'''
GetColAdr 함수
column 값을 숫자로 받아서 해당 숫자에 맞는 열 문자를 반환
input   : col(Interger)
output  : address(String)
'''
def GetColAdr(col) :
    address = ""
    while col > 0:
        col, remainder = divmod(col - 1, 26) # 26 == 알파벳 개수
        address = chr(65 + remainder) + address
    return address


'''
GetProperWidth 함수
text와 fontSize를 인자로 받아 셀의 적정 너비를 계산하는 함수
input   : text(String), fontSize(Integer)
output  : maxWidth(Integer) 
'''
def GetProperWidth(text, fontSize) : # Cell의 적정 길이를 반환하는 함수
    # 글자크기가 1pt일때 가로길이 구분
    # pt1p322 이면 글자크기가 1pt일때 가로길이 1.322pt임
    # margin은 셀의 여백임.

    lineList = text.splitlines()

    PT1P322 = ('@') # margin 7.78pt
  # PT1P312 = 한글 + margin 7.206pt
    PT1P155 = ('%') # margin 7.45pt
    PT1P122 = ('W') # margin 7.8
    PT1P088 = ('m', 'M') # margin 7.12pt
    PT1P022 = ('G', 'O', 'Q') # margin 6.78pt
    PT0P933 = ('w', 'C', 'D', 'H', 'N', 'R', 'U')  # margin 7.67pt
    PT0P866 = ('&', 'A', 'B', 'D', 'E', 'K', 'P', 'S', 'V', 'X', 'Y') # margin 7.34pt
    PT0P800 = ('F', 'T', 'Z') # margin 7pt
    PT0P755 = ('L') # margin 6.45pt
    PT0P733 = ('a', 'b', 'c', 'd', 'e', 'g', 'h', 'k', 'n', 'o', 'p', 
               'q', 's', 'u', 'v', 'x', 'y', 'z', '?', '=', '_', '#', 
               '$', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0') # margin 6.67pt
    PT0P644 = ('J') # margin 7.56pt
    PT0P611 = ('+', '^') # margin 6.89pt
    PT0P511 = ('*') # margin 6.89pt
    PT0P455 = ('\"') # margin 7.45pt
    PT0P355 = ('f', 'r', 't', ' ', '!', '\'', '[', ']', '/', ';', ':', 
               '-', '\\', '(', ')', ',', '.', '`', 'I', '·', '‘','’') # margin 7.45pt
    PT0P288 = ('i', 'j', 'l') # margin 7.12pt

    maxWidth = 0

    for line in lineList:
        
        width = 0
        textPixel = 0
        margin = 0
        length = len(line)
        
        if(length <= 0) :
            continue

        for c in line: # 문장의 한 글자씩 검수함
            if c in PT1P322 :
                textPixel += fontSize * 1.322
                margin += 7.78
            elif c in PT1P155 :
                textPixel += fontSize * 1.155
                margin += 7.45
            elif c in PT1P122 :
                textPixel += fontSize * 1.122
                margin += 7.8
            elif c in PT1P088 :
                textPixel += fontSize * 1.088
                margin += 7.12
            elif c in PT1P022 :
                textPixel += fontSize * 1.022
                margin += 6.78
            elif c in PT0P933 :
                textPixel += fontSize * 0.933
                margin += 7.67
            elif c in PT0P866 :
                textPixel += fontSize * 0.866
                margin += 7.34
            elif c in PT0P800 :
                textPixel += fontSize * 0.8
                margin += 7
            elif c in PT0P755 :
                textPixel += fontSize * 0.755
                margin += 6.45
            elif c in PT0P733 :
                textPixel += fontSize * 0.733
                margin += 6.67
            elif c in PT0P644 :
                textPixel += fontSize * 0.644
                margin += 7.56
            elif c in PT0P611 :
                textPixel += fontSize * 0.611
                margin += 6.89
            elif c in PT0P511 :
                textPixel += fontSize * 0.511
                margin += 6.89
            elif c in PT0P455 :
                textPixel += fontSize * 0.455
                margin += 7.45
            elif c in PT0P355 :
                textPixel += fontSize * 0.355
                margin += 7.45
            elif c in PT0P288 :
                textPixel += fontSize * 0.288
                margin += 7.12
            else : # 나머지 한글, 유니코드 기호들 > 대부분 한글 넓이와 같음
                textPixel += fontSize * 1.312
                margin += 7.206 
        margin = margin / len(line) # 각 폰트별 margin값 참고, 평균 margin값 산출
        width = math.ceil((textPixel + margin) * 1.01)
        if(width > maxWidth) :
            maxWidth = width
            
    return maxWidth


'''
GetProperHeight 함수
text와 fontSize를 인자로 받아 셀의 적정 높이를 계산하는 함수
input   : text(String), fontSize(Integer)
output  : height(Integer) 
'''
def GetProperHeight(text, fontSize) :
    lineList = text.splitlines()
    lineCount = len(lineList)
    PIXEL = 1.566 # 한줄당 글자의 높이 
    MARGIN = 5.34 # Cell의 여백

    height = ((PIXEL * fontSize) * lineCount) + MARGIN

    return int(height)