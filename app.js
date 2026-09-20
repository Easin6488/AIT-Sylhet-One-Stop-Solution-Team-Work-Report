
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

function esc(v){return String(v).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));}
function initials(name){return name.split(/\s+/).map(x=>x[0]).join('').slice(0,2).toUpperCase();}
function sum(key){return reportData.reduce((a,r)=>a+(Number(r[key])||0),0);}

function renderKpis(){
  const items=[
    ["Engineers",14,"Team size","♙"],["Resolved",reportTotals.resolved,"Tickets resolved","✓"],
    ["In Progress",reportTotals.inProgress,"Active tickets","↻"],["Forward",reportTotals.forward,"Forwarded tickets","→"],
    ["Ticket Work",reportTotals.ticketWork,"Reported total","▤"],["Call Work",reportTotals.callWork,"Reported total","☎"],
    ["Support Work",reportTotals.supportWork,"Reported total","⚙"],["Total Work",reportTotals.totalWork,"Reported total","★"]
  ];
  $("#kpis").innerHTML=items.map(x=>`<div class="kpi"><div class="kpi-icon">${x[3]}</div><div class="kpi-label">${x[0]}</div><div class="kpi-value">${x[1]}</div><div class="kpi-note">${x[2]}</div></div>`).join("");
}

const cols=[
  ["sl","SL."],["name","Engineer"],["resolved","Resolved"],["inProgress","In Progress"],["waiting","Waiting"],
  ["forward","Forward"],["inCall","In Call"],["outCall","Out Call"],["partnerEngSupport","Partner / Eng. Support"],
  ["physicalSupport","Physical Support"],["ticketWork","Ticket Work"],["callWork","Call Work"],["supportWork","Support Work"],["totalWork","Total Work"]
];

function tableHTML(rows){
  let h="<thead><tr>"+cols.map(c=>`<th>${c[1]}</th>`).join("")+"</tr></thead><tbody>";
  rows.forEach(r=>{
    const active=r.ticketWork>0 || r.callWork>0 || r.supportWork>0;
    h+="<tr>"+cols.map(([k])=>{
      if(k==="name") return `<td class="name-cell">${esc(r[k])}</td>`;
      if(k==="sl") return `<td>${r[k]}</td>`;
      if(["resolved","inProgress","waiting","forward","inCall","outCall","partnerEngSupport","physicalSupport"].includes(k))
        return `<td>${r[k]}</td>`;
      return `<td><span class="badge ${active?'good':'zero'}">${r[k]}</span></td>`;
    }).join("")+"</tr>";
  });
  h+=`<tr class="total-row">${cols.map(([k])=>{
    if(k==="sl") return "<td colspan=\"1\">Total</td>";
    if(k==="name") return "";
    return `<td>${reportTotals[k] ?? ""}</td>`;
  }).join("")}</tr></tbody>`;
  return h;
}
function renderTable(){
  const q=($("#search")?.value||"").toLowerCase().trim(), f=$("#activityFilter")?.value||"all";
  let rows=reportData.filter(r=>r.name.toLowerCase().includes(q));
  if(f==="active") rows=rows.filter(r=>r.ticketWork>0||r.callWork>0||r.supportWork>0);
  if(f==="zero") rows=rows.filter(r=>r.ticketWork===0&&r.callWork===0&&r.supportWork===0);
  $("#reportTable").innerHTML=tableHTML(rows);
  $("#monthlyTable").innerHTML=tableHTML(reportData);
}
function renderChart(){
  const max=Math.max(...reportData.map(r=>r.ticketWork),1);
  $("#barChart").innerHTML=reportData.map(r=>`<div class="bar-row"><div class="bar-name">${esc(r.name)}</div><div class="bar-track"><div class="bar-fill" style="width:${(r.ticketWork/max)*100}%"></div></div><div class="bar-value">${r.ticketWork}</div></div>`).join("");
}
function renderEngineers(){
  $("#engineerCards").innerHTML=reportData.map(r=>{
    const active=r.ticketWork>0||r.callWork>0||r.supportWork>0;
    return `<article class="engineer-card">
      <div class="eng-top"><div style="display:flex;align-items:center;gap:11px"><div class="avatar">${initials(r.name)}</div><div><div class="eng-name">${esc(r.name)}</div><div class="eng-status">${active?"ACTIVE":"NO ACTIVITY"}</div></div></div><b>#${r.sl}</b></div>
      <div class="eng-stats"><div class="mini"><span>Resolved</span><b>${r.resolved}</b></div><div class="mini"><span>In Progress</span><b>${r.inProgress}</b></div><div class="mini"><span>Forward</span><b>${r.forward}</b></div>
      <div class="mini"><span>Ticket Work</span><b>${r.ticketWork}</b></div><div class="mini"><span>Call Work</span><b>${r.callWork}</b></div><div class="mini"><span>Support Work</span><b>${r.supportWork}</b></div></div>
    </article>`;
  }).join("");
}
function exportCSV(){
  const header=cols.map(c=>c[1]);
  const lines=[header.join(",")];
  reportData.forEach(r=>lines.push(cols.map(([k])=>`"${String(r[k]).replaceAll('"','""')}"`).join(",")));
  lines.push(cols.map(([k])=>`"${k==="sl"?"Total":k==="name"?"":(reportTotals[k]??"")}"`).join(","));
  const blob=new Blob([lines.join("\n")],{type:"text/csv;charset=utf-8"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="Engineer_Daily_Work_Report_18-09-2026.csv";a.click();URL.revokeObjectURL(a.href);
  toast("CSV exported successfully");
}
function toast(msg){const t=$("#toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),1800)}
function switchView(view){
  $$(".view").forEach(x=>x.classList.add("hidden"));
  $(`#${view}View`).classList.remove("hidden");
  $$(".nav-item").forEach(x=>x.classList.toggle("active",x.dataset.view===view));
  $("#pageTitle").textContent=view==="dashboard"?"Daily Dashboard":view==="engineers"?"Engineers":"Monthly Summary";
  $("#sidebar").classList.remove("open");
}
document.addEventListener("DOMContentLoaded",()=>{
  renderKpis();renderTable();renderChart();renderEngineers();
  $$(".nav-item").forEach(b=>b.addEventListener("click",()=>switchView(b.dataset.view)));
  $("#search").addEventListener("input",renderTable);$("#activityFilter").addEventListener("change",renderTable);
  $("#csvBtn").addEventListener("click",exportCSV);$("#printBtn").addEventListener("click",()=>window.print());
  $("#menuBtn").addEventListener("click",()=>$("#sidebar").classList.toggle("open"));
});
