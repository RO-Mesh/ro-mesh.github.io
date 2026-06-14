document.addEventListener('DOMContentLoaded', () => {
  const quizModeToggle = document.getElementById('quiz-mode-toggle');
  const labelSimple = document.getElementById('label-simple');
  const labelAdvanced = document.getElementById('label-advanced');
  const questionEl = document.getElementById('quiz-question');
  const answersEl = document.getElementById('quiz-answers');
  const quizContent = document.getElementById('quiz-content');
  const quizResult = document.getElementById('quiz-result');

  const simpleQuestions = [
    {
      q: "Unde crezi că vei folosi dispozitivul cel mai des?",
      options: [
        { text: "Acasă / Balcon", points: { meshcore: 1, meshtastic: 0, reticulum: 0 } },
        { text: "În drumeții / Mașină", points: { meshcore: 0, meshtastic: 1, reticulum: 0 } },
        { text: "Oriunde pentru intimitate", points: { meshcore: 0, meshtastic: 0, reticulum: 1 } }
      ]
    },
    {
      q: "Motivul principal?",
      options: [
        { text: "Mesaje de urgență locale", points: { meshcore: 1, meshtastic: 0, reticulum: 0 } },
        { text: "GPS și mesaje cu prietenii la munte", points: { meshcore: 0, meshtastic: 1, reticulum: 0 } },
        { text: "Comunicare liberă necenzurabilă", points: { meshcore: 0, meshtastic: 0, reticulum: 1 } }
      ]
    },
    {
      q: "Cât de simplu să fie?",
      options: [
        { text: "Plug & Play la priză", points: { meshcore: 1, meshtastic: 0, reticulum: 0 } },
        { text: "Îmi place să schimb antene/setări", points: { meshcore: 0, meshtastic: 1, reticulum: 0 } },
        { text: "Mă pricep la Linux / Rețele", points: { meshcore: 0, meshtastic: 0, reticulum: 1 } }
      ]
    },
    {
      q: "Ce trimiți?",
      options: [
        { text: "SMS scurt", points: { meshcore: 1, meshtastic: 0, reticulum: 0 } },
        { text: "SMS + GPS", points: { meshcore: 0, meshtastic: 1, reticulum: 0 } },
        { text: "Orice: fișiere, voce, text", points: { meshcore: 0, meshtastic: 0, reticulum: 1 } }
      ]
    },
    {
      q: "Cu cine comunici?",
      options: [
        { text: "Comunitatea din orașul meu", points: { meshcore: 1, meshtastic: 0, reticulum: 0 } },
        { text: "Grupul meu restrâns", points: { meshcore: 0, meshtastic: 1, reticulum: 0 } },
        { text: "Oricine folosește ecosistemul global", points: { meshcore: 0, meshtastic: 0, reticulum: 1 } }
      ]
    }
  ];

  const advancedQuestions = [
    {
      q: "Topologia rețelei?",
      options: [
        { text: "Infrastructură fixă repetată", points: { meshcore: 1, meshtastic: 0, reticulum: 0 } },
        { text: "Rețea mobilă Ad-Hoc", points: { meshcore: 0, meshtastic: 1, reticulum: 0 } },
        { text: "Overlay peste interfețe multiple", points: { meshcore: 0, meshtastic: 0, reticulum: 1 } }
      ]
    },
    {
      q: "Focusul rutării?",
      options: [
        { text: "Flood controlat urban", points: { meshcore: 1, meshtastic: 0, reticulum: 0 } },
        { text: "Rutare geografică / SNR", points: { meshcore: 0, meshtastic: 1, reticulum: 0 } },
        { text: "Rutare criptografică fără adrese IP", points: { meshcore: 0, meshtastic: 0, reticulum: 1 } }
      ]
    },
    {
      q: "Nivel de implicare hardware?",
      options: [
        { text: "Noduri staționare solare", points: { meshcore: 1, meshtastic: 0, reticulum: 0 } },
        { text: "Dispozitive portabile BLE", points: { meshcore: 0, meshtastic: 1, reticulum: 0 } },
        { text: "Raspberry Pi / Terminal / Servere", points: { meshcore: 0, meshtastic: 0, reticulum: 1 } }
      ]
    },
    {
      q: "Payload permis?",
      options: [
        { text: "Strict pachete text LoRa", points: { meshcore: 1, meshtastic: 0, reticulum: 0 } },
        { text: "Telemetrie + Text LoRa", points: { meshcore: 0, meshtastic: 1, reticulum: 0 } },
        { text: "Date binare / TCP-like", points: { meshcore: 0, meshtastic: 0, reticulum: 1 } }
      ]
    },
    {
      q: "Securitate?",
      options: [
        { text: "Criptare standard canal", points: { meshcore: 1, meshtastic: 0, reticulum: 0 } },
        { text: "Criptare AES256 canal/grup", points: { meshcore: 0, meshtastic: 1, reticulum: 0 } },
        { text: "Forward Secrecy / Ed25519 nativ", points: { meshcore: 0, meshtastic: 0, reticulum: 1 } }
      ]
    }
  ];

  let currentQuestions = simpleQuestions;
  let currentIdx = 0;
  let scores = { meshcore: 0, meshtastic: 0, reticulum: 0 };

  function initQuiz() {
    currentIdx = 0;
    scores = { meshcore: 0, meshtastic: 0, reticulum: 0 };
    quizContent.classList.remove('hidden');
    quizResult.classList.add('hidden');
    renderQuestion();
  }

  function renderQuestion() {
    answersEl.innerHTML = '';
    const qData = currentQuestions[currentIdx];
    questionEl.textContent = qData.q;

    qData.options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'quiz-btn';
      btn.textContent = opt.text;
      btn.addEventListener('click', () => {
        scores.meshcore += opt.points.meshcore;
        scores.meshtastic += opt.points.meshtastic;
        scores.reticulum += opt.points.reticulum;
        nextQuestion();
      });
      answersEl.appendChild(btn);
    });
  }

  function nextQuestion() {
    currentIdx++;
    if (currentIdx >= currentQuestions.length) {
      showResult();
    } else {
      renderQuestion();
    }
  }

  function showResult() {
    quizContent.classList.add('hidden');
    quizResult.classList.remove('hidden');

    let winner = 'meshcore';
    let maxScore = scores.meshcore;

    if (scores.meshtastic > maxScore) {
      maxScore = scores.meshtastic;
      winner = 'meshtastic';
    }
    if (scores.reticulum > maxScore) {
      winner = 'reticulum';
    }

    let winnerName = winner.charAt(0).toUpperCase() + winner.slice(1);
    
    quizResult.innerHTML = `
      <h3>Protocolul recomandat pentru tine este: <strong>${winnerName}</strong></h3>
      <p>Pe baza răspunsurilor tale, ${winnerName} pare a fi soluția ideală pentru nevoile tale.</p>
      <div class="quiz-result-actions">
        <a href="/${winner}/" class="btn-primary">Află mai multe despre ${winnerName}</a>
        <button id="quiz-restart" class="btn-secondary">Refă testul</button>
      </div>
    `;

    document.getElementById('quiz-restart').addEventListener('click', initQuiz);
  }

  quizModeToggle.addEventListener('change', (e) => {
    if (e.target.checked) {
      currentQuestions = advancedQuestions;
      labelAdvanced.classList.add('active');
      labelSimple.classList.remove('active');
    } else {
      currentQuestions = simpleQuestions;
      labelSimple.classList.add('active');
      labelAdvanced.classList.remove('active');
    }
    initQuiz();
  });

  // Initialize first view
  initQuiz();
});
