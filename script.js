function updateCurrentTime() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    };
    updateContent(
      document.getElementById('currentTime'), 
      now.toLocaleDateString('en-US', options)
    )
}
function loadFromURL() {
  const params = new URLSearchParams(window.location.search);
  const dateParam = params.get('date');
  if (dateParam) {
      try {
          const targetDate = new Date(dateParam);
          if (!isNaN(targetDate.getTime())) {
            const year = targetDate.getFullYear();
            const month = String(targetDate.getMonth() + 1).padStart(2, '0');
            const day = String(targetDate.getDate()).padStart(2, '0');
            const hours = String(targetDate.getHours()).padStart(2, '0');
            const minutes = String(targetDate.getMinutes()).padStart(2, '0');
            const dateTimeLocal = `${year}-${month}-${day}T${hours}:${minutes}`;
            document.getElementById('targetDateTime').value = dateTimeLocal;
          }
      } catch (e) {
          console.error('Invalid date parameter', e);
      }
  }
  const dayEndParam = params.get('dayEnd');
  if(dayEndParam) document.getElementById('dayEndTime').value = dayEndParam;
  calculateDifference();
}
function generateURL() {
  const url = new URL(window.location.href.split('?')[0]);
  const targetInput = document.getElementById('targetDateTime').value;
  if (targetInput) {
    const targetDate = new Date(targetInput);
    url.searchParams.set('date', targetDate.toISOString());
  }
  const dayEndTime = document.getElementById('dayEndTime').value;
  if (dayEndTime) {
    url.searchParams.set('dayEnd', dayEndTime);
  }
  return url.toString();
}
function updateURLWithoutReload() {
  const oldURL = window.location.href;
  const newURL = generateURL();
  if(oldURL !== newURL) {
    window.history.replaceState({}, '', newURL);
  }
}
function updateContent(ele, value) {
  const oldValue = ele?.textContent;
  if (oldValue != null && oldValue != value) { 
    ele.textContent = value;
  } else {
  }
}
function splitTime(seconds) {
  if (isNaN(seconds)) seconds = 0;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return {h,m,s}
}
function formatTime(seconds) {
  const {h,m,s} = splitTime(seconds);
  return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`
}
function getDayEndTime() {
  const now = new Date();
  let targetTime = new Date();
  const timeInput = document.getElementById("dayEndTime").value;
  if (!timeInput) {
    targetTime.setHours(0,0,0,0);
  } else {
    const [hours, minutes] = timeInput.split(":").map(Number);
    targetTime.setHours(hours, minutes, 0, 0);
  }
  if (targetTime <= now) {
    targetTime.setDate(targetTime.getDate() + 1);
  }
  return targetTime;
}
function calculateDifference() {
    const targetInput = document.getElementById('targetDateTime').value;
    const timeView = {
      relativity: 0,
      totalSeconds: 0,
      totalMinutes: 0,
      totalHours: 0,
      totalDays: 0,
      dayTimeLeft: 0,
      seconds: 0,
      minutes: 0,
      hours: 0,
      days: 0,
      months: 0,
      years: 0,
    }
    const now = new Date();    
    timeView.dayTimeLeft = Math.ceil((getDayEndTime() - now) / 1000);
    if (targetInput) {
      const target = new Date(targetInput);
      timeView.relativity = target - now;
      const upcomingHour = new Date(now); 
      upcomingHour.setHours(
        target.getHours(),
        target.getMinutes(),
        target.getSeconds(),
        target.getMilliseconds()
      );
      if (timeView.relativity > 0 && upcomingHour < now) upcomingHour.setDate(upcomingHour.getDate() + 1);
      if (timeView.relativity < 0 && upcomingHour > now) upcomingHour.setDate(upcomingHour.getDate() - 1);
      let diff = Math.abs(target - now);
      diff -= (diff % 1000); 
      let diffHour = Math.abs(upcomingHour - now);
      diffHour -= (diff % 1000); 
      if (timeView.relativity > 0) {
        diff += 1000; 
        diffHour += 1000; 
      }
      timeView.totalSeconds = Math.floor(diff / 1000);
      timeView.totalMinutes = Math.floor(timeView.totalSeconds / 60);
      timeView.totalHours = Math.floor(timeView.totalMinutes / 60);
      timeView.seconds = Math.floor(diffHour / 1000) % 60;
      timeView.minutes = Math.floor(diffHour / (1000 * 60)) % 60;
      timeView.hours = Math.floor(diffHour / (1000 * 60 * 60));
      timeView.days = Math.floor(diff / (1000 * 60 * 60 * 24));
    }
    updateContent(document.getElementById('days'), timeView.days);
    updateContent(document.getElementById('hours'), timeView.hours);
    updateContent(document.getElementById('minutes'), timeView.minutes);
    updateContent(document.getElementById('seconds'), timeView.seconds);
    updateContent(document.getElementById('totalHours'), timeView.totalHours.toLocaleString());
    updateContent(document.getElementById('totalMinutes'), timeView.totalMinutes.toLocaleString());
    updateContent(document.getElementById('totalSeconds'), timeView.totalSeconds.toLocaleString());
    const dayEndTimes = splitTime(timeView.dayTimeLeft);
    updateContent(document.getElementById('DEH'), dayEndTimes.h.toString().padStart(2,'0'));
    updateContent(document.getElementById('DEM'), dayEndTimes.m.toString().padStart(2,'0'));
    updateContent(document.getElementById('DES'), dayEndTimes.s.toString().padStart(2,'0'));
    const directionEl = document.getElementById('direction');
    if(timeView.relativity == 0) {
      updateContent(directionEl, "It's The Present");
      directionEl.className = 'direction future';
    } else {
      if (timeView.relativity > 0) {
        updateContent(directionEl, '➡️ This date is in the future');
        directionEl.className = 'direction future';
      } else {
        updateContent(directionEl, '⬅️ This date is in the past');
        directionEl.className = 'direction past';
      }
    }
}
loadFromURL();
document.getElementById('targetDateTime').addEventListener('change', function() {
  calculateDifference();
  updateURLWithoutReload(); 
});
document.getElementById('dayEndTime').addEventListener('change', function() {
  calculateDifference();
  updateURLWithoutReload(); 
});
document.getElementById('shareBtn').addEventListener('click', function() {
    const url = generateURL();
    navigator.clipboard.writeText(url).then(function() {
        const notification = document.createElement('div');
        notification.className = 'copied-notification';
        updateContent(notification, '✓ Link copied to clipboard!');
        document.body.appendChild(notification);
        setTimeout(function() {
            notification.remove();
        }, 3000);
    }).catch(function(err) {
        alert('Failed to copy link. URL: ' + url);
    });
});
function timeClick() {
  preserveSelection(()=>{
    updateCurrentTime();
    calculateDifference();
  });
}
updateURLWithoutReload(); 
timeClick();
setInterval(timeClick, 1000);
const transitionendListener = (e) => {
  if (e.propertyName === 'transform') {
    document.body.classList.remove("no-overflow")
    document.body.removeEventListener('transitionend', transitionendListener, true);
  }
}
document.body.addEventListener('transitionend', transitionendListener, true);
setTimeout(() => {
  document.body.classList.remove("loading");
}, 200);
