from datetime import datetime
import logging

from PDF_table_extract.www.app import create_app

# 설정 파일 읽어오기
logging.config.fileConfig('PDF_table_extract/config/logging.conf')

# 로거 생성
logger = logging.getLogger(__name__)

fh = logging.FileHandler(
    'PDF_table_extract/log/{:%Y-%m}.log'.format(datetime.now())
)
formatter = logging.Formatter(
    '%(asctime)s | %(levelname)-8s | %(lineno)04d | %(message)s'
)
fh.setFormatter(formatter)
logger.addHandler(fh)

app = create_app()