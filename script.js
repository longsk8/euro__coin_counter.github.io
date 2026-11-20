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
// Mientras se escribe solo se quitan caracteres imposibles. Los puntos se
// dejan aunque haya varios, porque pueden ser de millar ("1.234,56").
// Si hay coma, es la decimal: se deja solo la primera y se quitan los
// puntos que vengan detrás de ella (en la parte decimal no tienen sentido).
function filtrarEntradaDinero(input) {
    let valor = input.value.replace(/[^0-9.,]/g, "");

    const posComa = valor.indexOf(",");
    if (posComa !== -1) {
        const hastaLaComa = valor.slice(0, posComa + 1);
        const decimales = valor.slice(posComa + 1).replace(/[.,]/g, "");
        valor = hastaLaComa + decimales;
    }

    // Solo se reescribe si algo cambió, para no mover el cursor sin motivo
    if (input.value !== valor) input.value = valor;
}

// Convierte lo que escribe el usuario a un número que entienda JavaScript:
//   "1.234,56"  -> "1234.56"  punto Y coma: el punto es de millar
//   "1.234.567" -> "1234567"  varios puntos: solo pueden ser de millar
//   "12,5"      -> "12.5"     solo coma: decimal
//   "12.5"      -> "12.5"     un solo punto: decimal (como hasta ahora)
function normalizarImporte(texto) {
    const limpio = texto.trim();

    if (limpio.includes(",")) {
        return limpio.replace(/\./g, "").replace(",", ".");
    }

    const cantidadDePuntos = (limpio.match(/\./g) || []).length;
    if (cantidadDePuntos > 1) {
        return limpio.replace(/\./g, "");
    }

    return limpio;
}

// ---------- Dinero en céntimos enteros ----------
// Todos los cálculos se hacen en céntimos (números enteros) para evitar
// los errores de coma flotante: en JS 0.30 - 0.10 - 0.20 no da 0.
// Solo se divide entre 100 al final, para mostrar la cifra.

// "100,30" -> 10030. Math.round corrige casos como 1000.1 * 100 = 100009.999...
function textoACentimos(texto) {
    const numero = parseFloat(normalizarImporte(texto));
    if (isNaN(numero)) return 0;
    return Math.round(numero * 100);
}

function leerCentimos(id) {
    return textoACentimos(document.getElementById(id).value);
}

// Formato único de importes en toda la página: "1.000,50 €".
// useGrouping "always" hace falta porque en es-ES, por defecto, los números
// de 4 cifras no llevan punto de millar ("1000,50 €").
const FORMATO_EUROS = new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    useGrouping: "always",
});

// 100050 -> "1.000,50 €" (solo para mostrar)
// "|| 0" evita que un -0 se muestre como "-0,00 €"
function formatearCentimos(centimos) {
    return FORMATO_EUROS.format(centimos / 100 || 0);
}

// Igual, pero con el "€" en un <span> para las cifras grandes,
// donde el símbolo se muestra más pequeño (clase .cifra__moneda)
function htmlCifraGrande(centimos) {
    return FORMATO_EUROS.formatToParts(centimos / 100 || 0)
        .map((parte) => parte.type === "currency"
            ? `<span class="cifra__moneda">${parte.value}</span>`
            : parte.value)
        .join("");
}

// ---------- Valores de monedas y billetes (en céntimos) ----------
const MONEDAS_CENTIMOS = [200, 100, 50, 20, 10, 5, 2, 1];
const BILLETES_CENTIMOS = [20000, 10000, 5000, 2000, 1000, 500];

// Total de una fila del contador: cantidad x valor de la pieza
function totalPiezaCentimos(idCantidad, valorCentimos) {
    return leerCantidad(idCantidad) * valorCentimos;
}

// Suma todas las filas de un panel (p. ej. prefijo "numero" -> numero1, numero2...)
function sumarPiezas(valores, prefijo) {
    let suma = 0;
    valores.forEach((valor, i) => {
        suma += totalPiezaCentimos(`${prefijo}${i + 1}`, valor);
    });
    return suma;
}

function monedasCentimos() {
    return sumarPiezas(MONEDAS_CENTIMOS, "numero");
}

function billetesCentimos() {
    return sumarPiezas(BILLETES_CENTIMOS, "billete");
}

