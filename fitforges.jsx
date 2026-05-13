import { useState, useEffect, useCallback } from "react";
import {
  Dumbbell, TrendingUp, Flame, Zap, Activity,
  Plus, ChevronDown, ChevronUp, Scale, Check,
  ListTodo, Trophy, Calendar, Utensils, Target,
  LayoutDashboard, ChevronRight, Clock, RefreshCw,
  Circle, CheckCircle2, Star, Minus, Trash2,
  RotateCcw, Heart, Info, X, Sparkles, Cpu,
  Camera, ShoppingCart, Users, Moon, BarChart2
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, LineChart, Line, BarChart, Bar
} from "recharts";

// ─── GLOBAL STYLES ───────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=Outfit:wght@300;400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { background: #060610; color: #ecedf8; font-family: 'Outfit', sans-serif; min-height: 100vh; overflow-x: hidden; }
  ::-webkit-scrollbar { width: 3px; } ::-webkit-scrollbar-thumb { background: #1c1c30; border-radius: 2px; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
  @keyframes scaleIn { from{opacity:0;transform:scale(0.94)} to{opacity:1;transform:scale(1)} }
  @keyframes glow { 0%,100%{box-shadow:0 0 24px rgba(194,245,62,.12)} 50%{box-shadow:0 0 48px rgba(194,245,62,.3)} }
  @keyframes spin { to{transform:rotate(360deg)} }
  @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
  .fu  { animation: fadeUp .45s ease both; }
  .fu1 { animation: fadeUp .45s .06s ease both; opacity:0; }
  .fu2 { animation: fadeUp .45s .12s ease both; opacity:0; }
  .fu3 { animation: fadeUp .45s .18s ease both; opacity:0; }
  .fu4 { animation: fadeUp .45s .24s ease both; opacity:0; }
  .fu5 { animation: fadeUp .45s .30s ease both; opacity:0; }
  .si  { animation: scaleIn .35s ease both; }
  input, textarea {
    background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.1);
    color: #ecedf8; border-radius: 10px; padding: 11px 14px;
    font-family: 'Outfit',sans-serif; font-size: 14px; outline: none; width: 100%;
    transition: border-color .2s;
  }
  input:focus, textarea:focus { border-color: #c2f53e; }
  input::placeholder, textarea::placeholder { color: rgba(236,237,248,.35); }
  button { cursor: pointer; font-family: 'Outfit',sans-serif; border: none; }
  .condensed { font-family: 'Barlow Condensed', sans-serif; }
`;

// ─── STORAGE ─────────────────────────────────────────────────
const store = {
  async get(k) { try { const r = await window.storage.get(k); return r ? JSON.parse(r.value) : null; } catch { return null; } },
  async set(k, v) { try { await window.storage.set(k, JSON.stringify(v)); } catch {} },
};

// ─── GOAL CONFIG ─────────────────────────────────────────────
const GOALS = [
  { id:'recomp',   emoji:'⚡', name:'Recomposition',   sub:'Build muscle. Burn fat. Simultaneously.',         color:'#c2f53e', bg:'rgba(194,245,62,.09)',  calories:'Maintenance ±100',   protein:'1.8–2.0g/kg', carbs:'3.5–4.5g/kg', fats:'0.7–1g/kg',   desc:'Burn fat and build lean muscle at the same time through precise calorie control and progressive overload.' },
  { id:'bulk',     emoji:'💪', name:'Muscle Bulk',      sub:'Maximize size. Build raw strength.',              color:'#f5a623', bg:'rgba(245,166,35,.09)',  calories:'Surplus 300–500 kcal', protein:'1.6–1.8g/kg', carbs:'5–7g/kg',   fats:'0.8–1.2g/kg', desc:'Systematic hypertrophy through progressive overload, high volume and a caloric surplus.' },
  { id:'cut',      emoji:'🔥', name:'Fat Loss',         sub:'Strip fat. Protect every pound of muscle.',       color:'#f54b5e', bg:'rgba(245,75,94,.09)',   calories:'Deficit 300–500 kcal', protein:'2.0–2.4g/kg', carbs:'2–3.5g/kg', fats:'0.6–0.8g/kg', desc:'Aggressive fat loss while preserving lean mass through a moderate deficit and high protein.' },
  { id:'athletic', emoji:'🏃', name:'Athletic',         sub:'Speed. Power. Endurance. Agility.',               color:'#3de8f5', bg:'rgba(61,232,245,.09)',  calories:'Maintenance +200',    protein:'1.6g/kg',     carbs:'6–8g/kg',   fats:'1–1.2g/kg',   desc:'Train for total performance — power, speed, and endurance like an elite athlete.' },
  { id:'daily',    emoji:'🌿', name:'Daily Fitness',    sub:'Build lasting habits. Feel great every day.',     color:'#6dde7b', bg:'rgba(109,222,123,.09)', calories:'Maintenance',         protein:'1.4–1.6g/kg', carbs:'4–5g/kg',   fats:'0.8–1g/kg',   desc:'A sustainable, balanced routine for general health, energy, and longevity.' },
  { id:'strength', emoji:'🏋️', name:'Pure Strength',   sub:'Maximum force. Unbreakable foundation.',          color:'#b36aff', bg:'rgba(179,106,255,.09)', calories:'Surplus 200–400 kcal', protein:'1.6–2.0g/kg', carbs:'4–6g/kg',   fats:'1–1.3g/kg',   desc:'Focus on the big three lifts and build raw, functional strength through progressive loading.' },
];

const GOAL_TIPS = {
  recomp:   ['Eat at maintenance calories ±100 kcal','1.8–2g protein/kg bodyweight daily','Progressive overload each session','Sleep 8h — recomp happens during recovery','Track measurements monthly, not scale daily'],
  bulk:     ['300–500 kcal above maintenance','Aim for 0.5–1kg/month weight gain','Focus on compound movements and heavy loads','Limit cardio to 2×/week to preserve gains','Mandatory deload every 4–6 weeks'],
  cut:      ['Moderate deficit — 300-500 kcal below maintenance','High protein protects muscle while cutting','3–4× cardio/week — mix HIIT and steady-state','Strength train 3× to preserve muscle','Lose no more than 0.5–1% bodyweight per week'],
  athletic: ['Periodize: power → strength → endurance phases','Carb-load before high-intensity sessions','Sprint work 2×/week for explosiveness','Include plyometrics for power development','Recovery is part of the program — honor it'],
  daily:    ['10,000 steps daily as baseline activity','Move every 30–60 min if sedentary job','Prioritize mobility and flexibility too','Sleep consistency matters as much as exercise','35 ml water per kg bodyweight daily'],
  strength: ['Focus on squat, deadlift, bench, OHP','Keep reps 3–6 for maximum strength adaptation','Long rest 3–5 min between sets','Deload every 4–5 weeks — mandatory','Technique over weight — always'],
};

// ─── WORKOUT PLANS ───────────────────────────────────────────
const make = (day, label, type, color, exercises) => ({ day, label, type, color, exercises });
const ex = (name, sets, reps, rest, muscle, note='') => ({ name, sets, reps, rest, muscle, note });
const REST = (day) => make(day, 'Rest Day', 'rest', '#333', []);

const PLANS = {
  recomp: { freq:'5 days + active recovery', split:'Upper/Lower + HIIT', schedule:[
    make('Mon','Upper Push','strength','#c2f53e',[ex('Bench Press',4,'8–10','90s','Chest','Control descent, 2s down'),ex('Overhead Press',3,'8–10','90s','Shoulders'),ex('Incline DB Press',3,'10–12','60s','Upper Chest'),ex('Lateral Raises',3,'12–15','45s','Side Delts','No momentum'),ex('Tricep Pushdown',3,'12–15','45s','Triceps'),ex('Face Pulls',3,'15–20','45s','Rear Delts','Shoulder health essential')]),
    make('Tue','Lower Body','strength','#c2f53e',[ex('Barbell Squat',4,'8–10','120s','Quads/Glutes','Depth below parallel'),ex('Romanian Deadlift',3,'10–12','90s','Hamstrings'),ex('Walking Lunges',3,'12 each','60s','Quads'),ex('Leg Press',3,'12–15','60s','Quads'),ex('Calf Raises',4,'15–20','45s','Calves','Full range, pause at bottom'),ex('Plank Hold',3,'45–60s','30s','Core')]),
    make('Wed','HIIT Cardio','cardio','#f54b5e',[ex('Jump Rope',5,'3 min on / 1 off','—','Full Body'),ex('Burpees',4,'15 reps','45s','Full Body'),ex('Mountain Climbers',4,'30s','30s','Core/Cardio'),ex('Sprint Intervals',6,'20s sprint / 40s walk','—','Legs/Cardio'),ex('Box Jumps',3,'10 reps','60s','Explosive Power')]),
    make('Thu','Upper Pull','strength','#c2f53e',[ex('Pull-ups',4,'6–10','90s','Back/Biceps','Full range, dead hang at bottom'),ex('Barbell Row',4,'8–10','90s','Mid Back'),ex('Seated Cable Row',3,'10–12','60s','Back'),ex('Single-arm DB Row',3,'10–12 each','60s','Lats'),ex('Barbell Curl',3,'10–12','60s','Biceps'),ex('Hammer Curls',2,'12–15','45s','Brachialis')]),
    make('Fri','Lower Power','strength','#c2f53e',[ex('Deadlift',4,'5–6','120s','Full Posterior','Hip hinge, not squat'),ex('Bulgarian Split Squat',3,'10 each','90s','Quads/Glutes'),ex('Hip Thrust',4,'12–15','60s','Glutes','Full extension at top'),ex('Leg Curl',3,'12–15','60s','Hamstrings'),ex('Ab Wheel Rollout',3,'10–12','45s','Core'),ex('Hanging Knee Raises',3,'15–20','45s','Lower Abs')]),
    make('Sat','Active Recovery','recovery','#3de8f5',[ex('Zone 2 Cardio',1,'30–45 min @ 60-70% max HR','—','Aerobic Base'),ex('Dynamic Stretching',1,'15 min full body','—','Mobility'),ex('Foam Rolling',1,'10 min — quads, hamstrings, back','—','Recovery')]),
    REST('Sun'),
  ]},
  bulk: { freq:'5 days/week', split:'Push / Pull / Legs', schedule:[
    make('Mon','Push A','strength','#f5a623',[ex('Barbell Bench Press',5,'5–8','120s','Chest'),ex('Overhead Press',4,'6–8','120s','Shoulders'),ex('Incline DB Press',4,'8–12','90s','Upper Chest'),ex('Cable Lateral Raises',4,'12–15','60s','Side Delts'),ex('Close-Grip Bench',3,'8–12','90s','Triceps'),ex('OHT Extension',3,'10–15','60s','Triceps Long Head')]),
    make('Tue','Pull A','strength','#f5a623',[ex('Weighted Pull-ups',4,'6–10','120s','Lats'),ex('Barbell Row',4,'6–8','120s','Back Thickness'),ex('Lat Pulldown',3,'10–12','90s','Lats'),ex('Cable Row',3,'10–12','90s','Mid Back'),ex('EZ Bar Curl',4,'8–12','60s','Biceps'),ex('Incline DB Curl',3,'10–15','60s','Biceps Stretch')]),
    make('Wed','Legs A','strength','#f5a623',[ex('Barbell Squat',5,'5–8','150s','Quads/Glutes'),ex('Romanian Deadlift',4,'8–10','120s','Hamstrings'),ex('Leg Press',4,'10–15','90s','Quads'),ex('Leg Curl',4,'10–15','90s','Hamstrings'),ex('Calf Raises',5,'12–20','60s','Calves'),ex('Ab Cable Crunch',3,'15–20','45s','Core')]),
    REST('Thu'),
    make('Fri','Push B','strength','#f5a623',[ex('DB Bench Press',4,'8–12','90s','Chest'),ex('Arnold Press',4,'10–12','90s','Shoulders'),ex('Cable Flyes',3,'12–15','60s','Chest'),ex('Lateral Raises',4,'12–15','45s','Side Delts'),ex('Skull Crushers',3,'10–12','60s','Triceps'),ex('Tricep Dips',3,'10–15','60s','Triceps')]),
    make('Sat','Pull B + Legs B','strength','#f5a623',[ex('Deadlift',4,'4–6','150s','Full Posterior'),ex('T-Bar Row',4,'8–10','90s','Back'),ex('Bulgarian Split Squat',3,'10 each','90s','Legs'),ex('Hip Thrust',3,'12–15','75s','Glutes'),ex('Hammer Curls',3,'10–12','60s','Biceps'),ex('Face Pulls',3,'15–20','45s','Rear Delts')]),
    REST('Sun'),
  ]},
  cut: { freq:'4 days strength + 3 cardio', split:'Full Body + Cardio', schedule:[
    make('Mon','Full Body A','strength','#f54b5e',[ex('Barbell Squat',3,'8–10','90s','Legs'),ex('Bench Press',3,'8–10','90s','Chest'),ex('Barbell Row',3,'8–10','90s','Back'),ex('OHP',3,'8–10','90s','Shoulders'),ex('Pull-ups',3,'Max','90s','Back'),ex('Plank',3,'45s','30s','Core')]),
    make('Tue','LISS Cardio','cardio','#f54b5e',[ex('Incline Treadmill Walk',1,'45 min @ 5-6km/h','—','Fat Burn'),ex('Core Circuit',3,'Crunches 20 / Leg Raises 15 / Twist 20','30s','Core')]),
    make('Wed','Full Body B','strength','#f54b5e',[ex('Romanian Deadlift',3,'10–12','90s','Hamstrings'),ex('Incline DB Press',3,'10–12','75s','Chest'),ex('Cable Row',3,'10–12','75s','Back'),ex('Lateral Raises',3,'15','45s','Shoulders'),ex('Goblet Squat',3,'12–15','60s','Legs'),ex('Hanging Knee Raises',3,'15–20','45s','Core')]),
    make('Thu','HIIT','cardio','#f54b5e',[ex('Bike/Run Sprints',8,'30s max / 90s easy','—','Cardio'),ex('Burpees',3,'15','45s','Full Body'),ex('Jump Rope',4,'2 min','45s','Full Body')]),
    make('Fri','Full Body C','strength','#f54b5e',[ex('Deadlift',3,'6–8','120s','Full Body'),ex('Push-ups',4,'15–20','45s','Chest'),ex('Lat Pulldown',3,'10–12','75s','Back'),ex('Bulgarian Split Squat',3,'10 each','90s','Legs'),ex('DB Shoulder Press',3,'12','75s','Shoulders'),ex('Ab Circuit',3,'3 exercises × 15 reps','30s','Core')]),
    make('Sat','LISS + Stretch','cardio','#f54b5e',[ex('Outdoor Run / Cycle',1,'40–60 min easy','—','Endurance/Fat Burn'),ex('Full Body Stretch',1,'15 min','—','Mobility')]),
    REST('Sun'),
  ]},
  athletic: { freq:'5 days/week', split:'Power + Speed + Conditioning', schedule:[
    make('Mon','Power & Strength','strength','#3de8f5',[ex('Power Clean',5,'3–4','150s','Full Body Power'),ex('Barbell Squat',4,'4–6','120s','Legs'),ex('Push Press',4,'4–6','120s','Shoulders/Triceps'),ex('Pull-ups',4,'6–8','90s','Back'),ex('Box Jumps',4,'5 explosive','90s','Explosive Power')]),
    make('Tue','Speed & Agility','cardio','#3de8f5',[ex('Sprint Drills (A/B skips)',4,'20m × 2','60s','Sprint Mechanics'),ex('100m Sprints',6,'@ 90% effort','3 min','Speed'),ex('Agility Ladder',4,'4 patterns','60s','Agility'),ex('T-Cone Drills',5,'@ max speed','90s','Change of Direction'),ex('Med Ball Slams',3,'8 explosive','60s','Rotational Power')]),
    make('Wed','Active Recovery','recovery','#3de8f5',[ex('Swim / Easy Cycle',1,'30–40 min','—','Active Recovery'),ex('Mobility Flow',1,'20 min','—','Mobility'),ex('Yoga / Deep Stretch',1,'20 min','—','Flexibility')]),
    make('Thu','Strength Endurance','strength','#3de8f5',[ex('Deadlift',4,'5–6','120s','Posterior Chain'),ex('Farmer Carries',4,'30m walk','90s','Full Body Stability'),ex('Sled Push',5,'20m','90s','Legs/Conditioning'),ex('Barbell Row',3,'8','90s','Back'),ex('TRX Rows',3,'12–15','60s','Back/Biceps'),ex('Pallof Press',3,'10 each side','45s','Core Anti-rotation')]),
    make('Fri','Plyometrics','strength','#3de8f5',[ex('Depth Jumps',4,'5 reps','90s','Reactive Strength'),ex('Broad Jumps',4,'5 max distance','90s','Power'),ex('Lateral Bounds',4,'6 each side','60s','Lateral Power'),ex('Single-leg Box Jump',3,'5 each','90s','Unilateral Power'),ex('Band-Resisted Sprint',6,'20m','2 min','Drive Phase')]),
    make('Sat','Sport Conditioning','cardio','#3de8f5',[ex('Shuttle Runs',8,'5–10–5 pattern','2 min','Conditioning'),ex('400m Repeats',4,'@ 85% effort','3 min','Aerobic Power'),ex('Cool Down Run',1,'10 min easy','—','Recovery')]),
    REST('Sun'),
  ]},
  daily: { freq:'3–4 days/week + daily activity', split:'Full Body + Active Days', schedule:[
    make('Mon','Full Body Strength','strength','#6dde7b',[ex('Goblet Squat',3,'12–15','60s','Legs'),ex('DB Push Press',3,'10–12','60s','Shoulders'),ex('DB Row',3,'10–12 each','60s','Back'),ex('DB Romanian Deadlift',3,'12–15','60s','Hamstrings'),ex('Push-ups',3,'10–15','45s','Chest'),ex('Plank',3,'30–45s','30s','Core')]),
    make('Tue','Cardio & Mobility','cardio','#6dde7b',[ex('Brisk Walk / Light Jog',1,'30 min','—','Cardio'),ex('Hip Flexor Stretch',2,'45s each','—','Hips'),ex('Cat-Cow / Thoracic Rotation',2,'10 each','—','Spine'),ex('Hamstring & Quad Stretch',2,'45s each','—','Legs')]),
    make('Wed','Full Body Circuit','strength','#6dde7b',[ex('KB Swings',4,'15','45s','Full Body'),ex('Step-ups',3,'12 each','45s','Legs'),ex('Band Pull-Aparts',3,'20','30s','Upper Back'),ex('DB Curl to Press',3,'10–12','45s','Full Body'),ex('Reverse Lunges',3,'10 each','45s','Legs'),ex('Dead Bug',3,'8 each side','30s','Core Stability')]),
    REST('Thu'),
    make('Fri','Strength + Core','strength','#6dde7b',[ex('Squat Variation',3,'12','60s','Legs'),ex('Pull-ups or Lat Pulldown',3,'8–12','75s','Back'),ex('DB Chest Press',3,'12','60s','Chest'),ex('Side Plank',3,'30s each','30s','Core'),ex('Resistance Band Walks',3,'15 each way','30s','Glutes/Hips'),ex('Bird Dog',3,'10 each side','30s','Core Stability')]),
    make('Sat','Outdoor Activity','cardio','#6dde7b',[ex('Hike / Cycle / Swim / Sports',1,'45–90 min (your choice)','—','Enjoyable Activity')]),
    REST('Sun'),
  ]},
  strength: { freq:'4 days/week', split:'Upper/Lower Powerlifting Style', schedule:[
    make('Mon','Upper — Max Effort','strength','#b36aff',[ex('Bench Press (heavy 5)',5,'5,5,5,3,1','180s','Chest'),ex('Weighted Pull-ups',4,'5–6','150s','Back'),ex('DB Overhead Press',4,'6–8','120s','Shoulders'),ex('Barbell Row',4,'5–6','120s','Back'),ex('Tricep Work',3,'8–10','90s','Triceps'),ex('Bicep Work',3,'8–10','90s','Biceps')]),
    make('Tue','Lower — Max Effort','strength','#b36aff',[ex('Barbell Squat (heavy 5)',5,'5,5,5,3,1','180s','Quads/Glutes'),ex('Romanian Deadlift',4,'6–8','120s','Hamstrings'),ex('Leg Press',3,'8–12','90s','Quads'),ex('Leg Curl',3,'10–12','90s','Hamstrings'),ex('Calf Raises',4,'10–15','60s','Calves'),ex('Core Work',3,'10–15','60s','Core')]),
    REST('Wed'),
    make('Thu','Upper — Volume','strength','#b36aff',[ex('Close-Grip Bench',4,'8–10','90s','Triceps/Chest'),ex('DB Row',4,'8–10 each','90s','Back'),ex('Incline DB Press',3,'10–12','75s','Upper Chest'),ex('Lat Pulldown',3,'10–12','75s','Lats'),ex('Lateral Raises',4,'12–15','60s','Shoulders'),ex('Face Pulls',4,'15–20','45s','Rear Delts')]),
    make('Fri','Lower — Volume + DL','strength','#b36aff',[ex('Deadlift (heavy 3)',5,'5,5,3,3,1','180s','Full Posterior'),ex('Front Squat',3,'6–8','120s','Quads'),ex('Bulgarian Split Squat',3,'8–10 each','90s','Legs'),ex('Hip Thrust',3,'10–15','75s','Glutes'),ex('Ab Rollout',3,'10–12','60s','Core')]),
    make('Sat','Active Recovery','recovery','#b36aff',[ex('Light Walk / Swim',1,'30 min','—','Recovery'),ex('Mobility Work',1,'20 min','—','Flexibility')]),
    REST('Sun'),
  ]},
};

const QUOTES = [
  { q:"The body achieves what the mind believes.", a:"Napoleon Hill" },
  { q:"You don't have to be extreme. Just consistent.", a:"Unknown" },
  { q:"Pain is temporary. Quitting lasts forever.", a:"Lance Armstrong" },
  { q:"Strength doesn't come from what you can do — it comes from overcoming what you couldn't.", a:"Rikki Rogers" },
  { q:"The only bad workout is the one that didn't happen.", a:"Unknown" },
  { q:"Take care of your body. It's the only place you have to live.", a:"Jim Rohn" },
];

const TODO = [
  { id:1, cat:'Tracking',      pri:'high',   icon:Activity, title:'Wearable Integration',      desc:'Sync with Apple Watch, Garmin & Fitbit for automatic HR, steps and sleep data.', status:'planned' },
  { id:2, cat:'AI',            pri:'high',   icon:Cpu,      title:'AI Form Analyzer',           desc:'Upload a workout clip → Claude analyzes your form and gives real-time corrections.', status:'planned' },
  { id:3, cat:'Nutrition',     pri:'high',   icon:Camera,   title:'Meal Scanner',               desc:'Camera-based food recognition — auto-calculate macros and calories per meal.', status:'planned' },
  { id:4, cat:'Body',          pri:'high',   icon:Scale,    title:'Body Composition Tracker',   desc:'Log chest/waist/hips/arms/thighs measurements and visualize change over time.', status:'in-progress' },
  { id:5, cat:'AI',            pri:'high',   icon:Sparkles, title:'Adaptive Training AI',       desc:'AI adjusts weights/reps based on your performance trends and daily recovery score.', status:'in-progress' },
  { id:6, cat:'Nutrition',     pri:'medium', icon:ShoppingCart,title:'Grocery List Generator', desc:'Auto-generate weekly shopping lists based on your goal meal plan and macro targets.', status:'planned' },
  { id:7, cat:'Recovery',      pri:'medium', icon:Moon,     title:'Sleep Quality Score',        desc:'Track sleep and adjust workout intensity based on your daily recovery status.', status:'planned' },
  { id:8, cat:'Social',        pri:'medium', icon:Users,    title:'Training Partner Match',     desc:'Match with workout buddies nearby who share similar goals and schedules.', status:'planned' },
  { id:9, cat:'Analytics',     pri:'high',   icon:Camera,   title:'Progress Photos',            desc:'Encrypted photo storage with side-by-side comparison slider and timeline.', status:'planned' },
  { id:10,cat:'Gamification',  pri:'low',    icon:Trophy,   title:'Achievements & Streaks',     desc:'Unlock badges for consistency, PRs, milestones and fitness goals.', status:'planned' },
  { id:11,cat:'AI',            pri:'medium', icon:Cpu,      title:'Chat Your Coach',            desc:'Claude-powered AI coach — ask anything, adjust your plan, get personalized advice.', status:'in-progress' },
  { id:12,cat:'Tracking',      pri:'medium', icon:BarChart2,title:'1RM & PR Tracker',           desc:'Track personal records for every lift and visualize strength gains over time.', status:'planned' },
];

const C = { accent:'#c2f53e', bg:'#060610', surface:'#0e0e1c', card:'#13132a', border:'rgba(255,255,255,.07)', muted:'rgba(236,237,248,.45)', text:'#ecedf8' };

// ─── TINY COMPONENTS ─────────────────────────────────────────
const Tag = ({ children, color='#c2f53e', bg }) => (
  <span style={{ display:'inline-flex',alignItems:'center',padding:'3px 10px',borderRadius:100,background:bg||`${color}18`,color,fontSize:11,fontWeight:700,letterSpacing:.6,textTransform:'uppercase' }}>{children}</span>
);
const Pill = ({ label, active, color, onClick }) => (
  <button onClick={onClick} style={{ padding:'7px 16px',borderRadius:100,border:`1.5px solid ${active?color:'rgba(255,255,255,.08)'}`,background:active?`${color}18`:'transparent',color:active?color:C.muted,fontSize:13,fontWeight:600,transition:'all .2s',whiteSpace:'nowrap' }}>{label}</button>
);
const StatCard = ({ label, value, sub, color='#c2f53e', icon: Icon }) => (
  <div style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:18,flex:1,minWidth:0 }}>
    <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8 }}>
      <span style={{ fontSize:12,color:C.muted,fontWeight:500 }}>{label}</span>
      {Icon && <Icon size={16} color={color} />}
    </div>
    <div className="condensed" style={{ fontSize:30,fontWeight:800,color }}>{value}</div>
    {sub && <div style={{ fontSize:12,color:C.muted,marginTop:3 }}>{sub}</div>}
  </div>
);
const SectionHead = ({ title, subtitle }) => (
  <div style={{ marginBottom:20 }}>
    <h2 className="condensed" style={{ fontSize:28,fontWeight:800,letterSpacing:.5 }}>{title}</h2>
    {subtitle && <p style={{ color:C.muted,fontSize:14,marginTop:4 }}>{subtitle}</p>}
  </div>
);

// ─── CUSTOM TOOLTIP ──────────────────────────────────────────
const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:'#1a1a30',border:`1px solid ${C.border}`,borderRadius:10,padding:'10px 14px',fontFamily:'Outfit,sans-serif' }}>
      <div style={{ fontSize:12,color:C.muted,marginBottom:4 }}>{label}</div>
      {payload.map((p,i) => <div key={i} style={{ fontSize:14,fontWeight:600,color:p.color||C.accent }}>{p.name}: {p.value}</div>)}
    </div>
  );
};

// ─── GOAL SELECTOR ───────────────────────────────────────────
const GoalSelector = ({ onSelect }) => {
  const [sel, setSel] = useState(null);
  const [step, setStep] = useState(0); // 0=pick, 1=confirm
  const g = GOALS.find(x=>x.id===sel);
  return (
    <div style={{ minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'flex-start',padding:'48px 20px 40px',maxWidth:680,margin:'0 auto' }}>
      {step===0 ? (
        <>
          <div className="fu" style={{ textAlign:'center',marginBottom:40 }}>
            <div style={{ fontSize:13,fontWeight:700,color:C.accent,letterSpacing:2,textTransform:'uppercase',marginBottom:12 }}>FitForge</div>
            <h1 className="condensed" style={{ fontSize:52,fontWeight:900,lineHeight:1.0,marginBottom:14 }}>CHOOSE YOUR<br /><span style={{ color:C.accent }}>GOAL</span></h1>
            <p style={{ color:C.muted,fontSize:16,maxWidth:400,margin:'0 auto' }}>Your entire program — workouts, nutrition, and tracking — adapts to what you're chasing.</p>
          </div>
          <div className="fu1" style={{ display:'grid',gridTemplateColumns:'repeat(2, 1fr)',gap:12,width:'100%' }}>
            {GOALS.map(g => (
              <div key={g.id} onClick={()=>setSel(g.id)}
                style={{ background:sel===g.id?g.bg:C.card,border:`1.5px solid ${sel===g.id?g.color:C.border}`,borderRadius:20,padding:'22px 20px',cursor:'pointer',transition:'all .25s cubic-bezier(.4,0,.2,1)',transform:sel===g.id?'translateY(-3px)':'none',boxShadow:sel===g.id?`0 8px 32px ${g.color}20`:'none' }}>
                <div style={{ fontSize:28,marginBottom:10 }}>{g.emoji}</div>
                <div className="condensed" style={{ fontSize:22,fontWeight:800,color:sel===g.id?g.color:C.text,marginBottom:4 }}>{g.name}</div>
                <div style={{ fontSize:13,color:C.muted,lineHeight:1.4 }}>{g.sub}</div>
              </div>
            ))}
          </div>
          {sel && (
            <div className="fu" style={{ marginTop:24,width:'100%' }}>
              <button onClick={()=>setStep(1)} style={{ width:'100%',padding:'16px',background:GOALS.find(x=>x.id===sel)?.color,color:'#060610',borderRadius:14,fontSize:17,fontWeight:700,transition:'all .2s' }}>
                Continue with {GOALS.find(x=>x.id===sel)?.name} →
              </button>
            </div>
          )}
        </>
      ) : (
        <>
          <button onClick={()=>setStep(0)} style={{ alignSelf:'flex-start',background:'transparent',color:C.muted,fontSize:14,marginBottom:24,display:'flex',alignItems:'center',gap:6 }}>← Back</button>
          <div className="fu" style={{ width:'100%',background:`linear-gradient(135deg, ${g.bg}, ${C.card})`,border:`1.5px solid ${g.color}40`,borderRadius:24,padding:28,marginBottom:24 }}>
            <div style={{ fontSize:40,marginBottom:12 }}>{g.emoji}</div>
            <h2 className="condensed" style={{ fontSize:36,fontWeight:900,color:g.color,marginBottom:6 }}>{g.name}</h2>
            <p style={{ color:C.muted,fontSize:15,lineHeight:1.5,marginBottom:24 }}>{g.desc}</p>
            <div style={{ display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:12 }}>
              {[['Calories',g.calories],['Protein',g.protein],['Carbs',g.carbs],['Fats',g.fats]].map(([k,v])=>(
                <div key={k} style={{ background:'rgba(0,0,0,.25)',borderRadius:12,padding:'12px 14px' }}>
                  <div style={{ fontSize:11,color:C.muted,fontWeight:600,letterSpacing:.5,textTransform:'uppercase',marginBottom:4 }}>{k}</div>
                  <div style={{ fontSize:16,fontWeight:700,color:g.color }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="fu1" style={{ width:'100%',background:C.card,border:`1px solid ${C.border}`,borderRadius:20,padding:24,marginBottom:24 }}>
            <div style={{ fontSize:14,fontWeight:700,color:C.text,marginBottom:14 }}>KEY PRINCIPLES</div>
            {GOAL_TIPS[g.id].map((t,i)=>(
              <div key={i} style={{ display:'flex',alignItems:'flex-start',gap:10,marginBottom:10 }}>
                <div style={{ width:22,height:22,borderRadius:6,background:`${g.color}20`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:1 }}>
                  <Check size={12} color={g.color} />
                </div>
                <span style={{ fontSize:14,color:C.muted,lineHeight:1.4 }}>{t}</span>
              </div>
            ))}
          </div>
          <button onClick={()=>onSelect(sel)} style={{ width:'100%',padding:'17px',background:g.color,color:'#060610',borderRadius:14,fontSize:18,fontWeight:800,letterSpacing:.5 }}>
            🚀 Start {g.name} Program
          </button>
        </>
      )}
    </div>
  );
};

// ─── DASHBOARD ───────────────────────────────────────────────
const Dashboard = ({ goal, logs, streak, completedToday, onNavigate }) => {
  const g = GOALS.find(x=>x.id===goal);
  const plan = PLANS[goal];
  const todayIdx = new Date().getDay(); // 0=Sun → map Mon=1 to Mon
  const schedule = plan?.schedule || [];
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const todayName = days[todayIdx];
  const todayWorkout = schedule.find(s=>s.day===todayName) || schedule[0];
  const quote = QUOTES[Math.floor(Date.now()/86400000) % QUOTES.length];
  const recentWeights = logs.slice(-7);
  const weightData = recentWeights.map((l,i)=>({ name:l.date?.slice(5)||`D${i+1}`, kg:l.weight }));

  return (
    <div style={{ padding:'24px 16px 100px' }}>
      <div className="fu" style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24 }}>
        <div>
          <div style={{ fontSize:13,color:C.muted,fontWeight:500 }}>TODAY</div>
          <h1 className="condensed" style={{ fontSize:32,fontWeight:900 }}>DASHBOARD</h1>
        </div>
        <div style={{ background:g.bg,border:`1px solid ${g.color}40`,borderRadius:12,padding:'8px 14px',display:'flex',alignItems:'center',gap:8 }}>
          <span style={{ fontSize:18 }}>{g.emoji}</span>
          <span style={{ fontSize:14,fontWeight:700,color:g.color }}>{g.name}</span>
        </div>
      </div>

      {/* Stats row */}
      <div className="fu1" style={{ display:'flex',gap:10,marginBottom:16 }}>
        <StatCard label="STREAK" value={`${streak}d`} sub="consecutive days" color={C.accent} icon={Flame} />
        <StatCard label="WORKOUTS" value={logs.length} sub="sessions logged" color="#3de8f5" icon={Dumbbell} />
        <StatCard label="WEEK" value={`${completedToday}/7`} sub="this week" color="#f5a623" icon={Trophy} />
      </div>

      {/* Today's workout */}
      <div className="fu2" style={{ background:C.card,border:`1.5px solid ${todayWorkout?.color||C.accent}30`,borderRadius:20,padding:22,marginBottom:16 }}>
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16 }}>
          <div>
            <Tag color={todayWorkout?.color||C.accent}>{todayWorkout?.type?.toUpperCase()||'REST'}</Tag>
            <h3 className="condensed" style={{ fontSize:24,fontWeight:800,marginTop:8 }}>{todayWorkout?.label||'Rest Day'}</h3>
            <p style={{ color:C.muted,fontSize:13,marginTop:3 }}>{todayWorkout?.exercises?.length||0} exercises · {todayName}</p>
          </div>
          <div style={{ width:52,height:52,borderRadius:14,background:`${todayWorkout?.color||C.accent}18`,display:'flex',alignItems:'center',justifyContent:'center' }}>
            <Dumbbell size={24} color={todayWorkout?.color||C.accent} />
          </div>
        </div>
        {todayWorkout?.exercises?.slice(0,3).map((e,i)=>(
          <div key={i} style={{ display:'flex',justifyContent:'space-between',padding:'10px 0',borderTop:`1px solid ${C.border}`,fontSize:14 }}>
            <span style={{ fontWeight:600 }}>{e.name}</span>
            <span style={{ color:C.muted }}>{e.sets}×{e.reps}</span>
          </div>
        ))}
        {(todayWorkout?.exercises?.length||0) > 3 && <p style={{ color:C.muted,fontSize:13,marginTop:8 }}>+{(todayWorkout.exercises.length-3)} more exercises</p>}
        <button onClick={()=>onNavigate('workout')} style={{ marginTop:16,width:'100%',padding:'13px',background:`${todayWorkout?.color||C.accent}18`,border:`1px solid ${todayWorkout?.color||C.accent}40`,color:todayWorkout?.color||C.accent,borderRadius:12,fontSize:15,fontWeight:700 }}>
          View Full Workout →
        </button>
      </div>

      {/* Weight chart */}
      {weightData.length >= 2 && (
        <div className="fu3" style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:20,padding:22,marginBottom:16 }}>
          <div style={{ fontSize:14,fontWeight:700,marginBottom:16,display:'flex',alignItems:'center',gap:8 }}>
            <Scale size={16} color={C.accent} /> Weight Trend
          </div>
          <ResponsiveContainer width="100%" height={120}>
            <AreaChart data={weightData}>
              <defs><linearGradient id="wg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.accent} stopOpacity={0.25}/><stop offset="100%" stopColor={C.accent} stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="2 4" stroke={C.border} vertical={false}/>
              <XAxis dataKey="name" tick={{fill:C.muted,fontSize:11}} axisLine={false} tickLine={false}/>
              <YAxis domain={['auto','auto']} tick={{fill:C.muted,fontSize:11}} axisLine={false} tickLine={false} width={35}/>
              <Tooltip content={<ChartTip />}/>
              <Area type="monotone" dataKey="kg" name="Weight" stroke={C.accent} strokeWidth={2} fill="url(#wg)"/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Quote */}
      <div className="fu4" style={{ background:`linear-gradient(135deg, ${g.bg}, rgba(0,0,0,.2))`,border:`1px solid ${g.color}30`,borderRadius:20,padding:22 }}>
        <div style={{ fontSize:11,color:g.color,fontWeight:700,letterSpacing:1,textTransform:'uppercase',marginBottom:10 }}>Daily Motivation</div>
        <p className="condensed" style={{ fontSize:20,fontWeight:700,lineHeight:1.3,marginBottom:8 }}>"{quote.q}"</p>
        <p style={{ fontSize:13,color:C.muted }}>— {quote.a}</p>
      </div>
    </div>
  );
};

// ─── WORKOUT ─────────────────────────────────────────────────
const WorkoutPage = ({ goal }) => {
  const [selDay, setSelDay] = useState(0);
  const [checked, setChecked] = useState({});
  const [expanded, setExpanded] = useState(null);
  const plan = PLANS[goal];
  const g = GOALS.find(x=>x.id===goal);
  const day = plan.schedule[selDay];
  const toggle = (name) => setChecked(p=>({...p,[name]:!p[name]}));
  const done = day.exercises.filter(e=>checked[`${selDay}-${e.name}`]).length;
  const total = day.exercises.length;
  const pct = total ? Math.round(done/total*100) : 0;

  return (
    <div style={{ padding:'24px 16px 100px' }}>
      <div className="fu" style={{ marginBottom:20 }}>
        <SectionHead title="WORKOUT PLAN" subtitle={`${plan.freq} · ${plan.split}`} />
      </div>

      {/* Day picker */}
      <div className="fu1" style={{ display:'flex',gap:8,overflowX:'auto',paddingBottom:4,marginBottom:20,scrollbarWidth:'none' }}>
        {plan.schedule.map((d,i)=>(
          <Pill key={i} label={d.day} active={selDay===i} color={d.color||g.color} onClick={()=>setSelDay(i)} />
        ))}
      </div>

      {/* Day header */}
      <div className="fu2" style={{ background:`linear-gradient(135deg, ${day.color||g.color}12, ${C.card})`,border:`1.5px solid ${day.color||g.color}30`,borderRadius:20,padding:22,marginBottom:16 }}>
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between' }}>
          <div>
            <Tag color={day.color||g.color}>{day.type?.toUpperCase()}</Tag>
            <h2 className="condensed" style={{ fontSize:26,fontWeight:900,marginTop:8,color:day.type==='rest'?C.muted:C.text }}>{day.label}</h2>
            {total > 0 && <p style={{ color:C.muted,fontSize:13,marginTop:3 }}>{done}/{total} exercises complete</p>}
          </div>
          {total > 0 && (
            <div style={{ position:'relative',width:54,height:54 }}>
              <svg width="54" height="54" style={{ transform:'rotate(-90deg)' }}>
                <circle cx="27" cy="27" r="22" fill="none" stroke={C.border} strokeWidth="4"/>
                <circle cx="27" cy="27" r="22" fill="none" stroke={day.color||g.color} strokeWidth="4" strokeDasharray={`${pct*1.38} 138`} strokeLinecap="round"/>
              </svg>
              <div style={{ position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:800,color:day.color||g.color }}>{pct}%</div>
            </div>
          )}
        </div>
        {total > 0 && (
          <div style={{ marginTop:16 }}>
            <div style={{ background:'rgba(255,255,255,.08)',borderRadius:100,height:5,overflow:'hidden' }}>
              <div style={{ height:'100%',width:`${pct}%`,background:day.color||g.color,borderRadius:100,transition:'width .5s cubic-bezier(.4,0,.2,1)' }}/>
            </div>
          </div>
        )}
      </div>

      {/* Exercises */}
      {day.type === 'rest' ? (
        <div style={{ textAlign:'center',padding:'48px 20px',color:C.muted }}>
          <div style={{ fontSize:48,marginBottom:12 }}>😴</div>
          <div className="condensed" style={{ fontSize:22,fontWeight:700,marginBottom:8 }}>Rest Day</div>
          <p style={{ fontSize:14,lineHeight:1.5 }}>Recovery is where growth happens.<br/>Sleep, hydrate, eat well.</p>
        </div>
      ) : (
        <div style={{ display:'flex',flexDirection:'column',gap:8 }}>
          {day.exercises.map((e,i)=>{
            const key=`${selDay}-${e.name}`;
            const isChecked=!!checked[key];
            const isOpen=expanded===key;
            return (
              <div key={i} className="fu" style={{ background:isChecked?`${day.color||g.color}10`:C.card,border:`1px solid ${isChecked?`${day.color||g.color}50`:C.border}`,borderRadius:16,overflow:'hidden',transition:'all .2s',animationDelay:`${i*.04}s` }}>
                <div style={{ display:'flex',alignItems:'center',gap:12,padding:'14px 16px',cursor:'pointer' }} onClick={()=>setExpanded(isOpen?null:key)}>
                  <div onClick={ev=>{ev.stopPropagation();toggle(key)}} style={{ width:24,height:24,borderRadius:7,border:`1.5px solid ${isChecked?day.color||g.color:'rgba(255,255,255,.2)'}`,background:isChecked?day.color||g.color:'transparent',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,transition:'all .2s' }}>
                    {isChecked && <Check size={13} color="#060610" strokeWidth={3}/>}
                  </div>
                  <div style={{ flex:1,minWidth:0 }}>
                    <div style={{ fontWeight:600,fontSize:15,textDecoration:isChecked?'line-through':'none',color:isChecked?C.muted:C.text }}>{e.name}</div>
                    <div style={{ fontSize:12,color:C.muted,marginTop:2 }}>{e.muscle}</div>
                  </div>
                  <div style={{ display:'flex',alignItems:'center',gap:10 }}>
                    <div style={{ textAlign:'right' }}>
                      <div style={{ fontSize:14,fontWeight:700,color:day.color||g.color }}>{e.sets}×{e.reps}</div>
                      <div style={{ fontSize:11,color:C.muted }}>Rest {e.rest}</div>
                    </div>
                    {isOpen ? <ChevronUp size={16} color={C.muted}/> : <ChevronDown size={16} color={C.muted}/>}
                  </div>
                </div>
                {isOpen && (
                  <div style={{ padding:'0 16px 14px 52px',borderTop:`1px solid ${C.border}` }}>
                    <div style={{ display:'flex',flexWrap:'wrap',gap:8,marginTop:12 }}>
                      {[['Sets',e.sets],['Reps',e.reps],['Rest',e.rest],['Muscle',e.muscle]].map(([k,v])=>(
                        <div key={k} style={{ background:'rgba(255,255,255,.05)',borderRadius:8,padding:'6px 12px',fontSize:12 }}>
                          <span style={{ color:C.muted }}>{k}: </span><span style={{ fontWeight:600 }}>{v}</span>
                        </div>
                      ))}
                    </div>
                    {e.note && <div style={{ marginTop:10,fontSize:13,color:C.accent,display:'flex',gap:6,alignItems:'flex-start' }}><Info size={14} style={{flexShrink:0,marginTop:1}}/>{e.note}</div>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── LOG ─────────────────────────────────────────────────────
const LogPage = ({ logs, onAddLog }) => {
  const [weight, setWeight] = useState('');
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(false);

  const save = () => {
    if (!weight && !note) return;
    const entry = { date: new Date().toISOString().slice(0,10), weight: parseFloat(weight)||null, note, ts: Date.now() };
    onAddLog(entry);
    setWeight(''); setNote('');
    setSaved(true); setTimeout(()=>setSaved(false), 2000);
  };

  return (
    <div style={{ padding:'24px 16px 100px' }}>
      <div className="fu"><SectionHead title="LOG ENTRY" subtitle="Track your weight and session notes" /></div>

      <div className="fu1" style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:20,padding:22,marginBottom:20 }}>
        <div style={{ marginBottom:14 }}>
          <label style={{ fontSize:13,fontWeight:600,color:C.muted,display:'block',marginBottom:8 }}>BODY WEIGHT (kg)</label>
          <input type="number" placeholder="e.g. 74.5" value={weight} onChange={e=>setWeight(e.target.value)} />
        </div>
        <div style={{ marginBottom:20 }}>
          <label style={{ fontSize:13,fontWeight:600,color:C.muted,display:'block',marginBottom:8 }}>SESSION NOTES</label>
          <textarea placeholder="How was the workout? Energy level, PRs, how you felt..." value={note} onChange={e=>setNote(e.target.value)} rows={3} style={{ resize:'vertical',lineHeight:1.5 }} />
        </div>
        <button onClick={save} style={{ width:'100%',padding:'14px',background:saved?'#1a3a0a':C.accent,color:saved?C.accent:'#060610',borderRadius:12,fontSize:16,fontWeight:700,transition:'all .3s',display:'flex',alignItems:'center',justifyContent:'center',gap:8 }}>
          {saved ? <><Check size={18}/> Saved!</> : <><Plus size={18}/> Add Log Entry</>}
        </button>
      </div>

      <div className="fu2">
        <div style={{ fontSize:14,fontWeight:700,color:C.muted,marginBottom:12,letterSpacing:.5 }}>RECENT ENTRIES — {logs.length} total</div>
        {logs.length === 0 ? (
          <div style={{ textAlign:'center',padding:'40px',color:C.muted }}>
            <Scale size={32} style={{ margin:'0 auto 12px',display:'block',opacity:.4 }}/>
            <p>No entries yet. Log your first session above.</p>
          </div>
        ) : (
          <div style={{ display:'flex',flexDirection:'column',gap:8 }}>
            {[...logs].reverse().map((l,i)=>(
              <div key={l.ts||i} style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:'14px 16px',display:'flex',gap:14,alignItems:'flex-start' }}>
                <div style={{ width:42,height:42,borderRadius:10,background:`${C.accent}14`,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                  <div style={{ fontSize:14,fontWeight:800,color:C.accent,lineHeight:1 }}>{l.date?.slice(8)||'—'}</div>
                  <div style={{ fontSize:10,color:C.muted,textTransform:'uppercase' }}>{['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][parseInt(l.date?.slice(5,7)||1)-1]}</div>
                </div>
                <div style={{ flex:1,minWidth:0 }}>
                  {l.weight && <div style={{ fontWeight:700,fontSize:16,color:C.accent }}>{l.weight} kg</div>}
                  {l.note && <div style={{ fontSize:13,color:C.muted,marginTop:3,lineHeight:1.4 }}>{l.note}</div>}
                  {!l.weight && !l.note && <div style={{ color:C.muted,fontSize:13 }}>No data recorded</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── PROGRESS ────────────────────────────────────────────────
const ProgressPage = ({ logs, goal }) => {
  const g = GOALS.find(x=>x.id===goal);
  const weightLogs = logs.filter(l=>l.weight);
  const weightData = weightLogs.map((l,i)=>({ name:l.date?.slice(5)||`W${i+1}`, kg: l.weight }));

  const demoData = [
    { name:'W1', kg:80 },{ name:'W2', kg:79.3 },{ name:'W3', kg:79.1 },{ name:'W4', kg:78.5 },
    { name:'W5', kg:78.8 },{ name:'W6', kg:78.1 },{ name:'W7', kg:77.6 },{ name:'W8', kg:77.0 },
  ];
  const chartData = weightData.length >= 2 ? weightData : demoData;
  const isDemo = weightData.length < 2;

  const activityDemo = [
    { name:'Mon',v:1},{ name:'Tue',v:1},{ name:'Wed',v:0},{ name:'Thu',v:1},{ name:'Fri',v:1},{ name:'Sat',v:0},{ name:'Sun',v:1}
  ];

  const startW = chartData[0]?.kg||0;
  const latestW = chartData[chartData.length-1]?.kg||0;
  const diff = (latestW-startW).toFixed(1);

  return (
    <div style={{ padding:'24px 16px 100px' }}>
      <div className="fu"><SectionHead title="PROGRESS" subtitle="Track your transformation over time" /></div>

      <div className="fu1" style={{ display:'flex',gap:10,marginBottom:20 }}>
        <StatCard label="START" value={`${startW}kg`} sub="baseline" color={C.muted} icon={Scale} />
        <StatCard label="CURRENT" value={`${latestW}kg`} sub="latest entry" color={C.accent} icon={Scale} />
        <StatCard label="CHANGE" value={`${diff>0?'+':''}${diff}kg`} sub="total" color={parseFloat(diff)<0?'#6dde7b':'#f54b5e'} icon={TrendingUp} />
      </div>

      {isDemo && (
        <div style={{ background:'rgba(194,245,62,.06)',border:'1px solid rgba(194,245,62,.2)',borderRadius:12,padding:'10px 14px',marginBottom:16,fontSize:13,color:C.accent,display:'flex',gap:8 }}>
          <Info size={14} style={{flexShrink:0,marginTop:1}}/> Demo data shown. Log weight entries to see your real progress.
        </div>
      )}

      <div className="fu2" style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:20,padding:22,marginBottom:16 }}>
        <div style={{ fontSize:14,fontWeight:700,marginBottom:18,display:'flex',alignItems:'center',gap:8 }}>
          <TrendingUp size={16} color={C.accent}/> Weight Over Time
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={chartData}>
            <defs><linearGradient id="wg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={g.color} stopOpacity={.3}/><stop offset="100%" stopColor={g.color} stopOpacity={0}/></linearGradient></defs>
            <CartesianGrid strokeDasharray="3 6" stroke={C.border} vertical={false}/>
            <XAxis dataKey="name" tick={{fill:C.muted,fontSize:11}} axisLine={false} tickLine={false}/>
            <YAxis domain={['auto','auto']} tick={{fill:C.muted,fontSize:11}} axisLine={false} tickLine={false} width={38}/>
            <Tooltip content={<ChartTip />}/>
            <Area type="monotone" dataKey="kg" name="Weight" stroke={g.color} strokeWidth={2.5} fill="url(#wg2)" dot={{r:3,fill:g.color,strokeWidth:0}}/>
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="fu3" style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:20,padding:22,marginBottom:16 }}>
        <div style={{ fontSize:14,fontWeight:700,marginBottom:18,display:'flex',alignItems:'center',gap:8 }}>
          <Calendar size={16} color="#f5a623"/> Weekly Activity
        </div>
        <ResponsiveContainer width="100%" height={130}>
          <BarChart data={activityDemo} barSize={28}>
            <XAxis dataKey="name" tick={{fill:C.muted,fontSize:11}} axisLine={false} tickLine={false}/>
            <Tooltip content={({active,payload,label})=>active&&payload?.length?<div style={{background:'#1a1a30',border:`1px solid ${C.border}`,borderRadius:8,padding:'8px 12px',fontSize:13,fontFamily:'Outfit,sans-serif'}}>{label}: {payload[0].value?'✅ Done':'—'}</div>:null}/>
            <Bar dataKey="v" name="Worked out" fill={g.color} radius={[6,6,0,0]} opacity={0.9}/>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Body measurements placeholder */}
      <div className="fu4" style={{ background:C.card,border:`1px dashed rgba(255,255,255,.1)`,borderRadius:20,padding:24,textAlign:'center' }}>
        <Scale size={28} color={C.muted} style={{ margin:'0 auto 12px',display:'block' }}/>
        <div style={{ fontSize:16,fontWeight:700,marginBottom:6 }}>Body Measurements</div>
        <p style={{ fontSize:13,color:C.muted,lineHeight:1.5,marginBottom:14 }}>Track chest, waist, hips, arms and more.<br/>Coming in the next update.</p>
        <Tag color="#f5a623">In Development</Tag>
      </div>
    </div>
  );
};

// ─── NUTRITION ───────────────────────────────────────────────
const NutritionPage = ({ goal }) => {
  const g = GOALS.find(x=>x.id===goal);
  const [bodyweight, setBodyweight] = useState(75);

  const p = Math.round(bodyweight * parseFloat(g.protein));
  const c = Math.round(bodyweight * parseFloat(g.carbs));
  const f = Math.round(bodyweight * parseFloat(g.fats));
  const kcal = Math.round(p*4 + c*4 + f*9);

  const meals = [
    { time:'7:00 AM', name:'Breakfast', focus:'High protein start', items:['3–4 eggs / Greek yogurt','Oats or whole grain toast','Fruit for carbs','Black coffee / green tea'] },
    { time:'10:00 AM', name:'Mid-Morning Snack', focus:'Protein bridge', items:['Protein shake or cottage cheese','Handful of nuts','Piece of fruit'] },
    { time:'1:00 PM', name:'Lunch', focus:'Biggest carb meal', items:['150–200g rice or sweet potato','150–200g chicken breast / fish','Large vegetable serving','Olive oil drizzle'] },
    { time:'4:00 PM', name:'Pre-Workout', focus:'Fuel performance', items:['Banana or rice cakes','30g fast protein (shake)','Creatine 3–5g','Coffee (optional stimulant)'] },
    { time:'7:00 PM', name:'Post-Workout / Dinner', focus:'Recovery window', items:['150g lean protein','Moderate carbs (rice/potato)','Green vegetables','Casein protein or dairy'] },
    { time:'9:30 PM', name:'Evening Snack (optional)', focus:'Overnight recovery', items:['Greek yogurt or cottage cheese','Casein protein shake','Slow-digesting carb if bulking'] },
  ];

  return (
    <div style={{ padding:'24px 16px 100px' }}>
      <div className="fu"><SectionHead title="NUTRITION" subtitle="Your fuel plan for maximum results" /></div>

      {/* Macro calculator */}
      <div className="fu1" style={{ background:C.card,border:`1.5px solid ${g.color}30`,borderRadius:20,padding:22,marginBottom:20 }}>
        <div style={{ fontSize:14,fontWeight:700,marginBottom:14,color:g.color }}>MACRO CALCULATOR</div>
        <div style={{ marginBottom:16 }}>
          <label style={{ fontSize:13,color:C.muted,fontWeight:600,display:'block',marginBottom:8 }}>BODYWEIGHT (kg)</label>
          <input type="number" value={bodyweight} onChange={e=>setBodyweight(Math.max(30,parseFloat(e.target.value)||75))} />
        </div>
        <div style={{ display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:10 }}>
          {[['Calories',`${kcal} kcal`,'#f5a623'],['Protein',`${p}g`,'#3de8f5'],['Carbs',`${c}g`,'#c2f53e'],['Fats',`${f}g`,'#b36aff']].map(([k,v,col])=>(
            <div key={k} style={{ background:`${col}12`,border:`1px solid ${col}25`,borderRadius:12,padding:'14px' }}>
              <div style={{ fontSize:11,color:C.muted,fontWeight:700,letterSpacing:.5,textTransform:'uppercase' }}>{k}</div>
              <div className="condensed" style={{ fontSize:26,fontWeight:900,color:col,marginTop:4 }}>{v}</div>
              <div style={{ fontSize:11,color:C.muted,marginTop:2 }}>{k==='Calories'?g.calories:`${g[k.toLowerCase()]}/kg`}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Macro split bar */}
      <div className="fu2" style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:20,padding:22,marginBottom:20 }}>
        <div style={{ fontSize:14,fontWeight:700,marginBottom:16 }}>Macro Split</div>
        <div style={{ display:'flex',height:12,borderRadius:100,overflow:'hidden',gap:2,marginBottom:12 }}>
          <div style={{ width:`${Math.round(p*4/kcal*100)}%`,background:'#3de8f5',transition:'width .6s' }}/>
          <div style={{ width:`${Math.round(c*4/kcal*100)}%`,background:'#c2f53e',transition:'width .6s' }}/>
          <div style={{ width:`${Math.round(f*9/kcal*100)}%`,background:'#b36aff',transition:'width .6s' }}/>
        </div>
        <div style={{ display:'flex',gap:16 }}>
          {[['Protein',Math.round(p*4/kcal*100),'#3de8f5'],['Carbs',Math.round(c*4/kcal*100),'#c2f53e'],['Fats',Math.round(f*9/kcal*100),'#b36aff']].map(([k,v,col])=>(
            <div key={k} style={{ display:'flex',alignItems:'center',gap:6 }}>
              <div style={{ width:8,height:8,borderRadius:2,background:col }}/>
              <span style={{ fontSize:13,color:C.muted }}>{k} <strong style={{ color:C.text }}>{v}%</strong></span>
            </div>
          ))}
        </div>
      </div>

      {/* Meal plan */}
      <div className="fu3">
        <div style={{ fontSize:14,fontWeight:700,color:C.muted,marginBottom:12,letterSpacing:.5 }}>SAMPLE MEAL TIMING</div>
        <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
          {meals.map((m,i)=>(
            <div key={i} style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:'16px 18px' }}>
              <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10 }}>
                <div>
                  <div style={{ fontWeight:700,fontSize:15 }}>{m.name}</div>
                  <div style={{ fontSize:12,color:C.muted,marginTop:2 }}>{m.focus}</div>
                </div>
                <div style={{ background:`${g.color}14`,borderRadius:8,padding:'4px 10px',fontSize:12,fontWeight:700,color:g.color }}>{m.time}</div>
              </div>
              <div style={{ display:'flex',flexWrap:'wrap',gap:6 }}>
                {m.items.map((item,j)=>(
                  <div key={j} style={{ background:'rgba(255,255,255,.04)',borderRadius:8,padding:'5px 10px',fontSize:12,color:C.muted }}>{item}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── TODO ────────────────────────────────────────────────────
const TodoPage = () => {
  const priColor = { high:'#f54b5e', medium:'#f5a623', low:'#6dde7b' };
  const statusColor = { 'planned':'rgba(255,255,255,.15)', 'in-progress':C.accent };
  const cats = ['All','AI','Tracking','Nutrition','Analytics','Recovery','Social','Gamification'];
  const [active, setActive] = useState('All');
  const filtered = active==='All' ? TODO : TODO.filter(t=>t.cat===active);

  return (
    <div style={{ padding:'24px 16px 100px' }}>
      <div className="fu"><SectionHead title="ROADMAP" subtitle="Features coming to FitForge — vote with feedback" /></div>

      <div className="fu1" style={{ display:'flex',gap:8,overflowX:'auto',paddingBottom:4,marginBottom:20,scrollbarWidth:'none' }}>
        {cats.map(c=>(
          <Pill key={c} label={c} active={active===c} color={C.accent} onClick={()=>setActive(c)} />
        ))}
      </div>

      <div style={{ display:'flex',gap:10,marginBottom:20 }} className="fu2">
        {[['planned','🗓 Planned',TODO.filter(t=>t.status==='planned').length,'rgba(255,255,255,.15)'],['in-progress','⚡ In Progress',TODO.filter(t=>t.status==='in-progress').length,C.accent]].map(([s,l,n,c])=>(
          <div key={s} style={{ flex:1,background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:'14px 16px' }}>
            <div style={{ fontSize:12,color:C.muted,marginBottom:4 }}>{l}</div>
            <div className="condensed" style={{ fontSize:28,fontWeight:800,color:c }}>{n}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
        {filtered.map((item,i)=>{
          const Icon = item.icon;
          return (
            <div key={item.id} className="fu" style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:'16px 18px',animationDelay:`${i*.04}s` }}>
              <div style={{ display:'flex',gap:14,alignItems:'flex-start' }}>
                <div style={{ width:40,height:40,borderRadius:12,background:`${priColor[item.pri]}15`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                  <Icon size={18} color={priColor[item.pri]} />
                </div>
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:4,flexWrap:'wrap' }}>
                    <span style={{ fontWeight:700,fontSize:15 }}>{item.title}</span>
                    <Tag color={statusColor[item.status]} bg={item.status==='in-progress'?`${C.accent}18`:'rgba(255,255,255,.06)'}>
                      {item.status==='in-progress'?'⚡ In Progress':'Planned'}
                    </Tag>
                  </div>
                  <p style={{ fontSize:13,color:C.muted,lineHeight:1.5,marginBottom:8 }}>{item.desc}</p>
                  <div style={{ display:'flex',gap:8 }}>
                    <Tag color={priColor[item.pri]}>{item.pri} priority</Tag>
                    <Tag color={C.muted} bg="rgba(255,255,255,.05)">{item.cat}</Tag>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── MAIN APP ────────────────────────────────────────────────
export default function App() {
  const [goal, setGoal] = useState(null);
  const [page, setPage] = useState('dashboard');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    const injectStyle = () => {
      if (!document.getElementById('ff-styles')) {
        const s = document.createElement('style');
        s.id='ff-styles'; s.textContent=STYLES;
        document.head.appendChild(s);
      }
    };
    injectStyle();
    (async()=>{
      const [g,l] = await Promise.all([store.get('ff-goal'), store.get('ff-logs')]);
      if (g) setGoal(g);
      if (l) setLogs(l);
      setLoading(false);
    })();
  },[]);

  const selectGoal = async(g) => {
    setGoal(g); await store.set('ff-goal', g);
  };

  const addLog = async(entry) => {
    const updated = [...logs, entry];
    setLogs(updated); await store.set('ff-logs', updated);
  };

  const streak = useCallback(()=>{
    if (!logs.length) return 0;
    let s=0, d=new Date();
    for (let i=logs.length-1; i>=0; i--) {
      const ld = logs[i].date;
      const expected = d.toISOString().slice(0,10);
      if (ld===expected) { s++; d.setDate(d.getDate()-1); }
      else break;
    }
    return s;
  },[logs]);

  const completedThisWeek = logs.filter(l=>{
    const diff=(Date.now()-new Date(l.date+'T12:00:00').getTime())/86400000;
    return diff<=7;
  }).length;

  const NAV = [
    { id:'dashboard', icon:LayoutDashboard, label:'Home' },
    { id:'workout',   icon:Dumbbell,        label:'Workout' },
    { id:'log',       icon:Plus,            label:'Log' },
    { id:'progress',  icon:TrendingUp,      label:'Progress' },
    { id:'nutrition', icon:Utensils,        label:'Nutrition' },
    { id:'todo',      icon:ListTodo,        label:'Roadmap' },
  ];

  if (loading) return (
    <div style={{ minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#060610' }}>
      <div style={{ textAlign:'center' }}>
        <Dumbbell size={32} color='#c2f53e' style={{ margin:'0 auto 16px',display:'block',animation:'spin 1s linear infinite' }}/>
        <div style={{ color:'rgba(255,255,255,.5)',fontSize:14 }}>Loading FitForge…</div>
      </div>
    </div>
  );

  if (!goal) return (
    <>
      <style>{STYLES}</style>
      <GoalSelector onSelect={selectGoal}/>
    </>
  );

  const g = GOALS.find(x=>x.id===goal);

  return (
    <>
      <style>{STYLES}</style>
      <div style={{ maxWidth:680, margin:'0 auto', minHeight:'100vh', position:'relative' }}>

        {/* Header */}
        <div style={{ position:'sticky',top:0,zIndex:99,background:'rgba(6,6,16,.92)',backdropFilter:'blur(20px)',borderBottom:`1px solid ${C.border}`,padding:'14px 16px',display:'flex',alignItems:'center',justifyContent:'space-between' }}>
          <div className="condensed" style={{ fontSize:22,fontWeight:900,letterSpacing:1 }}>
            FIT<span style={{ color:g.color }}>FORGE</span>
          </div>
          <div style={{ display:'flex',alignItems:'center',gap:10 }}>
            <div style={{ background:`${g.color}18`,border:`1px solid ${g.color}40`,borderRadius:10,padding:'5px 10px',fontSize:12,fontWeight:700,color:g.color,display:'flex',alignItems:'center',gap:6 }}>
              {g.emoji} {g.name}
            </div>
            <button onClick={()=>{setGoal(null);store.set('ff-goal',null)}} style={{ background:'rgba(255,255,255,.06)',border:`1px solid ${C.border}`,color:C.muted,borderRadius:8,padding:'6px 10px',fontSize:12 }}>
              <RefreshCw size={13}/>
            </button>
          </div>
        </div>

        {/* Page content */}
        <div key={page}>
          {page==='dashboard'  && <Dashboard goal={goal} logs={logs} streak={streak()} completedToday={completedThisWeek} onNavigate={setPage}/>}
          {page==='workout'    && <WorkoutPage goal={goal}/>}
          {page==='log'        && <LogPage logs={logs} onAddLog={addLog}/>}
          {page==='progress'   && <ProgressPage logs={logs} goal={goal}/>}
          {page==='nutrition'  && <NutritionPage goal={goal}/>}
          {page==='todo'       && <TodoPage/>}
        </div>

        {/* Bottom nav */}
        <div style={{ position:'fixed',bottom:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:680,background:'rgba(6,6,16,.95)',backdropFilter:'blur(24px)',borderTop:`1px solid ${C.border}`,display:'flex',justifyContent:'space-around',padding:'10px 0 18px',zIndex:100 }}>
          {NAV.map(n=>{
            const active=page===n.id;
            const Ic=n.icon;
            return (
              <button key={n.id} onClick={()=>setPage(n.id)} style={{ background:'transparent',display:'flex',flexDirection:'column',alignItems:'center',gap:3,padding:'6px 10px',borderRadius:12,transition:'all .2s',color:active?g.color:C.muted }}>
                <div style={{ position:'relative' }}>
                  <Ic size={20} strokeWidth={active?2.5:1.8}/>
                  {active && <div style={{ position:'absolute',bottom:-5,left:'50%',transform:'translateX(-50%)',width:4,height:4,borderRadius:'50%',background:g.color }}/>}
                </div>
                <span style={{ fontSize:10,fontWeight:active?700:500 }}>{n.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
