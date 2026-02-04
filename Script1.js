
document.addEventListener("DOMContentLoaded", function (event) {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const globalGain = audioCtx.createGain()
    globalGain.connect(audioCtx.destination);

    const keyboardFrequencyMap = {
        '90': { freq: 261.62, label: 'Z', type: 'white' },
        '83': { freq: 277.18, label: 'S', type: 'black' },  
        '88': { freq: 293.66, label: 'X', type: 'white' },  
        '68': { freq: 311.13, label: 'D', type: 'black' }, 
        '67': { freq: 329.63, label: 'C', type: 'white' },  
        '86': { freq: 349.23, label: 'V', type: 'white' }, 
        '71': { freq: 369.99, label: 'G', type: 'black' },  
        '66': { freq: 391.99, label: 'B', type: 'white' },  
        '72': { freq: 415.30, label: 'H', type: 'black' },  
        '78': { freq: 440.00, label: 'N', type: 'white' },  
        '74': { freq: 466.16, label: 'J', type: 'black' }, 
        '77': { freq: 493.88, label: 'M', type: 'white' }, 
        '81': { freq: 523.25, label: 'Q', type: 'white' },  
        '50': { freq: 554.37, label: '2', type: 'black' },
        '87': { freq: 587.33, label: 'W', type: 'white' },
        '51': { freq: 622.25, label: '3', type: 'black' },
        '69': { freq: 659.25, label: 'E', type: 'white' },
        '82': { freq: 698.46, label: 'R', type: 'white' },
        '53': { freq: 739.99, label: '5', type: 'black' },
        '84': { freq: 783.99, label: 'T', type: 'white' },
        '54': { freq: 830.61, label: '6', type: 'black' },
        '89': { freq: 880.00, label: 'Y', type: 'white' },
        '55': { freq: 932.33, label: '7', type: 'black' },
        '85': { freq: 987.77, label: 'U', type: 'white' },
    };

    let inputBuffer = "";
    const meme = "ynxnvvc";

    window.addEventListener('keydown', keyDown, false);
    window.addEventListener('keyup', keyUp, false);

    let activeOscillators = {}; 
    let selectedWaveform = 'sine';

    const keyboardContainer = document.getElementById('keyboard');

    function renderKeyboard() {
        Object.keys(keyboardFrequencyMap).forEach(keyCode => {
            const info = keyboardFrequencyMap[keyCode];
            const keyDiv = document.createElement('div');
            keyDiv.className = `key ${info.type}`;
            keyDiv.id = `key-${keyCode}`;
            keyDiv.innerText = info.label;

            keyDiv.addEventListener('mousedown', () => keyDown({ which: keyCode, key: info.label }));
            keyDiv.addEventListener('mouseup', () => keyUp({ which: keyCode }));
            keyDiv.addEventListener('mouseleave', () => keyUp({ which: keyCode }));

            keyboardContainer.appendChild(keyDiv);
        });
    }
    renderKeyboard();

    window.addEventListener('keydown', keyDown, false);
    window.addEventListener('keyup', keyUp, false);


    function keyDown(event) {
        if (audioCtx.state === 'suspended') { audioCtx.resume(); }

        const key = (event.which || event.detail).toString();

        if (keyboardFrequencyMap[key] && !activeOscillators[key]) {
            const el = document.getElementById(`key-${key}`);
            if (el) el.classList.add('active');

            playNote(key);
        }

        
        if (event.key) {
            const char = event.key.toLowerCase();
            inputBuffer += char;
            if (inputBuffer.length > meme.length) { inputBuffer = inputBuffer.slice(-meme.length) }
            if (inputBuffer === meme) {
                window.location.href = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
            }
        }

        updateGain();
    }

    function keyUp(event) {
        const key = (event.which || event.detail).toString();
        if (keyboardFrequencyMap[key] && activeOscillators[key]) {
            const el = document.getElementById(`key-${key}`);
            if (el) el.classList.remove('active');

            const note = activeOscillators[key];
            note.gainNode.gain.setTargetAtTime(0, audioCtx.currentTime, 0.03);
            note.oscillator.stop(audioCtx.currentTime + 0.1);
            delete activeOscillators[key];
            updateGain();
        }
    }

    function updateGain() {
        const activeCount = Object.keys(activeOscillators).length;
        if (activeCount > 0) {
            globalGain.gain.setTargetAtTime(1 / activeCount, audioCtx.currentTime, 0.02);
        } else {
            globalGain.gain.setTargetAtTime(1, audioCtx.currentTime, 0.02);
        }
    }

    function playNote(key) {
        const noteGain = audioCtx.createGain();
        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();

        osc.frequency.setValueAtTime(keyboardFrequencyMap[key].freq, now);
        osc.type = selectedWaveform;

        osc.connect(noteGain);
        noteGain.connect(globalGain);

        noteGain.gain.setValueAtTime(0, now);
        noteGain.gain.linearRampToValueAtTime(1, now + 0.02);

        osc.start(now);
        activeOscillators[key] = { oscillator: osc, gainNode: noteGain };
    }

    const selector = document.getElementById('waveform-selector');
    selector.addEventListener('change', () => { selectedWaveform = selector.value; });
});