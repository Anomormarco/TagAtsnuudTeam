const API_BASE = "http://localhost:5000/api/v1";
const state = {
  page: "booking",
  selectedBookingId: null,
  currentUser: 1,
  latestAvailability: null,
};

const root = document.getElementById("root");

const statusBadge = (status) => {
  const normalized = status?.toUpperCase() || "UNKNOWN";
  const map = {
    PENDING: "badge pending",
    PAID: "badge paid",
    CANCELLED: "badge cancelled",
    COMPLETED: "badge completed",
  };
  return `<span class="${map[normalized] || "badge"}">${normalized}</span>`;
};

const setMessage = (text, type = "info") => {
  const messageBox = document.getElementById("message-box");
  if (!messageBox) return;
  messageBox.textContent = text;
  messageBox.className = `message ${type}`;
};

const clearMessage = () => {
  const messageBox = document.getElementById("message-box");
  if (messageBox) messageBox.textContent = "";
};

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("mn-MN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatInputValue = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const toApiDateTime = (value) => {
  if (!value) return "";
  return value.replace("T", " ") + ":00";
};

const apiFetch = async (path, options = {}) => {
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
    const json = await response.json();
    if (!response.ok || json.success === false) {
      throw new Error(json.message || `HTTP ${response.status}`);
    }
    return json;
  } catch (error) {
    throw new Error(error.message || "API алдаа гарлаа");
  }
};

const createNav = () => `
  <header class="header">
    <div class="brand">Hall Booking UI</div>
    <nav class="nav">
      <button id="nav-booking" class="nav-button" data-page="booking">Booking Form</button>
      <button id="nav-mybookings" class="nav-button" data-page="mybookings">My Bookings</button>
    </nav>
  </header>
`;

const renderApp = () => {
  root.innerHTML = `
    ${createNav()}
    <main class="container">
      <section id="message-box" class="message info"></section>
      <section id="page-content"></section>
    </main>
  `;

  document.getElementById("nav-booking").addEventListener("click", () => setPage("booking"));
  document.getElementById("nav-mybookings").addEventListener("click", () => setPage("mybookings"));
  setPage(state.page);
};

const setPage = (page) => {
  state.page = page;
  document.querySelectorAll(".nav-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.page === page);
  });
  renderPageContent();
  clearMessage();
};

const renderPageContent = () => {
  const container = document.getElementById("page-content");
  if (!container) return;
  if (state.page === "booking") {
    container.innerHTML = renderBookingPage();
    bindBookingPage();
  } else if (state.page === "mybookings") {
    container.innerHTML = renderMyBookingsPage();
    bindMyBookingsPage();
  }
};

const renderBookingPage = () => `
  <section class="page card">
    <h1>Booking Page</h1>
    <div class="form-grid">
      <label>Хэрэглэгчийн ID
        <input id="booking-user-id" type="number" min="1" value="${state.currentUser}" />
      </label>
      <label>Заал ID
        <select id="booking-hall-id">
          <option value="1">Заал 1</option>
          <option value="2">Заал 2</option>
          <option value="3">Заал 3</option>
        </select>
      </label>
      <label>Эхлэх цаг
        <input id="booking-start" type="datetime-local" />
      </label>
      <label>Дуусах цаг
        <input id="booking-end" type="datetime-local" />
      </label>
    </div>

    <div class="actions">
      <button id="check-availability" class="primary">Availability шалгах</button>
      <button id="confirm-booking" class="primary">Booking баталгаажуулах</button>
    </div>

    <section class="panel" id="availability-panel">
      <h2>Available Time</h2>
      <div id="availability-result" class="info-block">Эхлэх, дуусах цагийг оруулж "Availability шалгах" товчийг дарна уу.</div>
      <div id="slot-suggestions" class="slot-list"></div>
      <div id="availability-details"></div>
    </section>

    <section class="panel" id="booking-summary">
      <h2>Booking Confirm UI</h2>
      <div class="summary-card" id="booking-preview">
        <p>Хэрэглэгч ID: <strong>${state.currentUser}</strong></p>
        <p>Заал ID: <strong>1</strong></p>
        <p>Эхлэх: <strong>-</strong></p>
        <p>Дуусах: <strong>-</strong></p>
        <p>Төлбөр: <strong>-</strong></p>
        <p>Төлөв: <strong>${statusBadge("PENDING")}</strong></p>
      </div>
    </section>

    <section class="panel qa-panel">
      <h2>Booking flow final test</h2>
      <p>Тест гүйцэтгэхэд userId, hallId, start/end цагийг бөглөнө.</p>
      <div class="actions">
        <button id="run-booking-test" class="secondary">Booking Flow Test</button>
      </div>
      <pre id="booking-test-result" class="log"></pre>
    </section>
  </section>
`;

