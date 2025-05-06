// Global Variables
let currentExercise = null;
let layersData = [];
let protocolsData = [];
let userProgress = {
    dragDropPuzzle: { completed: false, correctPlacements: 0 },
    protocolMatching: { completedTasks: [], score: 0 },
    lastExercise: "menu"
};

// DOM Elements
const mainMenuSection = document.getElementById('main-menu');
const dragDropExerciseSection = document.getElementById('drag-drop-exercise');
const protocolMatchingExerciseSection = document.getElementById('protocol-matching-exercise');

const selectDragDropButton = document.getElementById('select-drag-drop-puzzle');
const selectProtocolMatchingButton = document.getElementById('select-protocol-matching');
const backToMenuButtons = document.querySelectorAll('.back-to-menu');

const draggableLayersContainer = document.getElementById('draggable-layers');
const layerSlotsContainer = document.getElementById('layer-slots');
const resetDragDropButton = document.getElementById('reset-drag-drop-puzzle');
const explanationPopup = document.getElementById('layer-explanation-popup');
const explanationTitle = document.getElementById('explanation-title');
const explanationText = document.getElementById('explanation-text');
const closeExplanationButton = explanationPopup.querySelector('.close-button');

const protocolNameDisplay = document.getElementById('protocol-name-display');
const protocolFullnameDisplay = document.getElementById('protocol-fullname-display');
const protocolExplanationDisplay = document.getElementById('protocol-explanation-display');
const protocolOptionsArea = document.getElementById('protocol-options-area');
const submitProtocolAnswerButton = document.getElementById('submit-protocol-answer');
const nextProtocolTaskButton = document.getElementById('next-protocol-task');
const protocolFeedbackArea = document.getElementById('protocol-feedback-area');
const progressOverviewDisplay = document.getElementById('progress-overview');
const themeToggleButton = document.getElementById('theme-toggle-button');


// --- Initialization ---
document.addEventListener('DOMContentLoaded', initApp);

async function initApp() {
    console.log("Initialisiere OSI Lerntool...");
    loadTheme(); // Lade Design-Präferenz zuerst
    loadProgress(); // Lade Fortschritt

    try {
        await loadLayerData();
        await loadProtocolData();
    } catch (error) {
        console.error("Fehler beim Laden der initialen Daten:", error);
        // Zeige eine Fehlermeldung an, wenn kritische Daten nicht geladen werden können
        if (mainMenuSection) mainMenuSection.innerHTML = "<p>Fehler beim Laden der Anwendungsdaten. Bitte versuche, die Seite neu zu laden.</p>";
        return;
    }

    setupEventListeners();
    showMainMenu(); // Oder stelle letzten Zustand wieder her basierend auf userProgress.lastExercise
    updateProgressOverview();
}

// --- Theme Management ---
function applyTheme(theme) {
    if (theme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        if (themeToggleButton) themeToggleButton.textContent = '☀️ Design'; // Sonnen-Emoji für Light-Mode-Option
    } else {
        document.body.removeAttribute('data-theme');
        if (themeToggleButton) themeToggleButton.textContent = '🌓 Design'; // Mond-Emoji für Dark-Mode-Option
    }
}

function toggleTheme() {
    const currentTheme = document.body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
    localStorage.setItem('osiTheme', newTheme);
    console.log("Design geändert zu:", newTheme);
}

function loadTheme() {
    const savedTheme = localStorage.getItem('osiTheme') || 'dark'; // Standardmäßig dunkel
    applyTheme(savedTheme);
    console.log("Design geladen:", savedTheme);
}


