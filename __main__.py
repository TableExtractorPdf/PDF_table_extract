#
# get_file_path_select.py
# PDF_table_extract
#
# Created by Ji-yong219 on 2021-03-08
# Last modified on 2022-01-05
#
import logging
from datetime import datetime

from flask import g

from PDF_table_extract import app

if __name__ == "__main__":
    # 설정 파일 읽어오기
    logging.config.fileConfig('PDF_table_extract/config/logging.conf')

    # 로거 생성
    g.logger = logging.getLogger(__name__)

    fh = logging.FileHandler(
        'PDF_table_extract/log/{:%Y-%m}.log'.format(datetime.now())
    )
    formatter = logging.Formatter(
        '%(asctime)s | %(levelname)-8s | %(lineno)04d | %(message)s'
    )
    fh.setFormatter(formatter)
    g.logger.addHandler(fh)

    app.run(
        host= "127.0.0.1",
        port= 5001,
        use_reloader= False,
        debug= True
    )