const renderMyBookingsPage = () => `
  <section class="page card">
    <h1>My Bookings Page</h1>
    <div class="form-grid">
      <label>Хэрэглэгчийн ID
        <input id="mybookings-user-id" type="number" min="1" value="${state.currentUser}" />
      </label>
      <label class="flex-bottom">
        <button id="fetch-bookings" class="primary">My bookings API татах</button>
      </label>
    </div>

    <section class="panel" id="bookings-list-panel">
      <h2>Миний захиалгууд</h2>
      <div id="bookings-list" class="booking-grid">Loading...</div>
    </section>

    <section class="panel" id="review-panel">
      <h2>Review Section</h2>
      <div id="selected-booking-review" class="info-block">Захиалга сонгоход review хэсэг бүртгээгдэх болно.</div>
      <div id="review-details"></div>
    </section>

    <section class="panel qa-panel">
      <h2>My bookings final test</h2>
      <div class="actions">
        <button id="run-mybookings-test" class="secondary">My Bookings Test</button>
      </div>
      <pre id="mybookings-test-result" class="log"></pre>
    </section>
  </section>
`;

const bindBookingPage = () => {
  document.getElementById("booking-user-id").addEventListener("input", (event) => {
    state.currentUser = Number(event.target.value) || 1;
    renderBookingPreview();
  });
  document.getElementById("booking-hall-id").addEventListener("change", renderBookingPreview);
  document.getElementById("booking-start").addEventListener("change", renderBookingPreview);
  document.getElementById("booking-end").addEventListener("change", renderBookingPreview);
  document.getElementById("check-availability").addEventListener("click", handleCheckAvailability);
  document.getElementById("confirm-booking").addEventListener("click", handleConfirmBooking);
  document.getElementById("run-booking-test").addEventListener("click", handleBookingFlowTest);
  renderBookingPreview();
};

const bindMyBookingsPage = () => {
  document.getElementById("mybookings-user-id").addEventListener("input", (event) => {
    state.currentUser = Number(event.target.value) || 1;
  });
  document.getElementById("fetch-bookings").addEventListener("click", fetchMyBookings);
  document.getElementById("run-mybookings-test").addEventListener("click", handleMyBookingsTest);
  fetchMyBookings();
};

const renderBookingPreview = () => {
  const hallId = document.getElementById("booking-hall-id")?.value || "1";
  const start = document.getElementById("booking-start")?.value || "";
  const end = document.getElementById("booking-end")?.value || "";
  const preview = document.getElementById("booking-preview");
  if (!preview) return;
  preview.innerHTML = `
    <p>Хэрэглэгч ID: <strong>${state.currentUser}</strong></p>
    <p>Заал ID: <strong>${hallId}</strong></p>
    <p>Эхлэх: <strong>${start ? formatDateTime(start) : "-"}</strong></p>
    <p>Дуусах: <strong>${end ? formatDateTime(end) : "-"}</strong></p>
    <p>Төлбөр: <strong>${start && end ? "Booking баталгаажуулсны дараа тооцогдоно" : "-"}</strong></p>
    <p>Төлөв: <strong>${statusBadge("PENDING")}</strong></p>
  `;
};

