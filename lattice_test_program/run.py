# 210523
# minuKoo
# lattice test program flask server

from flask import (
    Flask,
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
from PyPDF2 import PdfFileReader
# from utils.tasks import split as task_split

from Lattice_2 import Lattice2
# from check_lattice.check_line_scale import GetLineScale
# from ..check_lattice.Lattice_2 import Lattice2
# from .check_lattice.check_line_scale import GetLineScale
import cv2
import os
import json
import matplotlib.pyplot as plt
import camelot
import numpy as np
import pandas as pd

app = Flask(__name__)

@app.route('/', methods=['GET'])
def index():
    return render_template("index.html", html_data="", max_index=0)

@app.route('/extract', methods=['POST'])
def extract():
    if request.method == 'POST': 
        pdf_File = request.files['pdf_input']
        pdf_page = int( request.form['pdf_page'] )
        line_scale = int( request.form['line_scale'] )
        process_background = int( request.form['process_background'] )
        copy_text = request.form['copy_text'] 
        shift_text = int( request.form['shift_text'] )
        joint_tol = int( request.form['joint_tol'] )
        split_text = request.form['split_text'] 
        line_tol = int( request.form['line_tol'] )
        iterations = int( request.form['iterations'] )
        
        print("PDF file name :", pdf_File.filename)
        is_pdf = pdf_File.filename.split(".")[-1].lower() == "pdf"
        
        if not is_pdf:
            print("This is not pdf file")
            return render_template("index.html")
        
        save_path = './static/extracted/'
        pdf_save_path = save_path +"test.pdf"
        #secure_filename(pdf_File.filename)
        pdf_File.save(pdf_save_path)
        
        tables = camelot.read_pdf(pdf_save_path, flavor="lattice", line_scale=50)
        print("Lattice go on")
        # parser = Lattice2( line_scale=45)
        # tables = parser.extract_tables(image_save_path)
        htmls = []
        for index, tb in enumerate(tables):
            print( tb.df )
            result_save_path = save_path+str(index)
            tb.to_html(result_save_path+".html")
            htmls.append( str(open(result_save_path+".html", "rt").read()) )
            camelot.plot(tb, kind='contour')
            # plt.save(result_save_path+".png")
            plt.savefig(result_save_path+".png", dpi=400)
            # plt.show()
        
        
        return render_template("index.html", html_data=htmls, max_index = index+1)#, data = data)


if __name__ == '__main__':
    app.run(debug=True)
    # app.run()
    