function efectivoContadoCentimos() {
    return monedasCentimos() + billetesCentimos();
}

// ---------- Reglas del cierre (en céntimos) ----------
// Efectivo teórico = Total del día − Visa − Uber − Gastos
function efectivoTeoricoCentimos() {
    return leerCentimos("totalDia") - leerCentimos("visa") - leerCentimos("uber") - leerCentimos("gastos");
}

// Diferencia = (Efectivo real + Resto fuera del fondo) − Efectivo teórico
// El resto es el mismo que calcula el paso 2 (calcularFondo), no otro cálculo:
// son los céntimos que no entran en el fondo al redondear a múltiplo de 5 €.
function diferenciaCentimos() {
    const resto = calcularFondo().resto;
    return leerCentimos("efectivoReal") + resto - efectivoTeoricoCentimos();
}

// ---------- Comprobaciones para los avisos ----------
function campoVacio(id) {
    return document.getElementById(id).value.trim() === "";
}

function efectivoRealVacio() {
    return campoVacio("efectivoReal");
}

// ---------- Qué falta por completar ----------
// Datos sin los que no hay veredicto (Sobran / Faltan / Caja cuadrada).
// Lo que cuenta es que el campo no esté vacío: un "0" escrito es válido.
// - Total del día: para el efectivo teórico.
// - Efectivo real: lo escribe el usuario (el contador no lo rellena).
// - Fondo actual: sin él no se sabe el resto fuera del fondo, que entra
//   en la diferencia.
// Cada pendiente guarda también en qué paso está, para poder decirle al
// usuario dónde buscarlo, y el id de su campo, para poder llevarle hasta él.
function pendientesDelResultado() {
    const pendientes = [];
    if (campoVacio("totalDia")) pendientes.push({ nombre: "total del día", paso: 3, campo: "totalDia" });
    if (efectivoRealVacio()) pendientes.push({ nombre: "efectivo real", paso: 3, campo: "efectivoReal" });
    if (campoVacio("fondoActual")) pendientes.push({ nombre: "fondo actual", paso: 2, campo: "fondoActual" });
    return pendientes;
}

// Nombre de un pendiente. Si está en otro paso distinto del que muestra
// el mensaje, se dice cuál: "fondo actual (paso 2)".
function nombrePendiente(pendiente, pasoDelMensaje) {
    if (pendiente.paso === pasoDelMensaje) return pendiente.nombre;
    return `${pendiente.nombre} (paso ${pendiente.paso})`;
}

// La lista en texto plano: "total del día, efectivo real, fondo actual (paso 2)"
function textoPendientes(pendientes, pasoDelMensaje) {
    return pendientes.map((p) => nombrePendiente(p, pasoDelMensaje)).join(", ");
}

// La misma lista, pero cada pendiente es un enlace que lleva a su campo.
// Se construye con createElement (no con innerHTML) y se escribe en "contenedor":
//   inicio + enlace1 + ", " + enlace2 + ... + fin
function escribirPendientesConEnlaces(contenedor, inicio, pendientes, pasoDelMensaje, fin) {
    contenedor.textContent = inicio;

    pendientes.forEach((pendiente, i) => {
        if (i > 0) contenedor.append(", ");

        const enlace = document.createElement("a");
        enlace.className = "enlace-pendiente";
        enlace.href = `#${pendiente.campo}`;
        enlace.textContent = nombrePendiente(pendiente, pasoDelMensaje);
        enlace.addEventListener("click", (evento) => {
            evento.preventDefault();
            irAlCampo(pendiente.campo);
        });
        contenedor.append(enlace);
    });

    contenedor.append(fin);
}

// Resalta (borde mostaza suave) los campos vacíos que impiden ver el resultado.
// Solo cuando el usuario ya ha empezado: con la página vacía no se marca nada.
function marcarCamposBloqueantes() {
    const empezado = hayDatosIntroducidos();
    const bloqueantes = pendientesDelResultado().map((p) => p.campo);

    ["totalDia", "efectivoReal", "fondoActual"].forEach((id) => {
        const marcar = empezado && bloqueantes.includes(id);
        document.getElementById(id).classList.toggle("is-bloqueante", marcar);
    });
}

