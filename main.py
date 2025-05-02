from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
import openai
from dotenv import load_dotenv
import os
from fastapi.middleware.cors import CORSMiddleware
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup
import requests
import logging
from urllib.parse import urlparse
import re
import json
from pydantic import BaseModel
from typing import Optional

class Query(BaseModel):
    query: str
    url: str
    analysis_type: Optional[str] = ""
    is_competitor: Optional[bool] = False



def calculate_design_score(analysis_results):
    """Genererar en poäng baserat på analysresultaten från OpenAI, där första intrycket spelar stor roll."""
    usability = 0.5
    aesthetics = 0.5
    performance = 0.5

    first_impression_positive = [
        "stilren", "modern design", "professionell känsla", "attraktiv", "tilltalande", "ren layout",
        "estetiskt behaglig", "harmonisk", "snygg", "inbjudande", "välkomnande", "imponerande"
    ]
    first_impression_negative = [
        "föråldrad", "rörig", "amatörmässig", "skräpig", "kaotisk", "ful design", "tråkig", "förvirrande",
        "ostrukturerad", "skräckexempel", "brist på stil"
    ]

    positive_usability = ["lätt att navigera", "intuitiv", "logisk layout", "användarvänlig"]
    negative_usability = ["förvirrande", "dålig navigation", "rörigt gränssnitt"]

    positive_aesthetics = ["välstrukturerad design", "attraktiv layout", "harmonisk färgsättning"]
    negative_aesthetics = ["rörig design", "svår att läsa", "kaotisk struktur"]

    positive_performance = ["snabb laddningstid", "optimerad", "responsiv design"]
    negative_performance = ["långsam laddning", "seg", "icke-responsiv design"]

    full_analysis_text = " ".join(analysis_results).lower()
    print("🔍 Analyserad text:", full_analysis_text)

    first_impression_score = 0.5
    for word in first_impression_positive:
        if word in full_analysis_text:
            first_impression_score += 0.2
    for word in first_impression_negative:
        if word in full_analysis_text:
            first_impression_score -= 0.3

    first_impression_score = min(max(first_impression_score, 0.2), 0.8)

    for word in positive_usability:
        if word in full_analysis_text:
            usability += 0.15
    for word in negative_usability:
        if word in full_analysis_text:
            usability -= 0.2

    for word in positive_aesthetics:
        if word in full_analysis_text:
            aesthetics += 0.15
    for word in negative_aesthetics:
        if word in full_analysis_text:
            aesthetics -= 0.2

    for word in positive_performance:
        if word in full_analysis_text:
            performance += 0.15
    for word in negative_performance:
        if word in full_analysis_text:
            performance -= 0.2

    usability *= first_impression_score
    aesthetics *= first_impression_score
    performance *= first_impression_score

    scores = {
        "usability": round(min(max(usability, 0.05), 0.95), 2),
        "aesthetics": round(min(max(aesthetics, 0.05), 0.95), 2),
        "performance": round(min(max(performance, 0.05), 0.95), 2),
        "first_impression": round(first_impression_score, 2)
    }
    print("✅ Beräknade poäng:", scores)
    return scores

def extract_json(response_text: str):
    import re
    json_match = re.search(r'```json\s*(\{.*?\})\s*```', response_text, re.DOTALL)
    if json_match:
        return json_match.group(1)
    json_match = re.search(r'(\{.*?\})', response_text, re.DOTALL)
    if json_match:
        return json_match.group(1)
    raise ValueError("Ingen giltig JSON hittades")

load_dotenv()

openai.api_key = os.getenv("VITE_OPENAI_API_KEY")
if not openai.api_key:
    raise ValueError("OpenAI API-nyckel saknas i miljövariabler.")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:8080", "http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Query(BaseModel):
    query: str
    url: str = None
    analysis_type: str = None  # Ny parameter för analystyp
    is_competitor: bool = False  # Ny parameter för konkurrentanalys

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

