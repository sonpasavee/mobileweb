<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="custom-toolbar">
        <ion-title class="custom-title">Lab09 Sensors</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="custom-content">

      <!-- Top Hero: Rep Counter -->
      <div class="hero-zone">
        <div class="hero-tag">ARM WORKOUT</div>
        <div class="rep-circle">
          <div class="rep-number">{{ state?.repDisplay ?? 0 }}</div>
          <div class="rep-unit">รอบ</div>
        </div>
      </div>

      <!-- Score Card -->
      <div class="bottom-sheet">

        <div class="score-row">
          <div class="score-box">
            <div class="score-val">{{ state?.stats.score ?? 0 }}</div>
            <div class="score-lbl">คะแนน</div>
          </div>
        </div>

        <!-- Message -->
        <div class="msg-box" :class="{ 'msg-active': state?.stats.lastMessage }">
          <div class="msg-dot"></div>
          <div class="msg-text">{{ state?.stats.lastMessage || 'พร้อมเริ่มออกกำลังกาย' }}</div>
        </div>

        <!-- Buttons -->
        <div class="btn-zone">
          <ion-button expand="block" class="btn-start" @click="start">▶ &nbsp; เริ่ม</ion-button>
          <ion-button expand="block" class="btn-stop" @click="stop">■ &nbsp; หยุด</ion-button>
        </div>

      </div>

    </ion-content>

    <ion-footer class="custom-footer">
      <div class="footer-text">663380234-8 นายวิสิษฎ์ ศรีอดิศักดิ์</div>
    </ion-footer>

    <!-- ── Stats Modal ── -->
    <div v-if="showStats" class="modal-overlay" @click.self="showStats = false">
      <div class="modal-card">

        <div class="modal-header">
          <div class="modal-icon">🏋️</div>
          <div class="modal-title">สรุปผลการออกกำลังกาย</div>
          <div class="modal-subtitle">ARM WORKOUT SUMMARY</div>
        </div>

        <div class="stat-grid">
          <div class="stat-item">
            <div class="stat-val">{{ finalStats.totalReps }}</div>
            <div class="stat-lbl">รอบทั้งหมด</div>
          </div>
          <div class="stat-item good">
            <div class="stat-val">{{ finalStats.repsOk }}</div>
            <div class="stat-lbl">รอบถูก</div>
          </div>
          <div class="stat-item bad">
            <div class="stat-val">{{ finalStats.repsBad }}</div>
            <div class="stat-lbl">รอบผิด</div>
          </div>
          <div class="stat-item score">
            <div class="stat-val">{{ finalStats.score }}</div>
            <div class="stat-lbl">คะแนน</div>
          </div>
        </div>

        <div class="stat-wide-row">
          <div class="stat-wide-item">
            <div class="stat-wide-icon">⏱</div>
            <div>
              <div class="stat-wide-val">{{ finalStats.avgTempo }} วิ/รอบ</div>
              <div class="stat-wide-lbl">ความเร็วเฉลี่ย (Tempo)</div>
            </div>
          </div>
          <div class="stat-wide-item" :class="accuracyClass">
            <div class="stat-wide-icon">🎯</div>
            <div>
              <div class="stat-wide-val">{{ finalStats.accuracy }}%</div>
              <div class="stat-wide-lbl">ความแม่นยำ</div>
            </div>
          </div>
        </div>

        <!-- Accuracy bar -->
        <div class="accuracy-bar-wrap">
          <div class="accuracy-bar-track">
            <div class="accuracy-bar-fill" :style="{ width: finalStats.accuracy + '%' }" :class="accuracyClass"></div>
          </div>
          <div class="accuracy-label">{{ accuracyText }}</div>
        </div>

        <ion-button expand="block" class="btn-close" @click="showStats = false">
          ✕ &nbsp; ปิด
        </ion-button>

      </div>
    </div>

  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { MotionService } from "../core/MotionService";
