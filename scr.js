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

let audios = [];
let currentIndex = 0;
let username = "";
let playlists = {};
let currentPlaylist = "Main";

const API_KEY = "$2a$10$0GmpdTEqd2ZaL6MGAdaZluaqaGoVgHAiKixWXMAig0J6pQXHSIdVa";
const BIN_ID = "67d9a2bfce7767792747b9c9";

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

// Устанавливаем ник пользователя и загружаем плейлисты
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
function addTrack() {
    let inp = document.getElementById("fInp");
    if (inp.value) {
        let newAudio = new Audio(inp.value);
        newAudio.addEventListener("ended", playNext);
        audios.push(newAudio);
        savePlaylist();
        console.log("Добавлено:", inp.value);
        inp.value = "";
    } else {
        console.warn("Введите ссылку на MP3!");
    }
}

// Удаление трека по индексу (начиная с 1)
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

// Сохранение всех плейлистов пользователя
async function saveAllPlaylists() {
    if (!username) {
        console.warn("Сначала введите ник!");
        return;
    }

    let allPlaylists = await loadAllPlaylists();
    
    if (!allPlaylists || typeof allPlaylists !== "object") {
        allPlaylists = {}; // Создаем новый объект, если данные отсутствуют или повреждены
    }

    allPlaylists[username] = playlists; // Обновляем только данные текущего пользователя

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

// Загрузка всех плейлистов пользователя
async function loadUserPlaylists() {
    let allPlaylists = await loadAllPlaylists();
    playlists = allPlaylists[username] || { Main: [] };
    updatePlaylistSelect();
    changePlaylist();
}

// Загрузка всех плейлистов с сервера
async function loadAllPlaylists() {
    return fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
        headers: { "X-Master-Key": API_KEY }
    })
    .then(res => res.json())
    .then(data => data.record || {})
    .catch(() => ({}));
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