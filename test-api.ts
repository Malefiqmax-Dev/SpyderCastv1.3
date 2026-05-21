import { discoverByGenre } from "./lib/tmdb";

async function testDiscovery() {
  try {
    console.log("Testing API discovery for genre 28 (Action)...");
    const result = await discoverByGenre("movie", 28, 1);
    console.log("Result:", JSON.stringify(result, null, 2));
  } catch (err) {
    console.error("Error:", err);
  }
}

testDiscovery();
