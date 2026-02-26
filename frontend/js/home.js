/**
 * home.js
 * Logik für die Hauptseite — angepasst an Supabase Schema
 */

const SUPABASE_URL  = CONFIG.SUPABASE_URL;
const SUPABASE_ANON = CONFIG.SUPABASE_ANON;

// ── Demo-Daten ────────────────────────────────────────────────────────────────
const DEMO_EVENTS = [
  {
    id: 1,
    event_name: 'Candyflip x Wyldhearts',
    event_date: getDateStr(0),
    time_start: '23:00:00',
    time_end: '09:00:00',
    clubs: { name: 'Lokschuppen' },
    event_acts: [
      { start_time: '23:00:00', end_time: '01:00:00', sort_order: 1, acts: { name: 'DATSKO' } },
      { start_time: null,       end_time: null,        sort_order: 2, acts: { name: 'SZG' } },
      { start_time: null,       end_time: null,        sort_order: 3, acts: { name: 'BabaBass3000' } },
    ]
  }
];

// ── Utils ─────────────────────────────────────────────────────────────────────
function getDateStr(daysOffset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split('T')[0];
}

// "22:11:49" → "22:11"
function fmtTime(timeStr) {
  if (!timeStr) return null;
  return timeStr.slice(0, 5);
}

function formatDateLabel(dateStr) {
  const d       = new Date(dateStr + 'T00:00:00');
  const day     = String(d.getDate()).padStart(2, '0');
  const month   = String(d.getMonth() + 1).padStart(2, '0');
  const weekday = ['SO','MO','DI','MI','DO','FR','SA'][d.getDay()];
  return { day, month, weekday };
}

function formatTabLabel(dateStr) {
  const today    = getDateStr(0);
  const tomorrow = getDateStr(1);
  const d        = new Date(dateStr + 'T00:00:00');
  const weekdays = ['So','Mo','Di','Mi','Do','Fr','Sa'];
  if (dateStr === today)    return 'Heute';
  if (dateStr === tomorrow) return 'Morgen';
  return `${weekdays[d.getDay()]} ${d.getDate()}.${d.getMonth() + 1}.`;
}

function groupByDate(events) {
  const map = {};
  events.forEach(ev => {
    const key = ev.event_date;
    if (!map[key]) map[key] = [];
    map[key].push(ev);
  });
  return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
}

// ── State ─────────────────────────────────────────────────────────────────────
let allEvents     = [];
let activeDateIdx = 0;

// ── Render ────────────────────────────────────────────────────────────────────
function renderDateTabs(grouped) {
  const nav = document.getElementById('dateNav');
  nav.innerHTML = '';
  grouped.forEach(([dateStr], i) => {
    const btn = document.createElement('button');
    btn.className   = 'date-tab' + (i === activeDateIdx ? ' active' : '');
    btn.textContent = formatTabLabel(dateStr);
    btn.onclick = () => {
      activeDateIdx = i;
      renderAll();
    };
    nav.appendChild(btn);
  });
}

function renderEventCard(ev) {
  const acts      = (ev.event_acts || []).sort((a, b) => a.sort_order - b.sort_order);
  const hasTime   = acts.some(a => a.start_time);
  const venueName = ev.clubs?.name ?? '—';
  const doorsTime = fmtTime(ev.time_start);
  const closeTime = fmtTime(ev.time_end);

  const artistRows = acts.map(a => {
    const start = fmtTime(a.start_time);
    const end   = fmtTime(a.end_time);
    const timeLabel = start && end
      ? `${start} – ${end}`
      : start
        ? `ab ${start}`
        : null;

    return `
      <div class="artist-row">
        <span class="artist-name">${a.acts?.name ?? '?'}</span>
        ${timeLabel
          ? `<span class="artist-time confirmed">${timeLabel}</span>`
          : `<span class="time-unknown">TBA</span>`
        }
      </div>
    `;
  }).join('');

  return `
    <div class="event-card">
      <div class="card-header">
        <div class="event-name">${ev.event_name}</div>
        <div class="event-meta">
          <span class="venue-tag">${venueName}</span>
          ${doorsTime ? `<span class="doors-time">↳ ${doorsTime}${closeTime ? ' – ' + closeTime : ''}</span>` : ''}
          <span class="status-badge ${hasTime ? 'confirmed' : 'pending'}">
            <span class="status-dot"></span>
            ${hasTime ? 'Timetable' : 'Lineup'}
          </span>
        </div>
      </div>
      <div class="artist-list">
        <div class="artist-list-label">Artists</div>
        ${artistRows || '<span class="time-unknown">Noch keine Infos</span>'}
      </div>
    </div>
  `;
}

function renderAll() {
  const grouped = groupByDate(allEvents);
  renderDateTabs(grouped);

  const main = document.getElementById('mainContent');

  if (!grouped.length) {
    main.innerHTML = `<div class="empty-state"><span>Keine Events gefunden</span></div>`;
    return;
  }

  const [dateStr, events] = grouped[activeDateIdx] ?? grouped[0];
  const { day, month, weekday } = formatDateLabel(dateStr);

  main.innerHTML = `
    <div class="day-section">
      <div class="day-label">
        <div>
          <div class="weekday">${weekday}</div>
          ${day}.${month}
        </div>
      </div>
      <div class="day-divider"></div>
      ${events.length
        ? events.map(renderEventCard).join('')
        : '<div class="no-events">Keine Events an diesem Tag</div>'
      }
    </div>
  `;

  const updated = document.getElementById('lastUpdated');
  if (updated) {
    updated.textContent = 'Stand: ' + new Date().toLocaleTimeString('de-DE', {
      hour: '2-digit', minute: '2-digit'
    });
  }
}

// ── Supabase ──────────────────────────────────────────────────────────────────
async function loadFromSupabase() {
  const { createClient } = supabase;
  const client = createClient(SUPABASE_URL, SUPABASE_ANON);

  const { data, error } = await client
    .from('events')
    .select(`
      id,
      event_name,
      event_date,
      time_start,
      time_end,
      clubs ( name ),
      event_acts (
        start_time,
        end_time,
        sort_order,
        acts ( name )
      )
    `)
    .gte('event_date', getDateStr(0))
    .lte('event_date', getDateStr(14))
    .order('event_date');

  if (error) throw error;
  return data ?? [];
}

// ── Init ──────────────────────────────────────────────────────────────────────
async function init() {
  try {
    allEvents = await loadFromSupabase();
  } catch (err) {
    console.warn('Supabase Fehler, nutze Demo-Daten:', err.message);
    allEvents = DEMO_EVENTS;
  }
  renderAll();
}

init();