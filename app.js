/**
 * Smart Mock Test – Dynamic Quiz Application
 * Core Application Engine & State Controller
 */

(function () {
  'use strict';

  // =========================================================================
  // State Management
  // =========================================================================
  const EXAM_CONFIG = {
    totalQuestions: 10,
    timeDurationSeconds: 600, // 10 minutes
    passingPercentage: 60,
    marksPerQuestion: 1.0,
    negativeMarking: 0.0
  };

  const state = {
    candidate: {
      name: "Akshitha G M",
      roll: "CS-2026-EX07",
      subject: "CS-701: Computer Science, Python & AI"
    },
    currentQuestionIndex: 0,
    // Each item: { selectedOption: null | number, isMarkedForReview: boolean, isVisited: boolean }
    responses: [],
    timer: {
      remainingSeconds: EXAM_CONFIG.timeDurationSeconds,
      intervalId: null,
      isRunning: false
    },
    isSubmitted: false,
    soundEnabled: true,
    startTime: null,
    endTime: null
  };

  // Web Audio Context for authentic tactile click sound without external audio files
  let audioCtx = null;
  function playClickSound() {
    if (!state.soundEnabled) return;
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.05);
    } catch (e) {
      // Audio not supported or blocked
    }
  }

  // =========================================================================
  // DOM Elements Cache
  // =========================================================================
  const views = {
    home: document.getElementById('view-home'),
    instructions: document.getElementById('view-instructions'),
    quiz: document.getElementById('view-quiz'),
    result: document.getElementById('view-result')
  };

  const header = {
    timerContainer: document.getElementById('header-timer-container'),
    timerBox: document.getElementById('timer-box'),
    timerDisplay: document.getElementById('timer-display'),
    systemTime: document.getElementById('system-time'),
    navCandidateName: document.getElementById('nav-candidate-name'),
    btnSoundToggle: document.getElementById('btn-sound-toggle'),
    iconSoundOn: document.getElementById('icon-sound-on')
  };

  const homeElements = {
    inputName: document.getElementById('input-candidate-name'),
    inputRoll: document.getElementById('input-candidate-roll'),
    btnStartTest: document.getElementById('btn-start-test')
  };

  const instructionElements = {
    chkDeclaration: document.getElementById('chk-declaration'),
    btnBackToHome: document.getElementById('btn-back-to-home'),
    btnProceedExam: document.getElementById('btn-proceed-exam')
  };

  const quizElements = {
    progressText: document.getElementById('progress-text'),
    progressPercent: document.getElementById('progress-percent'),
    progressBarFill: document.getElementById('progress-bar-fill'),
    btnFullscreen: document.getElementById('btn-fullscreen-toggle'),
    qNumberBadge: document.getElementById('q-number-badge'),
    qCategoryChip: document.getElementById('q-category-chip'),
    qDifficultyChip: document.getElementById('q-difficulty-chip'),
    questionText: document.getElementById('question-text'),
    codeSnippetContainer: document.getElementById('code-snippet-container'),
    codeSnippetBody: document.getElementById('code-snippet-body'),
    optionsContainer: document.getElementById('options-container'),
    // Action buttons
    btnMarkReview: document.getElementById('btn-mark-review'),
    btnClearResponse: document.getElementById('btn-clear-response'),
    btnPrevQuestion: document.getElementById('btn-prev-question'),
    btnNextQuestion: document.getElementById('btn-next-question'),
    btnOpenSubmitModal: document.getElementById('btn-open-submit-modal'),
    btnSidebarSubmit: document.getElementById('btn-sidebar-submit'),
    // Palette elements
    sidebarCandidateName: document.getElementById('sidebar-candidate-name'),
    sidebarCandidateRoll: document.getElementById('sidebar-candidate-roll'),
    countAnswered: document.getElementById('count-answered'),
    countNotAnswered: document.getElementById('count-not-answered'),
    countMarked: document.getElementById('count-marked'),
    countNotVisited: document.getElementById('count-not-visited'),
    questionNumbersGrid: document.getElementById('question-numbers-grid')
  };

  const modalElements = {
    modal: document.getElementById('modal-submit-confirmation'),
    countAnswered: document.getElementById('modal-count-answered'),
    countUnanswered: document.getElementById('modal-count-unanswered'),
    countMarked: document.getElementById('modal-count-marked'),
    timeRemaining: document.getElementById('modal-time-remaining'),
    btnCancel: document.getElementById('btn-modal-cancel'),
    btnConfirmSubmit: document.getElementById('btn-modal-confirm-submit')
  };

  const resultElements = {
    candidateName: document.getElementById('result-candidate-name'),
    candidateRoll: document.getElementById('result-candidate-roll'),
    timestamp: document.getElementById('result-timestamp'),
    durationUsed: document.getElementById('result-duration-used'),
    scoreRingCircle: document.getElementById('score-ring-circle'),
    percentageDisplay: document.getElementById('score-percentage-display'),
    numericDisplay: document.getElementById('score-numeric-display'),
    gradeBadge: document.getElementById('grade-badge'),
    performanceMsg: document.getElementById('performance-feedback-msg'),
    kpiCorrect: document.getElementById('kpi-correct'),
    kpiWrong: document.getElementById('kpi-wrong'),
    kpiUnanswered: document.getElementById('kpi-unanswered'),
    kpiTimeSpent: document.getElementById('kpi-time-spent'),
    recommendationText: document.getElementById('recommendation-text'),
    reviewCardsList: document.getElementById('review-cards-list'),
    btnPrintScorecard: document.getElementById('btn-print-scorecard'),
    btnRestartExam: document.getElementById('btn-restart-exam'),
    btnBottomPrint: document.getElementById('btn-bottom-print'),
    btnBottomRestart: document.getElementById('btn-bottom-restart'),
    filterTabs: document.querySelectorAll('.filter-tab-btn')
  };

  // =========================================================================
  // Initialization & Helpers
  // =========================================================================
  function initApp() {
    initResponses();
    startSystemClock();
    setupEventListeners();
    updateCandidateHeader();
  }

  function initResponses() {
    state.responses = QUIZ_QUESTIONS.map(() => ({
      selectedOption: null,
      isMarkedForReview: false,
      isVisited: false
    }));
    state.currentQuestionIndex = 0;
    state.timer.remainingSeconds = EXAM_CONFIG.timeDurationSeconds;
    state.isSubmitted = false;
  }

  function startSystemClock() {
    function updateClock() {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
      if (header.systemTime) {
        header.systemTime.textContent = timeStr;
      }
    }
    updateClock();
    setInterval(updateClock, 1000);
  }

  function updateCandidateHeader() {
    const name = homeElements.inputName.value.trim() || "Akshitha G M";
    const roll = homeElements.inputRoll.value.trim() || "CS-2026-EX07";
    state.candidate.name = name;
    state.candidate.roll = roll;

    header.navCandidateName.textContent = name;
    quizElements.sidebarCandidateName.textContent = name;
    quizElements.sidebarCandidateRoll.textContent = roll;
    resultElements.candidateName.textContent = name;
    resultElements.candidateRoll.textContent = roll;
  }

  function switchView(targetViewKey) {
    Object.keys(views).forEach(key => {
      if (key === targetViewKey) {
        views[key].classList.add('active');
      } else {
        views[key].classList.remove('active');
      }
    });

    // Control header timer visibility
    if (targetViewKey === 'quiz') {
      header.timerContainer.style.display = 'flex';
    } else {
      header.timerContainer.style.display = 'none';
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // =========================================================================
  // Countdown Timer System
  // =========================================================================
  function startExamTimer() {
    if (state.timer.intervalId) {
      clearInterval(state.timer.intervalId);
    }
    state.timer.isRunning = true;
    state.startTime = new Date();

    updateTimerDisplay();

    state.timer.intervalId = setInterval(() => {
      if (state.timer.remainingSeconds > 0) {
        state.timer.remainingSeconds--;
        updateTimerDisplay();
      } else {
        // Time expired! Auto-submit
        clearInterval(state.timer.intervalId);
        state.timer.isRunning = false;
        alert("Time limit reached! The examination is now being automatically submitted.");
        executeSubmission();
      }
    }, 1000);
  }

  function stopExamTimer() {
    if (state.timer.intervalId) {
      clearInterval(state.timer.intervalId);
    }
    state.timer.isRunning = false;
    state.endTime = new Date();
  }

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  function updateTimerDisplay() {
    const formatted = formatTime(state.timer.remainingSeconds);
    header.timerDisplay.textContent = formatted;

    // Visual urgency indicators
    if (state.timer.remainingSeconds <= 60) {
      header.timerBox.classList.add('timer-danger');
      header.timerBox.classList.remove('timer-warning');
    } else if (state.timer.remainingSeconds <= 180) {
      header.timerBox.classList.add('timer-warning');
      header.timerBox.classList.remove('timer-danger');
    } else {
      header.timerBox.classList.remove('timer-warning', 'timer-danger');
    }
  }

  // =========================================================================
  // Question Rendering & Navigation
  // =========================================================================
  function loadQuestion(index) {
    if (index < 0 || index >= QUIZ_QUESTIONS.length) return;

    state.currentQuestionIndex = index;
    const q = QUIZ_QUESTIONS[index];
    const resp = state.responses[index];

    // Mark as visited
    resp.isVisited = true;

    // Update Question Meta Header
    quizElements.qNumberBadge.textContent = `Question ${String(index + 1).padStart(2, '0')}`;
    quizElements.qCategoryChip.textContent = q.category;
    quizElements.qDifficultyChip.textContent = q.difficulty;
    quizElements.questionText.textContent = q.question;

    // Handle Code Snippet
    if (q.codeSnippet) {
      quizElements.codeSnippetBody.textContent = q.codeSnippet;
      quizElements.codeSnippetContainer.style.display = 'block';
    } else {
      quizElements.codeSnippetContainer.style.display = 'none';
    }

    // Render Options
    renderOptions(q, resp);

    // Update Progress Bar
    const progressPercent = Math.round(((index + 1) / QUIZ_QUESTIONS.length) * 100);
    quizElements.progressText.textContent = `Question ${index + 1} of ${QUIZ_QUESTIONS.length}`;
    quizElements.progressPercent.textContent = `${progressPercent}% Completed`;
    quizElements.progressBarFill.style.width = `${progressPercent}%`;

    // Update Previous / Next Button States
    quizElements.btnPrevQuestion.disabled = (index === 0);
    if (index === QUIZ_QUESTIONS.length - 1) {
      quizElements.btnNextQuestion.innerHTML = `<span>Save & Finish</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>`;
    } else {
      quizElements.btnNextQuestion.innerHTML = `<span>Save & Next</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>`;
    }

    // Refresh Question Palette Matrix and Counters
    updateQuestionPalette();
  }

  function renderOptions(question, response) {
    const letters = ['A', 'B', 'C', 'D'];
    quizElements.optionsContainer.innerHTML = '';

    question.options.forEach((optText, optIndex) => {
      const card = document.createElement('div');
      card.className = 'option-card';
      if (response.selectedOption === optIndex) {
        card.classList.add('selected');
      }

      card.innerHTML = `
        <div class="option-letter-badge">${letters[optIndex]}</div>
        <div class="option-text">${escapeHtml(optText)}</div>
      `;

      card.addEventListener('click', () => {
        playClickSound();
        selectOption(optIndex);
      });

      quizElements.optionsContainer.appendChild(card);
    });
  }

  function selectOption(optionIndex) {
    const currentResp = state.responses[state.currentQuestionIndex];
    currentResp.selectedOption = optionIndex;

    // Refresh option cards visual selected state
    const cards = quizElements.optionsContainer.querySelectorAll('.option-card');
    cards.forEach((c, idx) => {
      if (idx === optionIndex) {
        c.classList.add('selected');
      } else {
        c.classList.remove('selected');
      }
    });

    updateQuestionPalette();
  }

  function clearCurrentResponse() {
    playClickSound();
    const currentResp = state.responses[state.currentQuestionIndex];
    currentResp.selectedOption = null;

    const cards = quizElements.optionsContainer.querySelectorAll('.option-card');
    cards.forEach(c => c.classList.remove('selected'));

    updateQuestionPalette();
  }

  function markCurrentForReviewAndNext() {
    playClickSound();
    const currentResp = state.responses[state.currentQuestionIndex];
    currentResp.isMarkedForReview = true;

    updateQuestionPalette();
    advanceToNextQuestion();
  }

  function advanceToNextQuestion() {
    if (state.currentQuestionIndex < QUIZ_QUESTIONS.length - 1) {
      loadQuestion(state.currentQuestionIndex + 1);
    } else {
      // Reached the end: prompt submission modal
      openSubmitModal();
    }
  }

  function goToPreviousQuestion() {
    if (state.currentQuestionIndex > 0) {
      loadQuestion(state.currentQuestionIndex - 1);
    }
  }

  // =========================================================================
  // Question Palette Matrix & Counters
  // =========================================================================
  function updateQuestionPalette() {
    let answered = 0;
    let notAnswered = 0;
    let marked = 0;
    let notVisited = 0;

    quizElements.questionNumbersGrid.innerHTML = '';

    QUIZ_QUESTIONS.forEach((q, idx) => {
      const resp = state.responses[idx];
      const isCurrent = (idx === state.currentQuestionIndex);
      let statusClass = 'status-not-visited';

      if (!resp.isVisited) {
        notVisited++;
        statusClass = 'status-not-visited';
      } else if (resp.selectedOption !== null && resp.isMarkedForReview) {
        marked++;
        statusClass = 'status-answered-marked';
      } else if (resp.isMarkedForReview) {
        marked++;
        statusClass = 'status-marked';
      } else if (resp.selectedOption !== null) {
        answered++;
        statusClass = 'status-answered';
      } else {
        notAnswered++;
        statusClass = 'status-not-answered';
      }

      const numBtn = document.createElement('button');
      numBtn.type = 'button';
      numBtn.className = `palette-num-btn ${statusClass} ${isCurrent ? 'active-current' : ''}`;
      numBtn.textContent = idx + 1;
      numBtn.title = `Jump to Question ${idx + 1}`;

      numBtn.addEventListener('click', () => {
        playClickSound();
        loadQuestion(idx);
      });

      quizElements.questionNumbersGrid.appendChild(numBtn);
    });

    // Update Counters
    quizElements.countAnswered.textContent = answered;
    quizElements.countNotAnswered.textContent = notAnswered;
    quizElements.countMarked.textContent = marked;
    quizElements.countNotVisited.textContent = notVisited;
  }

  // =========================================================================
  // Submit Confirmation Modal
  // =========================================================================
  function openSubmitModal() {
    playClickSound();
    let answered = 0;
    let marked = 0;
    let unanswered = 0;

    state.responses.forEach(r => {
      if (r.selectedOption !== null) {
        answered++;
      } else {
        unanswered++;
      }
      if (r.isMarkedForReview) {
        marked++;
      }
    });

    modalElements.countAnswered.textContent = answered;
    modalElements.countUnanswered.textContent = unanswered;
    modalElements.countMarked.textContent = marked;
    modalElements.timeRemaining.textContent = formatTime(state.timer.remainingSeconds);

    modalElements.modal.style.display = 'flex';
  }

  function closeSubmitModal() {
    playClickSound();
    modalElements.modal.style.display = 'none';
  }

  function executeSubmission() {
    closeSubmitModal();
    stopExamTimer();
    state.isSubmitted = true;

    calculateAndRenderResults();
    switchView('result');
  }

  // =========================================================================
  // Result Calculation & Detailed Solution Review
  // =========================================================================
  function calculateAndRenderResults() {
    let correctCount = 0;
    let wrongCount = 0;
    let unansweredCount = 0;

    QUIZ_QUESTIONS.forEach((q, idx) => {
      const resp = state.responses[idx];
      if (resp.selectedOption === null) {
        unansweredCount++;
      } else if (resp.selectedOption === q.correctAnswer) {
        correctCount++;
      } else {
        wrongCount++;
      }
    });

    const score = correctCount * EXAM_CONFIG.marksPerQuestion;
    const totalMarks = QUIZ_QUESTIONS.length * EXAM_CONFIG.marksPerQuestion;
    const percentage = Math.round((score / totalMarks) * 100);

    // Compute Duration Used
    const timeUsedSeconds = EXAM_CONFIG.timeDurationSeconds - state.timer.remainingSeconds;
    const durationFormatted = formatTime(timeUsedSeconds);

    // Update Result Metadata
    const now = new Date();
    resultElements.timestamp.textContent = now.toLocaleDateString() + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    resultElements.durationUsed.textContent = `${durationFormatted} Mins`;

    // Numerical and KPI cards
    resultElements.numericDisplay.textContent = score;
    resultElements.kpiCorrect.textContent = correctCount;
    resultElements.kpiWrong.textContent = wrongCount;
    resultElements.kpiUnanswered.textContent = unansweredCount;
    resultElements.kpiTimeSpent.textContent = durationFormatted;

    // SVG Circular Gauge Animation
    animateScoreGauge(percentage);

    // Grade and Performance Feedback
    updatePerformanceFeedback(percentage, score);

    // Build Detailed Question Review Cards
    renderReviewCards('all');
  }

  function animateScoreGauge(percentage) {
    const circumference = 2 * Math.PI * 76; // r = 76 => ~477.5
    const offset = circumference - (percentage / 100) * circumference;

    resultElements.scoreRingCircle.style.strokeDasharray = `${circumference} ${circumference}`;
    resultElements.scoreRingCircle.style.strokeDashoffset = circumference;

    // Trigger animation via timeout
    setTimeout(() => {
      resultElements.scoreRingCircle.style.strokeDashoffset = offset;
      if (percentage >= 80) {
        resultElements.scoreRingCircle.style.stroke = '#10b981'; // Emerald
      } else if (percentage >= 60) {
        resultElements.scoreRingCircle.style.stroke = '#3b82f6'; // Blue
      } else if (percentage >= 40) {
        resultElements.scoreRingCircle.style.stroke = '#f59e0b'; // Amber
      } else {
        resultElements.scoreRingCircle.style.stroke = '#f43f5e'; // Rose
      }
    }, 150);

    // Animate percentage number counter
    let currentVal = 0;
    const stepTime = Math.max(10, Math.floor(1000 / (percentage || 1)));
    const counterTimer = setInterval(() => {
      if (currentVal >= percentage) {
        resultElements.percentageDisplay.textContent = `${percentage}%`;
        clearInterval(counterTimer);
      } else {
        currentVal++;
        resultElements.percentageDisplay.textContent = `${currentVal}%`;
      }
    }, stepTime);
  }

  function updatePerformanceFeedback(percentage, score) {
    const gradeBadge = resultElements.gradeBadge;
    const msg = resultElements.performanceMsg;
    const rec = resultElements.recommendationText;

    if (percentage >= 90) {
      gradeBadge.className = 'grade-badge grade-pass';
      gradeBadge.textContent = 'GRADE A+ • OUTSTANDING';
      msg.textContent = 'Phenomenal performance! You have displayed exemplary mastery of core CS, Python & AI systems.';
      rec.textContent = 'Recommendation: Eligible for advanced systems engineering and specialized machine learning research modules.';
    } else if (percentage >= 75) {
      gradeBadge.className = 'grade-badge grade-pass';
      gradeBadge.textContent = 'GRADE A • VERY GOOD';
      msg.textContent = 'Great command! Demonstrated strong theoretical comprehension and logical problem-solving.';
      rec.textContent = 'Recommendation: Continue strengthening edge cases in Python mutable state and concurrency synchronization.';
    } else if (percentage >= 60) {
      gradeBadge.className = 'grade-badge grade-pass';
      gradeBadge.textContent = 'GRADE B • QUALIFIED';
      msg.textContent = 'Passing criteria met. Good working knowledge with opportunity for consolidation.';
      rec.textContent = 'Recommendation: Focus revision on deep learning architectures, attention mechanisms, and network handshakes.';
    } else {
      gradeBadge.className = 'grade-badge grade-fail';
      gradeBadge.textContent = 'NEEDS IMPROVEMENT';
      msg.textContent = 'Assessment score below the qualifying 60% threshold. Thorough conceptual review is advised.';
      rec.textContent = 'Recommendation: Revisit fundamental data structures, Coffman deadlock conditions, and Python list comprehensions.';
    }
  }

  function renderReviewCards(filter) {
    resultElements.reviewCardsList.innerHTML = '';
    const letters = ['A', 'B', 'C', 'D'];

    QUIZ_QUESTIONS.forEach((q, idx) => {
      const resp = state.responses[idx];
      const isUnanswered = (resp.selectedOption === null);
      const isCorrect = (!isUnanswered && resp.selectedOption === q.correctAnswer);
      const isWrong = (!isUnanswered && resp.selectedOption !== q.correctAnswer);

      // Filter check
      if (filter === 'correct' && !isCorrect) return;
      if (filter === 'wrong' && !isWrong) return;
      if (filter === 'unanswered' && !isUnanswered) return;

      let borderClass = 'border-skipped';
      let tagClass = 'tag-skipped';
      let tagText = 'Unanswered (0.00)';

      if (isCorrect) {
        borderClass = 'border-correct';
        tagClass = 'tag-correct';
        tagText = 'Correct (+1.00)';
      } else if (isWrong) {
        borderClass = 'border-wrong';
        tagClass = 'tag-wrong';
        tagText = 'Incorrect (0.00)';
      }

      const card = document.createElement('div');
      card.className = `review-q-card ${borderClass}`;

      let codeHtml = '';
      if (q.codeSnippet) {
        codeHtml = `
          <div class="code-snippet-wrapper" style="margin: 0.5rem 0 1rem;">
            <pre class="code-block"><code style="font-size: 0.85rem;">${escapeHtml(q.codeSnippet)}</code></pre>
          </div>
        `;
      }

      let optionsHtml = '';
      q.options.forEach((optText, optIdx) => {
        const isChosen = (resp.selectedOption === optIdx);
        const isCorrectOpt = (q.correctAnswer === optIdx);

        let rowClass = '';
        let badgeIcon = letters[optIdx];

        if (isCorrectOpt) {
          rowClass = 'is-correct-answer';
          badgeIcon += ' (Correct Answer)';
        } else if (isChosen && !isCorrectOpt) {
          rowClass = 'is-candidate-chosen is-wrong';
          badgeIcon += ' (Your Choice)';
        }

        optionsHtml += `
          <div class="review-opt-row ${rowClass}">
            <strong>${badgeIcon}:</strong>
            <span>${escapeHtml(optText)}</span>
          </div>
        `;
      });

      card.innerHTML = `
        <div class="review-q-header">
          <div class="review-q-meta">
            <span class="q-number-badge">Question ${String(idx + 1).padStart(2, '0')}</span>
            <span class="q-category-chip">${q.category}</span>
          </div>
          <span class="review-status-tag ${tagClass}">${tagText}</span>
        </div>
        <p class="review-q-title">${escapeHtml(q.question)}</p>
        ${codeHtml}
        <div class="review-options-summary">
          ${optionsHtml}
        </div>
        <div class="review-explanation-box">
          <strong>Official Rationale:</strong> ${escapeHtml(q.explanation)}
        </div>
      `;

      resultElements.reviewCardsList.appendChild(card);
    });
  }

  // =========================================================================
  // Event Listeners Setup
  // =========================================================================
  function setupEventListeners() {
    // Sound Toggle Button
    header.btnSoundToggle.addEventListener('click', () => {
      state.soundEnabled = !state.soundEnabled;
      if (state.soundEnabled) {
        header.btnSoundToggle.style.opacity = '1';
        header.btnSoundToggle.title = 'Sound Effects: On';
        playClickSound();
      } else {
        header.btnSoundToggle.style.opacity = '0.4';
        header.btnSoundToggle.title = 'Sound Effects: Muted';
      }
    });

    // Home -> Start Test Button
    homeElements.btnStartTest.addEventListener('click', () => {
      playClickSound();
      updateCandidateHeader();
      switchView('instructions');
    });

    // Instructions -> Declaration Checkbox
    instructionElements.chkDeclaration.addEventListener('change', (e) => {
      instructionElements.btnProceedExam.disabled = !e.target.checked;
    });

    // Instructions -> Back Button
    instructionElements.btnBackToHome.addEventListener('click', () => {
      playClickSound();
      switchView('home');
    });

    // Instructions -> Proceed to Exam Button
    instructionElements.btnProceedExam.addEventListener('click', () => {
      playClickSound();
      initResponses();
      startExamTimer();
      switchView('quiz');
      loadQuestion(0);
    });

    // Fullscreen Toggle Button
    quizElements.btnFullscreen.addEventListener('click', () => {
      playClickSound();
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => { });
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => { });
        }
      }
    });

    // Quiz Navigation Buttons
    quizElements.btnPrevQuestion.addEventListener('click', () => {
      playClickSound();
      goToPreviousQuestion();
    });

    quizElements.btnNextQuestion.addEventListener('click', () => {
      playClickSound();
      advanceToNextQuestion();
    });

    quizElements.btnMarkReview.addEventListener('click', markCurrentForReviewAndNext);
    quizElements.btnClearResponse.addEventListener('click', clearCurrentResponse);

    // Open Submit Modal (from footer or palette sidebar)
    quizElements.btnOpenSubmitModal.addEventListener('click', openSubmitModal);
    quizElements.btnSidebarSubmit.addEventListener('click', openSubmitModal);

    // Modal Action Buttons
    modalElements.btnCancel.addEventListener('click', closeSubmitModal);
    modalElements.btnConfirmSubmit.addEventListener('click', executeSubmission);

    // Close modal on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modalElements.modal.style.display === 'flex') {
        closeSubmitModal();
      }
      // Keyboard option selection (1-4) in quiz view
      if (views.quiz.classList.contains('active') && modalElements.modal.style.display !== 'flex') {
        if (e.key >= '1' && e.key <= '4') {
          selectOption(parseInt(e.key, 10) - 1);
        }
      }
    });

    // Result Filter Tabs
    resultElements.filterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        playClickSound();
        resultElements.filterTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const filterType = tab.getAttribute('data-filter');
        renderReviewCards(filterType);
      });
    });

    // Print Scorecard Handlers
    function handlePrint() {
      playClickSound();
      window.print();
    }
    resultElements.btnPrintScorecard.addEventListener('click', handlePrint);
    resultElements.btnBottomPrint.addEventListener('click', handlePrint);

    // Restart Test Handlers
    function handleRestart() {
      playClickSound();
      instructionElements.chkDeclaration.checked = false;
      instructionElements.btnProceedExam.disabled = true;
      initResponses();
      switchView('home');
    }
    resultElements.btnRestartExam.addEventListener('click', handleRestart);
    resultElements.btnBottomRestart.addEventListener('click', handleRestart);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Self Initialization on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }

})();
