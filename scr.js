window.onload = function () {
    let elements = document.getElementsByTagName("my-elem");
    Array.from(elements).forEach(b => connectedCallback(b));

    let storedUser = localStorage.getItem("username");
    if (storedUser) {
        document.getElementById("username").value = storedUser;
        loadPlaylist(storedUser);
    }
};

const inp = document.getElementById("fInp");
const delbut = document.getElementById("delBut");
let audios = [];
let currentIndex = 0;
let username = "";
let playlistName = "main";

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

function setUsername() {
    username = document.getElementById("username").value.trim() || "guest";
    playlistName = document.getElementById("playlistName").value.trim() || "main";
    loadPlaylist();
}

function addTrack() {
    let inp = document.getElementById("trackInput");
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
    if (currentIndex + 1 < audios.length) {
        currentIndex++;
    } else {
        currentIndex = 0;
    }
    audios[currentIndex].play();
}

function pauseMusic() {
    if (audios.length > 0) {
        audios[currentIndex].pause();
    }
}

function removeTrack() {
    let index = parseInt(document.getElementById("delBut").value) - 1;
    if (index >= 0 && index < audios.length) {
        audios.splice(index, 1);
        savePlaylist();
        console.log("Удалён трек с индексом:", index);
    } else {
        console.warn("Некорректный индекс трека!");
    }
}

function clearPlaylist() {
    audios = [];
    savePlaylist();
    console.log("Плейлист очищен.");
}

async function savePlaylist() {
    if (!username) return console.warn("Сначала введите ник!");
    let playlists = await loadAllPlaylists();
    if (!playlists[username]) playlists[username] = {};
    playlists[username][playlistName] = audios.map(a => a.src);
    
    fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "X-Master-Key": API_KEY
        },
        body: JSON.stringify(playlists)
    })
    .then(() => console.log("Плейлист сохранен"))
    .catch(err => console.error("Ошибка сохранения:", err));
}

async function loadAllPlaylists() {
    return fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
        headers: { "X-Master-Key": API_KEY }
    })
    .then(res => res.json())
    .then(data => data.record || {})
    .catch(() => ({}));
}

async function loadPlaylist() {
    if (!username) return console.warn("Введите ник!");
    let playlists = await loadAllPlaylists();
    let userPlaylists = playlists[username] || {};
    let tracks = userPlaylists[playlistName] || [];
    
    audios = tracks.map(url => {
        let audio = new Audio(url);
        audio.addEventListener("ended", playNext);
        return audio;
    });
    console.log(`Плейлист '${playlistName}' загружен:`, audios);
}

function resetAllTracks() {
    audios.forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
    });
    currentIndex = 0;
    console.log("Все треки сброшены.");
}
window.onload();
