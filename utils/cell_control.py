#
# cell_control.py
# PDF_table_extract
#
# Created by Ji-yong219 on 2021-11-18
# Last modified on 2021-11-18
#
import json

def json_text_to_list(cells):
    table = []
    for row in cells:
        row_cells = []
        for cell in row:
            row_cells.append(cell['text'])
        table.append(row_cells)

    return table

def find_merge_cell(cells):
    result = []
    visited = []
    rows, cols = len(cells), len(cells[0])
    for row in range(rows):
        for col in range(cols):
            colspan, rowspan = 1, 1
            curt_cell = cells[row][col]
            if (row, col) not in visited:#len(curt_cell['text']) >  0:
                # 수직 방향 검사
                if curt_cell['vspan'] == True:
                    while True:
                        try:
                            under_cell = cells[row + rowspan][col]
                            if len(under_cell['text']) == 0 and under_cell['vspan'] == True:
                                visited.append((row + rowspan, col))
                                # cells[row + rowspan][col]['text'] = 'searched'
                                rowspan += 1
                            else:
                                break
                            
                        except IndexError as e:
                            break
                # # 수평 방향 검사
                if curt_cell['hspan'] == True:
                    while True:
                        try:
                            next_cell = cells[row][col + colspan]
                            if len(next_cell['text']) == 0 and next_cell['hspan'] == True:
                                visited.append((row, col + colspan))
                                # cells[row][col + colspan]['text'] = 'searched'
                                colspan += 1
                            else:
                                break
                        except IndexError as e:
                            break
                if colspan > 1 or rowspan > 1:
                    cell_meta = {"address": get_col_alpha(col + 1) + str(row + 1), "size": [colspan, rowspan]}
                    result.append(json.dumps(cell_meta))
    return result

def get_col_alpha(col):
    address = ''
    while col > 0:
        col, remainder = divmod(col - 1, 26)  # 26 == 알파벳 개수
        address = chr(65 + remainder)
    return address