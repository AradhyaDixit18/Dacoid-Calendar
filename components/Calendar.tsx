"use client";

import React, { useState, useEffect } from "react";
import {
  formatDate,
  DateSelectArg,
  EventClickArg,
  EventApi,
} from "@fullcalendar/core";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Calendar: React.FC = () => {
  const [currentEvents, setCurrentEvents] = useState<EventApi[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [newEventTitle, setNewEventTitle] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<DateSelectArg | null>(null);
  const [filterKeyword, setFilterKeyword] = useState<string>("");
  const [eventColor, setEventColor] = useState<string>("#FFFFFF"); // Default color

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedEvents = localStorage.getItem("events");
      if (savedEvents) {
        setCurrentEvents(JSON.parse(savedEvents));
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("events", JSON.stringify(currentEvents));
    }
  }, [currentEvents]);

  const handleDateClick = (selected: DateSelectArg) => {
    setSelectedDate(selected);
    setIsDialogOpen(true);
  };

  const handleEventClick = (selected: EventClickArg) => {
    if (
      window.confirm(
        `Are you sure you want to delete the event "${selected.event.title}"?`
      )
    ) {
      selected.event.remove();
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setNewEventTitle("");
    setEventColor("#FFFFFF"); // Reset color on close
  };

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (newEventTitle && selectedDate) {
      const calendarApi = selectedDate.view.calendar;
      calendarApi.unselect();

      const overlappingEvent = currentEvents.find(
        (event) =>
          (selectedDate.start! >= event.start! &&
            selectedDate.start! < event.end!) ||
          (selectedDate.end! > event.start! &&
            selectedDate.end! <= event.end!)
      );

      if (overlappingEvent) {
        alert("Overlapping events are not allowed.");
        return;
      }

      const newEvent = {
        id: `${selectedDate.start.toISOString()}-${newEventTitle}`,
        title: newEventTitle,
        start: selectedDate.start,
        end: selectedDate.end,
        allDay: selectedDate.allDay,
        backgroundColor: eventColor, 
      };

      calendarApi.addEvent(newEvent);
      handleCloseDialog();
    }
  };

  const filteredEvents = currentEvents.filter((event) =>
    event.title.toLowerCase().includes(filterKeyword.toLowerCase())
  );

  const exportEvents = () => {
    const eventsForMonth = currentEvents.filter(
      (event) =>
        event.start &&
        new Date(event.start).getMonth() === new Date().getMonth()
    );

    const data = JSON.stringify(eventsForMonth, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "events.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex w-full px-10 justify-start items-start gap-8">
        <div className="w-3/12">
          <div className="py-10 text-2xl font-extrabold px-7">
            Calendar Events
          </div>
          <input
            type="text"
            placeholder="Filter events..."
            value={filterKeyword}
            onChange={(e) => setFilterKeyword(e.target.value)}
            className="mb-4 p-2 border rounded-md"
          />
          <button
            onClick={exportEvents}
            className="bg-blue-500 text-white p-2 rounded-md"
          >
            Export Events
          </button>
          <ul className="space-y-4 mt-4">
            {filteredEvents.length <= 0 && (
              <div className="italic text-center text-gray-400">
                No Events Present
              </div>
            )}

            {filteredEvents.map((event: EventApi) => (
              <li
                className="border border-gray-200 shadow px-4 py-2 rounded-md text-blue-800"
                key={event.id}
                style={{ backgroundColor: event.backgroundColor }} 
              >
                {event.title}
                <br />
                <label className="text-slate-950">
                  {formatDate(event.start!, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </label>
              </li>
            ))}
          </ul>
        </div>

        <div className="w-9/12 mt-8">
          <FullCalendar
            height={"85vh"}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
            }}
            initialView="dayGridMonth"
            editable={true}
            droppable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            select={handleDateClick}
            eventClick={handleEventClick}
            eventsSet={(events) => setCurrentEvents(events)}
            initialEvents={
              typeof window !== "undefined"
                ? JSON.parse(localStorage.getItem("events") || "[]")
                : []
            }
          />
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Event Details</DialogTitle>
          </DialogHeader>
          <form className="space-x-5 mb-4" onSubmit={handleAddEvent}>
            <input
              type="text"
              placeholder="Event Title"
              value={newEventTitle}
              onChange={(e) => setNewEventTitle(e.target.value)}
              required
              className="border border-gray-200 p-3 rounded-md text-lg"
            />
            <div className="mt-4">
              <label className="block text-gray-700">Event Color:</label>
              <input
                type="color"
                value={eventColor}
                onChange={(e) => setEventColor(e.target.value)}
                className="w-12 h-12 border border-gray-300 rounded-md"
              />
            </div>
            <button
              className="bg-green-500 text-white p-3 mt-5 rounded-md"
              type="submit"
            >
              Add
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Calendar;
