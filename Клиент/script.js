const datetimeInput = document.getElementById("datetime");
const submitBtn = document.getElementById("submitBtn");
const serviceContainer = document.querySelector("section");

const allServices = [
    { name: "Основная мойка", price: 800 },
    { name: "Уборка салона", price: 500 },
    { name: "Полировка", price: 1200 },
    { name: "Химчистка", price: 2000 }
];

let selectedServices = new Set(["Основная мойка", "Уборка салона"]);

datetimeInput.addEventListener("change", validateForm);


function attachRemoveHandlers() {
    document.querySelectorAll(".remove-btn").forEach(btn => {
        btn.onclick = (e) => {
            const serviceEl = e.target.closest(".service");
            const name = serviceEl.dataset.name;

            selectedServices.delete(name);
            serviceEl.remove();

            validateForm();
        };
    });
}

attachRemoveHandlers();


const modal = document.getElementById("serviceModal");
const serviceList = document.getElementById("serviceList");
const addBtn = document.querySelector(".add-service");
const closeModalBtn = document.querySelector(".close-modal");

addBtn.addEventListener("click", () => {
    serviceList.innerHTML = "";

    const available = allServices.filter(s => !selectedServices.has(s.name));

    if (available.length === 0) {
        alert("Все услуги уже добавлены");
        return;
    }

    available.forEach(service => {
        const item = document.createElement("div");
        item.classList.add("modal-service");

        item.innerHTML = `
            <span>${service.name}</span>
            <span>${service.price} ₽</span>
        `;

        item.addEventListener("click", () => {
            addServiceToList(service);
            modal.style.display = "none";
        });

        serviceList.appendChild(item);
    });

    modal.style.display = "block";
});

closeModalBtn.addEventListener("click", () => {
    modal.style.display = "none";
});

window.addEventListener("click", (e) => {
    if (e.target === modal) {
        modal.style.display = "none";
    }
});

function addServiceToList(service) {
    selectedServices.add(service.name);

    const newService = document.createElement("div");
    newService.classList.add("service");
    newService.dataset.name = service.name;

    newService.innerHTML = `
        <span>${service.name}</span>
        <div>
            <span class="price">${service.price} ₽</span>
            <button class="remove-btn">×</button>
        </div>
    `;

    serviceContainer.insertBefore(
        newService,
        document.querySelector(".add-service")
    );

    attachRemoveHandlers();
    validateForm();
}

const BOOKING_DAYS_AHEAD = 14;

function validateDateTime() {
    const dateValue = datetimeInput.value;
    datetimeInput.classList.remove("input-error");

    if (!dateValue) {
        return { valid: false, error: "Выберите дату" };
    }

    const selectedDate = new Date(dateValue);
    const now = new Date();

    const maxDate = new Date();
    maxDate.setDate(now.getDate() + BOOKING_DAYS_AHEAD);

    if (selectedDate < now) {
        return { valid: false, error: "Дата не может быть в прошлом" };
    }

    if (selectedDate > maxDate) {
        return { valid: false, error: "Дата вне доступного окна бронирования" };
    }

    return { valid: true, error: "" };
}

function validateServices() {
    addBtn.classList.remove("service-error");
    if (selectedServices.size === 0) {
        return { valid: false, error: "Выберите хотя бы одну услугу" };
    }

    return { valid: true, error: "" };
}

function validateForm() {
    const dateCheck = validateDateTime();
    const serviceCheck = validateServices();

    const isValid = dateCheck.valid && serviceCheck.valid;

    if (isValid) {
        submitBtn.classList.add("active");
    } else {
        submitBtn.classList.remove("active");
    }
}

validateForm();

function showErrors() {
    const dateCheck = validateDateTime();
    const serviceCheck = validateServices();

    let errorMessage = "";

    if (!serviceCheck.valid) {
        errorMessage = serviceCheck.error;

        addBtn.classList.add("service-error");
    }
    
    if (!dateCheck.valid) {
        if (errorMessage) {
            errorMessage += "\n";
        }
        errorMessage += dateCheck.error;
        datetimeInput.classList.add("input-error");
    }

    if (errorMessage) {
        alert("Ошибка: \n" + errorMessage);
    }
}

submitBtn.addEventListener("click", () => {
    const dateCheck = validateDateTime();
    const serviceCheck = validateServices();

    if (!dateCheck.valid || !serviceCheck.valid) {
        showErrors();
        return;
    }

    alert("Вы успешно записаны!");
});