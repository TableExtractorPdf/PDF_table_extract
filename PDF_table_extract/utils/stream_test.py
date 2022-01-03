# stream test program

import camelot

path = "./pdf_for_stream/"
filename = "8"
tables = camelot.read_pdf(path+filename+".pdf", flavor="stream", page="1")

for t in tables:
    print("table exist")
print(tables[0].df)
camelot.plot(tables[0], kind='textedge').show()



