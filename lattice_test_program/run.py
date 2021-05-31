# start date : 210523
# update date : 210531
# minuKoo
# lattice test program flask server

from flask import (
    Flask,
    request,
    render_template,
    Blueprint,
    redirect,
    session
)
from werkzeug.utils import secure_filename
from PyPDF2 import PdfFileReader

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
import os.path
import os
from flask_caching import Cache

app = Flask(__name__)

@app.route('/', methods=['GET'])
def index():
    return render_template("index.html", html_data="", max_index=0)

@app.route('/extract', methods=['POST'])
def extract():
    if request.method == 'POST':
        pdf_File = request.files['pdf_input']
        pdf_page = request.form['pdf_page']
        line_scale = int( request.form['line_scale'] )
        process_background_num = int( request.form['process_background'] )
        process_background = False
        if process_background_num == 1:
            process_background = True
        copy_text = request.form['copy_text'] 
        shift_text = request.form['shift_text'] 
        joint_tol = int( request.form['joint_tol'] )
        split_text = request.form['split_text'] 
        line_tol = int( request.form['line_tol'] )
        iterations = int( request.form['iterations'] )
        
        print("PDF file name :", pdf_File.filename)
        is_pdf = pdf_File.filename.split(".")[-1].lower() == "pdf"
        
        if not is_pdf: # if not pdf format
            print("This is not pdf file")
            return render_template("index.html")
        
        save_path = './static/extracted/'
        pdf_save_path = save_path +"test.pdf"
        #secure_filename(pdf_File.filename)
        print("pdf save path:", pdf_save_path)
        
        
        if os.path.isfile(pdf_save_path) :
            os.remove(pdf_save_path)
        
        pdf_File.save(pdf_save_path)
        
        tables = camelot.read_pdf(pdf_save_path, 
                                pages = pdf_page, 
                                flavor="lattice", 
                                line_scale = line_scale,
                                # process_background = process_background,
                                # copy_text=copy_text,
                                # shift_text=shift_text,
                                # joint_tol=joint_tol,
                                # split_text=split_text,
                                # line_tol=line_tol,
                                # iterations=iterations
                                )
                                
        print("Lattice go on")
        htmls = []
        for index, tb in enumerate(tables):
            
            result_save_path = save_path+str(index)
            html_path = result_save_path+".html"
            if os.path.isfile(html_path) :
                os.remove(html_path)
            tb.to_html(html_path)
            htmls.append( str(open(html_path, "rt").read()) )
            camelot.plot(tb, kind='contour')
            
            png_path = result_save_path+".png"
            if os.path.isfile(png_path) :
                print("png remove")
                os.remove(png_path)
            
            plt.savefig(png_path, dpi=300)
            
        return render_template("index.html", html_data=htmls, max_index = index+1)#, data = data)


if __name__ == '__main__':
    app.run(debug=True)
    app.config["CACHE_TYPE"] = "null"
    cache.init_app(app)
    


