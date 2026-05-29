async function debugFastFlux() {
    const url = "https://fastflux.xyz/api/v1/index.php?route=movies/1439177/player&api_key=ff_1f4efbe6a4c5bc1a5899ed206a1cff9b18f91bb0481de2342e183072ec98aefc";
    const res = await fetch(url);
    const text = await res.text();
    // Look for all script tags and log them
    const scriptMatches = text.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi);
    for (const match of scriptMatches) {
        if (match[1].includes("source") || match[1].includes("video") || match[1].includes("http")) {
            console.log("Script content found:", match[1].substring(0, 300));
        }
    }
}
debugFastFlux();
