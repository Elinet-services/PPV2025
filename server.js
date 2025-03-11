const express = require("express");
const { exec } = require("child_process");

const app = express();
const PORT = 3001; // Použij jiný port než React

app.get("/update-racelist", (req, res) => {
  console.log("🔄 Spouštím fetchRacers.js...");

  exec("node fetchRacers.js", (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ Chyba spuštění skriptu: ${error.message}`);
      return res.status(500).json({ success: false, message: "Chyba při aktualizaci." });
    }
    console.log(`✅ Výstup fetchRacers.js: ${stdout}`);
    res.json({ success: true, message: "Data úspěšně aktualizována." });
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server běží na http://localhost:${PORT}`);
});
