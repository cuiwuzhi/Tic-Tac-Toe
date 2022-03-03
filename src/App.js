import React from 'react';

// 计算赢家
function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], winnerIndexArray: [a, b, c] };
    }
  }
  return null;
}

// 渲染游戏格子
function Square(props) {
  const { onClick, winnerIndexArray, index } = props;
  return (
    <button onClick={onClick} className={`square ${winnerIndexArray.includes(index) ? 'win' : ''}`}>
      {props.value}
    </button>
  )
}

// 生成游戏面板
class Board extends React.Component {

  renderSquare(i, coordinate) {
    const { winnerIndexArray, squares, onClick } = this.props;

    return <Square index={i} key={i} value={squares[i]} onClick={() => onClick(i, coordinate)} winnerIndexArray={winnerIndexArray} />;
  }

  render() {

    let n = 0; // 记录单元格索引序号
    let board = []; // 最终面板
    const { rowNum } = this.props;
    for (let i = 0; i < rowNum; i++) {
      const boardRow = [];
      for (let j = 0; j < rowNum; j++, n++) {
        boardRow.push(this.renderSquare(n, [i + 1, j + 1]));
      }
      board.push(<div className="board-row" key={i}>{boardRow}</div>);
    }

    return (
      <div>
        {board}
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      nextPlay: 'X', // 下一个棋子
      tie: false, // 是否平局
      stepNumber: 0,
      rowNum: 3, // 每一行个数
      asc: true, // 升降序
      history: [{ squares: Array(9).fill(null) }]
    }
  }

  // 处理下子
  handleClick(i, coordinate) {
    const { nextPlay, history, stepNumber } = this.state;
    const historyNew = history.slice(0, stepNumber + 1);
    const current = historyNew[historyNew.length - 1];
    const { winner } = calculateWinner(current.squares) || {};
    if (winner || current.squares[i]) {
      return;
    }
    const nextPlayState = nextPlay === 'X' ? 'O' : 'X';
    const squaresNew = [...current.squares];
    squaresNew[i] = nextPlay;
    this.setState({
      nextPlay: nextPlayState,
      stepNumber: historyNew.length,
      history: historyNew.concat([{ squares: squaresNew, coordinate }])
    });

    if (!squaresNew.some(i => !i) && !winner) {
      this.setState({ tie: true });
    }
  }

  // 回退到之前的步骤
  jumpTo(step) {
    this.setState({
      stepNumber: step,
      nextPlay: (step % 2) === 0 ? 'X' : 'O'
    });
  }

  // 排序
  sortHistory() {
    const { asc } = this.state;
    this.setState({ asc: !asc });
  }

  render() {
    const { nextPlay, history, stepNumber, rowNum, asc, tie } = this.state;
    const current = history[stepNumber];

    let status;
    const { winner, winnerIndexArray = [] } = calculateWinner(current.squares) || {};
    if (winner) {
      status = `Winner: ${winner}`;
    } else {
      status = tie ? 'The game ended in a standoff' : `Next player: ${nextPlay}`;
    }

    const moves = history.map((item, index) => {
      const desc = index ?
        'Go to move #' + index + `-${JSON.stringify(item.coordinate)}` :
        'Go to game start';
      return (
        <li key={index}>
          <button disabled={!!winner || tie} onClick={() => this.jumpTo(index)} className={index === history.length - 1 ? 'bold' : ''}>{desc}</button>
        </li>
      );
    });

    let orderableMoves;
    if (asc) {
      orderableMoves = moves;
    } else {
      orderableMoves = moves.reverse();
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board squares={current.squares} winnerIndexArray={winnerIndexArray} rowNum={rowNum}
            onClick={(i, coordinate) => this.handleClick(i, coordinate)} />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <div style={{ marginTop: 10 }}>
            <button disabled={!!winner || tie} onClick={() => this.sortHistory()}>排序↑↓</button>
          </div>
          <ol>{orderableMoves}</ol>
        </div>
      </div>
    );
  }
}

export default Game