def scrape_dynamic_page(url):
    driver = initialize_driver()
    try:
        driver.get(url)
        WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.TAG_NAME, "body")))
        page_content = driver.page_source
        soup = BeautifulSoup(page_content, "html.parser")

        title = soup.title.string if soup.title else "Ingen titel hittades"
        meta_description = soup.find("meta", attrs={"name": "description"})
        meta_description_content = meta_description["content"] if meta_description else "Ingen meta-beskrivning hittades"

        headings = {
            "h1": [h.get_text(strip=True) for h in soup.find_all("h1")],
            "h2": [h.get_text(strip=True) for h in soup.find_all("h2")],
        }

        navigation = [nav.get_text(" ", strip=True) for nav in soup.find_all("nav")]
        buttons = [btn.get_text(strip=True) for btn in soup.find_all("button")]
        links = [a.get_text(strip=True) for a in soup.find_all("a")]

        # Extrahera färger och typografi (CSS-klasser och inline-stilar)
        colors = set()
        fonts = set()
        for element in soup.find_all(True, style=True):
            style = element['style']
            if 'color:' in style:
                colors.add(style.split('color:')[1].split(';')[0].strip())
            if 'font-family:' in style:
                fonts.add(style.split('font-family:')[1].split(';')[0].strip())

        design_summary = {
            "colors": list(colors),
            "fonts": list(fonts)
        }

        # Extrahera bilder för produktsidor
        images = [img.get('src', '') for img in soup.find_all('img') if img.get('src')]
        
        # Extrahera priser för produktsidor
        price_patterns = [
            r'(\d+[\s,\.]*\d+)(\s*kr|\s*SEK|\s*:-)', 
            r'(\d+)(\s*kr|\s*SEK|\s*:-)',
            r'pris[:\s]*(\d+[\s,\.]*\d+)'
        ]
        
        prices = []
        for pattern in price_patterns:
            price_matches = re.findall(pattern, page_content, re.IGNORECASE)
            if price_matches:
                prices.extend([match[0] for match in price_matches])
                
        # Leta efter säkerhetscertifieringar för trust check
        security_elements = {
            "ssl": "https" in url,
            "certifications": [],
            "payment_methods": []
        }
        
        trust_keywords = ["trygg e-handel", "säker betalning", "ssl", "secure", "verified", "trusted", "certifierad"]
        payment_keywords = ["klarna", "swish", "mastercard", "visa", "paypal", "stripe"]
        
        for keyword in trust_keywords:
            if keyword in page_content.lower():
                security_elements["certifications"].append(keyword)
                
        for keyword in payment_keywords:
            if keyword in page_content.lower():
                security_elements["payment_methods"].append(keyword)

        return {
            "title": title,
            "meta_description": meta_description_content,
            "headings": headings,
            "navigation": navigation,
            "buttons": buttons,
            "links": links,
            "design_summary": design_summary,
            "raw_html": page_content,
            "images": images,
            "prices": prices,
            "security_elements": security_elements
        }
    except Exception as e:
        logger.error("Fel vid skrapning: %s", str(e))
        raise HTTPException(status_code=500, detail=f"Selenium/BeautifulSoup-fel: {str(e)}")
    finally:
        driver.quit()

