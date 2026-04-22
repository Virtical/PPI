const modal = document.getElementById("modal");

const discountInput = document.getElementById("discount");
const scheduleSelect = document.getElementById("schedule");
const startTimeInput = document.getElementById("startTime");
const endTimeInput = document.getElementById("endTime");
const serviceTypeSelect = document.getElementById("serviceType");
const saveBtn = document.getElementById("saveBtn");

function closeModal() {
    modal.style.display = "none";
}

// ===== ВАЛИДАЦИИ =====

function validateDiscount() {
    const value = discountInput.value;

    discountInput.classList.remove("input-error");

    if (value === "") {
        return { valid: false, error: "Введите размер скидки" };
    }

    const num = Number(value);

    if (num < 5) {
        return { valid: false, error: "Минимальная скидка 5%" };
    }

    if (num > 90) {
        return { valid: false, error: "Скидка не может быть больше 90%" };
    }

    return { valid: true };
}

function validateSchedule() {
    scheduleSelect.classList.remove("input-error");

    if (!scheduleSelect.value) {
        return { valid: false, error: "Выберите расписание" };
    }
    return { valid: true };
}

function validateTime() {
    const start = startTimeInput.value;
    const end = endTimeInput.value;
    const timeStartCheck = validateStartTime();
    const timeEndCheck = validateEndTime();

    if (timeStartCheck.valid && timeEndCheck.valid && start >= end) {
        return { valid: false, error: "Время начала должно быть меньше окончания" };
    }

    return { valid: true };
}

function validateStartTime() {
    const start = startTimeInput.value;
    startTimeInput.classList.remove("input-error");

    if (!start) {
        return { valid: false, error: "Укажите время начала" };
    }

    return { valid: true };
}

function validateEndTime() {
    const end = endTimeInput.value;
    endTimeInput.classList.remove("input-error");

    if (!end) {
        return { valid: false, error: "Укажите время окончания" };
    }

    return { valid: true };
}

function validateServiceType() {
    serviceTypeSelect.classList.remove("input-error");

    if (!serviceTypeSelect.value) {
        return { valid: false, error: "Выберите тип услуги" };
    }
    return { valid: true };
}

// ===== ОБЩАЯ ВАЛИДАЦИЯ =====

function validateForm() {
    const isValid =
        validateDiscount().valid &&
        validateSchedule().valid &&
        validateTime().valid &&
        validateStartTime().valid &&
        validateEndTime().valid &&
        validateServiceType().valid;

    if (isValid) {
        saveBtn.classList.add("active");
    } else {
        saveBtn.classList.remove("active");
    }
}

// ===== ПОКАЗ ОШИБОК =====

function showErrors() {
    const discountCheck = validateDiscount();
    const scheduleCheck = validateSchedule();
    const timeCheck = validateTime();
    const timeStartCheck = validateStartTime();
    const timeEndCheck = validateEndTime();
    const serviceTypeCheck = validateServiceType();

    let errorMessage = "";

    if (!discountCheck.valid) {
        discountInput.classList.add("input-error");
        errorMessage = discountCheck.error;
    } else if (!scheduleCheck.valid) {
        scheduleSelect.classList.add("input-error");
        errorMessage = scheduleCheck.error;
    } else if (!timeCheck.valid) {
        startTimeInput.classList.add("input-error");
        endTimeInput.classList.add("input-error");
        errorMessage = timeCheck.error;
    } else if (!timeStartCheck.valid) {
        startTimeInput.classList.add("input-error");
        errorMessage = timeStartCheck.error;
    } else if (!timeEndCheck.valid) {
        endTimeInput.classList.add("input-error");
        errorMessage = timeEndCheck.error;
    } else if (!serviceTypeCheck.valid) {
        serviceTypeSelect.classList.add("input-error");
        errorMessage = serviceTypeCheck.error;
    }

    if (errorMessage) {
        alert("Ошибка: " + errorMessage);
    }
}

// ===== СОБЫТИЯ =====

document.querySelectorAll("input, select").forEach(el => {
    el.addEventListener("change", validateForm);
});

saveBtn.addEventListener("click", () => {
    const isValid =
        validateDiscount().valid &&
        validateSchedule().valid &&
        validateTime().valid &&
        validateStartTime().valid &&
        validateEndTime().valid &&
        validateServiceType().valid;

    if (!isValid) {
        showErrors();
        return;
    }

    alert("Скидка добавлена!");
});

// инициализация
validateForm();