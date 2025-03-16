const obj = document.getElementById("asd");
const inp = document.getElementById("fInp");
const button = document.getElementById("addBut");
const delbut=document.getElementById("delBut")

let audios = [];
let currentIndex = 0;

// Загружаем сохраненный плейлист при запуске
window.onload = loadPlaylist;

let elements = document.getElementsByTagName("my-elem");

function connectedCallback(a) {
    a.innerHTML = `<input id="${a.getAttribute("iID")}" type="${a.getAttribute("type")}">
                   <button onclick="${a.getAttribute("command")}" id="${a.getAttribute("bId")}">${a.innerText}</button>`;
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
function playBef(){
    pauseMusic();
    if (currentIndex - 1 >-1) {
        currentIndex--;
        audios[currentIndex].play()
            .then(() => console.log("Пред трек:", audios[currentIndex].src))
            .catch(err => console.error("Ошибка воспроизведения следующего трека:", err));
    } else {
        currentIndex=audios.length-1;
        playNext();
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
    index=a.value-1;
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

// const http = require("http");

// // Создание HTTP-сервера
// const server = http.createServer((req, res) => {
//     if (req.method === "GET" && req.url.startsWith("/process")) {
//         // Разбираем параметры из URL
//         const url = new URL(req.url, `http://${req.headers.host}`);
//         const id = url.searchParams.get("id");

//         if (id) {
//             try {
//                 const result = Number(id + "13") * 5; // Выполняем вычисление
//                 res.writeHead(200, { "Content-Type": "application/json" });
//                 res.end(JSON.stringify({ result })); // Возвращаем результат клиенту
//             } catch (error) {
//                 res.writeHead(400, { "Content-Type": "application/json" });
//                 res.end(JSON.stringify({ error: "Некорректный параметр id. Ожидается число." }));
//             }
//         } else {
//             res.writeHead(400, { "Content-Type": "application/json" });
//             res.end(JSON.stringify({ error: "Параметр id отсутствует в запросе." }));
//         }
//     } else {
//         res.writeHead(404, { "Content-Type": "text/plain" });
//         res.end("Ресурс не найден");
//     }
// });

// // Запуск сервера
// const PORT = 3000;
// server.listen(PORT, () => {
//     console.log(`Сервер запущен на http://localhost:${PORT}`);
// });