def get_prompt_by_type(analysis_type, extracted_data, url):
    """Returnerar rätt prompt baserat på analystyp"""
    
    base_structure = """
    Svara ENDAST med ett JSON-objekt i exakt det format jag specificerar. 
    Inkludera inga andra förklaringar, kommentarer eller markörer utanför JSON-objektet.
    Svara på svenska.
    """
    
    if analysis_type == "landing_page":
        return f"""
        Du är en expert på konverteringsoptimering och landningssidor. Analysera webbsidan {url} utifrån nedanstående data:

        - Titel: {extracted_data['title']}
        - Meta-beskrivning: {extracted_data['meta_description']}
        - H1-rubriker: {', '.join(extracted_data['headings']['h1'])}
        - H2-rubriker: {', '.join(extracted_data['headings']['h2'])}
        - Knappar: {', '.join(extracted_data['buttons'])}
        
        Analysera:
        1. Tydlighet i budskapet och "call-to-action"
        2. Hur väl landningssidan kan konvertera besökare
        3. Struktur och informationsarrangemang
        4. Övertalningsförmåga och säljargument

        {base_structure}

        {{
          "summary": "Övergripande bedömning av landningssidan",
          "clarity": "Analys av budskapets tydlighet",
          "conversion_potential": "Bedömning av konverteringspotential",
          "structure": "Bedömning av sidans struktur",
          "persuasiveness": "Analys av övertalningsförmåga",
          "recommendations": "Dina konkreta rekommendationer för förbättring"
        }}
        """
        
    elif analysis_type == "product_page":
        return f"""
        Du är en expert på e-handel och copywriting. Analysera produktsidan {url} utifrån nedanstående data:

        - Titel: {extracted_data['title']}
        - Meta-beskrivning: {extracted_data['meta_description']}
        - H1-rubriker: {', '.join(extracted_data['headings']['h1'])}
        - H2-rubriker: {', '.join(extracted_data['headings']['h2'])}
        - Bilder: {len(extracted_data['images'])} bilder hittades
        - Priser: {', '.join(extracted_data['prices']) if extracted_data['prices'] else 'Ingen pris hittad'}
        
        Analysera:
        1. Hur tydlig och säljande produktbeskrivningen är
        2. Om målgruppen nås effektivt
        3. Hur SEO-optimerat innehållet är
        4. Vad som kan förbättras för att öka konverteringar

        {base_structure}

        {{
          "summary": "Övergripande bedömning av produktsidan",
          "targeting": "Hur väl kommunikationen matchar målgruppen",
          "seo": "SEO-analys av produktsidan",
          "persuasiveness": "Analys av produktbeskrivningens övertygande kraft",
          "recommendations": "Konkreta förbättringsförslag"
        }}
        """
        
    elif analysis_type == "trust_check":
        return f"""
        Du är en expert på digitalt förtroende och säkerhet. Analysera webbplatsen {url} från ett pålitlighetsperspektiv:

        - Titel: {extracted_data['title']}
        - Meta-beskrivning: {extracted_data['meta_description']}
        - SSL-säkerhet: {"Ja" if extracted_data['security_elements']['ssl'] else "Nej"}
        - Certifieringar: {', '.join(extracted_data['security_elements']['certifications']) if extracted_data['security_elements']['certifications'] else 'Inga hittade'}
        - Betalningsmetoder: {', '.join(extracted_data['security_elements']['payment_methods']) if extracted_data['security_elements']['payment_methods'] else 'Inga hittade'}
        
        Analysera:
        1. Professionalism och förtroendeingivande design
        2. Säkerhetsindikatorer 
        3. Transparens kring företaget/verksamheten
        4. Riskindikatorer (eller avsaknad därav)

        {base_structure}

        {{
          "summary": "Övergripande bedömning av webbplatsens pålitlighet",
          "professionalism": "Analys av design och professionellt intryck",
          "security_indicators": "Analys av säkerhetsindikatorer",
          "transparency": "Bedömning av transparens kring verksamheten",
          "risk_assessment": "Bedömning av eventuella riskfaktorer",
          "recommendations": "Förslag på förbättringar för ökat förtroende"
        }}
        """
        
    elif analysis_type == "brand_analysis":
        return f"""
        Du är en varumärkesexpert med djup förståelse för digital positionering. Analysera webbplatsen {url} från ett varumärkesperspektiv:

        - Titel: {extracted_data['title']}
        - Meta-beskrivning: {extracted_data['meta_description']}
        - Färger: {', '.join(extracted_data['design_summary']['colors'])}
        - Typsnitt: {', '.join(extracted_data['design_summary']['fonts'])}
        - H1-rubriker: {', '.join(extracted_data['headings']['h1'])}
        
        Analysera:
        1. Varumärkets positionering och löfte
        2. Tonalitet och kommunikationsstil
        3. Visuell identitet och konsekvens
        4. Hur målgruppen tilltalas

        {base_structure}

        {{
          "summary": "Övergripande analys av varumärket",
          "positioning": "Bedömning av varumärkets positionering",
          "tone_of_voice": "Analys av tonalitet och kommunikationsstil",
          "visual_identity": "Bedömning av visuell identitet",
          "audience_appeal": "Hur effektivt varumärket tilltalar sin målgrupp",
          "recommendations": "Förslag på förbättringar för tydligare varumärkeskommunikation"
        }}
        """
        
    elif analysis_type == "mobile_experience":
        return f"""
        Du är en expert på mobilanvändarvänlighet och responsiv design. Analysera webbplatsen {url} från ett mobilperspektiv:

        - Titel: {extracted_data['title']}
        - Meta-beskrivning: {extracted_data['meta_description']}
        - Navigation: {', '.join(extracted_data['navigation'])}
        
        För denna analys, föreställ dig att du tittar på denna webbplats på en mobil enhet. Analysera:
        1. Mobilanpassning och responsiv design
        2. Lättnavigerad på liten skärm
        3. Laddningstider och prestanda för mobila enheter
        4. Touch-vänlighet och användbarhet

        {base_structure}

        {{
          "summary": "Övergripande bedömning av mobilupplevelsen",
          "responsiveness": "Analys av responsiv design",
          "navigation": "Bedömning av navigationen på mobil",
          "performance": "Prestanda och laddningstider för mobil",
          "usability": "Touch-vänlighet och mobilanpassad användbarhet",
          "recommendations": "Förslag på förbättringar för mobilupplevelsen"
        }}
        """
    
    # Default prompt om ingen matchning
    return generate_prompts(extracted_data, url)[0]  # Återanvänd den befintliga SEO-prompten som fallback


