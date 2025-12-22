import { supabase } from "@/lib/supabaseClient";
import type { Cortinero, Movimiento } from "@/types/cortinero";

type DbCortinero = {
  id: string;
  nombre: string;
  telefono: string | null;
  zona: string;
  limite_credito: number;
  saldo: number;
  activo: boolean;
  created_at: string;
  updated_at: string;
};

type DbMovimiento = {
  id: string;
  cortinero_id: string;
  tipo: "pago" | "entrega";
  importe: number;
  descripcion: string | null;
  metodo_pago: string | null;
  comentarios: string | null;
  fecha: string; // date
  created_by: string;
  created_at: string;
  voided_at: string | null;
};

function parseDate(dateStr: string): Date {
  // fecha is stored as date (YYYY-MM-DD)
  return new Date(`${dateStr}T00:00:00`);
}

function getPlaceholderFoto(nombre: string): string {
  // Uses a deterministic placeholder avatar.
  const encoded = encodeURIComponent(nombre || "User");
  return `https://ui-avatars.com/api/?name=${encoded}&background=FF7A00&color=FFFFFF&bold=true`;
}

function mapCortinero(db: DbCortinero, ultimoMovimiento: Date | null): Cortinero {
  return {
    id: db.id,
    nombre: db.nombre,
    foto: getPlaceholderFoto(db.nombre),
    telefono: db.telefono ?? undefined,
    zona: db.zona,
    limiteCredito: db.limite_credito,
    saldo: db.saldo,
    ultimoMovimiento: ultimoMovimiento ?? new Date(db.updated_at),
  };
}

function computeSaldoResultante(movs: DbMovimiento[]): Movimiento[] {
  // Compute running balance from movements ordered by fecha ASC.
  const sortedAsc = [...movs].sort((a, b) => parseDate(a.fecha).getTime() - parseDate(b.fecha).getTime());

  let saldo = 0;
  const byId = new Map<string, number>();
  for (const m of sortedAsc) {
    if (m.tipo === "entrega") saldo -= m.importe;
    else saldo += m.importe;
    byId.set(m.id, saldo);
  }

  // Return movements in DESC order for UI (newest first)
  const sortedDesc = [...movs].sort((a, b) => parseDate(b.fecha).getTime() - parseDate(a.fecha).getTime());

  return sortedDesc.map((m): Movimiento => ({
    id: m.id,
    cortineroId: m.cortinero_id,
    fecha: parseDate(m.fecha),
    tipo: m.tipo,
    descripcion: m.descripcion ?? (m.tipo === "pago" ? "Pago" : "Entrega"),
    importe: m.importe,
    saldoResultante: byId.get(m.id) ?? 0,
    metodoPago: m.metodo_pago ?? undefined,
    nota: m.comentarios ?? undefined,
    createdAt: new Date(m.created_at),
  }));
}

export async function getCortineros(): Promise<Cortinero[]> {
  console.log("[supabaseApi] getCortineros: fetching...");

  try {
    const { data: cortineros, error } = await supabase
      .from("cortineros")
      .select("id,nombre,telefono,zona,limite_credito,saldo,activo,created_at,updated_at")
      .eq("activo", true)
      .order("nombre");

    console.log("[supabaseApi] getCortineros: result", { cortineros, error });
    if (error) throw error;

    const { data: movimientos, error: movErr } = await supabase
      .from("movimientos")
      .select("cortinero_id,fecha,voided_at")
      .is("voided_at", null);

    console.log("[supabaseApi] getCortineros: movimientos result", { movimientos, movErr });
    if (movErr) throw movErr;

    const lastByCortinero = new Map<string, Date>();
    for (const m of movimientos ?? []) {
      const d = parseDate(m.fecha);
      const prev = lastByCortinero.get(m.cortinero_id);
      if (!prev || d.getTime() > prev.getTime()) {
        lastByCortinero.set(m.cortinero_id, d);
      }
    }

    return (cortineros ?? []).map((c) => mapCortinero(c, lastByCortinero.get(c.id) ?? null));
  } catch (err) {
    console.error("[supabaseApi] getCortineros: error", err);
    throw err;
  }
}

