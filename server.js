const express = require("express");
const { google } = require("googleapis");
const fileUpload = require("express-fileupload");
const app = express();
const port = 3000;
const Excel = require("excel4node");
const path = require("path");
const fs = require("fs"); // Module fs pour la gestion des fichiers

app.use(express.static("public"));
app.use(fileUpload());

// Remplacez ces valeurs par les vôtres (clé d'API YouTube).
const API_KEY = "AIzaSyAIpqfj4v06eFRKFFord6lqf3rodCuT3k0";

app.get("/getComments", async (req, res) => {
  const videoUrl = req.query.url;
  const videoId = getVideoId(videoUrl);
  const comments = [];

  // Utilisez une fonction récursive pour paginer les commentaires
  const fetchComments = async (pageToken) => {
    const youtube = google.youtube("v3");
    const params = {
      key: API_KEY,
      part: "snippet",
      videoId: videoId,
      textFormat: "plainText",
      maxResults: 100, // Nombre maximum de commentaires à récupérer par page
      pageToken, // Utilisez le jeton de page pour récupérer la page suivante
    };

    try {
      const response = await youtube.commentThreads.list(params);
      comments.push(...response.data.items);

      // Si une page suivante est disponible, paginez
      if (response.data.nextPageToken) {
        await fetchComments(response.data.nextPageToken);
      } else {
        // Tous les commentaires ont été récupérés, générez le fichier Excel
        const wb = new Excel.Workbook();
        const ws = wb.addWorksheet("Comments");

        const headers = ["Author", "Comment"];
        ws.cell(1, 1).string(headers[0]);
        ws.cell(1, 2).string(headers[1]);

        comments.forEach((comment, index) => {
          const snippet = comment.snippet.topLevelComment.snippet;
          ws.cell(index + 2, 1).string(snippet.authorDisplayName);
          ws.cell(index + 2, 2).string(snippet.textDisplay);
        });

        // Enregistrez le fichier Excel dans le répertoire public
        const publicPath = path.join(__dirname, "public/youtube_comments.xlsx");
        wb.write(publicPath, (err, stats) => {
          if (err) {
            console.error(err);
          } else {
            console.log(
              'Les commentaires ont été exportés dans "youtube_comments.xlsx"'
            );
            res.json({ downloadLink: "/download" });
          }
        });
      }
    } catch (error) {
      console.error("Une erreur s'est produite :", error);
      res.status(500).json({
        error:
          "Une erreur s'est dproduite lors de la récupération des commentaires.",
      });
    }
  };

  // Commencez la récupération des commentaires en appelant la fonction
  fetchComments();
});

app.get("/download", (req, res) => {
  const publicPath = path.join(__dirname, "public/youtube_comments.xlsx");

  // Configurez les en-têtes pour forcer le téléchargement du fichier
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=youtube_comments.xlsx"
  );

  // Utilisez un flux pour envoyer le fichier au client
  const fileStream = fs.createReadStream(publicPath);
  fileStream.pipe(res);
});

function getVideoId(url) {
  const videoIdMatch = url.match(/[?&]v=([^&]+)/);
  if (videoIdMatch) {
    return videoIdMatch[1];
  }
  return null;
}

app.listen(port, () => {
  console.log(`Serveur en cours d'exécution sur le port ${port}`);
});
