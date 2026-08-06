/* Booking widget for /book/.
   Two steps: choose a date + time, then enter details. Posts JSON to the
   /api/book Netlify function, which emails the practice.

   Office hours drive availability, so the calendar can never offer a slot
   the practice isn't open for. */

export const OFFICE = {
  // 0 = Sunday. Hourly slots; midday break on full days.
  slotsByDay: {
    1: ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM'],
    2: ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM'],
    3: ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM'],
    4: ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM'],
    5: ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM'],
  },
  daysAhead: 90,
};

export function bookingBody({ ic, esc, PRACTICE, addr }) {
  const field = (name, label, type, req, extra = '') => `
      <div class="mhb-field${type === 'textarea' ? ' mhb-field--full' : ''}" data-field="${name}">
        <label for="bk-${name}">${esc(label)}${req ? ' <span class="req" aria-hidden="true">*</span>' : ''}</label>
        ${type === 'textarea'
          ? `<textarea class="mhb-textarea" id="bk-${name}" name="${name}" ${extra}></textarea>`
          : `<input class="mhb-input" id="bk-${name}" name="${name}" type="${type}" ${req ? 'required' : ''} ${extra}>`}
        <p class="mhb-err" id="bk-${name}-err">Please complete this field.</p>
      </div>`;

  return `
<section class="mhb-book">
  <div class="mhb-book__inner">
    <div style="text-align:center;">
      <span class="mhb-book__pill"><span class="mhb-dot"></span> Accepting New Patients</span>
    </div>
    <div class="mhb-section-head">
      <h1 style="font-family:var(--oe-font-display);font-size:clamp(1.9rem,4vw,3rem);font-weight:800;color:var(--oe-navy);line-height:1.15;letter-spacing:-0.02em;margin-bottom:1rem;">Request Your Appointment</h1>
      <p class="mhb-section-sub">Pick a day and time that suits you and we'll take care of the rest. Same-week appointments are often available.</p>
    </div>

    <div class="mhb-book__notice">
      ${ic('warning')}
      <p><strong>This is a request, not a confirmed booking.</strong> A member of our team will call or text you shortly to confirm your spot. Please don't include medical details or Social Security numbers — for anything sensitive, call us at <a href="${PRACTICE.phoneHref}">${PRACTICE.phone}</a>.</p>
    </div>

    <ol class="mhb-steps" id="bk-steps">
      <li aria-current="step" data-step="1"><b>1</b> Date &amp; time</li>
      <li data-step="2"><b>2</b> Your details</li>
    </ol>

    <div class="mhb-book__card">
      <!-- Step 1 -->
      <div class="mhb-book__panel" id="bk-panel-1">
        <div class="mhb-book__pick">
          <div>
            <div class="mhb-cal__bar">
              <button class="mhb-cal__nav" type="button" id="bk-prev" aria-label="Previous month">${ic('chevron', 'mhb-rot-90')}</button>
              <span class="mhb-cal__month" id="bk-month" aria-live="polite">&nbsp;</span>
              <button class="mhb-cal__nav" type="button" id="bk-next" aria-label="Next month">${ic('chevron', 'mhb-rot-270')}</button>
            </div>
            <div class="mhb-cal__dows" aria-hidden="true">
              <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
            </div>
            <div class="mhb-cal__grid" id="bk-grid" role="group" aria-label="Choose an appointment date"></div>
            <p class="mhb-cal__legend"><span></span> Available — we're open Mon–Thu 8am–4pm, Fri 8am–12pm</p>
          </div>
          <div>
            <p class="mhb-slots__title" id="bk-slots-title">Choose a time</p>
            <div class="mhb-slots" id="bk-slots" role="group" aria-labelledby="bk-slots-title">
              <p class="mhb-slots__empty">Select a date to see available times.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 2 -->
      <div class="mhb-book__panel" id="bk-panel-2" hidden>
        <div class="mhb-book__panel-head">
          <button class="mhb-book__back" type="button" id="bk-back" aria-label="Back to date and time">${ic('chevron', 'mhb-rot-90')}</button>
          <div>
            <h2>Enter your details</h2>
            <p>We'll use these to confirm your appointment.</p>
          </div>
        </div>

        <div class="mhb-recap" id="bk-recap">
          <span>${ic('calendar')} <em id="bk-recap-date" style="font-style:normal;"></em></span>
          <span>${ic('clock')} <em id="bk-recap-time" style="font-style:normal;"></em></span>
        </div>

        <form id="bk-form" novalidate>
          <div class="mhb-fields">
            ${field('firstName', 'First name', 'text', true, 'autocomplete="given-name"')}
            ${field('lastName', 'Last name', 'text', true, 'autocomplete="family-name"')}
            ${field('phone', 'Phone', 'tel', true, 'autocomplete="tel" placeholder="(817) 555-0123"')}
            ${field('email', 'Email', 'email', true, 'autocomplete="email" placeholder="you@example.com"')}
            ${field('notes', 'Additional information', 'textarea', false, 'placeholder="Anything you\'d like us to know before your appointment? (please leave out medical details)"')}
          </div>

          <!-- Honeypot: hidden from people, tempting to bots -->
          <div style="position:absolute;left:-9999px;" aria-hidden="true">
            <label>Company <input name="company" tabindex="-1" autocomplete="off"></label>
          </div>

          <div class="mhb-consent">
            <input type="checkbox" id="bk-consent" name="consent">
            <label for="bk-consent">I agree to be contacted by ${esc(PRACTICE.name)} about this appointment request using the details above.</label>
          </div>

          <div class="mhb-book__submit">
            <button class="mhb-btn mhb-btn--teal" type="submit" id="bk-submit">${ic('calendar')} Request Appointment</button>
            <span class="mhb-book__submit-note">Or call <a href="${PRACTICE.phoneHref}">${PRACTICE.phone}</a></span>
          </div>
          <p class="mhb-form-error" id="bk-form-error" role="alert"></p>
        </form>
      </div>

      <!-- Success -->
      <div class="mhb-book__panel mhb-book__done" id="bk-panel-3" hidden>
        <div class="mhb-book__done-icon">${ic('check')}</div>
        <h2>Request received</h2>
        <p>Thank you — we've sent your request to our front desk. Someone will call or text you shortly to confirm. Nothing is booked until we speak with you.</p>
        <div class="mhb-recap">
          <span>${ic('calendar')} <em id="bk-done-date" style="font-style:normal;"></em></span>
          <span>${ic('clock')} <em id="bk-done-time" style="font-style:normal;"></em></span>
        </div>
        <p style="margin-top:1.5rem;font-size:0.875rem;">Need it sooner? Call <a href="${PRACTICE.phoneHref}"><strong>${PRACTICE.phone}</strong></a> — we're at ${esc(addr)}.</p>
      </div>
    </div>
  </div>
</section>`;
}

