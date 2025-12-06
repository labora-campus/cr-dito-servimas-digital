import { Link } from 'react-router-dom';
import { TrendingDown, Users, ArrowUpCircle, ArrowDownCircle, ChevronRight } from 'lucide-react';
import { StatCard } from '@/components/StatCard';
import { cortineros, movimientos } from '@/data/mockData';
import { cn, formatCurrency, formatDate } from '@/lib/utils';

export default function Dashboard() {
  // Calculate stats
  const totalDeuda = cortineros.reduce((acc, c) => acc + (c.saldo < 0 ? Math.abs(c.saldo) : 0), 0);
  const cortinerosConDeuda = cortineros.filter((c) => c.saldo < 0).length;
  const ultimosPagos = movimientos.filter((m) => m.tipo === 'pago').slice(0, 5);
  const ultimasEntregas = movimientos.filter((m) => m.tipo === 'entrega').slice(0, 5);
  
  // Top debtors
  const topDeudores = [...cortineros]
    .filter((c) => c.saldo < 0)
    .sort((a, b) => a.saldo - b.saldo)
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Vista general de cuentas corrientes</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Deuda Total"
          value={formatCurrency(totalDeuda)}
          subtitle="Saldo pendiente de cobro"
          icon={TrendingDown}
          variant="destructive"
        />
        <StatCard
          title="Cortineros"
          value={cortineros.length.toString()}
          subtitle={`${cortinerosConDeuda} con deuda activa`}
          icon={Users}
          variant="primary"
        />
        <StatCard
          title="Pagos del Mes"
          value={formatCurrency(ultimosPagos.reduce((acc, p) => acc + p.importe, 0))}
          subtitle={`${ultimosPagos.length} transacciones`}
          icon={ArrowUpCircle}
          variant="success"
        />
        <StatCard
          title="Entregas del Mes"
          value={formatCurrency(ultimasEntregas.reduce((acc, e) => acc + e.importe, 0))}
          subtitle={`${ultimasEntregas.length} entregas`}
          icon={ArrowDownCircle}
        />
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Deudores */}
        <div className="rounded-2xl bg-card border border-border p-6 animate-slide-up">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">Ranking de Deudores</h2>
            <Link
              to="/cortineros"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              Ver todos <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="space-y-4">
            {topDeudores.map((cortinero, index) => (
              <Link
                key={cortinero.id}
                to={`/cortineros/${cortinero.id}`}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors group"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-bold">
                  {index + 1}
                </span>
                <img
                  src={cortinero.foto}
                  alt={cortinero.nombre}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                    {cortinero.nombre}
                  </p>
                  <p className="text-xs text-muted-foreground">{cortinero.zona}</p>
                </div>
                <span className="text-destructive font-bold">
                  -{formatCurrency(Math.abs(cortinero.saldo))}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-2xl bg-card border border-border p-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <h2 className="text-lg font-semibold text-foreground mb-6">Actividad Reciente</h2>
          <div className="space-y-4">
            {[...movimientos]
              .sort((a, b) => b.fecha.getTime() - a.fecha.getTime())
              .slice(0, 6)
              .map((mov) => {
                const cortinero = cortineros.find((c) => c.id === mov.cortineroId);
                return (
                  <div key={mov.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors">
                    <div className={cn(
                      'h-10 w-10 rounded-full flex items-center justify-center',
                      mov.tipo === 'pago' ? 'bg-success/10' : 'bg-destructive/10'
                    )}>
                      {mov.tipo === 'pago' ? (
                        <ArrowUpCircle className="h-5 w-5 text-success" />
                      ) : (
                        <ArrowDownCircle className="h-5 w-5 text-destructive" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {mov.descripcion}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {cortinero?.nombre} • {formatDate(mov.fecha)}
                      </p>
                    </div>
                    <span className={cn(
                      'font-semibold',
                      mov.tipo === 'pago' ? 'text-success' : 'text-destructive'
                    )}>
                      {mov.tipo === 'pago' ? '+' : '-'}{formatCurrency(mov.importe)}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
