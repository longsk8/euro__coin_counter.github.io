
/* =========================
   DENOMINACIONES
========================= */

const billetes = {
    billete500: 500,
    billete200: 200,
    billete100: 100,
    billete50: 50,
    billete20: 20,
    billete10: 10,
    billete5: 5
};


const monedas = {
    moneda2: 2,
    moneda1: 1,
    moneda050: 0.50,
    moneda020: 0.20,
    moneda010: 0.10,
    moneda005: 0.05,
    moneda002: 0.02,
    moneda001: 0.01
};


/* =========================
   CALCULAR TOTAL
========================= */

function calcularTotal() {

    let totalBilletes = 0;
    let totalMonedas = 0;


    /* =====================
       BILLETES
    ===================== */

    for (const id in billetes) {

        const cantidad =
            Math.max(
                0,
                parseInt(document.getElementById(id).value) || 0
            );

        const valor = billetes[id];

        const total = cantidad * valor;

        totalBilletes += total;


        /*
         * Obtener el ID del resultado
         * billete500 -> resultado500
         */

        const resultadoId =
            id.replace("billete", "resultado");

        document.getElementById(resultadoId)
            .textContent = total.toFixed(2);
    }


    /* =====================
       MONEDAS
    ===================== */

    for (const id in monedas) {

        const cantidad =
            Math.max(
                0,
                parseInt(document.getElementById(id).value) || 0
            );

        const valor = monedas[id];

        const total = cantidad * valor;

        totalMonedas += total;


        /*
         * moneda050 -> resultado050
         */

        const resultadoId =
            id.replace("moneda", "resultado");

        document.getElementById(resultadoId)
            .textContent = total.toFixed(2);
    }


    /* =====================
       TOTAL FINAL
    ===================== */

    const totalGeneral =
        totalBilletes + totalMonedas;


    document.getElementById("totalBilletes")
        .textContent = totalBilletes.toFixed(2);

    document.getElementById("totalMonedas")
        .textContent = totalMonedas.toFixed(2);

    document.getElementById("totalGeneral")
        .textContent = totalGeneral.toFixed(2);
}


/* =========================
   CAMBIAR PESTAÑA
========================= */

function mostrarSeccion(seccion) {

    const billetes =
        document.getElementById("billetes");

    const monedas =
        document.getElementById("monedas");

    const tabBilletes =
        document.getElementById("tabBilletes");

    const tabMonedas =
        document.getElementById("tabMonedas");


    if (seccion === "billetes") {

        billetes.classList.add("activa");
        monedas.classList.remove("activa");

        tabBilletes.classList.add("active");
        tabMonedas.classList.remove("active");

    } else {

        billetes.classList.remove("activa");
        monedas.classList.add("activa");

        tabBilletes.classList.remove("active");
        tabMonedas.classList.add("active");
    }
}


/* =========================
   LIMPIAR CONTADOR
========================= */

function limpiarContador() {

    const inputs =
        document.querySelectorAll("input");

    inputs.forEach(input => {
        input.value = 0;
    });


    calcularTotal();
}


/* =========================
   INICIAR
========================= */

calcularTotal();