const handleCheckAvailability = async () => {
  clearMessage();
  const hallId = document.getElementById("booking-hall-id").value;
  const start = document.getElementById("booking-start").value;
  const end = document.getElementById("booking-end").value;
  const result = document.getElementById("availability-result");
  const slots = document.getElementById("slot-suggestions");
  const details = document.getElementById("availability-details");

  if (!hallId || !start || !end) {
    setMessage("Заавал заал, эхлэх ба дуусах цагийг бөглөнө үү.", "error");
    return;
  }

  try {
    const { data } = await apiFetch(`/halls/${hallId}/available-time?start_time=${encodeURIComponent(toApiDateTime(start))}&end_time=${encodeURIComponent(toApiDateTime(end))}`);
    state.latestAvailability = data;
    result.textContent = data.available ? "Энэ цаг боломжтой." : "Энэ цаг давхцаж байна.";
    result.className = data.available ? "info-block success" : "info-block error";

    details.innerHTML = `
      <div class="detail-row"><strong>Заал:</strong> ${hallId}</div>
      <div class="detail-row"><strong>Start:</strong> ${formatDateTime(start)}</div>
      <div class="detail-row"><strong>End:</strong> ${formatDateTime(end)}</div>
      <div class="detail-row"><strong>Booking count:</strong> ${data.bookings.length}</div>
    `;

    const slotButtons = generateAvailableSlots(data.bookings, start, end);
    if (slotButtons.length) {
      slots.innerHTML = `
        <h3>Сонгох боломжит цагийн слот</h3>
        <div class="slot-grid">${slotButtons.map((item) => `<button class="slot-button" data-start="${item.start}" data-end="${item.end}">${item.label}</button>`).join("")}</div>
      `;
      slots.querySelectorAll("button.slot-button").forEach((button) => {
        button.addEventListener("click", () => {
          document.getElementById("booking-start").value = button.dataset.start;
          document.getElementById("booking-end").value = button.dataset.end;
          renderBookingPreview();
          setMessage("Available slot сонгогдлоо.", "success");
        });
      });
    } else {
      slots.innerHTML = `<div class="info-block">Энэ хугацаанд тохирох сул слот олдсонгүй.</div>`;
    }
  } catch (error) {
    setMessage(error.message, "error");
    result.textContent = "Availability шалгах үед алдаа гарлаа.";
    result.className = "info-block error";
    slots.innerHTML = "";
    details.innerHTML = "";
  }
};

const generateAvailableSlots = (bookings, start, end) => {
  const selectedStart = new Date(start);
  const selectedEnd = new Date(end);
  if (Number.isNaN(selectedStart.getTime()) || Number.isNaN(selectedEnd.getTime()) || selectedStart >= selectedEnd) {
    return [];
  }

  const intervals = bookings
    .map((item) => ({
      start: new Date(item.start_time),
      end: new Date(item.end_time),
    }))
    .sort((a, b) => a.start - b.start);

  const candidateSlots = [];
  const stepMinutes = 60;
  let current = new Date(selectedStart);

  while (current.getTime() + stepMinutes * 60 * 1000 <= selectedEnd.getTime()) {
    const next = new Date(current.getTime() + stepMinutes * 60 * 1000);
    const overlaps = intervals.some((interval) => current < interval.end && next > interval.start);
    if (!overlaps) {
      candidateSlots.push({
        start: formatInputValue(current.toISOString()),
        end: formatInputValue(next.toISOString()),
        label: `${formatDateTime(current.toISOString())} - ${formatDateTime(next.toISOString())}`,
      });
    }
    current = new Date(current.getTime() + 30 * 60 * 1000);
  }

  return candidateSlots.slice(0, 8);
};

const handleConfirmBooking = async () => {
  clearMessage();
  const userId = Number(document.getElementById("booking-user-id").value);
  const hallId = document.getElementById("booking-hall-id").value;
  const start = document.getElementById("booking-start").value;
  const end = document.getElementById("booking-end").value;

  if (!userId || !hallId || !start || !end) {
    setMessage("Booking хийхийн тулд бүх талбарыг бөглөнө үү.", "error");
    return;
  }

  try {
    const { data } = await apiFetch("/bookings", {
      method: "POST",
      body: {
        user_id: userId,
        hall_id: Number(hallId),
        start_time: toApiDateTime(start),
        end_time: toApiDateTime(end),
      },
    });
    setMessage(`Booking амжилттай үүслээ: ID ${data.id}`, "success");
    document.getElementById("booking-preview").innerHTML += `<p class="success-note">Booking ID: ${data.id}</p>`;
    renderBookingPreview();
  } catch (error) {
    setMessage(error.message, "error");
  }
};

const fetchMyBookings = async () => {
  clearMessage();
  const userId = Number(document.getElementById("mybookings-user-id").value);
  if (!userId) {
    setMessage("Хэрэглэгчийн ID-г оруулна уу.", "error");
    return;
  }

  try {
    const { data } = await apiFetch(`/bookings/my?userId=${encodeURIComponent(userId)}`);
    renderBookingCards(data || []);
  } catch (error) {
    setMessage(error.message, "error");
    document.getElementById("bookings-list").innerHTML = "<div class=\"info-block error\">Захиалга татах үед алдаа гарлаа.</div>";
  }
};

