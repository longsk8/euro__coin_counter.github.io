function calcularTotal() {
    // Obtener la cantidad de cada moneda
    let cantidad1 = parseInt(document.getElementById("numero1").value) || 0;
    let cantidad2 = parseInt(document.getElementById("numero2").value) || 0;
    let cantidad3 = parseInt(document.getElementById("numero3").value) || 0;
    let cantidad4 = parseInt(document.getElementById("numero4").value) || 0;
    let cantidad5 = parseInt(document.getElementById("numero5").value) || 0;
    let cantidad6 = parseInt(document.getElementById("numero6").value) || 0;
    let cantidad7 = parseInt(document.getElementById("numero7").value) || 0;
    let cantidad8 = parseInt(document.getElementById("numero8").value) || 0;

    // Calcular el total para cada tipo de moneda
    let total1 = cantidad1 * 2;
    let total2 = cantidad2 * 1;
    let total3 = cantidad3 * 0.5;
    let total4 = cantidad4 * 0.2;
    let total5 = cantidad5 * 0.1;
    let total6 = cantidad6 * 0.05;
    let total7 = cantidad7 * 0.02;
    let total8 = cantidad8 * 0.01;

    // Mostrar el total para cada tipo de moneda
    document.getElementById("resultado1").textContent = total1.toFixed(2);
    document.getElementById("resultado2").textContent = total2.toFixed(2);
    document.getElementById("resultado3").textContent = total3.toFixed(2);
    document.getElementById("resultado4").textContent = total4.toFixed(2);
    document.getElementById("resultado5").textContent = total5.toFixed(2);
    document.getElementById("resultado6").textContent = total6.toFixed(2);
    document.getElementById("resultado7").textContent = total7.toFixed(2);
    document.getElementById("resultado8").textContent = total8.toFixed(2);

    // Calcular el total general
    let totalGeneral = total1 + total2 + total3 + total4 + total5 + total6 + total7 + total8;

    // Mostrar el total general
    document.getElementById("totalGeneral").textContent = totalGeneral.toFixed(2);
}