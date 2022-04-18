// Variables y selectores
const formulario = document.querySelector('#agregar-gasto');
const gastoListado = document.querySelector('#gastos ul');

// Eventos
eventListeners();
function eventListeners(){
  document.addEventListener('DOMContentLoaded', preguntarPresupuesto);

  formulario.addEventListener('submit', agregarGasto);
}


// Clases
class Presupuesto{
  constructor(presupuesto){
    this.presupuesto = Number(presupuesto);
    this.restante = Number(presupuesto);
    this.gastos = [];
  }

  // Método para agregar el gasto al array:
  nuevoGasto(gasto){
    this.gastos = [...this.gastos, gasto];

    // Llamar el método que actualiza el restante del presupuesto
    this.calcularRestante();
  }

  calcularRestante(){
    const gastado = this.gastos.reduce((total, gasto) => total + gasto.cantidad, 0);
    this.restante = this.presupuesto - gastado;
  }

  eliminarGasto(id){
    this.gastos = this.gastos.filter(gasto => gasto.id !== id);
    this.calcularRestante();
  }
}

class UI{
  // No requerimos que tenga constructor porque es una clase que solo imprime HTML
  insertarPresupuesto(cantidad){
    // Extrayendo el valor destructurando el objeto cantidad
    const {presupuesto, restante} = cantidad;

    // Agregar al HTML
    document.querySelector('#total').textContent = presupuesto;
    document.querySelector('#restante').textContent = restante;
  }

  imprimirAlerta(mensaje, tipo){
    // Crear div
    const divMensaje = document.createElement('div');
    divMensaje.classList.add('text-center', 'alert');

    if(tipo === 'error'){
      divMensaje.classList.add('alert-danger');
    }else{
      divMensaje.classList.add('alert-success');
    }

    // Agregar el mensaje
    divMensaje.textContent = mensaje;

    // Isertar en HTML
    document.querySelector('.primario').insertBefore(divMensaje, formulario);

    // Quitar el mensaje del HTML
    setTimeout(() => {
      divMensaje.remove();
    }, 3000);
  }

  mostrarGastos(gastos){
    // Elimina el HTML previo
    this.limpiarHTML();

    // Iterar sobre los gastos
    gastos.forEach(gasto => {
      // Destructurar el gasto
      const {cantidad, nombre, id} = gasto;

      // Crear un elemento li
      const nuevoGasto = document.createElement('li');
      nuevoGasto.className = 'list-group-item d-flex justify-content-between align-items-center';
      
      nuevoGasto.dataset.id = id;
      
      // Agregar el HTML del gasto
      nuevoGasto.innerHTML = `
        ${nombre} <span class="badge badge-primary badge-pill"> $ ${cantidad} </span>`;

      // Botón para eliminar el gasto
      const btnBorrar = document.createElement('button');
      btnBorrar.classList.add('btn', 'btn-danger', 'borrar-gasto');
      btnBorrar.innerHTML = 'Borrar &times';

      // Eliminar el gasto al hacer click en el botón de eliminar
      btnBorrar.onclick = () => {
        eliminarGasto(id);
      }

      nuevoGasto.appendChild(btnBorrar);

      // Agregar al HTML
      gastoListado.appendChild(nuevoGasto);
    });
  }

  limpiarHTML(){
    while(gastoListado.firstChild){
      gastoListado.removeChild(gastoListado.firstChild);
    }
  }

  actualizarRestante(restante){
    document.querySelector('#restante').textContent = restante;
  }

  comprobarPresupuesto(presupuestObj){
    const {presupuesto, restante} = presupuestObj;

    const restanteDiv = document.querySelector('.restante');

    // Comprobar 25%
    if((presupuesto / 4) > restante){
      restanteDiv.classList.remove('alert-success', 'alert-warning');
      restanteDiv.classList.add('alert-danger');
    }else if((presupuesto / 2) > restante){
      restanteDiv.classList.remove('alert-success');
      restanteDiv.classList.add('alert-warning');
    }else{
      restanteDiv.classList.remove('alert-danger', 'alert-warning');
      restanteDiv.classList.add('alert-success');
    }

    // Si el total es menor a 0
    if(restante <= 0){
      ui.imprimirAlerta('El presupuesto se ha agotado', 'error');

      formulario.querySelector('button[type="submit"]').disabled = true;
    }
  }
}

// Instanciar UI
const ui = new UI();

let presupuesto;


// Funciones
function preguntarPresupuesto(){
  const presupuestoUsuario = prompt('¿Cual es tu presupuesto?');

  if(presupuestoUsuario === '' || presupuestoUsuario === null || isNaN(presupuestoUsuario) || presupuestoUsuario <= 0){
    window.location.reload();
  }

  // Presupuesto válido
  presupuesto = new Presupuesto(presupuestoUsuario);

  ui.insertarPresupuesto(presupuesto);
}

// Añadir Gatos
function agregarGasto(e){
  e.preventDefault();

  // Leer los datos del formulario
  const nombre = document.querySelector('#gasto').value;
  const cantidad = Number(document.querySelector('#cantidad').value);

  // Validar
  if(nombre === '' || cantidad === ''){
    ui.imprimirAlerta('¡Ambos campos son obligatorios!', 'error');
    return;
  }else if(cantidad <= 0 || isNaN(cantidad)){
    ui.imprimirAlerta('¡Cantidad no válida!', 'error');
    return;
  }

  // Crear un objeto con el gasto
  // Esta sintaxis es lo contrario a destructurar:
  const gasto = {nombre, cantidad, id: Date.now()};

  // Añade un nuevo gasto
  presupuesto.nuevoGasto(gasto);

  // Mensaje de gasto agregado
  ui.imprimirAlerta('Gasto agregado correctamente');

  // Imprimir los gastos
  const {gastos, restante} = presupuesto;
  ui.mostrarGastos(gastos);

  // Actualizar restante
  ui.actualizarRestante(restante);

  ui.comprobarPresupuesto(presupuesto);

  // Reinicio del formulario
  formulario.reset();
}

function eliminarGasto(id){
  // Eliminar los gastos del objeto
  presupuesto.eliminarGasto(id);

  // Eliminar los gastos del HTML
  const {gastos, restante} = presupuesto;
  ui.mostrarGastos(gastos);

  ui.actualizarRestante(restante);

  ui.comprobarPresupuesto(presupuesto);
}