class DailyTodoApp {
    constructor() {
        this.tasks = {};
        this.completedCount = 0;
        this.totalTasks = 12;
        this.userId = this.generateUserId();

        this.initializeElements();
        this.bindEvents();
        this.setupFireworks();
        this.initializeFirestore();
    }

    generateUserId() {
        let userId = localStorage.getItem('dailyTodoUserId');
        if (!userId) {
            userId = 'user_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('dailyTodoUserId', userId);
        }
        return userId;
    }

    async initializeFirestore() {
        if (typeof window.db === 'undefined') {
            console.log('Firebase not configured, falling back to localStorage');
            this.tasks = this.loadTasksFromLocalStorage();
            this.updateProgress();
            this.loadTaskStates();
            this.checkForNewDay();
            return;
        }

        try {
            await this.loadTasksFromFirestore();
            this.updateProgress();
            this.loadTaskStates();
            this.checkForNewDay();
        } catch (error) {
            console.error('Firestore error, falling back to localStorage:', error);
            this.tasks = this.loadTasksFromLocalStorage();
            this.updateProgress();
            this.loadTaskStates();
            this.checkForNewDay();
        }
    }

    initializeElements() {
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        this.resetBtn = document.getElementById('resetBtn');
        this.fireworksCanvas = document.getElementById('fireworksCanvas');
        this.ctx = this.fireworksCanvas.getContext('2d');

        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    bindEvents() {
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('task-checkbox')) {
                this.handleTaskComplete(e.target);
            }
        });

        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('task-input')) {
                this.autoResizeTextarea(e.target);
                this.saveTaskText(e.target);
            }
        });

        this.resetBtn.addEventListener('click', () => this.resetDay());
    }

    handleTaskComplete(checkbox) {
        const taskElement = checkbox.closest('.task');
        const taskId = checkbox.id;
        const isCompleted = checkbox.checked;

        if (isCompleted) {
            this.completeTask(taskElement, taskId);
        } else {
            this.uncompleteTask(taskElement, taskId);
        }

        this.updateProgress();
        this.saveTasks();
    }

    completeTask(taskElement, taskId) {
        taskElement.classList.add('completed', 'celebration');

        setTimeout(() => {
            taskElement.classList.remove('completed', 'celebration');
        }, 1000);

        this.playApplauseSound();
        this.triggerFireworks(taskElement);

        this.tasks[taskId] = { ...this.tasks[taskId], completed: true };
        this.completedCount++;
    }

    uncompleteTask(taskElement, taskId) {
        this.tasks[taskId] = { ...this.tasks[taskId], completed: false };
        this.completedCount--;
    }

    playApplauseSound() {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();

        // Create multiple noise bursts to simulate applause
        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                const bufferSize = audioContext.sampleRate * 0.1; // 0.1 second
                const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
                const data = buffer.getChannelData(0);

                // Generate white noise for clapping sound
                for (let j = 0; j < bufferSize; j++) {
                    data[j] = (Math.random() * 2 - 1) * Math.pow(1 - j / bufferSize, 2);
                }

                const source = audioContext.createBufferSource();
                const gainNode = audioContext.createGain();
                const filter = audioContext.createBiquadFilter();

                source.buffer = buffer;
                filter.type = 'bandpass';
                filter.frequency.value = 1000 + Math.random() * 2000;
                filter.Q.value = 1;

                source.connect(filter);
                filter.connect(gainNode);
                gainNode.connect(audioContext.destination);

                const volume = 0.1 * (1 - i / 8) * (0.5 + Math.random() * 0.5);
                gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);

                source.start();
                source.stop(audioContext.currentTime + 0.1);
            }, i * 30 + Math.random() * 20);
        }

        // Add a cheerful ding at the end
        setTimeout(() => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.1);

            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);

            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.3);
        }, 200);
    }

    triggerFireworks(taskElement) {
        const rect = taskElement.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        this.createFirework(centerX, centerY);
    }

    setupFireworks() {
        this.fireworks = [];
        this.particles = [];
    }

    resizeCanvas() {
        this.fireworksCanvas.width = window.innerWidth;
        this.fireworksCanvas.height = window.innerHeight;
    }

    createFirework(x, y) {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b', '#6c5ce7'];
        const particleCount = 30;

        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const velocity = 2 + Math.random() * 3;

            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity,
                color: colors[Math.floor(Math.random() * colors.length)],
                life: 1,
                decay: 0.02 + Math.random() * 0.02
            });
        }

        this.animateFireworks();
    }

    animateFireworks() {
        this.ctx = this.fireworksCanvas.getContext('2d');
        this.ctx.clearRect(0, 0, this.fireworksCanvas.width, this.fireworksCanvas.height);

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];

            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.1;
            particle.life -= particle.decay;

            this.ctx.save();
            this.ctx.globalAlpha = particle.life;
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();

            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }

        if (this.particles.length > 0) {
            requestAnimationFrame(() => this.animateFireworks());
        }
    }

    updateProgress() {
        this.completedCount = Object.values(this.tasks).filter(task => task.completed).length;
        const percentage = (this.completedCount / this.totalTasks) * 100;

        this.progressFill.style.width = `${percentage}%`;
        this.progressText.textContent = `${this.completedCount}/${this.totalTasks} completed`;

        if (this.completedCount === this.totalTasks) {
            this.celebrateFullCompletion();
        }
    }

    celebrateFullCompletion() {
        document.querySelector('header').classList.add('celebration');

        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const x = Math.random() * window.innerWidth;
                const y = Math.random() * window.innerHeight * 0.5;
                this.createFirework(x, y);
            }, i * 300);
        }

        setTimeout(() => {
            document.querySelector('header').classList.remove('celebration');
        }, 2000);
    }

    autoResizeTextarea(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
    }

    saveTaskText(input) {
        const taskId = input.dataset.task;
        if (!this.tasks[taskId]) {
            this.tasks[taskId] = { text: '', completed: false };
        }
        this.tasks[taskId].text = input.value;
        this.saveTasks();
    }

    async loadTasksFromFirestore() {
        if (!window.db) return {};

        const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

        const today = new Date().toDateString();
        const docRef = doc(window.db, 'dailyTodos', `${this.userId}_${today}`);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            this.tasks = docSnap.data().tasks || {};
        } else {
            this.tasks = {};
        }
    }

    async saveTasksToFirestore() {
        if (!window.db) {
            this.saveTasksToLocalStorage();
            return;
        }

        try {
            const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

            const today = new Date().toDateString();
            const docRef = doc(window.db, 'dailyTodos', `${this.userId}_${today}`);

            await setDoc(docRef, {
                tasks: this.tasks,
                lastUpdated: new Date(),
                userId: this.userId
            });
        } catch (error) {
            console.error('Error saving to Firestore:', error);
            this.saveTasksToLocalStorage();
        }
    }

    loadTasksFromLocalStorage() {
        const saved = localStorage.getItem('dailyTodoTasks');
        return saved ? JSON.parse(saved) : {};
    }

    saveTasksToLocalStorage() {
        localStorage.setItem('dailyTodoTasks', JSON.stringify(this.tasks));
        localStorage.setItem('dailyTodoLastSave', new Date().toDateString());
    }

    async saveTasks() {
        await this.saveTasksToFirestore();
    }

    loadTaskStates() {
        document.querySelectorAll('.task-input').forEach(input => {
            const taskId = input.dataset.task;
            if (this.tasks[taskId]) {
                input.value = this.tasks[taskId].text || '';
                this.autoResizeTextarea(input);

                const checkbox = document.getElementById(taskId);
                if (checkbox) {
                    checkbox.checked = this.tasks[taskId].completed || false;
                }
            }
        });
    }

    checkForNewDay() {
        const lastSave = localStorage.getItem('dailyTodoLastSave');
        const today = new Date().toDateString();

        if (lastSave && lastSave !== today) {
            this.resetDay(false);
        }
    }

    resetDay(showConfirmation = true) {
        if (showConfirmation && !confirm('Are you sure you want to reset all tasks for today?')) {
            return;
        }

        this.tasks = {};
        this.completedCount = 0;

        document.querySelectorAll('.task-input').forEach(input => {
            input.value = '';
        });

        document.querySelectorAll('.task-checkbox').forEach(checkbox => {
            checkbox.checked = false;
        });

        this.updateProgress();
        this.saveTasks();

        document.querySelector('.container').classList.add('celebration');
        setTimeout(() => {
            document.querySelector('.container').classList.remove('celebration');
        }, 1000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new DailyTodoApp();
});