def generate_prompts(extracted_data, url):
    # ... keep existing code (the original prompt generation functions)
    seo_prompt = f"""
    Du är en erfaren SEO-specialist. Analysera webbplatsen {url} utifrån nedanstående data:

    - Titel: {extracted_data['title']}
    - Meta-beskrivning: {extracted_data['meta_description']}
    - H1-rubriker: {', '.join(extracted_data['headings']['h1'])}
    - H2-rubriker: {', '.join(extracted_data['headings']['h2'])}

    Analysera:
    1. Användning av relevanta sökord.
    2. Kvalitet och effektivitet i titel och meta-beskrivning.
    3. Eventuella tekniska SEO-problem.

    Ge en övergripande bedömning, lista några tydliga observationer (gärna i punktform) och ange konkreta rekommendationer.

    Svara ENDAST med ett JSON-objekt enligt följande format:
    {{
    "summary": "Övergripande bedömning av SEO.",
    "observations": [
        "Observation 1",
        "Observation 2"
    ],
    "recommendations": "Dina konkreta rekommendationer för SEO."
    }}
    Var god svara på svenska.
    """

    ux_prompt = f"""
Du är en senior UX-designer. Analysera webbplatsen {url} med fokus på användarupplevelsen. Utgå ifrån:
- Layout, färgschema och typografi.
- Navigering och användarvänlighet.
- Användarflöde och konvertering.

Ge en övergripande bedömning, lista specifika observationer (gärna i punktform) och ge konkreta förbättringsförslag.

Svara ENDAST med ett JSON-objekt enligt följande format:
{{
  "summary": "Övergripande bedömning av UX.",
  "observations": [
    "Observation 1",
    "Observation 2"
  ],
  "recommendations": "Dina konkreta UX-rekommendationer."
}}

Var god svara på svenska.
"""


    content_prompt = f"""
Du är en erfaren innehållsstrateg och copywriter. Analysera webbplatsen {url} utifrån:
- Tydlighet och relevans i innehållet.
- Struktur och läsbarhet.
- Hur väl innehållet kommunicerar webbplatsens syfte.

Ge en övergripande bedömning, lista tydliga observationer (gärna i punktform) samt konkreta rekommendationer för att förbättra innehållet.

Svara ENDAST med ett JSON-objekt enligt följande format:
{{
  "summary": "Övergripande bedömning av innehållet.",
  "observations": [
    "Observation 1",
    "Observation 2"
  ],
  "recommendations": "Dina konkreta innehållsrekommendationer."
}}

Var god svara på svenska.
"""

    
    return seo_prompt, ux_prompt, content_prompt

def generate_competitor_prompts(extracted_data, url):
    """Genererar promptar för konkurrentanalys med fokus på styrkor istället för förbättringsförslag"""
    
    competitor_seo_prompt = f"""
    Du är en erfaren SEO-specialist med fokus på konkurrentanalys. Analysera webbplatsen {url} utifrån nedanstående data:

    - Titel: {extracted_data['title']}
    - Meta-beskrivning: {extracted_data['meta_description']}
    - H1-rubriker: {', '.join(extracted_data['headings']['h1'])}
    - H2-rubriker: {', '.join(extracted_data['headings']['h2'])}

    Analysera:
    1. Användning av relevanta sökord.
    2. Kvalitet och effektivitet i titel och meta-beskrivning.
    3. Teknik och struktur som ger dem fördelar i sökresultaten.

    Identifiera ENDAST deras styrkor inom SEO - fokusera inte på svagheter eller förbättringsförslag.
    Ge en övergripande bedömning, lista några tydliga styrkor (gärna i punktform) och identifiera vad som gör deras SEO-strategi framgångsrik.

    Svara ENDAST med ett JSON-objekt enligt följande format:
    {{
    "summary": "Övergripande bedömning av konkurrentens SEO-styrkor.",
    "observations": [
        "Styrka 1",
        "Styrka 2"
    ],
    "recommendations": "Vilka strategier som gör deras SEO framgångsrik."
    }}
    Var god svara på svenska.
    """

    competitor_ux_prompt = f"""
    Du är en senior UX-designer med fokus på konkurrentanalys. Analysera webbplatsen {url} med fokus på användarupplevelsen. Utgå ifrån:
    - Layout, färgschema och typografi.
    - Navigering och användarvänlighet.
    - Användarflöde och konvertering.

    Identifiera ENDAST deras styrkor inom UX/UI - fokusera inte på brister eller förbättringsområden.
    Ge en övergripande bedömning, lista specifika positiva observationer (gärna i punktform) och beskriv varför deras UX-strategi är effektiv.

    Svara ENDAST med ett JSON-objekt enligt följande format:
    {{
      "summary": "Övergripande bedömning av konkurrentens UX-styrkor.",
      "observations": [
        "Styrka 1",
        "Styrka 2"
      ],
      "recommendations": "Varför deras UX-strategi är effektiv."
    }}

    Var god svara på svenska.
    """

    competitor_content_prompt = f"""
    Du är en erfaren innehållsstrateg och copywriter med fokus på konkurrentanalys. Analysera webbplatsen {url} utifrån:
    - Tydlighet och relevans i innehållet.
    - Struktur och läsbarhet.
    - Hur väl innehållet kommunicerar webbplatsens syfte.

    Identifiera ENDAST deras styrkor i innehållsstrategin - fokusera inte på svagheter eller förbättringsområden.
    Ge en övergripande bedömning, lista tydliga innehållsstyrkor (gärna i punktform) samt förklara varför innehållet är effektivt för deras målgrupp.

    Svara ENDAST med ett JSON-objekt enligt följande format:
    {{
      "summary": "Övergripande bedömning av konkurrentens innehållsstyrkor.",
      "observations": [
        "Styrka 1",
        "Styrka 2"
      ],
      "recommendations": "Vad som gör deras innehållsstrategi framgångsrik."
    }}

    Var god svara på svenska.
    """
    
    return competitor_seo_prompt, competitor_ux_prompt, competitor_content_prompt
