// Global Variables
let currentExercise = null;
let layersData = []; // Still used for layer names in slots and protocol game
let protocolsData = [];
let dragDropTasks = []; // For the new scenario-based drag & drop
let currentDragDropTask = null; // Holds the currently active drag & drop task

let userProgress = {
    dragDropPuzzle: {
        completed: false,
        correctPlacements: 0,
        currentTaskIndex: 0, // Index for dragDropTasks
        completedTasks: [] // Array of task IDs that are completed
    },
    protocolMatching: { completedTasks: [], score: 0, currentTaskIndex: 0 }, // Added currentTaskIndex for consistency
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
const explanationPopup = document.getElementById('layer-explanation-popup'); // May need to be re-purposed or disabled for new D&D
const explanationTitle = document.getElementById('explanation-title');
const explanationText = document.getElementById('explanation-text');
const closeExplanationButton = explanationPopup ? explanationPopup.querySelector('.close-button') : null; // Check if popup exists

// DOM element for drag & drop task scenario/instructions
const dragDropTaskScenarioDisplay = document.getElementById('drag-drop-instructions'); // Re-using existing p tag

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
        await loadLayerData(); // Still needed for layer slot structure and protocol game
        await loadProtocolData();
        await loadDragDropTasks(); // Load the new task data
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

async function loadDragDropTasks() {
    try {
        const response = await fetch('data/drag-drop-tasks.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        dragDropTasks = await response.json();
        console.log("Drag & Drop Tasks loaded:", dragDropTasks);
        if (dragDropTasks.length === 0) {
            console.warn("Keine Drag & Drop Aufgaben gefunden oder Datei ist leer.");
        }
    } catch (error) {
        console.error("Error loading drag & drop tasks:", error);
        dragDropTasks = []; // Ensure it's an empty array on error
        // Optional: display an error to the user if these tasks are critical
        // throw error; // Decide if this should halt initApp
    }
}

// --- Progress Management (localStorage) ---
function loadProgress() {
    const savedProgress = localStorage.getItem('osiUserProgress');
    if (savedProgress) {
        userProgress = JSON.parse(savedProgress);
        // Ensure new progress structures are present
        if (!userProgress.dragDropPuzzle) {
            userProgress.dragDropPuzzle = { completed: false, correctPlacements: 0, currentTaskIndex: 0, completedTasks: [] };
        } else {
            if (userProgress.dragDropPuzzle.currentTaskIndex === undefined) userProgress.dragDropPuzzle.currentTaskIndex = 0;
            if (userProgress.dragDropPuzzle.completedTasks === undefined) userProgress.dragDropPuzzle.completedTasks = [];
        }
        if (!userProgress.protocolMatching) {
            userProgress.protocolMatching = { completedTasks: [], score: 0, currentTaskIndex: 0 };
        } else {
            if (userProgress.protocolMatching.currentTaskIndex === undefined) userProgress.protocolMatching.currentTaskIndex = 0;
        }
        console.log("Fortschritt geladen:", userProgress);
    } else {
        console.log("Kein gespeicherter Fortschritt gefunden, verwende Standard.");
        // Initialize with default structure if not found
        userProgress = {
            dragDropPuzzle: { completed: false, correctPlacements: 0, currentTaskIndex: 0, completedTasks: [] },
            protocolMatching: { completedTasks: [], score: 0, currentTaskIndex: 0 },
            lastExercise: "menu"
        };
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
    console.log("Initialisiere Drag & Drop Puzzle (Szenario-basiert)...");
    if (!dragDropTasks || dragDropTasks.length === 0) {
        if (dragDropTaskScenarioDisplay) dragDropTaskScenarioDisplay.textContent = "Keine Aufgaben für das Drag & Drop Puzzle geladen.";
        if (draggableLayersContainer) draggableLayersContainer.innerHTML = "";
        if (layerSlotsContainer) layerSlotsContainer.innerHTML = "";
        console.warn("Drag & Drop Puzzle kann nicht initialisiert werden: Keine Aufgaben.");
        return;
    }

    // Select current task
    let taskIndex = userProgress.dragDropPuzzle.currentTaskIndex || 0;
    if (taskIndex >= dragDropTasks.length) {
        // All tasks completed or index out of bounds, reset to first task or show completion message
        // For now, let's loop. A more robust solution would handle overall completion.
        console.log("Alle Drag & Drop Aufgaben durchlaufen. Starte von vorne oder zeige Abschlussmeldung.");
        taskIndex = 0;
        userProgress.dragDropPuzzle.currentTaskIndex = 0;
        // Potentially clear userProgress.dragDropPuzzle.completedTasks if re-looping all.
    }
    currentDragDropTask = dragDropTasks[taskIndex];

    if (!currentDragDropTask) {
        console.error("Ausgewählte Drag & Drop Aufgabe ist ungültig. Index:", taskIndex);
        if (dragDropTaskScenarioDisplay) dragDropTaskScenarioDisplay.textContent = "Fehler beim Laden der Aufgabe.";
        return;
    }
    
    if (dragDropTaskScenarioDisplay) {
        dragDropTaskScenarioDisplay.innerHTML = `<strong>Szenario:</strong> ${currentDragDropTask.scenario}<br><em>${currentDragDropTask.instructions || ""}</em>`;
    }

    renderDraggableItemsForTask(currentDragDropTask.draggableItems);
    renderLayerSlots(); // Slots remain the same (OSI layers 1-7)
    
    userProgress.dragDropPuzzle.correctPlacements = 0; // Reset for the current task
    saveProgress();
}

function renderDraggableItemsForTask(items) {
    if (!draggableLayersContainer) return;
    draggableLayersContainer.innerHTML = ''; // Clear previous items
    
    const shuffledItems = [...items].sort(() => Math.random() - 0.5);

    shuffledItems.forEach(item => {
        const itemEl = document.createElement('div');
        itemEl.classList.add('draggable-layer'); // Re-use class for styling
        itemEl.textContent = item.name;
        itemEl.setAttribute('draggable', true);
        itemEl.dataset.itemId = item.id;
        itemEl.dataset.correctLayerNumber = item.correctLayerNumber; // The target layer for THIS item
        itemEl.style.backgroundColor = item.color || '#ddd';

        itemEl.addEventListener('dragstart', (e) => {
            draggedItem = e.target;
            setTimeout(() => { if(e.target) e.target.style.opacity = '0.5'; }, 0);
        });
        itemEl.addEventListener('dragend', (e) => {
            setTimeout(() => {
                if(e.target) e.target.style.opacity = '1';
                draggedItem = null;
            }, 0);
        });
        draggableLayersContainer.appendChild(itemEl);
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
                const slotNumber = parseInt(e.target.dataset.slotNumber); // This is the OSI layer number of the slot (1-7)
                const itemCorrectLayerNumber = parseInt(draggedItem.dataset.correctLayerNumber); // Correct OSI layer for the dragged item

                // Clear placeholder text before appending
                if (e.target.childNodes.length === 1 && e.target.firstChild.nodeType === Node.TEXT_NODE) {
                    e.target.textContent = '';
                }
                e.target.appendChild(draggedItem);
                draggedItem.setAttribute('draggable', false); // Prevent re-dragging from slot for now
                draggedItem.style.cursor = 'default';
                checkLayerPlacement(draggedItem, e.target, itemCorrectLayerNumber, slotNumber); // Pass item's correct layer
            }
        });
        layerSlotsContainer.appendChild(slotEl);
    }
}

function checkLayerPlacement(itemElement, slotElement, itemCorrectLayerNumber, slotNumber) {
    // itemCorrectLayerNumber is the layer this specific item belongs to for the current task.
    // slotNumber is the layer number of the slot it was dropped into.
    const itemId = itemElement.dataset.itemId;
    const correct = itemCorrectLayerNumber === slotNumber;
    provideVisualFeedback(slotElement, correct);

    if (correct) {
        userProgress.dragDropPuzzle.correctPlacements++;
        saveProgress();
        // itemElement.addEventListener('click', () => showItemExplanation(itemId)); // TODO: Implement if needed for items
        
        if (userProgress.dragDropPuzzle.correctPlacements === currentDragDropTask.draggableItems.length) {
            if (!userProgress.dragDropPuzzle.completedTasks.includes(currentDragDropTask.id)) {
                userProgress.dragDropPuzzle.completedTasks.push(currentDragDropTask.id);
            }
            userProgress.dragDropPuzzle.currentTaskIndex++; // Move to next task index
            saveProgress();

            setTimeout(() => {
                alert(`Glückwunsch! Aufgabe "${currentDragDropTask.scenario}" abgeschlossen!`);
                // Automatically load next task or show completion if all tasks are done
                if (userProgress.dragDropPuzzle.currentTaskIndex < dragDropTasks.length) {
                    initDragDropPuzzle(); // Load next task
                } else {
                    if (dragDropTaskScenarioDisplay) dragDropTaskScenarioDisplay.innerHTML = "<strong>Alle Drag & Drop Aufgaben abgeschlossen! Gut gemacht!</strong><br>Du kannst das Puzzle zurücksetzen, um erneut zu üben.";
                    // Optionally disable reset button or change its text
                }
            }, 200);
        }
    } else {
        // Wenn falsch, kurz rot anzeigen, dann zurück in den ziehbaren Bereich verschieben
        setTimeout(() => {
            provideVisualFeedback(slotElement, null); // Reset slot visual
            if (slotElement.contains(itemElement)) {
                slotElement.removeChild(itemElement);
            }
            draggableLayersContainer.appendChild(itemElement);
            itemElement.setAttribute('draggable', true);
            itemElement.style.cursor = 'grab';
            if (!slotElement.querySelector('.draggable-layer')) {
                 const slotNum = slotElement.dataset.slotNumber;
                 slotElement.textContent = `Schicht ${slotNum} Steckplatz`;
            }
        }, 1000);
    }
}

function provideVisualFeedback(element, isCorrect) {
    element.classList.remove('correct', 'incorrect');
    if (isCorrect === true) {
        element.classList.add('correct');
    } else if (isCorrect === false) {
        element.classList.add('incorrect');
    }
}

// This function was for OSI layers. For items, we might need a different approach or no pop-up.
// For now, clicking items won't trigger this.
function showLayerExplanation(layerId) {
    // Check if the ID corresponds to an OSI Layer from layersData if we want to keep this for some items
    const layer = layersData.find(l => l.id === layerId);
    if (layer && explanationPopup && explanationTitle && explanationText) {
        explanationTitle.textContent = layer.name;
        explanationText.textContent = layer.description;
        explanationPopup.style.display = 'block';
    } else {
        console.warn(`Keine Erklärung für ID ${layerId} gefunden oder Popup nicht verfügbar.`);
        if (explanationPopup) explanationPopup.style.display = 'none';
    }
}

function resetDragDropPuzzle() {
    // Resets the current task, or could be modified to reset all progress for D&D
    userProgress.dragDropPuzzle.correctPlacements = 0;
    // userProgress.dragDropPuzzle.currentTaskIndex = 0; // Uncomment to always restart from the first task
    // userProgress.dragDropPuzzle.completedTasks = []; // Uncomment to clear all task completions
    saveProgress();
    initDragDropPuzzle(); // Re-initialize the current or first task
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