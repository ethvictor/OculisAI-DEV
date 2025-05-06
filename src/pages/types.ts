
// types.ts

export interface AnalysisResult {
  summary: string;
  observations: string[];
  recommendations: string;
}

// Nya specialiserade analysgränssnitt
export interface LandingPageAnalysis {
  summary: string;
  clarity: string;
  conversion_potential: string;
  structure: string;
  persuasiveness: string;
  recommendations: string;
}

export interface ProductPageAnalysis {
  summary: string;
  targeting: string;
  seo: string;
  persuasiveness: string;
  recommendations: string;
}

export interface TrustCheckAnalysis {
  summary: string;
  professionalism: string;
  security_indicators: string;
  transparency: string;
  risk_assessment: string;
  recommendations: string;
}

export interface BrandAnalysis {
  summary: string;
  positioning: string;
  tone_of_voice: string;
  visual_identity: string;
  audience_appeal: string;
  recommendations: string;
}

export interface MobileExperienceAnalysis {
  summary: string;
  responsiveness: string;
  navigation: string;
  performance: string;
  usability: string;
  recommendations: string;
}

export interface StoreMetrics {
  name?: string;
  url?: string;
  analysis?: {
    seo_analysis?: AnalysisResult;
    ux_analysis?: AnalysisResult;
    content_analysis?: AnalysisResult;
  };
  designScore?: {
    usability: number;
    aesthetics: number;
    performance: number;
  };
  // Eventuella andra fält (revenue etc.)
  recommendations_summary?: {
    seo_recommendations: string;
    ux_recommendations: string;
    content_recommendations: string;
    overall_summary: string;
  };
  // Competitor-specific data
  strengths_summary?: {
    seo_strengths: string;
    ux_strengths: string;
    content_strengths: string;
    overall_strengths: string;
  };
  visitorsPerMonth?: string;
  products?: number;
  
  // Nya fält för specialiserad analys
  analysis_type?: string;
  specialized_analysis?: 
    LandingPageAnalysis | 
    ProductPageAnalysis | 
    TrustCheckAnalysis | 
    BrandAnalysis | 
    MobileExperienceAnalysis;
}

// Enklare typ för dropdown-alternativ
export interface AnalysisTypeOption {
  value: string;
  label: string;
  description: string;
  icon: React.ElementType;
}