def generate_recommendations_summary_prompt(seo_analysis, ux_analysis, content_analysis):
    return f"""
Du är en expert på webbanalys. Baserat på följande analyser, ge en sammanfattning och konkreta rekommendationer.

SEO-analys:
{seo_analysis}

UX-analys:
{ux_analysis}

Innehållsanalys:
{content_analysis}

Returnera ENDAST ett JSON-objekt i detta format:

{{
  "seo_recommendations": "Förbättringsförslag relaterade till SEO.",
  "ux_recommendations": "Förbättringsförslag relaterade till användarupplevelsen.",
  "content_recommendations": "Förbättringsförslag relaterade till innehållet.",
  "overall_summary": "En sammanfattning av de största förbättringsområdena på sidan."
}}
"""



def generate_competitor_strengths_summary_prompt(seo_analysis, ux_analysis, content_analysis):
    """Genererar en prompt för att sammanfatta konkurrentens styrkor"""
    
    summary_prompt = f"""
    Du är en expert inom konkurrentanalys för e-handel och digitala tjänster. Här är resultaten från tre professionella analyser av en konkurrents webbsida:

    SEO-analys:
    {seo_analysis}

    UX-analys:
    {ux_analysis}

    Innehållsanalys:
    {content_analysis}

    Sammanfatta de viktigaste styrkorna och framgångsfaktorerna från dessa analyser. Dela in ditt svar i tre sektioner:
    1. SEO-styrkor
    2. UX-styrkor
    3. Innehållsstyrkor

    Ge också en övergripande sammanfattning av deras huvudsakliga konkurrensfördelar.

    Svara ENDAST med ett JSON-objekt i exakt följande format:
    {{
    "seo_strengths": "text",
    "ux_strengths": "text",
    "content_strengths": "text",
    "overall_strengths": "text"
    }}
    """
    return summary_prompt

def generate_design_prompt(extracted_data, url):
    design_prompt = f"""
    Du är en extremt kritisk och professionell UX- och designexpert med mycket höga krav. 
    Analysera webbsidan {url} noggrant baserat på följande designelement:

    Titel på sidan:
    {extracted_data['title']}

    Använda färger:
    {', '.join(extracted_data['design_summary']['colors'])}

    Typografi:
    {', '.join(extracted_data['design_summary']['fonts'])}

    Huvudrubriker (H1):
    {', '.join(extracted_data['headings']['h1'])}

    Underrubriker (H2):
    {', '.join(extracted_data['headings']['h2'])}

    Navigationsstruktur:
    {', '.join(extracted_data['navigation'])}

    Knapptexter:
    {', '.join(extracted_data['buttons'])}

    Ge nu ett kritiskt och mycket strängt betyg enligt nedanstående skala (0.0 mycket dåligt, 1.0 perfekt):

    1. Usability (användarvänlighet)
    2. Aesthetics (visuell estetik)
    3. Performance (teknisk prestanda)

    Svara ENDAST med exakt följande JSON-format:
    {{
      "usability": 0.xx,
      "aesthetics": 0.xx,
      "performance": 0.xx,
      "comment": "Kort, mycket kritisk och professionell motivering"
    }}
    """
    return design_prompt

def generate_competitor_strengths_summary_prompt(seo_analysis, ux_analysis, content_analysis):
    summary_prompt = f"""
Du är en expert inom konkurrentanalys för e-handel och digitala tjänster. Här är resultaten från tre professionella analyser av en konkurrentbutik:

SEO-analys:
{seo_analysis}

UX-analys:
{ux_analysis}

Innehållsanalys:
{content_analysis}

Sammanfatta de viktigaste styrkorna och framgångsfaktorerna från dessa analyser. Dela in ditt svar i tre sektioner:
1. SEO-styrkor
2. UX-styrkor
3. Innehållsstyrkor

Ge också en övergripande sammanfattning av deras huvudsakliga konkurrensfördelar.

Svara ENDAST med ett JSON-objekt i exakt följande format:

{{
  "seo_strengths": "text",
  "ux_strengths": "text",
  "content_strengths": "text",
  "overall_strengths": "text"
}}
"""
    return summary_prompt


def analyze_with_openai(prompts):
    responses = []
    for prompt in prompts:
        data = {
            "model": "gpt-3.5-turbo", 
            "messages": [
                {"role": "system", "content": "Du är en expert på webbdesign, SEO, UX och digital kommunikation."},
                {"role": "user", "content": prompt}
            ],
            "max_tokens": 1000,
            "temperature": 0.7
        }
        headers = {
            "Authorization": f"Bearer {openai.api_key}",
            "Content-Type": "application/json"
        }
        try:
            response = requests.post(
                "https://api.openai.com/v1/chat/completions",
                headers=headers,
                json=data,
                timeout=30
            )
            response.raise_for_status()
            analysis_result = response.json()
            responses.append(analysis_result["choices"][0]["message"]["content"].strip())
        except requests.exceptions.RequestException as e:
            logger.error("OpenAI API-fel: %s", str(e))
            raise HTTPException(status_code=500, detail=f"OpenAI API-fel: {str(e)}")
    return responses

    