const renderBookingCards = (bookings) => {
  const list = document.getElementById("bookings-list");
  if (!list) return;
  if (!Array.isArray(bookings) || bookings.length === 0) {
    list.innerHTML = `<div class="info-block">Таний ямар ч захиалга олдсонгүй.</div>`;
    return;
  }

  list.innerHTML = bookings
    .map((booking) => `
      <article class="booking-card">
        <div class="card-header">
          <div>
            <h3>${booking.hall_name || `Заал ${booking.hall_id}`}</h3>
            <div class="meta">${booking.hall_location || ""}</div>
          </div>
          <div>${statusBadge(booking.status)}</div>
        </div>
        <div class="card-body">
          <p><strong>Booking ID:</strong> ${booking.id}</p>
          <p><strong>Start:</strong> ${formatDateTime(booking.start_time)}</p>
          <p><strong>End:</strong> ${formatDateTime(booking.end_time)}</p>
          <p><strong>Price:</strong> ${booking.total_price ? booking.total_price + " ₮" : "-"}</p>
        </div>
        <div class="card-actions">
          <button class="secondary review-button" data-booking-id="${booking.id}">Review</button>
          ${booking.status === "PENDING" || booking.status === "PAID" ? `<button class="danger cancel-button" data-booking-id="${booking.id}">Cancel</button>` : ""}
        </div>
      </article>
    `)
    .join("");

  list.querySelectorAll(".cancel-button").forEach((button) => {
    button.addEventListener("click", (event) => {
      handleCancelBooking(Number(event.target.dataset.bookingId));
    });
  });
  list.querySelectorAll(".review-button").forEach((button) => {
    button.addEventListener("click", (event) => {
      const bookingId = Number(event.target.dataset.bookingId);
      state.selectedBookingId = bookingId;
      showReviewSection(bookingId);
    });
  });
};

const handleCancelBooking = async (bookingId) => {
  clearMessage();
  if (!confirm("Тийм ээ гэчихвэл энэ booking цуцлагдана.")) return;
  try {
    const { data } = await apiFetch(`/bookings/${bookingId}/cancel`, { method: "PATCH" });
    setMessage(`Booking ${bookingId} цуцлагдлаа.`, "success");
    fetchMyBookings();
    if (state.selectedBookingId === bookingId) showReviewSection(bookingId);
  } catch (error) {
    setMessage(error.message, "error");
  }
};

const showReviewSection = async (bookingId) => {
  const reviewContainer = document.getElementById("review-details");
  if (!reviewContainer) return;
  reviewContainer.innerHTML = `<div class="info-block">Review мэдээлэл ачаалж байна...</div>`;
  try {
    const { data } = await apiFetch(`/bookings/${bookingId}/reviews`);
    const reviewList = Array.isArray(data) && data.length > 0 ? data : [];
    reviewContainer.innerHTML = `
      <div class="selected-booking-summary">
        <p><strong>Сонгогдсон Booking ID:</strong> ${bookingId}</p>
      </div>
      <div class="review-grid">
        ${reviewList.length ? reviewList.map((review) => `<article class="review-card"><div><strong>${review.user_name || "Хэрэглэгч"}</strong> <span class="meta">(${review.rating}/5)</span></div><p>${review.comment}</p></article>`).join("") : `<div class="info-block">Review олдсонгүй.</div>`}
      </div>
      <form id="review-form" class="review-form">
        <h3>Review бичих</h3>
        <label>Rating
          <select id="review-rating">
            <option value="5">5 - Маш сайн</option>
            <option value="4">4 - Сайн</option>
            <option value="3">3 - Дунд</option>
            <option value="2">2 - Сайнгүй</option>
            <option value="1">1 - Муу</option>
          </select>
        </label>
        <label>Comment
          <textarea id="review-comment" rows="4" placeholder="Өөрийн сэтгэгдэлээ бичнэ үү..."></textarea>
        </label>
        <button type="button" class="primary" id="submit-review">Review илгээх</button>
      </form>
      <div class="actions"><button id="run-review-test" class="secondary">Review final test</button></div>
      <pre id="review-test-result" class="log"></pre>
    `;
    document.getElementById("submit-review").addEventListener("click", () => handleSubmitReview(bookingId));
    document.getElementById("run-review-test").addEventListener("click", () => handleReviewTest(bookingId));
  } catch (error) {
    reviewContainer.innerHTML = `<div class="info-block error">Review мэдээлэл татахад алдаа гарлаа: ${error.message}</div>`;
  }
};

