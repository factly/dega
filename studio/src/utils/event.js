export const getEventName = (eventLabel) => {
    var labelArr = eventLabel.split('.');
    for (var i = 0; i < labelArr.length; i++) {
      labelArr[i] = labelArr[i][0].toUpperCase() + labelArr[i].slice(1);
    }
    return labelArr.join(' ');
  };