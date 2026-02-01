
import { GoogleGenAI, Type } from "@google/genai";
import { PotentialLead, Scripts, VoiceCommandResult, ProspectType, Lead, AISuggestions, AdditionalDataSuggestions, LeadAnalysis } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const prospectSearchResponseSchema = {
    type: Type.OBJECT,
    properties: {
        total_encontrado: { type: Type.INTEGER, description: "Número total estimado de empresas únicas encontradas para os critérios, antes da paginação." },
        prospects: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    nome: { type: Type.STRING, description: "Nome da empresa" },
                    segmento: { type: Type.STRING, description: "Segmento de atuação da empresa" },
                    telefone: { type: Type.STRING, description: "Telefone comercial público da empresa" },
                    site: { type: Type.STRING, description: "Website oficial da empresa" },
                    instagram: { type: Type.STRING, description: "Perfil público do Instagram da empresa" },
                    produtos_que_usa: { type: Type.STRING, description: "Tipos de etiquetas ou rótulos que a empresa provavelmente utiliza. Ex: 'Etiquetas térmicas, Rótulos para gôndola'" },
                    substrato_recomendado: { type: Type.STRING, description: "Substratos ideais para os produtos da empresa. Ex: 'Papel térmico, BOPP brilho'" },
                    volume_estimado: { type: Type.STRING, description: "Estimativa de volume de consumo de etiquetas/rótulos (Baixo, Médio, Alto)" },
                    frequencia_compra: { type: Type.STRING, description: "Estimativa de frequência de compra (Baixa, Média, Alta)" }
                },
                required: ["nome", "segmento", "produtos_que_usa", "substrato_recomendado", "volume_estimado", "frequencia_compra"]
            }
        }
    },
    required: ["total_encontrado", "prospects"]
};


export interface ProspectSearchResult {
  prospects: PotentialLead[];
  total: number;
}

export const findProspects = async (
  segment: string,
  city: string,
  state: string,
  page: number,
  radius: string,
  niche: string,
  keywords: string,
  limit: number = 20,
  customSegment?: string 
): Promise<ProspectSearchResult> => {
  try {
    const offset = (page - 1) * limit;
    
    const isCustom = segment === 'Outro' && customSegment && customSegment.trim().length > 0;
    const effectiveSegmentPrompt = isCustom 
        ? `Segmento Personalizado: "${customSegment}" (O usuário definiu este segmento manualmente. Interprete semanticamente este termo para encontrar empresas correlatas).`
        : `Segmento Principal: "${segment}"`;

    const prompt = `
      Você é um assistente de prospecção B2B para a indústria gráfica. Sua tarefa é encontrar empresas reais no Brasil com base em critérios detalhados.
      
      **Critérios de Busca Avançados:**
      - ${effectiveSegmentPrompt}
      - Nicho Específico (dentro do segmento): "${niche || 'Não especificado'}"
      - Localização Base: "${city}, ${state}"
      - Raio de Distância: "${radius}"
      - Palavras-chave Adicionais: "${keywords || 'Nenhuma'}"
      - Página a ser retornada: ${page}
      - Resultados por página: ${limit}

      **Processo de Busca Detalhado:**
      1.  **Interprete os Filtros:** Combine todos os critérios. O 'Raio de Distância' define a área geográfica a partir da 'Localização Base'. O 'Nicho' e as 'Palavras-chave' refinam a busca dentro do 'Segmento'.
          ${isCustom ? "Como o segmento é personalizado, analise o texto fornecido pelo usuário, identifique sinônimos, categorias equivalentes e termos técnicos para realizar a busca de forma ampla e assertiva." : ""}
      2.  **Gere Variações de Busca:** Crie e use múltiplas variações de termos de busca. Combine segmento, nicho, palavras-chave e localização. Por exemplo:
          - "indústria de ${niche} em ${city}"
          - "${keywords} perto de ${city}, ${state}"
          - "${isCustom ? customSegment : segment} ${niche} em ${state}"
      3.  **Execute a Busca:** Use as variações para pesquisar em fontes públicas como Google Search e Google Maps, respeitando o raio geográfico.
      4.  **Compile e Deduplique:** Combine os resultados e remova duplicatas.
      5.  **Pagine os Resultados:** Da lista final, retorne as empresas da posição ${offset + 1} até ${offset + limit}.
      6.  **Estime o Total:** Forneça uma estimativa do número total de empresas únicas encontradas na sua busca completa ('total_encontrado').

      **Análise para Vendedor de Gráfica:**
      Para cada empresa na página atual, forneça uma análise detalhada, incluindo contatos públicos, produtos que provavelmente usa (rótulos, etiquetas), substrato recomendado (BOPP, térmico), e estimativas de volume e frequência.

      **Regras Críticas:**
      - **NÃO INVENTE DADOS.** Apenas empresas reais e informações públicas. Se algo não for encontrado, retorne null.
      - Foco em contatos comerciais. NUNCA retorne dados privados.
    `;

    /**
     * Using gemini-3-flash-preview for general search and basic text tasks.
     */
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: prospectSearchResponseSchema,
      }
    });
    
    const jsonText = response.text || "{}";
    const result = JSON.parse(jsonText);
    
    return {
      prospects: result.prospects.map((p: any) => ({ ...p, cidade: city, estado: state })) || [],
      total: result.total_encontrado || 0,
    };

  } catch (error) {
    console.error("Error finding prospects:", error);
    throw new Error("Falha ao buscar prospects. Verifique o console para mais detalhes.");
  }
};