// ¿Se puede mostrar ya el veredicto?
// Es la ÚNICA condición: la usan el paso 3 y el resumen (y por tanto el PDF).
function cierreCompleto() {
    return pendientesDelResultado().length === 0;
}

// ¿Ha empezado el usuario a rellenar los datos del día?
function hayDatosDelDia() {
    return ["totalDia", "visa", "uber", "gastos"].some((id) => !campoVacio(id));
}

function mostrarAviso(id, visible) {
    document.getElementById(id).hidden = !visible;
}

// Fondo: independiente de la diferencia de caja
function calcularFondo() {
    const fondoActual = leerCentimos("fondoActual");
    const sumaMonedas = monedasCentimos();
    const totalDisponible = fondoActual + sumaMonedas;
    // Múltiplo de 5 € = múltiplo de 500 céntimos, redondeando hacia abajo
    const fondoFinal = Math.floor(totalDisponible / 500) * 500;
    // Solo informativo: lo que queda fuera del fondo al redondear.
    // No se resta en ningún sitio; ya forma parte del efectivo real.
    const resto = totalDisponible - fondoFinal;
    const fondoObjetivo = leerCentimos("fondoObjetivo");
    const aIngresar = fondoObjetivo - fondoFinal;

    return { fondoActual, sumaMonedas, totalDisponible, fondoFinal, resto, fondoObjetivo, aIngresar };
}

// ---------- Resaltar una cifra que acaba de cambiar ----------
// Es la forma de "ver" el contador sin una barra fija: la cifra que cambia
// hace un destello breve (clase .is-resaltado, animación en el CSS).
// Para repetir la animación hay que quitar la clase, forzar un reflow
// (leer offsetWidth obliga al navegador a recalcular) y volver a ponerla.
function resaltarCambio(elemento) {
    elemento.classList.remove("is-resaltado");
    void elemento.offsetWidth;
    elemento.classList.add("is-resaltado");
}

// Escribe un importe y lo resalta, pero solo si su valor ha cambiado.
// Se compara el valor en céntimos (guardado en data-centimos), no el texto:
// el "0,00 €" del HTML lleva un espacio normal y el de Intl uno que no se
// parte, así que los textos nunca serían iguales.
// La primera vez (al cargar la página) no hay valor anterior: no se resalta.
function escribirImporteResaltado(elemento, centimos) {
    const anterior = elemento.dataset.centimos;
    elemento.dataset.centimos = centimos;
    elemento.textContent = formatearCentimos(centimos);

    if (anterior !== undefined && Number(anterior) !== centimos) {
        resaltarCambio(elemento);
    }
}

// ---------- Cálculo principal ----------
// Escribe el total de cada fila de un panel (p. ej. "resultado1", "resultado2"...)
function mostrarFilas(valores, prefijoCantidad, prefijoResultado) {
    valores.forEach((valor, i) => {
        const total = totalPiezaCentimos(`${prefijoCantidad}${i + 1}`, valor);
        escribirImporteResaltado(document.getElementById(`${prefijoResultado}${i + 1}`), total);
    });
}

function calcularTotal() {
    mostrarFilas(MONEDAS_CENTIMOS, "numero", "resultado");
    mostrarFilas(BILLETES_CENTIMOS, "billete", "resultadoB");

    // Totales al final de cada panel
    escribirImporteResaltado(document.getElementById("subtotalMonedas"), monedasCentimos());
    escribirImporteResaltado(document.getElementById("subtotalBilletes"), billetesCentimos());

    // "Total del contador" (monedas + billetes) sale al final de los dos paneles
    document.querySelectorAll(".js-total-contador").forEach((elemento) => {
        escribirImporteResaltado(elemento, efectivoContadoCentimos());
    });

    calcularCierre();
    actualizarFondo();
}

// ---------- Cierre de caja ----------
// Como la diferencia es un entero, la comparación con 0 ya es exacta.
// "significado" es la frase que explica el veredicto en lenguaje sencillo.
function estadoDiferencia(diferencia) {
    if (diferencia === 0) {
        return {
            estado: "cuadrada",
            etiqueta: "Caja cuadrada",
            significado: "El efectivo coincide con el esperado.",
        };
    }
    if (diferencia > 0) {
        return {
            estado: "sobra",
            etiqueta: "Sobran",
            significado: "Hay más efectivo del que debería haber.",
        };
    }
    return {
        estado: "falta",
        etiqueta: "Faltan",
        significado: "Hay menos efectivo del que debería haber.",
    };
}

