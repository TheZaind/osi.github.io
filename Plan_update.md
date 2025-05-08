# Plan for Implementing Microlearning Exercises

This plan outlines the steps to integrate interactive microlearning exercises into the OSI model learning platform. The goal is to enhance understanding and retention by adding an exercise page after each informational layer page.

**User Preferences Summary:**

*   **Exercise Variety:** Implement five distinct types of exercises, with each type appearing at least once. I will determine the most suitable layer for each.
    1.  Three True/False questions.
    2.  Two Multiple Choice questions.
    3.  Fill-in-the-blanks with drag-and-drop.
    4.  Interactive problem-solving (requiring active application).
    5.  Application-based tasks (applying knowledge in different contexts).
    Each exercise will reside in its own HTML file with integrated JS and CSS.
*   **Feedback & Progression:**
    *   A "Confirm Answers" button within each exercise will trigger feedback.
    *   If an answer is incorrect, the user can retry the exercise.
    *   The main "Next" button (located in the header) will only become active and allow progression once the current exercise is correctly completed.
*   **Exercise Content:** I will create appropriate content for these exercises based on the information presented for each OSI layer.
*   **Visual Design:** Exercise pages will use the same overall block styling (size, background, borders) as the informational layer pages but will feature a single-column layout for the exercise content itself.

---

## Detailed Implementation Plan

**Phase 1: Core Structure & First Exercise Type (True/False)**

1.  **Modify `index.html` Structure:**
    *   For each existing layer section (e.g., `<section id="layer7" class="osi-layer">`), introduce a corresponding exercise section immediately following it (e.g., `<section id="exercise7" class="osi-exercise">`).
    *   These new exercise sections will initially be hidden, similar to how the informational layers are managed.
    *   The `.osi-exercise` class will share base styling with `.osi-layer` (e.g., background, border-radius, shadow, width, margins) but will be adapted for a single-column content presentation.

2.  **Update JavaScript (`script.js`):**
    *   Modify the `layers` array (or equivalent page tracking mechanism) to include these new exercise "pages" in the correct sequence. For example: `['layer7', 'exercise7', 'layer6', 'exercise6', ...]`.
    *   The `showLayer(index)` function (or equivalent) will need to differentiate between an info layer and an exercise layer to apply any specific logic.
    *   When an exercise layer is displayed, the main "Next" button in the header must initially be disabled.
    *   Implement a mechanism (e.g., a callback function like `window.parent.exerciseCompletedSuccessfully()`) that an exercise iframe can call to notify the main `script.js` upon successful completion. This will trigger the re-enabling of the "Next" button.

3.  **Update `style.css` for Exercise Pages:**
    *   Define styles for the `.osi-exercise` class.
    *   Create styles for a generic exercise content container within the iframe (e.g., `.exercise-iframe-container` in `index.html`, and `.exercise-wrapper` within the exercise HTMLs) to manage padding and max-width of the exercise content.

4.  **Develop First Exercise Type - True/False (e.g., for Layer 7):**
    *   Create a new file: `exercise_layer7_tf.html`.
    *   **HTML Structure:**
        *   A clear title (e.g., "Checkpoint: Layer 7").
        *   Three distinct True/False questions. Each question should have "True" and "False" options (e.g., radio buttons or styled clickable buttons).
        *   A "Confirm Answers" button.
        *   A feedback area (initially hidden) for each question and an overall feedback message.
    *   **CSS (embedded in `<style>` tags or as inline styles):**
        *   Styling for questions, answer options, the confirm button, and feedback messages (differentiating correct/incorrect).
        *   Ensure all text is light-colored for optimal visibility in dark mode.
        *   Set `body { background-color: transparent; }` to blend with the parent page's visual content area.
    *   **JavaScript (embedded in `<script>` tags):**
        *   Logic to evaluate answers when the "Confirm Answers" button is clicked.
        *   Display specific feedback for each question.
        *   If all answers are correct:
            *   Show an overall success message.
            *   Invoke `window.parent.exerciseCompletedSuccessfully()` (or a similarly named function in `script.js`) to enable the main "Next" button.
        *   If any answer is incorrect:
            *   Show an overall "Try Again" message, encouraging the user to review and re-attempt.
            *   Ensure the user can modify their previous answers and re-submit.

---

**Phase 2: Implement Remaining Exercise Types**

This phase involves creating a new HTML file for each of the remaining exercise types. The process for each will mirror step 4 from Phase 1, adapting the HTML, CSS, and JS for the specific exercise format.

