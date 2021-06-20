#

import matplotlib.pyplot as plt
import cv2
import numpy as np

from image_processing import (
    adaptive_threshold,
    find_lines,
    find_contours,
    find_joints,
)

def getImage(imname):
    img = cv2.imread("./pdf_sample/"+imname)
    return img

def show_plot(title, img):
    # out = threshold.copy()
    # out = 255 - out
    plt.imshow(img)
    if title != "":
        plt.savefig("./result/"+title+'.png', dpi=300)
    plt.show()

filename = "background3.png"
# filename = "sample.png"

imagename = "./pdf_sample/"+filename


img = cv2.imread(imagename)
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY) #흑백 전환
gray = cv2.cvtColor(gray, cv2.COLOR_BGR2RGB)
plt.imshow(gray)
plt.savefig("./result/"+filename+"gray"+'.png', dpi=300)
g2 = np.invert(gray)
plt.imshow(g2)
plt.savefig("./result/"+filename+"invert-gray"+'.png', dpi=300)
'''
'''
# read = cv2.imread(imagename)
# show_plot("", read)
# gray = cv2.cvtColor(read, cv2.COLOR_BGR2GRAY)
# show_plot("", gray)
# gray = np.invert(gray)
# show_plot("", gray)


# image = getImage(filename)
# show_plot( filename+"origin", image)

# gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
# show_plot( filename+"gray", gray)

threshold_blocksize, threshold_constant = 15, 0


background, backtitle = True, "-true"
# background , backtitle = False, "-false"

image, threshold = adaptive_threshold(
            imagename,
            process_background=background,
            blocksize=threshold_blocksize,
            c=threshold_constant,
        )

# threshold = cv2.cvtColor(threshold,cv2.COLOR_GRAY2RGB)
show_plot( filename+"background"+backtitle, threshold)


################

regions = None
# regions = [[a[0],  b[0],a[1], b[1]]]
line_scale= 20
iterations = 0

vertical_mask, vertical_segments = find_lines(
    threshold,
    regions=regions,
    direction="vertical",
    line_scale=line_scale,
    iterations=iterations,
)

horizontal_mask, horizontal_segments = find_lines(
    threshold,
    regions=regions,
    direction="horizontal",
    line_scale=line_scale,
    iterations=iterations,
)


show_plot(filename+"-file-lines"+backtitle, vertical_mask + horizontal_mask)



contours = find_contours(vertical_mask, horizontal_mask)



'''
vertical_mask = addOutline("v", vertical_mask, contours)
# show_plot( vertical_mask)

horizontal_mask = addOutline("h", horizontal_mask, contours)
show_plot("addOutline", vertical_mask+horizontal_mask)


contours = find_contours(vertical_mask, horizontal_mask)
# show_plot(imgname+"-addOutline",  horizontal_mask + vertical_mask)


addVerticalList = tableMerge(contours, vertical_segments, horizontal_segments)
print("addVerticalList", addVerticalList)
show_plot(imgname+"-tableMerge",  horizontal_mask + vertical_mask)
vertical_mask = addVerticalLine(vertical_mask, addVerticalList)
show_plot(imgname+"-addVerticalLine",  horizontal_mask + vertical_mask)

# get contours once again
contours = find_contours(vertical_mask, horizontal_mask)
# show_plot(imgname+"-addVertical",  horizontal_mask + vertical_mask)

# table_bbox = find_joints(contours, vertical_mask, horizontal_mask)

'''










