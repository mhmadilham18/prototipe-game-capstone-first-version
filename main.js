import baseStats from "./stats.js";
import { skillArjuna, skillDuryudana } from "./skill.js";
import soalAktivasiSkill from "./soal.js";

// ======================================================
// LOGIKA UTAMA GAME
// ======================================================

const playerElement = document.getElementById("player");
const enemyElement = document.getElementById("enemy");
const projectilesContainer = document.getElementById("projectiles");
const quizContainer = document.getElementById("quiz-container");
const gameOverScreen = document.getElementById("game-over");

let gameIsOver = false;

// Inisialisasi objek player dengan statistik dan skill Arjuna
const player = {
  ...baseStats,
  hp: baseStats.maxHP,
  sp: baseStats.maxSP,
  y: 200,
  element: playerElement,
  skills: skillArjuna.map((s) => ({
    ...s,
    onCooldown: false,
    cooldownTimer: 0,
  })),
  buffs: [],
  name: "Arjuna",
};

// Inisialisasi objek enemy dengan statistik dan skill Duryudana
const enemy = {
  ...baseStats,
  hp: baseStats.maxHP,
  sp: baseStats.maxSP,
  y: 200,
  direction: 1,
  element: enemyElement,
  skills: skillDuryudana.map((s) => ({
    ...s,
    onCooldown: false,
    cooldownTimer: 0,
  })),
  buffs: [],
  name: "Duryudana",
};

// Memulai game dan mengatur interval untuk berbagai proses game
function initGame() {
  setupUI();
  updateUI();
  player.element.style.top = player.y + "px";
  enemy.element.style.top = enemy.y + "px";

  setInterval(gameTick, 100);
  setInterval(regenerateSP, 2000);
  setInterval(playerAttack, 1000 / player.atkSpd);
  setInterval(enemyAttack, 1000 / enemy.atkSpd);
}

// Loop utama game yang berjalan setiap 100ms
function gameTick() {
  if (gameIsOver) return;
  moveEnemy();
  enemyAI();
  updateCooldowns();
  updateBuffs();
  updateUI();
}

// ======================================================
// MANAJEMEN UI
// ======================================================

// Membuat tombol-tombol skill player di interface
function setupUI() {
  const skillButtonsContainer = document.getElementById("skill-buttons");
  player.skills.forEach((skill, index) => {
    const btn = document.createElement("button");
    btn.id = `skill-btn-${index}`;
    btn.className = "skill-btn";
    btn.innerHTML = `${skill.namaSkill}`;
    btn.onclick = () => tryActivateSkill(index);
    skillButtonsContainer.appendChild(btn);
  });
}

// Memperbarui tampilan HP/SP bar dan status tombol skill
function updateUI() {
  document.getElementById("player-hp-bar").style.width = `${
    (player.hp / player.maxHP) * 100
  }%`;
  document.getElementById("player-sp-bar").style.width = `${
    (player.sp / player.maxSP) * 100
  }%`;
  document.getElementById("enemy-hp-bar").style.width = `${
    (enemy.hp / enemy.maxHP) * 100
  }%`;
  document.getElementById("enemy-sp-bar").style.width = `${
    (enemy.sp / enemy.maxSP) * 100
  }%`;

  player.skills.forEach((skill, index) => {
    document.getElementById(`skill-btn-${index}`).disabled =
      player.sp < skill.tenagaSukma || skill.onCooldown;
  });
}

// Menampilkan popup notifikasi efek skill atau pesan game
function showEffectPopup(message) {
  const popup = document.getElementById("effect-popup");
  popup.textContent = message;

  popup.classList.remove("hidden");
  popup.classList.add("show");

  // Sembunyikan kembali setelah durasi tertentu
  setTimeout(() => {
    popup.classList.remove("show");
    // Tambahkan sedikit delay sebelum menambahkan 'hidden' lagi agar transisi selesai
    setTimeout(() => popup.classList.add("hidden"), 400);
  }, 400); // Total durasi pop-up terlihat
}

// ======================================================
// KONTROL & SERANGAN
// ======================================================

// Mengatur kontrol pergerakan player dengan keyboard
document.addEventListener("keydown", (e) => {
  if (gameIsOver) return;
  const gameBounds = document
    .getElementById("game-container")
    .getBoundingClientRect();
  if (e.key === "ArrowUp") player.y = Math.max(0, player.y - 20);
  if (e.key === "ArrowDown")
    player.y = Math.min(
      gameBounds.height - player.element.clientHeight,
      player.y + 20
    );
  player.element.style.top = player.y + "px";
});

// Membuat serangan otomatis player
function playerAttack() {
  if (gameIsOver) return;
  createProjectile(player.element.offsetLeft + 60, player.y + 30, 1, player);
}

// Membuat serangan enemy
function enemyAttack() {
  if (gameIsOver) return;
  createProjectile(enemy.element.offsetLeft, enemy.y + 30, -1, enemy);
}

// Membuat projectile (peluru) yang bergerak melintasi layar
function createProjectile(x, y, direction, owner) {
  const proj = document.createElement("img");
  proj.src = "attack.png";
  proj.className = "projectile";
  proj.style.left = x + "px";
  proj.style.top = y + "px";
  if (direction === -1) proj.style.transform = "scaleX(-1)";
  projectilesContainer.appendChild(proj);

  const speed = 8;
  const interval = setInterval(() => {
    let left = parseInt(proj.style.left);
    proj.style.left = left + speed * direction + "px";
    if (left < -40 || left > 800) {
      clearInterval(interval);
      proj.remove();
    } else {
      const target = owner === player ? enemy : player;
      checkCollision(proj, target.element, () => {
        clearInterval(interval);
        proj.remove();
        dealDamage(owner, target);
      });
    }
  }, 20);
}

