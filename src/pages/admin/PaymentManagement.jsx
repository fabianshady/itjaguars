import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';

function PaymentManagement() {
    const [pagos, setPagos] = useState([]);
    const [jugador, setJugador] = useState('');
    const [tipoPago, setTipoPago] = useState('partido'); // Valor por defecto
    const [cantidad, setCantidad] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const pagosCollectionRef = collection(db, 'pagos');

    // --- Carga inicial de pagos ---
    const fetchPagos = async () => {
        setLoading(true);
        setError(null);
        try {
            // Ordenar por fecha de pago descendente
            const q = query(pagosCollectionRef, orderBy('fechaPago', 'desc'));
            const data = await getDocs(q);
            setPagos(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
        } catch (err) {
            console.error("Error fetching pagos:", err);
            setError("No se pudieron cargar los pagos.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPagos();
    }, []);

    // --- Añadir nuevo pago ---
    const handleAddPago = async (e) => {
        e.preventDefault();
        if (!jugador || !tipoPago || !cantidad || isNaN(parseFloat(cantidad)) || parseFloat(cantidad) <= 0) {
            alert("Completa todos los campos correctamente (la cantidad debe ser un número positivo).");
            return;
        }
        setSubmitting(true);
        setError(null);
        try {
            await addDoc(pagosCollectionRef, {
                jugador: jugador.trim(),
                tipo: tipoPago,
                cantidad: parseFloat(cantidad),
                fechaPago: serverTimestamp() // Guarda la fecha del servidor
            });
            setJugador('');
            setTipoPago('partido');
            setCantidad('');
            await fetchPagos(); // Recarga la lista
        } catch (err) {
            console.error("Error adding pago:", err);
            setError("No se pudo añadir el pago.");
        } finally {
            setSubmitting(false);
        }
    };

    // --- Eliminar pago ---
    const handleDeletePago = async (id) => {
        if (!window.confirm("¿Estás seguro de eliminar este registro de pago?")) return;
        setError(null);
        try {
            const pagoDoc = doc(db, 'pagos', id);
            await deleteDoc(pagoDoc);
            setPagos(pagos.filter((p) => p.id !== id)); // Actualiza UI local
        } catch (err) {
            console.error("Error deleting pago:", err);
            setError("No se pudo eliminar el pago.");
        }
    };

    // --- Calcular totales por jugador (para mostrar deuda/pagado) ---
    const calcularSaldos = () => {
        const saldos = {};
        pagos.forEach(pago => {
            saldos[pago.jugador] = (saldos[pago.jugador] || 0) + pago.cantidad;
        });
        // Aquí necesitarías lógica para calcular cuánto *debería* haber pagado cada uno
        // Por ahora, solo mostramos el total pagado.
        // Ejemplo: Podrías tener otra colección 'deudas' o calcular basado en partidos jugados, etc.
        return Object.entries(saldos).map(([jugador, totalPagado]) => ({
            jugador,
            totalPagado
            // totalDeuda: ..., // Calcular esto
            // saldo: totalPagado - totalDeuda // Calcular esto
        })).sort((a, b) => a.jugador.localeCompare(b.jugador));
    };

    const saldosJugadores = calcularSaldos();

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Gestión de Pagos</h2>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

            {/* Formulario para añadir pago */}
            <form onSubmit={handleAddPago} className="p-4 border rounded-md bg-white shadow space-y-4">
                <h3 className="text-lg font-medium">Registrar Nuevo Pago</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <div>
                         <label htmlFor="jugador" className="block text-sm font-medium text-gray-700">Jugador</label>
                         <input type="text" id="jugador" value={jugador} onChange={(e) => setJugador(e.target.value)} required className="input-field" placeholder="Nombre Apellido" disabled={submitting}/>
                     </div>
                     <div>
                         <label htmlFor="tipoPago" className="block text-sm font-medium text-gray-700">Tipo de Pago</label>
                         <select id="tipoPago" value={tipoPago} onChange={(e) => setTipoPago(e.target.value)} required className="input-field" disabled={submitting}>
                            <option value="inscripción">Inscripción</option>
                            <option value="partido">Partido</option>
                            <option value="entrenamiento">Entrenamiento</option>
                            <option value="otro">Otro</option>
                          </select>
                     </div>
                     <div>
                         <label htmlFor="cantidad" className="block text-sm font-medium text-gray-700">Monto ($)</label>
                         <input type="number" id="cantidad" value={cantidad} onChange={(e) => setCantidad(e.target.value)} required min="0.01" step="0.01" className="input-field" placeholder="50.00" disabled={submitting}/>
                     </div>
                </div>
                <Button type="submit" variant="primary" disabled={submitting}>
                  {submitting ? 'Registrando...' : 'Registrar Pago'}
                </Button>
            </form>

             {/* Tabla de Saldos por Jugador */}
             <div className="mt-8">
                 <h3 className="text-lg font-medium mb-2">Saldos por Jugador (Total Pagado)</h3>
                 {loading ? <LoadingSpinner /> : saldosJugadores.length === 0 ? <p>No hay pagos registrados.</p> : (
                     <div className="overflow-x-auto">
                         <table className="min-w-full divide-y divide-gray-200 border">
                             <thead className="bg-gray-100">
                                 <tr><th>Jugador</th><th>Total Pagado</th>{/*<th>Deuda Total</th><th>Saldo</th>*/}</tr>
                             </thead>
                             <tbody className="bg-white divide-y divide-gray-200">
                                 {saldosJugadores.map(saldo => (
                                     <tr key={saldo.jugador}>
                                         <td>{saldo.jugador}</td>
                                         <td>${saldo.totalPagado.toFixed(2)}</td>
                                         {/*<td>${saldo.totalDeuda.toFixed(2)}</td>*/}
                                         {/*<td className={saldo.saldo >= 0 ? 'text-green-600' : 'text-red-600'}>${saldo.saldo.toFixed(2)}</td>*/}
                                     </tr>
                                 ))}
                             </tbody>
                         </table>
                     </div>
                 )}
                 <p className="text-xs text-gray-500 mt-2">Nota: La deuda y el saldo requieren lógica adicional para calcularse.</p>
             </div>


            {/* Lista detallada de todos los pagos (para eliminar) */}
            <div className="mt-8">
                <h3 className="text-lg font-medium mb-2">Historial de Pagos Registrados</h3>
                {loading ? <LoadingSpinner /> : pagos.length === 0 ? <p>No hay pagos registrados.</p> : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 border">
                            <thead className="bg-gray-100">
                                <tr><th>Fecha</th><th>Jugador</th><th>Tipo</th><th>Cantidad</th><th>Acciones</th></tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {pagos.map((pago) => (
                                    <tr key={pago.id}>
                                        <td className="text-xs">
                                            {pago.fechaPago?.toDate()?.toLocaleString() ?? 'Pendiente...'}
                                        </td>
                                        <td>{pago.jugador}</td>
                                        <td>{pago.tipo}</td>
                                        <td>${pago.cantidad.toFixed(2)}</td>
                                        <td>
                                            <Button onClick={() => handleDeletePago(pago.id)} variant="danger" className="text-xs px-2 py-1">Eliminar</Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Estilo reutilizable para inputs (añadir en index.css o aquí) */}
            <style jsx>{`
                .input-field {
                    @apply mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm;
                }
            `}</style>
        </div>
    );
}

export default PaymentManagement;