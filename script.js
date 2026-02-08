document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const newGoalInput = document.getElementById('newGoalInput');
    const addGoalButton = document.getElementById('addGoalButton');
    const goalList = document.getElementById('goalList');
    const goalPriority = document.getElementById('goalPriority');
    const goalTag = document.getElementById('goalTag');
    const goalDueTime = document.getElementById('goalDueTime');
    const quoteText = document.getElementById('quoteText');
    const quoteAuthor = document.getElementById('quoteAuthor');
    const darkModeToggle = document.getElementById('darkModeToggle');
    const progressChartCanvas = document.getElementById('progressChart');
    const timerDisplay = document.getElementById('timerDisplay');
    const startPauseButton = document.getElementById('startPauseButton');
    const resetButton = document.getElementById('resetButton');
    const workDurationInput = document.getElementById('workDurationInput');
    const breakDurationInput = document.getElementById('breakDurationInput');
    const applyTimerSettingsButton = document.getElementById('applyTimerSettings');

    let goals = [];
    let progressData = {
        labels: [], // Dates
        completedCounts: [], // Number of goals completed on that date
        totalCounts: [] // Number of goals tracked on that date
    };
    let chartInstance = null;

    // --- Dark Mode ---
    const applyDarkMode = (isDark) => {
        if (isDark) {
            document.body.classList.add('dark-mode');
            darkModeToggle.textContent = 'Toggle Light Mode';
        } else {
            document.body.classList.remove('dark-mode');
            darkModeToggle.textContent = 'Toggle Dark Mode';
        }
    };

    const toggleDarkMode = () => {
        const isDarkMode = document.body.classList.contains('dark-mode');
        applyDarkMode(!isDarkMode);
        localStorage.setItem('darkMode', JSON.stringify(!isDarkMode));
    };

    darkModeToggle.addEventListener('click', toggleDarkMode);

    // Load dark mode preference
    const loadDarkModePreference = () => {
        const preference = JSON.parse(localStorage.getItem('darkMode'));
        if (preference !== null) {
            applyDarkMode(preference);
        } else {
            // Optional: Detect system preference
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                applyDarkMode(true);
            }
        }
    };

    // --- Motivational Quote ---
    const fetchQuote = async () => {
        try {
            // Using a CORS proxy for ZenQuotes if direct access is blocked by browser
            // For development, you might need to set up your own proxy or use one like:
            // const response = await fetch('https://cors-anywhere.herokuapp.com/https://zenquotes.io/api/today');
            // For simplicity, we'll try direct fetch first. If it fails due to CORS, a proxy is needed.
            const response = await fetch('https://zenquotes.io/api/today');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (data && data.length > 0) {
                quoteText.textContent = data[0].q;
                quoteAuthor.textContent = `— ${data[0].a}`;
                localStorage.setItem('devTrackerQuote', JSON.stringify({
                    text: data[0].q,
                    author: data[0].a,
                    date: new Date().toISOString()
                }));
            } else {
                quoteText.textContent = "Keep pushing your limits.";
                quoteAuthor.textContent = "— DevTracker";
            }
        } catch (error) {
            console.error("Failed to fetch quote:", error);
            const cachedQuote = JSON.parse(localStorage.getItem('devTrackerQuote'));
            if (cachedQuote?.text) {
                quoteText.textContent = cachedQuote.text;
                quoteAuthor.textContent = `— ${cachedQuote.author || 'DevTracker'}`;
            } else {
                quoteText.textContent = "The best way to predict the future is to create it.";
                quoteAuthor.textContent = "— Peter Drucker (Fallback)";
            }
        }
    };

    // --- Goal Management ---
    const saveGoals = () => {
        localStorage.setItem('devTrackerGoals', JSON.stringify(goals));
    };

    const loadGoals = () => {
        const storedGoals = localStorage.getItem('devTrackerGoals');
        if (storedGoals) {
            goals = JSON.parse(storedGoals);
        }
        renderGoals();
    };

    const renderGoals = () => {
        goalList.innerHTML = ''; // Clear existing goals
        if (goals.length === 0) {
            goalList.innerHTML = '<p class="text-gray-500">No goals added for today. Add one above!</p>';
            return;
        }
        goals.forEach((goal, index) => {
            const li = document.createElement('li');
            li.className = `flex items-center justify-between p-3 rounded-md ${goal.completed ? 'bg-green-50' : 'bg-gray-50'} dark:bg-gray-700`;
            if (goal.completed) {
                li.classList.add('completed');
            }

            const goalContent = document.createElement('div');
            goalContent.className = 'flex flex-col sm:flex-row sm:items-center gap-2';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'form-checkbox h-5 w-5 text-blue-600 rounded mr-3 cursor-pointer';
            checkbox.checked = goal.completed;
            checkbox.addEventListener('change', () => toggleGoalCompletion(index));

            const span = document.createElement('span');
            span.textContent = goal.text;
            span.className = `text-gray-700 dark:text-gray-300 ${goal.completed ? 'line-through' : ''}`;

            const meta = document.createElement('div');
            meta.className = 'flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400';

            const priorityBadge = document.createElement('span');
            priorityBadge.className = `px-2 py-1 rounded-full ${goal.priority === 'high' ? 'bg-red-100 text-red-700' : goal.priority === 'low' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`;
            priorityBadge.textContent = `${goal.priority.charAt(0).toUpperCase() + goal.priority.slice(1)} priority`;

            const tagBadge = document.createElement('span');
            tagBadge.className = 'px-2 py-1 rounded-full bg-blue-100 text-blue-700';
            tagBadge.textContent = goal.tag || 'General';

            const dueTimeBadge = document.createElement('span');
            dueTimeBadge.className = 'px-2 py-1 rounded-full bg-gray-200 text-gray-700';
            dueTimeBadge.textContent = goal.dueTime ? `Due ${goal.dueTime}` : 'No due time';

            meta.appendChild(priorityBadge);
            meta.appendChild(tagBadge);
            meta.appendChild(dueTimeBadge);

            const goalTextWrapper = document.createElement('div');
            goalTextWrapper.className = 'flex flex-col';
            goalTextWrapper.appendChild(span);
            goalTextWrapper.appendChild(meta);

            const checkboxWrapper = document.createElement('div');
            checkboxWrapper.className = 'flex items-start';
            checkboxWrapper.appendChild(checkbox);

            goalContent.appendChild(checkboxWrapper);
            goalContent.appendChild(goalTextWrapper);

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.className = 'text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm';
            deleteButton.addEventListener('click', () => deleteGoal(index));

            li.appendChild(goalContent);
            li.appendChild(deleteButton);
            goalList.appendChild(li);
        });
        updateProgressForToday(); // Update progress whenever goals are re-rendered
    };

    const addGoal = () => {
        const goalText = newGoalInput.value.trim();
        if (goalText === '') {
            alert('Please enter a goal description.');
            return;
        }
        goals.push({
            text: goalText,
            completed: false,
            dateAdded: new Date().toISOString().split('T')[0],
            priority: goalPriority.value,
            tag: goalTag.value.trim() || 'General',
            dueTime: goalDueTime.value || ''
        });
        newGoalInput.value = ''; // Clear input
        goalTag.value = '';
        goalDueTime.value = '';
        saveGoals();
        renderGoals();
    };

    const deleteGoal = (index) => {
        goals.splice(index, 1);
        saveGoals();
        renderGoals();
    };

    const toggleGoalCompletion = (index) => {
        goals[index].completed = !goals[index].completed;
        saveGoals();
        renderGoals(); // Re-render to update styles and potentially the chart
    };

    addGoalButton.addEventListener('click', addGoal);
    newGoalInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            addGoal();
        }
    });

    // --- Progress History & Chart ---
    const loadProgressData = () => {
        const storedProgress = localStorage.getItem('devTrackerProgress');
        if (storedProgress) {
            progressData = JSON.parse(storedProgress);
        }
        // Ensure today's date is in labels if not present
        const today = new Date().toISOString().split('T')[0];
        if (!progressData.labels.includes(today)) {
            progressData.labels.push(today);
            progressData.completedCounts.push(0); // Initialize with 0 completed
            progressData.totalCounts.push(0); // Initialize with 0 total
             // Keep data for last 7 days for example
            if (progressData.labels.length > 7) {
                progressData.labels.shift();
                progressData.completedCounts.shift();
                progressData.totalCounts.shift();
            }
        }
    };

    const saveProgressData = () => {
        localStorage.setItem('devTrackerProgress', JSON.stringify(progressData));
    };
    
    const updateProgressForToday = () => {
        const today = new Date().toISOString().split('T')[0];
        const todayGoals = goals.filter(goal => goal.dateAdded === today || !goal.dateAdded); // Consider goals without dateAdded as today's
        const completedToday = todayGoals.filter(goal => goal.completed).length;
        const totalToday = todayGoals.length;

        const todayIndex = progressData.labels.indexOf(today);
        if (todayIndex !== -1) {
            progressData.completedCounts[todayIndex] = completedToday;
            progressData.totalCounts[todayIndex] = totalToday;
        } else {
            // This case should be handled by loadProgressData, but as a fallback:
            progressData.labels.push(today);
            progressData.completedCounts.push(completedToday);
            progressData.totalCounts.push(totalToday);
            // Trim if too long
            if (progressData.labels.length > 7) {
                progressData.labels.shift();
                progressData.completedCounts.shift();
                progressData.totalCounts.shift();
            }
        }
        saveProgressData();
        renderProgressChart();
    };

    const renderProgressChart = () => {
        if (chartInstance) {
            chartInstance.destroy(); // Destroy previous chart instance to avoid conflicts
        }
        const ctx = progressChartCanvas.getContext('2d');
        chartInstance = new Chart(ctx, {
            type: 'line', // or 'bar'
            data: {
                labels: progressData.labels,
                datasets: [{
                    label: 'Completed Goals',
                    data: progressData.completedCounts,
                    backgroundColor: 'rgba(54, 162, 235, 0.2)', // Blue area
                    borderColor: 'rgba(54, 162, 235, 1)', // Blue line
                    borderWidth: 2,
                    tension: 0.1, // Makes the line slightly curved
                    fill: true
                }, {
                    label: 'Total Goals',
                    data: progressData.totalCounts,
                    backgroundColor: 'rgba(148, 163, 184, 0.2)',
                    borderColor: 'rgba(148, 163, 184, 1)',
                    borderWidth: 2,
                    tension: 0.1,
                    fill: true
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1 // Ensure y-axis shows whole numbers for counts
                        }
                    }
                },
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                    }
                }
            }
        });
    };


    // --- Pomodoro Timer ---
    let timerInterval = null;
    let timeLeft = 25 * 60; // 25 minutes in seconds
    let isPaused = true;
    let workDuration = 25 * 60;
    let breakDuration = 5 * 60;
    let isWorkSession = true; // Start with a work session
    const timerSettingsKey = 'devTrackerTimerSettings';

    const updateTimerDisplay = () => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const startTimer = () => {
        if (isPaused) {
            isPaused = false;
            startPauseButton.textContent = 'Pause';
            startPauseButton.classList.remove('bg-green-500', 'hover:bg-green-600');
            startPauseButton.classList.add('bg-yellow-500', 'hover:bg-yellow-600');

            timerInterval = setInterval(() => {
                timeLeft--;
                updateTimerDisplay();

                if (timeLeft < 0) {
                    clearInterval(timerInterval);
                    // Switch session type
                    isWorkSession = !isWorkSession;
                    timeLeft = isWorkSession ? workDuration : breakDuration;
                    alert(isWorkSession ? "Break over! Time for work." : "Work session over! Time for a break.");
                    resetTimer(); // Resets to the new session type and pauses
                    startTimer(); // Automatically start the next session or prompt user
                }
            }, 1000);
        }
    };

    const pauseTimer = () => {
        if (!isPaused) {
            isPaused = true;
            clearInterval(timerInterval);
            startPauseButton.textContent = 'Start';
            startPauseButton.classList.remove('bg-yellow-500', 'hover:bg-yellow-600');
            startPauseButton.classList.add('bg-green-500', 'hover:bg-green-600');
        }
    };

    const resetTimer = () => {
        clearInterval(timerInterval);
        isPaused = true;
        timeLeft = isWorkSession ? workDuration : breakDuration; // Reset to current session type's duration
        updateTimerDisplay();
        startPauseButton.textContent = 'Start';
        startPauseButton.classList.remove('bg-yellow-500', 'hover:bg-yellow-600');
        startPauseButton.classList.add('bg-green-500', 'hover:bg-green-600');
    };

    startPauseButton.addEventListener('click', () => {
        if (isPaused) {
            startTimer();
        } else {
            pauseTimer();
        }
    });

    resetButton.addEventListener('click', () => {
        isWorkSession = true; // Always reset to a work session
        resetTimer();
    });

    const applyTimerSettings = (workMinutes, breakMinutes, shouldSave = true) => {
        workDuration = workMinutes * 60;
        breakDuration = breakMinutes * 60;
        timeLeft = isWorkSession ? workDuration : breakDuration;
        updateTimerDisplay();
        if (shouldSave) {
            localStorage.setItem(timerSettingsKey, JSON.stringify({
                workMinutes,
                breakMinutes
            }));
        }
    };

    const loadTimerSettings = () => {
        const savedSettings = JSON.parse(localStorage.getItem(timerSettingsKey));
        if (savedSettings?.workMinutes && savedSettings?.breakMinutes) {
            workDurationInput.value = savedSettings.workMinutes;
            breakDurationInput.value = savedSettings.breakMinutes;
            applyTimerSettings(savedSettings.workMinutes, savedSettings.breakMinutes, false);
        }
    };

    applyTimerSettingsButton.addEventListener('click', () => {
        const workMinutes = Number(workDurationInput.value);
        const breakMinutes = Number(breakDurationInput.value);
        if (!workMinutes || !breakMinutes) {
            alert('Please enter valid work and break durations.');
            return;
        }
        pauseTimer();
        isWorkSession = true;
        applyTimerSettings(workMinutes, breakMinutes);
    });

    // --- Initial Load ---
    const initializeApp = () => {
        loadDarkModePreference();
        fetchQuote();
        loadGoals(); // This will also call renderGoals
        loadProgressData(); // Load historical progress
        updateProgressForToday(); // Calculate today's progress and render chart
        loadTimerSettings();
        updateTimerDisplay(); // Initialize Pomodoro display
    };

    initializeApp();
});