def get_visitor_count(domain):
    url = f"https://www.similarweb.com/website/{domain}/"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
    except requests.RequestException as e:
        print(f"❌ Kunde inte hämta sidan: {e}")
        return "N/A"
    soup = BeautifulSoup(response.text, "html.parser")
    match = re.search(r'"visits":([0-9]+)', response.text)
    if match:
        visitors = int(match.group(1))
        return f"{visitors:,} besökare/mån"
    return "N/A"

    


@app.post("/get_suggestions")
async def get_suggestions(query: Query):
    print("✅ get_suggestions körs!")
    print("Query-data:", query.dict())

    try:
        logger.info("Mottagen förfrågan: %s", query.query)
        logger.info("Mottagen URL: %s", query.url)
        logger.info("Mottagen analystyp: %s", query.analysis_type)
        logger.info("Är konkurrentanalys: %s", query.is_competitor)
        
        if not openai.api_key:
            raise HTTPException(status_code=500, detail="OpenAI API-nyckel saknas.")
        if not query.url:
            raise HTTPException(status_code=400, detail="URL krävs för analys.")
        result = urlparse(query.url)
        if not all([result.scheme, result.netloc]):
            raise HTTPException(status_code=400, detail="Ogiltig URL angiven.")
    except HTTPException as e:
        logger.error("HTTPException: %s", e.detail)
        raise e
    except Exception as e:
        logger.error("Ett oväntat fel inträffade: %s", str(e))
        raise HTTPException(status_code=500, detail="Internt serverfel.")

    print("🔍 BACKEND: börjar scrape och analys")
    extracted_data = scrape_dynamic_page(query.url)
    print("✅ BACKEND: scraping klar")

    # Kontrollera om det är en konkurrentanalys
    if query.is_competitor:
        # Använd konkurrentanalys-promptar
        seo_prompt, ux_prompt, content_prompt = generate_competitor_prompts(extracted_data, query.url)
        analysis_results = analyze_with_openai([seo_prompt, ux_prompt, content_prompt])
        
        if len(analysis_results) != 3:
            raise HTTPException(status_code=500, detail="Ofullständig analys från OpenAI.")

        # Bearbeta GPT-svaren för konkurrentanalys
        try:
            seo_data = json.loads(extract_json(analysis_results[0]))
            ux_data = json.loads(extract_json(analysis_results[1]))
            content_data = json.loads(extract_json(analysis_results[2]))
        except Exception as e:
            logger.error("Fel vid tolkning av AI-svar för konkurrentanalys: %s", str(e))
            seo_data = {"summary": "", "observations": [], "recommendations": ""}
            ux_data = {"summary": "", "observations": [], "recommendations": ""}
            content_data = {"summary": "", "observations": [], "recommendations": ""}
        
        # Bearbeta designanalys för konkurrent
        design_prompt = generate_design_prompt(extracted_data, query.url)
        design_response_raw = analyze_with_openai([design_prompt])[0]
        try:
            design_score = json.loads(extract_json(design_response_raw))
            for key in ["usability", "aesthetics", "performance"]:
                if key not in design_score:
                    design_score[key] = 0
        except Exception as e:
            logger.error("Fel vid tolkning av design score: %s", str(e))
            design_score = {
                "usability": 0,
                "aesthetics": 0,
                "performance": 0,
                "comment": "Kunde inte tolka designanalys."
            }
        
        # Sammanfattning av konkurrentens styrkor
        strengths_prompt = generate_competitor_strengths_summary_prompt(
            analysis_results[0], analysis_results[1], analysis_results[2]
        )
        print("🔍 STYRKE-PROMPT skickas:")
        print(strengths_prompt[:1000])  # Skriv ut första 1000 tecken så det inte blir för långt

        strengths_response = analyze_with_openai([strengths_prompt])[0]
        try:
            strengths_summary = json.loads(extract_json(strengths_response))
            for key in ["seo_strengths", "ux_strengths", "content_strengths", "overall_strengths"]:
                if key not in strengths_summary:
                    strengths_summary[key] = ""
        except Exception as e:
            logger.error("Fel vid tolkning av styrkesesammanfattning: %s", str(e))
            strengths_summary = {
                "seo_strengths": "",
                "ux_strengths": "",
                "content_strengths": "",
                "overall_strengths": "Kunde inte sammanfatta styrkor."
            }

        domain_only = result.netloc
        return {
            "seo_analysis": seo_data,
            "ux_analysis": ux_data,
            "content_analysis": content_data,
            "designScore": design_score,
            "strengths_summary": strengths_summary,
            "visitors_per_month": get_visitor_count(domain_only),
            "is_competitor": True
        }
    # Hantera olika analystyper
    elif query.analysis_type and query.analysis_type in [
        "landing_page", "product_page", "trust_check", "brand_analysis", "mobile_experience"
    ]:
        # Använd specifik prompt baserad på analystyp
        specific_prompt = get_prompt_by_type(query.analysis_type, extracted_data, query.url)
        analysis_results = analyze_with_openai([specific_prompt])
        
        if not analysis_results:
            raise HTTPException(status_code=500, detail="Ingen analys returnerades från AI.")
            
        try:
            json_str = extract_json(analysis_results[0])
            specialized_analysis = json.loads(json_str)
            
            # Lägg till analystyp i svaret
            response_data = {
                "analysis_type": query.analysis_type,
                "specialized_analysis": specialized_analysis,
                "designScore": {
                    "usability": 0.5,  # Defaultvärden om ingen design score beräknas
                    "aesthetics": 0.5,
                    "performance": 0.5
                }
            }
            
            # Gör en design score-analys om det behövs
            if query.analysis_type in ["landing_page", "product_page"]:
                design_prompt = generate_design_prompt(extracted_data, query.url)
                design_result = analyze_with_openai([design_prompt])
                try:
                    design_json_str = extract_json(design_result[0])
                    design_score = json.loads(design_json_str)
                    response_data["designScore"] = design_score
                except Exception as e:
                    logger.error("Fel vid tolkning av design score: %s", str(e))
            
            # Lägg till domäninfo
            domain_only = result.netloc
            response_data["visitors_per_month"] = get_visitor_count(domain_only)
            
            return response_data
            
        except Exception as e:
            logger.error("Fel vid tolkning av AI-svaret: %s", str(e))
            raise HTTPException(status_code=500, detail=f"Kunde inte tolka AI-svaret: {str(e)}")
    else:
        # Använd den befintliga SEO, UX och innehållsanalysen som tidigare
        seo_prompt, ux_prompt, content_prompt = generate_prompts(extracted_data, query.url)
        analysis_results = analyze_with_openai([seo_prompt, ux_prompt, content_prompt])
        if len(analysis_results) != 3:
            raise HTTPException(status_code=500, detail="Ofullständig analys från OpenAI.")

        # --------------------------------------------
        # Bearbeta GPT-svaren för SEO, UX och Innehåll
        # --------------------------------------------
        # Bearbeta SEO-analys
        seo_raw = analysis_results[0]
        try:
            seo_json_str = extract_json(seo_raw)
            seo_data = json.loads(seo_json_str)
        except Exception as e:
            seo_data = {"summary": "", "observations": [], "recommendations": ""}

        # Bearbeta UX-analys
        ux_raw = analysis_results[1]
        try:
            ux_json_str = extract_json(ux_raw)
            ux_data = json.loads(ux_json_str)
        except Exception as e:
            ux_data = {"summary": "", "observations": [], "recommendations": ""}

        # Bearbeta Innehålls-analys
        content_raw = analysis_results[2]
        try:
            content_json_str = extract_json(content_raw)
            content_data = json.loads(content_json_str)
        except Exception as e:
            content_data = {"summary": "", "observations": [], "recommendations": ""}

        # --------------------------------------------
        # Bearbeta Designanalys (finns redan som tidigare)
        # --------------------------------------------
        design_prompt = generate_design_prompt(extracted_data, query.url)
        design_response_raw = analyze_with_openai([design_prompt])[0]
        print("DEBUG - Rått GPT svar för design:", design_response_raw)
        try:
            json_match = re.search(r'```json\s*(\{.*?\})\s*```', design_response_raw, re.DOTALL)
            if json_match:
                clean_json_str = json_match.group(1)
            else:
                json_match = re.search(r'(\{.*?\})', design_response_raw, re.DOTALL)
                if json_match:
                    clean_json_str = json_match.group(1)
                else:
                    raise ValueError("Ingen giltig JSON hittades")
            design_score = json.loads(clean_json_str)
            for key in ["usability", "aesthetics", "performance"]:
                if key not in design_score:
                    design_score[key] = 0
            if "comment" not in design_score:
                design_score["comment"] = "Ingen kommentar från GPT."
        except (json.JSONDecodeError, ValueError) as e:
            logger.error(f"Kunde inte tolka JSON-svar från GPT: {design_response_raw}")
            design_score = {
                "usability": 0,
                "aesthetics": 0,
                "performance": 0,
                "comment": "GPT svarade inte med giltigt JSON."
            }

        # --------------------------------------------
        # Bearbeta Sammanfattning av rekommendationer
        # --------------------------------------------
        summary_prompt = generate_recommendations_summary_prompt(
            analysis_results[0], analysis_results[1], analysis_results[2]
        )
        summary_response = analyze_with_openai([summary_prompt])[0]
        print("DEBUG - Rått GPT svar för sammanfattade rekommendationer:", summary_response)
        try:
            json_match = re.search(r'```json\s*(\{.*?\})\s*```', summary_response, re.DOTALL)
            if json_match:
                clean_json_str = json_match.group(1)
            else:
                json_match = re.search(r'(\{.*?\})', summary_response, re.DOTALL)
                if json_match:
                    clean_json_str = json_match.group(1)
                else:
                    raise ValueError("Ingen giltig JSON hittades i GPT-svaret.")
            recommendations_summary = json.loads(clean_json_str)
            for key in ["seo_recommendations", "ux_recommendations", "content_recommendations", "overall_summary"]:
                if key not in recommendations_summary:
                    recommendations_summary[key] = ""
        except Exception as e:
            print(f"Fel vid tolkning av sammanfattade rekommendationer: {e}")
            recommendations_summary = {
                "seo_recommendations": "",
                "ux_recommendations": "",
                "content_recommendations": "",
                "overall_summary": "Inga rekommendationer kunde genereras."
            }

        domain_only = result.netloc
        return {
            "seo_analysis": seo_data,
            "ux_analysis": ux_data,
            "content_analysis": content_data,
            "designScore": design_score,
            "recommendations_summary": recommendations_summary,
            "visitors_per_month": get_visitor_count(domain_only)
        }