const scriptsSchema = {
    type: Type.OBJECT,
    properties: {
        whatsapp: { type: Type.STRING, description: "Mensagem curta e objetiva para WhatsApp." },
        phone: { type: Type.STRING, description: "Pitch de 20 segundos para ligação fria." },
        email: { type: Type.STRING, description: "E-mail de apresentação profissional e direto." },
    },
    required: ["whatsapp", "phone", "email"]
};

export const generateScripts = async (lead: PotentialLead): Promise<Scripts> => {
    try {
        const prompt = `
            Você é um especialista em vendas para a indústria gráfica.
            Crie scripts de abordagem para a empresa "${lead.nome}", que atua no segmento de "${lead.segmento}".
            Esta empresa provavelmente utiliza: "${lead.produtos_que_usa}" com substratos como "${lead.substrato_recomendado}".
            
            Gere os seguintes scripts:
            1.  **WhatsApp:** Uma mensagem curta, amigável e direta, focando em uma dor ou necessidade do segmento.
            2.  **Ligação:** Um pitch de 20 segundos para capturar a atenção e agendar uma conversa.
            3.  **E-mail:** Um e-mail de apresentação profissional, destacando como sua gráfica pode ajudar especificamente essa empresa.
        `;

        /**
         * Using gemini-3-flash-preview for sales script generation.
         */
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                responseMimeType: "application/json",
                responseSchema: scriptsSchema
            }
        });

        const jsonText = response.text || "{}";
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error generating scripts:", error);
        throw new Error("Falha ao gerar scripts. Verifique o console para mais detalhes.");
    }
};

const leadAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        technical: {
            type: Type.OBJECT,
            properties: {
                probable_materials: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Lista técnica de 3-4 materiais prováveis (Ex: BOPP Perolado, Couché Adesivo 150g, Térmico Top)." },
                usage_evidence: { type: Type.STRING, description: "Explicação técnica do porquê este segmento usa estes materiais (Ex: Necessidade de resistência à umidade em câmara fria)." },
                potential_risks: { type: Type.ARRAY, items: { type: Type.STRING }, description: "2 riscos técnicos ou comerciais ao abordar este cliente (Ex: Concorrência predatória, alta exigência de homologação)." }
            },
            required: ["probable_materials", "usage_evidence", "potential_risks"]
        },
        commercial: {
            type: Type.OBJECT,
            properties: {
                opportunity_summary: { type: Type.STRING, description: "Resumo executivo da oportunidade comercial em 1 frase impactante." },
                key_benefits: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3 argumentos de venda irrefutáveis para este perfil." }
            },
            required: ["opportunity_summary", "key_benefits"]
        },
        scripts: {
            type: Type.OBJECT,
            properties: {
                whatsapp: { type: Type.STRING, description: "Abordagem moderna e não intrusiva para WhatsApp, focada em marcar reunião." },
                phone_pitch: { type: Type.STRING, description: "Script de Cold Call (Spin Selling) de 30s." },
                email_template: { type: Type.STRING, description: "E-mail frio B2B formal e persuasivo." },
                objections_handling: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            objection: { type: Type.STRING, description: "A objeção provável" },
                            response: { type: Type.STRING, description: "A resposta matadora" }
                        }
                    },
                    description: "3 objeções mais comuns deste nicho e como contornar."
                }
            },
            required: ["whatsapp", "phone_pitch", "email_template", "objections_handling"]
        },
        connections: {
            type: Type.OBJECT,
            properties: {
                linkedin_company_url: { type: Type.STRING, description: "URL provável do LinkedIn da empresa." },
                potential_decisors: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING, description: "Exemplo de nome ou iniciais (ex: 'João S.')" },
                            role: { type: Type.STRING, description: "Cargo estratégico (Compras, Produção, etc)." },
                            linkedin_url: { type: Type.STRING, description: "URL de busca no LinkedIn para este cargo nesta empresa." }
                        },
                        required: ["name", "role", "linkedin_url"]
                    }
                },
                influence_map: { type: Type.STRING, description: "Recomendação tática de abordagem por cargo." }
            },
            required: ["linkedin_company_url", "potential_decisors", "influence_map"]
        }
    },
    required: ["technical", "commercial", "scripts", "connections"]
};