// ======================================================
// MEKANISME GAME
// ======================================================

// Mengecek apakah projectile mengenai target
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
  }
}

// Menghitung dan memberikan damage ke target
function dealDamage(attacker, defender) {
  if (defender.buffs.some((b) => b.effect.immuneDamage)) return;
  const atkBuff = attacker.buffs.find((b) => b.effect.atk);
  const totalDamage =
    attacker.atk + (atkBuff ? attacker.atk * atkBuff.effect.atk : 0);
  defender.hp -= totalDamage;
  defender.element.classList.add("hit");
  setTimeout(() => defender.element.classList.remove("hit"), 300);
  checkGameOver();
}

// Menggerakkan enemy secara vertikal naik-turun
function moveEnemy() {
  const gameBounds = document
    .getElementById("game-container")
    .getBoundingClientRect();
  enemy.y += enemy.direction * enemy.moveSpd;
  if (
    enemy.y <= 0 ||
    enemy.y >= gameBounds.height - enemy.element.clientHeight
  ) {
    enemy.direction *= -1;
  }
  enemy.element.style.top = enemy.y + "px";
}

// AI enemy untuk melakukan serangan dan menggunakan skill
function enemyAI() {
  enemy.skills.forEach((skill) => {
    if (!skill.onCooldown && enemy.sp >= skill.tenagaSukma) {
      let useSkill = false;
      if (skill.namaSkill === "Daya Wisesa" && enemy.hp < enemy.maxHP * 0.4) {
        if (Math.random() < 0.02) useSkill = true;
      }
      if (skill.namaSkill === "Raja Tanpa Tunduk") {
        if (Math.random() < 0.01) useSkill = true;
      }
      if (useSkill) {
        enemy.sp -= skill.tenagaSukma;
        activateSkill(enemy, skill);
      }
    }
  });
}

// Mengecek kondisi game over (menang/kalah)
function checkGameOver() {
  if (player.hp <= 0) endGame("Anda Kalah!");
  else if (enemy.hp <= 0) endGame("Anda Menang!");
}

// Mengakhiri game dan menampilkan layar game over
function endGame(message) {
  if (gameIsOver) return;
  gameIsOver = true;
  document.getElementById("game-over-text").textContent = message;
  gameOverScreen.classList.remove("hidden");
}

// ======================================================
// SISTEM SKILL & KUIS
// ======================================================

// Mencoba mengaktifkan skill player (cek SP dan cooldown)
function tryActivateSkill(skillIndex) {
  const skill = player.skills[skillIndex];
  if (player.sp >= skill.tenagaSukma && !skill.onCooldown) {
    player.sp -= skill.tenagaSukma;
    skill.onCooldown = true;
    skill.cooldownTimer = skill.cooldown;
    showQuiz(skill);
  }
}

// Menampilkan kuis untuk aktivasi skill player
function showQuiz(skill) {
  const q =
    soalAktivasiSkill[Math.floor(Math.random() * soalAktivasiSkill.length)];
  const questionEl = document.getElementById("quiz-question");
  const optionsEl = document.getElementById("quiz-options");
  questionEl.textContent = q.pertanyaan;
  optionsEl.innerHTML = "";
  q.pilihanJawaban.forEach((opt) => {
    const btn = document.createElement("button");
    btn.textContent = opt;
    btn.onclick = () => {
      quizContainer.classList.add("hidden");
      if (opt === q.jawabanBenar) {
        activateSkillEffect(player, skill);
      } else {
        // Tampilkan notifikasi gagal dengan pesan yang jelas
        showEffectPopup("Jawaban Salah!");
      }
    };
    optionsEl.appendChild(btn);
  });
  quizContainer.classList.remove("hidden");
}

// Mengaktifkan efek skill setelah berhasil menjawab kuis
function activateSkillEffect(character, skill) {
  // Tampilkan notifikasi skill aktif
  showEffectPopup(`${character.name} mengaktifkan ${skill.namaSkill}`);

  if (skill.efek.heal)
    character.hp = Math.min(
      character.maxHP,
      character.hp + character.maxHP * skill.efek.heal
    );
  if (skill.durasi)
    character.buffs.push({ ...skill, durationTimer: skill.durasi });
}

// Mengaktifkan skill langsung (untuk enemy AI)
function activateSkill(character, skill) {
  activateSkillEffect(character, skill);
  skill.onCooldown = true;
  skill.cooldownTimer = skill.cooldown;
}

// Memperbarui durasi buff yang aktif pada karakter
function updateBuffs() {
  [player, enemy].forEach((character) => {
    character.buffs = character.buffs.filter((buff) => {
      buff.durationTimer -= 0.1;
      return buff.durationTimer > 0;
    });
  });
}

// Memperbarui cooldown skill semua karakter
function updateCooldowns() {
  [player, enemy].forEach((character) => {
    character.skills.forEach((skill) => {
      if (skill.onCooldown) {
        skill.cooldownTimer -= 0.1;
        if (skill.cooldownTimer <= 0) {
          skill.onCooldown = false;
          skill.cooldownTimer = 0;
        }
      }
    });
  });
}

// Regenerasi SP player dan enemy secara berkala
function regenerateSP() {
  if (gameIsOver) return;
  if (player.sp < player.maxSP) player.sp += baseStats.spRegen;
  if (enemy.sp < enemy.maxSP) enemy.sp += baseStats.spRegen;
}

// Memulai game ketika halaman selesai dimuat
window.onload = initGame;