function calcularCierre() {
    const efectivoTeorico = efectivoTeoricoCentimos();
    document.getElementById("cifraEfectivoTeorico").innerHTML = htmlCifraGrande(efectivoTeorico);

    mostrarAviso("avisoTeoricoNegativo", efectivoTeorico < 0);
    mostrarAviso("avisoEfectivoRealVacio", efectivoRealVacio() && hayDatosDelDia());

    mostrarResultadoCierre();
    actualizarResumen();
}

// Línea de detalle bajo el resultado: de dónde sale la diferencia.
// "Efectivo real 39,45 € + resto fuera del fondo 0,55 € frente a 40,00 € teóricos"
// Si el resto es 0, esa parte no se muestra.
function textoDetalleResultado() {
    const efectivoReal = formatearCentimos(leerCentimos("efectivoReal"));
    const resto = calcularFondo().resto;
    const teorico = formatearCentimos(efectivoTeoricoCentimos());

    const parteResto = resto === 0 ? "" : ` + resto fuera del fondo ${formatearCentimos(resto)}`;
    return `Efectivo real ${efectivoReal}${parteResto} frente a ${teorico} teóricos`;
}

// Tarjeta "Resultado del cierre" del paso 3
function mostrarResultadoCierre() {
    const tarjeta = document.getElementById("resultadoFinal");
    const estadoTexto = document.getElementById("estadoResultado");
    const cifra = document.getElementById("cifraDiferencia");
    const significado = document.getElementById("significadoResultado");
    const sub = document.getElementById("subResultado");

    // Estado neutro: sin veredicto, sin importe y sin colores de resultado
    // (los colores dependen de data-estado, así que basta con quitarlo).
    // En su lugar se dice qué falta, con la misma lista que decide cierreCompleto().
    // Cada dato que falta es un enlace a su campo.
    marcarCamposBloqueantes();
    if (!cierreCompleto()) {
        delete tarjeta.dataset.estado;
        estadoTexto.hidden = true;
        cifra.hidden = true;
        significado.hidden = true;
        escribirPendientesConEnlaces(sub, "Falta: ", pendientesDelResultado(), 3, "");
        return;
    }

    const diferencia = diferenciaCentimos();
    const resultado = estadoDiferencia(diferencia);

    tarjeta.dataset.estado = resultado.estado;
    estadoTexto.hidden = false;
    estadoTexto.textContent = resultado.etiqueta;
    cifra.hidden = false;
    cifra.textContent = formatearCentimos(Math.abs(diferencia));
    significado.hidden = false;
    significado.textContent = resultado.significado;
    sub.textContent = textoDetalleResultado();
}

// ---------- Fondo de caja ----------
function actualizarFondo() {
    const fondo = calcularFondo();

    escribirImporte("cifraSumaMonedas", fondo.sumaMonedas);
    escribirImporte("cifraTotalDisponible", fondo.totalDisponible);
    escribirImporte("cifraFondoFinal", fondo.fondoFinal);

    // La línea del resto solo aparece si hay céntimos fuera del fondo
    escribirImporte("cifraRestoFondo", fondo.resto);
    document.getElementById("bloqueRestoFondo").hidden = fondo.resto === 0;

    const cifraAIngresar = document.getElementById("cifraAIngresar");
    if (document.getElementById("fondoObjetivo").value.trim() === "") {
        cifraAIngresar.textContent = "— €";
    } else {
        cifraAIngresar.innerHTML = htmlCifraGrande(fondo.aIngresar);
    }

    // El fondo actual cambia el resto (que entra en la diferencia) y decide si
    // el cierre está completo: el resultado del paso 3 se refresca también aquí.
    mostrarResultadoCierre();
    actualizarResumen();
}

// ---------- Resumen del cierre ----------
function escribirImporte(id, centimos) {
    document.getElementById(id).textContent = formatearCentimos(centimos);
}

