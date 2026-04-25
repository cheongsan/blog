import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / '.env')

DEBUG = os.environ.get('DEBUG', 'True') == 'True'

NOTION_CONFIG = {
    'page_id': os.environ.get('NOTION_PAGE_ID', ''),
    'access_token': os.environ.get('NOTION_ACCESS_TOKEN', ''),
}