import { TtsService } from "../core/TtsService";
import { HapticsService } from "../core/HapticsService";
import { ArmWorkoutEngine } from "../core/ArmWorkoutEngine";
import type { WorkoutState } from "../core/types";

const state = ref<WorkoutState | null>(null);
const showStats = ref(false);
const finalStats = ref({
  totalReps: 0,
  repsOk: 0,
  repsBad: 0,
  score: 0,
  avgTempo: "0.0",
  accuracy: 0,
});

let prevRepCount = 0;
let lastMessage = "";

const engine = new ArmWorkoutEngine();
const motion = new MotionService();
const tts = new TtsService();
const haptics = new HapticsService();

const accuracyClass = computed(() => {
  const a = finalStats.value.accuracy;
  if (a >= 80) return "great";
  if (a >= 50) return "ok";
  return "poor";
});

const accuracyText = computed(() => {
  const a = finalStats.value.accuracy;
  if (a >= 80) return "ยอดเยี่ยม! 🔥";
  if (a >= 50) return "พอใช้ได้ 👍";
  return "ต้องฝึกเพิ่ม 💪";
});

onMounted(() => {
  engine.onChange(async (s) => {
    state.value = s;

    if (s.stats.repsOk > prevRepCount) {
      await haptics.success();
      prevRepCount = s.stats.repsOk;
    }

    if (s.stats.lastMessage && s.stats.lastMessage !== lastMessage) {
      if (s.stats.lastMessage !== "OK") {
        await haptics.warning();
        await tts.speak(s.stats.lastMessage);
      }
      lastMessage = s.stats.lastMessage;
    }
  });
});

async function start() {
  await tts.speak("เริ่มกายบริหารแขน ยกขึ้นจนสุดแล้วลดลง");
  engine.start();
  prevRepCount = 0;
  await motion.start((s) => engine.process(s));
}

