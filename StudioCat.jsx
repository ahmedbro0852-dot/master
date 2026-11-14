import React,{useId,useState} from 'react';

// A small self-contained SVG companion: no remote image, fonts, scripts or video.
// Motion is CSS-only, with a replayable interactive paw gesture.
export default function StudioCat({stage='queued',paused=false}){
 const uid=useId().replace(/:/g,'');
 const [play,playAgain]=useState(0);
 const fur='url(#cat-fur-'+uid+')';
 const face='url(#cat-face-'+uid+')';
 const floor='url(#cat-floor-'+uid+')';
 return <div className={'cat-lounge cat-lounge-natural cat-stage-'+stage+(paused?' cat-manually-paused':'')}>
  <span className="cat-window-light" aria-hidden="true"/>
  <span className="cat-scene-shadow" aria-hidden="true"/>
  <span className="cat-wool-ball" aria-hidden="true"/>
  <button className="cat-play-button" type="button" aria-label="العب مع القط وخليه يلوح بيده" title="اضغط عشان القط يلعب" onClick={()=>playAgain(v=>v+1)}>
   <svg className="realcat-svg" viewBox="0 0 220 180" role="img" aria-label="قط صغير بلون رملي يتنفس ويحرك ذيله ورأسه وعينيه">
    <defs>
     <linearGradient id={'cat-fur-'+uid} x1="0" x2="1" y1="0" y2="1"><stop offset="0%" stopColor="#8e7463"/><stop offset="37%" stopColor="#d2b8a1"/><stop offset="74%" stopColor="#b89c86"/><stop offset="100%" stopColor="#927b69"/></linearGradient>
     <radialGradient id={'cat-face-'+uid} cx="48%" cy="38%" r="73%"><stop offset="0%" stopColor="#f5e1c9"/><stop offset="63%" stopColor="#c7ab92"/><stop offset="100%" stopColor="#977d6b"/></radialGradient>
     <radialGradient id={'cat-floor-'+uid}><stop offset="0%" stopColor="#687a93" stopOpacity=".32"/><stop offset="100%" stopColor="#687a93" stopOpacity="0"/></radialGradient>
    </defs>
    <ellipse cx="112" cy="166" rx="83" ry="12" fill={floor}/>
    <g className="realcat-full">
     <g className="realcat-tail"><path d="M151 144 C172 154 198 137 197 113 C196 99 180 96 179 108" stroke="#826f60" strokeWidth="19" strokeLinecap="round" fill="none"/><path d="M150 141 C175 149 194 135 192 113 C191 107 185 105 181 109" stroke="#ccb09a" strokeWidth="13" strokeLinecap="round" fill="none"/><path d="M190 132 L197 124 M181 145 L189 138" stroke="#826f60" strokeWidth="3" strokeLinecap="round"/></g>
     <g className="realcat-body">
      <path d="M57 119 C62 90 88 84 112 91 C151 80 170 111 161 146 C153 174 68 175 57 145 Z" fill={fur}/>
      <ellipse className="realcat-breath" cx="108" cy="137" rx="40" ry="32" fill="#f1dfc8" opacity=".9"/>
      <path d="M82 107 C68 121 70 148 79 155 M142 103 C153 119 151 143 143 154" fill="none" stroke="#977d6a" strokeWidth="5" opacity=".5" strokeLinecap="round"/>
      <ellipse cx="81" cy="165" rx="23" ry="10" fill="#dfc5aa"/><ellipse cx="141" cy="165" rx="23" ry="10" fill="#d9b99b"/>
      <path d="M69 166 l2 -5 M81 169 l1 -6 M135 170 l1 -6 M147 167 l2 -5" stroke="#a48a76" strokeWidth="2" strokeLinecap="round"/>
     </g>
     <g className="realcat-head">
      <g className="realcat-ears">
       <path d="M65 74 Q51 33 62 16 Q76 23 89 51" fill={fur} stroke="#90725f" strokeWidth="2.2"/>
       <path d="M65 62 Q59 34 65 27 L80 51" fill="#d39395" opacity=".73"/>
       <g className="realcat-ear-twitch"><path d="M130 50 Q147 21 165 18 Q173 35 153 74" fill={fur} stroke="#90725f" strokeWidth="2.2"/><path d="M140 52 L161 30 Q163 49 153 62" fill="#d89b9b" opacity=".68"/></g>
      </g>
      <path d="M55 78 C55 49 73 35 112 35 C153 34 169 55 165 84 C163 116 146 139 111 142 C74 140 55 120 55 78Z" fill={face} stroke="#947d6d" strokeWidth="1.7"/>
      <path d="M81 48 Q87 58 83 66 M111 42 Q112 56 111 62 M140 48 Q133 58 138 67" fill="none" stroke="#936e61" opacity=".5" strokeWidth="4" strokeLinecap="round"/>
      <path d="M60 80 Q71 77 76 84 M161 80 Q148 77 144 84" fill="none" stroke="#997b66" opacity=".45" strokeWidth="4" strokeLinecap="round"/>
      <g className="realcat-eyes">
       <path d="M70 89 Q84 77 99 89 Q86 102 70 89Z" fill="#eee2b6" stroke="#715f52" strokeWidth="2"/>
       <path d="M123 88 Q139 77 153 90 Q139 104 123 88Z" fill="#eee2b6" stroke="#715f52" strokeWidth="2"/>
       <ellipse cx="85" cy="89" rx="7" ry="9" fill="#799b70"/><ellipse cx="138" cy="89" rx="7" ry="9" fill="#799b70"/>
       <ellipse className="realcat-pupils" cx="86" cy="89" rx="3" ry="8" fill="#292b25"/><ellipse className="realcat-pupils" cx="139" cy="89" rx="3" ry="8" fill="#292b25"/>
       <circle cx="88" cy="86" r="2.4" fill="#fff" opacity=".93"/><circle cx="141" cy="86" r="2.4" fill="#fff" opacity=".93"/>
      </g>
      <g className="realcat-muzzle">
       <ellipse cx="96" cy="113" rx="19" ry="14" fill="#f4e9db" opacity=".95"/><ellipse cx="128" cy="113" rx="19" ry="14" fill="#f4e9db" opacity=".95"/>
       <path d="M103 106 Q112 101 120 106 L112 114Z" fill="#ae7776"/>
       <path d="M112 114 v5 M112 119 Q106 125 100 121 M112 119 Q119 125 124 121" stroke="#765f57" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
       <circle cx="92" cy="111" r="1.3" fill="#856e62"/><circle cx="99" cy="116" r="1.3" fill="#856e62"/><circle cx="129" cy="112" r="1.3" fill="#856e62"/><circle cx="124" cy="117" r="1.3" fill="#856e62"/>
      </g>
      <g className="realcat-whiskers" stroke="#806f64" strokeWidth="1.25" fill="none" strokeLinecap="round" opacity=".76">
       <path d="M84 112 Q53 102 28 104 M84 117 Q51 118 24 125 M84 122 Q56 133 38 141 M140 112 Q168 102 192 104 M140 117 Q170 117 197 125 M140 121 Q169 133 186 140"/>
      </g>
      <path d="M91 130 Q110 136 132 130" stroke="#f8edde" strokeWidth="2" fill="none" opacity=".65"/>
     </g>
     <g className="realcat-play-paw" key={play}>
      <path d="M147 126 Q157 118 166 128 Q180 142 171 158 Q160 166 147 154" fill={fur} stroke="#977967" strokeWidth="2"/>
      <ellipse cx="166" cy="151" rx="11" ry="7" fill="#e6c9af" transform="rotate(-28 166 151)"/>
      <path d="M163 154 l-2 -4 M168 154 l-1 -4" stroke="#ac8d78" strokeWidth="1.4" strokeLinecap="round"/>
     </g>
    </g>
   </svg>
  </button>
  <div className="cat-scene-floor" aria-hidden="true"/>
  <p className="cat-companion-note">صاحبك الصغير مستني معاك <span>• اضغط عليه يلعب 🐾</span></p>
 </div>;
}
