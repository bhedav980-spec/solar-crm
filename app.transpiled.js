const React = window.React;
const ReactDOM = window.ReactDOM;
const { useState, useEffect, useCallback, useRef, createElement, Fragment } = React;
const { createRoot } = ReactDOM;
const _useState = useState, _useEffect = useEffect, _useCallback = useCallback, _useRef = useRef;
//  3D & ANIMATION UTILITIES
const injectKeyframes = () => {
  if (document.getElementById('rs-animations')) return;
  const style = document.createElement('style');
  style.id = 'rs-animations';
  style.textContent = `
    @keyframes float { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-10px)} }
    @keyframes pulse-glow { 0%,100%{box-shadow:0 0 20px rgba(245,158,11,0.3)} 50%{box-shadow:0 0 40px rgba(245,158,11,0.6)} }
    @keyframes scale-in { 0%{transform:scale(0.9);opacity:0} 100%{transform:scale(1);opacity:1} }
    @keyframes slide-up { 0%{transform:translateY(30px);opacity:0} 100%{transform:translateY(0);opacity:1} }
    @keyframes slide-right { 0%{transform:translateX(-30px);opacity:0} 100%{transform:translateX(0);opacity:1} }
    @keyframes fade-in { 0%{opacity:0} 100%{opacity:1} }
    @keyframes gradient-shift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
    @keyframes sun-rays { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
    @keyframes bounce-in { 0%{transform:scale(0.3);opacity:0} 50%{transform:scale(1.05)} 70%{transform:scale(0.9)} 100%{transform:scale(1);opacity:1} }
    @keyframes progress-shine { 0%{left:-100%} 100%{left:200%} }
    @keyframes ring-spin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
    @keyframes hologram-flicker { 0%,100%{opacity:1} 5%{opacity:0.8} 10%{opacity:1} 15%{opacity:0.9} 20%{opacity:1} }
    @keyframes tilt-3d { 0%{transform:perspective(1000px) rotateX(0) rotateY(0)} 25%{transform:perspective(1000px) rotateX(2deg) rotateY(-2deg)} 75%{transform:perspective(1000px) rotateX(-2deg) rotateY(2deg)} 100%{transform:perspective(1000px) rotateX(0) rotateY(0)} }
  `;
  document.head.appendChild(style);
};

// Subtle solar dots background (screen only)
function ParticleBackground() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Skip on print
    if (window.matchMedia && window.matchMedia('print').matches) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    const particles = [];
    for (let i = 0; i < 25; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        speedX: (Math.random() - 0.5) * 0.15,
        speedY: (Math.random() - 0.5) * 0.15,
        opacity: Math.random() * 0.06 + 0.02
      });
    }
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = '#94a3b8';
        ctx.globalAlpha = p.opacity;
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      animationId = requestAnimationFrame(animate);
    };
    animate();
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);
  return /*#__PURE__*/React.createElement("canvas", {
    ref: canvasRef,
    style: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: 0
    }
  });
}

// Clean Card component
function Card3D({
  children,
  style = {},
  onClick,
  glow = false
}) {
  const [isHovered, setIsHovered] = useState(false);
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClick,
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false),
    style: {
      background: '#ffffff',
      border: `1px solid ${isHovered ? '#c5c9d0' : '#e2e5e9'}`,
      borderRadius: '12px',
      boxShadow: isHovered ? '0 8px 24px rgba(0, 0, 0, 0.08)' : '0 1px 3px rgba(0, 0, 0, 0.05)',
      transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
      cursor: onClick ? 'pointer' : 'default',
      position: 'relative',
      overflow: 'hidden',
      ...style
    }
  }, children);
}

// Animated counter
function AnimatedCounter({
  value,
  prefix = '',
  suffix = '',
  duration = 2000
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setIsVisible(true);
    }, {
      threshold: 0.1
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!isVisible) return;
    const numericValue = parseFloat(value.toString().replace(/[^0-9.]/g, ''));
    if (isNaN(numericValue)) {
      setDisplayValue(value);
      return;
    }
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(numericValue * eased * 100) / 100);
      if (progress < 1) requestAnimationFrame(animate);
    };
    animate();
  }, [isVisible, value, duration]);
  return /*#__PURE__*/React.createElement("span", {
    ref: ref,
    style: {
      display: 'inline-block'
    }
  }, prefix, typeof displayValue === 'number' ? displayValue.toLocaleString('en-IN') : displayValue, suffix);
}

// ─── SVG ICONS ───────────────────────────────────────────────────────────────
function Svg({
  paths,
  size = 15,
  stroke = "currentColor",
  sw = 2,
  fill = "none"
}) {
  return /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: fill,
    stroke: stroke,
    strokeWidth: sw,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: {
      display: "inline-block",
      flexShrink: 0
    }
  }, paths.map((d, i) => /*#__PURE__*/React.createElement("path", {
    key: i,
    d: d
  })));
}
const HomeIc = ({
  size = 15
}) => /*#__PURE__*/React.createElement(Svg, {
  size: size,
  paths: ["m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", "M9 22V12h6v10"]
});
const UsersIc = ({
  size = 15
}) => /*#__PURE__*/React.createElement(Svg, {
  size: size,
  paths: ["M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2", "M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8", "M23 21v-2a4 4 0 0 0-3-3.87", "M16 3.13a4 4 0 0 1 0 7.75"]
});
const FileIc = ({
  size = 15
}) => /*#__PURE__*/React.createElement(Svg, {
  size: size,
  paths: ["M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z", "M14 2v6h6", "M16 13H8", "M16 17H8", "M10 9H8"]
});
const GearIc = ({
  size = 15
}) => /*#__PURE__*/React.createElement(Svg, {
  size: size,
  paths: ["M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16z", "M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z", "M12 2v2", "M12 20v2", "M4.93 4.93l1.41 1.41", "M17.66 17.66l1.41 1.41", "M2 12h2", "M20 12h2", "M6.34 17.66l-1.41 1.41", "M19.07 4.93l-1.41 1.41"]
});
const BoxIc = ({
  size = 15
}) => /*#__PURE__*/React.createElement(Svg, {
  size: size,
  paths: ["M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z", "M3.27 6.96 12 12.01l8.73-5.05", "M12 22.08V12"]
});
const WalletIc = ({
  size = 15
}) => /*#__PURE__*/React.createElement(Svg, {
  size: size,
  paths: ["M20 12V22H4V12", "M22 7H2v5h20V7z", "M12 22V7", "M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z", "M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"]
});
const ChartIc = ({
  size = 15
}) => /*#__PURE__*/React.createElement(Svg, {
  size: size,
  paths: ["M3 3v18h18", "M18 17V9", "M13 17V5", "M8 17v-3"]
});
const TagIc = ({
  size = 15
}) => /*#__PURE__*/React.createElement(Svg, {
  size: size,
  paths: ["M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z", "M7 7h.01"]
});
const UserCogIc = ({
  size = 15
}) => /*#__PURE__*/React.createElement(Svg, {
  size: size,
  paths: ["M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2", "M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8", "M19 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4", "M22 10h-2", "M19 13v-2"]
});
const LogOutIc = ({
  size = 15
}) => /*#__PURE__*/React.createElement(Svg, {
  size: size,
  paths: ["M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4", "M16 17l5-5-5-5", "M21 12H9"]
});
const PlusIc = ({
  size = 15
}) => /*#__PURE__*/React.createElement(Svg, {
  size: size,
  paths: ["M12 5v14", "M5 12h14"]
});
const XIc = ({
  size = 15
}) => /*#__PURE__*/React.createElement(Svg, {
  size: size,
  paths: ["M18 6 6 18", "M6 6l12 12"]
});
const PrintIc = ({
  size = 15
}) => /*#__PURE__*/React.createElement(Svg, {
  size: size,
  paths: ["M6 9V2h12v7", "M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2", "M6 14h12v8H6z"]
});
const DlIc = ({
  size = 15
}) => /*#__PURE__*/React.createElement(Svg, {
  size: size,
  paths: ["M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", "M7 10l5 5 5-5", "M12 15V3"]
});
const SearchIc = ({
  size = 15
}) => /*#__PURE__*/React.createElement(Svg, {
  size: size,
  paths: ["M11 17.25a6.25 6.25 0 1 0 0-12.5 6.25 6.25 0 0 0 0 12.5z", "M16 16l4.5 4.5"]
});
const PencilIc = ({
  size = 15
}) => /*#__PURE__*/React.createElement(Svg, {
  size: size,
  paths: ["M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"]
});
const TrashIc = ({
  size = 15
}) => /*#__PURE__*/React.createElement(Svg, {
  size: size,
  paths: ["M3 6h18", "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6", "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"]
});
const CheckIc = ({
  size = 15
}) => /*#__PURE__*/React.createElement(Svg, {
  size: size,
  paths: ["M22 11.08V12a10 10 0 1 1-5.93-9.14", "M22 4 12 14.01l-3-3"]
});
const ZapIc = ({
  size = 15
}) => /*#__PURE__*/React.createElement(Svg, {
  size: size,
  paths: ["M13 2 3 14h9l-1 8 10-12h-9l1-8z"]
});
const TrendIc = ({
  size = 15
}) => /*#__PURE__*/React.createElement(Svg, {
  size: size,
  paths: ["M23 6l-9.5 9.5-5-5L1 18", "M17 6h6v6"]
});
const WarnIc = ({
  size = 15
}) => /*#__PURE__*/React.createElement(Svg, {
  size: size,
  paths: ["M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z", "M12 9v4", "M12 17h.01"]
});
const HandIc = ({
  size = 15
}) => /*#__PURE__*/React.createElement(Svg, {
  size: size,
  paths: ["M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"]
});
const EyeIc = ({
  size = 15
}) => /*#__PURE__*/React.createElement(Svg, {
  size: size,
  paths: ["M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z", "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"]
});
const SunIc = ({
  size = 15
}) => /*#__PURE__*/React.createElement(Svg, {
  size: size,
  paths: ["M12 1v2", "M12 21v2", "M4.22 4.22l1.42 1.42", "M18.36 18.36l1.42 1.42", "M1 12h2", "M21 12h2", "M4.22 19.78l1.42-1.42", "M18.36 5.64l1.42-1.42", "M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10z"]
});

// ─── PRICE DATA ─────────────────────────────────────────────────────────────
const BIFACIAL_BASE = [{
  nos: 4,
  kw: 2.18,
  ADANI: 124540,
  WAAREE: 122740,
  APS: 116140
}, {
  nos: 5,
  kw: 2.725,
  ADANI: 146175,
  WAAREE: 145050,
  APS: 136800
}, {
  nos: 6,
  kw: 3.27,
  ADANI: 171310,
  WAAREE: 167460,
  APS: 157560
}, {
  nos: 7,
  kw: 3.815,
  ADANI: 184945,
  WAAREE: 180570,
  APS: 169020
}, {
  nos: 8,
  kw: 4.36,
  ADANI: 208840,
  WAAREE: 202880,
  APS: 189680
}, {
  nos: 9,
  kw: 4.905,
  ADANI: 249715,
  WAAREE: 243240,
  APS: 228390
}, {
  nos: 10,
  kw: 5.45,
  ADANI: 267910,
  WAAREE: 260700,
  APS: 244200
}, {
  nos: 11,
  kw: 5.995,
  ADANI: 298985,
  WAAREE: 291110,
  APS: 272960
}, {
  nos: 12,
  kw: 6.54,
  ADANI: 324620,
  WAAREE: 315720,
  APS: 295920
}, {
  nos: 13,
  kw: 7.085,
  ADANI: 346255,
  WAAREE: 336630,
  APS: 315180
}, {
  nos: 14,
  kw: 7.63,
  ADANI: 367890,
  WAAREE: 357740,
  APS: 334640
}, {
  nos: 15,
  kw: 8.175,
  ADANI: 385125,
  WAAREE: 373550,
  APS: 348800
}, {
  nos: 16,
  kw: 8.72,
  ADANI: 406160,
  WAAREE: 393860,
  APS: 367460
}, {
  nos: 17,
  kw: 9.265,
  ADANI: 429295,
  WAAREE: 416070,
  APS: 388020
}, {
  nos: 18,
  kw: 9.81,
  ADANI: 453430,
  WAAREE: 440180,
  APS: 410480
}];
const TOPCON_BASE = [{
  nos: 4,
  PAHAL: {
    kw: 2.4,
    p: 124300
  },
  ADANI: {
    kw: 2.48,
    p: 138040
  },
  WAAREE: {
    kw: 2.32,
    p: 125640
  },
  APS: {
    kw: 2.4,
    p: 118440
  }
}, {
  nos: 5,
  PAHAL: {
    kw: 3.0,
    p: 151500
  },
  ADANI: {
    kw: 3.10,
    p: 161700
  },
  WAAREE: {
    kw: 2.9,
    p: 148400
  },
  APS: {
    kw: 3.0,
    p: 139400
  }
}, {
  nos: 6,
  PAHAL: {
    kw: 3.6,
    p: 172700
  },
  ADANI: {
    kw: 3.72,
    p: 183860
  },
  WAAREE: {
    kw: 3.48,
    p: 172360
  },
  APS: {
    kw: 3.6,
    p: 161560
  }
}, {
  nos: 7,
  PAHAL: {
    kw: 4.2,
    p: 192400
  },
  ADANI: {
    kw: 4.34,
    p: 221020
  },
  WAAREE: {
    kw: 4.06,
    p: 198120
  },
  APS: {
    kw: 4.2,
    p: 185520
  }
}, {
  nos: 8,
  PAHAL: {
    kw: 4.8,
    p: 210600
  },
  ADANI: {
    kw: 4.96,
    p: 258880
  },
  WAAREE: {
    kw: 4.64,
    p: 219280
  },
  APS: {
    kw: 4.8,
    p: 204880
  }
}, {
  nos: 9,
  PAHAL: {
    kw: 5.4,
    p: 236800
  },
  ADANI: {
    kw: 5.58,
    p: 276740
  },
  WAAREE: {
    kw: 5.22,
    p: 249940
  },
  APS: {
    kw: 5.4,
    p: 233740
  }
}, {
  nos: 10,
  PAHAL: {
    kw: 6.0,
    p: 262600
  },
  ADANI: {
    kw: 6.20,
    p: 308600
  },
  WAAREE: {
    kw: 5.8,
    p: 265100
  },
  APS: {
    kw: 6.0,
    p: 247100
  }
}, {
  nos: 11,
  PAHAL: {
    kw: 6.6,
    p: 306700
  },
  ADANI: {
    kw: 6.82,
    p: 343960
  },
  WAAREE: {
    kw: 6.38,
    p: 317760
  },
  APS: {
    kw: 6.6,
    p: 297960
  }
}, {
  nos: 12,
  PAHAL: {
    kw: 7.2,
    p: 334400
  },
  ADANI: {
    kw: 7.44,
    p: 300820
  },
  WAAREE: {
    kw: 6.96,
    p: 339920
  },
  APS: {
    kw: 7.2,
    p: 318320
  }
}, {
  nos: 13,
  PAHAL: {
    kw: 7.8,
    p: 352100
  },
  ADANI: {
    kw: 8.06,
    p: 420480
  },
  WAAREE: {
    kw: 7.54,
    p: 361780
  },
  APS: {
    kw: 7.8,
    p: 338380
  }
}, {
  nos: 14,
  PAHAL: {
    kw: 8.4,
    p: 379300
  },
  ADANI: {
    kw: 8.68,
    p: 445640
  },
  WAAREE: {
    kw: 8.12,
    p: 383480
  },
  APS: {
    kw: 8.4,
    p: 358280
  }
}, {
  nos: 15,
  PAHAL: {
    kw: 9.0,
    p: 396500
  },
  ADANI: {
    kw: 9.30,
    p: 473900
  },
  WAAREE: {
    kw: 8.7,
    p: 405900
  },
  APS: {
    kw: 9.0,
    p: 378900
  }
}, {
  nos: 16,
  PAHAL: {
    kw: 9.6,
    p: 419200
  },
  ADANI: {
    kw: 9.92,
    p: 511060
  },
  WAAREE: {
    kw: 9.28,
    p: 420560
  },
  APS: {
    kw: 9.6,
    p: 391760
  }
}];
const STAGES = ["Lead Received", "Site Survey", "Quotation Sent", "Quote Approved", "Loan Processing", "Loan Approved", "Work Order Issued", "Installation", "Testing & Commissioning", "PGVCL / Net Meter", "Subsidy Applied", "Completed"];
const STAGE_COLOR = {
  "Lead Received": "#718096",
  "Site Survey": "#d97706",
  "Quotation Sent": "#0284c7",
  "Quote Approved": "#16a34a",
  "Loan Processing": "#7c3aed",
  "Loan Approved": "#0891b2",
  "Work Order Issued": "#ea580c",
  "Installation": "#dc2626",
  "Testing & Commissioning": "#ca8a04",
  "PGVCL / Net Meter": "#0284c7",
  "Subsidy Applied": "#16a34a",
  "Completed": "#15803d"
};
const DOCS = ["Aadhaar Card", "PGVCL / Electricity Bill", "Bank Passbook / Statement", "Property Proof (7/12 or Sale Deed)", "Passport Photo", "Cancelled Cheque", "Site Survey Report", "Technical Feasibility Certificate (PGVCL)", "Net Meter Application Form", "Consent Letter", "Form 27 (Subsidy Claim)", "Commissioning Certificate"];
const NOT_INSTALL_REASONS = ["Loan Pending", "Material Shortage", "Site Not Ready", "Customer Requested Delay", "Documentation Pending", "Other"];
const STRUCTURE_TABLE = {
  4: {
    p40: 2,
    p60: 3
  },
  5: {
    p40: 3,
    p60: 3
  },
  6: {
    p40: 3,
    p60: 4
  },
  7: {
    p40: 3,
    p60: 4
  },
  8: {
    p40: 4,
    p60: 4
  },
  9: {
    p40: 4,
    p60: 5
  },
  10: {
    p40: 4,
    p60: 5
  },
  11: {
    p40: 5,
    p60: 6
  },
  12: {
    p40: 5,
    p60: 6
  },
  13: {
    p40: 6,
    p60: 6
  },
  14: {
    p40: 6,
    p60: 6
  },
  15: {
    p40: 6,
    p60: 7
  },
  16: {
    p40: 6,
    p60: 7
  },
  17: {
    p40: 6,
    p60: 8
  }
};

// ─── HELPERS ────────────────────────────────────────────────────────────────
function calcSubsidy(kw) {
  if (kw <= 2) return {
    c1: 30000,
    c2: 0,
    state: 0,
    agreement: 350,
    total: 30000
  };
  return {
    c1: 30000,
    c2: 18000,
    state: 30000,
    agreement: 350,
    total: 78000
  };
}
function numToWords(num) {
  num = Math.round(num);
  if (num === 0) return "Zero";
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const two = n => n < 20 ? ones[n] : tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
  const three = n => n < 100 ? two(n) : ones[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + two(n % 100) : "");
  let crore = Math.floor(num / 10000000);
  num %= 10000000;
  let lakh = Math.floor(num / 100000);
  num %= 100000;
  let thou = Math.floor(num / 1000);
  num %= 1000;
  const parts = [];
  if (crore) parts.push(three(crore) + " Crore");
  if (lakh) parts.push(three(lakh) + " Lakh");
  if (thou) parts.push(three(thou) + " Thousand");
  if (num) parts.push(three(num));
  return parts.join(" ");
}
const amountToWords = n => `${numToWords(n)} Rupees Only`;
function genBOM(q) {
  const wattage = q.nos ? Math.round(q.kw * 1000 / q.nos) : 0;
  return [{
    comp: "PV Module",
    brand: `${q.brand} ${q.panelType === "TOPCON" ? "TOPCon" : "Bifacial"}`,
    spec: `${wattage} Wp`,
    qty: `${q.nos} Nos.`
  }, {
    comp: "Grid Tie Inverter",
    brand: q.inverterBrand,
    spec: `${q.inverterKw} kW`,
    qty: "1 No."
  }, {
    comp: "Mounting Structure",
    brand: "Hot Dip Galvanized",
    spec: "60x40mm Legs & Rafter, 40x40mm Purlin",
    qty: "As per Design"
  }, {
    comp: "AC Distribution Box",
    brand: "Schneider",
    spec: "Standard",
    qty: "1 Set"
  }, {
    comp: "DC Distribution Box",
    brand: "Schneider",
    spec: "Standard",
    qty: "1 Set"
  }, {
    comp: "Earthing Kit with LA",
    brand: "As per Standard",
    spec: "Copper",
    qty: "1 Set"
  }, {
    comp: "AC & DC Cables",
    brand: "Finolex / Polycab",
    spec: "Standard",
    qty: "As per Requirement"
  }, {
    comp: "LA Earthing Cable",
    brand: "Weecab / Jainflex",
    spec: "Standard",
    qty: "As per Requirement"
  }, {
    comp: "Online Monitoring System",
    brand: "OMS",
    spec: "Mobile App + Remote Monitoring",
    qty: "1 No."
  }];
}
function genMaterialReq(p) {
  const s = STRUCTURE_TABLE[p.nos];
  const wattage = p.kw && p.nos ? Math.round(p.kw * 1000 / p.nos) : "-";
  return [{
    item: `${p.panelBrand || ""} ${p.panelType === "TOPCON" ? "TOPCon" : "Bifacial"} Solar Panel`.trim(),
    spec: `${wattage} Wp`,
    qty: p.nos || "-",
    unit: "Nos"
  }, {
    item: `${p.inverterBrand || "Grid Tie"} Inverter`,
    spec: `${p.inverterKw || "-"} kW`,
    qty: 1,
    unit: "No."
  }, {
    item: "GI Pipe Structure",
    spec: "40x40mm (Purlin)",
    qty: s ? s.p40 : "Per design",
    unit: "Pcs"
  }, {
    item: "GI Pipe Structure",
    spec: "60x40mm (Legs & Rafter)",
    qty: s ? s.p60 : "Per design",
    unit: "Pcs"
  }, {
    item: "AC Cable",
    spec: "4 Sqmm",
    qty: "15+15",
    unit: "Mtr"
  }, {
    item: "DC Cable",
    spec: "4 Sqmm",
    qty: 40,
    unit: "Mtr"
  }, {
    item: "Earthing Cable",
    spec: "2.5 Sqmm",
    qty: 40,
    unit: "Mtr"
  }, {
    item: "LA Cable",
    spec: "16 Sqmm",
    qty: 20,
    unit: "Mtr"
  }, {
    item: "RPVC Pipe",
    spec: "25mm",
    qty: 10,
    unit: "Pcs"
  }, {
    item: "AC Distribution Box",
    spec: "Schneider Standard",
    qty: 1,
    unit: "Set"
  }, {
    item: "DC Distribution Box",
    spec: "Schneider Standard",
    qty: 1,
    unit: "Set"
  }, {
    item: "Earthing Kit with LA",
    spec: "Copper",
    qty: 1,
    unit: "Set"
  }, {
    item: "Online Monitoring",
    spec: "OMS App",
    qty: 1,
    unit: "No."
  }];
}
const inr = n => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const today = () => new Date().toISOString().split("T")[0];
const genRef = (pfx, n) => `RS/${pfx}/${new Date().getFullYear()}/${String(n).padStart(3, "0")}`;
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

