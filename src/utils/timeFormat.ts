const timeFormat = function(time : number) {

    let seconds = Math.floor(time);
    const ms = Math.floor((time - seconds)*1000);
    const hours = Math.floor(seconds / 3600);
    seconds = Math.floor(seconds % 3600);
    const minutes = Math.floor(seconds / 60);
    seconds = Math.floor(seconds % 60);

    const hoursStr = ("00" + hours).slice(-2);
    const minutesStr = ("00" + minutes).slice(-2);
    const secondsStr = ("00" + seconds).slice(-2);
    const msStr = ("000" + ms).slice(-3);

    return hoursStr + ":" + minutesStr + ":" + secondsStr + "." + msStr;
  };

export default timeFormat;