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

    const [totalCorrect, setTotalCorrect] = useState(0);
    const [totalWrong, setTotalWrong] = useState(0);

    const WEB_SOCKET_URL = "ws://";
    const guessTracker = "PLACEHOLDER URL" + "/track-guess";

    useEffect(() => {
        const newSocket = new WebSocket(WEB_SOCKET_URL);
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
            Cookies.set("limitedUsedFlags", JSON.stringify(limitedUsedFlags), { expires: 365 });
            setTimeout(() => {
                startNewRound();
            }, 600);
        }
    }, [limitedUsedFlags]);

    const loadScores = () => {
        const savedScore = Cookies.get(`${gameMode}Score`);
        const savedHighScore = Cookies.get(`${gameMode}HighScore`);
        setScore(savedScore ? parseInt(savedScore) : 0);
        setHighScore(savedHighScore ? parseInt(savedHighScore) : 0);

        const savedUnlimitedHighScore = Cookies.get("unlimitedHighScore");
        setUnlimitedHighScore(savedUnlimitedHighScore ? parseInt(savedUnlimitedHighScore) : 0);

        const savedLimitedHighScore = Cookies.get("limitedHighScore");
        setLimitedHighScore(savedLimitedHighScore ? parseInt(savedLimitedHighScore) : 0);
    };

    const startNewRound = () => {
        let availableCountries = [...countries];

        if (gameMode === "limited") {
            availableCountries = availableCountries.filter(c => !limitedUsedFlags.includes(c.name));

            if (availableCountries.length < 4) {
                setLimitedUsedFlags([]);
                availableCountries = [...countries];
            }
        }

        const shuffled = randomize(availableCountries).slice(0, 4);
        setShuffled(shuffled);
        setSelectedCountry(shuffled[getRandomInt(4)]);
    };

    const handleButtonClick = async (countryName) => {
        const isCorrect = countryName === selectedCountry.name;
        const newScore = isCorrect ? score + 1 : 0;

        if (isCorrect) {
            setTotalCorrect(prev => prev + 1);
        } else {
            setTotalWrong(prev => prev + 1);
        }

        const guessData = {
            guess: countryName,
            correctAnswer: selectedCountry.name,
            isCorrect,
            currentScore: newScore,
            limitedHighScore,
            unlimitedHighScore,
            gameMode,
            limitedUsedFlags,
            totalCorrect,
            totalWrong,
            shuffled
        };

        setScore(newScore);
        Cookies.set(`${gameMode}Score`, newScore, { expires: 365 });

        if (isCorrect && newScore > highScore) {
            setHighScore(newScore);
            Cookies.set(`${gameMode}HighScore`, newScore, { expires: 365 });
        }

        if (gameMode === "limited" && isCorrect) {
            setLimitedUsedFlags(prevFlags => [...prevFlags, selectedCountry.name]);
        } else if (!isCorrect && gameMode === "limited") {
            setLimitedUsedFlags([]);
        }

        if (gameMode === "unlimited" && isCorrect && newScore > unlimitedHighScore) {
            setUnlimitedHighScore(newScore);
            Cookies.set("unlimitedHighScore", newScore, { expires: 365 });
        }

        setResult({ clicked: countryName, correct: selectedCountry.name });

        if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify(guessData));
        }

        try {
            await fetch(guessTracker, {
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
        }, 600);
    };

    const remainingCountries = gameMode === "limited"
        ? countries.filter(country => !limitedUsedFlags.includes(country.name)).length
        : null;

    return (
        <div className="flex flex-col items-center py-8 space-y-6 min-h-screen">
            <h1 className="text-3xl font-bold">{gameMode}</h1>

            {/* Display Flag */}
            <div className="mb-6">
                {selectedCountry && (
                    <img
                        src={`/flags/${selectedCountry.flag}`}
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
                    const isCorrectAnswer = country.name === selectedCountry.name;
                    const isSelected = result.clicked === country.name;


                    let buttonColor = "bg-white hover:bg-blue-500 text-black";


                    if (result.clicked) {
                        if (isCorrect) {
                            // buttonColor = "bg-green-500 hover:bg-green-600 text-white";
                        } else if (isWrong) {
                            buttonColor = "bg-red-500 hover:bg-red-600 text-white";
                        }
                    }

                    if (!isSelected && isCorrectAnswer && result.clicked) {
                        buttonColor = "bg-green-500 hover:bg-green-600 text-white";
                    }


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
