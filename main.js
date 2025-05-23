const player = document.getElementById("player");
const enemy = document.getElementById("enemy");
const projectilesContainer = document.getElementById("projectiles");
const playerHpText = document.getElementById("player-hp");
const playerSpText = document.getElementById("player-sp");
const enemyHpText = document.getElementById("enemy-hp");
const quizContainer = document.getElementById("quiz-container");
const quizQuestion = document.getElementById("quiz-question");
const quizOptions = document.getElementById("quiz-options");
const gameOverScreen = document.getElementById("game-over");
const gameOverText = document.getElementById("game-over-text");
const skillBtn = document.getElementById("skill-btn");

let playerHp = 20,
  playerSp = 10;
let enemyHp = 20;
let playerY = 180;
let enemyY = 180;
let enemyDirection = 1;
let quizAnswer = "";
let isPlayerBuffed = false;
let enemySkillCooldown = false;
let skillPending = false;

const questions = [
  {
    question: "What is 2 + 2?",
    options: ["3", "4", "5"],
    answer: "4",
  },
  {
    question: "Capital of France?",
    options: ["Berlin", "Paris", "London"],
    answer: "Paris",
  },
];

function updateUI() {
  playerHpText.textContent = playerHp;
  playerSpText.textContent = playerSp;
  enemyHpText.textContent = enemyHp;
}

function moveEnemy() {
  enemyY += enemyDirection * 2;
  if (enemyY <= 0 || enemyY >= 360) enemyDirection *= -1;
  enemy.style.top = enemyY + "px";
}

function checkCollision(proj, target, onHit) {
  const pRect = proj.getBoundingClientRect();
  const tRect = target.getBoundingClientRect();
  if (
    pRect.left < tRect.right &&
    pRect.right > tRect.left &&
    pRect.top < tRect.bottom &&
    pRect.bottom > tRect.top
  ) {
    onHit();
    proj.remove();
  }
}

function createProjectile(x, y, direction, isPlayer) {
  const proj = document.createElement("div");
  proj.classList.add("projectile");
  proj.style.top = y + 18 + "px";
  proj.style.left = x + "px";
  projectilesContainer.appendChild(proj);

  const speed = 5;
  const interval = setInterval(() => {
    let left = parseInt(proj.style.left);
    proj.style.left = left + speed * direction + "px";
    if (left < 0 || left > 600) {
      clearInterval(interval);
      proj.remove();
    } else {
      checkCollision(proj, isPlayer ? player : enemy, () => {
        if (isPlayer) {
          playerHp -= 5;
          player.classList.add("hit");
          setTimeout(() => player.classList.remove("hit"), 200);
        } else {
          enemyHp -= 5;
          enemy.classList.add("hit");
          setTimeout(() => enemy.classList.remove("hit"), 200);
        }
        updateUI();
        checkGameOver();
      });
    }
  }, 30);
}

function enemyAttack() {
  createProjectile(550, enemyY, -1, true);
}

function playerAttack() {
  createProjectile(50, playerY, 1, false);
  if (isPlayerBuffed) {
    setTimeout(() => createProjectile(50, playerY, 1, false), 150);
  }
}

function checkGameOver() {
  if (playerHp <= 0) {
    gameOverText.textContent = "You Lose!";
    gameOverScreen.classList.remove("hidden");
  } else if (enemyHp <= 0) {
    gameOverText.textContent = "You Win!";
    gameOverScreen.classList.remove("hidden");
  }
}

function showQuiz() {
  const q = questions[Math.floor(Math.random() * questions.length)];
  quizContainer.classList.remove("hidden");
  quizQuestion.textContent = q.question;
  quizOptions.innerHTML = "";
  quizAnswer = q.answer;
  q.options.forEach((opt) => {
    const btn = document.createElement("button");
    btn.textContent = opt;
    btn.onclick = () => {
      if (opt === quizAnswer) {
        activatePlayerSkill(); // Aktifkan skill jika jawaban benar
      }
      quizContainer.classList.add("hidden");
    };
    quizOptions.appendChild(btn);
  });
}

function activatePlayerSkill() {
  isPlayerBuffed = true;
  setTimeout(() => {
    isPlayerBuffed = false;
  }, 5000); // skill aktif 5 detik
}

skillBtn.addEventListener("click", () => {
  if (playerSp >= 10 && !skillPending) {
    playerSp -= 10;
    updateUI();
    skillPending = true;
    showQuiz();
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp") playerY = Math.max(0, playerY - 20);
  if (e.key === "ArrowDown") playerY = Math.min(360, playerY + 20);
  player.style.top = playerY + "px";
});

// musuh bergerak dan menyerang, serta skill healing
setInterval(() => {
  moveEnemy();
  if (Math.random() < 0.05) enemyAttack();

  if (enemyHp <= 12 && !enemySkillCooldown) {
    enemySkillCooldown = true;

    const healAmount = Math.floor(enemyHp * 0.5);
    enemyHp = Math.min(enemyHp + healAmount, 20);
    updateUI();

    console.log(`Enemy healed for ${healAmount} HP`);

    setTimeout(() => {
      enemySkillCooldown = false;
    }, 7000);
  }
}, 100);

// serangan pemain
setInterval(playerAttack, 1500);

// SP regen: 1 SP per 2 detik
setInterval(() => {
  if (playerSp < 10) {
    playerSp += 1;
    updateUI();
  }
}, 2000);

updateUI();
player.style.top = playerY + "px";
enemy.style.top = enemyY + "px";
