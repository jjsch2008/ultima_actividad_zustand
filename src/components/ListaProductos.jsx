import { useEffect, useState } from 'react'
import { obtenerProductos } from '../data/productos'
// Importamos el hook del store.
import { useCarritoStore } from '../store/useCarritoStore'

// Fake Store API devuelve los precios en dólares; se muestran con ese formato.
const formatoPrecio = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

// ListaProductos muestra el catálogo y permite agregar productos al carrito.
function ListaProductos() {
  // El catálogo y los estados de carga/error son estado local de este componente.
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  // Del store solo necesitamos la acción para agregar.
  const agregarProducto = useCarritoStore((state) => state.agregarProducto)

  useEffect(() => {
    // AbortController cancela la petición si el componente se desmonta.
    const controlador = new AbortController()

    async function cargarProductos() {
      try {
        setCargando(true)
        setError('')

        const datos = await obtenerProductos(controlador.signal)
        setProductos(datos)
      } catch (errorPeticion) {
        // Una petición cancelada no debe mostrarse como error.
        if (errorPeticion.name !== 'AbortError') {
          setError(
            'No se pudieron cargar los productos. Verifica tu conexión e intenta de nuevo.',
          )
        }
      } finally {
        // Solo actualizamos el estado si la petición sigue vigente.
        if (!controlador.signal.aborted) {
          setCargando(false)
        }
      }
    }

    cargarProductos()

    // Limpieza: se ejecuta al desmontar el componente.
    return () => controlador.abort()
  }, [])

  return (
    // section agrupa todo el catálogo; panel le da apariencia de tarjeta.
    <section className="panel">
      <h2>Productos</h2>

      {/* Mensajes de carga y error de la petición a la API */}
      {cargando && <p className="vacio">Cargando productos…</p>}
      {error && <p className="error">{error}</p>}

      {/* Recorremos los productos y creamos una fila por cada uno. */}
      {!cargando &&
        !error &&
        productos.map((producto) => (
          <div key={producto.id} className="fila">
            {/* Bloque con el nombre y el precio */}
            <div>
              <p className="fila-nombre">{producto.nombre}</p>
              <p className="fila-detalle">
                {formatoPrecio.format(producto.precio)}
              </p>
            </div>

            {/* Enviamos el producto completo a la acción del store */}
            <button
              type="button"
              className="btn btn-primario"
              onClick={() => agregarProducto(producto)}
            >
              Agregar
            </button>
          </div>
        ))}
    </section>
  )
}

// Exportamos el componente.
export default ListaProductos 
