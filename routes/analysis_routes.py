
from fastapi import APIRouter, HTTPException, Depends, Request
from typing import Dict, Any, Optional
import json
import time
import re  # Add missing 're' import for regex
from urllib.parse import urlparse

import openai
from models import Query
from utils.logging_utils import log_timing, logger
from utils.web_scraper import scrape_dynamic_page
from utils.visitor_utils import get_visitor_count  # Fixed import statement
from utils.analysis_utils import (
    extract_json,
    generate_prompts, 
    generate_competitor_prompts,
    generate_recommendations_summary_prompt,
    generate_competitor_strengths_summary_prompt,
    generate_design_prompt,
    get_prompt_by_type,
    analyze_with_openai  # Now this is an async function
)

router = APIRouter()

@router.post("/get_suggestions")
async def get_suggestions(query: Query):
    logger.info("✅ get_suggestions körs!")
    logger.info("Query-data: %s", query.dict())
    
    total_start_time = time.time()
    
    try:
        logger.info("Validerar indata...")
        if not openai.api_key:
            logger.error("OpenAI API-nyckel saknas")
            raise HTTPException(status_code=500, detail="OpenAI API-nyckel saknas.")
        if not query.url:
            logger.error("URL saknas i förfrågan")
            raise HTTPException(status_code=400, detail="URL krävs för analys.")
        result = urlparse(query.url)
        if not all([result.scheme, result.netloc]):
            logger.error("Ogiltig URL: %s", query.url)
            raise HTTPException(status_code=400, detail="Ogiltig URL angiven.")
    except HTTPException as e:
        logger.error("HTTPException: %s", e.detail)
        raise e
    except Exception as e:
        logger.error("Ett oväntat fel inträffade: %s", str(e))
        raise HTTPException(status_code=500, detail="Internt serverfel.")

    logger.info("🔍 BACKEND: börjar scrape och analys")
    scrape_start = time.time()
    extracted_data = scrape_dynamic_page(query.url)
    scrape_time = time.time() - scrape_start
    logger.info(f"✅ BACKEND: scraping klar på {scrape_time:.2f}s")

    # Kontrollera om det är en konkurrentanalys
    if query.is_competitor:
        # Använd konkurrentanalys-promptar
        logger.info("Genererar promptar för konkurrentanalys")
        seo_prompt, ux_prompt, content_prompt = generate_competitor_prompts(extracted_data, query.url)
        
        logger.info("Skickar konkurrentanalys-promptar till OpenAI")
        openai_start = time.time()
        analysis_results = await analyze_with_openai([seo_prompt, ux_prompt, content_prompt])
        openai_time = time.time() - openai_start
        logger.info(f"✅ OpenAI-analys klar på {openai_time:.2f}s")
        
        if len(analysis_results) != 3:
            logger.error("Ofullständig analys från OpenAI")
            raise HTTPException(status_code=500, detail="Ofullständig analys från OpenAI.")

        # Bearbeta GPT-svaren för konkurrentanalys
        json_parse_start = time.time()
        try:
            seo_data = json.loads(extract_json(analysis_results[0]))
            ux_data = json.loads(extract_json(analysis_results[1]))
            content_data = json.loads(extract_json(analysis_results[2]))
        except Exception as e:
            logger.error("Fel vid tolkning av AI-svar för konkurrentanalys: %s", str(e))
            seo_data = {"summary": "", "observations": [], "recommendations": ""}
            ux_data = {"summary": "", "observations": [], "recommendations": ""}
            content_data = {"summary": "", "observations": [], "recommendations": ""}
        json_parse_time = time.time() - json_parse_start
        logger.info(f"✅ JSON-parsning klar på {json_parse_time:.2f}s")
        
        # Bearbeta designanalys för konkurrent
        logger.info("Genererar designanalys för konkurrent")
        design_prompt = generate_design_prompt(extracted_data, query.url)
        design_start = time.time()
        design_response_raw = (await analyze_with_openai([design_prompt]))[0]
        design_time = time.time() - design_start
        logger.info(f"✅ Designanalys klar på {design_time:.2f}s")
        
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
        logger.info("Genererar sammanfattning av konkurrentens styrkor")
        strengths_prompt = generate_competitor_strengths_summary_prompt(
            analysis_results[0], analysis_results[1], analysis_results[2]
        )
        
        strengths_start = time.time()
        strengths_response = (await analyze_with_openai([strengths_prompt]))[0]
        strengths_time = time.time() - strengths_start
        logger.info(f"✅ Styrkesesammanfattning klar på {strengths_time:.2f}s")
        
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
        
        total_time = time.time() - total_start_time
        logger.info(f"🎉 Konkurrentanalys slutförd på totalt {total_time:.2f}s")
        
        # Lägg till prestandamätningar i svaret
        perf_metrics = {
            "scrape_time": round(scrape_time, 2),
            "openai_analysis_time": round(openai_time, 2),
            "design_analysis_time": round(design_time, 2),
            "strengths_summary_time": round(strengths_time, 2),
            "total_processing_time": round(total_time, 2)
        }
        
        return {
            "seo_analysis": seo_data,
            "ux_analysis": ux_data,
            "content_analysis": content_data,
            "designScore": design_score,
            "strengths_summary": strengths_summary,
            "visitors_per_month": get_visitor_count(domain_only),
            "is_competitor": True,
            "performance_metrics": perf_metrics
        }
    # Hantera olika analystyper
    elif query.analysis_type and query.analysis_type in [
        "landing_page", "product_page", "trust_check", "brand_analysis", "mobile_experience"
    ]:
        # Använd specifik prompt baserad på analystyp
        logger.info(f"Genererar prompt för analystyp: {query.analysis_type}")
        specific_prompt = get_prompt_by_type(query.analysis_type, extracted_data, query.url)
        
        openai_start = time.time()
        analysis_results = await analyze_with_openai([specific_prompt])
        openai_time = time.time() - openai_start
        logger.info(f"✅ OpenAI-analys klar på {openai_time:.2f}s")
        
        if not analysis_results:
            logger.error("Ingen analys returnerades från AI")
            raise HTTPException(status_code=500, detail="Ingen analys returnerades från AI.")
            
        json_parse_start = time.time()
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
                logger.info("Genererar designanalys")
                design_prompt = generate_design_prompt(extracted_data, query.url)
                design_start = time.time()
                design_result = await analyze_with_openai([design_prompt])
                design_time = time.time() - design_start
                logger.info(f"✅ Designanalys klar på {design_time:.2f}s")
                
                try:
                    design_json_str = extract_json(design_result[0])
                    design_score = json.loads(design_json_str)
                    response_data["designScore"] = design_score
                except Exception as e:
                    logger.error("Fel vid tolkning av design score: %s", str(e))
            
            # Lägg till domäninfo
            domain_only = result.netloc
            visitor_start = time.time()
            response_data["visitors_per_month"] = get_visitor_count(domain_only)
            visitor_time = time.time() - visitor_start
            logger.info(f"✅ Besökare hämtade på {visitor_time:.2f}s")
            
            # Lägg till prestandamätningar
            total_time = time.time() - total_start_time
            logger.info(f"🎉 Specialiserad analys slutförd på totalt {total_time:.2f}s")
            
            response_data["performance_metrics"] = {
                "scrape_time": round(scrape_time, 2),
                "openai_analysis_time": round(openai_time, 2),
                "design_analysis_time": round(design_time if 'design_time' in locals() else 0, 2),
                "visitor_lookup_time": round(visitor_time, 2),
                "total_processing_time": round(total_time, 2)
            }
            
            return response_data
            
        except Exception as e:
            logger.error("Fel vid tolkning av AI-svaret: %s", str(e))
            raise HTTPException(status_code=500, detail=f"Kunde inte tolka AI-svaret: {str(e)}")
    else:
        # Använd den befintliga SEO, UX och innehållsanalysen som tidigare
        logger.info("Genererar standardpromptar för SEO, UX och innehållsanalys")
        seo_prompt, ux_prompt, content_prompt = generate_prompts(extracted_data, query.url)
        
        openai_start = time.time()
        analysis_results = await analyze_with_openai([seo_prompt, ux_prompt, content_prompt])
        openai_time = time.time() - openai_start
        logger.info(f"✅ OpenAI-analys klar på {openai_time:.2f}s")
        
        if len(analysis_results) != 3:
            logger.error("Ofullständig analys från OpenAI")
            raise HTTPException(status_code=500, detail="Ofullständig analys från OpenAI.")

        # --------------------------------------------
        # Bearbeta GPT-svaren för SEO, UX och Innehåll
        # --------------------------------------------
        json_parse_start = time.time()
        # Bearbeta SEO-analys
        seo_raw = analysis_results[0]
        try:
            seo_json_str = extract_json(seo_raw)
            seo_data = json.loads(seo_json_str)
        except Exception as e:
            logger.error(f"Fel vid tolkning av SEO-analys: {e}")
            seo_data = {"summary": "", "observations": [], "recommendations": ""}

        # Bearbeta UX-analys
        ux_raw = analysis_results[1]
        try:
            ux_json_str = extract_json(ux_raw)
            ux_data = json.loads(ux_json_str)
        except Exception as e:
            logger.error(f"Fel vid tolkning av UX-analys: {e}")
            ux_data = {"summary": "", "observations": [], "recommendations": ""}

        # Bearbeta Innehålls-analys
        content_raw = analysis_results[2]
        try:
            content_json_str = extract_json(content_raw)
            content_data = json.loads(content_json_str)
        except Exception as e:
            logger.error(f"Fel vid tolkning av innehållsanalys: {e}")
            content_data = {"summary": "", "observations": [], "recommendations": ""}
            
        json_parse_time = time.time() - json_parse_start
        logger.info(f"✅ JSON-parsning klar på {json_parse_time:.2f}s")

        # --------------------------------------------
        # Bearbeta Designanalys
        # --------------------------------------------
        logger.info("Genererar designanalys")
        design_prompt = generate_design_prompt(extracted_data, query.url)
        design_start = time.time()
        design_response_raw = (await analyze_with_openai([design_prompt]))[0]
        design_time = time.time() - design_start
        logger.info(f"✅ Designanalys klar på {design_time:.2f}s")
        
        logger.debug("Rått GPT svar för design: %s", design_response_raw[:500] + "...")
        
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
            logger.error(f"Kunde inte tolka JSON-svar från GPT: {e}")
            design_score = {
                "usability": 0,
                "aesthetics": 0,
                "performance": 0,
                "comment": "GPT svarade inte med giltigt JSON."
            }

        # --------------------------------------------
        # Bearbeta Sammanfattning av rekommendationer
        # --------------------------------------------
        logger.info("Genererar rekommendationssammanfattning")
        summary_prompt = generate_recommendations_summary_prompt(
            analysis_results[0], analysis_results[1], analysis_results[2]
        )
        summary_start = time.time()
        summary_response = (await analyze_with_openai([summary_prompt]))[0]
        summary_time = time.time() - summary_start
        logger.info(f"✅ Rekommendationssammanfattning klar på {summary_time:.2f}s")
        
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
            logger.error(f"Fel vid tolkning av sammanfattade rekommendationer: {e}")
            recommendations_summary = {
                "seo_recommendations": "",
                "ux_recommendations": "",
                "content_recommendations": "",
                "overall_summary": "Inga rekommendationer kunde genereras."
            }
            
        domain_only = result.netloc
        visitor_start = time.time()
        visitor_count = get_visitor_count(domain_only)
        visitor_time = time.time() - visitor_start
        logger.info(f"✅ Besökare hämtade på {visitor_time:.2f}s")
        
        total_time = time.time() - total_start_time
        logger.info(f"🎉 Standardanalys slutförd på totalt {total_time:.2f}s")
        
        # Lägger till prestandamätningar i svaret
        perf_metrics = {
            "scrape_time": round(scrape_time, 2),
            "openai_analysis_time": round(openai_time, 2),
            "json_parse_time": round(json_parse_time, 2),
            "design_analysis_time": round(design_time, 2),
            "recommendations_time": round(summary_time, 2),
            "visitor_lookup_time": round(visitor_time, 2),
            "total_processing_time": round(total_time, 2)
        }
        
        return {
            "seo_analysis": seo_data,
            "ux_analysis": ux_data,
            "content_analysis": content_data,
            "designScore": design_score,
            "recommendations_summary": recommendations_summary,
            "visitors_per_month": visitor_count,
            "performance_metrics": perf_metrics
        }
