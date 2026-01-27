import axios from "axios";
import TestResult from "../models/TestResult.js";

const PHONEME_API_URL = process.env.PHONEME_API_URL || "http://127.0.0.1:5002";

// @desc    Get word for a specific letter (from phoneme backend)
// @route   GET /api/test/word/:letter
// @access  Public
export const getWordForLetter = async (req, res) => {
    try {
        const { letter } = req.params;

        // Call phoneme backend /test/:letter endpoint
        const response = await axios.get(`${PHONEME_API_URL}/test/${letter}`);

        res.status(200).json({
            success: true,
            data: response.data,
        });
    } catch (error) {
        console.error("Error fetching word:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch word for letter",
            error: error.message,
        });
    }
};

// @desc    Get user's test progress for a letter
// @route   GET /api/test/progress/:letter
// @access  Private
export const getUserTestProgress = async (req, res) => {
    try {
        const { letter } = req.params;
        const userId = req.user.id;

        let testResult = await TestResult.findOne({
            user: userId,
            letter: letter.toUpperCase(),
        });

        if (!testResult) {
            return res.status(200).json({
                success: true,
                data: {
                    letter: letter.toUpperCase(),
                    attempts: [],
                    averageAccuracy: 0,
                    completed: false,
                },
            });
        }

        res.status(200).json({
            success: true,
            data: testResult,
        });
    } catch (error) {
        console.error("Error fetching test progress:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch test progress",
            error: error.message,
        });
    }
};

// @desc    Save test attempt
// @route   POST /api/test/attempt
// @access  Private
export const saveTestAttempt = async (req, res) => {
    try {
        const { letter, word, pronunciation, accuracy } = req.body;
        const userId = req.user.id;

        if (!letter || !word || !pronunciation || accuracy === undefined) {
            return res.status(400).json({
                success: false,
                message:
                    "Please provide letter, word, pronunciation, and accuracy",
            });
        }

        // Find or create test result
        let testResult = await TestResult.findOne({
            user: userId,
            letter: letter.toUpperCase(),
        });

        if (!testResult) {
            testResult = new TestResult({
                user: userId,
                letter: letter.toUpperCase(),
                word,
                pronunciation,
                attempts: [],
            });
        }

        // Add new attempt
        const attemptNumber = testResult.attempts.length + 1;
        testResult.attempts.push({
            attemptNumber,
            accuracy: parseFloat(accuracy),
        });

        await testResult.save();

        res.status(201).json({
            success: true,
            message: "Attempt saved successfully",
            data: testResult,
        });
    } catch (error) {
        console.error("Error saving attempt:", error);
        res.status(500).json({
            success: false,
            message: "Failed to save attempt",
            error: error.message,
        });
    }
};

// @desc    Reset test for a letter
// @route   DELETE /api/test/reset/:letter
// @access  Private
export const resetTest = async (req, res) => {
    try {
        const { letter } = req.params;
        const userId = req.user.id;

        const testResult = await TestResult.findOne({
            user: userId,
            letter: letter.toUpperCase(),
        });

        if (!testResult) {
            return res.status(404).json({
                success: false,
                message: "No test found for this letter",
            });
        }

        testResult.attempts = [];
        testResult.averageAccuracy = 0;
        testResult.completed = false;
        testResult.completedAt = null;

        await testResult.save();

        res.status(200).json({
            success: true,
            message: "Test reset successfully",
            data: testResult,
        });
    } catch (error) {
        console.error("Error resetting test:", error);
        res.status(500).json({
            success: false,
            message: "Failed to reset test",
            error: error.message,
        });
    }
};

// @desc    Get all user's test results
// @route   GET /api/test/all
// @access  Private
export const getAllUserTests = async (req, res) => {
    try {
        const userId = req.user.id;

        const tests = await TestResult.find({ user: userId }).sort({
            letter: 1,
        });

        res.status(200).json({
            success: true,
            count: tests.length,
            data: tests,
        });
    } catch (error) {
        console.error("Error fetching all tests:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch tests",
            error: error.message,
        });
    }
};

// @desc    Get user's overall statistics
// @route   GET /api/test/statistics
// @access  Private
export const getUserStatistics = async (req, res) => {
    try {
        const userId = req.user.id;

        const tests = await TestResult.find({ user: userId });

        const statistics = {
            totalTests: tests.length,
            completedTests: tests.filter((t) => t.completed).length,
            inProgressTests: tests.filter(
                (t) => !t.completed && t.attempts.length > 0,
            ).length,
            totalAttempts: tests.reduce((sum, t) => sum + t.attempts.length, 0),
            averageOverallAccuracy: 0,
            bestLetter: null,
            worstLetter: null,
            letterProgress: {},
        };

        if (tests.length > 0) {
            const totalAccuracy = tests.reduce(
                (sum, t) => sum + t.averageAccuracy,
                0,
            );
            statistics.averageOverallAccuracy =
                Math.round((totalAccuracy / tests.length) * 100) / 100;

            const sortedByAccuracy = [...tests].sort(
                (a, b) => b.averageAccuracy - a.averageAccuracy,
            );
            if (
                sortedByAccuracy[0] &&
                sortedByAccuracy[0].attempts.length > 0
            ) {
                statistics.bestLetter = {
                    letter: sortedByAccuracy[0].letter,
                    accuracy: sortedByAccuracy[0].averageAccuracy,
                };
            }

            const withAttempts = sortedByAccuracy.filter(
                (t) => t.attempts.length > 0,
            );
            if (withAttempts.length > 0) {
                const worst = withAttempts[withAttempts.length - 1];
                statistics.worstLetter = {
                    letter: worst.letter,
                    accuracy: worst.averageAccuracy,
                };
            }

            tests.forEach((test) => {
                statistics.letterProgress[test.letter] = {
                    attempts: test.attempts.length,
                    averageAccuracy: test.averageAccuracy,
                    completed: test.completed,
                };
            });
        }

        res.status(200).json({
            success: true,
            data: statistics,
        });
    } catch (error) {
        console.error("Error fetching statistics:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch statistics",
            error: error.message,
        });
    }
};

// @desc    Record audio and get analysis (proxy to phoneme backend)
// @route   GET /api/test/record
// @access  Public
export const recordAndAnalyze = async (req, res) => {
    try {
        // Proxy request to phoneme backend
        const response = await axios.get(`${PHONEME_API_URL}/record`);

        res.status(200).json({
            success: true,
            data: response.data,
        });
    } catch (error) {
        console.error("Error recording:", error);
        res.status(500).json({
            success: false,
            message: "Failed to record and analyze",
            error: error.message,
        });
    }
};
