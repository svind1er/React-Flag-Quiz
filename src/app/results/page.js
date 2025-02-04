"use client";
import { useEffect, useState } from "react";

export default function Results() {
    const [latestUpdate, setLatestUpdate] = useState(null);
    const [correctCounts, setCorrectCounts] = useState({});
    const [wrongCounts, setWrongCounts] = useState({});
    const [gradient, setGradient] = useState("linear-gradient(135deg, #222, #444)");
    const [history, setHistory] = useState([]);

    useEffect(() => {
        let hue = 0;
        const interval = setInterval(() => {
            hue = (hue + 1) % 360;
            setGradient(`linear-gradient(135deg, hsl(${hue}, 50%, 20%), hsl(${(hue + 60) % 360}, 50%, 10%))`);
        }, 50);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const socket = new WebSocket("ws://ed93-51-175-242-128.ngrok-free.app");

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setLatestUpdate(data);

            const newHistoryEntry = {
                guess: data.guess,
                correctAnswer: data.correctAnswer,
                isCorrect: data.isCorrect,
                score: data.currentScore
            };
            setHistory((prevHistory) => [newHistoryEntry, ...prevHistory]);

            if (data.isCorrect) {
                setCorrectCounts((prev) => ({
                    ...prev,
                    [data.correctAnswer]: (prev[data.correctAnswer] || 0) + 1
                }));
            } else {
                setWrongCounts((prev) => ({
                    ...prev,
                    [data.correctAnswer]: (prev[data.correctAnswer] || 0) + 1
                }));
            }
        };

        return () => socket.close();
    }, []);

    const getTopThree = (obj) =>
        Object.entries(obj).sort((a, b) => b[1] - a[1]).slice(0, 3);

    return (
        <div className="min-h-screen text-white flex flex-col items-center p-10 transition-all duration-300" style={{ background: gradient }}>
            <h1 className="text-4xl font-bold mb-8">Live Results Dashboard</h1>

            <div className="grid grid-cols-3 gap-6 w-full max-w-6xl">
                <div className="bg-gray-800 p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-semibold mb-4 text-center">Latest Guess</h2>
                    <p className={latestUpdate?.isCorrect ? "text-green-400" : "text-red-400"}>
                        {latestUpdate ? (latestUpdate.isCorrect ? "✅ Correct!" : "❌ Wrong!") : "Waiting..."}
                    </p>
                    <p><strong>Guess:</strong> {latestUpdate?.guess || "Waiting..."}</p>
                    <p><strong>Correct Answer:</strong> {latestUpdate?.correctAnswer || "..."}</p>
                    <p><strong>Current Score:</strong> {latestUpdate?.currentScore || "..."}</p>
                    <p><strong>Gamemode:</strong> {latestUpdate?.gameMode || "..."}</p>
                </div>

                <div className="bg-gray-800 p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-semibold mb-4 text-center">Top 3 Correct</h2>
                    {getTopThree(correctCounts).map(([country, count]) => (
                        <div key={country} className="flex justify-between bg-gray-700 p-2 my-2 rounded">
                            <span>{country}</span>
                            <span className="text-green-400 font-bold">{count}</span>
                        </div>
                    ))}
                </div>

                <div className="bg-gray-800 p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-semibold mb-4 text-center">Top 3 Wrong</h2>
                    {getTopThree(wrongCounts).map(([country, count]) => (
                        <div key={country} className="flex justify-between bg-gray-700 p-2 my-2 rounded">
                            <span>{country}</span>
                            <span className="text-red-400 font-bold">{count}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-8 flex gap-6 w-full max-w-6xl">
                <div className="bg-gray-800 p-6 rounded-lg shadow-md flex-1 text-center">
                    <h2 className="text-2xl font-semibold">Unlimited Highscore</h2>
                    <p className="text-4xl font-bold mt-2">{latestUpdate?.unlimitedHighScore || "..."}</p>
                </div>
                <div className="bg-gray-800 p-6 rounded-lg shadow-md flex-1 text-center">
                    <h2 className="text-2xl font-semibold">Limited Highscore</h2>
                    <p className="text-4xl font-bold mt-2">{latestUpdate?.limitedHighScore || "..."}</p>
                </div>
            </div>

            {/* Total Correct and Total Wrong*/}
            <div className="grid grid-cols-2 gap-6 w-full max-w-6xl mt-8">
                <div className="bg-gray-800 p-6 rounded-lg shadow-md flex-1 text-center">
                    <h2 className="text-2xl font-semibold">Total Correct</h2>
                    <p className="text-4xl font-bold mt-2">{latestUpdate?.totalCorrect}</p>
                </div>
                <div className="bg-gray-800 p-6 rounded-lg shadow-md flex-1 text-center">
                    <h2 className="text-2xl font-semibold">Total Wrong</h2>
                    <p className="text-4xl font-bold mt-2">{latestUpdate?.totalWrong}</p>
                </div>
            </div>

            {/* History Section */}
            <div className="mt-8 w-full max-w-6xl">
                <div className="bg-gray-800 p-6 rounded-lg shadow-md space-y-4">
                    <h2 className="text-2xl font-semibold mb-4 text-center">Guess History</h2>
                    {Array.isArray(history) && history.map((entry, index) => (
                        <div key={index} className="bg-gray-700 p-4 rounded">
                            <p><strong>Guess:</strong> {entry.guess}</p>
                            <p><strong>Correct Answer:</strong> {entry.correctAnswer}</p>

                            {/* Display all choices */}
                            <p><strong>Choices:</strong></p>
                            <div className="grid grid-cols-2 gap-4">
                                {latestUpdate.shuffled.map((country, idx) => (
                                    <div key={idx} className="bg-gray-600 p-2 rounded text-center">
                                        <p>{country.name}</p> {/* Show the country's name */}
                                        <img src={`/flags/${country.flag}`} alt={country.name} className="w-12 h-8 mx-auto" /> {/* Show flag */}
                                    </div>
                                ))}
                            </div>

                            <p className={entry.isCorrect ? "text-green-400" : "text-red-400"}>
                                {entry.isCorrect ? "✅ Correct!" : "❌ Wrong!"}
                            </p>
                            <p><strong>Score:</strong> {entry.score}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
