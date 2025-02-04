// Task array to store all tasks
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let alarms = JSON.parse(localStorage.getItem('alarms')) || [];

// Create and inject audio element programmatically
const audioData = 'data:audio/mp3;base64,//uQxAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAADAAAGhgBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVWqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqr///////////////////////////////////////////8AAAA8TEFNRTMuOTlyBK8AAAAAAAAAABSAJAOkQgAAgAAABobXqrnWAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//sQxAADgnWFKkMMbcDCsGYY+0ZuAAAABLR0VHRiAAAAKTGltZTIyNzkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/7EMQAAAYEfTgoEQJAAAA0gAAABAZFhkXAAAACQDAwMEFBQUFB//sQxBoDwAABpAAAACAAADSAAAAETU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1N//sQxBYDwAABpAAAACAAADSAAAAETU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1N';

// Create audio element
const audio = document.createElement('audio');
audio.id = 'alarmSound';
audio.src = audioData;
document.body.appendChild(audio);

// Function to add a new task
function addTask() {
    const taskInput = document.getElementById('taskInput');
    const prioritySelect = document.getElementById('prioritySelect');
    
    if (taskInput.value.trim() === '') return;

    const task = {
        id: Date.now(),
        text: taskInput.value,
        priority: prioritySelect.value,
        completed: false,
        timestamp: new Date().toISOString()
    };

    tasks.push(task);
    saveTasks();
    renderTasks();
    taskInput.value = '';
}

// Function to save tasks to localStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Function to save alarms to localStorage
function saveAlarms() {
    localStorage.setItem('alarms', JSON.stringify(alarms));
}

// Function to render tasks
function renderTasks() {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';

    // Sort tasks by priority and timestamp
    const sortedTasks = tasks.sort((a, b) => {
        const priorityOrder = { high: 1, medium: 2, low: 3 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return new Date(b.timestamp) - new Date(a.timestamp);
    });

    sortedTasks.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.className = `task-item ${task.priority}-priority ${task.completed ? 'completed' : ''}`;
        
        taskElement.innerHTML = `
            <span onclick="toggleTask(${task.id})" style="cursor: pointer;">
                ${task.text}
            </span>
            <button onclick="deleteTask(${task.id})" style="background-color: var(--danger-color);">Delete</button>
        `;
        
        taskList.appendChild(taskElement);
    });
}

// Function to toggle task completion
function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
    }
}

// Function to delete task
function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    renderTasks();
}

// Function to set an alarm
function setAlarm() {
    const alarmTimeInput = document.getElementById('alarmTime');
    const alarmTime = new Date(alarmTimeInput.value).getTime();
    
    if (alarmTime <= Date.now()) {
        alert('Please select a future time for the alarm');
        return;
    }

    const alarm = {
        id: Date.now(),
        time: alarmTime
    };

    alarms.push(alarm);
    saveAlarms();
    renderAlarms();
    startAlarm(alarm);
}

// Function to render alarms
function renderAlarms() {
    const activeAlarms = document.getElementById('activeAlarms');
    activeAlarms.innerHTML = '';

    alarms.forEach(alarm => {
        const alarmElement = document.createElement('div');
        alarmElement.className = 'alarm-item';
        
        alarmElement.innerHTML = `
            <span>⏰ Alarm set for: ${new Date(alarm.time).toLocaleString()}</span>
            <div class="countdown" id="countdown-${alarm.id}"></div>
            <button onclick="deleteAlarm(${alarm.id})">Cancel</button>
        `;
        
        activeAlarms.appendChild(alarmElement);
        updateCountdown(alarm.id, alarm.time);
    });
}

// Function to delete alarm
function deleteAlarm(id) {
    // Clear the countdown timer if it exists
    if (window.alarmTimers && window.alarmTimers[id]) {
        clearInterval(window.alarmTimers[id]);
        delete window.alarmTimers[id];
    }
    
    alarms = alarms.filter(alarm => alarm.id !== id);
    saveAlarms();
    renderAlarms();
}

// Function to start alarm
function startAlarm(alarm) {
    const timeUntilAlarm = alarm.time - Date.now();
    
    if (timeUntilAlarm > 0) {
        setTimeout(() => {
            // Clear the countdown timer when alarm triggers
            if (window.alarmTimers && window.alarmTimers[alarm.id]) {
                clearInterval(window.alarmTimers[alarm.id]);
                delete window.alarmTimers[alarm.id];
            }
            
            playAlarmSound();
            deleteAlarm(alarm.id);
        }, timeUntilAlarm);
    }
}

// Add new function to play alarm sound
function playAlarmSound() {
    const sound = document.getElementById('alarmSound');
    sound.currentTime = 0;
    
    const playPromise = sound.play();
    if (playPromise !== undefined) {
        playPromise
            .then(() => {
                setTimeout(() => {
                    sound.pause();
                    sound.currentTime = 0;
                    alert('Alarm!');
                }, 3000); // Play sound for 3 seconds before showing alert
            })
            .catch(error => {
                console.log('Error playing alarm:', error);
                alert('Alarm! (Sound playback failed)');
            });
    }
}

