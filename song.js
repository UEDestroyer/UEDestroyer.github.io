async function searchMP3(songTitle) {
  const searchUrl = `https://duckduckgo.com/html/?q=${encodeURIComponent(songTitle + " mp3 download")}`;

  try {
    const response = await fetch(searchUrl);
    const html = await response.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const firstLink = doc.querySelector(".result__url"); // Ищем первую ссылку

    return firstLink ? firstLink.textContent.trim() : "MP3 файл не найден.";
  } catch (error) {
    console.error("Ошибка:", error);
    return null;
  }
}