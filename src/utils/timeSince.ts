const timeSince = function(date : number, comparisonDate = Date.now(), suffix = "ago", now = "Just Now") {

    let seconds = Math.floor((comparisonDate - date) / 1000);
  
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

export default timeSince;