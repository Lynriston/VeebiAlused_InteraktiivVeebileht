let currentPokemon = {};
let streak = 0;
let lives = 3;
let pokemonList = [];

async function loadPokemonList() {
    const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=151");
    const data = await res.json();

    pokemonList = data.results.map((p, index) => ({
        name: p.name,
        id: index + 1
    }));
}

function showSuggestions(value) {
    const suggestions = document.getElementById("suggestions");
    suggestions.innerHTML = "";

    if (!value) return;

    const filtered = pokemonList
        .filter(p => p.name.startsWith(value.toLowerCase()))
        .slice(0, 8);

    filtered.forEach(pokemon => {
        const li = document.createElement("li");
        li.className = "list-group-item list-group-item-action d-flex align-items-center gap-2";

        // Create sprite
        const img = document.createElement("img");
        img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`;
        img.width = 32;
        img.height = 32;

        // Create name
        const span = document.createElement("span");
        span.innerText = capitalize(pokemon.name);

        li.appendChild(img);
        li.appendChild(span);

        li.onclick = () => {
            document.getElementById("guessInput").value = pokemon.name;
            suggestions.innerHTML = "";
        };

        suggestions.appendChild(li);
    });
}

async function getRandomPokemon() {
    try {
        const randomId = Math.floor(Math.random() * 151) + 1;

        document.getElementById("pokeNumber").innerText = String(randomId).padStart(3, "0");

        const pokemonRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`);
        const pokemonData = await pokemonRes.json();

        const speciesRes = await fetch(pokemonData.species.url);
        const speciesData = await speciesRes.json();

        const entries = speciesData.flavor_text_entries.filter(
            entry => entry.language.name === "en"
        );

        const randomEntry = entries[Math.floor(Math.random() * entries.length)];

        currentPokemon = {
            name: pokemonData.name.toLowerCase(),
            entry: randomEntry.flavor_text.replace(/\f/g, " "),
            sprite: pokemonData.sprites.front_default || `https://pokeapi.co/api/v2/pokemon/${randomId}.png`,
        };

        document.getElementById("entry").innerText = `"${currentPokemon.entry}"`;

        document.getElementById("sprite").src = currentPokemon.sprite;
        const spriteEl = document.getElementById("sprite");
        spriteEl.src = currentPokemon.sprite;
        spriteEl.classList.add("hidden-sprite");

    } catch (error) {
        console.error("Error fetching Pokémon:", error);
        document.getElementById("entry").innerText = "Failed to load Pokémon. Try again.";
    }
}

function checkGuess() {
    const input = document.getElementById("guessInput").value.trim().toLowerCase();
    const feedback = document.getElementById("feedback");

    if (!input) return;

    if (
        input === currentPokemon.name ||
        input.replace(/[^a-z]/g, "") === currentPokemon.name.replace(/[^a-z]/g, "")
    ) {
        feedback.innerHTML = "✅ Correct!";
        feedback.className = "mt-3 text-success fw-bold";
        document.getElementById("sprite").classList.remove("hidden-sprite");
        streak++;
    } else {
        lives--;
        feedback.innerHTML = `❌ Wrong! It was <b>${capitalize(currentPokemon.name)}</b>`;
        feedback.className = "mt-3 text-danger fw-bold";
        document.getElementById("sprite").classList.remove("hidden-sprite");
        streak = 0;
    }

    updateStats();

    if (lives <= 0) {
        gameOver();
    } else {
        setTimeout(nextPokemon, 2000);
    }
}

function nextPokemon() {
    document.getElementById("guessInput").value = "";
    document.getElementById("feedback").innerText = "";
    getRandomPokemon();
    document.getElementById("guessInput").focus();
}

function updateStats() {
    document.getElementById("streak").innerText = streak;
    document.getElementById("lives").innerText = lives;
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// ✅ Wait for page to load before attaching events
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("guessInput").addEventListener("keypress", function(e) {
        if (e.key === "Enter") {
            checkGuess();
        }
    });

    document.getElementById("guessInput").addEventListener("input", (e) => {
        showSuggestions(e.target.value);
    });

    loadPokemonList();
    getRandomPokemon();
    document.getElementById("guessInput").focus();
});

function gameOver() {
    document.getElementById("entry").innerText = "💀 Game Over!";
    document.getElementById("feedback").innerHTML = `Final streak: <b>${streak}</b>`;

    document.getElementById("guessInput").disabled = true;

    // Show restart button
    document.getElementById("restartBtn").classList.remove("d-none");
}

function restartGame() {
    lives = 3;
    streak = 0;

    document.getElementById("guessInput").disabled = false;
    document.getElementById("restartBtn").classList.add("d-none");

    updateStats();
    nextPokemon();
}