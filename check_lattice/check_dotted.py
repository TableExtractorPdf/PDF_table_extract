'''
start : 21.07.20
updated : 21.07.20
minku koo

점선 감지 후, 연결 작업
Camelot Github Issue
https://github.com/atlanhq/camelot/issues/370
    
'''

import numpy as np
import cv2

def __is_exist_dotted(line, n = 5):
    pixel = [ (i, int(p))  for i, p in enumerate(line) ]
    
    return

def detect_dotted_line(images, direction="v", line_scale=15):
    '''
    Parameters
    
    returns
    
    '''
    
    if direction.lower() == "v":
        size = threshold.shape[0] // line_scale
        el = cv2.getStructuringElement(cv2.MORPH_RECT, (1, size))
    
    elif direction.lower() == "h":
        size = threshold.shape[1] // line_scale
        el = cv2.getStructuringElement(cv2.MORPH_RECT, (size, 1))
        
    return render


