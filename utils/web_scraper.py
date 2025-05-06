
import logging
import time
from typing import Dict, Any
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup
from fastapi import HTTPException

from utils.logging_utils import log_timing, TimingContext, logger

@log_timing
def initialize_driver():
    options = Options()
    options.add_argument("--headless")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.page_load_strategy = 'eager'
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
    driver.set_page_load_timeout(30)
    return driver

@log_timing
def scrape_dynamic_page(url: str) -> Dict[str, Any]:
    """
    Scrapes a dynamic web page using Selenium and BeautifulSoup.
    
    Args:
        url: The URL to scrape
        
    Returns:
        A dictionary with extracted web page data
    """
    logger.info(f"🔄 Börjar skrapa sidan: {url}")
    start_time = time.time()
    driver = initialize_driver()

    try:
        # --- STEG A: page_load ---
        with TimingContext("page_load"):
            driver.get(url)
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.TAG_NAME, "body"))
            )
            page_content = driver.page_source

        # --- STEG B: html_parsing ---
        with TimingContext("html_parsing"):
            soup = BeautifulSoup(page_content, "html.parser")

        # Extrahering av metadata
        title = soup.title.string if soup.title else "Ingen titel hittades"
        meta = soup.find("meta", attrs={"name": "description"})
        meta_description_content = meta["content"] if meta else "Ingen meta-beskrivning hittades"

        # --- STEG C: extract_elements ---
        with TimingContext("extract_elements"):
            # Headings
            headings = {
                "h1": [h.get_text(strip=True) for h in soup.find_all("h1")],
                "h2": [h.get_text(strip=True) for h in soup.find_all("h2")]
            }
            
            # Navigation elements
            navigation = []
            nav_elements = soup.find_all('nav')
            for nav in nav_elements:
                for link in nav.find_all('a'):
                    link_text = link.get_text(strip=True)
                    if link_text:
                        navigation.append(link_text)
                        
            # Buttons
            buttons = [btn.get_text(strip=True) for btn in soup.find_all('button') if btn.get_text(strip=True)]
            
            # Images
            images = [img.get('src', '') for img in soup.find_all('img') if img.get('src')]
            
            # Get prices (common patterns)
            prices = []
            price_patterns = soup.select('.price, .product-price, [itemprop="price"]')
            for p in price_patterns:
                price_text = p.get_text(strip=True)
                if price_text:
                    prices.append(price_text)
                    
            # Security elements
            security_elements = {
                "ssl": url.startswith("https://"),
                "certifications": [],
                "payment_methods": []
            }
            
            # Try to find common payment methods
            payment_imgs = soup.select('img[alt*="payment"], img[src*="payment"], img[src*="visa"], img[src*="mastercard"]')
            security_elements["payment_methods"] = [img.get('alt', 'Payment method') for img in payment_imgs]
            
            # Try to find certifications
            cert_imgs = soup.select('img[alt*="secure"], img[alt*="certified"], img[src*="trust"], img[src*="secure"]')
            security_elements["certifications"] = [img.get('alt', 'Certification') for img in cert_imgs]
            
            # Design elements
            import re
            design_summary = {
                "colors": [],
                "fonts": []
            }
            
            # Extract inline styles to get colors
            inline_styles = []
            for tag in soup.select('[style]'):
                inline_styles.append(tag['style'])
            
            # Extract colors from styles
            color_pattern = r'(?:color|background|background-color|border-color):\s*(#[0-9a-fA-F]{3,6}|rgba?\([^)]+\)|[a-zA-Z]+)'
            for style in inline_styles:
                colors = re.findall(color_pattern, style)
                design_summary["colors"].extend(colors)
            
            # Extract fonts
            font_pattern = r'font-family:\s*([^;]+)'
            for style in inline_styles:
                fonts = re.findall(font_pattern, style)
                for font in fonts:
                    font_names = [f.strip().strip("'").strip('"') for f in font.split(',')]
                    design_summary["fonts"].extend(font_names)
            
            # Remove duplicates and limit
            design_summary["colors"] = list(set(design_summary["colors"]))[:10]
            design_summary["fonts"] = list(set(design_summary["fonts"]))[:10]

        elapsed = time.time() - start_time
        logger.info(f"✅ Skrapning slutförd på {elapsed:.2f} sekunder")

        return {
            "title": title,
            "meta_description": meta_description_content,
            "headings": headings,
            "navigation": navigation,
            "buttons": buttons,
            "images": images,
            "prices": prices,
            "security_elements": security_elements,
            "design_summary": design_summary
        }

    except Exception as e:
        elapsed = time.time() - start_time
        logger.error(f"❌ Fel vid skrapning efter {elapsed:.2f} sekunder: {e!r}")
        raise HTTPException(status_code=500, detail=f"Selenium/BeautifulSoup-fel: {e}")

    finally:
        logger.info("Stänger driver")
        driver.quit()
