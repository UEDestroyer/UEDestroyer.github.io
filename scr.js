let audios = [];
let currentIndex = 0;
let username = "";

// Устанавливаем ник пользователя
function setUsername() {
    username = document.getElementById("username").value.trim();
    if (username) {
        loadPlaylist();
    } else {
        console.warn("Введите ник!");
    }
}

// Добавление трека
function addTrack() {
    let inp = document.getElementById("trackInput");
    if (inp.value) {
        let newAudio = new Audio(inp.value);
        newAudio.addEventListener("ended", playNext);
        audios.push(newAudio);
        savePlaylist();
        console.log("Добавлено:", inp.value);
    } else {
        console.warn("Введите ссылку на MP3!");
    }
}

// Воспроизведение музыки
function playMusic() {
    if (audios.length > 0) {
        currentIndex = 0;
        audios[currentIndex].play();
    } else {
        console.warn("Нет аудиофайлов!");
    }
}

// Следующий трек
function playNext() {
    pauseMusic();
    if (currentIndex + 1 < audios.length) {
        currentIndex++;
    } else {
        currentIndex = 0;
    }
    audios[currentIndex].play();
}

// Пауза
function pauseMusic() {
    if (audios.length > 0) {
        audios[currentIndex].pause();
    }
}

const API_KEY = "$2a$10$0GmpdTEqd2ZaL6MGAdaZluaqaGoVgHAiKixWXMAig0J6pQXHSIdVa";
const BIN_ID = "67d9a2bfce7767792747b9c9";

async function savePlaylist() {
    fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "X-Master-Key": API_KEY
        },
        body: JSON.stringify({ tracks: audios.map(a => a.src) })
    })
    .then(res => res.json())
    .then(data => console.log("Сохранено:", data))
    .catch(err => console.error("Ошибка сохранения:", err));
}

async function loadPlaylist() {
    fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
        headers: { "X-Master-Key": API_KEY }
    })
    .then(res => res.json())
    .then(data => {
        audios = data.record.tracks.map(url => new Audio(url));
        console.log("Плейлист загружен:", audios);
    })
    .catch(err => console.error("Ошибка загрузки:", err));
}