// ── FIX #1: literal newline replaced with proper "\n" escape ──────────────
function downloadCSV(filename, rows) {
  const csv = rows.map(r => r.map(c => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;"
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── STORAGE ────────────────────────────────────────────────────────────────
const SK = "rs_solar_crm_v4";
const SUPABASE_URL = "https://bsvxqhxyexhbgysnfgal.supabase.co";
const SUPABASE_KEY = "sb_publishable_yg-F8bDfTJEZPAHr38TwJw_Yue23cpg";
const CLOUD_ROW_ID = "main";
const OWNER_EMAIL = "bhedav980@gmail.com";
const AUTH_TOKEN_KEY = "rs_supabase_access_token";
const DEF = {
  customers: [],
  quotes: [],
  projects: [],
  dealers: [],
  inventory: [],
  expenses: [],
  priceList: {
    BIFACIAL: BIFACIAL_BASE,
    TOPCON: TOPCON_BASE
  },
  counters: {
    QT: 0,
    PR: 0,
    INV: 0
  },
  team: [{
    id: "u1",
    name: "Salman",
    role: "admin",
    district: "",
    pin: ""
  }],
  user: "",
  loggedIn: false
};
async function loadD() {
  try {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) return { ...DEF, loggedIn: false };
    const response = await fetch(`${SUPABASE_URL}/rest/v1/crm_state?id=eq.${CLOUD_ROW_ID}&select=data`, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${token}`
      },
      cache: "no-store"
    });
    if (!response.ok) throw new Error(`Cloud load failed: ${response.status}`);
    const rows = await response.json();
    if (rows.length && rows[0].data) return { ...DEF, ...rows[0].data };

    // First run: upload this device's existing data, if any.
    const old = localStorage.getItem(SK);
    const initial = old ? { ...DEF, ...JSON.parse(old) } : DEF;
    await saveD(initial);
    return initial;
  } catch (error) {
    console.error("Cloud load failed", error);
    const old = localStorage.getItem(SK);
    return old ? { ...DEF, ...JSON.parse(old) } : DEF;
  }
}
async function saveD(d) {
  try {
    // Local copy is retained only as an offline backup.
    localStorage.setItem(SK, JSON.stringify(d));
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) return;
    const response = await fetch(`${SUPABASE_URL}/rest/v1/crm_state?on_conflict=id`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=minimal"
      },
      body: JSON.stringify({
        id: CLOUD_ROW_ID,
        data: d,
        updated_at: new Date().toISOString()
      })
    });
    if (!response.ok) throw new Error(`Cloud save failed: ${response.status} ${await response.text()}`);
  } catch (e) {
    console.error("Save failed", e);
  }
}

// ─── DESIGN TOKENS ───────────────────────────────────────────────────────────
const PAGE_BG = "#f5f6f8";
const CARD_BG = "#ffffff";
const BORDER = "#e2e5e9";
const BORDER_SOFT = "#f0f1f3";
const TXT = "#1a1a2e";
const TXT2 = "#4a5568";
const TXT3 = "#718096";
const BLUE = "#2563eb";
const BLUE_BG = "rgba(37, 99, 235, 0.08)";
const GREEN = "#16a34a";
const GREEN_BG = "rgba(22, 163, 74, 0.08)";
const AMBER = "#d97706";
const AMBER_BG = "rgba(217, 119, 6, 0.08)";
const RED = "#dc2626";
const RED_BG = "rgba(220, 38, 38, 0.08)";
const VIOLET = "#7c3aed";
const IS = {
  width: "100%",
  boxSizing: "border-box",
  background: "#f8f9fa",
  border: "1px solid #d1d5db",
  borderRadius: "10px",
  padding: "11px 14px",
  color: "#1a1a2e",
  fontSize: "14px",
  outline: "none",
  fontFamily: "inherit",
  transition: "all 0.2s ease"
};
const SS = {
  ...IS,
  cursor: "pointer",
  background: "#f8f9fa"
};
const BP = {
  background: "#2563eb",
  color: "#fff",
  border: "none",
  borderRadius: "10px",
  padding: "11px 22px",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: "14px",
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  transition: "all 0.2s ease",
  position: "relative",
  overflow: "hidden"
};
const BS = {
  background: "#f8f9fa",
  color: "#1a1a2e",
  border: "1px solid #d1d5db",
  borderRadius: "10px",
  padding: "11px 22px",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: "14px",
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  transition: "all 0.2s ease"
};
const BD = {
  ...BS,
  color: "#dc2626",
  borderColor: "rgba(220,38,38,0.3)"
};
const SMALL = {
  padding: "6px 14px",
  fontSize: "12px"
};

// ─── BRAND ────────────────────────────────────────────────────────────────────
function Logo({
  size = 44
}) {
  return /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    viewBox: "0 0 100 100",
    xmlns: "http://www.w3.org/2000/svg",
    style: {
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("linearGradient", {
    id: "logoGrad",
    x1: "0%",
    y1: "0%",
    x2: "100%",
    y2: "100%"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0%",
    style: {
      stopColor: "#f59e0b"
    }
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "100%",
    style: {
      stopColor: "#22c55e"
    }
  }))), /*#__PURE__*/React.createElement("circle", {
    cx: "50",
    cy: "50",
    r: "46",
    fill: "none",
    stroke: "url(#logoGrad)",
    strokeWidth: "3",
    opacity: "0.3"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "50",
    cy: "50",
    r: "40",
    fill: "none",
    stroke: "url(#logoGrad)",
    strokeWidth: "2",
    opacity: "0.5",
    strokeDasharray: "5,5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M50 10 L50 90 M10 50 L90 50 M22 22 L78 78 M22 78 L78 22",
    stroke: "url(#logoGrad)",
    strokeWidth: "1",
    opacity: "0.2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M56 10 L30 54 L46 54 L40 90 L70 46 L52 46 Z",
    fill: "url(#logoGrad)",
   
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "50",
    cy: "50",
    r: "8",
    fill: "#f59e0b",
   
  }));
}
function BrandName({
  size = 18
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: `${size}px`,
      fontWeight: 800,
      lineHeight: 1.15,
      fontFamily: "'Inter',sans-serif"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: { color: "#22c55e", fontWeight: 900 }
  }, "R"), /*#__PURE__*/React.createElement("span", {
    style: { color: TXT }
  }, "atneswar "), /*#__PURE__*/React.createElement("span", {
    style: { color: "#3b82f6", fontWeight: 900 }
  }, "E"), /*#__PURE__*/React.createElement("span", {
    style: { color: TXT }
  }, "ngineering"));
}

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────
function Modal({
  title,
  onClose,
  children,
  wide
}) {
  const scrollRef = useRef(null);
  const savedScroll = useRef(0);
  // Save scroll on every scroll event
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => { savedScroll.current = el.scrollTop; };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);
  // Restore scroll after every render (prevents jump on state update)
  useEffect(() => {
    if (scrollRef.current && savedScroll.current > 0) {
      scrollRef.current.scrollTop = savedScroll.current;
    }
  });
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.4)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      padding: "12px",
      animation: "fade-in 0.3s ease"
    }
  }, /*#__PURE__*/React.createElement("div", {
    ref: scrollRef,
    style: {
      background: "#ffffff",
      border: "1px solid #e2e5e9",
      borderRadius: "16px",
      width: "100%",
      maxWidth: wide ? "880px" : "560px",
      maxHeight: "92vh",
      overflowY: "auto",
      boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
      animation: "slide-up 0.4s ease"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "20px 24px",
      borderBottom: "1px solid #e2e5e9",
      position: "sticky",
      top: 0,
      background: "#ffffff",
      zIndex: 1,
      borderRadius: "16px 16px 0 0"
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      color: "#1a1a2e",
      fontWeight: 700,
      fontSize: "18px"
    }
  }, title), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      background: "none",
      border: "none",
      color: TXT3,
      cursor: "pointer",
      padding: "4px",
      display: "flex",
      transition: "color 0.3s"
    },
    onMouseEnter: e => e.target.style.color = AMBER,
    onMouseLeave: e => e.target.style.color = TXT3
  }, /*#__PURE__*/React.createElement(XIc, {
    size: 20
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "24px"
    }
  }, children)));
}
function Fld({
  label,
  children,
  half
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: "16px",
      flex: half ? "1 1 45%" : "1 1 100%"
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      display: "block",
      color: TXT3,
      fontSize: "11px",
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: "0.08em",
      marginBottom: "6px"
    }
  }, label), children);
}
function Badge({
  label,
  color = GREEN
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      background: `${color}20`,
      color,
      border: `1px solid ${color}40`,
      borderRadius: "20px",
      padding: "4px 12px",
      fontSize: "11px",
      fontWeight: 700,
      whiteSpace: "nowrap",
    }
  }, label);
}
function SectionTitle({
  children,
  right
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "14px",
      flexWrap: "wrap",
      gap: "8px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      color: TXT,
      fontSize: "14px",
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: "0.05em"
    }
  }, children), right);
}
function StatCard({
  icon,
  val,
  label,
  color,
  animate = true
}) {
  return /*#__PURE__*/React.createElement(Card3D, {
    style: {
      padding: "20px"
    },
    glow: true
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: "44px",
      height: "44px",
      borderRadius: "12px",
      background: `${color}20`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: "14px",
      color,
      
    }
  }, icon), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "28px",
      fontWeight: 800,
      color: TXT,
      
    }
  }, animate ? /*#__PURE__*/React.createElement(AnimatedCounter, {
    value: val
  }) : val), /*#__PURE__*/React.createElement("div", {
    style: {
      color: TXT3,
      fontSize: "13px",
      marginTop: "4px",
      fontWeight: 500
    }
  }, label));
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function Login({
  data,
  persist
}) {
  const [sel, setSel] = useState(data.team[0]?.id || "");
  const [pin, setPin] = useState("");
  const [err, setErr] = useState("");
  const selMember = data.team.find(t => t.id === sel);
  async function doLogin() {
    if (!pin) return setErr("Password daalein.");
    setErr("");
    try {
      const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: "POST",
        headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ email: OWNER_EMAIL, password: pin })
      });
      const auth = await response.json();
      if (!response.ok || !auth.access_token) throw new Error(auth.error_description || auth.msg || "Login failed");
      localStorage.setItem(AUTH_TOKEN_KEY, auth.access_token);
      location.reload();
    } catch (error) {
      setErr(error.message || "Email ya password galat hai.");
    }
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#f5f6f8",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement(ParticleBackground, null), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      background: "radial-gradient(circle at 20% 80%, rgba(245,158,11,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(34,197,94,0.08) 0%, transparent 50%)",
      pointerEvents: "none"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#ffffff",
      border: "1px solid #e2e5e9",
      borderRadius: "16px",
      padding: "48px",
      width: "100%",
      maxWidth: "420px",
      textAlign: "center",
      boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
      position: "relative",
      zIndex: 10,
      animation: "slide-up 0.6s ease"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "center",
      marginBottom: "20px",
      
    }
  }, /*#__PURE__*/React.createElement(Logo, {
    size: 64
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "center",
      marginBottom: "8px"
    }
  }, /*#__PURE__*/React.createElement(BrandName, {
    size: 22
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      color: TXT3,
      fontSize: "12px",
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      marginBottom: "36px"
    }
  }, "Solar Division \u2014 CRM & Operations"), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "left"
    }
  }, /*#__PURE__*/React.createElement(Fld, {
    label: "Admin Email"
  }, /*#__PURE__*/React.createElement("select", {
    style: SS,
    value: sel,
    onChange: e => {
      setSel(e.target.value);
      setPin("");
      setErr("");
    }
  }, /*#__PURE__*/React.createElement("option", {
    key: "owner",
    value: sel
  }, OWNER_EMAIL))), /*#__PURE__*/React.createElement(Fld, {
    label: "Password"
  }, /*#__PURE__*/React.createElement("input", {
    style: IS,
    type: "password",
    value: pin,
    onChange: e => {
      setPin(e.target.value);
      setErr("");
    },
    placeholder: "Supabase account password",
    onKeyDown: e => e.key === "Enter" && doLogin()
  })), err && /*#__PURE__*/React.createElement("div", {
    style: {
      color: RED,
      fontSize: "13px",
      marginBottom: "14px",
      padding: "8px 12px",
      background: RED_BG,
      borderRadius: "8px",
      border: "1px solid rgba(239,68,68,0.2)"
    }
  }, err), /*#__PURE__*/React.createElement("button", {
    style: {
      ...BP,
      width: "100%",
      justifyContent: "center",
      fontSize: "16px",
      padding: "14px"
    },
    onClick: doLogin
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: "relative",
      zIndex: 1
    }
  }, "Login to Dashboard"))), /*#__PURE__*/React.createElement("div", {
    style: {
      color: TXT3,
      fontSize: "12px",
      marginTop: "18px"
    }
  }, "Secure Supabase Owner Login")));
}

// ═══════════════════════════════ MAIN APP ═════════════════════════════════════
function App() {
  const [data, setData] = useState(null);
  const [tab, setTab] = useState("dashboard");
  const [modal, setModal] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    injectKeyframes();
    loadD().then(d => {
      console.log("DATA LOADED", d);
      setData(d);
      setLoading(false);
    }).catch(err => {
      console.error("LOAD ERROR", err);
      setLoading(false);
    });
  }, []);
  const persist = useCallback(d => {
    setData(d);
    saveD(d);
  }, []);
  if (loading || !data) return /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#f5f6f8",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: TXT2,
      flexDirection: "column",
      gap: "16px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      
    }
  }, /*#__PURE__*/React.createElement(Logo, {
    size: 56
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "14px",
      color: TXT3,
      animation: "pulse-glow 2s ease-in-out infinite",
      padding: "8px 16px",
      borderRadius: "8px"
    }
  }, "Loading Ratneswar Solar CRM..."));
  if (!data.loggedIn) return /*#__PURE__*/React.createElement(Login, {
    data: data,
    persist: persist
  });
  const me = data.team.find(t => t.id === data.user) || data.team[0];
  const isAdmin = me?.role === "admin";
  const isPartner = !isAdmin;
  const getCust = id => data.customers.find(c => c.id === id) || {};
  const getProj = id => data.projects.find(p => p.id === id);
  const getDealer = id => data.dealers.find(d => d.id === id);
  const visCustomers = isAdmin ? data.customers : data.customers.filter(c => c.district === me.district);
  const visQuotes = isAdmin ? data.quotes : data.quotes.filter(q => visCustomers.some(c => c.id === q.customerId));
  const visProjects = isAdmin ? data.projects : data.projects.filter(p => visCustomers.some(c => c.id === p.customerId));

  // ── CUSTOMER MODAL ──────────────────────────────────────────────────────────
  function CustomerModal({
    doc,
    onClose
  }) {
    const ed = !!doc?.id;
    const [f, setF] = useState(doc || {
      name: "",
      phone: "",
      email: "",
      address: "",
      village: "",
      taluka: "",
      district: isPartner ? me.district : "Kutch",
      state: "Gujarat",
      discom: "PGVCL",
      type: "Residential",
      consumerNo: ""
    });
    const s = k => e => setF(p => ({
      ...p,
      [k]: e.target.value
    }));
    function save() {
      if (!f.name || !f.phone) return alert("Name & Phone required");
      const customers = ed ? data.customers.map(c => c.id === doc.id ? {
        ...f
      } : c) : [{
        ...f,
        id: `C${uid()}`,
        createdAt: today(),
        createdBy: me.id
      }, ...data.customers];
      persist({
        ...data,
        customers
      });
      onClose();
    }
    return /*#__PURE__*/React.createElement(Modal, {
      title: ed ? "Edit Customer" : "New Customer",
      onClose: onClose
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexWrap: "wrap",
        gap: "0 16px"
      }
    }, /*#__PURE__*/React.createElement(Fld, {
      label: "Full Name *",
      half: true
    }, /*#__PURE__*/React.createElement("input", {
      style: IS,
      value: f.name,
      onChange: s("name"),
      placeholder: "Customer full name"
    })), /*#__PURE__*/React.createElement(Fld, {
      label: "Mobile *",
      half: true
    }, /*#__PURE__*/React.createElement("input", {
      style: IS,
      value: f.phone,
      onChange: s("phone"),
      placeholder: "+91 XXXXX XXXXX"
    })), /*#__PURE__*/React.createElement(Fld, {
      label: "Email",
      half: true
    }, /*#__PURE__*/React.createElement("input", {
      style: IS,
      value: f.email,
      onChange: s("email"),
      placeholder: "email@example.com"
    })), /*#__PURE__*/React.createElement(Fld, {
      label: "Customer Type",
      half: true
    }, /*#__PURE__*/React.createElement("select", {
      style: SS,
      value: f.type,
      onChange: s("type")
    }, ["Residential", "Commercial", "Industrial", "Institutional"].map(t => /*#__PURE__*/React.createElement("option", {
      key: t
    }, t)))), /*#__PURE__*/React.createElement(Fld, {
      label: "PGVCL Consumer No.",
      half: true
    }, /*#__PURE__*/React.createElement("input", {
      style: IS,
      value: f.consumerNo,
      onChange: s("consumerNo"),
      placeholder: "Consumer account number"
    })), /*#__PURE__*/React.createElement(Fld, {
      label: "DISCOM",
      half: true
    }, /*#__PURE__*/React.createElement("select", {
      style: SS,
      value: f.discom,
      onChange: s("discom")
    }, ["PGVCL", "MGVCL", "DGVCL", "UGVCL"].map(d => /*#__PURE__*/React.createElement("option", {
      key: d
    }, d))))), /*#__PURE__*/React.createElement(Fld, {
      label: "Address / Village"
    }, /*#__PURE__*/React.createElement("input", {
      style: IS,
      value: f.village,
      onChange: s("village"),
      placeholder: "Village / Street"
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexWrap: "wrap",
        gap: "0 16px"
      }
    }, /*#__PURE__*/React.createElement(Fld, {
      label: "Taluka",
      half: true
    }, /*#__PURE__*/React.createElement("input", {
      style: IS,
      value: f.taluka,
      onChange: s("taluka"),
      placeholder: "e.g. Rapar"
    })), /*#__PURE__*/React.createElement(Fld, {
      label: "District",
      half: true
    }, /*#__PURE__*/React.createElement("input", {
      style: IS,
      value: f.district,
      onChange: s("district"),
      disabled: isPartner
    }))), /*#__PURE__*/React.createElement(Fld, {
      label: "Full Address (for quote)"
    }, /*#__PURE__*/React.createElement("textarea", {
      style: {
        ...IS,
        minHeight: "70px",
        resize: "vertical"
      },
      value: f.address,
      onChange: s("address"),
      placeholder: "Full address as it should appear on quotation"
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: "10px",
        justifyContent: "flex-end",
        marginTop: "8px"
      }
    }, /*#__PURE__*/React.createElement("button", {
      style: BS,
      onClick: onClose
    }, "Cancel"), /*#__PURE__*/React.createElement("button", {
      style: BP,
      onClick: save
    }, ed ? "Update Customer" : "Add Customer")));
  }

  // ── QUOTE MODAL ─────────────────────────────────────────────────────────────
  function QuoteModal({
    onClose
  }) {
    const PL = data.priceList;
    const [f, setF] = useState({
      customerId: "",
      panelType: "TOPCON",
      brand: "WAAREE",
      nos: 7,
      inverterBrand: "KSOLE",
      inverterKw: "5.0",
      validity: 15,
      notes: "",
      scheme: "National Subsidy Scheme",
      dealerName: "",
      commissionPercent: 5
    });
    const sf = k => e => setF(p => ({
      ...p,
      [k]: e.target.value
    }));
    const tableData = f.panelType === "BIFACIAL" ? PL.BIFACIAL : PL.TOPCON;
    const row = tableData.find(r => r.nos === Number(f.nos));
    const kw = row ? f.panelType === "BIFACIAL" ? row.kw : row[f.brand]?.kw || 0 : 0;
    const [overridePrice, setOverridePrice] = useState(null);
    const basePriceCalc = row ? f.panelType === "BIFACIAL" ? row[f.brand] || 0 : row[f.brand]?.p || 0 : 0;
    const basePrice = overridePrice !== null ? Number(overridePrice) : basePriceCalc;
    const sub = calcSubsidy(kw);
    const brands = f.panelType === "BIFACIAL" ? ["ADANI", "WAAREE", "APS"] : ["PAHAL", "ADANI", "WAAREE", "APS"];
    function create() {
      if (!f.customerId) return alert("Please select a customer");
      if (!basePrice) return alert("Invalid panel selection");
      const cust = getCust(f.customerId);
      let dealers = data.dealers,
        dealerId = "";
      const trimmedName = (f.dealerName || "").trim();
      if (trimmedName) {
        const existing = dealers.find(d => d.name.toLowerCase() === trimmedName.toLowerCase());
        if (existing) {
          dealerId = existing.id;
        } else {
          const nd = {
            id: `D${uid()}`,
            name: trimmedName,
            phone: "",
            district: cust.district || "",
            commissionPercent: Number(f.commissionPercent) || 5,
            advancePaid: 0,
            createdAt: today()
          };
          dealers = [nd, ...dealers];
          dealerId = nd.id;
        }
      }
      const n = data.counters.QT + 1;
      const q = {
        id: `QT${uid()}`,
        ref: genRef("QT", n),
        ...f,
        nos: Number(f.nos),
        kw,
        basePrice,
        subsidy: sub,
        netPayable: basePrice,
        dealerId,
        dealerName: trimmedName,
        commissionPercent: 0,
        commissionAmount: Number(f.commissionAmount) || 0,
        status: "Draft",
        createdBy: me.id,
        createdAt: today()
      };
      persist({
        ...data,
        quotes: [q, ...data.quotes],
        dealers,
        counters: {
          ...data.counters,
          QT: n
        }
      });
      onClose();
    }
    return /*#__PURE__*/React.createElement(Modal, {
      title: "Generate Quotation",
      onClose: onClose,
      wide: true
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "24px"
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Fld, {
      label: "Customer *"
    }, /*#__PURE__*/React.createElement("select", {
      style: SS,
      value: f.customerId,
      onChange: sf("customerId")
    }, /*#__PURE__*/React.createElement("option", {
      value: ""
    }, "-- Select Customer --"), visCustomers.map(c => /*#__PURE__*/React.createElement("option", {
      key: c.id,
      value: c.id
    }, c.name, " \u2014 ", c.phone)))), /*#__PURE__*/React.createElement(Fld, {
      label: "Scheme"
    }, /*#__PURE__*/React.createElement("select", {
      style: SS,
      value: f.scheme,
      onChange: sf("scheme")
    }, ["National Subsidy Scheme", "Without Subsidy", "Commercial"].map(s => /*#__PURE__*/React.createElement("option", {
      key: s
    }, s)))), /*#__PURE__*/React.createElement(Fld, {
      label: "Panel Technology"
    }, /*#__PURE__*/React.createElement("select", {
      style: SS,
      value: f.panelType,
      onChange: e => {
        setF(p => ({
          ...p,
          panelType: e.target.value,
          brand: e.target.value === "BIFACIAL" ? "ADANI" : "WAAREE"
        }));
        setOverridePrice(null);
      }
    }, /*#__PURE__*/React.createElement("option", null, "BIFACIAL"), /*#__PURE__*/React.createElement("option", null, "TOPCON"))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: "12px"
      }
    }, /*#__PURE__*/React.createElement(Fld, {
      label: "Brand",
      half: true
    }, /*#__PURE__*/React.createElement("select", {
      style: SS,
      value: f.brand,
      onChange: e => {
        sf("brand")(e);
        setOverridePrice(null);
      }
    }, brands.map(b => /*#__PURE__*/React.createElement("option", {
      key: b
    }, b)))), /*#__PURE__*/React.createElement(Fld, {
      label: "No. of Panels",
      half: true
    }, /*#__PURE__*/React.createElement("select", {
      style: SS,
      value: f.nos,
      onChange: e => {
        setF(p => ({
          ...p,
          nos: Number(e.target.value)
        }));
        setOverridePrice(null);
      }
    }, tableData.map(r => /*#__PURE__*/React.createElement("option", {
      key: r.nos,
      value: r.nos
    }, r.nos, " panels"))))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: "12px"
      }
    }, /*#__PURE__*/React.createElement(Fld, {
      label: "Inverter Brand",
      half: true
    }, /*#__PURE__*/React.createElement("input", {
      style: IS,
      value: f.inverterBrand,
      onChange: sf("inverterBrand")
    })), /*#__PURE__*/React.createElement(Fld, {
      label: "Inverter kW",
      half: true
    }, /*#__PURE__*/React.createElement("input", {
      style: IS,
      value: f.inverterKw,
      onChange: sf("inverterKw")
    }))), /*#__PURE__*/React.createElement(Fld, {
      label: `Gross Amount (₹) — editable, list price: ${inr(basePriceCalc)}`
    }, /*#__PURE__*/React.createElement("input", {
      style: IS,
      type: "number",
      value: basePrice,
      onChange: e => setOverridePrice(e.target.value)
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: "12px"
      }
    }, /*#__PURE__*/React.createElement(Fld, {
      label: "Dealer / Agent Name (type any name)",
      half: true
    }, /*#__PURE__*/React.createElement("input", {
      style: IS,
      list: "dealer-suggestions",
      value: f.dealerName,
      onChange: sf("dealerName"),
      placeholder: "Optional \u2014 koi bhi naam"
    }), /*#__PURE__*/React.createElement("datalist", {
      id: "dealer-suggestions"
    }, data.dealers.map(d => /*#__PURE__*/React.createElement("option", {
      key: d.id,
      value: d.name
    })))), /*#__PURE__*/React.createElement(Fld, {
      label: "Commission Amount (\u20B9)",
      half: true
    }, /*#__PURE__*/React.createElement("input", {
      style: IS,
      type: "number",
      value: f.commissionAmount || "",
      onChange: sf("commissionAmount"),
      placeholder: "e.g. 5000"
    }))), /*#__PURE__*/React.createElement(Fld, {
      label: "Validity (Days)"
    }, /*#__PURE__*/React.createElement("input", {
      style: IS,
      type: "number",
      value: f.validity,
      onChange: sf("validity")
    })), /*#__PURE__*/React.createElement(Fld, {
      label: "Notes / Remarks"
    }, /*#__PURE__*/React.createElement("textarea", {
      style: {
        ...IS,
        minHeight: "70px",
        resize: "vertical"
      },
      value: f.notes,
      onChange: sf("notes")
    }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#f8f9fa",
        border: "1px solid #e2e5e9",
        borderRadius: "12px",
        padding: "24px",
        position: "sticky",
        top: "20px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#4a5568",
        fontSize: "12px",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        marginBottom: "16px"
      }
    }, "Price Summary"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "center",
        alignItems: "baseline",
        gap: "8px",
        marginBottom: "22px",
        background: "#f8f9fa",
        borderRadius: "12px",
        padding: "16px",
        border: "1px solid #e2e5e9"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: AMBER,
        fontSize: "42px",
        fontWeight: 800,
        
      }
    }, kw), /*#__PURE__*/React.createElement("span", {
      style: {
        color: TXT2,
        fontSize: "16px"
      }
    }, "kW"), /*#__PURE__*/React.createElement("span", {
      style: {
        color: TXT3,
        fontSize: "13px",
        marginLeft: "6px"
      }
    }, f.nos, " panels \u2022 ", f.brand)), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#16a34a",
        borderRadius: "10px",
        padding: "14px 18px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "16px",
        boxShadow: "0 8px 25px rgba(22,163,74,0.2)"
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#dcfce7",
        fontSize: "11px",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.05em"
      }
    }, "Amount Payable to Company"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "#bbf7d0",
        fontSize: "11px",
        marginTop: "2px"
      }
    }, "Grand Total \u2014 Incl. GST")), /*#__PURE__*/React.createElement("span", {
      style: {
        color: "#fff",
        fontWeight: 800,
        fontSize: "21px"
      }
    }, inr(basePrice))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: AMBER_BG,
        border: "1px solid rgba(245,158,11,0.3)",
        borderRadius: "12px",
        padding: "14px 16px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: AMBER,
        fontSize: "11px",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        marginBottom: "10px"
      }
    }, "Customer's Govt Subsidy (paid separately)"), [["Central Subsidy (≤2kW)", inr(sub.c1)], ...(kw > 2 ? [["Central Subsidy (>2kW)", inr(sub.c2)], ["State Subsidy", inr(sub.state)]] : []), ["Total Subsidy Benefit", inr(sub.total)], ["Agreement Charges", `₹${sub.agreement}`]].map((r, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "6px",
        fontSize: "12px"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: AMBER,
        opacity: 0.85
      }
    }, r[0]), /*#__PURE__*/React.createElement("span", {
      style: {
        color: AMBER,
        fontWeight: 700
      }
    }, r[1]))))))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: "10px",
        justifyContent: "flex-end",
        marginTop: "16px"
      }
    }, /*#__PURE__*/React.createElement("button", {
      style: BS,
      onClick: onClose
    }, "Cancel"), /*#__PURE__*/React.createElement("button", {
      style: BP,
      onClick: create
    }, "Generate Quotation")));
  }

  // ── PRINTABLE QUOTE VIEW ────────────────────────────────────────────────────
  function QuotePrint({
    q,
    onClose
  }) {
    const c = getCust(q.customerId);
    const bom = genBOM(q);
    // All BOM items pre-selected; user can deselect any
    const [selectedBom, setSelectedBom] = useState(() => new Set(bom.map((_, i) => i)));
    const td = {
      padding: "7px 10px",
      border: "1px solid #d1d5db",
      fontSize: "12px",
      color: "#1a1a2e"
    };
    const th = {
      ...td,
      background: "#f0f1f3",
      color: "#1a1a2e",
      textAlign: "left",
      fontWeight: 700,
      fontSize: "11px",
      textTransform: "uppercase",
      letterSpacing: "0.03em"
    };
    return /*#__PURE__*/React.createElement(Modal, {
      title: `Quotation ${q.ref}`,
      onClose: onClose,
      wide: true
    }, /*#__PURE__*/React.createElement("div", {
      id: "print-area",
      style: {
        background: "#ffffff",
        color: "#1a1a2e",
        padding: "32px",
        borderRadius: "8px",
        fontFamily: "'Inter', Arial, sans-serif",
        fontSize: "13px",
        lineHeight: 1.5
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "flex-start",
        gap: "20px",
        borderBottom: "2px solid #1a1a2e",
        paddingBottom: "16px",
        marginBottom: "20px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: { flexShrink: 0 }
    }, /*#__PURE__*/React.createElement(Logo, {
      size: 56
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        textAlign: "left"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "22px",
        fontWeight: 800,
        color: "#1a1a2e",
        letterSpacing: "0.02em"
      }
    }, "RATNESWAR ENGINEERING"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "11px",
        color: "#4a5568",
        marginTop: "4px",
        lineHeight: 1.6
      }
    }, "Office No. 19, Sanghvi Square Complex, Salarinaka, Rapar-Kutch, Rapar, Gujarat - 370165", /*#__PURE__*/React.createElement("br", null), "Mob: +91 84010 50053 | GSTIN: 24ABKFR8021K1ZZ | PAN: ABKFR8021K")), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "right",
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#f0fdf4",
        border: "1px solid #16a34a",
        borderRadius: "4px",
        padding: "3px 10px",
        color: "#16a34a",
        fontWeight: 700,
        fontSize: "10px"
      }
    }, "GEDA Approved"), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#f0fdf4",
        border: "1px solid #16a34a",
        borderRadius: "4px",
        padding: "3px 10px",
        color: "#16a34a",
        fontWeight: 700,
        fontSize: "10px"
      }
    }, "MNRE Approved"))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "14px",
        background: "#f8f9fa",
        padding: "10px 14px",
        borderRadius: "6px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: { fontSize: "12px" }
    }, /*#__PURE__*/React.createElement("strong", null, "Quotation No:"), " ", /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "monospace",
        fontWeight: 700
      }
    }, q.ref), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("strong", null, "Date:"), " ", q.createdAt), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "right",
        fontSize: "12px"
      }
    }, /*#__PURE__*/React.createElement("strong", null, "Validity:"), " ", /*#__PURE__*/React.createElement("strong", null, q.validity, " Days"), " from date of issue")), /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: "4px",
        fontWeight: 700,
        fontSize: "12px"
      }
    }, "To,"), /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: "16px",
        background: "#f8f9fa",
        padding: "12px 14px",
        borderRadius: "6px",
        borderLeft: "3px solid #2563eb"
      }
    }, /*#__PURE__*/React.createElement("strong", {
      style: {
        fontSize: "15px"
      }
    }, c.name), /*#__PURE__*/React.createElement("br", null), c.address || c.village, c.taluka ? `, ${c.taluka}` : "", ", ", c.district, c.state ? `, ${c.state}` : "", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 600
      }
    }, "Contact: ", c.phone), c.consumerNo ? ` | Consumer No: ${c.consumerNo} (${c.discom})` : ""), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "center",
        fontWeight: 700,
        marginBottom: "16px",
        fontSize: "14px",
        background: "#1e3a5f",
        color: "#fff",
        padding: "10px",
        borderRadius: "6px"
      }
    }, "SUBJECT: ", q.kw, " kW Rooftop Solar (", q.scheme, ")"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700,
        marginBottom: "8px",
        fontSize: "13px"
      }
    }, "DETAILS OF SUPPLY"), /*#__PURE__*/React.createElement("table", {
      style: {
        width: "100%",
        borderCollapse: "collapse",
        marginBottom: "14px"
      }
    }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
      style: {
        ...th,
        textAlign: "center",
        width: "50px"
      }
    }, "Sr. No"), /*#__PURE__*/React.createElement("th", {
      style: th
    }, "Description of Goods"), /*#__PURE__*/React.createElement("th", {
      style: {
        ...th,
        textAlign: "center"
      }
    }, "HSN Code"), /*#__PURE__*/React.createElement("th", {
      style: {
        ...th,
        textAlign: "center"
      }
    }, "Qty"), /*#__PURE__*/React.createElement("th", {
      style: {
        ...th,
        textAlign: "right"
      }
    }, "Unit Rate"), /*#__PURE__*/React.createElement("th", {
      style: {
        ...th,
        textAlign: "right"
      }
    }, "Amount"))), /*#__PURE__*/React.createElement("tbody", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
      style: {
        ...td,
        textAlign: "center",
        fontWeight: 700
      }
    }, "1"), /*#__PURE__*/React.createElement("td", {
      style: td
    }, /*#__PURE__*/React.createElement("strong", null, "Rooftop Solar System"), " under ", q.scheme, " — ", q.brand, " ", q.panelType, " (", q.nos, " panels) with ", q.inverterBrand, " ", q.inverterKw, "kW Inverter"), /*#__PURE__*/React.createElement("td", {
      style: {
        ...td,
        textAlign: "center"
      }
    }, "-"), /*#__PURE__*/React.createElement("td", {
      style: {
        ...td,
        textAlign: "center",
        fontWeight: 700
      }
    }, q.kw, " kW"), /*#__PURE__*/React.createElement("td", {
      style: {
        ...td,
        textAlign: "right"
      }
    }, "₹", (q.basePrice / q.kw).toFixed(2)), /*#__PURE__*/React.createElement("td", {
      style: {
        ...td,
        textAlign: "right",
        fontWeight: 700
      }
    }, inr(q.basePrice))))), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "right",
        fontWeight: 700,
        fontSize: "15px",
        marginBottom: "18px",
        background: "#f0fdf4",
        padding: "12px 18px",
        borderRadius: "6px",
        border: "1px solid #bbf7d0"
      }
    }, "Grand Total (Including GST): ", /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "18px"
      }
    }, inr(q.basePrice))), /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700,
        marginBottom: "6px",
        fontSize: "13px"
      }
    }, "SUBSIDY DETAILS"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "11px",
        color: "#4a5568",
        marginBottom: "10px",
        fontStyle: "italic"
      }
    }, "(Credited directly to customer by Government — NOT deducted from above amount)"), /*#__PURE__*/React.createElement("table", {
      style: {
        width: "65%",
        marginLeft: "auto",
        borderCollapse: "collapse",
        marginBottom: "18px"
      }
    }, /*#__PURE__*/React.createElement("tbody", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
      style: {
        ...td,
        background: "#f8f9fa"
      }
    }, "Central Subsidy (Upto 2 kW)"), /*#__PURE__*/React.createElement("td", {
      style: {
        ...td,
        textAlign: "right",
        fontWeight: 700,
        color: "#16a34a"
      }
    }, inr(q.subsidy.c1))), q.kw > 2 && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
      style: {
        ...td,
        background: "#f8f9fa"
      }
    }, "Central Subsidy (Above 2 kW)"), /*#__PURE__*/React.createElement("td", {
      style: {
        ...td,
        textAlign: "right",
        fontWeight: 700,
        color: "#16a34a"
      }
    }, inr(q.subsidy.c2))), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
      style: {
        ...td,
        background: "#f8f9fa"
      }
    }, "State Subsidy (Above 2 kW)"), /*#__PURE__*/React.createElement("td", {
      style: {
        ...td,
        textAlign: "right",
        fontWeight: 700,
        color: "#16a34a"
      }
    }, inr(q.subsidy.state)))), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
      style: {
        ...td,
        background: "#f8f9fa"
      }
    }, "Agreement Charges"), /*#__PURE__*/React.createElement("td", {
      style: {
        ...td,
        textAlign: "right",
        fontWeight: 700
      }
    }, "₹", q.subsidy.agreement, ".00")), /*#__PURE__*/React.createElement("tr", {
      style: {
        fontWeight: 700,
        background: "#f0fdf4"
      }
    }, /*#__PURE__*/React.createElement("td", {
      style: td
    }, "Total Subsidy"), /*#__PURE__*/React.createElement("td", {
      style: {
        ...td,
        textAlign: "right",
        color: "#16a34a",
        fontSize: "14px"
      }
    }, inr(q.subsidy.total))))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "#eff6ff",
        border: "2px solid #2563eb",
        borderRadius: "8px",
        padding: "14px 18px",
        marginBottom: "12px"
      }
    }, /*#__PURE__*/React.createElement("strong", {
      style: {
        fontSize: "14px"
      }
    }, "Net Amount Payable (to Ratneswar Engineering)"), /*#__PURE__*/React.createElement("strong", {
      style: {
        fontSize: "20px",
        color: "#2563eb"
      }
    }, inr(q.basePrice))), /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: "18px",
        fontSize: "12px",
        color: "#4a5568"
      }
    }, /*#__PURE__*/React.createElement("strong", null, "Amount in Words:"), " ", /*#__PURE__*/React.createElement("span", {
      style: {
        fontStyle: "italic",
        color: "#1a1a2e"
      }
    }, amountToWords(q.basePrice))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "14px",
        marginBottom: "18px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#f8f9fa",
        padding: "14px",
        borderRadius: "6px",
        border: "1px solid #e2e5e9"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700,
        marginBottom: "8px",
        fontSize: "12px"
      }
    }, "BANK DETAILS"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "11px",
        color: "#4a5568",
        lineHeight: 1.8
      }
    }, /*#__PURE__*/React.createElement("strong", null, "RATNESWAR ENGINEERING"), /*#__PURE__*/React.createElement("br", null), "Bank Name: ", /*#__PURE__*/React.createElement("strong", null, "HDFC Bank"), /*#__PURE__*/React.createElement("br", null), "A/c No.: ", /*#__PURE__*/React.createElement("strong", null, "99900019052018"), /*#__PURE__*/React.createElement("br", null), "IFSC Code: ", /*#__PURE__*/React.createElement("strong", null, "HDFC0002295"), /*#__PURE__*/React.createElement("br", null), "Branch: ", /*#__PURE__*/React.createElement("strong", null, "Rapar Branch, Kutch"))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "#fffbeb",
        padding: "14px",
        borderRadius: "6px",
        border: "1px solid #fde68a"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700,
        marginBottom: "8px",
        fontSize: "12px",
        color: "#92400e"
      }
    }, "PAYMENT TERMS"), /*#__PURE__*/React.createElement("ul", {
      style: {
        marginTop: 0,
        marginBottom: 0,
        paddingLeft: "18px",
        fontSize: "11px",
        color: "#78350f",
        lineHeight: 1.8
      }
    }, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("strong", null, "10%"), " Advance at Work Order"), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("strong", null, "90%"), " Before Material Dispatch")))), /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700,
        marginBottom: "8px",
        fontSize: "13px"
      }
    }, "SYSTEM BILL OF MATERIALS (BOM)"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "12px",
        marginBottom: "10px",
        color: "#2563eb",
        fontWeight: 600
      }
    }, "Project Capacity: ", q.kw, " kW"), /*#__PURE__*/React.createElement("div", {
      className: "no-print",
      style: {
        display: "flex", gap: "8px", marginBottom: "10px", flexWrap: "wrap",
        padding: "8px 12px", background: "#f0f9ff", borderRadius: "8px",
        border: "1px solid #bae6fd", fontSize: "11px", color: "#0369a1"
      }
    }, /*#__PURE__*/React.createElement("span", { style: { fontWeight: 700 } }, "\u2705 BOM Items:"),
    bom.map((b, i) => /*#__PURE__*/React.createElement("label", {
      key: i,
      style: {
        display: "inline-flex", alignItems: "center", gap: "4px",
        cursor: "pointer", padding: "2px 8px",
        background: selectedBom.has(i) ? "#dbeafe" : "#fee2e2",
        borderRadius: "20px", border: `1px solid ${selectedBom.has(i) ? "#93c5fd" : "#fca5a5"}`,
        fontSize: "11px", color: selectedBom.has(i) ? "#1e40af" : "#991b1b",
        transition: "all 0.2s"
      }
    }, /*#__PURE__*/React.createElement("input", {
      type: "checkbox",
      checked: selectedBom.has(i),
      onChange: () => {
        setSelectedBom(prev => {
          const next = new Set(prev);
          if (next.has(i)) next.delete(i); else next.add(i);
          return next;
        });
      },
      style: { width: "13px", height: "13px", accentColor: "#2563eb" }
    }), b.comp))), /*#__PURE__*/React.createElement("table", {
      style: {
        width: "100%",
        borderCollapse: "collapse",
        marginBottom: "18px"
      }
    }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
      style: {
        ...th,
        textAlign: "center",
        width: "40px"
      }
    }, "Sr."), /*#__PURE__*/React.createElement("th", {
      style: th
    }, "Component"), /*#__PURE__*/React.createElement("th", {
      style: th
    }, "Brand / Model"), /*#__PURE__*/React.createElement("th", {
      style: th
    }, "Specification"), /*#__PURE__*/React.createElement("th", {
      style: {
        ...th,
        textAlign: "center"
      }
    }, "Qty"))), /*#__PURE__*/React.createElement("tbody", null, bom.filter((_, i) => selectedBom.has(i)).map((b, i) => /*#__PURE__*/React.createElement("tr", {
      key: i,
      style: {
        background: i % 2 === 0 ? "#fff" : "#f8f9fa"
      }
    }, /*#__PURE__*/React.createElement("td", {
      style: {
        ...td,
        textAlign: "center",
        fontWeight: 700
      }
    }, i + 1), /*#__PURE__*/React.createElement("td", {
      style: td
    }, /*#__PURE__*/React.createElement("strong", null, b.comp)), /*#__PURE__*/React.createElement("td", {
      style: {
        ...td,
        color: "#2563eb"
      }
    }, b.brand), /*#__PURE__*/React.createElement("td", {
      style: td
    }, b.spec), /*#__PURE__*/React.createElement("td", {
      style: {
        ...td,
        textAlign: "center",
        fontWeight: 600
      }
    }, b.qty)))))), q.notes && /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: "14px",
        background: "#f8f9fa",
        padding: "10px 12px",
        borderRadius: "6px",
        borderLeft: "3px solid #d97706",
        fontSize: "12px"
      }
    }, /*#__PURE__*/React.createElement("strong", null, "Notes:"), " ", q.notes), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "10px",
        color: "#4a5568",
        borderTop: "2px solid #e2e5e9",
        paddingTop: "12px",
        lineHeight: 1.6
      }
    }, /*#__PURE__*/React.createElement("strong", null, "Declaration:"), " We hereby declare that the information given above is true and correct to the best of our knowledge.", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("strong", null, "Validity:"), " ", q.validity, " Days from the date of issue."), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "right",
        marginTop: "36px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "inline-block",
        textAlign: "center"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: "80px",
        height: "2px",
        background: "#1a1a2e",
        margin: "0 auto 8px"
      }
    }), /*#__PURE__*/React.createElement("strong", {
      style: {
        fontSize: "13px"
      }
    }, "Authorised Signatory"), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("strong", {
      style: {
        fontSize: "12px",
        color: "#2563eb"
      }
    }, "RATNESWAR ENGINEERING"), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "10px",
        color: "#4a5568"
      }
    }, "(Stamp & Signature)"))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: "10px",
        justifyContent: "flex-end",
        marginTop: "14px"
      },
      className: "no-print"
    }, /*#__PURE__*/React.createElement("button", {
      style: BS,
      onClick: onClose
    }, "Close"), /*#__PURE__*/React.createElement("button", {
      style: BP,
      onClick: () => window.print()
    }, /*#__PURE__*/React.createElement(PrintIc, {
      size: 15
    }), " Print / Save PDF")));
  }

// ── INVOICE MODAL ───────────────────────────────────────────────────────────
  function InvoiceModal({
    proj,
    onClose
  }) {
    const c = getCust(proj.customerId);
    const existing = proj.invoice;
    const defaultDesc = `Supply & Installation of ${proj.kw} kW Rooftop Solar Power Plant under ${proj.scheme || "PM Surya Ghar Muft Bijli Yojana"}`;
    const [invMeta, setInvMeta] = useState(existing || {
      date: today(),
      poRef: "",
      inverterSrNo: "",
      buyerGstin: c.gstin || "",
      desc: defaultDesc,
      hsn: "995469",
      taxableAmt: proj.netPayable ? Math.round(proj.netPayable / 1.12) : 0,
      gstRate: 12,
      receivedAmt: 0,
      terms: "Within 30 Days"
    });
    const im = invMeta;
    const setIm = k => e => setInvMeta(p => ({ ...p, [k]: e.target.value }));
    const taxable = Number(im.taxableAmt) || 0;
    const gstRate = Number(im.gstRate) || 12;
    const cgst = Math.round(taxable * gstRate / 200);
    const sgst = cgst;
    const totalTax = cgst + sgst;
    const grandTotal = taxable + totalTax;
    const balanceDue = grandTotal - (Number(im.receivedAmt) || 0);
    let invNo = existing?.invNo;
    function save() {
      let n = data.counters.INV;
      if (!invNo) { n++; invNo = genRef("INV", n); }
      const invoice = { invNo, ...im, taxableAmt: taxable, cgst, sgst, totalTax, grandTotal };
      persist({
        ...data,
        projects: data.projects.map(p => p.id === proj.id ? { ...p, invoice } : p),
        counters: { ...data.counters, INV: existing ? data.counters.INV : n }
      });
    }

    // Print area styles
    const cell = { padding: "6px 8px", border: "1px solid #555", fontSize: "11px", color: "#111" };
    const cellBold = { ...cell, fontWeight: 700 };
    const hdr = { ...cellBold, background: "#e8ecf0" };

    return /*#__PURE__*/React.createElement(Modal, {
      title: `Tax Invoice — ${proj.ref}`,
      onClose: onClose,
      wide: true
    },
    // ── EDIT FORM (no-print) ──
    /*#__PURE__*/React.createElement("div", { className: "no-print", style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px", padding: "16px", background: "#f8f9fa", borderRadius: "12px", border: "1px solid #e2e5e9" } },
      /*#__PURE__*/React.createElement(Fld, { label: "Invoice Date" },
        /*#__PURE__*/React.createElement("input", { style: IS, type: "date", value: im.date, onChange: setIm("date") })),
      /*#__PURE__*/React.createElement(Fld, { label: "PO / WO Reference" },
        /*#__PURE__*/React.createElement("input", { style: IS, value: im.poRef, onChange: setIm("poRef"), placeholder: "e.g. WO/2026/001" })),
      /*#__PURE__*/React.createElement(Fld, { label: "Buyer GSTIN" },
        /*#__PURE__*/React.createElement("input", { style: IS, value: im.buyerGstin, onChange: setIm("buyerGstin"), placeholder: "24XXXXX..." })),
      /*#__PURE__*/React.createElement(Fld, { label: "HSN/SAC Code" },
        /*#__PURE__*/React.createElement("input", { style: IS, value: im.hsn, onChange: setIm("hsn"), placeholder: "995469" })),
      /*#__PURE__*/React.createElement(Fld, { label: "Description of Supply" },
        /*#__PURE__*/React.createElement("input", { style: IS, value: im.desc, onChange: setIm("desc") })),
      /*#__PURE__*/React.createElement(Fld, { label: "GST Rate (%)" },
        /*#__PURE__*/React.createElement("select", { style: SS, value: im.gstRate, onChange: setIm("gstRate") },
          ["5","12","18","28"].map(r => /*#__PURE__*/React.createElement("option", { key: r, value: r }, r, "%")))),
      /*#__PURE__*/React.createElement(Fld, { label: "Taxable Amount (₹) — excl. GST" },
        /*#__PURE__*/React.createElement("input", { style: IS, type: "number", value: im.taxableAmt, onChange: setIm("taxableAmt") })),
      /*#__PURE__*/React.createElement(Fld, { label: "Advance / Amount Received (₹)" },
        /*#__PURE__*/React.createElement("input", { style: IS, type: "number", value: im.receivedAmt || 0, onChange: setIm("receivedAmt") })),
      /*#__PURE__*/React.createElement(Fld, { label: "Inverter Serial No." },
        /*#__PURE__*/React.createElement("input", { style: IS, value: im.inverterSrNo, onChange: setIm("inverterSrNo"), placeholder: "e.g. KS5KW-2026-XXXX" })),
      /*#__PURE__*/React.createElement(Fld, { label: "Payment Terms" },
        /*#__PURE__*/React.createElement("input", { style: IS, value: im.terms, onChange: setIm("terms") }))
    ),
    // ── ACTION BUTTONS ──
    /*#__PURE__*/React.createElement("div", { className: "no-print", style: { display: "flex", gap: "10px", justifyContent: "flex-end", marginBottom: "16px" } },
      /*#__PURE__*/React.createElement("button", { style: BS, onClick: onClose }, "Close"),
      /*#__PURE__*/React.createElement("button", { style: BP, onClick: save }, "Save Invoice"),
      invNo && /*#__PURE__*/React.createElement("button", { style: { ...BP, background: "linear-gradient(135deg,#16a34a,#15803d)" }, onClick: () => window.print() },
        /*#__PURE__*/React.createElement(PrintIc, { size: 15 }), " Print Invoice")
    ),
    // ── TAX INVOICE PRINT AREA ──
    invNo && /*#__PURE__*/React.createElement("div", {
      id: "print-area",
      style: { background: "#fff", color: "#111", padding: "20px", borderRadius: "8px", fontFamily: "'Inter',Arial,sans-serif", fontSize: "12px", border: "2px solid #333", boxShadow: "0 0 20px rgba(0,0,0,0.08)" }
    },
      // ── Header ──
      /*#__PURE__*/React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "2px solid #333", paddingBottom: "12px", marginBottom: "10px" } },
        // Seller block
        /*#__PURE__*/React.createElement("div", { style: { flex: 1 } },
          /*#__PURE__*/React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" } },
            /*#__PURE__*/React.createElement(Logo, { size: 44 }),
            /*#__PURE__*/React.createElement("div", null,
              /*#__PURE__*/React.createElement("div", { style: { fontSize: "18px", fontWeight: 900, color: "#1a1a2e", letterSpacing: "0.5px" } }, "RATNESWAR ENGINEERING"),
              /*#__PURE__*/React.createElement("div", { style: { fontSize: "10px", color: "#555", fontStyle: "italic" } }, "Solar Division — Authorized Solar EPC Contractor")
            )
          ),
          /*#__PURE__*/React.createElement("div", { style: { fontSize: "10px", color: "#333", lineHeight: 1.7 } },
            "Office No. 19, Sanghvi Square Complex, Salarinaka, Rapar-Kutch, Gujarat - 370165", /*#__PURE__*/React.createElement("br", null),
            "Mob: +91 84010 50053  |  Email: ratneswareng@gmail.com", /*#__PURE__*/React.createElement("br", null),
            /*#__PURE__*/React.createElement("strong", null, "GSTIN: "), "24ABKFR8021K1ZZ  |  ",
            /*#__PURE__*/React.createElement("strong", null, "PAN: "), "ABKFR8021K  |  State: Gujarat, Code: 24",
            im.inverterSrNo && /*#__PURE__*/React.createElement("span", null, "  |  ", /*#__PURE__*/React.createElement("strong", null, "Inverter SR: "), im.inverterSrNo)
          )
        ),
        // Invoice type block
        /*#__PURE__*/React.createElement("div", { style: { textAlign: "center", border: "2px solid #1e3a5f", borderRadius: "6px", padding: "10px 16px", minWidth: "160px" } },
          /*#__PURE__*/React.createElement("div", { style: { fontSize: "16px", fontWeight: 900, color: "#1e3a5f", letterSpacing: "1px" } }, "TAX INVOICE"),
          /*#__PURE__*/React.createElement("div", { style: { fontSize: "10px", color: "#555", marginTop: "2px" } }, "ORIGINAL FOR RECIPIENT"),
          /*#__PURE__*/React.createElement("div", { style: { marginTop: "8px", borderTop: "1px solid #cbd5e1", paddingTop: "6px", fontSize: "11px" } },
            /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, "Invoice No:"), " ", invNo),
            /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, "Date:"), " ", im.date),
            im.poRef && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, "Ref:"), " ", im.poRef)
          )
        )
      ),
      // ── Buyer / Seller info boxes ──
      /*#__PURE__*/React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0", border: "1px solid #555", marginBottom: "10px" } },
        /*#__PURE__*/React.createElement("div", { style: { padding: "10px 12px", borderRight: "1px solid #555" } },
          /*#__PURE__*/React.createElement("div", { style: { fontSize: "10px", fontWeight: 800, textTransform: "uppercase", color: "#555", marginBottom: "6px", letterSpacing: "0.08em" } }, "Buyer (Bill To)"),
          /*#__PURE__*/React.createElement("div", { style: { fontSize: "13px", fontWeight: 800, color: "#111", marginBottom: "3px" } }, c.name.toUpperCase()),
          /*#__PURE__*/React.createElement("div", { style: { fontSize: "11px", color: "#333", lineHeight: 1.7 } },
            (c.address || c.village || ""), c.taluka ? `, ${c.taluka}` : "", ", ", c.district, c.state ? `, ${c.state}` : "", " - ", c.pin || "", /*#__PURE__*/React.createElement("br", null),
            "Mob: ", c.phone,
            c.consumerNo ? /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("br", null), "Consumer No: ", c.consumerNo, " (", c.discom, ")") : null,
            im.buyerGstin ? /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("strong", null, "GSTIN/UIN: "), im.buyerGstin) : null,
            /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("strong", null, "State Name:"), " Gujarat, Code: 24"
          )
        ),
        /*#__PURE__*/React.createElement("div", { style: { padding: "10px 12px" } },
          /*#__PURE__*/React.createElement("div", { style: { fontSize: "10px", fontWeight: 800, textTransform: "uppercase", color: "#555", marginBottom: "6px", letterSpacing: "0.08em" } }, "Project Details"),
          /*#__PURE__*/React.createElement("div", { style: { fontSize: "11px", color: "#333", lineHeight: 1.9 } },
            /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("strong", null, "Project Ref:"), " ", proj.ref), /*#__PURE__*/React.createElement("br", null),
            /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("strong", null, "Capacity:"), " ", proj.kw, " kW"), /*#__PURE__*/React.createElement("br", null),
            /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("strong", null, "Scheme:"), " ", proj.scheme || "PM Surya Ghar"), /*#__PURE__*/React.createElement("br", null),
            /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("strong", null, "Mode/Terms:"), " ", im.terms), /*#__PURE__*/React.createElement("br", null),
            /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("strong", null, "Place of Supply:"), " Gujarat")
          )
        )
      ),
      // ── Items Table ──
      /*#__PURE__*/React.createElement("table", { style: { width: "100%", borderCollapse: "collapse", marginBottom: "0" } },
        /*#__PURE__*/React.createElement("thead", null,
          /*#__PURE__*/React.createElement("tr", { style: { background: "#e8ecf0" } },
            /*#__PURE__*/React.createElement("th", { style: { ...hdr, width: "30px", textAlign: "center" } }, "Sl."),
            /*#__PURE__*/React.createElement("th", { style: hdr }, "Particulars"),
            /*#__PURE__*/React.createElement("th", { style: { ...hdr, width: "70px", textAlign: "center" } }, "HSN/SAC"),
            /*#__PURE__*/React.createElement("th", { style: { ...hdr, width: "50px", textAlign: "center" } }, "Qty"),
            /*#__PURE__*/React.createElement("th", { style: { ...hdr, width: "50px", textAlign: "center" } }, "Unit"),
            /*#__PURE__*/React.createElement("th", { style: { ...hdr, width: "100px", textAlign: "right" } }, "Rate (₹)"),
            /*#__PURE__*/React.createElement("th", { style: { ...hdr, width: "110px", textAlign: "right" } }, "Amount (₹)")
          )
        ),
        /*#__PURE__*/React.createElement("tbody", null,
          /*#__PURE__*/React.createElement("tr", null,
            /*#__PURE__*/React.createElement("td", { style: { ...cell, textAlign: "center" } }, "1"),
            /*#__PURE__*/React.createElement("td", { style: { ...cellBold, lineHeight: 1.6 } },
              im.desc, /*#__PURE__*/React.createElement("br", null),
              /*#__PURE__*/React.createElement("span", { style: { fontWeight: 400, fontSize: "10px", color: "#555" } },
                `Panel: ${proj.panelBrand || ""} ${proj.panelType || ""} | Inverter: ${proj.inverterBrand || ""} ${proj.inverterKw || ""}kW`,
                im.inverterSrNo ? ` | Sr. No: ${im.inverterSrNo}` : ""
              )
            ),
            /*#__PURE__*/React.createElement("td", { style: { ...cell, textAlign: "center" } }, im.hsn),
            /*#__PURE__*/React.createElement("td", { style: { ...cell, textAlign: "center" } }, "1"),
            /*#__PURE__*/React.createElement("td", { style: { ...cell, textAlign: "center" } }, "Job"),
            /*#__PURE__*/React.createElement("td", { style: { ...cell, textAlign: "right" } }, taxable.toLocaleString("en-IN")),
            /*#__PURE__*/React.createElement("td", { style: { ...cellBold, textAlign: "right" } }, taxable.toLocaleString("en-IN"))
          ),
          // Empty rows for spacing
          /*#__PURE__*/React.createElement("tr", { style: { height: "28px" } },
            ["","","","","","",""].map((_, i) => /*#__PURE__*/React.createElement("td", { key: i, style: cell }))
          )
        )
      ),
      // ── Tax Summary ──
      /*#__PURE__*/React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr auto", border: "1px solid #555", borderTop: "none", marginBottom: "10px" } },
        // Amount in words
        /*#__PURE__*/React.createElement("div", { style: { padding: "8px 12px", borderRight: "1px solid #555" } },
          /*#__PURE__*/React.createElement("div", { style: { fontSize: "11px" } },
            /*#__PURE__*/React.createElement("strong", null, "Amount Chargeable (in words): "),
            /*#__PURE__*/React.createElement("span", { style: { fontStyle: "italic" } }, numToWords(grandTotal), " Only")
          ),
          Number(im.receivedAmt) > 0 && /*#__PURE__*/React.createElement("div", { style: { fontSize: "10px", color: "#16a34a", marginTop: "4px" } },
            /*#__PURE__*/React.createElement("strong", null, "Amount Received: "), "₹", Number(im.receivedAmt).toLocaleString("en-IN"),
            "  |  ", /*#__PURE__*/React.createElement("strong", null, "Balance Due: "), "₹", balanceDue.toLocaleString("en-IN")
          )
        ),
        // Tax breakdown table
        /*#__PURE__*/React.createElement("div", null,
          /*#__PURE__*/React.createElement("table", { style: { borderCollapse: "collapse" } },
            /*#__PURE__*/React.createElement("thead", null,
              /*#__PURE__*/React.createElement("tr", { style: { background: "#e8ecf0" } },
                ["HSN/SAC","Taxable Value","CGST Rate","CGST Amt","SGST Rate","SGST Amt","Total Tax"].map(h =>
                  /*#__PURE__*/React.createElement("th", { key: h, style: { ...hdr, fontSize: "9px", padding: "5px 7px", textAlign: "right", whiteSpace: "nowrap" } }, h)
                )
              )
            ),
            /*#__PURE__*/React.createElement("tbody", null,
              /*#__PURE__*/React.createElement("tr", null,
                /*#__PURE__*/React.createElement("td", { style: { ...cell, fontSize: "10px" } }, im.hsn),
                /*#__PURE__*/React.createElement("td", { style: { ...cell, textAlign: "right", fontSize: "10px" } }, taxable.toLocaleString("en-IN")),
                /*#__PURE__*/React.createElement("td", { style: { ...cell, textAlign: "right", fontSize: "10px" } }, gstRate/2, "%"),
                /*#__PURE__*/React.createElement("td", { style: { ...cell, textAlign: "right", fontSize: "10px" } }, cgst.toLocaleString("en-IN")),
                /*#__PURE__*/React.createElement("td", { style: { ...cell, textAlign: "right", fontSize: "10px" } }, gstRate/2, "%"),
                /*#__PURE__*/React.createElement("td", { style: { ...cell, textAlign: "right", fontSize: "10px" } }, sgst.toLocaleString("en-IN")),
                /*#__PURE__*/React.createElement("td", { style: { ...cellBold, textAlign: "right", fontSize: "10px" } }, totalTax.toLocaleString("en-IN"))
              ),
              /*#__PURE__*/React.createElement("tr", { style: { background: "#f0f9ff" } },
                /*#__PURE__*/React.createElement("td", { colSpan: 6, style: { ...cellBold, textAlign: "right" } }, "GRAND TOTAL"),
                /*#__PURE__*/React.createElement("td", { style: { ...cellBold, textAlign: "right", color: "#1e3a5f", fontSize: "13px" } }, grandTotal.toLocaleString("en-IN"))
              )
            )
          )
        )
      ),
      // ── Tax in words ──
      /*#__PURE__*/React.createElement("div", { style: { fontSize: "10px", border: "1px solid #555", borderTop: "none", padding: "6px 12px", marginBottom: "10px" } },
        /*#__PURE__*/React.createElement("strong", null, "Tax Amount (in words): "), /*#__PURE__*/React.createElement("span", { style: { fontStyle: "italic" } }, numToWords(totalTax), " Only")
      ),
      // ── Bank + Declaration + Signature ──
      /*#__PURE__*/React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" } },
        // Bank details
        /*#__PURE__*/React.createElement("div", { style: { border: "1px solid #aaa", borderRadius: "4px", padding: "10px 12px" } },
          /*#__PURE__*/React.createElement("div", { style: { fontWeight: 800, fontSize: "11px", marginBottom: "6px", textTransform: "uppercase", borderBottom: "1px solid #ddd", paddingBottom: "4px" } }, "Company's Bank Details"),
          /*#__PURE__*/React.createElement("div", { style: { fontSize: "10px", lineHeight: 1.8 } },
            /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, "A/c Holder: "), "RATNESWAR ENGINEERING"),
            /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, "Bank Name: "), "HDFC Bank"),
            /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, "A/c No.: "), "99900019052018"),
            /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, "Branch & IFSC: "), "Rapar Branch, Kutch — HDFC0002295"),
            /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, "PAN: "), "ABKFR8021K  |  ", /*#__PURE__*/React.createElement("strong", null, "GSTIN: "), "24ABKFR8021K1ZZ")
          )
        ),
        // Declaration + Signature
        /*#__PURE__*/React.createElement("div", { style: { border: "1px solid #aaa", borderRadius: "4px", padding: "10px 12px", display: "flex", flexDirection: "column", justifyContent: "space-between" } },
          /*#__PURE__*/React.createElement("div", { style: { fontSize: "10px", color: "#444" } },
            /*#__PURE__*/React.createElement("strong", null, "Declaration: "), "We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct."
          ),
          /*#__PURE__*/React.createElement("div", { style: { textAlign: "right", marginTop: "24px" } },
            /*#__PURE__*/React.createElement("div", { style: { borderTop: "1px solid #333", paddingTop: "6px", display: "inline-block", minWidth: "140px" } },
              /*#__PURE__*/React.createElement("div", { style: { fontSize: "11px", fontWeight: 800 } }, "For RATNESWAR ENGINEERING"),
              /*#__PURE__*/React.createElement("div", { style: { fontSize: "10px", color: "#555", marginTop: "2px" } }, "Authorised Signatory")
            )
          )
        )
      ),
      // ── Footer ──
      /*#__PURE__*/React.createElement("div", { style: { textAlign: "center", fontSize: "10px", color: "#777", borderTop: "1px solid #ddd", paddingTop: "6px" } },
        "This is a Computer Generated Invoice | Ratneswar Engineering, Rapar-Kutch, Gujarat | SUBJECT TO KUTCH JURISDICTION"
      )
    ));
  }

  function ProjectDetail({
    projId,
    onClose
  }) {
    const p = getProj(projId);
    if (!p) return null;
    const c = getCust(p.customerId);
    const dealer = getDealer(p.dealerId);
    const stageIdx = STAGES.indexOf(p.stage);
    const progress = Math.round(stageIdx / (STAGES.length - 1) * 100);
    const [photoUrl, setPhotoUrl] = useState("");
    const [photoCap, setPhotoCap] = useState("");
    const [invOpen, setInvOpen] = useState(false);
    function upd(changes) {
      persist({
        ...data,
        projects: data.projects.map(pr => pr.id === projId ? {
          ...pr,
          ...changes
        } : pr)
      });
    }
    function setStage(stage) {
      upd({
        stage,
        stageHistory: [...(p.stageHistory || []), {
          stage,
          date: today(),
          by: me.name
        }]
      });
    }
    function toggleDoc(doc) {
      upd({
        docs: {
          ...(p.docs || {}),
          [doc]: !(p.docs || {})[doc]
        }
      });
    }
    function toggleMat(key) {
      upd({
        materialIssued: {
          ...(p.materialIssued || {}),
          [key]: !(p.materialIssued || {})[key]
        }
      });
    }
    function addPhoto() {
      if (!photoUrl) return;
      upd({
        sitePhotos: [...(p.sitePhotos || []), {
          url: photoUrl,
          caption: photoCap,
          date: today()
        }]
      });
      setPhotoUrl("");
      setPhotoCap("");
    }
    function removePhoto(i) {
      upd({
        sitePhotos: (p.sitePhotos || []).filter((_, idx) => idx !== i)
      });
    }
    const docsCollected = Object.values(p.docs || {}).filter(Boolean).length;
    const commPercent = p.commission?.percent ?? dealer?.commissionPercent ?? 0;
    const commAmount = p.commission?.amount != null ? Number(p.commission.amount) : Math.round(p.netPayable * commPercent / 100);
    const matList = genMaterialReq(p);
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Modal, {
      title: `Project: ${p.ref}`,
      onClose: onClose,
      wide: true
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(3,1fr)",
        gap: "14px",
        marginBottom: "18px"
      }
    }, [{
      label: "Customer",
      val: c.name,
      sub: `${c.phone} • ${c.district}`,
      color: BLUE
    }, {
      label: "System",
      val: `${p.kw} kW`,
      sub: `${p.nos} panels • ${p.panelBrand} ${p.panelType}`,
      color: GREEN
    }, {
      label: "Net Value",
      val: inr(p.netPayable),
      sub: p.quoteRef,
      color: TXT
    }].map(it => /*#__PURE__*/React.createElement(Card3D, {
      key: it.label,
      style: {
        padding: "16px"
      },
      glow: true
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: TXT3,
        fontSize: "10px",
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        marginBottom: "8px",
        fontWeight: 700
      }
    }, it.label), /*#__PURE__*/React.createElement("div", {
      style: {
        color: it.color,
        fontWeight: 800,
        fontSize: "16px"
      }
    }, it.val), /*#__PURE__*/React.createElement("div", {
      style: {
        color: TXT3,
        fontSize: "12px",
        marginTop: "3px"
      }
    }, it.sub)))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: BORDER_SOFT,
        border: `1px solid ${BORDER}`,
        borderRadius: "12px",
        padding: "16px",
        marginBottom: "16px",
        display: "flex",
        alignItems: "center",
        gap: "14px",
        flexWrap: "wrap"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: TXT2,
        fontSize: "11px",
        fontWeight: 800,
        textTransform: "uppercase",
        letterSpacing: "0.05em"
      }
    }, "Deal Status"), ["Pending", "Accepted", "Rejected"].map(s => /*#__PURE__*/React.createElement("button", {
      key: s,
      onClick: () => upd({
        dealStatus: s
      }),
      style: {
        background: p.dealStatus === s ? s === "Accepted" ? GREEN_BG : s === "Rejected" ? RED_BG : AMBER_BG : "rgba(255,255,255,0.05)",
        color: p.dealStatus === s ? s === "Accepted" ? GREEN : s === "Rejected" ? RED : AMBER : TXT2,
        border: `1px solid ${p.dealStatus === s ? s === "Accepted" ? "rgba(34,197,94,0.4)" : s === "Rejected" ? "rgba(239,68,68,0.4)" : "rgba(245,158,11,0.4)" : "#d1d5db"}`,
        borderRadius: "20px",
        padding: "6px 16px",
        cursor: "pointer",
        fontSize: "13px",
        fontWeight: p.dealStatus === s ? 700 : 500,
        transition: "all 0.3s ease",
      }
    }, s))), p.dealStatus !== "Rejected" && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Card3D, {
      style: {
        padding: "20px",
        marginBottom: "16px"
      }
    }, /*#__PURE__*/React.createElement(SectionTitle, {
      right: /*#__PURE__*/React.createElement(Badge, {
        label: p.stage,
        color: STAGE_COLOR[p.stage]
      })
    }, "Project Stage \u2014 ", progress, "% Complete"), /*#__PURE__*/React.createElement("div", {
      style: {
        height: "8px",
        background: "#f8f9fa",
        borderRadius: "4px",
        overflow: "hidden",
        marginBottom: "16px",
        position: "relative"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        height: "100%",
        width: `${progress}%`,
        background: `linear-gradient(90deg, ${STAGE_COLOR[p.stage]}, ${STAGE_COLOR[p.stage]}88)`,
        borderRadius: "4px",
        transition: "width 0.6s ease",
        position: "relative"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexWrap: "wrap",
        gap: "6px"
      }
    }, STAGES.map((s, i) => /*#__PURE__*/React.createElement("button", {
      key: s,
      onClick: () => setStage(s),
      style: {
        background: p.stage === s ? `${STAGE_COLOR[s]}20` : i < stageIdx ? GREEN_BG : "rgba(255,255,255,0.05)",
        color: p.stage === s ? STAGE_COLOR[s] : i < stageIdx ? GREEN : TXT3,
        border: `1px solid ${p.stage === s ? STAGE_COLOR[s] : i < stageIdx ? "rgba(22,163,74,0.2)" : "#e2e5e9"}`,
        borderRadius: "20px",
        padding: "5px 12px",
        fontSize: "11px",
        cursor: "pointer",
        fontWeight: p.stage === s ? 700 : 500,
        transition: "all 0.3s ease",
      }
    }, i < stageIdx ? "✓ " : "", s))), (p.stageHistory || []).length > 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: "14px",
        borderTop: `1px solid ${BORDER}`,
        paddingTop: "12px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: TXT3,
        fontSize: "11px",
        marginBottom: "6px",
        fontWeight: 700
      }
    }, "Recent Activity"), [...(p.stageHistory || [])].reverse().slice(0, 3).map((h, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        fontSize: "12px",
        color: TXT3,
        marginBottom: "4px",
        padding: "6px 10px",
        background: "#f5f5f5",
        borderRadius: "6px",
        borderLeft: `2px solid ${STAGE_COLOR[h.stage]}`
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: STAGE_COLOR[h.stage],
        fontWeight: 700
      }
    }, h.stage), " \u2014 ", h.date, " by ", h.by)))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "14px",
        marginBottom: "16px"
      }
    }, /*#__PURE__*/React.createElement(Card3D, {
      style: {
        padding: "18px"
      }
    }, /*#__PURE__*/React.createElement(SectionTitle, {
      right: /*#__PURE__*/React.createElement("span", {
        style: {
          color: docsCollected === DOCS.length ? GREEN : AMBER,
          fontSize: "13px",
          fontWeight: 800
        }
      }, docsCollected, "/", DOCS.length)
    }, "Documents Checklist"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        maxHeight: "260px",
        overflowY: "auto"
      }
    }, DOCS.map(doc => {
      const checked = !!(p.docs || {})[doc];
      return /*#__PURE__*/React.createElement("label", {
        key: doc,
        style: {
          display: "flex",
          alignItems: "center",
          gap: "10px",
          cursor: "pointer",
          padding: "6px 8px",
          borderRadius: "8px",
          background: checked ? GREEN_BG : "transparent",
          transition: "all 0.3s ease",
          border: checked ? `1px solid rgba(34,197,94,0.2)` : "1px solid transparent"
        }
      }, /*#__PURE__*/React.createElement("input", {
        type: "checkbox",
        checked: checked,
        onChange: () => toggleDoc(doc),
        style: {
          accentColor: GREEN,
          width: "16px",
          height: "16px",
          flexShrink: 0
        }
      }), /*#__PURE__*/React.createElement("span", {
        style: {
          color: checked ? "#15803d" : TXT2,
          fontSize: "12px",
          lineHeight: 1.4
        }
      }, doc));
    }))), /*#__PURE__*/React.createElement(Card3D, {
      style: {
        padding: "18px"
      }
    }, /*#__PURE__*/React.createElement(SectionTitle, null, "Loan Details"), /*#__PURE__*/React.createElement(Fld, {
      label: "Loan Required?"
    }, /*#__PURE__*/React.createElement("select", {
      style: SS,
      value: p.loanRequired || "No",
      onChange: e => upd({
        loanRequired: e.target.value
      })
    }, /*#__PURE__*/React.createElement("option", null, "No"), /*#__PURE__*/React.createElement("option", null, "Yes"))), p.loanRequired === "Yes" && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Fld, {
      label: "Bank / NBFC"
    }, /*#__PURE__*/React.createElement("input", {
      style: IS,
      defaultValue: p.loanBank,
      onBlur: e => upd({
        loanBank: e.target.value
      }),
      placeholder: "e.g. SBI, HDFC, IREDA"
    })), /*#__PURE__*/React.createElement(Fld, {
      label: "Loan Amount (\u20B9)"
    }, /*#__PURE__*/React.createElement("input", {
      style: IS,
      type: "number",
      defaultValue: p.loanAmount,
      onBlur: e => upd({
        loanAmount: e.target.value
      })
    })), /*#__PURE__*/React.createElement(Fld, {
      label: "Loan Status"
    }, /*#__PURE__*/React.createElement("select", {
      style: SS,
      value: p.loanStatus || "Not Applied",
      onChange: e => upd({
        loanStatus: e.target.value
      })
    }, ["Not Applied", "Applied", "Under Review", "Sanction Letter Received", "Disbursed", "Rejected"].map(s => /*#__PURE__*/React.createElement("option", {
      key: s
    }, s))))))), /*#__PURE__*/React.createElement(Card3D, {
      style: {
        padding: "18px",
        marginBottom: "16px"
      }
    }, /*#__PURE__*/React.createElement(SectionTitle, {
      right: /*#__PURE__*/React.createElement("button", {
        style: {
          ...BS,
          ...SMALL
        },
        onClick: () => downloadCSV(`materials_${p.ref}.csv`, [["Item", "Spec", "Qty", "Unit"], ...matList.map(m => [m.item, m.spec, m.qty, m.unit])])
      }, /*#__PURE__*/React.createElement(DlIc, {
        size: 13
      }), " Export")
    }, "Material Required \u2014 Auto-Calculated"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: "6px"
      }
    }, matList.map((m, i) => {
      const key = `${m.item}-${m.spec}`;
      const checked = !!(p.materialIssued || {})[key];
      return /*#__PURE__*/React.createElement("label", {
        key: i,
        style: {
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "8px 10px",
          borderRadius: "8px",
          background: checked ? GREEN_BG : "rgba(255,255,255,0.03)",
          fontSize: "13px",
          cursor: "pointer",
          transition: "all 0.3s ease",
          border: checked ? `1px solid rgba(34,197,94,0.2)` : "1px solid transparent"
        }
      }, /*#__PURE__*/React.createElement("input", {
        type: "checkbox",
        checked: checked,
        onChange: () => toggleMat(key),
        style: {
          accentColor: GREEN,
          width: "16px",
          height: "16px",
          flexShrink: 0
        }
      }), /*#__PURE__*/React.createElement("span", {
        style: {
          flex: 1,
          color: checked ? "#15803d" : TXT
        }
      }, m.item, " ", /*#__PURE__*/React.createElement("span", {
        style: {
          color: TXT3
        }
      }, "(", m.spec, ")")), /*#__PURE__*/React.createElement("span", {
        style: {
          color: TXT2,
          fontWeight: 700,
          minWidth: "70px",
          textAlign: "right"
        }
      }, m.qty, " ", m.unit));
    }))), /*#__PURE__*/React.createElement(Card3D, {
      style: {
        padding: "18px",
        marginBottom: "16px"
      }
    }, /*#__PURE__*/React.createElement(SectionTitle, null, "Dealer / Agent Commission"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexWrap: "wrap",
        gap: "12px"
      }
    }, /*#__PURE__*/React.createElement(Fld, {
      label: "Dealer/Agent",
      half: true
    }, /*#__PURE__*/React.createElement("select", {
      style: SS,
      value: p.dealerId || "",
      onChange: e => upd({
        dealerId: e.target.value
      })
    }, /*#__PURE__*/React.createElement("option", {
      value: ""
    }, "-- None --"), data.dealers.map(d => /*#__PURE__*/React.createElement("option", {
      key: d.id,
      value: d.id
    }, d.name)))), /*#__PURE__*/React.createElement(Fld, {
      label: "Commission % (override)",
      half: true
    }, /*#__PURE__*/React.createElement("input", {
      style: IS,
      type: "number",
      value: commPercent,
      onChange: e => upd({
        commission: {
          ...p.commission,
          percent: e.target.value,
          amount: null
        }
      })
    })), /*#__PURE__*/React.createElement(Fld, {
      label: "Commission Amount (\u20B9)",
      half: true
    }, /*#__PURE__*/React.createElement("input", {
      style: IS,
      type: "number",
      value: commAmount,
      onChange: e => upd({
        commission: {
          ...p.commission,
          amount: e.target.value
        }
      })
    })), /*#__PURE__*/React.createElement(Fld, {
      label: "Paid?",
      half: true
    }, /*#__PURE__*/React.createElement("select", {
      style: SS,
      value: p.commission?.paid ? "Yes" : "No",
      onChange: e => upd({
        commission: {
          ...p.commission,
          percent: commPercent,
          amount: p.commission?.amount,
          paid: e.target.value === "Yes"
        }
      })
    }, /*#__PURE__*/React.createElement("option", null, "No"), /*#__PURE__*/React.createElement("option", null, "Yes"))))), /*#__PURE__*/React.createElement(Card3D, {
      style: {
        padding: "18px",
        marginBottom: "16px"
      }
    }, /*#__PURE__*/React.createElement(SectionTitle, null, "Installation Status"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexWrap: "wrap",
        gap: "12px"
      }
    }, /*#__PURE__*/React.createElement(Fld, {
      label: "Installed?",
      half: true
    }, /*#__PURE__*/React.createElement("select", {
      style: SS,
      value: p.installation?.done || "No",
      onChange: e => upd({
        installation: {
          ...p.installation,
          done: e.target.value
        }
      })
    }, /*#__PURE__*/React.createElement("option", null, "No"), /*#__PURE__*/React.createElement("option", null, "Yes"))), p.installation?.done === "Yes" ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Fld, {
      label: "Installation Cost (\u20B9)",
      half: true
    }, /*#__PURE__*/React.createElement("input", {
      style: IS,
      type: "number",
      defaultValue: p.installation?.cost,
      onBlur: e => upd({
        installation: {
          ...p.installation,
          cost: e.target.value
        }
      })
    })), /*#__PURE__*/React.createElement(Fld, {
      label: "Completed Date",
      half: true
    }, /*#__PURE__*/React.createElement("input", {
      style: IS,
      type: "date",
      defaultValue: p.installation?.completedDate || today(),
      onBlur: e => upd({
        installation: {
          ...p.installation,
          completedDate: e.target.value
        }
      })
    }))) : /*#__PURE__*/React.createElement(Fld, {
      label: "Reason \u2014 Not Installed",
      half: true
    }, /*#__PURE__*/React.createElement("select", {
      style: SS,
      value: p.installation?.issue || "",
      onChange: e => upd({
        installation: {
          ...p.installation,
          issue: e.target.value
        }
      })
    }, /*#__PURE__*/React.createElement("option", {
      value: ""
    }, "-- Select Reason --"), NOT_INSTALL_REASONS.map(r => /*#__PURE__*/React.createElement("option", {
      key: r
    }, r))))), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: "12px",
        borderTop: `1px solid ${BORDER}`,
        paddingTop: "12px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: TXT2,
        fontSize: "11px",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        marginBottom: "10px"
      }
    }, "Site Location Photos (paste image link)"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: "8px",
        marginBottom: "12px",
        flexWrap: "wrap"
      }
    }, /*#__PURE__*/React.createElement("input", {
      style: {
        ...IS,
        flex: "2 1 200px"
      },
      placeholder: "https://... (image URL)",
      value: photoUrl,
      onChange: e => setPhotoUrl(e.target.value)
    }), /*#__PURE__*/React.createElement("input", {
      style: {
        ...IS,
        flex: "1 1 120px"
      },
      placeholder: "Caption",
      value: photoCap,
      onChange: e => setPhotoCap(e.target.value)
    }), /*#__PURE__*/React.createElement("button", {
      style: {
        ...BP,
        ...SMALL
      },
      onClick: addPhoto
    }, /*#__PURE__*/React.createElement(PlusIc, {
      size: 13
    }), " Add")), (p.sitePhotos || []).length > 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexWrap: "wrap",
        gap: "12px"
      }
    }, p.sitePhotos.map((ph, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        width: "120px",
        position: "relative"
      }
    }, /*#__PURE__*/React.createElement("img", {
      src: ph.url,
      alt: ph.caption,
      style: {
        width: "100%",
        height: "90px",
        objectFit: "cover",
        borderRadius: "8px",
        border: `1px solid ${BORDER}`,
        boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
      },
      onError: e => {
        e.target.style.display = "none";
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "10px",
        color: TXT3,
        marginTop: "4px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        maxWidth: "80px"
      }
    }, ph.caption || "Photo"), /*#__PURE__*/React.createElement("span", {
      onClick: () => removePhoto(i),
      style: {
        cursor: "pointer",
        color: RED,
        fontSize: "14px",
        fontWeight: 700
      }
    }, "\xD7"))))))), /*#__PURE__*/React.createElement(Card3D, {
      style: {
        padding: "18px",
        marginBottom: "16px"
      }
    }, /*#__PURE__*/React.createElement(SectionTitle, null, "Project Notes"), /*#__PURE__*/React.createElement("textarea", {
      style: {
        ...IS,
        minHeight: "80px",
        resize: "vertical"
      },
      defaultValue: p.notes || "",
      onBlur: e => upd({
        notes: e.target.value
      }),
      placeholder: "Site notes, follow-ups..."
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "flex-end",
        gap: "10px"
      }
    }, p.dealStatus !== "Rejected" && /*#__PURE__*/React.createElement("button", {
      style: BP,
      onClick: () => setInvOpen(true)
    }, /*#__PURE__*/React.createElement(FileIc, {
      size: 15
    }), " Invoice"), /*#__PURE__*/React.createElement("button", {
      style: BS,
      onClick: onClose
    }, "Close"))), invOpen && /*#__PURE__*/React.createElement(InvoiceModal, {
      proj: getProj(projId),
      onClose: () => setInvOpen(false)
    }));
  }

  // ── CREATE PROJECT FROM QUOTE ────────────────────────────────────────────────
  function createProject(q) {
    if (data.projects.find(p => p.quoteId === q.id)) return alert("Project already exists for this quote!");
    const n = data.counters.PR + 1;
    const proj = {
      id: `PR${uid()}`,
      ref: genRef("PR", n),
      customerId: q.customerId,
      quoteId: q.id,
      quoteRef: q.ref,
      kw: q.kw,
      nos: q.nos,
      panelType: q.panelType,
      panelBrand: q.brand,
      inverterBrand: q.inverterBrand,
      inverterKw: q.inverterKw,
      netPayable: q.netPayable,
      subsidyTotal: q.subsidy?.total,
      dealerId: q.dealerId || "",
      stage: "Lead Received",
      dealStatus: "Pending",
      stageHistory: [{
        stage: "Lead Received",
        date: today(),
        by: me.name
      }],
      loanRequired: "No",
      docs: {},
      notes: "",
      sitePhotos: [],
      installation: {
        done: "No",
        cost: "",
        completedDate: "",
        issue: ""
      },
      commission: {
        percent: q.commissionPercent
      },
      materialIssued: {},
      assignedTo: me.id,
      createdAt: today()
    };
    const quotes = data.quotes.map(qt => qt.id === q.id ? {
      ...qt,
      status: "Project Created"
    } : qt);
    persist({
      ...data,
      projects: [proj, ...data.projects],
      quotes,
      counters: {
        ...data.counters,
        PR: n
      }
    });
  }

  // ── DASHBOARD ──────────────────────────────────────────────────────────────
  function Dashboard() {
    const liveP = visProjects.filter(p => p.dealStatus !== "Rejected");
    const stageCount = {};
    STAGES.forEach(s => {
      stageCount[s] = liveP.filter(p => p.stage === s).length;
    });
    const maxSC = Math.max(...Object.values(stageCount), 1);
    const totalKw = liveP.reduce((s, p) => s + Number(p.kw || 0), 0).toFixed(2);
    const totalVal = liveP.reduce((s, p) => s + Number(p.netPayable || 0), 0);
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))",
        gap: "16px",
        marginBottom: "28px"
      }
    }, /*#__PURE__*/React.createElement(StatCard, {
      icon: /*#__PURE__*/React.createElement(UsersIc, {
        size: 18
      }),
      val: visCustomers.length,
      label: "Customers",
      color: BLUE
    }), /*#__PURE__*/React.createElement(StatCard, {
      icon: /*#__PURE__*/React.createElement(FileIc, {
        size: 18
      }),
      val: visQuotes.filter(q => ["Draft", "Sent"].includes(q.status)).length,
      label: "Pending Quotes",
      color: AMBER
    }), /*#__PURE__*/React.createElement(StatCard, {
      icon: /*#__PURE__*/React.createElement(GearIc, {
        size: 18
      }),
      val: liveP.filter(p => p.stage !== "Completed").length,
      label: "Active Projects",
      color: VIOLET
    }), /*#__PURE__*/React.createElement(StatCard, {
      icon: /*#__PURE__*/React.createElement(CheckIc, {
        size: 18
      }),
      val: liveP.filter(p => p.stage === "Completed").length,
      label: "Completed",
      color: GREEN
    }), /*#__PURE__*/React.createElement(StatCard, {
      icon: /*#__PURE__*/React.createElement(ZapIc, {
        size: 18
      }),
      val: `${totalKw} kW`,
      label: "Total Capacity",
      color: "#ea580c",
      animate: false
    }), /*#__PURE__*/React.createElement(StatCard, {
      icon: /*#__PURE__*/React.createElement(WarnIc, {
        size: 18
      }),
      val: visProjects.filter(p => p.dealStatus === "Rejected").length,
      label: "Lost Deals",
      color: RED
    }), /*#__PURE__*/React.createElement(StatCard, {
      icon: /*#__PURE__*/React.createElement(TrendIc, {
        size: 18
      }),
      val: inr(totalVal),
      label: "Total Value",
      color: GREEN,
      animate: false
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "18px"
      }
    }, /*#__PURE__*/React.createElement(Card3D, {
      style: {
        padding: "24px"
      },
      glow: true
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: TXT,
        fontWeight: 800,
        fontSize: "16px",
        marginBottom: "20px",
        display: "flex",
        alignItems: "center",
        gap: "8px"
      }
    }, /*#__PURE__*/React.createElement(ChartIc, {
      size: 18,
      stroke: AMBER
    }), " Project Pipeline"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: "8px"
      }
    }, STAGES.map(s => {
      const cnt = stageCount[s] || 0;
      return /*#__PURE__*/React.createElement("div", {
        key: s,
        style: {
          display: "flex",
          alignItems: "center",
          gap: "10px"
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          width: "160px",
          color: TXT2,
          fontSize: "11px",
          textAlign: "right",
          flexShrink: 0,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap"
        }
      }, s), /*#__PURE__*/React.createElement("div", {
        style: {
          flex: 1,
          height: "16px",
          background: "#f8f9fa",
          borderRadius: "8px",
          overflow: "hidden",
          position: "relative"
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          height: "100%",
          width: `${cnt / maxSC * 100}%`,
          background: `linear-gradient(90deg, ${STAGE_COLOR[s]}88, ${STAGE_COLOR[s]})`,
          borderRadius: "8px",
          transition: "width 0.6s ease",
          minWidth: cnt > 0 ? "8px" : "0",
          position: "relative"
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "linear-gradient(90deg, transparent, #c5c9d0, transparent)",
          
        }
      }))), /*#__PURE__*/React.createElement("div", {
        style: {
          width: "24px",
          color: STAGE_COLOR[s],
          fontSize: "13px",
          fontWeight: 800
        }
      }, cnt));
    }))), /*#__PURE__*/React.createElement(Card3D, {
      style: {
        overflow: "hidden"
      },
      glow: true
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "18px 24px",
        borderBottom: `1px solid ${BORDER}`,
        color: TXT,
        fontWeight: 800,
        fontSize: "16px",
        display: "flex",
        alignItems: "center",
        gap: "8px"
      }
    }, /*#__PURE__*/React.createElement(FileIc, {
      size: 18,
      stroke: BLUE
    }), " Recent Projects"), liveP.length === 0 ? /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "40px",
        textAlign: "center",
        color: TXT3,
        fontSize: "14px"
      }
    }, "No projects yet. Generate a quote and convert to project!") : liveP.slice(0, 8).map(p => {
      const c = getCust(p.customerId);
      const sidx = STAGES.indexOf(p.stage);
      const prog = Math.round(sidx / (STAGES.length - 1) * 100);
      return /*#__PURE__*/React.createElement("div", {
        key: p.id,
        onClick: () => setModal({
          type: "project",
          id: p.id
        }),
        style: {
          display: "flex",
          alignItems: "center",
          padding: "12px 24px",
          borderBottom: `1px solid ${BORDER_SOFT}`,
          cursor: "pointer",
          gap: "12px",
          transition: "all 0.3s ease"
        },
        onMouseEnter: e => {
          e.currentTarget.style.background = "rgba(255,255,255,0.05)";
          e.currentTarget.style.paddingLeft = "28px";
        },
        onMouseLeave: e => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.paddingLeft = "24px";
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: "monospace",
          color: BLUE,
          fontSize: "12px",
          minWidth: "100px",
          fontWeight: 700
        }
      }, p.ref), /*#__PURE__*/React.createElement("span", {
        style: {
          color: TXT,
          flex: 1,
          fontSize: "13px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap"
        }
      }, c.name), /*#__PURE__*/React.createElement("span", {
        style: {
          color: TXT2,
          fontSize: "12px",
          whiteSpace: "nowrap"
        }
      }, p.kw, "kW"), /*#__PURE__*/React.createElement("div", {
        style: {
          width: "60px",
          height: "6px",
          background: "#e2e5e9",
          borderRadius: "3px",
          overflow: "hidden"
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          height: "100%",
          width: `${prog}%`,
          background: STAGE_COLOR[p.stage],
          borderRadius: "3px"
        }
      })), /*#__PURE__*/React.createElement(Badge, {
        label: p.stage,
        color: STAGE_COLOR[p.stage]
      }));
    }))));
  }

  // ── CUSTOMERS ──────────────────────────────────────────────────────────────
  function Customers() {
    const [srch, setSrch] = useState("");
    const list = visCustomers.filter(c => c.name.toLowerCase().includes(srch.toLowerCase()) || c.phone.includes(srch) || (c.consumerNo || "").includes(srch));
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: "12px",
        marginBottom: "18px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: "relative",
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: "absolute",
        left: "14px",
        top: "50%",
        transform: "translateY(-50%)",
        color: TXT3
      }
    }, /*#__PURE__*/React.createElement(SearchIc, {
      size: 16
    })), /*#__PURE__*/React.createElement("input", {
      style: {
        ...IS,
        paddingLeft: "42px"
      },
      placeholder: "Search by name, phone, consumer no...",
      value: srch,
      onChange: e => setSrch(e.target.value)
    })), /*#__PURE__*/React.createElement("button", {
      style: BP,
      onClick: () => setModal({
        type: "customer"
      })
    }, /*#__PURE__*/React.createElement(PlusIc, {
      size: 16
    }), " New Customer")), list.length === 0 ? /*#__PURE__*/React.createElement(Card3D, {
      style: {
        padding: "56px",
        textAlign: "center"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: TXT3,
        fontSize: "15px"
      }
    }, visCustomers.length === 0 ? "No customers yet. Add your first one!" : "No results found.")) : /*#__PURE__*/React.createElement(Card3D, {
      style: {
        overflow: "hidden"
      }
    }, /*#__PURE__*/React.createElement("table", {
      style: {
        width: "100%",
        borderCollapse: "collapse",
        fontSize: "14px"
      }
    }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
      style: {
        borderBottom: `1px solid ${BORDER}`
      }
    }, ["Name", "Phone", "Type", "Village / Taluka", "District", "Projects", ""].map(h => /*#__PURE__*/React.createElement("th", {
      key: h,
      style: {
        padding: "12px 16px",
        textAlign: "left",
        color: TXT3,
        fontSize: "11px",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.06em"
      }
    }, h)))), /*#__PURE__*/React.createElement("tbody", null, list.map(c => {
      const pc = visProjects.filter(p => p.customerId === c.id).length;
      return /*#__PURE__*/React.createElement("tr", {
        key: c.id,
        style: {
          borderBottom: `1px solid ${BORDER_SOFT}`,
          transition: "all 0.3s ease"
        },
        onMouseEnter: e => {
          e.currentTarget.style.background = "rgba(255,255,255,0.05)";
        },
        onMouseLeave: e => {
          e.currentTarget.style.background = "transparent";
        }
      }, /*#__PURE__*/React.createElement("td", {
        style: {
          padding: "14px 16px"
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          color: TXT,
          fontWeight: 700,
          fontSize: "14px"
        }
      }, c.name), /*#__PURE__*/React.createElement("div", {
        style: {
          color: TXT3,
          fontSize: "11px"
        }
      }, c.email)), /*#__PURE__*/React.createElement("td", {
        style: {
          padding: "14px 16px",
          color: TXT2,
          fontWeight: 600
        }
      }, c.phone), /*#__PURE__*/React.createElement("td", {
        style: {
          padding: "14px 16px"
        }
      }, /*#__PURE__*/React.createElement(Badge, {
        label: c.type,
        color: BLUE
      })), /*#__PURE__*/React.createElement("td", {
        style: {
          padding: "14px 16px",
          color: TXT3,
          fontSize: "13px"
        }
      }, [c.village, c.taluka].filter(Boolean).join(", ")), /*#__PURE__*/React.createElement("td", {
        style: {
          padding: "14px 16px",
          color: TXT2,
          fontWeight: 600
        }
      }, c.district), /*#__PURE__*/React.createElement("td", {
        style: {
          padding: "14px 16px",
          color: GREEN,
          fontWeight: 800,
          textAlign: "center",
          fontSize: "16px"
        }
      }, pc), /*#__PURE__*/React.createElement("td", {
        style: {
          padding: "14px 16px"
        }
      }, /*#__PURE__*/React.createElement("button", {
        onClick: () => setModal({
          type: "customer",
          doc: c
        }),
        style: {
          ...BS,
          ...SMALL
        }
      }, /*#__PURE__*/React.createElement(PencilIc, {
        size: 12
      }), " Edit")));
    })))));
  }

  // ── QUOTATIONS ─────────────────────────────────────────────────────────────
  function Quotations() {
    const [fil, setFil] = useState("All");
    const statuses = ["All", "Draft", "Sent", "Approved", "Rejected", "Project Created"];
    const list = fil === "All" ? visQuotes : visQuotes.filter(q => q.status === fil);
    const qColor = {
      "Draft": TXT2,
      "Sent": BLUE,
      "Approved": GREEN,
      "Rejected": RED,
      "Project Created": VIOLET
    };
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "12px",
        marginBottom: "18px",
        flexWrap: "wrap"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: "6px",
        flexWrap: "wrap"
      }
    }, statuses.map(s => /*#__PURE__*/React.createElement("button", {
      key: s,
      onClick: () => setFil(s),
      style: {
        background: fil === s ? BLUE_BG : "rgba(255,255,255,0.05)",
        color: fil === s ? BLUE : TXT2,
        border: `1px solid ${fil === s ? "rgba(59,130,246,0.4)" : "#e2e5e9"}`,
        borderRadius: "20px",
        padding: "5px 14px",
        cursor: "pointer",
        fontSize: "13px",
        fontWeight: fil === s ? 700 : 500,
        transition: "all 0.3s ease",
      }
    }, s))), /*#__PURE__*/React.createElement("button", {
      style: BP,
      onClick: () => setModal({
        type: "quote"
      })
    }, /*#__PURE__*/React.createElement(PlusIc, {
      size: 16
    }), " Generate Quote")), list.length === 0 ? /*#__PURE__*/React.createElement(Card3D, {
      style: {
        padding: "56px",
        textAlign: "center"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: TXT3,
        fontSize: "15px"
      }
    }, "No quotations found.")) : /*#__PURE__*/React.createElement(Card3D, {
      style: {
        overflow: "hidden"
      }
    }, /*#__PURE__*/React.createElement("table", {
      style: {
        width: "100%",
        borderCollapse: "collapse",
        fontSize: "14px"
      }
    }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
      style: {
        borderBottom: `1px solid ${BORDER}`
      }
    }, ["Quote Ref", "Customer", "System", "Gross Amt", "Dealer", "Status", ""].map(h => /*#__PURE__*/React.createElement("th", {
      key: h,
      style: {
        padding: "12px 16px",
        textAlign: "left",
        color: TXT3,
        fontSize: "11px",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.06em"
      }
    }, h)))), /*#__PURE__*/React.createElement("tbody", null, list.map(q => {
      const c = getCust(q.customerId);
      const hasProj = data.projects.some(p => p.quoteId === q.id);
      return (
        /*#__PURE__*/
        // FIX #3: backtick template literal was broken mid-way ( `1px solid ${BORDER_SOFT}",transition:... ).
        // Now properly closed with a backtick before the comma.
        React.createElement("tr", {
          key: q.id,
          style: {
            borderBottom: `1px solid ${BORDER_SOFT}`,
            transition: "all 0.3s ease"
          },
          onMouseEnter: e => {
            e.currentTarget.style.background = "rgba(255,255,255,0.05)";
          },
          onMouseLeave: e => {
            e.currentTarget.style.background = "transparent";
          }
        }, /*#__PURE__*/React.createElement("td", {
          style: {
            padding: "14px 16px",
            color: BLUE,
            fontFamily: "monospace",
            fontWeight: 700,
            fontSize: "13px"
          }
        }, q.ref), /*#__PURE__*/React.createElement("td", {
          style: {
            padding: "14px 16px"
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            color: TXT,
            fontWeight: 700
          }
        }, c.name), /*#__PURE__*/React.createElement("div", {
          style: {
            color: TXT3,
            fontSize: "11px"
          }
        }, c.phone)), /*#__PURE__*/React.createElement("td", {
          style: {
            padding: "14px 16px"
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            color: TXT,
            fontWeight: 700
          }
        }, q.kw, " kW"), /*#__PURE__*/React.createElement("div", {
          style: {
            color: TXT3,
            fontSize: "11px"
          }
        }, q.nos, "p \u2022 ", q.brand, " ", q.panelType)), /*#__PURE__*/React.createElement("td", {
          style: {
            padding: "14px 16px",
            color: TXT,
            fontWeight: 800,
            fontSize: "15px"
          }
        }, inr(q.basePrice)), /*#__PURE__*/React.createElement("td", {
          style: {
            padding: "14px 16px",
            color: TXT2,
            fontSize: "13px"
          }
        }, q.dealerName || "—", q.dealerName ? ` (${q.commissionPercent}%)` : ""), /*#__PURE__*/React.createElement("td", {
          style: {
            padding: "14px 16px"
          }
        }, /*#__PURE__*/React.createElement("select", {
          style: {
            ...SS,
            padding: "5px 10px",
            fontSize: "12px",
            width: "auto",
            color: qColor[q.status] || TXT,
            border: `1px solid ${BORDER}`
          },
          value: q.status,
          onChange: e => persist({
            ...data,
            quotes: data.quotes.map(qt => qt.id === q.id ? {
              ...qt,
              status: e.target.value
            } : qt)
          })
        }, ["Draft", "Sent", "Approved", "Rejected", "Project Created"].map(s => /*#__PURE__*/React.createElement("option", {
          key: s
        }, s)))), /*#__PURE__*/React.createElement("td", {
          style: {
            padding: "14px 16px",
            whiteSpace: "nowrap",
            display: "flex",
            gap: "6px"
          }
        }, /*#__PURE__*/React.createElement("button", {
          onClick: () => setModal({
            type: "quoteprint",
            q
          }),
          style: {
            ...BS,
            ...SMALL
          }
        }, /*#__PURE__*/React.createElement(PrintIc, {
          size: 12
        }), " View"), !hasProj && q.status === "Approved" && /*#__PURE__*/React.createElement("button", {
          onClick: () => createProject(q),
          style: {
            ...BP,
            ...SMALL,
            background: VIOLET,
            borderColor: "#6d28d9",
            boxShadow: "0 4px 15px rgba(139,92,246,0.3)"
          }
        }, "\u2192 Project")))
      );
    })))));
  }

  // ── PROJECTS ───────────────────────────────────────────────────────────────
  function Projects() {
    const [sf, setSf] = useState("All");
    const liveP = visProjects.filter(p => p.dealStatus !== "Rejected");
    const lostP = visProjects.filter(p => p.dealStatus === "Rejected");
    const list = sf === "All" ? liveP : sf === "Lost" ? lostP : visProjects.filter(p => p.stage === sf && p.dealStatus !== "Rejected");
    const activeStages = STAGES.filter(s => liveP.some(p => p.stage === s));
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: "6px",
        flexWrap: "wrap",
        marginBottom: "18px"
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => setSf("All"),
      style: {
        background: sf === "All" ? BLUE_BG : "rgba(255,255,255,0.05)",
        color: sf === "All" ? BLUE : TXT2,
        border: `1px solid ${sf === "All" ? "rgba(59,130,246,0.4)" : "#e2e5e9"}`,
        borderRadius: "20px",
        padding: "5px 14px",
        cursor: "pointer",
        fontSize: "13px",
        fontWeight: sf === "All" ? 700 : 500,
        transition: "all 0.3s ease",
      }
    }, "All (", liveP.length, ")"), activeStages.map(s => /*#__PURE__*/React.createElement("button", {
      key: s,
      onClick: () => setSf(s),
      style: {
        background: sf === s ? `${STAGE_COLOR[s]}20` : "rgba(255,255,255,0.05)",
        color: sf === s ? STAGE_COLOR[s] : TXT2,
        border: `1px solid ${sf === s ? STAGE_COLOR[s] + "55" : "#e2e5e9"}`,
        borderRadius: "20px",
        padding: "5px 14px",
        cursor: "pointer",
        fontSize: "13px",
        fontWeight: sf === s ? 700 : 500,
        transition: "all 0.3s ease",
      }
    }, s, " (", liveP.filter(p => p.stage === s).length, ")")), lostP.length > 0 && /*#__PURE__*/React.createElement("button", {
      onClick: () => setSf("Lost"),
      style: {
        background: sf === "Lost" ? RED_BG : "rgba(255,255,255,0.05)",
        color: sf === "Lost" ? RED : TXT2,
        border: `1px solid ${sf === "Lost" ? "rgba(239,68,68,0.4)" : "#e2e5e9"}`,
        borderRadius: "20px",
        padding: "5px 14px",
        cursor: "pointer",
        fontSize: "13px",
        fontWeight: sf === "Lost" ? 700 : 500,
        transition: "all 0.3s ease",
      }
    }, "Lost Deals (", lostP.length, ")")), list.length === 0 ? /*#__PURE__*/React.createElement(Card3D, {
      style: {
        padding: "56px",
        textAlign: "center"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: TXT3,
        fontSize: "15px"
      }
    }, "No projects in this view.")) : /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gap: "14px"
      }
    }, list.map(p => {
      const c = getCust(p.customerId);
      const sidx = STAGES.indexOf(p.stage);
      const prog = Math.round(sidx / (STAGES.length - 1) * 100);
      const dc = Object.values(p.docs || {}).filter(Boolean).length;
      const installed = p.installation?.done === "Yes";
      return /*#__PURE__*/React.createElement(Card3D, {
        key: p.id,
        onClick: () => setModal({
          type: "project",
          id: p.id
        }),
        style: {
          padding: "22px",
          opacity: p.dealStatus === "Rejected" ? 0.6 : 1,
          transition: "all 0.3s ease"
        },
        glow: true
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "14px",
          flexWrap: "wrap",
          gap: "12px"
        }
      }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          alignItems: "center",
          gap: "10px",
          flexWrap: "wrap",
          marginBottom: "6px"
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: "monospace",
          color: BLUE,
          fontSize: "14px",
          fontWeight: 700
        }
      }, p.ref), p.dealStatus === "Rejected" ? /*#__PURE__*/React.createElement(Badge, {
        label: "Lost Deal",
        color: RED
      }) : /*#__PURE__*/React.createElement(Badge, {
        label: p.stage,
        color: STAGE_COLOR[p.stage]
      }), p.loanRequired === "Yes" && /*#__PURE__*/React.createElement(Badge, {
        label: `Loan: ${p.loanStatus || "Not Applied"}`,
        color: VIOLET
      }), p.dealStatus !== "Rejected" && (installed ? /*#__PURE__*/React.createElement(Badge, {
        label: "Installed \u2713",
        color: GREEN
      }) : /*#__PURE__*/React.createElement(Badge, {
        label: `Not Installed${p.installation?.issue ? ` — ${p.installation.issue}` : ""}`,
        color: AMBER
      }))), /*#__PURE__*/React.createElement("div", {
        style: {
          color: TXT,
          fontWeight: 800,
          fontSize: "18px"
        }
      }, c.name), /*#__PURE__*/React.createElement("div", {
        style: {
          color: TXT2,
          fontSize: "13px",
          marginTop: "3px"
        }
      }, c.phone, c.village ? ` • ${c.village}` : "", c.district ? ` • ${c.district}` : "")), /*#__PURE__*/React.createElement("div", {
        style: {
          textAlign: "right"
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          color: GREEN,
          fontSize: "24px",
          fontWeight: 800,
          
        }
      }, p.kw, " kW"), /*#__PURE__*/React.createElement("div", {
        style: {
          color: TXT3,
          fontSize: "13px"
        }
      }, p.panelBrand, " ", p.panelType), /*#__PURE__*/React.createElement("div", {
        style: {
          color: TXT,
          fontWeight: 800,
          fontSize: "16px",
          marginTop: "4px"
        }
      }, inr(p.netPayable)))), p.dealStatus !== "Rejected" && /*#__PURE__*/React.createElement("div", {
        style: {
          marginBottom: "10px"
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          height: "8px",
          background: "#f8f9fa",
          borderRadius: "4px",
          overflow: "hidden",
          position: "relative"
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          height: "100%",
          width: `${prog}%`,
          background: `linear-gradient(90deg, ${STAGE_COLOR[p.stage]}88, ${STAGE_COLOR[p.stage]})`,
          borderRadius: "4px",
          transition: "width 0.6s ease"
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "linear-gradient(90deg, transparent, #c5c9d0, transparent)",
          
        }
      })))), /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          flexWrap: "wrap",
          gap: "18px",
          fontSize: "12px",
          color: TXT3,
          marginTop: "8px"
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          display: "flex",
          alignItems: "center",
          gap: "4px"
        }
      }, /*#__PURE__*/React.createElement(CheckIc, {
        size: 12,
        stroke: GREEN
      }), " Docs: ", dc, "/", DOCS.length), /*#__PURE__*/React.createElement("span", null, p.createdAt), /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: "monospace"
        }
      }, p.quoteRef), installed && p.installation?.cost && /*#__PURE__*/React.createElement("span", {
        style: {
          color: AMBER,
          fontWeight: 700
        }
      }, "Install Cost: ", inr(p.installation.cost))));
    })));
  }

  // ── DEALERS ────────────────────────────────────────────────────────────────
  function Dealers() {
    const [addOpen, setAddOpen] = useState(false);
    const [f, setF] = useState({
      name: "",
      phone: "",
      district: isPartner ? me.district : "",
      commissionPercent: 5
    });
    const dealerList = isPartner ? data.dealers.filter(d => d.district === me.district) : data.dealers;
    function add() {
      if (!f.name) return alert("Name required");
      persist({
        ...data,
        dealers: [{
          ...f,
          id: `D${uid()}`,
          advancePaid: 0,
          createdAt: today()
        }, ...data.dealers]
      });
      setF({
        name: "",
        phone: "",
        district: isPartner ? me.district : "",
        commissionPercent: 5
      });
      setAddOpen(false);
    }
    function remove(id) {
      persist({
        ...data,
        dealers: data.dealers.filter(d => d.id !== id)
      });
    }
    function updAdvance(id, val) {
      persist({
        ...data,
        dealers: data.dealers.map(d => d.id === id ? {
          ...d,
          advancePaid: Number(val)
        } : d)
      });
    }
    const rows = dealerList.map(d => {
      const accepted = data.projects.filter(p => p.dealerId === d.id && p.dealStatus === "Accepted");
      const totalComm = accepted.reduce((s, p) => {
        const pc = p.commission?.percent ?? d.commissionPercent;
        return s + (p.commission?.amount != null ? Number(p.commission.amount) : Math.round(p.netPayable * pc / 100));
      }, 0);
      const advance = Number(d.advancePaid || 0);
      return {
        d,
        count: accepted.length,
        totalComm,
        advance,
        remaining: totalComm - advance
      };
    });
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "flex-end",
        marginBottom: "18px"
      }
    }, /*#__PURE__*/React.createElement("button", {
      style: BP,
      onClick: () => setAddOpen(true)
    }, /*#__PURE__*/React.createElement(PlusIc, {
      size: 16
    }), " Add Dealer Manually")), /*#__PURE__*/React.createElement(Card3D, {
      style: {
        padding: "16px",
        marginBottom: "18px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "13px",
        color: AMBER,
        display: "flex",
        alignItems: "center",
        gap: "8px"
      }
    }, /*#__PURE__*/React.createElement(SunIc, {
      size: 16,
      stroke: AMBER
    }), " Dealer ka naam Quote banate time bhi likh sakte ho \u2014 woh automatically yahan add ho jayega.")), /*#__PURE__*/React.createElement(Card3D, {
      style: {
        overflow: "hidden"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px 24px",
        borderBottom: `1px solid ${BORDER}`
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: TXT,
        fontWeight: 800,
        fontSize: "15px",
        display: "flex",
        alignItems: "center",
        gap: "8px"
      }
    }, /*#__PURE__*/React.createElement(HandIc, {
      size: 18
    }), " Dealer Commission Summary"), /*#__PURE__*/React.createElement("button", {
      style: {
        ...BS,
        ...SMALL
      },
      onClick: () => downloadCSV("dealer_commission.csv", [["Dealer", "Phone", "District", "Commission %", "Accepted Deals", "Total Commission", "Advance Paid", "Remaining"], ...rows.map(r => [r.d.name, r.d.phone, r.d.district, r.d.commissionPercent, r.count, r.totalComm, r.advance, r.remaining])])
    }, /*#__PURE__*/React.createElement(DlIc, {
      size: 13
    }), " Export CSV")), rows.length === 0 ? /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "40px",
        textAlign: "center",
        color: TXT3,
        fontSize: "14px"
      }
    }, "No dealers yet \u2014 add manually, or type a dealer name while creating a quote.") : /*#__PURE__*/React.createElement("table", {
      style: {
        width: "100%",
        borderCollapse: "collapse",
        fontSize: "14px"
      }
    }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
      style: {
        borderBottom: `1px solid ${BORDER}`
      }
    }, ["Name", "District", "Comm %", "Deals", "Total Comm", "Advance Paid", "Remaining", ""].map(h => /*#__PURE__*/React.createElement("th", {
      key: h,
      style: {
        padding: "12px 16px",
        textAlign: "left",
        color: TXT3,
        fontSize: "11px",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.06em"
      }
    }, h)))), /*#__PURE__*/React.createElement("tbody", null, rows.map(({
      d,
      count,
      totalComm,
      advance,
      remaining
    }) => /*#__PURE__*/React.createElement("tr", {
      key: d.id,
      style: {
        borderBottom: `1px solid ${BORDER_SOFT}`,
        transition: "all 0.3s ease"
      },
      onMouseEnter: e => {
        e.currentTarget.style.background = "rgba(255,255,255,0.05)";
      },
      onMouseLeave: e => {
        e.currentTarget.style.background = "transparent";
      }
    }, /*#__PURE__*/React.createElement("td", {
      style: {
        padding: "14px 16px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: BLUE,
        fontWeight: 700,
        cursor: "pointer"
      },
      onClick: () => setModal({
        type: "dealer",
        id: d.id
      })
    }, d.name), /*#__PURE__*/React.createElement("div", {
      style: {
        color: TXT3,
        fontSize: "11px"
      }
    }, d.phone)), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: "14px 16px",
        color: TXT2
      }
    }, d.district), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: "14px 16px",
        color: TXT2
      }
    }, d.commissionPercent, "%"), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: "14px 16px",
        color: TXT,
        textAlign: "center",
        fontWeight: 800
      }
    }, count), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: "14px 16px",
        color: GREEN,
        fontWeight: 800
      }
    }, inr(totalComm)), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: "14px 16px"
      }
    }, /*#__PURE__*/React.createElement("input", {
      style: {
        ...IS,
        width: "100px",
        padding: "5px 10px",
        fontSize: "13px"
      },
      type: "number",
      defaultValue: advance,
      onBlur: e => updAdvance(d.id, e.target.value)
    })), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: "14px 16px",
        color: remaining > 0 ? AMBER : GREEN,
        fontWeight: 800
      }
    }, inr(remaining)), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: "14px 16px",
        display: "flex",
        gap: "6px"
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => setModal({
        type: "dealer",
        id: d.id
      }),
      style: {
        ...BS,
        ...SMALL
      }
    }, /*#__PURE__*/React.createElement(EyeIc, {
      size: 12
    }), " View"), /*#__PURE__*/React.createElement("button", {
      onClick: () => remove(d.id),
      style: {
        ...BD,
        ...SMALL
      }
    }, /*#__PURE__*/React.createElement(TrashIc, {
      size: 12
    })))))))), addOpen && /*#__PURE__*/React.createElement(Modal, {
      title: "Add Dealer Manually",
      onClose: () => setAddOpen(false)
    }, /*#__PURE__*/React.createElement(Fld, {
      label: "Name *"
    }, /*#__PURE__*/React.createElement("input", {
      style: IS,
      value: f.name,
      onChange: e => setF(p => ({
        ...p,
        name: e.target.value
      }))
    })), /*#__PURE__*/React.createElement(Fld, {
      label: "Phone"
    }, /*#__PURE__*/React.createElement("input", {
      style: IS,
      value: f.phone,
      onChange: e => setF(p => ({
        ...p,
        phone: e.target.value
      }))
    })), /*#__PURE__*/React.createElement(Fld, {
      label: "District"
    }, /*#__PURE__*/React.createElement("input", {
      style: IS,
      value: f.district,
      onChange: e => setF(p => ({
        ...p,
        district: e.target.value
      })),
      disabled: isPartner
    })), /*#__PURE__*/React.createElement(Fld, {
      label: "Default Commission %"
    }, /*#__PURE__*/React.createElement("input", {
      style: IS,
      type: "number",
      value: f.commissionPercent,
      onChange: e => setF(p => ({
        ...p,
        commissionPercent: e.target.value
      }))
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: "10px",
        justifyContent: "flex-end"
      }
    }, /*#__PURE__*/React.createElement("button", {
      style: BS,
      onClick: () => setAddOpen(false)
    }, "Cancel"), /*#__PURE__*/React.createElement("button", {
      style: BP,
      onClick: add
    }, "Add Dealer"))));
  }
  function DealerDetailModal({
    dealerId,
    onClose
  }) {
    const d = getDealer(dealerId);
    if (!d) return null;
    const projs = data.projects.filter(p => p.dealerId === dealerId);
    const accepted = projs.filter(p => p.dealStatus === "Accepted");
    const totalComm = accepted.reduce((s, p) => {
      const pc = p.commission?.percent ?? d.commissionPercent;
      return s + (p.commission?.amount != null ? Number(p.commission.amount) : Math.round(p.netPayable * pc / 100));
    }, 0);
    const advance = Number(d.advancePaid || 0);
    function updField(k, v) {
      persist({
        ...data,
        dealers: data.dealers.map(x => x.id === dealerId ? {
          ...x,
          [k]: v
        } : x)
      });
    }
    return /*#__PURE__*/React.createElement(Modal, {
      title: `Dealer: ${d.name}`,
      onClose: onClose,
      wide: true
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(3,1fr)",
        gap: "14px",
        marginBottom: "20px"
      }
    }, [{
      label: "Total Projects",
      val: projs.length,
      color: BLUE
    }, {
      label: "Total Commission",
      val: inr(totalComm),
      color: GREEN
    }, {
      label: "Remaining Due",
      val: inr(totalComm - advance),
      color: totalComm - advance > 0 ? AMBER : GREEN
    }].map(x => /*#__PURE__*/React.createElement(Card3D, {
      key: x.label,
      style: {
        padding: "16px"
      },
      glow: true
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: TXT3,
        fontSize: "10px",
        textTransform: "uppercase",
        fontWeight: 700,
        marginBottom: "8px"
      }
    }, x.label), /*#__PURE__*/React.createElement("div", {
      style: {
        color: x.color,
        fontWeight: 800,
        fontSize: "22px",
        
      }
    }, x.val)))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexWrap: "wrap",
        gap: "12px",
        marginBottom: "20px"
      }
    }, /*#__PURE__*/React.createElement(Fld, {
      label: "Phone",
      half: true
    }, /*#__PURE__*/React.createElement("input", {
      style: IS,
      defaultValue: d.phone,
      onBlur: e => updField("phone", e.target.value)
    })), /*#__PURE__*/React.createElement(Fld, {
      label: "District",
      half: true
    }, /*#__PURE__*/React.createElement("input", {
      style: IS,
      defaultValue: d.district,
      onBlur: e => updField("district", e.target.value)
    })), /*#__PURE__*/React.createElement(Fld, {
      label: "Default Comm %",
      half: true
    }, /*#__PURE__*/React.createElement("input", {
      style: IS,
      type: "number",
      defaultValue: d.commissionPercent,
      onBlur: e => updField("commissionPercent", e.target.value)
    })), /*#__PURE__*/React.createElement(Fld, {
      label: "Advance Paid (\u20B9)",
      half: true
    }, /*#__PURE__*/React.createElement("input", {
      style: IS,
      type: "number",
      defaultValue: advance,
      onBlur: e => updField("advancePaid", e.target.value)
    }))), /*#__PURE__*/React.createElement(SectionTitle, null, "Projects via this Dealer"), projs.length === 0 ? /*#__PURE__*/React.createElement("div", {
      style: {
        color: TXT3,
        fontSize: "14px",
        padding: "28px",
        textAlign: "center",
        background: BORDER_SOFT,
        borderRadius: "10px"
      }
    }, "No projects yet.") : /*#__PURE__*/React.createElement("div", {
      style: {
        border: `1px solid ${BORDER}`,
        borderRadius: "10px",
        overflow: "hidden"
      }
    }, projs.map(p => {
      const c = getCust(p.customerId);
      const pc = p.commission?.percent ?? d.commissionPercent;
      const amt = p.commission?.amount != null ? Number(p.commission.amount) : Math.round(p.netPayable * pc / 100);
      const statusColor = p.dealStatus === "Accepted" ? GREEN : p.dealStatus === "Rejected" ? RED : AMBER;
      return /*#__PURE__*/React.createElement("div", {
        key: p.id,
        style: {
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "12px 16px",
          borderBottom: `1px solid ${BORDER_SOFT}`,
          fontSize: "13px",
          transition: "all 0.3s ease"
        },
        onMouseEnter: e => {
          e.currentTarget.style.background = "rgba(255,255,255,0.05)";
        },
        onMouseLeave: e => {
          e.currentTarget.style.background = "transparent";
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: "monospace",
          color: BLUE,
          fontWeight: 700,
          minWidth: "100px"
        }
      }, p.ref), /*#__PURE__*/React.createElement("span", {
        style: {
          flex: 1,
          color: TXT
        }
      }, c.name), /*#__PURE__*/React.createElement(Badge, {
        label: p.dealStatus,
        color: statusColor
      }), /*#__PURE__*/React.createElement("span", {
        style: {
          color: GREEN,
          fontWeight: 700,
          minWidth: "90px",
          textAlign: "right"
        }
      }, inr(amt)));
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "flex-end",
        marginTop: "20px"
      }
    }, /*#__PURE__*/React.createElement("button", {
      style: BS,
      onClick: onClose
    }, "Close")));
  }

  // ── INVENTORY ─────────────────────────────────────────────────────────────
  function Inventory() {
    const [f, setF] = useState({
      date: today(),
      item: "",
      brand: "",
      qty: "",
      unit: "Nos",
      rate: ""
    });
    function add() {
      if (!f.item || !f.qty) return alert("Item & Qty required");
      persist({
        ...data,
        inventory: [{
          ...f,
          id: `I${uid()}`,
          amount: Number(f.qty) * Number(f.rate || 0)
        }, ...data.inventory]
      });
      setF({
        date: today(),
        item: "",
        brand: "",
        qty: "",
        unit: "Nos",
        rate: ""
      });
    }
    function remove(id) {
      persist({
        ...data,
        inventory: data.inventory.filter(i => i.id !== id)
      });
    }
    function updUsed(id, val) {
      persist({
        ...data,
        inventory: data.inventory.map(i => i.id === id ? {
          ...i,
          used: val
        } : i)
      });
    }
    const totalAmount = data.inventory.reduce((s, i) => s + Number(i.amount || 0), 0);
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Card3D, {
      style: {
        padding: "22px",
        marginBottom: "18px"
      },
      glow: true
    }, /*#__PURE__*/React.createElement(SectionTitle, null, "Add Material Entry (manual)"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexWrap: "wrap",
        gap: "10px",
        alignItems: "flex-end"
      }
    }, /*#__PURE__*/React.createElement("input", {
      style: {
        ...IS,
        flex: "0 1 130px"
      },
      type: "date",
      value: f.date,
      onChange: e => setF(p => ({
        ...p,
        date: e.target.value
      }))
    }), /*#__PURE__*/React.createElement("input", {
      style: {
        ...IS,
        flex: "2 1 180px"
      },
      placeholder: "Item (e.g. Waaree 580W Panel)",
      value: f.item,
      onChange: e => setF(p => ({
        ...p,
        item: e.target.value
      }))
    }), /*#__PURE__*/React.createElement("input", {
      style: {
        ...IS,
        flex: "1 1 110px"
      },
      placeholder: "Brand",
      value: f.brand,
      onChange: e => setF(p => ({
        ...p,
        brand: e.target.value
      }))
    }), /*#__PURE__*/React.createElement("input", {
      style: {
        ...IS,
        flex: "0 1 90px"
      },
      type: "number",
      placeholder: "Qty",
      value: f.qty,
      onChange: e => setF(p => ({
        ...p,
        qty: e.target.value
      }))
    }), /*#__PURE__*/React.createElement("input", {
      style: {
        ...IS,
        flex: "0 1 90px"
      },
      placeholder: "Unit",
      value: f.unit,
      onChange: e => setF(p => ({
        ...p,
        unit: e.target.value
      }))
    }), /*#__PURE__*/React.createElement("input", {
      style: {
        ...IS,
        flex: "0 1 120px"
      },
      type: "number",
      placeholder: "Rate (\u20B9)",
      value: f.rate,
      onChange: e => setF(p => ({
        ...p,
        rate: e.target.value
      }))
    }), /*#__PURE__*/React.createElement("button", {
      style: BP,
      onClick: add
    }, /*#__PURE__*/React.createElement(PlusIc, {
      size: 16
    }), " Add"))), /*#__PURE__*/React.createElement(Card3D, {
      style: {
        overflow: "hidden"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px 24px",
        borderBottom: `1px solid ${BORDER}`
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: TXT,
        fontWeight: 800,
        fontSize: "15px"
      }
    }, "Stock \u2014 Total Purchased: ", /*#__PURE__*/React.createElement("span", {
      style: {
        color: GREEN,
              }
    }, inr(totalAmount))), /*#__PURE__*/React.createElement("button", {
      style: {
        ...BS,
        ...SMALL
      },
      onClick: () => downloadCSV("inventory.csv", [["Date", "Item", "Brand", "Qty", "Unit", "Rate", "Amount", "Used", "Remaining"], ...data.inventory.map(i => [i.date, i.item, i.brand, i.qty, i.unit, i.rate, i.amount, i.used || 0, Number(i.qty) - Number(i.used || 0)])])
    }, /*#__PURE__*/React.createElement(DlIc, {
      size: 13
    }), " Export CSV")), data.inventory.length === 0 ? /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "40px",
        textAlign: "center",
        color: TXT3,
        fontSize: "14px"
      }
    }, "No material entries yet.") : /*#__PURE__*/React.createElement("table", {
      style: {
        width: "100%",
        borderCollapse: "collapse",
        fontSize: "14px"
      }
    }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
      style: {
        borderBottom: `1px solid ${BORDER}`
      }
    }, ["Date", "Item", "Brand", "Qty", "Rate", "Amount", "Used", "Remaining", ""].map(h => /*#__PURE__*/React.createElement("th", {
      key: h,
      style: {
        padding: "12px 16px",
        textAlign: "left",
        color: TXT3,
        fontSize: "11px",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.06em"
      }
    }, h)))), /*#__PURE__*/React.createElement("tbody", null, data.inventory.map(i => {
      const remaining = Number(i.qty) - Number(i.used || 0);
      return /*#__PURE__*/React.createElement("tr", {
        key: i.id,
        style: {
          borderBottom: `1px solid ${BORDER_SOFT}`,
          transition: "all 0.3s ease"
        },
        onMouseEnter: e => {
          e.currentTarget.style.background = "rgba(255,255,255,0.05)";
        },
        onMouseLeave: e => {
          e.currentTarget.style.background = "transparent";
        }
      }, /*#__PURE__*/React.createElement("td", {
        style: {
          padding: "12px 16px",
          color: TXT3
        }
      }, i.date), /*#__PURE__*/React.createElement("td", {
        style: {
          padding: "12px 16px",
          color: TXT,
          fontWeight: 600
        }
      }, i.item), /*#__PURE__*/React.createElement("td", {
        style: {
          padding: "12px 16px",
          color: TXT2
        }
      }, i.brand), /*#__PURE__*/React.createElement("td", {
        style: {
          padding: "12px 16px",
          color: TXT
        }
      }, i.qty, " ", i.unit), /*#__PURE__*/React.createElement("td", {
        style: {
          padding: "12px 16px",
          color: TXT2
        }
      }, inr(i.rate)), /*#__PURE__*/React.createElement("td", {
        style: {
          padding: "12px 16px",
          color: GREEN,
          fontWeight: 800
        }
      }, inr(i.amount)), /*#__PURE__*/React.createElement("td", {
        style: {
          padding: "12px 16px"
        }
      }, /*#__PURE__*/React.createElement("input", {
        style: {
          ...IS,
          width: "80px",
          padding: "5px 10px",
          fontSize: "13px"
        },
        type: "number",
        defaultValue: i.used || "",
        onBlur: e => updUsed(i.id, e.target.value)
      })), /*#__PURE__*/React.createElement("td", {
        style: {
          padding: "12px 16px",
          color: remaining <= 0 ? RED : AMBER,
          fontWeight: 800
        }
      }, remaining, " ", i.unit), /*#__PURE__*/React.createElement("td", {
        style: {
          padding: "12px 16px"
        }
      }, /*#__PURE__*/React.createElement("button", {
        onClick: () => remove(i.id),
        style: {
          ...BD,
          ...SMALL
        }
      }, /*#__PURE__*/React.createElement(TrashIc, {
        size: 12
      }))));
    })))));
  }

  // ── EXPENSES ───────────────────────────────────────────────────────────────
  function Expenses() {
    const [f, setF] = useState({
      amount: "",
      note: ""
    });
    function add() {
      if (!f.amount || !f.note) return alert("Amount & Note required");
      persist({
        ...data,
        expenses: [{
          ...f,
          id: `E${uid()}`,
          date: today(),
          by: me.name
        }, ...data.expenses]
      });
      setF({
        amount: "",
        note: ""
      });
    }
    function remove(id) {
      persist({
        ...data,
        expenses: data.expenses.filter(e => e.id !== id)
      });
    }
    const total = data.expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Card3D, {
      style: {
        padding: "22px",
        marginBottom: "18px"
      },
      glow: true
    }, /*#__PURE__*/React.createElement(SectionTitle, null, "Add Extra Expense"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: "10px"
      }
    }, /*#__PURE__*/React.createElement("input", {
      style: {
        ...IS,
        flex: "0 1 140px"
      },
      type: "number",
      placeholder: "Amount (\u20B9)",
      value: f.amount,
      onChange: e => setF(p => ({
        ...p,
        amount: e.target.value
      }))
    }), /*#__PURE__*/React.createElement("input", {
      style: {
        ...IS,
        flex: 1
      },
      placeholder: "Where spent? (e.g. Fuel, Site visit, Tools)",
      value: f.note,
      onChange: e => setF(p => ({
        ...p,
        note: e.target.value
      }))
    }), /*#__PURE__*/React.createElement("button", {
      style: BP,
      onClick: add
    }, /*#__PURE__*/React.createElement(PlusIc, {
      size: 16
    }), " Add"))), /*#__PURE__*/React.createElement(Card3D, {
      style: {
        overflow: "hidden"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px 24px",
        borderBottom: `1px solid ${BORDER}`
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: TXT,
        fontWeight: 800,
        fontSize: "15px"
      }
    }, "Total Expenses: ", /*#__PURE__*/React.createElement("span", {
      style: {
        color: RED,
        
      }
    }, inr(total))), /*#__PURE__*/React.createElement("button", {
      style: {
        ...BS,
        ...SMALL
      },
      onClick: () => downloadCSV("expenses.csv", [["Date", "Amount", "Note", "By"], ...data.expenses.map(e => [e.date, e.amount, e.note, e.by])])
    }, /*#__PURE__*/React.createElement(DlIc, {
      size: 13
    }), " Export CSV")), data.expenses.length === 0 ? /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "40px",
        textAlign: "center",
        color: TXT3,
        fontSize: "14px"
      }
    }, "No expenses recorded.") : data.expenses.map(e => /*#__PURE__*/React.createElement("div", {
      key: e.id,
      style: {
        display: "flex",
        alignItems: "center",
        padding: "12px 24px",
        borderBottom: `1px solid ${BORDER_SOFT}`,
        gap: "14px",
        fontSize: "14px",
        transition: "all 0.3s ease"
      },
      onMouseEnter: ev => {
        ev.currentTarget.style.background = "rgba(255,255,255,0.05)";
      },
      onMouseLeave: ev => {
        ev.currentTarget.style.background = "transparent";
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: TXT3,
        minWidth: "100px",
        fontSize: "13px"
      }
    }, e.date), /*#__PURE__*/React.createElement("span", {
      style: {
        color: RED,
        fontWeight: 800,
        minWidth: "100px",
        fontSize: "15px"
      }
    }, inr(e.amount)), /*#__PURE__*/React.createElement("span", {
      style: {
        color: TXT,
        flex: 1
      }
    }, e.note), /*#__PURE__*/React.createElement("span", {
      style: {
        color: TXT3,
        fontSize: "12px"
      }
    }, e.by), /*#__PURE__*/React.createElement("button", {
      onClick: () => remove(e.id),
      style: {
        ...BD,
        ...SMALL
      }
    }, /*#__PURE__*/React.createElement(TrashIc, {
      size: 12
    }))))));
  }

  // ── REPORTS ────────────────────────────────────────────────────────────────
  function Reports() {
    const districts = [...new Set(visCustomers.map(c => c.district).filter(Boolean))];
    const rows = districts.map(dist => {
      const custIds = visCustomers.filter(c => c.district === dist).map(c => c.id);
      const projs = visProjects.filter(p => custIds.includes(p.customerId));
      const live = projs.filter(p => p.dealStatus !== "Rejected");
      return {
        district: dist,
        total: live.length,
        totalKw: live.reduce((s, p) => s + Number(p.kw || 0), 0).toFixed(2),
        totalVal: live.reduce((s, p) => s + Number(p.netPayable || 0), 0),
        completed: live.filter(p => p.stage === "Completed").length,
        pending: live.filter(p => p.stage !== "Completed").length,
        installed: live.filter(p => p.installation?.done === "Yes").length,
        subsidyApplied: live.filter(p => ["Subsidy Applied", "Completed"].includes(p.stage)).length,
        lost: projs.filter(p => p.dealStatus === "Rejected").length
      };
    });
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Card3D, {
      style: {
        overflow: "hidden",
        marginBottom: "18px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px 24px",
        borderBottom: `1px solid ${BORDER}`
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        color: TXT,
        fontWeight: 800,
        fontSize: "15px",
        display: "flex",
        alignItems: "center",
        gap: "8px"
      }
    }, /*#__PURE__*/React.createElement(ChartIc, {
      size: 18
    }), " District-wise Business Report"), /*#__PURE__*/React.createElement("button", {
      style: {
        ...BS,
        ...SMALL
      },
      onClick: () => downloadCSV("district_report.csv", [["District", "Projects", "Total kW", "Total Value", "Completed", "Pending", "Installed", "Subsidy Applied", "Lost"], ...rows.map(r => [r.district, r.total, r.totalKw, r.totalVal, r.completed, r.pending, r.installed, r.subsidyApplied, r.lost])])
    }, /*#__PURE__*/React.createElement(DlIc, {
      size: 13
    }), " Export CSV")), rows.length === 0 ? /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "40px",
        textAlign: "center",
        color: TXT3,
        fontSize: "14px"
      }
    }, "No data yet.") : /*#__PURE__*/React.createElement("table", {
      style: {
        width: "100%",
        borderCollapse: "collapse",
        fontSize: "14px"
      }
    }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
      style: {
        borderBottom: `1px solid ${BORDER}`
      }
    }, ["District", "Projects", "Total kW", "Total Value", "Completed", "Pending", "Installed", "Subsidy", "Lost"].map(h => /*#__PURE__*/React.createElement("th", {
      key: h,
      style: {
        padding: "12px 16px",
        textAlign: "left",
        color: TXT3,
        fontSize: "11px",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.06em"
      }
    }, h)))), /*#__PURE__*/React.createElement("tbody", null, rows.map(r => /*#__PURE__*/React.createElement("tr", {
      key: r.district,
      style: {
        borderBottom: `1px solid ${BORDER_SOFT}`,
        transition: "all 0.3s ease"
      },
      onMouseEnter: e => {
        e.currentTarget.style.background = "rgba(255,255,255,0.05)";
      },
      onMouseLeave: e => {
        e.currentTarget.style.background = "transparent";
      }
    }, /*#__PURE__*/React.createElement("td", {
      style: {
        padding: "12px 16px",
        color: TXT,
        fontWeight: 800
      }
    }, r.district), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: "12px 16px",
        color: TXT2
      }
    }, r.total), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: "12px 16px",
        color: "#ea580c",
        fontWeight: 700
      }
    }, r.totalKw, " kW"), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: "12px 16px",
        color: GREEN,
        fontWeight: 800
      }
    }, inr(r.totalVal)), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: "12px 16px",
        color: GREEN
      }
    }, r.completed), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: "12px 16px",
        color: AMBER
      }
    }, r.pending), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: "12px 16px",
        color: BLUE
      }
    }, r.installed), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: "12px 16px",
        color: VIOLET
      }
    }, r.subsidyApplied), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: "12px 16px",
        color: RED
      }
    }, r.lost)))))), /*#__PURE__*/React.createElement(Card3D, {
      style: {
        overflow: "hidden"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "16px 24px",
        borderBottom: `1px solid ${BORDER}`,
        color: TXT,
        fontWeight: 800,
        fontSize: "15px"
      }
    }, "Full Project Status Export"), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "20px 24px"
      }
    }, /*#__PURE__*/React.createElement("button", {
      style: BP,
      onClick: () => downloadCSV("all_projects.csv", [["Ref", "Customer", "Phone", "District", "kW", "Net Value", "Stage", "Deal Status", "Installed", "Subsidy Applied"], ...visProjects.map(p => {
        const c = getCust(p.customerId);
        return [p.ref, c.name, c.phone, c.district, p.kw, p.netPayable, p.stage, p.dealStatus, p.installation?.done || "No", ["Subsidy Applied", "Completed"].includes(p.stage) ? "Yes" : "No"];
      })])
    }, /*#__PURE__*/React.createElement(DlIc, {
      size: 16
    }), " Download Full Project List (CSV)"))));
  }

  // ── PRICE LIST ─────────────────────────────────────────────────────────────
  function PriceListTab() {
    const [pl, setPl] = useState(JSON.parse(JSON.stringify(data.priceList)));
    function updBif(idx, brand, val) {
      const c = JSON.parse(JSON.stringify(pl));
      c.BIFACIAL[idx][brand] = Number(val);
      setPl(c);
    }
    function updTop(idx, brand, val) {
      const c = JSON.parse(JSON.stringify(pl));
      c.TOPCON[idx][brand].p = Number(val);
      setPl(c);
    }
    function save() {
      persist({
        ...data,
        priceList: pl
      });
      alert("Price list saved!");
    }
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Card3D, {
      style: {
        padding: "20px",
        marginBottom: "18px"
      },
      glow: true
    }, /*#__PURE__*/React.createElement(SectionTitle, null, "BIFACIAL 530-550 WP \u2014 Price per System (incl. installation)"), /*#__PURE__*/React.createElement("div", {
      style: {
        overflowX: "auto"
      }
    }, /*#__PURE__*/React.createElement("table", {
      style: {
        width: "100%",
        borderCollapse: "collapse",
        fontSize: "13px"
      }
    }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
      style: {
        borderBottom: `1px solid ${BORDER}`
      }
    }, ["Panels", "kW", "ADANI", "WAAREE", "APS"].map(h => /*#__PURE__*/React.createElement("th", {
      key: h,
      style: {
        padding: "8px 10px",
        color: TXT3,
        textAlign: "left",
        fontWeight: 700
      }
    }, h)))), /*#__PURE__*/React.createElement("tbody", null, pl.BIFACIAL.map((r, i) => /*#__PURE__*/React.createElement("tr", {
      key: r.nos,
      style: {
        borderTop: `1px solid ${BORDER_SOFT}`,
        transition: "all 0.3s ease"
      },
      onMouseEnter: e => {
        e.currentTarget.style.background = "rgba(255,255,255,0.05)";
      },
      onMouseLeave: e => {
        e.currentTarget.style.background = "transparent";
      }
    }, /*#__PURE__*/React.createElement("td", {
      style: {
        padding: "6px 10px",
        color: TXT,
        fontWeight: 700
      }
    }, r.nos), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: "6px 10px",
        color: TXT2
      }
    }, r.kw), ["ADANI", "WAAREE", "APS"].map(b => /*#__PURE__*/React.createElement("td", {
      key: b,
      style: {
        padding: "6px 10px"
      }
    }, /*#__PURE__*/React.createElement("input", {
      style: {
        ...IS,
        padding: "6px 10px",
        width: "100px"
      },
      type: "number",
      value: r[b],
      onChange: e => updBif(i, b, e.target.value)
    }))))))))), /*#__PURE__*/React.createElement(Card3D, {
      style: {
        padding: "20px",
        marginBottom: "18px"
      },
      glow: true
    }, /*#__PURE__*/React.createElement(SectionTitle, null, "TOPCON 560-620 WP \u2014 Price per System (incl. installation)"), /*#__PURE__*/React.createElement("div", {
      style: {
        overflowX: "auto"
      }
    }, /*#__PURE__*/React.createElement("table", {
      style: {
        width: "100%",
        borderCollapse: "collapse",
        fontSize: "13px"
      }
    }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
      style: {
        borderBottom: `1px solid ${BORDER}`
      }
    }, ["Panels", "PAHAL", "ADANI", "WAAREE", "APS"].map(h => /*#__PURE__*/React.createElement("th", {
      key: h,
      style: {
        padding: "8px 10px",
        color: TXT3,
        textAlign: "left",
        fontWeight: 700
      }
    }, h)))), /*#__PURE__*/React.createElement("tbody", null, pl.TOPCON.map((r, i) => /*#__PURE__*/React.createElement("tr", {
      key: r.nos,
      style: {
        borderTop: `1px solid ${BORDER_SOFT}`,
        transition: "all 0.3s ease"
      },
      onMouseEnter: e => {
        e.currentTarget.style.background = "rgba(255,255,255,0.05)";
      },
      onMouseLeave: e => {
        e.currentTarget.style.background = "transparent";
      }
    }, /*#__PURE__*/React.createElement("td", {
      style: {
        padding: "6px 10px",
        color: TXT,
        fontWeight: 700
      }
    }, r.nos), ["PAHAL", "ADANI", "WAAREE", "APS"].map(b => /*#__PURE__*/React.createElement("td", {
      key: b,
      style: {
        padding: "6px 10px"
      }
    }, /*#__PURE__*/React.createElement("input", {
      style: {
        ...IS,
        padding: "6px 10px",
        width: "100px"
      },
      type: "number",
      value: r[b].p,
      onChange: e => updTop(i, b, e.target.value)
    }))))))))), /*#__PURE__*/React.createElement("button", {
      style: BP,
      onClick: save
    }, "Save Price List"));
  }

  // ── TEAM ──────────────────────────────────────────────────────────────────
  function Team() {
    const [f, setF] = useState({
      name: "",
      role: "partner",
      district: "",
      pin: ""
    });
    function add() {
      if (!f.name) return alert("Name required");
      persist({
        ...data,
        team: [...data.team, {
          ...f,
          id: `u${uid()}`
        }]
      });
      setF({
        name: "",
        role: "partner",
        district: "",
        pin: ""
      });
    }
    function remove(id) {
      if (data.team.length <= 1) return alert("Need at least 1 user");
      const team = data.team.filter(t => t.id !== id);
      persist({
        ...data,
        team,
        user: data.user === id ? team[0].id : data.user
      });
    }
    function updPin(id, pin) {
      persist({
        ...data,
        team: data.team.map(t => t.id === id ? {
          ...t,
          pin
        } : t)
      });
    }
    function updDistrict(id, district) {
      persist({
        ...data,
        team: data.team.map(t => t.id === id ? {
          ...t,
          district
        } : t)
      });
    }
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Card3D, {
      style: {
        padding: "22px",
        marginBottom: "18px"
      },
      glow: true
    }, /*#__PURE__*/React.createElement(SectionTitle, null, "Add Team Member"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: "10px",
        flexWrap: "wrap"
      }
    }, /*#__PURE__*/React.createElement("input", {
      style: {
        ...IS,
        flex: "1 1 180px"
      },
      placeholder: "Name",
      value: f.name,
      onChange: e => setF(p => ({
        ...p,
        name: e.target.value
      }))
    }), /*#__PURE__*/React.createElement("select", {
      style: {
        ...SS,
        flex: "0 1 180px"
      },
      value: f.role,
      onChange: e => setF(p => ({
        ...p,
        role: e.target.value
      }))
    }, /*#__PURE__*/React.createElement("option", {
      value: "partner"
    }, "District Partner"), /*#__PURE__*/React.createElement("option", {
      value: "admin"
    }, "Admin")), f.role === "partner" && /*#__PURE__*/React.createElement("input", {
      style: {
        ...IS,
        flex: "0 1 160px"
      },
      placeholder: "District",
      value: f.district,
      onChange: e => setF(p => ({
        ...p,
        district: e.target.value
      }))
    }), /*#__PURE__*/React.createElement("input", {
      style: {
        ...IS,
        flex: "0 1 150px"
      },
      placeholder: "Security Code (PIN)",
      value: f.pin,
      onChange: e => setF(p => ({
        ...p,
        pin: e.target.value
      }))
    }), /*#__PURE__*/React.createElement("button", {
      style: BP,
      onClick: add
    }, /*#__PURE__*/React.createElement(PlusIc, {
      size: 16
    }), " Add")), /*#__PURE__*/React.createElement("div", {
      style: {
        color: TXT3,
        fontSize: "12px",
        marginTop: "10px"
      }
    }, "Security Code set karne se sirf woh banda apne profile se login kar sakega.")), /*#__PURE__*/React.createElement(Card3D, {
      style: {
        overflow: "hidden"
      }
    }, data.team.map(t => /*#__PURE__*/React.createElement("div", {
      key: t.id,
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "14px 24px",
        borderBottom: `1px solid ${BORDER_SOFT}`,
        gap: "10px",
        flexWrap: "wrap",
        transition: "all 0.3s ease"
      },
      onMouseEnter: e => {
        e.currentTarget.style.background = "rgba(255,255,255,0.05)";
      },
      onMouseLeave: e => {
        e.currentTarget.style.background = "transparent";
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: "12px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: "40px",
        height: "40px",
        borderRadius: "50%",
        background: BLUE_BG,
        border: "1px solid rgba(59,130,246,0.3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: BLUE,
        fontWeight: 800,
        fontSize: "14px",
        boxShadow: "0 0 15px rgba(59,130,246,0.2)"
      }
    }, t.name[0]), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        color: TXT,
        fontSize: "15px",
        fontWeight: 700
      }
    }, t.name), /*#__PURE__*/React.createElement("div", {
      style: {
        color: TXT3,
        fontSize: "12px"
      }
    }, t.role === "admin" ? "Admin" : "District Partner", t.district ? ` — ${t.district}` : ""))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        flexWrap: "wrap"
      }
    }, t.role === "partner" && /*#__PURE__*/React.createElement("input", {
      style: {
        ...IS,
        width: "130px",
        padding: "6px 12px",
        fontSize: "13px"
      },
      placeholder: "District",
      defaultValue: t.district,
      onBlur: e => updDistrict(t.id, e.target.value)
    }), /*#__PURE__*/React.createElement("input", {
      style: {
        ...IS,
        width: "140px",
        padding: "6px 12px",
        fontSize: "13px"
      },
      placeholder: "Security Code",
      defaultValue: t.pin || "",
      onBlur: e => updPin(t.id, e.target.value)
    }), data.team.indexOf(t) > 0 && /*#__PURE__*/React.createElement("button", {
      onClick: () => remove(t.id),
      style: {
        ...BD,
        ...SMALL
      }
    }, /*#__PURE__*/React.createElement(TrashIc, {
      size: 12
    })))))));
  }

  // ── TABS ──────────────────────────────────────────────────────────────────
  const TABS = isAdmin ? [{
    id: "dashboard",
    l: "Dashboard",
    i: /*#__PURE__*/React.createElement(HomeIc, null)
  }, {
    id: "customers",
    l: `Customers (${data.customers.length})`,
    i: /*#__PURE__*/React.createElement(UsersIc, null)
  }, {
    id: "quotations",
    l: `Quotations (${data.quotes.length})`,
    i: /*#__PURE__*/React.createElement(FileIc, null)
  }, {
    id: "projects",
    l: `Projects (${data.projects.length})`,
    i: /*#__PURE__*/React.createElement(GearIc, null)
  }, {
    id: "dealers",
    l: "Dealers",
    i: /*#__PURE__*/React.createElement(HandIc, null)
  }, {
    id: "inventory",
    l: "Inventory",
    i: /*#__PURE__*/React.createElement(BoxIc, null)
  }, {
    id: "expenses",
    l: "Expenses",
    i: /*#__PURE__*/React.createElement(WalletIc, null)
  }, {
    id: "reports",
    l: "Reports",
    i: /*#__PURE__*/React.createElement(ChartIc, null)
  }, {
    id: "pricelist",
    l: "Price List",
    i: /*#__PURE__*/React.createElement(TagIc, null)
  }, {
    id: "team",
    l: "Team",
    i: /*#__PURE__*/React.createElement(UserCogIc, null)
  }] : [{
    id: "dashboard",
    l: "Dashboard",
    i: /*#__PURE__*/React.createElement(HomeIc, null)
  }, {
    id: "customers",
    l: `Customers (${visCustomers.length})`,
    i: /*#__PURE__*/React.createElement(UsersIc, null)
  }, {
    id: "quotations",
    l: `Quotations (${visQuotes.length})`,
    i: /*#__PURE__*/React.createElement(FileIc, null)
  }, {
    id: "projects",
    l: `Projects (${visProjects.length})`,
    i: /*#__PURE__*/React.createElement(GearIc, null)
  }, {
    id: "dealers",
    l: "Dealers",
    i: /*#__PURE__*/React.createElement(HandIc, null)
  }, {
    id: "reports",
    l: "Reports",
    i: /*#__PURE__*/React.createElement(ChartIc, null)
  }];

  // ── RENDER ────────────────────────────────────────────────────────────────
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#f5f6f8",
      minHeight: "100vh",
      color: TXT,
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement(ParticleBackground, null), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      background: "radial-gradient(circle at 20% 80%, rgba(245,158,11,0.05) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(22,163,74,0.03) 0%, transparent 50%)",
      pointerEvents: "none",
      zIndex: 1
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#ffffff",
      borderBottom: "1px solid #e2e5e9",
      padding: "0 28px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      height: "60px",
      position: "sticky",
      top: 0,
      zIndex: 200,
      boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "12px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      
    }
  }, /*#__PURE__*/React.createElement(Logo, {
    size: 36
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(BrandName, {
    size: 16
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      color: TXT3,
      fontSize: "10px",
      letterSpacing: "0.12em",
      textTransform: "uppercase"
    }
  }, "Solar Division \u2014 CRM"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "12px"
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    label: `${me.name} • ${me.role === "admin" ? "Admin" : "Partner"}${me.district ? ` (${me.district})` : ""}`,
    color: BLUE
  }), /*#__PURE__*/React.createElement("button", {
    onClick: () => persist({
      ...data,
      loggedIn: false
    }),
    style: {
      ...BS,
      ...SMALL
    }
  }, /*#__PURE__*/React.createElement(LogOutIc, {
    size: 13
  }), " Logout"))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#ffffff",
      borderBottom: "1px solid #e2e5e9",
      padding: "0 28px",
      display: "flex",
      gap: "2px",
      overflowX: "auto",
      position: "sticky",
      top: "60px",
      zIndex: 199
    }
  }, TABS.map(t => /*#__PURE__*/React.createElement("button", {
    key: t.id,
    onClick: () => setTab(t.id),
    style: {
      background: "none",
      border: "none",
      borderBottom: tab === t.id ? "3px solid #2563eb" : "3px solid transparent",
      color: tab === t.id ? "#2563eb" : "#4a5568",
      padding: "14px 16px",
      cursor: "pointer",
      fontSize: "13px",
      fontWeight: tab === t.id ? 700 : 500,
      whiteSpace: "nowrap",
      display: "flex",
      alignItems: "center",
      gap: "6px",
      transition: "all 0.3s ease"
    }
  }, t.i, " ", t.l))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "28px",
      maxWidth: "1300px",
      margin: "0 auto",
      position: "relative",
      zIndex: 2
    }
  }, tab === "dashboard" && /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: "28px"
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: "0 0 6px",
      fontWeight: 800,
      color: TXT,
      fontSize: "24px",
      
    }
  }, "Good day, ", me.name, " \uD83D\uDC4B"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      color: TXT3,
      fontSize: "14px"
    }
  }, new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  }))), tab !== "dashboard" && /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: "0 0 24px",
      fontWeight: 800,
      color: TXT,
      fontSize: "22px",
      
    }
  }, TABS.find(t => t.id === tab)?.l?.split(" (")[0]), tab === "dashboard" && /*#__PURE__*/React.createElement(Dashboard, null), tab === "customers" && /*#__PURE__*/React.createElement(Customers, null), tab === "quotations" && /*#__PURE__*/React.createElement(Quotations, null), tab === "projects" && /*#__PURE__*/React.createElement(Projects, null), tab === "dealers" && /*#__PURE__*/React.createElement(Dealers, null), tab === "inventory" && isAdmin && /*#__PURE__*/React.createElement(Inventory, null), tab === "expenses" && isAdmin && /*#__PURE__*/React.createElement(Expenses, null), tab === "reports" && /*#__PURE__*/React.createElement(Reports, null), tab === "pricelist" && isAdmin && /*#__PURE__*/React.createElement(PriceListTab, null), tab === "team" && isAdmin && /*#__PURE__*/React.createElement(Team, null)), modal?.type === "customer" && /*#__PURE__*/React.createElement(CustomerModal, {
    doc: modal.doc,
    onClose: () => setModal(null)
  }), modal?.type === "quote" && /*#__PURE__*/React.createElement(QuoteModal, {
    onClose: () => setModal(null)
  }), modal?.type === "quoteprint" && /*#__PURE__*/React.createElement(QuotePrint, {
    q: modal.q,
    onClose: () => setModal(null)
  }), modal?.type === "project" && /*#__PURE__*/React.createElement(ProjectDetail, {
    projId: modal.id,
    onClose: () => setModal(null)
  }), modal?.type === "dealer" && /*#__PURE__*/React.createElement(DealerDetailModal, {
    dealerId: modal.id,
    onClose: () => setModal(null)
  }));
}

// ─── MOUNT ────────────────────────────────────────────────────────────────────
createRoot(document.getElementById("root")).render(/*#__PURE__*/React.createElement(App, null));
