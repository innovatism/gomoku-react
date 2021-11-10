import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

class Square extends React.Component {
  render() {
    return (
      <button
        className="square"
        onClick={() => this.props.onClick()}
      >
        {this.props.value}
      </button>
    );
  }
}

class Board extends React.Component {
  constructor(props) {
    super(props);
    this.boardSize = Math.sqrt(props.squares.length);
  }

  renderSquare(i) {
    return (
      <Square
        value={this.props.squares[i]}
        key={i}
        onClick={() => this.props.onClick(i)}
      />
    );
  }


  renderRow(i) {
    let squares = Array(this.boardSize)

    for (let j = 0; j < this.boardSize; j++) {
      squares[j] = this.renderSquare(this.boardSize * i + j)
    }
    return (
      <div className="board-row" key={i}>
        {squares}
      </div>
    )
  }

  render() {
    let rows = []
    for(let i = 0; i<this.boardSize; i++) {
      let row = this.renderRow(i)
      rows.push(row)
    }

    return (
      <div>
        {/* <div className="status">{status}</div> */}
        {rows}
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.size = 20
    this.state = {
      history: [{
        squares: Array(this.size ** 2).fill(null)
      }],
      stepNumber: 0,
      xIsNext: true,
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice()
    if (calculateWinner(squares) || squares[i]) {
      return
    }

    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState({
      history: history.concat([{
        squares: squares,
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step%2) === 0,
    })
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);

    const moves = history.map((_, move) => {
      const desc = move ?
      `Go to move #${move}`:
      `Go to game start`;

      return (
        <li key={move}>
          <button onClick = {() => this.jumpTo(move)}>
            {desc}
          </button>
        </li>
      );
    });

    let status;
    if (winner) {
      status = 'Winner: ' + winner;
    } else {
      status = 'Next player: ' + (this.state.xIsNext?'X':'O');
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board 
           squares = {current.squares}
           onClick = {(i)=> this.handleClick(i)}
           />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);



function updateLongest(longestVal, longest, currentCount, cVal) {
  longestVal = longest < currentCount ? cVal : longestVal;
  longest = longest < currentCount ? currentCount : longest;
  return { longestVal, longest };
}

function countConsecutiveIdenticalValues(aArray) {
  let currentCount = 0;
  let longest = 0;
  let longestVal = null;
  for (let i = 0; i < aArray.length; i++) {
    let cVal = aArray[i];
    if (cVal != null) {
      if (cVal === aArray[i - 1]) {
        currentCount++;
        ({ longestVal, longest } = updateLongest(longestVal, longest, currentCount, cVal));
      } else {
        ({ longestVal, longest } = updateLongest(longestVal, longest, currentCount, cVal));
        currentCount = 1;
      }
    } else {
      ({ longestVal, longest } = updateLongest(longestVal, longest, currentCount, cVal));
      currentCount = 1;
    }
  }
  return {longest, longestVal};
}

function checkRow(squares) {
  let size = Math.sqrt(squares.length)
  for (let ridx = 0; ridx < size; ridx++) {
    let rowSquares = squares.slice(ridx * size, (ridx+1) * size )
    let {longest, longestVal} = countConsecutiveIdenticalValues(rowSquares)
    if(longest === 5) {
      return longestVal
    }
  }
}

function checkColumn(squares) {
  let size = Math.sqrt(squares.length)
  for (let cidx = 0; cidx < size; cidx++) {
    let colSquares = Array(size).fill(null)
    for (let ridx = 0; ridx < size; ridx ++) {
      colSquares[ridx] = squares[cidx + ridx * size]
    }
    let {longest, longestVal} = countConsecutiveIdenticalValues(colSquares)
    if(longest == 5) {
      return longestVal
    }
  }
}

function generateTLRBiagonals(size) {
  let diags = []
  for (let s = 0; s < 2 * size - 1; s++) {
    let diag = []
    for (let cidx = 0; cidx < size; cidx++) {
      for (let ridx = size -1; ridx >= 0; ridx--) {
        if (cidx + ridx === s) {
          diag.push([cidx, ridx])
        }
      }
    }
    diags.push(diag)
  }
  return diags
}


function generateBLTRDiagonals(size) {
  let diags = []
  for (let d = -(size - 1); d < size; d++) {
    let diag = []
    for (let cidx = 0; cidx < size; cidx++) {
      for (let ridx = 0; ridx <size; ridx++) {
        if (cidx - ridx === d) {
          diag.push([cidx, ridx])
        }
      }
    }
    diags.push(diag)
  }
  return diags
}

function checkDiagonal(squares) {
  let size = Math.sqrt(squares.length);
  let idxDiags = generateBLTRDiagonals(size);
  idxDiags.push(...generateTLRBiagonals(size))
  for(let i=0; i<idxDiags.length; i++) {
    let diag = idxDiags[i].map((idx) => {
      let [cidx, ridx] = idx;
      return squares[cidx + ridx * size]
    });
    let { longest, longestVal } = countConsecutiveIdenticalValues(diag)
    if (longest === 5) {
      return longestVal
    }
  }
}

function calculateWinner(squares) {
  console.time("checkWinner")
  let longestVal = checkRow(squares)
  console.log(longestVal)
  if (longestVal == null) {
    longestVal = checkColumn(squares)
    console.log(longestVal)
    if (longestVal == null) {
      longestVal = checkDiagonal(squares)
      console.log(longestVal)
    }
  }
  console.timeEnd("checkWinner")
  return longestVal;
}
