const $ = (id) => document.getElementById(id);
const STORAGE_KEY = "sbps_predictions_v1";
let predictions = loadPredictions();

function loadPredictions() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
  catch { return []; }
}
function savePredictions() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(predictions));
}
function showToast(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2600);
}

// Demo-only login. A real application must authenticate on a secure server.
$("loginForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const email = $("adminEmail").value.trim().toLowerCase();
  const password = $("adminPassword").value;
  if (email === "admin@sbps.com" && password === "Admin123") {
    $("loginError").textContent = "";
    $("loginScreen").classList.add("hidden");
    $("appScreen").classList.remove("hidden");
    renderDashboard();
    showToast("Welcome to your SBPS workspace.");
  } else {
    $("loginError").textContent = "Incorrect email or password. Please try the demo credentials.";
  }
});
$("togglePassword").addEventListener("click", () => {
  const field = $("adminPassword");
  const show = field.type === "password";
  field.type = show ? "text" : "password";
  $("togglePassword").textContent = show ? "Hide" : "Show";
});
$("logoutBtn").addEventListener("click", () => {
  $("appScreen").classList.add("hidden");
  $("loginScreen").classList.remove("hidden");
  $("adminPassword").value = "";
  $("loginError").textContent = "";
  showToast("You have signed out.");
});

function openView(view) {
  const names = {overview:"Overview", prediction:"Bug Prediction", history:"Prediction History"};
  ["overview","prediction","history"].forEach(name => $(name+"View").classList.toggle("hidden", name !== view));
  document.querySelectorAll(".nav-link[data-view]").forEach(btn => btn.classList.toggle("active", btn.dataset.view === view));
  $("breadcrumbTitle").textContent = names[view] || "Overview";
  $("sidebar").classList.remove("open");
  if (view === "overview") renderDashboard();
  if (view === "history") renderHistory();
}
document.querySelectorAll("[data-view]").forEach(btn => btn.addEventListener("click", () => openView(btn.dataset.view)));
document.querySelectorAll("[data-go]").forEach(btn => btn.addEventListener("click", () => openView(btn.dataset.go)));
$("menuToggle").addEventListener("click", () => $("sidebar").classList.add("open"));
$("closeSidebar").addEventListener("click", () => $("sidebar").classList.remove("open"));

function riskClass(score) {
  return score >= 65 ? "High" : score >= 35 ? "Medium" : "Low";
}
function renderDashboard() {
  const total = predictions.length;
  const high = predictions.filter(p => p.risk === "High").length;
  const medium = predictions.filter(p => p.risk === "Medium").length;
  const low = predictions.filter(p => p.risk === "Low").length;
  const avg = total ? Math.round(predictions.reduce((sum,p) => sum + p.score, 0) / total) : null;
  $("totalPredictions").textContent = total;
  $("highRiskCount").textContent = high;
  $("lowRiskCount").textContent = low;
  $("averageRisk").innerHTML = avg === null ? "—<small>%</small>" : `${avg}<small>%</small>`;
  $("donutTotal").textContent = total;
  $("legendHigh").textContent = high;
  $("legendMedium").textContent = medium;
  $("legendLow").textContent = low;
  const h = total ? high/total*100 : 0, m = total ? medium/total*100 : 0;
  $("riskDonut").style.background = `conic-gradient(#e65c6c 0 ${h}%, #eab04b ${h}% ${h+m}%, #28b487 ${h+m}% 100%)`;
  $("recentTable").innerHTML = tableMarkup(predictions.slice(0,5), "No predictions yet. Run your first analysis to see it here.");
}
function tableMarkup(rows, emptyText) {
  if (!rows.length) return `<div class="empty-state">${emptyText}</div>`;
  return `<div class="table-wrap"><table><thead><tr><th>PROJECT / MODULE</th><th>RISK LEVEL</th><th>RISK SCORE</th><th>DATE</th></tr></thead><tbody>${rows.map(p => `<tr><td>${escapeHTML(p.name)}</td><td><span class="risk-pill ${p.risk}">${p.risk}</span></td><td>${p.score}%</td><td>${formatDate(p.date)}</td></tr>`).join("")}</tbody></table></div>`;
}
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
}
function formatDate(date) {
  return new Date(date).toLocaleDateString(undefined, {day:"2-digit", month:"short", year:"numeric"});
}