async function stop() {
  await motion.stop();
  engine.stop();

  // ── รวบรวมสถิติ ──
  const s = state.value;
  if (s) {
    const total = (s.stats.repsOk ?? 0) + (s.stats.repsBad ?? 0);
    const accuracy = total > 0 ? Math.round((s.stats.repsOk / total) * 100) : 0;
    const avgTempo = total > 0 && s.stats.totalTime
      ? (s.stats.totalTime / total).toFixed(1)
      : "0.0";

    finalStats.value = {
      totalReps: total,
      repsOk: s.stats.repsOk ?? 0,
      repsBad: s.stats.repsBad ?? 0,
      score: s.stats.score ?? 0,
      avgTempo,
      accuracy,
    };
    showStats.value = true;
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;600;700;800&display=swap');

/* ── Toolbar ── */
.custom-toolbar {
  --background: #e4324d;
  --border-color: transparent;
}
.custom-title {
  font-family: 'Kanit', sans-serif;
  font-weight: 700;
  font-size: 1rem;
  letter-spacing: 0.12em;
  color: #fff;
  text-transform: uppercase;
}

/* ── Content ── */
.custom-content {
  --background: #311764;
  font-family: 'Kanit', sans-serif;
}

/* ── Hero Zone ── */
.hero-zone {
  background: #311764;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 36px 24px 48px;
  position: relative;
}
.hero-tag {
  font-family: 'Kanit', sans-serif;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.4em;
  color: rgba(255,255,255,0.75);
  text-transform: uppercase;
  margin-bottom: 24px;
}
.rep-circle {
  width: 190px;
  height: 190px;
  border-radius: 50%;
  background: rgba(255,255,255,0.18);
  border: 4px solid rgba(255,255,255,0.45);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow:
    0 0 0 10px rgba(255,255,255,0.08),
    0 12px 40px rgba(0,0,0,0.15);
}
.rep-number {
  font-family: 'Kanit', sans-serif;
  font-size: 5.5rem;
  font-weight: 800;
  color: #fff;
  line-height: 1;
  text-shadow: 0 3px 12px rgba(0,0,0,0.2);
}
.rep-unit {
  font-family: 'Kanit', sans-serif;
  font-size: 0.85rem;
  font-weight: 500;
  color: rgba(255,255,255,0.8);
  letter-spacing: 0.2em;
  text-transform: uppercase;
  margin-top: 2px;
}

/* ── Bottom Sheet ── */
.bottom-sheet {
  background: #311764;
  border-radius: 28px 28px 0 0;
  padding: 28px 24px 16px;
  margin-top: -20px;
  min-height: 100%;
}

.score-row {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}
.score-box {
  background: rgba(255,255,255,0.2);
  border: 2px solid rgba(255,255,255,0.35);
  border-radius: 16px;
  padding: 16px 56px;
  text-align: center;
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}
.score-val {
  font-family: 'Kanit', sans-serif;
  font-size: 2.4rem;
  font-weight: 800;
  color: #fff;
  line-height: 1;
}
.score-lbl {
  font-family: 'Kanit', sans-serif;
  font-size: 0.72rem;
  font-weight: 400;
  color: rgba(255,255,255,0.8);
  letter-spacing: 0.15em;
  text-transform: uppercase;
  margin-top: 3px;
}

.msg-box {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255,255,255,0.15);
  border-radius: 12px;
  padding: 14px 16px;
  margin-bottom: 20px;
  border: 1.5px solid rgba(255,255,255,0.25);
  transition: all 0.3s ease;
}
.msg-box.msg-active {
  background: rgba(178,67,66,0.25);
  border-color: rgba(255,120,120,0.5);
}
.msg-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255,255,255,0.4);
  flex-shrink: 0;
  transition: background 0.3s;
}
.msg-box.msg-active .msg-dot {
  background: #ff9090;
  box-shadow: 0 0 0 3px rgba(255,120,120,0.3);
}
.msg-text {
  font-family: 'Kanit', sans-serif;
  font-size: 0.92rem;
  font-weight: 400;
  color: rgba(255,255,255,0.75);
  line-height: 1.4;
}
.msg-box.msg-active .msg-text {
  color: #ffbbbb;
  font-weight: 500;
}

.btn-zone {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.btn-start {
  --background: #e4324d;
  --background-activated: #c85a22;
  --color: #fff;
  --border-radius: 14px;
  --box-shadow: 0 6px 20px rgba(228,108,50,0.4);
  height: 54px;
  font-family: 'Kanit', sans-serif;
  font-weight: 700;
  font-size: 1.05rem;
  letter-spacing: 0.1em;
}
.btn-stop {
  --background: rgba(255,255,255,0.15);
  --background-activated: rgba(255,255,255,0.25);
  --color: rgba(255,255,255,0.85);
  --border-radius: 14px;
  --box-shadow: none;
  --border-width: 1.5px;
  --border-style: solid;
  --border-color: rgba(255,255,255,0.3);
  height: 54px;
  font-family: 'Kanit', sans-serif;
  font-weight: 500;
  font-size: 1.05rem;
  letter-spacing: 0.1em;
}

/* Footer */
.custom-footer {
  --background: #e46c32;
  padding: 10px 24px !important;
}
.footer-text {
  font-family: 'Kanit', sans-serif;
  font-size: 0.75rem;
  font-weight: 300;
  color: rgba(255,255,255,0.8);
  text-align: center;
  letter-spacing: 0.05em;
}

/* ══════════════════════════════════════
   Stats Modal
══════════════════════════════════════ */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.55);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.25s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

.modal-card {
  background: #fff;
  border-radius: 28px 28px 0 0;
  padding: 28px 24px 32px;
  width: 100%;
  max-width: 480px;
  animation: slideUp 0.32s cubic-bezier(0.34,1.56,0.64,1);
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to   { transform: translateY(0); }
}

