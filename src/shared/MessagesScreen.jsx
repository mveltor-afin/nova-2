import { useState, useRef, useEffect } from "react";
import { T, Ico } from "./tokens";
import { Btn, Card } from "./primitives";

const MOCK_THREADS = [
  { id:"TH001", with:"John Watson",       role:"Broker",      avatar:"JW", case:"AFN-2026-00142", unread:2, lastMsg:"Can you confirm the ERC on the 5yr fixed?", lastTime:"10:32 AM", online:true },
  { id:"TH002", with:"Emma Roberts",      role:"Broker",      avatar:"ER", case:"AFN-2026-00135", unread:0, lastMsg:"Documents uploaded — please review.", lastTime:"Yesterday", online:false },
  { id:"TH003", with:"James Mitchell",    role:"Underwriter", avatar:"JM", case:"AFN-2026-00142", unread:1, lastMsg:"Credit decision: approved. See notes.", lastTime:"Yesterday", online:true },
  { id:"TH004", with:"Priya Patel",       role:"Finance",     avatar:"PP", case:"AFN-2026-00128", unread:0, lastMsg:"Disbursement confirmed for tomorrow.", lastTime:"2 Apr", online:false },
  { id:"TH005", with:"Sarah Chen",        role:"Admin",       avatar:"SC", case:null,             unread:0, lastMsg:"Team meeting moved to Thursday 3pm.", lastTime:"1 Apr", online:true },
  { id:"TH006", with:"Amir Hassan",       role:"Underwriter", avatar:"AH", case:"AFN-2026-00119", unread:3, lastMsg:"Referral case — can we discuss?", lastTime:"11:15 AM", online:true },
  { id:"TH007", with:"Tom Walker",        role:"Ops",         avatar:"TW", case:"AFN-2026-00139", unread:0, lastMsg:"KYC complete. Ready for UW.", lastTime:"31 Mar", online:false },
  { id:"TH008", with:"Nova AI",           role:"System",      avatar:"AI", case:null,             unread:1, lastMsg:"3 cases approaching SLA breach — see details.", lastTime:"9:00 AM", online:true },
];

const MOCK_MESSAGES = {
  TH001: [
    { id:1, from:"John Watson",  me:false, text:"Hi, quick question about the Mitchell case.", time:"10:28 AM" },
    { id:2, from:"John Watson",  me:false, text:"Can you confirm the ERC on the 5yr fixed? Client is asking before they commit.", time:"10:32 AM" },
    { id:3, from:"You",          me:true,  text:"Hi John — the ERC on the Afin Fix 5yr 75% is 5/4/3/2/1% over the fixed period.", time:"10:45 AM" },
    { id:4, from:"You",          me:true,  text:"So if they redeem in year 2, it's 4% of the outstanding balance.", time:"10:45 AM" },
    { id:5, from:"John Watson",  me:false, text:"Perfect, thanks. And what's the max overpayment allowance?", time:"10:48 AM" },
    { id:6, from:"You",          me:true,  text:"10% of the outstanding balance per year, penalty-free. Anything above triggers the ERC on the excess.", time:"10:50 AM" },
    { id:7, from:"John Watson",  me:false, text:"Great. I'll let the client know. They're likely to go with the 2yr fix instead.", time:"10:52 AM" },
    { id:8, from:"John Watson",  me:false, text:"Can you confirm the ERC on the 5yr fixed?", time:"10:32 AM" },
  ],
  TH003: [
    { id:1, from:"James Mitchell", me:false, text:"Reviewed AFN-2026-00142. Credit is clean, affordability passes stress test.", time:"3:15 PM" },
    { id:2, from:"James Mitchell", me:false, text:"Credit decision: approved. See notes.", time:"3:16 PM" },
    { id:3, from:"You",            me:true,  text:"Thanks James. I'll move it to offer stage.", time:"3:30 PM" },
  ],
  TH006: [
    { id:1, from:"Amir Hassan", me:false, text:"Hey, I've got the Robert Hughes referral (AFN-2026-00119).", time:"11:00 AM" },
    { id:2, from:"Amir Hassan", me:false, text:"Income is self-cert, LTV is within limits but affordability is borderline.", time:"11:05 AM" },
    { id:3, from:"Amir Hassan", me:false, text:"Referral case — can we discuss? I think we need to see 2 more years of SA302s.", time:"11:15 AM" },
  ],
  TH008: [
    { id:1, from:"Nova AI", me:false, text:"Good morning. Here's your daily briefing:", time:"9:00 AM" },
    { id:2, from:"Nova AI", me:false, text:"• 3 cases approaching SLA breach (AFN-00135, AFN-00119, AFN-00115)\n• 2 documents awaiting verification\n• 1 new broker submission overnight\n• Portfolio: all payments collected, no new arrears", time:"9:00 AM" },
    { id:3, from:"Nova AI", me:false, text:"Priority recommendation: AFN-00135 (David Chen) — KYC verification expires in 48 hours. If not completed, full re-check required.", time:"9:01 AM" },
  ],
};

