import { useState, useEffect } from "react";
import { BarChart, Bar, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

//const API_BASE = "http://localhost:8000";

const API_BASE = window.location.hostname === "localhost"
  ? "http://localhost:8000"
  : "https://crash-severity-api.onrender.com";

// ─── REAL DATA FROM DATASET (12,484 rows) ────────────────────────────────────
const TOTAL = 12484;
const SEV_COUNTS = { "Fatal Injury": 6304, "Serious Injury": 3581, "Slight Injury": 2599 };

const REAL_DATA = {
  Age_band_of_driver: [
    { name:"18-30",    "Fatal Injury":2505, "Serious Injury":1382, "Slight Injury":1097, total:4984 },
    { name:"31-50",    "Fatal Injury":2439, "Serious Injury":1219, "Slight Injury":895,  total:4553 },
    { name:"Over 51",  "Fatal Injury":908,  "Serious Injury":564,  "Slight Injury":376,  total:1848 },
    { name:"Under 18", "Fatal Injury":452,  "Serious Injury":416,  "Slight Injury":231,  total:1099 },
  ],
  Driving_experience: [
    { name:"5-10yr",     "Fatal Injury":1829, "Serious Injury":989,  "Slight Injury":644, total:3462 },
    { name:"2-5yr",      "Fatal Injury":1472, "Serious Injury":895,  "Slight Injury":915, total:3282 },
    { name:"Above 10yr", "Fatal Injury":1235, "Serious Injury":683,  "Slight Injury":534, total:2452 },
    { name:"1-2yr",      "Fatal Injury":995,  "Serious Injury":540,  "Slight Injury":341, total:1876 },
    { name:"Below 1yr",  "Fatal Injury":703,  "Serious Injury":458,  "Slight Injury":165, total:1326 },
    { name:"No Licence", "Fatal Injury":70,   "Serious Injury":16,   "Slight Injury":0,   total:86   },
  ],
  Light_conditions: [
    { name:"Daylight",               "Fatal Injury":4554, "Serious Injury":2463, "Slight Injury":1311, total:8328 },
    { name:"Darkness - lights lit",  "Fatal Injury":1668, "Serious Injury":967,  "Slight Injury":1143, total:3778 },
    { name:"Darkness - no lighting", "Fatal Injury":69,   "Serious Injury":128,  "Slight Injury":145,  total:342  },
    { name:"Darkness - lights unlit","Fatal Injury":13,   "Serious Injury":23,   "Slight Injury":0,    total:36   },
  ],
  Weather_conditions: [
    { name:"Normal",      "Fatal Injury":5211, "Serious Injury":3110, "Slight Injury":2284, total:10605 },
    { name:"Raining",     "Fatal Injury":731,  "Serious Injury":351,  "Slight Injury":315,  total:1397  },
    { name:"Other",       "Fatal Injury":171,  "Serious Injury":47,   "Slight Injury":0,    total:218   },
    { name:"Windy",       "Fatal Injury":53,   "Serious Injury":39,   "Slight Injury":0,    total:92    },
    { name:"Cloudy",      "Fatal Injury":71,   "Serious Injury":18,   "Slight Injury":0,    total:89    },
    { name:"Snow",        "Fatal Injury":40,   "Serious Injury":16,   "Slight Injury":0,    total:56    },
    { name:"Rain+Windy",  "Fatal Injury":22,   "Serious Injury":0,    "Slight Injury":0,    total:22    },
    { name:"Fog or mist", "Fatal Injury":5,    "Serious Injury":0,    "Slight Injury":0,    total:5     },
  ],
  Type_of_collision: [
    { name:"Vehicle with vehicle", "Fatal Injury":4532, "Serious Injury":2526, "Slight Injury":1787, total:8845 },
    { name:"Roadside objects",     "Fatal Injury":956,  "Serious Injury":553,  "Slight Injury":395,  total:1904 },
    { name:"Pedestrians",          "Fatal Injury":448,  "Serious Injury":301,  "Slight Injury":296,  total:1045 },
    { name:"Rollover",             "Fatal Injury":223,  "Serious Injury":105,  "Slight Injury":77,   total:405  },
    { name:"Animals",              "Fatal Injury":78,   "Serious Injury":62,   "Slight Injury":44,   total:184  },
    { name:"Roadside-parked",      "Fatal Injury":32,   "Serious Injury":8,    "Slight Injury":0,    total:40   },
    { name:"Fall from vehicles",   "Fatal Injury":18,   "Serious Injury":15,   "Slight Injury":0,    total:33   },
    { name:"With Train",           "Fatal Injury":2,    "Serious Injury":2,    "Slight Injury":0,    total:4    },
  ],
  Cause_of_accident: [
    { name:"No distancing",         "Fatal Injury":1165, "Serious Injury":609, "Slight Injury":326, total:2100 },
    { name:"Lane right",            "Fatal Injury":932,  "Serious Injury":483, "Slight Injury":401, total:1816 },
    { name:"Driving carelessly",    "Fatal Injury":728,  "Serious Injury":445, "Slight Injury":387, total:1560 },
    { name:"Lane left",             "Fatal Injury":745,  "Serious Injury":439, "Slight Injury":324, total:1508 },
    { name:"Moving Backward",       "Fatal Injury":569,  "Serious Injury":317, "Slight Injury":492, total:1378 },
    { name:"No priority vehicle",   "Fatal Injury":640,  "Serious Injury":311, "Slight Injury":168, total:1119 },
    { name:"No priority pedestrian","Fatal Injury":368,  "Serious Injury":210, "Slight Injury":62,  total:640  },
    { name:"Other",                 "Fatal Injury":234,  "Serious Injury":154, "Slight Injury":48,  total:436  },
    { name:"Overtaking",            "Fatal Injury":225,  "Serious Injury":151, "Slight Injury":53,  total:429  },
    { name:"Drugs/alcohol",         "Fatal Injury":172,  "Serious Injury":106, "Slight Injury":82,  total:360  },
  ],
  Vehicle_movement: [
    { name:"Going straight",   "Fatal Injury":4303, "Serious Injury":2371, "Slight Injury":1778, total:8452 },
    { name:"Moving Backward",  "Fatal Injury":544,  "Serious Injury":301,  "Slight Injury":154,  total:999  },
    { name:"Other",            "Fatal Injury":485,  "Serious Injury":285,  "Slight Injury":161,  total:931  },
    { name:"Reversing",        "Fatal Injury":297,  "Serious Injury":206,  "Slight Injury":113,  total:616  },
    { name:"Turnover",         "Fatal Injury":243,  "Serious Injury":178,  "Slight Injury":144,  total:565  },
    { name:"Getting off",      "Fatal Injury":200,  "Serious Injury":119,  "Slight Injury":37,   total:356  },
    { name:"Entering junction","Fatal Injury":91,   "Serious Injury":53,   "Slight Injury":64,   total:208  },
    { name:"Overtaking",       "Fatal Injury":58,   "Serious Injury":20,   "Slight Injury":121,  total:199  },
  ],
  Road_surface_type: [
    { name:"Asphalt roads",         "Fatal Injury":5883, "Serious Injury":3338, "Slight Injury":2450, total:11671 },
    { name:"Earth roads",           "Fatal Injury":178,  "Serious Injury":90,   "Slight Injury":108,  total:376   },
    { name:"Gravel roads",          "Fatal Injury":116,  "Serious Injury":91,   "Slight Injury":0,    total:207   },
    { name:"Other",                 "Fatal Injury":82,   "Serious Injury":55,   "Slight Injury":0,    total:137   },
    { name:"Asphalt with distress", "Fatal Injury":45,   "Serious Injury":7,    "Slight Injury":41,   total:93    },
  ],
  Types_of_Junction: [
    { name:"Y Shape",    "Fatal Injury":2632, "Serious Injury":1391, "Slight Injury":1066, total:5089 },
    { name:"No junction","Fatal Injury":1997, "Serious Injury":1312, "Slight Injury":1303, total:4612 },
    { name:"Crossing",   "Fatal Injury":1299, "Serious Injury":593,  "Slight Injury":179,  total:2071 },
    { name:"Other",      "Fatal Injury":244,  "Serious Injury":191,  "Slight Injury":25,   total:460  },
    { name:"O Shape",    "Fatal Injury":92,   "Serious Injury":83,   "Slight Injury":26,   total:201  },
    { name:"T Shape",    "Fatal Injury":33,   "Serious Injury":11,   "Slight Injury":0,    total:44   },
    { name:"X Shape",    "Fatal Injury":7,    "Serious Injury":0,    "Slight Injury":0,    total:7    },
  ],
  Educational_level: [
    { name:"Junior high school","Fatal Injury":4166, "Serious Injury":2368, "Slight Injury":1752, total:8286 },
    { name:"Elementary school", "Fatal Injury":1162, "Serious Injury":698,  "Slight Injury":451,  total:2311 },
    { name:"High school",       "Fatal Injury":646,  "Serious Injury":331,  "Slight Injury":292,  total:1269 },
    { name:"Above high school", "Fatal Injury":216,  "Serious Injury":113,  "Slight Injury":86,   total:415  },
    { name:"Writing & reading", "Fatal Injury":97,   "Serious Injury":52,   "Slight Injury":18,   total:167  },
    { name:"Illiterate",        "Fatal Injury":17,   "Serious Injury":19,   "Slight Injury":0,    total:36   },
  ],
  Lanes_or_Medians: [
    { name:"Divided broken lines","Fatal Injury":2325, "Serious Injury":1426, "Slight Injury":709,  total:4460 },
    { name:"Undivided Two way",   "Fatal Injury":1997, "Serious Injury":1066, "Slight Injury":1167, total:4230 },
    { name:"Other",               "Fatal Injury":868,  "Serious Injury":560,  "Slight Injury":399,  total:1827 },
    { name:"Double carriageway",  "Fatal Injury":565,  "Serious Injury":250,  "Slight Injury":155,  total:970  },
    { name:"One way",             "Fatal Injury":466,  "Serious Injury":242,  "Slight Injury":142,  total:850  },
    { name:"Divided solid lines", "Fatal Injury":83,   "Serious Injury":37,   "Slight Injury":27,   total:147  },
  ],
};

const SAMPLE_ROWS = [
  {Age_band_of_driver:"18-30",   Sex_of_driver:"Male",   Educational_level:"Junior high school",Vehicle_driver_relation:"Employee",Driving_experience:"2-5yr",    Road_surface_type:"Asphalt roads",Light_conditions:"Daylight",             Weather_conditions:"Normal", Type_of_collision:"Vehicle with vehicle collision",  Cause_of_accident:"No distancing",              Accident_severity:"Fatal Injury"},
  {Age_band_of_driver:"31-50",   Sex_of_driver:"Male",   Educational_level:"Elementary school", Vehicle_driver_relation:"Employee",Driving_experience:"5-10yr",   Road_surface_type:"Asphalt roads",Light_conditions:"Darkness - lights lit", Weather_conditions:"Raining",Type_of_collision:"Collision with roadside objects",Cause_of_accident:"Changing lane to the right",  Accident_severity:"Serious Injury"},
  {Age_band_of_driver:"Over 51", Sex_of_driver:"Male",   Educational_level:"High school",       Vehicle_driver_relation:"Owner",   Driving_experience:"Above 10yr",Road_surface_type:"Asphalt roads",Light_conditions:"Darkness - lights lit", Weather_conditions:"Normal", Type_of_collision:"Vehicle with vehicle collision",  Cause_of_accident:"Moving Backward",            Accident_severity:"Slight Injury"},
  {Age_band_of_driver:"18-30",   Sex_of_driver:"Male",   Educational_level:"Junior high school",Vehicle_driver_relation:"Employee",Driving_experience:"1-2yr",    Road_surface_type:"Asphalt roads",Light_conditions:"Daylight",             Weather_conditions:"Normal", Type_of_collision:"Vehicle with vehicle collision",  Cause_of_accident:"Driving carelessly",         Accident_severity:"Fatal Injury"},
  {Age_band_of_driver:"Under 18",Sex_of_driver:"Male",   Educational_level:"Junior high school",Vehicle_driver_relation:"Employee",Driving_experience:"Below 1yr", Road_surface_type:"Asphalt roads",Light_conditions:"Daylight",             Weather_conditions:"Normal", Type_of_collision:"Collision with pedestrians",      Cause_of_accident:"No priority to pedestrian",  Accident_severity:"Fatal Injury"},
  {Age_band_of_driver:"31-50",   Sex_of_driver:"Female", Educational_level:"Above high school", Vehicle_driver_relation:"Owner",   Driving_experience:"5-10yr",   Road_surface_type:"Asphalt roads",Light_conditions:"Daylight",             Weather_conditions:"Normal", Type_of_collision:"Vehicle with vehicle collision",  Cause_of_accident:"No distancing",              Accident_severity:"Serious Injury"},
  {Age_band_of_driver:"18-30",   Sex_of_driver:"Male",   Educational_level:"Junior high school",Vehicle_driver_relation:"Employee",Driving_experience:"2-5yr",    Road_surface_type:"Earth roads",  Light_conditions:"Darkness - no lighting",Weather_conditions:"Raining",Type_of_collision:"Rollover",                        Cause_of_accident:"Overspeed",                  Accident_severity:"Slight Injury"},
  {Age_band_of_driver:"31-50",   Sex_of_driver:"Male",   Educational_level:"Elementary school", Vehicle_driver_relation:"Employee",Driving_experience:"Above 10yr",Road_surface_type:"Asphalt roads",Light_conditions:"Daylight",             Weather_conditions:"Normal", Type_of_collision:"Vehicle with vehicle collision",  Cause_of_accident:"Changing lane to the left",  Accident_severity:"Slight Injury"},
  {Age_band_of_driver:"Over 51", Sex_of_driver:"Male",   Educational_level:"Writing & reading", Vehicle_driver_relation:"Employee",Driving_experience:"Above 10yr",Road_surface_type:"Asphalt roads",Light_conditions:"Daylight",             Weather_conditions:"Cloudy", Type_of_collision:"Collision with pedestrians",      Cause_of_accident:"No priority to pedestrian",  Accident_severity:"Fatal Injury"},
  {Age_band_of_driver:"18-30",   Sex_of_driver:"Male",   Educational_level:"Junior high school",Vehicle_driver_relation:"Employee",Driving_experience:"2-5yr",    Road_surface_type:"Asphalt roads",Light_conditions:"Darkness - lights lit", Weather_conditions:"Normal", Type_of_collision:"Vehicle with vehicle collision",  Cause_of_accident:"Overtaking",                 Accident_severity:"Serious Injury"},
  {Age_band_of_driver:"Under 18",Sex_of_driver:"Male",   Educational_level:"Junior high school",Vehicle_driver_relation:"Employee",Driving_experience:"Below 1yr", Road_surface_type:"Gravel roads", Light_conditions:"Darkness - no lighting",Weather_conditions:"Raining",Type_of_collision:"Rollover",                        Cause_of_accident:"Driving at high speed",      Accident_severity:"Slight Injury"},
  {Age_band_of_driver:"31-50",   Sex_of_driver:"Female", Educational_level:"High school",       Vehicle_driver_relation:"Owner",   Driving_experience:"2-5yr",    Road_surface_type:"Asphalt roads",Light_conditions:"Daylight",             Weather_conditions:"Normal", Type_of_collision:"Collision with pedestrians",      Cause_of_accident:"No priority to pedestrian",  Accident_severity:"Serious Injury"},
];

const SEV_COLOR = {"Slight Injury":"#10b981","Serious Injury":"#f59e0b","Fatal Injury":"#f85149"};
const SEV_BG    = {"Slight Injury":"rgba(16,185,129,0.1)","Serious Injury":"rgba(245,158,11,0.1)","Fatal Injury":"rgba(248,81,73,0.1)"};
const SEV_ORDER = ["Slight Injury","Serious Injury","Fatal Injury"];
const NAV = [{id:"dashboard",icon:"⬡",label:"Dashboard"},{id:"predict",icon:"◈",label:"Predict"},{id:"analytics",icon:"◎",label:"Analytics"},{id:"dataset",icon:"▦",label:"Dataset"},{id:"model",icon:"◉",label:"Model Info"}];
const pct = (a,b) => b===0?0:+((a/b)*100).toFixed(1);

const Card=({children,style={}})=><div style={{background:"#0d1117",border:"1px solid #21262d",borderRadius:"12px",padding:"20px",...style}}>{children}</div>;
const STitle=({children,sub})=><div style={{marginBottom:"16px"}}><h3 style={{margin:0,fontSize:"13px",fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:"#7d8590"}}>{children}</h3>{sub&&<p style={{margin:"4px 0 0",fontSize:"11px",color:"#484f58"}}>{sub}</p>}</div>;
const Badge=({sev})=><span style={{display:"inline-block",padding:"2px 10px",borderRadius:"20px",fontSize:"11px",fontWeight:700,background:SEV_BG[sev]||"#21262d",color:SEV_COLOR[sev]||"#8b949e",border:`1px solid ${(SEV_COLOR[sev]||"#8b949e")}40`}}>{sev}</span>;
const StatCard=({icon,label,value,sub,color="#58a6ff"})=><Card style={{display:"flex",flexDirection:"column",gap:"8px"}}><div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:"20px"}}>{icon}</span><span style={{fontSize:"10px",color,fontWeight:700,letterSpacing:"0.05em",textTransform:"uppercase"}}>{label}</span></div><div style={{fontSize:"28px",fontWeight:900,color:"#e6edf3",letterSpacing:"-0.02em",fontFamily:"'Courier New',monospace"}}>{value}</div>{sub&&<div style={{fontSize:"11px",color:"#484f58"}}>{sub}</div>}</Card>;
const CTooltip=({active,payload,label})=>{if(!active||!payload?.length)return null;return<div style={{background:"#161b22",border:"1px solid #30363d",borderRadius:"8px",padding:"10px 14px"}}><p style={{margin:"0 0 6px",fontSize:"12px",color:"#8b949e",fontWeight:600}}>{label}</p>{payload.map((p,i)=><p key={i} style={{margin:"2px 0",fontSize:"12px",color:p.color||"#e6edf3"}}>{p.name}: <strong>{typeof p.value==="number"?p.value.toLocaleString():p.value}</strong></p>)}</div>;};
function APIStatus({status}){const config={checking:{color:"#7d8590",bg:"#21262d",dot:"⏳",text:"Checking API…"},online:{color:"#3fb950",bg:"#238636",dot:"●",text:`Python API Online — ${API_BASE}`},offline:{color:"#f85149",bg:"#da3633",dot:"○",text:"Python API Offline — Using demo mode"}}[status]||{};return<div style={{display:"flex",alignItems:"center",gap:"8px",padding:"6px 12px",background:config.bg+"22",border:`1px solid ${config.bg}55`,borderRadius:"8px",fontSize:"11px",color:config.color,fontFamily:"monospace"}}><span>{config.dot}</span><span>{config.text}</span>{status==="offline"&&<span style={{marginLeft:"auto",opacity:.7}}>start: python api.py</span>}</div>;}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function DashboardPage({apiMetrics}) {
  const sevPie = SEV_ORDER.map(s=>({name:s,value:SEV_COUNTS[s]}));
  return (
    <div style={{display:"flex",flexDirection:"column",gap:"20px"}}>
      {apiMetrics&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:"12px"}}>
          <StatCard icon="🤖" label="Best Model"   value={apiMetrics.best_model?.split(" ")[0]||"—"}                                                      sub={`Accuracy: ${(apiMetrics.accuracy*100).toFixed(1)}%`} color="#d2a8ff"/>
          
          <StatCard icon="📈" label="AUC-ROC"      value={apiMetrics.auc_roc?.toFixed(3)||"—"}                                                            sub="Multi-class OVR"                                     color="#ffa657"/>
        </div>
      )}

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:"14px"}}>
        <StatCard icon="📋" label="Total Records"  value={TOTAL.toLocaleString()}                         sub="RTA Dataset"                                   color="#58a6ff"/>
        <StatCard icon="🔴" label="Fatal Injury"   value={SEV_COUNTS["Fatal Injury"].toLocaleString()}    sub={`${pct(SEV_COUNTS["Fatal Injury"],TOTAL)}% of records`}   color="#f85149"/>
        <StatCard icon="🟡" label="Serious Injury" value={SEV_COUNTS["Serious Injury"].toLocaleString()}  sub={`${pct(SEV_COUNTS["Serious Injury"],TOTAL)}% of records`} color="#f59e0b"/>
        <StatCard icon="🟢" label="Slight Injury"  value={SEV_COUNTS["Slight Injury"].toLocaleString()}   sub={`${pct(SEV_COUNTS["Slight Injury"],TOTAL)}% of records`}  color="#10b981"/>
        <StatCard icon="👤" label="Male Drivers"   value="12,389"                                         sub="99.2% of all drivers"                             color="#58a6ff"/>
        <StatCard icon="📊" label="Features"       value="14"                                             sub="All categorical"                                  color="#d2a8ff"/>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 2fr",gap:"14px"}}>
        <Card>
          <STitle>Severity Distribution</STitle>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={sevPie} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {sevPie.map((e,i)=><Cell key={i} fill={SEV_COLOR[e.name]}/>)}
              </Pie>
              <Tooltip content={<CTooltip/>}/>
              <Legend iconSize={8} formatter={v=><span style={{fontSize:"11px",color:"#8b949e"}}>{v}</span>}/>
            </PieChart>
          </ResponsiveContainer>
          <div style={{display:"flex",flexDirection:"column",gap:"5px",marginTop:"8px"}}>
            {SEV_ORDER.map(s=>(
              <div key={s} style={{display:"flex",justifyContent:"space-between",fontSize:"11px"}}>
                <span style={{color:SEV_COLOR[s]}}>{s}</span>
                <span style={{color:"#484f58",fontFamily:"monospace"}}>{SEV_COUNTS[s].toLocaleString()} ({pct(SEV_COUNTS[s],TOTAL)}%)</span>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <STitle sub="Top causes from dataset">Top Causes of Accident</STitle>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={REAL_DATA.Cause_of_accident.slice(0,6)} layout="vertical" margin={{top:0,right:10,left:0,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#21262d" horizontal={false}/>
              <XAxis type="number" tick={{fontSize:10,fill:"#7d8590"}} axisLine={false} tickLine={false}/>
              <YAxis type="category" dataKey="name" tick={{fontSize:10,fill:"#7d8590"}} axisLine={false} tickLine={false} width={130}/>
              <Tooltip content={<CTooltip/>}/>
              <Legend iconSize={8} formatter={v=><span style={{fontSize:"10px",color:"#8b949e"}}>{v}</span>}/>
              {SEV_ORDER.map(s=><Bar key={s} dataKey={s} stackId="a" fill={SEV_COLOR[s]}/>)}
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px"}}>
        <Card>
          <STitle sub="From dataset">Collision Types × Severity</STitle>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={REAL_DATA.Type_of_collision.slice(0,5)} layout="vertical" margin={{top:0,right:10,left:0,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#21262d" horizontal={false}/>
              <XAxis type="number" tick={{fontSize:10,fill:"#7d8590"}} axisLine={false} tickLine={false}/>
              <YAxis type="category" dataKey="name" tick={{fontSize:9,fill:"#7d8590"}} axisLine={false} tickLine={false} width={120}/>
              <Tooltip content={<CTooltip/>}/>
              {SEV_ORDER.map(s=><Bar key={s} dataKey={s} stackId="a" fill={SEV_COLOR[s]}/>)}
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <STitle sub="From dataset">Age Band of Driver × Severity</STitle>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={REAL_DATA.Age_band_of_driver} margin={{top:5,right:5,left:-20,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#21262d" vertical={false}/>
              <XAxis dataKey="name" tick={{fontSize:11,fill:"#7d8590"}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:10,fill:"#7d8590"}} axisLine={false} tickLine={false}/>
              <Tooltip content={<CTooltip/>}/>
              <Legend iconSize={8} formatter={v=><span style={{fontSize:"10px",color:"#8b949e"}}>{v}</span>}/>
              {SEV_ORDER.map(s=><Bar key={s} dataKey={s} stackId="a" fill={SEV_COLOR[s]} radius={s==="Fatal Injury"?[2,2,0,0]:undefined}/>)}
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px"}}>
        <Card>
          <STitle sub="From dataset">Light Conditions × Severity</STitle>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={REAL_DATA.Light_conditions} margin={{top:5,right:5,left:-20,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#21262d" vertical={false}/>
              <XAxis dataKey="name" tick={{fontSize:8,fill:"#7d8590"}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:10,fill:"#7d8590"}} axisLine={false} tickLine={false}/>
              <Tooltip content={<CTooltip/>}/>
              {SEV_ORDER.map(s=><Bar key={s} dataKey={s} stackId="a" fill={SEV_COLOR[s]} radius={s==="Fatal Injury"?[2,2,0,0]:undefined}/>)}
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <STitle sub="From dataset">Weather Conditions × Severity</STitle>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={REAL_DATA.Weather_conditions} margin={{top:5,right:5,left:-20,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#21262d" vertical={false}/>
              <XAxis dataKey="name" tick={{fontSize:10,fill:"#7d8590"}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:10,fill:"#7d8590"}} axisLine={false} tickLine={false}/>
              <Tooltip content={<CTooltip/>}/>
              {SEV_ORDER.map(s=><Bar key={s} dataKey={s} stackId="a" fill={SEV_COLOR[s]} radius={s==="Fatal Injury"?[2,2,0,0]:undefined}/>)}
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}

// ─── PREDICT PAGE — UNTOUCHED ─────────────────────────────────────────────────
function PredictPage({apiStatus}) {
  const [form,setForm]=useState({
    Age_band_of_driver:"18-30",Sex_of_driver:"Male",Educational_level:"Junior high school",
    Vehicle_driver_relation:"Employee",Driving_experience:"2-5yr",Lanes_or_Medians:"Undivided Two way",
    Types_of_Junction:"No junction",Road_surface_type:"Asphalt roads",Light_conditions:"Daylight",
    Weather_conditions:"Normal",Type_of_collision:"Vehicle with vehicle collision",
    Vehicle_movement:"Going straight",Pedestrian_movement:"Not a Pedestrian",Cause_of_accident:"No distancing",
  });
  const [result,setResult]=useState(null);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState(null);
  const [aiAnalysis,setAiAnalysis]=useState(null);
  const [aiLoading,setAiLoading]=useState(false);
  const set=k=>v=>setForm(f=>({...f,[k]:v}));

  const predict=async()=>{
    setLoading(true);setResult(null);setError(null);setAiAnalysis(null);
    try{
      if(apiStatus==="online"){
        const res=await fetch(`${API_BASE}/predict`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});
        if(!res.ok){const e=await res.json().catch(()=>({}));throw new Error(e.detail||`API error: ${res.status}`);}
        const data=await res.json();
        setResult({severity:data.severity,probabilities:data.probabilities,confidence:data.confidence??75,risk_score:data.risk_score??5,key_factors:data.key_factors||[],model_used:data.model_used||"Model",classes:data.classes||SEV_ORDER});
      }else{
        await new Promise(r=>setTimeout(r,800));
        const isSlightInputs=form.Driving_experience==="Above 10yr"&&form.Light_conditions==="Darkness - lights lit"&&form.Weather_conditions==="Normal";
        const isFatalInputs=form.Light_conditions==="Darkness - no lighting"&&form.Driving_experience==="Below 1yr";
        const sev=isSlightInputs?"Slight Injury":isFatalInputs?"Fatal Injury":"Serious Injury";
        const p=sev==="Slight Injury"?{"Slight Injury":68,"Serious Injury":24,"Fatal Injury":8}:sev==="Serious Injury"?{"Slight Injury":15,"Serious Injury":63,"Fatal Injury":22}:{"Slight Injury":6,"Serious Injury":21,"Fatal Injury":73};
        setResult({severity:sev,confidence:70,probabilities:p,risk_score:sev==="Slight Injury"?3:sev==="Serious Injury"?6:9,key_factors:["API offline — demo prediction","Start python api.py for real predictions"],model_used:"Demo Mode",classes:SEV_ORDER});
      }
    }catch(e){setError(`Error: ${e.message}. Make sure python api.py is running.`);}
    setLoading(false);
  };

  const getAI=async()=>{
    if(!result)return;
    setAiLoading(true);setAiAnalysis(null);
    const prompt=`You are a road safety expert. A crash severity ML model predicted:
Severity: ${result.severity} | Confidence: ${result.confidence}% | Risk Score: ${result.risk_score}/10
Inputs: Weather=${form.Weather_conditions}, Light=${form.Light_conditions}, Collision=${form.Type_of_collision}, Experience=${form.Driving_experience}, Cause=${form.Cause_of_accident}, Junction=${form.Types_of_Junction}, Road=${form.Road_surface_type}
Return ONLY JSON: {"summary":"<2 sentence expert summary>","risk_breakdown":[{"factor":"<n>","level":"High|Medium|Low","detail":"<1 sentence>"}],"intervention_priority":["<action1>","<action2>","<action3>"],"comparative_insight":"<how this compares to similar crashes>","prevention_score":<0-100>}`;
    try{
      const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,messages:[{role:"user",content:prompt}]})});
      const d=await r.json();
      const txt=d.content.map(b=>b.text||"").join("");
      setAiAnalysis(JSON.parse(txt.replace(/```json|```/g,"").trim()));
    }catch(e){setAiAnalysis({error:"AI analysis unavailable"});}
    setAiLoading(false);
  };

  const cfg=result?SEV_COLOR[result.severity]:null;
  const probData=result?SEV_ORDER.map(s=>({subject:s.split(" ")[0],value:result.probabilities[s]||0,fullMark:100})):[];
  const Sel=({label,fkey,opts})=><div style={{marginBottom:"12px"}}><label style={{display:"block",fontSize:"10px",fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:"#7d8590",marginBottom:"4px"}}>{label}</label><select value={form[fkey]} onChange={e=>set(fkey)(e.target.value)} style={{width:"100%",background:"#161b22",border:"1px solid #30363d",borderRadius:"7px",color:"#e6edf3",fontSize:"12px",padding:"8px 10px",outline:"none"}}>{opts.map(o=><option key={o} value={o}>{o}</option>)}</select></div>;

  return (
    <div style={{display:"grid",gridTemplateColumns:"310px 1fr",gap:"20px"}}>
      <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
        <Card><STitle>Driver Information</STitle>
          <Sel label="Age Band of Driver" fkey="Age_band_of_driver" opts={["Under 18","18-30","31-50","Over 51"]}/>
          <Sel label="Sex of Driver" fkey="Sex_of_driver" opts={["Male","Female"]}/>
          <Sel label="Educational Level" fkey="Educational_level" opts={["Junior high school","Elementary school","High school","Above high school","Writing & reading","Illiterate"]}/>
          <Sel label="Vehicle Driver Relation" fkey="Vehicle_driver_relation" opts={["Employee","Owner","Other"]}/>
          <Sel label="Driving Experience" fkey="Driving_experience" opts={["No Licence","Below 1yr","1-2yr","2-5yr","5-10yr","Above 10yr"]}/>
        </Card>
        <Card><STitle>Road & Environment</STitle>
          <Sel label="Lanes or Medians" fkey="Lanes_or_Medians" opts={["Undivided Two way","Two-way (divided with broken lines road marking)","Two-way (divided with solid lines road marking)","Double carriageway (median)","One way","other"]}/>
          <Sel label="Types of Junction" fkey="Types_of_Junction" opts={["No junction","Y Shape","Crossing","T Shape","O Shape","X Shape","Other"]}/>
          <Sel label="Road Surface Type" fkey="Road_surface_type" opts={["Asphalt roads","Earth roads","Gravel roads","Asphalt roads with some distress","Other"]}/>
          <Sel label="Light Conditions" fkey="Light_conditions" opts={["Daylight","Darkness - lights lit","Darkness - no lighting","Darkness - lights unlit"]}/>
          <Sel label="Weather Conditions" fkey="Weather_conditions" opts={["Normal","Raining","Raining and Windy","Cloudy","Windy","Fog or mist","Snow","Other"]}/>
        </Card>
        <Card><STitle>Crash Details</STitle>
          <Sel label="Type of Collision" fkey="Type_of_collision" opts={["Vehicle with vehicle collision","Collision with roadside objects","Collision with roadside-parked vehicles","Collision with pedestrians","Collision with animals","Rollover","Fall from vehicles","With Train","Other"]}/>
          <Sel label="Vehicle Movement" fkey="Vehicle_movement" opts={["Going straight","Moving Backward","Reversing","Turnover","Overtaking","Getting off","Entering a junction","Waiting to go","U-Turn","Stopping","Parked","Other"]}/>
          <Sel label="Pedestrian Movement" fkey="Pedestrian_movement" opts={["Not a Pedestrian","Crossing from driver's nearside","Crossing from nearside - masked by parked or statioNot a Pedestrianry vehicle","Crossing from offside - masked by  parked or statioNot a Pedestrianry vehicle","In carriageway, statioNot a Pedestrianry - not crossing  (standing or playing)","Walking along in carriageway, back to traffic","Walking along in carriageway, facing traffic"]}/>
          <Sel label="Cause of Accident" fkey="Cause_of_accident" opts={["No distancing","Changing lane to the left","Changing lane to the right","No priority to vehicle","No priority to pedestrian","Moving Backward","Overtaking","Driving carelessly","Driving at high speed","Overspeed","Driving under the influence of drugs","Drunk driving","Driving to the left","Getting off the vehicle improperly","Overloading","Overturning","Turnover","Improper parking","Other"]}/>
        </Card>
        <button onClick={predict} disabled={loading} style={{width:"100%",padding:"13px",background:loading?"#21262d":"linear-gradient(135deg,#238636,#2ea043)",border:"none",borderRadius:"10px",color:loading?"#484f58":"#fff",fontSize:"14px",fontWeight:800,cursor:loading?"not-allowed":"pointer",letterSpacing:"0.05em",textTransform:"uppercase"}}>
          {loading?"⏳ Predicting…":"⚡ Predict Severity"}
        </button>
        {error&&<p style={{color:"#f85149",fontSize:"12px",background:"#da363320",padding:"10px",borderRadius:"7px",border:"1px solid #da363355"}}>{error}</p>}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:"14px"}}>
        {!result&&!loading&&<Card style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",minHeight:"400px",flexDirection:"column",gap:"16px"}}><div style={{fontSize:"60px"}}>🛡️</div><p style={{color:"#484f58",fontSize:"15px",textAlign:"center",maxWidth:"300px",lineHeight:1.6}}>Fill crash parameters and click <strong style={{color:"#3fb950"}}>Predict Severity</strong> to call the Python ML model.</p><p style={{color:"#3a3a3a",fontSize:"11px",fontFamily:"monospace"}}>{apiStatus==="online"?"✅ Connected to FastAPI backend":"⚠ API offline — demo mode active"}</p></Card>}
        {loading&&<Card style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",minHeight:"300px"}}><div style={{textAlign:"center"}}><div style={{fontSize:"40px",marginBottom:"12px"}}>⚙️</div><p style={{color:"#7d8590"}}>Calling Python ML model…</p></div></Card>}
        {result&&cfg&&(<>
          <Card style={{background:`linear-gradient(135deg,#0d1117,${SEV_BG[result.severity]})`}}>
            <div style={{display:"flex",alignItems:"center",gap:"20px",flexWrap:"wrap"}}>
              <div style={{flex:1}}>
                <div style={{fontSize:"11px",fontWeight:700,color:"#7d8590",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"4px"}}>Predicted Severity</div>
                <div style={{fontSize:"36px",fontWeight:900,color:cfg,letterSpacing:"-0.02em",fontFamily:"'Courier New',monospace"}}>{result.severity}</div>
                <div style={{fontSize:"12px",color:"#8b949e",marginTop:"4px"}}>Risk Score: <strong style={{color:cfg}}>{result.risk_score}</strong>/10 · Model: <strong style={{color:"#58a6ff"}}>{result.model_used}</strong></div>
              </div>
              <div style={{width:"84px",height:"84px",borderRadius:"50%",border:`4px solid ${cfg}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:SEV_BG[result.severity]}}>
                <div style={{fontSize:"22px",fontWeight:900,color:cfg,fontFamily:"monospace"}}>{result.confidence}%</div>
                <div style={{fontSize:"9px",color:"#7d8590",fontWeight:600}}>CONFIDENCE</div>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:"11px",fontWeight:700,color:"#7d8590",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"8px"}}>Risk Factors</div>
                {result.key_factors?.slice(0,4).map((f,i)=><div key={i} style={{display:"flex",alignItems:"flex-start",gap:"8px",marginBottom:"5px"}}><span style={{width:"6px",height:"6px",borderRadius:"50%",background:cfg,display:"inline-block",flexShrink:0,marginTop:"5px"}}/><span style={{fontSize:"12px",color:"#8b949e"}}>{f}</span></div>)}
              </div>
            </div>
          </Card>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px"}}>
            <Card>
              <STitle>Probability Breakdown</STitle>
              {SEV_ORDER.map(s=><div key={s} style={{marginBottom:"10px"}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:"3px"}}><span style={{fontSize:"12px",color:"#8b949e"}}>{s}</span><span style={{fontSize:"12px",fontWeight:700,color:SEV_COLOR[s]}}>{result.probabilities[s]||0}%</span></div><div style={{background:"#21262d",borderRadius:"4px",height:"6px"}}><div style={{width:`${result.probabilities[s]||0}%`,height:"100%",borderRadius:"4px",background:SEV_COLOR[s],transition:"width 0.8s ease"}}/></div></div>)}
            </Card>
            <Card>
              <STitle>Risk Radar</STitle>
              <ResponsiveContainer width="100%" height={160}>
                <RadarChart data={probData}><PolarGrid stroke="#21262d"/><PolarAngleAxis dataKey="subject" tick={{fontSize:10,fill:"#7d8590"}}/><Radar dataKey="value" stroke={cfg} fill={cfg} fillOpacity={0.25} strokeWidth={2}/></RadarChart>
              </ResponsiveContainer>
            </Card>
          </div>
          
        </>)}
      </div>
    </div>
  );
}

// ─── ANALYTICS PAGE ───────────────────────────────────────────────────────────
function AnalyticsPage() {
  const riskTable=[
    {factor:"Fog or mist",            total:5,    fatal:5,   fatalRate:pct(5,5)},
    {factor:"Rain and Windy",         total:22,   fatal:22,  fatalRate:pct(22,22)},
    {factor:"Drunk driving",          total:16,   fatal:15,  fatalRate:pct(15,16)},
    {factor:"Snow weather",           total:56,   fatal:40,  fatalRate:pct(40,56)},
    {factor:"No Licence drivers",     total:86,   fatal:70,  fatalRate:pct(70,86)},
    {factor:"Rollover collision",     total:405,  fatal:223, fatalRate:pct(223,405)},
    {factor:"Fall from vehicles",     total:33,   fatal:18,  fatalRate:pct(18,33)},
    {factor:"Driving at high speed",  total:169,  fatal:82,  fatalRate:pct(82,169)},
    {factor:"Darkness - lights unlit",total:36,   fatal:13,  fatalRate:pct(13,36)},
    {factor:"Overspeed",              total:74,   fatal:26,  fatalRate:pct(26,74)},
    {factor:"Darkness - no lighting", total:342,  fatal:69,  fatalRate:pct(69,342)},
    {factor:"With Train",             total:4,    fatal:2,   fatalRate:pct(2,4)},
  ].sort((a,b)=>b.fatalRate-a.fatalRate);

  return (
    <div style={{display:"flex",flexDirection:"column",gap:"18px"}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px"}}>
        <Card>
          <STitle sub="12,484 records">Driving Experience × Severity</STitle>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={REAL_DATA.Driving_experience} margin={{top:5,right:5,left:-20,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#21262d" vertical={false}/>
              <XAxis dataKey="name" tick={{fontSize:10,fill:"#7d8590"}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:10,fill:"#7d8590"}} axisLine={false} tickLine={false}/>
              <Tooltip content={<CTooltip/>}/>
              <Legend iconSize={8} formatter={v=><span style={{fontSize:"10px",color:"#8b949e"}}>{v}</span>}/>
              {SEV_ORDER.map(s=><Bar key={s} dataKey={s} stackId="a" fill={SEV_COLOR[s]} radius={s==="Fatal Injury"?[2,2,0,0]:undefined}/>)}
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <STitle sub="12,484 records">Junction Type × Severity</STitle>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={REAL_DATA.Types_of_Junction} margin={{top:5,right:5,left:-20,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#21262d" vertical={false}/>
              <XAxis dataKey="name" tick={{fontSize:10,fill:"#7d8590"}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:10,fill:"#7d8590"}} axisLine={false} tickLine={false}/>
              <Tooltip content={<CTooltip/>}/>
              <Legend iconSize={8} formatter={v=><span style={{fontSize:"10px",color:"#8b949e"}}>{v}</span>}/>
              {SEV_ORDER.map(s=><Bar key={s} dataKey={s} stackId="a" fill={SEV_COLOR[s]} radius={s==="Fatal Injury"?[2,2,0,0]:undefined}/>)}
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px"}}>
        <Card>
          <STitle sub="12,484 records">Road Surface × Severity</STitle>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={REAL_DATA.Road_surface_type} layout="vertical" margin={{top:0,right:10,left:0,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#21262d" horizontal={false}/>
              <XAxis type="number" tick={{fontSize:10,fill:"#7d8590"}} axisLine={false} tickLine={false}/>
              <YAxis type="category" dataKey="name" tick={{fontSize:9,fill:"#7d8590"}} axisLine={false} tickLine={false} width={120}/>
              <Tooltip content={<CTooltip/>}/>
              {SEV_ORDER.map(s=><Bar key={s} dataKey={s} stackId="a" fill={SEV_COLOR[s]}/>)}
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <STitle sub="12,484 records">Vehicle Movement × Severity</STitle>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={REAL_DATA.Vehicle_movement} layout="vertical" margin={{top:0,right:10,left:0,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#21262d" horizontal={false}/>
              <XAxis type="number" tick={{fontSize:10,fill:"#7d8590"}} axisLine={false} tickLine={false}/>
              <YAxis type="category" dataKey="name" tick={{fontSize:9,fill:"#7d8590"}} axisLine={false} tickLine={false} width={110}/>
              <Tooltip content={<CTooltip/>}/>
              {SEV_ORDER.map(s=><Bar key={s} dataKey={s} stackId="a" fill={SEV_COLOR[s]}/>)}
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px"}}>
        <Card>
          <STitle sub="12,484 records">Lanes / Medians × Severity</STitle>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={REAL_DATA.Lanes_or_Medians} layout="vertical" margin={{top:0,right:10,left:0,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#21262d" horizontal={false}/>
              <XAxis type="number" tick={{fontSize:10,fill:"#7d8590"}} axisLine={false} tickLine={false}/>
              <YAxis type="category" dataKey="name" tick={{fontSize:9,fill:"#7d8590"}} axisLine={false} tickLine={false} width={120}/>
              <Tooltip content={<CTooltip/>}/>
              {SEV_ORDER.map(s=><Bar key={s} dataKey={s} stackId="a" fill={SEV_COLOR[s]}/>)}
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <STitle sub="12,484 records">Educational Level × Severity</STitle>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={REAL_DATA.Educational_level} layout="vertical" margin={{top:0,right:10,left:0,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#21262d" horizontal={false}/>
              <XAxis type="number" tick={{fontSize:10,fill:"#7d8590"}} axisLine={false} tickLine={false}/>
              <YAxis type="category" dataKey="name" tick={{fontSize:9,fill:"#7d8590"}} axisLine={false} tickLine={false} width={120}/>
              <Tooltip content={<CTooltip/>}/>
              {SEV_ORDER.map(s=><Bar key={s} dataKey={s} stackId="a" fill={SEV_COLOR[s]}/>)}
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
      <Card>
        <STitle sub="Ranked by fatal rate — from dataset">Risk Factor Analysis</STitle>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:"12px"}}>
            <thead>
              <tr>{["Risk Factor","Total Cases","Fatal Count","Fatal Rate %","Risk Level","Visual"].map(h=><th key={h} style={{padding:"8px 12px",textAlign:"left",color:"#7d8590",fontWeight:600,borderBottom:"1px solid #21262d"}}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {riskTable.map((c,i)=>{
                const clr=c.fatalRate>80?SEV_COLOR["Fatal Injury"]:c.fatalRate>50?SEV_COLOR["Serious Injury"]:SEV_COLOR["Slight Injury"];
                const sev=c.fatalRate>80?"Fatal Injury":c.fatalRate>50?"Serious Injury":"Slight Injury";
                return(
                  <tr key={i} style={{borderBottom:"1px solid #161b22"}}>
                    <td style={{padding:"9px 12px",fontWeight:600,color:"#e6edf3"}}>{c.factor}</td>
                    <td style={{padding:"9px 12px",color:"#8b949e",fontFamily:"monospace"}}>{c.total}</td>
                    <td style={{padding:"9px 12px",color:"#f85149",fontFamily:"monospace"}}>{c.fatal}</td>
                    <td style={{padding:"9px 12px",fontWeight:700,color:clr,fontFamily:"monospace"}}>{c.fatalRate}%</td>
                    <td style={{padding:"9px 12px"}}><Badge sev={sev}/></td>
                    <td style={{padding:"9px 12px"}}><div style={{background:"#21262d",borderRadius:"4px",height:"7px",width:"150px"}}><div style={{width:`${Math.min(100,c.fatalRate)}%`,height:"100%",borderRadius:"4px",background:clr}}/></div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ─── DATASET PAGE ─────────────────────────────────────────────────────────────
function DatasetPage() {
  const [pg,setPg]=useState(0);
  const [flt,setFlt]=useState("All");
  const [srch,setSrch]=useState("");
  const PER=10;
  const filtered=SAMPLE_ROWS.filter(r=>flt==="All"||r.Accident_severity===flt).filter(r=>srch===""||Object.values(r).some(v=>String(v).toLowerCase().includes(srch.toLowerCase())));
  const pages=Math.max(1,Math.ceil(filtered.length/PER));
  const rows=filtered.slice(pg*PER,(pg+1)*PER);
  const cols=["Age_band_of_driver","Sex_of_driver","Driving_experience","Road_surface_type","Light_conditions","Weather_conditions","Type_of_collision","Cause_of_accident","Accident_severity"];
  const colStats=[
    {col:"Age_band_of_driver",      topVal:"18-30",                          topCount:4984},
    {col:"Sex_of_driver",           topVal:"Male",                           topCount:12389},
    {col:"Educational_level",       topVal:"Junior high school",             topCount:8286},
    {col:"Vehicle_driver_relation", topVal:"Employee",                       topCount:10380},
    {col:"Driving_experience",      topVal:"5-10yr",                         topCount:3462},
    {col:"Road_surface_type",       topVal:"Asphalt roads",                  topCount:11671},
    {col:"Light_conditions",        topVal:"Daylight",                       topCount:8328},
    {col:"Weather_conditions",      topVal:"Normal",                         topCount:10605},
    {col:"Type_of_collision",       topVal:"Vehicle with vehicle collision", topCount:8845},
    {col:"Cause_of_accident",       topVal:"No distancing",                  topCount:2100},
    {col:"Lanes_or_Medians",        topVal:"Divided broken lines",           topCount:4460},
    {col:"Types_of_Junction",       topVal:"Y Shape",                        topCount:5089},
    {col:"Vehicle_movement",        topVal:"Going straight",                 topCount:8452},
    {col:"Pedestrian_movement",     topVal:"Not a Pedestrian",               topCount:11832},
  ];
  return (
    <div style={{display:"flex",flexDirection:"column",gap:"14px"}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:"10px"}}>
        <StatCard icon="📋" label="Total Rows"    value="12,484" sub="RTA Dataset"              color="#58a6ff"/>
        <StatCard icon="📊" label="Columns"       value="15"     sub="14 features + target"         color="#3fb950"/>
        <StatCard icon="🔴" label="Fatal"         value="6,304"  sub={`${pct(6304,TOTAL)}% of data`}  color="#f85149"/>
        <StatCard icon="🟡" label="Serious"       value="3,581"  sub={`${pct(3581,TOTAL)}% of data`}  color="#f59e0b"/>
        <StatCard icon="🟢" label="Slight"        value="2,599"  sub={`${pct(2599,TOTAL)}% of data`}  color="#10b981"/>
      </div>
      <Card>
        <STitle sub="Most frequent value per column">Column Summary</STitle>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:"12px"}}>
            <thead><tr>{["Column","Most Common Value","Count","% of Total"].map(h=><th key={h} style={{padding:"8px 12px",textAlign:"left",color:"#7d8590",fontWeight:600,borderBottom:"1px solid #21262d"}}>{h}</th>)}</tr></thead>
            <tbody>{colStats.map((c,i)=>(
              <tr key={i} style={{borderBottom:"1px solid #161b22"}}>
                <td style={{padding:"8px 12px",fontWeight:600,color:"#58a6ff",fontFamily:"monospace"}}>{c.col}</td>
                <td style={{padding:"8px 12px",color:"#e6edf3"}}>{c.topVal}</td>
                <td style={{padding:"8px 12px",color:"#8b949e",fontFamily:"monospace"}}>{c.topCount.toLocaleString()}</td>
                <td style={{padding:"8px 12px",color:"#3fb950",fontFamily:"monospace"}}>{pct(c.topCount,TOTAL)}%</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </Card>
      <Card>
        <STitle sub="Sample records from dataset">Sample Records</STitle>
        <div style={{display:"flex",gap:"10px",flexWrap:"wrap",alignItems:"center",marginBottom:"12px"}}>
          <input value={srch} onChange={e=>{setSrch(e.target.value);setPg(0);}} placeholder="🔍 Search…" style={{flex:1,minWidth:"200px",background:"#161b22",border:"1px solid #30363d",borderRadius:"7px",color:"#e6edf3",fontSize:"13px",padding:"8px 12px",outline:"none"}}/>
          <div style={{display:"flex",gap:"5px"}}>{["All",...SEV_ORDER].map(s=><button key={s} onClick={()=>{setFlt(s);setPg(0);}} style={{padding:"6px 12px",borderRadius:"7px",border:"none",fontSize:"11px",fontWeight:700,cursor:"pointer",background:flt===s?(s==="All"?"#238636":SEV_BG[s]):"#21262d",color:flt===s?(s==="All"?"#3fb950":SEV_COLOR[s]):"#7d8590"}}>{s}</button>)}</div>
        </div>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:"11px"}}>
            <thead><tr style={{background:"#161b22"}}>{cols.map(c=><th key={c} style={{padding:"8px 10px",textAlign:"left",color:"#7d8590",fontWeight:600,borderBottom:"1px solid #21262d",whiteSpace:"nowrap"}}>{c.replace(/_/g," ")}</th>)}</tr></thead>
            <tbody>{rows.map((r,i)=><tr key={i} style={{borderBottom:"1px solid #161b22"}}>{cols.map(c=><td key={c} style={{padding:"7px 10px",whiteSpace:"nowrap",color:c==="Accident_severity"?"inherit":"#8b949e"}}>{c==="Accident_severity"?<Badge sev={r[c]}/>:r[c]}</td>)}</tr>)}</tbody>
          </table>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0 0"}}>
          <span style={{fontSize:"11px",color:"#484f58"}}>{filtered.length} records</span>
          <div style={{display:"flex",gap:"5px"}}>{Array.from({length:pages},(_,i)=><button key={i} onClick={()=>setPg(i)} style={{width:"28px",height:"28px",borderRadius:"5px",border:"none",fontSize:"11px",cursor:"pointer",background:i===pg?"#238636":"#21262d",color:i===pg?"#fff":"#7d8590"}}>{i+1}</button>)}</div>
        </div>
      </Card>
    </div>
  );
}

// ─── MODEL INFO PAGE ──────────────────────────────────────────────────────────
function ModelPage({apiMetrics}) {
  const models=apiMetrics?.all_models
    ?Object.entries(apiMetrics.all_models).map(([name,m])=>({
        name,
        accuracy:(m.accuracy*100).toFixed(1),
        f1:(m.macro_f1!=null?(m.macro_f1*100):(m.f1*100)).toFixed(1),
        auc:m.auc?.toFixed(3)||"—",
        bal_acc:m.balanced_acc!=null?(m.balanced_acc*100).toFixed(1):"—",
        selected:name===apiMetrics.best_model,
      }))
    :[{name:"Gradient Boosting",  accuracy:"—",f1:"—",auc:"—",bal_acc:"—",selected:true},
      {name:"Random Forest",      accuracy:"—",f1:"—",auc:"—",bal_acc:"—",selected:false},
      {name:"Logistic Regression",accuracy:"—",f1:"—",auc:"—",bal_acc:"—",selected:false},
      {name:"Decision Tree",      accuracy:"—",f1:"—",auc:"—",bal_acc:"—",selected:false}];

  const cm=apiMetrics?.confusion_matrix||null;
  const classes=apiMetrics?.classes||SEV_ORDER;
  const features=[
    ["Cause of accident",      "19 unique values"],
    ["Type of collision",      "9 types"],
    ["Vehicle movement",       "12 movement types"],
    ["Light conditions",       "4 levels"],
    ["Types of junction",      "7 junction types"],
    ["Driving experience",     "6 levels incl. No Licence"],
    ["Lanes / medians",        "6 road division types"],
    ["Weather conditions",     "8 weather types"],
    ["Age band of driver",     "4 age groups"],
    ["Road surface type",      "5 surface types"],
    ["Educational level",      "6 education levels"],
    ["Pedestrian movement",    "7 types"],
    ["Sex of driver",          "2 values — 99.2% Male"],
    ["Vehicle driver relation","3 values"],
  ];
  return (
    <div style={{display:"flex",flexDirection:"column",gap:"18px"}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:"12px"}}>
        <StatCard icon="📦" label="Dataset"    value="12,484" sub="RTA Dataset"               color="#58a6ff"/>
        <StatCard icon="🎓" label="Train Set"  value="9,987"  sub="80% stratified split"           color="#3fb950"/>
        <StatCard icon="🧪" label="Test Set"   value="2,497"  sub="20% holdout"                    color="#d2a8ff"/>
        <StatCard icon="📊" label="Features"   value="14"     sub="All categorical"                color="#ffa657"/>
        <StatCard icon="🏷️" label="Classes"    value="3"      sub="Slight / Serious / Fatal"       color="#f0883e"/>

      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"12px"}}>
        {[
          {label:"Fatal Injury",   count:6304, pct_val:50.5, color:SEV_COLOR["Fatal Injury"],   bg:SEV_BG["Fatal Injury"]},
          {label:"Serious Injury", count:3581, pct_val:28.7, color:SEV_COLOR["Serious Injury"], bg:SEV_BG["Serious Injury"]},
          {label:"Slight Injury",  count:2599, pct_val:20.8, color:SEV_COLOR["Slight Injury"],  bg:SEV_BG["Slight Injury"]},
        ].map(({label,count,pct_val,color,bg})=>(
          <Card key={label} style={{borderColor:color+"40",background:bg}}>
            <div style={{fontSize:"11px",fontWeight:700,color,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:"6px"}}>{label}</div>
            <div style={{fontSize:"26px",fontWeight:900,color,fontFamily:"monospace"}}>{count.toLocaleString()}</div>
            <div style={{background:"#21262d",borderRadius:"4px",height:"5px",margin:"8px 0"}}>
              <div style={{width:`${pct_val}%`,height:"100%",borderRadius:"4px",background:color}}/>
            </div>
            <div style={{fontSize:"11px",color}}>{pct_val}% of dataset</div>
          </Card>
        ))}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px"}}>
        <Card>
          <STitle sub="All 14 features">Feature Overview</STitle>
          {features.map(([f,p])=>(
            <div key={f} style={{display:"flex",gap:"8px",alignItems:"flex-start",marginBottom:"8px",padding:"6px 8px",background:"#161b22",borderRadius:"6px"}}>
              <span style={{fontSize:"11px",color:"#58a6ff",width:"150px",flexShrink:0,fontFamily:"monospace"}}>{f}</span>
              <span style={{fontSize:"10px",color:"#484f58"}}>{p}</span>
            </div>
          ))}
        </Card>
        <Card>
          <STitle>Model Comparison</STitle>
          {models.map(m=>(
            <div key={m.name} style={{background:m.selected?"#161b22":"#0d1117",border:`1px solid ${m.selected?"#238636":"#21262d"}`,borderRadius:"8px",padding:"10px 12px",marginBottom:"8px"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:"6px"}}>
                <span style={{fontSize:"12px",fontWeight:700,color:m.selected?"#3fb950":"#8b949e"}}>{m.selected?"★ ":""}{m.name}</span>
                <span style={{fontSize:"12px",fontWeight:700,color:m.selected?"#3fb950":"#7d8590",fontFamily:"monospace"}}>{m.accuracy}%</span>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"6px"}}>
                {[["Macro F1",m.f1+"%"],["AUC",m.auc],["Bal.Acc",m.bal_acc!=="—"?m.bal_acc+"%":"—"]].map(([k,v])=>(
                  <div key={k} style={{textAlign:"center"}}>
                    <div style={{fontSize:"12px",fontWeight:700,color:m.selected?"#e6edf3":"#7d8590",fontFamily:"monospace"}}>{v}</div>
                    <div style={{fontSize:"9px",color:"#484f58"}}>{k}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </Card>
      </div>

      {cm&&(
        <Card>
          <STitle sub={`${apiMetrics?.best_model||"Best Model"} — Test Set (2,497 samples)`}>Confusion Matrix</STitle>
          <div style={{overflowX:"auto"}}>
            <table style={{borderCollapse:"separate",borderSpacing:"4px",margin:"0 auto"}}>
              <thead><tr><th style={{color:"#484f58",fontSize:"10px",padding:"4px 8px"}}></th>{classes.map(s=><th key={s} style={{color:SEV_COLOR[s]||"#8b949e",fontSize:"10px",padding:"4px 12px",fontWeight:700}}>Pred: {s.split(" ")[0]}</th>)}</tr></thead>
              <tbody>{cm.map((row,ri)=>(
                <tr key={ri}>
                  <td style={{color:SEV_COLOR[classes[ri]]||"#8b949e",fontSize:"10px",fontWeight:700,padding:"4px 8px",whiteSpace:"nowrap"}}>Act: {classes[ri]?.split(" ")[0]}</td>
                  {row.map((v,ci)=>(
                    <td key={ci} style={{padding:"10px 18px",textAlign:"center",borderRadius:"6px",background:ri===ci?`${SEV_COLOR[classes[ri]]||"#58a6ff"}22`:"#161b22",border:`1px solid ${ri===ci?(SEV_COLOR[classes[ri]]||"#58a6ff")+"40":"#21262d"}`,fontSize:"15px",fontWeight:ri===ci?900:400,fontFamily:"monospace",color:ri===ci?SEV_COLOR[classes[ri]]||"#58a6ff":"#484f58"}}>{v}</td>
                  ))}
                </tr>
              ))}</tbody>
            </table>
          </div>
        </Card>
      )}

      <Card>
        <STitle>Tech Stack & Architecture</STitle>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:"12px"}}>
          {[
            ["🐍 Python Backend",  "scikit-learn, imbalanced-learn, XGBoost, joblib, pandas, numpy",          "train_model.py"],
            ["⚡ FastAPI Server",  "REST API, Pydantic validation, Swagger docs, batch prediction",  "api.py → localhost:8000"],
            ["⚛️ React Frontend",  "Recharts, responsive dashboard, real-time API calls", "App.jsx → localhost:5173"],
            ["🗄️ Dataset",         "RTA Dataset — 12,484 rows, 14 features, 3 severity classes",          "RTA_Dataset.csv"],
          ].map(([title,desc,file])=>(
            <div key={title} style={{background:"#161b22",borderRadius:"8px",padding:"14px",borderLeft:"3px solid #238636"}}>
              <div style={{fontSize:"13px",fontWeight:700,color:"#e6edf3",marginBottom:"4px"}}>{title}</div>
              <div style={{fontSize:"11px",color:"#8b949e",lineHeight:1.5,marginBottom:"6px"}}>{desc}</div>
              <div style={{fontSize:"10px",color:"#3fb950",fontFamily:"monospace"}}>{file}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page,setPage]=useState("dashboard");
  const [apiStatus,setApiStatus]=useState("checking");
  const [apiMetrics,setApiMetrics]=useState(null);
  useEffect(()=>{
    const check=async()=>{
      try{
        const r=await fetch(`${API_BASE}/health`,{signal:AbortSignal.timeout(3000)});
        if(r.ok){setApiStatus("online");const m=await fetch(`${API_BASE}/metrics`);if(m.ok)setApiMetrics(await m.json());}
        else setApiStatus("offline");
      }catch{setApiStatus("offline");}
    };
    check();const interval=setInterval(check,15000);return()=>clearInterval(interval);
  },[]);
  const pages={dashboard:<DashboardPage apiMetrics={apiMetrics}/>,predict:<PredictPage apiStatus={apiStatus}/>,analytics:<AnalyticsPage/>,dataset:<DatasetPage/>,model:<ModelPage apiMetrics={apiMetrics}/>};
  return (
    <div style={{display:"flex",minHeight:"100vh",background:"#010409",fontFamily:"'IBM Plex Mono','Courier New',monospace",color:"#e6edf3"}}>
      <style>{`*{box-sizing:border-box}::-webkit-scrollbar{width:6px;height:6px}::-webkit-scrollbar-track{background:#010409}::-webkit-scrollbar-thumb{background:#21262d;border-radius:3px}select option{background:#161b22}`}</style>
      <div style={{width:"64px",background:"#0d1117",borderRight:"1px solid #21262d",display:"flex",flexDirection:"column",alignItems:"center",padding:"16px 0",gap:"4px",flexShrink:0}}>
        <div style={{width:"36px",height:"36px",borderRadius:"10px",background:"linear-gradient(135deg,#238636,#3fb950)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"18px",marginBottom:"20px"}}>🚗</div>
        {NAV.map(n=><button key={n.id} onClick={()=>setPage(n.id)} title={n.label} style={{width:"42px",height:"42px",borderRadius:"10px",border:"none",cursor:"pointer",background:page===n.id?"#238636":"transparent",color:page===n.id?"#3fb950":"#484f58",fontSize:"18px",transition:"background 0.15s"}}>{n.icon}</button>)}
      </div>
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div style={{height:"52px",background:"#0d1117",borderBottom:"1px solid #21262d",display:"flex",alignItems:"center",padding:"0 20px",gap:"14px",flexShrink:0}}>
          <span style={{fontSize:"14px",fontWeight:700,color:"#e6edf3"}}>{NAV.find(n=>n.id===page)?.label}</span>
          <span style={{fontSize:"11px",color:"#484f58"}}>CrashSight Pro - Accident Severity Prediction App</span>
          <div style={{marginLeft:"auto",display:"flex",gap:"8px",alignItems:"center"}}><APIStatus status={apiStatus}/></div>
        </div>
        <div style={{flex:1,overflow:"auto",padding:"20px 24px"}}>
          <div style={{display:"flex",gap:"8px",marginBottom:"18px",borderBottom:"1px solid #21262d",paddingBottom:"14px"}}>
            {NAV.map(n=><button key={n.id} onClick={()=>setPage(n.id)} style={{padding:"6px 14px",borderRadius:"7px",border:"none",fontSize:"12px",fontWeight:700,cursor:"pointer",background:page===n.id?"#238636":"transparent",color:page===n.id?"#3fb950":"#484f58",borderBottom:page===n.id?"2px solid #3fb950":"2px solid transparent"}}>{n.label}</button>)}
          </div>
          {pages[page]}
        </div>
      </div>
    </div>
  );
}
