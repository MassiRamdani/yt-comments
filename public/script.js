document.addEventListener("DOMContentLoaded", () => {
  const commentForm = document.getElementById("commentForm");
  const videoUrlInput = document.getElementById("videoUrl");
  const fetchCommentsButton = document.getElementById("fetchComments");

  // Ajoutez des références au bouton de téléchargement et au lien caché
  const downloadButton = document.getElementById("downloadButton");
  const downloadLink = document.getElementById("downloadLink");

  fetchCommentsButton.addEventListener("click", async () => {
    const videoUrl = videoUrlInput.value;

    // Effectuez une requête pour récupérer les commentaires
    const response = await fetch(`/getComments?url=${videoUrl}`);
    const data = await response.json();

    // Affichez et configurez le bouton de téléchargement et le lien
    downloadButton.style.display = "block";
    downloadLink.href = data.downloadLink; // Lien vers le fichier de téléchargement
    downloadLink.style.display = "none"; // Cachez le lien
    // Ajoutez un gestionnaire de clic pour le bouton de téléchargement
    downloadButton.addEventListener("click", () => {
      downloadLink.click(); // Cliquez sur le lien pour déclencher le téléchargement
    });
  });
});
