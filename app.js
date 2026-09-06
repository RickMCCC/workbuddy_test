const $ = (s) => document.querySelector(s);
const teams = ['产品','市场','工程','销售'];
let active = [...projects];
const today = new Date('2026-09-07');
function daysLate(date) { return Math.max(0, Math.round((today - new Date(date)) / 86400000)); }
function statusClass(s) { return s === '已完成' ? 'done' : s === '有风险' ? 'danger' : 'working'; }
function render() {
  const completed = active.filter(p => p.status === '已完成').length;
  const risks = active.filter(p => p.status === '有风险' || daysLate(p.due) > 0);
  const avg = Math.round(active.reduce((a,p) => a + p.progress, 0) / active.length || 0);
  $('#kpis').innerHTML = [
    ['活跃项目', active.length, `共 ${projects.length} 个模拟项目`], ['平均进度', `${avg}%`, '较上周 +6.2%'], ['高风险项目', risks.length, risks.length ? '需要立即跟进' : '当前无风险'], ['已完成', completed, `完成率 ${Math.round(completed / active.length * 100 || 0)}%`]
  ].map(([label,value,detail],i) => `<article class="kpi"><p>${label}</p><strong>${value}</strong><small class="${i===2&&risks.length?'red':''}">${detail}</small></article>`).join('');
  const group = teams.filter(t => active.some(p => p.team === t)).map(team => { const ps=active.filter(p=>p.team===team); return [team, Math.round(ps.reduce((a,p)=>a+p.progress,0)/ps.length)]; });
  $('#bar-chart').innerHTML = group.map(([team,value]) => `<div class="bar-row"><span>${team}</span><div class="track"><i style="width:${value}%"></i></div><b>${value}%</b></div>`).join('');
  $('#risks').innerHTML = risks.sort((a,b)=>daysLate(b.due)-daysLate(a.due)).slice(0,4).map(p => `<div class="risk"><span class="dot"></span><div><strong>${p.name}</strong><small>${p.team} · ${p.owner}</small></div><em>${daysLate(p.due) ? `逾期 ${daysLate(p.due)} 天` : '临近截止'}</em></div>`).join('') || '<p class="empty">没有符合条件的风险项目。</p>';
  $('#risk-count').textContent = `${risks.length} 项`;
  $('#table-summary').textContent = `${active.length} 个项目，覆盖 ${new Set(active.map(p=>p.team)).size} 个团队`;
  $('#project-table').innerHTML = active.map(p => `<tr><td><strong>${p.name}</strong></td><td>${p.team}</td><td>${p.owner}</td><td><div class="mini-progress"><i style="width:${p.progress}%"></i></div><span>${p.progress}%</span></td><td><span class="status ${statusClass(p.status)}">${p.status}</span></td><td>${p.due}</td></tr>`).join('');
}
function interpret() {
  const q = $('#query').value.trim();
  const team = teams.find(t => q.includes(t));
  const riskOnly = /风险|逾期/.test(q) && !/完成率|效率|进度/.test(q);
  active = team ? projects.filter(p => p.team === team) : [...projects];
  if (riskOnly) active = active.filter(p => p.status === '有风险' || daysLate(p.due) > 0);
  const metric = riskOnly ? '高风险任务' : q.includes('负载') ? '团队工作负载' : q.includes('趋势') ? '项目完成趋势' : '项目完成率与逾期风险';
  $('#interpretation').innerHTML = `已理解：<strong>Q3 · ${team || '全部团队'} · ${metric}</strong>`;
  $('#view-title').textContent = team ? `${team}团队交付健康度` : '团队交付健康度';
  $('#chart-title').textContent = riskOnly ? '风险项目的当前进度' : '各团队项目完成率';
  render();
}
$('#generate').addEventListener('click', interpret);
$('#query').addEventListener('keydown', e => { if(e.key === 'Enter') interpret(); });
document.querySelectorAll('.chips button').forEach(b => b.addEventListener('click', () => { $('#query').value = b.textContent; interpret(); }));
$('#reset').addEventListener('click', () => { $('#query').value='展示本季度各团队的项目完成率和逾期风险'; active=[...projects]; interpret(); });
render();