/* Modal Header */
.modal-header {
  text-align: center;
  margin-bottom: 24px;
}
.modal-icon {
  font-size: 2.4rem;
  margin-bottom: 6px;
}
.modal-title {
  font-family: 'Kanit', sans-serif;
  font-size: 1.2rem;
  font-weight: 700;
  color: #333;
}
.modal-subtitle {
  font-family: 'Kanit', sans-serif;
  font-size: 0.65rem;
  font-weight: 400;
  letter-spacing: 0.3em;
  color: #aaa;
  text-transform: uppercase;
  margin-top: 2px;
}

/* Stat Grid — 2×2 */
.stat-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 12px;
}
.stat-item {
  background: #f5f7ff;
  border-radius: 16px;
  padding: 16px 12px;
  text-align: center;
}
.stat-item.good { background: #edfaf3; }
.stat-item.bad  { background: #fff2f2; }
.stat-item.score { background: #f0f1ff; }

.stat-val {
  font-family: 'Kanit', sans-serif;
  font-size: 2rem;
  font-weight: 800;
  color: #333;
  line-height: 1;
}
.stat-item.good .stat-val  { color: #2e9e62; }
.stat-item.bad  .stat-val  { color: #b24342; }
.stat-item.score .stat-val { color: #6e7aaa; }

.stat-lbl {
  font-family: 'Kanit', sans-serif;
  font-size: 0.7rem;
  font-weight: 400;
  color: #999;
  letter-spacing: 0.1em;
  margin-top: 4px;
}

/* Wide items row */
.stat-wide-row {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}
.stat-wide-item {
  flex: 1;
  background: #f9f9f9;
  border-radius: 16px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1.5px solid #eee;
  transition: border-color 0.3s;
}
.stat-wide-item.great { border-color: #2e9e62; background: #edfaf3; }
.stat-wide-item.ok    { border-color: #f0a500; background: #fffbea; }
.stat-wide-item.poor  { border-color: #b24342; background: #fff2f2; }

.stat-wide-icon {
  font-size: 1.5rem;
}
.stat-wide-val {
  font-family: 'Kanit', sans-serif;
  font-size: 1.1rem;
  font-weight: 700;
  color: #333;
  line-height: 1;
}
.stat-wide-item.great .stat-wide-val { color: #2e9e62; }
.stat-wide-item.ok    .stat-wide-val { color: #f0a500; }
.stat-wide-item.poor  .stat-wide-val { color: #b24342; }

.stat-wide-lbl {
  font-family: 'Kanit', sans-serif;
  font-size: 0.68rem;
  color: #aaa;
  margin-top: 2px;
}

/* Accuracy bar */
.accuracy-bar-wrap {
  margin-bottom: 20px;
}
.accuracy-bar-track {
  height: 10px;
  background: #eee;
  border-radius: 99px;
  overflow: hidden;
  margin-bottom: 6px;
}
.accuracy-bar-fill {
  height: 100%;
  border-radius: 99px;
  background: #ccc;
  transition: width 0.6s cubic-bezier(0.34,1.56,0.64,1);
}
.accuracy-bar-fill.great { background: linear-gradient(90deg, #2e9e62, #5de0a0); }
.accuracy-bar-fill.ok    { background: linear-gradient(90deg, #f0a500, #ffd060); }
.accuracy-bar-fill.poor  { background: linear-gradient(90deg, #b24342, #e87070); }

.accuracy-label {
  font-family: 'Kanit', sans-serif;
  font-size: 0.8rem;
  font-weight: 500;
  color: #888;
  text-align: right;
}

/* Close button */
.btn-close {
  --background: #333;
  --background-activated: #111;
  --color: #fff;
  --border-radius: 14px;
  height: 50px;
  font-family: 'Kanit', sans-serif;
  font-weight: 600;
  font-size: 0.95rem;
  letter-spacing: 0.05em;
}
</style>