// Igual que escribirImporte, pero para una cifra que sale en varios sitios
// (p. ej. el fondo final, en las cifras clave y en el desglose): todos los
// elementos con esa clase reciben el mismo valor.
function escribirImporteEnTodos(selector, centimos) {
    document.querySelectorAll(selector).forEach((elemento) => {
        elemento.textContent = formatearCentimos(centimos);
    });
}

// Texto de la diferencia con el cierre completo, igual que en el paso 3:
// "Sobran 2,30 €", "Faltan 1,00 €" o "Caja cuadrada"
function textoDiferencia(diferencia) {
    const { estado, etiqueta } = estadoDiferencia(diferencia);
    if (estado === "cuadrada") return etiqueta;
    return `${etiqueta} ${formatearCentimos(Math.abs(diferencia))}`;
}

// La diferencia sale dos veces en el resumen: en las cifras clave (arriba) y
// en la tarjeta "Cierre del día" del desglose (la que se imprime). Las dos
// filas llevan la clase "js-diferencia".
// Con el cierre incompleto se muestra "—" y sin color.
function mostrarDiferenciaResumen(diferencia) {
    const completo = cierreCompleto();
    const estado = completo ? estadoDiferencia(diferencia).estado : "";
    const texto = completo ? textoDiferencia(diferencia) : "—";

    document.querySelectorAll(".js-diferencia").forEach((fila) => {
        fila.dataset.estado = estado;
        fila.querySelector("dd").textContent = texto;
    });
}

// "A ingresar" también sale en el resumen (cifras clave y desglose):
// se copia del paso 2 (incluye el "— €")
function mostrarAIngresarResumen() {
    const texto = document.getElementById("cifraAIngresar").textContent;
    document.querySelectorAll(".js-a-ingresar dd").forEach((dd) => {
        dd.textContent = texto;
    });
}

// Responsable en la cabecera del resumen, junto a la fecha.
// Si no hay nombre escrito, la línea se oculta (no se muestra "—").
function mostrarResponsableResumen() {
    const nombre = document.getElementById("responsable").value.trim();
    const cabecera = document.getElementById("resumenResponsableCabecera");
    cabecera.textContent = nombre;
    cabecera.hidden = nombre === "";
}

// Estado del cierre: dice si falta INFORMACIÓN, no si el resultado es bueno.
// Usa la misma condición que el resultado del paso 3 (cierreCompleto) y la
// misma lista de pendientes, así nunca se contradicen.
// Se escribe en dos sitios: la frase del paso 4 y la etiqueta de la cabecera.
function mostrarEstadoCierre() {
    const completo = cierreCompleto();
    const pendientes = pendientesDelResultado();
    // El 4 es el paso del mensaje: todos los pendientes dicen en qué paso están
    const frase = completo
        ? "Cierre completo. Ya puedes descargar el resumen."
        : `Cierre pendiente: faltan ${textoPendientes(pendientes, 4)}.`;

    const estadoPaso4 = document.getElementById("estadoCierre");
    // Solo se reescribe si cambia, para que el lector de pantalla
    // (aria-live) no repita la frase con cada tecla
    if (estadoPaso4.textContent !== frase) {
        if (completo) {
            estadoPaso4.textContent = frase;
        } else {
            // Mismo texto, pero con cada pendiente como enlace a su campo
            escribirPendientesConEnlaces(estadoPaso4, "Cierre pendiente: faltan ", pendientes, 4, ".");
        }
    }
    estadoPaso4.dataset.estado = completo ? "completo" : "pendiente";

    const etiqueta = document.getElementById("estadoCierreCabecera");
    etiqueta.textContent = completo ? "Completo" : "Pendiente";
    etiqueta.dataset.estado = completo ? "completo" : "pendiente";
}