export function bookingScript(OFFICE_JSON) {
  return `<script>
(function () {
  var O = ${OFFICE_JSON};
  var grid = document.getElementById('bk-grid');
  if (!grid) return;
  var monthEl = document.getElementById('bk-month');
  var prev = document.getElementById('bk-prev');
  var next = document.getElementById('bk-next');
  var slotsEl = document.getElementById('bk-slots');
  var form = document.getElementById('bk-form');
  var steps = document.getElementById('bk-steps');
  var panels = [null, document.getElementById('bk-panel-1'), document.getElementById('bk-panel-2'), document.getElementById('bk-panel-3')];

  var FALLBACK_ERR = "We couldn't send your request just now. Please call (817) 920-0882 and we'll book you straight away.";
  var MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  var DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

  var today = new Date(); today.setHours(0,0,0,0);
  var minDate = new Date(today); minDate.setDate(minDate.getDate() + 1); // earliest is tomorrow
  var maxDate = new Date(today); maxDate.setDate(maxDate.getDate() + O.daysAhead);
  var view = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
  var chosenDate = null, chosenTime = null;

  var pad = function (n) { return (n < 10 ? '0' : '') + n; };
  var iso = function (d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
  var label = function (d) { return DAYS[d.getDay()] + ', ' + MONTHS[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear(); };
  var slotsFor = function (d) { return O.slotsByDay[d.getDay()] || []; };
  var bookable = function (d) { return d >= minDate && d <= maxDate && slotsFor(d).length > 0; };

  function goStep(n) {
    for (var i = 1; i <= 3; i++) if (panels[i]) panels[i].hidden = (i !== n);
    Array.prototype.forEach.call(steps.children, function (li) {
      var s = Number(li.getAttribute('data-step'));
      if (s < n) { li.setAttribute('data-done', 'true'); li.removeAttribute('aria-current'); }
      else if (s === n) { li.removeAttribute('data-done'); li.setAttribute('aria-current', 'step'); }
      else { li.removeAttribute('data-done'); li.removeAttribute('aria-current'); }
    });
    steps.hidden = (n === 3);
    var card = document.querySelector('.mhb-book__card');
    if (card && n > 1) card.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function renderMonth() {
    monthEl.textContent = MONTHS[view.getMonth()] + ' ' + view.getFullYear();
    grid.innerHTML = '';
    var first = new Date(view.getFullYear(), view.getMonth(), 1);
    var daysIn = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
    for (var b = 0; b < first.getDay(); b++) {
      var sp = document.createElement('span'); sp.className = 'mhb-cal__day is-empty'; grid.appendChild(sp);
    }
    for (var day = 1; day <= daysIn; day++) {
      var d = new Date(view.getFullYear(), view.getMonth(), day);
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'mhb-cal__day';
      btn.textContent = String(day);
      var ok = bookable(d);
      if (ok) {
        btn.setAttribute('data-available', 'true');
        btn.setAttribute('aria-label', label(d) + ' — available');
        btn.setAttribute('aria-pressed', chosenDate && iso(chosenDate) === iso(d) ? 'true' : 'false');
        btn.addEventListener('click', (function (dd) { return function () { pickDate(dd); }; })(d));
      } else {
        btn.disabled = true;
        btn.setAttribute('aria-label', label(d) + ' — unavailable');
      }
      grid.appendChild(btn);
    }
    prev.disabled = (view.getFullYear() === minDate.getFullYear() && view.getMonth() === minDate.getMonth());
    next.disabled = (view.getFullYear() === maxDate.getFullYear() && view.getMonth() === maxDate.getMonth());
  }

  function pickDate(d) {
    chosenDate = d; chosenTime = null;
    renderMonth();
    renderSlots();
  }

  function renderSlots() {
    slotsEl.innerHTML = '';
    if (!chosenDate) {
      slotsEl.innerHTML = '<p class="mhb-slots__empty">Select a date to see available times.</p>';
      return;
    }
    var list = slotsFor(chosenDate);
    var head = document.getElementById('bk-slots-title');
    head.textContent = 'Times on ' + MONTHS[chosenDate.getMonth()] + ' ' + chosenDate.getDate();
    list.forEach(function (t) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'mhb-slot';
      b.textContent = t;
      b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', function () {
        chosenTime = t;
        Array.prototype.forEach.call(slotsEl.querySelectorAll('.mhb-slot'), function (o) { o.setAttribute('aria-pressed', 'false'); });
        b.setAttribute('aria-pressed', 'true');
        document.getElementById('bk-recap-date').textContent = label(chosenDate);
        document.getElementById('bk-recap-time').textContent = t;
        setTimeout(function () { goStep(2); }, 160);
      });
      slotsEl.appendChild(b);
    });
  }

  prev.addEventListener('click', function () { view.setMonth(view.getMonth() - 1); renderMonth(); });
  next.addEventListener('click', function () { view.setMonth(view.getMonth() + 1); renderMonth(); });
  document.getElementById('bk-back').addEventListener('click', function () { goStep(1); });

  // ---- validation + submit ----
  function setInvalid(name, msg) {
    var wrap = form.querySelector('[data-field="' + name + '"]');
    if (!wrap) return;
    wrap.classList.add('is-invalid');
    var input = wrap.querySelector('input, textarea');
    if (input) input.setAttribute('aria-invalid', 'true');
    if (msg) wrap.querySelector('.mhb-err').textContent = msg;
  }
  function clearInvalid(name) {
    var wrap = form.querySelector('[data-field="' + name + '"]');
    if (!wrap) return;
    wrap.classList.remove('is-invalid');
    var input = wrap.querySelector('input, textarea');
    if (input) input.removeAttribute('aria-invalid');
  }
  ['firstName','lastName','phone','email'].forEach(function (n) {
    var el = form.elements[n];
    if (el) el.addEventListener('input', function () { clearInvalid(n); });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var errBox = document.getElementById('bk-form-error');
    errBox.classList.remove('is-shown');

    var v = {
      firstName: form.elements.firstName.value.trim(),
      lastName: form.elements.lastName.value.trim(),
      phone: form.elements.phone.value.trim(),
      email: form.elements.email.value.trim(),
      notes: form.elements.notes.value.trim(),
      company: form.elements.company.value,
      date: chosenDate ? iso(chosenDate) : '',
      dateLabel: chosenDate ? label(chosenDate) : '',
      time: chosenTime || ''
    };

    var bad = null;
    ['firstName','lastName','phone'].forEach(function (n) {
      if (!v[n]) { setInvalid(n); bad = bad || n; }
    });
    if (!/^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$/.test(v.email)) { setInvalid('email', 'Please enter a valid email address.'); bad = bad || 'email'; }
    if (v.phone && v.phone.replace(/\\D/g, '').length < 10) { setInvalid('phone', 'Please enter a 10-digit phone number.'); bad = bad || 'phone'; }
    if (!form.elements.consent.checked) {
      errBox.textContent = 'Please tick the box so we know it\\'s okay to contact you.';
      errBox.classList.add('is-shown');
      return;
    }
    if (bad) {
      var el = form.elements[bad];
      if (el && el.focus) el.focus();
      return;
    }
    if (!v.date || !v.time) { goStep(1); return; }

    var btn = document.getElementById('bk-submit');
    var original = btn.innerHTML;
    btn.disabled = true;
    btn.textContent = 'Sending…';

    fetch('/api/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(v)
    }).then(function (r) {
      // Read as text first: an infrastructure error returns an HTML page, and
      // r.json() would throw a parse error that is meaningless to a patient.
      return r.text().then(function (t) {
        var b = {};
        try { b = JSON.parse(t); } catch (e) { /* not JSON — fall through */ }
        return { ok: r.ok, body: b };
      });
    }).then(function (res) {
      if (!res.ok) throw new Error((res.body && res.body.error) || FALLBACK_ERR);
      document.getElementById('bk-done-date').textContent = v.dateLabel;
      document.getElementById('bk-done-time').textContent = v.time;
      goStep(3);
    }).catch(function (err) {
      btn.disabled = false;
      btn.innerHTML = original;
      // Never surface a raw exception — patients get an action they can take.
      var msg = err && err.message;
      errBox.textContent = (msg && msg.indexOf('JSON') === -1 && msg.indexOf('fetch') === -1)
        ? msg : FALLBACK_ERR;
      errBox.classList.add('is-shown');
    });
  });

  renderMonth();
  goStep(1);
})();
</script>`;
}
