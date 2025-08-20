require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

async function getUnsplashImage(destination) {
  try {
    const url = new URL("https://api.unsplash.com/search/photos");
    url.searchParams.append("query", destination);
    url.searchParams.append("per_page", "1");

    const res = await fetch(url, {
      headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` },
    });

    if (!res.ok) throw new Error(`Unsplash API error: ${res.status}`);
    const data = await res.json();
    const result = data.results[0];
    return result ? result.urls.small : null;
  } catch (err) {
    console.error(
      `🔍 Error fetching Unsplash image for "${destination}":`,
      err.message
    );
    return null;
  }
}

async function analyzeImageAndFindDestinations(imageUrl, country) {
  try {
    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) throw new Error(`Image fetch failed: ${imgRes.status}`);
    const imageBuffer = Buffer.from(await imgRes.arrayBuffer());

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Guess the specific place shown in this image. Then, suggest 5 visually and culturally similar travel destinations from ${country}. Format your reply as:
Place in image: <place name>
1. <destination>
2. <destination>
3. <destination>
4. <destination>
5. <destination>`;

    const result = await model.generateContent([
      { text: prompt },
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: imageBuffer.toString("base64"),
        },
      },
    ]);

    const content = result.response.text();
    const lines = content.split("\n").filter(Boolean);
    const placeLine = lines.find((l) =>
      l.toLowerCase().startsWith("place in image")
    );
    const guessedPlace = placeLine ? placeLine.split(":")[1].trim() : "Unknown";

    const destinations = lines
      .filter((l) => /^\d+\.\s/.test(l))
      .map((l) => l.replace(/^\d+\.\s*/, "").trim())
      .slice(0, 5);

    const destinationImages = await Promise.all(
      destinations.map(getUnsplashImage)
    );

    return {
      guessedPlace,
      originalImage: imageUrl,
      country,
      recommendations: destinations.map((dest, i) => ({
        name: dest,
        image: destinationImages[i],
      })),
    };
  } catch (error) {
    console.error("❌ Error:", error.message || error);
    return { error: error.message || "Unknown error" };
  }
}

const aiImageAnalyser = async (req, res) => {
  const { imageUrl, country } = req.body;
  if (!imageUrl || !country) {
    return res.status(400).json({ error: "imageUrl and country are required" });
  }
  const data = await analyzeImageAndFindDestinations(imageUrl, country);
  res.json(data);
};

module.exports = { aiImageAnalyser };
