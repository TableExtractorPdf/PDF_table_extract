#
# get_file_path_select.py
# PDF_table_extract
#
# Created by Ji-yong219 on 2021-03-08
# Last modified on 2022-01-06
#

from flask import Flask
import os

from PDF_table_extract.www.views import views

def create_app():
    app = Flask(__name__)
    app.register_blueprint(views)
    app.secret_key = 'secret key@#(*@&@(*&#(*@#sfds@'

    UPLOAD_FOLDER = os.getcwd() + r'\PDF_TABLE_extract\www\static\job_pdf'
    app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
    app.debug = False

    return app