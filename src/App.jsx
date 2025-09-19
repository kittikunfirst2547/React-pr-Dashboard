import React, { useState, useEffect } from "react";
import axios from "axios";
import { Sun, Moon, Plus, Trash } from "lucide-react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

// 🎨 Dashboard App
export default function App() {
  const [darkMode, setDarkMode] = useState(
    () => JSON.parse(localStorage.getItem("darkMode")) || false
  );

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
        {/* Header */}
        <header className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-gray-800 dark:to-gray-900 shadow-lg">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            📊 My Personal Dashboard
          </h1>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </header>

        {/* Widgets Grid */}
        <main className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <WeatherWidget />
          <StockWidget />
          <TodoWidget />
          <CalendarWidget />
          <ClockWidget />
        </main>
      </div>
    </div>
  );
}

// ⏰ Clock Widget
const ClockWidget = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Card>
      <Title>⏰ เวลาปัจจุบัน</Title>
      <p className="text-gray-700 dark:text-gray-300">
        {time.toLocaleDateString("th-TH", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>
      <p className="text-4xl font-bold text-blue-600 dark:text-blue-400 mt-2 tracking-wide">
        {time.toLocaleTimeString("th-TH", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })}
      </p>
    </Card>
  );
};

// ☀️ Weather Widget
const WeatherWidget = () => {
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    axios
      .get(
        `https://api.openweathermap.org/data/2.5/weather?q=Rangsit&appid=0fd1e728b89a7f9dce03193649e75b66&units=metric&lang=th`
      )
      .then((res) => setWeather(res.data))
      .catch(console.error);
  }, []);

  // 🔧 ฟังก์ชันเลือกไอคอนตามสภาพอากาศ
  const getWeatherIcon = (main) => {
    switch (main) {
      case "Clear":
        return "☀️"; // อากาศแจ่มใส
      case "Clouds":
        return "☁️"; // มีเมฆ
      case "Rain":
        return "🌧"; // ฝนตก
      case "Thunderstorm":
        return "⛈"; // พายุฝนฟ้าคะนอง
      case "Snow":
        return "❄️"; // หิมะ
      case "Drizzle":
        return "🌦"; // ฝนปรอย
      case "Mist":
      case "Fog":
      case "Haze":
        return "🌫"; // หมอก
      default:
        return "🌍"; // ค่าเริ่มต้น
    }
  };

  return (
    <Card>
      <Title>☀️ สภาพอากาศ</Title>
      {weather ? (
        <div className="space-y-2 text-gray-700 dark:text-gray-300">
          <p className="flex items-center gap-2 text-lg font-bold">
            {getWeatherIcon(weather.weather[0].main)} {weather.name} —{" "}
            {weather.main.temp.toFixed(1)}°C
          </p>
          <p>
            🌡 สูงสุด {weather.main.temp_max.toFixed(1)}°C | ต่ำสุด{" "}
            {weather.main.temp_min.toFixed(1)}°C
          </p>
          <p>📖 {weather.weather[0].description}</p>
          <p>💧 ความชื้น: {weather.main.humidity}%</p>
          <p>🌬 ลม: {weather.wind.speed} m/s</p>
          <p>
            🌧{" "}
            {["Rain", "Thunderstorm"].includes(weather.weather[0].main)
              ? "มีโอกาสฝนตก"
              : "ไม่มีฝน"}
          </p>
        </div>
      ) : (
        <p className="text-gray-400">Loading...</p>
      )}
    </Card>
  );
};


