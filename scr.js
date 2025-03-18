window.onload = function () {
    let elements = document.getElementsByTagName("my-elem");
    Array.from(elements).forEach(b => connectedCallback(b));

    loadPlaylist(); // Загружаем плейлист
};

// Найдем элементы
const obj = document.getElementById("asd");
const inp = document.getElementById("fInp");
const button = document.getElementById("addBut");
const delbut = document.getElementById("delBut");

let audios = [];
let currentIndex = 0;

// Функция инициализации кастомных элементов
function connectedCallback(a) {
    let inputId = a.getAttribute("iID") || "";
    let inputType = a.getAttribute("type") || "text";
    let command = a.getAttribute("command") || "";
    let buttonId = a.getAttribute("bId") || "";

    a.innerHTML = `
        <input id="${inputId}" type="${inputType}">
        <button id="${buttonId}">${a.innerText}</button>
    `;

    let buttonElem = document.getElementById(buttonId);
    if (buttonElem) {
        buttonElem.addEventListener("click", function () {
            try {
                eval(command);
            } catch (e) {
                console.error("Ошибка выполнения команды:", e);
            }
        });
    }
}

// Обновление кастомных элементов после загрузки
let elements = document.getElementsByTagName("my-elem");
Array.from(elements).forEach(b => connectedCallback(b));

// Добавление трека
function addbut() {
    let inp = document.getElementById("fInp");
    if (!inp) {
        console.error("Элемент с id='fInp' не найден!");
        return;
    }
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
        audios[currentIndex].play()
            .then(() => console.log("Воспроизведение начато:", audios[currentIndex].src))
            .catch(err => console.error("Ошибка воспроизведения:", err));
    } else {
        console.warn("Нет аудиофайлов!");
    }
}

// Продолжить воспроизведение текущего трека
function continMus() {
    if (audios.length > 0) {
        audios[currentIndex].play()
            .then(() => console.log("Воспроизведение начато:", audios[currentIndex].src))
            .catch(err => console.error("Ошибка воспроизведения:", err));
    }
}

// Воспроизведение следующего трека
function playNext() {
    pauseMusic();
    if (currentIndex + 1 < audios.length) {
        currentIndex++;
    } else {
        currentIndex = 0; // Зацикливаем плейлист
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
function savePlaylist() {
    let playlist = audios.map(audio => audio.src);
    localStorage.setItem("playlist", JSON.stringify(playlist));
}

// Загрузка плейлиста
function loadPlaylist() {
    let savedPlaylist = localStorage.getItem("playlist");
    if (savedPlaylist) {
        let urls = JSON.parse(savedPlaylist);
        urls.forEach(url => {
            let newAudio = new Audio(url);
            newAudio.addEventListener("ended", playNext);
            audios.push(newAudio);
        });
        console.log("Плейлист загружен:", urls);
    }
}

// Удаление трека по индексу
function removeTrack() {
    let a = document.getElementById("idInp");
    let index = parseInt(a.value, 10) - 1;

    if (!isNaN(index) && index >= 0 && index < audios.length) {
        console.log("Удаляем:", audios[index].src);
        audios.splice(index, 1);
        savePlaylist();
    } else {
        console.warn("Некорректный индекс!");
    }
}

// Скачивание плейлиста в файл
function downloadPlaylist() {
    let text = audios.map(audio => audio.src).join("\n");
    let blob = new Blob([text], { type: "text/plain" });
    let a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "playlist.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// Добавление кнопки скачивания плейлиста
document.body.insertAdjacentHTML("beforeend", `<button onclick="downloadPlaylist()">Скачать плейлист</button>`);

// Логгер для вывода в HTML
(function () {
    let logContainer = document.createElement("pre");
    document.body.appendChild(logContainer);

    let oldLog = console.log;
    let oldError = console.error;

    console.log = function (...args) {
        oldLog.apply(console, args);
        logContainer.innerHTML += args.map(a => JSON.stringify(a, null, 2)).join(" ") + "\n";
    };

    console.error = function (...args) {
        oldError.apply(console, args);
        logContainer.innerHTML += "[Ошибка] " + args.map(a => JSON.stringify(a, null, 2)).join(" ") + "\n";
    };
})();