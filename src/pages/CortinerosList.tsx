import { useState, useMemo } from 'react';
import { Search, Filter, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CortineroCard } from '@/components/CortineroCard';
import { cortineros } from '@/data/mockData';
import { FiltroTipo } from '@/types/cortinero';
import { cn } from '@/lib/utils';

const filtros: { value: FiltroTipo; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'deben', label: 'Con deuda' },
  { value: 'al-dia', label: 'Al día' },
  { value: 'deuda-alta', label: 'Deuda alta' },
  { value: 'pagos-recientes', label: 'Pagos recientes' },
];

export default function CortinerosList() {
  const [busqueda, setBusqueda] = useState('');
  const [filtroActivo, setFiltroActivo] = useState<FiltroTipo>('todos');

  const cortinerosFiltrados = useMemo(() => {
    let resultado = [...cortineros];

    // Search filter
    if (busqueda) {
      resultado = resultado.filter((c) =>
        c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        c.zona.toLowerCase().includes(busqueda.toLowerCase())
      );
    }

    // Type filter
    switch (filtroActivo) {
      case 'deben':
        resultado = resultado.filter((c) => c.saldo < 0);
        break;
      case 'al-dia':
        resultado = resultado.filter((c) => c.saldo >= 0);
        break;
      case 'deuda-alta':
        resultado = resultado.filter((c) => c.saldo < -50000);
        break;
      case 'pagos-recientes':
        const tresDiasAtras = new Date();
        tresDiasAtras.setDate(tresDiasAtras.getDate() - 3);
        resultado = resultado.filter((c) => c.ultimoMovimiento >= tresDiasAtras);
        break;
    }

    // Sort by debt amount
    resultado.sort((a, b) => a.saldo - b.saldo);

    return resultado;
  }, [busqueda, filtroActivo]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Cortineros</h1>
          <p className="text-muted-foreground mt-1">
            {cortineros.length} cortineros registrados
          </p>
        </div>
        <Button className="w-full sm:w-auto">
          <Users className="h-4 w-4 mr-2" />
          Nuevo Cortinero
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o zona..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-12 h-12 text-base rounded-xl"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          {filtros.map((filtro) => (
            <button
              key={filtro.value}
              onClick={() => setFiltroActivo(filtro.value)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200',
                filtroActivo === filtro.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              {filtro.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {cortinerosFiltrados.length === 0 ? (
        <div className="text-center py-16">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground">No se encontraron cortineros</h3>
          <p className="text-muted-foreground mt-1">
            Intenta con otros términos de búsqueda o filtros
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {cortinerosFiltrados.map((cortinero, index) => (
            <CortineroCard key={cortinero.id} cortinero={cortinero} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
