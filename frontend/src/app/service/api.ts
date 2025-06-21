import axios from 'axios';

export const apiCore = axios.create({
  baseURL: 'http://localhost:8080',
});

export const apiBase = axios.create({
  baseURL: 'http://192.168.3.4:8081', // por enquanto, fazer o front trocar
});

export const apiProd = axios.create({
  baseURL: 'https://agregador-node.onrender.com',
});
