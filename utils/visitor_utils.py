
import re
import requests
from bs4 import BeautifulSoup
from urllib.parse import urlparse
from utils.logging_utils import log_timing, logger

@log_timing
def get_visitor_count(domain: str) -> str:
    """
    Attempts to retrieve estimated visitor count from SimilarWeb for a given domain.
    
    Args:
        domain: Website domain name
        
    Returns:
        String representing visitor count or "N/A" if unavailable
    """
    url = f"https://www.similarweb.com/website/{domain}/"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
    except requests.RequestException as e:
        logger.error(f"❌ Kunde inte hämta sidan: {e}")
        return "N/A"
    soup = BeautifulSoup(response.text, "html.parser")
    match = re.search(r'"visits":([0-9]+)', response.text)
    if match:
        visitors = int(match.group(1))
        return f"{visitors:,} besökare/mån"
    return "N/A"
