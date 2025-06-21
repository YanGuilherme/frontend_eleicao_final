import axios from 'axios';

export const apiBase = axios.create({
  baseURL: 'https://backend-eleicao.onrender.com', // por enquanto, fazer o front trocar
});

export const apiProd = axios.create({
  baseURL: 'https://agregador-node.onrender.com',
});