export const generateLeadAnalysis = async (lead: PotentialLead): Promise<LeadAnalysis> => {
    try {
        const prompt = `
            Atue como um Engenheiro de Vendas Sênior especializado em Embalagens, Rótulos e Etiquetas Adesivas (Indústria Gráfica).
            
            Realize uma análise profunda do prospect:
            - Empresa: "${lead.nome}"
            - Segmento: "${lead.segmento}"
            - Local: "${lead.cidade}, ${lead.estado}"
            - Produtos prováveis: "${lead.produtos_que_usa}"
            - Substrato sugerido: "${lead.substrato_recomendado}"

            Seu objetivo é munir o vendedor com inteligência técnica e comercial para fechar a conta.
            
            **Requisitos da Análise:**
            1. **Diagnóstico Técnico:** Identifique os materiais exatos (especificações de papel/filme e adesivo) que este segmento OBRIGATORIAMENTE usa.
            2. **Oportunidade Comercial:** Qual a "dor" deste segmento? Por que eles trocariam de fornecedor?
            3. **Scripts de Alta Conversão:** Crie abordagens focadas em gatilhos mentais.
            4. **Conexões Comerciais:** Identifique 3 perfis de cargos decisores típicos para este segmento (ex: Gerente de Compras, Engenheiro de Embalagens, Diretor de Produção). Gere URLs de busca profunda no LinkedIn que facilitem ao usuário encontrar essas pessoas reais. Forneça também a URL provável da empresa no LinkedIn.

            Use linguagem técnica correta (ex: "BOPP", "Hotmelt", "Acrílico", "Frontal", "Liner").
        `;

        /**
         * Using gemini-3-pro-preview for complex engineering and reasoning tasks.
         */
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                responseMimeType: "application/json",
                responseSchema: leadAnalysisSchema
            }
        });

        const jsonText = response.text || "{}";
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error generating lead analysis:", error);
        throw new Error("Falha ao gerar análise do lead.");
    }
};

const voiceCommandSchema = {
    type: Type.OBJECT,
    properties: {
        prospectType: { type: Type.STRING, enum: [ProspectType.COMMERCIAL, ProspectType.INDUSTRIAL], description: "O tipo de prospecção: 'comercial' ou 'industrial'." },
        segment: { type: Type.STRING, description: "O segmento de negócio específico. Ex: 'Química', 'Padaria', 'Loja de cosméticos'." },
        city: { type: Type.STRING, description: "A cidade para a busca." },
        state: { type: Type.STRING, description: "A sigla do estado com 2 letras. Ex: 'SP', 'MG', 'PR'." },
    },
    required: ["prospectType", "segment", "city", "state"],
};

export const interpretVoiceCommand = async (text: string): Promise<VoiceCommandResult> => {
    try {
        const prompt = `
            Você é um assistente de IA para o sistema Leads Label. Sua tarefa é interpretar um comando de voz do usuário e extrair os parâmetros para uma busca de prospecção.
            
            Comando de voz do usuário: "${text}"

            Analise o comando e extraia as seguintes informações:
            1.  **prospectType**: Identifique se a busca é para 'comercial' ou 'industrial'.
            2.  **segment**: O segmento de negócio específico.
            3.  **city**: A cidade para a busca.
            4.  **state**: O estado (sigla com 2 letras).

            Seja preciso. Preencha todos os campos obrigatórios do schema.
        `;

        /**
         * Using gemini-3-flash-preview for voice command interpretation.
         */
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                responseMimeType: "application/json",
                responseSchema: voiceCommandSchema,
            }
        });
        
        const jsonText = response.text || "{}";
        return JSON.parse(jsonText);

    } catch (error) {
        console.error("Error interpreting voice command:", error);
        throw new Error("Falha ao interpretar o comando de voz.");
    }
};