function actualizarResumen() {
    document.getElementById("resumenResponsable").textContent = document.getElementById("responsable").value || "—";
    mostrarResponsableResumen();

    escribirImporte("resumenMonedas", monedasCentimos());
    escribirImporte("resumenBilletes", billetesCentimos());
    escribirImporte("resumenTotalContado", efectivoContadoCentimos());

    escribirImporte("resumenTotalDia", leerCentimos("totalDia"));
    escribirImporte("resumenVisa", leerCentimos("visa"));
    escribirImporte("resumenUber", leerCentimos("uber"));
    escribirImporte("resumenGastos", leerCentimos("gastos"));
    escribirImporte("resumenEfectivoTeorico", efectivoTeoricoCentimos());
    const fondo = calcularFondo();
    // Efectivo real + resto fuera del fondo, ya sumados en una sola cifra
    escribirImporte("resumenEfectivoReal", leerCentimos("efectivoReal") + fondo.resto);
    mostrarDiferenciaResumen(diferenciaCentimos());

    escribirImporte("resumenFondoActual", fondo.fondoActual);
    escribirImporte("resumenSumaMonedas", fondo.sumaMonedas);
    escribirImporte("resumenTotalDisponible", fondo.totalDisponible);
    escribirImporteEnTodos(".js-fondo-final", fondo.fondoFinal);
    escribirImporteEnTodos(".js-resto-fondo", fondo.resto);
    // En las cifras clave, el resto solo aparece si hay céntimos fuera del fondo
    document.querySelector(".js-fila-resto").hidden = fondo.resto === 0;
    escribirImporte("resumenFondoObjetivo", fondo.fondoObjetivo);
    mostrarAIngresarResumen();

    mostrarEstadoCierre();
    actualizarEstadoPasos();
}

// ---------- Nuevo cierre ----------
function hayDatosIntroducidos() {
    const inputs = document.querySelectorAll(".main input");
    return Array.from(inputs).some((input) => input.value.trim() !== "");
}

function nuevoCierre() {
    const mensaje = "¿Empezar un cierre nuevo? Se borrarán todos los datos que has introducido.";
    if (hayDatosIntroducidos() && !confirm(mensaje)) return;

    document.querySelectorAll(".main input").forEach((input) => {
        input.value = "";
    });
    document.getElementById("desgloseResumen").open = false;
    mostrarPanel("monedas");

    calcularTotal(); // recalcula todo: contador, cierre, fondo y resumen
    window.scrollTo({ top: 0, behavior: "smooth" });
}

