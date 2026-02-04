document.addEventListener("DOMContentLoaded", function (event) {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const globalGain = audioCtx.createGain()
    globalGain.connect(audioCtx.destination);

    // RESTORED: Your full frequency map
    const keyboardFrequencyMap = {
        '90': { freq: 261.625, label: 'Z', type: 'white' }, // C
        '83': { freq: 277.182, label: 'S', type: 'black' }, // C#
        '88': { freq: 293.664, label: 'X', type: 'white' }, // D
        '68': { freq: 311.126, label: 'D', type: 'black' }, // D#
        '67': { freq: 329.627, label: 'C', type: 'white' }, // E
        '86': { freq: 349.228, label: 'V', type: 'white' }, // F
        '71': { freq: 369.994, label: 'G', type: 'black' }, // F#
        '66': { freq: 391.995, label: 'B', type: 'white' }, // G
        '72': { freq: 415.304, label: 'H', type: 'black' }, // G#
        '78': { freq: 440.000, label: 'N', type: 'white' }, // A
        '74': { freq: 466.163, label: 'J', type: 'black' }, // A#
        '77': { freq: 493.883, label: 'M', type: 'white' }, // B
        '81': { freq: 523.251, label: 'Q', type: 'white' }, // C
        '50': { freq: 554.365, label: '2', type: 'black' }, // C#
        '87': { freq: 587.329, label: 'W', type: 'white' }, // D
        '51': { freq: 622.253, label: '3', type: 'black' }, // D#
        '69': { freq: 659.255, label: 'E', type: 'white' }, // E
        '82': { freq: 698.456, label: 'R', type: 'white' }, // F
        '53': { freq: 739.988, label: '5', type: 'black' }, // F#
        '84': { freq: 783.990, label: 'T', type: 'white' }, // G
        '54': { freq: 830.609, label: '6', type: 'black' }, // G#
        '89': { freq: 880.000, label: 'Y', type: 'white' }, // A
        '55': { freq: 932.327, label: '7', type: 'black' }, // A#
        '85': { freq: 987.766, label: 'U', type: 'white' }, // B
    };

    let inputBuffer = "";
    const meme = "ynxnvvc";
    let activeOscillators = {};
    let selectedWaveform = 'sine';

    // Build the visual keyboard
    const keyboardContainer = document.getElementById('keyboard');
    Object.keys(keyboardFrequencyMap).forEach(code => {
        const info = keyboardFrequencyMap[code];
        const div = document.createElement('div');
        div.className = `key ${info.type}`;
        div.id = `key-${code}`;
        div.innerHTML = `<span>${info.label}</span>`;
        div.addEventListener('mousedown', () => keyDown({ which: code, key: info.label }));
        div.addEventListener('mouseup', () => keyUp({ which: code }));
        div.addEventListener('mouseleave', () => keyUp({ which: code }));
        keyboardContainer.appendChild(div);
    });

    window.addEventListener('keydown', (e) => { if (!e.repeat) keyDown(e); });
    window.addEventListener('keyup', keyUp);

    function keyDown(event) {
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const key = (event.which || event.keyCode).toString();

        if (keyboardFrequencyMap[key] && !activeOscillators[key]) {
            const el = document.getElementById(`key-${key}`);
            if (el) el.classList.add('active');
            playNote(key);
        }

        // Meme logic
        if (event.key) {
            inputBuffer = (inputBuffer + event.key.toLowerCase()).slice(-meme.length);
            if (inputBuffer === meme) window.location.href = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
        }
    }

    function keyUp(event) {
        const key = (event.which || event.keyCode).toString();
        if (activeOscillators[key]) {
            const el = document.getElementById(`key-${key}`);
            if (el) el.classList.remove('active');

            const node = activeOscillators[key];
            const now = audioCtx.currentTime;

            // RULE 3: Stop at 0.0001 (not 0) using Exponential for no pops
            node.gainNode.gain.cancelScheduledValues(now);
            node.gainNode.gain.setValueAtTime(node.gainNode.gain.value, now);
            node.gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
            node.oscillator.stop(now + 0.06);

            delete activeOscillators[key];
        }
    }

    function playNote(key) {
        const osc = audioCtx.createOscillator();
        const noteGain = audioCtx.createGain();
        const now = audioCtx.currentTime;

        osc.type = selectedWaveform;
        osc.frequency.setValueAtTime(keyboardFrequencyMap[key].freq, now);

        // RULE 1 & 3: Start at a non-zero near-zero, ramp to 0.3 (safe amplitude)
        noteGain.gain.setValueAtTime(0.0001, now);
        noteGain.gain.exponentialRampToValueAtTime(0.3, now + 0.02);

        osc.connect(noteGain);
        noteGain.connect(globalGain);
        osc.start();

        activeOscillators[key] = { oscillator: osc, gainNode: noteGain };
    }

    document.getElementById('waveform-selector').onchange = (e) => selectedWaveform = e.target.value;
});