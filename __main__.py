#
# get_file_path_select.py
# PDF_table_extract
#
# Created by Ji-yong219 on 2021-03-08
# Last modified on 2022-01-05
#

from PDF_table_extract import app

if __name__ == "__main__":

    app.run(
        host= "127.0.0.1",
        port= 5001,
        use_reloader= False,
        debug= True
    )