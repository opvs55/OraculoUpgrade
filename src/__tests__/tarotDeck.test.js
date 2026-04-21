// src/__tests__/tarotDeck.test.js
// Testes unitários para o baralho de tarot

import { describe, it, expect } from 'vitest';
import { 
  baralhoDetalhado, 
  buscarCartaPorId, 
  buscarCartaPorSlug, 
  buscarCartasPorNaipe,
  buscarArcanosMaiores,
  buscarArcanosMenores 
} from '../tarotDeck.js';

describe('TarotDeck', () => {
  describe('baralhoDetalhado', () => {
    it('deve ter exatamente 78 cartas', () => {
      expect(baralhoDetalhado).toHaveLength(78);
    });

    it('todas as cartas devem ter propriedades obrigatórias', () => {
      baralhoDetalhado.forEach(carta => {
        expect(carta).toHaveProperty('id');
        expect(carta).toHaveProperty('slug');
        expect(carta).toHaveProperty('nome');
        expect(carta).toHaveProperty('img');
        expect(carta).toHaveProperty('tipo');
        expect(carta).toHaveProperty('descricao');
        expect(carta).toHaveProperty('palavras_chave');
        expect(carta).toHaveProperty('significados');
        
        expect(typeof carta.id).toBe('number');
        expect(typeof carta.slug).toBe('string');
        expect(typeof carta.nome).toBe('string');
        expect(typeof carta.img).toBe('string');
        expect(typeof carta.tipo).toBe('string');
        expect(typeof carta.descricao).toBe('string');
        
        expect(carta.palavras_chave).toHaveProperty('direito');
        expect(carta.palavras_chave).toHaveProperty('invertido');
        expect(carta.significados).toHaveProperty('direito');
        expect(carta.significados).toHaveProperty('invertido');
      });
    });

    it('não deve ter IDs duplicados', () => {
      const ids = baralhoDetalhado.map(c => c.id);
      const idsUnicos = [...new Set(ids)];
      expect(idsUnicos).toHaveLength(ids.length);
    });

    it('não deve ter slugs duplicados', () => {
      const slugs = baralhoDetalhado.map(c => c.slug);
      const slugsUnicos = [...new Set(slugs)];
      expect(slugsUnicos).toHaveLength(slugs.length);
    });
  });

  describe('buscarCartaPorId', () => {
    it('deve encontrar O Louco pelo ID 0', () => {
      const carta = buscarCartaPorId(0);
      expect(carta).toBeDefined();
      expect(carta.nome).toBe('O Louco');
      expect(carta.slug).toBe('o-louco');
    });

    it('deve encontrar O Mundo pelo ID 21', () => {
      const carta = buscarCartaPorId(21);
      expect(carta).toBeDefined();
      expect(carta.nome).toBe('O Mundo');
      expect(carta.slug).toBe('o-mundo');
    });

    it('deve retornar undefined para ID inexistente', () => {
      const carta = buscarCartaPorId(999);
      expect(carta).toBeUndefined();
    });
  });

  describe('buscarCartaPorSlug', () => {
    it('deve encontrar O Mago pelo slug', () => {
      const carta = buscarCartaPorSlug('o-mago');
      expect(carta).toBeDefined();
      expect(carta.nome).toBe('O Mago');
      expect(carta.id).toBe(1);
    });

    it('deve encontrar Ás de Paus pelo slug', () => {
      const carta = buscarCartaPorSlug('as-paus');
      expect(carta).toBeDefined();
      expect(carta.nome).toBe('Ás de Paus');
      expect(carta.naipe).toBe('Paus');
    });

    it('deve retornar undefined para slug inexistente', () => {
      const carta = buscarCartaPorSlug('carta-inexistente');
      expect(carta).toBeUndefined();
    });
  });

  describe('buscarCartasPorNaipe', () => {
    it('deve encontrar 14 cartas de Paus', () => {
      const cartas = buscarCartasPorNaipe('Paus');
      expect(cartas).toHaveLength(14);
      cartas.forEach(carta => {
        expect(carta.naipe).toBe('Paus');
        expect(carta.tipo).toBe('Arcano Menor');
      });
    });

    it('deve encontrar 14 cartas de Copas', () => {
      const cartas = buscarCartasPorNaipe('Copas');
      expect(cartas).toHaveLength(14);
      cartas.forEach(carta => {
        expect(carta.naipe).toBe('Copas');
        expect(carta.tipo).toBe('Arcano Menor');
      });
    });

    it('deve encontrar 14 cartas de Espadas', () => {
      const cartas = buscarCartasPorNaipe('Espadas');
      expect(cartas).toHaveLength(14);
      cartas.forEach(carta => {
        expect(carta.naipe).toBe('Espadas');
        expect(carta.tipo).toBe('Arcano Menor');
      });
    });

    it('deve encontrar 14 cartas de Ouros', () => {
      const cartas = buscarCartasPorNaipe('Ouros');
      expect(cartas).toHaveLength(14);
      cartas.forEach(carta => {
        expect(carta.naipe).toBe('Ouros');
        expect(carta.tipo).toBe('Arcano Menor');
      });
    });

    it('deve retornar array vazio para naipe inexistente', () => {
      const cartas = buscarCartasPorNaipe('NaipeInexistente');
      expect(cartas).toHaveLength(0);
    });
  });

  describe('buscarArcanosMaiores', () => {
    it('deve encontrar exatamente 22 arcanos maiores', () => {
      const arcanos = buscarArcanosMaiores();
      expect(arcanos).toHaveLength(22);
      arcanos.forEach(carta => {
        expect(carta.tipo).toBe('Arcano Maior');
        expect(carta.naipe).toBeNull();
      });
    });

    it('deve conter todos os arcanos maiores conhecidos', () => {
      const arcanos = buscarArcanosMaiores();
      const nomes = arcanos.map(c => c.nome);
      
      expect(nomes).toContain('O Louco');
      expect(nomes).toContain('O Mago');
      expect(nomes).toContain('A Sacerdotisa');
      expect(nomes).toContain('A Imperatriz');
      expect(nomes).toContain('O Imperador');
      expect(nomes).toContain('O Hierofante');
      expect(nomes).toContain('Os Amantes');
      expect(nomes).toContain('O Carro');
      expect(nomes).toContain('A Força');
      expect(nomes).toContain('O Eremita');
      expect(nomes).toContain('A Roda da Fortuna');
      expect(nomes).toContain('A Justiça');
      expect(nomes).toContain('O Enforcado');
      expect(nomes).toContain('A Morte');
      expect(nomes).toContain('A Temperança');
      expect(nomes).toContain('O Diabo');
      expect(nomes).toContain('A Torre');
      expect(nomes).toContain('A Estrela');
      expect(nomes).toContain('A Lua');
      expect(nomes).toContain('O Sol');
      expect(nomes).toContain('O Julgamento');
      expect(nomes).toContain('O Mundo');
    });
  });

  describe('buscarArcanosMenores', () => {
    it('deve encontrar exatamente 56 arcanos menores', () => {
      const arcanos = buscarArcanosMenores();
      expect(arcanos).toHaveLength(56);
      arcanos.forEach(carta => {
        expect(carta.tipo).toBe('Arcano Menor');
        expect(['Paus', 'Copas', 'Espadas', 'Ouros']).toContain(carta.naipe);
      });
    });

    it('deve ter 14 cartas de cada naipe', () => {
      const arcanos = buscarArcanosMenores();
      const naipes = ['Paus', 'Copas', 'Espadas', 'Ouros'];
      
      naipes.forEach(naipe => {
        const cartasNaipe = arcanos.filter(c => c.naipe === naipe);
        expect(cartasNaipe).toHaveLength(14);
      });
    });
  });

  describe('Estrutura dos dados', () => {
    it('palavras_chave deve ser um objeto com direito e invertido', () => {
      baralhoDetalhado.forEach(carta => {
        expect(Array.isArray(carta.palavras_chave.direito)).toBe(true);
        expect(Array.isArray(carta.palavras_chave.invertido)).toBe(true);
        expect(carta.palavras_chave.direito.length).toBeGreaterThan(0);
        expect(carta.palavras_chave.invertido.length).toBeGreaterThan(0);
      });
    });

    it('significados deve ser um objeto com direito e invertido', () => {
      baralhoDetalhado.forEach(carta => {
        expect(typeof carta.significados.direito).toBe('string');
        expect(typeof carta.significados.invertido).toBe('string');
        expect(carta.significados.direito.length).toBeGreaterThan(0);
        expect(carta.significados.invertido.length).toBeGreaterThan(0);
      });
    });

    it('imagens devem ter o caminho correto', () => {
      baralhoDetalhado.forEach(carta => {
        expect(carta.img).toMatch(/^\/assets\/cartas\//);
      });
    });

    it('videos devem ter o caminho correto', () => {
      baralhoDetalhado.forEach(carta => {
        expect(carta.video).toMatch(/^\/assets\/videos\//);
        expect(carta.video).toMatch(/\.mp4$/);
      });
    });
  });
});
