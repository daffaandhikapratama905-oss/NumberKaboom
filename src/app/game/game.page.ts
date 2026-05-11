import { Component, OnInit } from '@angular/core';
import { AlertController, NavController } from '@ionic/angular';

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
    easy: { rows: 6, cols: 6, mines: 8, label: 'Mudah' },
    medium: { rows: 8, cols: 7, mines: 12, label: 'Menengah' },
    hard: { rows: 10, cols: 8, mines: 20, label: 'Sulit' },
    extreme: { rows: 12, cols: 9, mines: 30, label: 'Ekstrem' }
  };
  
  currentLevel: string = 'easy';
  board: Cell[][] = [];
  timer: number = 0;
  gameOver: boolean = false;
  gameWon: boolean = false;
  timerInterval: any;
  isFirstClick: boolean = true;
  isFlagMode: boolean = false;

  constructor(
    private alertCtrl: AlertController,
    private navCtrl: NavController
  ) {}
  
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
    this.initBoard();
  }

  initBoard() {
    const { rows, cols } = this.difficulties[this.currentLevel];
    this.board = Array.from({ length: rows }, () => 
      Array.from({ length: cols }, () => ({
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        neighborMines: 0
      }))
    );
  }

  handleCellClick(cell: Cell, r: number, c: number) {
    if (this.gameOver || this.gameWon || cell.isRevealed) return;

    if (this.isFlagMode) {
      cell.isFlagged = !cell.isFlagged;
      return;
    }

    if (cell.isFlagged) return;

    if (this.isFirstClick) {
      this.placeMines(r, c);
      this.startTimer();
      this.isFirstClick = false;
    }

    if (cell.isMine) {
      this.endGame(false);
    } else {
      this.revealCell(r, c);
      if (this.checkWin()) this.endGame(true);
    }
  }

  revealCell(r: number, c: number) {
    const cell = this.board[r]?.[c];
    if (!cell || cell.isRevealed || cell.isFlagged) return;

    cell.isRevealed = true;
    if (cell.neighborMines === 0 && !cell.isMine) {
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          this.revealCell(r + i, c + j);
        }
      }
    }
  }

  placeMines(safeR: number, safeC: number) {
    const { rows, cols, mines } = this.difficulties[this.currentLevel];
    let placed = 0;
    while (placed < mines) {
      const r = Math.floor(Math.random() * rows);
      const c = Math.floor(Math.random() * cols);
      if (!this.board[r][c].isMine && (Math.abs(r - safeR) > 1 || Math.abs(c - safeC) > 1)) {
        this.board[r][c].isMine = true;
        placed++;
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

  async endGame(win: boolean) {
    this.stopTimer();
    this.gameOver = !win;
    this.gameWon = win;

    if (!win) {
      this.board.forEach(row => row.forEach(c => { if (c.isMine) c.isRevealed = true; }));
    }

    const alert = await this.alertCtrl.create({
      header: win ? 'Yatta, Selamat kamu berhasil!' : 'Yahh, Game Over coba lagi deh',
      subHeader: win ? 'Kamu berhasil membersihkan semua bom' : 'Waduh, kamu menginjak bom',
      message: `Waktu kamu: ${this.formatTime(this.timer)}`,
      backdropDismiss: false,
      cssClass: win ? 'game-alert-win' : 'game-alert-lose',
      buttons: [
        {
          text: 'Menu Utama',
          handler: () => { this.navCtrl.navigateBack('/home'); }
        },
        {
          text: 'Main Lagi',
          handler: () => { this.resetGame(); }
        }
      ]
    });
    await alert.present();
  }

  checkWin() {
    return this.board.every(row => 
      row.every(cell => cell.isMine || cell.isRevealed)
    );
  }

  startTimer() {
    this.stopTimer();
    this.timerInterval = setInterval(() => this.timer++, 1000);
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
}