// ---------- Estado "completado" de los pasos (según datos, no scroll) ----------
function pasoTieneDatos(paso) {
    switch (paso) {
        case "efectivo":
            return efectivoContadoCentimos() > 0;
        case "datos":
            return (
                document.getElementById("responsable").value.trim() !== "" ||
                leerCentimos("totalDia") > 0 ||
                leerCentimos("visa") > 0 ||
                leerCentimos("uber") > 0 ||
                leerCentimos("gastos") > 0 ||
                leerCentimos("efectivoReal") > 0
            );
        case "fondo":
            return leerCentimos("fondoActual") > 0 || leerCentimos("fondoObjetivo") > 0;
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

    document.title = `Federal - ${responsable} - ${fecha}`;
    window.print();
    document.title = tituloOriginal;
}

// El desglose está plegado en pantalla, pero el PDF debe incluirlo.
// Se abre antes de imprimir y se deja como estaba al terminar
// (también funciona si se imprime con Ctrl+P).
let desgloseAbiertoAntesDeImprimir = false;

window.addEventListener("beforeprint", () => {
    const desglose = document.getElementById("desgloseResumen");
    desgloseAbiertoAntesDeImprimir = desglose.open;
    desglose.open = true;
});

window.addEventListener("afterprint", () => {
    document.getElementById("desgloseResumen").open = desgloseAbiertoAntesDeImprimir;
});

// ---------- Indicador de progreso ----------
// ---------- Desplazamiento entre pasos ----------
// Alto real de la barra pegada arriba, para no dejar la sección tapada.
// (La franja del contador cuelga debajo sin ocupar sitio: no cuenta.)
function alturaBarraPasos() {
    const barra = document.getElementById("barraSuperior");
    return barra ? barra.getBoundingClientRect().height : 0;
}

// Desplazamiento suave, salvo si el usuario pidió reducir el movimiento
function comportamientoScroll() {
    const reducir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    return reducir ? "auto" : "smooth";
}

// Desplazamiento manual: evita depender solo de scroll-margin-top, que no
// se reajusta si el alto de la página cambia tras la carga (p. ej. al
// terminar de cargar la tipografía web).
// La usan la barra de pasos y los botones "Siguiente".
function irASeccion(id, comportamiento) {
    const elemento = document.getElementById(id);
    if (!elemento) return;

    // El paso 1 sube hasta el principio de la página para que se vea la cabecera.
    if (id === "pasoEfectivo") {
        window.scrollTo({ top: 0, behavior: comportamiento });
        return;
    }

    const destino = elemento.getBoundingClientRect().top + window.scrollY - alturaBarraPasos() - 8;
    window.scrollTo({ top: Math.max(destino, 0), behavior: comportamiento });
}

// Botones "Siguiente": desplaza al paso indicado y le pasa el foco a su
// título, para que con teclado o lector de pantalla también se "llegue" al
// paso nuevo. preventScroll evita que el foco haga un salto brusco.
// La barra de pasos se actualiza sola con el IntersectionObserver.
function irAlPaso(idSeccion) {
    irASeccion(idSeccion, comportamientoScroll());
    history.pushState(null, "", `#${idSeccion}`);

    const titulo = document.querySelector(`#${idSeccion} .seccion__titulo`);
    if (titulo) titulo.focus({ preventScroll: true });
}

// Enlaces de "Falta: …": desplaza hasta el campo (dejando sitio a la barra
// de pasos y a su etiqueta) y le pasa el foco para escribir directamente.
function irAlCampo(idCampo) {
    const campo = document.getElementById(idCampo);
    if (!campo) return;

    const contenedor = campo.closest(".campo") || campo;
    const destino = contenedor.getBoundingClientRect().top + window.scrollY - alturaBarraPasos() - 16;
    window.scrollTo({ top: Math.max(destino, 0), behavior: comportamientoScroll() });
    campo.focus({ preventScroll: true });
}

function inicializarPasos() {
    // El paso 1 no tiene un contenedor propio: se vigilan su título, el
    // selector y los dos paneles, para detectar el paso 1 también cuando el
    // usuario está a mitad del contador (con el título fuera de pantalla).
    // La cabecera también cuenta como paso 1: arriba del todo, el título
    // queda por debajo de la zona vigilada y ningún otro elemento entra en ella.
    const objetivos = [
        { id: "cabecera", paso: "efectivo" },
        { id: "pasoEfectivo", paso: "efectivo" },
        { id: "selector", paso: "efectivo" },
        { id: "panelMonedas", paso: "efectivo" },
        { id: "panelBilletes", paso: "efectivo" },
        { id: "seccionFondo", paso: "fondo" },
        { id: "seccionDatos", paso: "datos" },
        { id: "seccionResumen", paso: "resumen" },
    ];
    const enlaces = document.querySelectorAll(".pasos__paso");

    let pasoActual = "efectivo";

    function marcarActivo(pasoActivo) {
        pasoActual = pasoActivo;
        enlaces.forEach((enlace) => {
            enlace.classList.toggle("is-activo", enlace.dataset.paso === pasoActivo);
        });
        actualizarFranjaContador();
    }

    // La franja del total contado solo aparece mientras se cuenta: en el
    // paso 1 y cuando el selector Monedas/Billetes ya ha subido por debajo
    // de la barra (antes, el total aún está a la vista y la franja taparía
    // la introducción).
    function actualizarFranjaContador() {
        const selector = document.getElementById("selector");
        const contando = selector.getBoundingClientRect().bottom < alturaBarraPasos();
        document.getElementById("franjaContador").hidden = !(pasoActual === "efectivo" && contando);
    }

    window.addEventListener("scroll", actualizarFranjaContador, { passive: true });

    enlaces.forEach((enlace) => {
        enlace.addEventListener("click", (evento) => {
            const id = enlace.getAttribute("href").slice(1);
            const objetivo = objetivos.find((o) => o.id === id);
            if (!objetivo) return;
            evento.preventDefault();
            marcarActivo(objetivo.paso);
            irASeccion(id, comportamientoScroll());
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
        { rootMargin: `-${Math.ceil(alturaBarraPasos()) + 1}px 0px -65% 0px` }
    );

    objetivos.forEach(({ id }) => {
        const elemento = document.getElementById(id);
        if (elemento) observador.observe(elemento);
    });

    // Al final de la página el paso activo es el último: el resumen es corto
    // (con el desglose plegado) y puede no llegar nunca a la zona vigilada.
    window.addEventListener("scroll", () => {
        const alFinal = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
        if (alFinal) marcarActivo("resumen");
    }, { passive: true });

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
