import json
import re
import asyncio
import time
from typing import List, Dict, Any, Tuple
from httpx import AsyncClient
import openai
from fastapi import HTTPException
from utils.logging_utils import log_timing, logger, TimingContext

@log_timing
def extract_json(response_text: str) -> str:
    """Extract JSON content from an AI response text"""
    import re
    json_match = re.search(r'```json\s*(\{.*?\})\s*```', response_text, re.DOTALL)
    if json_match:
        return json_match.group(1)
    json_match = re.search(r'(\{.*?\})', response_text, re.DOTALL)
    if json_match:
        return json_match.group(1)
    raise ValueError("Ingen giltig JSON hittades")

@log_timing
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
    logger.info("🔍 Analyserad text: %s (förkortad)", full_analysis_text[:200] + "...")

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
    logger.info("✅ Beräknade poäng: %s", scores)
    return scores

@log_timing
def get_prompt_by_type(analysis_type: str, extracted_data: Dict[str, Any], url: str) -> str:
    """Returnerar rätt prompt baserat på analystyp"""
    logger.info(f"🔄 Genererar prompt för analystyp: {analysis_type}")
    
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

@log_timing
def generate_prompts(extracted_data: Dict[str, Any], url: str) -> Tuple[str, str, str]:
    """Generate standard prompts for SEO, UX, and content analysis"""
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

@log_timing
def generate_competitor_prompts(extracted_data: Dict[str, Any], url: str) -> Tuple[str, str, str]:
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

@log_timing
def generate_recommendations_summary_prompt(seo_analysis: str, ux_analysis: str, content_analysis: str) -> str:
    """Generate a prompt for summarizing recommendations from multiple analyses"""
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

@log_timing
def generate_competitor_strengths_summary_prompt(seo_analysis: str, ux_analysis: str, content_analysis: str) -> str:
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

@log_timing
def generate_design_prompt(extracted_data: Dict[str, Any], url: str) -> str:
    """Generate a prompt for analyzing design elements"""
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

# Asynkron funktion för att köra OpenAI API anrop parallellt för bättre prestanda
async def analyze_with_openai_async(prompts: List[str]):
    logger.info(f"🔄 Startar asynkron analys med {len(prompts)} prompter")
    start_time = time.time()
    
    async def process_prompt(prompt, index):
        prompt_start = time.time()
        logger.info(f"Skickar prompt {index+1}/{len(prompts)} till OpenAI")
        
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
            async with AsyncClient(timeout=30) as client:
                response = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers=headers,
                    json=data
                )
                response.raise_for_status()
                result = response.json()
                content = result["choices"][0]["message"]["content"].strip()
                prompt_elapsed = time.time() - prompt_start
                logger.info(f"✅ Prompt {index+1} slutförd på {prompt_elapsed:.2f}s")
                return content
        except Exception as e:
            prompt_elapsed = time.time() - prompt_start
            logger.error(f"❌ Fel vid prompt {index+1} efter {prompt_elapsed:.2f}s: {str(e)}")
            raise
    
    # Kör alla API-anrop parallellt
    tasks = [process_prompt(prompt, i) for i, prompt in enumerate(prompts)]
    responses = await asyncio.gather(*tasks, return_exceptions=True)
    
    # Kontrollera för eventuella fel
    for i, response in enumerate(responses):
        if isinstance(response, Exception):
            logger.error(f"Fel i prompt {i+1}: {str(response)}")
            responses[i] = f"Fel: {str(response)}"
    
    total_elapsed = time.time() - start_time
    logger.info(f"✅ Alla OpenAI-anrop slutförda på {total_elapsed:.2f}s")
    return responses

# Kompatibilitetsfunktion för synkron användning
@log_timing
async def analyze_with_openai(prompts: List[str]):
    """
    Analyze prompts with OpenAI API.
    This function works both in async and sync contexts.
    """
    # We make this function async and always use it asynchronously
    logger.info(f"Analyzing {len(prompts)} prompts with OpenAI")
    return await analyze_with_openai_async(prompts)
