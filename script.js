// Create a polyphonic synth and connect it to the master output
const synth = new Tone.PolySynth(Tone.Synth).toDestination();

// Ensure the audio context is resumed after user interaction
document.addEventListener('touchstart', () => {
    Tone.start().then(() => console.log("Audio context resumed"));
});

// Constants for key mappings
const KEY_TO_NOTE = {
    'a': 'C4', 'w': 'C#4', 's': 'D4', 'e': 'D#4',
    'd': 'E4', 'f': 'F4', 't': 'F#4', 'g': 'G4',
    'y': 'G#4', 'h': 'A4', 'u': 'A#4', 'j': 'B4'
};

// Object to track which notes are currently pressed
const activeNotes = {};
const activeTouches = new Set();

// Function to play a note
function playTone(note) {
    if (!activeNotes[note]) {
        synth.triggerAttack(note);
        activeNotes[note] = true;
    }
}

// Function to stop a note
function stopTone(note) {
    if (activeNotes[note]) {
        synth.triggerRelease(note);
        delete activeNotes[note];
    }
}

// Function to handle key interaction
function handleKeyInteraction(note, isActive) {
    if (isActive) {
        playTone(note);
    } else {
        stopTone(note);
    }
}

// Function to handle keyboard events
function handleKeyboardEvent(event) {
    const note = KEY_TO_NOTE[event.key];
    if (note) {
        handleKeyInteraction(note, event.type === 'keydown');
        const keyElement = document.querySelector(`.key[data-note="${note}"]`);
        if (keyElement) {
            keyElement.classList.toggle('active', event.type === 'keydown');
        }
    }
}

// Function to handle mouse and touch events
function handleMouseTouchEvent(note, isActive) {
    handleKeyInteraction(note, isActive);
}

// Initialize key event listeners
function initKeyListeners() {
    document.querySelectorAll('.key').forEach(key => {
        const note = key.getAttribute('data-note');

        // Mouse events
        key.addEventListener('mousedown', () => handleMouseTouchEvent(note, true));
        key.addEventListener('mouseup', () => handleMouseTouchEvent(note, false));

        // Touch events
        key.addEventListener('touchstart', (event) => {
            event.preventDefault();
            handleMouseTouchEvent(note, true);
            activeTouches.add(event.changedTouches[0].identifier);
            key.classList.add('active');
        });

        key.addEventListener('touchend', (event) => {
            handleMouseTouchEvent(note, false);
            activeTouches.delete(event.changedTouches[0].identifier);
        });
    });
}

// Global mouseup event to stop all notes if necessary
document.addEventListener('mouseup', (event) => {
    if (!event.target.classList.contains('key')) {
        Object.keys(activeNotes).forEach(stopTone);
    }
});

// Global touchend event to manage active touches
document.addEventListener('touchend', (event) => {
    const touchedKey = event.target.closest('.key');
    
    if (touchedKey) {
        const note = touchedKey.getAttribute('data-note');
        handleMouseTouchEvent(note, false);
        touchedKey.classList.remove('active');
    }
    
    if (activeTouches.size === 0) {
        Object.keys(activeNotes).forEach(stopTone);
        document.querySelectorAll('.key.active').forEach(key => key.classList.remove('active'));
    }
});

// Initialize event listeners
document.addEventListener('keydown', handleKeyboardEvent);
document.addEventListener('keyup', handleKeyboardEvent);
initKeyListeners();