5.  **Multiple Choice (e.g., for Layer 6 - `exercise_layer6_mc.html`):**
    *   **HTML:** Two questions, each with 3-4 radio button options. "Confirm Answers" button, feedback area.
    *   **JS:** Check answers, provide feedback, enable parent "Next" button on success.

6.  **Fill-in-the-Blanks with Drag & Drop (e.g., for Layer 5 - `exercise_layer5_dnd.html`):**
    *   **HTML:** A sentence/paragraph with designated "dropzone" spots. A separate container with draggable "word" or "phrase" elements. "Confirm Answer" button, feedback area.
    *   **JS:** Implement using HTML5 Drag and Drop API. Logic to verify correct placement of draggable elements. Provide feedback, enable parent "Next" button on success.

7.  **Interactive Problem-Solving (e.g., for Layer 4 - `exercise_layer4_problem.html`):**
    *   **Example Task:** "A large data packet needs to be sent. Which of the following steps does Layer 4 (Transport) perform? (Select all that apply. Bonus: Can you order them correctly?)"
    *   **HTML:** Question, interactive elements (e.g., selectable list items, possibly simple sortable elements for ordering). "Confirm" button, feedback area.
    *   **JS:** Logic to evaluate the user's selections/ordering against the correct solution. Provide feedback, enable parent "Next" button.

8.  **Application-Based Task (e.g., for Layer 3 - `exercise_layer3_apply.html`):**
    *   **Example Task:** "Given a simplified network diagram (static image or CSS boxes) and a destination IP address, which path would a packet most likely take if Router X is currently unavailable? (User might click a path or select routers in sequence)."
    *   **HTML:** Scenario description, visual aid (diagram), interactive elements for user response. "Confirm" button, feedback area.
    *   **JS:** Logic to evaluate the user's application of routing knowledge based on the scenario. Provide feedback, enable parent "Next" button.

*(Exercises for the remaining two layers, Layer 2 and Layer 1, will reuse one of the implemented types or introduce slight variations to ensure all seven layers are covered with an interactive checkpoint.)*

---

**Phase 3: Refinement, Integration, and Styling**

9.  **Consistent Styling:**
    *   Ensure all exercise HTML files maintain consistent styling for common elements like buttons, feedback messages, and overall layout within the iframe.
    *   All styling must adhere to the established dark mode theme.

10. **Embed Exercises in `index.html`:**
    *   For each `.osi-exercise` section in `index.html`, correctly set the `src` attribute of its `<iframe>` to point to the corresponding exercise HTML file (e.g., `<iframe src="exercise_layer7_tf.html" style="width: 100%; height: 400px; border: none;"></iframe>`). Adjust iframe height as needed per exercise.

11. **Testing:**
    *   Conduct thorough testing of the entire user flow: navigation between info and exercise pages, exercise logic and validation, feedback display, and the enabling/disabling of the "Next" button.
    *   Verify cross-browser compatibility for the exercises, especially for drag-and-drop functionality.

---
## Visual Structure Example

**`index.html` (Relevant part for an exercise section):**
```html
<section id="exercise7" class="osi-exercise"> <!-- Initially hidden -->
    <div class="exercise-iframe-container">
        <iframe src="exercise_layer7_tf.html" style="width: 100%; height: 450px; border: none; border-radius: 8px;"></iframe>
    </div>
</section>
```

