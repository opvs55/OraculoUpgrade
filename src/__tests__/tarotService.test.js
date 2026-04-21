// src/__tests__/tarotService.test.js
// Testes unitários para o serviço de tarot

import { describe, it, expect, beforeEach } from 'vitest';
import { 
  sortearUmaCarta, 
  sortearTresCartas, 
  sortearCruzCelta, 
  sortearTemploDeAfrodite, 
  sortearEscolhaDeCaminho 
} from '../services/tarotService.js';

describe('TarotService', () => {
  describe('sortearUmaCarta', () => {
    it('deve retornar exatamente uma carta', () => {
      const resultado = sortearUmaCarta();
      expect(resultado).toHaveLength(1);
    });

    it('cada carta deve ter as propriedades obrigatórias', () => {
      const resultado = sortearUmaCarta();
      const carta = resultado[0];
      
      expect(carta).toHaveProperty('id');
      expect(carta).toHaveProperty('nome');
      expect(carta).toHaveProperty('img');
      expect(carta).toHaveProperty('posicao', 'A Carta');
      expect(carta).toHaveProperty('invertida');
      expect(typeof carta.invertida).toBe('boolean');
    });
  });

  describe('sortearTresCartas', () => {
    it('deve retornar exatamente três cartas', () => {
      const resultado = sortearTresCartas();
      expect(resultado).toHaveLength(3);
    });

    it('deve ter as posições corretas', () => {
      const resultado = sortearTresCartas();
      const posicoes = resultado.map(c => c.posicao);
      
      expect(posicoes).toContain('Passado');
      expect(posicoes).toContain('Presente');
      expect(posicoes).toContain('Futuro');
    });

    it('não deve ter cartas duplicadas', () => {
      const resultado = sortearTresCartas();
      const ids = resultado.map(c => c.id);
      const idsUnicos = [...new Set(ids)];
      
      expect(idsUnicos).toHaveLength(ids.length);
    });
  });

  describe('sortearCruzCelta', () => {
    it('deve retornar exatamente dez cartas', () => {
      const resultado = sortearCruzCelta();
      expect(resultado).toHaveLength(10);
    });

    it('deve ter todas as posições da Cruz Celta', () => {
      const resultado = sortearCruzCelta();
      const posicoes = resultado.map(c => c.posicao);
      
      expect(posicoes).toContain('Situação Atual');
      expect(posicoes).toContain('Obstáculo');
      expect(posicoes).toContain('Base da Questão');
      expect(posicoes).toContain('Passado Recente');
      expect(posicoes).toContain('Coroamento (Possível Futuro)');
      expect(posicoes).toContain('Futuro Próximo');
      expect(posicoes).toContain('O Consulente');
      expect(posicoes).toContain('O Ambiente');
      expect(posicoes).toContain('Esperanças e Medos');
      expect(posicoes).toContain('Resultado Final');
    });

    it('não deve ter cartas duplicadas', () => {
      const resultado = sortearCruzCelta();
      const ids = resultado.map(c => c.id);
      const idsUnicos = [...new Set(ids)];
      
      expect(idsUnicos).toHaveLength(ids.length);
    });
  });

  describe('sortearTemploDeAfrodite', () => {
    it('deve retornar exatamente sete cartas', () => {
      const resultado = sortearTemploDeAfrodite();
      expect(resultado).toHaveLength(7);
    });

    it('deve ter todas as posições do Templo de Afrodite', () => {
      const resultado = sortearTemploDeAfrodite();
      const posicoes = resultado.map(c => c.posicao);
      
      expect(posicoes).toContain('Pilar 1: O Eu Interior');
      expect(posicoes).toContain('Pilar 2: O Outro');
      expect(posicoes).toContain('Viga 1: A Relação no Passado');
      expect(posicoes).toContain('Viga 2: A Relação no Presente');
      expect(posicoes).toContain('O Altar: O Desafio Central');
      expect(posicoes).toContain('A Oferenda: O que deve ser Cultivado');
      expect(posicoes).toContain('A Bênção de Afrodite: O Conselho Final');
    });
  });

  describe('sortearEscolhaDeCaminho', () => {
    it('deve retornar exatamente oito cartas', () => {
      const resultado = sortearEscolhaDeCaminho();
      expect(resultado).toHaveLength(8);
    });

    it('deve ter todas as posições da Escolha de Caminho', () => {
      const resultado = sortearEscolhaDeCaminho();
      const posicoes = resultado.map(c => c.posicao);
      
      expect(posicoes).toContain('O Consulente');
      expect(posicoes).toContain('A Situação da Escolha');
      expect(posicoes).toContain('O Caminho da Luz: Opção 1');
      expect(posicoes).toContain('O Caminho da Luz: Desfecho 1');
      expect(posicoes).toContain('O Caminho das Sombras: Opção 2');
      expect(posicoes).toContain('O Caminho das Sombras: Desfecho 2');
      expect(posicoes).toContain('O Conselho do Oráculo');
      expect(posicoes).toContain('O Resultado Mais Provável');
    });
  });

  describe('Integridade dos dados', () => {
    it('todas as cartas devem ter IDs válidos', () => {
      const funcoes = [
        sortearUmaCarta,
        sortearTresCartas,
        sortearCruzCelta,
        sortearTemploDeAfrodite,
        sortearEscolhaDeCaminho
      ];

      funcoes.forEach(funcao => {
        const resultado = funcao();
        resultado.forEach(carta => {
          expect(typeof carta.id).toBe('number');
          expect(carta.id).toBeGreaterThanOrEqual(0);
          expect(carta.id).toBeLessThan(78); // Total de cartas no tarot
        });
      });
    });

    it('todas as cartas devem ter propriedades obrigatórias', () => {
      const resultado = sortearTresCartas();
      resultado.forEach(carta => {
        expect(carta).toHaveProperty('id');
        expect(carta).toHaveProperty('nome');
        expect(carta).toHaveProperty('img');
        expect(carta).toHaveProperty('posicao');
        expect(carta).toHaveProperty('invertida');
        expect(carta).toHaveProperty('tipo');
        expect(carta).toHaveProperty('descricao');
        expect(carta).toHaveProperty('palavras_chave');
        expect(carta).toHaveProperty('significados');
      });
    });
  });
});
