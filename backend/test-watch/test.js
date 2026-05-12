// Test JavaScript file for parser
const fs = require('fs');
const path = require('path');

// Export some functions
function login(username, password) {
  return { username, password };
}

function logout() {
  return { success: true };
}

function verifyToken(token) {
  return !!token;
}

// Export as named exports
module.exports = {
  login,
  logout,
  verifyToken
};

// Also export a constant
export const API_URL = 'https://api.example.com';

// Import statements
const express = require('express');
const database = require('./db/database');
import { hash } from './utils/hash.js';
