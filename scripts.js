const cardsContainer = document.querySelector('.memory-game');
let hasFlippedCard = false;
let lockBoard = false;
let firstCard, secondCard;

// Function to get selected levels and display mode from the form
function getSettings() {
    // Get display mode
    const displayMode = document.getElementById('display-mode').value;

    // Get selected levels
    const levelCheckboxes = document.querySelectorAll('input[name="level"]:checked');
    const selectedLevels = Array.from(levelCheckboxes).map(checkbox => parseInt(checkbox.value));

    return { displayMode, selectedLevels };
}

// Fetch and filter vocabulary based on selected levels
async function fetchVocabulary(selectedLevels) {
    const response = await fetch('hsk.json');
    const data = await response.json();

    // Filter vocabulary items based on selected levels
    const filteredVocabulary = data.filter(item => selectedLevels.includes(item.level));
    return filteredVocabulary;
}

// Initialize the game with user settings
async function initGame(displayMode, selectedLevels) {
    // Fetch vocabulary with selected levels
    const vocabulary = await fetchVocabulary(selectedLevels);
    const selectedItems = vocabulary.sort(() => 0.5 - Math.random()).slice(0, 6); // Select 6 pairs

    // Create pairs: one card with hanzi/pinyin, one with English
    const gameCards = [];
    selectedItems.forEach(item => {
        gameCards.push({
            id: item.id,
            content: displayMode === "hanzi" ? item.hanzi : displayMode === "pinyin" ? item.pinyin : `${item.hanzi} (${item.pinyin})`,
            type: "chinese"
        });
        gameCards.push({
            id: item.id,
            content: item.translations.eng[0], // First English translation
            type: "english"
        });
    });

    // Shuffle cards
    const shuffledCards = gameCards.sort(() => 0.5 - Math.random());

    // Clear any existing cards in container
    cardsContainer.innerHTML = '';

    // Create and display cards
    shuffledCards.forEach(item => {
        const card = document.createElement('div');
        card.classList.add('memory-card')
        card.setAttribute('data-id', item.id); // Set id for matching
        card.setAttribute('data-type', item.type); // Set type for matching logic

        // Debug: Log to confirm card creation
        console.log("Creating a new memory card");

        // Front face (hanzi/pinyin or English)
        const frontFace = document.createElement('div');
        frontFace.classList.add('front-face');
        frontFace.textContent = item.content; // Display item content on front face
        card.appendChild(frontFace);

        // Debug: Log to check if front face is added correctly
        console.log("Front face created with content:", frontFace.textContent);

        // Back face (dragon SVG)
        const backFace = document.createElement('img');
        backFace.classList.add('back-face');
        backFace.src = 'img/frontDragon.svg'; // Display dragon image on back face        
        card.appendChild(backFace);

        // Debug: Log to check if back face is added correctly
        console.log("Back face created with image source:", backFace.src);
        cardsContainer.appendChild(card);
        // Add click event for flipping functionality
        card.addEventListener('click', flipCard);        
    });
}

// Start game with selected settings
function startGame() {
    const { displayMode, selectedLevels } = getSettings();

    // Ensure levels are selected
    if (selectedLevels.length === 0) {
        alert('Please select at least one HSK level.');
        return;
    }

    //Hide header and options box
    document.getElementById('header-container').classList.add('hidden');
    console.log('Options hidden');

    // Initialize the game with selected options
    initGame(displayMode, selectedLevels);
}

// Game logic
function flipCard() {
    if (lockBoard) return;
    if (this === firstCard) return;

    this.classList.add('flip');

    if (!hasFlippedCard) {
        hasFlippedCard = true;
        firstCard = this;
    } else {
        hasFlippedCard = false;
        secondCard = this;

        checkForMatch();
    }
}

function checkForMatch() {
    const isMatch = firstCard.dataset.id === secondCard.dataset.id && firstCard.dataset.type !== secondCard.dataset.type;
    isMatch ? disableCards() : unflipCards();
}

function disableCards() {
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);
    resetBoard();
}

function unflipCards() {
    lockBoard = true;
    setTimeout(() => {
        firstCard.classList.remove('flip');
        secondCard.classList.remove('flip');
        resetBoard();
    }, 1500);
}

function resetBoard() {
    [hasFlippedCard, lockBoard] = [false, false];
    [firstCard, secondCard] = [null, null];
}
