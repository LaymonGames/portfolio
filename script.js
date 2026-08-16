const secondHand = document.querySelector('.second-hand');
const minuteHand = document.querySelector('.minute-hand');
const hourHand = document.querySelector('.hour-hand');
const lemonHead = document.querySelector('.lemon-head');
const totalLemonFrames = 46;
let currentLemonFrameIndex = 1;
let targetLemonFrameIndex = 1;

function setHandAngle(hand, angle) {
  if (hand) {
    hand.style.setProperty('--rotation-angle', `${angle}deg`);
  }
}

function setLemonHeadTarget(clientX) {
  if (!lemonHead) return;
  const width = window.innerWidth || 1;
  const ratio = Math.min(Math.max(clientX / width, 0), 1);
  targetLemonFrameIndex = Math.round(ratio * (totalLemonFrames - 1)) + 1;
}

function updateLemonHeadFrame() {
  if (!lemonHead) return;
  const delta = targetLemonFrameIndex - currentLemonFrameIndex;
  if (Math.abs(delta) > 0.01) {
    currentLemonFrameIndex += delta * 0.22;
    const frameIndex = Math.round(currentLemonFrameIndex);
    const frameNumber = String(frameIndex).padStart(3, '0');
    lemonHead.src = `frames/frame_${frameNumber}.png`;
  }
  requestAnimationFrame(updateLemonHeadFrame);
}

function updateClock() {
  const now = new Date();
  const seconds = now.getSeconds();
  const minutes = now.getMinutes() + seconds / 60;
  const hours = (now.getHours() % 12) + minutes / 60;

  setHandAngle(secondHand, seconds * 6);
  setHandAngle(minuteHand, minutes * 6);
  setHandAngle(hourHand, hours * 30);
}

if (secondHand && minuteHand && hourHand) {
  updateClock();
  setInterval(updateClock, 1000);
}

if (lemonHead) {
  document.addEventListener('mousemove', (event) => {
    setLemonHeadTarget(event.clientX);
  });
  window.addEventListener('resize', () => {
    setLemonHeadTarget(window.innerWidth / 2);
  });
  setLemonHeadTarget(window.innerWidth / 2);
  requestAnimationFrame(updateLemonHeadFrame);
}