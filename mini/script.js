let targetDateValue = null;
let dayEndTimeValue = null;
function loadFromURL() {
  const params = new URLSearchParams(window.location.search);
  const dateParam = params.get('date');
  if (dateParam) {
      try {
          const targetDate = new Date(dateParam);
          if (!isNaN(targetDate.getTime())) {
              targetDateValue = targetDate;
          }
      } catch (e) {
          console.error('Invalid date parameter', e);
      }
  }
  dayEndTimeValue = params.get('dayEnd');
}
function updateContent(ele, value) {
  if (!ele) return; 
  const oldValue = ele.textContent;
  if (oldValue != null && oldValue != value) { 
    ele.textContent = value;
  }
}
function splitTime(seconds) {
  if (isNaN(seconds)) seconds = 0;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return {h, m, s};
}
function getDayEndTime() {
  const now = new Date();
  let targetTime = new Date();
  if (!dayEndTimeValue) {
    targetTime.setHours(0, 0, 0, 0); 
  } else {
    const [hours, minutes] = dayEndTimeValue.split(":").map(Number);
    targetTime.setHours(hours, minutes, 0, 0);
  }
  if (targetTime <= now) {
    targetTime.setDate(targetTime.getDate() + 1);
  }
  return targetTime;
}
function calculateDifference() {
    const now = new Date();    
    const dayTimeLeft = Math.ceil((getDayEndTime() - now) / 1000);
    const timeView = {
      days: 0, hours: 0, minutes: 0, seconds: 0
    };
    if (targetDateValue) {
      const target = targetDateValue;
      const relativity = target - now;
      const upcomingHour = new Date(now);
      upcomingHour.setHours(
        target.getHours(),
        target.getMinutes(),
        target.getSeconds(),
        target.getMilliseconds()
      );
      if (relativity > 0 && upcomingHour < now) upcomingHour.setDate(upcomingHour.getDate() + 1);
      if (relativity < 0 && upcomingHour > now) upcomingHour.setDate(upcomingHour.getDate() - 1);
      let diff = Math.abs(target - now);
      diff -= (diff % 1000); 
      let diffHour = Math.abs(upcomingHour - now);
      diffHour -= (diff % 1000); 
      if (relativity > 0) {
        diff += 1000; 
        diffHour += 1000; 
      }
      timeView.seconds = Math.floor(diffHour / 1000) % 60;
      timeView.minutes = Math.floor(diffHour / (1000 * 60)) % 60;
      timeView.hours = Math.floor(diffHour / (1000 * 60 * 60));
      timeView.days = Math.floor(diff / (1000 * 60 * 60 * 24));
    }
    updateContent(document.getElementById('days'), timeView.days);
    updateContent(document.getElementById('hours'), timeView.hours);
    updateContent(document.getElementById('minutes'), timeView.minutes);
    updateContent(document.getElementById('seconds'), timeView.seconds);
    const dayEndTimes = splitTime(dayTimeLeft);
    updateContent(document.getElementById('DEH'), dayEndTimes.h.toString().padStart(2,'0'));
    updateContent(document.getElementById('DEM'), dayEndTimes.m.toString().padStart(2,'0'));
    updateContent(document.getElementById('DES'), dayEndTimes.s.toString().padStart(2,'0'));
}
loadFromURL();
calculateDifference(); 
setInterval(calculateDifference, 1000);