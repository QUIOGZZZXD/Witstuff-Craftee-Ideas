// Countdown timer for Deal of the Day
const countdown = document.getElementById("countdown");

// Set target to next midnight
const targetDate = new Date();
targetDate.setHours(24, 0, 0, 0); // today’s 24:00 = tomorrow 00:00

function updateCountdown() {
  const now = new Date();
  const distance = targetDate - now;

  if (distance <= 0) {
    countdown.textContent = "Deal ended!";
    return;
  }

  const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((distance / (1000 * 60)) % 60);
  const seconds = Math.floor((distance / 1000) % 60);

  countdown.textContent = `${String(hours).padStart(2, '0')} : ${String(minutes).padStart(2, '0')} : ${String(seconds).padStart(2, '0')}`;
}

updateCountdown(); // run once immediately
setInterval(updateCountdown, 1000);
