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
const protocolOptionsArea = document.getElementById('protocol-options-area');
const submitProtocolAnswerButton = document.getElementById('submit-protocol-answer');
const nextProtocolTaskButton = document.getElementById('next-protocol-task');
const protocolFeedbackArea = document.getElementById('protocol-feedback-area');
const progressOverviewDisplay = document.getElementById('progress-overview');


// --- Initialization ---
document.addEventListener('DOMContentLoaded', initApp);

async function initApp() {
    console.log("Initializing OSI Learning Tool...");
    loadProgress(); // Load progress first

    try {
        await loadLayerData();
        await loadProtocolData();
    } catch (error) {
        console.error("Failed to load initial data:", error);
        // Display an error message to the user if critical data fails to load
        if (mainMenuSection) mainMenuSection.innerHTML = "<p>Error loading application data. Please try refreshing the page.</p>";
        return;
    }

    setupEventListeners();
    showMainMenu(); // Or restore last state based on userProgress.lastExercise
    updateProgressOverview();
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
        console.log("Progress loaded:", userProgress);
    } else {
        console.log("No saved progress found, using default.");
        // Default userProgress is already defined globally
    }
}

function saveProgress() {
    localStorage.setItem('osiUserProgress', JSON.stringify(userProgress));
    console.log("Progress saved:", userProgress);
    updateProgressOverview();
}

