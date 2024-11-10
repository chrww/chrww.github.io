
// Create a polyphonic synth and connect it to the master output (speakers)
const synth = new Tone.PolySynth(Tone.Synth).toDestination();

// Ensure the audio context is resumed after user interaction
document.addEventListener('touchstart', () => {
    Tone.start().then(() => {
        console.log("Audio context resumed");
    });
});

// Object to track which notes are currently pressed
const activeNotes = {};
const keysPressed = new Set(); // Track currently pressed keys

// Set a higher audio context sample rate
Tone.context.sampleRate = 44100;

// Map keyboard keys to musical notes
const keyToNote = {
    'a': 'C4',
    'w': 'C#4',
    's': 'D4',
    'e': 'D#4',
    'd': 'E4',
    'f': 'F4',
    't': 'F#4',
    'g': 'G4',
    'y': 'G#4',
    'h': 'A4',
    'u': 'A#4',
    'j': 'B4'
};

// Function to play a note
function playTone(note) {
    if (!activeNotes[note]) { // Check if the note is already playing
        synth.triggerAttack(note); // Start the note
        activeNotes[note] = true; // Mark the note as active
    }
}

// Function to stop a note
function stopTone(note) {
    if (activeNotes[note]) { // Check if the note is active
        synth.triggerRelease(note); // Release the note
        delete activeNotes[note]; // Remove from active notes
    }
}

// Handle keyboard events
document.addEventListener('keydown', (event) => {
    const note = keyToNote[event.key]; // Get the note based on the pressed key
    if (note && !keysPressed.has(event.key)) {
        keysPressed.add(event.key); // Add the key to the set of pressed keys
        playTone(note); // Play the corresponding note

        // Add visual feedback for keyboard
        const keyElement = document.querySelector(`.key[data-note="${note}"]`);
        keyElement?.classList.add('active'); // Add active class if exists
    }
});

document.addEventListener('keyup', (event) => {
    const note = keyToNote[event.key]; // Get the note based on the released key
    if (note) {
        stopTone(note); // Stop the corresponding note
        keysPressed.delete(event.key); // Remove the key from the set of pressed keys

        // Remove visual feedback for keyboard
        const keyElement = document.querySelector(`.key[data-note="${note}"]`);
        keyElement?.classList.remove('active'); // Remove active class if exists
    }
});

// Add mouse event listeners to keys
document.querySelectorAll('.key').forEach(key => {
    const note = key.getAttribute('data-note'); // Get the note once

    key.addEventListener('mousedown', () => {
        playTone(note); // Play the note
        key.classList.add('active'); // Add active class for visual feedback
    });

    key.addEventListener('mouseup', () => {
        stopTone(note); // Stop the note
        key.classList.remove('active'); // Remove active class
    });

    // Touch events for mobile
    key.addEventListener('touchstart', (event) => {
        event.preventDefault(); // Prevent scrolling
        playTone(note); // Play the note
        key.classList.add('active'); // Add active class
    });

    key.addEventListener('touchend', () => {
        stopTone(note); // Stop the note
        key.classList.remove('active'); // Remove active class
    });
});

document.addEventListener('mouseup', (event) => {
    if (!event.target.classList.contains('key')) {
        Object.keys(activeNotes).forEach(stopTone); // Stop each active note only if not clicking a key
    }
});

// Handle touchend to stop only the notes of active keys
document.addEventListener('touchend', (event) => {
    // Check if the touch ended on a key
    const touchedKey = event.target.closest('.key');
    
    if (touchedKey) {
        const note = touchedKey.getAttribute('data-note');
        stopTone(note); // Stop only the note for the touched key
        touchedKey.classList.remove('active'); // Remove active class for that key
    } else {
        // If touch ends outside of keys, stop all active notes
        Object.keys(activeNotes).forEach(stopTone);
        document.querySelectorAll('.key.active').forEach(key => {
            key.classList.remove('active'); // Reset all keys
        });
    }
});