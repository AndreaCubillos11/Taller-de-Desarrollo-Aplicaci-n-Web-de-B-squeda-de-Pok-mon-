var artyom = new Artyom();
        window.artyom = new Artyom();

        artyom.addCommands([
            {
                indexes: ["Hola", "Buen día", "hey app de pokemones"],
                action: function (i) {
                    artyom.say("¡Hola! ¿Qué Pokémon estás buscando?");
                }
            },
            {
                indexes:["Buscar Pokémon *"], 
                smart:true,
                action:function (i, wildcard) {
                    artyom.say("Buscando el Pokémon " + wildcard);
                    getPokemon(wildcard.toLowerCase()); 
                }
            }
        ]);

  

        artyom.initialize({
            lang:"es-ES",
            debug:true,
            listen:true,
            continuous: true,
            speed:0.9,
            mode:"normal"
        });

        let pokemons = [];
        const poke_container = document.getElementById("poke_container");
        const url = "https://pokeapi.co/api/v2/pokemon";
        const pokemons_number = 912;
        const search = document.getElementById("search");
        const form = document.getElementById("form");

        // Función para traducir los tipos de Pokémon
        const traducirTipo = (tipo) => {
            switch (tipo) {
                case "grass":
                    return "Planta";
                case "fire":
                    return "Fuego";
                case "water":
                    return "Agua";
                case "bug":
                    return "Bicho";
                case "normal":
                    return "Normal";
                // Agrega más casos según sea necesario para otros tipos
                default:
                    return tipo; // Devuelve el tipo original si no hay traducción disponible
            }
        }

        const fetchPokemons = async () => {
            for (let i = 1; i <= pokemons_number; i++) { // Cambiado <= para incluir el último Pokémon
                await getAllPokemon(i);
            }
            pokemons.forEach((pokemon) => createPokemonCard(pokemon));
        }

        const removePokemon = () => {
            const pokemonEls = document.getElementsByClassName("pokemon");
            let removablePokemons = [];
            for (let i = 0; i < pokemonEls.length; i++) {
                const pokemonEl = pokemonEls[i];
                removablePokemons = [...removablePokemons, pokemonEl];
            }
            removablePokemons.forEach((remPoke) => remPoke.remove());
        }

        const getPokemon = async (id) => {
            // Verificar si el Pokémon ya está en la lista
            const existingPokemon = pokemons.find(pokemon => pokemon.name.toLowerCase() === id.toLowerCase());
            if (existingPokemon) {
                // Si el Pokémon ya está en la lista, crear la tarjeta sin realizar una nueva búsqueda en la API
                removePokemon();
                createPokemonCard(existingPokemon);
            } else {
                // Si el Pokémon no está en la lista, realizar la búsqueda en la API
                const res = await fetch(`${url}/${id}`);
                if (!res.ok) {
                    // Mostrar mensaje de error personalizado si el Pokémon no existe
                    alert("¡Oops! Pokémon no encontrado. Inténtalo de nuevo.");
                    return;
                }
                
                const pokemon = await res.json();
                removePokemon();
                createPokemonCard(pokemon);
            }
        }
        

        const getAllPokemon = async (id) => {
            const res = await fetch(`${url}/${id}`);
            const pokemon = await res.json();
            pokemons = [...pokemons, pokemon];
        }

        fetchPokemons();

        const createPokemonCard = (pokemon) => {
            const pokemonEl = document.createElement("div");
            pokemonEl.classList.add("pokemon");
            const poke_types = pokemon.types.map((el) => traducirTipo(el.type.name)).slice(0, 1);
            const name = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
            const poke_stat = pokemon.stats.map((el) => el.stat.name);
            const stats = poke_stat.slice(0, 3);
            const base_value = pokemon.stats.map((el) => el.base_stat);
            const base_stat = base_value.slice(0, 3);
            const statElements = stats.map((stat) => {
                let statName = "";
                switch (stat) {
                    case "speed":
                        statName = "Velocidad";
                        break;
                    case "special-defense":
                        statName = "Defensa Especial";
                        break;
                    case "special-attack":
                        statName = "Ataque Especial";
                        break;
                    case "defense":
                        statName = "Defensa";
                        break;
                    case "attack":
                        statName = "Ataque";
                        break;
                    case "hp":
                        statName = "PS";
                        break;
                    default:
                        statName = stat;
                }
                return `<li class="names">${statName}</li>`;
            }).join("");
            const baseElements = base_stat.map((base) => {
                return `<li class="base">${base}</li>`;
            }).join("");
            const pokeInnerHTML = `
                <div class="img-container">
                    <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png" alt="${name}"/>
                </div>
                <div class="info">
                    <span class="number">#${pokemon.id.toString().padStart(3, "0")}</span>
                    <h3 class="name">${name}</h3>
                    <small class="type"><span>${poke_types}</span></small>
                </div>
                <div class="stats">
                    <h3>Estadística</h3>
                    <div class="flex">
                        <ul>${statElements}</ul>
                        <ul>${baseElements}</ul>
                    </div>
                </div>`;
            pokemonEl.innerHTML = pokeInnerHTML;
            poke_container.appendChild(pokemonEl);
        }

        form.addEventListener("submit", (e) => {
            e.preventDefault();
            const searchTerm = search.value.trim(); // Añadir trim() para eliminar espacios en blanco al principio y al final
            if (searchTerm) {
                getPokemon(searchTerm);
                search.value = "";
            } else {
                pokemons = [];
                removePokemon();
                fetchPokemons();
            }
        });

        // Agregar evento de reconocimiento de voz
        artyom.redirectRecognizedTextOutput(function(transcript){
            // Verificar si el comando de voz coincide con el patrón de búsqueda de Pokémon
            const match = transcript.match(/Buscar Pokémon (.+)/i);
            if (match) {
                const searchTerm = match[1].trim();
                getPokemon(searchTerm);
            }

        });