function updateProgressOverview() {
    if (progressOverviewDisplay) {
        let overviewText = "Welcome! Select an exercise to begin.";
        if (userProgress.lastExercise && userProgress.lastExercise !== "menu") {
            overviewText = `Last time you were working on: ${userProgress.lastExercise.replace(/([A-Z])/g, ' $1').trim()}.`;
        }
        // Add more detailed progress if needed, e.g., scores or completion status
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
}

// --- Drag & Drop Puzzle Logic ---
let draggedItem = null;

function initDragDropPuzzle() {
    console.log("Initializing Drag & Drop Puzzle...");
    renderDraggableLayers();
    renderLayerSlots();
    // Reset any previous state if necessary
    userProgress.dragDropPuzzle.correctPlacements = 0; // Reset for a new session of the puzzle
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
        slotEl.textContent = `Layer ${i} Slot`; // Placeholder text

        slotEl.addEventListener('dragover', (e) => {
            e.preventDefault(); // Necessary to allow dropping
        });

        slotEl.addEventListener('drop', (e) => {
            e.preventDefault();
            if (draggedItem && e.target.classList.contains('layer-slot') && !e.target.hasChildNodes()) { // Only drop if slot is empty
                const slotNumber = parseInt(e.target.dataset.slotNumber);
                const layerNumber = parseInt(draggedItem.dataset.layerNumber);

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
        // Check if all layers are placed correctly
        if (userProgress.dragDropPuzzle.correctPlacements === layersData.length) {
            alert("Congratulations! You've correctly placed all OSI layers!");
            // Optionally, disable further interaction or offer to reset/go to menu
        }
    } else {
        // If incorrect, briefly show red, then move back to draggable area
        setTimeout(() => {
            provideVisualFeedback(slotElement, null); // Reset slot visual
            draggableLayersContainer.appendChild(layerElement); // Move back
            layerElement.setAttribute('draggable', true);
            layerElement.style.cursor = 'grab';
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
let protocolTasks = []; // Will hold a shuffled subset of protocolsData for the current game

function initProtocolMatchingGame() {
    console.log("Initializing Protocol Matching Game...");
    // Shuffle and select a subset of protocols for the game, e.g., 5-10 tasks
    protocolTasks = [...protocolsData].sort(() => 0.5 - Math.random()).slice(0, Math.min(10, protocolsData.length));
    userProgress.protocolMatching.currentTaskIndex = 0;
    userProgress.protocolMatching.score = 0; // Reset score for a new game
    userProgress.protocolMatching.completedTasksInCurrentGame = 0;
    saveProgress();

    if (protocolTasks.length > 0) {
        displayProtocolTask();
    } else {
        protocolNameDisplay.textContent = "No protocol tasks available.";
        protocolOptionsArea.innerHTML = "";
        submitProtocolAnswerButton.style.display = 'none';
        nextProtocolTaskButton.style.display = 'none';
    }
    protocolFeedbackArea.textContent = '';
    protocolFeedbackArea.className = 'protocol-feedback-area'; // Reset classes
}

function displayProtocolTask() {
    const taskIndex = userProgress.protocolMatching.currentTaskIndex;
    if (taskIndex >= protocolTasks.length) {
        // Game over
        protocolFeedbackArea.textContent = `Game Over! Your score: ${userProgress.protocolMatching.score} / ${protocolTasks.length}`;
        protocolFeedbackArea.className = 'protocol-feedback-area feedback-correct'; // Use a general positive feedback style
        protocolNameDisplay.textContent = "All tasks completed!";
        protocolOptionsArea.innerHTML = "";
        submitProtocolAnswerButton.style.display = 'none';
        nextProtocolTaskButton.style.display = 'none';
        return;
    }

    currentProtocolTask = protocolTasks[taskIndex];
    protocolNameDisplay.textContent = currentProtocolTask.protocolName;
    protocolFeedbackArea.textContent = '';
    protocolFeedbackArea.className = 'protocol-feedback-area';

    renderProtocolOptions();

    submitProtocolAnswerButton.style.display = 'inline-block';
    nextProtocolTaskButton.style.display = 'none';
    submitProtocolAnswerButton.disabled = false;
}

function renderProtocolOptions() {
    protocolOptionsArea.innerHTML = '';
    // Create buttons for each of the 7 layers
    layersData.sort((a,b) => a.number - b.number).forEach(layer => {
        const optionButton = document.createElement('button');
        optionButton.textContent = `Layer ${layer.number}: ${layer.name}`;
        optionButton.dataset.layerNumber = layer.number;
        optionButton.addEventListener('click', () => {
            // Optionally, handle selection visually before submitting
            // For now, direct submission via main button
            // For a better UX, clicking an option could highlight it and set a selectedLayer variable
        });
        protocolOptionsArea.appendChild(optionButton);
    });
    // For a more robust selection, you might want radio buttons or a way to clearly indicate selection
    // For now, we'll assume the user clicks one and then "Submit Answer"
    // A simpler approach for now: user clicks a layer button, and that IS the submission.
    // Let's refine this: add event listeners to option buttons to directly check answer.

    protocolOptionsArea.innerHTML = ''; // Clear again
    layersData.sort((a,b) => a.number - b.number).forEach(layer => {
        const optionButton = document.createElement('button');
        optionButton.textContent = `Layer ${layer.number}: ${layer.name}`;
        optionButton.dataset.layerNumber = layer.number;
        optionButton.addEventListener('click', (e) => {
            handleProtocolOptionClick(parseInt(e.target.dataset.layerNumber));
        });
        protocolOptionsArea.appendChild(optionButton);
    });
    submitProtocolAnswerButton.style.display = 'none'; // Hide if options directly submit
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

    // Disable options after selection
    const optionButtons = protocolOptionsArea.querySelectorAll('button');
    optionButtons.forEach(btn => btn.disabled = true);


    if (userProgress.protocolMatching.currentTaskIndex < protocolTasks.length) {
        nextProtocolTaskButton.style.display = 'inline-block';
    } else {
        // Game over logic (already handled in displayProtocolTask, but can be reiterated here)
        setTimeout(() => { // Delay to show feedback before "Game Over"
            protocolFeedbackArea.textContent = `Game Over! Your final score: ${userProgress.protocolMatching.score} / ${protocolTasks.length}`;
            protocolFeedbackArea.className = 'protocol-feedback-area feedback-correct';
            protocolNameDisplay.textContent = "All tasks completed!";
            protocolOptionsArea.innerHTML = "";
            nextProtocolTaskButton.style.display = 'none';
        }, 1500);
    }
}


function handleSubmitProtocolAnswer() {
    // This function might be deprecated if options directly trigger answer checking.
    // If used, it would need to get the selected layer from radio buttons or a similar mechanism.
    // For now, assuming handleProtocolOptionClick is the primary path.
    console.warn("handleSubmitProtocolAnswer called, but options might directly submit.");
}


function provideProtocolFeedback(isCorrect) {
    if (isCorrect) {
        protocolFeedbackArea.textContent = "Correct! " + (currentProtocolTask.explanation || "");
        protocolFeedbackArea.className = 'protocol-feedback-area feedback-correct';
    } else {
        const correctLayer = layersData.find(l => l.number === currentProtocolTask.correctLayerNumber);
        protocolFeedbackArea.textContent = `Incorrect. The correct layer was Layer ${currentProtocolTask.correctLayerNumber}: ${correctLayer ? correctLayer.name : 'Unknown'}. ` + (currentProtocolTask.explanation || "");
        protocolFeedbackArea.className = 'protocol-feedback-area feedback-incorrect';
    }
}

// --- UI Utility Functions ---
// (Add any helper functions for DOM manipulation if needed, e.g., showElement, hideElement)

console.log("osi-trainer.js loaded");