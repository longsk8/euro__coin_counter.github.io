// ---------- Animación de la etiqueta de cabecera ----------
function animarEtiquetaCabecera() {
    const etiqueta = document.querySelector(".cabecera__etiqueta");
    if (!etiqueta) return;

    const texto = etiqueta.textContent;
    etiqueta.textContent = "";

    let indice = 0;
    for (const caracter of texto) {
        if (caracter === " ") {
            etiqueta.appendChild(document.createTextNode(" "));
            continue;
        }
        const letra = document.createElement("span");
        letra.className = "cabecera__letra";
        letra.textContent = caracter;
        letra.style.animationDelay = `${indice * 28}ms`;
        etiqueta.appendChild(letra);
        indice++;
    }
}

// ---------- Fecha del cierre ----------
function establecerFecha() {
    const hoy = new Date();
    const base = hoy.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
    const texto = base.charAt(0).toUpperCase() + base.slice(1);

    const corta = hoy.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
    const textoCorto = (corta.charAt(0).toUpperCase() + corta.slice(1)).replace(".", "");

    const fechaCierre = document.getElementById("fechaCierre");
    fechaCierre.textContent = textoCorto;
    fechaCierre.closest(".cabecera__fecha").title = texto;
    fechaCierre.setAttribute("aria-label", texto);

    document.getElementById("resumenFecha").textContent = texto;
}

// ---------- Cambio de pestaña (Monedas / Billetes) ----------
function mostrarPanel(tipo) {
    const panelMonedas = document.getElementById("panelMonedas");
    const panelBilletes = document.getElementById("panelBilletes");
    const tabMonedas = document.getElementById("tabMonedas");
    const tabBilletes = document.getElementById("tabBilletes");
    const selector = document.getElementById("selector");
    selector.dataset.activo = tipo;

    if (tipo === "monedas") {
        panelMonedas.classList.remove("is-oculto");
        panelBilletes.classList.add("is-oculto");
        tabMonedas.classList.add("is-activa");
        tabBilletes.classList.remove("is-activa");
        tabMonedas.setAttribute("aria-selected", "true");
        tabBilletes.setAttribute("aria-selected", "false");
    } else {
        panelBilletes.classList.remove("is-oculto");
        panelMonedas.classList.add("is-oculto");
        tabBilletes.classList.add("is-activa");
        tabMonedas.classList.remove("is-activa");
        tabBilletes.setAttribute("aria-selected", "true");
        tabMonedas.setAttribute("aria-selected", "false");
    }
}

// ---------- Utilidad: leer y sanear un input ----------
function leerCantidad(id) {
    const input = document.getElementById(id);
    let valor = parseInt(input.value) || 0;
    if (valor < 0) {
        valor = 0;
        input.value = 0;
    }
    return valor;
}

// ---------- Utilidad: campos de dinero (aceptan coma o punto) ----------
function filtrarEntradaDinero(input) {
    let valor = input.value.replace(/[^0-9.,]/g, "");

    const posSeparador = valor.search(/[.,]/);
    if (posSeparador !== -1) {
        const parteEntera = valor.slice(0, posSeparador + 1);
        const parteDecimal = valor.slice(posSeparador + 1).replace(/[.,]/g, "");
        valor = parteEntera + parteDecimal;
    }

    input.value = valor;
}

function leerDinero(id) {
    const texto = document.getElementById(id).value.replace(",", ".");
    return parseFloat(texto) || 0;
}

// ---------- Cálculo principal ----------
function calcularTotal() {
    // Valores de cada moneda
    const valoresMonedas = [2, 1, 0.5, 0.2, 0.1, 0.05, 0.02, 0.01];
    let subtotalMonedas = 0;

    valoresMonedas.forEach((valor, i) => {
        const cantidad = leerCantidad(`numero${i + 1}`);
        const total = cantidad * valor;
        document.getElementById(`resultado${i + 1}`).textContent = total.toFixed(2);
        subtotalMonedas += total;
    });

    // Valores de cada billete
    const valoresBilletes = [200, 100, 50, 20, 10, 5];
    let subtotalBilletes = 0;

    valoresBilletes.forEach((valor, i) => {
        const cantidad = leerCantidad(`billete${i + 1}`);
        const total = cantidad * valor;
        document.getElementById(`resultadoB${i + 1}`).textContent = total.toFixed(2);
        subtotalBilletes += total;
    });

    // Subtotales por panel
    document.getElementById("subtotalMonedas").textContent = subtotalMonedas.toFixed(2);
    document.getElementById("subtotalBilletes").textContent = subtotalBilletes.toFixed(2);

    // Desglose en la barra inferior
    document.getElementById("miniMonedas").textContent = subtotalMonedas.toFixed(2);
    document.getElementById("miniBilletes").textContent = subtotalBilletes.toFixed(2);

    // Total general (monedas + billetes)
    const totalGeneral = subtotalMonedas + subtotalBilletes;
    const spanTotal = document.getElementById("totalGeneral");
    const totalAnterior = spanTotal.textContent;
    spanTotal.textContent = totalGeneral.toFixed(2);

    if (totalAnterior !== spanTotal.textContent) {
        const cifra = document.querySelector(".total__cifra");
        cifra.classList.remove("is-actualizado");
        // Forzar reflow para poder reiniciar la animación
        void cifra.offsetWidth;
        cifra.classList.add("is-actualizado");
        clearTimeout(cifra._temporizador);
        cifra._temporizador = setTimeout(() => cifra.classList.remove("is-actualizado"), 180);
    }

    actualizarFondo();
}

