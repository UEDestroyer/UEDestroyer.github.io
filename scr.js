const obj = document.getElementById("asd");
const inp = document.getElementById("fInp");
let audios = [];
let currentIndex = 0;

// Загружаем сохраненный плейлист при запуске
window.onload = loadPlaylist;

let elements = document.getElementsByTagName("my-elem");

function connectedCallback(a) {
    a.innerHTML = `<input id="${a.getAttribute("s")}">
                   <button onclick="${a.getAttribute("onclick")}">${a.innerText}</button>`;
}

Array.from(elements).forEach(b => {
    connectedCallback(b);
});


function addbut() {
    let inp = document.getElementById("fInp"); // Убедимся, что мы берём актуальный элемент
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

function playNext() {
    pauseMusic();
    if (currentIndex + 1 < audios.length) {
        currentIndex++;
        audios[currentIndex].play()
            .then(() => console.log("Следующий трек:", audios[currentIndex].src))
            .catch(err => console.error("Ошибка воспроизведения следующего трека:", err));
    } else {
        playMusic();
    }
}

function pauseMusic() {
    if (audios.length > 0) {
        audios[currentIndex].pause();
        console.log("Музыка на паузе:", audios[currentIndex].src);
    }
}

// Функция сохранения плейлиста в localStorage и файл
function savePlaylist() {
    let playlist = audios.map(audio => audio.src);
    localStorage.setItem("playlist", JSON.stringify(playlist));
}

// Функция загрузки плейлиста
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
let index;
function removeTrack() {
    let a = document.getElementById("idInp");
    index=a.value;
    if (index >= 0 && index < audios.length) {
        console.log("Удаляем:", audios[index].src);
        audios.splice(index, 1);
        savePlaylist(); // Обновляем плейлист в localStorage
    } else {
        console.warn("Некорректный индекс!");
    }
}

// Функция скачивания плейлиста в .txt файл
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
// Кнопка для скачивания списка
document.body.insertAdjacentHTML("beforeend", `<button onclick="downloadPlaylist()">Скачать плейлист</button>`);
