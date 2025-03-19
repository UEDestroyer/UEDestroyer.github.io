async function searchMP3(songTitle) {
    const searchUrl = `https://duckduckgo.com/html/?q=${encodeURIComponent(songTitle + " mp3 download")}`;

    try {
        const response = await fetch(searchUrl);
        const html = await response.text();

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        const firstLink = doc.querySelector(".result__url"); // Ищем первую ссылку

        return firstLink ? firstLink.textContent.trim() : null;
    } catch (error) {
        console.error("Ошибка поиска MP3:", error);
        return null;
    }
}

let savePlay;
let audios = [];
let currentIndex = 0;
let username = "";
let playlists = {};
let currentPlaylist = "Main";

const API_KEY = "$2a$10$0GmpdTEqd2ZaL6MGAdaZluaqaGoVgHAiKixWXMAig0J6pQXHSIdVa";
const BIN_ID = "67da9c258561e97a50ef14c7";

window.onload = async function () {
    let elements = document.getElementsByTagName("my-elem");
    Array.from(elements).forEach(b => connectedCallback(b));

    let storedUser = localStorage.getItem("username");
    if (storedUser) {
        document.getElementById("username").value = storedUser;
        username = storedUser;
        await loadUserPlaylists();
    }
};

const inp = document.getElementById("fInp");
const delbut = document.getElementById("delBut");
const playlistSelect = document.getElementById("playlistSelect");
const name = document.getElementById("name");
const delname = document.getElementById("delname");

// Функция добавления элемента управления
function connectedCallback(a) {
    let inputId = a.getAttribute("iID") || "";
    let inputType = a.getAttribute("type") || "text";
    let buttonId = a.getAttribute("bId") || "";

    a.innerHTML = `
        <input id="${inputId}" type="${inputType}">
        <button id="${buttonId}">${a.innerText}</button>
    `;

    let buttonElem = document.getElementById(buttonId);
    if (buttonElem) {
        buttonElem.addEventListener("click", function () {
            if (!username) {
                console.warn("Сначала установите имя пользователя!");
                return;
            }
            if (buttonId === "addBut") addTrack();
            if (buttonId === "delBut") removeTrack();
        });
    }
}

// Устанавливаем ник пользователя
async function setUsername() {
    username = document.getElementById("username").value.trim();
    if (username) {
        localStorage.setItem("username", username);
        await loadUserPlaylists();
    } else {
        console.warn("Введите ник!");
    }
}

// Добавление трека
async function addTrack() {
    let inp = document.getElementById("fInp");
    let nameinp = name.value.trim();

    let audioUrl = inp.value.trim(); // Прямая ссылка, если введена
    let ind = audios.length; // Уникальный индекс нового трека

    if (!audioUrl && nameinp) {
        console.log(`Ищем MP3 по названию: ${nameinp}`);
        audioUrl = await searchMP3(nameinp);

        if (!audioUrl) {
            console.warn("MP3 файл не найден!");
            return;
        }
    }

    if (audioUrl) {
        let newAudio = new Audio(audioUrl);
        newAudio.addEventListener("ended", playNext);

        audios[ind] = newAudio;
        savePlaylist();
        console.log("Добавлено:", audioUrl);

        inp.value = ""; // Очищаем поле ввода
    } else {
        console.warn("Введите URL или название песни!");
    }
}

// Удаление трека
function removeTrack() {
    let index = parseInt(document.getElementById("idInp").value, 10) - 1;
    if (isNaN(index) || index < 0 || index >= audios.length) {
        console.warn("Неверный индекс трека!");
        return;
    }
    audios.splice(index, 1);
    savePlaylist();
    console.log("Трек удален, обновленный список:", audios);
}

// Воспроизведение музыки
function playMusic() {
    resetAllTracks();
    if (audios.length > 0) {
        currentIndex = 0;
        audios[currentIndex].play();
    } else {
        console.warn("Нет аудиофайлов!");
    }
}

function playNext() {
    if (audios.length === 0) return;
    currentIndex = (currentIndex + 1) % audios.length;
    audios[currentIndex].play();
}

function pauseMusic() {
    if (audios.length > 0) audios[currentIndex].pause();
}

function continMus() {
    if (audios.length > 0) {
        audios[currentIndex].play().catch(err => console.error("Ошибка воспроизведения:", err));
    }
}

function playBef() {
    pauseMusic();
    currentIndex = currentIndex > 0 ? currentIndex - 1 : audios.length - 1;
    audios[currentIndex].play();
}

// Очистка плейлиста
function clearPlaylist() {
    audios = [];
    savePlaylist();
    console.log("Плейлист очищен.");
}

// Создание нового плейлиста
function createPlaylist() {
    let newPlaylist = prompt("Введите имя нового плейлиста:");
    if (!newPlaylist || playlists[newPlaylist]) return;
    
    playlists[newPlaylist] = [];
    updatePlaylistSelect();
    changePlaylist(newPlaylist);
    saveAllPlaylists();
}

// Удаление текущего плейлиста
function deletePlaylist() {
    if (currentPlaylist === "Main") {
        console.warn("Нельзя удалить основной плейлист!");
        return;
    }

    delete playlists[currentPlaylist];
    currentPlaylist = "Main";
    audios = playlists[currentPlaylist] || [];
    updatePlaylistSelect();
    saveAllPlaylists();
}

// Смена плейлиста
function changePlaylist(newPlaylist = null) {
    currentPlaylist = newPlaylist || playlistSelect.value;
    audios = (playlists[currentPlaylist] || []).map(url => {
        let audio = new Audio(url);
        audio.addEventListener("ended", playNext);
        return audio;
    });

    console.log(`Переключен на плейлист: ${currentPlaylist}`);
}

// Обновление списка плейлистов
function updatePlaylistSelect() {
    playlistSelect.innerHTML = "";
    for (let key in playlists) {
        let option = document.createElement("option");
        option.value = key;
        option.textContent = key;
        playlistSelect.appendChild(option);
    }
    playlistSelect.value = currentPlaylist;
}

// Сохранение всех плейлистов
async function saveAllPlaylists() {
    if (!username) {
        console.warn("Сначала введите ник!");
        return;
    }

    let allPlaylists = await loadAllPlaylists();
    
    if (!allPlaylists || typeof allPlaylists !== "object") {
        allPlaylists = {}; // Создаем новый объект, если данных нет
    }

    allPlaylists[username] = playlists;

    fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "X-Master-Key": API_KEY
        },
        body: JSON.stringify(allPlaylists)
    })
    .then(() => console.log("Все плейлисты сохранены"))
    .catch(err => console.error("Ошибка сохранения:", err));
}

// Сброс всех треков
function resetAllTracks() {
    audios.forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
    });
    currentIndex = 0;
    console.log("Все треки сброшены.");
}

window.onload();