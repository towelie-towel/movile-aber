class ProyectoInvestigación {
    constructor(título, investigadores, fechaInicio) {
        this.título = título;
        this.investigadores = investigadores;
        this.fechaInicio = fechaInicio;
    }
}

const proyectos = [];

const proyecto1 = new ProyectoInvestigación("Proyecto A", ["Investigador 1", "Investigador 2"], "2023-01-15");
const proyecto2 = new ProyectoInvestigación("Proyecto B", ["Investigador 2", "Investigador 3"], "2023-02-20");
const proyecto3 = new ProyectoInvestigación("Proyecto C", ["Investigador 1", "Investigador 3"], "2023-03-10");

proyectos.push(proyecto1);
proyectos.push(proyecto2);
proyectos.push(proyecto3);

console.log(proyectos);