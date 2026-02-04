// src/utils/horariosService.js

// Configuración de horarios
const HORARIOS_ATENCION = {
  // 0 = Domingo, 1 = Lunes, ... 6 = Sábado
  lunes: { dia: 1, horarios: [{ inicio: '11:30', fin: '15:30' }, { inicio: '19:00', fin: '24:00' }] },
  martes: { dia: 2, horarios: [{ inicio: '19:00', fin: '24:00' }] },
  miercoles: { dia: 3, horarios: [] }, // CERRADO
  jueves: { dia: 4, horarios: [{ inicio: '11:30', fin: '15:30' }, { inicio: '19:00', fin: '24:00' }] },
  viernes: { dia: 5, horarios: [{ inicio: '11:30', fin: '15:30' }, { inicio: '19:00', fin: '24:00' }] },
  sabado: { dia: 6, horarios: [{ inicio: '11:30', fin: '15:30' }, { inicio: '19:00', fin: '24:00' }] },
  domingo: { dia: 0, horarios: [{ inicio: '11:30', fin: '15:30' }, { inicio: '19:00', fin: '24:00' }] },
};
const MODO_PRUEBA = true;

// Nombres de los días en español
const DIAS_SEMANA = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

/**
 * Convierte hora en formato "HH:MM" a minutos desde medianoche
 */
const horaAMinutos = (horaStr) => {
  const [horas, minutos] = horaStr.split(':').map(Number);
  return horas * 60 + minutos;
};

/**
 * Verifica si el negocio está abierto en este momento
 */
export const estaAbierto = () => {
  if (MODO_PRUEBA) return true;

  const ahora = new Date();
  const diaActual = ahora.getDay();
  const horaActual = ahora.getHours();
  const minutosActual = ahora.getMinutes();
  const minutosDesdeMedianoche = horaActual * 60 + minutosActual;

  const configuracionDia = Object.values(HORARIOS_ATENCION).find(
    config => config.dia === diaActual
  );

  if (!configuracionDia || configuracionDia.horarios.length === 0) {
    return false;
  }

  return configuracionDia.horarios.some(horario => {
    const inicioMinutos = horaAMinutos(horario.inicio);
    const finMinutos = horaAMinutos(horario.fin);
    return minutosDesdeMedianoche >= inicioMinutos && minutosDesdeMedianoche <= finMinutos;
  });
};

/**
 * Obtiene el próximo horario de apertura
 */
export const getProximaApertura = () => {
  const ahora = new Date();
  let diaActual = ahora.getDay();
  const horaActual = ahora.getHours();
  const minutosActual = ahora.getMinutes();
  const minutosDesdeMedianoche = horaActual * 60 + minutosActual;

  // Buscar en los próximos 7 días
  for (let i = 0; i < 7; i++) {
    const diaABuscar = (diaActual + i) % 7;
    const configuracionDia = Object.values(HORARIOS_ATENCION).find(
      config => config.dia === diaABuscar
    );

    if (!configuracionDia || configuracionDia.horarios.length === 0) {
      continue; // Día cerrado, seguir buscando
    }

    // Si es el día actual, buscar horarios futuros
    if (i === 0) {
      const horarioFuturo = configuracionDia.horarios.find(horario => {
        const inicioMinutos = horaAMinutos(horario.inicio);
        return minutosDesdeMedianoche < inicioMinutos;
      });

      if (horarioFuturo) {
        return {
          dia: DIAS_SEMANA[diaABuscar],
          hora: horarioFuturo.inicio,
          esHoy: true
        };
      }
    } else {
      // Para días futuros, retornar el primer horario
      return {
        dia: DIAS_SEMANA[diaABuscar],
        hora: configuracionDia.horarios[0].inicio,
        esHoy: false
      };
    }
  }

  return null;
};

/**
 * Obtiene el horario de cierre actual (si está abierto)
 */
export const getHorarioCierre = () => {
  const ahora = new Date();
  const diaActual = ahora.getDay();
  const horaActual = ahora.getHours();
  const minutosActual = ahora.getMinutes();
  const minutosDesdeMedianoche = horaActual * 60 + minutosActual;

  const configuracionDia = Object.values(HORARIOS_ATENCION).find(
    config => config.dia === diaActual
  );

  if (!configuracionDia) return null;

  const horarioActivo = configuracionDia.horarios.find(horario => {
    const inicioMinutos = horaAMinutos(horario.inicio);
    const finMinutos = horaAMinutos(horario.fin);
    return minutosDesdeMedianoche >= inicioMinutos && minutosDesdeMedianoche <= finMinutos;
  });

  return horarioActivo ? horarioActivo.fin : null;
};

/**
 * Obtiene el mensaje de estado del negocio
 */
export const getMensajeEstado = () => {
  if (estaAbierto()) {
    const horarioCierre = getHorarioCierre();
    return {
      abierto: true,
      mensaje: `¡Estamos abiertos! Cerramos a las ${horarioCierre}hs`,
      tipo: 'success'
    };
  } else {
    const proximaApertura = getProximaApertura();
    if (proximaApertura) {
      if (proximaApertura.esHoy) {
        return {
          abierto: false,
          mensaje: `Cerrado. Abrimos hoy a las ${proximaApertura.hora}hs`,
          tipo: 'warning'
        };
      } else {
        return {
          abierto: false,
          mensaje: `Cerrado. Abrimos ${proximaApertura.dia} a las ${proximaApertura.hora}hs`,
          tipo: 'error'
        };
      }
    } else {
      return {
        abierto: false,
        mensaje: 'Temporalmente cerrado',
        tipo: 'error'
      };
    }
  }
};

/**
 * Obtiene todos los horarios para mostrar
 */
export const getHorariosCompletos = () => {
  return Object.entries(HORARIOS_ATENCION).map(([dia, config]) => ({
    dia: DIAS_SEMANA[config.dia],
    horarios: config.horarios.length > 0 
      ? config.horarios.map(h => `${h.inicio} - ${h.fin}`).join(' y ')
      : 'Cerrado'
  }));
};