from fastapi import FastAPI

app = FastAPI()

# ... dina andra endpoints här
# t.ex. /get_suggestions, /analyze, etc

# Lägg Stripe-importer och config
import stripe
import os
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

# LÄGG DEN NYA ENDPOINTEN HÄR (för checkout)
@app.post("/create-checkout-session")
async def create_checkout_session(request: Request):
    try:
        body = await request.json()
        plan = body.get("plan")
        user_id = body.get("user_id")

        if not plan or not user_id:
            raise HTTPException(status_code=400, detail="Plan och User ID krävs")

        if plan == "plus":
            price_id = os.getenv("STRIPE_PRICE_ID_PLUS")
        elif plan == "pro":
            price_id = os.getenv("STRIPE_PRICE_ID_PRO")
        else:
            raise HTTPException(status_code=400, detail="Ogiltig plan")

        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            mode="subscription",
            line_items=[{
                'price': price_id,
                'quantity': 1,
            }],
            metadata={
                "user_id": user_id,
                "selected_plan": plan
            },
            success_url="https://dinhemsida.se/success",
            cancel_url="https://dinhemsida.se/cancel",
        )

        return {"checkout_url": session.url}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


from fastapi import Request
import json
import httpx  # För Auth0 API-anrop

STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")  # Vi hämtar Webhook Signing Secret här

