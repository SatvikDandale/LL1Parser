import React from 'react'
import FirstFollow from './firstfollow';

import './bootstrap.min.css';
import './styles.css';

/*
    {
        1: "A -> B"
    }
*/

class LL1 extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            show: false,
            transitions: {},
            ll1: false,
            startSymbol: null
        }
    }

    getLHS = (production) => {
        return production.split('->')[0].replace(/\s+/g, '');
    }

    getRHS = (production) => {
        return production.split('->')[1].replace(/\s+/g, '');
    }

    EPSILON = "ε";

    render() {
        var lhsRef = React.createRef();
        var rhsRef = React.createRef();
        var startSymbolRef = React.createRef();
        return (
            <div>
                <div className="title">
                    <div className="header">
                        <h1>LL1 Parsing Table</h1>
                    </div>
                </div>
                <br />
                <div className="input-section">
                    <div className="header">
                        <table className="table table-hover">
                            <thead>
                                {this.state.startSymbol
                                    ? <tr>
                                        <th scope="row">Start Symbol</th>
                                        <td colSpan={2}>{this.state.startSymbol}</td>
                                    </tr>
                                    : <tr>
                                        <th scope="row">Enter Start Symbol</th>
                                        <td>
                                            <input
                                                placeholder="Start Symbol Goes Here"
                                                name="start-symbol"
                                                ref={startSymbolRef}
                                            >
                                            </input>
                                        </td>
                                        <td>
                                            <button
                                                id="start-symbol-add"
                                                type="button"
                                                className="btn btn-warning"
                                                onClick={() => {
                                                    if (startSymbolRef.current.value.length) {
                                                        this.setState({
                                                            startSymbol: startSymbolRef.current.value
                                                        })
                                                    } else {
                                                        alert("Empty Input")
                                                    }
                                                }}
                                            >
                                                Add
                                            </button>
                                        </td>
                                    </tr>}
                                <tr>
                                    <th scope="col">#</th>
                                    <th scope="col">LHS</th>
                                    <th scope="col">RHS</th>
                                </tr>
                            </thead>
                            <tbody>

                                {Object.keys(this.state.transitions).length
                                    ? Object.keys(this.state.transitions)
                                        .map((key) => {
                                            return (
                                                <tr key={key}>
                                                    <th scope="row">{key}</th>
                                                    <td>{this.getLHS(this.state.transitions[key])}</td>
                                                    <td>{this.getRHS(this.state.transitions[key])}</td>
                                                </tr>
                                            )
                                        })
                                    :
                                    <tr>
                                        <th scope="row" colSpan={3}>No transitions added</th>
                                    </tr>}
                                {this.state.show
                                    ? <tr>
                                        <th scope="row">
                                            {Object.keys(this.state.transitions).length + 1}
                                        </th>
                                        <td><input
                                            name="LHS"
                                            placeholder="LHS"
                                            ref={lhsRef}></input></td>
                                        <td><input
                                            name="RHS"
                                            placeholder="RHS"
                                            defaultValue={this.EPSILON}
                                            ref={rhsRef}
                                            onKeyDown={(e) => {
                                                if (e.keyCode === 13) {
                                                    if (lhsRef.current.value.length && rhsRef.current.value.length) {
                                                        var tempList = this.state.transitions;
                                                        tempList[Object.keys(this.state.transitions).length + 1] = lhsRef.current.value + ' -> ' + rhsRef.current.value
                                                        this.setState({
                                                            transitions: tempList,
                                                            show: false
                                                        })
                                                    } else {
                                                        this.setState({
                                                            show: false
                                                        })
                                                    }

                                                }
                                            }}
                                        ></input></td>
                                    </tr>
                                    : null}
                            </tbody>
                        </table>

                        {/* <textarea 
                            placeholder="Enter the grammar" 
                            ref={this.grammarRef}
                            className="text-input" 
                            rows={8} cols={40}>
                        </textarea> */}
                    </div>
                    {this.state.show
                        ?
                        <div className="submit">
                            <button
                                type="button"
                                className="btn btn-success"
                                onClick={() => {
                                    if (lhsRef.current.value.length && rhsRef.current.value.length) {
                                        var tempList = this.state.transitions;
                                        tempList[Object.keys(this.state.transitions).length + 1] = lhsRef.current.value + ' -> ' + rhsRef.current.value
                                        this.setState({
                                            transitions: tempList,
                                            show: false
                                        })
                                    } else {
                                        this.setState({
                                            show: false
                                        })
                                    }
                                }}
                            >
                                Add this transition
                            </button>
                        </div>
                        : <div className="submit">
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={() => {
                                    this.setState({
                                        show: true
                                    })
                                }}
                            >Add</button>
                            <button
                                className="btn btn-success"
                                type="button"
                                onClick={() => {
                                    if (Object.keys(this.state.transitions).length && this.state.startSymbol) {
                                        console.log(this.state.transitions)
                                        console.log("START SYMBOL: " + this.state.startSymbol)
                                        this.setState({
                                            ll1: true
                                        })
                                    }
                                    else
                                        alert("Enter Grammar!")
                                }}
                            >Submit</button>
                        </div>}
                </div>
                <hr />
                {this.state.ll1
                    ? <div className="first-follow">
                        <FirstFollow grammar={this.state.transitions} startSymbol={this.state.startSymbol}></FirstFollow>
                    </div>
                    : null}
            </div>
        );
    }
}

export default LL1;