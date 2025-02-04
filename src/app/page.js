"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@mui/material";
import countries from "./countries";
import Cookies from "js-cookie";

function randomize(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

export default function Home() {
    const [shuffled, setShuffled] = useState([]);
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [result, setResult] = useState({ clicked: null, correct: null });
    const [gameMode, setGameMode] = useState("unlimited");

    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [limitedHighScore, setLimitedHighScore] = useState(0);
    const [unlimitedHighScore, setUnlimitedHighScore] = useState(0);

    const [limitedUsedFlags, setLimitedUsedFlags] = useState([]);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const newSocket = new WebSocket("ws://ed93-51-175-242-128.ngrok-free.app");
        setSocket(newSocket);

        return () => {
            if (newSocket) {
                newSocket.close();
            }
        };
    }, []);

    useEffect(() => {
        loadScores();
        startNewRound();
    }, [gameMode]);

    useEffect(() => {
        const savedFlags = Cookies.get("limitedUsedFlags");
        setLimitedUsedFlags(savedFlags ? JSON.parse(savedFlags) : []);
    }, []);

    useEffect(() => {
        if (gameMode === "limited") {
            console.log("Limited Mode: Using limitedUsedFlags:", limitedUsedFlags);
            Cookies.set("limitedUsedFlags", JSON.stringify(limitedUsedFlags), { expires: 365 });
            setTimeout(() => {
                startNewRound();
            }, 1000);
        }
    }, [limitedUsedFlags]);

    const loadScores = () => {
        const savedScore = Cookies.get(`${gameMode}Score`);
        const savedHighScore = Cookies.get(`${gameMode}HighScore`);
        console.log("Loaded scores:", { savedScore, savedHighScore });
        setScore(savedScore ? parseInt(savedScore) : 0);
        setHighScore(savedHighScore ? parseInt(savedHighScore) : 0);

        const savedUnlimitedHighScore = Cookies.get("unlimitedHighScore");
        setUnlimitedHighScore(savedUnlimitedHighScore ? parseInt(savedUnlimitedHighScore) : 0);

        const savedLimitedHighScore = Cookies.get("limitedHighScore");
        setLimitedHighScore(savedLimitedHighScore ? parseInt(savedLimitedHighScore) : 0);

    };

    const startNewRound = () => {
        console.log("Starting new round...");
        let availableCountries = [...countries];

        if (gameMode === "limited") {
            console.log("Limited mode active, filtering countries...");
            availableCountries = availableCountries.filter(c => !limitedUsedFlags.includes(c.name));

            console.log("Available countries after filter:", availableCountries);

            if (availableCountries.length < 4) {
                console.log("Less than 4 countries left, resetting used flags...");
                setLimitedUsedFlags([]);
                availableCountries = [...countries];
            }
        }

        const shuffled = randomize(availableCountries).slice(0, 4);
        console.log("Shuffled countries for this round:", shuffled);
        setShuffled(shuffled);
        setSelectedCountry(shuffled[getRandomInt(4)]);
    };

    const handleButtonClick = async (countryName) => {
        console.log("Button clicked with country:", countryName);
        console.log("Selected country is:", selectedCountry.name);

        const isCorrect = countryName === selectedCountry.name;
        const newScore = isCorrect ? score + 1 : 0;

        console.log("Is the guess correct?", isCorrect);
        console.log("New score:", newScore);

        const guessData = {
            guess: countryName,
            correctAnswer: selectedCountry.name,
            isCorrect,
            currentScore: newScore,
            limitedHighScore,
            unlimitedHighScore,
            gameMode,
            limitedUsedFlags
        };

        setScore(newScore);
        Cookies.set(`${gameMode}Score`, newScore, { expires: 365 });

        if (isCorrect && newScore > highScore) {
            console.log("New high score reached!");
            setHighScore(newScore);
            Cookies.set(`${gameMode}HighScore`, newScore, { expires: 365 });
        }

        if (gameMode === "limited" && isCorrect) {
            console.log("Correct guess, marking country as used:", selectedCountry.name);
            setLimitedUsedFlags(prevFlags => [...prevFlags, selectedCountry.name]);
        } else if (!isCorrect && gameMode === "limited") {
            console.log("Incorrect guess, resetting used flags...");
            setLimitedUsedFlags([]);
        }

        if (gameMode === "unlimited" && isCorrect && newScore > unlimitedHighScore) {
            setUnlimitedHighScore(newScore);
            Cookies.set("unlimitedHighScore", newScore, { expires: 365 });
        }

        setResult({ clicked: countryName, correct: selectedCountry.name });
        console.log("Sending guess data:", guessData);

        if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify(guessData));
        }

        try {
            await fetch("https://ed93-51-175-242-128.ngrok-free.app/track-guess", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(guessData),
            });
        } catch (error) {
            console.log("Error sending guess data:", error);
        }

        setTimeout(() => {
            setResult({ clicked: null, correct: null });
            if (gameMode === "unlimited") {
                startNewRound();
            }
        }, 1000);
    };

    const remainingCountries = gameMode === "limited"
        ? countries.filter(country => !limitedUsedFlags.includes(country.name)).length
        : null;

    console.log("Remaining countries in limited mode:", remainingCountries);

    return (
        <div className="flex flex-col items-center py-8 space-y-6 min-h-screen">

            {/* Display Flag */}
            <div className="mb-6">
                {selectedCountry && (
                    <img
                        src={`/flags/${selectedCountry.flag}`} // Assuming flags are named after the country
                        alt={selectedCountry.name}
                        className="w-86 h-48 border-2 border-white-300 rounded-xl"
                    />
                )}
            </div>

            {/* Score and High Score */}
            <div>
                <h2 className="text-xl font-medium text-center">Score: {score}</h2>
                <h3 className="text-lg text-center">High Score: {highScore}</h3>
            </div>

            {/* Remaining Countries Display */}
            {gameMode === "limited" && (
                <div className="mt-4">
                    <h4 className="text-md text-center">Remaining Countries: {remainingCountries}</h4>
                </div>
            )}

            {/* Country Names Options */}
            <div className="grid grid-cols-2 gap-4 mt-6">
                {shuffled.map((country, index) => {
                    const isCorrect = result.clicked === country.name && result.clicked === selectedCountry.name;
                    const isWrong = result.clicked === country.name && result.clicked !== selectedCountry.name;
                    const buttonColor = isCorrect
                        ? "bg-green-500 hover:bg-green-600 text-white"
                        : isWrong
                        ? "bg-red-500 hover:bg-red-600 text-white"
                        : "bg-white hover:bg-blue-500 text-black";

                    return (
                        <button
                            key={index}
                            className={`px-4 py-2 text-lg font-semibold border-2 border-gray-300 rounded-md transition-all ${buttonColor}`}
                            onClick={() => handleButtonClick(country.name)}
                        >
                            {country.name}
                        </button>
                    );
                })}
            </div>

            {/* Game Mode Buttons */}
            <div className="flex gap-4">
                <Button
                    variant={gameMode === "unlimited" ? "contained" : "outlined"}
                    onClick={() => setGameMode("unlimited")}
                >
                    Unlimited
                </Button>
                <Button
                    variant={gameMode === "limited" ? "contained" : "outlined"}
                    onClick={() => setGameMode("limited")}
                >
                    Challenge
                </Button>
            </div>
        </div>
    );
}