export default function MessagesScreen() {
  const [activeThread, setActiveThread] = useState("TH001");
  const [threads, setThreads] = useState(MOCK_THREADS);
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [compose, setCompose] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [showNew, setShowNew] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [activeThread, messages]);

  const thread = threads.find(t => t.id === activeThread);
  const threadMsgs = messages[activeThread] || [];
  const filtered = threads.filter(t =>
    (filter === "All" || (filter === "Unread" && t.unread > 0) || (filter === "Cases" && t.case) || (filter === "System" && t.role === "System"))
    && (t.with.toLowerCase().includes(search.toLowerCase()) || (t.case||"").toLowerCase().includes(search.toLowerCase()))
  );

  const sendMsg = () => {
    if (!compose.trim()) return;
    const newMsg = { id: Date.now(), from:"You", me:true, text:compose, time:"Just now" };
    setMessages(prev => ({ ...prev, [activeThread]: [...(prev[activeThread]||[]), newMsg] }));
    setCompose("");
  };

  const totalUnread = threads.reduce((s,t) => s + t.unread, 0);

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:700, margin:0 }}>Messages</h1>
          <p style={{ margin:"4px 0 0", fontSize:13, color:T.textSecondary }}>{threads.length} conversations · {totalUnread} unread</p>
        </div>
        <Btn primary iconNode={Ico.plus(16)} onClick={() => setShowNew(true)}>New Message</Btn>
      </div>

      <div style={{ display:"flex", gap:0, height:"calc(100vh - 200px)", border:`1px solid ${T.border}`, borderRadius:14, overflow:"hidden", background:T.card }}>
        {/* Thread list */}
        <div style={{ width:320, borderRight:`1px solid ${T.border}`, display:"flex", flexDirection:"column", flexShrink:0 }}>
          {/* Search + filters */}
          <div style={{ padding:12, borderBottom:`1px solid ${T.border}` }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 12px", background:T.bg, borderRadius:8, border:`1px solid ${T.borderLight}`, marginBottom:8 }}>
              {Ico.search(14)}
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search messages..."
                style={{ border:"none", background:"transparent", outline:"none", fontSize:13, fontFamily:T.font, flex:1, color:T.text }} />
            </div>
            <div style={{ display:"flex", gap:4 }}>
              {["All","Unread","Cases","System"].map(f => (
                <span key={f} onClick={() => setFilter(f)}
                  style={{ padding:"4px 10px", borderRadius:6, fontSize:11, fontWeight:600, cursor:"pointer",
                    background:filter===f?T.primary:T.bg, color:filter===f?"#fff":T.textMuted }}>{f}</span>
              ))}
            </div>
          </div>
          {/* Threads */}
          <div style={{ flex:1, overflowY:"auto" }}>
            {filtered.map(t => (
              <div key={t.id} onClick={() => { setActiveThread(t.id); setThreads(prev => prev.map(x => x.id===t.id ? {...x, unread:0} : x)); }}
                style={{ display:"flex", gap:10, padding:"12px 14px", cursor:"pointer",
                  borderBottom:`1px solid ${T.borderLight}`,
                  background: t.id===activeThread ? T.primaryLight : t.unread>0 ? `${T.primary}06` : "transparent" }}>
                <div style={{ position:"relative", flexShrink:0 }}>
                  <div style={{ width:40, height:40, borderRadius:12,
                    background: t.role==="System" ? `linear-gradient(135deg,${T.primary},${T.accent})` : `linear-gradient(135deg,#6366F1,#8B5CF6)`,
                    display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, color:"#fff" }}>
                    {t.role==="System" ? Ico.sparkle(18) : t.avatar}
                  </div>
                  {t.online && <div style={{ position:"absolute", bottom:0, right:0, width:10, height:10, borderRadius:5, background:T.success, border:`2px solid ${T.card}` }} />}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:2 }}>
                    <span style={{ fontSize:13, fontWeight: t.unread>0?700:500, color:T.text }}>{t.with}</span>
                    <span style={{ fontSize:10, color:T.textMuted, flexShrink:0 }}>{t.lastTime}</span>
                  </div>
                  {t.case && <div style={{ fontSize:10, color:T.primary, fontWeight:600, marginBottom:2 }}>{t.case}</div>}
                  <div style={{ fontSize:12, color:T.textMuted, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{t.lastMsg}</div>
                </div>
                {t.unread > 0 && (
                  <div style={{ width:20, height:20, borderRadius:10, background:T.danger, color:"#fff", fontSize:10, fontWeight:700,
                    display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, alignSelf:"center" }}>{t.unread}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Chat area */}
        <div style={{ flex:1, display:"flex", flexDirection:"column" }}>
          {/* Chat header */}
          {thread && (
            <div style={{ padding:"12px 20px", borderBottom:`1px solid ${T.border}`, display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:36, height:36, borderRadius:10,
                background: thread.role==="System" ? `linear-gradient(135deg,${T.primary},${T.accent})` : `linear-gradient(135deg,#6366F1,#8B5CF6)`,
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:"#fff" }}>
                {thread.role==="System" ? Ico.sparkle(16) : thread.avatar}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, fontWeight:700, color:T.text }}>{thread.with}</div>
                <div style={{ fontSize:11, color:T.textMuted }}>
                  {thread.role}{thread.case ? ` · ${thread.case}` : ""}
                  {thread.online && <span style={{ color:T.success, marginLeft:8 }}>● Online</span>}
                </div>
              </div>
              <div style={{ display:"flex", gap:6 }}>
                {thread.case && <Btn small ghost>View Case</Btn>}
                <Btn small ghost iconNode={Ico.search(14)}>Search</Btn>
              </div>
            </div>
          )}

          {/* Messages */}
          <div style={{ flex:1, overflowY:"auto", padding:"16px 20px", background:T.bg }}>
            {threadMsgs.map((msg, i) => {
              const showAvatar = i===0 || threadMsgs[i-1].me !== msg.me;
              return (
                <div key={msg.id} style={{ display:"flex", justifyContent: msg.me ? "flex-end" : "flex-start", marginBottom: showAvatar ? 12 : 4 }}>
                  <div style={{ maxWidth:"70%" }}>
                    {showAvatar && !msg.me && (
                      <div style={{ fontSize:11, fontWeight:600, color:T.textMuted, marginBottom:4, marginLeft:4 }}>{msg.from}</div>
                    )}
                    <div style={{ padding:"10px 14px", borderRadius: msg.me ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                      background: msg.me ? `linear-gradient(135deg,${T.primary},${T.primaryDark})` : T.card,
                      color: msg.me ? "#fff" : T.text, fontSize:13, lineHeight:1.5,
                      boxShadow: msg.me ? "none" : "0 1px 3px rgba(0,0,0,0.04)",
                      border: msg.me ? "none" : `1px solid ${T.borderLight}`,
                      whiteSpace:"pre-wrap" }}>
                      {msg.text}
                    </div>
                    <div style={{ fontSize:10, color:T.textMuted, marginTop:3, textAlign: msg.me ? "right" : "left", paddingLeft:4, paddingRight:4 }}>{msg.time}</div>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Compose */}
          <div style={{ padding:"12px 16px", borderTop:`1px solid ${T.border}`, display:"flex", gap:10, alignItems:"flex-end" }}>
            <div style={{ flex:1, display:"flex", alignItems:"center", gap:8, padding:"10px 14px", background:T.bg, borderRadius:12, border:`1px solid ${T.border}` }}>
              <input value={compose} onChange={e=>setCompose(e.target.value)}
                onKeyDown={e => e.key==="Enter" && !e.shiftKey && (e.preventDefault(), sendMsg())}
                placeholder="Type a message..."
                style={{ flex:1, border:"none", background:"transparent", outline:"none", fontSize:13, fontFamily:T.font, color:T.text }} />
              <span style={{ cursor:"pointer", color:T.textMuted, display:"flex" }} title="Attach file">{Ico.upload(16)}</span>
            </div>
            <Btn primary onClick={sendMsg} iconNode={Ico.send(15)} style={{ borderRadius:12, padding:"10px 16px" }} />
          </div>
        </div>
      </div>

      {/* New message modal */}
      {showNew && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200 }}>
          <div style={{ background:T.card, borderRadius:16, padding:28, width:440, boxShadow:"0 8px 40px rgba(0,0,0,0.2)" }}>
            <div style={{ fontSize:16, fontWeight:700, marginBottom:16 }}>New Message</div>
            <div style={{ marginBottom:12 }}>
              <div style={{ fontSize:12, fontWeight:600, color:T.textSecondary, marginBottom:6 }}>To</div>
              <select style={{ width:"100%", padding:"10px 12px", borderRadius:8, border:`1px solid ${T.border}`, fontSize:13, fontFamily:T.font, background:T.card }}>
                <option>Select recipient...</option>
                {threads.filter(t=>t.role!=="System").map(t => <option key={t.id}>{t.with} ({t.role})</option>)}
              </select>
            </div>
            <div style={{ marginBottom:12 }}>
              <div style={{ fontSize:12, fontWeight:600, color:T.textSecondary, marginBottom:6 }}>Link to case (optional)</div>
              <input placeholder="e.g. AFN-2026-00142" style={{ width:"100%", padding:"10px 12px", borderRadius:8, border:`1px solid ${T.border}`, fontSize:13, fontFamily:T.font, boxSizing:"border-box" }} />
            </div>
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:12, fontWeight:600, color:T.textSecondary, marginBottom:6 }}>Message</div>
              <textarea rows={4} placeholder="Type your message..." style={{ width:"100%", padding:"10px 12px", borderRadius:8, border:`1px solid ${T.border}`, fontSize:13, fontFamily:T.font, resize:"vertical", boxSizing:"border-box" }} />
            </div>
            <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
              <Btn ghost onClick={() => setShowNew(false)}>Cancel</Btn>
              <Btn primary iconNode={Ico.send(14)} onClick={() => setShowNew(false)}>Send</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
