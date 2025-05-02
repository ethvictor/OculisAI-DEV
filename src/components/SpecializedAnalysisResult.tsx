
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LandingPageAnalysis,
  ProductPageAnalysis,
  TrustCheckAnalysis,
  BrandAnalysis,
  MobileExperienceAnalysis
} from "@/pages/types";

interface DesignScore {
  usability: number;
  aesthetics: number;
  performance: number;
  comment?: string;
}

type SpecializedAnalysisType = 
  LandingPageAnalysis | 
  ProductPageAnalysis | 
  TrustCheckAnalysis | 
  BrandAnalysis | 
  MobileExperienceAnalysis;

interface SpecializedAnalysisResultProps {
  analysisType: string;
  specializedAnalysis: SpecializedAnalysisType;
  designScore?: DesignScore;
}

interface SectionFieldConfig {
  key: string;
  label: string;
  color: string;
}

function getFieldConfig(analysisType: string): SectionFieldConfig[] {
  switch (analysisType) {
    case 'landing_page':
      return [
        { key: 'clarity', label: 'Tydlighet', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200' },
        { key: 'conversion_potential', label: 'Konverteringspotential', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200' },
        { key: 'structure', label: 'Struktur', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200' },
        { key: 'persuasiveness', label: 'Övertalningsförmåga', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200' }
      ];
      
    case 'product_page':
      return [
        { key: 'targeting', label: 'Målgruppanpassning', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200' },
        { key: 'seo', label: 'SEO-optimering', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200' },
        { key: 'persuasiveness', label: 'Övertygande kraft', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200' }
      ];
      
    case 'trust_check':
      return [
        { key: 'professionalism', label: 'Professionalism', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200' },
        { key: 'security_indicators', label: 'Säkerhetsindikatorer', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200' },
        { key: 'transparency', label: 'Transparens', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200' },
        { key: 'risk_assessment', label: 'Riskbedömning', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200' }
      ];
      
    case 'brand_analysis':
      return [
        { key: 'positioning', label: 'Positionering', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200' },
        { key: 'tone_of_voice', label: 'Tonalitet', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200' },
        { key: 'visual_identity', label: 'Visuell identitet', color: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-200' },
        { key: 'audience_appeal', label: 'Målgruppsanpassning', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200' }
      ];
      
    case 'mobile_experience':
      return [
        { key: 'responsiveness', label: 'Responsivitet', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200' },
        { key: 'navigation', label: 'Navigation', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200' },
        { key: 'performance', label: 'Prestanda', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200' },
        { key: 'usability', label: 'Användbarhet', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200' }
      ];
      
    default:
      return [
        { key: 'summary', label: 'Sammanfattning', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200' }
      ];
  }
}

function getBarColor(value: number) {
  if (value >= 70) return "bg-green-500";
  if (value >= 50) return "bg-yellow-500";
  return "bg-red-500";
}

export const SpecializedAnalysisResult: React.FC<SpecializedAnalysisResultProps> = ({ 
  analysisType, 
  specializedAnalysis,
  designScore 
}) => {
  const fieldConfig = getFieldConfig(analysisType);
  
  return (
    <div className="p-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-primary data-[state=active]:text-white"
          >
            Översikt
          </TabsTrigger>
          <TabsTrigger
            value="recommendations"
            className="data-[state=active]:bg-primary data-[state=active]:text-white"
          >
            Rekommendationer
          </TabsTrigger>
        </TabsList>
        
        {/* Översikt */}
        <TabsContent value="overview" className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-xl font-bold mb-4">Sammanfattning</h3>
            <div className="prose dark:prose-invert max-w-none">
              <p>{specializedAnalysis.summary}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fieldConfig.map((field) => (
              <div key={field.key} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center mb-3">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${field.color}`}>
                    {field.label}
                  </span>
                </div>
                <div className="prose dark:prose-invert max-w-none">
                  <p>{(specializedAnalysis as any)[field.key]}</p>
                </div>
              </div>
            ))}
          </div>
          
          {designScore && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-xl font-bold mb-4">Design & Användbarhet</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  {/* Användarvänlighet */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">Användarvänlighet</span>
                      <span className="font-bold">
                        {(designScore.usability * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`${getBarColor(designScore.usability * 100)} h-3 rounded-full transition-all duration-500`}
                        style={{ width: `${designScore.usability * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Estetik */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">Estetik</span>
                      <span className="font-bold">
                        {(designScore.aesthetics * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`${getBarColor(designScore.aesthetics * 100)} h-3 rounded-full transition-all duration-500`}
                        style={{ width: `${designScore.aesthetics * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Prestanda */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">Prestanda</span>
                      <span className="font-bold">
                        {(designScore.performance * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`${getBarColor(designScore.performance * 100)} h-3 rounded-full transition-all duration-500`}
                        style={{ width: `${designScore.performance * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-2">
                      {(((designScore.usability + designScore.aesthetics + designScore.performance) / 3) * 100).toFixed(0)}%
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">Genomsnittligt betyg</p>
                    {designScore.comment && (
                      <p className="text-sm mt-2 text-gray-500">{designScore.comment}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </TabsContent>
        
        {/* Rekommendationer */}
        <TabsContent value="recommendations">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-xl font-bold mb-4">Rekommendationer</h3>
            <div className="prose dark:prose-invert max-w-none">
              <p>{specializedAnalysis.recommendations}</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