// 💹 Stock Widget
const StockWidget = () => {
  const [price, setPrice] = useState(null);
  const [change, setChange] = useState(null);

  useEffect(() => {
    axios
      .get(
        `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=NVDA&apikey=TOB8KELAEYGOSHBG`
      )
      .then((res) => {
        const data = res.data["Time Series (Daily)"];
        if (!data) return;
        const dates = Object.keys(data);
        const latest = data[dates[0]];
        const prev = data[dates[1]];
        const latestClose = parseFloat(latest["4. close"]);
        const prevClose = parseFloat(prev["4. close"]);
        setPrice(latestClose);
        setChange(latestClose - prevClose);
      })
      .catch(console.error);
  }, []);

  return (
    <Card>
      <Title>💹 หุ้น NVIDIA</Title>
      {price ? (
        <div className="text-gray-700 dark:text-gray-300">
          <p className="text-2xl font-bold">${price.toFixed(2)}</p>
          <p
            className={`${
              change > 0 ? "text-green-500" : "text-red-500"
            } font-semibold`}
          >
            {change > 0 ? "▲" : "▼"} {change.toFixed(2)}
          </p>
        </div>
      ) : (
        <p className="text-gray-400">Loading...</p>
      )}
    </Card>
  );
};

// 📝 Todo Widget
const TodoWidget = () => {
  const [todos, setTodos] = useState(
    () => JSON.parse(localStorage.getItem("todos")) || []
  );
  const [task, setTask] = useState("");

  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  const addTodo = () => {
    if (!task.trim()) return;
    setTodos([...todos, task]);
    setTask("");
  };

  const deleteTodo = (index) => {
    setTodos(todos.filter((_, i) => i !== index));
  };

  return (
    <Card>
      <Title>📝 To-Do List</Title>
      <div className="flex mb-3">
        <input
          type="text"
          className="flex-1 p-2 rounded-l-lg border dark:bg-gray-700 dark:text-gray-100"
          placeholder="เพิ่มงานใหม่..."
          value={task}
          onChange={(e) => setTask(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTodo()}
        />
        <button
          onClick={addTodo}
          className="px-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-r-lg hover:opacity-90 transition"
        >
          <Plus size={18} />
        </button>
      </div>
      {todos.length === 0 ? (
        <p className="text-gray-400">ยังไม่มีงาน</p>
      ) : (
        <ul className="space-y-2">
          {todos.map((t, i) => (
            <li
              key={i}
              className="flex justify-between items-center bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg"
            >
              <span>{t}</span>
              <button
                onClick={() => deleteTodo(i)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
};

// 📅 Calendar Widget
const CalendarWidget = () => {
  const [date, setDate] = useState(new Date());
  const [notes, setNotes] = useState(
    () => JSON.parse(localStorage.getItem("notes")) || {}
  );
  const [note, setNote] = useState("");

  useEffect(() => {
    localStorage.setItem("notes", JSON.stringify(notes));
  }, [notes]);

  const saveNote = () => {
    if (!note.trim()) return;
    const key = date.toDateString();
    setNotes({ ...notes, [key]: [...(notes[key] || []), note] });
    setNote("");
  };

  return (
    <Card>
      <Title>📅 ปฏิทิน</Title>
      <Calendar onChange={setDate} value={date} className="rounded-lg" />
      <div className="mt-3">
        <input
          type="text"
          placeholder="จดบันทึก..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && saveNote()}
          className="w-full p-2 rounded-lg border mt-2 dark:bg-gray-700 dark:text-gray-100"
        />
        <button
          onClick={saveNote}
          className="mt-2 w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-2 rounded-lg hover:opacity-90 transition"
        >
          บันทึก
        </button>
      </div>
      <div className="mt-3 space-y-2">
        {(notes[date.toDateString()] || []).map((n, i) => (
          <div
            key={i}
            className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg text-sm text-gray-800 dark:text-gray-200"
          >
            {n}
          </div>
        ))}
      </div>
    </Card>
  );
};

/* 🔧 Reusable UI Components */
const Card = ({ children }) => (
  <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-lg 
                  transition-colors hover:shadow-xl transform hover:-translate-y-1 
                  transition-all duration-200 w-full h-auto">
    {children}
  </div>
);


const Title = ({ children }) => (
  <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
    {children}
  </h2>
);


