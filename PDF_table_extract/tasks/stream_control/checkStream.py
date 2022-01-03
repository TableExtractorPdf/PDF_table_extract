# stream control
# start : 21.05.19
# update : 21.05.xx
# minku Koo


'''
- Stream 방식의 table detection 성능 향상을 위한 module
- 기본적으로 edge_tol을 활용하여 detection, default = 50
- 공식 문서 sample pdf 에서는 edge_tol = 500 까지 예시로 들고 있음

- verticaly 수직으로 떨어져 있는 테이블의 경우를 detection
> textlines를 받아서, y, x 좌표로 정렬
> 모든 textlines의 textedge를 검출 by PDFMiner

'''
import matplotlib.pyplot as plt
import camelot
# from stream2 import Stream2

filepath = 'edge_tol.pdf'

# parser = Stream2()
# tables = parser.extract_tables(filepath)
# if len(tables):
    # stream_areas = []
    # for table in tables:
        # x1, y1, x2, y2 = table._bbox
        # stream_areas.append((x1, y2, x2, y1))

# print("stream_areas", stream_areas)


tables = camelot.read_pdf(filepath, flavor='stream', edge_tol=60)
print()
for tab in tables:
    print( tab._bbox )
    camelot.plot(tab, kind='contour')
    plt.show()
    