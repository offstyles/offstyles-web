const time = function(time : number) {
  const prefix = time < 0 ? '-' : '';
  let seconds = Math.floor(Math.abs(time));
  const ms = Math.floor((time - seconds)*1000);
  const hours = Math.floor(seconds / 3600);
  seconds = Math.floor(seconds % 3600);
  const minutes = Math.floor(seconds / 60);
  seconds = Math.floor(seconds % 60);

  const hoursStr = ("00" + hours).slice(-2);
  const minutesStr = ("00" + minutes).slice(-2);
  const secondsStr = ("00" + seconds).slice(-2);
  const msStr = ("000" + ms).slice(-3);
  if(hours === 0){
    return prefix + minutesStr + ":" + secondsStr + "." + msStr;
  }
  return prefix + hoursStr + ":" + minutesStr + ":" + secondsStr + "." + msStr;
};

const timeDiff = function(time : number) {
  const prefix = time < 0 ? '-' : '+';
  let seconds = Math.floor(Math.abs(time));
  const ms = Math.floor((time - seconds)*1000);
  const hours = Math.floor(seconds / 3600);
  seconds = Math.floor(seconds % 3600);
  const minutes = Math.floor(seconds / 60);
  seconds = Math.floor(seconds % 60);

  const hoursStr = ("00" + hours).slice(-2);
  const minutesStr = ("00" + minutes).slice(-2);
  const secondsStr = ("00" + seconds).slice(-2);
  const msStr = ("000" + ms).slice(-3);
  if(hours === 0){
    return prefix + minutesStr + ":" + secondsStr + "." + msStr;
  }
  return prefix + hoursStr + ":" + minutesStr + ":" + secondsStr + "." + msStr;
};

const timeSince = function(date : number, comparisonDate = Date.now(), suffix = "ago", now = "Just Now") {
    const seconds = Math.floor((comparisonDate - date) / 1000);
    let interval = seconds / 31536000;
    if(date === null){
      return ' - ';
    }
    if(interval > 1){
      return Math.floor(interval) + " year"+(Math.floor(interval)>1?"s":"")+" "+suffix;
    }
    interval = seconds / 2592000;
    if(interval > 1){
      return Math.floor(interval) + " month"+(Math.floor(interval)>1?"s":"")+" "+suffix;
    }
    interval = seconds / 86400;
    if(interval > 1){
      return Math.floor(interval) + " day"+(Math.floor(interval)>1?"s":"")+" "+suffix;
    }
    interval = seconds / 3600;
    if(interval > 1){
      return Math.floor(interval) + " hour"+(Math.floor(interval)>1?"s":"")+" "+suffix;
    }
    interval = seconds / 60;
    if(interval > 1){
      return Math.floor(interval) + " minute"+(Math.floor(interval)>1?"s":"")+" "+suffix;
    }
    if(seconds >= 1){
      return Math.floor(seconds) + " second"+(Math.floor(seconds)>1?"s":"")+" "+suffix;
    }
    return now;
  };

const date = function(date : number){
  return new Date(date*1000).toLocaleDateString();
}

export default {time, timeDiff, timeSince, date};