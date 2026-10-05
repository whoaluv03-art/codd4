const container = document.getElementById("cards");
const loader = document.getElementById("loader");
const errorBox = document.getElementById("error");
const emptyBox = document.getElementById("empty");
const retryButton = document.getElementById("retry");

function showState(state) {
    loader.hidden = state !== "loading";
    errorBox.hidden = state !== "error";
    emptyBox.hidden = state !== "empty";
    container.hidden = state !== "data";
}

function formatDuration(minutes) {
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    return hours + " ч " + rest + " мин";
}

function createCard(film) {
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
        <h3 class="card__title">${film.title}</h3>
        <p class="card__original">${film.titleEn}</p>
        <p class="card__meta">${film.genre}, ${film.year}</p>
        <p class="card__director">Режиссёр: ${film.director}</p>
        <p class="card__duration">${formatDuration(film.duration)}</p>
        <span class="badge ${film.released ? "badge--released" : "badge--soon"}">
            ${film.released ? "В прокате" : "Скоро"}
        </span>
    `;
    return card;
}

function render(films) {
    container.innerHTML = "";
    films.forEach(function (film) {
        container.appendChild(createCard(film));
    });
}

async function load() {
    showState("loading");
    try {
        const response = await fetch("/api/items");
        if (!response.ok) {
            throw new Error("Сервер ответил: " + response.status);
        }

        const data = await response.json();
        if (data.length === 0) {
            showState("empty");
            return;
        }

        render(data);
        showState("data");

    } catch (error) {
        showState("error");
        console.error(error);
    }
}

retryButton.addEventListener("click", load);
load();