// ---------- Cierre de caja ----------
function calcularCierre() {
    const totalDia = leerDinero("totalDia");
    const visa = leerDinero("visa");
    const uber = leerDinero("uber");
    const gastos = leerDinero("gastos");
    const efectivoReal = leerDinero("efectivoReal");

    const efectivoTeorico = totalDia - visa - uber - gastos;
    const diferencia = efectivoReal - efectivoTeorico;

    document.getElementById("cifraEfectivoTeorico").innerHTML =
        efectivoTeorico.toFixed(2) + ' <span class="cifra__moneda">€</span>';

    let estado, etiqueta;
    if (diferencia === 0) {
        estado = "cuadrada";
        etiqueta = "Caja cuadrada";
    } else if (diferencia > 0) {
        estado = "sobra";
        etiqueta = "Sobran";
    } else {
        estado = "falta";
        etiqueta = "Faltan";
    }

    document.getElementById("resultadoFinal").dataset.estado = estado;
    document.getElementById("estadoResultado").textContent = etiqueta;
    document.getElementById("cifraDiferencia").textContent = Math.abs(diferencia).toFixed(2) + " €";
    document.getElementById("subResultado").textContent =
        `Efectivo real ${efectivoReal.toFixed(2)} € frente a ${efectivoTeorico.toFixed(2)} € teóricos`;

    actualizarResumen();
}

// ---------- Fondo de caja ----------
function actualizarFondo() {
    const sumaMonedas = parseFloat(document.getElementById("subtotalMonedas").textContent) || 0;
    const fondoActual = leerDinero("fondoActual");
    const fondoObjetivoInput = document.getElementById("fondoObjetivo");
    const fondoObjetivo = leerDinero("fondoObjetivo");

    const totalDisponible = fondoActual + sumaMonedas;
    const fondoFinal = Math.floor(totalDisponible / 5) * 5;

    document.getElementById("cifraSumaMonedas").textContent = sumaMonedas.toFixed(2) + " €";
    document.getElementById("cifraTotalDisponible").textContent = totalDisponible.toFixed(2) + " €";
    document.getElementById("cifraFondoFinal").textContent = fondoFinal.toFixed(2) + " €";

    const cifraAIngresar = document.getElementById("cifraAIngresar");
    if (fondoObjetivoInput.value.trim() === "") {
        cifraAIngresar.textContent = "— €";
    } else {
        const aIngresar = fondoObjetivo - fondoFinal;
        cifraAIngresar.innerHTML = aIngresar.toFixed(2) + ' <span class="cifra__moneda">€</span>';
    }

    actualizarResumen();
}

// ---------- Resumen del cierre ----------
function actualizarResumen() {
    const texto = (id) => document.getElementById(id).textContent;
    const numero = (id) => leerDinero(id).toFixed(2) + " €";

    document.getElementById("resumenResponsable").textContent = document.getElementById("responsable").value || "—";

    document.getElementById("resumenMonedas").textContent = texto("subtotalMonedas") + " €";
    document.getElementById("resumenBilletes").textContent = texto("subtotalBilletes") + " €";
    document.getElementById("resumenTotalContado").textContent = texto("totalGeneral") + " €";

    document.getElementById("resumenTotalDia").textContent = numero("totalDia");
    document.getElementById("resumenVisa").textContent = numero("visa");
    document.getElementById("resumenUber").textContent = numero("uber");
    document.getElementById("resumenGastos").textContent = numero("gastos");
    document.getElementById("resumenEfectivoTeorico").textContent = texto("cifraEfectivoTeorico");
    document.getElementById("resumenEfectivoReal").textContent = numero("efectivoReal");

    const efectivoTeorico = leerDinero("totalDia") - leerDinero("visa") - leerDinero("uber") - leerDinero("gastos");
    const diferencia = leerDinero("efectivoReal") - efectivoTeorico;
    document.getElementById("resumenDiferencia").textContent = diferencia.toFixed(2) + " €";

    document.getElementById("resumenFondoActual").textContent = numero("fondoActual");
    document.getElementById("resumenSumaMonedas").textContent = texto("cifraSumaMonedas");
    document.getElementById("resumenTotalDisponible").textContent = texto("cifraTotalDisponible");
    document.getElementById("resumenFondoFinal").textContent = texto("cifraFondoFinal");
    document.getElementById("resumenFondoObjetivo").textContent = numero("fondoObjetivo");
    document.getElementById("resumenAIngresar").textContent = texto("cifraAIngresar");

    actualizarEstadoPasos();
}

