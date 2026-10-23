
document.addEventListener("DOMContentLoaded", function () {

    // =========================================
    // ESH KALKULATOR
    // =========================================

    const steps = document.querySelectorAll(".calculator-step");
    const result = document.querySelector(".calculator-result");
    const loadingSection = document.getElementById("calculator-loading");

    const progressSteps = document.querySelectorAll(".progress-step");
    const progressLines = document.querySelectorAll(".progress-line");

    let currentCalculation = null;
    let calculationInProgress = false;

    // =========================================
    // PRIKAZ KORAKA
    // =========================================

    function showStep(index) {

        if (loadingSection) {
            loadingSection.classList.remove("active");
        }

        steps.forEach(function (step) {
            step.classList.remove("active");
        });

        if (steps[index]) {
            steps[index].classList.add("active");
        }

        if (result) {
            result.classList.remove("active");
        }

        progressSteps.forEach(function (step, i) {

            step.classList.remove("active", "completed");

            if (i < index) {
                step.classList.add("completed");
            }

            if (i === index) {
                step.classList.add("active");
            }

        });

        progressLines.forEach(function (line, i) {

            line.classList.remove("completed");

            if (i < index) {
                line.classList.add("completed");
            }

        });

    }

    // =========================================
    // GREŠKE
    // =========================================

    function showError(element, message) {

        if (!element) return;

        element.classList.add("error");

        const error = document.createElement("span");
        error.className = "error-message";
        error.textContent = message;

        element.appendChild(error);

    }

    function clearErrors() {

        document.querySelectorAll(".error").forEach(function (element) {
            element.classList.remove("error");
        });

        document.querySelectorAll(".error-message, .option-error-message")
            .forEach(function (element) {
                element.remove();
            });

    }

    // =========================================
    // VALIDACIJA PRVOG KORAKA
    // =========================================

    function validateStep1() {

        clearErrors();

        let valid = true;

        const gender = document.getElementById("gender");
        const age = document.getElementById("age");
        const weight = document.getElementById("weight");
        const height = document.getElementById("height");

        if (!gender || !gender.value) {

            showError(
                gender?.closest(".form-group"),
                "Odaberi spol."
            );

            valid = false;
        }

        function validateNumber(input, min, max, message) {

            const value = Number(input?.value);

            if (
                !input ||
                input.value.trim() === "" ||
                !Number.isFinite(value) ||
                value < min ||
                value > max
            ) {

                showError(
                    input?.closest(".form-group"),
                    message
                );

                return false;
            }

            return true;
        }

        if (!validateNumber(
            age, 15, 100,
            "Unesi dob između 15 i 100 godina."
        )) {
            valid = false;
        }

        if (!validateNumber(
            weight, 30, 300,
            "Unesi težinu između 30 i 300 kg."
        )) {
            valid = false;
        }

        if (!validateNumber(
            height, 100, 250,
            "Unesi visinu između 100 i 250 cm."
        )) {
            valid = false;
        }

        return valid;
    }

    // =========================================
    // VALIDACIJA DRUGOG KORAKA
    // =========================================

    function validateStep2() {

        clearErrors();

        const selectedGoal = document.querySelector(
            'input[name="goal"]:checked'
        );

        if (!selectedGoal) {

            const goalOptions = document.querySelector(".goal-options");

            if (goalOptions) {

                goalOptions.classList.add("error");

                const error = document.createElement("span");
                error.className = "option-error-message";
                error.textContent = "Odaberi svoj cilj.";

                goalOptions.after(error);
            }

            return false;
        }

        return true;
    }

    // =========================================
    // VALIDACIJA TREĆEG KORAKA
    // =========================================

    function validateStep3() {

        clearErrors();

        const selectedActivity = document.querySelector(
            'input[name="activity"]:checked'
        );

        if (!selectedActivity) {

            const activityOptions = document.querySelector(
                ".activity-options"
            );

            if (activityOptions) {

                activityOptions.classList.add("error");

                const error = document.createElement("span");
                error.className = "option-error-message";
                error.textContent = "Odaberi koliko često treniraš.";

                activityOptions.after(error);
            }

            return false;
        }

        return true;
    }

    // =========================================
    // NAZIV CILJA
    // =========================================

    function getGoalText(goal) {

        if (goal === "muscle") {
            return "Izgradnja mišića";
        }

        if (goal === "fat-loss") {
            return "Mršavljenje";
        }

        if (goal === "maintenance") {
            return "Održavanje težine";
        }

        return "—";
    }

    // =========================================
    // IZRAČUN KALORIJA I MAKRO NUTRIJENATA
    // =========================================

    function calculateNutrition() {

        const gender = document.getElementById("gender").value;
        const age = Number(document.getElementById("age").value);
        const weight = Number(document.getElementById("weight").value);
        const height = Number(document.getElementById("height").value);

        const goal = document.querySelector(
            'input[name="goal"]:checked'
        ).value;

        const activity = document.querySelector(
            'input[name="activity"]:checked'
        ).value;

        // Mifflin-St Jeor formula za odrasle

        const bmr = (
            10 * weight +
            6.25 * height -
            5 * age +
            (gender === "male" ? 5 : -161)
        );

        const activityFactors = {
            none: 1.2,
            low: 1.375,
            medium: 1.55,
            high: 1.725
        };

        const maintenanceCalories =
            bmr * activityFactors[activity];

        let targetCalories = maintenanceCalories;

        if (goal === "muscle") {
            targetCalories += 250;
        }

        if (goal === "fat-loss") {
            targetCalories -= 300;
        }

        // Protein prema cilju i aktivnosti

        const proteinFactors = {
            muscle: {
                none: 1.7,
                low: 1.7,
                medium: 1.9,
                high: 2.0
            },
            "fat-loss": {
                none: 1.7,
                low: 1.7,
                medium: 2.0,
                high: 2.2
            },
            maintenance: {
                none: 1.5,
                low: 1.5,
                medium: 1.7,
                high: 1.9
            }
        };

        const proteinFactor = proteinFactors[goal][activity];

        const protein = Math.round(weight * proteinFactor);

        // Masti: približno 0.8 g po kilogramu

        const fats = Math.round(weight * 0.8);

        // Ugljikohidrati: ostatak kalorija

        const proteinCalories = protein * 4;
        const fatCalories = fats * 9;

        const carbs = Math.max(
            0,
            Math.round(
                (targetCalories - proteinCalories - fatCalories) / 4
            )
        );

        return {
            calories: Math.round(targetCalories),
            maintenance: Math.round(maintenanceCalories),
            protein: protein,
            carbs: carbs,
            fats: fats,
            weight: weight,
            goal: goal,
            activity: activity
        };
    }

    // =========================================
    // POMOĆNA FUNKCIJA ZA ISPIS
    // =========================================

    function setText(id, value) {

        const element = document.getElementById(id);

        if (element) {
            element.textContent = value;
        }
    }

    // =========================================
    // PROGRESS BAR ZA KALORIJE
    // =========================================

    function updateCalorieProgress() {

        if (!currentCalculation) return;

        const input = document.getElementById("calories-consumed");

        const target = currentCalculation.calories;

        const consumed = Math.max(
            0,
            Number(input?.value) || 0
        );

        const remaining = Math.max(0, target - consumed);

        const percentage = target > 0
            ? Math.min(100, (consumed / target) * 100)
            : 0;

        setText("calories-remaining", Math.round(remaining));
        setText("calorie-percentage", Math.round(percentage) + "%");

        const progressFill = document.getElementById(
            "calorie-progress-fill"
        );

        if (progressFill) {
            progressFill.style.width = percentage + "%";
        }
    }

    // =========================================
    // PRIKAZ REZULTATA
    // =========================================

    function showResult() {

        currentCalculation = calculateNutrition();

        const data = currentCalculation;

        // Glavni kalorijski rezultat

        setText("calorie-target", data.calories);
        setText("result-goal", getGoalText(data.goal));
        setText("result-weight", data.weight);

        // Dodatni prikaz makronutrijenata,
        // ako postoje odgovarajući HTML elementi

        setText("macro-protein", data.protein);
        setText("macro-carbs", data.carbs);
        setText("macro-fats", data.fats);

        // Alternativni ID-jevi za postojeći dodatak

        setText("protein-value", data.protein);
        setText("carbs-value", data.carbs);
        setText("fats-value", data.fats);

        // Reset progress bara

        const consumedInput = document.getElementById(
            "calories-consumed"
        );

        if (consumedInput) {
            consumedInput.value = 0;
        }

        updateCalorieProgress();

        // Događaj za dodatne skripte:
        // grafikoni i preporuke proizvoda

        document.dispatchEvent(
            new CustomEvent("esh:calculated", {
                detail: data
            })
        );

    }

    // =========================================
    // KRATKA ESH ANIMACIJA PRIJE PRIKAZA REZULTATA
    // =========================================

    const loadingMessages = [
        "Analiziramo tvoje podatke",
        "Računamo kalorijske potrebe",
        "Pripremamo makronutrijente",
        "Odabiremo ESH preporuke"
    ];

    function finishCalculation() {

        // Postojeći izračun i esh:calculated događaj ostaju nepromijenjeni.
        showResult();

        if (loadingSection) {
            loadingSection.classList.remove("active");
        }

        if (result) {
            result.classList.add("active");
            result.setAttribute("tabindex", "-1");
            result.focus({ preventScroll: true });
            result.scrollIntoView({ block: "start", behavior: "auto" });
        }

        progressSteps.forEach(function (step) {
            step.classList.remove("active");
            step.classList.add("completed");
        });

        progressLines.forEach(function (line) {
            line.classList.add("completed");
        });

        calculationInProgress = false;
        if (calculateButton) calculateButton.disabled = false;
    }

    function animateBeforeResult() {

        if (calculationInProgress) return;
        calculationInProgress = true;
        if (calculateButton) calculateButton.disabled = true;

        steps.forEach(function (step) {
            step.classList.remove("active");
        });
        if (result) result.classList.remove("active");

        // Ako loading HTML nije prisutan, kalkulator i dalje radi.
        if (!loadingSection) {
            finishCalculation();
            return;
        }

        const ring = document.getElementById("esh-loading-ring");
        const percentLabel = document.getElementById("esh-loading-percent");
        const message = document.getElementById("esh-loading-message");
        const tasks = loadingSection.querySelectorAll(".esh-loading-task");
        let lastPercent = -1;
        let lastPhase = -1;

        function updateLoading(progress) {
            const percent = Math.min(100, Math.max(0, Math.round(progress)));
            if (percent !== lastPercent) {
                lastPercent = percent;
                if (percentLabel) percentLabel.textContent = percent + "%";
                if (ring) {
                    ring.style.setProperty("--esh-progress", percent + "%");
                    ring.setAttribute("aria-valuenow", String(percent));
                }
            }

            const phase = Math.min(3, Math.floor(percent / 25));
            if (phase !== lastPhase) {
                lastPhase = phase;
                if (message) message.textContent = loadingMessages[phase];
                tasks.forEach(function (task, index) {
                    task.classList.toggle("done", index < phase);
                    task.classList.toggle("active", index === phase);
                });
            }
        }

        progressSteps.forEach(function (step, index) {
            step.classList.toggle("completed", index < 3);
            step.classList.toggle("active", index === 3);
        });
        progressLines.forEach(function (line) {
            line.classList.add("completed");
        });

        updateLoading(0);
        loadingSection.classList.add("active");
        loadingSection.focus({ preventScroll: true });
        loadingSection.scrollIntoView({ block: "start", behavior: "auto" });

        const reducedMotion = window.matchMedia &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const duration = reducedMotion ? 300 : 3000;
        let startTime = null;

        function frame(timestamp) {
            if (startTime === null) startTime = timestamp;
            const progress = Math.min(100, (timestamp - startTime) / duration * 100);
            updateLoading(progress);
            if (progress < 100) {
                window.requestAnimationFrame(frame);
            } else {
                finishCalculation();
            }
        }

        window.requestAnimationFrame(frame);
    }

    // =========================================
    // KORAK 1 -> KORAK 2
    // =========================================

    const nextStep1 = document.getElementById("next-step-1");

    if (nextStep1) {

        nextStep1.addEventListener("click", function () {

            if (validateStep1()) {
                showStep(1);
            }

        });
    }

    // =========================================
    // KORAK 2 -> KORAK 3
    // =========================================

    const nextStep2 = document.getElementById("next-step-2");

    if (nextStep2) {

        nextStep2.addEventListener("click", function () {

            if (validateStep2()) {
                showStep(2);
            }

        });
    }

    // =========================================
    // KORAK 3 -> REZULTAT
    // =========================================

    const calculateButton = document.getElementById("calculate");

    if (calculateButton) {

        calculateButton.addEventListener("click", function () {

            if (!validateStep3()) {
                return;
            }

            if (!validateStep1() || !validateStep2()) {
                showStep(0);
                return;
            }

            animateBeforeResult();

        });
    }

    // =========================================
    // PROMJENA UNESENIH KALORIJA
    // =========================================

    const consumedInput = document.getElementById(
        "calories-consumed"
    );

    if (consumedInput) {

        consumedInput.addEventListener(
            "input",
            updateCalorieProgress
        );
    }

    // =========================================
    // POKRETANJE KALKULATORA
    // =========================================

    showStep(0);

});
