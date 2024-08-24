document.addEventListener('DOMContentLoaded', function () {
    loadQuestions();

    let editIndex = null;
    let currentQuestionIndex = 0;
    let userAnswers = [];

    document.getElementById('list-button').addEventListener('click', function () {
        document.getElementById('main-page').classList.remove('active');
        document.getElementById('question-panel').classList.add('active');
    });

    document.getElementById('start-quiz-button').addEventListener('click', function () {
        document.getElementById('main-page').classList.remove('active');
        startQuiz();
    });

    document.getElementById('back-button').addEventListener('click', function () {
        document.getElementById('question-panel').classList.remove('active');
        document.getElementById('main-page').classList.add('active');
    });

    document.getElementById('add-question-button').addEventListener('click', function () {
        clearForm();
        index = null;

        document.getElementById('question-panel').classList.remove('active');
        document.getElementById('add-question-panel').classList.add('active');
    });

    document.getElementById('cancel-add-button').addEventListener('click', function () {
        document.getElementById('add-question-panel').classList.remove('active');
        document.getElementById('question-panel').classList.add('active');
        editIndex = null;
    });

    document.getElementById('search-bar').addEventListener('input', function () {
        const searchTerm = this.value.toLowerCase();
        filterQuestions(searchTerm);
    });
    document.getElementById('save-question-button').addEventListener('click', function () {
        if (editIndex === null) {
            saveQuestion();
        } else {
            updateQuestion(editIndex);
        }
        document.getElementById('add-question-panel').classList.remove('active');
        document.getElementById('question-panel').classList.add('active');
        editIndex = null;
    });

    function saveQuestion() {
        const newQuestion = getFormData();
        let questions = JSON.parse(localStorage.getItem('questions')) || [];
        questions.push(newQuestion);
        localStorage.setItem('questions', JSON.stringify(questions));
        loadQuestions();
    }

    function updateQuestion(index) {
        let questions = JSON.parse(localStorage.getItem('questions')) || [];
        questions[index] = getFormData();
        localStorage.setItem('questions', JSON.stringify(questions));
        loadQuestions();
    }

    function startQuiz() {
        const questions = JSON.parse(localStorage.getItem('questions')) || [];
        if (questions.length === 0) {
            alert("Sorular yok! Önce soru ekleyin.");
            document.getElementById('main-page').classList.add('active');
            return;
        }
        document.getElementById('main-page').classList.remove('active');
        showQuestion(questions);
    }

    function showQuestion(questions) {
        if (currentQuestionIndex >= questions.length) {
            showResults();
            return;
        }

        const question = questions[currentQuestionIndex];
        console.log(question);

        const questionPanel = document.createElement('div');
        questionPanel.className = 'question-panel active';
        questionPanel.innerHTML = `
        <div class="title">${question.question}</div>
        ${question.choices.map((choice, index) => `
            <div>
                <input type="radio" name="answer" id="choice${index}" value="${index}">
                <label for="choice${index}">${choice}</label>
            </div>
        `).join('')}
        <button id="next-button" class="button">Sonraki</button>
    `;
        document.body.innerHTML = '';
        document.body.appendChild(questionPanel);

        document.getElementById('next-button').addEventListener('click', function () {
            const selectedAnswer = document.querySelector('input[name="answer"]:checked');
            if (selectedAnswer) {
                userAnswers[currentQuestionIndex] = parseInt(selectedAnswer.value);
                currentQuestionIndex++;
                showQuestion(questions);
            } else {
                alert('Bir cevap seçin!');
            }
        });
    }

    function showResults() {
        const questions = JSON.parse(localStorage.getItem('questions')) || [];
        let score = 0;

        userAnswers.forEach((answer, index) => {
            if (answer === parseInt(questions[index].correctAnswer) - 1) {
                score++;
            }
        });

        document.body.innerHTML = `
            <div class="container active">
                <div class="title">Sonuçlar</div>
                <p>Doğru Cevap Sayısı: ${score} / ${questions.length}</p>
                <a href="#" id="restart-button" class="button">Yeniden Başla</a>
            </div>
        `;

        document.getElementById('restart-button').addEventListener('click', function () {
            window.location.reload();
            document.body.innerHTML = '';
            userAnswers = [];
            currentQuestionIndex = 0;
        });
    }

    function getFormData() {
        const question = document.getElementById('question').value;
        const choice1 = document.getElementById('choice1').value;
        const choice2 = document.getElementById('choice2').value;
        const choice3 = document.getElementById('choice3').value;
        const choice4 = document.getElementById('choice4').value;
        const correctAnswer = document.getElementById('correct-answer').value;
        const difficulty = document.getElementById('difficulty').value;

        return { question, choices: [choice1, choice2, choice3, choice4], correctAnswer, difficulty };
    }

    function clearForm() {
        document.getElementById('question').value = '';
        document.getElementById('choice1').value = '';
        document.getElementById('choice2').value = '';
        document.getElementById('choice3').value = '';
        document.getElementById('choice4').value = '';
        document.getElementById('correct-answer').value = '1';
        document.getElementById('difficulty').value = 'easy';
    }

    function loadQuestions() {
        const questionList = document.getElementById('question-list');
        questionList.innerHTML = '';

        let questions = JSON.parse(localStorage.getItem('questions')) || [];
        questions.forEach((q, index) => {
            const questionItem = document.createElement('div');
            questionItem.className = 'question-item';

            const questionText = document.createElement('div');
            questionText.className = 'question-text';
            questionText.textContent = q.question;

            const editButton = document.createElement('button');
            editButton.className = 'edit-button';
            editButton.textContent = 'Düzenle';
            editButton.addEventListener('click', function () {
                editIndex = index;
                loadQuestionToForm(q);
                document.getElementById('question-panel').classList.remove('active');
                document.getElementById('add-question-panel').classList.add('active');
            });

            const deleteButton = document.createElement('button');
            deleteButton.className = 'delete-button';
            deleteButton.textContent = 'Sil';
            deleteButton.addEventListener('click', function () {
                deleteQuestion(index);
            });

            questionItem.appendChild(questionText);
            questionItem.appendChild(editButton);
            questionItem.appendChild(deleteButton);
            questionList.appendChild(questionItem);
        });
    }

    function loadQuestionToForm(question) {
        document.getElementById('question').value = question.question;
        document.getElementById('choice1').value = question.choices[0];
        document.getElementById('choice2').value = question.choices[1];
        document.getElementById('choice3').value = question.choices[2];
        document.getElementById('choice4').value = question.choices[3];
        document.getElementById('correct-answer').value = question.correctAnswer;
        document.getElementById('difficulty').value = question.difficulty;
    }

    function deleteQuestion(index) {
        let questions = JSON.parse(localStorage.getItem('questions')) || [];
        questions.splice(index, 1);
        localStorage.setItem('questions', JSON.stringify(questions));
        loadQuestions();
    }

    function filterQuestions(term) {
        const questionItems = document.querySelectorAll('.question-item');
        questionItems.forEach(item => {
            const questionText = item.querySelector('.question-text').textContent.toLowerCase();
            if (questionText.includes(term)) {
                item.style.display = '';
            } else {
                item.style.display = 'none';
            }
        });
    }

    loadQuestions();
});