const handleSubmitReview = async (bookingId) => {
  clearMessage();
  const rating = Number(document.getElementById("review-rating").value);
  const comment = document.getElementById("review-comment").value.trim();
  if (!rating || !comment) {
    setMessage("Review бичихэд бүгд талбар шаардлагатай.", "error");
    return;
  }
  try {
    await apiFetch(`/bookings/${bookingId}/reviews`, {
      method: "POST",
      body: {
        user_id: state.currentUser,
        rating,
        comment,
      },
    });
    setMessage("Review амжилттай илгээлээ.", "success");
    showReviewSection(bookingId);
  } catch (error) {
    setMessage(error.message, "error");
  }
};

const handleBookingFlowTest = async () => {
  const result = document.getElementById("booking-test-result");
  if (!result) return;
  result.textContent = "Тест эхлэж байна...";
  try {
    const userId = state.currentUser || 1;
    const hallId = 1;
    const now = new Date();
    const start = new Date(now.getTime() + 60 * 60 * 1000);
    const end = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const startInput = formatInputValue(start.toISOString());
    const endInput = formatInputValue(end.toISOString());

    const createResponse = await apiFetch("/bookings", {
      method: "POST",
      body: {
        user_id: userId,
        hall_id: hallId,
        start_time: toApiDateTime(startInput),
        end_time: toApiDateTime(endInput),
      },
    });
    const bookingId = createResponse.data.id;
    result.textContent = `Booking үүсгэлээ: ${bookingId}\n`;

    const myResponse = await apiFetch(`/bookings/my?userId=${encodeURIComponent(userId)}`);
    result.textContent += `My bookings татсан: ${myResponse.data.length} ширхэг\n`;

    const cancelResponse = await apiFetch(`/bookings/${bookingId}/cancel`, { method: "PATCH" });
    result.textContent += `Booking цуцлагдлаа: ${cancelResponse.data.status}\n`;

    await apiFetch(`/bookings/${bookingId}/reviews`, {
      method: "POST",
      body: {
        user_id: userId,
        rating: 5,
        comment: "Booking flow final test review.",
      },
    });
    result.textContent += "Review амжилттай илгээлээ.\n";
    setMessage("Booking flow final test амжилттай дууслаа.", "success");
  } catch (error) {
    result.textContent += `Алдаа: ${error.message}`;
    setMessage(error.message, "error");
  }
};

const handleMyBookingsTest = async () => {
  const result = document.getElementById("mybookings-test-result");
  if (!result) return;
  const userId = state.currentUser || 1;
  result.textContent = "My bookings тест эхэлж байна...";
  try {
    const { data } = await apiFetch(`/bookings/my?userId=${encodeURIComponent(userId)}`);
    result.textContent = `My bookings: ${data.length} ширхэг олдлоо.`;
    setMessage("My bookings final test амжилттай.", "success");
    renderBookingCards(data);
  } catch (error) {
    result.textContent = `Алдаа: ${error.message}`;
    setMessage(error.message, "error");
  }
};

const handleReviewTest = async (bookingId) => {
  const result = document.getElementById("review-test-result");
  if (!result) return;
  if (!bookingId) {
    result.textContent = "Аль нэг booking-ийг review хэсэгт сонгоно уу.";
    return;
  }
  result.textContent = "Review final test эхэлж байна...";
  try {
    await apiFetch(`/bookings/${bookingId}/reviews`, {
      method: "POST",
      body: {
        user_id: state.currentUser,
        rating: 4,
        comment: "Review final test.",
      },
    });
    result.textContent = "Review final test амжилттай илгээлээ.";
    setMessage("Review final test амжилттай дууслаа.", "success");
    showReviewSection(bookingId);
  } catch (error) {
    result.textContent = `Алдаа: ${error.message}`;
    setMessage(error.message, "error");
  }
};

window.addEventListener("DOMContentLoaded", renderApp);
