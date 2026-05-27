import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const PROMPTS: Record<string, string> = {
  pt: `Você é um personal trainer e fisiculturista profissional com 20 anos de experiência. Analise as fotos deste físico de forma construtiva e profissional.

Forneça uma análise estruturada com os seguintes tópicos (use os emojis exatamente como indicado):

💪 **Pontos Fortes**
Liste 3-5 grupos musculares bem desenvolvidos ou destaques positivos do físico.

🎯 **Músculos Prioritários para Desenvolver**
Liste 3-5 grupos musculares que precisam de mais atenção, com justificativa breve.

📊 **Estimativa de Composição Corporal**
Estimativa visual de: % de gordura corporal (range aproximado), massa muscular geral (baixa/média/alta), e fase recomendada (bulking/cutting/manutenção).

🏋️ **Grupos Musculares para Focar nos Treinos**
Liste os grupos musculares específicos em ordem de prioridade, com exercícios sugeridos para cada um.

✅ **Recomendações Gerais**
3-5 dicas práticas personalizadas para evoluir mais rapidamente com base no físico analisado.

⚠️ Importante: Esta é uma análise visual estimativa para fins educacionais e motivacionais. Para avaliações precisas, consulte um profissional de educação física ou médico.`,

  en: `You are a professional personal trainer and bodybuilder with 20 years of experience. Analyze these physique photos in a constructive and professional manner.

Provide a structured analysis with the following sections (use the emojis exactly as indicated):

💪 **Strengths**
List 3-5 well-developed muscle groups or positive highlights of this physique.

🎯 **Priority Muscles to Develop**
List 3-5 muscle groups that need more attention, with a brief justification.

📊 **Body Composition Estimate**
Visual estimate of: body fat % (approximate range), overall muscle mass (low/medium/high), and recommended phase (bulking/cutting/maintenance).

🏋️ **Muscle Groups to Focus on in Training**
List the specific muscle groups in priority order, with suggested exercises for each.

✅ **General Recommendations**
3-5 practical personalized tips to progress faster based on the analyzed physique.

⚠️ Important: This is a visual estimative analysis for educational and motivational purposes. For precise assessments, consult a fitness professional or physician.`,

  nl: `U bent een professionele personal trainer en bodybuilder met 20 jaar ervaring. Analyseer deze lichaamsfoto's op een constructieve en professionele manier.

Geef een gestructureerde analyse met de volgende secties (gebruik de emoji's precies zoals aangegeven):

💪 **Sterke Punten**
Noem 3-5 goed ontwikkelde spiergroepen of positieve highlights van dit lichaam.

🎯 **Prioritaire Spieren om te Ontwikkelen**
Noem 3-5 spiergroepen die meer aandacht nodig hebben, met een korte toelichting.

📊 **Schatting Lichaamssamenstelling**
Visuele schatting van: vetpercentage (geschat bereik), algehele spiermassa (laag/gemiddeld/hoog), en aanbevolen fase (bulking/cutting/onderhoud).

🏋️ **Spiergroepen om op te Focussen in Training**
Noem de specifieke spiergroepen in volgorde van prioriteit, met voorgestelde oefeningen voor elk.

✅ **Algemene Aanbevelingen**
3-5 praktische gepersonaliseerde tips om sneller vooruitgang te boeken op basis van het geanalyseerde lichaam.

⚠️ Belangrijk: Dit is een visuele schatting voor educatieve en motiverende doeleinden. Raadpleeg voor nauwkeurige beoordelingen een fitnessprofessional of arts.`,
};

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY not configured" },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { images, language = "pt" } = body as { images: string[]; language: string };

    if (!images || images.length === 0) {
      return NextResponse.json({ error: "No images provided" }, { status: 400 });
    }
    if (images.length > 4) {
      return NextResponse.json({ error: "Max 4 images allowed" }, { status: 400 });
    }

    const prompt = PROMPTS[language] ?? PROMPTS["pt"];

    type AllowedMediaType = "image/jpeg" | "image/png" | "image/gif" | "image/webp";
    const ALLOWED_MEDIA_TYPES: AllowedMediaType[] = ["image/jpeg", "image/png", "image/gif", "image/webp"];

    // Build content array with images + text
    type ImageBlock = { type: "image"; source: { type: "base64"; media_type: AllowedMediaType; data: string } };
    type TextBlock = { type: "text"; text: string };
    type ContentBlock = ImageBlock | TextBlock;

    const content: ContentBlock[] = images.map((img) => {
      const base64Data = img.replace(/^data:image\/[a-z+]+;base64,/, "");
      const mediaTypeMatch = img.match(/^data:(image\/[a-z+]+);base64,/);
      const rawType = mediaTypeMatch ? mediaTypeMatch[1] : "image/jpeg";
      const mediaType: AllowedMediaType = ALLOWED_MEDIA_TYPES.includes(rawType as AllowedMediaType)
        ? (rawType as AllowedMediaType)
        : "image/jpeg";
      return {
        type: "image" as const,
        source: {
          type: "base64" as const,
          media_type: mediaType,
          data: base64Data,
        },
      };
    });

    content.push({ type: "text", text: prompt });

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2000,
      messages: [{ role: "user", content }],
    });

    const analysisText =
      response.content[0].type === "text" ? response.content[0].text : "";

    return NextResponse.json({ analysis: analysisText });
  } catch (err: unknown) {
    console.error("Physique analysis error:", err);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
