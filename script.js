document.addEventListener("DOMContentLoaded", function () {

    const steps = document.querySelectorAll(".calculator-step");
    const result = document.querySelector(".calculator-result");

    const progressSteps = document.querySelectorAll(".progress-step");
    const progressLines = document.querySelectorAll(".progress-line");


    // =========================================
    // PRIKAŽI KORAK
    // =========================================

    function showStep(index) {

        steps.forEach(function (step) {
            step.classList.remove("active");
        });

        steps[index].classList.add("active");


        // Progress

        progressSteps.forEach(function (step, i) {

            step.classList.remove("active");
            step.classList.remove("completed");

            if (i < index) {
                step.classList.add("completed");
            }

            if (i === index) {
                step.classList.add("active");
            }

        });


        // Progress linije

        progressLines.forEach(function (line, i) {

            line.classList.remove("completed");

            if (i < index) {
                line.classList.add("completed");
            }

        });

    }


    // =========================================
    // ERROR PORUKA
    // =========================================

    function showError(element, message) {

        element.classList.add("error");

        const error = document.createElement("span");

        error.className = "error-message";
        error.textContent = message;

        element.appendChild(error);
    }


    // =========================================
    // UKLONI ERROR
    // =========================================

    function clearErrors() {

        document
            .querySelectorAll(".error")
            .forEach(function (element) {

                element.classList.remove("error");

            });


        document
            .querySelectorAll(".error-message")
            .forEach(function (element) {

                element.remove();

            });


        document
            .querySelectorAll(".option-error-message")
            .forEach(function (element) {

                element.remove();

            });

    }


    // =========================================
    // VALIDACIJA STEP 1
    // =========================================

    function validateStep1() {

        clearErrors();

        let valid = true;


        // SPOL

        const gender = document.getElementById("gender");

        if (gender.value === "") {

            showError(
                gender.closest(".form-group"),
                "Odaberi spol."
            );

            valid = false;
        }


        // GODINE

        const age = document.getElementById("age");

        if (
            age.value === "" ||
            age.value < 15 ||
            age.value > 100
        ) {

            showError(
                age.closest(".form-group"),
                "Unesi dob između 15 i 100 godina."
            );

            valid = false;
        }


        // TEŽINA

        const weight = document.getElementById("weight");

        if (
            weight.value === "" ||
            weight.value < 30 ||
            weight.value > 300
        ) {

            showError(
                weight.closest(".form-group"),
                "Unesi težinu između 30 i 300 kg."
            );

            valid = false;
        }


        // VISINA

        const height = document.getElementById("height");

        if (
            height.value === "" ||
            height.value < 100 ||
            height.value > 250
        ) {

            showError(
                height.closest(".form-group"),
                "Unesi visinu između 100 i 250 cm."
            );

            valid = false;
        }


        return valid;

    }


    // =========================================
    // VALIDACIJA STEP 2
    // =========================================

    function validateStep2() {

        clearErrors();

        const goalOptions =
            document.querySelector(".goal-options");

        const selectedGoal =
            document.querySelector('input[name="goal"]:checked');


        if (!selectedGoal) {

            goalOptions.classList.add("error");

            const error =
                document.createElement("span");

            error.className =
                "option-error-message";

            error.textContent =
                "Odaberi svoj cilj.";

            goalOptions.after(error);

            return false;
        }


        return true;

    }


    // =========================================
    // VALIDACIJA STEP 3
    // =========================================

    function validateStep3() {

        clearErrors();

        const activityOptions =
            document.querySelector(".activity-options");

        const selectedActivity =
            document.querySelector(
                'input[name="activity"]:checked'
            );


        if (!selectedActivity) {

            activityOptions.classList.add("error");

            const error =
                document.createElement("span");

            error.className =
                "option-error-message";

            error.textContent =
                "Odaberi koliko često treniraš.";

            activityOptions.after(error);

            return false;

        }


        return true;

    }


    // =========================================
    // IZRAČUN PROTEINA
    // =========================================

    function calculateProtein() {

        const weight =
            parseFloat(
                document.getElementById("weight").value
            );


        const goal =
            document.querySelector(
                'input[name="goal"]:checked'
            ).value;


        const activity =
            document.querySelector(
                'input[name="activity"]:checked'
            ).value;


        let minProtein;
        let maxProtein;


        // =====================================
        // IZGRADNJA MIŠIĆA
        // =====================================

        if (goal === "muscle") {

            if (activity === "none") {

                minProtein = 1.6;
                maxProtein = 1.8;

            } else if (activity === "low") {

                minProtein = 1.6;
                maxProtein = 1.8;

            } else if (activity === "medium") {

                minProtein = 1.8;
                maxProtein = 2.0;

            } else if (activity === "high") {

                minProtein = 1.8;
                maxProtein = 2.2;

            }

        }


        // =====================================
        // MRŠAVLJENJE
        // =====================================

        else if (goal === "fat-loss") {

            if (activity === "none") {

                minProtein = 1.6;
                maxProtein = 1.8;

            } else if (activity === "low") {

                minProtein = 1.6;
                maxProtein = 1.8;

            } else if (activity === "medium") {

                minProtein = 1.8;
                maxProtein = 2.2;

            } else if (activity === "high") {

                minProtein = 2.0;
                maxProtein = 2.4;

            }

        }


        // =====================================
        // ODRŽAVANJE
        // =====================================

        else if (goal === "maintenance") {

            if (activity === "none") {

                minProtein = 1.4;
                maxProtein = 1.6;

            } else if (activity === "low") {

                minProtein = 1.4;
                maxProtein = 1.6;

            } else if (activity === "medium") {

                minProtein = 1.6;
                maxProtein = 1.8;

            } else if (activity === "high") {

                minProtein = 1.8;
                maxProtein = 2.0;

            }

        }


        // =====================================
        // KONAČAN IZRAČUN
        // =====================================

        const proteinMin =
            Math.round(weight * minProtein);

        const proteinMax =
            Math.round(weight * maxProtein);

        const proteinAverage =
            Math.round(
                (proteinMin + proteinMax) / 2
            );


        return {
            min: proteinMin,
            max: proteinMax,
            average: proteinAverage
        };

    }


    // =========================================
    // TEKST CILJA
    // =========================================

    function getGoalText(goal) {

        if (goal === "muscle") {
            return "Izgradnja mišića";
        }

        if (goal === "fat-loss") {
            return "Mršavljenje";
        }

        if (goal === "maintenance") {
            return "Održavanje";
        }

        return "—";

    }


    // =========================================
    // PRIKAŽI REZULTAT
    // =========================================

    function showResult() {

        const calculation =
            calculateProtein();


        const weight =
            document.getElementById("weight").value;


        const selectedGoal =
            document.querySelector(
                'input[name="goal"]:checked'
            );


        // Protein minimum

        document.getElementById("protein-min")
            .textContent = calculation.min;


        // Protein maximum

        document.getElementById("protein-max")
            .textContent = calculation.max;


        // Težina

        document.getElementById("result-weight")
            .textContent = weight;


        // Prosjek

        document.getElementById("result-average")
            .textContent = calculation.average;


        // Cilj

        document.getElementById("result-goal")
            .textContent = getGoalText(
                selectedGoal.value
            );

    }


    // =========================================
    // STEP 1 → STEP 2
    // =========================================

    document
        .getElementById("next-step-1")
        .addEventListener("click", function () {

            if (validateStep1()) {

                showStep(1);

            }

        });


    // =========================================
    // STEP 2 → STEP 3
    // =========================================

    document
        .getElementById("next-step-2")
        .addEventListener("click", function () {

            if (validateStep2()) {

                showStep(2);

            }

        });


    // =========================================
    // STEP 3 → REZULTAT
    // =========================================

    document
        .getElementById("calculate")
        .addEventListener("click", function () {

            if (!validateStep3()) {
                return;
            }


            // Izračunaj
            showResult();


            // Sakrij korake

            steps.forEach(function (step) {

                step.classList.remove("active");

            });


            // Prikaži rezultat

            result.classList.add("active");


            // Progress

            progressSteps.forEach(function (step) {

                step.classList.remove("active");

                step.classList.add("completed");

            });


            progressLines.forEach(function (line) {

                line.classList.add("completed");

            });

        });


    // =========================================
    // START
    // =========================================

    showStep(0);

});