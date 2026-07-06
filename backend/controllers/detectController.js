import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const detectFace = async (req, res) => {
  try {
    const { image_base64 } = req.body;

    if (!image_base64) {
      return res.status(400).json({
        detail: "image_base64 required",
      });
    }

    const base64 = image_base64.replace(/^data:image\/\w+;base64,/, "");

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",

      contents: [
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64,
          },
        },
        {
          text:
            "You are a Rubik's cube color detector. Return ONLY JSON like {\"grid\":[\"W\",\"R\",\"G\",\"Y\",\"O\",\"B\",\"W\",\"R\",\"G\"]}. Use only W,Y,R,O,B,G.",
        },
      ],
    });

    const text = response.text;

    const match = text.match(/\{[\s\S]*\}/);

    if (!match) {
      return res.status(500).json({
        detail: "Gemini returned invalid response",
      });
    }

    const json = JSON.parse(match[0]);

    if (!json.grid || json.grid.length !== 9) {
      return res.status(500).json({
        detail: "Invalid grid returned",
      });
    }

    res.json({
      colors: json.grid,
    });

  } catch (err) {

    res.status(500).json({
      detail: err.message,
    });

  }
};