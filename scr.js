window.onload = function () {
    let elements = document.getElementsByTagName("my-elem");
    Array.from(elements).forEach(b => connectedCallback(b));

    let storedUser = localStorage.getItem("username");
    if (storedUser) {
        document.getElementById("username").value = storedUser;
        loadPlaylist(storedUser);
    }
};

// Найдем элементы
const inp = document.getElementById("fInp");
const delbut = document.getElementById("delBut");

let audios = [];
let currentIndex = 0;
let username = "";

// Установка имени пользователя
function setUsername() {
    let input = document.getElementById("username").value.trim();
    if (input) {
        username = input;
        localStorage.setItem("username", username);
        loadPlaylist(username);
        console.log("Имя пользователя установлено:", username);
    } else {
        console.warn("Введите корректное имя!");
    }
}

// Функция инициализации кастомных элементов
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

// Добавление трека
function addTrack() {
    let inp = document.getElementById("fInp");
    if (!inp) {
        console.error("Элемент с id='fInp' не найден!");
        return;
    }
    if (inp.value) {
        let newAudio = new Audio(inp.value);
        newAudio.addEventListener("ended", playNext);
        audios.push(newAudio);
        savePlaylist(username);
        console.log("Добавлено:", inp.value);
    } else {
        console.warn("Введите ссылку на MP3!");
    }
}

// Воспроизведение музыки
function playMusic() {
    if (audios.length > 0) {
        currentIndex = 0;
        audios[currentIndex].play()
            .then(() => console.log("Воспроизведение начато:", audios[currentIndex].src))
            .catch(err => console.error("Ошибка воспроизведения:", err));
    } else {
        console.warn("Нет аудиофайлов!");
    }
}

// Продолжить воспроизведение
function continMus() {
    if (audios.length > 0) {
        audios[currentIndex].play()
            .then(() => console.log("Воспроизведение продолжается:", audios[currentIndex].src))
            .catch(err => console.error("Ошибка воспроизведения:", err));
    }
}

// Воспроизведение следующего трека
function playNext() {
    pauseMusic();
    if (currentIndex + 1 < audios.length) {
        currentIndex++;
    } else {
        currentIndex = 0;
    }
    continMus();
}

// Воспроизведение предыдущего трека
function playBef() {
    pauseMusic();
    if (currentIndex > 0) {
        currentIndex--;
    } else {
        currentIndex = audios.length - 1;
    }
    continMus();
}

// Пауза
function pauseMusic() {
    if (audios.length > 0) {
        audios[currentIndex].pause();
        console.log("Музыка на паузе:", audios[currentIndex].src);
    }
}

// Сохранение плейлиста
function savePlaylist(user) {
    let playlist = audios.map(audio => audio.src);
    localStorage.setItem(`playlist_${user}`, JSON.stringify(playlist));
}

// Загрузка плейлиста
function loadPlaylist(user) {
    let savedPlaylist = localStorage.getItem(`playlist_${user}`);
    audios = [];
    if (savedPlaylist) {
        let urls = JSON.parse(savedPlaylist);
        urls.forEach(url => {
            let newAudio = new Audio(url);
            newAudio.addEventListener("ended", playNext);
            audios.push(newAudio);
        });
        console.log("Плейлист загружен для:", user);
    } else {
        console.warn("Нет сохраненного плейлиста для:", user);
    }
}

// Удаление трека по индексу
function removeTrack() {
    let a = document.getElementById("idInp");
    let index = parseInt(a.value, 10) - 1;

    if (!isNaN(index) && index >= 0 && index < audios.length) {
        console.log("Удаляем:", audios[index].src);
        audios.splice(index, 1);
        savePlaylist(username);
    } else {
        console.warn("Некорректный индекс!");
    }
}

// Очистка плейлиста
function clearPlaylist() {
    audios = [];
    localStorage.removeItem(`playlist_${username}`);
    console.log("Плейлист очищен для:", username);
}