export async function getCortineroById(id: string): Promise<Cortinero | null> {
  const { data: cortinero, error } = await supabase
    .from("cortineros")
    .select("id,nombre,telefono,zona,limite_credito,saldo,activo,created_at,updated_at")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!cortinero) return null;

  const { data: lastMov, error: lastErr } = await supabase
    .from("movimientos")
    .select("fecha")
    .eq("cortinero_id", id)
    .is("voided_at", null)
    .order("fecha", { ascending: false })
    .limit(1);

  if (lastErr) throw lastErr;

  const ultimoMovimiento = lastMov?.[0]?.fecha ? parseDate(lastMov[0].fecha) : null;

  return mapCortinero(cortinero, ultimoMovimiento);
}

export async function getMovimientosByCortinero(cortineroId: string): Promise<Movimiento[]> {
  const { data: movs, error } = await supabase
    .from("movimientos")
    .select(
      "id,cortinero_id,tipo,importe,descripcion,metodo_pago,comentarios,fecha,created_by,created_at,voided_at",
    )
    .eq("cortinero_id", cortineroId)
    .is("voided_at", null)
    .order("fecha", { ascending: false })
    .limit(200);

  if (error) throw error;

  return computeSaldoResultante(movs ?? []);
}

export async function getRecentMovimientos(limit = 50): Promise<Movimiento[]> {
  console.log("[supabaseApi] getRecentMovimientos: fetching...");
  const { data: movs, error } = await supabase
    .from("movimientos")
    .select(
      "id,cortinero_id,tipo,importe,descripcion,metodo_pago,comentarios,fecha,created_by,created_at,voided_at",
    )
    .is("voided_at", null)
    .order("fecha", { ascending: false })
    .limit(limit);

  console.log("[supabaseApi] getRecentMovimientos: result", { movs, error });
  if (error) throw error;
  return computeSaldoResultante(movs ?? []);
}

export async function createPago(args: {
  cortineroId: string;
  monto: number;
  metodoPago: string;
  comentarios: string;
  fecha: string;
  createdBy: string;
}): Promise<void> {
  const { error } = await supabase.from("movimientos").insert({
    cortinero_id: args.cortineroId,
    tipo: "pago",
    importe: args.monto,
    metodo_pago: args.metodoPago,
    comentarios: args.comentarios || null,
    fecha: args.fecha,
    created_by: args.createdBy,
  });

  if (error) throw error;
}

export async function createEntrega(args: {
  cortineroId: string;
  monto: number;
  descripcion: string;
  fecha: string;
  createdBy: string;
}): Promise<void> {
  const { error } = await supabase.from("movimientos").insert({
    cortinero_id: args.cortineroId,
    tipo: "entrega",
    importe: args.monto,
    descripcion: args.descripcion,
    fecha: args.fecha,
    created_by: args.createdBy,
  });

  if (error) throw error;
}

export async function createCortinero(args: {
  nombre: string;
  zona: string;
  telefono?: string;
  limiteCredito: number;
}): Promise<Cortinero> {
  const { data, error } = await supabase
    .from("cortineros")
    .insert({
      nombre: args.nombre,
      zona: args.zona,
      telefono: args.telefono || null,
      limite_credito: args.limiteCredito,
      saldo: 0,
      activo: true,
    })
    .select()
    .single();

  if (error) throw error;
  return mapCortinero(data, null);
}

export async function updateMovimiento(
  id: string,
  args: {
    monto: number;
    descripcion?: string;
    metodoPago?: string;
    comentarios?: string;
    fecha: string;
  }
): Promise<void> {
  const { error } = await supabase
    .from("movimientos")
    .update({
      importe: args.monto,
      descripcion: args.descripcion ?? null,
      metodo_pago: args.metodoPago ?? null,
      comentarios: args.comentarios ?? null,
      fecha: args.fecha,
    })
    .eq("id", id);

  if (error) throw error;
  if (error) throw error;
}

export async function deleteCortinero(id: string): Promise<void> {
  const { error } = await supabase
    .from("cortineros")
    .update({ activo: false }) // Soft delete
    .eq("id", id);

  if (error) throw error;
}

export async function updateCortinero(id: string, args: {
  nombre?: string;
  zona?: string;
  telefono?: string;
  limiteCredito?: number;
}): Promise<void> {
  const { error } = await supabase
    .from("cortineros")
    .update({
      nombre: args.nombre,
      zona: args.zona,
      telefono: args.telefono || null,
      limite_credito: args.limiteCredito,
    })
    .eq("id", id);

  if (error) throw error;
}
