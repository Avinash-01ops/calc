(function () {
	"use strict";

	// Storage keys
	const STORAGE_KEY = "trip-logger:trips";

	// Elements
    const tabsContainer = document.getElementById("period-tabs");
    const statDistance = document.getElementById("stat-distance");
    const statReceived = document.getElementById("stat-received");
    const statFuel = document.getElementById("stat-fuel");
    const statProfit = document.getElementById("stat-profit");
    const statProfitPerKm = document.getElementById("stat-profit-per-km");
    const statFuelEst = document.getElementById("stat-fuel-est");
    const statFuelCostEst = document.getElementById("stat-fuel-cost-est");
    const tripsList = document.getElementById("trips");
    const fabAdd = document.getElementById("fab-add");
    const sheet = document.getElementById("sheet");
    const cancelBtn = document.getElementById("cancelBtn");
    const form = document.getElementById("trip-form");
    const tripDateInput = document.getElementById("tripDate");
    const kmReadingInput = document.getElementById("kmReading");
    const amountReceivedInput = document.getElementById("amountReceived");
    const fuelOdoInput = document.getElementById("fuelOdo");
    const fuelLitersInput = document.getElementById("fuelLiters");
    const fuelCostInput = document.getElementById("fuelCost");
    const entryTypeTabs = document.getElementById("entryTypeTabs");
    const tripFields = document.getElementById("tripFields");
    const fuelFields = document.getElementById("fuelFields");
    const toast = document.getElementById("toast");
    const topTabs = document.getElementById("top-tabs");
    const logsView = document.getElementById("logs-view");
    const analyticsView = document.getElementById("analytics");
    const rangeStart = document.getElementById("rangeStart");
    const rangeEnd = document.getElementById("rangeEnd");
    const applyRange = document.getElementById("applyRange");
    const chartAmount = document.getElementById("chartAmount");
    const chartKm = document.getElementById("chartKm");
    const chartFuel = document.getElementById("chartFuel");
    const efficiencyView = document.getElementById("efficiency");
    const efficiencyList = document.getElementById("efficiencyList");
    const logFilters = document.getElementById("logFilters");
    const logSort = document.getElementById("logSort");

	// Utilities
	function getTodayISO() {
		const d = new Date();
		return d.toISOString().slice(0, 10);
	}

	function parseNumber(value) {
		const n = Number(value);
		return Number.isFinite(n) ? n : 0;
	}

	function formatCurrency(n) {
		const formatter = new Intl.NumberFormat(undefined, { style: "currency", currency: "INR", maximumFractionDigits: 0 });
		try { return formatter.format(n || 0); } catch (_) { return `₹${Math.round(n || 0)}`; }
	}

    function formatKm(n) { return `${Math.round(n || 0)} km`; }
    function formatDDMMYY(iso) {
        if (!iso) return "";
        const [y,m,d] = iso.split('-');
        return `${d}${m}${String(y).slice(2)}`;
    }

    function formatWeekdayDDMMYY(iso) {
        const d = new Date(iso);
        const wd = d.toLocaleDateString(undefined, { weekday: 'short' });
        const dd = String(d.getDate()).padStart(2,'0');
        const mm = String(d.getMonth()+1).padStart(2,'0');
        const yy = String(d.getFullYear()).slice(2);
        return `${wd}, ${dd}-${mm}-${yy}`;
    }

	function showToast(message) {
		if (!toast) return;
		toast.textContent = message;
		toast.classList.add("show");
		clearTimeout(showToast._t);
		showToast._t = setTimeout(() => toast.classList.remove("show"), 1800);
	}

	// Data layer
	function loadTrips() {
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			return raw ? JSON.parse(raw) : [];
		} catch (_) { return []; }
	}

	function saveTrips(trips) {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
	}

    function getPreviousKm(trips) {
        if (!trips.length) return 0;
        return trips[trips.length - 1].km_reading || 0;
    }

    function getPreviousKmForDate(trips, dateStr) {
        const before = trips.filter(t => t.date <= dateStr && t.type !== 'fuel').sort((a,b) => a.date.localeCompare(b.date));
        if (!before.length) return 0;
        return before[before.length - 1].km_reading || 0;
    }

	// Compute period filters
	function isSameDay(dateStr, target = new Date()) {
		const d = new Date(dateStr);
		return d.getFullYear() === target.getFullYear() && d.getMonth() === target.getMonth() && d.getDate() === target.getDate();
	}

	function isSameWeek(dateStr, target = new Date()) {
		const d = new Date(dateStr);
		const t = new Date(target);
		// set to Monday
		const day = (t.getDay() + 6) % 7; // 0..6 with Monday=0
		const monday = new Date(t);
		monday.setDate(t.getDate() - day);
		monday.setHours(0,0,0,0);
		const sunday = new Date(monday);
		sunday.setDate(monday.getDate() + 6);
		sunday.setHours(23,59,59,999);
		return d >= monday && d <= sunday;
	}

	function isSameMonth(dateStr, target = new Date()) {
		const d = new Date(dateStr);
		return d.getFullYear() === target.getFullYear() && d.getMonth() === target.getMonth();
	}

    function summarize(trips) {
        const distance = trips.reduce((a, t) => a + (t.distance || 0), 0);
        const received = trips.reduce((a, t) => a + (t.amount_received || 0), 0);
        const fuel = trips.reduce((a, t) => a + (t.fuel_cost || 0), 0);
        const profit = received - fuel;
        const ppk = distance > 0 ? profit / distance : 0;
        const estFuelLiters = distance > 0 ? distance / 16 : 0;
        return { distance, received, fuel, profit, ppk, estFuelLiters };
    }

    function updateAnalytics(period) {
		const trips = loadTrips();
		let filtered = trips;
		if (period === "today") filtered = trips.filter(t => isSameDay(t.date));
		if (period === "week") filtered = trips.filter(t => isSameWeek(t.date));
		if (period === "month") filtered = trips.filter(t => isSameMonth(t.date));
		const s = summarize(filtered);
        if (statDistance) statDistance.textContent = formatKm(s.distance);
        if (statReceived) statReceived.textContent = formatCurrency(s.received);
        if (statFuel) statFuel.textContent = formatCurrency(s.fuel);
        if (statProfit) statProfit.textContent = formatCurrency(s.profit);
        if (statProfitPerKm) statProfitPerKm.textContent = formatCurrency(Math.round(s.ppk));
        if (statFuelEst) statFuelEst.textContent = `${(s.estFuelLiters).toFixed(1)} l`;
        if (statFuelCostEst) statFuelCostEst.textContent = formatCurrency(Math.round((s.estFuelLiters || 0) * 100));
        renderCharts(filtered);
	}

    function renderTrips() {
        let trips = loadTrips();
        const activeFilter = (document.querySelector('#logFilters .chip.active')?.dataset.filter) || 'all';
        const sortDir = logSort?.value || 'desc';
        if (activeFilter !== 'all') {
            trips = trips.filter(t => activeFilter === 'fuel' ? t.type === 'fuel' : t.type !== 'fuel');
        }
        trips.sort((a,b)=> a.date.localeCompare(b.date) || ((a.km_reading||0)-(b.km_reading||0)));
        if (sortDir === 'desc') trips.reverse();
        tripsList.innerHTML = "";
        trips.forEach((t, idx) => {
            const li = document.createElement("li");
            if (t.type === 'fuel') li.classList.add('fuel');
            const left = document.createElement("div");
            let meta = "";
            if (t.type === 'fuel') {
                meta = `Fuel ${t.fuel_liters || 0} l • at ${t.km_reading || 0}`;
            } else {
                meta = `${Math.round(t.distance || 0)} km • odometer ${t.km_reading}`;
            }
            const icon = t.type === 'fuel' ? '<span style="color:#ff6b6b">⛽</span>' : '<span style="color:#23c483">₹</span>';
            left.innerHTML = `<div>${icon} ${formatWeekdayDDMMYY(t.date)}</div><div class=\"trip-meta\">${meta}</div>`;
            const right = document.createElement("div");
            right.className = "trip-values";
            const mainAmt = t.type === 'fuel' ? (t.fuel_cost || 0) : (t.amount_received || 0);
            right.innerHTML = `<div>${formatCurrency(mainAmt)}</div>`;
            const actions = document.createElement("div");
            actions.className = "trip-actions";
            const editBtn = document.createElement("button"); editBtn.className = "icon-btn"; editBtn.setAttribute('aria-label','Edit'); editBtn.innerHTML = "✎";
            const delBtn = document.createElement("button"); delBtn.className = "icon-btn"; delBtn.setAttribute('aria-label','Delete'); delBtn.innerHTML = "🗑";
            actions.appendChild(editBtn); actions.appendChild(delBtn);
            li.appendChild(left);
            const rightWrap = document.createElement("div"); rightWrap.style.display = "flex"; rightWrap.style.alignItems = "center"; rightWrap.appendChild(right); rightWrap.appendChild(actions);
            li.appendChild(rightWrap);
            tripsList.appendChild(li);

            editBtn.addEventListener("click", () => openEditorFor(trips.length - 1 - idx));
            delBtn.addEventListener("click", () => deleteEntry(trips.length - 1 - idx));
        });
    }

    function openEditorFor(index) {
        const trips = loadTrips();
        const t = trips[index]; if (!t) return;
        openSheet(true);
        form.dataset.editIndex = String(index);
        if (t.type === 'fuel') {
            setEntryType('fuel');
            document.getElementById("sheet-title").textContent = "Edit Fuel";
            tripDateInput.value = t.date;
            fuelOdoInput.value = t.km_reading || 0;
            fuelLitersInput.value = t.fuel_liters || 0;
            fuelCostInput.value = t.fuel_cost || 0;
        } else {
            setEntryType('trip');
            document.getElementById("sheet-title").textContent = "Edit Trip";
            tripDateInput.value = t.date;
            kmReadingInput.value = t.km_reading;
            amountReceivedInput.value = t.amount_received;
            updatePrevAndPreview();
        }
    }

    function deleteEntry(index) {
        const trips = loadTrips();
        if (!trips[index]) return;
        if (!confirm("Delete this entry?")) return;
        trips.splice(index, 1);
        recomputeDistances(trips);
        saveTrips(trips);
        renderTrips();
        updateAnalytics(tabsContainer.querySelector(".tab.active")?.dataset.period || "today");
        showToast("Deleted");
    }

    function recomputeDistances(trips) {
        // Ensure distance = current - previous by date order asc
        trips.sort((a,b) => a.date.localeCompare(b.date) || ((a.km_reading||0) - (b.km_reading||0)));
        let lastTripOdo = 0;
        for (let i = 0; i < trips.length; i++) {
            if (trips[i].type === 'fuel') continue;
            trips[i].distance = Math.max(0, (trips[i].km_reading || 0) - (lastTripOdo || 0));
            lastTripOdo = trips[i].km_reading || lastTripOdo;
        }
        return trips;
    }

function openSheet(isEdit = false) {
    sheet.classList.remove("hidden");
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    if (!isEdit) {
        form.reset();
        delete form.dataset.editIndex;
        setEntryType('trip');
        document.getElementById("sheet-title").textContent = "Add Trip";
        tripDateInput.value = getTodayISO();
        updatePrevAndPreview();
    }
    setTimeout(() => { (form.dataset.entryType === 'fuel' ? fuelOdoInput : kmReadingInput).focus(); }, 0);
}
	function closeSheet() {
		sheet.classList.add("hidden");
		// restore scroll
		document.documentElement.style.overflow = "";
		document.body.style.overflow = "";
	}

	// Event listeners
	fabAdd.addEventListener("click", openSheet);
	cancelBtn.addEventListener("click", () => { closeSheet(); form.reset(); });
	sheet.addEventListener("click", (e) => { if (e.target === sheet) closeSheet(); });

    tabsContainer.addEventListener("click", (e) => {
		const btn = e.target.closest("button.tab");
		if (!btn) return;
		[...tabsContainer.querySelectorAll(".tab")].forEach(b => b.classList.remove("active"));
		btn.classList.add("active");
		const period = btn.dataset.period;
		localStorage.setItem("trip-logger:period", period);
		updateAnalytics(period);
	});

    // top tabs (Logs / Analytics / Efficiency)
    document.getElementById("top-tabs").addEventListener("click", (e) => {
        const btn = e.target.closest(".top-tab"); if (!btn) return;
        [...document.querySelectorAll(".top-tab")].forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const view = btn.dataset.view;
        if (view === "logs") {
            logsView.classList.remove("hidden"); analyticsView.classList.add("hidden"); efficiencyView.classList.add("hidden");
        } else if (view === "analytics") {
            analyticsView.classList.remove("hidden"); logsView.classList.add("hidden"); efficiencyView.classList.add("hidden");
        } else {
            efficiencyView.classList.remove("hidden"); logsView.classList.add("hidden"); analyticsView.classList.add("hidden");
            renderEfficiency();
        }
        localStorage.setItem("trip-logger:view", view);
    });

    function updatePrevAndPreview() {
        const trips = loadTrips();
        const date = (document.getElementById("tripDate").value || getTodayISO());
        const previousKm = getPreviousKmForDate(trips, date);
        const prevHint = document.getElementById("prevHint");
        const distancePreview = document.getElementById("distancePreview");
        if (prevHint) prevHint.textContent = previousKm ? `Prev: ${previousKm}` : "First entry";
        const kmReading = parseNumber(document.getElementById("kmReading").value);
        const dist = kmReading > 0 ? Math.max(0, kmReading - previousKm) : 0;
        if (distancePreview) distancePreview.textContent = kmReading ? `Distance: ${Math.round(dist)} km` : "";
    }

    document.getElementById("tripDate").addEventListener("change", updatePrevAndPreview);
    document.getElementById("kmReading").addEventListener("input", updatePrevAndPreview);
    function setEntryType(type) {
        [...entryTypeTabs.querySelectorAll('.etype')].forEach(b => b.classList.remove('active'));
        entryTypeTabs.querySelector(`[data-type="${type}"]`).classList.add('active');
        if (type === 'fuel') { fuelFields.classList.remove('hidden'); tripFields.classList.add('hidden'); }
        else { tripFields.classList.remove('hidden'); fuelFields.classList.add('hidden'); }
        form.dataset.entryType = type;
        document.getElementById("sheet-title").textContent = type === 'fuel' ? 'Add Fuel' : 'Add Trip';
    }
    entryTypeTabs.addEventListener('click', (e) => { const b = e.target.closest('.etype'); if (!b) return; setEntryType(b.dataset.type); });

    form.addEventListener("submit", (e) => {
		e.preventDefault();
		const trips = loadTrips();
        const date = (document.getElementById("tripDate").value || getTodayISO());
        const entryType = form.dataset.entryType || 'trip';
        let record = { date };
        if (entryType === 'fuel') {
            const fOdo = parseNumber(fuelOdoInput.value);
            const fLiters = parseNumber(fuelLitersInput.value);
            const fCost = parseNumber(fuelCostInput.value);
            if (fLiters <= 0) { alert('Please enter fuel in liters'); return; }
            if (fCost <= 0) { alert('Please enter fuel cost'); return; }
            record = { ...record, type: 'fuel', km_reading: fOdo || 0, fuel_liters: fLiters, fuel_cost: fCost };
        } else {
            const previousKm = getPreviousKmForDate(trips, date);
            const kmReading = parseNumber(document.getElementById("kmReading").value);
            const amountReceived = parseNumber(document.getElementById("amountReceived").value);
            if (kmReading <= 0 || kmReading < previousKm) { alert(`Odometer must be greater than previous (${previousKm}).`); return; }
            const distance = kmReading - previousKm;
            record = { ...record, type: 'trip', km_reading: kmReading, distance, amount_received: amountReceived, fuel_cost: 0, profit: amountReceived };
        }

        if (form.dataset.editIndex) {
            const idx = Number(form.dataset.editIndex);
            trips[idx] = record;
            delete form.dataset.editIndex;
        } else {
            trips.push(record);
        }
        // recompute after insert/update
        recomputeDistances(trips);
		saveTrips(trips);
		form.reset();
		closeSheet();
		renderTrips();
		const active = tabsContainer.querySelector(".tab.active")?.dataset.period || "today";
		updateAnalytics(active);
		showToast("Saved");
	});

    // Import/Export removed as requested

	// Keyboard shortcuts
	document.addEventListener("keydown", (e) => {
		if (!sheet.classList.contains("hidden")) {
			if (e.key === "Escape") {
				closeSheet();
			}
			if (e.key === "Enter" && e.target && e.target.tagName === "INPUT") {
				form.requestSubmit();
			}
		}
	});

    // date picker trigger
    const openDatePicker = document.getElementById('openDatePicker');
    if (openDatePicker) {
        openDatePicker.addEventListener('click', () => {
            tripDateInput.showPicker?.();
            tripDateInput.focus();
        });
    }

	// Initialize
    (function init() {
		renderTrips();
		const savedPeriod = localStorage.getItem("trip-logger:period") || "today";
		const btn = tabsContainer.querySelector(`[data-period="${savedPeriod}"]`);
		if (btn) {
			[...tabsContainer.querySelectorAll(".tab")].forEach(b => b.classList.remove("active"));
			btn.classList.add("active");
		}
		updateAnalytics(savedPeriod);
        document.getElementById("tripDate").value = getTodayISO();
        updatePrevAndPreview();
        const view = localStorage.getItem("trip-logger:view") || "logs";
        const vbtn = document.querySelector(`.top-tab[data-view="${view}"]`);
        if (vbtn) { [...document.querySelectorAll(".top-tab")].forEach(b=>b.classList.remove("active")); vbtn.classList.add("active"); }
        if (view === "analytics") { analyticsView.classList.remove("hidden"); logsView.classList.add("hidden"); }
        if (view === "efficiency") { efficiencyView.classList.remove("hidden"); logsView.classList.add("hidden"); analyticsView.classList.add("hidden"); renderEfficiency(); }
        // default custom range to this month
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0,10);
        const end = getTodayISO();
        if (rangeStart && rangeEnd) { rangeStart.value = start; rangeEnd.value = end; }
	})();

    // filters & sorting
    if (logFilters) {
        logFilters.addEventListener('click', (e) => {
            const b = e.target.closest('.chip'); if (!b) return;
            [...logFilters.querySelectorAll('.chip')].forEach(c => c.classList.remove('active'));
            b.classList.add('active');
            renderTrips();
        });
    }
    if (logSort) { logSort.addEventListener('change', renderTrips); }

    // Efficiency view
    function renderEfficiency() {
        const trips = loadTrips().slice().sort((a,b)=> a.date.localeCompare(b.date) || ((a.km_reading||0)-(b.km_reading||0)));
        const segments = [];
        let lastFuel = null;
        for (const t of trips) {
            if (t.type === 'fuel') {
                if (lastFuel && lastFuel.odo != null && t.km_reading != null) {
                    const km = Math.max(0, (t.km_reading||0) - (lastFuel.odo||0));
                    segments.push({
                        fromDate: lastFuel.date,
                        toDate: t.date,
                        km,
                        liters: t.fuel_liters || 0,
                        cost: t.fuel_cost || 0,
                        efficiency: (t.fuel_liters||0) > 0 ? km / t.fuel_liters : 0
                    });
                }
                lastFuel = { date: t.date, odo: t.km_reading||0 };
            }
        }
        efficiencyList.innerHTML = segments.map(s => `<li>
            <div><strong>${formatWeekdayDDMMYY(s.fromDate)} → ${formatWeekdayDDMMYY(s.toDate)}</strong></div>
            <div class="trip-meta">${Math.round(s.km)} km • ${s.liters.toFixed(1)} l • ₹${Math.round(s.cost)}</div>
            <div><strong>${s.efficiency.toFixed(1)} km/l</strong></div>
        </li>`).join('');
    }

    // custom range apply
    if (applyRange) {
        applyRange.addEventListener('click', () => {
            const s = rangeStart.value; const e = rangeEnd.value;
            if (!s || !e || s > e) { alert('Select a valid date range'); return; }
            const trips = loadTrips();
            const filtered = trips.filter(t => t.date >= s && t.date <= e);
            const summary = summarize(filtered);
            statDistance.textContent = formatKm(summary.distance);
            statReceived.textContent = formatCurrency(summary.received);
            statFuel.textContent = formatCurrency(summary.fuel);
            statProfit.textContent = formatCurrency(summary.profit);
            statProfitPerKm.textContent = formatCurrency(Math.round(summary.ppk));
            if (statFuelEst) statFuelEst.textContent = `${(summary.estFuelLiters).toFixed(1)} l`;
            renderCharts(filtered);
        });
    }

    // lightweight charts
    function renderMiniLine(canvas, points, color) {
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width = canvas.clientWidth; const h = canvas.height;
        ctx.clearRect(0,0,w,h);
        if (!points.length) return;
        const max = Math.max(...points, 1);
        const stepX = w / Math.max(points.length - 1, 1);
        ctx.strokeStyle = color; ctx.lineWidth = 2;
        ctx.beginPath();
        points.forEach((v,i) => {
            const x = i * stepX;
            const y = h - (v / max) * (h - 10) - 5;
            if (i === 0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
        });
        ctx.stroke();
    }

    function renderCharts(trips) {
        const map = new Map();
        trips.forEach(t => {
            const key = t.date;
            if (!map.has(key)) map.set(key, { amt:0, km:0, fuel:0 });
            const obj = map.get(key);
            if (t.type === 'fuel') { obj.fuel += (t.fuel_cost || 0); }
            else { obj.amt += (t.amount_received || 0); obj.km += (t.distance || 0); }
        });
        const keys = Array.from(map.keys()).sort();
        const amt = keys.map(k => map.get(k).amt);
        const km = keys.map(k => map.get(k).km);
        const fuel = keys.map(k => map.get(k).fuel);
        renderMiniLine(chartAmount, amt, '#4f8cff');
        renderMiniLine(chartKm, km, '#23c483');
        renderMiniLine(chartFuel, fuel, '#ff6b6b');
    }
})();


