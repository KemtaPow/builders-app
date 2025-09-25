import { useMemo, useRef, useState } from 'react';
import FullCalendar, { DateSelectArg, EventApi, EventClickArg, EventInput, DatesSetArg, EventDropArg, EventResizeDoneArg } from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import useSWR from 'swr';
import { createCalendarEvent, listCalendarEvents, moveCalendarEvent, statusCalendarEvent } from '../lib/api';

const ORG = 'demo-org';

export default function CalendarPage() {
  const calRef = useRef<FullCalendar | null>(null);
  const [range, setRange] = useState<{ from?: string; to?: string }>({});

  const { data, mutate, isLoading } = useSWR(
    ['calendar', ORG, range.from, range.to],
    () => listCalendarEvents(ORG, range.from, range.to),
    { revalidateOnFocus: false }
  );

  const events: EventInput[] = useMemo(() => {
    return (data?.items || []).map((e: any) => ({
      id: e.id,
      title: e.title,
      start: e.start,
      end: e.end,
      allDay: e.allDay,
      color: e.color || undefined,
      extendedProps: { jobId: e.jobId, status: e.status, flag: e.flag }
    }));
  }, [data]);

  const onSelect = async (arg: DateSelectArg) => {
    const title = window.prompt('Event title?');
    if (!title) return;
    try {
      await createCalendarEvent({ orgId: ORG, title, start: arg.startStr, end: arg.endStr, allDay: arg.allDay });
      await mutate();
    } catch (e: any) { alert(e?.message || 'Create failed'); }
  };

  const onEventDrop = async (info: EventDropArg) => {
    try {
      await moveCalendarEvent(info.event.id, ORG, info.event.start!.toISOString(), info.event.end!.toISOString());
      await mutate();
    } catch (e: any) { alert(e?.message || 'Move failed'); info.revert(); }
  };

  const onEventResize = async (info: EventResizeDoneArg) => {
    try {
      await moveCalendarEvent(info.event.id, ORG, info.event.start!.toISOString(), info.event.end!.toISOString());
      await mutate();
    } catch (e: any) { alert(e?.message || 'Resize failed'); info.revert(); }
  };

  const onEventClick = async (arg: EventClickArg) => {
    const choice = window.prompt('Type: start / complete / cancel / invoice');
    const map: any = { start: 'IN_PROGRESS', complete: 'COMPLETE', cancel: 'CANCELLED', invoice: 'INVOICED' };
    const status = map[(choice || '').toLowerCase()];
    if (!status) return;
    try {
      await statusCalendarEvent(arg.event.id, ORG, status);
      await mutate();
    } catch (e: any) { alert(e?.message || 'Update failed'); }
  };

  const onDatesSet = (arg: DatesSetArg) => {
    setRange({ from: arg.start.toISOString(), to: arg.end.toISOString() });
  };

  return (
    <main style={{ maxWidth: 1200, margin: '16px auto', padding: '8px' }}>
      <h1>Calendar</h1>
      <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 8 }}>
        <FullCalendar
          ref={calRef as any}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }}
          selectable
          editable
          events={events}
          select={onSelect}
          eventDrop={onEventDrop}
          eventResize={onEventResize}
          eventClick={onEventClick}
          datesSet={onDatesSet}
          height={800}
        />
      </div>
    </main>
  );
}

