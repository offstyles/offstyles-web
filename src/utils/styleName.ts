const styleName = function(styleID : number) {
    switch(styleID){
      case 190: return 'Normal';
      case 191: return 'Sideways';
      case 192: return 'W-Only';
      case 193: return 'Legit scroll';
      case 195: return 'Half-Sideways';
      case 196: return 'A/D-Only';
      case 197: return 'Segmented';
      default: return styleID;
    }
  };

export default styleName;