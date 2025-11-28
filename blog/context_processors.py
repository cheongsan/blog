# blog/context_processors.py
from django.conf import settings

def site_info(request):
    """
    Provides site configuration to all templates
    """
    return {
        'site_profile': settings.SITE_PROFILE,
        'site_config': settings.SITE_CONFIG,
        'notion_config': settings.NOTION_CONFIG,
        'google_analytics': settings.GOOGLE_ANALYTICS,
        'google_search_console': settings.GOOGLE_SEARCH_CONSOLE,
        'naver_search_advisor': settings.NAVER_SEARCH_ADVISOR,
        'utterances': settings.UTTERANCES,
        'cusdis': settings.CUSDIS,
        'is_prod': settings.IS_PROD,
    }
