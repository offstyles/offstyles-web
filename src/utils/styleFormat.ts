import { Style } from "@/types/Style";

const name = function(style : Style) {
  switch(style){
    case Style.normal: return 'Normal';
    case Style.sideways: return 'Sideways';
    case Style.wonly: return 'W-Only';
    case Style.legit_scroll: return 'Legit scroll';
    case Style.half_sideways: return 'Half-Sideways';
    case Style.a_d_only: return 'A/D-Only';
    case Style.segmented: return 'Segmented';
    default: return '???';
  }
};

const styleFromName = function(name : string) {
  switch(name.toLowerCase()){
    case 'normal': return Style.normal;
    case 'sideways': return Style.sideways;
    case 'w-only': return Style.wonly;
    case 'legit scroll': return Style.legit_scroll;
    case 'half-sideways': return Style.half_sideways;
    case 'a/d-only': return Style.a_d_only;
    case 'segmented': return Style.segmented;
    default: return Style.normal;
  }
}

export default {name, styleFromName};