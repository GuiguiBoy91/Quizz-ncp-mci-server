const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "data/images/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

const app = express();
const PORT = 8080;

function getMaxId(data) {
  let maxId = 0;
  data.forEach((item) => {
    if (item.id > maxId) {
      maxId = item.id;
    }
  });
  return maxId;
}

// Middleware pour autoriser les requêtes CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// Middleware pour analyser le corps des requêtes en JSON
app.use(express.json());
app.use("/data/images", express.static("data/images"));

app.post("/answers", (req, res) => {
  // Données JSON envoyées dans le corps de la requête
  const jsonData = req.body;

  // Lecture du contenu actuel du fichier
  fs.readFile("./data/answers.json", (err, data) => {
    if (err) {
      console.error("Erreur lors de la lecture du fichier :", err);
      res.status(500).json({
        error: "Une erreur est survenue lors de la lecture du fichier.",
      });
    } else {
      let existingData = [];
      if (data.length > 0) {
        existingData = JSON.parse(data);
      }

      // Obtenez l'ID le plus élevé et ajoutez 1 pour obtenir le nouvel ID
      const newId = getMaxId(existingData) + 1;

      // Ajoutez l'ID à la nouvelle question
      jsonData.id = newId;

      const combinedData = [...existingData, jsonData];

      const jsonString = JSON.stringify(combinedData);

      fs.writeFile("./data/answers.json", jsonString, (err) => {
        if (err) {
          console.error("Erreur lors de l'écriture dans le fichier :", err);
          res.status(500).json({
            error:
              "Une erreur est survenue lors de l'écriture dans le fichier.",
          });
        } else {
          console.log("Données JSON écrites dans le fichier avec succès.");
          res.json({
            id: newId,
            message: "Données JSON écrites dans le fichier avec succès.",
          });
        }
      });
    }
  });
});

app.get("/answers", (req, res) => {
  fs.readFile("./data/answers.json", (err, data) => {
    if (err) {
      console.error("Erreur lors de la lecture du fichier :", err);
      res.status(500).json({
        error: "Une erreur est survenue lors de la lecture du fichier.",
      });
    } else {
      const jsonData = JSON.parse(data);
      res.json(jsonData);
    }
  });
});

app.delete("/answers/:id", (req, res) => {
  const id = parseInt(req.params.id);

  fs.readFile("./data/answers.json", (err, data) => {
    if (err) {
      console.error("Erreur lors de la lecture du fichier :", err);
      res.status(500).json({
        error: "Une erreur est survenue lors de la lecture du fichier.",
      });
    } else {
      let existingData = [];
      if (data.length > 0) {
        existingData = JSON.parse(data);
      }

      const filteredData = existingData.filter((item) => item.id !== id);

      const jsonString = JSON.stringify(filteredData);

      fs.writeFile("./data/answers.json", jsonString, (err) => {
        if (err) {
          console.error("Erreur lors de l'écriture dans le fichier :", err);
          res.status(500).json({
            error:
              "Une erreur est survenue lors de l'écriture dans le fichier.",
          });
        } else {
          console.log("Question supprimée avec succès.");
          res.json({
            message: "Question supprimée avec succès.",
          });
        }
      });
    }
  });
});

app.post("/image", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  // You can send any response to the user here
  res.json({ status: "success", newFileName: req.file.filename });
});

app.delete("/image/:filename", (req, res) => {
  const filename = req.params.filename;
  fs.unlink(`./data/images/${filename}`, (err) => {
    if (err) {
      console.error("Erreur lors de la suppression du fichier :", err);
      res.status(500).json({
        error: "Une erreur est survenue lors de la suppression du fichier.",
      });
    } else {
      console.log("Fichier supprimé avec succès.");
      res.json({
        message: "Fichier supprimé avec succès.",
      });
    }
  });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
