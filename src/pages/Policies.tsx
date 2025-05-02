
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Shield, Lock, Globe, Info } from "lucide-react";

const PolicyPage = () => {
  const [activePolicy, setActivePolicy] = useState<string>("privacy");

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="container py-8 max-w-4xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Policies and Terms
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Our commitment to security, privacy, and transparency
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            <Card className="p-4 sticky top-8">
              <div className="space-y-2">
                <button
                  onClick={() => setActivePolicy("privacy")}
                  className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-2 ${
                    activePolicy === "privacy"
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <Shield className="h-4 w-4" />
                  <span>Integritetspolicy</span>
                </button>
                <button
                  onClick={() => setActivePolicy("terms")}
                  className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-2 ${
                    activePolicy === "terms"
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <Lock className="h-4 w-4" />
                  <span>Användarvillkor</span>
                </button>
                <button
                  onClick={() => setActivePolicy("cookies")}
                  className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-2 ${
                    activePolicy === "cookies"
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <Globe className="h-4 w-4" />
                  <span>Cookiepolicy</span>
                </button>
                <button
                  onClick={() => setActivePolicy("accessibility")}
                  className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-2 ${
                    activePolicy === "accessibility"
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <Info className="h-4 w-4" />
                  <span>Tillgänglighet</span>
                </button>
              </div>
            </Card>
          </div>

          <div className="md:col-span-3">
            <Card className="p-6">
              {activePolicy === "privacy" && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">Integritetspolicy</h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Vi värderar din integritet och är engagerade i att skydda dina personuppgifter.
                    Denna integritetspolicy beskriver hur vi samlar in, använder och skyddar
                    information som samlas in via vår webbplats.
                  </p>

                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger>Information vi samlar in</AccordionTrigger>
                      <AccordionContent>
                        <p className="mb-4">
                          Vi samlar in följande typer av information när du använder vår tjänst:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                          <li>URL:er till e-handelsbutiker som du analyserar</li>
                          <li>Resultat från analyser du utför</li>
                          <li>Teknisk information om din enhet och webbläsare</li>
                          <li>Cookies och liknande teknologier</li>
                        </ul>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-2">
                      <AccordionTrigger>Hur vi använder din information</AccordionTrigger>
                      <AccordionContent>
                        <p className="mb-4">Vi använder insamlad information för att:</p>
                        <ul className="list-disc pl-6 space-y-2">
                          <li>Tillhandahålla och förbättra vår tjänst</li>
                          <li>Anpassa innehåll och rekommendationer</li>
                          <li>Analysera användningsmönster och trender</li>
                          <li>Kommunicera med dig om tjänstrelaterade ärenden</li>
                        </ul>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-3">
                      <AccordionTrigger>Datadelning och dataöverföring</AccordionTrigger>
                      <AccordionContent>
                        <p className="mb-4">
                          Vi delar inte dina personuppgifter med tredje part förutom i följande
                          situationer:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                          <li>Med tjänsteleverantörer som hjälper oss att driva vår tjänst</li>
                          <li>Om det krävs enligt lag eller för att skydda våra rättigheter</li>
                          <li>Med ditt uttryckliga samtycke</li>
                        </ul>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-4">
                      <AccordionTrigger>Dina rättigheter</AccordionTrigger>
                      <AccordionContent>
                        <p className="mb-4">Under GDPR har du följande rättigheter:</p>
                        <ul className="list-disc pl-6 space-y-2">
                          <li>Rätt till tillgång till dina personuppgifter</li>
                          <li>Rätt till rättelse av felaktiga uppgifter</li>
                          <li>Rätt till radering av dina uppgifter</li>
                          <li>Rätt att begränsa behandlingen av dina uppgifter</li>
                          <li>Rätt till dataportabilitet</li>
                          <li>Rätt att invända mot behandling av dina uppgifter</li>
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              )}

              {activePolicy === "terms" && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">Användarvillkor</h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Genom att använda vår tjänst godkänner du dessa användarvillkor. Vänligen läs
                    dem noggrant innan du fortsätter använda vår webbplats.
                  </p>

                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger>Användning av tjänsten</AccordionTrigger>
                      <AccordionContent>
                        <p className="mb-4">
                          Vår tjänst får endast användas för lagliga syften och i enlighet med dessa
                          villkor. Du får inte:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                          <li>Bryta mot några lagar eller förordningar</li>
                          <li>Manipulera eller försöka kringgå säkerhetsfunktioner</li>
                          <li>Använda tjänsten för att sprida skadlig kod eller malware</li>
                          <li>
                            Överbelasta eller störa infrastrukturen för vår tjänst
                          </li>
                        </ul>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-2">
                      <AccordionTrigger>Intellektuella rättigheter</AccordionTrigger>
                      <AccordionContent>
                        <p className="mb-4">
                          Allt innehåll som tillhandahålls på vår webbplats, inklusive men inte
                          begränsat till text, grafik, logotyper, ikoner, bilder, ljud, videor och
                          programvara, ägs av oss eller våra licensgivare och är skyddat av
                          upphovsrätt och andra immaterialrättsliga lagar.
                        </p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-3">
                      <AccordionTrigger>Ansvarsbegränsning</AccordionTrigger>
                      <AccordionContent>
                        <p className="mb-4">
                          Vår tjänst tillhandahålls "i befintligt skick" utan några garantier. Vi är
                          inte ansvariga för några skador som kan uppstå som ett resultat av din
                          användning av vår tjänst.
                        </p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-4">
                      <AccordionTrigger>Ändringar i villkoren</AccordionTrigger>
                      <AccordionContent>
                        <p className="mb-4">
                          Vi förbehåller oss rätten att ändra dessa användarvillkor när som helst.
                          Fortsatt användning av tjänsten efter sådana ändringar utgör ditt
                          godkännande av de nya villkoren.
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              )}

              {activePolicy === "cookies" && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">Cookiepolicy</h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Vår webbplats använder cookies för att förbättra din upplevelse. Denna policy
                    förklarar hur vi använder cookies och liknande teknologier.
                  </p>

                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger>Vad är cookies?</AccordionTrigger>
                      <AccordionContent>
                        <p className="mb-4">
                          Cookies är små textfiler som lagras på din enhet när du besöker en
                          webbplats. De används för att komma ihåg dina preferenser och ge en mer
                          personlig upplevelse.
                        </p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-2">
                      <AccordionTrigger>Typer av cookies vi använder</AccordionTrigger>
                      <AccordionContent>
                        <p className="mb-4">Vi använder följande typer av cookies:</p>
                        <ul className="list-disc pl-6 space-y-2">
                          <li>
                            <strong>Nödvändiga cookies:</strong> För att webbplatsen ska fungera
                            korrekt
                          </li>
                          <li>
                            <strong>Preferenscookies:</strong> För att komma ihåg dina val och
                            inställningar
                          </li>
                          <li>
                            <strong>Statistikcookies:</strong> För att analysera hur du använder vår
                            webbplats
                          </li>
                          <li>
                            <strong>Marknadsföringscookies:</strong> För att visa relevant innehåll
                            och annonser
                          </li>
                        </ul>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-3">
                      <AccordionTrigger>Hantera cookies</AccordionTrigger>
                      <AccordionContent>
                        <p className="mb-4">
                          Du kan kontrollera och hantera cookies på olika sätt. De flesta webbläsare
                          låter dig se vilka cookies du har och radera dem individuellt eller
                          blockera cookies från specifika webbplatser.
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              )}

              {activePolicy === "accessibility" && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">Tillgänglighetspolicy</h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Vi strävar efter att göra vår webbplats tillgänglig för alla användare,
                    inklusive personer med funktionsnedsättningar.
                  </p>

                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger>Vårt åtagande</AccordionTrigger>
                      <AccordionContent>
                        <p className="mb-4">
                          Vi arbetar för att säkerställa att vår webbplats följer WCAG 2.1 AA
                          standarder och är tillgänglig för alla användare. Vi gör kontinuerliga
                          förbättringar för att uppnå detta mål.
                        </p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-2">
                      <AccordionTrigger>Tillgänglighetsfunktioner</AccordionTrigger>
                      <AccordionContent>
                        <p className="mb-4">
                          Vår webbplats innehåller följande tillgänglighetsfunktioner:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                          <li>Tydlig och konsekvent navigation</li>
                          <li>Responsiv design som fungerar på olika enheter</li>
                          <li>Text med god kontrast mot bakgrunden</li>
                          <li>Alternativa texter för bilder</li>
                          <li>Möjlighet att navigera med tangentbord</li>
                        </ul>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-3">
                      <AccordionTrigger>Feedback</AccordionTrigger>
                      <AccordionContent>
                        <p className="mb-4">
                          Vi välkomnar feedback om tillgängligheten på vår webbplats. Om du stöter
                          på problem eller har förslag på förbättringar, vänligen kontakta oss.
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicyPage;
