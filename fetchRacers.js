const fs = require("fs");
const fetch = require("node-fetch");

const API_URL = "https://script.google.com/macros/s/AKfycby7ANAR0E0geFDUp-Zi086Ie8KjFz7X5vcj1sQ4yIMg9yUDOPdd0LbyQYLqOs44aZxF/exec?action=racerlist&domain=ppvcup2024";
const FILE_PATH = "./public/racerlist.json"; // Uloží data jako statický soubor

const fetchRacers = async () => {
  try {
    console.log("📡 Stahuji data ze vzdáleného API...");
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

    const data = await response.json();
    if (data.isError) throw new Error("Chyba při získávání dat.");

    const parsedData = JSON.parse(data.responseData);

    console.log("💾 Ukládám data do racerlist.json...");
    fs.writeFileSync(FILE_PATH, JSON.stringify(parsedData, null, 2));

    console.log("✅ Data byla úspěšně aktualizována!");
  } catch (error) {
    console.error("❌ Chyba při aktualizaci racerlist.json:", error);
  }
};

// Spustí se každých 10 minut
setInterval(fetchRacers, 10 * 60 * 1000);

// První spuštění ihned
fetchRacers();
