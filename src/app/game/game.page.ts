import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular'; 

interface Cell {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
}

@Component({
  selector: 'app-game',
  templateUrl: './game.page.html',
  styleUrls: ['./game.page.scss'],
  standalone: false
})
export class GamePage implements OnInit {
  difficulties: any = {
    easy: { rows: 10, cols: 10, mines: 10, label: 'Mudah' },
    medium: { rows: 12, cols: 12, mines: 20, label: 'Menengah' }, // Bom dikurangi dari 30 ke 20
    hard: { rows: 14, cols: 14, mines: 35, label: 'Sulit' },    // Bom dikurangi dari 50 ke 35
    extreme: { rows: 16, cols: 16, mines: 50, label: 'Ekstrem' } // Grid disesuaikan, bom 50 agar tetap menantang tapi adil
  };
  
  currentLevel: string = 'easy';
  board: Cell[][] = [];
  timer: number = 0;
  gameOver: boolean = false;
  gameWon: boolean = false;
  timerInterval: any;
  isFirstClick: boolean = true;
  isFlagMode: boolean = false;

  constructor(private alertCtrl: AlertController) {}
  
  ngOnInit() {
    this.resetGame();
  }

  changeDifficulty(level: string) {
    this.currentLevel = level;
    this.resetGame();
  }

  resetGame() {
    this.stopTimer();
    this.timer = 0;
    this.gameOver = false;
    this.gameWon = false;
    this.isFirstClick = true;
    this.createBoard();
  }

  createBoard() {
    const config = this.difficulties[this.currentLevel];
    this.board = Array.from({ length: config.rows }, () => 
      Array.from({ length: config.cols }, () => ({
        isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0
      }))
    );

    let planted = 0;
    while (planted < config.mines) {
      const r = Math.floor(Math.random() * config.rows);
      const c = Math.floor(Math.random() * config.cols);
      if (!this.board[r][c].isMine) {
        this.board[r][c].isMine = true;
        planted++;
      }
    }
    this.calculateNeighbors();
  }

  calculateNeighbors() {
    this.board.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (!cell.isMine) {
          let count = 0;
          for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
              if (this.board[r + i]?.[c + j]?.isMine) count++;
            }
          }
          cell.neighborMines = count;
        }
      });
    });
  }

  handleCellClick(cell: Cell, r: number, c: number) {
    if (this.gameOver || this.gameWon || cell.isRevealed || (this.isFlagMode && !cell.isRevealed)) {
      if (this.isFlagMode) {
        cell.isFlagged = !cell.isFlagged;
      }
      return;
    }

    if (this.timer === 0) {
      this.startTimer();
    }

    if (this.isFirstClick) {
      this.isFirstClick = false;
      this.ensureSafeStart(r, c);
      cell = this.board[r][c]; 
    }

    cell.isRevealed = true;
    if (cell.isMine) {
      this.endGame(false);
    } else if (cell.neighborMines === 0) {
      this.revealEmpty(r, c);
    }
    this.checkWin();
  }

  ensureSafeStart(r: number, c: number) {
    const config = this.difficulties[this.currentLevel];
    const safeZone: {r: number, c: number}[] = [];

    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (this.board[r + i]?.[c + j]) {
          safeZone.push({ r: r + i, c: c + j });
        }
      }
    }

    safeZone.forEach(zone => {
      if (this.board[zone.r][zone.c].isMine) {
        this.board[zone.r][zone.c].isMine = false;
        
        let moved = false;
        while (!moved) {
          const newR = Math.floor(Math.random() * config.rows);
          const newC = Math.floor(Math.random() * config.cols);
          
          const inSafeZone = safeZone.some(sz => sz.r === newR && sz.c === newC);
          if (!this.board[newR][newC].isMine && !inSafeZone) {
            this.board[newR][newC].isMine = true;
            moved = true;
          }
        }
      }
    });

    this.calculateNeighbors();
  }

  revealEmpty(r: number, c: number) {
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        const target = this.board[r + i]?.[c + j];
        if (target && !target.isRevealed && !target.isMine) {
          target.isRevealed = true;
          if (target.neighborMines === 0) this.revealEmpty(r + i, c + j);
        }
      }
    }
  }

  startTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    this.timerInterval = setInterval(() => {
      this.timer++;
    }, 1000);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  formatTime(s: number) {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  getFlagsCount() {
    let count = 0;
    this.board.forEach(row => row.forEach(c => { if (c.isFlagged) count++; }));
    return count;
  }

  checkWin() {
    const won = this.board.every(row => row.every(c => c.isMine || c.isRevealed));
    if (won) this.endGame(true);
  }

  endGame(win: boolean) {
    this.stopTimer();
    this.gameOver = !win;
    this.gameWon = win;
    if (!win) {
      this.board.forEach(row => row.forEach(c => { if (c.isMine) c.isRevealed = true; }));
    }
  }
}