// Function to handle sound upload
function handleSoundUpload(event) {
    const file = event.target.files[0];
    if (file) {
        // Validate file type
        const validAudioTypes = [
            'audio/mpeg',        // MP3
            'audio/wav',         // WAV
            'audio/ogg',         // OGG
            'audio/aac',         // AAC
            'audio/x-m4a',       // AAC/M4A
            'audio/mp4'          // M4A/AAC
        ];

        if (!validAudioTypes.includes(file.type)) {
            alert('Please upload a valid audio file (MP3, WAV, OGG, or AAC)');
            event.target.value = '';
            return;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            alert('Please upload a file smaller than 10MB');
            event.target.value = '';
            return;
        }

        const sound = document.getElementById('alarmSound');
        
        // Create object URL for preview
        const fileURL = URL.createObjectURL(file);
        sound.src = fileURL;

        // Test if the browser can play this format
        const playTest = sound.play();
        if (playTest !== undefined) {
            playTest.then(() => {
                sound.pause();
                sound.currentTime = 0;
                
                // If playable, store the sound
                const reader = new FileReader();
                reader.onload = function(e) {
                    try {
                        localStorage.setItem('customAlarmSound', e.target.result);
                        localStorage.setItem('customAlarmType', file.type);
                    } catch (e) {
                        if (e.name === 'QuotaExceededError') {
                            alert('The audio file is too large to save. The default sound will be used instead.');
                            resetToDefaultSound();
                        }
                    }
                };
                reader.readAsDataURL(file);
            }).catch(() => {
                alert('Your browser cannot play this audio format. Please try another file.');
                resetToDefaultSound();
                event.target.value = '';
            });
        }
    }
}

// Function to reset to default sound
function resetToDefaultSound() {
    const sound = document.getElementById('alarmSound');
    
    // Reset to the default audio element structure
    sound.innerHTML = `
        <source src="alarm-sound.mp3" type="audio/mpeg">
        Your browser does not support the audio element.
    `;
    
    // Clear stored custom sound
    localStorage.removeItem('customAlarmSound');
    localStorage.removeItem('customAlarmType');
}

// Function to test the current sound
function testSound() {
    const sound = document.getElementById('alarmSound');
    sound.currentTime = 0;
    
    const playPromise = sound.play();
    if (playPromise !== undefined) {
        playPromise
            .then(() => {
                setTimeout(() => {
                    sound.pause();
                    sound.currentTime = 0;
                }, 2000);
            })
            .catch(error => {
                alert('Error playing sound. Please try again.');
            });
    }
}

// Add these functions for countdown handling
function formatCountdown(milliseconds) {
    if (milliseconds < 0) return "Time's up!";
    
    const total_seconds = Math.floor(milliseconds / 1000);
    const days = Math.floor(total_seconds / (24 * 60 * 60));
    const hours = Math.floor((total_seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((total_seconds % (60 * 60)) / 60);
    const seconds = total_seconds % 60;

    let result = '';
    if (days > 0) result += `${days}d `;
    if (hours > 0 || days > 0) result += `${hours}h `;
    if (minutes > 0 || hours > 0 || days > 0) result += `${minutes}m `;
    result += `${seconds}s`;

    return result;
}

function updateCountdown(alarmId, endTime) {
    const countdownElement = document.getElementById(`countdown-${alarmId}`);
    if (!countdownElement) return;

    const updateTimer = () => {
        const timeLeft = endTime - Date.now();
        if (timeLeft <= 0) {
            clearInterval(timer);
            return;
        }
        countdownElement.textContent = formatCountdown(timeLeft);
    };

    const timer = setInterval(updateTimer, 1000);
    updateTimer(); // Initial update

    // Store the timer ID to clear it when alarm is deleted
    if (!window.alarmTimers) window.alarmTimers = {};
    window.alarmTimers[alarmId] = timer;
}

// Add this new function
function removeCustomSound() {
    const sound = document.getElementById('alarmSound');
    const fileInput = document.getElementById('customSound');
    
    // Clear the file input
    fileInput.value = '';
    
    // Reset to default sound
    resetToDefaultSound();
    
    // Show confirmation
    alert('Custom sound removed. Default alarm sound will be used.');
}

// Initialize the app
window.onload = () => {
    renderTasks();
    renderAlarms();
    
    // Load saved custom sound if exists
    const savedSound = localStorage.getItem('customAlarmSound');
    const savedType = localStorage.getItem('customAlarmType');
    if (savedSound && savedType) {
        const sound = document.getElementById('alarmSound');
        try {
            sound.src = savedSound;
            
            // Test if the saved sound is still playable
            const playTest = sound.play();
            if (playTest !== undefined) {
                playTest.then(() => {
                    sound.pause();
                    sound.currentTime = 0;
                }).catch(() => {
                    console.log('Saved sound format no longer supported');
                    resetToDefaultSound();
                });
            }
        } catch (e) {
            console.log('Error loading saved sound');
            resetToDefaultSound();
        }
    }
    
    // Start any saved alarms
    alarms.forEach(alarm => {
        if (alarm.time > Date.now()) {
            startAlarm(alarm);
        } else {
            deleteAlarm(alarm.id);
        }
    });
}; 