// --- Data Handling ---
async function loadLayerData() {
    try {
        const response = await fetch('data/osi-layers.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        layersData = await response.json();
        console.log("Layers data loaded:", layersData);
    } catch (error) {
        console.error("Error loading layers data:", error);
        layersData = []; // Ensure it's an empty array on error
        throw error; // Re-throw to be caught by initApp
    }
}

async function loadProtocolData() {
    try {
        const response = await fetch('data/osi-protocols.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        protocolsData = await response.json();
        console.log("Protocols data loaded:", protocolsData);
    } catch (error) {
        console.error("Error loading protocols data:", error);
        protocolsData = []; // Ensure it's an empty array on error
        throw error; // Re-throw to be caught by initApp
    }
}

// --- Progress Management (localStorage) ---
function loadProgress() {
    const savedProgress = localStorage.getItem('osiUserProgress');
    if (savedProgress) {
        userProgress = JSON.parse(savedProgress);
        console.log("Fortschritt geladen:", userProgress);
    } else {
        console.log("Kein gespeicherter Fortschritt gefunden, verwende Standard.");
        // Standard userProgress ist bereits global definiert
    }
}

function saveProgress() {
    localStorage.setItem('osiUserProgress', JSON.stringify(userProgress));
    console.log("Fortschritt gespeichert:", userProgress);
    updateProgressOverview();
}

function updateProgressOverview() {
    if (progressOverviewDisplay) {
        let overviewText = "Willkommen! Wähle eine Übung, um zu beginnen.";
        if (userProgress.lastExercise && userProgress.lastExercise !== "menu") {
            let exerciseNameDe = userProgress.lastExercise;
            if (exerciseNameDe === 'dragDropPuzzle') exerciseNameDe = 'Drag & Drop Schichten-Puzzle';
            if (exerciseNameDe === 'protocolMatching') exerciseNameDe = 'Protokoll-Zuordnungsspiel';
            overviewText = `Zuletzt gearbeitet an: ${exerciseNameDe}.`;
        }
        // Füge hier bei Bedarf detailliertere Fortschrittsinformationen hinzu
        progressOverviewDisplay.textContent = overviewText;
    }
}

function updateTaskCompletion(exercise, taskId, status) {
    // Example:
    // if (exercise === 'protocolMatching' && status === 'correct') {
    //     if (!userProgress.protocolMatching.completedTasks.includes(taskId)) {
    //         userProgress.protocolMatching.completedTasks.push(taskId);
    //     }
    //     userProgress.protocolMatching.score++;
    // }
    saveProgress();
}


// --- Menu Logic ---
function showMainMenu() {
    mainMenuSection.style.display = 'block';
    dragDropExerciseSection.style.display = 'none';
    protocolMatchingExerciseSection.style.display = 'none';
    currentExercise = 'menu';
    userProgress.lastExercise = 'menu';
    saveProgress();
}

function selectExercise(exerciseName) {
    mainMenuSection.style.display = 'none';
    currentExercise = exerciseName;
    userProgress.lastExercise = exerciseName;
    saveProgress();

    if (exerciseName === 'dragDropPuzzle') {
        dragDropExerciseSection.style.display = 'block';
        protocolMatchingExerciseSection.style.display = 'none';
        initDragDropPuzzle();
    } else if (exerciseName === 'protocolMatching') {
        dragDropExerciseSection.style.display = 'none';
        protocolMatchingExerciseSection.style.display = 'block';
        initProtocolMatchingGame();
    }
}

// --- Event Listeners ---
function setupEventListeners() {
    selectDragDropButton.addEventListener('click', () => selectExercise('dragDropPuzzle'));
    selectProtocolMatchingButton.addEventListener('click', () => selectExercise('protocolMatching'));

    backToMenuButtons.forEach(button => {
        button.addEventListener('click', showMainMenu);
    });

    if (resetDragDropButton) {
        resetDragDropButton.addEventListener('click', resetDragDropPuzzle);
    }
    if (closeExplanationButton) {
        closeExplanationButton.addEventListener('click', () => {
            if (explanationPopup) explanationPopup.style.display = 'none';
        });
    }
    if (submitProtocolAnswerButton) {
        submitProtocolAnswerButton.addEventListener('click', handleSubmitProtocolAnswer);
    }
    if (nextProtocolTaskButton) {
        nextProtocolTaskButton.addEventListener('click', displayProtocolTask);
    }
    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', toggleTheme);
    }
}

// --- Drag & Drop Puzzle Logic ---
let draggedItem = null;

function initDragDropPuzzle() {
    console.log("Initialisiere Drag & Drop Puzzle...");
    renderDraggableLayers();
    renderLayerSlots();
    // Setze ggf. vorherigen Zustand zurück
    userProgress.dragDropPuzzle.correctPlacements = 0; // Zurücksetzen für eine neue Puzzle-Sitzung
    saveProgress();
}

function renderDraggableLayers() {
    if (!draggableLayersContainer) return;
    draggableLayersContainer.innerHTML = ''; // Clear previous layers
    // Shuffle layers for randomness
    const shuffledLayers = [...layersData].sort(() => Math.random() - 0.5);

    shuffledLayers.forEach(layer => {
        const layerEl = document.createElement('div');
        layerEl.classList.add('draggable-layer');
        layerEl.textContent = layer.name;
        layerEl.setAttribute('draggable', true);
        layerEl.dataset.layerId = layer.id;
        layerEl.dataset.layerNumber = layer.number; // Store layer number
        layerEl.style.backgroundColor = layer.color || '#ddd'; // Use color from JSON

        layerEl.addEventListener('dragstart', (e) => {
            draggedItem = e.target;
            setTimeout(() => e.target.style.opacity = '0.5', 0);
        });
        layerEl.addEventListener('dragend', (e) => {
            setTimeout(() => {
                e.target.style.opacity = '1';
                draggedItem = null;
            }, 0);
        });
        draggableLayersContainer.appendChild(layerEl);
    });
}

function renderLayerSlots() {
    if (!layerSlotsContainer) return;
    layerSlotsContainer.innerHTML = ''; // Clear previous slots
    for (let i = 1; i <= 7; i++) {
        const slotEl = document.createElement('div');
        slotEl.classList.add('layer-slot');
        slotEl.dataset.slotNumber = i;
        slotEl.textContent = `Schicht ${i} Steckplatz`; // Placeholder text in German

        slotEl.addEventListener('dragover', (e) => {
            e.preventDefault(); // Notwendig, um Ablegen zu erlauben
        });

        slotEl.addEventListener('drop', (e) => {
            e.preventDefault();
            // Only drop if slot is empty (does not already contain a draggable-layer)
            if (draggedItem && e.target.classList.contains('layer-slot') && !e.target.querySelector('.draggable-layer')) {
                const slotNumber = parseInt(e.target.dataset.slotNumber);
                const layerNumber = parseInt(draggedItem.dataset.layerNumber);

                // Clear placeholder text before appending
                if (e.target.childNodes.length === 1 && e.target.firstChild.nodeType === Node.TEXT_NODE) {
                    e.target.textContent = '';
                }
                e.target.appendChild(draggedItem);
                draggedItem.setAttribute('draggable', false); // Prevent re-dragging from slot for now
                draggedItem.style.cursor = 'default';
                checkLayerPlacement(draggedItem, e.target, layerNumber, slotNumber);
            }
        });
        layerSlotsContainer.appendChild(slotEl);
    }
}

function checkLayerPlacement(layerElement, slotElement, layerNumber, slotNumber) {
    const layerId = layerElement.dataset.layerId;
    const correct = layerNumber === slotNumber;
    provideVisualFeedback(slotElement, correct);

    if (correct) {
        userProgress.dragDropPuzzle.correctPlacements++;
        saveProgress();
        // Make the correctly placed layer clickable for explanation
        layerElement.addEventListener('click', () => showLayerExplanation(layerId));
        // Überprüfe, ob alle Schichten korrekt platziert sind
        if (userProgress.dragDropPuzzle.correctPlacements === layersData.length) {
            // Verzögerung, um das letzte Feedback anzuzeigen, bevor der Alert kommt
            setTimeout(() => {
                alert("Glückwunsch! Du hast alle OSI-Schichten korrekt platziert!");
            }, 100);
            // Optional: Weitere Interaktion deaktivieren oder Zurücksetzen/Menü anbieten
        }
    } else {
        // Wenn falsch, kurz rot anzeigen, dann zurück in den ziehbaren Bereich verschieben
        setTimeout(() => {
            provideVisualFeedback(slotElement, null); // Reset slot visual
            // Ensure the slot is cleared of the incorrect item before moving it
            if (slotElement.contains(layerElement)) {
                slotElement.removeChild(layerElement);
            }
            draggableLayersContainer.appendChild(layerElement); // Move back
            layerElement.setAttribute('draggable', true);
            layerElement.style.cursor = 'grab';
            // Restore placeholder text if slot is now empty and doesn't have another draggable layer
            if (!slotElement.querySelector('.draggable-layer')) {
                 const slotNum = slotElement.dataset.slotNumber;
                 slotElement.textContent = `Schicht ${slotNum} Steckplatz`;
            }
        }, 1000); // 1 second delay
    }
}

function provideVisualFeedback(element, isCorrect) {
    element.classList.remove('correct', 'incorrect');
    if (isCorrect === true) {
        element.classList.add('correct');
    } else if (isCorrect === false) {
        element.classList.add('incorrect');
    }
    // If isCorrect is null, it means reset to default (no class)
}

function showLayerExplanation(layerId) {
    const layer = layersData.find(l => l.id === layerId);
    if (layer && explanationPopup && explanationTitle && explanationText) {
        explanationTitle.textContent = layer.name;
        explanationText.textContent = layer.description;
        explanationPopup.style.display = 'block';
    }
}

function resetDragDropPuzzle() {
    userProgress.dragDropPuzzle.correctPlacements = 0;
    saveProgress();
    initDragDropPuzzle(); // Re-initialize to reset elements
    if (explanationPopup) explanationPopup.style.display = 'none';
}


// --- Protocol Matching Game Logic ---
let currentProtocolTask = null;
let protocolTasks = []; // Wird eine zufällige Untermenge von protocolsData für das aktuelle Spiel enthalten

function initProtocolMatchingGame() {
    console.log("Initialisiere Protokoll-Zuordnungsspiel...");
    // Mische und wähle eine Untermenge von Protokollen für das Spiel, z.B. 5-10 Aufgaben
    protocolTasks = [...protocolsData].sort(() => 0.5 - Math.random()).slice(0, Math.min(10, protocolsData.length));
    userProgress.protocolMatching.currentTaskIndex = 0;
    userProgress.protocolMatching.score = 0; // Punktzahl für ein neues Spiel zurücksetzen
    userProgress.protocolMatching.completedTasksInCurrentGame = 0;
    saveProgress();

    if (protocolTasks.length > 0) {
        displayProtocolTask();
    } else {
        if(protocolNameDisplay) protocolNameDisplay.textContent = "N/A";
        if(protocolFullnameDisplay) protocolFullnameDisplay.textContent = "Keine Protokollaufgaben verfügbar.";
        if(protocolExplanationDisplay) protocolExplanationDisplay.textContent = "";
        if(protocolOptionsArea) protocolOptionsArea.innerHTML = "";
        if(submitProtocolAnswerButton) submitProtocolAnswerButton.style.display = 'none';
        if(nextProtocolTaskButton) nextProtocolTaskButton.style.display = 'none';
    }
    if(protocolFeedbackArea) protocolFeedbackArea.textContent = '';
    protocolFeedbackArea.className = 'protocol-feedback-area'; // Klassen zurücksetzen
}

function displayProtocolTask() {
    const taskIndex = userProgress.protocolMatching.currentTaskIndex;
    if (taskIndex >= protocolTasks.length) {
        // Spiel vorbei
        if(protocolFeedbackArea) {
            protocolFeedbackArea.textContent = `Spiel beendet! Deine Punktzahl: ${userProgress.protocolMatching.score} / ${protocolTasks.length}`;
            protocolFeedbackArea.className = 'protocol-feedback-area feedback-correct';
        }
        if(protocolNameDisplay) protocolNameDisplay.textContent = "N/A";
        if(protocolFullnameDisplay) protocolFullnameDisplay.textContent = "Alle Aufgaben abgeschlossen!";
        if(protocolExplanationDisplay) protocolExplanationDisplay.textContent = "";
        if(protocolOptionsArea) protocolOptionsArea.innerHTML = "";
        if(submitProtocolAnswerButton) submitProtocolAnswerButton.style.display = 'none';
        if(nextProtocolTaskButton) nextProtocolTaskButton.style.display = 'none';
        return;
    }

    currentProtocolTask = protocolTasks[taskIndex];
    if(protocolNameDisplay) protocolNameDisplay.textContent = currentProtocolTask.protocolName;
    if(protocolFullnameDisplay) protocolFullnameDisplay.textContent = currentProtocolTask.fullName || "Nicht verfügbar";
    if(protocolExplanationDisplay) protocolExplanationDisplay.textContent = currentProtocolTask.explanation || "Keine Beschreibung verfügbar.";
    
    if(protocolFeedbackArea) {
        protocolFeedbackArea.textContent = '';
        protocolFeedbackArea.className = 'protocol-feedback-area';
    }

    renderProtocolOptions();

    // submitProtocolAnswerButton wird nicht mehr benötigt, da Optionen direkt absenden
    // if(submitProtocolAnswerButton) submitProtocolAnswerButton.style.display = 'inline-block';
    if(nextProtocolTaskButton) nextProtocolTaskButton.style.display = 'none';
    // if(submitProtocolAnswerButton) submitProtocolAnswerButton.disabled = false;
}

function renderProtocolOptions() {
    protocolOptionsArea.innerHTML = '';
    // Erstelle Buttons für jede der 7 Schichten
    // Stelle sicher, dass layersData sortiert ist, falls nicht bereits geschehen
    const sortedLayers = [...layersData].sort((a, b) => a.number - b.number);

    sortedLayers.forEach(layer => {
        const optionButton = document.createElement('button');
        optionButton.textContent = `Schicht ${layer.number}: ${layer.name}`;
        optionButton.dataset.layerNumber = layer.number;
        optionButton.addEventListener('click', (e) => {
            handleProtocolOptionClick(parseInt(e.target.dataset.layerNumber));
        });
        protocolOptionsArea.appendChild(optionButton);
    });
    if(submitProtocolAnswerButton) submitProtocolAnswerButton.style.display = 'none'; // Verstecke, da Optionen direkt absenden
}

function handleProtocolOptionClick(selectedLayerNumber) {
    if (!currentProtocolTask) return;

    const correct = selectedLayerNumber === currentProtocolTask.correctLayerNumber;
    provideProtocolFeedback(correct);

    if (correct) {
        userProgress.protocolMatching.score++;
    }
    userProgress.protocolMatching.completedTasksInCurrentGame++;
    userProgress.protocolMatching.currentTaskIndex++;
    saveProgress();

    // Deaktiviere Optionen nach der Auswahl
    const optionButtons = protocolOptionsArea.querySelectorAll('button');
    optionButtons.forEach(btn => btn.disabled = true);


    if (userProgress.protocolMatching.currentTaskIndex < protocolTasks.length) {
        if(nextProtocolTaskButton) nextProtocolTaskButton.style.display = 'inline-block';
    } else {
        // Spiel-Ende-Logik (bereits in displayProtocolTask behandelt, kann hier wiederholt werden)
        setTimeout(() => { // Verzögerung, um Feedback vor "Spiel beendet" anzuzeigen
            if(protocolFeedbackArea) {
                protocolFeedbackArea.textContent = `Spiel beendet! Deine finale Punktzahl: ${userProgress.protocolMatching.score} / ${protocolTasks.length}`;
                protocolFeedbackArea.className = 'protocol-feedback-area feedback-correct';
            }
            if(protocolNameDisplay) protocolNameDisplay.textContent = "N/A";
            if(protocolFullnameDisplay) protocolFullnameDisplay.textContent = "Alle Aufgaben abgeschlossen!";
            if(protocolExplanationDisplay) protocolExplanationDisplay.textContent = "";
            if(protocolOptionsArea) protocolOptionsArea.innerHTML = "";
            if(nextProtocolTaskButton) nextProtocolTaskButton.style.display = 'none';
        }, 1500);
    }
}


function handleSubmitProtocolAnswer() {
    // Diese Funktion könnte veraltet sein, wenn Optionen direkt die Antwortprüfung auslösen.
    // Falls verwendet, müsste sie die ausgewählte Schicht von Radio-Buttons o.ä. erhalten.
    // Momentan wird angenommen, dass handleProtocolOptionClick der primäre Pfad ist.
    console.warn("handleSubmitProtocolAnswer aufgerufen, aber Optionen könnten direkt absenden.");
}


function provideProtocolFeedback(isCorrect) {
    if (isCorrect) {
        protocolFeedbackArea.textContent = "Richtig! " + (currentProtocolTask.explanation || "");
        protocolFeedbackArea.className = 'protocol-feedback-area feedback-correct';
    } else {
        const correctLayer = layersData.find(l => l.number === currentProtocolTask.correctLayerNumber);
        protocolFeedbackArea.textContent = `Falsch. Die korrekte Schicht war Schicht ${currentProtocolTask.correctLayerNumber}: ${correctLayer ? correctLayer.name : 'Unbekannt'}. ` + (currentProtocolTask.explanation || "");
        protocolFeedbackArea.className = 'protocol-feedback-area feedback-incorrect';
    }
}

// --- UI Utility Functions ---
// (Füge hier bei Bedarf Hilfsfunktionen für DOM-Manipulation hinzu, z.B. showElement, hideElement)

console.log("osi-trainer.js geladen");