// ---------- Estado "completado" de los pasos (según datos, no scroll) ----------
function pasoTieneDatos(paso) {
    switch (paso) {
        case "efectivo":
            return (parseFloat(document.getElementById("totalGeneral").textContent) || 0) > 0;
        case "datos":
            return (
                document.getElementById("responsable").value.trim() !== "" ||
                leerDinero("totalDia") > 0 ||
                leerDinero("visa") > 0 ||
                leerDinero("uber") > 0 ||
                leerDinero("gastos") > 0 ||
                leerDinero("efectivoReal") > 0
            );
        case "fondo":
            return leerDinero("fondoActual") > 0 || leerDinero("fondoObjetivo") > 0;
        default:
            return false;
    }
}

function actualizarEstadoPasos() {
    document.querySelectorAll(".pasos__paso").forEach((enlace) => {
        enlace.classList.toggle("is-completado", pasoTieneDatos(enlace.dataset.paso));
    });
}

// ---------- Descargar resumen como PDF ----------
function descargarResumen() {
    const responsable = document.getElementById("responsable").value.trim() || "cierre";
    const fecha = document.getElementById("resumenFecha").textContent.replace(/\s+/g, "-").toLowerCase();
    const tituloOriginal = document.title;

    document.title = `federal - ${responsable} - ${fecha}`;
    window.print();
    document.title = tituloOriginal;
}

// ---------- Indicador de progreso ----------
function inicializarPasos() {
    const objetivos = [
        { id: "pasoEfectivo", paso: "efectivo" },
        { id: "seccionDatos", paso: "datos" },
        { id: "seccionFondo", paso: "fondo" },
        { id: "seccionResumen", paso: "resumen" },
    ];
    const enlaces = document.querySelectorAll(".pasos__paso");
    const nav = document.getElementById("pasos");

    function marcarActivo(pasoActivo) {
        enlaces.forEach((enlace) => {
            enlace.classList.toggle("is-activo", enlace.dataset.paso === pasoActivo);
        });
    }

    // Alto real de la barra de pasos (sticky), para no dejar la sección tapada.
    function alturaNav() {
        return nav ? nav.getBoundingClientRect().height : 0;
    }

    // Desplazamiento manual: evita depender solo de scroll-margin-top, que no
    // se reajusta si el alto de la página cambia tras la carga (p. ej. al
    // terminar de cargar la tipografía web).
    function irASeccion(id, comportamiento) {
        const elemento = document.getElementById(id);
        if (!elemento) return;

        // El paso 1 sube hasta el principio de la página para que se vea la cabecera.
        if (id === "pasoEfectivo") {
            window.scrollTo({ top: 0, behavior: comportamiento });
            return;
        }

        const destino = elemento.getBoundingClientRect().top + window.scrollY - alturaNav() - 8;
        window.scrollTo({ top: Math.max(destino, 0), behavior: comportamiento });
    }

    enlaces.forEach((enlace) => {
        enlace.addEventListener("click", (evento) => {
            const id = enlace.getAttribute("href").slice(1);
            const objetivo = objetivos.find((o) => o.id === id);
            if (!objetivo) return;
            evento.preventDefault();
            marcarActivo(objetivo.paso);
            irASeccion(id, "smooth");
            history.pushState(null, "", `#${id}`);
        });
    });

    const observador = new IntersectionObserver(
        (entradas) => {
            entradas.forEach((entrada) => {
                if (!entrada.isIntersecting) return;
                const objetivo = objetivos.find((o) => o.id === entrada.target.id);
                if (objetivo) marcarActivo(objetivo.paso);
            });
        },
        { rootMargin: `-${Math.ceil(alturaNav()) + 1}px 0px -65% 0px` }
    );

    objetivos.forEach(({ id }) => {
        const elemento = document.getElementById(id);
        if (elemento) observador.observe(elemento);
    });

    // Carga directa por URL con ancla (p. ej. recargar en #seccionResumen):
    // el navegador hace su propio salto nativo antes de que este script
    // corra, así que fijamos el tab correcto ya mismo y reajustamos el
    // scroll una vez que termina de cargar todo (incluida la tipografía
    // web), que es cuando el alto real de la página queda definitivo.
    const idInicial = location.hash.slice(1);
    const objetivoInicial = objetivos.find((o) => o.id === idInicial);

    if (objetivoInicial) {
        marcarActivo(objetivoInicial.paso);
        const reajustar = () => irASeccion(idInicial, "auto");
        window.addEventListener("load", reajustar);
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(reajustar);
        }
    } else {
        marcarActivo("efectivo");
    }
}

// ---------- Inicialización ----------
document.addEventListener("DOMContentLoaded", () => {
    animarEtiquetaCabecera();
    establecerFecha();
    calcularTotal();
    calcularCierre();
    inicializarPasos();
});