@app.post("/webhook")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, STRIPE_WEBHOOK_SECRET
        )
    except stripe.error.SignatureVerificationError as e:
        raise HTTPException(status_code=400, detail=f"Webhook signature verification failed: {str(e)}")

    # Hantera bara checkout.session.completed
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        metadata = session.get('metadata', {})
        user_id = metadata.get('user_id')
        selected_plan = metadata.get('selected_plan')

        if user_id and selected_plan:
            # Uppdatera Auth0 metadata
            await update_auth0_user_plan(user_id, selected_plan)

    return {"status": "success"}

async def update_auth0_user_plan(user_id: str, plan: str):
    auth0_domain = os.getenv("AUTH0_DOMAIN")
    auth0_token = os.getenv("AUTH0_API_TOKEN")

    url = f"https://{auth0_domain}/api/v2/users/{user_id}"
    headers = {
        "Authorization": f"Bearer {auth0_token}",
        "Content-Type": "application/json"
    }
    data = {
        "app_metadata": {
            "plan": plan
        }
    }

    async with httpx.AsyncClient() as client:
        response = await client.patch(url, headers=headers, json=data)
        response.raise_for_status()

import stripe

# Initiera Stripe (lägg till detta där du sätter upp din app, t.ex. efter load_dotenv())
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")  # Detta måste finnas i din .env

class SubscriptionRequest(BaseModel):
    user_id: str
    email: str

@app.post("/user-subscription")
async def user_subscription(data: SubscriptionRequest):
    try:
        # 1. Sök om kunden redan finns i Stripe
        customers = stripe.Customer.list(email=data.email, limit=1)

        if customers.data:
            customer = customers.data[0]
            customer_id = customer.id
        else:
            # 2. Om inte - skapa ny customer
            customer = stripe.Customer.create(
                email=data.email,
                metadata={"user_id": data.user_id}
            )
            customer_id = customer.id

        # 3. Hämta prenumerationer för kunden
        subscriptions = stripe.Subscription.list(customer=customer_id, status="active", limit=1)

        if subscriptions.data:
            price_id = subscriptions.data[0]['items']['data'][0]['price']['id']
            if price_id == os.getenv("STRIPE_PRICE_ID_PLUS"):
                return {"subscription": "plus"}
            elif price_id == os.getenv("STRIPE_PRICE_ID_PRO"):
                return {"subscription": "pro"}
            else:
                return {"subscription": "free"}
        else:
            return {"subscription": "free"}

    except Exception as e:
        print(e)
        raise HTTPException(status_code=400, detail="Something went wrong when checking subscription.")