**`exercise_layerX_type.html` (General template):**
```html
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Übung Schicht X</title>
    <style>
        body {
            font-family: 'Inter', sans-serif; /* Ensure font consistency */
            background-color: transparent; /* Crucial for blending with parent iframe container */
            color: #E0E0E0; /* Default light text color for dark mode */
            padding: 20px;
            margin: 0;
            display: flex;
            flex-direction: column;
            align-items: center; /* Center content horizontally */
            height: 100%;
            box-sizing: border-box;
        }
        .exercise-wrapper {
            width: 100%;
            max-width: 700px; /* Control max width of exercise content */
            text-align: left; /* Default text alignment */
        }
        h2.exercise-title {
            color: #FF6B39; /* Accent color for exercise titles */
            text-align: center;
            margin-bottom: 25px;
        }
        .question-block {
            margin-bottom: 25px;
            background-color: rgba(42, 42, 42, 0.7); /* Slightly darker than visual-content bg */
            padding: 20px;
            border-radius: 12px;
            border: 1px solid #383838;
        }
        .question-text {
            margin-bottom: 15px;
            font-size: 1.1em;
            line-height: 1.6;
        }
        .options label {
            display: block; /* Make options stack nicely */
            margin-bottom: 10px;
            padding: 10px;
            background-color: #252525;
            border-radius: 8px;
            border: 1px solid #333;
            cursor: pointer;
            transition: background-color 0.2s ease;
        }
        .options label:hover {
            background-color: #303030;
        }
        .options input[type="radio"], .options input[type="checkbox"] {
            margin-right: 10px;
            transform: scale(1.2);
        }
        .confirm-btn {
            background-color: #FF6B39;
            color: white;
            border: none;
            padding: 12px 30px;
            font-size: 1.1em;
            font-weight: 600;
            border-radius: 25px;
            cursor: pointer;
            transition: background-color 0.3s ease, transform 0.2s ease;
            display: block;
            margin: 30px auto 0 auto; /* Center button */
        }
        .confirm-btn:hover {
            background-color: #E05A30;
            transform: translateY(-2px);
        }
        .feedback {
            margin-top: 15px;
            padding: 12px;
            border-radius: 8px;
            font-size: 0.95em;
            text-align: center;
        }
        .feedback.correct {
            background-color: rgba(95, 217, 164, 0.15); /* Subtle green */
            border: 1px solid rgba(95, 217, 164, 0.5);
            color: #8FE3BF; /* Lighter green text */
        }
        .feedback.incorrect {
            background-color: rgba(220, 53, 69, 0.1); /* Subtle red */
            border: 1px solid rgba(220, 53, 69, 0.4);
            color: #F08080; /* Lighter red text */
        }
        .hidden {
            display: none;
        }
        /* Styles for Drag and Drop, Problem Solving etc. will be specific to those files */
    </style>
</head>
<body>
    <div class="exercise-wrapper">
        <h2 class="exercise-title">Checkpoint: [Layer Name]</h2>
        <!-- Exercise-specific HTML content (questions, options, etc.) -->
        <button id="confirmBtn" class="confirm-btn">Antworten prüfen</button>
        <div id="overall-feedback" class="feedback hidden"></div>
    </div>
    <script>
        // Exercise-specific JavaScript
        // const confirmBtn = document.getElementById('confirmBtn');
        // const overallFeedback = document.getElementById('overall-feedback');
        // confirmBtn.addEventListener('click', () => {
        //    // ... validation logic ...
        //    if (allCorrect) {
        //        overallFeedback.textContent = "Sehr gut! Alles richtig.";
        //        overallFeedback.className = 'feedback correct';
        //        if (window.parent && typeof window.parent.exerciseCompletedSuccessfully === 'function') {
        //            window.parent.exerciseCompletedSuccessfully();
        //        }
        //    } else {
        //        overallFeedback.textContent = "Einige Antworten sind noch nicht korrekt. Bitte versuche es erneut!";
        //        overallFeedback.className = 'feedback incorrect';
        //    }
        //    overallFeedback.classList.remove('hidden');
        // });
    </script>
</body>
</html>
```

---
## Sequence Diagram for JS Interaction

```mermaid
sequenceDiagram
    participant User
    participant HeaderNav (index.html - Next/Prev Buttons)
    participant MainScript (script.js in index.html)
    participant InfoPage (section.osi-layer in index.html)
    participant ExerciseSection (section.osi-exercise in index.html)
    participant ExerciseIframe (content of exercise_layerX.html)

    User->>HeaderNav: Clicks "Next"
    HeaderNav->>MainScript: Calls showLayer(currentIndex + 1)
    MainScript->>InfoPage: Hides current InfoPage
    MainScript->>ExerciseSection: Shows corresponding ExerciseSection (e.g., exercise7)
    MainScript->>HeaderNav: Disables "Next" button

    User->>ExerciseIframe: Interacts with exercise (selects answers)
    User->>ExerciseIframe: Clicks "Confirm Answers" button
    ExerciseIframe->>ExerciseIframe: Validates answers internally
    alt All answers correct
        ExerciseIframe->>ExerciseIframe: Displays "Correct" feedback message(s)
        ExerciseIframe->>MainScript: Calls `window.parent.exerciseCompletedSuccessfully()`
        MainScript->>HeaderNav: Enables "Next" button
    else Some answers incorrect
        ExerciseIframe->>ExerciseIframe: Displays "Incorrect, try again" feedback message(s)
        User->>ExerciseIframe: Re-attempts exercise
        User->>ExerciseIframe: Clicks "Confirm Answers" button again
        loop Until all correct or user gives up (if attempts are limited - not planned for now)
            ExerciseIframe->>ExerciseIframe: Validates answers
        end
    end

    User->>HeaderNav: Clicks "Next" (now enabled)
    HeaderNav->>MainScript: Calls showLayer(currentIndex + 1)
    MainScript->>ExerciseSection: Hides current ExerciseSection
    MainScript->>InfoPage: Shows next InfoPage (e.g., layer6)