const nichesSchema = {
    type: Type.OBJECT,
    properties: {
        niches: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Uma lista de 5 a 8 nichos específicos dentro do segmento principal."
        }
    },
    required: ["niches"]
};

export const getNichesForSegment = async (segment: string, customSegment?: string): Promise<string[]> => {
    try {
        const targetSubject = (segment === 'Outro' && customSegment && customSegment.trim().length > 0) 
            ? customSegment 
            : segment;

        if (segment === 'Outro' && (!customSegment || customSegment.trim().length === 0)) {
            return [];
        }

        const prompt = `
            Para o segmento de negócio "${targetSubject}", gere uma lista de 5 a 8 nichos de mercado mais específicos.
        `;

        /**
         * Using gemini-3-flash-preview for list generation.
         */
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                responseMimeType: "application/json",
                responseSchema: nichesSchema
            }
        });
        const jsonText = response.text || "{}";
        const result = JSON.parse(jsonText);
        return result.niches || [];
    } catch (error) {
        console.error("Error fetching niches for segment:", error);
        return [];
    }
};

const suggestionsSchema = {
    type: Type.OBJECT,
    properties: {
        nextAction: { type: Type.STRING, description: "Sugestão da próxima ação ideal para este lead." },
        whatsappMessage: { type: Type.STRING, description: "Sugestão de mensagem curta e personalizada para enviar via WhatsApp." },
        alert: { type: Type.STRING, description: "Um alerta se a última interação for antiga (mais de 15 dias), ou null se não houver alerta." },
        approachTitle: { type: Type.STRING, description: "Sugestão de título de abordagem personalizado." },
        lowDataTips: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Dicas práticas para encontrar contatos alternativos." }
    },
    required: ["nextAction", "whatsappMessage", "approachTitle"]
};

export const generateLeadSuggestions = async (lead: Lead): Promise<AISuggestions> => {
    try {
        const lastInteractionDate = new Date(lead.ultima_interacao);
        const daysSinceLastInteraction = (new Date().getTime() - lastInteractionDate.getTime()) / (1000 * 3600 * 24);

        const prompt = `
            Você é um assistente de vendas de uma gráfica especializada em rótulos e etiquetas. Analise o lead e forneça sugestões inteligentes:
            - Empresa: ${lead.nome}
            - Segmento: ${lead.segmento}
            - Dias desde a última interação: ${Math.round(daysSinceLastInteraction)}
            - Presença Digital: ${lead.presenca_digital || 'Não informada'}
        `;

        /**
         * Using gemini-3-flash-preview for sales suggestions.
         */
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                responseMimeType: "application/json",
                responseSchema: suggestionsSchema,
            }
        });
        const jsonText = response.text || "{}";
        return JSON.parse(jsonText);

    } catch (error) {
        console.error("Error generating lead suggestions:", error);
        throw new Error("Falha ao gerar sugestões da IA.");
    }
};

const additionalDataSchema = {
    type: Type.OBJECT,
    properties: {
        suggestedPhone: { type: Type.STRING, description: "Um telefone comercial provável." },
        nameVariations: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Variações do nome da empresa." },
        alternativeAddress: { type: Type.STRING, description: "Um endereço alternativo." },
        googleMapsSearch: { type: Type.STRING, description: "Um link de busca direta no Google Maps." },
        associationSuggestion: { type: Type.STRING, description: "Sugestão de sindicato ou associação do setor." },
        suggestedSearchTerms: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Termos de pesquisa avançados para o Google." }
    },
    required: ["nameVariations", "googleMapsSearch", "suggestedSearchTerms"]
};

export const findAdditionalData = async (lead: Lead): Promise<AdditionalDataSuggestions> => {
    try {
        const prompt = `
          Aja como um detetive de dados B2B para a empresa "${lead.nome}" em "${lead.cidade}, ${lead.estado}".
        `;

        /**
         * Using gemini-3-flash-preview for data enrichment tasks.
         */
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                responseMimeType: "application/json",
                responseSchema: additionalDataSchema,
            }
        });
        const jsonText = response.text || "{}";
        return JSON.parse(jsonText);

    } catch (error) {
        console.error("Error finding additional data:", error);
        throw new Error("Falha ao buscar dados adicionais.");
    }
}