// Transparent heuristic for front-end demonstration only; replace with the trained ML model API.
function calculateDemoRisk(metrics) {
  let score = 12;
  score += Math.min(metrics.loc / 5000, 18);
  score += Math.min(metrics.complexity * 1.05, 24);
  score += Math.min(metrics.churn / 35, 18);
  score += Math.min(metrics.previousBugs * 3.2, 20);
  score += (100 - metrics.coverage) * 0.19;
  score -= Math.min(metrics.experience * 1.5, 9);
  score = Math.max(2, Math.min(98, Math.round(score)));
  return score;
}
$("predictionForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const metrics = {
    loc: Number($("loc").value),
    complexity: Number($("complexity").value),
    churn: Number($("churn").value),
    previousBugs: Number($("previousBugs").value),
    coverage: Number($("coverage").value),
    experience: Number($("experience").value)
  };
  if (Object.values(metrics).some(value => !Number.isFinite(value)) ||
      metrics.loc < 1 || metrics.complexity < 1 || metrics.churn < 0 ||
      metrics.previousBugs < 0 || metrics.coverage < 0 || metrics.coverage > 100 ||
      metrics.experience < 0) {
    showToast("Please enter valid software metrics.");
    return;
  }
  const score = calculateDemoRisk(metrics);
  const risk = riskClass(score);
  const record = {
    id: Date.now(),
    name: $("projectName").value.trim(),
    score, risk, date: new Date().toISOString(), metrics
  };
  predictions.unshift(record);
  savePredictions();
  renderDashboard();
  renderResult(record);
  showToast("Prediction completed and saved.");
});
$("predictionForm").addEventListener("reset", () => {
  $("resultPanel").classList.add("hidden");
});

function renderResult(record) {
  const panel = $("resultPanel");
  const color = record.risk === "High" ? "#e65c6c" : record.risk === "Medium" ? "#eab04b" : "#28b487";
  const tips = record.risk === "High"
    ? ["Review complex functions and split large modules into smaller units.","Increase automated test coverage, especially around changed code.","Investigate previously reported bugs and perform regression testing."]
    : record.risk === "Medium"
    ? ["Review code changes and test the most frequently modified areas.","Improve test coverage where possible.","Keep monitoring complexity and previously reported defects."]
    : ["Continue regular code reviews and automated testing.","Maintain current test coverage as the codebase grows.","Monitor future changes to keep the risk low."];
  panel.innerHTML = `<div class="result-header"><div><h3>Prediction result</h3><p>Analysis completed for ${escapeHTML(record.name)}</p></div><span class="risk-pill ${record.risk}">${record.risk} risk</span></div>
    <div class="result-score-row"><div class="score-circle" style="background:conic-gradient(${color} 0 ${record.score}%,#edf1f7 ${record.score}% 100%)"><strong>${record.score}%</strong></div><div class="result-risk"><h4 style="color:${color}">${record.risk} Bug Risk</h4><p>Estimated risk score based on the submitted software metrics.</p></div></div>
    <div class="recommendations"><b>Recommended next steps</b><ul>${tips.map(t => `<li>${t}</li>`).join("")}</ul></div>
    <p class="disclaimer">Demo estimate only — this score is generated by a rule-based JavaScript formula, not by your trained machine-learning model.</p>`;
  panel.classList.remove("hidden");
  panel.scrollIntoView({behavior:"smooth", block:"nearest"});
}

function renderHistory() {
  const query = $("historySearch").value.trim().toLowerCase();
  const filter = $("riskFilter").value;
  const filtered = predictions.filter(p => p.name.toLowerCase().includes(query) && (filter === "all" || p.risk === filter));
  $("historyTable").innerHTML = tableMarkup(filtered, "No matching predictions found.");
}
$("historySearch").addEventListener("input", renderHistory);
$("riskFilter").addEventListener("change", renderHistory);
$("exportBtn").addEventListener("click", () => {
  if (!predictions.length) { showToast("There are no predictions to export yet."); return; }
  const headers = ["Project","Risk Level","Risk Score","Date","LOC","Complexity","Code Churn","Previous Bugs","Test Coverage","Developer Experience"];
  const rows = predictions.map(p => [p.name,p.risk,p.score,formatDate(p.date),p.metrics.loc,p.metrics.complexity,p.metrics.churn,p.metrics.previousBugs,p.metrics.coverage,p.metrics.experience]);
  const csv = [headers,...rows].map(row => row.map(value => `"${String(value).replace(/"/g,'""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], {type:"text/csv;charset=utf-8;"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = "SBPS_Prediction_History.csv"; a.click();
  URL.revokeObjectURL(url);
  showToast("Prediction history exported.");
});
