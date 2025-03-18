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

// Сохранение плейлиста на сервер
function savePlaylist() {
    if (!username) {
        console.warn("Сначала введите ник!");
        return;
    }
    let playlist = audios.map(audio => audio.src);
    fetch("http://localhost:3000/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, playlist })
    })
    .then(res => res.json())
    .then(data => console.log("Сохранено:", data))
    .catch(err => console.error("Ошибка сохранения:", err));
}

// Загрузка плейлиста с сервера
function loadPlaylist() {
    if (!username) return;
    fetch(`http://localhost:3000/load?username=${username}`)
        .then(res => res.json())
        .then(data => {
            audios = [];
            if (data.playlist) {
                data.playlist.forEach(url => {
                    let newAudio = new Audio(url);
                    newAudio.addEventListener("ended", playNext);
                    audios.push(newAudio);
                });
                console.log("Плейлист загружен:", data.playlist);
            }
        })
        .catch(err => console.error("Ошибка загрузки:", err));
}